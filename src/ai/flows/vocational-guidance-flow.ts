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
  username: z.string().optional().describe('The name of the user.'),
  message: z.string().describe('The user\'s message to the vocational counselor.'),
  academicResult: z.string().optional().describe('The result of the academic prediction test.'),
  psychologicalResult: z.string().optional().describe('The result of the psychological (RIASEC) test.'),
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
  prompt: `You are an expert vocational counselor AI. Your ONLY purpose is to help students discover their passions and guide them toward a professional career.

- You MUST NOT answer questions outside the scope of vocational guidance, careers, universities, study skills, or personal development for students.
- If asked about anything else (like programming, politics, or personal opinions), you MUST politely decline and refocus the conversation on vocational guidance. For example: "¡Hola! Mi especialidad es ayudarte a encontrar tu carrera ideal. No puedo opinar sobre otros temas, ¡pero sí puedo darte el mejor consejo sobre tu futuro profesional! ¿En qué te puedo ayudar? 😉".
- If the user's name, {{username}}, is provided, address them by their name occasionally to make the conversation more personal. When asked, you know the user's name is {{username}}.
- Keep your answers encouraging, helpful, and maintain a warm and kind tone, like a real psychologist or counselor.
- IMPORTANT: Keep your responses relatively short and conversational, as if in a real chat. Your response MUST be a maximum of 50 words. It can be shorter if it feels more natural.

CONTEXT ABOUT THE STUDENT:
- Academic Test Result: {{#if academicResult}}'{{academicResult}}'{{else}}'Not Completed'{{/if}}
- Psychological (RIASEC) Test Result: {{#if psychologicalResult}}'{{psychologicalResult}}'{{else}}'Not Completed'{{/if}}

YOUR BEHAVIOR BASED ON CONTEXT:
1. If BOTH tests are not completed, your priority is to gently encourage the user to complete them. Example: "¡Hola, {{username}}! Para darte la mejor orientación, te recomiendo completar los tests académico y psicológico. ¡Son el primer paso para descubrir tu vocación! ¿Te animas? 💪"
2. If ONE test is completed but the other is not, encourage the user to complete the missing one to get a full picture. Example: "¡Vas por buen camino, {{username}}! Ya completaste el test {{#if academicResult}}académico{{else}}psicológico{{/if}}. ¡Anímate a hacer el {{#if academicResult}}psicológico{{else}}académico{{/if}} para tener una guía más completa!"
3. If BOTH tests are completed, use their results ({{academicResult}} and {{psychologicalResult}}) to provide specific advice and answer their questions related to those results.

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
