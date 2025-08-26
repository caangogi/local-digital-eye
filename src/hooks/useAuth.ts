"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/navigation';
import { 
  getAuth, 
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

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleAuthStateChanged = useCallback(async (firebaseUser: FirebaseUser | null) => {
    setIsLoading(true);
    if (firebaseUser) {
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
        // If session creation fails, sign out from client
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
      // onAuthStateChanged will handle the rest
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

  return {
    user,
    isAuthenticated: !!user && !isLoading,
    isLoading,
    signInWithGoogle,
    signOut,
  };
}
