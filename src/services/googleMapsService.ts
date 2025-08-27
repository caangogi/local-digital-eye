/**
 * @fileOverview Service for interacting with Google Maps Places API.
 */
import {z} from 'genkit';

const PlaceOpeningHoursPeriodDetailSchema = z.object({
  day: z.number().describe("Day of the week, from 0 (Sunday) to 6 (Saturday)."),
  time: z.string().regex(/^\d{4}$/).describe("Time in HHMM format (24-hour)."),
  date: z.string().optional().describe("Date in YYYY-MM-DD format, for special hours."),
  truncated: z.boolean().optional().describe("True if the hours are truncated."),
});

const PlaceOpeningHoursPeriodSchema = z.object({
  open: PlaceOpeningHoursPeriodDetailSchema.optional(),
  close: PlaceOpeningHoursPeriodDetailSchema.optional(),
});

const PlaceOpeningHoursSchema = z.object({
  open_now: z.boolean().optional().describe("Is the place open now?"),
  periods: z.array(PlaceOpeningHoursPeriodSchema).optional().describe("Array of opening periods."),
  weekday_text: z.array(z.string()).optional().describe("Localized opening hours for each day of the week."),
  secondary_opening_hours: z.array(z.any()).optional().describe("Secondary hours (e.g. DRIVE_THROUGH, HAPPY_HOUR) - structure can vary."),
});

export const PlaceSchema = z.object({
  place_id: z.string().optional().describe("A textual identifier that uniquely identifies a place."),
  name: z.string().optional().describe("The human-readable name for the place."),
  formatted_address: z.string().optional().describe("The human-readable address of this place."),
  international_phone_number: z.string().optional().describe("The place's phone number in international format."),
  website: z.string().url().optional().describe("The authoritative website for this place, such as a business' homepage."),
  rating: z.number().min(0).max(5).optional().describe("The place's rating, from 1.0 to 5.0, based on user reviews."),
  user_ratings_total: z.number().int().optional().describe("The total number of user ratings."),
  types: z.array(z.string()).optional().describe("An array of types for this place (e.g., \"restaurant\", \"cafe\")."),
  opening_hours: PlaceOpeningHoursSchema.optional().describe("Information about the opening hours of the place."),
  business_status: z.string().optional().describe("Indicates the operational status of the place, if it is a business (e.g., \"OPERATIONAL\", \"CLOSED_TEMPORARILY\")."),
  // reviews: z.array(PlaceReviewSchema).optional().describe("A JSON array of up to five reviews."), // Place Details Only
});
export type Place = z.infer<typeof PlaceSchema>;

const GooglePlacesTextSearchResponseSchema = z.object({
  results: z.array(PlaceSchema),
  status: z.string(), // e.g., "OK", "ZERO_RESULTS", "REQUEST_DENIED"
  error_message: z.string().optional(),
  info_messages: z.array(z.string()).optional(),
  next_page_token: z.string().optional(),
});
export type GooglePlacesTextSearchResponse = z.infer<typeof GooglePlacesTextSearchResponseSchema>;


/**
 * Searches for a place using Google Places API (Text Search).
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
    console.error("CRITICAL: GOOGLE_MAPS_API_KEY environment variable is not set.");
    throw new Error("Server configuration error: The Google Maps API key is missing. Please set it in your hosting environment (e.g., Vercel).");
  }

  const query = `${businessName} in ${location}`;
  const fields = [
    "place_id", "name", "formatted_address", "international_phone_number",
    "website", "rating", "user_ratings_total", "types", "opening_hours", "business_status"
  ].join(",");
  
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&fields=${fields}&key=${apiKey}`;

  try {
    console.log(`[GoogleMapsService] Searching for: "${query}"`);
    const response = await fetch(url);
    const data: GooglePlacesTextSearchResponse = await response.json();

    if (data.status === "OK") {
      console.log(`[GoogleMapsService] Found ${data.results.length} result(s). Returning the first one.`);
      return data.results[0] || null;
    } 
    
    if (data.status === "ZERO_RESULTS") {
      console.log(`[GoogleMapsService] No results found for "${query}".`);
      return null;
    } 
    
    // Handle specific, actionable errors
    if (data.status === "REQUEST_DENIED") {
      console.error(`[GoogleMapsService] API Error: ${data.status} - ${data.error_message || 'Request was denied.'}`);
      console.error("[GoogleMapsService] This usually means the Places API is not enabled on your Google Cloud project, or the API key is invalid/restricted. Please check your Google Cloud Console.");
      throw new Error(`Google Places API Request Denied. Please ensure the 'Places API' is enabled and your API key is correct and unrestricted.`);
    }

    // Handle other unexpected statuses
    console.error(`[GoogleMapsService] Unexpected API Status: ${data.status} - ${data.error_message || 'Unknown error'}`);
    if (data.info_messages) console.info("Info messages:", data.info_messages);
    throw new Error(`Google Places API returned an unexpected status: ${data.status}`);

  } catch (error) {
    console.error("[GoogleMapsService] A critical error occurred while calling Google Places API:", error);
    // Re-throw the error so the caller can handle it, e.g., show a generic error message to the user.
    throw error;
  }
}
