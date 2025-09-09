
'use server';

import { auth } from '@/lib/firebase/firebase-admin-config';
import { cookies } from 'next/headers';
import type { UserRecord } from 'firebase-admin/auth';
import type { UserRole } from '@/backend/user/domain/user.entity';

/**
 * Checks if the calling user is a super_admin.
 * Throws an error if not authorized.
 */
async function verifySuperAdmin() {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        throw new Error('Authentication required.');
    }
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    if (decodedToken.role !== 'super_admin') {
        throw new Error('You are not authorized to perform this action.');
    }
    return decodedToken.uid;
}


/**
 * Lists all users in Firebase Authentication.
 * This action is restricted to super_admins.
 * @returns An array of user records.
 */
export async function listAllUsers(): Promise<UserRecord[]> {
    await verifySuperAdmin();
    
    try {
        const userRecords = await auth.listUsers();
        return userRecords.users;
    } catch (error: any) {
        console.error('Error listing users:', error);
        throw new Error('Failed to list users.');
    }
}

/**
 * Sets a specific role for a user.
 * This action is restricted to super_admins.
 * @param uid The UID of the user to update.
 * @param role The new role to set.
 * @returns An object indicating success or failure.
 */
export async function setUserRole(uid: string, role: UserRole): Promise<{ success: boolean; message: string }> {
    const callerUid = await verifySuperAdmin();
    
    // Optional: Prevent a super_admin from demoting themselves, though not strictly necessary.
    if (uid === callerUid && role !== 'super_admin') {
       // return { success: false, message: "Super admins cannot demote themselves." };
    }

    try {
        await auth.setCustomUserClaims(uid, { role });
        console.log(`[UserActions] Super admin ${callerUid} set role '${role}' for user ${uid}`);
        return { success: true, message: `Role '${role}' has been set for the user.` };
    } catch (error: any) {
        console.error(`Error setting role for user ${uid}:`, error);
        return { success: false, message: 'Failed to set user role.' };
    }
}
