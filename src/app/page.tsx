import ChatContainer from "./_components/ChatContainer";
const ASSISTANT_NAME = 'AI Exam Couch';

export default function Home() {
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

        <ChatContainer/>

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
