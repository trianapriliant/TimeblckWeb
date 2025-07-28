
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useHabits } from '@/hooks/use-habits';
import { cn } from '@/lib/utils';
import { BLOCK_COLORS, pillarNames, type Habit, type BlockColor, type HabitIconName, type Pillar } from '@/lib/types';
import { habitIconNames, Icon } from '@/components/shared/icon-map';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { getContrastingTextColor } from '@/lib/utils';
import { PremiumOfferDialog } from '@/components/shared/premium-offer-dialog';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const [premiumDialogOpen, setPremiumDialogOpen] = React.useState(false);
  const isMobile = useIsMobile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      color: 'lime',
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
          color: 'lime',
          icon: habitIconNames[0],
          pillar: 'Body',
        });
      }
    }
  }, [open, habit, form]);

  const onSubmit = (data: FormValues) => {
    const habitData: Omit<Habit, 'id'> = {
      title: data.title,
      description: data.description || '',
      color: data.color as BlockColor,
      icon: data.icon as HabitIconName,
      pillar: data.pillar as Pillar,
    };

    if (habit?.goalId) {
      habitData.goalId = habit.goalId;
    }
    
    if (habit) {
      updateHabit(habit.id, habitData);
    } else {
      addHabit(habitData);
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
                    {habitIconNames.map((iconName, index) => {
                      const isPremiumIcon = index >= 30;
                      const canUseIcon = settings.isPremium || !isPremiumIcon;

                      return (
                        <button
                          type="button"
                          key={iconName}
                          onClick={() => {
                            if (canUseIcon) {
                              field.onChange(iconName);
                            } else {
                              setPremiumDialogOpen(true);
                            }
                          }}
                          className={cn(
                            'relative h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all bg-accent/50',
                            field.value === iconName ? 'border-primary' : 'border-transparent',
                            !canUseIcon && 'cursor-pointer'
                          )}
                          aria-label={`Select ${iconName} icon`}
                        >
                          <Icon name={iconName} className={cn('h-5 w-5', field.value === iconName ? 'text-primary' : 'text-muted-foreground', !canUseIcon && 'opacity-50')} />
                          {!canUseIcon && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px] rounded-full">
                              <Lock className="h-4 w-4 text-foreground/80" />
                            </div>
                          )}
                        </button>
                      );
                    })}
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
      </form>
    </Form>
  );

  const footer = (
    <DialogFooter className="!mt-8 flex-col-reverse sm:flex-row gap-2 pt-4 border-t">
        <DialogClose asChild>
          <Button type="button" variant="secondary" className="w-full sm:w-auto">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" onClick={form.handleSubmit(onSubmit)} className="w-full sm:w-auto">Save Habit</Button>
      </DialogFooter>
  );

  if (isMobile === undefined) return null;

  return (
    <>
      {isMobile ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side="bottom" className="rounded-t-lg">
              <SheetHeader className="text-left">
                <SheetTitle>{habit ? 'Edit Habit' : 'Add Habit'}</SheetTitle>
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
                <DialogTitle>{habit ? 'Edit Habit' : 'Add Habit'}</DialogTitle>
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
