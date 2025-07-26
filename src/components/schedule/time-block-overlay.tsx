
'use client';

import * as React from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { BLOCK_COLORS, type TimeBlock } from '@/lib/types';
import { getContrastingTextColor } from '@/lib/utils';

interface TimeBlockOverlayProps {
  block: TimeBlock;
}

export const TimeBlockOverlay = ({ block }: TimeBlockOverlayProps) => {
  const { settings } = useAppSettings();
  const isCustomColor = block.color.startsWith('#');
  
  const colorClasses = !isCustomColor ? (BLOCK_COLORS[block.color as keyof typeof BLOCK_COLORS] || BLOCK_COLORS.slate) : null;
  const style = isCustomColor 
    ? { backgroundColor: block.color, color: getContrastingTextColor(block.color) } 
    : {};
  
  const hasReminder = (block as any).reminderLeadTime > 0 || (block as any).reminder === true;

  const widthInRem = block.duration * 2.75;

  return (
    <div
      className={cn(
        'h-12 flex items-center p-2 shadow-2xl cursor-grabbing scale-105 transition-transform',
        !isCustomColor && colorClasses?.solid,
        !isCustomColor && colorClasses?.foreground,
        settings.blockShape === 'rounded' ? 'rounded-lg' : ''
      )}
      style={{ ...style, width: `${widthInRem}rem` }}
    >
      <div className="flex items-center w-full overflow-hidden">
        <p className='font-semibold text-xs leading-tight truncate'>{block.title}</p>
        {hasReminder && (
          <Bell className='h-3.5 w-3.5 ml-auto flex-shrink-0' />
        )}
      </div>
    </div>
  );
};
