import { render, screen } from '@testing-library/react';
import { AvatarIcon } from '../AvatarIcon';

describe('AvatarIcon', () => {
  it('renders assistant avatar with "AI" text', () => {
    const { container } = render(<AvatarIcon role="assistant" />);
    
    const aiText = screen.getByText('AI');
    expect(aiText).toBeInTheDocument();
    
    const avatar = container.querySelector('.bg-teal-600');
    expect(avatar).toBeInTheDocument();
  });

  it('renders user avatar with user icon SVG', () => {
    const { container } = render(<AvatarIcon role="user" />);
    
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    
    const avatar = container.querySelector('.bg-slate-500');
    expect(avatar).toBeInTheDocument();
  });

  it('applies correct styling for assistant role', () => {
    const { container } = render(<AvatarIcon role="assistant" />);
    
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('w-9', 'h-9', 'rounded-full', 'bg-teal-600');
  });

  it('applies correct styling for user role', () => {
    const { container } = render(<AvatarIcon role="user" />);
    
    const avatar = container.firstChild as HTMLElement;
    expect(avatar).toHaveClass('w-9', 'h-9', 'rounded-full', 'bg-slate-500');
  });
});
