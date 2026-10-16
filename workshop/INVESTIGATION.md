# Investigation

Complete this note as you work. Record observations before explanations, and use actual paths, symbols, line numbers, and command results from your checkout.

## Observed behavior

- Reproduction command:
- Expected behavior and source of that expectation:
- Actual behavior:
- Relevant assertion or output:

## Repository area

- Likely owning package:
- Evidence for that choice:
- Other packages inspected and why:

## Relevant code

| Path and actual line | Symbol | What this location establishes |
| --- | --- | --- |
| | | |

Definitions and caller relationships confirmed in the editor:

## Constraints

- Preserve the public API, validation, and omitted-option behavior.
- Preserve successful-request behavior and final error propagation.
- Keep the fake transport and the reproduction's meaningful assertion.
- Keep changes focused; do not update dependencies or refactor unrelated code.

## Root cause hypothesis

Leave blank until you have gathered the evidence.

- Explanation connecting the input to the observed behavior:
- Supporting locations:
- Remaining uncertainty or competing explanation:

## Proposed modification points

Complete after checking the hypothesis.

- Expected modified files and reason for each:
- Focused regression coverage needed, if any:

## Verification

```bash
npm run test:repro
npm test
npm run typecheck
npm run demo
git status --short
git diff
git diff --check
```

Actual results after editing:

| Check | Observed result |
| --- | --- |
| Reproduction | |
| Full tests | |
| Typecheck | |
| Demo | |
| Status and diff review | |
| Whitespace check | |

Explain the final outcome in three sentences: what failed, where the behavior changed, and how the fix was verified.
