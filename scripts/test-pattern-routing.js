#!/usr/bin/env node
// Offline E2E contracts for legacy resolution and bounded shard loading.

'use strict';

const fs = require('fs');
const path = require('path');
const {
  FAMILIES,
  loadPatternSection,
  resolveLegacyPattern,
  validatePatterns,
} = require('./validate-patterns');

const repoRoot = path.join(__dirname, '..');
const skillDir = path.join(repoRoot, 'plugins/prompt-master/skills/prompt-master');
const references = path.join(skillDir, 'references');
const routingFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/patterns/routing-cases.json'), 'utf8'));
const legacyFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/patterns/legacy-resolution.json'), 'utf8'));
const semanticFixture = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/patterns/semantic-contracts.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requireMatch(text, expression, message) {
  assert(expression.test(text), message);
}

function expandMembership(value) {
  const ids = [];
  for (const raw of value.split(',')) {
    const token = raw.trim();
    const match = token.match(/^(?:PM-)?([0-9]{3})(?:[–-](?:PM-)?([0-9]{3}))?$/);
    assert(match, `invalid router membership token: ${token}`);
    const start = Number(match[1]);
    const end = match[2] ? Number(match[2]) : start;
    assert(end >= start, `descending router membership range: ${token}`);
    for (let number = start; number <= end; number++) {
      ids.push(`PM-${String(number).padStart(3, '0')}`);
    }
  }
  return ids;
}

function routerRows(router) {
  return [...router.matchAll(/^\|\s*\[[^\]]+\]\(patterns\/([a-z][a-z0-9-]*\.md)\)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/gm)]
    .map((match) => ({ file: match[1], triggers: match[2], membership: match[3] }));
}

const checks = [
  function registryIsLoadable() {
    const result = validatePatterns({ skillDir });
    assert(result.ok, `pattern registry invalid: ${result.errors.join('; ')}`);
    assert(routingFixture.evidence_class === 'automated-offline-source-contract', 'routing fixture evidence class mismatch');
    assert(routingFixture.live_behavior === false, 'routing fixture must not claim live behavior');
    for (const [name, expected] of Object.entries(semanticFixture.registry_counts)) {
      assert(result.counts[name] === expected, `expected ${name}=${expected}, got ${result.counts[name]}`);
    }
  },

  function everyLegacyIdResolvesAndLoads() {
    const index = JSON.parse(fs.readFileSync(path.join(references, 'patterns/index.json'), 'utf8'));
    const contract = legacyFixture.mapping_contract;
    assert(legacyFixture.evidence_class === 'automated-offline', 'legacy fixture evidence class mismatch');
    for (let legacyId = contract.legacy_start; legacyId <= contract.legacy_end; legacyId++) {
      const expected = `${contract.id_prefix}${String(legacyId).padStart(contract.id_width, '0')}`;
      const record = resolveLegacyPattern(index, legacyId);
      assert(record?.id === expected, `legacy #${legacyId} resolved to ${record?.id || 'nothing'}`);
      const loaded = loadPatternSection({ skillDir, legacyId });
      assert(loaded.record.id === expected, `legacy #${legacyId} loaded ${loaded.record.id}`);
      assert(loaded.section.startsWith(`## ${expected}`), `${expected} loaded the wrong Markdown section`);
    }
    for (const lookup of legacyFixture.required_lookups) {
      const record = resolveLegacyPattern(index, lookup.legacy_id);
      assert(record?.id === lookup.id, `required lookup #${lookup.legacy_id} must resolve to ${lookup.id}`);
      assert(record.status === lookup.status, `${lookup.id} status must be ${lookup.status}`);
      if (lookup.redirect_to) assert(record.redirect_to === lookup.redirect_to, `${lookup.id} must redirect to ${lookup.redirect_to}`);
    }
  },

  function recordedRoutingCasesMatchDeclaredSource() {
    const router = fs.readFileSync(path.join(references, 'patterns.md'), 'utf8');
    const index = JSON.parse(fs.readFileSync(path.join(references, 'patterns/index.json'), 'utf8'));
    const rows = new Map(routerRows(router).map((row) => [row.file, row]));
    for (const testCase of routingFixture.cases) {
      assert(/^PARCH-E2E-0[1-5]$/.test(testCase.id), `unexpected routing case ID ${testCase.id}`);
      if (testCase.router_must_include) {
        assert(router.includes(testCase.router_must_include), `${testCase.id}: router source contract missing`);
      }
      const row = rows.get(testCase.primary_file);
      assert(row, `${testCase.id}: missing router row for ${testCase.primary_file}`);
      for (const term of testCase.router_terms || []) {
        assert(row.triggers.toLowerCase().includes(term.toLowerCase()), `${testCase.id}: router row missing trigger term '${term}'`);
      }
      for (const id of testCase.pattern_ids || []) {
        const record = index.patterns.find((item) => item.id === id);
        assert(record?.file === testCase.primary_file, `${testCase.id}: ${id} does not resolve to ${testCase.primary_file}`);
        assert(loadPatternSection({ skillDir, id }).section.startsWith(`## ${id}`), `${testCase.id}: ${id} section is not loadable`);
      }
    }
  },

  function routerOwnsBoundedLoadingPolicy() {
    const router = fs.readFileSync(path.join(references, 'patterns.md'), 'utf8');
    requireMatch(
      router,
      /Generic prompt diagnosis starts with `prompt-design\.md`; do not preload every shard\./i,
      'router must send generic diagnosis to prompt-design only'
    );
    requireMatch(
      router,
      /Load a second shard only when the prompt has a distinct second failure family\./i,
      'router must restrict secondary loading to a distinct family'
    );
    assert((router.match(/patterns\/[a-z][a-z0-9-]*\.md/g) || []).filter((value, index, all) => all.indexOf(value) === index).length === FAMILIES.length,
      'router must link exactly the nine controlled shards');
    for (const family of FAMILIES) {
      assert(router.includes(`patterns/${family}.md`), `router missing ${family}.md`);
    }
    requireMatch(router, /Legacy `pattern #N` references resolve to `PM-NNN` through/i, 'router missing legacy resolution contract');
  },

  function routerMembershipIsExactAndNonOverlapping() {
    const router = fs.readFileSync(path.join(references, 'patterns.md'), 'utf8');
    const index = JSON.parse(fs.readFileSync(path.join(references, 'patterns/index.json'), 'utf8'));
    const owners = new Map();
    const rows = routerRows(router);
    assert(rows.length === FAMILIES.length, `expected ${FAMILIES.length} router membership rows, got ${rows.length}`);
    for (const row of rows) {
      const file = row.file;
      for (const id of expandMembership(row.membership)) {
        assert(!owners.has(id), `${id} overlaps between ${owners.get(id)} and ${file}`);
        owners.set(id, file);
      }
    }
    for (const record of index.patterns) {
      assert(owners.has(record.id), `${record.id} missing from router membership`);
      assert(owners.get(record.id) === record.file, `${record.id} router points to ${owners.get(record.id)}, index points to ${record.file}`);
    }
    assert(owners.size === index.patterns.length, `router has ${owners.size} IDs, index has ${index.patterns.length}`);
  },

  function skillOwnsMaxTwoContract() {
    const skill = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
    requireMatch(
      skill,
      /A generic diagnosis loads only `patterns\/prompt-design\.md`\./i,
      'SKILL must load only prompt-design for a generic diagnosis'
    );
    requireMatch(
      skill,
      /never load more than two pattern shards or scan all nine/i,
      'SKILL must enforce the two-shard maximum'
    );
    requireMatch(
      skill,
      /resolve the family\/file through \[references\/patterns\/index\.json\]/i,
      'SKILL must resolve routes through the index instead of scanning shards'
    );
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
  console.error(`\n${failed}/${checks.length} pattern routing tests failed`);
  process.exitCode = 1;
} else console.log(`OK: ${checks.length}/${checks.length} pattern routing tests passed`);
