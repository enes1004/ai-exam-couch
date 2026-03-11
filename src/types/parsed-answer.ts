export type Step = {
    naturalLanguage: string;
    mathjsExpression: string;
    naturalLanguageResult: string;
    mathjsResult?: string;
    isMatching?: boolean; // optional field to indicate if mathjsResult matches naturalLanguageResult
}

export type ParsedAnswer = {
    problem: string;
    steps: Step[];
    originalAnswer: string;
}
export const isParsedAnswer = (result: any): result is ParsedAnswer => {
  if (!result || typeof result.problem !== 'string' || !Array.isArray(result.steps) || typeof result.originalAnswer !== 'string') {
    return false;
  }

  return result.steps.every((step: any) =>
    typeof step.naturalLanguage === 'string' &&
    typeof step.mathjsExpression === 'string' &&
    typeof step.naturalLanguageResult === 'string'
  );
};

/**
 * Solution is the same as ParsedAnswer, but semantically represents the correct solution to the problem.
 */
export type Solution = ParsedAnswer;

const PARSING_ERROR_CODES = ['NOT_RELATED', 'EMPTY_ANSWER', 'NOT_MATH'] as const;

export type AnswerParsingError = {
    error: typeof PARSING_ERROR_CODES[number];
}


export const isParsingError = (result: any): result is AnswerParsingError => {
  return PARSING_ERROR_CODES.includes(result?.error);
};

