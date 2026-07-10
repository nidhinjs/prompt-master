# Local and open-weight text profiles

Load this bundle only when [tool-profiles.md](../tool-profiles.md) routes here.
It is self-contained: preserve the user's task, supplied inputs, constraints,
output contract, and approval boundaries. For an agentic request also load
[agentic.md](../agentic.md); for a prompt structure use only the relevant
section of [templates.md](../templates.md).

## Registry boundary

Resolve the route alias in [facts/index.json](../facts/index.json) and read only
the referenced provider shard before naming a model. The registry alone owns
model IDs, defaults, release channels, availability, retirement dates, context
limits, and parameter values. If a selected record has `no_cot`, request only
the result or careful analysis, never hidden reasoning or a chain-of-thought
transcript. If the route, record, or shard is missing, switch to
[decompiler-fallback.md](decompiler-fallback.md) and mark unknown capabilities
`[unverified]`.

## Ollama (local model deployment)

- Determine the actually loaded model from user-supplied or locally verified
  runtime evidence before writing a provider-specific prompt. Do not infer it
  from the launcher alone.
- Include the system prompt as a separately labelled output so it can be placed
  in the local runtime configuration.
- Prefer short, flat instructions; deep nesting and long rule stacks are fragile
  across smaller local models.
- Put deterministic/creative sampling guidance in a setup note, but obtain exact
  values and supported controls from the selected registry record or local
  runtime, not from this profile.
- For coding, resolve a coding-capable record through the registry instead of
  assuming the general model is suitable.

## Llama / Mistral / open-weight LLMs

- Use a short prompt with a simple role, one clear task, explicit inputs, and a
  labelled output format.
- Avoid multi-level hierarchies and competing instruction blocks.
- Be more explicit about completion criteria and exclusions than with stronger
  hosted instruction followers.
- Prefer one or two verified examples over a broad few-shot suite; remove any
  example that is not tightly aligned.
- Never assume tools, retrieval, schema support, context size, or sampling
  controls. Verify them from the registry and the user's local harness.

## Local capability check

Before finalizing the prompt, establish:

1. loaded model record or `[unverified]`;
2. system/user role support;
3. tool and structured-output support;
4. accepted context and file/media inputs;
5. writable or external side effects;
6. available verification command;
7. user approval boundary.

Unverified side effects default to output-only/read-only, network disabled, and
plain-text output. Do not invent flags, endpoints, Modelfile directives, or
context limits.
