
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { allNavItems } from '@/lib/navigation';
import type { NavId, BottomNavPairs } from '@/lib/types';
import { useAuth } from './use-auth';
import { getUserDoc, updateUserDoc } from '@/lib/firebase/firestore';

const LOCAL_STORAGE_KEY = 'timeblck-app-settings';
const FIRESTORE_DOC_KEY = 'settings'; // Changed to a sub-key for clarity

export interface AppSettings {
  startHour: number;
  timeFormat: '12h' | '24h';
  blockShape: 'rounded' | 'sharp' | 'solid';
  isPremium: boolean;
  language: 'id' | 'en';
  navigationItems: NavId[];
  bottomNavPairs: BottomNavPairs;
}

const DEFAULT_SETTINGS: AppSettings = {
  startHour: 3,
  timeFormat: '12h',
  blockShape: 'rounded',
  isPremium: false,
  language: 'id',
  navigationItems: allNavItems.map(item => item.id),
  bottomNavPairs: {
    slot2: ['habits', 'goals'],
    slot3: ['matrix', 'kanban'],
    slot4: ['reports', 'achievements'],
  },
};

export function useAppSettings() {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const isSavingRef = useRef(false);

  // Load settings on mount or when auth state changes
  useEffect(() => {
    const loadSettings = async () => {
      if (authLoading) return; // Wait for authentication to resolve

      if (user) {
        // User is logged in, fetch from Firestore
        const userDoc = await getUserDoc(user.uid);
        const firestoreSettings = userDoc?.[FIRESTORE_DOC_KEY];
        if (firestoreSettings) {
          // Merge Firestore settings with defaults to ensure all keys are present
          setSettings(prev => ({ ...DEFAULT_SETTINGS, ...firestoreSettings }));
        } else {
          // New user, use local settings and prepare to sync
          const localSettings = getLocalSettings();
          setSettings(localSettings);
          // Sync to Firestore for the first time
          await updateUserDoc(user.uid, { [FIRESTORE_DOC_KEY]: localSettings });
        }
      } else {
        // User is a guest, use localStorage
        setSettings(getLocalSettings());
      }
      setIsLoaded(true);
    };

    loadSettings();
  }, [user, authLoading]);
  
  const getLocalSettings = () => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        const stored = JSON.parse(item);
        // Data sanitization for older versions
        delete stored.theme;
        delete stored.mode;
        if (!stored.bottomNavPairs || stored.bottomNavPairs.slot1) {
          stored.bottomNavPairs = DEFAULT_SETTINGS.bottomNavPairs;
        }
        return { ...DEFAULT_SETTINGS, ...stored };
      }
    } catch (error) {
      console.error('Failed to load local settings', error);
    }
    return DEFAULT_SETTINGS;
  };

  // Persist settings
  useEffect(() => {
    if (!isLoaded || isSavingRef.current) return;

    const saveSettings = async () => {
        isSavingRef.current = true;
        if (user) {
            await updateUserDoc(user.uid, { [FIRESTORE_DOC_KEY]: settings });
        } else {
            try {
                window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
            } catch (error) {
                console.error('Failed to save settings to localStorage', error);
            }
        }
        isSavingRef.current = false;
    };
    
    // Use a timeout to batch updates
    const timer = setTimeout(saveSettings, 500);
    return () => clearTimeout(timer);

  }, [settings, user, isLoaded]);

  // Apply language to DOM
  useEffect(() => {
    if (settings.language) {
      document.documentElement.lang = settings.language;
    }
  }, [settings.language]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return { settings, updateSettings, isLoaded };
}
