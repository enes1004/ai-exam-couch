import { UserPromptWithType } from "@/types/user-prompt";

export const userPrompts: UserPromptWithType[] = [
    {
      problem: "A store is selling a jacket originally priced at ¥8,000. It is first discounted by 20%, then an additional 10% off the sale price. What is the final price?",
      answer: "First I took 20% off ¥8,000, so ¥8,000 × 0.8 = ¥6,400. Then 10% off the sale price, so ¥6,400 × 0.9 = ¥5,760. Final price is ¥5,760.",
      case_type: "correct",
    },
    {
      problem: "A store is selling a jacket originally priced at ¥8,000. It is first discounted by 20%, then an additional 10% off the sale price. What is the final price?",
      answer : "20% + 10% = 30% total discount. So ¥8,000 × 0.7 = ¥5,600. Final price is ¥5,600.",
      case_type: "wrong_reasoning",
    },
    {
      problem: "A store is selling a jacket originally priced at ¥8,000. It is first discounted by 20%, then an additional 10% off the sale price. What is the final price?",
      answer : "First I took 20% off ¥8,000, so ¥8,000 × 0.8 = ¥6,400. Then 10% off ¥6,400, so ¥6,400 × 0.9 = ¥5,500. Final price is ¥5,500.",
      case_type: "calculation_error",
    },
    {
      problem: "A store is selling a jacket originally priced at ¥8,000. It is first discounted by 20%, then an additional 10% off the sale price. What is the final price?",
      answer : "First I took 20% off ¥8,000, so ¥8,000 × 0.8 = ¥6,400. I don't know what to do next.",
      case_type: "incomplete_reasoning",
    }
]