#!/usr/bin/env node
// Safety regression tests for scripts/run-golden.js.
// Uses a fake `claude` binary in PATH. Never calls the real Claude CLI.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.join(__dirname, '..');
const runner = path.join(repoRoot, 'scripts/run-golden.js');
const liveEnvKeys = [
  'NO_LIVE_MODEL_CALLS',
  'PROMPT_MASTER_ALLOW_CLAUDE_RUNNER',
  'PROMPT_MASTER_ALLOW_FULL_GOLDEN',
  'PROMPT_MASTER_CLAUDE_BIN',
  'PROMPT_MASTER_MAX_LIVE_CALLS',
  'PROMPT_MASTER_SCENARIO_TIMEOUT_MS',
  'PROMPT_MASTER_SUITE_TIMEOUT_MS',
];

function withoutLiveEnv() {
  const env = { ...process.env };
  for (const key of liveEnvKeys) delete env[key];
  return env;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const nestedSpawnProbe = spawnSync(process.execPath, ['-e', 'process.exit(0)'], { encoding: 'utf8' });
if (nestedSpawnProbe.error?.code === 'EPERM' && nestedSpawnProbe.status == null) {
  console.warn('SKIP: nested Node spawn is blocked by this sandbox (EPERM)');
  process.exit(0);
}
const runnerSpawnProbe = spawnSync(process.execPath, [runner, '--only', 'candidate-set-explicit-variants'], {
  cwd: repoRoot,
  env: withoutLiveEnv(),
  encoding: 'utf8',
});
if (runnerSpawnProbe.error?.code === 'EPERM' && !runnerSpawnProbe.stdout && !runnerSpawnProbe.stderr) {
  console.warn('SKIP: runner subprocess output is blocked by this sandbox (EPERM)');
  process.exit(0);
}

function makeFakeClaude() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-master-fake-claude-'));
  const marker = path.join(dir, 'calls.log');
  const fake = path.join(dir, 'claude');
  fs.writeFileSync(
    fake,
    [
      '#!/bin/sh',
      'printf "call\\n" >> "$FAKE_CLAUDE_MARKER"',
      'if [ "$1" = "--version" ]; then echo "fake claude"; exit 0; fi',
      'case "$FAKE_CLAUDE_MODE" in',
      '  not-logged) echo "Not logged in · Please run /login" >&2; exit 1 ;;',
      '  fail) echo "model failed" >&2; exit 1 ;;',
      '  slow) sleep 2; echo "late"; exit 0 ;;',
      '  assert-fail) echo "Variant A only"; exit 0 ;;',
      '  *)',
      '    echo "Variant A"',
      '    echo "Fit: matches the request"',
      '    echo "Risk / tradeoff: narrow"',
      '    echo "When to use: when this direction fits"',
      '    echo "Prompt: write the campaign"',
      '    exit 0',
      '    ;;',
      'esac',
      '',
    ].join('\n'),
    { mode: 0o755 }
  );
  return { dir, marker };
}

function runRunner(args, envOverrides = {}) {
  const fake = makeFakeClaude();
  const env = {
    ...withoutLiveEnv(),
    ...envOverrides,
    PATH: `${fake.dir}${path.delimiter}${process.env.PATH || ''}`,
    FAKE_CLAUDE_MARKER: fake.marker,
  };
  const res = spawnSync(process.execPath, [runner, ...args], {
    cwd: repoRoot,
    env,
    encoding: 'utf8',
    timeout: 5000,
  });
  const marker = fs.existsSync(fake.marker) ? fs.readFileSync(fake.marker, 'utf8') : '';
  return { ...res, marker, combined: `${res.stdout || ''}${res.stderr || ''}` };
}

const cases = [
  function disabledBeforeClaudeCall() {
    const res = runRunner(['--only', 'candidate-set-explicit-variants']);
    assert(res.status === 2, `disabled runner should exit 2, got ${res.status}`);
    assert(!res.marker, 'disabled runner must not call fake claude');
    assert(/Refusing to run Claude golden scenarios/.test(res.combined), 'missing disabled-runner refusal');
  },

  function boundedRunRequired() {
    const res = runRunner([], { PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1' });
    assert(res.status === 2, `unbounded runner should exit 2, got ${res.status}`);
    assert(!res.marker, 'unbounded runner must not call fake claude');
    assert(/Refusing to run the full live golden suite/.test(res.combined), 'missing full-suite refusal');
  },

  function onlyRunsOneFakeCall() {
    const res = runRunner(['--only', 'candidate-set-explicit-variants'], {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
    });
    assert(res.status === 0, `bounded fake run should pass, got ${res.status}: ${res.combined}`);
    assert(res.marker.trim().split('\n').length === 1, 'bounded --only should call fake claude exactly once');
  },

  function liveCallBudgetBlocksBeforeCall() {
    const res = runRunner(['--max-scenarios', '3'], {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '2',
    });
    assert(res.status === 2, `budget refusal should exit 2, got ${res.status}`);
    assert(!res.marker, 'budget refusal must happen before fake claude is called');
  },

  function notLoggedInIsEnvError() {
    const res = runRunner(['--only', 'candidate-set-explicit-variants'], {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
      FAKE_CLAUDE_MODE: 'not-logged',
    });
    assert(res.status === 1, `not-logged should fail, got ${res.status}`);
    assert(/ENV_ERROR/.test(res.combined), 'not-logged must be classified as ENV_ERROR');
  },

  function timeoutIsTimeout() {
    const res = runRunner(['--only', 'candidate-set-explicit-variants'], {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
      PROMPT_MASTER_SCENARIO_TIMEOUT_MS: '50',
      FAKE_CLAUDE_MODE: 'slow',
    });
    assert(res.status === 1, `timeout should fail, got ${res.status}`);
    assert(/TIMEOUT/.test(res.combined), 'slow fake claude must be classified as TIMEOUT');
  },

  function regexMismatchIsAssertFail() {
    const res = runRunner(['--only', 'candidate-set-explicit-variants'], {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
      FAKE_CLAUDE_MODE: 'assert-fail',
    });
    assert(res.status === 1, `assert fail should exit 1, got ${res.status}`);
    assert(/ASSERT_FAIL/.test(res.combined), 'regex mismatch must be classified as ASSERT_FAIL');
  },
];

let failed = 0;
for (const testCase of cases) {
  try {
    testCase();
  } catch (error) {
    failed++;
    console.error(`FAIL ${testCase.name}: ${error.message}`);
  }
}

if (failed) {
  console.error(`\n${failed}/${cases.length} run-golden safety tests failed`);
  process.exit(1);
}
console.log(`OK: ${cases.length}/${cases.length} run-golden safety tests passed`);
