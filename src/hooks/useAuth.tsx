"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useRouter } from '@/navigation';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithRedirect,
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
            setUser(null);
          }
        } catch (error) {
          console.error("[Auth] Error during auth state processing:", error);
          await firebaseSignout(clientAuth);
          setUser(null); 
        }
      } else {
        console.log('[Auth] No Firebase user. Clearing session and user state.');
        if (user) { 
          await clearSession();
        }
        setUser(null);
      }
      setIsLoading(false);
      console.log('[Auth] Auth state processing finished. Loading is false.');
    });

    return () => {
      console.log('[Auth] Cleaning up onAuthStateChanged listener.');
      unsubscribe();
    };
  }, []); // Dependency array is empty to run only once on mount

  const isAuthenticated = !isLoading && !!user;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
        // Only redirect if not already on a dashboard-like page to avoid loops
        if (!window.location.pathname.includes('/dashboard')) {
            console.log('[Auth] User authenticated, redirecting to dashboard.');
            router.push('/dashboard');
        }
    }
  }, [isAuthenticated, isLoading, router]);

  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    console.log('[Auth] Attempting to sign in with Google via redirect...');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(clientAuth, provider);
      console.log('[Auth] signInWithRedirect initiated. Waiting for redirect to complete.');
    } catch (error) {
      console.error("[Auth] Error during Google sign-in redirect initiation:", error);
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    console.log('[Auth] Attempting to sign out...');
    setIsLoading(true);
    try {
      await firebaseSignout(clientAuth);
      console.log('[Auth] Firebase sign-out successful. onAuthStateChanged will handle cleanup.');
      router.push('/login');
    } catch (error) {
      console.error("[Auth] Error signing out:", error);
      await clearSession();
      setUser(null);
      router.push('/login');
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
