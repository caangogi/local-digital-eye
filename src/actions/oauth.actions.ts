'use server';

import { getGoogleOAuthClient } from '@/lib/google-oauth-client';
import { z } from 'zod';

const GetConsentUrlInputSchema = z.object({
  businessId: z.string(),
});

/**
 * Generates a Google OAuth consent screen URL.
 * @param businessId The ID of the business to associate with the OAuth flow.
 * @returns A promise that resolves to the consent screen URL.
 */
export async function getGoogleOAuthConsentUrl(businessId: string): Promise<string> {
  const { businessId: validatedBusinessId } = GetConsentUrlInputSchema.parse({ businessId });

  const oauth2Client = getGoogleOAuthClient();

  const scopes = [
    // This scope is required to access Google Business Profile information
    'https://www.googleapis.com/auth/business.manage'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' is required to get a refresh token
    scope: scopes,
    // The 'state' parameter is used to pass data through the OAuth flow.
    // We'll encode the businessId here to retrieve it in the callback.
    state: Buffer.from(JSON.stringify({ businessId: validatedBusinessId })).toString('base64'),
  });

  console.log(`[OAuthAction] Generated consent URL for business ${validatedBusinessId}`);
  return url;
}
