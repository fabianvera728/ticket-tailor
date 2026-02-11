'use server';

/**
 * @fileOverview A flow that takes a prompt with variable placeholders, extracts the variables,
 * generates a form for the user to fill, and then generates a completed ticket.
 *
 * - generateTicketFromPrompt - A function that handles the ticket generation process.
 * - GenerateTicketFromPromptInput - The input type for the generateTicketFromPrompt function.
 * - GenerateTicketFromPromptOutput - The return type for the generateTicketFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTicketFromPromptInputSchema = z.object({
  prompt: z.string().describe('The prompt with variable placeholders.'),
  variableValues: z.record(z.string(), z.string()).optional().describe('The values for the variables in the prompt.'),
});
export type GenerateTicketFromPromptInput = z.infer<
  typeof GenerateTicketFromPromptInputSchema
>;

const GenerateTicketFromPromptOutputSchema = z.object({
  completedTicket: z.string().describe('The completed ticket with variables filled.'),
  variables: z.array(z.string()).describe('List of variables extracted from the prompt')
});
export type GenerateTicketFromPromptOutput = z.infer<
  typeof GenerateTicketFromPromptOutputSchema
>;

export async function generateTicketFromPrompt(
  input: GenerateTicketFromPromptInput
): Promise<GenerateTicketFromPromptOutput> {
  return generateTicketFromPromptFlow(input);
}

const extractVariables = (prompt: string): string[] => {
  const variableRegex = /{{(.*?)}}/g;
  const matches = [...prompt.matchAll(variableRegex)];
  return matches.map(match => match[1]);
};

const generateTicketFromPromptFlow = ai.defineFlow(
  {
    name: 'generateTicketFromPromptFlow',
    inputSchema: GenerateTicketFromPromptInputSchema,
    outputSchema: GenerateTicketFromPromptOutputSchema,
  },
  async input => {
    const variables = extractVariables(input.prompt);

    let completedTicket = input.prompt;
    if (input.variableValues) {
      for (const variable of variables) {
        const value = input.variableValues[variable];
        if (value !== undefined) {
          completedTicket = completedTicket.replace(
            new RegExp(`{{${variable}}}`, 'g'),
            value
          );
        }
      }
    }

    return {
      completedTicket: completedTicket,
      variables: variables,
    };
  }
);
