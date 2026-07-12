#!/usr/bin/env node
// Offline mutation and ZIP-parser tests for historical release provenance.

const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');

const {
  DEFAULT_RECORD,
  SAFE_GIT_ENV,
  crc32,
  parseZipEntries,
  resolveGitCommand,
  sha256,
  validateRecord,
  verifyAsset,
} = require('./validate-provenance');

const repoRoot = path.join(__dirname, '..');
const mutationsPath = path.join(repoRoot, 'tests/provenance/mutations.json');
const schemaPath = path.join(repoRoot, 'tests/provenance/schema.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function location(root, dottedPath) {
  const parts = dottedPath.split('.');
  const key = parts.pop();
  let parent = root;
  for (const part of parts) parent = parent[Number.isInteger(Number(part)) && String(Number(part)) === part ? Number(part) : part];
  return { parent, key: Number.isInteger(Number(key)) && String(Number(key)) === key ? Number(key) : key };
}

function applyMutation(record, mutation) {
  if (mutation.op === 'sequence') {
    for (const change of mutation.changes) applyMutation(record, change);
    return;
  }
  const source = location(record, mutation.path);
  if (mutation.op === 'delete') delete source.parent[source.key];
  else if (mutation.op === 'set') source.parent[source.key] = clone(mutation.value);
  else if (mutation.op === 'copy') {
    const target = location(record, mutation.target);
    target.parent[target.key] = clone(source.parent[source.key]);
  } else if (mutation.op === 'swap') {
    const target = location(record, mutation.target);
    const saved = clone(source.parent[source.key]);
    source.parent[source.key] = clone(target.parent[target.key]);
    target.parent[target.key] = saved;
  } else throw new Error(`unsupported mutation op: ${mutation.op}`);
}

function buildZip(entries) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const [name, value, method = 0] of entries) {
    const nameBytes = Buffer.from(name);
    const data = Buffer.from(value);
    const compressed = method === 8 ? zlib.deflateRawSync(data) : data;
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBytes.length, 26);
    const localPart = Buffer.concat([local, nameBytes, compressed]);
    locals.push(localPart);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBytes.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(Buffer.concat([central, nameBytes]));
    offset += localPart.length;
  }
  const centralBytes = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBytes.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, centralBytes, eocd]);
}

const base = JSON.parse(fs.readFileSync(DEFAULT_RECORD, 'utf8'));
const mutationBundle = JSON.parse(fs.readFileSync(mutationsPath, 'utf8'));
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
assert(mutationBundle.schema_version === '1.0.0', 'unsupported mutation schema');

let passed = 0;
let failed = 0;

function run(name, fn) {
  try {
    fn();
    passed++;
  } catch (error) {
    failed++;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

run('canonicalRecordMatchesGit', () => validateRecord(base));

run('canonicalSchemaPinsHistoricalRecord', () => {
  assert(schema.properties.release.const === base.release, 'schema release const drifted');
  assert(schema.properties.repository.const === base.repository, 'schema repository const drifted');
  assert(JSON.stringify(schema.properties.canonical_ref.const) === JSON.stringify(base.canonical_ref), 'schema canonical_ref const drifted');
  assert(JSON.stringify(schema.properties.published_asset.const) === JSON.stringify(base.published_asset), 'schema published_asset const drifted');
  const contentProperties = schema.properties.content_verification.properties;
  assert(contentProperties.verified_at.const === base.content_verification.verified_at, 'schema verified_at const drifted');
  assert(contentProperties.status.const === base.content_verification.status, 'schema status const drifted');
  assert(contentProperties.entry_count.const === 5, 'schema entry_count must be exactly five');
  assert(JSON.stringify(contentProperties.files.const) === JSON.stringify(base.content_verification.files), 'schema five-file inventory drifted');
  assert(
    JSON.stringify(schema.properties.container_reproducibility.const) === JSON.stringify(base.container_reproducibility),
    'schema container reason-code contract drifted',
  );
});

run('safeGitOverrideRequiresAbsoluteExistingFile', () => {
  assert(resolveGitCommand({}) === 'git', 'unset safe Git override must preserve the git default');
  let relativeRejected = false;
  try { resolveGitCommand({ [SAFE_GIT_ENV]: 'git' }); } catch { relativeRejected = true; }
  assert(relativeRejected, 'relative safe Git override must fail');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-master-safe-git-'));
  try {
    let directoryRejected = false;
    try { resolveGitCommand({ [SAFE_GIT_ENV]: dir }); } catch { directoryRejected = true; }
    assert(directoryRejected, 'directory safe Git override must fail');
    let missingRejected = false;
    try { resolveGitCommand({ [SAFE_GIT_ENV]: path.join(dir, 'missing-git') }); } catch { missingRejected = true; }
    assert(missingRejected, 'missing safe Git override must fail');
    assert(resolveGitCommand({ [SAFE_GIT_ENV]: process.execPath }) === process.execPath, 'absolute file override must pass');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

for (const mutation of mutationBundle.mutations) {
  run(`rejects:${mutation.id}`, () => {
    const record = clone(base);
    applyMutation(record, mutation);
    let rejected = false;
    let rejectionMessage = '';
    try { validateRecord(record); } catch (error) {
      rejected = true;
      rejectionMessage = error.message;
    }
    assert(rejected, `mutation unexpectedly passed: ${mutation.id}`);
    if (mutation.expected_error) {
      assert(rejectionMessage.includes(mutation.expected_error), `mutation ${mutation.id} missed expected branch: ${rejectionMessage}`);
    }
  });
}

run('verifiesSyntheticZipWithoutExternalTools', () => {
  const zip = buildZip([
    ['SKILL.md', 'synthetic skill\n', 0],
    ['references/test.md', 'deflated evidence\n', 8],
  ]);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-master-provenance-'));
  const assetPath = path.join(dir, 'synthetic.zip');
  try {
    fs.writeFileSync(assetPath, zip);
    const record = clone(base);
    record.published_asset.api_asset_id = 1;
    record.published_asset.size_bytes = zip.length;
    record.published_asset.sha256 = sha256(zip);
    record.published_asset.digest_source = 'downloaded_asset';
    record.content_verification.entry_count = 2;
    record.content_verification.files = [
      {
        path: 'SKILL.md',
        tag_path: 'SKILL.md',
        tag_blob_oid: '0000000000000000000000000000000000000000',
        sha256: sha256(Buffer.from('synthetic skill\n')),
      },
      {
        path: 'references/test.md',
        tag_path: 'references/test.md',
        tag_blob_oid: '1111111111111111111111111111111111111111',
        sha256: sha256(Buffer.from('deflated evidence\n')),
      },
    ];
    verifyAsset(record, assetPath);
    record.published_asset.sha256 = '0000000000000000000000000000000000000000000000000000000000000000';
    let rejected = false;
    try { verifyAsset(record, assetPath); } catch { rejected = true; }
    assert(rejected, 'tampered synthetic asset hash must fail');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function rejectsZip(name, mutate, expectedError = null) {
  run(name, () => {
    const original = buildZip([['SKILL.md', 'bounded\n', 8]]);
    const damaged = Buffer.from(original);
    mutate(damaged);
    let rejected = false;
    let rejectionMessage = '';
    try { parseZipEntries(damaged); } catch (error) {
      rejected = true;
      rejectionMessage = error.message;
    }
    assert(rejected, `${name} must fail closed`);
    if (expectedError) assert(expectedError.test(rejectionMessage), `${name} missed expected branch: ${rejectionMessage}`);
  });
}

rejectsZip('rejectsMalformedEocd', (zip) => zip.writeUInt16LE(1, zip.length - 2));
rejectsZip('rejectsLocalCentralNameMismatch', (zip) => { zip[30] ^= 1; });
rejectsZip('rejectsCrcMismatch', (zip) => {
  const central = zip.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  zip.writeUInt32LE(0, 14);
  zip.writeUInt32LE(0, central + 16);
}, /^ZIP CRC mismatch:/);
rejectsZip('rejectsCorruptedDeflatePayload', (zip) => {
  const dataStart = 30 + zip.readUInt16LE(26) + zip.readUInt16LE(28);
  zip[dataStart] = 0x07;
}, /invalid|corrupt|unexpected/i);
rejectsZip('rejectsOversizedEntryDeclaration', (zip) => {
  const central = zip.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  zip.writeUInt32LE(16 * 1024 * 1024 + 1, 22);
  zip.writeUInt32LE(16 * 1024 * 1024 + 1, central + 24);
});

run('rejectsTraversalAndEncryption', () => {
  let rejectedTraversal = false;
  try { parseZipEntries(buildZip([['../escape', 'x', 0]])); } catch { rejectedTraversal = true; }
  assert(rejectedTraversal, 'traversal entry must fail');
  const encrypted = buildZip([['SKILL.md', 'x', 0]]);
  const central = encrypted.indexOf(Buffer.from([0x50, 0x4b, 0x01, 0x02]));
  encrypted.writeUInt16LE(1, 6);
  encrypted.writeUInt16LE(1, central + 8);
  let rejectedEncrypted = false;
  try { parseZipEntries(encrypted); } catch { rejectedEncrypted = true; }
  assert(rejectedEncrypted, 'encrypted entry must fail');
});

if (failed) {
  console.error(`\n${failed}/${passed + failed} provenance tests failed`);
  process.exitCode = 1;
} else {
  console.log(`OK: ${passed}/${passed} provenance tests passed`);
}
