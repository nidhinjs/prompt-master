# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.37.0] - 2026-07-12

Portable Verification and Historical Provenance release: Windows and Ubuntu
now execute the same strict offline gate, while the published v1.29 asset has a
machine-validated record that distinguishes source parity from ZIP-container
reproducibility.

### Added
- **Cross-platform Node fake runner:** the candidate safe harness launches its
  scenario fake as absolute `process.execPath + script`, records redacted
  hashes instead of prompts, preloads direct- and shell-call guards, and makes
  inert POSIX/Windows sentinels the entire temporary PATH as an independent
  fallback.
- **Historical provenance record:** JSON Schema, an exact v1.29 release-asset
  record, a dependency-free tag/ZIP validator, and 41 positive/adversarial
  tests verify tag objects, blobs, archive inventory, decompressed bytes, and
  SHA-256 values without network access.
- **Portable verification contracts:** source assertions require the absolute
  Node scenario fake, both guard-only PATH sentinels, per-check timeouts, pinned
  runners, historical tags, and zero CI live opt-ins.
- **v1.38 implementation contract:** a Claude-first release plan freezes the
  v1.26.3 behavioral baseline, heterogeneous Codex roles, eval-before-edit
  method, runtime ownership, E2E scenarios, acceptance IDs, and live/release
  authorization boundaries.

### Changed
- Ubuntu 24.04 and Windows 2025 share one `test-safe.js --strict` matrix job
  with identical required-count semantics and historical tags available for
  provenance validation; macOS retains the clean-checkout Codex layout check.
- Model-response fixtures and timeout simulation no longer depend on a shell or
  `/bin/sleep`; minimal POSIX/Windows PATH sentinels remain solely as the
  policy-required fallback. Production/default resolution in `run-golden.js`
  remains the literal `claude` command.
- Golden-suite summaries now reconcile `planned`, `executed`, `passed`,
  `failed`, and `not_run`; a suite timeout cannot count unexecuted scenarios as
  passes.
- The v1.29 finding is corrected: all five published ZIP entries are
  byte-identical to the tag. Only exact container reproducibility is
  `not_attested`; the conflicting six-file ZIP was an ignored local rebuild,
  not the GitHub Release asset. The annotated historical tag is explicitly
  recorded as unsigned.

### Security
- Normal CI strips every live/fake opt-in, forces `NO_LIVE_MODEL_CALLS=1`, and
  fails on any blocked real-Claude marker, skipped check, timeout, environment
  failure, assertion failure, malformed provenance, or count mismatch.
- Sensitive environment keys are removed case-insensitively. The preload guard
  denies Node shell APIs, `shell:true`, and direct shell `-c`/`/c` Claude
  commands; eight harmless-fixture probes, including omitted-args overloads,
  prove the target is never executed.
- Runtime prompt behavior is unchanged. The repository changes verification,
  provenance, and the future v1.38 implementation contract; no real Claude or
  other model runner is part of the release gate.

## [1.36.0] - 2026-07-12

Pattern Registry and Diagnostic Sharding release: Prompt Master now resolves
61 stable diagnostic IDs through a machine-readable registry and loads only the
one or two failure-family shards needed for the current prompt.

### Added
- **Versioned pattern registry:** JSON Schema and an indexed compatibility map
  preserve 60 active patterns plus the merged `PM-036` tombstone across nine
  bounded, provider-neutral Markdown shards.
- **Fail-closed validation:** dependency-free validation covers IDs, legacy
  mappings, families, owners, redirects, paths, anchors, section contracts,
  router counts, shard budgets, and runtime-package inventory.
- **Adversarial offline coverage:** 47 registry mutations, recorded routing
  contracts, legacy resolution, semantic source contracts, and package parity
  checks run inside the strict safe gate.
- **Runner deny shim:** the safe coordinator prepends isolated POSIX and Windows
  Claude deny launchers, fixes child working directories to the repository, and
  fails if an invocation marker appears.

### Changed
- `references/patterns.md` is now a short compatibility router. Generic
  diagnosis loads `prompt-design.md`; an explicitly composite diagnosis may
  load one additional shard, never the whole catalog.
- Research guidance separates pre-execution evidence contracts from post-output
  claim audits and uses traceability, authority, quality, conflict, freshness,
  and explicit inference instead of model self-confidence.
- Retry, deviation, approval, sensitive-data, prototype/blindspot, premise
  verification, delegation, review, cost, and context-health rules now have one
  canonical owner and consistent exceptions across SKILL, profiles, templates,
  and patterns.
- Public metadata is pattern-count-free; README and installation documentation
  expose the exact stable/active/tombstone contract and routed shard layout.

### Security
- Autonomous deviations remain reversible, in scope, and below authority,
  cost, risk, policy/security, and external-impact thresholds; models and
  workers cannot self-approve boundary expansion.
- Artifact transfer minimizes context and redacts secrets, credentials, PII,
  customer/production data, confidential business content, and unrelated
  sensitive fields before prompts, logs, memory, review, or worker packets.
- Release verification remains deterministic and offline. No real Claude,
  Codex, OpenAI, or other model runner is part of the release gate.

## [1.35.0] - 2026-07-11

GPT-5.6 surface-aware prompt and routing release: Prompt Master now resolves
ChatGPT Chat/Work, Codex, and OpenAI API before choosing a model or execution
mode, then keeps the verified setup outside the paste-ready prompt.

### Added
- **GPT-5.6 canonical facts:** separate production API, ChatGPT app, and Codex
  records for Sol, Terra, and Luna, plus a separately lifecycle-managed
  Responses Multi-agent beta capability record attached to its model route.
- **Surface-first authoring:** ambiguous OpenAI-family requests resolve Chat,
  Work, Codex, or API before model/mode selection; `no questions` exposes an
  `Assumed surface:` and the remaining fork.
- **Model and mode router:** frontier, balanced, and repeatable/high-volume work
  select registry-eligible tiers; independent workstreams may use the verified
  subagent mode, while hard sequential work stays on a deeper single agent.
- **Post-prompt recommendation:** one short `Recommended setup:` note carries the
  selected surface, model/mode, fit reason, and control location outside the
  single copyable prompt fence.
- **Deterministic coverage:** source contracts, production-registry assertions,
  golden scenarios, and positive/negative offline fixtures cover surface order,
  tier choice, Ultra-versus-Max semantics, API setup, and prompt-boundary leaks.

### Changed
- Explicit OpenAI API and reasoning routes now default to the verified GPT-5.6
  flagship API record; bare `gpt`, `openai`, and model-family aliases require
  surface resolution. GPT-5.5 remains reachable for compatibility.
- ChatGPT Work, Codex, and Responses API use separate profile routes. UI labels,
  Codex configuration, and API request fields no longer share one generic GPT
  profile path.
- Coding-agent economy guidance now challenges expensive configurations with
  dated representative comparisons instead of treating the largest tier or
  multi-agent fan-out as automatically optimal.

### Security
- Multi-agent execution requires independent bounded work packages. Writes,
  integration, approvals, and external effects remain serialized and owned by
  the coordinator.
- API-only controls cannot leak into ChatGPT prompts, beta capabilities cannot
  become defaults, and no model or reviewer may self-approve external or
  destructive work.
- Verification remains offline and deterministic; no live Claude, Codex, or
  OpenAI model execution is part of the release gate.

## [1.34.0] - 2026-07-11

Codex discovery and distribution release: the Claude-origin Prompt Master skill
now has Codex repository and installed-plugin entry points while both hosts load
one canonical runtime tree.

### Added
- **Codex repository discovery:** a thin `.agents/skills/prompt-master` locator
  loads the canonical tracked skill without copying runtime rules or references.
- **Codex plugin manifest:** `.codex-plugin/plugin.json` exposes the existing
  skill tree with validated publisher, interface, and `./skills/` metadata.
- **Cross-surface verification:** offline layout and hook suites cover locator
  resolution, runtime hashes, malformed layouts, Claude/Codex hook parity, and
  optional-hook behavior without a live model.
- **Host-specific installation guidance:** Codex repository/plugin modes,
  `$prompt-master`, duplicate avoidance, disable/update flows, and hook trust are
  documented separately from Claude Code and Claude.ai installation.

### Changed
- **Windows-safe discovery:** a clean Git for Windows checkout proved directory
  symlinks degrade to plain files under the default configuration, so repository
  discovery uses the roadmap's thin-locator fallback.
- **Codex-compatible skill metadata:** canonical and locator `SKILL.md`
  frontmatter use only `name` and `description`; release version parity is now
  enforced across the Claude and Codex plugin manifests, changelog, docs, tag
  context, and artifact name.
- **Version tooling:** lint, safe-gate, and version-bump contracts understand both
  plugin manifests while the deterministic Claude skill ZIP remains sourced from
  the unchanged tracked runtime manifest.

### Security
- Plugin hooks remain byte-identical, advisory, and optional. Codex may skip the
  non-managed `UserPromptSubmit` hook until the user reviews and trusts it; core
  skill discovery and prompt generation do not depend on hook execution.
- No real Claude or Codex model execution is enabled by normal CI or the offline
  release gate.

## [1.33.0] - 2026-07-10

Canonical-facts and progressive-disclosure release: volatile provider/model
claims now live in one validated registry, while prompt guidance is routed
through seven bounded workflow profiles instead of one monolithic catalog.

### Added
- **Canonical facts registry:** a frozen JSON schema, one routing/default index,
  18 populated provider shards, 98 sourced records, and explicit production,
  preview, beta, legacy, deprecated, retired, and availability states.
- **Profile sharding:** seven self-contained bundles cover hosted/local text,
  coding agents, research/browser work, builders/workflows, media, and
  decompiler/fallback routing.
- **Fail-closed validation:** registry mutation tests cover malformed enums,
  duplicate IDs/defaults, stale gated records, invalid production/latest
  selection, orphan routes/shards/records, link and reachability failures, and
  tracked runtime inventory drift.
- **Migration evidence:** every legacy `models.md` line and every volatile
  `tool-profiles.md` line is classified against a registry record, route,
  replacement, or explicit unsupported removal.

### Changed
- **Progressive disclosure:** a simple request loads one primary workflow
  profile and the selected provider shard; only explicit composite work may
  load one add-on profile.
- **Compatibility indexes:** `models.md` and `tool-profiles.md` now preserve
  navigation and routing policy without duplicating active IDs, defaults,
  channel/availability assertions, status dates, or the exact no-CoT set.
- **Tracked packaging:** the release ZIP is built from an exact runtime manifest
  rather than a hardcoded six-file list, while preserving normalized timestamps,
  source parity, deterministic SHA-256 output, and safe dirty-tree behavior.
- **Freshness corrections:** stale or unsupported provider claims are removed or
  replaced only after official-source verification; unsupported facts are not
  converted into fabricated registry entries.

### Security
- Safe CI remains fully offline and now includes registry/migration adversarial
  tests. No live Claude execution is enabled by this release.

## [1.32.0] - 2026-07-10

Deterministic routing and fallback release: conflicting question, output, variant, split, and retry rules now resolve through one precedence contract, while unknown tools and missing references fail safely without invented provider capabilities.

### Added
- **Canonical precedence and fallback contract:** security/approval wins first, explicit `no questions` means zero questions, and missing targets/formats are surfaced as explicit assumptions.
- **Unknown-tool capability fingerprint:** seven required fields distinguish targetless requests, named unknown tools, and missing/unreadable references; unsupported claims are marked `[unverified]`.
- **Release provenance controls:** CI actions and Node are pinned, workflow permissions are read-only, packaging uses an exact six-file allowlist, rejects dirty release uploads, normalizes ZIP timestamps, and emits SHA-256.
- **Deterministic contract coverage:** offline scenarios and source assertions cover cardinality, split, retry exhaustion, activation/fallback, hook context, release policy, and adversarial negation without live model calls.

### Changed
- **Variants and split:** N=2/3 returns exactly N variants, requests above three are capped visibly, high-risk work suppresses variants, and split mode emits sequential self-contained `Prompt 1..N` entries inside one fence.
- **Retry budget:** all agentic templates use three total execution slots: the initial attempt plus two retries, followed by evidence-backed escalation.
- **Agentic supply chain:** dependency installs require scope/approval, a frozen lockfile, default-denied lifecycle scripts, and no networked install in read-only/no-network work.
- **Multi-agent hook:** authoring intent is narrower and injected context now covers worker isolation, untrusted results, coordinator verification, serialized writes, and the vendor-managed swarm carve-out.

### Fixed
- **Offline assertion oracle:** negation is sentence/clause-local, recognizes English and Russian forms including `should not`, and malformed/empty/duplicate scenario definitions fail closed.
- **Documentation integrity:** corrected the three broken historical links to `docs/sources.md`.
- **Signed release tags:** `bump-version.ps1 -Tag` now creates a cryptographically signed tag and verifies it instead of creating only an annotated tag.

## [1.31.1] - 2026-07-10

Security and provider-contract patch: safe verification now fails closed, agentic prompts treat all runtime observations as untrusted data, and Sonar/Midjourney/Grok routes follow their provider-native capabilities.

### Added
- **Canonical agentic trust boundary:** repo files/diffs, issue and PR comments, logs, dependency metadata, web content, MCP/tool output, and worker messages are data only and cannot expand scope, tools, network destinations, or approval.
- **Network egress contract:** agentic prompts default to no network and require destination-purpose allowlists, preconfigured runtime authentication, and secret non-transmission when access is enabled.
- **Deterministic contract coverage:** source contracts plus 51 unique golden scenarios and 22 offline fixtures cover indirect injection, Template L redaction, Sonar citations, Midjourney Omni routing, and Grok constraints without live model calls.

### Changed
- **Prompt Decompiler safety:** Template L uses a redacted structural summary instead of reproducing the original prompt, secret literals, or hostile directives.
- **Provider-native research:** Sonar clients read top-level `citations` and `search_results`; prompts keep Data gaps/confidence and no longer request inline URLs or a prose sources list.
- **Image routing:** ordinary Midjourney generation remains V8.1, while `--oref`/`--ow` explicitly route to V7 Omni Reference; Grok Imagine uses positive preservation wording and no Negative Prompt field.

### Fixed
- **Fail-closed safe gate:** `scripts/test-safe.js` now returns success only when every required check executes and passes; EPERM, missing executables, reported skips, spawn errors, and an empty gate are failures.
- **Fake-runner isolation:** safety tests pass an absolute temporary fake executable and isolate `PATH`, preventing fallback to a real Claude CLI.
- **CI regression signal:** strict offline CI runs self-tests, source contracts, hook fixtures, lint, syntax, offline golden assertions, and fake-runner safety checks with an explicit executed/passed/failed/skipped summary.

## [1.31.0] - 2026-07-10

Candidate/variants release: explicit alternative requests can return bounded prompt directions while the default output remains one prompt.

### Added
- **Candidate / variant set fragment:** `templates.md` now documents the opt-in one-fence candidate shape with `Fit`, `Risk / tradeoff`, and `When to use` labels.
- **Regression coverage:** golden scenarios cover explicit variants, not-default behavior, prototype-first candidate directions, high-risk suppression, single-fence Midjourney variants, and no-CoT preservation for reasoning-native targets. `scripts/lint.js` now requires those IDs and guards candidate/runtime/public-doc drift.
- **Safe verification gate:** `scripts/test-safe.js` is now the local/CI entrypoint for hook fixtures, lint, syntax checks, offline golden assertion fixtures, and fake-Claude runner safety tests without calling the real Claude CLI.
- **Offline golden assertion fixtures:** `scripts/golden-assertions.js`, `scripts/test-golden-regex.js`, and `tests/golden/offline-fixtures.json` cover regex/root-cause regressions without live model calls.
- **Fake-Claude runner safety tests:** `scripts/test-run-golden-safe.js` validates opt-in guards, bounded live-call budgets, timeout classification, env-error classification, and assertion-failure reporting through a temporary fake `claude` binary.
- **Maintainer rationale:** `docs/sources.md` records the bounded candidate-set adaptation and the rejected overclaim surface.

### Changed
- **Runtime output contract:** `SKILL.md` keeps the default as one paste-ready prompt in one fenced block, with variants only on explicit request or pattern #56 prototype-first.
- **High-risk handling:** `agentic.md` blocks divergent executable variants for R5/R6 work and routes alternatives to draft-only comparison with approval gates.
- **Public docs synchronized:** README EN/RU now describe explicit alternatives without changing the default one-prompt contract.
- **CI safety:** GitHub Actions now runs `node scripts/test-safe.js` instead of ad hoc checks, keeping live Claude eval out of the automated release gate.

### Fixed
- **Live Claude runner guardrail:** `scripts/run-golden.js` now refuses to call `claude -p` unless `PROMPT_MASTER_ALLOW_CLAUDE_RUNNER=1` is set, refuses full-suite live eval without a second `PROMPT_MASTER_ALLOW_FULL_GOLDEN=1` opt-in, supports `--max-scenarios`, and classifies live-runner failures as `ENV_ERROR`, `TIMEOUT`, `MODEL_ERROR`, or `ASSERT_FAIL`.
- **Safe-gate drift guard:** `scripts/lint.js` now rejects runnable live-Claude commands in safe docs/CI gates so `scripts/run-golden.js` cannot silently become a normal test again.

## [1.30.0] - 2026-07-09

Agentic runtime safety release: вынесен отдельный decision layer для риск-классификации, approval boundaries и multi-agent escalation без раздувания `SKILL.md`.

### Added
- **Agentic runtime safety reference:** новый `references/agentic.md` задает Risk Ladder R0-R6, Intent Flags, Preview/Draft/Commit split, Policy/Owner Reviewer, No Model Self-Approval, Single-Agent Default и Routing Map.
- **Runtime routing hook:** `SKILL.md` теперь направляет tool-using / side-effect / delegation / async prompts в `references/agentic.md`, оставляя `SKILL.md` компактным router layer.
- **Regression coverage:** `scripts/lint.js` проверяет `agentic.md`, обязательные headings/core anchors, ссылку из `SKILL.md` и новые golden IDs. Golden suite расширен 5 agentic-сценариями: prod delete/no questions, DB preview before drop, policy reviewer before execution, no model self-approval и draft/commit split.
- **Research traceability:** `docs/prompt-master-agentic-architecture-research.md` фиксирует implementation roadmap v1/v2/v3, а `docs/sources.md` объясняет отделение runtime safety layer от prompt templates.

### Changed
- **Repo hygiene:** `external/` добавлен в `.gitignore` и исключен из recursive text lint, чтобы локальные research clones не попадали в staging/lint/release scope.
- **Release packaging verified:** `scripts/package-skill.ps1` включает новый `references/agentic.md` в `dist/prompt-master-1.30.0.zip` вместе с остальными shipped references.

## [1.29.0] - 2026-07-09

GLM/Z.AI release: добавлен first-class routing для GLM-5.2 / Z.AI / BigModel с reasoning-native thinking mode, tool-loop runtime rules и release-gate покрытием.

### Added
- **Z.AI / BigModel GLM model facts:** `models.md` теперь содержит датированный раздел для GLM-5.2 (`glm-5.2`), GLM-4.6, GLM-V/Z1 соседних вариантов, 1M context, 128K output, `reasoning_effort`, `reasoning_content`, Preserved Thinking / `clear_thinking`, `tool_stream`, `response_format` и endpoint split.
- **GLM tool profile:** `tool-profiles.md` получил routing row + профиль для GLM, Z.AI, Zhipu, BigModel, chat.z.ai, GLM Coding Plan и ZCode. Bare `GLM` роутится в GLM-5.2.
- **Runtime no-CoT coverage:** canonical no-CoT list и Template E теперь включают `GLM thinking mode`; SKILL Gotcha добавляет short-form guard для GLM tool loops и endpoint hygiene.
- **Regression coverage:** `scripts/lint.js` получил GLM coverage guard; golden suite расширен 6 GLM-сценариями: no-CoT, preserved-thinking tool-loop, low-latency non-thinking, agentic stop conditions, Zhipu alias routing и Web Search citations.
- **Sources/rationale:** `docs/sources.md` фиксирует официальные Z.AI/BigModel источники, принятые факты и неподтвержденные пробелы (fallback matrix, rate limits, Web Search citation payloads).

### Changed
- README EN/RU, plugin manifest и marketplace metadata теперь перечисляют GLM (Z.AI / BigModel) как поддерживаемый профиль.
- Release packaging flow verified: `scripts/package-skill.ps1` produces `dist/prompt-master-1.29.0.zip` with `SKILL.md` + `references/` at archive root.

## [1.28.0] - 2026-07-08

Claude Advisor Tool + Managed Agents release: добавлен Claude-specific multi-agent routing для Advisor Tool, Managed Agents и Plan Big Execute Small без смешивания с Kimi Agent Swarm.

### Added
- **Claude Advisor Tool / Managed Agents profiles:** routing rows and profiles in `tool-profiles.md`, with Advisor framed as bounded advisory/review/diagnostic support rather than an autonomous executor.
- **Anthropic beta facts:** `models.md` now carries Advisor Tool and Managed Agents beta headers/tool names/availability caveats as volatile facts.
- **Agentic Prompt Fragments:** Plan Big Execute Small, Managed Agents worker contract, premise verification before fan-out, Advisor checkpoint/review, and thread usage telemetry / rigor-matched control.
- **Patterns #58–#61** (57→61): premise/decomposition verification before fan-out; coordinator/worker contract drift; Advisor misuse / silent cost knobs; overdelegation / bad granularity.
- **Regression coverage:** hook fixtures for Managed Agents / coordinator-workers / plan-big-execute-small, lint guards for Advisor/Managed Agents facts and profile shape, and 8 golden scenarios covering Advisor timing/cost/transcript hygiene plus worker contract, granularity, and telemetry.

### Changed
- README ×2 / plugin.json / marketplace.json / installation.md / SKILL reference table: pattern count synchronized to 61.

## [1.27.0] - 2026-07-08

Quality-gates release: стабилизация deterministic checks, перенос CI lint на Node, расширение golden-покрытия и актуализация Fable 5 promotional access по Anthropic Help Center.

### Added
- **`scripts/lint.js`** — канонический cross-platform release gate без зависимости от `pwsh`: version drift, pattern count, frontmatter, CRLF, templates ToC/cross-ref drift, no-CoT drift, knob traits, stale `models.md`, single-source status facts и Fable promo guard.
- **Fable promo guard** в lint: `models.md` обязан содержать deadline `2026-07-12 11:59:59 PM PT`, 50% weekly subscription limits, API exclusion/separate billing и Claude Code `2.1.170+`; stale current-claim `2026-07-07` в Anthropic section запрещён.
- **Golden-сценарии**: ambiguous target assumption, Gamma assumed settings, pasted prompt injection inertness, research format not silent, two-task split, unknown-tool fallback, destructive agent stop conditions.

### Changed
- **CI:** GitHub Actions теперь гоняет `node scripts/test-hook.js` + `node scripts/lint.js`; PowerShell lint остаётся legacy helper.
- **Hook runtime:** stdin-чтение `multi-agent-detect.js` переведено на event-based `process.stdin`, чтобы child-process fixture tests не зависали.
- **`scripts/test-hook.js`:** добавлен timeout на fixture, чтобы поломанный hook падал ошибкой вместо бесконечного ожидания.
- **`scripts/run-golden.js`:** отчёт показывает scenario id, model, elapsed time, failed regex и первый excerpt ответа.
- **Fable 5 facts:** Anthropic section обновлён: promo extended through **2026-07-12 11:59:59 PM PT**; eligible Pro/Max/Team + premium seat-based Enterprise; Free/standard Enterprise/usage-based Enterprise/API excluded; API billed separately; Claude Code requires `2.1.170+`; Cowork requires latest Claude Desktop.

### Notes
- Источник Fable promo terms: Anthropic Help Center article “Claude Fable 5 promotional access”, checked `2026-07-08`.
- Default routing unchanged: bare `Claude` still targets **Opus 4.8**; Fable 5 remains opt-in/selectable.

## [1.26.3] - 2026-07-04

«Unknowns-lens» — операционализация Fable-гайда «Finding Your Unknowns» (Thariq/Anthropic, снапшот в `docs/`). Закрыт пробел: readiness-gate дренировал только *known unknowns* (вопросом), но taste-критерии («пойму, когда увижу») и незнакомый домен вопросом не гасятся.

### Added
- **Паттерны #56–57** (55→57): #56 (Task) — taste-based / new-domain unknown, дренируемый вопросом → **prototype-first** (throwaway mock, дивергентные направления) или **blindspot pass** (вскрыть unknown unknowns) вместо вопроса/one-shot-билда; #57 (Agentic) — plan deviation unhandled → **conservative option + лог `## Deviations` + continue**, stop-and-ask только на необратимом.
- **templates.md**: Template H блок `Deviations:`; Template M `## Progress` off-plan строка; два фрагмента в Agentic Prompt Fragments — **Prototype-first** (#56, taste) и **Blindspot pass** (new domain), явно отделённые от Spec-by-interview (known unknowns) и #54 (exemplar).
- **SKILL.md**: в Intent Extraction — **question-drainability check** (не тратить вопрос на недренируемое); в Diagnostic → Agentic failures — строки #56/#57.
- **Golden-сценарий `taste-prototype-first`** (14-й).

### Changed
- Профиль Claude Code: буллет «unknowns first» (#56/#57) перед Template M.
- README ×2 / plugin.json / marketplace.json / installation.md: счётчик 57, строки #56–57, version-line v1.26.3.
- SKILL.md net-zero к бюджету (body 249/250): уплотнены Format- и Model-fit-строки Diagnostic.

**Не взято из гайда (осознанно):** весь 8-фазный аппарат как процесс, W7 Pitch, «HTML-артефакт на всё» — противоречит токен-минимализму (ср. sources.md «Deliberately NOT adopted»). Взяты линза + отдельные клаузы.

## [1.26.2] - 2026-07-04

Закрыт пробел в Credential Safety, всплывший на голден-прогоне: правило запрещало креды только в *сгенерированном промпте*, но не в *объяснении*. Модель безопасно отказывалась вставлять ключ, но цитировала его дословно, поясняя, что это документированный placeholder AWS — голден-сценарий `credentials-stripped` (`mustNotMatch: AKIAIOSFODNN7EXAMPLE`) ловил это как утечку.

### Changed
- **Credential Safety (SKILL.md):** добавлен явный запрет эхо-повтора значения кредов где-либо в ответе — ни в промпте, ни в пояснении, даже в качестве «это только пример/placeholder». Ссылаться на кред по типу («AWS-ключ, который ты вставил»), не по литералу.

### Fixed
- Голден-сценарий `credentials-stripped` снова зелёный (`--only credentials-stripped` → 1/1 PASS на sonnet). Полный набор — 13/13.

## [1.26.1] - 2026-07-03

Рефреш профиля Claude Code по обновлённым 2026-07-02 докам code.claude.com (prompt-library, best-practices, code-review, common-workflows) + актуализация статуса Fable 5. Главный пробел закрыт: петля самопроверки (тройно подтверждена независимыми источниками Anthropic).

### Added
- **Паттерны #52–55** (счётчик 51→55): #52 no runnable self-check (проверка + iterate-until-pass + evidence, не assertion; лестница in-prompt → `/goal` → Stop-hook → verify-субагент); #53 artifact described instead of attached (`@file`/verbatim paste вместо пересказа); #54 no exemplar named (указать образец из кодбейса); #55 unbounded review request (severity bar + nit cap + `file:line` evidence + convergence). Нюанс-исключение к #1: осознанно-вагусный exploration-промпт легитимен.
- **Template H:** блок `Verification:` (какой check гонять, iterate до зелёного, показывать вывод, чинить root cause).
- **Agentic Prompt Fragments:** «#55 Review-request knobs» (severity/nit-cap/skip/evidence-bar/convergence/summary shape — из REVIEW.md-доки Code Review) и «Spec-by-interview» (интервью через AskUserQuestion → SPEC.md → исполнение в свежей сессии).
- **Golden-сценарий `claude-code-verify-loop`** (13-й): промпт для Claude Code обязан содержать verification + stop conditions.
- **docs/**: снапшоты 4 страниц доков Claude Code (2026-07-03) + секция в sources.md.

### Changed
- **Профиль Claude Code:** verification loop как практика №1; plan mode (Shift+Tab/Ctrl+G; «diff в одно предложение → пропусти план»); гранулярная гигиена контекста (`/clear` между задачами и после >2 неудачных правок, `/compact <focus>`, `/btw`); CLAUDE.md-правила (correction→rule, критерий строки); артефакты `@file`/`@server:resource`/pipe; headless `claude -p` («Return OK or FAIL», `--allowedTools`, Writer/Reviewer); `/code-review` (effort semantics, targets).
- **Fable 5 — redeployed 2026-07-01** (models.md, `last-verified: 2026-07-03`): до 07-07 в лимитах (≤50% weekly Pro/Max/Team/select Enterprise), после — usage credits; Mythos 5 — только US-организации. **Дефолт-рекомендация не меняется — Opus 4.8**; Fable 5 — по явному запросу. Снят «suspended»-статус в SKILL.md/tool-profiles/templates/манифестах.
- Template M: Session Strategy дополнен (plan mode, `--from-pr`, правило >2 правок, `/btw`); Acceptance Criteria требуют verify + evidence.
- README ×2, installation.md, plugin.json, marketplace.json: счётчик 55, версия v1.26.1, строки #52–55, Fable 5 статус.

## [1.26.0] - 2026-07-02

Усиление инфраструктуры качества: CI, поведенческие golden-тесты, трейты профилей, диета always-loaded слоя.

### Added
- **CI (GitHub Actions):** `node scripts/test-hook.js` + `pwsh scripts/lint.ps1` на каждый push/PR — все guards стали принудительными.
- **Golden-сценарии поведения:** `tests/golden/scenarios.json` (12 фикстур) + `scripts/run-golden.js` — headless-прогон запросов через `claude -p` с SKILL.md как системным промптом и проверкой инвариантов (no-CoT для reasoning-моделей, `Assumed settings:` для video, вырезание credentials, stop conditions для агентов, флаг sunset у Sora и т.д.). Запуск ручной (реальные вызовы модели); 12/12 зелёные на sonnet.
- **Трейты профилей:** строка `*Traits: …*` (reasoning-native / knobs) под заголовками 12 профилей в tool-profiles.md; линт сверяет их с каноническим no-CoT списком и knob-перечнем hard rules — новая модель без трейта не пройдёт CI.
- **lint.ps1:** WARN на секции models.md со `last-verified` старше 60 дней (протокол re-verify перестал быть ручным); ERROR на дублирование suspension-даты вне models.md.

### Changed
- **Gotchas-читшит на диете:** строки DeepSeek/Grok/Kimi/Gamma ужаты с мини-профилей (~100+ слов) до 1–2 строк «главные грабли + указатель в профиль» — двухслойный дрейф сведён к минимуму, ~350 слов контекста освобождено.
- **Статус Fable 5/Mythos 5 — один источник:** дата и причина suspension остались только в models.md; остальные 7 мест (SKILL.md, tool-profiles.md, templates.md) несут короткий статус + ссылку (единственность даты контролирует линт).
- `docs/REFRESH_CHECKLIST.md` дополнен разделами про трейты и golden-прогон.

## [1.25.0] - 2026-07-02

Консистентность-релиз по итогам хеликоптер-ревью (26 подтверждённых расхождений): устранён дрейф между слоями (SKILL.md ↔ профили ↔ шаблоны ↔ доки), закрыты дыры роутинга, добавлены защитные линт-проверки и тесты хука.

### Added
- **Канонический no-CoT список** — единственный источник в hard rules SKILL.md (+ MiniMax M3); Gotchas, диагностики, Safe Techniques и Template E теперь ссылаются на него, а не дублируют (дрейф ловит линт).
- **Comet tie-break** в Routing Index (research-вопрос → Perplexity; действия в браузере → Browser agents; автономная миссия → оркестраторы).
- Video AI профиль: указатели на Template I и секцию «Conversational video editing»; сама секция добавлена в ToC templates.md (была сиротой), как и «Agentic Prompt Fragments».
- `scripts/test-hook.js` — 18 fixture-тестов хука multi-agent-detect.
- `lint.ps1`: проверки ToC ↔ секции templates.md, cross-ref'ов «Template X»/«pattern #NN», no-CoT-синхронизации, knob-перечней, Comet tie-break, счётчика паттернов в README.ru/installation.md.
- `docs/REFRESH_CHECKLIST.md` — «sites to touch» при обновлении модельных фактов; research-доки v1.24 закоммичены в `docs/`.

### Changed
- Safe Techniques: CoT больше не рекомендуется для Claude/GPT-5.x (противоречило models.md и профилю Claude); Template M — «Think carefully before starting.» вместо запрещённого «step-by-step».
- Hard rules: снят deadlock «подтверди тул vs не стопорись» (явная строка `Assumed target tool:`); правило output-format унифицировано (вопрос первым, note только при исчерпанном лимите).
- Knob-перечень settings-as-knobs дополнен **video-AI** (SKILL.md ×3, pattern #48, Gotchas).
- Факты сверены с research-доками 2026-06-30: Kling `mode` 4k помечен неподтверждённым; Sora Characters — только non-human; SD 3.5 `cfg_scale` 1–20, negative optional; DALL·E 2 variations endpoint ещё жив; Midjourney `--ow` 1–1000.
- Grok Voice: честная оговорка «нет верифицированного профиля» вместо роутинга в ElevenLabs-профиль; заголовок Opus 4.8 в профиле Claude исправлен на «current default».
- Диагностика «спроси, что уже пробовали» ограничена сценарием fix/debug существующего промпта; pattern #18 учитывает тулы без negative-prompt (Grok Imagine/SeeDream, Midjourney `--no`).
- docs/installation.md: Способ 3 указывает на `~/.claude/skills/` (были пути Claude Desktop), счётчик паттернов 46→51, форма вызова `/prompt-master:prompt-master` унифицирована с README.

### Fixed
- Хук: «настрой/построй агента» больше не даёт ложного срабатывания, «promptly» не считается за prompt, падежи «команду/командой агентов» распознаются; добавлен паттерн «team of agents».
- `bump-version.ps1`: замена frontmatter-версии реально ограничена первым вхождением (у статического `[regex]::Replace` 4-й int-аргумент — это RegexOptions, а не count); запись UTF-8 строго без BOM; чтение с `-Encoding UTF8` (PS 5.1 иначе корёжит кириллицу).
- `package-skill.ps1`: ZipArchive закрывается (повторный запуск в той же сессии не падает на «file in use»).
- `.ps1`-скрипты сохранены UTF-8 with BOM — Windows PowerShell 5.1 парсит кириллицу корректно (SHELL_PITFALLS SP-запись).
- patterns.md: битая ссылка «#40 folds #37» (номер #37 переиспользован другим паттерном).

## [1.24.0] - 2026-07-01

Полный рефреш **image + video профиля**. Актуализированы все существующие инструменты (снята «DALL-E-3-эпоха») и добавлены новые семейства, с верификацией фактов против живых доков (2026-07-01) и явной секцией дат в `models.md`. Роутинг теперь различает «быстро/дёшево» vs «бренд/консистентность» и помечает закрывающиеся модели.

### Added
- **Новые image-семейства:** Google Nano Banana 2 (`gemini-3.1-flash-image` / `-lite-image` / `gemini-3-pro-image`) и Grok Imagine (`grok-imagine-image` / `-image-quality`).
- **Новые video-инструменты:** Veo 3.1 (Google), Seedance 2.0 (ByteDance), Omni Flash (Google conversational-video), Grok Imagine video.
- **`models.md`:** новые секции `## Image AI` / `## Video AI` с `last-verified: 2026-07-01`, timeline дедлайнов и пометками DO-NOT-HARDCODE.
- **Паттерны #49–51:** consistency-задача на неспособном тире → роутинг; video-edit переописанием вместо «Keep everything else the same»; дефолт на sunsetting/deprecated-модель без флага.
- **templates.md:** фрагмент conversational-video (`<FIRST_FRAME>` / `<IMAGE_REF_n>`, таймкоды, «Keep everything else the same»).

### Changed
- **Midjourney → V8.1:** `--cref` → **Omni Reference `--oref` / `--ow`**; `--hd` = нативный 2K; `--sref` + `--sw`.
- **DALL-E 3 → GPT-image (`gpt-image-2`)** (DALL·E выключен 2026-05-12; base64-only; edit до 16 refs + маска).
- **Flux → FLUX.2** (klein / pro / flex / max / dev; structured/JSON + hex; guidance/steps). **Stable Diffusion → SD 3.5** (`sd3.5-*`; cfg 1–10; edit/Control-эндпоинты). **SeeDream → 5.0**.
- **Video:** Runway → Gen-4.5 + `aleph2` (⚠️ `gen4_aleph` sunset 2026-07-30); Kling → 3.0/Omni; LTX → LTX-2 (4K@50fps + audio); Dream Machine → Luma **ray-3.2**; Sora помечена **shutdown 2026-09-24**; Veo 2/3 сняты.
- Счётчик паттернов 48 → **51**; «50+ tools» → «55+ tools»; версия → 1.24.0 (README EN+RU, plugin.json, marketplace.json).

## [1.23.0] - 2026-06-22

UX-доработка **settings-as-knobs** профилей. Раньше скилл молча зашивал дефолты «ручек» (Gamma плотность/визуал/число карточек; Perplexity domain/recency-фильтры; Grok `reasoning_effort`/поиск/фильтры; image-AI CFG/steps/`--ar`/негатив) — пользователь не узнавал, что их можно менять, и перепромпчивал. Теперь скилл при выдаче подаёт заассумленные дефолты явной **переопределяемой строкой `Assumed settings:`** (только незаданные ручки, значение + где менять), **не тратя на это уточняющий вопрос**. Обобщает существующую конвенцию `Assumed output format` с формата на настройки тула.

### Added
- **Конвенция `Assumed settings:` note line** — сиблинг `Assumed output format`: выносит дефолтные ручки тула в setup-note, перечисляя только незаданные пользователем, каждую с дефолтом + где менять; пропускается для prose-тулов без ручек (DALL-E 3, Flux).
- **`patterns.md` #48** — «Tool setting baked silently — user never told it's an adjustable, overridable knob» (счётчик паттернов **47 → 48**).

### Changed
- **`SKILL.md`** — Hard rule (never-silent) обобщён с output-format на «output-format + tool settings/knobs»; Diagnostic «Format failures» расширен на defaulted knobs; Gotcha-преамбула указывает выносить ручки строкой `Assumed settings:`. Нетто +0 строк (body 247/250).
- **`tool-profiles.md`** — в профили **Grok / Perplexity / Gamma / Image AI** добавлена строка «surface defaulted knobs» с per-tool дефолтами (Grok `reasoning_effort=low` · Web+X on · no filter; Perplexity no domain/recency; Gamma 10 cards · Concise · Stock; Midjourney `--ar 16:9 · --v 6 · --chaos 0`, SD `CFG 7 · steps 20–30 · negative`); ⚠️ волатильное (кредиты, ID, лейблы) не хардкодится.
- **`templates.md`** — Template I / K / N / O: выдавать `Assumed settings:` строкой; явный **skip** для DALL-E 3 / Flux.
- **`README` (EN + RU)** — заголовок и проза паттернов **47 → 48** + строка #48 в обе таблицы; «Current release» → v1.23.0.
- **`plugin.json` / `marketplace.json`** — счётчик в описании **47 → 48**.

## [1.22.0] - 2026-06-22

Новый профиль **Gamma** (gamma.app — AI text-to-deck): в скилле не было профиля под генераторы презентаций. Факты сверены по live-докам (verify-don't-trust); пользовательский cookbook использован как лид и **скорректирован** (UI Text Content = Minimal/Concise/Detailed; «Very Detailed» — ошибка cookbook; brief/medium/detailed/extensive — это API-only шкала). Реализовано **агентной декомпозицией** (A0 verify → A1∥A2 авторинг → A3 adversarial gate → A4 clean-room), каждый агент со своей моделью / критериями / тестами.

### Added
- **`tool-profiles.md` — профиль `Gamma (AI presentations — text-to-deck; app + Generate API)`** + строка Routing Index: режим-по-входу (Generate / Paste-in-text + `\n---\n` / Import); Deck Brief → Template O; settings-as-knobs (Text Content / Image Source / Tone / Audience) → setup-note; анти-фабрикация данных (real или `[placeholder]`); boundary-честность (бренд → Theme, полировка → Gamma Agent пост-факт, НЕ промптом).
- **`models.md` — секция `## Gamma`**: две поверхности — **App** (3 режима + editable Outline + Advanced knobs; Text Content Minimal/Concise/Detailed) и **Generate API** (`POST /generations`; `numCards` default 10; `textOptions.amount` brief/medium/detailed/extensive — API-only; `cardSplit:"inputTextBreaks"`; `cardOptions.dimensions` 16x9/4x3/fluid; `themeId`); `⚠️ verify`: кредиты (~40, не хардкодить), enum Image Source, эвристика «8–15 карточек».
- **`templates.md` — Template O — Deck / Presentation Brief** (role + audience + goal + N cards + sections + tone + density + visuals + exclusions + language; Paste-in-text + `\n---\n`).
- **`patterns.md` #47** — «deck/слайд-генератор без числа карточек, структуры и данных → generic deck + выдуманные цифры + overcrowded карточки».

### Changed
- **`SKILL.md`**: новая Gotcha-строка Gamma; счётчик паттернов в Reference-table **46 → 47**.
- **`README` (EN + RU)**: «Works with» + таблица «Works With Any AI Tool» — добавлен Gamma; **14 → 15 шаблонов**; **46 → 47 паттернов**; строка «Current release» обновлена до v1.22.0 (была устаревшая v1.20.0).
- **`plugin.json` / `marketplace.json`**: счётчик паттернов **46 → 47**.
- **`docs/sources.md`**: строка обоснования Gamma + источники (gamma.app/prompts, products/presentations, products/api, developers.gamma.app generate-api-parameters, pitch-insights; 24slides review 2026).

### Notes
- **Сверено по live-докам** (verify-don't-trust). `⚠️ verify`: кредиты (~40, волатильны — не хардкодить), точный enum Image Source, эвристика «8–15 карточек» (hard-факт только API default `numCards=10`). **Коррекция cookbook:** UI Text Content = Minimal/Concise/Detailed (нет «Very Detailed»; brief/medium/detailed/extensive — только в Generate API). **Подтверждено:** у Gamma есть публичный **Generate API** (`POST /generations`).
- **Агентная декомпозиция (по запросу пользователя):** A0 live-verify (opus) → A1 profile-core ∥ A2 integration+counts (диздойнтные файлы, параллельно) → A3 adversarial gate (opus — content PASS) → A4 clean-room (sonnet, **9/9 PASS**: A pitch-deck / B paste-notes + `\n---\n` / C data+brand). Ноль фабрикаций кредитов/лейблов; бренд → Theme, данные → `[placeholder]`, формат вынесен допущением.
- Счётчик паттернов **46 → 47**. Гард-рейлы целы: never-silent format v1.19.1, citation contract v1.18.1, профили Perplexity v1.21 / Kimi v1.20 / DeepSeek v1.19 / Grok v1.18, hook v1.15, cap 3.
- Backlog («каждый паттерн — свой релиз»): дальше Claude Code (1.23) → MiniMax (1.24) → Gemini (1.25) → Memory-rebuild → Doc-grounding → image → GPT.

## [1.21.0] - 2026-06-17

Рефактор + актуализация профиля **Perplexity**. Live-сверка через perplexity doc-server (2026-06-17) показала, что Perplexity теперь **двухповерхностный продукт**, а профиль был тонким и смешан с Manus. Два пользовательских файла `Perplexity_Deep_Research_*` (про отдельный проект DResearch-Skill + UI Deep Research) использованы как лиды; «Search as Code / Deep Research in Computer» помечен как блоговый концепт (в API-доках отсутствует).

### Added
- **`tool-profiles.md` — отдельный профиль `Perplexity`** (выделен из смешанного блока «Research / Orchestration AI»): **Agent API** (`/v1/agent`, `responses.create`) как рекомендуемый дефолт для новых апп (agent loop + custom tools + presets incl. `deep-research` + мультипровайдерный доступ к моделям) vs **Sonar API** (`sonar`/`sonar-pro`/`sonar-reasoning-pro`/`sonar-deep-research` 128K) для прямых search-grounded ответов; search по user-msg; фильтры-как-параметры; Data-gaps & confidence + citation contract. Manus/мультиагентные оркестраторы — отдельным блоком. Routing Index разнесён на `Perplexity` и `Manus / multi-agent orchestrators`.

### Changed
- **`models.md` — переписана секция `## Perplexity`** (`last-verified: 2026-06-17`): две поверхности (Agent API мультипровайдерный шлюз + Sonar 4 модели); `sonar-deep-research` 128K с раздельным reasoning/citation/search-query биллингом; search по user-msg; фильтры-как-параметры; `reasoning_effort` enum под `⚠️ verify`; Search-as-Code помечен как блоговый концепт (не API); цены не хардкодить.
- **`SKILL.md`**: Gotcha-строка «Research tools» обновлена (Agent API дефолт; Sonar модели; search по user-msg; Search-as-Code ≠ API).
- **`templates.md` Template N**: Perplexity-заметка — Agent API дефолт + `sonar-deep-research` 128K + фильтры/cap-lists; Search-as-Code ≠ API.
- **`README` (EN + RU)**: строка Perplexity в «Works With» — Agent API + Sonar Deep Research.
- **`docs/sources.md`**: строка обоснования + источники Perplexity обновлены (Agent API + Sonar pages; verified 2026-06-17; SaC = blog).

### Notes
- **Сверено по live-докам** (perplexity doc-server). `⚠️ verify`: точные значения `reasoning_effort`, GA-список моделей Agent API (меняется ежемесячно), цены (волатильны — не хардкодить).
- **Проверка — clean-room behavioural test** (свежие субагенты, только файлы скилла, нейтральная формулировка, 3 кейса × 3 = **9/9 PASS**): A (новый агент с кастомными тулзами → **Agent API** `/v1/agent`+`responses.create`+`tools`+preset `deep-research`, не голый Sonar), B (глубокое исследование → `sonar-deep-research`, research-бриф Template N, вопрос в user-msg, фильтры-как-параметры, Data-gaps & confidence + citation contract), C (быстрый факт → `sonar`/`sonar-pro`, «офиц. ЕС» как `search_domain_filter`, не прозой). Ноль фабрикаций: никто не выдумал `reasoning_effort`/цены и не подал Search-as-Code как API-фичу; формат вынесен допущением.
- Счётчик паттернов **без изменений (46)**. Гард-рейлы целы: never-silent format v1.19.1, citation contract v1.18.1, профили Kimi v1.20/DeepSeek v1.19/Grok v1.18, Opus 4.8 дефолт/Fable suspended, hook v1.15, cap 3.
- Backlog: «каждый паттерн — свой релиз». Дальше Claude Code (1.22) → MiniMax (1.23) → Gemini (1.24) → Memory-rebuild → Doc-grounding → image → GPT.

## [1.20.0] - 2026-06-17

Добавлен профиль **Kimi (Moonshot AI)** — раньше в скилле не было ни одного упоминания Kimi. Все факты **сверены по live-докам** platform.kimi.ai / api.moonshot.ai + HF model cards (2026-06-17). Три лид-файла `Kimi_*DeepSearch*` использованы как лиды; **2 ошибки лидов исправлены по первоисточнику** (см. Notes).

### Added
- **`models.md` — секция `## Moonshot AI — Kimi`** (`last-verified: 2026-06-17`): `kimi-k2.6` (флагман, мультимодал, 256K, dual-mode), `kimi-k2.7-code`(+highspeed — forced thinking+preserve_thinking, thinking-off→fallback K2.6, MoonViT vision, Modified MIT), `kimi-k2.5`, легаси `moonshot-v1-*` (единственные с полным сэмплингом), `kimi-latest` deprecated 2026-01-28; defaults K2.x (temp 1.0 / top_p 0.95 / 32768 / n1 — temperature не тюнить); `tool_choice` auto/none при thinking; `$web_search` требует thinking off; Agent Swarm (app, self-orchestrated, 300 sub-агентов) ≠ Kimi-Researcher (single, app-only); app-режимы + tier-gating; OpenAI/Anthropic, `api.moonshot.ai/v1`; Partial Mode.
- **`tool-profiles.md` — профиль `Kimi (Moonshot AI)`** + строка Routing Index: decision-таблица модель×режим; reasoning-native (no CoT); инструменты не в system prompt (только `tools`); preserve `reasoning_content`; конфликт web_search⊕thinking; Kimi-нативный citation contract; Agent Swarm (без ручного agent count) ≠ Kimi-Researcher; app vs API; tier-gating.
- **`patterns.md` #46** — «reasoning + живой web search в одном запросе на инструменте, где это взаимоисключено» (Kimi `$web_search` требует thinking off).
- **`templates.md`** — Template N: Kimi research (app vs API + нативный формат цитат); **Agentic Fragments — Kimi carve-out** (vendor-managed swarm: не проектировать топологию/sub-агентов).

### Changed
- **`SKILL.md`**: новая Gotcha-строка Kimi; `Kimi K2.x thinking` добавлен в no-CoT reasoning-native списки (Hard rule, Gotchas, Diagnostic, Safe Techniques); в multi-agent Gotcha — exception про vendor-managed swarm; счётчик паттернов **45 → 46**.
- **`patterns.md` #38**: добавлен `kimi-latest` (deprecated 2026-01-28); заголовок **45 → 46 patterns**.
- **`README`**: «Works with» + обе таблицы — добавлен Kimi; счётчик **45 → 46**.
- **`plugin.json` / `marketplace.json`**: в описания добавлен Kimi (Moonshot AI); keywords +`kimi`/`moonshot`; счётчик **46**.
- **(опц.) `hooks/multi-agent-detect.js`**: в инжектируемую note добавлена строка про vendor-managed swarm (Kimi Agent Swarm) — regex не изменён (он уже ловил multi-agent/swarm).

### Notes
- **Сверено с live-доками.** `⚠️ verify`: max output, knowledge cutoff, inline-цитаты `$web_search`, API-доступ Agent Swarm / Claw Groups / Kimi-Researcher / Kimi Work, архитектура K2.7. Цены не хардкодятся.
- **2 коррекции лид-файлов:** (1) заявленное «verbatim: do not duplicate tool schema in system prompt [tool-calls page]» — на той странице отсутствует; реальное правило (agent-страница) — *не описывать инструменты в System Prompt вообще* («interferes with K2.6 autonomous decision-making»); (2) «temperature не модифицируется / калибруй 0.6–1.0» — дефолт **1.0**, держать дефолт.
- **Хук:** существующий v1.15 multi-agent-хук уже ловит «промпт … мультиагент/agent swarm»; вместо нового хука добавлен **Kimi carve-out** в Agentic Fragments, чтобы хук не уводил Kimi-Swarm в orchestrator-as-decomposer.
- **Проверка — clean-room behavioural test** (свежие субагенты, только файлы скилла, нейтральная формулировка, 7 кейсов × 3 = **21/21 PASS**): A рефактор → k2.6/k2.7-code, no-CoT, дефолты; B агентный кодинг → k2.7-code + инструменты не в system prompt + preserve `reasoning_content`; C дешёвая JSON → k2.5/non-thinking/`response_format`; D веб-ресёрч API → `$web_search`+thinking-off + Kimi-нативный citation; E tool-loop → preserve `reasoning_content`; **F мультиагент → Agent Swarm, модель само-оркеструет, НЕ проектирует топологию/sub-агентов (Kimi carve-out перекрыл generic-нудж хука)**; G deep research → app (Researcher/Swarm) vs API (свой loop), не путает Researcher↔Swarm. Ноль фабрикаций; формат вывода нигде не выведен молча; tier-gating Swarm везде вынесен как prerequisite.
- Гард-рейлы целы: never-silent format v1.19.1, citation contract v1.18.1, DeepSeek v1.19, Grok v1.18, Perplexity v1.17, Opus 4.8 дефолт/Fable suspended, hook v1.15, фрагменты v1.14, cap 3.
- Backlog: image → 1.21, GPT → 1.22.

## [1.19.1] - 2026-06-15

Hardening-фикс. На установленном скилле баг «молча выбран формат ответа» **воспроизвёлся снова** (Grok-промпт). Перепроверка на актуальном репозитории показала: фикс v1.18.1 был **soft-правилом в MIDDLE-зоне** и проигрывал `SKILL.md` «Fix silently» + премиссе Template N → срабатывал лишь ~2/3. Плюс мой прежний clean-room тест был **бутафорией**: инструкция субагенту «следуй файлам точно» завышала соблюдение до 3/3, а N=3 не ловит 33%-й отказ.

### Changed
- **`SKILL.md` — правило формата поднято в Hard Rules (PRIMACY-зона, always-loaded, «NEVER violate»)**: для research/report и ЛЮБОГО Grok-промпта запрещено отдавать молча выведенный формат — только спросить первым вопросом ИЛИ строка «Assumed output format: …» в заметке. Явно перекрывает «fix silently» и дефолты структуры Template N.
- **`SKILL.md` Diagnostic Checklist** — в преамбулу «Fix silently» добавлено исключение: формат вывода research/Grok-промпта НЕ silent fix.

### Notes
- **Честный re-gate (исправленная методика):** нейтральная формулировка (без «следуй точно»), **8 прогонов** на точном провальном репро (Grok deep search по докам Kimi), порог 8/8 → **8/8 PASS** (5× строка-допущение, 3× вопрос; ноль молча-зашитых). До правки тот же ввод давал 2/3. Оговорка: 8/8 — сильное доказательство, не «математические 100%».
- **Урок по тестам:** поведенческие правила проверять нейтрально и с N≥8, порог near-100%, обязательно на реальном провальном вводе; «coached» прогоны и N=3 — ненадёжны.
- **Важно для пользователя:** фикс уйдёт в установленный плагин только после **обновления/переустановки** — релизы на GitHub не подтягиваются автоматически.
- Счётчик паттернов без изменений (45). Гард-рейлы целы (citation contract v1.18.1, DeepSeek v1.19, Grok v1.18, Perplexity v1.17, Opus 4.8 дефолт, hook v1.15, фрагменты v1.14).

## [1.19.0] - 2026-06-15

Ревизия профиля **DeepSeek** (V4, dual-mode). Секция была тонкой и устаревшей (только «DeepSeek-R1»). Все факты **сверены по live api-docs.deepseek.com** (через context7, 2026-06-15); три пользовательских файла `DeepSeek_Prompting_*` (Grok DeepSearch) использованы как лиды и местами скорректированы (напр., «единственная модель v4-pro» → есть и v4-flash; легаси-имена ещё живут до 24.07.2026).

### Added
- **`models.md` — переписана секция `## DeepSeek`** (`last-verified: 2026-06-15`): текущие модели `deepseek-v4-pro` / `deepseek-v4-flash` (1M, OpenAI+Anthropic интерфейс, dual-mode Thinking/Non-Thinking); легаси `deepseek-chat`/`deepseek-reasoner` → отключение **2026-07-24**; thinking enable/disable; `reasoning_effort` **только `high`/`max`** (не low/medium); `temperature`/penalties в thinking игнорируются; правило сохранения `reasoning_content` при tool calls; JSON-mode; нет нативного deep-research агента. GA-имена/цены/maxOutput под `⚠️ verify`.
- **`tool-profiles.md` — профиль `DeepSeek (V4, dual-mode)`** (вместо «DeepSeek-R1») + Routing Index `DeepSeek V4`: decision-таблица модель×режим×effort (pro для сложного/agentic-coding/Math-STEM, flash для простого/объёмного/дёшево; thinking для reasoning, non-thinking для простого; high/max); правило `reasoning_content`; «глубокое исследование» = thinking + retrieval + citation contract (нет нативного агента); JSON-mode; OpenAI/Anthropic-совместимость.

### Changed
- **`SKILL.md`**: новая Gotcha-строка DeepSeek (v4-pro/flash, dual-mode, reasoning_effort high/max, не ставить temp/penalty в thinking, сохранять reasoning_content, легаси до 24.07.2026); no-CoT reasoning-native списки обновлены `DeepSeek-R1` → `DeepSeek thinking mode` (Hard rule, Gotchas, Diagnostic, Safe Techniques).
- **`README`**: обе таблицы — `DeepSeek-R1` → `DeepSeek V4 (pro/flash, dual-mode)` с fix-заметками.
- **`patterns.md` #38**: добавлен свежий пример снятой модели (`deepseek-chat`/`deepseek-reasoner`, 2026-07-24). Счётчик паттернов **без изменений (45)**.
- **`plugin.json`/`marketplace.json`**: в перечень моделей добавлен DeepSeek V4.

### Notes
- **Сверено с live-доками, лиды Grok-DeepSearch скорректированы.** `⚠️ verify`: финальные GA-имена/цены V4, точный maxOutput (~384K).
- **Проверка — clean-room behavioural test** (свежие субагенты, только файлы скилла, 4 кейса × 3 = **12/12 PASS**): A (hard math → v4-pro/thinking/effort high, без CoT/temp/penalty), B (JSON-классификация → v4-flash/non-thinking/json/few-shot), C (tools → сохранение `reasoning_content`), D (deep research → thinking+retrieval+citation contract, без выдуманного агента). Анти-фабрикация 12/12. Тест поймал слабую формулировку выбора варианта (A1 не закрепил pro) → усилено и перегнано до 3/3.
- Гард-рейлы целы: citation contract v1.18.1, профиль Grok v1.18, Perplexity research v1.17, Opus 4.8 дефолт/Fable suspended v1.16, hook v1.15, фрагменты v1.14, cap 3.
- Backlog сдвинут: image → 1.20, GPT → 1.21; добавлен пункт **Kimi (Moonshot AI)**.

## [1.18.1] - 2026-06-15

Фикс двух поведенческих дефектов, найденных на установленном скилле (Grok-промпты): (1) скилл **молча придумывал формат ответа**, не спрашивая и не помечая допущением; (2) для retrieval-инструментов **не требовал inline-ссылок на источник** → проза без атрибуции. Общий корень (RCA): правило жило лишь в Gotcha-памятке и проигрывало оперативной инструкции Diagnostic Checklist «No output format → derive» + «Fix silently». Урок применён — оба правила **вшиты в Diagnostic Checklist + readiness-gate**, а не только в памятку. Цитаты — **условно** (фактологическая/research-задача на retrieval-инструменте) и всегда с анти-фабрикационной парой «cite only retrieved / never fabricate / [uncertain]», чтобы не провоцировать выдуманные ссылки.

### Added
- **Safe Technique «Source citations»** (`SKILL.md`): условный citation contract — inline-ссылка на каждое неочевидное утверждение + список источников + cite-only-retrieved + never-fabricate + `[uncertain]`. Только для factual/research на retrieval-инструменте; НЕ для креатива/кода/без-retrieval.
- **#45 «Citable task with no inline-citation contract»** в `patterns.md` (44 → **45**).
- **Diagnostic Checklist (`SKILL.md`)**: строка про citation contract + переписана строка output-format (вынести допущением/спросить, не выводить молча).

### Changed
- **`SKILL.md`**: readiness-gate — «output format is never silently derived» (спросить или вынести допущением для Grok/report); Gotchas Grok + Research tools усилены требованием inline-цитат; счётчик 44 → 45.
- **`tool-profiles.md`**: Grok-профиль (формат — спросить/вынести допущением; citation contract при включённом поиске); Perplexity/Research (inline-цитаты per-claim + no-fabrication); Gemini (inline-цитаты для grounded/research).
- **`templates.md` Template N**: inline-цитаты + sources list + no-fabrication + `[uncertain]` в Output structure.
- **`README`**: «5 Safe Techniques» → «6» (+ «Source citations»); счётчик 44 → 45.
- **`plugin.json`/`marketplace.json`**: счётчик 44 → 45.

### Notes
- **Анти-фабрикация цела:** citation contract не добавляется без retrieval и для креатива/кода; нигде не инструктируем выдумывать ссылки — наоборот, явно запрещаем.
- **Проверка — clean-room behavioural test:** свежие субагенты только с файлами скилла (без этой переписки), 3 прогона × 3 кейса = 9/9 PASS (репро бага: формат спрошен/вынесен + цитаты; креатив: цитат нет; Perplexity: цитаты + data-gaps). Именно этот гейт поймал бы промах, которого не было видно в v1.18.
- Гард-рейлы целы: профиль Grok v1.18, Perplexity research v1.17, Opus 4.8 дефолт/Fable suspended v1.16, hook v1.15, фрагменты v1.14, cap 3, single-pass self-critique.

## [1.18.0] - 2026-06-15

Добавлен профиль **Grok (xAI)**. Факты **сверены по live-доке docs.x.ai** (через grok-doc-server MCP, 2026-06-15). До этого Grok в проекте не упоминался вообще — релиз закрывает пропуск, а не правит устаревшее. Фокус — текст / reasoning / поиск / multi-agent; image/video (Grok Imagine) и voice отложены в image-релиз (1.19.0).

### Added
- **`tool-profiles.md` профиль Grok (xAI)** + строка в Routing Index: reasoning-native `grok-4.3` (без CoT, глубина через `reasoning_effort`); **нет realtime-знаний без Web/X Search** (cutoff ноябрь 2024); **X Search** = signature для соц/трендов; фильтры поиска — параметрами не прозой; `grok-4.20-multi-agent` (beta) для deep-research (4/16 агентов); OpenAI-совместимость; обязательный явный формат ответа.
- **`models.md` секция `## xAI — Grok`** (`last-verified: 2026-06-15`): `grok-4.3` 1M (дефолт), `grok-build-0.1` 256k, `grok-4.20-multi-agent` (beta), `grok-4.20-0309-*` под `⚠️ verify`; `reasoning_effort` none/low/medium/high; multi-agent agent-count 4/16; cutoff + «нет realtime без search»; фильтры-параметры; aliases; Imagine/Voice кратко. Цены не хардкодим.
- **#44 «Real-time request to a cutoff model with no retrieval enabled»** в `patterns.md` (43 → **44**): запрос свежих данных к модели с cutoff без включённого поиска → включить Web/X Search, фильтры — параметрами.
- **Template N (Research Brief)** — Grok-вариант: `grok-4.20-multi-agent` + `web_search`/`x_search`, 4/16 агентов, фильтры как tool-параметры.

### Changed
- **`SKILL.md`**: `grok-4.3` добавлен в no-CoT reasoning-native списки (Hard rule, Gotchas, Diagnostic, Safe Techniques); новая Gotcha-строка Grok (включая обязательный формат ответа). Счётчик 43 → 44.
- **o1-фикс (побочная устарелость):** `o1/o3` в примерах CoT заменён на `o3/o4-mini` (`README`, `templates.md`, patterns #27). `o1` намеренно сохранён только в patterns #38 как пример снятой модели.
- **`plugin.json`/`marketplace.json`/`README`**: добавлен Grok/xAI в описания и keywords; счётчик 43 → 44.

### Notes
- Аудит подтвердил: устаревших Grok-данных не было (Grok отсутствовал) — риск был в пропуске, не в противоречии. Гард-рейлы целы: v1.17 (Perplexity research), v1.16 (Opus 4.8 дефолт, Fable suspended), v1.15 hook, v1.14 фрагменты, v1.13 A–G.
- `⚠️ verify`: beta-статус `grok-4.20-multi-agent` и точные `grok-4.20-0309-*` ID.

## [1.17.0] - 2026-06-15

Поддержка промптов для deep-research инструментов. Факты **сверены по live-доке Perplexity** (docs.perplexity.ai через MCP, 2026-06-14) — это переопределило часть пользовательского гайда (он опирался на блог фев-2025 + community).

### Added
- **Template N — Research Brief** (`templates.md`): универсальный скелет для deep-research / cited-report инструментов (Perplexity Deep Research, GPT/Gemini Deep Research, Sonar). Role+Goal → конкретные аспекты → scope → output structure (cap top-N, без URL-прозой) → source priorities+freshness → **обязательная секция «Data gaps & confidence»**. Tool-aware: Sonar — фильтры параметрами, запрос в user-message; UI — Focus/Spaces.
- **#43 «Vague / mis-specified research request»** в `patterns.md` (42 → **43**): vague-тема ИЛИ source-фильтры прозой → research brief + фильтры параметрами.
- **`models.md` секция `## Perplexity`** (`last-verified: 2026-06-14`): `sonar-deep-research` 128K; **поиск управляется только user-message, system-prompt поиск не видит**; фильтры — параметры запроса (`search_domain_filter` ≤20 allow/deny, `search_recency_filter` hour/day/week/month/year, date-фильтры); `search_mode`/`reasoning_effort`-значения под `⚠️ verify`; Agent API (рекоменд.); Spaces (= Collections).
- **`SKILL.md` Safe Techniques** — «Research grounding» (обязательная секция data-gaps/confidence, primary-источники, cap top-N).

### Changed
- **`tool-profiles.md` профиль Perplexity** обогащён по офиц. Sonar prompt-guide: поиск из user-message; **фильтры параметрами, не прозой** («search only on X» прозой игнорируется); cap counts; без few-shot; Agent API. Заменены устаревшие буллеты.
- **`SKILL.md` Gotchas** — строка про research tools (Template N; фильтры параметрами; Sonar-поиск из user-message). Счётчик паттернов 42 → 43 (`SKILL.md`/README/plugin/marketplace).

### Notes
- **Скорректировано против пользовательского гайда** (не протащили устаревшее): фильтры задаются параметрами, а не прозой; domain-limit = до 20 (не 3); «Finance» Focus не подтверждён — не записан; точные значения `search_mode`/`reasoning_effort` помечены `⚠️ verify`.
- Гард-рейлы целы: v1.16 (Opus 4.8 дефолт, Fable suspended), v1.15, v1.14, v1.13 A–G.

## [1.16.0] - 2026-06-14

Разворот дефолтной модели Claude обратно на **Opus 4.8**. Причина — внешнее событие: Anthropic [отключила Fable 5 и Mythos 5 для всех клиентов с 2026-06-12](https://www.anthropic.com/news/fable-mythos-access) по экспортно-контрольной директиве правительства США (все прочие модели работают). Дефолт `Claude → Fable 5` (введён в v1.11) указывал на недоступную модель — это реальная поломка. Сработал штатный механизм: датированный факт в `models.md` + pattern #38 (retired/unavailable model).

### Changed
- **Дефолтная модель Claude в роутинге — снова Opus 4.8** (`claude-opus-4-8`, 1M контекст; Opus 4.7 selectable). Обновлены: `SKILL.md` Gotchas, `tool-profiles.md` (шапка Claude-блока, Routing Index, профиль Claude Code), `templates.md` Template M, описания `plugin.json`/`marketplace.json`, `README` (обе таблицы роутинга).
- **`models.md`**: Fable 5 / Mythos 5 помечены **SUSPENDED / UNAVAILABLE с 2026-06-12** с источником и протоколом ре-проверки; `last-verified: 2026-06-14`; дефолт routing-target = Opus 4.8.

### Notes
- **Fable 5 / Mythos 5 не удалены, а помечены suspended** (факт датирован) — если доступ вернут, откат тривиален. `reasoning_extraction`-правило и Fable-профиль сохранены с пометкой «применимо, если/когда восстановят».
- Счётчик паттернов без изменений (42). Гард-рейлы v1.13 (A–G), v1.14, v1.15 (hook + Agentic Prompt Fragments) целы.
- Обоснование — [docs/sources.md](docs/sources.md).

## [1.15.0] - 2026-06-14

Детект запроса «промпт для мультиагентной среды» (двухслойный) + обогащение Agentic Prompt Fragments **проверенными практиками** из курированного репозитория [DenisSergeevitch/agents-best-practices](https://github.com/DenisSergeevitch/agents-best-practices) (первоисточники: Anthropic «Building effective agents» / context-engineering / harnesses / evals; OpenAI harness-engineering / prompt-caching / guardrails; OWASP AI Agent Security; NIST AI RMF). По главному выводу исследования («не строй мультиагентную систему, пока одиночный цикл не провалился») сама v1.15 реализована **одиночным проходом**, без распараллеливания на субагентов — самодельные эвристики заменены на источники.

### Added
- **Layer 1 — внутренний триггер** (`SKILL.md` Gotcha): запрос промпта для оркестратора / fan-out / субагентов / команды агентов → грузить «Agentic Prompt Fragments», выбирать топологию по таблице situation→pattern; по умолчанию — одиночный цикл.
- **Layer 2 — harness-hook** (`plugins/prompt-master/hooks/`): `hooks.json` (`UserPromptSubmit` → Node) + `multi-agent-detect.js` — high-precision детектор (срабатывает только при «намерение-промпт **И** мультиагентный сигнал», EN+RU; голое `agent`/`агент` исключено), инжектит само-осознанную подсказку через `hookSpecificOutput.additionalContext`, иначе молчит; всегда exit 0 (не блокирует); только `fs`+regex, кросс-платформенно (Node).
- **Обогащение Agentic Prompt Fragments** (`templates.md`) проверенными практиками: «когда оркестрировать» (7 признаков + анти-паттерн «не для simple edits»); таблица situation→pattern; **packet contract** (7 свойств); изоляция контекста воркера; независимый verifier (findings+source, не reasoning; стратегии review/sampling/cross-check/replay/tests); **бюджеты enforced**; правило параллелизма (только независимые read-only); cache-aware ordering.
- `docs/sources.md`: строки-обоснования (детект; sourced guardrails) + блок первоисточников (Anthropic/OpenAI/OWASP/NIST + agents-best-practices + Claude Code hooks).
- `.gitattributes`: `*.js text eol=lf`.

### Changed
- `SKILL.md` Gotchas-чеклист: +1 строка детекта мультиагентного запроса (ядро в пределах бюджета).

### Notes
- Счётчик паттернов без изменений (42). Гард-рейлы v1.13 (A–G) и v1.14 целы; loop-контракт остаётся runtime-only; одно-проходный self-critique не тронут.
- T4 (юнит-тест хука, 6 кейсов: 2 позитива EN/RU + 3 негатива вкл. голое `agent` + JSON-валидность) — зелёный.

## [1.14.0] - 2026-06-13

Срез из исследования репозитория [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) (8-агентный workflow + opus-оценка применимости): взяты только паттерны, усиливающие уже принятые позиции (анти-фабрикация, токен-экономия, model-aware routing, условный тиринг). Реализовано распределённо — 5 параллельных агентов по непересекающимся файлам (opus на SKILL.md/templates.md, sonnet на остальном). Прирост always-loaded ядра — в пределах бюджета (~10 строк).

### Added
- **Agentic Prompt Fragments** (`templates.md`, opt-in — только когда пользователь просит агентный промпт): оркестратор-как-декомпозитор + task-ledger; контракт завершения циклов (retry-cap + меню эскалации, evaluator-optimizer с выходом по плато) — **с анти-фабрикационным фенсом**: это runtime-поведение реального агента на отдельных проходах, НЕ просачивается в одно-проходный self-critique; handoff-блок + правило деградированного вывода; шаблон роли (NOT-RESPONSIBLE-FOR + failure-behavior); таксономия HITL-гейтов + предупреждение о пере-эскалации; clause «evidence-required» для review/QA; chooser уровней усилия (single-shot / multi-step / long-horizon — выбор, не обязательная лестница).
- **4 новых паттерна** в `patterns.md` (38 → **42**): #39 расплывчатый квалификатор → измеримое ограничение; #40 уязвимый к инъекциям / без OOD-fallback системный промпт → role-lock + фраза-fallback + санитизация; #41 переусложнённый/scope-creep промпт → scope self-check; #42 необработанный агентный сбой (silent/context failure) → схема-валидация + урезание инструкций.
- **Routing Index** наверху `tool-profiles.md` — таблица Tool / Handles / When-to-route (надмножество Gotchas; pick-a-row → открой один профиль). Синтаксис-преференции по моделям (Claude → XML-теги, GPT → persona-фрейминг) и evergreen-заметки по синтаксису image-инструментов (Midjourney/SD/Flux/ComfyUI).
- **`scripts/lint.ps1`** — релизный гейт (ERROR/WARN, exit 1 на ERROR): синхронизация версии, дрейф счётчика паттернов (читается из patterns.md, не хардкод), обязательные поля frontmatter, CRLF в `*.md`/`*.ps1`; WARN на бюджет строк ядра и footer-ссылку. Формализует разовые greps из v1.13. Адаптировано из lint-shape agency-agents (не копия их bash).
- **`.gitattributes`** — LF для `*.md/*.yml/*.yaml/*.sh/*.ps1/*.json` (репозиторий пишется на Windows).
- `docs/sources.md`: строки-обоснования новых техник + Divio-фрейминг references + editorial-тест «for the user, not the vendor».

### Changed
- **#23 анти-подхалимаж** (`SKILL.md`): внутренний дефолт-вердикт readiness-gate и self-critique инвертирован на **NEEDS REVISION**; повышение до READY — только при доказательстве по каждому критическому измерению. Остаётся внутренним (правило «никогда не показывать оценку/ярлык» сохранено).
- **#42 scope-creep + «Surface, don't smuggle»** (`SKILL.md` Token-Efficiency): scope self-check (удалить ограничения, которых не требует задача); замечания вне scope — в заметку после промпта, не в тело.
- **#35 память × бюджет вопросов** (`SKILL.md`): если вспомненная память отвечает на уточняющий вопрос — он считается решённым и не тратит лимит из 3; решения хранятся **с обоснованием**.
- `SKILL.md` Diagnostic Checklist: однострочные хуки — HITL-гейт с предупреждением о пере-эскалации (#29) и evidence-over-claims (#24). README: 5-second-test интро; счётчик паттернов 35/38 → 42.

## [1.13.0] - 2026-06-12

Закрытие трёх изъянов, найденных в живом тесте v1.12 (auth-refactor): дефолт-модель в Claude Code, условная token-экономия в агентных промптах и честный readiness-gate. Прирост always-loaded ядра — ~5 строк; вся объёмная логика в on-demand references.

### Changed
- **Профиль Claude Code: дефолт-модель — теперь Claude Fable 5** (закрывает регресс v1.11 — подпрофиль всё ещё указывал Opus 4.8). Opus 4.8/4.7 — по явному запросу или для benign-работы в Fable-refusal-доменах. Модель рекомендуется, не хардкодится (выбор за харнессом/конфигом).
- **Readiness-gate теперь различает «плейсхолдеры» и «открытые развилки»** (Intent Extraction): плейсхолдер — fill-in значение, развилка — решение, меняющее подход. Самая решающая развилка идёт первым вопросом; все оставшиеся развилки **обязательно** выносятся списком в заметку, а не маскируются под `[значение]`.
- Output format: тело промпта адресовано только целевому инструменту — setup/usage-советы для человека (новая сессия, замена значений, пререквизиты) уходят в заметку под промптом, не внутрь copyable-блока.
- Diagnostic Checklist: пункт «две задачи в одном» заострён под **refactor + migrate** (разносить с зелёными тестами между, либо обосновать слияние + флаг un-bisectable риска).

### Added
- **Условная model/effort-экономия в агентных промптах** (профиль Claude Code + Template M): одиночная scoped-задача → один сфокусированный проход без подагентов (дешевле всего); крупная multi-part работа → оркестратор на высоком effort (Fable 5) + делегирование независимых подзадач. Per-subagent модель задаётся конфигом, не телом промпта — управляем effort'ом и делегированием. **Сознательно НЕ «всегда тирить»** — оркестрация сама стоит токенов (обоснование в [docs/sources.md](docs/sources.md)).
- **Security-эквивалентность** в Diagnostic Checklist + Template M: рефактор/миграция в auth/crypto/payments → жёсткий инвариант «не понижать стойкость» (алгоритм подписи, hash-cost, constant-time, формат токенов/секретов).
- **Refactor/migration safety net** (Diagnostic Checklist + Template M): не предполагать наличие тестов — подтвердить/создать characterization-тесты до изменений; снято противоречие «тесты не меняются» vs миграция (поведенческие ассерты зелёные, обвязка — моки/импорты — может меняться).
- `docs/sources.md`: строки про forks≠placeholders и conditional-tiering-rationale.

## [1.12.0] - 2026-06-12

Селективный срез из v2 PRD — взято только то, что не раздувает токены и не конфликтует с hard rules; Council-style multi-critic, числовой uncertainty-коэффициент, 4–5 вопросов и формальные Lean/Thorough-режимы **отклонены** (обоснование в [docs/sources.md](docs/sources.md)).

### Added
- **Internal readiness gate** в Intent Extraction: качественная оценка Low/Med/High **только для решения скилла** (наружу не выводится — ни число, ни ярлык). При Medium/Low — вопросы-развилки, ранжированные по влиянию; жёсткий cap 3 вопроса; при остаточной неопределённости — best-effort промпт с явными допущениями + флаг открытых вопросов.
- **Single-pass structured Self-Critique** (апгрейд RECENCY ZONE) по 5 фиксированным измерениям: Clarity & Scope, Output Contract & Parseability, Token Efficiency, Model-Aware Fit, Completeness. Один проход, internal-only, без итераций и без имитации мульти-персоны (в отличие от Council-варианта PRD).
- **Canonical Prompt Structure** в `templates.md` — дефолт-скелет для текстовых LLM-промптов (Role → Outcome+Success → Context → Structured Input → Positive instructions → Conditional CoT/few-shot → Output contract); явно НЕ для image/video/voice/workflow.
- **`docs/sources.md`** — обоснование техник со ссылками + список сознательно отклонённых пунктов PRD (human-facing, вне runtime).
- Output format: пункт про note с допущениями/открытыми вопросами при достижении cap'а в 3 вопроса.

### Changed
- Identity: добавлена строка «внутренний анализ кратко и молча, рассуждения не выводить» — токен-дисциплина + усиление `reasoning_extraction`-правила Fable 5.
- RECENCY ZONE переименована: Verification → **Self-Critique** and Success Lock.

## [1.11.0] - 2026-06-11

### Changed
- **Дефолтная модель Claude в роутинге — теперь Fable 5** (разворот решения 1.8.0). Когда пользователь говорит «Claude» без указания версии, скилл целится в Claude Fable 5 / Mythos 5. Opus 4.8 / 4.7 — selectable fallback (по явному запросу или для benign-работы в доменах, где Fable 5 отказывает: offensive-security, biology/life-sciences). Обновлены `tool-profiles.md` (Claude-блок + подзаголовок Opus → «selectable fallback»), `SKILL.md` Gotchas (Fable 5 первым) и `models.md` (Fable 5 помечена как дефолтный routing-target, факт о харнесс-дефолте Opus 4.8 сохранён).
- Описания плагина/маркетплейса: Claude Fable 5 указана дефолтом; счётчик паттернов исправлен 35 → 38. README: строки Claude в таблице помечены «(default)» / «(fallback)».

## [1.10.0] - 2026-06-11

Две идеи из апстрим-PR: Cortex Code ([nidhinjs#15](https://github.com/nidhinjs/prompt-master/pull/15)) и датированный fact-sheet моделей с протоколом ре-верификации ([nidhinjs#48](https://github.com/nidhinjs/prompt-master/pull/48)).

### Added
- **Профиль Cortex Code** (Snowflake CLI-агент) в `tool-profiles.md`: anti-over-engineering guard, `cortex ctx` step-tracking, Snowflake-native инструменты, headless JSON-режим. Добавлен в README («Works with» + таблица профилей).
- **`references/models.md`** — датированный fact-sheet volatile-фактов (ID моделей, дефолты, version-tied параметры, что снято) по вендорам, каждая секция с `last-verified`. **Протокол: ре-верифицировать секцию старше 60 дней перед утверждением.** Быстро меняющиеся вендоры помечены `⚠️ verify`, а не выдуманы.
- **Pattern #38** «hardcoded retired model / dead parameter» в `patterns.md` (теперь 38 паттернов).
- Gotcha «Stale model facts» в `SKILL.md`.

### Changed
- `SKILL.md` Tool Routing: добавлен указатель на `models.md` + протокол ре-верификации; таблица Reference Files дополнена строкой `models.md`.
- `tool-profiles.md`: шапка указывает на `models.md` как на слой volatile-фактов (профили несут evergreen-советы, не point-in-time спеки моделей).

## [1.9.0] - 2026-06-11

Progressive disclosure (идея из апстрим-PR [nidhinjs#13](https://github.com/nidhinjs/prompt-master/pull/13)): tool-профили вынесены из `SKILL.md` и грузятся по требованию — меньше токенов на активацию и меньше «шумовых» инструкций, конкурирующих за внимание.

### Added
- **`references/tool-profiles.md`** — все ~28 per-tool профилей (Claude, Fable 5, GPT-5.x, reasoning-модели, агентные IDE, image/video/voice/3D/workflow AI, Prompt Decompiler, Unknown tool). Читается только секция под идентифицированный инструмент.
- **Секция Gotchas** в `SKILL.md` — быстрый чеклист самых частых per-tool ошибок (9 пунктов), ловит их без загрузки полного профиля.

### Changed
- **`SKILL.md` ужат**: блок Tool Routing с инлайн-профилями заменён on-demand указателем на `tool-profiles.md`. Ядро (identity, hard rules, intent extraction, diagnostics, memory, safe techniques, verification) и универсальные правила (Credential Safety, Input Sanitization) остаются всегда загруженными.
- Таблица Reference Files дополнена строкой `tool-profiles.md`.

## [1.8.0] - 2026-06-11

### Added
- **Маркетплейс-установка Claude Code.** Репозиторий теперь работает как плагин-маркетплейс: `.claude-plugin/marketplace.json` + `plugins/prompt-master/.claude-plugin/plugin.json`. Установка через `/plugin marketplace add azagreev/prompt-master-za` → `/plugin install prompt-master@prompt-master`.
- **Роутинг под Claude Fable 5 / Mythos 5** — отдельный блок: effort как главный рычаг (`high` по умолчанию), steer короткой интенцией вместо перечня правил, ground progress claims на длинных прогонах, явные boundaries, параллельные субагенты, memory-система.
- **Hard rule про `reasoning_extraction`** — запрет инструктировать Fable 5/Mythos 5 «покажи/воспроизведи свои рассуждения» (триггерит refusal и фолбэк на Opus 4.8); вместо этого — send-to-user tool.
- **Раздел Model-fit failures** в Diagnostic Checklist: over-specification для GPT-5.5/Fable 5, злоупотребление абсолютами, hardcoded effort, legacy-стек инструкций.

### Changed
- **Реструктуризация под плагин:** `SKILL.md` и `references/` перенесены в `plugins/prompt-master/skills/prompt-master/`.
- **Роутинг GPT-5.x переписан под GPT-5.5** (актуальный гайд OpenAI): outcome-first вместо пошагового процесса, `text.verbosity` для длины, перепроверка `low`/`medium` reasoning effort, preambles для tool-задач, retrieval budgets, отказ от лишних абсолютов и legacy-стека инструкций.
- Дефолтная модель Claude в роутинге остаётся Opus 4.8; Fable 5 добавлена как отдельная, более мощная опция с указателем из блока Claude.

## [1.7.0]
- Opus 4.8 compatibility. Claude 4.x routing стал version-aware: durable-советы обобщены на 4.6/4.7/4.8, добавлен профиль Opus 4.8 (дефолт), сохранён Opus 4.7. De-hardcoded effort-level (теперь harness-managed). Template M и pattern 36 покрывают 4.7/4.8.

## [1.6.0]
- Opus 4.7 update. Добавлен Template M (Opus 4.7 Task Brief). Обновлён роутинг Claude и Claude Code под литерализм, adaptive thinking, xhigh effort и session hygiene. Паттерны 36–37.

## [1.5.0]
- Расширен роутинг инструментов: Agentic AI и 3D Model AI. Description приведён к 189 символам. Убрана оценка токенов из вывода. Добавлен instruction layer и copywriting-плейсхолдеры.

## [1.4.0]
- Детекция reference image editing, поддержка ComfyUI, режим Prompt Decompiler. Исправлен trigger description. 3 новых шаблона в references.

## [1.3.0]
- Перестройка вокруг позиционной структуры PAC2026 (30/55/15). Silent routing вместо user-facing выбора фреймворка. Введён каталог references.

## [1.2.0]
- Реструктуризация под attention architecture. Убраны fabrication-prone техники (ToT, GoT, USC, prompt chaining). Шаблоны и паттерны вынесены в references.

## [1.1.0]
- Расширено покрытие инструментов, добавлена memory-block система и 35 credit-killing паттернов.

## [1.0.0]
- Первый релиз.

<!-- Версии 1.0.0–1.7.0 предшествуют форк-релизу в маркетплейс и в этом репозитории не тегированы. Footer-ссылки добавляются начиная с 1.8.0. -->

[1.37.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.37.0
[1.36.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.36.0
[1.35.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.35.0
[1.34.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.34.0
[1.33.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.33.0
[1.32.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.32.0
[1.31.1]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.31.1
[1.31.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.31.0
[1.30.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.30.0
[1.29.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.29.0
[1.28.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.28.0
[1.27.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.27.0
[1.26.3]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.26.3
[1.26.2]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.26.2
[1.26.1]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.26.1
[1.26.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.26.0
[1.25.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.25.0
[1.24.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.24.0
[1.23.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.23.0
[1.22.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.22.0
[1.21.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.21.0
[1.20.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.20.0
[1.19.1]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.19.1
[1.19.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.19.0
[1.18.1]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.18.1
[1.18.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.18.0
[1.17.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.17.0
[1.16.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.16.0
[1.15.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.15.0
[1.14.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.14.0
[1.13.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.13.0
[1.12.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.12.0
[1.11.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.11.0
[1.10.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.10.0
[1.9.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.9.0
[1.8.0]: https://github.com/azagreev/prompt-master-za/releases/tag/v1.8.0
