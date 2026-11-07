/**
 * MB node.
 *
 * One process. Three modules. Data and Relay toggle independently.
 * Account has no process. It is always available.
 */

import { join } from 'node:path';
import { MbData } from './data/index.js';
import { MbAccount } from './account/index.js';
import { MbRelay } from './relay/index.js';
import { MODULES, type ModuleId } from './labels.js';
import { formatDiagnosis, type Diagnosis } from './diagnose.js';

export { MODULES };
export { MbData } from './data/index.js';
export { MbAccount } from './account/index.js';
export { MbRelay } from './relay/index.js';
export { formatDiagnosis, type Diagnosis } from './diagnose.js';

export interface NodeStatus {
  data: ReturnType<MbData['status']>;
  account: ReturnType<MbAccount['status']>;
  relay: ReturnType<MbRelay['status']>;
}

export class MbNode {
  readonly data: MbData;
  readonly account: MbAccount;
  readonly relay: MbRelay;

  constructor(root: string, opts: { relayPort?: number } = {}) {
    this.data = new MbData({ path: join(root, 'data') });
    this.account = new MbAccount(join(root, 'account'));
    this.relay = new MbRelay({ path: join(root, 'relay'), port: opts.relayPort });
  }

  status(): NodeStatus {
    return {
      data: this.data.status(),
      account: this.account.status(),
      relay: this.relay.status(),
    };
  }

  /** Create dirs, relay config, and ensure the Kubo binary is present. Does not derive a key. */
  async install(): Promise<void> {
    this.relay.configure();
    await this.data.ensureBinary();
  }

  async start(which: 'data' | 'relay' | 'both' = 'both'): Promise<void> {
    if (which === 'data' || which === 'both') {
      await this.data.start();
      await this.data.diagnose();
    }
    if (which === 'relay' || which === 'both') {
      await this.relay.start();
      await this.relay.diagnose();
    }
  }

  /**
   * Boot diagnostic. Account always. Data and Relay if they are up.
   * Returns one report per module. Does not throw.
   */
  async diagnose(): Promise<Diagnosis[]> {
    const reports = [await this.account.diagnose()];
    if (this.data.status().state === 'running') reports.push(await this.data.diagnose());
    if (this.relay.status().state === 'running') reports.push(await this.relay.diagnose());
    return reports;
  }

  async stop(which: 'data' | 'relay' | 'both' = 'both'): Promise<void> {
    if (which === 'data' || which === 'both') await this.data.stop();
    if (which === 'relay' || which === 'both') await this.relay.stop();
  }
}

export const moduleNames: Record<ModuleId, string> = MODULES;
