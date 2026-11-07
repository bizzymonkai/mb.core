/**
 * MB Relay module.
 *
 * Nostr relay. Transport. Not identity. Not content addressing.
 *
 * Ships with an in-process NIP-01 relay (memorelay) so the node runs without a binary.
 * A binary (nostr-rs-relay, strfry) can replace it. NIP-29 groups require the binary.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { createServer, type Server } from 'node:http';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { Memorelay } from 'memorelay';
import { Relay, useWebSocketImplementation } from 'nostr-tools/relay';
import type { Event, Filter } from 'nostr-tools';
import WebSocket from 'ws';
import { MODULES } from '../labels.js';

/** nostr-tools expects event.data to be a string. ws delivers a Buffer. */
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

export const LABEL = MODULES.relay;

export type RelayState = 'stopped' | 'starting' | 'running' | 'error' | 'absent';

export interface RelayStatus {
  module: typeof LABEL;
  state: RelayState;
  url: string;
  mode: 'in-process' | 'binary' | 'absent';
  nip01: boolean;
  nip29: boolean;
  error?: string;
}

export interface RelayOptions {
  path: string;
  binary?: string;
  port?: number;
  nip29?: boolean;
}

export class MbRelay {
  private path: string;
  private binary: string;
  private port: number;
  private nip29: boolean;
  private proc: ChildProcess | null = null;
  private http: Server | null = null;
  private memo: Memorelay | null = null;
  private state: RelayState = 'stopped';
  private mode: 'in-process' | 'binary' | 'absent' = 'absent';
  private error?: string;

  constructor(opts: RelayOptions) {
    this.path = opts.path;
    this.port = opts.port ?? 8080;
    this.nip29 = opts.nip29 ?? false;
    this.binary = opts.binary ?? process.env.MB_RELAY_BINARY ?? join(opts.path, 'bin', 'nostr-rs-relay');
    mkdirSync(opts.path, { recursive: true });
  }

  get url(): string {
    return `ws://127.0.0.1:${this.port}`;
  }

  status(): RelayStatus {
    const hasBinary = existsSync(this.binary);
    return {
      module: LABEL,
      state: this.state,
      url: this.url,
      mode: this.mode === 'absent' && hasBinary ? 'binary' : this.mode,
      nip01: true,
      nip29: this.nip29 && hasBinary,
      error: this.error,
    };
  }

  configure(): string {
    const cfg = join(this.path, 'relay.toml');
    writeFileSync(cfg, [
      `[network]`,
      `port = ${this.port}`,
      `address = "127.0.0.1"`,
      ``,
    ].join('\n'));
    return cfg;
  }

  /**
   * Start the bound relay.
   * Binary if present and nip29 requested, otherwise the in-process NIP-01 relay.
   */
  async start(): Promise<void> {
    if (this.state === 'running') return;
    if (this.nip29 && existsSync(this.binary)) {
      await this.startBinary();
      return;
    }
    await this.startInProcess();
  }

  private async startInProcess(): Promise<void> {
    this.state = 'starting';
    this.memo = new Memorelay().connect();
    this.http = createServer(this.memo.handleRequest());
    this.http.on('upgrade', this.memo.handleUpgrade());
    await new Promise<void>((resolve, reject) => {
      this.http!.once('error', reject);
      this.http!.listen(this.port, '127.0.0.1', () => resolve());
    });
    this.mode = 'in-process';
    this.state = 'running';
  }

  private async startBinary(): Promise<void> {
    const cfg = this.configure();
    this.state = 'starting';
    this.proc = spawn(this.binary, ['--config', cfg], { stdio: 'ignore' });
    this.proc.on('exit', () => {
      this.proc = null;
      if (this.state !== 'stopped') this.state = 'stopped';
    });
    this.mode = 'binary';
    this.state = 'running';
  }

  async stop(): Promise<void> {
    if (this.proc) {
      this.proc.kill('SIGINT');
      this.proc = null;
    }
    if (this.http) {
      await new Promise<void>((resolve) => this.http!.close(() => resolve()));
      this.http = null;
      this.memo = null;
    }
    this.state = 'stopped';
    this.mode = 'absent';
  }

  /** Publish a signed event to the bound relay. */
  async publish(event: Event): Promise<void> {
    const relay = await Relay.connect(this.url);
    try {
      await relay.publish(event);
    } finally {
      relay.close();
    }
  }

  /** One-shot query. Collects events until EOSE. */
  async query(filter: Filter): Promise<Event[]> {
    const relay = await Relay.connect(this.url);
    try {
      const events: Event[] = [];
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('MB Relay: query timed out')), 5000);
        relay.subscribe([filter], {
          onevent: (e) => events.push(e),
          oneose: () => {
            clearTimeout(timer);
            resolve();
          },
        });
      });
      return events;
    } finally {
      relay.close();
    }
  }

  /** Live subscription. Returns an unsubscribe function. */
  async subscribe(filter: Filter, onEvent: (e: Event) => void): Promise<() => void> {
    const relay = await Relay.connect(this.url);
    const sub = relay.subscribe([filter], { onevent: onEvent });
    return () => {
      sub.close();
      relay.close();
    };
  }
}
