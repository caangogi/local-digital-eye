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
          // Even if existing, we might want to return the raw data from a fresh API call for debugging.
          const gmbDataResult = await getGooglePlaceDetails(placeId);
          return { business: existingBusiness, rawData: gmbDataResult?.rawData || null };
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
    // The normalized data from the service already handles null values.
    const businessToSave: Business = {
      id: placeId,
      userId: userId,
      ownerId: null, // Initialize ownerId as null
      placeId: placeId,
      name: gmbData.name, // Name is guaranteed by the check above
      reviewLink: `https://search.google.com/local/writereview?placeid=${placeId}`,
      
      // Add all the enriched public data from our normalized Place object
      address: gmbData.formattedAddress,
      phone: gmbData.internationalPhoneNumber,
      website: gmbData.websiteUri,
      rating: gmbData.rating,
      reviewCount: gmbData.userRatingCount,
      category: gmbData.types?.[0] || null, // Take the first category as primary
      gmbPageUrl: `https://www.google.com/maps/search/?api=1&query_id=${placeId}`,
      businessStatus: gmbData.businessStatus,
      location: gmbData.location,
      photos: gmbData.photos,
      openingHours: gmbData.regularOpeningHours,

      // Initialize CRM fields with default values
      salesStatus: 'new',
      leadScore: null,
      customTags: [],
      nextContactDate: null,
      notes: null,
      gmbStatus: 'unlinked', // GMB connection is initially unlinked
    };

    // Save the business to our database
    const savedBusiness = await this.businessRepository.save(businessToSave);

    return { business: savedBusiness, rawData: gmbDataResult.rawData };
  }
}
