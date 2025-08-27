import type { Business } from './business.entity';

/**
 * @fileoverview Defines the port for the business repository.
 * This interface abstracts data persistence for business entities from the application's use cases.
 */
export interface BusinessRepositoryPort {
  
  /**
   * Saves a business's data (creates or updates).
   * @param business The business object to be persisted.
   * @returns A promise that resolves to the saved Business object.
   */
  save(business: Business): Promise<Business>;

  /**
   * Finds a business by its unique ID (Place ID).
   * @param id The unique identifier of the business (placeId).
   * @returns A promise that resolves to the Business object or null if not found.
   */
  findById(id: string): Promise<Business | null>;

  /**
   * Finds all businesses connected to a specific user.
   * @param userId The ID of the user.
   * @returns A promise that resolves to an array of Business objects.
   */
  findByUserId(userId: string): Promise<Business[]>;

  /**
   * Deletes a business by its unique ID.
   * @param id The unique identifier of the business to delete.
   * @returns A promise that resolves to void when the operation is complete.
   */
  delete(id: string): Promise<void>;
}
