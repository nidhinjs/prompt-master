#!/usr/bin/env node
// Dependency-free, fail-closed validator for the canonical facts registry and
// profile routing graph. Reads local files only; no subprocesses or network.

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const repoRoot = path.join(__dirname, '..');
const defaultSkillDir = path.join(repoRoot, 'plugins/prompt-master/skills/prompt-master');

const FROZEN_PROVIDER_FAMILIES = [
  'anthropic', 'openai', 'google', 'xai', 'deepseek', 'minimax', 'alibaba',
  'moonshot-ai', 'zai-bigmodel', 'perplexity', 'gamma', 'meta', 'mistral-ai',
  'ollama', 'midjourney', 'stability-ai', 'black-forest-labs', 'bytedance',
  'runway', 'kling-ai', 'lightricks', 'luma-ai', 'elevenlabs', 'snowflake',
  'github', 'cursor', 'windsurf', 'cline', 'vercel', 'bolt', 'lovable', 'figma',
  'devin', 'manus', 'zapier', 'make', 'n8n', 'meshy', 'tripo', 'rodin', 'comfyui',
];
const FROZEN_CHANNELS = ['production', 'preview', 'beta', 'legacy', 'deprecated', 'retired'];
const FROZEN_AVAILABILITY = [
  'public', 'limited', 'account_gated', 'region_gated', 'unavailable', 'sunset_scheduled',
];
const REQUIRED_PROFILE_BUNDLES = [
  'builders-workflows.md', 'coding-agents.md', 'decompiler-fallback.md',
  'hosted-text.md', 'local-text.md', 'media.md', 'research-browser.md',
];
const EVERGREEN_SENTINEL = 'none (evergreen-only)';
const DAY_MS = 24 * 60 * 60 * 1000;
const MIGRATION_CLASSIFICATIONS = [
  'policy_or_structure', 'profile_evergreen', 'record_metadata',
  'registry_record', 'registry_route', 'registry_record_and_route',
  'replaced_stale', 'removed_unverified', 'removed_stale_unverified',
];
const MIGRATION_BASELINES = {
  'plugins/prompt-master/skills/prompt-master/references/models.md': {
    sha256: '80b4d16ff030cb4be7d1db7111a0b97856374cf0ab492975d278735227670b9b',
    lineCount: 177,
    coverage: 'every legacy line exactly once',
    lineSetSha256: '48a93cae1233c3baa715bda7e786c2fe29ab5e15fbd84abc5ba99f58cc955be0',
  },
  'plugins/prompt-master/skills/prompt-master/references/tool-profiles.md': {
    sha256: '6a7efd14e4d44334ebfdd7109981a507e210ed9e9ff31559840bd08d52eb2222',
    lineCount: 597,
    coverage: 'all legacy lines containing volatile claims',
    lineSetSha256: 'e8ae19fc2ac9dcdcf354d197240feac3bb3d997e60f4365c5e2363bc2883949c',
  },
};

function normalizeSlashes(value) {
  return value.replace(/\\/g, '/');
}

function deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseIsoDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(time)) return null;
  return new Date(time).toISOString().slice(0, 10) === value ? time : null;
}

function jsonPointer(root, ref) {
  if (!ref.startsWith('#/')) return undefined;
  return ref.slice(2).split('/').reduce((value, token) => {
    if (value === undefined) return undefined;
    const key = token.replace(/~1/g, '/').replace(/~0/g, '~');
    return value[key];
  }, root);
}

function typeMatches(value, type) {
  switch (type) {
    case 'null': return value === null;
    case 'array': return Array.isArray(value);
    case 'object': return isPlainObject(value);
    case 'string': return typeof value === 'string';
    case 'boolean': return typeof value === 'boolean';
    case 'number': return typeof value === 'number' && Number.isFinite(value);
    case 'integer': return Number.isInteger(value);
    default: return false;
  }
}

function validateAgainstSchema(value, schema, rootSchema, location = '$', seen = new Set()) {
  const errors = [];
  if (!isPlainObject(schema)) return [`${location}: schema node is not an object`];
  if (schema.$ref) {
    const target = jsonPointer(rootSchema, schema.$ref);
    if (!target) return [`${location}: unresolved schema reference ${schema.$ref}`];
    const key = `${schema.$ref}:${location}`;
    if (seen.has(key)) return [`${location}: recursive schema reference ${schema.$ref}`];
    const nextSeen = new Set(seen);
    nextSeen.add(key);
    return validateAgainstSchema(value, target, rootSchema, location, nextSeen);
  }
  for (const keyword of ['allOf', 'anyOf', 'oneOf']) {
    if (!schema[keyword]) continue;
    const branches = schema[keyword].map((branch) => validateAgainstSchema(value, branch, rootSchema, location, seen));
    const matches = branches.filter((branch) => branch.length === 0).length;
    if (keyword === 'allOf' && matches !== branches.length) {
      errors.push(...branches.flat());
    } else if (keyword === 'anyOf' && matches === 0) {
      errors.push(`${location}: must match at least one schema branch`);
      errors.push(...branches.flat());
    } else if (keyword === 'oneOf' && matches !== 1) {
      errors.push(`${location}: must match exactly one schema branch (matched ${matches})`);
      if (matches === 0) errors.push(...branches.flat());
    }
  }
  if (schema.const !== undefined && !deepEqual(value, schema.const)) {
    errors.push(`${location}: must equal ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum && !schema.enum.some((item) => deepEqual(item, value))) {
    errors.push(`${location}: value ${JSON.stringify(value)} is outside the controlled enum`);
  }
  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => typeMatches(value, type))) {
      errors.push(`${location}: expected type ${types.join('|')}`);
      return errors;
    }
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${location}: string is shorter than ${schema.minLength}`);
    }
    if (schema.pattern !== undefined) {
      let pattern;
      try { pattern = new RegExp(schema.pattern, 'u'); }
      catch (error) { errors.push(`${location}: invalid schema regex ${schema.pattern}: ${error.message}`); }
      if (pattern && !pattern.test(value)) errors.push(`${location}: does not match ${schema.pattern}`);
    }
    if (schema.format === 'date' && parseIsoDate(value) === null) {
      errors.push(`${location}: must be a real ISO date (YYYY-MM-DD)`);
    }
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${location}: requires at least ${schema.minItems} item(s)`);
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push(`${location}: allows at most ${schema.maxItems} item(s)`);
    }
    if (schema.uniqueItems) {
      const encoded = value.map((item) => JSON.stringify(item));
      if (new Set(encoded).size !== encoded.length) errors.push(`${location}: array items must be unique`);
    }
    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validateAgainstSchema(item, schema.items, rootSchema, `${location}[${index}]`, seen));
      });
    }
  }
  if (isPlainObject(value)) {
    if (schema.minProperties !== undefined && Object.keys(value).length < schema.minProperties) {
      errors.push(`${location}: requires at least ${schema.minProperties} propert${schema.minProperties === 1 ? 'y' : 'ies'}`);
    }
    for (const key of schema.required || []) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) errors.push(`${location}: missing required property ${key}`);
    }
    for (const [key, child] of Object.entries(value)) {
      if (schema.properties && Object.prototype.hasOwnProperty.call(schema.properties, key)) {
        errors.push(...validateAgainstSchema(child, schema.properties[key], rootSchema, `${location}.${key}`, seen));
      } else if (schema.additionalProperties === false) {
        errors.push(`${location}: unexpected property ${key}`);
      } else if (isPlainObject(schema.additionalProperties)) {
        errors.push(...validateAgainstSchema(child, schema.additionalProperties, rootSchema, `${location}.${key}`, seen));
      }
    }
  }
  return errors;
}

function exactEnum(schema, definition, expected, errors) {
  const actual = schema?.$defs?.[definition]?.enum;
  if (!deepEqual(actual, expected)) errors.push(`schema.$defs.${definition}.enum differs from the frozen architecture`);
}

function validateSchemaFreeze(schema) {
  const errors = [];
  if (schema?.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
    errors.push('schema.$schema must be JSON Schema draft 2020-12');
  }
  if (!deepEqual(schema?.oneOf, [
    { $ref: '#/$defs/registry_index' }, { $ref: '#/$defs/provider_shard' },
  ])) errors.push('schema.oneOf must validate exactly registry_index or provider_shard');
  exactEnum(schema, 'provider_family', FROZEN_PROVIDER_FAMILIES, errors);
  exactEnum(schema, 'channel', FROZEN_CHANNELS, errors);
  exactEnum(schema, 'availability_status', FROZEN_AVAILABILITY, errors);
  const record = schema?.$defs?.record;
  const frozenRecordKeys = [
    'id', 'vendor', 'model_id', 'surface', 'channel', 'availability',
    'recommended_for', 'routing_default_for', 'prompting_constraints',
    'claims', 'last_verified', 'source',
  ];
  if (!deepEqual(record?.required, frozenRecordKeys)) errors.push('schema record required fields differ from the freeze');
  if (record?.additionalProperties !== false) errors.push('schema record must reject additional properties');
  if (record?.properties?.routing_default_for?.maxItems !== 0) {
    errors.push('schema record.routing_default_for must remain empty; defaults are index-only');
  }
  for (const definition of ['recommendation_tag', 'prompting_constraint_tag', 'claim_key', 'surface']) {
    const values = schema?.$defs?.[definition]?.enum;
    if (!Array.isArray(values) || values.length === 0 || new Set(values).size !== values.length) {
      errors.push(`schema.$defs.${definition}.enum must be a non-empty unique controlled enum`);
    }
  }
  return errors;
}

function readJson(file, errors, label) {
  if (!fs.existsSync(file)) {
    errors.push(`${label}: missing file ${normalizeSlashes(file)}`);
    return null;
  }
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); }
  catch (error) { errors.push(`${label}: invalid JSON: ${error.message}`); return null; }
}

function markdownAnchor(heading) {
  return heading.toLowerCase().replace(/[^\p{L}\p{N} _-]/gu, '').trim().replace(/\s/g, '-');
}

function validateMarkdownLinks(skillDir, files, errors) {
  const root = path.resolve(skillDir);
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const raw = match[1].trim();
      if (!raw || /^(?:https?:|mailto:)/i.test(raw)) continue;
      const [filePart, fragment] = raw.split('#', 2);
      const target = filePart ? path.resolve(path.dirname(file), decodeURIComponent(filePart)) : file;
      if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
        errors.push(`${normalizeSlashes(path.relative(root, file))}: link escapes the skill root: ${raw}`);
        continue;
      }
      if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        errors.push(`${normalizeSlashes(path.relative(root, file))}: dangling link ${raw}`);
        continue;
      }
      if (fragment && /\.md$/i.test(target)) {
        const targetText = fs.readFileSync(target, 'utf8');
        const headingAnchors = [...targetText.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)]
          .map((item) => markdownAnchor(item[1]));
        const explicitAnchors = [...targetText.matchAll(/<a\s+(?:id|name)=["']([^"']+)["']\s*><\/a>/gi)]
          .map((item) => item[1].toLowerCase());
        const anchors = new Set([...headingAnchors, ...explicitAnchors]);
        if (!anchors.has(decodeURIComponent(fragment).toLowerCase())) {
          errors.push(`${normalizeSlashes(path.relative(root, file))}: dangling anchor ${raw}`);
        }
      }
    }
  }
}

function parseProfileIndex(profileIndexFile, profilesDir, knownAliases, errors) {
  const text = fs.readFileSync(profileIndexFile, 'utf8');
  const rows = text.split('\n').filter((line) => /^\|\s*\*\*/.test(line));
  if (!rows.length) errors.push('tool-profiles.md: routing table has no rows');
  const usedProfiles = new Set();
  const usedAliases = new Set();
  const routeNames = new Set();
  for (const [index, row] of rows.entries()) {
    const cells = row.split('|').slice(1, -1).map((cell) => cell.trim());
    const location = `tool-profiles.md row ${index + 1}`;
    if (cells.length !== 5) { errors.push(`${location}: expected exactly 5 columns`); continue; }
    const routeName = cells[0].replace(/^\*\*|\*\*$/g, '').trim();
    if (!routeName || routeNames.has(routeName.toLowerCase())) errors.push(`${location}: duplicate or empty route name ${routeName}`);
    routeNames.add(routeName.toLowerCase());
    const primaryLinks = [...cells[2].matchAll(/\[[^\]]+\]\((profiles\/[^)]+\.md)\)/g)].map((m) => m[1]);
    if (primaryLinks.length !== 1) errors.push(`${location}: primary profile must contain exactly one bundle link`);
    for (const link of primaryLinks) usedProfiles.add(path.basename(link));
    const addOnLinks = [...cells[4].matchAll(/\[[^\]]+\]\((profiles\/[^)]+\.md)\)/g)].map((m) => m[1]);
    if (addOnLinks.length > 1) errors.push(`${location}: explicit composite may name at most one add-on bundle`);
    for (const link of addOnLinks) usedProfiles.add(path.basename(link));
    const factPlain = cells[3].replace(/[*`]/g, '').trim();
    if (factPlain === EVERGREEN_SENTINEL) continue;
    const factLinks = [...cells[3].matchAll(/\[route:\s*`([^`]+)`\]\(facts\/index\.json\)/g)].map((m) => m[1]);
    if (factLinks.length !== 1 || !/^\[route:\s*`[^`]+`\]\(facts\/index\.json\)$/.test(cells[3])) {
      errors.push(`${location}: Fact lookup must be one exact registry alias or '${EVERGREEN_SENTINEL}'`);
      continue;
    }
    const alias = factLinks[0];
    if (!knownAliases.has(alias)) errors.push(`${location}: dangling registry alias ${alias}`);
    usedAliases.add(alias);
  }
  const actualProfiles = fs.existsSync(profilesDir)
    ? fs.readdirSync(profilesDir).filter((name) => name.endsWith('.md')).sort()
    : [];
  if (!deepEqual(actualProfiles, REQUIRED_PROFILE_BUNDLES)) {
    errors.push(`profiles inventory must be exactly: ${REQUIRED_PROFILE_BUNDLES.join(', ')}`);
  }
  for (const profile of actualProfiles) {
    if (!usedProfiles.has(profile)) errors.push(`profiles/${profile}: unreachable profile bundle`);
  }
  // Synonymous index aliases may intentionally share one canonical row-level
  // Fact lookup. Record reachability is enforced against every index route;
  // selected row aliases must exist, but each synonym need not be linked again.
  return { usedAliases, usedProfiles };
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function validateMigrationMapDocument(document, recordIds, routeAliases) {
  const errors = [];
  if (!isPlainObject(document)) return ['migration map: root must be an object'];
  const rootKeys = Object.keys(document).sort();
  if (!deepEqual(rootKeys, ['classification_values', 'description', 'schema_version', 'sources'])) {
    errors.push('migration map: unexpected or missing root fields');
  }
  if (document.schema_version !== '1.0.0') errors.push('migration map: schema_version must be 1.0.0');
  if (!deepEqual(document.classification_values, MIGRATION_CLASSIFICATIONS)) {
    errors.push('migration map: classification_values differ from the frozen allowlist');
  }
  if (!Array.isArray(document.sources) || document.sources.length !== 2) {
    errors.push('migration map: sources must contain exactly the two frozen baseline files');
    return errors;
  }
  const seenSources = new Set();
  for (const [sourceIndex, source] of document.sources.entries()) {
    const location = `migration map sources[${sourceIndex}]`;
    if (!isPlainObject(source)) { errors.push(`${location}: source must be an object`); continue; }
    const sourceKeys = Object.keys(source).sort();
    if (!deepEqual(sourceKeys, ['classifications', 'coverage', 'line_count', 'source_file', 'source_sha256'])) {
      errors.push(`${location}: unexpected or missing source fields`);
    }
    const baseline = MIGRATION_BASELINES[source.source_file];
    if (!baseline) { errors.push(`${location}: unknown baseline source ${source.source_file}`); continue; }
    if (seenSources.has(source.source_file)) errors.push(`${location}: duplicate baseline source ${source.source_file}`);
    seenSources.add(source.source_file);
    if (source.source_sha256 !== baseline.sha256) errors.push(`${location}: baseline SHA-256 mismatch`);
    if (source.line_count !== baseline.lineCount) errors.push(`${location}: baseline line_count mismatch`);
    if (source.coverage !== baseline.coverage) errors.push(`${location}: coverage declaration mismatch`);
    if (!Array.isArray(source.classifications)) { errors.push(`${location}: classifications must be an array`); continue; }
    const seenLines = new Set();
    for (const [entryIndex, entry] of source.classifications.entries()) {
      const entryLocation = `${location}.classifications[${entryIndex}]`;
      if (!isPlainObject(entry)) { errors.push(`${entryLocation}: entry must be an object`); continue; }
      const entryKeys = Object.keys(entry).sort();
      const baseKeys = ['classification', 'line', 'record_ids', 'route_aliases'];
      const noteKeys = ['classification', 'line', 'note', 'record_ids', 'route_aliases'];
      if (!deepEqual(entryKeys, baseKeys) && !deepEqual(entryKeys, noteKeys)) {
        errors.push(`${entryLocation}: unexpected or missing classification fields`);
      }
      if (!Number.isInteger(entry.line) || entry.line < 1 || entry.line > baseline.lineCount) {
        errors.push(`${entryLocation}: line is outside the baseline`);
      } else if (seenLines.has(entry.line)) errors.push(`${entryLocation}: duplicate classified line ${entry.line}`);
      else seenLines.add(entry.line);
      if (!MIGRATION_CLASSIFICATIONS.includes(entry.classification)) errors.push(`${entryLocation}: unapproved or empty classification`);
      if (Object.prototype.hasOwnProperty.call(entry, 'note')) {
        if (!['replaced_stale', 'removed_unverified', 'removed_stale_unverified'].includes(entry.classification)) {
          errors.push(`${entryLocation}: note is allowed only for explicit removed/replaced classifications`);
        }
        if (typeof entry.note !== 'string' || !entry.note.trim()) errors.push(`${entryLocation}: note must be non-empty`);
      }
      for (const field of ['record_ids', 'route_aliases']) {
        if (!Array.isArray(entry[field])) { errors.push(`${entryLocation}: ${field} must be an array`); continue; }
        if (new Set(entry[field]).size !== entry[field].length) errors.push(`${entryLocation}: duplicate ${field} reference`);
      }
      const ids = Array.isArray(entry.record_ids) ? entry.record_ids : [];
      const aliases = Array.isArray(entry.route_aliases) ? entry.route_aliases : [];
      for (const id of ids) if (!recordIds.has(id)) errors.push(`${entryLocation}: unknown registry record ${id}`);
      for (const alias of aliases) if (!routeAliases.has(alias)) errors.push(`${entryLocation}: unknown registry route alias ${alias}`);
      if (['record_metadata', 'registry_record'].includes(entry.classification) && ids.length === 0) {
        errors.push(`${entryLocation}: ${entry.classification} requires a record reference`);
      }
      if (entry.classification === 'registry_route' && aliases.length === 0) {
        errors.push(`${entryLocation}: registry_route requires an alias reference`);
      }
      if (entry.classification === 'registry_record_and_route' && (ids.length === 0 || aliases.length === 0)) {
        errors.push(`${entryLocation}: registry_record_and_route requires record and alias references`);
      }
      if (['policy_or_structure', 'profile_evergreen', 'removed_unverified', 'removed_stale_unverified'].includes(entry.classification) && (ids.length || aliases.length)) {
        errors.push(`${entryLocation}: ${entry.classification} must not claim migrated registry references`);
      }
    }
    const sortedLines = [...seenLines].sort((a, b) => a - b).join(',');
    if (sha256(sortedLines) !== baseline.lineSetSha256) {
      errors.push(`${location}: duplicate, unclassified, or unexpected baseline line coverage`);
    }
  }
  for (const source of Object.keys(MIGRATION_BASELINES)) {
    if (!seenSources.has(source)) errors.push(`migration map: missing baseline source ${source}`);
  }
  return errors;
}

function validateRegistry(options = {}) {
  const skillDir = path.resolve(options.skillDir || defaultSkillDir);
  const factsDir = path.resolve(options.factsDir || path.join(skillDir, 'references/facts'));
  const profileIndexFile = path.resolve(options.profileIndexFile || path.join(skillDir, 'references/tool-profiles.md'));
  const profilesDir = path.resolve(options.profilesDir || path.join(skillDir, 'references/profiles'));
  const patternsDir = path.resolve(options.patternsDir || path.join(skillDir, 'references/patterns'));
  const todayText = options.today || new Date().toISOString().slice(0, 10);
  const today = parseIsoDate(todayText);
  const errors = [];
  if (today === null) errors.push(`validation date is not a real ISO date: ${todayText}`);

  const schemaFile = path.join(factsDir, 'schema.json');
  const indexFile = path.join(factsDir, 'index.json');
  const schema = readJson(schemaFile, errors, 'facts/schema.json');
  const index = readJson(indexFile, errors, 'facts/index.json');
  if (schema) errors.push(...validateSchemaFreeze(schema));
  if (schema && index) errors.push(...validateAgainstSchema(index, schema, schema, 'facts/index.json'));

  const shardInventory = new Map();
  const providerInventory = new Set();
  for (const [position, item] of (index?.shards || []).entries()) {
    if (shardInventory.has(item.path)) errors.push(`facts/index.json.shards[${position}]: duplicate shard path ${item.path}`);
    if (providerInventory.has(item.provider_family)) errors.push(`facts/index.json.shards[${position}]: duplicate provider family ${item.provider_family}`);
    shardInventory.set(item.path, item.provider_family);
    providerInventory.add(item.provider_family);
    if (item.path !== `${item.provider_family}.json`) errors.push(`facts/index.json.shards[${position}]: path must equal ${item.provider_family}.json`);
  }
  const diskShards = fs.existsSync(factsDir)
    ? fs.readdirSync(factsDir).filter((name) => name.endsWith('.json') && !['schema.json', 'index.json'].includes(name)).sort()
    : [];
  for (const file of diskShards) if (!shardInventory.has(file)) errors.push(`facts/${file}: orphan shard not listed by index.json`);
  for (const file of shardInventory.keys()) if (!diskShards.includes(file)) errors.push(`facts/index.json: listed shard is missing: ${file}`);

  const records = new Map();
  const modelSurface = new Map();
  for (const [file, family] of shardInventory) {
    const shard = readJson(path.join(factsDir, file), errors, `facts/${file}`);
    if (!shard) continue;
    if (schema) errors.push(...validateAgainstSchema(shard, schema, schema, `facts/${file}`));
    if (shard.provider_family !== family) errors.push(`facts/${file}: provider_family differs from index inventory`);
    if (!Array.isArray(shard.records) || shard.records.length === 0) continue;
    for (const [position, record] of shard.records.entries()) {
      const location = `facts/${file}.records[${position}]`;
      if (record.vendor !== family) errors.push(`${location}: vendor must match shard provider_family`);
      if (!record.id?.startsWith(`${family}.`)) errors.push(`${location}: id must start with ${family}.`);
      if (records.has(record.id)) errors.push(`${location}: duplicate record id ${record.id}`);
      else records.set(record.id, { record, file, location });
      const key = JSON.stringify([record.model_id, record.surface]);
      if (modelSurface.has(key)) errors.push(`${location}: duplicate (model_id, surface) also at ${modelSurface.get(key)}`);
      else modelSurface.set(key, location);
      if (!record.availability?.scope?.includes(record.surface)) errors.push(`${location}: availability.scope must include record.surface`);
      const claimKeys = (record.claims || []).map((claim) => claim.key);
      if (new Set(claimKeys).size !== claimKeys.length) errors.push(`${location}: duplicate claim key`);
      const supports = new Set((record.source || []).flatMap((source) => source.supports || []));
      for (const required of ['model_id', 'channel', 'availability']) {
        if (!supports.has(required)) errors.push(`${location}: official sources do not support ${required}`);
      }
      for (const claim of claimKeys) if (!supports.has(`claims.${claim}`)) errors.push(`${location}: claim ${claim} has no supporting source`);
      const verified = parseIsoDate(record.last_verified);
      if (verified !== null && today !== null) {
        const age = Math.floor((today - verified) / DAY_MS);
        if (age < 0) errors.push(`${location}: last_verified is in the future`);
        const shortWindow = ['preview', 'beta'].includes(record.channel) || record.availability?.status === 'limited';
        const maxAge = shortWindow ? 14 : record.channel === 'production' ? 60 : null;
        if (maxAge !== null && age > maxAge) errors.push(`${location}: stale for routing (${age} days; maximum ${maxAge})`);
      }
      if (record.availability?.status === 'sunset_scheduled' && !record.availability.sunset_on) {
        errors.push(`${location}: sunset_scheduled requires sunset_on`);
      }
    }
  }

  const aliases = new Set();
  const reachableRecords = new Set();
  for (const [position, route] of (index?.routing || []).entries()) {
    const location = `facts/index.json.routing[${position}]`;
    if (aliases.has(route.alias)) errors.push(`${location}: duplicate route alias ${route.alias}`);
    aliases.add(route.alias);
    for (const id of route.candidate_record_ids || []) {
      if (!records.has(id)) errors.push(`${location}: orphan candidate record ${id}`);
      else reachableRecords.add(id);
    }
    const candidateIds = new Set(route.candidate_record_ids || []);
    for (const id of route.capability_record_ids || []) {
      if (candidateIds.has(id)) errors.push(`${location}: capability record must not also be a model candidate ${id}`);
      if (!records.has(id)) errors.push(`${location}: orphan capability record ${id}`);
      else reachableRecords.add(id);
    }
    if (route.default_record_id !== undefined) {
      if (!(route.candidate_record_ids || []).includes(route.default_record_id)) errors.push(`${location}: default must be a candidate`);
      const selected = records.get(route.default_record_id)?.record;
      if (!selected) errors.push(`${location}: orphan default record ${route.default_record_id}`);
      else if (
        selected.channel !== 'production' ||
        ['limited', 'unavailable', 'sunset_scheduled'].includes(selected.availability?.status)
      ) {
        errors.push(`${location}: default must select an eligible production record`);
      }
    }
    const explicitlyPreview = /(?:^|[ .+/_-])(preview|beta)(?:$|[ .+/_-])/i.test(route.alias);
    if (/(?:^|[ .+/_-])latest(?:$|[ .+/_-])/i.test(route.alias) && !explicitlyPreview) {
      const selected = records.get(route.default_record_id)?.record;
      if (!selected || selected.channel !== 'production' || selected.availability?.status !== 'public') {
        errors.push(`${location}: latest must default to public production unless preview is explicit`);
      }
    }
  }
  for (const id of records.keys()) if (!reachableRecords.has(id)) errors.push(`fact record ${id}: unreachable from index routing`);

  const migrationMapFile = options.migrationMapFile === false
    ? null
    : path.resolve(options.migrationMapFile || path.join(repoRoot, 'tests/fixtures/registry/v1.32-to-v1.33-migration-map.json'));
  if (migrationMapFile && (options.migrationMapFile || skillDir === path.resolve(defaultSkillDir))) {
    const migrationMap = readJson(migrationMapFile, errors, 'migration map');
    if (migrationMap) errors.push(...validateMigrationMapDocument(migrationMap, new Set(records.keys()), aliases));
  }

  if (!fs.existsSync(profileIndexFile)) errors.push('references/tool-profiles.md: missing');
  else parseProfileIndex(profileIndexFile, profilesDir, aliases, errors);

  const markdownFiles = [];
  for (const rel of ['SKILL.md', 'references/agentic.md', 'references/models.md', 'references/patterns.md', 'references/templates.md', 'references/tool-profiles.md']) {
    const file = path.join(skillDir, rel);
    if (fs.existsSync(file)) markdownFiles.push(file);
  }
  if (fs.existsSync(profilesDir)) {
    for (const name of fs.readdirSync(profilesDir).filter((item) => item.endsWith('.md'))) markdownFiles.push(path.join(profilesDir, name));
  }
  if (fs.existsSync(patternsDir)) {
    for (const name of fs.readdirSync(patternsDir).filter((item) => item.endsWith('.md'))) markdownFiles.push(path.join(patternsDir, name));
  }
  validateMarkdownLinks(skillDir, markdownFiles, errors);

  return {
    ok: errors.length === 0,
    errors,
    counts: {
      shards: shardInventory.size,
      records: records.size,
      routes: aliases.size,
      profiles: fs.existsSync(profilesDir) ? fs.readdirSync(profilesDir).filter((item) => item.endsWith('.md')).length : 0,
    },
  };
}

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--json') options.json = true;
    else if (arg === '--skill-dir' && argv[i + 1]) options.skillDir = argv[++i];
    else if (arg === '--today' && argv[i + 1]) options.today = argv[++i];
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  return options;
}

function main(argv = process.argv.slice(2)) {
  let options;
  try { options = parseArgs(argv); }
  catch (error) { console.error(error.message); return 2; }
  const result = validateRegistry(options);
  if (options.json) console.log(JSON.stringify(result, null, 2));
  else if (result.ok) {
    console.log(`OK registry: shards=${result.counts.shards} records=${result.counts.records} routes=${result.counts.routes} profiles=${result.counts.profiles}`);
  } else {
    for (const error of result.errors) console.error(`ERROR: ${error}`);
    console.error(`FAILED registry: ${result.errors.length} error(s)`);
  }
  return result.ok ? 0 : 1;
}

if (require.main === module) process.exitCode = main();

module.exports = {
  EVERGREEN_SENTINEL,
  FROZEN_AVAILABILITY,
  FROZEN_CHANNELS,
  FROZEN_PROVIDER_FAMILIES,
  main,
  parseArgs,
  parseIsoDate,
  validateAgainstSchema,
  validateMarkdownLinks,
  validateMigrationMapDocument,
  validateRegistry,
  validateSchemaFreeze,
};
