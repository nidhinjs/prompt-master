#!/usr/bin/env node
// Release-gate lint for prompt-master. Node is the canonical CI path; lint.ps1 is legacy.

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const p = (...parts) => path.join(repoRoot, ...parts);

const files = {
  pluginJson: p('plugins/prompt-master/.claude-plugin/plugin.json'),
  skillMd: p('plugins/prompt-master/skills/prompt-master/SKILL.md'),
  changelogMd: p('CHANGELOG.md'),
  patternsMd: p('plugins/prompt-master/skills/prompt-master/references/patterns.md'),
  marketplaceJson: p('.claude-plugin/marketplace.json'),
  readmeMd: p('README.md'),
  readmeRuMd: p('README.ru.md'),
  installMd: p('docs/installation.md'),
  templatesMd: p('plugins/prompt-master/skills/prompt-master/references/templates.md'),
  toolProfilesMd: p('plugins/prompt-master/skills/prompt-master/references/tool-profiles.md'),
  modelsMd: p('plugins/prompt-master/skills/prompt-master/references/models.md'),
  goldenJson: p('tests/golden/scenarios.json'),
};

const errors = [];
const warnings = [];
const SKILL_BODY_BUDGET = 250;

function rel(abs) {
  return path.relative(repoRoot, abs).replace(/\\/g, '/');
}

function read(file) {
  if (!fs.existsSync(file)) {
    errors.push(`Required file not found: ${rel(file)}`);
    return '';
  }
  return fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
}

function githubAnchor(heading) {
  return heading
    .toLowerCase()
    .replace(/[^\p{L}\p{Nd} -]/gu, '')
    .replace(/ /g, '-');
}

function unique(arr) {
  return [...new Set(arr)];
}

function matches(text, rx, group = 1) {
  return [...text.matchAll(rx)].map((m) => m[group]);
}

function section(text, heading) {
  const lines = text.split('\n');
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start === -1) return '';
  const out = [];
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out.join('\n');
}

function getTemplateRefs(text) {
  const refs = [];
  for (const m of text.matchAll(/Template[s]?\s+((?:[A-Z]\b[,\s]*(?:and\s+|или\s+)?)+)/g)) {
    refs.push(...matches(m[1], /\b([A-Z])\b/g));
  }
  return unique(refs).sort();
}

function log(name) {
  console.log(`Checking ${name}...`);
}

const pluginText = read(files.pluginJson);
const skillText = read(files.skillMd);
const clText = read(files.changelogMd);
const patText = read(files.patternsMd);
const marketText = read(files.marketplaceJson);
const readmeText = read(files.readmeMd);
const readmeRuText = read(files.readmeRuMd);
const installText = read(files.installMd);
const tplText = read(files.templatesMd);
const profText = read(files.toolProfilesMd);
const modelsText = read(files.modelsMd);
const goldenText = read(files.goldenJson);

log('version consistency');
const pluginVersion = pluginText.match(/"version"\s*:\s*"(\d+\.\d+\.\d+)"/)?.[1];
const skillVersion = skillText.match(/^version:\s*(\S+)/m)?.[1];
const changelogVersion = clText.match(/^##\s*\[(\d+\.\d+\.\d+)\]/m)?.[1];
if (!pluginVersion) errors.push("Cannot parse 'version' from plugin.json");
if (!skillVersion) errors.push("Cannot parse 'version:' from SKILL.md frontmatter");
if (!changelogVersion) errors.push("Cannot find a version heading in CHANGELOG.md");
if (pluginVersion && skillVersion && pluginVersion !== skillVersion) {
  errors.push(`Version mismatch: plugin.json=${pluginVersion} vs SKILL.md=${skillVersion}`);
}
if (pluginVersion && changelogVersion && pluginVersion !== changelogVersion) {
  errors.push(`Version mismatch: plugin.json=${pluginVersion} vs CHANGELOG.md latest heading=${changelogVersion}`);
}
if (pluginVersion) console.log(`  version = ${pluginVersion}`);

log('SKILL.md frontmatter fields');
for (const field of ['name', 'version', 'description']) {
  if (!new RegExp(`^${field}:\\s*\\S`, 'm').test(skillText)) {
    errors.push(`SKILL.md frontmatter missing required field: '${field}'`);
  }
}

log('pattern count consistency');
const patCount = patText.match(/^(\d+)\s+patterns/m)?.[1];
if (!patCount) {
  errors.push("Cannot read pattern count from patterns.md header");
} else {
  console.log(`  pattern count from patterns.md = ${patCount}`);
  for (const [name, text] of [
    ['SKILL.md', skillText],
    ['plugin.json', pluginText],
    ['marketplace.json', marketText],
    ['README.md', readmeText],
  ]) {
    if (!text.includes(patCount)) errors.push(`Pattern count ${patCount} not found in ${name}`);
  }
  for (const [name, text] of [
    ['README.ru.md', readmeRuText],
    ['docs/installation.md', installText],
  ]) {
    const m = text.match(/(\d+)\s+паттерн/);
    if (m && m[1] !== patCount) errors.push(`Pattern count drift in ${name}: says ${m[1]} instead of ${patCount}`);
  }
}

log('CRLF line endings in tracked *.md and *.ps1');
function collectTextFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'dist' || entry.name === 'node_modules') continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectTextFiles(abs));
    else if (/\.(md|ps1)$/i.test(entry.name)) out.push(abs);
  }
  return out;
}
for (const abs of collectTextFiles(repoRoot)) {
  if (fs.readFileSync(abs).includes(Buffer.from('\r\n'))) {
    errors.push(`CRLF line endings detected in: ${rel(abs)}`);
  }
}

log('SKILL.md body line count');
const lines = skillText.split('\n');
let dashCount = 0;
let fmEnd = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === '---' && ++dashCount === 2) {
    fmEnd = i;
    break;
  }
}
const bodyLines = fmEnd >= 0 ? lines.length - fmEnd - 1 : lines.length;
console.log(`  SKILL.md body = ${bodyLines} lines (budget: ${SKILL_BODY_BUDGET})`);
if (bodyLines > SKILL_BODY_BUDGET) warnings.push(`SKILL.md body is ${bodyLines} lines (budget: ${SKILL_BODY_BUDGET}) - review for bloat`);

log('CHANGELOG footer link');
if (changelogVersion && !new RegExp(`^\\[${changelogVersion.replace(/\./g, '\\.')}\\]:\\s*https?://`, 'm').test(clText)) {
  warnings.push(`CHANGELOG.md: no footer release link for [${changelogVersion}]`);
}

log('templates.md ToC sync');
const tocAnchors = matches(tplText, /^\|\s*\[[^\]]+\]\(#([^)]+)\)/gm);
const headingAnchors = new Set();
const h2Anchors = [];
let inFence = false;
for (const line of tplText.split('\n')) {
  if (/^\s*```/.test(line)) {
    inFence = !inFence;
    continue;
  }
  if (inFence) continue;
  const m = line.match(/^(#{2,3})\s+(.+?)\s*$/);
  if (m) {
    const anchor = githubAnchor(m[2]);
    headingAnchors.add(anchor);
    if (m[1] === '##') h2Anchors.push(anchor);
  }
}
for (const anchor of tocAnchors) {
  if (!headingAnchors.has(anchor)) errors.push(`templates.md ToC links to '#${anchor}' but no such heading exists`);
}
for (const anchor of h2Anchors) {
  if (anchor !== 'table-of-contents' && !tocAnchors.includes(anchor)) {
    errors.push(`templates.md section '#${anchor}' is missing from the Table of Contents`);
  }
}

log('Template / pattern cross-references');
const skillFiles = {
  'SKILL.md': skillText,
  'tool-profiles.md': profText,
  'templates.md': tplText,
  'patterns.md': patText,
};
const definedTemplates = matches(tplText, /^##\s+Template\s+([A-Z])\b/gm);
for (const [name, text] of Object.entries(skillFiles)) {
  for (const ref of getTemplateRefs(text)) {
    if (!definedTemplates.includes(ref)) errors.push(`${name} references 'Template ${ref}' but templates.md has no such section`);
  }
}
const outsideRefs = getTemplateRefs([skillText, profText, patText].join('\n'));
for (const template of definedTemplates) {
  if (template >= 'G' && !outsideRefs.includes(template)) {
    warnings.push(`templates.md 'Template ${template}' is never referenced from SKILL.md / tool-profiles.md / patterns.md`);
  }
}
const definedPatterns = matches(patText, /^\|\s*(\d+)\s*\|/gm);
for (const [name, text] of Object.entries(skillFiles)) {
  for (const ref of unique(matches(text, /pattern\s+#(\d+)/g))) {
    if (!definedPatterns.includes(ref)) errors.push(`${name} references 'pattern #${ref}' but patterns.md has no row | ${ref} |`);
  }
}

log('no-CoT list consistency');
const noCotLine = skillText.match(/^.*Canonical no-CoT list[^:]*:\**\s*(.+)$/m)?.[1];
if (!noCotLine) {
  errors.push("SKILL.md: cannot find the 'Canonical no-CoT list' hard rule");
} else {
  const models = noCotLine.split(/\.\s+Also/)[0].split(',').map((s) => s.trim()).filter(Boolean);
  for (const model of models) {
    if (!tplText.includes(model)) errors.push(`no-CoT drift: '${model}' is in SKILL.md but missing from templates.md (Template E)`);
  }
  console.log(`  canonical no-CoT list: ${models.length} models`);
}

log('knob-tool enumerations');
for (const [name, text] of Object.entries(skillFiles)) {
  if (/Grok,\s*image-AI\)/.test(text) || /Grok\/image-AI\)/.test(text)) {
    errors.push(`${name}: knob-tool list ends at 'image-AI' - video-AI is missing`);
  }
}

log('Routing Index tie-breaks');
if ((profText.match(/^\|.*Comet.*\|$/gm) || []).length >= 2 && !/tie-?break/i.test(profText)) {
  errors.push("tool-profiles.md: 'Comet' appears in multiple routing rows but no tie-break note exists");
}

log('models.md last-verified staleness');
const today = new Date();
let currentSection = 'top';
for (const line of modelsText.split('\n')) {
  const h = line.match(/^##\s+(.+?)\s*$/);
  if (h) currentSection = h[1];
  const v = line.match(/last-verified:\s*(\d{4}-\d{2}-\d{2})/);
  if (v) {
    const age = Math.floor((today - new Date(`${v[1]}T00:00:00Z`)) / 86400000);
    if (age > 60) warnings.push(`models.md section '${currentSection}': last-verified ${v[1]} is ${age} days old (>60)`);
  }
}

log('single-source status facts');
for (const [name, text] of Object.entries(skillFiles)) {
  if (text.includes('2026-06-12')) {
    errors.push(`${name}: suspension date 2026-06-12 duplicated outside models.md - reference models.md instead`);
  }
}

log('Fable promotional access facts');
const anthropic = section(modelsText, '## Anthropic — Claude');
if (!/2026-07-12|July 12, 2026/.test(anthropic) || !/11:59:59 PM PT|23:59:59 PT/.test(anthropic)) {
  errors.push('models.md Anthropic section: Fable promo deadline must be July 12, 2026, 11:59:59 PM PT');
}
if (/2026-07-07|07-07/.test(anthropic)) {
  errors.push('models.md Anthropic section: stale Fable promo deadline 2026-07-07/07-07 is still presented as current');
}
for (const rx of [/API usage.*separately|API.*standard API rates/i, /Claude Code.*2\.1\.170/i, /50%.*weekly/i]) {
  if (!rx.test(anthropic)) errors.push(`models.md Anthropic section: missing Fable promo fact matching ${rx}`);
}

log('profile Traits');
const profiles = {};
let curHeader = null;
let curBody = [];
for (const line of profText.split('\n')) {
  const h = line.match(/^\*\*(.+?)\*\*/);
  if (h) {
    if (curHeader) profiles[curHeader] = curBody.join('\n');
    curHeader = h[1];
    curBody = [];
  } else if (curHeader) {
    curBody.push(line);
  }
}
if (curHeader) profiles[curHeader] = curBody.join('\n');
const findProfile = (needle) => Object.keys(profiles).find((h) => h.includes(needle));
const knobList = skillText.match(/settings-as-knobs tools \(([^)]+)\)/)?.[1];
if (!knobList) {
  errors.push("SKILL.md: cannot find the 'settings-as-knobs tools (...)' enumeration");
} else {
  const knobToolMap = {
    Gamma: 'Gamma',
    Perplexity: 'Perplexity',
    Grok: 'Grok (xAI',
    Advisor: 'Advisor Tool',
    'Advisor Tool': 'Advisor Tool',
    'image-AI': 'Image AI',
    'video-AI': 'Video AI',
  };
  for (const tool of knobList.split(',').map((s) => s.trim())) {
    const needle = knobToolMap[tool];
    const header = needle && findProfile(needle);
    if (!needle) errors.push(`lint's knob-tool map has no profile mapping for '${tool}' - extend knobToolMap in lint.js`);
    else if (!header) errors.push(`knob-tool '${tool}': no profile found in tool-profiles.md (looked for '${needle}')`);
    else if (!/^\*Traits:.*knobs/m.test(profiles[header])) errors.push(`knob-tool '${tool}': profile '${header}' has no '*Traits: ... knobs ...*' line`);
  }
}
if (noCotLine) {
  const noCotModels = noCotLine.split(/\.\s+Also/)[0].split(',').map((s) => s.trim()).filter(Boolean);
  const reasoningProfiles = Object.entries(profiles).filter(([, body]) => /^\*Traits:.*reasoning-native/m.test(body));
  for (const model of noCotModels) {
    const key = model.split(/[\s/]/)[0];
    const covered = reasoningProfiles.some(([header, body]) => header.includes(key) || body.includes(key));
    if (!covered) errors.push(`no-CoT model '${model}': no profile with a reasoning-native Traits line mentions '${key}'`);
  }
}

log('Advisor / Managed Agents model facts');
if (/\bAdvisor Tool\b/i.test(profText)) {
  for (const id of ['advisor-tool-2026-03-01', 'advisor_20260301']) {
    if (!modelsText.includes(id)) {
      errors.push(`tool-profiles.md mentions Advisor Tool but models.md is missing '${id}'`);
    }
  }
}
if (/\bManaged Agents\b/i.test(profText)) {
  if (!modelsText.includes('managed-agents-2026-04-01')) {
    errors.push("tool-profiles.md mentions Managed Agents but models.md is missing 'managed-agents-2026-04-01'");
  }
}

const advisorHeader = findProfile('Advisor Tool');
if (advisorHeader) {
  const body = profiles[advisorHeader];
  for (const rx of [/bounded|advisory|diagnostic/i, /evidence|file:line|cite/i, /not a second executor|Do the task yourself/i]) {
    if (!rx.test(body)) errors.push(`Advisor Tool profile missing guard matching ${rx}`);
  }
  if (/iterate until it passes/i.test(body)) errors.push('Advisor Tool profile must not frame Advisor as an autonomous executor');
}

const managedHeader = findProfile('Managed Agents');
if (managedHeader) {
  const body = profiles[managedHeader];
  for (const rx of [/Plan Big Execute Small/i, /worker contract|task ledger|handoff/i, /evidence|verification/i, /stop condition|human-review|approval/i]) {
    if (!rx.test(body)) errors.push(`Managed Agents profile missing guard matching ${rx}`);
  }
  if (/budget_tokens|thinking budget/i.test(body)) errors.push('Managed Agents profile must not hardcode thinking budgets');
}

log('golden scenario coverage');
try {
  const golden = JSON.parse(goldenText);
  const ids = (golden.scenarios || []).map((s) => s.id);
  const dupes = ids.filter((id, idx) => ids.indexOf(id) !== idx);
  for (const id of unique(dupes)) errors.push(`Duplicate golden scenario id: ${id}`);
  for (const id of [
    'advisor-before-substantive-work',
    'advisor-cost-knobs',
    'advisor-transcript-hygiene',
    'plan-big-execute-small',
    'premise-worker-before-fanout',
    'worker-contract-mirror',
    'delegation-granularity',
    'thread-usage-telemetry',
  ]) {
    if (!ids.includes(id)) errors.push(`Missing golden scenario: ${id}`);
  }
} catch (e) {
  errors.push(`Cannot parse tests/golden/scenarios.json: ${e.message}`);
}

console.log('');
if (errors.length) {
  console.error('Errors:');
  for (const e of errors) console.error(`  ERROR: ${e}`);
}
if (warnings.length) {
  console.warn('Warnings:');
  for (const w of warnings) console.warn(`  WARN:  ${w}`);
}
console.log('');
console.log(`Results: ${errors.length} error(s), ${warnings.length} warning(s)`);
if (errors.length) {
  console.error('FAILED');
  process.exit(1);
}
console.log('PASSED');
