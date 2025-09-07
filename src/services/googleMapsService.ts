/**
 * @fileOverview Service for interacting with Google Maps Places API.
 * This file uses the recommended "Places API (New)".
 */
import {z} from 'genkit';

// Schema for a single photo from the Places API
const PhotoSchema = z.object({
    name: z.string(),
    widthPx: z.number().optional(),
    heightPx: z.number().optional(),
});
export type Photo = z.infer<typeof PhotoSchema>;

// Schema for opening hours, matching the new API structure
const OpeningHoursSchema = z.object({
    openNow: z.boolean().optional(),
    weekdayDescriptions: z.array(z.string()).optional(),
});
export type OpeningHours = z.infer<typeof OpeningHoursSchema>;

// Schema for a single review from the Places API
const ReviewSchema = z.object({
  name: z.string(),
  rating: z.number().min(1).max(5),
  text: z.object({ text: z.string(), languageCode: z.string() }).nullable().optional(),
  publishTime: z.string(),
  authorAttribution: z.object({
    displayName: z.string(),
    uri: z.string().url(),
    photoUri: z.string().url(),
  }).nullable().optional(),
});
export type Review = z.infer<typeof ReviewSchema>;

// Main schema for a Place, expanded with more details
const PlaceSchema = z.object({
  id: z.string().describe("The unique identifier of the place."),
  name: z.string().optional().describe("The human-readable name for the place."),
  formattedAddress: z.string().nullable().optional(),
  internationalPhoneNumber: z.string().nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  userRatingCount: z.number().int().nullable().optional(),
  types: z.array(z.string()).optional(),
  websiteUri: z.string().url().nullable().optional(),
  businessStatus: z.string().nullable().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).nullable().optional(),
  photos: z.array(PhotoSchema).optional(),
  regularOpeningHours: OpeningHoursSchema.nullable().optional(),
  reviews: z.array(ReviewSchema).optional(), // Add reviews to the Place schema
});

export type Place = z.infer<typeof PlaceSchema>;

const GooglePlacesNewTextSearchResponseSchema = z.object({
  places: z.array(z.any()).optional(),
});

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
 * Ensures that any missing optional fields are set to null instead of undefined.
 * @param place The raw place data.
 * @returns A normalized Place object.
 */
function normalizePlace(place: any): Place {
  if (!place) return place;

  // Handle new displayName structure from Google API
  const displayName = place.displayName?.text ?? place.name;

  return {
    id: place.id,
    name: displayName,
    formattedAddress: place.formattedAddress || null,
    internationalPhoneNumber: place.internationalPhoneNumber || null,
    websiteUri: place.websiteUri || null,
    rating: place.rating ?? null,
    userRatingCount: place.userRatingCount ?? null,
    types: place.types || [],
    businessStatus: place.businessStatus || null,
    location: place.location || null,
    photos: (place.photos || []).map((p: any) => ({ name: p.name, widthPx: p.widthPx, heightPx: p.heightPx })),
    regularOpeningHours: place.regularOpeningHours || null,
    reviews: place.reviews || [],
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
  
  // Adjusted the field mask to request displayName, as name is obsolete for this endpoint.
  const fieldMask = "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.location,places.websiteUri,places.businessStatus";

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
        const errorMessage = rawData.error?.message || `Status: ${response.status}`;
        console.error(`[GoogleMapsService] Search API Error: ${errorMessage}`);
        throw new Error(`Google Places Search API request failed. ${errorMessage}`);
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
  
    // Add 'reviews' to the fieldMask
    const fieldMask = "id,displayName,formattedAddress,internationalPhoneNumber,websiteUri,rating,userRatingCount,types,businessStatus,location,photos,regularOpeningHours,reviews";
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
  
      const rawData = await response.json();

      if (!response.ok) {
          const errorMessage = rawData.error?.message || `Status: ${response.status}`;
          console.error(`[GoogleMapsService] Details API Error: ${errorMessage}`);
          throw new Error(`Google Places Details API request failed. ${errorMessage}`);
      }
  
      console.log(`[GoogleMapsService] Successfully fetched details for ${rawData.displayName?.text}.`);
      return {
          normalizedData: normalizePlace(rawData),
          rawData: rawData
      };
  
    } catch (error: any) {
      console.error(`[GoogleMapsService] Critical error during getGooglePlaceDetails for placeId ${placeId}:`, error.message);
      throw error;
    }
}
