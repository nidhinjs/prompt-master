# GPT-5.6 agentic-coding routing note — 2026-07-10

## Status and scope

This is a dated maintainer research note integrated into the v1.35 release
candidate. It
captures a community benchmark interpretation by Sebastian Raschka; it is not
an OpenAI product contract or a universal model ranking.

Use the routing guidance only after the target surface is identified as Codex
or another comparable agentic-coding workflow. Do not transfer the UI labels or
the recommendations unchanged to ChatGPT, the OpenAI API, non-coding work, or a
different benchmark.

## Primary source

- Sebastian Raschka, X post, 2026-07-10:
  <https://x.com/rasbt/status/2075573860796436626/photo/1>
- Original chart image (4096 × 2731):
  <https://pbs.twimg.com/media/HM3raXqWkAAMqGb.jpg>
- The chart is Raschka's annotated interpretation of the GPT-5.6
  price/performance comparison for agentic coding.

The post recommends treating model tier and effort as one joint routing
decision. A larger model at a lower effort is not automatically the best value;
a smaller model at a higher effort can occupy the better quality/cost point.

## Author's routing interpretation

| Situation | Benchmark-informed default | Reasoning |
|---|---|---|
| The task does not require the performance point represented by Terra Ultra | Prefer Luna at a higher effort | Raschka reads the plotted Luna configurations as matching or exceeding the relevant alternatives at lower cost. |
| A candidate configuration is below Sol High | Compare against, and normally prefer, a higher-effort Luna configuration | Those Sol points are treated as dominated on this chart. |
| Sol Extra High is being considered | Prefer Terra Ultra as the first comparison/default | Raschka treats Terra Ultra as the better alternative at that quality region. |
| Sol Ultra is being considered | Start with Sol Max | The additional cost is unlikely to justify the plotted gain unless the user's own evaluation shows otherwise. |
| The user explicitly needs the highest relevant performance point, or the task is high-risk | Do not auto-downgrade | Run a representative evaluation and prioritize the measured quality requirement over the economy heuristic. |

This is a Pareto-style heuristic: avoid configurations that appear more
expensive without a compensating quality gain. It is not a claim that the same
ordering holds for every repository, latency target, tool loop, or evaluation.

## Required correction

Raschka later corrected the lower-left part of the chart: the Luna effort labels
are shifted by one position. In particular, the point shown as **Luna Ultra**
must be read as **Luna Max**. Any implementation or documentation derived from
the image must carry this correction; it must not preserve the erroneous label.

## How Prompt Master should use this

For a verified GPT-5.6 Codex/agentic-coding surface, Prompt Master should:

1. Resolve the available model and effort choices from the current registry or
   UI instead of copying volatile identifiers into the prompt body.
2. Treat model tier × effort as a joint choice and remove benchmark-dominated
   options from the recommendation set.
3. Return one recommended baseline and one explicit escalation condition, not a
   catalogue of every model/effort permutation.
4. Use the higher-effort Luna comparison for economy-oriented work, Terra Ultra
   when that plotted performance region is required, and Sol Max as the default
   challenge to an otherwise proposed Sol Ultra configuration.
5. Present the choice in a short recommendation immediately below the finished
   prompt (after the normal target line), never inside the copyable fence.
   Model/effort selection is a runtime setting, not prompt wording.
6. Label the result as benchmark-informed and dated. Tell the user to validate
   it on representative repository tasks when quality, latency, or spend is
   consequential.
7. Bypass the economy shortcut when the user requests the quality ceiling, the
   workload differs materially from the benchmark, or failure has high impact.

A concise post-prompt recommendation shape is:

> ⚙️ Recommended setup: **[model + effort]** — benchmark-informed value point
> for this agentic-coding workload. Escalate to **[configuration]** only if
> **[measured quality condition]** is not met.

Keep this to one or two lines. Omit it when the target surface or current model
facts cannot be verified; do not invent a recommendation merely to fill the
slot.

## Evidence boundaries

- The chart compares one agentic-coding benchmark snapshot; it does not establish
  universal dominance.
- Price, model behavior, effort labels, and UI semantics are volatile. Re-check
  them before release and whenever the source chart or product controls change.
- Lower per-token price does not guarantee lower cost per completed task. Tool
  calls, retry rate, token consumption, and completion quality still matter.
- Latency is not represented by the routing rule and must be evaluated
  separately when it is a user priority.
- OpenAI's GPT-5.6 materials can verify family positioning and supported product
  controls, but they do not make Raschka's complete cross-tier routing rule an
  official recommendation.

## v1.35 integration acceptance

- The coding-agent profile contains the joint model/effort and
  baseline-plus-escalation decision rule.
- The core output contract permits a one- or two-line `Recommended setup:` note
  below the finished prompt for verified model/effort routing.
- Exact GPT-5.6 facts and available controls remain registry-owned.
- ChatGPT guidance contains no Codex-only labels or API-only parameters.
- API guidance uses API values verified through OpenAI Developer Docs MCP, not
  Codex UI labels such as Ultra.
- A deterministic contract test preserves the Luna label correction and rejects
  an unqualified claim that the benchmark routing is universal.
- Release notes describe this as benchmark-informed routing, not live behavioral
  attestation.

## Official cross-checks

- OpenAI, GPT-5.6 launch: <https://openai.com/index/gpt-5-6/>
- OpenAI Developer Docs, latest-model guidance:
  <https://developers.openai.com/api/docs/guides/latest-model>
- OpenAI Developer Docs, GPT-5.6 prompting guidance:
  <https://developers.openai.com/api/docs/guides/prompt-guidance-gpt-5p6>
