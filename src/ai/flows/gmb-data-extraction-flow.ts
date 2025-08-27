'use server';
/**
 * @fileOverview Extracts and synthesizes data for a business using Google Places API.
 * This flow now performs a two-step process:
 * 1. Search for the business to get a placeId.
 * 2. Get detailed information for that placeId.
 *
 * - extractGmbData - A function that fetches data from Google Places API and synthesizes it.
 * - GmbDataExtractionInput - The input type for the extractGmbData function.
 * - GmbDataExtractionOutput - The return type for the extractGmbData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchGooglePlace, getGooglePlaceDetails, type Place } from '@/services/googleMapsService';


const GmbDataExtractionInputSchema = z.object({
  businessName: z.string().describe('The name of the business to search on Google Maps.'),
  location: z.string().describe('The location of the business (e.g., city, address).'),
});
export type GmbDataExtractionInput = z.infer<typeof GmbDataExtractionInputSchema>;

// Expanded output schema to include all the new fields
const GmbDataExtractionOutputSchema = z.object({
  placeId: z.string().optional().describe('Google Place ID of the business.'),
  extractedName: z.string().describe('The official name of the business found.'),
  address: z.string().optional().describe('Full address of the business.'),
  phone: z.string().optional().describe('Primary phone number.'),
  website: z.string().url().optional().describe('Official website URL.'),
  rating: z.number().min(0).max(5).optional().describe('Average customer rating (e.g., 4.5).'),
  reviewCount: z.number().int().optional().describe('Total number of reviews.'),
  category: z.string().optional().describe('Primary business category (e.g., Restaurant, Hair Salon).'),
  businessStatus: z.string().optional().describe('Operational status of the business (e.g., OPERATIONAL).'),
  gmbPageUrl: z.string().url().optional().describe('The URL of the Google Maps page for the business.'),
  
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional().describe('Geographic coordinates of the business.'),
  
  photos: z.array(z.any()).optional().describe('List of photos of the business.'),
  reviews: z.array(z.any()).optional().describe('List of customer reviews.'),
  
  openingHours: z.object({
    openNow: z.boolean().optional(),
    weekdayDescriptions: z.array(z.string()).optional(),
  }).optional().describe('Opening hours information.'),
  
  editorialSummary: z.string().nullable().optional().describe('An AI-generated summary from Google.'),
  briefReviewSummary: z.string().optional().describe('A very brief AI-generated summary of the business perception based on available data like rating and category. Max 150 characters.'),

});
export type GmbDataExtractionOutput = z.infer<typeof GmbDataExtractionOutputSchema>;


function mapPlaceToOutput(placeData: Place | null): GmbDataExtractionOutput | null {
  if (!placeData || !placeData.id || !placeData.name) {
    return null;
  }

  let summary = `Un ${placeData.types?.[0]?.replace(/_/g, ' ') || 'establecimiento'} en la zona.`;
  if (placeData.rating && placeData.userRatingCount) {
    summary = `Un ${placeData.types?.[0]?.replace(/_/g, ' ') || 'establecimiento'} bien valorado con una puntuación de ${placeData.rating} de ${placeData.userRatingCount} reseñas.`
  }

  return {
    placeId: placeData.id,
    extractedName: placeData.name,
    address: placeData.formattedAddress,
    phone: placeData.internationalPhoneNumber,
    website: placeData.websiteUri,
    rating: placeData.rating,
    reviewCount: placeData.userRatingCount,
    category: placeData.types?.[0], 
    businessStatus: placeData.businessStatus,
    gmbPageUrl: `https://www.google.com/maps/search/?api=1&query_id=${placeData.id}`,
    briefReviewSummary: summary,
    
    // Mapping new fields
    location: placeData.location,
    photos: placeData.photos,
    reviews: placeData.reviews,
    openingHours: placeData.openingHours,
    editorialSummary: placeData.editorialSummary?.text,
  };
}


const extractGmbDataFlow = ai.defineFlow(
  {
    name: 'extractGmbDataFlow',
    inputSchema: GmbDataExtractionInputSchema,
    outputSchema: GmbDataExtractionOutputSchema.nullable(),
  },
  async (input) => {
    // Step 1: Search for the business to get the place ID and basic info
    console.log(`Flow: Searching Google Place for ${input.businessName} in ${input.location}`);
    const searchResult = await searchGooglePlace(input.businessName, input.location);

    if (!searchResult || !searchResult.id) {
      console.log("Flow: No data returned from searchGooglePlace service.");
      return null;
    }
    
    // Step 2: Use the place ID to get the full, rich details
    console.log(`Flow: Found placeId ${searchResult.id}. Now fetching full details.`);
    const detailedPlaceData = await getGooglePlaceDetails(searchResult.id);

    if (!detailedPlaceData) {
        console.log(`Flow: Failed to get detailed data for placeId: ${searchResult.id}`);
        // Fallback to search result if details fail
        return mapPlaceToOutput(searchResult);
    }
    
    // Step 3: Map the final, detailed data to the output format
    const mappedData = mapPlaceToOutput(detailedPlaceData);

    if (!mappedData) {
        console.log("Flow: Mapping from detailed Place API data to output failed.");
        return null;
    }

    console.log(`Flow: Successfully mapped detailed data for placeId: ${mappedData.placeId}`);
    return mappedData;
  }
);

export async function extractGmbData(input: GmbDataExtractionInput): Promise<GmbDataExtractionOutput | null> {
  console.log("Local Digital Eye - GMB Data Extraction from Google Places API (Two-Step)");
  console.log("This feature uses the Google Places API. Usage is subject to Google's terms and pricing.");
  console.log("--------------------------------------------------------------------");
  return extractGmbDataFlow(input);
}
