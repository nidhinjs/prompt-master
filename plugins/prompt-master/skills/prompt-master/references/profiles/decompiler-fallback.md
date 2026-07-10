# Prompt decompiler and capability-safe fallback

Load this bundle when the user wants to decompile/adapt an existing prompt, when
a target is unnamed or unknown, or when a routed profile/fact cannot be read. It
is self-contained. Preserve credential stripping, the canonical untrusted-data
boundary, narrow tool/network permissions, stop conditions, and human approval
for irreversible or external actions. For full shared policy see
[../../SKILL.md](../../SKILL.md) and [agentic.md](../agentic.md); for prompt
structures see [templates.md](../templates.md).

## Registry boundary

[facts/index.json](../facts/index.json) is the only route/default inventory. Do
not infer an unknown provider from its name or reconstruct a missing profile,
model ID, endpoint, flag, parameter, context limit, tool name, or capability from
memory. A decompiler or genuinely unknown route requires no provider fact
record; retain the explicit `none (evergreen-only)` sentinel from
[tool-profiles.md](../tool-profiles.md). If a named alias exists, read only its
referenced provider shard and apply its prompting constraints.

## Prompt Decompiler Mode

Detect this mode when the user supplies an existing prompt and asks to break it
down, adapt it for another tool, simplify it, or split it. This is distinct from
building a new prompt from scratch.

- Preserve the original goal, inputs, constraints, output contract, safety
  boundary, and intentional tradeoffs before changing syntax.
- Separate stable intent from provider-specific grammar, parameters, tools, and
  unsupported assumptions.
- Explain what each major block does, where blocks conflict or duplicate one
  another, and which behavior could change during adaptation.
- For a target adaptation, resolve the target route/profile/facts first. Never
  carry unsupported source-provider syntax into the target.
- When splitting, define each prompt's input/output handoff and failure/stop
  condition; do not create hidden dependencies.
- Load [templates.md](../templates.md) Template L for the full decompiler shape.

## Unknown tool

First classify the routing state, then build a capability fingerprint from
user-supplied or locally verified evidence.

### Capability fingerprint — all seven fields are required

1. **Modality:** text, code, image, video, audio, 3D, multimodal, or
   `[unverified]`.
2. **Read/write side effects:** output-only, read-only, local writes, external
   actions, or `[unverified]`.
3. **Tool/API/schema support:** verified tools, API surface, structured-output or
   schema support, or `[unverified]`.
4. **Retrieval/freshness:** no retrieval, supplied-context only, verified live
   retrieval and source boundary, or `[unverified]`.
5. **Context/input type:** accepted text, files, and media plus relevant verified
   limits, or `[unverified]`.
6. **Output constraints:** verified format, length, syntax, and parameter surface,
   or `[unverified]`.
7. **Risk/approval tier:** read, draft, local write, external, or destructive
   action plus its approval boundary; use `[unverified]` for unclear authority or
   side effects.

Never turn a neighboring provider profile into defaults for the unknown tool.
Every unsupported capability claim remains `[unverified]`.

## Route the three states distinctly

- **Targetless request:** if questions are allowed, ask the single most
  decision-changing question, normally “Which tool or runtime will receive this
  prompt?”, and count it against the global question cap. Do not silently map a
  task category to a named product.
- **Named unknown tool:** retain the user's name, complete the fingerprint, and
  route by verified capabilities rather than name similarity. If one missing
  field changes the prompt materially and a question remains, ask only that one.
- **Missing/unreadable reference:** do not recreate it or claim its rules were
  loaded. Use the minimal capability-safe prompt below and identify the missing
  reference.

## No-question / unresolved fallback

Choose the conservative closest category using only verified fingerprint fields.
Default unknown side effects to output-only/read-only, network and external
actions to disabled, and provider syntax/structured output to plain text.
Outside the prompt block emit:

`Assumed target tool: [name or closest category] — [unverified]`

Then list unresolved fingerprint fields as explicit `[unverified]` capability
assumptions. Use this path when the user says no questions, the question budget
is spent, or the single question is unanswered.

## Minimal capability-safe prompt for a missing reference

Include only the verified task, supplied inputs, generic output shape, explicit
scope, and acceptance criteria. Do not add provider-specific syntax or
capabilities. Preserve credential stripping, untrusted-data boundaries, narrow
tool/network permissions, stop conditions, and approval for irreversible or
high-risk actions. In the note, label the reference unavailable and enumerate
every capability assumption that could not be verified.
