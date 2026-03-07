export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
export const backoff = (attempt: number): Promise<void> => sleep(1000 * (2 ** attempt));
