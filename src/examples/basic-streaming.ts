import Anthropic from '@anthropic-ai/sdk';

/**
 * Basic streaming completion example using Anthropic's Claude API
 * This demonstrates how to stream responses from the AI model in real-time
 */
async function basicStreamingCompletion() {
  // Initialize the Anthropic client with API key from environment
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set');
    console.error('Please set it with: export ANTHROPIC_API_KEY=your_api_key_here');
    process.exit(1);
  }

  const client = new Anthropic({
    apiKey: apiKey,
  });

  console.log('Starting streaming completion...\n');
  console.log('Question: What is the capital of France?\n');
  console.log('Streaming response:');
  console.log('---');

  try {
    // Create a streaming message request
    const stream = await client.messages.stream({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: 'What is the capital of France? Please provide a brief answer.',
        },
      ],
    });

    // Listen for text deltas and print them as they arrive
    stream.on('text', (text) => {
      process.stdout.write(text);
    });

    // Wait for the stream to complete
    const message = await stream.finalMessage();
    
    console.log('\n---');
    console.log('\nStream completed successfully!');
    console.log('Message ID:', message.id);
    console.log('Model:', message.model);
    console.log('Stop reason:', message.stop_reason);
    console.log('Usage:', JSON.stringify(message.usage, null, 2));

  } catch (error) {
    console.error('\nError during streaming:', error);
    throw error;
  }
}

// Run the example
if (require.main === module) {
  basicStreamingCompletion()
    .then(() => {
      console.log('\n✓ Example completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n✗ Example failed:', error.message);
      process.exit(1);
    });
}

export { basicStreamingCompletion };
