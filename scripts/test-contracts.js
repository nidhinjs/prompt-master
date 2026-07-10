#!/usr/bin/env node
// Deterministic source contracts for security and provider-specific routing.
// Reads repository files only; no subprocesses, dependencies, or network calls.

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const read = (...parts) => fs.readFileSync(path.join(repoRoot, ...parts), 'utf8');
const sources = {
  skill: read('plugins/prompt-master/skills/prompt-master/SKILL.md'),
  agentic: read('plugins/prompt-master/skills/prompt-master/references/agentic.md'),
  models: read('plugins/prompt-master/skills/prompt-master/references/models.md'),
  templates: read('plugins/prompt-master/skills/prompt-master/references/templates.md'),
  profiles: read('plugins/prompt-master/skills/prompt-master/references/tool-profiles.md'),
  hook: read('plugins/prompt-master/hooks/multi-agent-detect.js'),
  ci: read('.github/workflows/ci.yml'),
  packagePs1: read('scripts/package-skill.ps1').replace(/^\uFEFF/, ''),
};

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
    const profile = between(
      sources.profiles,
      /^\*\*Perplexity \(Agent API/m,
      /^---\s*$/m,
      'Perplexity profile'
    );
    const model = markdownSection(sources.models, 'Perplexity');
    const template = markdownSection(sources.templates, 'Template N — Research Brief');
    const skill = sonarClauses(sources.skill);
    assert(skill, 'SKILL.md missing Sonar-specific clauses');
    for (const [name, text] of [
      ['SKILL.md', skill],
      ['profile', profile],
      ['model', model],
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
    const files = [
      ['SKILL.md', sources.skill],
      ['models.md', sources.models],
      ['templates.md', sources.templates],
      ['tool-profiles.md', sources.profiles],
    ];
    for (const [name, text] of files) {
      for (const line of text.split('\n')) {
        const incompatiblePair = /V8\.1/i.test(line) && /--o(?:ref|w)\b/i.test(line);
        if (!incompatiblePair) continue;
        const commandOrExample =
          /`[^`]*V8\.1[^`]*--o(?:ref|w)[^`]*`|`[^`]*--o(?:ref|w)[^`]*V8\.1[^`]*`/i.test(line) ||
          /\b(?:example|e\.g\.|parameters at end|assumed settings|prompt:)\b/i.test(line);
        assert(!commandOrExample, `${name} contains a V8.1 + Omni command/example: ${line.trim()}`);
        assert(
          hasExplicitOmniIncompatibility(line),
          `${name} mentions V8.1 with Omni flags without an explicit incompatibility statement: ${line.trim()}`
        );
      }
    }
    const combined = files.map(([, text]) => text).join('\n');
    requireMatch(combined, /V7[\s\S]{0,100}--oref|--v 7[\s\S]{0,100}--oref/i, 'missing V7 Omni Reference route');
    requireMatch(combined, /--oref[\s\S]{0,100}--ow|--ow[\s\S]{0,100}--oref/i, 'missing Omni weight route');
    assert(
      !hasExplicitOmniIncompatibility('Use --v 8.1 --oref ref.png --ow 100; never omit --ar.'),
      'unrelated guard wording must not excuse an Omni conflict'
    );
  },

  function grokTemplateJUsesPositiveConstraints() {
    const template = markdownSection(sources.templates, 'Template J — Reference Image Editing');
    const imageProfiles = between(sources.profiles, /^\*\*Image AI/m, /^---\s*$/m, 'Image AI profile');
    const imageModels = markdownSection(sources.models, 'Image AI — model facts');
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
      ['models.md Image AI', imageModels],
      ['tool-profiles.md Image AI', imageProfiles],
      ['Template I', templateI],
      ['Template J', template],
    ]) {
      assertNoGrokNegativeField(name, text);
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

    const unknown = textFrom(sources.profiles, /^\*\*Unknown tool:\*\*/m, 'Unknown tool section');
    requireMatch(unknown, /Capability fingerprint — all 7 fields are required/i, 'unknown tool fingerprint must have seven required fields');
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
    requireMatch(unknown, /Missing\/unreadable reference:/i, 'unknown routing must define missing-reference state');
    requireMatch(unknown, /Assumed target tool:[^\n]*\[unverified\]/i, 'unknown no-question fallback must surface unverified target');
    requireMatch(unknown, /Minimal capability-safe prompt for a missing reference/i, 'missing reference needs a minimal safe fallback');
    requireMatch(unknown, /label the reference unavailable[\s\S]{0,160}could not be verified/i, 'missing reference must surface unverified assumptions');
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
    requireMatch(sources.ci, /runs-on:\s*ubuntu-24\.04\b/, 'CI runner must be a pinned non-latest image');
    requireMatch(sources.ci, /timeout-minutes:\s*10\b/, 'CI job needs a timeout');
    requireMatch(sources.ci, /node-version:\s*22\.17\.0\b/, 'CI Node version must be exact');
    const actionRefs = [...sources.ci.matchAll(/^\s*uses:\s*\S+@([^\s#]+)/gm)].map((match) => match[1]);
    assert(actionRefs.length >= 2, 'CI must use checkout and setup-node actions');
    for (const ref of actionRefs) assert(/^[0-9a-f]{40}$/.test(ref), `CI action is not pinned to a full SHA: ${ref}`);

    const allowlist = between(sources.packagePs1, /^\$runtimeFiles\s*=\s*@\(/m, /^\)\s*$/m, 'runtime allowlist');
    const runtimeFiles = [...allowlist.matchAll(/'([^']+)'/g)].map((match) => match[1]);
    const expectedFiles = [
      'SKILL.md',
      'references/agentic.md',
      'references/models.md',
      'references/patterns.md',
      'references/templates.md',
      'references/tool-profiles.md',
    ];
    assert(JSON.stringify(runtimeFiles) === JSON.stringify(expectedFiles), 'package runtime allowlist must contain exactly six reviewed files');
    assert(!/Compress-Archive/i.test(sources.packagePs1), 'package must not use wildcard Compress-Archive');
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
    requireMatch(sources.packagePs1, /gh release upload \$tag \$zipPath \$shaPath/i, 'release upload must include ZIP and SHA-256 sidecar');
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
