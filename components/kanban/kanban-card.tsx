
'use client';

import * as React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { InboxItem } from '@/lib/types';
import { MoreVertical, Pen, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { useInbox } from '@/hooks/inbox-provider';
import { useTranslations } from '@/hooks/use-translations';

interface KanbanCardProps {
  item: InboxItem;
  onEdit: () => void;
}

export function KanbanCard({ item, onEdit }: KanbanCardProps) {
  const { deleteItem } = useInbox();
  const t = useTranslations();
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: 'Task',
      item,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  
  const handleDeleteConfirm = () => {
    deleteItem(item.id);
    setIsConfirmingDelete(false);
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-24 w-full bg-muted border-2 border-dashed rounded-lg"
      />
    );
  }

  return (
    <>
      <div ref={setNodeRef} style={style}>
        <Card className="hover:shadow-md transition-shadow">
          <div
            className="flex items-center p-4"
          >
            <div 
              className="flex-1 min-w-0 cursor-pointer"
              {...attributes} 
              {...listeners}
              onClick={onEdit}
            >
              <CardTitle className="text-base font-medium break-all">{item.title}</CardTitle>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 -mr-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pen className="mr-2 h-4 w-4" />
                  <span>{t.common.edit}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsConfirmingDelete(true)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>{t.common.delete}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </div>

      <AlertDialog open={isConfirmingDelete} onOpenChange={setIsConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.kanban.delete_confirmation_title}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.kanban.delete_confirmation_description.replace('{title}', item.title)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmingDelete(false)}>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>{t.common.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
