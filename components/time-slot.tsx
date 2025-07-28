
'use client';

import * as React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Bell, Plus } from 'lucide-react';
import { cn, getContrastingTextColor } from '@/lib/utils';
import { type ScheduleBlock, BLOCK_COLORS, type AppSettings } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TimeSlotProps {
  slotIndex: number;
  onMouseDown?: () => void;
  onMouseEnter?: () => void;
  onClick?: () => void;
  isSelected: boolean;
  isHighlightedForDrag: boolean;
  block?: ScheduleBlock;
  blockShape: AppSettings['blockShape'];
  isStartOfBlock?: boolean;
  isEndOfBlock?: boolean;
}

export function TimeSlot({ 
  slotIndex, 
  onMouseDown, 
  onMouseEnter, 
  onClick,
  isSelected, 
  isHighlightedForDrag,
  block,
  blockShape,
  isStartOfBlock,
  isEndOfBlock
}: TimeSlotProps) {
  const isDraggable = block && !block.isRecurring;

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `slot-${slotIndex}`,
    disabled: !!block,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: block ? block.id : `slot-${slotIndex}`,
    data: { block, type: 'block' },
    disabled: !isDraggable,
  });

  const {
    attributes: resizeAttributes,
    listeners: resizeListeners,
    setNodeRef: setResizeRef,
  } = useDraggable({
    id: `resize-${block?.id}`,
    data: { block, type: 'resize' },
    disabled: !isEndOfBlock || !isDraggable,
  });

  if (block) {
    const isCustomColor = block.color.startsWith('#');
    const colorClasses = !isCustomColor ? (BLOCK_COLORS[block.color as keyof typeof BLOCK_COLORS] || BLOCK_COLORS.slate) : null;
    const style = isCustomColor ? { backgroundColor: block.color } : {};
    const hasReminder = (block as any).reminderLeadTime > 0 || (block as any).reminder === true;

    return (
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div
            ref={setDraggableRef}
            {...listeners}
            {...attributes}
            onClick={onClick}
            style={style}
            className={cn(
              'relative h-full w-full flex items-center shadow-sm group',
              isDraggable ? 'cursor-grab' : 'cursor-default',
              colorClasses?.solid,
              blockShape === 'rounded' && 'rounded-md',
              isDragging && 'opacity-50'
            )}
          >
            <div className="flex items-center h-full w-full overflow-hidden px-2">
                {isStartOfBlock && (
                  <p 
                    className={cn("font-semibold text-xs leading-tight truncate", colorClasses?.foreground)} 
                    style={isCustomColor ? { color: getContrastingTextColor(block.color) } : {}}
                  >
                    {block.title}
                  </p>
                )}
                {hasReminder && isEndOfBlock && (
                    <Bell 
                      className={cn("h-3.5 w-3.5 ml-auto opacity-80", colorClasses?.foreground)} 
                      style={isCustomColor ? { color: getContrastingTextColor(block.color) } : {}}
                    />
                )}
            </div>

            {isEndOfBlock && isDraggable && (
                <div
                    ref={setResizeRef}
                    {...resizeListeners}
                    {...resizeAttributes}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        if(resizeListeners && resizeListeners.onMouseDown) {
                            resizeListeners.onMouseDown(e as any);
                        }
                    }}
                    className="absolute top-0 bottom-0 right-0 w-2 flex items-center justify-center cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <div className="w-0.5 h-6 rounded-full bg-black/30 dark:bg-white/30" />
                </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
            <p>{block.title}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div
      ref={setDroppableRef}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      className={cn(
        'h-full w-full rounded-md group transition-colors duration-100',
        // New drop indicator takes precedence
        isHighlightedForDrag 
          ? 'bg-primary/10 border-2 border-dashed border-primary/40' 
          // Existing logic for when not dragging
          : isSelected 
            ? 'bg-primary/30' 
            : 'hover:bg-accent'
      )}
    >
        <div className="flex items-center justify-center h-full">
            <Plus className={cn(
              "h-5 w-5 text-muted-foreground/0 transition-colors",
              // Don't show plus when highlighting for drop
              !isHighlightedForDrag && "group-hover:text-muted-foreground/30"
            )} />
        </div>
    </div>
  );
}
