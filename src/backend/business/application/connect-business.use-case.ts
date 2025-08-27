import type { Business } from '../domain/business.entity';
import type { BusinessRepositoryPort } from '../domain/business.repository.port';
// import type { GooglePlacesAdapterPort } from '../ports/google-places.adapter.port'; // We will create this port later

/**
 * @fileoverview Defines the use case for connecting a business to a user.
 * This involves finding the business via an external API and saving it.
 */

export class ConnectBusinessUseCase {
  constructor(
    private readonly businessRepository: BusinessRepositoryPort
    // private readonly placesAdapter: GooglePlacesAdapterPort,
  ) {}

  /**
   * Executes the use case.
   * @param businessName The name of the business to search for.
   * @param location The location context (e.g., city).
   * @param userId The ID of the user connecting the business.
   * @returns The connected Business object.
   */
  async execute(businessName: string, location: string, userId: string): Promise<Business | null> {
    console.log(`[ConnectBusinessUseCase] User ${userId} trying to connect "${businessName}" in "${location}"`);
    
    // Step 1: Find business details using the Google Places Adapter (to be implemented)
    // const placeDetails = await this.placesAdapter.findPlace(businessName, location);
    // if (!placeDetails) {
    //   console.log(`[ConnectBusinessUseCase] No business found for the given query.`);
    //   return null;
    // }

    // Step 2: Create a Business entity from the details (logic to be added)
    // const businessToSave: Business = { ... };

    // Step 3: Save the business to our database
    // return this.businessRepository.save(businessToSave);

    // For now, this is a placeholder.
    console.warn("[ConnectBusinessUseCase] is not fully implemented yet.");
    return null;
  }
}
