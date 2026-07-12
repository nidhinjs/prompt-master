# Media-generation patterns

Load this shard for image, video, deck, audio, or 3D prompt failures. Exact
syntax, supported controls, and capability values remain in profiles and facts.

<a id="pm-018-missing-native-negative-or-preservation-control"></a>
## PM-018 — Missing native negative or preservation control
**Applies when:** unwanted elements or protected attributes materially affect a media result.
**Failure:** exclusions are omitted or expressed through a mechanism the selected surface does not support.
**Repair:** use the selected media profile's verified negative, positive-steering, or preservation mechanism without inventing syntax.
**Do not apply when:** exclusions are unnecessary or naming the unwanted concept would increase its likelihood on that surface.
**Canonical owner:** [media profile](../profiles/media.md#shared-media-contract).
**Dependencies:** [facts registry](../facts/index.json).
**Related:** PM-019, PM-038, PM-049, PM-050.

<a id="pm-019-prose-sent-to-a-descriptor-or-flag-surface"></a>
## PM-019 — Prose sent to a descriptor or flag surface
**Applies when:** the selected media surface expects structured descriptors, role tags, fields, or verified flags.
**Failure:** conversational prose dilutes control or introduces unsupported parameters.
**Repair:** use the profile's evergreen grammar and only controls supported by the selected fact record.
**Do not apply when:** the surface is explicitly conversational and prose is its native control mechanism.
**Canonical owner:** [media profile](../profiles/media.md).
**Dependencies:** [facts registry](../facts/index.json).
**Related:** PM-018, PM-024, PM-038.

<a id="pm-047-unbounded-or-ungrounded-deck-brief"></a>
## PM-047 — Unbounded or ungrounded deck brief
**Applies when:** a slide or card generator lacks count, section structure, density, or source data.
**Failure:** the deck becomes overcrowded, generic, or fills evidence gaps with fabricated figures.
**Repair:** use the deck template with bounded card count, enumerated sections, density, and supplied data or explicit placeholders; keep UI-only controls outside the prompt.
**Do not apply when:** the task is freeform visual ideation rather than a factual deliverable.
**Canonical owner:** [Template O](../templates.md#template-o--deck--presentation-brief).
**Dependencies:** [builder profiles](../profiles/builders-workflows.md).
**Related:** PM-014, PM-015, PM-030, PM-048.

<a id="pm-049-consistency-task-on-an-unsupported-route"></a>
## PM-049 — Consistency task on an unsupported route
**Applies when:** identity, character, product, style, or brand continuity requires reference-aware generation.
**Failure:** a prose-only or unsupported route is expected to preserve reference identity.
**Repair:** select a record with verified reference support and provide inputs through the selected profile's native mechanism.
**Do not apply when:** continuity is unnecessary or no reference artifact exists and variation is acceptable.
**Canonical owner:** [facts registry](../facts/index.json).
**Dependencies:** [media profile](../profiles/media.md#image-ai--reference-editing).
**Related:** PM-018, PM-019, PM-038.

<a id="pm-050-full-redescription-instead-of-a-locked-video-delta"></a>
## PM-050 — Full re-description instead of a locked video delta
**Applies when:** an existing video or staged media artifact needs a localized edit.
**Failure:** full regeneration instructions re-open settled content and cause unrelated drift.
**Repair:** express the smallest direct delta, lock everything else, and identify reference inputs or time regions through the selected profile.
**Do not apply when:** the user requests a full regeneration or the surface cannot edit the existing artifact.
**Canonical owner:** [media profile](../profiles/media.md#video-ai).
**Dependencies:** [templates](../templates.md#conversational-video-editing).
**Related:** PM-018, PM-019, PM-020, PM-049.
