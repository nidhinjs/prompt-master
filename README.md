![](https://i.postimg.cc/kG03s7tk/prompt-banner.png)

<br/>

**English** · [Русский](README.ru.md)

**What:** A prompt-authoring skill originally built for Claude, now hosted by Claude and Codex from one canonical runtime. It writes accurate, paste-ready prompts for any AI tool and routes to the model or platform you name.
**Why:** Every vague prompt is a wasted credit. Prompt Master extracts intent, picks the right architecture, and strips every word that doesn't change the output.
**How to start:** Choose one host-specific installation below, then say: `Write me a prompt for [tool] to [task]` — or paste a bad prompt and ask to fix it.

**Works with:** hosted and local text models, reasoning systems, coding agents and IDEs, research/browser agents, presentation and workflow builders, image/video/voice/3D tools — and unknown tools through a capability-safe fallback. Current provider/model selection comes from the validated facts registry, not this README.

---

## 🚀 Installation

### Codex — repository mode

Use this mode while working in a clone of the repository:

```bash
git clone https://github.com/azagreev/prompt-master-za.git
cd prompt-master-za
codex
```

Codex discovers `.agents/skills/prompt-master`, which points to the canonical skill under `plugins/prompt-master/skills/prompt-master`. Invoke it explicitly with `$prompt-master`, or ask naturally for a prompt and let the skill description trigger it implicitly. Skill file changes are detected automatically; if the selector is missing, restart Codex.

### Codex — installed-plugin mode

Use the Codex **Plugins** screen to add the GitHub marketplace `azagreev/prompt-master-za` and install **prompt-master**, or use the verified Codex CLI flow:

```bash
codex plugin marketplace add azagreev/prompt-master-za
codex plugin add prompt-master@prompt-master
codex plugin list
```

These commands are verified against `codex-cli 0.144.1`. There is no supported Codex ZIP installation path for this project.

> **Choose repository mode or installed-plugin mode, not both.** Codex shows same-named skills as separate selectors rather than merging them. To keep repository mode, remove the installed copy with `codex plugin remove prompt-master@prompt-master`. To keep the installed plugin while working in this repository, disable the repository entry in `~/.codex/config.toml`:
>
> ```toml
> [[skills.config]]
> path = "/absolute/path/to/prompt-master-za/.agents/skills/prompt-master/SKILL.md"
> enabled = false
> ```

Installed plugins may include a `UserPromptSubmit` hook. Codex asks you to review/trust a non-managed hook before running it. Prompt Master's hook only adds advisory context for multi-agent prompt requests; declining or skipping it does not disable the core skill.

### Claude Code / Cowork — plugin marketplace

```bash
# 1. Add the marketplace from GitHub
/plugin marketplace add azagreev/prompt-master-za

# 2. Install the plugin
/plugin install prompt-master@prompt-master
```

In Cowork: **Customize → Browse plugins → Personal → + → Add marketplace from GitHub →** `azagreev/prompt-master-za` → install **prompt-master**.

### Claude.ai — browser ZIP

1. Grab the ready bundle `prompt-master-<version>.zip` attached to the [latest Release](https://github.com/azagreev/prompt-master-za/releases/latest) — or build it from a clone with `./scripts/package-skill.ps1` (zips `skills/prompt-master/` with `SKILL.md` + `references/` at the archive root).
2. **claude.ai → Customize → Skills → Upload a Skill.**

### Claude Code — manual skills directory

```bash
git clone https://github.com/azagreev/prompt-master-za.git
cp -r prompt-master-za/plugins/prompt-master/skills/prompt-master ~/.claude/skills/prompt-master
```

### 🔄 Keeping it updated

#### Codex

- **Repository mode:** run `git pull`. Codex detects skill changes automatically; restart only if the skill does not appear.
- **Installed-plugin mode:** `codex plugin marketplace upgrade prompt-master` refreshes the configured Git marketplace snapshot. The installed plugin is a cached snapshot, so reinstall it to pick up changed plugin files: `codex plugin remove prompt-master@prompt-master`, then `codex plugin add prompt-master@prompt-master`.
- No automatic-update behavior is claimed here for Codex app/CLI `0.144.1`; verify updates with `codex plugin list`.

#### Claude Code / Cowork

Third-party marketplaces (like this one) **do not auto-update by default** — only the official Anthropic marketplace auto-pulls on session start. After a new release the **Update** button can look active but do nothing, because it compares a stale local clone against itself.

- **Enable auto-update once** (recommended): `/plugin` → **Marketplaces** → `prompt-master` → enable **auto-update** (CLI), or toggle it on the marketplace page in Cowork. Note: even with auto-update, the plugin *cache* is a snapshot — a reinstall may still be needed to pick up new files.
- **Manual update:** `/plugin marketplace update prompt-master` → reinstall the plugin → `/reload-plugins` (or restart the session).
- **Force-refresh** if the version looks stuck: `/plugin marketplace remove prompt-master` → `/plugin marketplace add azagreev/prompt-master-za` → `/plugin install prompt-master@prompt-master` → `/reload-plugins` → restart.
- **CLI and Desktop/Cowork are separate installs** with separate stores — update each one. `/plugin` commands only work in the standalone Claude Code terminal, not inside the Cowork chat (use the GUI there).
- To confirm what's *actually* running, compare four sources: the `/plugin` UI, `~/.claude/plugins/installed_plugins.json` (`version`), the cache dir it points to, and the marketplace clone's git HEAD vs the latest GitHub release.

---

## 🔥 The Problem This Solves

Every AI user wastes credits the same way:

> Write vague prompt → get wrong output → re-prompt → get closer → re-prompt again → finally get what you wanted on attempt 4.

That's 3 wasted calls. Multiply by 50 prompts a day. That's real money and time gone.

### The key insight

> "The best prompt is not the longest. It's the one where every word is load-bearing."

Most "prompt generators" make prompts longer. This skill makes them sharper.

---

## 🎯 Usage

Invoke the skill naturally:

```
Write me a prompt for Cursor to refactor my auth module
```
```
I need a prompt for Claude Code to build a REST API — ask me what you need to know
```
```
Here's a bad prompt I wrote, fix it: [paste prompt]
```
```
Generate a Midjourney prompt for a cyberpunk city at night
```
```
Write a prompt for Kimi to research X across multiple sources, with citations
```
```
Give me 3 prompt directions for Claude Code, with fit, tradeoffs, and when to use each
```

Or invoke it explicitly using the syntax for your host.

Codex:

```
$prompt-master

I want to ask Claude Code to build a todo app with React and Supabase
```

Claude Code:

```
/prompt-master:prompt-master

I want to ask Claude Code to build a todo app with React and Supabase
```

---

## How It Works

Prompt Master runs a structured pipeline on every request:

1. **Detects the target surface** — identifies the receiving product/interface before selecting its profile, model, or mode.
2. **Extracts 9 dimensions of intent** — task, target surface, output format, constraints, input, context, audience, success criteria, examples.
3. **Resolves missing inputs deterministically** — asks at most 3 targeted questions when allowed; an explicit `no questions` request gets zero questions plus visible target/format assumptions.
4. **Routes to the right architecture** — picks the correct template and tool profile automatically, never shown to you.
5. **Applies bounded techniques only when useful** — a role only when it changes expertise, audience, authority, or voice; examples, structure, grounding, memory, and citations only when the task needs them.
6. **Runs a token-efficiency audit** — strips every word that doesn't change the output.
7. **Delivers one fenced artifact** — one prompt by default, exactly 2–3 labeled variants when requested, or a sequential `Prompt 1..N` set for split tasks.

---

## Full Example #1 — Image Prompt

### Input
```
Write me a Midjourney prompt for a realistic samurai standing in the rain at night
```

### Generated
```
lone samurai standing in heavy rain at night, traditional armor,
neon reflections on wet cobblestone street, cinematic lighting,
dramatic shadows, fog, ultra detailed, photorealistic,
shallow depth of field --ar 16:9 --v 8.1 --raw

negative: blurry, low quality, watermark, cartoon, anime, extra limbs
```
**🎯 Target:** Midjourney · **💡 Strategy:** Comma-separated descriptors over prose, lighting and mood anchored early, aspect ratio and version locked, negative prompt prevents style drift.

---

## Full Example #2 — Coding Prompt

### Input
```
Build a Claude Code prompt for a landing page for a business dashboard
that looks and feels exactly like Notion — smooth animations, clean UI
```

### Generated
```
Objective:
Build a fully detailed, production-quality static landing page for a
business dashboard product. Design must match Notion's exact aesthetic —
clean, minimal, typographic, with smooth animations throughout.

Stack:
Single HTML file with embedded CSS and vanilla JS. No frameworks.
No external dependencies except Google Fonts (Inter).

Design Spec — match these exactly:
- Background: #ffffff / Primary text: #1a1a1a / Secondary: #6b7280
- Border: #e5e7eb / Accent: #000000
- Font: Inter, weights 400 / 500 / 600 / 700
- Base spacing unit: 8px / Radius: 6px cards, 4px buttons
- Shadows: 0 1px 3px rgba(0,0,0,0.08) only — no dramatic shadows

Sections in order:
1. Navbar — logo left, links center, "Get started free" CTA right; sticky,
   adds a subtle border-bottom on scroll via JS.
2. Hero — large left-aligned heading (max 3 lines), subtext, two CTAs,
   16:9 screenshot placeholder (gray rounded card).
3. Logos bar — "Trusted by teams at…" + 5 muted placeholder names.
4. Features — 3-column grid; card hover: border → #d1d5db, translateY(-2px), 200ms.
5. How it works — alternating left/right, 3 steps with number badge.
6. Pricing — 2 tiers; Pro tier black bg, "Most popular" badge, 4 features each.
7. CTA banner — full-width dark section, centered heading + one CTA.
8. Footer — 4-column links, copyright.

Animations:
- Fade-in + translateY(20px→0) on scroll via IntersectionObserver (threshold 0.15, 500ms ease-out).
- Staggered feature cards (100ms apart). Smooth scroll on anchors.

Constraints:
- Single file, all CSS/JS embedded, no external files except Google Fonts.
- Placeholder images = styled gray divs. Pixel-perfect at 375px and 1440px.

Done When:
- All 8 sections render at both breakpoints; animations trigger without layout shift;
  navbar sticks + border appears on scroll; hover states work; zero console errors.
```
**🎯 Target:** Claude Code · **💡 Strategy:** Every vague "Notion aesthetic" cue translated to exact hex/pixel specs so Claude Code can't guess wrong; animations defined with exact timing, method, and trigger.

---

## 🗺️ Routing Architecture

When you name a tool, Prompt Master selects one workflow bundle and resolves the
matching provider record from the canonical facts registry. An explicit
composite request may load one add-on bundle; an ordinary request does not load
the whole catalog.

| Primary bundle | Typical routes | What it contributes |
|---|---|---|
| **Hosted text** | Provider-hosted chat, reasoning, and agent APIs | Provider-neutral prompt grammar plus registry-selected constraints |
| **Local text** | Local runtimes and open-weight models | Compact structure and capability verification without invented defaults |
| **Coding agents** | Terminal/file agents and IDE assistants | Scope, approvals, stop conditions, checks, and evidence |
| **Research/browser** | Search, research, and computer-use agents | Retrieval boundaries, citations, read-only defaults, and action gates |
| **Builders/workflows** | UI/deck builders and automation tools | Deliverable shape, settings-as-knobs, field mapping, and safe execution |
| **Media** | Image, video, voice, 3D, and node workflows | Media grammar and registry-selected capability/parameter constraints |
| **Decompiler/fallback** | Existing prompts, missing references, unknown tools | Redacted analysis and a seven-field capability-safe fallback |

The compact [routing index](plugins/prompt-master/skills/prompt-master/references/tool-profiles.md)
points to the seven [profile bundles](plugins/prompt-master/skills/prompt-master/references/profiles/);
current IDs, defaults, channels, availability, and version-tied parameters live
only in the [facts registry](plugins/prompt-master/skills/prompt-master/references/facts/index.json).

---

## 🤝 Works With Any AI Tool

For anything not profiled, Prompt Master falls back to a **Universal
Fingerprint**. It verifies seven capability fields and marks unknown provider
behavior `[unverified]` instead of copying a neighboring tool's facts.

<details>
<summary><b>Click to view the runtime layout</b></summary>

| Layer | Canonical path | Responsibility |
|---|---|---|
| Core router | `SKILL.md` | Intent, precedence, output contract, and progressive disclosure |
| Route index | `references/tool-profiles.md` | Legacy-compatible aliases → one primary bundle and fact route |
| Workflow guidance | `references/profiles/*.md` | Seven bounded, evergreen profile bundles |
| Volatile facts | `references/facts/*.json` | Sourced IDs, defaults, channels, availability, parameters, and constraints |
| Compatibility policy | `references/models.md` | Refresh policy and old anchor navigation without duplicated facts |

</details>

---

## 🤖 Multi-Agent Prompts (opt-in — you must ask)

Prompt Master **can** generate multi-agent / orchestration prompts, but it's **deliberately opt-in**: by default it keeps a prompt to a single agent loop, because over-orchestration burns tokens. To get a multi-agent prompt, **say so explicitly** — e.g. *"write a **multi-agent** prompt…"*, *"use an **orchestrator + sub-agents**"*, *"**fan-out** across agents"*, or name a tool's native mode (**Agent Swarm**, **multi-agent research**).

That rule applies to the **prompt form**, not to a native execution mode. For
ChatGPT Work with a supported GPT-5.6 model and an account eligible for
**Ultra**, Prompt Master may recommend hosted subagents when the task contains
at least two independent bounded workstreams. For difficult but sequential
work, it recommends **Max** and one deep agent. The mode choice appears in
`Recommended setup:` outside the copyable prompt.

Native multi-agent support by target:

| Target | Multi-agent capability | How Prompt Master frames it |
|---|---|---|
| **Grok / xAI** | Provider-managed research when the selected registry record/surface supports it | Research brief plus registry-selected search controls; never hardcode an agent count |
| **Kimi / Moonshot AI** | App-native swarm only when the selected registry record confirms availability | One large decomposable task + final artifact; do not set or script a worker count |
| **ChatGPT Work / GPT-5.6 Ultra** | For supported models and eligible accounts, Ultra may proactively delegate independent task parts to hosted subagents | Recommend Ultra only for parallelizable work; keep the model and mode in `Recommended setup:`, not inside the prompt |
| **Codex / GPT-5.6 Ultra** | Ultra goes beyond a single-agent run and distributes independent task parts across subagents in parallel | Define bounded work packages, one coordinator, and final synthesis; serialize writes and external actions |
| **OpenAI Responses API / GPT-5.6** | Explicit Multi-agent beta is available with all GPT-5.6 models | Keep the beta flag and request controls outside the prompt; the root agent owns coordination, conflict checks, and one final answer |
| **Perplexity / Manus** | Multi-agent web-research orchestrators | Describe the end deliverable, not the steps — they decompose internally |
| **Claude Code / Cline / Devin / SWE-agent** | You design the orchestration (orchestrator + sub-agents) | Agentic Prompt Fragments: fan-out + synthesizer, evaluator loop, handoff contracts, human-in-the-loop gates |
| **DeepSeek** | No registry-confirmed native swarm | Use the registry-selected reasoning/retrieval route or a bounded custom tool loop |
| **GLM / Z.AI / BigModel** | No registry-confirmed native cloud fallback table | Use registry-selected thinking/tool-loop surfaces with stop conditions and evidence |

Two orchestration styles remain distinct: **provider-managed**, where the
selected registry record confirms the surface and the prompt only frames the
goal; and **user-designed**, where a coding agent receives an explicit bounded
topology. Prompt Master never invents availability or a worker count.

Official mode boundaries: [ChatGPT Work/Codex Ultra and GPT-5.6](https://learn.chatgpt.com/docs/models#know-when-to-use-max-or-ultra), [Responses API Multi-agent beta](https://developers.openai.com/api/docs/guides/responses-multi-agent).

---

## 📐 15 Prompt Templates (Auto-Selected)

Prompt Master picks the right architecture for every task and routes silently — you never see the framework name, just the prompt.

<details>
<summary><b>Click to view all 15 templates</b></summary>

| Template | Best for |
|----------|----------|
| **A — RTF** (Role, Task, Format) | Fast one-shot tasks |
| **B — CO-STAR** | Professional documents, reports, business writing |
| **C — RISEN** | Complex multi-step projects |
| **D — CRISPE** | Creative work, brand voice, iterative content |
| **E — Chain of Thought** | Math, logic, debugging (standard reasoning models only) |
| **F — Few-Shot** | Consistent structured output, pattern replication |
| **G — File-Scope** | Cursor, Windsurf, Copilot — any code-editing AI |
| **H — ReAct + Stop Conditions** | Claude Code, Devin — any autonomous agent |
| **I — Visual Descriptor** | Midjourney, GPT-image, Stable Diffusion, FLUX.2 — image generation |
| **J — Reference Image Editing** | Editing an existing image (edit-vs-generate detection) |
| **K — ComfyUI** | Node-based image workflows — positive/negative split |
| **L — Prompt Decompiler** | Breaking down, adapting, simplifying, or splitting prompts |
| **M — Opus 4.7 / 4.8 Task Brief** | Complex, multi-file, ambiguous, or agentic Claude work |
| **N — Research Brief** | Deep-research / multi-source cited reports (Perplexity, Grok multi-agent, Kimi) |
| **O — Deck Brief** | AI presentation generators (Gamma) — structured brief with card count, sections, tone, density, data |

Plus opt-in **Agentic Prompt Fragments** for real multi-agent / tool-using runtimes (orchestrator + sub-agents, eval loops, review gates).

</details>

---

## 🛡️ 6 Safe Techniques, Applied When Needed

Prompt Master only uses techniques with reliable, bounded effects. Methods known to produce hallucinations or unpredictable output (Tree of Thought, Graph of Thought, Universal Self-Consistency, layered prompt chaining) are explicitly excluded.

| Technique | What it does |
|-----------|-------------|
| **Conditional Role Assignment** | Adds a narrow expert identity only when expertise, audience, authority, or voice materially changes the result |
| **Few-Shot Examples** | Adds 2–5 examples when format consistency matters more than instructions |
| **Structural Tags** | Separates instructions, context, inputs, and output contracts when the selected target supports that structure |
| **Grounding Anchors** | Adds anti-hallucination rules for factual and citation tasks |
| **Private Work Cue** | Used only for compatible logic tasks; never requests visible reasoning when the selected registry record forbids it |
| **Source Citations** | Uses the selected surface's native attribution path for factual retrieval; never fabricates a source or URL |

---

## 🚫 Pattern Library

The registry preserves 61 stable IDs: 60 active patterns plus the PM-036 compatibility tombstone. Prompt Master routes a normal diagnosis to one primary family shard and fixes matching failures silently; an explicitly composite diagnosis may use one additional shard.

| ID | Pattern | Before → After |
|---|---------|----------------|
| PM-001 | Vague task verb | "help with this" → one precise operation with a bounded result |
| PM-011 | Evidence-free factual claim | unsupported certainty → retrieved or supplied evidence, with gaps marked explicitly |
| PM-016 | Unconditional role assignment | generic persona → add a narrow role only when it changes expertise, audience, authority, or voice |
| PM-033 | Silent agent | ceremonial update after every step → report milestones, blockers, approvals, and final evidence |
| PM-040 | Injection-vulnerable prompt | embedded content treated as authority → treat it as untrusted data under the governing scope and approval rules |
| PM-052 | No runnable self-check | "looks done" → one pass/fail check; initial attempt plus at most two retries, then stop with evidence |
| PM-053 | Unsafe or bloated artifact transfer | paste everything verbatim → redact sensitive data and provide the smallest relevant excerpt or file reference |
| PM-058 | Unverified premise before fan-out | broad delegation from assumptions → run a cheap premise check; use a worker only when independently useful |
| PM-061 | Overdelegation or bad granularity | agent per file or one huge worker → default to one loop; delegate only independent bounded packets |

Start with the compatibility router: [`references/patterns.md`](plugins/prompt-master/skills/prompt-master/references/patterns.md). It resolves stable and legacy IDs through the machine-readable index without loading the whole catalog.

---

## 🧠 Memory Block System

When a conversation has history, Prompt Master pulls out prior decisions and prepends a Memory Block so the target AI never contradicts earlier work:

```
## Context (carry forward)
- Stack: React 18 + TypeScript + Supabase
- Auth uses JWT in httpOnly cookies, not localStorage
- Component naming: PascalCase, no default exports
- Design system: Tailwind only, no custom CSS
- Architecture: no Redux, Context API only
```

This is the single biggest fix for long sessions — most wasted re-prompts come from the AI forgetting what you already decided.

---

## ℹ️ Version History

Full history — [CHANGELOG.md](CHANGELOG.md). Current release: **v1.36.0** (versioned pattern registry, nine routed diagnostic shards, fail-closed offline validation, and consistent evidence/safety contracts).

## 📄 License

MIT — see [LICENSE](LICENSE).

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=azagreev/prompt-master-za&type=Date)](https://star-history.com/#azagreev/prompt-master-za&Date)
