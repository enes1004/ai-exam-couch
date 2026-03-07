'use client';
import { userPrompts } from "@/examples/user-prompts";
import ChatContainer from "../_components/ChatContainer";
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
              Demonstrating user prompts
            </p>
          </div>
        </header>
        {
            userPrompts.map((prompt, index) => (
                <div key={index} className="mb-6 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                    <h2 className="text-lg font-semibold mb-2">Prompt #{index + 1}</h2>
                    <ChatContainer initialMessages={[{ role: 'user', content: 
                    `
                    I want you to check for any mistakes in my reasoning steps and give me feedback on how to improve. Here are my reasoning steps:
                    ${prompt.problem}
                    ${prompt.answer}
                    ` }]} />
                </div>
            ))
        }
        </div>
    </main>
  );
}
