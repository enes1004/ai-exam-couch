import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response('ANTHROPIC_API_KEY is not configured', { status: 500 });
    }

    const client = new Anthropic({ apiKey });

    // Create a streaming response
    const stream = await client.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
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
