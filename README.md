# Map First Read Less workshop starter

Investigate one prepared TypeScript bug using repository mapping, text search, structural search, symbol navigation, and a coding assistant of your choice.

**Bug report:** A client configured with `maxRetries: 0` makes three transport calls when every request fails. The documented behavior is one initial call with no retries.

This small project is a teaching exercise with an intentional regression. Its injected transport runs locally; the demo and tests do not contact a real service or wait between attempts. No AWS account or credentials are required.

## What you will practice

- Locate the part of a repository that owns a behavior.
- Use ripgrep for known text and ast-grep for code shapes.
- Follow definitions and references with your editor's TypeScript tooling.
- Keep observations and hypotheses separate in an investigation note.
- Ask a coding assistant for an explanation before editing.
- Verify a narrow change with tests, typechecking, and a Git diff.

Use Kiro, Codex, Claude Code, or another assistant that can read the project, run shell commands, and edit files. The workflow does not depend on a particular model or assistant configuration file. You can also complete the exercise manually.

## Prepare before the session

Install:

- Git.
- [Node.js 24 and npm](https://nodejs.org/en/download).
- [ripgrep](https://github.com/BurntSushi/ripgrep#installation).
- An editor with TypeScript **Go to Definition** and **Find References** actions.

Complete your chosen assistant's sign-in before the workshop. Use a Bash-compatible shell on macOS or Linux, or WSL on Windows. For macOS with Homebrew, install ripgrep with:

```bash
brew install ripgrep
```

Open a terminal in this supplied repository folder. If your terminal is in its parent folder, enter it first:

```bash
cd repo-search-workshop
```

Run the following from the repository root:

```bash
node --version
npm --version
rg --version
npm ci
npx --no-install ast-grep --version
git status --short
```

Expected setup: Node reports version 24, ast-grep reports 0.51.0, and a fresh starter checkout has no output from `git status --short`. The project installs its pinned ast-grep executable as a development dependency. `npm ci` uses the committed dependency lockfile.

If npm offers to download a package during an `npx` command, stop and check that `npm ci` succeeded and that your terminal is at the repository root.

Open the entire folder in your editor so its TypeScript tooling can find the project configuration. To keep your exercise on a personal branch, run this once from the supplied starter checkout:

```bash
git switch -c workshop/my-investigation
```

The remote repository URL is not published yet. Use the supplied local checkout or the bundle setup instructions provided with the workshop materials. Future remote-clone placeholders are identified explicitly in [the command sheet](workshop/COMMANDS.md).

## Run the reproduction

```bash
npm run demo
npm run test:repro
```

The demo is an observation tool: it reports the configured retry setting and actual transport calls, then exits successfully. A successful demo command does not mean the behavior is correct.

The focused test is named `maxRetries: 0 makes one attempt`. On the starter, its assertion should fail because the expected count is one and the observed count is three. Do not change that assertion to match the bug.

| Command | Expected starter behavior | Expected behavior after a correct fix |
| --- | --- | --- |
| `npm run demo` | Reports three calls; exits successfully | Reports one call; exits successfully |
| `npm run test:repro` | One intentional assertion failure | Passes |
| `npm test` | Exactly one failing test, the reproduction | All tests pass |
| `npm run typecheck` | Passes | Passes |

These are expected workshop outcomes. Record the actual output from your own run in the investigation note. A missing dependency, syntax error, or unavailable command is a setup problem, not the prepared failure.

## Find your way around

| Location | Responsibility |
| --- | --- |
| `apps/demo.ts` | Runs the local request scenario and reports observations |
| `packages/client` | Request client, options, and tests |
| `packages/telemetry` | Small supporting package for local reporting |
| `docs/client-options.md` | Public option and retry contract |
| `workshop/COMMANDS.md` | Commands, prompts, and checkpoints |
| `workshop/INVESTIGATION.md` | Your evidence and reasoning |
| `workshop/defaulting.yml` | Prepared structural search rule |

Read [the client contract](docs/client-options.md), then use [the command sheet](workshop/COMMANDS.md) to work through the exercise. Keep your findings in [the investigation note](workshop/INVESTIGATION.md).

## Follow the workshop

| Time | Task | Checkpoint |
| --- | --- | --- |
| 0–4 min | Reproduce the failure | Separate expected and actual call counts |
| 4–12 min | Map the repository | Name the likely owning package and why |
| 12–18 min | Search by text | Classify relevant matches |
| 18–23 min | Search by structure | Explain which code shapes match |
| 23–28 min | Follow symbols | Confirm definitions and useful caller relationships |
| 28–36 min | Gather evidence | Complete a short, reproducible note |
| 36–43 min | Explain before editing | Check the assistant's hypothesis against source |
| 43–56 min | Edit and verify | Preserve the contract and inspect every changed file |
| 56–60 min | Discuss | Explain the failure, cause, and verification |

The article supplied with the workshop provides the full teaching walkthrough. Stay with the current step if you want to discover the cause before reading its explanation.

## When something differs

- **The focused test already passes:** inspect your current checkout and diff. Preserve existing work and use a fresh starter checkout if needed.
- **A search returns no results:** check the working directory, spelling, language flag, and single quotes around AST patterns.
- **Definition navigation does not work:** open the repository root, finish dependency installation, and confirm the editor recognizes TypeScript. Follow imports manually while fixing navigation.
- **An assistant edits during investigation:** inspect its diff before continuing. Keep the evidence note and restore the exercise through a fresh starter checkout if needed.

No cloud resources are created. Keep your checkout and investigation note for later practice.
