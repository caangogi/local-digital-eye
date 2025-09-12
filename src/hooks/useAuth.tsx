

"use client";

import React, { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';
import { useRouter, usePathname } from '@/navigation';
import { useSearchParams } from 'next/navigation';
import { useToast } from './use-toast';
import { 
  onAuthStateChanged, 
  GoogleAuthProvider, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  linkWithCredential,
  EmailAuthProvider,
  unlink,
  type User as FirebaseUser 
} from "firebase/auth";
import { auth as clientAuth } from '@/lib/firebase/firebase-client-config';
import { createSession, clearSession } from '@/actions/auth.actions';
import { getGoogleOAuthConsentUrl } from '@/actions/oauth.actions';
import { decode } from 'jsonwebtoken';
import type { SubscriptionPlan } from '@/backend/business/domain/business.entity';


const ONBOARDING_TOKEN_KEY = 'onboardingToken';


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
  authAction: { status: 'idle' | 'awaiting_verification'; message?: string, email?: string } | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email?: string) => Promise<void>;
  linkEmailAndPassword: (password: string) => Promise<void>;
  unlinkPasswordProvider: () => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  checkVerificationStatus: () => Promise<void>;
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

 const handleAuthSuccess = useCallback(async (fbUser: FirebaseUser, forceTokenRefresh = false) => {
    console.log('[Auth] Handling auth success for', fbUser.uid);
    setIsLoading(true);
    
    const idToken = await fbUser.getIdToken(forceTokenRefresh);
    const response = await createSession(idToken);

    if (response.success && response.claims) {
        const appUser: User = {
            id: fbUser.uid,
            email: fbUser.email || '',
            name: fbUser.displayName || 'No Name',
            avatarUrl: fbUser.photoURL || undefined,
            role: response.claims.role,
        };
        setUser(appUser);
        setFirebaseUser(fbUser);
        checkPasswordProvider(fbUser);
        setAuthAction({ status: 'idle' });
        
        console.log('[Auth] User state set. Role:', response.claims.role, 'Checking for onboarding flow...');
        
        const onboardingToken = localStorage.getItem(ONBOARDING_TOKEN_KEY);
        if (onboardingToken) {
            console.log(`[Auth] Onboarding token found. Decoding to get businessId and planType.`);
            const decodedToken = decode(onboardingToken) as { businessId: string; planType: SubscriptionPlan; setupFee?: number };
            
            if (decodedToken && decodedToken.businessId && decodedToken.planType) {
                console.log(`[Auth] Redirecting to OAuth flow for business ${decodedToken.businessId} with plan ${decodedToken.planType}.`);
                localStorage.removeItem(ONBOARDING_TOKEN_KEY); // Clean up the token
                
                const oauthUrl = await getGoogleOAuthConsentUrl(decodedToken.businessId, decodedToken.planType, decodedToken.setupFee);
                window.location.href = oauthUrl; // Redirect to Google OAuth consent screen
                return; // Stop further execution
            } else {
                 console.warn('[Auth] Onboarding token was found but was invalid or malformed.');
                 localStorage.removeItem(ONBOARDING_TOKEN_KEY);
            }
        }

        const nextUrl = searchParams.get('next') || '/dashboard';
        router.push(nextUrl as any);

    } else if (response.message === 'User role assigned. Token refresh required.') {
        console.log("[Auth] Claims assigned on backend. Forcing token refresh and re-calling auth handler.");
        return handleAuthSuccess(fbUser, true);

    } else {
      console.error("[Auth] Backend session creation failed:", response.message);
      if (response.message.includes('Email not verified')) {
        setAuthAction({ status: 'awaiting_verification', message: 'Please check your inbox to verify your email.', email: fbUser.email || undefined });
      } else {
        toast({ title: "Login Failed", description: response.message || "Could not process your session.", variant: "destructive" });
      }
      await clientAuth.signOut();
      setUser(null);
      setFirebaseUser(null);
    }
    
    setIsLoading(false);
  }, [toast, router, searchParams]);

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
      if (fbUser) {
        // Always reload to get the latest state from Firebase servers
        await fbUser.reload();
        
        const isVerifiedNow = fbUser.emailVerified;
        
        // This condition checks if the user is verified AND we don't have a session for them yet.
        // This is the trigger for the automatic login after email verification.
        if (isVerifiedNow && !user) {
          console.log('[Auth] User is verified but no app session exists. Initiating handleAuthSuccess.');
          handleAuthSuccess(fbUser);
        } 
        // If user is not verified, put them in the 'awaiting_verification' state.
        else if (!isVerifiedNow) {
           setAuthAction({ status: 'awaiting_verification', email: fbUser.email || undefined });
           setIsLoading(false);
        }
        // If user is already logged in (user object exists), we don't need to do anything.
        else {
            setFirebaseUser(fbUser);
            checkPasswordProvider(fbUser);
            setIsLoading(false);
        }

      } else {
        // User is signed out
        setUser(null);
        setFirebaseUser(null);
        setAuthAction(null);
        checkPasswordProvider(null);
        setIsLoading(false);
      }
      console.log('[Auth] Auth state processing finished.');
    });

    return () => {
      console.log('[Auth] Cleaning up onAuthStateChanged listener.');
      unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Rerun when app user state changes
  
  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    setAuthAction(null);
    console.log('[Auth] Attempting to sign in with Google via popup...');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(clientAuth, provider);
      // onAuthStateChanged will handle the success case
    } catch (error: any) {
      console.error("[Auth] Error during Google sign-in popup:", error);
       if (error.code === 'auth/account-exists-with-different-credential') {
        toast({ title: "Cuenta ya existe", description: "Ya existe una cuenta con esta dirección de email. Por favor, inicia sesión con el método original.", variant: "destructive" });
      } else {
        toast({ title: "Error de inicio de sesión", description: error.message, variant: "destructive" });
      }
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (name: string, email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setAuthAction(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Manually send verification email ONCE on creation
      await sendEmailVerification(userCredential.user);
      console.log('[Auth] Verification email sent to new user.');
      
      // Directly transition to the verification view without trying to log in
      setAuthAction({ status: 'awaiting_verification', email: userCredential.user.email || undefined });
      toast({ title: "¡Revisa tu Email!", description: "Te hemos enviado un enlace de verificación para activar tu cuenta.", duration: 8000 });

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

  const resendVerificationEmail = async (): Promise<void> => {
    if (!clientAuth.currentUser) {
        toast({ title: "Error", description: "No hay ningún usuario activo para reenviar el email.", variant: "destructive" });
        return;
    }
    setIsLoading(true);
    try {
        await sendEmailVerification(clientAuth.currentUser);
        toast({ title: "¡Email Reenviado!", description: "Hemos enviado un nuevo enlace de verificación a tu correo." });
    } catch (error: any) {
        if (error.code === 'auth/too-many-requests') {
             toast({ title: "Demasiadas Solicitudes", description: "Por favor, espera un momento antes de volver a intentarlo.", variant: "destructive" });
        } else {
             toast({ title: "Error", description: "No se pudo reenviar el email de verificación.", variant: "destructive" });
        }
        console.error("[Auth] Error resending verification email:", error);
    } finally {
        setIsLoading(false);
    }
  }

  const checkVerificationStatus = async (): Promise<void> => {
    // This is the simplest and most robust way to handle this.
    // It forces the onAuthStateChanged listener to re-run with fresh server data.
    window.location.reload();
  }
  
  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setAuthAction(null);
    try {
      await signInWithEmailAndPassword(clientAuth, email, password);
      // onAuthStateChanged will handle the success case
    } catch (error: any) {
      console.error("[Auth] Error signing in:", error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
         toast({ title: "Credenciales Inválidas", description: "El email o la contraseña que ingresaste son incorrectos. Si te registraste con Google, por favor usa ese método.", variant: "destructive" });
      } else {
        toast({ title: "Fallo en el Inicio de Sesión", description: error.message, variant: "destructive" });
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
    checkPasswordProvider(clientAuth.currentUser);
  };

  const unlinkPasswordProvider = async () => {
    if (!clientAuth.currentUser) throw new Error("No user signed in.");
    await unlink(clientAuth.currentUser, EmailAuthProvider.PROVIDER_ID);
    checkPasswordProvider(clientAuth.currentUser);
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
      router.replace(`/login?next=${currentPath}`);
    } catch (error: any) {
      console.error("[Auth] Error signing out:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const value: AuthState = {
    user,
    firebaseUser,
    isAuthenticated: !isLoading && !!user && !!user.id,
    isLoading,
    isProviderPasswordEnabled,
    authAction,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    sendPasswordResetEmail,
    linkEmailAndPassword,
    unlinkPasswordProvider,
    resendVerificationEmail,
    checkVerificationStatus,
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

    