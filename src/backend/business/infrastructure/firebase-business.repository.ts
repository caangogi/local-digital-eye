import type { Business } from '../domain/business.entity';
import { BusinessSchema } from '../domain/business.entity';
import type { BusinessRepositoryPort } from '../domain/business.repository.port';
import { firestore } from '@/lib/firebase/firebase-admin-config';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * @fileoverview Implements the BusinessRepositoryPort using Firebase Firestore.
 * This class handles all database operations related to business entities.
 */
export class FirebaseBusinessRepository implements BusinessRepositoryPort {
  private readonly collection = firestore.collection('businesses');

  /**
   * Saves a business's data (creates or updates).
   * It handles conversion of Date objects to Firestore Timestamps.
   * @param business The business object to be persisted.
   * @returns A promise that resolves to the saved Business object.
   */
  async save(business: Business): Promise<Business> {
    const validatedBusiness = BusinessSchema.parse(business);
    const { id, ...businessData } = validatedBusiness;
    
    // Convert JS Date to Firestore Timestamp before saving
    const dataToSave: any = { ...businessData };
    if (businessData.gmbTokenExpiryDate) {
      dataToSave.gmbTokenExpiryDate = Timestamp.fromDate(businessData.gmbTokenExpiryDate);
    }

    await this.collection.doc(id).set(dataToSave, { merge: true });
    return validatedBusiness;
  }

  /**
   * Finds a business by its unique ID (which is the placeId).
   * It handles conversion of Firestore Timestamps to JS Date objects.
   * @param id The unique identifier of the business.
   * @returns A promise that resolves to the Business object or null if not found.
   */
  async findById(id: string): Promise<Business | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    
    // Convert Firestore Timestamp to JS Date after fetching
    const rawData = { id: doc.id, ...data };
    if (data?.gmbTokenExpiryDate && data.gmbTokenExpiryDate instanceof Timestamp) {
        rawData.gmbTokenExpiryDate = data.gmbTokenExpiryDate.toDate();
    }

    try {
      return BusinessSchema.parse(rawData);
    } catch (error) {
      console.error(`[FirebaseBusinessRepository] Invalid data for business ${id}:`, error);
      return null;
    }
  }

  /**
   * Finds all businesses connected to a specific user.
   * It handles conversion of Firestore Timestamps to JS Date objects.
   * @param userId The ID of the user.
   * @returns A promise that resolves to an array of Business objects.
   */
  async findByUserId(userId: string): Promise<Business[]> {
    const snapshot = await this.collection.where('userId', '==', userId).get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => {
        const data = doc.data();
        const rawData = { id: doc.id, ...data };
        if (data?.gmbTokenExpiryDate && data.gmbTokenExpiryDate instanceof Timestamp) {
            rawData.gmbTokenExpiryDate = data.gmbTokenExpiryDate.toDate();
        }

        try {
            return BusinessSchema.parse(rawData);
        } catch (error) {
            console.error(`[FirebaseBusinessRepository] Invalid data in findByUserId for doc ${doc.id}:`, error);
            return null;
        }
    }).filter((b): b is Business => b !== null);
  }

  /**
   * Deletes a business by its unique ID.
   * @param id The unique identifier of the business to delete.
   * @returns A promise that resolves to void when the operation is complete.
   */
  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
