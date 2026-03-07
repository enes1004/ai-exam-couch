import { withLogging } from '../with-logging';

describe('withLogging', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls the wrapped function with the same arguments', async () => {
    const fn = jest.fn().mockResolvedValue('result');
    const wrapped = withLogging('test', fn);

    await wrapped('arg1', 'arg2');

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('returns the result of the wrapped function', async () => {
    const fn = jest.fn().mockResolvedValue('expected result');
    const wrapped = withLogging('test', fn);

    const result = await wrapped();

    expect(result).toBe('expected result');
  });

  it('logs input and output with the given name', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const fn = jest.fn().mockResolvedValue({ value: 42 });
    const wrapped = withLogging('myTool', fn);

    await wrapped({ input: 'data' });

    expect(consoleSpy).toHaveBeenCalledWith(
      '[myTool] input:',
      expect.stringContaining('"input": "data"')
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      '[myTool] output:',
      expect.stringContaining('"value": 42')
    );

    consoleSpy.mockRestore();
  });

  it('rethrows errors from the wrapped function', async () => {
    const error = new Error('something went wrong');
    const fn = jest.fn().mockRejectedValue(error);
    const wrapped = withLogging('test', fn);

    await expect(wrapped()).rejects.toThrow('something went wrong');
  });

  it('logs errors when the wrapped function throws', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('tool error');
    const fn = jest.fn().mockRejectedValue(error);
    const wrapped = withLogging('failingTool', fn);

    await expect(wrapped()).rejects.toThrow();

    expect(consoleSpy).toHaveBeenCalledWith('[failingTool] error:', error);

    consoleSpy.mockRestore();
  });

  it('works with functions that take no arguments', async () => {
    const fn = jest.fn().mockResolvedValue('no-args result');
    const wrapped = withLogging('noArgs', fn);

    const result = await wrapped();

    expect(result).toBe('no-args result');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('preserves the return type', async () => {
    const fn = jest.fn().mockResolvedValue({ problem: 'test', steps: [], originalAnswer: '0' });
    const wrapped = withLogging('typed', fn);

    const result = await wrapped();

    expect(result).toEqual({ problem: 'test', steps: [], originalAnswer: '0' });
  });
});
