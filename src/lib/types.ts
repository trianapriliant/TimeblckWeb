
import type { habitIconNames } from '@/components/shared/icon-map';
import type { AppSettings as AppSettingsType } from '@/hooks/use-app-settings';
import type { RefObject } from 'react';

// Reverting to a structure that uses Tailwind classes for consistency and to fix bugs.
export const BLOCK_COLORS = {
  red: {
    solid: 'bg-red-500',
    foreground: 'text-red-50',
    grid: { 1: 'bg-red-500/10', 2: 'bg-red-500/25', 3: 'bg-red-500/40', 4: 'bg-red-500/55', 5: 'bg-red-500/70', 6: 'bg-red-500/85', 7: 'bg-red-500/100' },
  },
  lime: {
    solid: 'bg-lime-500',
    foreground: 'text-lime-950',
    grid: { 1: 'bg-lime-500/10', 2: 'bg-lime-500/25', 3: 'bg-lime-500/40', 4: 'bg-lime-500/55', 5: 'bg-lime-500/70', 6: 'bg-lime-500/85', 7: 'bg-lime-500/100' },
  },
  teal: {
    solid: 'bg-teal-500',
    foreground: 'text-teal-50',
    grid: { 1: 'bg-teal-500/10', 2: 'bg-teal-500/25', 3: 'bg-teal-500/40', 4: 'bg-teal-500/55', 5: 'bg-teal-500/70', 6: 'bg-teal-500/85', 7: 'bg-teal-500/100' },
  },
  fuchsia: {
    solid: 'bg-fuchsia-500',
    foreground: 'text-fuchsia-50',
    grid: { 1: 'bg-fuchsia-500/10', 2: 'bg-fuchsia-500/25', 3: 'bg-fuchsia-500/40', 4: 'bg-fuchsia-500/55', 5: 'bg-fuchsia-500/70', 6: 'bg-fuchsia-500/85', 7: 'bg-fuchsia-500/100' },
  },
  orange: {
    solid: 'bg-orange-500',
    foreground: 'text-orange-50',
    grid: { 1: 'bg-orange-500/10', 2: 'bg-orange-500/25', 3: 'bg-orange-500/40', 4: 'bg-orange-500/55', 5: 'bg-orange-500/70', 6: 'bg-orange-500/85', 7: 'bg-orange-500/100' },
  },
  violet: {
    solid: 'bg-violet-500',
    foreground: 'text-violet-50',
    grid: { 1: 'bg-violet-500/10', 2: 'bg-violet-500/25', 3: 'bg-violet-500/40', 4: 'bg-violet-500/55', 5: 'bg-violet-500/70', 6: 'bg-violet-500/85', 7: 'bg-violet-500/100' },
  },
  slate: {
    solid: 'bg-slate-500',
    foreground: 'text-slate-50',
    grid: { 1: 'bg-slate-500/10', 2: 'bg-slate-500/25', 3: 'bg-slate-500/40', 4: 'bg-slate-500/55', 5: 'bg-slate-500/70', 6: 'bg-slate-500/85', 7: 'bg-slate-500/100' },
  },
  blue: {
    solid: 'bg-blue-500',
    foreground: 'text-blue-50',
    grid: { 1: 'bg-blue-500/10', 2: 'bg-blue-500/25', 3: 'bg-blue-500/40', 4: 'bg-blue-500/55', 5: 'bg-blue-500/70', 6: 'bg-blue-500/85', 7: 'bg-blue-500/100' },
  },
} as const;


export type BlockColor = keyof typeof BLOCK_COLORS | string;

// Each hour is divided into 6 slots of 10 minutes each.
// Total slots in a day = 24 * 6 = 144.
export type TimeBlock = {
  isRecurring: boolean;
  id: string;
  startTime: number; // Slot index from 0 to 143
  duration: number; // Number of 10-minute slots
  title: string;
  color: BlockColor;
  reminderLeadTime: number; // in minutes. 0 for no reminder.
  deadlineFor?: string; // Optional: ID of the inbox item this block is a deadline for.
};

export type RecurringBlock = {
  id: string;
  startTime: number; // Slot index from 0 to 143
  duration: number; // Number of 10-minute slots
  title: string;
  color: BlockColor;
  daysOfWeek: number[]; // 0 for Sunday, 1 for Monday, etc.
  reminderLeadTime: number; // in minutes. 0 for no reminder.
};

export type ScheduleBlock = (TimeBlock | RecurringBlock) & {
  isRecurring?: boolean;
};

export const PILLARS = {
  Mind: ['work', 'study', 'project', 'meeting', 'deep work', 'focus', 'learn', 'read', 'code', 'kerja', 'belajar', 'proyek', 'fokus', 'baca', 'koding', 'bookopen', 'braincircuit'],
  Body: ['exercise', 'walk', 'run', 'gym', 'sport', 'sleep', 'nap', 'bike', 'olahraga', 'lari', 'rutin pagi', 'tidur', 'sepeda', 'dumbbell', 'salad', 'carrot', 'beddouble', 'glasswater'],
  Soul: ['leisure', 'hobby', 'read', 'game', 'movie', 'meditate', 'journal', 'relax', 'wind', 'paint', 'music', 'hobi', 'baca', 'main', 'kreatif', 'meditasi', 'jurnal', 'santai', 'guitar', 'footprints', 'heart', 'paintbrush', 'palette', 'sparkles', 'pensquare'],
  Social: ['friends', 'family', 'social', 'users', 'date', 'talk', 'message', 'phone', 'teman', 'keluarga', 'sosial', 'users', 'messagesquare', 'phone'],
  Wealth: ['finance', 'budget', 'invest', 'work', 'project', 'dollar', 'piggy', 'keuangan', 'investasi', 'kerja', 'proyek', 'briefcase', 'trendingup', 'dollarsign', 'piggybank'],
} as const;

export type Pillar = keyof typeof PILLARS;
export const pillarNames = Object.keys(PILLARS) as Pillar[];

export type HabitIconName = (typeof habitIconNames)[number];
export type HabitColor = BlockColor;
export type Habit = {
  id: string;
  title: string;
  description: string;
  icon: HabitIconName;
  color: HabitColor;
  pillar: Pillar;
  goalId?: string; // Optional: ID of the goal this habit supports
};

export type Goal = {
  id: string;
  name: string;
  targetDate?: string; // ISO string
  desireIndex: number; // 1-10 scale
  habitIds: string[]; // IDs of the habits that support this goal
};

export type Countdown = {
  id: string;
  title: string;
  targetDate: string; // ISO string
  color: BlockColor;
  icon: HabitIconName;
};

export type EisenhowerQuadrant = 'URGENT_IMPORTANT' | 'NOT_URGENT_IMPORTANT' | 'URGENT_NOT_IMPORTANT' | 'NOT_URGENT_NOT_IMPORTANT';
export const eisenhowerQuadrants: EisenhowerQuadrant[] = ['URGENT_IMPORTANT', 'NOT_URGENT_IMPORTANT', 'URGENT_NOT_IMPORTANT', 'NOT_URGENT_NOT_IMPORTANT'];

export interface KanbanColumn {
  id: 'todo' | 'in-progress' | 'done';
  title: string;
}

export interface InboxItem {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
  isCompleted: boolean;
  quadrant?: EisenhowerQuadrant;
  kanbanColumnId?: KanbanColumn['id'];
  deadline?: string; // ISO date string
  reminderLeadTime?: number; // in minutes
}

export type NavId = 'home' | 'calendar' | 'reports' | 'habits' | 'goals' | 'matrix' | 'achievements' | 'pomodoro' | 'inbox' | 'kanban' | 'countdown';

export type BottomNavPairs = {
    // Slot 1 is now fixed in the UI: Timeblck/Inbox
    slot2: [NavId, NavId];
    slot3: [NavId, NavId];
    slot4: [NavId, NavId];
};

export type AppSettings = Omit<AppSettingsType, 'bottomNavPairs'> & {
    bottomNavPairs: BottomNavPairs;
};

export type ScheduleViewKey = '1' | '2' | '3' | '7';

export type PomodoroMode = 'work' | 'short_break' | 'long_break';
export type PomodoroTechnique = 'pomodoro' | '52_17' | 'ultradian' | 'custom';

export interface PomodoroSettings {
    work: number;
    shortBreak: number;
    longBreak: number;
    longBreakInterval: number;
}

export interface PomodoroState {
    settings: PomodoroSettings;
    mode: PomodoroMode;
    secondsLeft: number;
    isActive: boolean;
    sessionsCompleted: number;
    isLoaded: boolean;
    technique: PomodoroTechnique;
    customSettings: PomodoroSettings; // To store user's custom settings
}
