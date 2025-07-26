
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import * as React from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { allNavItems } from '@/lib/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function AppSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const { settings, isLoaded } = useAppSettings();
  const { user, loading } = useAuth();

  const visibleNavItems = React.useMemo(() => {
    return settings.navigationItems.map(id => allNavItems.find(item => item.id === id)).filter(Boolean);
  }, [settings.navigationItems]);

  const settingsNavItem = { href: '/settings', label: t.nav.settings, icon: Settings };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarHeader className="h-14 items-center border-b px-4">
          <Link
            href="/"
            className="mt-1.5 flex items-center gap-2.5 font-bold group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center"
          >
            {!isLoaded && <div className="h-6 w-6" />}
            {isLoaded && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                fill="none"
                className="h-6 w-6"
              >
                <rect x="2" y="2" width="8" height="8" rx="2" fill="currentColor" />
                <rect x="12" y="2" width="8" height="8" rx="2" fill="currentColor" />
                <rect x="22" y="2" width="8" height="8" rx="2" fill="currentColor" />
                <rect x="2" y="12" width="8" height="8" rx="2" fill="currentColor" />
                <rect x="12" y="12" width="8" height="8" rx="2" fill="currentColor" opacity="0.5" />
                <rect x="22" y="12" width="8" height="8" rx="2" fill="currentColor" />
                <rect x="2" y="22" width="8" height="8" rx="2" fill="currentColor" />
                <rect x="12" y="22" width="8" height="8" rx="2" fill="currentColor" opacity="0.5" />
                <rect x="22" y="22" width="8" height="8" rx="2" fill="currentColor" />
              </svg>
            )}
            <span className="group-data-[collapsible=icon]:hidden">
              Timeblck
            </span>
          </Link>
        </SidebarHeader>

        <div className="flex-1">
          <SidebarMenu className="p-3 group-data-[collapsible=icon]:grid group-data-[collapsible=icon]:place-items-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
            {visibleNavItems.map((item) => {
              if (!item) return null;
              const label = t.nav[item.labelKey];
              const isActive = isLoaded
                ? item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href)
                : false;
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={isActive}
                    tooltip={{ children: label, side: 'right' }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{isLoaded ? label : ''}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>

        <SidebarFooter>
          <SidebarSeparator className="my-1" />
           <SidebarMenu className="p-3 group-data-[collapsible=icon]:grid group-data-[collapsible=icon]:place-items-center group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
            {user && (
                <SidebarMenuItem>
                    <div className="flex items-center gap-2 group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                            <p className="font-semibold text-sm truncate">{user.displayName}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                </SidebarMenuItem>
            )}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="lg"
                isActive={isLoaded ? pathname.startsWith(settingsNavItem.href) : false}
                tooltip={{ children: settingsNavItem.label, side: 'right' }}
              >
                <Link href={settingsNavItem.href}>
                  <settingsNavItem.icon />
                  <span>{isLoaded ? settingsNavItem.label : ''}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
