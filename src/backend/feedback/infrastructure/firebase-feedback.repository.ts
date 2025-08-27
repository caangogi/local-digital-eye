import type { Feedback } from '../domain/feedback.entity';
import { FeedbackSchema } from '../domain/feedback.entity';
import type { FeedbackRepositoryPort } from '../domain/feedback.repository.port';
import { firestore } from '@/lib/firebase/firebase-admin-config';
import { FieldValue } from 'firebase-admin/firestore';


/**
 * @fileoverview Implements the FeedbackRepositoryPort using Firebase Firestore.
 */
export class FirebaseFeedbackRepository implements FeedbackRepositoryPort {
  private readonly collection = firestore.collection('feedback');

  /**
   * Saves a new feedback entry to Firestore.
   * @param feedbackData The feedback data to save.
   * @returns A promise that resolves to the complete Feedback object.
   */
  async save(feedbackData: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback> {
    const docRef = this.collection.doc(); // Firestore auto-generates an ID
    const newFeedback = {
      ...feedbackData,
      createdAt: FieldValue.serverTimestamp(), // Use server timestamp for reliability
    };

    await docRef.set(newFeedback);

    const savedDoc = await docRef.get();
    const data = savedDoc.data();
    
    // Convert Firestore Timestamp to JS Date
    const validatedData = {
        id: savedDoc.id,
        ...data,
        createdAt: data?.createdAt.toDate(),
    }

    return FeedbackSchema.parse(validatedData);
  }

  /**
   * Finds a feedback entry by its unique ID.
   * @param id The unique identifier of the feedback.
   * @returns A promise that resolves to the Feedback object or null if not found.
   */
  async findById(id: string): Promise<Feedback | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    try {
        const validatedData = {
            id: doc.id,
            ...data,
            createdAt: data?.createdAt.toDate(),
        }
      return FeedbackSchema.parse(validatedData);
    } catch (error) {
      console.error(`[FirebaseFeedbackRepository] Invalid data for feedback ${id}:`, error);
      return null;
    }
  }

  /**
   * Finds all feedback for a specific business.
   * @param businessId The ID of the business.
   * @returns A promise that resolves to an array of Feedback objects.
   */
  async findByBusinessId(businessId: string): Promise<Feedback[]> {
    const snapshot = await this.collection.where('businessId', '==', businessId).orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => {
        try {
            const data = doc.data();
            const validatedData = {
                id: doc.id,
                ...data,
                createdAt: data?.createdAt.toDate(),
            }
            return FeedbackSchema.parse(validatedData);
        } catch (error) {
            console.error(`[FirebaseFeedbackRepository] Invalid data in findByBusinessId for doc ${doc.id}:`, error);
            return null;
        }
    }).filter((f): f is Feedback => f !== null);
  }
}
