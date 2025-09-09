'use server';

import { getGoogleOAuthClient } from '@/lib/google-oauth-client';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase/firebase-admin-config';

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

  // Get the current user's ID from their session cookie to pass in the state
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    throw new Error('User is not authenticated.');
  }
  const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
  const userId = decodedToken.uid;


  const oauth2Client = getGoogleOAuthClient();

  const scopes = [
    // This scope is required to access Google Business Profile information
    'https://www.googleapis.com/auth/business.manage'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' is required to get a refresh token
    prompt: 'consent', // Force the consent screen to be shown, which helps in getting a refresh token on re-authorization.
    scope: scopes,
    // The 'state' parameter is used to pass data through the OAuth flow.
    // We'll encode the businessId AND the userId here to retrieve them in the callback.
    state: Buffer.from(JSON.stringify({ businessId: validatedBusinessId, userId: userId })).toString('base64'),
  });

  console.log(`[OAuthAction] Generated consent URL for business ${validatedBusinessId} and user ${userId}`);
  return url;
}
