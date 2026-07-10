#!/usr/bin/env node
// Offline regression tests for golden scenario assertions. No model calls.

const fs = require('fs');
const path = require('path');
const { evaluateScenario } = require('./golden-assertions');

const repoRoot = path.join(__dirname, '..');
const scenariosPath = path.join(repoRoot, 'tests/golden/scenarios.json');
const fixturesPath = path.join(repoRoot, 'tests/golden/offline-fixtures.json');

const scenarios = new Map(JSON.parse(fs.readFileSync(scenariosPath, 'utf8')).scenarios.map((s) => [s.id, s]));
const { fixtures } = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));

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
