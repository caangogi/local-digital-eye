
'use server';

import { stripe } from '@/lib/stripe';

/**
 * Creates a Stripe Customer Portal session and returns the URL.
 * @param stripeCustomerId The ID of the customer in Stripe.
 * @returns An object containing the URL to the portal session.
 */
export async function createStripePortalSession(stripeCustomerId: string): Promise<{ url: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    
    // The return_url is where the user will be sent after they are done
    // managing their billing in the portal.
    const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${baseUrl}/settings/billing`,
    });

    if (!portalSession.url) {
        throw new Error("Failed to create Stripe portal session.");
    }

    return { url: portalSession.url };
}

