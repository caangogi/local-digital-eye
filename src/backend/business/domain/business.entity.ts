import { z } from 'zod';

/**
 * @fileoverview Defines the Business entity for the domain layer.
 * This represents a business connected to a user in the system.
 */

// Schemas for nested objects from Google Places API
const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const PhotoSchema = z.object({
  name: z.string(),
  widthPx: z.number(),
  heightPx: z.number(),
  authorAttributions: z.array(z.any()).optional(), // Keeping it simple
});

const OpeningHoursSchema = z.object({
  openNow: z.boolean().optional(),
  weekdayDescriptions: z.array(z.string()).optional(),
});

export const BusinessSchema = z.object({
  id: z.string().describe("Unique identifier for the business, typically the Google Place ID."),
  userId: z.string().describe("The ID of the user who connected this business."),
  name: z.string().describe("The official name of the business."),
  placeId: z.string().describe("The Google Place ID for this business."),
  reviewLink: z.string().url().describe("The direct URL for a user to write a Google review."),
  
  // GMB OAuth Credentials
  gmbStatus: z.enum(['unlinked', 'linked', 'revoked']).optional().default('unlinked').describe("The status of the Google My Business connection."),
  gmbAccessToken: z.string().optional().describe("Short-lived access token for GMB API."),
  gmbRefreshToken: z.string().optional().describe("Long-lived refresh token for GMB API."),
  gmbTokenExpiryDate: z.date().optional().describe("Expiry date of the access token."),
  
  // Enriched public business data from Google Places API
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().optional(),
  category: z.string().optional(),
  gmbPageUrl: z.string().url().optional(),
  businessStatus: z.string().optional(),
  location: LocationSchema.optional(),
  photos: z.array(PhotoSchema).optional().default([]), // Default to empty array
  openingHours: OpeningHoursSchema.optional(),
});

export type Business = z.infer<typeof BusinessSchema>;
