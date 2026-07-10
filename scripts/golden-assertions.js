function isReasoningLeakPattern(pattern) {
  return /step\[ -\]by\[ -\]step|шаг за шагом|chain\[ -\]of\[ -\]thought|chain of thought|<thinking>|think through/i.test(
    pattern
  );
}

function hasNegationBefore(text, index) {
  const before = text.slice(Math.max(0, index - 90), index).toLowerCase();
  return /(?:do not|don't|must not|never|no\b|without|avoid|forbid|forbidden|не\s|нельзя|никогда|без\s|запрещ)/i.test(
    before
  );
}

function hasForbiddenMatch(text, pattern) {
  const rx = new RegExp(pattern, 'ig');
  const matches = [...text.matchAll(rx)];
  if (!matches.length) return false;
  if (!isReasoningLeakPattern(pattern)) return true;
  return matches.some((match) => !hasNegationBefore(text, match.index || 0));
}

function evaluateScenario(scenario, output) {
  const problems = [];
  for (const pattern of scenario.mustMatch || []) {
    if (!new RegExp(pattern, 'i').test(output)) problems.push(`missing /${pattern}/i`);
  }
  for (const pattern of scenario.mustNotMatch || []) {
    if (hasForbiddenMatch(output, pattern)) problems.push(`forbidden /${pattern}/i present`);
  }
  return problems;
}

module.exports = { evaluateScenario, hasForbiddenMatch, hasNegationBefore, isReasoningLeakPattern };
