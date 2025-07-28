
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PomodoroState, PomodoroSettings, PomodoroTechnique, PomodoroMode } from '@/lib/types';
import { useAuth } from './use-auth';
import { getUserDoc, updateUserDoc } from '@/lib/firebase/firestore';

const LOCAL_STORAGE_KEY = 'timeblck-pomodoro-state-v2';
const FIRESTORE_DOC_KEY = 'pomodoro'; // Key within the user's document

const TECHNIQUE_SETTINGS: Record<Exclude<PomodoroTechnique, 'custom'>, PomodoroSettings> = {
    pomodoro: { work: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4 },
    '52_17': { work: 52, shortBreak: 17, longBreak: 17, longBreakInterval: 2 },
    ultradian: { work: 90, shortBreak: 20, longBreak: 20, longBreakInterval: 1 },
};

const DEFAULT_STATE: PomodoroState = {
    settings: TECHNIQUE_SETTINGS.pomodoro,
    mode: 'work',
    secondsLeft: TECHNIQUE_SETTINGS.pomodoro.work * 60,
    isActive: false,
    sessionsCompleted: 0,
    isLoaded: false,
    technique: 'pomodoro',
    customSettings: { work: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4 },
};

export function usePomodoroState() {
    const { user, loading: authLoading } = useAuth();
    const [state, setState] = useState<PomodoroState>(DEFAULT_STATE);
    const audioRef = useRef<HTMLAudioElement>(null);
    
    // Global Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (state.isActive && state.isLoaded) {
            interval = setInterval(() => {
                 setState(prev => {
                    if (!prev.isActive || prev.secondsLeft <= 0) return prev;

                    const newSecondsLeft = prev.secondsLeft - 1;

                    if (newSecondsLeft > 0) {
                        return { ...prev, secondsLeft: newSecondsLeft };
                    }

                    // Timer finished, play sound
                    audioRef.current?.play();
                    
                    // Logic to switch modes
                    const newSessionsCompleted = prev.mode === 'work' ? prev.sessionsCompleted + 1 : prev.sessionsCompleted;
                    const isLongBreak = newSessionsCompleted > 0 && newSessionsCompleted % prev.settings.longBreakInterval === 0;
                    
                    const nextMode = prev.mode === 'work'
                        ? (isLongBreak ? 'long_break' : 'short_break')
                        : 'work';
                    
                    const nextDurationKey = nextMode === 'short_break' ? 'shortBreak' : nextMode === 'long_break' ? 'longBreak' : 'work';
                    const newSeconds = prev.settings[nextDurationKey] * 60;
                    
                    const notificationTitle = prev.mode === 'work' ? "Focus session over!" : "Break's over!";
                    const notificationBody = `Time to start your ${nextMode.replace('_', ' ')} session.`;

                    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                      new Notification(notificationTitle, { body: notificationBody, icon: '/icon.svg' });
                    }

                    return {
                        ...prev,
                        mode: nextMode,
                        isActive: true, // Keep it active for the next session
                        secondsLeft: newSeconds,
                        sessionsCompleted: newSessionsCompleted,
                    };
                });
            }, 1000);
        }
        return () => {
          if (interval) clearInterval(interval);
        };
    }, [state.isActive, state.isLoaded]);

    useEffect(() => {
        const loadState = async () => {
            if (authLoading) return;

            let loadedState: Partial<PomodoroState> = {};
            if (user) {
                const userDoc = await getUserDoc(user.uid);
                const firestoreState = userDoc?.[FIRESTORE_DOC_KEY];
                
                const localStateString = window.localStorage.getItem(LOCAL_STORAGE_KEY);
                if (localStateString) {
                    const localState = JSON.parse(localStateString);
                    if (!firestoreState && localState) {
                        console.log('Migrating pomodoro state to Firestore...');
                        await updateUserDoc(user.uid, { [FIRESTORE_DOC_KEY]: localState });
                        loadedState = localState;
                        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
                    } else {
                        loadedState = firestoreState || {};
                    }
                } else {
                    loadedState = firestoreState || {};
                }
            } else {
                const localStateString = window.localStorage.getItem(LOCAL_STORAGE_KEY);
                loadedState = localStateString ? JSON.parse(localStateString) : {};
            }

            const technique = loadedState.technique || DEFAULT_STATE.technique;
            const customSettings = loadedState.customSettings || DEFAULT_STATE.customSettings;
            const currentSettings = technique === 'custom' ? customSettings : TECHNIQUE_SETTINGS[technique];

            setState(prev => ({
                ...prev, // Keep default state as base
                ...loadedState,
                isActive: false, // Always start paused on load
                settings: currentSettings,
                customSettings,
                isLoaded: true
            }));
        };
        loadState();
    }, [user, authLoading]);

    useEffect(() => {
        if (!state.isLoaded) return;
        
        const saveState = async () => {
            const { settings, isLoaded, ...stateToSave } = state;
            if (user) {
                await updateUserDoc(user.uid, { [FIRESTORE_DOC_KEY]: stateToSave });
            } else {
                window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
            }
        };

        const timer = setTimeout(saveState, 1000);
        return () => clearTimeout(timer);
    }, [state, user]);

    const setTechnique = useCallback((newTechnique: PomodoroTechnique) => {
        setState(prev => {
            const newSettings = newTechnique === 'custom' ? prev.customSettings : TECHNIQUE_SETTINGS[newTechnique];
            const newSecondsLeft = newSettings.work * 60;

            return {
                ...prev,
                technique: newTechnique,
                settings: newSettings,
                isActive: false,
                mode: 'work',
                secondsLeft: newSecondsLeft,
            };
        });
    }, []);

    const setMode = useCallback((newMode: PomodoroMode) => {
        setState(prev => {
            if (prev.isActive) return prev;
            const durationKey = newMode === 'short_break' ? 'shortBreak' : newMode === 'long_break' ? 'longBreak' : 'work';
            const newSeconds = prev.settings[durationKey] * 60;
            return {
                ...prev,
                mode: newMode,
                isActive: false,
                secondsLeft: newSeconds,
            }
        });
    }, []);

    const handleStartPause = useCallback(() => {
        setState(prev => ({ ...prev, isActive: !prev.isActive }));
    }, []);
    
    const handleReset = useCallback(() => {
         setState(prev => {
             const durationKey = prev.mode === 'short_break' ? 'shortBreak' : prev.mode === 'long_break' ? 'longBreak' : 'work';
             const newSeconds = prev.settings[durationKey] * 60;
             return {
                 ...prev,
                 isActive: false,
                 secondsLeft: newSeconds
             }
         })
    }, []);

    const saveSettings = useCallback((newSettings: PomodoroSettings) => {
        setState(prev => {
            const newSeconds = newSettings.work * 60;
            return {
                ...prev,
                settings: newSettings,
                customSettings: newSettings,
                technique: 'custom',
                isActive: false,
                mode: 'work',
                secondsLeft: newSeconds,
            }
        })
    }, []);

    return { ...state, audioRef, handleStartPause, handleReset, setMode, setTechnique, saveSettings };
}
