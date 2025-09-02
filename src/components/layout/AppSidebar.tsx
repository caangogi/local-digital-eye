
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
import { LayoutDashboard, Briefcase, FileText, Settings, LogOut, Search, Eye, Map } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

export function AppSidebar() {
  const rawPathname = usePathname(); // Gets the full path including locale, e.g., /en/dashboard
  const locale = useLocale();
  const t = useTranslations('AppSidebar');

  // Remove locale prefix for isActive check if present
  const pathname = rawPathname.startsWith(`/${locale}`) ? rawPathname.substring(`/${locale}`.length) || '/' : rawPathname;

  const navItems = [
    { href: "/dashboard", label: t('dashboard'), icon: <LayoutDashboard /> },
    { href: "/businesses", label: t('businesses'), icon: <Briefcase /> },
    { href: "/map-search", label: t('mapSearch'), icon: <Map /> },
    { href: "/reports", label: t('reports'), icon: <FileText /> },
    { href: "/service-recommendations", label: t('aiServices'), icon: <Search /> },
  ];
  
  const { signOut, user } = useAuth();

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            {/* Full logo for expanded state */}
            <div className="group-data-[collapsible=icon]:hidden">
                <Image 
                    src="https://firebasestorage.googleapis.com/v0/b/consultoria-e8a9c.appspot.com/o/Images%2Flogo-consultoria.png?alt=media&token=c270a057-36ab-443c-b1cd-c98495cad4b7"
                    alt="ConsultorIA Logo"
                    width={150}
                    height={40}
                    priority
                />
            </div>
             {/* Icon logo for collapsed state */}
            <div className="hidden group-data-[collapsible=icon]:block">
                 <Image 
                    src="https://firebasestorage.googleapis.com/v0/b/consultoria-e8a9c.appspot.com/o/Images%2Ficono-consultoria.png?alt=media&token=b8070931-c56e-4559-82d4-0a763e98b92d"
                    alt="ConsultorIA Icon"
                    width={32}
                    height={32}
                    priority
                />
            </div>
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
