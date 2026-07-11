# Итоговая оценка: 5.3/10

## Вердикт

Проект пригоден для пилотного использования с обязательной проверкой человеком, но не готов к эксплуатации в автономных или security-sensitive агентных процессах. Основные блокеры: ложноположительный safe gate, неполная защита от indirect prompt injection и два подтверждённых нарушения контрактов внешних инструментов.

Уверенность аудита: **высокая для статической структуры и тестовой инфраструктуры, средняя для фактического поведения моделей**.

Подтверждено: **Critical 0 / High 4 / Medium 10 / Low 2 / Info 1**. Отдельно зарегистрирована **1 Medium-гипотеза** по Windows, не включённая в подтверждённые дефекты.

## Ключевые выводы

1. `scripts/test-safe.js` может завершиться с exit `0`, даже когда выполнено `0/5` обязательных проверок.
2. Защита от prompt injection распространяется только на вставленные промпты, но не на файлы, web/MCP/tool output и сообщения других агентов.
3. Sonar получает взаимоисключающие требования: не просить URL и одновременно возвращать inline URL.
4. Midjourney-маршрут системно соединяет V8.1 с `--oref`, хотя Omni Reference работает только с V7.
5. 46 golden-сценариев существуют, но CI не проверяет фактическое поведение скилла или модели.
6. Варианты, split-режим, формат ответа и retry-limit описаны несколькими несовместимыми правилами.
7. Архитектура references логична по назначению, но progressive disclosure ослаблена монолитным `tool-profiles.md` и дублированием volatile-фактов.
8. Claude Code packaging полный; Codex CLI не обнаружит этот скилл автоматически в текущей структуре.
9. Текущий ZIP `1.31.0` цел и идентичен runtime-исходникам; рабочее дерево осталось чистым.
10. Сильные стороны: R0-R6, Preview/Draft/Commit, запрет self-approval, безопасные guards golden runner и явное удаление секретов.

## Выполнение мультиагентного аудита

| Пакет | Агент | Scope | Статус | Результат |
|---|---|---|---|---|
| A | `worker_a_architecture` | Все файлы, связи, ссылки, версии, архитектура | done | 7 Medium, 2 Low, 1 Info; затем независимая cross-check |
| B | `worker_b_logic` | `SKILL.md`, все references, metadata, 15 сценариев, официальные provider-факты | done | Логические конфликты и маршрутизация |
| C | `worker_c_tests_security` | CI, scripts, tests, hooks, security, release | done | Тесты, injection, supply chain, эксплуатационные риски |

Все три пакета первоначально выполнялись параллельно. Субагенты рабочих агентов не создавались. Worker A затем перепроверил 10 чужих High findings; повторный запрос Worker B был остановлен после получения результата A и не влиял на его завершённый основной пакет.

Cross-check подтвердил PM-01, PM-02, PM-03 и PM-04; снизил coverage, activation, split и Template L findings до Medium; Windows fake-runner оставил `indeterminate`. Координатор дополнительно снизил GPT-5.5 finding до Medium после сверки противоречащих друг другу официальных страниц OpenAI.

## Оценка по направлениям

| Область | Балл | Вес | Взвешенно | Обоснование | Уверенность |
|---|---:|---:|---:|---|---|
| Логика и непротиворечивость | 5.0 | 20% | 1.000 | Есть конфликтующие output, question, variant и retry contracts | высокая |
| Архитектура и целостность | 6.0 | 15% | 0.900 | Компоненты разделены, но источники истины дублируются | высокая |
| Безопасность | 5.5 | 15% | 0.825 | Сильные direct guards, неполная indirect-injection boundary | высокая |
| Тестируемость и покрытие | 4.0 | 15% | 0.600 | Инфраструктура есть, поведение скилла в CI не исполняется | высокая |
| Функциональная полнота | 6.0 | 10% | 0.600 | Широкий охват, но незавершённые fallback-ветви | средняя |
| Совместимость и актуальность | 5.0 | 10% | 0.500 | Provider defects и отсутствие Codex packaging | средняя |
| Сопровождаемость | 5.0 | 10% | 0.500 | Монолитные profiles, volatile duplication, слабая release provenance | высокая |
| Документация и удобство | 7.0 | 5% | 0.350 | Подробные README/docs, три битые локальные ссылки | высокая |

Формула:

```text
5.0×0.20 + 6.0×0.15 + 5.5×0.15 + 4.0×0.15 +
6.0×0.10 + 5.0×0.10 + 5.0×0.10 + 7.0×0.05
= 5.275 → 5.3
```

## Состав и архитектура

Проверено 52 tracked-файла:

```text
.
├── root metadata/docs                         9 файлов
├── docs/                                     22 файла
├── plugins/prompt-master/
│   ├── .claude-plugin/plugin.json
│   ├── hooks/{hooks.json,multi-agent-detect.js}
│   └── skills/prompt-master/
│       ├── SKILL.md
│       └── references/
│           ├── agentic.md
│           ├── models.md
│           ├── patterns.md
│           ├── templates.md
│           └── tool-profiles.md
├── scripts/                                  10 файлов
└── tests/golden/                              2 файла
```

Карта зависимостей:

```text
marketplace.json → plugin.json → {hook, SKILL.md}
SKILL.md → {agentic, models, patterns, templates, tool-profiles}
tool-profiles ↔ templates; оба зависят от models
CI → test-safe → {hook, lint, syntax, offline oracle, fake runner}
release scripts → skill directory → dist ZIP
```

`SKILL.md` содержит always-loaded ядро; `models.md` задуман как volatile source; `agentic.md` отвечает за автономность и риски; `patterns.md` за анти-паттерны; `templates.md` за формы результата; `tool-profiles.md` за маршрутизацию. Распределение разумное, но `tool-profiles.md` имеет 541 строку и 61 515 байт, а профили не разделены на отдельные файлы или устойчивые heading anchors.

## Реестр findings

| ID | Критичность | Категория | Краткое описание | Доказательство | Уверенность | Перепроверка |
|---|---|---|---|---|---|---|
| PM-01 | High | Tests | Safe gate допускает exit 0 при `0/5` | `scripts/test-safe.js:40-56` | высокая | confirmed |
| PM-02 | High | Security | Нет indirect-injection boundary | `SKILL.md:121-129`; `agentic.md:163-180` | высокая | confirmed |
| PM-03 | High | Tool contract | Конфликт URL/citations для Sonar | `tool-profiles.md:427,429`; `templates.md:537-544` | высокая | confirmed |
| PM-04 | High | Tool routing | Несовместимая пара V8.1 + `--oref` | `SKILL.md:107`; `models.md:149`; `tool-profiles.md:456` | высокая | confirmed |
| PM-05 | Medium | Coverage | 46 behavioral scenarios не исполняются CI | `.github/workflows/ci.yml:14-15`; `tests/golden/` | высокая | downgraded |
| PM-06 | Medium | Logic | Конфликты single/split, N/3 variants, format и retry | `SKILL.md:14,33,39,52-71,139,180`; `templates.md` | высокая | downgraded |
| PM-07 | Medium | Security | Sanitizer конфликтует с `Original prompt: [paste]` | `SKILL.md:115-129`; `templates.md:416-454` | высокая | downgraded |
| PM-08 | Medium | Completeness | Неполные activation и fallback contracts | `SKILL.md:4,20,84,246-254`; `tool-profiles.md:532-541` | высокая | downgraded |
| PM-09 | Medium | Architecture | Progressive disclosure и sources of truth рассинхронизируются | `SKILL.md:27,80,86`; `models.md:3`; `tool-profiles.md:1-13` | высокая | coordinator verified |
| PM-10 | Medium | Currentness | Не различаются production/preview model channels | `models.md:29-37`; `SKILL.md:96` | средняя | coordinator downgraded |
| PM-11 | Medium | Compatibility | Нет Codex-discoverable packaging | Инвентаризация; присутствует только `.claude-plugin` | высокая | coordinator verified |
| PM-12 | Medium | Test oracle | Regex evaluator даёт ложные pass/fail | `golden-assertions.js:1-29` | высокая | coordinator verified |
| PM-13 | Medium | Supply chain | Невоспроизводимые CI/release/install controls | `ci.yml:10-15`; `package-skill.ps1:66-87`; `bump-version.ps1:176-186` | высокая | coordinator verified |
| PM-14 | Medium | Operations | Локальный allowlist разрешает широкие destructive/release команды | `.claude/settings.local.json:6-26` | высокая | coordinator verified |
| PM-15 | Low | Documentation | Три битые ссылки на `docs/sources.md` | `CHANGELOG.md:383,432,439` | высокая | coordinator verified |
| PM-16 | Low | Hook | Возможны ложные срабатывания и неполный agentic context | `multi-agent-detect.js:27-48,73-83` | средняя | coordinator verified |
| PM-17 | Info | Artifact history | Игнорируемый ZIP 1.29.0 не воспроизводится из тега | ZIP entry против `git ls-tree v1.29.0` | высокая | coordinator verified |
| R-01 | Medium risk | Portability | POSIX fake launcher может не перехватить Windows runner | `test-run-golden-safe.js:47-84` | средняя | indeterminate |

### Подробное раскрытие High и Medium

**PM-01.** Обязательный gate должен fail closed, но `EPERM` увеличивает только `skipped`, после чего `failed === 0` приводит к exit `0`. Условие воспроизведено: `OK: 0/5 ... 5 skipped`. Влияние: зелёный результат без единой проверки. Рекомендация: минимальный executed-count, запрет skips в CI и отдельный машинный статус.

**PM-02.** `SKILL.md` объявляет inert data только содержимое вставленного промпта. При чтении malicious repository file, issue, web page, MCP/tool result или worker output такого правила нет. При наличии shell/network это создаёт путь к scope bypass и эксфильтрации. Рекомендация: единая trust boundary для всех наблюдаемых данных, instruction/data separation и egress allowlist.

**PM-03.** `tool-profiles.md:427` запрещает просить URLs, а строка 429 и Template N требуют inline links. Официальный Sonar guide предписывает читать источники из top-level `citations` и `search_results`, а не генерировать URL в тексте. Результат может содержать выдуманные или неверно связанные ссылки. Рекомендация: отдельный Sonar-native citation contract. [Официальный Sonar Prompt Guide](https://docs.perplexity.ai/docs/sonar/prompt-guide).

**PM-04.** Runtime направляет запрос consistency к V8.1 с `--oref`. Midjourney указывает, что V8.1 является default, но Omni Reference автоматически использует V7 и совместим только с V7. Рекомендация: capability matrix и явное переключение на V7 при `--oref`. Та же первопричина видна в Template J, где поле Negative prompt безусловно добавляется для Grok, хотя профиль запрещает такой параметр. [Omni Reference](https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference), [Version compatibility](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version).

**PM-05.** CI запускает только `test-safe.js`. 46 scenarios имеют assertions, но 7 offline fixtures проверяют лишь evaluator на заранее записанных outputs и покрывают 5 уникальных scenario IDs. Изменение security clauses в `SKILL.md` не обязательно сломает CI. Рекомендация: deterministic clause-contract tests и обязательная pre-release behavioral attestation.

**PM-06.** Подтверждены четыре конфликта: single prompt против Prompt 1/2; пользовательское N против жёстких трёх вариантов; always-critical format против derive-and-surface; `until passes` против лимитов 2 и 3. Проявление: split-запрос, ровно два варианта, отсутствующий формат либо стабильно падающий тест. Рекомендация: единый precedence graph, формальные caps и перечисленные исключения.

**PM-07.** Hard rules запрещают повторять секреты и hostile directives, но Template L требует вставить `Original prompt`. Верхний приоритет снижает риск, однако не объясняет безопасное заполнение шаблона. Рекомендация: redacted structural summary вместо исходного текста.

**PM-08.** Metadata предполагает названный target tool, тогда как README и Decompiler допускают targetless/analyse/split flows. Unknown tool только отправляется в «ближайшую категорию», а отсутствующий reference не имеет fail-closed поведения. Результат зависит от эвристики или памяти модели. Рекомендация: расширить activation verbs, определить capability fingerprint и `[unverified]` fallback.

**PM-09.** `models.md` объявлен единственным местом volatile-фактов, но defaults и IDs повторяются в ядре и profiles; no-CoT список также назван single source и затем повторён. Монолитный profiles-файл ослабляет заявленную загрузку только одной категории. Рекомендация: структурированный canonical registry и отдельные profile-файлы с автоматической проверкой ссылок.

**PM-10.** Проект называет GPT-5.5 current target. Официальный каталог по-прежнему рекомендует GPT-5.5 для production, но отдельный guide уже описывает GPT-5.6 и миграцию; GPT-5.6 имеет ограниченный preview-доступ. Это не однозначно неверный default, но 60-дневный freshness gate не моделирует release channel и доступность. Рекомендация: поля `channel`, `availability`, `recommended_for` и проверка каждого запроса «latest». [OpenAI Models](https://developers.openai.com/api/docs/models), [GPT-5.6 guide](https://developers.openai.com/api/docs/guides/latest-model).

**PM-11.** Проект является Claude plugin: `.claude-plugin/plugin.json`, Claude marketplace и Claude hook. Codex ищет repository skills в `.agents/skills`, а plugin требует `.codex-plugin/plugin.json`; этих entry points нет. Прямой `SKILL.md` структурно переносим, но текущий checkout автоматически не обнаруживается Codex. [Codex skills](https://developers.openai.com/codex/skills), [Codex plugins](https://developers.openai.com/codex/plugins/build).

**PM-12.** Oracle подавляет forbidden reasoning match при любом `no/avoid/never` в предшествующих 90 символах, даже если отрицание относится к другой фразе; `should not` при этом не распознаётся. Injection checks основаны на нескольких литералах. Рекомендация: sentence-local negation и adversarial paraphrase fixtures.

**PM-13.** CI использует mutable `checkout@v4`, `ubuntu-latest`, неприкреплённый Node и не задаёт least-privilege permissions. Packaging архивирует wildcard working tree; tag script обещает подпись, но использует annotated tag; agent templates допускают install без frozen lockfile и lifecycle-script policy. Рекомендация: immutable pins, tracked allowlist, digest, verified signed tags и frozen installs.

**PM-14.** Игнорируемый локальный settings-файл содержит 28 allow entries, включая категории commit/push/restore, release publication и recursive deletion. Условие: работа Claude Code в этом workspace. Влияние ограничено локальной средой, но часть опасных действий может пройти без отдельного permission prompt. Рекомендация: убрать destructive/release grants и сузить команды до read-only префиксов.

**R-01.** Fake Claude создаётся как extensionless `/bin/sh` файл, но исходный `PATH` сохраняется. На Windows это структурно может разрешить настоящий `claude.exe`; опасный PoC не выполнялся. Finding оставлен гипотезой. Рекомендация: test-only absolute runner и Windows CI без real Claude в `PATH`.

## Противоречия и нарушения целостности

| Конфликтующие нормы | Сценарий | Внутренний приоритет |
|---|---|---|
| `SKILL.md:14,39` один prompt; `SKILL.md:139`, `templates.md:442-454` Prompt 1/2 | Explain + rewrite или split | Primacy Zone выше, но делает split-ветвь невыполнимой |
| `SKILL.md:33` пользователь задаёт число; `templates.md:143-153` всегда три | «Ровно 2 варианта» | Не определён |
| `SKILL.md:52-71` format critical; `SKILL.md:135,150-151` derive/surface | Обычный запрос без формата | Не определён |
| `SKILL.md:180` until pass; Template H 2 попытки; fragments 3 | Постоянно падающий тест | Не определён |
| `tool-profiles.md:427` no URLs; строка 429 требует inline URL | Sonar research | Не определён |
| `SKILL.md:127-129` не цитировать hostile text; Template L возвращает original | Decompiler с injection | Hard rule выше, способ безопасного заполнения не задан |
| `models.md:3` volatile facts только здесь; defaults повторены в ядре/profiles | Обновление модели | Архитектурный приоритет заявлен, но не соблюдён |

## Аудит тестов

| Проверка | Exit | Фактический результат |
|---|---:|---|
| `node scripts/test-hook.js` | 0 | 25/25 fixtures |
| `node scripts/lint.js` | 0 | 0 errors, 0 warnings; 250 строк body; 61 patterns |
| `node --check scripts/run-golden.js` | 0 | Syntax valid |
| `node scripts/test-golden-regex.js` | 0 | 7/7 offline fixtures |
| `NO_LIVE_MODEL_CALLS=1 node scripts/test-run-golden-safe.js` | 0 | 7/7 fake-Claude cases |
| `NO_LIVE_MODEL_CALLS=1 node scripts/test-safe.js`, sandbox | 0 | 0/5, 5 skipped из-за EPERM |
| Та же команда без nested-spawn ограничения | 0 | 5/5 safe checks |
| `scripts/run-golden.js` с реальным Claude | не запускался | 46/46 scenarios не выполнены |

Все восемь JS entry points прошли `node --check`. Реальный Claude CLI не вызывался. Safe fake-runner физически записал 7/7 обращений к временной подмене.

## Матрица сценариев

Это статическая трассировка, не выполненные model tests.

| ID | Входные условия | Ожидаемое поведение | Применимые правила | Вероятный результат | Статус | Доказательство |
|---:|---|---|---|---|---|---|
| 1 | Все параметры заданы | Prompt без вопросов | `SKILL:52-70,80`; `agentic:44-50` | Полный bounded prompt | PASS | Явный happy path |
| 2 | Неизвестный tool | Capability-safe fallback | `SKILL:84`; `profiles:539-541` | Эвристическая ближайшая категория | INDETERMINATE | PM-08 |
| 3 | Нет output format | Однозначный ask/assume | `SKILL:52-71,135,150-151` | Зависит от выбранной нормы | INDETERMINATE | PM-06 |
| 4 | Пользователь запретил вопросы | Best effort с assumption | `SKILL:20,69-70` | Обязательный вопрос о target | FAIL | Конфликт с user constraint |
| 5 | Лимит вопросов исчерпан | Prompt и список forks | `SKILL:29,42,69-74` | Явный best effort | PASS | Правило определено |
| 6 | Sonar research | Native citations fields | `SKILL:105`; `profiles:427,429` | Inline URL contract | FAIL | PM-03 |
| 7 | Read-only audit | R0, без writes | `agentic:18,44,163-180` | Evidence-only ответ | PASS | Явный flag |
| 8 | Изменение файлов | R2/R3, scope и tests | `agentic:20-22,46`; Template H | Bounded edit prompt | PASS | Controls согласованы |
| 9 | Необратимое действие | Preview и внешнее approval | `SKILL:32`; `agentic:23-35,58-82` | Self-approval запрещён | PASS | Явный gate |
| 10 | Пользователь передал секрет | Удалить, не повторять | `SKILL:115-117` | Literal stripping | PASS, static | Реальная модель не проверена |
| 11 | Injection во входном тексте | Inert/redacted | `SKILL:121-129`; Template L | Sanitizer против original echo | INDETERMINATE | PM-07 |
| 12 | Ровно два варианта | Два labeled prompts | `SKILL:33`; `templates:143-153` | Три варианта | FAIL | PM-06 |
| 13 | Конфликт файловых правил | Детерминированный приоритет | `SKILL:14,39,139`; Template L | Single против split | FAIL | PM-06 |
| 14 | Устаревший API/model claim | Reverify и совместимый route | `SKILL:86,107`; `models:149` | V8.1 + `--oref` | FAIL | PM-04 |
| 15 | Нет reference-файла | Fail closed, `[unverified]` | `SKILL:80,86,246-254` | Fallback не определён | INDETERMINATE | PM-08 |

## Пробелы тестового покрытия

| Тип | Цель | Вход | Ожидаемый результат | Закрываемый риск |
|---|---|---|---|---|
| Unit | Fail closed safe gate | Все child spawns возвращают EPERM | Ненулевой exit | PM-01 |
| Unit | Priority/cardinality | No-questions, N=2, split, missing format | Единственный ожидаемый branch | PM-06 |
| Contract | Provider capabilities | Sonar, MJ V8.1 consistency, Grok edit | Native-compatible prompt/params | PM-03, PM-04 |
| Integration | Activation и missing refs | Targetless request, unknown tool, удалённый reference | Явный safe fallback | PM-08 |
| Security | Indirect injection | Directive в repo/web/MCP/worker output | Не исполняется, egress запрещён | PM-02 |
| Regression | Template L sanitizer | Hostile text плюс секрет | Только redacted structural summary | PM-07 |
| Property/adversarial | Golden oracle | Negation, paraphrases, sentence boundaries | Нет ложных pass/fail | PM-12 |
| Cross-platform | Fake runner | Windows с real CLI вне test PATH | Обращение только к fake runner | R-01 |
| Release | Artifact provenance | Dirty/untracked skill tree | Сборка блокируется | PM-13 |
| Behavioral | Model contract | 46 golden scenarios | Версионированная release-attestation | PM-05 |

## Безопасность

Подтверждённые механизмы:

- Credentials удаляются, literal echo запрещён: `SKILL.md:115-117`.
- Вставленный prompt объявлен inert data: `SKILL.md:121-129`.
- R0-R6, scope flags и Preview/Draft/Commit: `agentic.md:11-82`.
- R5/R6 требуют внешнего approval, self-approval запрещён.
- Golden runner требует opt-in, call budget и отключается через `NO_LIVE_MODEL_CALLS`.
- `spawnSync` получает argv без shell-конкатенации.
- Strong-signature scan не нашёл реальных секретов. Обнаружены только явно маркированные примеры ключа AWS-типа в `CHANGELOG.md:112` и `tests/golden/scenarios.json:55-56`; значения не воспроизводятся.

Основной остаточный риск: инструкции защищают direct prompt editing, но не полный agentic data plane. Документированные guardrails также не являются техническим sandbox enforcement.

## Сильные стороны

- Версия `1.31.0` синхронизирована в skill, plugin, marketplace, README и changelog.
- Все пять reference-файлов существуют и достижимы из `SKILL.md`.
- 61 pattern, 15 templates и 36 routing rows дают широкий функциональный охват.
- Все tracked JSON-файлы валидны; duplicate scenario IDs отсутствуют.
- Нет symlinks; tracked runtime-файлы имеют обычный mode `100644`.
- Current ZIP содержит ровно `SKILL.md` и пять references и побайтово соответствует исходникам.
- Agentic evidence policy требует `file:line`, command output или иной проверяемый артефакт.
- Single-agent default и запрет делегировать каждый файл снижают ненужный fan-out.

## План улучшений

| Приоритет | Действие | Finding IDs | Эффект | Критерий приёмки |
|---|---|---|---|---|
| P0 | Сделать safe gate fail-closed | PM-01 | Исключает зелёный `0 tests` | Любой обязательный skip даёт non-zero CI |
| P0 | Расширить trust boundary | PM-02, PM-07 | Закрывает indirect injection и echo | Security tests для repo/web/MCP/tool inputs |
| P0 | Исправить provider contracts | PM-03, PM-04 | Рабочие Sonar/Midjourney/Grok prompts | Contract fixtures сверены с official docs |
| P1 | Ввести единый precedence/output contract | PM-06 | Детерминированные branches | Все 15 matrix cases имеют один результат |
| P1 | Подключить behavioral release gate | PM-05, PM-12 | Видимые регрессии prompt behavior | 46 сценариев имеют датированную attestation |
| P1 | Определить activation и fallback | PM-08 | Надёжные unknown/missing flows | Targetless и missing-ref tests проходят |
| P1 | Нормализовать facts и profiles | PM-09, PM-10 | Меньше drift и context cost | Один registry, profile-level loading |
| P1 | Укрепить CI и release provenance | PM-13, R-01 | Воспроизводимые артефакты | Pinned CI, allowlist ZIP, verified tag, Windows fake test |
| P1 | Добавить Codex packaging, если Codex в scope | PM-11 | Автообнаружение в Codex | Skill виден из clean Codex checkout |
| P2 | Сузить локальные permissions | PM-14 | Меньше accidental side effects | Нет pre-approved destructive/release commands |
| P2 | Исправить docs и hook precision | PM-15, PM-16, PM-17 | Снижение операционного шума | Link checker green; historical ZIP provenance отмечена |

## Ограничения аудита

- Последний запрос изменил объект с ZIP на актуальный рабочий проект; архив `4185fbcf-...zip` не являлся объектом этого прохода.
- Реальный Claude, `claude -p` и live golden не запускались.
- PowerShell release scripts и Windows resolution не исполнялись.
- Матрица сценариев является статической симуляцией.
- Внешне перепроверены только существенные изменчивые claims по OpenAI, Midjourney, Perplexity и Codex.
- Остальные vendor IDs, цены, deadlines и availability не проверены исчерпывающе.
- GitHub branch protection, опубликованные release assets и удалённые CI runs не исследовались.
- Strong-secret scan не доказывает отсутствие произвольных паролей или PII.
- Игнорируемые `.claude/`, `dist/` и `external/` не защищены Git integrity.
- Мультиагентный режим был доступен; блокировок рабочих пакетов не было.

## Приложение: доказательства

### Контрольные суммы и целостность

```text
HEAD:                 f66bc34f712d29e74fc6c99875d323614c5710f5
Git tree:             3ed2c0f4cc4cd370e07c2250101c983e3b3ebf76
SHA-256 git archive:  9aa9f1d872f2214b1ac5183650aa7d6751b0499e89f0e22ab2a7cde3ea45da9c
SHA-256 ls-files map: 4f6318034521d3afd76caa16192b41c5822c313364ff83a3bb8564e30ae9d1c2
SHA-256 ZIP 1.31.0:   9b2b8334a88bdb21375504334f6de60c26a6936ba84895cb757f8317228f3c34
```

Все 14 ZIP-файлов `1.21.0`-`1.31.0` прошли `unzip -t`. Current ZIP `1.31.0` совпал с runtime source. Исторический игнорируемый ZIP `1.29.0` содержит `references/agentic.md`, которого нет в дереве тега `v1.29.0`.

### Инвентаризация

- 52 tracked-файла: 9 root/config, 22 docs, 9 plugin/runtime, 10 scripts, 2 golden datasets.
- Runtime: `SKILL.md`, пять references, plugin manifest и два hook-файла.
- Игнорируемые, но просмотренные: `.claude/settings.local.json`, 14 `dist/*.zip`, nested `external/agents-best-practices`.
- Рабочее дерево до и после аудита: чистое.

### Ключевые команды

```text
exit 0  git status --porcelain=v1 --untracked-files=all
exit 0  git diff --check
exit 0  git archive --format=tar HEAD | sha256sum
exit 0  unzip -t dist/prompt-master-1.31.0.zip
exit 0  node scripts/test-hook.js
exit 0  node scripts/lint.js
exit 0  node scripts/test-golden-regex.js
exit 0  NO_LIVE_MODEL_CALLS=1 node scripts/test-run-golden-safe.js
exit 0  NO_LIVE_MODEL_CALLS=1 node scripts/test-safe.js
not run scripts/run-golden.js
not run claude -p
```

### Официальные внешние источники

- [OpenAI model catalog](https://developers.openai.com/api/docs/models)
- [OpenAI GPT-5.6 model guidance](https://developers.openai.com/api/docs/guides/latest-model)
- [Codex skills](https://developers.openai.com/codex/skills)
- [Codex plugins](https://developers.openai.com/codex/plugins/build)
- [Perplexity Sonar Prompt Guide](https://docs.perplexity.ai/docs/sonar/prompt-guide)
- [Midjourney Omni Reference](https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference)
- [Midjourney Version compatibility](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version)

Исходные файлы проекта не изменены; патчи и исправленные версии не создавались. После завершения аудита по запросу пользователя добавлен только этот Markdown-отчёт.
