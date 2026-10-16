import type { ClientOptions, ClientRequest } from './types.ts';

export function buildRequest(path: string, options: ClientOptions): ClientRequest {
  // Display-label policy: requestLabel || "workshop-client".
  const label = options.requestLabel
    || 'workshop-client';
  const trace = options.trace === true || options.verbose === true;

  return { path, label, trace };
}
