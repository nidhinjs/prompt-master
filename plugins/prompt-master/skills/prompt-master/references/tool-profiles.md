# Tool Profiles — load on demand

Per-tool routing profiles. **Read only the one section that matches the identified target tool** — do not load this whole file into context. SKILL.md carries a quick Gotchas cheat-sheet for the most common pitfalls; come here for the full per-tool profile, then read [templates.md](templates.md) only for the template structure you need.

For volatile model facts (model IDs, current defaults, version-tied params, what's retired), see [models.md](models.md) and honor its 60-day re-verify protocol — the profiles below carry evergreen prompting advice, not point-in-time model specs.

**Each profile is self-contained — usable when loaded in isolation without SKILL.md in context.**

---

## Routing Index

Pick the row that matches the user's tool, then open only that profile below.

| Tool | Handles | When to route |
|---|---|---|
| **Claude Opus 4.8 / 4.7** | Default Claude; literal execution, heavy reasoning, 1M context, agentic | Any "Claude" request without a version |
| **Claude Fable 5 / Mythos 5** | (frontier) — ⚠️ **suspended since 2026-06-12, unavailable** | Do not route here until access is restored (see models.md) |
| **GPT-5.x / ChatGPT** | Long-context synthesis, tone adherence, persona framing | User is on OpenAI or ChatGPT |
| **o3 / o4-mini / OpenAI reasoning** | Deep reasoning tasks where process must not be dictated | User names o3/o4-mini or an OpenAI reasoning model |
| **Grok 4.3 / xAI** | Reasoning-native chat/coding; realtime X + web search; native multi-agent research | User names Grok or xAI |
| **Gemini 2.x / 3 Pro** | Multimodal, large-document, Google ecosystem | User is on Google AI Studio, Vertex, or Gemini |
| **Kimi / Moonshot AI** | Reasoning-native dual-mode; agentic/coding; Agent Swarm (app); long-context | User names Kimi or Moonshot |
| **Qwen 2.5 / Qwen3** | Structured output, JSON, instruct; Qwen3 adds thinking mode | User names Qwen or an Alibaba model |
| **Ollama** | Local model deployment (Llama, Mistral, Qwen, CodeLlama …) | User running models locally via Ollama |
| **Llama / Mistral / open-weight** | General open-weight; weaker instruction following | User names a Llama or Mistral variant |
| **DeepSeek V4** (`v4-pro` / `v4-flash`) | Dual-mode (Thinking / Non-Thinking); reasoning-native in thinking | User names DeepSeek, V4, or R1 |
| **MiniMax M3 / M2.7** | OpenAI-compatible API; long context; fast variant | User names MiniMax |
| **Claude Code** | Agentic file editing, terminal commands, multi-step coding | User is inside Claude Code or building a Claude Code prompt |
| **Cortex Code** | Snowflake-native agentic coding + SQL + Streamlit | User names Cortex Code or Snowflake Cortex |
| **Antigravity** | Google agent-first IDE; Gemini 3 Pro; browser automation | User names Antigravity or Google's agentic IDE |
| **Cursor / Windsurf** | Agentic IDE file editing with path-scoped prompts | User is in Cursor or Windsurf |
| **Cline** | VS Code agentic extension; autonomous edits + terminal | User is using Cline (Claude Dev) |
| **GitHub Copilot** | Inline code completion from comments/signatures | User is completing code inside Copilot |
| **Bolt / v0 / Lovable / Figma Make / Google Stitch** | Full-stack or UI generators | User names a no-code/low-code generator |
| **Gamma / AI presentations** | Text-to-deck (app + Generate API); structured deck briefs | User names Gamma or wants slides/a deck/presentation |
| **Devin / SWE-agent** | Fully autonomous coding agent with web + terminal access | User names Devin or SWE-agent |
| **Perplexity** | Agent API (default for new apps) + Sonar search / Deep Research | User names Perplexity, Sonar, or Comet |
| **Manus / multi-agent orchestrators** | Multi-agent web research; decompose internally | User names Manus or a web-research orchestrator |
| **Computer-Use / Browser agents** | Real-browser automation (click, scroll, fill, transact) | User names Comet, Atlas, Claude in Chrome, or a browser agent |
| **Image AI — Generation** | Text-to-image (Midjourney, GPT-image, SD, FLUX.2, SeeDream, Google Nano Banana, Grok Imagine) | User wants to generate an image |
| **Image AI — Reference Editing** | Edit or modify an existing image | User mentions "change/edit/modify" an image or uploads a reference |
| **ComfyUI** | Node-based image workflow; separate positive/negative blocks | User is using ComfyUI |
| **3D AI** | Text-to-3D / game asset generation (Meshy, Tripo, Rodin) | User wants 3D output |
| **3D AI — In-Engine** | Unity AI, Blender AI add-ons | User is working inside Unity or Blender |
| **Video AI** | Text-to-video (Veo 3.1, Kling, Runway, Sora, LTX-2, Luma, Seedance 2.0, Grok Imagine, Omni Flash) | User wants video output |
| **Voice AI** | Speech synthesis, emotion, pacing (ElevenLabs) | User wants voice/audio output |
| **Workflow AI** | Automation recipes (Zapier, Make, n8n) | User is building a no-code automation |
| **Prompt Decompiler** | Break down, adapt, simplify, or split an existing prompt | User pastes an existing prompt to analyse or reuse |

---

**Claude (claude.ai, Claude API, Claude 4.x)**

Current default is **Claude Opus 4.8** (4.7 selectable) — assume Opus 4.8 unless the user names a specific model. ⚠️ **Claude Fable 5 / Mythos 5 are suspended/unavailable since 2026-06-12** (US export-control directive — see [models.md](models.md)); do NOT route to them until access is restored. The Fable 5 block below is retained for that case but is currently inactive.

*Durable across Claude 4.x (4.6 / 4.7 / 4.8):*
- Be explicit and specific — Claude 4.x follows instructions literally. It does exactly what you say, nothing more. Missing context = narrow literal output, not a smart guess.
- Claude Opus 4.x over-engineers by default — add "Only make changes directly requested. Do not add features or refactor beyond what was asked."
- XML tags help for complex multi-section prompts: `<context>`, `<task>`, `<constraints>`, `<output_format>` — **syntax preference: use XML tags for structured output** (evergreen; applies across Claude 4.x)
- Provide context and reasoning WHY, not just WHAT — Claude generalizes better from explanations
- Always specify output format and length explicitly
- For complex or multi-step tasks: front-load everything in one turn — intent, constraints, acceptance criteria, relevant files. Every extra back-and-forth turn adds reasoning overhead and token cost.
- Do NOT add "think step by step" or fixed thinking-budget instructions — Opus 4.x uses adaptive thinking and calibrates depth automatically. To influence depth: "Think carefully before responding" (more) or "Prioritize responding quickly" (less).
- Use Template M for agentic or multi-step tasks.

*Opus 4.8 (selectable fallback):*
- Shares 4.7's literalism and adaptive thinking — the same front-loading discipline applies. Treat the first turn as the only turn for complex work: intent, scope, constraints, acceptance criteria up front.
- 1M-token context window — large multi-file context can go in a single prompt, but keep it relevant; padding still dilutes attention.
- Effort/thinking depth is calibrated automatically — do not specify an effort level or thinking budget.

*Opus 4.7 (still selectable):*
- More literal than 4.6 — vague first turns produce narrower results. Front-load intent, file scope, constraints, and acceptance criteria.

---

**Claude Fable 5 / Mythos 5 (newest, most capable — for hard, long-horizon, ambiguous work)**

> ⚠️ **SUSPENDED / UNAVAILABLE since 2026-06-12** (US export-control directive; see [models.md](models.md)). Do NOT route here — route "Claude" to **Opus 4.8** instead. This block is retained for if/when access is restored.

Fable 5 takes on problems too complex, long-running, or ambiguous for prior models — end-to-end work measured in hours to days. Prompt it differently from Opus 4.x: **steer with brief intent, not enumerated rules.** Instruction-following is strong enough that one short instruction replaces a long checklist.

- **Effort is the primary lever.** Default `high`; `xhigh` for the most capability-sensitive work; `medium` / `low` for routine. Lower effort on Fable 5 still beats `xhigh` on prior models. Drop effort if a task completes but takes longer than needed.
- **Don't over-prescribe.** Prompts and skills written for older models are often too prescriptive and *degrade* Fable 5 output. Strip step-by-step scaffolding; state the outcome and constraints, let it find the path.
- **Curb over-engineering at high effort with one line:** "Don't add features, refactor, abstractions, error handling, or backwards-compat shims beyond what the task requires. Do the simplest thing that works. Only validate at system boundaries."
- **Avoid overplanning on ambiguous tasks:** "When you have enough information to act, act. Don't re-derive established facts, re-litigate decided choices, or narrate options you won't pursue. Give a recommendation, not a survey."
- **Ground progress claims on long runs:** "Before reporting progress, audit each claim against a tool result from this session. Report only work you can point to evidence for; if something isn't verified, say so. If tests fail, say so with the output."
- **State the boundaries** — Fable 5 can take unrequested actions: "When the user is describing a problem or asking a question rather than requesting a change, report your assessment and stop. Don't apply a fix until asked."
- **Checkpoints, not a wall of cases:** "Pause for the user only for a destructive/irreversible action, a real scope change, or input only they can provide. Otherwise proceed."
- **Parallel subagents** are dispatched readily — encourage delegation and async communication: "Delegate independent subtasks to subagents and keep working while they run."
- **Memory system** boosts repeat-task quality — point it at a notes file: "Store one lesson per file with a one-line summary; record corrections and confirmed approaches with why they mattered."
- **Longer turns by default** — hard tasks run many minutes; autonomous runs, hours. Note this for harness/timeout/streaming expectations.
- ⚠️ **NEVER instruct it to reproduce / echo / show its reasoning in the response** — triggers a `reasoning_extraction` refusal and fallback to Opus 4.8. For visible progress, use a send-to-user tool (renders the message verbatim without ending the turn).
- **Give the reason, not just the request:** "I'm working on [larger task] for [who]. They need [what the output enables]. With that in mind: [request]."
- Not for offensive-cybersecurity or biology/life-sciences work — those return a refusal; route the user to Opus 4.8 for benign cases in those domains.

---

**ChatGPT / GPT-5.x / OpenAI GPT models**

*Durable across GPT-5.x:*
- Start with the smallest prompt that achieves the goal — add structure only when needed
- Be explicit about the output contract: what format, what length, what "done" looks like
- State tool-use expectations explicitly if the model has access to tools
- Use compact structured outputs — GPT-5.x handles dense instruction well
- GPT-5.x is strong at long-context synthesis and tone adherence — leverage these
- **Syntax preference: persona framing works well** — opening the system prompt with "You are a [role] who [trait]" reliably anchors tone and expertise (evergreen across GPT-5.x)

*GPT-5.5 (current OpenAI guidance — outcome-first):*
- Write **outcome-first**, not step-by-step. Define destination (goal + success criteria + constraints + available evidence + stop rules), not a prescribed procedure. Over-specifying process narrows the search space and produces mechanical answers.
- **Drop legacy instruction stacks.** Shorter, less process-heavy prompts often beat prompts carried over from older models. Re-evaluate every inherited line.
- **Avoid absolutes** (ALWAYS / NEVER / MUST / ONLY) unless they are true safety, policy, or invariant constraints — GPT-5.5 follows them literally and they distort otherwise-flexible behavior.
- **Verbosity is a parameter, not prose.** For API users, control length with `text.verbosity` (`low` / `medium`); reserve in-prompt length caps for when the parameter isn't available.
- **Reasoning effort:** re-test at `low` / `medium` before escalating — efficiency gains mean higher effort is often unnecessary. Use effort for genuinely hard tasks, not as a default lever.
- **Preambles for tool/multi-step work:** "Before any tool calls, send a short user-visible update acknowledging the request and stating the first step." Improves perceived responsiveness when streaming.
- **Retrieval budgets:** tell it when to stop searching — "Make another retrieval call only if the top results don't answer the core question, a required fact is missing, or exhaustive coverage was explicitly requested."
- **Personality / collaboration style:** for conversational products, state tone and proactivity briefly and explicitly (default style is efficient and direct). For production systems the default is usually fine.
- **Default to plain paragraphs.** Add bullets/headers only when they aid comprehension; distinguish source-backed facts from creative wording.

---

**o3 / o4-mini / OpenAI reasoning models**
- SHORT clean instructions ONLY — these models reason across thousands of internal tokens
- NEVER add CoT, "think step by step", or reasoning scaffolding — it actively degrades output
- Prefer zero-shot first — add few-shot only if strictly needed and tightly aligned
- State what you want and what done looks like. Nothing more.
- Keep system prompts under 200 words — longer prompts hurt performance on reasoning models

---

**Grok (xAI — grok-4.3, realtime X/web search, native multi-agent research)**

- **grok-4.3 is reasoning-native** — it thinks internally before answering. Do NOT add "think step by step" / CoT scaffolding; control depth with the `reasoning_effort` setting (`none` / `low` default / `medium` / `high`) — raise to `high` for hard math, logic, or multi-step work. Do NOT set `stop`, `presencePenalty`, or `frequencyPenalty` — they error on reasoning models.
- **No realtime knowledge** — Grok has a training cutoff and does not know current events unless server-side search is enabled. For any "today / latest / current" task, instruct enabling **Web Search** and/or **X Search**; without it, Grok answers from stale training data (or guesses).
- **X Search is the signature differentiator** — realtime search of X (Twitter) for social sentiment, trends, and what people are saying. Reach for it on social / opinion / trend tasks; Web Search covers the open web. Both return citations.
- **Search filters are request PARAMETERS, not prose** (same discipline as Perplexity): X Search — `allowed_x_handles` / `excluded_x_handles` (≤20, mutually exclusive), `from_date` / `to_date` (ISO8601); Web Search — `allowed_domains` / `excluded_domains` (≤5). "Only look at @handle / site X" written in prose is unreliable — set the parameter.
- **Native multi-agent research** — for deep, multi-faceted research route to `grok-4.20-multi-agent` (beta): frame it as a research brief (Template N), choose 4 agents (focused) or 16 (deep/thorough), and enable `web_search` + `x_search` for sourced answers. Built-in tools only — no custom function-calling, no Chat Completions API.
- **Always specify the answer's output format** — structure, length, sections, or a table (or Structured Outputs / JSON schema). Grok, especially multi-agent, follows structured-output requests well; leaving format open yields verbose prose. If the user didn't state the format, **ask it as the first clarifying question, or surface the assumed format as an explicit assumption in the note — never derive it silently.**
- **Require inline citations when search is on and the task is factual** — Web/X Search return citations, but the prompt must ask for them: "Cite each non-obvious claim inline with a link to the source you actually retrieved; end with a sources list; never fabricate a citation or URL; mark unsourced claims [uncertain]." Skip for creative / code / no-search prompts.
- **Surface the knobs you defaulted** — deliver an `Assumed settings:` note line for the levers the user didn't set (e.g. `reasoning_effort=low · Web+X Search on · no handle/domain/date filter`; add `· 4 agents` only for `grok-4.20-multi-agent`), each with where to change it (request parameters). Never ask — always overridable. Keep it separate from the `Assumed output format` line above (format may still be asked first).
- **OpenAI-compatible API** (`base_url=https://api.x.ai/v1`) — prompts transfer from GPT; the Responses API is preferred (stateful, `previous_response_id`). No role-order restriction.
- Image/video (**Grok Imagine**) and **Grok Voice** are separate APIs — route those requests to the Image / Video / Voice profiles.

---

**Gemini 2.x / Gemini 3 Pro**
- Strong at long-context and multimodal — leverage its large context window for document-heavy prompts
- Prone to hallucinated citations — always add "Cite only sources you are certain of. If uncertain, say [uncertain]."
- For grounded / research tasks (Gemini Deep Research, search-grounded answers): require inline citations per claim to retrieved sources, never fabricated — this complements the hallucinated-citation guard above
- Can drift from strict output formats — use explicit format locks with a labelled example
- For grounded tasks add "Base your response only on the provided context. Do not extrapolate."

---

**Kimi (Moonshot AI — K2.x dual-mode, agentic; Agent Swarm)**

For volatile model IDs/defaults see [models.md](models.md) (Moonshot — Kimi). Reasoning-native; OpenAI- and Anthropic-compatible (`base_url=https://api.moonshot.ai/v1`) → GPT/Claude prompts transfer.

*Pick the model:*
- `kimi-k2.6` — default (multimodal, dual-mode, web search); `kimi-k2.7-code` — coding / agentic coding (thinking is **always on** — don't pass `thinking`); `kimi-k2.5` — cheaper dual-mode (no Preserved Thinking); `moonshot-v1-*` — legacy / only when you genuinely need sampling params. Recommend, don't hardcode.

*Pick the mode (K2.x):*
- **Thinking** (default) for reasoning/coding/agentic/analysis — reasoning-native, so **no CoT / "think step by step."** **Non-thinking** for chat/extraction/classification/latency — **and required for `$web_search`.**
- **Keep the defaults — do not tune `temperature`** on K2.x (default 1.0); full sampling (`temperature`/`top_p`/`n`/penalties) is a `moonshot-v1-*`-only thing. With thinking on, **`tool_choice` may only be `auto` or `none`**.

*Tools / agent:*
- **Do NOT describe the tools or their usage in the system prompt** — it interferes with K2.6's autonomous tool decisions; pass schemas via the `tools` array only. Parallel `tool_calls` supported; sustains ~200–300 sequential calls.
- **Preserve `reasoning_content`** across turns once a tool call has happened (k2.6: set `thinking.keep:"all"`; tool loop: `max_tokens ≥ 16000` + streaming). Integrates as the model behind Claude Code / Cline / RooCode / Hermes / OpenClaw (esp. k2.7-code).

*Web search & the reasoning⊕search conflict:*
- Built-in `$web_search` (`"type":"builtin_function"`) **requires thinking DISABLED** — so you cannot deep-reason and live-search in the same call (pattern #46). For factual/research output apply the **citation contract** in Kimi's native style: `[Source: Institution / Website: Page Title]`, credibility stars `*** / ** / *`, `Confirmed`/`Estimate` tags, verify 2+ sources, **no full URLs in the report**, `【Insight】` tag, staged structure (Information Search → Data Analysis → Report Output → References).

*Multi-agent, deep research, app vs API:*
- **Multi-agent = Agent Swarm** (app): K2.6 **self-orchestrates** up to 300 sub-agents — so for a Swarm prompt **don't set an agent count and don't script sub-agents** (the opposite of Grok / orchestrator-as-decomposer); give one large decomposable task + a clear final artifact. **`Kimi-Researcher`** is a separate, single-agent deep-research product — app-only; don't conflate it with Swarm. Through the **API** there's no confirmed Swarm/Researcher endpoint → build your own agentic tool-loop.
- **App modes (kimi.com):** Instant (quick) · Thinking (hard questions) · Agent (research/slides/docs/sheets) · Agent Swarm (large-scale/long-form/batch) · Kimi Work (desktop agent). On the API there are no modes — only thinking/non-thinking + tools.
- **Tier-gated:** Agent Swarm, sub-agent concurrency, Kimi Claw, Kimi Code credits depend on the user's plan (free Adagio has no Swarm) — surface as a **prerequisite/assumption**, never assume availability; don't hardcode quotas or prices.
- **Output format is never silently derived** (Hard rule) — ask it or surface it as an explicit assumption.

---

**Qwen 2.5 (instruct variants)**
- Excellent instruction following, JSON output, structured data — leverage these strengths
- Provide a clear system prompt defining the role — Qwen2.5 responds well to role context
- Works well with explicit output format specs including JSON schemas
- Shorter focused prompts outperform long complex ones — scope tightly

---

**Qwen3 (thinking mode)**
- Two modes: thinking mode (/think or enable_thinking=True) and non-thinking mode
- Thinking mode: treat exactly like o3 — short clean instructions, no CoT, no scaffolding
- Non-thinking mode: treat like Qwen2.5 instruct — full structure, explicit format, role assignment

---

**Ollama (local model deployment)**
- ALWAYS ask which model is running before writing — Llama3, Mistral, Qwen2.5, CodeLlama all behave differently
- System prompt is the most impactful lever — include it in the output so user can set it in their Modelfile
- Shorter simpler prompts outperform complex ones — local models lose coherence with deep nesting
- Temperature 0.1 for coding/deterministic tasks, 0.7-0.8 for creative tasks
- For coding: CodeLlama or Qwen2.5-Coder, not general Llama

---

**Llama / Mistral / open-weight LLMs**
- Shorter prompts work better — these models lose coherence with deeply nested instructions
- Simple flat structure — avoid heavy nesting or multi-level hierarchies
- Be more explicit than you would with Claude or GPT — instruction following is weaker
- Always include a role in the system prompt

---

**DeepSeek (V4 — `deepseek-v4-pro` / `deepseek-v4-flash`, dual-mode)**

Current models are `deepseek-v4-pro` and `deepseek-v4-flash` (1M context; OpenAI-compatible at `base_url=https://api.deepseek.com`, also Anthropic-compatible). Each is one model with a per-request **Thinking / Non-Thinking** toggle. Legacy `deepseek-chat` / `deepseek-reasoner` are discontinued 2026-07-24 — don't target them without noting the date.

*Pick model × mode × effort:*
- **Model:** `v4-pro` for hard reasoning, agentic coding, Math/STEM, deep analysis (quality-first); `v4-flash` for simple/high-volume/latency- or cost-sensitive work (reasoning close to Pro). **Name the recommended variant explicitly (`deepseek-v4-pro` or `deepseek-v4-flash`) in the target line — don't leave it at bare "V4".** Recommend, don't hardcode — the user/harness selects finally.
- **Mode:** **Thinking** (`thinking: {"type":"enabled"}`) for math, logic, debugging, multi-step, agentic, deep analysis; **Non-Thinking** (`"disabled"`) for chat, extraction, classification, formatting, translation, latency-sensitive.
- **Effort (thinking only):** `reasoning_effort` is `high` (default) or `max` — there is no low/medium.

*Rules:*
- Thinking mode is reasoning-native → do NOT add CoT / "think step by step"; steer depth with `reasoning_effort`. In thinking mode `temperature` / `top_p` / penalties are ignored (no effect) — don't set them.
- Non-thinking mode is an ordinary chat model — a full system prompt and few-shot examples work normally (don't carry over the old R1 "no system prompt" rule).
- **Multi-turn + tool calls:** instruct preserving the assistant's `reasoning_content` across subsequent turns once a tool call has occurred (dropping it breaks the next turn); if no tool call happened, it can be omitted.
- **JSON:** `response_format: {"type":"json_object"}` + tell the model to output JSON. OpenAI-compatible → GPT prompts transfer directly.
- **"Deep research":** DeepSeek has no native deep-research agent — frame it as Thinking (`max`) + web search (app) / your own RAG, and apply the citation contract (the app's web search emits inline `[citation:X]`). For true agentic multi-source research, that's Perplexity / Grok multi-agent territory.

---

**MiniMax (M3 / M2.7)**
- OpenAI-compatible API — prompts that work with GPT models transfer directly
- Strong at instruction following, structured output, and long-context synthesis — 1M context window on M2.7
- M2.7-highspeed is optimized for speed — use for latency-sensitive tasks
- Temperature must be between 0 and 1 (inclusive) — prompts that set temperature above 1 will fail
- May output reasoning in `<think>` tags — add "Output only the final answer, no reasoning tags." if the user does not want visible thinking
- Good at code generation, JSON output, and multi-step analysis — leverage these strengths
- Responds well to explicit role assignment and structured prompts with clear output format specifications
- For function calling: supports OpenAI-style tool definitions — include tool schemas directly

---

**Claude Code**
- Agentic — runs tools, edits files, executes commands autonomously
- Starting state + target state + allowed actions + forbidden actions + stop conditions + checkpoints
- Stop conditions are MANDATORY — runaway loops are the biggest credit killer
- **Default recommended model is Claude Opus 4.8** (4.7 selectable) — Fable 5 / Mythos 5 are suspended/unavailable since 2026-06-12 (see models.md), so do NOT recommend them. The model is ultimately harness/config-selected — recommend it, don't hardcode it. Effort and thinking depth are harness/adaptive-managed — do NOT hardcode an effort level or thinking budget.
- **Match orchestration to task size — token economy first.** A single scoped change → one focused pass at the right effort, no subagents (cheapest; over-orchestration costs more than it saves). A large multi-part job → an orchestrator (Opus 4.8) that plans and delegates independent subtasks to subagents, keeping mechanical steps lean. Per-subagent model is set by harness/config, not the prompt body — steer economy through effort + delegation, not by naming a model per agent. Don't spawn agents for a one-module task.
- The literalism caveats below apply to Opus 4.x (the current default): be explicit, front-load context.
- Opus 4.7 and 4.8 are more literal than 4.6 — vague first turns produce narrower results. Front-load everything: intent, file scope, constraints, acceptance criteria, session strategy.
- Opus 4.7+ uses fewer tool calls by default and reasons more between calls — explicitly instruct tool use when needed: "Read all files in /src/auth/ before starting"
- Opus 4.7+ spawns fewer subagents by default — explicitly request when needed: "Use a subagent to investigate X so it stays out of main context"
- Claude Opus 4.x over-engineers — add "Only make changes directly requested. Do not add extra files, abstractions, or features."
- Always scope to specific files and directories — never give a global instruction without a path anchor
- Human review triggers required: "Stop and ask before deleting any file, adding any dependency, or affecting the database schema"
- Session hygiene matters: new task = new session. Use /rewind instead of correcting mid-conversation. /compact at ~50% context, not 90%.
- For complex tasks: use Template M. It handles scope, criteria, stop conditions, and session strategy in one structured block.

---

**Cortex Code (Snowflake's CLI coding agent)**
- Agentic like Claude Code — runs tools, edits files, executes SQL, manages Snowflake objects autonomously
- Powered by Claude Opus 4.x — apply the same anti-over-engineering guard: "Only make changes directly requested. No extra files, abstractions, or features."
- Skills system: markdown-based system prompts loaded via `cortex skill add` — reference skill capabilities rather than re-explaining them
- Snowflake-native: prefer the `snowflake_sql_execute` tool for SQL and `st.connection("snowflake")` for Streamlit-in-Snowflake apps over raw connectors
- Stop conditions and human-review triggers are critical — same runaway-loop risk as Claude Code
- For complex tasks: use `cortex ctx task add` / `cortex ctx step add` to break work into tracked steps — the agent loses coherence on long unstructured tasks
- Headless mode (`cortex -p "prompt" --output-format stream-json`) available for CI/automation — output is JSON events, not plain text

---

**Antigravity (Google's agent-first IDE, powered by Gemini 3 Pro)**
- Task-based prompting — describe outcomes, not steps
- Prompt for an Artifact (task list, implementation plan) before execution so you can review it first
- Browser automation is built-in — include verification steps: "After building, verify UI at 375px and 1440px using the browser agent"
- Specify autonomy level: "Ask before running destructive terminal commands"
- Do NOT mix unrelated tasks — scope to one deliverable per session

---

**Cursor / Windsurf**
- File path + function name + current behavior + desired change + do-not-touch list + language and version
- Never give a global instruction without a file anchor
- "Done when:" is required — defines when the agent stops editing
- For complex tasks: split into sequential prompts rather than one large prompt

---

**Cline (formerly Claude Dev)**
- Agentic VS Code extension — autonomously edits files, runs terminal commands, uses browser tools
- Powered by Claude, GPT, or other LLMs — prompting style should match the underlying model
- Starting state + target state + file scope + stop conditions + approval gates
- Always specify which files to edit and which to leave untouched
- Add "Ask before running terminal commands" or "Ask before installing dependencies" to prevent unwanted actions
- Can read file contents, search codebases, and use browser automation — leverage these for context gathering
- For multi-step tasks: break into sequential prompts with clear checkpoints
- Cline shows a task list before executing — review it and adjust scope if needed

---

**GitHub Copilot**
- Write the exact function signature, docstring, or comment immediately before invoking
- Describe input types, return type, edge cases, and what the function must NOT do
- Copilot completes what it predicts, not what you intend — leave no ambiguity in the comment

---

**Bolt / v0 / Lovable / Figma Make / Google Stitch**
- Full-stack generators default to bloated boilerplate — scope it down explicitly
- Always specify: stack, version, what NOT to scaffold, clear component boundaries
- Lovable responds well to design-forward descriptions — include visual/UX intent
- v0 is Vercel-native — specify if you need non-Next.js output
- Bolt handles full-stack — be explicit about which parts are frontend vs backend vs database
- Figma Make is design-to-code native — reference your Figma component names directly
- Google Stitch is prompt-to-UI focused — describe the interface goal not the implementation. Add "match Material Design 3 guidelines" for Google-native styling
- Add "Do not add authentication, dark mode, or features not explicitly listed" to prevent feature bloat

---

**Gamma (AI presentations — text-to-deck; app + Generate API)**

Gamma turns text into **cards** (not classic slides). For volatile facts (params, defaults, credits) see [models.md](models.md). Route the deck's structure to **Template O**.

- **Pick the mode by input:** an idea / short brief → **Generate**; existing notes or markdown → **Paste in text** (mark card boundaries with `\n---\n`); a file or URL → **Import**; programmatic / batch → the **Generate API** (`POST /generations`, `cardSplit:"inputTextBreaks"`).
- **Settings are knobs, not prose — set them, don't only describe them** (then mirror the key ones in the prompt body for clarity): text **density** = the **Text Content** setting (Minimal / Concise / Detailed in the UI; `textOptions.amount` brief/medium/detailed/extensive on the API); **visuals** = **Image Source** (recommend **Stock photos**) plus concrete per-section image requests; **tone / target audience** = Advanced fields. Put these in a **setup-note** for the user, not buried in the prompt — as an `Assumed settings:` line (e.g. `10 cards · Concise density · Stock visuals · [tone]`), listing ONLY knobs the user did NOT specify (omit any already given — e.g. if they set the card count or density, drop it from the line), each overridable; don't put credit cost or the unverified "8–15 cards" figure in it.
- **Specify the card count explicitly** — don't rely on the default (API `numCards=10`). The "8–15 cards" figure is an ⚠️ unverified heuristic; state the exact N you want.
- **Anti-fabrication of data** — Gamma invents figures or inserts placeholders if you don't supply them. Provide the real data, or instruct explicit `[placeholder]`s for the user to fill. Never let it fabricate numbers.
- **Boundary honesty** — the prompt does NOT control exact layout/spacing, brand-lock (→ a saved **Theme**), or animations/transitions (→ post-generation **Gamma Agent** edits). Don't promise pixel-exact layout, brand compliance, or motion via the prompt; route those to Theme / Gamma Agent.
- Don't hardcode credit cost (~40/generation is volatile) — surface it as a note if relevant, not a fixed claim.

---

**Devin / SWE-agent**
- Fully autonomous — can browse web, run terminal, write and test code
- Very explicit starting state + target state required
- Forbidden actions list is critical — Devin will make decisions you did not intend without explicit constraints
- Scope the filesystem: "Only work within /src. Do not touch infrastructure, config, or CI files."

---

**Perplexity (Agent API — recommended default — + Sonar API / Deep Research)**

Two surfaces — see [models.md](models.md) for current model IDs. Pick by task:
- **Agent API** (`/v1/agent`, `client.responses.create`) is Perplexity's **recommended default for new apps**: an agent loop with custom tools, presets (incl. `deep-research`), output-control, and direct multi-provider model access (Perplexity Sonar + Anthropic/OpenAI/Google/xAI/NVIDIA). Reach for it when the user is building a research agent or app, wants custom tools, or wants to pick a specific underlying model.
- **Sonar API** (OpenAI-compatible chat) for direct search-grounded answers: `sonar` / `sonar-pro` for quick cited answers, `sonar-reasoning-pro` for reasoned ones, `sonar-deep-research` (128K) for exhaustive cited reports.
- **Deep research** → `sonar-deep-research`: prompt it as a research brief (Template N) with a required **Data gaps & confidence** section + the citation contract.
- **Sonar search is driven by the USER MESSAGE only** — the system prompt is not seen by search (use it for tone/grounding). Put the concrete, specific question in the user message.
- **Set domain / recency / region limits as request PARAMETERS, not prose** (`search_domain_filter` ≤20 allow/deny via `-`, `search_recency_filter` hour/day/week/month/year). "Search only on X" in prose is ignored. Cap result counts (top-N); don't ask for URLs in prose; avoid few-shot.
- **Surface defaulted search knobs** — deliver an `Assumed settings:` note line for the filters the user didn't set (e.g. `no domain filter · no recency limit`), each with how to set it (`search_domain_filter` ≤20 / `search_recency_filter` as request parameters). Never an extra question; don't assert `reasoning_effort` values (⚠️ unverified).
- Always require a closing **Data gaps & confidence** section **and inline citations** — "cite each non-obvious claim inline with a link to the retrieved source; never fabricate a citation; mark unsourced claims [uncertain]."
- `reasoning_effort` exact values are ⚠️ unverified — don't assert them. **UI:** Focus modes + Spaces (persistent instructions + files) are UI, not API. **"Search as Code" / "Deep Research in Computer"** is a product/blog concept — not a callable API feature; don't instruct it.

---

**Manus AI / multi-agent web orchestrators**
- Manus (and Perplexity's Comet/Computer surfaces) are multi-agent orchestrators — describe the end deliverable, not the steps; they decompose internally.
- **Grok `grok-4.20-multi-agent`** (xAI, beta) is a native multi-agent research model — see the Grok profile. Same brief approach (Template N); pick 4 or 16 agents; enable `web_search` + `x_search`.
- For long multi-step tasks: add verification checkpoints since each chained step compounds hallucination risk.

---

**Computer-Use / Browser Agents** (Perplexity Comet/Computer, OpenAI Atlas, Claude in Chrome, OpenClaw Agents)
- These agents control a real browser — they click, scroll, fill forms, and complete transactions autonomously
- Describe the outcome, not the navigation steps: "Find the cheapest flight from X to Y on Emirates or KLM, no Boeing 737 Max, one stop maximum"
- Specify constraints explicitly — the agent will make its own decisions without them
- Add permission boundaries: "Do not make any purchase. Research only."
- Add a stop condition for irreversible actions: "Ask me before submitting any form, completing any transaction, or sending any message"
- Comet works best with web research, comparison, and data extraction tasks
- Atlas is stronger for multi-step commerce and account management tasks

---

**Image AI — Generation** (Midjourney, GPT-image, Stable Diffusion, FLUX.2, SeeDream, Google Nano Banana, Grok Imagine)
First detect: generation from scratch or editing an existing image?

- **Midjourney (V8.1)**: Comma-separated descriptors, not prose. Subject first, then style, mood, lighting, composition. Parameters at end: `--ar 16:9 --v 8.1 --s 100`. Character/object consistency via `--oref [url] --ow 100` (Omni Reference — replaces the retired `--cref`); style via `--sref [url] --sw 100`. Also `--chaos 0–100`, negatives `--no a, b`, `--hd` for native 2K, `--raw` for stricter adherence. *Syntax: comma-descriptor list + `--` flags; no full sentences.*
- **GPT-image (`gpt-image-2`)**: OpenAI's current image model — DALL·E is retired; `gpt-image-2` is the flagship (older `gpt-image-1.5` / `gpt-image-1-mini` / `chatgpt-image-latest` are sunset-scheduled). Prose works; add "do not include text unless specified." Knobs: `size` (arbitrary, ÷16, ratio ≤3:1), `quality` low/med/high, `n`, `background` opaque/auto, `output_format`, `moderation` auto/low. Returns base64. Edit/compose via `/images/edits` with up to 16 reference images + optional mask.
- **Stable Diffusion (3.5)**: `(word:weight)` syntax for emphasis. Models `sd3.5-large` / `-large-turbo` / `-medium` / `-flash`; `cfg_scale` 1–10; negative prompt MANDATORY; `style_preset` for style bias. Edit via dedicated endpoints (inpaint / outpaint / search-and-replace / erase) and Control (structure / style-transfer). *Syntax: weighted positive + explicit negative; both required.*
- **FLUX.2** (klein fast · pro · flex typography · max +grounding · dev): natural-language OR structured/JSON prompts (subject, lighting, camera_angle, composition) + hex colors for exact color. Knobs: `guidance` 1.5–10, `steps` 1–50, `safety_tolerance` 0–5. Multi-reference editing up to 8 (10 in playground) for character/style consistency. *Syntax: prose or JSON; no SD-style weights.*
- **SeeDream (5.0)**: ByteDance unified generate+edit (ModelArk). Model e.g. `seedream-5-0-260128` / `-lite`; `size` 1K–4K; multi-image references (character / style / subject transfer), grouped outputs. Specify art style explicitly before scene content. (No documented negative-prompt parameter — steer via positive wording.)
- **Google Nano Banana 2** (`gemini-3.1-flash-image`): generalist with Google-Search grounding + character-consistency. **Lite** (`gemini-3.1-flash-lite-image`) is the fast/cheap **1K-only** tier optimized for speed — **no grounding, no character-consistency, no style refs**. **Pro** (`gemini-3-pro-image`) for the hardest jobs. **Route character-consistency / brand work to Nano Banana 2 or Pro, NOT Lite.** Edit by passing the source image with the instruction.
- **Grok Imagine** (`grok-imagine-image` fast · `grok-imagine-image-quality`): natural-language, **no negative-prompt parameter** — control via wording + references. `aspect_ratio` (incl. wide 19.5:9 / 20:9), `resolution` 1k/2k. Edit/compose via `/images/edits` with up to 3 reference images.
- **Surface defaulted knobs** — deliver an `Assumed settings:` note line for params the user didn't set (Midjourney `--ar 16:9 · --v 8.1 · --s 100`; SD `cfg 7 · steps 20–30 · negative included`; FLUX.2 `guidance 5 · steps 30`; GPT-image `quality high · size auto`; Grok / Nano Banana `resolution · aspect_ratio`), each with where to change it (prompt-tail flags / request params / Advanced settings).

---

**Image AI — Reference Editing** (when user has an existing image to modify)
Detect when: user mentions "change", "edit", "modify", "adjust" anything in an existing image, or uploads a reference.
Always instruct the user to attach the reference image to the tool first. Build the prompt around the delta ONLY — what changes, what stays the same.
Read templates.md Template J for the full reference editing template.

---

**ComfyUI**
Node-based workflow — not a single prompt box. Ask which checkpoint model is loaded before writing.
Always output two separate blocks: Positive Prompt and Negative Prompt. Never merge them.
*Syntax: two labelled blocks — `Positive:` and `Negative:` — wired to separate conditioning nodes; merging them breaks the graph.*
Read templates.md Template K for the full ComfyUI template.

---

**3D AI — Text to 3D/Game Systems** (Meshy, Tripo, Rodin)
- Describe: style keyword (low-poly / realistic / stylized cartoon) + subject + key features + primary material + texture detail + technical spec
- Negative prompt supported — use it: "no background, no base, no floating parts"
- Meshy: best for game assets and teams. Game asset prompts work best here.
- Tripo: fastest for clean topology. Rapid prototyping and concept assets.
- Rodin: highest quality for photorealistic prompts. Slower and more expensive.
- Specify intended export use: game engine (GLB/FBX), 3D printing (STL), web (GLB)
- For characters: specify A-pose or T-pose if the model will be rigged

---

**3D AI — In-Engine AI** (Unity AI, Blender AI tools)
- Unity AI (Unity 6.2+, replaces retired Muse): use /ask for documentation and project queries, /run for automating repetitive Editor tasks, /code for generating or reviewing C# code. Be precise — state exactly what needs to happen in the Editor.
- Unity AI Generators: text-to-sprite, text-to-texture, text-to-animation. Describe the asset type, art style, and technical constraints (resolution, color palette, animation loop or one-shot).
- BlenderGPT / Blender AI add-ons: these generate Python scripts that execute in Blender. Be specific about geometry, material names, and scene context. Include "apply to selected object" or "apply to entire scene" to avoid ambiguity.

---

**Video AI** (Veo 3.1, Kling 3.0, Runway Gen-4.5, Sora, LTX-2, Luma Ray, Seedance 2.0, Grok Imagine, Omni Flash)
- **Veo 3.1** (Google; `veo-3.1-generate-preview`, GA `veo-3.1-generate-001`): text- or image-to-video with synced audio; up to 3 subject reference images; clips 4/6/8s; 720p/1080p/4K (4K not on the Lite tier); first/last-frame, extend, insert/remove objects. Veo 2.0/3.0 are deprecated — migrate to 3.1.
- **Kling 3.0 / 3.0 Omni** (`kling-v3` / `kling-v3-omni`): strong realistic motion — describe body movement, camera angle, shot type. Multi-shot (`Shot 1 (3s): …`), native audio, element/voice references via Omni tags `<<<element_1>>>` / `<<<image_1>>>`. Duration 3–15s; `mode` std (720p) / pro (1080p) / 4k; `cfg_scale` 0–1. Extension via legacy `/v1/videos/video-extend`.
- **Runway** (`gen4.5` generate; `aleph2` video-to-video edit): cinematic language, reference film styles. `ratio` (`1280:720` / `720:1280` / `1104:832` / `832:1104` / `960:960` / `1584:672` / `672:1584`), `duration` 2–10s, `seed`; aleph2 takes up to 5 keyframes. ⚠️ `gen4_aleph` retired 2026-07-30 → use `aleph2`. Runway also hosts Veo 3.1 / Seedance 2.0 / Omni Flash.
- **Sora** (`sora-2` / `sora-2-pro`): ⚠️ **scheduled shutdown 2026-09-24** — flag this and prefer an alternative for new work. Direct as a film shot; camera movement critical; clips up to 20s, extend to 120s; `input_reference` first-frame; Characters API for reusable subjects.
- **LTX-2** (Lightricks): fast; native 4K up to 50fps with synced audio (≤10s). Write a concise chronological shot description (<200 words). Image-to-video, keyframe conditioning, extend, video-to-video; LoRA for style.
- **Luma Ray** (Dream Machine; `ray-3.2`): cinematic — reference lens, lighting, color grading. `type` video / video_edit / video_reframe; resolution 360p–1080p; 5s or 10s; up to 64 keyframes; edit controls (depth / pose `precise`/`coarse` / trajectory).
- **Seedance 2.0** (ByteDance; `dreamina-seedance-2-0-260128`, plus Fast / Mini variants): multimodal references (image + video + audio, addressed as "Image 1"), native generated audio, first/last-frame, extend. `ratio`, `duration` 4–15s, `resolution` 480p/720p/1080p/4K (1080p not on Fast/Mini; 4K only on standard).
- **Omni Flash** (Google; `gemini-omni-flash-preview`, Interactions API): conversational video generation + editing — iterate in natural language, keeping unchanged parts. Use single-scene cues ("In a single continuous shot"), role tags `<FIRST_FRAME>` / `<IMAGE_REF_n>`, timecodes `[0-3s] …`; for edits, short direct instructions + "Keep everything else the same" (long re-descriptions cause drift).
- **Grok Imagine video** (`grok-imagine-video-1.5` / `grok-imagine-video`): five modes — text-to-video, image-to-video (source = first frame), reference-to-video (`grok-imagine-video`, refs as `<IMAGE_n>`, no first-frame lock), edit, extend. `duration` ≤15s, `resolution` 480p/720p/1080p (1080p only on `-1.5` for image-to-video). No negative-prompt parameter.
- **Surface defaulted knobs** — deliver an `Assumed settings:` note line for video params the user didn't set (duration, resolution, aspect ratio, `mode`/quality tier), each with where to change it.

---

**Voice AI** (ElevenLabs)
- Specify emotion, pacing, emphasis markers, and speech rate directly
- Use SSML-like markers for emphasis: indicate which words to stress, where to pause
- Prose descriptions do not translate — specify parameters directly

---

**Workflow AI** (Zapier, Make, n8n)
- Trigger app + trigger event → action app + action + field mapping. Step by step.
- Auth requirements noted explicitly — "assumes [app] is already connected"
- For multi-step workflows: number each step and specify what data passes between steps

---

**Prompt Decompiler Mode**
Detect when: user pastes an existing prompt and wants to break it down, adapt it for a different tool, simplify it, or split it.
This is a distinct task from building from scratch.
Read templates.md Template L for the full Prompt Decompiler template.

---

**Unknown tool:**
Identify the closest matching tool category from context. If genuinely unclear, ask: "Which tool is this for?" — then route accordingly. If no tool is found listed, connect to the closest related tool.
Then build using the closest matching category.
