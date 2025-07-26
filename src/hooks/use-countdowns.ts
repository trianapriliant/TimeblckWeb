
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Countdown } from '@/lib/types';
import { useAuth } from './use-auth';
import { getSubcollection, migrateCollection, saveToSubcollection, deleteFromSubcollection } from '@/lib/firebase/firestore';

const LOCAL_STORAGE_KEY = 'timeblck-countdowns';
const FIRESTORE_COLLECTION = 'countdowns';

export function useCountdownState() {
  const { user, loading: authLoading } = useAuth();
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      if (authLoading) return;
      if (user) {
        const firestoreData = await getSubcollection<Countdown>(user.uid, FIRESTORE_COLLECTION);
        const localDataString = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localDataString) {
          const localData = JSON.parse(localDataString);
          if (firestoreData.length === 0 && localData.length > 0) {
            console.log('Migrating countdowns to Firestore...');
            await migrateCollection(user.uid, FIRESTORE_COLLECTION, localData);
            setCountdowns(localData);
            window.localStorage.removeItem(LOCAL_STORAGE_KEY);
          } else {
            setCountdowns(firestoreData);
          }
        } else {
          setCountdowns(firestoreData);
        }
      } else {
        const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        setCountdowns(stored ? JSON.parse(stored) : []);
      }
      setIsLoaded(true);
    };
    loadState();
  }, [user, authLoading]);

  // Persist for guest users
  useEffect(() => {
    if (isLoaded && !user) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(countdowns));
    }
  }, [countdowns, isLoaded, user]);

  const addCountdown = useCallback((data: Omit<Countdown, 'id'>) => {
    const newCountdown: Countdown = {
      id: crypto.randomUUID(),
      ...data,
    };
    setCountdowns((prev) => [...prev, newCountdown]);
    if (user) {
      saveToSubcollection(user.uid, FIRESTORE_COLLECTION, newCountdown);
    }
    return newCountdown;
  }, [user]);
  
  const updateCountdown = useCallback((id: string, data: Partial<Omit<Countdown, 'id'>>) => {
      let finalCountdown: Countdown | undefined;
      setCountdowns(prev => prev.map(item => {
        if (item.id === id) {
          finalCountdown = { ...item, ...data, id };
          return finalCountdown;
        }
        return item;
      }));
      if (user && finalCountdown) {
        saveToSubcollection(user.uid, FIRESTORE_COLLECTION, finalCountdown);
      }
  }, [user]);

  const deleteCountdown = useCallback((id: string) => {
    setCountdowns((prev) => prev.filter((item) => item.id !== id));
    if (user) {
      deleteFromSubcollection(user.uid, FIRESTORE_COLLECTION, id);
    }
  }, [user]);

  return { countdowns, addCountdown, updateCountdown, deleteCountdown, isLoaded };
}
