# Media-generation profiles

Load this bundle only when [tool-profiles.md](../tool-profiles.md) selects it.
It is self-contained. First distinguish generation from reference editing, then
state subject, scene, composition, style, motion/audio, constraints, output use,
and verification. Use [templates.md](../templates.md) Template I for video,
Template J for reference-image editing, and Template K for ComfyUI.

## Registry boundary

Resolve the route alias in [facts/index.json](../facts/index.json), then read only
the referenced provider shard. The registry alone owns model IDs, defaults,
release channels, availability and sunset dates, supported resolutions/durations,
reference counts, endpoints, and version-tied parameter ranges. Never infer one
provider's controls from another. If no registry record exists for a generic
engine workflow, use only locally verified capabilities. Missing facts route to
[decompiler-fallback.md](decompiler-fallback.md).

## Shared media contract

- Put unprovided controls in a separate overridable `Assumed settings:` note and
  say whether each belongs in prompt flags, request parameters, or UI settings.
- Never fabricate unsupported negative-prompt fields, resolutions, reference
  limits, duration, quality tiers, or control ranges.
- Preserve user-supplied people, brands, and reference assets within their stated
  consent and usage boundary.
- For edits, describe the delta and invariants; do not re-describe the whole asset
  when that risks drift.

## Image AI — Generation

First detect generation from scratch versus editing an existing image.

- **Midjourney:** use a comma-separated descriptor grammar: subject, style,
  mood, lighting, composition, followed by verified `--` flags. Use the current
  registry route for ordinary generation versus consistency/reference work;
  never combine incompatible version-specific reference controls. Style and
  negative terms belong in their supported flag form, not prose emulation.
- **OpenAI image:** natural prose works; add “do not include text unless
  specified.” Put size, quality, count, background, format, moderation, masks,
  and references in verified request controls.
- **Stable Diffusion:** use weighted positive phrasing when supported and an
  explicit negative block. Keep guidance, steps, style preset, inpaint/outpaint,
  replacement, erase, and structural/style controls in setup validated against
  the selected record.
- **FLUX:** use natural language or a structured object covering subject,
  lighting, camera angle, composition, and exact colors. Do not transplant
  Stable-Diffusion weighting syntax. Resolve guidance, steps, safety, and
  multi-reference support from the registry.
- **SeeDream:** put art style before scene content and describe generate/edit,
  character/style/subject transfer, and grouped-output intent. Use positive
  wording unless the selected record verifies a negative field.
- **Google image:** route general, speed-sensitive, consistency/brand, grounded,
  and hardest-work needs through registry capabilities. For edits, attach the
  source and state the delta; never assume a lighter surface supports the same
  references or grounding.
- **Grok Imagine image:** use natural language and positive constraints. Do not
  emit a Negative Prompt block unless the selected record explicitly supports
  one. Put aspect ratio, resolution, edit, and reference controls in setup.

## Image AI — Reference Editing

- Detect “change”, “edit”, “modify”, “adjust”, or an uploaded reference.
- Require the reference image to be attached to the target tool before execution.
- Write the prompt around the delta only: what changes and what remains identical,
  including identity, composition, crop, palette, lighting, text, and background.
- Load [templates.md](../templates.md) Template J for the full structure.

## ComfyUI

- Treat it as a node workflow, not one prompt box. Verify the loaded checkpoint
  before provider-specific wording.
- Always output separate `Positive:` and `Negative:` blocks wired to separate
  conditioning inputs; never merge them.
- Resolve guidance, sampler, steps, resolution, and node availability from the
  user's workflow or registry, not profile defaults.
- Load [templates.md](../templates.md) Template K.

## 3D AI — Text to 3D / Game Systems

- Describe style, subject, key features, primary material, texture detail, and
  technical target.
- If the tool verifies negative prompting, exclude background, base, and floating
  parts; otherwise state desired positive geometry.
- Select game-asset collaboration, rapid topology prototyping, or photorealism by
  verified provider capability, not a hardcoded product ranking.
- Specify export use and validated format: game engine, printing, or web.
- For rigged characters, request the pose and topology requirements explicitly.

## 3D AI — In-Engine AI

- For an editor assistant, state whether the task is documentation lookup,
  project query, editor automation, code generation/review, or asset generation.
- For sprites, textures, or animation, define art style, resolution, palette, and
  loop/one-shot behavior.
- For Blender scripting tools, state geometry, material names, scene context,
  selected-object versus whole-scene scope, and a reversible preview boundary.
- Verify editor versions, command names, add-ons, and formats locally.

## Video AI

- Write a chronological shot: subject action, environment, camera, framing,
  lighting, style, temporal beats, audio, and end state.
- **Google video:** describe text/image input, audio intent, subject references,
  start/end frames, extension, and object edits. Resolve exact record and output
  limits in the registry.
- **Kling:** emphasize realistic body motion, camera angle, shot type, and
  labelled multi-shot timing. Put element/image/voice references, quality mode,
  duration, and guidance controls in setup.
- **Runway:** use cinematic language and film references. Distinguish generation
  from video-to-video edit; provide keyframes and a concise delta for editing.
- **Sora:** direct a film shot with explicit camera movement. Verify continued
  availability before recommending it for new work; verify character/likeness
  restrictions and extension limits through the registry.
- **LTX:** use a concise chronological shot and state audio, keyframe, extension,
  edit, or style-training intent without inventing format limits.
- **Luma Ray:** describe lens, lighting, grade, keyframes, and whether the task is
  generate, edit, or reframe; put depth/pose/trajectory controls in setup.
- **Seedance:** address multimodal references by their supplied labels; describe
  audio, first/last frame, and extension intent. Resolve tier-specific output
  controls through registry records.
- **Omni Flash:** use conversational generation/editing, one continuous scene
  when needed, labelled frame/reference roles, and timecoded beats. For edits,
  make a short delta plus “Keep everything else the same.”
- **Grok Imagine video:** state generation, first-frame animation, reference-led
  generation, edit, or extend mode. Use positive scene/motion constraints unless
  the registry verifies a negative field.
- Surface unprovided duration, resolution, aspect ratio, mode, and quality tier
  as setup assumptions. Load Template I; for conversational editing load the
  matching section of [templates.md](../templates.md).

## Voice AI (ElevenLabs)

- Specify emotion, pacing, emphasis, pauses, and speech rate directly.
- Use only markup verified for the selected voice provider; prose descriptions do
  not reliably replace explicit controls.
- This profile's voice guidance is limited to ElevenLabs. For another voice/TTS/
  STT provider, state the gap and consult its current registry sources; never
  transplant ElevenLabs markup.
