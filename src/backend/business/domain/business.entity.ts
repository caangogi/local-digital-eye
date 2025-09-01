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
  address: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  rating: z.number().min(0).max(5).nullable().optional(),
  reviewCount: z.number().int().nullable().optional(),
  category: z.string().nullable().optional(),
  gmbPageUrl: z.string().url().nullable().optional(),
  businessStatus: z.string().nullable().optional(),
  location: LocationSchema.nullable().optional(),
  photos: z.array(PhotoSchema).optional().default([]), // Default to empty array
  openingHours: OpeningHoursSchema.nullable().optional(),

  // CRM Fields for Sales Pipeline
  leadScore: z.number().min(0).max(10).optional().nullable().describe("A score from 0-10 indicating lead potential."),
  salesStatus: z.enum(['new', 'contacted', 'follow_up', 'closed_won', 'closed_lost']).optional().default('new').describe("The current stage of the business in the sales pipeline."),
  customTags: z.array(z.string()).optional().default([]).describe("Custom tags for filtering and organization."),
  nextContactDate: z.date().optional().nullable().describe("Scheduled date for the next follow-up."),
  notes: z.string().optional().nullable().describe("Internal notes from the sales team."),
});

export type Business = z.infer<typeof BusinessSchema>;
