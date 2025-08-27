'use server';

/**
 * @fileoverview Server Actions for business-related operations.
 * This file acts as the primary adapter between the frontend and the business backend use cases.
 */
import { auth } from '@/lib/firebase/firebase-admin-config';
import { cookies } from 'next/headers';
import { FirebaseBusinessRepository } from '@/backend/business/infrastructure/firebase-business.repository';
import { ConnectBusinessUseCase } from '@/backend/business/application/connect-business.use-case';
import { ListUserBusinessesUseCase } from '@/backend/business/application/list-user-businesses.use-case';
import type { GmbDataExtractionOutput } from '@/ai/flows/gmb-data-extraction-flow';
import type { Business } from '@/backend/business/domain/business.entity';

const businessRepository = new FirebaseBusinessRepository();
const connectBusinessUseCase = new ConnectBusinessUseCase(businessRepository);
const listUserBusinessesUseCase = new ListUserBusinessesUseCase(businessRepository);

/**
 * Connects a business to the currently logged-in user.
 * @param businessData The business data extracted from Google Places API.
 * @returns An object indicating success or failure.
 */
export async function connectBusiness(businessData: GmbDataExtractionOutput): Promise<{ success: boolean; message: string; businessId?: string }> {
  try {
    // 1. Get current user from session cookie
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      return { success: false, message: 'Authentication required. Please log in again.' };
    }
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

    if (!businessData.placeId || !businessData.extractedName) {
        return { success: false, message: 'Invalid business data provided. Place ID and name are required.' };
    }
    
    // The google maps url for writing a review is required.
    const reviewLink = `https://search.google.com/local/writereview?placeid=${businessData.placeId}`;

    // 2. Execute the use case
    const business = await connectBusinessUseCase.execute({
      placeId: businessData.placeId,
      name: businessData.extractedName,
      userId: userId,
      reviewLink: reviewLink,
    });

    if (!business) {
      return { success: false, message: 'Failed to connect business.' };
    }

    console.log(`[BusinessAction] Successfully connected business ${business.id} to user ${userId}`);
    return { success: true, message: 'Business connected successfully!', businessId: business.id };

  } catch (error: any) {
    console.error('Error connecting business:', error);
    // Avoid exposing detailed internal errors to the client
    return { success: false, message: error.message || 'An unexpected error occurred while connecting the business.' };
  }
}


/**
 * Lists all businesses connected to the currently authenticated user.
 * @returns A promise that resolves to an array of Business objects.
 */
export async function listUserBusinesses(): Promise<Business[]> {
    try {
        const sessionCookie = cookies().get('session')?.value;
        if (!sessionCookie) {
            console.log('[BusinessAction] No session cookie found. Returning empty list.');
            return [];
        }
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const userId = decodedToken.uid;

        console.log(`[BusinessAction] Fetching businesses for user ${userId}`);
        const businesses = await listUserBusinessesUseCase.execute(userId);
        return businesses;

    } catch (error: any) {
        if (error.code === 'auth/session-cookie-expired' || error.code === 'auth/session-cookie-revoked') {
            console.log('[BusinessAction] Session cookie invalid. Returning empty list.');
            return [];
        }
        console.error('Error listing user businesses:', error);
        return []; // Return empty array on error to prevent page crashes
    }
}
