
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useRouter } from '@/navigation';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup, // Changed from signInWithRedirect
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
    // Set up the listener for ongoing auth state changes.
    const unsubscribe = onAuthStateChanged(clientAuth, (firebaseUser) => {
      console.log('[Auth] onAuthStateChanged triggered.');
      if (firebaseUser) {
        // If there's a Firebase user, we assume a session might exist or needs to be checked.
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
  }, [handleUserSession]);
  
  const isAuthenticated = !isLoading && !!user;
  
  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    console.log('[Auth] Attempting to sign in with Google via popup...');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(clientAuth, provider);
      console.log('[Auth] Popup result found:', result.user.uid);
      
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
        console.log('[Auth] User state set after popup success.');
        router.push('/dashboard');
      } else {
        console.error("[Auth] Backend session creation failed after popup:", response.message);
        await firebaseSignout(clientAuth);
        setUser(null);
      }

    } catch (error: any) {
      console.error("[Auth] Error during Google sign-in popup:", error);
       if (error.code === 'auth/popup-closed-by-user') {
         console.warn('[Auth] Google sign-in popup closed by user.');
      }
    } finally {
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
