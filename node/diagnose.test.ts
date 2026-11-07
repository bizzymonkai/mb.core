import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { MbNode, formatDiagnosis } from './index.js';

describe('node boot diagnostics', () => {
  it('Account diagnoses itself without a relay or Kubo', async () => {
    const node = new MbNode(mkdtempSync(join(tmpdir(), 'mb-diag-')));
    const [account] = await node.diagnose();
    expect(account.module).toBe('MB Account');
    expect(account.ok).toBe(true);
    expect(account.checks.map((c) => c.name)).toEqual([
      'generate nsec and npub',
      'import and export nsec',
      'sign a kind 0 profile',
      'NIP-44 encrypt and decrypt',
      'NIP-49 ncryptsec round trip',
    ]);
  });

  it('Relay diagnoses publish and query on boot', async () => {
    const node = new MbNode(mkdtempSync(join(tmpdir(), 'mb-diag-')));
    await node.start('relay');
    const report = node.relay.lastDiagnosis;
    expect(report?.ok).toBe(true);
    expect(report?.checks.every((c) => c.ok)).toBe(true);
    await node.stop('relay');
  });

  it('Data reports an absent binary instead of pretending it runs', async () => {
    const node = new MbNode(mkdtempSync(join(tmpdir(), 'mb-diag-')));
    const report = await node.data.diagnose();
    expect(report.ok).toBe(false);
    expect(report.checks[0].name).toBe('binary present');
    expect(report.checks[0].ok).toBe(false);
    expect(report.checks[0].detail).toMatch(/absent/);
  });

  it('formats a report a person can read', async () => {
    const node = new MbNode(mkdtempSync(join(tmpdir(), 'mb-diag-')));
    const [account] = await node.diagnose();
    const text = formatDiagnosis(account);
    expect(text.startsWith('OK  MB Account')).toBe(true);
    expect(text).toContain('generate nsec and npub');
  });
});
