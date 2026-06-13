# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[1.15.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.15.0
[1.14.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.14.0
[1.13.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.13.0
[1.12.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.12.0
[1.11.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.11.0
[1.10.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.10.0
[1.9.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.9.0
[1.8.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.8.0
