/**
 * Boot the node and print each module's diagnosis.
 * Usage: node --experimental-strip-types node/diagnose-cli.ts [root]
 */
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { MbNode, formatDiagnosis } from './index.js';

const root = process.argv[2] ?? mkdtempSync(join(tmpdir(), 'mb-node-'));
const node = new MbNode(root);

const account = await node.account.diagnose();
console.log(formatDiagnosis(account));
console.log();

await node.relay.start();
const relay = await node.relay.diagnose();
console.log(formatDiagnosis(relay));
console.log();

const data = await node.data.diagnose();
console.log(formatDiagnosis(data));

await node.relay.stop();
process.exit(account.ok && relay.ok ? 0 : 1);
