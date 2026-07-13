#!/usr/bin/env node
// Deterministic validator for project-scoped Codex role policies.
// Reads local TOML only; no subprocesses, model clients, credentials, or network.

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');

const expectedRoles = {
  adversarial_reviewer: { model: 'gpt-5.6-sol', effort: 'high', sandbox: 'read-only' },
  docs_author: { model: 'gpt-5.6-terra', effort: 'medium', sandbox: 'read-only' },
  docs_reviewer: { model: 'gpt-5.6-terra', effort: 'high', sandbox: 'read-only' },
  eval_architect: { model: 'gpt-5.6-sol', effort: 'high', sandbox: 'read-only' },
  package_checker: { model: 'gpt-5.6-luna', effort: 'low', sandbox: 'read-only' },
  repo_explorer: { model: 'gpt-5.6-terra', effort: 'medium', sandbox: 'read-only' },
  runtime_author: { model: 'gpt-5.6-sol', effort: 'high', sandbox: null },
  test_author: { model: 'gpt-5.6-sol', effort: 'high', sandbox: null },
  test_runner: { model: 'gpt-5.6-luna', effort: 'low', sandbox: 'read-only' },
};

const allowedAgentKeys = new Set([
  'name',
  'description',
  'model',
  'model_reasoning_effort',
  'sandbox_mode',
  'nickname_candidates',
  'developer_instructions',
]);

function rel(root, file) {
  return path.relative(root, file).replace(/\\/g, '/');
}

function parseScalar(raw, file, lineNumber) {
  if (raw.startsWith('[')) {
    try {
      const value = JSON.parse(raw);
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        throw new Error('expected an array of strings');
      }
      return value;
    } catch (error) {
      throw new Error(`${file}:${lineNumber}: invalid string array (${error.message})`);
    }
  }
  if (raw.startsWith('"')) {
    try {
      const value = JSON.parse(raw);
      if (typeof value !== 'string') throw new Error('expected a string');
      return value;
    } catch (error) {
      throw new Error(`${file}:${lineNumber}: invalid quoted string (${error.message})`);
    }
  }
  if (/^(?:true|false)$/.test(raw)) return raw === 'true';
  if (/^\d+$/.test(raw)) return Number(raw);
  throw new Error(`${file}:${lineNumber}: unsupported TOML value: ${raw}`);
}

function parseFlatAgentToml(text, file) {
  if (text.includes('\r')) throw new Error(`${file}: CRLF/CR line endings are not allowed`);
  const values = {};
  const lines = text.replace(/^\uFEFF/, '').split('\n');
  let multilineKey = null;
  let multilineStart = 0;
  let multiline = [];

  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];
    if (multilineKey) {
      if (line === '"""') {
        values[multilineKey] = multiline.join('\n');
        multilineKey = null;
        multiline = [];
      } else {
        multiline.push(line);
      }
      continue;
    }
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const match = line.match(/^([a-z][a-z0-9_]*)\s*=\s*(.+)$/);
    if (!match) throw new Error(`${file}:${lineNumber}: unsupported TOML syntax`);
    const [, key, raw] = match;
    if (!allowedAgentKeys.has(key)) throw new Error(`${file}:${lineNumber}: unsupported key ${key}`);
    if (Object.prototype.hasOwnProperty.call(values, key)) {
      throw new Error(`${file}:${lineNumber}: duplicate key ${key}`);
    }
    if (raw === '"""') {
      multilineKey = key;
      multilineStart = lineNumber;
      multiline = [];
    } else {
      values[key] = parseScalar(raw, file, lineNumber);
    }
  }
  if (multilineKey) {
    throw new Error(`${file}:${multilineStart}: unterminated multiline string ${multilineKey}`);
  }
  return values;
}

function parseProjectConfig(text, file) {
  if (text.includes('\r')) throw new Error(`${file}: CRLF/CR line endings are not allowed`);
  const lines = text.replace(/^\uFEFF/, '').split('\n');
  let table = null;
  const agents = {};
  for (let index = 0; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index].trim();
    if (!line || line.startsWith('#')) continue;
    const tableMatch = line.match(/^\[([a-z][a-z0-9_]*)\]$/);
    if (tableMatch) {
      table = tableMatch[1];
      if (table !== 'agents') throw new Error(`${file}:${lineNumber}: unsupported table [${table}]`);
      continue;
    }
    if (table !== 'agents') throw new Error(`${file}:${lineNumber}: setting outside [agents]`);
    const match = line.match(/^([a-z][a-z0-9_]*)\s*=\s*(\d+|true|false)$/);
    if (!match) throw new Error(`${file}:${lineNumber}: unsupported [agents] setting`);
    const [, key, raw] = match;
    if (!['max_threads', 'max_depth', 'interrupt_message'].includes(key)) {
      throw new Error(`${file}:${lineNumber}: unsupported [agents] key ${key}`);
    }
    if (Object.prototype.hasOwnProperty.call(agents, key)) {
      throw new Error(`${file}:${lineNumber}: duplicate [agents] key ${key}`);
    }
    agents[key] = /^(?:true|false)$/.test(raw) ? raw === 'true' : Number(raw);
  }
  return agents;
}

function validateCodexAgents(root = repoRoot) {
  const errors = [];
  const configFile = path.join(root, '.codex', 'config.toml');
  const agentsDir = path.join(root, '.codex', 'agents');
  let config = null;

  try {
    if (!fs.existsSync(configFile)) throw new Error(`${rel(root, configFile)}: required file missing`);
    config = parseProjectConfig(fs.readFileSync(configFile, 'utf8'), rel(root, configFile));
    if (config.max_threads !== 4) errors.push('.codex/config.toml: agents.max_threads must equal 4');
    if (config.max_depth !== 1) errors.push('.codex/config.toml: agents.max_depth must equal 1');
    if (config.interrupt_message !== true) errors.push('.codex/config.toml: agents.interrupt_message must equal true');
  } catch (error) {
    errors.push(error.message);
  }

  let files = [];
  if (!fs.existsSync(agentsDir)) {
    errors.push('.codex/agents: required directory missing');
  } else {
    files = fs.readdirSync(agentsDir).filter((name) => name.endsWith('.toml')).sort();
  }

  const expectedFiles = Object.keys(expectedRoles).map((name) => `${name}.toml`).sort();
  if (JSON.stringify(files) !== JSON.stringify(expectedFiles)) {
    errors.push(`.codex/agents inventory mismatch: expected ${expectedFiles.join(', ')}, got ${files.join(', ') || '(none)'}`);
  }

  const seenNames = new Map();
  const parsed = {};
  for (const filename of files) {
    const file = path.join(agentsDir, filename);
    const relative = rel(root, file);
    let values;
    try {
      values = parseFlatAgentToml(fs.readFileSync(file, 'utf8'), relative);
      parsed[filename] = values;
    } catch (error) {
      errors.push(error.message);
      continue;
    }

    for (const key of ['name', 'description', 'developer_instructions']) {
      if (typeof values[key] !== 'string' || !values[key].trim()) {
        errors.push(`${relative}: required non-empty string ${key}`);
      }
    }
    if (typeof values.name === 'string') {
      if (!/^[a-z0-9_]+$/.test(values.name)) errors.push(`${relative}: invalid agent name ${values.name}`);
      if (`${values.name}.toml` !== filename) errors.push(`${relative}: filename must match name ${values.name}`);
      if (seenNames.has(values.name)) errors.push(`${relative}: duplicate agent name ${values.name}`);
      else seenNames.set(values.name, relative);
    }

    const role = expectedRoles[values.name];
    if (!role) {
      errors.push(`${relative}: unexpected role ${values.name || '(missing)'}`);
      continue;
    }
    if (values.model !== role.model) errors.push(`${relative}: model must equal ${role.model}`);
    if (values.model_reasoning_effort !== role.effort) {
      errors.push(`${relative}: model_reasoning_effort must equal ${role.effort}`);
    }
    if (role.sandbox === null) {
      if (Object.prototype.hasOwnProperty.call(values, 'sandbox_mode')) {
        errors.push(`${relative}: author role must inherit sandbox; sandbox_mode must be omitted`);
      }
    } else if (values.sandbox_mode !== role.sandbox) {
      errors.push(`${relative}: sandbox_mode must equal ${role.sandbox}`);
    }
    if (typeof values.model === 'string' && /ultra/i.test(values.model)) {
      errors.push(`${relative}: Ultra is an orchestration mode, not a model slug`);
    }
    if (!Array.isArray(values.nickname_candidates) || values.nickname_candidates.length === 0) {
      errors.push(`${relative}: nickname_candidates must be a non-empty string array`);
    } else if (new Set(values.nickname_candidates).size !== values.nickname_candidates.length) {
      errors.push(`${relative}: nickname_candidates must be unique`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    summary: {
      config: config ? { max_threads: config.max_threads, max_depth: config.max_depth } : null,
      expected_profiles: expectedFiles.length,
      parsed_profiles: Object.keys(parsed).length,
      names: [...seenNames.keys()].sort(),
    },
  };
}

if (require.main === module) {
  const result = validateCodexAgents();
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.ok ? 0 : 1;
}

module.exports = { expectedRoles, parseFlatAgentToml, parseProjectConfig, validateCodexAgents };
