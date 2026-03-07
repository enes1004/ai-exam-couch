import { Message } from '@/types/message';
import { NextRequest } from 'next/server';
import { parseAnswer } from '@/tools/parseAnswer';
import { checkCalculation } from '@/tools/checkCalculation';
import { AnswerParsingError, ParsedAnswer, Solution } from '@/types/parsed-answer';
import { solveProblem } from '@/tools/solveProblem';
import { getHint } from '@/tools/getHint';
import getGenericAnswer from '@/tools/getGenericAnswer';

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json();

    const parsedAnswer: ParsedAnswer | AnswerParsingError = await parseAnswer(messages);

    if ('error' in parsedAnswer) {
      if(parsedAnswer.error === 'NOT_RELATED' || parsedAnswer.error === 'EMPTY_ANSWER') {
        const genericAnswer = await getGenericAnswer(messages);
        return new Response(JSON.stringify({
          type: 'text',
          content: genericAnswer,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: parsedAnswer.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userAnswer:ParsedAnswer = await checkCalculation(parsedAnswer);
    const solution:Solution = await solveProblem(userAnswer.problem);

    // Compare user's answer with solution before generating hint
    // If it's already correct, we can skip hint generation and just return success
    if (solution.originalAnswer === userAnswer.originalAnswer && solution.steps.every((solutionStep, index) => {
      const userStep = userAnswer.steps?.[index];
      return userStep &&
        userStep.isMatching &&
        userStep.mathjsResult === solutionStep.mathjsResult;
    })) {

      const isJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/.test(userAnswer.problem);
      const successMessage = isJapanese ? '正解です！' : 'Correct answer!';

      return new Response(JSON.stringify({
          type: 'text',
          content: successMessage, 
        }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    
    }

    // If not correct, return the parsed answer and solution for hint generation
    const hintResponse = await getHint(userAnswer, solution, messages);
    return new Response(JSON.stringify({
          type: 'text',
          content: hintResponse.message,
      }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
