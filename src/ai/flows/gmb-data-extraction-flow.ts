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
import { searchGooglePlace, type Place } from '@/services/googleMapsService';

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

/**
 * Maps the raw Place data from Google API to our defined GmbDataExtractionOutput structure.
 * @param placeData The raw data from Google Places API.
 * @returns A structured business data object or null if input is invalid.
 */
function mapPlaceToOutput(placeData: Place | null): GmbDataExtractionOutput | null {
  if (!placeData || !placeData.place_id) {
    return null;
  }

  // Generate a plausible summary based on rating and category without an LLM.
  let summary = `A ${placeData.types?.[0]?.replace(/_/g, ' ') || 'establishment'} in the area.`;
  if (placeData.rating && placeData.user_ratings_total) {
    summary = `A well-regarded ${placeData.types?.[0]?.replace(/_/g, ' ') || 'establishment'} with a rating of ${placeData.rating} from ${placeData.user_ratings_total} reviews.`
  }

  return {
    placeId: placeData.place_id,
    extractedName: placeData.name || 'Unknown Name',
    address: placeData.formatted_address,
    phone: placeData.international_phone_number,
    website: placeData.website,
    rating: placeData.rating,
    reviewCount: placeData.user_ratings_total,
    category: placeData.types?.[0], // Get the first category
    openingHours: placeData.opening_hours?.weekday_text,
    businessStatus: placeData.business_status,
    gmbPageUrl: `https://www.google.com/maps/search/?api=1&query=${placeData.place_id}`,
    briefReviewSummary: summary,
  };
}


const extractGmbDataFlow = ai.defineFlow(
  {
    name: 'extractGmbDataFlow',
    inputSchema: GmbDataExtractionInputSchema,
    outputSchema: GmbDataExtractionOutputSchema.nullable(),
  },
  async (input) => {
    // Step 1: Directly call the Google Places service
    console.log(`Flow: Searching Google Place for ${input.businessName} in ${input.location}`);
    const placeApiData = await searchGooglePlace(input.businessName, input.location);

    if (!placeApiData) {
      console.log("Flow: No data returned from searchGooglePlace service.");
      return null;
    }
    
    // Step 2: Directly map the data to the output format
    const mappedData = mapPlaceToOutput(placeApiData);

    if (!mappedData) {
        console.log("Flow: Mapping from Place API data to output failed. Place ID might be missing.");
        return null;
    }

    console.log(`Flow: Successfully mapped data for placeId: ${mappedData.placeId}`);
    return mappedData;
  }
);

export async function extractGmbData(input: GmbDataExtractionInput): Promise<GmbDataExtractionOutput | null> {
  console.log("Local Digital Eye - GMB Data Extraction from Google Places API");
  console.log("This feature uses the Google Places API. Usage is subject to Google's terms and pricing.");
  console.log("--------------------------------------------------------------------");
  return extractGmbDataFlow(input);
}
