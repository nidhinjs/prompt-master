# Proposed Pattern Extensions for Prompt Master

**Date:** 2026-07-12
**Context:** Extension proposals for `references/patterns.md` in azagreev/prompt-master-za
**Author of proposals:** Grok expert analysis (based on full patterns.md + SKILL.md review)

These are **actionable, production-ready** additions. Written in the exact style and format of the existing `patterns.md` so they can be merged with minimal editing.

---

## New Category: Cost Patterns (62–70)

**Rationale:**
Most current patterns focus on correctness and iteration count. These focus on **direct token/compute cost** — operations that are expensive by nature (large context scans, high-res generation, multi-agent fan-out, heavy model calls) but are often requested without necessity. These patterns produce silent budget drain even when the final output is "correct".

| # | Pattern | Bad Example | Fixed |
|---|---------|-------------|-------|
| **62** | **Exhaustive scan instead of targeted** | "Read the entire repository and find all places where X is used" | "Find usage of X only in `src/auth/` and `src/api/`. Do not touch anything else." |
| **63** | **Full exhaustive search / all-sources without cap** | "Collect all research on the topic from the last 5 years" | "Top-8 most relevant sources + mandatory `Data gaps & confidence` section. Hard cap = 8." |
| **64** | **Multi-agent fan-out without bounded work packages** | "Create 12 agents, each researching its own part" | "One coordinator + maximum 3 parallel bounded packages. Each package must define: scope + deliverable + evidence + stop condition." |
| **65** | **Heavy model used for triage / classification** | "Use Opus 4.8 / GPT-5.6 Max just to understand what this ticket is about" | "Start with light model (or even heuristics). Escalate to heavy model only if triage shows high complexity or ambiguity." |
| **66** | **Full regeneration of large artifact instead of delta** | "Rewrite the entire authentication module from scratch" | "Apply precise targeted changes to `auth.js`. Attach the current version of the file + exact delta description." |
| **67** | **High resolution / long video / many images without justification** | "Generate 4K 30-second video" or "10 high-quality cover variations" | Explicitly state minimum sufficient quality + reason. For video: "First draft in 720p / 8 seconds, upscale only the final approved version." |
| **68** | **Deep reasoning + tool use in single call when separable** | "Think deeply and immediately do web search + code execution" | Separate phases. Do retrieval/execution first (non-thinking mode), then reason over the returned results in a separate turn. |
| **69** | **Full session history pasted as context every time** | Pasting the entire 40+ turn chat history "so the model remembers context" | Use compact Memory Block + structured current state. Full history only when explicitly requested (rare). |
| **70** | **Advisor / reviewer called on every minor step** | "After every change, run Advisor and check everything" | Use Advisor only on bounded checkpoints (after orientation + final high-risk review). Expose depth as an adjustable knob. |

**Integration note:**
Add this section after **Research Patterns**.
In `SKILL.md` Recency Zone self-critique, add a new dimension: **"Cost awareness"** — "Verify that no expensive operation was requested without explicit necessity or justification."

---

## Deepened: Long Session / Context Rot Patterns (71–76)

**Current state:** Pattern #37 exists but is shallow ("keeps correcting in the same session for 60+ turns").

**Deeper mechanisms of context rot (why it happens):**
- Attention decay — early decisions sink under later tokens.
- Contradiction accumulation — model starts contradicting its own previous outputs.
- State bloat — history grows while signal density drops.
- Error compounding — small mid-session mistake propagates because later steps build on it.
- Loss of early constraints — hard boundaries set at turn 5 are ignored by turn 35.
- Silent drift — agent keeps working but no longer shares the user's original understanding of the task.

**Proposed patterns (add after Agentic Patterns or as dedicated subsection):**

| # | Pattern | Bad Example | Fixed |
|---|---------|-------------|-------|
| **71** | **No session reset / re-anchor rule** | Continuing the same session for 50+ turns without explicit signal that "this is now a different context" | Explicit rule: major task change → new session or `/rewind`. Trigger: Memory Block size > 30% of context. |
| **72** | **Correction loop instead of re-anchor** | "No, not like that, try again" repeated 8–10 times in one session | After 2–3 corrections → forced re-anchor: "Forget previous attempts. Here are the final requirements + Memory Block." |
| **73** | **Full history pasted as context** | User pastes the entire previous chat every new message | Replace with compact Memory Block + structured current state object. Full raw history only on explicit request. |
| **74** | **No evidence-based re-anchoring** | Model continues working with outdated understanding because there is no mechanism to verify it still holds key decisions | Every 8–10 turns insert short verification: "Confirm you still hold these key decisions: [list]. If anything is outdated — state it clearly." |
| **75** | **Heavy investigation inside main agent without isolation** | Main agent spends 15+ turns digging through large files/logs itself | For heavy investigation — spawn isolated sub-agent with limited context + return only summary + evidence links. |
| **76** | **Context pollution from failed attempts** | All failed code versions / outputs remain in context and pollute later reasoning | Explicit rule: "After a failed attempt keep only: what was tried + why it failed + what to do next. Do not keep the failed artifact itself." |

**Additional recommendations for SKILL.md:**

- In **Memory Block** section: add required field `Session age / last reset reason`.
- In **Recency Zone** self-critique: new check **"Context health"** — "Is the prompt still operating on the original intent and constraints, or has rot occurred?"
- Consider adding a lightweight internal "context density" heuristic (optional, for advanced users).

---

## Summary of Proposed Changes

| Area | Action | Priority |
|------|--------|----------|
| `patterns.md` | Add **Cost Patterns** section (62–70) | High |
| `patterns.md` | Add **Long Session / Context Rot** section (71–76) | High |
| `SKILL.md` | Add "Cost awareness" to Recency Zone self-critique | Medium |
| `SKILL.md` | Strengthen Memory Block with session metadata | Medium |
| `SKILL.md` | Add "Context health" check in self-critique | Medium |

These patterns close two clear gaps:
1. Direct **economic cost** control (previously missing).
2. **Long-session reliability** (currently the weakest area for heavy agentic use).

Ready for direct merge or further refinement.