# Refresh Checklist — «sites to touch» при обновлении модельных фактов

Один факт о модели живёт в нескольких слоях. Обновляя его, пройди по всем точкам ниже —
частичный refresh (обновили профиль, забыли читшит) — главный источник дрейфа в этом скилле.
Ревью v1.24.1 нашло 26 расхождений именно из-за пропущенных пунктов этого списка.

## Порядок при обновлении факта о модели/туле

1. **`references/models.md`** — канон для волатильных фактов (ID, дефолты, лимиты, даты
   deprecation). Обнови факт и подними `last-verified` секции.
2. **`references/tool-profiles.md`** — профиль тула: evergreen-советы, но проверь, что
   упомянутые в них лимиты/knob-значения не противоречат models.md.
3. **`SKILL.md` → Gotchas-читшит** — если модель упомянута в quick-строке, синхронизируй.
4. **`SKILL.md` → Hard rules** — канонический no-CoT список и перечень knob-тулов живут
   ТОЛЬКО здесь; другие секции ссылаются, не перечисляют. Новая reasoning-native модель →
   добавь в канонический список; новый тул с настройками → добавь в knob-перечень
   (все три вхождения ловит линт).
5. **`references/templates.md`** — тело шаблона И строка в Table of Contents (ToC линтуется);
   Template E повторяет no-CoT список — синхронизируй с каноном (линт проверяет).
6. **`references/patterns/index.json` и соответствующие shards** — PM-038/048/049/051
   остаются provider-neutral и ссылаются на facts/profiles; model IDs, даты,
   lifecycle-статусы и значения параметров не копируются в normative repairs.
7. **`README.md` + `README.ru.md`** — заявленный список туллов/фич и точные
   stable/active/tombstone counts pattern registry.
8. **`docs/installation.md`** — router/index/shard layout и runtime inventory.
9. **`docs/sources.md`** — добавь источник факта; research-файлы кладём в `docs/` и коммитим.
10. **`plugin.json` / `marketplace.json`** — descriptions остаются count-free и
    не дублируют volatile model facts.

## После правок — безопасная проверка

- `node scripts/test-safe.js` — основной локальный/CI gate. Он включает hook fixtures,
  `node scripts/lint.js`, syntax check live-runner, offline golden-regex fixtures и
  fake-Claude E2E; настоящий Claude CLI не вызывается.
- `node scripts/test-hook.js` — можно запускать отдельно при правках хука.
- `node scripts/lint.js` — можно запускать отдельно при правках профилей/документов.
- `./scripts/lint.ps1` (pwsh или powershell.exe) — legacy helper, не основной CI gate.
- `./scripts/bump-version.ps1 -Bump minor|patch` — синхронный подъём версии.
- Заполни секцию в `CHANGELOG.md`.

## Релиз — обязательные шаги (иначе рвётся traceability, F-1)

Версия в `plugin.json` без git-тега = висячая footer-ссылка и непрослеживаемый релиз.
Тег обязателен и должен быть опубликован:

1. **Тег на релизном коммите (обязательно):** `./scripts/bump-version.ps1 -Bump minor|patch -Tag`
   — флаг `-Tag` создаёт подписанный тег `vX.Y.Z` (или вручную `git tag -s vX.Y.Z <commit>`).
2. **Публикация тега (обязательно):** `git push origin vX.Y.Z`. Без этого GitHub Release и
   footer-ссылка в `CHANGELOG.md` не разрешаются. `lint.js` предупреждает локально, если у
   текущей версии нет тега; на tag-push CI падает при несоответствии тега версии.
3. **GitHub Release:** `./scripts/package-skill.ps1 -Upload` — приложи ZIP + sha256 к `vX.Y.Z`.
4. Сверься с `docs/release-evidence/tag-inventory-2026-07.md`: каждая footer-ссылка `CHANGELOG`
   должна разрешаться в тег и release.

## Live eval — запрещён по умолчанию

- `scripts/run-golden.js` делает реальные `claude -p` вызовы и не является обычным
  тестом. Не запускай его без явного разрешения пользователя в текущем диалоге.
- Даже при разрешении ограничивай прогон: `--only <id>` или `--max-scenarios <n>`,
  плюс `PROMPT_MASTER_ALLOW_CLAUDE_RUNNER=1`.
- Полный suite требует второго opt-in: `PROMPT_MASTER_ALLOW_FULL_GOLDEN=1`.

## Трейты профилей

У профилей с особым поведением в tool-profiles.md есть строка `*Traits: …*` сразу под
заголовком: `reasoning-native` (модель из канонического no-CoT списка) и/или `knobs (…)`
(тул из перечня settings-as-knobs). Линт сверяет: каждый knob-тул из hard rule → профиль
с трейтом `knobs`; каждая модель из канонического no-CoT списка → покрыта профилем с
трейтом `reasoning-native`. Добавляя тул/модель — добавь и трейт.
