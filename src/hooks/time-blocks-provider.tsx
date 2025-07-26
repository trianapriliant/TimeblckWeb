
'use client';

import * as React from 'react';
import type { RecurringBlock, ScheduleBlock, TimeBlock } from '@/lib/types';
import { useTimeBlocksState } from './use-time-blocks';

interface TimeBlocksContextValue {
    blocksByDate: Record<string, TimeBlock[]>;
    addBlock: (date: Date, newBlockData: Omit<TimeBlock, 'id'>, onConflict?: (conflictingBlock: ScheduleBlock, action: () => void) => void) => void;
    updateBlock: (date: Date, id: string, updatedData: Partial<TimeBlock>, onConflict?: (conflictingBlock: ScheduleBlock, action: () => void) => void) => void;
    deleteBlock: (date: Date, id: string) => void;
    isLoaded: boolean;
    getScheduleForDate: (date: Date) => Map<number, ScheduleBlock>;
    findNextAvailableSlot: (date: Date, duration: number, startSlot: number) => number | null;
}

const TimeBlocksContext = React.createContext<TimeBlocksContextValue | undefined>(undefined);

export function TimeBlocksProvider({ children }: { children: React.ReactNode }) {
    const timeBlocksState = useTimeBlocksState();

    return (
        <TimeBlocksContext.Provider value={timeBlocksState}>
            {children}
        </TimeBlocksContext.Provider>
    );
}

export function useTimeBlocks() {
    const context = React.useContext(TimeBlocksContext);
    if (context === undefined) {
        throw new Error('useTimeBlocks must be used within a TimeBlocksProvider');
    }
    return context;
}
