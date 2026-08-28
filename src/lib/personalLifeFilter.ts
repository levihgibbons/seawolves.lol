// Best-effort keyword/pattern check for content that strays from "teaching
// quality" into a teacher's personal life, appearance, or unverified
// personal accusations.
//
// This is intentionally NOT a hard block: false positives are common
// (e.g. "he's married to the material" or a legitimate safety concern that
// still deserves human eyes). A match sets autoFlagged/autoFlagReason on
// the review/comment so it lands in the admin moderation queue for a human
// to make the actual call — it does not stop the post from being created.

type Match = { category: string; term: string };

const PATTERN_GROUPS: Record<string, RegExp[]> = {
  appearance: [
    /\b(hot|sexy|ugly|attractive|good[- ]looking|ripped|jacked|milf|dilf)\b/i,
    /\b(fat|skinny|overweight)\b/i,
  ],
  relationship_status: [
    /\b(dating|girlfriend|boyfriend|affair|cheating on|divorc\w*|married to|hooking up)\b/i,
  ],
  substance_or_conduct: [
    /\b(drunk|alcoholic|dui|on drugs|high on|addict)\b/i,
  ],
  unverified_accusation: [
    /\b(predator|creep(y)?|pedo\w*|molest\w*|inappropriate with (a |his |her )?student)\b/i,
  ],
  outside_life: [
    /\b(his|her|their) (wife|husband|kids|children|house|salary|net worth)\b/i,
  ],
};

export function checkPersonalLifeContent(text: string): {
  flagged: boolean;
  reason: string | null;
} {
  const matches: Match[] = [];

  for (const [category, patterns] of Object.entries(PATTERN_GROUPS)) {
    for (const pattern of patterns) {
      const m = text.match(pattern);
      if (m) {
        matches.push({ category, term: m[0] });
      }
    }
  }

  if (matches.length === 0) {
    return { flagged: false, reason: null };
  }

  const categories = [...new Set(matches.map((m) => m.category))];
  return {
    flagged: true,
    reason: `Possible personal-life content (${categories.join(", ")}): matched "${matches[0].term}"`,
  };
}
