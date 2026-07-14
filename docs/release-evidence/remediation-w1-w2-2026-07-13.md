# Результаты ремедиации — Волны 1–2 (2026-07-13)

Источник: `docs/REMEDIATION_PLAN_2026-07-13.md`. Охват: только Волна 1 (CI-гейт) и
Волна 2 (трассируемость релизов). Режим: локальные изменения разрешены; remote/GitHub
операции (push, gh release) — только подготовка, не выполнялись.

- Ветка: `chore/remediation-w1-w2` (от `main`).
- Коммиты: `1589fa1` (Волна 1), `0937b85` (Волна 2).
- Итоговый гейт: `node scripts/lint.js` → PASSED (0 error, 0 warning);
  `node scripts/test-safe.js --strict` → `expected=17 executed=17 passed=17 failed=0 skipped=0`.
- Верификация везде двухэтапная: смоук (таргетный) → основной гейт.

## Волна 1 — CI-гейт (коммит 1589fa1)

| Пункт | Действие | Файлы | Статус | Доказательство |
|-------|----------|-------|--------|----------------|
| 1.1 | `test-codex-agents.js` добавлен в `DEFAULT_CHECKS`; `lint.js` требует его wiring; счётчик 16→17 в `test-portable-verification.js` | `scripts/test-safe.js`, `scripts/lint.js`, `scripts/test-portable-verification.js` | ✅ | смоук `node scripts/test-codex-agents.js` → `ok:true`; гейт → `passed=17` |
| 1.2 | Триггер `push: tags: ['v*']`; на tag-push `lint.js:179-181` валидирует тег==версия | `.github/workflows/ci.yml` | ✅ | YAML зеркалит существующие jobs; контракты `test-contracts.js:506-512` зелёные |
| 1.3 | Job `package-dry` (windows-2025): `pwsh -NoProfile -File scripts/package-skill.ps1 -DryRun`; без `claude plugin validate` | `.github/workflows/ci.yml` | ✅ | смоук DryRun локально → exit 0, 44 файла tracked manifest |

DoD 1.1 (`expected=17 executed=17 passed=17`) достигнут.

## Волна 2 — трассируемость релизов (коммит 0937b85)

| Пункт | Действие | Статус |
|-------|----------|--------|
| 2.1 | Инвентаризация read-only → `docs/release-evidence/tag-inventory-2026-07.md` | ✅ |
| 2.2 | Воссоздание тегов — НЕ требуется (все теги v1.8.0…v1.37.0 есть на origin и локально) | н/п |
| 2.3 | Массовое создание релизов — НЕ требуется | н/п |
| 2.4 | `REFRESH_CHECKLIST.md`: `-Tag` + `git push origin vX.Y.Z` сделаны обязательными; `lint.js`: локальный warning «версия без тега» (fs-only, gated `!GITHUB_ACTIONS`, warning не error) | ✅ |

Ключевой вывод 2.1: премиса аудита F-1 «теги релизов потеряны» **устарела** — релизная
линия на origin цела до v1.37.0. Единственное расхождение — висячая footer-ссылка
`[1.31.1]` (тега/релизного коммита нет). По решению владельца **оставлено как есть**,
задокументировано в `tag-inventory-2026-07.md`.

Логика warning 2.4 проверена вживую: `v1.37.0`→тег есть (нет warning);
`v9.9.9`/`v1.31.1`→тега нет (warning сработает).

## Замечание по методу

`test-portable-verification.js` (жёсткий счётчик `=== 16`) был пойман основным гейтом
после правки 1.1 — обновлён на 17. Это подтверждает ценность двухэтапной верификации:
смоук проходил, а связанный инвариант поймал только полный гейт.

## Не выполнено (граница полномочий) / открыто

- **Remote не тронут.** Подготовлено к одобрению владельца (не выполнено):
  - `git push origin chore/remediation-w1-w2` — публикация ветки/PR.
  - `v1.31.1` — при решении «создать тег»: `git tag -s v1.31.1 <commit>` + `git push origin v1.31.1`.
- **D-1 (п.1.3):** `claude plugin validate ./plugins/prompt-master --strict` в CI —
  по умолчанию НЕ добавлен (риск нарушить запрет `AGENTS.md` на model-call/телеметрию).
  Ждёт решения владельца.
- **`v1.31.0` на remote — легковесный тег** (не аннотированный); переоформление —
  force-обновление ссылки на remote, только с одобрения.
- Пустой untracked-файл `FAIL` в корне репозитория — не относится к ремедиации, не тронут.
