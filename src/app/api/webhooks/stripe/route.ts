
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { getGoogleOAuthClient } from '@/lib/google-oauth-client';
import { FirebaseBusinessRepository } from '@/backend/business/infrastructure/firebase-business.repository';
import { SaveGmbTokensUseCase } from '@/backend/business/application/save-gmb-tokens.use-case';
import type { SubscriptionPlan } from '@/backend/business/domain/business.entity';

/**
 * @fileoverview This is the webhook endpoint for handling events from Stripe.
 * It's crucial for automating subscription management and provisioning services
 * after successful payments.
 */

// Define a type for the session metadata for clarity
type SessionMetadata = {
  businessId: string;
  userId: string;
  planType: SubscriptionPlan;
  gmb_auth_code: string;
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[Stripe Webhook] Error: STRIPE_WEBHOOK_SECRET is not set.');
    return new NextResponse('Webhook secret not configured', { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`[Stripe Webhook] ❌ Error verifying webhook signature: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const businessRepository = new FirebaseBusinessRepository();
  const saveGmbTokensUseCase = new SaveGmbTokensUseCase(businessRepository);
  
  // --- Handle specific Stripe events ---
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`[Stripe Webhook] Received checkout.session.completed for session: ${session.id}`);

      // Type-check metadata before proceeding
      const metadata = session.metadata as SessionMetadata | null;

      if (!metadata?.businessId || !metadata?.userId || !metadata?.planType || !metadata?.gmb_auth_code) {
        console.error(`[Stripe Webhook] Critical Error: Webhook for session ${session.id} is missing required metadata.`);
        // We return a 200 to Stripe to prevent retries for this unrecoverable error,
        // but log it as a critical issue to be investigated.
        return NextResponse.json({ received: true, error: "Missing metadata" });
      }

      try {
        console.log(`[Stripe Webhook] Processing GMB token exchange for business ${metadata.businessId}`);
        const oauth2Client = getGoogleOAuthClient();
        const { tokens } = await oauth2Client.getToken(metadata.gmb_auth_code);

        if (!tokens.access_token || !tokens.refresh_token) {
          throw new Error('Failed to retrieve access or refresh token from Google after payment.');
        }

        // --- Step 1: Finalize GMB Connection ---
        await saveGmbTokensUseCase.execute({
          businessId: metadata.businessId,
          ownerId: metadata.userId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
          plan: metadata.planType,
        });

        // --- Step 2: Update Business with Stripe Subscription Info ---
        const business = await businessRepository.findById(metadata.businessId);
        if (business) {
          business.stripeSubscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || null;
          business.stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
          business.subscriptionStatus = 'active'; // The user has paid, subscription is now active.
          
          await businessRepository.save(business);
          console.log(`[Stripe Webhook] Successfully activated subscription for business ${metadata.businessId}.`);
        } else {
            console.error(`[Stripe Webhook] Critical Error: Business ${metadata.businessId} not found after successful payment.`);
        }

      } catch (error: any) {
        console.error(`[Stripe Webhook] Error processing checkout session ${session.id}:`, error);
        // If this fails, we need to decide on a retry strategy or manual intervention.
        // For now, we'll return a 500 to signal failure to Stripe.
        return new NextResponse(`Webhook handler failed: ${error.message}`, { status: 500 });
      }
      break;

    case 'customer.subscription.updated':
      const subscriptionUpdated = event.data.object as Stripe.Subscription;
      console.log(`[Stripe Webhook] Received customer.subscription.updated: ${subscriptionUpdated.id}, Status: ${subscriptionUpdated.status}`);
      // TODO: Handle plan changes (upgrades/downgrades) or cancellations that are set to end of period.
      // e.g., find the business by stripeSubscriptionId and update its plan and status.
      break;
      
    case 'customer.subscription.deleted':
      const subscriptionDeleted = event.data.object as Stripe.Subscription;
      console.log(`[Stripe Webhook] Received customer.subscription.deleted: ${subscriptionDeleted.id}`);
      // TODO: Handle subscription cancellations.
      // Find the business by stripeSubscriptionId and update its status to 'canceled'.
      break;

    case 'invoice.payment_failed':
      const invoiceFailed = event.data.object as Stripe.Invoice;
      console.log(`[Stripe Webhook] Received invoice.payment_failed for subscription: ${invoiceFailed.subscription}`);
      // TODO: Handle failed renewal payments.
      // Find the business and update its status to 'past_due' or 'unpaid'.
      break;

    default:
      console.warn(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
