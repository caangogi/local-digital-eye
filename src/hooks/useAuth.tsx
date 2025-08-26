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
    const unsubscribe = onAuthStateChanged(clientAuth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          // This is the crucial part: call our backend to create/verify the session
          const response = await createSession(idToken);
          
          if (response.success) {
            // If the server confirms, create the user object for the context
            const appUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'No Name',
              avatarUrl: firebaseUser.photoURL || undefined,
            };
            setUser(appUser);
            // Only now is it safe to consider the user fully authenticated
            // The layout effect will handle redirection if needed.
          } else {
            // If our backend fails to create a session, something is wrong.
            // Log the user out from the client to prevent an inconsistent state.
            console.error("Backend session creation failed:", response.message);
            await firebaseSignout(clientAuth); 
          }
        } catch (error) {
          console.error("Error during auth state processing:", error);
          await firebaseSignout(clientAuth);
        }
      } else {
        // User is signed out, clear the server session and local user state
        await clearSession();
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // The empty dependency array ensures this effect runs only once on mount

  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // onAuthStateChanged will handle the rest of the logic
      await signInWithPopup(clientAuth, provider);
    } catch (error) {
      // This error is common and expected if the user closes the popup.
      // We only log other, unexpected errors.
      if ((error as any).code !== 'auth/popup-closed-by-user') {
          console.error("Error during Google sign-in:", error);
      }
      setIsLoading(false); // Stop loading if sign-in is cancelled
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await firebaseSignout(clientAuth);
      // onAuthStateChanged listener will automatically handle clearing session and user state
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      // As a fallback, manually clear session and state and redirect
      await clearSession();
      setUser(null);
      router.push('/login');
    } finally {
        setIsLoading(false);
    }
  };

  const value: AuthState = {
    user,
    isAuthenticated: !isLoading && !!user, // More reliable isAuthenticated check
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
