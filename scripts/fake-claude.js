#!/usr/bin/env node
// Cross-platform fake Claude CLI and fail-closed child-process guard.
//
// The fake is launched only as:
//   process.execPath, [absolutePathToThisFile, ...claudeArgs]
//
// When preloaded through NODE_OPTIONS in the strict safe gate, it blocks a
// child process whose executable resolves to `claude` before PATH lookup. The
// guard records only a redacted marker; prompt/system-prompt text is never
// written to disk.

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const GUARD_INSTALLED = Symbol.for('prompt-master.claude-deny-guard-installed');
const POSIX_SHELLS = new Set(['sh', 'bash', 'dash', 'zsh', 'ksh']);
const WINDOWS_SHELLS = new Set(['cmd', 'powershell', 'pwsh']);
const CLAUDE_SHELL_TOKEN_RX = /\bclaude(?:\.(?:exe|cmd|bat|com))?(?![A-Za-z0-9_.-])/i;

function sha256(value) {
  return crypto.createHash('sha256').update(String(value || ''), 'utf8').digest('hex');
}

function commandBase(command) {
  const normalized = String(command || '').trim().replace(/^['"]|['"]$/g, '').replace(/\\/g, '/');
  const filename = normalized.slice(normalized.lastIndexOf('/') + 1).toLowerCase();
  return filename.replace(/\.(?:exe|cmd|bat|com)$/i, '');
}

function isClaudeCommand(command) {
  return commandBase(command) === 'claude';
}

function appendJsonLine(file, record) {
  if (!file || !path.isAbsolute(file)) {
    throw new Error('Claude safety marker path must be absolute');
  }
  fs.appendFileSync(file, `${JSON.stringify(record)}\n`, 'utf8');
}

function blockInvocation(kind, command, args, api) {
  const marker = process.env.PROMPT_MASTER_CLAUDE_DENY_MARKER;
  const argv = Array.isArray(args) ? args : [];
  appendJsonLine(marker, {
    schema_version: '1.0.0',
    kind,
    api,
    executable: kind === 'blocked-shell-api' ? 'shell' : commandBase(command),
    argv_count: argv.length,
    argv_sha256: sha256(JSON.stringify([String(command || ''), ...argv])),
  });
  const error = new Error('Blocked unsafe Claude or shell invocation in safe verification');
  error.code = 'PROMPT_MASTER_CLAUDE_BLOCKED';
  throw error;
}

function invocationArgsAndOptions(argsOrOptions, maybeOptions) {
  if (Array.isArray(argsOrOptions)) {
    return { args: argsOrOptions, options: maybeOptions || {} };
  }
  return { args: [], options: argsOrOptions == null ? (maybeOptions || {}) : argsOrOptions };
}

function shellCommandText(command, args) {
  const base = commandBase(command);
  if (POSIX_SHELLS.has(base)) {
    const index = args.findIndex((arg) => typeof arg === 'string' && /^-[A-Za-z]*c[A-Za-z]*$/.test(arg));
    return index === -1 ? null : args.slice(index + 1).join(' ');
  }
  if (base === 'cmd') {
    const index = args.findIndex((arg) => typeof arg === 'string' && /^\/c$/i.test(arg));
    return index === -1 ? null : args.slice(index + 1).join(' ');
  }
  if (WINDOWS_SHELLS.has(base)) {
    const index = args.findIndex((arg) => typeof arg === 'string' && /^(?:-c|-command|\/c)$/i.test(arg));
    return index === -1 ? null : args.slice(index + 1).join(' ');
  }
  return null;
}

function shellCommandMentionsClaude(command, args) {
  const text = shellCommandText(command, Array.isArray(args) ? args : []);
  return typeof text === 'string' && CLAUDE_SHELL_TOKEN_RX.test(text);
}

function installClaudeDenyGuard() {
  if (process.env.PROMPT_MASTER_DENY_REAL_CLAUDE !== '1' || globalThis[GUARD_INSTALLED]) return;
  globalThis[GUARD_INSTALLED] = true;

  const childProcess = require('child_process');
  for (const name of ['spawn', 'spawnSync', 'execFile', 'execFileSync']) {
    const original = childProcess[name];
    childProcess[name] = function guardedExecutable(command, argsOrOptions, maybeOptions) {
      const { args, options } = invocationArgsAndOptions(argsOrOptions, maybeOptions);
      if (options.shell) blockInvocation('blocked-shell-api', command, args, name);
      if (isClaudeCommand(command)) blockInvocation('blocked-real-claude', command, args, name);
      if (shellCommandMentionsClaude(command, args)) {
        blockInvocation('blocked-shell-claude', command, args, name);
      }
      return original.apply(this, arguments);
    };
  }
  for (const name of ['exec', 'execSync']) {
    childProcess[name] = function guardedShellApi(command) {
      blockInvocation('blocked-shell-api', 'shell', [String(command || '')], name);
    };
  }
}

function flagValue(argv, flag) {
  const index = argv.indexOf(flag);
  return index === -1 ? null : argv[index + 1] ?? null;
}

function safeValueEvidence(value) {
  if (value == null) return null;
  return {
    utf8_bytes: Buffer.byteLength(value, 'utf8'),
    sha256: sha256(value),
  };
}

function recordFakeInvocation(argv) {
  const marker = process.env.FAKE_CLAUDE_MARKER;
  appendJsonLine(marker, {
    schema_version: '1.0.0',
    kind: 'fake-claude-call',
    mode: process.env.FAKE_CLAUDE_MODE || 'pass',
    argv_count: argv.length,
    request: safeValueEvidence(flagValue(argv, '-p')),
    system_prompt: safeValueEvidence(flagValue(argv, '--append-system-prompt')),
    model: flagValue(argv, '--model'),
  });
}

function writePassingFixture() {
  process.stdout.write([
    'Variant A',
    'Fit: matches the request',
    'Risk / tradeoff: narrow',
    'When to use: when this direction fits',
    'Prompt: write the campaign',
    '',
  ].join('\n'));
}

function quoteShellCommand(candidate) {
  return process.platform === 'win32'
    ? `"${candidate.replace(/"/g, '""')}"`
    : `'${candidate.replace(/'/g, `'\\''`)}'`;
}

function runShellGuardProbe() {
  const childProcess = require('child_process');
  const candidate = process.env.HARMLESS_CLAUDE_EXECUTABLE;
  const shell = process.env.HARMLESS_CLAUDE_SHELL;
  if (!candidate || !shell || !path.isAbsolute(candidate) || !path.isAbsolute(shell)) {
    console.error('Shell guard probe requires absolute fixture and shell paths');
    return 8;
  }
  const quoted = quoteShellCommand(candidate);
  const shellArgs = process.platform === 'win32' ? ['/d', '/s', '/c', quoted] : ['-c', quoted];
  const probes = [
    () => childProcess.exec(quoted),
    () => childProcess.execSync(quoted),
    () => childProcess.spawn(quoted, [], { shell: true }),
    () => childProcess.spawnSync(quoted, [], { shell: true }),
    () => childProcess.spawn(quoted, undefined, { shell: true }),
    () => childProcess.spawnSync(quoted, undefined, { shell: true }),
    () => childProcess.spawn(shell, shellArgs),
    () => childProcess.spawnSync(shell, shellArgs),
  ];
  let blocked = 0;
  for (const attempt of probes) {
    try { attempt(); }
    catch (error) {
      if (error.code === 'PROMPT_MASTER_CLAUDE_BLOCKED') blocked++;
      else throw error;
    }
  }
  if (blocked !== probes.length) return 9;
  console.log(`blocked=${blocked}`);
  return 0;
}

function main(argv = process.argv.slice(2)) {
  if (argv[0] === '--guard-shell-probe') return runShellGuardProbe();
  try {
    recordFakeInvocation(argv);
  } catch (error) {
    console.error(`Fake Claude marker error: ${error.message}`);
    return 2;
  }

  if (argv[0] === '--version') {
    console.log('fake claude');
    return 0;
  }

  switch (process.env.FAKE_CLAUDE_MODE || 'pass') {
    case 'not-logged':
      console.error('Not logged in - please authenticate');
      return 1;
    case 'model-error':
      console.error('model failed');
      return 1;
    case 'slow':
      setTimeout(() => console.log('late'), 2000);
      return null;
    case 'pass-slow': {
      const delayMs = Number(process.env.FAKE_CLAUDE_DELAY_MS || 100);
      if (!Number.isInteger(delayMs) || delayMs < 1 || delayMs > 5000) {
        console.error('FAKE_CLAUDE_DELAY_MS must be an integer from 1 to 5000');
        return 2;
      }
      setTimeout(writePassingFixture, delayMs);
      return null;
    }
    case 'assert-fail':
      console.log('Variant A only');
      return 0;
    case 'pass':
      writePassingFixture();
      return 0;
    default:
      console.error(`Unknown FAKE_CLAUDE_MODE: ${process.env.FAKE_CLAUDE_MODE}`);
      return 2;
  }
}

installClaudeDenyGuard();

function samePath(left, right) {
  if (!left || !right) return false;
  const a = path.resolve(left);
  const b = path.resolve(right);
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
}

// A module named by both NODE_OPTIONS=--require and argv[1] is cached before
// Node reaches the entrypoint loader. Detect that exact case so the tracked
// fake still behaves as the CLI while remaining the preload deny guard.
if (require.main === module || samePath(process.argv[1], __filename)) {
  const exitCode = main();
  if (exitCode != null) process.exitCode = exitCode;
}

module.exports = {
  commandBase,
  installClaudeDenyGuard,
  invocationArgsAndOptions,
  isClaudeCommand,
  main,
  quoteShellCommand,
  runShellGuardProbe,
  safeValueEvidence,
  samePath,
  shellCommandMentionsClaude,
  shellCommandText,
};
