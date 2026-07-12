# Orchestration patterns

Load this shard only for real delegation or coordinator/worker execution. A
multi-persona single response is not multi-agent execution.

<a id="pm-058-unverified-premise-before-fan-out"></a>
## PM-058 — Unverified premise before fan-out
**Applies when:** a decomposition depends on uncertain architecture, data shape, file map, or workstream independence.
**Failure:** every delegated package can be plausible yet aimed at the same false premise.
**Repair:** perform one cheap premise check using available evidence before fan-out; it may be done by the coordinator and does not require a worker.
**Do not apply when:** the premise is already verified and packages are independently executable.
**Canonical owner:** [agentic single-agent default](../agentic.md#single-agent-default).
**Related:** PM-043, PM-059, PM-061.

<a id="pm-059-coordinator-worker-contract-drift"></a>
## PM-059 — Coordinator/worker contract drift
**Applies when:** work is delegated through hidden or separately composed worker packets.
**Failure:** worker scope, tools, trust boundaries, stop rules, or evidence differ from the visible plan.
**Repair:** mirror governing constraints in every bounded packet and validate returned work against that packet before integration.
**Do not apply when:** no delegation occurs.
**Canonical owner:** [agentic trust boundary](../agentic.md#canonical-trust-boundary).
**Related:** PM-004, PM-034, PM-035, PM-058, PM-061.

<a id="pm-060-advisor-or-orchestration-gate-misuse"></a>
## PM-060 — Advisor or orchestration gate misuse
**Applies when:** an advisor or equivalent orchestration checkpoint is invoked routinely rather than for a bounded consequential decision.
**Failure:** repeated gates add latency and cost without changing the plan or risk decision.
**Repair:** use one scoped checkpoint only when risk or material uncertainty warrants it, with a named question, evidence input, and decision output.
**Do not apply when:** policy requires an independent review at that exact boundary.
**Canonical owner:** [agentic policy/owner reviewer](../agentic.md#policyowner-reviewer).
**Related:** PM-048, PM-055, PM-058, PM-061.

<a id="pm-061-overdelegation-or-bad-granularity"></a>
## PM-061 — Overdelegation or bad granularity
**Applies when:** delegation is proposed without at least two independent bounded packages or one package is too broad to verify.
**Failure:** coordination cost, duplicated context, conflicts, and unverifiable integration exceed the value of parallel work.
**Repair:** default to one loop; delegate only independent packages with clear deliverables and evidence, and execute large plans as small verified slices.
**Do not apply when:** verified parallel packages materially reduce latency or isolate context without shared mutable state.
**Canonical owner:** [agentic single-agent default](../agentic.md#single-agent-default).
**Related:** PM-006, PM-025, PM-058, PM-059, PM-060.
