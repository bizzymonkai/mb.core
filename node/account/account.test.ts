import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MbAccount } from './index.js';
import { MbNode } from '../index.js';

describe('MB Account', () => {
  it('generates an nsec and npub', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mb-account-'));
    const account = new MbAccount(dir);
    const rec = account.generate('test');
    expect(rec.nsec.startsWith('nsec1')).toBe(true);
    expect(rec.npub.startsWith('npub1')).toBe(true);
    expect(account.status().count).toBe(1);
    expect(account.export()).toBe(rec.nsec);
  });

  it('imports an nsec and can switch', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mb-account-'));
    const account = new MbAccount(dir);
    const first = account.generate();
    const second = account.generate();
    account.switch(first.npub);
    expect(account.current()?.npub).toBe(first.npub);
    const imported = account.import(second.nsec, { makeCurrent: true });
    expect(imported.npub).toBe(second.npub);
    expect(account.current()?.npub).toBe(second.npub);
  });

  it('rejects a non-nsec', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mb-account-'));
    const account = new MbAccount(dir);
    expect(() => account.import('not-a-key')).toThrow();
  });

  it('round-trips ncryptsec (NIP-49)', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mb-account-'));
    const account = new MbAccount(dir);
    const rec = account.generate();
    const pass = 'test-passphrase';
    const ncrypt = account.exportNcryptsec(pass);
    expect(ncrypt.startsWith('ncryptsec1')).toBe(true);

    const other = new MbAccount(mkdtempSync(join(tmpdir(), 'mb-account2-')));
    const imported = other.importNcryptsec(ncrypt, pass, { makeCurrent: true });
    expect(imported.npub).toBe(rec.npub);
    expect(other.export()).toBe(rec.nsec);
  });

  it('signs an event', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mb-account-'));
    const account = new MbAccount(dir);
    account.generate();
    const unsigned = {
      kind: 1,
      content: 'hello mb',
      tags: [['class', 'Message']],
      created_at: Math.floor(Date.now() / 1000),
    };
    const signed = account.sign(unsigned);
    expect(signed.sig).toBeTruthy();
    expect(signed.pubkey).toBeTruthy();
    expect(signed.id).toBeTruthy();
  });

  it('encrypts and decrypts with NIP-44', () => {
    const dirA = mkdtempSync(join(tmpdir(), 'mb-a-'));
    const dirB = mkdtempSync(join(tmpdir(), 'mb-b-'));
    const a = new MbAccount(dirA);
    const b = new MbAccount(dirB);
    const recA = a.generate();
    const recB = b.generate();

    const plaintext = 'secret note';
    const ciphertext = a.encrypt(plaintext, recB.npub);
    const decrypted = b.decrypt(ciphertext, recA.npub);
    expect(decrypted).toBe(plaintext);
  });
});

describe('MB node modules', () => {
  it('reports three distinct modules and does not start them', () => {
    const dir = mkdtempSync(join(tmpdir(), 'mb-node-'));
    const node = new MbNode(dir);
    const s = node.status();
    expect(s.account.module).toBe('MB Account');
    expect(s.data.module).toBe('MB Data');
    expect(s.relay.module).toBe('MB Relay');
    expect(s.data.state).toBe('absent');
    expect(s.relay.state).toBe('absent');
  });
});
