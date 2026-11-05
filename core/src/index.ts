export {
  mbDomain,
  MB_CLASS_IDS,
  composeOntology,
  createMbOntology,
  isMbClass,
} from './ontology/index.js';

export type { OntologyNode } from './ontology/index.js';

export {
  createEngine,
  getFrictionCounts,
  getFrictionSignals,
  recordFriction,
  generateFrictionDigest,
} from './engine.js';

export {
  createPrimitive,
  createSituation,
  createOffer,
  createConversation,
  createMessage,
  createAgreement,
  createEngagement,
  createEvent,
  createInvoice,
  createPayment,
  createReceipt,
  createEndorsement,
  createDispute,
  classOf,
} from './primitives.js';

export type { PrimitiveId, NoteInput, PropInput } from './primitives.js';
