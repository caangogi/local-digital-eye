
'use server';

import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase/firebase-admin-config';

const SESSION_COOKIE_NAME = 'session';
const SESSION_COOKIE_EXPIRES_IN = 60 * 60 * 24 * 14 * 1000; // 2 weeks

/**
 * Creates and sets the session cookie.
 * @param idToken The Firebase ID token from the client.
 */
export async function createSessionCookie(idToken: string): Promise<void> {
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_COOKIE_EXPIRES_IN,
  });

  const isDevelopment = process.env.NODE_ENV === 'development';

  // Use the cookies function to set the cookie
  cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
    maxAge: SESSION_COOKIE_EXPIRES_IN,
    httpOnly: true,
    secure: !isDevelopment,
    path: '/',
    sameSite: 'lax',
  });
}

/**
 * Clears the session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  // Use the cookies function to delete the cookie by setting maxAge to 0
  cookies().set(SESSION_COOKIE_NAME, '', { maxAge: 0 });
}
