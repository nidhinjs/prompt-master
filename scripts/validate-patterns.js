#!/usr/bin/env node
// Dependency-free, fail-closed validation for the sharded pattern registry.
// Reads local files only; no subprocesses, network, or model execution.

'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const defaultSkillDir = path.join(repoRoot, 'plugins/prompt-master/skills/prompt-master');
const FAMILIES = [
  'prompt-design',
  'context-state',
  'research-evidence',
  'agentic-execution',
  'orchestration',
  'evaluation-review',
  'safety-trust',
  'routing-economics',
  'media-generation',
];
const STATUSES = ['active', 'deprecated', 'merged', 'superseded'];
const CANONICAL_OWNERS = ['patterns', 'skill', 'agentic', 'templates', 'profiles', 'facts'];
const BASELINE_LEGACY_COUNT = 61;
const ROUTER_MAX_LINES = 100;
const ROUTER_MAX_BYTES = 12 * 1024;
const SHARD_MAX_LINES = 180;
const SHARD_MAX_BYTES = 24 * 1024;

function normalize(value) {
  return value.replace(/\\/g, '/');
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function readJson(file, errors, label) {
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    errors.push(`${label}: missing file ${normalize(file)}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  } catch (error) {
    errors.push(`${label}: invalid JSON: ${error.message}`);
    return null;
  }
}

function jsonPointer(root, ref) {
  if (typeof ref !== 'string' || !ref.startsWith('#/')) return undefined;
  return ref.slice(2).split('/').reduce((value, token) => {
    if (value === undefined) return undefined;
    return value[token.replace(/~1/g, '/').replace(/~0/g, '~')];
  }, root);
}

function typeMatches(value, type) {
  if (type === 'null') return value === null;
  if (type === 'array') return Array.isArray(value);
  if (type === 'object') return isPlainObject(value);
  if (type === 'string') return typeof value === 'string';
  if (type === 'integer') return Number.isInteger(value);
  if (type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (type === 'boolean') return typeof value === 'boolean';
  return false;
}

function validateAgainstSchema(value, schema, rootSchema, location = '$') {
  const errors = [];
  if (!isPlainObject(schema)) return [`${location}: schema node must be an object`];
  if (schema.$ref !== undefined) {
    const target = jsonPointer(rootSchema, schema.$ref);
    return target
      ? validateAgainstSchema(value, target, rootSchema, location)
      : [`${location}: unresolved schema reference ${schema.$ref}`];
  }
  if (schema.const !== undefined && !deepEqual(value, schema.const)) {
    errors.push(`${location}: must equal ${JSON.stringify(schema.const)}`);
  }
  if (Array.isArray(schema.enum) && !schema.enum.some((item) => deepEqual(item, value))) {
    errors.push(`${location}: value ${JSON.stringify(value)} is outside the controlled enum`);
  }
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => typeMatches(value, type))) {
      errors.push(`${location}: expected type ${types.join('|')}`);
      return errors;
    }
  }
  if (typeof value === 'number' && schema.minimum !== undefined && value < schema.minimum) {
    errors.push(`${location}: must be at least ${schema.minimum}`);
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${location}: string is shorter than ${schema.minLength}`);
    }
    if (schema.pattern !== undefined) {
      let expression;
      try { expression = new RegExp(schema.pattern, 'u'); }
      catch (error) { errors.push(`${location}: invalid schema regex ${schema.pattern}: ${error.message}`); }
      if (expression && !expression.test(value)) errors.push(`${location}: does not match ${schema.pattern}`);
    }
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${location}: requires at least ${schema.minItems} item(s)`);
    }
    if (schema.uniqueItems) {
      const encoded = value.map((item) => JSON.stringify(item));
      if (new Set(encoded).size !== encoded.length) errors.push(`${location}: array items must be unique`);
    }
    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validateAgainstSchema(item, schema.items, rootSchema, `${location}[${index}]`));
      });
    }
  }
  if (isPlainObject(value)) {
    for (const key of schema.required || []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(`${location}: missing required property ${key}`);
      }
    }
    for (const [key, child] of Object.entries(value)) {
      if (schema.properties && Object.prototype.hasOwnProperty.call(schema.properties, key)) {
        errors.push(...validateAgainstSchema(child, schema.properties[key], rootSchema, `${location}.${key}`));
      } else if (schema.additionalProperties === false) {
        errors.push(`${location}: unexpected property ${key}`);
      }
    }
  }
  return errors;
}

function validateSchemaFreeze(schema) {
  const errors = [];
  if (schema?.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
    errors.push('schema.$schema must be JSON Schema draft 2020-12');
  }
  if (!deepEqual(schema?.required, ['$schema', 'document_type', 'schema_version', 'patterns'])) {
    errors.push('schema root required fields differ from the frozen pattern-index architecture');
  }
  if (schema?.additionalProperties !== false) errors.push('schema root must reject additional properties');
  if (schema?.properties?.patterns?.minItems !== BASELINE_LEGACY_COUNT) {
    errors.push(`schema patterns.minItems must preserve the ${BASELINE_LEGACY_COUNT}-ID baseline`);
  }
  for (const [definition, expected] of [
    ['family', FAMILIES],
    ['status', STATUSES],
    ['canonical_owner', CANONICAL_OWNERS],
  ]) {
    if (!deepEqual(schema?.$defs?.[definition]?.enum, expected)) {
      errors.push(`schema.$defs.${definition}.enum differs from the frozen architecture`);
    }
  }
  const pattern = schema?.$defs?.pattern;
  const required = [
    'id', 'legacy_id', 'title', 'family', 'file', 'anchor',
    'status', 'tags', 'canonical_owner', 'related',
  ];
  if (!deepEqual(pattern?.required, required)) {
    errors.push('schema pattern required fields differ from the frozen architecture');
  }
  if (pattern?.additionalProperties !== false) errors.push('schema pattern must reject additional properties');
  if (pattern?.properties?.redirect_to?.$ref !== '#/$defs/pattern_id') {
    errors.push('schema redirect_to must reference pattern_id');
  }
  return errors;
}

function lineCount(text) {
  if (text.length === 0) return 0;
  return text.split(/\r?\n/).length - (text.endsWith('\n') ? 1 : 0);
}

function githubAnchor(heading) {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{Nd} _-]/gu, '')
    .trim()
    .replace(/ /g, '-');
}

function parseShard(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/);
  const anchors = new Map();
  const explicitAnchors = new Map();
  const explicitAnchorEntries = [];
  const sections = [];
  function addAnchor(anchor) {
    anchors.set(anchor, (anchors.get(anchor) || 0) + 1);
  }
  const headings = [];
  lines.forEach((line, index) => {
    for (const anchorMatch of line.matchAll(/<a\s+(?:id|name)=["']([^"']+)["']\s*><\/a>/gi)) {
      const anchor = anchorMatch[1].toLowerCase();
      addAnchor(anchor);
      explicitAnchors.set(anchor, (explicitAnchors.get(anchor) || 0) + 1);
      explicitAnchorEntries.push({ anchor, line: index });
    }
    const match = line.match(/^##\s+(PM-[0-9]{3})\s+(?:[—–-]\s*)?(.+?)\s*$/);
    if (!match) return;
    const headingText = line.replace(/^##\s+/, '').trim();
    addAnchor(githubAnchor(headingText));
    headings.push({ id: match[1], title: match[2].trim(), line: index });
  });
  headings.forEach((heading, index) => {
    const end = index + 1 < headings.length ? headings[index + 1].line : lines.length;
    sections.push({
      ...heading,
      text: lines.slice(heading.line, end).join('\n'),
    });
  });
  return {
    anchors,
    bytes: Buffer.byteLength(text, 'utf8'),
    explicitAnchorEntries,
    explicitAnchors,
    headings,
    lines: lineCount(text),
    sections,
    text,
  };
}

function validateActiveSection(record, section, errors) {
  const requiredFields = ['Applies when', 'Failure', 'Repair', 'Do not apply when'];
  for (const field of requiredFields) {
    if (!new RegExp(`^\\*\\*${field.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}:\\*\\*\\s+\\S`, 'm').test(section.text)) {
      errors.push(`${record.id}: active section missing '${field}'`);
    }
  }
  const canonicalLine = section.text.match(/^\*\*Canonical (?:rule|owner):\*\*\s+(.+)$/m)?.[1] || '';
  if (!canonicalLine) {
    errors.push(`${record.id}: active section requires Canonical rule or Canonical owner`);
  } else {
    const ownerMarkers = {
      patterns: /\bpatterns\b/i,
      skill: /SKILL\.md/i,
      agentic: /agentic/i,
      templates: /templates/i,
      profiles: /profiles?/i,
      facts: /facts/i,
    };
    const marker = ownerMarkers[record.canonical_owner];
    if (marker && !marker.test(canonicalLine)) {
      errors.push(`${record.id}: Markdown canonical owner does not match index canonical_owner ${record.canonical_owner}`);
    }
  }
  const relatedLine = section.text.match(/^\*\*Related:\*\*\s*(.*)$/m)?.[1] || '';
  if (record.related.length > 0 && !relatedLine) errors.push(`${record.id}: indexed related IDs require a Related field`);
  if (relatedLine) {
    const markdownRelated = [...relatedLine.matchAll(/\bPM-[0-9]{3}\b/g)].map((match) => match[0]).sort();
    const indexedRelated = [...record.related].sort();
    if (!deepEqual(markdownRelated, indexedRelated)) {
      errors.push(`${record.id}: Markdown Related IDs differ from index related IDs`);
    }
  }
}

function validateTombstoneSection(record, section, errors) {
  const statusLine = section.text.match(/^\*\*Status:\*\*\s+(.+)$/m)?.[1] || '';
  if (!statusLine) {
    errors.push(`${record.id}: tombstone section requires a Status field`);
  } else {
    if (!new RegExp(`\\b${record.status}\\b`, 'i').test(statusLine)) {
      errors.push(`${record.id}: Markdown tombstone status does not match index status ${record.status}`);
    }
    if (record.redirect_to && !new RegExp(`\\b${record.redirect_to}\\b`).test(statusLine)) {
      errors.push(`${record.id}: Markdown tombstone Status must name redirect target ${record.redirect_to}`);
    }
  }
  const relatedLine = section.text.match(/^\*\*Related:\*\*\s*(.*)$/m)?.[1] || '';
  if (relatedLine) {
    const markdownRelated = [...relatedLine.matchAll(/\bPM-[0-9]{3}\b/g)].map((match) => match[0]).sort();
    const expectedRelated = [...new Set([...(record.redirect_to ? [record.redirect_to] : []), ...record.related])].sort();
    if (!deepEqual(markdownRelated, expectedRelated)) {
      errors.push(`${record.id}: tombstone Markdown Related IDs must equal redirect target plus index related IDs`);
    }
  }
}

function resolveLegacyPattern(index, legacyId) {
  if (!Number.isInteger(legacyId) || legacyId < 1 || !Array.isArray(index?.patterns)) return null;
  return index.patterns.find((record) => record.legacy_id === legacyId) || null;
}

function loadPatternSection(options) {
  const skillDir = path.resolve(options.skillDir || defaultSkillDir);
  const validation = validatePatterns({ skillDir });
  if (!validation.ok) {
    throw new Error(`pattern registry validation failed: ${validation.errors.join('; ')}`);
  }
  const index = validation.index;
  const record = options.id
    ? index.patterns.find((item) => item.id === options.id)
    : resolveLegacyPattern(index, options.legacyId);
  if (!record) throw new Error('pattern not found');
  const patternsRoot = path.resolve(skillDir, 'references/patterns');
  const file = path.resolve(patternsRoot, record.file);
  if (file === patternsRoot || !file.startsWith(`${patternsRoot}${path.sep}`)) {
    throw new Error(`${record.id}: resolved pattern path escapes references/patterns`);
  }
  const parsed = parseShard(file);
  const section = parsed.sections.find((item) => item.id === record.id);
  if (!section) throw new Error(`${record.id}: Markdown section not found`);
  return { record, section: section.text };
}

function validateRouter(routerFile, counts, errors) {
  if (!fs.existsSync(routerFile) || !fs.statSync(routerFile).isFile()) {
    errors.push(`pattern router: missing file ${normalize(routerFile)}`);
    return;
  }
  const text = fs.readFileSync(routerFile, 'utf8').replace(/^\uFEFF/, '');
  const lines = lineCount(text);
  const bytes = Buffer.byteLength(text, 'utf8');
  if (lines > ROUTER_MAX_LINES) errors.push(`pattern router: ${lines} lines exceeds ${ROUTER_MAX_LINES}`);
  if (bytes > ROUTER_MAX_BYTES) errors.push(`pattern router: ${bytes} bytes exceeds ${ROUTER_MAX_BYTES}`);

  const activeDeclarations = [...text.matchAll(/\b([0-9]+)\s+active\s+patterns?\b/gi)];
  if (activeDeclarations.length === 0) errors.push('pattern router: missing declared active pattern count');
  for (const match of activeDeclarations) {
    if (Number(match[1]) !== counts.active) {
      errors.push(`pattern router: declares ${match[1]} active patterns, index has ${counts.active}`);
    }
  }
  for (const match of text.matchAll(/\b([0-9]+)\s+(?:(?:indexed|registered|total)\s+patterns?|stable\s+(?:pattern\s+)?IDs|pattern\s+IDs)\b/gi)) {
    if (Number(match[1]) !== counts.entries) {
      errors.push(`pattern router: declares ${match[1]} indexed patterns, index has ${counts.entries}`);
    }
  }
}

function validatePatterns(options = {}) {
  const skillDir = path.resolve(options.skillDir || defaultSkillDir);
  const referencesDir = path.join(skillDir, 'references');
  const patternsDir = path.resolve(options.patternsDir || path.join(referencesDir, 'patterns'));
  const schemaFile = path.resolve(options.schemaFile || path.join(patternsDir, 'schema.json'));
  const indexFile = path.resolve(options.indexFile || path.join(patternsDir, 'index.json'));
  const routerFile = path.resolve(options.routerFile || path.join(referencesDir, 'patterns.md'));
  const baselineCount = options.baselineCount ?? BASELINE_LEGACY_COUNT;
  const errors = [];

  const schema = readJson(schemaFile, errors, 'pattern schema');
  const index = readJson(indexFile, errors, 'pattern index');
  if (schema) errors.push(...validateSchemaFreeze(schema));
  if (schema && index) errors.push(...validateAgainstSchema(index, schema, schema));
  if (!schema || !index || !Array.isArray(index.patterns)) {
    return { ok: false, errors, counts: { entries: 0, active: 0, tombstones: 0, shards: 0 } };
  }

  const expectedRootKeys = ['$schema', 'document_type', 'patterns', 'schema_version'].sort();
  if (!deepEqual(Object.keys(index).sort(), expectedRootKeys)) {
    errors.push('pattern index: fields must be exactly $schema, document_type, schema_version, patterns');
  }
  const counts = {
    entries: index.patterns.length,
    active: index.patterns.filter((record) => isPlainObject(record) && record.status === 'active').length,
    tombstones: index.patterns.filter((record) => isPlainObject(record) && record.status !== 'active').length,
    shards: FAMILIES.length,
  };

  const ids = new Map();
  const legacyIds = new Map();
  const fileAnchors = new Map();
  for (const [position, record] of index.patterns.entries()) {
    if (!isPlainObject(record)) continue;
    if (ids.has(record.id)) errors.push(`pattern index: duplicate id ${record.id}`);
    else ids.set(record.id, record);
    if (record.legacy_id !== null) {
      if (legacyIds.has(record.legacy_id)) errors.push(`pattern index: duplicate legacy_id ${record.legacy_id}`);
      else legacyIds.set(record.legacy_id, record);
    }
    const numericId = /^PM-([0-9]{3})$/.exec(record.id || '')?.[1];
    if (numericId && position > 0) {
      const previous = index.patterns[position - 1]?.id;
      if (typeof previous === 'string' && previous.localeCompare(record.id) >= 0) {
        errors.push('pattern index: patterns must be sorted by id');
      }
    }
    if (record.file !== `${record.family}.md`) {
      errors.push(`${record.id}: file must match family (${record.family}.md)`);
    }
    const fileAnchor = `${record.file}#${record.anchor}`;
    if (fileAnchors.has(fileAnchor)) {
      errors.push(`${record.id}: duplicate file/anchor also used by ${fileAnchors.get(fileAnchor)}: ${fileAnchor}`);
    } else fileAnchors.set(fileAnchor, record.id);
    if (Array.isArray(record.related)) {
      if (record.related.includes(record.id)) errors.push(`${record.id}: related must not self-reference`);
    }
    if (record.status === 'active' && Object.prototype.hasOwnProperty.call(record, 'redirect_to')) {
      errors.push(`${record.id}: active record must not define redirect_to`);
    }
    if (['merged', 'superseded'].includes(record.status) && !record.redirect_to) {
      errors.push(`${record.id}: tombstone status ${record.status} requires redirect_to`);
    }
    if (record.redirect_to === record.id) errors.push(`${record.id}: redirect_to must not self-reference`);
  }

  for (let legacyId = 1; legacyId <= baselineCount; legacyId++) {
    const expectedId = `PM-${String(legacyId).padStart(3, '0')}`;
    const byId = ids.get(expectedId);
    const byLegacy = legacyIds.get(legacyId);
    if (!byId) errors.push(`pattern index: missing baseline id ${expectedId}`);
    else if (byId.legacy_id !== legacyId) errors.push(`${expectedId}: legacy_id must remain ${legacyId}`);
    if (byLegacy && byLegacy.id !== expectedId) {
      errors.push(`legacy_id ${legacyId}: resolves to ${byLegacy.id}, expected ${expectedId}`);
    }
  }

  for (const record of index.patterns) {
    if (!isPlainObject(record)) continue;
    for (const related of record.related || []) {
      if (!ids.has(related)) errors.push(`${record.id}: related target does not exist: ${related}`);
    }
    if (record.redirect_to) {
      const target = ids.get(record.redirect_to);
      if (!target) errors.push(`${record.id}: redirect target does not exist: ${record.redirect_to}`);
      else if (target.status !== 'active') errors.push(`${record.id}: redirect target must be active: ${record.redirect_to}`);
    }
  }

  if (fs.existsSync(patternsDir) && fs.statSync(patternsDir).isDirectory()) {
    const allowed = new Set(['schema.json', 'index.json', ...FAMILIES.map((family) => `${family}.md`)]);
    for (const entry of fs.readdirSync(patternsDir)) {
      if (!allowed.has(entry)) errors.push(`pattern registry: unexpected file ${entry}`);
    }
  } else errors.push(`pattern registry: missing directory ${normalize(patternsDir)}`);

  const parsedShards = new Map();
  const sectionOwners = new Map();
  for (const family of FAMILIES) {
    const fileName = `${family}.md`;
    const file = path.join(patternsDir, fileName);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      errors.push(`pattern shard: missing file ${fileName}`);
      continue;
    }
    const parsed = parseShard(file);
    parsedShards.set(fileName, parsed);
    if (parsed.lines > SHARD_MAX_LINES) errors.push(`${fileName}: ${parsed.lines} lines exceeds ${SHARD_MAX_LINES}`);
    if (parsed.bytes > SHARD_MAX_BYTES) errors.push(`${fileName}: ${parsed.bytes} bytes exceeds ${SHARD_MAX_BYTES}`);
    for (const section of parsed.sections) {
      if (sectionOwners.has(section.id)) {
        errors.push(`${section.id}: duplicate Markdown section in ${sectionOwners.get(section.id)} and ${fileName}`);
      } else sectionOwners.set(section.id, fileName);
    }
    for (const explicit of parsed.explicitAnchorEntries) {
      const heading = parsed.headings.find((item) => item.line === explicit.line + 1);
      if (!heading) {
        errors.push(`${fileName}: explicit pattern anchor ${explicit.anchor} must immediately precede its heading`);
        continue;
      }
      const anchorId = /^pm-([0-9]{3})-/.exec(explicit.anchor)?.[1];
      if (anchorId && heading.id !== `PM-${anchorId}`) {
        errors.push(`${fileName}: explicit pattern anchor ${explicit.anchor} precedes mismatched heading ${heading.id}`);
      }
      const record = ids.get(heading.id);
      if (record && explicit.anchor !== record.anchor) {
        errors.push(`${heading.id}: explicit anchor ${explicit.anchor} differs from indexed anchor ${record.anchor}`);
      }
    }
  }

  for (const record of index.patterns) {
    if (!isPlainObject(record)) continue;
    const parsed = parsedShards.get(record.file);
    if (!parsed) continue;
    const matching = parsed.sections.filter((section) => section.id === record.id);
    if (matching.length !== 1) {
      errors.push(`${record.id}: expected exactly one Markdown section in ${record.file}, found ${matching.length}`);
      continue;
    }
    const section = matching[0];
    if (section.title !== record.title) errors.push(`${record.id}: Markdown title differs from index title`);
    if ((parsed.anchors.get(record.anchor) || 0) !== 1) {
      errors.push(`${record.id}: anchor '${record.anchor}' must exist exactly once in ${record.file}`);
    }
    if (record.status === 'active') validateActiveSection(record, section, errors);
    else validateTombstoneSection(record, section, errors);
  }

  for (const [id, file] of sectionOwners) {
    const record = ids.get(id);
    if (!record) errors.push(`${file}: orphan Markdown section ${id}`);
    else if (record.file !== file) errors.push(`${id}: Markdown section is in ${file}, index points to ${record.file}`);
  }
  const indexedAnchors = new Set(
    index.patterns.filter(isPlainObject).map((record) => record.anchor)
  );
  for (const [fileName, parsed] of parsedShards) {
    for (const anchor of parsed.explicitAnchors.keys()) {
      if (/^pm-[0-9]{3}-/.test(anchor) && !indexedAnchors.has(anchor)) {
        errors.push(`${fileName}: orphan explicit pattern anchor ${anchor}`);
      }
    }
  }

  if (options.requireRouter !== false) validateRouter(routerFile, counts, errors);
  return { ok: errors.length === 0, errors, counts, index, files: [...parsedShards.keys()].sort() };
}

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index++) {
    if (argv[index] === '--json') options.json = true;
    else if (argv[index] === '--skill-dir' && argv[index + 1]) options.skillDir = argv[++index];
    else throw new Error(`Unknown or incomplete argument: ${argv[index]}`);
  }
  return options;
}

function main(argv = process.argv.slice(2)) {
  let options;
  try { options = parseArgs(argv); }
  catch (error) { console.error(error.message); return 2; }
  const result = validatePatterns(options);
  if (options.json) console.log(JSON.stringify(result, null, 2));
  else if (result.ok) {
    console.log(`OK pattern registry: entries=${result.counts.entries} active=${result.counts.active} tombstones=${result.counts.tombstones} shards=${result.counts.shards}`);
  } else {
    for (const error of result.errors) console.error(`ERROR: ${error}`);
    console.error(`FAILED pattern registry: ${result.errors.length} error(s)`);
  }
  return result.ok ? 0 : 1;
}

if (require.main === module) process.exitCode = main();

module.exports = {
  BASELINE_LEGACY_COUNT,
  CANONICAL_OWNERS,
  FAMILIES,
  ROUTER_MAX_BYTES,
  ROUTER_MAX_LINES,
  SHARD_MAX_BYTES,
  SHARD_MAX_LINES,
  STATUSES,
  githubAnchor,
  loadPatternSection,
  main,
  parseArgs,
  parseShard,
  resolveLegacyPattern,
  validateAgainstSchema,
  validatePatterns,
  validateSchemaFreeze,
  validateTombstoneSection,
};
