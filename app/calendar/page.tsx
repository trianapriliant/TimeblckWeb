
'use client';

import * as React from 'react';
import { addDays, format, isSameDay, isToday, startOfWeek, subDays, startOfYear, endOfYear, eachDayOfInterval, getDay } from 'date-fns';
import { id as idLocale, enUS as enLocale } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, LocateFixed } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ScheduleForDay } from '@/components/schedule/schedule-for-day';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useTimeBlocks } from '@/hooks/time-blocks-provider';
import { useRecurringBlocks } from '@/hooks/use-recurring-blocks';
import { HabitGrid } from '@/components/habits/habit-grid';
import { BLOCK_COLORS } from '@/lib/types';
import { useTranslations } from '@/hooks/use-translations';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { useInbox } from '@/hooks/inbox-provider';
import { usePageActions } from '@/hooks/page-actions-provider';

export default function CalendarPage() {
  const t = useTranslations();
  const { settings } = useAppSettings();
  const { setPageActions } = usePageActions();
  const [date, setDate] = React.useState<Date | undefined>();
  const { blocksByDate } = useTimeBlocks();
  const { recurringBlocks } = useRecurringBlocks();
  const { items: inboxItems } = useInbox();
  const yearlyOverviewRef = React.useRef<HTMLDivElement>(null);
  const todayId = 'yearly-overview-today-marker';

  const locale = settings.language === 'id' ? idLocale : enLocale;
  
  React.useEffect(() => {
    setPageActions({
        title: t.calendar.title,
        description: t.calendar.description,
    });

    return () => setPageActions(null);
  }, [setPageActions, t]);

  React.useEffect(() => {
    // Set date on client mount to avoid hydration mismatch
    setDate(new Date());
  }, []);
  
  const recurringBlocksByDay = React.useMemo(() => {
    const countByDay = new Array(7).fill(0);
    recurringBlocks.forEach(rb => {
      rb.daysOfWeek.forEach(dayIndex => {
        countByDay[dayIndex]++;
      });
    });
    return countByDay;
  }, [recurringBlocks]);

  const yearlyData = React.useMemo(() => {
    const dataMap = new Map<string, number>();
    if (!date) return dataMap;

    const yearStart = startOfYear(date);
    const yearEnd = endOfYear(date);
    const daysInYear = eachDayOfInterval({ start: yearStart, end: yearEnd });

    daysInYear.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      const dayOfWeek = getDay(day);

      const oneOffBlocks = (blocksByDate[dateKey] || []).length;
      const recurring = recurringBlocksByDay[dayOfWeek];
      const totalBlocks = oneOffBlocks + recurring;

      if (totalBlocks > 0) {
        // New logic for 7 levels of intensity. Capped at 7 for the 7 color grades.
        const intensity = Math.min(totalBlocks, 7);
        dataMap.set(dateKey, intensity);
      }
    });

    return dataMap;
  }, [date, blocksByDate, recurringBlocksByDay]);

  const currentWeek = React.useMemo(() => {
    return date ? startOfWeek(date) : null;
  }, [date]);

  const weekDays = React.useMemo(() => {
    if (!currentWeek) return [];
    return Array.from({ length: 7 }).map((_, i) => addDays(currentWeek, i));
  }, [currentWeek]);

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newDate = date ? (direction === 'prev' ? subDays(date, 7) : addDays(date, 7)) : new Date();
    setDate(newDate);
  };

  const handleGoToToday = () => {
    if (yearlyOverviewRef.current) {
      const todayElement = yearlyOverviewRef.current.querySelector(`#${todayId}`);
      if (todayElement) {
        todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const deadlineDates = React.useMemo(() => {
    return inboxItems.filter(i => i.deadline).map(i => new Date(i.deadline!));
  }, [inboxItems]);

  const YEARLY_VIEW_COLOR = 'blue';

  return (
    <div className="container mx-auto p-4 md:p-6 flex flex-col h-full">
      <Tabs defaultValue="monthly" className="w-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weekly">{t.calendar.weekly}</TabsTrigger>
          <TabsTrigger value="monthly">{t.calendar.monthly}</TabsTrigger>
          <TabsTrigger value="yearly">{t.calendar.yearly}</TabsTrigger>
        </TabsList>
        <TabsContent value="monthly">
          <Card className="mt-4">
            <CardContent className="p-0 md:flex">
              <div className="flex justify-center p-3">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="p-0"
                  locale={locale}
                  modifiers={{ deadlines: deadlineDates }}
                  modifiersClassNames={{ deadlines: 'day-deadline' }}
                />
              </div>
              <ScheduleForDay selectedDate={date} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weekly">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex justify-between items-center max-w-sm mx-auto">
                <Button variant="ghost" size="icon" onClick={() => handleWeekChange('prev')} disabled={!currentWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {currentWeek ? (
                  <span>{format(currentWeek, 'MMMM yyyy', { locale })}</span>
                ) : (
                  <Skeleton className="h-6 w-32" />
                )}
                <Button variant="ghost" size="icon" onClick={() => handleWeekChange('next')} disabled={!currentWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 text-center max-w-sm mx-auto">
                {weekDays.length > 0 ? (
                  weekDays.map((day) => (
                    <div key={day.toString()} className="flex flex-col items-center">
                      <span className="text-sm text-muted-foreground">{format(day, 'E', { locale })}</span>
                      <Button
                        variant="ghost"
                        onClick={() => setDate(day)}
                        className={cn(
                          'mt-2 flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold p-0 transition-colors',
                          isToday(day) && 'bg-primary text-primary-foreground hover:bg-primary/90',
                          date && !isToday(day) && isSameDay(day, date) && 'bg-primary/50 hover:bg-primary/60',
                          !isToday(day) && (!date || !isSameDay(day, date)) && 'hover:bg-accent'
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
              <ScheduleForDay selectedDate={date} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="yearly" className="flex-1 -m-1 pt-1">
          <Card className="mt-4 h-full flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>{t.calendar.yearly_overview_title}</CardTitle>
                        <CardDescription>{t.calendar.yearly_overview_description}</CardDescription>
                    </div>
                    <Button onClick={handleGoToToday} variant="outline" size="sm">
                        <LocateFixed className="mr-2 h-4 w-4" />
                        {t.calendar.go_to_today}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
                <div ref={yearlyOverviewRef} className="overflow-y-auto py-2 border rounded-lg min-h-[24rem] flex-1">
                    <HabitGrid color={YEARLY_VIEW_COLOR} data={yearlyData} orientation="vertical" showDayNumbers={true} todayId={todayId} />
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                    <span>{t.calendar.less_busy}</span>
                    <div className={cn("h-3 w-3 rounded-sm", BLOCK_COLORS[YEARLY_VIEW_COLOR].grid[1])} />
                    <div className={cn("h-3 w-3 rounded-sm", BLOCK_COLORS[YEARLY_VIEW_COLOR].grid[2])} />
                    <div className={cn("h-3 w-3 rounded-sm", BLOCK_COLORS[YEARLY_VIEW_COLOR].grid[3])} />
                    <div className={cn("h-3 w-3 rounded-sm", BLOCK_COLORS[YEARLY_VIEW_COLOR].grid[4])} />
                    <div className={cn("h-3 w-3 rounded-sm", BLOCK_COLORS[YEARLY_VIEW_COLOR].grid[5])} />
                    <div className={cn("h-3 w-3 rounded-sm", BLOCK_COLORS[YEARLY_VIEW_COLOR].grid[6])} />
                    <div className={cn("h-3 w-3 rounded-sm", BLOCK_COLORS[YEARLY_VIEW_COLOR].grid[7])} />
                    <span>{t.calendar.more_busy}</span>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
