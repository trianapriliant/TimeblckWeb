'use client';
import * as React from 'react';
import type { AppSettings } from './use-app-settings';
import { useAppSettings as useAppSettingsHook } from './use-app-settings';

interface AppSettingsContextValue {
    settings: AppSettings;
    updateSettings: (newSettings: Partial<AppSettings>) => void;
    isLoaded: boolean;
}

const AppSettingsContext = React.createContext<AppSettingsContextValue | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
    const { settings, updateSettings, isLoaded } = useAppSettingsHook();

    const value = React.useMemo(() => ({
        settings,
        updateSettings,
        isLoaded
    }), [settings, updateSettings, isLoaded]);

    return (
        <AppSettingsContext.Provider value={value}>
            {children}
        </AppSettingsContext.Provider>
    );
}

export function useAppSettings() {
    const context = React.useContext(AppSettingsContext);
    if (context === undefined) {
        throw new Error('useAppSettings must be used within an AppSettingsProvider');
    }
    return context;
}
