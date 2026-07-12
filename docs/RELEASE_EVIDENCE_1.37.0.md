# Release evidence — v1.37.0

Status: frozen release evidence for the authorized v1.37.0 publication.

Prepared: 2026-07-12

Verification boundary: deterministic offline checks only;
`NO_LIVE_MODEL_CALLS=1`.

## Scope

- Replace shell-based model-response fixtures with one Node fake launched
  through absolute `process.execPath`; retain minimal POSIX/Windows sentinels
  as the entire temporary PATH behind a direct-call preload guard.
- Run the identical strict-safe command and required-check list on Ubuntu 24.04
  and Windows 2025 in CI.
- Add a machine-readable v1.29 release-asset record, schema, dependency-free
  validator, ZIP parser, mutation tests, and human-readable finding.
- Correct the historical conclusion: the published v1.29 asset matches its tag
  byte-for-byte after decompression. Exact ZIP-container reproducibility is
  `not_attested`; the annotated tag is unsigned.
- Freeze the separate v1.38 implementation contract without changing runtime:
  v1.26.3 baseline, heterogeneous Codex roles, eval-first methodology,
  acceptance IDs, and conditional live/release gates.
- Keep all prompt runtime files and behavior frozen at v1.36.

## Portable deterministic verification

The same command was executed through Linux/WSL Node and Windows Node:

```text
node scripts/test-safe.js --strict
```

Both local executions produced:

```text
safe-gate self-tests                 14/14
registry validation/mutations        53/53
pattern registry mutations           47/47
pattern routing/source contracts       6/6
pattern package contracts              4/4
runtime inventory mutations            9/9
historical provenance tests           41/41
portable verification contracts       11/11
source contracts                      10/10
hook fixtures                         25/25
Codex layout adversarial checks         9/9
Codex hook tests                        6/6
offline golden fixtures               71/71
run-golden fake-runner safety          17/17
lint                           0 errors, 0 warnings

SUMMARY expected=16 executed=16 passed=16 failed=0 skipped=0
```

The release commit must reproduce this result in the shared Ubuntu/Windows
GitHub Actions matrix; tag creation remains blocked until both jobs pass.

## Fake-runner isolation

- The tracked fake is the repository file `scripts/fake-claude.js`; the
  release commit must include it explicitly.
- Scenario output is produced only by `process.execPath + absolute script
  path`. The temporary PATH contains only inert POSIX and Windows denial
  sentinels, so a preload regression still cannot reach an installed real CLI.
- Production/default resolution remains the literal `claude` executable.
- A Node preload guard blocks direct Claude executables, denies `exec`,
  `execSync`, `shell:true`, and direct shell `-c`/`/c` Claude commands, while
  preload-disabled shell fallbacks resolve to the temporary PATH sentinel. The
  Windows fallback never copies or disguises `node.exe` as `claude.exe`.
- Evidence records model, byte counts, and SHA-256 values; prompt text, system
  prompt text, raw argv, credentials, and environment values are not retained.
- Disabled, `NO_LIVE_MODEL_CALLS`, unbounded, over-budget, authentication,
  model-error, per-scenario timeout, suite-timeout accounting,
  assertion-failure, relative-path, ambiguous-config, production-default,
  case-insensitive environment, eight shell-bypass probes, and
  preload-disabled PATH fallback cases all pass offline.

## v1.29 historical provenance

Canonical record:
`docs/provenance/v1.29.0-release-asset.json`.

```text
tag object:  eb7ebeeb40b2e1983884d2b23ebacc1e58e9acb0
commit:      283268be4097741b00aba7c2a191c0c22b0eb181
tree:        a30efb215215f6cd5039bfaeb4eaedba3cbf5774
tag type:    annotated, unsigned
asset ID:    470714067
asset size:  74528 bytes
asset SHA:   f3bcc8a77bda5273dc9ff348eb32939e161df003ed7f6e02ee850b5c0823427f
entries:     5/5 match tagged source bytes
container:   not_attested for exact reproducibility
```

Offline record and mutation result:

```text
node scripts/validate-provenance.js
OK provenance: v1.29.0 entries=5 asset=not-supplied

node scripts/test-provenance.js
OK: 41/41 provenance tests passed
```

The independently downloaded published asset was additionally supplied to the
same validator:

```text
OK provenance: v1.29.0 entries=5 asset=verified
```

The ignored six-entry `dist/prompt-master-1.29.0.zip` is preserved untouched
but is explicitly non-authoritative; it was not the published GitHub asset.

## Deterministic package

Two consecutive local builds produced the same ZIP and passed manifest,
inventory, normalized-timestamp, and source-byte parity checks:

```text
artifact: dist/prompt-master-1.37.0.zip
files:    44
SHA-256:  0d1fee0239e689e495c1a7052757dffc650617cb215ddd56cde90b6fb890e9fd
```

The runtime payload is intentionally byte-identical to v1.36 because v1.37
does not change runtime prompt behavior; its other repository changes are
verification, provenance, and the future v1.38 implementation contract.

## Publication controls

- Publication authorization was granted on 2026-07-12.
- Intentional path-only staging is required. The pre-existing untracked
  `docs/CODEX_HANDOFF_2026-07-11.md`,
  `docs/Model_guidance_5_6_OpenAI_API.md`, and
  `docs/refacktoring/MinerU_markdown_202.md` stay outside the release.
- Push the release commit and require both remote matrix jobs to pass before
  creating and locally verifying the signed `v1.37.0` tag.
- Rebuild from the clean tagged tree, require the recorded SHA-256, then upload
  the ZIP and checksum sidecar to the GitHub Release.

## Safety and limitations

- `scripts/run-golden.js`, `claude -p`, and every real model runner remained
  unexecuted.
- Source contracts and fake-runner E2E do not constitute behavioral model
  attestation.
- v1.38 behavioral/research work remains dependent on a published v1.37 and,
  for live Claude A/B, a new explicit authorization in the active conversation.
