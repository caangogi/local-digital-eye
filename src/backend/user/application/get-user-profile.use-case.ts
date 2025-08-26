import type { User } from '../domain/user.entity';
import type { UserRepositoryPort } from '../domain/user.repository.port';

/**
 * @fileoverview Defines the use case for retrieving a user's profile.
 * This file encapsulates the business logic for fetching a user's details.
 */

/**
 * @class GetUserProfileUseCase
 * Orchestrates the retrieval of a user profile by interacting with the user repository.
 * It depends on an implementation of `UserRepositoryPort` to abstract the data source.
 */
export class GetUserProfileUseCase {
  
  /**
   * @param userRepository An instance of a class that implements the UserRepositoryPort interface.
   */
  constructor(private readonly userRepository: UserRepositoryPort) {}

  /**
   * Executes the use case to get a user profile by their ID.
   * @param id The unique identifier of the user to retrieve.
   * @returns A promise that resolves to the User object or null if not found.
   */
  async execute(id: string): Promise<User | null> {
    console.log(`[GetUserProfileUseCase] Attempting to fetch user with id: ${id}`);
    const user = await this.userRepository.findById(id);
    if (!user) {
        console.log(`[GetUserProfileUseCase] User with id: ${id} not found.`);
        return null;
    }
    return user;
  }
}

/**
 * @fileoverview Defines the use case for creating or updating a user.
 */
export class CreateOrUpdateUserUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}
  async execute(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}

/**
 * @fileoverview Defines the use case for deleting a user.
 */
export class DeleteUserUseCase {
  constructor(private readonly userRepository: UserRepositoryPort) {}
  async execute(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }
}
