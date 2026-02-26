import { AvatarIcon } from './AvatarIcon';

const ASSISTANT_NAME = 'AI Exam Couch';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
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
