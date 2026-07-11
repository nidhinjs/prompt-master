#!/usr/bin/env node
// Deterministic Codex discovery/layout validation. Local files only; no CLI/model/network.

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const defaultRepoRoot = path.join(__dirname, '..');
const REPO_ENTRY = '.agents/skills/prompt-master';
const REPO_LOCATOR = '.agents/skills/prompt-master/SKILL.md';
const PLUGIN_ROOT = 'plugins/prompt-master';
const PLUGIN_SKILL = 'plugins/prompt-master/skills/prompt-master';
const CODEX_MANIFEST = 'plugins/prompt-master/.codex-plugin/plugin.json';
const RUNTIME_MANIFEST = 'plugins/prompt-master/runtime-manifest.json';
const PACKAGE_SCRIPT = 'scripts/package-skill.ps1';

function normalize(value) {
  return value.replace(/\\/g, '/');
}

function relative(root, value) {
  return normalize(path.relative(root, value)) || '.';
}

function readJson(file, label, errors) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  } catch (error) {
    errors.push(`${label}: ${error.message}`);
    return null;
  }
}

function parseFrontmatter(text, errors) {
  const match = text.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    errors.push('SKILL.md: missing leading YAML frontmatter block');
    return {};
  }
  const fields = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || /^\s/.test(line)) continue;
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*?)\s*$/);
    if (field) fields[field[1]] = field[2].replace(/^(['"])([\s\S]*)\1$/, '$2');
  }
  return fields;
}

function validateCodexSkill(skillDir, errors) {
  const skillFile = path.join(skillDir, 'SKILL.md');
  if (!fs.existsSync(skillFile) || !fs.statSync(skillFile).isFile()) {
    errors.push('Codex skill: SKILL.md is missing');
    return;
  }
  const fields = parseFrontmatter(fs.readFileSync(skillFile, 'utf8'), errors);
  const fieldNames = Object.keys(fields).sort();
  if (JSON.stringify(fieldNames) !== JSON.stringify(['description', 'name'])) {
    errors.push(`Codex skill frontmatter: fields must be exactly name and description, got ${fieldNames.join(', ') || '(none)'}`);
  }
  if (!fields.name) errors.push("Codex skill frontmatter: required 'name' is missing");
  else {
    if (fields.name !== 'prompt-master') errors.push(`Codex skill frontmatter: name must be prompt-master, got ${fields.name}`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.name) || fields.name.length > 64) {
      errors.push('Codex skill frontmatter: name must be a lowercase hyphenated identifier of at most 64 characters');
    }
  }
  if (!fields.description) errors.push("Codex skill frontmatter: required 'description' is missing");
  else if (fields.description.length > 1024) errors.push('Codex skill frontmatter: description exceeds 1024 characters');
}

function validateLocator(repoRoot, errors) {
  const entry = path.join(repoRoot, REPO_ENTRY);
  const locator = path.join(repoRoot, REPO_LOCATOR);
  const canonicalFile = path.resolve(repoRoot, PLUGIN_SKILL, 'SKILL.md');
  let resolvedSkill = null;
  let entryStat;
  try { entryStat = fs.lstatSync(entry); }
  catch (error) {
    errors.push(`Codex repo discovery: locator directory is missing: ${error.message}`);
    return null;
  }
  if (!entryStat.isDirectory() || entryStat.isSymbolicLink()) {
    errors.push('Codex repo discovery: selected locator mode requires a real prompt-master directory; plain-text or symlink entries are forbidden');
    return null;
  }
  const entries = fs.readdirSync(entry, { withFileTypes: true });
  if (entries.length !== 1 || entries[0].name !== 'SKILL.md' || !entries[0].isFile()) {
    errors.push('Codex repo discovery: thin locator must contain only one regular SKILL.md and no copied runtime/references');
  }
  let text = '';
  try { text = fs.readFileSync(locator, 'utf8'); }
  catch (error) { errors.push(`Codex repo discovery locator: ${error.message}`); return null; }
  const locatorErrors = [];
  const fields = parseFrontmatter(text, locatorErrors);
  for (const error of locatorErrors) errors.push(`Codex repo discovery locator: ${error}`);
  if (fields.name !== 'prompt-master') errors.push('Codex repo discovery locator: name must be prompt-master');
  if (!fields.description) errors.push("Codex repo discovery locator: required 'description' is missing");
  const fieldNames = Object.keys(fields).sort();
  if (JSON.stringify(fieldNames) !== JSON.stringify(['description', 'name'])) {
    errors.push(`Codex repo discovery locator: frontmatter fields must be exactly name and description, got ${fieldNames.join(', ') || '(none)'}`);
  }
  const links = [...text.matchAll(/\[[^\]]+\]\(([^)]+\/SKILL\.md)\)/g)].map((match) => match[1]);
  if (links.length !== 1) {
    errors.push('Codex repo discovery locator: body must contain exactly one canonical SKILL.md link');
  } else {
    const candidate = path.resolve(path.dirname(locator), links[0]);
    if (!candidate.startsWith(`${repoRoot}${path.sep}`)) errors.push('Codex repo discovery locator: canonical link escapes repository root');
    if (candidate !== canonicalFile) {
      errors.push(`Codex repo discovery locator: link must target canonical SKILL.md, got ${relative(repoRoot, candidate)}`);
    }
    try {
      if (!fs.statSync(candidate).isFile()) throw new Error('target is not a file');
      resolvedSkill = candidate;
    } catch (_) { errors.push('Codex repo discovery locator: canonical SKILL.md link is broken'); }
  }
  if (!/load and follow the complete canonical instructions/i.test(text)) {
    errors.push('Codex repo discovery locator: body must instruct Codex to load the complete canonical instructions');
  }
  return resolvedSkill;
}

function validateCodexManifest(repoRoot, errors) {
  const file = path.join(repoRoot, CODEX_MANIFEST);
  const manifest = readJson(file, 'Codex plugin manifest', errors);
  if (!manifest) return;
  if (manifest.name !== 'prompt-master') errors.push('Codex plugin manifest: name must be prompt-master');
  if (typeof manifest.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    errors.push('Codex plugin manifest: version must be semantic X.Y.Z');
  }
  if (typeof manifest.description !== 'string' || !manifest.description.trim()) {
    errors.push('Codex plugin manifest: description is required');
  }
  if (manifest.skills !== './skills/') {
    errors.push("Codex plugin manifest: skills must be exactly './skills/'");
  } else {
    const root = path.resolve(repoRoot, PLUGIN_ROOT);
    const resolved = path.resolve(root, manifest.skills);
    if (resolved !== path.resolve(root, 'skills') || !resolved.startsWith(`${root}${path.sep}`)) {
      errors.push('Codex plugin manifest: skills path escapes the plugin root');
    }
  }
}

function runtimeFiles(repoRoot, errors) {
  const manifest = readJson(path.join(repoRoot, RUNTIME_MANIFEST), 'Runtime manifest', errors);
  if (!manifest || !Array.isArray(manifest.files) || manifest.root !== PLUGIN_SKILL) {
    if (manifest) errors.push(`Runtime manifest: root must be ${PLUGIN_SKILL} and files must be an array`);
    return [];
  }
  return manifest.files;
}

function hashTree(root, files, label, errors) {
  const hashes = {};
  for (const name of files) {
    const file = path.resolve(root, name);
    if (!file.startsWith(`${path.resolve(root)}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      errors.push(`${label}: runtime file missing or escaping root: ${name}`);
      continue;
    }
    hashes[name] = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  }
  return hashes;
}

function validatePackageSource(repoRoot, errors) {
  const file = path.join(repoRoot, PACKAGE_SCRIPT);
  let text = '';
  try { text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''); }
  catch (error) { errors.push(`Claude ZIP package source: ${error.message}`); return; }
  for (const [label, pattern] of [
    ['canonical skill tree', /\$skillDir\s*=\s*Join-Path \$repoRoot 'plugins\/prompt-master\/skills\/prompt-master'/],
    ['tracked runtime manifest', /\$runtimeManifest\s*=\s*Join-Path \$repoRoot 'plugins\/prompt-master\/runtime-manifest\.json'/],
    ['manifest-only ZIP entries', /foreach \(\$relativePath in \$runtimeFiles\)[\s\S]*?CreateEntry\(\$relativePath,/],
    ['ZIP/source byte hashing', /ComputeHash\(\$entryStream\)[\s\S]{0,300}ComputeHash\(\$sourceStream\)/],
    ['versioned artifact name', /\$zipName\s*=\s*"prompt-master-\$version\.zip"/],
  ]) {
    if (!pattern.test(text)) errors.push(`Claude ZIP package source: missing ${label} contract`);
  }
  if (/codex\s+plugin\s+add/i.test(text)) errors.push('Claude ZIP package source: unsupported Codex install claim found');
}

function validateLayout(options = {}) {
  const repoRoot = path.resolve(options.repoRoot || defaultRepoRoot);
  const errors = [];
  const canonical = path.resolve(repoRoot, PLUGIN_SKILL);
  const locatorTarget = validateLocator(repoRoot, errors);

  validateCodexManifest(repoRoot, errors);
  validateCodexSkill(canonical, errors);
  const files = runtimeFiles(repoRoot, errors);
  validatePackageSource(repoRoot, errors);
  if (files.length && fs.existsSync(canonical)) {
    const pluginHashes = hashTree(canonical, files, 'plugin runtime', errors);
    const zipSourceHashes = hashTree(path.resolve(repoRoot, PLUGIN_SKILL), files, 'Claude ZIP source', errors);
    if (locatorTarget) {
      const repoHashes = hashTree(path.dirname(locatorTarget), files, 'repo discovery runtime', errors);
      if (JSON.stringify(repoHashes) !== JSON.stringify(pluginHashes)) errors.push('Runtime parity: repo discovery hashes differ from plugin runtime');
    }
    if (JSON.stringify(zipSourceHashes) !== JSON.stringify(pluginHashes)) errors.push('Runtime parity: Claude ZIP source hashes differ from plugin runtime');
  }

  return { ok: errors.length === 0, errors, repoRoot, locatorTarget, canonical, files };
}

function makeFixture() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-master-codex-layout-'));
  const canonical = path.join(repoRoot, PLUGIN_SKILL);
  fs.mkdirSync(path.join(canonical, 'references'), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, REPO_ENTRY), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, 'plugins/prompt-master/.codex-plugin'), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, 'scripts'), { recursive: true });
  fs.writeFileSync(path.join(canonical, 'SKILL.md'), '---\nname: prompt-master\ndescription: Generates optimized prompts when prompt authoring is explicitly requested.\n---\n\nBody.\n');
  fs.writeFileSync(path.join(canonical, 'references/test.md'), 'reference\n');
  fs.writeFileSync(path.join(repoRoot, RUNTIME_MANIFEST), `${JSON.stringify({
    schema_version: '1.0.0', root: PLUGIN_SKILL, files: ['SKILL.md', 'references/test.md'],
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(repoRoot, CODEX_MANIFEST), `${JSON.stringify({
    name: 'prompt-master', version: '1.34.0', description: 'Prompt skill.', skills: './skills/',
  }, null, 2)}\n`);
  fs.writeFileSync(path.join(repoRoot, PACKAGE_SCRIPT), [
    "$runtimeManifest = Join-Path $repoRoot 'plugins/prompt-master/runtime-manifest.json'",
    "$skillDir = Join-Path $repoRoot 'plugins/prompt-master/skills/prompt-master'",
    '$zipName = "prompt-master-$version.zip"',
    'foreach ($relativePath in $runtimeFiles) { $entry = $archive.CreateEntry($relativePath, 1) }',
    '$entryHash = $h.ComputeHash($entryStream); $sourceHash = $h.ComputeHash($sourceStream)',
  ].join('\n'));
  fs.writeFileSync(path.join(repoRoot, REPO_LOCATOR), [
    '---',
    'name: prompt-master',
    'description: Use when the user explicitly asks to write or improve an AI prompt.',
    '---',
    '',
    'Load and follow the complete canonical instructions in [the tracked Prompt Master skill](../../../plugins/prompt-master/skills/prompt-master/SKILL.md).',
    '',
  ].join('\n'));
  return repoRoot;
}

function runAdversarialTests() {
  const cases = [
    ['broken-link', (root) => {
      const file = path.join(root, REPO_LOCATOR);
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('plugins/prompt-master/skills/prompt-master/SKILL.md', 'plugins/prompt-master/skills/missing/SKILL.md'));
    }, /broken|missing/],
    ['plain-text-link', (root) => {
      fs.rmSync(path.join(root, REPO_ENTRY), { recursive: true });
      fs.writeFileSync(path.join(root, REPO_ENTRY), '../../plugins/prompt-master/skills/prompt-master\n');
    }, /plain-text or symlink/],
    ['escaping-link', (root) => {
      const file = path.join(root, REPO_LOCATOR);
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('../../../plugins/prompt-master/skills/prompt-master/SKILL.md', '../../../../outside/SKILL.md'));
    }, /escapes repository root/],
    ['duplicate-runtime-copy', (root) => {
      fs.copyFileSync(path.join(root, PLUGIN_SKILL, 'SKILL.md'), path.join(root, REPO_LOCATOR));
      fs.cpSync(path.join(root, PLUGIN_SKILL, 'references'), path.join(root, REPO_ENTRY, 'references'), { recursive: true });
    }, /only one regular SKILL\.md|exactly one canonical/],
    ['missing-codex-description', (root) => {
      const file = path.join(root, PLUGIN_SKILL, 'SKILL.md');
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/^description:.*\n/m, ''));
    }, /required 'description'/],
    ['wrong-codex-name', (root) => {
      const file = path.join(root, PLUGIN_SKILL, 'SKILL.md');
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('name: prompt-master', 'name: Prompt Master'));
    }, /name must be prompt-master/],
    ['unsupported-frontmatter-field', (root) => {
      const file = path.join(root, PLUGIN_SKILL, 'SKILL.md');
      fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('name: prompt-master\n', 'name: prompt-master\nversion: 1.34.0\n'));
    }, /fields must be exactly name and description/],
    ['escaping-manifest-path', (root) => {
      const file = path.join(root, CODEX_MANIFEST);
      const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
      manifest.skills = '../skills/';
      fs.writeFileSync(file, `${JSON.stringify(manifest)}\n`);
    }, /skills must be exactly/],
  ];
  let failed = 0;
  const clean = validateLayout({ repoRoot: makeFixture() });
  if (!clean.ok) {
    console.error(`FAIL clean-fixture: ${clean.errors.join('; ')}`);
    failed++;
  }
  for (const [name, mutate, expected] of cases) {
    const root = makeFixture();
    mutate(root);
    const result = validateLayout({ repoRoot: root });
    if (result.ok || !result.errors.some((error) => expected.test(error))) {
      console.error(`FAIL ${name}: ${result.errors.join('; ') || 'mutation passed unexpectedly'}`);
      failed++;
    }
  }
  return { failed, total: cases.length + 1 };
}

function main(argv = process.argv.slice(2)) {
  const unknown = argv.filter((arg) => arg !== '--production-only');
  if (unknown.length) { console.error(`Unknown argument: ${unknown[0]}`); return 2; }
  const production = validateLayout();
  for (const error of production.errors) console.error(`ERROR: ${error}`);
  const adversarial = argv.includes('--production-only') ? { failed: 0, total: 0 } : runAdversarialTests();
  if (!production.ok || adversarial.failed) {
    console.error(`FAILED Codex layout: production_errors=${production.errors.length} adversarial_failed=${adversarial.failed}`);
    return 1;
  }
  console.log(`OK Codex layout: runtime_files=${production.files.length} adversarial=${adversarial.total}/${adversarial.total}`);
  return 0;
}

if (require.main === module) process.exitCode = main();

module.exports = { parseFrontmatter, validateCodexSkill, validateLayout };
