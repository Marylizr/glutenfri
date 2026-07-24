const STOP_WORDS = new Set([
  'a',
  'da',
  'das',
  'de',
  'do',
  'dos',
  'e',
  'em',
  'loja',
  'shop',
  'shopping',
  'store',
]);

function normalize(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(value) {
  return normalize(value)
    .split(' ')
    .filter((word) => word.length > 1 && !STOP_WORDS.has(word));
}

function tokenCoverage(expected, actual) {
  const expectedTokens = [...new Set(tokens(expected))];
  if (expectedTokens.length === 0) return 0;
  const actualTokens = new Set(tokens(actual));
  const matches = expectedTokens.filter((word) => actualTokens.has(word)).length;
  return matches / expectedTokens.length;
}

function getBranchHint(name) {
  const separatorIndex = (name || '').indexOf('-');
  return separatorIndex === -1 ? '' : name.slice(separatorIndex + 1).trim();
}

function scoreCandidate(establishmentName, candidate) {
  const candidateName = candidate.displayName?.text || '';
  const candidateContext = `${candidateName} ${candidate.formattedAddress || ''}`;
  const normalizedExpected = normalize(establishmentName);
  const normalizedCandidate = normalize(candidateName);

  let nameScore = tokenCoverage(establishmentName, candidateName);
  if (normalizedExpected && normalizedExpected === normalizedCandidate) {
    nameScore = 1;
  } else if (
    normalizedExpected &&
    normalizedCandidate &&
    (normalizedExpected.includes(normalizedCandidate) ||
      normalizedCandidate.includes(normalizedExpected))
  ) {
    nameScore = Math.max(nameScore, 0.9);
  }

  const branchHint = getBranchHint(establishmentName);
  const branchScore = branchHint ? tokenCoverage(branchHint, candidateContext) : null;
  const score = branchScore == null ? nameScore : nameScore * 0.7 + branchScore * 0.3;

  return { candidate, score, nameScore, branchScore };
}

function selectCandidate(establishmentName, candidates) {
  const ranked = candidates
    .map((candidate) => scoreCandidate(establishmentName, candidate))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  const runnerUp = ranked[1];

  if (!best) {
    return { accepted: false, reason: 'sin resultados', ranked };
  }

  const hasBranchHint = Boolean(getBranchHint(establishmentName));
  if (best.nameScore < 0.5) {
    return { accepted: false, reason: 'nombre insuficiente', ranked };
  }
  if (hasBranchHint && best.branchScore < 0.5) {
    return { accepted: false, reason: 'sucursal no confirmada', ranked };
  }
  if (best.score < 0.72) {
    return { accepted: false, reason: 'confianza insuficiente', ranked };
  }

  const margin = runnerUp ? best.score - runnerUp.score : 1;
  if (runnerUp && margin < 0.12 && best.score < 0.95) {
    return { accepted: false, reason: 'resultados ambiguos', ranked };
  }

  return { accepted: true, best, margin, ranked };
}

module.exports = {
  normalize,
  tokenCoverage,
  getBranchHint,
  scoreCandidate,
  selectCandidate,
};
