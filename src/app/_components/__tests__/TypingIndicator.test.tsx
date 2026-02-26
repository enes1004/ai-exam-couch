import { render, screen } from '@testing-library/react';
import { TypingIndicator } from '../TypingIndicator';

describe('TypingIndicator', () => {
  it('renders the assistant name', () => {
    render(<TypingIndicator />);
    
    expect(screen.getByText('AI Exam Couch')).toBeInTheDocument();
  });

  it('renders three animated dots', () => {
    const { container } = render(<TypingIndicator />);
    
    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots).toHaveLength(3);
  });

  it('renders avatar icon', () => {
    render(<TypingIndicator />);
    
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('applies correct styling', () => {
    const { container } = render(<TypingIndicator />);
    
    const bubble = container.querySelector('.rounded-2xl.rounded-bl-md');
    expect(bubble).toBeInTheDocument();
    expect(bubble).toHaveClass('bg-white', 'px-7', 'py-5');
  });

  it('applies correct animation delays to dots', () => {
    const { container } = render(<TypingIndicator />);
    
    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots[0]).toHaveStyle({ animationDelay: '0ms' });
    expect(dots[1]).toHaveStyle({ animationDelay: '150ms' });
    expect(dots[2]).toHaveStyle({ animationDelay: '300ms' });
  });
});
