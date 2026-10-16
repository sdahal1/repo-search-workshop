# Client options and request behavior

This document describes the public contract to preserve while investigating the workshop bug. It states intended behavior; use the reproduction to compare that contract with the current implementation.

## Create a client and send a request

`createClient(options)` accepts `ClientOptions` and returns a client with a `request(path: string)` method. A request uses the injected transport to perform the underlying operation for that path.

| Option | Type | Meaning |
| --- | --- | --- |
| `transport` | `Transport`, required | Local or external function that performs a request |
| `maxRetries` | `number`, optional | Additional attempts allowed after failure |
| `requestLabel` | `string`, optional | Label included in the transport request |
| `trace` | `boolean`, optional | Requests trace output |
| `verbose` | `boolean`, optional | Also enables trace output |

The workshop supplies local transport functions in its demo and tests. They can return a result or throw an error without using the network. This lets tests count calls and choose exactly when an operation succeeds or fails.

The transport receives a `ClientRequest` with `path`, `label`, and `trace` fields and returns a promise of a `ClientResponse` with `status: number` and `body: string`. The client returns the successful response object unchanged. Each retry uses the same request object as the initial attempt.

Inspect `packages/client/src/types.ts` for the complete TypeScript type definitions. Keep the public API intact during the exercise.

## Request metadata

An omitted or empty `requestLabel` produces the label `workshop-client`. A nonempty label is preserved. The request's `trace` field is true if either `trace` or `verbose` is true, and false otherwise.

These metadata behaviors are intentional. They provide nearby code to inspect while learning to distinguish similar syntax used for different purposes.

## Retry setting

`maxRetries` is optional. It counts **additional attempts after the initial request**.

| Setting | Intended meaning |
| --- | --- |
| `0` | Make the initial attempt and do not retry |
| `1` | Allow one additional attempt after failure |
| `2` | Allow two additional attempts after failure |
| Omitted or `undefined` | Use the default of two additional attempts |

When every attempt fails, total transport calls equal `1 + maxRetries`, using the default when the option is omitted.

When an attempt succeeds, return that result immediately. Do not use the remaining retry allowance after success. For example, a successful initial attempt makes one transport call even when retries are allowed.

If the retry allowance is exhausted, reject the request with the final transport error. The exercise retries all thrown transport errors; it does not classify errors by HTTP status or apply a production retry policy. Attempts do not sleep or use backoff.

## Valid input

An explicitly supplied retry setting must be a nonnegative safe integer. Zero is valid. `createClient` throws `RangeError` for negative numbers, fractions, `NaN`, infinity, and numbers outside the safe integer range before calling the transport. Runtime values such as `null`, strings, and booleans are also rejected; they are outside the option contract.

Runtime validation and TypeScript types serve different purposes. Types describe what TypeScript callers should supply; validation protects the runtime boundary. Preserve both during the investigation.

## Verification cases

With an always-failing local transport, the expected counts are:

| Input | Total calls |
| --- | ---: |
| `maxRetries: 0` | 1 |
| Option omitted | 3 |
| `maxRetries: 1` | 2 |

Also check immediate success, success after an allowed retry, final error propagation, and invalid-input handling. The supplied tests cover the intended behaviors; read them before deciding whether additional coverage is necessary.

## Reported discrepancy

The prepared report says that `maxRetries: 0` produces three calls with an always-failing transport. Reproduce it with:

```bash
npm run demo
npm run test:repro
```

The named regression test is `maxRetries: 0 makes one attempt`. Its expected count follows the contract above. Investigate the path from the public request API to the transport before proposing a change.
