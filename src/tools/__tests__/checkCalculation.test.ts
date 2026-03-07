import { checkCalculation } from '../checkCalculation';
import { ParsedAnswer } from '@/types/parsed-answer';

describe('checkCalculation', () => {
  it('evaluates simple mathjs expressions correctly', () => {
    const parsedAnswer: ParsedAnswer = {
      problem: 'What is 2 + 2?',
      steps: [
        {
          naturalLanguage: 'Add 2 and 2',
          mathjsExpression: '2 + 2',
          naturalLanguageResult: '4',
        },
      ],
      originalAnswer: '2 + 2 = 4',
    };

    const result = checkCalculation(parsedAnswer);

    expect(result.steps[0].mathjsResult).toBe('4');
    expect(result.steps[0].isMatching).toBe(true);
  });

  it('detects incorrect calculations', () => {
    const parsedAnswer: ParsedAnswer = {
      problem: 'What is 5 * 3?',
      steps: [
        {
          naturalLanguage: 'Multiply 5 and 3',
          mathjsExpression: '5 * 3',
          naturalLanguageResult: '12', // Wrong answer
        },
      ],
      originalAnswer: '5 * 3 = 12',
    };

    const result = checkCalculation(parsedAnswer);

    expect(result.steps[0].mathjsResult).toBe('15');
    expect(result.steps[0].isMatching).toBe(false);
  });

  it('handles multiple steps', () => {
    const parsedAnswer: ParsedAnswer = {
      problem: 'Calculate (2 + 3) * 4',
      steps: [
        {
          naturalLanguage: 'First add 2 and 3',
          mathjsExpression: '2 + 3',
          naturalLanguageResult: '5',
        },
        {
          naturalLanguage: 'Then multiply by 4',
          mathjsExpression: '5 * 4',
          naturalLanguageResult: '20',
        },
      ],
      originalAnswer: '2 + 3 = 5, then 5 * 4 = 20',
    };

    const result = checkCalculation(parsedAnswer);

    expect(result.steps[0].mathjsResult).toBe('5');
    expect(result.steps[0].isMatching).toBe(true);
    expect(result.steps[1].mathjsResult).toBe('20');
    expect(result.steps[1].isMatching).toBe(true);
  });

  it('normalizes results by removing non-numeric characters', () => {
    const parsedAnswer: ParsedAnswer = {
      problem: 'What is 10 / 2?',
      steps: [
        {
          naturalLanguage: 'Divide 10 by 2',
          mathjsExpression: '10 / 2',
          naturalLanguageResult: '$5', // With currency symbol
        },
      ],
      originalAnswer: '10 / 2 = $5',
    };

    const result = checkCalculation(parsedAnswer);

    expect(result.steps[0].mathjsResult).toBe('5');
    expect(result.steps[0].isMatching).toBe(true);
  });

  it('handles decimal results', () => {
    const parsedAnswer: ParsedAnswer = {
      problem: 'What is 10 / 3?',
      steps: [
        {
          naturalLanguage: 'Divide 10 by 3',
          mathjsExpression: '10 / 3',
          naturalLanguageResult: '3.3333333333333335',
        },
      ],
      originalAnswer: '10 / 3 = 3.3333333333333335',
    };

    const result = checkCalculation(parsedAnswer);

    expect(result.steps[0].mathjsResult).toBe('3.3333333333333335');
    expect(result.steps[0].isMatching).toBe(true);
  });

  it('handles invalid expressions', () => {
    const parsedAnswer: ParsedAnswer = {
      problem: 'Invalid expression',
      steps: [
        {
          naturalLanguage: 'Try to evaluate invalid expression',
          mathjsExpression: 'not a valid expression',
          naturalLanguageResult: '0',
        },
      ],
      originalAnswer: 'not a valid expression = 0',
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const result = checkCalculation(parsedAnswer);

    // After normalization, both empty strings should not match '0'
    expect(result.steps[0].mathjsResult).toBe('');
    expect(result.steps[0].isMatching).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('handles complex mathematical expressions', () => {
    const parsedAnswer: ParsedAnswer = {
      problem: 'Calculate sqrt(16) + 2^3',
      steps: [
        {
          naturalLanguage: 'Calculate square root of 16',
          mathjsExpression: 'sqrt(16)',
          naturalLanguageResult: '4',
        },
        {
          naturalLanguage: 'Calculate 2 to the power of 3',
          mathjsExpression: '2^3',
          naturalLanguageResult: '8',
        },
        {
          naturalLanguage: 'Add the results',
          mathjsExpression: '4 + 8',
          naturalLanguageResult: '12',
        },
      ],
      originalAnswer: 'sqrt(16) = 4, 2^3 = 8, 4 + 8 = 12',
    };

    const result = checkCalculation(parsedAnswer);

    expect(result.steps[0].mathjsResult).toBe('4');
    expect(result.steps[0].isMatching).toBe(true);
    expect(result.steps[1].mathjsResult).toBe('8');
    expect(result.steps[1].isMatching).toBe(true);
    expect(result.steps[2].mathjsResult).toBe('12');
    expect(result.steps[2].isMatching).toBe(true);
  });

  it('preserves original parsed answer structure', () => {
    const parsedAnswer: ParsedAnswer = {
      problem: 'What is 1 + 1?',
      steps: [
        {
          naturalLanguage: 'Add 1 and 1',
          mathjsExpression: '1 + 1',
          naturalLanguageResult: '2',
        },
      ],
      originalAnswer: '1 + 1 = 2',
    };

    const result = checkCalculation(parsedAnswer);

    expect(result.problem).toBe(parsedAnswer.problem);
    expect(result.originalAnswer).toBe(parsedAnswer.originalAnswer);
    expect(result.steps[0].naturalLanguage).toBe(parsedAnswer.steps[0].naturalLanguage);
    expect(result.steps[0].mathjsExpression).toBe(parsedAnswer.steps[0].mathjsExpression);
    expect(result.steps[0].naturalLanguageResult).toBe(parsedAnswer.steps[0].naturalLanguageResult);
  });

  it('handles expressions with parentheses', () => {
    const parsedAnswer: ParsedAnswer = {
      problem: 'What is (5 + 3) * 2?',
      steps: [
        {
          naturalLanguage: 'Calculate the full expression',
          mathjsExpression: '(5 + 3) * 2',
          naturalLanguageResult: '16',
        },
      ],
      originalAnswer: '(5 + 3) * 2 = 16',
    };

    const result = checkCalculation(parsedAnswer);

    expect(result.steps[0].mathjsResult).toBe('16');
    expect(result.steps[0].isMatching).toBe(true);
  });

  it('normalizes both mathjsResult and naturalLanguageResult for comparison', () => {
    const parsedAnswer: ParsedAnswer = {
      problem: 'What is 100 / 4?',
      steps: [
        {
          naturalLanguage: 'Divide 100 by 4',
          mathjsExpression: '100 / 4',
          naturalLanguageResult: '$25 dollars', // With text and symbols
        },
      ],
      originalAnswer: '100 / 4 = $25 dollars',
    };

    const result = checkCalculation(parsedAnswer);

    expect(result.steps[0].mathjsResult).toBe('25');
    expect(result.steps[0].isMatching).toBe(true);
  });
});
