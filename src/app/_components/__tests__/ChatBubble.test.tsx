import { render, screen } from '@testing-library/react';
import { ChatBubble, type Message } from '../ChatBubble';

describe('ChatBubble', () => {
  const userMessage: Message = {
    role: 'user',
    content: 'Hello, how are you?',
  };

  const assistantMessage: Message = {
    role: 'assistant',
    content: 'I am doing well, thank you!',
  };

  it('renders user message correctly', () => {
    render(<ChatBubble message={userMessage} />);
    
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    render(<ChatBubble message={assistantMessage} />);
    
    expect(screen.getByText('I am doing well, thank you!')).toBeInTheDocument();
    expect(screen.getByText('AI Exam Couch')).toBeInTheDocument();
  });

  it('applies correct styling for user messages', () => {
    const { container } = render(<ChatBubble message={userMessage} />);
    
    const bubble = container.querySelector('.bg-teal-600');
    expect(bubble).toBeInTheDocument();
    expect(bubble).toHaveClass('text-white', 'rounded-br-md');
  });

  it('applies correct styling for assistant messages', () => {
    const { container } = render(<ChatBubble message={assistantMessage} />);
    
    const bubble = container.querySelector('.bg-white');
    expect(bubble).toBeInTheDocument();
    expect(bubble).toHaveClass('border', 'border-slate-100');
  });

  it('preserves whitespace in message content', () => {
    const messageWithNewlines: Message = {
      role: 'user',
      content: 'Line 1\nLine 2\nLine 3',
    };
    
    const { container } = render(<ChatBubble message={messageWithNewlines} />);
    
    const content = container.querySelector('.whitespace-pre-wrap');
    expect(content).toBeInTheDocument();
    expect(content?.textContent).toBe('Line 1\nLine 2\nLine 3');
  });
});
