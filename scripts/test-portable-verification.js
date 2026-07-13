#!/usr/bin/env node
// Source contracts for the v1.37 cross-platform, offline verification path.

const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const read = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8');
const sources = {
  ci: read('.github/workflows/ci.yml'),
  fake: read('scripts/fake-claude.js'),
  runner: read('scripts/run-golden.js'),
  runnerTest: read('scripts/test-run-golden-safe.js'),
  safe: read('scripts/test-safe.js'),
  safeSelf: read('scripts/test-safe-self.js'),
  hookTest: read('scripts/test-hook.js'),
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const cases = [
  function sameStrictGateOnUbuntuAndWindows() {
    assert(/os:\s*\[ubuntu-24\.04, windows-2025\]/.test(sources.ci), 'strict CI matrix must contain Ubuntu and Windows');
    const runs = sources.ci.match(/run:\s*node scripts\/test-safe\.js --strict/g) || [];
    assert(runs.length === 1, 'strict safe command must appear once inside the shared matrix job');
  },

  function historicalTagsAreAvailableToStrictJobs() {
    assert(/fetch-depth:\s*0/.test(sources.ci), 'strict checkout must fetch full history');
    assert(/fetch-tags:\s*true/.test(sources.ci), 'strict checkout must fetch historical tags');
  },

  function ciContainsNoLiveOptIn() {
    assert(!/PROMPT_MASTER_ALLOW_CLAUDE_RUNNER|PROMPT_MASTER_ALLOW_FULL_GOLDEN|claude\s+-p/.test(sources.ci), 'CI must not enable a live runner');
    assert(/NO_LIVE_MODEL_CALLS:\s*'1'/.test(sources.ci), 'CI must force NO_LIVE_MODEL_CALLS');
  },

  function fakeUsesAbsoluteNodeAdapter() {
    const safeNodeChecks = sources.safe.match(/\{ command: process\.execPath, args:/g) || [];
    assert(safeNodeChecks.length === 17, 'every strict-safe child check must use absolute process.execPath');
    assert(/command:\s*process\.execPath/.test(sources.runner), 'test adapter must launch process.execPath');
    assert(/path\.isAbsolute\(testScript\)/.test(sources.runner), 'test adapter path must be absolute');
    assert(/path\.isAbsolute\(fakeClaudeScript\)/.test(sources.runnerTest), 'fake test must assert an absolute script path');
    assert(/spawnSync\(process\.execPath, \[HOOK\]/.test(sources.hookTest), 'hook smoke test must use absolute process.execPath');
    assert(!/spawnSync\(['"]node['"]/.test(sources.hookTest), 'safe hook test must not resolve Node through PATH');
  },

  function productionDefaultRemainsClaude() {
    assert(/PROMPT_MASTER_CLAUDE_BIN\s*\|\|\s*'claude'/.test(sources.runner), 'production default Claude resolution changed');
    assert(/cannot be combined with PROMPT_MASTER_CLAUDE_BIN/.test(sources.runner), 'ambiguous fake/production config must fail');
  },

  function nodeFakeHasCrossPlatformPathFallback() {
    assert(/command:\s*process\.execPath/.test(sources.runner), 'scenario fake must remain Node-only');
    assert(/const posixFile = path\.join\(dir, 'claude'\)/.test(sources.safe), 'POSIX PATH sentinel missing');
    assert(/const windowsFile = path\.join\(dir, 'claude\.cmd'\)/.test(sources.safe), 'Windows PATH sentinel missing');
    assert(!/claude\.exe|linkSync|copyFileSync/.test(sources.safe), 'safe gate must not disguise or copy Node as claude.exe');
    assert(!/\/bin\/sleep/.test(sources.runnerTest), 'fake timeout must not depend on /bin/sleep');
  },

  function safeGateUsesPreloadAndRestrictedPath() {
    assert(/env\.PATH\s*=\s*claudeDenyGuard\.dir/.test(sources.safe), 'safe PATH must contain only the guard directory');
    assert(/resolveSafeGit\(source\)/.test(sources.safe), 'Git must be resolved or validated before PATH isolation');
    assert(/PROMPT_MASTER_SAFE_GIT/.test(sources.safe), 'absolute safe Git contract must be passed to validators');
    assert(/deleteEnvCaseInsensitive/.test(sources.safe), 'sensitive environment keys must be removed case-insensitively');
    assert(/isolatedEnvKeys\.map\(\(key\) => key\.toLowerCase\(\)\)/.test(sources.runnerTest), 'runner test isolation must be case-insensitive');
    assert(/NODE_OPTIONS/.test(sources.safe), 'safe gate must install the Node preload guard');
  },

  function fakeEvidenceIsRedacted() {
    assert(/safeValueEvidence/.test(sources.fake), 'fake marker must hash prompt values');
    assert(!/\bargv\s*:/.test(sources.fake), 'fake marker must not persist raw argv');
    assert(/argv_sha256/.test(sources.fake), 'deny marker must retain a redacted argv digest');
  },

  function realClaudeGuardIsExercised() {
    assert(/productionDefaultResolutionIsBlockedByGuard/.test(sources.runnerTest), 'fake suite must test the production default guard');
    assert(/isolatedPathBlocksProductionDefaultWithoutPreload/.test(sources.runnerTest), 'fake suite must test isolated PATH without preload');
    assert(/temporaryPathSentinelBlocksShellFallback/.test(sources.runnerTest), 'fake suite must test the inert shell fallback');
    assert(/shellBypassesAreBlockedBeforeHarmlessClaudeCanRun/.test(sources.runnerTest), 'fake suite must prove shell bypasses cannot execute a harmless Claude fixture');
    assert(/\['exec', 'execSync'\]/.test(sources.fake), 'preload guard must deny shell APIs');
    assert(/options\.shell/.test(sources.fake), 'preload guard must deny shell:true');
    assert(/argsOrOptions == null \? \(maybeOptions \|\| \{\}\)/.test(sources.fake), 'shell:true guard must preserve undefined/null args overload options');
    assert(/shellCommandMentionsClaude/.test(sources.fake), 'preload guard must inspect direct shell -c//c commands');
    assert(/blocked-real-claude/.test(sources.fake), 'preload guard must emit a blocked marker');
  },

  function provenanceRunsInsideStrictGate() {
    assert(/scripts\/test-provenance\.js/.test(sources.safe), 'provenance tests must be part of the strict gate');
  },

  function everySafeCheckHasATimeout() {
    assert(/DEFAULT_CHECK_TIMEOUT_MS\s*=\s*120000/.test(sources.safe), 'safe check timeout must be fixed');
    assert(/timeout:\s*timeoutMs/.test(sources.safe), 'safe coordinator must pass the per-check timeout');
    assert(/ETIMEDOUT/.test(sources.safe), 'safe coordinator must classify timeout failures');
    assert(/planned=\$\{toRun\.length\} executed=\$\{executed\} passed=\$\{passed\} failed=\$\{failed\} not_run=\$\{notRun\}/.test(sources.runner), 'suite summary must separate executed and unexecuted scenarios');
    assert(/suiteTimeoutDoesNotCountUnexecutedScenarioAsPassed/.test(sources.runnerTest), 'fake suite must cover suite-timeout accounting');
    assert(/case 'pass-slow'/.test(sources.fake), 'suite-timeout test must use a deterministic slow-pass fake mode');
  },
];

let failed = 0;
for (const testCase of cases) {
  try { testCase(); }
  catch (error) {
    failed++;
    console.error(`FAIL ${testCase.name}: ${error.message}`);
  }
}

if (failed) {
  console.error(`\n${failed}/${cases.length} portable verification contracts failed`);
  process.exitCode = 1;
} else {
  console.log(`OK: ${cases.length}/${cases.length} portable verification contracts passed`);
}
