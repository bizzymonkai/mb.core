import { describe, expect, it } from 'vitest';
import { startStatus } from './status.js';

describe('status page', () => {
  it('serves the checklist at /status', async () => {
    const { port, close } = await startStatus(0);
    const res = await fetch(`http://127.0.0.1:${port}/status`);
    const body = await res.text();
    expect(res.status).toBe(200);
    expect(body).toContain('covered');
    expect(body).toContain('generates a key');
    await close();
  }, 15000);

  it('serves json at /status.json', async () => {
    const { port, close } = await startStatus(0);
    const res = await fetch(`http://127.0.0.1:${port}/status.json`);
    const body = await res.json();
    expect(body.items.length).toBeGreaterThan(70);
    expect(typeof body.ok).toBe('boolean');
    await close();
  }, 15000);
});
