import getGenericAnswer from '../getGenericAnswer';
import { Message } from '@/types/message';
import { getAiClient } from '@/lib/ai_client';

jest.mock('@/lib/ai_client');

const mockGetAiClient = getAiClient as jest.MockedFunction<typeof getAiClient>;

describe('getGenericAnswer', () => {
  const mockClient = {
    messages: {
      create: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAiClient.mockReturnValue(mockClient as any);
  });

  it('returns the text content from the AI response', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Thank you!' },
    ];

    mockClient.messages.create.mockResolvedValue({
      content: [{ type: 'text', text: "You're welcome! Ready for more math?" }],
    });

    const result = await getGenericAnswer(messages);

    expect(result).toBe("You're welcome! Ready for more math?");
  });

  it('calls the AI client with the provided messages', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'What is the capital of France?' },
    ];

    mockClient.messages.create.mockResolvedValue({
      content: [{ type: 'text', text: "Let's focus on math practice!" }],
    });

    await getGenericAnswer(messages);

    expect(mockClient.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({
        messages,
        max_tokens: 512,
      })
    );
  });

  it('throws an error when the response type is not text', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello!' },
    ];

    mockClient.messages.create.mockResolvedValue({
      content: [{ type: 'image', source: { type: 'base64', data: 'abc' } }],
    });

    await expect(getGenericAnswer(messages)).rejects.toThrow(
      'Unexpected response type from fallback completion'
    );
  });

  it('handles off-topic messages and redirects to math', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Tell me about dinosaurs.' },
    ];

    const redirectMessage = "Let's stick to math! Do you have a problem you'd like to work on?";
    mockClient.messages.create.mockResolvedValue({
      content: [{ type: 'text', text: redirectMessage }],
    });

    const result = await getGenericAnswer(messages);

    expect(result).toBe(redirectMessage);
  });

  it('handles multi-turn conversation history', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'What is 2 + 2?' },
      { role: 'assistant', content: 'Can you try to solve it yourself first?' },
      { role: 'user', content: 'Thanks, you are helpful!' },
    ];

    mockClient.messages.create.mockResolvedValue({
      content: [{ type: 'text', text: 'Glad to help! Keep practicing.' }],
    });

    const result = await getGenericAnswer(messages);

    expect(result).toBe('Glad to help! Keep practicing.');
    expect(mockClient.messages.create).toHaveBeenCalledWith(
      expect.objectContaining({ messages })
    );
  });
});
