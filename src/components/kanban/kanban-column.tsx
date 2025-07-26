
'use client';

import * as React from 'react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import type { InboxItem, KanbanColumn as ColumnType } from '@/lib/types';
import { KanbanCard } from './kanban-card';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslations } from '@/hooks/use-translations';

interface KanbanColumnProps {
  column: ColumnType;
  items: InboxItem[];
  onAddItem: () => void;
  onEditItem: (item: InboxItem) => void;
}

export function KanbanColumn({ column, items, onAddItem, onEditItem }: KanbanColumnProps) {
  const itemsIds = React.useMemo(() => items.map((item) => item.id), [items]);
  const t = useTranslations();

  const { setNodeRef } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className="w-72 sm:w-80 h-full flex flex-col flex-shrink-0"
    >
      <div className="bg-muted p-3 rounded-t-lg flex justify-between items-center border-b">
        <h3 className="font-semibold text-lg">{column.title}</h3>
        <span className="text-sm font-bold text-muted-foreground bg-background rounded-full px-2 py-0.5">
            {items.length}
        </span>
      </div>
      <div className="flex-grow bg-muted/50 p-2 space-y-2 overflow-y-auto rounded-b-lg">
        <SortableContext items={itemsIds}>
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} onEdit={() => onEditItem(item)} />
          ))}
        </SortableContext>
         <Button variant="ghost" className="w-full" onClick={onAddItem}>
            <Plus className="mr-2 h-4 w-4" />
            {t.kanban.add_task}
        </Button>
      </div>
    </div>
  );
}
