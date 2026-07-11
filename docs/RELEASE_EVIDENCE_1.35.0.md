# Release evidence — v1.35.0

Status: frozen release evidence for the authorized v1.35.0 publication.
Prepared: 2026-07-11
Verification boundary: deterministic offline checks only; `NO_LIVE_MODEL_CALLS`.

## Scope

- GPT-5.6 Sol/Terra/Luna facts separated across OpenAI API, ChatGPT app, and
  Codex surfaces.
- Bare OpenAI/GPT/model aliases require surface resolution; explicit surface
  routes own eligible defaults.
- Responses Multi-agent beta is a lifecycle-independent capability record
  attached to a production model route, never a model or default itself.
- ChatGPT Chat/Work, Codex, and OpenAI API use separate profile routes.
- Multi-agent requires independent bounded workstreams; sequential work uses a
  deeper single agent.
- A one- or two-line `Recommended setup:` appears outside the paste-ready prompt.
- Agentic-coding economy guidance is benchmark-scoped and preserves the dated
  Luna label correction in maintainer research.

## Official source verification

Checked 2026-07-11 through OpenAI Developer Docs MCP and official OpenAI pages:

- <https://developers.openai.com/api/docs/guides/latest-model>
- <https://developers.openai.com/api/docs/guides/responses-multi-agent>
- <https://developers.openai.com/api/docs/models/gpt-5.6-sol>
- <https://developers.openai.com/api/docs/models/gpt-5.6-terra>
- <https://developers.openai.com/api/docs/models/gpt-5.6-luna>
- <https://learn.chatgpt.com/docs/models>
- <https://learn.chatgpt.com/docs/agent-configuration/subagents>

The Responses capability remains beta and must be re-verified within the
registry's 14-day beta freshness window.

## Deterministic verification

Command:

```text
node scripts/test-safe.js --strict
```

Result:

```text
safe-gate self-tests                 7/7
registry validation/mutations       53/53
runtime inventory mutations          9/9
source contracts                    10/10
hook fixtures                       25/25
Codex layout adversarial checks       9/9
Codex hook tests                      6/6
offline golden fixtures             71/71
run-golden fake-runner safety         7/7
lint                         0 errors, 0 warnings

SUMMARY expected=11 executed=11 passed=11 failed=0 skipped=0
```

The runtime inventory remains exactly 33 files across seven profile bundles.
Registry inventory at this candidate is 18 shards, 108 records, and 65 routes.

## Deterministic package

Two consecutive local builds from the reviewed runtime produced the same ZIP
and passed exact-manifest plus byte-for-byte source parity checks:

```text
artifact: dist/prompt-master-1.35.0.zip
files:    33
SHA-256:  9eb996b8f14e5298776653ac74ab9b5c54106ba9690e57a8b938f3b601c43ae6
```

## Forward tests

Fresh subagents received only the updated skill path and realistic user requests.

- Ambiguous “ChatGPT 5.6 multi-agent” request correctly asked one first surface
  chooser with four separate options: ChatGPT Chat, ChatGPT Work, Codex, and
  Responses API.
- Explicit quality-first ChatGPT Work research produced one fenced prompt and a
  post-prompt Sol/Ultra recommendation without API request controls.
- The first ambiguous forward-test exposed collapsed Chat/Work and a sequential
  specialist-chain option; both rules were corrected before the final pass.

These are limited forward checks, not behavioral attestation of a released
OpenAI model.

## Safety and limitations

- `scripts/run-golden.js`, `claude -p`, and real Claude/Codex/OpenAI model
  runners were not executed.
- The strict gate used the repository's temporary fake-Claude isolation and
  proved the real CLI was not reachable by that test path.
- No claim is made that offline fixtures prove live model behavior.
- Windows full strict parity remains v1.36 scope.
- The Raschka chart is community benchmark evidence, not an OpenAI contract.

## Publication controls

- Final bounded independent blocker review: no release blockers found.
- The upload is allowed only if a clean-tree rebuild reproduces the recorded
  SHA-256.
- Intentional path-only staging; never `git add -A` while unrelated user files
  remain untracked.
- Commit, signed tag, push, and GitHub release require explicit publication
  authorization; it was granted on 2026-07-11.
