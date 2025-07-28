
/**
 * @fileOverview Schemas and types for the decomposeGoal AI flow.
 */

import { z } from 'zod';
import { BLOCK_COLORS, pillarNames } from '@/lib/types';
import { habitIconNames } from '@/components/shared/icon-map';

// Define the input schema for the flow
export const DecomposeGoalInputSchema = z.object({
  goalName: z.string().describe('The high-level goal the user wants to achieve.'),
  timeframe: z.string().describe('The timeframe the user has set for this goal.'),
});
export type DecomposeGoalInput = z.infer<typeof DecomposeGoalInputSchema>;


// Define the output schema for a single suggested habit
const SuggestedHabitSchema = z.object({
  title: z.string().describe('A clear, concise title for the habit.'),
  pillar: z.enum(pillarNames).describe('The self-improvement pillar this habit belongs to.'),
  icon: z.enum(habitIconNames).describe('An appropriate icon name from the available list.'),
  color: z.enum(Object.keys(BLOCK_COLORS) as [string, ...string[]]).describe('A suitable color from the available options.'),
  suggestedSchedule: z.string().describe('A recommended schedule for the habit (e.g., "15 minutes daily", "1 hour, 3 times a week").'),
});

// Define the output schema for the flow
export const DecomposeGoalOutputSchema = z.object({
  habits: z.array(SuggestedHabitSchema).describe('A list of 2-4 suggested habits to support the goal.'),
});
export type DecomposeGoalOutput = z.infer<typeof DecomposeGoalOutputSchema>;

// Add a type for a single habit for convenience
export type SuggestedHabit = z.infer<typeof SuggestedHabitSchema>;
