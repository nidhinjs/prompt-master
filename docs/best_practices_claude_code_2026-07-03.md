# Best practices for Claude Code (снимок 2026-07-03)

> Источник: https://code.claude.com/docs/en/best-practices
> «Tips and patterns for getting the most out of Claude Code…»
> Скачано verbatim, теги `<Tip>/<Callout>/<Steps>/<Warning>` конвертированы в markdown-маркеры. Живой документ — при использовании как источника сверять фичи заново.

Claude Code — агентная кодинг-среда: читает файлы, запускает команды, вносит изменения и автономно доводит задачу. Меняет способ работы: ты описываешь ЧТО хочешь, Claude сам исследует→планирует→реализует.

**Центральное ограничение, из которого растут почти все практики:** контекст-окно быстро заполняется, а с заполнением деградирует качество. Окно держит весь диалог: каждое сообщение, каждый прочитанный файл, каждый вывод команды. Контекст — главный ресурс для управления.

---

## 1. Give Claude a way to verify its work (петля самопроверки)

> 💡 Дай Claude проверку, которую он может сам запустить: тесты, билд, скриншот для сравнения. Это разница между сессией, за которой ты следишь, и той, от которой можно уйти.

Claude останавливается, когда работа «выглядит готовой». Без запускаемой проверки «выглядит готовой» — единственный сигнал, и петлёй верификации становишься ТЫ. Дай что-то, что возвращает pass/fail, — и петля замыкается сама.

Проверка = что угодно, возвращающее читаемый в диалоге сигнал: тест-сьют, exit-код билда, линтер, скрипт-диф против фикстуры, browser-скриншот против дизайна.

| Стратегия | Before | After |
|---|---|---|
| Provide verification criteria | "implement a function that validates email addresses" | "write a validateEmail function. example test cases: … run the tests after implementing" |
| Verify UI changes visually | "make the dashboard look better" | "[paste screenshot] implement this design. take a screenshot of the result and compare it to the original. list differences and fix them" |
| Address root causes, not symptoms | "the build is failing" | "the build fails with this error: [paste error]. fix it and verify the build succeeds. address the root cause, don't suppress the error" |

Насколько жёстко проверка гейтит остановку:
- **In one prompt** — попросить запустить проверку и итерировать в том же сообщении (работает на любой задаче уже сегодня).
- **Across a session** — задать проверку как `/goal`-условие: отдельный评aluator перепроверяет после каждого хода, Claude работает, пока условие не выполнится.
- **As a deterministic gate** — Stop-hook запускает проверку скриптом и блокирует конец хода, пока не пройдёт (Claude Code перебивает хук после 8 подряд блокировок).
- **By a second opinion** — verification-субагент / dynamic workflow: свежая модель пытается ОПРОВЕРГНУТЬ результат, чтобы делающий не был же и оценщиком.

Проси **показывать доказательства**, а не утверждать успех: вывод тестов, запущенную команду и её результат, скриншот. Ревью доказательств быстрее, чем перезапуск проверки самому, и работает для сессий, за которыми не следил.

---

## 2. Explore first, then plan, then code

> 💡 Отделяй ресёрч и планирование от реализации, чтобы не решить не ту проблему.

Прыжок сразу в код → код, решающий не ту задачу. Используй **plan mode** для разделения разведки и исполнения. 4 фазы:
1. **Explore** — plan mode: Claude читает файлы, отвечает на вопросы, ничего не меняя. (`read /src/auth and understand how we handle sessions and login…`)
2. **Plan** — попросить детальный план реализации. `Ctrl+G` открывает план в текстовом редакторе для прямой правки перед исполнением.
3. **Implement** — выйти из plan mode, дать кодить, сверяясь с планом. (`implement the OAuth flow from your plan. write tests… run the test suite and fix any failures.`)
4. **Commit** — попросить коммит с описательным сообщением и PR.

> ⚠️ Plan mode полезен, но добавляет накладные расходы. Для мелочи с ясным scope (typo, лог-строка, переименование) — проси делать напрямую. Планирование ценно, когда: неясен подход / изменение затрагивает много файлов / незнаком с кодом. **«Если diff можно описать одним предложением — пропусти план.»**

---

## 3. Provide specific context in your prompts

> 💡 Чем точнее инструкции, тем меньше правок.

Claude выводит намерение, но не читает мысли. Ссылайся на конкретные файлы, называй ограничения, указывай на паттерны-примеры.

| Стратегия | Before | After |
|---|---|---|
| Scope the task | "add tests for foo.py" | "write a test for foo.py covering the edge case where the user is logged out. avoid mocks." |
| Point to sources | "why does ExecutionFactory have such a weird api?" | "look through ExecutionFactory's git history and summarize how its api came to be" |
| Reference existing patterns | "add a calendar widget" | "look at how existing widgets are implemented… HotDogWidget.php is a good example. follow the pattern…" |
| Describe the symptom | "fix the login bug" | "users report login fails after session timeout. check auth flow in src/auth/, especially token refresh. write a failing test that reproduces the issue, then fix it" |

Вагусные промпты полезны при разведке, когда можешь позволить course-correct: `"what would you improve in this file?"` может вскрыть то, о чём не подумал спросить.

### Provide rich content
> 💡 `@` для файлов, вставляй скриншоты/картинки, пайпай данные напрямую.
- **`@`-референс файла** — Claude прочитает перед ответом.
- **Вставка картинок** — copy/paste или drag&drop.
- **URL** для доков/API — `/permissions` для allowlist частых доменов.
- **Пайп данных** — `cat error.log | claude`.
- **Дать Claude самому достать контекст** — Bash / MCP / чтение файлов.

---

## 4. Configure your environment

### Write an effective CLAUDE.md
> 💡 `/init` генерирует стартовый CLAUDE.md по структуре проекта, дальше уточняй.

CLAUDE.md читается в начале КАЖДОГО диалога. Включай Bash-команды, code style, workflow-правила — персистентный контекст, который нельзя вывести из кода. Формат свободный, но коротко и человекочитаемо.

**Грузится каждую сессию → только то, что применимо широко.** Доменное/иногда-релевантное → в skills (грузятся по требованию, не раздувают каждый диалог). Критерий на каждую строку: *«Удаление этой строки заставит Claude ошибаться?»* Нет — режь. **Раздутый CLAUDE.md → Claude игнорирует реальные инструкции!**

| ✅ Include | ❌ Exclude |
|---|---|
| Bash-команды, которые не угадать | То, что Claude выведет из кода |
| Code-style, отличный от дефолтов | Стандартные конвенции языка |
| Testing-инструкции, тест-раннеры | Детальная API-дока (ссылка вместо) |
| Repo-этикет (branch/PR-конвенции) | Часто меняющееся |
| Архитектурные решения проекта | Long explanations / tutorials |
| Env-quirks (нужные env vars) | Пофайловые описания кодбейса |
| Гочи / неочевидное поведение | Самоочевидное («write clean code») |

Тюнинг адхеренса: `IMPORTANT` / `YOU MUST`. Импорт файлов: `@path/to/import`. Локации: `~/.claude/CLAUDE.md` (все сессии), `./CLAUDE.md` (в git, командный), `./CLAUDE.local.md` (личный, в .gitignore), parent/child dirs (монорепо, on-demand). Относиться как к коду: ревьюить когда что-то ломается, регулярно прунить, проверять по реальному сдвигу поведения.

### Configure permissions
> 💡 **Auto mode** (классификатор одобряет), `/permissions` (allowlist), `/sandbox` (OS-изоляция).
- **Auto mode** — отдельная классифицирующая модель блокирует рискованное (scope escalation, unknown infra, hostile-content). Когда доверяешь направлению, но не хочешь кликать каждый шаг.
- **Permission allowlists** — разрешить безопасное (`npm run lint`, `git commit`).
- **Sandboxing** — OS-изоляция FS/сети.

### Use CLI tools
> 💡 Говори Claude использовать `gh`, `aws`, `gcloud`, `sentry-cli`.
CLI — самый context-efficient способ работы с внешними сервисами. `gh` — Claude умеет issues/PR/comments. Учится и незнакомым CLI: `Use 'foo-cli --help' to learn… then use it to solve A,B,C.`

### Connect MCP servers
> 💡 `claude mcp add` — Notion, Figma, БД. Фичи из трекеров, запросы к БД, мониторинг, дизайн из Figma.

### Set up hooks
> 💡 Для действий, которые должны происходить каждый раз без исключений.
Hooks запускают скрипты автоматически в точках workflow. В отличие от CLAUDE.md (advisory) — **детерминированы**. Claude пишет хуки: `"hook that runs eslint after every file edit"` / `"hook that blocks writes to migrations folder"`. Конфиг в `.claude/settings.json`, `/hooks` для обзора.

### Create skills
> 💡 `SKILL.md` в `.claude/skills/` — доменные знания и переиспользуемые workflow.
Claude применяет автоматически по релевантности или по `/skill-name`. С фронтматтером `name`/`description`. Могут задавать workflow с `$ARGUMENTS` и `disable-model-invocation: true` (для побочных эффектов, ручной запуск). Пример `/fix-issue 1234`.

### Create custom subagents
> 💡 Спец-ассистенты в `.claude/agents/` для изолированных задач.
Субагенты — свой контекст, свой набор tools. Для задач, читающих много файлов / нужен фокус без замусоривания основного диалога. Фронтматтер: `name`/`description`/`tools`/`model`. Явно: `"Use a subagent to review this code for security issues."`

### Install plugins
> 💡 `/plugin` — маркетплейс. Бандлят skills/hooks/subagents/MCP. Для типизированных языков — code intelligence plugin (навигация по символам, авто-детект ошибок).

---

## 5. Communicate effectively

### Ask codebase questions
> 💡 Спрашивай Claude как senior-инженера. (How does logging work? What edge cases does X handle? Why foo() not bar() on line 333?) Эффективный онбординг, снижает нагрузку на других инженеров. Спец-промптинг не нужен.

### Let Claude interview you
> 💡 Для крупных фич — пусть Claude интервьюирует тебя через `AskUserQuestion`.
```
I want to build [brief description]. Interview me in detail using the AskUserQuestion tool.
Ask about technical implementation, UI/UX, edge cases, concerns, and tradeoffs. Don't ask obvious questions, dig into the hard parts I might not have considered.
Keep interviewing until we've covered everything, then write a complete spec to SPEC.md.
```
После спеки — **свежая сессия для исполнения** (чистый контекст + письменная спека). Лучшие спеки самодостаточны: называют файлы/интерфейсы, что вне scope, и заканчиваются end-to-end verification-шагом. Время на точность спеки окупается сильнее, чем время на наблюдение за реализацией.

---

## 6. Manage your session (диалоги персистентны и обратимы)

### Course-correct early and often
> 💡 Правь Claude, как только заметил уход в сторону.
- **`Esc`** — стоп mid-action, контекст сохранён, можно перенаправить.
- **`Esc+Esc` / `/rewind`** — меню отката: восстановить диалог и код, или summarize от выбранного сообщения.
- **`"Undo that"`** — откатить изменения.
- **`/clear`** — сброс контекста между несвязанными задачами.

**Если поправил >2 раз по одной проблеме → контекст замусорен провальными подходами. `/clear` + более специфичный промпт с учётом выученного.** Чистая сессия с лучшим промптом почти всегда бьёт длинную с накопленными правками.

### Manage context aggressively
> 💡 `/clear` между несвязанными задачами.
- `/clear` часто между задачами.
- Auto-compaction при подходе к лимиту — саммари важного (паттерны, состояния файлов, решения).
- `/compact <instructions>` — напр. `/compact Focus on the API changes`.
- Частичный компакт: `Esc+Esc` → checkpoint → **Summarize from here / up to here**.
- Кастом компакта в CLAUDE.md: `"When compacting, always preserve the full list of modified files and any test commands"`.
- `/btw` — быстрый вопрос в dismissible-оверлее, НЕ входит в историю (не растит контекст).

### Use subagents for investigation
> 💡 `"use subagents to investigate X"` — исследуют в отдельном контексте, основной диалог чист.
Т.к. контекст — фундаментальное ограничение, субагенты — один из мощнейших инструментов. Ресёрч читает много файлов → жрёт контекст; субагент возвращает саммари. Тоже для верификации: `use a subagent to review this code for edge cases`.

### Rewind with checkpoints
> 💡 Каждый промпт создаёт checkpoint. Восстановить диалог/код/оба на любой прошлый.
Claude снапшотит файлы перед каждым изменением. `Esc+Esc` / `/rewind`. Можно «попробовать рискованное → не сработало → откат». Чекпойнты переживают сессии.
> ⚠️ Чекпойнты трекают только изменения САМОГО Claude, не внешних процессов. Не замена git.

### Resume conversations
> 💡 `/rename` сессии, относись как к веткам: у каждого workstream свой персистентный контекст.
`claude --continue` (последняя) / `claude --resume` (выбор). Описательные имена (`oauth-migration`).

---

## 7. Automate and scale

### Run non-interactive mode
> 💡 `claude -p "prompt"` в CI/pre-commit/скриптах. `--output-format stream-json --verbose` для стрима.
```bash
claude -p "Explain what this project does"
claude -p "List all API endpoints" --output-format json
claude -p "Analyze this log file" --output-format stream-json --verbose
```

### Run multiple Claude sessions
> 💡 Параллельные сессии: ускорение, изолированные эксперименты, сложные workflow.
- **Worktrees** — отдельные CLI-сессии в изолированных git-checkout.
- **Desktop app** — визуальное управление сессиями, каждая в своём worktree.
- **Claude Code on the web** — сессии на облачной инфре Anthropic в изолированных VM.
- **Agent teams** — авто-координация нескольких сессий с общими задачами/сообщениями/team lead.

Свежий контекст улучшает code review (нет bias к своему коду). **Writer/Reviewer паттерн:** Session A пишет → Session B ревьюит в свежем контексте → A правит по фидбеку. Аналогично с тестами: один пишет тесты, другой — код под них.

### Fan out across files
> 💡 Цикл `claude -p` по задачам. `--allowedTools` для scope прав в batch.
```bash
for file in $(cat files.txt); do
  claude -p "Migrate $file from React to Vue. Return OK or FAIL." \
    --allowedTools "Edit,Bash(git commit *)"
done
```
Тест на 2-3 файлах → уточнить промпт → прогнать на всём наборе. Интеграция в пайплайны: `claude -p "<prompt>" --output-format json | your_command`.

### Run autonomously with auto mode
```bash
claude --permission-mode auto -p "fix all lint errors"
```
Классификатор ревьюит команды до запуска (блокирует scope escalation / unknown infra / hostile-content). Для `-p` auto mode прерывается, если классификатор повторно блокирует (нет юзера для fallback).

### Add an adversarial review step
> 💡 До «готово» — субагент ревьюит diff в свежем контексте и репортит пробелы.
Чем дольше Claude работал автономно, тем важнее независимая проверка. Ревьюер в свежем субагенте видит только diff + критерии, НЕ рассуждения, породившие изменение → оценивает результат по своим меркам. Bundled `/code-review` skill — на баги. Для сверки с планом — свой промпт:
```
Use a subagent to review the rate limiter diff against PLAN.md. Check that every requirement is implemented, the listed edge cases have tests, and nothing outside the task's scope changed. Report gaps, not style preferences.
```
> ⚠️ Ревьюер, которому велено искать пробелы, обычно что-то нарепортит, даже если работа корректна — потому что его об этом попросили. Гонка за каждой находкой → over-engineering (лишние абстракции, defensive-код, тесты на невозможное). Скажи ревьюеру флажить только пробелы, влияющие на корректность / заявленные требования; остальное — опционально.

---

## Avoid common failure patterns
- **The kitchen sink session** — намешал несвязанные задачи, контекст полон нерелевантного. **Fix:** `/clear` между задачами.
- **Correcting over and over** — правишь по кругу, контекст отравлен провальными подходами. **Fix:** после 2 провальных правок `/clear` + лучший стартовый промпт.
- **The over-specified CLAUDE.md** — слишком длинный, Claude игнорит половину. **Fix:** безжалостно прунить; что делает и без инструкции — удалить или в хук.
- **The trust-then-verify gap** — правдоподобная реализация без edge-cases. **Fix:** всегда давать верификацию (тесты/скрипты/скриншоты). *«Если не можешь верифицировать — не шипь.»*
- **The infinite exploration** — «investigate» без scope, читает сотни файлов. **Fix:** узкий scope или субагенты.

---

## Develop your intuition
Паттерны — не догма, а стартовые точки. Иногда СТОИТ дать контексту накапливаться (глубоко в одной проблеме, история ценна); иногда пропустить план (задача исследовательская); иногда вагусный промпт — именно то, что нужно (посмотреть, как Claude интерпретирует до ограничений). Замечай, что работает: при хорошем выводе — что ты сделал (структура промпта, контекст, режим); при провале — почему (шумный контекст? вагусный промпт? слишком большая задача?).

## Related resources
- How Claude Code works — /en/how-claude-code-works
- Extend Claude Code — /en/features-overview
- Common workflows — /en/common-workflows
- CLAUDE.md — /en/memory
