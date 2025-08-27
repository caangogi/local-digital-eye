import type { BusinessRepositoryPort } from '../domain/business.repository.port';

/**
 * @fileoverview Defines the use case for disconnecting (deleting) a business from the system.
 */

export class DisconnectBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepositoryPort) {}

  /**
   * Executes the use case to disconnect a business.
   * It also needs to check if the user performing the action has the permission to do so.
   * @param businessId The ID of the business to disconnect.
   * @param userId The ID of the user initiating the action for authorization.
   * @returns A promise that resolves when the operation is complete.
   */
  async execute(businessId: string, userId: string): Promise<void> {
    console.log(`[DisconnectBusinessUseCase] User ${userId} is attempting to disconnect business ${businessId}`);
    
    // Authorization check: Ensure the user owns the business before deleting.
    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new Error("Business not found.");
    }

    if (business.userId !== userId) {
      throw new Error("User is not authorized to disconnect this business.");
    }
    
    return this.businessRepository.delete(businessId);
  }
}
