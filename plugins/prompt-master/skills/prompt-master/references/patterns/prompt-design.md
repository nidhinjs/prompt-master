# Prompt-design patterns

Load this shard for task definition, output shape, scope, audience, compatible
reasoning cues, and exploration strategy. Provider-specific syntax belongs to
profiles and facts.

<a id="pm-001-vague-task-verb"></a>
## PM-001 — Vague task verb
**Applies when:** the requested action cannot be distinguished from adjacent operations.
**Failure:** a broad verb leaves the target free to choose a different task than the user intended.
**Repair:** replace it with one observable operation, named input, and bounded target; preserve deliberate exploration as open-ended.
**Do not apply when:** discovery or critique is itself the requested operation.
**Canonical owner:** patterns.
**Related:** PM-003, PM-020, PM-036.

<a id="pm-002-two-tasks-in-one-prompt"></a>
## PM-002 — Two tasks in one prompt
**Applies when:** distinct dependent operations have separate outputs or success conditions.
**Failure:** one response conflates execution order, evidence, or completion for both tasks.
**Repair:** split them into self-contained sequential prompts with required carry-forward state and checks between steps.
**Do not apply when:** the operations are inseparable parts of one atomic deliverable.
**Canonical owner:** [templates.md](../templates.md).
**Related:** PM-006, PM-041.

<a id="pm-005-emotional-task-description"></a>
## PM-005 — Emotional task description
**Applies when:** urgency or frustration substitutes for a reproducible problem statement.
**Failure:** the target guesses the fault and expands scope to match the emotion.
**Repair:** retain the priority but state the observed behavior, trigger, location, and expected behavior.
**Do not apply when:** the emotion is source material for a creative or support-oriented task.
**Canonical owner:** patterns.
**Related:** PM-001, PM-003.

<a id="pm-006-build-the-whole-thing"></a>
## PM-006 — Build the whole thing
**Applies when:** one prompt asks for a multi-stage system without reviewable increments.
**Failure:** scope, dependencies, and validation become unbounded and failures cannot be localized.
**Repair:** sequence bounded deliverables with explicit dependencies and a pass/fail gate after each meaningful increment.
**Do not apply when:** the artifact is genuinely small, atomic, and verifiable in one pass.
**Canonical owner:** [templates.md](../templates.md).
**Related:** PM-002, PM-020, PM-061.

<a id="pm-012-undefined-audience"></a>
## PM-012 — Undefined audience
**Applies when:** comprehension, persuasion, or tone depends on who receives the output.
**Failure:** the target invents expertise, vocabulary, and decision context.
**Repair:** name the audience, relevant knowledge, purpose, and reading situation.
**Do not apply when:** audience cannot materially change the requested artifact.
**Canonical owner:** patterns.
**Related:** PM-009, PM-015, PM-017.

<a id="pm-014-missing-output-format"></a>
## PM-014 — Missing output format
**Applies when:** multiple materially different output shapes would satisfy the task.
**Failure:** the response is correct in content but unusable in the receiving workflow.
**Repair:** specify or surface the output shape using the skill's question-and-assumption policy.
**Do not apply when:** the receiving interface already enforces one unambiguous format.
**Canonical owner:** [SKILL.md](../../SKILL.md).
**Related:** PM-003, PM-015.

<a id="pm-015-implicit-length"></a>
## PM-015 — Implicit length
**Applies when:** length affects usability, cost, or acceptance.
**Failure:** vague brevity or completeness language produces arbitrary volume.
**Repair:** set a measurable bound appropriate to the artifact, such as sections, items, words, or duration.
**Do not apply when:** the format has a fixed natural size or truncation would harm correctness.
**Canonical owner:** patterns.
**Related:** PM-014, PM-039, PM-055.

<a id="pm-016-unconditional-role-assignment"></a>
## PM-016 — Unconditional role assignment
**Applies when:** specialized judgment would benefit from a domain lens or explicit responsibility.
**Failure:** a generic or decorative persona adds tokens without changing decisions or output quality.
**Repair:** add a specific role only when it contributes relevant expertise, priorities, or authority boundaries.
**Do not apply when:** the task is simple transformation, extraction, formatting, or direct execution.
**Canonical owner:** patterns.
**Related:** PM-001, PM-012, PM-041.

<a id="pm-017-vague-aesthetic-adjectives"></a>
## PM-017 — Vague aesthetic adjectives
**Applies when:** subjective labels stand in for observable design or writing attributes.
**Failure:** the target guesses what words such as polished or professional mean.
**Repair:** translate the label into concrete composition, tone, hierarchy, density, motion, or exclusion criteria.
**Do not apply when:** open exploration is intentional and candidates will be compared before commitment.
**Canonical owner:** patterns.
**Related:** PM-039, PM-056.

<a id="pm-020-no-scope-boundary"></a>
## PM-020 — No scope boundary
**Applies when:** the target can inspect or change more than the task requires.
**Failure:** exhaustive scanning or full regeneration increases cost and creates unrelated changes.
**Repair:** name the smallest relevant artifact, region, and requested delta; expand only when evidence shows the boundary is insufficient.
**Do not apply when:** repository-wide discovery is the explicit goal and its breadth is justified.
**Canonical owner:** patterns.
**Related:** PM-006, PM-023, PM-025, PM-034, PM-041.

<a id="pm-026-incompatible-private-work-cue"></a>
## PM-026 — Incompatible private-work cue
**Applies when:** a logic, math, or debugging task may benefit from private scratch work.
**Failure:** a reasoning cue is added without checking whether the selected record forbids or supersedes it.
**Repair:** apply a brief private-work cue only when the selected fact record permits it; request outcomes and evidence, not hidden reasoning.
**Do not apply when:** the task is direct or the record carries an incompatible prompting constraint.
**Canonical owner:** [SKILL.md](../../SKILL.md).
**Dependencies:** [facts registry](../facts/index.json).
**Related:** PM-027, PM-038.

<a id="pm-036-vague-first-turn-on-a-named-model"></a>
## PM-036 — Vague first turn on a named model
**Status:** merged; redirect to PM-001.
**Applies when:** resolving a legacy `pattern #36` reference.
**Failure:** the former rule attached universal prompt requirements to a volatile model comparison.
**Repair:** redirect to PM-001; use PM-003 for acceptance evidence and PM-020 for scope.
**Do not apply when:** diagnosing new work directly; this tombstone is not active guidance.
**Canonical owner:** patterns (merged compatibility tombstone).
**Related:** PM-001, PM-003, PM-020.

<a id="pm-039-vague-qualifier"></a>
## PM-039 — Vague qualifier
**Applies when:** a qualifier such as concise, clean, or robust changes acceptance but is not measurable.
**Failure:** the target chooses an arbitrary interpretation that cannot be reviewed consistently.
**Repair:** convert the qualifier into one or more observable constraints relevant to the artifact.
**Do not apply when:** the qualifier is intentionally exploratory and PM-056 supplies a comparison step.
**Canonical owner:** patterns.
**Related:** PM-015, PM-017, PM-056.

<a id="pm-041-over-engineered-or-scope-creep-prompt"></a>
## PM-041 — Over-engineered or scope-creep prompt
**Applies when:** instructions include contingencies, safeguards, or features unrelated to the stated result.
**Failure:** extra constraints obscure priority, increase cost, and invite unrequested work.
**Repair:** keep only task-required constraints and surface useful out-of-scope observations after the prompt.
**Do not apply when:** the added constraint enforces a real safety, compatibility, or acceptance requirement.
**Canonical owner:** [SKILL.md](../../SKILL.md).
**Related:** PM-006, PM-020, PM-055.

<a id="pm-056-undrainable-taste-or-domain-unknown"></a>
## PM-056 — Undrainable taste or domain unknown
**Applies when:** the user can recognize but not specify a preference, or lacks the domain map needed to answer a clarifying question.
**Failure:** abstract questions consume the question budget without reducing uncertainty, then a one-shot build locks the wrong direction.
**Repair:** branch by unknown type. For taste or recognize-not-specify work, use prototype-first with exactly 3 genuinely divergent directions, each labeled `Fit`, `Risk / tradeoff`, and `When to use`. For an unfamiliar domain or codebase, use a blindspot inventory of unknowns, assumptions, risks, evidence gaps, and verification questions; do not force variants or candidate directions.
**Do not apply when:** the user can state a decisive known fork or the task is already fully specified.
**Canonical owner:** [SKILL.md](../../SKILL.md).
**Related:** PM-017, PM-039, PM-041.
