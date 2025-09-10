
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
import { GetBusinessDetailsUseCase } from '@/backend/business/application/get-business-details.use-case';
import { GetOwnedBusinessUseCase } from '@/backend/business/application/get-owned-business.use-case';
import { UpdateBusinessStatusUseCase } from '@/backend/business/application/update-business-status.use-case';
import { UpdateBusinessDetailsUseCase } from '@/backend/business/application/update-business-details.use-case';
import { ExtendTrialUseCase } from '@/backend/business/application/extend-trial.use-case';
import { UpdateSingleBusinessCacheUseCase } from '@/backend/business/application/update-single-business-cache.use-case';
import type { GmbDataExtractionOutput } from '@/ai/flows/gmb-data-extraction-flow';
import type { Business, SalesStatus } from '@/backend/business/domain/business.entity';
import { revalidatePath } from 'next/cache';
import type { Place } from '@/services/googleMapsService';
import type { GmbPerformanceResponse, GmbReview } from '@/services/googleMapsService';


// This function centralizes repository and use case instantiation.
function getBusinessUseCases() {
    const businessRepository = new FirebaseBusinessRepository();
    return {
        connectBusinessUseCase: new ConnectBusinessUseCase(businessRepository),
        listUserBusinessesUseCase: new ListUserBusinessesUseCase(businessRepository),
        getBusinessDetailsUseCase: new GetBusinessDetailsUseCase(businessRepository),
        getOwnedBusinessUseCase: new GetOwnedBusinessUseCase(businessRepository),
        updateBusinessStatusUseCase: new UpdateBusinessStatusUseCase(businessRepository),
        updateBusinessDetailsUseCase: new UpdateBusinessDetailsUseCase(businessRepository),
        extendTrialUseCase: new ExtendTrialUseCase(businessRepository),
        updateSingleBusinessCacheUseCase: new UpdateSingleBusinessCacheUseCase(businessRepository),
    };
}


/**
 * Connects a business to the currently logged-in user.
 * The searchResult only contains basic info. The full details are fetched inside the use case.
 * @param searchResult The business data from the initial Google search.
 * @returns An object indicating success or failure.
 */
export async function connectBusiness(searchResult: GmbDataExtractionOutput): Promise<{ success: boolean; message: string; businessId?: string; debugData?: Place | null; }> {
  try {
    // 1. Get current user from session cookie
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      return { success: false, message: 'Authentication required. Please log in again.' };
    }
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;
    const placeId = searchResult.placeId;

    if (!placeId) {
        return { success: false, message: 'Invalid business data provided. Place ID is required.' };
    }

    // 2. Instantiate and execute the use case
    const { connectBusinessUseCase } = getBusinessUseCases();
    const { business, rawData } = await connectBusinessUseCase.execute({
      userId: userId,
      placeId: placeId,
    });

    if (!business) {
      return { success: false, message: 'Failed to connect business.' };
    }
    
    revalidatePath('/businesses');

    console.log(`[BusinessAction] Successfully connected business ${business.id} to user ${userId}`);
    return { 
        success: true, 
        message: 'Business connected successfully!', 
        businessId: business.id, 
        debugData: rawData // Return raw data for debugging
    };

  } catch (error: any) {
    console.error('Error connecting business:', error);
    // Propagate the detailed error message to the client
    return { success: false, message: error.message || 'An unexpected error occurred while connecting the business.' };
  }
}


/**
 * Lists all businesses connected to the currently authenticated user (admin).
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
        const { listUserBusinessesUseCase } = getBusinessUseCases();
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

/**
 * Gets the business owned by the currently authenticated user (owner).
 * @returns A promise that resolves to a Business object or null.
 */
export async function getOwnedBusiness(): Promise<Business | null> {
    try {
        const sessionCookie = cookies().get('session')?.value;
        if (!sessionCookie) {
            console.log('[BusinessAction] No session cookie found for getOwnedBusiness. Returning null.');
            return null;
        }
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const ownerId = decodedToken.uid;

        console.log(`[BusinessAction] Fetching owned business for owner ${ownerId}`);
        const { getOwnedBusinessUseCase } = getBusinessUseCases();
        const business = await getOwnedBusinessUseCase.execute(ownerId);
        return business;

    } catch (error: any) {
         if (error.code === 'auth/session-cookie-expired' || error.code === 'auth/session-cookie-revoked') {
            console.log('[BusinessAction] Session cookie invalid for getOwnedBusiness. Returning null.');
            return null;
        }
        console.error('Error getting owned business:', error);
        return null;
    }
}


/**
 * Gets the public details of a specific business.
 * This action does not require authentication as it's for the public review page.
 * @param businessId The ID of the business to retrieve.
 * @returns A promise that resolves to a Business object or null if not found.
 */
export async function getBusinessDetails(businessId: string): Promise<Business | null> {
    try {
        console.log(`[BusinessAction] Fetching public details for business ${businessId}`);
        const { getBusinessDetailsUseCase } = getBusinessUseCases();
        const business = await getBusinessDetailsUseCase.execute(businessId);
        if (!business) {
            console.warn(`[BusinessAction] Business not found: ${businessId}`);
            return null;
        }
        return business;
    } catch (error: any) {
        console.error(`Error fetching business details for ${businessId}:`, error);
        return null; // Return null on error to prevent page crashes.
    }
}


/**
 * Updates the sales status of a business.
 * @param businessId The ID of the business to update.
 * @param newStatus The new sales status.
 * @returns An object indicating success or failure.
 */
export async function updateBusinessStatus(businessId: string, newStatus: SalesStatus): Promise<{ success: boolean; message: string }> {
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      return { success: false, message: 'Authentication required.' };
    }
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

    const { updateBusinessStatusUseCase } = getBusinessUseCases();
    await updateBusinessStatusUseCase.execute({
        businessId,
        userId,
        newStatus,
    });
    
    // Revalidate the path to ensure the UI updates with the new status
    revalidatePath('/businesses');

    return { success: true, message: 'Status updated successfully.' };
  } catch (error: any) {
    console.error('Error updating business status:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}

/**
 * Updates the editable CRM details of a business.
 * @param businessId The ID of the business to update.
 * @param detailsToUpdate The details to be updated.
 * @returns An object indicating success or failure.
 */
export async function updateBusinessCrmDetails(businessId: string, detailsToUpdate: Partial<Business>): Promise<{ success: boolean; message: string }> {
    try {
        const sessionCookie = cookies().get('session')?.value;
        if (!sessionCookie) {
            return { success: false, message: 'Authentication required.' };
        }
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const userId = decodedToken.uid;
        
        const { updateBusinessDetailsUseCase } = getBusinessUseCases();
        await updateBusinessDetailsUseCase.execute({
            businessId,
            userId,
            details: detailsToUpdate,
        });
        
        revalidatePath('/businesses');
        revalidatePath('/mi-negocio');

        return { success: true, message: 'Business details updated successfully.' };

    } catch (error: any) {
        console.error('Error updating business details:', error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}


/**
 * Extends the trial period for a business.
 * @param businessId The ID of the business.
 * @param daysToAdd The number of days to add to the trial.
 * @returns An object indicating success or failure.
 */
export async function extendBusinessTrial(businessId: string, daysToAdd: number): Promise<{ success: boolean; message: string }> {
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      return { success: false, message: 'Authentication required.' };
    }
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    const adminUserId = decodedToken.uid;
    
    const { extendTrialUseCase } = getBusinessUseCases();
    await extendTrialUseCase.execute({
      businessId,
      adminUserId,
      daysToAdd
    });

    revalidatePath('/businesses');
    revalidatePath('/dashboard'); // To update owner's dashboard if they're viewing it

    return { success: true, message: `Trial extended successfully by ${daysToAdd} days.` };

  } catch (error: any) {
    console.error('Error extending business trial:', error);
    return { success: false, message: error.message || 'An unexpected error occurred.' };
  }
}

/**
 * Refreshes the GMB data cache for a single business manually.
 * @param businessId The ID of the business to refresh.
 * @returns An object indicating success or failure.
 */
export async function refreshBusinessDataCache(businessId: string): Promise<{ 
    success: boolean; 
    message: string;
    rawData?: {
        performanceData: GmbPerformanceResponse,
        reviewsData: GmbReview[],
    }
}> {
    try {
        const sessionCookie = cookies().get('session')?.value;
        if (!sessionCookie) {
            return { success: false, message: 'Authentication required.' };
        }
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const ownerId = decodedToken.uid;

        console.log(`[BusinessAction] Manual cache refresh requested for business ${businessId} by owner ${ownerId}.`);

        const { updateSingleBusinessCacheUseCase } = getBusinessUseCases();
        const rawData = await updateSingleBusinessCacheUseCase.execute(businessId, ownerId);

        revalidatePath('/dashboard');

        return { success: true, message: 'Cache updated successfully.', rawData };

    } catch (error: any) {
        console.error(`Error refreshing cache for business ${businessId}:`, error);
        return { success: false, message: error.message || 'An unexpected error occurred.' };
    }
}
