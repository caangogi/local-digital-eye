"use client";

import { usePathname } from "next/navigation"; // Keep next/navigation for raw pathname
import { Link } from "@/navigation"; // Use next-intl's Link for navigation
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth.tsx";
import { LayoutDashboard, Briefcase, FileText, Settings, LogOut, Search, Eye } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

export function AppSidebar() {
  const rawPathname = usePathname(); // Gets the full path including locale, e.g., /en/dashboard
  const locale = useLocale();
  const t = useTranslations('AppSidebar');

  // Remove locale prefix for isActive check if present
  const pathname = rawPathname.startsWith(`/${locale}`) ? rawPathname.substring(`/${locale}`.length) || '/' : rawPathname;

  const navItems = [
    { href: "/dashboard", label: t('dashboard'), icon: <LayoutDashboard /> },
    { href: "/businesses", label: t('businesses'), icon: <Briefcase /> },
    { href: "/reports", label: t('reports'), icon: <FileText /> },
    { href: "/service-recommendations", label: t('aiServices'), icon: <Search /> },
  ];
  
  const { signOut, user } = useAuth();

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
          </svg>
          <span className="font-bold text-xl font-headline text-primary group-data-[collapsible=icon]:hidden">
            Local Digital Eye
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, className: "font-body" }}
                  className="font-body"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenu>
           <SidebarMenuItem>
             <Link href="/settings">
                <SidebarMenuButton
                  isActive={pathname === "/settings"}
                  tooltip={{ children: t('settings'), className: "font-body"}}
                  className="font-body"
                >
                  <Settings/>
                  <span>{t('settings')}</span>
                </SidebarMenuButton>
             </Link>
           </SidebarMenuItem>
          {user && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={signOut}
                tooltip={{ children: t('logOut'), className: "font-body"}}
                className="font-body"
              >
                <LogOut />
                <span>{t('logOut')}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
