#!/usr/bin/env node
// Deterministic source contracts for security and provider-specific routing.
// Reads repository files only; no subprocesses, dependencies, or network calls.

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(repoRoot, ...parts), 'utf8');
const profileNames = [
  'hosted-text.md', 'local-text.md', 'coding-agents.md', 'research-browser.md',
  'builders-workflows.md', 'media.md', 'decompiler-fallback.md',
];
const profileBundles = Object.fromEntries(profileNames.map((name) => [
  name,
  read('plugins/prompt-master/skills/prompt-master/references/profiles', name),
]));
const factsIndex = JSON.parse(read('plugins/prompt-master/skills/prompt-master/references/facts/index.json'));
const factShards = factsIndex.shards.map((shard) => JSON.parse(read(
  'plugins/prompt-master/skills/prompt-master/references/facts',
  shard.path
)));
const factRecords = factShards.flatMap((shard) => shard.records);
const semanticContracts = JSON.parse(read('tests/patterns/semantic-contracts.json'));
const sources = {
  skill: read('plugins/prompt-master/skills/prompt-master/SKILL.md'),
  agentic: read('plugins/prompt-master/skills/prompt-master/references/agentic.md'),
  models: read('plugins/prompt-master/skills/prompt-master/references/models.md'),
  templates: read('plugins/prompt-master/skills/prompt-master/references/templates.md'),
  profileIndex: read('plugins/prompt-master/skills/prompt-master/references/tool-profiles.md'),
  profiles: Object.values(profileBundles).join('\n'),
  hook: read('plugins/prompt-master/hooks/multi-agent-detect.js'),
  ci: read('.github/workflows/ci.yml'),
  packagePs1: read('scripts/package-skill.ps1').replace(/^\uFEFF/, ''),
  runtimeManifest: read('plugins/prompt-master/runtime-manifest.json'),
  codexManifest: read('plugins/prompt-master/.codex-plugin/plugin.json'),
  codexLayoutTest: read('scripts/test-codex-layout.js'),
  codexHookTest: read('scripts/test-codex-hook.js'),
  bumpVersionPs1: read('scripts/bump-version.ps1').replace(/^\uFEFF/, ''),
  lintJs: read('scripts/lint.js'),
  lintPs1: read('scripts/lint.ps1').replace(/^\uFEFF/, ''),
  safeTest: read('scripts/test-safe.js'),
  patternsValidator: read('scripts/validate-patterns.js'),
  registryValidator: read('scripts/validate-registry.js'),
  patternsTest: read('scripts/test-patterns.js'),
  patternRoutingTest: read('scripts/test-pattern-routing.js'),
  patternPackageTest: read('scripts/test-pattern-package.js'),
};

function recordsFor(vendor) {
  return factRecords.filter((record) => record.vendor === vendor);
}

function claim(record, key) {
  return record.claims.find((item) => item.key === key)?.value;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function requireMatch(text, pattern, message) {
  assert(pattern.test(text), message);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function markdownSection(text, heading, level = 2) {
  const marker = `${'#'.repeat(level)} ${heading}`;
  const startMatch = text.match(new RegExp(`^${escapeRegex(marker)}\\s*$`, 'm'));
  assert(startMatch, `missing section: ${marker}`);
  const start = startMatch.index;
  const tail = text.slice(start + startMatch[0].length);
  const nextMatch = tail.match(new RegExp(`^#{1,${level}}\\s+`, 'm'));
  const end = nextMatch ? start + startMatch[0].length + nextMatch.index : text.length;
  return text.slice(start, end);
}

function patternSection(text, id) {
  const match = text.match(new RegExp(`^##\\s+${escapeRegex(id)}\\b[\\s\\S]*?(?=^##\\s+PM-[0-9]{3}\\b|(?![\\s\\S]))`, 'm'));
  assert(match, `missing pattern section ${id}`);
  return match[0];
}

function between(text, startPattern, endPattern, label) {
  const start = text.search(startPattern);
  assert(start !== -1, `missing ${label} start`);
  const tail = text.slice(start);
  const endMatch = tail.match(endPattern);
  assert(endMatch && endMatch.index > 0, `missing ${label} end`);
  return tail.slice(0, endMatch.index);
}

function citationSentences(text) {
  return text
    .split('\n')
    .flatMap((line) => line.split(/(?<=[.!?])\s+/))
    .map((line) => line.trim())
    .filter(Boolean);
}

function sonarClauses(text) {
  const marker = /\b(?:For Sonar(?: API)?|Sonar API|Sonar exception|Sonar-native citations)\b/i;
  return text
    .split('\n')
    .filter((line) => marker.test(line))
    .map((line) => line.slice(line.search(marker)))
    .join('\n');
}

function assertNoPositiveSonarProseDemand(name, text) {
  const targets = /(?:inline[\s\S]{0,30}(?:URL|link)s?|URLs? in (?:response )?prose|prose sources list|sources list)/i;
  const demandVerbs = /\b(?:ask|request|require|instruct|tell|must|should|shall|include|provide|emit|list|cite|add)\b/ig;
  for (const original of citationSentences(text)) {
    if (!targets.test(original)) continue;
    const sentence = original
      .replace(/[*`]/g, '')
      .replace(/(?:For )?non-Sonar[\s\S]*?(?=For Sonar|Sonar API|$)/ig, '');
    for (const match of sentence.matchAll(demandVerbs)) {
      const after = sentence.slice(match.index, match.index + 180);
      if (!targets.test(after)) continue;
      const before = sentence.slice(Math.max(0, match.index - 24), match.index);
      const negated = /(?:do not|don't|never|omit|without|no)\s*$/i.test(before);
      assert(negated, `${name} contains a positive Sonar prose citation demand: ${original}`);
    }
  }
}

function hasExplicitOmniIncompatibility(line) {
  const plain = line.replace(/[*`]/g, '');
  return (
    /--o(?:ref|w)(?:\s*\/\s*--o(?:ref|w))?[^.]{0,100}(?:is|are)\s+V7[- ]only/i.test(plain) ||
    /--o(?:ref|w)[^.]{0,140}(?:must use|mandatory|required)[^.]{0,50}--v\s+7/i.test(plain) ||
    /(?:never|do not|must not)\s+combine[^.]{0,120}--o(?:ref|w)[^.]{0,100}V8\.1/i.test(plain) ||
    /(?:never|do not|must not)\s+combine[^.]{0,120}V8\.1[^.]{0,100}--o(?:ref|w)/i.test(plain) ||
    /--o(?:ref|w)[^.]{0,140}(?:never|not compatible|incompatible)[^.]{0,60}V8\.1/i.test(plain)
  );
}

function assertNoGrokNegativeField(name, text) {
  const token = /Negative Prompt|negative_prompt|negative-prompt/i;
  for (const line of text.split('\n')) {
    if (!/Grok Imagine/i.test(line) || !token.test(line)) continue;
    const plainLine = line.replace(/[*`]/g, '');
    const plain = plainLine.slice(plainLine.search(/Grok Imagine/i));
    const index = plain.search(token);
    const before = plain.slice(Math.max(0, index - 80), index);
    assert(
      /(?:\bno\b|never|do not|must not|without|omit)\b/i.test(before),
      `${name} gives Grok a Negative Prompt field/parameter: ${line.trim()}`
    );
  }
}

function textFrom(text, startPattern, label) {
  const start = text.search(startPattern);
  assert(start !== -1, `missing ${label}`);
  return text.slice(start);
}

function assertNoVolatileTemplateLeak(text) {
  for (const pattern of [
    /\b(?:SD\s*1\.5|SDXL|SD\s*3\.5|FLUX\.2)\b/i,
    /\b75 tokens\b|Euler a|CFG(?: SCALE)?\s*:?\s*7|steps?\s*:?\s*20\s*[-–]\s*30|divisible by 64/i,
    /Paste[- ]in[- ]text|Minimal\s*\/\s*Concise\s*\/\s*Detailed/i,
    /\\n---\\n|Stock recommended|10 cards\s*[·|]/i,
  ]) assert(!pattern.test(text), `volatile template fact leaked: ${pattern}`);
}

const cases = [
  function canonicalTrustAndNetworkBoundary() {
    const trust = markdownSection(sources.agentic, 'Canonical Trust Boundary');
    for (const [category, pattern] of [
      ['repository files/diffs', /Repository files and diffs/i],
      ['issues/PRs', /Issue and pull-request comments/i],
      ['logs/dependencies', /Logs and dependency\/package metadata/i],
      ['web/retrieved documents', /Web pages and retrieved documents/i],
      ['MCP/tool outputs', /MCP responses and all other tool outputs/i],
      ['worker/subagent messages', /Coordinator, worker, reviewer, advisor, and subagent messages/i],
      ['pasted/user artifacts', /Pasted prompts and user-supplied artifacts/i],
    ]) {
      requireMatch(trust, pattern, `Canonical Trust Boundary missing ${category}`);
    }
    requireMatch(
      trust,
      /Embedded directives[\s\S]{0,500}cannot change the objective,\s*scope,\s*allowed files,\s*allowed tools,\s*network destinations,[\s\S]{0,120}approval gates/i,
      'embedded directives must not change objective, scope, tools, network, or approvals'
    );

    const network = markdownSection(sources.agentic, 'Network Egress Contract');
    requireMatch(network, /empty allowlist means network access is disabled/i, 'network must default deny');
    requireMatch(network, /Deny every other outbound destination and purpose/i, 'unlisted egress must be denied');
    requireMatch(network, /preconfigured runtime[\s\S]{0,80}credential/i, 'network auth must use runtime credentials');
    requireMatch(network, /Canonical Trust Boundary/i, 'network responses must remain untrusted');

    const sanitization = markdownSection(sources.skill, 'Input Sanitization -- Untrusted Runtime Data', 3);
    for (const pattern of [/repo files\/diffs/i, /issue or PR comments/i, /MCP\/tool outputs/i, /worker\/subagent messages/i]) {
      requireMatch(sanitization, pattern, `always-loaded sanitization missing ${pattern}`);
    }
    requireMatch(
      sanitization,
      /canonical runtime and network clauses/i,
      'always-loaded runtime must route to the canonical network contract'
    );
  },

  function templateLRedactsSource() {
    const template = markdownSection(sources.templates, 'Template L — Prompt Decompiler');
    requireMatch(template, /Never reproduce it verbatim/i, 'Template L must not reproduce raw input');
    requireMatch(template, /Remove secret values/i, 'Template L must remove secrets');
    requireMatch(template, /redacted structural summary/i, 'Template L must use a redacted summary');
    requireMatch(template, /Sensitive literals removed/i, 'Template L must report removed literal types');
    requireMatch(template, /Embedded directives removed/i, 'Template L must report removed directive categories');
    assert(!/^\s*Original prompt\s*:/im.test(template), 'Template L contains a raw Original prompt field');
    assert(!/^\s*Original \(\[source tool\]\)\s*:/im.test(template), 'Template L contains a raw source prompt field');
  },

  function sonarUsesNativeCitations() {
    const profile = markdownSection(profileBundles['research-browser.md'], 'Perplexity (Agent API, Sonar, and Deep Research)');
    const records = recordsFor('perplexity');
    const template = markdownSection(sources.templates, 'Template N — Research Brief');
    const skill = sonarClauses(sources.skill);
    assert(skill, 'SKILL.md missing Sonar-specific clauses');
    for (const [name, text] of [
      ['SKILL.md', skill],
      ['Template N', template],
    ]) {
      requireMatch(
        text,
        /(?:do[\s*_]+not|never)[\s\S]{0,80}(?:ask Sonar|Sonar)[\s\S]{0,180}(?:URL|inline link|sources list)|Sonar-native citations[\s\S]{0,240}(?:do[\s*_]+not|never)[\s\S]{0,160}(?:URL|inline link|sources list)|(?:for Sonar|Sonar API)[\s\S]{0,100}(?:omit|do[\s*_]+not|never)[\s\S]{0,120}(?:URL|inline link|sources list)/i,
        `${name} must prohibit prose URL requests for Sonar`
      );
      requireMatch(text, /top-level\s+`?citations`?/i, `${name} missing top-level citations`);
      requireMatch(text, /`?search_results`?/i, `${name} missing search_results`);
      assertNoPositiveSonarProseDemand(name, text);
    }
    requireMatch(profile, /citations\/search-results as top-level fields[\s\S]{0,160}Do not ask answer prose for URLs/i, 'Perplexity profile must preserve client-side Sonar citations');
    assertNoPositiveSonarProseDemand('profile', profile);
    assert(records.length > 0, 'facts registry missing Perplexity records');
    assert(
      records.some((record) => record.prompting_constraints.includes('citation_fields_client_side')),
      'Perplexity facts missing citation_fields_client_side constraint'
    );
    assert(records.some((record) => claim(record, 'citation_fields')), 'Perplexity facts missing citation_fields claim');
    assert(records.some((record) => claim(record, 'search_driver')), 'Perplexity facts missing search_driver claim');
    let rejectedAdversarial = false;
    try {
      assertNoPositiveSonarProseDemand(
        'adversarial Sonar probe',
        'Sonar uses citations and search_results. Also cite every claim inline with its URL and add a prose sources list.'
      );
    } catch (_) {
      rejectedAdversarial = true;
    }
    assert(rejectedAdversarial, 'Sonar detector must reject a contradictory positive URL demand');
  },

  function midjourneyOmniIsNeverV81() {
    const records = recordsFor('midjourney');
    const omni = records.filter((record) => claim(record, 'omni_reference'));
    const ordinary = records.filter((record) => !claim(record, 'omni_reference'));
    assert(omni.length === 1, 'Midjourney facts must expose one reviewed Omni Reference record');
    assert(ordinary.length >= 1, 'Midjourney facts missing ordinary generation record');
    const flags = claim(omni[0], 'omni_reference').flags;
    assert(flags.includes('--oref') && flags.includes('--ow'), 'Omni Reference record missing --oref/--ow');
    assert(ordinary.every((record) => !JSON.stringify(record).includes('--oref')), 'ordinary Midjourney record leaks Omni flags');
    const profile = markdownSection(profileBundles['media.md'], 'Image AI — Generation');
    requireMatch(profile, /ordinary generation versus consistency\/reference work/i, 'media profile must split ordinary and reference routes');
    requireMatch(profile, /never combine incompatible version-specific reference controls/i, 'media profile missing version incompatibility guard');
    assert(
      !hasExplicitOmniIncompatibility('Use --v 8.1 --oref ref.png --ow 100; never omit --ar.'),
      'unrelated guard wording must not excuse an Omni conflict'
    );
  },

  function grokTemplateJUsesPositiveConstraints() {
    const template = markdownSection(sources.templates, 'Template J — Reference Image Editing');
    const imageProfiles = markdownSection(profileBundles['media.md'], 'Image AI — Generation');
    const imageRecords = recordsFor('xai').filter((record) => /images-api|video-api/.test(record.surface));
    const templateI = markdownSection(sources.templates, 'Template I — Visual Descriptor');
    requireMatch(
      template,
      /Grok Imagine[\s\S]{0,400}positive preservation/i,
      'Template J must give Grok positive preservation constraints'
    );
    requireMatch(
      template,
      /Grok Imagine[\s\S]{0,500}(?:no|never add|do[\s*_]+not add) (?:a )?Negative Prompt (?:parameter|field|block)/i,
      'Template J must prohibit a Grok Negative Prompt field/block'
    );
    const fieldName = '(?:Negative[ _-]Prompt|negative_prompt|negative-prompt)';
    assert(
      !new RegExp(`^\\s*${fieldName}(?:\\s+(?:field|parameter))?\\s*[:=]`, 'im').test(template),
      'Template J exposes a Negative Prompt field/parameter to Grok'
    );
    for (const [name, text] of [
      ['SKILL.md', sources.skill],
      ['media profile Image AI', imageProfiles],
      ['Template I', templateI],
      ['Template J', template],
    ]) {
      assertNoGrokNegativeField(name, text);
    }
    assert(imageRecords.length > 0, 'xAI image/video fact records missing');
    for (const record of imageRecords) {
      assert(record.prompting_constraints.includes('negative_prompt_unsupported'), `${record.id} missing negative_prompt_unsupported`);
      assert(record.prompting_constraints.includes('positive_constraints_only'), `${record.id} missing positive_constraints_only`);
      assert(claim(record, 'negative_prompt_support') === false, `${record.id} must encode negative_prompt_support=false`);
    }
    let rejectedAdversarial = false;
    try {
      assertNoGrokNegativeField('adversarial Grok probe', 'Grok Imagine: negative_prompt: do not alter face');
    } catch (_) {
      rejectedAdversarial = true;
    }
    assert(rejectedAdversarial, 'Grok detector must reject a snake_case Negative Prompt field');
  },

  function routingPrecedenceAndFallbackContracts() {
    const primacy = markdownSection(sources.skill, 'PRIMACY ZONE — Identity, Hard Rules, Output Lock');
    requireMatch(
      primacy,
      /Canonical precedence[\s\S]{0,240}security\/approval\s*>\s*explicit user constraints\s*>\s*verified target capability\/compatibility\s*>\s*output contract\s*>\s*question policy\s*>\s*defaults\s*>\s*style/i,
      'missing canonical precedence order'
    );
    requireMatch(primacy, /Explicit `no questions` is absolute[\s\S]{0,160}ask zero questions/i, 'no-questions contract is not absolute');
    requireMatch(
      primacy,
      /Deterministic question\/fallback order[\s\S]{0,500}Assumed target tool:[\s\S]{0,500}Assumed output format:/i,
      'target-first and format fallback order is incomplete'
    );
    requireMatch(primacy, /N=2 means exactly Variant A\/B[\s\S]{0,100}N=3 means exactly A\/B\/C[\s\S]{0,100}N>3 returns exactly 3/i, 'exact-N variant cardinality is missing');
    requireMatch(primacy, /High-risk suppression above wins/i, 'high-risk variant suppression must override cardinality');
    requireMatch(primacy, /Split is not variants[\s\S]{0,240}Prompt 1[^\n]*Prompt N[\s\S]{0,180}Do not add Variant\/Fit\/Risk\/When-to-use labels/i, 'split and variant contracts are not disjoint');

    const templateL = markdownSection(sources.templates, 'Template L — Prompt Decompiler');
    requireMatch(templateL, /Split into \[N\] sequential, self-contained prompts/i, 'Template L split cardinality is missing');
    requireMatch(templateL, /split mode, not variants/i, 'Template L does not distinguish split from variants');

    const fragments = markdownSection(sources.templates, 'Agentic Prompt Fragments');
    requireMatch(
      fragments,
      /3 total execution attempts per sub-task\s*=\s*initial attempt \+ 2 retries/i,
      'retry contract must be one initial attempt plus exactly two retries'
    );
    requireMatch(
      fragments,
      /Attempt 1\s*(?:is|=)\s*initial execution;[\s\S]{0,50}Attempt 2\s*(?:is|=)\s*Retry 1;[\s\S]{0,50}Attempt 3\s*(?:is|=)\s*Retry 2/i,
      'retry slot mapping is ambiguous'
    );
    requireMatch(
      fragments,
      /After the third failure[,]?[\s\S]{0,80}(?:stop\/escalate|stop retrying and escalate)[\s\S]{0,120}evidence[\s\S]{0,100}never start Retry\s+3/i,
      'retry exhaustion must stop and escalate'
    );
    assert(!/until (?:it )?passes/i.test(fragments), 'agentic retry contract must not be unbounded');

    const unknown = textFrom(profileBundles['decompiler-fallback.md'], /^## Unknown tool\s*$/m, 'Unknown tool section');
    requireMatch(unknown, /Capability fingerprint — all (?:7|seven) fields are required/i, 'unknown tool fingerprint must have seven required fields');
    for (const field of [
      'Modality',
      'Read/write side effects',
      'Tool/API/schema support',
      'Retrieval/freshness',
      'Context/input type',
      'Output constraints',
      'Risk/approval tier',
    ]) {
      requireMatch(unknown, new RegExp(`\\*\\*${escapeRegex(field)}:`), `unknown fingerprint missing ${field}`);
    }
    requireMatch(unknown, /Targetless request:/i, 'unknown routing must define targetless state');
    requireMatch(unknown, /Named unknown tool:/i, 'unknown routing must define named-unknown state');
    requireMatch(unknown, /Missing(?:\/| or )unreadable reference:/i, 'unknown routing must define missing-reference state');
    requireMatch(unknown, /Assumed target tool:[^\n]*\[unverified\]/i, 'unknown no-question fallback must surface unverified target');
    requireMatch(unknown, /Minimal capability-safe prompt for a missing reference/i, 'missing reference needs a minimal safe fallback');
    requireMatch(unknown, /label the reference unavailable[\s\S]{0,160}could not be verified/i, 'missing reference must surface unverified assumptions');
  },

  function templatesUseRegistryOrLocalCapabilities() {
    const comfy = markdownSection(sources.templates, 'Template K — ComfyUI');
    const gamma = markdownSection(sources.templates, 'Template O — Deck / Presentation Brief');
    assertNoVolatileTemplateLeak(`${comfy}\n${gamma}`);
    requireMatch(comfy, /no provider fact record/i, 'ComfyUI template must declare the evergreen-only boundary');
    requireMatch(comfy, /user's loaded workflow or locally verified node capabilities/i, 'ComfyUI settings must be locally verified');
    requireMatch(comfy, /Never invent a default[\s\S]{0,100}\[unverified\]/i, 'ComfyUI unknown settings must fail closed');
    requireMatch(gamma, /selected Gamma fact record/i, 'Gamma template must load its selected fact record');
    requireMatch(gamma, /exact app\/API surface/i, 'Gamma template must keep surface enums separate');
    requireMatch(gamma, /missing\/stale[\s\S]{0,100}\[unverified\][\s\S]{0,80}do not invent a default/i, 'Gamma missing facts must fail closed');
    for (const probe of [
      'CHECKPOINT: SDXL; SAMPLER: Euler a; CFG SCALE: 7; STEPS: 20-30',
      'Paste-in-text uses \\n---\\n; Assumed settings: 10 cards · Concise density · Stock visuals',
    ]) {
      let rejected = false;
      try { assertNoVolatileTemplateLeak(probe); }
      catch (_) { rejected = true; }
      assert(rejected, `volatile-template detector accepted adversarial probe: ${probe}`);
    }
  },

  function openAiGpt56SurfaceAndMultiAgentContract() {
    const apiIds = new Set([
      'openai.gpt-5-6-sol.api',
      'openai.gpt-5-6-terra.api',
      'openai.gpt-5-6-luna.api',
    ]);
    const appIds = new Set([
      'openai.gpt-5-6-sol.app',
      'openai.gpt-5-6-terra.app',
      'openai.gpt-5-6-luna.app',
    ]);
    const codexIds = new Set([
      'openai.gpt-5-6-sol.codex',
      'openai.gpt-5-6-terra.codex',
      'openai.gpt-5-6-luna.codex',
    ]);
    const apiRecords = factRecords.filter((record) => apiIds.has(record.id));
    const appRecords = factRecords.filter((record) => appIds.has(record.id));
    const codexRecords = factRecords.filter((record) => codexIds.has(record.id));
    assert(apiRecords.length === 3, 'registry must contain exactly three GPT-5.6 API tier records');
    assert(appRecords.length === 3, 'registry must contain exactly three GPT-5.6 app tier records');
    assert(codexRecords.length === 3, 'registry must contain exactly three GPT-5.6 Codex tier records');
    for (const record of apiRecords) {
      assert(record.surface === 'api' && record.channel === 'production', `${record.id} must be a production API record`);
      assert(claim(record, 'context_window_tokens') === 1050000, `${record.id} context must follow its live model page`);
      assert(claim(record, 'max_output_tokens') === 128000, `${record.id} max output mismatch`);
      assert(claim(record, 'preferred_api') === 'responses', `${record.id} must prefer Responses API`);
      assert(claim(record, 'default_reasoning_effort') === 'medium', `${record.id} default effort mismatch`);
      assert(JSON.stringify(claim(record, 'reasoning_effort_values')) === JSON.stringify(['none', 'low', 'medium', 'high', 'xhigh', 'max']), `${record.id} effort enum mismatch`);
    }
    for (const record of appRecords) {
      assert(record.surface === 'app' && record.channel === 'production', `${record.id} must be a production app record`);
      const modes = claim(record, 'app_modes');
      assert(modes?.deep_single_agent && modes?.parallel_subagents, `${record.id} must separate deep single-agent and subagent modes`);
      assert(claim(record, 'platforms_supported').every((platform) => !/Codex/i.test(platform)), `${record.id} must not absorb Codex platforms`);
    }
    for (const record of codexRecords) {
      assert(record.surface === 'codex' && record.channel === 'production', `${record.id} must be a production Codex record`);
      const modes = claim(record, 'app_modes');
      assert(modes?.deep_single_agent && modes?.parallel_subagents, `${record.id} must separate Codex single-agent and subagent modes`);
      assert(claim(record, 'platforms_supported').every((platform) => !/ChatGPT/i.test(platform)), `${record.id} must not absorb ChatGPT platforms`);
    }
    const routes = new Map(factsIndex.routing.map((route) => [route.alias, route]));
    for (const alias of ['openai-api', 'openai-reasoning']) {
      assert(routes.get(alias)?.default_record_id === 'openai.gpt-5-6-sol.api', `${alias} must default to GPT-5.6 Sol API`);
    }
    for (const alias of ['gpt', 'openai', 'gpt-5.6', 'gpt-5.6-sol', 'gpt-5.6-terra', 'gpt-5.6-luna']) {
      assert(routes.get(alias) && !routes.get(alias).default_record_id, `${alias} must not pick a surface prematurely`);
    }
    for (const alias of ['chatgpt', 'chatgpt work']) {
      const route = routes.get(alias);
      assert(route?.default_record_id === 'openai.gpt-5-6-sol.app', `${alias} must default to GPT-5.6 Sol app`);
      assert(route.candidate_record_ids.every((id) => appIds.has(id)), `${alias} must stay app-only`);
    }
    assert(routes.get('codex')?.default_record_id === 'openai.gpt-5-6-sol.codex', 'codex must default to GPT-5.6 Sol Codex record');
    assert(routes.get('codex').candidate_record_ids.every((id) => codexIds.has(id)), 'codex must stay codex-only');
    assert(routes.get('gpt').candidate_record_ids.includes('openai.gpt-5-5.api'), 'GPT-5.5 compatibility candidate must remain reachable');
    const betaRecords = factRecords.filter((record) => record.id === 'openai.responses-multi-agent-v1.api');
    assert(betaRecords.length === 1 && betaRecords[0].channel === 'beta', 'Responses Multi-agent must be one beta capability record');
    assert(!factsIndex.routing.some((route) => route.default_record_id === betaRecords[0].id), 'Responses Multi-agent beta must never be a default');
    const multiRoute = routes.get('responses-multi-agent');
    assert(multiRoute?.default_record_id === 'openai.gpt-5-6-sol.api', 'Responses Multi-agent must separately select a production model');
    assert(JSON.stringify(multiRoute.capability_record_ids) === JSON.stringify([betaRecords[0].id]), 'Responses Multi-agent route must attach its beta capability record');

    const chatgpt = markdownSection(profileBundles['hosted-text.md'], 'ChatGPT Chat and Work');
    const api = markdownSection(profileBundles['hosted-text.md'], 'OpenAI API');
    const multi = markdownSection(profileBundles['hosted-text.md'], 'OpenAI Responses Multi-agent (beta)');
    const codex = markdownSection(profileBundles['coding-agents.md'], 'Codex');
    requireMatch(sources.skill, /Surface before model or mode[\s\S]{0,500}Assumed surface:/i, 'core must resolve OpenAI surface before model/mode');
    requireMatch(sources.skill, /ChatGPT Chat[\s\S]{0,120}ChatGPT Work[\s\S]{0,120}Codex[\s\S]{0,120}Responses API/i, 'OpenAI surface chooser must keep four surfaces separate');
    requireMatch(sources.skill, /Recommended setup:[\s\S]{0,300}outside the fenced prompt/i, 'core must keep recommended setup outside prompt');
    requireMatch(chatgpt, /Resolve Chat versus Work before model selection/i, 'ChatGPT profile must split Chat and Work');
    requireMatch(chatgpt, /at least two independent bounded workstreams/i, 'ChatGPT Work needs a decomposition gate');
    requireMatch(chatgpt, /hard but sequential[\s\S]{0,120}single-agent mode/i, 'ChatGPT Work must fall back to deeper single-agent mode');
    assert(!/(?:reasoning\.(?:effort|mode|context)|text\.verbosity|allowed_callers|programmatic_tool_calling|previous_response_id|responses_multi_agent|multi_agent\.|\/v1\/responses|multi_agent_call|agent_message)/i.test(chatgpt), 'ChatGPT profile leaks API-only controls');
    requireMatch(api, /request controls in API setup/i, 'API profile must keep request controls outside prompt');
    requireMatch(multi, /at least two independent bounded workstreams/i, 'Responses Multi-agent needs a decomposition gate');
    requireMatch(multi, /share its selected model and tools/i, 'Responses Multi-agent must not promise heterogeneous workers');
    requireMatch(multi, /one final[\s\S]{0,40}synthesis/i, 'root must own final synthesis');
    requireMatch(codex, /independent bounded packages/i, 'Codex needs bounded subagent packets');
    requireMatch(codex, /deeper single-agent[\s\S]{0,80}hard sequential/i, 'Codex must preserve the single-agent fallback');
    requireMatch(codex, /community benchmark snapshot[\s\S]{0,80}universal ranking/i, 'Codex economy guidance must stay benchmark-scoped');
    assert(!/gpt-5\.6-(?:sol|terra|luna)/i.test(`${sources.skill}\n${sources.profileIndex}\n${sources.profiles}`), 'GPT-5.6 model IDs must remain registry-owned');
    assert(!/gpt-5\.6-pro/i.test(`${sources.skill}\n${sources.profileIndex}\n${sources.profiles}`), 'runtime must not invent a GPT-5.6 Pro slug');
    requireMatch(sources.profileIndex, /ChatGPT Chat \/ Work[\s\S]{0,240}route: `chatgpt`/i, 'profile index missing ChatGPT route');
    requireMatch(sources.profileIndex, /OpenAI API[\s\S]{0,240}route: `openai-api`/i, 'profile index missing OpenAI API route');
    requireMatch(sources.profileIndex, /\| \*\*Codex\*\*[\s\S]{0,240}coding-agents[\s\S]{0,120}route: `codex`/i, 'profile index missing Codex route');
  },

  function hookContextContract() {
    for (const pattern of [
      /Agentic Prompt Fragments/,
      /default to a single loop/i,
      /scoped packet with objective, inputs, allowed tools, trust boundaries, output[\s\S]{0,80}schema, budget, forbidden actions, and evidence rules/i,
      /worker messages[\s\S]{0,80}tool output as untrusted data/i,
      /Parallelize only independent read-only work[\s\S]{0,120}serialize[\s\S]{0,80}writes and external side effects/i,
      /vendor-managed swarm[\s\S]{0,320}do NOT design a topology,[\s\S]{0,80}agent count,[\s\S]{0,80}worker packets/i,
      /external-action approvals/i,
    ]) {
      requireMatch(sources.hook, pattern, `hook context missing ${pattern}`);
    }
  },

  function releaseCriticalCiAndPackageContracts() {
    requireMatch(sources.ci, /^permissions:\s*\n\s+contents:\s*read\s*$/m, 'CI permissions must be contents: read');
    requireMatch(sources.ci, /os:\s*\[ubuntu-24\.04, windows-2025\]/, 'strict CI matrix must pin Ubuntu and Windows images');
    requireMatch(sources.ci, /runs-on:\s*\$\{\{\s*matrix\.os\s*\}\}/, 'strict CI job must run on the pinned OS matrix');
    requireMatch(sources.ci, /runs-on:\s*macos-15\b/, 'portable layout runner must pin macOS');
    requireMatch(sources.ci, /timeout-minutes:\s*10\b/, 'CI job needs a timeout');
    requireMatch(sources.ci, /node-version:\s*22\.17\.0\b/, 'CI Node version must be exact');
    const actionRefs = [...sources.ci.matchAll(/^\s*uses:\s*\S+@([^\s#]+)/gm)].map((match) => match[1]);
    assert(actionRefs.length >= 2, 'CI must use checkout and setup-node actions');
    for (const ref of actionRefs) assert(/^[0-9a-f]{40}$/.test(ref), `CI action is not pinned to a full SHA: ${ref}`);

    const manifest = JSON.parse(sources.runtimeManifest);
    assert(manifest.schema_version === '1.0.0', 'runtime manifest schema_version mismatch');
    assert(manifest.root === 'plugins/prompt-master/skills/prompt-master', 'runtime manifest root mismatch');
    assert(manifest.files.length === 44, `runtime manifest must contain exactly 44 frozen files, got ${manifest.files.length}`);
    assert(JSON.stringify([...manifest.files].sort()) === JSON.stringify(manifest.files), 'runtime manifest files must be sorted');
    assert(new Set(manifest.files).size === manifest.files.length, 'runtime manifest files must be unique');
    const runtimeRoot = path.join(repoRoot, manifest.root);
    function listRuntime(dir) {
      return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const absolute = path.join(dir, entry.name);
        return entry.isDirectory() ? listRuntime(absolute) : [path.relative(runtimeRoot, absolute).replace(/\\/g, '/')];
      });
    }
    assert(JSON.stringify(listRuntime(runtimeRoot).sort()) === JSON.stringify(manifest.files), 'runtime manifest must match the exact source tree');
    assert(!/Compress-Archive/i.test(sources.packagePs1), 'package must not use wildcard Compress-Archive');
    requireMatch(sources.packagePs1, /runtime-manifest\.json/i, 'package must read the tracked runtime manifest');
    requireMatch(sources.packagePs1, /ConvertFrom-Json/i, 'package must parse the runtime manifest');
    requireMatch(sources.packagePs1, /Contains\('\*'\)[\s\S]{0,100}Fail/i, 'package must reject wildcard manifest entries');
    requireMatch(sources.packagePs1, /foreach \(\$relativePath in \$runtimeFiles\)/i, 'ZIP entries must be created from the exact allowlist');
    requireMatch(sources.packagePs1, /git -C \$repoRoot status --porcelain=v1 --untracked-files=all/i, 'package must inspect runtime dirty state');
    requireMatch(sources.packagePs1, /\$dirtyLines\.Count -gt 0 -and -not \$AllowDirty/i, 'dirty runtime must fail by default');
    requireMatch(sources.packagePs1, /\$Upload -and \$AllowDirty[\s\S]{0,80}Fail/i, '-AllowDirty must remain local-only');
    requireMatch(sources.packagePs1, /\.sha256/i, 'package must create a SHA-256 sidecar');
    requireMatch(
      sources.packagePs1,
      /System\.Security\.Cryptography\.SHA256[\s\S]{0,200}OpenRead\(\$zipPath\)[\s\S]{0,200}ComputeHash\(\$shaStream\)/i,
      'package must hash the ZIP stream with SHA-256'
    );
    requireMatch(sources.packagePs1, /LastWriteTime\s*=\s*\[DateTimeOffset\]::new\(1980,/i, 'ZIP timestamps must be deterministic');
    requireMatch(sources.packagePs1, /ZIP\/source parity mismatch/i, 'package must compare every ZIP entry with its source');
    requireMatch(sources.packagePs1, /ComputeHash\(\$entryStream\)[\s\S]{0,200}ComputeHash\(\$sourceStream\)/i, 'package parity must hash entry and source bytes');
    requireMatch(sources.packagePs1, /gh release upload \$tag \$zipPath \$shaPath/i, 'release upload must include ZIP and SHA-256 sidecar');
    assert(!/codex\s+plugin\s+add/i.test(sources.packagePs1), 'Claude ZIP packaging must not claim Codex plugin installation');

    const codexManifest = JSON.parse(sources.codexManifest);
    assert(codexManifest.name === 'prompt-master', 'Codex manifest name mismatch');
    assert(/^\d+\.\d+\.\d+$/.test(codexManifest.version || ''), 'Codex manifest version must be semantic');
    assert(codexManifest.skills === './skills/', "Codex manifest skills must be './skills/'");
    requireMatch(sources.codexLayoutTest, /validateCodexSkill\(/, 'Codex layout test must validate skill frontmatter independently');
    requireMatch(sources.codexLayoutTest, /fields must be exactly name and description/, 'Codex layout test must reject unsupported frontmatter fields');
    requireMatch(sources.codexLayoutTest, /plain-text or symlink entries are forbidden/, 'Codex layout test must reject a plain-text symlink checkout');
    requireMatch(sources.codexLayoutTest, /canonical link escapes repository root/, 'Codex layout test must reject escaping locator links');
    requireMatch(sources.codexLayoutTest, /no copied runtime\/references/, 'Codex layout test must reject duplicate runtime copies');
    requireMatch(sources.codexLayoutTest, /createHash\('sha256'\)/, 'Codex layout test must hash every runtime surface');
    requireMatch(sources.codexHookTest, /Claude and Codex fixtures must produce equivalent output/, 'Codex hook test must enforce cross-host output equivalence');
    requireMatch(sources.codexHookTest, /advisory hook must exit zero/, 'Codex hook test must enforce advisory exit zero');
    requireMatch(sources.bumpVersionPs1, /\.codex-plugin\/plugin\.json/, 'version bump must include Codex manifest');
    assert(!/SKILL\.md frontmatter \(only first|В SKILL\.md нет frontmatter 'version:'/.test(sources.bumpVersionPs1), 'version bump must not add unsupported Codex SKILL version frontmatter');

    requireMatch(sources.lintJs, /require\('\.\/validate-registry'\)/, 'JS lint must use the canonical registry validator');
    requireMatch(sources.lintJs, /require\('\.\/validate-runtime-inventory'\)/, 'JS lint must use the canonical runtime inventory validator');
    requireMatch(sources.lintJs, /require\('\.\/validate-patterns'\)/, 'JS lint must use the canonical pattern validator');
    requireMatch(sources.lintJs, /validateRegistry\(\)/, 'JS lint must execute registry validation');
    requireMatch(sources.lintJs, /validatePatterns\(\)/, 'JS lint must execute pattern validation');
    requireMatch(sources.lintPs1, /Join-Path \$PSScriptRoot 'lint\.js'/, 'PowerShell lint must resolve canonical JS lint');
    requireMatch(sources.lintPs1, /& node \$lintJs/, 'PowerShell lint must delegate to the identical JS lint');
    requireMatch(sources.lintPs1, /exit \$code/, 'PowerShell lint must preserve the canonical lint exit result');
    requireMatch(sources.safeTest, /args:\s*\['scripts\/test-registry\.js'\]/, 'strict safe gate must include registry mutation tests');
    requireMatch(sources.safeTest, /args:\s*\['scripts\/test-patterns\.js'\]/, 'strict safe gate must include pattern mutation tests');
    requireMatch(sources.safeTest, /args:\s*\['scripts\/test-pattern-routing\.js'\]/, 'strict safe gate must include pattern routing tests');
    requireMatch(sources.safeTest, /args:\s*\['scripts\/test-pattern-package\.js'\]/, 'strict safe gate must include pattern package tests');
    requireMatch(sources.safeTest, /args:\s*\['scripts\/test-runtime-inventory\.js'\]/, 'strict safe gate must include runtime inventory mutation tests');
    requireMatch(sources.safeTest, /args:\s*\['scripts\/test-codex-layout\.js'\]/, 'strict safe gate must include Codex layout tests');
    requireMatch(sources.safeTest, /args:\s*\['scripts\/test-codex-hook\.js'\]/, 'strict safe gate must include Codex hook tests');
    requireMatch(sources.patternsValidator, /tombstone status[\s\S]{0,80}requires redirect_to/, 'pattern validator must fail closed on tombstones without redirects');
    requireMatch(sources.patternsValidator, /expected exactly one Markdown section/, 'pattern validator must enforce index-to-anchor traceability');
    requireMatch(sources.patternsTest, /duplicate-id[\s\S]{0,160}duplicate-legacy-id|duplicateId[\s\S]{0,160}duplicateLegacyId/, 'pattern tests must mutate duplicate canonical and legacy IDs');
    requireMatch(sources.patternRoutingTest, /everyLegacyIdResolvesAndLoads/, 'pattern routing test must resolve and load every legacy ID');
    requireMatch(sources.patternPackageTest, /stagedBytesMatchSources/, 'pattern package test must compare staged and source bytes');
    requireMatch(sources.registryValidator, /explicitAnchors[\s\S]{0,240}<a\\s\+\(\?:id\|name\)/, 'Markdown link validation must recognize explicit id/name anchors');
    requireMatch(sources.registryValidator, /patternsDir[\s\S]{0,240}filter\(\(item\) => item\.endsWith\('\.md'\)\)/, 'Markdown link inventory must include pattern shards');
    assert(semanticContracts.evidence_class === 'recorded-source-contract', 'semantic contracts must be labeled recorded-source-contract');
    assert(semanticContracts.live_behavior === false, 'semantic contracts must not claim live behavior');
    assert(/not live model behavior or behavioral attestation/i.test(semanticContracts.notice), 'semantic contracts must disclose the behavioral boundary');
    for (const contract of semanticContracts.contracts) {
      assert(/^PARCH-E2E-0[2-5]-RECORDED$/.test(contract.id), `invalid recorded semantic contract ID ${contract.id}`);
      const body = patternSection(read(contract.file), contract.pattern_id);
      for (const fragment of contract.must_include || []) {
        assert(body.includes(fragment), `${contract.id}: missing recorded source fragment '${fragment}'`);
      }
      for (const fragment of contract.must_not_include || []) {
        assert(!body.includes(fragment), `${contract.id}: forbidden recorded source fragment '${fragment}'`);
      }
    }
  },
];

let failed = 0;
for (const testCase of cases) {
  try {
    testCase();
  } catch (error) {
    failed++;
    console.error(`FAIL ${testCase.name}: ${error.message}`);
  }
}

if (failed) {
  console.error(`\n${failed}/${cases.length} source contract tests failed`);
  process.exitCode = 1;
} else {
  console.log(`OK: ${cases.length}/${cases.length} source contract tests passed`);
}
