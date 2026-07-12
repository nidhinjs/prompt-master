# Agentic-execution patterns

Load this shard when a target can inspect files, run tools, edit artifacts, or
continue asynchronously. Runtime authority remains canonical in `agentic.md`.

<a id="pm-022-no-stop-condition-for-agents"></a>
## PM-022 — No stop condition for agents
**Applies when:** an agent can continue acting after ambiguity, failure, or scope expansion appears.
**Failure:** work drifts, repeats, or crosses an approval boundary without a defined halt.
**Repair:** define completion and stop triggers; report progress at meaningful milestones rather than after every trivial step.
**Do not apply when:** the target performs one atomic, non-agentic response with no external effects.
**Canonical owner:** [agentic.md](../agentic.md).
**Related:** PM-032, PM-033, PM-035, PM-052, PM-057.

<a id="pm-023-no-file-path-for-ide-ai"></a>
## PM-023 — No file path for IDE AI
**Applies when:** an edit targets a known file, symbol, or directory.
**Failure:** the agent searches broadly or changes the wrong implementation.
**Repair:** name the path and symbol, plus the smallest allowed edit scope and do-not-touch boundary.
**Do not apply when:** locating the implementation is the authorized discovery task.
**Canonical owner:** [Template G](../templates.md#template-g--file-scope).
**Related:** PM-020, PM-034, PM-054.

<a id="pm-031-no-starting-state"></a>
## PM-031 — No starting state
**Applies when:** execution depends on repository, environment, dependency, or artifact state.
**Failure:** the agent assumes prerequisites and applies steps to a different baseline.
**Repair:** state or require inspection of the observable starting state before mutation.
**Do not apply when:** the task is stateless or the input fully defines the initial state.
**Canonical owner:** [Template M](../templates.md#template-m--agentic-task-brief).
**Related:** PM-032, PM-053.

<a id="pm-032-no-target-state"></a>
## PM-032 — No target state
**Applies when:** an agent must create or change an artifact.
**Failure:** activity substitutes for a concrete deliverable and completion cannot be judged.
**Repair:** define the resulting files, behavior, boundaries, and acceptance observations.
**Do not apply when:** the authorized task is observation or diagnosis only.
**Canonical owner:** [Template M](../templates.md#template-m--agentic-task-brief).
**Related:** PM-003, PM-022, PM-031, PM-052.

<a id="pm-033-silent-agent"></a>
## PM-033 — Silent agent
**Applies when:** work is long enough that the user needs visibility into progress, deviations, or blockers.
**Failure:** the user cannot distinguish active progress from a stalled or off-scope run.
**Repair:** send concise updates at meaningful milestones and immediately surface blockers or approval needs; avoid after-every-step chatter.
**Do not apply when:** the task completes quickly in one response or the surface cannot send progress safely.
**Canonical owner:** [agentic.md](../agentic.md).
**Related:** PM-022, PM-052, PM-057.

<a id="pm-057-plan-deviation-unhandled"></a>
## PM-057 — Plan deviation unhandled
**Applies when:** a long agentic run encounters an unplanned but reversible choice.
**Failure:** the agent either stalls on routine uncertainty or silently drifts from the agreed plan.
**Repair:** choose the conservative reversible option, log the deviation and evidence, and continue only while it remains in scope and below authority, cost, risk, policy/security, and external-impact thresholds.
**Do not apply when:** the deviation is irreversible or expands authority, scope, cost, risk, policy/security exposure, or external impact and therefore needs approval.
**Canonical owner:** [agentic.md](../agentic.md).
**Related:** PM-022, PM-035, PM-052.
