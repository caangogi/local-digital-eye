
'use server';

import { getGoogleOAuthClient } from '@/lib/google-oauth-client';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase/firebase-admin-config';
import type { SubscriptionPlan } from '@/backend/business/domain/business.entity';

const GetConsentUrlInputSchema = z.object({
  businessId: z.string(),
  planType: z.enum(['freemium', 'professional', 'premium']),
  setupFee: z.number().optional(),
});

/**
 * Generates a Google OAuth consent screen URL.
 * @param businessId The ID of the business to associate with the OAuth flow.
 * @param planType The subscription plan selected during onboarding.
 * @param setupFee Optional setup fee in cents.
 * @returns A promise that resolves to the consent screen URL.
 */
export async function getGoogleOAuthConsentUrl(businessId: string, planType: SubscriptionPlan, setupFee?: number): Promise<string> {
  const { 
      businessId: validatedBusinessId, 
      planType: validatedPlanType,
      setupFee: validatedSetupFee,
  } = GetConsentUrlInputSchema.parse({ businessId, planType, setupFee });

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
  
  const statePayload = { 
    businessId: validatedBusinessId, 
    userId: userId, 
    planType: validatedPlanType,
    setupFee: validatedSetupFee,
  };

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 'offline' is required to get a refresh token
    prompt: 'consent', // Force the consent screen to be shown, which helps in getting a refresh token on re-authorization.
    scope: scopes,
    // The 'state' parameter is used to pass data through the OAuth flow.
    // We'll encode all necessary info to retrieve them in the callback.
    state: Buffer.from(JSON.stringify(statePayload)).toString('base64'),
  });

  console.log(`[OAuthAction] Generated consent URL with payload:`, statePayload);
  return url;
}

    