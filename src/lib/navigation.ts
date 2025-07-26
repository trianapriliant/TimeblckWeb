
import { Home, CalendarDays, LineChart, Flame, Target, Award, LayoutGrid, Timer, Inbox, LayoutTemplate, Hourglass, type LucideIcon } from 'lucide-react';
import type { NavId } from './types';

export interface NavItem {
  id: NavId;
  href: string;
  labelKey: keyof typeof import('./translations').translations.en.nav;
  icon: LucideIcon;
}

export const allNavItems: NavItem[] = [
  { id: 'home', href: '/', labelKey: 'home', icon: Home },
  { id: 'inbox', href: '/inbox', labelKey: 'inbox', icon: Inbox },
  { id: 'matrix', href: '/matrix', labelKey: 'matrix', icon: LayoutGrid },
  { id: 'kanban', href: '/kanban', labelKey: 'kanban', icon: LayoutTemplate },
  { id: 'calendar', href: '/calendar', labelKey: 'calendar', icon: CalendarDays },
  { id: 'habits', href: '/habits', labelKey: 'habits', icon: Flame },
  { id: 'pomodoro', href: '/pomodoro', labelKey: 'pomodoro', icon: Timer },
  { id: 'countdown', href: '/countdown', labelKey: 'countdown', icon: Hourglass },
  { id: 'goals', href: '/goals', labelKey: 'goals', icon: Target },
  { id: 'reports', href: '/reports', labelKey: 'reports', icon: LineChart },
  { id: 'achievements', href: '/achievements', labelKey: 'achievements', icon: Award },
];
