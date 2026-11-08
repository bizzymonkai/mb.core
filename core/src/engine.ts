/**
 * MB engine entry.
 *
 * Constructs OntologyService and exposes MatchEngine from the vendored
 * Notention source that now lives in this repo. No package import.
 * No Notention process.
 *
 * Vendor path: core/vendor/notention/
 * Imported commit is recorded in core/vendor/IMPORTED.md.
 */

export { OntologyService } from '@notention/core/ontology/ontologyService.js';
export { DEFAULT_ONTOLOGY } from '@notention/core/ontology/ontology.default.js';
export { MatchEngine, MatchingService } from '@notention/core/matching/index.js';
export {
  findNode,
  buildAttributeIndex,
  collectOntologyKeys,
  getCanonicalKey,
} from '@notention/core/ontology/ontologyCore.js';

export {
  getFrictionCounts,
  getFrictionSignals,
  recordFriction,
  generateFrictionDigest,
} from '@notention/core/telemetry/journal.js';

import { OntologyService } from '@notention/core/ontology/ontologyService.js';
import { DEFAULT_ONTOLOGY } from '@notention/core/ontology/ontology.default.js';
import { composeOntology } from './ontology/index.js';
import type { OntologyNode } from './ontology/mb.domains.js';

/** One service over MB classes + imported Notention ontology. */
export function createEngine(host: OntologyNode[] = DEFAULT_ONTOLOGY as unknown as OntologyNode[]) {
  const nodes = composeOntology(host);
  const ontology = OntologyService.createCustom(nodes);
  return { ontology, nodes };
}
