import type { Business, Review } from '../domain/business.entity';
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
    
    // Filter for top reviews (4 or 5 stars)
    const topReviews: Review[] = (gmbData.reviews || [])
      .filter(review => review.rating && review.rating >= 4)
      .map(review => ({
        authorName: review.authorAttribution?.displayName || 'Anónimo',
        profilePhotoUrl: review.authorAttribution?.photoUri,
        rating: review.rating,
        text: review.text?.text || null, // Ensure text is null if undefined
        // The publishTime from Google is a string, convert it to a Date object for our entity.
        publishTime: review.publishTime ? new Date(review.publishTime) : undefined,
      }));


    // Create a new Business entity from the enriched data
    const businessToSave: Business = {
      id: placeId,
      userId: userId,
      ownerId: null,
      placeId: placeId,
      name: gmbData.name,
      reviewLink: `https://search.google.com/local/writereview?placeid=${placeId}`,
      
      address: gmbData.formattedAddress,
      phone: gmbData.internationalPhoneNumber,
      website: gmbData.websiteUri,
      rating: gmbData.rating,
      reviewCount: gmbData.userRatingCount,
      category: gmbData.types?.[0] || null, 
      gmbPageUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gmbData.name)}&query_place_id=${placeId}`,

      // Add the new enriched fields
      businessStatus: gmbData.businessStatus,
      location: gmbData.location,
      photos: gmbData.photos,
      openingHours: gmbData.regularOpeningHours,
      topReviews: topReviews,

      // Initialize CRM fields
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
