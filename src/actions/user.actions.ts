
'use server';

import { auth } from '@/lib/firebase/firebase-admin-config';
import { cookies } from 'next/headers';
import type { UserRecord } from 'firebase-admin/auth';
import type { UserRole } from '@/backend/user/domain/user.entity';

/**
 * Checks if the calling user is a super_admin.
 * Throws an error if not authorized.
 */
async function verifySuperAdmin(callerUid: string) {
    const userRecord = await auth.getUser(callerUid);
    const customClaims = userRecord.customClaims || {};

    if (customClaims.role !== 'super_admin') {
        throw new Error('You are not authorized to perform this action.');
    }
}


/**
 * Lists all users in Firebase Authentication.
 * This action is restricted to super_admins.
 * @returns An array of user records.
 */
export async function listAllUsers(): Promise<UserRecord[]> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
        throw new Error('Authentication required.');
    }
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    
    await verifySuperAdmin(decodedToken.uid);
    
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
 * This action is restricted to super_admins, with a special exception for the initial setup.
 * @param uid The UID of the user to update.
 * @param role The new role to set.
 * @returns An object indicating success or failure.
 */
export async function setUserRole(uid: string, role: UserRole): Promise<{ success: boolean; message: string }> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
        return { success: false, message: 'Authentication required.' };
    }
    const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    const callerUid = decodedToken.uid;
    
    // Special condition for the first-time super admin setup.
    // This allows the designated user to self-assign the super_admin role without already having it.
    const isBootstrapCall = 
        uid === callerUid &&
        decodedToken.email === 'caangogi@gmail.com' &&
        role === 'super_admin';

    if (!isBootstrapCall) {
        // For all other cases, the caller MUST be a super admin.
        try {
            await verifySuperAdmin(callerUid);
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }

    // Optional: Prevent a super_admin from demoting themselves, though not strictly necessary.
    if (uid === callerUid && role !== 'super_admin' && (decodedToken as any).role === 'super_admin') {
       // return { success: false, message: "Super admins cannot demote themselves." };
    }

    try {
        await auth.setCustomUserClaims(uid, { role });
        console.log(`[UserActions] Action by ${callerUid}: set role '${role}' for user ${uid}`);
        return { success: true, message: `Role '${role}' has been set for the user.` };
    } catch (error: any) {
        console.error(`Error setting role for user ${uid}:`, error);
        return { success: false, message: 'Failed to set user role.' };
    }
}
