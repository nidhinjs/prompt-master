#!/usr/bin/env node
// Safe local/CI verification. Never calls the real Claude CLI.

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');

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
  { command: process.execPath, args: ['scripts/test-patterns.js'] },
  { command: process.execPath, args: ['scripts/test-pattern-routing.js'] },
  { command: process.execPath, args: ['scripts/test-pattern-package.js'] },
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

function createClaudeDenyShim(options = {}) {
  const baseDir = path.resolve(options.baseDir || os.tmpdir());
  const dir = fs.mkdtempSync(path.join(baseDir, 'prompt-master-deny-claude-'));
  const markerFile = path.join(dir, 'claude-invoked.marker');
  const posixFile = path.join(dir, 'claude');
  const windowsFile = path.join(dir, 'claude.cmd');
  fs.writeFileSync(posixFile, [
    '#!/bin/sh',
    'printf "blocked claude invocation\\n" > "$PROMPT_MASTER_CLAUDE_DENY_MARKER"',
    'exit 97',
    '',
  ].join('\n'));
  fs.chmodSync(posixFile, 0o700);
  fs.writeFileSync(windowsFile, [
    '@echo off',
    '> "%PROMPT_MASTER_CLAUDE_DENY_MARKER%" echo blocked claude invocation',
    'exit /b 97',
    '',
  ].join('\r\n'));
  return { dir, markerFile, posixFile, windowsFile };
}

function removeClaudeDenyShim(shim) {
  if (shim?.dir && fs.existsSync(shim.dir)) fs.rmSync(shim.dir, { recursive: true, force: true });
}

function claudeMarkerExists(shim) {
  return Boolean(shim?.markerFile && fs.existsSync(shim.markerFile));
}

function safeEnv(source = process.env, claudeDenyShim = null) {
  const env = { ...source };
  for (const key of LIVE_ENV_KEYS) delete env[key];
  env.NO_LIVE_MODEL_CALLS = '1';
  if (claudeDenyShim) {
    const pathKey = Object.keys(env).find((key) => key.toLowerCase() === 'path') || 'PATH';
    env[pathKey] = `${claudeDenyShim.dir}${path.delimiter}${env[pathKey] || ''}`;
    env.PROMPT_MASTER_CLAUDE_DENY_MARKER = claudeDenyShim.markerFile;
  }
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
  const claudeDenyShim = options.claudeDenyShim || null;
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
        cwd: REPO_ROOT,
        encoding: 'utf8',
        stdio: 'pipe',
        env,
      });
    } catch (error) {
      if (claudeMarkerExists(claudeDenyShim)) {
        summary.executed++;
        summary.failed++;
        writeOutput(stderr, `FAIL (Claude CLI invocation blocked): ${label}\n`);
        break;
      }
      summary.failed++;
      writeOutput(stderr, `FAIL (spawn error): ${label}\n${error.message}\n`);
      continue;
    }

    const childStdout = result?.stdout || '';
    const childStderr = result?.stderr || '';
    writeOutput(stdout, childStdout);
    writeOutput(stderr, childStderr);

    if (claudeMarkerExists(claudeDenyShim)) {
      summary.executed++;
      summary.failed++;
      writeOutput(stderr, `FAIL (Claude CLI invocation blocked): ${label}\n`);
      break;
    }

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

  let claudeDenyShim;
  try { claudeDenyShim = createClaudeDenyShim(); }
  catch (error) {
    console.error(`Cannot create Claude deny shim: ${error.message}`);
    return 1;
  }
  const summary = runChecks(DEFAULT_CHECKS, {
    claudeDenyShim,
    env: safeEnv(process.env, claudeDenyShim),
  });
  const markerCreated = claudeMarkerExists(claudeDenyShim);
  removeClaudeDenyShim(claudeDenyShim);
  if (markerCreated && summary.failed === 0) {
    summary.failed++;
    summary.passed = Math.max(0, summary.passed - 1);
  }
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
  REPO_ROOT,
  claudeMarkerExists,
  createClaudeDenyShim,
  exitCodeFor,
  formatSummary,
  hasSkipMarker,
  isPassingSummary,
  main,
  parseArgs,
  removeClaudeDenyShim,
  runChecks,
  safeEnv,
};
