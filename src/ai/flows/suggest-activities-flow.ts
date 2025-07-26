
'use server';

/**
 * @fileOverview An AI flow to suggest activities for empty time slots.
 *
 * - suggestActivities - A function that suggests activities based on user data.
 */

import { ai } from '@/ai/genkit';
import {
  SuggestActivitiesInputSchema,
  type SuggestActivitiesInput,
  SuggestActivitiesOutputSchema,
  type SuggestActivitiesOutput,
} from '@/ai/schemas/suggestions';

// Main exported function to be called from the UI
export async function suggestActivities(input: SuggestActivitiesInput): Promise<SuggestActivitiesOutput> {
  return suggestActivitiesFlow(input);
}

// Define the Genkit prompt
const suggestActivitiesPrompt = ai.definePrompt({
  name: 'suggestActivitiesPrompt',
  input: { schema: SuggestActivitiesInputSchema },
  output: { schema: SuggestActivitiesOutputSchema },
  prompt: `
    You are a world-class productivity coach. Your goal is to help the user fill their empty time slots with meaningful activities that align with their habits and goals.

    Analyze the user's current schedule for the date: {{{date}}}.
    Identify the empty time slots. A day has 144 slots (0-143), each representing 10 minutes.

    Here is the user's existing schedule for today:
    {{#if schedule.length}}
      {{#each schedule}}
      - {{title}} (starts at slot {{startTime}}, lasts for {{duration}} slots)
      {{/each}}
    {{else}}
      The user has a completely open schedule today!
    {{/if}}

    Here are the user's defined habits:
    {{#each habits}}
    - {{title}} (supports the {{pillar}} pillar)
    {{/each}}

    And here are their long-term goals:
    {{#each goals}}
    - Goal: {{name}} (supported by habits: {{#each supportingHabitTitles}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}})
    {{/each}}

    Based on all this information, generate 2 to 4 diverse and actionable suggestions to fill the empty time slots.
    - Prioritize suggestions that help the user make progress on their goals.
    - Also suggest habits they might want to complete today.
    - Be smart about timing. Suggest 'Deep Work' in the morning or early afternoon, and 'Reading' or 'Relaxing' in the evening.
    - Keep durations reasonable, typically between 30 minutes (3 slots) and 2 hours (12 slots).
    - Provide a short, motivating reason for each suggestion.
    - Pick a color from the available options that semantically fits the activity.

    Generate the response in the required JSON format.
  `,
});

// Define the Genkit flow
const suggestActivitiesFlow = ai.defineFlow(
  {
    name: 'suggestActivitiesFlow',
    inputSchema: SuggestActivitiesInputSchema,
    outputSchema: SuggestActivitiesOutputSchema,
  },
  async (input) => {
    const { output } = await suggestActivitiesPrompt(input);
    return output!;
  }
);
