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
          const response = await createSession(idToken);
          
          if (response.success) {
            const appUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'No Name',
              avatarUrl: firebaseUser.photoURL || undefined,
            };
            setUser(appUser);
            // Redirect to dashboard ONLY after user state is set and session is confirmed
            router.push('/dashboard');
          } else {
            // If session creation fails, sign out from client and server
            await firebaseSignout(clientAuth); 
          }
        } catch (error) {
          console.error("Error during auth state processing:", error);
          await firebaseSignout(clientAuth);
        }
      } else {
        // User is signed out
        await clearSession();
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [router]); // dependency array ensures this runs once

  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      // The onAuthStateChanged listener will handle the result of this popup
      await signInWithPopup(clientAuth, provider);
      // DO NOT redirect here. Let the listener handle it.
    } catch (error) {
      // The most common error here is 'auth/popup-closed-by-user', which is fine.
      // For other errors, we log them.
      if ((error as any).code !== 'auth/popup-closed-by-user') {
          console.error("Error during Google sign-in:", error);
      }
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await firebaseSignout(clientAuth);
      // onAuthStateChanged will handle clearing session and user state
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      // Still attempt to redirect and clear state
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
