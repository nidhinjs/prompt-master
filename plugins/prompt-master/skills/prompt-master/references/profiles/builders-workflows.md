# Builder and workflow profiles

Load this bundle only when [tool-profiles.md](../tool-profiles.md) selects it.
It is self-contained: define the requested artifact or automation, supplied
inputs, constraints, exclusions, acceptance criteria, approval boundaries, and
output format. Use the relevant structure from [templates.md](../templates.md)
and apply [agentic.md](../agentic.md) whenever tools can write or act externally.

## Registry boundary

For a named provider, resolve its route alias in
[facts/index.json](../facts/index.json) and read only the referenced provider
shard. The registry alone owns model IDs, defaults, release channels,
availability, endpoint/parameter values, credit terms, and status dates. A
provider with no volatile model facts may use the explicit
`none (evergreen-only)`
sentinel in [tool-profiles.md](../tool-profiles.md); verify capabilities locally
instead of inventing a record. Missing facts route to
[decompiler-fallback.md](decompiler-fallback.md).

## Bolt / v0 / Lovable / Figma Make / Google Stitch

- State stack and runtime constraints, desired screens/components, data boundary,
  frontend/backend/database responsibilities, and what must not be scaffolded.
- Prevent feature bloat explicitly: no authentication, theme variants, pages,
  abstractions, or infrastructure unless requested.
- Give clear component boundaries and a “Done when” checklist with functional
  and visual verification.
- For design-forward builders, describe visual hierarchy, interaction intent,
  states, accessibility, and responsive behavior; reference supplied design
  component names directly.
- For framework-native builders, state whether output must target another stack;
  never infer the framework from the product name.
- For full-stack builders, separate frontend, backend, storage, and migrations;
  stop before external services or schema changes without approval.
- For prompt-to-UI tools, describe the interface goal and named design system,
  not implementation steps.

## Gamma / AI presentations

Gamma produces card-based decks. Use [templates.md](../templates.md) Template O
for the structure.

- Pick the workflow by input: generate from a brief, paste structured notes,
  import a file/URL, or use the verified programmatic surface. Keep exact command
  and field names in registry-backed setup guidance.
- Card count, text density, image source, tone, audience, and format are setup
  controls. Put only unspecified choices in an overridable `Assumed settings:`
  note and mirror essential intent in the prompt.
- State an exact requested card count; never rely on a current default or an
  unverified heuristic.
- Prevent fabricated data: supply real figures or require explicit
  `[placeholder]` values for the user to fill.
- Treat exact layout/spacing, saved brand themes, and post-generation animation
  or transitions as product controls, not promises made by prompt prose.
- Do not hardcode credit cost or other commercial terms.

## Workflow AI (Zapier, Make, n8n)

- Express the recipe as trigger app + trigger event, then numbered actions and
  explicit field mappings.
- State authentication prerequisites (“assumes the app is already connected”)
  without requesting or embedding credentials.
- For each step, name its input, output, and data passed to the next step.
- Include branching, retries, idempotency/deduplication, error handling, and an
  audit/log destination when the task requires them.
- Separate a dry-run/test path from activation. Stop before enabling schedules,
  sending messages, modifying records, charging accounts, or other external
  effects unless the user authorizes that action.
- Verify connector actions and field schemas in the user's active workspace;
  never infer them from another automation platform.
