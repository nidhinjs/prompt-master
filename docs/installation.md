# Установка — Prompt Master

Prompt Master изначально написан как Claude-скилл. Начиная с v1.34, тот же канонический runtime доступен через отдельные host-specific entry points: Claude Code/Cowork plugin, Claude.ai ZIP, Codex repository skill и Codex plugin. Файлы `SKILL.md` и `references/` при этом не копируются в отдельную Codex-реализацию.

---

## Codex: выбери ровно один режим

Codex не объединяет одноимённые скиллы. Если одновременно активны repository entry и установленный плагин, в selector появятся две отдельные записи `prompt-master`. Выбери один из двух режимов ниже.

### Режим A: discovery из репозитория

Этот режим предназначен для работы внутри клона:

```bash
git clone https://github.com/azagreev/prompt-master-za.git
cd prompt-master-za
codex
```

Codex сканирует `.agents/skills/` от рабочей директории к корню репозитория. Entry `.agents/skills/prompt-master` указывает на канонический runtime в `plugins/prompt-master/skills/prompt-master`.

- Явная активация в Codex: `$prompt-master`.
- Неявная активация: попроси естественным языком написать, исправить или адаптировать промпт; Codex сопоставляет запрос с `description` скилла.
- Изменения файлов скилла обнаруживаются автоматически. Если скилл не появился в selector, перезапусти Codex.
- Этот режим обнаруживает скилл, но не требует доверия plugin hook и не зависит от него.

### Режим B: установленный Codex plugin

В приложении Codex открой экран **Plugins**, добавь GitHub-маркетплейс `azagreev/prompt-master-za` и установи **prompt-master**. Эквивалентный CLI flow:

```bash
# Добавить Git marketplace snapshot
codex plugin marketplace add azagreev/prompt-master-za

# Установить <plugin>@<marketplace>
codex plugin add prompt-master@prompt-master

# Проверить установленное состояние
codex plugin list
```

Команды и формы selectors проверены через `--help` установленного `codex-cli 0.144.1`. Плагин использует `.codex-plugin/plugin.json`; существующий `.claude-plugin/marketplace.json` служит совместимым каталогом. **ZIP из Claude.ai Releases не является способом установки в Codex.**

### Как убрать дубликат

Чтобы оставить repository mode, удали установленный плагин:

```bash
codex plugin remove prompt-master@prompt-master
```

Чтобы оставить installed-plugin mode при работе в клоне, отключи repository skill через документированный skill config в `~/.codex/config.toml` (замени путь на абсолютный):

```toml
[[skills.config]]
path = "/absolute/path/to/prompt-master-za/.agents/skills/prompt-master/SKILL.md"
enabled = false
```

После изменения конфигурации открой новую сессию Codex и убедись, что selector `prompt-master` один.

### Hook trust в Codex

В составе установленного плагина есть `UserPromptSubmit` hook. Для non-managed hook Codex показывает его команду и запрашивает trust до исполнения. Это видимая и необязательная возможность:

- hook только добавляет advisory `additionalContext`, когда запрос одновременно просит создать/изменить промпт и нацелен на мультиагентный runtime;
- hook всегда остаётся no-op для остальных запросов и не должен блокировать prompt submission;
- если не доверять hook или пропустить его, основной `$prompt-master` продолжает работать — core behavior находится в `SKILL.md` и references.

Подробнее: [Codex skills](https://developers.openai.com/codex/skills), [Codex plugins](https://developers.openai.com/codex/plugins/build), [Codex hooks](https://developers.openai.com/codex/hooks).

### Обновление Codex

Repository mode обновляется обычным `git pull`; изменения скилла обнаруживаются автоматически. Если обновлённый скилл не виден, перезапусти Codex.

Для installed-plugin mode сначала обнови marketplace snapshot, затем переустанови кешированный plugin snapshot:

```bash
codex plugin marketplace upgrade prompt-master
codex plugin remove prompt-master@prompt-master
codex plugin add prompt-master@prompt-master
codex plugin list
```

`marketplace upgrade` обновляет marketplace snapshot, но само по себе не доказывает замену уже установленного plugin snapshot. Автоматическое обновление Codex app/CLI в этой инструкции не обещается: для release-клиента `0.144.1` проверен CLI flow выше, а более широкое auto-update поведение не подтверждено.

---

## Claude Code / Cowork: плагин-маркетплейс

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

## Claude.ai: ZIP-скилл

Навык self-contained, поэтому загружается в Claude.ai как обычный скилл. Этот путь **минует кэш стороннего маркетплейса** (Claude Code / Cowork / claude.ai не авто-обновляют сторонние маркетплейсы) — если веб/десктоп завис на старой версии, ставь бандлом.

1. Возьми готовый бандл `prompt-master-<version>.zip` — он приложен к каждому релизу: [GitHub Releases (latest)](https://github.com/azagreev/prompt-master-za/releases/latest).
   Или собери из клона: `./scripts/package-skill.ps1` → `dist/prompt-master-<version>.zip` (в **корне** архива — `SKILL.md` и `references/`).
2. Claude → **Настройки → Возможности** → включи «Code execution and file creation».
3. **Настроить → Скиллы → +** → загрузи ZIP.
4. В любом чате попроси «напиши промпт для …» — навык активируется.

---

## Claude Code: ручная установка в skills dir

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

Для явной проверки используй host-specific syntax:

```text
# Codex
$prompt-master Напиши промпт для Claude Code, чтобы собрать REST API на Express

# Claude Code
/prompt-master:prompt-master
Напиши промпт для Claude Code, чтобы собрать REST API на Express
```

### Если навык не активируется

1. **Codex, repository mode:** работай внутри клона, проверь `.agents/skills/prompt-master`, затем попробуй `$prompt-master`; если selector отсутствует, перезапусти Codex.
2. **Codex, installed-plugin mode:** выполни `codex plugin list`; если открыт клон с repository entry, устрани дубликат одним из способов выше.
3. **Claude Code:** `/plugin` → проверь, что `prompt-master` установлен и включён; при необходимости `/reload-plugins`.
4. Убедись, что версия Claude-плагина в `/plugin` → Marketplaces соответствует свежему релизу — сторонние маркетплейсы не авто-обновляются (см. README → «🔄 Обновление плагина»).
5. Для явной активации используй `$prompt-master` в Codex или `/prompt-master:prompt-master` в Claude Code; не переноси slash-команду Claude в Codex.

---

## Удаление

```bash
# Codex plugin
codex plugin remove prompt-master@prompt-master
codex plugin marketplace remove prompt-master

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
