#!/usr/bin/env node
// Dependency-free unit tests for the fail-closed safe-test coordinator.
// Child-process outcomes are injected; this file never starts nested processes.

const fs = require('fs');
const os = require('os');
const path = require('path');

const {
  FAKE_CLAUDE_SCRIPT,
  DEFAULT_CHECK_TIMEOUT_MS,
  LIVE_ENV_KEYS,
  REPO_ROOT,
  createClaudeDenyGuard,
  exitCodeFor,
  formatSummary,
  isPassingSummary,
  removeClaudeDenyGuard,
  resolveExecutableFromPath,
  runChecks,
  safeEnv,
  withClaudeDenyGuard,
} = require('./test-safe');
const { invocationArgsAndOptions, isClaudeCommand, shellCommandMentionsClaude } = require('./fake-claude');

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
    claudeDenyGuard: options.claudeDenyGuard,
  });
}

const pass = { status: 0, stdout: '', stderr: '' };

const cases = [
  function directClaudeNameDetectionIsPrecise() {
    for (const value of ['claude', '/usr/local/bin/claude', 'C:\\tools\\claude.exe', 'claude.cmd']) {
      assert(isClaudeCommand(value), `expected Claude executable detection for ${value}`);
    }
    for (const value of ['notclaude', 'claude.md', 'echo', 'git', 'echo claude']) {
      assert(!isClaudeCommand(value), `unexpected Claude executable detection for ${value}`);
    }
  },

  function shellClaudeDetectionIsPrecise() {
    assert(invocationArgsAndOptions(undefined, { shell: true }).options.shell === true, 'undefined args overload must retain options');
    assert(invocationArgsAndOptions(null, { shell: true }).options.shell === true, 'null args overload must retain options');
    for (const [command, args] of [
      ['/bin/sh', ['-c', '/tmp/fixture/claude --version']],
      ['/bin/bash', ['-lc', '"/tmp/fixture/claude" --version']],
      ['cmd.exe', ['/d', '/s', '/c', 'C:\\fixture\\claude.cmd --version']],
      ['powershell.exe', ['-Command', '& C:\\fixture\\claude.exe --version']],
    ]) {
      assert(shellCommandMentionsClaude(command, args), `expected shell Claude detection for ${command}`);
    }
    for (const [command, args] of [
      ['/bin/sh', ['-c', 'echo safe']],
      ['/bin/sh', ['-c', 'echo claude.md']],
      ['not-a-shell', ['-c', 'claude --version']],
      ['cmd.exe', ['/d', '/s', '/c', 'echo notclaude']],
    ]) {
      assert(!shellCommandMentionsClaude(command, args), `unexpected shell Claude detection for ${command}: ${args.join(' ')}`);
    }
  },

  function removesLiveOptIns() {
    const source = { KEEP_ME: 'yes', no_live_model_calls: '0', prompt_master_safe_git: 'unsafe' };
    for (const key of LIVE_ENV_KEYS) source[key.toLowerCase()] = 'unsafe';
    const env = safeEnv(source);
    assert(env.KEEP_ME === 'yes', 'safeEnv must preserve unrelated variables');
    assert(env.NO_LIVE_MODEL_CALLS === '1', 'safeEnv must force NO_LIVE_MODEL_CALLS=1');
    const remaining = new Set(Object.keys(env).map((key) => key.toLowerCase()));
    for (const key of LIVE_ENV_KEYS) {
      assert(!remaining.has(key.toLowerCase()), `safeEnv must remove every case variant of ${key}`);
    }
    assert(!remaining.has('prompt_master_safe_git'), 'safeEnv without a guard must remove inherited safe Git evidence');
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

  function claudeDenyGuardIsPathIsolatedAndInjected() {
    const guard = createClaudeDenyGuard();
    const toolDir = fs.mkdtempSync(path.join(path.dirname(guard.dir), 'prompt-master-safe-git-'));
    try {
      const gitFile = path.join(toolDir, process.platform === 'win32' ? 'git.exe' : 'git');
      fs.writeFileSync(gitFile, 'inert test fixture\n');
      if (process.platform !== 'win32') fs.chmodSync(gitFile, 0o700);
      const source = {
        Path: toolDir,
        node_options: '--trace-warnings',
        prompt_master_deny_real_claude: 'unsafe',
        prompt_master_claude_deny_marker: 'unsafe',
      };
      const env = safeEnv(source, guard);
      assert(fs.existsSync(guard.dir), 'Claude deny guard directory missing');
      assert(fs.existsSync(guard.posixFile), 'POSIX PATH sentinel missing');
      assert(fs.existsSync(guard.windowsFile), 'Windows PATH sentinel missing');
      assert(!fs.existsSync(path.join(guard.dir, 'claude.exe')), 'guard must never disguise Node as claude.exe');
      assert(fs.existsSync(FAKE_CLAUDE_SCRIPT), 'tracked Node fake/guard script missing');
      assert(path.isAbsolute(FAKE_CLAUDE_SCRIPT), 'tracked Node fake/guard path must be absolute');
      assert(!fs.existsSync(guard.markerFile), 'deny marker must not exist before execution');
      assert(env.PATH === guard.dir, 'safe PATH must contain only the temporary guard directory');
      assert(env.PROMPT_MASTER_SAFE_GIT === path.resolve(gitFile), 'safe Git path must be resolved before PATH isolation');
      const inherited = safeEnv({ PATH: 'relative-only', PROMPT_MASTER_SAFE_GIT: gitFile }, guard);
      assert(inherited.PROMPT_MASTER_SAFE_GIT === path.resolve(gitFile), 'valid inherited safe Git path must survive nested isolation');
      assert(env.NODE_OPTIONS.includes('--trace-warnings'), 'existing NODE_OPTIONS must be preserved');
      assert(env.NODE_OPTIONS.includes(FAKE_CLAUDE_SCRIPT.replace(/\\/g, '/')), 'Node deny preload missing');
      assert(env.PROMPT_MASTER_DENY_REAL_CLAUDE === '1', 'Node deny guard flag missing');
      assert(env.PROMPT_MASTER_CLAUDE_DENY_MARKER === guard.markerFile, 'deny marker env mismatch');
      const normalizedKeys = Object.keys(env).map((key) => key.toLowerCase());
      assert(normalizedKeys.filter((key) => key === 'node_options').length === 1, 'NODE_OPTIONS case variants must collapse to one key');
      assert(normalizedKeys.filter((key) => key === 'prompt_master_deny_real_claude').length === 1, 'deny flag case variants must collapse');
      assert(normalizedKeys.filter((key) => key === 'prompt_master_claude_deny_marker').length === 1, 'deny marker case variants must collapse');
      const reinjected = withClaudeDenyGuard(env, guard);
      const occurrences = reinjected.NODE_OPTIONS.split(FAKE_CLAUDE_SCRIPT.replace(/\\/g, '/')).length - 1;
      assert(occurrences === 1, 'Node deny preload must not be duplicated');
    } finally {
      removeClaudeDenyGuard(guard);
      fs.rmSync(toolDir, { recursive: true, force: true });
    }
  },

  function executableResolutionDoesNotInvokeACommand() {
    const toolDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-master-resolve-tool-'));
    try {
      const executable = path.join(toolDir, process.platform === 'win32' ? 'git.exe' : 'git');
      fs.writeFileSync(executable, 'inert test fixture\n');
      if (process.platform !== 'win32') fs.chmodSync(executable, 0o700);
      assert(resolveExecutableFromPath('git', { PATH: toolDir }) === path.resolve(executable), 'absolute Git resolution failed');
      assert(resolveExecutableFromPath('claude', { PATH: toolDir }) === null, 'resolver must not invent a Claude path');
      assert(resolveExecutableFromPath('git', { PATH: 'relative-only' }) === null, 'relative PATH entries must be rejected');
    } finally {
      fs.rmSync(toolDir, { recursive: true, force: true });
    }
  },

  function claudeDenyMarkerFailsClosed() {
    const guard = createClaudeDenyGuard();
    try {
      const summary = runChecks(checks(2), {
        spawnSync() {
          fs.writeFileSync(guard.markerFile, 'blocked\n');
          return pass;
        },
        stdout: sink(),
        stderr: sink(),
        env: safeEnv({}, guard),
        claudeDenyGuard: guard,
      });
      assert(!isPassingSummary(summary), 'Claude deny marker must fail the gate');
      assert(exitCodeFor(summary) !== 0, 'Claude deny marker must return non-zero');
      assert(
        formatSummary(summary) === 'expected=2 executed=1 passed=0 failed=1 skipped=0',
        `unexpected Claude-marker summary: ${formatSummary(summary)}`
      );
    } finally {
      removeClaudeDenyGuard(guard);
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

  function timedOutCheckFailsClosed() {
    const timeout = Object.assign(new Error('synthetic timeout'), { code: 'ETIMEDOUT' });
    const summary = runWith([{ status: null, stdout: '', stderr: '', error: timeout }]);
    assert(!isPassingSummary(summary), 'timed-out check must fail');
    assert(exitCodeFor(summary) !== 0, 'timed-out check must return non-zero');
    assert(
      formatSummary(summary) === 'expected=1 executed=1 passed=0 failed=1 skipped=0',
      `unexpected timeout summary: ${formatSummary(summary)}`
    );
    assert(DEFAULT_CHECK_TIMEOUT_MS > 0, 'default check timeout must be positive');
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
