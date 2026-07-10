# Verbalized Sampling Adaptation Map For Prompt Master

This document consolidates the Firecrawl-saved article notes and the multi-agent read-only exploration of this repository.

## Inputs

- Article notes: [verbalized_sampling_2510.01171.md](verbalized_sampling_2510.01171.md)
- Source article: https://arxiv.org/abs/2510.01171
- Text/HTML source used by Firecrawl: https://arxiv.org/html/2510.01171v3
- Explored repo areas:
  - `plugins/prompt-master/skills/prompt-master/SKILL.md`
  - `plugins/prompt-master/skills/prompt-master/references/templates.md`
  - `plugins/prompt-master/skills/prompt-master/references/patterns.md`
  - `plugins/prompt-master/skills/prompt-master/references/tool-profiles.md`
  - `tests/golden/scenarios.json`
  - `docs/sources.md`
  - `README.md` / `README.ru.md`

## Agent Consensus

All three explorer agents converged on the same product shape:

- Adopt the idea, not the public branding.
- Keep Prompt Master's default contract: one production-ready prompt in one fenced block.
- Add VS-inspired behavior as an optional candidate/variants mode, or use it internally to select a stronger single prompt.
- Do not expose model-estimated probabilities in normal Prompt Master output.
- Do not import VS-CoT. The repo's no-CoT rules for reasoning-native/current-generation models remain higher priority.
- Do not use variants for high-risk deterministic work: credentials, auth/security, migrations, production/deploy, database changes, or destructive actions.

## Best Adaptation

### 1. Internal Candidate-Set Lens

Use a lightweight internal pass for open-ended prompt-generation tasks:

1. Sketch three candidate prompt directions.
2. Compare them qualitatively by `fit`, `risk`, and `when_to_use`.
3. Emit one final prompt unless the user explicitly asked for alternatives.

Best targets:

- Taste-based requests: "premium", "beautiful", "like X", "I'll know it when I see it".
- New-domain or unfamiliar-codebase tasks where pattern #56 already routes to prototype-first or blindspot pass.
- Brand voice, creative work, decks, image/video prompts, UX prototypes, broad ideation.
- Unknown-tool routing hypotheses, but only internally. If the target tool remains ambiguous, still ask or surface `Assumed target tool:`.

### 2. Optional Variants Mode

Expose only when the user explicitly asks for variants, alternatives, options, directions, or "3 different prompts".

Output should still be one fenced Prompt Master block, containing labeled candidates:

```text
Variant A - Mainstream
Prompt: ...
Fit: ...
Risk / tradeoff: ...
When to use: ...

Variant B - Balanced
Prompt: ...
Fit: ...
Risk / tradeoff: ...
When to use: ...

Variant C - Novel
Prompt: ...
Fit: ...
Risk / tradeoff: ...
When to use: ...
```

Avoid:

- `probability`
- numeric confidence
- `reasoning`, `rationale`, `<thinking>`, or chain-of-thought fields
- multiple separate fenced prompt blocks

### 3. Strengthen Prototype-First

The closest existing hook is pattern #56. The current fragment already asks for genuinely divergent directions. VS can improve this by making the generated prototype prompt require candidate labels:

```text
Before wiring anything up, make a single self-contained HTML file with fake data showing [N, e.g. 4] genuinely different directions for [the thing].
For each direction, include:
- name
- fit
- risk / tradeoff
- what user reaction would choose it
No backend, routes, or state. I'll react and pick.
```

This preserves the current strategy: drain taste unknowns cheaply before real implementation.

## Recommended File Changes

These are opportunities, not yet implemented in runtime files.

| File | Change | Why |
| --- | --- | --- |
| `SKILL.md` | Add a short candidate-set rule near Intent Extraction / question-drainability. | Golden tests append `SKILL.md`; core behavior needs a high-authority hook if this ships. |
| `templates.md` | Add a "Candidate / Variant Set" fragment near Template D and/or the agentic prototype-first fragment. | Keeps full structure in references instead of bloating `SKILL.md`. |
| `patterns.md` | Prefer updating pattern #56 instead of adding pattern #62. | Avoids pattern-count churn unless this becomes a broad anti-pattern. |
| `tests/golden/scenarios.json` | Add explicit variants, no-default-variants, no-probability, no-CoT, and high-risk-no-variants cases. | Prevents regressions against the one-prompt output lock and no-CoT policy. |
| `docs/sources.md` | Add a rationale row for "VS-inspired bounded variants". | Documents why the project uses qualitative candidate sets instead of probabilities. |
| `README.md` / `README.ru.md` | Mention only after behavior is tested, using "optional variants mode", not "Verbalized Sampling". | Avoids overpromising paper results as product evals. |

## Suggested Golden Scenarios

Candidate IDs and intent:

- `candidate-set-explicit-variants`
  - User asks for three different directions.
  - Must include variants/directions plus `fit` and `risk`.
  - Must not include CoT or probability labels.
- `candidate-set-not-default`
  - User asks for a normal prompt.
  - Must not produce variants.
- `taste-prototype-candidate-directions`
  - User asks for a premium dashboard with no design certainty.
  - Must include prototype/mock, fake data, divergent directions, fit/risk.
- `candidate-set-blocked-for-security`
  - User asks for variants around production auth/database migration.
  - Must preserve approval/stop/security language and avoid variants/probabilities.
- `candidate-set-single-fence`
  - User asks for multiple Midjourney prompt variants.
  - Must keep variants inside one fenced output block, not multiple prompt blocks.

## Risks

- Multiple prompt outputs can conflict with Prompt Master's main promise: one paste-ready prompt.
- Probability labels look precise but are not calibrated in this repo's workflow.
- VS-CoT conflicts with the no-CoT hard rules and current model profiles.
- User-facing variants can increase token cost, so defaulting to them would undermine the credit-saving value proposition.
- Publicly citing paper gains like "1.6-2.1x diversity" would be misleading unless Prompt Master runs its own evals.

## Recommended Sequence

1. Keep `docs/verbalized_sampling_2510.01171.md` as the source note.
2. Add a small `templates.md` candidate-set fragment and update pattern #56 wording.
3. Add one concise `SKILL.md` routing guard if behavior should be reliable in golden tests.
4. Add golden coverage before README marketing.
5. Only then expose a public "Variants mode" line in README.

