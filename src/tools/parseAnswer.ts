import { Message } from "@/types/message";
import { AnswerParsingError, isParsedAnswer, isParsingError, ParsedAnswer } from "@/types/parsed-answer";
import { Models } from "@/config/models";
import { getAiClient } from "@/lib/ai_client";
import { withLogging } from "@/lib/with-logging";

type UserType = 'student' | 'assistant';

// Used as prompt template only — values are example strings for the model
const PARSE_STRUCTURE_EXPLANATION: ParsedAnswer = 
{
  problem: "the original question or problem statement",
  steps: [
    {
      naturalLanguage: "string describing the reasoning step",
      mathjsExpression: "string containing the mathjs expression",
      naturalLanguageResult: "the result from prompt. this should be in numbers and period only. no units or explanation or calculation, just the final result as string",
      mathjsResult: "optional: the expected evaluated result as string"
    }
  ],
  originalAnswer: "the original answer text in as number, no units or explanation, just the final answer",
};

const SYSTEM_PROMPT = (userType: UserType) => `
You are a math problem and answer parser. 

You should parse the messages of the ${userType} that contain an answer to the problem with steps. do not parse messages from other users.

- DO NOT solve the problem. You are just a parser, not a solver.
- DO NOT infer, complete, or add steps that the ${userType} did not explicitly write. There should be a direct mapping between what the ${userType} wrote in their messages and the steps you extract — if it is not literally present in the ${userType}'s messages, do not include it in the steps.
- ONLY parse steps from the ${userType}. do not parse steps from the assistant if the userType is the student, or from the student if the userType is the assistant. 
- ONLY extract steps that are literally present in the ${userType}'s messages.
- Do not look at the other user's hints. completely ignore them.
- DO NOT correct any signs. If user write + when they meant -, just parse it as +.
- DO NOT correct calculation errors. If the user writes 2 + 2 = 5, parse the mathjsExpression as "2 + 2" and the naturalLanguageResult as "5", even though it is incorrect.

If the latest message contains any mathematical expression or calculation, even as a question or partial attempt, parse it as a step.
Only return { "error": "NOT_RELATED" } if there is absolutely no mathematical content in the message.

Return ONLY JSON encapsulated in json md block in this exact shape, no explanation, no feedback, no other markdown, or it will cause errors downstream:
${JSON.stringify(PARSE_STRUCTURE_EXPLANATION, null, 2)}

If no math can be parsed from the answer（if it is unrelated, use "NOT_RELATED" instead）:
{ "error": "NOT_MATH" }

If the latest message is empty, return:
{ "error": "EMPTY_ANSWER" }

If the latest message of student is not a math problem or solution, return:
{ "error": "NOT_RELATED" }

YOU SHOULD NEVER RETURN ANYTHING OTHER THAN THE JSON IN THE FORMAT ABOVE, NO EXPLANATION, NO FEEDBACK, NO APOLOGIES, NO MARKDOWN OTHER THAN THE JSON MD BLOCK.

- Do not use any number or period other than in calculations as it may cause parsing issues downstream.
- DO not correct any mistakes in reasoning or calculations in the answer, just parse it as best you can.
- You should not add any formula that is not parsable by mathjs, ie. containing x or other variables. convert them to explicit calculations if possible, but if not just leave them out of the mathjsExpression field and only include the natural language explanation in the naturalLanguage field.
- Give no feedback on the correctness of the answer, just parse it as best you can.

`;

/**
 * Parse the student's answer into structured steps with mathjs expressions.
 * @param messages 
 * @returns ParsedAnswer
 */
export const parseAnswer = withLogging('parseAnswer', async (messages: Message[]): Promise<ParsedAnswer | AnswerParsingError> => {
  const client = getAiClient();
  const userType = messages[messages.length - 1].role === 'user' ? 'student' : 'assistant';
  const response = await client.messages.create({
    model: Models.parseAnswer, // cheaper model is fine here, no streaming needed
    max_tokens: 1024,
    system: SYSTEM_PROMPT(userType),
    messages,
  });

  // extract text content from response
  const content = response.content[0];
  console.log('Raw response from parseAnswer:', content);

  if (content?.type !== 'text') {
    throw new Error('Unexpected response type from parseAnswer');
  }

  const rawTextJsonBlock = content.text.match(/```json([\s\S]*?)```/);
  const rawText = rawTextJsonBlock ? rawTextJsonBlock[1].trim() : content.text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(rawText);
  
  if (isParsedAnswer(parsed) || isParsingError(parsed)) {
    return parsed;
  }

  throw new Error('Unexpected response format from parseAnswer: ' + rawText);
});

