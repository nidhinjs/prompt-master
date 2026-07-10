# Tool Profiles — routing and compatibility index

Choose exactly one row, load its one **Primary profile**, and resolve its **Fact
lookup** in [facts/index.json](facts/index.json). The index is the sole source of
route aliases/defaults and shard inventory. A simple request loads no other
profile bundle. Only an explicit composite may load the row's single **Add-on**.
Provider facts, current defaults, availability, channels, and status dates do
not live here. Version-like strings in **Match** are compatibility aliases only,
never selection, default, availability, or status claims.

Every primary bundle is self-contained. If a route/fact/profile is missing or
unreadable, load [decompiler-fallback.md](profiles/decompiler-fallback.md) and do
not recreate it from memory. `none (evergreen-only)` means the route has no volatile
provider/model fact; verify capabilities locally and never invent a registry
record.

## Routing index

| Route (legacy-compatible) | Match / preserved aliases | Primary profile | Fact lookup | Add-on only for explicit composite |
|---|---|---|---|---|
| **Claude / Anthropic text** | Bare Claude, claude.ai, Claude API; named models resolve in registry | [hosted-text](profiles/hosted-text.md) | [route: `claude`](facts/index.json) | — |
| **Claude frontier / long-horizon** | Explicit Fable or Mythos registry alias only | [hosted-text](profiles/hosted-text.md) | [route: `claude-frontier`](facts/index.json) | — |
| **Claude Advisor Tool** | Claude Advisor, advisor tool, bounded Claude checkpoint | [hosted-text](profiles/hosted-text.md) | [route: `advisor`](facts/index.json) | — |
| **Claude Managed Agents** | Claude Managed Agents, CMA, Anthropic Managed Agents, Plan Big Execute Small | [hosted-text](profiles/hosted-text.md) | [route: `managed-agents`](facts/index.json) | — |
| **OpenAI GPT / ChatGPT** | OpenAI, GPT, ChatGPT; named models resolve in registry | [hosted-text](profiles/hosted-text.md) | [route: `gpt`](facts/index.json) | — |
| **OpenAI reasoning** | Named OpenAI reasoning record | [hosted-text](profiles/hosted-text.md) | [route: `openai-reasoning`](facts/index.json) | — |
| **Grok / xAI** | Grok, xAI; named models resolve in registry | [hosted-text](profiles/hosted-text.md) | [route: `grok`](facts/index.json) | [research-browser](profiles/research-browser.md), research only |
| **Gemini / Google** | Gemini, Google AI Studio, Vertex; named models resolve in registry | [hosted-text](profiles/hosted-text.md) | [route: `gemini`](facts/index.json) | [research-browser](profiles/research-browser.md), grounded research only |
| **Kimi / Moonshot AI** | Kimi, Moonshot | [hosted-text](profiles/hosted-text.md) | [route: `kimi`](facts/index.json) | [research-browser](profiles/research-browser.md), research/swarm only |
| **Z.AI / BigModel GLM** | GLM, Z.AI, Z.ai, Zhipu, BigModel, chat.z.ai, GLM Coding Plan, ZCode | [hosted-text](profiles/hosted-text.md) | [route: `glm`](facts/index.json) | — |
| **Qwen / Alibaba** | Qwen, Alibaba model; named models resolve in registry | [hosted-text](profiles/hosted-text.md) | [route: `qwen`](facts/index.json) | — |
| **Ollama** | Ollama; local Llama, Mistral, Qwen, CodeLlama | [local-text](profiles/local-text.md) | `none (evergreen-only)` | — |
| **Llama / Mistral / open-weight** | Named Llama, Mistral, or open-weight variant | [local-text](profiles/local-text.md) | `none (evergreen-only)` | — |
| **DeepSeek** | DeepSeek; named models resolve in registry | [hosted-text](profiles/hosted-text.md) | [route: `deepseek`](facts/index.json) | — |
| **MiniMax** | MiniMax; no verified model alias, require current-doc verification | [hosted-text](profiles/hosted-text.md) | `none (evergreen-only)` | — |
| **Claude Code** | Inside Claude Code or a Claude Code prompt | [coding-agents](profiles/coding-agents.md) | [route: `claude-code`](facts/index.json) | — |
| **Cortex Code** | Cortex Code, Snowflake Cortex | [coding-agents](profiles/coding-agents.md) | `none (evergreen-only)` | — |
| **Antigravity** | Antigravity, Google agentic IDE | [coding-agents](profiles/coding-agents.md) | [route: `antigravity`](facts/index.json) | — |
| **Cursor / Windsurf** | Cursor or Windsurf | [coding-agents](profiles/coding-agents.md) | `none (evergreen-only)` | — |
| **Cline** | Cline, Claude Dev | [coding-agents](profiles/coding-agents.md) | `none (evergreen-only)` | — |
| **GitHub Copilot** | GitHub Copilot inline completion | [coding-agents](profiles/coding-agents.md) | `none (evergreen-only)` | — |
| **Bolt / v0 / Lovable / Figma Make / Google Stitch** | Named no-code/low-code or UI generator | [builders-workflows](profiles/builders-workflows.md) | `none (evergreen-only)` | — |
| **Gamma / AI presentations** | Gamma, slides, deck, presentation | [builders-workflows](profiles/builders-workflows.md) | [route: `gamma`](facts/index.json) | — |
| **Devin / SWE-agent** | Devin, SWE-agent | [coding-agents](profiles/coding-agents.md) | `none (evergreen-only)` | — |
| **Perplexity** | Perplexity, Sonar, research/search Comet question | [research-browser](profiles/research-browser.md) | [route: `perplexity`](facts/index.json) | — |
| **Manus / multi-agent orchestrators** | Manus, web-research orchestrator, Comet mission | [research-browser](profiles/research-browser.md) | `none (evergreen-only)` | — |
| **Computer-Use / Browser agents** | Comet, Atlas, Claude in Chrome, browser agent | [research-browser](profiles/research-browser.md) | `none (evergreen-only)` | — |
| **Image AI — Generation** | Generate with Midjourney, GPT-image, SD, FLUX.2, SeeDream, Nano Banana, Grok Imagine | [media](profiles/media.md) | [route: `image`](facts/index.json) | — |
| **Image AI — Reference Editing** | Change/edit/modify an image or uploaded reference | [media](profiles/media.md) | [route: `image`](facts/index.json) | — |
| **ComfyUI** | ComfyUI node workflow | [media](profiles/media.md) | `none (evergreen-only)` | — |
| **3D AI** | Text-to-3D or game asset with Meshy, Tripo, Rodin | [media](profiles/media.md) | `none (evergreen-only)` | — |
| **3D AI — In-Engine** | Unity or Blender AI tooling | [media](profiles/media.md) | `none (evergreen-only)` | — |
| **Video AI** | Veo, Kling, Runway, Sora, LTX, Luma, Seedance, Grok Imagine, Omni Flash | [media](profiles/media.md) | [route: `video`](facts/index.json) | — |
| **Voice AI** | Voice, speech, or audio output; ElevenLabs | [media](profiles/media.md) | `none (evergreen-only)` | — |
| **Workflow AI** | Zapier, Make, n8n automation | [builders-workflows](profiles/builders-workflows.md) | `none (evergreen-only)` | — |
| **Prompt Decompiler** | Break down, adapt, simplify, or split an existing prompt | [decompiler-fallback](profiles/decompiler-fallback.md) | `none (evergreen-only)` | — |

## Comet tie-break (preserved)

A research/search **question** routes to **Perplexity**; in-browser **actions**
(click, fill, transact) route to **Computer-Use / Browser agents**; a long
multi-step autonomous **mission** (decompose and deliver) routes to
**Manus / multi-agent orchestrators**.
