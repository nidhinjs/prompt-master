# Установка — Prompt Master

Навык поставляется как **плагин Claude Code** (маркетплейс на GitHub) и одновременно как **self-contained скилл**, который можно загрузить в Claude.ai.

---

## Способ 1: Claude Code / Cowork — плагин-маркетплейс (рекомендуется)

### Cowork (GUI, без файлов)

1. Открой **Customize** (слева внизу).
2. **Browse plugins → Personal → +**.
3. **Add marketplace from GitHub**.
4. Введи: `azagreev/prompt-master-za`.
5. Установи плагин **prompt-master** — навык подключится автоматически.

### Claude Code (CLI)

```bash
# 1. Добавить маркетплейс из GitHub
/plugin marketplace add azagreev/prompt-master-za

# 2. Установить плагин (формат: <плагин>@<маркетплейс>)
/plugin install prompt-master@prompt-master
```

После установки навык активируется автоматически по запросам вроде «напиши промпт для …», «исправь этот промпт», «адаптируй промпт под Midjourney». Явный вызов: `/prompt-master:prompt-master`.

### Локальная проверка перед публикацией (из клона)

Маркетплейс можно добавить из локальной папки — удобно, пока изменения не запушены на GitHub:

```bash
git clone https://github.com/azagreev/prompt-master-za.git
cd prompt-master-za
/plugin marketplace add ./           # путь до папки с .claude-plugin/marketplace.json
/plugin install prompt-master@prompt-master
```

> Относительные пути `source` в манифесте резолвятся от корня репозитория, поэтому локальное добавление работает так же, как из GitHub.

---

## Способ 2: Claude.ai (ZIP-скилл)

Навык self-contained, поэтому загружается в Claude.ai как обычный скилл. Этот путь **минует кэш стороннего маркетплейса** (Claude Code / Cowork / claude.ai не авто-обновляют сторонние маркетплейсы) — если веб/десктоп завис на старой версии, ставь бандлом.

1. Возьми готовый бандл `prompt-master-<version>.zip` — он приложен к каждому релизу: [GitHub Releases (latest)](https://github.com/azagreev/prompt-master-za/releases/latest).
   Или собери из клона: `./scripts/package-skill.ps1` → `dist/prompt-master-<version>.zip` (в **корне** архива — `SKILL.md` и `references/`).
2. Claude → **Настройки → Возможности** → включи «Code execution and file creation».
3. **Настроить → Скиллы → +** → загрузи ZIP.
4. В любом чате попроси «напиши промпт для …» — навык активируется.

---

## Способ 3: Ручная установка (Claude Code skills dir)

Скопируй self-contained папку навыка в каталог персональных скиллов Claude Code — на всех ОС это `~/.claude/skills/`:

```bash
cp -r plugins/prompt-master/skills/prompt-master \
      ~/.claude/skills/prompt-master
```

(Windows без WSL: `%USERPROFILE%\.claude\skills\prompt-master`.)

Перезапусти Claude Code. Пути вида `~/.config/Claude/skills/` относятся к другим продуктам — Claude Code их не сканирует.

---

## Проверка

Попроси в чате:

```
Напиши промпт для Claude Code, чтобы собрать REST API на Express — спроси, что нужно знать
```

Навык должен активироваться, уточнить недостающие детали (макс. 3 вопроса) и выдать один готовый к вставке блок.

### Если навык не активируется

1. **Claude Code:** `/plugin` → проверь, что `prompt-master` установлен и включён; при необходимости `/reload-plugins`.
2. Убедись, что версия плагина в `/plugin` → Marketplaces соответствует свежему релизу — сторонние маркетплейсы не авто-обновляются (см. README → «🔄 Обновление плагина»).
3. Попробуй явный вызов `/prompt-master:prompt-master`.

---

## Удаление

```bash
# Claude Code
/plugin uninstall prompt-master@prompt-master
/plugin marketplace remove prompt-master

# Ручная установка
rm -rf ~/.claude/skills/prompt-master
```

---

## Дальше

- `plugins/prompt-master/skills/prompt-master/SKILL.md` — полная логика навыка
- `plugins/prompt-master/skills/prompt-master/references/tool-profiles.md` — компактный routing index
- `plugins/prompt-master/skills/prompt-master/references/profiles/` — семь workflow-профилей
- `plugins/prompt-master/skills/prompt-master/references/facts/` — канонический реестр provider/model facts
- `plugins/prompt-master/skills/prompt-master/references/templates.md` — шаблоны промптов
- `plugins/prompt-master/skills/prompt-master/references/patterns.md` — 61 паттерн-фикс
- `plugins/prompt-master/runtime-manifest.json` — точный tracked inventory файлов release ZIP
- [CHANGELOG.md](../CHANGELOG.md) — история версий
