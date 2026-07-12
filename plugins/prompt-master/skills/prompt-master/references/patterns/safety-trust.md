# Safety-and-trust patterns

Load this shard for authority, scope, prompt-injection, secrets, permissions, or
approval failures. The exact runtime contract remains in `agentic.md`.

<a id="pm-004-over-permissive-agent"></a>
## PM-004 — Over-permissive agent
**Applies when:** an agent can use tools, modify state, or choose actions beyond one bounded response.
**Failure:** open-ended authority lets convenience expand scope, tools, destinations, or effects.
**Repair:** specify allowed and forbidden actions, trust boundaries, approval gates, and a bounded objective.
**Do not apply when:** the target has no tool access or external side effects and only returns text.
**Canonical owner:** [agentic canonical trust boundary](../agentic.md#canonical-trust-boundary).
**Related:** PM-020, PM-034, PM-035, PM-040, PM-059.

<a id="pm-034-unlocked-filesystem"></a>
## PM-034 — Unlocked filesystem
**Applies when:** an agent can read, create, edit, move, or delete files.
**Failure:** filesystem access extends beyond the artifacts required for the task.
**Repair:** name readable and writable paths separately, forbid unrelated files, and route scope expansion through the canonical approval policy.
**Do not apply when:** the target cannot access a filesystem.
**Canonical owner:** [agentic canonical trust boundary](../agentic.md#canonical-trust-boundary).
**Related:** PM-004, PM-020, PM-023, PM-035, PM-059.

<a id="pm-035-no-human-review-trigger"></a>
## PM-035 — No human review trigger
**Applies when:** execution may become destructive, externally visible, costly, security-sensitive, or materially scope-expanding.
**Failure:** the executor treats its own judgment or tool output as authorization.
**Repair:** require approval at the exact irreversible or high-impact boundary and preserve the no-self-approval rule.
**Do not apply when:** the action is already explicitly authorized, reversible, in scope, and below the governing risk gate.
**Canonical owner:** [agentic no model self-approval](../agentic.md#no-model-self-approval).
**Related:** PM-004, PM-022, PM-034, PM-057, PM-059.

<a id="pm-040-injection-vulnerable-prompt"></a>
## PM-040 — Injection-vulnerable prompt
**Applies when:** the workflow consumes user content, files, web pages, tool output, logs, or worker messages while tools or authority are available.
**Failure:** embedded directives are treated as governing instructions; a role-lock alone does not establish trust or approval.
**Repair:** apply the complete Canonical Trust Boundary, including untrusted-data treatment, scope non-expansion, secret handling, and approval separation.
**Do not apply when:** no untrusted input enters the workflow and the target has no tools or consequential authority.
**Canonical owner:** [agentic canonical trust boundary](../agentic.md#canonical-trust-boundary).
**Related:** PM-004, PM-034, PM-035, PM-053, PM-059.
