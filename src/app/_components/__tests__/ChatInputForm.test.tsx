import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInputForm } from '../ChatInputForm';
import { createRef } from 'react';

describe('ChatInputForm', () => {
  const defaultProps = {
    input: '',
    setInput: jest.fn(),
    isLoading: false,
    textareaRef: createRef<HTMLTextAreaElement>(),
    handleSendMessage: jest.fn(),
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
    render(<ChatInputForm {...defaultProps} />);
    
    expect(screen.getByText('(Shift+Enter or Ctrl/Cmd+Enter to send)')).toBeVisible();
  });

  it('displays different hint text when useEnterToSend is true', async () => {
    const user = userEvent.setup();
    render(<ChatInputForm {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(screen.getByText('(Ctrl/Cmd+Enter also works)')).toBeVisible();
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

  it('calls onSubmit when form is submitted', () => {
    const handleSendMessage = jest.fn();
    const { container } = render(<ChatInputForm {...defaultProps} input="test" handleSendMessage={handleSendMessage} />);
    
    const form = container.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }
    
    expect(handleSendMessage).toHaveBeenCalled();
  });

  it('calls setUseEnterToSend when checkbox is toggled', async () => {
    const user = userEvent.setup();
    render(<ChatInputForm {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    
    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('displays input value in textarea', () => {
    render(<ChatInputForm {...defaultProps} input="Test message" />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    expect(textarea).toHaveValue('Test message');
  });

  it('checkbox is checked when useEnterToSend is true', async () => {
    const user = userEvent.setup();
    render(<ChatInputForm {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    expect(checkbox).toBeChecked();
  });

  it('checkbox is unchecked when useEnterToSend is false', () => {
    render(<ChatInputForm {...defaultProps} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('sends message on Ctrl+Enter regardless of checkbox state', () => {
    const handleSendMessage = jest.fn();
    render(<ChatInputForm {...defaultProps} input="test" handleSendMessage={handleSendMessage} />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });
    
    expect(handleSendMessage).toHaveBeenCalled();
  });

  it('sends message on Cmd+Enter regardless of checkbox state', () => {
    const handleSendMessage = jest.fn();
    render(<ChatInputForm {...defaultProps} input="test" handleSendMessage={handleSendMessage} />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.keyDown(textarea, { key: 'Enter', metaKey: true });
    
    expect(handleSendMessage).toHaveBeenCalled();
  });

  it('sends message on Shift+Enter when useEnterToSend is false', () => {
    const handleSendMessage = jest.fn();
    render(<ChatInputForm {...defaultProps} input="test" handleSendMessage={handleSendMessage} />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    
    expect(handleSendMessage).toHaveBeenCalled();
  });

  it('sends message on Enter when useEnterToSend is true', async () => {
    const user = userEvent.setup();
    const handleSendMessage = jest.fn();
    render(<ChatInputForm {...defaultProps} input="test" handleSendMessage={handleSendMessage} />);
    
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    expect(handleSendMessage).toHaveBeenCalled();
  });

  it('does not send on plain Enter when useEnterToSend is false', () => {
    const handleSendMessage = jest.fn();
    render(<ChatInputForm {...defaultProps} input="test" handleSendMessage={handleSendMessage} />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    
    expect(handleSendMessage).not.toHaveBeenCalled();
  });
});
