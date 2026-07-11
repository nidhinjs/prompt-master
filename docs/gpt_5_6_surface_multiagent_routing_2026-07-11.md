# GPT-5.6 surface and multi-agent routing — 2026-07-11

## Status

Maintainer research and implementation contract for Prompt Master v1.35. Facts
were checked through OpenAI Developer Docs MCP and the official ChatGPT/Codex
documentation. This note is not loaded directly by the runtime; canonical
volatile values live in the facts registry.

## Primary conclusion

Resolve the receiving surface before choosing a model or execution mode. The
phrase “ChatGPT 5.6 with multi-agent execution” can refer to different products
with incompatible controls:

```text
Short answer, conversation, or draft
└─ ChatGPT Chat → single agent

Substantial non-code deliverable with independent workstreams
└─ ChatGPT Work → app model → verified subagent mode

Hard but sequential non-code task
└─ ChatGPT Work → app model → deeper single-agent mode

Code, repository, tests, commands, or implementation
└─ Codex → coding-agent profile

Programmatic application integration
└─ Responses API → optional Multi-agent beta request setup
```

ChatGPT Work/Codex subagents, ChatGPT UI modes, Codex configuration, and
Responses API Multi-agent are related capabilities but not interchangeable
syntax surfaces.

## Adaptive question policy

Prompt Master asks no more than three questions and asks only unresolved,
decision-changing forks:

1. **Surface:** ChatGPT Chat, ChatGPT Work, Codex, or Responses API?
2. **Format:** retain the existing mandatory format question for research/report
   tasks when the result shape is missing.
3. **Highest-impact remaining fork:** whether the task has at least two
   independent bounded workstreams; if that is already evident, ask whether to
   optimize for quality, balance, or speed/cost.

The goal, intended audience, success criteria, sources/tools, and action boundary
should be derived from the user's request when clear. Do not spend a question on
a knob that can be selected safely from an eligible registry default.

With `no questions`, emit `Assumed surface:`, use a portable prompt body, select
only an eligible default for that assumed surface, and list every unresolved
surface/decomposition/optimization fork.

## Model choice

Use registry recommendation roles rather than hardcoded profile prose:

| Work shape | Selection role |
|---|---|
| Ambiguous, difficult, high-value, quality-first, or polished synthesis | frontier |
| Everyday multi-step/tool work with balanced quality and cost | general / balanced |
| Clear repeatable extraction, classification, transformation, or high volume | fast / economy |

Use the lowest verified reasoning level that meets the acceptance criteria.
Escalate only after a representative task fails its quality bar. “Optimal” means
best completed-task result across quality, completeness, evidence, tokens,
latency, cost, retries, and tool calls—not simply the largest model or the fewest
calls.

For agentic coding, apply the separate dated benchmark note in
`docs/gpt_5_6_agentic_coding_routing_2026-07-10.md` as a secondary economy
challenge. It does not override official availability or generalize to ordinary
ChatGPT work.

## Multi-agent gate

Choose subagents only when at least two work packages are independently
executable and bounded. Each package needs a scope, allowed resources, output and
evidence schema, budget/stop condition, and forbidden actions. The coordinator
owns dependency order, conflicts, integration, verification, and the final
answer.

Prefer one agent when:

- each step depends directly on the previous result;
- the task is small;
- workers would contend over shared mutable state;
- one slow external operation dominates the run;
- a fixed deterministic execution graph is required.

Parallelize independent reads, research, comparison, and analysis. Serialize
writes, integration, approvals, and external effects.

## Surface boundaries

### ChatGPT Chat and Work

- Model and UI mode belong in the post-prompt setup note, not the prompt fence.
- Work can use subagent workflows, but ordinary prompt text must not promise
  exact worker count, nesting, or per-worker models without a verified control.
- A hard sequential task uses the verified deeper single-agent mode rather than
  the verified subagent mode.
- API fields and Codex configuration never appear in the ChatGPT prompt.

### Codex

- Route code/repository/tool execution to the coding-agent profile even when the
  client is a ChatGPT desktop surface.
- Use bounded worker packets and coordinator-owned integration.
- Per-agent models/custom agent files are a separate explicit configuration
  artifact, not ordinary prompt content.

### Responses API

- Multi-agent is a beta request capability; prompt wording alone does not enable
  it.
- Its route selects one production model record and attaches the independently
  versioned beta capability record; the beta opt-in is never treated as a model.
- The root and subagents within one request share the selected model and tools.
- Keep beta headers, reasoning, verbosity, state, caching, and tool controls in
  request setup.
- Programmatic Tool Calling remains a separate decision for bounded reduction;
  keep semantic judgment, approvals, and citation/native-artifact preservation
  direct.

## Output contract

Return one paste-ready prompt fence, the normal target line, then at most one
short setup note:

```text
⚙️ Recommended setup: [surface] · [registry model] · [verified mode].
[One fit reason and one measured escalation condition.]
```

Keep it to one or two lines. Omit it when the route is missing, stale, or
unverified.

## v1.35 acceptance

- Separate routes exist for ChatGPT, Codex, OpenAI API, and Responses
  Multi-agent.
- GPT-5.6 tier facts are surface-specific and registry-owned.
- The beta capability cannot be a production default.
- ChatGPT profile text contains no API-only controls.
- Multi-agent requires independent bounded workstreams and has a single-agent
  fallback.
- Model/mode setup stays outside the copyable fence.
- Deterministic tests cover positive and adversarial cases without live model
  execution.

## Official sources

- ChatGPT/Codex models and mode semantics:
  <https://learn.chatgpt.com/docs/models>
- ChatGPT Work and Codex subagents:
  <https://learn.chatgpt.com/docs/agent-configuration/subagents>
- GPT-5.6 API model selection and prompt guidance:
  <https://developers.openai.com/api/docs/guides/latest-model>
- Responses API Multi-agent beta:
  <https://developers.openai.com/api/docs/guides/responses-multi-agent>
