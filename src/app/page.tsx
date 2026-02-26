'use client';

import { useState, useRef, useEffect } from 'react';

const ASSISTANT_NAME = 'AI Exam Couch';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function AvatarIcon({ role }: { role: 'user' | 'assistant' }) {
  if (role === 'assistant') {
    return (
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
        AI
      </div>
    );
  }
  return (
    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </div>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <AvatarIcon role={message.role} />
      <div className="flex flex-col gap-1 max-w-[75%]">
        <span className={`text-xs font-medium text-slate-400 ${isUser ? 'text-right' : 'text-left'}`}>
          {isUser ? 'You' : ASSISTANT_NAME}
        </span>
        <div
          className={`rounded-2xl px-4 py-2 text-[15px] leading-relaxed shadow-sm ${
            isUser
              ? 'bg-teal-600 text-white rounded-br-md'
              : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-md border border-slate-100 dark:border-slate-600'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <AvatarIcon role="assistant" />
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-slate-400">{ASSISTANT_NAME}</span>
        <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-md px-7 py-5 shadow-sm border border-slate-100 dark:border-slate-600">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-16">
      <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-white text-2xl font-bold shadow-md mb-6">
        AI
      </div>
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-3 text-balance">
        Hey there! Ready to study?
      </h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed text-balance">
        {"I'm your personal exam tutor. Ask me a question, throw a tricky topic at me, or just say hi — I'm here to help you ace it!"}
      </p>
      <div className="flex flex-wrap justify-center gap-2 mt-8">
        {['Explain recursion', 'Quiz me on React', 'What is Big-O?'].map((suggestion) => (
          <span
            key={suggestion}
            className="px-4 py-2 text-sm rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
          >
            {suggestion}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
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
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                disabled={isLoading}
                aria-label="Chat message input"
                className="flex-1 px-5 py-3.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50 transition-all text-[15px]"
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
