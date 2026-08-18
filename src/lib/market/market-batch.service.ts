export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  if (concurrency <= 0) {
    throw new Error(
      "Concurrency must be greater than zero."
    );
  }

  const results: R[] = new Array(items.length);

  let nextIndex = 0;

  async function runWorker() {
    while (true) {
      const currentIndex = nextIndex++;

      if (currentIndex >= items.length) {
        return;
      }

      results[currentIndex] =
        await worker(items[currentIndex]);
    }
  }

  const workerCount = Math.min(
    concurrency,
    items.length
  );

  await Promise.all(
    Array.from(
      { length: workerCount },
      () => runWorker()
    )
  );

  return results;
}