
import { NextRequest, NextResponse } from 'next/server';
import { getGoogleOAuthClient } from '@/lib/google-oauth-client';
import { FirebaseBusinessRepository } from '@/backend/business/infrastructure/firebase-business.repository';
import { SaveGmbTokensUseCase } from '@/backend/business/application/save-gmb-tokens.use-case';
import { GetBusinessDetailsUseCase } from '@/backend/business/application/get-business-details.use-case';
import { auth } from '@/lib/firebase/firebase-admin-config';
import { stripe } from '@/lib/stripe';
import type { SubscriptionPlan } from '@/backend/business/domain/business.entity';


export async function GET(request: NextRequest) {
  console.log('[OAuth Callback] Received request from Google.');

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const businessRepository = new FirebaseBusinessRepository();
  const getBusinessDetailsUseCase = new GetBusinessDetailsUseCase(businessRepository);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;

  if (error || !code || !state) {
    console.error(`[OAuth Callback] Error or missing parameters. Error: ${error}, Code: ${code}, State: ${state}`);
    const redirectUrl = new URL('/businesses', baseUrl);
    redirectUrl.searchParams.set('error', 'oauth_failed');
    redirectUrl.searchParams.set('error_description', error || 'The authorization process was cancelled or failed.');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const { businessId, userId, planType, setupFee } = JSON.parse(Buffer.from(state, 'base64').toString('utf-8')) as { businessId: string; userId: string; planType: SubscriptionPlan, setupFee?: number };
    if (!businessId || !userId || !planType) {
      throw new Error('Invalid state: businessId, userId, or planType is missing.');
    }
    console.log(`[OAuth Callback] Processing callback for businessId: ${businessId}, userId: ${userId}, planType: ${planType}, setupFee: ${setupFee}`);
    
    // --- Step 1: Immediately exchange code for tokens and save them ---
    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('Failed to retrieve access or refresh token from Google.');
    }
    
    const saveGmbTokensUseCase = new SaveGmbTokensUseCase(businessRepository);
    await saveGmbTokensUseCase.execute({
        businessId,
        ownerId: userId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    });
    console.log(`[OAuth Callback] Step 1 COMPLETE: Google tokens saved for business ${businessId}.`);

    // --- Step 2: Handle user role and get business details ---
    const userRecord = await auth.getUser(userId);
    if (userRecord.customClaims?.role !== 'owner') {
        await auth.setCustomUserClaims(userId, { ...userRecord.customClaims, role: 'owner' });
        console.log(`[OAuth Callback] Set custom claim 'role: owner' for user ${userId}`);
    }

    const business = await getBusinessDetailsUseCase.execute(businessId);
    if (!business) throw new Error(`Business with ID ${businessId} not found.`);

    // --- Step 3: Handle payment flow based on planType ---
    if (planType === 'freemium') {
        // For freemium, the process is complete. Update subscription status and redirect.
        business.subscriptionPlan = 'freemium';
        business.subscriptionStatus = 'trialing';
        const trialEnds = new Date();
        trialEnds.setDate(trialEnds.getDate() + 7);
        business.trialEndsAt = trialEnds;
        await businessRepository.save(business);

        console.log(`[OAuth Callback] Freemium plan processed for business ${businessId}. Redirecting to dashboard.`);
        const redirectUrl = new URL('/dashboard', baseUrl);
        redirectUrl.searchParams.set('success', 'oauth_completed');
        redirectUrl.searchParams.set('business_name', business.name);
        return NextResponse.redirect(redirectUrl);
    }

    // --- PAID PLAN LOGIC ---
    const professionalPriceId = process.env.STRIPE_PRICE_ID_PROFESSIONAL;
    const premiumPriceId = process.env.STRIPE_PRICE_ID_PREMIUM;
    if ((planType === 'professional' && !professionalPriceId) || (planType === 'premium' && !premiumPriceId)) {
        throw new Error("Stripe Price ID for the selected plan is not configured on the server.");
    }
    
    let stripeCustomerId = business.stripeCustomerId;
    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
            email: userRecord.email,
            name: userRecord.displayName,
            metadata: { firebaseUID: userId }
        });
        stripeCustomerId = customer.id;
    }

    const lineItems = [{
        price: planType === 'professional' ? professionalPriceId : premiumPriceId,
        quantity: 1,
    }];
    if (setupFee && setupFee > 0) {
      lineItems.push({
        price_data: { currency: 'eur', product_data: { name: 'Cuota de Alta y Configuración Inicial' }, unit_amount: setupFee },
        quantity: 1,
      });
    }

    const successUrl = new URL('/dashboard', baseUrl);
    successUrl.searchParams.set('payment', 'success');
    const cancelUrl = new URL('/dashboard', baseUrl);
    cancelUrl.searchParams.set('payment', 'cancelled');
    
    // Update the business with plan, customer ID, and pending status before redirecting
    business.subscriptionPlan = planType;
    business.stripeCustomerId = stripeCustomerId;
    business.subscriptionStatus = 'pending_payment';
    await businessRepository.save(business);
    console.log(`[OAuth Callback] Set business to 'pending_payment' for plan '${planType}'.`);

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: successUrl.toString(),
      cancel_url: cancelUrl.toString(),
      // We pass the businessId and userId to the subscription metadata, so the webhook can use it.
      subscription_data: {
        metadata: { firebaseUID: userId, businessId: businessId }
      },
    });

    if (!checkoutSession.url) {
      throw new Error("Failed to create Stripe Checkout session.");
    }

    console.log(`[OAuth Callback] Stripe Checkout session created for business ${businessId}. Redirecting to Stripe.`);
    return NextResponse.redirect(checkoutSession.url);

  } catch (e: any) {
    console.error('[OAuth Callback] A critical error occurred:', e);
    const redirectUrl = new URL('/dashboard', baseUrl); 
    redirectUrl.searchParams.set('error', 'oauth_critical_error');
    redirectUrl.searchParams.set('error_description', e.message || 'An unexpected error occurred during the OAuth callback.');
    return NextResponse.redirect(redirectUrl);
  }
}
