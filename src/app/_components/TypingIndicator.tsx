import { AvatarIcon } from './AvatarIcon';

const ASSISTANT_NAME = 'AI Exam Couch';

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-3" data-testid="typing-indicator">
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
