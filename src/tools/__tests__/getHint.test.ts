import { getHint } from '../getHint';
import { ParsedAnswer, Solution } from '@/types/parsed-answer';
import { Message } from '@/types/message';
import { getAiClient } from '@/lib/ai_client';

// Mock the AI client
jest.mock('@/lib/ai_client');

const mockGetAiClient = getAiClient as jest.MockedFunction<typeof getAiClient>;

describe('getHint', () => {
  const mockClient = {
    messages: {
      create: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAiClient.mockReturnValue(mockClient as any);
  });

  const sampleUserAnswer: ParsedAnswer = {
    problem: 'What is 2 + 2?',
    steps: [
      {
        naturalLanguage: 'Add 2 and 2',
        mathjsExpression: '2 + 2',
        naturalLanguageResult: '5', // Incorrect
      },
    ],
    originalAnswer: '2 + 2 = 5',
  };

  const sampleSolution: Solution = {
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

  const sampleMessages: Message[] = [
    { role: 'user', content: 'What is 2 + 2?' },
    { role: 'assistant', content: 'Can you solve this?' },
    { role: 'user', content: '2 + 2 = 5' },
  ];

  it('generates incorrect_reasoning hint', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            type: 'incorrect_reasoning',
            message: 'Check your addition. 2 + 2 does not equal 5.',
          }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    const hint = await getHint(sampleUserAnswer, sampleSolution, sampleMessages);

    expect(hint.type).toBe('incorrect_reasoning');
    expect(hint.message).toBe('Check your addition. 2 + 2 does not equal 5.');
  });

  it('generates next_step hint', async () => {
    const incompleteAnswer: ParsedAnswer = {
      problem: 'Calculate (2 + 3) * 4',
      steps: [
        {
          naturalLanguage: 'First add 2 and 3',
          mathjsExpression: '2 + 3',
          naturalLanguageResult: '5',
        },
      ],
      originalAnswer: '2 + 3 = 5',
    };

    const completeSolution: Solution = {
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
      originalAnswer: '(2 + 3) * 4 = 20',
    };

    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            type: 'next_step',
            message: 'Good start! Now multiply your result by 4.',
          }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    const hint = await getHint(incompleteAnswer, completeSolution, sampleMessages);

    expect(hint.type).toBe('next_step');
    expect(hint.message).toContain('multiply');
  });

  it('generates calculation_error hint', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            type: 'calculation_error',
            message: 'Double-check your calculation in step 1.',
          }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    const hint = await getHint(sampleUserAnswer, sampleSolution, sampleMessages);

    expect(hint.type).toBe('calculation_error');
    expect(hint.message).toContain('calculation');
  });

  it('handles JSON wrapped in markdown code blocks', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: '```json\n' + JSON.stringify({
            type: 'incorrect_reasoning',
            message: 'Review the basic addition rules.',
          }) + '\n```',
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    const hint = await getHint(sampleUserAnswer, sampleSolution, sampleMessages);

    expect(hint.type).toBe('incorrect_reasoning');
    expect(hint.message).toBe('Review the basic addition rules.');
  });

  it('throws error for unexpected response type', async () => {
    const mockResponse = {
      content: [
        {
          type: 'image',
          source: { type: 'base64', data: 'some-data' },
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    await expect(getHint(sampleUserAnswer, sampleSolution, sampleMessages))
      .rejects.toThrow('Unexpected response type from getHint');
  });

  it('throws error for invalid hint format', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            invalidField: 'invalid',
          }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    await expect(getHint(sampleUserAnswer, sampleSolution, sampleMessages))
      .rejects.toThrow('Invalid hint format');
  });

  it('includes conversation history in the request', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            type: 'incorrect_reasoning',
            message: 'Test hint',
          }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    await getHint(sampleUserAnswer, sampleSolution, sampleMessages);

    expect(mockClient.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          ...sampleMessages,
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining("Student's answer"),
          }),
        ]),
      })
    );
  });

  it('includes both user answer and solution in the request', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            type: 'incorrect_reasoning',
            message: 'Test hint',
          }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    await getHint(sampleUserAnswer, sampleSolution, sampleMessages);

    const call = mockClient.messages.create.mock.calls[0][0];
    const lastMessage = call.messages[call.messages.length - 1];
    
    if (typeof lastMessage.content === 'string') {
      expect(lastMessage.content).toContain("Student's answer");
      expect(lastMessage.content).toContain('Correct solution');
    }
  });

  it('validates hint type is one of the expected types', async () => {
    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            type: 'invalid_type',
            message: 'This should fail',
          }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    await expect(getHint(sampleUserAnswer, sampleSolution, sampleMessages))
      .rejects.toThrow('Invalid hint format');
  });

  it('handles multi-step problems with complex hints', async () => {
    const complexAnswer: ParsedAnswer = {
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
          naturalLanguageResult: '6', // Wrong
        },
      ],
      originalAnswer: 'sqrt(16) = 4, 2^3 = 6, answer = 10',
    };

    const complexSolution: Solution = {
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

    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            type: 'calculation_error',
            message: 'Your calculation of 2^3 is incorrect. Remember that exponentiation means multiplying the base by itself.',
          }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    const hint = await getHint(complexAnswer, complexSolution, sampleMessages);

    expect(hint.type).toBe('calculation_error');
    expect(hint.message).toContain('2^3');
  });
});
