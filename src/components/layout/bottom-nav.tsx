
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Star, Inbox, Flame, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '../ui/button';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { allNavItems, type NavItem } from '@/lib/navigation';
import { usePageActions } from '@/hooks/page-actions-provider';

// --- Scrollable Nav Item Component ---
interface ScrollableNavItemProps {
  pair: [NavItem | undefined, NavItem | undefined];
}

const ScrollableNavItem = ({ pair }: ScrollableNavItemProps) => {
  const t = useTranslations();
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const touchStartY = React.useRef(0);

  if (!pair[0] || !pair[1]) {
    // Render a placeholder or nothing if a pair is incomplete
    return <div className="w-1/2 h-full" />;
  }

  const isActive = pair.some(item => 
    item && (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href))
  );

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 2) {
      setActiveIndex(1);
    } else if (e.deltaY < -2) {
      setActiveIndex(0);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (deltaY < -10) { // Swipe up
      setActiveIndex(1);
    } else if (deltaY > 10) { // Swipe down
      setActiveIndex(0);
    }
  };

  const currentItem = pair[activeIndex];
  if (!currentItem) return <div className="w-1/2 h-full" />;
  const itemLabel = t.nav[currentItem.labelKey];

  return (
    <div
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className={cn(
        'relative flex flex-col items-center justify-center h-full w-1/2 gap-1 transition-colors cursor-ns-resize',
        isActive ? 'text-primary' : 'text-muted-foreground'
      )}
    >
      <div className="relative h-6 w-6">
        <AnimatePresence initial={false}>
          {pair.map((item, index) => {
            if (!item || index !== activeIndex) return null;
            return (
              <motion.div
                key={item.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Link href={item.href} className="w-full h-full flex items-center justify-center">
                  <item.icon className="w-6 h-6" />
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <Link href={currentItem.href} className="text-xs font-medium">{itemLabel}</Link>
    </div>
  );
};


// --- Main BottomNav Component ---
export function BottomNav() {
  const { settings, isLoaded } = useAppSettings();
  const { pageActions } = usePageActions();

  const { fixedPair, customizablePairs } = React.useMemo(() => {
    if (!isLoaded) {
      return { fixedPair: [undefined, undefined], customizablePairs: [] };
    }
    
    const findItem = (id: string) => allNavItems.find(item => item.id === id);

    const fixedPair = [findItem('home'), findItem('inbox')];
    
    const customizablePairs = Object.values(settings.bottomNavPairs).map(pairIds => [
      findItem(pairIds[0]),
      findItem(pairIds[1]),
    ]);

    return { fixedPair, customizablePairs };
  }, [isLoaded, settings.bottomNavPairs]);

  
  if (!isLoaded) {
    return (
       <footer className="md:hidden fixed bottom-0 inset-x-0 h-16 z-40">
        <div className="relative w-full h-full bg-muted flex justify-between items-center shadow-[0_-1px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_-1px_8px_rgba(0,0,0,0.2)]">
          <div className="flex w-2/5 h-full"></div>
          <div className="w-1/5 h-full"></div>
          <div className="flex w-2/5 h-full"></div>
        </div>
      </footer>
    )
  }

  return (
    <>
      <footer className="md:hidden fixed bottom-0 inset-x-0 h-16 z-40">
        <nav className="relative w-full h-full bg-muted flex justify-between items-center shadow-[0_-1px_8px_rgba(0,0,0,0.05)] dark:shadow-[0_-1px_8px_rgba(0,0,0,0.2)]">
            <div className="flex w-2/5 h-full items-center justify-around">
                <ScrollableNavItem pair={fixedPair as [NavItem, NavItem]} />
                <ScrollableNavItem pair={customizablePairs[0] as [NavItem, NavItem]} />
            </div>
             <div className="flex w-2/5 h-full items-center justify-around">
                <ScrollableNavItem pair={customizablePairs[1] as [NavItem, NavItem]} />
                <ScrollableNavItem pair={customizablePairs[2] as [NavItem, NavItem]} />
            </div>
        </nav>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 z-50">
             <Button 
                size="icon" 
                className="w-16 h-16 rounded-2xl shadow-lg"
                onClick={pageActions?.fab?.action}
                disabled={!pageActions?.fab}
                aria-label={pageActions?.fab?.label}
              >
                <Plus className="h-10 w-10" />
            </Button>
        </div>
      </footer>
    </>
  );
}
