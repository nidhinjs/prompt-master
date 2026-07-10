![](https://i.postimg.cc/kG03s7tk/prompt-banner.png)

<br/>

[English](README.md) · **Русский**

**Что это:** Claude-скилл, который пишет точные, готовые к вставке промпты для любого AI-инструмента — с роутингом под конкретную модель или платформу, которую ты назовёшь.
**Зачем:** каждый расплывчатый промпт — это слитый кредит. Prompt Master извлекает намерение, выбирает правильную архитектуру и вычищает каждое слово, которое не меняет результат.
**Как начать:** установи через маркетплейс плагинов (см. ниже) и скажи: `Напиши промпт для [инструмент], чтобы [задача]` — или вставь плохой промпт и попроси исправить.

**Работает с:** hosted/local text-моделями, reasoning-системами, coding-агентами и IDE, research/browser-агентами, presentation/workflow builders, image/video/voice/3D-инструментами — и с неизвестными инструментами через capability-safe fallback. Текущий provider/model выбирается из валидируемого реестра фактов, а не из README.

---

## 🚀 Установка

### РЕКОМЕНДУЕТСЯ — Claude Code / Cowork (маркетплейс плагинов)

```bash
# 1. Добавить маркетплейс из GitHub
/plugin marketplace add azagreev/prompt-master-za

# 2. Установить плагин
/plugin install prompt-master@prompt-master
```

В Cowork: **Customize → Browse plugins → Personal → + → Add marketplace from GitHub →** `azagreev/prompt-master-za` → установить **prompt-master**.

### ИЛИ — Claude.ai (браузер, ZIP) — минует кэш маркетплейса

1. Возьми готовый бандл `prompt-master-<version>.zip` из [последнего релиза](https://github.com/azagreev/prompt-master-za/releases/latest) — или собери из клона: `./scripts/package-skill.ps1` (архивирует `skills/prompt-master/` так, что в корне — `SKILL.md` и `references/`).
2. **claude.ai → Customize → Skills → Upload a Skill.**

### ИЛИ — клонировать в директорию скиллов Claude Code

```bash
git clone https://github.com/azagreev/prompt-master-za.git
cp -r prompt-master-za/plugins/prompt-master/skills/prompt-master ~/.claude/skills/prompt-master
```

### 🔄 Как поддерживать актуальность (читай, если завис на старой версии)

Сторонние маркетплейсы (как этот) **не обновляются автоматически по умолчанию** — авто-pull на старте сессии есть только у официального маркетплейса Anthropic. После нового релиза кнопка **Update** может выглядеть активной, но ничего не делать, потому что сравнивает устаревший локальный клон сам с собой.

- **Включи auto-update один раз** (рекомендуется): `/plugin` → **Marketplaces** → `prompt-master` → включить **auto-update** (CLI), либо тумблер на странице маркетплейса в Cowork. Важно: даже с auto-update *кеш* плагина — это снапшот; чтобы подтянулись новые файлы, может потребоваться переустановка.
- **Ручное обновление:** `/plugin marketplace update prompt-master` → переустановить плагин → `/reload-plugins` (или перезапустить сессию).
- **Force-refresh**, если версия «застряла»: `/plugin marketplace remove prompt-master` → `/plugin marketplace add azagreev/prompt-master-za` → `/plugin install prompt-master@prompt-master` → `/reload-plugins` → рестарт.
- **CLI и Desktop/Cowork — это РАЗНЫЕ установки** с раздельными сторами; обновлять надо каждую отдельно. Команды `/plugin` работают только в отдельном терминале Claude Code, а не в Cowork-чате (там — через GUI).
- Чтобы понять, что *реально* исполняется, сверь четыре источника: UI `/plugin`, `~/.claude/plugins/installed_plugins.json` (`version`), папку кеша из его `installPath`, и HEAD клона маркетплейса против последнего GitHub-релиза.

---

## 🔥 Какую проблему это решает

Все сливают кредиты одинаково:

> Написал расплывчатый промпт → получил не то → перепромптил → ближе → ещё раз → наконец получил нужное с 4-й попытки.

Это 3 слитых вызова. Умножь на 50 промптов в день — это реальные деньги и время.

### Ключевая мысль

> «Лучший промпт — не самый длинный. Это тот, где каждое слово несёт нагрузку.»

Большинство «генераторов промптов» делают их длиннее. Этот скилл делает их острее.

---

## 🎯 Использование

Вызывай скилл естественным языком:

```
Напиши промпт для Cursor, чтобы отрефакторить мой модуль авторизации
```
```
Нужен промпт для Claude Code, чтобы собрать REST API — спроси, что тебе нужно знать
```
```
Вот плохой промпт, исправь его: [вставь промпт]
```
```
Сгенерируй Midjourney-промпт для киберпанк-города ночью
```
```
Напиши промпт для Kimi, чтобы он исследовал X по множеству источников, со ссылками
```
```
Дай 3 направления промпта для Claude Code: где какой лучше подходит, компромиссы и когда выбирать
```

Или вызови явно:

```
/prompt-master:prompt-master

Хочу попросить Claude Code собрать todo-приложение на React и Supabase
```

---

## Как это работает

Prompt Master прогоняет на каждом запросе структурированный конвейер:

1. **Определяет целевой инструмент** — под какую AI-систему промпт, и молча роутит.
2. **Извлекает 9 измерений намерения** — задача, целевой инструмент, формат вывода, ограничения, вход, контекст, аудитория, критерии успеха, примеры.
3. **Детерминированно закрывает пробелы** — задаёт максимум 3 точечных вопроса, если они разрешены; при явном `без вопросов` задаёт ноль и показывает допущения по target/формату.
4. **Роутит в правильную архитектуру** — сам выбирает шаблон и профиль инструмента, тебе это не показывается.
5. **Применяет только безопасные техники** — роль, few-shot, XML-структура, grounding-якоря, memory-блок, ссылки на источники — по необходимости.
6. **Проводит аудит токен-эффективности** — вычищает каждое слово, не меняющее результат.
7. **Выдаёт один fenced-артефакт** — один промпт по умолчанию, ровно 2–3 размеченных варианта по запросу или последовательность `Prompt 1..N` для split-задачи.

---

## Полный пример №1 — промпт для изображения

### Ввод
```
Напиши Midjourney-промпт: реалистичный самурай под дождём ночью
```

### Сгенерировано
```
lone samurai standing in heavy rain at night, traditional armor,
neon reflections on wet cobblestone street, cinematic lighting,
dramatic shadows, fog, ultra detailed, photorealistic,
shallow depth of field --ar 16:9 --v 8.1 --raw

negative: blurry, low quality, watermark, cartoon, anime, extra limbs
```
**🎯 Target:** Midjourney · **💡 Стратегия:** дескрипторы через запятую вместо прозы, свет и настроение закреплены в начале, соотношение сторон и версия зафиксированы, негатив-промпт против дрейфа стиля.

---

## Полный пример №2 — промпт для кода

### Ввод
```
Собери промпт для Claude Code: лендинг для бизнес-дашборда,
который выглядит и ощущается точь-в-точь как Notion — плавные анимации, чистый UI
```

### Сгенерировано
```
Objective:
Build a fully detailed, production-quality static landing page for a
business dashboard product. Design must match Notion's exact aesthetic —
clean, minimal, typographic, with smooth animations throughout.

Stack:
Single HTML file with embedded CSS and vanilla JS. No frameworks.
No external dependencies except Google Fonts (Inter).

Design Spec — match these exactly:
- Background: #ffffff / Primary text: #1a1a1a / Secondary: #6b7280
- Border: #e5e7eb / Accent: #000000
- Font: Inter, weights 400 / 500 / 600 / 700
- Base spacing unit: 8px / Radius: 6px cards, 4px buttons
- Shadows: 0 1px 3px rgba(0,0,0,0.08) only — no dramatic shadows

Sections in order:
1. Navbar — logo left, links center, "Get started free" CTA right; sticky,
   adds a subtle border-bottom on scroll via JS.
2. Hero — large left-aligned heading (max 3 lines), subtext, two CTAs,
   16:9 screenshot placeholder (gray rounded card).
3. Logos bar — "Trusted by teams at…" + 5 muted placeholder names.
4. Features — 3-column grid; card hover: border → #d1d5db, translateY(-2px), 200ms.
5. How it works — alternating left/right, 3 steps with number badge.
6. Pricing — 2 tiers; Pro tier black bg, "Most popular" badge, 4 features each.
7. CTA banner — full-width dark section, centered heading + one CTA.
8. Footer — 4-column links, copyright.

Animations:
- Fade-in + translateY(20px→0) on scroll via IntersectionObserver (threshold 0.15, 500ms ease-out).
- Staggered feature cards (100ms apart). Smooth scroll on anchors.

Constraints:
- Single file, all CSS/JS embedded, no external files except Google Fonts.
- Placeholder images = styled gray divs. Pixel-perfect at 375px and 1440px.

Done When:
- All 8 sections render at both breakpoints; animations trigger without layout shift;
  navbar sticks + border appears on scroll; hover states work; zero console errors.
```
**🎯 Target:** Claude Code · **💡 Стратегия:** каждый расплывчатый намёк на «эстетику Notion» переведён в точные hex/пиксели, чтобы Claude Code не угадал неправильно; анимации заданы с точным таймингом, методом и триггером.

---

## 🗺️ Архитектура роутинга

Когда ты называешь инструмент, Prompt Master выбирает один workflow-бандл и
разрешает подходящую provider-запись через канонический реестр фактов. Явная
composite-задача может загрузить один add-on; обычный запрос не грузит весь
каталог.

| Primary-бандл | Типичные маршруты | Что добавляет |
|---|---|---|
| **Hosted text** | Provider-hosted chat, reasoning и agent API | Provider-neutral грамматика плюс ограничения из registry |
| **Local text** | Локальные runtime и open-weight модели | Компактная структура и проверка capability без выдуманных defaults |
| **Coding agents** | File/terminal agents и IDE-помощники | Scope, approvals, stop conditions, проверки и evidence |
| **Research/browser** | Search, research и computer-use agents | Retrieval-границы, citations, read-only defaults и action gates |
| **Builders/workflows** | UI/deck builders и автоматизация | Форма результата, settings-as-knobs, field mapping и safe execution |
| **Media** | Image, video, voice, 3D и node workflows | Media-грамматика и выбранные через registry capability/parameters |
| **Decompiler/fallback** | Готовые промпты, missing references, unknown tools | Redacted analysis и семипольный capability-safe fallback |

Компактный [routing index](plugins/prompt-master/skills/prompt-master/references/tool-profiles.md)
ведёт в семь [profile-бандлов](plugins/prompt-master/skills/prompt-master/references/profiles/);
текущие IDs, defaults, channels, availability и version-tied параметры живут
только в [реестре фактов](plugins/prompt-master/skills/prompt-master/references/facts/index.json).

---

## 🤝 Работает с любым AI-инструментом

Для всего, чего нет в профилях, Prompt Master использует **Universal
Fingerprint**: проверяет семь capability-полей и помечает неизвестное поведение
`[unverified]`, а не копирует факты соседнего инструмента.

<details>
<summary><b>Нажми, чтобы раскрыть runtime-layout</b></summary>

| Слой | Канонический путь | Ответственность |
|---|---|---|
| Core-router | `SKILL.md` | Intent, precedence, output contract и progressive disclosure |
| Route index | `references/tool-profiles.md` | Legacy-compatible aliases → один primary-бандл и fact-route |
| Workflow-guidance | `references/profiles/*.md` | Семь ограниченных evergreen profile-бандлов |
| Volatile facts | `references/facts/*.json` | Sourced IDs, defaults, channels, availability, parameters и constraints |
| Compatibility-policy | `references/models.md` | Refresh policy и старые anchors без дублирования фактов |

</details>

---

## 🤖 Мультиагентные промпты (по запросу — нужно попросить)

Prompt Master **умеет** генерировать мультиагентные / оркестрационные промпты, но это **сознательно по запросу**: по умолчанию он держит промпт в рамках одного агентного цикла, потому что лишняя оркестрация жжёт токены. Чтобы получить мультиагентный промпт, **скажи об этом явно** — например: *«напиши **мультиагентный** промпт…»*, *«**оркестратор + sub-агенты**»*, *«**fan-out** по агентам»*, или назови нативный режим инструмента (**Agent Swarm**, **multi-agent research**).

Нативная мультиагентная поддержка по инструментам:

| Инструмент | Мультиагентная возможность | Как оформляет Prompt Master |
|---|---|---|
| **Grok / xAI** | Provider-managed research, только если выбранная registry-запись/поверхность это поддерживает | Research-бриф плюс выбранные через registry search controls; число агентов не хардкодится |
| **Kimi / Moonshot AI** | App-native swarm, только когда выбранная registry-запись подтверждает доступность | Одна крупная декомпозируемая задача + финальный артефакт; число workers не задаётся и не скриптуется |
| **Perplexity / Manus** | Мультиагентные оркестраторы веб-ресёрча | Описывай конечный результат, а не шаги — они декомпозируют сами |
| **Claude Code / Cline / Devin / SWE-agent** | Топологию проектируешь ты (оркестратор + sub-агенты) | Agentic Prompt Fragments: fan-out + синтезатор, evaluator-петля, handoff-контракты, human-in-the-loop гейты |
| **DeepSeek** | Нет подтверждённого registry нативного swarm | Выбранный через registry reasoning/retrieval route или ограниченный собственный tool-loop |
| **GLM / Z.AI / BigModel** | Нет подтверждённой registry cloud fallback-таблицы | Выбранные через registry thinking/tool-loop surfaces со stop conditions и evidence |

Два стиля оркестрации остаются раздельными: **provider-managed**, где выбранная
registry-запись подтверждает поверхность, а промпт только формулирует цель; и
**user-designed**, где coding agent получает явную ограниченную топологию.
Prompt Master не выдумывает availability или число workers.

---

## 📐 15 шаблонов промптов (выбираются автоматически)

Prompt Master сам подбирает архитектуру под задачу и роутит молча — ты видишь не название фреймворка, а готовый промпт.

<details>
<summary><b>Нажми, чтобы раскрыть все 15 шаблонов</b></summary>

| Шаблон | Для чего |
|----------|----------|
| **A — RTF** (Role, Task, Format) | Быстрые one-shot задачи |
| **B — CO-STAR** | Деловые документы, отчёты, бизнес-тексты |
| **C — RISEN** | Сложные многошаговые проекты |
| **D — CRISPE** | Креатив, бренд-голос, итеративный контент |
| **E — Chain of Thought** | Математика, логика, отладка (только стандартные reasoning-модели) |
| **F — Few-Shot** | Стабильный структурный вывод, копирование паттерна |
| **G — File-Scope** | Cursor, Windsurf, Copilot — любой code-editing AI |
| **H — ReAct + Stop Conditions** | Claude Code, Devin — любой автономный агент |
| **I — Visual Descriptor** | Midjourney, GPT-image, Stable Diffusion, FLUX.2 — генерация картинок |
| **J — Reference Image Editing** | Правка существующего изображения (детект edit-vs-generate) |
| **K — ComfyUI** | Node-based image workflow — разделение positive/negative |
| **L — Prompt Decompiler** | Разбор, адаптация, упрощение или разбиение промптов |
| **M — Opus 4.7 / 4.8 Task Brief** | Сложная, многофайловая, неоднозначная или агентная работа в Claude |
| **N — Research Brief** | Deep-research / многоисточниковые отчёты с цитатами (Perplexity, Grok multi-agent, Kimi) |
| **O — Deck Brief** | AI-генераторы презентаций (Gamma) — структурированный бриф с числом карточек, секциями, тоном, плотностью, данными |

Плюс опциональные **Agentic Prompt Fragments** для настоящих мультиагентных / tool-using рантаймов (оркестратор + sub-агенты, eval-петли, review-гейты).

</details>

---

## 🛡️ 6 безопасных техник, применяются по необходимости

Prompt Master использует только техники с надёжным, ограниченным эффектом. Методы, склонные к галлюцинациям или непредсказуемому выводу (Tree of Thought, Graph of Thought, Universal Self-Consistency, layered prompt chaining), явно исключены.

| Техника | Что делает |
|-----------|-------------|
| **Назначение роли** | Задаёт конкретную экспертную идентичность для калибровки глубины и лексики |
| **Few-Shot примеры** | Добавляет 2–5 примеров, когда формат важнее инструкций |
| **XML-теги структуры** | Оборачивает секции в XML для Claude-инструментов, которые их надёжно парсят |
| **Grounding-якоря** | Анти-галлюцинационные правила для фактических и citation-задач |
| **Chain of Thought** | Пошаговое рассуждение для логики — никогда на reasoning-native моделях (o3/o4-mini/Grok/DeepSeek-thinking/Kimi-thinking/GLM-thinking) |
| **Ссылки на источники** | Для фактических/research-промптов на retrieval-инструментах — inline-ссылки на источник по каждому утверждению; цитировать только реально полученное, не выдумывать |

---

## 🚫 61 паттерн-«убийца кредитов»

Prompt Master сверяет каждую сырую идею с 61 известным паттерном провалов и чинит их молча. Репрезентативная выборка:

<details>
<summary><b>Задача / Контекст / Формат / Scope (выборка)</b></summary>

| # | Паттерн | Было → Стало |
|---|---------|----------------|
| 1 | Расплывчатый глагол задачи | «помоги с кодом» → «Отрефактори `getUserData()` на async/await, обработай null» |
| 2 | Две задачи в одном промпте | «объясни И перепиши» → разбить на два промпта |
| 3 | Нет критериев успеха | «сделай лучше» → «Готово, когда проходит юнит-тесты и обрабатывает null» |
| 8 | Предполагается прошлое знание | «продолжи с того места» → включить Memory-блок |
| 11 | Приглашение к галлюцинации | «что говорят эксперты?» → «Цитируй только то, в чём уверен; иначе [uncertain]» |
| 14 | Нет формата вывода | «объясни это» → «3 буллета ≤20 слов, одно предложение-итог сверху» |
| 19 | Проза-промпт для Midjourney | целое предложение → «subject, style, mood, lighting, --ar 16:9 --v 8.1» |
| 20 | Нет границ scope | «почини приложение» → «Почини только валидацию логина в `src/auth.js`. Ничего больше.» |
| 25 | Вставка всей кодовой базы | весь репо каждый раз → scope до нужной функции/файла |

</details>

<details>
<summary><b>Рассуждение / Агентность / Модели и Research (выборка)</b></summary>

| # | Паттерн | Было → Стало |
|---|---------|----------------|
| 27 | CoT на reasoning-моделях | «думай пошагово» для o3 → убрать (они думают внутри) |
| 33 | Молчаливый агент | нет прогресса → «После каждого шага: ✅ [что сделано]» |
| 35 | Нет гейта ревью человеком | агент решает всё сам → «Остановись и спроси перед: удалением файла, добавлением зависимости, сменой схемы БД» |
| 38 | Захардкоженная снятая модель / мёртвый параметр | `gpt-4o` / `o1` / `deepseek-chat`,`reasoner` (отключение 2026-07-24) / `kimi-latest` (deprecated 2026-01-28) → сверить с `models.md` |
| 43 | Расплывчатый research-запрос | «расскажи про X» → research-бриф (Template N) с обязательной секцией Data-gaps & confidence |
| 44 | Realtime-запрос к cutoff-модели без retrieval | «последние новости по Y» к Grok без поиска → включить Web/X Search; фильтры как параметры |
| 45 | Citable-задача без citation-контракта | фактический промпт на retrieval-инструменте без атрибуции → добавить inline-citation контракт |
| 46 | Рассуждение + живой web search в одном вызове, где они взаимоисключены | напр. Kimi `$web_search` требует thinking off → разнести по режиму/ходу |
| 47 | Генератор презентаций без числа карточек, структуры и данных | «сделай презентацию про X» в Gamma → generic deck + выдуманные цифры → задать число карточек + секции + плотность; дать реальные данные или явные [placeholder] |
| 48 | Настройка зашита молча, юзеру не сказано что её можно менять | дефолтные Gamma density / Perplexity-фильтр / Grok reasoning_effort / image CFG без заметки → вынести строкой «Assumed settings:» — переопределяемо, без лишнего вопроса |
| 49 | Задача на character-consistency на тире, который так не умеет | бренд-маскот / один и тот же персонаж в Nano Banana 2 Lite → роутить на Nano Banana 2·Pro, FLUX.2 multi-ref или Midjourney `--oref` |
| 50 | Правка видео целым переописанием вместо запертой дельты | длинное переописание в Omni Flash / Grok → короткая дельта + «Keep everything else the same» + теги `<FIRST_FRAME>`/`<IMAGE_REF_n>` |
| 51 | Дефолт на закрывающуюся / снятую медиа-модель | таргет на Sora (2026-09-24) / Veo 2·3 / Runway `gen4_aleph` как на актуальные → флаг + роутинг на Veo 3.1 / Kling 3.0 / `aleph2` |
| 52 | У агента нет запускаемой самопроверки | «сделай X» без проверки → дать check (тесты/билд/скриншот-диф) + «итерируй до зелёного» + evidence, не assertion |
| 53 | Артефакт пересказан вместо приложенного | пересказ ошибки/дизайна своими словами → вставить verbatim или сослаться (`@file`, URL, pipe лога) |
| 54 | Не назван образец для «сделай как у нас в кодбейсе» | «добавь calendar widget» → «посмотри, как сделан X в `<file>`, повтори паттерн» |
| 55 | Ревью-запрос без ограничений | «найди все проблемы» → планка severity + кап на nits + evidence `file:line` + правило сходимости на re-review |
| 56 | Taste/новый-домен unknown дренируют вопросом | «сделай дорого» → prototype-first mock (дивергентные направления); новый домен → blindspot pass — вопрос это не гасит |
| 57 | Отклонение от плана не обработано (агент стопорится или дрейфует) | длинный агентный прогон без правила → «консервативный вариант + лог в `## Deviations` + продолжай»; stop-and-ask только на необратимом |
| 58 | Предпосылка/decomposition не проверены до fan-out | широкая раздача воркерам по предполагаемой карте файлов → дешёвый premise worker сначала проверяет файлы/API/data shape |
| 59 | Дрейф контракта coordinator/worker | видимый план узкий/read-only, скрытые пакеты широкие → зеркалить scope, tools, stop condition, deliverable, evidence |
| 60 | Advisor используется неверно / cost knobs скрыты | Advisor на каждом мелком шаге или вообще не вынесен → ограниченный checkpoint + evidence + явные knobs глубины/стоимости |
| 61 | Слишком мелкое/крупное делегирование | агент на каждый файл или один огромный worker → по умолчанию single loop; делегировать bounded packets; Plan Big, Execute Small |

</details>

Полный справочник: [`references/patterns.md`](plugins/prompt-master/skills/prompt-master/references/patterns.md).

---

## 🧠 Система Memory-блока

Когда у разговора есть история, Prompt Master вытаскивает прошлые решения и добавляет Memory-блок сверху, чтобы целевой AI не противоречил уже принятому:

```
## Context (carry forward)
- Стек: React 18 + TypeScript + Supabase
- Auth — JWT в httpOnly cookies, не localStorage
- Нейминг компонентов: PascalCase, без default-экспортов
- Дизайн-система: только Tailwind, без кастомного CSS
- Архитектура: без Redux, только Context API
```

Это самый большой фикс для длинных сессий — большинство слитых перепромптов из-за того, что AI забывает уже решённое.

---

## ℹ️ История версий

Полная история — [CHANGELOG.md](CHANGELOG.md). Текущий релиз: **v1.33.0** (канонический реестр provider/model facts, семь прогрессивно загружаемых workflow-профилей, fail-closed проверка freshness/роутинга и детерминированная упаковка по tracked manifest).

## 📄 Лицензия

MIT — см. [LICENSE](LICENSE).

## ⭐ История звёзд

[![Star History Chart](https://api.star-history.com/svg?repos=azagreev/prompt-master-za&type=Date)](https://star-history.com/#azagreev/prompt-master-za&Date)
