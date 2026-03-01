import { Message } from "@/types/message";
import { AnswerParsingError, isParsedAnswer, isParsingError, ParsedAnswer } from "@/types/parsed-answer";
import { Models } from "@/config/models";
import { getAiClient } from "@/lib/ai_client";

// Used as prompt template only — values are example strings for the model
const PARSE_STRUCTURE_EXPLANATION: ParsedAnswer = 
{
  problem: "the original question or problem statement",
  steps: [
    {
      naturalLanguage: "string describing the reasoning step",
      mathjsExpression: "string containing the mathjs expression",
      naturalLanguageResult: "string describing the result in natural language",
      mathjsResult: "optional: the expected evaluated result as string"
    }
  ],
  originalAnswer: "the original answer text verbatim"
};

const SYSTEM_PROMPT = `
You are a math reasoning parser.
Look at the conversation history and extract the student's reasoning steps from their latest answer.

Return ONLY valid JSON in this exact shape, no explanation, no markdown:
${JSON.stringify(PARSE_STRUCTURE_EXPLANATION, null, 2)}

If the latest message is not related to a math problem, return:
{ "error": "NOT_RELATED" }

If the latest message is empty or has no answer:
{ "error": "EMPTY_ANSWER" }

If no math can be parsed from the answer:
{ "error": "NOT_MATH" }
`;

/**
 * Parse the student's answer into structured steps with mathjs expressions.
 * @param messages 
 * @returns ParsedAnswer
 */
export const parseAnswer = async (messages: Message[]): Promise<ParsedAnswer | AnswerParsingError> => {
  const client = getAiClient();
  const response = await client.messages.create({
    model: Models.parseAnswer, // cheaper model is fine here, no streaming needed
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  // extract text content from response
  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from parseAnswer');
  }

  const rawText = content.text.replace(/```json|```/g, '').trim();
  const parsed = JSON.parse(rawText);
  
  if (isParsedAnswer(parsed) || isParsingError(parsed)) {
    return parsed;
  }

  throw new Error('Unexpected response format from parseAnswer: ' + rawText);
};

