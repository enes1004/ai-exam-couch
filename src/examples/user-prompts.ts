import { UserPromptWithType } from "@/types/user-prompt";
/*
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
  */

export const userPrompts: UserPromptWithType[] = [
    {
      problem: "あるお店でジャケットが販売されています。元の値段は8,000円で、まず20%割引され、その後さらにセール価格から10%割引されます。最終的な価格はいくらですか？",
      answer: "まず8,000円から20%割引するので、8,000 × 0.8 = 6,400円。次にセール価格から10%割引するので、6,400 × 0.9 = 5,760円。最終価格は5,760円です。",
      case_type: "correct",
    },
    {
      problem: "あるお店でジャケットが販売されています。元の値段は8,000円で、まず20%割引され、その後さらにセール価格から10%割引されます。最終的な価格はいくらですか？",
      answer: "20% + 10% = 30%の割引なので、8,000 × 0.7 = 5,600円。最終価格は5,600円です。",
      case_type: "wrong_reasoning",
    },
    {
      problem: "あるお店でジャケットが販売されています。元の値段は8,000円で、まず20%割引され、その後さらにセール価格から10%割引されます。最終的な価格はいくらですか？",
      answer: "まず8,000円から20%割引するので、8,000 × 0.8 = 6,400円。次に6,400円から10%割引するので、6,400 × 0.9 = 5,500円。最終価格は5,500円です。",
      case_type: "calculation_error",
    },
    {
      problem: "あるお店でジャケットが販売されています。元の値段は8,000円で、まず20%割引され、その後さらにセール価格から10%割引されます。最終的な価格はいくらですか？",
      answer: "まず8,000円から20%割引するので、8,000 × 0.8 = 6,400円。次に何をすればいいかわかりません。",
      case_type: "incomplete_reasoning",
    }
]