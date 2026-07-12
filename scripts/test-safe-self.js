#!/usr/bin/env node
// Dependency-free unit tests for the fail-closed safe-test coordinator.
// Child-process outcomes are injected; this file never starts nested processes.

const fs = require('fs');
const path = require('path');

const {
  LIVE_ENV_KEYS,
  REPO_ROOT,
  createClaudeDenyShim,
  exitCodeFor,
  formatSummary,
  isPassingSummary,
  removeClaudeDenyShim,
  runChecks,
  safeEnv,
} = require('./test-safe');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sink() {
  return { write() {} };
}

function checks(count) {
  return Array.from({ length: count }, (_, index) => ({
    command: `fake-command-${index + 1}`,
    args: [],
  }));
}

function runWith(results, options = {}) {
  let index = 0;
  return runChecks(checks(results.length), {
    spawnSync() {
      const result = results[index++];
      if (result instanceof Error) throw result;
      return result;
    },
    stdout: sink(),
    stderr: sink(),
    env: options.env || safeEnv({}),
    claudeDenyShim: options.claudeDenyShim,
  });
}

const pass = { status: 0, stdout: '', stderr: '' };

const cases = [
  function removesLiveOptIns() {
    const source = { KEEP_ME: 'yes', NO_LIVE_MODEL_CALLS: '0' };
    for (const key of LIVE_ENV_KEYS) source[key] = 'unsafe';
    const env = safeEnv(source);
    assert(env.KEEP_ME === 'yes', 'safeEnv must preserve unrelated variables');
    assert(env.NO_LIVE_MODEL_CALLS === '1', 'safeEnv must force NO_LIVE_MODEL_CALLS=1');
    for (const key of LIVE_ENV_KEYS) {
      assert(!(key in env), `safeEnv must remove ${key}`);
    }
  },

  function childrenRunFromRepositoryRoot() {
    let observedCwd;
    const summary = runChecks(checks(1), {
      spawnSync(command, args, options) {
        observedCwd = options.cwd;
        return pass;
      },
      stdout: sink(),
      stderr: sink(),
      env: safeEnv({}),
    });
    assert(isPassingSummary(summary), 'cwd probe must otherwise pass');
    assert(path.resolve(observedCwd) === path.resolve(REPO_ROOT), `child cwd must be repo root, got ${observedCwd}`);
  },

  function claudeDenyShimIsCrossPlatformAndPrepended() {
    const shim = createClaudeDenyShim();
    try {
      const env = safeEnv({ PATH: 'existing-path' }, shim);
      assert(fs.existsSync(shim.posixFile), 'POSIX claude deny shim missing');
      assert(fs.existsSync(shim.windowsFile), 'Windows claude.cmd deny shim missing');
      assert(!fs.existsSync(shim.markerFile), 'deny marker must not exist before execution');
      assert(env.PATH.startsWith(`${shim.dir}${path.delimiter}`), 'deny shim directory must be first on PATH');
      assert(env.PROMPT_MASTER_CLAUDE_DENY_MARKER === shim.markerFile, 'deny marker env mismatch');
    } finally {
      removeClaudeDenyShim(shim);
    }
  },

  function claudeDenyMarkerFailsClosed() {
    const shim = createClaudeDenyShim();
    try {
      const summary = runChecks(checks(2), {
        spawnSync() {
          fs.writeFileSync(shim.markerFile, 'blocked\n');
          return pass;
        },
        stdout: sink(),
        stderr: sink(),
        env: safeEnv({}, shim),
        claudeDenyShim: shim,
      });
      assert(!isPassingSummary(summary), 'Claude deny marker must fail the gate');
      assert(exitCodeFor(summary) !== 0, 'Claude deny marker must return non-zero');
      assert(
        formatSummary(summary) === 'expected=2 executed=1 passed=0 failed=1 skipped=0',
        `unexpected Claude-marker summary: ${formatSummary(summary)}`
      );
    } finally {
      removeClaudeDenyShim(shim);
    }
  },

  function allEpermFailsClosed() {
    const eperm = () => ({
      status: null,
      stdout: '',
      stderr: '',
      error: Object.assign(new Error('operation not permitted'), { code: 'EPERM' }),
    });
    const summary = runWith([eperm(), eperm(), eperm()]);
    assert(!isPassingSummary(summary), 'all-EPERM run must fail');
    assert(exitCodeFor(summary) !== 0, 'all-EPERM run must return non-zero');
    assert(
      formatSummary(summary) === 'expected=3 executed=0 passed=0 failed=3 skipped=3',
      `unexpected all-EPERM summary: ${formatSummary(summary)}`
    );
  },

  function oneSkippedFailsClosed() {
    const summary = runWith([
      pass,
      { status: 0, stdout: '', stderr: 'SKIP: nested execution unavailable\n' },
    ]);
    assert(!isPassingSummary(summary), 'a reported skip must fail');
    assert(exitCodeFor(summary) !== 0, 'a reported skip must return non-zero');
    assert(
      formatSummary(summary) === 'expected=2 executed=1 passed=1 failed=1 skipped=1',
      `unexpected one-skip summary: ${formatSummary(summary)}`
    );
  },

  function missingExecutableFailsClosed() {
    const missing = Object.assign(new Error('spawn ENOENT'), { code: 'ENOENT' });
    const summary = runWith([{
      status: null,
      stdout: '',
      stderr: '',
      error: missing,
    }]);
    assert(!isPassingSummary(summary), 'missing executable must fail');
    assert(exitCodeFor(summary) !== 0, 'missing executable must return non-zero');
    assert(summary.executed === 0 && summary.failed === 1, 'missing executable counts are wrong');
  },

  function thrownSpawnErrorFailsClosed() {
    const summary = runWith([new Error('synthetic spawn failure')]);
    assert(!isPassingSummary(summary), 'thrown spawn error must fail');
    assert(exitCodeFor(summary) !== 0, 'thrown spawn error must return non-zero');
    assert(summary.executed === 0 && summary.failed === 1, 'spawn error counts are wrong');
  },

  function allPassedIsOnlySuccess() {
    const summary = runWith([pass, pass]);
    assert(isPassingSummary(summary), 'all executed checks should pass');
    assert(exitCodeFor(summary) === 0, 'all executed checks must return zero');
    assert(
      formatSummary(summary) === 'expected=2 executed=2 passed=2 failed=0 skipped=0',
      `unexpected passing summary: ${formatSummary(summary)}`
    );
  },

  function emptyGateFailsClosed() {
    const summary = runWith([]);
    assert(exitCodeFor(summary) !== 0, 'an empty gate must return non-zero');
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
  console.error(`\n${failed}/${cases.length} safe-gate self-tests failed`);
  process.exitCode = 1;
} else {
  console.log(`OK: ${cases.length}/${cases.length} safe-gate self-tests passed`);
}
