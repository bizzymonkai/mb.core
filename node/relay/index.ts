/**
 * MB Relay module.
 *
 * Nostr relay. Transport and NIP-29 groups. Not identity. Not content addressing.
 * Manages a relay binary (nostr-rs-relay, strfry, or equivalent). MB does not write the relay.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { MODULES } from '../labels.js';

export const LABEL = MODULES.relay;

export type RelayState = 'stopped' | 'starting' | 'running' | 'error' | 'absent';

export interface RelayStatus {
  module: typeof LABEL;
  state: RelayState;
  url: string;
  binary: string;
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
  private state: RelayState = 'stopped';
  private error?: string;

  constructor(opts: RelayOptions) {
    this.path = opts.path;
    this.port = opts.port ?? 8080;
    this.nip29 = opts.nip29 ?? true;
    this.binary = opts.binary ?? join(opts.path, 'bin', 'nostr-rs-relay');
    mkdirSync(opts.path, { recursive: true });
  }

  status(): RelayStatus {
    return {
      module: LABEL,
      state: existsSync(this.binary) ? this.state : 'absent',
      url: `ws://127.0.0.1:${this.port}`,
      binary: this.binary,
      nip29: this.nip29,
      error: this.error,
    };
  }

  /** Write a loopback config. Does not start the process. */
  configure(): string {
    const cfg = join(this.path, 'relay.toml');
    const body = [
      `[network]`,
      `port = ${this.port}`,
      `address = "127.0.0.1"`,
      ``,
      `[limits]`,
      `# NIP-29 groups are hosted by this relay when the binary supports them.`,
      ``,
    ].join('\n');
    writeFileSync(cfg, body);
    return cfg;
  }

  async start(): Promise<void> {
    if (this.proc) return;
    if (!existsSync(this.binary)) {
      this.state = 'absent';
      throw new Error(`MB Relay: binary not at ${this.binary}. Place nostr-rs-relay or strfry there.`);
    }
    const cfg = this.configure();
    this.state = 'starting';
    this.proc = spawn(this.binary, ['--config', cfg], { stdio: 'ignore' });
    this.proc.on('exit', () => {
      this.proc = null;
      if (this.state !== 'stopped') this.state = 'stopped';
    });
    this.state = 'running';
  }

  async stop(): Promise<void> {
    if (!this.proc) {
      this.state = 'stopped';
      return;
    }
    this.proc.kill('SIGINT');
    this.proc = null;
    this.state = 'stopped';
  }
}
