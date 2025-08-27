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
import { searchGooglePlace, type Place, Photo, Review, OpeningHours } from '@/services/googleMapsService';


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
  
  // New detailed fields
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional().describe('Geographic coordinates of the business.'),
  
  photos: z.array(z.any()).optional().describe('List of photos of the business.'), // Using z.any() for simplicity in the flow
  reviews: z.array(z.any()).optional().describe('List of customer reviews.'), // Using z.any() for simplicity in the flow
  
  openingHours: z.object({
    openNow: z.boolean().optional(),
    weekdayDescriptions: z.array(z.string()).optional(),
  }).optional().describe('Opening hours information.'),
  
  editorialSummary: z.string().optional().describe('An AI-generated summary from Google.'),
  briefReviewSummary: z.string().optional().describe('A very brief AI-generated summary of the business perception based on available data like rating and category. Max 150 characters.'),

});
export type GmbDataExtractionOutput = z.infer<typeof GmbDataExtractionOutputSchema>;


function mapPlaceToOutput(placeData: Place | null): GmbDataExtractionOutput | null {
  if (!placeData || !placeData.id) {
    return null;
  }

  let summary = `Un ${placeData.types?.[0]?.replace(/_/g, ' ') || 'establecimiento'} en la zona.`;
  if (placeData.rating && placeData.userRatingCount) {
    summary = `Un ${placeData.types?.[0]?.replace(/_/g, ' ') || 'establecimiento'} bien valorado con una puntuación de ${placeData.rating} de ${placeData.userRatingCount} reseñas.`
  }

  return {
    placeId: placeData.id,
    extractedName: placeData.name || 'Unknown Name',
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
    console.log(`Flow: Searching Google Place for ${input.businessName} in ${input.location}`);
    const placeApiData = await searchGooglePlace(input.businessName, input.location);

    if (!placeApiData) {
      console.log("Flow: No data returned from searchGooglePlace service.");
      return null;
    }
    
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
  console.log("Local Digital Eye - GMB Data Extraction from Google Places API (New)");
  console.log("This feature uses the Google Places API. Usage is subject to Google's terms and pricing.");
  console.log("--------------------------------------------------------------------");
  return extractGmbDataFlow(input);
}
