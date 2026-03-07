import { Models } from '@/config/models';
import { getAiClient } from '@/lib/ai_client';
import { withLogging } from '@/lib/with-logging';
import { Message } from '@/types/message';
const getGenericAnswer = withLogging('getGenericAnswer', async (messages:Message[]) : Promise<string> => {
    const client = getAiClient();
    const response = await client.messages.create({
      model: Models.chat,
      max_tokens: 512,
      system: `You are a friendly math tutor assistant. 
The student has sent a message that is not related to a math problem.
Respond naturally and conversationally in the student's language.
If they are expressing thanks or satisfaction, acknowledge it warmly.
If they are asking something off-topic, gently redirect them to math practice.
Never give the answer to a math problem in this response,
Keep the response short.`,
      messages,
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from fallback completion');
    }

    return content.text;
});

export default getGenericAnswer;