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

export { OntologyService } from '../vendor/notention/ontology/ontologyService.js';
export { DEFAULT_ONTOLOGY } from '../vendor/notention/ontology/ontology.default.js';
export { MatchEngine, MatchingService } from '../vendor/notention/matching/index.js';
export {
  findNode,
  buildAttributeIndex,
  collectOntologyKeys,
  getCanonicalKey,
} from '../vendor/notention/ontology/ontologyCore.js';

import { OntologyService } from '../vendor/notention/ontology/ontologyService.js';
import { DEFAULT_ONTOLOGY } from '../vendor/notention/ontology/ontology.default.js';
import { composeOntology } from './ontology/index.js';
import type { OntologyNode } from './ontology/mb.domains.js';

/** One service over MB classes + imported Notention ontology. */
export function createEngine(host: OntologyNode[] = DEFAULT_ONTOLOGY as unknown as OntologyNode[]) {
  const nodes = composeOntology(host);
  const ontology = OntologyService.createCustom(nodes);
  return { ontology, nodes };
}
