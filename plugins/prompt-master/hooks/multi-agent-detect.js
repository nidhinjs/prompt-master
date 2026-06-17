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

const fs = require('fs');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch (_) {
    return '';
  }
}

let prompt = '';
try {
  const data = JSON.parse(readStdin() || '{}');
  if (data && typeof data.prompt === 'string') prompt = data.prompt;
} catch (_) {
  prompt = '';
}

const p = prompt.toLowerCase();

// Class A — intent to author/modify a prompt (EN + RU).
const A = /prompt|промпт|промт/;

// Class B — multi-agent signal. STRONG tokens only; bare "agent"/"агент" is
// excluded on purpose (user agent, support agent, …). RU matched by root
// (JS \b is not Cyrillic-aware), so morphology is covered.
const B = [
  /multi-?agent|мультиагент/,
  /orchestrat|оркестрат|оркестрир/,
  /sub-?agent|субагент|подагент/,
  /fan-?out/,
  /agentic/,
  /agent\s+(team|swarm)/,
  /(рой|команд[аыео])\s+\S*агент/,
];

const fire = A.test(p) && B.some((r) => r.test(p));

if (fire) {
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
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: note,
      },
    })
  );
}

process.exit(0);
