
'use server';

/**
 * @fileoverview Server Actions for the business owner onboarding process.
 */
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { auth } from '@/lib/firebase/firebase-admin-config';
import { cookies } from 'next/headers';
import { FirebaseBusinessRepository } from '@/backend/business/infrastructure/firebase-business.repository';

const OnboardingLinkInputSchema = z.object({
  businessId: z.string(),
  planType: z.enum(['freemium', 'professional', 'premium']).default('freemium'),
});

type OnboardingLinkInput = z.infer<typeof OnboardingLinkInputSchema>;

/**
 * Generates a unique, secure onboarding link for a business owner.
 * @param input The data required to generate the link.
 * @returns A promise that resolves to the full onboarding URL.
 */
export async function generateOnboardingLink(input: OnboardingLinkInput): Promise<string> {
  // 1. Validate input
  const { businessId, planType } = OnboardingLinkInputSchema.parse(input);

  // 2. Authorize the action (ensure the user is an admin and owns the business)
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    throw new Error('Authentication required.');
  }
  const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
  const userId = decodedToken.uid;

  const businessRepository = new FirebaseBusinessRepository();
  const business = await businessRepository.findById(businessId);

  if (!business) {
    throw new Error('Business not found.');
  }
  if (business.userId !== userId) {
    throw new Error('You are not authorized to generate a link for this business.');
  }

  // 3. Get JWT secret from environment variables
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('[OnboardingAction] JWT_SECRET is not set in environment variables.');
    throw new Error('Server configuration error.');
  }

  // 4. Create JWT payload
  const payload = {
    businessId,
    planType,
  };

  // 5. Sign the token
  const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' }); // Token is valid for 7 days
  console.log(`[OnboardingAction] Generated onboarding token for business ${businessId}`);

  // 6. Construct the final URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
  const onboardingUrl = new URL('/onboarding', baseUrl);
  onboardingUrl.searchParams.set('token', token);

  return onboardingUrl.toString();
}
