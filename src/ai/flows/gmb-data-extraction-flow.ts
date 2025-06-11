'use server';
/**
 * @fileOverview Extracts and synthesizes data for a business using Google Places API.
 *
 * - extractGmbData - A function that fetches data from Google Places API and synthesizes it.
 * - GmbDataExtractionInput - The input type for the extractGmbData function.
 * - GmbDataExtractionOutput - The return type for the extractGmbData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchGooglePlace, PlaceSchema as GooglePlaceDataSchema } from '@/services/googleMapsService';

const GmbDataExtractionInputSchema = z.object({
  businessName: z.string().describe('The name of the business to search on Google Maps.'),
  location: z.string().describe('The location of the business (e.g., city, address).'),
});
export type GmbDataExtractionInput = z.infer<typeof GmbDataExtractionInputSchema>;

const GmbDataExtractionOutputSchema = z.object({
  extractedName: z.string().describe('The official name of the business found.'),
  address: z.string().optional().describe('Full address of the business.'),
  phone: z.string().optional().describe('Primary phone number.'),
  website: z.string().url().optional().describe('Official website URL.'),
  rating: z.number().min(0).max(5).optional().describe('Average customer rating (e.g., 4.5).'),
  reviewCount: z.number().int().optional().describe('Total number of reviews.'),
  category: z.string().optional().describe('Primary business category (e.g., Restaurant, Hair Salon).'),
  openingHours: z.array(z.string()).optional().describe('List of opening hours for each day (e.g., "Monday: 9:00 AM - 5:00 PM").'),
  briefReviewSummary: z.string().optional().describe('A very brief AI-generated summary of the business perception based on available data like rating and category. Max 150 characters.'),
  gmbPageUrl: z.string().url().optional().describe('The URL of the Google Maps page for the business.'),
  businessStatus: z.string().optional().describe('Operational status of the business (e.g., OPERATIONAL).'),
  placeId: z.string().optional().describe('Google Place ID of the business.'),
});
export type GmbDataExtractionOutput = z.infer<typeof GmbDataExtractionOutputSchema>;

// Tool to fetch business details from Google Places API
const fetchBusinessDetailsFromGoogleTool = ai.defineTool(
  {
    name: 'fetchBusinessDetailsFromGoogleTool',
    description: 'Fetches business information from Google Places API based on business name and location.',
    inputSchema: GmbDataExtractionInputSchema,
    outputSchema: GooglePlaceDataSchema.nullable().describe("Structured data from Google Places API, or null if not found/error."),
  },
  async (input) => {
    console.log(`Tool: Fetching Google Place data for ${input.businessName} in ${input.location}`);
    const placeData = await searchGooglePlace(input.businessName, input.location);
    if (!placeData) {
        console.log("Tool: No data returned from searchGooglePlace service.");
        return null;
    }
    return placeData;
  }
);

const synthesizeGmbDataFromPlaceApiPrompt = ai.definePrompt({
  name: 'synthesizeGmbDataFromPlaceApiPrompt',
  input: { schema: z.object({ placeData: GooglePlaceDataSchema.nullable(), originalQuery: GmbDataExtractionInputSchema }) },
  output: { schema: GmbDataExtractionOutputSchema },
  prompt: `You are an expert data synthesizer. Your task is to process structured data from the Google Places API and map it to the GmbDataExtractionOutput schema.

Business Searched: {{{originalQuery.businessName}}} in {{{originalQuery.location}}}
Google Places API Data:
\`\`\`json
{{{jsonEncode placeData}}}
\`\`\`

Synthesize the following details:
- Official business name (extractedName)
- Full address (address)
- Primary phone number (phone, use international_phone_number if available)
- Official website URL (website)
- Average customer rating (rating)
- Total number of reviews (reviewCount, from user_ratings_total)
- Primary business category (category, use the first relevant item from 'types' if available, e.g., 'restaurant', 'store', 'beauty_salon'. Avoid generic types like 'point_of_interest' or 'establishment' if more specific ones are present.)
- Opening hours (openingHours, use 'weekday_text' from opening_hours object if available, format as an array of strings like "Monday: 9:00 AM - 5:00 PM")
- A very brief AI-generated summary of the business perception (briefReviewSummary). If review text is not available in the input, generate a plausible summary based on the rating, review count, and business category. For example, a high rating for a restaurant might suggest 'Well-regarded for its food and service'. Max 150 characters.
- Google Maps Page URL (gmbPageUrl): Construct this using the place_id. Format: 'https://www.google.com/maps/search/?api=1&query={{placeData.place_id}}'. If place_id is not available, omit this field.
- Business Status (businessStatus)
- Google Place ID (placeId)

If a piece of information is not available in the provided API data, omit that field from the output unless specified otherwise (like briefReviewSummary). Do not invent data.
Prioritize accuracy. The 'extractedName' should be the name from the API data.
If 'placeData' is null or empty, try to return a valid empty GmbDataExtractionOutput structure with the 'extractedName' set to the 'originalQuery.businessName' and a 'briefReviewSummary' indicating data could not be fetched.
`,
});

const extractGmbDataFlow = ai.defineFlow(
  {
    name: 'extractGmbDataFlow',
    inputSchema: GmbDataExtractionInputSchema,
    outputSchema: GmbDataExtractionOutputSchema,
  },
  async (input) => {
    // Step 1: Fetch data using the tool
    const placeApiData = await fetchBusinessDetailsFromGoogleTool(input);

    // Step 2: Pass the API data to the LLM for synthesis
    const {output} = await synthesizeGmbDataFromPlaceApiPrompt({
        placeData: placeApiData,
        originalQuery: input
    });

    if (!output) {
      throw new Error('GMB data synthesis failed to produce an output.');
    }
    
    // Ensure gmbPageUrl is correctly constructed if place_id was found by LLM or exists in placeApiData
    let finalGmbPageUrl = output.gmbPageUrl;
    if (!finalGmbPageUrl && placeApiData?.place_id) {
        finalGmbPageUrl = `https://www.google.com/maps/search/?api=1&query=${placeApiData.place_id}`;
    }
    
    // Fallback for name if LLM didn't extract it but API had it
    const finalExtractedName = output.extractedName || placeApiData?.name || input.businessName;

    return {
        ...output,
        extractedName: finalExtractedName,
        gmbPageUrl: finalGmbPageUrl,
        placeId: output.placeId || placeApiData?.place_id, // Ensure placeId is populated
    };
  }
);

export async function extractGmbData(input: GmbDataExtractionInput): Promise<GmbDataExtractionOutput> {
  console.log("Local Digital Eye - GMB Data Extraction from Google Places API");
  console.log("Ensure your GOOGLE_MAPS_API_KEY is set in .env for this feature to work.");
  console.log("This feature uses the Google Places API. Usage is subject to Google's terms and pricing.");
  console.log("--------------------------------------------------------------------");
  return extractGmbDataFlow(input);
}
