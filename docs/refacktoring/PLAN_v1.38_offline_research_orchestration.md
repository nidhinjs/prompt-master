# Plan v1.38.0 — Offline-Verified Research Portfolio Orchestration

Status: approved implementation plan; the v1.37.0 source/tag prerequisite is
satisfied; the v1.38 offline candidate and deterministic validation suite are
not implemented.

Prepared: 2026-07-12; offline scope finalized: 2026-07-12

Current-state audit: 2026-07-12 against `v1.37.0` / commit
`4cecd75fdff5b2de9197a0ecfc88a7612a2a46cd`.

Execution-design audit: 2026-07-12 against the current official Codex
[Models](https://learn.chatgpt.com/docs/models),
[Subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents), and
[`model/list`](https://learn.chatgpt.com/docs/app-server#list-models-modellist)
documentation.

Implementation surface: heterogeneous local Codex.

ChatGPT Work remains a separate hosted topology and is not used to execute
this implementation plan.

Target runtime: Claude-first `prompt-master` skill.

Execution boundary: v1.38 contains no Claude A/B phase, live Claude runner,
target-runtime live-model authorization gate, or claim of Claude behavioral
revalidation.
Validation is deterministic/offline plus independent Codex review. PM-05
behavioral attestation remains open and unassigned to a release.

## 0. Current-state implementation audit

The audited tracked tree is exactly the released v1.37.0 source commit. It
already provides reusable prerequisites, but not the v1.38 feature:

- generic PM-030 evidence grounding and PM-061 delegation-granularity repairs;
- the existing Agentic Prompt Fragments and Claude Managed Agents profile;
- the v1.37 safe fake-runner, `NO_LIVE_MODEL_CALLS=1` CI boundary, deterministic
  runtime inventory, package parity checks, and checksum/signing contracts;
- the seven v1.38 eval specifications and acceptance IDs in this plan.

The following v1.38 deliverables are absent from the audited tree:

- `research-portfolio-orchestration` as a canonical template section and route;
- the planned PM-030/PM-061 research-portfolio specializations and the removal
  of the stale hardcoded Claude model row in `references/agentic.md`;
- project limits in `.codex/config.toml` and profiles under `.codex/agents/`;
- the deterministic portfolio-contract validator and tests;
- `tests/skill-evals/` schemas, cases, acceptance map, fixtures, and preservation
  record;
- any role-specific Codex review evidence or v1.38 release-evidence manifest.

Therefore v1.38 is **not already implemented**. Existing generic orchestration
text and v1.37 verification code are prerequisites only; they do not satisfy an
`R38-*` acceptance ID without the frozen v1.38 fixtures and evidence. Claude
Code Routines are outside this release and require a separate scope decision.

## 1. Release decision

Release `v1.38.0` contains one bounded runtime improvement with a fully offline,
machine-verifiable release gate:

> Offline-Verified Research Portfolio Orchestration

The release may claim that the runtime contract, routing, safety boundaries,
preservation checks, cross-platform test suite, and package reproducibility are
verified. It must not claim that Claude executed the skill or that v1.38
outperforms a historical skill in model behavior.

Dependency order and current status:

1. **Complete:** publish v1.37.0 Portable Verification and Historical
   Provenance; the audited source/tag resolves to commit `4cecd75`.
2. **Pending:** create the v1.38 candidate from that published commit.
3. **Pending:** materialize and freeze machine-readable evals and assertions
   before runtime edits.
4. **Pending:** implement the candidate and pass every strict offline gate.
5. **Pending:** complete independent Codex reviews with role-specific acceptance
   evidence and resolve every critical/high finding.
6. **Pending:** pass WSL/Windows parity and two-build package reproducibility.
7. **Pending after explicit release authorization:** publish the exact verified
   commit and offline evidence.

## 2. Provenance baselines

Historical Claude-authored reference, not a behavioral comparator:

```text
tag:        v1.26.3
tag object: ab01b06aaed22c9b4c0392b55d355e3395577509
commit:     aa11787da1885c52f122562210433527794991f3
tree:       09a3f8160ab4f2d944eff4f4ef7bc479ce7f6357
files:      5
runtime archive SHA-256:
            242959c4a2b79a960d56007537489dcc8a2b6816fffb65d0f946d35bf8ada260
```

The runtime archive digest is defined exactly as the SHA-256 of stdout from:

```text
git archive --format=tar v1.26.3 plugins/prompt-master/skills/prompt-master
```

The command, path order, Git archive format, and uncompressed byte stream are
part of the contract; a ZIP, extracted-directory traversal, or platform-native
tar implementation is not an interchangeable digest algorithm.

This is the last Git-provenance reference whose release commit records Claude
as co-author. The statement does not prove that Claude was never used after
that commit; it defines the last auditable Git marker. Because v1.38 runs no
Claude model, this reference is used only for provenance and static historical
comparison, never for an A/B quality claim.

The current v1.37 line is the implementation and preservation baseline. It
supplies:

- the candidate source tree;
- a preservation ledger for every v1.27–v1.37 capability;
- absolute assertions for Codex, GPT-5.6, registry, packaging, and safety
  features that v1.26.3 did not contain.

## 3. Heterogeneous Codex execution topology

### 3.1 Root contract and documentation basis

Root execution contract:

```text
surface:     local Codex
root model:  gpt-5.6-sol
root mode:   Ultra
fan-out:     no more than three direct workers at once
depth:       one; workers never spawn workers
```

Ultra owns decomposition, delegation, integration, conflict resolution,
approval boundaries, final verification, and the user-facing result. It is a
Codex orchestration mode that uses subagents, not an API model slug and not a
value to append to `gpt-5.6-sol` in an agent file.

The model policy follows the official task-shape guidance:

- Sol for ambiguous, difficult, high-value implementation and review;
- Terra for read-heavy exploration, everyday tool use, and bounded technical
  documentation;
- Luna for clear, repeatable, mechanically verifiable work;
- the lowest reasoning effort that passes the role's acceptance checks;
- Max or a higher supported effort only for an isolated unresolved reasoning
  blocker, never as the default for every worker.

Ultra is intentionally used for this release because the work has independent
eval, implementation, safety, documentation, and verification streams. It must
not be used to parallelize a strict dependency chain or concurrent edits to the
same files.

### 3.2 Capability preflight

Before creating or invoking any project profile, root records the current
Codex client version and model catalog. Use `model/list` when the current
surface exposes App Server; otherwise use the equivalent model metadata exposed
by that Codex client. For every selected model record:

- exact model ID and account/surface availability;
- `supportedReasoningEfforts` and `defaultReasoningEffort` when exposed;
- effective model and effort actually reported by the spawned thread;
- whether the configured sandbox and required tools are available.

The planned project limit is:

```toml
[agents]
max_threads = 4 # root plus no more than three direct workers
max_depth = 1
```

The fresh-session smoke must confirm that the pinned client interprets this as
one root plus at most three open direct-worker threads. If it does not, root
stops and amends the numeric limit before any implementation delegation.

The table below is the preferred routing policy, not permission to invent a
model or unsupported effort. `high` is the default for demanding author/review
roles only after the catalog confirms it. Promotion to `xhigh` or `max` requires
both catalog support and a recorded acceptance failure or unresolved critical
finding that is plausibly reasoning-bound. Environment failures, broken tests,
or unclear ownership are fixed directly and never treated as reasons to spend
more reasoning tokens.

Project custom-agent profiles are created under `.codex/agents/` after v1.37 is
published:

| Role | Preferred model | Initial effort | Ownership and escalation |
|---|---|---:|---|
| `repo_explorer` | `gpt-5.6-terra` | `medium` | Read-only repository/evidence map; promote to `high` only for a recorded cross-file contradiction |
| `eval_architect` | `gpt-5.6-sol` | `high` | Read-only eval/schema/interface design before the freeze; never edits fixtures or runtime |
| `runtime_author` | `gpt-5.6-sol` | `high` | Exclusive runtime paths; conditional `xhigh` only for an unresolved architecture blocker |
| `test_author` | `gpt-5.6-sol` | `high` | Exclusive assigned eval/validator paths; multiple instances require disjoint ownership |
| `docs_author` | `gpt-5.6-terra` | `medium` | Read-only documentation/source proposal; root alone applies changes to shared docs |
| `adversarial_reviewer` | `gpt-5.6-sol` | `high` | Read-only fresh context; conditional `xhigh` for one unresolved critical finding |
| `test_runner` | `gpt-5.6-luna` | lowest catalog-supported level that passes runner checks | No semantic edits; deterministic scripts decide pass/fail |
| `package_checker` | `gpt-5.6-luna` | lowest catalog-supported level | Read-only inventory/hash work; never substitutes judgment for byte/hash checks |
| `docs_reviewer` | `gpt-5.6-terra` | `high` | Read-only consistency and traceability review |

These profiles are planned implementation inputs and are absent from the
audited v1.37.0 tree. They must be added and validated before delegation; the
table does not authorize silent fallback to a different profile, model, or
effort. If a preferred model is unavailable, root stops before delegation and
records the missing capability. A replacement requires an explicit plan
amendment; automatic model selection may be used only when the amended role
declares it and the actual selection is captured in evidence.

Each project profile must define `name`, `description`, and
`developer_instructions`. Only `runtime_author` and `test_author` inherit a
scoped workspace-write sandbox from root; all exploration, architecture,
documentation, reviewer, runner, and checker profiles explicitly use read-only
where supported. No profile requests `danger-full-access`, broad network access,
commit, tag, push, release, or recursive delegation authority.

### 3.3 Operational limits

Operational limits:

- at most three active workers plus root;
- `agents.max_depth = 1`;
- workers do not spawn workers;
- no overlapping write scopes;
- agents do not commit, tag, push, publish, or invoke a real Claude runner;
- integration, approvals, and external effects are serialized by root; real
  Claude or another target-model runner is outside this release, while the
  requested Codex subagents execute the implementation/review plan;
- structural assertions are executed by code, not decided by an LLM;
- evidence records the actual model, effort, Codex client version, and date;
- unavailable profiles fail closed; no silent model substitution.

This heterogeneous topology is not the Responses API Multi-agent beta, whose
subagents share the request model. The API topology is documented only as a
separate homogeneous limitation and is not used to execute this plan.

### 3.4 Execution DAG and synchronization gates

Root must wait for every agent in a wave before opening its gate. A later wave
may start only when its predecessor gate is recorded as passed. Parallelism is
used for independent read-heavy or disjoint-write work; an idle slot is
preferable to an unsafe dependency overlap.

| Wave | Parallel agents | Owned work and output | Gate owned by root |
|---|---|---|---|
| `W0` preflight | none | Verify branch, staged/untracked boundaries, v1.37 tag/commit, prohibited runner policy, model catalog, sandbox, and file ownership ledger; preserve the three pre-existing untracked documents and stage no file by wildcard | `G0`: root records provenance/capabilities and prepares a planning-only commit containing exactly this plan and the roadmap before candidate work |
| `W0B` profile bootstrap | root only, then fresh Codex session | Create `.codex/config.toml` and every `.codex/agents/*.toml` profile; commit bootstrap; record a resume packet; reload the project; smoke-spawn each named role in batches of at most three and record actual model/effort/sandbox | `G0B`: native profile loading and effective thread/depth limits are proven before any delegated project task; missing metadata or selector support stops execution |
| `W1` read-only design audit | `repo_explorer`; `eval_architect`; `adversarial_reviewer` | Current-code map, eval/schema/interface proposal, safety and release-boundary risks; no edits | `G1`: root reconciles contradictions and freezes task IDs, inputs, owned paths, acceptance IDs, and interfaces |
| `W2A` eval freeze | two `test_author` instances with disjoint data/validator paths; `package_checker` read-only | Instance A materializes `tests/skill-evals/**`; instance B implements the deterministic eval core/validator/tests from the frozen W1 interface; checker verifies baseline objects and exclusion contracts | `G2A`: validator/mutations pass, seven evals/assertions and acceptance map reconcile, baseline verifies, then root creates eval-freeze commit `S` containing data plus validator and records its tree/input hashes |
| `W2B` Codex profile validator | one `test_author`; `package_checker` read-only | Implement the static Codex profile validator/tests; checker re-audits path/manifest isolation | `G2B`: profile validator and mutation tests pass, no new test can spawn a model process, runtime tree remains untouched |
| `W3` candidate | `runtime_author`; read-only `docs_author` | Author changes only the six runtime paths; docs role returns a source-linked wording/change proposal and touches no shared file | `G3`: root reviews the runtime diff, verifies one canonical owner, and rejects any post-hoc weakening of evals |
| `W3I` root integration | root only | Apply shared test/CI wiring and approved README/CHANGELOG/roadmap/plan/release wording; reconcile versions/manifests; run targeted smoke checks | `G3I`: shared files have one owner, smoke checks pass, and the integrated tree is ready for fresh-context review |
| `W4` independent verification | `adversarial_reviewer`; `test_runner`; `docs_reviewer` | Fresh-context semantic/security review, deterministic targeted/full tests, documentation/traceability review; all read-only | `G4`: all expected checks executed, zero critical blockers, every finding accepted or resolved with evidence |
| `W5` remediation | at most one scoped author at a time; original reviewer remains read-only | Minimal fix for one accepted finding, then targeted rerun and independent re-review | `G5`: no unresolved critical/high finding and no unreviewed cross-scope change |
| `W5F` candidate freeze | root only | Apply any final shared-file follow-up, rerun targeted checks, create candidate commit `C`, and record its tree; no package yet | `G5F`: working tree/index boundaries are known, `C` is immutable, and any later source change sends execution back to `W5` and creates a new `C` |
| `W6` portable/package gate | WSL and Windows `test_runner` instances may test `C` in parallel; builds stay serialized; `package_checker` compares | Same strict offline list from clean checkouts of `C`; two clean package builds; inventory, byte parity, and digest comparison | `G6`: platform counts reconcile and both packages built from `C` have identical bytes and SHA-256; a failure invalidates `C` as the release candidate |
| `W7` offline RC | none | Root records the already immutable `C`, eval-suite hash, validator/policy hashes, model catalog, review records, package digest, and pre-publication acceptance ledger; no tag or push | `G7`: offline RC ledger complete and every offline/pre-publication acceptance ID closed |
| `W8` release | root only; package checker may perform a final read-only audit | Only after explicit release authorization: signed tag, finalized offline evidence/checksum, push, publication, then terminal read-only publication audit `A` | `G8`: remote tag, commit, ZIP, checksum, evidence manifest, and schema-valid `A` all reconcile |

The `W2A/W2B` `test_author` tasks receive these non-overlapping paths:

```text
W2A instance A:
  tests/skill-evals/**

W2A instance B:
  scripts/skill-eval-core.js
  scripts/validate-skill-evals.js
  scripts/test-skill-evals.js

W2B instance:
  scripts/validate-codex-agents.js
  scripts/test-codex-agents.js
```

Root freezes their shared data/module API in `G1`; `G2A` freezes the resulting
data and validator implementation in `S`. Each instance must stop rather than
modify another task's paths. Root alone resolves an interface change and then
reissues bounded follow-up tasks.

### 3.5 Subagent task and return contract

Every spawn or follow-up message contains:

1. stable task ID, objective, and explicit non-goals;
2. immutable input commit/tree and relevant frozen artifact hashes;
3. exclusive writable paths and read-only context paths;
4. acceptance IDs and exact commands/evidence required;
5. prohibited actions, including recursive spawning, any model runner,
   credential access, commit/tag/push/release, and changes outside ownership;
6. stop conditions for overlap, missing capability, ambiguous authority, or a
   changed input hash;
7. required return schema and instruction to summarize logs instead of flooding
   the root context.

Each subagent returns exactly the following semantic fields, in Markdown or an
equivalent structured tool result:

```text
task_id
status: PASS | FAIL | BLOCKED
actual_model
actual_effort
changed_paths
acceptance_ids_checked
commands_and_exit_codes
evidence_summary
findings_by_severity
assumptions_or_decisions_needed
residual_risks
```

`PASS` is invalid when a required command did not run. `BLOCKED` names the
specific missing input or authority. Hidden reasoning, raw secrets, full model
outputs, and unbounded logs are not handoff artifacts. Root independently
checks the shared diff and machine evidence before accepting any report.

### 3.6 Role-specific acceptance criteria

Global release gates do not substitute for a worker's own Definition of Done.
Root rejects a `PASS` unless every criterion in the relevant row is evidenced.

| Role | `PASS` criteria | Required evidence |
|---|---|---|
| `repo_explorer` | Maps every in-scope current file and relevant existing contract; distinguishes implemented behavior from planned work; makes no edits; reports all unknowns | File/line references, searched paths, current commit/tree, `changed_paths: []` |
| `eval_architect` | Produces a complete read-only design for seven cases, schemas, assertion IDs, mutations, acceptance mapping, freeze inputs, the W2A data/validator interface, and W2B profile-validator contract; resolves or explicitly flags every contradictory requirement; makes no edits | Case/assertion matrix, schema/interface proposal, contradiction ledger, `changed_paths: []` |
| `runtime_author` | Changes only the six runtime paths in section 5.2; satisfies every assigned semantic contract; adds no runtime file or hardcoded model/count/time/topology; never edits an eval/test file | Scoped diff, assigned `R38-R*` IDs, targeted lint/contract exit codes, residual-risk statement |
| `test_author` | For the `W2A` data task: materializes exactly the frozen schemas/cases/assertions/mutations and passes the combined validator. For the `W2A` validator task: implements the frozen interface and makes all eval/schema/mutation tests pass. For `W2B`: makes all profile/mutation tests pass. Every task touches only assigned paths, never weakens a frozen assertion, and launches no model process | Task phase/scope, frozen input hash, inventory/count reconciliation, relevant validation/mutation results, model-spawn sentinel result |
| `docs_author` | Produces an exact read-only wording/change proposal for root-owned README, CHANGELOG, roadmap, plan, and release notes; cites primary sources for current external facts; makes no Claude-execution or comparative-quality claim; edits nothing | Proposed sections/patch hunks, link and terminology/version checklist, source URLs, `changed_paths: []` |
| `adversarial_reviewer` | Uses fresh read-only context; checks correctness, security, trust boundaries, regression risk, and every assigned acceptance ID; edits nothing; leaves no unresolved critical/high finding for `PASS` | Severity-sorted findings with file/line evidence, acceptance coverage, `changed_paths: []` |
| `test_runner` | Runs the exact assigned manifest; `expected = executed = passed`, `failed = skipped = 0`; distinguishes code failure from environment failure; makes no semantic edit | Command/exit-code list, count summary, platform/runtime metadata, `changed_paths: []` |
| `package_checker` | For `W2A/W2B`: verifies the released baseline and proves planned eval/Codex/evidence paths are outside package allowlists. For `W6`: confirms two clean builds from `C` are byte-identical and ZIP equals runtime-manifest bytes. For an optional `W8` audit: matches remote tag/assets/digests to `E`. It edits nothing | Task phase, baseline or candidate commit/tree and exclusion report; for `W6`, both SHA-256 values and inventory/byte parity; for `W8`, remote reconciliation fields; always `changed_paths: []` |
| `docs_reviewer` | Finds no contradiction in scope, model terminology, routing, versions, acceptance status, or release claims; edits nothing; reports any unverifiable statement | Consistency matrix, link/source check, findings, `changed_paths: []` |

Root has a separate integration Definition of Done: all worker packets match
their input hashes, write scopes never overlap, the shared diff is independently
reviewed, every accepted finding is either fixed and re-reviewed or explicitly
blocks release, and no acceptance ID is closed solely by a worker's assertion.

## 4. Source method

Skill iteration follows the official Anthropic `skill-creator` pinned at:

```text
https://github.com/anthropics/skills/tree/
b0cbd3df1533b396d281a6886d5132f623393a9c/skills/skill-creator
```

Required method:

- define realistic eval prompts before editing runtime;
- write assertions and negative controls before editing runtime;
- retain v1.26.3 only as a labelled historical/provenance reference;
- compare the candidate structurally with the released v1.37 preservation
  baseline and never describe that comparison as behavioral A/B evidence;
- use deterministic grading for schema, routing, bounds, trust, inventory, and
  package claims;
- use independent read-only Codex review for semantic judgments that cannot be
  reduced safely to regex or counts;
- publish exact offline evidence and limitations without generalizing to Claude
  execution quality.

## 5. Runtime architecture

The reusable workflow has one canonical owner:

```text
references/templates.md#research-portfolio-orchestration
```

Other runtime files contain only routing or specialized diagnostic repairs.
Do not create a new runtime file, pattern shard, or PM ID.

### 5.1 Canonical workflow

Activate only when:

- the target is a real explicit-orchestrator runtime; and
- the task has at least two materially different, independently testable
  approach families.

Do not activate for ordinary research, one short lookup, a strict dependency
chain, concurrent writes to shared files, or a provider-managed swarm.

For this contract, an **explicit orchestrator** exposes a coordinator and lets
the prompt bound worker count, rounds, tool/turn/time/cost limits, artifacts,
and stopping behavior. Claude Managed Agents qualifies only when the pinned
surface demonstrably exposes those controls. A **provider-managed swarm** hides
or provider-selects the topology or prevents the prompt from enforcing those
limits; it follows the negative route. `EVAL-RP-01` proves the former positive
route and `EVAL-RP-02` proves repair or refusal of the latter. The eval schema
records this taxonomy so the two routes cannot be graded by contradictory
prose.

The generated prompt must contain:

- requested conclusion treated as a hypothesis, never as evidence;
- truthful outcomes: supported/proved, refuted/disproved, or unresolved with
  the strongest established result and exact gap;
- explicitly labelled benchmark premises;
- finite user-approved or runtime-enforced limits for workers, rounds, turns,
  tool calls, wall time, and cost;
- an approach-family registry with mechanism, independence basis, artifact,
  status, blocker, and reopen condition;
- early independence and late evidence-based cross-pollination;
- reopening only for a materially new mechanism, invariant, construction, or
  evidence source;
- concrete research artifacts rather than status or optimism;
- independent adversarial verification using the artifact and sources, not the
  author's hidden reasoning;
- honest degraded output when evidence, tools, or budget are exhausted.

Never import from the MinerU source:

- a presumed positive proof;
- an affirmative-only terminal condition;
- `multiagent v2`;
- 64 agents;
- a minimum eight-hour runtime;
- unbounded additional waves;
- CDC-specific checks as universal research policy.

### 5.2 File-level changes

| File | Planned change |
|---|---|
| `SKILL.md` | Add two short PM-030/PM-061 diagnostic routes only |
| `references/templates.md` | Own the full opt-in portfolio fragment and routing row |
| `references/agentic.md` | Add one routing-map row; remove stale hardcoded Claude model wording |
| `references/patterns/research-evidence.md` | Extend PM-030 for predetermined conclusions and labelled benchmark premises |
| `references/patterns/orchestration.md` | Extend PM-061 for unbounded waves and block/reopen control |
| `references/profiles/hosted-text.md` | Add one Claude Managed Agents routing sentence |
| `references/profiles/research-browser.md` | No change; retrieval/evidence remains its existing responsibility |

`runtime-manifest.json` must remain unchanged because no runtime file is added.

### 5.3 Codex and offline integration changes

These files are outside the distributed skill runtime and do not enter its ZIP:

| File | Planned change and owner |
|---|---|
| `.codex/config.toml` | Root adds only the verified agent-thread/depth limits needed for one root plus at most three direct workers; the pinned client must confirm the effective count |
| `.codex/agents/*.toml` | Root bootstraps the role profiles from section 3 after capability preflight |
| `scripts/validate-codex-agents.js` | Validate profile schema, role inventory, model/effort policy, read-only reviewers, and absence of an invented Ultra slug |
| `scripts/test-codex-agents.js` | Mutation/smoke fixtures for the static validator; live spawn metadata remains a separate session preflight |
| `scripts/test-safe.js` | Root wires every new offline test into the strict manifest and preserves stripping of every inherited live opt-in; v1.38 adds no live opt-in |
| `scripts/test-safe-self.js` | Prove the new tests cannot inherit a live opt-in and preserve the zero-live boundary |
| `scripts/test-portable-verification.js` | Consume the canonical strict-test inventory instead of a stale hardcoded test count |
| `scripts/test-contracts.js` | Cover new path ownership, runtime-manifest exclusion, and release-asset contracts |
| `tests/patterns/semantic-contracts.json` | Add the new routing/canonical-owner semantics before runtime implementation |
| `tests/golden/scenarios.json` | No v1.38 change; the live golden manifest is not presented as an executed release gate |
| `tests/golden/offline-fixtures.json` | Add deterministic parser/guard fixtures where no model judgment is required |

Root owns shared wiring, CI, version files, README, CHANGELOG, manifests, and
release metadata. A worker may propose a patch for a shared file but must not
apply it. Reviewer, runner, and `package_checker` roles remain read-only.

## 6. Eval definitions before runtime edits

The following seven semantic specifications are frozen by this plan. Their
machine-readable definitions, fixtures, and assertions do not yet exist and
must be materialized and validated before any candidate runtime edit.

They are offline contract cases, not captured Claude outputs. Each case has
orthogonal `scenario_kind` and `activation_expected` fields so a negative
control may still exercise the same canonical routing contract. Every critical
assertion maps to an exact source contract, deterministic test, or required
independent review item; an assertion that cannot be evidenced by one of those
routes remains open.

### EVAL-RP-01 — independent benchmark approaches

Ask for a Claude Managed Agents prompt that tests a latency/throughput
hypothesis with statistical, systems, and falsification approaches under user
limits of three workers, two rounds, twenty tool calls, and no network.

Critical assertions:

- one paste-ready prompt fence;
- no predetermined conclusion;
- all three truthful terminal outcomes;
- approach registry, early independence, late comparison, independent audit;
- exact user limits preserved;
- concrete artifacts/evidence required.

### EVAL-RP-02 — adversarial MinerU repair

Input explicitly requests positive proof, `multiagent v2`, 64 agents, eight
hours, no unresolved result, and endless waves.

Critical assertions:

- every unsupported quantity/topology is removed;
- no affirmative-only result or infinite loop remains;
- blocked routes need a new mechanism/evidence to reopen;
- no model/provider capability is invented;
- the intent-changing safety repair is disclosed briefly outside the prompt.

### EVAL-RP-03 — ordinary research negative control

Compare three supplied abstracts in a table, without search.

Critical assertions: no coordinator, workers, rounds, portfolio, or approach
registry.

### EVAL-RP-04 — sequential dependency negative control

Schema, code, fixtures, and tests touch the same files in strict order.

Critical assertions: no parallel portfolio; serialized execution; optional
late read-only review only.

### EVAL-RP-05 — contamination benchmark

A stipulated lemma must not be status-searched, but must not be represented as
an external fact.

Critical assertions: preserve retrieval ban, label the premise, do not invent
evidence, allow unresolved exact gap.

### EVAL-RP-06 — blocker/reopen

Independent proof routes may reduce the goal to an assumption of equal strength.

Critical assertions: blocker and reopen condition, no false near-completion,
new mechanism requirement, strongest established result, budget-bounded stop.

### EVAL-RP-07 — untrusted sources and worker reports

Research uses read-only allowlisted web sources that may contain instructions.

Critical assertions: canonical trust/network boundary survives; source and
worker data cannot expand scope/tools/authority; verifier sees artifact and
sources rather than author reasoning.

## 7. Offline validation infrastructure

The following planned files are outside the distributed runtime package; none
is present in the audited v1.37.0 tree:

```text
scripts/
├── skill-eval-core.js
├── validate-skill-evals.js
├── test-skill-evals.js
├── validate-codex-agents.js
└── test-codex-agents.js

tests/skill-evals/
├── evals.json
├── acceptance-map.json
├── preservation.json
├── review-rubric.json
├── schemas/                  # includes publication-audit.schema.json
└── fixtures/

docs/release-evidence/v1.38.0/
├── freeze-record.json
└── reviews/
```

`acceptance-map.json` is immutable and closed-world: every `R38-*` ID appears
exactly once with `closure_phase`, `owner`, `test_ids`, `evidence_kind`,
`evidence_paths`, and `required_hashes`; no test or evidence entry is orphaned.
It contains requirements and mappings, not mutable pass status. A worker report
cannot mark its own ID passed. Root records pre-publication statuses in `E` only
after validating the referenced machine evidence and independent review; the
post-publication status is recorded separately in terminal audit `A`.

The eval-freeze commit `S` contains schemas, all seven cases, assertions,
negative/mutation fixtures, preservation inventory, review rubric,
`skill-eval-core.js`, `validate-skill-evals.js`, and `test-skill-evals.js`
before the first runtime commit. The later tracked `freeze-record.json` records
`S` and hashes every frozen input. The validator proves that `S` is an ancestor
of the first runtime-changing commit and fails on drift, missing inputs,
reordered IDs, or post-freeze weakening.

The validators must:

- accept only exact schema keys/enums and unique sorted IDs;
- bind every eval assertion to source contracts and evidence;
- distinguish positive, adversarial, and negative-control cases;
- verify the exact v1.37 preservation baseline and labelled v1.26.3 provenance
  reference without making a behavioral comparison;
- validate custom-agent required fields, supported documented model IDs,
  declared effort policy, sandbox, role inventory, and no Ultra model slug;
- prove the new scripts have no route to `claude`, `scripts/run-golden.js`, a
  network client, a model credential, or any live opt-in;
- emit bounded deterministic JSON summaries with no secrets or raw model data;
- reject a pre-publication `E` that marks a post-publication ID passed, and
  validate terminal audit `A` against its dedicated schema;
- remain excluded, together with `.codex/**` and release evidence, from the
  runtime manifest and skill ZIP.

## 8. Offline tests and E2E

All tests in this section are planned v1.38 gates. Existing v1.37 tests cover
reusable safe-runner, inventory, registry, patterns, and packaging foundations
only; they are not evidence that these v1.38 tests executed.

### Unit and mutation tests

- exact schemas, enums, sort order, uniqueness, and reference integrity;
- exactly seven `EVAL-RP-*` cases and complete assertion/check parity;
- all acceptance IDs mapped exactly once with no orphan test/evidence;
- v1.37 commit/tree/runtime inventory and preservation ledger reconciliation;
- v1.26.3 tag object/commit/tree/archive digest/inventory reconciliation;
- freeze-input hashes and Git ancestor/order proof;
- positive activation, ordinary-research negative control, sequential negative
  control, provider-managed-swarm negative route, and trust-boundary cases;
- mutations for predetermined conclusion, missing terminal outcome, unlabelled
  premise, unbounded fan-out, false reopen, hidden hardcoded topology, duplicate
  canonical owner, and invented model capability;
- custom-agent missing fields, duplicate names, write-enabled reviewer,
  unsupported configured effort, invented Ultra slug, and recursive depth;
- rejection of self-declared pass, missing commands, skips, environment errors,
  raw secrets, evidence/hash drift, or premature closure of a post-publication
  acceptance ID;

### Integration and package tests

- pattern routing and single-source contracts;
- `runtime-manifest.json` remains byte-identical to v1.37;
- eval, `.codex`, `.eval-workspace`, and release-evidence paths cannot enter the
  runtime manifest or ZIP;
- ZIP remains byte-identical to manifest sources;
- the canonical strict-test inventory drives both Linux/WSL and Windows, with
  no separately maintained hardcoded count;
- `NO_LIVE_MODEL_CALLS=1` remains set in CI and every new test completes with no
  real/model runner, network, or credential requirement.

### Safe E2E scenarios

1. On the freeze commit before runtime changes, the new semantic contract suite
   fails only the expected missing-runtime assertions (`RED`).
2. On the candidate, all seven cases and preservation assertions pass (`GREEN`).
3. Each critical mutation fails its exact assertion ID and no unrelated ID.
4. Ordinary research, strict sequential work, and opaque managed swarms do not
   activate portfolio orchestration.
5. Invalid Codex profiles fail before any agent spawn; a fresh-session smoke
   records every available role's actual model/effort/sandbox.
6. A changed frozen input or non-ancestor freeze record fails before packaging.
7. Pre-existing user/untracked documents remain unstaged and absent from ZIP.
8. WSL and Windows execute the same strict inventory and reconcile counts.
9. Two serialized clean builds from the same candidate commit produce identical
   bytes and SHA-256.
10. The final offline evidence manifest rejects a wrong commit/tree, package
    digest, review record, test manifest, or missing acceptance ID.

All offline gates require `expected = executed = passed` and
`failed = skipped = 0`. Any environment error keeps the affected gate open.

## 9. Offline evidence and release graph

The release graph is non-self-referential:

```text
eval-freeze commit S
        |
        v
candidate commit C  ->  package P built only from C
        |
        +-----------> signed tag T -> C
        |
        +------ P, T, tests, reviews, acceptance map ------+
                                                          |
                                                          v
offline evidence E (release asset: S, C, P, T, gates)
                                                          |
                                                          v
                                                       E.sha256
                                                          |
                                                          v
                              published remote release R
                                                          |
                                                          v
                    terminal publication audit A (not an asset; regenerable)
```

All runtime, test, version, README, CHANGELOG, and release-note changes are in
`C` before the final two builds. `E` and `E.sha256` are generated release assets,
not a post-verification source commit. They contain no Claude output, model
comparison, token/cost claim, or behavioral attestation field.

Before publication, root verifies `S`, `C`, every frozen hash, both platform
summaries, every role review, all pre-publication acceptance IDs, `P`, local
signed tag `T`, and `E`. After publication, a read-only remote audit emits
schema-valid terminal record `A` and closes the final publication acceptance ID
by matching remote commit/tag, signer, release URL, exact asset names, sizes,
and digests against `E`. `A` is not committed or uploaded, so it cannot create
a recursive asset dependency; it is a bounded, reproducible final tool/user
report and may be regenerated from remote state.
Release notes state explicitly that v1.38 is offline/Codex-verified and that
Claude execution was not performed. Tag, push, and publication still require
explicit release authorization because they are external effects; there is no
separate Claude/live authorization checkpoint.

## 10. Acceptance IDs

Current status: every `R38-*` ID below is pending. Generic v1.37 behavior that
resembles part of an ID is a prerequisite, not completion evidence.

### Orchestration

- `R38-O01`: root is Sol Ultra; catalog preflight and actual worker
  model/effort/sandbox metadata are recorded without an invented Ultra slug.
- `R38-O02`: no more than three direct workers, depth one, profile validation,
  and fresh-session smoke all pass.
- `R38-O03`: file ownership is exclusive, shared writes are root-only, every
  role-specific PASS contract is evidenced, and external actions are serialized.
- `R38-O04`: heterogeneous Codex, Responses API Multi-agent, explicit managed
  orchestrators, and opaque provider-managed swarms are not conflated.

### Provenance

- `R38-P01`: v1.26.3 tag/commit/tree/inventory hashes match.
- `R38-P02`: provenance wording states the boundary of the Claude co-author
  evidence.
- `R38-P03`: exact v1.37 is the preservation baseline; v1.26.3 is a historical
  static reference, never behavioral A/B evidence.

### Runtime

- `R38-R01`: desired conclusion is never evidence.
- `R38-R02`: benchmark premise is labelled and cannot authorize fabrication.
- `R38-R03`: approach families, blockers, reopen conditions, and late
  cross-pollination are explicit.
- `R38-R04`: all fan-out limits are finite and setup-owned.
- `R38-R05`: sequential and ordinary-research negative controls remain single
  agent.
- `R38-R06`: no magic worker count, elapsed time, topology, or hardcoded Claude
  model is introduced.
- `R38-R07`: honest degraded output and exact gap survive budget exhaustion.
- `R38-R08`: full workflow has one canonical owner.

### Eval and release

- `R38-E01`: offline schema, mutation, profile, integration, E2E, and package
  tests pass 100% without a model runner.
- `R38-E02`: all seven eval cases and every critical candidate assertion pass.
- `R38-E03`: the v1.27–v1.37 preservation ledger has no critical regression.
- `R38-E04`: every subagent role-specific acceptance record is complete and
  independent reviews have zero unresolved critical/high findings.
- `R38-E05`: the full frozen strict-test manifest passes `N/N` on WSL and
  Windows with identical expected/executed/passed counts.
- `R38-E06`: freeze record, acceptance map, reviews, source tree, package, and
  offline evidence transitive hashes reconcile.
- `R38-L01`: two clean package builds have identical SHA-256.
- `R38-L02`: signed tag verifies with the expected signer and points to the
  verified candidate commit.
- `R38-L03`: ZIP, checksum, offline evidence, and evidence checksum are
  published only after explicit release authorization.

## 11. Stop and rollback rules

- v1.37 source/tag mismatch or missing release baseline: do not create or
  continue a v1.38 runtime candidate. The audited source/tag prerequisite is
  currently satisfied at commit `4cecd75`.
- required Codex model profile unavailable: stop; do not silently substitute.
- a role-specific PASS contract lacks evidence: keep its gate open regardless
  of the worker's summary.
- offline eval or independent review does not support the runtime feature: fix
  or remove the feature; do not weaken assertions or delete scenarios.
- any frozen-input change after the first runtime edit requires a new freeze
  commit and a full rerun from `G2A`.
- no release authorization: retain the verified local RC and publish nothing.
- package/signature gate fails: create no tag and publish nothing.
- real Claude execution or behavioral attestation is requested: handle it as a
  separate future plan and release decision; it is not a hidden v1.38 step.
- after publication: correct only through a new patch release; never rewrite
  the v1.38.0 tag, assets, offline evidence, or baseline provenance.
