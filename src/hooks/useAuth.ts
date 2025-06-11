"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from '@/navigation'; // Use next-intl's navigation
import { useLocale } from 'next-intl';


const AUTH_KEY = 'localDigitalEye.auth';

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
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); // current path without locale
  const locale = useLocale(); // current locale

  const loadUserFromStorage = useCallback(() => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem(AUTH_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from storage:", error);
      localStorage.removeItem(AUTH_KEY); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AUTH_KEY) {
        loadUserFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUserFromStorage]);

  const signIn = async (email: string): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockUser: User = {
      id: '1',
      email: email,
      name: email.split('@')[0] || 'User',
      avatarUrl: `https://placehold.co/100x100.png?text=${(email.split('@')[0] || 'U').charAt(0).toUpperCase()}`
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
    setIsLoading(false);
    router.push('/dashboard'); // next-intl's router handles locale automatically
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setIsLoading(false);
    router.push('/login'); // next-intl's router handles locale automatically
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
  };
}
