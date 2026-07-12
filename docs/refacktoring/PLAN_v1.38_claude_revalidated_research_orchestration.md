# Plan v1.38.0 — Claude-Revalidated Research Portfolio Orchestration

Status: approved implementation plan; runtime candidate blocked until v1.37.0
is published.

Prepared: 2026-07-12

Implementation surface: heterogeneous local Codex.

ChatGPT Work remains a separate hosted topology and is not used to execute
this implementation plan.

Target runtime: Claude-first `prompt-master` skill.

Live boundary: real Claude execution requires new explicit authorization in the
active conversation.

## 1. Release decision

Release `v1.38.0` combines one bounded runtime improvement with the behavioral
attestation already reserved in the roadmap:

> Claude-Revalidated Research Portfolio Orchestration

The feature and its Claude revalidation are one release gate. Offline
infrastructure may be implemented without model access, but `v1.38.0` must not
be published without an authorized, complete A/B run and human review.

Dependency order:

1. publish v1.37.0 Portable Verification and Historical Provenance;
2. create the v1.38 candidate from that published commit;
3. freeze evals and assertions before runtime edits;
4. implement the candidate and pass offline/fake gates;
5. obtain explicit live authorization;
6. perform paired Claude A/B, candidate-only checks, and full attestation;
7. publish only the attested commit.

## 2. Provenance baselines

Behavioral `old_skill`:

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

This is the last Git-provenance baseline whose release commit records Claude as
co-author. The statement does not prove that Claude was never used after that
commit; it defines the last auditable Git marker.

The current v1.36/v1.37 line is not an A/B comparator. It supplies:

- the candidate source tree;
- a preservation ledger for every v1.27–v1.37 capability;
- absolute candidate-only assertions for Codex, GPT-5.6, registry, packaging,
  and safety features that v1.26.3 did not contain.

## 3. Heterogeneous Codex execution topology

Root execution mode:

```text
GPT-5.6 Sol Ultra
```

Ultra owns decomposition, delegation, integration, conflict resolution, final
verification, and the user-facing result. It is a Codex orchestration-mode
label, not an API model slug.

Project custom-agent profiles are created under `.codex/agents/` after v1.37 is
published:

| Role | Model | Effort | Write policy |
|---|---|---:|---|
| `runtime-author` | `gpt-5.6-sol` | `xhigh` | Exclusive runtime paths only |
| `test-author` | `gpt-5.6-sol` | `high` | Exclusive test/eval paths only |
| `docs-author` | `gpt-5.6-terra` | `medium` | Exclusive docs paths only |
| `adversarial-reviewer` | `gpt-5.6-sol` | `xhigh` | Read-only fresh context |
| `test-runner` | `gpt-5.6-luna` | `medium` | No semantic edits |
| `package-checker` | `gpt-5.6-luna` | `low` or `medium` | Read-only inventory/hash work |
| `docs-reviewer` | `gpt-5.6-terra` | `high` | Read-only consistency review |

Operational limits:

- at most three active workers plus root;
- `agents.max_depth = 1`;
- workers do not spawn workers;
- no overlapping write scopes;
- writes, integration, approvals, and external effects are serialized;
- structural assertions are executed by code, not decided by an LLM;
- evidence records the actual model, effort, Codex client version, and date;
- unavailable profiles fail closed; no silent model substitution.

This heterogeneous topology is not the Responses API Multi-agent beta, whose
subagents share the request model. The API topology is documented only as a
separate homogeneous limitation and is not used to execute this plan.

## 4. Source method

Skill iteration follows the official Anthropic `skill-creator` pinned at:

```text
https://github.com/anthropics/skills/tree/
b0cbd3df1533b396d281a6886d5132f623393a9c/skills/skill-creator
```

Required method:

- define realistic eval prompts before editing runtime;
- write assertions before viewing outputs;
- compare candidate with `old_skill`, not with no skill;
- run paired configurations with identical prompt/model/effort;
- capture timing and token usage immediately;
- use deterministic grading where possible;
- use blind semantic comparison and human review;
- publish aggregate deltas and variance without generalizing beyond the suite.

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

## 6. Eval definitions before runtime edits

The following seven evals are frozen before candidate implementation.

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

## 7. Offline eval infrastructure

Tracked files remain outside the runtime package:

```text
scripts/
├── skill-eval-core.js
├── validate-skill-evals.js
├── run-skill-ab.js
├── test-skill-evals.js
├── test-run-skill-ab-safe.js
└── fakes/fake-claude-eval.js

tests/skill-evals/
├── evals.json
├── release-suite.json
├── baseline.json
├── schemas/
└── fixtures/
```

Generated output lives only in ignored `.eval-workspace/`.

The harness must:

- materialize candidate and baseline full skill trees from immutable Git objects;
- create identical temporary minimal plugin wrappers;
- use fresh paired processes with identical prompt, model, effort, and options;
- refuse live execution by default and under `NO_LIVE_MODEL_CALLS=1`;
- calculate call budget before spawning;
- use `process.execPath + absolute fake script` for scenario output and make
  inert POSIX/Windows sentinels the entire temporary PATH so the real CLI is
  unreachable even if the preload guard regresses;
- classify passed, assertion failure, model error, timeout, environment error,
  and incomplete pair separately;
- redact raw output and secrets from attestation;
- bind every result to candidate/baseline, prompt, eval, policy, runner, and
  scenario-manifest hashes;
- keep the attestation checksum in a non-self-referential sidecar.

## 8. Offline tests

### Unit and mutation tests

- schema exact keys and enums;
- unique/sorted eval and baseline inventories;
- regex compilation and expectation/check parity;
- baseline tag/commit/tree/inventory verification;
- prompt/model/options equality across each pair;
- count reconciliation;
- grading evidence shape;
- blind commitment/reveal integrity;
- token/timing presence and aggregate calculations;
- attestation and sidecar hashes;
- rejection of raw outputs, credential literals, partial runs, skips, timeouts,
  environment errors, and failed critical assertions.

### Integration and package tests

- pattern routing and source contracts;
- runtime inventory unchanged;
- eval paths cannot enter runtime manifest or ZIP;
- ZIP remains byte-identical to manifest sources;
- Linux/WSL and Windows run the same strict check list;
- fake runner records zero real-Claude invocations.

### Safe E2E

- no opt-in: exit 2, zero calls;
- `NO_LIVE_MODEL_CALLS=1` overrides every opt-in;
- unbounded suite requires a second opt-in;
- budget refusal happens before spawn;
- one eval/repetition produces exactly two fake calls;
- baseline mismatch refuses before spawn;
- both sides receive identical model/options/prompt;
- timeout/model/environment/assertion failures remain distinct;
- one-sided failure makes the pair incomplete;
- package excludes eval workspace and definitions.

All offline gates require `expected = executed = passed` and
`failed = skipped = 0`.

## 9. Conditional Claude A/B

Do not run until the user explicitly authorizes real Claude in the active
conversation.

Release benchmark minimum:

- at least six shared evals;
- exactly three paired repetitions;
- candidate and old skill use the same pinned Claude model, effort, CLI version,
  activation mode, and fresh-session contract;
- all critical candidate assertions pass;
- candidate shared pass rate is not below baseline;
- no shared eval is lost by candidate in a majority of repetitions;
- blind candidate wins exceed baseline wins;
- unresolved critical losses equal zero;
- human feedback is complete with zero unresolved blockers;
- current frozen legacy golden manifest passes `N/N` with no failure, skip,
  timeout, or environment error;
- token and duration budgets are frozen before execution and published with
  observed variance.

Any runtime edit after the run invalidates the attestation.

## 10. Acceptance IDs

### Orchestration

- `R38-O01`: root is Sol Ultra; actual worker model/effort metadata is recorded.
- `R38-O02`: no more than three direct workers and depth one.
- `R38-O03`: file ownership is exclusive and writes are serialized.
- `R38-O04`: Responses API homogeneous topology is not presented as
  heterogeneous Codex.

### Provenance

- `R38-P01`: v1.26.3 tag/commit/tree/inventory hashes match.
- `R38-P02`: provenance wording states the boundary of the Claude co-author
  evidence.
- `R38-P03`: v1.36/v1.37 is preservation input, never the A/B baseline.

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

- `R38-E01`: offline schema/mutation/fake/package tests pass 100%.
- `R38-E02`: all critical candidate assertions pass.
- `R38-E03`: no critical shared regression against v1.26.3.
- `R38-E04`: blind and human reviews are complete.
- `R38-E05`: full frozen scenario manifest passes `N/N`.
- `R38-E06`: attestation and transitive hashes reconcile.
- `R38-L01`: two clean package builds have identical SHA-256.
- `R38-L02`: signed tag verifies and points to the attested commit.
- `R38-L03`: ZIP, checksum, attestation, and attestation checksum are published
  only after explicit release authorization.

## 11. Stop and rollback rules

- v1.37 not published: do not create a v1.38 runtime candidate.
- required Codex model profile unavailable: stop; do not silently substitute.
- no live authorization: retain an offline RC; do not close PM-05 or publish.
- A/B does not demonstrate value: remove the runtime feature; do not weaken
  assertions or delete scenarios.
- candidate-only or golden attestation fails: fix, freeze a new RC, and obtain a
  new authorization before another live run.
- package/signature gate fails: create no tag and publish nothing.
- after publication: correct only through a new patch release; never rewrite
  the v1.38.0 tag, assets, attestation, or baseline provenance.
