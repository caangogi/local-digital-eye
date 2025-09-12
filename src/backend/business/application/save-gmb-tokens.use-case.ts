
import type { BusinessRepositoryPort } from '../domain/business.repository.port';

/**
 * @fileoverview Defines the use case for saving GMB OAuth tokens to a business.
 * This use case ONLY handles the Google connection part. Subscription status is handled elsewhere.
 */

interface SaveGmbTokensInput {
    businessId: string;
    ownerId: string; // The ID of the user who owns the business.
    accessToken: string;
    refreshToken: string;
    expiryDate?: Date;
}

export class SaveGmbTokensUseCase {
  constructor(
    private readonly businessRepository: BusinessRepositoryPort
  ) {}

  /**
   * Executes the use case to save the tokens.
   * @param input The data required to save the tokens.
   */
  async execute(input: SaveGmbTokensInput): Promise<void> {
    console.log(`[SaveGmbTokensUseCase] Saving tokens for business ${input.businessId}`);

    // 1. Find the business
    const business = await this.businessRepository.findById(input.businessId);
    if (!business) {
      throw new Error(`Business with ID ${input.businessId} not found.`);
    }

    // 2. Update the business object with the new token and owner information
    business.gmbStatus = 'linked';
    business.ownerId = input.ownerId; // Assign the owner
    business.gmbAccessToken = input.accessToken;
    business.gmbRefreshToken = input.refreshToken;
    business.gmbTokenExpiryDate = input.expiryDate;

    // 3. Save the updated business object back to the repository
    await this.businessRepository.save(business);
    console.log(`[SaveGmbTokensUseCase] Successfully updated tokens and owner for business ${input.businessId}`);
  }
}
