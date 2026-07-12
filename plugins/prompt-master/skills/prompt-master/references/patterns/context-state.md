# Context-and-state patterns

Load this shard when the failure comes from missing, stale, oversized, unsafe,
or poorly referenced context. Prefer compact current state over raw history.

<a id="pm-007-implicit-reference"></a>
## PM-007 — Implicit reference
**Applies when:** the prompt refers to an earlier object or decision without uniquely identifying it.
**Failure:** the target guesses which artifact or instruction words such as this, that, or the other thing denote.
**Repair:** restate the relevant object, decision, and requested change or attach a stable reference.
**Do not apply when:** the reference is unambiguous in the same bounded input.
**Canonical owner:** patterns.
**Related:** PM-008, PM-028, PM-053.

<a id="pm-008-assumed-prior-knowledge"></a>
## PM-008 — Assumed prior knowledge
**Applies when:** success depends on decisions or facts not present in the current prompt context.
**Failure:** missing state is reconstructed from guesswork or stale memory.
**Repair:** provide a compact Memory Block containing only relevant decisions, rationale, constraints, and current state.
**Do not apply when:** the task is self-contained and prior context cannot change the result.
**Canonical owner:** [SKILL.md](../../SKILL.md).
**Related:** PM-007, PM-010, PM-028, PM-029.

<a id="pm-009-no-project-context"></a>
## PM-009 — No project context
**Applies when:** domain, audience, current state, or business goal affects the requested output.
**Failure:** the target supplies generic assumptions that do not fit the project.
**Repair:** state the minimum project facts that materially constrain the deliverable.
**Do not apply when:** the operation is context-independent transformation or extraction.
**Canonical owner:** patterns.
**Related:** PM-008, PM-012, PM-021.

<a id="pm-010-forgotten-stack"></a>
## PM-010 — Forgotten stack
**Applies when:** implementation choices must remain compatible with an established stack.
**Failure:** a new prompt silently contradicts existing languages, versions, libraries, or architecture.
**Repair:** carry forward the selected stack and its rationale in current state; resolve changes as explicit forks.
**Do not apply when:** stack choice is the task under evaluation rather than a locked constraint.
**Canonical owner:** [SKILL.md](../../SKILL.md).
**Related:** PM-008, PM-021, PM-029.

<a id="pm-013-no-mention-of-prior-failures"></a>
## PM-013 — No mention of prior failures
**Applies when:** an existing prompt or implementation is being corrected after failed attempts.
**Failure:** the target repeats a disproven approach or inherits failed artifacts as if they were current state.
**Repair:** retain only what was tried, observable failure evidence, and the next constraint; exclude obsolete failed output.
**Do not apply when:** this is a new request with no relevant attempt history.
**Canonical owner:** [SKILL.md](../../SKILL.md).
**Related:** PM-037, PM-042, PM-053.

<a id="pm-021-no-stack-constraints"></a>
## PM-021 — No stack constraints
**Applies when:** the deliverable must integrate with a specific runtime or dependency policy.
**Failure:** the target chooses incompatible technologies or adds unapproved dependencies.
**Repair:** name relevant versions, language modes, allowed dependencies, and compatibility boundaries.
**Do not apply when:** technology selection is intentionally open and will be evaluated as a decision.
**Canonical owner:** patterns.
**Related:** PM-009, PM-010, PM-034.

<a id="pm-025-pasting-entire-codebase"></a>
## PM-025 — Pasting entire codebase
**Applies when:** the prompt includes broad repository or session material unrelated to the immediate decision.
**Failure:** signal is diluted, cost rises, and stale or conflicting context competes with current constraints.
**Repair:** provide targeted files, symbols, excerpts, or a compact state summary; expand only after an evidence-backed gap.
**Do not apply when:** the authorized task is a justified whole-repository inventory and no narrower source can answer it.
**Canonical owner:** patterns.
**Related:** PM-020, PM-037, PM-053, PM-061.

<a id="pm-028-expecting-inter-session-memory"></a>
## PM-028 — Expecting inter-session memory
**Applies when:** a new session depends on earlier decisions or artifacts.
**Failure:** the target is expected to recover state that is not available in the receiving context.
**Repair:** re-provide the compact Memory Block and direct artifact references needed for this task.
**Do not apply when:** the receiving surface verifiably supplies the required persistent state.
**Canonical owner:** [SKILL.md](../../SKILL.md).
**Related:** PM-007, PM-008, PM-029.

<a id="pm-029-contradicting-prior-work"></a>
## PM-029 — Contradicting prior work
**Applies when:** a new instruction conflicts with a carried-forward decision or constraint.
**Failure:** the target silently chooses one version and propagates inconsistent state.
**Repair:** expose the conflict as a decision fork, preserve the prior rationale, and update state only after resolution.
**Do not apply when:** the user explicitly supersedes the prior decision with sufficient authority.
**Canonical owner:** [SKILL.md](../../SKILL.md).
**Related:** PM-008, PM-010, PM-037.

<a id="pm-037-context-pollution-and-task-boundary-drift"></a>
## PM-037 — Context pollution and task-boundary drift
**Applies when:** the task materially changes, corrections conflict, obsolete artifacts dominate, or early constraints can no longer be verified in current state.
**Failure:** continued work compounds stale assumptions and failed attempts while appearing locally coherent.
**Repair:** re-anchor from evidence: start a clean task context or rewind, carry forward only current decisions, rationale, failure lessons, scope, and artifact references.
**Do not apply when:** the task and constraints remain stable and a compact update restores current state without reset.
**Canonical owner:** [SKILL.md](../../SKILL.md).
**Dependencies:** [coding-agent profiles](../profiles/coding-agents.md).
**Related:** PM-013, PM-025, PM-029, PM-042, PM-061.

<a id="pm-053-unsafe-or-bloated-artifact-transfer"></a>
## PM-053 — Unsafe or bloated artifact transfer
**Applies when:** logs, errors, screenshots, data, or files are needed to diagnose the task.
**Failure:** paraphrase hides evidence, while indiscriminate verbatim transfer leaks sensitive data or floods context with unrelated material.
**Repair:** minimize first: retain only the smallest relevant original fragment or file reference with provenance. Before copying into prompts, logs, memory blocks, reviewer requests, or worker packets, remove or mask secrets and credentials, authentication/session material, personal or identifying data, customer or production data, payment and financial data, health data, legally privileged material, proprietary or confidential business content, and sensitive security or infrastructure details; never copy unrelated fields.
**Do not apply when:** the artifact cannot be shared under the governing privacy or access policy.
**Canonical owner:** [agentic trust boundary](../agentic.md#canonical-trust-boundary).
**Related:** PM-007, PM-013, PM-025, PM-040.

<a id="pm-054-no-exemplar-for-match-the-codebase-work"></a>
## PM-054 — No exemplar for match-the-codebase work
**Applies when:** the new artifact must conform to existing local conventions.
**Failure:** generic best practice replaces the repository's established pattern.
**Repair:** name one relevant exemplar file, test, component, or output and specify which traits must match.
**Do not apply when:** no trustworthy exemplar exists or the task intentionally replaces the old convention.
**Canonical owner:** patterns.
**Related:** PM-009, PM-023, PM-053.
