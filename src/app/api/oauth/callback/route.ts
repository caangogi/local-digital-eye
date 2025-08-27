
import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuthClient } from '@/lib/google-oauth-client';
import { FirebaseBusinessRepository } from '@/backend/business/infrastructure/firebase-business.repository';
import { SaveGmbTokensUseCase } from '@/backend/business/application/save-gmb-tokens.use-case';
import { FirebaseUserRepository } from '@/backend/user/infrastructure/firebase-user.repository';
import { GetBusinessDetailsUseCase } from '@/backend/business/application/get-business-details.use-case';

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
  const baseUrl = request.nextUrl.origin;

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
    const { businessId } = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
    if (!businessId) {
      throw new Error('Invalid state: businessId is missing.');
    }
    console.log(`[OAuth Callback] Processing callback for businessId: ${businessId}`);
    
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

    // Save the tokens to the business entity in Firestore
    await saveGmbTokensUseCase.execute({
        businessId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    });
    console.log(`[OAuth Callback] Tokens saved successfully for businessId: ${businessId}`);

    // Redirect the user back to the businesses page with a success message
    const redirectUrl = new URL('/businesses', baseUrl);
    redirectUrl.searchParams.set('success', 'oauth_completed');
    redirectUrl.searchParams.set('business_name', businessName); // Pass some identifier
    return NextResponse.redirect(redirectUrl);

  } catch (e: any) {
    console.error('[OAuth Callback] A critical error occurred:', e);
    const redirectUrl = new URL('/businesses', baseUrl);
    redirectUrl.searchParams.set('error', 'oauth_critical_error');
    redirectUrl.searchParams.set('error_description', e.message || 'An unexpected error occurred during the OAuth callback.');
    return NextResponse.redirect(redirectUrl);
  }
}
