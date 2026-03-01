import { parseAnswer } from '../parseAnswer';
import { Message } from '@/types/message';
import { getAiClient } from '@/lib/ai_client';

// Mock the AI client
jest.mock('@/lib/ai_client');

const mockGetAiClient = getAiClient as jest.MockedFunction<typeof getAiClient>;

describe('parseAnswer', () => {
  const mockClient = {
    messages: {
      create: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAiClient.mockReturnValue(mockClient as any);
  });

  it('parses a valid math answer correctly', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'What is 2 + 2?' },
      { role: 'assistant', content: 'Let me solve this. 2 + 2 = 4' },
    ];

    const mockResponse = {
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
            originalAnswer: 'Let me solve this. 2 + 2 = 4',
          }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    const result = await parseAnswer(messages);

    expect(mockClient.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages,
        max_tokens: 1024,
      })
    );

    expect(result).toHaveProperty('problem', 'What is 2 + 2?');
    expect(result).toHaveProperty('steps');
    expect(result).toHaveProperty('originalAnswer');
  });

  it('handles JSON wrapped in markdown code blocks', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Calculate 5 * 3' },
    ];

    const mockResponse = {
      content: [
        {
          type: 'text',
          text: '```json\n' + JSON.stringify({
            problem: 'Calculate 5 * 3',
            steps: [
              {
                naturalLanguage: 'Multiply 5 by 3',
                mathjsExpression: '5 * 3',
                naturalLanguageResult: '15',
              },
            ],
            originalAnswer: '5 * 3 = 15',
          }) + '\n```',
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    const result = await parseAnswer(messages);

    expect(result).toHaveProperty('problem', 'Calculate 5 * 3');
    expect(result).toHaveProperty('steps');
  });

  it('returns NOT_RELATED error when content is not math related', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'What is the weather today?' },
    ];

    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'NOT_RELATED' }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    const result = await parseAnswer(messages);

    expect(result).toEqual({ error: 'NOT_RELATED' });
  });

  it('returns EMPTY_ANSWER error when answer is empty', async () => {
    const messages: Message[] = [
      { role: 'user', content: '' },
    ];

    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'EMPTY_ANSWER' }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    const result = await parseAnswer(messages);

    expect(result).toEqual({ error: 'EMPTY_ANSWER' });
  });

  it('returns NOT_MATH error when content has no math', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello, how are you?' },
    ];

    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: 'NOT_MATH' }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    const result = await parseAnswer(messages);

    expect(result).toEqual({ error: 'NOT_MATH' });
  });

  it('throws error for unexpected response type', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'What is 2 + 2?' },
    ];

    const mockResponse = {
      content: [
        {
          type: 'image',
          source: { type: 'base64', data: 'some-data' },
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    await expect(parseAnswer(messages)).rejects.toThrow('Unexpected response type from parseAnswer');
  });

  it('throws error for unexpected response format', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'What is 2 + 2?' },
    ];

    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ unexpected: 'format' }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    await expect(parseAnswer(messages)).rejects.toThrow('Unexpected response format from parseAnswer');
  });

  it('parses multi-step math problems', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Calculate (2 + 3) * 4' },
    ];

    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
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
          }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    const result = await parseAnswer(messages);

    expect(result).toHaveProperty('steps');
    if ('steps' in result) {
      expect(result.steps).toHaveLength(2);
      expect(result.steps[0].mathjsExpression).toBe('2 + 3');
      expect(result.steps[1].mathjsExpression).toBe('5 * 4');
    }
  });

  it('handles complex mathematical expressions', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'What is sqrt(16) + 2^3?' },
    ];

    const mockResponse = {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            problem: 'What is sqrt(16) + 2^3?',
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
          }),
        },
      ],
    };

    mockClient.messages.create.mockResolvedValue(mockResponse);

    const result = await parseAnswer(messages);

    expect(result).toHaveProperty('problem', 'What is sqrt(16) + 2^3?');
    if ('steps' in result) {
      expect(result.steps).toHaveLength(3);
    }
  });
});
