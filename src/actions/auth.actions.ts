
'use server';

/**
 * @fileoverview Server Actions for authentication.
 * This file acts as the primary adapter between the frontend and the backend use cases.
 */

import { auth as adminAuth } from '@/lib/firebase/firebase-admin-config';
import { FirebaseUserRepository } from '@/backend/user/infrastructure/firebase-user.repository';
import { CreateOrUpdateUserUseCase } from '@/backend/user/application/create-or-update-user.use-case';
import type { User } from '@/backend/user/domain/user.entity';
import { createSessionCookie, clearSessionCookie } from '@/lib/session';

// Instantiate repository and use case
const userRepository = new FirebaseUserRepository();
const createOrUpdateUserUseCase = new CreateOrUpdateUserUseCase(userRepository);

/**
 * Creates a session cookie after verifying the Firebase ID token.
 * It also creates or updates the user profile in Firestore and sets their custom role claim if needed.
 * @param idToken The Firebase ID token from the client.
 * @returns An object indicating success and the user's claims.
 */
export async function createSession(idToken: string): Promise<{ success: boolean; message: string; claims?: any }> {
  try {
    const decodedIdToken = await adminAuth.verifyIdToken(idToken, true);
    const { uid, email, email_verified } = decodedIdToken;

    let customClaims = (decodedIdToken.role ? { role: decodedIdToken.role } : {}) as { role?: string };
    
    // If user has no role claim, assign one. This logic runs on first sign-in.
    if (!customClaims.role) {
      let newRole: User['role'] | null = null;
      if (email === 'caangogi@gmail.com') {
        newRole = 'super_admin';
      } else {
        newRole = 'owner'; // Default role for any new user
      }
      
      if (newRole) {
        await adminAuth.setCustomUserClaims(uid, { role: newRole });
        console.log(`[AuthAction] Set initial custom claim 'role: ${newRole}' for user ${uid}`);
        // IMPORTANT: The current token is stale. The client MUST get a new token.
        // We inform the client to force a refresh.
        return { 
            success: false, 
            message: 'User role assigned. Token refresh required.',
        };
      }
    }
    
    // --- Email Verification Logic ---
    const isAdmin = customClaims.role === 'admin' || customClaims.role === 'super_admin';
    if (!email_verified && !isAdmin) {
        console.warn(`[AuthAction] Session creation denied for ${email}. Reason: Email not verified.`);
        return { 
            success: false, 
            message: 'Email not verified. Please check your inbox.',
        };
    }
    
    // --- Create or Update User in Firestore ---
    const userRecord = await adminAuth.getUser(uid);
    const userToSave: Omit<User, 'avatarUrl'> & { avatarUrl?: string } = {
      id: uid,
      email: email || '',
      name: userRecord.displayName || '',
      role: customClaims.role as User['role'],
    };

    if (userRecord.photoURL) {
        userToSave.avatarUrl = userRecord.photoURL;
    }

    await createOrUpdateUserUseCase.execute(userToSave as User);
    
    // --- Create Session Cookie ---
    await createSessionCookie(idToken);
    
    console.log(`[AuthAction] Session cookie created successfully for user ${uid} with role ${customClaims.role}`);
    return { 
        success: true, 
        message: 'Session created successfully.', 
        claims: customClaims
    };

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
  await clearSessionCookie();
  console.log('[AuthAction] Session cleared.');
}
