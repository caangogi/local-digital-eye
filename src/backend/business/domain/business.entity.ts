import { z } from 'zod';

/**
 * @fileoverview Defines the Business entity for the domain layer.
 * This represents a business connected to a user in the system.
 */

// Schema for nested objects from Google Places API
const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const PhotoSchema = z.object({
  name: z.string(),
  widthPx: z.number().optional(),
  heightPx: z.number().optional(),
});

const OpeningHoursSchema = z.object({
  openNow: z.boolean().optional(),
  weekdayDescriptions: z.array(z.string()).optional(),
});

// New schema for a single review
export const ReviewSchema = z.object({
  authorName: z.string(),
  profilePhotoUrl: z.string().url().optional().nullable(),
  rating: z.number().min(1).max(5),
  text: z.string().optional().nullable(),
  publishTime: z.date().optional(),
});

export type Review = z.infer<typeof ReviewSchema>;

export const BusinessSchema = z.object({
  id: z.string().describe("Unique identifier for the business, typically the Google Place ID."),
  userId: z.string().describe("The ID of the user (sales agent) who connected this business."),
  ownerId: z.string().optional().nullable().describe("The ID of the user who owns the business."),
  name: z.string().describe("The official name of the business."),
  placeId: z.string().describe("The Google Place ID for this business."),
  reviewLink: z.string().url().describe("The direct URL for a user to write a Google review."),
  
  // GMB OAuth Credentials
  gmbStatus: z.enum(['unlinked', 'linked', 'revoked']).optional().default('unlinked').describe("The status of the Google My Business connection."),
  gmbAccessToken: z.string().optional().nullable(),
  gmbRefreshToken: z.string().optional().nullable(),
  gmbTokenExpiryDate: z.date().optional().nullable(),
  
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
  photos: z.array(PhotoSchema).optional().default([]),
  openingHours: OpeningHoursSchema.nullable().optional(),
  topReviews: z.array(ReviewSchema).optional().default([]).describe("A curated list of top reviews (4-5 stars)."),

  // CRM Fields for Sales Pipeline
  leadScore: z.number().min(0).max(10).optional().nullable().describe("A score from 0-10 indicating lead potential."),
  salesStatus: z.enum(['new', 'contacted', 'follow_up', 'closed_won', 'closed_lost']).optional().default('new').describe("The current stage of the business in the sales pipeline."),
  customTags: z.array(z.string()).optional().default([]).describe("Custom tags for filtering and organization."),
  nextContactDate: z.date().optional().nullable().describe("Scheduled date for the next follow-up."),
  notes: z.string().optional().nullable().describe("Internal notes from the sales team."),
});

export type Business = z.infer<typeof BusinessSchema>;
