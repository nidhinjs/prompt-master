# Model Facts — compatibility and policy index

This file remains as a compatibility entry point for one release. Volatile model
IDs, routing defaults, channels, availability, sunset dates, exact no-CoT
membership, and version-tied parameters live only in the canonical
[facts registry](facts/index.json).

## Refresh protocol — READ FIRST

1. Resolve the requested tool or provider through `routing` in
   [facts/index.json](facts/index.json).
2. Load only the referenced populated shard and select the record matching the
   requested surface.
3. Before asserting a record, require a valid `last_verified` date and an
   official source whose `supports` list covers the field or claim being used.
4. Re-verify records older than the repository freshness window. If verification
   is unavailable, label the fact `[unverified]` instead of presenting it as
   current.
5. Never infer a provider default. A default exists only when the matching route
   in `index.json` has `default_record_id`.
6. Never use a non-production, limited, unavailable, deprecated, retired, or
   sunset-scheduled record as an implicit production default.
7. Apply exact no-CoT membership only from a record's
   `prompting_constraints`; do not maintain a Markdown model list.

The schema-controlled enums and record shape are documented in
[facts/schema.json](facts/schema.json). Pattern guidance for retired models and
dead parameters remains in [patterns.md](patterns.md).

---

## Anthropic — Claude

Compatibility anchor. Resolve Anthropic and Claude routes through
[the registry index](facts/index.json), then load [anthropic.json](facts/anthropic.json).

## OpenAI — GPT

Compatibility anchor. Resolve OpenAI text, reasoning, image, and video surfaces
through [the registry index](facts/index.json), then load
[openai.json](facts/openai.json).

## Google — Gemini

Compatibility anchor. Resolve Google text, image, and video surfaces through
[the registry index](facts/index.json), then load [google.json](facts/google.json).

## xAI — Grok

Compatibility anchor. Resolve xAI text and generation surfaces through
[the registry index](facts/index.json), then load [xai.json](facts/xai.json).

## DeepSeek

Compatibility anchor. Resolve DeepSeek through
[the registry index](facts/index.json), then load
[deepseek.json](facts/deepseek.json). Do not infer a default when the route has
none.

## MiniMax

Compatibility anchor. The frozen registry has no populated MiniMax shard because
the former claims lacked a current official source. Treat MiniMax-specific facts
as `[unverified]` until a sourced record is admitted; do not guess an ID or
default.

## Alibaba — Qwen

Compatibility anchor. Resolve Alibaba and Qwen through
[the registry index](facts/index.json), then load [alibaba.json](facts/alibaba.json).

## Moonshot AI — Kimi

Compatibility anchor. Resolve Moonshot and Kimi through
[the registry index](facts/index.json), then load
[moonshot-ai.json](facts/moonshot-ai.json).

## Z.AI / BigModel — GLM

Compatibility anchor. Resolve Z.AI, BigModel, GLM, and coding-plan surfaces
through [the registry index](facts/index.json), then load
[zai-bigmodel.json](facts/zai-bigmodel.json).

## Perplexity

Compatibility anchor. Resolve Agent and Sonar surfaces separately through
[the registry index](facts/index.json), then load
[perplexity.json](facts/perplexity.json).

## Gamma

Compatibility anchor. Resolve app and API surfaces through
[the registry index](facts/index.json), then load [gamma.json](facts/gamma.json).

---

## Image AI — model facts

Compatibility anchor. Resolve the named tool through
[the registry index](facts/index.json). Populated image-family shards are listed
only in the index; do not copy their IDs, defaults, status, or parameters here.

## Video AI — model facts

Compatibility anchor. Resolve the named tool through
[the registry index](facts/index.json). Populated video-family shards are listed
only in the index; preview and sunset handling comes from each selected record,
not from Markdown prose.

---

> A provider not inventoried by `facts/index.json` has no verified volatile-fact
> entry. Keep the user's tool name, use evergreen guidance if available, and mark
> provider-specific facts `[unverified]` until an official sourced record is
> admitted.
