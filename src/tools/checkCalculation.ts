import { withLogging } from "@/lib/with-logging";
import { ParsedAnswer } from "@/types/parsed-answer";
import { evaluate } from "mathjs";

const normalize = (str: string): string => {
  const stripped = str.replace(/[^0-9.\/\-]/g, '');
  const asNumber = parseFloat(stripped);
  return isNaN(asNumber) ? stripped : String(Math.round(asNumber * 1000) / 1000);
};

const  sanitizeExpression = (expression: string): string => {
  return expression
    .replace(/×/g, '*')   // Japanese/unicode multiply
    .replace(/÷/g, '/')   // unicode divide
    .replace(/[¥$,]/g, '') // currency symbols and commas
    .replace(/%/g, '/100') // percentage
    .trim();
};

const evaluateExpression = (expression: string | undefined): string => {
  if (!expression || typeof expression !== 'string' || expression.trim() === '') {
    console.error('evaluateExpression received invalid input:', expression);
    return '';
  }
  try {
    const result = evaluate(sanitizeExpression(expression));
    return result.toString();
  } catch (error) {
    console.error(`Error evaluating expression "${expression}":`, error);
    return '';
  }
};

/**
 * Check if the parsed answer is correct by using mathjs to evaluate the mathjsExpression of each step and comparing it to the naturalLanguageResult.
 * @param parsedAnswer 
 * @returns ParsedAnswer with mathjsResult added to each step, which is the evaluated result of mathjsExpression.
 */
export const checkCalculation = withLogging('checkCalculation', async (parsedAnswer: ParsedAnswer): Promise<ParsedAnswer> => {
    return {
        ...parsedAnswer,
        steps: parsedAnswer.steps.map(step => {
            const mathjsResult = evaluateExpression(step.mathjsExpression);
            return {
                ...step,
                mathjsResult,
                isMatching: normalize(mathjsResult) === normalize(step.naturalLanguageResult)

            }
        })

    };

});