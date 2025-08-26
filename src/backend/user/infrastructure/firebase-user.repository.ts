import type { User } from '../domain/user.entity';
import { UserSchema } from '../domain/user.entity';
import type { UserRepositoryPort } from '../domain/user.repository.port';
import { firestore } from '@/lib/firebase/firebase-admin-config';
import { z } from 'zod';

/**
 * @fileoverview Implements the UserRepositoryPort using Firebase Firestore as the data source.
 * This class is responsible for all database operations related to users.
 */

export class FirebaseUserRepository implements UserRepositoryPort {
  private readonly collection = firestore.collection('users');

  /**
   * Finds a user by their unique ID from Firestore.
   * @param id The unique identifier of the user.
   * @returns A promise that resolves to the User object or null if not found.
   */
  async findById(id: string): Promise<User | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    const data = doc.data();
    try {
      // Validate data against the Zod schema
      return UserSchema.parse({ id: doc.id, ...data });
    } catch (error) {
      console.error(`[FirebaseUserRepository] Invalid data for user ${id}:`, error);
      return null;
    }
  }

  /**
   * Finds a user by their email address.
   * This performs a query on the 'email' field in the users collection.
   * @param email The email address of the user.
   * @returns A promise that resolves to the User object or null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection.where('email', '==', email).limit(1).get();
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    const data = doc.data();
    try {
       // Validate data against the Zod schema
      return UserSchema.parse({ id: doc.id, ...data });
    } catch (error) {
        console.error(`[FirebaseUserRepository] Invalid data for user with email ${email}:`, error);
        return null;
    }
  }

  /**
   * Saves a user's data to Firestore.
   * It performs an 'upsert' (update if exists, create if not).
   * @param user The user object to be persisted.
   * @returns A promise that resolves to the saved User object.
   */
  async save(user: User): Promise<User> {
    // Validate the user object before saving
    const validatedUser = UserSchema.parse(user);
    const { id, ...userData } = validatedUser;
    
    await this.collection.doc(id).set(userData, { merge: true });
    
    return validatedUser;
  }

  /**
   * Deletes a user from Firestore by their unique ID.
   * @param id The unique identifier of the user to delete.
   * @returns A promise that resolves to void when the operation is complete.
   */
  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
