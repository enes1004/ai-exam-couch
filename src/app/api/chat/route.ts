import { getAiClient } from '@/lib/ai_client';
import { Models } from '@/config/models';
import Anthropic from '@anthropic-ai/sdk';
import { Message } from '@anthropic-ai/sdk/resources';
import { NextRequest } from 'next/server';
import { get } from 'node:http';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages }: { messages: Message[] } = await req.json();
    const client = getAiClient();

    // Create a streaming response
    const stream = await client.messages.stream({
      model: Models.chat,
      max_tokens: 1024,
      messages: messages,
    });

    // Convert Anthropic stream to Web ReadableStream
    const readableStream = new ReadableStream({
      async start(controller) {
        stream.on('text', (text) => {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`));
        });

        stream.on('error', (error) => {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'error', content: error.message })}\n\n`));
          controller.close();
        });

        stream.on('end', () => {
          if (stream.ended) return;
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ type: 'end' })}\n\n`));
          controller.close();
        });

        // Wait for the stream to complete
        await stream.finalMessage();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
