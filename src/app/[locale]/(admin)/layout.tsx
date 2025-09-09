
"use client"; 

import type React from 'react';
import { useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth.tsx';
import { Toaster } from '@/components/ui/toaster';
import { usePathname, useRouter } from '@/navigation'; 

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return; // Wait until auth state is determined

    if (!isAuthenticated) {
       console.log(`[Auth Guard] Not authenticated. Redirecting to /login from ${pathname}`);
       router.push(`/login`);
       return;
    }

    // --- Role-based Route Protection ---
    const isAdminRoute = pathname.startsWith('/businesses') || pathname.startsWith('/map-search');
    if (user?.role === 'owner' && isAdminRoute) {
        console.warn(`[Auth Guard] Owner attempting to access admin route ${pathname}. Redirecting to dashboard.`);
        router.replace('/dashboard');
    }

  }, [isAuthenticated, isLoading, router, pathname, user?.role]);

  if (isLoading || !isAuthenticated) {
    // Show a loading state or return null while checking auth
    // This prevents flashing the layout for unauthenticated users.
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary animate-pulse">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
          </svg>
          <p className="text-muted-foreground">Verifying Access...</p>
        </div>
      </div>
    );
  }
  
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
