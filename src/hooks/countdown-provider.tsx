
'use client';

import * as React from 'react';
import { useCountdownState } from './use-countdowns';
import type { Countdown } from '@/lib/types';

interface CountdownContextValue {
  countdowns: Countdown[];
  addCountdown: (data: Omit<Countdown, 'id'>) => Countdown;
  updateCountdown: (id: string, data: Partial<Omit<Countdown, 'id'>>) => void;
  deleteCountdown: (id: string) => void;
  isLoaded: boolean;
}

const CountdownContext = React.createContext<CountdownContextValue | undefined>(undefined);

export function CountdownProvider({ children }: { children: React.ReactNode }) {
  const countdownState = useCountdownState();

  return (
    <CountdownContext.Provider value={countdownState}>
      {children}
    </CountdownContext.Provider>
  );
}

export function useCountdowns() {
  const context = React.useContext(CountdownContext);
  if (context === undefined) {
    throw new Error('useCountdowns must be used within a CountdownProvider');
  }
  return context;
}
