# Image & Video Generation Tools — Documentation Refresh
**Refresh date:** 2026-06-30

---

## Midjourney · image · verified

**1. Name / version / model IDs** — Midjourney V8.1 (default since 2026-06-10). V7 still fully supported and selectable. No separate numeric model ID string; controlled exclusively via `--v` / `--version` parameter.
  source: https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Natural language prompt followed by space-separated parameters at the end (e.g. `detailed cyberpunk city at night --ar 16:9 --v 8.1 --s 150 --raw`). Parameters are appended after the prompt text.
  source: https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `--v` / `--version` | Model version / engine | 8.1 (default), 7, 6.1 and legacy | `--v 8.1` |
| `--ar` / `--aspect` | Aspect ratio | Any ratio up to 14:1 (HD limited to 4:1) | `--ar 16:9` |
| `--s` / `--stylize` | Artistic stylization strength | 0–1000 (default 100) | `--s 250` |
| `--sref` | Style reference (vibe, colors, medium) | Image URL(s) or internal style code; supports `--sv 4/6` in V7 | `--sref https://example.com/style.jpg` or `--sref random` |
| `--oref` | Omni Reference (characters, objects, vehicles) — replaces `--cref` in V7 | Image URL + optional `--ow` weight | `--oref https://example.com/character.jpg --ow 150` |
| `--chaos` | Output variability / randomness | 0–100 (default 0) | `--chaos 40` |
| `--no` | Negative prompt (elements to avoid) | Space- or comma-separated words | `--no text, blurry, watermark` |
| `--hd` / `--sd` | Resolution mode in V8.1 | `--hd` (native 2048 px) or `--sd` (standard) | `--hd` |
| `--raw` | Remove default Midjourney styling for stricter prompt adherence | Flag only | `--raw` |

**3. Generate vs Edit** — Generate via `/imagine` (Discord) or Imagine bar (web). Edit via web Editor, Vary (Region/Strong/Subtle), Remix, Pan, Zoom Out, or “Use as Image Prompt / Style Reference / Omni Reference”. Many edit tools (Vary Region, Pan, Zoom) still route through V6.1 engine even on V8.1 images. HD images are downscaled during most edits and require manual Upscale afterward.
  source: https://docs.midjourney.com/hc/en-us/articles/33329329805581-Modifying-Your-Creations https://docs.midjourney.com/hc/en-us/articles/32764383466893-Editor · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — Supports Image Prompts (with `--iw` weight), `--sref` (style from 1+ images or codes), `--oref` (Omni Reference for characters/objects, up to multiple with `::` weights). Personalization profiles (`--p`) for session-wide style consistency. Omni Reference works best in V7; V8.1 inherits most reference features.
  source: https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — Base ~1024 px; V8.1 native `--hd` = 2048 px (2K) without upscaling. Aspect via `--ar` (max 14:1 or 4:1 for HD). Square default.
  duration: n/a
  source: https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — Prompt does not guarantee perfect text rendering, fine anatomical details, or long-term character consistency across unrelated generations without strong references or personalization. Safety: built-in content filters block prohibited categories; repeated violations can lead to prompt rejection or account restrictions.
  source: https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference · verified: 2026-06-30 · confidence: medium

**Changed / deprecated since DALL·E 3:**
- V8.1 (default June 2026) is 4–5× faster, adds native 2K HD (`--hd`), `--raw` mode, updated Omni Reference (`--oref` + `--ow`), and improved small-detail retention. Many editing tools (Vary Region, Pan, Zoom) still force V6.1 engine. Character Reference fully replaced by Omni Reference in V7+.
  source: https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version · verified: 2026-06-30

**Assumed-settings knobs (ready to paste):**
- `--s` = 100 — set via: default or settings panel
- `--ow` = 100 — set via: default for Omni Reference
- `--sv` = 6 — set via: default Style Reference version in V7

---

## GPT-image, formerly DALL·E 3 · image · verified

**1. Name / version / model IDs** — gpt-image-2 (current flagship). Also supported: gpt-image-1.5, gpt-image-1, gpt-image-1-mini. Accessed via Image API (not legacy DALL·E endpoints for new capabilities).
  source: https://developers.openai.com/api/docs/guides/image-generation https://developers.openai.com/api/docs/models/gpt-image-2 · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Plain natural-language text prompt. Revised prompt is auto-generated by the model and returned in the response. No classic weighted syntax; control via prompt wording + reference images.
  source: https://developers.openai.com/api/docs/guides/image-generation · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `model` | Which GPT Image model | gpt-image-2 (recommended), gpt-image-1.5, gpt-image-1, gpt-image-1-mini | `gpt-image-2` |
| `size` | Output dimensions | Any size where max edge ≤ 3840 px, edges multiples of 16 px, aspect ratio ≤ 3:1, total pixels 655360–8294400 (examples: 1024×1024, 1536×1024, 2048×2048, 3840×2160) | `1536x1024` or `auto` |
| `moderation` | Safety strictness | `auto` (default), `low` | `low` |
| `input_fidelity` | Reference image processing detail | Fixed at `high` for gpt-image-2 (cannot be changed) | (fixed) |

**3. Generate vs Edit** — Generate: `POST /v1/images/generations`. Edit / image-to-image / multi-image compositing: `POST /v1/images/createEdit` (or Responses API image_generation tool) with prompt + one or more input images + optional mask (alpha channel). Mask is prompt-guided, not pixel-perfect.
  source: https://developers.openai.com/api/docs/guides/image-generation · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — Up to multiple input images (first image is primary). High-fidelity reference processing for style transfer, compositing, and character consistency. Model can still struggle with exact recurring characters or brand elements across independent generations without chaining strong references.
  source: https://developers.openai.com/api/docs/guides/image-generation · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — Highly flexible arbitrary sizes meeting the constraints above (no fixed aspect-ratio parameter; controlled via `size` string). Popular sizes include 1024×1024, 1024×1536, 1536×1024, up to experimental 4K.
  duration: n/a
  source: https://developers.openai.com/api/docs/guides/image-generation · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — Prompt does not guarantee perfect precise text placement or 100 % character/brand consistency across separate calls. Safety: `moderation` parameter (`auto`/`low`); blocked content returns `moderation_blocked` error with category details. Input and output are reviewed.
  source: https://developers.openai.com/api/docs/guides/image-generation · verified: 2026-06-30 · confidence: high

**Changed / deprecated since DALL·E 3:**
- Full replacement of DALL·E 3 by GPT Image family (gpt-image-2 current). Major gains: arbitrary flexible sizes, high-fidelity multi-image editing via dedicated edit endpoint, significantly improved text rendering (still imperfect), fixed high input fidelity, token-based pricing, and Responses API conversational editing. Legacy DALL·E 2 variations endpoint remains but is not the primary path.
  source: https://developers.openai.com/api/docs/guides/image-generation · verified: 2026-06-30

**Assumed-settings knobs (ready to paste):**
- `moderation` = `auto` — set via: default
- `size` = `auto` or `1024x1024` — set via: common default

---

## Stable Diffusion · image · verified

**1. Name / version / model IDs** — Stable Diffusion 3.5 Large (current primary line, 8 B parameters). SDXL remains in legacy references. Endpoint path uses `sd3` for SD 3.5 generation. SD 3.0 APIs deprecated (auto-rerouted since April 2025).
  source: https://platform.stability.ai/docs/api-reference https://stability.ai/news-updates/stable-diffusion-3-api · verified: 2026-06-30 · confidence: medium

**2. Prompt syntax & knobs** — Natural language text prompt + optional `negative_prompt`. Control is exerted through structured API parameters rather than inline syntax.
  source: https://platform.stability.ai/docs/api-reference · verified: 2026-06-30 · confidence: medium

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `negative_prompt` | Elements to suppress | Free-text string | `blurry, low quality, text, watermark` |
| `cfg_scale` | Prompt adherence / guidance | Typical 1–20 (default varies by endpoint) | `7.5` |
| `steps` | Inference steps (quality vs speed) | Typical 20–50+ | `30` |
| `strength` | img2img / edit change intensity | 0.0–1.0 | `0.75` |

**3. Generate vs Edit** — Generate: `POST /v2beta/stable-image/generate/sd3`. Edit / img2img / specialized edits: dedicated endpoints including `/edit/replace-background-and-relight`, `/control/sketch`, `/control/structure` (ControlNets for structure preservation). Supports inpainting/outpainting variants via masks.
  source: https://platform.stability.ai/docs/api-reference · verified: 2026-06-30 · confidence: medium

**4. References / character-consistency / style** — img2img with `strength` parameter for reference adherence. ControlNet endpoints (sketch/structure) for structural and stylistic consistency from input image. Negative prompt assists style control. No native multi-character reference system equivalent to Midjourney Omni Reference.
  source: https://platform.stability.ai/docs/api-reference · verified: 2026-06-30 · confidence: medium

**5. Resolution / aspect ratio / duration** — Common outputs around 1024×1024 or aspect-controlled via request payload. Exact maximum resolution and aspect handling are endpoint-dependent.
  duration: n/a
  source: https://platform.stability.ai/docs/api-reference · verified: 2026-06-30 · confidence: low

**6. Not controlled + safety** — Prompt + negative prompt do not guarantee perfect text, hands, or complex multi-subject consistency without ControlNets and careful engineering. Safety: enterprise platform content filters; blocks prohibited categories per Stability policies.
  source: https://platform.stability.ai/docs/api-reference · verified: 2026-06-30 · confidence: low

**Changed / deprecated since DALL·E 3:**
- SD 3.5 Large is the current production line (post-DALL·E 3 era). SD 3.0 APIs deprecated in 2025. Stronger prompt adherence and typography/hands improvements in 3.5. Multiple specialized ControlNet-style edit endpoints added for precise structural editing.
  source: https://platform.stability.ai/docs/release-notes · verified: 2026-06-30

**Assumed-settings knobs (ready to paste):**
- `cfg_scale` = `7.5` — set via: common default in SD ecosystems
- `steps` = `30–40` — set via: typical quality setting

---

## Flux · image · verified

**1. Name / version / model IDs** — FLUX.2 family (recommended current line): klein (fast, open weights 4 B / 9 B), pro (production), flex (fine-grained control + typography), max (highest quality + grounding search), dev (local development). Endpoints include `flux-2-pro`, `flux-2-klein-9b`, etc.
  source: https://docs.bfl.ml/quick_start/introduction https://docs.bfl.ml/flux_2/flux2_overview · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Natural language prompts; also accepts structured/JSON-style prompts (subject, lighting, style, camera_angle, composition). Supports explicit hex color codes for precise color matching. No emphasis on classic weighted token syntax.
  source: https://docs.bfl.ml/flux_2/flux2_overview · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `inference_steps` | Quality vs speed (distilled for klein) | Low for fast variants (e.g. 4); higher for quality/flex | `4` or `20–50` |
| `guidance` | Prompt adherence strength | Configurable (especially in flex variant) | tuned value |
| `multi_reference_count` | Maximum simultaneous reference images for editing | Up to 8 (API) / 10 (playground) for pro/flex/max; lower for klein/dev | up to 8–10 |

**3. Generate vs Edit** — Generate: text-to-image via API or playground. Edit: multi-reference image editing (up to 8–10 source images simultaneously) for targeted changes, style transfer, and complex scene composition while preserving identity.
  source: https://docs.bfl.ml/flux_2/flux2_overview · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — Strong multi-reference support (up to 8–10 images) for character, object, and style consistency across edits and generations. Combine elements from multiple sources while maintaining faces/styles/context. “max” variant adds grounding search for real-time information visualization.
  source: https://docs.bfl.ml/flux_2/flux2_overview · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — High-resolution output up to ~4 MP (pricing structure implies support; exact limits via API/playground). Flexible aspects handled via prompt or structured parameters.
  duration: n/a
  source: https://docs.bfl.ml/flux_2/flux2_overview · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — Natural language + references provide strong but not absolute control over ultra-fine text or perfect physics in every case. Safety: platform/API content policies apply; commercial usage requires appropriate license tier.
  source: https://docs.bfl.ml/flux_2/flux2_overview · verified: 2026-06-30 · confidence: medium

**Changed / deprecated since DALL·E 3:**
- FLUX.2 adds native multi-reference editing (up to 8–10 images), structured prompts + hex color control, specialized variants (klein for speed, flex for typography, max with grounding), and reliable text rendering. Stronger editing/consistency than FLUX.1. Open-weight options (klein/dev) plus production API tier.
  source: https://docs.bfl.ml/flux_2/flux2_overview · verified: 2026-06-30

**Assumed-settings knobs (ready to paste):**
- `inference_steps` = distilled low for klein; higher for quality variants — set via: variant-dependent

---

## SeeDream · image · verified

**1. Name / version / model IDs** — Seedream family (ByteDance). Current public references point to Seedream 5.0 Lite / 4.5 / 4.0 series. Unified multimodal image generation + editing model. Exact public model IDs vary by hosting platform (e.g. `bytedance/seedream-*`); official access via seed.bytedance.com or Byteplus ModelArk.
  source: https://seed.bytedance.com/en/seedream5_0_lite https://docs.byteplus.com/en/docs/ModelArk/1541523 · verified: 2026-06-30 · confidence: low

**2. Prompt syntax & knobs** — Natural language prompts with strong reasoning capabilities. Supports style control and negative prompt in API contexts.
  source: https://seed.bytedance.com/en/seedream5_0_lite · verified: 2026-06-30 · confidence: low

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `negative_prompt` | Elements to avoid | Free-text string | `low quality, artifacts` |
| style / aesthetic controls | Visual style | Prompt-driven or model-specific parameters | `cinematic, anime style` |

**3. Generate vs Edit** — Unified text-to-image + precise single-sentence / image editing within one architecture. Supports image-to-image and targeted edits.
  source: https://fal.ai/docs/model-api-reference/image-generation-api/bytedance-seedream/v4.5 · verified: 2026-06-30 · confidence: low

**4. References / character-consistency / style** — Strong reference consistency and batch outputs via multimodal design. Supports knowledge-based generation and complex reasoning for style/character adherence.
  source: https://seed.bytedance.com/en/seedream5_0_lite · verified: 2026-06-30 · confidence: low

**5. Resolution / aspect ratio / duration** — Arbitrary dimensions (product of width × height within generous limits, up to 2K–4K in some versions). Fast generation reported in hosted environments.
  duration: n/a
  source: https://docs.aimlapi.com/api-references/image-models/bytedance/seedream-3.0 · verified: 2026-06-30 · confidence: low

**6. Not controlled + safety** — Prompt controls most aspects but complex multi-shot consistency or perfect text rendering can still vary. Safety: platform-level filters per ByteDance policies.
  source: https://seed.bytedance.com/en/seedream5_0_lite · verified: 2026-06-30 · confidence: low

**Changed / deprecated since DALL·E 3:**
- Seedream evolved into a unified multimodal model with deep reasoning, fast high-resolution output (2K/4K), integrated editing, and strong text/layout/aesthetics performance. Positioned as competitive commercial offering via API hosts rather than a direct DALL·E successor.
  source: https://seed.bytedance.com/en/seedream5_0_lite · verified: 2026-06-30

**Assumed-settings knobs (ready to paste):**
- (none strongly documented in public primary sources)

---

## Sora · video · verified

**1. Name / version / model IDs** — sora-2 and sora-2-pro (plus dated snapshots). Videos API. **Note:** deprecated; full shutdown scheduled for 24 September 2026.
  source: https://developers.openai.com/api/docs/guides/video-generation · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Detailed natural-language prompt describing shot type, subject, action, setting, lighting, and camera motion. Explicit cinematography language improves results.
  source: https://developers.openai.com/api/docs/guides/video-generation · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `model` | Quality tier | sora-2 (faster/lower fidelity), sora-2-pro (higher quality) | `sora-2-pro` |
| `size` | Resolution + aspect | 1280×720, 1920×1080, 1080×1920 (model-dependent) | `1920x1080` |
| `seconds` | Clip duration | 4, 8, 12, 16, 20 (max 20 s per generation) | `16` |
| `input_reference` | First-frame image anchor | image/jpeg/png/webp or file_id (must match target size) | upload matching image |

**3. Generate vs Edit** — Generate: `POST /v1/videos`. Edit/refine: `POST /v1/videos/edits`. Extend: `POST /v1/videos/extensions` (up to 20 s per extension, max 6 extensions / 120 s total; no new characters or image references). Characters endpoint for consistent non-human subjects.
  source: https://developers.openai.com/api/docs/guides/video-generation · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — `input_reference` image used as first-frame anchor. Characters API (upload 2–4 s MP4 clip per character ID; mention name in prompt) for non-human consistency across videos. Human likeness blocked by default. No strong multi-image style reference system.
  source: https://developers.openai.com/api/docs/guides/video-generation · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — Up to 1080 p (sora-2-pro recommended for 1920×1080 / 1080×1920). Durations 4–20 s per generation; extensions allow up to 120 s total. Aspect via `size` string (16:9 or 9:16 common).
  duration: up to 20 s per clip; extensions to 120 s total
  source: https://developers.openai.com/api/docs/guides/video-generation · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — Prompt controls motion and camera well but perfect physics, lip-sync, or long complex narratives may require iteration or extensions. Safety: strict — no real people/public figures, no copyrighted characters or music, content suitable for under-18 audiences only. Human faces in input rejected; character uploads with human likeness blocked by default.
  source: https://developers.openai.com/api/docs/guides/video-generation · verified: 2026-06-30 · confidence: high

**Changed / deprecated since DALL·E 3:**
- Sora 2 adds longer clips (up to 20 s), 1080 p support, video extensions (to 120 s total), dedicated edits endpoint, Characters API for consistency, and first-frame `input_reference`. Significantly improved controllability over motion/camera/lighting. Full deprecation and shutdown scheduled for September 2026.
  source: https://developers.openai.com/api/docs/guides/video-generation · verified: 2026-06-30

**Assumed-settings knobs (ready to paste):**
- `seconds` = `4` — set via: API default
- `model` = `sora-2` — set via: API default

---

## Runway · video · verified

**1. Name / version / model IDs** — Runway Gen line (current Gen-3 or successor). Image-to-video and text-to-video focused.
  source: https://docs.runwayml.com/ · verified: 2026-06-30 · confidence: low

**2. Prompt syntax & knobs** — Text prompt describing motion and description combined with image input for image-to-video. Parameters for motion intensity, camera control, and duration available in UI/API.
  source: https://docs.runwayml.com/ · verified: 2026-06-30 · confidence: low

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| motion intensity / camera | Movement and camera behavior | UI/API parameters | medium motion, dolly zoom |
| duration | Clip length | Model-dependent seconds | 5–10 s typical |

**3. Generate vs Edit** — Generate text-to-video or image-to-video. Edit/refine via follow-up prompts or platform tools.
  source: https://docs.runwayml.com/ · verified: 2026-06-30 · confidence: low

**4. References / character-consistency / style** — Strong image reference for subject and motion consistency. Multi-shot / storyboard support in newer Gen versions.
  source: https://docs.runwayml.com/ · verified: 2026-06-30 · confidence: low

**5. Resolution / aspect ratio / duration** — Various resolutions including higher in Gen-3+. Flexible aspect ratios. Duration typically 4–10+ seconds depending on model.
  duration: model-dependent (typically seconds to ~10 s+)
  source: https://docs.runwayml.com/ · verified: 2026-06-30 · confidence: low

**6. Not controlled + safety** — Motion realism and complex camera paths improved in Gen-3 but still benefit from prompt engineering. Safety: platform content filters apply.
  source: https://docs.runwayml.com/ · verified: 2026-06-30 · confidence: low

**Changed / deprecated since DALL·E 3:**
- Gen-3 (or current) significantly advanced image-to-video quality, motion control, and cinematic capabilities compared with early Runway or pure DALL·E-era text-to-image focus. Stronger reference adherence and creative tooling.
  source: https://docs.runwayml.com/ · verified: 2026-06-30

**Assumed-settings knobs (ready to paste):**
- (limited public primary documentation of exact defaults)

---

## Kling · video · verified

**1. Name / version / model IDs** — Kling 3.0 / 3.0 Omni (current). Supports text-to-video, image-to-video, video effects, lip-sync, storyboarding. Native 4K support added in recent updates.
  source: https://kling.ai/document-api/ https://kling.ai/document-api/apiReference/model/imageToVideo · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Prompt for motion/action + optional `negative_prompt`. Additional parameters for mode, cfg_scale, camera/motion control, sound/voice.
  source: https://kling.ai/document-api/apiReference/model/imageToVideo https://kling.ai/document-api/updates/api · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `duration` | Video length | 3–15 seconds (commonly 5 or 10) | `5` or `10` |
| `negative_prompt` | Elements to avoid | Free-text string | `blurry, artifacts` |
| `mode` | Quality mode | std, pro | `pro` |
| `cfg_scale` | Prompt adherence | ~0–1 range (default ~0.5) | `0.5` |
| camera / motion control | Camera moves, motion brush | Supported in Pro / newer models | dolly zoom or motion brush coordinates |

**3. Generate vs Edit** — Generate text-to-video or image-to-video (image as start/end frame). Additional capabilities: video effects, extension (add 4–5 s), lip-sync, storyboarding (up to 6 shots). Edit via follow-up or effects API.
  source: https://kling.ai/document-api/ · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — Image reference (start/end frame) for subject consistency. Reference video support extended to 3–15 s. Storyboarding and element reference for multi-shot consistency. High prompt adherence in 3.0 Omni.
  source: https://kling.ai/document-api/ https://kling.ai/document-api/updates/api · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — Up to native 4K. Flexible aspects (including 21:9). Duration 3–15 s per generation; extensions supported.
  duration: 3–15 seconds (extensions supported)
  source: https://kling.ai/document-api/updates/api · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — Complex long narratives or perfect lip-sync may require multiple shots or extensions. Safety: platform filters; commercial API subject to terms.
  source: https://kling.ai/document-api/ · verified: 2026-06-30 · confidence: medium

**Changed / deprecated since DALL·E 3:**
- Kling 3.0 / 3.0 Omni adds native 4K, extended reference video (to 15 s), storyboarding (multi-shot), motion brush/camera control, lip-sync with voices, video extension, and Pro mode. Stronger consistency and cinematic control than early Kling or pure image models.
  source: https://kling.ai/document-api/updates/api · verified: 2026-06-30

**Assumed-settings knobs (ready to paste):**
- `duration` = `5` — set via: common default
- `mode` = `pro` — set via: for advanced features

---

## LTX Video · video · verified

**1. Name / version / model IDs** — LTX Video (Lightricks LTX line). Focused on high-quality motion with controllable intensity and speed.
  source: https://ltx.studio/ (Lightricks LTX official documentation) · verified: 2026-06-30 · confidence: low

**2. Prompt syntax & knobs** — Text prompt combined with motion intensity, speed, and camera parameters via UI/API.
  source: Lightricks LTX documentation · verified: 2026-06-30 · confidence: low

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `motion_intensity` | Amount of movement | Low to high (slider or param) | medium |
| `speed` | Playback / timing speed | Adjustable multiplier | `1.0x` |

**3. Generate vs Edit** — Image-to-video primary with motion controls. Refinement via parameters or follow-up generation.
  source: Lightricks LTX documentation · verified: 2026-06-30 · confidence: low

**4. References / character-consistency / style** — Image reference for subject; motion parameters control dynamics while preserving identity.
  source: Lightricks LTX documentation · verified: 2026-06-30 · confidence: low

**5. Resolution / aspect ratio / duration** — High resolution support; flexible aspect. Duration model-dependent (typically short clips).
  duration: short clips (seconds)
  source: Lightricks LTX documentation · verified: 2026-06-30 · confidence: low

**6. Not controlled + safety** — Prompt + motion knobs give good control but complex physics may still vary. Safety: standard platform filters.
  source: Lightricks LTX documentation · verified: 2026-06-30 · confidence: low

**Changed / deprecated since DALL·E 3:**
- LTX emphasizes controllable motion intensity and speed for professional video from images, advancing beyond early text-to-video limitations of the DALL·E 3 era.
  source: Lightricks LTX documentation · verified: 2026-06-30

**Assumed-settings knobs (ready to paste):**
- (limited public primary documentation of exact defaults)

---

## Dream Machine by Luma · video · verified

**1. Name / version / model IDs** — Dream Machine (Luma AI current version). Emphasizes lens, lighting, and cinematic controls.
  source: https://lumalabs.ai/ (Dream Machine section) · verified: 2026-06-30 · confidence: low

**2. Prompt syntax & knobs** — Text prompt with explicit lens/lighting/camera language. Extended cinematic controls via prompt or UI parameters.
  source: lumalabs.ai Dream Machine documentation · verified: 2026-06-30 · confidence: low

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| lens / lighting / camera | Cinematography style | Prompt-based or UI params (focal length, mood, etc.) | `50mm lens, golden hour lighting` |

**3. Generate vs Edit** — Text-to-video and image-to-video. Extension and refinement tools available in the platform.
  source: lumalabs.ai · verified: 2026-06-30 · confidence: low

**4. References / character-consistency / style** — Image reference for subject consistency; prompt controls style/lens for creative consistency.
  source: lumalabs.ai · verified: 2026-06-30 · confidence: low

**5. Resolution / aspect ratio / duration** — Flexible resolutions and aspects. Duration typically 5–10+ seconds per generation with extension support.
  duration: typically 5–10+ seconds (extendable)
  source: lumalabs.ai · verified: 2026-06-30 · confidence: low

**6. Not controlled + safety** — Strong cinematic control via prompt but perfect long takes or physics may require iteration. Safety: platform policies apply.
  source: lumalabs.ai · verified: 2026-06-30 · confidence: low

**Changed / deprecated since DALL·E 3:**
- Dream Machine advanced lens/lighting/camera syntax and image-to-video quality, providing more film-like control than early diffusion video models of the DALL·E 3 era.
  source: lumalabs.ai · verified: 2026-06-30

**Assumed-settings knobs (ready to paste):**
- (limited public primary documentation of exact defaults)

---

## Grok Imagine · image · verified

**1. Name / version / model IDs** — Image: `grok-imagine-image-quality`. Video: `grok-imagine-video-1.5` (current GA) and `grok-imagine-video` (required for reference-to-video mode).
  source: https://docs.x.ai/developers/model-capabilities/imagine https://docs.x.ai/developers/model-capabilities/images/generation https://docs.x.ai/developers/models/grok-imagine-video-1.5-preview · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Natural language text prompt. For video, describe motion/camera explicitly. SDK supports structured prompt object with `text` + `images` array.
  source: https://docs.x.ai/developers/model-capabilities/imagine https://docs.x.ai/developers/model-capabilities/images/generation · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `aspect_ratio` | Output shape | 1:1, 16:9, 9:16, 4:3, 3:4, 3:2, 2:3, 2:1, 19.5:9, 9:19.5, 20:9, 9:20, auto (and more) | `16:9` |
| `resolution` | Detail level | 1k or 2k (image); 480p / 720p / 1080p (video) | `2k` |
| `n` | Batch count (images) | Up to 10 | `4` |
| `duration` | Video length | Up to 15 s (text-to-video); configurable (image-to-video) | `12` |
| `image_url` or `images` array | Reference input(s) | Public URL or base64 data URI (up to 3 for edit / ref-to-video) | `data:image/png;base64,...` or URL |

**3. Generate vs Edit** — Generate images: `POST /v1/images/generations`. Edit images: `POST /v1/images/edits` with natural language instructions + up to 3 reference images. Image-to-Video: `POST /v1/videos/generations` with image as first frame + motion prompt. Reference-to-Video: use `grok-imagine-video` model + up to 3 refs (influences output). Video editing and extension (from last frame) supported. Video generation is asynchronous (poll by request ID).
  source: https://docs.x.ai/developers/model-capabilities/imagine · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — Up to 3 reference images for image editing (combine subjects, transfer styles, compose scenes) and reference-to-video. Image-to-video uses source image as first frame for strong subject/motion consistency. Style transfer via references + prompt.
  source: https://docs.x.ai/developers/model-capabilities/imagine · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — Images: 1k/2k resolution; flexible aspect ratios (including cinematic 19.5:9, 20:9). Video: 480p–1080p; duration up to 15 s (text-to-video) or configurable (image-to-video).
  duration: up to 15 seconds (video)
  source: https://docs.x.ai/developers/model-capabilities/imagine https://docs.x.ai/developers/model-capabilities/images/generation · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — Prompt + references give excellent control but ultra-precise text or perfect long-horizon physics may still require iteration. Safety: content policy review on all generated media; media not used for training. Enterprise features include SOC 2, HIPAA eligibility, GDPR compliance, and data residency options.
  source: https://docs.x.ai/developers/model-capabilities/imagine · verified: 2026-06-30 · confidence: high

**Changed / deprecated since DALL·E 3:**
- Grok Imagine (xAI) introduces unified image + video API with native multi-reference editing (up to 3 images), image-to-video with first-frame anchoring, dedicated reference-to-video mode, video extension from last frame, wide range of aspect ratios, 1k/2k image + up to 1080p video, per-second video pricing, and strong consistency via references. Natural language primary with SDK structured prompts. New capability set since DALL·E 3 era.
  source: https://docs.x.ai/developers/model-capabilities/imagine · verified: 2026-06-30

**Assumed-settings knobs (ready to paste):**
- `aspect_ratio` = `auto` or `1:1` — set via: common default
- `resolution` = `1k` (image) or `720p` (video) — set via: typical starting point

---

## Nano Banana 2 family / Omni Flash · image · recheck-only

**1. Name / version / model IDs** — Nano Banana 2 family (Google Gemini image models): `gemini-3.1-flash-image` (Nano Banana 2 / versatile generalist), `gemini-3.1-flash-lite-image` (Nano Banana 2 Lite), and Nano Banana Pro (Gemini 3 Pro Image). Omni Flash referenced in some Gemini contexts as related capability.
  source: https://ai.google.dev/gemini-api/docs/image-generation https://aistudio.google.com/models/nano-banana · verified: 2026-06-30 · confidence: medium (recheck-only)

**2. Prompt syntax & knobs** — (recheck-only — not rebuilt)
  source: (recheck-only) · verified: 2026-06-30 · confidence: low

**3. Generate vs Edit** — (recheck-only — not rebuilt)
  source: (recheck-only) · verified: 2026-06-30 · confidence: low

**4. References / character-consistency / style** — (recheck-only — not rebuilt)
  source: (recheck-only) · verified: 2026-06-30 · confidence: low

**5. Resolution / aspect ratio / duration** — (recheck-only — not rebuilt)
  duration: n/a
  source: (recheck-only) · verified: 2026-06-30 · confidence: low

**6. Not controlled + safety** — (recheck-only — not rebuilt)
  source: (recheck-only) · verified: 2026-06-30 · confidence: low

**Changed / deprecated since DALL·E 3:** (recheck-only)
- Nano Banana 2 / Pro family provides fast 4K-capable image generation and editing inside Gemini API with strong text rendering and multi-language support. Pricing examples from public references: ~$0.02–$0.24 per image depending on resolution (2K/4K) and tier; exact current preview model IDs and pricing should be re-verified directly in Gemini API docs / AI Studio before production use.
  source: https://ai.google.dev/gemini-api/docs/image-generation https://blog.google/innovation-and-ai/products/nano-banana-pro/ · verified: 2026-06-30

**Assumed-settings knobs (ready to paste):**
- (recheck-only — limited primary documentation extracted)

---

## Data gaps & confidence
- Stable Diffusion: Exact current maximum resolution, aspect-ratio handling, and full parameter defaults for SD 3.5 Large not fully extracted from the main API reference page (medium/low confidence on some knobs).
- Runway, LTX Video, Dream Machine by Luma, SeeDream/Seedream: Limited detailed public primary API reference documentation found; relied on vendor overview pages and secondary references (low confidence on exact current parameter values and defaults). Direct vendor portal or authenticated docs recommended for production use.
- Nano Banana 2 family / Omni Flash: Treated strictly as recheck-only per instructions; only volatile preview model IDs and pricing notes included. Full parameter and editing details not rebuilt.
- Sora: Fully verified but carries explicit deprecation notice (shutdown 24 Sep 2026); facts are current only until that date.
- Midjourney Parameter List page: Initial structured extraction was limited (possible dynamic/JS content); supplemented and cross-verified with Version and specific feature articles (overall high confidence).