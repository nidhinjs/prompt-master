#!/usr/bin/env node
// Offline package/inventory contracts for the sharded pattern registry.

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { FAMILIES, validatePatterns } = require('./validate-patterns');
const { validateRuntimeInventory } = require('./validate-runtime-inventory');

const repoRoot = path.join(__dirname, '..');
const skillDir = path.join(repoRoot, 'plugins/prompt-master/skills/prompt-master');
const manifestFile = path.join(repoRoot, 'plugins/prompt-master/runtime-manifest.json');
const semanticFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/patterns/semantic-contracts.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requireMatch(text, expression, message) {
  assert(expression.test(text), message);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

const checks = [
  function exactPatternInventory() {
    const validation = validatePatterns({ skillDir });
    assert(validation.ok, `pattern registry invalid: ${validation.errors.join('; ')}`);
    const inventory = validateRuntimeInventory();
    assert(inventory.ok, `runtime inventory invalid: ${inventory.errors.join('; ')}`);
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    assert(semanticFixture.evidence_class === 'recorded-source-contract', 'semantic fixture evidence class mismatch');
    assert(semanticFixture.live_behavior === false, 'package fixture must not claim live behavior');
    const expected = [...semanticFixture.package_pattern_files].sort();
    const controlledShards = FAMILIES.map((family) => `references/patterns/${family}.md`).sort();
    assert(controlledShards.every((file) => expected.includes(file)), 'semantic fixture must inventory all controlled shards');
    const actual = manifest.files.filter((file) => file === 'references/patterns.md' || file.startsWith('references/patterns/')).sort();
    assert(JSON.stringify(actual) === JSON.stringify(expected), `manifest pattern inventory mismatch: ${actual.join(', ')}`);
  },

  function stagedBytesMatchSources() {
    const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    const patternFiles = manifest.files.filter((file) => file === 'references/patterns.md' || file.startsWith('references/patterns/'));
    const staging = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-master-pattern-package-'));
    for (const relative of patternFiles) {
      const source = path.join(skillDir, relative);
      const destination = path.join(staging, relative);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(source, destination);
      assert(fs.readFileSync(source).equals(fs.readFileSync(destination)), `${relative}: staged bytes differ`);
      assert(sha256(source) === sha256(destination), `${relative}: staged SHA-256 differs`);
    }
  },

  function recordedBudgetsMatchValidatorConstants() {
    const budgets = semanticFixture.load_budgets;
    const validator = require('./validate-patterns');
    assert(budgets.router_max_lines === validator.ROUTER_MAX_LINES, 'router line budget fixture drift');
    assert(budgets.router_max_bytes === validator.ROUTER_MAX_BYTES, 'router byte budget fixture drift');
    assert(budgets.shard_max_lines === validator.SHARD_MAX_LINES, 'shard line budget fixture drift');
    assert(budgets.shard_max_bytes === validator.SHARD_MAX_BYTES, 'shard byte budget fixture drift');
    assert(budgets.max_shards_per_diagnosis === 2, 'recorded maximum must remain two shards');
  },

  function packagingRemainsAllowlistAndByteParityBased() {
    const packageScript = fs.readFileSync(path.join(repoRoot, 'scripts/package-skill.ps1'), 'utf8').replace(/^\uFEFF/, '');
    requireMatch(packageScript, /runtime-manifest\.json/i, 'package script must load runtime-manifest.json');
    requireMatch(packageScript, /foreach \(\$relativePath in \$runtimeFiles\)/i, 'package script must package the literal allowlist');
    requireMatch(packageScript, /ZIP\/source parity mismatch/i, 'package script must fail on byte-parity drift');
    requireMatch(
      packageScript,
      /ComputeHash\(\$entryStream\)[\s\S]{0,240}ComputeHash\(\$sourceStream\)/i,
      'package script must compare entry and source hashes'
    );
    assert(!/Compress-Archive/i.test(packageScript), 'package script must not use wildcard Compress-Archive');
  },
];

let failed = 0;
for (const check of checks) {
  try { check(); }
  catch (error) {
    failed++;
    console.error(`FAIL ${check.name}: ${error.message}`);
  }
}

if (failed) {
  console.error(`\n${failed}/${checks.length} pattern package tests failed`);
  process.exitCode = 1;
} else console.log(`OK: ${checks.length}/${checks.length} pattern package tests passed`);
