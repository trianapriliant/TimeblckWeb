
'use client';

import * as React from 'react';
import { MoreVertical, Pen, Plus, Trash2, CalendarClock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/hooks/use-translations';
import { useGoals } from '@/hooks/goals-provider';
import { useHabits } from '@/hooks/habits-provider';
import { AddEditGoalSheet } from '@/components/goals/add-edit-goal-sheet';
import type { Goal, Habit } from '@/lib/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { useAppSettings } from '@/hooks/app-settings-provider';
import { PremiumOfferDialog } from '@/components/shared/premium-offer-dialog';
import { usePageActions } from '@/hooks/page-actions-provider';
import { differenceInDays, formatDistanceToNowStrict, startOfToday } from 'date-fns';
import { cn } from '@/lib/utils';

export default function GoalsPage() {
    const t = useTranslations();
    const { goals, deleteGoal } = useGoals();
    const { habits, deleteHabit, habitConsistencies } = useHabits();
    const { settings } = useAppSettings();
    const { setPageActions } = usePageActions();

    const [sheetOpen, setSheetOpen] = React.useState(false);
    const [selectedGoal, setSelectedGoal] = React.useState<Goal | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
    const [premiumDialogOpen, setPremiumDialogOpen] = React.useState(false);

    const GOAL_LIMIT = 3;
    const isGoalLimitReached = !settings.isPremium && goals.length >= GOAL_LIMIT;

    const handleAddGoal = React.useCallback(() => {
        if (isGoalLimitReached) {
            setPremiumDialogOpen(true);
            return;
        }
        setSelectedGoal(null);
        setSheetOpen(true);
    }, [isGoalLimitReached]);

    React.useEffect(() => {
        const fabAction = {
            label: t.goals.add_button,
            action: handleAddGoal,
        };

        setPageActions({
            title: t.nav.goals,
            description: t.goals.description,
            fab: fabAction,
        });

        return () => setPageActions(null);
    }, [setPageActions, t, handleAddGoal]);


    const handleEditGoal = (goal: Goal) => {
        setSelectedGoal(goal);
        setSheetOpen(true);
    };
    
    const goalToDelete = goals.find(g => g.id === confirmDeleteId);
    
    const handleDeleteConfirm = () => {
        if (!goalToDelete) return;

        // Delete associated habits first
        goalToDelete.habitIds.forEach(habitId => {
            deleteHabit(habitId);
        });

        // Then delete the goal
        deleteGoal(goalToDelete.id);
        setConfirmDeleteId(null);
    };

    const Countdown = ({ targetDate }: { targetDate: string }) => {
        const date = new Date(targetDate);
        const daysLeft = differenceInDays(date, startOfToday());
        
        if (daysLeft < 0) {
            return (
                <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Time's up!</span>
                </div>
            );
        }

        const distance = formatDistanceToNowStrict(date, { unit: 'day', roundingMethod: 'ceil' });

        return (
            <div className={cn(
                "flex items-center gap-1.5 text-xs",
                daysLeft <= 7 ? 'text-destructive font-semibold' : 'text-muted-foreground'
            )}>
                <CalendarClock className="h-3 w-3" />
                <span>{distance} left</span>
            </div>
        )
    };

    return (
        <div className="container mx-auto p-4 md:p-6">
            <div className="space-y-4">
                 {goals.length === 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                <h3 className="text-lg font-medium">{t.goals.empty_title}</h3>
                                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                                   {t.goals.empty_description}
                                </p>
                                <Button onClick={handleAddGoal} className="mt-4">
                                    <Plus className="mr-2 h-4 w-4" /> {t.goals.add_button}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {goals.map((goal) => {
                    const supportingHabits = goal.habitIds
                        .map(id => habits.find(h => h.id === id))
                        .filter((h): h is Habit => !!h);
                    
                    const totalConsistency = supportingHabits.reduce((acc, habit) => {
                        return acc + (habitConsistencies.get(habit.id) || 0);
                    }, 0);

                    const progress = supportingHabits.length > 0
                        ? totalConsistency / supportingHabits.length
                        : 0;

                    return (
                        <Card key={goal.id}>
                             <CardHeader className="relative">
                                <CardTitle>{goal.name}</CardTitle>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span>{t.goals.desire_index}: {goal.desireIndex}/10</span>
                                    {goal.targetDate && <Countdown targetDate={goal.targetDate} />}
                                </div>

                                 <div className="absolute top-4 right-4">
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                         <DropdownMenuItem onClick={() => handleEditGoal(goal)}>
                                          <Pen className="mr-2 h-4 w-4" />
                                          <span>{t.common.edit}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setConfirmDeleteId(goal.id)} className="text-destructive">
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          <span>{t.common.delete}</span>
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                 </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium text-sm text-muted-foreground">{t.goals.progress}</h4>
                                        <span className="font-semibold text-sm">{Math.round(progress)}%</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm mb-2">{t.goals.supporting_habits}:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {supportingHabits.length > 0 ? supportingHabits.map((habit) => (
                                            <Badge key={habit.id} variant="secondary">{habit.title}</Badge>
                                        )) : (
                                            <p className="text-xs text-muted-foreground">No habits linked yet.</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            <AddEditGoalSheet 
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                goal={selectedGoal}
            />
            <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.common.are_you_sure}</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the goal "{goalToDelete?.name}" and all of its supporting habits. This action cannot be undone.
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
                description={t.premium_gate.goal_limit_description}
            />
        </div>
    );
}
