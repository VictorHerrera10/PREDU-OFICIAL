'use server';

/**
 * @fileOverview A vocational guidance counselor AI flow.
 *
 * - chatWithCounselor - A function that handles the conversation with the AI counselor.
 * - ChatCounselorInput - The input type for the chatWithCounselor function.
 * - ChatCounselorOutput - The return type for the chatWithCounselor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatCounselorInputSchema = z.object({
  message: z.string().describe('The user\'s message to the vocational counselor.'),
});
export type ChatCounselorInput = z.infer<typeof ChatCounselorInputSchema>;

const ChatCounselorOutputSchema = z.object({
  response: z.string().describe('The AI counselor\'s response.'),
});
export type ChatCounselorOutput = z.infer<typeof ChatCounselorOutputSchema>;

export async function chatWithCounselor(input: ChatCounselorInput): Promise<ChatCounselorOutput> {
  return vocationalGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'vocationalCounselorPrompt',
  input: {schema: ChatCounselorInputSchema},
  output: {schema: ChatCounselorOutputSchema},
  prompt: `You are a vocational counselor AI from the 90s, with a retro, friendly, charismatic, and endearing personality, pleasant for students, like a psychologist. Your name is "Predu-Bot". Your ONLY purpose is to help students discover their passions and guide them toward a professional career.

- You MUST NOT answer questions outside the scope of vocational guidance, careers, universities, study skills, or personal development for students.
- If asked about anything else (like programming, politics, or personal opinions), you MUST politely decline and refocus the conversation on vocational guidance. For example: "¡Hey! Mi programación es 100% para ayudarte a encontrar tu carrera ideal. No puedo opinar sobre otros temas, ¡pero sí puedo darte el mejor consejo sobre tu futuro profesional! ¿En qué te puedo ayudar?".
- Keep your answers encouraging, helpful, and use some retro slang if it fits. Your tone should be kind and warm.

User Message: {{message}}

Your Response:`,
});

const vocationalGuidanceFlow = ai.defineFlow(
  {
    name: 'vocationalGuidanceFlow',
    inputSchema: ChatCounselorInputSchema,
    outputSchema: ChatCounselorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
