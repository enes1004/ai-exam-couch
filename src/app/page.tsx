'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatBubble, type Message } from './_components/ChatBubble';
import { TypingIndicator } from './_components/TypingIndicator';
import { WelcomeScreen } from './_components/WelcomeScreen';

const ASSISTANT_NAME = 'AI Exam Couch';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useEnterToSend, setUseEnterToSend] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Auto-resize textarea based on content
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If Enter is pressed
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

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'text') {
                  assistantMessage += data.content;
                  setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
                } else if (data.type === 'error') {
                  console.error('Stream error:', data.content);
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: "Oops, something went wrong on my end! Could you try sending that again? I promise I'll get it right this time." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSendMessage();
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 dark:bg-slate-900 p-4 md:p-8 lg:p-12">
      <div className="w-full max-w-3xl flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-4rem)] lg:h-[calc(100vh-6rem)]">
        {/* Header */}
        <header className="flex items-center gap-3 pb-6 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
            AI
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{ASSISTANT_NAME}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Your friendly study buddy
            </p>
          </div>
        </header>

        {/* Chat Container */}
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-8 md:px-8 md:py-10">
            {messages.length === 0 ? (
              <WelcomeScreen />
            ) : (
              <div className="flex flex-col gap-6">
                {messages.map((message, index) => (
                  <ChatBubble key={index} message={message} />
                ))}

                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <TypingIndicator />
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={sendMessage}
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
                {!useEnterToSend && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    (Shift+Enter to send)
                  </span>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="pt-4 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Powered by Anthropic Claude API
          </p>
        </footer>
      </div>
    </main>
  );
}
