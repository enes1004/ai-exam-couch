import { render, screen } from '@testing-library/react';
import { WelcomeScreen } from '../WelcomeScreen';

describe('WelcomeScreen', () => {
  it('renders the welcome heading', () => {
    render(<WelcomeScreen />);
    
    expect(screen.getByText('Hey there! Ready to study?')).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<WelcomeScreen />);
    
    expect(screen.getByText(/I'm your personal exam tutor/)).toBeInTheDocument();
  });

  it('renders AI logo', () => {
    render(<WelcomeScreen />);
    
    const logos = screen.getAllByText('AI');
    expect(logos.length).toBeGreaterThan(0);
  });

  it('renders all suggestion chips', () => {
    render(<WelcomeScreen />);
    
    expect(screen.getByText('Explain recursion')).toBeInTheDocument();
    expect(screen.getByText('Quiz me on React')).toBeInTheDocument();
    expect(screen.getByText('What is Big-O?')).toBeInTheDocument();
  });

  it('applies correct styling to suggestion chips', () => {
    const { container } = render(<WelcomeScreen />);
    
    const chips = container.querySelectorAll('.rounded-full.bg-slate-100');
    expect(chips).toHaveLength(3);
  });

  it('centers content correctly', () => {
    const { container } = render(<WelcomeScreen />);
    
    const mainContainer = container.firstChild as HTMLElement;
    expect(mainContainer).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
  });
});
