import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatContainer from '../ChatContainer';
import { Message } from '@/types/message';

// Mock fetch globally
global.fetch = jest.fn();

describe('ChatContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders WelcomeScreen when there are no messages', () => {
    render(<ChatContainer />);
    
    // WelcomeScreen should be visible
    expect(screen.getByText(/Ready to study/i)).toBeInTheDocument();
  });

  it('renders messages when initialMessages are provided', () => {
    const initialMessages: Message[] = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ];

    render(<ChatContainer initialMessages={initialMessages} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('renders ChatInputForm component', () => {
    render(<ChatContainer />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    expect(textarea).toBeInTheDocument();
    
    const button = screen.getByRole('button', { name: 'Send message' });
    expect(button).toBeInTheDocument();
  });

  it('disables send button when input is empty', () => {
    render(<ChatContainer />);
    
    const button = screen.getByRole('button', { name: 'Send message' });
    expect(button).toBeDisabled();
  });

  it('enables send button when input has content', async () => {
    const user = userEvent.setup();
    render(<ChatContainer />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Hello');
    
    const button = screen.getByRole('button', { name: 'Send message' });
    expect(button).toBeEnabled();
  });

  it('adds user message to chat when form is submitted', async () => {
    const user = userEvent.setup();
    
    // Mock successful JSON response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ content: 'Response' }),
    });

    render(<ChatContainer />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Test message');
    
    const button = screen.getByRole('button', { name: 'Send message' });
    await user.click(button);
    
    // User message should appear
    await waitFor(() => {
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });
  });

  it('shows loading indicator while waiting for response', async () => {
    const user = userEvent.setup();
    
    // Mock delayed JSON response so the typing indicator is visible
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ content: 'Response' }), 100))),
    });

    render(<ChatContainer />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Test');
    
    const button = screen.getByRole('button', { name: 'Send message' });
    await user.click(button);
    
    // TypingIndicator should appear
    await waitFor(() => {
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    });
  });

  it('displays assistant response', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ content: 'Hello World' }),
    });

    render(<ChatContainer />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Test');
    
    const button = screen.getByRole('button', { name: 'Send message' });
    await user.click(button);
    
    // Wait for response to be displayed
    await waitFor(() => {
      expect(screen.getByText(/Hello World/)).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    render(<ChatContainer />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Test');
    
    const button = screen.getByRole('button', { name: 'Send message' });
    await user.click(button);
    
    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText(/Oops, something went wrong/)).toBeInTheDocument();
    });
  });

  it('handles non-ok response gracefully', async () => {
    const user = userEvent.setup();
    
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
    });

    render(<ChatContainer />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Test');
    
    const button = screen.getByRole('button', { name: 'Send message' });
    await user.click(button);
    
    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText(/Oops, something went wrong/)).toBeInTheDocument();
    });
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();
    
    // Mock successful JSON response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ content: 'OK' }),
    });

    render(<ChatContainer />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Test message');
    
    expect(textarea).toHaveValue('Test message');
    
    const button = screen.getByRole('button', { name: 'Send message' });
    await user.click(button);
    
    // Input should be cleared
    await waitFor(() => {
      expect(textarea).toHaveValue('');
    });
  });

  it('disables input while loading', async () => {
    const user = userEvent.setup();
    
    // Mock delayed JSON response so isLoading stays true long enough
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ content: 'Response' }), 100))),
    });

    render(<ChatContainer />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Test');
    
    const button = screen.getByRole('button', { name: 'Send message' });
    await user.click(button);
    
    // Textarea should be disabled while loading
    await waitFor(() => {
      expect(textarea).toBeDisabled();
    });
  });

  it('prevents sending empty messages', async () => {
    const user = userEvent.setup();
    render(<ChatContainer />);
    
    const button = screen.getByRole('button', { name: 'Send message' });
    
    // Button should be disabled when input is empty
    expect(button).toBeDisabled();
    
    // Try to submit anyway (though button is disabled)
    await user.click(button);
    
    // Fetch should not be called
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('handles server-side error in response', async () => {
    const user = userEvent.setup();
    
    // Server returns a JSON error field
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ error: 'Server error' }),
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<ChatContainer />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Test');
    
    const button = screen.getByRole('button', { name: 'Send message' });
    await user.click(button);
    
    // Error message should appear
    await waitFor(() => {
      expect(screen.getByText(/Oops, something went wrong/)).toBeInTheDocument();
    });

    // Error should be logged
    expect(consoleSpy).toHaveBeenCalledWith('Error sending message:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('handles json parse failure gracefully', async () => {
    const user = userEvent.setup();
    
    // json() throws a parse error
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockRejectedValue(new Error('Failed to parse JSON')),
    });

    render(<ChatContainer />);
    
    const textarea = screen.getByPlaceholderText('Ask me anything...');
    await user.type(textarea, 'Test');
    
    const button = screen.getByRole('button', { name: 'Send message' });
    await user.click(button);
    
    // Error message should appear when json parsing fails
    await waitFor(() => {
      expect(screen.getByText(/Oops, something went wrong/)).toBeInTheDocument();
    });
  });
});
