/**
 * @fileOverview Service for interacting with Google Maps Places API.
 * This file uses the recommended "Places API (New)".
 */
import {z} from 'genkit';

// Schema definitions based on the "Places API (New)" response format.
const PlaceSchema = z.object({
  id: z.string().describe("The unique identifier of the place."),
  formattedAddress: z.string().optional(),
  internationalPhoneNumber: z.string().optional(),
  name: z.string().optional().describe("The human-readable name for the place."),
  rating: z.number().min(0).max(5).optional(),
  userRatingCount: z.number().int().optional(),
  types: z.array(z.string()).optional(),
  websiteUri: z.string().url().optional(),
  businessStatus: z.string().optional(),
});

export type Place = z.infer<typeof PlaceSchema>;

const GooglePlacesNewTextSearchResponseSchema = z.object({
  places: z.array(z.any()).optional(), // Use z.any() because the raw response is slightly different
});

/**
 * Normalizes the response from Google Places API (New) to a more consistent format
 * that our application can use. This is particularly useful because the new API
 * returns an array of places, and we typically want to work with the first, most relevant one.
 * @param place The Place object from the new API response.
 * @returns A normalized Place object for our application.
 */
function normalizePlace(place: any): Place {
  // CORRECTED: The 'name' field in the response is nested under 'displayName.text'.
  return {
    id: place.id,
    name: place.displayName?.text, // This is the fix
    formattedAddress: place.formattedAddress,
    internationalPhoneNumber: place.internationalPhoneNumber,
    websiteUri: place.websiteUri,
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    types: place.types,
    businessStatus: place.businessStatus,
  };
}


/**
 * Searches for a place using Google Places API (New - searchText).
 * @param businessName The name of the business.
 * @param location The location hint (e.g., city, address).
 * @returns A promise that resolves to the first Place object found, or null.
 */
export async function searchGooglePlace(
  businessName: string,
  location: string
): Promise<Place | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("[GoogleMapsService] CRITICAL: GOOGLE_MAPS_API_KEY environment variable is not set. Please check your hosting environment variables.");
    throw new Error("Server configuration error: Google API Key is missing.");
  }

  const url = 'https://places.googleapis.com/v1/places:searchText';
  
  // These are the fields we want to get back from the API
  const fieldMask = [
    "places.id", "places.displayName", "places.formattedAddress", "places.internationalPhoneNumber",
    "places.websiteUri", "places.rating", "places.userRatingCount", "places.types", 
    "places.businessStatus"
  ].join(",");

  const requestBody = {
    textQuery: `${businessName} in ${location}`,
    languageCode: "es", // Or make it dynamic based on locale
  };

  try {
    console.log(`[GoogleMapsService] Searching (New API) for: "${requestBody.textQuery}"`);
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
        const errorBody = await response.json().catch(() => ({})); // Catch if error body is not valid JSON
        const detailedError = errorBody.error ? JSON.stringify(errorBody.error) : 'No additional error details available.';
        console.error(`[GoogleMapsService] API Error: ${response.status} - ${detailedError}`);
        
        if (response.status === 403) {
             console.error("[GoogleMapsService] This PERMISSION_DENIED error usually means the Places API (New) is not enabled on your Google Cloud project, or the API key is invalid/restricted. Please check your Google Cloud Console.");
             throw new Error(`Google Places API Request Denied. Please ensure the 'Places API' is enabled and your API key is correct and unrestricted.`);
        }
        
        throw new Error(`Google Places API request failed with status ${response.status}. Details: ${detailedError}`);
    }

    const data = await response.json();
    const validatedData = GooglePlacesNewTextSearchResponseSchema.safeParse(data);
    
    if (!validatedData.success || !validatedData.data.places || validatedData.data.places.length === 0) {
      console.log(`[GoogleMapsService] No results found or validation failed for "${requestBody.textQuery}".`);
      return null;
    }
    
    console.log(`[GoogleMapsService] Found ${validatedData.data.places.length} result(s). Returning the first one.`);
    // Normalize the first result to our internal Place type.
    const firstPlace = validatedData.data.places[0];
    return normalizePlace(firstPlace);

  } catch (error: any) {
    console.error("[GoogleMapsService] A critical error occurred while calling Google Places API (New):", error.message);
    throw error;
  }
}
