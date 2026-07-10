#!/usr/bin/env node
// Safe local/CI verification. Never calls the real Claude CLI.

const { spawnSync } = require('child_process');

const commands = [
  [process.execPath, ['scripts/test-hook.js']],
  [process.execPath, ['scripts/lint.js']],
  [process.execPath, ['--check', 'scripts/run-golden.js']],
  [process.execPath, ['scripts/test-golden-regex.js']],
  [process.execPath, ['scripts/test-run-golden-safe.js']],
];

function safeEnv() {
  const env = { ...process.env, NO_LIVE_MODEL_CALLS: '1' };
  for (const key of [
    'PROMPT_MASTER_ALLOW_CLAUDE_RUNNER',
    'PROMPT_MASTER_ALLOW_FULL_GOLDEN',
    'PROMPT_MASTER_CLAUDE_BIN',
    'PROMPT_MASTER_MAX_LIVE_CALLS',
    'PROMPT_MASTER_SCENARIO_TIMEOUT_MS',
    'PROMPT_MASTER_SUITE_TIMEOUT_MS',
  ]) {
    delete env[key];
  }
  return env;
}

let failed = 0;
let skipped = 0;
for (const [cmd, args] of commands) {
  const label = ['node', ...args].join(' ');
  const res = spawnSync(cmd, args, {
    encoding: 'utf8',
    stdio: 'pipe',
    env: safeEnv(),
  });
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);
  if (res.error?.code === 'EPERM' && !res.stdout && !res.stderr) {
    skipped++;
    console.warn(`SKIP (sandbox EPERM): ${label}`);
    continue;
  }
  if (res.error || res.status !== 0) {
    failed++;
    console.error(`FAIL: ${label}`);
    if (res.error) console.error(res.error.message);
  }
}

if (failed) {
  console.error(`\n${failed}/${commands.length} safe checks failed`);
  process.exit(1);
}
console.log(`OK: ${commands.length - skipped}/${commands.length} safe checks passed${skipped ? ` (${skipped} skipped by sandbox)` : ''}`);
