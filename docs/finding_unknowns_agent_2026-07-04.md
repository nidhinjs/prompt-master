# FINDING UNKNOWNS — Agent Playbook

> Source: "A Field Guide to Fable: Finding Your Unknowns" by Thariq (Anthropic), x.com/trq212.
> Purpose: operationalize the unknowns-discovery methodology for an AI coding agent (Claude Code / Fable-class models).
> Audience: an agent executing long-horizon coding tasks with a human operator.
> Saved to repo docs/ as a LEAD (2026-07-04) — evaluated for prompt-master fit; see memory [[finding-unknowns-methodology]].

---

## Core model

**The map is not the territory.**

- MAP = prompt + skills + context the operator gives the agent.
- TERRITORY = the codebase, the real world, actual constraints.
- UNKNOWNS = the gap between them. Every unknown forces the agent to guess. More work = more guesses = more drift.

**Operating principle:** work quality is bottlenecked by how well unknowns are clarified. Planning alone is not enough — unknowns surface BEFORE, DURING, and AFTER implementation. Run discovery iteratively at all three phases.

**Skill framing:** reducing and planning for unknowns IS the skill of agentic coding. Even the best agentic coders (deeply in-sync with codebase and model behavior) still assume unknowns exist — they plan for them. It is an improvable skill, and the agent itself is the tool for improving it: it searches the codebase and the internet far faster than the operator, knows more about most topics, and iterates from failure faster.

---

## Unknowns taxonomy (classification table)

| Type | Definition | Detection heuristic for the agent |
|---|---|---|
| Known Knowns | What is in the prompt | Explicit requirements. No action needed. |
| Known Unknowns | Operator knows a question is open | Prompt contains "not sure", "maybe", "TBD", options listed. Trigger: INTERVIEW. |
| Unknown Knowns | Obvious to operator, never written down; "I'll know it when I see it" | Taste/visual/UX criteria, style conventions, implicit team norms. Trigger: BRAINSTORM + PROTOTYPE. |
| Unknown Unknowns | Never considered at all | Operator is new to the domain/codebase area. Trigger: BLINDSPOT PASS. |

**Calibration rule:** if instructions are too specific, the agent follows them even when a pivot is better. If too vague, the agent defaults to industry best practices that may not fit. When you detect either extreme, surface it instead of silently proceeding.

**Context rule:** always elicit the operator's starting point — where they are in their thinking, their experience with the problem and the codebase. Act as a thought partner, not a command executor.

**Artifact rule:** for almost every discovery output below, a single self-contained HTML artifact is the preferred representation (visualizable, reviewable, droppable into chat).

---

## Phase routing

```
BEFORE implementation:
  new domain / new codebase area        -> W1 Blindspot Pass
  taste-based criteria, wide option space -> W2 Brainstorms & Prototypes
  ambiguity remains after brainstorm     -> W3 Interview
  hard-to-verbalize requirements         -> W4 References
  ready to build                         -> W5 Implementation Plan   [HUMAN-GATE]

DURING implementation:
  always                                 -> W6 Implementation Notes

AFTER implementation:
  needs buy-in / approvals               -> W7 Pitch & Explainer
  operator must understand the change    -> W8 Quiz          [HUMAN-GATE]

LOOP: what you learn becomes the map for next time.
```

---

## W1 — Blindspot Pass

**Goal:** convert unknown unknowns into known unknowns before any work starts.
**Trigger:** operator enters an unfamiliar part of the codebase, or an unfamiliar craft domain (design, video, color grading, auth, infra).
**Action:** use the literal words "blindspot pass" and "unknown unknowns". Collect who the operator is and what they already know first.

Prompt templates:

```
I'm working on adding a new auth provider but I know nothing about the auth
modules in this codebase. Can you do a blindspot pass to help me figure out my
relevant unknown unknowns and help me prompt you better.
```

```
I don't know what color grading is but I need to grade this video. Can you
teach me to understand my unknown unknowns about color grading, so that I can
prompt better?
```

**Agent execution:** search the codebase and prior art; return (a) questions the operator did not know to ask, (b) what "good" looks like in this domain, (c) historical work already done, (d) potholes to avoid.
**Verify:** operator can now restate the task with at least 3 newly-surfaced constraints or questions.

## W2 — Brainstorms & Prototypes

**Goal:** surface unknown knowns ("I'll know it when I see it") cheaply, before they become expensive mid-implementation reverts.
**Trigger:** visual/UX/design work; scope definition at session start; any criteria the operator can only recognize, not specify.
**Rationale:** small spec changes cause drastically different implementations; reverting is hard. A throwaway mock costs nothing — no backend route, no state wiring.

Prompt templates:

```
I want a dashboard for this data but I have no visual taste and don't know
what's possible. Make me an HTML page with 4 wildly different design
directions so I can react to them.
```

```
Before wiring anything up, make a single HTML file mocking the new editor
toolbar with fake data. I want to react to the layout before you touch the
real app.
```

```
Here's my rough problem: users churn after onboarding. Search the codebase and
brainstorm 10 places we could intervene, from cheapest to most ambitious.
I'll tell you which ones resonate.
```

**Agent execution:** produce genuinely divergent options (not variations of one idea); order intervention lists cheapest -> most ambitious; keep mocks self-contained (fake data, no app changes). Known failure mode: the agent finds high-value approaches the operator would miss, but sometimes misses the forest for the trees — the operator's reaction pass is what corrects this.
**Verify:** operator reacted and picked/rejected; scope is now neither too narrow nor too wide. [COST] prototypes are throwaway — do not let mock code leak into the real app.

## W3 — Interview

**Goal:** drain remaining known unknowns after brainstorming.
**Trigger:** ambiguity persists; architecture-affecting decisions still open.

Prompt template:

```
Interview me one question at a time about anything ambiguous, prioritize
questions where my answer would change the architecture.
```

**Agent execution:** ONE question at a time; rank by architectural blast radius; stop when answers stop changing the plan. Ask for problem context before starting so questions are targeted.
**Verify:** no open question remains whose answer would change data models, interfaces, or user-facing flows.

## W4 — References

**Goal:** replace descriptions the operator cannot verbalize with ground truth.
**Trigger:** operator lacks the vocabulary, or a full description would take too long.
**Reference quality:** diagrams, documentation and pictures all work, but source code is the absolute best reference. Point the agent at a folder, module, or a component on a live website — it reads the underlying code, not just the screenshot, which yields much richer detail on markup, structure, and how the thing is actually built (this is how Claude Design works).

Prompt template:

```
This Rust crate in vendor/rate-limiter implements the exact backoff behavior
I want. Read it and reimplement the same semantics in our TypeScript API
client.
```

**Agent execution:** read the reference fully; extract semantics/structure, not surface syntax; reimplementation may cross languages.
**Verify:** list the specific behaviors carried over from the reference and confirm each against the reference code.

## W5 — Implementation Plan

**Goal:** let the operator review exactly the parts most likely to change; delegate the mechanical rest.
**Trigger:** discovery done, ready to build.

Prompt template:

```
Write an implementation plan in HTML, but lead with the decisions I'm most
likely to tweak: data model changes, new type interfaces, and anything
user-facing. Bury the mechanical refactoring at the bottom, I trust you on
that part.
```

**Agent execution:** front-load data models, type interfaces, UX flows; compress mechanical refactoring to a trailing summary.
**Verify:** operator has explicitly approved or amended the front-loaded decisions before any code is written. [HUMAN-GATE]

## W6 — Implementation Notes

**Goal:** capture unknown unknowns that ambush the work mid-flight; feed the next iteration's map.
**Trigger:** at the start of every implementation session (default on). Start a fresh session; pass in the plan/spec/prototype artifacts. The file is temporary — its job is to feed W7 and the next attempt's map, not to live in the repo.

Prompt template:

```
Keep an implementation-notes.md file. If you hit an edge case that forces you
to deviate from the plan, pick the conservative option, log it under
'Deviations', and keep going.
```

**Agent execution rules:**
- On plan deviation: choose the CONSERVATIVE option, log under `## Deviations`, continue — do not stall waiting for the operator.
- Log: what was found, what the plan said, what was done instead, why.
**Verify:** at session end, implementation-notes.md exists and every deviation from the approved plan is logged. Feed it into W7.

## W7 — Pitch & Explainer

**Goal:** accelerate reviewer understanding and expert approval.
**Rationale:** reviewers start with the same unknowns the operator had — answer them up front; experts approve faster when anticipated failure points are visibly accounted for.
**Trigger:** shipping needs buy-in.

Prompt template:

```
Package the prototype, the spec, and the implementation notes into a single
doc I can drop in Slack to get buy-in. Lead with the demo GIF.
```

**Agent execution:** one document; demo first; then decisions, deviations, and addressed failure points.
**Verify:** the doc answers, without follow-up questions: what changed, why this way, what almost went wrong.

## W8 — Quiz  [HUMAN-GATE]

**Goal:** ensure the operator actually understands the change; diffs alone give shallow understanding because behavior depends on pre-existing code paths.
**Trigger:** end of any long session; ALWAYS before merge.

Prompt template:

```
I want to make sure I understand everything that's happened in this change.
Give me a HTML report on the changes for me to read and understand with
context, intuition, what was done, etc. and a quiz at the bottom on the
changes that I must pass.
```

**Hard rule:** MERGE ONLY AFTER A PERFECT QUIZ PASS. A failed quiz means the operator's map still diverges from the territory — do not merge, re-explain, re-quiz.

---

## Worked example (Fable launch video)

New domain (video editing), operator not an expert. Sequence actually used:

1. Start from known knowns: code can cut/transcribe video.
2. W1 Blindspot: "explain how Whisper-style transcription works; can ffmpeg cut ums and pauses accurately?"
3. W2 Prototype: Remotion + transcript prototype to test word-synced UI before committing.
4. W1 again, mid-flight: video looked muted -> tried W2 (variations) first, realized "good" was unrecognizable -> switched to teach-me mode on color grading.

Lesson: techniques are re-entrant; when W2 fails because the operator cannot judge options, drop back to W1.

---

## Failure diagnosis

When a long-horizon task comes back wrong, diagnose in this order:

1. Were unknowns defined? (run W1-W4 retroactively on the failure)
2. Did the plan allow the agent to improvise through unknowns? (W5 too rigid or too vague)
3. Were deviations logged and reviewed? (W6 skipped)

Every explainer, brainstorm, interview, prototype, and reference is a cheap way to find out what you didn't know — before it gets expensive to fix. Start every new project by finding the unknowns.
