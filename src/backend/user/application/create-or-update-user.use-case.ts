import type { User } from '../domain/user.entity';
import type { UserRepositoryPort } from '../domain/user.repository.port';

/**
 * @fileoverview Defines the use case for creating or updating a user.
 */
export class CreateOrUpdateUserUseCase {
  /**
   * @param userRepository An instance of a class that implements the UserRepositoryPort interface.
   */
  constructor(private readonly userRepository: UserRepositoryPort) {}

  /**
   * Executes the use case to create or update a user.
   * @param user The user data to save.
   * @returns A promise that resolves to the saved User object.
   */
  async execute(user: User): Promise<User> {
    console.log(`[CreateOrUpdateUserUseCase] Saving user with id: ${user.id}`);
    return this.userRepository.save(user);
  }
}
