import { solveProblem } from '../solveProblem';
import { getAiClient } from '@/lib/ai_client';

jest.mock('@/lib/ai_client');
jest.mock('@/lib/sleep', () => ({
  sleep: jest.fn().mockResolvedValue(undefined),
  backoff: jest.fn().mockResolvedValue(undefined),
}));

const mockGetAiClient = getAiClient as jest.MockedFunction<typeof getAiClient>;

describe('solveProblem', () => {
  const mockClient = {
    messages: {
      create: jest.fn(),
    },
  };

  const validSolutionText = `
Let me solve step by step.
Step 1: Add 2 and 2: 2 + 2 = 4
`;

  const validParsedResponse = {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          problem: 'What is 2 + 2?',
          steps: [
            {
              naturalLanguage: 'Add 2 and 2',
              mathjsExpression: '2 + 2',
              naturalLanguageResult: '4',
            },
          ],
          originalAnswer: '4',
        }),
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAiClient.mockReturnValue(mockClient as any);
  });

  it('returns a ParsedAnswer for a simple problem', async () => {
    // First call: solveProblem AI generates solution
    // Second call: parseAnswer AI parses the solution
    mockClient.messages.create
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: validSolutionText }],
      })
      .mockResolvedValueOnce(validParsedResponse);

    const result = await solveProblem('What is 2 + 2?');

    expect(result).toHaveProperty('problem', 'What is 2 + 2?');
    expect(result).toHaveProperty('steps');
    expect(result.steps).toHaveLength(1);
    expect(result.steps[0].mathjsExpression).toBe('2 + 2');
    expect(result.steps[0].mathjsResult).toBe('4');
    expect(result.steps[0].isMatching).toBe(true);
  });

  it('throws an error if the response type is not text', async () => {
    mockClient.messages.create.mockResolvedValue({
      content: [{ type: 'image', source: { type: 'base64', data: 'abc' } }],
    });

    await expect(solveProblem('What is 2 + 2?')).rejects.toThrow(
      'Unexpected response type from solveProblem'
    );
  });

  it('retries when parseAnswer returns a parsing error', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Attempt 1: AI generates solution, parseAnswer fails
    mockClient.messages.create
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Not a valid answer' }],
      })
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify({ error: 'NOT_MATH' }) }],
      })
      // Attempt 2: AI regenerates solution, parseAnswer succeeds
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: validSolutionText }],
      })
      .mockResolvedValueOnce(validParsedResponse);

    const result = await solveProblem('What is 2 + 2?');

    expect(result).toHaveProperty('problem', 'What is 2 + 2?');
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Parsing error from solveProblem')
    );

    consoleSpy.mockRestore();
  });

  it('retries when calculations are incorrect', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

    const incorrectParsedResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            problem: 'What is 2 + 2?',
            steps: [
              {
                naturalLanguage: 'Add 2 and 2',
                mathjsExpression: '2 + 2',
                naturalLanguageResult: '5', // Wrong result
              },
            ],
            originalAnswer: '5',
          }),
        },
      ],
    };

    // Attempt 1: incorrect calculation
    mockClient.messages.create
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: 'Step 1: 2 + 2 = 5' }],
      })
      .mockResolvedValueOnce(incorrectParsedResponse)
      // Attempt 2: correct calculation
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: validSolutionText }],
      })
      .mockResolvedValueOnce(validParsedResponse);

    const result = await solveProblem('What is 2 + 2?');

    expect(result.steps[0].isMatching).toBe(true);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Incorrect calculations')
    );

    consoleSpy.mockRestore();
  });

  it('throws after maximum retries are exhausted', async () => {
    // All attempts return a parsing error
    mockClient.messages.create.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({ error: 'NOT_MATH' }) }],
    });

    // solveProblem calls AI once, then parseAnswer once per attempt (3 attempts)
    // Each attempt: 1 solveProblem AI call + 1 parseAnswer AI call
    await expect(solveProblem('What is 2 + 2?')).rejects.toThrow(
      'solveProblem failed after maximum retries'
    );
  });
});
