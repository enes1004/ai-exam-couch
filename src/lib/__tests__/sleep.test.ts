import { sleep, backoff } from '../sleep';

describe('sleep', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns a Promise', () => {
    const result = sleep(100);
    expect(result).toBeInstanceOf(Promise);
  });

  it('resolves after the specified milliseconds', async () => {
    const promise = sleep(500);

    jest.advanceTimersByTime(499);
    // Should still be pending
    let resolved = false;
    promise.then(() => { resolved = true; });
    await Promise.resolve(); // flush microtasks
    expect(resolved).toBe(false);

    jest.advanceTimersByTime(1);
    await promise;
    expect(resolved).toBe(true);
  });

  it('resolves immediately when ms is 0', async () => {
    const promise = sleep(0);
    jest.advanceTimersByTime(0);
    await promise;
  });
});

describe('backoff', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns a Promise', () => {
    const result = backoff(0);
    expect(result).toBeInstanceOf(Promise);
  });

  it('waits 1000ms for attempt 0 (2^0 = 1)', async () => {
    const promise = backoff(0);
    jest.advanceTimersByTime(999);
    let resolved = false;
    promise.then(() => { resolved = true; });
    await Promise.resolve();
    expect(resolved).toBe(false);

    jest.advanceTimersByTime(1);
    await promise;
    expect(resolved).toBe(true);
  });

  it('waits 2000ms for attempt 1 (2^1 = 2)', async () => {
    const promise = backoff(1);
    jest.advanceTimersByTime(1999);
    let resolved = false;
    promise.then(() => { resolved = true; });
    await Promise.resolve();
    expect(resolved).toBe(false);

    jest.advanceTimersByTime(1);
    await promise;
    expect(resolved).toBe(true);
  });

  it('waits 4000ms for attempt 2 (2^2 = 4)', async () => {
    const promise = backoff(2);
    jest.advanceTimersByTime(3999);
    let resolved = false;
    promise.then(() => { resolved = true; });
    await Promise.resolve();
    expect(resolved).toBe(false);

    jest.advanceTimersByTime(1);
    await promise;
    expect(resolved).toBe(true);
  });
});
