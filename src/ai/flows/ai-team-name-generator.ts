'use server';
/**
 * @fileOverview A Genkit flow for generating creative and thematic team names for basketball teams.
 *
 * - generateAiTeamName - A function that handles the AI team name generation process.
 * - AiTeamNameGeneratorInput - The input type for the generateAiTeamName function.
 * - AiTeamNameGeneratorOutput - The return type for the generateAiTeamName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiTeamNameGeneratorInputSchema = z.object({
  playerNames: z
    .array(z.string())
    .describe('A list of player names on the team, which can inspire team names.'),
  theme: z
    .string()
    .optional()
    .describe('An optional theme or style for the team names (e.g., "fast-paced", "defensive", "animal-themed").'),
});
export type AiTeamNameGeneratorInput = z.infer<typeof AiTeamNameGeneratorInputSchema>;

const AiTeamNameGeneratorOutputSchema = z.object({
  suggestedNames: z
    .array(z.string())
    .describe('A list of creative and thematic team names suggested by the AI.'),
});
export type AiTeamNameGeneratorOutput = z.infer<typeof AiTeamNameGeneratorOutputSchema>;

export async function generateAiTeamName(
  input: AiTeamNameGeneratorInput
): Promise<AiTeamNameGeneratorOutput> {
  return aiTeamNameGeneratorFlow(input);
}

const aiTeamNameGeneratorPrompt = ai.definePrompt({
  name: 'aiTeamNameGeneratorPrompt',
  input: {schema: AiTeamNameGeneratorInputSchema},
  output: {schema: AiTeamNameGeneratorOutputSchema},
  prompt: `You are a creative assistant specializing in generating fun and thematic basketball team names.
  
  Based on the following information, suggest 5 unique and engaging team names.
  The names should be creative and suitable for a casual pickup basketball league.
  
  {{#if playerNames.length}}
  Consider these players: {{playerNames}}
  {{/if}}
  
  {{#if theme}}
  The team has a specific theme or style: {{{theme}}}
  {{/if}}
  
  Provide the output as a JSON object with a single field 'suggestedNames' which is an array of strings.
  Example: { "suggestedNames": ["The Court Conquerors", "Hoop Hounds", "Downtown Destroyers", "Slam Dunk Squad", "Net Dominators"] }`,
});

const aiTeamNameGeneratorFlow = ai.defineFlow(
  {
    name: 'aiTeamNameGeneratorFlow',
    inputSchema: AiTeamNameGeneratorInputSchema,
    outputSchema: AiTeamNameGeneratorOutputSchema,
  },
  async input => {
    const {output} = await aiTeamNameGeneratorPrompt(input);
    if (!output) {
      throw new Error('AI failed to generate team names.');
    }
    return output;
  }
);
