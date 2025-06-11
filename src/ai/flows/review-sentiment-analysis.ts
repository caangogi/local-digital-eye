
'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing customer reviews to identify key topics and sentiments.
 *
 * - analyzeReviewSentiment - A function that analyzes customer reviews and extracts key topics and sentiments.
 * - AnalyzeReviewSentimentInput - The input type for the analyzeReviewSentiment function, which includes the reviews to analyze.
 * - AnalyzeReviewSentimentOutput - The output type for the analyzeReviewSentiment function, providing a summary of topics and sentiments.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeReviewSentimentInputSchema = z.object({
  reviews: z
    .string()
    .describe('The customer reviews to analyze, provided as a single string.'),
});
export type AnalyzeReviewSentimentInput = z.infer<typeof AnalyzeReviewSentimentInputSchema>;

const AnalyzeReviewSentimentOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A summary of the key topics discussed in the reviews and the overall sentiment expressed towards them.'
    ),
});
export type AnalyzeReviewSentimentOutput = z.infer<typeof AnalyzeReviewSentimentOutputSchema>;

export async function analyzeReviewSentiment(
  input: AnalyzeReviewSentimentInput
): Promise<AnalyzeReviewSentimentOutput> {
  return analyzeReviewSentimentFlow(input);
}

const analyzeReviewSentimentPrompt = ai.definePrompt({
  name: 'analyzeReviewSentimentPrompt',
  input: {schema: AnalyzeReviewSentimentInputSchema},
  output: {schema: AnalyzeReviewSentimentOutputSchema},
  prompt: `Analyze the following customer reviews and identify the key topics discussed and the overall sentiment expressed towards those topics. Provide a concise summary of your findings.\n\nReviews:\n{{{reviews}}}`,
});

const analyzeReviewSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeReviewSentimentFlow',
    inputSchema: AnalyzeReviewSentimentInputSchema,
    outputSchema: AnalyzeReviewSentimentOutputSchema,
  },
  async input => {
    const {output} = await analyzeReviewSentimentPrompt(input);
    return output!;
  }
);

