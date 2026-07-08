# Исследовательский отчет: prompt engineering для z.ai / Zhipu AI GLM в источниках 2026 года

## Краткое резюме

GLM-4.6 следует промптить как агентно-ориентированную модель с длинным контекстом: официальные документы указывают 200K контекста, 128K максимального вывода, поддержку `thinking={"type":"enabled"}` и потоковую сборку tool calls через `tool_stream=true` для задач кодинга, reasoning и tool-use ([Z.AI GLM-4.6 guide](https://docs.z.ai/guides/llm/glm-4.6), [Z.AI migration guide](https://docs.z.ai/guides/overview/migrate-to-glm-4.6)).

Главное отличие GLM-подхода в 2026 году — не «магическая формула промпта», а правильная настройка thinking/tool контекста: при interleaved thinking нужно сохранять `reasoning_content` вместе с tool results, а для preserved thinking в coding/agent сценариях требуется возвращать полный неизмененный `reasoning_content` при `clear_thinking=false` ([Z.AI Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode), [BigModel 思考模式](https://docs.bigmodel.cn/cn/guide/capabilities/thinking-mode)).

Для структурированного вывода официальная рекомендация — включать `response_format={"type":"json_object"}` и одновременно задавать ожидаемую JSON-структуру или JSON Schema в системном сообщении, а затем валидировать результат обычным JSON-парсером или `jsonschema` ([Z.AI Structured Output](https://docs.z.ai/guides/capabilities/struct-output), [BigModel 结构化输出](https://docs.bigmodel.cn/cn/guide/capabilities/struct-output)).

Для GLM-4.6 и GLM-5.2 официальные migration-чеклисты прямо предупреждают не тюнить одновременно `temperature` и `top_p`; дефолты указаны как `temperature=1.0` и `top_p=0.95`, а выбор одного параметра должен соответствовать цели — креативность через `temperature` или более стабильный вывод через `top_p` ([Z.AI migrate to GLM-4.6](https://docs.z.ai/guides/overview/migrate-to-glm-4.6), [BigModel migrate to GLM-5.2](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-new)).

Для мультимодальных задач GLM-4.6V и GLM-4.5V лучше промптить с явным форматом визуального ответа: GLM-4.6V поддерживает native multimodal function calling и работу с изображениями/скриншотами/документами как tool inputs, а GLM-4.5V официально показывает grounding prompt с координатным форматом `[[xmin,ymin,xmax,ymax]]` ([Z.AI GLM-4.6V guide](https://docs.z.ai/guides/vlm/glm-4.6v), [Z.AI GLM-4.5V guide](https://docs.z.ai/guides/vlm/glm-4.5v)).

GLM-Z1 в 2026 источниках описан как reasoning-серия с built-in deep thinking и MCP, поэтому для нее практический вывод — давать задачи, где нужна декомпозиция, проверка условий, математико-логическое рассуждение, код или длинный документ, а не простую low-latency переформулировку ([BigModel GLM-Z1](https://docs.bigmodel.cn/cn/guide/models/text/glm-z1), [BigModel GLM-Z1-Flash](https://docs.bigmodel.cn/cn/guide/models/free/glm-z1-flash)).

Достоверных 2026 первичных источников с отдельным официальным «универсальным GLM prompt engineering cookbook» найдено не было; большинство actionable правил приходится выводить из официальных model pages, API reference, migration guides, capability guides и официальных GLM Skills ([Z.AI Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion), [GLM Skills GitHub](https://github.com/zai-org/GLM-skills)).

## Раздел 1. Официальные гайдлайны 2026

1. **Z.AI GLM-4.6 guide — модель, контекст, reasoning, coding, agentic/tool-use.** Страница GLM-4.6 от 2026-06-25 описывает расширение контекста с 128K до 200K, более сильный coding, reasoning, search-based agents, tool use during inference и API-примеры с `thinking`, `temperature`, `max_tokens` и streaming handling of `delta.reasoning_content` ([Z.AI GLM-4.6 guide](https://docs.z.ai/guides/llm/glm-4.6)).

2. **Z.AI migration guide to GLM-4.6 — практический чеклист промптинга и параметров.** Документ от 2026-06-25 фиксирует `glm-4.6`, `temperature=1.0`, `top_p=0.95`, рекомендацию выбирать только один sampling-параметр, включение/отключение deep thinking для complex reasoning/coding, обработку `delta.reasoning_content`, `delta.content` и потоковую сборку `delta.tool_calls[*].function.arguments` при `tool_stream=true` ([Z.AI migrate to GLM-4.6](https://docs.z.ai/guides/overview/migrate-to-glm-4.6)).

3. **Z.AI Chat Completion API — роли, ограничения messages, параметры, tools и response schema.** API reference от 2026-01-28 задает `messages` как prompt input, разрешает `system`, `user`, `assistant`, `tool` messages, предупреждает, что input не должен состоять только из `system` или `assistant` messages, описывает `thinking`, `reasoning_effort`, `temperature`, `top_p`, `max_tokens`, `tool_stream`, `tools` и лимит до 128 functions ([Z.AI Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion)).

4. **Z.AI Deep Thinking — когда включать reasoning.** Capability guide от 2026-06-30 говорит, что deep thinking поддерживают GLM-5.2, GLM-5.1, GLM-5, GLM-5-Turbo, GLM-5V-Turbo, GLM-4.5, GLM-4.6 и GLM-4.7; `thinking.type="enabled"` включает dynamic thinking, `thinking.type="disabled"` дает direct answers, а `reasoning_effort` действует только для GLM-5.2 и выше ([Z.AI Deep Thinking](https://docs.z.ai/guides/capabilities/thinking)).

5. **Z.AI Thinking Mode — interleaved, preserved и turn-level thinking.** Capability guide от 2026-06-30 указывает, что thinking по умолчанию активирован в GLM-5.2/5.1/5/4.7, отличается от default hybrid thinking в GLM-4.6, поддерживает interleaved thinking между tool calls, требует явного сохранения thinking blocks с tool results и позволяет preserved thinking через `clear_thinking=false` с полным неизмененным `reasoning_content` ([Z.AI Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode)).

6. **Z.AI Structured Output — JSON mode плюс schema в system message.** Capability guide от 2026-06-30 описывает `response_format={"type":"json_object"}` для JSON mode, указывает GLM-5, GLM-4.7, GLM-4.5 и GLM-4.6 как модели со structured output, и показывает, что ожидаемая JSON-структура или JSON Schema должна быть описана в `messages`, особенно в `system` message ([Z.AI Structured Output](https://docs.z.ai/guides/capabilities/struct-output)).

7. **Z.AI Tool Streaming Output — потоковое извлечение tool arguments.** Capability guide от 2026-06-30 описывает `stream=True` и `tool_stream=True`, указывает, что streaming responses содержат `delta.reasoning_content`, `delta.content` и `delta.tool_calls`, и показывает накопление `function.arguments` по частям ([Z.AI Tool Streaming Output](https://docs.z.ai/guides/capabilities/stream-tool)).

8. **BigModel function calling — OpenAI-style tools и `tool_choice="auto"`.** Китайская документация от 2026-07-08 описывает `tools` как список callable functions, `tool_choice` как стратегию вызова, `tool_calls`, `function.name`, `function.arguments` как JSON string, и пример цикла: получить tool call, распарсить JSON arguments, выполнить функцию и вернуть `role="tool"` с `tool_call_id` ([BigModel 工具调用](https://docs.bigmodel.cn/cn/guide/capabilities/function-calling)).

9. **BigModel GLM-4.6 model page — китайская модельная страница с 355B/A32B и сценариями.** Страница от 2026-07-08 описывает GLM-4.6 как 355B total / 32B active model, контекст 200K, max output 128K, MCP, advanced coding, complex reasoning, tool invocation и пример API-вызова с `thinking`, `max_tokens=65536`, `temperature=1.0` ([BigModel GLM-4.6](https://docs.bigmodel.cn/cn/guide/models/text/glm-4.6)).

10. **BigModel GLM-4 / GLM-4-Plus — системный prompt и high-intelligence сценарии.** Страница от 2026-07-08 описывает GLM-4-Plus как high-intelligence model для language understanding, logical reasoning, instruction following и long-text processing, показывает 128K context, 4K max output и пример с `system` message: «你是一个乐于解答各种问题的助手…» ([BigModel GLM-4](https://docs.bigmodel.cn/cn/guide/models/text/glm-4)).

11. **BigModel GLM-Z1 и GLM-Z1-Flash — reasoning-first prompt fit.** Страница GLM-Z1 от 2026-07-08 описывает GLM-Z1-Air как reasoning model with deep thinking, математико-логическое усиление и MCP, а GLM-Z1-Flash page от 2026-07-08 показывает, что reasoning model «думает» дольше перед ответом, проверяет и исправляет себя и подходит для programming, mathematics и science tasks ([BigModel GLM-Z1](https://docs.bigmodel.cn/cn/guide/models/text/glm-z1), [BigModel GLM-Z1-Flash](https://docs.bigmodel.cn/cn/guide/models/free/glm-z1-flash)).

12. **Z.AI GLM-4.6V и GLM-4.5V guides — vision/multimodal prompting.** GLM-4.6V guide от 2026-06-25 описывает native multimodal function calling, multimodal input/output и visual tool retrieval, а GLM-4.5V guide от 2026-06-25 описывает Thinking Mode switch и grounding example с явным координатным форматом `[[xmin,ymin,xmax,ymax]]` ([Z.AI GLM-4.6V](https://docs.z.ai/guides/vlm/glm-4.6v), [Z.AI GLM-4.5V](https://docs.z.ai/guides/vlm/glm-4.5v)).

13. **Z.AI DevPack / GLM Coding Plan — coding-agent workflow и MCP.** DevPack overview от 2026-06-30 говорит, что GLM Coding Plan применяется в Claude Code, Cline и OpenCode, покрывает natural language programming, debugging/repair, codebase Q&A, automated task handling и включает Vision Understanding, Web Search MCP, Web Reader MCP и Zread MCP ([Z.AI DevPack overview](https://docs.z.ai/devpack/overview)).

14. **Official GLM Skills — task-specific prompt wrappers for agents.** GitHub repository dated 2026-03-30 консолидирует официальные skills для GLM family, включая `glmv-caption`, `glmv-grounding`, `glmv-prompt-gen`, `glmocr`, `glmocr-table`, `glmocr-formula`, `glm-image-gen` и `glm-master-skill`, что подтверждает официальный pattern «узкая skill-инструкция + trigger conditions + expected artifact» для агентных поверхностей ([GLM Skills GitHub](https://github.com/zai-org/GLM-skills)).

15. **Chat.z.ai community evaluation — prompts should include role, constraints and review iteration.** Вторичный источник от 2026-05-12 тестировал seven complex prompts directly on chat.z.ai, использовал direct prompts без внешнего tuning, оценивал accuracy/structure/maintainability/reasoning и рекомендовал итеративно уточнять prompts, explicitly ask for benchmarks, input constraints and safety guards ([Second Talent GLM 4.6 coding review](https://www.secondtalent.com/resources/glm-4-6-for-coding-z-ai-chat-review/)).

## Раздел 2. Бест-практики — top-15

1. **Разделяйте роль, задачу, контекст и формат, используя `system` для устойчивых правил.** Официальные quick-start и API examples используют `system` messages вроде “You are a helpful AI assistant” или coding assistant persona, а structured output guide прямо помещает JSON contract в `system` message ([Z.AI Quick Start](https://docs.z.ai/guides/overview/quick-start), [Z.AI Structured Output](https://docs.z.ai/guides/capabilities/struct-output)).

2. **Не отправляйте prompt, состоящий только из `system` или `assistant` messages.** Z.AI API reference прямо предупреждает, что input must not consist of system messages or assistant messages only, поэтому практический минимум — иметь `user` task turn рядом с policy/role context ([Z.AI Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion)).

3. **Для complex reasoning/coding включайте или явно оставляйте включенным deep thinking.** Z.AI Deep Thinking описывает multi-step reasoning, logical analysis, improved accuracy and intelligent judgment, а migration guide рекомендует `thinking={"type":"enabled"}` для complex reasoning/coding ([Z.AI Deep Thinking](https://docs.z.ai/guides/capabilities/thinking), [Z.AI migrate to GLM-4.6](https://docs.z.ai/guides/overview/migrate-to-glm-4.6)).

4. **Для простых fact/rewrite turns отключайте thinking ради latency/cost.** Thinking Mode guide говорит, что turn-level thinking позволяет отключать reasoning для lightweight turns вроде fact asking или wording tweaks и включать его для complex planning, multi-constraint reasoning и code debugging ([Z.AI Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode)).

5. **При tool-use с thinking сохраняйте `reasoning_content` и возвращайте его вместе с tool results.** Z.AI Thinking Mode требует explicitly preserve thinking blocks with tool results для interleaved thinking и возвращать complete unmodified `reasoning_content` при preserved thinking, иначе снижаются performance и cache hit rate ([Z.AI Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode), [BigModel 思考模式](https://docs.bigmodel.cn/cn/guide/capabilities/thinking-mode)).

6. **Для streaming tool calls не ждите финальный JSON: включайте `tool_stream=True` и инкрементально склеивайте `function.arguments`.** Tool Streaming Output guide показывает `stream=True`, `tool_stream=True`, `delta.tool_calls` и append of streamed `function.arguments`, что снижает latency и avoids buffering until validation ([Z.AI Tool Streaming Output](https://docs.z.ai/guides/capabilities/stream-tool)).

7. **Для function calling описывайте tool schema в OpenAI-style `tools` и оставляйте `tool_choice="auto"`.** BigModel docs показывают `tools=[{"type":"function","function":...}]`, `tool_choice="auto"`, `tool_calls`, JSON-parsing of `function.arguments` и последующий `role="tool"` message с `tool_call_id` ([BigModel 工具调用](https://docs.bigmodel.cn/cn/guide/capabilities/function-calling)).

8. **Для JSON output используйте одновременно API-режим и prompt contract.** Structured Output guide требует `response_format={"type":"json_object"}` для JSON mode и предписывает определить expected JSON structure and field requirements in system messages; это особенно важно, потому что bare “верни JSON” без `response_format` не использует documented JSON mode ([Z.AI Structured Output](https://docs.z.ai/guides/capabilities/struct-output)).

9. **Валидируйте structured output вне модели.** Structured Output guide показывает `json.loads(response.choices[0].message.content)` и отдельный пример JSON Schema validation через `jsonschema.validate`, поэтому prompt должен задавать schema, но production-код должен проверять ее отдельно ([Z.AI Structured Output](https://docs.z.ai/guides/capabilities/struct-output), [BigModel 结构化输出](https://docs.bigmodel.cn/cn/guide/capabilities/struct-output)).

10. **Тюньте либо `temperature`, либо `top_p`, но не оба сразу.** Z.AI and BigModel migration guides указывают defaults `temperature=1.0`, `top_p=0.95` и прямо рекомендуют выбирать only one for tuning; примеры используют `temperature=1.0` для creative brand intro и `top_p=0.8` для stable technical documentation ([Z.AI migrate to GLM-4.6](https://docs.z.ai/guides/overview/migrate-to-glm-4.6), [BigModel 迁移至 GLM-4.6](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6)).

11. **Явно задавайте `max_tokens` под задачу и модельный потолок.** API reference указывает 128K maximum output for GLM-5.2/5.1/5/4.7/4.6, 32K for GLM-4.6V, 16K for GLM-4.5V, а migration guide напоминает GLM-4.6 maximum output 128K and context 200K ([Z.AI Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion), [Z.AI migrate to GLM-4.6](https://docs.z.ai/guides/overview/migrate-to-glm-4.6)).

12. **Для long-context GLM-4.6 не просто «кладите все», а формулируйте explicit objective and constraints.** Migration guide связывает prompt optimization с clearer instructions and constraints, а GLM-4.6 guide позиционирует 200K context как средство для complex agentic tasks, long-context processing and searching rather than replacement for task structure ([Z.AI migrate to GLM-4.6](https://docs.z.ai/guides/overview/migrate-to-glm-4.6), [Z.AI GLM-4.6 guide](https://docs.z.ai/guides/llm/glm-4.6)).

13. **Для multimodal prompting передавайте визуальные данные как first-class inputs и задавайте формат визуального результата.** GLM-4.6V guide говорит, что images, screenshots and document pages can be passed directly as tool parameters and visual outputs can be interpreted in reasoning chains, а GLM-4.5V guide показывает prompt “Provide coordinates in [[xmin,ymin,xmax,ymax]] format” ([Z.AI GLM-4.6V](https://docs.z.ai/guides/vlm/glm-4.6v), [Z.AI GLM-4.5V](https://docs.z.ai/guides/vlm/glm-4.5v)).

14. **Для coding-agent work используйте повторяемые команды/skills и MCP только там, где нужен внешний контекст.** Z.AI DevPack describes codebase Q&A, debugging/repair and automated task handling in Claude Code/Cline/OpenCode, а GLM Skills repository показывает официальные task-specific skills as reusable wrappers for multimodal, OCR, image and agent workflows ([Z.AI DevPack overview](https://docs.z.ai/devpack/overview), [GLM Skills GitHub](https://github.com/zai-org/GLM-skills)).

15. **В chat.z.ai coding prompts просите ограничения, тесты, safety guards и benchmarks явно.** 2026 community review of GLM 4.6 on chat.z.ai reports direct prompt tests and concludes users should run prompts iteratively while explicitly asking for performance benchmarks, input constraints and safety guards, especially for authentication, storage or network traffic systems ([Second Talent GLM 4.6 coding review](https://www.secondtalent.com/resources/glm-4-6-for-coding-z-ai-chat-review/)).

## Раздел 3. Антипаттерны

| Антипаттерн | Почему ломается | Как исправить | Источник (2026) |
|---|---|---|---|
| Prompt состоит только из `system` или `assistant` messages | API reference предупреждает, что input must not consist only of `system` or `assistant` messages, поэтому такой prompt нарушает documented message contract | Добавить `user` message с конкретной задачей и оставить `system` только для роли/политики | [Z.AI Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion) |
| Одновременный ручной tuning `temperature` и `top_p` | Migration guides говорят, что defaults are `temperature=1.0` and `top_p=0.95` and recommend choosing only one for tuning | Выбрать `temperature` для creative variance или `top_p` для stable narrowing, но не менять оба параметра сразу | [Z.AI migrate to GLM-4.6](https://docs.z.ai/guides/overview/migrate-to-glm-4.6), [BigModel 迁移至 GLM-5.2](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-new) |
| Tool loop отбрасывает `reasoning_content` | Interleaved/preserved thinking требует сохранять thinking blocks and return them with tool results; unmodified `reasoning_content` needed for coherence and cache hits | Сохранять `reasoning_content` из assistant turn и возвращать его вместе с `tool_calls` and `role="tool"` outputs | [Z.AI Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode) |
| Модификация или переупорядочивание preserved thinking blocks | BigModel docs прямо говорят, что consecutive `reasoning_content` must be exactly identical to original sequence and must not be reordered or modified, otherwise effect and cache hit rate degrade | При `clear_thinking=false` сохранять reasoning blocks byte-for-byte и возвращать их в исходном порядке | [BigModel 思考模式](https://docs.bigmodel.cn/cn/guide/capabilities/thinking-mode) |
| Expectation that JSON prompt alone guarantees parseable output | Structured Output docs enable JSON mode with `response_format={"type":"json_object"}` and require expected JSON structure in system messages | Использовать `response_format`, schema in `system`, then `json.loads` / `jsonschema.validate` | [Z.AI Structured Output](https://docs.z.ai/guides/capabilities/struct-output) |
| Streaming tool call parser ждет complete JSON before reading arguments | Tool streaming docs show that `function.arguments` arrives as chunks and must be concatenated by tool call index | Включить `tool_stream=True`, accumulate `delta.tool_calls[index].function.arguments`, then parse final JSON | [Z.AI Tool Streaming Output](https://docs.z.ai/guides/capabilities/stream-tool) |
| Использование thinking для каждой мелкой правки | Turn-level thinking guide says lightweight turns can disable thinking for faster response while heavy tasks can enable thinking for accuracy/stability | Отключать `thinking` для fact/rewrite turns и включать для planning/debugging/multi-constraint tasks | [Z.AI Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode) |
| Vision prompt просит “найди объект” без требуемого coordinate format | GLM-4.5V grounding example explicitly asks “Provide coordinates in [[xmin,ymin,xmax,ymax]] format” | Указать output coordinate schema, units/range if needed, and target object disambiguation | [Z.AI GLM-4.5V](https://docs.z.ai/guides/vlm/glm-4.5v) |
| Treating GLM-4.6V visual tools as text-only OCR pipeline | GLM-4.6V guide says images, screenshots and document pages can be passed directly as tool parameters, reducing conversion loss | Передавать multimodal inputs directly and ask the model to align visual/textual evidence before final answer | [Z.AI GLM-4.6V](https://docs.z.ai/guides/vlm/glm-4.6v) |
| Prompting GLM-Z1-Flash like a cheap direct chat model for trivial latency-sensitive turns | GLM-Z1-Flash is described as reasoning model that thinks longer, verifies and self-corrects before answer | Использовать GLM-Z1 for math/code/science/long-doc reasoning; route trivial rewrite/fact turns to non-reasoning or disabled-thinking model | [BigModel GLM-Z1-Flash](https://docs.bigmodel.cn/cn/guide/models/free/glm-z1-flash) |
| Coding prompt asks for implementation but omits constraints/tests/security | Community chat.z.ai review found direct GLM-4.6 coding prompts benefit from iterative refinement and explicit requests for performance benchmarks, input constraints and safety guards | Add explicit constraints, edge cases, benchmark request, tests and security review requirements | [Second Talent GLM 4.6 coding review](https://www.secondtalent.com/resources/glm-4-6-for-coding-z-ai-chat-review/) |
| Using unsupported manual `reasoning_effort` assumptions on GLM-4.6 | Z.AI Deep Thinking states `reasoning_effort` takes effect only for GLM-5.2 and above, while GLM-4.6 uses `thinking.type` | For GLM-4.6 use `thinking={"type":"enabled"}` or disabled; reserve `reasoning_effort` for GLM-5.2+ | [Z.AI Deep Thinking](https://docs.z.ai/guides/capabilities/thinking) |

## Раздел 4. Отличия от других семейств моделей

| Аспект | GLM / z.ai prompt impact | Claude | GPT / OpenAI | DeepSeek | Qwen | Практический вывод для GLM |
|---|---|---|---|---|---|---|
| Thinking defaults | GLM-5.2/5.1/5/4.7 default thinking differs from GLM-4.6 default hybrid thinking, and GLM supports interleaved thinking by default since GLM-4.5 ([Z.AI Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode)) | Anthropic’s 2026 Opus 4.6 announcement says adaptive thinking lets Claude decide when deeper reasoning is helpful and developers can adjust effort level ([Anthropic Claude Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6)) | OpenAI 2026-dated official source with specific current prompting semantics was not found; claim [uncertain / no 2026 source] | DeepSeek official thinking-mode page had no retrievable 2026 publication date, so detailed comparison is [uncertain / no 2026 source] | Alibaba/Qwen official prompting page with 2026 date was not found; secondary 2026 source says Qwen3-style hybrid thinking is controlled per request, but this is not primary ([Effloow Qwen3 review](https://effloow.com/articles/qwen3-review-hybrid-thinking-moe-guide-2026)) | Для GLM prompt-writing важно явно управлять `thinking.type` by task and model generation, not copy “always think” or “never think” rules from another family ([Z.AI Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode)) |
| Preserving reasoning in tool loops | GLM interleaved/preserved thinking requires returning thinking blocks and complete unmodified `reasoning_content` with tool results ([Z.AI Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode)) | Claude comparison is limited to official 2026 product statement about adaptive thinking; no 2026 opened source with exact prompt transport rules was usable, so block-preservation comparison is [uncertain / no 2026 source] | OpenAI comparison is [uncertain / no 2026 source] | DeepSeek official docs were undated in fetch; comparison is [uncertain / no 2026 source] | Qwen comparison is [uncertain / no 2026 primary source] | GLM agent prompts and middleware must treat `reasoning_content` as state, not display-only text ([BigModel 思考模式](https://docs.bigmodel.cn/cn/guide/capabilities/thinking-mode)) |
| Tool calling syntax | GLM uses OpenAI-style `tools` with functions, `tool_calls`, JSON `function.arguments`, and `tool_choice="auto"` examples ([BigModel 工具调用](https://docs.bigmodel.cn/cn/guide/capabilities/function-calling)) | Claude interface differences are [uncertain / no 2026 source] | OpenAI comparison is [uncertain / no 2026 source], but GLM’s own docs state OpenAI-compatible migration is supported ([BigModel OpenAI API compatible](https://docs.bigmodel.cn/cn/guide/develop/openai/introduction)) | DeepSeek comparison is [uncertain / no 2026 source] | Qwen comparison is [uncertain / no 2026 primary source] | Используйте OpenAI-style tool schema for GLM, but follow GLM-specific reasoning preservation and streaming argument concatenation ([Z.AI Tool Streaming Output](https://docs.z.ai/guides/capabilities/stream-tool)) |
| Structured output | GLM JSON mode requires `response_format={"type":"json_object"}` plus expected JSON structure in system messages ([Z.AI Structured Output](https://docs.z.ai/guides/capabilities/struct-output)) | Claude comparison is [uncertain / no 2026 source] | OpenAI comparison is [uncertain / no 2026 source] | DeepSeek comparison is [uncertain / no 2026 source] | Qwen comparison is [uncertain / no 2026 primary source] | Не переносите blindly “JSON-only prompt” habits; for GLM use API JSON mode and explicit schema in prompt ([BigModel 结构化输出](https://docs.bigmodel.cn/cn/guide/capabilities/struct-output)) |
| Multimodal tools | GLM-4.6V supports native multimodal tool calling with images/screenshots/document pages as tool parameters and visual results fed into reasoning ([Z.AI GLM-4.6V](https://docs.z.ai/guides/vlm/glm-4.6v)) | Claude comparison is [uncertain / no 2026 source] | GPT comparison is [uncertain / no 2026 source] | DeepSeek comparison is [uncertain / no 2026 source] | Qwen comparison is [uncertain / no 2026 primary source] | GLM-V prompts should avoid needless OCR summaries when direct visual/tool inputs are available ([Z.AI GLM-4.6V](https://docs.z.ai/guides/vlm/glm-4.6v)) |
| Sampling defaults | GLM-4.6 migration docs cite `temperature=1.0` and `top_p=0.95`, recommend tuning one, and Hugging Face GLM-4.6 page recommends temperature 1.0 and `top_p=0.95` for general evaluations ([Z.AI migrate to GLM-4.6](https://docs.z.ai/guides/overview/migrate-to-glm-4.6), [Hugging Face GLM-4.6](https://huggingface.co/zai-org/GLM-4.6)) | Claude comparison is [uncertain / no 2026 source] | OpenAI comparison is [uncertain / no 2026 source] | DeepSeek comparison is [uncertain / no 2026 source] | Qwen comparison is [uncertain / no 2026 primary source] | Treat GLM defaults as model-family-specific; avoid importing `temperature=0` deterministic habits without regression testing ([Z.AI migrate to GLM-4.6](https://docs.z.ai/guides/overview/migrate-to-glm-4.6)) |
| Coding-agent surfaces | GLM Coding Plan applies to Claude Code, Cline and OpenCode and includes Vision Understanding, Web Search MCP, Web Reader MCP and Zread MCP ([Z.AI DevPack overview](https://docs.z.ai/devpack/overview)) | Claude Code is a target host in GLM Coding Plan configuration, but GLM docs say the interface may show Claude model while GLM model is actually used after default server mapping ([Z.AI Claude Code setup](https://docs.z.ai/scenario-example/develop-tools/claude)) | GPT comparison is [uncertain / no 2026 source] | DeepSeek comparison is [uncertain / no 2026 source] | Qwen comparison is [uncertain / no 2026 primary source] | In Claude Code/Cline/OpenCode with GLM, write prompts for GLM’s thinking/tool behavior even if UI naming resembles another provider ([Z.AI Claude Code setup](https://docs.z.ai/scenario-example/develop-tools/claude)) |

## Раздел 5. Примеры: минимум 5 пар «до/после»

### Пример 1 — JSON sentiment output без API JSON mode → JSON contract + `response_format`

**Проблема:** GLM Structured Output docs требуют `response_format={"type":"json_object"}` and expected JSON structure in system messages, so a prompt-only JSON request is weaker than the documented pattern ([Z.AI Structured Output](https://docs.z.ai/guides/capabilities/struct-output)).

**До:**

```text
Проанализируй тональность: «今天天气真好，心情很愉快！». Верни JSON.
```

**После:**

```python
messages=[
  {"role":"system", "content":"""
Ты эксперт по sentiment analysis. Верни только JSON в формате:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.0,
  "emotions": ["..."],
  "keywords": ["..."],
  "analysis": "..."
}
"""},
  {"role":"user", "content":"Проанализируй тональность: '今天天气真好，心情很愉快！'"}
]
response_format={"type":"json_object"}
```

**Почему лучше:** `response_format` включает JSON mode, а schema in system message задает field contract, после чего официальный пример парсит `response.choices[0].message.content` через `json.loads` ([BigModel 结构化输出](https://docs.bigmodel.cn/cn/guide/capabilities/struct-output)).

### Пример 2 — Tool call без stateful reasoning → interleaved/preserved thinking loop

**Проблема:** При tool-use GLM Thinking Mode requires preserving thinking blocks and returning them with tool results, and preserved thinking requires complete unmodified `reasoning_content` for coherence and cache hits ([Z.AI Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode)).

**До:**

```python
messages.append({"role":"tool", "tool_call_id": call.id, "content": weather_json})
# assistant reasoning_content from prior turn is discarded
response = client.chat.completions.create(model="glm-5.1", messages=messages, tools=tools)
```

**После:**

```python
messages.append({
  "role":"assistant",
  "content": assistant_content,
  "reasoning_content": assistant_reasoning_content,
  "tool_calls": assistant_tool_calls
})
messages.append({"role":"tool", "tool_call_id": call.id, "content": weather_json})
response = client.chat.completions.create(
  model="glm-5.1",
  messages=messages,
  tools=tools,
  stream=True,
  extra_body={"thinking":{"type":"enabled"}, "clear_thinking": False}
)
```

**Почему лучше:** official example says “Key: return reasoning_content to keep the reasoning coherent,” and BigModel warns that reordering/modifying consecutive reasoning blocks degrades effect and cache hit rate ([Z.AI Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode), [BigModel 思考模式](https://docs.bigmodel.cn/cn/guide/capabilities/thinking-mode)).

### Пример 3 — Sampling overcontrol → choose one knob

**Проблема:** GLM-4.6 migration guide gives defaults `temperature=1.0` and `top_p=0.95` and recommends choosing only one for tuning ([Z.AI migrate to GLM-4.6](https://docs.z.ai/guides/overview/migrate-to-glm-4.6)).

**До:**

```python
client.chat.completions.create(
  model="glm-4.6",
  messages=[{"role":"user","content":"Напиши стабильное техническое описание API."}],
  temperature=0.2,
  top_p=0.4
)
```

**После:**

```python
client.chat.completions.create(
  model="glm-4.6",
  messages=[{"role":"user","content":"Сгенерируй стабильное техническое описание API: endpoints, auth, errors, examples."}],
  top_p=0.8
)
```

**Почему лучше:** official migration guide’s Plan B uses `top_p=0.8` for “Generate more stable technical documentation,” while Plan A uses `temperature=1.0` for creative brand introduction ([BigModel 迁移至 GLM-4.6](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6)).

### Пример 4 — Vision grounding без output schema → coordinate schema prompt

**Проблема:** GLM-4.5V guide’s grounding example asks the model to return coordinates in `[[xmin,ymin,xmax,ymax]]` format, so an underspecified “where is it?” prompt invites prose instead of machine-usable coordinates ([Z.AI GLM-4.5V](https://docs.z.ai/guides/vlm/glm-4.5v)).

**До:**

```text
На изображении найди вторую бутылку пива справа на столе.
```

**После:**

```text
Where is the second bottle of beer from the right on the table?
Provide coordinates in [[xmin,ymin,xmax,ymax]] format only.
If uncertain, return the best approximate box and a one-sentence uncertainty note.
```

**Почему лучше:** prompt aligns with the official GLM-4.5V grounding example and makes the coordinate format explicit for downstream use ([Z.AI GLM-4.5V](https://docs.z.ai/guides/vlm/glm-4.5v)).

### Пример 5 — Coding prompt без constraints → senior-engineer role + requirements + benchmarks/safety

**Проблема:** A 2026 chat.z.ai review tested direct GLM-4.6 coding prompts and recommends iterative refinement plus explicit requests for performance benchmarks, input constraints and safety guards ([Second Talent GLM 4.6 coding review](https://www.secondtalent.com/resources/glm-4-6-for-coding-z-ai-chat-review/)).

**До:**

```text
Сделай Go сервис для загрузки файлов.
```

**После:**

```text
You are a senior backend engineer. Create a Go microservice for safe file uploads.
Requirements:
1. Enforce max file size and allow-list MIME types.
2. Stream uploads without loading entire files into memory.
3. Return structured JSON responses and clear error codes.
4. Include unit tests for size limits, invalid MIME, path traversal, and concurrent uploads.
5. Add a short performance benchmark plan and list remaining security review items.
```

**Почему лучше:** the community test includes a Go microservice file-upload prompt with structured JSON responses and clear error codes, and the article’s lessons explicitly advise asking for benchmarks, constraints and safety guards ([Second Talent GLM 4.6 coding review](https://www.secondtalent.com/resources/glm-4-6-for-coding-z-ai-chat-review/)).

### Пример 6 — Long-context dump → objective, constraints, output shape

**Проблема:** GLM-4.6 has 200K context and 128K max output, but migration docs say prompt optimization should combine deep thinking with clearer instructions and constraints ([Z.AI GLM-4.6 guide](https://docs.z.ai/guides/llm/glm-4.6), [Z.AI migrate to GLM-4.6](https://docs.z.ai/guides/overview/migrate-to-glm-4.6)).

**До:**

```text
Вот весь репозиторий и логи. Исправь всё.
[200K токенов файлов]
```

**После:**

```text
Goal: fix the failing checkout workflow without changing public API behavior.
Context order:
1. Failing test output.
2. Relevant service files.
3. Data model and migrations.
4. Non-goals and constraints.
Instructions:
- First identify the minimal root cause.
- Then propose a patch plan.
- Then provide code diffs.
- Include regression tests and mention any files intentionally not touched.
Use thinking enabled for reasoning, but final answer must be concise.
```

**Почему лучше:** this prompt uses GLM-4.6’s long context for agentic/code tasks while adding explicit task goal, context order, constraints and expected output, matching the official migration note to use clearer instructions and constraints with deep thinking ([Z.AI migrate to GLM-4.6](https://docs.z.ai/guides/overview/migrate-to-glm-4.6)).

### Пример 7 — GLM-Z1 trivial chat → reasoning-suited task with verification requirements

**Проблема:** BigModel describes GLM-Z1-Flash as a reasoning model that thinks longer, verifies and self-corrects, and is more suitable for programming, math and science tasks than simple direct chat ([BigModel GLM-Z1-Flash](https://docs.bigmodel.cn/cn/guide/models/free/glm-z1-flash)).

**До:**

```text
Перефразируй это предложение проще.
```

**После:**

```text
Реши задачу и проверь каждое условие: дай список из 10 натуральных чисел, где минимум одно простое, минимум 6 нечетных, минимум 2 степени двойки, и суммарное число цифр не меньше 25. В финале отдельно перечисли проверку каждого ограничения.
```

**Почему лучше:** GLM-Z1-Flash official page uses a confusing mathematical constraint prompt and shows that the model decomposes, reflects and verifies each condition before final output ([BigModel GLM-Z1-Flash](https://docs.bigmodel.cn/cn/guide/models/free/glm-z1-flash)).

## Раздел 6. Пробелы в данных и уверенность

### Что не удалось подтвердить 2026 источником

- **Отдельный официальный GLM prompt engineering cookbook with few-shot guidance.** Найдены official model pages, capability guides, API reference, migration guides and skills, but no dated-2026 primary cookbook dedicated to few-shot prompting for GLM; поэтому GLM-specific few-shot claims are [uncertain / no 2026 source] ([Z.AI Chat Completion API](https://docs.z.ai/api-reference/llm/chat-completion), [Z.AI Structured Output](https://docs.z.ai/guides/capabilities/struct-output)).

- **Official chat.z.ai prompt guide.** Найдены community tests of chat.z.ai prompts dated 2026 and official GLM model/API docs, but no opened official dated-2026 chat.z.ai prompt-writing manual; therefore chat.z.ai-specific UI prompt heuristics beyond direct prompt tests are [uncertain / no 2026 source] ([Second Talent GLM 4.6 coding review](https://www.secondtalent.com/resources/glm-4-6-for-coding-z-ai-chat-review/)).

- **GLM-Z1-Rumination custom system prompt/tool restrictions in a 2026 official source.** Older/undated repo-like material appeared in search/fetch, but the report does not use pre-2026 or undated sources for this claim; therefore exact restrictions for GLM-Z1-Rumination system prompts/custom tools are [uncertain / no 2026 source] ([Hugging Face GLM-Z1-Rumination-32B-0414](https://huggingface.co/zai-org/GLM-Z1-Rumination-32B-0414)).

- **Claude/GPT/DeepSeek/Qwen detailed prompt syntax comparisons with 2026 primary docs.** Claude has a dated 2026 product source for adaptive thinking, but detailed developer-doc pages fetched without 2026 publication dates; OpenAI and DeepSeek developer pages fetched without 2026 publication dates; Qwen official prompting material found was pre-2026 or undated, so detailed cross-family syntax claims are marked [uncertain / no 2026 source] except where explicitly sourced by a dated 2026 secondary source ([Anthropic Claude Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6), [Effloow Qwen3 review](https://effloow.com/articles/qwen3-review-hybrid-thinking-moe-guide-2026)).

- **Community-reported Reddit formatting issues for GLM-4.6.** Search found Reddit result titles, but the pages were not retrievable and had no usable 2026 publication metadata, so no Reddit anti-pattern claim is included except as a data gap [uncertain / no 2026 source].

### Уровень уверенности по ключевым утверждениям

| Утверждение | Уверенность | Основание |
|---|---:|---|
| GLM-4.6 supports 200K context, 128K output, thinking and tool streaming | Высокая | Confirmed by Z.AI and BigModel official 2026 pages ([Z.AI GLM-4.6 guide](https://docs.z.ai/guides/llm/glm-4.6), [BigModel GLM-4.6](https://docs.bigmodel.cn/cn/guide/models/text/glm-4.6)) |
| `temperature=1.0`, `top_p=0.95`, tune only one | Высокая | Confirmed by official migration guides and GLM-4.6 model card ([Z.AI migrate to GLM-4.6](https://docs.z.ai/guides/overview/migrate-to-glm-4.6), [Hugging Face GLM-4.6](https://huggingface.co/zai-org/GLM-4.6)) |
| Preserve `reasoning_content` in GLM tool loops | Высокая | Confirmed by Z.AI and BigModel Thinking Mode docs ([Z.AI Thinking Mode](https://docs.z.ai/guides/capabilities/thinking-mode), [BigModel 思考模式](https://docs.bigmodel.cn/cn/guide/capabilities/thinking-mode)) |
| JSON mode requires `response_format` plus JSON structure in messages | Высокая | Confirmed by Z.AI and BigModel structured output docs ([Z.AI Structured Output](https://docs.z.ai/guides/capabilities/struct-output), [BigModel 结构化输出](https://docs.bigmodel.cn/cn/guide/capabilities/struct-output)) |
| GLM-4.6V supports native multimodal function calling | Высокая | Confirmed by Z.AI GLM-4.6V official model guide ([Z.AI GLM-4.6V](https://docs.z.ai/guides/vlm/glm-4.6v)) |
| GLM-Z1 is reasoning-suited and has built-in deep thinking/MCP | Высокая | Confirmed by BigModel GLM-Z1 and GLM-Z1-Flash official pages ([BigModel GLM-Z1](https://docs.bigmodel.cn/cn/guide/models/text/glm-z1), [BigModel GLM-Z1-Flash](https://docs.bigmodel.cn/cn/guide/models/free/glm-z1-flash)) |
| chat.z.ai coding prompts benefit from explicit constraints/tests/safety | Средняя | Based on one dated 2026 community evaluation, not a primary source ([Second Talent GLM 4.6 coding review](https://www.secondtalent.com/resources/glm-4-6-for-coding-z-ai-chat-review/)) |
| Detailed Claude/GPT/DeepSeek/Qwen syntax differences | Низкая | Only Claude adaptive thinking has a dated 2026 primary source; other detailed docs lacked usable 2026 dates, so claims are mostly data gaps ([Anthropic Claude Opus 4.6](https://www.anthropic.com/news/claude-opus-4-6)) |

### Точная свежесть использованных источников

1. **GLM-4.6 - Overview - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/guides/llm/glm-4.6 · publication metadata: 2026-06-25.
2. **Migrate to GLM-4.6 - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/guides/overview/migrate-to-glm-4.6 · publication metadata: 2026-06-25.
3. **Chat Completion - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/api-reference/llm/chat-completion · publication metadata: 2026-01-28.
4. **Deep Thinking - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/guides/capabilities/thinking · publication metadata: 2026-06-30.
5. **Thinking Mode - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/guides/capabilities/thinking-mode · publication metadata: 2026-06-30.
6. **Structured Output - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/guides/capabilities/struct-output · publication metadata: 2026-06-30.
7. **Tool Streaming Output - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/guides/capabilities/stream-tool · publication metadata: 2026-06-30.
8. **Quick Start - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/guides/overview/quick-start · publication metadata: 2026-06-30.
9. **Overview - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/guides/overview/overview · publication metadata: 2026-06-25.
10. **GLM-4.6V - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/guides/vlm/glm-4.6v · publication metadata: 2026-06-25.
11. **GLM-4.5V - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/guides/vlm/glm-4.5v · publication metadata: 2026-06-25.
12. **Overview - DevPack / GLM Coding Plan - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/devpack/overview · publication metadata: 2026-06-30.
13. **Claude Code - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/scenario-example/develop-tools/claude · publication metadata: 2026-06-18.
14. **工具调用 - 智谱AI开放文档** · https://docs.bigmodel.cn/cn/guide/capabilities/function-calling · publication metadata: 2026-07-08.
15. **深度思考 - 智谱AI开放文档** · https://docs.bigmodel.cn/cn/guide/capabilities/thinking · publication metadata: 2026-07-08.
16. **思考模式 - 智谱AI开放文档** · https://docs.bigmodel.cn/cn/guide/capabilities/thinking-mode · publication metadata: 2026-07-08.
17. **结构化输出 - 智谱AI开放文档** · https://docs.bigmodel.cn/cn/guide/capabilities/struct-output · publication metadata: 2026-07-08.
18. **迁移至 GLM-4.6 - 智谱AI开放文档** · https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6 · publication metadata: 2026-07-08.
19. **迁移至 GLM-5.2 - 智谱AI开放文档** · https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-new · publication metadata: 2026-07-08.
20. **GLM-4.6 - 智谱AI开放文档** · https://docs.bigmodel.cn/cn/guide/models/text/glm-4.6 · publication metadata: 2026-07-08.
21. **GLM-4 - 智谱AI开放文档** · https://docs.bigmodel.cn/cn/guide/models/text/glm-4 · publication metadata: 2026-07-08.
22. **GLM-Z1 - 智谱AI开放文档** · https://docs.bigmodel.cn/cn/guide/models/text/glm-z1 · publication metadata: 2026-07-08.
23. **GLM-Z1-Flash - 智谱AI开放文档** · https://docs.bigmodel.cn/cn/guide/models/free/glm-z1-flash · publication metadata: 2026-07-08.
24. **OpenAI API 兼容 - 智谱AI开放文档** · https://docs.bigmodel.cn/cn/guide/develop/openai/introduction · publication metadata: 2026-07-08.
25. **New Released - Z.AI DEVELOPER DOCUMENT** · https://docs.z.ai/release-notes/new-released · publication metadata: 2026-06-18.
26. **新品发布 - 智谱AI开放文档** · https://docs.bigmodel.cn/cn/update/new-releases · publication metadata: 2026-06-17.
27. **zai-org/GLM-4.6 · Hugging Face** · https://huggingface.co/zai-org/GLM-4.6 · publication metadata: 2026-03-02.
28. **zai-org/GLM-Z1-Rumination-32B-0414 · Hugging Face** · https://huggingface.co/zai-org/GLM-Z1-Rumination-32B-0414 · publication metadata: 2026-03-02.
29. **GitHub - zai-org/GLM-skills** · https://github.com/zai-org/GLM-skills · publication metadata: 2026-03-30.
30. **Claude Opus 4.6 - Anthropic** · https://www.anthropic.com/news/claude-opus-4-6 · publication metadata: 2026-02-05.
31. **Qwen3 Review: Hybrid Thinking Modes and MoE Architecture Explained** · https://effloow.com/articles/qwen3-review-hybrid-thinking-moe-guide-2026 · publication metadata: 2026-04-13.
32. **GLM 4.6 API Guide 2026: Tool Calling, RAG, and Bilingual Apps** · https://crazyrouter.com/en/blog/glm-4-6-api-guide-june-6-2026-tool-calling-rag-bilingual · publication metadata: 2026-06-06.
33. **GLM 4.6 for Coding: Z.ai Chat Review [2025]** · https://www.secondtalent.com/resources/glm-4-6-for-coding-z-ai-chat-review/ · publication metadata: 2026-05-12.

## Numbered Sources list — top-33 used sources

1. [GLM-4.6 - Overview - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/guides/llm/glm-4.6) · publication date: 2026-06-25.
2. [Migrate to GLM-4.6 - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/guides/overview/migrate-to-glm-4.6) · publication date: 2026-06-25.
3. [Chat Completion - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/api-reference/llm/chat-completion) · publication date: 2026-01-28.
4. [Deep Thinking - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/guides/capabilities/thinking) · publication date: 2026-06-30.
5. [Thinking Mode - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/guides/capabilities/thinking-mode) · publication date: 2026-06-30.
6. [Structured Output - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/guides/capabilities/struct-output) · publication date: 2026-06-30.
7. [Tool Streaming Output - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/guides/capabilities/stream-tool) · publication date: 2026-06-30.
8. [Quick Start - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/guides/overview/quick-start) · publication date: 2026-06-30.
9. [Overview - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/guides/overview/overview) · publication date: 2026-06-25.
10. [GLM-4.6V - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/guides/vlm/glm-4.6v) · publication date: 2026-06-25.
11. [GLM-4.5V - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/guides/vlm/glm-4.5v) · publication date: 2026-06-25.
12. [Overview - DevPack / GLM Coding Plan - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/devpack/overview) · publication date: 2026-06-30.
13. [Claude Code - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/scenario-example/develop-tools/claude) · publication date: 2026-06-18.
14. [工具调用 - 智谱AI开放文档](https://docs.bigmodel.cn/cn/guide/capabilities/function-calling) · publication date: 2026-07-08.
15. [深度思考 - 智谱AI开放文档](https://docs.bigmodel.cn/cn/guide/capabilities/thinking) · publication date: 2026-07-08.
16. [思考模式 - 智谱AI开放文档](https://docs.bigmodel.cn/cn/guide/capabilities/thinking-mode) · publication date: 2026-07-08.
17. [结构化输出 - 智谱AI开放文档](https://docs.bigmodel.cn/cn/guide/capabilities/struct-output) · publication date: 2026-07-08.
18. [迁移至 GLM-4.6 - 智谱AI开放文档](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-4.6) · publication date: 2026-07-08.
19. [迁移至 GLM-5.2 - 智谱AI开放文档](https://docs.bigmodel.cn/cn/guide/start/migrate-to-glm-new) · publication date: 2026-07-08.
20. [GLM-4.6 - 智谱AI开放文档](https://docs.bigmodel.cn/cn/guide/models/text/glm-4.6) · publication date: 2026-07-08.
21. [GLM-4 - 智谱AI开放文档](https://docs.bigmodel.cn/cn/guide/models/text/glm-4) · publication date: 2026-07-08.
22. [GLM-Z1 - 智谱AI开放文档](https://docs.bigmodel.cn/cn/guide/models/text/glm-z1) · publication date: 2026-07-08.
23. [GLM-Z1-Flash - 智谱AI开放文档](https://docs.bigmodel.cn/cn/guide/models/free/glm-z1-flash) · publication date: 2026-07-08.
24. [OpenAI API 兼容 - 智谱AI开放文档](https://docs.bigmodel.cn/cn/guide/develop/openai/introduction) · publication date: 2026-07-08.
25. [New Released - Z.AI DEVELOPER DOCUMENT](https://docs.z.ai/release-notes/new-released) · publication date: 2026-06-18.
26. [新品发布 - 智谱AI开放文档](https://docs.bigmodel.cn/cn/update/new-releases) · publication date: 2026-06-17.
27. [zai-org/GLM-4.6 · Hugging Face](https://huggingface.co/zai-org/GLM-4.6) · publication date: 2026-03-02.
28. [zai-org/GLM-Z1-Rumination-32B-0414 · Hugging Face](https://huggingface.co/zai-org/GLM-Z1-Rumination-32B-0414) · publication date: 2026-03-02.
29. [GitHub - zai-org/GLM-skills](https://github.com/zai-org/GLM-skills) · publication date: 2026-03-30.
30. [Claude Opus 4.6 - Anthropic](https://www.anthropic.com/news/claude-opus-4-6) · publication date: 2026-02-05.
31. [Qwen3 Review: Hybrid Thinking Modes and MoE Architecture Explained](https://effloow.com/articles/qwen3-review-hybrid-thinking-moe-guide-2026) · publication date: 2026-04-13.
32. [GLM 4.6 API Guide 2026: Tool Calling, RAG, and Bilingual Apps](https://crazyrouter.com/en/blog/glm-4-6-api-guide-june-6-2026-tool-calling-rag-bilingual) · publication date: 2026-06-06.
33. [GLM 4.6 for Coding: Z.ai Chat Review [2025]](https://www.secondtalent.com/resources/glm-4-6-for-coding-z-ai-chat-review/) · publication date: 2026-05-12.
