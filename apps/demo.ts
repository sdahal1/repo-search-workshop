import { createClient } from "../packages/client/src/client.ts";
import { formatAttempt } from "../packages/telemetry/src/format.ts";

const failure = new Error("Simulated transport failure");
let transportCalls = 0;

const client = createClient({
  maxRetries: 0,
  requestLabel: "demo-client",
  async transport(request) {
    transportCalls += 1;
    console.log(formatAttempt(transportCalls, request));
    throw failure;
  },
});

console.log("Configuration: maxRetries = 0");
let rejected = false;
try {
  await client.request("/inventory/widget");
} catch (error) {
  if (error !== failure) throw error;
  rejected = true;
  console.log(`Request rejected: ${failure.message}`);
}
if (!rejected) throw new Error("The failing transport unexpectedly resolved");

console.log("Expected transport calls: 1");
console.log(`Actual transport calls: ${transportCalls}`);
console.log(
  transportCalls === 1
    ? "Observation: request count matches the contract."
    : "Observation: request count differs from the contract.",
);
console.log("Use npm run test:repro to check this behavior with an assertion.");
