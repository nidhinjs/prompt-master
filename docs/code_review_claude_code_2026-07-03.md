# Code Review (Claude Code) — снимок 2026-07-03

> Источник: https://code.claude.com/docs/en/code-review
> «Set up automated PR reviews… using multi-agent analysis of your full codebase.»
> Research preview, только Team/Enterprise, недоступно при Zero Data Retention. Живой документ.
> ⚠️ Для нас это на 80% ПРОДУКТОВАЯ дока (setup/pricing/GitHub App/troubleshooting) — не форма промпта. Ценное выделено маркером **[★ релевантно скиллу]**.

## Суть

Анализирует GitHub PR, постит находки инлайн-комментами на строках. **Флот специализированных агентов** параллельно смотрит diff в контексте всего кодбейса: logic errors, security, broken edge cases, subtle regressions. Находки тегируются severity, **не апрувят и не блокируют** PR. Тюнинг — через `CLAUDE.md` / `REVIEW.md`. Локально без GitHub App — команда `/code-review`.

## How reviews work — **[★ релевантно скиллу: это наша же методология]**

Триггерится на открытии PR / каждом пуше / вручную (`@claude review`). Когда ревью идёт: **несколько агентов анализируют diff параллельно на инфре Anthropic, каждый ищет свой класс проблем, затем verification-шаг проверяет кандидатов против реального поведения кода, отсеивая false positives**. Результаты дедуплицируются, ранжируются по severity, постятся инлайн + саммари. В среднем 20 мин.

> Это ровно паттерн find→verify(refute)→dedup→rank, который мы применяем в собственном opus adversarial-gate и который best-practices зовёт «adversarial review step». Внешнее подтверждение архитектуры.

### Severity levels
| Marker | Severity | Meaning |
|---|---|---|
| 🔴 | Important | баг, который надо чинить до мержа |
| 🟡 | Nit | мелочь, стоит поправить, но не блокер |
| 🟣 | Pre-existing | баг уже был в кодбейсе, не внесён этим PR |
Каждая находка — с раскрываемой секцией extended reasoning (почему зафлажено и как верифицировано).

### Rate / reply
👍/👎 на каждом комменте (тюнинг ревьюера после мержа). Ответ на инлайн-коммент НЕ триггерит Claude. Чтобы применить — правишь код и пушишь; `@claude review once` — свежее ревью без подписки на пуши.

### Check run output
Отдельный check run **Claude Code Review**: таблица находок по severity + аннотации на строках в Files changed. Всегда neutral conclusion (не блокирует мерж). Машиночитаемый хвост для парсинга своим CI:
```bash
gh api repos/OWNER/REPO/check-runs/CHECK_RUN_ID \
  --jq '.output.text | split("bughunter-severity: ")[1] | split(" -->")[0] | fromjson'
# → {"normal": 2, "nit": 1, "pre_existing": 0}
```

### What Code Review checks
По умолчанию — **correctness**: баги, ломающие прод, НЕ форматирование и НЕ покрытие тестами. Расширяется guidance-файлами.

## Setup (продуктовое — не для скилла)
Owner включает раз на организацию (claude.ai/admin-settings/claude-code) → ставит Claude GitHub App (Contents RW, Issues RW, PRs RW) → выбирает репы → per-repo **Review Behavior**: Once after PR creation / After every push / Manual. Таблица показывает средний cost/review.

## Manually trigger
| Команда | Что делает |
|---|---|
| `@claude review` | старт ревью + подписка на push-triggered ревью |
| `@claude review once` | одно ревью без подписки |
Требования: top-level PR-коммент (не инлайн), команда в начале, доступ owner/member/collaborator, PR открыт. Ручные триггеры работают и на draft PR.

## Customize reviews — **[★ релевантно скиллу: промптируемые knobs ревьюера]**

Два файла, разная сила влияния:
- **`CLAUDE.md`** — общий контекст проекта для всех задач; новые нарушения флажатся как **nit**. Двунаправленно: если PR делает утверждение в CLAUDE.md устаревшим — Claude флажит, что доки надо обновить. Читается на каждом уровне иерархии директорий.
- **`REVIEW.md`** — review-only инструкции, **инжектятся в системный промпт КАЖДОГО агента пайплайна как highest-priority блок**. Вставляется verbatim: `@`-импорты НЕ раскрываются.

### Что тюнить в REVIEW.md (паттерны с наибольшим эффектом) — **★★ это готовый каталог «как рулить AI-ревьюером»**
- **Severity** — переопредели, что значит 🔴 Important для этого репо (прод ≠ docs-репо ≠ прототип). Можно и эскалировать (любое нарушение CLAUDE.md → Important).
- **Nit volume** — кап на число 🟡: «report at most five nits, mention the rest as a count».
- **Skip rules** — пути/ветки/категории без находок: generated code, lockfiles, vendored deps, machine-authored branches, всё что уже ловит CI (lint/spellcheck). Для «частично ревьюить»: «in `scripts/`, only report if near-certain and severe».
- **Repo-specific checks** — правила на каждый PR: «new API routes must have an integration test» (в REVIEW.md срабатывают надёжнее, чем в длинном CLAUDE.md — highest priority).
- **Verification bar** — требовать доказательство до постинга класса находок: **«behavior claims need a `file:line` citation in the source, not an inference from naming»** — режет false positives.
- **Re-review convergence** — поведение при повторном ревью: «after the first review, suppress new nits and post Important findings only» (чтоб однострочный фикс не дошёл до раунда 7 по стилю).
- **Summary shape** — «open with a one-line tally `2 factual, 4 style`; lead with "no factual issues" when true».

Пример REVIEW.md:
```markdown
# Review instructions
## What Important means here
Reserve Important for findings that would break behavior, leak data, or block a
rollback: incorrect logic, unscoped database queries, PII in logs/error messages,
migrations that aren't backward compatible. Style/naming/refactoring are Nit at most.
## Cap the nits
Report at most five Nits per review. If more, say "plus N similar items". If all Nit,
lead with "No blocking issues."
## Do not report
- Anything CI already enforces: lint, formatting, type errors
- Generated files under `src/gen/` and any `*.lock` file
- Test-only code that intentionally violates production rules
## Always check
- New API routes have an integration test
- Log lines don't include email addresses, user IDs, or request bodies
- Database queries are scoped to the caller's tenant
```
**Keep it focused:** длинный REVIEW.md разбавляет главные правила. Только инструкции, меняющие поведение ревью; общий контекст — в CLAUDE.md.

## Pricing / usage (продуктовое)
Биллинг по токенам, **$15–25 за ревью** в среднем, отдельно через usage credits. Триггер влияет на суммарный cost (every push × число пушей). Spend cap: claude.ai/admin-settings/usage. Дашборд: claude.ai/analytics/code-review.

## Troubleshooting (продуктовое)
Failed/timed-out run → neutral conclusion, не ретраит сам → `@claude review once` (кнопка Re-run в GitHub НЕ ретриггерит). Spend-cap → single comment, возобновление в новом периоде. Находки без инлайн-коммента ищи в: Check run Details / Files changed annotations / Review body (Additional findings).

## Review a diff locally — **[★ релевантно: авторитетный референс команды `/code-review`]**
`/code-review` в любой сессии Claude Code — без GitHub App. Репортит correctness-баги + (min-version 2.1.151) reuse/simplification/efficiency cleanups. По умолчанию: коммиты ветки впереди upstream + незакоммиченные изменения.
- `--comment` — постит находки инлайн-комментами в PR.
- `--fix` — применяет находки в working tree после ревью.
- **Effort levels**: low → меньше находок, выше confidence; high…max → шире охват, могут быть uncertain. Без аргумента — текущий effort сессии.
- **Target**: file path / PR number / branch name / ref range `main...my-feature` (ревьюит committed diff, который дал бы PR из my-feature в main).
- `/code-review ultra --fix` — глубокий **ultrareview в облаке**, потом применяет находки; свой scope: текущая ветка против default-ветки репо + uncommitted/staged.
- История имён: до v2.1.147 команда звалась `/simplify` (применяла фиксы по умолчанию). С v2.1.154 `/simplify` = отдельное cleanup-only ревью (фиксит без охоты на баги). Для баг-поиска → `/code-review --fix`.

## Related
Commands (/en/commands) · GitHub Actions · GitLab CI/CD · Memory (/en/memory) · Analytics · ultrareview (/en/ultrareview).
