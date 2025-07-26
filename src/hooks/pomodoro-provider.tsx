
'use client';

import * as React from 'react';
import { usePomodoroState } from './use-pomodoro';
import type { PomodoroState, PomodoroSettings, PomodoroTechnique, PomodoroMode } from '@/lib/types';

interface PomodoroContextValue extends PomodoroState {
  audioRef: React.RefObject<HTMLAudioElement>;
  handleStartPause: () => void;
  handleReset: () => void;
  setMode: (mode: PomodoroMode) => void;
  setTechnique: (technique: PomodoroTechnique) => void;
  saveSettings: (newSettings: PomodoroSettings) => void;
}

const PomodoroContext = React.createContext<PomodoroContextValue | undefined>(undefined);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
  const pomodoroState = usePomodoroState();

  return (
    <PomodoroContext.Provider value={pomodoroState}>
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = React.useContext(PomodoroContext);
  if (context === undefined) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}
