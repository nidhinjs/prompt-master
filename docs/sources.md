# Sources & Rationale

Why Prompt Master uses the techniques it does, with traceable references. **This file is documentation for maintainers — it is NOT loaded by the skill at runtime.** The skill's runtime context is `SKILL.md` plus the files in `plugins/prompt-master/skills/prompt-master/references/`.

## Core stance

- **Token efficiency over length.** Every sentence must be load-bearing. Progressive disclosure (tool profiles loaded on demand) keeps activation cost low — see CHANGELOG 1.9.0.
- **Anti-fabrication.** The skill refuses techniques that only *simulate* multi-pass reasoning in a single forward pass (Mixture of Experts, Tree / Graph of Thought, Universal Self-Consistency, layered prompt chaining). They inflate tokens and fabrication risk without real parallel execution.
- **Model-aware, not model-agnostic.** Prompting rules differ by target model; volatile model facts are dated and re-verified rather than hardcoded forever (`references/models.md`).

## Techniques and why

| Technique | Where in the skill | Rationale | Source |
|---|---|---|---|
| Outcome-first prompting | GPT-5.5 / Fable 5 routing | Define the destination, not the procedure; over-specifying process narrows the search space | OpenAI GPT-5.5 Prompt Guidance |
| Brief-intent steering (no rule enumeration) | Fable 5 routing | Strong instruction-following; long prescriptive skills degrade current-gen output | Claude Fable 5 prompting guide |
| No CoT on reasoning-native models | hard rules, patterns | These models reason internally; added CoT degrades output | OpenAI reasoning-model guidance; The Prompt Report |
| Single-pass structured Self-Critique (fixed dimensions) | RECENCY ZONE | Quality-checklist self-review **without** simulating multiple agents (single forward pass) | PhAlves23/prompt-engineering-skill; Self-Refine (Madaan et al., 2023) |
| Internal qualitative readiness gate (no numeric score) | Intent Extraction | Reduce ambiguity before generating; LLMs are poorly calibrated for precise probabilities, so no coefficient is shown — only concrete questions | Reflexion (Shinn et al., 2023); anti-fabrication stance |
| Placeholders vs open decision forks | Intent Extraction | A fill-in value can be a placeholder; a decision that changes the approach must be surfaced as a question/open fork, never silently defaulted — keeps the gate honest about what is still undecided | this project (v1.13) |
| Conditional model/effort economy (not always-tier) | Claude Code profile, Template M | Tiering and subagent orchestration cost tokens; apply only to large multi-part work. A single scoped task is cheapest as one focused pass — over-orchestration is itself an anti-pattern | this project (v1.13); Fable 5 prompting guide (effort + delegation) |
| Canonical Prompt Structure | `references/templates.md` | Consistent, attention-aware ordering for text-LLM prompts | The Prompt Report (Schulhoff et al., 2024); PhAlves23 |
| Dated model fact-sheet + 60-day re-verify | `references/models.md` | Volatile model facts go stale within a quarter; date + re-verify degrades gracefully | maintenance practice |
| Default "Claude" = Opus 4.8 (Fable 5/Mythos 5 suspended) | `models.md`, `tool-profiles.md`, SKILL.md Gotchas | Fable 5 / Mythos 5 were disabled for all customers on 2026-06-12 by a US export-control directive; routing "Claude" to a suspended model would break every prompt, so the default reverts to Opus 4.8. Fable blocks are kept (dated) for trivial rollback if access returns — exactly the pattern #38 / re-verify protocol working as designed | https://www.anthropic.com/news/fable-mythos-access; this project (v1.16) |
| Perplexity two-surface profile (Agent API default + Sonar / Deep Research) + Research Brief (Template N) + filters-as-params + Data-gaps/confidence | `tool-profiles.md` Perplexity profile (split from Manus), `models.md` Perplexity, `templates.md` Template N, SKILL.md | Perplexity is now two surfaces: **Agent API** (`/v1/agent`, `responses.create`) — recommended default for new apps, a multi-provider agent-loop gateway with presets/tools — and **Sonar API** (`sonar`/`sonar-pro`/`sonar-reasoning-pro`/`sonar-deep-research` 128K). Sonar search is driven by the user message (system prompt not seen by search); hard constraints (domain/recency) must be request **parameters**, not prose. `reasoning_effort` enum left ⚠️ verify; "Search as Code / Deep Research in Computer" is a blog concept, not an API feature. Lead files `Perplexity_Deep_Research_*` (about the separate DResearch-Skill project) used as leads only | perplexity doc-server: docs/agent-api (models, prompt-guide, presets, tools), docs/sonar (models, prompt-guide, filters, sonar-deep-research); verified 2026-06-17 (v1.21) |
| Grok (xAI) profile — reasoning-native, Web/X Search filters-as-params, native multi-agent, mandatory output format | `tool-profiles.md` Grok profile, `models.md` xAI section, SKILL.md Gotchas, Template N, pattern #44 | grok-4.3 is reasoning-native (no CoT; depth via `reasoning_effort`) and has **no realtime knowledge** without server-side Web/X Search enabled; search filters (handles/domains/dates) are request **parameters**, not prose; `grok-4.20-multi-agent` is a native multi-agent research model (4/16 agents); X Search is the signature for social/trend tasks; Grok answers best with an explicit output format | docs.x.ai (models, reasoning, web-search, x-search, multi-agent); verified 2026-06-15 (v1.18) |
| Conditional citation contract + never-silent output format | Diagnostic Checklist, Safe Techniques ("Source citations"), Grok/Perplexity/Gemini profiles, Template N, pattern #45 | Two production defects (Grok shipped unsourced prose; skill silently invented the answer format). Root cause: the rules lived only in low-authority Gotcha lines and lost to the Diagnostic Checklist's "derive silently". Fix wires them into the Diagnostic Checklist + readiness gate. Citations are **conditional** (factual/research task on a retrieval-capable tool) and always paired with "cite only retrieved, never fabricate, [uncertain]" — so the contract strengthens the anti-fabrication rule instead of inviting hallucinated sources | this project (v1.18.1); observed bug + RCA |
| DeepSeek V4 dual-mode profile + model/mode/effort decision table | `models.md` DeepSeek section, `tool-profiles.md` DeepSeek profile, SKILL.md Gotchas | DeepSeek moved V3.1→V3.2→V4; current API models are `deepseek-v4-pro` / `deepseek-v4-flash`, each one model with a Thinking/Non-Thinking toggle. Prompting forks on model (pro=hard reasoning/coding, flash=cheap/fast), mode (thinking for reasoning, non-thinking for simple), and effort (`high`/`max` only — no low/medium). Thinking mode ignores temperature/penalties; tool calls require preserving `reasoning_content`. No native deep-research agent. Verified against live docs — corrected the Grok-DeepSearch lead files (which over-stated a single "v4-pro" model and an unpublished "Think Max" system prompt) | api-docs.deepseek.com (thinking_mode, reasoning_model, changelog, V4 preview news); verified 2026-06-15 (v1.19) |
| Kimi (Moonshot AI) profile — dual-mode reasoning-native, agentic tool rules, Agent Swarm vs Kimi-Researcher, tier-gating | `models.md` Moonshot section, `tool-profiles.md` Kimi profile + Routing Index, SKILL.md Gotchas, Template N + Agentic Fragments carve-out, pattern #46 | Kimi K2.x is reasoning-native (no CoT; keep defaults — `temperature` not tuned on K2.x, full sampling is `moonshot-v1-*`-only); `tool_choice` only `auto`/`none` with thinking; tools must NOT be described in the system prompt (interferes with autonomous tool use); built-in `$web_search` requires thinking disabled (reasoning ⊕ live-search mutually exclusive → pattern #46); **multi-agent = Agent Swarm**, model-self-orchestrated (no manual agent count, unlike Grok) and app-first/tier-gated, distinct from the single-agent app-only **Kimi-Researcher**; native research/citation convention (`[Source: …]`, stars, Confirmed/Estimate, no full URLs, `【Insight】`). **Corrected 2 lead-file claims:** the "don't duplicate tool schema in system prompt" verbatim is NOT on the tool-calls page (real rule = don't describe tools in the system prompt); temperature is default 1.0 (keep default), not "calibrate 0.6–1.0" | platform.kimi.ai (prompt-best-practice, use-kimi-k2-to-setup-agent, use-kimi-api-to-complete-tool-calls, benchmark-best-practice, thinking-model guide, web-search), HF model cards Kimi-K2.6 / Kimi-K2.7-Code, kimi.com blog (Agent Swarm), moonshotai.github.io/kimi-cli; verified 2026-06-17 (v1.20) |
| Gamma two-surface profile (app text-to-deck + Generate API) + Deck Brief (Template O) + settings-as-knobs + anti-fabrication data + boundary=Theme/Gamma Agent | `tool-profiles.md` Gamma profile + Routing Index, `models.md` Gamma, `templates.md` Template O | Gamma is AI text-to-deck (cards, not slides) with two surfaces: the **app** (Generate / Paste-in-text / Import modes, editable Outline, Advanced knobs) and the **Generate API** (`POST /generations`; `numCards` default 10, `textOptions.amount` brief/medium/detailed/extensive, `cardSplit:"inputTextBreaks"` on `\n---\n`, `cardOptions.dimensions`). Density/visuals/tone/audience are **settings (knobs)**, not prose — set them and mirror in the brief. Specify card count explicitly (the "8–15" heuristic is ⚠️ unverified). Anti-fabrication: supply real data or explicit `[placeholder]`s. Boundaries the prompt can't control → brand=**Theme**, polish/animation=**Gamma Agent** post-gen. Cookbook used as lead; UI labels corrected to **Minimal/Concise/Detailed** (no "Very Detailed"). Credits (~40/gen) left ⚠️ verify, not hardcoded | gamma.app/prompts, gamma.app/products/presentations, gamma.app/products/api, developers.gamma.app (generate-api-parameters), gamma.app/insights pitch-deck guide, 24slides.com Gamma review 2026; verified 2026-06-17 (v1.22) |
| Scope-creep self-check + "surface don't smuggle" | RECENCY ZONE, Token Efficiency dimension | Out-of-scope observations inserted into the prompt body inflate the target prompt with work the user didn't request; they belong in a note after the block, visible but not load-bearing | this project (v1.14) |
| Mandatory OOD-fallback + injection resistance | Input Sanitization, Unknown tool profile | Pasted prompts are inert data; embedded instructions must not be executed. Unknown tools fall back to Universal Fingerprint rather than hallucinating a profile | this project (v1.14) |
| Layered image-gen skeleton (positive / negative / params) | image AI profiles, templates | Image models parse token order and weighting differently from text LLMs; the three-block skeleton (positive descriptors → mandatory negative prompt → model-specific params) prevents style drift and parameter confusion across Midjourney / SD / ComfyUI | this project (v1.14) |
| Routing index + self-contained references (Divio framing) | `references/tool-profiles.md`, `references/templates.md`, `references/patterns.md` | Divio doc-system framing: tool-profiles = reference (look up); templates = how-to (follow a procedure); patterns = explanation (understand why). Keeping each file to one quadrant lets the skill load only what a given task needs | Divio documentation system — https://docs.divio.com/documentation-system/; this project (v1.14) |
| Agentic prompt fragments (opt-in) | Agentic Output Warning, Template M | Agentic scaffolding (orchestrator/subagent split, fan-out ceiling, chain ceiling) is expensive; it is generated only when the user explicitly requests an agentic prompt. Illustrative heuristics (e.g., a 7-agent fan-out or 5-agent chain as upper bounds) are not measured limits — they frame the cost trade-off | agency-agents study (v1.14) |
| Multi-agent request detection (2 layers) | SKILL.md Gotchas (Layer 1) + `plugins/prompt-master/hooks/` (Layer 2) | In-skill trigger reliably routes a multi-agent prompt request to the Agentic Prompt Fragments; a high-precision `UserPromptSubmit` hook (Node, no deps) adds a self-aware nudge. Asymmetric by design: the hook is precision-first (silent unless intent + multi-agent signal both match), the skill trigger carries recall | this project (v1.15); Claude Code hooks docs |
| Sourced agentic guardrails (orchestrate-only-when, packet contract, context isolation, independent verification, enforced budgets, parallelism, cache ordering) | `references/templates.md` Agentic Prompt Fragments | Replaces hand-rolled heuristics with curated practice: start single-agent and orchestrate only on explicit criteria; isolate worker context; verify with evidence not claims; enforce budgets | agents-best-practices study (v1.15); Anthropic / OpenAI / OWASP sources below |

## Profile-admission heuristic

Before adding a new tool profile, apply the editorial test: **"Is this advice for the user, or for the vendor?"** A profile earns its place when it helps the user write a better prompt for that tool. Marketing copy, capability claims, or model-selling language fails the test and is excluded.

## Deliberately NOT adopted (from the v2 PRD)

To keep the skill cheap, honest, and consistent with its own hard rules, the following PRD proposals were rejected:

- **Council-style multi-critic** — simulating multiple critic personas in one forward pass is Mixture of Experts, which the skill's hard rules ban as fabrication-prone. Replaced by a single-pass structured Self-Critique.
- **Numeric uncertainty coefficient (≤ 0.1)** — LLMs are poorly calibrated for precise probabilities; showing a number is false precision and pollutes the clean output. Replaced by an internal Low/Med/High gate that surfaces only concrete questions.
- **4–5 clarifying questions** — conflicts with the hard 3-question cap. Kept the cap; on residual ambiguity the skill ships a best-effort prompt with explicit assumptions and flags open questions.
- **Formal Lean / Thorough modes and a 5-phase workflow** — process-heavy scaffolding that costs tokens and contradicts the outcome-first guidance the skill itself teaches. The skill scales depth to task complexity instead.

## References

- **The Prompt Report: A Systematic Survey of Prompting Techniques** — Schulhoff et al., 2024 — https://arxiv.org/abs/2406.06608
- **Self-Refine: Iterative Refinement with Self-Feedback** — Madaan et al., NeurIPS 2023 — https://arxiv.org/abs/2303.17651
- **Reflexion: Language Agents with Verbal Reinforcement Learning** — Shinn et al., 2023 — https://arxiv.org/abs/2303.11366
- **A Systematic Survey of Automatic Prompt Optimization Techniques** — Ramnath et al., 2025 — https://arxiv.org/abs/2502.16923
- **PhAlves23/prompt-engineering-skill** — https://github.com/PhAlves23/prompt-engineering-skill
- **OpenAI GPT-5.5 Prompt Guidance** — https://developers.openai.com/api/docs/guides/prompt-guidance
- **Claude Fable 5 prompting guide** — https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5

### Multi-agent / agentic best practices (v1.15 — via DenisSergeevitch/agents-best-practices)

- **agents-best-practices (curated skill + source map)** — https://github.com/DenisSergeevitch/agents-best-practices
- **Anthropic — Building effective agents** — https://www.anthropic.com/research/building-effective-agents
- **Anthropic — Effective context engineering for AI agents** — https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- **Anthropic — Effective harnesses for long-running agents** — https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- **Anthropic — Demystifying evals for AI agents** — https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents
- **OpenAI — Harness engineering** — https://openai.com/index/harness-engineering/
- **OpenAI — Prompt caching** — https://developers.openai.com/api/docs/guides/prompt-caching
- **OpenAI — Agent guardrails & human approvals** — https://developers.openai.com/api/docs/guides/agents/guardrails-approvals
- **OWASP — AI Agent Security Cheat Sheet** — https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html
- **NIST — AI Risk Management Framework** — https://www.nist.gov/itl/ai-risk-management-framework
- **Claude Code — Hooks** — https://docs.claude.com/en/docs/claude-code/hooks

### DeepSeek (v1.19 — verified via live docs)

- **DeepSeek — Thinking Mode** — https://api-docs.deepseek.com/guides/thinking_mode
- **DeepSeek — Reasoning Model (deepseek-reasoner)** — https://api-docs.deepseek.com/guides/reasoning_model
- **DeepSeek — Change Log (V4-Pro/Flash, legacy retirement 2026-07-24)** — https://api-docs.deepseek.com/updates
- **DeepSeek — V4 Preview Release** — https://api-docs.deepseek.com/news/news260424
- **DeepSeek — Create Chat Completion (params: thinking, reasoning_effort)** — https://api-docs.deepseek.com/api/create-chat-completion

### xAI / Grok (v1.18 — verified via live docs)

- **xAI — Models** — https://docs.x.ai/developers/models
- **xAI — Reasoning (`reasoning_effort`)** — https://docs.x.ai/developers/model-capabilities/text/reasoning
- **xAI — Multi Agent** — https://docs.x.ai/developers/model-capabilities/text/multi-agent
- **xAI — Web Search** — https://docs.x.ai/developers/tools/web-search
- **xAI — X Search** — https://docs.x.ai/developers/tools/x-search

### Perplexity (v1.21 — re-verified via perplexity doc-server 2026-06-17; v1.17 base)

- **Agent API — Models** (multi-provider gateway: perplexity/anthropic/openai/google/xai/nvidia) — docs/agent-api/models
- **Agent API — Prompt Guide / Presets / Tools / Output-control / Model-fallback** — docs/agent-api/{prompt-guide,presets,tools,output-control,model-fallback}
- **Perplexity Sonar — Prompt Guide** (search driven by user message) — https://docs.perplexity.ai/docs/sonar/prompt-guide
- **Perplexity Sonar — Search Filters** — https://docs.perplexity.ai/docs/sonar/filters
- **Perplexity — Sonar Deep Research model** (128K; reasoning/citation/search-query tokens billed separately) — https://docs.perplexity.ai/docs/sonar/models/sonar-deep-research
- **Perplexity — MCP server** — https://docs.perplexity.ai/docs/getting-started/integrations/mcp-server
- ⚠️ "Search as Code" / "Deep Research in Computer" — research.perplexity.ai / hub blog (June 2026), **product concept, not in API docs** — not treated as a callable feature.

### Kimi / Moonshot AI (v1.20 — verified via live docs 2026-06-17)

- **Kimi — Best Practices for Prompts** — https://platform.kimi.ai/docs/guide/prompt-best-practice
- **Kimi — Use K2.6 to Setup Agent (researcher conventions: citation format, stars, Confirmed/Estimate, 【Insight】, "don't list tools in system prompt")** — https://platform.kimi.ai/docs/guide/use-kimi-k2-to-setup-agent
- **Kimi — Tool Calls (parallel tool_calls)** — https://platform.kimi.ai/docs/guide/use-kimi-api-to-complete-tool-calls
- **Kimi — Benchmark Best Practices (defaults; `tool_choice` auto/none with thinking)** — https://platform.kimi.ai/docs/guide/benchmark-best-practice
- **Kimi — Thinking Model guide (forced thinking for k2.7-code; Preserved Thinking)** — https://platform.kimi.ai/docs/guide/use-kimi-k2-thinking-model
- **Kimi — Web Search (`$web_search` builtin_function, requires thinking disabled)** — https://platform.kimi.ai/docs/guide/use-web-search
- **Kimi — Models list / API** — https://platform.kimi.ai/docs/models.md · `base_url=https://api.moonshot.ai/v1`
- **HF model card — Kimi-K2.6 (Agent Swarm: 300 sub-agents / 4000 steps)** — https://huggingface.co/moonshotai/Kimi-K2.6
- **HF model card — Kimi-K2.7-Code (forced thinking, MoonViT, Modified MIT)** — https://huggingface.co/moonshotai/Kimi-K2.7-Code
- **kimi.com blog — Agent Swarm (PARL, self-orchestrated, beta/app)** — https://www.kimi.com/blog/kimi-k2-5
- **Kimi-Researcher (single-agent deep research, app-only)** — https://moonshotai.github.io/Kimi-Researcher/
- **Kimi Code CLI — Agent Skills (SKILL.md) + MCP** — https://moonshotai.github.io/kimi-cli/en/customization/skills.html

### Gamma (v1.22 — verified via live docs 2026-06-17)

- **Gamma — Prompt examples / AI prompts** — https://gamma.app/prompts
- **Gamma — Presentations product (create modes, Advanced settings, Gamma Agent, Themes)** — https://gamma.app/products/presentations
- **Gamma — Generate API product page** — https://gamma.app/products/api
- **Gamma — Generate API parameters** (`numCards` default 10, `textOptions.amount`, `cardSplit:"inputTextBreaks"`, `cardOptions.dimensions`, `themeId`) — https://developers.gamma.app (generate-api-parameters)
- **Gamma Insights — pitch-deck prompting guide** — https://gamma.app/insights
- **24slides — Gamma review 2026** — https://24slides.com (Gamma review)
- ⚠️ credits per generation (~40) and the "8–15 cards" heuristic are **volatile / unconfirmed** — left as `⚠️ verify`, not hardcoded; full Image Source enumeration also ⚠️ verify.

### Image + Video generation (v1.24 — verified via live docs 2026-07-01)

Full extracted fact-sheets live in the repo `docs/` research files (`image_video_tools_refresh_perplexity_2026-06-30.md`, `grok_imagine_facts_2026-06-30.md`, `gap_fill_patch.md`, `generation_tools_facts_2026-06-30.json`). Primary official sources per tool:

- **Midjourney V8.1** (`--oref`/`--ow` replaces `--cref`; `--hd`=2K; `--sref`/`--sw`) — https://docs.midjourney.com (Version · Parameter List · Omni Reference)
- **GPT-image `gpt-image-2`** (DALL·E retired 2026-05-12; `gpt-image-1.5`/mini/`chatgpt-image-latest` shutdown 2026-12-01; base64-only; edit ≤16 refs) — https://developers.openai.com/api/docs/guides/image-generation · /api/docs/deprecations
- **Stable Diffusion 3.5** (`sd3.5-large`/`-turbo`/`-medium`/`-flash`; cfg typical 1–20, negative_prompt optional; edit/Control endpoints) — https://platform.stability.ai/docs/api-reference
- **FLUX.2** (klein/pro/flex/max/dev; guidance 1.5–10; steps 1–50; multi-ref ≤8–10) — https://docs.bfl.ml/flux_2/flux2_overview
- **SeeDream 5.0** (`seedream-5-0-260128`/`-lite`; size 1K–4K; negative-prompt undocumented) — https://docs.byteplus.com/en/docs/ModelArk/1541523
- **Google Nano Banana 2 / Omni Flash** (`gemini-3.1-flash-image`/`-lite-image`/`gemini-3-pro-image`; `gemini-omni-flash-preview`; SynthID; Lite = no char-consistency) — https://ai.google.dev/gemini-api/docs/image-generation · /docs/omni · /docs/pricing
- **Veo 3.1** (`veo-3.1-generate-preview`; GA `veo-3.1-generate-001`; Veo 2/3 shutdown 2026-06-30) — https://ai.google.dev/gemini-api/docs/video · docs.cloud.google.com Veo 3.1
- **Runway** (`gen4.5` + `aleph2`; ⚠️ `gen4_aleph` sunset 2026-07-30; ratio 7 values) — https://docs.dev.runwayml.com/api/ · /guides/models/ · /api-details/api_changelog/
- **Kling 3.0 / Omni** (`kling-v3`/`kling-v3-omni`; cfg 0–1; mode std/pro (4k в API-схеме, продукт-гайдом не подтверждён); extension via legacy `/v1/videos/video-extend`) — https://kling.ai/document-api/
- **LTX-2** (checkpoints `ltx-2.3-22b-*`; 4K@50fps + audio ≤10s) — https://github.com/Lightricks/LTX-2
- **Luma Ray** (`ray-3.2`; video/edit/reframe; pose `precise`/`coarse`) — https://docs.agents.lumalabs.ai/guides/videos/generation/
- **Seedance 2.0** (`dreamina-seedance-2-0-260128` + Fast/Mini; 4–15s; 4K only standard) — https://docs.byteplus.com/en/docs/ModelArk/1520757
- **Grok Imagine** (`grok-imagine-image`/`-image-quality`; `grok-imagine-video-1.5`/`-video`; no negative-prompt; `api.x.ai/v1`) — https://docs.x.ai/developers/model-capabilities/imagine
- ⚠️ All `*-preview` model IDs and per-token/per-image/per-second prices are **volatile / DO-NOT-HARDCODE** — `models.md` carries `last-verified: 2026-07-01` and the deprecation timeline; re-verify before the next release (60-day protocol).
