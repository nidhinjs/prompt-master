# v1.34.0 Release Evidence

- Status: local implementation candidate complete; publication and live activation
  are authorized separately
- Baseline recorded: 2026-07-11
- Coordinator baseline: `v1.33.0` / `e8fdc6a`

## Scope and host boundary

Prompt Master entered this release as a Claude-origin skill. v1.34 adds Codex
repository and installed-plugin hosting without creating a second runtime tree or
claiming that a Codex manifest alone proves runtime compatibility.

The current Codex skill validator permits only `name` and `description` in
`SKILL.md` frontmatter. The old `version` field therefore failed validation and
was removed from the canonical skill. Release version parity is now enforced
across the Claude and Codex plugin manifests, changelog, README release lines,
tag context, and artifact name. This deliberately supersedes the older roadmap
wording that included `SKILL.md` as a version source.

No real Claude or Codex model, live golden runner, dependency installation,
commit, tag, push, release publication, or external marketplace mutation was
performed.

## Refreshed Codex facts

The official Codex skill, plugin, and hook pages were refreshed on 2026-07-11.
They confirm repository discovery under `.agents/skills`, explicit `$skill` and
implicit description activation, non-merged duplicate names, plugin manifests
at `.codex-plugin/plugin.json`, legacy-compatible
`.claude-plugin/marketplace.json`, default `hooks/hooks.json` discovery,
optional trust for non-managed hooks, and the `UserPromptSubmit` prompt/context
schema.

The Codex manual helper reached the official endpoint but rejected the response
because the required `x-content-sha256` header was absent. The official pages
were used directly instead. Installed CLI help was also checked against
`codex-cli 0.144.1` for `plugin add`, `plugin remove`, `plugin list`, and
`plugin marketplace add/upgrade`.

## Windows discovery decision

A disposable clean-checkout probe used Windows `10.0.26200.0` and Git for
Windows `2.54.0.windows.1`.

- With the default `core.symlinks=false`, a tracked directory symlink checked
  out as a normal 48-byte file and its nested `SKILL.md` did not resolve.
- The thin locator checked out as a normal `SKILL.md`, and its relative link to
  `plugins/prompt-master/skills/prompt-master/SKILL.md` resolved successfully.

The release therefore selects the roadmap's locator fallback. The locator has
only Codex-compatible frontmatter and one instruction to load the canonical
tracked skill. It contains no copied runtime rule or reference file.

## Fresh isolated plugin evidence

An isolated temporary `CODEX_HOME` was used so the user's Codex configuration
and cache were not changed.

1. `codex plugin marketplace add <local-repository> --json` discovered the
   existing legacy marketplace as `prompt-master`.
2. `codex plugin list --marketplace prompt-master --available --json` exposed
   `prompt-master@prompt-master` at version `1.34.0` with `AVAILABLE` and
   `ON_INSTALL` policies.
3. `codex plugin add prompt-master@prompt-master --json` installed the plugin
   into the isolated cache.
4. The cached canonical skill tree and both hook files were byte-identical to
   the repository sources.
5. The cached skill passed `skill-creator` validation and the cached plugin
   passed `plugin-creator` validation.

No task or model was started during this test.

## Deterministic verification

| Check | Result |
|---|---|
| Canonical `skill-creator` validation | PASS |
| Repository locator `skill-creator` validation | PASS |
| Codex `plugin-creator` validation | PASS |
| `node scripts/test-codex-layout.js` | PASS: 33 runtime files / 9 adversarial cases |
| `node scripts/test-codex-hook.js` | PASS: 6/6 |
| `node scripts/test-contracts.js` | PASS: 9/9 |
| `node scripts/lint.js` | PASS: 0 errors / 0 warnings |
| `node scripts/test-safe.js --strict` | PASS: `expected=11 executed=11 passed=11 failed=0 skipped=0` |
| `bump-version.ps1 -Version 1.34.1 -DryRun` | PASS: both plugin manifests and changelog selected |
| `git diff --check` | PASS |

The safe gate used only offline fixtures and the existing fake-Claude safety
harness. It did not execute `scripts/run-golden.js` or resolve a real Claude
binary.

## Package parity

The Claude.ai skill ZIP remains sourced only from the 33-file tracked runtime
manifest. Two consecutive local builds with `-AllowDirty` compared every ZIP
entry with its source and produced the same result:

`9dcc3886936980f493a45bf5bcbcf984570a46d5b8e430cc3b302064838b54ad  prompt-master-1.34.0.zip`

The Codex plugin install cache uses the same canonical skill bytes. Codex ZIP
installation is not claimed.

## Acceptance ledger

| Criterion | Status | Evidence |
|---|---|---|
| A34-01 | PASS | Codex manifest passes the current plugin validator |
| A34-02 | PASS | `skills` is exactly `./skills/`; paths remain in plugin root |
| A34-03 | PASS for selected fallback | Windows rejected symlink and resolved locator; Linux resolves it; clean-checkout macOS/Windows CI matrix is configured |
| A34-04 | PASS | Locator contains one `SKILL.md`; no runtime/reference copy exists |
| A34-05 | PASS | Legacy marketplace ingested and installed in isolated Codex state |
| A34-06 | PASS | No second marketplace was created |
| B34-01 | PASS with recorded schema exception | Versions agree across both manifests, changelog, docs, artifact; SKILL version is forbidden |
| B34-02 | PASS | Repo locator, installed plugin, and ZIP source resolve to identical runtime bytes |
| B34-03 | PASS | Broken/plain-text/escaping/duplicate/frontmatter mutations fail closed |
| B34-04 | PASS | Codex layout and hook suites are in the strict offline gate |
| B34-05 | PASS | Existing deterministic Claude ZIP semantics remain intact |
| B34-06 | PASS | No Codex ZIP claim; CLI claims are tied to 0.144.1 |
| C34-01 | PASS | Claude/Codex prompt fixtures emit equivalent context |
| C34-02 | PASS | Positive, negative, malformed, environment, and no-op fixtures pass |
| C34-03 | PASS | Hook remains byte-identical, advisory, exit-zero, and optional |
| C34-04 | PASS | `$prompt-master` and Claude slash invocation are separated |
| C34-05 | PASS | Repo/plugin alternatives and disable path are documented |
| C34-06 | PASS | Update claims are bounded to verified CLI behavior |
| K34-01 | PASS | Official facts refreshed before implementation |
| K34-02 | PASS | Windows locator decision and evidence recorded |
| K34-03 | PASS with recorded schema exception | Active release metadata says `1.34.0`; SKILL has no unsupported version field |
| K34-04 | PASS | Strict safe gate and two deterministic ZIP builds pass |
| K34-05 | PARTIAL | Isolated installed-plugin and locator evidence captured; live fresh-task activation is not authorized |
| K34-06 | NOT RUN | Signed tag and publication require separate authorization and successful external CI |

## Remaining external gates

- Run the configured GitHub Actions clean-checkout matrix on `windows-2025` and
  `macos-15`; Ubuntu layout is already part of the strict safe gate.
- If behavioral activation evidence is required, separately authorize fresh
  Codex tasks for explicit `$prompt-master`, one implicit trigger, one non-trigger
  control, and the documented duplicate/disable flow.
- Publish only after those results are reviewed, the worktree scope is accepted,
  and commit/tag/release actions are explicitly authorized.
