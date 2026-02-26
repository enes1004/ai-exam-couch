import Anthropic from '@anthropic-ai/sdk';

/**
 * Advanced streaming completion example with event handling
 * This demonstrates more advanced streaming features including:
 * - Multiple event types
 * - Error handling
 * - Usage tracking
 */
async function advancedStreamingExample() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set');
    console.error('Please set it with: export ANTHROPIC_API_KEY=your_api_key_here');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });

  console.log('Starting advanced streaming example...\n');
  console.log('Question: Explain how photosynthesis works in 2-3 sentences.\n');
  console.log('Streaming response with detailed events:');
  console.log('='.repeat(60));

  try {
    const stream = await client.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: 'Explain how photosynthesis works in 2-3 sentences.',
        },
      ],
    });

    // Handle different event types available in MessageStream
    stream.on('connect', () => {
      console.log('\n[Event: Connect] - Stream connection established\n');
    });

    stream.on('streamEvent', (event, snapshot) => {
      // Log the raw stream event type
      if (event.type !== 'content_block_delta') {
        console.log(`[Stream Event: ${event.type}]`);
      }
    });

    stream.on('text', (textDelta, textSnapshot) => {
      // Stream the text as it arrives
      process.stdout.write(textDelta);
    });

    stream.on('contentBlock', (content) => {
      console.log('\n[Event: Content Block]');
      console.log('- Type:', content.type);
      if (content.type === 'text') {
        console.log('- Text length:', content.text.length);
      }
    });

    stream.on('message', (message) => {
      console.log('\n[Event: Message Received]');
      console.log('- ID:', message.id);
      console.log('- Model:', message.model);
      console.log('- Role:', message.role);
    });

    stream.on('finalMessage', (message) => {
      console.log('\n[Event: Final Message]');
      console.log('- Stop reason:', message.stop_reason);
      console.log('- Usage:');
      console.log('  - Input tokens:', message.usage.input_tokens);
      console.log('  - Output tokens:', message.usage.output_tokens);
    });

    stream.on('error', (error) => {
      console.error('\n[Event: Error]', error.message);
    });

    stream.on('abort', (error) => {
      console.error('\n[Event: Abort]', error.message);
    });

    stream.on('end', () => {
      console.log('\n[Event: End] - Stream completed');
    });

    // Wait for completion
    const finalMessage = await stream.finalMessage();
    
    console.log('\n' + '='.repeat(60));
    console.log('\n[Final Message Summary]');
    console.log('- ID:', finalMessage.id);
    console.log('- Model:', finalMessage.model);
    console.log('- Stop reason:', finalMessage.stop_reason);
    console.log('- Input tokens:', finalMessage.usage.input_tokens);
    console.log('- Output tokens:', finalMessage.usage.output_tokens);
    console.log('- Total tokens:', finalMessage.usage.input_tokens + finalMessage.usage.output_tokens);

  } catch (error) {
    console.error('\nError during streaming:', error);
    throw error;
  }
}

// Run the example
if (require.main === module) {
  advancedStreamingExample()
    .then(() => {
      console.log('\n✓ Advanced example completed successfully\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Advanced example failed:', error.message);
      process.exit(1);
    });
}

export { advancedStreamingExample };
