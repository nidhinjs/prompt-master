# Research-бриф — полный рефреш image+video профиля

**Назначение:** собрать актуальную документацию для будущего «полного рефреша image+video профиля» prompt-master (бэклог, версия не запланирована). Принести результаты → интегрировать в скилл.

**Правило:** только **официальные доки** (verify-don't-trust); у каждого факта — ссылка-источник + дата сверки. Особенно ценно: что **изменилось/устарело** (снимаем DALL-E-3-эпоху) и точные **параметры-ручки** (под `Assumed settings:` строку v1.23).

---

## Скелет — 6 фактов на КАЖДЫЙ тул
Проси одно и то же для всех:

1. **Текущее имя/версия + точные model ID**
2. **Синтаксис промпта и параметры-«ручки»** (что и как задаётся)
3. **Generate vs Edit** (как редактировать существующее)
4. **Референсы / character-consistency / style** (сколько, как)
5. **Разрешение / aspect ratio / длительность** (для видео)
6. **Что промпт НЕ контролирует + анти-фабрикация**

---

## Image — актуализировать

| Тул | Где искать (офиц.) | На что нажать |
|---|---|---|
| **Midjourney** | docs.midjourney.com | текущая версия (`--v`), `--ar / --style / --sref / --cref / --chaos / --no`, что устарело |
| **DALL-E 3 → GPT-image** | platform.openai.com/docs (images / `gpt-image-1`) | актуальный ID, gen+edit endpoint, in-image text, размеры, отличия от DALL-E 3 |
| **Stable Diffusion** | stability.ai docs / SD3 API | текущая линейка (SDXL / SD3.x), CFG / steps, negative, img2img |
| **Flux** | docs Black Forest Labs | текущие варианты (dev / pro / …), natural-language vs веса |
| **SeeDream** | офиц. дока ByteDance / SeeDream | текущая версия, стиль-контроль, negative |

## Video — актуализировать

| Тул | Где искать | На что нажать |
|---|---|---|
| **Sora** | OpenAI Sora docs | версия, длительность, разрешение, camera / синтаксис |
| **Runway** | docs.runwayml.com | текущий Gen (Gen-4?), image-to-video, параметры |
| **Kling** | офиц. Kling / Kuaishou docs | версия, длительность, motion / camera-контроль |
| **LTX Video** | Lightricks LTX docs | разрешение, motion intensity, скорость |
| **Dream Machine (Luma)** | lumalabs docs | версия, lens / lighting, длительность |

## Новое — добавить

- **Google Nano Banana 2 family / Omni Flash** — уже верифицировано (memory: `gemini-media-facts`). Сверять не нужно; финально пере-проверить перед интеграцией (preview-ID / цены волатильны).
- **Grok Imagine** (image+video) — docs.x.ai: `grok-imagine-image*` / `-video*`, editing, image-to-video, reference-to-video, extension.

---

## Что принести
По каждому тулу — **6 пунктов скелета** + ссылка-источник + дата. Главный фокус:
- что **изменилось / устарело** с DALL-E-3-эпохи;
- точные **параметры-ручки** (под `Assumed settings:`);
- generate vs edit и character-consistency (для роутинга «быстро/дёшево» vs «бренд/консистентность»).
