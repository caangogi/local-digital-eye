
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useRouter } from '@/navigation';
import { useToast } from './use-toast';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  unlink,
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
  isProviderPasswordEnabled: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email?: string) => Promise<void>;
  linkEmailAndPassword: (password: string) => Promise<void>;
  unlinkPasswordProvider: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProviderPasswordEnabled, setIsProviderPasswordEnabled] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleAuthSuccess = useCallback(async (firebaseUser: FirebaseUser) => {
    console.log('[Auth] Handling auth success for', firebaseUser.uid);
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
      checkPasswordProvider(firebaseUser);
      console.log('[Auth] User state set after success.');
      router.push('/dashboard');
    } else {
      console.error("[Auth] Backend session creation failed:", response.message);
      await clientAuth.signOut();
      setUser(null);
      toast({ title: "Login Failed", description: response.message, variant: "destructive" });
    }
  }, [router, toast]);

  const checkPasswordProvider = (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        setIsProviderPasswordEnabled(false);
        return;
      }
      const isEnabled = firebaseUser.providerData.some(
          (provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID
      );
      setIsProviderPasswordEnabled(isEnabled);
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, (firebaseUser) => {
      console.log('[Auth] onAuthStateChanged triggered.');
      if (firebaseUser) {
        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'No Name',
          avatarUrl: firebaseUser.photoURL || undefined,
        };
        setUser(appUser);
        checkPasswordProvider(firebaseUser);
      } else {
        setUser(null);
        checkPasswordProvider(null);
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

  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    console.log('[Auth] Attempting to sign in with Google via popup...');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(clientAuth, provider);
      console.log('[Auth] Google Popup result found:', result.user.uid);
      await handleAuthSuccess(result.user);
    } catch (error: any) {
      console.error("[Auth] Error during Google sign-in popup:", error);
      if (error.code === 'auth/account-exists-with-different-credential') {
        toast({ title: "Account Exists", description: "An account already exists with this email address. Please sign in with the original method.", variant: "destructive" });
      } else {
        toast({ title: "Sign-in Error", description: error.message, variant: "destructive" });
      }
    } finally {
        setIsLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      // Reload user to get the updated profile
      await userCredential.user.reload(); 
      const updatedUser = clientAuth.currentUser;
      if (updatedUser) {
        await handleAuthSuccess(updatedUser);
      } else {
        throw new Error("Failed to get updated user.");
      }
    } catch (error: any) {
      console.error("[Auth] Error signing up:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast({ title: "Email in Use", description: "This email is already associated with an account. Please log in.", variant: "destructive" });
      } else {
        toast({ title: "Sign-up Failed", description: error.message, variant: "destructive" });
      }
      setIsLoading(false);
    }
    // setIsLoading(false) is handled in handleAuthSuccess or the catch block
  };
  
  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(clientAuth, email, password);
      await handleAuthSuccess(userCredential.user);
    } catch (error: any)
{
      console.error("[Auth] Error signing in:", error);
      if (error.code === 'auth/invalid-credential') {
         toast({ title: "Invalid Credentials", description: "The email or password you entered is incorrect. If you signed up with Google, please use the Google login button.", variant: "destructive" });
      } else {
        toast({ title: "Sign-in Failed", description: error.message, variant: "destructive" });
      }
      setIsLoading(false);
    }
  };

  const linkEmailAndPassword = async (password: string) => {
    if (!clientAuth.currentUser || !clientAuth.currentUser.email) {
      throw new Error("No user is signed in or user has no email.");
    }
    const credential = EmailAuthProvider.credential(clientAuth.currentUser.email, password);
    await linkWithCredential(clientAuth.currentUser, credential);
    checkPasswordProvider(clientAuth.currentUser); // Re-check after linking
  };

  const unlinkPasswordProvider = async () => {
    if (!clientAuth.currentUser) throw new Error("No user signed in.");
    await unlink(clientAuth.currentUser, EmailAuthProvider.PROVIDER_ID);
    checkPasswordProvider(clientAuth.currentUser); // Re-check after unlinking
  };

  const sendPasswordResetEmail = async (email?: string): Promise<void> => {
    const targetEmail = email || user?.email;
    if (!targetEmail) {
      toast({ title: "Error", description: "No email address found to send a reset link.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await firebaseSendPasswordResetEmail(clientAuth, targetEmail);
      toast({ title: "Email Sent", description: `A password reset link has been sent to ${targetEmail}.` });
    } catch (error: any) {
      console.error("[Auth] Error sending password reset email:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  const signOut = async (): Promise<void> => {
    console.log('[Auth] Attempting to sign out...');
    try {
      await clientAuth.signOut();
      await clearSession();
      setUser(null);
      setIsProviderPasswordEnabled(false);
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
    isProviderPasswordEnabled,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    sendPasswordResetEmail,
    linkEmailAndPassword,
    unlinkPasswordProvider
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
