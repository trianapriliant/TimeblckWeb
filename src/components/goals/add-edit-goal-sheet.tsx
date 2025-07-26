
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Plus, Trash2, Sparkles, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { useGoals } from '@/hooks/goals-provider';
import { useHabits } from '@/hooks/habits-provider';
import { useToast } from '@/hooks/use-toast';
import type { Goal, HabitIconName } from '@/lib/types';
import { useTranslations } from '@/hooks/use-translations';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { decomposeGoal } from '@/ai/flows/decompose-goal-flow';
import type { SuggestedHabit } from '@/ai/schemas/goal-decomposition';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(1, 'Goal name is required.'),
  targetDate: z.date().optional(),
  desireIndex: z.number().min(1).max(10),
  newHabits: z.array(z.object({
    title: z.string().min(1, 'Habit title is required.'),
    icon: z.custom<HabitIconName>(),
    color: z.string(),
    pillar: z.string(),
    description: z.string(),
  })).max(5, 'You can add a maximum of 5 new habits.'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEditGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
}

export function AddEditGoalSheet({ open, onOpenChange, goal }: AddEditGoalSheetProps) {
  const t = useTranslations();
  const { settings } = useAppSettings();
  const { addGoal, updateGoal } = useGoals();
  const { habits, addHabit } = useHabits();
  const { toast } = useToast();
  const isEditMode = !!goal;
  const [isDecomposing, setIsDecomposing] = React.useState(false);
  const isMobile = useIsMobile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      targetDate: undefined,
      desireIndex: 5,
      newHabits: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "newHabits",
  });

  React.useEffect(() => {
    if (open) {
      if (goal) {
        form.reset({
          name: goal.name,
          targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
          desireIndex: goal.desireIndex,
          newHabits: [],
        });
      } else {
        form.reset({
          name: '',
          targetDate: undefined,
          desireIndex: 5,
          newHabits: [{ title: '', icon: 'Target', color: 'lime', pillar: 'Body', description: '' }],
        });
      }
    }
  }, [open, goal, form]);
  
  const handleDecomposeGoal = async () => {
    const goalName = form.getValues('name');
    if (!goalName) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please enter a goal name before using AI.',
      });
      return;
    }
    
    setIsDecomposing(true);
    try {
      // Note: Timeframe is no longer sent, but the AI prompt is flexible enough.
      const result = await decomposeGoal({ goalName, timeframe: "in the future" });
      const suggestedHabits = result.habits.map((habit: SuggestedHabit) => ({
        title: habit.title,
        icon: habit.icon,
        color: habit.color,
        pillar: habit.pillar,
        description: `Suggested schedule: ${habit.suggestedSchedule}`,
      }));
      
      replace(suggestedHabits);

    } catch (error) {
      console.error('Failed to decompose goal:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not generate habits. Please try again.',
      });
    } finally {
      setIsDecomposing(false);
    }
  };


  const onSubmit = async (data: FormValues) => {
    const HABIT_LIMIT = 5;
    if (!isEditMode && !settings.isPremium && (habits.length + data.newHabits.length) > HABIT_LIMIT) {
        toast({
            variant: "destructive",
            title: t.goals.habit_limit_toast_title,
            description: t.goals.habit_limit_toast_description,
        });
        return;
    }

    try {
        if (isEditMode) {
            if (!goal) return;
            updateGoal(goal.id, {
                name: data.name,
                targetDate: data.targetDate?.toISOString(),
                desireIndex: data.desireIndex,
            });
            toast({ title: "Goal Updated", description: `"${data.name}" has been updated.`});

        } else {
            const newGoal = addGoal({
                name: data.name,
                targetDate: data.targetDate?.toISOString(),
                desireIndex: data.desireIndex,
                habitIds: [],
            });

            if (!newGoal) throw new Error("Failed to create goal.");

            const createdHabits = data.newHabits.filter(h => h.title).map(habitData => 
                addHabit({
                    title: habitData.title,
                    description: habitData.description || `Supporting goal: ${newGoal.name}`,
                    goalId: newGoal.id,
                    icon: habitData.icon,
                    color: habitData.color,
                    pillar: habitData.pillar as any,
                })
            );

            const newHabitIds = createdHabits.map(h => h.id);

            updateGoal(newGoal.id, { habitIds: newHabitIds });
            
            toast({ title: "Goal Created!", description: `"${newGoal.name}" is ready to be tracked.` });
        }
        
        onOpenChange(false);
    } catch (error) {
        console.error("Failed to save goal:", error);
        toast({ title: "Error", description: "Could not save the goal. Please try again.", variant: 'destructive'});
    }
  };
  
  const watchedName = form.watch('name');
  const canDecompose = !!watchedName;

  const content = (
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 px-1 flex-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Goal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Run a 10K Marathon" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Target Date (Optional)</FormLabel>
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

            <Controller
                control={form.control}
                name="desireIndex"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Desire Index: {field.value}</FormLabel>
                        <FormControl>
                            <Slider
                                min={1}
                                max={10}
                                step={1}
                                value={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                            />
                        </FormControl>
                    </FormItem>
                )}
            />

            {!isEditMode && (
              <TooltipProvider>
                <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <FormLabel>Supporting Habits</FormLabel>
                        <FormDescription className="text-xs">Habits to help you reach your goal.</FormDescription>
                      </div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                              <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={handleDecomposeGoal}
                              disabled={!canDecompose || isDecomposing}
                              >
                              {isDecomposing ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                  <Sparkles className="h-4 w-4" />
                              )}
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Decompose with AI</p>
                          </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-start gap-2">
                              <FormField
                                control={form.control}
                                name={`newHabits.${index}.title`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormControl>
                                            <Input placeholder={`Habit ${index + 1}`} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="shrink-0 mt-1">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    </div>
                    {fields.length < 5 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ title: '', icon: 'Target', color: 'lime', pillar: 'Body', description: '' })}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Habit Manually
                        </Button>
                    )}
                    {form.formState.errors.newHabits?.root && (
                        <p className="text-sm font-medium text-destructive">{form.formState.errors.newHabits.root.message}</p>
                    )}
                </div>
              </TooltipProvider>
            )}
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
        <Button type="submit" onClick={form.handleSubmit(onSubmit)} className="w-full sm:w-auto">Save Goal</Button>
      </DialogFooter>
  );

  if (isMobile === undefined) return null;

  return (
    <>
      {isMobile ? (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-lg">
                <SheetHeader className="text-left">
                  <SheetTitle>{isEditMode ? 'Edit Goal' : 'Add New Goal'}</SheetTitle>
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
                  <DialogTitle>{isEditMode ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
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

    
