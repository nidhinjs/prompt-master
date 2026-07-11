#!/usr/bin/env node
// Offline Claude/Codex UserPromptSubmit schema-parity tests. Never invokes a model.

'use strict';

const assert = require('assert');
const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = path.join(__dirname, '..');
const hook = path.join(repoRoot, 'plugins/prompt-master/hooks/multi-agent-detect.js');
const hookConfig = path.join(repoRoot, 'plugins/prompt-master/hooks/hooks.json');
const skillFile = path.join(repoRoot, 'plugins/prompt-master/skills/prompt-master/SKILL.md');
async function run(input, env = {}) {
  const stdin = new EventEmitter();
  stdin.setEncoding = () => {};
  stdin.resume = () => queueMicrotask(() => {
    if (input) stdin.emit('data', input);
    stdin.emit('end');
  });
  let stdout = '';
  let stderr = '';
  const fakeProcess = {
    env: { ...process.env, ...env },
    stdin,
    stdout: { write: (value) => { stdout += value; } },
    stderr: { write: (value) => { stderr += value; } },
    exitCode: undefined,
  };
  const module = { exports: {} };
  const source = `${fs.readFileSync(hook, 'utf8')}\nmodule.exports.__testMain = main;\n`;
  vm.runInNewContext(source, { module, exports: module.exports, process: fakeProcess, require: { main: null } }, { filename: hook });
  await module.exports.__testMain();
  return { status: fakeProcess.exitCode ?? 0, stdout, stderr, error: null };
}

function checkAdvisory(result, label) {
  assert(!result.error, `${label}: child error ${result.error?.message}`);
  assert.strictEqual(result.status, 0, `${label}: advisory hook must exit zero`);
  assert.strictEqual(result.stderr, '', `${label}: advisory hook must not write stderr`);
}

function parseOutput(result, label) {
  checkAdvisory(result, label);
  assert(result.stdout.trim(), `${label}: expected advisory output`);
  const output = JSON.parse(result.stdout);
  assert.strictEqual(output?.hookSpecificOutput?.hookEventName, 'UserPromptSubmit', `${label}: wrong hookEventName`);
  assert.strictEqual(typeof output?.hookSpecificOutput?.additionalContext, 'string', `${label}: additionalContext must be a string`);
  assert(output.hookSpecificOutput.additionalContext.length > 0, `${label}: additionalContext must not be empty`);
  return output;
}

const prompt = 'write a prompt for a team of agents doing research';
const claudeFixture = JSON.stringify({
  session_id: 'claude-fixture', transcript_path: '/tmp/transcript.jsonl', cwd: repoRoot,
  permission_mode: 'default', hook_event_name: 'UserPromptSubmit', prompt,
});
const codexFixture = JSON.stringify({
  session_id: 'codex-fixture', cwd: repoRoot, hook_event_name: 'UserPromptSubmit', prompt,
});

const tests = [
  async function schemaParity() {
    const claude = parseOutput(await run(claudeFixture), 'Claude fixture');
    const codex = parseOutput(await run(codexFixture), 'Codex fixture');
    assert.deepStrictEqual(codex, claude, 'Claude and Codex fixtures must produce equivalent output');
  },

  async function negativeNoOp() {
    const result = await run(JSON.stringify({ prompt: 'help me write a prompt for Midjourney' }));
    checkAdvisory(result, 'negative fixture');
    assert.strictEqual(result.stdout, '', 'negative fixture must stay silent');
  },

  async function malformedInputNoOp() {
    for (const [label, input] of [['malformed JSON', '{no'], ['empty stdin', ''], ['non-string prompt', '{"prompt":42}']]) {
      const result = await run(input);
      checkAdvisory(result, label);
      assert.strictEqual(result.stdout, '', `${label}: must stay silent`);
    }
  },

  async function environmentFallbackParity() {
    const result = await run('', { PROMPT_MASTER_HOOK_INPUT: codexFixture });
    const output = parseOutput(result, 'environment fallback');
    const direct = parseOutput(await run(codexFixture), 'direct Codex fixture');
    assert.deepStrictEqual(output, direct, 'stdin and environment fallback output must match');
  },

  function hookRegistrationContract() {
    const config = JSON.parse(fs.readFileSync(hookConfig, 'utf8'));
    const registrations = config?.hooks?.UserPromptSubmit;
    assert(Array.isArray(registrations) && registrations.length === 1, 'hooks.json must register one UserPromptSubmit matcher');
    const commands = registrations[0]?.hooks;
    assert(Array.isArray(commands) && commands.length === 1, 'UserPromptSubmit must register one hook');
    assert.strictEqual(commands[0]?.type, 'command', 'hook must remain a command hook');
    assert(/\$\{(?:CLAUDE_)?PLUGIN_ROOT\}/.test(commands[0]?.command || ''), 'hook command must resolve from a Codex-supported plugin root variable');
    assert(/multi-agent-detect\.js/.test(commands[0]?.command || ''), 'hook command must target multi-agent-detect.js');
  },

  function skippedHookIsNotPrerequisite() {
    const skill = fs.readFileSync(skillFile, 'utf8');
    assert(/^---\r?\n[\s\S]*?^name:\s*prompt-master\s*$/m.test(skill), 'canonical skill must remain independently discoverable');
    assert(!/hook[^\n]{0,80}(?:required|prerequisite|must run)/i.test(skill), 'runtime skill must not require hook execution or trust');
    // An untrusted/skipped hook performs no process call; the runtime skill remains present.
    assert(fs.statSync(skillFile).isFile(), 'runtime skill must exist independently of optional hook execution');
  },
];

async function main() {
  let failed = 0;
  for (const test of tests) {
    try { await test(); }
    catch (error) { failed++; console.error(`FAIL ${test.name}: ${error.message}`); }
  }
  if (failed) {
    console.error(`\n${failed}/${tests.length} Codex hook tests failed`);
    process.exitCode = 1;
  } else console.log(`OK: ${tests.length}/${tests.length} Codex hook tests passed`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
