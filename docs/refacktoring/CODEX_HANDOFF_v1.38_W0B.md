# Codex Handoff — v1.38 W0B

Status: W0/W0B complete; native selection failed closed; the user-approved
process-isolated fallback passed `G0B` on 2026-07-13; `W1/G1` is next.

Prepared: 2026-07-12; amended: 2026-07-13

## Resume

```text
repository: /mnt/c/users/lenovo/documents/github/prompt-master-za
branch: main
planning commit: b63e447 (docs: finalize v1.38 offline execution plan)
bootstrap commit: a4348c3 (chore: bootstrap v1.38 Codex agent profiles)
identifier fix: 4c35ad6 (fix: use native Codex agent identifiers)
native blocker commit: a8cad7a (docs: record v1.38 W0B spawn blocker)
fallback amendment: f366d31 (chore: authorize v1.38 Codex process fallback)
next gate: W1 / G1
plan: docs/refacktoring/PLAN_v1.38_offline_research_orchestration.md
```

Current continuation instruction:

```text
Continue v1.38 from docs/refacktoring/CODEX_HANDOFF_v1.38_W0B.md at W1/G1.
Run repo_explorer, eval_architect, and adversarial_reviewer through the frozen
codex-exec transport in one read-only wave of at most three; record three
root-attested envelopes and keep the main Git snapshot unchanged. Reconcile
their outputs and freeze G1 before W2A. Do not run Claude or run-golden.js.
```

Native profile names:

```text
repo_explorer
eval_architect
runtime_author
test_author
docs_author
adversarial_reviewer
test_runner
package_checker
docs_reviewer
```

The first W0B smoke proved that Codex rejects hyphenated agent identifiers with
`agent_name must use only lowercase letters, digits, and underscores`. The
tracked profiles and plan therefore use underscore identifiers.

## Native blocker and approved fallback

Static/capability checks passed:

- `codex --strict-config --version` parsed the project config under Codex CLI
  `0.144.1`;
- `codex debug models` confirmed all planned Sol/Terra/Luna IDs and efforts;
- a direct Luna low connectivity probe completed successfully;
- `node scripts/validate-codex-agents.js` passed all nine profiles;
- `node scripts/test-codex-agents.js` passed eight offline mutations;
- seven read-only role smokes used `read-only`; `runtime_author` and
  `test_author` used `workspace-write` only in disposable clean worktrees. All
  before/after snapshots were identical and every `changed_paths` list was
  empty.

Native profile proof did not pass:

- ephemeral Ultra attempts failed collaboration initialization with
  `collab spawn failed: no thread with id`;
- a persistent `repo_explorer` attempt emitted a `wait` event with an empty
  receiver list and no child-thread creation event;
- the final message reported `Actual reasoning effort: not exposed` and
  `Recursive spawning unavailable: no`, yet labelled itself `PASS`.

Root overrides that inconsistent result to `BLOCKED`. The 2026-07-13 fresh
retry created root thread `019f59ca-e256-7db0-b96a-b5ef181cfe22`, but its
callable spawn schema again exposed no custom-agent selector, so it correctly
created no child. An independent generic child showed `agent_role=null`, Sol
`xhigh`, and a workspace-write sandbox rather than the requested
`repo_explorer` tuple. This proves the failure is the current selector surface,
not TOML syntax.

The user explicitly approved a process-isolated fallback on 2026-07-13.
`.codex/agents/*.toml` remain the canonical role-policy inputs. Root launches
separate persistent `codex exec` workers with exact model/effort/sandbox flags,
all agent/fan-out features disabled, `agents.max_threads=1`, and the valid
minimum `agents.max_depth=1`; supplies the decoded profile developer contract as
an effective config override; passes the task through stdin; and independently
verifies safe rollout fields plus Git boundaries. The first fallback mutation
proved that CLI `0.144.1` rejects `agents.max_depth=0`, so zero is not used.
This transport must be labelled `codex-exec`, never native custom-agent spawn.
`G0B` passed. The sanitized machine record is
`docs/release-evidence/v1.38.0/orchestration/g0b-smoke.json`: nine role smokes
and the explicit non-recursion probe passed, maximum overlap was three,
collaboration/child counts were zero, and every Git snapshot was unchanged.

## Capability record

Codex CLI: `0.144.1`.

Catalog command: `codex debug models`.

| Model | Default | Supported efforts used by the plan |
|---|---|---|
| `gpt-5.6-sol` | `medium` | `high`; `xhigh` only after a recorded reasoning blocker |
| `gpt-5.6-terra` | `medium` | `medium`, `high` |
| `gpt-5.6-luna` | `medium` | `low` |

The catalog also exposes `max` for all three and `ultra` for Sol/Terra. The plan
uses Ultra only for root orchestration, not as a model slug.

## Preserved local files

These pre-existing untracked user files must remain unstaged and unmodified:

- `docs/CODEX_HANDOFF_2026-07-11.md`
- `docs/Model_guidance_5_6_OpenAI_API.md`
- `docs/refacktoring/MinerU_markdown_202.md`

## Boundary

Root-launched Codex fallback workers are authorized for this implementation.
They may not invoke an additional/nested model runner. No Claude A/B, real
Claude runner, `scripts/run-golden.js`, tag, push, or release is authorized by
this handoff. W8 remains a separate release-authorization gate.
