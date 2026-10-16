import type { ClientOptions } from "./types.ts";

const DEFAULT_MAX_RETRIES = 2;

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Pick<ClientOptions, "maxRetries">,
): Promise<T> {
  const retries = options.maxRetries || DEFAULT_MAX_RETRIES;
  let retriesUsed = 0;

  for (;;) {
    try {
      return await operation();
    } catch (error) {
      if (retriesUsed >= retries) {
        throw error;
      }
      retriesUsed += 1;
    }
  }
}
