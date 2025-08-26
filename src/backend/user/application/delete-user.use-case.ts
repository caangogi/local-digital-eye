import type { UserRepositoryPort } from '../domain/user.repository.port';

/**
 * @fileoverview Defines the use case for deleting a user.
 */
export class DeleteUserUseCase {
  /**
   * @param userRepository An instance of a class that implements the UserRepositoryPort interface.
   */
  constructor(private readonly userRepository: UserRepositoryPort) {}

  /**
   * Executes the use case to delete a user by their ID.
   * @param id The unique identifier of the user to delete.
   * @returns A promise that resolves to void when the operation is complete.
   */
  async execute(id: string): Promise<void> {
    console.log(`[DeleteUserUseCase] Deleting user with id: ${id}`);
    return this.userRepository.delete(id);
  }
}
