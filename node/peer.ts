/**
 * One peer. One command.
 *
 * Mini:   npm run peer
 * Laptop: npm run peer -- --relay ws://MINI_IP:8080
 *
 * Type a line and press enter:
 *   situation need a ride to the store
 *   offer I can drive
 *   message what time
 *   agree ride to the store, 5
 *   quit
 */

import { createInterface } from 'node:readline';
import { networkInterfaces } from 'node:os';
import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { Relay, useWebSocketImplementation } from 'nostr-tools/relay';
import WebSocket from 'ws';
import { MbNode } from './index.js';
import { createSituation, createOffer, createMessage, createAgreement } from '../core/src/primitives.js';
import type { Note } from '../core/vendor/notention/types/domain.js';

function asStringWebSocket(Base: typeof WebSocket) {
  return class StringWebSocket extends Base {
    override set onmessage(fn: ((ev: { data: string }) => void) | null) {
      super.onmessage = fn
        ? (ev: { data: Buffer | string }) => {
            const data = typeof ev.data === 'string' ? ev.data : ev.data.toString();
            fn({ data });
          }
        : null;
    }
    override get onmessage() {
      return super.onmessage as ((ev: { data: string }) => void) | null;
    }
  };
}
useWebSocketImplementation(asStringWebSocket(WebSocket));

function lanIp(): string {
  const ifaces = networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const info of ifaces[name] ?? []) {
      if (info.family === 'IPv4' && !info.internal) return info.address;
    }
  }
  return '127.0.0.1';
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function publish(url: string, node: MbNode, note: Note, extra: string[][] = []): Promise<void> {
  const event = node.account.sign({
    kind: 1,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['t', `class:${note.tags.find((t) => t.startsWith('class:'))?.slice(6) ?? 'note'}`], ...extra],
    content: JSON.stringify({ id: note.id, title: note.title, tags: note.tags, properties: note.properties }),
  });
  const relay = await Relay.connect(url);
  try {
    await relay.publish(event);
  } finally {
    relay.close();
  }
  appendFileSync(join(node.account['dir'] as string, 'log.jsonl'), JSON.stringify(event) + '\n');
  console.log('published', event.id.slice(0, 12), note.title);
}

async function main(): Promise<void> {
  const remote = arg('--relay');
  const root = process.env.MB_ROOT ?? join(process.env.HOME ?? '.', 'mb-peer');
  const host = remote ? '127.0.0.1' : (process.env.MB_RELAY_HOST ?? '0.0.0.0');
  const node = new MbNode(root, { relayPort: 8080 });
  if (!node.account.current()) node.account.generate('peer');

  let url: string;
  if (remote) {
    url = remote;
    console.log('peer', node.account.current()?.npub);
    console.log('relay', url);
  } else {
    process.env.MB_RELAY_HOST = host;
    await node.start('relay');
    url = `ws://${lanIp()}:8080`;
    console.log('peer', node.account.current()?.npub);
    console.log('relay', url);
    console.log('other machine: npm run peer -- --relay', url);
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });
  rl.prompt();
  rl.on('line', async (line) => {
    const [cmd, ...rest] = line.trim().split(/\s+/);
    const text = rest.join(' ');
    try {
      if (cmd === 'situation') await publish(url, node, createSituation({ title: text, target: 'network' }));
      else if (cmd === 'offer') await publish(url, node, createOffer({ title: text, role: 'listing' }));
      else if (cmd === 'message') await publish(url, node, createMessage({ title: text, content: text }));
      else if (cmd === 'agree') await publish(url, node, createAgreement({ title: 'agreement', terms: text }));
      else if (cmd === 'quit') process.exit(0);
      else if (cmd) console.log('situation | offer | message | agree | quit');
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
    }
    rl.prompt();
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
