# Image & Video Generation Tools — Documentation Refresh (Perplexity pass)
**Refresh date:** 2026-06-30

---

## Midjourney · image · verified

**1. Name / version / model IDs** — Current default image model is Midjourney **V8.1**; V8.1 was released on midjourney.com on April 30, 2026 and became default on June 10, 2026; use `--v 8.1` / `--version 8.1` to select it ([Midjourney Version docs](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version)).
  source: https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Midjourney parameters go at the end of the prompt, after the descriptive text, with a space before the double dash and no punctuation in the parameter block ([Midjourney Parameter List](https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List)).
  source: https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `--v` / `--version` | Model version | `8.1`, `8.0`, `7`, legacy versions where available ([Version docs](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version)) | `cinematic robot --v 8.1` |
| `--ar` / `--aspect` | Aspect ratio | Default `1:1`; integer ratios such as `16:9`, `9:16`; decimals are not accepted ([Aspect Ratio docs](https://docs.midjourney.com/hc/en-us/articles/31894244298125-Aspect-Ratio)) | `poster --ar 2:3` |
| `--style` | Legacy/Niji style flavor | Current docs list Niji style presets such as `cute`, `expressive`, `original`, `scenic` for Niji 5 and V4 flavors `4a`, `4b`, `4c` as legacy ([Legacy Features](https://docs.midjourney.com/hc/en-us/articles/33329788681101-Legacy-Features)) | `anime cafe --niji 5 --style scenic` |
| `--sref` | Style reference | Image/style reference or code; style weight via `--sw`; style reference version via `--sv` ([Parameter List](https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List)) | `ad photo --sref URL --sw 200` |
| `--oref` | Omni Reference | One image; V7-only according to Omni docs; replaces Character Reference in V7 ([Omni Reference](https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference)) | `portrait of traveler --oref URL --ow 100` |
| `--cref` | Character Reference | Deprecated/replaced by Omni Reference for V7-era use; legacy compatibility not fully exposed in current docs ([Parameter List](https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List)) | `[uncertain]` |
| `--chaos` / `--c` | Variation/randomness | Legacy docs list range `0–100`; current V8.1 exact range not separately confirmed ([Legacy Features](https://docs.midjourney.com/hc/en-us/articles/33329788681101-Legacy-Features)) | `fashion shoot --chaos 20` |
| `--no` | Negative instruction | Excludes unwanted concepts; listed as current-compatible in parameter list ([Parameter List](https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List)) | `city street --no cars` |
| `--raw` | Reduces Midjourney default styling | Compatible with versions 5.1 and later; gives prompt text more influence ([Raw Mode docs](https://docs.midjourney.com/hc/en-us/articles/32634113811853-Raw-Mode)) | `documentary photo --raw` |
| `--hd` / `--sd` | V8.1 resolution tier | V8.1 HD produces 2K/2048px images; SD is 1024px; HD costs more GPU time ([Version docs](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version)) | `product shot --v 8.1 --hd` |

**3. Generate vs Edit** — Generate via text prompts on web/Discord; edit/modify via Midjourney Editor, Vary Region/Edit, Pan, and Zoom Out, with current note that Omni Reference images must be opened in the Edit tab and Omni Reference/`--ow` removed before edits ([Midjourney Editor](https://docs.midjourney.com/hc/en-us/articles/32764383466893-Editor)).
  source: https://docs.midjourney.com/hc/en-us/articles/32764383466893-Editor · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — Omni Reference uses one image for a person/object/creature/vehicle and can be combined with Style References and Image Prompts; `--ow` controls detail transfer from `1` to `1000`, default `100` ([Omni Reference](https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference)).
  source: https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — V8.1 supports max aspect ratio `14:1`; V8.1 SD is 1024px and HD is 2048px; duration: n/a ([Version docs](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version)).
  source: https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — Prompts do not precisely guarantee edit masks, exact character continuity, or exact aspect after downstream tools; external-image/video use requires rights, compliance with Community Guidelines, and prohibits abusive or sexualized manipulations of people, with moderation that can block prompts ([Midjourney Video external image rules](https://docs.midjourney.com/hc/en-us/articles/37460773864589-Video)).
  source: https://docs.midjourney.com/hc/en-us/articles/37460773864589-Video · verified: 2026-06-30 · confidence: high

**Changed / deprecated since DALL·E 3:**
- Character Reference was replaced by **Omni Reference** in V7-era docs ([Parameter List](https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List)).
- `--hd` is no longer just the old legacy `--hd` model; in V8.1, `--hd` is a 2K image tier, while legacy docs identify early `--hd` as an older alternative model ([Version docs](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version), [Legacy Features](https://docs.midjourney.com/hc/en-us/articles/33329788681101-Legacy-Features)).

**Assumed-settings knobs (ready to paste):**
- `--v 8.1` = current default/pinned image model — set via prompt suffix or settings ([Version docs](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version)).
- `--ar 16:9 --raw --s 100 --hd` = widescreen, lower default styling, default stylize, 2K output — set via prompt suffix ([Aspect Ratio docs](https://docs.midjourney.com/hc/en-us/articles/31894244298125-Aspect-Ratio), [Raw Mode](https://docs.midjourney.com/hc/en-us/articles/32634113811853-Raw-Mode), [Stylize](https://docs.midjourney.com/hc/en-us/articles/32196176868109-Stylize), [Version docs](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version)).

---

## GPT-image (formerly DALL·E 3) · image · verified

**1. Name / version / model IDs** — The OpenAI Image API current GPT Image family includes `gpt-image-2` as the latest state-of-the-art image generation/editing model, plus `gpt-image-1.5`, `gpt-image-1`, `gpt-image-1-mini`, `gpt-image-2-2026-04-21`, and `chatgpt-image-latest` in API references ([OpenAI image generation guide](https://developers.openai.com/api/docs/guides/image-generation), [OpenAI image edit reference](https://developers.openai.com/api/reference/python/resources/images/methods/edit/)).
  source: https://developers.openai.com/api/docs/guides/image-generation · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Generate with `client.images.generate(model="gpt-image-2", prompt=...)`; edit with `images.edit` or the Responses API image-generation tool; Responses supports `action: "auto" | "generate" | "edit"` and tool parameters such as `quality` and `input_image_mask` ([OpenAI image generation guide](https://developers.openai.com/api/docs/guides/image-generation)).
  source: https://developers.openai.com/api/docs/guides/image-generation · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `model` | Image model | `gpt-image-2`, `gpt-image-2-2026-04-21`, `gpt-image-1.5`, `gpt-image-1`, `gpt-image-1-mini`, `chatgpt-image-latest`, DALL·E legacy values in edit reference ([edit reference](https://developers.openai.com/api/reference/python/resources/images/methods/edit/)) | `model="gpt-image-2"` |
| `prompt` | Desired image/edit instruction | Up to 32,000 chars for GPT image models; DALL·E 2 max 1,000 chars ([edit reference](https://developers.openai.com/api/reference/python/resources/images/methods/edit/)) | `prompt="photorealistic gift basket..."` |
| `image` | Edit/reference images | GPT image models accept up to 16 `png`, `webp`, or `jpg` files under 50MB ([edit reference](https://developers.openai.com/api/reference/python/resources/images/methods/edit/)) | `image=[open("a.png","rb")]` |
| `mask` / `input_image_mask` | Masked edit area | PNG mask; same size/format, under 50MB in guide; transparent areas indicate edit region in reference ([guide](https://developers.openai.com/api/docs/guides/image-generation)) | `input_image_mask={"file_id": maskId}` |
| `size` | Output size | `gpt-image-2` arbitrary `WIDTHxHEIGHT` divisible by 16, aspect 1:3 to 3:1, max edge 3840px, 655,360–8,294,400 total pixels; standard sizes include `1024x1024`, `1536x1024`, `1024x1536`, `auto` ([guide](https://developers.openai.com/api/docs/guides/image-generation), [edit reference](https://developers.openai.com/api/reference/python/resources/images/methods/edit/)) | `size="2048x1152"` |
| `quality` | Rendering quality | `low`, `medium`, `high`, `auto`; edit reference also includes legacy `standard` ([guide](https://developers.openai.com/api/docs/guides/image-generation)) | `quality="high"` |
| `n` | Number of images | 1–10 ([edit reference](https://developers.openai.com/api/reference/python/resources/images/methods/edit/)) | `n=4` |
| `background` | Background opacity/transparency | `transparent`, `opaque`, `auto`; `gpt-image-2` does not support `transparent` ([guide](https://developers.openai.com/api/docs/guides/image-generation)) | `background="opaque"` |
| `output_format` / `output_compression` | File format/compression | `png`, `jpeg`, `webp`; compression `0–100` for JPEG/WebP ([guide](https://developers.openai.com/api/docs/guides/image-generation)) | `output_format="webp", output_compression=50` |
| `moderation` | Filtering strictness | `auto` default or `low` for GPT Image models ([guide](https://developers.openai.com/api/docs/guides/image-generation)) | `moderation="auto"` |
| `partial_images` | Streaming partials | 0–3 partial images ([edit reference](https://developers.openai.com/api/reference/python/resources/images/methods/edit/)) | `partial_images=2` |

**3. Generate vs Edit** — Image API `/images/generations` creates from text and `/images/edits` modifies existing images, creates from references, or edits masked regions; Responses API adds multi-turn editing and File ID inputs ([OpenAI guide](https://developers.openai.com/api/docs/guides/image-generation)).
  source: https://developers.openai.com/api/docs/guides/image-generation · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — GPT image models accept multiple input/reference images, with up to 16 images in the edit endpoint; `gpt-image-2` processes image inputs at high fidelity automatically and does not let `input_fidelity` be changed ([OpenAI guide](https://developers.openai.com/api/docs/guides/image-generation), [edit reference](https://developers.openai.com/api/reference/python/resources/images/methods/edit/)).
  source: https://developers.openai.com/api/docs/guides/image-generation · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — `gpt-image-2` supports flexible sizes up to 3840px maximum edge and 8,294,400 total pixels with max 3:1 long-to-short edge ratio; duration: n/a ([OpenAI guide](https://developers.openai.com/api/docs/guides/image-generation)).
  source: https://developers.openai.com/api/docs/guides/image-generation · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — GPT Image still may struggle with precise text placement, recurring-character/brand consistency, and exact structured composition; prompts and generated images are filtered, `moderation_blocked` errors can identify input/output stage and coarse categories ([OpenAI guide](https://developers.openai.com/api/docs/guides/image-generation)).
  source: https://developers.openai.com/api/docs/guides/image-generation · verified: 2026-06-30 · confidence: high

**Changed / deprecated since DALL·E 3:**
- GPT image models return base64 by default and do not support generated-image URLs, while DALL·E 2/3 supported `url` response format ([OpenAI image reference](https://developers.openai.com/api/reference/resources/images/)).
- `revised_prompt` is documented as DALL·E 3-only in the Image object, while the Responses API image tool exposes revised prompt separately for tool calls ([OpenAI image reference](https://developers.openai.com/api/reference/resources/images/), [OpenAI guide](https://developers.openai.com/api/docs/guides/image-generation)).
- DALL·E 3 sizes were `1024x1024`, `1792x1024`, or `1024x1792`, while `gpt-image-2` supports arbitrary 16-pixel-multiple sizes within constraints ([OpenAI edit reference](https://developers.openai.com/api/reference/python/resources/images/methods/edit/)).

**Assumed-settings knobs (ready to paste):**
- `model="gpt-image-2"` = current flagship — set in Image API request ([OpenAI guide](https://developers.openai.com/api/docs/guides/image-generation)).
- `size="2048x1152", quality="high", output_format="webp", moderation="auto"` = high-quality 16:9 WebP — set in Image API/Responses tool ([OpenAI guide](https://developers.openai.com/api/docs/guides/image-generation)).

---

## Stable Diffusion / Stability AI · image · verified

**1. Name / version / model IDs** — Current Stability official line includes **Stable Diffusion 3.5** (Large, Large Turbo, Medium, Flash) and commercial services **Stable Image Ultra** and **Stable Image Core**; the SD 3.5 API `model` enum includes `sd3.5-large`, `sd3.5-large-turbo`, and `sd3.5-medium`, while docs describe SD 3.5 Flash as a distilled Medium variant ([Stability API Reference](https://platform.stability.ai/docs/api-reference), [Stability image model page](https://stability.ai/stable-image)).
  source: https://platform.stability.ai/docs/api-reference · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Stable Image endpoints use multipart form data with `prompt`, optional `negative_prompt`, `aspect_ratio`, `style_preset`, `output_format`, and SD3.5-specific `model`/`cfg_scale` fields; legacy SDXL has `steps`, `cfg_scale`, sampler and `image_strength` knobs ([Stability API Reference](https://platform.stability.ai/docs/api-reference), [Stability API Parameters](https://platform.stability.ai/docs/features/api-parameters)).
  source: https://platform.stability.ai/docs/api-reference · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `prompt` | Positive prompt | 1–10,000 chars on Stable Image endpoints ([API Reference](https://platform.stability.ai/docs/api-reference)) | `prompt="lighthouse on cliff"` |
| `negative_prompt` | Exclusions | ≤10,000 chars ([API Reference](https://platform.stability.ai/docs/api-reference)) | `negative_prompt="blur, artifacts"` |
| `aspect_ratio` | Output shape | `16:9`, `1:1`, `21:9`, `2:3`, `3:2`, `4:5`, `5:4`, `9:16`, `9:21` ([API Reference](https://platform.stability.ai/docs/api-reference)) | `aspect_ratio="16:9"` |
| `model` | SD3.5 model | `sd3.5-large`, `sd3.5-large-turbo`, `sd3.5-medium`; Flash noted in descriptive docs but not in fetched enum ([API Reference](https://platform.stability.ai/docs/api-reference)) | `model="sd3.5-large"` |
| `cfg_scale` | Prompt adherence | SD3.5 range `1–10`; legacy SDXL range `0–35`, default `7` ([API Reference](https://platform.stability.ai/docs/api-reference)) | `cfg_scale=7` |
| `steps` | Diffusion steps | Legacy SDXL `10–50`, default `30`; SD3.5 API reference did not expose `steps` for generate/sd3 in fetched enum ([API Reference](https://platform.stability.ai/docs/api-reference)) | `steps=30` |
| `style_preset` | Style bias | `3d-model`, `analog-film`, `anime`, `cinematic`, `comic-book`, `digital-art`, `enhance`, `fantasy-art`, `isometric`, `line-art`, `low-poly`, `modeling-compound`, `neon-punk`, `origami`, `photographic`, `pixel-art`, `tile-texture` ([API Reference](https://platform.stability.ai/docs/api-reference)) | `style_preset="photographic"` |
| `control_strength` | Control endpoints strength | `0–1`, default `0.7` for sketch/structure controls ([API Reference](https://platform.stability.ai/docs/api-reference)) | `control_strength=0.7` |
| `grow_mask` | Mask edge expansion | Erase `0–20`, inpaint `0–100`, default `5` ([API Reference](https://platform.stability.ai/docs/api-reference)) | `grow_mask=8` |

**3. Generate vs Edit** — Generate uses `/v2beta/stable-image/generate/ultra`, `/core`, or `/sd3`; edit/modify is through edit endpoints such as erase, inpaint, outpaint, search-and-replace, search-and-recolor, and remove-background ([Stability API Reference](https://platform.stability.ai/docs/api-reference)).
  source: https://platform.stability.ai/docs/api-reference · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — Reference/control-style workflows are exposed as Control endpoints: sketch, structure, style, and style-transfer; style transfer uses `init_image` and `style_image` and preserves composition while applying visual characteristics ([Stability API Reference](https://platform.stability.ai/docs/api-reference)).
  source: https://platform.stability.ai/docs/api-reference · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — Stable Image Ultra outputs 1MP by default, Stable Image Core outputs 1.5MP, SD3.5 endpoint outputs 1MP, edit endpoints often output 4MP, and upscale endpoints can reach 4K or 16MP depending on service; duration: n/a ([Stability API Reference](https://platform.stability.ai/docs/api-reference)).
  source: https://platform.stability.ai/docs/api-reference · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — Stability exposes optional `stability-client-id`, `stability-client-user-id`, and `stability-client-version` headers to support debugging/moderation issue communication, but the fetched image docs did not document a user-settable safety knob; copyrighted content upload prohibition appeared only in audio sections, not image sections ([Stability API Reference](https://platform.stability.ai/docs/api-reference)).
  source: https://platform.stability.ai/docs/api-reference · verified: 2026-06-30 · confidence: medium

**Changed / deprecated since DALL·E 3:**
- Stability says SD 3.0 APIs were deprecated April 17, 2025 and calls are routed to SD 3.5 APIs ([Stability API Reference](https://platform.stability.ai/docs/api-reference)).
- Stability still exposes classic diffusion knobs such as `negative_prompt`, `cfg_scale`, and legacy `steps`, unlike DALL·E 3’s limited public knobs ([Stability API Reference](https://platform.stability.ai/docs/api-reference)).

**Assumed-settings knobs (ready to paste):**
- `model="sd3.5-large", aspect_ratio="16:9", cfg_scale=7, output_format="webp"` = SD3.5 text-to-image — set in `/v2beta/stable-image/generate/sd3` form data ([Stability API Reference](https://platform.stability.ai/docs/api-reference)).
- `negative_prompt="blur, text artifacts", style_preset="photographic"` = common exclusion/style controls — set in form data ([Stability API Reference](https://platform.stability.ai/docs/api-reference)).

---

## Flux · image · verified

**1. Name / version / model IDs** — BFL’s current family is **FLUX.2**, spanning `[klein]`, `[pro]`, `[flex]`, `[max]`, and `[dev]`; preview/pinned endpoints include `flux-2-pro-preview`, `flux-2-pro`, `flux-2-klein-9b-preview`, and `flux-2-klein-9b`, while the fetched `[flex]` API page uses `/v1/flux-2-flex` ([BFL FLUX.2 overview](https://docs.bfl.ml/flux_2/flux2_overview), [FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D)).
  source: https://docs.bfl.ml/flux_2/flux2_overview · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — FLUX.2 accepts natural-language prompts and structured prompts; the `[flex]` endpoint accepts JSON fields including `prompt`, `prompt_upsampling`, up to eight API `input_image` fields, `seed`, `width`, `height`, `guidance`, `steps`, `safety_tolerance`, and `output_format` ([BFL FLUX.2 overview](https://docs.bfl.ml/flux_2/flux2_overview), [FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D)).
  source: https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `prompt` | Text or structured prompt | Free text; docs show JSON-like structured fields such as `subject`, `background`, `lighting`, `style`, `camera_angle`, `composition` ([FLUX.2 overview](https://docs.bfl.ml/flux_2/flux2_overview)) | `{"subject":"Mona Lisa","camera_angle":"eye level"}` |
| `prompt_upsampling` | Prompt enhancement | Boolean ([FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D)) | `prompt_upsampling=true` |
| `input_image` … `input_image_8` | Reference/edit inputs | 1–8 API image inputs; overview says up to 10 in playground for several variants ([FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D), [FLUX.2 overview](https://docs.bfl.ml/flux_2/flux2_overview)) | `input_image="..."` |
| `width`, `height` | Output dimensions | Each `>=64`; overview/model page says output up to 4MP and any aspect ratio ([FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D), [FLUX.2 model page](https://bfl.ai/models/flux-2)) | `width=2048,height=1024` |
| `guidance` | Prompt adherence vs realism | `1.5–10`, default/example `5` ([FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D)) | `guidance=5` |
| `steps` | Quality/detail vs latency | `1–50`, example `50` ([FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D)) | `steps=30` |
| `safety_tolerance` | Input/output moderation tolerance | `0–5`, where `0` is strictest and `5` least strict ([FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D)) | `safety_tolerance=2` |
| `output_format` | File format | `jpeg`, `png`, `webp` ([FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D)) | `output_format="webp"` |
| Hex colors in prompt | Exact color control | Use `#RRGGBB` strings in prompt; docs claim precision matching ([FLUX.2 overview](https://docs.bfl.ml/flux_2/flux2_overview)) | `vase #02eb3c flowers #ff0088` |

**3. Generate vs Edit** — BFL states all FLUX.2 variants offer image editing from text and multiple references in one model, and the `[flex]` API endpoint is explicitly “generate or edit an image” ([BFL FLUX.2 blog](https://bfl.ai/blog/flux-2), [FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D)).
  source: https://bfl.ai/blog/flux-2 · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — FLUX.2 supports multi-reference inputs for character/product/style consistency: `[klein]` up to 4, `[max]`/`[pro]`/`[flex]` up to 8 via API and up to 10 in playground; BFL also highlights up to 10 simultaneous references in announcements ([BFL FLUX.2 overview](https://docs.bfl.ml/flux_2/flux2_overview), [BFL FLUX.2 blog](https://bfl.ai/blog/flux-2)).
  source: https://docs.bfl.ml/flux_2/flux2_overview · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — FLUX.2 outputs up to 4MP and supports any aspect ratio; BFL notes image editing up to 4MP; duration: n/a ([BFL FLUX.2 model page](https://bfl.ai/models/flux-2), [BFL FLUX.2 blog](https://bfl.ai/blog/flux-2)).
  source: https://bfl.ai/models/flux-2 · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — FLUX.2 `[flex]` exposes `safety_tolerance` but values beyond 5 require contacting BFL; high guidance improves prompt adherence at the cost of reduced realism, so prompt text does not independently guarantee realism at high guidance ([FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D)).
  source: https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D · verified: 2026-06-30 · confidence: high

**Changed / deprecated since DALL·E 3:**
- FLUX.2 exposes diffusion-like `guidance` and `steps` on `[flex]`, plus up to 8 API reference images and structured/JSON prompting, which are broader public controls than DALL·E 3-era image generation ([FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D), [FLUX.2 overview](https://docs.bfl.ml/flux_2/flux2_overview)).

**Assumed-settings knobs (ready to paste):**
- Endpoint `POST /v1/flux-2-flex` with `guidance=5`, `steps=30`, `safety_tolerance=2`, `output_format="webp"` — set in JSON body ([FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D)).
- Add brand colors directly as hex codes in prompt — set in prompt text ([FLUX.2 overview](https://docs.bfl.ml/flux_2/flux2_overview)).

---

## SeeDream · image · verified

**1. Name / version / model IDs** — Current official ModelArk/BytePlus pages cover **Seedream 5.0 / 5.0 Lite** and Seedream 4.x; the image generation API example uses `model: "seedream-5-0-260128"`, while resolution tables list `seedream-5-0-lite`, `seedream-4-5`, and `seedream-4-0` ([BytePlus Image Generation API](https://docs.byteplus.com/en/docs/ModelArk/1541523), [Seedream 4.0–5.0 tutorial](https://docs.byteplus.com/en/docs/ModelArk/1824121)).
  source: https://docs.byteplus.com/en/docs/ModelArk/1541523 · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — The ModelArk image endpoint is `POST /api/v3/images/generations` with JSON fields `model`, `prompt`, `size`, `output_format`, and `watermark`; BytePlus examples use natural-language prompts and reference/edit prompts that explicitly refer to input images ([BytePlus Image Generation API](https://docs.byteplus.com/en/docs/ModelArk/1541523), [Seedream tutorial](https://docs.byteplus.com/en/docs/ModelArk/1824121)).
  source: https://docs.byteplus.com/en/docs/ModelArk/1541523 · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `model` | Model ID | `seedream-5-0-260128`; table names include `seedream-5-0-lite`, `seedream-4-5`, `seedream-4-0` ([Image Generation API](https://docs.byteplus.com/en/docs/ModelArk/1541523), [Seedream tutorial](https://docs.byteplus.com/en/docs/ModelArk/1824121)) | `"model":"seedream-5-0-260128"` |
| `prompt` | Prompt/edit instruction | Natural language; prompt guide shows `[prompt]`, addition/deletion/replacement/modification, style reference, and multi-image tasks ([Seedream prompt guide](https://docs.byteplus.com/en/docs/ModelArk/1829186)) | `"Replace clothing in Image 1 with outfit from Image 2"` |
| `size` | Resolution tier | `1K`, `2K`, `3K`, `4K` depending on model; API example uses `"2K"` ([Image Generation API](https://docs.byteplus.com/en/docs/ModelArk/1541523)) | `"size":"2K"` |
| `output_format` | Output format | Example shows `png`; price page says Seedream 4 output format `jpeg`; exact per-model enum [uncertain] ([Image Generation API](https://docs.byteplus.com/en/docs/ModelArk/1541523), [Model Price](https://docs.byteplus.com/en/docs/ModelArk/1824718)) | `"output_format":"png"` |
| `watermark` | Watermark toggle | Boolean in API example ([Image Generation API](https://docs.byteplus.com/en/docs/ModelArk/1541523)) | `"watermark": false` |
| Negative prompt | Exclusion text | [uncertain]; not found in official fetched Seedream pages | [uncertain] |

**3. Generate vs Edit** — Seedream 4.0–5.0 tutorial lists text-to-image, grouped images, single/multi image-to-image, and single/multi image-to-grouped-images use cases; prompt guide shows addition, deletion, replacement, modification, doodle, bounding-box, and multi-image style/subject transfer examples ([Seedream tutorial](https://docs.byteplus.com/en/docs/ModelArk/1824121), [Seedream prompt guide](https://docs.byteplus.com/en/docs/ModelArk/1829186)).
  source: https://docs.byteplus.com/en/docs/ModelArk/1824121 · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — Seedream supports multi-reference image-to-image, grouped images, reference character, reference style, reference virtual entity, floor-plan/prototype structure references, and subject/style transfer across Image 1/Image 2 prompts ([Seedream prompt guide](https://docs.byteplus.com/en/docs/ModelArk/1829186)).
  source: https://docs.byteplus.com/en/docs/ModelArk/1829186 · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — Seedream 5.0 Lite supports 2K, 3K, and 4K tiers across `1:1`, `3:4`, `4:3`, `16:9`, `9:16`, `2:3`, `3:2`, and `21:9`; examples include 4K `4096x4096`, `5504x3040`, `3040x5504`, and `6240x2656`; duration: n/a ([Seedream tutorial](https://docs.byteplus.com/en/docs/ModelArk/1824121)).
  source: https://docs.byteplus.com/en/docs/ModelArk/1824121 · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — BytePlus ModelArk offers a Content Pre-filter System that can detect risky input prompts and output completions and can refuse or intervene; even if disabled, baseline content safety policies remain ([BytePlus Content Pre-filter](https://docs.byteplus.com/en/docs/ModelArk/Content_Pre-filter)).
  source: https://docs.byteplus.com/en/docs/ModelArk/Content_Pre-filter · verified: 2026-06-30 · confidence: high

**Changed / deprecated since DALL·E 3:**
- Seedream unifies generation and editing, supports grouped image outputs and multi-reference image workflows, and exposes explicit high-resolution tiers up to 4K ([Seedream tutorial](https://docs.byteplus.com/en/docs/ModelArk/1824121)).

**Assumed-settings knobs (ready to paste):**
- `model="seedream-5-0-260128", size="2K", output_format="png", watermark=false` — set in `/images/generations` JSON body ([BytePlus Image Generation API](https://docs.byteplus.com/en/docs/ModelArk/1541523)).

---

## Runway · video · verified

**1. Name / version / model IDs** — Runway API current video generation models include `gen4.5` for Gen-4.5 and `aleph2` for Aleph 2.0 video editing; `gen4_aleph` is deprecated and will be sunset July 30, 2026 ([Runway Available Models](https://docs.dev.runwayml.com/guides/models/), [Runway API changelog](https://docs.dev.runwayml.com/api-details/api_changelog/)).
  source: https://docs.dev.runwayml.com/guides/models/ · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Runway uses task endpoints: `POST /v1/text_to_video`, `/v1/image_to_video`, and `/v1/video_to_video` with `model`, `promptText`, `ratio`, `duration`, `seed`, and `contentModeration.publicFigureThreshold`; `video_to_video` adds `videoUri`, `keyframes`, and `targetAspectRatio` ([Runway API Reference](https://docs.dev.runwayml.com/api/)).
  source: https://docs.dev.runwayml.com/api/ · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `model` | Model | Image-to-video accepts `gen4.5`, `gen4_turbo`, `veo3.1`, `veo3.1_fast`, `happyhorse_1_0`, `seedance2`, `seedance2_fast`, `seedance2_mini`, `veo3`; text-to-video accepts `gen4.5` and other video models; video-to-video accepts `aleph2` and Seedance models ([API Reference](https://docs.dev.runwayml.com/api/)) | `model="gen4.5"` |
| `promptText` | Motion/content prompt | 1–1000 UTF-16 code units ([API Reference](https://docs.dev.runwayml.com/api/)) | `promptText="A bunny hops in a meadow"` |
| `promptImage` | Image-to-video input | URL, Runway URI, data URI, or array with `uri` and `position:"first"` ([API Reference](https://docs.dev.runwayml.com/api/)) | `promptImage="https://...jpg"` |
| `ratio` | Output resolution | Gen-4 image-to-video values include `1280:720`, `720:1280`, `1104:832`, `960:960`, `832:1104`, `1584:672`; text-to-video listed `1280:720`, `720:1280` in fetched API page ([API Reference](https://docs.dev.runwayml.com/api/)) | `ratio="1280:720"` |
| `duration` | Seconds | `2–10` integer in API; Gen-4 help page notes older Gen-4 UI used 5 or 10 seconds ([API Reference](https://docs.dev.runwayml.com/api/), [Gen-4 help](https://help.runwayml.com/hc/en-us/articles/37327109429011-Creating-with-Gen-4-Video)) | `duration=8` |
| `seed` | Reproducibility | `0–4294967295` ([API Reference](https://docs.dev.runwayml.com/api/)) | `seed=1234` |
| `keyframes` | Video edit guidance | Aleph 2.0 supports up to 5 keyframe images at timestamps or fractional positions ([API Reference](https://docs.dev.runwayml.com/api/), [changelog](https://docs.dev.runwayml.com/api-details/api_changelog/)) | `keyframes=[{"uri":"...","seconds":3}]` |
| `contentModeration.publicFigureThreshold` | Public-figure moderation strictness | `auto` or `low` ([API Reference](https://docs.dev.runwayml.com/api/)) | `contentModeration={"publicFigureThreshold":"auto"}` |

**3. Generate vs Edit** — Generate via text-to-video or image-to-video; edit existing videos via `model:"aleph2"` on `/v1/video_to_video`, where Aleph 2.0 accepts 2–30s source videos and optional keyframes ([Runway API changelog](https://docs.dev.runwayml.com/api-details/api_changelog/), [Runway API Reference](https://docs.dev.runwayml.com/api/)).
  source: https://docs.dev.runwayml.com/api-details/api_changelog/ · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — Gen-4 image-to-video uses a first-frame input image; Aleph 2.0 uses the source video plus up to 5 keyframe images, and Gen-4 help says the image conveys subject, composition, color, lighting, and style while text should focus on motion ([Runway API Reference](https://docs.dev.runwayml.com/api/), [Gen-4 help](https://help.runwayml.com/hc/en-us/articles/37327109429011-Creating-with-Gen-4-Video)).
  source: https://docs.dev.runwayml.com/api/ · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — Gen-4 API ratios include 16:9 `1280:720`, 9:16 `720:1280`, 4:3 `1104:832`, 1:1 `960:960`, 3:4 `832:1104`, and 21:9 `1584:672`; API duration is 2–10 seconds; older Gen-4 UI article lists 24fps ([Runway API Reference](https://docs.dev.runwayml.com/api/), [Gen-4 help](https://help.runwayml.com/hc/en-us/articles/37327109429011-Creating-with-Gen-4-Video)).
  source: https://docs.dev.runwayml.com/api/ · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — `contentModeration.publicFigureThreshold` is the documented safety knob, and lower values make the system less strict for recognizable public figures; prompts are limited to 1000 characters and source videos must be 30s or shorter for video-to-video ([Runway API Reference](https://docs.dev.runwayml.com/api/)).
  source: https://docs.dev.runwayml.com/api/ · verified: 2026-06-30 · confidence: high

**Changed / deprecated since DALL·E 3:**
- Runway Gen-4.5 supports video from text or image; the dedicated edit model is now `aleph2`, while `gen4_aleph` is deprecated and sunsets July 30, 2026 ([Runway Available Models](https://docs.dev.runwayml.com/guides/models/)).

**Assumed-settings knobs (ready to paste):**
- `model="gen4.5", promptText="...", ratio="1280:720", duration=8, seed=1234` — set in `/v1/text_to_video` or `/v1/image_to_video` body ([Runway API Reference](https://docs.dev.runwayml.com/api/)).
- `model="aleph2", videoUri="...", keyframes=[...]` — set in `/v1/video_to_video` body ([Runway API Reference](https://docs.dev.runwayml.com/api/)).

---

## Kling · video · verified

**1. Name / version / model IDs** — Official Kling current line is **Kling VIDEO 3.0** and **Kling VIDEO 3.0 Omni**; Kling states VIDEO 2.6 upgraded to VIDEO 3.0 and VIDEO O1 upgraded to VIDEO 3.0 Omni, while the official blog references API model names `kling-v3` and `kling-v3-omni` ([Kling VIDEO 3.0 User Guide](https://kling.ai/quickstart/klingai-video-3-model-user-guide), [Kling 3.0 prompt syntax blog](https://kling.ai/blog/kling-3-prompt-syntax-omni-reference-tags-video-physics)).
  source: https://kling.ai/quickstart/klingai-video-3-model-user-guide · verified: 2026-06-30 · confidence: medium

**2. Prompt syntax & knobs** — Kling 3.0 prompting supports dialogue, shot descriptions, camera language, multi-shot/custom multi-shot, and Omni reference tags such as `<<<element_1>>>`, `<<<image_1>>>`, `<<<video_1>>>`, and `<<<voice_1>>>`; official blog lists API-style parameters `multi_shot`, `shot_type`, `config`, `voice_list`, and `element_list`, but exact public API schema fields such as `cfg_scale` could not be confirmed from accessible first-party API docs ([Kling prompt syntax blog](https://kling.ai/blog/kling-3-prompt-syntax-omni-reference-tags-video-physics)).
  source: https://kling.ai/blog/kling-3-prompt-syntax-omni-reference-tags-video-physics · verified: 2026-06-30 · confidence: medium

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| Prompt text | Scene, motion, camera, dialogue, audio | Natural language; can specify shots, timestamps, camera moves, voices, languages, accents ([Kling VIDEO 3.0 guide](https://kling.ai/quickstart/klingai-video-3-model-user-guide)) | `Shot 1 (3s): wide shot...` |
| `multi_shot` | Multi-shot logic | Blog lists boolean `true/false` ([Kling prompt syntax blog](https://kling.ai/blog/kling-3-prompt-syntax-omni-reference-tags-video-physics)) | `multi_shot=true` |
| `shot_type` | Shot planning mode | `intelligence` or `customize` per blog ([Kling prompt syntax blog](https://kling.ai/blog/kling-3-prompt-syntax-omni-reference-tags-video-physics)) | `shot_type="customize"` |
| `config` | Camera movement | Blog lists pan, tilt, zoom `-10` to `10` and six-degree camera controls ([Kling prompt syntax blog](https://kling.ai/blog/kling-3-prompt-syntax-omni-reference-tags-video-physics)) | `config={"pan":5,"zoom":2}` |
| `element_list` | Element references | Array of element objects per blog; exact JSON schema [uncertain] ([Kling prompt syntax blog](https://kling.ai/blog/kling-3-prompt-syntax-omni-reference-tags-video-physics)) | `element_list=[...]` |
| `voice_list` | Voice references | Array of voice objects per blog; exact JSON schema [uncertain] ([Kling prompt syntax blog](https://kling.ai/blog/kling-3-prompt-syntax-omni-reference-tags-video-physics)) | `voice_list=[...]` |
| `cfg_scale`, `mode` | CFG/std/pro mode | [uncertain] in accessible official 3.0 docs; not verified from current first-party API schema | [uncertain] |

**3. Generate vs Edit** — Kling VIDEO 3.0 supports text-to-video, image-to-video, start/end-frame-to-video, multi-shot generation, native audio, and element reference; Kling VIDEO 3.0 Omni supports all-in-one multimodal inputs and says video editing/prompt transformation function the same as in O1 ([Kling VIDEO 3.0 guide](https://kling.ai/quickstart/klingai-video-3-model-user-guide), [Kling VIDEO 3.0 Omni guide](https://kling.ai/quickstart/klingai-video-3-omni-model-user-guide)).
  source: https://kling.ai/quickstart/klingai-video-3-model-user-guide · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — VIDEO 3.0 supports element binding and multi-image/video references; Omni supports up to 7 images/elements when no video is provided, or up to 4 images/elements when a video is provided, plus one video 3–10s and element creation from 2–4 images or a 3–8s character video ([Kling VIDEO 3.0 Omni guide](https://kling.ai/quickstart/klingai-video-3-omni-model-user-guide)).
  source: https://kling.ai/quickstart/klingai-video-3-omni-model-user-guide · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — Kling VIDEO 3.0 supports flexible duration from 3–15 seconds and supports 720p and 1080p modes; 4K support for Kling 3.0 API was not confirmed from accessible first-party docs ([Kling VIDEO 3.0 guide](https://kling.ai/quickstart/klingai-video-3-model-user-guide), [Kling VIDEO 3.0 Omni guide](https://kling.ai/quickstart/klingai-video-3-omni-model-user-guide)).
  source: https://kling.ai/quickstart/klingai-video-3-model-user-guide · verified: 2026-06-30 · confidence: medium

**6. Not controlled + safety** — Official guides emphasize model behaviors and pricing but did not expose current anti-abuse policy details in fetched pages; the prompt does not guarantee exact shot following because the Multi-Shot guide says the model may flexibly adjust if a scene is better suited to a single shot ([Kling VIDEO 3.0 guide](https://kling.ai/quickstart/klingai-video-3-model-user-guide)).
  source: https://kling.ai/quickstart/klingai-video-3-model-user-guide · verified: 2026-06-30 · confidence: medium

**Changed / deprecated since DALL·E 3:**
- Kling 3.0 adds native audio, element consistency, multi-shot/custom multi-shot, and 15s generation relative to earlier Kling VIDEO 2.6/O1 generations ([Kling VIDEO 3.0 guide](https://kling.ai/quickstart/klingai-video-3-model-user-guide)).

**Assumed-settings knobs (ready to paste):**
- Prompt format: `Shot 1 (3s): ... Shot 2 (2s): ...` — set in prompt text for custom multi-shot ([Kling VIDEO 3.0 guide](https://kling.ai/quickstart/klingai-video-3-model-user-guide)).
- Reference syntax: `@Character` / `<<<element_1>>>` style tags — set in prompt plus input reference list ([Kling VIDEO 3.0 Omni guide](https://kling.ai/quickstart/klingai-video-3-omni-model-user-guide), [Kling prompt syntax blog](https://kling.ai/blog/kling-3-prompt-syntax-omni-reference-tags-video-physics)).

---

## LTX Video · video · verified

**1. Name / version / model IDs** — Lightricks states **LTX-2** is now the primary home for LTX development, and the LTX-2 repo requires LTX-2.3 checkpoints including `ltx-2.3-22b-dev.safetensors` and `ltx-2.3-22b-distilled-1.1.safetensors`; older LTX-Video current repo lists LTXV 0.9.8 models such as `ltxv-13b-0.9.8-dev`, `ltxv-13b-0.9.8-distilled`, and `ltxv-2b-0.9.8-distilled` ([LTX-2 GitHub](https://github.com/Lightricks/LTX-2), [LTX-Video GitHub](https://github.com/Lightricks/LTX-Video)).
  source: https://github.com/Lightricks/LTX-2 · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — LTX-2 prompts should be detailed, chronological shot descriptions under 200 words, and pipelines support `enhance_prompt`; older `inference.py` exposes `--prompt`, `--conditioning_media_paths`, `--conditioning_start_frames`, `--height`, `--width`, `--num_frames`, `--seed`, and `--pipeline_config` ([LTX-2 GitHub](https://github.com/Lightricks/LTX-2), [LTX-Video GitHub](https://github.com/Lightricks/LTX-Video)).
  source: https://github.com/Lightricks/LTX-2 · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `prompt` / `--prompt` | Scene/action/camera | Literal chronological paragraph; recommended under 200 words for LTX-2 ([LTX-2 GitHub](https://github.com/Lightricks/LTX-2)) | `--prompt "A woman walks..."` |
| `enhance_prompt` | Prompt enhancement | Boolean ([LTX-2 GitHub](https://github.com/Lightricks/LTX-2)) | `enhance_prompt=True` |
| `conditioning_media_paths` | Images/videos for i2v/v2v/keyframes | One or more image/video paths; input video segments must contain multiple of 8 frames plus 1 in older LTX-Video ([LTX-Video GitHub](https://github.com/Lightricks/LTX-Video)) | `--conditioning_media_paths start.png end.png` |
| `conditioning_start_frames` | Keyframe positions | Target frame numbers; target frame number should be multiple of 8 in older LTX-Video ([LTX-Video GitHub](https://github.com/Lightricks/LTX-Video)) | `--conditioning_start_frames 0 120` |
| `height`, `width` | Output resolution | Divisible by 32 recommended; older guide says best under 720×1280 and frames below 257 ([LTX-Video GitHub](https://github.com/Lightricks/LTX-Video)) | `--height 704 --width 1216` |
| `num_frames` | Duration in frames | Divisible by 8+1; older guide says below 257 best ([LTX-Video GitHub](https://github.com/Lightricks/LTX-Video)) | `--num_frames 121` |
| `guidance_scale` | Prompt adherence | Older guide recommends `3–3.5` ([LTX-Video GitHub](https://github.com/Lightricks/LTX-Video)) | `guidance_scale=3.5` |
| `inference_steps` | Quality/speed | Older guide says `40+` for quality, `20–30` for speed; distilled pipeline uses 8/4 steps in LTX-2 tips ([LTX-Video GitHub](https://github.com/Lightricks/LTX-Video), [LTX-2 GitHub](https://github.com/Lightricks/LTX-2)) | `num_inference_steps=30` |
| `quantization` | Memory/speed | `fp8-cast`, `fp8-scaled-mm` in LTX-2 repo ([LTX-2 GitHub](https://github.com/Lightricks/LTX-2)) | `--quantization fp8-cast` |

**3. Generate vs Edit** — LTX supports text-to-video, image-to-video, multi-keyframe conditioning, video extension forward/backward, video-to-video transformations, keyframe interpolation, retake/regenerate-region, HDR v2v, and LipDub pipelines ([LTX-Video GitHub](https://github.com/Lightricks/LTX-Video), [LTX-2 GitHub](https://github.com/Lightricks/LTX-2)).
  source: https://github.com/Lightricks/LTX-2 · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — LTX-2 lists multiple keyframes, IC-LoRA control models, standard LoRA for style customization, pose/control/HDR/LipDub LoRAs, and keyframe interpolation as official controls ([LTX-2 GitHub](https://github.com/Lightricks/LTX-2)).
  source: https://github.com/Lightricks/LTX-2 · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — LTX-2 announcement says native 4K up to 50fps and synchronized audio up to 10 seconds; older LTXV 0.9.8 supports up to 60 seconds, with older local guide recommending under 720×1280 and under 257 frames for best results ([LTX-Video GitHub](https://github.com/Lightricks/LTX-Video)).
  source: https://github.com/Lightricks/LTX-Video · verified: 2026-06-30 · confidence: medium

**6. Not controlled + safety** — Official repos document model usage and licenses but not an API-level anti-abuse filter; prompt/control fidelity remains constrained by model guidance, steps, resolution/frame divisibility, and conditioning strength rather than guaranteed exact output ([LTX-Video GitHub](https://github.com/Lightricks/LTX-Video)).
  source: https://github.com/Lightricks/LTX-Video · verified: 2026-06-30 · confidence: medium

**Changed / deprecated since DALL·E 3:**
- LTX-2 is a native audio-video model with open-access checkpoints and local pipeline controls, unlike the hosted DALL·E 3 image-only API model ([LTX-2 GitHub](https://github.com/Lightricks/LTX-2)).
- LTXV 0.9.8 remains documented for older video workflows, but LTX-2 is now primary home for active development ([LTX-Video GitHub](https://github.com/Lightricks/LTX-Video)).

**Assumed-settings knobs (ready to paste):**
- `model checkpoint="ltx-2.3-22b-distilled-1.1.safetensors", enhance_prompt=True` — set in LTX-2 pipeline config/code ([LTX-2 GitHub](https://github.com/Lightricks/LTX-2)).
- Older CLI: `--pipeline_config configs/ltxv-13b-0.9.8-distilled.yaml --height 704 --width 1216 --num_frames 121 --seed 42` — set in `inference.py` ([LTX-Video GitHub](https://github.com/Lightricks/LTX-Video)).

---

## Dream Machine (Luma) · video · verified

**1. Name / version / model IDs** — Luma’s current public video model in the Agents API is `ray-3.2`, supporting `type: "video"`, `"video_edit"`, and `"video_reframe"`; Luma’s Ray page and announcement present Ray3.2 as current creative-control video model ([Luma Agents model docs](https://docs.agents.lumalabs.ai/guides/model/), [Luma Ray3.2 announcement](https://lumalabs.ai/news/introducing-ray-3-2)).
  source: https://docs.agents.lumalabs.ai/guides/model/ · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Luma uses `POST /generations` with `model`, `type`, `prompt`, top-level `aspect_ratio`, optional `source`, and `video` options such as `resolution`, `duration`, `loop`, `hdr`, `exr_export`, `start_frame`, `end_frame`, `keyframes`, `keyframe_indexes`, and `edit.controls` ([Luma create generation API](https://docs.agents.lumalabs.ai/api/resources/generations/methods/create/), [Luma video generation guide](https://docs.agents.lumalabs.ai/guides/videos/generation/)).
  source: https://docs.agents.lumalabs.ai/guides/videos/generation/ · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `model` | Model | `ray-3.2` ([Luma model docs](https://docs.agents.lumalabs.ai/guides/model/)) | `"model":"ray-3.2"` |
| `type` | Workflow | `video`, `video_edit`, `video_reframe` for video ([Luma model docs](https://docs.agents.lumalabs.ai/guides/model/)) | `"type":"video_edit"` |
| `prompt` | Text instruction | 1–6,000 chars; should specify subject, motion, camera, lighting, pacing ([Luma video generation guide](https://docs.agents.lumalabs.ai/guides/videos/generation/)) | `"A dolly-in shot..."` |
| `aspect_ratio` | Output ratio | `9:16`, `3:4`, `1:1`, `4:3`, `16:9`, `21:9` for Ray 3.2 video ([Luma video generation guide](https://docs.agents.lumalabs.ai/guides/videos/generation/)) | `"aspect_ratio":"16:9"` |
| `video.resolution` | Output resolution | `360p`, `540p`, `720p`, `1080p`; default `720p` ([Luma video generation guide](https://docs.agents.lumalabs.ai/guides/videos/generation/)) | `"resolution":"1080p"` |
| `video.duration` | Duration | `5s` default or `10s`; 10s not supported with HDR or legacy start/end frame ([Luma video generation guide](https://docs.agents.lumalabs.ai/guides/videos/generation/)) | `"duration":"10s"` |
| `video.keyframes` + `keyframe_indexes` | Multi-keyframe i2v | 1–64 guide-frame images at output frame positions, duration×24fps grid ([Luma video generation guide](https://docs.agents.lumalabs.ai/guides/videos/generation/)) | `keyframe_indexes:[0,120]` |
| `video.edit.controls.depth.blur` | Geometry freedom | `0–1` ([Luma create API](https://docs.agents.lumalabs.ai/api/resources/generations/methods/create/)) | `depth:{enabled:true,blur:0.5}` |
| `video.edit.controls.normals.augmentation` | Surface reinterpretation | `0–1` ([Luma create API](https://docs.agents.lumalabs.ai/api/resources/generations/methods/create/)) | `normals:{augmentation:0.3}` |
| `video.edit.controls.pose.strength` | Pose/skeleton control | Type shown but exact numeric range not exposed in fetched text [uncertain] ([Luma create API](https://docs.agents.lumalabs.ai/api/resources/generations/methods/create/)) | `[uncertain]` |
| `video.edit.controls.trajectory.sparsity` | Motion anchor sparsity | `0–1` ([Luma create API](https://docs.agents.lumalabs.ai/api/resources/generations/methods/create/)) | `trajectory:{sparsity:0.4}` |

**3. Generate vs Edit** — `type:"video"` supports text-to-video, image-to-video, multi-keyframe i2v, looping, HDR, and extension; `type:"video_edit"` modifies a source video up to 18s and preserves output duration; `type:"video_reframe"` changes aspect/canvas framing ([Luma model docs](https://docs.agents.lumalabs.ai/guides/model/), [Luma create API](https://docs.agents.lumalabs.ai/api/resources/generations/methods/create/)).
  source: https://docs.agents.lumalabs.ai/guides/model/ · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — Ray 3.2 supports start/end frame anchors, up to 64 multi-keyframe anchors, source videos for edit/reframe, prior `generation_id` chaining for extension, and per-signal edit controls for depth, face, normals, pose, and trajectory ([Luma video generation guide](https://docs.agents.lumalabs.ai/guides/videos/generation/), [Luma create API](https://docs.agents.lumalabs.ai/api/resources/generations/methods/create/)).
  source: https://docs.agents.lumalabs.ai/guides/videos/generation/ · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — Ray 3.2 supports `360p`, `540p`, `720p`, and `1080p`; video generation supports `5s` and `10s`; video_edit source must be 18s or shorter and output duration matches the source ([Luma video generation guide](https://docs.agents.lumalabs.ai/guides/videos/generation/), [Luma create API](https://docs.agents.lumalabs.ai/api/resources/generations/methods/create/)).
  source: https://docs.agents.lumalabs.ai/guides/videos/generation/ · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — API docs recommend `user` as a stable non-PII end-user identifier forwarded to upstream providers for trust/safety attribution; exact output is constrained by mutually exclusive controls such as `start_frame` versus multi-keyframes, `loop` restrictions, and model validation ([Luma create API](https://docs.agents.lumalabs.ai/api/resources/generations/methods/create/)).
  source: https://docs.agents.lumalabs.ai/api/resources/generations/methods/create/ · verified: 2026-06-30 · confidence: high

**Changed / deprecated since DALL·E 3:**
- Ray3.2 brings video-to-video Modify, reframe, extension, HDR/EXR, and up to 64 multi-keyframe anchors; this is a video control surface rather than DALL·E 3-era image-only prompting ([Luma model docs](https://docs.agents.lumalabs.ai/guides/model/), [Luma video generation guide](https://docs.agents.lumalabs.ai/guides/videos/generation/)).

**Assumed-settings knobs (ready to paste):**
- `model="ray-3.2", type="video", aspect_ratio="16:9", video={"resolution":"1080p","duration":"5s"}` — set in `/generations` JSON ([Luma video generation guide](https://docs.agents.lumalabs.ai/guides/videos/generation/)).
- `type="video_edit", source={...}, video={"edit":{"auto_controls":true}}` — set in `/generations` JSON ([Luma create API](https://docs.agents.lumalabs.ai/api/resources/generations/methods/create/)).

---

## Seedance 2.0 (ByteDance video) · video · verified

**1. Name / version / model IDs** — Official BytePlus/Volcengine docs cover **Dreamina/Seedance 2.0**; BytePlus example uses `dreamina-seedance-2-0-260128`, while Volcengine example uses `doubao-seedance-2-0-260128` ([BytePlus Seedance 2.0 API Reference](https://docs.byteplus.com/en/docs/ModelArk/1520757), [Volcengine Seedance 2.0 API Reference](https://www.volcengine.com/docs/82379/1520757?lang=zh)).
  source: https://docs.byteplus.com/en/docs/ModelArk/1520757 · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Seedance 2.0 uses `POST /api/v3/contents/generations/tasks` with `model`, `content[]` items for text/image/video/audio, `role` values such as `reference_image`, `reference_video`, and `reference_audio`, plus `generate_audio`, `ratio`, `duration`, `watermark`, and optional `resolution`/`frames`/`seed`/`camera_fixed` per tutorial ([BytePlus API Reference](https://docs.byteplus.com/en/docs/ModelArk/1520757), [BytePlus video generation tutorial](https://docs.byteplus.com/en/docs/ModelArk/2298881)).
  source: https://docs.byteplus.com/en/docs/ModelArk/1520757 · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `model` | Model ID | `dreamina-seedance-2-0-260128` on BytePlus; `doubao-seedance-2-0-260128` on Volcengine ([BytePlus API](https://docs.byteplus.com/en/docs/ModelArk/1520757), [Volcengine API](https://www.volcengine.com/docs/82379/1520757?lang=zh)) | `"model":"dreamina-seedance-2-0-260128"` |
| `content[]` text | Prompt | `{"type":"text","text":"..."}` ([BytePlus API](https://docs.byteplus.com/en/docs/ModelArk/1520757)) | `Use [Video 1] POV...` |
| `image_url` / `reference_image` | Reference image | Content item with `type:"image_url"`, `role:"reference_image"` ([BytePlus API](https://docs.byteplus.com/en/docs/ModelArk/1520757)) | `role:"reference_image"` |
| `video_url` / `reference_video` | Reference video | Content item with `type:"video_url"`, `role:"reference_video"` ([BytePlus API](https://docs.byteplus.com/en/docs/ModelArk/1520757)) | `role:"reference_video"` |
| `audio_url` / `reference_audio` | Reference audio | Content item with `type:"audio_url"`, `role:"reference_audio"` ([BytePlus API](https://docs.byteplus.com/en/docs/ModelArk/1520757)) | `role:"reference_audio"` |
| `generate_audio` | Audio generation | Boolean; examples use `true`/`True` ([BytePlus API](https://docs.byteplus.com/en/docs/ModelArk/1520757)) | `generate_audio=true` |
| `ratio` | Aspect ratio | `16:9`, `4:3`, `1:1`, `3:4`, `9:16`, `21:9` in resolution table ([BytePlus API](https://docs.byteplus.com/en/docs/ModelArk/1520757)) | `ratio="16:9"` |
| `duration` | Seconds | Example `11`; tutorial lists `duration` as output video duration but exact min/max not found in fetched docs ([BytePlus API](https://docs.byteplus.com/en/docs/ModelArk/1520757)) | `duration=11` |
| `resolution` | Output tier | `480p`, `720p`, `1080p`, `4k`; 1080p not supported by Fast/Mini, 4K only Seedance 2.0 ([BytePlus API](https://docs.byteplus.com/en/docs/ModelArk/1520757)) | `resolution="720p"` |
| `seed` | Seed integer | Listed in tutorial; exact range not confirmed ([BytePlus tutorial](https://docs.byteplus.com/en/docs/ModelArk/2298881)) | `seed=33608` |
| `camera_fixed` | Fixed camera | Listed in tutorial; exact values not confirmed ([BytePlus tutorial](https://docs.byteplus.com/en/docs/ModelArk/2298881)) | `camera_fixed=true` |

**3. Generate vs Edit** — Seedance 2.0 supports multimodal reference generation, video editing, video extension, audio-video generation, multi-reference image-to-video, and first/last frame generation according to the official tutorial ([BytePlus video generation tutorial](https://docs.byteplus.com/en/docs/ModelArk/2298881)).
  source: https://docs.byteplus.com/en/docs/ModelArk/2298881 · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — Seedance 2.0 supports reference images, videos, and audio, including combined references, and the official tutorial warns prompts should refer to assets by asset type plus order such as “Image 1,” not by asset ID ([BytePlus API Reference](https://docs.byteplus.com/en/docs/ModelArk/1520757), [BytePlus Seedance tutorial](https://docs.byteplus.com/en/docs/ModelArk/2291680)).
  source: https://docs.byteplus.com/en/docs/ModelArk/1520757 · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — Seedance 2.0 series supports 480p, 720p, 1080p, and 4K; 4K pixel values include 3840×2160 for 16:9, 2880×2880 for 1:1, and 2160×3840 for 9:16; example response reports 24fps and duration 11s ([BytePlus API Reference](https://docs.byteplus.com/en/docs/ModelArk/1520757), [Volcengine API Reference](https://www.volcengine.com/docs/82379/1520757?lang=zh)).
  source: https://docs.byteplus.com/en/docs/ModelArk/1520757 · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — ModelArk Content Pre-filter can detect risky input prompts and output completions, refuse or intervene, and baseline content safety policies remain even when disabled; the Seedance tutorial also describes trusted face-containing outputs and compliant digital character assets for lower compliance risk ([BytePlus Content Pre-filter](https://docs.byteplus.com/en/docs/ModelArk/Content_Pre-filter), [Seedance tutorial](https://docs.byteplus.com/en/docs/ModelArk/2291680)).
  source: https://docs.byteplus.com/en/docs/ModelArk/Content_Pre-filter · verified: 2026-06-30 · confidence: high

**Changed / deprecated since DALL·E 3:**
- Seedance is video-native with reference image/video/audio, generated audio, extension, and video editing rather than image-only generation ([BytePlus video generation tutorial](https://docs.byteplus.com/en/docs/ModelArk/2298881)).

**Assumed-settings knobs (ready to paste):**
- `model="dreamina-seedance-2-0-260128", ratio="16:9", resolution="720p", duration=8, generate_audio=true, watermark=false` — set in `/contents/generations/tasks` JSON body ([BytePlus API Reference](https://docs.byteplus.com/en/docs/ModelArk/1520757)).

---

## Veo 3.1 (Google) · video · verified

**1. Name / version / model IDs** — Google’s current Veo line is **Veo 3.1**; Gemini API preview IDs are `veo-3.1-generate-preview` and `veo-3.1-fast-generate-preview`, and Agent Platform GA IDs include `veo-3.1-generate-001`, `veo-3.1-fast-generate-001`, and `veo-3.1-lite-generate-001` ([Google AI model page](https://ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview), [Google Cloud Veo 3.1 docs](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/veo/3-1-generate)).
  source: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/veo/3-1-generate · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Veo uses `client.models.generate_videos(model=..., prompt=..., config=GenerateVideosConfig(...))`; documented knobs include `reference_images`, `aspect_ratio`, `output_gcs_uri`, number of results, video length, output resolution, person generation safety setting, and seed in console/API examples ([Google reference-image guide](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/use-reference-images-to-guide-video-generation)).
  source: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/use-reference-images-to-guide-video-generation · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `model` | Model ID | `veo-3.1-generate-preview`, `veo-3.1-fast-generate-preview`, `veo-3.1-generate-001`, `veo-3.1-fast-generate-001`, `veo-3.1-lite-generate-001` ([Google AI model page](https://ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview), [Google Cloud Veo docs](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/veo/3-1-generate)) | `model="veo-3.1-generate-preview"` |
| `prompt` | Video description | Text prompt; Google prompting docs emphasize scene, camera, and audio detail ([Veo overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/overview)) | `"A person walks in carrying a vase..."` |
| `reference_images` | Asset/style references | Subject image up to 3 images; style image 1 image ([reference-image guide](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/use-reference-images-to-guide-video-generation)) | `reference_type="asset"` |
| `aspect_ratio` | Shape | `16:9` or `9:16` in reference-image UI and overview ([Veo overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/overview)) | `aspect_ratio="9:16"` |
| Video length | Duration | `4`, `6`, or `8` seconds ([Veo overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/overview)) | `durationSeconds=8` |
| Output resolution | Resolution | `720p`, `1080p`, or `4K`; 4K not available for Veo 3.1 Lite per Gemini API search-result excerpts from official docs, but fetched page did not expose all details ([Veo overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/overview), [Gemini API video page](https://ai.google.dev/gemini-api/docs/video)) | `resolution="1080p"` |
| `seed` | Randomization | Advanced option in UI/API guide; exact range not exposed in fetched page ([reference-image guide](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/use-reference-images-to-guide-video-generation)) | `seed=12345` |
| Person generation | Safety/person faces | `Allow (Adults only)` default or `Don't allow` ([reference-image guide](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/use-reference-images-to-guide-video-generation)) | `personGeneration="dont_allow"` |

**3. Generate vs Edit** — Veo supports text-to-video, first-frame image-to-video, first-and-last-frame generation, ingredients/reference-to-video, extension, insert objects, and remove objects according to Google’s Veo overview; Gemini API page describes video extension, frame-specific generation, and image-based direction through `generateContent` ([Veo overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/overview), [Gemini API video page](https://ai.google.dev/gemini-api/docs/video)).
  source: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/overview · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — Veo reference-image controls support up to three subject images of one person/character/product and one style image; Google says Veo preserves the subject’s appearance or applies the uploaded style ([Google reference-image guide](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/use-reference-images-to-guide-video-generation)).
  source: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/use-reference-images-to-guide-video-generation · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — Veo overview states outputs at 720p, 1080p, or 4K, aspect ratios 16:9 or 9:16, and clip lengths 4, 6, or 8 seconds, with audio/dialogue ([Veo overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/overview)).
  source: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/overview · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — Veo has built-in safety features to help block potentially harmful outputs, and reference-image generation exposes Person generation settings that can allow adults only or disallow people/faces ([Veo overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/overview), [reference-image guide](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/use-reference-images-to-guide-video-generation)).
  source: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/overview · verified: 2026-06-30 · confidence: high

**Changed / deprecated since DALL·E 3:**
- Veo 2.0 and Veo 3.0 model IDs are being deprecated/shut down June 30, 2026 in Gemini API release notes, with migration to Veo 3.1 preview or GA models ([Gemini API release notes](https://ai.google.dev/gemini-api/docs/changelog)).
- Veo 3.1 is video-native with synchronized audio, reference images, first/last frame controls, and extension, unlike DALL·E 3 image generation ([Veo overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/overview)).

**Assumed-settings knobs (ready to paste):**
- `model="veo-3.1-generate-preview", aspect_ratio="16:9", durationSeconds=8, resolution="1080p"` — set in `generate_videos` / `GenerateVideosConfig` ([reference-image guide](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/use-reference-images-to-guide-video-generation), [Veo overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/overview)).

---

## Nano Banana 2 family / Omni Flash · image+video · recheck-only

**1. Name / version / model IDs** — Recheck result: Nano Banana 2 current model IDs include `gemini-3.1-flash-image` and `gemini-3.1-flash-image-preview`; Nano Banana 2 Lite is `gemini-3.1-flash-lite-image`; Gemini Omni Flash preview is `gemini-omni-flash-preview` ([Gemini image generation docs](https://ai.google.dev/gemini-api/docs/image-generation), [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing), [Google Cloud launch blog](https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-2-lite-and-gemini-omni-flash-available/)).
  source: https://ai.google.dev/gemini-api/docs/pricing · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Recheck-only scope: not rebuilt; volatile model-ID/pricing facts only.
  source: n/a · verified: 2026-06-30 · confidence: n/a

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `model` | Nano Banana 2 image | `gemini-3.1-flash-image`; preview alias `gemini-3.1-flash-image-preview` also appears in Gemini 3 guide ([Gemini image generation docs](https://ai.google.dev/gemini-api/docs/image-generation), [Gemini 3 guide](https://ai.google.dev/gemini-api/docs/gemini-3)) | `model="gemini-3.1-flash-image"` |
| `model` | Nano Banana 2 Lite image | `gemini-3.1-flash-lite-image` ([Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing), [Google Cloud blog](https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-2-lite-and-gemini-omni-flash-available/)) | `model="gemini-3.1-flash-lite-image"` |
| `model` | Gemini Omni Flash video | `gemini-omni-flash-preview` ([Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)) | `model="gemini-omni-flash-preview"` |

**3. Generate vs Edit** — Recheck-only scope: not rebuilt.
  source: n/a · verified: 2026-06-30 · confidence: n/a

**4. References / character-consistency / style** — Recheck-only scope: not rebuilt.
  source: n/a · verified: 2026-06-30 · confidence: n/a

**5. Resolution / aspect ratio / duration** — Recheck-only pricing facts: Gemini 3.1 Flash Image output pricing is $60 per 1M image-output tokens; output images cost approximately $0.045 at 0.5K, $0.067 at 1K, $0.101 at 2K, and $0.151 at 4K; Gemini 3.1 Flash-Lite Image output pricing is $30 per 1M image-output tokens and $0.0336 per 1K output image; Gemini Omni Flash billing is 5,792 output tokens/sec of 720p video, approximately $0.10/sec ([Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)).
  source: https://ai.google.dev/gemini-api/docs/pricing · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — Recheck-only scope: Google Cloud says C2PA content credentials and imperceptible SynthID watermarks are enabled by default for Nano Banana 2 Lite and Gemini Omni Flash ([Google Cloud launch blog](https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-2-lite-and-gemini-omni-flash-available/)).
  source: https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-2-lite-and-gemini-omni-flash-available/ · verified: 2026-06-30 · confidence: high

**Changed / deprecated since DALL·E 3:**
- Recheck-only: Nano Banana 2 / Gemini 3.1 Flash Image is documented as the lower-price, high-volume counterpart to Gemini 3 Pro Image, and Omni Flash is a new conversational video generation/editing preview model ([Gemini 3 guide](https://ai.google.dev/gemini-api/docs/gemini-3), [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)).

**Assumed-settings knobs (ready to paste):**
- `model="gemini-3.1-flash-image"` = Nano Banana 2 image model — set in Gemini image generation request ([Gemini image generation docs](https://ai.google.dev/gemini-api/docs/image-generation)).
- `model="gemini-omni-flash-preview"` = Omni Flash video model — set in Gemini API request ([Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing)).

---

## Sources opened
- [Midjourney Parameter List](https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List); [Midjourney Version](https://docs.midjourney.com/hc/en-us/articles/32199405667853-Version); [Midjourney Omni Reference](https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference); [Midjourney Editor](https://docs.midjourney.com/hc/en-us/articles/32764383466893-Editor); [Midjourney Video](https://docs.midjourney.com/hc/en-us/articles/37460773864589-Video).
- [OpenAI image generation guide](https://developers.openai.com/api/docs/guides/image-generation); [OpenAI GPT Image 2 model page](https://developers.openai.com/api/docs/models/gpt-image-2); [OpenAI Images API reference](https://developers.openai.com/api/reference/resources/images/); [OpenAI image edit reference](https://developers.openai.com/api/reference/python/resources/images/methods/edit/).
- [Stability AI API Reference](https://platform.stability.ai/docs/api-reference); [Stability AI API Parameters](https://platform.stability.ai/docs/features/api-parameters); [Stability AI Image Models](https://stability.ai/stable-image).
- [BFL FLUX.2 overview](https://docs.bfl.ml/flux_2/flux2_overview); [BFL FLUX.2 flex API](https://docs.bfl.ai/api-reference/models/generate-or-edit-an-image-with-flux2-%5Bflex%5D); [BFL FLUX.2 blog](https://bfl.ai/blog/flux-2); [BFL FLUX.2 model page](https://bfl.ai/models/flux-2).
- [BytePlus Seedream tutorial](https://docs.byteplus.com/en/docs/ModelArk/1824121); [BytePlus Image Generation API](https://docs.byteplus.com/en/docs/ModelArk/1541523); [BytePlus Seedream prompt guide](https://docs.byteplus.com/en/docs/ModelArk/1829186); [BytePlus ModelArk Content Pre-filter](https://docs.byteplus.com/en/docs/ModelArk/Content_Pre-filter).
- [Runway Available Models](https://docs.dev.runwayml.com/guides/models/); [Runway API Reference](https://docs.dev.runwayml.com/api/); [Runway API changelog](https://docs.dev.runwayml.com/api-details/api_changelog/); [Runway Gen-4 help](https://help.runwayml.com/hc/en-us/articles/37327109429011-Creating-with-Gen-4-Video).
- [Kling VIDEO 3.0 Model User Guide](https://kling.ai/quickstart/klingai-video-3-model-user-guide); [Kling VIDEO 3.0 Omni Model User Guide](https://kling.ai/quickstart/klingai-video-3-omni-model-user-guide); [Kling prompt syntax blog](https://kling.ai/blog/kling-3-prompt-syntax-omni-reference-tags-video-physics).
- [Lightricks LTX-Video GitHub](https://github.com/Lightricks/LTX-Video); [Lightricks LTX-2 GitHub](https://github.com/Lightricks/LTX-2).
- [Luma Agents video generation guide](https://docs.agents.lumalabs.ai/guides/videos/generation/); [Luma Agents model docs](https://docs.agents.lumalabs.ai/guides/model/); [Luma create generation API](https://docs.agents.lumalabs.ai/api/resources/generations/methods/create/); [Luma Ray3.2 announcement](https://lumalabs.ai/news/introducing-ray-3-2).
- [BytePlus Seedance 2.0 API Reference](https://docs.byteplus.com/en/docs/ModelArk/1520757); [BytePlus Seedance tutorial](https://docs.byteplus.com/en/docs/ModelArk/2291680); [BytePlus video generation tutorial](https://docs.byteplus.com/en/docs/ModelArk/2298881); [Volcengine Seedance API Reference](https://www.volcengine.com/docs/82379/1520757?lang=zh).
- [Google Gemini API video page](https://ai.google.dev/gemini-api/docs/video); [Google AI Veo 3.1 model page](https://ai.google.dev/gemini-api/docs/models/veo-3.1-generate-preview); [Google Cloud Veo 3.1 docs](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/veo/3-1-generate); [Google reference-image guide](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/use-reference-images-to-guide-video-generation); [Google Veo overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/video/overview); [Google DeepMind Veo](https://deepmind.google/models/veo/).
- [Gemini image generation docs](https://ai.google.dev/gemini-api/docs/image-generation); [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing); [Gemini API models](https://ai.google.dev/gemini-api/docs/models); [Gemini 3 developer guide](https://ai.google.dev/gemini-api/docs/gemini-3); [Google Cloud Nano Banana 2 Lite and Omni Flash launch blog](https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-2-lite-and-gemini-omni-flash-available/); [Google Cloud Gemini 3.1 Flash Image model page](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-1-flash-image).

## Data gaps & confidence
- Midjourney: current exact ranges for `--chaos`, `--no`, `--sref` weights, and V8.1 `--style` values were not fully confirmed from fetched current docs; legacy/current split is marked where relevant.
- OpenAI: exact current “sibling” availability differs between the guide and Python reference (`gpt-image-2` appears in guide/model page; edit reference also lists `gpt-image-2-2026-04-21`); both are cited, but endpoint availability should be checked in a live account before rollout.
- Stability AI: SD 3.5 Flash was described in the API text but not included in the fetched `model` enum for `/generate/sd3`; mark exact API model ID for Flash as [uncertain].
- SeeDream: exact negative-prompt support, exact per-model `output_format` enum, and exact upload/reference image count limits were not confirmed in official fetched docs.
- Kling: the current first-party API reference at `app.klingai.com/global/dev/document-api` was not fetchable; `cfg_scale`, `std/pro` `mode`, 4K support, extension, lip-sync API fields, and exact current API schema remain [uncertain].
- LTX Video: official GitHub docs expose local pipeline controls, but no hosted API schema or official anti-abuse constraints were found.
- Luma: exact numeric ranges for `video.edit.controls.pose.strength` and some edit-control defaults were not exposed in the fetched API text.
- Seedance 2.0: exact Fast/Mini model IDs, duration min/max, `seed` range, and `camera_fixed` value schema were not confirmed in official fetched docs.
- Veo 3.1: the fetched Google pages confirmed model IDs and high-level knobs, but some Vertex API parameter names and 4K/Lite exclusions were better exposed in search excerpts than fetched page text; use live Google SDK schema before implementation.
- Nano Banana 2 / Omni Flash: completed recheck-only scope for model IDs and pricing; full capability entry intentionally not rebuilt.
