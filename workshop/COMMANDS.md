# Workshop commands and prompts

Run these commands from the repository root in a Bash-compatible terminal. Use the setup in [the README](../README.md) first. This sheet provides the investigation sequence without revealing the diagnosis or implementation change.

The text prompts work with an assistant that can read files, run commands, and edit code. Use your editor for definition and reference navigation; direct assistant access to a language server is optional.

## Setup

For the supplied local repository:

```bash
node --version
npm --version
rg --version
npm ci
npx --no-install ast-grep --version
git status --short
```

Expected versions: Node 24 and ast-grep 0.51.0. A fresh starter has no status output. If you need ripgrep on a Mac with Homebrew:

```bash
brew install ripgrep
```

To create an exercise branch from your current starter checkout, run once:

```bash
git switch -c workshop/my-investigation
```

### Future remote setup

The remote URL is not published yet. The following block is for the published version of the workshop. Replace both uppercase placeholders with the actual URL and full starter commit before running it; use the local setup above for the supplied files.

```bash
git clone STARTER_REPO_URL repo-search-workshop
cd repo-search-workshop
git checkout --detach STARTER_COMMIT
git switch -c workshop/my-investigation
```

## 1 Show the failure

```bash
npm run demo
npm run test:repro
```

**Checkpoint:** Record the expected and actual call counts. The focused test should fail an assertion on the starter. A command-not-found error is a setup problem.

Read the test named `maxRetries: 0 makes one attempt` in `packages/client/test/client.test.ts`. Confirm that it exercises the public client API and counts transport calls.

## 2 Map the repository

```bash
git ls-files
git ls-files 'README*' '*package.json' '*tsconfig*.json'
git ls-files 'packages/client/*'
```

Open `README.md`, the root `package.json`, `packages/client/package.json`, and `docs/client-options.md`.

```text
Map this repository using its tracked file paths, README, package
manifests, and docs/client-options.md. Do not edit files.

Identify the package most likely to own the reported retry behavior.
Explain your choice using paths and documented responsibilities.
Do not read every implementation file yet.
```

**Checkpoint:** Name the likely owning package and give evidence for your choice in `workshop/INVESTIGATION.md`.

## 3 Search by text

```bash
rg -n -F 'maxRetries' packages/client docs/client-options.md
rg -n -C 3 -F 'maxRetries' packages/client/src
```

`-n` includes line numbers, `-F` searches literal text, and `-C 3` includes surrounding lines.

**Checkpoint:** Classify relevant matches as definitions, callers, implementations, tests, or documentation. Open the enclosing function when a matching line does not provide enough context.

## 4 Search by structure

Compare a literal operator search with an AST query:

```bash
rg -n -F '||' packages/client/src
```

```bash
npx --no-install ast-grep run --lang ts \
  --pattern '$VALUE || $FALLBACK' packages/client/src
```

Leave `$VALUE` and `$FALLBACK` in the command. They are metavariables that match syntax nodes. Single quotes prevent the shell from expanding the dollar-sign names.

Narrow the shape to a property name:

```bash
npx --no-install ast-grep run --lang ts \
  --pattern '$OPTIONS.maxRetries || $FALLBACK' packages/client/src
```

Repeat the broad query from the prepared rule:

```bash
npx --no-install ast-grep scan \
  --rule workshop/defaulting.yml packages/client/src
```

**Checkpoint:** Explain why the results differ from text search. The source includes ordinary OR expressions and text mentions for comparison. A structural match identifies syntax, not necessarily a bug. Inspect the surrounding code and the documented intent before judging a match. These commands do not rewrite files.

## 5 Follow symbols in the editor

1. Open the reproduction test and use **Go to Definition** on `createClient`.
2. In `packages/client/src/client.ts`, inspect the request method and find its call to `withRetry`.
3. Use **Go to Definition** on `withRetry`.
4. At the definition, use **Find References** and inspect useful callers.
5. Inspect `ClientOptions` in `packages/client/src/types.ts` and compare it with the documented contract.

**Checkpoint:** Record the actual caller and callee symbols and locations. Check how the option travels between them. A reference can be an import or declaration as well as a call, so inspect it before recording a relationship.

Editors may provide these actions through LSP or their own language-service integration. There is no universal `lsp` terminal command to run.

## 6 Gather the evidence

Complete `workshop/INVESTIGATION.md`. Include the reproduction, contract, likely owner, relevant paths and symbols, confirmed relationships, and constraints. Leave the hypothesis section empty until the evidence supports an explanation.

**Checkpoint:** Another reader should be able to reproduce the failure and locate the relevant code from your note. Keep observations separate from interpretations.

## 7 Explain before editing

```text
Read workshop/INVESTIGATION.md. Do not edit files.

Inspect the referenced code and explain the failing behavior.
If evidence is missing, identify the next focused lookup needed.

Return:
- Your root-cause hypothesis.
- Supporting paths, symbols, and actual line numbers.
- Any uncertainty or competing explanation.
- The smallest proposed change and expected modified files.
- Tests that distinguish a correct fix from a partial fix.

Stop before editing.
```

**Checkpoint:** Check that the explanation connects the configured input, the relevant transformations, and the observed number of calls. Verify each supporting location before updating your hypothesis. If the evidence is incomplete, perform the proposed focused lookup.

## 8 Edit and verify

After checking the explanation:

```text
Apply the smallest change supported by our investigation.
Preserve the public API and default retry behavior.
Keep the reproduction's original assertion intact.
Add focused regression coverage only where it is missing.
Do not refactor unrelated code or update dependencies.
Do not stage or commit the changes.
Run the verification commands in workshop/INVESTIGATION.md.
Report the modified files and actual results, including failures.
```

Run the checks yourself if the assistant has not run them:

```bash
npm run test:repro
npm test
npm run typecheck
npm run demo
git status --short
git diff
git diff --check
```

**Checkpoint:** After a correct fix, the reproduction and full test suite pass, typechecking passes, and the demo reports one call for zero retries. Confirm omitted and positive retry settings, successful requests, validation, and error propagation still follow the contract.

Inspect every changed file. `git diff` shows unstaged tracked changes; inspect untracked files reported by `git status` separately. If you staged changes, also use:

```bash
git diff --cached
git diff --cached --check
```

Tests check behavior, typechecking checks compatible types, and diff review checks the meaning and scope of the edits. `git diff --check` checks whitespace errors; a quiet result does not establish correctness.
