# Tool Profiles

Prompting best practices per target tool. Read only the section for your target tool.

---

## Claude (claude.ai, Claude API, Claude 4.x)
- Be explicit and specific — Claude 4.x responds to precise instructions, not hints
- XML tags are useful for complex multi-component prompts — wrap sections in `<context>`, `<task>`, `<constraints>`, `<examples>`, `<output_format>`
- Claude Opus 4.x over-engineers by default — add "Keep solutions minimal. Only make changes directly requested. Do not add features, refactor, or improve beyond what was asked."
- Provide context and reasoning WHY, not just WHAT — Claude generalizes better from explanations
- Use `<examples>` tags for few-shot — 3-5 examples dramatically improve format consistency
- Explicit output format beats vague requests — always specify structure, length, and style
- Do NOT over-constrain — Claude is smart enough to infer from clear context

## ChatGPT / GPT-4o
- Strong role assignment in the system prompt calibrates the entire response
- GPT-4o responds well to numbered instructions and explicit step sequences
- Use crisp numeric constraints over adjectives — "under 100 words" not "concise"
- GPT-4o tends to add filler and caveats — add "Skip preamble. No caveats. Answer directly."
- For structured output specify the exact format with a labelled example
- GPT-4o is more verbose than Claude by default — always set a length cap

## Gemini 2.x / Gemini 3 Pro
- Strong at long-context and multimodal tasks — leverage its 1M token window
- Prone to hallucinated citations — always add "Cite only sources you are certain of. If uncertain, say [uncertain]."
- Can drift from strict output formats — use explicit format locks with a labelled example
- Gemini 3 Pro powers Antigravity — excellent at frontend code generation
- For grounded tasks: "Base your response only on the provided context. Do not extrapolate."

## o1 / o3 / OpenAI reasoning models
- SHORT clean instructions ONLY — these models reason internally
- NEVER add CoT, "think step by step", or any reasoning scaffolding — it degrades output
- State what you want, not how to think about it
- Do not add XML structure or heavy formatting — keep plain and direct
- Longer system prompts hurt performance — keep under 200 words

## Qwen 2.5 (instruct variants)
- Excellent instruction following, JSON output, and structured data understanding
- 128K context window — good for long document tasks
- Clear system prompt defining the role — Qwen2.5 responds well to role context
- Works well with explicit output format specifications including JSON schemas
- Multilingual — specify output language explicitly if not obvious
- Shorter focused prompts outperform long complex ones

## Qwen3 (thinking mode)
- Two modes: thinking (like o1) and non-thinking (standard LLM)
- Thinking mode = `/think` prefix or `enable_thinking=True` → treat like o1 (no CoT)
- Non-thinking mode → treat like Qwen2.5 (full structure, role assignment)
- User switches with `/think` or `/no_think` — design for active mode

## Ollama (local models)
- ALWAYS ask which model is running before writing — Llama3, Mistral, Qwen, Phi behave differently
- System prompt is the most impactful lever — set via Modelfile `SYSTEM` or API `system` parameter
- Shorter, simpler prompts outperform complex ones — local models lose coherence with nesting
- Temperature: 0.1 for deterministic/coding, 0.7-0.8 for creative
- Context window varies by model and VRAM — don't assume large context
- Include the system prompt in output so user can set it in Modelfile

## Llama / Mistral / open-weight LLMs
- Shorter prompts work better — lose coherence with deeply nested instructions
- Simple flat structure — avoid heavy XML nesting
- Be more explicit than with Claude or GPT — instruction following is weaker
- Always include a role in the system prompt
- Avoid complex multi-step reasoning in a single prompt — break into sequential prompts

## DeepSeek-R1 / DeepSeek reasoning models
- Reasoning-native like o1 — do NOT add CoT instructions
- Short clean instructions only — state goal and output format
- Strong at math, code, and logical reasoning
- For answer-only output: "Output only the final answer, no reasoning."

## Claude Code
- Agentic — runs tools, edits files, executes commands autonomously
- Required structure: starting state + target state + allowed actions + forbidden actions + stop conditions + checkpoint output
- Stop conditions are MANDATORY — runaway loops are the biggest credit killer
- Opus 4.x over-engineers — add: "Only make changes directly requested. Do not add extra files, abstractions, or features."
- Always scope to specific files and directories
- Add checkpoint output: "After each major step output: ✅ [what was completed]"
- Human review triggers: "Stop and ask before deleting any file, adding any dependency, or affecting the database schema"

## Antigravity (Google's agent-first IDE)
- Powered by Gemini 3 Pro — controls editor, terminal, and browser simultaneously
- Task-based prompting — describe outcomes, not steps
- Generates Artifacts (task lists, plans, screenshots) — prompt for the artifact you want
- Treat like agentic system: starting state + target state + stop conditions
- Browser automation built-in — include verification: "Verify UI renders correctly at 375px and 1440px"
- One deliverable per session — don't mix unrelated tasks

## Cursor / Windsurf
- File path + function name + current behavior + desired change + do-not-touch list + language version
- Never give a global instruction without a file anchor
- Always include "Do NOT modify [list of files/functions]"
- "Done when:" is required — defines when the agent stops
- Complex tasks: split into Prompt 1, Prompt 2 with "➡️ Run this first"

## GitHub Copilot
- Autocomplete-first — reads your open file and cursor position as primary context
- Write the exact function signature, docstring, or comment immediately before invoking
- Be precise in docstring — input types, return type, edge cases, what NOT to do
- For complex functions: full docstring + type hints + inline comments before completion

## Bolt / v0 / Lovable / Figma Make / Google Stitch
- Full-stack generators default to bloated boilerplate — scope it down
- Always specify: stack, version, what NOT to scaffold, component boundaries
- Add "Do not add authentication, dark mode, or features not explicitly listed"
- v0 is Vercel-native — specify if you need non-Next.js output
- Figma Make: reference Figma component names directly
- Google Stitch: describe the interface goal, add "match Material Design 3" if needed

## Devin / SWE-agent
- Fully autonomous — very explicit starting state + target state required
- Forbidden actions list is critical — prevents autonomous wrong decisions
- Stop conditions for irreversible actions: deployment, DB changes, external API calls
- Scope filesystem: "Only work within /src. Do not touch infrastructure, config, or CI files."

## Perplexity / SearchGPT / Manus
- Search-grounded AI — specify mode: search, analyze, or compare
- Reframe hallucination-prone questions: "Search for recent studies on X and summarize findings"
- Add: "Cite the specific source for each claim"
- "Report only what search results contain. If results don't answer, say so."

## Image AI — Generation (Midjourney, DALL-E 3, Stable Diffusion, SeeDream)
First detect: generation (from scratch) or editing (modifying existing)?

- **Midjourney**: Comma-separated descriptors, NOT prose. Subject → style → mood → lighting. Parameters at end: `--ar 16:9 --v 6 --style raw`. Negatives via `--no [elements]`
- **DALL-E 3**: Prose description works well. Add "do not include text in the image unless specified." Describe foreground, midground, background separately.
- **Stable Diffusion**: `(word:weight)` syntax. CFG 7-12. Negative prompt MANDATORY. Steps 20-30 drafts, 40-50 finals.
- **SeeDream**: Specify art style before scene content. Strong at stylized generation.

## Image AI — Reference Editing
Detect when: user mentions "change", "edit", "modify" an existing image.
Instruct user to attach the reference image first. Build prompt around the delta ONLY.
Read [templates.md](templates.md) Template J for the full template.

## ComfyUI
Node-based workflow — ask which checkpoint model is loaded.
Always output two separate blocks: Positive Prompt and Negative Prompt.
Read [templates.md](templates.md) Template K for the full template.

## Video AI (Sora, Runway, Kling)
Camera movement + subject + duration + mood + cut style + continuity.
- **Sora**: Describe as directing a film shot. Camera movement is critical.
- **Runway Gen-3**: Reference film styles or directors for consistent aesthetic.
- **Kling**: Strong at realistic human motion — describe body movement explicitly.
- **Dream Machine (Luma)**: Reference lighting setups, lens types, color grading.

## Voice AI (ElevenLabs / Murf AI)
Emotion + pacing + emphasis markers + speech rate. Specify parameters directly, not prose.

## Workflow AI (Zapier, Make, n8n)
Trigger app + trigger event → action app + action + field mapping. Step by step.
Auth noted explicitly: "assumes [app] is already connected."

## Prompt Decompiler Mode
Detect when: user pastes an existing prompt to break down, adapt, simplify, or split.
Read [templates.md](templates.md) Template L for the full template.
