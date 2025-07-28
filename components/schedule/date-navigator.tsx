
'use client';

import * as React from 'react';
import { addDays, format, isSameDay, isToday, startOfWeek, subDays } from 'date-fns';
import { id as idLocale, enUS as enLocale } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { useAppSettings } from '@/hooks/app-settings-provider';

interface DateNavigatorProps {
  currentDate: Date | null;
  onDateChange: (date: Date) => void;
  dayCount: number;
}

export function DateNavigator({ currentDate, onDateChange, dayCount }: DateNavigatorProps) {
  const { settings } = useAppSettings();
  const locale = settings.language === 'id' ? idLocale : enLocale;

  // The week displayed in the navigator is always the one containing the `currentDate`
  const currentDisplayWeek = React.useMemo(() => {
    return currentDate ? startOfWeek(currentDate) : null;
  }, [currentDate]);

  const weekDays = React.useMemo(() => {
    if (!currentDisplayWeek) return [];
    return Array.from({ length: 7 }).map((_, i) => addDays(currentDisplayWeek, i));
  }, [currentDisplayWeek]);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    if (!currentDate) return;
    const newDate = direction === 'prev' ? subDays(currentDate, 7) : addDays(currentDate, 7);
    onDateChange(newDate);
  };

  const selectedDates = React.useMemo(() => {
    if (!currentDate) return [];
    return Array.from({ length: dayCount }).map((_, i) => addDays(currentDate, i));
  }, [currentDate, dayCount]);

  const isDaySelected = (day: Date) => {
    if (!currentDate) return false;
    return selectedDates.some(selectedDay => isSameDay(day, selectedDay));
  };
  
  return (
    <div className="flex flex-col items-center gap-4 w-full mb-4">
       <div className="flex justify-between items-center w-full max-w-xs">
          <Button variant="ghost" size="icon" onClick={() => handleWeekChange('prev')} disabled={!currentDisplayWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {currentDisplayWeek ? (
            <span className="text-lg font-semibold">{format(currentDisplayWeek, 'MMMM yyyy', { locale })}</span>
          ) : (
            <Skeleton className="h-7 w-32" />
          )}
          <Button variant="ghost" size="icon" onClick={() => handleWeekChange('next')} disabled={!currentDisplayWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center w-full max-w-sm">
          {weekDays.length > 0 ? (
            weekDays.map((day) => (
              <div key={day.toString()} className="flex flex-col items-center">
                <span className="text-sm text-muted-foreground">{format(day, 'E', { locale })}</span>
                <Button
                  variant="ghost"
                  onClick={() => onDateChange(day)}
                  className={cn(
                    'mt-2 flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold p-0 transition-colors',
                    isDaySelected(day) 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'hover:bg-accent',
                    isToday(day) && 'ring-2 ring-offset-2 ring-offset-background ring-primary'
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
