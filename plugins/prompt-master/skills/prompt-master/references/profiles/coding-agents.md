# Coding-agent profiles

Load this bundle only when [tool-profiles.md](../tool-profiles.md) selects it.
It is self-contained: every coding-agent prompt states starting state, target
state, file scope, allowed and forbidden actions, approval boundaries, stop
conditions, runnable verification, and required evidence. Apply the shared
execution controls in [agentic.md](../agentic.md) and use
[templates.md](../templates.md) Template H or M when their structure fits.

## Registry boundary

Resolve the route alias in [facts/index.json](../facts/index.json) and read only
the referenced provider shard. The registry alone owns underlying model IDs,
defaults, release channels, availability, context limits, and version-tied
commands or parameters. Apply `prompting_constraints` from the selected record;
do not enumerate model membership here. If facts or a routed profile are
missing, use [decompiler-fallback.md](decompiler-fallback.md).

## Shared coding-agent contract

- Anchor every instruction to named files/directories, functions, or artifacts;
  never issue an unbounded repository-wide edit.
- Define “done” with a command, expected exit/result, and evidence to return.
  Use exactly 3 total execution attempts: Attempt 1 is the initial execution,
  Attempt 2 is Retry 1, and Attempt 3 is Retry 2. After the third failure,
  stop/escalate with evidence from every attempt and an honest blocked report;
  never start a third retry (Retry 3).
- Stop before deleting files, installing dependencies, changing schemas,
  credentials, infrastructure, or external state unless explicitly authorized.
- Attach files, directories, logs, errors, screenshots, and MCP resources instead
  of paraphrasing them. Name an exemplar implementation when one exists.
- One scoped change gets one focused pass. Large independent work packages may
  use an orchestrator; the coordinator retains integration and verification.
- For taste-based work, request a prototype-first pass with exactly 3 divergent
  directions labelled `Fit`, `Risk / tradeoff`, and `When to use`. For an
  unfamiliar domain or codebase, request a blindspot inventory and decision
  forks without forcing a prototype or 3 variants.
- For long runs, log deviations under `## Deviations` and continue only when the
  choice is reversible, in scope, and below authority, cost, risk,
  policy/security, and external-impact thresholds. Stop for approval when any
  threshold or boundary expands.

## Codex

- Route code, repository, command, test, review, and developer-tool work here,
  including work reached through a ChatGPT client. Do not use the non-code
  ChatGPT Chat/Work profile.
- Keep model and execution controls in `Recommended setup:` and resolve them only
  from the selected Codex route record. Do not put UI labels, config keys, or API
  request fields in the fenced task prompt unless Codex configuration is the
  requested artifact.
- Use subagents only for independent bounded packages. Give each scope, allowed
  resources, result/evidence schema, and stop condition; the coordinator owns
  dependency order, integration, conflict resolution, and final verification.
- Prefer a deeper single-agent choice for a hard sequential change. Never
  simulate multi-agent work with role-play personas or force fan-out by file.
- Challenge expensive configurations with a dated workload-relevant comparison:
  test smaller-tier/higher-effort and deeper-single-agent alternatives, measure
  completed-task quality/cost/latency, and discard dominated options. Do not turn
  a community benchmark snapshot into a universal ranking.
- Promise exact worker count, nesting, or per-agent model selection only when the
  selected surface verifies it. Custom agent files are a separate explicit
  configuration request, not ordinary prompt content.

## Claude Code

- Front-load intent, exact scope, constraints, acceptance criteria, relevant
  artifacts, and session strategy. Explicitly request tool reads when needed.
- Prevent over-engineering: “Only make requested changes; no extra files,
  abstractions, refactors, or features.”
- For multi-file or unfamiliar work, explore, plan, review the plan, implement,
  and verify; skip plan overhead when the entire diff is one obvious edit.
- Escalate verification by stakes: prompt check, recurring goal/stop gate, then a
  fresh correctness-only reviewer. Reviewers flag correctness and evidence gaps,
  not style preferences.
- Keep unrelated tasks in new sessions. After repeated failed corrections,
  restart with a clean prompt containing what was learned; rewind before
  accumulating contradictory corrections and compact before context pressure.
- Convert recurring corrections into a concise project rule, pruning any line
  whose removal would not cause mistakes.
- Batch/headless prompts must be self-contained and machine-checkable, constrain
  allowed tools, and specify what to do with results because questions may be
  impossible. Use a fresh writer/reviewer split for consequential work.
- Scope code review to a target diff/file/branch and apply the review-request
  controls from [templates.md](../templates.md).

## Cortex Code

- Treat it as an agent that can edit files, run commands/SQL, and affect hosted
  objects. Apply the shared anti-overengineering and human-review gates.
- Reference installed skills rather than copying their instructions into every
  task.
- Prefer verified platform-native SQL and in-platform application connections;
  retrieve exact tool names from the registry/current local help.
- Break long work into tracked tasks and steps; unstructured long prompts lose
  coherence.
- For headless use, request structured events and machine-checkable completion;
  verify the current command and output format before use.

## Antigravity

- Describe one outcome-focused deliverable per session.
- Ask for a reviewable artifact such as a task list or implementation plan before
  execution when the work is broad.
- Include browser-based UI verification at the user-required viewports and ask
  for evidence.
- Set the autonomy and destructive-command approval boundary explicitly.

## Cursor / Windsurf

- Give file path, function/symbol, current behavior, desired behavior,
  do-not-touch list, language/runtime constraints, and “Done when”.
- Never give a global edit without a path anchor.
- Split complex dependent work into sequential prompts with verification between
  them.

## Cline (formerly Claude Dev)

- State starting state, target state, file scope, stop conditions, and approval
  gates. Name files to edit and files to leave untouched.
- Require approval before terminal commands or dependency installation when the
  user has not already authorized them.
- Use verified file search, codebase reading, and browser capabilities for
  context; never assume the underlying provider or its prompting behavior.
- Break multi-step work into checkpoints and review the agent's task list before
  execution.

## GitHub Copilot

- Put the exact function signature, docstring, or implementation comment directly
  before the requested completion.
- Describe input and return types, edge cases, invariants, and prohibited
  behavior; predictive completion needs ambiguity removed.
- Keep the request local to one completion and provide nearby examples/tests.

## Devin / SWE-agent

- State the repository starting state and concrete target state.
- Give a strict filesystem scope and name config, infrastructure, CI, and other
  areas that must remain untouched.
- Supply forbidden actions, approval gates, verification commands, and a final
  evidence schema; autonomous browsing and terminal access do not remove these
  boundaries.
