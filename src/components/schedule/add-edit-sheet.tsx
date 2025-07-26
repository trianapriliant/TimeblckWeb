
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bell, Check, Trash2, Palette, Lock, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { BLOCK_COLORS, type TimeBlock, type BlockColor } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { getContrastingTextColor, formatSlotTime } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PremiumOfferDialog } from '@/components/shared/premium-offer-dialog';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  color: z.string(),
  reminderLeadTime: z.number(),
  duration: z.number().min(1, 'Duration must be at least 10 minutes.'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: TimeBlock | null;
  newBlockInfo: { startTime: number; duration: number; title?: string; color?: BlockColor; } | null;
  onSave: (data: { title: string; color: BlockColor; reminderLeadTime: number; duration: number; }) => void;
  onDelete: () => void;
}

const reminderOptions = [
    { value: 0, label: 'No reminder' },
    { value: 5, label: '5 minutes before' },
    { value: 10, label: '10 minutes before' },
    { value: 15, label: '15 minutes before' },
];

const durationOptions = [
    { value: 1, label: '10 mins' }, { value: 2, label: '20 mins' },
    { value: 3, label: '30 mins' }, { value: 4, label: '40 mins' }, { value: 5, label: '50 mins' },
    { value: 6, label: '1 hour' },   { value: 9, label: '1.5 hours' }, { value: 12, label: '2 hours' },
    { value: 18, label: '3 hours' }, { value: 24, label: '4 hours' }, { value: 36, label: '6 hours' },
    { value: 48, label: '8 hours' }
];


export function AddEditSheet({ open, onOpenChange, block, newBlockInfo, onSave, onDelete }: AddEditSheetProps) {
  const isMobile = useIsMobile();
  const { settings } = useAppSettings();
  const colorInputRef = React.useRef<HTMLInputElement>(null);
  const [premiumDialogOpen, setPremiumDialogOpen] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      color: 'lime',
      reminderLeadTime: 0,
      duration: 1,
    },
  });

  React.useEffect(() => {
    if (open) {
      if (block) {
        form.reset({
          title: block.title,
          color: block.color,
          reminderLeadTime: (block as any).reminderLeadTime ?? ((block as any).reminder ? 5 : 0),
          duration: block.duration,
        });
      } else if (newBlockInfo) {
        form.reset({
          title: newBlockInfo.title || '',
          color: newBlockInfo.color || 'lime',
          reminderLeadTime: 0,
          duration: newBlockInfo.duration || 1,
        });
      }
    }
  }, [open, block, newBlockInfo, form]);

  const onSubmit = (data: FormValues) => {
    onSave({ ...data, color: data.color as BlockColor, duration: Number(data.duration) });
  };

  const handleDelete = () => {
    if (block) {
      onDelete();
    }
  };

  const startTime = block?.startTime ?? newBlockInfo?.startTime;
  const currentDuration = form.watch('duration');

  const content = (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 px-1">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Morning workout" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center gap-2 text-foreground">
                <Clock className="h-4 w-4" />
                <FormLabel>Time</FormLabel>
            </div>

            {startTime !== undefined && (
                <div className="text-sm text-muted-foreground font-mono bg-muted/50 rounded-md p-2 text-center">
                    {formatSlotTime(startTime, currentDuration, settings.timeFormat)}
                </div>
            )}

            <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select
                            onValueChange={(value) => field.onChange(parseInt(value, 10))}
                            value={String(field.value)}
                        >
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a duration" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {durationOptions.map(opt => (
                                    <SelectItem key={opt.value} value={String(opt.value)}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-8 gap-2">
                    {Object.keys(BLOCK_COLORS).map((colorKey) => {
                      const color = BLOCK_COLORS[colorKey as keyof typeof BLOCK_COLORS];
                      if (!color) return null;
                      return (
                        <button
                          type="button"
                          key={colorKey}
                          onClick={() => field.onChange(colorKey)}
                          className={cn(
                            'h-10 w-10 rounded-lg border-2 flex items-center justify-center transition-all',
                            color.solid,
                            field.value === colorKey ? 'border-primary' : 'border-transparent'
                          )}
                          aria-label={`Select ${colorKey} color`}
                        >
                          {field.value === colorKey && (
                            <Check className={cn('h-5 w-5', color.foreground)} />
                          )}
                        </button>
                      );
                    })}
                      {settings.isPremium ? (
                      (() => {
                        const isCustomColorSelected = field.value.startsWith('#');
                        return (
                            <button
                            type="button"
                            onClick={() => colorInputRef.current?.click()}
                            className={cn(
                              'relative h-10 w-10 rounded-lg border-2 flex items-center justify-center transition-all',
                              !isCustomColorSelected && 'bg-muted/50',
                              isCustomColorSelected ? 'border-primary' : 'border-transparent'
                            )}
                            style={isCustomColorSelected ? { backgroundColor: field.value } : {}}
                            aria-label="Select custom color"
                          >
                            {isCustomColorSelected ? (
                              <Check 
                                className='h-5 w-5'
                                style={{ color: getContrastingTextColor(field.value) }}
                              />
                            ) : (
                              <Palette className="h-5 w-5 text-muted-foreground" />
                            )}
                            <input
                              ref={colorInputRef}
                              type="color"
                              className="absolute h-0 w-0 opacity-0"
                              value={isCustomColorSelected ? field.value : '#a855f7'}
                              onInput={(e) => field.onChange((e.target as HTMLInputElement).value)}
                              tabIndex={-1}
                            />
                          </button>
                        )
                      })()
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPremiumDialogOpen(true)}
                        className="relative h-10 w-10 rounded-lg border flex items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted"
                        aria-label="Upgrade to unlock custom colors"
                      >
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reminderLeadTime"
            render={({ field }) => (
              <FormItem className="space-y-3 rounded-lg border p-4">
                  <FormLabel className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Reminder
                  </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(value) => field.onChange(parseInt(value, 10))}
                    value={String(field.value)}
                    className="grid grid-cols-2 gap-x-4 gap-y-2"
                  >
                    {reminderOptions.map(opt => (
                      <FormItem key={opt.value} className="flex items-center space-x-2">
                          <FormControl>
                          <RadioGroupItem value={String(opt.value)} id={`r-${opt.value}`} />
                          </FormControl>
                          <FormLabel htmlFor={`r-${opt.value}`} className="font-normal">{opt.label}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
  );

  const footer = (
     <DialogFooter className="!mt-8 flex-col-reverse sm:flex-row gap-2 pt-4 border-t">
        {block && (
          <Button type="button" variant="destructive" onClick={handleDelete} className="w-full sm:w-auto mr-auto">
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        )}
        <DialogClose asChild>
          <Button type="button" variant="secondary" className="w-full sm:w-auto">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" onClick={form.handleSubmit(onSubmit)} className="w-full sm:w-auto">Save changes</Button>
      </DialogFooter>
  )

  return (
    <>
      {isMobile ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="rounded-t-lg">
            <SheetHeader className="text-left">
              <SheetTitle>{block ? 'Edit Block' : 'Add Block'}</SheetTitle>
            </SheetHeader>
            <ScrollArea className="h-[70vh] -mx-6 px-4">
              {content}
            </ScrollArea>
            {footer}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{block ? 'Edit Block' : 'Add Block'}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] -mx-6 px-4">
              {content}
            </ScrollArea>
            {footer}
          </DialogContent>
        </Dialog>
      )}
      <PremiumOfferDialog open={premiumDialogOpen} onOpenChange={setPremiumDialogOpen} />
    </>
  );
}

    
