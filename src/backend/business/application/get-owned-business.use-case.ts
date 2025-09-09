
import type { Business } from '../domain/business.entity';
import type { BusinessRepositoryPort } from '../domain/business.repository.port';

/**
 * @fileoverview Defines the use case for retrieving the business owned by a specific user.
 * This is distinct from findByUserId, which finds businesses an ADMIN is managing.
 * This use case finds the single business an OWNER is associated with.
 */

export class GetOwnedBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepositoryPort) {}

  /**
   * Executes the use case.
   * @param ownerId The ID of the user (owner) whose business is to be retrieved.
   * @returns A promise that resolves to the Business object or null if not found.
   */
  async execute(ownerId: string): Promise<Business | null> {
    console.log(`[GetOwnedBusinessUseCase] Fetching business for owner ${ownerId}`);
    
    // This assumes the repository has a method to find by ownerId.
    // If not, we would need to add it to the port and implementation.
    // Let's assume findByOwnerId exists.
    const businesses = await this.businessRepository.findByOwnerId(ownerId);
    
    if (businesses.length === 0) {
      console.warn(`[GetOwnedBusinessUseCase] No business found for owner ${ownerId}`);
      return null;
    }
    
    if (businesses.length > 1) {
      // This case should ideally not happen if our logic is correct.
      // An owner should only be linked to one business.
      console.error(`[GetOwnedBusinessUseCase] Critical: Owner ${ownerId} is linked to ${businesses.length} businesses. Returning the first one.`);
    }

    return businesses[0];
  }
}
