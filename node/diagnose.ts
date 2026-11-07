/**
 * Shared diagnostic runner.
 *
 * Each module calls this with its own checks. The same checks run on boot
 * and in the unit tests. A failed check does not throw; it is recorded.
 */

export interface Check {
  name: string;
  run: () => Promise<void> | void;
}

export interface CheckResult {
  name: string;
  ok: boolean;
  detail?: string;
  ms: number;
}

export interface Diagnosis {
  module: string;
  at: string;
  ok: boolean;
  checks: CheckResult[];
}

export async function runChecks(module: string, checks: Check[]): Promise<Diagnosis> {
  const results: CheckResult[] = [];
  for (const check of checks) {
    const start = Date.now();
    try {
      await check.run();
      results.push({ name: check.name, ok: true, ms: Date.now() - start });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      results.push({ name: check.name, ok: false, detail, ms: Date.now() - start });
    }
  }
  return {
    module,
    at: new Date().toISOString(),
    ok: results.every((r) => r.ok),
    checks: results,
  };
}

export function formatDiagnosis(d: Diagnosis): string {
  const head = `${d.ok ? 'OK' : 'FAIL'}  ${d.module}  ${d.at}`;
  const lines = d.checks.map((c) => {
    const mark = c.ok ? '  ok' : '  FAIL';
    const detail = c.detail ? `  ${c.detail}` : '';
    return `${mark}  ${c.name}  ${c.ms}ms${detail}`;
  });
  return [head, ...lines].join('\n');
}
