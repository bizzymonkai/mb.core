/**
 * MB Data module.
 *
 * Kubo. Content addressing. Not identity. Not the relay.
 * Downloads the official Kubo binary, inits a repo, starts and stops the daemon.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { MODULES } from '../labels.js';

export const LABEL = MODULES.data;

export type DataState = 'stopped' | 'starting' | 'running' | 'error' | 'absent';

export interface DataStatus {
  module: typeof LABEL;
  state: DataState;
  api: string;
  binary: string;
  error?: string;
}

export interface DataOptions {
  /** Node data dir. Kubo repo lives at path/ipfs. */
  path: string;
  /** Path to the ipfs binary. If omitted, looked up under path/bin/ipfs. */
  binary?: string;
  apiPort?: number;
}

export class MbData {
  private path: string;
  private binary: string;
  private apiPort: number;
  private proc: ChildProcess | null = null;
  private state: DataState = 'stopped';
  private error?: string;

  constructor(opts: DataOptions) {
    this.path = opts.path;
    this.apiPort = opts.apiPort ?? 5001;
    this.binary = opts.binary ?? join(opts.path, 'bin', 'ipfs');
    mkdirSync(opts.path, { recursive: true });
  }

  /** Official Kubo payload. Caller runs this on install. */
  static payloadUrl(version = 'v0.32.1'): string {
    const plat = process.platform === 'darwin' ? 'darwin' : 'linux';
    const arch = process.arch === 'arm64' ? 'arm64' : 'amd64';
    return `https://dist.ipfs.tech/kubo/${version}/kubo_${version}_${plat}-${arch}.tar.gz`;
  }

  status(): DataStatus {
    return {
      module: LABEL,
      state: existsSync(this.binary) ? this.state : 'absent',
      api: `http://127.0.0.1:${this.apiPort}`,
      binary: this.binary,
      error: this.error,
    };
  }

  async init(): Promise<void> {
    if (!existsSync(this.binary)) {
      this.state = 'absent';
      throw new Error(`MB Data: Kubo binary not at ${this.binary}. Download ${MbData.payloadUrl()} and place it there.`);
    }
    const repo = join(this.path, 'ipfs');
    if (existsSync(join(repo, 'config'))) return;
    await this.run([this.binary, 'init', '--profile=lowpower'], { IPFS_PATH: repo });
  }

  async start(): Promise<void> {
    if (this.proc) return;
    await this.init();
    this.state = 'starting';
    const repo = join(this.path, 'ipfs');
    this.proc = spawn(this.binary, ['daemon', '--init'], {
      env: { ...process.env, IPFS_PATH: repo },
      stdio: 'ignore',
    });
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

  async add(file: string): Promise<string> {
    const out = await this.run([this.binary, 'add', '-Q', file], { IPFS_PATH: join(this.path, 'ipfs') });
    return out.trim();
  }

  async pin(cid: string): Promise<void> {
    await this.run([this.binary, 'pin', 'add', cid], { IPFS_PATH: join(this.path, 'ipfs') });
  }

  private run(cmd: string[], env: Record<string, string>): Promise<string> {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd[0], cmd.slice(1), { env: { ...process.env, ...env } });
      let out = '';
      let err = '';
      child.stdout?.on('data', (d) => (out += d));
      child.stderr?.on('data', (d) => (err += d));
      child.on('exit', (code) => {
        if (code === 0) resolve(out);
        else {
          this.error = err || `exit ${code}`;
          this.state = 'error';
          reject(new Error(`MB Data: ${this.error}`));
        }
      });
    });
  }
}
