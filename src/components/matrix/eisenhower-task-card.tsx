
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pen, Trash2, Clock, Calendar } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useInbox } from '@/hooks/inbox-provider';
import { useToast } from '@/hooks/use-toast';
import type { InboxItem } from '@/lib/types';
import { cn, formatSlotTime } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';
import { useTimeBlocks } from '@/hooks/time-blocks-provider';
import { format as formatDate } from 'date-fns';
import { useAppSettings } from '@/hooks/app-settings-provider';

interface EisenhowerTaskCardProps {
  item: InboxItem;
  onEdit: () => void;
}

export function EisenhowerTaskCard({ item, onEdit }: EisenhowerTaskCardProps) {
  const { deleteItem, toggleItemCompletion } = useInbox();
  const { blocksByDate } = useTimeBlocks();
  const { settings } = useAppSettings();
  const { toast } = useToast();
  const t = useTranslations();

  const scheduledBlockInfo = React.useMemo(() => {
    for (const dateKey in blocksByDate) {
      const block = blocksByDate[dateKey].find(b => b.deadlineFor === item.id);
      if (block) {
        return {
          date: new Date(dateKey.replace(/-/g, '/')), // Use / for broader compatibility
          block: block,
        };
      }
    }
    return null;
  }, [blocksByDate, item.id]);

  const handleSchedule = () => {
    navigator.clipboard.writeText(item.title);
    toast({
      title: 'Task Title Copied',
      description: t.matrix.schedule_task_toast,
    });
  };

  const renderStatus = () => {
    if (scheduledBlockInfo) {
      return (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="text-[10px] sm:text-xs">
            {formatDate(scheduledBlockInfo.date, 'MMM d')} - {formatSlotTime(scheduledBlockInfo.block.startTime, scheduledBlockInfo.block.duration, settings.timeFormat).split(' - ')[0]}
          </span>
        </div>
      );
    }
    if (item.deadline) {
       return (
         <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span className="text-[10px] sm:text-xs">Deadline: {formatDate(new Date(item.deadline), 'MMM d, yyyy')}</span>
          </div>
       );
    }
    return (
        <Button variant="link" size="sm" asChild className="h-auto p-0 text-[10px] sm:text-xs">
            <Link href="/">Blck This!</Link>
        </Button>
    );
  }

  return (
    <div className={cn(
        "flex items-start bg-muted/50 rounded-md transition-opacity gap-2",
        item.isCompleted && 'opacity-50'
    )}>
        <div className="p-2 pl-3">
            <Checkbox
              id={`task-${item.id}`}
              checked={item.isCompleted}
              onCheckedChange={() => toggleItemCompletion(item.id)}
              className="mt-1 h-3.5 w-3.5"
            />
        </div>
        <div 
            onClick={onEdit}
            className="flex-1 min-w-0 py-2 cursor-pointer"
        >
            <p className={cn(
                "text-xs sm:text-sm font-medium overflow-hidden", 
                item.isCompleted && 'line-through'
            )}>
                <span className="break-words">{item.title}</span>
                {item.content && (
                <>
                    <span className="mx-2 text-muted-foreground">|</span>
                    <span className="text-muted-foreground font-normal truncate">{item.content}</span>
                </>
                )}
            </p>
           <div className="mt-1 sm:hidden">
            {renderStatus()}
          </div>
        </div>
        
        <div className="hidden sm:block flex-shrink-0 p-2 text-right">{renderStatus()}</div>

        <div className="p-1 self-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 self-center sm:self-auto">
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSchedule}>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{t.matrix.schedule_task}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Pen className="mr-2 h-4 w-4" />
                  <span>{t.common.edit}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>{t.common.delete}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </div>
  );
}
