# Codex Handoff — v1.38 W0B

Status: W0 complete; W0B profiles created; corrected native identifiers await
fresh-session smoke.

Prepared: 2026-07-12

## Resume

```text
repository: /mnt/c/users/lenovo/documents/github/prompt-master-za
branch: main
planning commit: b63e447 (docs: finalize v1.38 offline execution plan)
next gate: W0B / G0B
plan: docs/refacktoring/PLAN_v1.38_offline_research_orchestration.md
```

After opening a fresh trusted-project Codex session, ask:

```text
Continue v1.38 from docs/refacktoring/CODEX_HANDOFF_v1.38_W0B.md.
Validate .codex/config.toml and every .codex/agents/*.toml profile, then smoke-spawn
each named profile in batches of at most three. Record actual model, reasoning
effort, sandbox, Codex version, and changed_paths. Stop if named profile selection
or effective metadata cannot be proven. Do not run Claude or scripts/run-golden.js.
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

No Claude A/B, real Claude runner, `scripts/run-golden.js`, tag, push, or release
is authorized by this handoff. W8 remains a separate release-authorization gate.
