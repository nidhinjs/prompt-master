# Project Instructions

- Do not run `scripts/run-golden.js`, `claude -p`, or any test/check that uses the real Claude runner unless the user explicitly re-authorizes it in the current conversation.
- Fake-Claude safety tests are allowed when they replace `claude` through a temporary `PATH` and prove that no real Claude CLI is invoked.
