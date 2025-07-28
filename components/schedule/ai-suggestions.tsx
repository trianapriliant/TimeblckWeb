
'use client';

import * as React from 'react';
import { Bot, Sparkles, Loader2, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimeBlocks } from '@/hooks/time-blocks-provider';
import { useHabits } from '@/hooks/habits-provider';
import { useGoals } from '@/hooks/goals-provider';
import { suggestActivities, type SuggestActivitiesOutput } from '@/ai/flows/suggest-activities-flow';
import { format } from 'date-fns';
import { type BlockColor, type ScheduleBlock } from '@/lib/types';
import { BLOCK_COLORS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';

interface AiSuggestionsProps {
  schedules: Map<string, Map<number, ScheduleBlock>>;
  onApplySuggestion: (suggestion: { dateKey: string; startTime: number; duration: number, title: string, color: BlockColor }) => void;
}

export function AiSuggestions({ schedules, onApplySuggestion }: AiSuggestionsProps) {
  const { isLoaded: blocksLoaded } = useTimeBlocks();
  const { habits, isLoaded: habitsLoaded } = useHabits();
  const { goals, isLoaded: goalsLoaded } = useGoals();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<SuggestActivitiesOutput['suggestions']>([]);
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [hasGenerated, setHasGenerated] = React.useState(false);

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setSuggestions([]);
    setHasGenerated(true);

    const today = new Date();
    const dateKey = format(today, 'yyyy-MM-dd');
    const scheduleForToday = schedules.get(dateKey);

    const simplifiedSchedule = scheduleForToday
      ? Array.from(scheduleForToday.values())
          .filter((block, index, self) => self.findIndex(b => b.id === block.id) === index)
          .map(block => ({
            title: block.title,
            startTime: block.startTime,
            duration: block.duration,
          }))
      : [];

    const simplifiedHabits = habits.map(h => ({ title: h.title, pillar: h.pillar }));
    
    const simplifiedGoals = goals.map(g => ({
        name: g.name,
        supportingHabitTitles: g.habitIds.map(id => habits.find(h => h.id === id)?.title || '').filter(Boolean)
    }));
    
    try {
      const result = await suggestActivities({
        date: dateKey,
        schedule: simplifiedSchedule,
        habits: simplifiedHabits,
        goals: simplifiedGoals,
      });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error('AI Suggestion Error:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not generate suggestions. Please try again later.',
      });
      setPopoverOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const allDataLoaded = blocksLoaded && habitsLoaded && goalsLoaded;

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6 md:right-6">
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
           <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 20 }}
            >
              <Button
                size="icon"
                className="w-14 h-14 rounded-2xl shadow-lg"
                aria-label="Open AI Assistant"
              >
                <Bot className="h-7 w-7" />
              </Button>
            </motion.div>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 md:w-96 p-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-semibold flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Assistant
                </h4>
                <p className="text-sm text-muted-foreground">
                  Let AI suggest activities for your empty slots today.
                </p>
              </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={hasGenerated ? 'results' : 'initial'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {!hasGenerated ? (
                   <Button onClick={handleGetSuggestions} disabled={isLoading || !allDataLoaded} className="w-full">
                      {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                      )}
                      Get Suggestions
                  </Button>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                    {isLoading && (
                       <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {!isLoading && suggestions.length > 0 && (
                       suggestions.map((s, i) => (
                          <Card key={i} className="bg-background/50">
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <div className={cn("mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0", BLOCK_COLORS[s.color]?.solid)} />
                                <div className="flex-1">
                                  <p className="font-semibold text-sm">{s.title}</p>
                                  <p className="text-xs text-muted-foreground">{s.reasoning}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="flex-shrink-0 h-8"
                                  onClick={() => {
                                    onApplySuggestion({ 
                                        dateKey: format(new Date(), 'yyyy-MM-dd'), 
                                        startTime: s.startTime,
                                        duration: s.duration,
                                        title: s.title,
                                        color: s.color,
                                    });
                                    setPopoverOpen(false);
                                  }}
                                >
                                  <Play className="mr-2 h-4 w-4" />
                                  Add
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                       ))
                    )}
                    {!isLoading && suggestions.length === 0 && (
                      <div className="text-center text-sm text-muted-foreground p-8">
                        <p>No suggestions available. Your schedule might be full!</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
