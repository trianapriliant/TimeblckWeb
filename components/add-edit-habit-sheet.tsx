
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Check, Lock, Palette } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useHabits } from '@/hooks/use-habits';
import { cn } from '@/lib/utils';
import { BLOCK_COLORS, pillarNames, type Habit, type BlockColor, type HabitIconName, type Pillar } from '@/lib/types';
import { habitIconNames, Icon } from '@/components/icon-map';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { getContrastingTextColor } from '@/lib/utils';


const formSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  description: z.string().optional(),
  color: z.string(),
  icon: z.string(),
  pillar: z.string().min(1, 'Please select a pillar.'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEditHabitSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: Habit | null;
}

export function AddEditHabitSheet({ open, onOpenChange, habit }: AddEditHabitSheetProps) {
  const { addHabit, updateHabit } = useHabits();
  const { settings } = useAppSettings();
  const colorInputRef = React.useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      color: 'purple',
      icon: habitIconNames[0],
      pillar: 'Body',
    },
  });

  React.useEffect(() => {
    if (open) {
      if (habit) {
        form.reset({
          title: habit.title,
          description: habit.description,
          color: habit.color,
          icon: habit.icon,
          pillar: habit.pillar,
        });
      } else {
        form.reset({
          title: '',
          description: '',
          color: 'purple',
          icon: habitIconNames[0],
          pillar: 'Body',
        });
      }
    }
  }, [open, habit, form]);

  const onSubmit = (data: FormValues) => {
    const habitData = {
      title: data.title,
      description: data.description || '',
      color: data.color as BlockColor,
      icon: data.icon as HabitIconName,
      pillar: data.pillar as Pillar,
    };
    
    if (habit) {
      updateHabit(habit.id, habitData);
    } else {
      addHabit(habitData);
    }

    onOpenChange(false);
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{habit ? 'Edit Habit' : 'Add Habit'}</SheetTitle>
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
                    <Input placeholder="e.g. Read for 30 minutes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Why is this habit important?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="pillar"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Pillar of Self-Improvement</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-2 gap-2"
                      >
                        {pillarNames.map((pillar) => (
                          <FormItem key={pillar} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={pillar} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {pillar}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-6 gap-2">
                        {habitIconNames.map((iconName) => (
                          <button
                            type="button"
                            key={iconName}
                            onClick={() => field.onChange(iconName)}
                            className={cn(
                              'h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all bg-accent/50',
                              field.value === iconName ? 'border-primary' : 'border-transparent'
                            )}
                            aria-label={`Select ${iconName} icon`}
                          >
                            <Icon name={iconName} className={cn('h-5 w-5', field.value === iconName ? 'text-primary' : 'text-muted-foreground')} />
                          </button>
                        ))}
                      </div>
                    </FormControl>
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
            
            <SheetFooter className="!mt-8 flex-col-reverse sm:flex-row gap-2 sticky bottom-0 bg-background py-4">
              <SheetClose asChild>
                <Button type="button" variant="secondary" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" className="w-full sm:w-auto">Save Habit</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
