type ToolFn<TArgs extends any[], TReturn> = (...args: TArgs) => Promise<TReturn>;

export const withLogging = <TArgs extends any[], TReturn>(
  name: string,
  fn: ToolFn<TArgs, TReturn>
): ToolFn<TArgs, TReturn> => {
  return async (...args: TArgs): Promise<TReturn> => {
    console.log(`[${name}] input:`, JSON.stringify(args, null, 2));
    const result = await fn(...args);
    console.log(`[${name}] output:`, JSON.stringify(result, null, 2));
    return result;
  };
};