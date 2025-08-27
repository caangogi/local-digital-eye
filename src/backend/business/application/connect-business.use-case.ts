import type { Business } from '../domain/business.entity';
import type { BusinessRepositoryPort } from '../domain/business.repository.port';
import { getGooglePlaceDetails } from '@/services/googleMapsService';

/**
 * @fileoverview Defines the use case for connecting a business to a user.
 * This involves creating a new business entity in our system based on external data.
 */

interface ConnectBusinessInput {
    userId: string;
    placeId: string;
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
    const { userId, placeId } = input;

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

    // Fetch full, enriched data from Google Places Details API
    const gmbData = await getGooglePlaceDetails(placeId);

    if (!gmbData || !gmbData.name) {
        throw new Error(`Could not fetch complete details for placeId ${placeId} from Google.`);
    }
    
    // Create a new Business entity from the enriched data
    const businessToSave: Business = {
      id: placeId,
      userId: userId,
      placeId: placeId,
      name: gmbData.name,
      reviewLink: `https://search.google.com/local/writereview?placeid=${placeId}`,
      
      // Add all the enriched public data from the details call
      address: gmbData.formattedAddress,
      phone: gmbData.internationalPhoneNumber,
      website: gmbData.websiteUri,
      rating: gmbData.rating,
      reviewCount: gmbData.userRatingCount,
      category: gmbData.types?.[0],
      gmbPageUrl: `https://www.google.com/maps/search/?api=1&query_id=${placeId}`,
      businessStatus: gmbData.businessStatus,
      location: gmbData.location,
      photos: gmbData.photos,
      openingHours: gmbData.openingHours,
    };

    // Save the business to our database
    return this.businessRepository.save(businessToSave);
  }
}
