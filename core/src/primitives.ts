/**
 * Primitive constructors.
 *
 * Each MB primitive is a Note. Class id is stored as a tag (`class:<id>`)
 * and as a property (`class is <id>`). Properties use the vendored Property
 * shape. No call out to a Notention service.
 */

import type { Note, Property, PrivacyLevel, NoteStatus } from '../vendor/notention/types/domain.js';

export type PrimitiveId =
  | 'situation'
  | 'offer'
  | 'conversation'
  | 'message'
  | 'agreement'
  | 'engagement'
  | 'event'
  | 'invoice'
  | 'payment'
  | 'receipt'
  | 'endorsement'
  | 'dispute';

export interface PropInput {
  key: string;
  operator?: string;
  values: string[];
  unit?: string;
}

export interface NoteInput {
  title: string;
  content?: string;
  properties?: PropInput[];
  privacy?: PrivacyLevel;
  author?: string;
  status?: NoteStatus;
  tags?: string[];
}

function id(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function toProperty(p: PropInput): Property {
  return {
    key: p.key,
    operator: p.operator ?? 'is',
    values: p.values,
    unit: p.unit,
    provenance: 'user',
  };
}

/** Base constructor. All primitives go through this. */
export function createPrimitive(classId: PrimitiveId, input: NoteInput): Note {
  const ts = now();
  const properties: Property[] = [
    { key: 'class', operator: 'is', values: [classId], provenance: 'user' },
    ...(input.properties ?? []).map(toProperty),
  ];
  return {
    id: id(),
    title: input.title,
    content: input.content ?? '',
    tags: [`class:${classId}`, ...(input.tags ?? [])],
    properties,
    createdAt: ts,
    updatedAt: ts,
    source: { type: 'user', identifier: 'mb.core', timestamp: Date.now() },
    privacy: input.privacy ?? 'private',
    priority: 0,
    author: input.author,
    status: input.status ?? 'open',
  };
}

export function createSituation(input: NoteInput & {
  target?: 'network' | 'identity';
  locus?: string;
  needBy?: string;
  budget?: string;
  mood?: string;
}): Note {
  const props: PropInput[] = [...(input.properties ?? [])];
  if (input.target) props.push({ key: 'target', values: [input.target] });
  if (input.locus) props.push({ key: 'locus', values: [input.locus] });
  if (input.needBy) props.push({ key: 'needBy', operator: 'before', values: [input.needBy] });
  if (input.budget) props.push({ key: 'budget', operator: 'less than', values: [input.budget] });
  if (input.mood) props.push({ key: 'mood', values: [input.mood] });
  return createPrimitive('situation', { ...input, properties: props, privacy: input.privacy ?? 'private' });
}

export function createOffer(input: NoteInput & {
  role: 'listing' | 'counter';
  price?: string;
  locus?: string;
  rails?: string[];
}): Note {
  const props: PropInput[] = [
    { key: 'role', values: [input.role] },
    ...(input.properties ?? []),
  ];
  if (input.price) props.push({ key: 'price', values: [input.price] });
  if (input.locus) props.push({ key: 'locus', values: [input.locus] });
  if (input.rails) props.push({ key: 'rails', values: input.rails });
  return createPrimitive('offer', { ...input, properties: props });
}

export function createConversation(input: NoteInput & { situationId?: string }): Note {
  const props: PropInput[] = [...(input.properties ?? [])];
  if (input.situationId) props.push({ key: 'situationId', values: [input.situationId] });
  return createPrimitive('conversation', { ...input, properties: props });
}

export function createMessage(input: NoteInput & {
  intent?: 'endorsement_request' | 'counter' | 'note';
}): Note {
  const props: PropInput[] = [...(input.properties ?? [])];
  if (input.intent) props.push({ key: 'intent', values: [input.intent] });
  return createPrimitive('message', { ...input, properties: props });
}

export function createAgreement(input: NoteInput & { terms?: string; validDuring?: string }): Note {
  const props: PropInput[] = [...(input.properties ?? [])];
  if (input.terms) props.push({ key: 'terms', values: [input.terms] });
  if (input.validDuring) props.push({ key: 'validDuring', values: [input.validDuring] });
  return createPrimitive('agreement', { ...input, properties: props });
}

export function createEngagement(input: NoteInput & {
  phase?: 'proposed' | 'active' | 'settled' | 'disputed' | 'closed';
}): Note {
  const props: PropInput[] = [...(input.properties ?? [])];
  if (input.phase) props.push({ key: 'phase', values: [input.phase] });
  return createPrimitive('engagement', { ...input, properties: props, status: input.status ?? 'committed' });
}

export function createEvent(input: NoteInput & {
  kind?: 'meeting' | 'habit-window' | 'deadline';
  start?: string;
}): Note {
  const props: PropInput[] = [...(input.properties ?? [])];
  if (input.kind) props.push({ key: 'kind', values: [input.kind] });
  if (input.start) props.push({ key: 'start', values: [input.start] });
  return createPrimitive('event', { ...input, properties: props });
}

export function createInvoice(input: NoteInput & { amount?: string; predecessor?: string }): Note {
  const props: PropInput[] = [...(input.properties ?? [])];
  if (input.amount) props.push({ key: 'amount', values: [input.amount] });
  if (input.predecessor) props.push({ key: 'predecessor', values: [input.predecessor] });
  return createPrimitive('invoice', { ...input, properties: props });
}

export function createPayment(input: NoteInput & { amount?: string; rail?: string }): Note {
  const props: PropInput[] = [...(input.properties ?? [])];
  if (input.amount) props.push({ key: 'amount', values: [input.amount] });
  if (input.rail) props.push({ key: 'rail', values: [input.rail] });
  return createPrimitive('payment', { ...input, properties: props });
}

export function createReceipt(input: NoteInput & { paymentId?: string }): Note {
  const props: PropInput[] = [...(input.properties ?? [])];
  if (input.paymentId) props.push({ key: 'paymentId', values: [input.paymentId] });
  return createPrimitive('receipt', { ...input, properties: props, privacy: input.privacy ?? 'private' });
}

export function createEndorsement(input: NoteInput & { subject?: string; weight?: string }): Note {
  const props: PropInput[] = [...(input.properties ?? [])];
  if (input.subject) props.push({ key: 'subject', values: [input.subject] });
  if (input.weight) props.push({ key: 'weight', values: [input.weight] });
  return createPrimitive('endorsement', { ...input, properties: props });
}

export function createDispute(input: NoteInput & { subject?: string; reason?: string }): Note {
  const props: PropInput[] = [...(input.properties ?? [])];
  if (input.subject) props.push({ key: 'subject', values: [input.subject] });
  if (input.reason) props.push({ key: 'reason', values: [input.reason] });
  return createPrimitive('dispute', { ...input, properties: props });
}

/** Read the class id back off a Note. */
export function classOf(note: Note): PrimitiveId | null {
  const tag = note.tags.find((t) => t.startsWith('class:'));
  if (tag) return tag.slice(6) as PrimitiveId;
  const prop = note.properties.find((p) => p.key === 'class');
  return (prop?.values[0] as PrimitiveId) ?? null;
}
