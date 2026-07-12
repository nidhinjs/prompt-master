# Routing-and-economics patterns

Load this shard for target-surface compatibility, model constraints, capability
composition, adjustable settings, lifecycle eligibility, and resource fit.

<a id="pm-024-wrong-template-for-tool"></a>
## PM-024 — Wrong template for tool
**Applies when:** the receiving surface has a materially different interaction or artifact contract.
**Failure:** a generic prose prompt omits required file, request, media, or agentic structure.
**Repair:** resolve the exact surface through the routing index, then use its profile-selected template.
**Do not apply when:** the prompt is portable and the target imposes no distinct structure.
**Canonical owner:** [tool profiles](../tool-profiles.md).
**Dependencies:** [templates](../templates.md).
**Related:** PM-014, PM-038, PM-046.

<a id="pm-027-adding-cot-where-the-registry-forbids-it"></a>
## PM-027 — Adding CoT where the registry forbids it
**Applies when:** a prompt requests visible or step-by-step reasoning for a selected record.
**Failure:** the prompt conflicts with the record's prompting constraints or asks for hidden reasoning disclosure.
**Repair:** remove incompatible process wording and request the result, evidence, and uncertainty allowed by the selected record.
**Do not apply when:** no reasoning cue is present or the selected record explicitly permits the requested behavior.
**Canonical owner:** [facts registry](../facts/index.json).
**Related:** PM-026, PM-038.

<a id="pm-038-hardcoded-model-default-status-or-parameter"></a>
## PM-038 — Hardcoded model, default, status, or parameter
**Applies when:** routing or setup relies on a copied identifier, lifecycle claim, default, limit, or control value.
**Failure:** volatile capability data becomes stale or is applied to the wrong surface.
**Repair:** resolve the exact route and selected record through the facts registry; fail closed when data is missing, stale, or ineligible.
**Do not apply when:** the value is user-provided input to preserve rather than a current capability claim.
**Canonical owner:** [facts registry](../facts/index.json).
**Related:** PM-024, PM-027, PM-046, PM-048, PM-051.

<a id="pm-046-incompatible-capabilities-demanded-together"></a>
## PM-046 — Incompatible capabilities demanded together
**Applies when:** one requested operation combines controls or capabilities that the selected surface cannot use simultaneously.
**Failure:** the request errors, silently drops one capability, or produces an unverifiable partial result.
**Repair:** verify compatibility in the selected profile and facts; when separable, sequence capability-specific phases and pass only the needed evidence forward.
**Do not apply when:** the selected record verifies simultaneous operation or sequencing would change the required semantics.
**Canonical owner:** [tool profiles](../tool-profiles.md).
**Dependencies:** [facts registry](../facts/index.json).
**Related:** PM-002, PM-024, PM-038.

<a id="pm-048-silent-adjustable-setting"></a>
## PM-048 — Silent adjustable setting
**Applies when:** the skill chooses an adjustable setting the user did not specify.
**Failure:** a hidden default changes quality, cost, breadth, or latency and forces a re-prompt to discover the lever.
**Repair:** expose only defaulted settings in the skill-owned `Assumed settings:` note, with registry/profile-backed values and where to change them.
**Do not apply when:** the user set the value or the surface exposes no relevant adjustable control.
**Canonical owner:** [SKILL.md](../../SKILL.md).
**Dependencies:** [tool profiles](../tool-profiles.md) and [facts registry](../facts/index.json).
**Related:** PM-038, PM-051, PM-060.

<a id="pm-051-defaulting-to-an-ineligible-record"></a>
## PM-051 — Defaulting to an ineligible record
**Applies when:** a route selects an ordinary or latest model without explicit legacy or preview intent.
**Failure:** a non-production, stale, unavailable, deprecated, or sunsetting record becomes the silent default.
**Repair:** apply registry eligibility and freshness rules; retain an explicitly requested legacy route only after surfacing its verified status.
**Do not apply when:** the user explicitly requests an eligible non-default lifecycle channel and accepts its constraints.
**Canonical owner:** [facts registry](../facts/index.json).
**Related:** PM-038, PM-048.
