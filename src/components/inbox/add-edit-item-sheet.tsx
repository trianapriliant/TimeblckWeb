
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useInbox } from '@/hooks/inbox-provider';
import type { InboxItem, EisenhowerQuadrant, KanbanColumn } from '@/lib/types';
import { useTranslations } from '@/hooks/use-translations';
import { eisenhowerQuadrants } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar as CalendarIcon, Bell } from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const KANBAN_COLUMNS: KanbanColumn[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
];

const reminderOptions = [
    { label: 'No reminder', value: 0 },
    { label: '1 hour before', value: 60 },
    { label: '2 hours before', value: 120 },
    { label: '3 hours before', value: 180 },
    { label: '5 hours before', value: 300 },
    { label: '1 day before', value: 1440 },
    { label: '2 days before', value: 2880 },
    { label: '3 days before', value: 4320 },
    { label: '1 week before', value: 10080 },
];

const formSchema = z.object({
  title: z.string().min(1, 'Task title is required.'),
  content: z.string().optional(),
  quadrant: z.string().optional(),
  kanbanColumnId: z.string().optional(),
  deadline: z.date().optional(),
  reminderLeadTime: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEditItemSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InboxItem | null;
  source: 'inbox' | 'matrix' | 'kanban' | 'fab';
  defaultKanbanColumn?: string;
}

const quadrantMeta: { [key in EisenhowerQuadrant]: { id: key; label: string; letter: string; color: string } } = {
  URGENT_IMPORTANT: { id: 'URGENT_IMPORTANT', label: 'Urgent & Important', letter: 'A', color: 'bg-red-500 hover:bg-red-500/90 text-red-50' },
  NOT_URGENT_IMPORTANT: { id: 'NOT_URGENT_IMPORTANT', label: 'Not Urgent & Important', letter: 'B', color: 'bg-blue-500 hover:bg-blue-500/90 text-blue-50' },
  URGENT_NOT_IMPORTANT: { id: 'URGENT_NOT_IMPORTANT', label: 'Urgent & Not Important', letter: 'C', color: 'bg-orange-500 hover:bg-orange-500/90 text-orange-50' },
  NOT_URGENT_NOT_IMPORTANT: { id: 'NOT_URGENT_NOT_IMPORTANT', label: 'Not Urgent & Not Important', letter: 'D', color: 'bg-gray-500 hover:bg-gray-500/90 text-gray-50' },
};

const quadrantOrder: EisenhowerQuadrant[] = ['URGENT_IMPORTANT', 'NOT_URGENT_IMPORTANT', 'URGENT_NOT_IMPORTANT', 'NOT_URGENT_NOT_IMPORTANT'];


export function AddEditItemSheet({ open, onOpenChange, item, source, defaultKanbanColumn }: AddEditItemSheetProps) {
  const { addItem, updateItem } = useInbox();
  const t = useTranslations();
  const { toast } = useToast();
  const isEditMode = !!item;
  const isMobile = useIsMobile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      quadrant: '',
      kanbanColumnId: 'none',
      deadline: undefined,
      reminderLeadTime: "0",
    },
  });

  React.useEffect(() => {
    if (open) {
      if (item) {
        form.reset({
          title: item.title,
          content: item.content || '',
          quadrant: item.quadrant || '',
          kanbanColumnId: item.kanbanColumnId || 'none',
          deadline: item.deadline ? new Date(item.deadline) : undefined,
          reminderLeadTime: String(item.reminderLeadTime || 0),
        });
      } else {
        form.reset({
          title: '',
          content: '',
          quadrant: source === 'matrix' ? 'URGENT_IMPORTANT' : '',
          kanbanColumnId: source === 'kanban' ? defaultKanbanColumn || 'todo' : 'none',
          deadline: undefined,
          reminderLeadTime: "0",
        });
      }
    }
  }, [open, item, form, source, defaultKanbanColumn]);

  const onSubmit = (data: FormValues) => {
    const payload: Partial<InboxItem> = {
        title: data.title,
        content: data.content,
        quadrant: data.quadrant as EisenhowerQuadrant || undefined,
        kanbanColumnId: data.kanbanColumnId === 'none' ? undefined : data.kanbanColumnId as KanbanColumn['id'],
        deadline: data.deadline?.toISOString(),
        reminderLeadTime: data.reminderLeadTime ? parseInt(data.reminderLeadTime, 10) : 0,
    };

    if (isEditMode && item) {
      updateItem(item.id, payload);
      toast({ title: t.inbox.item_updated, description: `"${data.title}" has been updated.`});
    } else {
      addItem(payload as any);
      toast({ title: t.inbox.item_added, description: `"${data.title}" has been added.`});
    }
    onOpenChange(false);
  };
  
  const content = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 px-1 flex-1">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.inbox.item_title_label}</FormLabel>
              <FormControl>
                <Input placeholder={t.inbox.item_title_placeholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t.inbox.item_content_label}</FormLabel>
              <FormControl>
                <Textarea placeholder={t.inbox.item_content_placeholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <div className="rounded-lg border p-4 space-y-4">
            <FormLabel className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {t.inbox.deadline_reminder_title}
            </FormLabel>
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel>{t.inbox.deadline_label}</FormLabel>
                    <Popover>
                    <PopoverTrigger asChild>
                        <FormControl>
                        <Button
                            variant={"outline"}
                            className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                            )}
                        >
                            {field.value ? (
                            format(field.value, "PPP")
                            ) : (
                            <span>{t.inbox.pick_a_date}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                        </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        />
                    </PopoverContent>
                    </Popover>
                    <FormMessage />
                </FormItem>
                )}
            />
              <FormField
                control={form.control}
                name="reminderLeadTime"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t.inbox.reminder_label}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                            <SelectContent>
                                {reminderOptions.map(opt => <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}
            />
        </div>
        
        <FormField
          control={form.control}
          name="quadrant"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t.matrix.quadrant_label}</FormLabel>
                <FormDescription>{t.inbox.quadrant_description}</FormDescription>
                <FormControl>
                    <TooltipProvider>
                      <ToggleGroup
                        type="single"
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-4 gap-2"
                      >
                        {quadrantOrder.map(q => {
                            const meta = quadrantMeta[q];
                            return (
                                <Tooltip key={q} delayDuration={100}>
                                    <TooltipTrigger asChild>
                                        <ToggleGroupItem
                                            value={q}
                                            aria-label={meta.label}
                                            className={cn(
                                                "h-12 text-lg font-bold data-[state=on]:ring-2 data-[state=on]:ring-ring data-[state=on]:ring-offset-2 data-[state=on]:ring-offset-background",
                                                field.value === q ? meta.color : 'bg-muted/60 hover:bg-muted'
                                            )}
                                        >
                                            {meta.letter}
                                        </ToggleGroupItem>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{meta.letter}: {meta.label}</p>
                                    </TooltipContent>
                                </Tooltip>
                            )
                        })}
                      </ToggleGroup>
                    </TooltipProvider>
                </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
            control={form.control}
            name="kanbanColumnId"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{t.kanban.title}</FormLabel>
                    <FormDescription>{t.inbox.kanban_description}</FormDescription>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder={t.inbox.kanban_select_placeholder} />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="none">{t.inbox.kanban_select_placeholder}</SelectItem>
                            {KANBAN_COLUMNS.map(col => <SelectItem key={col.id} value={col.id}>{col.title}</SelectItem>)}
                        </SelectContent>
                    </Select>
                      <FormMessage />
                </FormItem>
            )}
        />
      </form>
    </Form>
  );

  const footer = (
     <DialogFooter className="!mt-8 flex-col-reverse sm:flex-row gap-2 pt-4 border-t">
        <DialogClose asChild>
          <Button type="button" variant="secondary" className="w-full sm:w-auto">
            {t.common.cancel}
          </Button>
        </DialogClose>
        <Button type="submit" onClick={form.handleSubmit(onSubmit)} className="w-full sm:w-auto">
          {isEditMode ? t.common.edit : t.inbox.add_item_button}
        </Button>
      </DialogFooter>
  )

  if (isMobile === undefined) return null;

  return (
    <>
      {isMobile ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-lg">
                <SheetHeader className="text-left">
                    <SheetTitle>{isEditMode ? t.inbox.edit_sheet_title : t.inbox.add_sheet_title}</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[70vh] -mx-6 px-4">
                    {content}
                </ScrollArea>
                {footer}
            </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? t.inbox.edit_sheet_title : t.inbox.add_sheet_title}</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] -mx-6 px-4">
                    {content}
                </ScrollArea>
                {footer}
            </DialogContent>
        </Dialog>
      )}
    </>
  );
}
