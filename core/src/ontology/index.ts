/**
 * MB ontology entry.
 *
 * Follows Notention core patterns:
 * - OntologyNode trees (domains.ts)
 * - OntologyService.createCustom(nodes) / createStandard()
 * - findNode, buildAttributeIndex, collectOntologyKeys from ontologyCore
 *
 * Import path once the GitHub dependency resolves to the core package:
 *
 *   import { DEFAULT_ONTOLOGY, OntologyService, findNode } from '@notention/core';
 *
 * Until the monorepo package is linked, this module exports the MB nodes
 * and a small composer that matches the Notention API.
 */

import { mbDomain, MB_CLASS_IDS, type OntologyNode } from './mb.domains.js';

export { mbDomain, MB_CLASS_IDS };
export type { OntologyNode };

/** Merge MB classes in front of a host ontology (Notention DEFAULT_ONTOLOGY). */
export function composeOntology(host: OntologyNode[] = []): OntologyNode[] {
  return [...mbDomain, ...host];
}

/**
 * Factory matching OntologyService.createCustom.
 * Pass the real OntologyService once @notention/core is linked:
 *
 *   import { OntologyService, DEFAULT_ONTOLOGY } from '@notention/core';
 *   const svc = OntologyService.createCustom(composeOntology(DEFAULT_ONTOLOGY));
 */
export function createMbOntology(host: OntologyNode[] = []): OntologyNode[] {
  return composeOntology(host);
}

export function isMbClass(id: string): boolean {
  return MB_CLASS_IDS.includes(id);
}
