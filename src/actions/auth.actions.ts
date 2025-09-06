
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
 * It also creates or updates the user profile in Firestore and sets their custom role claim.
 * @param idToken The Firebase ID token from the client.
 */
export async function createSession(idToken: string): Promise<{ success: boolean; message:string; }> {
  try {
    // 2 weeks expiry for the session cookie
    const expiresIn = 60 * 60 * 24 * 14 * 1000; 
    
    // Verify the ID token and get user data
    const decodedIdToken = await adminAuth.verifyIdToken(idToken, true);
    
    const userRecord = await adminAuth.getUser(decodedIdToken.uid);
    const customClaims = (userRecord.customClaims || {}) as { role?: string };

    // Set custom claim `role` if it doesn't exist. Default to 'admin'.
    if (!customClaims.role) {
        await adminAuth.setCustomUserClaims(decodedIdToken.uid, { role: 'admin' });
        console.log(`[AuthAction] Set custom claim 'role: admin' for new user ${decodedIdToken.uid}`);
    }
    const finalRole = customClaims.role || 'admin';


    // Create or update user in our database
    const userToSave: Omit<User, 'avatarUrl'> & { avatarUrl?: string, role: 'admin' | 'owner' } = {
      id: decodedIdToken.uid,
      email: decodedIdToken.email || '',
      name: decodedIdToken.name || '',
      role: finalRole as 'admin' | 'owner',
    };

    if (decodedIdToken.picture) {
        userToSave.avatarUrl = decodedIdToken.picture;
    }

    await createOrUpdateUserUseCase.execute(userToSave as User);

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: !isDevelopment,
      path: '/',
      sameSite: 'lax',
    });

    console.log(`[AuthAction] Session created for user ${decodedIdToken.uid}`);
    return { success: true, message: 'Session created successfully.' };

  } catch (error: any) {
    console.error('Error creating session:', error);
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
