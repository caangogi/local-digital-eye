
'use server';

import { stripe } from '@/lib/stripe';

/**
 * Creates a Stripe Customer Portal session and returns the URL.
 * @param stripeCustomerId The ID of the customer in Stripe.
 * @returns An object containing the URL to the portal session or an error message.
 */
export async function createStripePortalSession(stripeCustomerId: string): Promise<{ url?: string; error?: string }> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    
    try {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${baseUrl}/settings/billing`,
        });

        if (!portalSession.url) {
            throw new Error("Failed to create Stripe portal session: URL is null.");
        }

        return { url: portalSession.url };
    } catch (error: any) {
        console.error('[StripeAction] Error creating portal session:', error);
        return { error: error.message || "An unknown error occurred while creating the portal session." };
    }
}
