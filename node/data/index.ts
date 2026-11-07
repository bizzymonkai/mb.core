/**
 * MB Data module.
 *
 * Kubo. Content addressing. Not identity. Not the relay.
 * Does not ship the binary. On install it fetches the pinned official build
 * for this OS, checks the published SHA512, and extracts it into the data dir.
 */

import { spawn, type ChildProcess } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, existsSync, writeFileSync, readFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { MODULES } from '../labels.js';

export const LABEL = MODULES.data;

/** Pinned. Bump on purpose. Matches a published Kubo release. */
export const KUBO_VERSION = 'v0.43.1';

export type DataState = 'stopped' | 'starting' | 'running' | 'error' | 'absent';

export interface DataStatus {
  module: typeof LABEL;
  state: DataState;
  api: string;
  binary: string;
  version: string;
  error?: string;
}

export interface DataOptions {
  path: string;
  binary?: string;
  apiPort?: number;
  version?: string;
}

export class MbData {
  private path: string;
  private binary: string;
  private apiPort: number;
  private version: string;
  private proc: ChildProcess | null = null;
  private state: DataState = 'stopped';
  private error?: string;

  constructor(opts: DataOptions) {
    this.path = opts.path;
    this.apiPort = opts.apiPort ?? 5001;
    this.version = opts.version ?? KUBO_VERSION;
    this.binary = opts.binary ?? process.env.KUBO_BINARY ?? join(opts.path, 'bin', 'ipfs');
    mkdirSync(opts.path, { recursive: true });
  }

  /** Official archive for this OS and arch. GitHub releases, same artifacts as dist.ipfs.tech. */
  static payloadUrl(version = KUBO_VERSION): string {
    const plat = process.platform === 'darwin' ? 'darwin' : process.platform === 'win32' ? 'windows' : 'linux';
    const arch = process.arch === 'arm64' ? 'arm64' : 'amd64';
    return `https://github.com/ipfs/kubo/releases/download/${version}/kubo_${version}_${plat}-${arch}.tar.gz`;
  }

  status(): DataStatus {
    return {
      module: LABEL,
      state: existsSync(this.binary) ? this.state : 'absent',
      api: `http://127.0.0.1:${this.apiPort}`,
      binary: this.binary,
      version: this.version,
      error: this.error,
    };
  }

  /**
   * Retrieve the binary if it is not already here.
   * Order: existing file, KUBO_BINARY, then download + SHA512 check + extract.
   */
  async ensureBinary(): Promise<string> {
    if (existsSync(this.binary)) return this.binary;
    const url = MbData.payloadUrl(this.version);
    const archive = join(this.path, `kubo_${this.version}.tar.gz`);
    const sumUrl = `${url}.sha512`;
    const archiveBytes = await fetchBytes(url);
    const expected = (await fetchText(sumUrl)).trim().split(/\s+/)[0];
    const actual = createHash('sha512').update(archiveBytes).digest('hex');
    if (actual !== expected) {
      this.state = 'error';
      this.error = 'SHA512 mismatch';
      throw new Error(`MB Data: SHA512 mismatch for ${url}`);
    }
    writeFileSync(archive, archiveBytes);
    const binDir = join(this.path, 'bin');
    mkdirSync(binDir, { recursive: true });
    await this.run(['tar', '-xzf', archive, '-C', this.path], {});
    const extracted = join(this.path, 'kubo', 'ipfs');
    if (!existsSync(extracted)) {
      throw new Error('MB Data: archive did not contain kubo/ipfs');
    }
    const dest = join(binDir, 'ipfs');
    writeFileSync(dest, readFileSync(extracted));
    chmodSync(dest, 0o755);
    this.binary = dest;
    this.state = 'stopped';
    return dest;
  }

  async init(): Promise<void> {
    await this.ensureBinary();
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
    await this.ensureBinary();
    const out = await this.run([this.binary, 'add', '-Q', file], { IPFS_PATH: join(this.path, 'ipfs') });
    return out.trim();
  }

  async pin(cid: string): Promise<void> {
    await this.ensureBinary();
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

async function fetchBytes(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MB Data: ${res.status} fetching ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MB Data: ${res.status} fetching ${url}`);
  return res.text();
}
