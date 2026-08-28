import { Filter } from "bad-words";

// Extra slurs/harassment terms worth blocking that aren't reliably in the
// base list. Kept short and generic on purpose — this is a first line of
// defense, not a substitute for the human moderation queue (see
// src/lib/personalLifeFilter.ts and the admin flags dashboard).
const EXTRA_BLOCKED_TERMS = ["retard", "retarded", "kys", "kill yourself"];

const filter = new Filter();
filter.addWords(...EXTRA_BLOCKED_TERMS);

export function containsProfanity(text: string): boolean {
  return filter.isProfane(text);
}

export function censorProfanity(text: string): string {
  return filter.clean(text);
}
