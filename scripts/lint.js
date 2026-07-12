#!/usr/bin/env node
// Release-gate lint for prompt-master. Node is the canonical CI path; lint.ps1 is legacy.

const fs = require('fs');
const path = require('path');
const { validateRegistry } = require('./validate-registry');
const { validateRuntimeInventory } = require('./validate-runtime-inventory');
const { validatePatterns } = require('./validate-patterns');

const repoRoot = path.join(__dirname, '..');
const p = (...parts) => path.join(repoRoot, ...parts);

const files = {
  pluginJson: p('plugins/prompt-master/.claude-plugin/plugin.json'),
  codexPluginJson: p('plugins/prompt-master/.codex-plugin/plugin.json'),
  skillMd: p('plugins/prompt-master/skills/prompt-master/SKILL.md'),
  changelogMd: p('CHANGELOG.md'),
  patternsMd: p('plugins/prompt-master/skills/prompt-master/references/patterns.md'),
  marketplaceJson: p('.claude-plugin/marketplace.json'),
  readmeMd: p('README.md'),
  readmeRuMd: p('README.ru.md'),
  installMd: p('docs/installation.md'),
  agenticMd: p('plugins/prompt-master/skills/prompt-master/references/agentic.md'),
  templatesMd: p('plugins/prompt-master/skills/prompt-master/references/templates.md'),
  toolProfilesMd: p('plugins/prompt-master/skills/prompt-master/references/tool-profiles.md'),
  modelsMd: p('plugins/prompt-master/skills/prompt-master/references/models.md'),
  goldenJson: p('tests/golden/scenarios.json'),
  safeTestJs: p('scripts/test-safe.js'),
  contractsTestJs: p('scripts/test-contracts.js'),
  refreshChecklistMd: p('docs/REFRESH_CHECKLIST.md'),
};

const errors = [];
const warnings = [];
const SKILL_BODY_BUDGET = 250;
const profileDir = p('plugins/prompt-master/skills/prompt-master/references/profiles');
const patternDir = p('plugins/prompt-master/skills/prompt-master/references/patterns');

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
const codexPluginText = read(files.codexPluginJson);
const skillText = read(files.skillMd);
const clText = read(files.changelogMd);
const patText = read(files.patternsMd);
const marketText = read(files.marketplaceJson);
const readmeText = read(files.readmeMd);
const readmeRuText = read(files.readmeRuMd);
const installText = read(files.installMd);
const agenticText = read(files.agenticMd);
const tplText = read(files.templatesMd);
const profText = read(files.toolProfilesMd);
const modelsText = read(files.modelsMd);
const goldenText = read(files.goldenJson);
const safeTestText = read(files.safeTestJs);
const contractsTestText = read(files.contractsTestJs);
const refreshChecklistText = read(files.refreshChecklistMd);
const profileTexts = {};
if (!fs.existsSync(profileDir)) {
  errors.push('Required profile directory not found: references/profiles');
} else {
  for (const name of fs.readdirSync(profileDir).filter((entry) => entry.endsWith('.md')).sort()) {
    profileTexts[name] = read(path.join(profileDir, name));
  }
}
const profileText = Object.entries(profileTexts).map(([name, text]) => `\n<!-- ${name} -->\n${text}`).join('\n');
const patternTexts = {};
if (fs.existsSync(patternDir)) {
  for (const name of fs.readdirSync(patternDir).filter((entry) => entry.endsWith('.md')).sort()) {
    patternTexts[name] = read(path.join(patternDir, name));
  }
}
const patternText = Object.entries(patternTexts).map(([name, text]) => `\n<!-- ${name} -->\n${text}`).join('\n');

function registryDocuments() {
  const factsDir = p('plugins/prompt-master/skills/prompt-master/references/facts');
  const indexFile = path.join(factsDir, 'index.json');
  if (!fs.existsSync(indexFile)) return { index: null, records: [] };
  try {
    const index = JSON.parse(fs.readFileSync(indexFile, 'utf8'));
    const records = [];
    for (const shard of index.shards || []) {
      const file = path.join(factsDir, shard.path);
      if (fs.existsSync(file)) records.push(...(JSON.parse(fs.readFileSync(file, 'utf8')).records || []));
    }
    return { index, records };
  } catch (error) {
    return { index: null, records: [] };
  }
}
const registry = registryDocuments();

log('version consistency');
const pluginVersion = pluginText.match(/"version"\s*:\s*"(\d+\.\d+\.\d+)"/)?.[1];
const codexPluginVersion = codexPluginText.match(/"version"\s*:\s*"(\d+\.\d+\.\d+)"/)?.[1];
const changelogVersion = clText.match(/^##\s*\[(\d+\.\d+\.\d+)\]/m)?.[1];
if (!pluginVersion) errors.push("Cannot parse 'version' from Claude plugin.json");
if (!codexPluginVersion) errors.push("Cannot parse 'version' from Codex plugin.json");
if (!changelogVersion) errors.push("Cannot find a version heading in CHANGELOG.md");
if (pluginVersion && codexPluginVersion && pluginVersion !== codexPluginVersion) {
  errors.push(`Version mismatch: Claude plugin.json=${pluginVersion} vs Codex plugin.json=${codexPluginVersion}`);
}
if (pluginVersion && changelogVersion && pluginVersion !== changelogVersion) {
  errors.push(`Version mismatch: plugin.json=${pluginVersion} vs CHANGELOG.md latest heading=${changelogVersion}`);
}
if (pluginVersion) {
  for (const [name, text, pattern, label] of [
    ['README.md', readmeText, /Current release(?: candidate)?:\s*\*\*v(\d+\.\d+\.\d+)\*\*/, 'Current release[ candidate]'],
    ['README.ru.md', readmeRuText, /Текущий релиз(?:-кандидат)?:\s*\*\*v(\d+\.\d+\.\d+)\*\*/, 'Текущий релиз[-кандидат]'],
  ]) {
    const m = text.match(pattern);
    if (!m) errors.push(`${name}: cannot parse '${label}: **vX.Y.Z**' line`);
    else if (m[1] !== pluginVersion) errors.push(`${name}: current-release line says v${m[1]} instead of v${pluginVersion}`);
  }
}
if (pluginVersion) console.log(`  version = ${pluginVersion}`);

if (pluginVersion) {
  const packageText = read(p('scripts/package-skill.ps1'));
  if (!/\$zipName\s*=\s*"prompt-master-\$version\.zip"/.test(packageText)) {
    errors.push('scripts/package-skill.ps1: artifact name must be prompt-master-$version.zip');
  }
  const distDir = p('dist');
  if (fs.existsSync(distDir)) {
    const artifacts = new Set(fs.readdirSync(distDir));
    const zip = `prompt-master-${pluginVersion}.zip`;
    const sha = `${zip}.sha256`;
    if (artifacts.has(zip) !== artifacts.has(sha)) errors.push(`dist artifact pair incomplete for ${pluginVersion}: ZIP and SHA-256 sidecar must both exist`);
  }
  if (process.env.GITHUB_REF_TYPE === 'tag' && process.env.GITHUB_REF_NAME !== `v${pluginVersion}`) {
    errors.push(`Release tag mismatch: ${process.env.GITHUB_REF_NAME || '(missing)'} vs v${pluginVersion}`);
  }
}

log('SKILL.md frontmatter fields');
for (const field of ['name', 'description']) {
  if (!new RegExp(`^${field}:\\s*\\S`, 'm').test(skillText)) {
    errors.push(`SKILL.md frontmatter missing required field: '${field}'`);
  }
}
const frontmatter = skillText.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] || '';
const frontmatterFields = matches(frontmatter, /^([A-Za-z][A-Za-z0-9_-]*):/gm).sort();
if (JSON.stringify(frontmatterFields) !== JSON.stringify(['description', 'name'])) {
  errors.push(`SKILL.md Codex frontmatter fields must be exactly name and description, got ${frontmatterFields.join(', ') || '(none)'}`);
}

log('pattern registry and count consistency');
const patternResult = validatePatterns();
for (const error of patternResult.errors) errors.push(`patterns: ${error}`);
const patCount = patternResult.index ? String(patternResult.counts.entries) : null;
if (!patCount) {
  errors.push('Cannot read pattern count from patterns/index.json');
} else {
  console.log(`  patterns = ${patCount} indexed, ${patternResult.counts.active} active, ${patternResult.counts.tombstones} tombstone(s)`);
  const activeCount = patternResult.counts.active;
  if (!new RegExp(`preserves ${patCount} stable IDs?: ${activeCount} active patterns`, 'i').test(readmeText)) {
    errors.push(`README.md must state the exact pattern contract: ${patCount} stable IDs and ${activeCount} active patterns`);
  }
  if (!new RegExp(`сохраняет ${patCount} стабильн[^\\s]* ID: ${activeCount} активн`, 'i').test(readmeRuText)) {
    errors.push(`README.ru.md must state the exact pattern contract: ${patCount} stable IDs and ${activeCount} active patterns`);
  }
  if (!new RegExp(`${patCount} стабильн[^\\s]* ID \\(${activeCount} active \\+ PM-036 tombstone\\)`, 'i').test(installText)) {
    errors.push(`docs/installation.md must state the exact pattern contract: ${patCount} stable IDs and ${activeCount} active patterns`);
  }
  for (const [name, text] of [['plugin.json', pluginText], ['marketplace.json', marketText]]) {
    if (/\b\d+\s+(?:patterns?|паттерн(?:а|ов)?)\b/i.test(text)) {
      errors.push(`${name}: plugin metadata must remain pattern-count-free; the index owns counts`);
    }
  }
}

log('CRLF line endings in tracked *.md and *.ps1');
function collectTextFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'dist' || entry.name === 'external' || entry.name === 'node_modules') continue;
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
  'agentic.md': agenticText,
  'tool-profiles.md': profText,
  'templates.md': tplText,
  'patterns.md': patText,
  ...Object.fromEntries(Object.entries(patternTexts).map(([name, text]) => [`patterns/${name}`, text])),
  ...Object.fromEntries(Object.entries(profileTexts).map(([name, text]) => [`profiles/${name}`, text])),
};
const definedTemplates = matches(tplText, /^##\s+Template\s+([A-Z])\b/gm);
for (const [name, text] of Object.entries(skillFiles)) {
  for (const ref of getTemplateRefs(text)) {
    if (!definedTemplates.includes(ref)) errors.push(`${name} references 'Template ${ref}' but templates.md has no such section`);
  }
}
const outsideRefs = getTemplateRefs([skillText, profText, profileText, patText, patternText].join('\n'));
for (const template of definedTemplates) {
  if (template >= 'G' && !outsideRefs.includes(template)) {
    warnings.push(`templates.md 'Template ${template}' is never referenced from SKILL.md / tool-profiles.md / patterns.md`);
  }
}
const definedPatterns = (patternResult.index?.patterns || [])
  .filter((record) => Number.isInteger(record.legacy_id))
  .map((record) => String(record.legacy_id));
for (const [name, text] of Object.entries(skillFiles)) {
  for (const ref of unique(matches(text, /pattern\s+#(\d+)/g))) {
    if (!definedPatterns.includes(ref)) errors.push(`${name} references 'pattern #${ref}' but patterns/index.json has no legacy mapping`);
  }
}

log('canonical registry and routing graph');
const registryResult = validateRegistry();
for (const error of registryResult.errors) errors.push(`registry: ${error}`);
if (registryResult.ok) {
  console.log(`  shards=${registryResult.counts.shards} records=${registryResult.counts.records} routes=${registryResult.counts.routes} profiles=${registryResult.counts.profiles}`);
}

log('tracked runtime inventory');
const inventoryResult = validateRuntimeInventory();
for (const error of inventoryResult.errors) errors.push(`runtime inventory: ${error}`);
if (inventoryResult.ok) console.log(`  files=${inventoryResult.files.length}`);

log('registry-only volatile facts');
const evergreenConsumers = {
  'SKILL.md': skillText,
  'templates.md': tplText,
  'patterns.md': patText,
  ...Object.fromEntries(Object.entries(patternTexts).map(([name, text]) => [`patterns/${name}`, text])),
  ...Object.fromEntries(Object.entries(profileTexts).map(([name, text]) => [`profiles/${name}`, text])),
};
for (const record of registry.records) {
  if (!record.model_id || record.model_id.length < 3) continue;
  for (const [name, text] of Object.entries(evergreenConsumers)) {
    if (text.includes(record.model_id)) errors.push(`${name}: registry model_id '${record.model_id}' duplicated outside facts/**`);
  }
}
for (const [name, text] of Object.entries({
  'SKILL.md': skillText,
  'templates.md': tplText,
  'patterns.md': patText,
  ...Object.fromEntries(Object.entries(patternTexts).map(([name, text]) => [`patterns/${name}`, text])),
})) {
  if (/Canonical no-CoT list/i.test(text)) errors.push(`${name}: enumerated no-CoT membership is forbidden; use prompting_constraints.no_cot`);
}
for (const [label, rx] of [
  ['ComfyUI checkpoint/version examples', /\b(?:SD\s*1\.5|SDXL|SD\s*3\.5|FLUX\.2)\b/i],
  ['ComfyUI token/settings defaults', /\b75 tokens\b|Euler a|CFG(?: SCALE)?\s*:?\s*7|steps?\s*:?\s*20\s*[-–]\s*30|divisible by 64/i],
  ['Gamma mode/density enums', /Paste[- ]in[- ]text|Minimal\s*\/\s*Concise\s*\/\s*Detailed/i],
  ['Gamma delimiter/default examples', /\\n---\\n|Stock recommended|10 cards\s*[·|]/i],
]) {
  if (rx.test(tplText)) errors.push(`templates.md duplicates volatile ${label}; use registry/local capability placeholders`);
}
for (const [name, rx] of [
  ['generic registry lookup', /resolve (?:the target|candidates|candidates\/default|candidates and any default)[\s\S]{0,240}facts\/index\.json/i],
  ['one primary bundle', /exactly[^\n]{0,80}one primary profile bundle/i],
  ['one composite add-on', /explicit composite[\s\S]{0,80}at most one add-on bundle/i],
  ['no-CoT registry constraint', /prompting_constraints[\s\S]{0,120}no_cot/i],
  ['latest public production', /`latest` means public production unless[\s\S]{0,80}preview/i],
  ['fail-closed registry fallback', /Missing, ambiguous, stale, orphaned, or ineligible registry data fails closed/i],
]) {
  if (!rx.test(skillText)) errors.push(`SKILL.md missing routing contract: ${name}`);
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

log('split profile contracts');
const knobList = skillText.match(/settings-as-knobs tools \(([^)]+)\)/)?.[1];
if (!knobList) {
  errors.push("SKILL.md: cannot find the 'settings-as-knobs tools (...)' enumeration");
} else {
  for (const tool of knobList.split(',').map((s) => s.trim())) {
    const display = tool.replace('-AI', ' AI');
    if (!new RegExp(display.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(`${profText}\n${profileText}`)) {
      errors.push(`knob-tool '${tool}': no split-profile routing/guidance found`);
    }
  }
  if (!/Assumed settings:/i.test(profileText)) errors.push('split profiles must surface defaulted knobs with an Assumed settings note');
}

log('GLM / Z.AI coverage');
const glmRecords = registry.records.filter((record) => record.vendor === 'zai-bigmodel');
if (!glmRecords.length) errors.push('facts registry: missing Z.AI / BigModel records');
const glmProfile = section(profileTexts['hosted-text.md'] || '', '## Z.AI / BigModel GLM');
if (!/^\| \*\*Z\.AI \/ BigModel GLM\*\* \|.*(?:GLM|Z\.AI|Zhipu|BigModel)/m.test(profText)) {
  errors.push("tool-profiles.md: Routing Index missing 'Z.AI / BigModel GLM' row");
}
for (const rx of [
  /model\/default resolution belongs to the registry/i,
  /(?:Enable[\s\S]{0,80}reasoning mode|reasoning mode[\s\S]{0,40}enable)[\s\S]{0,160}disable/i,
  /tool schemas/i,
  /streaming reasoning[\s\S]{0,160}tool-call/i,
  /Preserve provider-required state/i,
  /structured-output control[\s\S]{0,100}schema[\s\S]{0,80}validation/i,
  /Do not\s+mix general and coding endpoints/i,
]) {
  if (!rx.test(glmProfile)) errors.push(`hosted-text GLM profile missing guard matching ${rx}`);
}
if (!glmRecords.some((record) => record.prompting_constraints?.includes('no_cot'))) errors.push('GLM fact records must encode no_cot membership');
for (const constraint of ['preserve_reasoning_content', 'structured_output_requires_prompt_contract']) {
  if (!glmRecords.some((record) => record.prompting_constraints?.includes(constraint))) errors.push(`GLM fact records missing ${constraint}`);
}
for (const key of ['reasoning_effort_values', 'preserve_thinking', 'streaming_requirements', 'structured_output', 'endpoint']) {
  if (!glmRecords.some((record) => record.claims?.some((claim) => claim.key === key))) errors.push(`GLM fact records missing claim ${key}`);
}
if (/settings-as-knobs tools \([^)]*\bGLM\b/i.test(skillText)) {
  errors.push('SKILL.md: do not add GLM to global settings-as-knobs list; handle thinking/search in the GLM profile');
}

log('agentic runtime safety');
if (!/\[references\/agentic\.md\]\(references\/agentic\.md\)/.test(skillText)) {
  errors.push('SKILL.md: missing routing/reference link to references/agentic.md');
}
for (const heading of [
  '# Agentic Runtime Safety',
  '## Risk Ladder',
  '## Intent Flags',
  '## Preview/Draft/Commit',
  '## Policy/Owner Reviewer',
  '## No Model Self-Approval',
  '## Single-Agent Default',
  '## Routing Map',
]) {
  const rx = new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm');
  if (!rx.test(agenticText)) errors.push(`agentic.md missing heading: ${heading}`);
}
for (const [name, rx] of [
  ['risk ladder R0-R6', /\bR0\b[\s\S]*\bR6\b/],
  ['intent flag: delete', /\b(delete|destructive)\b/i],
  ['intent flag: deploy', /\bdeploy\b/i],
  ['intent flag: prod/sensitive data', /\b(prod|production data|sensitive_data)\b/i],
  ['preview/draft/commit split', /\bpreview\b[\s\S]{0,200}\bdraft\b[\s\S]{0,200}\bcommit\b/i],
  ['policy reviewer evidence', /\bPolicy\/Owner Reviewer\b[\s\S]{0,500}\bevidence\b/i],
  ['external approval boundary', /\b(human|harness|owner|external)\b[\s\S]{0,300}\bapproval\b/i],
  ['no self approval', /\b(No Model Self-Approval|self-approval|self-approve)\b[\s\S]{0,500}\b(cannot|must not|never)\b/i],
  ['single-agent default', /\bsingle-agent default\b/i],
  ['narrow tool preference', /\bnarrow\w*\b[\s\S]{0,200}\bbroad\b/i],
]) {
  if (!rx.test(agenticText)) errors.push(`agentic.md missing ${name} guard`);
}

log('candidate / variant set policy');
const runtimeFiles = {
  'SKILL.md': skillText,
  'templates.md': tplText,
  'patterns.md': patText,
  ...Object.fromEntries(Object.entries(patternTexts).map(([name, text]) => [`patterns/${name}`, text])),
  'tool-profiles.md': profText,
  'agentic.md': agenticText,
  ...Object.fromEntries(Object.entries(profileTexts).map(([name, text]) => [`profiles/${name}`, text])),
};
for (const [name, text] of Object.entries(runtimeFiles)) {
  if (/Verbalized Sampling/i.test(text)) errors.push(`${name}: runtime files must not expose Verbalized Sampling branding`);
  if (/\bprobabilit(?:y|ies)\s*[:=]|"probability"|probability band/i.test(text)) {
    errors.push(`${name}: runtime files must not use probability labels for candidate sets`);
  }
}
const candidateFragment = tplText.match(/^### Candidate \/ Variant Set Fragment\s*$([\s\S]*?)(?=^---\s*$)/m)?.[1] || '';
if (!candidateFragment) {
  errors.push('templates.md missing Candidate / Variant Set Fragment');
} else {
  for (const [label, rx] of [
    ['Variant label', /Variant \[A-C\]/],
    ['Fit label', /^- Fit:/m],
    ['Risk / tradeoff label', /^- Risk \/ tradeoff:/m],
    ['When to use label', /^- When to use:/m],
    ['single fenced output block', /one fenced output block/i],
  ]) {
    if (!rx.test(candidateFragment)) errors.push(`templates.md Candidate / Variant Set Fragment missing ${label}`);
  }
  for (const rx of [/\bReasoning\s*:/i, /\bRationale\s*:/i, /<thinking>/i, /chain[ -]of[ -]thought/i]) {
    if (rx.test(candidateFragment)) errors.push(`templates.md Candidate / Variant Set Fragment contains forbidden field/pattern: ${rx}`);
  }
}
const pattern56 = patternText.match(/^##\s+PM-056\b[\s\S]*?(?=^##\s+PM-|(?![\s\S]))/m)?.[0] || '';
if (!/fit/i.test(pattern56) || !/risk \/ tradeoff/i.test(pattern56)) {
  errors.push('PM-056 must include fit and risk / tradeoff labels');
}
for (const [name, rx] of [
  ['explicit opt-in variants', /explicitly asks for variants\/alternatives\/options\/directions\/multiple prompts/i],
  ['single-fence output', /single fenced prompt block/i],
  ['default one prompt', /emit one final prompt unless variants were explicitly requested/i],
  ['high-risk suppression', /Do not use variants for credentials, auth\/security, migrations, production\/deploy, database writes, destructive actions, or R5\/R6 work/i],
]) {
  if (!rx.test(skillText)) errors.push(`SKILL.md missing candidate-set policy: ${name}`);
}
if (!/For R5\/R6 work[\s\S]{0,160}do not generate\s+divergent executable variants/i.test(agenticText)) {
  errors.push('agentic.md missing R5/R6 no executable variants guard');
}

log('public docs claim hygiene');
const publicDocs = [
  ['README.md', readmeText],
  ['README.ru.md', readmeRuText],
  ['docs/installation.md', installText],
];
for (const [name, text] of publicDocs) {
  for (const rx of [/1\.6-2\.1x/i, /25\.7%/, /mode collapse/i, /Verbalized Sampling/i, /calibrated sampling/i]) {
    if (rx.test(text)) errors.push(`${name}: public docs must not claim paper metrics or VS branding (${rx})`);
  }
  if (/\bcodex\s+plugin\s+add\b/i.test(text) && !/codex-cli\s+0\.144\.1/i.test(text)) {
    errors.push(`${name}: 'codex plugin add' must be documented with the locally verified CLI version`);
  }
  for (const line of text.split('\n')) {
    if (/codex/i.test(line) && /\.zip\b/i.test(line) && /(?:install|upload|import|установ|загруз)/i.test(line)) {
      errors.push(`${name}: unsupported Codex ZIP installation claim: ${line.trim()}`);
    }
  }
}

log('live Claude runner exclusion from safe gates');
function collectFilesByExt(dir, exts) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFilesByExt(abs, exts));
    else if (exts.some((ext) => entry.name.endsWith(ext))) out.push(abs);
  }
  return out;
}
const safeGateFiles = [
  ['README.md', readmeText],
  ['README.ru.md', readmeRuText],
  ['docs/REFRESH_CHECKLIST.md', refreshChecklistText],
  ...collectFilesByExt(p('.github'), ['.yml', '.yaml']).map((abs) => [rel(abs), read(abs)]),
];
const runnableLiveCommandRx =
  /(^|\n)\s*(?:run:\s*)?(?:[-*]\s*)?`?(?:(?:GOLDEN_MODEL=\S+|PROMPT_MASTER_ALLOW_CLAUDE_RUNNER=1)\s+)*node\s+scripts\/run-golden\.js\b|(^|\n)\s*(?:run:\s*)?(?:[-*]\s*)?`?claude\s+-p\b/m;
for (const [name, text] of safeGateFiles) {
  if (runnableLiveCommandRx.test(text)) {
    errors.push(`${name}: safe gates must not contain runnable live Claude commands`);
  }
}

log('Advisor / Managed Agents registry and profiles');
const advisorFacts = registry.records.filter((record) => record.claims?.some((claim) => claim.key === 'min_advisor_model'));
const managedFacts = registry.records.filter((record) => record.claims?.some((claim) => claim.key === 'agent_tools'));
if (/\bAdvisor Tool\b/i.test(profText) && !advisorFacts.length) errors.push('Advisor Tool route has no canonical registry fact record');
if (/\bManaged Agents\b/i.test(profText) && !managedFacts.length) errors.push('Managed Agents route has no canonical registry fact record');

const advisorBody = section(profileTexts['hosted-text.md'] || '', '## Claude Advisor Tool');
if (advisorBody) {
  for (const rx of [/bounded|advisory|diagnostic/i, /evidence|file:line|cite/i, /executor owns tools and delivery[\s\S]{0,100}advisor supplies/i]) {
    if (!rx.test(advisorBody)) errors.push(`Advisor Tool profile missing guard matching ${rx}`);
  }
  if (/iterate until it passes/i.test(advisorBody)) errors.push('Advisor Tool profile must not frame Advisor as an autonomous executor');
} else errors.push('hosted-text.md: missing Claude Advisor Tool profile');

const managedBody = section(profileTexts['hosted-text.md'] || '', '## Claude Managed Agents (CMA / Plan Big Execute Small)');
if (managedBody) {
  for (const rx of [/small bounded work packages/i, /Each worker receives[\s\S]{0,180}stop[\s\S]{0,80}evidence contract/i, /evidence|verification/i, /coordinator owns[\s\S]{0,160}integration[\s\S]{0,160}verification/i]) {
    if (!rx.test(managedBody)) errors.push(`Managed Agents profile missing guard matching ${rx}`);
  }
  if (/budget_tokens|thinking budget/i.test(managedBody)) errors.push('Managed Agents profile must not hardcode thinking budgets');
} else errors.push('hosted-text.md: missing Managed Agents profile');

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
    'glm-thinking-no-cot',
    'glm-preserved-thinking-tool-loop',
    'glm-low-latency-non-thinking',
    'glm-agentic-stop-conditions',
    'glm-zhipu-alias-routing',
    'glm-web-search-citations',
    'agentic-risk-prod-delete-noquestions',
    'agentic-partial-preview-before-db-drop',
    'agentic-policy-reviewer-before-execution',
    'agentic-no-model-self-approval',
    'agentic-draft-commit-split',
    'candidate-set-explicit-variants',
    'candidate-set-not-default',
    'taste-prototype-candidate-directions',
    'candidate-set-blocked-for-security',
    'candidate-set-single-fence-midjourney',
    'candidate-set-no-cot-reasoning-model',
    'indirect-injection-trust-boundary',
    'template-l-redacted-source',
    'sonar-native-citations',
    'midjourney-v7-omni-reference',
    'grok-imagine-positive-constraints',
    'precedence-noquestions-target-missing',
    'precedence-noquestions-format-missing',
    'precedence-research-format-first',
    'precedence-grok-format-first',
    'variants-exactly-two',
    'variants-exactly-three',
    'variants-cap-three',
    'variants-high-risk-suppressed-v132',
    'split-exactly-two',
    'split-exactly-three',
    'retry-initial-plus-two',
    'unknown-tool-capability-fingerprint',
    'missing-reference-unverified',
    'targetless-explicit-activation',
    'precedence-conflict-safe',
    'hook-agentic-context',
    'gpt56-multiagent-surface-first',
    'gpt56-chatgpt-work-ultra',
    'gpt56-chatgpt-sequential-max',
    'gpt56-api-multiagent-setup',
    'gpt56-luna-volume',
    'gpt56-multiagent-single-agent-fallback',
    'gpt56-noquestions-surface-fallback',
    'gpt56-recommended-setup-outside-fence',
    'oracle-clause-local-adversarial',
  ]) {
    if (!ids.includes(id)) errors.push(`Missing golden scenario: ${id}`);
  }
  for (const s of golden.scenarios || []) {
    if (/^(candidate-set-|taste-prototype-candidate-directions$)/.test(s.id)) {
      for (const rx of [...(s.mustMatch || []), ...(s.mustNotMatch || [])]) {
        if (/\.\*|\[\\s\\S\]\*/.test(rx)) {
          errors.push(`Golden scenario ${s.id} uses an unbounded regex: ${rx}`);
        }
      }
    }
  }
} catch (e) {
  errors.push(`Cannot parse tests/golden/scenarios.json: ${e.message}`);
}

log('source contract test wiring');
if (!/args:\s*\['scripts\/test-contracts\.js'\]/.test(safeTestText)) {
  errors.push('scripts/test-safe.js must include scripts/test-contracts.js in DEFAULT_CHECKS');
}
if (!/args:\s*\['scripts\/test-registry\.js'\]/.test(safeTestText)) {
  errors.push('scripts/test-safe.js must include scripts/test-registry.js in DEFAULT_CHECKS');
}
for (const script of ['test-patterns', 'test-pattern-routing', 'test-pattern-package']) {
  if (!new RegExp(`args:\\s*\\['scripts\\/${script}\\.js'\\]`).test(safeTestText)) {
    errors.push(`scripts/test-safe.js must include scripts/${script}.js in DEFAULT_CHECKS`);
  }
}
if (!/args:\s*\['scripts\/test-runtime-inventory\.js'\]/.test(safeTestText)) {
  errors.push('scripts/test-safe.js must include scripts/test-runtime-inventory.js in DEFAULT_CHECKS');
}
if (!/args:\s*\['scripts\/test-codex-layout\.js'\]/.test(safeTestText)) {
  errors.push('scripts/test-safe.js must include scripts/test-codex-layout.js in DEFAULT_CHECKS');
}
if (!/args:\s*\['scripts\/test-codex-hook\.js'\]/.test(safeTestText)) {
  errors.push('scripts/test-safe.js must include scripts/test-codex-hook.js in DEFAULT_CHECKS');
}
if (!/Canonical Trust Boundary/.test(contractsTestText) || !/Template L/.test(contractsTestText)) {
  errors.push('scripts/test-contracts.js must enforce trust-boundary and Template L contracts');
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
