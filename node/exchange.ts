/**
 * v0.1 — two peers, one exchange.
 *
 * Two MbNode instances. One relay (peer A's). No central index.
 * Each peer writes what it publishes and what it reads to its own log.
 * The log and the key survive a restart. The relay does not.
 */

import { appendFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { verifyEvent, type Event } from 'nostr-tools';
import { Relay, useWebSocketImplementation } from 'nostr-tools/relay';
import WebSocket from 'ws';
import type { MbNode } from './index.js';
import type { Note } from '@notention/core/types/domain.js';
import {
  createSituation,
  createOffer,
  createMessage,
  createAgreement,
} from '../core/src/primitives.js';

function asStringWebSocket(Base: typeof WebSocket) {
  return class StringWebSocket extends Base {
    override set onmessage(fn: ((ev: { data: string }) => void) | null) {
      super.onmessage = fn
        ? (ev: { data: Buffer | string }) => {
            const data = typeof ev.data === 'string' ? ev.data : ev.data.toString();
            fn({ data });
          }
        : null;
    }
    override get onmessage() {
      return super.onmessage as ((ev: { data: string }) => void) | null;
    }
  };
}

useWebSocketImplementation(asStringWebSocket(WebSocket));

export interface ExchangeRecord {
  situation: Event;
  offer: Event;
  messages: Event[];
  agreement: { a: Event; b: Event; terms: string };
}

function logPath(node: MbNode): string {
  return join((node.account as unknown as { dir: string }).dir, 'log.jsonl');
}

function writeLog(node: MbNode, event: Event): void {
  appendFileSync(logPath(node), JSON.stringify(event) + '\n');
}

export function readLog(node: MbNode): Event[] {
  const p = logPath(node);
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

async function publish(url: string, event: Event): Promise<void> {
  const relay = await Relay.connect(url);
  await relay.publish(event);
  relay.close();
}

async function query(url: string, filter: { kinds: number[]; authors?: string[] }): Promise<Event[]> {
  const relay = await Relay.connect(url);
  try {
    const events: Event[] = [];
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('query timed out')), 5000);
      relay.subscribe([filter], {
        onevent: (e) => events.push(e),
        oneose: () => { clearTimeout(timer); resolve(); },
      });
    });
    return events;
  } finally {
    relay.close();
  }
}

function signNote(node: MbNode, note: Note, extra: string[][] = []): Event {
  const tags = [['t', `class:${note.tags.find((t) => t.startsWith('class:'))?.slice(6) ?? 'note'}`], ...extra];
  return node.account.sign({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags,
    content: JSON.stringify({ id: note.id, title: note.title, content: note.content, tags: note.tags, properties: note.properties }),
  });
}

/**
 * Peer A publishes a Situation. Peer B finds it, offers, they message,
 * both sign the same terms. Returns the record.
 */
export async function runExchange(a: MbNode, b: MbNode, relayUrl: string): Promise<ExchangeRecord> {
  a.account.generate('peer-a');
  b.account.generate('peer-b');

  const situation = createSituation({ title: 'need a ride to the store', target: 'network' });
  const situationEvent = signNote(a, situation);
  await publish(relayUrl, situationEvent);
  writeLog(a, situationEvent);

  const found = await query(relayUrl, { kinds: [1] });
  const seen = found.find((e) => e.id === situationEvent.id);
  if (!seen) throw new Error('peer B did not find the Situation');
  writeLog(b, seen);

  const offer = createOffer({ title: 'I can drive', role: 'listing', price: '5' });
  const offerEvent = signNote(b, offer, [['e', situationEvent.id]]);
  await publish(relayUrl, offerEvent);
  writeLog(b, offerEvent);

  const offers = await query(relayUrl, { kinds: [1], authors: [b.account.pubkey()] });
  const seenOffer = offers.find((e) => e.id === offerEvent.id);
  if (!seenOffer) throw new Error('peer A did not find the Offer');
  writeLog(a, seenOffer);

  const reply = createMessage({ title: 'when?', content: 'what time?' });
  const replyEvent = signNote(a, reply, [['e', offerEvent.id]]);
  await publish(relayUrl, replyEvent);
  writeLog(a, replyEvent);

  const answer = createMessage({ title: 'now', content: 'leaving in 10' });
  const answerEvent = signNote(b, answer, [['e', replyEvent.id]]);
  await publish(relayUrl, answerEvent);
  writeLog(b, answerEvent);

  const terms = 'ride to the store, 5, leaving in 10';
  const agreeA = createAgreement({ title: 'ride', terms });
  const agreeB = createAgreement({ title: 'ride', terms });
  const agreeEventA = signNote(a, agreeA, [['t', 'agreement'], ['e', offerEvent.id]]);
  const agreeEventB = signNote(b, agreeB, [['t', 'agreement'], ['e', offerEvent.id]]);
  await publish(relayUrl, agreeEventA);
  await publish(relayUrl, agreeEventB);
  writeLog(a, agreeEventA);
  writeLog(b, agreeEventB);

  return {
    situation: situationEvent,
    offer: offerEvent,
    messages: [replyEvent, answerEvent],
    agreement: { a: agreeEventA, b: agreeEventB, terms },
  };
}

/** Both signatures verify and both contents carry the same terms. */
export function verifyAgreement(record: ExchangeRecord): boolean {
  const { a, b, terms } = record.agreement;
  if (!verifyEvent(a) || !verifyEvent(b)) return false;
  if (a.pubkey === b.pubkey) return false;
  const termsOf = (e: Event) => {
    const body = JSON.parse(e.content);
    const prop = (body.properties ?? []).find((p: { key: string }) => p.key === 'terms');
    return prop?.values?.[0];
  };
  return termsOf(a) === terms && termsOf(b) === terms;
}
