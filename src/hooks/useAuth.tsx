
"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
  role: 'admin' | 'owner' | 'super_admin';
}

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProviderPasswordEnabled: boolean;
  authAction: { status: 'idle' | 'awaiting_verification'; message?: string } | null;
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProviderPasswordEnabled, setIsProviderPasswordEnabled] = useState(false);
  const [authAction, setAuthAction] = useState<AuthState['authAction']>(null);

  const router = useRouter();
  const currentPathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

 const handleAuthSuccess = useCallback(async (fbUser: FirebaseUser) => {
    console.log('[Auth] Handling auth success for', fbUser.uid);
    const idToken = await fbUser.getIdToken(true); // Force refresh to get new claims
    const response = await createSession(idToken);

    if (response.success) {
      const appUser: User = {
        id: fbUser.uid,
        email: fbUser.email || '',
        name: fbUser.displayName || 'No Name',
        avatarUrl: fbUser.photoURL || undefined,
        role: response.claims?.role || 'owner', // Use role from claims
      };
      setUser(appUser);
      setFirebaseUser(fbUser);
      checkPasswordProvider(fbUser);
      setAuthAction({ status: 'idle' });
      
      console.log('[Auth] User state set after success. Navigation will be handled by the page.');
      // NO automatic redirection here anymore.
      // The AdminLayout will handle redirection to protected routes.
      
    } else {
      console.error("[Auth] Backend session creation failed:", response.message);
      if (response.reason === 'email_not_verified') {
        setAuthAction({ status: 'awaiting_verification', message: 'Please check your inbox to verify your email.' });
      } else {
        toast({ title: "Login Failed", description: response.message, variant: "destructive" });
      }
      await clientAuth.signOut();
    }
  }, [toast]);

  const checkPasswordProvider = (fbUser: FirebaseUser | null) => {
      if (!fbUser) {
        setIsProviderPasswordEnabled(false);
        return;
      }
      const isEnabled = fbUser.providerData.some(
          (provider) => provider.providerId === EmailAuthProvider.PROVIDER_ID
      );
      setIsProviderPasswordEnabled(isEnabled);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async (fbUser) => {
      console.log('[Auth] onAuthStateChanged triggered.');
      if (fbUser && fbUser.emailVerified) { // Only proceed if email is verified
        console.log('[Auth] User is verified. Handling auth success...');
        await handleAuthSuccess(fbUser);
      } else if (fbUser && !fbUser.emailVerified) {
        console.log('[Auth] User detected, but email is not verified.');
        const idTokenResult = await fbUser.getIdTokenResult();
        const isAdmin = idTokenResult.claims.role === 'admin' || idTokenResult.claims.role === 'super_admin';
        if (isAdmin) {
           console.log('[Auth] User is admin, proceeding with login despite unverified email.');
           await handleAuthSuccess(fbUser);
        } else {
           setUser(null);
           setFirebaseUser(fbUser);
           setAuthAction({ status: 'awaiting_verification', message: 'Please check your inbox to verify your email.' });
        }
      } else {
        setUser(null);
        setFirebaseUser(null);
        setAuthAction(null);
        checkPasswordProvider(null);
      }
      setIsLoading(false);
      console.log('[Auth] Auth state processing finished. Loading is false.');
    });

    return () => {
      console.log('[Auth] Cleaning up onAuthStateChanged listener.');
      unsubscribe();
    };
  }, [handleAuthSuccess]);
  
  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    setAuthAction(null);
    console.log('[Auth] Attempting to sign in with Google via popup...');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(clientAuth, provider);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      console.error("[Auth] Error during Google sign-in popup:", error);
       if (error.code === 'auth/account-exists-with-different-credential') {
        toast({ title: "Cuenta ya existe", description: "Ya existe una cuenta con esta dirección de email. Por favor, inicia sesión con el método original.", variant: "destructive" });
      } else {
        toast({ title: "Error de inicio de sesión", description: error.message, variant: "destructive" });
      }
    } finally {
        setIsLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setAuthAction(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      // onAuthStateChanged will handle the rest after creation
    } catch (error: any) {
      console.error("[Auth] Error signing up:", error);
      if (error.code === 'auth/email-already-in-use') {
        toast({ title: "Email en Uso", description: "Este email ya está asociado a una cuenta. Por favor, inicia sesión o utiliza otro email.", variant: "destructive" });
      } else {
        toast({ title: "Fallo en el Registro", description: error.message, variant: "destructive" });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setAuthAction(null);
    try {
      await signInWithEmailAndPassword(clientAuth, email, password);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      console.error("[Auth] Error signing in:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
         toast({ title: "Credenciales Inválidas", description: "El email o la contraseña que ingresaste son incorrectos. Si te registraste con Google, por favor usa ese método.", variant: "destructive" });
      } else {
        toast({ title: "Fallo en el Inicio de Sesión", description: error.message, variant: "destructive" });
      }
      setIsLoading(false); // Make sure to stop loading on error
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
      toast({ title: "Email Enviado", description: `Se ha enviado un enlace de restablecimiento de contraseña a ${targetEmail}.` });
    } catch (error: any) {
      console.error("[Auth] Error sending password reset email:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    console.log('[Auth] Attempting to sign out...');
    const currentPath = currentPathname;
    try {
      await clientAuth.signOut();
      await clearSession();
      setUser(null);
      setFirebaseUser(null);
      setIsProviderPasswordEnabled(false);
      setAuthAction(null);
      console.log('[Auth] Firebase sign-out successful. Redirecting to login.');
      // Instead of push, we use replace to prevent back button from going to a protected route
      router.replace(`/login?next=${currentPath}`);
    } catch (error) {
      console.error("[Auth] Error signing out:", error);
    }
  };

  const value: AuthState = {
    user,
    firebaseUser,
    isAuthenticated: !isLoading && !!user,
    isLoading,
    isProviderPasswordEnabled,
    authAction,
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
