#!/usr/bin/env node
// Positive and adversarial tests for the exact runtime inventory.

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { validateRuntimeInventory } = require('./validate-runtime-inventory');

const repoRoot = path.join(__dirname, '..');
const manifestSource = path.join(repoRoot, 'plugins/prompt-master/runtime-manifest.json');
const runtimeSource = path.join(repoRoot, 'plugins/prompt-master/skills/prompt-master');

function assert(condition, message) { if (!condition) throw new Error(message); }

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-master-inventory-'));
  const root = path.join(dir, 'runtime');
  const manifestFile = path.join(dir, 'runtime-manifest.json');
  fs.cpSync(runtimeSource, root, { recursive: true });
  fs.copyFileSync(manifestSource, manifestFile);
  return { dir, root, manifestFile };
}

function mutateManifest(value, update) {
  const manifest = JSON.parse(fs.readFileSync(value.manifestFile, 'utf8'));
  update(manifest);
  fs.writeFileSync(value.manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
}

const cases = [
  ['wildcard', (f) => mutateManifest(f, (m) => { m.files[0] = '*.md'; }), 'unsafe or non-literal'],
  ['traversal', (f) => mutateManifest(f, (m) => { m.files[0] = '../SKILL.md'; }), 'unsafe or non-literal'],
  ['duplicate', (f) => mutateManifest(f, (m) => { m.files[1] = m.files[0]; }), 'duplicate file path'],
  ['unsorted', (f) => mutateManifest(f, (m) => { [m.files[0], m.files[1]] = [m.files[1], m.files[0]]; }), 'sorted exactly'],
  ['missing-listed', (f) => fs.unlinkSync(path.join(f.root, 'SKILL.md')), 'listed file missing'],
  ['extra-file', (f) => fs.writeFileSync(path.join(f.root, 'unexpected.md'), 'no\n'), 'unlisted file'],
  ['wrong-root', (f) => mutateManifest(f, (m) => { m.root = 'plugins/prompt-master'; }), 'root must be'],
  ['extra-field', (f) => mutateManifest(f, (m) => { m.wildcards = true; }), 'fields/order must be exactly'],
];

let failed = 0;
let passed = 0;
const clean = fixture();
const cleanResult = validateRuntimeInventory({ manifestFile: clean.manifestFile, rootDir: clean.root });
if (!cleanResult.ok) {
  failed++;
  console.error(`FAIL valid-runtime-inventory: ${cleanResult.errors.join('; ')}`);
} else passed++;

for (const [name, mutate, expected] of cases) {
  try {
    const value = fixture();
    mutate(value);
    const result = validateRuntimeInventory({ manifestFile: value.manifestFile, rootDir: value.root });
    assert(!result.ok, 'mutation passed unexpectedly');
    assert(result.errors.some((error) => error.includes(expected)), `missing '${expected}': ${result.errors.join('; ')}`);
    passed++;
  } catch (error) {
    failed++;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

if (failed) {
  console.error(`\n${failed}/${passed + failed} runtime inventory tests failed`);
  process.exitCode = 1;
} else console.log(`OK: ${passed}/${passed} runtime inventory tests passed`);
