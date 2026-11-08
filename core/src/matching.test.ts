/**
 * Unit tests for the MatchEngine algorithm, exercised through MB primitives.
 *
 * Run: npx vitest run core/src/matching.test.ts
 */
import { describe, it, expect } from 'vitest';
import { MatchEngine } from '@notention/core/matching/MatchEngine.js';
import type { OntologyNode } from '@notention/core/types/domain.js';
import { createSituation, createOffer, classOf } from './primitives.js';
import { matchNotes, normalizeWhat3Words } from './what3words.js';

const ontology: OntologyNode[] = [
  {
    id: 'mb',
    label: 'MB',
    attributes: {
      class: { type: 'string', description: 'Primitive class', operators: { real: ['is'], imaginary: ['is'] } },
      budget: { type: 'number', description: 'Budget ceiling', operators: { real: ['is'], imaginary: ['less than', 'greater than'] } },
      price: { type: 'number', description: 'Price', operators: { real: ['is'], imaginary: ['less than', 'greater than'] }, aliases: ['$'] },
      locus: { type: 'string', description: 'Place', operators: { real: ['is'], imaginary: ['is', 'contains'] }, aliases: ['loc', 'location'] },
      role: { type: 'enum', description: 'Offer role', operators: { real: ['is'], imaginary: ['is'] }, options: ['listing', 'counter'] },
      mood: { type: 'enum', description: 'Mood', operators: { real: ['is'], imaginary: ['is'] }, options: ['calm', 'hungry', 'urgent'] },
    },
  },
];

const engine = new MatchEngine(ontology);

describe('MatchEngine with MB primitives', () => {
  it('scores a Situation budget against an Offer price when keys align', () => {
    const situation = createSituation({
      title: 'Need milk',
      target: 'network',
      budget: '15',
    });
    // Align the constraint key to the fact key the engine compares.
    situation.properties = situation.properties.map((p) =>
      p.key === 'budget' ? { ...p, key: 'price', operator: 'less than' } : p
    );

    const offer = createOffer({
      title: 'Grocery',
      role: 'listing',
      price: '12',
    });

    const result = engine.calculateMatchScore(situation, offer);
    const priceMatch = result.matches.find((m) => m.requestProp.key === 'price');

    expect(priceMatch).toBeDefined();
    expect(priceMatch?.compatibility).toBe(1);
    expect(result.conflicts.find((c) => c.requestProp.key === 'price')).toBeUndefined();
  });

  it('conflicts when the Offer price exceeds the Situation budget', () => {
    const situation = createSituation({ title: 'Need milk', budget: '10' });
    situation.properties = situation.properties.map((p) =>
      p.key === 'budget' ? { ...p, key: 'price', operator: 'less than' } : p
    );
    const offer = createOffer({ title: 'Grocery', role: 'listing', price: '18' });

    const result = engine.calculateMatchScore(situation, offer);
    const conflict = result.conflicts.find((c) => c.requestProp.key === 'price');

    expect(conflict).toBeDefined();
    expect(conflict?.compatibility).toBe(-1);
  });

  it('marks unmatched Situation properties as missing', () => {
    const situation = createSituation({
      title: 'Walk',
      locus: 'park',
      mood: 'calm',
    });
    const offer = createOffer({ title: 'Guide', role: 'listing' });

    const result = engine.calculateMatchScore(situation, offer);
    const missingKeys = result.missing.map((p) => p.key);

    expect(missingKeys).toContain('locus');
    expect(missingKeys).toContain('mood');
  });

  it('matches locus via the location alias', () => {
    const situation = createSituation({ title: 'Walk', locus: 'park' });
    const offer = createOffer({
      title: 'Guide',
      role: 'listing',
      properties: [{ key: 'location', operator: 'is', values: ['park'] }],
    });

    const result = engine.calculateMatchScore(situation, offer);
    const locus = result.matches.find((m) => m.requestProp.key === 'locus');

    expect(locus).toBeDefined();
    expect(locus?.details?.type).toBe('alias');
    expect(locus?.details?.aliasUsed).toBe('location');
    expect(result.missing.find((p) => p.key === 'locus')).toBeUndefined();
  });

  it('treats the class property as a constraint unless the Offer carries it', () => {
    const situation = createSituation({ title: 'Need milk', budget: '15' });
    const offer = createOffer({ title: 'Grocery', role: 'listing', price: '12' });

    expect(classOf(situation)).toBe('situation');
    expect(classOf(offer)).toBe('offer');

    const result = engine.calculateMatchScore(situation, offer);
    expect(result.missing.map((p) => p.key)).toContain('class');
  });

  it('normalizes score by the number of Situation properties', () => {
    const situation = createSituation({ title: 'Need milk' });
    // Only the class property remains if we strip others.
    situation.properties = [{ key: 'price', operator: 'less than', values: ['15'], provenance: 'user' }];
    const offer = createOffer({ title: 'Grocery', role: 'listing', price: '12' });
    offer.properties = [{ key: 'price', operator: 'is', values: ['12'], provenance: 'user' }];

    const result = engine.calculateMatchScore(situation, offer);
    expect(result.score).toBe(1);
    expect(result.matches).toHaveLength(1);
    expect(result.conflicts).toHaveLength(0);
    expect(result.missing).toHaveLength(0);
  });

  it('returns zero score when the Situation has no properties', () => {
    const situation = createSituation({ title: 'Empty' });
    situation.properties = [];
    const offer = createOffer({ title: 'Grocery', role: 'listing', price: '12' });

    const result = engine.calculateMatchScore(situation, offer);
    expect(result.score).toBe(0);
    expect(result.matches).toHaveLength(0);
  });
});

describe('what3words', () => {
  it('groups three words into one address', () => {
    expect(normalizeWhat3Words('///Filled.Count.Soap')).toBe('filled.count.soap');
    expect(normalizeWhat3Words('filled count soap')).toBe('filled.count.soap');
    expect(normalizeWhat3Words('count')).toBeNull();
    expect(normalizeWhat3Words('filled.count')).toBeNull();
  });

  it('stores the triple as one property and one tag', () => {
    const situation = createSituation({
      title: 'Meet here',
      what3words: '///filled.count.soap',
    });
    const prop = situation.properties.find((p) => p.key === 'what3words');
    expect(prop?.values).toEqual(['filled.count.soap']);
    expect(situation.tags).toContain('what3words:filled.count.soap');
    expect(situation.tags?.filter((t) => t.startsWith('what3words:'))).toHaveLength(1);
  });

  it('matches only when all three words are the same square', () => {
    const situation = createSituation({ title: 'Meet', what3words: 'filled.count.soap' });
    const offer = createOffer({ title: 'There', role: 'listing', what3words: 'filled count soap' });

    const result = matchNotes(engine, situation, offer);
    const hit = result.matches.find((m) => m.requestProp.key === 'what3words');

    expect(hit?.compatibility).toBe(1);
    expect(result.conflicts.find((c) => c.requestProp.key === 'what3words')).toBeUndefined();
  });

  it('does not match a different square or a single shared word', () => {
    const situation = createSituation({ title: 'Meet', what3words: 'filled.count.soap' });
    const otherSquare = createOffer({ title: 'Elsewhere', role: 'listing', what3words: 'filled.count.shark' });
    const oneWord = createOffer({
      title: 'Word',
      role: 'listing',
      properties: [{ key: 'what3words', operator: 'is', values: ['count'] }],
    });

    const different = matchNotes(engine, situation, otherSquare);
    expect(different.conflicts.find((c) => c.requestProp.key === 'what3words')?.compatibility).toBe(-1);

    const partial = matchNotes(engine, situation, oneWord);
    expect(partial.matches.find((m) => m.requestProp.key === 'what3words')).toBeUndefined();
    expect(partial.conflicts.find((c) => c.requestProp.key === 'what3words')).toBeUndefined();
    expect(partial.missing.map((p) => p.key)).toContain('what3words');
  });
});
