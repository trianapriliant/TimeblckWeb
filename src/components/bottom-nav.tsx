
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CalendarDays, Flame, Settings, LineChart, Plus, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { AddEditHabitSheet } from './add-edit-habit-sheet';
import { AddEditTemplateSheet } from './add-edit-template-sheet';

export function BottomNav() {
  const t = useTranslations();
  const pathname = usePathname();
  const { settings, isLoaded } = useAppSettings();
  const [isClient, setIsClient] = React.useState(false);

  const [habitSheetOpen, setHabitSheetOpen] = React.useState(false);
  const [templateSheetOpen, setTemplateSheetOpen] = React.useState(false);


  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  const leftNavItems = [
    { href: '/', label: t.nav.home, icon: Home },
    { href: '/calendar', label: t.nav.calendar, icon: CalendarDays },
  ];
  
  const rightNavItems = [
    { href: '/reports', label: t.nav.reports, icon: LineChart },
    { href: '/habits', label: t.nav.habits, icon: Flame },
  ];

  const renderNavItem = (item: { href: string; label: string; icon: React.ElementType }) => {
    const isActive = isClient
        ? item.href === '/'
        ? pathname === '/'
        : pathname.startsWith(item.href)
        : false;

    return (
      <Link
        key={item.label}
        href={item.href}
        className={cn(
          'flex flex-col items-center justify-center h-full w-1/2 gap-1 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary/80'
        )}
        aria-current={isActive ? 'page' : undefined}
      >
        <item.icon className="w-6 h-6" />
        <span className="text-xs font-medium">{item.label}</span>
      </Link>
    );
  }

  return (
    <>
      <footer className="md:hidden fixed bottom-0 inset-x-0 h-16 z-40">
        <nav className="relative w-full h-full bg-muted flex justify-between items-center shadow-[0_-1px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_-1px_8px_rgba(0,0,0,0.2)]">
            <div className="flex w-2/5 h-full items-center justify-around">
                {leftNavItems.map(renderNavItem)}
            </div>
             <div className="flex w-2/5 h-full items-center justify-around">
                {rightNavItems.map(renderNavItem)}
            </div>
        </nav>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 z-50">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="icon" className="w-16 h-16 rounded-2xl shadow-lg">
                        <Plus className="h-10 w-10" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="center" className="mb-2 w-56">
                    <DropdownMenuItem onSelect={() => setHabitSheetOpen(true)} className="py-3 text-base">
                        <Flame className="mr-2 h-5 w-5"/>
                        <span>Add New Habit</span>
                    </DropdownMenuItem>
                    {isLoaded && settings.isPremium && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setTemplateSheetOpen(true)} className="py-3 text-base">
                            <Star className="mr-2 h-5 w-5"/>
                            <span>Add New Template</span>
                        </DropdownMenuItem>
                    </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </footer>
      
      <AddEditHabitSheet 
        open={habitSheetOpen}
        onOpenChange={setHabitSheetOpen}
        habit={null}
      />
      <AddEditTemplateSheet 
        open={templateSheetOpen}
        onOpenChange={setTemplateSheetOpen}
        template={null}
      />
    </>
  );
}
