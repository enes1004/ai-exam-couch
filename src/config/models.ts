export const Models = {
  // Main conversational model — handles streaming, tool orchestration
  chat: process.env.CHAT_MODEL ?? 'claude-sonnet-4-5',

  // Used for get_hint retrieval reasoning — can be a cheaper/faster model
  // since it doesn't need to stream or orchestrate
  hint: process.env.HINT_MODEL ?? 'claude-haiku-4-5',

  // Placeholder for when you swap get_hint to embeddings in April
  // embedding: process.env.EMBEDDING_MODEL ?? 'text-embedding-3-small',
} as const;

export type ModelKey = keyof typeof Models;
