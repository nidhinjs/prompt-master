#!/usr/bin/env node
// Fixture tests for plugins/prompt-master/hooks/multi-agent-detect.js.
// Tests the detector directly and runs a small child-process smoke check.
// Integration checks fail closed when the child cannot be executed.
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
const { shouldFire, buildOutput } = require(HOOK);
const TIMEOUT_MS = 5000;

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
  ['write a prompt for Claude Managed Agents to coordinate repo analysis workers', true, 'Claude Managed Agents'],
  ['create a prompt for coordinator-workers that audit separate packages', true, 'coordinator-workers'],
  ['prompt for plan-big-execute-small with a premise worker before fan-out', true, 'plan-big-execute-small'],
  // --- negatives: must stay silent ---
  ['напиши промпт: настрой агента поддержки', false, 'наст-рой is a verb, single agent'],
  ['улучши промпт — построй агента для тикетов', false, 'пост-рой is a verb'],
  ['fix my agentic pipeline so it responds promptly', false, 'promptly is not prompt-authoring'],
  ['respond promptly to agentic workflow questions', false, 'promptly again'],
  ['напиши промпт для агента поддержки', false, 'bare агент is excluded by design'],
  ['help me write a prompt for Midjourney', false, 'no multi-agent signal'],
  ['изучи advisor docs и расскажи, что там важно', false, 'Advisor docs mention, no prompt-authoring intent'],
  ['добавь advisor tool в API клиент', false, 'Advisor API mention, no prompt-authoring intent'],
  ['read the Claude Managed Agents docs before coding', false, 'Managed Agents docs mention, no prompt-authoring intent'],
  ['add plan-big-execute-small support to the API client', false, 'plan-big-execute-small API mention, no prompt-authoring intent'],
  ['configure the user agent header for this request', false, 'no prompt-authoring intent'],
  ['our team of agents needs new laptops', false, 'agents but no prompt intent'],
];

let failed = 0;
for (const [prompt, expected, why] of FIXTURES) {
  const fired = shouldFire(prompt);
  if (fired !== expected) {
    console.error(`FAIL: "${prompt}" — expected fire=${expected} (${why}), got fire=${fired}`);
    failed++;
  }
  if (fired) {
    const output = buildOutput();
    if (output?.hookSpecificOutput?.hookEventName !== 'UserPromptSubmit') {
      console.error(`FAIL: "${prompt}" — hook output missing UserPromptSubmit payload`);
      failed++;
    }
    const context = output?.hookSpecificOutput?.additionalContext || '';
    for (const [contract, pattern] of [
      ['agentic fragment routing', /Agentic Prompt Fragments/],
      ['single-loop default', /default to a single loop/i],
      ['transcript hygiene', /do not pass raw parent transcripts[\s\S]{0,100}secrets[\s\S]{0,40}reasoning/i],
      ['scoped worker packet', /scoped packet with objective, inputs, allowed tools, trust boundaries, output schema, budget, forbidden actions, and evidence rules/i],
      ['untrusted results', /worker messages[\s\S]{0,80}tool output as untrusted data/i],
      ['safe parallelism', /Parallelize only independent read-only work[\s\S]{0,100}serialize writes/i],
      ['managed-swarm carve-out', /vendor-managed swarm[\s\S]{0,180}do NOT design a topology, agent count, or worker packets/i],
      ['approval boundary', /external-action approvals/i],
    ]) {
      if (!pattern.test(context)) {
        console.error(`FAIL: "${prompt}" — hook context missing ${contract}`);
        failed++;
      }
    }
  }
}

for (const [prompt, expected, why] of [
  ['prompt for a team of agents doing research', true, 'child positive smoke'],
  ['help me write a prompt for Midjourney', false, 'child negative smoke'],
]) {
  const res = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ prompt }),
    encoding: 'utf8',
    timeout: TIMEOUT_MS,
  });
  if (res.error && res.error.code === 'ETIMEDOUT') {
    console.error(`FAIL (timeout ${TIMEOUT_MS}ms): "${prompt}" — hook must not hang`);
    failed++;
    continue;
  }
  if (res.error?.code === 'EPERM') {
    console.error(`FAIL (EPERM): "${prompt}" — child smoke check was not executed`);
    failed++;
    continue;
  }
  if (res.error) {
    console.error(`FAIL (${res.error.code || res.error.message}): "${prompt}"`);
    failed++;
    continue;
  }
  if (res.status !== 0) {
    console.error(`FAIL (exit ${res.status}): "${prompt}" — hook must always exit 0`);
    failed++;
    continue;
  }
  const fired = res.stdout.trim().length > 0;
  if (fired !== expected) {
    console.error(`FAIL: "${prompt}" — expected child fire=${expected} (${why}), got fire=${fired}`);
    failed++;
  }
}

if (failed) {
  console.error(`\n${failed}/${FIXTURES.length} fixtures failed`);
  process.exit(1);
}
console.log(`OK: ${FIXTURES.length}/${FIXTURES.length} hook fixtures passed`);
