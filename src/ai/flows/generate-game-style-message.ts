'use server';

/**
 * @fileOverview A flow to generate game-style messages for user interactions.
 *
 * - generateGameStyleMessage - A function that generates a game-style message based on the event.
 * - GameStyleMessageInput - The input type for the generateGameStyleMessage function.
 * - GameStyleMessageOutput - The return type for the generateGameStyleMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GameStyleMessageInputSchema = z.object({
  username: z.string().describe('The username of the player.'),
  event: z.string().describe('The event that occurred, e.g., login, logout, level up.'),
});
export type GameStyleMessageInput = z.infer<typeof GameStyleMessageInputSchema>;

const GameStyleMessageOutputSchema = z.object({
  message: z.string().describe('The game-style message generated for the event.'),
});
export type GameStyleMessageOutput = z.infer<typeof GameStyleMessageOutputSchema>;

export async function generateGameStyleMessage(input: GameStyleMessageInput): Promise<GameStyleMessageOutput> {
  return generateGameStyleMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gameStyleMessagePrompt',
  input: {schema: GameStyleMessageInputSchema},
  output: {schema: GameStyleMessageOutputSchema},
  prompt: `You are a retro video game announcer. Generate a short, catchy message in the style of an old-school arcade game for the following event for player {{username}}:\n\nEvent: {{event}}\n\nMessage:`, 
});

const generateGameStyleMessageFlow = ai.defineFlow(
  {
    name: 'generateGameStyleMessageFlow',
    inputSchema: GameStyleMessageInputSchema,
    outputSchema: GameStyleMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
