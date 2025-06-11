'use server';
/**
 * @fileOverview Extracts data from Google My Business (GMB) profiles.
 *
 * - extractGmbData - A function that extracts GMB profile data.
 * - GmbDataExtractionInput - The input type for the extractGmbData function.
 * - GmbDataExtractionOutput - The return type for the extractGmbData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { fetchMockGmbPageContent } from '@/services/gmbService'; // We'll create this service

const GmbDataExtractionInputSchema = z.object({
  businessName: z.string().describe('The name of the business to search on GMB.'),
  location: z.string().describe('The location of the business (e.g., city, address).'),
  // gmbUrl: z.string().url().optional().describe('Optional direct URL to the GMB profile.'),
});
export type GmbDataExtractionInput = z.infer<typeof GmbDataExtractionInputSchema>;

const GmbDataExtractionOutputSchema = z.object({
  extractedName: z.string().describe('The official name of the business found on GMB.'),
  address: z.string().optional().describe('Full address of the business.'),
  phone: z.string().optional().describe('Primary phone number.'),
  website: z.string().url().optional().describe('Official website URL.'),
  rating: z.number().min(0).max(5).optional().describe('Average customer rating (e.g., 4.5).'),
  reviewCount: z.number().int().optional().describe('Total number of reviews.'),
  category: z.string().optional().describe('Primary business category (e.g., Restaurant, Hair Salon).'),
  openingHours: z.array(z.string()).optional().describe('List of opening hours for each day.'),
  briefReviewSummary: z.string().optional().describe('A very brief AI-generated summary of a few key review points or common themes. Max 150 characters.'),
  gmbPageUrl: z.string().url().optional().describe('The URL of the GMB page from which data was extracted.'),
});
export type GmbDataExtractionOutput = z.infer<typeof GmbDataExtractionOutputSchema>;

// Tool to simulate fetching GMB page content
const getGmbPageContentTool = ai.defineTool(
  {
    name: 'getGmbPageContentTool',
    description: 'Simulates fetching the HTML content or structured data of a Google My Business page. FOR PROTOTYPING ONLY.',
    inputSchema: GmbDataExtractionInputSchema,
    outputSchema: z.object({
      // For now, we'll simulate getting HTML. In a real scenario, this might be structured data from an API.
      htmlContent: z.string().describe('Simulated HTML content of the GMB page.'),
      simulatedGmbUrl: z.string().url().describe('A simulated GMB URL for the business.')
    }),
  },
  async (input) => {
    // In a real application, this would involve complex logic:
    // 1. Searching Google for the GMB page URL if not provided.
    // 2. Making an HTTP request to that URL (respecting robots.txt, terms of service).
    // 3. Handling potential errors, captchas, dynamic content loading.
    // OR, ideally, using the Google Business Profile API.
    // For this prototype, we call a mock service.
    console.log(`Tool: Simulating fetch for ${input.businessName} in ${input.location}`);
    const mockHtml = await fetchMockGmbPageContent(input.businessName, input.location);
    // Construct a plausible-looking mock URL
    const mockUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(input.businessName)}+${encodeURIComponent(input.location)}`;
    return { htmlContent: mockHtml, simulatedGmbUrl: mockUrl };
  }
);


const gmbExtractionPrompt = ai.definePrompt({
  name: 'gmbExtractionPrompt',
  input: { schema: z.object({ simulatedHtmlContent: z.string(), originalQuery: GmbDataExtractionInputSchema }) },
  output: { schema: GmbDataExtractionOutputSchema },
  tools: [getGmbPageContentTool], // Although the flow calls it, making the LLM aware of it might be useful for future chaining.
  prompt: `You are a highly accurate data extraction assistant. Your task is to parse the provided HTML content, which represents a Google My Business (GMB) page, and extract specific information about the business.

Business Searched: {{{originalQuery.businessName}}} in {{{originalQuery.location}}}
Simulated HTML Content of GMB Page:
\`\`\`html
{{{simulatedHtmlContent}}}
\`\`\`

Extract the following details and structure them according to the GMBDataExtractionOutput schema:
- Official business name (extractedName)
- Full address
- Primary phone number
- Official website URL
- Average customer rating (numeric, e.g., 4.5)
- Total number of reviews (integer)
- Primary business category
- Opening hours (list strings like "Monday: 9:00 AM - 5:00 PM")
- A very brief AI-generated summary of a few key review points or common themes. Max 150 characters.
- The GMB page URL from which data was extracted (use the simulated URL if provided).

If a piece of information is not clearly available in the provided HTML, omit that field from the output. Do not invent data.
Prioritize accuracy. For the 'briefReviewSummary', be concise and focus on recurring themes in the reviews.
The 'extractedName' should be what the business is called on their GMB profile, which might sometimes slightly differ from the search query.
`,
});

const extractGmbDataFlow = ai.defineFlow(
  {
    name: 'extractGmbDataFlow',
    inputSchema: GmbDataExtractionInputSchema,
    outputSchema: GmbDataExtractionOutputSchema,
  },
  async (input) => {
    // Step 1: "Fetch" the GMB page content using the tool (which calls our mock service)
    // In a more complex scenario, the LLM could decide to call this tool if it deems it necessary.
    // Here, we are orchestrating it directly.
    const toolOutput = await getGmbPageContentTool(input);

    // Step 2: Pass the (mocked) HTML content to the LLM for extraction
    const {output} = await gmbExtractionPrompt({
        simulatedHtmlContent: toolOutput.htmlContent,
        originalQuery: input
    });

    if (!output) {
      throw new Error('GMB data extraction failed to produce an output.');
    }
    // Ensure the GMB page URL from the tool output (simulated) is included
    return {
        ...output,
        gmbPageUrl: output.gmbPageUrl || toolOutput.simulatedGmbUrl,
        extractedName: output.extractedName || input.businessName, // Fallback if LLM doesn't extract it
    };
  }
);

export async function extractGmbData(input: GmbDataExtractionInput): Promise<GmbDataExtractionOutput> {
  console.log("Local Digital Eye - GMB Extraction: IMPORTANT NOTE");
  console.log("This feature currently uses a MOCK service to simulate GMB data.");
  console.log("Directly scraping Google My Business is against their Terms of Service.");
  console.log("For a production application, use the official Google Business Profile API.");
  console.log("--------------------------------------------------------------------");
  return extractGmbDataFlow(input);
}
