#!/usr/bin/env node
// Offline mutation tests for the deterministic Codex role-policy validator.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { validateCodexAgents } = require('./validate-codex-agents');

const repoRoot = path.join(__dirname, '..');
const source = path.join(repoRoot, '.codex');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function withFixture(mutator, expectedPattern) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-master-codex-agents-'));
  try {
    fs.cpSync(source, path.join(root, '.codex'), { recursive: true });
    mutator(root);
    const result = validateCodexAgents(root);
    assert(!result.ok, `mutation unexpectedly passed: ${expectedPattern}`);
    assert(
      result.errors.some((error) => expectedPattern.test(error)),
      `mutation missed ${expectedPattern}; errors: ${result.errors.join(' | ')}`
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const baseline = validateCodexAgents();
assert(baseline.ok, `baseline failed: ${baseline.errors.join(' | ')}`);

withFixture((root) => {
  const file = path.join(root, '.codex/agents/repo_explorer.toml');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/^description = .*\n/m, ''));
}, /required non-empty string description/);

withFixture((root) => {
  const sourceFile = path.join(root, '.codex/agents/repo_explorer.toml');
  const target = path.join(root, '.codex/agents/docs_author.toml');
  fs.writeFileSync(target, fs.readFileSync(sourceFile, 'utf8'));
}, /filename must match name repo_explorer|duplicate agent name repo_explorer/);

withFixture((root) => {
  const file = path.join(root, '.codex/agents/docs_reviewer.toml');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('sandbox_mode = "read-only"', 'sandbox_mode = "workspace-write"'));
}, /sandbox_mode must equal read-only/);

withFixture((root) => {
  const file = path.join(root, '.codex/agents/test_runner.toml');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('model_reasoning_effort = "low"', 'model_reasoning_effort = "ultra"'));
}, /model_reasoning_effort must equal low/);

withFixture((root) => {
  const file = path.join(root, '.codex/agents/eval_architect.toml');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('model = "gpt-5.6-sol"', 'model = "gpt-5.6-sol-ultra"'));
}, /model must equal gpt-5\.6-sol|Ultra is an orchestration mode/);

withFixture((root) => {
  const file = path.join(root, '.codex/config.toml');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('max_depth = 1', 'max_depth = 2'));
}, /agents\.max_depth must equal 1/);

withFixture((root) => {
  const file = path.join(root, '.codex/agents/runtime_author.toml');
  fs.appendFileSync(file, 'sandbox_mode = "danger-full-access"\n');
}, /author role must inherit sandbox/);

withFixture((root) => {
  const oldFile = path.join(root, '.codex/agents/repo_explorer.toml');
  const newFile = path.join(root, '.codex/agents/repo-explorer.toml');
  fs.renameSync(oldFile, newFile);
  fs.writeFileSync(newFile, fs.readFileSync(newFile, 'utf8').replace('name = "repo_explorer"', 'name = "repo-explorer"'));
}, /inventory mismatch|invalid agent name/);

console.log(JSON.stringify({
  ok: true,
  baseline_profiles: baseline.summary.parsed_profiles,
  mutations: 8,
}, null, 2));
