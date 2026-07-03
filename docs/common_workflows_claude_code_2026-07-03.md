# Claude Code — Common workflows (снимок 2026-07-03)

> Источник: https://code.claude.com/docs/en/common-workflows
> «Step-by-step guides for exploring codebases, fixing bugs, refactoring, testing, and other everyday tasks.»
> Скачано verbatim (Steps/Tips конвертированы в markdown). Живой документ.
> Для prompt-master: ~90% пересекается с prompt-library/best-practices; уникальное помечено **[★]**.

## Prompt recipes

### Understand new codebases
**Quick overview:** `cd project` → `claude` → `give me an overview of this codebase` → углубление: `explain the main architecture patterns used here` / `what are the key data models?` / `how is authentication handled?`
Tips: от широких вопросов к узким; спросить про конвенции проекта; запросить глоссарий проектных терминов.

**Find relevant code:** `find the files that handle user authentication` → `how do these authentication files work together?` → `trace the login process from front-end to database`
Tips: специфичность; доменный язык проекта; code intelligence plugin для go-to-definition.

### Fix bugs efficiently
`I'm seeing an error when I run npm test` → `suggest a few ways to fix the @ts-ignore in user.ts` → `update user.ts to add the null check you suggested`
Tips: дать команду воспроизведения + stack trace; шаги репро; intermittent или consistent.

### Refactor code
`find deprecated API usage in our codebase` → `suggest how to refactor utils.js to use modern JavaScript features` → `refactor utils.js to use ES2024 features while maintaining the same behavior` → `run tests for the refactored code`
Tips: спросить о выгодах нового подхода; требовать обратной совместимости; мелкие проверяемые инкременты.

### Work with tests
`find functions in NotificationsService.swift that are not covered by tests` → `add tests for the notification service` → `add test cases for edge conditions…` → `run the new tests and fix any failures`
Claude сверяет стиль/фреймворки/assertion-паттерны с существующими тестами. Просить edge cases, boundary values, unexpected inputs.

### Create pull requests
`summarize the changes I've made to the authentication module` → `create a pr` → `enhance the PR description with more context about the security improvements`
**[★]** При `gh pr create` сессия автоматически линкуется к PR; вернуться: **`claude --from-pr <number>`** или вставить PR-URL в `/resume`-пикер.

### Handle documentation
`find functions without proper JSDoc comments in the auth module` → `add JSDoc comments…` → `improve the generated documentation…` → `check if the documentation follows our project standards`

### Work in notes and non-code folders
**[★]** Claude Code работает в любой директории (заметки, доки, markdown-вольты). `.claude/` и `CLAUDE.md` уживаются с чужими конфигами; файлы перечитываются на каждый tool call — правки из других приложений видны.

### Work with images
Способы: drag&drop; **copy → `ctrl+v` в CLI (НЕ cmd+v)** **[★]**; путь к файлу («Analyze this image: /path/to/image.png»).
Промпты: `What does this image show?` / `Describe the UI elements in this screenshot` / `Here's a screenshot of the error. What's causing it?` / `Generate CSS to match this design mockup`.
**[★]** Ссылки на изображения в ответе (`[Image #1]`) — Ctrl+Click открывает.

### Reference files and directories
- `Explain the logic in @src/utils/auth.js` — полное содержимое файла в диалог.
- `What's the structure of @src/components?` — листинг директории (не содержимое).
- **[★]** `Show me the data from @github:repos/owner/repo/issues` — **MCP-ресурсы форматом `@server:resource`**.
Tips: `@`-референс подтягивает CLAUDE.md из директории файла и родителей; несколько файлов в одном сообщении можно.

### Run a schedule
| Опция | Где | Для чего |
|---|---|---|
| Routines | инфра Anthropic | задачи при выключенном компе; триггеры API/GitHub-события |
| Desktop scheduled tasks | локально (desktop app) | доступ к локальным файлам/uncommitted |
| GitHub Actions | CI | события репо/cron рядом с workflow |
| `/loop` | текущая CLI-сессия | быстрый polling пока сессия открыта |
**[★] Tip для scheduled-промптов:** задача автономна и НЕ может задать уточняющий вопрос → явный success-критерий + что делать с результатом. Пример: «Review open PRs labeled `needs-review`, leave inline comments on any issues, and post a summary in the `#eng-reviews` Slack channel.»

### Ask Claude about its capabilities
Claude имеет доступ к собственной актуальной документации: `can Claude Code create pull requests?` / `how does Claude Code handle permissions?` / `what skills are available?` / `how do I use MCP…` — отвечает по докам независимо от версии. `/powerup` — интерактивные уроки.

## Session-level workflows
- **Resume:** `claude --continue` (последняя в текущей директории) / `claude --resume` (выбор) / `/resume` изнутри.
- **Worktrees:** `claude --worktree feature-auth` — изолированный checkout на своей ветке; параллельные сессии без коллизий.
- **Plan mode:** `claude --permission-mode plan` или `Shift+Tab` mid-session — читает и планирует, не редактируя до одобрения.
- **Subagents:** `use a subagent to investigate how our auth system handles token refresh` — исследование в отдельном контексте, назад только выводы.
- **Pipe:** `git log --oneline -20 | claude -p "summarize these recent commits"` — stdin/stdout как Unix-tool.

## Next steps (ссылки)
Best practices · Manage sessions · Worktrees · Extend Claude Code (features-overview).
