export async function processWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>,
): Promise<void> {
  const tasks = items.map((item) => () => worker(item));
  async function runWorker() {
    while (tasks.length) {
      const job = tasks.shift();
      if (job) await job();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, runWorker),
  );
}
