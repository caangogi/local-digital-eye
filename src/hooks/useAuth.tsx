
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
        // Only clear the server session if there was a user before.
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
  }, []); // The empty dependency array is correct here.

  const isAuthenticated = !isLoading && !!user;

  useEffect(() => {
    // This effect handles redirection after authentication state is determined.
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
      // The key change: use signInWithRedirect
      await signInWithRedirect(clientAuth, provider);
      // No code will execute after this line on the initial click, as the page will redirect.
      // The logic continues in the onAuthStateChanged listener when the user is redirected back.
    } catch (error) {
      console.error("[Auth] Error during Google sign-in redirect initiation:", error);
      setIsLoading(false); // Only reached if signInWithRedirect fails immediately
    }
  };

  const signOut = async (): Promise<void> => {
    console.log('[Auth] Attempting to sign out...');
    setIsLoading(true);
    try {
      await firebaseSignout(clientAuth);
      // onAuthStateChanged will handle setting user to null and clearing server session.
      console.log('[Auth] Firebase sign-out successful. Redirecting to login.');
      router.push('/login');
    } catch (error) {
      console.error("[Auth] Error signing out:", error);
      // Fallback cleanup
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
