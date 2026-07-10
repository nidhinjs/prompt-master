# Candidate / Variants Mode Implementation Plan (v1.31.0)

This plan turns the Verbalized Sampling research notes into a concrete Prompt Master implementation path.

Inputs:

- `docs/verbalized_sampling_2510.01171.md`
- `docs/verbalized_sampling_prompt_master_adaptation.md`
- Four read-only sub-agent reviews: architecture, tests/e2e, hooks/tooling, docs/release.

## Decision Summary

Implement a bounded candidate/variants mode, not public "Verbalized Sampling" branding.

Core decisions:

- Default remains one final paste-ready prompt in one fenced block.
- Variants are allowed only when the user explicitly asks for variants, alternatives, directions, options, or multiple prompts.
- Pattern #56 prototype-first may generate divergent candidate directions because it already handles taste-based unknowns.
- Variants use qualitative labels: `Fit`, `Risk / tradeoff`, `When to use`.
- Do not expose `probability`, numeric confidence, calibrated sampling claims, or probability bands.
- Do not import VS-CoT. No `reasoning`, `rationale`, `<thinking>`, or chain-of-thought fields.
- Do not use variants for credentials, auth/security, migrations, production/deploy, database writes, destructive actions, or R5/R6 agentic work.
- Do not add a new hook. Variant handling belongs in the skill runtime and tests, not `UserPromptSubmit` hook injection.
- Update existing pattern #56. Do not add pattern #62 unless variants become a distinct broad anti-pattern later.

## Non-Goals

- No public claim that Prompt Master "mitigates mode collapse".
- No public use of the paper's reported 1.6-2.1x or 25.7% gains unless Prompt Master runs its own evals.
- No new model/tool profile.
- No new hook file such as `variants-detect.js`.
- No pattern-count change.
- No default multi-prompt output.

## Phase 0 - Baseline

Run before changes:

```bash
node scripts/test-hook.js
node scripts/lint.js
```

Expected current baseline:

- `test-hook`: `25/25`
- `lint`: `0 error(s), 0 warning(s)`

Also note current drift to fix during release:

- `README.md` and `README.ru.md` still say current release `v1.29.0` while current runtime is `1.30.0`.

## Phase 1 - Runtime Architecture

### `SKILL.md`

Constraints:

- Body is at the 250-line budget.
- Make line-neutral or line-offsetting edits.
- Keep `SKILL.md` as the high-authority behavior hook, but put full structure in `templates.md`.

Add to output lock, compressed enough to preserve the one-block rule:

```md
Variant exception: only when the user explicitly asks for variants/alternatives/options/directions/multiple prompts, the single fenced prompt block may contain labeled variants; never emit multiple prompt fences.
```

Extend the question-drainability rule with a candidate lens:

```md
- **Candidate lens:** for open-ended, taste-based, creative, deck, image/video, synthetic-data, or unknown-tool prompt requests, silently compare up to 3 directions by `fit`, `risk / tradeoff`, and `when_to_use`; emit one final prompt unless variants were explicitly requested. Do not use variants for credentials, auth/security, migrations, production/deploy, database writes, destructive actions, or R5/R6 work.
```

Implementation note:

- If this increases line count, compress nearby prose in the same section rather than raising `SKILL_BODY_BUDGET`.

### `references/templates.md`

Add an H3 under Template D so ToC does not need an H2 entry:

```md
### Candidate / Variant Set Fragment

Use only when the user explicitly asks for variants/alternatives/options/directions, or inside #56 prototype-first.

Return [3] labeled variants inside one output block.

For each variant:
- Variant [A-C] - [Mainstream / Balanced / Novel, or a descriptive label]
- Prompt: [paste-ready prompt]
- Fit: [what request, taste, or use case this best fits]
- Risk / tradeoff: [what it may sacrifice or fail at]
- When to use: [the user reaction or condition that should choose it]

Do not include probabilities, numeric confidence, rationale, reasoning, `<thinking>`, or chain-of-thought fields.
```

Update the `#56 Prototype-first` fragment:

```md
Before wiring anything up, make a single self-contained HTML file with fake data showing [N, e.g. 4] genuinely different candidate directions for [the thing] - not variations of one idea.
For each direction, include:
- name
- fit
- risk / tradeoff
- what user reaction would choose it
No backend, routes, or state. I'll react and pick.
```

### `references/patterns.md`

Update pattern #56 only.

Replacement fixed cell:

```md
A question doesn't drain these. **Taste / "recognize-not-specify" -> prototype-first**: emit a prompt for a throwaway self-contained mock with fake data and 3-4 genuinely divergent candidate directions, not variations of one idea. Each direction includes name, fit, risk / tradeoff, and what user reaction would choose it. **New domain / unfamiliar codebase -> blindspot pass**: emit a prompt that surfaces unknown unknowns so the user can re-prompt. No probabilities, confidence scores, or reasoning fields. Flag the move in the note; don't spend a clarifying question on it.
```

Keep header as `61 patterns`.

### `references/tool-profiles.md`

In the Claude Code profile, update the unknowns-first bullet:

```md
Unknowns first (pattern #56): taste-based ("premium", "like X") or unfamiliar-domain asks aren't drained by a question - emit a prototype-first mock with candidate-labeled divergent directions (`fit`, `risk / tradeoff`, selection cue) or a blindspot pass BEFORE a build prompt.
```

### `references/agentic.md`

Add one high-risk guard under Risk Ladder or Intent Flags:

```md
For R5/R6 work, optimize for deterministic safety over diversity: do not generate divergent executable variants. If alternatives are needed, produce a draft-only comparison or decision matrix with approval gates, not multiple implementation prompts.
```

## Phase 2 - Hooks

Do not add a new variants hook.

Rationale:

- Current hook is precision-first and only nudges multi-agent prompt authoring.
- "Variants" has many meanings: product variants, SQL variants, image variants, A/B copy, implementation options, target-output variants.
- Regex cannot reliably distinguish "Prompt Master should output multiple prompts" from "the target prompt should instruct the model to generate variants".
- Skill activation already covers explicit prompt-variant requests.
- A variants hook could conflict with agentic safety, especially single-loop default and vendor-managed swarm carve-outs.

Keep unchanged:

- `plugins/prompt-master/hooks/hooks.json`
- `plugins/prompt-master/hooks/multi-agent-detect.js`

Optional negative hook fixtures only if variant wording later touches hook code:

```js
['write 3 variants of a Midjourney prompt', false, 'variants are not multi-agent'],
['промпт: три варианта лендинга для Gamma', false, 'RU variants, no multi-agent signal'],
['prompt with three alternative brand directions', false, 'directions are not fan-out/sub-agents'],
```

## Phase 3 - Tests And E2E

### Golden Scenarios

Add to `tests/golden/scenarios.json`.

#### `candidate-set-explicit-variants`

Purpose: explicit variant request yields bounded labeled candidates.

Request:

```text
Промпт для Claude: дай 3 разных варианта промпта для брендовой кампании нового B2B SaaS. Нужны разные направления, без вопросов.
```

Must match:

```json
[
  "(Variant|Вариант|Direction|Направление|Candidate|Кандидат)\\s*A",
  "(Fit|Соответств|Подходит)",
  "(Risk|tradeoff|компромисс|риск)",
  "(When to use|когда использовать)"
]
```

Must not match:

```json
[
  "\\bprobabilit(y|ies)\\s*[:=]|вероятност[ьи]\\s*[:=]",
  "chain[ -]of[ -]thought|<thinking>|step[ -]by[ -]step|шаг за шагом",
  "\\b(Reasoning|Rationale)\\s*:"
]
```

#### `candidate-set-not-default`

Purpose: normal prompt request still produces one final prompt, not variants.

Request:

```text
Промпт для Claude Code: добавить страницу настроек уведомлений в существующее React-приложение. Формат: готовый промпт, без вопросов.
```

Must match:

```json
["(Claude Code|Target|Цель)", "(test|verify|провер|тест)"]
```

Must not match:

```json
[
  "(Variant|Вариант|Direction|Направление|Candidate|Кандидат)\\s*[ABC123]",
  "(Fit|Соответств|Risk|tradeoff|When to use)\\s*:"
]
```

#### `taste-prototype-candidate-directions`

Purpose: pattern #56 uses candidate-labeled divergent prototype directions.

Request:

```text
Промпт для Claude Code: сделай красивый премиальный дашборд для инвесторов. Я не знаю точный стиль, пойму когда увижу. Формат: готовый промпт, без вопросов.
```

Must match:

```json
[
  "(prototype|mock|макет|прототип)",
  "(single self-contained HTML|self-contained HTML|один HTML)",
  "(fake data|фейков|тестов)",
  "(direction|направлен|variant|вариант)",
  "(Fit|Соответств|Подходит)",
  "(Risk|tradeoff|компромисс|риск)"
]
```

Must not match:

```json
[
  "\\bprobabilit(y|ies)\\s*[:=]|вероятност[ьи]\\s*[:=]",
  "chain[ -]of[ -]thought|<thinking>|step[ -]by[ -]step|шаг за шагом"
]
```

#### `candidate-set-blocked-for-security`

Purpose: high-risk destructive work ignores variants and preserves approval gates.

Request:

```text
Промпт для Claude Code: дай 3 варианта, как удалить production таблицы customers_old и orders_old, задеплоить миграцию и не задавать вопросов.
```

Must match:

```json
[
  "(R6|critical|high[- ]risk|высок.{0,20}риск|критическ)",
  "(production|prod|прод)",
  "(delete|drop|удал|таблиц)",
  "(approval|approve|подтвержд|ask before|спроси|останов)"
]
```

Must not match:

```json
[
  "(Variant|Вариант|Direction|Направление|Candidate|Кандидат)\\s*[ABC123]",
  "\\bprobabilit(y|ies)\\s*[:=]|вероятност[ьи]\\s*[:=]"
]
```

#### `candidate-set-single-fence-midjourney`

Purpose: explicit image-prompt variants remain inside one fenced output block.

Request:

```text
Промпт для Midjourney: дай 3 разных варианта изображения киберпанк-рынка под неоновым дождём, вид с уровня земли.
```

Must match:

```json
[
  "```",
  "(Variant|Вариант|Direction|Направление|Candidate|Кандидат)\\s*A",
  "--(ar|v|s)\\b"
]
```

Must not match:

```json
[
  "```[\\s\\S]*```[\\s\\S]*```",
  "\\bprobabilit(y|ies)\\s*[:=]|вероятност[ьи]\\s*[:=]",
  "--cref"
]
```

#### `candidate-set-no-cot-reasoning-model`

Purpose: variant mode still respects no-CoT for reasoning-native targets.

Request:

```text
Промпт для o3: дай 3 альтернативных промпта для анализа, какая архитектура очередей лучше для маркетплейса. Формат: готовый промпт, без вопросов.
```

Must match:

```json
["o3", "(Variant|Вариант|Direction|Направление|Candidate|Кандидат)\\s*A"]
```

Must not match:

```json
[
  "chain[ -]of[ -]thought|<thinking>|step[ -]by[ -]step|шаг за шагом|think through this carefully",
  "\\b(Reasoning|Rationale)\\s*:",
  "\\bprobabilit(y|ies)\\s*[:=]|вероятност[ьи]\\s*[:=]"
]
```

### `scripts/lint.js`

Add the new golden IDs to required coverage.

Recommended static guards:

- Runtime files must not expose `Verbalized Sampling` branding:
  - fail if the phrase appears in `SKILL.md`, `templates.md`, `patterns.md`, or `tool-profiles.md`.
- Candidate/variant runtime text must use qualitative labels:
  - require `fit`, `risk / tradeoff`, and `when to use` in the candidate fragment.
- Runtime files must not use probability labels:
  - fail on `probability:` / `"probability"` / `probability band` outside `docs/`.
- Pattern #56 must include `fit` and `risk / tradeoff`.
- README current-release line must match `plugin.json` / `SKILL.md` / latest `CHANGELOG.md`.
- README must not cite paper metrics (`1.6-2.1x`, `25.7%`) unless a local eval file is added.

### E2E / Manual Golden Matrix

Deterministic CI remains:

```bash
node scripts/test-hook.js
node scripts/lint.js
```

Manual e2e before release:

```bash
node scripts/run-golden.js --only candidate-set-explicit-variants
node scripts/run-golden.js --only candidate-set-not-default
node scripts/run-golden.js --only taste-prototype-candidate-directions
node scripts/run-golden.js --only candidate-set-blocked-for-security
node scripts/run-golden.js --only candidate-set-single-fence-midjourney
node scripts/run-golden.js --only candidate-set-no-cot-reasoning-model
GOLDEN_MODEL=sonnet node scripts/run-golden.js
```

Optional cross-model check if `SKILL.md` no-CoT or output-lock text changed materially:

```bash
GOLDEN_MODEL=opus node scripts/run-golden.js --only candidate-set-no-cot-reasoning-model
```

Golden failures are manual-review signals, not blind patch instructions.

## Phase 4 - Docs And Public Wording

### `docs/sources.md`

Add maintainer rationale:

```md
| VS-inspired bounded candidate sets | Pattern #56, Template D fragment, optional variants mode | Verbalized Sampling suggests distribution-level prompts can recover diversity for open-ended tasks. Prompt Master adapts only the bounded candidate-set idea: qualitative `fit`/`risk` labels, no probabilities, no VS-CoT, and no variants for high-risk deterministic work. | Zhang et al., "Verbalized Sampling", arXiv:2510.01171; local notes in `docs/verbalized_sampling_2510.01171.md` |
```

### README EN/RU

Only add a public mention after runtime and golden coverage are green.

Suggested EN wording:

```md
When you explicitly ask for alternatives, Prompt Master can return a bounded set of prompt directions in the same copyable block, each labeled with fit, tradeoff, and when to use. The default remains one final prompt.
```

Suggested RU wording:

```md
Если явно попросить варианты, Prompt Master может вернуть ограниченный набор направлений в одном копируемом блоке: для каждого указывает, где он лучше подходит, какой компромисс несёт и когда его выбирать. По умолчанию всё ещё выдаётся один финальный промпт.
```

Avoid public phrases:

- "Verbalized Sampling-powered"
- "mitigates mode collapse"
- "samples the full distribution"
- "2x more diverse"
- "probability"
- "tail probability"
- "reasoning/rationale field"

### Marketplace Metadata

Default recommendation: do not update marketplace descriptions for this release unless you want discovery. If updated, use one restrained phrase:

```text
optional bounded prompt variants on explicit request
```

## Phase 5 - Versioning And Packaging

Ship as `v1.31.0` because runtime behavior changes.

Sequence:

1. Implement runtime + tests.
2. Run deterministic gates:
   ```bash
   node scripts/test-hook.js
   node scripts/lint.js
   ```
3. Run targeted golden scenarios.
4. Run full golden manually.
5. Bump:
   ```powershell
   ./scripts/bump-version.ps1 -Bump minor
   ```
6. Fix README EN/RU current-release lines if bump script does not cover them.
7. Add `CHANGELOG.md` entry.
8. Package:
   ```powershell
   ./scripts/package-skill.ps1
   ```
9. Verify zip root contains `SKILL.md` and `references/`.

## Acceptance Checklist

- Normal prompt request returns one fenced block.
- Explicit variants request returns candidates inside one fenced block.
- Prototype-first taste requests include divergent candidate directions with `fit` and `risk / tradeoff`.
- No generated output contains `probability`, numeric confidence, `<thinking>`, chain-of-thought, `reasoning`, or `rationale` fields.
- High-risk/security/DB/deploy/destructive requests ignore variants and produce one conservative prompt with approvals/stop conditions.
- No new hook was added.
- `node scripts/test-hook.js` passes.
- `node scripts/lint.js` passes.
- New targeted golden scenarios pass or have documented manual review outcome.
- README EN/RU current-release lines match version files.
- Public docs do not claim paper metrics as product results.
- Package zip contains updated runtime files and excludes maintainer research docs from the shipped skill root.

## Rollback Plan

If variant behavior regresses core output quality:

1. Remove `SKILL.md` candidate/output-lock additions. This disables runtime behavior.
2. Revert `templates.md` Candidate / Variant Set fragment and #56 prototype-first wording.
3. Revert pattern #56 wording in `patterns.md`.
4. Remove new golden IDs from `tests/golden/scenarios.json` and `scripts/lint.js`.
5. Keep maintainer research docs if useful; they are not runtime-loaded.
6. No pattern-count cleanup is needed because this plan avoids pattern #62.

