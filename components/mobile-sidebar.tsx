
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, Search, Star, Palette, Trash2, Award, Target } from 'lucide-react';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useTranslations } from '@/hooks/use-translations';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

interface MobileSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const handleLinkClick = () => {
    onOpenChange(false);
  }

  const mainNavItems = [
    { href: '/templates', label: t.settings.templates_title, icon: Star },
    { href: '/settings/appearance', label: t.settings.appearance_title, icon: Palette },
    { href: '/goals', label: t.nav.goals, icon: Target },
    { href: '/achievements', label: t.nav.achievements, icon: Award },
    { href: '#', label: 'Trash', icon: Trash2, disabled: true, tooltip: 'Coming soon!' },
  ];
  
  const footerNavItems = [
     { href: '/settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="p-0 w-80 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="flex items-center gap-3">
             <Avatar>
                <AvatarFallback>BU</AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold">Bento User</p>
                <p className="text-xs text-muted-foreground">bento.user@example.com</p>
            </div>
          </div>
        </SheetHeader>
        
        <div className="p-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-9" />
            </div>
        </div>

        <TooltipProvider>
            <nav className="flex-1 px-4 space-y-1">
            {mainNavItems.map((item) => {
                const isActive = !item.disabled && (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href));
                
                const buttonContent = (
                    <>
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                    </>
                );

                const button = (
                     <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className="w-full justify-start"
                        disabled={item.disabled}
                        asChild={!item.disabled}
                    >
                        {item.disabled ? <div className="w-full h-full flex items-center">{buttonContent}</div> : (
                            <Link href={item.href} onClick={handleLinkClick}>
                                {buttonContent}
                            </Link>
                        )}
                    </Button>
                );

                if (item.tooltip) {
                    return (
                        <Tooltip key={item.label} delayDuration={100}>
                            <TooltipTrigger asChild>{button}</TooltipTrigger>
                            <TooltipContent side="right"><p>{item.tooltip}</p></TooltipContent>
                        </Tooltip>
                    );
                }
                
                return <div key={item.label}>{button}</div>;
            })}
            </nav>

            <div className="px-4 py-4 border-t">
            <nav className="space-y-1">
                {footerNavItems.map((item) => {
                    const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                    return (
                        <Button
                            key={item.label}
                            variant={isActive ? 'secondary' : 'ghost'}
                            className="w-full justify-start"
                            asChild
                        >
                            <Link href={item.href} onClick={handleLinkClick}>
                                <item.icon className="mr-2 h-4 w-4" />
                                {item.label}
                            </Link>
                        </Button>
                    );
                })}
            </nav>
            </div>
        </TooltipProvider>

      </SheetContent>
    </Sheet>
  );
}
