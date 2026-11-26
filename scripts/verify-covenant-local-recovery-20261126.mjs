import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, lstat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { COVENANT_RECOVERY_ROOT, COVENANT_RECOVERY_MANIFEST,
  compileCovenantLocalRecovery, reviewedCovenantLocalRecovery } from './covenant-local-recovery-20261126.mjs';
import { publicCovenantPathAdmissionV011 as admit } from './public-covenant-admissions-v011.mjs';
import { covenantSourceMetadataPathV011, reviewedCovenantSourceMetadataV011 } from './build-covenant-v011.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const reviewed = reviewedCovenantLocalRecovery();
const seen = new Set();
let totalBytes = 0;
async function walk(path) {
  for (const item of await readdir(join(root, path), { withFileTypes: true })) {
    const relative = path + '/' + item.name;
    assert.equal(item.isSymbolicLink(), false, 'Symlink in recovery');
    assert.equal(admit(relative, { directory: item.isDirectory() }), true, 'Unlisted recovery path: ' + relative);
    assert.equal(admit(relative, { directory: item.isDirectory(), built: true }), false, 'Recovery leaked to build');
    if (item.isDirectory()) { await walk(relative); continue; }
    assert.equal(item.isFile(), true);
    if (relative === COVENANT_RECOVERY_MANIFEST || relative === COVENANT_RECOVERY_ROOT + '/README.md') continue;
    const expected = reviewed.files.get(relative);
    const actual = await readFile(join(root, relative));
    assert.equal((await lstat(join(root, relative))).size, expected.sizeBytes, relative);
    assert.equal(actual.length, expected.sizeBytes, relative);
    assert.equal(hash(actual), expected.sha256, relative);
    seen.add(relative); totalBytes += actual.length;
  }
}
await walk(COVENANT_RECOVERY_ROOT);
assert.equal(seen.size, reviewed.files.size);
for (const path of reviewed.files.keys()) assert.ok(seen.has(path), 'Missing recovery file: ' + path);
assert.equal(seen.size, 46);
assert.equal(totalBytes, 32263702);
assert.equal(admit(COVENANT_RECOVERY_ROOT + '/unexpected.png'), false);
assert.equal(admit(COVENANT_RECOVERY_ROOT + '/../unexpected.png'), false);
const manifestBytes = await readFile(join(root, COVENANT_RECOVERY_MANIFEST));
assert.throws(() => compileCovenantLocalRecovery(Buffer.concat([manifestBytes, Buffer.from(' ')])));
for (const path of [COVENANT_RECOVERY_MANIFEST, COVENANT_RECOVERY_ROOT + '/qa/v015/recovered-png-qa.json']) {
  const bytes = await readFile(join(root, path));
  assert.equal(covenantSourceMetadataPathV011(path), true);
  assert.equal(reviewedCovenantSourceMetadataV011(path, bytes), true);
  assert.equal(reviewedCovenantSourceMetadataV011(path, Buffer.concat([bytes, Buffer.from(' ')])), false);
  assert.equal(reviewedCovenantSourceMetadataV011(path, bytes, { built: true }), false);
}

// Confirm that this preservation pass did not promote any generation or alter gameplay.
const runtimeBytes = await readFile(join(root, 'dlc/covenant/sprites-v011.json'));
assert.equal(hash(runtimeBytes), 'f43305542a68190d5f44b53305612e58664ddc556ee89e264735e5af9ec1046d');
const runtime = JSON.parse(runtimeBytes.toString('utf8'));
assert.equal(runtime.assets.length, 81);
const production = [];
for (const version of ['011', '012', '013', '014', '015', '016', '017']) {
  const manifest = JSON.parse(await readFile(join(root, 'assets/openai/sprites/alien-covenant-v' + version + '/manifest.json'), 'utf8'));
  production.push(...manifest.assets);
}
assert.equal(production.length, 154);
const productionHashes = new Set(production.map(row => row.sha256));
const images = [...reviewed.files.values()].filter(row => row.kind === 'generated-image');
assert.equal(images.length, 16);
assert.equal(images.filter(row => row.status === 'superseded-iteration').length, 6);
assert.equal(images.filter(row => row.status === 'unassigned-generation-candidate').length, 10);
for (const image of images) assert.equal(productionHashes.has(image.sha256), false);
for (const existing of reviewed.manifest.alreadyPublished) {
  const bytes = await readFile(join(root, existing.existingPaths[0]));
  assert.equal(bytes.length, existing.sizeBytes);
  assert.equal(hash(bytes), existing.sha256);
}
console.log(JSON.stringify({ ok: true, archivedFiles: seen.size, archivedBytes: totalBytes,
  alreadyPublishedIdentical: reviewed.manifest.alreadyPublished.length, recoveredImages: images.length,
  sourceOnly: true, runtimeSpritesUnchanged: runtime.assets.length, productionSpritesUnchanged: production.length,
  rejectedOrUnassignedPromoted: 0, manifestTamperingRejected: true, unlistedPathRejected: true,
  builtAdmissionRejected: true, browserPlaythroughRun: false }, null, 2));
