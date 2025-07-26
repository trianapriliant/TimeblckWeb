
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import type { Habit } from '@/lib/types';
import { useAuth } from './use-auth';
import { getSubcollection, migrateCollection, saveToSubcollection, deleteFromSubcollection, getUserDoc, updateUserDoc } from '@/lib/firebase/firestore';

const LOCAL_HABITS_KEY = 'timeblck-habits';
const LOCAL_DATA_KEY = 'timeblck-habit-data';
const FIRESTORE_HABITS_COLLECTION = 'habits';
const FIRESTORE_DATA_DOC_KEY = 'habitData';

export function useHabits() {
  const { user, loading: authLoading } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitData, setHabitData] = useState<Map<string, number>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadState = async () => {
        if (authLoading) return;
        
        if (user) {
            // Load habits
            const firestoreHabits = await getSubcollection<Habit>(user.uid, FIRESTORE_HABITS_COLLECTION);
            const localHabits = JSON.parse(window.localStorage.getItem(LOCAL_HABITS_KEY) || '[]');
            if (firestoreHabits.length === 0 && localHabits.length > 0) {
                console.log('Migrating habits to Firestore...');
                await migrateCollection(user.uid, FIRESTORE_HABITS_COLLECTION, localHabits);
                setHabits(localHabits);
                window.localStorage.removeItem(LOCAL_HABITS_KEY);
            } else {
                setHabits(firestoreHabits);
            }

            // Load habit data
            const userDoc = await getUserDoc(user.uid);
            const firestoreData = userDoc?.[FIRESTORE_DATA_DOC_KEY] || {};
            const firestoreMap = new Map(Object.entries(firestoreData));
            
            const localDataString = window.localStorage.getItem(LOCAL_DATA_KEY);
            if (localDataString) {
                const localData = new Map(JSON.parse(localDataString));
                if (firestoreMap.size === 0 && localData.size > 0) {
                    console.log('Migrating habit data to Firestore...');
                    await updateUserDoc(user.uid, { [FIRESTORE_DATA_DOC_KEY]: Object.fromEntries(localData) });
                    setHabitData(localData);
                    window.localStorage.removeItem(LOCAL_DATA_KEY);
                } else {
                    setHabitData(firestoreMap);
                }
            } else {
                setHabitData(firestoreMap);
            }
        } else {
            // Guest user
            const localHabits = JSON.parse(window.localStorage.getItem(LOCAL_HABITS_KEY) || '[]');
            const localData = new Map(JSON.parse(window.localStorage.getItem(LOCAL_DATA_KEY) || '[]'));
            setHabits(localHabits);
            setHabitData(localData);
        }
        setIsLoaded(true);
    };
    loadState();
  }, [user, authLoading]);

  // Persist habits
  useEffect(() => {
    if (!isLoaded) return;
    const saveHabits = async () => {
      if (!user) {
        window.localStorage.setItem(LOCAL_HABITS_KEY, JSON.stringify(habits));
      }
      // For logged-in users, add/update/delete are handled transactionally.
    };
    saveHabits();
  }, [habits, isLoaded, user]);

  // Persist habit data
  useEffect(() => {
      if (!isLoaded) return;
      const saveHabitData = async () => {
        if (user) {
            await updateUserDoc(user.uid, { [FIRESTORE_DATA_DOC_KEY]: Object.fromEntries(habitData) });
        } else {
            window.localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(Array.from(habitData.entries())));
        }
      };
      
      const timer = setTimeout(saveHabitData, 1000);
      return () => clearTimeout(timer);
  }, [habitData, isLoaded, user]);


  const addHabit = useCallback((newHabitData: Omit<Habit, 'id'>) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      ...newHabitData,
    };
    setHabits((prev) => [...prev, newHabit]);
    if (user) {
        saveToSubcollection(user.uid, FIRESTORE_HABITS_COLLECTION, newHabit);
    }
    return newHabit;
  }, [user]);

  const updateHabit = useCallback((id: string, updatedData: Partial<Omit<Habit, 'id'>>) => {
    let finalHabit: Habit | undefined;
    setHabits((prev) =>
      prev.map((h) => {
          if (h.id === id) {
              finalHabit = { ...h, ...updatedData, id };
              return finalHabit;
          }
          return h;
      })
    );
    if (user && finalHabit) {
        saveToSubcollection(user.uid, FIRESTORE_HABITS_COLLECTION, finalHabit);
    }
  }, [user]);

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    if (user) {
        deleteFromSubcollection(user.uid, FIRESTORE_HABITS_COLLECTION, id);
    }
    // Also remove associated check-in data
    setHabitData(prevData => {
        const newData = new Map(prevData);
        for (const key of newData.keys()) {
            if (key.startsWith(`${id}__`)) {
                newData.delete(key);
            }
        }
        return newData;
    })
  }, [user]);
  
  const handleCheckIn = useCallback((habitId: string) => {
    const todayString = format(new Date(), 'yyyy-MM-dd');
    const key = `${habitId}__${todayString}`;

    setHabitData((prevData) => {
      const newData = new Map(prevData);
      const currentIntensity = newData.get(key) || 0;
      // Intensity cycles from 0 -> 1 -> 2 -> 3 -> 4 -> 0 (deleted)
      const nextIntensity = (currentIntensity + 1) % 5;

      if (nextIntensity === 0) {
        newData.delete(key);
      } else {
        newData.set(key, nextIntensity);
      }

      return newData;
    });
  }, []);

  const dataByHabit = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    habits.forEach(habit => {
        map.set(habit.id, new Map());
    });
    for (const [key, value] of habitData.entries()) {
        const [id, date] = key.split('__');
        if (id && date) {
            const habitMap = map.get(id);
            if (habitMap) {
                habitMap.set(date, value);
            }
        }
    }
    return map;
  }, [habits, habitData]);

  const getHabitDataForGrid = useCallback((habitId: string) => {
    return dataByHabit.get(habitId) || new Map<string, number>();
  }, [dataByHabit]);


  const habitConsistencies = useMemo(() => {
    if (!isLoaded) return new Map<string, number>();

    const consistencies = new Map<string, number>();
    const today = new Date();
    const last30Days = eachDayOfInterval({ start: subDays(today, 29), end: today });

    for (const habit of habits) {
      let checkInCount = 0;
      for (const day of last30Days) {
        const dateKey = `${habit.id}__${format(day, 'yyyy-MM-dd')}`;
        if (habitData.has(dateKey)) {
          checkInCount++;
        }
      }
      consistencies.set(habit.id, (checkInCount / 30) * 100);
    }

    return consistencies;
  }, [habits, habitData, isLoaded]);

  return { habits, habitData, handleCheckIn, getHabitDataForGrid, addHabit, updateHabit, deleteHabit, habitConsistencies, isLoaded };
}
