![](https://i.postimg.cc/kG03s7tk/prompt-banner.png)

<br/>

[English](README.md) · **Русский**

**Что это:** Claude-скилл, который пишет точные, готовые к вставке промпты для любого AI-инструмента — с роутингом под конкретную модель или платформу, которую ты назовёшь.
**Зачем:** каждый расплывчатый промпт — это слитый кредит. Prompt Master извлекает намерение, выбирает правильную архитектуру и вычищает каждое слово, которое не меняет результат.
**Как начать:** установи через маркетплейс плагинов (см. ниже) и скажи: `Напиши промпт для [инструмент], чтобы [задача]` — или вставь плохой промпт и попроси исправить.

**Работает с:** Claude (Opus 4.8 — дефолт), ChatGPT / GPT-5.x, Gemini, Grok (xAI), DeepSeek V4, Kimi (Moonshot AI), o3/o4-mini, Qwen, MiniMax, Llama/Mistral, Cursor, Claude Code, Cortex Code, GitHub Copilot, Windsurf, Cline, Bolt, v0, Lovable, Devin, Perplexity, Gamma, Midjourney, DALL-E, Stable Diffusion, ComfyUI, Sora, Runway, ElevenLabs, Zapier, Make — и любым AI-инструментом, который подкинешь.

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

Или вызови явно:

```
/prompt-master

Хочу попросить Claude Code собрать todo-приложение на React и Supabase
```

---

## Как это работает

Prompt Master прогоняет на каждом запросе структурированный конвейер:

1. **Определяет целевой инструмент** — под какую AI-систему промпт, и молча роутит.
2. **Извлекает 9 измерений намерения** — задача, целевой инструмент, формат вывода, ограничения, вход, контекст, аудитория, критерии успеха, примеры.
3. **Задаёт точечные уточняющие вопросы** — максимум 3, только если не хватает критичного.
4. **Роутит в правильную архитектуру** — сам выбирает шаблон и профиль инструмента, тебе это не показывается.
5. **Применяет только безопасные техники** — роль, few-shot, XML-структура, grounding-якоря, memory-блок, ссылки на источники — по необходимости.
6. **Проводит аудит токен-эффективности** — вычищает каждое слово, не меняющее результат.
7. **Выдаёт промпт** — один чистый копируемый блок + однострочная заметка о стратегии.

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
shallow depth of field --ar 16:9 --v 6 --style raw

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

## 🗺️ Индекс роутинга

Когда ты называешь инструмент, Prompt Master молча роутит в его профиль и применяет правила.

| Инструмент / категория | Что закрывает | Когда роутить |
|---|---|---|
| **Claude Opus 4.8 / 4.7** | Дефолтный текст, тяжёлое рассуждение, 1M контекст | Любой запрос «Claude» без версии |
| **Claude Fable 5 / Mythos 5** | ⚠️ Приостановлены с 2026-06-12 (недоступны) | Не роутить, пока доступ не вернут |
| **ChatGPT / GPT-5.x** | Outcome-first генерация, тон, персона | Юзер называет ChatGPT или GPT |
| **o3 / o4-mini** | Reasoning-native модели | Никакого CoT — думают внутри |
| **Grok 4.3 / xAI** | Reasoning-native; realtime X/web search; multi-agent research | Юзер называет Grok или xAI |
| **DeepSeek V4** (`v4-pro` / `v4-flash`) | Dual-mode (Thinking / Non-Thinking) | Модель + режим по задаче; без CoT в thinking |
| **Kimi / Moonshot AI** (`kimi-k2.6` / `k2.7-code` / `k2.5`) | Reasoning-native dual-mode; агентность/кодинг; Agent Swarm (app) | Юзер называет Kimi или Moonshot |
| **Gemini 2.x / 3 Pro** | Grounded, мультимодальная генерация | Нужны citation/grounding-якоря |
| **Qwen 2.5 / Qwen3** | Структурный вывод, JSON; у Qwen3 есть thinking | Юзер называет Qwen или модель Alibaba |
| **Local / open-weight** (Ollama, Llama, Mistral) | Короткие, плоские промпты | Юзер крутит локальную модель |
| **Perplexity** (Agent API + Sonar) | Research с поиском / агенты | Многоисточниковый ресёрч с цитатами |
| **Claude Code / Devin / Cline** | Агентный файл + терминал | Стоп-условия + scope-локи обязательны |
| **Cursor / Windsurf / Copilot** | IDE-автокомплит/правки | Нужны путь к файлу + имя функции |
| **Bolt / v0 / Lovable / Figma Make** | Full-stack генерация | Спека стека + что НЕ скаффолдить |
| **Gamma** | AI-презентации (text-to-deck) | Запрос на deck / слайды / презентацию |
| **Midjourney / DALL-E / Stable Diffusion / ComfyUI** | Генерация изображений | Дескрипторы через запятую, негатив, параметры |
| **Sora / Runway / LTX / Kling** | Генерация видео | Движение камеры + длительность |
| **ElevenLabs** | Voice AI | Эмоция, темп, скорость речи |
| **Zapier / Make / n8n** | Автоматизация | Триггер + действие + маппинг полей |
| **Неизвестный инструмент** | Universal Fingerprint | Спрашивает → качественный промпт под любой инструмент |

Полные правила по каждому инструменту — в [`references/tool-profiles.md`](plugins/prompt-master/skills/prompt-master/references/tool-profiles.md), грузятся по требованию, не на старте.

---

## 🤝 Работает с любым AI-инструментом (50+ инструментов в 30+ профилях)

Для всего, чего нет в профилях, Prompt Master использует **Universal Fingerprint** — чтобы написать качественный промпт под незнакомый инструмент.

<details>
<summary><b>Нажми, чтобы раскрыть полный список профилей</b></summary>

| Инструмент | Категория | Что чинит Prompt Master |
|------|----------|--------------------------|
| **Claude (Opus 4.8 / 4.7)** (дефолт) | Reasoning LLM | Убирает воду, добавляет XML-структуру, задаёт длину, фронт-лоадит scope |
| **Claude Fable 5 / Mythos 5** | Frontier LLM — ⚠️ приостановлены с 2026-06-12 | Outcome-first + краткое намерение, effort-рулёжка, без reasoning-эха — применимо, если вернут |
| **ChatGPT / GPT-5.5 / GPT-5.x** | Reasoning LLM | Outcome-first, `text.verbosity`, тюнинг reasoning-effort, преамбулы, бюджеты на retrieval |
| **Grok 4.3 (xAI)** | Reasoning LLM + realtime search | Reasoning-native (без CoT; `reasoning_effort`); Web/X Search для свежих данных; `grok-4.20-multi-agent` для deep research; спрашивает/выносит формат вывода; inline-цитаты при включённом поиске |
| **DeepSeek V4** (`v4-pro` / `v4-flash`) | Dual-mode LLM | Модель + режим по задаче; thinking reasoning-native (без CoT, `reasoning_effort` high/max, без temp/penalty); non-thinking берёт system prompt + few-shot; сохранять `reasoning_content` при tool calls; легаси-имена отключаются 2026-07-24 |
| **Kimi (Moonshot AI)** (`kimi-k2.6` / `k2.7-code` / `k2.5`) | Dual-mode + агентная LLM | Reasoning-native (без CoT; держать дефолты — не тюнить temp на K2.x); `tool_choice` auto/none при thinking; инструменты через `tools`, не в system prompt; сохранять `reasoning_content`; `$web_search` требует thinking off; multi-agent = **Agent Swarm** (app, само-оркестрация — без ручного числа агентов) ≠ одно-агентный **Kimi-Researcher**; tier-gated фичи; `kimi-latest` deprecated 2026-01-28 |
| **Gemini 2.x / 3 Pro** | Reasoning LLM | Grounding-якоря, правила цитирования, формат-локи |
| **o3 / o4-mini** | Thinking LLM | Только короткие чистые инструкции — никакого CoT |
| **Qwen 2.5 / Qwen3** | Open-weight LLM | Chat-шаблон, детект thinking vs non-thinking |
| **Локальные (Llama, Mistral, Ollama)** | Open-weight LLM | Короче промпты, проще структура, без глубокой вложенности |
| **MiniMax (M3 / M2.7)** | Reasoning LLM | Клампинг температуры, контроль think-тегов, структурный вывод |
| **Claude Code** | Агентный AI | Стоп-условия, scope файлов, чекпойнт-вывод |
| **Cortex Code** | Агентный AI (Snowflake) | Анти-оверинжиниринг, трекинг `cortex ctx`, Snowflake-нативные тулы |
| **Cursor / Windsurf** | IDE AI | Путь к файлу, имя функции, do-not-touch список |
| **Cline** | Агентный IDE | Scope файлов, гейты подтверждения, стоп-условия |
| **GitHub Copilot** | Автокомплит AI | Точный контракт функции как docstring |
| **Antigravity** | Агентный IDE (Gemini 3 Pro) | Task-based промптинг, верификация артефактов, уровень автономии |
| **Bolt / v0 / Lovable / Figma Make / Google Stitch** | Full-stack генераторы | Спека стека, версия, что НЕ скаффолдить |
| **Devin / SWE-agent** | Автономный агент | Стартовое состояние, целевое, стоп-условия |
| **Manus** | Автономный агент | Фокус на результат, scope прав, memory-якоря |
| **Computer-Use / браузер-агенты** (Comet, Atlas, Claude in Chrome) | Computer-use агент | Результат вместо навигации, ограниченные права, стоп перед необратимым |
| **Perplexity** (Agent API + Sonar) | Research / agent AI | Agent API (`/v1/agent`) — дефолт для новых апп; Sonar (`sonar`/`sonar-pro`/`sonar-deep-research` 128K) для search-grounded ответов; research-бриф (Template N); фильтры-как-параметры; search по user-сообщению; Data-gaps/confidence + inline-цитаты |
| **Gamma** | AI-презентации (text-to-deck) | App + Generate API; структурированный deck-бриф (роль/аудитория/цель/число-карточек/секции/тон/плотность/визуал); настройки-как-параметры (Text Content, Image Source); давать данные или [placeholder] (иначе инструмент выдумывает цифры); бренд — через Theme + Gamma Agent пост-ген, не в промпте |
| **Midjourney / DALL-E 3 / Stable Diffusion / SeeDream / Flux** | Image AI | Синтаксис под каждую модель, негатив-промпты, детект edit-vs-generate |
| **ComfyUI** | Image AI | Раздельные ноды Positive/Negative, синтаксис чекпойнта |
| **Meshy / Tripo / Rodin / BlenderGPT / Unity AI** | 3D / Game AI | Стиль + формат экспорта + полигон-бюджет + требования к ригу |
| **Sora / Runway / LTX / Kling / Dream Machine** | Video AI | Движение камеры, длительность, интенсивность движения |
| **ElevenLabs** | Voice AI | Эмоция, темп, акценты, скорость речи |
| **Zapier / Make / n8n** | Автоматизация | Триггер-приложение + событие, действие + маппинг полей |

</details>

---

## 🤖 Мультиагентные промпты (по запросу — нужно попросить)

Prompt Master **умеет** генерировать мультиагентные / оркестрационные промпты, но это **сознательно по запросу**: по умолчанию он держит промпт в рамках одного агентного цикла, потому что лишняя оркестрация жжёт токены. Чтобы получить мультиагентный промпт, **скажи об этом явно** — например: *«напиши **мультиагентный** промпт…»*, *«**оркестратор + sub-агенты**»*, *«**fan-out** по агентам»*, или назови нативный режим инструмента (**Agent Swarm**, **multi-agent research**).

Нативная мультиагентная поддержка по инструментам:

| Инструмент | Мультиагентная возможность | Как оформляет Prompt Master |
|---|---|---|
| **Grok (xAI)** | `grok-4.20-multi-agent` — нативная мультиагентная research-модель | Research-бриф; выбор **4** (сфокусированно) или **16** (тщательно) агентов; включает Web/X Search |
| **Kimi (Moonshot AI)** | **Agent Swarm** — модель **сама** оркеструет до **300 sub-агентов** (только в приложении, зависит от тарифа) | Одна крупная декомпозируемая задача + финальный артефакт; **не** задаёт число агентов и не скриптует sub-агентов (оркеструет модель). Одно-агентный deep research = **Kimi-Researcher** |
| **Perplexity / Manus** | Мультиагентные оркестраторы веб-ресёрча | Описывай конечный результат, а не шаги — они декомпозируют сами |
| **Claude Code / Cline / Devin / SWE-agent** | Топологию проектируешь ты (оркестратор + sub-агенты) | Agentic Prompt Fragments: fan-out + синтезатор, evaluator-петля, handoff-контракты, human-in-the-loop гейты |
| **DeepSeek V4** | Нет нативного мультиагентного агента | «Deep research» = thinking (high/max) + retrieval + citation-контракт, либо свой tool-loop |

Два стиля оркестрации, и Prompt Master сам выбирает нужный: **оркеструет модель** (Kimi Agent Swarm, Grok multi-agent — ты только формулируешь цель) vs **проектируешь ты** (Claude Code, Devin — явная топология, которую ты задаёшь). Для vendor-managed swarm вроде Kimi он **не** будет вручную прописывать sub-агентов; для оркестратора Claude Code — будет.

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
| **I — Visual Descriptor** | Midjourney, DALL-E, Stable Diffusion — генерация картинок |
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
| **Chain of Thought** | Пошаговое рассуждение для логики — никогда на reasoning-native моделях (o3/o4-mini/Grok/DeepSeek-thinking/Kimi-thinking) |
| **Ссылки на источники** | Для фактических/research-промптов на retrieval-инструментах — inline-ссылки на источник по каждому утверждению; цитировать только реально полученное, не выдумывать |

---

## 🚫 48 паттернов-«убийц кредитов»

Prompt Master сверяет каждую сырую идею с 48 известными паттернами провалов и чинит их молча. Репрезентативная выборка:

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
| 19 | Проза-промпт для Midjourney | целое предложение → «subject, style, mood, lighting, --ar 16:9 --v 6» |
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

Полная история — [CHANGELOG.md](CHANGELOG.md). Текущий релиз: **v1.23.0** (подача переопределяемых дефолтов настроек — строка `Assumed settings:`).

## 📄 Лицензия

MIT — см. [LICENSE](LICENSE).

## ⭐ История звёзд

[![Star History Chart](https://api.star-history.com/svg?repos=azagreev/prompt-master-za&type=Date)](https://star-history.com/#azagreev/prompt-master-za&Date)
