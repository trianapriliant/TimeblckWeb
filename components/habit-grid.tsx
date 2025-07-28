
'use client';

import * as React from 'react';
import {
  eachDayOfInterval,
  endOfYear,
  format,
  getDay,
  startOfYear,
  getMonth,
  endOfMonth,
  startOfMonth,
  isToday as isTodayFns,
} from 'date-fns';
import { id as idLocale, enUS as enLocale } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { BLOCK_COLORS, type BlockColor } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTranslations } from '@/hooks/use-translations';
import { useAppSettings } from '@/hooks/app-settings-provider';

const getColorClass = (intensity: number | undefined, color: keyof typeof BLOCK_COLORS) => {
  if (!intensity) return 'bg-muted/50';
  const colorScheme = BLOCK_COLORS[color]?.grid;
  if (!colorScheme) return 'bg-muted/50';
  return colorScheme[intensity as keyof typeof colorScheme] || 'bg-muted/50';
};

interface HabitGridProps {
  color: BlockColor;
  data: Map<string, number>;
  orientation?: 'horizontal' | 'vertical';
  showDayNumbers?: boolean;
  todayId?: string;
  highlightToday?: boolean;
}

export function HabitGrid({
  color,
  data,
  orientation = 'horizontal',
  showDayNumbers = false,
  todayId,
  highlightToday = true,
}: HabitGridProps) {
  const isMobile = useIsMobile();
  const t = useTranslations();
  const { settings } = useAppSettings();
  const locale = settings.language === 'id' ? idLocale : enLocale;
  const isCustomColor = color.startsWith('#');

  const { days, firstDayOfWeek } = React.useMemo(() => {
    const now = new Date();
    const currentMonth = getMonth(now); // 0-11

    let startDate, endDate;

    if (isMobile) {
      // On mobile, show the current half of the year
      if (currentMonth < 6) {
        // First half (Jan-Jun)
        startDate = startOfYear(now);
        endDate = endOfMonth(new Date(now.getFullYear(), 5, 1)); // End of June
      } else {
        // Second half (Jul-Dec)
        startDate = startOfMonth(new Date(now.getFullYear(), 6, 1)); // Start of July
        endDate = endOfYear(now);
      }
    } else {
      // On desktop, show the full year
      startDate = startOfYear(now);
      endDate = endOfYear(now);
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const firstDayOfWeek = getDay(startDate);
    return { days, firstDayOfWeek };
  }, [isMobile]);

  return (
    <div
      className={cn(
        'gap-1 w-full',
        orientation === 'horizontal'
          ? 'inline-grid grid-flow-col grid-rows-7'
          : 'grid grid-flow-row grid-cols-7'
      )}
    >
      {Array.from({ length: firstDayOfWeek }).map((_, i) => (
        <div key={`empty-${i}`} />
      ))}
      {days.map((day, index) => {
        const dateString = format(day, 'yyyy-MM-dd');
        const intensity = data.get(dateString);
        const isToday = isTodayFns(day);
        const formattedDate = format(day, 'MMM d, yyyy', { locale });
        
        const style = isCustomColor && intensity ? { backgroundColor: color } : {};
        const className = !isCustomColor ? getColorClass(intensity, color as keyof typeof BLOCK_COLORS) : 'bg-muted/50';

        return (
          <Tooltip key={index} delayDuration={100}>
            <TooltipTrigger asChild>
              <div
                id={isToday ? todayId : undefined}
                style={style}
                className={cn(
                  'flex items-center justify-center rounded-sm transition-all',
                  isToday && highlightToday && 'border-2 border-primary',
                  intensity && isCustomColor ? '' : className,
                  orientation === 'horizontal'
                    ? 'h-2.5 w-2.5'
                    : 'aspect-square'
                )}
              >
                {showDayNumbers && (
                  <span
                    className={cn(
                      'text-xs font-medium leading-none whitespace-nowrap',
                      intensity && intensity > 4
                        ? BLOCK_COLORS[color as keyof typeof BLOCK_COLORS]?.foreground
                        : 'text-muted-foreground'
                    )}
                  >
                    {format(day, 'd/M')}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                {intensity
                  ? t.calendar.tooltip_contribution.replace('{intensity}', String(intensity)).replace('{date}', formattedDate)
                  : t.calendar.tooltip_no_contribution.replace('{date}', formattedDate)
                }
              </p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
