import type { User } from './user.entity';

/**
 * @fileoverview Defines the port for the user repository.
 * This interface abstracts the data persistence logic from the application's business logic (use cases).
 * Any concrete repository implementation (like Firebase, a relational DB, etc.) must adhere to this contract.
 */
export interface UserRepositoryPort {
  
  /**
   * Finds a user by their unique ID.
   * @param id The unique identifier of the user.
   * @returns A promise that resolves to the User object or null if not found.
   */
  findById(id: string): Promise<User | null>;

  /**
   * Finds a user by their email address.
   * @param email The email address of the user.
   * @returns A promise that resolves to the User object or null if not found.
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Saves a user's data (creates or updates).
   * @param user The user object to be persisted.
   * @returns A promise that resolves to the saved User object.
   */
  save(user: User): Promise<User>;

  /**
   * Deletes a user by their unique ID.
   * @param id The unique identifier of the user to delete.
   * @returns A promise that resolves to void when the operation is complete.
   */
  delete(id: string): Promise<void>;
}
