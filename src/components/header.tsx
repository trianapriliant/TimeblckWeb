
'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { NotificationBell } from './notification-bell';
import { Button } from './ui/button';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-6">
        <div className="mr-4 hidden items-center gap-3 md:flex">
          <SidebarTrigger />
        </div>
        <div className="flex items-center gap-3 md:hidden">
          {isClient ? (
            <Button variant="ghost" size="icon" className="-ml-2" onClick={onMenuClick}>
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 32 32"
                  fill="none"
                  className="h-5 w-5"
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
              <span className="sr-only">Open Menu</span>
            </Button>
          ) : (
            <div className="h-10 w-10" />
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
