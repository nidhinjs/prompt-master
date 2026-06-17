# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.21.0] - 2026-06-17

Рефактор + актуализация профиля **Perplexity**. Live-сверка через perplexity doc-server (2026-06-17) показала, что Perplexity теперь **двухповерхностный продукт**, а профиль был тонким и смешан с Manus. Два пользовательских файла `Perplexity_Deep_Research_*` (про отдельный проект DResearch-Skill + UI Deep Research) использованы как лиды; «Search as Code / Deep Research in Computer» помечен как блоговый концепт (в API-доках отсутствует).

### Added
- **`tool-profiles.md` — отдельный профиль `Perplexity`** (выделен из смешанного блока «Research / Orchestration AI»): **Agent API** (`/v1/agent`, `responses.create`) как рекомендуемый дефолт для новых апп (agent loop + custom tools + presets incl. `deep-research` + мультипровайдерный доступ к моделям) vs **Sonar API** (`sonar`/`sonar-pro`/`sonar-reasoning-pro`/`sonar-deep-research` 128K) для прямых search-grounded ответов; search по user-msg; фильтры-как-параметры; Data-gaps & confidence + citation contract. Manus/мультиагентные оркестраторы — отдельным блоком. Routing Index разнесён на `Perplexity` и `Manus / multi-agent orchestrators`.

### Changed
- **`models.md` — переписана секция `## Perplexity`** (`last-verified: 2026-06-17`): две поверхности (Agent API мультипровайдерный шлюз + Sonar 4 модели); `sonar-deep-research` 128K с раздельным reasoning/citation/search-query биллингом; search по user-msg; фильтры-как-параметры; `reasoning_effort` enum под `⚠️ verify`; Search-as-Code помечен как блоговый концепт (не API); цены не хардкодить.
- **`SKILL.md`**: Gotcha-строка «Research tools» обновлена (Agent API дефолт; Sonar модели; search по user-msg; Search-as-Code ≠ API).
- **`templates.md` Template N**: Perplexity-заметка — Agent API дефолт + `sonar-deep-research` 128K + фильтры/cap-lists; Search-as-Code ≠ API.
- **`README` (EN + RU)**: строка Perplexity в «Works With» — Agent API + Sonar Deep Research.
- **`docs/sources.md`**: строка обоснования + источники Perplexity обновлены (Agent API + Sonar pages; verified 2026-06-17; SaC = blog).

### Notes
- **Сверено по live-докам** (perplexity doc-server). `⚠️ verify`: точные значения `reasoning_effort`, GA-список моделей Agent API (меняется ежемесячно), цены (волатильны — не хардкодить).
- **Проверка — clean-room behavioural test** (свежие субагенты, только файлы скилла, нейтральная формулировка, 3 кейса × 3 = **9/9 PASS**): A (новый агент с кастомными тулзами → **Agent API** `/v1/agent`+`responses.create`+`tools`+preset `deep-research`, не голый Sonar), B (глубокое исследование → `sonar-deep-research`, research-бриф Template N, вопрос в user-msg, фильтры-как-параметры, Data-gaps & confidence + citation contract), C (быстрый факт → `sonar`/`sonar-pro`, «офиц. ЕС» как `search_domain_filter`, не прозой). Ноль фабрикаций: никто не выдумал `reasoning_effort`/цены и не подал Search-as-Code как API-фичу; формат вынесен допущением.
- Счётчик паттернов **без изменений (46)**. Гард-рейлы целы: never-silent format v1.19.1, citation contract v1.18.1, профили Kimi v1.20/DeepSeek v1.19/Grok v1.18, Opus 4.8 дефолт/Fable suspended, hook v1.15, cap 3.
- Backlog: «каждый паттерн — свой релиз». Дальше Claude Code (1.22) → MiniMax (1.23) → Gemini (1.24) → Memory-rebuild → Doc-grounding → image → GPT.

## [1.20.0] - 2026-06-17

Добавлен профиль **Kimi (Moonshot AI)** — раньше в скилле не было ни одного упоминания Kimi. Все факты **сверены по live-докам** platform.kimi.ai / api.moonshot.ai + HF model cards (2026-06-17). Три лид-файла `Kimi_*DeepSearch*` использованы как лиды; **2 ошибки лидов исправлены по первоисточнику** (см. Notes).

### Added
- **`models.md` — секция `## Moonshot AI — Kimi`** (`last-verified: 2026-06-17`): `kimi-k2.6` (флагман, мультимодал, 256K, dual-mode), `kimi-k2.7-code`(+highspeed — forced thinking+preserve_thinking, thinking-off→fallback K2.6, MoonViT vision, Modified MIT), `kimi-k2.5`, легаси `moonshot-v1-*` (единственные с полным сэмплингом), `kimi-latest` deprecated 2026-01-28; defaults K2.x (temp 1.0 / top_p 0.95 / 32768 / n1 — temperature не тюнить); `tool_choice` auto/none при thinking; `$web_search` требует thinking off; Agent Swarm (app, self-orchestrated, 300 sub-агентов) ≠ Kimi-Researcher (single, app-only); app-режимы + tier-gating; OpenAI/Anthropic, `api.moonshot.ai/v1`; Partial Mode.
- **`tool-profiles.md` — профиль `Kimi (Moonshot AI)`** + строка Routing Index: decision-таблица модель×режим; reasoning-native (no CoT); инструменты не в system prompt (только `tools`); preserve `reasoning_content`; конфликт web_search⊕thinking; Kimi-нативный citation contract; Agent Swarm (без ручного agent count) ≠ Kimi-Researcher; app vs API; tier-gating.
- **`patterns.md` #46** — «reasoning + живой web search в одном запросе на инструменте, где это взаимоисключено» (Kimi `$web_search` требует thinking off).
- **`templates.md`** — Template N: Kimi research (app vs API + нативный формат цитат); **Agentic Fragments — Kimi carve-out** (vendor-managed swarm: не проектировать топологию/sub-агентов).

### Changed
- **`SKILL.md`**: новая Gotcha-строка Kimi; `Kimi K2.x thinking` добавлен в no-CoT reasoning-native списки (Hard rule, Gotchas, Diagnostic, Safe Techniques); в multi-agent Gotcha — exception про vendor-managed swarm; счётчик паттернов **45 → 46**.
- **`patterns.md` #38**: добавлен `kimi-latest` (deprecated 2026-01-28); заголовок **45 → 46 patterns**.
- **`README`**: «Works with» + обе таблицы — добавлен Kimi; счётчик **45 → 46**.
- **`plugin.json` / `marketplace.json`**: в описания добавлен Kimi (Moonshot AI); keywords +`kimi`/`moonshot`; счётчик **46**.
- **(опц.) `hooks/multi-agent-detect.js`**: в инжектируемую note добавлена строка про vendor-managed swarm (Kimi Agent Swarm) — regex не изменён (он уже ловил multi-agent/swarm).

### Notes
- **Сверено с live-доками.** `⚠️ verify`: max output, knowledge cutoff, inline-цитаты `$web_search`, API-доступ Agent Swarm / Claw Groups / Kimi-Researcher / Kimi Work, архитектура K2.7. Цены не хардкодятся.
- **2 коррекции лид-файлов:** (1) заявленное «verbatim: do not duplicate tool schema in system prompt [tool-calls page]» — на той странице отсутствует; реальное правило (agent-страница) — *не описывать инструменты в System Prompt вообще* («interferes with K2.6 autonomous decision-making»); (2) «temperature не модифицируется / калибруй 0.6–1.0» — дефолт **1.0**, держать дефолт.
- **Хук:** существующий v1.15 multi-agent-хук уже ловит «промпт … мультиагент/agent swarm»; вместо нового хука добавлен **Kimi carve-out** в Agentic Fragments, чтобы хук не уводил Kimi-Swarm в orchestrator-as-decomposer.
- **Проверка — clean-room behavioural test** (свежие субагенты, только файлы скилла, нейтральная формулировка, 7 кейсов × 3 = **21/21 PASS**): A рефактор → k2.6/k2.7-code, no-CoT, дефолты; B агентный кодинг → k2.7-code + инструменты не в system prompt + preserve `reasoning_content`; C дешёвая JSON → k2.5/non-thinking/`response_format`; D веб-ресёрч API → `$web_search`+thinking-off + Kimi-нативный citation; E tool-loop → preserve `reasoning_content`; **F мультиагент → Agent Swarm, модель само-оркеструет, НЕ проектирует топологию/sub-агентов (Kimi carve-out перекрыл generic-нудж хука)**; G deep research → app (Researcher/Swarm) vs API (свой loop), не путает Researcher↔Swarm. Ноль фабрикаций; формат вывода нигде не выведен молча; tier-gating Swarm везде вынесен как prerequisite.
- Гард-рейлы целы: never-silent format v1.19.1, citation contract v1.18.1, DeepSeek v1.19, Grok v1.18, Perplexity v1.17, Opus 4.8 дефолт/Fable suspended, hook v1.15, фрагменты v1.14, cap 3.
- Backlog: image → 1.21, GPT → 1.22.

## [1.19.1] - 2026-06-15

Hardening-фикс. На установленном скилле баг «молча выбран формат ответа» **воспроизвёлся снова** (Grok-промпт). Перепроверка на актуальном репозитории показала: фикс v1.18.1 был **soft-правилом в MIDDLE-зоне** и проигрывал `SKILL.md` «Fix silently» + премиссе Template N → срабатывал лишь ~2/3. Плюс мой прежний clean-room тест был **бутафорией**: инструкция субагенту «следуй файлам точно» завышала соблюдение до 3/3, а N=3 не ловит 33%-й отказ.

### Changed
- **`SKILL.md` — правило формата поднято в Hard Rules (PRIMACY-зона, always-loaded, «NEVER violate»)**: для research/report и ЛЮБОГО Grok-промпта запрещено отдавать молча выведенный формат — только спросить первым вопросом ИЛИ строка «Assumed output format: …» в заметке. Явно перекрывает «fix silently» и дефолты структуры Template N.
- **`SKILL.md` Diagnostic Checklist** — в преамбулу «Fix silently» добавлено исключение: формат вывода research/Grok-промпта НЕ silent fix.

### Notes
- **Честный re-gate (исправленная методика):** нейтральная формулировка (без «следуй точно»), **8 прогонов** на точном провальном репро (Grok deep search по докам Kimi), порог 8/8 → **8/8 PASS** (5× строка-допущение, 3× вопрос; ноль молча-зашитых). До правки тот же ввод давал 2/3. Оговорка: 8/8 — сильное доказательство, не «математические 100%».
- **Урок по тестам:** поведенческие правила проверять нейтрально и с N≥8, порог near-100%, обязательно на реальном провальном вводе; «coached» прогоны и N=3 — ненадёжны.
- **Важно для пользователя:** фикс уйдёт в установленный плагин только после **обновления/переустановки** — релизы на GitHub не подтягиваются автоматически.
- Счётчик паттернов без изменений (45). Гард-рейлы целы (citation contract v1.18.1, DeepSeek v1.19, Grok v1.18, Perplexity v1.17, Opus 4.8 дефолт, hook v1.15, фрагменты v1.14).

## [1.19.0] - 2026-06-15

Ревизия профиля **DeepSeek** (V4, dual-mode). Секция была тонкой и устаревшей (только «DeepSeek-R1»). Все факты **сверены по live api-docs.deepseek.com** (через context7, 2026-06-15); три пользовательских файла `DeepSeek_Prompting_*` (Grok DeepSearch) использованы как лиды и местами скорректированы (напр., «единственная модель v4-pro» → есть и v4-flash; легаси-имена ещё живут до 24.07.2026).

### Added
- **`models.md` — переписана секция `## DeepSeek`** (`last-verified: 2026-06-15`): текущие модели `deepseek-v4-pro` / `deepseek-v4-flash` (1M, OpenAI+Anthropic интерфейс, dual-mode Thinking/Non-Thinking); легаси `deepseek-chat`/`deepseek-reasoner` → отключение **2026-07-24**; thinking enable/disable; `reasoning_effort` **только `high`/`max`** (не low/medium); `temperature`/penalties в thinking игнорируются; правило сохранения `reasoning_content` при tool calls; JSON-mode; нет нативного deep-research агента. GA-имена/цены/maxOutput под `⚠️ verify`.
- **`tool-profiles.md` — профиль `DeepSeek (V4, dual-mode)`** (вместо «DeepSeek-R1») + Routing Index `DeepSeek V4`: decision-таблица модель×режим×effort (pro для сложного/agentic-coding/Math-STEM, flash для простого/объёмного/дёшево; thinking для reasoning, non-thinking для простого; high/max); правило `reasoning_content`; «глубокое исследование» = thinking + retrieval + citation contract (нет нативного агента); JSON-mode; OpenAI/Anthropic-совместимость.

### Changed
- **`SKILL.md`**: новая Gotcha-строка DeepSeek (v4-pro/flash, dual-mode, reasoning_effort high/max, не ставить temp/penalty в thinking, сохранять reasoning_content, легаси до 24.07.2026); no-CoT reasoning-native списки обновлены `DeepSeek-R1` → `DeepSeek thinking mode` (Hard rule, Gotchas, Diagnostic, Safe Techniques).
- **`README`**: обе таблицы — `DeepSeek-R1` → `DeepSeek V4 (pro/flash, dual-mode)` с fix-заметками.
- **`patterns.md` #38**: добавлен свежий пример снятой модели (`deepseek-chat`/`deepseek-reasoner`, 2026-07-24). Счётчик паттернов **без изменений (45)**.
- **`plugin.json`/`marketplace.json`**: в перечень моделей добавлен DeepSeek V4.

### Notes
- **Сверено с live-доками, лиды Grok-DeepSearch скорректированы.** `⚠️ verify`: финальные GA-имена/цены V4, точный maxOutput (~384K).
- **Проверка — clean-room behavioural test** (свежие субагенты, только файлы скилла, 4 кейса × 3 = **12/12 PASS**): A (hard math → v4-pro/thinking/effort high, без CoT/temp/penalty), B (JSON-классификация → v4-flash/non-thinking/json/few-shot), C (tools → сохранение `reasoning_content`), D (deep research → thinking+retrieval+citation contract, без выдуманного агента). Анти-фабрикация 12/12. Тест поймал слабую формулировку выбора варианта (A1 не закрепил pro) → усилено и перегнано до 3/3.
- Гард-рейлы целы: citation contract v1.18.1, профиль Grok v1.18, Perplexity research v1.17, Opus 4.8 дефолт/Fable suspended v1.16, hook v1.15, фрагменты v1.14, cap 3.
- Backlog сдвинут: image → 1.20, GPT → 1.21; добавлен пункт **Kimi (Moonshot AI)**.

## [1.18.1] - 2026-06-15

Фикс двух поведенческих дефектов, найденных на установленном скилле (Grok-промпты): (1) скилл **молча придумывал формат ответа**, не спрашивая и не помечая допущением; (2) для retrieval-инструментов **не требовал inline-ссылок на источник** → проза без атрибуции. Общий корень (RCA): правило жило лишь в Gotcha-памятке и проигрывало оперативной инструкции Diagnostic Checklist «No output format → derive» + «Fix silently». Урок применён — оба правила **вшиты в Diagnostic Checklist + readiness-gate**, а не только в памятку. Цитаты — **условно** (фактологическая/research-задача на retrieval-инструменте) и всегда с анти-фабрикационной парой «cite only retrieved / never fabricate / [uncertain]», чтобы не провоцировать выдуманные ссылки.

### Added
- **Safe Technique «Source citations»** (`SKILL.md`): условный citation contract — inline-ссылка на каждое неочевидное утверждение + список источников + cite-only-retrieved + never-fabricate + `[uncertain]`. Только для factual/research на retrieval-инструменте; НЕ для креатива/кода/без-retrieval.
- **#45 «Citable task with no inline-citation contract»** в `patterns.md` (44 → **45**).
- **Diagnostic Checklist (`SKILL.md`)**: строка про citation contract + переписана строка output-format (вынести допущением/спросить, не выводить молча).

### Changed
- **`SKILL.md`**: readiness-gate — «output format is never silently derived» (спросить или вынести допущением для Grok/report); Gotchas Grok + Research tools усилены требованием inline-цитат; счётчик 44 → 45.
- **`tool-profiles.md`**: Grok-профиль (формат — спросить/вынести допущением; citation contract при включённом поиске); Perplexity/Research (inline-цитаты per-claim + no-fabrication); Gemini (inline-цитаты для grounded/research).
- **`templates.md` Template N**: inline-цитаты + sources list + no-fabrication + `[uncertain]` в Output structure.
- **`README`**: «5 Safe Techniques» → «6» (+ «Source citations»); счётчик 44 → 45.
- **`plugin.json`/`marketplace.json`**: счётчик 44 → 45.

### Notes
- **Анти-фабрикация цела:** citation contract не добавляется без retrieval и для креатива/кода; нигде не инструктируем выдумывать ссылки — наоборот, явно запрещаем.
- **Проверка — clean-room behavioural test:** свежие субагенты только с файлами скилла (без этой переписки), 3 прогона × 3 кейса = 9/9 PASS (репро бага: формат спрошен/вынесен + цитаты; креатив: цитат нет; Perplexity: цитаты + data-gaps). Именно этот гейт поймал бы промах, которого не было видно в v1.18.
- Гард-рейлы целы: профиль Grok v1.18, Perplexity research v1.17, Opus 4.8 дефолт/Fable suspended v1.16, hook v1.15, фрагменты v1.14, cap 3, single-pass self-critique.

## [1.18.0] - 2026-06-15

Добавлен профиль **Grok (xAI)**. Факты **сверены по live-доке docs.x.ai** (через grok-doc-server MCP, 2026-06-15). До этого Grok в проекте не упоминался вообще — релиз закрывает пропуск, а не правит устаревшее. Фокус — текст / reasoning / поиск / multi-agent; image/video (Grok Imagine) и voice отложены в image-релиз (1.19.0).

### Added
- **`tool-profiles.md` профиль Grok (xAI)** + строка в Routing Index: reasoning-native `grok-4.3` (без CoT, глубина через `reasoning_effort`); **нет realtime-знаний без Web/X Search** (cutoff ноябрь 2024); **X Search** = signature для соц/трендов; фильтры поиска — параметрами не прозой; `grok-4.20-multi-agent` (beta) для deep-research (4/16 агентов); OpenAI-совместимость; обязательный явный формат ответа.
- **`models.md` секция `## xAI — Grok`** (`last-verified: 2026-06-15`): `grok-4.3` 1M (дефолт), `grok-build-0.1` 256k, `grok-4.20-multi-agent` (beta), `grok-4.20-0309-*` под `⚠️ verify`; `reasoning_effort` none/low/medium/high; multi-agent agent-count 4/16; cutoff + «нет realtime без search»; фильтры-параметры; aliases; Imagine/Voice кратко. Цены не хардкодим.
- **#44 «Real-time request to a cutoff model with no retrieval enabled»** в `patterns.md` (43 → **44**): запрос свежих данных к модели с cutoff без включённого поиска → включить Web/X Search, фильтры — параметрами.
- **Template N (Research Brief)** — Grok-вариант: `grok-4.20-multi-agent` + `web_search`/`x_search`, 4/16 агентов, фильтры как tool-параметры.

### Changed
- **`SKILL.md`**: `grok-4.3` добавлен в no-CoT reasoning-native списки (Hard rule, Gotchas, Diagnostic, Safe Techniques); новая Gotcha-строка Grok (включая обязательный формат ответа). Счётчик 43 → 44.
- **o1-фикс (побочная устарелость):** `o1/o3` в примерах CoT заменён на `o3/o4-mini` (`README`, `templates.md`, patterns #27). `o1` намеренно сохранён только в patterns #38 как пример снятой модели.
- **`plugin.json`/`marketplace.json`/`README`**: добавлен Grok/xAI в описания и keywords; счётчик 43 → 44.

### Notes
- Аудит подтвердил: устаревших Grok-данных не было (Grok отсутствовал) — риск был в пропуске, не в противоречии. Гард-рейлы целы: v1.17 (Perplexity research), v1.16 (Opus 4.8 дефолт, Fable suspended), v1.15 hook, v1.14 фрагменты, v1.13 A–G.
- `⚠️ verify`: beta-статус `grok-4.20-multi-agent` и точные `grok-4.20-0309-*` ID.

## [1.17.0] - 2026-06-15

Поддержка промптов для deep-research инструментов. Факты **сверены по live-доке Perplexity** (docs.perplexity.ai через MCP, 2026-06-14) — это переопределило часть пользовательского гайда (он опирался на блог фев-2025 + community).

### Added
- **Template N — Research Brief** (`templates.md`): универсальный скелет для deep-research / cited-report инструментов (Perplexity Deep Research, GPT/Gemini Deep Research, Sonar). Role+Goal → конкретные аспекты → scope → output structure (cap top-N, без URL-прозой) → source priorities+freshness → **обязательная секция «Data gaps & confidence»**. Tool-aware: Sonar — фильтры параметрами, запрос в user-message; UI — Focus/Spaces.
- **#43 «Vague / mis-specified research request»** в `patterns.md` (42 → **43**): vague-тема ИЛИ source-фильтры прозой → research brief + фильтры параметрами.
- **`models.md` секция `## Perplexity`** (`last-verified: 2026-06-14`): `sonar-deep-research` 128K; **поиск управляется только user-message, system-prompt поиск не видит**; фильтры — параметры запроса (`search_domain_filter` ≤20 allow/deny, `search_recency_filter` hour/day/week/month/year, date-фильтры); `search_mode`/`reasoning_effort`-значения под `⚠️ verify`; Agent API (рекоменд.); Spaces (= Collections).
- **`SKILL.md` Safe Techniques** — «Research grounding» (обязательная секция data-gaps/confidence, primary-источники, cap top-N).

### Changed
- **`tool-profiles.md` профиль Perplexity** обогащён по офиц. Sonar prompt-guide: поиск из user-message; **фильтры параметрами, не прозой** («search only on X» прозой игнорируется); cap counts; без few-shot; Agent API. Заменены устаревшие буллеты.
- **`SKILL.md` Gotchas** — строка про research tools (Template N; фильтры параметрами; Sonar-поиск из user-message). Счётчик паттернов 42 → 43 (`SKILL.md`/README/plugin/marketplace).

### Notes
- **Скорректировано против пользовательского гайда** (не протащили устаревшее): фильтры задаются параметрами, а не прозой; domain-limit = до 20 (не 3); «Finance» Focus не подтверждён — не записан; точные значения `search_mode`/`reasoning_effort` помечены `⚠️ verify`.
- Гард-рейлы целы: v1.16 (Opus 4.8 дефолт, Fable suspended), v1.15, v1.14, v1.13 A–G.

## [1.16.0] - 2026-06-14

Разворот дефолтной модели Claude обратно на **Opus 4.8**. Причина — внешнее событие: Anthropic [отключила Fable 5 и Mythos 5 для всех клиентов с 2026-06-12](https://www.anthropic.com/news/fable-mythos-access) по экспортно-контрольной директиве правительства США (все прочие модели работают). Дефолт `Claude → Fable 5` (введён в v1.11) указывал на недоступную модель — это реальная поломка. Сработал штатный механизм: датированный факт в `models.md` + pattern #38 (retired/unavailable model).

### Changed
- **Дефолтная модель Claude в роутинге — снова Opus 4.8** (`claude-opus-4-8`, 1M контекст; Opus 4.7 selectable). Обновлены: `SKILL.md` Gotchas, `tool-profiles.md` (шапка Claude-блока, Routing Index, профиль Claude Code), `templates.md` Template M, описания `plugin.json`/`marketplace.json`, `README` (обе таблицы роутинга).
- **`models.md`**: Fable 5 / Mythos 5 помечены **SUSPENDED / UNAVAILABLE с 2026-06-12** с источником и протоколом ре-проверки; `last-verified: 2026-06-14`; дефолт routing-target = Opus 4.8.

### Notes
- **Fable 5 / Mythos 5 не удалены, а помечены suspended** (факт датирован) — если доступ вернут, откат тривиален. `reasoning_extraction`-правило и Fable-профиль сохранены с пометкой «применимо, если/когда восстановят».
- Счётчик паттернов без изменений (42). Гард-рейлы v1.13 (A–G), v1.14, v1.15 (hook + Agentic Prompt Fragments) целы.
- Обоснование — [docs/sources.md](../docs/sources.md).

## [1.15.0] - 2026-06-14

Детект запроса «промпт для мультиагентной среды» (двухслойный) + обогащение Agentic Prompt Fragments **проверенными практиками** из курированного репозитория [DenisSergeevitch/agents-best-practices](https://github.com/DenisSergeevitch/agents-best-practices) (первоисточники: Anthropic «Building effective agents» / context-engineering / harnesses / evals; OpenAI harness-engineering / prompt-caching / guardrails; OWASP AI Agent Security; NIST AI RMF). По главному выводу исследования («не строй мультиагентную систему, пока одиночный цикл не провалился») сама v1.15 реализована **одиночным проходом**, без распараллеливания на субагентов — самодельные эвристики заменены на источники.

### Added
- **Layer 1 — внутренний триггер** (`SKILL.md` Gotcha): запрос промпта для оркестратора / fan-out / субагентов / команды агентов → грузить «Agentic Prompt Fragments», выбирать топологию по таблице situation→pattern; по умолчанию — одиночный цикл.
- **Layer 2 — harness-hook** (`plugins/prompt-master/hooks/`): `hooks.json` (`UserPromptSubmit` → Node) + `multi-agent-detect.js` — high-precision детектор (срабатывает только при «намерение-промпт **И** мультиагентный сигнал», EN+RU; голое `agent`/`агент` исключено), инжектит само-осознанную подсказку через `hookSpecificOutput.additionalContext`, иначе молчит; всегда exit 0 (не блокирует); только `fs`+regex, кросс-платформенно (Node).
- **Обогащение Agentic Prompt Fragments** (`templates.md`) проверенными практиками: «когда оркестрировать» (7 признаков + анти-паттерн «не для simple edits»); таблица situation→pattern; **packet contract** (7 свойств); изоляция контекста воркера; независимый verifier (findings+source, не reasoning; стратегии review/sampling/cross-check/replay/tests); **бюджеты enforced**; правило параллелизма (только независимые read-only); cache-aware ordering.
- `docs/sources.md`: строки-обоснования (детект; sourced guardrails) + блок первоисточников (Anthropic/OpenAI/OWASP/NIST + agents-best-practices + Claude Code hooks).
- `.gitattributes`: `*.js text eol=lf`.

### Changed
- `SKILL.md` Gotchas-чеклист: +1 строка детекта мультиагентного запроса (ядро в пределах бюджета).

### Notes
- Счётчик паттернов без изменений (42). Гард-рейлы v1.13 (A–G) и v1.14 целы; loop-контракт остаётся runtime-only; одно-проходный self-critique не тронут.
- T4 (юнит-тест хука, 6 кейсов: 2 позитива EN/RU + 3 негатива вкл. голое `agent` + JSON-валидность) — зелёный.

## [1.14.0] - 2026-06-13

Срез из исследования репозитория [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) (8-агентный workflow + opus-оценка применимости): взяты только паттерны, усиливающие уже принятые позиции (анти-фабрикация, токен-экономия, model-aware routing, условный тиринг). Реализовано распределённо — 5 параллельных агентов по непересекающимся файлам (opus на SKILL.md/templates.md, sonnet на остальном). Прирост always-loaded ядра — в пределах бюджета (~10 строк).

### Added
- **Agentic Prompt Fragments** (`templates.md`, opt-in — только когда пользователь просит агентный промпт): оркестратор-как-декомпозитор + task-ledger; контракт завершения циклов (retry-cap + меню эскалации, evaluator-optimizer с выходом по плато) — **с анти-фабрикационным фенсом**: это runtime-поведение реального агента на отдельных проходах, НЕ просачивается в одно-проходный self-critique; handoff-блок + правило деградированного вывода; шаблон роли (NOT-RESPONSIBLE-FOR + failure-behavior); таксономия HITL-гейтов + предупреждение о пере-эскалации; clause «evidence-required» для review/QA; chooser уровней усилия (single-shot / multi-step / long-horizon — выбор, не обязательная лестница).
- **4 новых паттерна** в `patterns.md` (38 → **42**): #39 расплывчатый квалификатор → измеримое ограничение; #40 уязвимый к инъекциям / без OOD-fallback системный промпт → role-lock + фраза-fallback + санитизация; #41 переусложнённый/scope-creep промпт → scope self-check; #42 необработанный агентный сбой (silent/context failure) → схема-валидация + урезание инструкций.
- **Routing Index** наверху `tool-profiles.md` — таблица Tool / Handles / When-to-route (надмножество Gotchas; pick-a-row → открой один профиль). Синтаксис-преференции по моделям (Claude → XML-теги, GPT → persona-фрейминг) и evergreen-заметки по синтаксису image-инструментов (Midjourney/SD/Flux/ComfyUI).
- **`scripts/lint.ps1`** — релизный гейт (ERROR/WARN, exit 1 на ERROR): синхронизация версии, дрейф счётчика паттернов (читается из patterns.md, не хардкод), обязательные поля frontmatter, CRLF в `*.md`/`*.ps1`; WARN на бюджет строк ядра и footer-ссылку. Формализует разовые greps из v1.13. Адаптировано из lint-shape agency-agents (не копия их bash).
- **`.gitattributes`** — LF для `*.md/*.yml/*.yaml/*.sh/*.ps1/*.json` (репозиторий пишется на Windows).
- `docs/sources.md`: строки-обоснования новых техник + Divio-фрейминг references + editorial-тест «for the user, not the vendor».

### Changed
- **#23 анти-подхалимаж** (`SKILL.md`): внутренний дефолт-вердикт readiness-gate и self-critique инвертирован на **NEEDS REVISION**; повышение до READY — только при доказательстве по каждому критическому измерению. Остаётся внутренним (правило «никогда не показывать оценку/ярлык» сохранено).
- **#42 scope-creep + «Surface, don't smuggle»** (`SKILL.md` Token-Efficiency): scope self-check (удалить ограничения, которых не требует задача); замечания вне scope — в заметку после промпта, не в тело.
- **#35 память × бюджет вопросов** (`SKILL.md`): если вспомненная память отвечает на уточняющий вопрос — он считается решённым и не тратит лимит из 3; решения хранятся **с обоснованием**.
- `SKILL.md` Diagnostic Checklist: однострочные хуки — HITL-гейт с предупреждением о пере-эскалации (#29) и evidence-over-claims (#24). README: 5-second-test интро; счётчик паттернов 35/38 → 42.

## [1.13.0] - 2026-06-12

Закрытие трёх изъянов, найденных в живом тесте v1.12 (auth-refactor): дефолт-модель в Claude Code, условная token-экономия в агентных промптах и честный readiness-gate. Прирост always-loaded ядра — ~5 строк; вся объёмная логика в on-demand references.

### Changed
- **Профиль Claude Code: дефолт-модель — теперь Claude Fable 5** (закрывает регресс v1.11 — подпрофиль всё ещё указывал Opus 4.8). Opus 4.8/4.7 — по явному запросу или для benign-работы в Fable-refusal-доменах. Модель рекомендуется, не хардкодится (выбор за харнессом/конфигом).
- **Readiness-gate теперь различает «плейсхолдеры» и «открытые развилки»** (Intent Extraction): плейсхолдер — fill-in значение, развилка — решение, меняющее подход. Самая решающая развилка идёт первым вопросом; все оставшиеся развилки **обязательно** выносятся списком в заметку, а не маскируются под `[значение]`.
- Output format: тело промпта адресовано только целевому инструменту — setup/usage-советы для человека (новая сессия, замена значений, пререквизиты) уходят в заметку под промптом, не внутрь copyable-блока.
- Diagnostic Checklist: пункт «две задачи в одном» заострён под **refactor + migrate** (разносить с зелёными тестами между, либо обосновать слияние + флаг un-bisectable риска).

### Added
- **Условная model/effort-экономия в агентных промптах** (профиль Claude Code + Template M): одиночная scoped-задача → один сфокусированный проход без подагентов (дешевле всего); крупная multi-part работа → оркестратор на высоком effort (Fable 5) + делегирование независимых подзадач. Per-subagent модель задаётся конфигом, не телом промпта — управляем effort'ом и делегированием. **Сознательно НЕ «всегда тирить»** — оркестрация сама стоит токенов (обоснование в [docs/sources.md](../docs/sources.md)).
- **Security-эквивалентность** в Diagnostic Checklist + Template M: рефактор/миграция в auth/crypto/payments → жёсткий инвариант «не понижать стойкость» (алгоритм подписи, hash-cost, constant-time, формат токенов/секретов).
- **Refactor/migration safety net** (Diagnostic Checklist + Template M): не предполагать наличие тестов — подтвердить/создать characterization-тесты до изменений; снято противоречие «тесты не меняются» vs миграция (поведенческие ассерты зелёные, обвязка — моки/импорты — может меняться).
- `docs/sources.md`: строки про forks≠placeholders и conditional-tiering-rationale.

## [1.12.0] - 2026-06-12

Селективный срез из v2 PRD — взято только то, что не раздувает токены и не конфликтует с hard rules; Council-style multi-critic, числовой uncertainty-коэффициент, 4–5 вопросов и формальные Lean/Thorough-режимы **отклонены** (обоснование в [docs/sources.md](../docs/sources.md)).

### Added
- **Internal readiness gate** в Intent Extraction: качественная оценка Low/Med/High **только для решения скилла** (наружу не выводится — ни число, ни ярлык). При Medium/Low — вопросы-развилки, ранжированные по влиянию; жёсткий cap 3 вопроса; при остаточной неопределённости — best-effort промпт с явными допущениями + флаг открытых вопросов.
- **Single-pass structured Self-Critique** (апгрейд RECENCY ZONE) по 5 фиксированным измерениям: Clarity & Scope, Output Contract & Parseability, Token Efficiency, Model-Aware Fit, Completeness. Один проход, internal-only, без итераций и без имитации мульти-персоны (в отличие от Council-варианта PRD).
- **Canonical Prompt Structure** в `templates.md` — дефолт-скелет для текстовых LLM-промптов (Role → Outcome+Success → Context → Structured Input → Positive instructions → Conditional CoT/few-shot → Output contract); явно НЕ для image/video/voice/workflow.
- **`docs/sources.md`** — обоснование техник со ссылками + список сознательно отклонённых пунктов PRD (human-facing, вне runtime).
- Output format: пункт про note с допущениями/открытыми вопросами при достижении cap'а в 3 вопроса.

### Changed
- Identity: добавлена строка «внутренний анализ кратко и молча, рассуждения не выводить» — токен-дисциплина + усиление `reasoning_extraction`-правила Fable 5.
- RECENCY ZONE переименована: Verification → **Self-Critique** and Success Lock.

## [1.11.0] - 2026-06-11

### Changed
- **Дефолтная модель Claude в роутинге — теперь Fable 5** (разворот решения 1.8.0). Когда пользователь говорит «Claude» без указания версии, скилл целится в Claude Fable 5 / Mythos 5. Opus 4.8 / 4.7 — selectable fallback (по явному запросу или для benign-работы в доменах, где Fable 5 отказывает: offensive-security, biology/life-sciences). Обновлены `tool-profiles.md` (Claude-блок + подзаголовок Opus → «selectable fallback»), `SKILL.md` Gotchas (Fable 5 первым) и `models.md` (Fable 5 помечена как дефолтный routing-target, факт о харнесс-дефолте Opus 4.8 сохранён).
- Описания плагина/маркетплейса: Claude Fable 5 указана дефолтом; счётчик паттернов исправлен 35 → 38. README: строки Claude в таблице помечены «(default)» / «(fallback)».

## [1.10.0] - 2026-06-11

Две идеи из апстрим-PR: Cortex Code ([nidhinjs#15](https://github.com/nidhinjs/prompt-master/pull/15)) и датированный fact-sheet моделей с протоколом ре-верификации ([nidhinjs#48](https://github.com/nidhinjs/prompt-master/pull/48)).

### Added
- **Профиль Cortex Code** (Snowflake CLI-агент) в `tool-profiles.md`: anti-over-engineering guard, `cortex ctx` step-tracking, Snowflake-native инструменты, headless JSON-режим. Добавлен в README («Works with» + таблица профилей).
- **`references/models.md`** — датированный fact-sheet volatile-фактов (ID моделей, дефолты, version-tied параметры, что снято) по вендорам, каждая секция с `last-verified`. **Протокол: ре-верифицировать секцию старше 60 дней перед утверждением.** Быстро меняющиеся вендоры помечены `⚠️ verify`, а не выдуманы.
- **Pattern #38** «hardcoded retired model / dead parameter» в `patterns.md` (теперь 38 паттернов).
- Gotcha «Stale model facts» в `SKILL.md`.

### Changed
- `SKILL.md` Tool Routing: добавлен указатель на `models.md` + протокол ре-верификации; таблица Reference Files дополнена строкой `models.md`.
- `tool-profiles.md`: шапка указывает на `models.md` как на слой volatile-фактов (профили несут evergreen-советы, не point-in-time спеки моделей).

## [1.9.0] - 2026-06-11

Progressive disclosure (идея из апстрим-PR [nidhinjs#13](https://github.com/nidhinjs/prompt-master/pull/13)): tool-профили вынесены из `SKILL.md` и грузятся по требованию — меньше токенов на активацию и меньше «шумовых» инструкций, конкурирующих за внимание.

### Added
- **`references/tool-profiles.md`** — все ~28 per-tool профилей (Claude, Fable 5, GPT-5.x, reasoning-модели, агентные IDE, image/video/voice/3D/workflow AI, Prompt Decompiler, Unknown tool). Читается только секция под идентифицированный инструмент.
- **Секция Gotchas** в `SKILL.md` — быстрый чеклист самых частых per-tool ошибок (9 пунктов), ловит их без загрузки полного профиля.

### Changed
- **`SKILL.md` ужат**: блок Tool Routing с инлайн-профилями заменён on-demand указателем на `tool-profiles.md`. Ядро (identity, hard rules, intent extraction, diagnostics, memory, safe techniques, verification) и универсальные правила (Credential Safety, Input Sanitization) остаются всегда загруженными.
- Таблица Reference Files дополнена строкой `tool-profiles.md`.

## [1.8.0] - 2026-06-11

### Added
- **Маркетплейс-установка Claude Code.** Репозиторий теперь работает как плагин-маркетплейс: `.claude-plugin/marketplace.json` + `plugins/prompt-master/.claude-plugin/plugin.json`. Установка через `/plugin marketplace add azagreev/prompt-master-za` → `/plugin install prompt-master@prompt-master`.
- **Роутинг под Claude Fable 5 / Mythos 5** — отдельный блок: effort как главный рычаг (`high` по умолчанию), steer короткой интенцией вместо перечня правил, ground progress claims на длинных прогонах, явные boundaries, параллельные субагенты, memory-система.
- **Hard rule про `reasoning_extraction`** — запрет инструктировать Fable 5/Mythos 5 «покажи/воспроизведи свои рассуждения» (триггерит refusal и фолбэк на Opus 4.8); вместо этого — send-to-user tool.
- **Раздел Model-fit failures** в Diagnostic Checklist: over-specification для GPT-5.5/Fable 5, злоупотребление абсолютами, hardcoded effort, legacy-стек инструкций.

### Changed
- **Реструктуризация под плагин:** `SKILL.md` и `references/` перенесены в `plugins/prompt-master/skills/prompt-master/`.
- **Роутинг GPT-5.x переписан под GPT-5.5** (актуальный гайд OpenAI): outcome-first вместо пошагового процесса, `text.verbosity` для длины, перепроверка `low`/`medium` reasoning effort, preambles для tool-задач, retrieval budgets, отказ от лишних абсолютов и legacy-стека инструкций.
- Дефолтная модель Claude в роутинге остаётся Opus 4.8; Fable 5 добавлена как отдельная, более мощная опция с указателем из блока Claude.

## [1.7.0]
- Opus 4.8 compatibility. Claude 4.x routing стал version-aware: durable-советы обобщены на 4.6/4.7/4.8, добавлен профиль Opus 4.8 (дефолт), сохранён Opus 4.7. De-hardcoded effort-level (теперь harness-managed). Template M и pattern 36 покрывают 4.7/4.8.

## [1.6.0]
- Opus 4.7 update. Добавлен Template M (Opus 4.7 Task Brief). Обновлён роутинг Claude и Claude Code под литерализм, adaptive thinking, xhigh effort и session hygiene. Паттерны 36–37.

## [1.5.0]
- Расширен роутинг инструментов: Agentic AI и 3D Model AI. Description приведён к 189 символам. Убрана оценка токенов из вывода. Добавлен instruction layer и copywriting-плейсхолдеры.

## [1.4.0]
- Детекция reference image editing, поддержка ComfyUI, режим Prompt Decompiler. Исправлен trigger description. 3 новых шаблона в references.

## [1.3.0]
- Перестройка вокруг позиционной структуры PAC2026 (30/55/15). Silent routing вместо user-facing выбора фреймворка. Введён каталог references.

## [1.2.0]
- Реструктуризация под attention architecture. Убраны fabrication-prone техники (ToT, GoT, USC, prompt chaining). Шаблоны и паттерны вынесены в references.

## [1.1.0]
- Расширено покрытие инструментов, добавлена memory-block система и 35 credit-killing паттернов.

## [1.0.0]
- Первый релиз.

<!-- Версии 1.0.0–1.7.0 предшествуют форк-релизу в маркетплейс и в этом репозитории не тегированы. Footer-ссылки добавляются начиная с 1.8.0. -->

[1.21.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.21.0
[1.20.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.20.0
[1.19.1]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.19.1
[1.19.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.19.0
[1.18.1]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.18.1
[1.18.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.18.0
[1.17.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.17.0
[1.16.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.16.0
[1.15.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.15.0
[1.14.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.14.0
[1.13.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.13.0
[1.12.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.12.0
[1.11.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.11.0
[1.10.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.10.0
[1.9.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.9.0
[1.8.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.8.0
