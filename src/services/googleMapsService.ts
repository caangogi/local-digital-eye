/**
 * @fileOverview Service for interacting with Google Maps Places API and Google Business Profile APIs.
 */
import {z} from 'genkit';
import { getGoogleOAuthClient } from '@/lib/google-oauth-client';

// --- SCHEMAS FOR GOOGLE PLACES API (PUBLIC) ---

const PhotoSchema = z.object({
    name: z.string(),
    widthPx: z.number().optional(),
    heightPx: z.number().optional(),
});
export type Photo = z.infer<typeof PhotoSchema>;

const OpeningHoursSchema = z.object({
    openNow: z.boolean().optional(),
    weekdayDescriptions: z.array(z.string()).optional(),
});
export type OpeningHours = z.infer<typeof OpeningHoursSchema>;

const PublicReviewSchema = z.object({
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
  reviews: z.array(PublicReviewSchema).optional(),
});
export type Place = z.infer<typeof PlaceSchema>;

const GooglePlacesNewTextSearchResponseSchema = z.object({
  places: z.array(z.any()).optional(),
});

// --- SCHEMAS FOR GOOGLE BUSINESS PROFILE API (OAUTH) ---

const GmbDailyMetricTimeSeriesSchema = z.object({
    dailyMetric: z.string(),
    timeSeries: z.object({
        datedValues: z.array(z.object({
            date: z.object({ year: z.number(), month: z.number(), day: z.number() }),
            value: z.string(),
        })),
    }),
});

const GmbGetPerformanceResponseSchema = z.object({
  timeSeries: z.array(GmbDailyMetricTimeSeriesSchema).optional(),
});
export type GmbPerformanceResponse = z.infer<typeof GmbGetPerformanceResponseSchema>;


const GmbReviewReplySchema = z.object({
    comment: z.string(),
    updateTime: z.string(),
});

const GmbReviewSchema = z.object({
    name: z.string(),
    reviewId: z.string(),
    reviewer: z.object({
        profilePhotoUrl: z.string().url().optional(),
        displayName: z.string(),
    }),
    starRating: z.enum(['STAR_RATING_UNSPECIFIED', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE']),
    comment: z.string().optional().nullable(),
    createTime: z.string(),
    updateTime: z.string(),
    reviewReply: GmbReviewReplySchema.optional().nullable(),
});
export type GmbReview = z.infer<typeof GmbReviewSchema>;


const GmbListReviewsResponseSchema = z.object({
    reviews: z.array(GmbReviewSchema).optional(),
    nextPageToken: z.string().optional(),
    totalReviewCount: z.number().optional(),
});


// --- INTERFACES ---

interface PlaceResult {
    normalizedData: Place | null;
    rawData: any;
}

interface PlaceListResult {
    normalizedData: Place[];
    rawData: any;
}

// --- HELPER FUNCTIONS ---

function normalizePlace(place: any): Place {
  if (!place) return place;
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

// --- PLACES API (PUBLIC) ---

export async function searchGooglePlaces(query: string): Promise<PlaceListResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) throw new Error("Server configuration error: Google API Key is missing.");

  const url = 'https://places.googleapis.com/v1/places:searchText';
  const fieldMask = "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.types,places.location,places.websiteUri,places.businessStatus";
  const requestBody = { textQuery: query, languageCode: "es" };

  try {
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
    if (!response.ok) throw new Error(`Google Places Search API request failed. ${rawData.error?.message || `Status: ${response.status}`}`);
    
    const validatedData = GooglePlacesNewTextSearchResponseSchema.safeParse(rawData);
    if (!validatedData.success || !validatedData.data.places || validatedData.data.places.length === 0) {
      return { normalizedData: [], rawData: rawData };
    }
    
    return { normalizedData: validatedData.data.places.map(normalizePlace), rawData: rawData };
  } catch (error: any) {
    console.error("[GoogleMapsService] Critical error during searchGooglePlace:", error.message);
    throw error;
  }
}

export async function getGooglePlaceDetails(placeId: string): Promise<PlaceResult | null> {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error("Server configuration error: Google API Key is missing.");
    
    const fieldMask = "id,displayName,formattedAddress,internationalPhoneNumber,websiteUri,rating,userRatingCount,types,businessStatus,location,photos,regularOpeningHours,reviews";
    const url = `https://places.googleapis.com/v1/places/${placeId}?languageCode=es`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': fieldMask },
      });
      const rawData = await response.json();
      if (!response.ok) throw new Error(`Google Places Details API request failed. ${rawData.error?.message || `Status: ${response.status}`}`);
      
      return { normalizedData: normalizePlace(rawData), rawData: rawData };
    } catch (error: any) {
      console.error(`[GoogleMapsService] Critical error during getGooglePlaceDetails for placeId ${placeId}:`, error.message);
      throw error;
    }
}

// --- BUSINESS PROFILE API (OAUTH) ---

/**
 * Creates an authenticated Google API client using a refresh token.
 * @param refreshToken The refresh token of the business owner.
 * @returns An authenticated OAuth2Client instance.
 */
async function getGmbApiClient(refreshToken: string) {
    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    // The google-auth-library will automatically handle refreshing the access token.
    const tokenInfo = await oauth2Client.getAccessToken();
    if (!tokenInfo.token) {
        throw new Error("Failed to refresh GMB access token.");
    }

    return oauth2Client;
}


/**
 * Fetches performance metrics for a business location.
 * @param refreshToken The owner's refresh token.
 * @param locationId The ID of the business location (e.g., 'places/ChIJ...')
 * @returns A promise resolving to the performance metrics response.
 */
export async function getBusinessMetrics(refreshToken: string, locationId: string): Promise<GmbPerformanceResponse> {
    const apiClient = await getGmbApiClient(refreshToken);
    const accessToken = (await apiClient.getAccessToken()).token;

    const url = `https://businessprofileperformance.googleapis.com/v1/locations/${locationId}:getDailyMetricsTimeSeries`;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyMetrics = [
        'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
        'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
        'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
        'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
        'BUSINESS_CONVERSATIONS',
        'BUSINESS_DIRECTION_REQUESTS',
        'WEBSITE_CLICKS',
        'CALL_CLICKS',
    ];

    const params = new URLSearchParams({
        'dailyRange.start_date.year': thirtyDaysAgo.getFullYear().toString(),
        'dailyRange.start_date.month': (thirtyDaysAgo.getMonth() + 1).toString(),
        'dailyRange.start_date.day': thirtyDaysAgo.getDate().toString(),
        'dailyRange.end_date.year': new Date().getFullYear().toString(),
        'dailyRange.end_date.month': (new Date().getMonth() + 1).toString(),
        'dailyRange.end_date.day': new Date().getDate().toString(),
    });

    dailyMetrics.forEach(metric => params.append('dailyMetric', metric));
    
    try {
        const response = await fetch(`${url}?${params.toString()}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GMB Performance API error: ${errorData.error?.message || response.statusText}`);
        }

        const rawData = await response.json();
        const validatedData = GmbGetPerformanceResponseSchema.parse(rawData);
        return validatedData;
    } catch (error: any) {
        console.error(`[GmbApiAdapter] Error fetching business metrics for ${locationId}:`, error);
        throw error;
    }
}

/**
 * Fetches the latest reviews for a business location.
 * This is a simplified version and doesn't handle pagination.
 * @param refreshToken The owner's refresh token.
 * @param placeId The Place ID of the business (e.g., 'ChIJ...')
 * @returns A promise resolving to an array of review objects.
 */
export async function getBusinessReviews(refreshToken: string, placeId: string): Promise<GmbReview[]> {
    const apiClient = await getGmbApiClient(refreshToken);
    const accessToken = (await apiClient.getAccessToken()).token;
    
    // The Business Profile APIs require the account and location ID in the format 'accounts/{accountId}/locations/{locationId}'
    // For simplicity, we'll assume a method to get this, but in a real app, you'd list accounts first.
    // For now, we will use a placeholder account ID. The API often works with '-' as a wildcard for the user's primary account.
    const accountId = '-';
    // NOTE: The `locations` endpoint in the GMB API uses the Place ID directly as the location identifier.
    const locationName = `accounts/${accountId}/locations/${placeId}`;

    const url = `https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=10&orderBy=updateTime desc`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`GMB Reviews API error: ${errorData.error?.message || response.statusText}`);
        }

        const rawData = await response.json();
        const validatedData = GmbListReviewsResponseSchema.parse(rawData);
        return validatedData.reviews || [];
    } catch (error: any) {
        console.error(`[GmbApiAdapter] Error fetching reviews for ${locationName}:`, error);
        // Return empty array on error to not break the entire cache process
        return [];
    }
}
