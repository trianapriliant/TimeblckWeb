
'use client';

import * as React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Bell, Plus } from 'lucide-react';
import { cn, getContrastingTextColor } from '@/lib/utils';
import { type ScheduleBlock, BLOCK_COLORS, type AppSettings } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TimeSlotProps {
  dateKey: string;
  slotIndex: number;
  selection: { dateKey: string; start: number; end: number } | null;
  onMouseDown: (dateKey: string, slotIndex: number) => void;
  onMouseEnter: (dateKey: string, slotIndex: number) => void;
  onClick: (block: ScheduleBlock, dateKey: string) => void;
  block?: ScheduleBlock;
  blockShape: AppSettings['blockShape'];
  isHighlightedForDrag?: boolean;
  isSelectedForCreation?: boolean;
}

const TimeSlotComponent = ({
  dateKey,
  slotIndex,
  selection,
  onMouseDown,
  onMouseEnter,
  onClick,
  block,
  blockShape,
  isHighlightedForDrag,
  isSelectedForCreation,
}: TimeSlotProps) => {
  const isDraggable = block && !block.isRecurring;
  const isSolidStyle = blockShape === 'solid';
  const isStartOfBlock = block ? block.startTime === slotIndex : false;
  const isEndOfBlock = block ? (block.startTime + block.duration - 1) === slotIndex : false;

  const handleMouseDown = React.useCallback(() => onMouseDown(dateKey, slotIndex), [onMouseDown, dateKey, slotIndex]);
  const handleMouseEnter = React.useCallback(() => onMouseEnter(dateKey, slotIndex), [onMouseEnter, dateKey, slotIndex]);
  const handleClick = React.useCallback(() => {
    if (block) {
        onClick(block, dateKey);
    }
  }, [onClick, block, dateKey]);

  const droppableId = `slot-${dateKey}-${slotIndex}`;
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: droppableId,
    disabled: !!block,
  });

  const draggableId = block ? `move-${block.id}` : `slot-drag-${dateKey}-${slotIndex}`;
  const {
    attributes: moveAttributes,
    listeners: moveListeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: draggableId,
    data: { block, dateKey, type: 'block' },
    disabled: !isDraggable,
  });

  const resizeBottomId = `resize-bottom-${block?.id}`;
  const {
    attributes: resizeBottomAttributes,
    listeners: resizeBottomListeners,
    setNodeRef: setResizeBottomRef,
  } = useDraggable({
    id: resizeBottomId,
    data: { block, dateKey, type: 'resize-bottom' },
    disabled: !isDraggable,
  });
  
  const resizeTopId = `resize-top-${block?.id}`;
  const {
    attributes: resizeTopAttributes,
    listeners: resizeTopListeners,
    setNodeRef: setResizeTopRef,
  } = useDraggable({
    id: resizeTopId,
    data: { block, dateKey, type: 'resize-top' },
    disabled: !isDraggable,
  });
  
  if (isSolidStyle) {
    if (!block) {
      return (
         <div
          ref={setDroppableRef}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          className={cn(
            'relative w-full group transition-colors duration-100 cursor-pointer h-full',
            isSelectedForCreation && 'bg-primary/30',
            !isSelectedForCreation && 'hover:bg-accent'
          )}
        >
          <div className="flex items-center justify-center h-full">
              <Plus className="h-5 w-5 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/30" />
          </div>
        </div>
      );
    }
    
    const isCustomColor = block.color.startsWith('#');
    const colorClasses = !isCustomColor ? (BLOCK_COLORS[block.color as keyof typeof BLOCK_COLORS] || BLOCK_COLORS.slate) : null;
    const style = isCustomColor ? { backgroundColor: block.color } : {};
    const hasReminderSolid = (block as any).reminderLeadTime > 0 || (block as any).reminder === true;
    
    if (!isStartOfBlock) return null;

    return (
      <div
        ref={setDraggableRef}
        onClick={handleClick}
        {...(isDraggable ? { ...moveListeners, ...moveAttributes } : {})}
        className={cn(
          'absolute w-full group transition-colors duration-100 z-10',
          isDraggable ? 'cursor-grab' : 'cursor-default',
          !isCustomColor && colorClasses?.solid,
          !isCustomColor && 'border-background',
          isCustomColor && 'border-background',
          isDragging && 'opacity-50'
        )}
        style={{ ...style, top: `${block.startTime * 0.5}rem`, height: `${block.duration * 0.5}rem` }}
      >
        <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <div className="relative h-full w-full px-2 py-1 overflow-hidden flex items-start justify-between">
                <p className={cn("font-semibold text-[10px] md:text-xs leading-tight truncate", !isCustomColor && colorClasses?.foreground)}
                   style={{ color: isCustomColor ? getContrastingTextColor(block.color) : undefined }}>
                  {block.title}
                </p>
                 {hasReminderSolid && (
                    <Bell 
                      className={cn("h-3.5 w-3.5 flex-shrink-0", !isCustomColor && colorClasses?.foreground)}
                      style={{ color: isCustomColor ? getContrastingTextColor(block.color) : undefined }}
                    />
                  )}
              </div>
            </TooltipTrigger>
            <TooltipContent><p>{block.title}</p></TooltipContent>
        </Tooltip>

        {isDraggable && (
          <>
            <div
              ref={setResizeTopRef}
              {...resizeTopListeners}
              {...resizeTopAttributes}
              className="absolute -top-1 left-0 right-0 h-2 flex items-center justify-center cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="w-6 h-1 rounded-full bg-black/30 dark:bg-white/30" />
            </div>
            <div
              ref={setResizeBottomRef}
              {...resizeBottomListeners}
              {...resizeBottomAttributes}
              className="absolute -bottom-1 left-0 right-0 h-2 flex items-center justify-center cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <div className="w-6 h-1 rounded-full bg-black/30 dark:bg-white/30" />
            </div>
          </>
        )}
      </div>
    );
  }

  if (!block) {
    return (
      <div
        ref={setDroppableRef}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        className={cn(
          'p-px h-full w-full group transition-colors duration-100 cursor-pointer',
          isSelectedForCreation ? 'bg-primary/20 rounded-md' : '',
          isHighlightedForDrag && 'bg-primary/20 rounded-md',
          !isSelectedForCreation && !isHighlightedForDrag && 'hover:bg-accent rounded-md'
        )}
      >
        <div className="flex items-center justify-center h-full">
          <Plus className="h-5 w-5 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/30" />
        </div>
      </div>
    );
  }

  const isCustomColor = block.color.startsWith('#');
  const colorClasses = !isCustomColor ? (BLOCK_COLORS[block.color as keyof typeof BLOCK_COLORS] || BLOCK_COLORS.slate) : null;
  const style = isCustomColor ? { backgroundColor: block.color } : {};
  const hasReminder = (block as any).reminderLeadTime > 0 || (block as any).reminder === true;

  return (
    <div
      ref={setDraggableRef}
      {...(isDraggable ? { ...moveListeners, ...moveAttributes } : {})}
      onClick={handleClick}
      className="h-full w-full p-px"
    >
       <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <div
            style={style}
            className={cn(
              'relative h-full w-full flex items-center justify-between p-1.5 shadow-sm group',
              isDraggable ? 'cursor-grab' : 'cursor-default',
              blockShape === 'rounded' ? 'rounded-md' : '',
              isDragging && 'opacity-50',
              !isCustomColor && colorClasses?.solid
            )}
          >
            {isStartOfBlock && (
                <p
                  className={cn(
                    'font-semibold text-[10px] leading-tight truncate',
                    !isCustomColor && colorClasses?.foreground
                  )}
                  style={isCustomColor ? { color: getContrastingTextColor(block.color) } : {}}
                >
                  {block.title}
                </p>
            )}
            {hasReminder && isEndOfBlock && (
              <Bell
                className={cn(
                  'h-3 w-3 flex-shrink-0 ml-auto',
                  !isCustomColor && colorClasses?.foreground
                )}
                style={isCustomColor ? { color: getContrastingTextColor(block.color) } : {}}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{block.title}</p>
        </TooltipContent>
      </Tooltip>
       {isDraggable && isEndOfBlock && (
          <div
            ref={setResizeBottomRef}
            {...resizeBottomListeners}
            {...resizeBottomAttributes}
            onMouseDown={(e) => {
              e.stopPropagation();
              if (resizeBottomListeners?.onMouseDown) {
                resizeBottomListeners.onMouseDown(e as any);
              }
            }}
            className="absolute -right-1 top-0 bottom-0 w-2 flex items-center justify-center cursor-ew-resize opacity-0 hover:opacity-100 transition-opacity z-10"
          >
            <div className="h-6 w-1 rounded-full bg-black/30 dark:bg-white/30" />
          </div>
        )}
    </div>
  );
};

export const TimeSlot = React.memo(TimeSlotComponent);
