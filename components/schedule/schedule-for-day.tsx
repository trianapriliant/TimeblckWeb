
'use client';

import * as React from 'react';
import { format, getDay, isSameDay } from 'date-fns';
import { id as idLocale, enUS as enLocale } from 'date-fns/locale';
import { useTimeBlocks } from '@/hooks/time-blocks-provider';
import { useRecurringBlocks } from '@/hooks/use-recurring-blocks';
import { useAppSettings } from '@/hooks/app-settings-provider';
import type { ScheduleBlock, TimeBlock } from '@/lib/types';
import { BLOCK_COLORS } from '@/lib/types';
import { cn, formatSlotTime } from '@/lib/utils';
import { Bell, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/hooks/use-translations';
import { useInbox } from '@/hooks/inbox-provider';
import { Separator } from '../ui/separator';

interface ScheduleForDayProps {
  selectedDate: Date | undefined;
}

export function ScheduleForDay({ selectedDate }: ScheduleForDayProps) {
  const t = useTranslations();
  const { blocksByDate } = useTimeBlocks();
  const { recurringBlocks } = useRecurringBlocks();
  const { settings } = useAppSettings();
  const { items: inboxItems } = useInbox();

  const locale = settings.language === 'id' ? idLocale : enLocale;

  const scheduledBlocks = React.useMemo((): ScheduleBlock[] => {
    if (!selectedDate) return [];

    const dayOfWeek = getDay(selectedDate);
    const rBlocks: ScheduleBlock[] = recurringBlocks
      .filter((rb) => rb.daysOfWeek.includes(dayOfWeek))
      .map((rb) => ({ ...rb, id: `recurring-${rb.id}`, isRecurring: true }));
    
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    const tBlocks: TimeBlock[] = blocksByDate[dateKey] || [];

    return [...rBlocks, ...tBlocks].sort((a, b) => a.startTime - b.startTime);
  }, [selectedDate, blocksByDate, recurringBlocks]);

  const deadlinesForDay = React.useMemo(() => {
    if (!selectedDate) return [];
    return inboxItems.filter(item => 
        item.deadline && isSameDay(new Date(item.deadline), selectedDate)
    );
  }, [selectedDate, inboxItems]);

  return (
    <div className="w-full border-t p-4 md:border-t-0 md:border-l md:h-full">
      <h3 className="mb-4 font-semibold text-lg">
        {t.calendar.schedule_for_date.replace(
          '{date}',
          selectedDate ? format(selectedDate, 'MMMM d, yyyy', { locale }) : '...'
        )}
      </h3>
      {scheduledBlocks.length > 0 ? (
        <div className="space-y-2">
          {scheduledBlocks.map((block) => {
            const isCustomColor = block.color.startsWith('#');
            const colorClasses = !isCustomColor ? (BLOCK_COLORS[block.color as keyof typeof BLOCK_COLORS] || BLOCK_COLORS.slate) : null;
            const style = isCustomColor ? { backgroundColor: block.color } : {};

            const hasReminder = (block as any).reminderLeadTime > 0 || (block as any).reminder === true;
            return (
              <div
                key={block.id}
                className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
              >
                <div className={cn('h-10 w-2 rounded-full', !isCustomColor && colorClasses?.solid)} style={style} />
                <div className="flex-1">
                  <p className="font-semibold">{block.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatSlotTime(block.startTime, block.duration, settings.timeFormat)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {block.isRecurring && <Badge variant="outline">Recurring</Badge>}
                  {hasReminder && <Bell className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="py-4 text-center text-muted-foreground">{t.calendar.no_events}</p>
      )}

      {deadlinesForDay.length > 0 && (
        <>
          <Separator className="my-4" />
          <h4 className="mb-2 font-semibold">{t.calendar.deadlines_title}</h4>
          <div className="space-y-2">
            {deadlinesForDay.map(item => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <Flag className="h-5 w-5 text-destructive" />
                    <div className="flex-1">
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                            Deadline
                        </p>
                    </div>
                </div>
            ))}
          </div>
        </>
      )}

      {scheduledBlocks.length === 0 && deadlinesForDay.length === 0 && (
         <p className="py-4 text-center text-muted-foreground">{t.calendar.no_events}</p>
      )}
    </div>
  );
}
