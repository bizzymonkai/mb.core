import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MbAccount } from '../account/index.js';
import { MbRelay } from './index.js';

describe('MB Relay', () => {
  it('starts an in-process relay, publishes, and queries', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'mb-relay-'));
    const account = new MbAccount(join(dir, 'account'));
    const port = 18080 + Math.floor(Math.random() * 1000);
    const r = new MbRelay({ path: join(dir, 'relay'), port });
    await r.start();
    expect(r.status().state).toBe('running');
    expect(r.status().mode).toBe('in-process');

    const profile = account.generate('relay-test');
    const event = account.setProfile({ name: 'mb' });
    await r.publish(event);
    const found = await r.query({ kinds: [0], authors: [account.pubkey()] });
    expect(found.length).toBe(1);
    expect(JSON.parse(found[0].content).name).toBe('mb');
    await r.stop();
    expect(profile.npub.startsWith('npub1')).toBe(true);
  });
});
