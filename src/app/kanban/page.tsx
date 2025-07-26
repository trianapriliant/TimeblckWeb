
'use client';

import * as React from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext } from '@dnd-kit/sortable';
import { useInbox } from '@/hooks/inbox-provider';
import { useTranslations } from '@/hooks/use-translations';
import { KanbanColumn } from '@/components/kanban/kanban-column';
import { KanbanCard } from '@/components/kanban/kanban-card';
import type { InboxItem, KanbanColumn as ColumnType } from '@/lib/types';
import { AddEditItemSheet } from '@/components/inbox/add-edit-item-sheet';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePageActions } from '@/hooks/page-actions-provider';

const DEFAULT_COLUMNS: ColumnType[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
];

export default function KanbanPage() {
  const t = useTranslations();
  const { items, updateItem, isLoaded } = useInbox();
  const isMobile = useIsMobile();
  const { setPageActions } = usePageActions();
  
  const columns = DEFAULT_COLUMNS;
  
  const [activeItem, setActiveItem] = React.useState<InboxItem | null>(null);
  
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<InboxItem | null>(null);
  const [targetColumnId, setTargetColumnId] = React.useState<string | undefined>(undefined);

  // Memoize the filtered Kanban tasks
  const kanbanTasks = React.useMemo(() => items.filter(i => i.kanbanColumnId), [items]);
  
  // State for mobile view tabs
  const [selectedColumnId, setSelectedColumnId] = React.useState<string | undefined>(undefined);

  const columnsId = React.useMemo(() => columns.map((col) => col.id), [columns]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleAddItem = React.useCallback((columnId: string) => {
    setSelectedItem(null);
    setTargetColumnId(columnId);
    setSheetOpen(true);
  }, []);

  React.useEffect(() => {
    const fabAction = {
      label: t.kanban.add_task,
      action: () => handleAddItem(selectedColumnId || 'todo'),
    };
    
    setPageActions({
      title: t.kanban.title,
      description: t.kanban.description,
      fab: fabAction,
    });

    return () => setPageActions(null);
  }, [setPageActions, t, handleAddItem, selectedColumnId]);
  
  React.useEffect(() => {
    if (isMobile && columns.length > 0 && !selectedColumnId) {
        setSelectedColumnId(columns[0].id);
    }
  }, [isMobile, columns, selectedColumnId]);

  const handleEditItem = (item: InboxItem) => {
    setSelectedItem(item);
    setTargetColumnId(undefined);
    setSheetOpen(true);
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Task') {
      setActiveItem(event.active.data.current.item);
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveItem(null);
  }
  
  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeItem = active.data.current?.item as InboxItem;
    if (!activeItem) return;

    const isOverAColumn = over.data.current?.type === 'Column';

    if (isOverAColumn) {
        if (activeItem.kanbanColumnId !== over.id) {
            updateItem(activeItem.id, { kanbanColumnId: over.id as string });
        }
    }
    
    const isOverATask = over.data.current?.type === 'Task';
    if(isOverATask) {
        const overItem = over.data.current?.item as InboxItem;
        if(activeItem.kanbanColumnId !== overItem.kanbanColumnId) {
             updateItem(activeItem.id, { kanbanColumnId: overItem.kanbanColumnId });
        }
    }
  }

  const DesktopView = () => (
    <div className="flex-1 flex min-w-0 gap-4 overflow-x-auto pb-4 px-4 md:px-6">
        <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
        >
            <SortableContext items={columnsId}>
                {columns.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        column={col}
                        items={kanbanTasks.filter((item) => item.kanbanColumnId === col.id)}
                        onAddItem={() => handleAddItem(col.id)}
                        onEditItem={handleEditItem}
                    />
                ))}
            </SortableContext>
            <DragOverlay>
                {activeItem && <KanbanCard item={activeItem} onEdit={() => {}} />}
            </DragOverlay>
        </DndContext>
    </div>
  );
  
  const MobileView = () => (
    <div className="px-4 md:px-6 flex-1">
        <Tabs value={selectedColumnId} onValueChange={setSelectedColumnId} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                {columns.map(col => (
                    <TabsTrigger key={col.id} value={col.id}>{col.title}</TabsTrigger>
                ))}
            </TabsList>
            {columns.map(col => (
                 <TabsContent key={col.id} value={col.id} className="mt-4">
                     <div className="space-y-2">
                        {kanbanTasks.filter(item => item.kanbanColumnId === col.id).map(item => (
                             <KanbanCard key={item.id} item={item} onEdit={() => handleEditItem(item)} />
                        ))}
                        <Button variant="ghost" className="w-full mt-2" onClick={() => handleAddItem(col.id)}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t.kanban.add_task}
                        </Button>
                     </div>
                 </TabsContent>
            ))}
        </Tabs>
    </div>
  );

  if (isMobile === undefined || !isLoaded) {
      return (
          <div className="h-full p-4 md:p-6 space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-5 w-2/3" />
              <div className="flex gap-4">
                <Skeleton className="h-96 w-80" />
                <Skeleton className="h-96 w-80" />
                <Skeleton className="h-96 w-80" />
              </div>
          </div>
      )
  }

  return (
    <div className="h-[calc(100vh-theme(spacing.14))] flex flex-col overflow-hidden p-4 md:p-6">
      {isMobile ? <MobileView /> : <DesktopView />}
      
       <AddEditItemSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          item={selectedItem}
          source="kanban"
          defaultKanbanColumn={targetColumnId}
      />
    </div>
  );
}
