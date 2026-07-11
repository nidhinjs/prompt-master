#!/usr/bin/env node
// Safe local/CI verification. Never calls the real Claude CLI.

const { spawnSync } = require('child_process');

const LIVE_ENV_KEYS = [
  'PROMPT_MASTER_ALLOW_CLAUDE_RUNNER',
  'PROMPT_MASTER_ALLOW_FULL_GOLDEN',
  'PROMPT_MASTER_CLAUDE_BIN',
  'PROMPT_MASTER_MAX_LIVE_CALLS',
  'PROMPT_MASTER_SCENARIO_TIMEOUT_MS',
  'PROMPT_MASTER_SUITE_TIMEOUT_MS',
];

const DEFAULT_CHECKS = [
  { command: process.execPath, args: ['scripts/test-safe-self.js'] },
  { command: process.execPath, args: ['scripts/test-registry.js'] },
  { command: process.execPath, args: ['scripts/test-runtime-inventory.js'] },
  { command: process.execPath, args: ['scripts/test-contracts.js'] },
  { command: process.execPath, args: ['scripts/test-hook.js'] },
  { command: process.execPath, args: ['scripts/test-codex-layout.js'] },
  { command: process.execPath, args: ['scripts/test-codex-hook.js'] },
  { command: process.execPath, args: ['scripts/lint.js'] },
  { command: process.execPath, args: ['--check', 'scripts/run-golden.js'] },
  { command: process.execPath, args: ['scripts/test-golden-regex.js'] },
  { command: process.execPath, args: ['scripts/test-run-golden-safe.js'] },
];

function safeEnv(source = process.env) {
  const env = { ...source };
  for (const key of LIVE_ENV_KEYS) delete env[key];
  env.NO_LIVE_MODEL_CALLS = '1';
  return env;
}

function checkLabel(check) {
  const command = check.command === process.execPath ? 'node' : check.command;
  return [command, ...(check.args || [])].join(' ');
}

function hasSkipMarker(stdout, stderr) {
  return /^\s*SKIP(?:PED)?(?:\b|[\s:(])/im.test(`${stdout || ''}\n${stderr || ''}`);
}

function writeOutput(stream, value) {
  if (value && stream && typeof stream.write === 'function') stream.write(value);
}

function runChecks(checks = DEFAULT_CHECKS, options = {}) {
  const spawn = options.spawnSync || spawnSync;
  const stdout = options.stdout || process.stdout;
  const stderr = options.stderr || process.stderr;
  const env = options.env || safeEnv();
  const summary = {
    expected: checks.length,
    executed: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
  };

  for (const check of checks) {
    const label = checkLabel(check);
    let result;
    try {
      result = spawn(check.command, check.args || [], {
        encoding: 'utf8',
        stdio: 'pipe',
        env,
      });
    } catch (error) {
      summary.failed++;
      writeOutput(stderr, `FAIL (spawn error): ${label}\n${error.message}\n`);
      continue;
    }

    const childStdout = result?.stdout || '';
    const childStderr = result?.stderr || '';
    writeOutput(stdout, childStdout);
    writeOutput(stderr, childStderr);

    const sandboxSkip = result?.error?.code === 'EPERM';
    const reportedSkip = hasSkipMarker(childStdout, childStderr);
    if (sandboxSkip || reportedSkip) {
      summary.failed++;
      summary.skipped++;
      const reason = sandboxSkip ? 'EPERM' : 'reported by check';
      writeOutput(stderr, `FAIL (skipped: ${reason}): ${label}\n`);
      continue;
    }

    if (result?.error) {
      summary.failed++;
      const code = result.error.code ? ` ${result.error.code}` : '';
      writeOutput(stderr, `FAIL (spawn error${code}): ${label}\n${result.error.message}\n`);
      continue;
    }

    summary.executed++;
    if (result?.status === 0) {
      summary.passed++;
      continue;
    }

    summary.failed++;
    const outcome = result?.signal ? `signal ${result.signal}` : `exit ${result?.status}`;
    writeOutput(stderr, `FAIL (${outcome}): ${label}\n`);
  }

  return summary;
}

function isPassingSummary(summary) {
  return (
    summary.expected > 0 &&
    summary.expected === summary.executed &&
    summary.expected === summary.passed &&
    summary.failed === 0 &&
    summary.skipped === 0
  );
}

function exitCodeFor(summary) {
  return isPassingSummary(summary) ? 0 : 1;
}

function formatSummary(summary) {
  return [
    `expected=${summary.expected}`,
    `executed=${summary.executed}`,
    `passed=${summary.passed}`,
    `failed=${summary.failed}`,
    `skipped=${summary.skipped}`,
  ].join(' ');
}

function parseArgs(argv) {
  const unknown = argv.filter((arg) => arg !== '--strict');
  if (unknown.length) throw new Error(`Unknown argument: ${unknown[0]}`);
  // The gate is always fail-closed; --strict makes that invariant explicit in CI.
  return { strict: true };
}

function main(argv = process.argv.slice(2)) {
  try {
    parseArgs(argv);
  } catch (error) {
    console.error(error.message);
    return 2;
  }

  const summary = runChecks();
  const line = `SUMMARY ${formatSummary(summary)}`;
  const exitCode = exitCodeFor(summary);
  if (exitCode !== 0) {
    console.error(line);
    return exitCode;
  }
  console.log(line);
  return 0;
}

if (require.main === module) process.exitCode = main();

module.exports = {
  DEFAULT_CHECKS,
  LIVE_ENV_KEYS,
  exitCodeFor,
  formatSummary,
  hasSkipMarker,
  isPassingSummary,
  main,
  parseArgs,
  runChecks,
  safeEnv,
};
