
import type { Business } from '../domain/business.entity';
import type { BusinessRepositoryPort } from '../domain/business.repository.port';

/**
 * @fileoverview Defines the use case for updating the editable details of a business.
 */

interface UpdateBusinessDetailsInput {
    businessId: string;
    userId: string; // To ensure the user is authorized
    details: Partial<Omit<Business, 'id' | 'userId'>>;
}

export class UpdateBusinessDetailsUseCase {
  constructor(
    private readonly businessRepository: BusinessRepositoryPort
  ) {}

  /**
   * Executes the use case to update business details.
   * @param input The data required for the update.
   * @returns The updated Business object.
   */
  async execute(input: UpdateBusinessDetailsInput): Promise<Business> {
    const { businessId, userId, details } = input;
    
    console.log(`[UpdateBusinessDetailsUseCase] User ${userId} updating details for business ${businessId}`);

    // 1. Fetch the business to ensure it exists and the user is authorized.
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new Error("Business not found.");
    }

    if (business.userId !== userId) {
      throw new Error("User is not authorized to update this business.");
    }

    // 2. Merge the new details with the existing business data.
    // This ensures we only update the fields that are passed in.
    const updatedBusinessData: Business = {
      ...business,
      ...details,
    };
    
    // 3. Save the updated business back to the repository.
    const savedBusiness = await this.businessRepository.save(updatedBusinessData);

    console.log(`[UpdateBusinessDetailsUseCase] Successfully updated details for business ${businessId}`);
    return savedBusiness;
  }
}
