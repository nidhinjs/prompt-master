# Гайд по промптингу Gemini Omni Flash и Nano Banana 2 Lite

**Дата обновления:** 30 июня 2026  
**На основе официальной документации Google**  
- Блог: [Start building with Nano Banana 2 Lite and Gemini Omni Flash](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni-flash-nano-banana-2-lite/)  
- Gemini Omni Flash Prompt Guide: https://ai.google.dev/gemini-api/docs/omni  
- Nano Banana Image Generation: https://ai.google.dev/gemini-api/docs/image-generation

---

## Введение

30 июня 2026 Google анонсировала две новые модели в экосистеме Gemini:

- **Nano Banana 2 Lite** (`gemini-3.1-flash-lite-image`) — самая быстрая и самая дешёвая модель для генерации и редактирования **изображений**.
- **Gemini Omni Flash** (`gemini-omni-flash-preview`) — высокопроизводительная мультимодальная модель для **генерации видео** и **разговорного (conversational) редактирования** через Interactions API.

Модели позиционируются как инструменты для быстрого экспериментирования и масштабирования медиа-контента при низкой стоимости.

---

## 1. Nano Banana 2 Lite (gemini-3.1-flash-lite-image)

### Что это такое
Самая быстрая и cost-efficient модель Google для image generation и editing.  
«Engineered for velocity and scale where speed and cost are the primary operational constraints.»

### Ключевые возможности
- Text-to-image и image editing
- Поддержка aspect ratio: 1:1, 3:2, 2:3, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9 и др.
- До 14 референс-изображений объектов (high-fidelity)

### Важные ограничения (прямая цитата из документации)
> «Not optimized for multiple reference inputs or multi-turn sequential editing.»  
> «Only supports 1K resolution.»  
> «Does not support Grounding with Google Search.»  
> Нет character consistency и style references (в отличие от Nano Banana 2 / Pro).

### Как писать промпты под Nano Banana 2 Lite

**Общие best practices (из официальной документации):**
- Будь **hyper-specific** с деталями.
- Давай контекст и intent.
- Итерируй в multi-turn разговоре.
- Для сложных сцен используй step-by-step инструкции.
- Контролируй камеру фотографическими терминами («wide-angle shot», «low perspective» и т.д.).
- Для редактирования чётко указывай изменения и что нужно сохранить.

**Примеры промптов (verbatim из документации):**

**Фотorealistic сцена:**
> A photorealistic wide-angle shot of a vibrant coral reef teeming with tropical fish. Crystal-clear turquoise water with sunbeams filtering down from the surface, illuminating a sea turtle gliding gracefully over the coral. Shot from a low perspective with a wide-angle lens. Aspect ratio 16:9.

**Стилизованная иллюстрация (kawaii):**
> A kawaii-style sticker of a happy red panda wearing a tiny bamboo hat. It's munching on a green bamboo leaf. The design features bold, clean outlines, simple cel-shading, and a vibrant color palette. The background must be white.

**Текст в изображении (логотип):**
> Create a modern, minimalist logo for a coffee shop called 'The Daily Grind'. The text should be in a clean, bold, sans-serif font. The color scheme is black and white. Put the logo in a circle. Use a coffee bean in a clever way.

**Редактирование изображения:**
> Using the provided image of my cat, please add a small, knitted wizard hat on its head. Make it look like it's sitting comfortably and matches the soft lighting of the photo.

**Рекомендация по языку:** Документация поддерживает `ru-RU`. Для максимальной точности детализации и контроля текста английский часто даёт лучший результат.

---

## 2. Gemini Omni Flash (gemini-omni-flash-preview)

### Что это такое
Высокоскоростная мультимодальная модель для генерации видео и **разговорного редактирования**.  
Поддерживает native multimodality (текст + изображение + аудио + видео), понимание физики и world knowledge.

**Главное преимущество:** conversational editing — можно итеративно править видео естественным языком, сохраняя неизменные части.

**Доступ:** только через **Interactions API**.

### Полный Prompt Guide Gemini Omni Flash
(все разделы и примеры взяты напрямую из официальной документации https://ai.google.dev/gemini-api/docs/omni)

#### Single scene (одна непрерывная сцена)
По умолчанию модель создаёт несколько кадров и нарратив. Чтобы получить одну сцену:

> In a single unbroken scene  
> In a single continuous shot  
> No scene cuts

**Пример:**
> Continuous, unbroken handheld shot of a fluffy tabby cat sitting on a sunny windowsill, looking out into a leafy garden. The cat's tail twitches slowly, and its ears rotate slightly toward ambient noises. Sunbeams illuminate dust motes in the air. Sound design: Gentle breeze, distant bird chirps. No dialogue.

#### Removing unwanted elements
Простые negative prompts:

> No dialogue  
> No embellishments  
> No extra sound effects

#### Prompts for editing (самое важное)
**Простые и прямые промпты работают лучше всего.** Слишком длинные описания часто вызывают нежелательные изменения.

**Хорошие примеры редактирования:**
- Make this video anime
- Put a fashionable hat on this person
- Change the lighting to be more dramatic
- Change the text on the sign to say "Omni Flash"

**Ключевой приём — сохранение контекста:**

**Плохо (слишком описательно):**
> In the video of the man sitting on the sofa, please add a small black cat that runs from the right side of the screen, jumps onto his lap, and then he starts to stroke its head while looking down.

**Хорошо:**
> Add a cat that jumps onto his lap, he begins to pet it. **Keep everything else the same.**

Ещё пример:
> Make the phone invisible. **Keep everything else the same.**

#### Prompting the audio
> Include calm background music  
> The video has a high energy techno beat  
> The audio is a low tinny radio broadcast in the background, playing a song

#### Timing events (тайминг)
**Естественный язык:**
> After 3 seconds, a woman enters the scene.  
> At 5s the chorus starts in the background audio.  
> Every 2s cut to a new frame.

**Timecode синтаксис:**
```
[0-3s] A person is walking
[3-6s] They stop and turn around
[6-10s] They start running
```

#### Meta prompting (мета-инструкции качества)
> Consider micro-detail, expression and timing to create a very rich, detailed but entirely natural scene.

> Be extremely detailed in your descriptions of characters and environments. Apply costume design principles to characters. Be very specific about the people, items and objects in the scene.

> Include plenty of appropriate detail in the background elements to make the scene feel realistic and natural.

#### Text in videos
> One word on the screen at a time: "did, you, know, that, Omni, can, do, awesome, text?" Each word appears for 1s with a different animated style. No dialogue.

> There is a street sign that says: "This is an AI generation by Omni", there is a storefront that says: "All you need AI", there's a car with the number plate: "OMN111"

#### Using tags in prompts to set image roles

**Простые теги (рекомендуется):**
- `<FIRST_FRAME>` — использовать как первый кадр видео
- `<IMAGE_REF_N>` — использовать как референс (N начинается с 0)

**Пример:**
```
[0-3s] A studio fashion sequence. Starting with woman <IMAGE_REF_0>, she is holding <IMAGE_REF_1>
[3-6s] Then we see the man <IMAGE_REF_2> holding <IMAGE_REF_3>
[6-10s] And finally another woman <IMAGE_REF_4> who is holding <IMAGE_REF_5> while walking.
```

**Расширенный вариант с явным объявлением:**
```
[# Sources <FIRST_FRAME>@Image1] [# References <IMAGE_REF_0>@Image2] a woman <IMAGE_REF_0> is walking. Use Image1 as the starting frame. Use Image2 as a reference for the video generation.
```

---

## Сравнение моделей и рекомендации

| Задача                                      | Рекомендуемая модель      | Причина |
|---------------------------------------------|---------------------------|--------|
| Быстрая и дешёвая генерация/редактирование изображений | **Nano Banana 2 Lite**   | Скорость + низкая стоимость |
| Сложные референсы, character consistency, бренд | Nano Banana 2 / Pro      | Больше контроля |
| Генерация видео + разговорное редактирование | **Gemini Omni Flash**    | Conversational editing + аудио |
| Нужно поменять только часть видео, сохранив остальное | **Gemini Omni Flash**    | "Keep everything else the same" |

---

## Полезные ссылки

- Официальный анонс: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni-flash-nano-banana-2-lite/
- Gemini Omni Flash + Prompt Guide: https://ai.google.dev/gemini-api/docs/omni
- Nano Banana Image Generation: https://ai.google.dev/gemini-api/docs/image-generation
- Interactions API: https://ai.google.dev/gemini-api/docs/interactions-overview

---

**Примечание:**  
Prompt engineering для этих моделей сильно отличается от обычного текстового чата. Особенно важно использовать технику **«Keep everything else the same»** при редактировании видео и теги `<FIRST_FRAME>` / `<IMAGE_REF_N>` при работе с референсами.

Если нужно адаптировать этот гайд под конкретные сценарии (например, генерация визуалов для финтех-продуктов, лендингов, объясняющих видео по BNPL/wallet и т.д.) — дай знать, сделаю targeted-версию.
