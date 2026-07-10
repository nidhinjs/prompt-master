function isReasoningLeakPattern(pattern) {
  return /step\[ -\]by\[ -\]step|шаг за шагом|chain\[ -\]of\[ -\]thought|chain of thought|<thinking>|think through/i.test(
    pattern
  );
}

const CLAUSE_BOUNDARY =
  /[.!?;\n]+|(?:,\s*|[—–-]\s*|\s+)(?:but|however|yet|although|though|но|однако|зато)\s+/giu;

const LOCAL_NEGATION = new RegExp(
  [
    "do\\s+not",
    "don't",
    'must\\s+not',
    'should\\s+not',
    'never',
    'without',
    'avoid(?:ing)?',
    'forbid(?:den|s|ding)?',
    'не\\s+(?:должен|должна|должно|должны|следует)(?=\\s|$|[,:])',
    'не(?=\\s|$|[,:])',
    'нельзя(?=\\s|$|[,:])',
    'никогда(?=\\s|$|[,:])',
    'без(?=\\s|$|[,:])',
    'избегай(?:те)?(?=\\s|$|[,:])',
    'запрещено(?=\\s|$|[,:])',
  ].join('|'),
  'iu'
);

function clauseBounds(text, index) {
  let start = 0;
  let end = text.length;
  for (const match of text.matchAll(CLAUSE_BOUNDARY)) {
    const boundaryStart = match.index || 0;
    const boundaryEnd = boundaryStart + match[0].length;
    if (boundaryEnd <= index) start = boundaryEnd;
    else if (boundaryStart >= index) {
      end = boundaryStart;
      break;
    }
  }
  return { start, end };
}

function hasNegationBefore(text, index) {
  const { start } = clauseBounds(text, index);
  return LOCAL_NEGATION.test(text.slice(start, index));
}

function isLocallyNegated(text, index, matchLength) {
  if (hasNegationBefore(text, index)) return true;
  const { end } = clauseBounds(text, index);
  const after = text.slice(index + matchLength, end);
  return /^[^,:]{0,50}(?:\b(?:is|are)\s+forbidden\b|\b(?:must|should)\s+not\b|запрещено|нельзя)/iu.test(after);
}

function compilePattern(pattern, flags) {
  try {
    return { regex: new RegExp(pattern, flags) };
  } catch (error) {
    return { error: error.message };
  }
}

function hasForbiddenMatch(text, pattern) {
  const compiled = compilePattern(pattern, 'ig');
  if (compiled.error) return true;
  const matches = [...text.matchAll(compiled.regex)];
  if (!matches.length) return false;
  if (!isReasoningLeakPattern(pattern)) return true;
  return matches.some((match) => !isLocallyNegated(text, match.index || 0, match[0].length));
}

function validateScenarios(scenarios) {
  const errors = [];
  if (!Array.isArray(scenarios) || scenarios.length === 0) {
    return ['scenarios must be a non-empty array'];
  }

  const seen = new Set();
  for (const [index, scenario] of scenarios.entries()) {
    const label = scenario?.id || `index ${index}`;
    if (!scenario || typeof scenario !== 'object') {
      errors.push(`scenario at index ${index} must be an object`);
      continue;
    }
    if (typeof scenario.id !== 'string' || !scenario.id.trim()) {
      errors.push(`scenario at index ${index} has an empty id`);
    } else if (seen.has(scenario.id)) {
      errors.push(`duplicate scenario id: ${scenario.id}`);
    } else {
      seen.add(scenario.id);
    }

    let assertionCount = 0;
    for (const field of ['mustMatch', 'mustNotMatch']) {
      if (!(field in scenario)) continue;
      if (!Array.isArray(scenario[field]) || scenario[field].length === 0) {
        errors.push(`${label}: ${field} must be a non-empty array when present`);
        continue;
      }
      assertionCount += scenario[field].length;
      for (const [patternIndex, pattern] of scenario[field].entries()) {
        if (typeof pattern !== 'string' || !pattern.trim()) {
          errors.push(`${label}: ${field}[${patternIndex}] must be a non-empty regex string`);
          continue;
        }
        const compiled = compilePattern(pattern, 'i');
        if (compiled.error) {
          errors.push(`${label}: malformed ${field}[${patternIndex}] /${pattern}/: ${compiled.error}`);
        }
      }
    }
    if (assertionCount === 0) errors.push(`${label}: no assertions defined`);
  }
  return errors;
}

function evaluateScenario(scenario, output) {
  const problems = [];
  for (const pattern of scenario.mustMatch || []) {
    const compiled = compilePattern(pattern, 'i');
    if (compiled.error) problems.push(`invalid /${pattern}/i: ${compiled.error}`);
    else if (!compiled.regex.test(output)) problems.push(`missing /${pattern}/i`);
  }
  for (const pattern of scenario.mustNotMatch || []) {
    const compiled = compilePattern(pattern, 'i');
    if (compiled.error) problems.push(`invalid /${pattern}/i: ${compiled.error}`);
    else if (hasForbiddenMatch(output, pattern)) problems.push(`forbidden /${pattern}/i present`);
  }
  return problems;
}

module.exports = {
  clauseBounds,
  evaluateScenario,
  hasForbiddenMatch,
  hasNegationBefore,
  isLocallyNegated,
  isReasoningLeakPattern,
  validateScenarios,
};
