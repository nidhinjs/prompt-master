# Agentic Runtime Safety

Compact decision layer for agentic prompts. Use this before choosing a prompt
shape or runtime pattern. Do not copy full templates here: use
[templates.md](templates.md) for Template H, Template M, and Agentic Prompt
Fragments; use [patterns.md](patterns.md) for failure-mode examples.

Core rule: match autonomy to risk. The prompt should state what the model may
do alone, what it may draft only, and what requires an external approver.

## Risk Ladder

Use the lowest risk level that honestly fits the requested action. Escalate
when impact, reversibility, tool breadth, or uncertainty increases.

| Level | Meaning | Runtime policy |
| --- | --- | --- |
| R0 | Read-only answer, explanation, summary, local reasoning | Answer directly. Cite supplied evidence when factual. |
| R1 | Draft-only output: prose, plan, patch proposal, command list | Produce a draft. Do not execute external actions. |
| R2 | Reversible local edit inside explicit scope | May edit after stating scope. Verify with local checks if available. |
| R3 | Multi-file or shared-contract change, still reversible | Plan first, then execute small verified slices. Evidence required. |
| R4 | Broad tooling, dependency/config/test harness changes, generated assets | Preview first. Ask before broadening tools or touching out-of-scope files. |
| R5 | Irreversible or external side effects: delete, deploy, spend, publish, push, email, database writes | External approval required immediately before the action. |
| R6 | Regulated, safety-critical, legal/medical/financial/security-sensitive, identity/access control, secrets, production data | Policy/owner reviewer required. Prefer draft/analysis unless explicit approval and authority exist. |

Escalators:
- Unknown repo, unclear owner, stale docs, missing tests, or conflicting
  instructions raise one level.
- Any action outside stated scope raises at least to R4.
- Any persistent external side effect is R5 even if technically reversible.
- Security-sensitive code paths are at least R6 for design and review.

## Intent Flags

Infer these flags before writing the final prompt or running an agent. Include
only flags that change behavior.

| Flag | Trigger | Required control |
| --- | --- | --- |
| `read_only` | User asks to inspect, explain, compare, review, summarize | No writes or external side effects. |
| `draft_only` | User asks for proposal, plan, prompt, PR text, migration notes | Output artifact only; label it as draft. |
| `local_write` | User asks to modify files in a bounded workspace | State file/directory scope and verification command. |
| `external_action` | Push, publish, deploy, send, buy, book, create account, modify live service | Ask for approval at commit point. |
| `destructive` | Delete, overwrite, reset, migrate, revoke, rotate, purge | Require preview and explicit approval. |
| `sensitive_data` | Secrets, tokens, PII, credentials, production data, customer data | Minimize exposure; do not paste secrets; require owner review. |
| `security_critical` | Auth, permissions, crypto, payments, signing, sandboxing, supply chain | Require evidence and policy/owner reviewer. |
| `broad_tools` | Shell, network, package manager, browser automation, cloud/DB/admin tools | Narrow allowed commands/tools; reject blanket permission. |
| `multi_agent` | Parallel workers, coordinator, reviewer, advisor, fan-out | Use only when criteria in Single-Agent Default are met. |
| `uncertain_facts` | Live, niche, volatile, citable, or high-stakes factual claims | Retrieve from primary sources or mark uncertainty. |

Intent flags are not permissions. They are routing signals that decide which
guardrails and evidence requirements must be present.

## Preview/Draft/Commit

Separate the run into three surfaces whenever risk is R3 or higher.

Preview:
- State intended scope, tools, files, commands, and expected side effects.
- Identify stop conditions and approval gates.
- Reject vague authority such as "do anything", "use all tools", or "fix
  everything"; replace it with narrow allowed actions.

Draft:
- Produce plan, patch, migration script, review findings, or command list
  without applying irreversible effects.
- For code, prefer small slices with an acceptance check per slice.
- For external systems, show exact payload, target, account/project, and timing.

Commit:
- Execute only the approved action.
- Re-check that the approval matches the current diff/payload, not an older
  draft.
- Report evidence: command output, test result, file list, source citation, or
  artifact path. Do not accept "looks good" as verification.

For R0-R2, preview can be one sentence. For R5-R6, preview and commit approval
must be distinct steps.

## Policy/Owner Reviewer

Use a reviewer when the prompt crosses ownership, policy, or high-risk
boundaries. The reviewer is a gate, not a brainstorming persona.

Reviewer contract:
- Scope: name the specific files, policy area, product surface, or live system.
- Standard: define what counts as Important. Prefer correctness, security,
  privacy, data loss, compliance, and user-visible regressions over style.
- Evidence: every Important finding needs a source, artifact, `file:line`,
  command output, or reproducible scenario.
- Output: severity, finding, evidence, required fix, and whether it blocks
  commit.
- Convergence: on re-review, report only remaining Important blockers unless
  asked for a full pass.

Reviewer is required for:
- R6 work.
- R5 actions where the approver is not clearly the owner.
- Security-critical changes without strong tests.
- Ambiguous policy, licensing, privacy, or data-retention questions.
- Multi-agent merges where worker packets may have drifted from the plan.

## No Model Self-Approval

A model may verify evidence, but it cannot approve its own authority boundary.
External approval means a human owner, configured policy gate, CI protection,
or explicit platform permission outside the model's generated text.

Never treat these as approval:
- The model saying the action is safe.
- A generated checklist checked by the same agent.
- A reviewer persona created by the same prompt for an R5/R6 boundary.
- A stale approval that predates a changed diff, payload, target, or command.

For R5/R6, ask at the commit point with the exact action:
`Approve running: [command/action] against [target] with [side effect]?`

## Single-Agent Default

Default to one agent with a tight loop: inspect, plan, edit, verify, report.
Multi-agent orchestration adds coordination risk and should earn its cost.

Use multiple agents only when at least one is true:
- Work packets are independent and can be scoped with separate files/tools.
- File-heavy investigation would pollute the main context.
- A reviewer needs a different role or evidence standard.
- A cheap premise/decomposition pass can prevent broad misrouting.
- The task is large enough that verified slices are faster than serial work.

Do not fan out when:
- The change is small or fits one clear file scope.
- Workers need the same files and would race.
- The task needs a single design decision before execution.
- You cannot write worker packets with task, scope, allowed tools, stop
  condition, deliverable, and evidence.

Coordinator rules:
- Mirror hidden worker constraints in the visible plan.
- Give each worker narrow tools and explicit forbidden actions.
- Require evidence in each worker return.
- Check returned work against the packet before merging.

## Routing Map

Use this map to choose the prompt/runtime shape.

| Situation | Route |
| --- | --- |
| Simple answer, rewrite, summary, or classification | R0/R1 direct prompt; no agent scaffold. |
| Code edit in one known file or function | Template G in [templates.md](templates.md); R2 controls. |
| Autonomous code/task agent with tools | Template H in [templates.md](templates.md); add Risk Ladder controls. |
| Claude Opus 4.7/4.8 complex or agentic task | Template M in [templates.md](templates.md); keep runtime gates from this file. |
| Orchestrator, worker, fan-out, advisor, reviewer packets | Agentic Prompt Fragments in [templates.md](templates.md); enforce Single-Agent Default first. |
| Bad or runaway prompt diagnosis | Agentic patterns in [patterns.md](patterns.md), especially scope, stop conditions, evidence, and overdelegation. |
| Live/citable/high-stakes facts | Retrieval or research brief route; require citations and uncertainty handling. |
| External side effect | Preview/Draft/Commit split with external approval. |
| R6 policy/security/privacy/regulated work | Policy/Owner Reviewer before commit. |

Tool policy:
- Prefer the narrowest tool that can complete the task.
- Convert broad requests into explicit allowed tools, allowed paths, allowed
  targets, and forbidden actions.
- Reject tool bundles like "all available tools", "full repo write", or
  "admin access" unless the user narrows the task or approves a specific
  high-risk commit step.
- If a tool can spend money, change live state, contact people, publish, delete,
  or expose data, treat it as R5 or R6.

Evidence policy:
- Code: tests, build, lint, typecheck, screenshot diff, or exact reason the
  check could not run.
- Research: retrieved source links for non-obvious claims; mark uncertain gaps.
- Review: `file:line`, artifact, command output, or reproducible scenario.
- External action: target, payload/command, timestamp if relevant, and result.
- No silent success: final output must distinguish completed actions, drafted
  actions, skipped checks, and pending approvals.
