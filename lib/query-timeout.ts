/**
 * Wraps a promise with a timeout to prevent slow queries from blocking page render
 * Falls back to a default value if query exceeds timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 5000,
  fallback: T
): Promise<T> {
  try {
    const timeoutPromise = new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Query timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    );

    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    console.warn(`Query timeout error:`, error);
    return fallback;
  }
}
