#!/usr/bin/env node
// Adversarial mutation tests for validate-registry.js. All writes are confined
// to a temporary fixture tree; repository runtime files remain read-only.

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { validateMigrationMapDocument, validateRegistry } = require('./validate-registry');

const repoRoot = path.join(__dirname, '..');
const schemaSource = path.join(
  repoRoot,
  'plugins/prompt-master/skills/prompt-master/references/facts/schema.json'
);
const fixtureManifest = JSON.parse(fs.readFileSync(
  path.join(repoRoot, 'tests/registry/fixtures/mutations.json'),
  'utf8'
));
const migrationMap = JSON.parse(fs.readFileSync(
  path.join(repoRoot, 'tests/fixtures/registry/v1.32-to-v1.33-migration-map.json'),
  'utf8'
));
const profileNames = [
  'builders-workflows.md', 'coding-agents.md', 'decompiler-fallback.md',
  'hosted-text.md', 'local-text.md', 'media.md', 'research-browser.md',
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function baseRecord(overrides = {}) {
  return {
    id: 'openai.test-model.api',
    vendor: 'openai',
    model_id: 'test-model',
    surface: 'api',
    channel: 'production',
    availability: { status: 'public', scope: ['api'], regions: ['global'], sunset_on: null },
    recommended_for: ['general'],
    routing_default_for: [],
    prompting_constraints: [],
    claims: [],
    last_verified: '2026-07-10',
    source: [{
      url: 'https://developers.openai.com/api/docs/models',
      kind: 'official_docs',
      supports: ['model_id', 'channel', 'availability'],
    }],
    ...overrides,
  };
}

function buildFixture() {
  const skillDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-master-registry-'));
  const references = path.join(skillDir, 'references');
  const facts = path.join(references, 'facts');
  const profiles = path.join(references, 'profiles');
  fs.mkdirSync(facts, { recursive: true });
  fs.mkdirSync(profiles, { recursive: true });
  fs.copyFileSync(schemaSource, path.join(facts, 'schema.json'));
  writeJson(path.join(facts, 'openai.json'), {
    $schema: './schema.json',
    document_type: 'provider_shard',
    provider_family: 'openai',
    records: [baseRecord()],
  });
  writeJson(path.join(facts, 'index.json'), {
    $schema: './schema.json',
    document_type: 'registry_index',
    schema_version: '1.0.0',
    shards: [{ provider_family: 'openai', path: 'openai.json' }],
    routing: [{ alias: 'test', default_record_id: 'openai.test-model.api', candidate_record_ids: ['openai.test-model.api'] }],
  });
  for (const name of profileNames) fs.writeFileSync(path.join(profiles, name), `# ${name}\n`);
  const rows = profileNames.map((name, index) => {
    const fact = index === 3 ? '[route: `test`](facts/index.json)' : 'none (evergreen-only)';
    return `| **Route ${index + 1}** | route-${index + 1} | [${name}](profiles/${name}) | ${fact} | — |`;
  });
  fs.writeFileSync(path.join(references, 'tool-profiles.md'), [
    '# Tool Profiles',
    '| Route (legacy-compatible) | Match / preserved aliases | Primary profile | Fact lookup | Add-on only for explicit composite |',
    '|---|---|---|---|---|',
    ...rows,
    '',
  ].join('\n'));
  return { skillDir, facts, profiles, index: path.join(facts, 'index.json'), shard: path.join(facts, 'openai.json') };
}

function editJson(file, update) {
  const value = readJson(file);
  update(value);
  writeJson(file, value);
}

function secondRecord(overrides = {}) {
  return baseRecord({ id: 'openai.other-model.api', model_id: 'other-model', ...overrides });
}

const mutations = {
  invalidChannel(f) { editJson(f.shard, (v) => { v.records[0].channel = 'nightly'; }); },
  invalidAvailability(f) { editJson(f.shard, (v) => { v.records[0].availability.status = 'secret'; }); },
  invalidTag(f) { editJson(f.shard, (v) => { v.records[0].prompting_constraints = ['invented']; }); },
  missingSource(f) { editJson(f.shard, (v) => { delete v.records[0].source; }); },
  unofficialSource(f) { editJson(f.shard, (v) => { v.records[0].source[0].kind = 'community_post'; }); },
  insecureSource(f) { editJson(f.shard, (v) => { v.records[0].source[0].url = 'http://example.test/model'; }); },
  missingDate(f) { editJson(f.shard, (v) => { delete v.records[0].last_verified; }); },
  invalidDate(f) { editJson(f.shard, (v) => { v.records[0].last_verified = '2026-02-30'; }); },
  recordDefault(f) { editJson(f.shard, (v) => { v.records[0].routing_default_for = ['test']; }); },
  duplicateId(f) { editJson(f.shard, (v) => { v.records.push({ ...secondRecord(), id: v.records[0].id }); }); },
  duplicateModelSurface(f) { editJson(f.shard, (v) => { v.records.push(secondRecord({ model_id: v.records[0].model_id })); }); },
  duplicateAlias(f) { editJson(f.index, (v) => { v.routing.push({ ...v.routing[0] }); }); },
  previewDefault(f) { editJson(f.shard, (v) => { v.records[0].channel = 'preview'; }); },
  betaDefault(f) { editJson(f.shard, (v) => { v.records[0].channel = 'beta'; }); },
  limitedDefault(f) { editJson(f.shard, (v) => { v.records[0].availability.status = 'limited'; }); },
  unavailableDefault(f) { editJson(f.shard, (v) => { v.records[0].availability.status = 'unavailable'; }); },
  deprecatedDefault(f) { editJson(f.shard, (v) => { v.records[0].channel = 'deprecated'; }); },
  retiredDefault(f) { editJson(f.shard, (v) => { v.records[0].channel = 'retired'; }); },
  sunsetDefault(f) {
    editJson(f.shard, (v) => {
      v.records[0].availability.status = 'sunset_scheduled';
      v.records[0].availability.sunset_on = '2026-12-01';
    });
  },
  accountDefault(f) { editJson(f.shard, (v) => { v.records[0].availability.status = 'account_gated'; }); },
  regionDefault(f) { editJson(f.shard, (v) => { v.records[0].availability.status = 'region_gated'; }); },
  latestAccount(f) {
    editJson(f.shard, (v) => { v.records[0].availability.status = 'account_gated'; });
    editJson(f.index, (v) => { v.routing[0].alias = 'latest'; });
    fs.writeFileSync(path.join(f.skillDir, 'references/tool-profiles.md'), fs.readFileSync(path.join(f.skillDir, 'references/tool-profiles.md'), 'utf8').replace('`test`', '`latest`'));
  },
  latestPreview(f) {
    editJson(f.shard, (v) => { v.records[0].channel = 'preview'; });
    editJson(f.index, (v) => { v.routing[0].alias = 'latest'; });
    fs.writeFileSync(path.join(f.skillDir, 'references/tool-profiles.md'), fs.readFileSync(path.join(f.skillDir, 'references/tool-profiles.md'), 'utf8').replace('`test`', '`latest`'));
  },
  stalePreview(f) { setStale(f, 'preview', 'public', 15); },
  staleBeta(f) { setStale(f, 'beta', 'public', 15); },
  staleLimited(f) { setStale(f, 'legacy', 'limited', 15); },
  staleProduction(f) { setStale(f, 'production', 'public', 61); },
  orphanCandidate(f) { editJson(f.index, (v) => { v.routing[0].candidate_record_ids.push('openai.missing.api'); }); },
  orphanRecord(f) { editJson(f.shard, (v) => { v.records.push(secondRecord()); }); },
  orphanDiskShard(f) { fs.copyFileSync(f.shard, path.join(f.facts, 'extra.json')); },
  missingIndexShard(f) { editJson(f.index, (v) => { v.shards[0].path = 'missing.json'; }); },
  danglingProfileAlias(f) {
    const file = path.join(f.skillDir, 'references/tool-profiles.md');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('`test`', '`missing`'));
  },
  unreachableProfile(f) {
    const file = path.join(f.skillDir, 'references/tool-profiles.md');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('[media.md](profiles/media.md)', '[hosted-text.md](profiles/hosted-text.md)'));
  },
  twoAddons(f) {
    const file = path.join(f.skillDir, 'references/tool-profiles.md');
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(
      '| [hosted-text.md](profiles/hosted-text.md) | [route: `test`](facts/index.json) | — |',
      '| [hosted-text.md](profiles/hosted-text.md) | [route: `test`](facts/index.json) | [media](profiles/media.md), [local](profiles/local-text.md) |'
    ));
  },
  danglingLink(f) { fs.appendFileSync(path.join(f.profiles, 'hosted-text.md'), '[missing](missing.md)\n'); },
  unsupportedClaim(f) {
    editJson(f.shard, (v) => { v.records[0].claims = [{ key: 'knobs', value: ['x'] }]; });
  },
  weakenSchema(f) {
    editJson(path.join(f.facts, 'schema.json'), (v) => { v.$defs.channel.enum.push('nightly'); });
  },
};

const migrationMutations = {
  baselineSha(value) { value.sources[0].source_sha256 = '0'.repeat(64); },
  lineCount(value) { value.sources[0].line_count++; },
  missingLine(value) { value.sources[0].classifications.pop(); },
  duplicateLine(value) { value.sources[0].classifications.push({ ...value.sources[0].classifications[0] }); },
  invalidClass(value) { value.sources[0].classifications[0].classification = ''; },
  unknownRecord(value) {
    const entry = value.sources[0].classifications.find((item) => item.record_ids.length);
    entry.record_ids[0] = 'openai.missing.api';
  },
  unknownAlias(value) {
    const entry = value.sources[0].classifications.find((item) => item.route_aliases.length);
    entry.route_aliases[0] = 'missing-alias';
  },
  duplicateRecordRef(value) {
    const entry = value.sources[0].classifications.find((item) => item.record_ids.length);
    entry.record_ids.push(entry.record_ids[0]);
  },
  removedClaimsRef(value) {
    const entry = value.sources[0].classifications.find((item) => item.classification === 'removed_unverified');
    entry.record_ids.push('openai.gpt-5-5.api');
  },
  noteOnNormal(value) { value.sources[0].classifications[0].note = 'not allowed here'; },
  classAllowlist(value) { value.classification_values.push('unreviewed'); },
};

function setStale(fixture, channel, status, days) {
  editJson(fixture.shard, (value) => {
    value.records[0].channel = channel;
    value.records[0].availability.status = status;
    value.records[0].last_verified = new Date(Date.parse(`${fixtureManifest.today}T00:00:00Z`) - days * 86400000).toISOString().slice(0, 10);
  });
  editJson(fixture.index, (value) => { delete value.routing[0].default_record_id; });
}

let failed = 0;
let passed = 0;

const clean = buildFixture();
const cleanResult = validateRegistry({ skillDir: clean.skillDir, today: fixtureManifest.today });
if (!cleanResult.ok) {
  failed++;
  console.error(`FAIL valid-registry: ${cleanResult.errors.join('; ')}`);
} else {
  passed++;
}

for (const testCase of fixtureManifest.cases) {
  const fixture = buildFixture();
  try {
    assert(typeof mutations[testCase.mutation] === 'function', `unknown mutation ${testCase.mutation}`);
    mutations[testCase.mutation](fixture);
    const result = validateRegistry({ skillDir: fixture.skillDir, today: fixtureManifest.today });
    if (testCase.pass) {
      assert(result.ok, `expected pass; got: ${result.errors.join('; ')}`);
    } else {
      assert(!result.ok, 'mutation passed unexpectedly');
      assert(result.errors.some((error) => error.includes(testCase.error)), `missing expected error '${testCase.error}'; got: ${result.errors.join('; ')}`);
    }
    passed++;
  } catch (error) {
    failed++;
    console.error(`FAIL ${testCase.name}: ${error.message}`);
  }
}

const actualIndex = readJson(path.join(
  repoRoot,
  'plugins/prompt-master/skills/prompt-master/references/facts/index.json'
));
const actualRecordIds = new Set();
for (const shard of actualIndex.shards) {
  const value = readJson(path.join(
    repoRoot,
    'plugins/prompt-master/skills/prompt-master/references/facts',
    shard.path
  ));
  for (const record of value.records) actualRecordIds.add(record.id);
}
const actualAliases = new Set(actualIndex.routing.map((route) => route.alias));
const migrationClean = validateMigrationMapDocument(migrationMap, actualRecordIds, actualAliases);
if (migrationClean.length) {
  failed++;
  console.error(`FAIL valid-migration-map: ${migrationClean.join('; ')}`);
} else passed++;

for (const testCase of fixtureManifest.migration_cases) {
  try {
    const value = JSON.parse(JSON.stringify(migrationMap));
    assert(typeof migrationMutations[testCase.mutation] === 'function', `unknown migration mutation ${testCase.mutation}`);
    migrationMutations[testCase.mutation](value);
    const result = validateMigrationMapDocument(value, actualRecordIds, actualAliases);
    assert(result.some((error) => error.includes(testCase.error)), `missing expected error '${testCase.error}'; got: ${result.join('; ')}`);
    passed++;
  } catch (error) {
    failed++;
    console.error(`FAIL ${testCase.name}: ${error.message}`);
  }
}

if (failed) {
  console.error(`\n${failed}/${passed + failed} registry mutation tests failed`);
  process.exitCode = 1;
} else {
  console.log(`OK: ${passed}/${passed} registry validation tests passed`);
}
