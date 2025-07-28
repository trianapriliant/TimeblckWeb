
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, type LucideIcon, LogIn, LogOut } from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useTranslations } from '@/hooks/use-translations';
import { allNavItems } from '@/lib/navigation';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { useAuth } from '@/hooks/use-auth';
import { logout } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';

interface MobileSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const { isLoaded, settings } = useAppSettings();
  const { user } = useAuth();
  const router = useRouter();

  const handleLinkClick = () => {
    onOpenChange(false);
  }

  const handleLogout = async () => {
    await logout();
    handleLinkClick();
    router.push('/login');
  };
  
  const handleLogin = () => {
    handleLinkClick();
    router.push('/login');
  };

  const mainNavItems = React.useMemo(() => {
      return settings.navigationItems
        .map(id => allNavItems.find(item => item.id === id))
        .filter(item => !!item)
        .map(item => ({
            href: item!.href,
            label: t.nav[item!.labelKey],
            icon: item!.icon
        }));
  }, [settings.navigationItems, t.nav]);
  
  const footerNavItems = [
     { href: '/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-80 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar>
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                  <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                  <p className="font-semibold">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          ) : (
             <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>G</AvatarFallback>
                </Avatar>
                <p className="font-semibold">Guest</p>
             </div>
          )}
        </SheetHeader>

        
          <nav className="flex-1 px-4 pt-4 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => {
              const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                  <Button
                      key={item.href}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      asChild
                  >
                      <Link href={item.href} onClick={handleLinkClick}>
                          <item.icon className="mr-2 h-4 w-4" />
                          {isLoaded ? item.label : ''}
                      </Link>
                  </Button>
              );
          })}
          </nav>
        

        <div className="px-4 py-4 border-t">
        <nav className="space-y-1">
            {footerNavItems.map((item) => {
                const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                return (
                    <Button
                        key={item.href}
                        variant={isActive ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        asChild
                    >
                        <Link href={item.href} onClick={handleLinkClick}>
                            <item.icon className="mr-2 h-4 w-4" />
                            {isLoaded ? item.label : ''}
                        </Link>
                    </Button>
                );
            })}
             {user ? (
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
             ) : (
                <Button variant="ghost" className="w-full justify-start" onClick={handleLogin}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                </Button>
             )}
        </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
