
'use client';

import * as React from 'react';
import { useGoalsState, Goal } from './use-goals';

interface GoalsContextValue {
    goals: Goal[];
    addGoal: (newGoalData: Omit<Goal, 'id'>) => void;
    updateGoal: (id: string, updatedData: Partial<Omit<Goal, 'id'>>) => void;
    deleteGoal: (id: string) => void;
    isLoaded: boolean;
}

const GoalsContext = React.createContext<GoalsContextValue | undefined>(undefined);

export function GoalsProvider({ children }: { children: React.ReactNode }) {
    const goalsState = useGoalsState();

    return (
        <GoalsContext.Provider value={goalsState}>
            {children}
        </GoalsContext.Provider>
    );
}

export function useGoals() {
    const context = React.useContext(GoalsContext);
    if (context === undefined) {
        throw new Error('useGoals must be used within a GoalsProvider');
    }
    return context;
}
