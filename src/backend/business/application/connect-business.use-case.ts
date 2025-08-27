import type { Business } from '../domain/business.entity';
import type { BusinessRepositoryPort } from '../domain/business.repository.port';
import type { GmbDataExtractionOutput } from '@/ai/flows/gmb-data-extraction-flow';

/**
 * @fileoverview Defines the use case for connecting a business to a user.
 * This involves creating a new business entity in our system based on external data.
 */

interface ConnectBusinessInput {
    userId: string;
    gmbData: GmbDataExtractionOutput;
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
    const { userId, gmbData } = input;
    const placeId = gmbData.placeId;

    if (!placeId) {
        throw new Error("Cannot connect a business without a valid Place ID.");
    }
    
    console.log(`[ConnectBusinessUseCase] User ${userId} attempting to connect business with placeId ${placeId}`);

    // Check if business is already connected
    const existingBusiness = await this.businessRepository.findById(placeId);
    if (existingBusiness) {
      if (existingBusiness.userId === userId) {
          console.log(`[ConnectBusinessUseCase] Business ${placeId} is already connected to user ${userId}.`);
          return existingBusiness;
      } else {
          throw new Error("This business is already connected by another user.");
      }
    }
    
    // Create a new Business entity from the input
    const businessToSave: Business = {
      id: placeId,
      userId: userId,
      placeId: placeId,
      name: gmbData.extractedName,
      reviewLink: `https://search.google.com/local/writereview?placeid=${placeId}`,
      // Add all the enriched public data
      address: gmbData.address,
      phone: gmbData.phone,
      website: gmbData.website,
      rating: gmbData.rating,
      reviewCount: gmbData.reviewCount,
      category: gmbData.category,
      gmbPageUrl: gmbData.gmbPageUrl,
      businessStatus: gmbData.businessStatus,
    };

    // Save the business to our database
    return this.businessRepository.save(businessToSave);
  }
}
