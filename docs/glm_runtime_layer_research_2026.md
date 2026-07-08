# GLM runtime layer research (только источники 2026)

## Краткое резюме

Облачная документация Z.ai/BigModel в 2026 году описывает **модельный реестр и endpoint-level маршрутизацию**, но не раскрывает полноценную внутреннюю routing table между GLM-4.6, GLM-5.x и GLM-Z1; единственное явное правило auto-routing найдено в BigModel Model Overview: после deprecation некоторых моделей платформа «автоматически маршрутизирует» их к новым моделям, но для `GLM-Z1系列` указано `-` в целевой модели ([BigModel Model Overview](https://docs.bigmodel.cn/cn/guide/start/model-overview)).

Самый практичный runtime routing в 2026 источниках находится на уровне **client/profile configuration**: ZCode автоматически маршрутизирует запросы при account-bound Coding Plan authorization, а при API-key mode требует использовать coding-only endpoint `/api/coding/paas/v4` вместо general endpoint `/api/paas/v4` ([ZCode configuration](https://zcode.z.ai/en/docs/configuration)).

GLM Coding Plan в 2026 документации выступает как runtime/developer profile: он поддерживает GLM-5.2, GLM-5-Turbo и GLM-4.7, задаёт 5-hour/weekly quota tiers Lite/Pro/Max и рекомендует GLM-5.2 для сложных задач, а GLM-4.7 — для routine tasks во избежание быстрого расхода квоты ([Z.ai DevPack overview](https://docs.z.ai/devpack/overview)).

По model facts наиболее полные 2026 первичные источники подтверждают: GLM-5/5.1/5.2 имеют 744B total / 40B active в open-weight README, GLM-5.2 имеет 1M context и 128K max output, а GLM-4.6 имеет 355B total / 32B active, 200K context и 128K max output ([zai-org/GLM-5 README](https://github.com/zai-org/GLM-5), [Z.ai GLM-5.2 docs](https://docs.z.ai/guides/llm/glm-5.2), [BigModel GLM-4.6 docs](https://docs.bigmodel.cn/cn/guide/models/text/glm-4.6)).

Главные gotchas 2026: `tool_stream=true` требует одновременно `stream=true` и streaming-concatenation `delta.tool_calls[*].function.arguments`, preserved thinking требует возвращать полный неизменённый `reasoning_content`, а JSON mode требует явно просить JSON в prompt, иначе формальная гарантия ниже ([BigModel GLM-4.6 migration](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6), [Z.ai Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode), [Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion)).

Официальные GitHub runtime README/manifest материалы 2026 существуют в `zai-org/GLM-5`, `zai-org/GLM-4.5`, `zai-org/GLM-V` и `zai-org/GLM-skills`; они содержат deployment flags для vLLM/SGLang, parser settings, GLM skills manifests и benchmarks, но почти не содержат regression/smoke tests для cloud API routing/profile semantics ([zai-org/GLM-5](https://github.com/zai-org/GLM-5), [zai-org/GLM-4.5](https://github.com/zai-org/GLM-4.5), [zai-org/GLM-V](https://github.com/zai-org/GLM-V), [zai-org/GLM-skills](https://github.com/zai-org/GLM-skills)).

## Раздел 1. Routing row (2026)

| Найденный routing artifact | Что именно маршрутизируется | Runtime правило / конфигурация | Покрытие и ограничения | Источник |
|---|---|---|---|---|
| BigModel deprecation auto-routing | Deprecated model codes | BigModel пишет, что после deprecation объявленных моделей платформа «автоматически маршрутизирует» их к новым моделям; в таблице `GLM-Z1系列` имеет deprecation date `2025年11月15日`, но target model указан как `-`, поэтому replacement route не подтверждён | Это единственная найденная cloud-side auto-routing строка; она не даёт правил fallback между GLM-4.6, GLM-5.x и GLM-Z1 | [BigModel Model Overview](https://docs.bigmodel.cn/cn/guide/start/model-overview) |
| ZCode account-bound routing | ZCode → Z.ai/BigModel account plan | При `Continue with Z.ai` или `Continue with BigModel` ZCode открывает authorization flow, binds account и при Coding Plan authorization routes requests automatically without manual setup | Это client/application routing, а не внутренняя routing table Z.ai gateway | [ZCode configuration](https://zcode.z.ai/en/docs/configuration) |
| Coding Plan endpoint routing | Coding Plan API calls vs general API calls | Для Coding Plan `OpenAI Base URL` должен быть coding-only endpoint `https://api.z.ai/api/coding/paas/v4` или `https://open.bigmodel.cn/api/coding/paas/v4`; general endpoints `https://api.z.ai/api/paas/v4` и `https://open.bigmodel.cn/api/paas/v4` explicitly marked not interchangeable | Это endpoint-level routing/profile separation; source не раскрывает backend load-balancer или fallback routing | [ZCode configuration](https://zcode.z.ai/en/docs/configuration) |
| Model selector / provider response | ZCode available channels | ZCode Model Settings manages model channels; available models depend on account permissions and provider response, and users can add other available models manually | Это provider/channel discovery; не найдено explicit routing priority/fallback rule | [ZCode configuration](https://zcode.z.ai/en/docs/configuration) |
| Local prefill/decode routing | Self-hosted GLM-4.5/4.7 SGLang | GLM-4.5 README shows `sglang_router.launch_router --pd-disaggregation --prefill http://127.0.0.1:30000 --decode http://127.0.0.1:30001`, separating prefill and decode endpoints | This is local serving routing, not Z.ai/bigmodel cloud routing | [zai-org/GLM-4.5 README](https://github.com/zai-org/GLM-4.5) |

Вывод: в 2026 первичных источниках есть endpoint/profile routing и local serving router examples, но не найден cloud gateway model routing table с priority/fallback между `glm-4.6`, `glm-5.2`, `glm-z1-air` и визуальными моделями ([BigModel Model Overview](https://docs.bigmodel.cn/cn/guide/start/model-overview), [ZCode configuration](https://zcode.z.ai/en/docs/configuration), [zai-org/GLM-4.5 README](https://github.com/zai-org/GLM-4.5)).

## Раздел 2. Profile (2026)

| Profile / runtime persona | Найденная конфигурация | Runtime impact | Источник |
|---|---|---|---|
| GLM Coding Plan profile | Plans Lite/Pro/Max, all supporting GLM-5.2, GLM-5-Turbo and GLM-4.7 | Applies 5-hour and weekly quotas, estimates one prompt as 15–20 model calls, and ties MCP access to plan quota | [Z.ai DevPack overview](https://docs.z.ai/devpack/overview) |
| Peak/off-peak model profile | GLM-5.2 and GLM-5-Turbo consume `3×` quota in peak hours and `2×` off-peak, with a limited-time 1× off-peak benefit through September | Runtime model choice is quota-sensitive; docs recommend GLM-5.2 for complex tasks and GLM-4.7 for routine tasks | [Z.ai DevPack overview](https://docs.z.ai/devpack/overview) |
| Claude Code GLM-5.2 profile | `ANTHROPIC_DEFAULT_SONNET_MODEL` and `ANTHROPIC_DEFAULT_OPUS_MODEL` can be set to `glm-5.2[1m]`, with `CLAUDE_CODE_AUTO_COMPACT_WINDOW=1000000` | `[1m]` suffix enables 1M context in Claude Code profile; `/effort` maps low/medium/high to GLM `high` and xhigh/max/ultracode to GLM `max` | [Z.ai latest-model guide](https://docs.z.ai/devpack/latest-model) |
| Cline/OpenAI-compatible profile | Base URL `https://api.z.ai/api/coding/paas/v4`, custom model `glm-5.2`, context window `1000000`, and Support Images unchecked | Provides a concrete non-Claude coding-agent runtime profile for GLM-5.2 | [Z.ai latest-model guide](https://docs.z.ai/devpack/latest-model) |
| ZCode provider profile | `Continue with Z.ai`, `Continue with BigModel`, or `Use API Key`; Model Settings manages provider channels and model availability | Chooses account-bound plan routing vs API-key routing, and separates Anthropic-compatible and OpenAI-compatible base URLs | [ZCode configuration](https://zcode.z.ai/en/docs/configuration) |
| GLM skills manifests | `SKILL.md` files declare skill name, metadata, env requirements, and source links; most downstream skills require `ZHIPU_API_KEY` | Skills are agent runtime manifests for GLM-V/OCR/Image workflows rather than model routing rules | [zai-org/GLM-skills README](https://github.com/zai-org/GLM-skills), [glm-master-skill manifest](https://github.com/zai-org/GLM-skills/tree/main/skills/glm-master-skill) |

## Раздел 3. Model facts (2026)

| Модель | Параметры/размер | Контекст | Max output | Модальности | thinking/tool/stream | Источник |
|---|---:|---:|---:|---|---|---|
| GLM-4.6 | 355B total / 32B active | 200K | 128K | Text → Text | Supports deep thinking, tool use, streaming output and `tool_stream` in GLM-4.6 migration docs | [BigModel GLM-4.6 docs](https://docs.bigmodel.cn/cn/guide/models/text/glm-4.6), [BigModel GLM-4.6 migration](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6) |
| GLM-4.5V | 106B total / 12B active | [uncertain / no 2026 source] | 16K | Video / Image / Text / File → Text | Has Thinking Mode switch; API reference says GLM-4.5V max output 16K, supports streaming and may output `<think>` and box tags | [Z.ai GLM-4.5V docs](https://docs.z.ai/guides/vlm/glm-4.5v), [Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion) |
| GLM-4.6V | GLM-4.6V 106B; GLM-4.6V-Flash 9B | 128K | 32K | Video / Image / Text / File → Text | Native multimodal function calling; API reference says tools are supported only by GLM-4.6V series and AutoGLM-Phone-Multilingual among vision requests | [Z.ai GLM-4.6V docs](https://docs.z.ai/guides/vlm/glm-4.6v), [zai-org/GLM-V README](https://github.com/zai-org/GLM-V), [Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion) |
| GLM-4-Plus | Parameter count not disclosed in fetched 2026 source | 128K | 4K | Text → Text | GLM-4 family supports streaming output, function call, context caching, structured output and MCP | [BigModel GLM-4 docs](https://docs.bigmodel.cn/cn/guide/models/text/glm-4) |
| GLM-Z1-Air | Parameter count not disclosed in fetched 2026 source | 128K | 32K | Text → Text | Built-in deep thinking by default; MCP integration supported | [BigModel GLM-Z1 docs](https://docs.bigmodel.cn/cn/guide/models/text/glm-z1) |
| GLM-Z1-AirX | Parameter count not disclosed in fetched 2026 source | 32K | 30K | Text → Text | Built-in deep thinking by default; described as high-speed reasoning model | [BigModel GLM-Z1 docs](https://docs.bigmodel.cn/cn/guide/models/text/glm-z1) |
| GLM-Z1-FlashX | Parameter count not disclosed in fetched 2026 source | 128K | 32K | Text → Text | Built-in deep thinking by default; MCP integration supported | [BigModel GLM-Z1 docs](https://docs.bigmodel.cn/cn/guide/models/text/glm-z1) |
| GLM-Z1-Flash | Parameter count not disclosed in fetched 2026 source | 128K in GLM-Z1 family table; standalone page confirms built-in deep thinking but omits context table | 32K in GLM-Z1 family table | Text → Text | First permanently free reasoning model in BigModel docs; built-in deep thinking and MCP support | [BigModel GLM-Z1 docs](https://docs.bigmodel.cn/cn/guide/models/text/glm-z1), [BigModel GLM-Z1-Flash docs](https://docs.bigmodel.cn/cn/guide/models/free/glm-z1-flash) |
| GLM-5 | 744B total / 40B active | 200K | 128K | Text → Text | Thinking Mode, streaming output, tool calling, context caching and structured output are shown in model cards/API; README notes `reasoning_effort` and `enable_thinking=false` for local/runtime control | [Z.ai GLM-5 docs](https://docs.z.ai/guides/llm/glm-5), [zai-org/GLM-5 README](https://github.com/zai-org/GLM-5), [Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion) |
| GLM-5.1 | 744B total / 40B active | 200K | 128K | Text → Text | Thinking, MCP, streaming and tools are supported via GLM-5.x API/reference model family | [Z.ai GLM-5.1 docs](https://docs.z.ai/guides/llm/glm-5.1), [zai-org/GLM-5 README](https://github.com/zai-org/GLM-5) |
| GLM-5.2 | 744B total / 40B active | 1M | 128K | Text → Text | Supports `reasoning_effort` with `max` default and `high` option; supports MCP, streaming, tool calling and structured output | [Z.ai GLM-5.2 docs](https://docs.z.ai/guides/llm/glm-5.2), [zai-org/GLM-5 README](https://github.com/zai-org/GLM-5), [Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion) |
| GLM-5-Turbo | Parameter count not disclosed in fetched 2026 source | 200K | 128K | Text → Text | Optimized for OpenClaw tool invocation, command following, timed/persistent tasks and long-chain execution | [Z.ai GLM-5-Turbo docs](https://docs.z.ai/guides/llm/glm-5-turbo) |

API parameter facts common to the 2026 Chat Completion reference: text models enumerate `glm-5.2`, `glm-5.1`, `glm-5-turbo`, `glm-5`, `glm-4.7`, `glm-4.6`, GLM-4.5 variants and `glm-4-32b-0414-128k`; vision models enumerate `glm-5v-turbo`, `glm-4.6v`, `glm-4.6v-flash`, `glm-4.6v-flashx` and `glm-4.5v` ([Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion)).

The same API reference documents `temperature`, `top_p`, `max_tokens`, `stream`, `thinking`, `reasoning_effort`, `tool_stream`, `tools`, `tool_choice`, `stop`, `response_format`, `request_id` and `user_id`, with `reasoning_effort` supported only by GLM-5.2 and mapping `none/minimal` to no thinking, `low/medium` to `high`, and `xhigh` to `max` ([Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion)).

Vision input limits in the 2026 API reference are runtime-relevant: images must be under 5MB each and no more than 6000×6000 pixels; GLM-5V/GLM-4.6V series support up to 150 images, GLM-4.5V up to 50 images, videos are limited to 200MB with GLM-5V/GLM-4.6V up to 2 videos and GLM-4.5V up to 1 video, and file URL input supports `pdf`, `txt`, `word`, `jsonl`, `xlsx`, `pptx` up to 50 files ([Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion)).

## Раздел 4. Gotchas (2026, top-12)

1. `tool_stream=true` is not sufficient by itself: migration docs require both `stream=True` and `tool_stream=True`, and clients must concatenate streamed `delta.tool_calls[*].function.arguments` chunks to reconstruct tool arguments ([BigModel GLM-4.6 migration](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6)).

2. Streaming clients must separately handle `delta.reasoning_content`, `delta.content` and `delta.tool_calls`, because GLM streaming examples collect reasoning, visible content and tool calls into different buffers ([BigModel GLM-4.6 migration](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6), [Z.ai GLM-5.2 migration](https://docs.z.ai/guides/overview/migrate-to-glm-new)).

3. Preserved Thinking is enabled by default on the Coding Plan endpoint but disabled by default on the standard API endpoint; enabling it on standard API requires `clear_thinking=false` and forwarding the complete unmodified historical `reasoning_content` ([Z.ai Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode)).

4. Historical `reasoning_content` blocks must exactly match the original sequence; missing, truncated, rewritten or reordered blocks may degrade performance, affect cache hits, or prevent preserved thinking from taking effect ([Z.ai Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode), [Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion)).

5. GLM-5.2 `reasoning_effort` default is `max`, not `high`; the API reference says `low` and `medium` are mapped to `high`, `xhigh` maps to `max`, and `none`/`minimal` skip thinking for compatibility ([Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion)).

6. Thinking defaults differ by model family: Thinking Mode docs say thinking is activated by default in GLM-5.2, GLM-5.1, GLM-5 and GLM-4.7 series, while GLM-4.6 has default hybrid thinking ([Z.ai Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode)).

7. The Chat Completion schema states GLM-4.7 and GLM-4.5V think compulsorily when thinking is enabled, while GLM-5.2/5.1/5/5-Turbo/5V-Turbo/4.6/4.5 automatically determine whether to think ([Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion)).

8. JSON mode does not remove the need for prompt/schema discipline: the API recommends clearly requesting JSON in the prompt, and the Structured Output guide shows explicit JSON schema validation and catches both validation errors and JSON parsing errors ([Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion), [Z.ai Structured Output](https://docs.z.ai/guides/capabilities/struct-output)).

9. GLM-4.6 migration docs warn not to tune `temperature` and `top_p` simultaneously, recommending choosing one sampling control because defaults changed to `temperature=1.0` and `top_p=0.95` ([BigModel GLM-4.6 migration](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6)).

10. ZCode warns that Coding Plan endpoints and general endpoints are not interchangeable; using `/api/paas/v4` instead of `/api/coding/paas/v4` changes the billing/routing semantics and may not use the Coding Plan route ([ZCode configuration](https://zcode.z.ai/en/docs/configuration)).

11. In multimodal inputs, `file_url` cannot be passed together with `image_url` or `video_url` in the same content item, and vision models have strict image/video/file count and size limits ([Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion)).

12. Rate-limit behavior includes concurrency-based limits and plan/usage-specific 429 error codes such as `1302` rate limit reached, `1305` temporary overload, `1308` usage limit reset time, `1309` expired GLM Coding Plan, `1311` plan lacking access to a model, and `1313` fair-usage restriction ([Z.ai Errors](https://docs.z.ai/api-reference/api-code), [Z.ai rate limits page](https://z.ai/manage-apikey/rate-limits)).

## Раздел 5. README/manifest упоминания (2026, top-10)

1. `zai-org/GLM-5` was created in 2026, updated/pushed in July 2026, and its README explicitly lists GLM-5.2/5.1/5 model sizes as `744B-A40B`, GLM-5.2 as solid 1M context, and local serving support via SGLang, vLLM, KTransformers and Unsloth ([zai-org/GLM-5](https://github.com/zai-org/GLM-5), [GLM-5 latest commit](https://github.com/zai-org/GLM-5/commit/6fb14405ae16a6fb22cb832e851629c24d59acd3)).

2. `zai-org/GLM-5` README documents GLM-5 runtime control: `reasoning_effort` accepts `max` and `high`, `max` is default, and thinking can be turned off with `enable_thinking=false` ([zai-org/GLM-5](https://github.com/zai-org/GLM-5)).

3. `zai-org/GLM-4.5` was pushed in 2026 and its README covers GLM-4.7/4.6/4.5, including GLM-4.6’s 200K context, GLM-4.5’s `355B-A32B`, GLM-4.5-Air’s `106B-A12B`, and deployment parser flags `--tool-call-parser glm47` / `--reasoning-parser glm45` for GLM-4.7 ([zai-org/GLM-4.5](https://github.com/zai-org/GLM-4.5), [GLM-4.5 2026 commit](https://github.com/zai-org/GLM-4.5/commit/170f20b2c10659008fdbc909d478bc2a75bc3627)).

4. `zai-org/GLM-4.5` README includes a local routing example for PD-Disaggregation using `sglang_router.launch_router --pd-disaggregation --prefill ... --decode ...`, which is runtime routing between prefill and decode workers rather than Z.ai cloud routing ([zai-org/GLM-4.5](https://github.com/zai-org/GLM-4.5)).

5. `zai-org/GLM-4.5` README points to `resources/glm_4.6_tir_guide.md` for tool-integrated reasoning and `resources/trajectory_search.json` as a search toolcall thinking-mode template, providing eval/workflow fixtures but not full regression tests ([zai-org/GLM-4.5](https://github.com/zai-org/GLM-4.5)).

6. `zai-org/GLM-V` was pushed in 2026 and its README covers GLM-4.6V/4.5V/4.1V-Thinking, native multimodal function calling, vLLM/SGLang parser flags `glm45`, and a thinking budget logit processor example with `thinking_budget: 8192` ([zai-org/GLM-V](https://github.com/zai-org/GLM-V), [GLM-V 2026 commit](https://github.com/zai-org/GLM-V/commit/b0467612bbc445cc8f3270fa4cb4ffccf77d951b)).

7. `zai-org/GLM-V` README lists GLM-4.6V variants and states GLM-4.6V is 106B while GLM-4.6V-Flash is 9B, with 128K training context and native Function Calling ([zai-org/GLM-V](https://github.com/zai-org/GLM-V)).

8. `zai-org/GLM-V` README notes 2026 releases of GLM-V related Skills and links to the skills directory, tying multimodal runtime workflows to agent skill manifests ([zai-org/GLM-V](https://github.com/zai-org/GLM-V)).

9. `zai-org/GLM-skills` was created in March 2026 and describes itself as official skills for GLM family models designed for Claude Code, OpenCode, OpenClaw, AutoClaw and other AI coding agents ([zai-org/GLM-skills](https://github.com/zai-org/GLM-skills)).

10. `GLM-skills` `SKILL.md` manifests include metadata such as `name`, `description`, `metadata.openclaw.requires`, `source` and `homepage`, and the master skill states that most downstream skills require `ZHIPU_API_KEY` while the master skill itself is documentation-only and does not run subprocesses ([glm-master-skill manifest](https://github.com/zai-org/GLM-skills/tree/main/skills/glm-master-skill)).

THUDM legacy repos checked in this pass (`THUDM/GLM`, `THUDM/ChatGLM-6B`, `THUDM/CogVideo`) have 2026 GitHub `updated_at` activity, but their latest commits are 2023, 2024 and 2025 respectively, so they are not treated as 2026 runtime evidence except as historical gap indicators ([THUDM/GLM](https://github.com/THUDM/GLM), [THUDM/ChatGLM-6B](https://github.com/THUDM/ChatGLM-6B), [THUDM/CogVideo](https://github.com/THUDM/CogVideo)).

## Раздел 6. Regression coverage (2026)

| Repo / docs | Found coverage artifact | Covers runtime aspect | Does not cover | 2026 freshness | Source |
|---|---|---|---|---|---|
| `zai-org/GLM-5` | Benchmark images and README deployment instructions; no test files found in shallow clone | Model facts, local serving framework support, reasoning effort config | No regression/smoke tests for cloud routing, profile endpoints, API gotchas, streaming JSON/tool correctness | Repo created 2026-02-09; latest commit 2026-07-07 | [zai-org/GLM-5](https://github.com/zai-org/GLM-5), [GLM-5 latest commit](https://github.com/zai-org/GLM-5/commit/6fb14405ae16a6fb22cb832e851629c24d59acd3) |
| `zai-org/GLM-4.5` | `inference/api_request.py`, benchmark images, `resources/trajectory_search.json`, tool-integrated reasoning guide | Local API invocation examples, search-tool template, parser flags, local PD routing example | No CI workflow or regression suite found for streaming tool assembly or preserved thinking | Latest 2026 commit 2026-02-01 | [zai-org/GLM-4.5](https://github.com/zai-org/GLM-4.5), [GLM-4.5 2026 commit](https://github.com/zai-org/GLM-4.5/commit/170f20b2c10659008fdbc909d478bc2a75bc3627) |
| `zai-org/GLM-V` | `glmv_reward/tests/*` unit tests across chart, cogagent, counting, general, OCR, STEM, VQA; `inference/trans_infer_bench.py`; skill scripts | VLM reward/verifier behavior and academic reproduction for GLM-4.1V-Thinking; multimodal skills | Does not validate Z.ai cloud API routing/profile or GLM-4.6V hosted streaming/tool API edge cases | Latest 2026 commit 2026-05-16 | [zai-org/GLM-V](https://github.com/zai-org/GLM-V), [GLM-V 2026 commit](https://github.com/zai-org/GLM-V/commit/b0467612bbc445cc8f3270fa4cb4ffccf77d951b) |
| `zai-org/GLM-skills` | `SKILL.md` manifests and scripts under individual skills | Agent skill packaging, environment requirements, source links, task-specific runtime wrappers | No automated regression suite found in shallow clone; no routing/profile/model-card validation | Repo created 2026-03-30; pushed 2026-04-15 | [zai-org/GLM-skills](https://github.com/zai-org/GLM-skills) |
| Official migration docs | GLM-4.6 and GLM-5.2 migration checklists explicitly tell developers to run use-case testing/regression after migration | Manual regression checklist for randomness, latency, tool-stream parameter completeness | No executable test harness or CI config in docs | BigModel migration page published 2026-07-08; Z.ai migration page last-updated 2026-07-07 | [BigModel GLM-4.6 migration](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6), [Z.ai GLM-5.2 migration](https://docs.z.ai/guides/overview/migrate-to-glm-new) |
| Legacy THUDM repos | `THUDM/GLM` contains `run_test.py`, `mpu/tests/*`, evaluation scripts; however latest commit is 2023 | Historical GLM test/eval harness | Not 2026 GLM runtime layer evidence under freshness constraint | No 2026 commit found | [THUDM/GLM](https://github.com/THUDM/GLM) |

Coverage conclusion: 2026 official repos cover **local deployment flags, model facts, multimodal reward/verifier tests and benchmark/eval artifacts**, but there is no found 2026 official regression suite that directly asserts cloud routing rows, Coding Plan vs general endpoint behavior, preserved-thinking replay invariants, `tool_stream` chunk reconstruction, or JSON mode failure cases ([zai-org/GLM-5](https://github.com/zai-org/GLM-5), [zai-org/GLM-4.5](https://github.com/zai-org/GLM-4.5), [zai-org/GLM-V](https://github.com/zai-org/GLM-V), [BigModel GLM-4.6 migration](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6)).

## Раздел 7. Пробелы в данных и уверенность

### 7.1 Что не удалось подтвердить 2026 источником

| Запрошенный аспект | Статус | Gap / confidence |
|---|---|---|
| Routing row cloud gateway table | Не подтверждено | Не найдено 2026 primary source с internal Z.ai/bigmodel load-balancer table, fallback priority или model-routing rules между GLM-4.6, GLM-5.x, GLM-Z1 и VLM; подтверждены только endpoint/profile routing, deprecation auto-routing and local SGLang routing examples ([BigModel Model Overview](https://docs.bigmodel.cn/cn/guide/start/model-overview), [ZCode configuration](https://zcode.z.ai/en/docs/configuration), [zai-org/GLM-4.5 README](https://github.com/zai-org/GLM-4.5)) |
| Profile | Частично подтверждено | Подтверждены Coding Plan, ZCode provider/API-key profiles, Claude Code/Cline switching profiles and GLM skills manifests; не найден единый `runtime profile` schema для всех SDK/agents ([Z.ai DevPack overview](https://docs.z.ai/devpack/overview), [Z.ai latest-model guide](https://docs.z.ai/devpack/latest-model), [ZCode configuration](https://zcode.z.ai/en/docs/configuration), [zai-org/GLM-skills](https://github.com/zai-org/GLM-skills)) |
| Model facts | Подтверждено с gaps | Контекст/max output/модальности подтверждены для большинства listed models; exact params не раскрыты в 2026 sources для GLM-4-Plus, GLM-Z1 hosted variants and GLM-5-Turbo; GLM-4.5V context not confirmed in fetched 2026 source ([BigModel GLM-4 docs](https://docs.bigmodel.cn/cn/guide/models/text/glm-4), [BigModel GLM-Z1 docs](https://docs.bigmodel.cn/cn/guide/models/text/glm-z1), [Z.ai GLM-5-Turbo docs](https://docs.z.ai/guides/llm/glm-5-turbo), [Z.ai GLM-4.5V docs](https://docs.z.ai/guides/vlm/glm-4.5v)) |
| Gotchas | Подтверждено | Strong confidence for thinking preservation, `tool_stream`, JSON mode, API parameter and multimodal limits because they appear in official docs/API reference; no official “known issues” page beyond migration and capability docs found ([Z.ai Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode), [Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion), [BigModel GLM-4.6 migration](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6)) |
| README/manifest mentions | Подтверждено для zai-org, слабее для THUDM | Strong 2026 evidence for `zai-org/GLM-5`, `GLM-4.5`, `GLM-V`, `GLM-skills`; THUDM legacy repos had no 2026 commits in checked repos, so runtime claims from them were not used as 2026 evidence ([zai-org/GLM-5](https://github.com/zai-org/GLM-5), [zai-org/GLM-4.5](https://github.com/zai-org/GLM-4.5), [zai-org/GLM-V](https://github.com/zai-org/GLM-V), [zai-org/GLM-skills](https://github.com/zai-org/GLM-skills)) |
| Regression coverage | Частично подтверждено | Found GLM-V tests and benchmark/eval artifacts; no 2026 official CI workflow or regression suite was found for routing/profile/API gotchas in shallow repo inspection ([zai-org/GLM-V](https://github.com/zai-org/GLM-V), [zai-org/GLM-4.5](https://github.com/zai-org/GLM-4.5), [zai-org/GLM-5](https://github.com/zai-org/GLM-5)) |

### 7.2 Уровень уверенности по ключевым утверждениям

| Key claim | Confidence | Rationale |
|---|---|---|
| GLM-5.2 context is 1M and max output is 128K | High | Confirmed in Z.ai GLM-5.2 model page and model overview tables ([Z.ai GLM-5.2 docs](https://docs.z.ai/guides/llm/glm-5.2), [BigModel Model Overview](https://docs.bigmodel.cn/cn/guide/start/model-overview)) |
| GLM-5/5.1/5.2 model size is 744B-A40B | High | Confirmed in official zai-org/GLM-5 README with 2026 repo freshness ([zai-org/GLM-5](https://github.com/zai-org/GLM-5)) |
| GLM-4.6 size/context/output is 355B-A32B/200K/128K | High | Confirmed by BigModel GLM-4.6 docs and zai-org/GLM-4.5 README ([BigModel GLM-4.6 docs](https://docs.bigmodel.cn/cn/guide/models/text/glm-4.6), [zai-org/GLM-4.5](https://github.com/zai-org/GLM-4.5)) |
| GLM-4.6V is 106B and GLM-4.6V-Flash is 9B | Medium-high | Confirmed in zai-org/GLM-V README; Z.ai model page confirms 128K context and native function calling but not size in fetched page ([zai-org/GLM-V](https://github.com/zai-org/GLM-V), [Z.ai GLM-4.6V docs](https://docs.z.ai/guides/vlm/glm-4.6v)) |
| Z.ai has no public 2026 cloud routing/fallback table | Medium | Based on broad official-doc and repo search; absence cannot be proven, but no opened 2026 source disclosed such a table ([Z.ai docs index](https://docs.z.ai/llms.txt), [BigModel docs index](https://docs.bigmodel.cn/llms.txt)) |
| `tool_stream` requires `stream=True` and argument chunk concatenation | High | Confirmed in BigModel GLM-4.6 and Z.ai GLM-5.2 migration docs plus API reference support flag ([BigModel GLM-4.6 migration](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6), [Z.ai GLM-5.2 migration](https://docs.z.ai/guides/overview/migrate-to-glm-new), [Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion)) |
| Preserved thinking requires exact historical `reasoning_content` replay | High | Confirmed by Thinking Mode guide and `clear_thinking` schema description ([Z.ai Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode), [Z.ai Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion)) |

### 7.3 Sources list (2026 only; title · URL · publication/last-updated date)

1. New Released - Z.AI Developer Document · https://docs.z.ai/release-notes/new-released · publication date 2026-06-18.
2. GLM-4.6 - Z.AI Developer Document · https://docs.z.ai/guides/llm/glm-4.6 · publication date 2026-06-25.
3. GLM-4.6 - 智谱AI开放文档 · https://docs.bigmodel.cn/cn/guide/models/text/glm-4.6 · publication date 2026-07-08.
4. 迁移至 GLM-4.6 - 智谱AI开放文档 · https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6 · publication date 2026-07-08.
5. GLM-5 - Z.AI Developer Document · https://docs.z.ai/guides/llm/glm-5 · publication date 2026-06-25.
6. GLM-5.1 - Z.AI Developer Document · https://docs.z.ai/guides/llm/glm-5.1 · publication date 2026-06-25.
7. GLM-5.2 - Z.AI Developer Document · https://docs.z.ai/guides/llm/glm-5.2 · publication date 2026-06-30.
8. GLM-5-Turbo - Z.AI Developer Document · https://docs.z.ai/guides/llm/glm-5-turbo · publication date 2026-06-25.
9. GLM-4.5V - Z.AI Developer Document · https://docs.z.ai/guides/vlm/glm-4.5v · publication date 2026-06-25.
10. GLM-4.6V - Z.AI Developer Document · https://docs.z.ai/guides/vlm/glm-4.6v · publication date 2026-06-25.
11. Chat Completion - Z.AI API Reference · https://docs.z.ai/api-reference/llm/chat-completion · last-updated 2026-07-07.
12. Thinking Mode - Z.AI Developer Document · https://docs.z.ai/guides/capabilities/thinking-mode · last-updated 2026-07-01.
13. Structured Output - Z.AI Developer Document · https://docs.z.ai/guides/capabilities/struct-output · last-updated 2026-07-07.
14. Migrate to GLM-5.2 - Z.AI Developer Document · https://docs.z.ai/guides/overview/migrate-to-glm-new · last-updated 2026-07-07.
15. DevPack Overview - Z.AI Developer Document · https://docs.z.ai/devpack/overview · publication date 2026-06-30.
16. How to Switch Models - Z.AI Developer Document · https://docs.z.ai/devpack/latest-model · last-updated 2026-07-07.
17. ZCode Connect Models & Plans · https://zcode.z.ai/en/docs/configuration · last-updated 2026-07-07.
18. 模型概览 - 智谱AI开放文档 · https://docs.bigmodel.cn/cn/guide/start/model-overview · publication date 2026-07-08.
19. GLM-Z1 - 智谱AI开放文档 · https://docs.bigmodel.cn/cn/guide/models/text/glm-z1 · publication date 2026-07-08.
20. GLM-Z1-Flash - 智谱AI开放文档 · https://docs.bigmodel.cn/cn/guide/models/free/glm-z1-flash · publication date 2026-07-08.
21. GLM-4 - 智谱AI开放文档 · https://docs.bigmodel.cn/cn/guide/models/text/glm-4 · publication date 2026-07-08.
22. 新品发布 - 智谱AI开放文档 · https://docs.bigmodel.cn/cn/update/new-releases · publication date 2026-06-17.
23. Errors - Z.AI API Reference · https://docs.z.ai/api-reference/api-code · last-updated 2026-06-24.
24. Current Rate Limits - Z.ai · https://z.ai/manage-apikey/rate-limits · last-updated 2026-06-02.
25. zai-org/GLM-5 GitHub repository · https://github.com/zai-org/GLM-5 · created 2026-02-09; pushed 2026-07-07.
26. zai-org/GLM-4.5 GitHub repository · https://github.com/zai-org/GLM-4.5 · 2026 commit 2026-02-01.
27. zai-org/GLM-V GitHub repository · https://github.com/zai-org/GLM-V · 2026 commit 2026-05-16.
28. zai-org/GLM-skills GitHub repository · https://github.com/zai-org/GLM-skills · created 2026-03-30; pushed 2026-04-15.
