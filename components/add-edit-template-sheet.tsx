
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bell, Check, Palette, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRecurringBlocks } from '@/hooks/use-recurring-blocks';
import { cn } from '@/lib/utils';
import { BLOCK_COLORS, type RecurringBlock, type BlockColor } from '@/lib/types';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { getContrastingTextColor } from '@/lib/utils';


const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  color: z.string(),
  reminderLeadTime: z.number(),
  daysOfWeek: z.array(z.number()).min(1, 'Please select at least one day.'),
  startHour: z.string(),
  startMinute: z.string(),
  duration: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEditTemplateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: RecurringBlock | null;
}

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = Array.from({ length: 6 }, (_, i) => (i * 10).toString().padStart(2, '0'));
const durations = [
    { value: '1', label: '10 mins' }, { value: '2', label: '20 mins' },
    { value: '3', label: '30 mins' }, { value: '4', label: '40 mins' }, { value: '5', label: '50 mins' },
    { value: '6', label: '1 hour' },   { value: '9', label: '1.5 hours' }, { value: '12', label: '2 hours' },
    { value: '18', label: '3 hours' }, { value: '24', label: '4 hours' }, { value: '36', label: '6 hours' },
    { value: '48', label: '8 hours' }, { value: '72', label: '12 hours' }
];
const DAY_MAP = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const reminderOptions = [
    { value: 0, label: 'No reminder' },
    { value: 5, label: '5 minutes before' },
    { value: 10, label: '10 minutes before' },
    { value: 15, label: '15 minutes before' },
];

export function AddEditTemplateSheet({ open, onOpenChange, template }: AddEditTemplateSheetProps) {
  const { recurringBlocks, addRecurringBlock, updateRecurringBlock } = useRecurringBlocks();
  const { settings } = useAppSettings();
  const colorInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      color: 'purple',
      reminderLeadTime: 0,
      daysOfWeek: [],
      startHour: '09',
      startMinute: '00',
      duration: '6', // 1 hour
    },
  });

  React.useEffect(() => {
    if (open) {
      if (template) {
        const startHour = Math.floor(template.startTime / 6);
        const startMinute = (template.startTime % 6) * 10;
        form.reset({
          title: template.title,
          color: template.color,
          reminderLeadTime: (template as any).reminderLeadTime ?? ((template as any).reminder ? 5 : 0),
          daysOfWeek: template.daysOfWeek,
          startHour: startHour.toString().padStart(2, '0'),
          startMinute: startMinute.toString().padStart(2, '0'),
          duration: template.duration.toString(),
        });
      } else {
        form.reset({
          title: '',
          color: 'purple',
          reminderLeadTime: 0,
          daysOfWeek: [],
          startHour: '09',
          startMinute: '00',
          duration: '6',
        });
      }
    }
  }, [open, template, form]);

  const onSubmit = (data: FormValues) => {
    const startTime = parseInt(data.startHour) * 6 + parseInt(data.startMinute) / 10;
    const duration = parseInt(data.duration);

    const isEditing = template ? recurringBlocks.some(rb => rb.id === template.id) : false;
    const id = isEditing ? template!.id : crypto.randomUUID();

    const recurringBlockData = {
        title: data.title,
        color: data.color as BlockColor,
        reminderLeadTime: data.reminderLeadTime,
        daysOfWeek: data.daysOfWeek,
        startTime,
        duration,
    };

    if (isEditing) {
        updateRecurringBlock(id, recurringBlockData);
    } else {
        addRecurringBlock({ id, ...recurringBlockData });
    }

    onOpenChange(false);
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{template ? 'Edit Template' : 'Add Template'}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 px-1 flex-1 overflow-y-auto">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Deep Work" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="startHour"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Start Hour</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent><SelectContent>
                                    {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                </SelectContent></SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="startMinute"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Start Minute</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                                <SelectContent>
                                    {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </FormItem>
                    )}
                />
            </div>
             <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
                            <SelectContent>
                                {durations.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="daysOfWeek"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Repeat on</FormLabel>
                        <FormControl>
                            <ToggleGroup 
                                type="multiple" 
                                variant="outline" 
                                className="grid grid-cols-7 gap-1"
                                value={field.value.map(String)}
                                onValueChange={(value) => field.onChange(value.map(Number))}
                            >
                                {DAY_MAP.map((day, index) => (
                                    <ToggleGroupItem key={index} value={String(index)} aria-label={day} className="h-10 w-10 p-0">
                                        {day}
                                    </ToggleGroupItem>
                                ))}
                            </ToggleGroup>
                        </FormControl>
                         <FormMessage />
                    </FormItem>
                )}
            />

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
                       {/* Custom Color Picker */}
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
                        <div className="relative h-10 w-10 rounded-lg border flex items-center justify-center bg-muted/50 cursor-not-allowed" title="Custom colors are a premium feature">
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        </div>
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
                            <RadioGroupItem value={String(opt.value)} id={`tmpl-r-${opt.value}`} />
                           </FormControl>
                           <FormLabel htmlFor={`tmpl-r-${opt.value}`} className="font-normal">{opt.label}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
            
            <SheetFooter className="!mt-8 flex-col-reverse sm:flex-row gap-2 sticky bottom-0 bg-background py-4">
              <SheetClose asChild>
                <Button type="button" variant="secondary" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" className="w-full sm:w-auto">Save Template</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
