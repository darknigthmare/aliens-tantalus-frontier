import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, writeFile, rm, symlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { test } from 'node:test';
import {
  MER_RECOVERY_ROOT_20261126 as recoveryRoot, MER_RECOVERY_MANIFEST_20261126 as manifestPath,
  MER_RECOVERY_SOURCE_FILES_20261126 as sourceFiles,
  reviewedMerRecovery20261126, compileMerRecoveryManifest20261126,
  merRecoveryPathAdmission20261126, verifyMerRecoveryArchive20261126,
} from './mer-des-chagrins-recovery-admission-20261126.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { createBuildAssetFilter } from './build-asset-filter.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const gitBlob = bytes => createHash('sha1').update('blob ' + bytes.length + '\0').update(bytes).digest('hex');
const compile = value => { const bytes = encode(value); return compileMerRecoveryManifest20261126(bytes, sha(bytes)); };
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'mer-recovery-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  // Tiny byte fixtures exercise archive integrity, not PNG rendering.
  const contents = new Map([
    [recoveryRoot + '/source/notes.md', Buffer.from('Historical exact bytes\r\n')],
    [recoveryRoot + '/sprites-complete/decor/valve.png', Buffer.concat([Buffer.from('fixture binary bytes'), Buffer.from([0, 1, 2])])],
  ]);
  const manifest = { schemaVersion: 1, root: recoveryRoot, sourceCommit: '7efa1b55eb12c3c4b7401940048ffa2e30caf04a',
    fileCount: contents.size, totalBytes: [...contents.values()].reduce((sum, b) => sum + b.length, 0),
    files: [...contents].map(([path, bytes]) => ({ path, mode: '100644', sizeBytes: bytes.length, gitBlobSha: gitBlob(bytes) })) };
  for (const [path, bytes] of [...contents, [manifestPath, encode(manifest)]]) {
    await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), bytes);
  }
  return { root, manifest, contents, inventory: compile(manifest) };
}
test('the independent recovery pin preserves every source path and excludes all of them from builds', () => {
  const inventory = reviewedMerRecovery20261126();
  assert.equal(inventory.files.size, 151);
  assert.equal(inventory.manifest.totalBytes, 274780120);
  assert.equal(inventory.manifest.sourceCommit, 'e716f75318f243a981fdf6e64728cd6f039ad6dd');
  const filter = createBuildAssetFilter(process.cwd());
  for (const path of [...inventory.files.keys(), manifestPath, ...sourceFiles]) {
    assert.equal(merRecoveryPathAdmission20261126(path), true, path);
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(merRecoveryPathAdmission20261126(path, { directory: true }), false, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    assert.equal(filter(join(process.cwd(), path)), false, path);
  }
  for (const path of inventory.directories) {
    assert.equal(merRecoveryPathAdmission20261126(path, { directory: true }), true, path);
    assert.equal(merRecoveryPathAdmission20261126(path), false, path);
    assert.equal(merRecoveryPathAdmission20261126(path, { built: true, directory: true }), false, path);
  }
  for (const path of [recoveryRoot + '/unlisted.js', recoveryRoot + '/sprites-complete/unknown.png',
    recoveryRoot + '/../escape', recoveryRoot + '//bad', '/' + recoveryRoot, recoveryRoot + '\\escape'])
    assert.equal(merRecoveryPathAdmission20261126(path), false, path);
  assert.equal(merRecoveryPathAdmission20261126('src/app.js'), null);
});
test('a recovery manifest cannot authorize itself or unsafe inventory changes', async t => {
  const f = await fixture(t); const altered = structuredClone(f.manifest); altered.files[0].gitBlobSha = '0'.repeat(40);
  assert.throws(() => compileMerRecoveryManifest20261126(encode(altered), sha(encode(f.manifest))), /Unreviewed/);
  for (const path of [recoveryRoot + '/../escape', 'src/app.js', manifestPath, recoveryRoot + '/source']) {
    const m = structuredClone(f.manifest); m.files[0].path = path;
    if (path.endsWith('/source')) m.files[1].path = path + '/child';
    assert.throws(() => compile(m), /Unsafe|collision/);
  }
  const duplicate = structuredClone(f.manifest); duplicate.files.push({ ...duplicate.files[0] });
  assert.throws(() => compile(duplicate), /Duplicate/);
});
test('recovery verification checks every exact Git blob and the reviewed manifest bytes', async t => {
  const f = await fixture(t);
  const result = await verifyMerRecoveryArchive20261126(f.root, { inventory: f.inventory });
  assert.equal(result.files, 2); assert.equal(result.bytes, f.manifest.totalBytes);
  await writeFile(join(f.root, manifestPath), encode({ ...f.manifest, sourceCommit: '0'.repeat(40) }));
  await assert.rejects(verifyMerRecoveryArchive20261126(f.root, { inventory: f.inventory }), /manifest differs/);
});
test('same-size changes, truncation and missing recovered files fail verification', async t => {
  const f = await fixture(t); const [path, original] = [...f.contents][0];
  await writeFile(join(f.root, path), Buffer.alloc(original.length, 65));
  await assert.rejects(verifyMerRecoveryArchive20261126(f.root, { inventory: f.inventory }), /Changed Mer recovery Git bytes/);
  await writeFile(join(f.root, path), original.subarray(1));
  await assert.rejects(verifyMerRecoveryArchive20261126(f.root, { inventory: f.inventory }), /Changed Mer recovery size/);
  await rm(join(f.root, path));
  await assert.rejects(verifyMerRecoveryArchive20261126(f.root, { inventory: f.inventory }), /Missing Mer recovery file/);
});
test('unknown source entries and symlinks cannot hide inside the recovery archive', async t => {
  const f = await fixture(t); const extra = join(f.root, recoveryRoot, 'unknown');
  await mkdir(extra);
  await assert.rejects(verifyMerRecoveryArchive20261126(f.root, { inventory: f.inventory }), /Unlisted Mer recovery directory/);
  await rm(extra, { recursive: true }); await writeFile(extra, 'unlisted');
  await assert.rejects(verifyMerRecoveryArchive20261126(f.root, { inventory: f.inventory }), /Unlisted Mer recovery file/);
  await rm(extra); const [path] = [...f.contents.keys()]; await rm(join(f.root, path)); await symlink(manifestPath, join(f.root, path));
  await assert.rejects(verifyMerRecoveryArchive20261126(f.root, { inventory: f.inventory }), /symlink/);
});
test('built verification refuses the recovery root even when it is empty', async t => {
  const f = await fixture(t);
  await assert.rejects(verifyMerRecoveryArchive20261126(f.root, { built: true }), /must not enter/);
  await rm(join(f.root, recoveryRoot), { recursive: true });
  assert.deepEqual(await verifyMerRecoveryArchive20261126(f.root, { built: true }), { built: true, files: 0, bytes: 0 });
  await mkdir(join(f.root, recoveryRoot));
  await assert.rejects(verifyMerRecoveryArchive20261126(f.root, { built: true }), /must not enter/);
});
