
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RecurringBlock } from '@/lib/types';
import { useAuth } from './use-auth';
import { getSubcollection, migrateCollection, saveToSubcollection, deleteFromSubcollection } from '@/lib/firebase/firestore';

const LOCAL_STORAGE_KEY = 'timeblck-templates';
const FIRESTORE_COLLECTION = 'templates';

export function useRecurringBlocks() {
  const { user, loading: authLoading } = useAuth();
  const [recurringBlocks, setRecurringBlocks] = useState<RecurringBlock[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadState = async () => {
        if (authLoading) return;

        if (user) {
            const firestoreData = await getSubcollection<RecurringBlock>(user.uid, FIRESTORE_COLLECTION);
            
            const localDataString = window.localStorage.getItem(LOCAL_STORAGE_KEY);
            if (localDataString) {
                const localData = JSON.parse(localDataString);
                if (firestoreData.length === 0 && localData.length > 0) {
                    console.log('Migrating recurring blocks to Firestore...');
                    await migrateCollection(user.uid, FIRESTORE_COLLECTION, localData);
                    setRecurringBlocks(localData);
                    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
                } else {
                    setRecurringBlocks(firestoreData.sort((a,b) => a.startTime - b.startTime));
                }
            } else {
                setRecurringBlocks(firestoreData.sort((a,b) => a.startTime - b.startTime));
            }
        } else {
            try {
                const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
                setRecurringBlocks(item ? JSON.parse(item) : []);
            } catch (error) {
                console.error('Failed to load guest recurring blocks:', error);
                setRecurringBlocks([]);
            }
        }
        setIsLoaded(true);
    };
    loadState();
  }, [user, authLoading]);

  const addRecurringBlock = useCallback((newBlock: RecurringBlock) => {
    setRecurringBlocks((prev) => [...prev, newBlock].sort((a,b) => a.startTime - b.startTime));
    if (user) {
        saveToSubcollection(user.uid, FIRESTORE_COLLECTION, newBlock);
    }
  }, [user]);

  const updateRecurringBlock = useCallback((id: string, updatedData: Omit<RecurringBlock, 'id'>) => {
    const blockToUpdate = { id, ...updatedData };
    setRecurringBlocks((prev) =>
      prev.map((b) => (b.id === id ? blockToUpdate : b)).sort((a,b) => a.startTime - b.startTime)
    );
    if (user) {
        saveToSubcollection(user.uid, FIRESTORE_COLLECTION, blockToUpdate);
    }
  }, [user]);

  const deleteRecurringBlock = useCallback((id: string) => {
    setRecurringBlocks((prev) => prev.filter((b) => b.id !== id));
    if (user) {
        deleteFromSubcollection(user.uid, FIRESTORE_COLLECTION, id);
    }
  }, [user]);
  
  // This effect handles saving for guest users
  useEffect(() => {
    if (isLoaded && !user) {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recurringBlocks));
      } catch (error) {
        console.error('Failed to save guest recurring blocks:', error);
      }
    }
  }, [recurringBlocks, isLoaded, user]);
  
  return { recurringBlocks, addRecurringBlock, updateRecurringBlock, deleteRecurringBlock, isLoaded };
}
