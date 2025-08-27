import type { Business } from '../domain/business.entity';
import type { BusinessRepositoryPort } from '../domain/business.repository.port';

/**
 * @fileoverview Defines the use case for connecting a business to a user.
 * This involves creating a new business entity in our system based on external data.
 */

interface ConnectBusinessInput {
    placeId: string;
    name: string;
    userId: string;
    reviewLink: string;
}

export class ConnectBusinessUseCase {
  constructor(
    private readonly businessRepository: BusinessRepositoryPort
  ) {}

  /**
   * Executes the use case.
   * @param input The data required to create the business connection.
   * @returns The newly created and saved Business object.
   */
  async execute(input: ConnectBusinessInput): Promise<Business | null> {
    console.log(`[ConnectBusinessUseCase] User ${input.userId} attempting to connect business with placeId ${input.placeId}`);

    // Check if business is already connected
    const existingBusiness = await this.businessRepository.findById(input.placeId);
    if (existingBusiness) {
      // It could belong to another user, or already to this one.
      if (existingBusiness.userId === input.userId) {
          console.log(`[ConnectBusinessUseCase] Business ${input.placeId} is already connected to user ${input.userId}.`);
          // Optionally, return the existing business or throw a specific "already-exists" error.
          return existingBusiness;
      } else {
          // This is a business integrity issue. Two users cannot own the same placeId.
          throw new Error("This business is already connected by another user.");
      }
    }
    
    // Create a new Business entity from the input
    const businessToSave: Business = {
      id: input.placeId, // Use Google Place ID as our unique ID
      userId: input.userId,
      placeId: input.placeId,
      name: input.name,
      reviewLink: input.reviewLink,
    };

    // Save the business to our database
    return this.businessRepository.save(businessToSave);
  }
}
