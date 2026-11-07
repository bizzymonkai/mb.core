/**
 * Network diagnostic checklist.
 *
 * One entry per action in the README Actions list.
 * covered: the check runs and must pass.
 * pending: the action is specified, not yet wired. Recorded, not failed.
 */

import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MbNode } from './index.js';
import { MbAccount } from './account/index.js';
import {
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
} from '../core/src/primitives.js';
import type { Diagnosis, CheckResult } from './diagnose.js';

export type ActionStatus = 'covered' | 'pending';

export interface ActionItem {
  group: string;
  action: string;
  status: ActionStatus;
  run?: (ctx: ChecklistContext) => Promise<void> | void;
}

export interface ChecklistContext {
  node: MbNode;
  account: MbAccount;
}

export interface ActionResult extends CheckResult {
  group: string;
  status: ActionStatus;
}

export interface ChecklistReport {
  at: string;
  covered: number;
  coveredOk: number;
  pending: number;
  ok: boolean;
  items: ActionResult[];
}

function scratch(): ChecklistContext {
  const root = mkdtempSync(join(tmpdir(), 'mb-check-'));
  const port = 20000 + Math.floor(Math.random() * 20000);
  const node = new MbNode(root, { relayPort: port });
  return { node, account: node.account };
}

export const ACTIONS: ActionItem[] = [
  // Boot
  { group: 'Boot', action: 'boots the MB node', status: 'covered', run: ({ node }) => { if (!node.status()) throw new Error('no status'); } },
  { group: 'Boot', action: 'starts the Relay module', status: 'covered', run: async ({ node }) => { await node.start('relay'); if (node.relay.status().state !== 'running') throw new Error('relay not running'); } },
  { group: 'Boot', action: 'stops the Relay module', status: 'covered', run: async ({ node }) => { await node.stop('relay'); if (node.relay.status().state !== 'stopped') throw new Error('relay not stopped'); } },
  { group: 'Boot', action: 'starts the Data module', status: 'pending' },
  { group: 'Boot', action: 'stops the Data module', status: 'pending' },
  { group: 'Boot', action: 'reads the boot diagnosis', status: 'covered', run: async ({ node }) => { const r = await node.diagnose(); if (!r.length) throw new Error('no report'); } },

  // Session
  { group: 'Session', action: 'opens an MB session', status: 'covered', run: ({ account }) => { if (!account.status()) throw new Error('no account'); } },
  { group: 'Session', action: 'generates a key', status: 'covered', run: ({ account }) => { const r = account.generate('check'); if (!r.nsec.startsWith('nsec1')) throw new Error('bad nsec'); } },
  { group: 'Session', action: 'imports an nsec', status: 'covered', run: ({ account }) => { const a = account.generate(); const b = account.import(a.nsec); if (b.npub !== a.npub) throw new Error('import mismatch'); } },
  { group: 'Session', action: 'imports an ncryptsec', status: 'covered', run: ({ account }) => { account.generate(); const w = account.exportNcryptsec('pw'); const fresh = new MbAccount(mkdtempSync(join(tmpdir(), 'mb-nc-'))); const r = fresh.importNcryptsec(w, 'pw'); if (!r.npub.startsWith('npub1')) throw new Error('bad import'); } },
  { group: 'Session', action: 'exports an nsec', status: 'covered', run: ({ account }) => { account.generate(); if (!account.export().startsWith('nsec1')) throw new Error('no nsec'); } },
  { group: 'Session', action: 'exports an ncryptsec', status: 'covered', run: ({ account }) => { account.generate(); if (!account.exportNcryptsec('pw').startsWith('ncryptsec1')) throw new Error('no ncryptsec'); } },
  { group: 'Session', action: 'switches the signing key', status: 'covered', run: ({ account }) => { const a = account.generate(); const b = account.generate(); account.switch(a.npub); if (account.current()?.npub !== a.npub) throw new Error('switch failed'); account.switch(b.npub); } },
  { group: 'Session', action: 'sets a profile name', status: 'covered', run: ({ account }) => { account.generate(); const e = account.setProfile({ name: 'peer' }); if (JSON.parse(e.content).name !== 'peer') throw new Error('profile'); } },
  { group: 'Session', action: 'sets a relay list', status: 'covered', run: ({ account }) => { account.generate(); const e = account.setRelayList([{ url: 'ws://127.0.0.1:8080' }]); if (e.kind !== 10002) throw new Error('kind'); } },
  { group: 'Session', action: 'follows a key', status: 'covered', run: ({ account }) => { const a = account.generate(); const b = account.generate(); account.switch(a.npub); const e = account.setFollows([b.npub]); if (e.tags[0][0] !== 'p') throw new Error('no p tag'); } },
  { group: 'Session', action: 'follows a tag', status: 'pending' },
  { group: 'Session', action: 'unfollows a key', status: 'pending' },
  { group: 'Session', action: 'unfollows a tag', status: 'pending' },

  // Situation
  { group: 'Situation', action: 'opens the detector', status: 'pending' },
  { group: 'Situation', action: 'speaks into the detector', status: 'pending' },
  { group: 'Situation', action: 'types into the detector', status: 'pending' },
  { group: 'Situation', action: 'captures a photo', status: 'pending' },
  { group: 'Situation', action: 'shares a location', status: 'pending' },
  { group: 'Situation', action: 'sets a mood', status: 'pending' },
  { group: 'Situation', action: 'edits the Situation as a note', status: 'covered', run: () => { const n = createSituation({ title: 'hungry', content: 'near park' }); if (classOf(n) !== 'situation') throw new Error('class'); } },
  { group: 'Situation', action: 'edits the Situation as a graph', status: 'pending' },
  { group: 'Situation', action: 'edits the Situation as JSON', status: 'covered', run: () => { const n = createSituation({ title: 'x' }); if (!JSON.parse(JSON.stringify(n)).id) throw new Error('json'); } },
  { group: 'Situation', action: 'keeps the Situation private', status: 'covered', run: () => { const n = createSituation({ title: 'x', privacy: 'private' }); if (n.privacy !== 'private') throw new Error('privacy'); } },
  { group: 'Situation', action: 'publishes the Situation', status: 'covered', run: async ({ node, account }) => { account.generate(); await node.start('relay'); const n = createSituation({ title: 'hungry', privacy: 'public' }); const ev = account.sign({ kind: 1, created_at: Math.floor(Date.now() / 1000), tags: [['t', 'situation']], content: n.title }); await node.relay.publish(ev); const found = await node.relay.query({ kinds: [1], authors: [account.pubkey()] }); if (!found.length) throw new Error('not published'); await node.stop('relay'); } },
  { group: 'Situation', action: 'retracts the Situation', status: 'covered', run: ({ account }) => { account.generate(); const e = account.deleteEvent(['a'.repeat(64)]); if (e.kind !== 5) throw new Error('kind'); } },
  { group: 'Situation', action: 'monitors many Situations', status: 'pending' },
  { group: 'Situation', action: 'monitors one Situation', status: 'pending' },
  { group: 'Situation', action: 'filters to Doing Mode', status: 'pending' },
  { group: 'Situation', action: 'marks a Situation as currently doing', status: 'pending' },
  { group: 'Situation', action: 'schedules a Situation', status: 'covered', run: () => { const n = createEvent({ title: 'walk', start: new Date().toISOString() }); if (classOf(n) !== 'event') throw new Error('class'); } },
  { group: 'Situation', action: 'sets a habit window', status: 'pending' },
  { group: 'Situation', action: 'views another peer\'s Situation', status: 'pending' },

  // Offer
  { group: 'Offer', action: 'creates an Offer', status: 'covered', run: () => { if (classOf(createOffer({ title: 'ride', role: 'listing' })) !== 'offer') throw new Error('class'); } },
  { group: 'Offer', action: 'publishes an Offer', status: 'pending' },
  { group: 'Offer', action: 'counters an Offer', status: 'covered', run: () => { const n = createOffer({ title: 'counter', role: 'counter' }); if (classOf(n) !== 'offer') throw new Error('class'); } },
  { group: 'Offer', action: 'replies to an Offer', status: 'pending' },
  { group: 'Offer', action: 'accepts an Offer', status: 'pending' },
  { group: 'Offer', action: 'declines an Offer', status: 'pending' },
  { group: 'Offer', action: 'retracts an Offer', status: 'pending' },

  // Settlement
  { group: 'Settlement', action: 'drafts an Agreement', status: 'covered', run: () => { if (classOf(createAgreement({ title: 'terms' })) !== 'agreement') throw new Error('class'); } },
  { group: 'Settlement', action: 'signs an Agreement', status: 'pending' },
  { group: 'Settlement', action: 'opens an Engagement', status: 'covered', run: () => { if (classOf(createEngagement({ title: 'job' })) !== 'engagement') throw new Error('class'); } },
  { group: 'Settlement', action: 'advances an Engagement', status: 'pending' },
  { group: 'Settlement', action: 'creates an Invoice', status: 'covered', run: () => { if (classOf(createInvoice({ title: 'bill', amount: '10' })) !== 'invoice') throw new Error('class'); } },
  { group: 'Settlement', action: 'sends an Invoice', status: 'pending' },
  { group: 'Settlement', action: 'records a Payment', status: 'covered', run: () => { if (classOf(createPayment({ title: 'paid', amount: '10' })) !== 'payment') throw new Error('class'); } },
  { group: 'Settlement', action: 'records a Receipt', status: 'covered', run: () => { if (classOf(createReceipt({ title: 'rcpt' })) !== 'receipt') throw new Error('class'); } },
  { group: 'Settlement', action: 'requests an Endorsement', status: 'pending' },
  { group: 'Settlement', action: 'writes an Endorsement', status: 'covered', run: () => { if (classOf(createEndorsement({ title: 'good' })) !== 'endorsement') throw new Error('class'); } },
  { group: 'Settlement', action: 'opens a Dispute', status: 'covered', run: () => { if (classOf(createDispute({ title: 'late' })) !== 'dispute') throw new Error('class'); } },
  { group: 'Settlement', action: 'resolves a Dispute', status: 'pending' },

  // Conversation
  { group: 'Conversation', action: 'opens a Conversation on a Situation', status: 'covered', run: () => { const s = createSituation({ title: 's' }); if (classOf(createConversation({ title: 'c', situationId: s.id })) !== 'conversation') throw new Error('class'); } },
  { group: 'Conversation', action: 'joins a Conversation', status: 'pending' },
  { group: 'Conversation', action: 'leaves a Conversation', status: 'pending' },
  { group: 'Conversation', action: 'sends a Message', status: 'covered', run: () => { if (classOf(createMessage({ title: 'hi', content: 'hello' })) !== 'message') throw new Error('class'); } },
  { group: 'Conversation', action: 'attaches a primitive to a Message', status: 'pending' },

  // Rules
  { group: 'Rules', action: 'states a New Rule', status: 'pending' },
  { group: 'Rules', action: 'saves a SystemNote', status: 'pending' },
  { group: 'Rules', action: 'trusts a received SystemNote', status: 'pending' },
  { group: 'Rules', action: 'creates a Tracker', status: 'pending' },
  { group: 'Rules', action: 'edits a Tracker', status: 'pending' },
  { group: 'Rules', action: 'pauses a Tracker', status: 'pending' },
  { group: 'Rules', action: 'creates a Trigger', status: 'pending' },
  { group: 'Rules', action: 'edits a Trigger', status: 'pending' },
  { group: 'Rules', action: 'pauses a Trigger', status: 'pending' },
  { group: 'Rules', action: 'picks a template', status: 'pending' },

  // Assets
  { group: 'Assets', action: 'lists assets', status: 'pending' },
  { group: 'Assets', action: 'drops a file', status: 'pending' },
  { group: 'Assets', action: 'encrypts an asset', status: 'pending' },
  { group: 'Assets', action: 'pins an asset', status: 'pending' },
  { group: 'Assets', action: 'fetches an asset', status: 'pending' },
  { group: 'Assets', action: 'updates an asset', status: 'pending' },

  // Groups and places
  { group: 'Groups', action: 'creates a group', status: 'pending' },
  { group: 'Groups', action: 'joins a group', status: 'pending' },
  { group: 'Groups', action: 'leaves a group', status: 'pending' },
  { group: 'Groups', action: 'adds a member', status: 'pending' },
  { group: 'Groups', action: 'removes a member', status: 'pending' },
  { group: 'Groups', action: 'follows a Place', status: 'pending' },
  { group: 'Groups', action: 'sets a what3words tag', status: 'covered', run: () => { const n = createSituation({ title: 'here', what3words: 'filled.count.soap' }); const tag = n.tags.find((t) => t.startsWith('what3words:')); if (!tag) throw new Error('no tag'); } },
];

export async function runChecklist(): Promise<ChecklistReport> {
  const ctx = scratch();
  const items: ActionResult[] = [];
  for (const item of ACTIONS) {
    if (item.status === 'pending' || !item.run) {
      items.push({ name: item.action, group: item.group, status: 'pending', ok: true, ms: 0, detail: 'pending' });
      continue;
    }
    const start = Date.now();
    try {
      await item.run(ctx);
      items.push({ name: item.action, group: item.group, status: 'covered', ok: true, ms: Date.now() - start });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      items.push({ name: item.action, group: item.group, status: 'covered', ok: false, detail, ms: Date.now() - start });
    }
  }
  const covered = items.filter((i) => i.status === 'covered');
  return {
    at: new Date().toISOString(),
    covered: covered.length,
    coveredOk: covered.filter((i) => i.ok).length,
    pending: items.filter((i) => i.status === 'pending').length,
    ok: covered.every((i) => i.ok),
    items,
  };
}

export function formatChecklist(r: ChecklistReport): string {
  const head = `${r.ok ? 'OK' : 'FAIL'}  checklist  ${r.coveredOk}/${r.covered} covered  ${r.pending} pending`;
  const lines = r.items.map((i) => {
    const mark = i.status === 'pending' ? 'pend' : i.ok ? '  ok' : 'FAIL';
    return `${mark}  ${i.group}  ${i.name}${i.detail && !i.ok ? '  ' + i.detail : ''}`;
  });
  return [head, ...lines].join('\n');
}
