# Hosted text and reasoning profiles

Load this bundle only when [tool-profiles.md](../tool-profiles.md) selects it as
the primary profile. It is usable without `SKILL.md`: preserve the user's goal,
inputs, constraints, output contract, and approval boundaries. For an agentic
task also apply [agentic.md](../agentic.md); for a concrete prompt shape load
only the needed section of [templates.md](../templates.md).

## Registry boundary

Before naming or recommending a model, resolve the route alias in
[facts/index.json](../facts/index.json), then read only its referenced provider
shard. The registry alone owns model IDs, defaults, release channels,
availability, retirement dates, context limits, and provider-specific parameter
values. If the selected record contains `no_cot`, ask for a final answer or
careful analysis without requesting hidden reasoning, a chain of thought, or a
thinking transcript. If the registry or route is missing, use
[decompiler-fallback.md](decompiler-fallback.md); never reconstruct facts from
memory.

For an explicitly research-heavy composite, add at most
[research-browser.md](research-browser.md). Image, video, and voice requests
route to [media.md](media.md), not this bundle.

## Claude (claude.ai and Claude API)

- Be explicit: state intent, relevant context, constraints, acceptance criteria,
  and output format up front; literal execution makes omitted scope important.
- Prevent overreach with “Only make changes directly requested; do not add
  features or refactor beyond the request.”
- For complex prompts, XML sections such as `<context>`, `<task>`,
  `<constraints>`, and `<output_format>` provide a stable grammar.
- Explain why a constraint matters when that helps the model generalize.
- Front-load multi-step work in one turn and point to attached source artifacts.
- Let the runtime select effort/depth. Use “Think carefully before responding”
  or “Prioritize responding quickly” as outcome-level steering, not a fixed
  reasoning budget.

## Claude frontier long-horizon profile

- Use only when the user explicitly selects the corresponding registry route;
  a bare vendor name must follow the registry default.
- State brief intent, outcome, boundaries, and evidence requirements. Avoid a
  wall of prescribed steps when the task needs exploration.
- Curb over-engineering: request the simplest sufficient change and validation
  only at system boundaries.
- Once enough evidence exists, act; do not re-litigate settled choices or narrate
  options that will not be pursued.
- Ground progress claims in current-session tool evidence. Report failed or
  unverified checks plainly.
- Pause only for destructive or irreversible work, a genuine scope change, or
  input only the user can provide.
- For delegated work, use bounded independent assignments and asynchronous
  progress; retain integration and verification with the coordinator.
- A notes file can improve repeated work: one lesson per entry, including the
  correction and why it mattered.
- Never ask the model to reproduce hidden reasoning. Use short user-visible
  progress updates for long runs.
- Give the larger purpose: who needs the result and what it enables.

## Claude Advisor Tool

- Use only for an explicitly requested bounded advisor inside a Claude API
  executor. The executor owns tools and delivery; the advisor supplies strategy,
  critique, diagnosis, or course correction.
- Good checkpoints are after orientation and, for high-stakes changes, after
  implementation. Avoid advisor overhead for single-turn Q&A or every-turn use.
- Send the advisor the problem, constraints, candidate plan, uncertainty, and
  evidence. Ask review findings to cite transcript/tool/file evidence, severity,
  and a concrete failure case; label speculation.
- Keep call limits, response budget, caching, and any beta fields in setup, using
  the current registry sources rather than prompt prose.
- Preserve advisor result blocks verbatim while the tool remains in history;
  remove the blocks if the tool is removed.
- Tell the executor to continue if the advisor errors or its use cap is reached.

## Claude Managed Agents (CMA / Plan Big Execute Small)

- Use only when explicitly targeted. A coordinator verifies premises, makes the
  high-level plan, and delegates small bounded work packages.
- Before fan-out, verify repository paths, data, access, user constraints, and
  subtask independence with cheap checks.
- The coordinator owns dependency order, worker selection, integration,
  conflicts, final verification, and the user-facing result.
- Each worker receives its task, scope, allowed resources, output schema, stop
  condition, and evidence contract; capabilities must match the assignment.
- Run independent work in parallel and sequential dependencies centrally. Limit
  fan-out to what can be synthesized reliably.
- Worker results include findings, artifacts, commands, evidence, risks, and
  `done`/`blocked`; important claims are rechecked before integration.
- Reserve a late correctness/diagnostic review for risky work. Treat hosted
  session topology and built-in tool names as registry-owned facts.

## OpenAI shared prompt body

- Use the smallest outcome-first prompt that reaches the goal: relevant context,
  result, success criteria, hard constraints, evidence, and stop condition once.
- Keep task-specific length, structure, tone, and required content in the prompt.
  Keep model, runtime depth, execution mode, caching, transport, and tool setup
  outside it.
- Define confirmation only for external, destructive, costly, or scope-expanding
  action; do not repeat approval language for safe in-scope work.
- Do not request hidden reasoning. Request the result, required evidence, and an
  explicit uncertainty or blocked report.

## ChatGPT Chat and Work

- Resolve Chat versus Work before model selection. Use Chat for conversation,
  brainstorming, answers, or short drafts; use Work for a substantial non-code
  deliverable using multiple sources, tools, files, or steps.
- Put model and execution choices only in `Recommended setup:`. The fenced prompt
  contains goal, inputs/sources, output contract, boundaries, and final check,
  never UI labels or API setup.
- For parallel Work, require at least two independent bounded workstreams, one
  consolidated synthesis, conflict handling, and a shared evidence contract. Do
  not promise exact worker count, nesting, topology, or per-worker models unless
  the selected record verifies that control.
- If independent workstreams exist, use the record's verified subagent mode. If
  the task is hard but sequential, use its deeper single-agent mode instead.
- Choose a `frontier` candidate for ambiguous, difficult, high-value, or polished
  work; a `general` candidate for everyday work; and a `fast`/`economy` candidate
  for clear repeatable work. Use only registry-eligible candidates and defaults.

## OpenAI API

- Keep the prompt body portable and outcome-focused. Put model, reasoning,
  verbosity, state, caching, tools, and other request controls in API setup.
- API multi-agent and programmatic tools are request/runtime capabilities, not
  ChatGPT Work modes. Use them only for a verified API record and explicit API
  target.
- `Recommended setup:` may summarize the selected record and controls. Do not
  generate client code or request schemas unless the user explicitly asks.

## OpenAI Responses Multi-agent (beta)

- Enable only for at least two independent bounded workstreams. Prefer one agent
  for ordered dependencies, a short task, fixed execution graphs, or shared
  mutable state.
- The root owns delegation, conflict resolution, evidence checks, and one final
  synthesis. Parallelize independent reads/analysis; serialize writes,
  integration, approvals, and external effects.
- Keep the beta header and request fields in registry-backed setup, outside the
  prompt. Agents in one request share its selected model and tools; do not promise
  heterogeneous workers.

## OpenAI reasoning models

- Apply this only to an API record selected by the OpenAI API route; it is not a
  ChatGPT UI or Codex configuration profile.
- Keep instructions short and clean: requested result, inputs, constraints, and
  what “done” means.
- Prefer zero-shot; add only tightly aligned examples when demonstrated useful.
- Do not dictate or request hidden reasoning. Apply any registry prompting
  constraints exactly.

## Grok / xAI text

- Select model and supported knobs through the registry; do not put a current
  model ID, endpoint, or parameter enum in the prompt body.
- For current facts, enable the verified search capability in request setup.
  Social-source retrieval and open-web retrieval serve different evidence needs.
- Apply domain, account, and date filters as request parameters, not prose, and
  surface assumed filters in a separate overridable setup note.
- Always define output structure and length. If absent, ask the decisive format
  question or state an explicit assumed format.
- With factual retrieval, require citations to sources actually retrieved and
  mark unsupported claims `[uncertain]`.
- Deep multi-source research is an explicit composite: retain this primary
  profile and load only [research-browser.md](research-browser.md) as add-on.
- Route Grok image/video requests to [media.md](media.md). Do not transplant a
  verified voice profile from another provider.

## Gemini text

- Use concise long-context and multimodal instructions with only relevant input.
- Require citations only to retrieved sources; label uncertainty and prohibit
  fabricated citations.
- For grounded work, require one citation per non-obvious claim and say “Base
  the response only on provided or retrieved context; do not extrapolate.”
- Lock strict formats with a labelled example and external validation.

## Kimi / Moonshot AI

- Resolve the selected surface, model, mode, search support, and tool-loop rules
  from the registry before producing setup guidance.
- For direct chat/extraction/classification, keep the prompt focused; for hard or
  agentic work, state the result and constraints without reasoning scaffolding.
- Pass tool schemas in the API tools field rather than narrating tool use in the
  system prompt. Preserve any provider-required reasoning/tool state verbatim
  across turns.
- If the verified search surface conflicts with the selected reasoning mode,
  split retrieval and analysis rather than claiming both in one call.
- For factual research, use the provider-native citation/credibility structure
  supported by the selected surface and distinguish confirmed facts, estimates,
  insights, and references.
- App-native swarm work receives one large decomposable task and final artifact;
  do not script an agent count. Do not conflate it with a separate researcher
  product or promise the same interface through an API.
- Treat plan access and product modes as prerequisites to verify, not assumed
  availability. Never silently derive the output format.

## Z.AI / BigModel GLM

- Preserve aliases such as GLM, Z.AI, Zhipu, BigModel, Coding Plan, and ZCode in
  routing; model/default resolution belongs to the registry.
- Enable the verified reasoning mode for hard coding/analysis; disable it for
  simple extraction/formatting. Keep sampling controls at verified settings.
- Use tool schemas and buffer streaming reasoning, final content, and tool-call
  argument deltas separately. Preserve provider-required state across turns.
- Agentic prompts still need scope, destructive-action stops, runnable checks,
  and evidence; use [agentic.md](../agentic.md).
- For JSON, combine the provider's structured-output control with an explicit
  schema and external validation.
- For search, apply the citation contract and verify the active surface.
  Do not mix general and coding endpoints or route visual input to a text-only
  surface.

## Qwen

- For instruct-style operation, use a clear role, focused task, explicit output
  contract, and JSON schema when appropriate.
- For a verified thinking mode, shorten the prompt and apply registry
  constraints; for non-thinking mode, use the fuller instruct structure.

## DeepSeek

- Resolve model, mode, effort, endpoints, and status solely from the registry.
- Use a reasoning mode for hard analysis/agentic work and a direct mode for
  extraction, classification, formatting, translation, or latency-sensitive
  work; never request hidden reasoning.
- In direct mode, system prompts and measured few-shot examples are available.
- Preserve provider-required assistant state after tool calls. For JSON, combine
  structured-output setup with an explicit prompt contract.
- For research, pair verified retrieval/RAG with the citation contract; do not
  imply a native deep-research agent unless the selected record supports it.

## MiniMax

- No current official registry record is available. Retain the user's target
  name, verify its active API surface and documentation, and do not reuse stale
  model names or settings from this compatibility heading.
- Until verified, use a generic role, goal, inputs, constraints, and output
  contract. Do not assume GPT compatibility, tool schemas, context size,
  reasoning tags, structured output, or sampling ranges.
- If current documentation cannot be checked, mark those capabilities
  `[unverified]` and apply [decompiler-fallback.md](decompiler-fallback.md).
