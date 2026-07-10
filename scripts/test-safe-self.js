#!/usr/bin/env node
// Dependency-free unit tests for the fail-closed safe-test coordinator.
// Child-process outcomes are injected; this file never starts nested processes.

const {
  LIVE_ENV_KEYS,
  exitCodeFor,
  formatSummary,
  isPassingSummary,
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

function runWith(results) {
  let index = 0;
  return runChecks(checks(results.length), {
    spawnSync() {
      const result = results[index++];
      if (result instanceof Error) throw result;
      return result;
    },
    stdout: sink(),
    stderr: sink(),
    env: safeEnv({}),
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
