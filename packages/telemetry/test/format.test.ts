import assert from "node:assert/strict";
import test from "node:test";
import { formatAttempt } from "../src/format.ts";

test("attempt output includes the request identity and optional trace state", () => {
  const request = { path: "/inventory/widget", label: "demo", trace: false };
  assert.equal(formatAttempt(1, request), "Attempt 1: demo /inventory/widget");
  assert.equal(
    formatAttempt(2, { ...request, trace: true }),
    "Attempt 2: demo /inventory/widget [trace enabled]",
  );
  assert.deepEqual(request, {
    path: "/inventory/widget",
    label: "demo",
    trace: false,
  });
});
