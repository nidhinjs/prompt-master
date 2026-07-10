# v1.33.0 Release Evidence

Status: local release candidate complete; publication authorized separately
Baseline recorded: 2026-07-10
Coordinator baseline: `v1.32.0` / `a44a3f733b75ea32ff0138a5dcd076f57ba56633`

## Baseline

- Tracked worktree: clean before implementation.
- Preserved untracked user files: `AUDIT_REPORT_2026-07-10.md`,
  `docs/Model_guidance_5_6_OpenAI_API.md`, and
  `docs/RELEASE_ROADMAP_1.33_PLUS.md`.
- Golden scenarios: 68 records / 68 unique IDs.
- Offline fixtures: 53 records / 27 scenario IDs.
- Source-contract suites: 8.
- Strict safe gate: `expected=7 executed=7 passed=7 failed=0 skipped=0`.
- Runtime inventory at baseline: six tracked files.
- No live Claude command was authorized or executed.

Baseline runtime SHA-256:

| File | SHA-256 |
|---|---|
| `SKILL.md` | `6af141ac9f394f3d937dba3008e785776cb863c31f6a05f51c685e79a30116ae` |
| `references/agentic.md` | `e315109291c2bbe9b522b34c34d2e37286a70f0637e5d100f6359cb406002735` |
| `references/models.md` | `80b4d16ff030cb4be7d1db7111a0b97856374cf0ab492975d278735227670b9b` |
| `references/patterns.md` | `2c32467f4c3505c8e90b9dc480749215941548730b0749244fc9773dfbc36226` |
| `references/templates.md` | `ada7bc71e3d12fc150d5ece5b26518dc93262ebd74b61404689a9294fa57b661` |
| `references/tool-profiles.md` | `6a7efd14e4d44334ebfdd7109981a507e210ed9e9ff31559840bd08d52eb2222` |

## Frozen registry architecture

The schema is frozen before profile/runtime fan-out with these invariants:

- record granularity is model/version by surface when availability differs;
- record IDs are stable `vendor.model.surface` identifiers;
- `channel` is one of `production`, `preview`, `beta`, `legacy`,
  `deprecated`, or `retired`;
- availability status is one of `public`, `limited`, `account_gated`,
  `region_gated`, `unavailable`, or `sunset_scheduled`;
- route aliases and defaults exist only in `references/facts/index.json`;
- exact no-CoT membership exists only as the `no_cot` prompting constraint;
- each record has an ISO `last_verified` date and at least one official source;
- claim keys, recommendation tags, and prompting-constraint tags are controlled
  by `references/facts/schema.json`;
- every source reference declares the fields or claims it supports;
- shards use kebab-case provider-family names and the index is the sole shard
  inventory; empty shards are forbidden.

Frozen provider-family shard namespace:

`anthropic`, `openai`, `google`, `xai`, `deepseek`, `minimax`, `alibaba`,
`moonshot-ai`, `zai-bigmodel`, `perplexity`, `gamma`, `meta`, `mistral-ai`,
`ollama`, `midjourney`, `stability-ai`, `black-forest-labs`, `bytedance`,
`runway`, `kling-ai`, `lightricks`, `luma-ai`, `elevenlabs`, `snowflake`,
`github`, `cursor`, `windsurf`, `cline`, `vercel`, `bolt`, `lovable`, `figma`,
`devin`, `manus`, `zapier`, `make`, `n8n`, `meshy`, `tripo`, `rodin`, and
`comfyui`.

Only populated shards are created. Adding a provider family outside this set is
an architecture change owned by the coordinator.

## Exclusive write scopes

| Owner | Exclusive scope |
|---|---|
| Worker A | `references/facts/**`, `references/models.md`, registry migration-map fixture |
| Worker B | `references/profiles/**`, `references/tool-profiles.md` |
| Worker C | `SKILL.md`, `references/templates.md`, `references/patterns.md`, registry/lint/contract/safe/package scripts and fixtures |
| Coordinator | version metadata, public docs, changelog, evidence ledger, final inventory and artifacts |

Worker C receives packaging ownership only after Workers A and B freeze the
runtime inventory. Workers may not run live Claude commands, publish, tag,
install dependencies, or edit outside their scopes.

## Acceptance ledger

Final integrated inventory:

- Registry: 18 populated shards, 98 records, 55 route aliases.
- Profiles: 7 reachable workflow bundles and 36 legacy-compatible route rows.
- Runtime manifest: 33 sorted, unique, literal files.
- `SKILL.md` body: 230 lines of the 250-line budget.
- Migration map: 177/177 legacy `models.md` lines and 160 volatile legacy
  `tool-profiles.md` lines classified.

Final deterministic checks:

| Check | Result |
|---|---|
| `node scripts/validate-registry.js` | PASS: 18 shards / 98 records / 55 routes / 7 profiles |
| `node scripts/test-registry.js` | PASS: 50/50 |
| `node scripts/validate-runtime-inventory.js` | PASS: 33 exact runtime files |
| `node scripts/test-runtime-inventory.js` | PASS: 9/9 |
| `node scripts/test-contracts.js` | PASS: 9/9 |
| `node scripts/lint.js` | PASS: 0 errors / 0 warnings |
| `scripts/lint.ps1` | PASS: same canonical checks as Node lint |
| `node scripts/test-safe.js --strict` | PASS: `expected=9 executed=9 passed=9 failed=0 skipped=0` |
| `git diff --check` | PASS |

The final package was built twice from the tracked manifest with `-AllowDirty`.
Both builds produced:

`6e2226b24a96c27a4c4a38dfe945732a4bbea8e461f1b19198716ff201465ad8  prompt-master-1.33.0.zip`

The package script compared every ZIP entry with its source SHA-256 and rejected
unlisted, missing, duplicate, wildcard, traversal, and non-file entries.

Acceptance result:

- `A33-01` through `A33-07`: PASS.
- `B33-01` through `B33-07`: PASS.
- `C33-01` through `C33-09`: PASS.
- `K33-01`: PASS — baseline and exclusive scopes were recorded before fan-out.
- `K33-02`: PASS — independent read-only review found and then verified fixes
  for two High volatile-fact leaks in Templates K/O.
- `K33-03`: PASS — active version sources say `1.33.0`.
- `K33-04`: PASS — strict offline gate has zero failures/skips.
- `K33-05`: PASS — consecutive package hashes and source parity agree.
- `K33-06`: DEFERRED FROM IMPLEMENTATION — commit, signed tag, and push require
  a separate publication authorization and external Git evidence. That
  authorization was granted after this implementation ledger was completed;
  the immutable tag/remote state is the final evidence for this criterion.

No real Claude command, live golden run, dependency installation, or networked
CI was executed while building and validating the release candidate. Release
publication is a separate operation performed only after explicit approval.

## Recorded architecture exception

Routes whose legacy guidance contains no volatile provider/model claim use the
machine-readable `none (evergreen-only)` fact sentinel instead of a fabricated
registry record. This applies to generic/open-weight, builder, browser, coding,
3D, workflow, decompiler, and fallback routes only when their profile contains
no model ID, current default, release channel, availability claim, or
version-tied parameter. Routes with any such volatile claim must resolve to
exactly one real registry alias/provider shard. Validators must reject dangling
aliases and reject use of the sentinel to hide a volatile claim.

This is a deliberate least-authority refinement of the roadmap sentence that a
simple route loads one fact shard: zero fact shards is valid when there is no
fact to load; inventing an unsupported provider fact is not.
