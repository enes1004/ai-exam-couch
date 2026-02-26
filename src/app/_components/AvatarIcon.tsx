interface AvatarIconProps {
  role: 'user' | 'assistant';
}

export function AvatarIcon({ role }: AvatarIconProps) {
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
