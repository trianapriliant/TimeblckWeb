
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useGoals } from '@/hooks/goals-provider';
import { useHabits } from '@/hooks/habits-provider';
import { useToast } from '@/hooks/use-toast';
import type { Goal, Habit, HabitIconName } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(1, 'Goal name is required.'),
  timeframe: z.string().min(1, 'Timeframe is required.'),
  desireIndex: z.number().min(1).max(10),
  newHabits: z.array(z.object({
    title: z.string().min(1, 'Habit title is required.'),
  })).max(3, 'You can add a maximum of 3 new habits.'),
});

type FormValues = z.infer<typeof formSchema>;

interface AddEditGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
}

export function AddEditGoalSheet({ open, onOpenChange, goal }: AddEditGoalSheetProps) {
  const { addGoal, updateGoal } = useGoals();
  const { addHabit } = useHabits();
  const { toast } = useToast();
  const isEditMode = !!goal;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      timeframe: '',
      desireIndex: 5,
      newHabits: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "newHabits",
  });

  React.useEffect(() => {
    if (open) {
      if (goal) {
        // NOTE: Editing mode will not allow changing/adding habits for simplicity.
        // This can be expanded upon later.
        form.reset({
          name: goal.name,
          timeframe: goal.timeframe,
          desireIndex: goal.desireIndex,
          newHabits: [], // Reset new habits when opening
        });
      } else {
        form.reset({
          name: '',
          timeframe: '',
          desireIndex: 5,
          newHabits: [{ title: '' }], // Start with one habit field
        });
      }
    }
  }, [open, goal, form]);

  const onSubmit = async (data: FormValues) => {
    try {
        if (isEditMode) {
            // Handle Update
            if (!goal) return;
            updateGoal(goal.id, {
                name: data.name,
                timeframe: data.timeframe,
                desireIndex: data.desireIndex,
            });
            toast({ title: "Goal Updated", description: `"${data.name}" has been updated.`});

        } else {
            // Handle Create
            // Step 1: Create the Goal with empty habitIds to get its ID
            const newGoal = addGoal({
                name: data.name,
                timeframe: data.timeframe,
                desireIndex: data.desireIndex,
                habitIds: [],
            });

            if (!newGoal) throw new Error("Failed to create goal.");

            // Step 2: Create the supporting habits, linking them to the new goal's ID
            const createdHabits = data.newHabits.map(habitData => 
                addHabit({
                    title: habitData.title,
                    description: `Supporting goal: ${newGoal.name}`,
                    goalId: newGoal.id,
                    // Assign default values for new habits
                    icon: 'Target' as HabitIconName,
                    color: 'slate',
                    pillar: 'Body'
                })
            );

            const newHabitIds = createdHabits.map(h => h.id);

            // Step 3: Update the Goal with the new habit IDs
            updateGoal(newGoal.id, { habitIds: newHabitIds });
            
            toast({ title: "Goal Created!", description: `"${newGoal.name}" is ready to be tracked.` });
        }
        
        onOpenChange(false);
    } catch (error) {
        console.error("Failed to save goal:", error);
        toast({ title: "Error", description: "Could not save the goal. Please try again.", variant: 'destructive'});
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEditMode ? 'Edit Goal' : 'Add New Goal'}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 px-1 flex-1 overflow-y-auto">
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
              name="timeframe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timeframe</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., In 3 months" {...field} />
                  </FormControl>
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
                <div className="space-y-4 rounded-lg border p-4">
                    <FormLabel>Supporting Habits</FormLabel>
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
                    {fields.length < 3 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ title: '' })}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Habit
                        </Button>
                    )}
                    {form.formState.errors.newHabits?.root && (
                       <p className="text-sm font-medium text-destructive">{form.formState.errors.newHabits.root.message}</p>
                    )}
                </div>
            )}
            
            <SheetFooter className="!mt-8 flex-col-reverse sm:flex-row gap-2 sticky bottom-0 bg-background py-4">
              <SheetClose asChild>
                <Button type="button" variant="secondary" className="w-full sm:w-auto">
                  Cancel
                </Button>
              </SheetClose>
              <Button type="submit" className="w-full sm:w-auto">Save Goal</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
