
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, Flame, Home, LineChart, Settings, Award, Target } from 'lucide-react';
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

export function AppSidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const mainNavItems = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/calendar', label: t.nav.calendar, icon: CalendarDays },
    { href: '/reports', label: t.nav.reports, icon: LineChart },
    { href: '/habits', label: t.nav.habits, icon: Flame },
    { href: '/goals', label: t.nav.goals, icon: Target },
    { href: '/achievements', label: t.nav.achievements, icon: Award },
  ];

  const settingsNavItem = { href: '/settings', label: t.nav.settings, icon: Settings };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarHeader className="h-14 items-center border-b px-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center"
          >
            {!isClient && <div className="h-6 w-6" />}
            {isClient && (
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
            {mainNavItems.map((item) => {
              const isActive = isClient
                ? item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href)
                : false;
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={isActive}
                    tooltip={{ children: item.label, side: 'right' }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
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
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                size="lg"
                isActive={isClient ? pathname.startsWith(settingsNavItem.href) : false}
                tooltip={{ children: settingsNavItem.label, side: 'right' }}
              >
                <Link href={settingsNavItem.href}>
                  <settingsNavItem.icon />
                  <span>{settingsNavItem.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  );
}
