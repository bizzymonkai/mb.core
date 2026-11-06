/**
 * what3words addresses are one square, one tag.
 * All three words must be present. A single word is not a location.
 * Do not pass this property through the string matcher: fuzzy and
 * substring matches are different squares.
 */

import type { Note, Property } from '../vendor/notention/types/domain.js';
import type { MatchEngine } from '../vendor/notention/matching/MatchEngine.js';
import type { MatchResult, PropertyMatch } from '../vendor/notention/matching/types.js';

export const WHAT3WORDS_KEY = 'what3words';

/** Strip ///, lowercase, require exactly three words. Dots or spaces. */
export function normalizeWhat3Words(input: string): string | null {
  const stripped = input.trim().replace(/^\/+/, '').trim().toLowerCase();
  if (!stripped) return null;
  const words = stripped.split(/[.\s]+/).filter(Boolean);
  if (words.length !== 3) return null;
  if (words.some((w) => /[.]/.test(w))) return null;
  return words.join('.');
}

export function what3WordsTag(address: string): string | null {
  const normalized = normalizeWhat3Words(address);
  return normalized ? `${WHAT3WORDS_KEY}:${normalized}` : null;
}

/** 1 exact square, -1 different square, 0 not a comparable pair. */
export function compareWhat3Words(request: string, offer: string): 1 | 0 | -1 {
  const a = normalizeWhat3Words(request);
  const b = normalizeWhat3Words(offer);
  if (!a || !b) return 0;
  return a === b ? 1 : -1;
}

function prop(note: Note, key: string): Property | undefined {
  return note.properties.find((p) => p.key === key);
}

function withoutKey(note: Note, key: string): Note {
  return { ...note, properties: note.properties.filter((p) => p.key !== key) };
}

/**
 * MatchEngine on every property except what3words, then an exact
 * comparison of the grouped triple. One shared word does not match.
 */
export function matchNotes(engine: MatchEngine, situation: Note, offer: Note): MatchResult {
  const req = prop(situation, WHAT3WORDS_KEY);
  const off = prop(offer, WHAT3WORDS_KEY);
  const base = engine.calculateMatchScore(withoutKey(situation, WHAT3WORDS_KEY), withoutKey(offer, WHAT3WORDS_KEY));

  if (!req) return base;

  const reqValue = req.values[0] ?? '';
  const baseCount = situation.properties.length - 1;
  const baseTotal = base.score * baseCount;

  if (!off || !off.values[0]) {
    return {
      score: situation.properties.length > 0 ? Math.max(0, baseTotal / situation.properties.length) : 0,
      matches: base.matches,
      conflicts: base.conflicts,
      missing: [...base.missing, req],
    };
  }

  const cmp = compareWhat3Words(reqValue, off.values[0]);
  const pair: PropertyMatch = {
    requestProp: req,
    offerProp: off,
    compatibility: cmp,
    reason: cmp === 1 ? 'Exact what3words square' : cmp === -1 ? 'Different what3words square' : 'Not a what3words address',
    details: { type: 'exact', valueMatch: cmp === 1 ? 'what3words' : 'mismatch' },
  };

  const matches = cmp === 1 ? [...base.matches, pair] : base.matches;
  const conflicts = cmp === -1 ? [...base.conflicts, pair] : base.conflicts;
  const missing = cmp === 0 ? [...base.missing, req] : base.missing;
  const total = baseTotal + (cmp === 0 ? 0 : cmp);
  const score = situation.properties.length > 0 ? Math.max(0, total / situation.properties.length) : 0;

  return { score, matches, conflicts, missing };
}
