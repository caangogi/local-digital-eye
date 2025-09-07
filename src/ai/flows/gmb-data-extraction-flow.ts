
'use server';
/**
 * @fileOverview Extracts and synthesizes data for a business using Google Places API.
 * This flow now performs a two-step process:
 * 1. Search for businesses based on a query.
 * 2. Return a list of detailed information for each found place.
 *
 * - extractGmbData - A function that fetches data from Google Places API and synthesizes it.
 * - GmbDataExtractionInput - The input type for the extractGmbData function.
 * - GmbDataExtractionOutput - The return type for the extractGmbData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { searchGooglePlaces, type Place } from '@/services/googleMapsService'; 

// Updated input schema to be a single query string
const GmbDataExtractionInputSchema = z.object({
  query: z.string().describe('The search query to find businesses on Google Maps (e.g., "Electricistas en Inca, Mallorca").'),
});
export type GmbDataExtractionInput = z.infer<typeof GmbDataExtractionInputSchema>;

// Expanded output schema to include all the new fields
const GmbDataExtractionOutputSchema = z.object({
  placeId: z.string().optional().describe('Google Place ID of the business.'),
  extractedName: z.string().optional().describe('The official name of the business found.'),
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
  
  openingHours: z.object({
    openNow: z.boolean().optional(),
    weekdayDescriptions: z.array(z.string()).optional(),
  }).optional().describe('Opening hours information.'),
  
  briefReviewSummary: z.string().optional().describe('A very brief AI-generated summary of the business perception based on available data like rating and category. Max 150 characters.'),

});
export type GmbDataExtractionOutput = z.infer<typeof GmbDataExtractionOutputSchema>;

// New schema for the flow output, including raw data for debugging
const FlowOutputSchema = z.object({
    mappedData: z.array(GmbDataExtractionOutputSchema),
    rawData: z.any().optional().describe('Raw JSON response from the Google API for debugging.'),
});

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
    openingHours: placeData.regularOpeningHours,
  };
}


const extractGmbDataFlow = ai.defineFlow(
  {
    name: 'extractGmbDataFlow',
    inputSchema: GmbDataExtractionInputSchema,
    outputSchema: FlowOutputSchema.nullable(),
  },
  async (input) => {
    // Step 1: Search for the business to get the place ID and basic info
    console.log(`Flow: Searching Google Place for "${input.query}"`);
    const searchResults = await searchGooglePlaces(input.query);

    if (!searchResults || !searchResults.normalizedData || searchResults.normalizedData.length === 0) {
      console.log("Flow: No data returned from searchGooglePlaces service.");
      return { mappedData: [], rawData: searchResults?.rawData };
    }
    
    // Step 2: Map the search result data to the output format.
    const mappedData = searchResults.normalizedData
        .map(place => mapPlaceToOutput(place))
        .filter((p): p is GmbDataExtractionOutput => p !== null);

    if (mappedData.length === 0) {
        console.log("Flow: Mapping from basic Place API data to output failed for all results.");
        return { mappedData: [], rawData: searchResults.rawData };
    }

    console.log(`Flow: Successfully mapped ${mappedData.length} businesses.`);
    return {
        mappedData: mappedData,
        rawData: searchResults.rawData, // Pass raw data through
    };
  }
);

export async function extractGmbData(input: GmbDataExtractionInput): Promise<z.infer<typeof FlowOutputSchema> | null> {
  console.log("Local Digital Eye - GMB Data Extraction from Google Places API (Search & List)");
  console.log("This feature uses the Google Places API. Usage is subject to Google's terms and pricing.");
  console.log("--------------------------------------------------------------------");
  return extractGmbDataFlow(input);
}
