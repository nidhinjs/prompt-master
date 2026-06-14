# Prompt Templates Reference

Full template library for Prompt Master. Read the relevant template when the user's task type matches. Do not load all templates at once — only the one you need.

## Table of Contents

| Template | Best For |
|----------|----------|
| [Canonical Prompt Structure](#canonical-prompt-structure-default-skeleton) | Default skeleton for any text-LLM prompt (Claude, GPT, Gemini, local) |
| [A — RTF](#template-a--rtf) | Simple one-shot tasks |
| [B — CO-STAR](#template-b--co-star) | Professional documents, business writing |
| [C — RISEN](#template-c--risen) | Complex multi-step projects |
| [D — CRISPE](#template-d--crispe) | Creative work, brand voice |
| [E — Chain of Thought](#template-e--chain-of-thought) | Logic, math, analysis, debugging |
| [F — Few-Shot](#template-f--few-shot) | Consistent structured output, pattern replication |
| [G — File-Scope](#template-g--file-scope) | Cursor, Windsurf, Copilot — code editing AI |
| [H — ReAct + Stop Conditions](#template-h--react--stop-conditions) | Claude Code, Devin — autonomous agents |
| [I — Visual Descriptor](#template-i--visual-descriptor) | Midjourney, DALL-E, Stable Diffusion, Sora |
| [J — Reference Image Editing](#template-j--reference-image-editing) | Editing an existing image with a reference |
| [K — ComfyUI](#template-k--comfyui) | ComfyUI node-based image workflows |
| [L — Prompt Decompiler](#template-l--prompt-decompiler) | Breaking down, adapting, or splitting existing prompts |
| [M — Opus 4.7 / 4.8 Task Brief](#template-m--opus-4.7--4.8-task-brief) | Complex, multi-step, or agentic task on Claude Opus 4.7 or 4.8 |
| [N — Research Brief](#template-n--research-brief) | Deep-research / cited-report tools (Perplexity Deep Research, GPT/Gemini Deep Research, Sonar) |

---

## Canonical Prompt Structure (default skeleton)

*The default ordering for a rewritten or built-from-scratch prompt targeting a **text LLM** (Claude, GPT, Gemini, local / open-weight, reasoning models). NOT for image / video / voice / workflow tools — those follow their own profiles. Include only the parts the task needs; drop the rest. Order matters: critical content lives early, where attention is strongest.*

1. **Role** — one line, only if it calibrates depth/vocabulary. Skip for trivial tasks.
2. **Outcome + Success criteria** — what "done" looks like, stated up front. The single most load-bearing part.
3. **Context + Motivation** — why the task matters / how the output is used. Only when it changes the answer.
4. **Structured Input** — wrap supplied material in XML tags (`<context>`, `<data>`, `<code>`) so the model separates instructions from data (Claude especially).
5. **Positive Instructions + Scope** — say what to do (not only what to avoid); bound the scope; strongest signal words (MUST / NEVER).
6. **Conditional CoT / Few-shot** — add step-by-step ONLY for non-reasoning-native models on logic tasks; add 2–5 examples ONLY when the format is easier shown than told. Never on reasoning-native models.
7. **Strict Output Contract** — exact format, length, and shape; if structured (JSON / table / code), make it unambiguous and parseable. Goes last so it is the freshest instruction before generation.

Model-aware caveats override the skeleton: GPT-5.5 / Fable 5 → outcome-first, drop process scaffolding; reasoning-native models → omit the CoT in step 6. See the tool profile.

---

## Template A — RTF

*Role, Task, Format. Use for fast one-shot tasks where the request is clear and simple.*

```
Role: [One sentence defining who the AI is]
Task: [Precise verb + what to produce]
Format: [Exact output format and length]
```

**Example:**
```
Role: You are a senior technical writer.
Task: Write a one-paragraph description of what a REST API is.
Format: Plain prose, 3 sentences maximum, no jargon, suitable for a non-technical audience.
```

---

## Template B — CO-STAR

*Context, Objective, Style, Tone, Audience, Response. Use for professional documents, business writing, reports, and marketing content where full context control matters.*

```
Context: [Background the AI needs to understand the situation]
Objective: [Exact goal — what success looks like]
Style: [Writing style: formal / conversational / technical / narrative]
Tone: [Emotional register: authoritative / empathetic / urgent / neutral]
Audience: [Who reads this — their knowledge level and expectations]
Response: [Format, length, and structure of the output]
```

**Example:**
```
Context: I am a founder pitching a B2B SaaS tool that automates expense reporting for mid-size companies.
Objective: Write a cold email that gets a reply from a CFO.
Style: Direct and conversational, not salesy.
Tone: Confident but not pushy.
Audience: CFO at a 200-person company, busy, skeptical of vendor emails.
Response: 5 sentences max. Subject line included. No bullet points.
```

---

## Template C — RISEN

*Role, Instructions, Steps, End Goal, Narrowing. Use for complex projects, multi-step tasks, and any output that requires a clear sequence of actions.*

```
Role: [Expert identity the AI should adopt]
Instructions: [Overall task in plain terms]
Steps:
  1. [First action]
  2. [Second action]
  3. [Continue as needed]
End Goal: [What the final output must achieve]
Narrowing: [Constraints, scope limits, what to exclude]
```

**Example:**
```
Role: You are a product manager with 10 years of experience in mobile apps.
Instructions: Write a product requirements document for a habit tracking feature.
Steps:
  1. Define the problem statement in one paragraph
  2. List user stories in the format "As a [user], I want [goal] so that [reason]"
  3. Define acceptance criteria for each story
  4. List out-of-scope items explicitly
End Goal: A PRD that an engineering team can begin sprint planning from immediately.
Narrowing: No technical implementation details. No wireframes. Under 600 words total.
```

---

## Template D — CRISPE

*Capacity, Role, Insight, Statement, Personality, Experiment. Use for creative work, brand voice writing, and any task where personality, tone, and iteration matter.*

```
Capacity: [What capability or expertise the AI should have]
Role: [Specific persona to adopt]
Insight: [Key background insight that shapes the response]
Statement: [The core task or question]
Personality: [Tone and style — witty / authoritative / casual / sharp]
Experiment: [Request variants or alternatives to explore]
```

**Example:**
```
Capacity: Expert copywriter specializing in SaaS product launches.
Role: Brand voice for a productivity tool aimed at developers.
Insight: Developers hate marketing speak and respond to honesty and specificity.
Statement: Write the hero headline and sub-headline for the landing page.
Personality: Sharp, dry, confident — no adjectives, no exclamation marks.
Experiment: Give 3 variants ranging from minimal to bold.
```

---

## Template E — Chain of Thought

*Use for logic-heavy tasks, math, debugging, and multi-factor analysis where the AI needs to reason carefully before committing to an answer.*

**Important:** Only use CoT for standard reasoning models (Claude, GPT-5.x, Gemini). Do NOT add CoT instructions to o3, o4-mini, Grok grok-4.3, or Claude extended thinking — they reason internally and CoT instructions degrade their output.

```
[Task statement]

Before answering, think through this carefully:
<thinking>
1. What is the actual problem being asked?
2. What constraints must the solution respect?
3. What are the possible approaches?
4. Which approach is best and why?
</thinking>

Give your final answer in <answer> tags only.
```

**When to use:**
- Debugging where the cause is not obvious
- Comparing two technical approaches
- Any math or calculation
- Analysis where a wrong first impression is likely

**When NOT to use:**
- o3 / o4-mini / Grok grok-4.3 / reasoning models (they think internally — adding CoT hurts)
- Simple tasks where the answer is clear (unnecessary overhead)
- Creative tasks (CoT can kill natural voice)

---

## Template F — Few-Shot

*Use when the output format is easier to show than describe. Examples outperform written instructions for format-sensitive tasks every time.*

```
[Task instruction]

Here are examples of the exact format needed:

<examples>
  <example>
    <input>[example input 1]</input>
    <output>[example output 1]</output>
  </example>
  <example>
    <input>[example input 2]</input>
    <output>[example output 2]</output>
  </example>
</examples>

Now apply this exact pattern to: [actual input]
```

**Rules:**
- 2 to 5 examples is the sweet spot. More rarely helps and wastes tokens.
- Examples must include edge cases, not just easy cases.
- Use XML tags to wrap examples — Claude parses XML reliably.
- If you have been re-prompting for the same formatting correction twice, switch to few-shot instead of rewriting instructions.

---

## Template G — File-Scope

*Use for Cursor, Windsurf, GitHub Copilot, and any AI that edits code inside a codebase. The most common failure mode here is editing the wrong file or breaking existing logic — this template prevents both.*

```
File: [exact/path/to/file.ext]
Function/Component: [exact name]

Current Behavior:
[What this code does right now — be specific]

Desired Change:
[What it should do after the edit — be specific]

Scope:
Only modify [function / component / section].
Do NOT touch: [list everything to leave unchanged]

Constraints:
- Language/framework: [specify version]
- Do not add dependencies not in [package.json / requirements.txt]
- Preserve existing [type signatures / API contracts / variable names]

Done When:
[Exact condition that confirms the change worked correctly]
```

---

## Template H — ReAct + Stop Conditions

*Use for Claude Code, Devin, AutoGPT, and any AI that takes autonomous actions. Runaway loops and scope explosion are the biggest credit killers in agentic workflows — stop conditions are not optional.*

```
Objective:
[Single, unambiguous goal in one sentence]

Starting State:
[Current file structure / codebase state / environment]

Target State:
[What should exist when the agent is done]

Allowed Actions:
- [Specific action the agent may take]
- Install only packages listed in [requirements.txt / package.json]

Forbidden Actions:
- Do NOT modify files outside [directory/scope]
- Do NOT run the dev server or deploy
- Do NOT push to git
- Do NOT delete files without showing a diff first
- Do NOT make architecture decisions without human approval

Stop Conditions:
Pause and ask for human review when:
- A file would be permanently deleted
- A new external service or API needs to be integrated
- Two valid implementation paths exist and the choice affects architecture
- An error cannot be resolved in 2 attempts
- The task requires changes outside the stated scope

Checkpoints:
After each major step, output: ✅ [what was completed]
At the end, output a full summary of every file changed.
```

---

## Template I — Visual Descriptor

*Use for Midjourney, DALL-E 3, Stable Diffusion, Sora, Runway, and any image or video generation tool.*

*5-layer skeleton — build outward from the subject. Drop layers the task doesn't need.*

```
1. Subject: [main subject + action/pose — specific, not vague]
2. Environment & Setting: [where the scene takes place, foreground/background, props]
3. Lighting: [golden hour / studio / neon / overcast / candlelight + direction and quality]
4. Technical: [camera + lens (e.g. 85mm), depth of field, exposure, shot type, aspect ratio]
5. Style & Aesthetic: [photorealistic / cinematic / anime / oil painting; mood; color palette; artist/film reference]

Negative prompt (platforms that support it): [blurry, watermark, extra fingers, distortion, low quality]
```

**Tool-specific syntax:**
- **Midjourney**: Comma-separated descriptors, not prose. Add `--ar`, `--style`, `--v 6` at the end.
- **Stable Diffusion**: Use `(word:1.3)` weight syntax. CFG scale 7 to 12. Negative prompt is mandatory.
- **DALL-E 3**: Prose works well. Add "do not include any text in the image" unless text is needed.
- **Sora / video**: Add camera movement (slow dolly, static shot, crane up), duration in seconds, and cut style.

---

## Template J — Reference Image Editing

*Use when the user has an existing image they want to modify. Completely different from generation — never describe the whole scene from scratch, only describe the change.*

**Before writing the prompt, always tell the user:**
"Attach your reference image to [tool name] before sending this prompt."

**Detect the tool's editing capability:**
- Midjourney: use `--cref [image URL]` for character reference or `--sref` for style reference
- DALL-E 3: use the Edit endpoint, not the Generate endpoint. User must be in ChatGPT with image editing enabled
- Stable Diffusion: use img2img mode, not txt2img. Set denoising strength 0.3-0.6 to preserve the original

```
Reference image: [attached / URL]
What to keep exactly the same: [list everything that must not change]
What to change: [specific edit only — be precise]
How much to change: [subtle / moderate / significant]
Style consistency: maintain the exact style, lighting, and mood of the reference
Negative prompt: [what to avoid introducing]
```

**Example:**
```
Reference image: [attached portrait photo]
What to keep exactly the same: face, hair, clothing, background, lighting
What to change: head angle — rotate from facing left to facing straight forward
How much to change: subtle, preserve all facial features exactly
Style consistency: maintain photorealistic style, same lighting direction
Negative prompt: no new elements, no style changes, no background changes
```

---

## Template K — ComfyUI

*Use for ComfyUI node-based workflows. Always output Positive and Negative prompts as separate blocks. Ask for the checkpoint model before writing — syntax and token limits differ per model.*

**Ask first if not stated:**
"Which checkpoint model are you using? (SD 1.5, SDXL, Flux, or other)"

**Model-specific notes:**
- SD 1.5: shorter prompts work better, under 75 tokens per block, use (word:weight) syntax
- SDXL: handles longer prompts, supports more natural language alongside weighted syntax
- Flux: natural language works well, less reliance on weighted syntax, very responsive to style descriptions

```
POSITIVE PROMPT:
[subject], [style], [mood], [lighting], [composition], [quality boosters: highly detailed, sharp focus, 8k]

NEGATIVE PROMPT:
[what to exclude: blurry, low quality, watermark, extra limbs, bad anatomy, distorted, oversaturated]

CHECKPOINT: [model name]
SAMPLER: Euler a (recommended starting point)
CFG SCALE: 7 (increase for stricter prompt adherence)
STEPS: 20-30
RESOLUTION: [width x height — must be divisible by 64]
```

---

## Template L — Prompt Decompiler

*Use when the user pastes an existing prompt and wants to break it down, adapt it for a different tool, simplify it, or understand its structure. This is analysis and adaptation, not building from scratch.*

**Detect which Decompiler task is needed:**
- **Break down** — explain what each part of the prompt does
- **Adapt** — rewrite for a different tool while preserving intent
- **Simplify** — remove redundancy and tighten without losing meaning
- **Split** — divide a complex one-shot prompt into a cleaner sequence

**For Adapt tasks, always ask:**
"What tool is the original prompt from, and what tool are you adapting it for?"

**Break down output format:**
```
Original prompt: [paste]

Structure analysis:
- Role/Identity: [what role is assigned and why]
- Task: [what action is being requested]
- Constraints: [what limits are set]
- Format: [what output shape is expected]
- Weaknesses: [what is missing or could cause wrong output]

Recommended fix: [rewritten version with gaps filled]
```

**Adapt output format:**
```
Original ([source tool]): [original prompt]

Adapted for [target tool]:
[rewritten prompt using target tool syntax and best practices]

Key changes made:
- [change 1 and why]
- [change 2 and why]
```

**Split output format:**
```
Original prompt: [paste]

This prompt is doing [N] things. Split into [N] sequential prompts:

Prompt 1 — [what it handles]:
[prompt block]

Prompt 2 — [what it handles]:
[prompt block]

Run these in order. Each output feeds the next.
```
---

## Template M — Opus 4.7 / 4.8 Task Brief

*Use for any complex, multi-step, or agentic task on Claude Opus 4.7 or 4.8 — claude.ai, API, or Claude Code. Both read prompts literally and produce narrow output when context is missing. This template front-loads everything so the first turn is the only turn. (Opus 4.8 is the current Claude Code default; Fable 5 is suspended since 2026-06-12 — see models.md.)*

```
## Objective
[What needs to be built, fixed, or produced — one clear sentence. Add WHY if it affects approach.]

## Context
[What exists now — relevant files, current behavior, stack already in place, what was tried and failed]

## Target State
[What done looks like — specific files changed, behavior produced, tests passing. Binary where possible.]

## Scope
- Work only in: [specific files and directories]
- Do NOT touch: [forbidden files — .env, package-lock.json, configs, anything outside scope]

## Constraints
- [Stack version, naming conventions, no new dependencies without asking]
- Only make changes directly requested. Do not add features, abstractions, or files beyond what was asked.

## Acceptance Criteria
- [ ] [Binary check 1]
- [ ] [Binary check 2]
- [ ] [Binary check 3]

## Stop Conditions
Stop and ask before:
- Deleting any file
- Adding any dependency
- Modifying database schema or migrations
- Touching anything outside Scope

## Progress
After each completed step: ✅ [what was done] — [file(s) affected]
```

**Thinking depth** — add only when needed, delete otherwise:
- Hard multi-step task: `"Think carefully and step-by-step before starting."`
- Simple targeted change: `"Prioritize responding quickly. This is a scoped change."`
- Default: say nothing — adaptive thinking calibrates itself.

**Claude Code only — add Session Strategy block when relevant.** This is setup advice for the human, not an instruction to the agent — put it in the note below the prompt, not inside the copyable prompt block:
```
## Session Strategy
[Pick one:]
- New session — unrelated to prior context, start fresh
- Continue — prior context still needed
- Subagent — spin off for [file-heavy research / verification] so intermediate output stays out of main context
- Compact first — run /compact [focus on X] then begin
```

**Refactor / migration safety net — add for any behavior-preserving change:**
- Don't assume tests exist. Confirm or establish characterization tests BEFORE changing behavior — "0 failed" with 0 tests is false confidence.
- Distinguish the invariant from the plumbing: behavioral assertions must stay green, but test wiring (mocks, imports, fixtures) may legitimately change. Don't pair "all tests pass unchanged" with a migration — it contradicts itself.
- Security-sensitive target (auth, crypto, payments)? Add a security-equivalence invariant: signing algorithm, hash cost, constant-time comparison, and token/secret format must not weaken.
- Two operations bundled (refactor + migrate)? Prefer sequencing — land the refactor green, then migrate — so a regression is bisectable.

**When to use:** Opus 4.7 or 4.8 on any surface — claude.ai, API, Claude Code — when the task is complex, multi-file, ambiguous, or agentic. Not needed for simple one-shot tasks.

---

## Template N — Research Brief

*Use for deep-research / multi-source cited-report tools (Perplexity Deep Research, GPT/Gemini Deep Research, Sonar API, Grok `grok-4.20-multi-agent`). Prompt the research as an ASSIGNMENT, not a question.*

```
Role + Goal: [expert role + what decision this report informs]
Specific aspects: [enumerate the exact angles — market size, key players, regulatory, risks… NOT "about X"]
Scope: [time horizon, geography, exclusions, data types]
Output structure: [named sections; tables where comparative; citation style; length]
  - Cap lists (top-N, not "all"); do NOT ask for URLs in prose.
Source priorities + freshness: [primary vs secondary; date horizon]
Data gaps & confidence: [REQUIRED closing section — what could not be found, confidence per key claim, and the date/freshness of the data]
```

**Tool-aware (official Perplexity Sonar guidance):**
- **Sonar / API:** search is driven by the **user message only** — the system prompt is not seen by search (use it for tone/grounding). Put the concrete, specific question in the user message. Set hard constraints as **request parameters, not prose**: `search_domain_filter` (≤20 domains, allow / deny with `-`), `search_recency_filter` (hour/day/week/month/year). "Search only on X" in prose is ignored. Avoid few-shot. For new apps Perplexity recommends the **Agent API**.
- **UI Deep Research:** pick the Focus/source filter in the selector before running; for iterative work use a Space (persistent system prompt + curated sources + files) with in-thread follow-ups.
- **Grok (xAI):** route deep research to `grok-4.20-multi-agent` (beta) and enable `web_search` + `x_search`. Choose agent count by depth — 4 (focused) or 16 (thorough), via `agent_count` or `reasoning.effort` (low/medium=4, high/xhigh=16). Set source limits as tool **parameters** (`allowed_x_handles`/`allowed_domains`, `from_date`/`to_date`), not prose. Grok has no realtime knowledge without these search tools enabled.

---

## Agentic Prompt Fragments

*Opt-in drop-ins for prompts that drive a **real multi-agent / tool-using runtime** (orchestrator + sub-agents, an eval loop, a review gate). Add ONLY when the user explicitly asks for an agentic prompt — never as a default. Each fragment is a clause to paste into the relevant section of a canonical text-LLM prompt; do not restate that skeleton here. Numeric ceilings below are illustrative heuristics for keeping fan-out/chains/roles tight, not measured limits.*

**When to orchestrate (default: single loop).** Keep one linear agent loop until it provably fails; do NOT add orchestration for simple edits, small read-only questions, or ordinary drafting. Reach for orchestration only when the task hits one or more: (1) context too large/noisy for one window; (2) decomposable into independent packets; (3) needs explicit budget control; (4) high-impact, needs review before execution; (5) likely to produce conflicting findings; (6) needs broad coverage across many files/records/systems; (7) verification-heavy.

**Situation → pattern**

| Situation | Pattern |
|---|---|
| Bounded task, fits one window | **Single loop** — no orchestration |
| Independent, parallel, read-only packets | **Fan-out + synthesizer** — define the merge rule up front |
| Dependent, ordered stages | **Short chain + handoff block** |
| Quality-critical, clear criteria | **Evaluator–optimizer** — independent verifier |
| Long autonomous build, many steps | **Orchestrator-as-decomposer + task ledger** |

**#19 Orchestrator-as-decomposer**
```
Your role is decomposition and delegation, not execution. Break the goal into
sub-tasks, assign each to a sub-agent, and integrate their results — do not do
the sub-task work yourself. Keep fan-out tight (≈7 parallel sub-agents max as a
working heuristic). Output a task ledger:
| sub-task | delegated to | status | result summary |
```

**#20/#21 Loop-termination contract** *(runtime behavior — a real agent acting across genuine separate passes, NOT "internally try 3 times," and NOT for our single-pass self-critique)*
```
Retry cap: after 3 failed attempts at a sub-task (each a real, separate
execution pass with tool calls), stop retrying and escalate. Escalation menu —
pick one: reassign (different agent/approach) · decompose (split into smaller
sub-tasks) · accept-with-note (ship partial, flag the gap) · defer (park it,
continue the rest).
```
Evaluator–optimizer loop only:
```
Generator produces; a separate evaluator judges against criteria the generator
was NOT given verbatim. Exit on: criteria met, OR score plateau (no meaningful
gain across 2 successive rounds — as a working heuristic), OR retry cap hit.
```

**#22/#28 Handoff + degraded output**
```
Handoff block (one agent → next):
- Context: [state the next agent needs]
- Deliverable: [exact artifact passed on]
- Acceptance criteria: [what makes it usable downstream]
- Evidence required: [proof the deliverable meets criteria]
- Handoff to: [next agent / role]

Degraded output: if you cannot finish, emit a structured partial result with
explicit gaps (done / blocked / unknown) — do not refuse, and do not return
prose in place of the contracted format.
```

**#27 Sub-agent role**
```
Role: [narrow identity]
Responsible for: [the one job]
NOT responsible for: [explicit exclusions — out-of-scope work to hand back, not attempt]
Failure behavior: on error or out-of-scope input, [escalate / hand back / emit degraded output] — do not improvise outside the role.
```
Keep each role under ≈1500 tokens of system prompt (heuristic) so it stays sharp.

**#29 HITL gates** — choose the lightest that fits; over-escalation trains the human to rubber-stamp and defeats the gate:
- **Blocking** — agent pauses, cannot proceed without approval (irreversible/destructive actions).
- **Advisory** — agent proceeds but flags for review (reversible, moderate risk).
- **Sampling** — human spot-checks a fraction, not every action (high-volume, low-risk).

**#24 Evidence-required review clause**
```
For each verdict, include an evidence field citing the exact output line / file:line
/ artifact that justifies it. A verdict without a citation is not accepted.
| item | verdict | evidence (cite exact source) |
```

**#18 Effort-tier chooser** — match scaffolding to scope; this is a chooser, NOT a mandatory ladder (consistent with conditional, not always-tier):
- **Single-shot** — one pass, no scaffolding. Default for bounded tasks.
- **Multi-step** — sequenced steps + checkpoints. Use when sub-tasks have ordering/dependencies.
- **Long-horizon** — orchestrator + sub-agents + handoffs + loop contract. Use only when scope genuinely needs delegation.

**Sourced guardrails** *(Anthropic "Building effective agents" / context-engineering / long-running harnesses; OpenAI harness-engineering & guardrails; OWASP AI Agent Security — see docs/sources.md):*
- **Packet contract — every delegated unit has all 7:** single purpose · explicit inputs · narrow tool permissions · result schema · timeout + budget · evidence requirement · no hidden cross-packet dependency.
- **Worker context isolation:** give a sub-agent only `{objective, inputs, allowed tools, output schema, trust boundaries, budget, forbidden actions, evidence rules}` — NOT the full parent history, every tool, or secrets. Pass a compact result back, not raw reasoning.
- **Independent verification (choose by cost/value):** the verifier gets findings + source access, NOT the worker's reasoning. Pick one — independent review · sampling (a subset) · cross-check (two independent outputs) · replay (deterministic rerun) · tests (mechanical).
- **Budgets are enforced, not just logged:** declare and hard-stop on `max_packets · max_parallel_workers · max_model_turns · max_tool_calls · max_wall_time · max_cost`.
- **Parallelize only independent, read-only, concurrency-safe calls** (search, read, classify, summarize). Serialize writes, sends, deletes, payments, and permission changes.
- **Cache-aware ordering** (cuts cost on a strong-orchestrator + cheap-worker split): stable prefix first (tool defs, static instructions), volatile content last; append-only history; deterministic tool/JSON ordering; compact only at explicit boundaries.
