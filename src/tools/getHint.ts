
import { getAiClient } from "@/lib/ai_client";
import { Hint, isHint } from "@/types/hint";
import { Message } from "@/types/message";
import { ParsedAnswer, Solution } from "@/types/parsed-answer";
import { Models } from "@/config/models";
/**
 * @description compare input to solution and generate a hint
 * @param {ParsedAnswer} userAnswer - The user's input
 * @param {Solution} solution - The correct solution
 * @returns {Hint} - A hint based on the comparison
 */

const INCORRECT_REASONING_HINT_TYPE_EXPLANATION: Hint = {
    type: 'incorrect_reasoning',
    message: 'string describing the hint'
};

const NEXT_STEP_HINT_TYPE_EXPLANATION: Hint = {
    type: 'next_step',
    message: 'string describing the hint'
};

const CALCULATION_ERROR_HINT_TYPE_EXPLANATION: Hint = {
    type: 'calculation_error',
    message: 'string describing the hint'
};

const SYSTEM_PROMPT = `
    You are a math hint generator.
    Compare the student's answer to the correct solution and generate a hint to guide them towards the correct answer.
    Review the conversation history to avoid repeating hints already given.
    Each hint should move the student forward — if a previous hint didn't work, try a different angle.

    The hint should be specific to the student's current answer and should not give away the solution.
    Focus on the incorrect steps / the next step the student should take to move closer to the correct answer.

    First compare the student's reasoning steps to the solution's steps and identify where the student's answer deviates from the correct solution.
    1. If the student's reasoning is incorrect, generate a hint that explains the error in their reasoning and how to correct it without giving explicit answers. It should be in the format of a JSON object with the following structure:
    ${JSON.stringify(INCORRECT_REASONING_HINT_TYPE_EXPLANATION, null, 2)}

    2. If the student's reasoning is correct but they are missing a step, generate a hint that guides them towards the next step they should take. It should be in the format of a JSON object with the following structure:
    ${JSON.stringify(NEXT_STEP_HINT_TYPE_EXPLANATION, null, 2)}
    
    3. If the student's reasoning is correct but they have made a calculation error, generate a hint that points out the specific calculation error and how to fix it. It should be in the format of a JSON object with the following structure:
    ${JSON.stringify(CALCULATION_ERROR_HINT_TYPE_EXPLANATION, null, 2)}

    Always return the hint as a JSON object in one of the above formats, never return plain text.
`;


export const getHint = async (userAnswer: ParsedAnswer, solution: Solution, messages: Message[]): Promise<Hint> => {
    const client = getAiClient();

    const hintMessages: Message[] = [
        ...messages,
        {
            role: 'user',
            content: `Student's answer:
${JSON.stringify(userAnswer, null, 2)}

Correct solution:
${JSON.stringify(solution, null, 2)}`
        }
    ];

    const response = await client.messages.create({
        model: Models.hint,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: hintMessages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
        throw new Error('Unexpected response type from getHint');
    }

    const rawText = content.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(rawText);

    if (!isHint(parsed)) {
        throw new Error('Invalid hint format');
    }

    const hint: Hint = parsed;
    return hint;
}