import type { Business } from '../domain/business.entity';
import type { BusinessRepositoryPort } from '../domain/business.repository.port';

/**
 * @fileoverview Defines the use case for listing all businesses associated with a user.
 */

export class ListUserBusinessesUseCase {
  constructor(private readonly businessRepository: BusinessRepositoryPort) {}

  /**
   * Executes the use case.
   * @param userId The ID of the user whose businesses are to be listed.
   * @returns A promise that resolves to an array of Business objects.
   */
  async execute(userId: string): Promise<Business[]> {
    console.log(`[ListUserBusinessesUseCase] Fetching businesses for user ${userId}`);
    return this.businessRepository.findByUserId(userId);
  }
}
