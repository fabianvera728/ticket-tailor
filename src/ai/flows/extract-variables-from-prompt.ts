'use server';

/**
 * @fileOverview Extracts variable placeholders from a given prompt string.
 *
 * - extractVariables - A function that extracts the variables from a prompt.
 * - ExtractVariablesInput - The input type for the extractVariables function.
 * - ExtractVariablesOutput - The return type for the extractVariables function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractVariablesInputSchema = z.object({
  prompt: z
    .string()
    .describe('The prompt string from which to extract variables.'),
});
export type ExtractVariablesInput = z.infer<typeof ExtractVariablesInputSchema>;

const ExtractVariablesOutputSchema = z.object({
  variables: z.array(z.string()).describe('The extracted variables from the prompt.'),
});
export type ExtractVariablesOutput = z.infer<typeof ExtractVariablesOutputSchema>;

export async function extractVariables(input: ExtractVariablesInput): Promise<ExtractVariablesOutput> {
  return extractVariablesFlow(input);
}

const extractVariablesPrompt = ai.definePrompt({
  name: 'extractVariablesPrompt',
  input: {schema: ExtractVariablesInputSchema},
  output: {schema: ExtractVariablesOutputSchema},
  prompt: `You are a variable extraction expert.

  Given the following prompt, extract all variable placeholders enclosed in double curly braces (e.g., {{VARIABLE_NAME}}). Return only the variable names without the curly braces in a JSON array.

  Prompt: {{{prompt}}}

  Example Output:
  [ "VARIABLE_NAME", "ANOTHER_VARIABLE" ]`,
});

const extractVariablesFlow = ai.defineFlow(
  {
    name: 'extractVariablesFlow',
    inputSchema: ExtractVariablesInputSchema,
    outputSchema: ExtractVariablesOutputSchema,
  },
  async input => {
    const {output} = await extractVariablesPrompt(input);
    return output!;
  }
);
