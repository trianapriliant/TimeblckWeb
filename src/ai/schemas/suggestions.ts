/**
 * @fileOverview Schemas and types for the suggestActivities AI flow.
 */

import { z } from 'zod';
import { BLOCK_COLORS } from '@/lib/types';

// Define the schema for a single simplified time block for the prompt
const SimplifiedBlockSchema = z.object({
  title: z.string(),
  startTime: z.number(), // Slot index
  duration: z.number(), // In slots
});

// Define the schema for a single habit for the prompt
const SimplifiedHabitSchema = z.object({
  title: z.string(),
  pillar: z.string(),
});

// Define the schema for a single goal for the prompt
const SimplifiedGoalSchema = z.object({
  name: z.string(),
  supportingHabitTitles: z.array(z.string()),
});

// Define the input schema for the flow
export const SuggestActivitiesInputSchema = z.object({
  date: z.string().describe('The target date for suggestions, in yyyy-MM-dd format.'),
  schedule: z.array(SimplifiedBlockSchema).describe('The list of already scheduled blocks for the target date.'),
  habits: z.array(SimplifiedHabitSchema).describe('The list of all user habits.'),
  goals: z.array(SimplifiedGoalSchema).describe('The list of all user goals.'),
});
export type SuggestActivitiesInput = z.infer<typeof SuggestActivitiesInputSchema>;

// Define the output schema for a single suggestion
const SuggestionSchema = z.object({
  title: z.string().describe('The suggested activity title.'),
  startTime: z.number().describe('The suggested start time as a slot index (0-143).'),
  duration: z.number().describe('The suggested duration in 10-minute slots.'),
  color: z.enum(Object.keys(BLOCK_COLORS) as [string, ...string[]]).describe('A suitable color from the available options.'),
  reasoning: z.string().describe('A brief, compelling reason why this activity is being suggested.'),
});

// Define the output schema for the flow
export const SuggestActivitiesOutputSchema = z.object({
  suggestions: z.array(SuggestionSchema).describe('A list of 2-4 suggested activities.'),
});
export type SuggestActivitiesOutput = z.infer<typeof SuggestActivitiesOutputSchema>;
