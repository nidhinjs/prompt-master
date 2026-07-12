# План рефакторинга каталога Prompt Patterns

**Статус:** implemented; acceptance green; release candidate `v1.36.0`
**Дата:** 2026-07-12
**Область:** `plugins/prompt-master/skills/prompt-master/references/patterns.md` и его runtime-потребители
**Релизный слот:** `v1.36.0` — Pattern Registry and Diagnostic Sharding
**Входные исследования:**

- `prompt-master-research-patterns-weaknesses-and-harsh-version.md`
- `prompt-master-proposed-patterns-cost-context-rot.md`
- полный аудит текущего `patterns.md`, `SKILL.md`, `agentic.md`, profiles, facts registry, README и lint-контрактов

Этот документ заменяет два входных черновика как **план реализации**, но не удаляет их: они остаются исследовательскими материалами и источником предложений.

---

## 1. Решение

Текущий `patterns.md` больше нельзя расширять простым добавлением строк `#62–#76`.

Нужно:

1. сохранить существующие 61 идентификатор и обратную совместимость ссылок;
2. превратить `references/patterns.md` в короткий router/landing page;
3. вынести содержимое в тематические шарды внутри `references/patterns/`;
4. отделить универсальные failure modes от runtime-политики, provider profiles и volatile facts;
5. добавить машинно-проверяемый индекс паттернов;
6. только после механического разделения выполнять смысловое объединение, переписывание и добавление новых паттернов.

Физическое разбиение выполняется по **механизму исправления и activation trigger**, а не по провайдеру, модели или хронологии появления.

---

## 2. Почему текущий монолит достиг предела

Текущий файл механически корректен:

- 61 строка паттернов;
- ID `1–61` уникальны и непрерывны;
- существующий `node scripts/lint.js` проходит;
- ссылки на известные номера разрешаются.

Но архитектурно файл смешивает:

- постановку задачи;
- управление контекстом;
- research integrity;
- agentic runtime;
- multi-agent orchestration;
- validation/review;
- prompt-injection и approval boundaries;
- model/tool routing;
- стоимость;
- media-generation;
- конкретные команды и настройки отдельных продуктов.

Из-за этого:

- пять строк `Research Patterns` фактически не относятся к research;
- один и тот же failure mode описан несколькими номерами без parent/related-связей;
- provider-specific сведения дублируют facts/profiles;
- `SKILL.md`, README и `patterns.md` уже расходятся семантически;
- добавление Cost и Context Rot как новых секций создаст дубли с `#20`, `#25`, `#37`, `#43`, `#46`, `#55` и `#58–#61`.

---

## 3. Целевая архитектура

```text
references/
├── patterns.md                         # compatibility router / landing page
└── patterns/
    ├── schema.json                     # схема метаданных
    ├── index.json                      # ID, shard, anchor, status, ownership
    ├── prompt-design.md                # постановка и форма задачи
    ├── context-state.md                # память, артефакты, состояние сессии
    ├── research-evidence.md            # retrieval, sources, evidence quality
    ├── agentic-execution.md            # исполнение с инструментами
    ├── orchestration.md                # multi-agent и coordinator/worker
    ├── evaluation-review.md            # проверка, evidence и review
    ├── safety-trust.md                 # trust, secrets, permissions, approval
    ├── routing-economics.md            # capability, surface, effort и cost
    └── media-generation.md             # image, video, audio, 3D и decks
```

### 3.1 Слои

```text
Проектирование
├── prompt-design
├── context-state
├── research-evidence
└── media-generation

Исполнение
├── agentic-execution
└── orchestration

Гарантии
├── evaluation-review
└── safety-trust

Выбор ресурсов
└── routing-economics
```

### 3.2 Runtime-бюджеты

- `references/patterns.md`: не более 100 строк и 12 KiB.
- Один Markdown-shard: не более 180 строк и 24 KiB без отдельного архитектурного решения.
- Обычная диагностика загружает router и не более двух шардов.
- Простая generic-задача по умолчанию читает только `prompt-design.md`.
- Provider-specific сведения не допускаются в нормативной части `Repair`.
- Draft/candidate-паттерны не входят в runtime manifest.

---

## 4. Границы ответственности

| Тип знания | Канонический источник | Допустимое содержание в patterns |
|---|---|---|
| Универсальный failure mode | `patterns/*.md` | Полное описание диагноза, repair и исключений |
| Always-loaded поведение скилла | `SKILL.md` | Короткая ссылка/объяснение, без второй версии правила |
| Runtime risk/approval policy | `agentic.md` | Диагностический пример и ссылка на точную секцию |
| Форма готового prompt artifact | `templates.md` | Ссылка на Template, без копии всего шаблона |
| Синтаксис конкретного surface/tool | `profiles/*.md` | Только provider-neutral failure mechanism |
| Model ID, status, channel, capability, parameter | `facts/*.json` | Никаких продублированных значений |
| Публичное описание | README EN/RU | Репрезентативная краткая выборка, не новый источник правил |

### 4.1 Направление зависимостей

```text
SKILL.md
  └── patterns.md
        └── patterns/<one-primary-shard>.md
              ├── optional second shard
              ├── exact agentic.md section
              ├── exact profile section
              └── selected facts record
```

Patterns не должны заставлять загружать все profiles или весь facts registry.

---

## 5. Реестр и стабильные ID

### 5.1 Правило идентичности

- Существующий `#52` становится `PM-052` с `legacy_id: 52`.
- ID не кодирует категорию: запрещены новые канонические IDs вида `R1`, `COST-4` или `AGENT-7`.
- Перемещение между файлами не меняет ID.
- Удалённый или объединённый ID остаётся tombstone-записью.
- Новые ID выдаются только после дедупликации и admission review.

### 5.2 Минимальная запись в `index.json`

```json
{
  "id": "PM-052",
  "legacy_id": 52,
  "title": "No runnable self-check",
  "family": "evaluation-review",
  "file": "evaluation-review.md",
  "anchor": "pm-052-no-runnable-self-check",
  "status": "active",
  "tags": ["agentic", "verification", "evidence"],
  "canonical_owner": "skill",
  "related": ["PM-003", "PM-022", "PM-032", "PM-042", "PM-055"]
}
```

### 5.3 Статусы

- `active` — применяется runtime.
- `deprecated` — сохранён для совместимости, не применяется к новым задачам.
- `merged` — логика перенесена в другой ID; обязателен `redirect_to`.
- `superseded` — заменён более точным паттерном или canonical policy.

### 5.4 Schema-инварианты

`schema.json` должен требовать:

- уникальный `PM-NNN`;
- уникальный `legacy_id`, если он задан;
- существующие `file` и `anchor`;
- известное `family`;
- допустимый `status`;
- валидные `related`, `redirect_to` и `canonical_owner`;
- отсутствие self-reference;
- отсутствие активной записи без Markdown-раздела.

---

## 6. Формат Markdown-паттерна

Длинные четырёхколоночные таблицы больше не являются каноническим форматом.

```markdown
## PM-052 — No runnable self-check

**Applies when:** агент может выполнить команду или изменить артефакт.

**Failure:** завершение определяется утверждением агента, а не наблюдаемым результатом.

**Repair:** задать исполняемую pass/fail-проверку и требовать evidence.

**Do not apply when:** задача является brainstorming или draft-only.

**Canonical rule:** ../agentic.md#evidence-policy

**Related:** PM-003, PM-032, PM-055
```

Обязательные поля:

1. `Applies when`.
2. `Failure`.
3. `Repair`.
4. `Do not apply when`.
5. `Canonical rule` или `Canonical owner`.
6. `Related`, если существует пересечение.

Правила редакции:

- один паттерн — один failure mechanism;
- один repair не должен одновременно решать несвязанные проблемы;
- `always`/`never` допустимы только для hard safety/runtime contracts;
- числовой порог требует источника или явного статуса project policy;
- provider name может появиться только в ненормативном примере со ссылкой на profile/facts;
- «уверенность модели» не заменяет retrieval, evidence или verification;
- repair не может требовать новую authority, tool access или расход без условия применимости.

---

## 7. Первичное распределение существующих ID

Это распределение является baseline для механической миграции. Смысловые изменения выполняются отдельной фазой.

| Shard | Legacy IDs |
|---|---|
| `prompt-design.md` | 1, 2, 5, 6, 12, 14, 15, 16, 17, 20, 26, 39, 41, 56 |
| `context-state.md` | 7, 8, 9, 10, 13, 21, 25, 28, 29, 37, 53, 54 |
| `research-evidence.md` | 11, 30, 43, 44, 45 |
| `agentic-execution.md` | 22, 23, 31, 32, 33, 57 |
| `orchestration.md` | 58, 59, 60, 61 |
| `evaluation-review.md` | 3, 42, 52, 55 |
| `safety-trust.md` | 4, 34, 35, 40 |
| `routing-economics.md` | 24, 27, 38, 46, 48, 51 |
| `media-generation.md` | 18, 19, 47, 49, 50 |
| Compatibility tombstone | 36 |

### 7.1 Особые миграции

- `PM-036`: deprecated/merged; универсальная часть распределяется между `PM-001`, `PM-003` и `PM-020`. Hardcoded Opus claim удаляется.
- `PM-037`: переписывается вокруг реальных сигналов context pollution и task boundary; удаляются произвольные `60+ turns` и `~50% context`.
- `PM-040`: перестаёт обещать защиту одним role-lock; repair ссылается на Canonical Trust Boundary.
- `PM-042`: остаётся validation-паттерном; context-overload часть переносится в связь с `PM-037`, а не остаётся вторым failure mechanism.
- `PM-053`: `verbatim` сохраняется только после удаления secrets/PII и выбора релевантного фрагмента или file reference.
- `PM-056`: временно остаётся umbrella-паттерном; split на taste/prototype и unfamiliar-domain/blindspot допускается только после behavioral evidence.
- `PM-058`: требует premise check, но не обязательно отдельного worker.
- `PM-060`: ограничивается Advisor/orchestration misuse; settings knobs принадлежат `PM-048`, review breadth — `PM-055`.

---

## 8. Обработка двух текущих proposal-документов

Номера `62–76` в proposal-документах являются draft labels, не зарезервированными IDs.

### 8.1 Research proposal

| Draft | Решение |
|---|---|
| R1 vague goal | Переписать `PM-043` |
| R2 no live retrieval | Переписать `PM-044` |
| R3 unverified citation | Переписать `PM-045` с provider-native exception |
| R4 incompatible retrieval/reasoning | Переписать `PM-046` |
| R5 no falsification | Новый кандидат; применять только к аналитическим/causal/decision исследованиям |
| R6 research scope drift | Новый кандидат; approval нужен только для материального расширения |
| R7 secondary-source dependence | Новый кандидат; использовать подходящую source hierarchy, а не догму «primary always» |
| R8 no cheap verification | Новый кандидат; verification должен быть дешёвым, доступным и разрешённым |

Запрещено:

- отклонять vague research request вместо best-effort assumptions;
- force-enable retrieval без доступного/разрешённого инструмента;
- требовать inline URLs там, где surface возвращает citations отдельным каналом;
- требовать falsification-section для простого fact lookup;
- останавливать исследование из-за любого несущественного scope observation.

### 8.2 Cost proposal

| Draft | Решение |
|---|---|
| 62 exhaustive scan | Объединить с `PM-020` и `PM-025` |
| 63 all sources without cap | Объединить с `PM-043` и `PM-055` |
| 64 unbounded fan-out | Объединить с `PM-058`, `PM-059` и `PM-061` |
| 65 heavy model for triage | Новый кандидат в `routing-economics.md` |
| 66 full regeneration | Обобщить `PM-050` до delta-vs-regeneration либо создать отдельный кандидат после проверки |
| 67 excessive media quality/count | Новый кандидат в `media-generation.md` с тегом `cost` |
| 68 reasoning plus tools | Объединить с `PM-046` |
| 69 full session history | Объединить с `PM-025` и `PM-037` |
| 70 Advisor every step | Объединить с `PM-060` |

### 8.3 Context Rot proposal

| Draft | Решение |
|---|---|
| 71 no reset/re-anchor | Переписать `PM-037` |
| 72 correction loop | Переписать `PM-037`; использовать evidence-based trigger |
| 73 full history | Дубликат draft 69; отдельный ID запрещён |
| 74 re-anchor every 8–10 turns | Отклонить: произвольный порог и дополнительный token tax |
| 75 investigation in main agent | Объединить с `PM-061`; subagent только для независимого bounded package/context isolation |
| 76 failed artifacts pollute context | Встроить в `PM-013`, `PM-037` и Memory Block policy |

---

## 9. Admission gate для нового паттерна

Новый ID создаётся только если на все обязательные вопросы получен положительный ответ:

1. Это повторяемый failure mechanism, а не единичный совет?
2. Он применим более чем к одному provider/tool либо является hard safety rule?
3. Его нельзя выразить расширением существующего паттерна?
4. У него отдельный trigger, failure и repair?
5. Repair можно сформулировать без volatile model IDs и параметров?
6. Есть `Do not apply when`?
7. Определён canonical owner?
8. Известны связанные паттерны и проверено отсутствие дубля?
9. Если меняется runtime-поведение, определены deterministic contract tests?
10. Если правило эмпирическое, указан источник и дата проверки?

Если ответ отрицательный:

- provider/tool fact → `facts/*.json`;
- provider prompting syntax → `profiles/*.md`;
- готовая форма → `templates.md`;
- runtime authority/security → `agentic.md` или `SKILL.md`;
- гипотеза без достаточного основания → `docs/refacktoring/`, не runtime.

### 9.1 Gate для нового shard-файла

Новый файл создаётся только когда:

- есть минимум 4 самостоятельных active-кандидата;
- существует отдельный activation trigger;
- shard можно загрузить независимо;
- ожидается иная скорость изменений или canonical dependency;
- существующий shard превысит бюджет либо станет семантически неоднородным.

Возможные будущие семейства, которые пока **не создаются**:

- `reasoning-control.md`;
- `workflow-automation.md`;
- `structured-output-data.md`;
- `human-interaction.md`;
- `prompt-lifecycle.md`.

---

## 10. Фазы реализации

### Phase 0 — Baseline и freeze

Цель: зафиксировать исходное состояние без изменения runtime-поведения.

Действия:

- записать список `PM-001–PM-061`, titles и текущие cross-references;
- зафиксировать текущий `lint` result;
- зафиксировать runtime-manifest и package inventory;
- определить все упоминания `pattern #N` в SKILL, profiles, templates, README, tests и docs;
- отметить существующие semantic drifts отдельным ledger.

Acceptance:

- `PARCH-00-01`: ровно 61 уникальный baseline ID;
- `PARCH-00-02`: нет потерянной ссылки;
- `PARCH-00-03`: unrelated untracked files не меняются;
- `PARCH-00-04`: real Claude/golden runner не запускается.

### Phase 1 — Schema, index и lint до переноса контента

Цель: сначала построить fail-closed инфраструктуру.

Действия:

- создать `patterns/schema.json`;
- создать `patterns/index.json` с 61 записью;
- расширить `scripts/lint.js`;
- валидировать count, IDs, legacy IDs, family, file, anchor, status и redirects;
- добавить negative fixtures для duplicate/missing/orphan/broken redirect;
- подготовить runtime-manifest к новым файлам.

Acceptance:

- `PARCH-01-01`: header count сравнивается с фактическим active count;
- `PARCH-01-02`: duplicate ID и duplicate legacy ID fail closed;
- `PARCH-01-03`: отсутствующий shard/anchor fail closed;
- `PARCH-01-04`: tombstone без redirect fail closed;
- `PARCH-01-05`: validator не требует network или model execution.

### Phase 2 — Механическое sharding без смысловой правки

Цель: доказать, что все 61 записи перенесены ровно один раз.

Действия:

- создать девять Markdown-shards;
- перенести существующие записи по baseline mapping;
- заменить `patterns.md` на router и краткий индекс;
- обновить `runtime-manifest.json`;
- обновить `SKILL.md` Reference Files routing;
- обновить internal links в `agentic.md`, profiles и templates;
- сохранить legacy `pattern #N` resolution.

Acceptance:

- `PARCH-02-01`: 61/61 IDs имеют ровно один active Markdown anchor или tombstone;
- `PARCH-02-02`: нет orphan sections;
- `PARCH-02-03`: generic task загружает один primary shard;
- `PARCH-02-04`: composite task загружает не более двух;
- `PARCH-02-05`: package inventory совпадает с runtime manifest.

### Phase 3 — Semantic cleanup

Цель: устранить обнаруженные противоречия без добавления новых паттернов.

Обязательный scope:

- conditional role assignment в `PM-016`;
- evidence вместо confidence в `PM-011/030/045`;
- canonical trust boundary в `PM-040`;
- redaction и context minimization в `PM-053`;
- milestone progress вместо after-every-step в `PM-022/033`;
- корректный context reset/re-anchor в `PM-037`;
- premise check без обязательного worker в `PM-058`;
- single-concern `PM-060`;
- синхронизация `PM-052` с README и coding-agent profile.

Acceptance:

- `PARCH-03-01`: один canonical owner на каждое hard rule;
- `PARCH-03-02`: README не противоречит runtime;
- `PARCH-03-03`: provider-specific normative claims отсутствуют;
- `PARCH-03-04`: каждый active pattern содержит applicability и exception;
- `PARCH-03-05`: no semantic weakening of safety or approval gates.

### Phase 4 — Research integrity

Цель: заменить слабый research-кластер без tool-specific шума.

Действия:

- переписать `PM-043–PM-046`;
- admission-review кандидатов falsification, scope drift, source hierarchy и cheap verification;
- обновить `research-browser.md` только если меняется canonical research contract;
- добавить deterministic source-contract tests.

Acceptance:

- `PARCH-04-01`: research shard не содержит media/deck patterns;
- `PARCH-04-02`: citation contract остаётся provider-native;
- `PARCH-04-03`: primary-source preference имеет domain-appropriate exceptions;
- `PARCH-04-04`: simple lookup не получает обязательную heavy research ceremony.

### Phase 5 — Cost и context health

Цель: добавить экономическую осознанность через дедупликацию, а не через массовую нумерацию.

Действия:

- встроить targeted-scan и compact-context repairs в существующие паттерны;
- admission-review heavy-model triage и progressive media quality;
- добавить `Cost awareness` и `Context health` в self-critique только в компактной форме;
- расширить Memory Block только доказанно полезными state fields;
- не добавлять periodic turn-based rituals.

Acceptance:

- `PARCH-05-01`: ни один draft duplicate не получил новый ID;
- `PARCH-05-02`: cost repair не требует модель/агента без justification;
- `PARCH-05-03`: context-health rule использует события, а не произвольный turn count;
- `PARCH-05-04`: self-critique остаётся одним проходом.

### Phase 6 — Public docs, packaging и release decision

Действия:

- обновить README EN/RU representative tables;
- генерировать или строго валидировать active count;
- обновить installation и runtime inventory;
- выполнить только deterministic/offline gates;
- сформировать release evidence;
- назначить версию отдельным roadmap decision.

Acceptance:

- `PARCH-06-01`: README links ведут на compatibility router;
- `PARCH-06-02`: package содержит schema/index и все active shards;
- `PARCH-06-03`: две сборки идентичны;
- `PARCH-06-04`: `git diff --check` и safe offline gates зелёные;
- `PARCH-06-05`: commit/tag/push/publication выполняются только по отдельному явному запросу.

---

## 11. Проверки

Разрешённые проверки:

- `node scripts/lint.js`;
- registry/runtime inventory validators;
- source-contract tests;
- schema fixtures;
- link/anchor checks;
- package inventory и deterministic-build checks;
- fake-Claude tests с изолированным абсолютным fake executable.

Запрещено без нового явного разрешения пользователя:

- `scripts/run-golden.js`;
- `claude -p`;
- любой реальный Claude/model runner;
- live behavioral attestation;
- dependency installation.

### 11.1 Acceptance traceability

Каждый acceptance ID до статуса complete должен иметь запись:

```text
Acceptance ID → test/manual review → fixture/input → command → expected result → evidence
```

Допустимые классы доказательств:

- `automated-offline` — обязательный deterministic test в normal CI;
- `manual-source-review` — точные `file:line` и reviewer verdict для семантического правила;
- `conditional-live` — поведение модели, проверяемое только после отдельного разрешения.

Нельзя закрывать acceptance ID:

- одним утверждением «looks correct»;
- только зелёным общим lint без targeted fixture;
- recorded output fixture, выданным за реальное выполнение модели;
- manual review без указания проверенных файлов и правила.

### 11.2 Offline source-contract и E2E matrix

`PARCH-E2E-01`–`PARCH-E2E-05` ниже являются recorded source contracts:
они проверяют, что router, index и canonical wording кодируют ожидаемый выбор,
но не исполняют свободный пользовательский запрос через реальную модель. Это
не behavioral routing E2E и не должно так называться в отчётах.

| ID | Путь | Ожидаемый результат | Evidence class |
|---|---|---|---|
| `PARCH-E2E-01` | Recorded generic-diagnosis contract | Router/index указывают только `prompt-design.md` | automated-offline-source-contract |
| `PARCH-E2E-02` | Recorded live/citable-research contract | Router/index указывают `research-evidence.md`; citation contract остаётся provider-native | automated-offline-source-contract + manual-source-review |
| `PARCH-E2E-03` | Recorded agentic-code contract | Router/index указывают `agentic-execution.md` и точную canonical ссылку на `agentic.md` | automated-offline-source-contract |
| `PARCH-E2E-04` | Recorded explicit-multi-agent contract | Router/index указывают `orchestration.md`; worker packet остаётся bounded | automated-offline-source-contract |
| `PARCH-E2E-05` | Recorded media-edit contract | Router/index указывают `media-generation.md`; delta/preservation contract не дублирует provider facts | automated-offline-source-contract + manual-source-review |
| `PARCH-E2E-06` | Legacy `pattern #52` lookup | Разрешается в `PM-052`, существующий shard и anchor | automated-offline |
| `PARCH-E2E-07` | Merged `PM-036` lookup | Разрешается через tombstone и валидный `redirect_to` | automated-offline |
| `PARCH-E2E-08` | Duplicate/missing/orphan/broken redirect mutation | Validator завершается non-zero с точной причиной | automated-offline |
| `PARCH-E2E-09` | Два запуска реального offline packager → ZIP runtime | Schema, index, router и все shards присутствуют, byte-equal source; SHA-256 двух сборок совпадает | automated-offline + release-gate evidence |
| `PARCH-E2E-10` | Strict safe gate | Pattern tests входят в expected/executed/passed; real Claude недоступен | automated-offline |

Минимальные test surfaces:

- `scripts/validate-patterns.js`;
- `scripts/test-patterns.js`;
- `scripts/test-pattern-routing.js`;
- `scripts/test-pattern-package.js`;
- `tests/patterns/mutations.json`;
- `tests/patterns/routing-cases.json`;
- `tests/patterns/legacy-resolution.json`;
- `tests/patterns/semantic-contracts.json`.

`scripts/test-pattern-package.js` — быстрый package-source contract. Он не
подменяет `PARCH-E2E-09`: release gate обязан отдельно запустить
`scripts/package-skill.ps1`, проверить созданный ZIP и повторить сборку для
сравнения SHA-256.

### 11.3 Behavioral E2E boundary

Offline E2E доказывает структуру, routing contract, links, packaging и fail-closed
поведение validators. Он не доказывает, что реальная модель правильно применит
паттерн к свободному пользовательскому тексту.

Recorded semantic fixtures проверяют assertion machinery и contract wording, но
не называются live behavioral E2E.

Live путь:

```text
user request → skill activation → reference loading → pattern selection
→ generated prompt → acceptance assertions
```

относится к `conditional-live`, не входит в normal CI и требует отдельного
разрешения в активной сессии. Fake-Claude разрешён только для доказательства,
что harness не вызывает реальный CLI; он не заменяет behavioral attestation.

---

## 12. Rollout

Рекомендуемый rollout:

1. Phase 0–2 отдельным architecture commit.
2. Phase 3 отдельным semantic-cleanup commit.
3. Phase 4 отдельным research-integrity commit.
4. Phase 5 отдельным cost/context commit.
5. Phase 6 только после review полного diff.

Не объединять mechanical move и semantic rewrite в один огромный diff: это делает проверку полноты миграции ненадёжной.

---

## 13. Rollback

Rollback должен быть возможен по фазам:

- после Phase 1 удалить registry infrastructure без изменения runtime;
- после Phase 2 вернуть монолит, используя `index.json` как completeness map;
- после Phase 3 откатить semantic commit, не возвращая старую архитектуру;
- новые IDs из Phase 4–5 не переиспользовать после публикации;
- опубликованные tombstones не удалять.

Rollback не должен:

- перенумеровывать существующие IDs;
- переписывать released tags;
- ослаблять trust/approval contracts;
- удалять fixtures ради зелёного lint.

---

## 14. Definition of Done

Работа завершена, когда:

- `patterns.md` является коротким router;
- все active-паттерны находятся в одном из девяти шардов;
- каждый ID стабилен и машинно разрешим;
- один паттерн описывает один failure mechanism;
- provider facts и syntax не дублируются;
- runtime policy имеет одного canonical owner;
- research, cost и context proposals интегрированы через merge/admission review;
- count, links, anchors, redirects и package inventory валидируются fail closed;
- README, SKILL и runtime не противоречат друг другу;
- normal verification остаётся полностью offline и не может вызвать реальный Claude runner.

---

## 15. Release decision

Изначально roadmap резервировал:

- `v1.36.0` — Portable Verification and Historical Provenance;
- `v1.37.0` — conditional Behavioral Attestation.

Публикация сразу как `v1.38.0` создала бы необоснованный SemVer-разрыв после
`v1.35.0`. По отдельному решению пользователя от 2026-07-12 текущая работа
выпускается последовательно как:

- `v1.36.0` — Pattern Registry and Diagnostic Sharding.

Оставшиеся roadmap-пакеты перенумеровываются:

- `v1.37.0` — Portable Verification and Historical Provenance;
- `v1.38.0`, conditional — Behavioral Attestation.

Исторические acceptance IDs сохраняются для traceability и не означают, что
пропущенные версии были опубликованы.

---

## 16. Результат выполнения — 2026-07-12

План был выполнен и проверен до release-операций. Отдельное разрешение на
version bump, commit, tag, push и publication получено 2026-07-12; эти действия
не входят в deterministic implementation gate. Реальный Claude/model runner не
запускался. Два существующих untracked handoff/model-guidance файла и сырой
MinerU-документ сохранены вне release scope.

### 16.1 Automated evidence

| Acceptance | Fixture / input | Команда | Результат |
|---|---|---|---|
| `PARCH-00-01`, `PARCH-01-*`, `PARCH-02-01–04`, `PARCH-E2E-06–08` | `patterns/index.json`, 47 adversarial mutations, legacy/tombstone fixtures | `node scripts/test-safe.js --strict` | pattern registry `47/47`; 61 indexed, 60 active, 1 tombstone, 9 shards |
| `PARCH-E2E-01–05` | `tests/patterns/routing-cases.json` (`live_behavior: false`) | тот же strict gate | recorded routing/source contracts `6/6`; behavioral E2E не заявлен |
| `PARCH-02-05`, `PARCH-06-02`, package source contract | runtime manifest и package fixture | тот же strict gate | package contracts `4/4`; runtime inventory `9/9` |
| `PARCH-03-*`, `PARCH-04-*`, source wording | `tests/patterns/semantic-contracts.json` | тот же strict gate | source contracts `10/10`; lint `0 errors, 0 warnings` |
| `PARCH-E2E-10`, `PARCH-00-04` | isolated POSIX/Windows Claude deny-shims | тот же strict gate | `expected=14 executed=14 passed=14 failed=0 skipped=0`; offline golden fixtures `71/71`; runner-safety `7/7` |
| `PARCH-06-03`, `PARCH-E2E-09` | два последовательных реальных offline package builds | `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/package-skill.ps1 -AllowDirty` | обе сборки: `0d1fee0239e689e495c1a7052757dffc650617cb215ddd56cde90b6fb890e9fd` |
| ZIP integrity | второй локальный artifact | `unzip -t dist/prompt-master-1.36.0.zip` | 44/44 entries OK; schema, index, router и девять shards присутствуют |
| `PARCH-06-04` | полный tracked/untracked implementation diff | `git diff --check` | exit 0 |

### 16.2 Manual source review

| Acceptance | Проверенные canonical места | Verdict |
|---|---|---|
| `PARCH-03-01`, `PARCH-03-05` | `SKILL.md:33–35,158–164`; `references/agentic.md:30–37,194–201`; все `patterns/*.md` строки `Canonical owner` | один owner на запись; автономность только reversible/in-scope/below-threshold; approval не ослаблен |
| `PARCH-03-02–04` | README EN/RU Pattern Library; `patterns/prompt-design.md`; `patterns/context-state.md:88–104`; `patterns/agentic-execution.md`; `patterns/orchestration.md` | public/runtime wording согласовано; provider-specific normative repairs отсутствуют; active sections имеют applicability и exception |
| `PARCH-04-01–04` | `patterns/research-evidence.md:1–50`; `profiles/research-browser.md:27–39`; `templates.md:558–570`; `SKILL.md:194` | research-only shard; provider-native attribution сохранён; primary-source preference domain-appropriate; simple lookup освобождён от heavy ceremony |
| `PARCH-05-01–04` | `patterns/prompt-design.md:88–141`; `patterns/context-state.md:58–104`; `patterns/evaluation-review.md:25–40`; `patterns/orchestration.md:7–40`; `SKILL.md:213–223` | draft duplicates не получили IDs; cost repairs bounded; context reset event-based; self-critique остаётся одним проходом |
| `PARCH-06-01`, `PARCH-06-05` | README EN/RU router links; отдельная publication authorization | ссылки ведут на compatibility router; release-операции разрешены только отдельным запросом от 2026-07-12 |

### 16.3 Conditional boundary

Свободный запрос через реальную модель не исполнялся. Такой behavioral E2E
остаётся `conditional-live` и требует отдельного явного разрешения пользователя;
recorded source contracts и fake/deny-shim проверки его не подменяют.
