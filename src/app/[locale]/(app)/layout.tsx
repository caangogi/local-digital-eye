"use client"; 

import type React from 'react';
import { useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { usePathname, useRouter } from '@/navigation'; // Use next-intl's navigation
import { useLocale } from 'next-intl';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Prepend locale to the login path
      router.push(`/login`);
    }
  }, [isAuthenticated, isLoading, router, locale, pathname]);

  if (isLoading) {
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

  if (!isAuthenticated) {
    return null; 
  }
  
  // Add a large, soft radial gradient for a "glow" effect
  const appBackgroundGlow = (
    <div className="absolute inset-0 z-[-2] overflow-hidden pointer-events-none">
      <div className="absolute top-1/2 left-1/2 w-[150vw] h-[150vh] -translate-x-1/2 -translate-y-1/2 opacity-20"
            style={{
              background: 'radial-gradient(ellipse at center, hsl(var(--accent) / 0.3) 0%, transparent 60%)',
              filter: 'blur(100px)' 
            }}>
      </div>
    </div>
  );

  return (
    <SidebarProvider defaultOpen={true}>
      {appBackgroundGlow}
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}
