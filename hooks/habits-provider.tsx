
'use client';

import * as React from 'react';
import type { Habit } from '@/lib/types';
import { useHabits as useHabitsHook } from './use-habits';

interface HabitsContextValue {
  habits: Habit[];
  habitData: Map<string, number>;
  handleCheckIn: (habitId: string) => void;
  getHabitDataForGrid: (habitId: string) => Map<string, number>;
  addHabit: (newHabitData: Omit<Habit, 'id'>) => void;
  updateHabit: (id: string, updatedData: Omit<Habit, 'id'>) => void;
  deleteHabit: (id: string) => void;
  habitConsistencies: Map<string, number>;
  isLoaded: boolean;
}

const HabitsContext = React.createContext<HabitsContextValue | undefined>(undefined);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const habitsState = useHabitsHook();

  return (
    <HabitsContext.Provider value={habitsState}>
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = React.useContext(HabitsContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitsProvider');
  }
  return context;
}
