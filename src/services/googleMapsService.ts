
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
    authorAttributions: z.array(z.any()).optional(), // Keeping it simple
});
export type Photo = z.infer<typeof PhotoSchema>;

// Schema for opening hours, matching the new API structure
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
  currentOpeningHours: OpeningHoursSchema.optional(),
  regularOpeningHours: OpeningHoursSchema.optional(),
});

export type Place = z.infer<typeof PlaceSchema>;

const GooglePlacesNewTextSearchResponseSchema = z.object({
  places: z.array(z.any()).optional(),
});

// New return type for functions to include raw data for debugging
interface PlaceResult {
    normalizedData: Place | null;
    rawData: any;
}

interface PlaceListResult {
    normalizedData: Place[];
    rawData: any;
}

/**
 * Normalizes the raw place data from Google API to our Place schema.
 * @param place The raw place data.
 * @returns A normalized Place object.
 */
function normalizePlace(place: any): Place {
  if (!place) return place;

  const displayName = place.displayName?.text ?? place.name;
  
  // Combine opening hours data into a single object for our entity.
  // The API returns current and regular hours separately. We can decide which to prioritize.
  // For simplicity, we'll use regular hours if available, otherwise current.
  const openingHoursData = place.regularOpeningHours || place.currentOpeningHours;

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
    // Assign the combined opening hours data
    currentOpeningHours: place.currentOpeningHours,
    regularOpeningHours: place.regularOpeningHours,
  };
}


/**
 * Searches for places using Google Places API (New - searchText).
 * @param textQuery The search query (e.g., "Restaurant in New York").
 * @returns A promise that resolves to an object containing an array of Place objects and the raw API response.
 */
export async function searchGooglePlaces(
  query: string
): Promise<PlaceListResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("[GoogleMapsService] CRITICAL: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set.");
    throw new Error("Server configuration error: Google API Key is missing.");
  }

  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  // Corrected fieldMask to include location
  const fieldMask = "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.location";

  const requestBody = {
    textQuery: query,
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

    const rawData = await response.json();

    if (!response.ok) {
        const detailedError = rawData.error ? JSON.stringify(rawData.error) : 'No details';
        console.error(`[GoogleMapsService] Search API Error: ${response.status} - ${detailedError}`);
        throw new Error(`Google Places Search API request failed with status ${response.status}. Details: ${detailedError}`);
    }

    const validatedData = GooglePlacesNewTextSearchResponseSchema.safeParse(rawData);
    
    if (!validatedData.success || !validatedData.data.places || validatedData.data.places.length === 0) {
      console.log(`[GoogleMapsService] No results found for "${requestBody.textQuery}".`);
      return { normalizedData: [], rawData: rawData };
    }
    
    const places = validatedData.data.places;
    console.log(`[GoogleMapsService] Found ${places.length} places.`);
    return {
        normalizedData: places.map(normalizePlace),
        rawData: rawData
    };

  } catch (error: any) {
    console.error("[GoogleMapsService] Critical error during searchGooglePlace:", error.message);
    throw error;
  }
}

/**
 * Gets detailed information for a specific place ID using Places API (New).
 * This is used to get the full, enriched data before connecting a business.
 * @param placeId The place ID to get details for.
 * @returns A promise that resolves to an object with detailed Place data and the raw API response.
 */
export async function getGooglePlaceDetails(placeId: string): Promise<PlaceResult | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("[GoogleMapsService] CRITICAL: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set.");
      throw new Error("Server configuration error: Google API Key is missing.");
    }
  
    // Correct fieldMask for the details endpoint. Note the camelCase and corrected opening hours fields.
    const fieldMask = "id,displayName,formattedAddress,internationalPhoneNumber,websiteUri,rating,userRatingCount,types,businessStatus,location,photos,currentOpeningHours,regularOpeningHours";
    const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=es`;
  
    try {
      console.log(`[GoogleMapsService] Getting details for placeId: "${placeId}" with fieldMask: "${fieldMask}"`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask,
        },
      });
  
      const rawData = await response.json();

      if (!response.ok) {
          const detailedError = rawData.error ? JSON.stringify(rawData.error) : `Status: ${response.status}`;
          console.error(`[GoogleMapsService] Details API Error: ${detailedError}`);
          throw new Error(`Google Places Details API request failed with status ${response.status}. Details: ${detailedError}`);
      }
  
      console.log(`[GoogleMapsService] Successfully fetched details for ${rawData.id}.`);
      return {
          normalizedData: normalizePlace(rawData),
          rawData: rawData
      };
  
    } catch (error: any) {
      console.error(`[GoogleMapsService] Critical error during getGooglePlaceDetails for placeId ${placeId}:`, error.message);
      throw error;
    }
}
