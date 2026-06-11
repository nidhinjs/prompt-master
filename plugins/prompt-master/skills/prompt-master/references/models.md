# Model Fact-Sheet — volatile facts, dated

All facts that go stale fast — model IDs, current defaults, version-tied params, what's retired — live here, separated from the evergreen prompting advice in [tool-profiles.md](tool-profiles.md).

## Refresh protocol — READ FIRST

- Each vendor section carries a `last-verified` date.
- **Before asserting any fact from a section whose `last-verified` is more than 60 days old, re-verify it against current vendor docs.** If you cannot verify, say so (`[unverified]`) rather than stating it as current.
- The model landscape shifts every quarter. A fact correct at commit time is often wrong within one. Treat a `⚠️ verify` marker as "this likely moved — check before relying on it."
- When you confirm or correct a section, update its facts and bump its `last-verified` date.
- This sheet drives pattern #38 (hardcoded retired model / dead parameter) — see [patterns.md](patterns.md).

---

## Anthropic — Claude

`last-verified: 2026-06-11`

- **Newest, most capable:** Claude Fable 5 and Claude Mythos 5. Model ID — Fable 5: `claude-fable-5`. Route hard, long-horizon, ambiguous work here.
- **Default for most harnesses:** Claude Opus 4.8 (`claude-opus-4-8`). 1M-token context. Opus 4.7 still selectable.
- **Other current 4.x IDs:** Sonnet 4.6 `claude-sonnet-4-6`; Haiku 4.5 `claude-haiku-4-5-20251001`.
- **Thinking:** adaptive-thinking only on Fable 5 / Mythos 5 — summarized-only thinking output, **no extended-thinking budgets**. Do not set `budget_tokens` or a fixed thinking budget. Opus 4.x also calibrates depth automatically.
- **Effort levels:** `low` / `medium` / `high` / `xhigh`. On Fable 5 effort is the primary intelligence/latency/cost lever; default `high`. On Claude Code the harness manages effort — do not hardcode it in prompts.
- **Refusals:** Fable 5 / Mythos 5 emit `stop_reason: "refusal"` for offensive-cybersecurity and biology/life-sciences work, and a `reasoning_extraction` refusal if asked to echo/show their reasoning. Configure fallback to Opus 4.8.
- **Avoid (dead/counterproductive):** "think step by step" / CoT scaffolding on 4.x and Fable 5; fixed thinking budgets; instructing the model to reproduce its reasoning as response text.

## OpenAI — GPT

`last-verified: 2026-06-11`

- **Current prompting target:** GPT-5.5 (outcome-first guidance). GPT-5.x is the active family.
- **Verbosity:** control output length with the `text.verbosity` parameter (`low` / `medium` / `high`) rather than in-prompt length caps.
- **Reasoning effort:** re-test at `low` / `medium` before escalating; efficiency gains make higher effort often unnecessary.
- **Reasoning models** (o3 / o4-mini and successors): short clean instructions only, never add CoT. ⚠️ verify the exact current reasoning-model lineup and whether ChatGPT has consolidated naming — this moves fast.
- **Avoid:** absolutes (ALWAYS/NEVER/MUST/ONLY) for non-invariants on GPT-5.5; legacy multi-step instruction stacks carried from older models.

## Google — Gemini

`last-verified: 2026-06-11`

- Current family: Gemini 3 Pro (large context, multimodal). ⚠️ verify the exact current minor version and model ID before asserting — Gemini point releases and `-preview` IDs are retired frequently.
- Has a thinking/`thinking_level`-style control; may guess when information is missing — add explicit grounding.
- Known quirk: hallucinated citations — always add "Cite only sources you are certain of. If uncertain, say [uncertain]."

## DeepSeek

`last-verified: 2026-06-11`

- Reasoning-native line (R1 and successors): treat like OpenAI reasoning models — no CoT, short clean instructions. Outputs reasoning in `<think>` tags by default.
- ⚠️ verify the current model names and whether legacy `deepseek-chat` / `deepseek-reasoner` aliases are retired before asserting.

## MiniMax

`last-verified: 2026-06-11`

- Default: M3. M2.7 carries a 1M-token context; M2.7-highspeed is latency-optimized.
- OpenAI-compatible API. **Temperature must be between 0 and 1 inclusive** — values above 1 fail.
- May output reasoning in `<think>` tags.

## Alibaba — Qwen

`last-verified: 2026-06-11`

- Qwen 2.5 instruct variants: strong instruction-following and JSON. Qwen3 has thinking and non-thinking modes (thinking mode → treat like a reasoning model, no CoT).
- ⚠️ verify the current Qwen generation/version before asserting — the line iterates quickly.

---

> Vendors not listed here have no volatile-fact entry yet. Add one (with a `last-verified` date) when the skill starts asserting model-specific facts about them.
