
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
 * @returns An object indicating success, whether claims were changed, and the final claims.
 */
export async function createSession(idToken: string): Promise<{ success: boolean; message: string; claimsChanged?: boolean; claims?: any }> {
  try {
    // Verify the ID token to get the user's UID and other basic info
    const decodedIdToken = await adminAuth.verifyIdToken(idToken, true);
    
    // --- User Record & Role Logic ---
    // Fetch the full user record from Firebase Auth to get the current custom claims
    const userRecord = await adminAuth.getUser(decodedIdToken.uid);
    const customClaims = (userRecord.customClaims || {}) as { role?: string };
    
    let newRole = customClaims.role;
    let claimsChanged = false;

    // If user has no role, assign one. This logic runs on first sign-in.
    if (!newRole) {
      if (userRecord.email === 'caangogi@gmail.com') {
        newRole = 'super_admin';
      } else {
        // Default role for any new user signing up via public forms
        newRole = 'owner';
      }
      claimsChanged = true;
    }
    
    // --- Email Verification Logic ---
    const isAdmin = newRole === 'admin' || newRole === 'super_admin';
    if (!decodedIdToken.email_verified && !isAdmin) {
        console.warn(`[AuthAction] Session creation denied for ${userRecord.email}. Reason: Email not verified.`);
        return { 
            success: false, 
            message: 'Email not verified. Please check your inbox.', 
        };
    }
    
    // If we determined a new role should be set, apply it now.
    if (claimsChanged) {
        await adminAuth.setCustomUserClaims(userRecord.uid, { role: newRole });
        console.log(`[AuthAction] Set new custom claim 'role: ${newRole}' for user ${userRecord.uid}`);
        
        // IMPORTANT: Because claims were changed, the current idToken is now stale.
        // The client needs to be informed so it can get a new token with the updated claims
        // and call createSession again.
        return { 
            success: true, 
            message: 'Claims updated. A new token is required.', 
            claimsChanged: true, 
            claims: { role: newRole } 
        };
    }

    // --- If claims are already correct, proceed to create the session cookie ---

    // Create or update user in our Firestore database (this is for profile data, not auth roles)
    const userToSave: Omit<User, 'avatarUrl'> & { avatarUrl?: string } = {
      id: userRecord.uid,
      email: userRecord.email || '',
      name: userRecord.displayName || '',
      role: newRole as User['role'], // The role is now definitive
    };

    if (userRecord.photoURL) {
        userToSave.avatarUrl = userRecord.photoURL;
    }

    await createOrUpdateUserUseCase.execute(userToSave as User);
    
    // Call the dedicated function to create the session cookie with the valid token
    await createSessionCookie(idToken);
    
    console.log(`[AuthAction] Session cookie created successfully for user ${userRecord.uid} with role ${newRole}`);
    return { 
        success: true, 
        message: 'Session created successfully.', 
        claimsChanged: false, 
        claims: { role: newRole } 
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
  // Call the dedicated function to clear the session cookie
  await clearSessionCookie();
  console.log('[AuthAction] Session cleared.');
}
