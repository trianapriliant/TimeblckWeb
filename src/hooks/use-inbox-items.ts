
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { InboxItem } from '@/lib/types';
import { useAuth } from './use-auth';
import { getSubcollection, migrateCollection, saveToSubcollection, deleteFromSubcollection } from '@/lib/firebase/firestore';

const LOCAL_STORAGE_KEY = 'timeblck-inbox-items-v2';
const FIRESTORE_COLLECTION = 'inboxItems';

export function useInboxState() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      if (authLoading) return;
      if (user) {
        const firestoreData = await getSubcollection<InboxItem>(user.uid, FIRESTORE_COLLECTION);
        const localDataString = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localDataString) {
          const localData = JSON.parse(localDataString);
          if (firestoreData.length === 0 && localData.length > 0) {
            console.log('Migrating inbox items to Firestore...');
            await migrateCollection(user.uid, FIRESTORE_COLLECTION, localData);
            setItems(localData);
            window.localStorage.removeItem(LOCAL_STORAGE_KEY);
          } else {
            setItems(firestoreData.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          }
        } else {
          setItems(firestoreData.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }
      } else {
        const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        setItems(item ? JSON.parse(item) : []);
      }
      setIsLoaded(true);
    };
    loadState();
  }, [user, authLoading]);

  // Persist for guest users
  useEffect(() => {
    if (isLoaded && !user) {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded, user]);

  const addItem = useCallback((data: Omit<InboxItem, 'id' | 'createdAt' | 'isCompleted'>) => {
    const newItem: InboxItem = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isCompleted: false,
      ...data,
      kanbanColumnId: data.kanbanColumnId === 'none' ? undefined : data.kanbanColumnId
    };
    setItems((prev) => [newItem, ...prev]);
    if (user) {
        saveToSubcollection(user.uid, FIRESTORE_COLLECTION, newItem);
    }
    return newItem;
  }, [user]);
  
  const updateItem = useCallback((id: string, data: Partial<Omit<InboxItem, 'id' | 'createdAt'>>) => {
      let finalItem: InboxItem | undefined;
      setItems(prev => prev.map(item => {
          if (item.id === id) {
              const updatedItem = { ...item, ...data };
              if (updatedItem.kanbanColumnId === 'none') {
                delete updatedItem.kanbanColumnId;
              }
              finalItem = updatedItem;
              return finalItem;
          }
          return item;
      }));
      if (user && finalItem) {
        saveToSubcollection(user.uid, FIRESTORE_COLLECTION, finalItem);
      }
  }, [user]);

  const deleteItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (user) {
        deleteFromSubcollection(user.uid, FIRESTORE_COLLECTION, id);
    }
  }, [user]);

  const toggleItemCompletion = useCallback((id: string) => {
    let finalItem: InboxItem | undefined;
    setItems((prev) =>
        prev.map((item) => {
            if (item.id === id) {
                finalItem = { ...item, isCompleted: !item.isCompleted };
                return finalItem;
            }
            return item;
        })
    );
    if (user && finalItem) {
        saveToSubcollection(user.uid, FIRESTORE_COLLECTION, finalItem);
    }
  }, [user]);

  return { items, addItem, updateItem, deleteItem, toggleItemCompletion, isLoaded };
}
