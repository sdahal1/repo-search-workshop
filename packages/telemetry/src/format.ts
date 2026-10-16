import type { ClientRequest } from "../../client/src/types.ts";

export function formatAttempt(attempt: number, request: ClientRequest): string {
  const detail = request.trace ? " [trace enabled]" : "";
  return `Attempt ${attempt}: ${request.label} ${request.path}${detail}`;
}
