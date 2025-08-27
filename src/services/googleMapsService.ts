
/**
 * @fileOverview Service for interacting with Google Maps Places API.
 * This file uses the recommended "Places API (New)".
 */
import {z} from 'genkit';

// Schema for a single photo from the Places API
const PhotoSchema = z.object({
    name: z.string(),
    widthPx: z.number(),
    heightPx: z.number(),
    authorAttributions: z.array(z.any()).optional(),
});
export type Photo = z.infer<typeof PhotoSchema>;

// Schema for opening hours
const OpeningHoursSchema = z.object({
    openNow: z.boolean().optional(),
    weekdayDescriptions: z.array(z.string()).optional(),
});
export type OpeningHours = z.infer<typeof OpeningHoursSchema>;

// Main schema for a Place, expanded with more details
const PlaceSchema = z.object({
  id: z.string().describe("The unique identifier of the place."),
  name: z.string().optional().describe("The human-readable name for the place."),
  formattedAddress: z.string().optional(),
  internationalPhoneNumber: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  userRatingCount: z.number().int().optional(),
  types: z.array(z.string()).optional(),
  websiteUri: z.string().url().optional(),
  businessStatus: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  photos: z.array(PhotoSchema).optional(),
  openingHours: OpeningHoursSchema.optional(),
});

export type Place = z.infer<typeof PlaceSchema>;

const GooglePlacesNewTextSearchResponseSchema = z.object({
  places: z.array(z.any()).optional(),
});

/**
 * Normalizes the raw place data from Google API to our Place schema.
 * @param place The raw place data.
 * @returns A normalized Place object.
 */
function normalizePlace(place: any): Place {
  if (!place) return place;

  const displayName = place.displayName?.text ?? place.name;
  
  return {
    id: place.id,
    name: displayName,
    formattedAddress: place.formattedAddress,
    internationalPhoneNumber: place.internationalPhoneNumber,
    websiteUri: place.websiteUri,
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    types: place.types,
    businessStatus: place.businessStatus,
    location: place.location,
    photos: place.photos,
    openingHours: {
        openNow: place.openingHours?.openNow,
        weekdayDescriptions: place.openingHours?.weekdayDescriptions,
    },
  };
}


/**
 * Searches for a place using Google Places API (New - searchText).
 * This should only be used for the initial search and preview.
 * @param textQuery The search query (e.g., "Restaurant in New York").
 * @returns A promise that resolves to the first Place object found, or null.
 */
export async function searchGooglePlace(
  businessName: string,
  location: string
): Promise<Place | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("[GoogleMapsService] CRITICAL: GOOGLE_MAPS_API_KEY is not set.");
    throw new Error("Server configuration error: Google API Key is missing.");
  }

  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  // Basic field mask for search results - keeping it minimal and cheap
  const fieldMask = "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types";

  const requestBody = {
    textQuery: `${businessName} in ${location}`,
    languageCode: "es", 
  };

  try {
    console.log(`[GoogleMapsService] Searching for: "${requestBody.textQuery}"`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const detailedError = errorBody.error ? JSON.stringify(errorBody.error) : 'No details';
        console.error(`[GoogleMapsService] Search API Error: ${response.status} - ${detailedError}`);
        throw new Error(`Google Places Search API request failed with status ${response.status}. Details: ${detailedError}`);
    }

    const data = await response.json();
    const validatedData = GooglePlacesNewTextSearchResponseSchema.safeParse(data);
    
    if (!validatedData.success || !validatedData.data.places || validatedData.data.places.length === 0) {
      console.log(`[GoogleMapsService] No results found for "${requestBody.textQuery}".`);
      return null;
    }
    
    const firstPlace = validatedData.data.places[0];
    console.log(`[GoogleMapsService] Found placeId: ${firstPlace.id}.`);
    return normalizePlace(firstPlace);

  } catch (error: any) {
    console.error("[GoogleMapsService] Critical error during searchGooglePlace:", error.message);
    throw error;
  }
}

/**
 * Gets detailed information for a specific place ID using Places API (New).
 * This is used to get the full, enriched data before connecting a business.
 * @param placeId The place ID to get details for.
 * @returns A promise that resolves to a detailed Place object, or null.
 */
export async function getGooglePlaceDetails(placeId: string): Promise<Place | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("[GoogleMapsService] CRITICAL: GOOGLE_MAPS_API_KEY is not set.");
      throw new Error("Server configuration error: Google API Key is missing.");
    }
  
    // Correct fieldMask for the 'details' endpoint. NO 'places.' prefix.
    const fieldMask = "id,displayName,formattedAddress,internationalPhoneNumber,websiteUri,rating,userRatingCount,types,businessStatus,location,photos,openingHours";
  
    const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=es`;
  
    try {
      console.log(`[GoogleMapsService] Getting details for placeId: "${placeId}"`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
      });
  
      if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          // Capture the detailed error message from Google
          const detailedError = errorBody.error ? JSON.stringify(errorBody.error.details) : `Status: ${response.status}`;
          console.error(`[GoogleMapsService] Details API Error: ${detailedError}`);
          // Throw the more informative error message
          throw new Error(`Google Places Details API request failed with status ${response.status}. Details: ${detailedError}`);
      }
  
      const data = await response.json();
      console.log(`[GoogleMapsService] Successfully fetched details for ${data.id}.`);
      return normalizePlace(data);
  
    } catch (error: any) {
      console.error(`[GoogleMapsService] Critical error during getGooglePlaceDetails for placeId ${placeId}:`, error.message);
      // Re-throw the error so it can be caught by the calling function
      throw error;
    }
}
