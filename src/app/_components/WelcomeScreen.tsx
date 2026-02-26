export function WelcomeScreen() {
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
