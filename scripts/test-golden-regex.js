#!/usr/bin/env node
// Offline regression tests for golden scenario assertions. No model calls.

const fs = require('fs');
const path = require('path');
const { evaluateScenario, validateScenarios } = require('./golden-assertions');

const repoRoot = path.join(__dirname, '..');
const scenariosPath = path.join(repoRoot, 'tests/golden/scenarios.json');
const fixturesPath = path.join(repoRoot, 'tests/golden/offline-fixtures.json');

const scenarioList = JSON.parse(fs.readFileSync(scenariosPath, 'utf8')).scenarios;
const { fixtures } = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

const definitionErrors = validateScenarios(scenarioList);
if (definitionErrors.length) {
  for (const error of definitionErrors) console.error(`FAIL scenario definition: ${error}`);
  process.exit(1);
}
const scenarios = new Map(scenarioList.map((s) => [s.id, s]));

if (!Array.isArray(fixtures) || fixtures.length === 0) {
  console.error('FAIL: tests/golden/offline-fixtures.json must contain at least one fixture');
  process.exit(1);
}

for (const fixture of fixtures) {
  if (
    !fixture ||
    typeof fixture.id !== 'string' ||
    typeof fixture.name !== 'string' ||
    typeof fixture.output !== 'string' ||
    typeof fixture.expectedPass !== 'boolean'
  ) {
    console.error('FAIL: every offline fixture requires id, name, output, and boolean expectedPass');
    process.exit(1);
  }
}

for (const [name, definitions, expectedFragment] of [
  [
    'duplicate IDs',
    [{ id: 'duplicate', mustMatch: ['x'] }, { id: 'duplicate', mustMatch: ['y'] }],
    'duplicate scenario id',
  ],
  ['empty assertion array', [{ id: 'empty', mustMatch: [] }], 'mustMatch must be a non-empty array'],
  ['malformed regex', [{ id: 'malformed', mustNotMatch: ['('] }], 'malformed mustNotMatch'],
]) {
  const errors = validateScenarios(definitions);
  if (!errors.some((error) => error.includes(expectedFragment))) {
    console.error(`FAIL validator probe ${name}: ${errors.join('; ') || 'invalid input was accepted'}`);
    process.exit(1);
  }
}

let failed = 0;
for (const fixture of fixtures) {
  const scenario = scenarios.get(fixture.id);
  if (!scenario) {
    console.error(`FAIL ${fixture.name}: scenario not found: ${fixture.id}`);
    failed++;
    continue;
  }
  const problems = evaluateScenario(scenario, fixture.output);
  const passed = problems.length === 0;
  if (passed !== fixture.expectedPass) {
    failed++;
    console.error(`FAIL ${fixture.name}: expected pass=${fixture.expectedPass}, got pass=${passed}`);
    for (const problem of problems) console.error(`  ${problem}`);
  }
}

if (failed) {
  console.error(`\n${failed}/${fixtures.length} offline golden fixtures failed`);
  process.exit(1);
}
console.log(`OK: ${fixtures.length}/${fixtures.length} offline golden fixtures passed`);
