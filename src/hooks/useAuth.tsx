"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useRouter } from '@/navigation';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut,
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

  const handleAuthStateChanged = useCallback(async (firebaseUser: FirebaseUser | null) => {
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
        } else {
          await firebaseSignOut(clientAuth);
          setUser(null);
        }
      } catch (error) {
        console.error("Error during auth state change:", error);
        await firebaseSignOut(clientAuth);
        setUser(null);
      }
    } else {
      await clearSession();
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, handleAuthStateChanged);
    return () => unsubscribe();
  }, [handleAuthStateChanged]);

  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(clientAuth, provider);
      // onAuthStateChanged will handle session creation and user state update
      router.push('/dashboard');
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await firebaseSignOut(clientAuth);
      // onAuthStateChanged will handle clearing the session
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoading(false);
    }
  };

  const value: AuthState = {
    user,
    isAuthenticated: !!user,
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
