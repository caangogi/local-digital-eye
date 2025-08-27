import type { Business } from '../domain/business.entity';
import type { BusinessRepositoryPort } from '../domain/business.repository.port';

/**
 * @fileoverview Defines the use case for retrieving the details of a specific business.
 */

export class GetBusinessDetailsUseCase {
  constructor(private readonly businessRepository: BusinessRepositoryPort) {}

  /**
   * Executes the use case.
   * @param businessId The ID of the business to retrieve.
   * @returns A promise that resolves to the Business object or null if not found.
   */
  async execute(businessId: string): Promise<Business | null> {
    console.log(`[GetBusinessDetailsUseCase] Fetching details for business ${businessId}`);
    return this.businessRepository.findById(businessId);
  }
}
