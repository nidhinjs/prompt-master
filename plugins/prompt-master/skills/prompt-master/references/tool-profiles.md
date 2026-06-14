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
| **Gemini 2.x / 3 Pro** | Multimodal, large-document, Google ecosystem | User is on Google AI Studio, Vertex, or Gemini |
| **Qwen 2.5 / Qwen3** | Structured output, JSON, instruct; Qwen3 adds thinking mode | User names Qwen or an Alibaba model |
| **Ollama** | Local model deployment (Llama, Mistral, Qwen, CodeLlama …) | User running models locally via Ollama |
| **Llama / Mistral / open-weight** | General open-weight; weaker instruction following | User names a Llama or Mistral variant |
| **DeepSeek-R1** | Reasoning-native; outputs `<think>` blocks | User names DeepSeek or R1 |
| **MiniMax M3 / M2.7** | OpenAI-compatible API; long context; fast variant | User names MiniMax |
| **Claude Code** | Agentic file editing, terminal commands, multi-step coding | User is inside Claude Code or building a Claude Code prompt |
| **Cortex Code** | Snowflake-native agentic coding + SQL + Streamlit | User names Cortex Code or Snowflake Cortex |
| **Antigravity** | Google agent-first IDE; Gemini 3 Pro; browser automation | User names Antigravity or Google's agentic IDE |
| **Cursor / Windsurf** | Agentic IDE file editing with path-scoped prompts | User is in Cursor or Windsurf |
| **Cline** | VS Code agentic extension; autonomous edits + terminal | User is using Cline (Claude Dev) |
| **GitHub Copilot** | Inline code completion from comments/signatures | User is completing code inside Copilot |
| **Bolt / v0 / Lovable / Figma Make / Google Stitch** | Full-stack or UI generators | User names a no-code/low-code generator |
| **Devin / SWE-agent** | Fully autonomous coding agent with web + terminal access | User names Devin or SWE-agent |
| **Perplexity / Manus AI** | Research, orchestration, multi-agent web research | User names Perplexity or Manus |
| **Computer-Use / Browser agents** | Real-browser automation (click, scroll, fill, transact) | User names Comet, Atlas, Claude in Chrome, or a browser agent |
| **Image AI — Generation** | Text-to-image (Midjourney, DALL-E 3, SD, Flux, SeeDream) | User wants to generate an image |
| **Image AI — Reference Editing** | Edit or modify an existing image | User mentions "change/edit/modify" an image or uploads a reference |
| **ComfyUI** | Node-based image workflow; separate positive/negative blocks | User is using ComfyUI |
| **3D AI** | Text-to-3D / game asset generation (Meshy, Tripo, Rodin) | User wants 3D output |
| **3D AI — In-Engine** | Unity AI, Blender AI add-ons | User is working inside Unity or Blender |
| **Video AI** | Text-to-video (Sora, Runway, Kling, LTX, Dream Machine) | User wants video output |
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

**Gemini 2.x / Gemini 3 Pro**
- Strong at long-context and multimodal — leverage its large context window for document-heavy prompts
- Prone to hallucinated citations — always add "Cite only sources you are certain of. If uncertain, say [uncertain]."
- Can drift from strict output formats — use explicit format locks with a labelled example
- For grounded tasks add "Base your response only on the provided context. Do not extrapolate."

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

**DeepSeek-R1**
- Reasoning-native like o3 — do NOT add CoT instructions
- Short clean instructions only — state the goal and desired output format
- Outputs reasoning in `<think>` tags by default — add "Output only the final answer, no reasoning." if needed

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

**Devin / SWE-agent**
- Fully autonomous — can browse web, run terminal, write and test code
- Very explicit starting state + target state required
- Forbidden actions list is critical — Devin will make decisions you did not intend without explicit constraints
- Scope the filesystem: "Only work within /src. Do not touch infrastructure, config, or CI files."

---

**Research / Orchestration AI** (Perplexity, Manus AI)
- **Perplexity Deep Research** = agentic multi-step → cited report (`sonar-deep-research`, 128K). Prompt it as a research brief — see Template N.
- **Sonar search is driven by the USER MESSAGE only** — the system prompt is not seen by search (use it for tone/grounding). Put the specific, descriptive question in the user message.
- **Set domain/recency/region limits as request PARAMETERS, not prose** (`search_domain_filter` ≤20 allow/deny via `-`, `search_recency_filter` hour/day/week/month/year). "Search only on X" in prose is ignored. Cap result counts; don't ask for URLs in prose; avoid few-shot. For new apps, Perplexity recommends the **Agent API**.
- Always require a closing **Data gaps & confidence** section (what's missing, confidence per claim, data freshness). UI Deep Research: pick Focus in the selector; use Spaces (persistent prompt + files) for iterative work.
- Manus and Perplexity Computer are multi-agent orchestrators — describe the end deliverable, not the steps. They decompose internally.
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

**Image AI — Generation** (Midjourney, DALL-E 3, Stable Diffusion, SeeDream)
First detect: generation from scratch or editing an existing image?

- **Midjourney**: Comma-separated descriptors, not prose. Subject first, then style, mood, lighting, composition. Parameters at end: `--ar 16:9 --v 6 --chaos 0`. Negative prompts via `--no [unwanted elements]`. *Syntax: comma-descriptor list + `--ar` / `--v` / `--chaos` flags; no full sentences.*
- **DALL-E 3**: Prose description works. Add "do not include text in the image unless specified." Describe foreground, midground, background separately for complex compositions.
- **Stable Diffusion**: `(word:weight)` syntax for emphasis. CFG 7-12. Negative prompt is MANDATORY — omitting it degrades quality. Steps 20-30 for drafts, 40-50 for finals. *Syntax: `(word:weight)` positive block + explicit negative block; both required.*
- **Flux**: Responds well to natural language — write a clear, concise description as you would explain the image to a person; no special syntax or weight notation needed. *Syntax: natural language prose; avoid SD-style parenthetical weights.*
- **SeeDream**: Strong at artistic and stylized generation. Specify art style explicitly (anime, cinematic, painterly) before scene content. Mood and atmosphere descriptors work well. Negative prompt recommended.

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

**Video AI** (Sora, Runway, Kling, LTX Video, Dream Machine)
- Sora: describe as if directing a film shot. Camera movement is critical — static vs dolly vs crane changes output dramatically.
- Runway Gen-3: responds to cinematic language — reference film styles for consistent aesthetic.
- Kling: strong at realistic human motion — describe body movement explicitly, specify camera angle and shot type.
- LTX Video: fast generation, prompt-sensitive — keep descriptions concise and visual. Specify resolution and motion intensity explicitly.
- Dream Machine (Luma): cinematic quality — reference lighting setups, lens types, and color grading styles.

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
