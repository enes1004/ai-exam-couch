export type UserPrompt = {
  problem: string;
  answer: string;
};

export type UserPromptWithType = UserPrompt & {
  case_type: "correct" | "wrong_reasoning" | "incomplete_reasoning" | "calculation_error";
};



