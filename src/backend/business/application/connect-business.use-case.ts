import type { Business } from '../domain/business.entity';
import type { BusinessRepositoryPort } from '../domain/business.repository.port';
import { getGooglePlaceDetails, type Place } from '@/services/googleMapsService';

/**
 * @fileoverview Defines the use case for connecting a business to a user.
 * This involves creating a new business entity in our system based on external data.
 */

interface ConnectBusinessInput {
    userId: string;
    placeId: string;
}

interface ConnectBusinessOutput {
    business: Business | null;
    rawData: Place | null;
}

export class ConnectBusinessUseCase {
  constructor(
    private readonly businessRepository: BusinessRepositoryPort
  ) {}

  /**
   * Executes the use case.
   * @param input The data required to create the business connection.
   * @returns The newly created and saved Business object and the raw data from the API.
   */
  async execute(input: ConnectBusinessInput): Promise<ConnectBusinessOutput> {
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
          return { business: existingBusiness, rawData: null };
      } else {
          throw new Error("This business is already connected by another user.");
      }
    }

    // Fetch full, enriched data from Google Places Details API
    const gmbDataResult = await getGooglePlaceDetails(placeId);

    if (!gmbDataResult || !gmbDataResult.normalizedData || !gmbDataResult.normalizedData.name) {
        throw new Error(`Could not fetch complete details for placeId ${placeId} from Google.`);
    }

    const gmbData = gmbDataResult.normalizedData;
    
    // Create a new Business entity from the enriched data
    // Ensure all optional fields are replaced with null if undefined to prevent Firestore errors.
    const businessToSave: Business = {
      id: placeId,
      userId: userId,
      placeId: placeId,
      name: gmbData.name,
      reviewLink: `https://search.google.com/local/writereview?placeid=${placeId}`,
      
      // Add all the enriched public data, ensuring no undefined values
      address: gmbData.formattedAddress || null,
      phone: gmbData.internationalPhoneNumber || null,
      website: gmbData.websiteUri || null,
      rating: gmbData.rating || null,
      reviewCount: gmbData.userRatingCount || null,
      category: gmbData.types?.[0] || null,
      gmbPageUrl: `https://www.google.com/maps/search/?api=1&query_id=${placeId}`,
      businessStatus: gmbData.businessStatus || null,
      location: gmbData.location || null,
      photos: gmbData.photos || [],
      openingHours: gmbData.regularOpeningHours || gmbData.currentOpeningHours || null,

      // Initialize CRM fields with default values
      salesStatus: 'new',
      leadScore: null,
      customTags: [],
      nextContactDate: null,
      notes: null,
      gmbStatus: 'unlinked',
    };

    // Save the business to our database
    const savedBusiness = await this.businessRepository.save(businessToSave);

    return { business: savedBusiness, rawData: gmbDataResult.rawData };
  }
}
