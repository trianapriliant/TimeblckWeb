
'use client';

import * as React from 'react';
import type { BlockColor } from '@/lib/types';

export interface UpcomingReminder {
    id: string;
    title: string;
    timeToStart: number; // in minutes
    color: BlockColor;
    type: 'block' | 'deadline';
}

interface AppNotificationsContextValue {
    upcomingReminders: UpcomingReminder[];
    setUpcomingReminders: React.Dispatch<React.SetStateAction<UpcomingReminder[]>>;
}

const AppNotificationsContext = React.createContext<AppNotificationsContextValue | undefined>(undefined);

export function AppNotificationsProvider({ children }: { children: React.ReactNode }) {
    const [upcomingReminders, setUpcomingReminders] = React.useState<UpcomingReminder[]>([]);

    const value = React.useMemo(() => ({
        upcomingReminders,
        setUpcomingReminders,
    }), [upcomingReminders]);

    return (
        <AppNotificationsContext.Provider value={value}>
            {children}
        </AppNotificationsContext.Provider>
    );
}

export function useAppNotifications() {
    const context = React.useContext(AppNotificationsContext);
    if (context === undefined) {
        throw new Error('useAppNotifications must be used within an AppNotificationsProvider');
    }
    return context;
}
