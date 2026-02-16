/**
 * Simple Levenshtein-based title matching for suggesting cross-platform matches.
 */

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function normalize(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Find the best matching title from a list of candidates.
 * Returns matches sorted by similarity (best first).
 */
export function findBestMatches(targetTitle, candidates, maxResults = 5) {
  const normalizedTarget = normalize(targetTitle);

  return candidates
    .map((candidate) => {
      const normalizedCandidate = normalize(candidate.title || "");
      const distance = levenshtein(normalizedTarget, normalizedCandidate);
      const maxLen = Math.max(normalizedTarget.length, normalizedCandidate.length);
      const similarity = maxLen === 0 ? 1 : 1 - distance / maxLen;

      return { ...candidate, similarity, distance };
    })
    .filter((c) => c.similarity > 0.3)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults);
}
