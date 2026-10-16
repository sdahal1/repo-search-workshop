import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "../src/client.ts";
import type {
  ClientOptions,
  ClientRequest,
  ClientResponse,
  Transport,
} from "../src/types.ts";

const path = "/inventory/widget";

function alwaysFails() {
  let calls = 0;
  const error = new Error("Simulated transport failure");
  const transport: Transport = async () => {
    calls += 1;
    throw error;
  };
  return {
    transport,
    error,
    get calls() {
      return calls;
    },
  };
}

test("maxRetries: 0 makes one attempt", async () => {
  const fake = alwaysFails();
  const client = createClient({ transport: fake.transport, maxRetries: 0 });

  await assert.rejects(client.request(path), (error) => error === fake.error);
  assert.equal(
    fake.calls,
    1,
    "zero retries must allow only the initial attempt",
  );
});

test("omitting maxRetries allows the default two retries", async () => {
  const fake = alwaysFails();
  const client = createClient({ transport: fake.transport });

  await assert.rejects(client.request(path), (error) => error === fake.error);
  assert.equal(fake.calls, 3);
});

test("maxRetries: 1 allows one additional attempt", async () => {
  const fake = alwaysFails();
  const client = createClient({ transport: fake.transport, maxRetries: 1 });

  await assert.rejects(client.request(path), (error) => error === fake.error);
  assert.equal(fake.calls, 2);
});

test("first-attempt success returns immediately for valid retry limits", async () => {
  for (const maxRetries of [undefined, 0, 1, 5]) {
    let calls = 0;
    const response: ClientResponse = { status: 200, body: "in stock" };
    const client = createClient({
      maxRetries,
      async transport() {
        calls += 1;
        return response;
      },
    });

    assert.strictEqual(await client.request(path), response);
    assert.equal(calls, 1);
  }
});

test("a later success stops retrying and returns the same response", async () => {
  let calls = 0;
  const response: ClientResponse = { status: 200, body: "recovered" };
  const client = createClient({
    maxRetries: 3,
    async transport() {
      calls += 1;
      if (calls === 1) throw new Error("Transient failure");
      return response;
    },
  });

  assert.strictEqual(await client.request(path), response);
  assert.equal(calls, 2);
});

test("exhausting retries preserves the last transport error object", async () => {
  const errors = [new Error("first"), new Error("last")];
  let calls = 0;
  const client = createClient({
    maxRetries: 1,
    async transport() {
      throw errors[calls++];
    },
  });

  await assert.rejects(client.request(path), (error) => error === errors[1]);
  assert.equal(calls, 2);
});

test("every attempt receives the original path and same request object", async () => {
  const requests: ClientRequest[] = [];
  const failure = new Error("Unavailable");
  const options: ClientOptions = {
    maxRetries: 1,
    requestLabel: "inventory",
    trace: false,
    verbose: true,
    async transport(request) {
      requests.push(request);
      throw failure;
    },
  };
  const client = createClient(options);

  await assert.rejects(client.request(path), (error) => error === failure);
  assert.equal(requests.length, 2);
  assert.deepEqual(requests[0], { path, label: "inventory", trace: true });
  assert.strictEqual(requests[0], requests[1]);
  assert.equal(options.maxRetries, 1);
});

test("either trace or verbose enables request tracing", async () => {
  for (const [trace, verbose, expected] of [
    [false, false, false],
    [false, true, true],
    [true, false, true],
    [true, true, true],
  ] as const) {
    let observed: ClientRequest | undefined;
    const client = createClient({
      trace,
      verbose,
      async transport(request) {
        observed = request;
        return { status: 200, body: "ok" };
      },
    });

    await client.request(path);
    assert.equal(observed?.trace, expected);
  }
});

test("empty and omitted display labels use the default; nonempty labels survive", async () => {
  for (const [requestLabel, expected] of [
    [undefined, "workshop-client"],
    ["", "workshop-client"],
    ["inventory", "inventory"],
  ] as const) {
    let observed: ClientRequest | undefined;
    const client = createClient({
      requestLabel,
      async transport(request) {
        observed = request;
        return { status: 200, body: "ok" };
      },
    });

    await client.request(path);
    assert.equal(observed?.label, expected);
  }
});

test("invalid retry counts are rejected before any transport call", () => {
  // Casts model untyped callers; these inputs are not valid ClientOptions values.
  const invalidValues: unknown[] = [
    -1,
    0.5,
    NaN,
    Infinity,
    -Infinity,
    Number.MAX_SAFE_INTEGER + 1,
    null,
    false,
    "0",
  ];
  for (const value of invalidValues) {
    let calls = 0;
    assert.throws(
      () =>
        createClient({
          maxRetries: value as number,
          async transport() {
            calls += 1;
            return { status: 200, body: "ok" };
          },
        }),
      {
        name: "RangeError",
        message: "maxRetries must be a non-negative safe integer",
      },
    );
    assert.equal(calls, 0);
  }
});
