#!/usr/bin/env node
// prompt-master — UserPromptSubmit hook (Layer 2: auto-nudge).
//
// HIGH-PRECISION detector. Fires only when BOTH hold:
//   A — the user wants to author/modify a prompt, AND
//   B — the target is a multi-agent runtime (orchestrator / fan-out / sub-agents).
// Otherwise it stays silent (empty stdout). Always exits 0 — never blocks a prompt.
//
// The injected note is self-aware: a no-op when prompt-master isn't in use.
// Cross-platform: Node only (bundled with Claude Code), no external deps.
// Layer 1 (the in-skill trigger in SKILL.md/templates.md) carries the recall;
// this hook is a precision-first convenience and is safe to remove.

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', () => resolve(''));
    process.stdin.resume();
  });
}

// Class A — intent to author/modify a prompt (EN + RU).
// EN needs a word boundary: bare /prompt/ also matches "promptly"/"prompted".
const A = /\bprompt(s|ing)?\b|промпт|промт/;

// Class B — multi-agent signal. STRONG tokens only; bare "agent"/"агент" is
// excluded on purpose (user agent, support agent, …). RU matched by root
// (JS \b is not Cyrillic-aware), so the "рой/команда" branch anchors on a
// preceding non-Cyrillic char instead — otherwise "рой" matches inside
// imperative verbs (настрой/построй/устрой агента = false positive) — and
// covers the case forms команда/команды/команду/команде/командой/команд.
const B = [
  /multi-?agent|мультиагент/,
  /orchestrat|оркестрат|оркестрир/,
  /sub-?agent|субагент|подагент/,
  /fan-?out/,
  /agentic/,
  /agent\s+(team|swarm)/,
  /(team|swarm|fleet)\s+of\s+agents?/,
  /(?:^|[^а-яё])(?:ро(?:й|я|ю|ем|е)|команд(?:[аыуое]й?|ами|ах)?)\s+\S*агент/,
];

async function main() {
  let prompt = '';
  try {
    const raw = (await readStdin()) || process.env.PROMPT_MASTER_HOOK_INPUT || '{}';
    const data = JSON.parse(raw);
    if (data && typeof data.prompt === 'string') prompt = data.prompt;
  } catch (_) {
    prompt = '';
  }

  const fire = shouldFire(prompt);

  if (fire) {
    process.stdout.write(JSON.stringify(buildOutput()));
  }
}

function shouldFire(prompt) {
  const p = String(prompt || '').toLowerCase();
  return A.test(p) && B.some((r) => r.test(p));
}

function buildOutput() {
  const note =
    'The user appears to want a prompt targeting a multi-agent runtime ' +
    '(orchestrator / fan-out / sub-agents). If you are generating this prompt with ' +
    'the prompt-master skill, load the "Agentic Prompt Fragments" section in ' +
    'references/templates.md and pick a topology via its situation→pattern table ' +
    '(default to a single loop; orchestrate only if the task hits the listed ' +
    'criteria). Exception — a vendor-managed swarm (e.g. Kimi Agent Swarm): the ' +
    'model self-orchestrates, so do NOT design a topology or script sub-agents; ' +
    'give one decomposable task + final artifact (see the Kimi carve-out). ' +
    'If prompt-master is not in use, ignore this note.';
  return {
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext: note,
    },
  };
}

module.exports = { shouldFire, buildOutput };

if (require.main === module) {
  main().catch(() => {
    process.exitCode = 0;
  });
}
