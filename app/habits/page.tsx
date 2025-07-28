
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { MoreVertical, Pen, Plus, Trash2, Target } from 'lucide-react';

import { useHabits } from '@/hooks/use-habits';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HabitGrid } from '@/components/habits/habit-grid';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/shared/icon-map';
import { type Habit } from '@/lib/types';
import { AddEditHabitSheet } from '@/components/habits/add-edit-habit-sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useTranslations } from '@/hooks/use-translations';
import { useGoals } from '@/hooks/goals-provider';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { PremiumOfferDialog } from '@/components/shared/premium-offer-dialog';
import { usePageActions } from '@/hooks/page-actions-provider';
import { LevelledCheckinButton } from '@/components/habits/levelled-checkin-button';

export default function HabitsPage() {
  const t = useTranslations();
  const { habits, habitData, handleCheckIn, getHabitDataForGrid, deleteHabit } = useHabits();
  const { goals } = useGoals();
  const { settings } = useAppSettings();
  const { setPageActions } = usePageActions();

  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [selectedHabit, setSelectedHabit] = React.useState<Habit | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [premiumDialogOpen, setPremiumDialogOpen] = React.useState(false);

  const HABIT_LIMIT = 5;
  const isHabitLimitReached = !settings.isPremium && habits.length >= HABIT_LIMIT;

  const handleAddHabit = React.useCallback(() => {
    if (isHabitLimitReached) {
      setPremiumDialogOpen(true);
      return;
    }
    setSelectedHabit(null);
    setSheetOpen(true);
  }, [isHabitLimitReached]);

  React.useEffect(() => {
    const fabAction = {
      label: t.habits.add_button,
      action: handleAddHabit
    };

    setPageActions({
      title: t.nav.habits,
      fab: fabAction
    });

    return () => setPageActions(null);
  }, [setPageActions, t, handleAddHabit]);


  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
    setSheetOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (confirmDeleteId) {
      deleteHabit(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  const habitToDelete = habits.find(h => h.id === confirmDeleteId);

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 md:p-6">
        <div className="space-y-4">
          {habits.length === 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <h3 className="text-lg font-medium">{t.habits.empty_title}</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    {t.habits.empty_description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {habits.map((habit) => {
            const todayString = format(new Date(), 'yyyy-MM-dd');
            const key = `${habit.id}__${todayString}`;
            const todaysIntensity = habitData.get(key) || 0;
            
            const parentGoal = habit.goalId ? goals.find(g => g.id === habit.goalId) : null;

            return (
              <Card key={habit.id}>
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="p-2 bg-accent rounded-lg">
                        <Icon name={habit.icon} className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg break-words">{habit.title}</CardTitle>
                        <CardDescription className="break-words">{habit.description}</CardDescription>
                        {parentGoal && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 border-t pt-2">
                            <Target className="h-3 w-3 shrink-0" />
                            <span className="italic">{t.habits.supports_goal}: "{parentGoal.name}"</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 self-end sm:self-start flex-shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                           <LevelledCheckinButton
                              intensity={todaysIntensity}
                              color={habit.color}
                              onClick={() => handleCheckIn(habit.id)}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                          {todaysIntensity ? (
                            <p>{t.habits.tooltip_checked_in(todaysIntensity)}</p>
                          ) : (
                            <p>{t.habits.tooltip_check_in}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditHabit(habit)}>
                            <Pen className="mr-2 h-4 w-4" />
                            <span>{t.common.edit}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setConfirmDeleteId(habit.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>{t.common.delete}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center overflow-x-auto py-2">
                    <HabitGrid color={habit.color} data={getHabitDataForGrid(habit.id)} highlightToday={false} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <AddEditHabitSheet 
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        habit={selectedHabit}
      />
      
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.common.are_you_sure}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.habits.delete_confirmation(habitToDelete?.title || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>{t.common.delete}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PremiumOfferDialog
        open={premiumDialogOpen}
        onOpenChange={setPremiumDialogOpen}
        title={t.premium_gate.limit_reached_title}
        description={t.premium_gate.habit_limit_description}
      />
    </TooltipProvider>
  );
}
