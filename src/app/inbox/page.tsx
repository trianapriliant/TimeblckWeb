
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Zap, Edit, Calendar, ListTodo, Loader, CheckCircle, AlertOctagon, CheckSquare, Coffee, Archive, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import { useInbox } from '@/hooks/inbox-provider';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AddEditItemSheet } from '@/components/inbox/add-edit-item-sheet';
import type { InboxItem, EisenhowerQuadrant, KanbanColumn } from '@/lib/types';
import { usePageActions } from '@/hooks/page-actions-provider';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const formSchema = z.object({
  title: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;

const KANBAN_META: Record<KanbanColumn['id'], { label: string; icon: React.ElementType }> = {
    'todo': { label: 'To Do', icon: ListTodo },
    'in-progress': { label: 'In Progress', icon: Loader },
    'done': { label: 'Done', icon: CheckCircle },
};

const QUADRANT_META: Record<EisenhowerQuadrant, { label: string; icon: React.ElementType; color: string }> = {
    'URGENT_IMPORTANT': { label: 'Urgent & Important', icon: AlertOctagon, color: 'text-red-500' },
    'NOT_URGENT_IMPORTANT': { label: 'Not Urgent & Important', icon: CheckSquare, color: 'text-blue-500' },
    'URGENT_NOT_IMPORTANT': { label: 'Urgent & Not Important', icon: Coffee, color: 'text-amber-500' },
    'NOT_URGENT_NOT_IMPORTANT': { label: 'Not Urgent & Not Important', icon: Archive, color: 'text-gray-500' },
};

export default function InboxPage() {
    const t = useTranslations();
    const { items, addItem, deleteItem } = useInbox();
    const { setPageActions } = usePageActions();

    const [sheetOpen, setSheetOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<InboxItem | null>(null);
    const [expandedItemId, setExpandedItemId] = React.useState<string | null>(null);

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
        },
    });

    const onSubmit = (data: FormValues) => {
        addItem({ title: data.title });
        form.reset();
    };

    const handleEdit = (item: InboxItem) => {
        setSelectedItem(item);
        setSheetOpen(true);
    };
    
    const handleAddNew = React.useCallback(() => {
        setSelectedItem(null);
        setSheetOpen(true);
    }, []);

    React.useEffect(() => {
        const fabAction = {
            label: t.inbox.add_item_button,
            action: handleAddNew,
        };

        setPageActions({
            title: t.nav.inbox,
            description: t.inbox.description,
            fab: fabAction,
        });

        return () => setPageActions(null);
    }, [setPageActions, t, handleAddNew]);

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [items]);

    return (
        <TooltipProvider>
            <div className="container mx-auto p-4 md:p-6">
                <Card className="mb-6">
                    <CardContent className="p-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormControl>
                                                <Input placeholder={t.inbox.add_placeholder} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" aria-label={t.inbox.add_button}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <div className="space-y-3">
                    {sortedItems.length === 0 && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                    <Zap className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="text-lg font-medium mt-4">{t.inbox.empty_title}</h3>
                                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                        {t.inbox.empty_description}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {sortedItems.map((item) => {
                        const kanbanInfo = item.kanbanColumnId ? KANBAN_META[item.kanbanColumnId] : null;
                        const quadrantInfo = item.quadrant ? QUADRANT_META[item.quadrant] : null;
                        const isExpanded = expandedItemId === item.id;

                        return (
                            <Card key={item.id}>
                                <div 
                                    className={cn('p-3', item.content && 'cursor-pointer')}
                                    onClick={() => item.content && setExpandedItemId(isExpanded ? null : item.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 space-y-2 min-w-0">
                                            <p className="font-medium break-all">
                                              {item.title}
                                            </p>
                                            {(kanbanInfo || quadrantInfo || item.deadline) && (
                                                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                                    {kanbanInfo && (
                                                         <Tooltip delayDuration={100}>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center gap-1.5">
                                                                    <kanbanInfo.icon className={cn("h-3.5 w-3.5", kanbanInfo.label === 'In Progress' && 'animate-spin')} />
                                                                    <span>{kanbanInfo.label}</span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent><p>Kanban Status</p></TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    {quadrantInfo && (
                                                        <Tooltip delayDuration={100}>
                                                            <TooltipTrigger asChild>
                                                                <div className={cn("flex items-center gap-1.5", quadrantInfo.color)}>
                                                                    <quadrantInfo.icon className="h-3.5 w-3.5" />
                                                                    <span>{quadrantInfo.label}</span>
                                                                </div>
                                                             </TooltipTrigger>
                                                            <TooltipContent><p>Matrix Priority</p></TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                    {item.deadline && (
                                                        <Tooltip delayDuration={100}>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar className="h-3.5 w-3.5" />
                                                                    <span>{format(new Date(item.deadline), 'MMM d')}</span>
                                                                </div>
                                                            </TooltipTrigger>
                                                             <TooltipContent><p>Deadline</p></TooltipContent>
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>{t.inbox.organize_button}</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>{t.common.delete}</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {isExpanded && item.content && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="px-3 pb-3"
                                        >
                                            <p className="text-sm text-muted-foreground break-words whitespace-pre-wrap border-t pt-3 mt-3">
                                                {item.content}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        )
                    })}
                </div>

                <AddEditItemSheet 
                    item={selectedItem}
                    open={sheetOpen}
                    onOpenChange={setSheetOpen}
                    source="inbox"
                />
            </div>
        </TooltipProvider>
    );
}
