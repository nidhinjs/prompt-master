#!/usr/bin/env node
// Safe local/CI verification. Never calls the real Claude CLI.

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const FAKE_CLAUDE_SCRIPT = path.join(__dirname, 'fake-claude.js');
const DEFAULT_CHECK_TIMEOUT_MS = 120000;

const LIVE_ENV_KEYS = [
  'PROMPT_MASTER_ALLOW_CLAUDE_RUNNER',
  'PROMPT_MASTER_ALLOW_FULL_GOLDEN',
  'PROMPT_MASTER_CLAUDE_BIN',
  'PROMPT_MASTER_TEST_CLAUDE_SCRIPT',
  'PROMPT_MASTER_MAX_LIVE_CALLS',
  'PROMPT_MASTER_SCENARIO_TIMEOUT_MS',
  'PROMPT_MASTER_SUITE_TIMEOUT_MS',
  'FAKE_CLAUDE_MARKER',
  'FAKE_CLAUDE_MODE',
  'FAKE_CLAUDE_DELAY_MS',
];

const DEFAULT_CHECKS = [
  { command: process.execPath, args: ['scripts/test-safe-self.js'] },
  { command: process.execPath, args: ['scripts/test-registry.js'] },
  { command: process.execPath, args: ['scripts/test-patterns.js'] },
  { command: process.execPath, args: ['scripts/test-pattern-routing.js'] },
  { command: process.execPath, args: ['scripts/test-pattern-package.js'] },
  { command: process.execPath, args: ['scripts/test-runtime-inventory.js'] },
  { command: process.execPath, args: ['scripts/test-provenance.js'] },
  { command: process.execPath, args: ['scripts/test-portable-verification.js'] },
  { command: process.execPath, args: ['scripts/test-contracts.js'] },
  { command: process.execPath, args: ['scripts/test-hook.js'] },
  { command: process.execPath, args: ['scripts/test-codex-layout.js'] },
  { command: process.execPath, args: ['scripts/test-codex-hook.js'] },
  { command: process.execPath, args: ['scripts/lint.js'] },
  { command: process.execPath, args: ['--check', 'scripts/run-golden.js'] },
  { command: process.execPath, args: ['scripts/test-golden-regex.js'] },
  { command: process.execPath, args: ['scripts/test-run-golden-safe.js'] },
];

function createClaudeDenyGuard(options = {}) {
  const baseDir = path.resolve(options.baseDir || os.tmpdir());
  const dir = fs.mkdtempSync(path.join(baseDir, 'prompt-master-deny-claude-'));
  const markerFile = path.join(dir, 'claude-invoked.marker');
  const posixFile = path.join(dir, 'claude');
  const windowsFile = path.join(dir, 'claude.cmd');
  const record = '{"schema_version":"1.0.0","kind":"blocked-path-claude","executable":"claude"}';
  fs.writeFileSync(posixFile, [
    '#!/bin/sh',
    `printf '%s\\n' '${record}' >> "$PROMPT_MASTER_CLAUDE_DENY_MARKER"`,
    'exit 97',
    '',
  ].join('\n'));
  fs.chmodSync(posixFile, 0o700);
  fs.writeFileSync(windowsFile, [
    '@echo off',
    `>> "%PROMPT_MASTER_CLAUDE_DENY_MARKER%" echo ${record}`,
    'exit /b 97',
    '',
  ].join('\r\n'));
  return { dir, markerFile, posixFile, windowsFile };
}

function removeClaudeDenyGuard(guard) {
  if (guard?.dir && fs.existsSync(guard.dir)) fs.rmSync(guard.dir, { recursive: true, force: true });
}

function claudeMarkerExists(guard) {
  return Boolean(guard?.markerFile && fs.existsSync(guard.markerFile));
}

function nodeRequireOption(file) {
  const normalized = file.replace(/\\/g, '/');
  return `--require=${/\s/.test(normalized) ? `"${normalized.replace(/"/g, '\\"')}"` : normalized}`;
}

function envValueCaseInsensitive(source, name) {
  if (Object.hasOwn(source, name)) return source[name];
  const key = Object.keys(source).find((candidate) => candidate.toLowerCase() === name.toLowerCase());
  return key === undefined ? undefined : source[key];
}

function deleteEnvCaseInsensitive(env, names) {
  const denied = new Set(names.map((name) => name.toLowerCase()));
  for (const key of Object.keys(env)) {
    if (denied.has(key.toLowerCase())) delete env[key];
  }
}

function pathEnvironmentKey(source = process.env) {
  return Object.keys(source).find((key) => key.toLowerCase() === 'path') || 'PATH';
}

function resolveExecutableFromPath(name, source = process.env) {
  const pathValue = source[pathEnvironmentKey(source)] || '';
  const suffixes = process.platform === 'win32' ? ['.exe', ''] : [''];
  for (const rawEntry of pathValue.split(path.delimiter)) {
    const entry = rawEntry.trim().replace(/^"|"$/g, '');
    if (!entry || !path.isAbsolute(entry)) continue;
    for (const suffix of suffixes) {
      const candidate = path.join(entry, `${name}${suffix}`);
      try {
        const stat = fs.statSync(candidate);
        if (!stat.isFile()) continue;
        if (process.platform !== 'win32') fs.accessSync(candidate, fs.constants.X_OK);
        return path.resolve(candidate);
      } catch {
        // Continue searching PATH without invoking a shell or another executable.
      }
    }
  }
  return null;
}

function resolveSafeGit(source = process.env) {
  const configured = envValueCaseInsensitive(source, 'PROMPT_MASTER_SAFE_GIT');
  if (typeof configured === 'string' && configured.length > 0 && path.isAbsolute(configured)) {
    try {
      if (fs.statSync(configured).isFile()) return path.resolve(configured);
    } catch {
      // Fall through to a fresh PATH scan if inherited evidence is stale.
    }
  }
  return resolveExecutableFromPath('git', source);
}

function withClaudeDenyGuard(source = process.env, claudeDenyGuard = null) {
  const env = { ...source };
  deleteEnvCaseInsensitive(env, ['PROMPT_MASTER_DENY_REAL_CLAUDE', 'PROMPT_MASTER_CLAUDE_DENY_MARKER']);
  if (!claudeDenyGuard) return env;
  const requireOption = nodeRequireOption(FAKE_CLAUDE_SCRIPT);
  const existingNodeOptions = envValueCaseInsensitive(env, 'NODE_OPTIONS') || '';
  deleteEnvCaseInsensitive(env, ['NODE_OPTIONS']);
  env.NODE_OPTIONS = existingNodeOptions.includes(FAKE_CLAUDE_SCRIPT.replace(/\\/g, '/'))
    ? existingNodeOptions
    : `${requireOption} ${existingNodeOptions}`.trim();
  env.PROMPT_MASTER_DENY_REAL_CLAUDE = '1';
  env.PROMPT_MASTER_CLAUDE_DENY_MARKER = claudeDenyGuard.markerFile;
  deleteEnvCaseInsensitive(env, ['PATH']);
  // The guard directory is the entire PATH, not merely its first entry. Thus a
  // child remains unable to resolve a real Claude executable even if the Node
  // preload is accidentally absent. Every safe Node child uses process.execPath.
  env.PATH = claudeDenyGuard.dir;
  if (process.platform === 'win32') {
    deleteEnvCaseInsensitive(env, ['PATHEXT', 'NoDefaultCurrentDirectoryInExePath']);
    env.PATHEXT = '.CMD';
    env.NoDefaultCurrentDirectoryInExePath = '1';
  }
  return env;
}

function safeEnv(source = process.env, claudeDenyGuard = null) {
  const safeGit = claudeDenyGuard ? resolveSafeGit(source) : null;
  const env = withClaudeDenyGuard(source, claudeDenyGuard);
  deleteEnvCaseInsensitive(env, [...LIVE_ENV_KEYS, 'NO_LIVE_MODEL_CALLS', 'PROMPT_MASTER_SAFE_GIT']);
  if (safeGit) env.PROMPT_MASTER_SAFE_GIT = safeGit;
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
  const claudeDenyGuard = options.claudeDenyGuard || null;
  const timeoutMs = options.timeoutMs || DEFAULT_CHECK_TIMEOUT_MS;
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
        timeout: timeoutMs,
      });
    } catch (error) {
      if (claudeMarkerExists(claudeDenyGuard)) {
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

    if (claudeMarkerExists(claudeDenyGuard)) {
      summary.executed++;
      summary.failed++;
      writeOutput(stderr, `FAIL (Claude CLI invocation blocked): ${label}\n`);
      break;
    }

    if (result?.error?.code === 'ETIMEDOUT') {
      summary.executed++;
      summary.failed++;
      writeOutput(stderr, `FAIL (timeout after ${timeoutMs}ms): ${label}\n`);
      continue;
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

  let claudeDenyGuard;
  try { claudeDenyGuard = createClaudeDenyGuard(); }
  catch (error) {
    console.error(`Cannot create Claude deny guard: ${error.message}`);
    return 1;
  }
  const env = safeEnv(process.env, claudeDenyGuard);
  if (!env.PROMPT_MASTER_SAFE_GIT) {
    removeClaudeDenyGuard(claudeDenyGuard);
    console.error('Cannot resolve an absolute Git executable before PATH isolation');
    return 1;
  }
  const summary = runChecks(DEFAULT_CHECKS, {
    claudeDenyGuard,
    env,
  });
  const markerCreated = claudeMarkerExists(claudeDenyGuard);
  removeClaudeDenyGuard(claudeDenyGuard);
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
  DEFAULT_CHECK_TIMEOUT_MS,
  FAKE_CLAUDE_SCRIPT,
  LIVE_ENV_KEYS,
  REPO_ROOT,
  claudeMarkerExists,
  createClaudeDenyGuard,
  deleteEnvCaseInsensitive,
  envValueCaseInsensitive,
  exitCodeFor,
  formatSummary,
  hasSkipMarker,
  isPassingSummary,
  main,
  parseArgs,
  nodeRequireOption,
  pathEnvironmentKey,
  removeClaudeDenyGuard,
  resolveExecutableFromPath,
  resolveSafeGit,
  runChecks,
  safeEnv,
  withClaudeDenyGuard,
};
