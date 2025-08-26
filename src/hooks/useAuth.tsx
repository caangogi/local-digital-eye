
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

  const handleUserSession = useCallback(async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      console.log('[Auth] Firebase user detected:', firebaseUser.uid);
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
        await firebaseSignout(clientAuth); // Sign out if backend fails
        setUser(null);
      }
    } else {
      console.log('[Auth] No Firebase user. Clearing session and user state.');
      setUser(null);
      await clearSession();
    }
  }, []);

  // Effect to handle the redirect result on component mount
  useEffect(() => {
    console.log('[Auth] Checking for redirect result...');
    getRedirectResult(clientAuth)
      .then(async (result) => {
        if (result) {
          console.log('[Auth] Redirect result found:', result.user.uid);
          await handleUserSession(result.user);
        } else {
          console.log('[Auth] No redirect result found. Checking current auth state.');
          // If there's no redirect result, check if a user is already signed in
           if (!clientAuth.currentUser) {
             setIsLoading(false);
           }
        }
      })
      .catch((error) => {
        console.error('[Auth] Error getting redirect result:', error);
        setIsLoading(false);
      });
      
    // Set up the onAuthStateChanged listener for session persistence and changes
    const unsubscribe = onAuthStateChanged(clientAuth, async (firebaseUser) => {
      console.log('[Auth] onAuthStateChanged listener triggered.');
      if (firebaseUser) {
        // This will handle session persistence across reloads, but not the initial redirect.
        await handleUserSession(firebaseUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      console.log('[Auth] Cleaning up onAuthStateChanged listener.');
      unsubscribe();
    };
  }, [handleUserSession]);
  
  const isAuthenticated = !isLoading && !!user;
  
  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    console.log('[Auth] Attempting to sign in with Google via redirect...');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(clientAuth, provider);
      // The page will now redirect. The result is handled by getRedirectResult on return.
    } catch (error) {
      console.error("[Auth] Error initiating Google sign-in redirect:", error);
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    console.log('[Auth] Attempting to sign out...');
    setIsLoading(true);
    try {
      await firebaseSignout(clientAuth);
      setUser(null); // Clear user state immediately
      await clearSession();
      console.log('[Auth] Firebase sign-out successful. Redirecting to login.');
      router.push('/login');
    } catch (error) {
      console.error("[Auth] Error signing out:", error);
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
