"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

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

  const loadUserFromStorage = useCallback(() => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem(AUTH_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user from storage:", error);
      localStorage.removeItem(AUTH_KEY); // Clear corrupted data
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
    // Simulate API call
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
    router.push('/dashboard');
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setIsLoading(false);
    router.push('/login');
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signOut,
  };
}
