/**
 * MB Account module.
 *
 * Nostr identity and keys. Not the relay. Not the data store.
 * Keygen, import, and export are nostr-tools calls. MB does not implement the key math.
 */

import { generateSecretKey, getPublicKey } from 'nostr-tools';
import * as nip19 from 'nostr-tools/nip19';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { MODULES } from '../labels.js';

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

  /** Reveal the nsec. Explicit. Never sent to a relay by this module. */
  export(npub?: string): string {
    const key = npub ?? this.currentNpub;
    if (!key) throw new Error('MB Account: no current key');
    const rec = this.records.get(key);
    if (!rec) throw new Error('MB Account: unknown npub');
    return rec.nsec;
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
