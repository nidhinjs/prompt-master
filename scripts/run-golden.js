#!/usr/bin/env node
// Golden-сценарии поведения prompt-master.
//
// Прогоняет запросы из tests/golden/scenarios.json через headless Claude
// (`claude -p`) с SKILL.md, поданным как дополнительный системный промпт, и
// проверяет инварианты ответа (mustMatch / mustNotMatch, regex с флагом i).
//
// Это приближение: references/ подгружаются моделью только если она сама
// решит их прочитать, поэтому инварианты опираются на правила, живущие в
// SKILL.md. FAIL — сигнал для ручного разбора, не строгий вердикт.
//
// Использование:
//   node scripts/run-golden.js              # все сценарии
//   node scripts/run-golden.js --only id    # один сценарий
//   GOLDEN_MODEL=opus node scripts/run-golden.js
//
// ВНИМАНИЕ: каждый сценарий = реальный вызов модели (расходует API/подписку).
// Не гоняется в CI — запускать вручную перед релизом.

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const skillPath = path.join(
  repoRoot,
  'plugins/prompt-master/skills/prompt-master/SKILL.md'
);
const scenariosPath = path.join(repoRoot, 'tests/golden/scenarios.json');

const skill = fs.readFileSync(skillPath, 'utf8');
const { scenarios } = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));

const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx !== -1 ? process.argv[onlyIdx + 1] : null;
const model = process.env.GOLDEN_MODEL || 'sonnet';

const toRun = only ? scenarios.filter((s) => s.id === only) : scenarios;
if (!toRun.length) {
  console.error(`No scenario matches --only ${only}`);
  process.exit(2);
}

console.log(`Running ${toRun.length} golden scenario(s), model=${model}\n`);

let failed = 0;
for (const s of toRun) {
  const started = Date.now();
  process.stdout.write(`— ${s.id} (${model}) … `);
  const res = spawnSync(
    'claude',
    ['-p', s.request, '--append-system-prompt', skill, '--model', model],
    { encoding: 'utf8', timeout: 300000, maxBuffer: 10 * 1024 * 1024 }
  );
  const elapsed = Date.now() - started;
  if (res.error || res.status !== 0) {
    console.log(`ERROR after ${elapsed}ms (claude exit ${res.status}): ${res.error || res.stderr}`);
    failed++;
    continue;
  }
  const out = res.stdout;
  const problems = [];
  for (const rx of s.mustMatch || []) {
    if (!new RegExp(rx, 'i').test(out)) problems.push(`missing /${rx}/i`);
  }
  for (const rx of s.mustNotMatch || []) {
    if (new RegExp(rx, 'i').test(out)) problems.push(`forbidden /${rx}/i present`);
  }
  if (problems.length) {
    failed++;
    console.log(`FAIL after ${elapsed}ms`);
    console.log(`    id: ${s.id}`);
    console.log(`    model: ${model}`);
    console.log(`    why: ${s.why}`);
    for (const p of problems) console.log(`    ${p}`);
    console.log(`    --- output (first 500 chars) ---`);
    console.log(
      out
        .slice(0, 500)
        .split('\n')
        .map((l) => `    | ${l}`)
        .join('\n')
    );
  } else {
    console.log(`PASS (${elapsed}ms)`);
  }
}

console.log(
  `\n${toRun.length - failed}/${toRun.length} passed${failed ? ` — ${failed} FAILED (разбирать вручную)` : ''}`
);
process.exit(failed ? 1 : 0);
