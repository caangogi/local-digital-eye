import type { Feedback } from '../domain/feedback.entity';
import type { FeedbackRepositoryPort } from '../domain/feedback.repository.port';

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
  constructor(
    private readonly feedbackRepository: FeedbackRepositoryPort
  ) {}

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
    return this.feedbackRepository.save(feedbackToSave);
  }
}
