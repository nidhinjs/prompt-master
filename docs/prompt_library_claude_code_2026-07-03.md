# Claude Code — Prompt Library (снимок 2026-07-03)

> Источник: https://code.claude.com/docs/en/prompt-library (обновлена 2026-07-02).
> «Copy-paste prompts for Claude Code, tagged by task and role.»
> Это НЕ старая творческая Anthropic Prompt Library — это библиотека промптов **для работы внутри Claude Code**.
> Скачано верно (verbatim из React-виджета `RAW[]` + `text{}`), реорганизовано в читаемый вид. 52 промпта.

## Модель организации (важна для нас)

- **Фазы SDLC** (`phaseLabels`): Discover · Design · Build · Ship · Operate.
- **Категории** (`catLabels`): Onboard, Understand, Plan, Prototype, Implement, Test, Refactor, Review, Steer, Git, Release, Debug, Incident, Data, Automate.
- **Роли** (`tagLabels`): Product (pm), Design, Docs, Marketing, Security, On-call (ops), Data — промпты тегируются ролями, не только разработчиком.
- **Слоты** `{placeholder}` с дефолт-примерами — виджет даёт инлайн-инпуты «заполни и скопируй».
- **`needs`** — предусловие (tracker/gh/browser/db через MCP/connector).
- **`paste`** — приложить артефакт (mockup/design/screenshot/plan/error/csv).
- **`Why this works`** (`teaches`) — паттерн за промптом.
- **`Make it stick`** (`next`) — как закрепить (init/skill/CLAUDE.md/output-style/plan mode/goal).
- **`Start here`** — 5 промптов «попробуй первыми» (startN 1–5).

Источники карточек (`sourceLabels`): Common workflows, Best practices, How Anthropic teams use Claude Code, Legal, Cybersecurity, Scaling agentic coding guide.

---

## ★ Five prompts to try first
1. Get oriented in a new repository
2. Find where something happens
3. Find and fix a failing test
4. Write tests, run them, fix failures
5. Review your changes before you commit

---

## DISCOVER

### Onboard
**Get oriented in a new repository** · `src: workflows` · ★1
`give me an overview of this codebase: architecture, key directories, and how the pieces connect`
- Why: описывай, ЧТО хочешь узнать, а не какие файлы читать — Claude сам исследует проект.
- Stick: `/init` → `CLAUDE.md`, чтобы помнил каждую сессию.

### Understand
**Explain unfamiliar code** · `src: workflows`
`explain what {path} does and how data flows through it. write it up as {format}`
(path=`src/scheduler/queue.ts`, format=`an HTML page with a diagram, then open it in my browser`)
- Why: назови файл и желаемый ФОРМАТ ответа. Stick: output style.

**Find where something happens** · `src: workflows` · ★2
`where do we {behavior}?` (behavior=`validate uploaded file types`)
- Why: поиск по поведению, а не по имени файла.

**Check what breaks before you delete** · `src: workflows`
`what would break if I deleted {target}?` (target=`the retryWithBackoff helper`)
- Why: спрашивай ДО удаления — список вызовов покажет масштаб.

**Trace how code evolved** · `src: best-practices`
`look through the commit history of {path} and summarize how it evolved and why`
- Why: указывай на историю коммитов, когда вопрос «почему», а не «что».

**Scope a change before you start** · roles: pm, design · `src: teams`
`which files would I need to touch to {change}?` (change=`add a dark mode toggle to settings`)
- Why: оценка объёма до внесения в roadmap.

**Ask the codebase a product question** · roles: pm · `src: teams`
`I am a {role}. walk me through what happens when a user {action}, from the UI down to the result`
(role=`PM`, action=`clicks Export to PDF`)
- Why: назови роль → ответ на нужном уровне. Stick: output style.

---

## DESIGN

### Plan
**Plan a multi-file change before touching code** · roles: pm, design · `src: workflows`
`plan how to refactor the {target} to {goal}. list the files you would change, but don't edit anything yet`
(target=`payment module`, goal=`support multiple currencies`)
- Why: «don't edit yet» отделяет разведку от правок. Stick: Shift+Tab → plan mode.

**Draft a spec by interview** · roles: pm · `src: best-practices`
`I want to build {feature}. interview me about implementation, UX, edge cases, and tradeoffs until we have covered everything, then write the spec to SPEC.md`
- Why: попроси интервьюировать тебя, а не писать спеку самому. Stick: `/spec` skill.

**Turn a meeting into tickets** · roles: pm · needs: tracker · `src: teams`
`read {input} and write up the action items, then create a {tracker} ticket for each with acceptance criteria`
(input=`@meeting-notes.md`, tracker=`Linear`)
- Stick: `/tickets` skill.

**Map edge cases before building** · roles: design, pm · `src: teams`
`list the error states, empty states, and edge cases for {feature} that the design needs to cover`
- Why: проси то, чего НЕ хватает, а не то, что есть.

### Prototype
**Turn a mockup into a working prototype** · roles: design, pm, marketing · paste: mockup · `src: teams`
`here is a mockup. build a working prototype I can click through, matching the layout and states shown`

**Implement from a screenshot and self-check** · roles: design · paste: design · needs: browser · `src: best-practices`
`implement this design, then take a screenshot of the result, compare it to the original, and fix any differences`
- Why: даёт Claude петлю верификации (render→compare→iterate). Stick: `/goal`.

---

## BUILD

### Implement
**Follow an existing pattern** · `src: best-practices`
`look at how {example} is implemented to understand the pattern, then build {new} the same way`
- Why: укажи на код-референс, иначе Claude уходит в «общие best practices». Stick: записать паттерн в `CLAUDE.md`.

**Generate docs for undocumented code** · roles: docs · `src: workflows`
`find {scope} without {format} comments and add them, matching the style already used in the file`

**Add a small, well-defined feature** · `src: workflows`
`add a {endpoint} endpoint that returns {payload}` (=`/health` → version+uptime)
- Why: задавай входы/выходы, не «как строить».

**Build a small internal tool from scratch** · roles: pm, design, marketing, docs · `src: teams`
`create a {tool} using HTML, CSS, and vanilla JavaScript, then open it in my browser`

**Work an issue end to end** · needs: gh · `src: workflows`
`read issue #{issue}, implement the fix, and run the tests`
- Why: дай номер issue, не пересказ — Claude прочтёт тикет сам.

**Find and update copy across the codebase** · roles: design, docs, marketing · `src: teams`
`find every place we say "{copy}" or a close variant, show me each one in context, then update them all to "{new}". leave tests and the changelog alone`

**Draft a document from past examples** · roles: docs, marketing, pm · `src: legal`
`read the {examples} in {folder} to learn the structure and voice, then draft a new one for {topic}`
- Why: укажи на папку готовых работ, а не описывай стиль. Stick: skill голоса.

### Test
**Write tests, run them, fix failures** · `src: workflows` · ★4
`write tests for {path}, run them, and fix any failures`
- Why: write+run+fix вместе → Claude итерирует без остановок. Stick: `/init`.

**Drive implementation from tests** · `src: ebook`
`write tests for {feature} first, then implement it until they pass` (TDD)

**Fill gaps from a coverage report** · `src: workflows`
`read {report} and add tests for the lowest-covered files until each is above {target}%`
- Stick: `/goal` до достижения покрытия.

### Refactor
**Migrate a pattern across the codebase** · `src: workflows`
`migrate everything from {from} to {to}: identify every place that needs to change, then make the changes`
- Why: «identify every place first» → список call-sites в ответе для проверки.

**Port code to another language** · `src: teams`
`port {source} to {target}, keeping the same {keep}` (keep=`public API and test behavior`)
- Why: скажи, что СОХРАНИТЬ — это контракт для проверки порта.

**Optimize against a measurable target** · roles: data · `src: ebook`
`optimize {target} to bring {metric} from {current} down to under {goal}` (p95 2s→500ms)
- Why: метрика+цель = чёткое definition of done. Stick: `/goal`.

**Fix a precise visual bug** · roles: design · `src: ebook`
`the {element} extends {amount} beyond the {container} on {viewport}. fix it.`
- Why: точный визуальный фидбек → точный фикс. Stick: preview tool.

### Review
**Review your changes before you commit** · `src: workflows` · ★5
`review my uncommitted changes and flag anything that looks risky before I commit`
- Why: Claude читает изменённые файлы целиком, не только diff-строки. Stick: `/code-review`.

**Review a pull request** · needs: gh · `src: workflows`
`review PR #{pr} and summarize what changed, then list any concerns`
- Why: ревью с контекстом всего кодбейса, не только diff.

**Review infrastructure changes before applying** · roles: security, ops · paste: plan · `src: teams`
`here is my Terraform plan output. what is this going to do, and is anything here going to cause problems?`

**Run a security review with a subagent** · roles: security · `src: best-practices`
`use a subagent to review {path} for security issues and report what it finds`
- Why: субагент в своём контекст-окне, не забивает основную сессию. Stick: dedicated security-review subagent.

**Catch issues before formal review** · roles: marketing, docs · `src: legal`
`review {file} for {concerns} and list anything I should fix before it goes to {reviewer}`

### Steer
**Course-correct a wrong approach** · `src: best-practices`
`that is not right: {feedback}. try a different approach`
- Why: назови пропущенное ОГРАНИЧЕНИЕ, не просто «неверно». Stick: Esc×2 → rewind menu.

**Narrow the scope of a change** · `src: best-practices`
`that is too much. keep only the changes to {scope} and undo your other edits`

**Turn a correction into a rule** · `src: best-practices`
`you keep {mistake}. add a rule to CLAUDE.md so this stops happening`
- Why: правка в чате не шарится с командой; правило в `CLAUDE.md` — да. Stick: `/memory`.

---

## SHIP

### Git
**Resolve merge conflicts** · `src: workflows`
`resolve the merge conflicts in this branch and explain what you kept from each side`

**Commit with a generated message** · `src: workflows`
`commit these changes with a message that summarizes what I did`

**Open a pull request from a ticket** · needs: tracker · `src: workflows`
`find the {tracker} ticket about {topic} and open a PR that implements it`

### Release
**Draft release notes from git history** · roles: pm, docs, marketing · `src: workflows`
`compare {from} to {to} and draft release notes grouped by feature, fix, and breaking change`
- Stick: `/changelog` skill.

**Write a CI workflow** · roles: ops · `src: workflows`
`write a GitHub Actions workflow that {steps} on every push to {branch}`

---

## OPERATE

### Debug
**Find and fix a failing test** · `src: workflows` · ★3
`the {test} test is failing, find out why and fix it`
- Why: опиши симптом — не нужно знать, какой файл сломан.

**Investigate a reported error** · roles: ops · `src: workflows`
`users are seeing {symptom} on {where}. investigate and tell me what is going on`
- Stick: deeplink в runbook с предзаполненным промптом.

**Fix a build error at the root** · roles: ops · paste: error · `src: best-practices`
`here is a build error. fix the root cause and verify the build succeeds`
- Why: root cause+verify предотвращает поверхностные патчи.

### Incident
**Investigate a production incident** · roles: ops, security · `src: workflows`
`{symptom}. check the logs, recent deploys, and config changes, then tell me the most likely cause`
- Why: перечисли источники доказательств, а не шаги. Stick: Sentry/логи через MCP.

**Diagnose from a console screenshot** · roles: ops, data · paste: screenshot · `src: teams`
`here is a screenshot of {console}. walk me through why {resource} is failing and give me the exact commands to fix it`

**Query logs in plain English** · roles: security, ops, data · needs: db · `src: cybersecurity`
`show me all {events} for {scope} over {timeframe}. write the query, run it, and tell me what stands out`

### Data
**Analyze a data file** · roles: data, pm, marketing · paste: csv · `src: teams`
`read {file}, summarize the key patterns, and write the results to {output}`

**Generate variations from performance data** · roles: marketing, data · paste: csv · `src: teams`
`read {file}, find the underperforming {items}, and generate {n} new variations that stay under {limit} characters`

### Automate
**Turn a recurring task into a skill** · `src: workflows`
`create a /{name} skill for this project that {steps}`

**Add a hook for repeat behavior** · `src: best-practices`
`write a hook that {action} after every {event}`

**Connect a tool with MCP** · `src: workflows`
`set up the {server} MCP server so you can read my {data} directly`

**Capture what to remember for next time** · roles: pm, docs · `src: teams`
`summarize what we did this session and suggest what to add to CLAUDE.md`

---

## «What makes these prompts work» (6 базовых паттернов — verbatim)

1. **Describe the outcome, not the steps.** `add rate limiting to the public API and make sure existing tests still pass`
2. **Give it a way to check its own work.** `write the migration, run it against the dev database, and confirm the schema matches`
3. **Point at a reference.** `add a settings page that follows the same layout as the profile page`
4. **State the measurable target.** `get the bundle size under 200KB and show me what you removed`
5. **Give it the artifact.** (paste errors/logs/screenshots/plan, или `@file`) `why is the build failing? @build.log`
6. **Say how you want the answer.** (формат/длина/аудитория; output style для дефолта) `explain how the payment retry logic works as an HTML page with a diagram, then open it in my browser`

## Источники (первичные, от Anthropic)
- Common workflows — /en/common-workflows
- Best practices — /en/best-practices
- How Anthropic teams use Claude Code — claude.com/blog/how-anthropic-teams-use-claude-code (+ Legal, Marketing, Cybersecurity)
- Scaling agentic coding guide (PDF, enterprise adoption)
- Видео: Claude Code in Action (Anthropic Academy)
