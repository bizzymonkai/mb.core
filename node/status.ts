/**
 * Status page.
 *
 * GET /status      HTML checklist
 * GET /status.json the report
 *
 * Port is MB_PORT, default 8787. Relay stays on 8080.
 */

import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { runChecklist, formatChecklist, type ChecklistReport } from './checklist.js';

export const STATUS_PORT = Number(process.env.MB_PORT ?? 8787);

function html(report: ChecklistReport): string {
  const rows = report.items.map((i) => {
    const mark = i.status === 'pending' ? 'pend' : i.ok ? 'ok' : 'fail';
    const detail = i.detail && !i.ok ? ` — ${escape(i.detail)}` : '';
    return `<tr class="${mark}"><td>${mark}</td><td>${escape(i.group)}</td><td>${escape(i.name)}${detail}</td><td>${i.ms}</td></tr>`;
  }).join('');
  return `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>MB status</title>
<style>
  body { font: 14px/1.4 ui-monospace, monospace; margin: 2rem; background: #111; color: #eee; }
  h1 { font-size: 1rem; font-weight: 500; }
  .ok { color: #6c6; } .fail { color: #c66; } .pend { color: #888; }
  table { border-collapse: collapse; width: 100%; }
  td { padding: 0.25rem 0.75rem; border-bottom: 1px solid #222; }
  td:first-child { width: 4rem; }
</style>
<h1 class="${report.ok ? 'ok' : 'fail'}">${report.ok ? 'OK' : 'FAIL'} · ${report.coveredOk}/${report.covered} covered · ${report.pending} pending · ${report.at}</h1>
<table>${rows}</table>
<p><a href="/status.json">json</a></p>
</html>`;
}

function escape(s: string): string {
  return s.replace(/[&<>]/g, (c) => ({ '&': '&', '<': '<', '>': '>' }[c]!));
}

export function startStatus(port = STATUS_PORT): Promise<{ port: number; close: () => Promise<void> }> {
  const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? '/';
    if (url !== '/status' && url !== '/status.json' && url !== '/') {
      res.writeHead(404).end('not found');
      return;
    }
    const report = await runChecklist();
    if (url === '/status.json') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(report, null, 2));
      return;
    }
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end(html(report));
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address();
      const bound = typeof addr === 'object' && addr ? addr.port : port;
      resolve({
        port: bound,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}

const isMain = process.argv[1]?.endsWith('status.ts') || process.argv[1]?.endsWith('status.js');
if (isMain) {
  const { port } = await startStatus();
  console.log(`MB status  http://127.0.0.1:${port}/status`);
}
