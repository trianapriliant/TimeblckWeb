
'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, getDay, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import type { TimeBlock, RecurringBlock, ScheduleBlock } from '@/lib/types';
import { useRecurringBlocks } from './use-recurring-blocks';
import { useAuth } from './use-auth';
import { getUserDoc, updateUserDoc } from '@/lib/firebase/firestore';

const LOCAL_STORAGE_KEY = 'timeblck-data';
const FIRESTORE_DOC_KEY = 'timeblocks'; // Key within the user's document
const SLOTS_PER_DAY = 144; // 24 hours * 6 slots/hour

export function useTimeBlocksState() {
  const { user, loading: authLoading } = useAuth();
  const [blocksByDate, setBlocksByDate] = useState<Record<string, TimeBlock[]>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const { recurringBlocks } = useRecurringBlocks();

  // Load state from appropriate source
  useEffect(() => {
    const loadState = async () => {
      if (authLoading) return;

      if (user) {
        const userDoc = await getUserDoc(user.uid);
        const firestoreData = userDoc?.[FIRESTORE_DOC_KEY] || {};
        
        // Migration logic
        const localDataString = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localDataString) {
          const localData = JSON.parse(localDataString);
          // If Firestore is empty and local has data, migrate
          if (Object.keys(firestoreData).length === 0 && Object.keys(localData).length > 0) {
            console.log('Migrating time blocks to Firestore...');
            setBlocksByDate(localData);
            await updateUserDoc(user.uid, { [FIRESTORE_DOC_KEY]: localData });
            window.localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear local after migration
          } else {
            setBlocksByDate(firestoreData);
          }
        } else {
            setBlocksByDate(firestoreData);
        }

      } else {
        // Guest user
        try {
          const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
          setBlocksByDate(item ? JSON.parse(item) : {});
        } catch (error) {
          console.error('Failed to load guest time blocks:', error);
          setBlocksByDate({});
        }
      }
      setIsLoaded(true);
    };
    loadState();
  }, [user, authLoading]);

  // Persist state to appropriate source
  useEffect(() => {
    if (!isLoaded) return;
    
    const saveState = async () => {
        if (user) {
            await updateUserDoc(user.uid, { [FIRESTORE_DOC_KEY]: blocksByDate });
        } else {
            try {
                window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(blocksByDate));
            } catch (error) {
                console.error('Failed to save guest time blocks:', error);
            }
        }
    };
    
    // Debounce saving
    const timer = setTimeout(saveState, 1000);
    return () => clearTimeout(timer);

  }, [blocksByDate, isLoaded, user]);

  const getScheduleForDate = useCallback((date: Date): Map<number, ScheduleBlock> => {
    const daySchedule = new Map<number, ScheduleBlock>();
    const normalizedDate = startOfDay(date);

    const processRecurringBlock = (rb: RecurringBlock, dayToCheck: Date, dateKey: string) => {
        // Check if the template is active on this day
        if (!rb.daysOfWeek.includes(getDay(dayToCheck))) return;

        // Check if the template is within its date range
        if (rb.startDate || rb.endDate) {
            const range = {
                start: rb.startDate ? startOfDay(new Date(rb.startDate)) : new Date(0),
                end: rb.endDate ? endOfDay(new Date(rb.endDate)) : new Date(8640000000000000),
            };
            if (!isWithinInterval(dayToCheck, range)) return;
        }

        return { ...rb, id: `recurring-${rb.id}-${dateKey}`, isRecurring: true };
    };

    // --- Process recurring blocks from the PREVIOUS day that might spill over ---
    const previousDay = subDays(normalizedDate, 1);
    const previousDateKey = format(previousDay, 'yyyy-MM-dd');

    recurringBlocks.forEach(rb => {
        const block = processRecurringBlock(rb, previousDay, previousDateKey);
        if (block) {
            const spillOverDuration = (block.startTime + block.duration) - SLOTS_PER_DAY;
            if (spillOverDuration > 0) {
                for (let i = 0; i < spillOverDuration; i++) {
                    daySchedule.set(i, { ...block, id: `${block.id}-spillover` });
                }
            }
        }
    });

    // --- Process recurring blocks for the CURRENT day ---
    const currentDateKey = format(normalizedDate, 'yyyy-MM-dd');
    recurringBlocks.forEach(rb => {
        const block = processRecurringBlock(rb, normalizedDate, currentDateKey);
        if (block) {
            for (let i = 0; i < block.duration; i++) {
                const slot = block.startTime + i;
                if (slot < SLOTS_PER_DAY && !daySchedule.has(slot)) {
                    daySchedule.set(slot, block);
                }
            }
        }
    });

    // --- Process one-off time blocks for the CURRENT day ---
    (blocksByDate[currentDateKey] || []).forEach(block => {
      for (let i = 0; i < block.duration; i++) {
        const slot = block.startTime + i;
         if (slot < SLOTS_PER_DAY) {
          daySchedule.set(slot, block);
        }
      }
    });
    
    return daySchedule;
  }, [blocksByDate, recurringBlocks]);
  
  const findNextAvailableSlot = useCallback((date: Date, duration: number, startSlot: number): number | null => {
      const schedule = getScheduleForDate(date);
      for (let i = startSlot; i <= SLOTS_PER_DAY - duration; i++) {
          let isFree = true;
          for (let j = 0; j < duration; j++) {
              if (schedule.has(i + j)) {
                  isFree = false;
                  break;
              }
          }
          if (isFree) {
              return i;
          }
      }
      return null;
  }, [getScheduleForDate]);


  const checkConflict = useCallback((date: Date, newBlock: { startTime: number; duration: number }, ignoreId?: string): ScheduleBlock | null => {
    const schedule = getScheduleForDate(date);
    for (let i = 0; i < newBlock.duration; i++) {
      const slot = newBlock.startTime + i;
      const existingBlock = schedule.get(slot);
      if (existingBlock && existingBlock.id !== ignoreId) {
        return existingBlock;
      }
    }
    return null;
  }, [getScheduleForDate]);

  const addBlock = useCallback((date: Date, newBlockData: Omit<TimeBlock, 'id'>, onConflict?: (conflictingBlock: ScheduleBlock, action: () => void) => void) => {
    const performAdd = () => {
      const dateKey = format(date, 'yyyy-MM-dd');
      const newBlock: TimeBlock = {
        id: crypto.randomUUID(),
        ...newBlockData,
        isRecurring: false,
      };
      setBlocksByDate((prev) => {
          const currentBlocks = prev[dateKey] || [];
          const updatedBlocks = [...currentBlocks, newBlock].sort((a,b) => a.startTime - b.startTime);
          return { ...prev, [dateKey]: updatedBlocks };
      });
    }

    const conflictingBlock = checkConflict(date, newBlockData);
    if (conflictingBlock && onConflict) {
        onConflict(conflictingBlock, performAdd);
    } else if (!conflictingBlock) {
        performAdd();
    }
  }, [checkConflict]);

  const updateBlock = useCallback((date: Date, id: string, updatedData: Partial<TimeBlock>, onConflict?: (conflictingBlock: ScheduleBlock, action: () => void) => void) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const originalBlock = blocksByDate[dateKey]?.find(b => b.id === id);

    if (!originalBlock) return;
    
    const newBlockState = { ...originalBlock, ...updatedData };

    const performUpdate = () => {
      setBlocksByDate((prev) => {
          const currentBlocks = prev[dateKey] || [];
          const updatedBlocks = currentBlocks
              .map((b) => (b.id === id ? newBlockState : b))
              .sort((a, b) => a.startTime - b.startTime);
          return { ...prev, [dateKey]: updatedBlocks };
      });
    };
    
    const conflictingBlock = checkConflict(date, newBlockState, id);
    if (conflictingBlock && onConflict) {
        onConflict(conflictingBlock, performUpdate);
    } else if (!conflictingBlock) {
        performUpdate();
    }
  }, [blocksByDate, checkConflict]);

  const deleteBlock = useCallback((date: Date, id: string) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    setBlocksByDate((prev) => {
        const currentBlocks = prev[dateKey] || [];
        const updatedBlocks = currentBlocks.filter((b) => b.id !== id);
        if (updatedBlocks.length > 0) {
            return { ...prev, [dateKey]: updatedBlocks };
        } else {
            const newState = { ...prev };
            delete newState[dateKey];
            return newState;
        }
    });
  }, []);
  
  return { blocksByDate, addBlock, updateBlock, deleteBlock, isLoaded, getScheduleForDate, findNextAvailableSlot };
}
