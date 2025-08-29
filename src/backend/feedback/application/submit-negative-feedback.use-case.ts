import type { Feedback } from '../domain/feedback.entity';
import type { FeedbackRepositoryPort } from '../domain/feedback.repository.port';
import { NotifyOwnerOfNegativeFeedbackUseCase } from '@/backend/business/application/notify-owner-of-negative-feedback.use-case';
import { FirebaseUserRepository } from '@/backend/user/infrastructure/firebase-user.repository';
import { FirebaseBusinessRepository } from '@/backend/business/infrastructure/firebase-business.repository';

/**
 * @fileoverview Defines the use case for submitting negative feedback.
 */

interface SubmitNegativeFeedbackInput {
    businessId: string;
    businessName: string;
    rating: number;
    comment: string;
    userName?: string;
    userEmail?: string;
}

export class SubmitNegativeFeedbackUseCase {
  private notifyOwnerUseCase: NotifyOwnerOfNegativeFeedbackUseCase;

  constructor(
    private readonly feedbackRepository: FeedbackRepositoryPort
  ) {
    // We instantiate the dependencies for the notification use case right here
    const userRepository = new FirebaseUserRepository();
    const businessRepository = new FirebaseBusinessRepository();
    this.notifyOwnerUseCase = new NotifyOwnerOfNegativeFeedbackUseCase(userRepository, businessRepository);
  }

  /**
   * Executes the use case.
   * @param input The data required to create the feedback entry.
   * @returns The newly created and saved Feedback object.
   */
  async execute(input: SubmitNegativeFeedbackInput): Promise<Feedback> {
    console.log(`[SubmitNegativeFeedbackUseCase] Processing feedback for business ${input.businessId}`);

    const feedbackToSave: Omit<Feedback, 'id' | 'createdAt'> = {
      businessId: input.businessId,
      businessName: input.businessName,
      rating: input.rating,
      comment: input.comment,
      status: 'new', // Default status for new feedback
      userName: input.userName,
      userEmail: input.userEmail,
    };

    // The repository will handle the creation of the ID and timestamp.
    const savedFeedback = await this.feedbackRepository.save(feedbackToSave);
    
    // After saving, trigger the notification flow
    if (savedFeedback) {
        try {
            console.log(`[SubmitNegativeFeedbackUseCase] Triggering notification for feedback ${savedFeedback.id}`);
            await this.notifyOwnerUseCase.execute(savedFeedback);
        } catch (notificationError) {
            // Log the error but don't fail the whole operation.
            // The feedback was saved, which is the most important part.
            console.error(`[SubmitNegativeFeedbackUseCase] Failed to trigger notification for feedback ${savedFeedback.id}:`, notificationError);
        }
    }
    
    return savedFeedback;
  }
}
