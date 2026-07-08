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

`last-verified: 2026-07-08`

- **Fable 5 — REDEPLOYED 2026-07-01** (`claude-fable-5`). History: suspended 2026-06-12 for all customers under a US export-control directive; controls lifted 2026-06-30, access restored 07-01 (Claude Platform, claude.ai, Claude Code, Cowork — global). **Promotional access terms:** through **2026-07-12 11:59:59 PM PT**, eligible Pro/Max/Team users and premium seats on seat-based Enterprise can use Fable 5 up to **50% of weekly subscription limits**; after that limit, users can switch models or use usage credits. **Excluded:** Free, standard Enterprise seats, usage-based Enterprise, and API usage. **API usage is billed separately at standard API rates.** **Prerequisites:** Claude Code **2.1.170 or newer** for Fable 5; Cowork requires the latest Claude Desktop. After the promo deadline, Fable 5 no longer counts within weekly plan limits and requires usage credits. **Mythos 5 — restored for a set of US organizations only.** Sources: https://www.anthropic.com/news/fable-mythos-access · https://www.anthropic.com/news/redeploying-fable-5 · https://support.claude.com/en/articles/15424964-claude-fable-5-promotional-access (pattern #38).
- **Default "Claude" routing target (unchanged): Claude Opus 4.8** (`claude-opus-4-8`). 1M-token context. Assume Opus 4.8 when the user says "Claude" without naming a version. Opus 4.7 still selectable. **Fable 5 is a selectable option, NOT the default recommendation** — promo/usage-credit terms make it opt-in; recommend it only when the user asks for it or the task clearly needs the most-capable tier.
- **Other current 4.x IDs:** Sonnet 4.6 `claude-sonnet-4-6`; Haiku 4.5 `claude-haiku-4-5-20251001`.
- **Thinking:** Opus 4.x calibrates depth automatically (adaptive thinking) — **no extended-thinking budgets**; do not set `budget_tokens` or a fixed thinking budget. Fable 5 / Mythos 5: summarized-only adaptive thinking — same rule.
- **Effort levels:** `low` / `medium` / `high` / `xhigh`. On Claude Code the harness manages effort — do not hardcode it in prompts. On Fable 5, effort is the primary lever (set via the `effort` param/setting, not prompt prose).
- **Advisor Tool (beta):** requires beta header `advisor-tool-2026-03-01`; tool type `advisor_20260301`, `name:"advisor"`. The top-level executor may consult a server-side advisor model mid-generation; advisor must be Claude Sonnet 4.6 or more capable and at least as capable as the executor. Knobs: `max_uses`, `max_tokens` (min 1024), `caching`. Availability caveat: Claude API and Claude Platform on AWS beta; not currently Bedrock / Google Cloud / Microsoft Foundry. Source: https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool
- **Claude Managed Agents (beta):** all Managed Agents API requests require beta header `managed-agents-2026-04-01`; SDKs may set it automatically. Hosted stateful agent harness for long-running/asynchronous work; API access is enabled by default for API accounts, but platform behavior/feature availability differs on Claude Platform on AWS and research-preview subfeatures may require access. Multi-agent coordinator uses `agent_toolset_20260401` and a `multiagent` roster; coordinator adds `create_agent`, `send_to_agent`, `wait_for_agents`, `list_agents`; workers add `submit_result`, `send_to_parent`. Sources: https://platform.claude.com/docs/en/managed-agents/overview; https://platform.claude.com/docs/en/managed-agents/multi-agent
- **Refusals:** Fable 5 / Mythos 5 emit `stop_reason: "refusal"` for offensive-cybersecurity and biology/life-sciences work, plus a `reasoning_extraction` refusal if asked to echo/show reasoning.
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
- **Imagine + Voice:** Grok Imagine generates/edits images (`grok-imagine-image` fast · `grok-imagine-image-quality`) and video (`grok-imagine-video-1.5` · `grok-imagine-video` for reference-to-video); no negative-prompt param — see the Image/Video AI model-facts sections below. Grok Voice does realtime / TTS / STT.
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

## Gamma

`last-verified: 2026-06-17`

AI **text-to-deck** (gamma.app) — generates cards, not classic slides. Two surfaces — pick by task:
- **App (gamma.app UI):** 3 create modes — **Generate** (short prompt) / **Paste in text** / **Import** (file or URL). An editable **Outline** step ("Generate Outline") runs before final generation. Advanced settings are knobs, not prose: **Text Content = Minimal / Concise / Detailed** (UI labels; there is **no** "Very Detailed"); **Image Source** (Web search / Stock photos / AI-generated; ⚠️ verify full enumeration); **Tone**; **Target Audience**; **Format / Card size** (Default/Fluid vs 16:9 / 4:3). Post-generation edits via **Gamma Agent** (natural-language global edits). Brand = a saved custom **Theme** (fonts/colors/logo), set in the UI — **not** the prompt.
- **Generate API** (`POST /generations`, developers.gamma.app) — generates decks / docs / websites / carousels, 60+ languages. Params: `numCards` (default **10**, range 1–60; up to 75 on Ultra), `textOptions.amount` = **brief / medium / detailed / extensive** (API-only scale — distinct from the UI's Minimal/Concise/Detailed labels), `cardSplit: "inputTextBreaks"` (split input on `\n---\n`), `cardOptions.dimensions` (16x9 / 4x3 / fluid), `themeId`, image options.
- **`\n---\n` (triple-dash on its own line)** in Paste-in-text / API input hints card boundaries (with `cardSplit:"inputTextBreaks"`).
- **Boundaries — the prompt does NOT control:** exact layout/spacing; exact data/figures (Gamma fabricates or inserts placeholders — supply real data or instruct explicit `[placeholder]`s); brand-lock (→ Theme); animations/transitions (→ post-edit via Gamma Agent).
- ⚠️ verify before asserting: **credits per generation (~40 — volatile, do NOT hardcode)**; the full **Image Source** enumeration; the often-cited **"8–15 cards"** heuristic (NOT confirmed — the only hard number is API default `numCards=10`). Specify card count explicitly rather than relying on a default.

---

## Image AI — model facts

`last-verified: 2026-07-01` · ⚠️ Active GA-transition — preview IDs and prices move within days; **do NOT hardcode** any `*-preview` ID or price. Full prompting profiles in [tool-profiles.md](tool-profiles.md).

- **Midjourney** — **V8.1** default (since 2026-06-10; V7 selectable via `--v 7`). Character/object consistency = **Omni Reference `--oref` + `--ow` (1–1000, default 100)** — the old `--cref` is retired. Style `--sref` + `--sw` (0–1000, default 100). `--chaos` 0–100; `--no a, b`; `--hd` = native 2K; `--raw`. Editing (Vary Region/Pan) may fall back to the V6.1 engine.
- **GPT-image (OpenAI)** — flagship **`gpt-image-2`**. ⚠️ **DALL·E shut down 2026-05-12** (the legacy DALL·E 2 variations endpoint remains supported but is not the primary path); `gpt-image-1.5` / `gpt-image-1-mini` / `chatgpt-image-latest` **deprecated, shutdown 2026-12-01** → consolidate on `gpt-image-2`. Output is **base64 only** (no URL). Edit `/images/edits`: up to 16 refs + optional mask. Knobs: `size` (÷16, ratio ≤3:1, ≤3840px edge), `quality`, `n` 1–10, `background` opaque/auto, `moderation` auto/low.
- **Stable Diffusion (Stability)** — **SD 3.5** line: `sd3.5-large` / `-large-turbo` / `-medium` / `-flash`. `cfg_scale` **typical 1–20, default varies by endpoint** (legacy SDXL 0–35). `style_preset` (17 values); `negative_prompt` optional but strongly recommended. Edit endpoints: inpaint / outpaint / search-and-replace / erase; Control: structure / style-transfer. SD 3.0 APIs deprecated 2025-04-17 (auto-routed to 3.5).
- **FLUX.2 (Black Forest Labs)** — variants **klein** (fast/open) / **pro** / **flex** (typography) / **max** (+grounding) / **dev**. NL + structured/JSON prompts + hex colors. `[flex]` knobs: `guidance` 1.5–10, `steps` 1–50, `safety_tolerance` 0–5. Multi-reference up to 8 (10 in playground). Output up to 4MP.
- **SeeDream (ByteDance ModelArk)** — **5.0 / 5.0 Lite** (+4.x). Model IDs e.g. `seedream-5-0-260128`, `seedream-5-0-lite`. `POST /api/v3/images/generations`: `model` / `prompt` / `size` (1K–4K) / `output_format` / `watermark`. Unified gen+edit, multi-image references, grouped outputs. ⚠️ negative-prompt & exact `output_format` enum not documented — verify.
- **Google Nano Banana 2 (Gemini)** — GA IDs: **`gemini-3.1-flash-image`** (Nano Banana 2 — grounding + character-consistency), **`gemini-3.1-flash-lite-image`** (Lite — **1K-only, no grounding / no character-consistency / no style refs**, up to 14 object refs, ~$0.0336/1K), **`gemini-3-pro-image`** (Pro). `gemini-2.5-flash-image` is legacy. Route brand/character-consistency to 2 or Pro, not Lite. SynthID watermark by default. AR: 1:1,3:2,2:3,3:4,4:3,4:5,5:4,9:16,16:9,21:9. Prices volatile.
- **Grok Imagine (xAI)** — `grok-imagine-image` (fast) / `grok-imagine-image-quality`. **No negative-prompt parameter.** `aspect_ratio` (incl. 19.5:9 / 20:9 — image only), `resolution` 1k/2k. Edit `/images/edits` up to 3 refs. OpenAI-compatible `https://api.x.ai/v1`. Prices volatile.

## Video AI — model facts

`last-verified: 2026-07-01` · ⚠️ preview IDs / prices volatile — do NOT hardcode `*-preview` IDs. Full profiles in [tool-profiles.md](tool-profiles.md).

- **⏰ Deprecation timeline:** Google **Veo 2.0 / 3.0 shut down 2026-06-30** (migrate → Veo 3.1). Runway **`gen4_aleph` sunsets 2026-07-30** (→ `aleph2`). OpenAI **Sora `sora-2` / `-pro` scheduled shutdown 2026-09-24** — don't default new work to it.
- **Veo 3.1 (Google)** — preview `veo-3.1-generate-preview` / `-fast-generate-preview` / `-lite-generate-preview`; GA form keeps `-generate-`: `veo-3.1-generate-001` / `-fast-generate-001` / `-lite-generate-001` (⚠️ verify GA infix — Vertex page was gated). Clips 4/6/8s; 720p/1080p/4K (**4K not on Lite**); AR 16:9/9:16; up to 3 subject reference images; synced audio; extend, insert/remove objects.
- **Kling 3.0 / 3.0 Omni (Kuaishou)** — `kling-v3` / `kling-v3-omni`. Duration 3–15s; `mode` std (720p) / pro (1080p) / 4k (⚠️ 4K in API schema but Omni product-guide lists only 1080p/720p — verify); `cfg_scale` 0–1 default 0.5 (Omni cfg_scale unconfirmed). Multi-shot, native audio, Omni element/voice tags. Extension via legacy `/v1/videos/video-extend` (4–5s/ext, up to 3 min; only V1.0/1.5/1.6 sources). Lip-sync via `/v1/videos/identify-face`.
- **Runway** — `gen4.5` (generate) + `aleph2` (video-to-video edit). `/v1/{text_to_video,image_to_video,video_to_video}`; `ratio` (1280:720 / 720:1280 / 1104:832 / 832:1104 / 960:960 / 1584:672 / 672:1584), `duration` 2–10s, `seed`, aleph2 ≤5 keyframes, `contentModeration.publicFigureThreshold` auto/low. Also hosts Veo 3.1 / Seedance 2.0 / Omni Flash / happyhorse.
- **Sora (OpenAI)** — `sora-2` / `sora-2-pro`. Clips up to 20s, extend to 120s (≤6×); up to 1080p (`sora-2-pro`); `input_reference` first-frame; Characters API (≤2/video, **non-human subjects only — human likeness in uploads is blocked by default**). ⚠️ shutdown 2026-09-24.
- **LTX-2 (Lightricks)** — primary line; checkpoints `ltx-2.3-22b-dev` / `-distilled-1.1` (LTXV 0.9.8 legacy). Native 4K up to 50fps + synced audio (≤10s). Knobs: `guidance_scale` ~3–3.5, `inference_steps` (40+ quality / 20–30 fast / distilled 8·4), keyframe conditioning (frames ÷8+1), LoRA. t2v/i2v/v2v/extend/interpolate.
- **Luma Ray (Dream Machine)** — `ray-3.2`. `type` video / video_edit / video_reframe; resolution 360p–1080p (default 720p); 5s or 10s (10s not with HDR); up to 64 keyframes; edit controls depth / pose (**`precise` / `coarse`**, not numeric) / trajectory. video_edit source ≤18s.
- **Seedance 2.0 (ByteDance)** — `dreamina-seedance-2-0-260128` (BytePlus) / `doubao-seedance-2-0-260128` (Volcengine); Fast `…-fast-260128`, Mini `…-mini-260615`. `POST /api/v3/contents/generations/tasks`, multimodal `content[]` (image/video/audio refs, role `reference_*`), `generate_audio`, `ratio`, `duration` 4–15s, `resolution` 480p/720p/1080p/4K (**1080p not on Fast/Mini; 4K only standard**). Reference assets addressed as "Image 1", not by ID.
- **Omni Flash (Google)** — `gemini-omni-flash-preview` (Interactions API). Conversational video generation + editing (keep unchanged parts). Techniques: single-scene cues, `<FIRST_FRAME>` / `<IMAGE_REF_n>` tags, timecodes `[0-3s]`, "Keep everything else the same". SynthID watermark. ~$0.10/sec 720p (volatile). ⚠️ max clip length unconfirmed.
- **Grok Imagine video (xAI)** — `grok-imagine-video-1.5` / `grok-imagine-video` (reference-to-video). 5 modes (t2v / i2v first-frame / ref-to-video `<IMAGE_n>` / edit / extend). `duration` ≤15s, `resolution` 480p/720p/1080p (1080p only on `-1.5` for i2v); video-edit capped ~8.7s / 720p. `image` + `reference_images` mutually exclusive.

---

> Vendors not listed here have no volatile-fact entry yet. Add one (with a `last-verified` date) when the skill starts asserting model-specific facts about them.
