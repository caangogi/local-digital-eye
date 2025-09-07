
"use client"; 

import type React from 'react';
import { useAuth } from '@/hooks/useAuth.tsx';
import { usePathname } from '@/navigation';
import { ThemeProvider } from '@/components/layout/ThemeProvider';

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { isLoading } = useAuth();
  const pathname = usePathname();

  const isPublicPath = ['/login', '/signup', '/password-reset', '/negocio', '/dev'].some(path =>
    pathname.startsWith(path)
  );
  
  if (pathname === '/') {
     return (
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
     )
  }

  if (isLoading && !isPublicPath) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary animate-pulse">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
          </svg>
          <p className="text-muted-foreground">Loading Local Digital Eye...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
