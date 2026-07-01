#!/usr/bin/env node
// Fixture tests for plugins/prompt-master/hooks/multi-agent-detect.js.
// Runs the hook as a child process (same way Claude Code invokes it) and
// asserts whether it fires (non-empty stdout) for each fixture.
// Usage: node scripts/test-hook.js   → exit 0 all green / exit 1 on failure.

const { spawnSync } = require('child_process');
const path = require('path');

const HOOK = path.join(
  __dirname,
  '..',
  'plugins',
  'prompt-master',
  'hooks',
  'multi-agent-detect.js'
);

// [prompt, shouldFire, why]
const FIXTURES = [
  // --- positives: prompt-authoring intent + multi-agent signal ---
  ['напиши промпт для оркестратора агентов', true, 'RU orchestrator'],
  ['improve my prompt for a multi-agent pipeline', true, 'EN multi-agent'],
  ['создай промпт: команда агентов для ресёрча', true, 'RU команда агентов (nominative)'],
  ['напиши промпт — создай команду агентов для ресёрча', true, 'RU команду (accusative)'],
  ['промпт для работы с командой агентов', true, 'RU командой (instrumental)'],
  ['промпт про взаимодействие команд агентов', true, 'RU команд (genitive plural)'],
  ['write a prompt for an agent swarm', true, 'EN agent swarm'],
  ['prompt for a team of agents doing research', true, 'EN team of agents'],
  ['сделай промпт: рой агентов сканирует логи', true, 'RU рой агентов'],
  ['prompt with sub-agents and fan-out', true, 'EN sub-agents'],
  // --- negatives: must stay silent ---
  ['напиши промпт: настрой агента поддержки', false, 'наст-рой is a verb, single agent'],
  ['улучши промпт — построй агента для тикетов', false, 'пост-рой is a verb'],
  ['fix my agentic pipeline so it responds promptly', false, 'promptly is not prompt-authoring'],
  ['respond promptly to agentic workflow questions', false, 'promptly again'],
  ['напиши промпт для агента поддержки', false, 'bare агент is excluded by design'],
  ['help me write a prompt for Midjourney', false, 'no multi-agent signal'],
  ['configure the user agent header for this request', false, 'no prompt-authoring intent'],
  ['our team of agents needs new laptops', false, 'agents but no prompt intent'],
];

let failed = 0;
for (const [prompt, shouldFire, why] of FIXTURES) {
  const res = spawnSync('node', [HOOK], {
    input: JSON.stringify({ prompt }),
    encoding: 'utf8',
  });
  if (res.status !== 0) {
    console.error(`FAIL (exit ${res.status}): "${prompt}" — hook must always exit 0`);
    failed++;
    continue;
  }
  const fired = res.stdout.trim().length > 0;
  if (fired !== shouldFire) {
    console.error(
      `FAIL: "${prompt}" — expected fire=${shouldFire} (${why}), got fire=${fired}`
    );
    failed++;
  }
}

if (failed) {
  console.error(`\n${failed}/${FIXTURES.length} fixtures failed`);
  process.exit(1);
}
console.log(`OK: ${FIXTURES.length}/${FIXTURES.length} hook fixtures passed`);
