#!/usr/bin/env node
// Fail-closed validation for the tracked runtime manifest. Local files only.

'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const defaultManifest = path.join(repoRoot, 'plugins/prompt-master/runtime-manifest.json');
const EXPECTED_ROOT = 'plugins/prompt-master/skills/prompt-master';

function normalize(value) {
  return value.replace(/\\/g, '/');
}

function collectFiles(root, current = root) {
  const out = [];
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(root, absolute));
    else if (entry.isFile()) out.push(normalize(path.relative(root, absolute)));
    else out.push(`!non-file:${normalize(path.relative(root, absolute))}`);
  }
  return out.sort();
}

function validateRuntimeInventory(options = {}) {
  const manifestFile = path.resolve(options.manifestFile || defaultManifest);
  const rootOverride = options.rootDir ? path.resolve(options.rootDir) : null;
  const errors = [];
  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8').replace(/^\uFEFF/, '')); }
  catch (error) { return { ok: false, errors: [`runtime manifest: ${error.message}`], files: [] }; }
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return { ok: false, errors: ['runtime manifest: root must be an object'], files: [] };
  }
  if (JSON.stringify(Object.keys(manifest)) !== JSON.stringify(['schema_version', 'root', 'files'])) {
    errors.push('runtime manifest: fields/order must be exactly schema_version, root, files');
  }
  if (manifest.schema_version !== '1.0.0') errors.push('runtime manifest: schema_version must be 1.0.0');
  if (manifest.root !== EXPECTED_ROOT) errors.push(`runtime manifest: root must be ${EXPECTED_ROOT}`);
  if (!Array.isArray(manifest.files) || manifest.files.length === 0) {
    errors.push('runtime manifest: files must be a non-empty array');
    return { ok: false, errors, files: [] };
  }
  const safePath = /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/;
  for (const [index, file] of manifest.files.entries()) {
    if (typeof file !== 'string' || !safePath.test(file) || file.includes('..') || file.includes('*') || file.includes('?')) {
      errors.push(`runtime manifest files[${index}]: unsafe or non-literal relative path`);
    }
  }
  if (new Set(manifest.files).size !== manifest.files.length) errors.push('runtime manifest: duplicate file path');
  const sorted = [...manifest.files].sort();
  if (JSON.stringify(sorted) !== JSON.stringify(manifest.files)) errors.push('runtime manifest: files must be sorted exactly');

  const root = rootOverride || path.join(repoRoot, ...EXPECTED_ROOT.split('/'));
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
    errors.push(`runtime manifest: root directory missing: ${root}`);
    return { ok: false, errors, files: manifest.files };
  }
  const actual = collectFiles(root);
  const expectedSet = new Set(manifest.files);
  const actualSet = new Set(actual);
  for (const file of manifest.files) {
    if (!actualSet.has(file)) errors.push(`runtime manifest: listed file missing from root: ${file}`);
  }
  for (const file of actual) {
    if (file.startsWith('!non-file:')) errors.push(`runtime manifest: symlink or non-file entry forbidden: ${file.slice(10)}`);
    else if (!expectedSet.has(file)) errors.push(`runtime manifest: unlisted file under root: ${file}`);
  }
  return { ok: errors.length === 0, errors, files: manifest.files, root };
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === '--json') options.json = true;
    else if (argv[index] === '--manifest' && argv[index + 1]) options.manifestFile = argv[++index];
    else if (argv[index] === '--root' && argv[index + 1]) options.rootDir = argv[++index];
    else throw new Error(`Unknown or incomplete argument: ${argv[index]}`);
  }
  return options;
}

function main(argv = process.argv.slice(2)) {
  let options;
  try { options = parseArgs(argv); }
  catch (error) { console.error(error.message); return 2; }
  const result = validateRuntimeInventory(options);
  if (options.json) console.log(JSON.stringify(result, null, 2));
  else if (result.ok) console.log(`OK runtime inventory: files=${result.files.length}`);
  else {
    for (const error of result.errors) console.error(`ERROR: ${error}`);
    console.error(`FAILED runtime inventory: ${result.errors.length} error(s)`);
  }
  return result.ok ? 0 : 1;
}

if (require.main === module) process.exitCode = main();

module.exports = { EXPECTED_ROOT, collectFiles, main, parseArgs, validateRuntimeInventory };
