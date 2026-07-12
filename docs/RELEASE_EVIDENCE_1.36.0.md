# Release evidence — v1.36.0

Status: frozen release evidence for the authorized v1.36.0 publication.
Prepared: 2026-07-12
Verification boundary: deterministic offline checks only; `NO_LIVE_MODEL_CALLS`.

## Scope

- `references/patterns.md` is a compact compatibility router rather than the
  full catalog.
- `references/patterns/index.json` and `schema.json` preserve 61 stable IDs:
  60 active patterns plus the merged `PM-036` tombstone.
- Nine bounded family shards own provider-neutral failure mechanisms; normal
  diagnosis loads one primary shard and an explicit composite may load one
  additional shard.
- Runtime, profiles, templates, README, and installation guidance use the same
  canonical ownership, evidence, retry, approval, context, and cost contracts.
- Package inventory grows from 33 to 44 exact allowlisted runtime files.

## Deterministic verification

Command:

```text
node scripts/test-safe.js --strict
```

Result:

```text
safe-gate self-tests                10/10
registry validation/mutations       53/53
pattern registry mutations          47/47
pattern routing/source contracts      6/6
pattern package contracts             4/4
runtime inventory mutations           9/9
source contracts                     10/10
hook fixtures                        25/25
Codex layout adversarial checks        9/9
Codex hook tests                       6/6
offline golden fixtures              71/71
run-golden fake-runner safety          7/7
lint                          0 errors, 0 warnings

SUMMARY expected=14 executed=14 passed=14 failed=0 skipped=0
```

The pattern validator reports 61 indexed records, 60 active records, one
tombstone, and nine shards. The fact registry remains 18 shards, 108 records,
and 65 routes. `SKILL.md` remains inside its 250-line body budget.

## Deterministic package

Two consecutive local candidate builds produced the same ZIP and passed exact
manifest plus byte-for-byte source parity checks:

```text
artifact: dist/prompt-master-1.36.0.zip
files:    44
SHA-256:  0d1fee0239e689e495c1a7052757dffc650617cb215ddd56cde90b6fb890e9fd
```

The release workflow must repeat a clean-tree build after the release commit;
any SHA drift blocks tag publication and upload.

## Independent review

- Semantic review found and closed retry-cap, approval-boundary, evidence,
  sensitive-data, prototype/blindspot, canonical-owner, and premise-worker
  contradictions.
- Validator review found and closed direct-loader path trust, moved anchors,
  deprecated redirects, root-key ordering, safe-gate working-directory, and
  real-Claude reachability weaknesses.
- Final closure checks found no remaining Important blocker and independently
  confirmed all 44 ZIP entries were byte-identical to source.

## Safety and limitations

- `scripts/run-golden.js`, `claude -p`, and real Claude/Codex/OpenAI model
  runners were not executed.
- The strict gate created POSIX and Windows deny shims, prepended them to
  `PATH`, and failed closed on any invocation marker. This is source/harness
  coverage, not a claim of full Windows CI parity.
- Recorded routing and semantic fixtures are source contracts, not live model
  behavioral attestation.
- Behavioral attestation remains conditional and requires separate explicit
  authorization for a future release.

## Publication controls

- Publication authorization was granted on 2026-07-12.
- Intentional path-only staging is required. The pre-existing untracked
  `docs/CODEX_HANDOFF_2026-07-11.md`,
  `docs/Model_guidance_5_6_OpenAI_API.md`, and
  `docs/refacktoring/MinerU_markdown_202.md` stay outside the release.
- Create the signed tag only after the release commit and verify it before push.
- Push the commit and exact tag, create the GitHub Release, then attach both the
  deterministic ZIP and its SHA-256 sidecar.
