
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
import { LayoutDashboard, Briefcase, FileText, Settings, LogOut, Search, Eye, Map, Building, Star } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

export function AppSidebar() {
  const rawPathname = usePathname(); // Gets the full path including locale, e.g., /en/dashboard
  const locale = useLocale();
  const t = useTranslations('AppSidebar');

  // Remove locale prefix for isActive check if present
  const pathname = rawPathname.startsWith(`/${locale}`) ? rawPathname.substring(`/${locale}`.length) || '/' : rawPathname;

  const { signOut, user } = useAuth();
  
  const adminNavItems = [
    { href: "/dashboard", label: t('dashboard'), icon: <LayoutDashboard /> },
    { href: "/businesses", label: t('businesses'), icon: <Briefcase /> },
    { href: "/map-search", label: t('mapSearch'), icon: <Map /> },
    { href: "/reports", label: t('reports'), icon: <FileText /> },
    { href: "/service-recommendations", label: t('aiServices'), icon: <Search /> },
  ];

  const ownerNavItems = [
    { href: "/dashboard", label: t('dashboard'), icon: <LayoutDashboard /> },
    { href: "/my-business", label: "Mi Negocio", icon: <Building /> }, // Example: To be translated
    { href: "/my-business/reviews", label: "Reseñas", icon: <Star /> }, // Example: To be translated
  ];

  const navItems = user?.role === 'owner' ? ownerNavItems : adminNavItems;

  return (
    <Sidebar side="left" variant="sidebar" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            {/* Logo for expanded state */}
            <div className="group-data-[collapsible=icon]:hidden">
                <Image 
                    src="https://firebasestorage.googleapis.com/v0/b/local-digital-eye.firebasestorage.app/o/public%2Fimages%2Fds.png?alt=media&token=d12ae2c6-310e-4044-bc9b-77d60b6fe4cf"
                    alt="ConsultorIA Logo"
                    width={150}
                    height={40}
                    priority
                    className="dark:hidden"
                />
                 <Image 
                    src="https://firebasestorage.googleapis.com/v0/b/local-digital-eye.firebasestorage.app/o/public%2Fimages%2Flogo-consultoria.png?alt=media&token=f336b89c-4641-4b04-b90d-c6658b6bf773"
                    alt="ConsultorIA Logo"
                    width={150}
                    height={40}
                    priority
                    className="hidden dark:block"
                />
            </div>
             {/* Icon logo for collapsed state */}
            <div className="hidden group-data-[collapsible=icon]:block">
                 <Image 
                    src="https://firebasestorage.googleapis.com/v0/b/local-digital-eye.firebasestorage.app/o/public%2Fimages%2Ficono-consultoria.png?alt=media&token=f73788e5-953d-4cde-8c28-ab749253406a"
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
