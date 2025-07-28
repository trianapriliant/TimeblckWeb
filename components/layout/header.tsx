
'use client';

import * as React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { Button } from '../ui/button';
import { usePageActions } from '@/hooks/page-actions-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { MoreVertical, Plus, MessageCircleQuestion, LogOut, LogIn } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useAuth } from '@/hooks/use-auth';
import { logout } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [isClient, setIsClient] = React.useState(false);
  const { pageActions } = usePageActions();
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const UserMenu = () => {
    if (loading) return null;

    if (user) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled className="flex flex-col items-start">
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }
    return (
        <Button variant="outline" onClick={() => router.push('/login')}>
            <LogIn className="mr-2 h-4 w-4" />
            Login
        </Button>
    );
  };

  const QuickAddMenu = pageActions?.fab ? (
     <Button variant="ghost" size="icon" onClick={pageActions.fab.action} aria-label={pageActions.fab.label}>
        <Plus />
     </Button>
  ) : (
    <Button variant="ghost" size="icon" disabled>
        <Plus />
     </Button>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4 md:px-6">
          {/* --- Mobile View --- */}
          <div className="flex w-full items-center gap-3 md:hidden">
            {isClient ? (
              <Button variant="ghost" size="icon" className="-ml-2" onClick={onMenuClick}>
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
                <span className="sr-only">Open Menu</span>
              </Button>
            ) : (
              <div className="h-10 w-10" />
            )}
            <h1 className="text-lg font-bold truncate">{pageActions?.title || 'Timeblck'}</h1>
          
            {/* --- Right side icons for Mobile --- */}
            <div className="flex items-center justify-end space-x-1 ml-auto">
                {isClient && user && pageActions?.description && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MessageCircleQuestion />
                                <span className="sr-only">Page Description</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <h4 className="font-medium leading-none">{pageActions.title}</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {pageActions.description}
                                    </p>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
                {isClient && user && <NotificationBell />}
                <ThemeToggle />
                {isClient && user && pageActions?.dropdown && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5" />
                        <span className="sr-only">Page Actions</span>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    {pageActions.dropdown}
                    </DropdownMenuContent>
                </DropdownMenu>
                )}
            </div>
          </div>
          
          {/* --- Desktop View --- */}
          <div className="hidden w-full items-center md:grid md:grid-cols-3">
             {/* Left side */}
            <div className="flex items-center gap-1 justify-start">
              <SidebarTrigger />
              {isClient && user && QuickAddMenu}
            </div>

            {/* Center */}
            <div className="text-center">
              <h1 className="text-lg font-bold truncate">{pageActions?.title || 'Timeblck'}</h1>
            </div>
            
            {/* Right side */}
            <div className="flex items-center justify-end gap-1">
               {isClient && user && pageActions?.description && (
                  <Popover>
                      <PopoverTrigger asChild>
                           <Button variant="ghost" size="icon">
                              <MessageCircleQuestion />
                               <span className="sr-only">Page Description</span>
                          </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                          <div className="grid gap-4">
                              <div className="space-y-2">
                                  <h4 className="font-medium leading-none">{pageActions.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                      {pageActions.description}
                                  </p>
                              </div>
                          </div>
                      </PopoverContent>
                  </Popover>
              )}
              {isClient && user && <NotificationBell />}
              <ThemeToggle />
              <UserMenu />
              {isClient && user && pageActions?.dropdown && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                      <span className="sr-only">Page Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {pageActions.dropdown}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
