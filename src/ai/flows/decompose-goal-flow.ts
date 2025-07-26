
'use server';

/**
 * @fileOverview An AI flow to decompose a high-level goal into actionable habits.
 *
 * - decomposeGoal - A function that suggests habits for a given goal.
 */

import { ai } from '@/ai/genkit';
import {
  DecomposeGoalInputSchema,
  type DecomposeGoalInput,
  DecomposeGoalOutputSchema,
  type DecomposeGoalOutput,
} from '@/ai/schemas/goal-decomposition';
import { BLOCK_COLORS, pillarNames } from '@/lib/types';
import { habitIconNames } from '@/components/shared/icon-map';


// Main exported function to be called from the UI
export async function decomposeGoal(input: DecomposeGoalInput): Promise<DecomposeGoalOutput> {
  return decomposeGoalFlow(input);
}

// Define the Genkit prompt
const decomposeGoalPrompt = ai.definePrompt({
  name: 'decomposeGoalPrompt',
  input: { schema: DecomposeGoalInputSchema },
  output: { schema: DecomposeGoalOutputSchema },
  prompt: `
    You are a world-class productivity and life coach. Your task is to break down a user's high-level goal into smaller, actionable, and measurable habits.

    The user's goal is: "{{goalName}}"
    Their desired timeframe is: "{{timeframe}}"

    Based on this, generate 2 to 4 specific habits that will directly contribute to achieving this goal.

    For each habit, you must provide:
    1.  A clear, concise 'title' for the habit (e.g., "Practice Spanish vocabulary").
    2.  A 'pillar' it belongs to from this list: ${pillarNames.join(', ')}. Choose the most relevant one.
    3.  An 'icon' from this list that best represents the habit: ${habitIconNames.join(', ')}.
    4.  A 'color' from this list that semantically fits the habit: ${Object.keys(BLOCK_COLORS).join(', ')}.
    5.  A 'suggestedSchedule' as a short, human-readable string (e.g., "15 minutes daily", "1 hour, 3 times a week", "2 hours on weekends").

    Example for goal "Run a 10k in 3 months":
    - title: "Interval Training Run"
    - pillar: "Body"
    - icon: "Dumbbell"
    - color: "red"
    - suggestedSchedule: "30 minutes, 2 times a week"

    Analyze the user's goal and timeframe to create relevant and achievable habits. Be creative and practical.
    Generate the response in the required JSON format.
  `,
});

// Define the Genkit flow
const decomposeGoalFlow = ai.defineFlow(
  {
    name: 'decomposeGoalFlow',
    inputSchema: DecomposeGoalInputSchema,
    outputSchema: DecomposeGoalOutputSchema,
  },
  async (input) => {
    const { output } = await decomposeGoalPrompt(input);
    return output!;
  }
);
