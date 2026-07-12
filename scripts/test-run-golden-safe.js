#!/usr/bin/env node
// Safety regression tests for scripts/run-golden.js.
// Uses an absolute Node test adapter, an isolated PATH, and a preload deny
// guard. Never resolves or starts the real Claude CLI.

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  createClaudeDenyGuard,
  deleteEnvCaseInsensitive,
  removeClaudeDenyGuard,
  withClaudeDenyGuard,
} = require('./test-safe');

const repoRoot = path.join(__dirname, '..');
const runner = path.join(repoRoot, 'scripts/run-golden.js');
const fakeClaudeScript = path.join(repoRoot, 'scripts/fake-claude.js');
const isolatedEnvKeys = [
  'NO_LIVE_MODEL_CALLS',
  'PROMPT_MASTER_ALLOW_CLAUDE_RUNNER',
  'PROMPT_MASTER_ALLOW_FULL_GOLDEN',
  'PROMPT_MASTER_CLAUDE_BIN',
  'PROMPT_MASTER_TEST_CLAUDE_SCRIPT',
  'PROMPT_MASTER_MAX_LIVE_CALLS',
  'PROMPT_MASTER_SCENARIO_TIMEOUT_MS',
  'PROMPT_MASTER_SUITE_TIMEOUT_MS',
  'PROMPT_MASTER_DENY_REAL_CLAUDE',
  'PROMPT_MASTER_CLAUDE_DENY_MARKER',
  'PROMPT_MASTER_SAFE_GIT',
  'FAKE_CLAUDE_MARKER',
  'FAKE_CLAUDE_MODE',
  'FAKE_CLAUDE_DELAY_MS',
];

function isolatedEnv(source = process.env) {
  const env = { ...source };
  const isolated = new Set(isolatedEnvKeys.map((key) => key.toLowerCase()));
  for (const key of Object.keys(env)) {
    if (isolated.has(key.toLowerCase())) delete env[key];
  }
  return env;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJsonLines(file) {
  if (!fs.existsSync(file)) return [];
  return fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).map((line) => JSON.parse(line));
}

function writeHarmlessClaude(dir) {
  const executable = path.join(dir, process.platform === 'win32' ? 'claude.cmd' : 'claude');
  const body = process.platform === 'win32'
    ? ['@echo off', '>> "%HARMLESS_CLAUDE_EXEC_MARKER%" echo executed', 'exit /b 0', ''].join('\r\n')
    : ['#!/bin/sh', 'printf "executed\\n" >> "$HARMLESS_CLAUDE_EXEC_MARKER"', 'exit 0', ''].join('\n');
  fs.writeFileSync(executable, body);
  if (process.platform !== 'win32') fs.chmodSync(executable, 0o700);
  return executable;
}

assert(path.isAbsolute(process.execPath), 'process.execPath must be absolute');
assert(path.isAbsolute(fakeClaudeScript), 'tracked fake Claude script path must be absolute');
assert(fs.existsSync(fakeClaudeScript), 'tracked fake Claude script is missing');

const nestedSpawnProbe = spawnSync(process.execPath, ['-e', 'process.exit(0)'], { encoding: 'utf8' });
if (nestedSpawnProbe.error?.code === 'EPERM' && nestedSpawnProbe.status == null) {
  console.error('FAIL: nested Node spawn is blocked by this sandbox (EPERM)');
  process.exit(1);
}
if (nestedSpawnProbe.error || nestedSpawnProbe.status !== 0) {
  console.error(`FAIL: nested Node spawn probe failed: ${nestedSpawnProbe.error || nestedSpawnProbe.status}`);
  process.exit(1);
}

function runRunner(args, envOverrides = {}, options = {}) {
  const evidenceDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-master-fake-claude-'));
  const fakeMarker = path.join(evidenceDir, 'fake-calls.ndjson');
  const denyGuard = createClaudeDenyGuard();
  const baseEnv = {
    ...isolatedEnv(),
    ...envOverrides,
    FAKE_CLAUDE_MARKER: fakeMarker,
  };
  if (options.useTestAdapter !== false) {
    baseEnv.PROMPT_MASTER_TEST_CLAUDE_SCRIPT = options.testScript || fakeClaudeScript;
  }
  const env = withClaudeDenyGuard(baseEnv, denyGuard);
  if (options.usePreload === false) {
    deleteEnvCaseInsensitive(env, ['NODE_OPTIONS', 'PROMPT_MASTER_DENY_REAL_CLAUDE']);
  }
  let res;
  try {
    res = spawnSync(process.execPath, [runner, ...args], {
      cwd: repoRoot,
      env,
      encoding: 'utf8',
      timeout: 5000,
    });
    const fakeCalls = readJsonLines(fakeMarker);
    const denyCalls = readJsonLines(denyGuard.markerFile);
    return {
      ...res,
      fakeCalls,
      denyCalls,
      pathWasIsolated: env.PATH === denyGuard.dir,
      combined: `${res.stdout || ''}${res.stderr || ''}`,
    };
  } finally {
    removeClaudeDenyGuard(denyGuard);
    fs.rmSync(evidenceDir, { recursive: true, force: true });
  }
}

const oneScenario = ['--only', 'candidate-set-explicit-variants'];

const cases = [
  function inheritedSensitiveEnvIsRemovedCaseInsensitively() {
    const source = {};
    for (const key of isolatedEnvKeys) source[key.toLowerCase()] = 'unsafe';
    source.KEEP_ME = 'yes';
    const env = isolatedEnv(source);
    const remaining = new Set(Object.keys(env).map((key) => key.toLowerCase()));
    for (const key of isolatedEnvKeys) {
      assert(!remaining.has(key.toLowerCase()), `isolatedEnv must remove case variant of ${key}`);
    }
    assert(env.KEEP_ME === 'yes', 'isolatedEnv must preserve unrelated keys');
  },

  function disabledBeforeFakeCall() {
    const res = runRunner(oneScenario);
    assert(res.status === 2, `disabled runner should exit 2, got ${res.status}`);
    assert(res.fakeCalls.length === 0, 'disabled runner must not call fake Claude');
    assert(res.denyCalls.length === 0, 'disabled runner must not attempt real Claude');
    assert(/Refusing to run Claude golden scenarios/.test(res.combined), 'missing disabled-runner refusal');
  },

  function noLiveModelCallsOverridesOptIn() {
    const res = runRunner(oneScenario, {
      NO_LIVE_MODEL_CALLS: '1',
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
    });
    assert(res.status === 2, `NO_LIVE_MODEL_CALLS should exit 2, got ${res.status}`);
    assert(res.fakeCalls.length === 0, 'NO_LIVE_MODEL_CALLS must block before fake invocation');
    assert(res.denyCalls.length === 0, 'NO_LIVE_MODEL_CALLS must block before real resolution');
  },

  function boundedRunRequired() {
    const res = runRunner([], { PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1' });
    assert(res.status === 2, `unbounded runner should exit 2, got ${res.status}`);
    assert(res.fakeCalls.length === 0, 'unbounded runner must not call fake Claude');
    assert(/Refusing to run the full live golden suite/.test(res.combined), 'missing full-suite refusal');
  },

  function onlyRunsOneRedactedFakeCall() {
    const res = runRunner(oneScenario, {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
    });
    assert(res.status === 0, `bounded fake run should pass, got ${res.status}: ${res.combined}`);
    assert(res.fakeCalls.length === 1, 'bounded --only should call fake Claude exactly once');
    assert(res.denyCalls.length === 0, 'absolute Node fake must not resolve real Claude');
    const call = res.fakeCalls[0];
    assert(call.kind === 'fake-claude-call', 'fake marker kind mismatch');
    assert(call.model === 'sonnet', 'fake marker must record the selected model');
    assert(/^[a-f0-9]{64}$/.test(call.request?.sha256 || ''), 'request must be recorded only by SHA-256');
    assert(/^[a-f0-9]{64}$/.test(call.system_prompt?.sha256 || ''), 'system prompt must be recorded only by SHA-256');
    assert(!Object.hasOwn(call, 'argv'), 'fake marker must not store raw argv');
  },

  function liveCallBudgetBlocksBeforeCall() {
    const res = runRunner(['--max-scenarios', '3'], {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '2',
    });
    assert(res.status === 2, `budget refusal should exit 2, got ${res.status}`);
    assert(res.fakeCalls.length === 0, 'budget refusal must happen before fake Claude is called');
  },

  function notLoggedInIsEnvError() {
    const res = runRunner(oneScenario, {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
      FAKE_CLAUDE_MODE: 'not-logged',
    });
    assert(res.status === 1, `not-logged should fail, got ${res.status}`);
    assert(/ENV_ERROR/.test(res.combined), 'not-logged must be classified as ENV_ERROR');
  },

  function modelFailureIsModelError() {
    const res = runRunner(oneScenario, {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
      FAKE_CLAUDE_MODE: 'model-error',
    });
    assert(res.status === 1, `model error should fail, got ${res.status}`);
    assert(/MODEL_ERROR/.test(res.combined), 'generic fake failure must be classified as MODEL_ERROR');
  },

  function timeoutIsTimeout() {
    const res = runRunner(oneScenario, {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
      PROMPT_MASTER_SCENARIO_TIMEOUT_MS: '50',
      FAKE_CLAUDE_MODE: 'slow',
    });
    assert(res.status === 1, `timeout should fail, got ${res.status}`);
    assert(/TIMEOUT/.test(res.combined), 'slow fake Claude must be classified as TIMEOUT');
  },

  function suiteTimeoutDoesNotCountUnexecutedScenarioAsPassed() {
    const res = runRunner(['--max-scenarios', '2'], {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '2',
      PROMPT_MASTER_SCENARIO_TIMEOUT_MS: '2000',
      PROMPT_MASTER_SUITE_TIMEOUT_MS: '50',
      FAKE_CLAUDE_MODE: 'pass-slow',
      FAKE_CLAUDE_DELAY_MS: '100',
    });
    assert(res.status === 1, `suite timeout should fail, got ${res.status}: ${res.combined}`);
    assert(res.fakeCalls.length === 1, 'suite timeout must stop before the second fake call');
    assert(/SUITE_TIMEOUT/.test(res.combined), 'suite timeout classification missing');
    assert(
      /SUMMARY planned=2 executed=1 passed=1 failed=0 not_run=1/.test(res.combined),
      `suite accounting must expose one unexecuted scenario: ${res.combined}`
    );
  },

  function regexMismatchIsAssertFail() {
    const res = runRunner(oneScenario, {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
      FAKE_CLAUDE_MODE: 'assert-fail',
    });
    assert(res.status === 1, `assert fail should exit 1, got ${res.status}`);
    assert(/ASSERT_FAIL/.test(res.combined), 'regex mismatch must be classified as ASSERT_FAIL');
  },

  function relativeTestAdapterIsRejected() {
    const res = runRunner(oneScenario, {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
    }, { testScript: 'relative-fake.js' });
    assert(res.status === 2, `relative test adapter should exit 2, got ${res.status}`);
    assert(res.fakeCalls.length === 0, 'invalid test adapter must fail before invocation');
    assert(/must be an absolute path/.test(res.combined), 'missing absolute test-adapter refusal');
  },

  function ambiguousRunnerConfigurationIsRejected() {
    const res = runRunner(oneScenario, {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
      PROMPT_MASTER_CLAUDE_BIN: process.execPath,
    });
    assert(res.status === 2, `ambiguous runner configuration should exit 2, got ${res.status}`);
    assert(res.fakeCalls.length === 0, 'ambiguous runner configuration must fail before invocation');
    assert(/cannot be combined/.test(res.combined), 'missing ambiguous runner refusal');
  },

  function productionDefaultResolutionIsBlockedByGuard() {
    const res = runRunner(oneScenario, {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
    }, { useTestAdapter: false });
    assert(res.status !== 0, 'guarded production resolution must fail');
    assert(res.fakeCalls.length === 0, 'production path must not use the test adapter implicitly');
    assert(res.denyCalls.length === 1, 'real Claude resolution must be blocked exactly once');
    assert(res.denyCalls[0].kind === 'blocked-real-claude', 'preload guard marker kind mismatch');
    assert(res.denyCalls[0].executable === 'claude', 'default production executable must remain claude');
  },

  function shellBypassesAreBlockedBeforeHarmlessClaudeCanRun() {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-master-shell-guard-'));
    const executionMarker = path.join(tempDir, 'harmless-claude-executed.marker');
    const executable = writeHarmlessClaude(tempDir);
    const denyGuard = createClaudeDenyGuard();
    const shell = process.platform === 'win32' ? process.env.ComSpec : '/bin/sh';
    try {
      assert(path.isAbsolute(shell), 'shell guard probe must use an absolute shell path');
      const env = withClaudeDenyGuard({
        ...isolatedEnv(),
        HARMLESS_CLAUDE_EXECUTABLE: executable,
        HARMLESS_CLAUDE_EXEC_MARKER: executionMarker,
        HARMLESS_CLAUDE_SHELL: shell,
      }, denyGuard);
      const res = spawnSync(process.execPath, [fakeClaudeScript, '--guard-shell-probe'], {
        cwd: repoRoot,
        env,
        encoding: 'utf8',
        timeout: 5000,
      });
      const denyCalls = readJsonLines(denyGuard.markerFile);
      assert(
        res.status === 0,
        `shell guard probe failed: status=${res.status} error=${res.error?.code || res.error?.message || 'none'} ${res.stdout || ''}${res.stderr || ''}`
      );
      assert(/blocked=8/.test(res.stdout || ''), 'all eight shell bypass probes must be blocked synchronously');
      assert(!fs.existsSync(executionMarker), 'harmless absolute Claude fixture must never execute');
      assert(denyCalls.length === 8, `expected eight redacted deny markers, got ${denyCalls.length}`);
      assert(denyCalls.filter((call) => call.kind === 'blocked-shell-api').length === 6, 'shell APIs and all shell:true overloads must be denied');
      assert(denyCalls.filter((call) => call.kind === 'blocked-shell-claude').length === 2, 'direct shell -c//c Claude commands must be denied');
    } finally {
      removeClaudeDenyGuard(denyGuard);
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  },

  function isolatedPathBlocksProductionDefaultWithoutPreload() {
    const res = runRunner(oneScenario, {
      PROMPT_MASTER_ALLOW_CLAUDE_RUNNER: '1',
      PROMPT_MASTER_MAX_LIVE_CALLS: '1',
    }, { useTestAdapter: false, usePreload: false });
    assert(res.status !== 0, 'production resolution without preload must still fail');
    assert(res.pathWasIsolated, 'preload-disabled behavior test must use a guard-only PATH');
    assert(res.fakeCalls.length === 0, 'production path must not use the Node test adapter');
    assert(
      res.denyCalls.every((call) => call.kind === 'blocked-path-claude'),
      'preload-disabled test may only reach an inert PATH sentinel'
    );
    if (process.platform !== 'win32') {
      assert(res.denyCalls.length === 1, 'POSIX direct resolution must reach exactly one inert sentinel');
    } else {
      assert(res.denyCalls.length <= 1, 'Windows direct resolution must fail or reach only the inert .cmd sentinel');
      if (res.denyCalls.length === 0) {
        assert(/ENV_ERROR/.test(res.combined), 'Windows no-marker branch must classify isolated resolution as ENV_ERROR');
        assert(/ENOENT/.test(res.combined), 'Windows no-marker branch must prove the Claude executable was not found');
      }
    }
  },

  function temporaryPathSentinelBlocksShellFallback() {
    const denyGuard = createClaudeDenyGuard();
    const baseEnv = withClaudeDenyGuard(isolatedEnv(), denyGuard);
    const shell = process.platform === 'win32' ? process.env.ComSpec : '/bin/sh';
    const args = process.platform === 'win32'
      ? ['/d', '/s', '/c', 'claude --version']
      : ['-c', 'claude --version'];
    deleteEnvCaseInsensitive(baseEnv, ['NODE_OPTIONS', 'PROMPT_MASTER_DENY_REAL_CLAUDE']);
    baseEnv.PROMPT_MASTER_SENTINEL_SHELL = shell;
    baseEnv.PROMPT_MASTER_SENTINEL_ARGS = JSON.stringify(args);
    const probe = [
      "const { spawnSync } = require('child_process');",
      "const shell = process.env.PROMPT_MASTER_SENTINEL_SHELL;",
      "const args = JSON.parse(process.env.PROMPT_MASTER_SENTINEL_ARGS);",
      "const result = spawnSync(shell, args, { env: process.env, encoding: 'utf8' });",
      "if (result.error || result.status !== 97) {",
      "  console.error(result.error || `unexpected sentinel exit ${result.status}`);",
      "  process.exitCode = 8;",
      "} else console.log('sentinel_exit=97');",
    ].join('\n');
    try {
      assert(path.isAbsolute(shell), 'shell fallback test must use an absolute shell path');
      assert(baseEnv.PATH === denyGuard.dir, 'shell fallback must use a guard-only PATH');
      const res = spawnSync(process.execPath, ['-e', probe], {
        cwd: repoRoot,
        env: baseEnv,
        encoding: 'utf8',
        timeout: 5000,
      });
      const calls = readJsonLines(denyGuard.markerFile);
      assert(res.status === 0, `preload-disabled PATH probe failed: ${res.stdout || ''}${res.stderr || ''}`);
      assert(/sentinel_exit=97/.test(res.stdout || ''), 'PATH sentinel should exit 97 inside the preload-disabled Node helper');
      assert(calls.length === 1, 'PATH sentinel must record exactly one blocked invocation');
      assert(calls[0].kind === 'blocked-path-claude', 'PATH fallback marker kind mismatch');
    } finally {
      removeClaudeDenyGuard(denyGuard);
    }
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
