
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTimeBlocks } from './time-blocks-provider';
import { useRecurringBlocks } from './use-recurring-blocks';
import { useHabits } from './habits-provider';
import { useGoals } from './goals-provider';
import { useAppSettings } from './app-settings-provider';
import { achievementList } from '@/lib/achievements';
import type { UnlockedAchievement } from './achievements-provider';
import { useAuth } from './use-auth';
import { getUserDoc, updateUserDoc } from '@/lib/firebase/firestore';

const LOCAL_STORAGE_KEY = 'timeblck-unlocked-achievements';
const FIRESTORE_DOC_KEY = 'unlockedAchievements';

export function useAchievementsState() {
    const { user, loading: authLoading } = useAuth();
    const { blocksByDate, isLoaded: isBlocksLoaded } = useTimeBlocks();
    const { recurringBlocks, isLoaded: isRecurringLoaded } = useRecurringBlocks();
    const { habits, habitData, isLoaded: isHabitsLoaded } = useHabits();
    const { goals, isLoaded: isGoalsLoaded } = useGoals();
    const { settings, isLoaded: isSettingsLoaded } = useAppSettings();
    
    const [unlocked, setUnlocked] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from appropriate source
    useEffect(() => {
        const loadState = async () => {
            if (authLoading) return;
            if (user) {
                const userDoc = await getUserDoc(user.uid);
                const firestoreData = userDoc?.[FIRESTORE_DOC_KEY] || {};
                
                const localDataString = window.localStorage.getItem(LOCAL_STORAGE_KEY);
                if (localDataString) {
                    const localData = JSON.parse(localDataString);
                    if (Object.keys(firestoreData).length === 0 && Object.keys(localData).length > 0) {
                        console.log('Migrating achievements to Firestore...');
                        await updateUserDoc(user.uid, { [FIRESTORE_DOC_KEY]: localData });
                        setUnlocked(localData);
                        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
                    } else {
                        setUnlocked(firestoreData);
                    }
                } else {
                    setUnlocked(firestoreData);
                }
            } else {
                const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
                setUnlocked(item ? JSON.parse(item) : {});
            }
            setIsLoaded(true);
        };
        loadState();
    }, [user, authLoading]);

    // Check for new achievements and persist
    useEffect(() => {
        const allDataLoaded = isBlocksLoaded && isRecurringLoaded && isHabitsLoaded && isGoalsLoaded && isSettingsLoaded && isLoaded;
        if (!allDataLoaded) return;

        const userData = {
            blocksByDate,
            recurringBlocksCount: recurringBlocks.length,
            habits,
            habitData,
            goals,
            settings,
        };

        let newAchievementsFound = false;
        const newUnlocked = { ...unlocked };
        
        achievementList.forEach(achievement => {
            if (!newUnlocked[achievement.id]) {
                if (achievement.check(userData)) {
                    newUnlocked[achievement.id] = new Date().toISOString();
                    newAchievementsFound = true;
                }
            }
        });
        
        if (newAchievementsFound) {
            setUnlocked(newUnlocked);
            const saveAchievements = async () => {
                if (user) {
                    await updateUserDoc(user.uid, { [FIRESTORE_DOC_KEY]: newUnlocked });
                } else {
                    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newUnlocked));
                }
            };
            saveAchievements();
        }

    }, [
        isBlocksLoaded, isRecurringLoaded, isHabitsLoaded, isGoalsLoaded, isSettingsLoaded, isLoaded,
        blocksByDate, recurringBlocks, habits, habitData, goals, settings, user, unlocked
    ]);

    const achievements: UnlockedAchievement[] = useMemo(() => {
        return achievementList.map(def => ({
            ...def,
            unlockedDate: unlocked[def.id] || null,
        })).sort((a,b) => {
            if (a.unlockedDate && !b.unlockedDate) return -1;
            if (!a.unlockedDate && b.unlockedDate) return 1;
            return 0;
        });
    }, [unlocked]);


    return {
        achievements,
        isLoaded: isLoaded && isBlocksLoaded && isRecurringLoaded && isHabitsLoaded && isGoalsLoaded && isSettingsLoaded,
    };
}
