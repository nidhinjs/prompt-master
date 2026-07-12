# Evaluation-and-review patterns

Load this shard when a result lacks acceptance evidence, validation, a runnable
self-check, or a bounded review contract.

<a id="pm-003-no-success-criteria"></a>
## PM-003 — No success criteria
**Applies when:** multiple outcomes could be called complete or better.
**Failure:** completion becomes a subjective assertion rather than an observable result.
**Repair:** define task-relevant pass/fail observations without inventing unavailable tests or authority.
**Do not apply when:** the task is deliberately exploratory and produces options rather than a final result.
**Canonical owner:** patterns.
**Related:** PM-001, PM-032, PM-052.

<a id="pm-042-unhandled-output-validation"></a>
## PM-042 — Unhandled output validation
**Applies when:** an output can be syntactically plausible while semantically or structurally wrong.
**Failure:** the workflow accepts the artifact without checking its required schema, invariants, or behavior.
**Repair:** add the cheapest available validation at the appropriate output boundary and require its observed result.
**Do not apply when:** the output is a non-final draft or no meaningful validation is available.
**Canonical owner:** patterns.
**Related:** PM-003, PM-037, PM-052.

<a id="pm-052-no-runnable-self-check"></a>
## PM-052 — No runnable self-check
**Applies when:** an agent can execute or inspect a check that meaningfully tests its change.
**Failure:** looks done or the agent's assertion becomes the completion signal and the user inherits the verification loop.
**Repair:** require a runnable pass/fail check and evidence, with exactly three total attempt slots; after the third failure stop and report all attempt evidence.
**Do not apply when:** the task is brainstorming or draft-only, or no authorized runnable check exists; then require the strongest available non-execution evidence.
**Canonical owner:** [SKILL.md](../../SKILL.md).
**Related:** PM-003, PM-022, PM-032, PM-042, PM-055.

<a id="pm-055-unbounded-review-request"></a>
## PM-055 — Unbounded review request
**Applies when:** a reviewer is asked to find all issues without severity, evidence, scope, or convergence rules.
**Failure:** review expands indefinitely, rewards speculative nits, and triggers costly re-review loops.
**Repair:** bound scope and finding count, define material severity, require artifact evidence for behavior claims, and narrow re-review to unresolved material findings.
**Do not apply when:** exhaustive compliance review is explicitly required and its authority, corpus, and budget are defined.
**Canonical owner:** patterns.
**Related:** PM-015, PM-041, PM-043, PM-052, PM-060.
