import { ParsedAnswer } from "@/types/parsed-answer";
import { evaluate } from "mathjs";

const normalize = (str: string): string =>  str.replace(/[^0-9.\/\-]/g, '');

const evaluateExpression = (expression: string): string => {
    try {
        const result = evaluate(expression);
        return result.toString();
    } catch (error) {
        console.error(`Error evaluating expression "${expression}":`, error);
        return "INVALID_EXPRESSION";
    }
}

/**
 * Check if the parsed answer is correct by using mathjs to evaluate the mathjsExpression of each step and comparing it to the naturalLanguageResult.
 * @param parsedAnswer 
 * @returns ParsedAnswer with mathjsResult added to each step, which is the evaluated result of mathjsExpression.
 */
export const checkCalculation = (parsedAnswer: ParsedAnswer): ParsedAnswer => {
    
    return {
        ...parsedAnswer,
        steps: parsedAnswer.steps.map(step => {
            const mathjsResult = evaluateExpression(step.mathjsExpression);
            return {
                ...step,
                mathjsResult: normalize(mathjsResult),
                isMatching: normalize(mathjsResult) === normalize(step.naturalLanguageResult)

            }
        })
    };

};