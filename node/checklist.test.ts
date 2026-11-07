import { describe, expect, it } from 'vitest';
import { ACTIONS, runChecklist, formatChecklist } from './checklist.js';

describe('network diagnostic checklist', () => {
  it('covers every action in the README list', () => {
    const names = ACTIONS.map((a) => a.action);
    expect(new Set(names).size).toBe(names.length);
    expect(names.length).toBeGreaterThan(70);
  });

  it('every covered action passes', async () => {
    const report = await runChecklist();
    const failed = report.items.filter((i) => i.status === 'covered' && !i.ok);
    if (failed.length) {
      console.log(formatChecklist(report));
    }
    expect(failed.map((f) => `${f.name}: ${f.detail}`)).toEqual([]);
    expect(report.ok).toBe(true);
  }, 20000);

  it('pending actions are recorded, not failed', async () => {
    const report = await runChecklist();
    const pending = report.items.filter((i) => i.status === 'pending');
    expect(pending.length).toBeGreaterThan(0);
    expect(pending.every((p) => p.ok)).toBe(true);
  }, 20000);
});
