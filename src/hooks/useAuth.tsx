"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useRouter } from '@/navigation';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignout,
  type User as FirebaseUser 
} from "firebase/auth";
import { auth as clientAuth } from '@/lib/firebase/firebase-client-config';
import { createSession, clearSession } from '@/actions/auth.actions';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('[Auth] Setting up onAuthStateChanged listener...');
    const unsubscribe = onAuthStateChanged(clientAuth, async (firebaseUser) => {
      console.log('[Auth] onAuthStateChanged triggered.');
      setIsLoading(true);
      if (firebaseUser) {
        console.log('[Auth] Firebase user found:', firebaseUser.uid);
        try {
          const idToken = await firebaseUser.getIdToken();
          console.log('[Auth] ID Token obtained. Calling createSession server action...');
          
          const response = await createSession(idToken);
          console.log('[Auth] Server response from createSession:', response);
          
          if (response.success) {
            const appUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'No Name',
              avatarUrl: firebaseUser.photoURL || undefined,
            };
            setUser(appUser);
            console.log('[Auth] User state set in context.');
          } else {
            console.error("[Auth] Backend session creation failed:", response.message);
            await firebaseSignout(clientAuth); 
          }
        } catch (error) {
          console.error("[Auth] Error during auth state processing:", error);
          await firebaseSignout(clientAuth);
        }
      } else {
        console.log('[Auth] No Firebase user. Clearing session and user state.');
        await clearSession();
        setUser(null);
      }
      setIsLoading(false);
      console.log('[Auth] Auth state processing finished. Loading is false.');
    });

    return () => {
      console.log('[Auth] Cleaning up onAuthStateChanged listener.');
      unsubscribe();
    };
  }, []);

  const isAuthenticated = !isLoading && !!user;

  useEffect(() => {
    // This effect will run when isLoading or isAuthenticated changes.
    // It handles redirection after the auth state is fully resolved.
    if (!isLoading && isAuthenticated) {
        router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    console.log('[Auth] Attempting to sign in with Google...');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(clientAuth, provider);
      // onAuthStateChanged will handle the success case.
      console.log('[Auth] signInWithPopup successful. Waiting for onAuthStateChanged.');
    } catch (error) {
      // This error is common and expected if the user closes the popup.
      if ((error as any).code !== 'auth/popup-closed-by-user') {
          console.error("[Auth] Error during Google sign-in:", error);
      } else {
        console.log('[Auth] Google sign-in popup closed by user.');
      }
      setIsLoading(false); // Stop loading if sign-in is cancelled/failed
    }
  };

  const signOut = async (): Promise<void> => {
    console.log('[Auth] Attempting to sign out...');
    setIsLoading(true);
    try {
      await firebaseSignout(clientAuth);
      // onAuthStateChanged listener will automatically handle clearing session and user state
      router.push('/login');
      console.log('[Auth] Firebase sign-out successful. Redirecting to login.');
    } catch (error) {
      console.error("[Auth] Error signing out:", error);
      // Fallback just in case
      await clearSession();
      setUser(null);
      router.push('/login');
    } finally {
        setIsLoading(false);
    }
  };

  const value: AuthState = {
    user,
    isAuthenticated,
    isLoading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
