
'use client';

import * as React from 'react';
import { DndContext, type DragEndEvent, type DragStartEvent, type DragOverEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { format, isToday, addDays } from 'date-fns';
import { useTimeBlocks } from '@/hooks/time-blocks-provider';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { AddEditSheet } from '@/components/schedule/add-edit-sheet';
import { TimeSlot } from '@/components/schedule/time-slot';
import { TimeBlockOverlay } from '@/components/schedule/time-block-overlay';
import type { TimeBlock, ScheduleBlock, BlockColor, ScheduleViewKey, RecurringBlock } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { DateNavigator } from '@/components/schedule/date-navigator';
import { TooltipProvider } from '@/components/ui/tooltip';
import { usePageActions } from '@/hooks/page-actions-provider';
import { DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useTranslations } from '@/hooks/use-translations';
import { AiSuggestions } from '@/components/schedule/ai-suggestions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useBreakpoint } from '@/hooks/use-breakpoint';

const VIEW_CONFIG = {
  '1': { days: 1, label: '1 Day View' },
  '2': { days: 2, label: '2 Day View' },
  '3': { days: 3, label: '3 Day View' },
  '7': { days: 7, label: 'Week View' },
};
const SLOTS_PER_HOUR = 6; 
const TOTAL_SLOTS_IN_DAY = 144;

type ActiveBlock = TimeBlock & { dateKey?: string };
type SelectedBlock = ActiveBlock;

export default function TimeblckPage() {
  const t = useTranslations();
  const { user, loading } = useAuth();
  const router = useRouter();
  const breakpoint = useBreakpoint();

  const { blocksByDate, addBlock, updateBlock, deleteBlock, getScheduleForDate, findNextAvailableSlot } = useTimeBlocks();
  const { settings } = useAppSettings();
  const { toast } = useToast();
  const { setPageActions } = usePageActions();
  
  const [viewedDate, setViewedDate] = React.useState<Date | null>(null);
  const [viewKey, setViewKey] = React.useState<ScheduleViewKey>('3');
  
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [activeBlock, setActiveBlock] = React.useState<ActiveBlock | null>(null);
  const [dragOverSlot, setDragOverSlot] = React.useState<{ dateKey: string; slotIndex: number } | null>(null);

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selectedBlock, setSelectedBlock] = React.useState<SelectedBlock | null>(null);
  
  const [newBlockInfo, setNewBlockInfo] = React.useState<{ dateKey: string; startTime: number; duration: number, title?: string, color?: BlockColor } | null>(null);

  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);

  const [isCreating, setIsCreating] = React.useState(false);
  const [selection, setSelection] = React.useState<{dateKey: string; start: number; end: number} | null>(null);

  const [conflictInfo, setConflictInfo] = React.useState<{
    conflictingBlock: ScheduleBlock;
    action: () => void;
  } | null>(null);

  const currentView = VIEW_CONFIG[viewKey];
  
  const handleAddNew = React.useCallback(() => {
    if (!viewedDate) return;
    const dateKey = format(viewedDate, 'yyyy-MM-dd');
    const nextAvailableSlot = findNextAvailableSlot(viewedDate, 6, settings.startHour * SLOTS_PER_HOUR) ?? settings.startHour * SLOTS_PER_HOUR;
    setNewBlockInfo({
      dateKey,
      startTime: nextAvailableSlot,
      duration: 6, // default 1 hour
    });
    setSelectedBlock(null);
    setSheetOpen(true);
  }, [viewedDate, settings.startHour, findNextAvailableSlot]);

  React.useEffect(() => {
    if (breakpoint) {
      if (breakpoint === 'sm') setViewKey('1');
      else if (breakpoint === 'md') setViewKey('2');
      else setViewKey('3');
    }
  }, [breakpoint]);

  React.useEffect(() => {
    const fabAction = {
      label: t.nav.home,
      action: handleAddNew,
    };
    
    setPageActions({
      title: t.nav.home,
      description: "Drag on the grid to create a new time block, or click a block to edit it.",
      fab: fabAction,
      dropdown: (
        <>
          <DropdownMenuLabel>Schedule View</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={viewKey} onValueChange={(value) => setViewKey(value as ScheduleViewKey)}>
            {Object.entries(VIEW_CONFIG).map(([key, { label }]) => (
               <DropdownMenuRadioItem key={key} value={key}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </>
      ),
    });
    return () => setPageActions(null);
  }, [setPageActions, viewKey, t.nav.home, handleAddNew]);

  React.useEffect(() => {
    const now = new Date();
    setViewedDate(now);
    setCurrentTime(now);

    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timerId);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  const hours = React.useMemo(() => {
    const baseHours = Array.from({ length: 24 }, (_, i) => i);
    const startHour = settings.startHour ?? 0;
    return [...baseHours.slice(startHour), ...baseHours.slice(0, startHour)];
  }, [settings.startHour]);

  const displayedDates = React.useMemo(() => {
    if (!viewedDate) return [];
    return Array.from({ length: currentView.days }).map((_, i) => addDays(viewedDate, i));
  }, [viewedDate, currentView.days]);

  const schedules = React.useMemo(() => {
    const schedulesMap = new Map<string, Map<number, ScheduleBlock>>();
    if (!displayedDates.length) return schedulesMap;

    displayedDates.forEach(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        schedulesMap.set(dateKey, getScheduleForDate(date));
    });
    return schedulesMap;
  }, [displayedDates, getScheduleForDate]);
  
  const handleDragStart = React.useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const { block, dateKey } = event.active.data.current!;
    if (block) {
      setActiveBlock({ ...block, dateKey });
    }
  }, []);
  
  const handleConflict = React.useCallback((conflictingBlock: ScheduleBlock, action: () => void) => {
    if (conflictingBlock.isRecurring) {
        toast({
            title: 'Cannot Modify Template',
            description: `This action conflicts with the recurring block "${conflictingBlock.title}". Please adjust templates in Settings.`,
            variant: 'destructive',
        });
        setDragOverSlot(null); // Reset drag over state on conflict
        return;
    }
    setConflictInfo({ conflictingBlock, action });
  }, [toast]);

  const handleDragOver = React.useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) {
        setDragOverSlot(null);
        return;
    };

    const overId = over.id.toString();
    if (!overId.startsWith('slot-')) {
        setDragOverSlot(null);
        return;
    }

    const overIdParts = overId.split('-');
    const newDateKey = `${overIdParts[1]}-${overIdParts[2]}-${overIdParts[3]}`;
    const newSlotIndex = parseInt(overIdParts[4], 10);

    setDragOverSlot({ dateKey: newDateKey, slotIndex: newSlotIndex });

  }, []);

  const handleDragEnd = React.useCallback((event: DragEndEvent) => {
    setActiveId(null);
    setActiveBlock(null);
    setDragOverSlot(null);

    const { active, over } = event;
    if (!over || !active.data.current) return;
    
    const block = active.data.current.block as TimeBlock;
    const type = active.data.current?.type;
    const originalDateKey = active.data.current.dateKey as string;
    
    const overIdParts = over.id.toString().split('-');
    if (overIdParts.length < 5) return;
    const newDateKey = `${overIdParts[1]}-${overIdParts[2]}-${overIdParts[3]}`;
    const newSlotIndex = parseInt(overIdParts[4], 10);

    if (type === 'block') {
        if (originalDateKey !== newDateKey) {
            deleteBlock(new Date(originalDateKey), block.id);
            addBlock(new Date(newDateKey), { ...block, startTime: newSlotIndex }, handleConflict);
        } else {
            updateBlock(new Date(originalDateKey), block.id, { startTime: newSlotIndex }, handleConflict);
        }
    }

    if (type === 'resize-bottom') {
      const newDuration = newSlotIndex - block.startTime + 1;
      if (newDuration > 0) {
        updateBlock(new Date(originalDateKey), block.id, { duration: newDuration }, handleConflict);
      }
    }
    
    if (type === 'resize-top') {
        const oldEndTime = block.startTime + block.duration;
        const newStartTime = newSlotIndex;
        const newDuration = oldEndTime - newStartTime;
        if (newDuration > 0) {
            updateBlock(new Date(originalDateKey), block.id, { startTime: newStartTime, duration: newDuration }, handleConflict);
        }
    }
  }, [addBlock, updateBlock, deleteBlock, handleConflict]);
  
  const handleBlockClick = React.useCallback((block: ScheduleBlock, dateKey: string) => {
    if (block.isRecurring) {
        toast({ title: 'Edit Template', description: 'Edit recurring blocks from Settings > Templates.' });
        return;
    }
    setNewBlockInfo(null);
    setSelectedBlock({ ...block, dateKey } as SelectedBlock);
    setSheetOpen(true);
  }, [toast]);
  
  const handleMouseDown = React.useCallback((dateKey: string, slotIndex: number) => {
    const schedule = schedules.get(dateKey);
    if(schedule?.has(slotIndex)) return;

    setIsCreating(true);
    setSelection({ dateKey, start: slotIndex, end: slotIndex });
  }, [schedules]);
  
  const handleMouseEnter = React.useCallback((dateKey: string, slotIndex: number) => {
    if (isCreating && selection && selection.dateKey === dateKey) {
        setSelection(prev => ({ ...prev!, end: slotIndex }));
    }
  }, [isCreating, selection]);
  
  const handleMouseUp = React.useCallback(() => {
    if (isCreating && selection) {
      const { dateKey, start, end } = selection;
      const startTime = Math.min(start, end);
      const duration = Math.abs(end - start) + 1;
      
      setNewBlockInfo({ dateKey, startTime, duration });
      setSelectedBlock(null);
      setSheetOpen(true);
    }
    setIsCreating(false);
    setSelection(null);
  }, [isCreating, selection]);

  const handleSave = React.useCallback((data: { title: string; color: BlockColor; reminderLeadTime: number; duration: number; }) => {
    const activeInfo = selectedBlock || newBlockInfo;
    if (!activeInfo) return;

    const date = new Date(selectedBlock ? selectedBlock.dateKey! : newBlockInfo!.dateKey);
    
    const finalData = {
        title: data.title,
        color: data.color,
        reminderLeadTime: data.reminderLeadTime,
        duration: data.duration,
        startTime: activeInfo.startTime,
    };

    if (selectedBlock) {
      updateBlock(date, selectedBlock.id, finalData, handleConflict);
    } else if (newBlockInfo) {
      addBlock(date, { ...finalData, startTime: newBlockInfo.startTime }, handleConflict);
    }
    setSheetOpen(false);
    setSelectedBlock(null);
    setNewBlockInfo(null);
  }, [selectedBlock, newBlockInfo, updateBlock, addBlock, handleConflict]);
  
  const handleDelete = React.useCallback(() => {
    if (selectedBlock) {
      deleteBlock(new Date(selectedBlock.dateKey!), selectedBlock.id);
      setSheetOpen(false);
      setSelectedBlock(null);
      setNewBlockInfo(null);
    }
  }, [selectedBlock, deleteBlock]);

  const handleApplySuggestion = React.useCallback((suggestion: { dateKey: string; startTime: number; duration: number, title: string, color: BlockColor }) => {
    setNewBlockInfo(suggestion);
    setSelectedBlock(null);
    setSheetOpen(true);
  }, []);

  const handleReschedule = React.useCallback(() => {
    if (!conflictInfo) return;
    
    const { conflictingBlock, action } = conflictInfo;
    const dateKey = Object.keys(blocksByDate).find(key => 
        blocksByDate[key].some(b => b.id === conflictingBlock.id)
    ) || format(new Date(), 'yyyy-MM-dd');
    
    const date = new Date(dateKey);
     if (isNaN(date.getTime())) {
        console.error("Invalid date parsed for reschedule:", dateKey);
        setConflictInfo(null);
        return;
    }
    
    const blockToMove = conflictingBlock as TimeBlock;
    const newStartTime = findNextAvailableSlot(date, blockToMove.duration, blockToMove.startTime + blockToMove.duration);

    if (newStartTime !== null) {
        updateBlock(date, blockToMove.id, { startTime: newStartTime });
        action();
    } else {
        toast({
            title: 'No Space Available',
            description: `Could not find an empty slot to reschedule "${conflictingBlock.title}".`,
            variant: 'destructive',
        });
    }
    setConflictInfo(null);
  }, [conflictInfo, blocksByDate, findNextAvailableSlot, updateBlock, toast]);
  
  const renderTimeIndicator = () => {
    if (!currentTime || !viewedDate) return null;

    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const startHour = settings.startHour ?? 0;
    const isSolidStyle = settings.blockShape === 'solid';

    if (isSolidStyle) {
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const startTotalMinutes = startHour * 60;
        
        let minutesFromGridStart = currentTotalMinutes - startTotalMinutes;
        if (minutesFromGridStart < 0) {
            minutesFromGridStart += 24 * 60; // handles wrapping past midnight
        }

        const timeIndicatorPosition = (minutesFromGridStart / 10); // 0.5rem per 10min slot

        return (
             <div 
                className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                style={{ top: `${timeIndicatorPosition * 0.5}rem`, transform: 'translateY(-1px)' }}
                aria-hidden="true"
              >
                 <div className="h-2 w-2 rounded-full bg-primary animate-pulse-live -ml-1"></div>
                 <div className="h-[2px] w-full bg-primary" />
              </div>
        );
    } else {
        let relativeHour = (currentHour - startHour + 24) % 24;
        const topOffset = relativeHour * 3; // h-12 is 3rem
        const leftOffset = (currentMinute / 60) * 100;

        return (
            <div
                className="absolute z-10 w-px h-12 bg-primary pointer-events-none"
                style={{
                  top: `${topOffset}rem`,
                  left: `${leftOffset}%`,
                  transform: 'translateY(-1px)',
                }}
                aria-hidden="true"
            />
        );
    }
  }

  const renderGrid = (dateKey: string) => {
    const scheduleForDate = schedules.get(dateKey);
    const startHour = settings.startHour ?? 0;
    
    if (settings.blockShape === 'solid') {
      const isDraggingOverThisDate = activeBlock && dragOverSlot?.dateKey === dateKey;
      let dropIndicatorPosition: number | null = null;
      if (isDraggingOverThisDate && dragOverSlot && activeBlock) {
          dropIndicatorPosition = dragOverSlot.slotIndex;
      }
      
      const startSlotOffset = startHour * SLOTS_PER_HOUR;

      return (
        <div className="relative h-[72rem]"> {/* 144 slots * 0.5rem/slot */}
          {/* Render empty slots for interaction */}
          {Array.from({ length: TOTAL_SLOTS_IN_DAY }).map((_, i) => {
            // This maps the visual index `i` (0-143) to the actual data slotIndex (0-143) considering the startHour offset.
            const slotIndex = (startSlotOffset + i) % TOTAL_SLOTS_IN_DAY;

            const isSelectedForCreation = !!selection &&
              selection.dateKey === dateKey &&
              slotIndex >= Math.min(selection.start, selection.end) &&
              slotIndex <= Math.max(selection.start, selection.end);
            
            return (
              <div key={`empty-${dateKey}-${i}`} className="relative h-2">
                <TimeSlot
                  dateKey={dateKey}
                  slotIndex={slotIndex}
                  selection={selection}
                  isSelectedForCreation={isSelectedForCreation}
                  block={undefined}
                  blockShape={settings.blockShape}
                  onMouseDown={handleMouseDown}
                  onMouseEnter={handleMouseEnter}
                  onClick={handleBlockClick}
                />
              </div>
            );
          })}
          {/* Render actual blocks on top */}
          {Array.from(scheduleForDate?.values() || []).filter((block, index, self) => self.findIndex(b => b.id === block.id) === index).map(block => (
            <TimeSlot
              key={`block-${block.id}`}
              dateKey={dateKey}
              slotIndex={block.startTime}
              block={block}
              blockShape={settings.blockShape}
              onClick={handleBlockClick}
              selection={null}
              isSelectedForCreation={false}
            />
          ))}
          {/* Render drop indicator */}
          {dropIndicatorPosition !== null && activeBlock && (
              <div
                  className="absolute inset-x-0 bg-primary/20 pointer-events-none"
                  style={{ top: `${((dropIndicatorPosition - startSlotOffset + TOTAL_SLOTS_IN_DAY) % TOTAL_SLOTS_IN_DAY) * 0.5}rem`, height: `${activeBlock.duration * 0.5}rem` }}
              />
          )}
        </div>
      );
    }

    // Rounded/Sharp style
    return hours.map(hour => {
      const hourStartSlot = hour * SLOTS_PER_HOUR;
      
      return (
        <div key={hour} className="relative h-12 border-b grid grid-cols-6">
          {Array.from({ length: SLOTS_PER_HOUR }).map((_, i) => {
            const currentSlotIndex = hourStartSlot + i;
            const block = scheduleForDate?.get(currentSlotIndex);
            
            const isHighlightedForDrag = activeBlock &&
                dragOverSlot?.dateKey === dateKey &&
                currentSlotIndex >= dragOverSlot.slotIndex &&
                currentSlotIndex < dragOverSlot.slotIndex + activeBlock.duration;

            const isSelectedForCreation = !!selection &&
              selection.dateKey === dateKey &&
              currentSlotIndex >= Math.min(selection.start, selection.end) &&
              currentSlotIndex <= Math.max(selection.start, selection.end);
            
            return (
              <TimeSlot
                key={`${dateKey}-${currentSlotIndex}`}
                dateKey={dateKey}
                slotIndex={currentSlotIndex}
                block={block}
                blockShape={settings.blockShape}
                selection={selection}
                isSelectedForCreation={isSelectedForCreation}
                isHighlightedForDrag={isHighlightedForDrag}
                onClick={handleBlockClick}
                onMouseDown={handleMouseDown}
                onMouseEnter={handleMouseEnter}
              />
            );
          })}
        </div>
      )
    })
  }
  
  if (loading) {
    return null;
  }
  
  return (
    <TooltipProvider>
      <DndContext 
        sensors={sensors} 
        onDragStart={handleDragStart} 
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => { setActiveId(null); setActiveBlock(null); setDragOverSlot(null); }}
      >
        <div 
          className="relative w-full max-w-7xl mx-auto p-4 md:p-6"
          onMouseUp={handleMouseUp} 
          onMouseLeave={() => {
            if (isCreating) handleMouseUp();
          }}
        >
          <DateNavigator currentDate={viewedDate} onDateChange={setViewedDate} dayCount={currentView.days} />
          
           <div className="flex mt-3">
              <div className="w-14 shrink-0">
                {hours.map(hour => {
                  const date = new Date();
                  date.setHours(hour, 0, 0, 0);
                  const isSolidAndLong = settings.blockShape === 'solid' && hours.length > 12;

                  if (isSolidAndLong && hour % 2 !== 0 && hour !== settings.startHour) {
                    return <div key={hour} className="relative h-12"></div>;
                  }

                  return (
                    <div key={hour} className="relative h-12 flex items-start -translate-y-3">
                      <p className="text-xs font-semibold text-muted-foreground tabular-nums w-14 text-right pr-2">
                        {format(date, settings.timeFormat === '24h' ? 'HH:00' : 'h a').toUpperCase()}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className={cn(
                "grid flex-1 bg-border gap-px",
                currentView.days === 1 && "grid-cols-1",
                currentView.days === 2 && "grid-cols-2",
                currentView.days === 3 && "grid-cols-3",
                currentView.days === 7 && "grid-cols-7",
              )}>
                {displayedDates.map(date => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  
                  return (
                    <div key={dateKey} className="relative bg-background">
                       <div
                          className={cn(settings.blockShape !== 'solid' && 'grid')}
                          style={{ gridTemplateRows: settings.blockShape === 'solid' ? '' : `repeat(${hours.length}, 3rem)` }}
                       >
                         {renderGrid(dateKey)}
                      </div>
                      {isToday(date) && renderTimeIndicator()}
                    </div>
                  );
                })}
              </div>
          </div>
        </div>
        <DragOverlay>
          {activeId && activeBlock && <TimeBlockOverlay block={activeBlock} />}
        </DragOverlay>
        <AddEditSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          block={selectedBlock}
          newBlockInfo={newBlockInfo}
          onSave={handleSave}
          onDelete={handleDelete}
        />
        <AiSuggestions schedules={schedules} onApplySuggestion={handleApplySuggestion} />
        <AlertDialog open={!!conflictInfo} onOpenChange={(open) => !open && setConflictInfo(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Jadwal Bertabrakan</AlertDialogTitle>
              <AlertDialogDescription>
                Aksi ini akan menimpa blok "{conflictInfo?.conflictingBlock.title}". Apa yang ingin Anda lakukan?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConflictInfo(null)}>Batal</AlertDialogCancel>
               <AlertDialogAction onClick={handleReschedule}>
                Pindahkan Otomatis
              </AlertDialogAction>
              <AlertDialogAction
                onClick={() => {
                  if (conflictInfo) {
                    const id = conflictInfo.conflictingBlock.id;
                    const isRecurring = id.startsWith('recurring-');
                    const dateString = isRecurring ? id.split('-').slice(2).join('-') : format(new Date(), 'yyyy-MM-dd');
                    deleteBlock(new Date(dateString), conflictInfo.conflictingBlock.id);
                    conflictInfo.action();
                  }
                  setConflictInfo(null);
                }}
              >
                Timpa
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DndContext>
    </TooltipProvider>
  );
}
