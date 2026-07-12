#!/usr/bin/env node
// Positive and adversarial tests for the fail-closed pattern registry.

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  FAMILIES,
  loadPatternSection,
  resolveLegacyPattern,
  validatePatterns,
} = require('./validate-patterns');
const { validateMarkdownLinks } = require('./validate-registry');

const repoRoot = path.join(__dirname, '..');
const schemaSource = path.join(
  repoRoot,
  'plugins/prompt-master/skills/prompt-master/references/patterns/schema.json'
);
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'tests/patterns/mutations.json'), 'utf8'));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertThrows(callback, expression, message) {
  let thrown;
  try { callback(); }
  catch (error) { thrown = error; }
  assert(thrown, `${message}: expected an exception`);
  assert(expression.test(thrown.message), `${message}: unexpected error '${thrown.message}'`);
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function editJson(file, update) {
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  update(value);
  writeJson(file, value);
}

function patternRecord(number) {
  const id = `PM-${String(number).padStart(3, '0')}`;
  const family = FAMILIES[(number - 1) % FAMILIES.length];
  const record = {
    id,
    legacy_id: number,
    title: `Pattern ${String(number).padStart(3, '0')}`,
    family,
    file: `${family}.md`,
    anchor: `${id.toLowerCase()}-pattern-${String(number).padStart(3, '0')}`,
    status: number === 36 ? 'merged' : 'active',
    tags: ['test'],
    canonical_owner: 'patterns',
    related: number === 1 ? ['PM-002'] : number === 2 ? ['PM-001'] : number === 36 ? ['PM-003', 'PM-020'] : [],
  };
  if (number === 36) record.redirect_to = 'PM-001';
  return record;
}

function renderSection(record) {
  const lines = [
    `<a id="${record.anchor}"></a>`,
    `## ${record.id} — ${record.title}`,
  ];
  if (record.status !== 'active') {
    lines.push(
      '',
      `**Status:** ${record.status}; redirect to ${record.redirect_to}.`,
      '',
      `**Related:** ${[record.redirect_to, ...record.related].join(', ')}`,
      ''
    );
    return lines.join('\n');
  }
  lines.push(
    '',
    '**Applies when:** the deterministic fixture activates this pattern.',
    '',
    '**Failure:** the fixture demonstrates a repeatable failure.',
    '',
    '**Repair:** apply the bounded deterministic repair.',
    '',
    '**Do not apply when:** the activation condition is absent.',
    '',
    '**Canonical owner:** patterns',
  );
  if (record.related.length) lines.push('', `**Related:** ${record.related.join(', ')}`);
  lines.push('');
  return lines.join('\n');
}

function buildFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-master-patterns-'));
  const skillDir = path.join(dir, 'skill');
  const references = path.join(skillDir, 'references');
  const patternsDir = path.join(references, 'patterns');
  fs.mkdirSync(patternsDir, { recursive: true });
  fs.copyFileSync(schemaSource, path.join(patternsDir, 'schema.json'));
  const records = Array.from({ length: 61 }, (_, index) => patternRecord(index + 1));
  writeJson(path.join(patternsDir, 'index.json'), {
    $schema: './schema.json',
    document_type: 'pattern_index',
    schema_version: '1.0.0',
    patterns: records,
  });
  for (const family of FAMILIES) {
    const sections = records.filter((record) => record.family === family).map(renderSection);
    fs.writeFileSync(path.join(patternsDir, `${family}.md`), `# ${family}\n\n${sections.join('\n')}\n`);
  }
  const links = FAMILIES.map((family) => `- [${family}](patterns/${family}.md)`).join('\n');
  fs.writeFileSync(
    path.join(references, 'patterns.md'),
    [
      '# Pattern router',
      '',
      '60 active patterns and 61 indexed patterns.',
      'Resolve legacy `pattern #N` as `PM-NNN` through `patterns/index.json`.',
      'A simple generic task loads only `prompt-design.md`.',
      'A composite diagnosis loads at most two shards.',
      '',
      links,
      '',
    ].join('\n')
  );
  return {
    dir,
    skillDir,
    references,
    patternsDir,
    schema: path.join(patternsDir, 'schema.json'),
    index: path.join(patternsDir, 'index.json'),
    router: path.join(references, 'patterns.md'),
  };
}

function shardFor(fixture, number) {
  const record = patternRecord(number);
  return path.join(fixture.patternsDir, record.file);
}

const mutations = {
  duplicateId(fixture) {
    editJson(fixture.index, (index) => { index.patterns[1].id = index.patterns[0].id; });
  },
  duplicateLegacyId(fixture) {
    editJson(fixture.index, (index) => { index.patterns[1].legacy_id = index.patterns[0].legacy_id; });
  },
  duplicateFileAnchor(fixture) {
    editJson(fixture.index, (index) => {
      index.patterns[1].family = index.patterns[0].family;
      index.patterns[1].file = index.patterns[0].file;
      index.patterns[1].anchor = index.patterns[0].anchor;
    });
  },
  missingBaselineId(fixture) {
    editJson(fixture.index, (index) => { index.patterns[0].id = 'PM-099'; });
  },
  unsortedIndex(fixture) {
    editJson(fixture.index, (index) => { [index.patterns[0], index.patterns[1]] = [index.patterns[1], index.patterns[0]]; });
  },
  unknownFamily(fixture) {
    editJson(fixture.index, (index) => { index.patterns[0].family = 'unknown'; });
  },
  unknownStatus(fixture) {
    editJson(fixture.index, (index) => { index.patterns[0].status = 'draft'; });
  },
  unknownOwner(fixture) {
    editJson(fixture.index, (index) => { index.patterns[0].canonical_owner = 'unknown'; });
  },
  additionalField(fixture) {
    editJson(fixture.index, (index) => { index.patterns[0].extra = true; });
  },
  nullRecord(fixture) {
    editJson(fixture.index, (index) => { index.patterns[0] = null; });
  },
  selfRelated(fixture) {
    editJson(fixture.index, (index) => { index.patterns[0].related = ['PM-001']; });
  },
  missingRelated(fixture) {
    editJson(fixture.index, (index) => { index.patterns[0].related = ['PM-999']; });
  },
  activeRedirect(fixture) {
    editJson(fixture.index, (index) => { index.patterns[0].redirect_to = 'PM-002'; });
  },
  tombstoneWithoutRedirect(fixture) {
    editJson(fixture.index, (index) => { delete index.patterns[35].redirect_to; });
  },
  tombstoneMarkdownStatusDrift(fixture) {
    const file = shardFor(fixture, 36);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('**Status:** merged;', '**Status:** deprecated;'));
  },
  tombstoneMarkdownRedirectDrift(fixture) {
    const file = shardFor(fixture, 36);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('redirect to PM-001', 'redirect to PM-002'));
  },
  deprecatedWithoutRedirect(fixture) {
    editJson(fixture.index, (index) => {
      index.patterns[35].status = 'deprecated';
      delete index.patterns[35].redirect_to;
    });
    const file = shardFor(fixture, 36);
    const text = fs.readFileSync(file, 'utf8')
      .replace('**Status:** merged; redirect to PM-001.', '**Status:** deprecated; retained for compatibility.')
      .replace('**Related:** PM-001, PM-003, PM-020', '**Related:** PM-003, PM-020');
    fs.writeFileSync(file, text);
  },
  brokenRedirect(fixture) {
    editJson(fixture.index, (index) => { index.patterns[35].redirect_to = 'PM-999'; });
  },
  redirectChain(fixture) {
    editJson(fixture.index, (index) => {
      index.patterns[1].status = 'deprecated';
      index.patterns[1].redirect_to = 'PM-001';
      index.patterns[35].redirect_to = 'PM-002';
    });
  },
  selfRedirect(fixture) {
    editJson(fixture.index, (index) => { index.patterns[35].redirect_to = 'PM-036'; });
  },
  missingShard(fixture) {
    fs.unlinkSync(path.join(fixture.patternsDir, `${FAMILIES[0]}.md`));
  },
  unexpectedShard(fixture) {
    fs.writeFileSync(path.join(fixture.patternsDir, 'extra.md'), '# extra\n');
  },
  missingSection(fixture) {
    const file = shardFor(fixture, 1);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(renderSection(patternRecord(1)), ''));
  },
  orphanSection(fixture) {
    fs.appendFileSync(shardFor(fixture, 1), '\n<a id="pm-099-orphan"></a>\n## PM-099 — Orphan\n');
  },
  duplicateSection(fixture) {
    fs.appendFileSync(shardFor(fixture, 1), `\n${renderSection(patternRecord(1))}\n`);
  },
  wrongFile(fixture) {
    editJson(fixture.index, (index) => { index.patterns[0].file = 'context-state.md'; });
  },
  traversalFile(fixture) {
    editJson(fixture.index, (index) => { index.patterns[0].file = '../prompt-design.md'; });
  },
  invalidAnchor(fixture) {
    editJson(fixture.index, (index) => { index.patterns[0].anchor = 'PM-001 bad anchor'; });
  },
  missingAnchor(fixture) {
    const file = shardFor(fixture, 1);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(`<a id="${patternRecord(1).anchor}"></a>\n`, ''));
  },
  duplicateAnchor(fixture) {
    fs.appendFileSync(shardFor(fixture, 1), `\n<a id="${patternRecord(1).anchor}"></a>\n`);
  },
  movedAnchor(fixture) {
    const file = shardFor(fixture, 1);
    const anchor = `<a id="${patternRecord(1).anchor}"></a>`;
    const text = fs.readFileSync(file, 'utf8').replace(`${anchor}\n`, '').replace('\n\n', `\n${anchor}\n\n`);
    fs.writeFileSync(file, text);
  },
  orphanAnchor(fixture) {
    fs.appendFileSync(shardFor(fixture, 1), '\n<a id="pm-999-orphan"></a>\n');
  },
  titleDrift(fixture) {
    const file = shardFor(fixture, 1);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('PM-001 — Pattern 001', 'PM-001 — Changed title'));
  },
  missingActiveField(fixture) {
    const file = shardFor(fixture, 1);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('**Repair:**', '**Remedy:**'));
  },
  canonicalOwnerDrift(fixture) {
    editJson(fixture.index, (index) => { index.patterns[0].canonical_owner = 'agentic'; });
  },
  relatedDrift(fixture) {
    const file = shardFor(fixture, 1);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace('**Related:** PM-002', '**Related:** PM-003'));
  },
  wrongActiveCount(fixture) {
    fs.writeFileSync(fixture.router, fs.readFileSync(fixture.router, 'utf8').replace('60 active patterns', '61 active patterns'));
  },
  routerLineBudget(fixture) {
    fs.appendFileSync(fixture.router, `${'extra\n'.repeat(101)}`);
  },
  shardByteBudget(fixture) {
    fs.appendFileSync(shardFor(fixture, 1), `\n${'x'.repeat(25 * 1024)}\n`);
  },
  weakenSchema(fixture) {
    editJson(fixture.schema, (schema) => { schema.$defs.status.enum.push('draft'); });
  },
  malformedIndex(fixture) {
    fs.writeFileSync(fixture.index, '{');
  },
  malformedSchema(fixture) {
    fs.writeFileSync(fixture.schema, '{');
  },
  reorderedRootKeys(fixture) {
    const index = JSON.parse(fs.readFileSync(fixture.index, 'utf8'));
    writeJson(fixture.index, {
      patterns: index.patterns,
      schema_version: index.schema_version,
      document_type: index.document_type,
      $schema: index.$schema,
    });
  },
};

let passed = 0;
let failed = 0;

const clean = buildFixture();
const cleanResult = validatePatterns({ skillDir: clean.skillDir });
if (!cleanResult.ok) {
  failed++;
  console.error(`FAIL valid-pattern-registry: ${cleanResult.errors.join('; ')}`);
} else {
  try {
    assert(cleanResult.counts.entries === 61, 'clean fixture entry count mismatch');
    assert(cleanResult.counts.active === 60, 'clean fixture active count mismatch');
    assert(cleanResult.counts.tombstones === 1, 'clean fixture tombstone count mismatch');
    const index = JSON.parse(fs.readFileSync(clean.index, 'utf8'));
    assert(resolveLegacyPattern(index, 52)?.id === 'PM-052', 'legacy #52 must resolve to PM-052');
    assert(loadPatternSection({ skillDir: clean.skillDir, legacyId: 52 }).record.id === 'PM-052', 'legacy load must reach PM-052');
    passed++;
  } catch (error) {
    failed++;
    console.error(`FAIL valid-pattern-registry: ${error.message}`);
  }
}

try {
  const fixture = buildFixture();
  const source = path.join(fixture.references, 'anchor-source.md');
  const target = path.join(fixture.references, 'anchor-target.md');
  fs.writeFileSync(source, '[explicit](anchor-target.md#explicit-anchor) [heading](anchor-target.md#heading-anchor)\n');
  fs.writeFileSync(target, '<a id="explicit-anchor"></a>\n## Heading anchor\n');
  const linkErrors = [];
  validateMarkdownLinks(fixture.skillDir, [source, target], linkErrors);
  assert(linkErrors.length === 0, `explicit/heading anchor regression: ${linkErrors.join('; ')}`);
  passed++;
} catch (error) {
  failed++;
  console.error(`FAIL explicitAndHeadingAnchorsResolve: ${error.message}`);
}

try {
  const fixture = buildFixture();
  editJson(fixture.index, (index) => { index.patterns[0].file = '../outside.md'; });
  assertThrows(
    () => loadPatternSection({ skillDir: fixture.skillDir, id: 'PM-001' }),
    /pattern registry validation failed[\s\S]*does not match/,
    'direct loader traversal rejection'
  );
  passed++;
} catch (error) {
  failed++;
  console.error(`FAIL directLoaderRejectsTraversal: ${error.message}`);
}

try {
  const fixture = buildFixture();
  fs.writeFileSync(fixture.index, '{');
  assertThrows(
    () => loadPatternSection({ skillDir: fixture.skillDir, id: 'PM-001' }),
    /pattern registry validation failed[\s\S]*invalid JSON/,
    'direct loader malformed-index rejection'
  );
  passed++;
} catch (error) {
  failed++;
  console.error(`FAIL directLoaderRejectsMalformedIndex: ${error.message}`);
}

for (const testCase of manifest.cases) {
  try {
    const fixture = buildFixture();
    assert(typeof mutations[testCase.mutation] === 'function', `unknown mutation ${testCase.mutation}`);
    mutations[testCase.mutation](fixture);
    const result = validatePatterns({ skillDir: fixture.skillDir });
    if (testCase.pass) assert(result.ok, `expected pass; got: ${result.errors.join('; ')}`);
    else {
      assert(!result.ok, 'mutation passed unexpectedly');
      assert(
        result.errors.some((error) => error.includes(testCase.error)),
        `missing '${testCase.error}': ${result.errors.join('; ')}`
      );
    }
    passed++;
  } catch (error) {
    failed++;
    console.error(`FAIL ${testCase.name}: ${error.message}`);
  }
}

if (failed) {
  console.error(`\n${failed}/${passed + failed} pattern registry tests failed`);
  process.exitCode = 1;
} else {
  console.log(`OK: ${passed}/${passed} pattern registry tests passed`);
}
