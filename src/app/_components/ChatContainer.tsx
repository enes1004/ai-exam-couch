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
    handleSendMessage({resendLastMessage: true})
  }, []);


  const handleSendMessage = async ({resendLastMessage = false} = {}) => {
    if ((!input.trim() && !resendLastMessage) || isLoading) return;
    const lastMessage = messages?.[messages.length - 1];
    if(resendLastMessage && lastMessage?.role !== 'user') {
      return;
    }
    const newMessages = [...messages];

    if (!resendLastMessage) {
      const userMessage: Message = { 
        role: 'user', 
        content: input.trim()
      };
      newMessages.push(userMessage);
      setMessages(newMessages);
      setInput('');
    }
  
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
      if (!reader) {
        throw new Error('No reader available');
      }

      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.slice(6);
          try {
            const data = JSON.parse(dataStr);
            if (data.type === 'text') {
              assistantContent += data.content;
              setMessages([...newMessages, { role: 'assistant', content: assistantContent }]);
            } else if (data.type === 'error') {
              console.error('Stream error:', data.content);
            }
          } catch {
            // Ignore invalid JSON in stream
          }
        }
      }

      if (!assistantContent) {
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: "Oops, something went wrong on my end! Could you try sending that again? I promise I'll get it right this time." 
        }]);
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