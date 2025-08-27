import { z } from 'zod';

/**
 * @fileoverview Defines the Business entity for the domain layer.
 * This represents a business connected to a user in the system.
 */

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
});

export type Business = z.infer<typeof BusinessSchema>;
