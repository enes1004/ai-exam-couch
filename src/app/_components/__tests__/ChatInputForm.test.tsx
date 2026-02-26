import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInputForm } from '../ChatInputForm';
import { createRef } from 'react';

describe('ChatInputForm', () => {
  const defaultProps = {
    input: '',
    setInput: jest.fn(),
    isLoading: false,
    useEnterToSend: false,
    setUseEnterToSend: jest.fn(),
    textareaRef: createRef<HTMLTextAreaElement>(),
    onSubmit: jest.fn(),
    onKeyDown: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the textarea with placeholder', () => {
    render(<ChatInputForm {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    expect(textarea).toBeInTheDocument();
  });

  it('renders the send button', () => {
    render(<ChatInputForm {...defaultProps} />);
    
    const button = screen.getByRole('button', { name: 'Send message' });
    expect(button).toBeInTheDocument();
  });

  it('renders the checkbox for "Use Enter to send"', () => {
    render(<ChatInputForm {...defaultProps} />);
    
    expect(screen.getByText('Use Enter to send')).toBeInTheDocument();
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('displays hint text when useEnterToSend is false', () => {
    render(<ChatInputForm {...defaultProps} useEnterToSend={false} />);
    
    expect(screen.getByText('(Shift+Enter to send)')).toBeVisible();
  });

  it('hides hint text when useEnterToSend is true', () => {
    render(<ChatInputForm {...defaultProps} useEnterToSend={true} />);
    
    expect(screen.queryByText('(Shift+Enter to send)')).not.toBeInTheDocument();
  });

  it('disables textarea when isLoading is true', () => {
    render(<ChatInputForm {...defaultProps} isLoading={true} />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    expect(textarea).toBeDisabled();
  });

  it('disables send button when isLoading is true', () => {
    render(<ChatInputForm {...defaultProps} input="test" isLoading={true} />);
    
    const button = screen.getByRole('button', { name: 'Send message' });
    expect(button).toBeDisabled();
  });

  it('disables send button when input is empty', () => {
    render(<ChatInputForm {...defaultProps} input="" />);
    
    const button = screen.getByRole('button', { name: 'Send message' });
    expect(button).toBeDisabled();
  });

  it('enables send button when input has content', () => {
    render(<ChatInputForm {...defaultProps} input="Hello" />);
    
    const button = screen.getByRole('button', { name: 'Send message' });
    expect(button).toBeEnabled();
  });

  it('calls setInput when typing in textarea', async () => {
    const user = userEvent.setup();
    render(<ChatInputForm {...defaultProps} />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'test');
    
    expect(defaultProps.setInput).toHaveBeenCalled();
  });

  it('calls onSubmit when form is submitted', async () => {
    const user = userEvent.setup();
    render(<ChatInputForm {...defaultProps} input="test" />);
    
    const button = screen.getByRole('button', { name: 'Send message' });
    await user.click(button);
    
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it('calls setUseEnterToSend when checkbox is toggled', async () => {
    const user = userEvent.setup();
    render(<ChatInputForm {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(defaultProps.setUseEnterToSend).toHaveBeenCalled();
  });

  it('displays input value in textarea', () => {
    render(<ChatInputForm {...defaultProps} input="Test message" />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    expect(textarea).toHaveValue('Test message');
  });

  it('checkbox is checked when useEnterToSend is true', () => {
    render(<ChatInputForm {...defaultProps} useEnterToSend={true} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('checkbox is unchecked when useEnterToSend is false', () => {
    render(<ChatInputForm {...defaultProps} useEnterToSend={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });
});
