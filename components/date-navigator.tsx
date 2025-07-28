'use client';

import * as React from 'react';
import { addDays, format, isSameDay, isToday, startOfWeek, subDays } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from './ui/skeleton';

interface DateNavigatorProps {
  currentDate: Date | null;
  onDateChange: (date: Date) => void;
}

export function DateNavigator({ currentDate, onDateChange }: DateNavigatorProps) {
  const currentWeek = React.useMemo(() => {
    return currentDate ? startOfWeek(currentDate) : null;
  }, [currentDate]);

  const weekDays = React.useMemo(() => {
    if (!currentWeek) return [];
    return Array.from({ length: 7 }).map((_, i) => addDays(currentWeek, i));
  }, [currentWeek]);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    if (!currentDate) return;
    const newDate = direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7);
    onDateChange(newDate);
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-4">
       <div className="flex justify-between items-center w-full max-w-xs">
          <Button variant="ghost" size="icon" onClick={() => handleWeekChange('prev')} disabled={!currentWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {currentWeek ? (
            <span className="text-lg font-semibold">{format(currentWeek, 'MMMM yyyy')}</span>
          ) : (
            <Skeleton className="h-7 w-32" />
          )}
          <Button variant="ghost" size="icon" onClick={() => handleWeekChange('next')} disabled={!currentWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center w-full max-w-sm">
          {weekDays.length > 0 ? (
            weekDays.map((day) => (
              <div key={day.toString()} className="flex flex-col items-center">
                <span className="text-sm text-muted-foreground">{format(day, 'E')}</span>
                <Button
                  variant="ghost"
                  onClick={() => onDateChange(day)}
                  className={cn(
                    'mt-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold p-0 transition-colors',
                    isToday(day) && 'bg-primary text-primary-foreground hover:bg-primary/90',
                    currentDate && !isToday(day) && isSameDay(day, currentDate) && 'bg-primary/50 hover:bg-primary/60',
                    !isToday(day) && (!currentDate || !isSameDay(day, currentDate)) && 'hover:bg-accent'
                  )}
                >
                  {format(day, 'd')}
                </Button>
              </div>
            ))
          ) : (
             Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="h-4 w-6 mb-2" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
             ))
          )}
        </div>
    </div>
  );
}
