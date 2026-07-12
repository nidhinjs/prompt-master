#!/usr/bin/env node
// Dependency-free validator for tracked historical release provenance.
// Network access is never used. An already downloaded ZIP may be supplied.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');
const DEFAULT_RECORD = path.join(REPO_ROOT, 'docs/provenance/v1.29.0-release-asset.json');
const SHA1_RX = /^[0-9a-f]{40}$/;
const SHA256_RX = /^[0-9a-f]{64}$/;
const SAFE_PATH_RX = /^[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/;
const MAX_ARCHIVE_BYTES = 128 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 256;
const MAX_ENTRY_BYTES = 16 * 1024 * 1024;
const MAX_TOTAL_UNCOMPRESSED_BYTES = 64 * 1024 * 1024;
const SAFE_GIT_ENV = 'PROMPT_MASTER_SAFE_GIT';
const CANONICAL_REPOSITORY = 'azagreev/prompt-master-za';
const CANONICAL_RELEASE = 'v1.29.0';
const CANONICAL_PUBLISHED_AT = '2026-07-08T22:10:12Z';
const CANONICAL_VERIFIED_AT = '2026-07-12';
const CANONICAL_REF = Object.freeze({
  tag_object_sha: 'eb7ebeeb40b2e1983884d2b23ebacc1e58e9acb0',
  commit_sha: '283268be4097741b00aba7c2a191c0c22b0eb181',
  tree_sha: 'a30efb215215f6cd5039bfaeb4eaedba3cbf5774',
});
const CANONICAL_ASSET = Object.freeze({
  api_asset_id: 470714067,
  size_bytes: 74528,
  sha256: 'f3bcc8a77bda5273dc9ff348eb32939e161df003ed7f6e02ee850b5c0823427f',
});
const CANONICAL_FILES = Object.freeze([
  Object.freeze({
    path: 'SKILL.md',
    tag_path: 'plugins/prompt-master/skills/prompt-master/SKILL.md',
    tag_blob_oid: 'ee968c78c9d6a5cbb010451cf6d136eb33d6d093',
    sha256: 'b2ef95e23553833feb9fbeed2ea17b5433c782fc3f1dfa6874367b0a99f1dfc1',
  }),
  Object.freeze({
    path: 'references/models.md',
    tag_path: 'plugins/prompt-master/skills/prompt-master/references/models.md',
    tag_blob_oid: '24b05f76323532528c74bab18a74e98ac4302aaa',
    sha256: 'a0bd108dfb5b495a904debcca5063798c26e01026c3b3e2fa76f8a2464f8821a',
  }),
  Object.freeze({
    path: 'references/patterns.md',
    tag_path: 'plugins/prompt-master/skills/prompt-master/references/patterns.md',
    tag_blob_oid: '110f5a60ff263e5050eaf1bb9ddd3c94f89a61cf',
    sha256: 'ba230cec3231663ade7acc9223ae0ba8340549a87fca5a0f7d40b486cf03d4f0',
  }),
  Object.freeze({
    path: 'references/templates.md',
    tag_path: 'plugins/prompt-master/skills/prompt-master/references/templates.md',
    tag_blob_oid: '525e259fae35fb5aa62b628efcf4d22b4986293d',
    sha256: '7285851c5a7687883f547f6b505137780348d663c0b68aab7dad6080ea7f5e4b',
  }),
  Object.freeze({
    path: 'references/tool-profiles.md',
    tag_path: 'plugins/prompt-master/skills/prompt-master/references/tool-profiles.md',
    tag_blob_oid: '20306776f82ae85f58a6eedbcef466a36b2a2540',
    sha256: '7be72bf59731981fe213372a27ff79c6e511f32951569126ba975e75727f14b2',
  }),
]);
const CONTAINER_REASON_CODES = Object.freeze([
  'legacy_wildcard_packaging',
  'checkout_filesystem_timestamps',
  'checksum_sidecar_absent',
  'normalized_container_build_record_absent',
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function exactKeys(value, expected, label) {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${label} must be an object`);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  assert(JSON.stringify(actual) === JSON.stringify(wanted), `${label} keys mismatch`);
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function crc32(value) {
  let crc = 0xffffffff;
  for (const byte of value) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function safeRelativePath(value, label) {
  assert(typeof value === 'string' && SAFE_PATH_RX.test(value), `${label} is not a safe relative path`);
  assert(!value.includes('..') && !value.includes('\\'), `${label} contains traversal or backslashes`);
}

function strictIsoDate(value, label) {
  assert(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value), `${label} must be YYYY-MM-DD`);
  const parsed = new Date(`${value}T00:00:00Z`);
  assert(!Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value, `${label} is not a real calendar date`);
  return parsed;
}

function strictIsoTimestamp(value, label) {
  assert(
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value),
    `${label} must be an ISO UTC date-time`,
  );
  const parsed = new Date(value);
  const expected = typeof value === 'string' ? value.replace(/Z$/, '.000Z') : '';
  assert(!Number.isNaN(parsed.getTime()) && parsed.toISOString() === expected, `${label} is not a real ISO UTC date-time`);
  return parsed;
}

function resolveGitCommand(env = process.env) {
  const configured = env[SAFE_GIT_ENV];
  if (configured === undefined) return 'git';
  assert(typeof configured === 'string' && configured.length > 0, `${SAFE_GIT_ENV} must not be empty`);
  assert(path.isAbsolute(configured), `${SAFE_GIT_ENV} must be an absolute path`);
  let stat;
  try {
    stat = fs.statSync(configured);
  } catch (error) {
    throw new Error(`${SAFE_GIT_ENV} must point to an existing file: ${error.message}`);
  }
  assert(stat.isFile(), `${SAFE_GIT_ENV} must point to a regular file`);
  return configured;
}

function git(args, options = {}) {
  const result = spawnSync(resolveGitCommand(), args, {
    cwd: options.repoRoot || REPO_ROOT,
    encoding: options.buffer ? null : 'utf8',
    stdio: 'pipe',
  });
  assert(!result.error, `git ${args.join(' ')} failed: ${result.error?.message}`);
  assert(result.status === 0, `git ${args.join(' ')} failed: ${(result.stderr || '').toString().trim()}`);
  return options.buffer ? result.stdout : result.stdout.trim();
}

function validateRecord(record, options = {}) {
  exactKeys(record, [
    'schema_version', 'release', 'repository', 'canonical_ref', 'published_asset',
    'content_verification', 'container_reproducibility',
  ], 'record');
  assert(record.schema_version === '1.0.0', 'unsupported provenance schema_version');
  assert(record.release === CANONICAL_RELEASE, `release must be ${CANONICAL_RELEASE}`);
  assert(record.repository === CANONICAL_REPOSITORY, `repository must be ${CANONICAL_REPOSITORY}`);

  const ref = record.canonical_ref;
  exactKeys(ref, [
    'tag_name', 'tag_type', 'tag_signature', 'tag_object_sha', 'commit_sha', 'tree_sha',
  ], 'canonical_ref');
  assert(ref.tag_name === record.release, 'canonical tag_name must equal release');
  assert(ref.tag_type === 'annotated', 'historical record requires an annotated tag');
  assert(ref.tag_signature === 'unsigned', 'v1.29 historical record must state unsigned tag status');
  for (const key of ['tag_object_sha', 'commit_sha', 'tree_sha']) {
    assert(SHA1_RX.test(ref[key]), `${key} must be a lowercase 40-hex Git object ID`);
    assert(ref[key] === CANONICAL_REF[key], `${key} is not canonical for ${CANONICAL_RELEASE}`);
  }

  const asset = record.published_asset;
  exactKeys(asset, [
    'name', 'url', 'api_asset_id', 'published_at', 'size_bytes', 'sha256', 'digest_source',
  ], 'published_asset');
  assert(typeof asset.name === 'string' && asset.name.endsWith('.zip'), 'asset name must end in .zip');
  const expectedAssetName = `prompt-master-${record.release.slice(1)}.zip`;
  assert(asset.name === expectedAssetName, 'asset name must match the release version');
  const expectedAssetUrl = `https://github.com/${record.repository}/releases/download/${record.release}/${asset.name}`;
  assert(asset.url === expectedAssetUrl, 'asset URL must match repository, release, and asset name');
  assert(Number.isInteger(asset.api_asset_id) && asset.api_asset_id > 0, 'api_asset_id must be positive');
  const publishedAt = strictIsoTimestamp(asset.published_at, 'published_at');
  assert(Number.isInteger(asset.size_bytes) && asset.size_bytes > 0, 'size_bytes must be positive');
  assert(SHA256_RX.test(asset.sha256), 'published asset sha256 must be lowercase 64-hex');
  assert(asset.api_asset_id === CANONICAL_ASSET.api_asset_id, 'api_asset_id is not canonical');
  assert(asset.size_bytes === CANONICAL_ASSET.size_bytes, 'published asset size is not canonical');
  assert(asset.sha256 === CANONICAL_ASSET.sha256, 'published asset SHA-256 is not canonical');
  assert(asset.digest_source === 'github_release_api', 'historical digest_source must be github_release_api');

  const content = record.content_verification;
  exactKeys(content, ['verified_at', 'status', 'entry_count', 'files'], 'content_verification');
  const verifiedAt = strictIsoDate(content.verified_at, 'verified_at');
  const endOfVerifiedDay = verifiedAt.getTime() + 24 * 60 * 60 * 1000 - 1;
  assert(publishedAt.getTime() <= endOfVerifiedDay, 'verified_at must not precede published_at');
  assert(asset.published_at === CANONICAL_PUBLISHED_AT, 'published_at is not canonical');
  assert(content.verified_at === CANONICAL_VERIFIED_AT, 'verified_at is not canonical');
  assert(content.status === 'tag_content_match', 'content status must be tag_content_match');
  assert(content.entry_count === CANONICAL_FILES.length, `entry_count must be ${CANONICAL_FILES.length}`);
  assert(Array.isArray(content.files) && content.files.length === content.entry_count, 'file count mismatch');
  const paths = [];
  for (const [index, file] of content.files.entries()) {
    exactKeys(file, ['path', 'tag_path', 'tag_blob_oid', 'sha256'], `content file ${index}`);
    safeRelativePath(file.path, `content file ${index} path`);
    safeRelativePath(file.tag_path, `content file ${index} tag_path`);
    assert(SHA1_RX.test(file.tag_blob_oid), `content file ${index} tag_blob_oid is invalid`);
    assert(SHA256_RX.test(file.sha256), `content file ${index} sha256 is invalid`);
    const canonical = CANONICAL_FILES[index];
    assert(file.path === canonical.path, `content file ${index} path is not canonical`);
    assert(file.tag_path === canonical.tag_path, `content file ${index} tag_path is not canonical`);
    assert(file.tag_blob_oid === canonical.tag_blob_oid, `content file ${index} tag_blob_oid is not canonical`);
    assert(file.sha256 === canonical.sha256, `content file ${index} sha256 is not canonical`);
    paths.push(file.path);
  }
  assert(new Set(paths).size === paths.length, 'content paths must be unique');
  assert(JSON.stringify(paths) === JSON.stringify([...paths].sort()), 'content paths must be sorted');

  const container = record.container_reproducibility;
  exactKeys(container, ['status', 'reason_codes'], 'container_reproducibility');
  assert(container.status === 'not_attested', 'historical container status must be not_attested');
  assert(Array.isArray(container.reason_codes), 'container reason_codes must be an array');
  assert(
    JSON.stringify(container.reason_codes) === JSON.stringify(CONTAINER_REASON_CODES),
    'container reason_codes must match the canonical ordered codes',
  );

  if (options.verifyGit !== false) verifyGit(record, options.repoRoot || REPO_ROOT);
  if (options.assetPath) verifyAsset(record, options.assetPath);
  return true;
}

function verifyGit(record, repoRoot = REPO_ROOT) {
  const ref = record.canonical_ref;
  assert(git(['rev-parse', `refs/tags/${ref.tag_name}`], { repoRoot }) === ref.tag_object_sha, 'tag object SHA mismatch');
  assert(git(['rev-parse', `${ref.tag_name}^{}`], { repoRoot }) === ref.commit_sha, 'tag commit SHA mismatch');
  assert(git(['rev-parse', `${ref.tag_name}^{tree}`], { repoRoot }) === ref.tree_sha, 'tag tree SHA mismatch');
  const objectType = git(['cat-file', '-t', `refs/tags/${ref.tag_name}`], { repoRoot });
  assert(objectType === 'tag', 'tag type mismatch');
  const tagBody = git(['cat-file', '-p', `refs/tags/${ref.tag_name}`], { repoRoot });
  const hasSignature = /-----BEGIN (?:PGP|SSH) SIGNATURE-----/.test(tagBody);
  assert(!hasSignature, 'tag is signed but record says unsigned');
  for (const file of record.content_verification.files) {
    const spec = `${ref.tag_name}:${file.tag_path}`;
    assert(git(['rev-parse', spec], { repoRoot }) === file.tag_blob_oid, `tag blob OID mismatch: ${file.path}`);
    const bytes = git(['show', spec], { repoRoot, buffer: true });
    assert(sha256(bytes) === file.sha256, `tag content SHA-256 mismatch: ${file.path}`);
  }
}

function findEocd(buffer) {
  const minimum = Math.max(0, buffer.length - 65557);
  for (let offset = buffer.length - 22; offset >= minimum; offset--) {
    if (buffer.readUInt32LE(offset) !== 0x06054b50) continue;
    const commentLength = buffer.readUInt16LE(offset + 20);
    if (offset + 22 + commentLength === buffer.length) return offset;
  }
  throw new Error('ZIP end-of-central-directory record not found');
}

function parseZipEntries(buffer) {
  assert(Buffer.isBuffer(buffer), 'ZIP input must be a Buffer');
  assert(buffer.length >= 22 && buffer.length <= MAX_ARCHIVE_BYTES, 'ZIP archive size is outside the allowed bounds');
  const eocd = findEocd(buffer);
  assert(buffer.readUInt16LE(eocd + 4) === 0 && buffer.readUInt16LE(eocd + 6) === 0, 'multi-disk ZIP is unsupported');
  const diskCount = buffer.readUInt16LE(eocd + 8);
  const count = buffer.readUInt16LE(eocd + 10);
  const centralSize = buffer.readUInt32LE(eocd + 12);
  const centralOffset = buffer.readUInt32LE(eocd + 16);
  assert(count > 0 && count <= MAX_ZIP_ENTRIES, 'ZIP entry count is outside the allowed bounds');
  assert(diskCount === count, 'ZIP disk/total entry count mismatch');
  assert(centralOffset + centralSize === eocd, 'ZIP central-directory bounds mismatch');
  const entries = new Map();
  let cursor = centralOffset;
  let totalUncompressed = 0;
  for (let index = 0; index < count; index++) {
    assert(cursor + 46 <= eocd, `truncated ZIP central header ${index}`);
    assert(buffer.readUInt32LE(cursor) === 0x02014b50, `invalid ZIP central header ${index}`);
    const flags = buffer.readUInt16LE(cursor + 8);
    const method = buffer.readUInt16LE(cursor + 10);
    const expectedCrc = buffer.readUInt32LE(cursor + 16);
    const compressedSize = buffer.readUInt32LE(cursor + 20);
    const uncompressedSize = buffer.readUInt32LE(cursor + 24);
    const nameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const localOffset = buffer.readUInt32LE(cursor + 42);
    assert(cursor + 46 + nameLength + extraLength + commentLength <= eocd, `truncated ZIP central entry ${index}`);
    const name = buffer.subarray(cursor + 46, cursor + 46 + nameLength).toString('utf8');
    safeRelativePath(name, `ZIP entry ${index}`);
    assert((flags & 1) === 0, `encrypted ZIP entry is unsupported: ${name}`);
    assert(uncompressedSize <= MAX_ENTRY_BYTES, `ZIP entry exceeds the uncompressed limit: ${name}`);
    totalUncompressed += uncompressedSize;
    assert(totalUncompressed <= MAX_TOTAL_UNCOMPRESSED_BYTES, 'ZIP aggregate uncompressed size exceeds the limit');
    assert(!entries.has(name), `duplicate ZIP entry: ${name}`);
    assert(localOffset + 30 <= centralOffset, `ZIP local header is out of bounds: ${name}`);
    assert(buffer.readUInt32LE(localOffset) === 0x04034b50, `invalid ZIP local header: ${name}`);
    const localFlags = buffer.readUInt16LE(localOffset + 6);
    const localMethod = buffer.readUInt16LE(localOffset + 8);
    const localCrc = buffer.readUInt32LE(localOffset + 14);
    const localCompressedSize = buffer.readUInt32LE(localOffset + 18);
    const localUncompressedSize = buffer.readUInt32LE(localOffset + 22);
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    assert(dataStart + compressedSize <= centralOffset, `ZIP entry data is out of bounds: ${name}`);
    const localName = buffer.subarray(localOffset + 30, localOffset + 30 + localNameLength).toString('utf8');
    assert(localName === name, `ZIP local/central filename mismatch: ${name}`);
    assert(localFlags === flags && localMethod === method, `ZIP local/central flags or method mismatch: ${name}`);
    assert(localCrc === expectedCrc, `ZIP local/central CRC mismatch: ${name}`);
    assert(localCompressedSize === compressedSize, `ZIP local/central compressed size mismatch: ${name}`);
    assert(localUncompressedSize === uncompressedSize, `ZIP local/central uncompressed size mismatch: ${name}`);
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    let bytes;
    if (method === 0) bytes = compressed;
    else if (method === 8) bytes = zlib.inflateRawSync(compressed, { maxOutputLength: uncompressedSize });
    else throw new Error(`unsupported ZIP compression method ${method}: ${name}`);
    assert(bytes.length === uncompressedSize, `ZIP size mismatch: ${name}`);
    assert(crc32(bytes) === expectedCrc, `ZIP CRC mismatch: ${name}`);
    entries.set(name, bytes);
    cursor += 46 + nameLength + extraLength + commentLength;
  }
  assert(entries.size === count, 'ZIP entry count mismatch');
  assert(cursor === eocd, 'ZIP central directory did not end at EOCD');
  return entries;
}

function verifyAsset(record, assetPath) {
  const stat = fs.statSync(assetPath);
  assert(stat.isFile(), 'asset path must point to a file');
  assert(stat.size <= MAX_ARCHIVE_BYTES, 'asset exceeds the archive size limit');
  const bytes = fs.readFileSync(assetPath);
  assert(bytes.length === record.published_asset.size_bytes, 'asset byte size mismatch');
  assert(sha256(bytes) === record.published_asset.sha256, 'asset SHA-256 mismatch');
  const entries = parseZipEntries(bytes);
  const expected = record.content_verification.files.map((file) => file.path);
  const actual = [...entries.keys()].sort();
  assert(JSON.stringify(actual) === JSON.stringify(expected), 'asset ZIP inventory mismatch');
  for (const file of record.content_verification.files) {
    assert(sha256(entries.get(file.path)) === file.sha256, `asset entry SHA-256 mismatch: ${file.path}`);
  }
}

function parseArgs(argv) {
  const options = { recordPath: DEFAULT_RECORD, assetPath: null, verifyGit: true };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === '--record' || arg === '--asset') {
      assert(argv[index + 1], `${arg} requires a path`);
      options[arg === '--record' ? 'recordPath' : 'assetPath'] = path.resolve(argv[++index]);
    } else if (arg === '--no-git') options.verifyGit = false;
    else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArgs(argv);
    const record = JSON.parse(fs.readFileSync(options.recordPath, 'utf8'));
    validateRecord(record, options);
    console.log(`OK provenance: ${record.release} entries=${record.content_verification.entry_count} asset=${options.assetPath ? 'verified' : 'not-supplied'}`);
    return 0;
  } catch (error) {
    console.error(`FAIL provenance: ${error.message}`);
    return 1;
  }
}

if (require.main === module) process.exitCode = main();

module.exports = {
  CANONICAL_ASSET,
  CANONICAL_FILES,
  CANONICAL_PUBLISHED_AT,
  CANONICAL_REF,
  CANONICAL_RELEASE,
  CANONICAL_REPOSITORY,
  CANONICAL_VERIFIED_AT,
  CONTAINER_REASON_CODES,
  DEFAULT_RECORD,
  REPO_ROOT,
  SAFE_GIT_ENV,
  crc32,
  parseArgs,
  parseZipEntries,
  resolveGitCommand,
  sha256,
  validateRecord,
  verifyAsset,
  verifyGit,
};
