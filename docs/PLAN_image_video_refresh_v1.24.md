# План — Полный рефреш image+video профиля (v1.24)

## Context
Покрытие image/video в скилле устарело (Midjourney `--v 6`/`--cref`, DALL-E 3, Flux без версии; в `models.md` нет image/video-секции с датами; Google/Veo/Grok Imagine/Seedance отсутствуют). Факты собраны и верифицированы за сессию — в `docs/` (`image_video_tools_refresh_perplexity_2026-06-30.md`, `grok_imagine_facts_2026-06-30.md`, `gap_fill_patch.md`, JSON) и в памяти `media-tools-facts`/`gemini-media-facts`. Решения: **полный рефреш одним релизом, v1.24** (Claude Code → v1.25). План описывает ЧТО и КАК; значения фактов не дублируются — берутся из источников выше.

## Scope
- **Актуализировать 10:** Midjourney V8.1, GPT-image (`gpt-image-2`, ex-DALL-E 3), SD 3.5, FLUX.2, SeeDream 5.0, Sora (sunset), Runway Gen-4.5/aleph2, Kling 3.0, LTX-2, Luma ray-3.2.
- **Добавить 4 семейства:** Google (Nano Banana 2 Lite/2/Pro + Omni Flash), Grok Imagine (image+video), Seedance 2.0, Veo 3.1.

## Phase 0 — Live re-verify (parallel; анти-фабрикация)
Schema-дыры уже закрыты `gap_fill_patch.md`. Осталось сверить только **volatile preview-ID/цены + дедлайны** — распараллелить по вендорам (см. таблицу агентов). Остаточные uncertain (Kling omni `cfg_scale`, Kling 4K schema↔guide-конфликт, SeeDream negative-prompt/`output_format`) → **не хардкодить**, помечать «verify». Не подтверждённое live → формулировать «текущая линейка», в models.md ставить «DO-NOT-HARDCODE, 60-day reverify». На исполнении: скопировать source-доки в `docs/`, влить факты в `models.md`+память.

## Phase 1 — Integration (single-pass, НЕ параллелить)
Правки DRY-связные (счётчик паттернов в 5 файлах, version в 3, cross-refs, бюджет SKILL ≤250) — параллельная запись рассинхронит. Один интегратор (main, opus), якоря из Explore-карты:
- **tool-profiles.md** (L41,46,373–424): актуализировать 10 профилей (ключевые дельты: `--cref`→`--oref`, DALL-E 3→gpt-image-2, FLUX.1→FLUX.2, Runway→Gen-4.5/aleph2, Kling→3.0, LTX→LTX-2, Luma→ray-3.2); добавить 4 семейства; Routing Index +Google/Veo/Seedance/Grok Imagine; расширить Assumed-settings буллеты на новые knobs.
- **templates.md** (L276–361): Template I/J — синтаксис под новые версии (`--oref`, gpt-image-2 createEdit+mask, SD3.5 edit/control-style, Gemini image-edit); новый conversational-video фрагмент (`<FIRST_FRAME>`/`<IMAGE_REF_n>`, таймкоды, «Keep everything else the same»).
- **models.md** (нов. секции + L55): `## Image AI` / `## Video AI` model-facts с `last-verified` + timeline дедлайнов + volatile-пометки; Grok-строку → ссылка на профиль.
- **SKILL.md** (L105 Gotchas, L251 счётчик, frontmatter version): уплотнить image-строку + tier-routing + conversational-edit + sunset-флаг; счётчик 48→51; version 1.24.0; держать body ≤250.
- **patterns.md** (L3 header, #19, +#49–51): header 48→51; #19 `--v 6`→`--v 8.1`; +#49 (consistency-задача на быстром/Lite-тире → роутить на 2/Pro/мульти-ref), +#50 (verbose video-edit вместо «Keep everything else the same»), +#51 (дефолт на sunsetting/deprecated-модель без флага).

## Phase 2 — Counts / manifests
- Пересчитать tools/profiles фактически → обновить README L218 («50+/30+»).
- README.md + README.ru.md: Routing Index (L208–209), profile-list (L250/253), Works-with (L11), pattern-count 48→51 (L325/327 + строки #49–51), version-line (L387)→v1.24.
- plugin.json (L3 version→1.24.0, L4 count→51) + marketplace.json (L4 count→51).
- docs/sources.md: +image/video source-rows (URL+дата). CHANGELOG: запись `[1.24.0]`.

## Критерии приёмки (все должны выполняться)
1. **Нет stale-токенов** в файлах скилла: `--cref`, `--v 6`, «FLUX.1», Runway «Gen-3» как current, «DALL-E 3» как актуальная модель (только как legacy-алиас).
2. Все **10 тулов** — на текущих версиях/ID; все **4 новых семейства** присутствуют в tool-profiles + Routing Index + README (EN+RU).
3. **models.md** содержит image/video-секции с `last-verified` датами и timeline дедлайнов (Sora 09-24, Veo 2/3 06-30, Runway gen4_aleph 07-30).
4. **Счётчик = 51** идентичен в patterns.md/SKILL.md/plugin.json/marketplace.json/README.md; #19 обновлён; #49–51 добавлены.
5. **version = 1.24.0** в plugin.json/SKILL.md/CHANGELOG; README version-line = v1.24.
6. **SKILL.md body ≤ 250** строк.
7. `Assumed settings:` (v1.23) цел; новые knob-тулы наследуют строку допущений.
8. **Ни одного** не подтверждённого live volatile-ID/цены не захардкожено; uncertain-пункты помечены «verify».
9. `lint.ps1` → **0 errors** (WARN допустимы).
10. **Clean-room T4** — каждый кейс **3/3**; **opus-gate** — 0 CONFIRMED-находок.
11. **Code-review (Phase 3.5)** всего скилла в свежем контексте — 0 необработанных Critical/High находок.

## Тесты
- **T1 — lint:** `pwsh ./scripts/lint.ps1` → exit 0 (version-parity, count×5, CRLF=LF, body≤250).
- **T2 — анти-stale grep (ожидается 0 совпадений в `plugins/.../`):** `--cref` · `--v 6` · `FLUX\.1` · `Gen-3` · `DALL-E 3` вне legacy-контекста.
- **T3 — анти-регресс grep:** `Assumed settings:` присутствует; строка `51` найдена в 5 файлах; `1.24.0` в 3 файлах; нет осиротевших cross-ref на удалённые секции.
- **T4 — clean-room (fresh sonnet-агенты, neutral framing, на входе только файлы скилла + реальный запрос, 3 прогона/кейс):**
  - C1 «сгенерируй бренд-консистентного персонажа» → роутинг на consistency-capable (Nano Banana 2/Pro, FLUX.2 multi-ref), НЕ на Lite; Assumed-settings строка есть.
  - C2 «поправь это видео: добавь X, остальное не трогай» → выдаёт «Keep everything else the same» + теги/таймкоды.
  - C3 запрос на Sora → флаг sunset (2026-09-24) + альтернатива.
  - C4 «10-сек продуктовое видео» → корректный роутинг (Veo 3.1 / Kling 3.0 / Seedance 2.0) с длительностью/res в Assumed-settings.
- **T5 — package dry-run:** `pwsh ./scripts/package-skill.ps1 -DryRun` → SKILL.md в корне архива, версия 1.24.0.
- **T6 — формат вывода = Markdown:** во всех clean-room прогонах (C1–C4) доставляемый промпт оформлен как **Markdown** — сам промпт в fenced code block (готов к копированию), сопровождающие строки (`Assumed settings:` и пр.) — валидной markdown-разметкой; не plain-text-простыня. Порог 3/3 на кейс.

## Phase 3.5 — Code review всего скилла (свежий контекст; гейт перед релизом)
Запустить **скилл code-review в новом контекстном окне** (отдельный агент с чистым контекстом — не загрязнённым этой сессией). Передать ему необходимый контекст: (а) стоячие требования (анти-фабрикация / verify-don't-trust / нет stale-фактов / `Assumed settings:`-конвенция / бюджет SKILL ≤250 / синхрон счётчиков и версий), (б) суть изменений v1.24, (в) критерии приёмки выше. **Объём ревью — ВЕСЬ скилл** (SKILL.md + все `references/` + манифесты), не только diff. Линзы под doc-скилл: фактологическая корректность (выдуманные/устаревшие model-ID), внутренняя согласованность (счётчики/версии/cross-ref/Routing Index↔профили), сопровождаемость. **Гейт:** Critical/High находки чинятся и пере-проверяются до Phase 4; результат — в саммари.

## План агентов (параллель там, где оправдано)
| Этап | Юнит распараллеливания | Кол-во | Модель | Обоснование |
|---|---|---|---|---|
| Phase 0 verify | по вендору: (1) Google Gemini/Veo, (2) xAI/Grok, (3) OpenAI gpt-image siblings | 3 параллельно | **sonnet** | независимые live-доки, механический fetch+extract; opus избыточен |
| Phase 1 integrate | — (единый писатель) | 1 (main) | **opus** | DRY: счётчики/cross-ref/бюджет связаны; параллель рассинхронит |
| Phase 3 clean-room T4 | кейс × 3 прогона | 4×3=12 параллельно | **sonnet** | независимы, neutral framing, точная эмуляция скилла |
| Phase 3 adversarial gate | весь `git diff` | 1 | **opus** | сложнейшее рассуждение: ловить stale/рассинхрон/выдуманные ID |
| Phase 3.5 code-review | весь скилл (свежий контекст) | 1 | **opus** | независимое ревью с чистым контекстом; полный скилл, не diff; гейт перед релизом |

## Phase 4 — Release (подтвердить ПЕРЕД push/release)
`bump-version.ps1 -Version 1.24.0` → заполнить CHANGELOG → commit (trailer `Co-Authored-By: Claude Opus 4.8`) → signed tag (`-c user.signingkey="C:/Users/Lenovo/.ssh/id_ed25519_github.pub"`) → push → `gh release create` → `package-skill.ps1 -Upload`.

## Критические файлы
- `plugins/prompt-master/skills/prompt-master/references/{tool-profiles,templates,models,patterns}.md`
- `plugins/prompt-master/skills/prompt-master/SKILL.md`
- `README.md`, `README.ru.md`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `CHANGELOG.md`, `docs/sources.md`
- Источники (копировать в `docs/` на исполнении): `gap_fill_patch.md` + уже лежащие refresh-доки.

## Память
- На исполнении: влить gap-fill факты в `media-tools-facts`; пометить остаточные uncertain.
- После релиза: `backlog-roadmap` → ✅v1.24, Claude Code → v1.25; `media-tools-facts`/`gemini-media-facts` → «интегрировано в v1.24» + обновить last-verified.

## Риски
- **SKILL.md ≤250** — компенсировать сжатием соседних строк.
- **Volatile ID/цены** — только через Phase 0; неуверенное не хардкодить.
