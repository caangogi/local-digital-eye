
import type { Business } from '../domain/business.entity';
import type { BusinessRepositoryPort } from '../domain/business.repository.port';

/**
 * @fileoverview Defines the use case for extending a business's trial period.
 */

interface ExtendTrialInput {
    businessId: string;
    adminUserId: string; // To ensure the user is authorized
    daysToAdd: number;
}

export class ExtendTrialUseCase {
  constructor(
    private readonly businessRepository: BusinessRepositoryPort
  ) {}

  /**
   * Executes the use case to extend a trial.
   * @param input The data required for the extension.
   * @returns The updated Business object.
   */
  async execute(input: ExtendTrialInput): Promise<Business> {
    const { businessId, adminUserId, daysToAdd } = input;
    
    console.log(`[ExtendTrialUseCase] Admin ${adminUserId} extending trial for business ${businessId} by ${daysToAdd} days.`);

    // 1. Fetch the business to ensure it exists and the user is authorized.
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new Error("Business not found.");
    }
    
    // Authorization check: Ensure the business belongs to the admin making the call.
    // In a multi-admin setup, you might check for a 'super_admin' role here as well.
    if (business.userId !== adminUserId) {
      throw new Error("User is not authorized to modify this business.");
    }
    
    // 2. Calculate the new trial end date.
    // If trialEndsAt doesn't exist or is in the past, base the new date on the current time.
    const now = new Date();
    const currentTrialEnd = business.trialEndsAt && business.trialEndsAt > now ? business.trialEndsAt : now;
    
    const newTrialEndsAt = new Date(currentTrialEnd);
    newTrialEndsAt.setDate(newTrialEndsAt.getDate() + daysToAdd);
    
    business.trialEndsAt = newTrialEndsAt;
    
    // If the trial had expired, set it back to 'trialing'.
    if (business.subscriptionStatus !== 'trialing') {
        business.subscriptionStatus = 'trialing';
    }


    // 3. Save the updated business back to the repository.
    const updatedBusiness = await this.businessRepository.save(business);

    console.log(`[ExtendTrialUseCase] Successfully extended trial for business ${businessId}. New end date: ${newTrialEndsAt.toISOString()}`);
    return updatedBusiness;
  }
}
