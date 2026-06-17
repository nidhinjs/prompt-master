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

`last-verified: 2026-06-15`

- **Current models: `deepseek-v4-pro` and `deepseek-v4-flash`** — 1M context, OpenAI-compatible (`base_url=https://api.deepseek.com`) and Anthropic-compatible interfaces. Each is **dual-mode** (Thinking / Non-Thinking) — one model, a per-request toggle, not separate models. V4-Pro (1.6T/49B active) = world-class reasoning (Math/STEM/coding), agentic coding; V4-Flash (284B/13B active) = reasoning close to Pro, cheaper/faster, good for simple agent tasks.
- **Legacy `deepseek-chat` / `deepseek-reasoner` → discontinued 2026-07-24** (currently map to non-thinking / thinking modes of `deepseek-v4-flash`). Do not recommend them as the target without noting the date (pattern #38).
- **Thinking mode:** enable with `thinking: {"type": "enabled"}` (`"disabled"` for non-thinking; default `enabled`). **`reasoning_effort` accepts only `high` (default) / `max`** — NOT low/medium (unlike Grok/OpenAI). Output = `reasoning_content` (CoT) + `content`.
- **In thinking mode `temperature` / `top_p` / `presence_penalty` / `frequency_penalty` are unsupported** — ignored, no error.
- **Multi-turn + tool calls:** if the assistant made a tool call, its `reasoning_content` MUST be passed back in subsequent turns; if no tool call occurred between user messages, `reasoning_content` may be omitted (ignored if passed).
- Reasoning-native (thinking mode) → do not add CoT; steer depth via `reasoning_effort`. Non-thinking mode is an ordinary chat model — system prompt + few-shot work normally (the old R1 "no system prompt" rule is outdated for current models).
- **JSON mode:** `response_format: {"type":"json_object"}` + instruct JSON in the prompt. **No native deep-research agent** (unlike Perplexity `sonar-deep-research` / Grok `grok-4.20-multi-agent`) — "deep research" = thinking (high/max) + web search (app) or your own RAG.
- ⚠️ verify before asserting: final V4 GA model names/pricing and exact max output (~384K per integration configs). Prices are volatile — do not hardcode.

## MiniMax

`last-verified: 2026-06-11`

- Default: M3. M2.7 carries a 1M-token context; M2.7-highspeed is latency-optimized.
- OpenAI-compatible API. **Temperature must be between 0 and 1 inclusive** — values above 1 fail.
- May output reasoning in `<think>` tags.

## Alibaba — Qwen

`last-verified: 2026-06-11`

- Qwen 2.5 instruct variants: strong instruction-following and JSON. Qwen3 has thinking and non-thinking modes (thinking mode → treat like a reasoning model, no CoT).
- ⚠️ verify the current Qwen generation/version before asserting — the line iterates quickly.

## Moonshot AI — Kimi

`last-verified: 2026-06-17`

- **Current models:** `kimi-k2.6` — flagship, natively multimodal (text/image/video in), **256K** context, dual-mode (thinking / non-thinking), Preserved Thinking via `thinking.keep:"all"`. `kimi-k2.7-code` (+ `kimi-k2.7-code-highspeed`) — strongest coding model, 256K, **forced thinking + forced preserve_thinking** (cannot disable; passing `"disabled"` errors; in Kimi Code a thinking-off request falls back to K2.6); MoonViT vision, experimental video (official API only); open-weights (Modified MIT). `kimi-k2.5` — 256K dual-mode, **no** Preserved Thinking. `moonshot-v1-8k/32k/128k` (+ vision) — legacy; **the only models that take full sampling** (`temperature` 0–1 default 0, `top_p`, `n` 1–5, `presence_penalty` / `frequency_penalty`). `kimi-latest` — **deprecated 2026-01-28** (pattern #38).
- **Thinking is reasoning-native** — the model emits `reasoning_content`; do not add CoT. Toggle `thinking:{"type":"enabled"|"disabled"}` (k2.6/k2.5; default enabled). **Defaults K2.x:** `temperature=1.0`, `top_p=0.95`, `max_tokens=32768`, `n=1` — keep the defaults; **do not tune `temperature` on K2.x** (full sampling is a `moonshot-v1-*`-only thing).
- **`tool_choice` with thinking enabled — only `auto` or `none`** (any other value errors). Parallel `tool_calls` are supported.
- **Tools / agent:** do **not** describe the tools or their usage in the system prompt ("interferes with Kimi K2.6's autonomous decision-making") — pass schemas via the `tools` array only. Multi-turn + tool calls → preserve the assistant's `reasoning_content` across turns (k2.6: set `thinking.keep:"all"`; tool loop: `max_tokens ≥ 16000` + streaming).
- **Web search:** built-in function `$web_search` (`"type":"builtin_function"`) **requires thinking DISABLED** (`extra_body:{"thinking":{"type":"disabled"}}`) — so deep reasoning and live web search are mutually exclusive in one call (pattern #46). ~$0.005/call; search tokens count in `prompt_tokens`. Citations not documented → apply the citation contract.
- **Multi-agent = Agent Swarm** (app): K2.6 self-orchestrates up to **300 sub-agents / 4000 coordinated steps** (K2.5: 100 / 1500), PARL-trained, "without predefined subagents" — so do **not** set an agent count or script sub-agents (unlike Grok's `agent_count`). App-first; ⚠️ verify API access / `Claw Groups` / `Kimi Work` (desktop agent). **`Kimi-Researcher`** is a separate, **single-agent** deep-research product, **app-only** (no API). Deep research via API = your own thinking + `$web_search`/browser/code loop + citation contract.
- **App modes (kimi.com UI):** Instant / Thinking / Agent / Agent Swarm / Kimi Work — these are app modes, **not** API params (on API: thinking/non-thinking + `tools`). Feature availability (Agent Swarm, sub-agent concurrency, Kimi Claw, Kimi Code credits) is **subscription-tiered** — free (Adagio) has no Swarm; surface as a prerequisite, don't assume, don't hardcode quotas.
- **API:** OpenAI- **and** Anthropic-compatible, `base_url=https://api.moonshot.ai/v1`. `response_format`: `text` / `json_object` / `json_schema`. `stop` ≤5 strings. Partial Mode (prefix-completion).
- ⚠️ verify: max output tokens, knowledge cutoff, whether `$web_search` returns inline citations, API availability of Agent Swarm / Claw Groups / Kimi-Researcher / Kimi Work, exact K2.7 architecture. Prices are per-model and volatile — do not hardcode.

## Perplexity

`last-verified: 2026-06-17`

Two surfaces — pick by task:
- **Agent API** (`POST https://api.perplexity.ai/v1/agent`; SDK `client.responses.create(model=…, input=…, max_output_tokens=…)`) — **Perplexity's recommended default for new applications** ("the agent loop, custom tools, and richer prompt control make it the better default"). A **multi-provider gateway** with direct first-party model access: `perplexity/sonar`, `anthropic/claude-opus-4-8` (…4-7/4-6/4-5) / `claude-sonnet-4-6` / `claude-haiku-4-5`, `openai/gpt-5.5` / `gpt-5.4`(+mini/nano) / `gpt-5.x`, `google/gemini-3.1-pro-preview` / `gemini-3.5-flash` / `gemini-3.1-flash-lite`, `xai/grok-4.3` / `grok-4.20-*`, `nvidia/nemotron-3-super-120b-a12b`. Has **presets** (incl. `deep-research`), custom **tools**, output-control, model-fallback, image-attachments. ⚠️ verify the GA model list — it changes monthly.
- **Sonar API** (OpenAI-compatible `chat.completions.create`) — search-grounded answers. Models: `sonar`, `sonar-pro`, `sonar-reasoning-pro`, `sonar-deep-research`. **`sonar-deep-research`** — **128K context**, reasoning model for exhaustive multi-source cited reports; **reasoning / citation / search-query tokens are billed separately**.
- **Sonar search is driven by the USER MESSAGE only** — the **system prompt does not influence search** (it reaches the model only at answer time). Search instructions in prose ("search only on X", "latest") are ignored.
- **Filters = request-body parameters (not prose):** `search_domain_filter` (array, **max 20**, allowlist or denylist via `-` prefix; domain- and URL-level); `search_recency_filter` (`hour`/`day`/`week`/`month`/`year`); date filters `search_after_date_filter` / `search_before_date_filter` (`%m/%d/%Y`), `last_updated_*`.
- **`reasoning_effort` exact values: ⚠️ verify** — `sonar-deep-research` is a reasoning model (separate reasoning-token billing), but the verified pages don't pin the enum. Don't assert specific values.
- **UI:** Deep Research = `sonar-deep-research`; Focus modes (Web/Academic/Social/YouTube…) and **Spaces** (persistent instructions + curated sources + files) are UI features, **not** API params.
- **"Search as Code" / "Deep Research in Computer"** (June 2026 blog) is a product concept — **not in the API docs**; do not present it as a callable API feature.
- Prices are volatile (per-token, no markup, updated monthly) — do not hardcode in the skill.

---

> Vendors not listed here have no volatile-fact entry yet. Add one (with a `last-verified` date) when the skill starts asserting model-specific facts about them.
