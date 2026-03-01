import Anthropic from '@anthropic-ai/sdk';
import { ParsedAnswer } from '@/types/parsed-answer';
import { Message } from '@/types/message';
import { Models } from '@/config/models';
import { parseAnswer } from './parseAnswer';
import { isParsingError } from '@/types/parsed-answer';
import { checkCalculation } from './checkCalculation';
import { getAiClient } from '@/lib/ai_client';

const SYSTEM_PROMPT = `
You are a math tutor solving a problem step by step.
Solve the given problem showing every reasoning step clearly in natural language.
Show each calculation explicitly, e.g. "8000 × 0.8 = 6400".
Do not skip steps. Do not explain what you are doing meta-level — just solve it.
`;

const RECALCULATE_PROMPT = `
    The previous solution had some calculation errors. Please fix the calculations while keeping the same reasoning steps and natural language explanations.
`;

const MAX_RETRIES = 3;

/**
 * Generates a reference solution for a given problem.
 * Returns a ParsedAnswer representing the correct solution,
 * which can be used by getHint to compare against student's answer.
 */
export const solveProblem = async (problem: string): Promise<ParsedAnswer> => {
  const client = getAiClient();
  const messages: Message[] = [
    {
      role: 'user',
      content: problem,
    }
  ];

  for (let i = 0; i < MAX_RETRIES; i++) {
    const response = await client.messages.create({
        model: Models.chat, // use full model — reasoning quality matters here
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
        throw new Error('Unexpected response type from solveProblem');
    }

    // feed AI solution back through parseAnswer to get structured ParsedAnswer
    messages.push({ role: 'assistant', content: content.text });

    const parsed = await parseAnswer(messages);

    if (isParsingError(parsed)) {
        throw new Error(`solveProblem failed to parse solution: ${parsed.error}`);
    }

    const parsedAnswerWithCalculationCheck = checkCalculation(parsed);
    const incorrectCalculations = parsedAnswerWithCalculationCheck.steps.filter(step => step.isMatching === false);
    if( incorrectCalculations.length === 0) {
        return parsedAnswerWithCalculationCheck;
    } else {
        // If calculations don't check out, add a system message to try to fix the solution and retry
        messages.push({
            role: 'user',
            content: `${RECALCULATE_PROMPT}
                Incorrect calculations found:
                ${incorrectCalculations.map(step => `- Reasoning: ${step.naturalLanguage}\n  Expression: ${step.mathjsExpression}\n  Expected Result: ${step.naturalLanguageResult}\n  Actual Result: ${step.mathjsResult}`).join('\n')}
            `
        });
    }

  }

  throw new Error('solveProblem failed after maximum retries');
};