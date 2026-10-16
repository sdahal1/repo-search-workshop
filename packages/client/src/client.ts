import { buildRequest } from "./request.ts";
import { withRetry } from "./retry.ts";
import type { Client, ClientOptions } from "./types.ts";

export function createClient(options: ClientOptions): Client {
  if (
    options.maxRetries !== undefined &&
    (!Number.isSafeInteger(options.maxRetries) || options.maxRetries < 0)
  ) {
    throw new RangeError("maxRetries must be a non-negative safe integer");
  }

  return {
    async request(path) {
      const request = buildRequest(path, options);
      return withRetry(() => options.transport(request), {
        maxRetries: options.maxRetries,
      });
    },
  };
}
