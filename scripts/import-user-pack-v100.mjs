import assert from 'node:assert/strict';
import { copyFile, mkdir, readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve, sep } from 'node:path';
import { USER_PACK_V100 } from '../src/user-pack-v100.js';
import { USER_REFERENCE_RECOVERY_V100 } from '../src/user-reference-recovery-v100.js';

// Original-byte import only. No pixel edits, generated output, or deletion.
const args = process.argv.slice(2);
const option = key => { const at = args.indexOf(key); return at >= 0 ? args[at + 1] : null; };
const packSource = option('--pack-source'), oldSource = option('--recovery-source');
assert.ok(packSource && oldSource, 'Supply --pack-source and --recovery-source directories');
const root = process.cwd();
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
let copied = 0, verified = 0;
for (const entry of [...USER_PACK_V100, ...USER_REFERENCE_RECOVERY_V100]) {
  const destination = resolve(root, '.' + entry.path);
  assert.ok(destination.startsWith(resolve(root, 'assets/user') + sep));
  const sourceRoot = resolve(entry.sourceBatch === '270926' ? packSource : oldSource);
  const source = entry.path.includes('/castes-v87/') ? destination : resolve(sourceRoot, entry.sourceFile);
  if (source !== destination) assert.ok(source.startsWith(sourceRoot + sep));
  const bytes = await readFile(source);
  assert.equal(hash(bytes), entry.sourceSha256, entry.sourceFile);
  let exists = true;
  try { await access(destination); } catch (error) { if (error.code !== 'ENOENT') throw error; exists = false; }
  if (exists) assert.equal(hash(await readFile(destination)), entry.sourceSha256, `Existing file differs: ${entry.path}`);
  else {
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
    assert.equal(hash(await readFile(destination)), entry.sourceSha256, entry.path);
    copied++;
  }
  verified++;
}
console.log(JSON.stringify({ copied, verified, mode: 'original-bytes-unchanged' }));
