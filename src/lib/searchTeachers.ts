// Search/ranking for the teacher directory. Designed to be maximally
// forgiving: case doesn't matter anywhere, an honorific in front of a last
// name works ("Mr Reimers"), a last-name-only query works, and a
// misspelled name still finds its way to the right teacher — without
// letting fuzzy matching get so loose that unrelated names start showing
// up for a clean, correctly-spelled query. A search never returns an
// empty list (as long as there's at least one teacher to search): if
// nothing clears the "real match" bar, we fall back to the closest names
// by loose similarity so there's always something to look at, and the
// caller can flag that as a soft/fallback match.

const HONORIFICS = /^(mr|mrs|ms|mx|dr|prof|professor|coach|sir|rev)\.?\s+/i;

export function normalizeSearchQuery(raw: string): string {
  return raw
    .trim()
    .replace(HONORIFICS, "")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    // Drop single-character tokens (e.g. the "A" in "A Cappella Music") —
    // they're not meaningful signal and trivially prefix-match almost any
    // query, which was producing false positives.
    .filter((t) => t.length > 1);
}

// Standard Levenshtein edit distance.
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    for (let j = 1; j <= b.length; j++) {
      curr[j] =
        a[i - 1] === b[j - 1]
          ? prev[j - 1]
          : 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }
    prev = curr;
  }
  return prev[b.length];
}

// How many typos we forgive scales with word length — a 4-letter word one
// edit away from another 4-letter word is a huge relative change, but the
// same absolute distance on a 10-letter word is a couple of typos. This is
// the classic bounded-edit-distance spell-check heuristic; it's much more
// precise than a normalized-ratio cutoff, which lets short, totally
// unrelated words match each other by chance.
function typoTolerance(len: number): number {
  if (len <= 4) return 1;
  if (len <= 8) return 2;
  return 3;
}

// `typed` is what the user actually entered — tolerance is based on its
// length, not the (possibly much longer) candidate being compared against,
// so a short typed token like "jon" doesn't get a typo budget generous
// enough to accidentally match an unrelated longer word.
function isTypoOf(candidate: string, typed: string): boolean {
  if (candidate.length < 3 || typed.length < 3) return candidate === typed;
  const tolerance = typoTolerance(typed.length);
  if (Math.abs(candidate.length - typed.length) > tolerance) return false;
  return editDistance(candidate, typed) <= tolerance;
}

// Loose 0..1 similarity, used only to rank last-resort fallback candidates
// when nothing qualifies as a real match — never used to decide whether
// something *is* a match.
function looseSimilarity(a: string, b: string): number {
  const longer = Math.max(a.length, b.length);
  if (longer === 0) return 1;
  return 1 - editDistance(a, b) / longer;
}

export type Searchable = {
  name: string;
  department: string;
};

const NAME_TOKEN_WEIGHT = 100;
const DEPT_TOKEN_WEIGHT = 45;

function bestTokenScore(queryToken: string, candidateTokens: string[], weight: number): number {
  let best = 0;
  for (const token of candidateTokens) {
    if (token === queryToken) {
      best = Math.max(best, weight);
    } else if (token.startsWith(queryToken) || queryToken.startsWith(token)) {
      // Prefix match ("reim" -> "reimers", or typing more than the name).
      best = Math.max(best, weight * 0.85);
    } else if (isTypoOf(token, queryToken)) {
      best = Math.max(best, weight * 0.65);
    }
  }
  return best;
}

/**
 * Score a teacher as a genuine match for the query. 0 means "not a real
 * match" — the teacher may still surface as a fallback suggestion (see
 * searchTeachers), but shouldn't appear in a normal filtered result set.
 */
export function scoreTeacherMatch(teacher: Searchable, query: string): number {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) return 1; // empty query: everyone matches equally

  const nameLower = teacher.name.toLowerCase();
  const deptLower = teacher.department.toLowerCase();

  if (nameLower === normalized) return 1000;
  if (nameLower.startsWith(normalized) || normalized.startsWith(nameLower)) return 900;
  if (nameLower.includes(normalized)) return 700;
  if (deptLower === normalized) return 300;

  const nameTokens = tokenize(teacher.name);
  const deptTokens = tokenize(teacher.department);
  const queryTokens = tokenize(normalized);
  if (queryTokens.length === 0) return 1;

  // Sum the best per-query-token score so multi-word queries that match
  // several tokens (e.g. "john reimers") outrank a single coincidental
  // token match, while a single strong token still surfaces results.
  let score = 0;
  for (const qt of queryTokens) {
    const nameScore = bestTokenScore(qt, nameTokens, NAME_TOKEN_WEIGHT);
    const deptScore = bestTokenScore(qt, deptTokens, DEPT_TOKEN_WEIGHT);
    score += Math.max(nameScore, deptScore);
  }

  if (score === 0 && deptLower.includes(normalized)) score = DEPT_TOKEN_WEIGHT;

  return score;
}

export function searchTeachers<T extends Searchable>(
  teachers: T[],
  query: string
): { results: T[]; isFallback: boolean } {
  if (!query.trim() || teachers.length === 0) {
    return { results: teachers, isFallback: false };
  }

  const scored = teachers
    .map((teacher) => ({ teacher, score: scoreTeacherMatch(teacher, query) }))
    .sort((a, b) => b.score - a.score || a.teacher.name.localeCompare(b.teacher.name));

  const realMatches = scored.filter((s) => s.score > 0);
  if (realMatches.length > 0) {
    return { results: realMatches.map((s) => s.teacher), isFallback: false };
  }

  // Nothing looked like a genuine match — never show a dead end. Rank
  // everyone by loose whole-name similarity and surface the closest
  // handful so there's always something to look at.
  const normalized = normalizeSearchQuery(query);
  const FALLBACK_COUNT = 6;
  const byLooseSimilarity = teachers
    .map((teacher) => ({
      teacher,
      sim: looseSimilarity(teacher.name.toLowerCase(), normalized),
    }))
    .sort((a, b) => b.sim - a.sim || a.teacher.name.localeCompare(b.teacher.name));

  return {
    results: byLooseSimilarity.slice(0, FALLBACK_COUNT).map((s) => s.teacher),
    isFallback: true,
  };
}
