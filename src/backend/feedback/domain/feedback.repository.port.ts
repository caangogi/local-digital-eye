import type { Feedback } from './feedback.entity';

/**
 * @fileoverview Defines the port for the feedback repository.
 * This interface abstracts data persistence for feedback entities.
 */
export interface FeedbackRepositoryPort {
  
  /**
   * Saves a feedback entry (creates a new one).
   * @param feedback The feedback data to be persisted (without id and createdAt, which are generated).
   * @returns A promise that resolves to the full Feedback object with its new ID and timestamp.
   */
  save(feedback: Omit<Feedback, 'id' | 'createdAt'>): Promise<Feedback>;

  /**
   * Finds a feedback entry by its unique ID.
   * @param id The unique identifier of the feedback.
   * @returns A promise that resolves to the Feedback object or null if not found.
   */
  findById(id: string): Promise<Feedback | null>;

  /**
   * Finds all feedback for a specific business.
   * @param businessId The ID of the business.
   * @returns A promise that resolves to an array of Feedback objects.
   */
  findByBusinessId(businessId: string): Promise<Feedback[]>;
}
