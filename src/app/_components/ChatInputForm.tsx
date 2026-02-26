import { useState } from 'react';

interface ChatInputFormProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  handleSendMessage: () => void;
}

export function ChatInputForm({
  input,
  setInput,
  isLoading,
  textareaRef,
  handleSendMessage,
}: ChatInputFormProps) {
  const [useEnterToSend, setUseEnterToSend] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Always send on Ctrl+Enter (Windows/Linux) or Cmd+Enter (Mac)
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSendMessage();
      return;
    }

    // If Enter is pressed (without Ctrl/Cmd)
    if (e.key === 'Enter') {
      // If useEnterToSend is true and Shift is not pressed, send message
      // If useEnterToSend is false and Shift is pressed, send message
      const shouldSend = useEnterToSend ? !e.shiftKey : e.shiftKey;
      
      if (shouldSend) {
        e.preventDefault();
        handleSendMessage();
      }
      // Otherwise, allow default behavior (newline)
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-5 py-4 md:px-6 md:py-5"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything..."
            disabled={isLoading}
            rows={1}
            aria-label="Chat message input"
            className="flex-1 px-5 py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 transition-all text-[15px] resize-none overflow-hidden"
            style={{ minHeight: '48px', maxHeight: '200px' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-teal-600 text-white rounded-xl hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 px-1">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={useEnterToSend}
              onChange={(e) => setUseEnterToSend(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500 focus:ring-2 cursor-pointer"
            />
            <span>Use Enter to send</span>
          </label>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {useEnterToSend ? '(Ctrl/Cmd+Enter also works)' : '(Shift+Enter or Ctrl/Cmd+Enter to send)'}
          </span>
        </div>
      </div>
    </form>
  );
}
