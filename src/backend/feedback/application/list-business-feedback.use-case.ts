
import type { Feedback } from '../domain/feedback.entity';
import type { FeedbackRepositoryPort } from '../domain/feedback.repository.port';

/**
 * @fileoverview Defines the use case for listing all feedback for a specific business.
 */

export class ListBusinessFeedbackUseCase {
  constructor(
    private readonly feedbackRepository: FeedbackRepositoryPort
  ) {}

  /**
   * Executes the use case.
   * @param businessId The ID of the business whose feedback is to be listed.
   * @returns A promise that resolves to an array of Feedback objects.
   */
  async execute(businessId: string): Promise<Feedback[]> {
    console.log(`[ListBusinessFeedbackUseCase] Fetching all feedback for business ${businessId}`);
    // This assumes the repository has a method to find all feedback for a business.
    const feedbackItems = await this.feedbackRepository.findByBusinessId(businessId);
    return feedbackItems;
  }
}
