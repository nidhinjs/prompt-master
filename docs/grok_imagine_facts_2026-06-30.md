# Grok Imagine · image+video · verified (primary: docs.x.ai)
**Refresh date:** 2026-06-30 · самый детальный fact-sheet (supersedes the thinner Grok entry in `generation_tools_facts_2026-06-30.json` / `image_video_generation_tools_docs_2026-06-30.md`).

**1. Name / version / model IDs** — Image: `grok-imagine-image` ($0.02/img, fast/cheap) · `grok-imagine-image-quality` ($0.05/img, quality). Video: `grok-imagine-video-1.5` ($0.08/sec) · `grok-imagine-video` ($0.05/sec). OpenAI-compatible base_url `https://api.x.ai/v1`. Aliases: `<model>` = latest stable, `<model>-latest`, `<model>-<date>` pinned.
  source: docs.x.ai/developers/models · verified: 2026-06-30 · confidence: high

**2. Prompt syntax & knobs** — Natural-language prompt. No weighted syntax, no negative prompt — control via wording + references.
  source: docs.x.ai/developers/model-capabilities/images/generation · docs.x.ai/developers/model-capabilities/video/generation · verified: 2026-06-30 · confidence: high

| Knob | Sets | Values / range | Example |
|------|------|----------------|---------|
| `n` (image) | Batch count | up to 10 (`sample_batch`) | `4` |
| `aspect_ratio` (image) | Shape | 1:1, 16:9/9:16, 4:3/3:4, 3:2/2:3, 2:1/1:2, 19.5:9/9:19.5, 20:9/9:20, auto | `16:9` |
| `resolution` (image) | Detail | `1k`, `2k` | `2k` |
| `response_format` (image) | Output | url (default, temp) / `b64_json` | `b64_json` |
| `duration` (video) | Length | 1–15 s (edit/extend differ — see fact 5) | `10` |
| `aspect_ratio` (video) | Shape | 1:1, 16:9/9:16 (default 16:9), 4:3/3:4, 3:2/2:3 | `16:9` |
| `resolution` (video) | Quality | 480p (default), 720p, 1080p* | `720p` |
| `reference_images` / `image` (video) | Mode select | URL / base64 / file_id; mutually exclusive | see fact 3 |

\*1080p only on `grok-imagine-video-1.5` for image-to-video.

**3. Generate vs Edit** — Image generate: `POST /v1/images/generations`. Image edit: `POST /v1/images/edits` (NL instruction + source); multi-image edit up to 3 sources (compose/style-transfer). Video has 5 mutually-exclusive modes: text-to-video (`prompt`), image-to-video (`prompt`+`image`, starting frame), reference-to-video (`prompt`+`reference_images`, **requires `grok-imagine-video`**), edit-video (`/v1/videos/edits`), extend-video (`/v1/videos/extensions`, continues from last frame). Video is async: start → poll `request_id` (pending/done/expired/failed).
  source: docs.x.ai/developers/model-capabilities/imagine · .../images/editing · .../images/multi-image-editing · .../video/generation · .../video/reference-to-video · .../video/extension · verified: 2026-06-30 · confidence: high

**4. References / character-consistency / style** — Image edit/compose: up to 3 reference images. Reference-to-video: one or more references (URL/base64/file_id, mixable), addressed as `<IMAGE_n>` in prompt, influence content WITHOUT locking first frame (virtual try-on, product placement, character consistency). Image-to-video: source image = first frame (strongest subject/motion lock). Single-image edit output follows input aspect ratio.
  source: docs.x.ai/developers/model-capabilities/video/reference-to-video · .../images/multi-image-editing · verified: 2026-06-30 · confidence: high

**5. Resolution / aspect ratio / duration** — Image: 1k/2k, aspect enum above. Video: 480p/720p/1080p* (default 480p), duration 1–15 s. Video editing: no custom duration (retains input, capped 8.7 s), no custom resolution (input, capped 720p), no custom aspect (input). Extension `duration` = added portion only (total = input + duration).
  duration: video 1–15 s (edit ≤8.7 s; extension adds to source)
  source: docs.x.ai/developers/model-capabilities/video/generation · .../video/extension · verified: 2026-06-30 · confidence: high

**6. Not controlled + safety** — No negative-prompt parameter; single-image edit can't override aspect; video editing can't set duration/resolution/aspect; can't combine `image` + `reference_images` (400). All media passes content moderation (`respect_moderation` flag); media not used for training. Enterprise: SOC 2 Type II, HIPAA eligible, GDPR, data residency, SSO/RBAC. Error codes: invalid_argument / permission_denied / failed_precondition / service_unavailable / internal_error.
  source: docs.x.ai/developers/model-capabilities/video/generation · .../imagine · verified: 2026-06-30 · confidence: high

**Changed / deprecated since DALL·E 3:** Unified image+video API; two image tiers (cheap `grok-imagine-image` vs `grok-imagine-image-quality`); multi-reference image editing (≤3); image-to-video first-frame anchoring; dedicated reference-to-video (no first-frame lock); video editing + extension; per-second video pricing; OpenAI-compatible endpoint + xAI SDK + Vercel AI SDK; Files API inputs/outputs.
  source: docs.x.ai/developers/model-capabilities/imagine · verified: 2026-06-30

**Assumed-settings knobs (ready to paste):**
- image model = `grok-imagine-image-quality` (switch to `grok-imagine-image` for fast/cheap) — set via: `model`
- image `resolution` = `1k` (→ `2k` for detail) — set via request param
- video model = `grok-imagine-video` (→ `grok-imagine-video-1.5` for 1080p image-to-video) — set via `model`
- video `resolution` = `480p` default (→ `720p`/`1080p`) — set via request param
- video `duration` = up to 15 s — set via request param
