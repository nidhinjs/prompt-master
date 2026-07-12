# Research-and-evidence patterns

Load this shard for factual grounding, retrieval freshness, source attribution,
and bounded research briefs. Surface-specific citation syntax stays in profiles.

<a id="pm-011-evidence-free-factual-claim"></a>
## PM-011 — Evidence-free factual claim
**Applies when:** reviewing or repairing an already-produced answer whose factual claims depend on external reality.
**Failure:** the completed output presents confidence, familiar phrasing, or unsupported claims as evidence.
**Repair:** audit the output claim by claim against retrieved or supplied evidence; remove, qualify, or mark unsupported claims uncertain and state each material evidence gap.
**Do not apply when:** no factual output exists yet; define the pre-execution evidence contract with PM-030 instead, or omit this pattern for creative, transformative, or explicitly hypothetical work.
**Canonical owner:** patterns.
**Related:** PM-030, PM-044, PM-045.

<a id="pm-030-no-grounding-rule-for-factual-tasks"></a>
## PM-030 — No grounding rule for factual tasks
**Applies when:** before execution, a factual or research prompt does not define what evidence may support the answer.
**Failure:** the task contract permits unverifiable recollection, generated citations, and inference to enter the output without distinction.
**Repair:** define the allowed supplied or retrieved evidence, claim-to-source traceability, treatment of inference, and required handling of unsupported claims and data gaps before the task runs.
**Do not apply when:** auditing an already-produced answer, which belongs to PM-011, or when the receiving workflow already enforces an equivalent evidence contract.
**Canonical owner:** patterns.
**Related:** PM-011, PM-043, PM-045.

<a id="pm-043-vague-or-unbounded-research-brief"></a>
## PM-043 — Vague or unbounded research brief
**Applies when:** a research request lacks a decision goal, aspects, boundary, output contract, or justified source/result cap.
**Failure:** retrieval drifts, accumulates sources indefinitely, or returns an arbitrary survey.
**Repair:** use the research brief template with goal, enumerated questions, scope, bounded outputs, evidence standard, and data-gaps section; use best-effort assumptions rather than rejecting vagueness, and surface only material scope expansion as an approval fork.
**Do not apply when:** the task is a simple fact lookup with an already clear answer shape.
**Canonical owner:** [Template N](../templates.md#template-n--research-brief).
**Related:** PM-014, PM-015, PM-030, PM-044, PM-055.

<a id="pm-044-live-fact-request-without-retrieval"></a>
## PM-044 — Live fact request without retrieval
**Applies when:** the answer depends on current or post-cutoff information.
**Failure:** stale training knowledge or guesswork is presented as current evidence.
**Repair:** use an available, authorized retrieval capability selected through profiles and facts; otherwise state the limitation and do not claim freshness.
**Do not apply when:** the user supplies a complete current dataset or the task is historical and within verified sources.
**Canonical owner:** [research profile](../profiles/research-browser.md#shared-research-contract).
**Dependencies:** [facts registry](../facts/index.json).
**Related:** PM-011, PM-043, PM-045.

<a id="pm-045-missing-provider-native-citation-contract"></a>
## PM-045 — Missing provider-native citation contract
**Applies when:** a factual retrieval task requires auditable attribution.
**Failure:** claims lack traceable source evidence, or citation instructions conflict with the receiving surface's output channel.
**Repair:** use the selected profile's native attribution path and domain-appropriate source hierarchy, require claim-to-source traceability, and mark unsupported claims without substituting confidence for evidence.
**Do not apply when:** the task is creative, code-only, transformation-only, or uses no retrieval.
**Canonical owner:** [research profile](../profiles/research-browser.md#shared-research-contract).
**Related:** PM-011, PM-030, PM-043, PM-044.
