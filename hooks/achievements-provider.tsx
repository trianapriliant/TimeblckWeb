
'use client';

import * as React from 'react';
import { useAchievementsState } from './use-achievements';
import type { AchievementDefinition } from '@/lib/achievements';

export interface UnlockedAchievement extends AchievementDefinition {
    unlockedDate: string | null;
}

interface AchievementsContextValue {
    achievements: UnlockedAchievement[];
    isLoaded: boolean;
}

const AchievementsContext = React.createContext<AchievementsContextValue | undefined>(undefined);

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
    const achievementsState = useAchievementsState();

    return (
        <AchievementsContext.Provider value={achievementsState}>
            {children}
        </AchievementsContext.Provider>
    );
}

export function useAchievements() {
    const context = React.useContext(AchievementsContext);
    if (context === undefined) {
        throw new Error('useAchievements must be used within an AchievementsProvider');
    }
    return context;
}
