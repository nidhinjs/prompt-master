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

`last-verified: 2026-06-14`

- **⚠️ Fable 5 / Mythos 5 — SUSPENDED / UNAVAILABLE since 2026-06-12.** Anthropic disabled Claude Fable 5 and Mythos 5 for **all** customers to comply with a US government export-control directive (national-security finding re: a potential jailbreak). All other Anthropic models are unaffected. **Do NOT route to Fable 5 / Mythos 5 — they return no access.** Re-check this before targeting them; if access is restored, Fable 5 (`claude-fable-5`) again becomes the most-capable option. Source: https://www.anthropic.com/news/fable-mythos-access (pattern #38).
- **Default "Claude" routing target (current): Claude Opus 4.8** (`claude-opus-4-8`). 1M-token context. Assume Opus 4.8 when the user says "Claude" without naming a version. Opus 4.7 still selectable.
- **Other current 4.x IDs:** Sonnet 4.6 `claude-sonnet-4-6`; Haiku 4.5 `claude-haiku-4-5-20251001`.
- **Thinking:** Opus 4.x calibrates depth automatically (adaptive thinking) — **no extended-thinking budgets**; do not set `budget_tokens` or a fixed thinking budget. (Fable 5 / Mythos 5 had summarized-only adaptive thinking too — moot while suspended.)
- **Effort levels:** `low` / `medium` / `high` / `xhigh`. On Claude Code the harness manages effort — do not hardcode it in prompts. (On Fable 5, effort was the primary lever — moot while suspended.)
- **Refusals:** Fable 5 / Mythos 5 emitted `stop_reason: "refusal"` for offensive-cybersecurity and biology/life-sciences work, plus a `reasoning_extraction` refusal if asked to echo/show reasoning — applies only if/when they are restored.
- **Avoid (dead/counterproductive):** "think step by step" / CoT scaffolding on 4.x; fixed thinking budgets; instructing the model to reproduce its reasoning as response text.

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

## xAI — Grok

`last-verified: 2026-06-15`

- **Default Grok routing target: `grok-4.3`** — flagship, **1M context**, used for both chat and coding. A reasoning model (thinks internally; exposes summaries). Other text IDs: `grok-build-0.1` (256k, fast agentic-coding model); prior gen `grok-4.20-0309-reasoning` / `grok-4.20-0309-non-reasoning` (⚠️ verify exact dated IDs).
- **`reasoning_effort`:** `none` / `low` (default) / `medium` / `high`. `none` disables thinking. `stop`, `presencePenalty`, `frequencyPenalty` are rejected on reasoning models; `logprobs` / `top_logprobs` ignored on 4.20+. grok-4.3 is reasoning-native → do not add CoT.
- **`grok-4.20-multi-agent`** — ⚠️ **beta** native multi-agent research model. Agent count is **4 or 16**: `agent_count` (4/16) in the xAI SDK, or `reasoning.effort` (`low`/`medium`=4, `high`/`xhigh`=16). Only leader-agent output is returned; built-in tools only (web/x/code/collections + remote MCP) — no custom function-calling, no Chat Completions API, no `max_tokens`.
- **Knowledge cutoff Grok 3/4 = November 2024.** No realtime knowledge without server-side **Web Search** / **X Search** enabled — otherwise answers come from training data.
- **Search filters are request parameters, not prose:** X Search — `allowed_x_handles`/`excluded_x_handles` (≤20, mutually exclusive), `from_date`/`to_date` (ISO8601); Web Search — `allowed_domains`/`excluded_domains` (≤5). Both return citations.
- **API:** Responses API preferred (stateful, stored 30 days, `previous_response_id`); OpenAI-compatible at `base_url=https://api.x.ai/v1`. Aliases: `<name>` = latest stable, `-latest`, `-<date>` = pinned. Supports Structured Outputs (JSON schema).
- **Imagine + Voice** (full revision deferred to image release): Grok Imagine generates and edits images and video (`grok-imagine-image*`, `grok-imagine-video*`); Grok Voice does realtime / TTS / STT.
- Prices are volatile — do not hardcode in the skill.

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

## Perplexity

`last-verified: 2026-06-14`

- **Sonar Deep Research:** model `sonar-deep-research`, **128K context**, "exhaustive searches across hundreds of sources". UI Deep Research is Pro/Enterprise.
- **Search ↔ prompt:** the search is driven by the **user message only**; the **system prompt does not influence search**. Search instructions written in prose are ignored.
- **Filters = request-body parameters (not prose):** `search_domain_filter` (array, **max 20**, allowlist or denylist via `-` prefix); `search_recency_filter` (`hour`/`day`/`week`/`month`/`year`); date filters `search_after_date_filter` / `search_before_date_filter` (`%m/%d/%Y`), `last_updated_*`.
- **`search_mode` / `academic` and exact `reasoning_effort` values:** ⚠️ verify in the API reference (forum mentioned `minimal`/`low`/`medium`/`high` + async; not confirmed on the verified pages).
- **Agent API** is Perplexity's recommended default for new applications.
- **Spaces** (formerly Collections, UI): persistent workspace — system prompt + curated sources + uploaded files.
- Prices are volatile — do not hardcode in the skill.

---

> Vendors not listed here have no volatile-fact entry yet. Add one (with a `last-verified` date) when the skill starts asserting model-specific facts about them.
