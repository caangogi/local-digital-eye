
'use server';

/**
 * @fileoverview Server Actions for feedback-related operations.
 */
import { FirebaseFeedbackRepository } from '@/backend/feedback/infrastructure/firebase-feedback.repository';
import { SubmitNegativeFeedbackUseCase } from '@/backend/feedback/application/submit-negative-feedback.use-case';
import type { Feedback } from '@/backend/feedback/domain/feedback.entity';

const feedbackRepository = new FirebaseFeedbackRepository();
const submitNegativeFeedbackUseCase = new SubmitNegativeFeedbackUseCase(feedbackRepository);

interface SubmitFeedbackInput {
    businessId: string;
    businessName: string;
    rating: number;
    comment: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string; // Added phone
}

/**
 * Submits negative feedback from a customer.
 * This is a public action and does not require user authentication.
 * @param feedbackData The feedback data submitted by the customer.
 * @returns An object indicating success or failure.
 */
export async function submitNegativeFeedback(feedbackData: SubmitFeedbackInput): Promise<{ success: boolean; message: string; }> {
  try {
    console.log(`[FeedbackAction] Received negative feedback for business ${feedbackData.businessId}`);
    
    // We get the business owner's user ID from the business entity itself.
    // This part is simplified; in a real app, we'd fetch the business to get the owner's ID.
    // For now, we assume the business object contains the necessary userId.

    const feedbackToSave = {
      ...feedbackData,
      // The use case will generate the ID and timestamp.
    };

    const savedFeedback = await submitNegativeFeedbackUseCase.execute(feedbackToSave);

    if (!savedFeedback) {
      return { success: false, message: 'Failed to save feedback.' };
    }

    console.log(`[FeedbackAction] Successfully saved feedback ${savedFeedback.id}`);
    
    // In the future, trigger a notification flow here.
    // e.g., await notifyOwnerOfNegativeFeedback(savedFeedback);

    return { success: true, message: 'Feedback submitted successfully!' };

  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return { success: false, message: error.message || 'An unexpected error occurred while submitting feedback.' };
  }
}
