
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bell, Check, Trash2, Palette, Lock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { BLOCK_COLORS, type TimeBlock, type BlockColor } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { getContrastingTextColor } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  color: z.string(),
  reminderLeadTime: z.number(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: TimeBlock | null;
  newBlockInfo: { startTime: number; duration: number } | null;
  onSave: (data: { title: string; color: BlockColor; reminderLeadTime: number }) => void;
  onDelete: () => void;
}

const reminderOptions = [
    { value: 0, label: 'No reminder' },
    { value: 5, label: '5 minutes before' },
    { value: 10, label: '10 minutes before' },
    { value: 15, label: '15 minutes before' },
];

export function AddEditSheet({ open, onOpenChange, block, newBlockInfo, onSave, onDelete }: AddEditSheetProps) {
  const { settings } = useAppSettings();
  const colorInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      color: 'slate',
      reminderLeadTime: 0,
    },
  });

  React.useEffect(() => {
    if (open) {
      form.reset(
        block
          ? {
              title: block.title,
              color: block.color,
              reminderLeadTime: (block as any).reminderLeadTime ?? ((block as any).reminder ? 5 : 0),
            }
          : {
              title: '',
              color: 'slate',
              reminderLeadTime: 0,
            }
      );
    }
  }, [open, block, form]);

  const onSubmit = (data: FormValues) => {
    onSave({ ...data, color: data.color as BlockColor });
  };

  const handleDelete = () => {
    if (block) {
      onDelete();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{block ? 'Edit Block' : 'Add Block'}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4">
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
            <SheetFooter className="!mt-12 flex-col-reverse sm:flex-row gap-2">
              {block && (
                <Button type="button" variant="destructive" onClick={handleDelete} className="w-full sm:w-auto mr-auto">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              )}
              <SheetClose asChild>
                <Button type="button" variant="secondary" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" className="w-full sm:w-auto">Save changes</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
