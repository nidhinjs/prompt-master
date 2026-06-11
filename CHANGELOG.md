# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.8.0] - 2026-06-11

### Added
- **Маркетплейс-установка Claude Code.** Репозиторий теперь работает как плагин-маркетплейс: `.claude-plugin/marketplace.json` + `plugins/prompt-master/.claude-plugin/plugin.json`. Установка через `/plugin marketplace add azagreev/prompt-master-za` → `/plugin install prompt-master@prompt-master`.
- **Роутинг под Claude Fable 5 / Mythos 5** — отдельный блок: effort как главный рычаг (`high` по умолчанию), steer короткой интенцией вместо перечня правил, ground progress claims на длинных прогонах, явные boundaries, параллельные субагенты, memory-система.
- **Hard rule про `reasoning_extraction`** — запрет инструктировать Fable 5/Mythos 5 «покажи/воспроизведи свои рассуждения» (триггерит refusal и фолбэк на Opus 4.8); вместо этого — send-to-user tool.
- **Раздел Model-fit failures** в Diagnostic Checklist: over-specification для GPT-5.5/Fable 5, злоупотребление абсолютами, hardcoded effort, legacy-стек инструкций.

### Changed
- **Реструктуризация под плагин:** `SKILL.md` и `references/` перенесены в `plugins/prompt-master/skills/prompt-master/`.
- **Роутинг GPT-5.x переписан под GPT-5.5** (актуальный гайд OpenAI): outcome-first вместо пошагового процесса, `text.verbosity` для длины, перепроверка `low`/`medium` reasoning effort, preambles для tool-задач, retrieval budgets, отказ от лишних абсолютов и legacy-стека инструкций.
- Дефолтная модель Claude в роутинге остаётся Opus 4.8; Fable 5 добавлена как отдельная, более мощная опция с указателем из блока Claude.

## [1.7.0]
- Opus 4.8 compatibility. Claude 4.x routing стал version-aware: durable-советы обобщены на 4.6/4.7/4.8, добавлен профиль Opus 4.8 (дефолт), сохранён Opus 4.7. De-hardcoded effort-level (теперь harness-managed). Template M и pattern 36 покрывают 4.7/4.8.

## [1.6.0]
- Opus 4.7 update. Добавлен Template M (Opus 4.7 Task Brief). Обновлён роутинг Claude и Claude Code под литерализм, adaptive thinking, xhigh effort и session hygiene. Паттерны 36–37.

## [1.5.0]
- Расширен роутинг инструментов: Agentic AI и 3D Model AI. Description приведён к 189 символам. Убрана оценка токенов из вывода. Добавлен instruction layer и copywriting-плейсхолдеры.

## [1.4.0]
- Детекция reference image editing, поддержка ComfyUI, режим Prompt Decompiler. Исправлен trigger description. 3 новых шаблона в references.

## [1.3.0]
- Перестройка вокруг позиционной структуры PAC2026 (30/55/15). Silent routing вместо user-facing выбора фреймворка. Введён каталог references.

## [1.2.0]
- Реструктуризация под attention architecture. Убраны fabrication-prone техники (ToT, GoT, USC, prompt chaining). Шаблоны и паттерны вынесены в references.

## [1.1.0]
- Расширено покрытие инструментов, добавлена memory-block система и 35 credit-killing паттернов.

## [1.0.0]
- Первый релиз.

<!-- Версии 1.0.0–1.7.0 предшествуют форк-релизу в маркетплейс и в этом репозитории не тегированы. Footer-ссылки добавляются начиная с 1.8.0. -->

[1.8.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.8.0
