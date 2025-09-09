
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
 * It also creates or updates the user profile in Firestore and sets their custom role claim.
 * @param idToken The Firebase ID token from the client.
 */
export async function createSession(idToken: string): Promise<{ success: boolean; message:string; reason?: string, claims?: any }> {
  try {
    // Verify the ID token and get user data
    const decodedIdToken = await adminAuth.verifyIdToken(idToken, true);
    
    // --- User Record & Role Logic ---
    const userRecord = await adminAuth.getUser(decodedIdToken.uid);
    const customClaims = (userRecord.customClaims || {}) as { role?: string };
    
    let newRole = customClaims.role;
    let claimsChanged = false;

    // If user has no role, assign one.
    if (!newRole) {
      if (decodedIdToken.email === 'caangogi@gmail.com') {
        newRole = 'super_admin';
      } else {
        // Default role for any new user signing up via public forms
        newRole = 'owner';
      }
      claimsChanged = true;
    }
    
    // --- Email Verification Logic ---
    // Administrators are exempt from email verification to prevent lockouts.
    const isAdmin = newRole === 'admin' || newRole === 'super_admin';
    if (!decodedIdToken.email_verified && !isAdmin) {
        console.warn(`[AuthAction] Session creation denied for ${decodedIdToken.email}. Reason: Email not verified.`);
        return { 
            success: false, 
            message: 'Email not verified. Please check your inbox.', 
            reason: 'email_not_verified' 
        };
    }
    
    // Set custom claim `role` if it's different or wasn't present.
    if (claimsChanged) {
        await adminAuth.setCustomUserClaims(decodedIdToken.uid, { role: newRole });
        console.log(`[AuthAction] Set new custom claim 'role: ${newRole}' for user ${decodedIdToken.uid}`);
    }

    // Create or update user in our database
    const userToSave: Omit<User, 'avatarUrl'> & { avatarUrl?: string } = {
      id: decodedIdToken.uid,
      email: decodedIdToken.email || '',
      name: decodedIdToken.name || '',
      role: newRole as User['role'],
    };

    if (decodedIdToken.picture) {
        userToSave.avatarUrl = decodedIdToken.picture;
    }

    await createOrUpdateUserUseCase.execute(userToSave as User);
    
    // If claims were changed, we need the client to get a new token with the updated claims
    if (claimsChanged) {
        console.log(`[AuthAction] Claims were changed for ${decodedIdToken.uid}. Forcing token refresh on client.`);
    }

    // Call the dedicated function to create the session cookie
    await createSessionCookie(idToken);
    
    const finalClaims = (await adminAuth.getUser(decodedIdToken.uid)).customClaims;

    console.log(`[AuthAction] Session created successfully for user ${decodedIdToken.uid} with role ${finalClaims?.role}`);
    return { success: true, message: 'Session created successfully.', claims: { role: newRole } };

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
  // Call the dedicated function to clear the session cookie
  await clearSessionCookie();
  console.log('[AuthAction] Session cleared.');
}
