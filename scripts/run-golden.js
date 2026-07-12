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
//   PROMPT_MASTER_ALLOW_CLAUDE_RUNNER=1 node scripts/run-golden.js --only id
//   PROMPT_MASTER_ALLOW_CLAUDE_RUNNER=1 node scripts/run-golden.js --max-scenarios 3
//   PROMPT_MASTER_ALLOW_CLAUDE_RUNNER=1 PROMPT_MASTER_ALLOW_FULL_GOLDEN=1 node scripts/run-golden.js
//
// ВНИМАНИЕ: каждый сценарий = реальный вызов модели (расходует API/подписку).
// Не гоняется в CI. Запуск требует явного opt-in через переменную окружения.

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { evaluateScenario } = require('./golden-assertions');

const repoRoot = path.join(__dirname, '..');
const skillPath = path.join(
  repoRoot,
  'plugins/prompt-master/skills/prompt-master/SKILL.md'
);
const scenariosPath = path.join(repoRoot, 'tests/golden/scenarios.json');

function argValue(name) {
  const idx = process.argv.indexOf(name);
  return idx !== -1 ? process.argv[idx + 1] : null;
}

function positiveInt(value, label) {
  if (value == null) return null;
  if (!/^\d+$/.test(String(value)) || Number(value) < 1) {
    console.error(`${label} must be a positive integer`);
    process.exit(2);
  }
  return Number(value);
}

function resolveClaudeInvocation(env = process.env) {
  const testScript = env.PROMPT_MASTER_TEST_CLAUDE_SCRIPT;
  if (!testScript) {
    const command = env.PROMPT_MASTER_CLAUDE_BIN || 'claude';
    return { command, prefixArgs: [], label: command, testAdapter: false };
  }
  if (env.PROMPT_MASTER_CLAUDE_BIN) {
    throw new Error('PROMPT_MASTER_TEST_CLAUDE_SCRIPT cannot be combined with PROMPT_MASTER_CLAUDE_BIN');
  }
  if (!path.isAbsolute(testScript)) {
    throw new Error('PROMPT_MASTER_TEST_CLAUDE_SCRIPT must be an absolute path');
  }
  let stat;
  try { stat = fs.statSync(testScript); }
  catch (error) { throw new Error(`PROMPT_MASTER_TEST_CLAUDE_SCRIPT is unavailable: ${error.code || error.message}`); }
  if (!stat.isFile()) throw new Error('PROMPT_MASTER_TEST_CLAUDE_SCRIPT must point to a file');
  return {
    command: process.execPath,
    prefixArgs: [testScript],
    label: `${process.execPath} ${testScript}`,
    testAdapter: true,
  };
}

const only = argValue('--only');
const maxScenarios = positiveInt(argValue('--max-scenarios'), '--max-scenarios');
const model = process.env.GOLDEN_MODEL || 'sonnet';
const perScenarioTimeoutMs =
  positiveInt(process.env.PROMPT_MASTER_SCENARIO_TIMEOUT_MS, 'PROMPT_MASTER_SCENARIO_TIMEOUT_MS') || 300000;
const suiteTimeoutMs =
  positiveInt(process.env.PROMPT_MASTER_SUITE_TIMEOUT_MS, 'PROMPT_MASTER_SUITE_TIMEOUT_MS') || 600000;
const maxLiveCalls = positiveInt(process.env.PROMPT_MASTER_MAX_LIVE_CALLS, 'PROMPT_MASTER_MAX_LIVE_CALLS');

if (process.env.NO_LIVE_MODEL_CALLS === '1') {
  console.error(
    [
      'Refusing to run Claude golden scenarios.',
      '',
      'NO_LIVE_MODEL_CALLS=1 is set for safe verification environments.',
      'Unset it only for an explicitly authorized live eval.',
    ].join('\n')
  );
  process.exit(2);
}

if (process.env.PROMPT_MASTER_ALLOW_CLAUDE_RUNNER !== '1') {
  console.error(
    [
      'Refusing to run Claude golden scenarios.',
      '',
      'This script calls `claude -p` once per scenario and can trigger account,',
      'quota, billing, or abuse-detection side effects. It is disabled by default.',
      '',
      'To run it anyway, explicitly set:',
      '  PROMPT_MASTER_ALLOW_CLAUDE_RUNNER=1 node scripts/run-golden.js --only <id>',
    ].join('\n')
  );
  process.exit(2);
}

if (!only && !maxScenarios && process.env.PROMPT_MASTER_ALLOW_FULL_GOLDEN !== '1') {
  console.error(
    [
      'Refusing to run the full live golden suite.',
      '',
      'Use --only <id> or --max-scenarios <n> for bounded live evals.',
      'To run every scenario anyway, set PROMPT_MASTER_ALLOW_FULL_GOLDEN=1 as a second explicit opt-in.',
    ].join('\n')
  );
  process.exit(2);
}

const skill = fs.readFileSync(skillPath, 'utf8');
const { scenarios } = JSON.parse(fs.readFileSync(scenariosPath, 'utf8'));

let toRun = only ? scenarios.filter((s) => s.id === only) : scenarios;
if (maxScenarios) toRun = toRun.slice(0, maxScenarios);
if (!toRun.length) {
  console.error(`No scenario matches --only ${only}`);
  process.exit(2);
}
if (maxLiveCalls && toRun.length > maxLiveCalls) {
  console.error(`Refusing ${toRun.length} live call(s); PROMPT_MASTER_MAX_LIVE_CALLS=${maxLiveCalls}`);
  process.exit(2);
}

let claudeInvocation;
try { claudeInvocation = resolveClaudeInvocation(); }
catch (error) {
  console.error(`Invalid Claude runner configuration: ${error.message}`);
  process.exit(2);
}

console.log(
  `Running ${toRun.length} ${claudeInvocation.testAdapter ? 'fake ' : 'live '}golden scenario(s), ` +
  `model=${model}, claude=${claudeInvocation.label}\n`
);

let executed = 0;
let passed = 0;
let failed = 0;
const suiteStarted = Date.now();
for (const s of toRun) {
  if (Date.now() - suiteStarted > suiteTimeoutMs) {
    console.log(`SUITE_TIMEOUT after ${Date.now() - suiteStarted}ms; remaining=${toRun.length - executed}`);
    break;
  }
  executed++;
  const started = Date.now();
  process.stdout.write(`— ${s.id} (${model}) … `);
  const res = spawnSync(
    claudeInvocation.command,
    [...claudeInvocation.prefixArgs, '-p', s.request, '--append-system-prompt', skill, '--model', model],
    { encoding: 'utf8', timeout: perScenarioTimeoutMs, maxBuffer: 10 * 1024 * 1024 }
  );
  const elapsed = Date.now() - started;
  if (res.error || res.status !== 0) {
    const stderr = res.stderr || '';
    let kind = 'MODEL_ERROR';
    if (res.error?.code === 'ETIMEDOUT') kind = 'TIMEOUT';
    else if (res.error?.code === 'ENOENT' || res.error?.code === 'EPERM' || /not logged in/i.test(stderr)) {
      kind = 'ENV_ERROR';
    }
    console.log(`${kind} after ${elapsed}ms (claude exit ${res.status}): ${res.error || stderr}`);
    failed++;
    continue;
  }
  const out = res.stdout || '';
  const problems = evaluateScenario(s, out);
  if (problems.length) {
    failed++;
    console.log(`ASSERT_FAIL after ${elapsed}ms`);
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
    passed++;
    console.log(`PASS (${elapsed}ms)`);
  }
}

const notRun = toRun.length - executed;
console.log(`\nSUMMARY planned=${toRun.length} executed=${executed} passed=${passed} failed=${failed} not_run=${notRun}`);
process.exit(failed || notRun ? 1 : 0);
