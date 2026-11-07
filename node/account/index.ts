/**
 * MB Account module.
 *
 * Nostr identity and keys. Not the relay. Not the data store.
 * Keygen, import, and export are nostr-tools calls. MB does not implement the key math.
 */

import { generateSecretKey, getPublicKey, finalizeEvent, type Event, type UnsignedEvent } from 'nostr-tools';
import * as nip19 from 'nostr-tools/nip19';
import * as nip44 from 'nostr-tools/nip44';
import { encrypt as nip49Encrypt, decrypt as nip49Decrypt } from 'nostr-tools/nip49';
import { mkdirSync, readFileSync, writeFileSync, existsSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { MODULES } from '../labels.js';
import { runChecks, type Diagnosis } from '../diagnose.js';

export const LABEL = MODULES.account;

export interface AccountRecord {
  npub: string;
  nsec: string;
  createdAt: string;
  label?: string;
}

export interface AccountStatus {
  module: typeof LABEL;
  count: number;
  current: string | null;
}

export class MbAccount {
  private dir: string;
  private storePath: string;
  private currentNpub: string | null = null;
  private records = new Map<string, AccountRecord>();

  constructor(dir: string) {
    this.dir = dir;
    this.storePath = join(dir, 'accounts.json');
    mkdirSync(dir, { recursive: true });
    this.load();
  }

  /** Library call. New nsec and npub. Shown once by the caller. */
  generate(label?: string): AccountRecord {
    const sk = generateSecretKey();
    const pk = getPublicKey(sk);
    const rec: AccountRecord = {
      npub: nip19.npubEncode(pk),
      nsec: nip19.nsecEncode(sk),
      createdAt: new Date().toISOString(),
      label,
    };
    this.records.set(rec.npub, rec);
    if (!this.currentNpub) this.currentNpub = rec.npub;
    this.save();
    return rec;
  }

  /** Paste an nsec. Validates before it is stored. Does not replace the current key until confirmed. */
  import(nsec: string, opts: { label?: string; makeCurrent?: boolean } = {}): AccountRecord {
    const decoded = nip19.decode(nsec.trim());
    if (decoded.type !== 'nsec') {
      throw new Error('MB Account: expected an nsec');
    }
    const sk = decoded.data as Uint8Array;
    const pk = getPublicKey(sk);
    const npub = nip19.npubEncode(pk);
    const rec: AccountRecord = {
      npub,
      nsec: nip19.nsecEncode(sk),
      createdAt: new Date().toISOString(),
      label: opts.label,
    };
    this.records.set(npub, rec);
    if (opts.makeCurrent || !this.currentNpub) this.currentNpub = npub;
    this.save();
    return rec;
  }

  /** Import an ncryptsec (NIP-49). Decrypts with passphrase, then stores the nsec. */
  importNcryptsec(ncryptsec: string, passphrase: string, opts: { label?: string; makeCurrent?: boolean } = {}): AccountRecord {
    let sk: Uint8Array;
    try {
      sk = nip49Decrypt(ncryptsec.trim(), passphrase);
    } catch {
      throw new Error('MB Account: failed to decrypt ncryptsec (bad passphrase or invalid)');
    }
    const pk = getPublicKey(sk);
    const npub = nip19.npubEncode(pk);
    const rec: AccountRecord = {
      npub,
      nsec: nip19.nsecEncode(sk),
      createdAt: new Date().toISOString(),
      label: opts.label,
    };
    this.records.set(npub, rec);
    if (opts.makeCurrent || !this.currentNpub) this.currentNpub = npub;
    this.save();
    return rec;
  }

  /** Reveal the nsec. Explicit. Never sent to a relay by this module. */
  export(npub?: string): string {
    const key = npub ?? this.currentNpub;
    if (!key) throw new Error('MB Account: no current key');
    const rec = this.records.get(key);
    if (!rec) throw new Error('MB Account: unknown npub');
    return rec.nsec;
  }

  /** Export as ncryptsec (NIP-49). Caller supplies passphrase. Does not change stored nsec. */
  exportNcryptsec(passphrase: string, npub?: string): string {
    if (!passphrase) throw new Error('MB Account: passphrase required for ncryptsec export');
    const nsec = this.export(npub);
    const decoded = nip19.decode(nsec);
    if (decoded.type !== 'nsec') throw new Error('MB Account: internal nsec invalid');
    const sk = decoded.data as Uint8Array;
    return nip49Encrypt(sk, passphrase);
  }

  /** Sign an unsigned event with the current (or given) key. */
  sign(event: UnsignedEvent, npub?: string): Event {
    const nsec = this.export(npub);
    const decoded = nip19.decode(nsec);
    if (decoded.type !== 'nsec') throw new Error('MB Account: cannot sign without nsec');
    const sk = decoded.data as Uint8Array;
    return finalizeEvent(event, sk);
  }

  /** NIP-44 encrypt plaintext to a recipient pubkey (hex or npub). */
  encrypt(plaintext: string, recipientPubkey: string, npub?: string): string {
    const nsec = this.export(npub);
    const decoded = nip19.decode(nsec);
    if (decoded.type !== 'nsec') throw new Error('MB Account: cannot encrypt without nsec');
    const sk = decoded.data as Uint8Array;
    const pk = recipientPubkey.startsWith('npub1')
      ? (nip19.decode(recipientPubkey).data as string)
      : recipientPubkey;
    const conversationKey = nip44.getConversationKey(sk, pk);
    return nip44.encrypt(plaintext, conversationKey);
  }

  /** NIP-44 decrypt ciphertext from a sender pubkey (hex or npub). */
  decrypt(ciphertext: string, senderPubkey: string, npub?: string): string {
    const nsec = this.export(npub);
    const decoded = nip19.decode(nsec);
    if (decoded.type !== 'nsec') throw new Error('MB Account: cannot decrypt without nsec');
    const sk = decoded.data as Uint8Array;
    const pk = senderPubkey.startsWith('npub1')
      ? (nip19.decode(senderPubkey).data as string)
      : senderPubkey;
    const conversationKey = nip44.getConversationKey(sk, pk);
    return nip44.decrypt(ciphertext, conversationKey);
  }

  /** Hex pubkey of the current (or given) key. Other modules use this, not the nsec. */
  pubkey(npub?: string): string {
    const nsec = this.export(npub);
    const decoded = nip19.decode(nsec);
    if (decoded.type !== 'nsec') throw new Error('MB Account: cannot read pubkey');
    return getPublicKey(decoded.data as Uint8Array);
  }

  /** Kind 0. Username and optional NIP-05. Signed, not published. */
  setProfile(profile: { name?: string; about?: string; nip05?: string }, npub?: string): Event {
    return this.sign({
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify(profile),
    }, npub);
  }

  /** Kind 3 contact list. Each npub becomes a p tag. Signed, not published. */
  setFollows(npubs: string[], npub?: string): Event {
    const tags = npubs.map((n) => {
      const hex = n.startsWith('npub1') ? (nip19.decode(n).data as string) : n;
      return ['p', hex];
    });
    return this.sign({
      kind: 3,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content: '',
    }, npub);
  }

  /** Kind 10002 relay list. NIP-65. Signed, not published. */
  setRelayList(relays: Array<{ url: string; read?: boolean; write?: boolean }>, npub?: string): Event {
    const tags = relays.map((r) => {
      const t = ['r', r.url];
      if (r.read && !r.write) t.push('read');
      else if (r.write && !r.read) t.push('write');
      return t;
    });
    return this.sign({
      kind: 10002,
      created_at: Math.floor(Date.now() / 1000),
      tags,
      content: '',
    }, npub);
  }

  /** Kind 5. NIP-09 deletion. Display hides. Relays may keep the event. Signed, not published. */
  deleteEvent(ids: string[], npub?: string): Event {
    return this.sign({
      kind: 5,
      created_at: Math.floor(Date.now() / 1000),
      tags: ids.map((id) => ['e', id]),
      content: '',
    }, npub);
  }

  /** NIP-40. Attach an expiration tag. Does not sign. */
  withExpiration(event: UnsignedEvent, unix: number): UnsignedEvent {
    return { ...event, tags: [...(event.tags ?? []), ['expiration', String(unix)]] };
  }

  switch(npub: string): void {
    if (!this.records.has(npub)) throw new Error('MB Account: unknown npub');
    this.currentNpub = npub;
    this.save();
  }

  current(): AccountRecord | null {
    if (!this.currentNpub) return null;
    return this.records.get(this.currentNpub) ?? null;
  }

  list(): Array<Omit<AccountRecord, 'nsec'>> {
    return [...this.records.values()].map(({ nsec: _s, ...rest }) => rest);
  }

  status(): AccountStatus {
    return { module: LABEL, count: this.records.size, current: this.currentNpub };
  }

  lastDiagnosis: Diagnosis | null = null;

  /**
   * Operational check. Runs against a scratch store so the live keys are untouched.
   * Called on node boot. Same checks the unit tests call.
   */
  async diagnose(): Promise<Diagnosis> {
    const scratch = new MbAccount(mkdtempSync(join(tmpdir(), 'mb-account-diag-')));
    this.lastDiagnosis = await runChecks(LABEL, [
      {
        name: 'generate nsec and npub',
        run: () => {
          const rec = scratch.generate('diag');
          if (!rec.nsec.startsWith('nsec1') || !rec.npub.startsWith('npub1')) {
            throw new Error('bad key encoding');
          }
        },
      },
      {
        name: 'import and export nsec',
        run: () => {
          const rec = scratch.generate();
          const again = scratch.import(rec.nsec);
          if (again.npub !== rec.npub) throw new Error('import changed npub');
          if (scratch.export(rec.npub) !== rec.nsec) throw new Error('export mismatch');
        },
      },
      {
        name: 'sign a kind 0 profile',
        run: () => {
          const ev = scratch.setProfile({ name: 'diag' });
          if (ev.kind !== 0 || !ev.sig || ev.pubkey !== scratch.pubkey()) {
            throw new Error('profile not signed by current key');
          }
        },
      },
      {
        name: 'NIP-44 encrypt and decrypt',
        run: () => {
          const other = new MbAccount(mkdtempSync(join(tmpdir(), 'mb-account-peer-')));
          const peer = other.generate();
          const cipher = scratch.encrypt('diag', peer.npub);
          const plain = other.decrypt(cipher, scratch.current()!.npub);
          if (plain !== 'diag') throw new Error('round trip failed');
        },
      },
      {
        name: 'NIP-49 ncryptsec round trip',
        run: () => {
          const wrapped = scratch.exportNcryptsec('diag-pass');
          const fresh = new MbAccount(mkdtempSync(join(tmpdir(), 'mb-account-nc-')));
          const rec = fresh.importNcryptsec(wrapped, 'diag-pass');
          if (rec.npub !== scratch.current()!.npub) throw new Error('ncryptsec npub mismatch');
        },
      },
    ]);
    return this.lastDiagnosis;
  }

  private load(): void {
    if (!existsSync(this.storePath)) return;
    const raw = JSON.parse(readFileSync(this.storePath, 'utf8')) as {
      current: string | null;
      records: AccountRecord[];
    };
    this.currentNpub = raw.current;
    for (const rec of raw.records) this.records.set(rec.npub, rec);
  }

  private save(): void {
    const body = {
      current: this.currentNpub,
      records: [...this.records.values()],
    };
    writeFileSync(this.storePath, JSON.stringify(body, null, 2));
  }
}
