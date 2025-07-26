
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Goal } from '@/lib/types';
import { useAuth } from './use-auth';
import { getSubcollection, saveToSubcollection, deleteFromSubcollection, migrateCollection } from '@/lib/firebase/firestore';

const LOCAL_STORAGE_KEY = 'timeblck-goals-v2';
const FIRESTORE_COLLECTION = 'goals';

export function useGoalsState() {
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      if (authLoading) return;
      if (user) {
        const firestoreData = await getSubcollection<Goal>(user.uid, FIRESTORE_COLLECTION);
        const localDataString = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localDataString) {
          const localData = JSON.parse(localDataString);
          if (firestoreData.length === 0 && localData.length > 0) {
            console.log('Migrating goals to Firestore...');
            await migrateCollection(user.uid, FIRESTORE_COLLECTION, localData);
            setGoals(localData);
            window.localStorage.removeItem(LOCAL_STORAGE_KEY);
          } else {
            setGoals(firestoreData);
          }
        } else {
          setGoals(firestoreData);
        }
      } else {
        const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        setGoals(item ? JSON.parse(item) : []);
      }
      setIsLoaded(true);
    };
    loadState();
  }, [user, authLoading]);

  // Persist for guest users
  useEffect(() => {
    if (isLoaded && !user) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
    }
  }, [goals, isLoaded, user]);

  const addGoal = useCallback((newGoalData: Omit<Goal, 'id'>): Goal => {
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      ...newGoalData,
    };
    setGoals((prev) => [...prev, newGoal]);
    if (user) {
      saveToSubcollection(user.uid, FIRESTORE_COLLECTION, newGoal);
    }
    return newGoal;
  }, [user]);

  const updateGoal = useCallback((id: string, updatedData: Partial<Omit<Goal, 'id'>>) => {
    let finalGoal: Goal | undefined;
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          finalGoal = { ...g, ...updatedData };
          return finalGoal;
        }
        return g;
      })
    );
    if (user && finalGoal) {
      saveToSubcollection(user.uid, FIRESTORE_COLLECTION, finalGoal);
    }
  }, [user]);

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (user) {
      deleteFromSubcollection(user.uid, FIRESTORE_COLLECTION, id);
    }
  }, [user]);

  return { goals, addGoal, updateGoal, deleteGoal, isLoaded };
}

export type { Goal };
