import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MbNode } from './index.js';
import { runExchange, readLog, verifyAgreement } from './exchange.js';

describe('v0.1 two peers, one exchange', () => {
  it('completes a Situation to Agreement between two nodes on one relay', async () => {
    const rootA = mkdtempSync(join(tmpdir(), 'mb-a-'));
    const rootB = mkdtempSync(join(tmpdir(), 'mb-b-'));
    const port = 21000 + Math.floor(Math.random() * 10000);

    const a = new MbNode(rootA, { relayPort: port });
    const b = new MbNode(rootB);
    await a.start('relay');

    const record = await runExchange(a, b, a.relay.url);

    expect(record.situation.pubkey).toBe(a.account.pubkey());
    expect(record.offer.pubkey).toBe(b.account.pubkey());
    expect(record.messages).toHaveLength(2);
    expect(verifyAgreement(record)).toBe(true);

    const aLog = readLog(a);
    const bLog = readLog(b);
    expect(aLog.some((e) => e.id === record.situation.id)).toBe(true);
    expect(bLog.some((e) => e.id === record.situation.id)).toBe(true);
    expect(bLog.some((e) => e.id === record.offer.id)).toBe(true);

    await a.stop('relay');

    const a2 = new MbNode(rootA, { relayPort: port });
    const b2 = new MbNode(rootB);
    expect(a2.account.current()?.npub).toBe(a.account.current()?.npub);
    expect(b2.account.current()?.npub).toBe(b.account.current()?.npub);
    expect(readLog(a2).length).toBe(aLog.length);
    expect(readLog(b2).length).toBe(bLog.length);
  }, 20000);
});
