import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream, readFileSync } from 'node:fs';
import { lstat, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

export const MER_RECOVERY_ROOT_20261126 = 'archives/sea-sprites-recovery-20261126';
export const MER_RECOVERY_MANIFEST_20261126 = MER_RECOVERY_ROOT_20261126 + '/ADMISSION_MANIFEST.json';
export const MER_RECOVERY_MANIFEST_SHA256_20261126 = '6f583a70d181783abacfc4e661eb39624309b7d8e71b2ca1b54e3d84111d9622';
export const MER_RECOVERY_SOURCE_FILES_20261126 = Object.freeze([
  'scripts/mer-des-chagrins-recovery-admission-20261126.mjs',
  'scripts/verify-mer-des-chagrins-recovery-admission-20261126.mjs',
]);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const validPath = path => typeof path === 'string' && path.length > 0
  && !/[\\\x00-\x1f]/.test(path) && !path.startsWith('/')
  && path.split('/').every(part => part && part !== '.' && part !== '..');

/** The independent SHA-256 pin authorizes exactly these recovered Git objects.
 * No new manifest bytes, folder prefix or historical status can authorize files. */
export function compileMerRecoveryManifest20261126(bytes, expectedSha256 = MER_RECOVERY_MANIFEST_SHA256_20261126) {
  assert.match(expectedSha256, /^[a-f0-9]{64}$/, 'Invalid reviewed Mer recovery pin.');
  assert.equal(sha256(bytes), expectedSha256, 'Unreviewed Mer recovery manifest bytes.');
  const manifest = JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.schemaVersion, 1, 'Unsupported Mer recovery schema.');
  assert.equal(manifest.root, MER_RECOVERY_ROOT_20261126, 'Unexpected Mer recovery root.');
  assert.match(manifest.sourceCommit, /^[a-f0-9]{40}$/, 'Invalid Mer recovery source commit.');
  assert.ok(Array.isArray(manifest.files) && manifest.files.length > 0, 'Missing Mer recovery files.');
  const files = new Map(), directories = new Set([MER_RECOVERY_ROOT_20261126]);
  let totalBytes = 0;
  for (const entry of manifest.files) {
    assert.ok(entry && validPath(entry.path) && entry.path.startsWith(MER_RECOVERY_ROOT_20261126 + '/')
      && entry.path !== MER_RECOVERY_MANIFEST_20261126, 'Unsafe Mer recovery member.');
    assert.equal(files.has(entry.path), false, 'Duplicate Mer recovery member: ' + entry.path);
    assert.equal(entry.mode, '100644', 'Unsupported Mer recovery file mode.');
    assert.ok(Number.isSafeInteger(entry.sizeBytes) && entry.sizeBytes >= 0, 'Invalid Mer recovery file size.');
    assert.match(entry.gitBlobSha, /^[a-f0-9]{40}$/, 'Invalid Mer recovery Git blob.');
    files.set(entry.path, Object.freeze({ ...entry }));
    totalBytes += entry.sizeBytes;
    const parts = entry.path.split('/');
    for (let i = 2; i < parts.length; i++) directories.add(parts.slice(0, i).join('/'));
  }
  for (const path of files.keys()) assert.equal(directories.has(path), false, 'Mer recovery file/directory collision: ' + path);
  assert.equal(manifest.fileCount, files.size, 'Mer recovery file count differs.');
  assert.ok(Number.isSafeInteger(totalBytes), 'Mer recovery size overflow.');
  assert.equal(manifest.totalBytes, totalBytes, 'Mer recovery byte count differs.');
  return Object.freeze({ manifest, files, directories, expectedSha256 });
}

let reviewed;
export function reviewedMerRecovery20261126() {
  return reviewed ??= compileMerRecoveryManifest20261126(
    readFileSync(new URL('../' + MER_RECOVERY_MANIFEST_20261126, import.meta.url)));
}
export function merRecoveryPathAdmission20261126(path, { directory = false, built = false } = {}) {
  if (!validPath(path)) return false;
  if (MER_RECOVERY_SOURCE_FILES_20261126.includes(path)) return !built && !directory;
  if (path !== MER_RECOVERY_ROOT_20261126 && !path.startsWith(MER_RECOVERY_ROOT_20261126 + '/')) return null;
  if (built) return false;
  const inventory = reviewedMerRecovery20261126();
  return directory ? inventory.directories.has(path) : path === MER_RECOVERY_MANIFEST_20261126 || inventory.files.has(path);
}
/** Historical copies can retain original metadata only under their exact pin. */
export function isMerRecoverySourceOnly20261126(path) {
  return typeof path === 'string' && path.startsWith(MER_RECOVERY_ROOT_20261126 + '/')
    && merRecoveryPathAdmission20261126(path) === true;
}
async function regularDirectory(path) {
  const stat = await lstat(path);
  assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), 'Invalid Mer recovery directory or symlink: ' + path);
}
async function hashFile(path, algorithm, prefix) {
  const hash = createHash(algorithm);
  if (prefix) hash.update(prefix);
  for await (const bytes of createReadStream(path)) hash.update(bytes);
  return hash.digest('hex');
}
export async function verifyMerRecoveryArchive20261126(root, { built = false, inventory } = {}) {
  root = resolve(root);
  if (built) {
    try { await lstat(join(root, MER_RECOVERY_ROOT_20261126)); }
    catch (error) { if (error.code === 'ENOENT') return { built: true, files: 0, bytes: 0 }; throw error; }
    throw new Error('Mer recovery sources must not enter the built distribution.');
  }
  inventory ??= reviewedMerRecovery20261126();
  await regularDirectory(root);
  await regularDirectory(join(root, 'archives'));
  await regularDirectory(join(root, MER_RECOVERY_ROOT_20261126));
  const manifestPath = join(root, MER_RECOVERY_MANIFEST_20261126);
  const manifestStat = await lstat(manifestPath);
  assert.ok(manifestStat.isFile() && !manifestStat.isSymbolicLink(), 'Invalid Mer recovery manifest or symlink.');
  assert.equal(await hashFile(manifestPath, 'sha256'), inventory.expectedSha256, 'Mer recovery manifest differs from reviewed bytes.');
  const seen = new Set();
  let bytes = 0;
  async function walk(directory) {
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Mer recovery symlink: ' + path);
      if (entry.isDirectory()) {
        assert.ok(inventory.directories.has(path), 'Unlisted Mer recovery directory: ' + path);
        await walk(path); continue;
      }
      assert.ok(entry.isFile(), 'Unsupported Mer recovery entry: ' + path);
      if (path === MER_RECOVERY_MANIFEST_20261126) continue;
      const expected = inventory.files.get(path);
      assert.ok(expected, 'Unlisted Mer recovery file: ' + path);
      const stat = await lstat(join(root, path));
      assert.equal(stat.size, expected.sizeBytes, 'Changed Mer recovery size: ' + path);
      assert.equal(await hashFile(join(root, path), 'sha1', 'blob ' + stat.size + '\0'), expected.gitBlobSha,
        'Changed Mer recovery Git bytes: ' + path);
      bytes += stat.size; seen.add(path);
    }
  }
  await walk(MER_RECOVERY_ROOT_20261126);
  for (const path of inventory.files.keys()) assert.ok(seen.has(path), 'Missing Mer recovery file: ' + path);
  assert.equal(await hashFile(manifestPath, 'sha256'), inventory.expectedSha256, 'Mer recovery manifest changed during verification.');
  return { built: false, files: seen.size, bytes, manifestSha256: inventory.expectedSha256 };
}
