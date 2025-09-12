
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { FirebaseBusinessRepository } from '@/backend/business/infrastructure/firebase-business.repository';
import type { SubscriptionPlan } from '@/backend/business/domain/business.entity';

/**
 * @fileoverview This is the webhook endpoint for handling events from Stripe.
 */

// Define a type for the subscription metadata for clarity
type SubscriptionMetadata = {
  businessId: string;
  firebaseUID: string;
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
  
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log(`[Stripe Webhook] Received checkout.session.completed for session: ${session.id}`);

      const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
      if (!subscriptionId) {
        console.error(`[Stripe Webhook] Critical Error: checkout.session.completed event for session ${session.id} has no subscription ID.`);
        return NextResponse.json({ received: true, error: "Missing subscription ID" });
      }

      // Retrieve the full subscription object to get its metadata
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const metadata = subscription.metadata as SubscriptionMetadata;

      if (!metadata.businessId || !metadata.firebaseUID) {
        console.error(`[Stripe Webhook] Critical Error: Subscription ${subscriptionId} is missing required metadata.`);
        return NextResponse.json({ received: true, error: "Missing metadata" });
      }

      try {
        const business = await businessRepository.findById(metadata.businessId);
        if (business) {
          business.stripeSubscriptionId = subscription.id;
          business.stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
          business.subscriptionStatus = 'active';
          
          await businessRepository.save(business);
          console.log(`[Stripe Webhook] Successfully activated subscription for business ${metadata.businessId}.`);
        } else {
          console.error(`[Stripe Webhook] Critical Error: Business ${metadata.businessId} not found after successful payment.`);
        }
      } catch (error: any) {
        console.error(`[Stripe Webhook] Error processing checkout session ${session.id}:`, error);
        return new NextResponse(`Webhook handler failed: ${error.message}`, { status: 500 });
      }
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const metadata = subscription.metadata as SubscriptionMetadata;
      if (metadata.businessId) {
          const business = await businessRepository.findById(metadata.businessId);
          if (business) {
              business.subscriptionStatus = subscription.status;
              await businessRepository.save(business);
              console.log(`[Stripe Webhook] Updated subscription status for business ${metadata.businessId} to ${subscription.status}.`);
          }
      }
      break;
    }
      
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const metadata = subscription.metadata as SubscriptionMetadata;
       if (metadata.businessId) {
          const business = await businessRepository.findById(metadata.businessId);
          if (business) {
              business.subscriptionStatus = 'canceled';
              business.stripeSubscriptionId = null; // Clear the subscription ID
              await businessRepository.save(business);
              console.log(`[Stripe Webhook] Canceled subscription for business ${metadata.businessId}.`);
          }
       }
      break;
    }

    default:
      console.warn(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
