
import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuthClient } from '@/lib/google-oauth-client';
import { FirebaseBusinessRepository } from '@/backend/business/infrastructure/firebase-business.repository';
import { SaveGmbTokensUseCase } from '@/backend/business/application/save-gmb-tokens.use-case';
import { FirebaseUserRepository } from '@/backend/user/infrastructure/firebase-user.repository';
import { GetBusinessDetailsUseCase } from '@/backend/business/application/get-business-details.use-case';
import { auth } from '@/lib/firebase/firebase-admin-config';

/**
 * Handles the OAuth 2.0 callback from Google.
 * This is where the user is redirected after granting (or denying) permissions.
 */
export async function GET(request: NextRequest) {
  console.log('[OAuth Callback] Received request from Google.');

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const businessRepository = new FirebaseBusinessRepository();
  const saveGmbTokensUseCase = new SaveGmbTokensUseCase(businessRepository);
  const getBusinessDetailsUseCase = new GetBusinessDetailsUseCase(businessRepository);
  
  // The base URL of your application, needed for the final redirect.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  // Handle cases where the user denied access or an error occurred.
  if (error || !code || !state) {
    console.error(`[OAuth Callback] Error or missing parameters. Error: ${error}, Code: ${code}, State: ${state}`);
    const redirectUrl = new URL('/businesses', baseUrl);
    redirectUrl.searchParams.set('error', 'oauth_failed');
    redirectUrl.searchParams.set('error_description', error || 'The authorization process was cancelled or failed.');
    return NextResponse.redirect(redirectUrl);
  }

  let businessName = '';
  try {
    // Decode the state to get the businessId
    const { businessId, userId } = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    if (!businessId || !userId) {
      throw new Error('Invalid state: businessId or userId is missing.');
    }
    console.log(`[OAuth Callback] Processing callback for businessId: ${businessId} and userId: ${userId}`);
    
    // Set user custom claim to 'owner' if it's not already set
    const userRecord = await auth.getUser(userId);
    if (userRecord.customClaims?.role !== 'owner') {
        await auth.setCustomUserClaims(userId, { ...userRecord.customClaims, role: 'owner' });
        console.log(`[OAuth Callback] Set custom claim 'role: owner' for user ${userId}`);
    }

    const business = await getBusinessDetailsUseCase.execute(businessId);
    if(business) {
        businessName = business.name;
    }


    // Exchange the authorization code for tokens
    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    console.log('[OAuth Callback] Tokens received from Google.');

    if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to retrieve access or refresh token from Google.');
    }

    // Save the tokens and link the owner to the business entity in Firestore
    await saveGmbTokensUseCase.execute({
        businessId,
        ownerId: userId, // CRITICAL: Link the owner ID to the business
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    });
    console.log(`[OAuth Callback] Tokens and ownerId saved successfully for businessId: ${businessId}`);

    // Redirect the user back to their dashboard with a success message
    const redirectUrl = new URL('/dashboard', baseUrl); // Redirect owner to their dashboard
    redirectUrl.searchParams.set('success', 'oauth_completed');
    redirectUrl.searchParams.set('business_name', businessName);
    return NextResponse.redirect(redirectUrl);

  } catch (e: any) {
    console.error('[OAuth Callback] A critical error occurred:', e);
    // Redirect to the dashboard with an error. The user is likely logged in at this point.
    const redirectUrl = new URL('/dashboard', baseUrl); 
    redirectUrl.searchParams.set('error', 'oauth_critical_error');
    redirectUrl.searchParams.set('error_description', e.message || 'An unexpected error occurred during the OAuth callback.');
    return NextResponse.redirect(redirectUrl);
  }
}
