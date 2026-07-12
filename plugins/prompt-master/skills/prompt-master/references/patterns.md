# Prompt Patterns Catalog

Compatibility router for 61 stable pattern IDs: 60 active patterns and the merged
`PM-036` tombstone. Legacy `pattern #N` references resolve to `PM-NNN` through
[the machine index](patterns/index.json).

## How to load patterns

1. Match the failure trigger, then load the one primary shard below.
2. Load a second shard only when the prompt has a distinct second failure family.
3. Generic prompt diagnosis starts with `prompt-design.md`; do not preload every shard.
4. Follow canonical links for runtime policy, artifact shape, provider syntax, or
   volatile facts. Pattern repairs remain provider-neutral.

| Primary shard | Load when the failure concerns | Stable IDs |
|---|---|---|
| [Prompt design](patterns/prompt-design.md) | task, format, audience, scope, reasoning cue, exploration | PM-001–002, PM-005–006, PM-012, PM-014–017, PM-020, PM-026, PM-036, PM-039, PM-041, PM-056 |
| [Context and state](patterns/context-state.md) | memory, project state, artifacts, session health | PM-007–010, PM-013, PM-021, PM-025, PM-028–029, PM-037, PM-053–054 |
| [Research and evidence](patterns/research-evidence.md) | factual grounding, retrieval, citations, research brief | PM-011, PM-030, PM-043–045 |
| [Agentic execution](patterns/agentic-execution.md) | starting/target state, file scope, progress, deviations | PM-022–023, PM-031–033, PM-057 |
| [Orchestration](patterns/orchestration.md) | fan-out, worker contracts, advisor gates, granularity | PM-058–061 |
| [Evaluation and review](patterns/evaluation-review.md) | success criteria, validation, runnable checks, review | PM-003, PM-042, PM-052, PM-055 |
| [Safety and trust](patterns/safety-trust.md) | authority, filesystem, approval, prompt injection | PM-004, PM-034–035, PM-040 |
| [Routing and economics](patterns/routing-economics.md) | tool/surface fit, model constraints, knobs, cost | PM-024, PM-027, PM-038, PM-046, PM-048, PM-051 |
| [Media generation](patterns/media-generation.md) | media syntax, references, decks, delta edits | PM-018–019, PM-047, PM-049–050 |

## Compatibility

- `PM-036` is a merged tombstone in
  [Prompt design](patterns/prompt-design.md#pm-036-vague-first-turn-on-a-named-model)
  and redirects to `PM-001`; its scope and acceptance parts are covered by
  `PM-003` and `PM-020`.
- The index owns ID, family, file, anchor, status, redirect, and related links.
- An active pattern appears in exactly one shard. Moving a pattern never changes
  its ID.

## Ownership boundary

- Universal failure mechanism: the selected pattern shard.
- Runtime authority, trust, approval, and execution policy: [agentic.md](agentic.md).
- Prompt artifact shape: [templates.md](templates.md).
- Surface/tool syntax: [tool profiles](tool-profiles.md).
- IDs, channels, availability, defaults, and parameters: [facts](facts/index.json).
