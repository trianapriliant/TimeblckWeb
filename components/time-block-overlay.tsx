
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
  
  const colorClasses = !isCustomColor ? BLOCK_COLORS[block.color as keyof typeof BLOCK_COLORS] || BLOCK_COLORS.slate : null;
  const style = isCustomColor ? { 
    backgroundColor: block.color, 
    color: getContrastingTextColor(block.color) 
  } : {};
  
  const hasReminder = (block as any).reminderLeadTime > 0 || (block as any).reminder === true;

  // Since the overlay is rendered in a portal, it doesn't inherit the parent's grid context.
  // We must provide an explicit width for the overlay to match the visual width of the block.
  // This calculation is a reasonable approximation for most screen sizes.
  // Each slot is a 10-minute increment.
  const widthInRem = block.duration * 2.75;

  return (
    <div
      className={cn(
        'h-12 flex items-center p-2 shadow-2xl cursor-grabbing opacity-95 scale-105 transition-transform',
        colorClasses?.solid,
        settings.blockShape === 'rounded' ? 'rounded-lg' : ''
      )}
      style={{ ...style, width: `${widthInRem}rem` }}
    >
      <div className="flex items-center w-full overflow-hidden">
        <p className={cn('font-semibold text-xs leading-tight truncate', colorClasses?.foreground)}>{block.title}</p>
        {hasReminder && (
          <Bell className={cn('h-3.5 w-3.5 ml-auto flex-shrink-0', colorClasses?.foreground)} />
        )}
      </div>
    </div>
  );
};
