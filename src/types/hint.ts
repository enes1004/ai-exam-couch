const HINT_TYPES = ['incorrect_reasoning', 'next_step', 'calculation_error'] as const;

export type HintType = typeof HINT_TYPES[number];

export type Hint = {
    type: HintType;
    message: string;
}

export const isHint = (obj: any): obj is Hint => {
    return obj && HINT_TYPES.includes(obj.type) && typeof obj.message === 'string';
}