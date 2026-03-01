'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { WelcomeScreen } from './WelcomeScreen';
import { ChatInputForm } from './ChatInputForm';
import { Message } from '@/types/message';



export default function ChatContainer({
    initialMessages,
}: {
    initialMessages?: Message[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  useEffect(() => {
    if(initialMessages && initialMessages.length > 0) {
      if(initialMessages[initialMessages.length - 1].role === 'assistant') {
        return;
      }
      // simulate loading state for initial messages
      setIsLoading(true);
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 1000); // 1 second loading simulation
      handleSendMessage(); // trigger the message sending logic to process initial messages
      return () => clearTimeout(timeout);
    }
  }, [initialMessages]);

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

    return (
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
                <ChatInputForm
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                textareaRef={textareaRef}
                handleSendMessage={handleSendMessage}
                />
            </div>
    );
}