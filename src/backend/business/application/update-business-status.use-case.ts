
import type { Business, SalesStatus } from '../domain/business.entity';
import type { BusinessRepositoryPort } from '../domain/business.repository.port';

/**
 * @fileoverview Defines the use case for updating the sales status of a business.
 */

interface UpdateBusinessStatusInput {
    businessId: string;
    userId: string; // To ensure the user is authorized
    newStatus: SalesStatus;
}

export class UpdateBusinessStatusUseCase {
  constructor(
    private readonly businessRepository: BusinessRepositoryPort
  ) {}

  /**
   * Executes the use case to update the sales status.
   * @param input The data required for the update.
   * @returns The updated Business object.
   */
  async execute(input: UpdateBusinessStatusInput): Promise<Business> {
    const { businessId, userId, newStatus } = input;
    
    console.log(`[UpdateBusinessStatusUseCase] User ${userId} updating status of business ${businessId} to ${newStatus}`);

    // 1. Fetch the business to ensure it exists and the user is authorized.
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new Error("Business not found.");
    }

    if (business.userId !== userId) {
      throw new Error("User is not authorized to update this business.");
    }

    // 2. Update the status.
    business.salesStatus = newStatus;

    // 3. Save the updated business back to the repository.
    const updatedBusiness = await this.businessRepository.save(business);

    console.log(`[UpdateBusinessStatusUseCase] Successfully updated status for business ${businessId}`);
    return updatedBusiness;
  }
}
