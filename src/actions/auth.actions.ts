
'use server';

/**
 * @fileoverview Server Actions for authentication.
 * This file acts as the primary adapter between the frontend and the backend use cases.
 */

import { auth as adminAuth } from '@/lib/firebase/firebase-admin-config';
import { FirebaseUserRepository } from '@/backend/user/infrastructure/firebase-user.repository';
import { CreateOrUpdateUserUseCase } from '@/backend/user/application/create-or-update-user.use-case';
import type { User } from '@/backend/user/domain/user.entity';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'session';

// Instantiate repository and use case
const userRepository = new FirebaseUserRepository();
const createOrUpdateUserUseCase = new CreateOrUpdateUserUseCase(userRepository);

/**
 * Creates a session cookie after verifying the Firebase ID token.
 * It also creates or updates the user profile in Firestore.
 * @param idToken The Firebase ID token from the client.
 */
export async function createSession(idToken: string): Promise<{ success: boolean; message: string }> {
  try {
    // 2 weeks expiry for the session cookie
    const expiresIn = 60 * 60 * 24 * 14 * 1000; 
    
    // Verify the ID token and get user data
    const decodedIdToken = await adminAuth.verifyIdToken(idToken, true);
    
    // Create or update user in our database
    // The user might sign up with email and password and not have a name or picture yet
    // on the token. The client-side logic should have updated the Firebase Auth profile
    // before calling this.
    const userToSave: Omit<User, 'avatarUrl'> & { avatarUrl?: string } = {
      id: decodedIdToken.uid,
      email: decodedIdToken.email || '',
      name: decodedIdToken.name || '', // Use empty string if name is undefined
    };

    // Only add avatarUrl to the object if it exists to avoid sending 'undefined' to Firestore
    if (decodedIdToken.picture) {
        userToSave.avatarUrl = decodedIdToken.picture;
    }

    await createOrUpdateUserUseCase.execute(userToSave as User);

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Set the cookie in the browser
    cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: !isDevelopment, // Use secure cookies in production
      path: '/',
      sameSite: 'lax',
    });

    console.log(`[AuthAction] Session created for user ${decodedIdToken.uid}`);
    return { success: true, message: 'Session created successfully.' };

  } catch (error: any) {
    console.error('Error creating session:', error);
    // Return the actual error message for better diagnostics
    const errorMessage = error.message || 'An unknown error occurred during session creation.';
    return { success: false, message: errorMessage };
  }
}

/**
 * Clears the session cookie.
 */
export async function clearSession(): Promise<void> {
  cookies().delete(SESSION_COOKIE_NAME);
  console.log('[AuthAction] Session cleared.');
}
