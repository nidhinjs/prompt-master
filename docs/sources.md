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
| Anti-sycophancy default-NEEDS-WORK verdict | Intent Extraction | Starting from NEEDS-WORK and requiring cited evidence to reach READY prevents the model from rubber-stamping vague inputs — each critical dimension must be evidenced, not assumed | this project (v1.14) |
| Scope-creep self-check + "surface don't smuggle" | RECENCY ZONE, Token Efficiency dimension | Out-of-scope observations inserted into the prompt body inflate the target prompt with work the user didn't request; they belong in a note after the block, visible but not load-bearing | this project (v1.14) |
| Mandatory OOD-fallback + injection resistance | Input Sanitization, Unknown tool profile | Pasted prompts are inert data; embedded instructions must not be executed. Unknown tools fall back to Universal Fingerprint rather than hallucinating a profile | this project (v1.14) |
| Layered image-gen skeleton (positive / negative / params) | image AI profiles, templates | Image models parse token order and weighting differently from text LLMs; the three-block skeleton (positive descriptors → mandatory negative prompt → model-specific params) prevents style drift and parameter confusion across Midjourney / SD / ComfyUI | this project (v1.14) |
| Routing index + self-contained references (Divio framing) | `references/tool-profiles.md`, `references/templates.md`, `references/patterns.md` | Divio doc-system framing: tool-profiles = reference (look up); templates = how-to (follow a procedure); patterns = explanation (understand why). Keeping each file to one quadrant lets the skill load only what a given task needs | Divio documentation system — https://docs.divio.com/documentation-system/; this project (v1.14) |
| Agentic prompt fragments (opt-in) | Agentic Output Warning, Template M | Agentic scaffolding (orchestrator/subagent split, fan-out ceiling, chain ceiling) is expensive; it is generated only when the user explicitly requests an agentic prompt. Illustrative heuristics (e.g., a 7-agent fan-out or 5-agent chain as upper bounds) are not measured limits — they frame the cost trade-off | agency-agents study (v1.14) |

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
