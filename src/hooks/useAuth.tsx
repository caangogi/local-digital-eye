
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useRouter } from '@/navigation';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult,
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

  // Handle the redirect result from Google
  const handleRedirectResult = useCallback(async () => {
    try {
      console.log('[Auth] Checking for redirect result...');
      const result = await getRedirectResult(clientAuth);
      if (result) {
        console.log('[Auth] Redirect result found:', result.user.uid);
        const idToken = await result.user.getIdToken();
        const response = await createSession(idToken);

        if (response.success) {
          const appUser: User = {
            id: result.user.uid,
            email: result.user.email || '',
            name: result.user.displayName || 'No Name',
            avatarUrl: result.user.photoURL || undefined,
          };
          setUser(appUser);
          console.log('[Auth] User state set after redirect.');
          router.push('/dashboard'); // Redirect after successful session creation
        } else {
          console.error("[Auth] Backend session creation failed after redirect:", response.message);
          await firebaseSignout(clientAuth);
          setUser(null);
        }
      } else {
         console.log('[Auth] No redirect result.');
      }
    } catch (error: any) {
      console.error('[Auth] Error getting redirect result:', error);
      if (error.code === 'auth/popup-closed-by-user') {
         console.warn('[Auth] Google sign-in popup closed by user.');
      }
    } finally {
      // Even if there's no redirect, we need to check auth state.
      // This is handled by onAuthStateChanged.
    }
  }, [router]);

  // Handle user session on subsequent visits
  const handleUserSession = useCallback(async (firebaseUser: FirebaseUser) => {
      console.log('[Auth] Existing session found for user:', firebaseUser.uid);
      const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'No Name',
          avatarUrl: firebaseUser.photoURL || undefined,
      };
      setUser(appUser);
  }, []);

  useEffect(() => {
    // First, handle any potential redirect result.
    handleRedirectResult();

    // Then, set up the listener for ongoing auth state changes.
    const unsubscribe = onAuthStateChanged(clientAuth, (firebaseUser) => {
      console.log('[Auth] onAuthStateChanged triggered.');
      if (firebaseUser) {
        handleUserSession(firebaseUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
       console.log('[Auth] Auth state processing finished. Loading is false.');
    });

    return () => {
      console.log('[Auth] Cleaning up onAuthStateChanged listener.');
      unsubscribe();
    };
  }, [handleRedirectResult, handleUserSession]);
  
  const isAuthenticated = !isLoading && !!user;
  
  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    console.log('[Auth] Attempting to sign in with Google via redirect...');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(clientAuth, provider);
    } catch (error) {
      console.error("[Auth] Error initiating Google sign-in redirect:", error);
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    console.log('[Auth] Attempting to sign out...');
    try {
      await firebaseSignout(clientAuth);
      await clearSession();
      setUser(null);
      console.log('[Auth] Firebase sign-out successful. Redirecting to login.');
      router.push('/login');
    } catch (error) {
      console.error("[Auth] Error signing out:", error);
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
