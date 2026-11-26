import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { lstat, readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const ALIEN_ISOLATION_MODULE_ROOT = 'modules/alien-isolation';
export const ALIEN_ISOLATION_RECOVERY_ROOT = `${ALIEN_ISOLATION_MODULE_ROOT}/v0.8`;
export const ALIEN_ISOLATION_RECOVERY_MANIFEST = `${ALIEN_ISOLATION_MODULE_ROOT}/RECOVERY_MANIFEST.json`;
// The immutable, recovered V0.8 package is reviewed independently of its inventory.
export const ALIEN_ISOLATION_RECOVERY_MANIFEST_SHA256 = '6b95945eec2a27741eadc8c36da51729a5bcac0f54aae4d4ea8506dfa4357bde';
export const ALIEN_ISOLATION_ARCHIVE_SHA256 = '880f74e69551afd41af36b62c34778dd239a10386f573cb86eb170641855a978';
export const ALIEN_ISOLATION_GAME_SHA256 = 'e21c5a50305e392dd8ee324783f2e6b9448f78001e342255a34c024440928df9';
export const ALIEN_ISOLATION_GAME_BYTES = 1107027;
export const ALIEN_ISOLATION_RUNTIME_ROOT = 'dlc/alien-isolation';
export const ALIEN_ISOLATION_RUNTIME_FILES = Object.freeze([
  ALIEN_ISOLATION_RUNTIME_ROOT + '/index.html', ALIEN_ISOLATION_RUNTIME_ROOT + '/game.html',
]);
export const ALIEN_ISOLATION_SOURCE_ONLY_FILES = Object.freeze([
  ALIEN_ISOLATION_MODULE_ROOT + '/README.md', ALIEN_ISOLATION_RECOVERY_MANIFEST,
  'scripts/public-alien-isolation-dlc-admissions.mjs',
  'scripts/build-alien-isolation-dlc.mjs',
  'scripts/verify-alien-isolation-dlc-integration.mjs',
  'scripts/qa-alien-isolation-integration.py',
  'scripts/recover-alien-isolation-source.py',
  '.github/workflows/recover-alien-isolation-source.yml',
  '.github/workflows/alien-isolation-dlc.yml',
  'docs/development/ALIEN_ISOLATION_GITHUB_INTEGRATION_20261126.md',
  'docs/development/ALIEN_ISOLATION_GITHUB_INTEGRATION_20261126.json',
]);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const validPath = path => typeof path === 'string' && path.length > 0
  && !/[\\\x00-\x1f]/.test(path) && !path.startsWith('/')
  && path.split('/').every(part => part && part !== '.' && part !== '..');

/** A changed manifest cannot grant itself new source files or new byte hashes. */
export function compileAlienIsolationRecoveryManifest(bytes, expectedSha256 = ALIEN_ISOLATION_RECOVERY_MANIFEST_SHA256) {
  assert.match(expectedSha256, /^[a-f0-9]{64}$/, 'Invalid reviewed Alien Isolation inventory digest.');
  assert.equal(digest(bytes), expectedSha256, 'Unreviewed Alien Isolation recovery manifest bytes.');
  const manifest = JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.schema, 1, 'Unsupported Alien Isolation recovery schema.');
  assert.equal(manifest.module, 'alien-isolation', 'Unexpected recovered module.');
  assert.equal(manifest.version, '0.8.0', 'Unexpected recovered version.');
  assert.equal(manifest.sourceArchive?.sha256, ALIEN_ISOLATION_ARCHIVE_SHA256, 'Unexpected recovered archive digest.');
  assert.ok(Array.isArray(manifest.files), 'Recovery files must be an array.');
  const files = new Map(), directories = new Set(['modules', ALIEN_ISOLATION_MODULE_ROOT, ALIEN_ISOLATION_RECOVERY_ROOT]);
  let totalBytes = 0;
  for (const entry of manifest.files) {
    assert.ok(entry && validPath(entry.path), 'Unsafe Alien Isolation recovery member path.');
    const path = ALIEN_ISOLATION_RECOVERY_ROOT + '/' + entry.path;
    assert.equal(files.has(path), false, 'Duplicate Alien Isolation recovery member: ' + path);
    assert.ok(Number.isSafeInteger(entry.bytes) && entry.bytes >= 0, 'Invalid recovery member size: ' + path);
    assert.match(entry.sha256, /^[a-f0-9]{64}$/, 'Invalid recovery member digest: ' + path);
    files.set(path, Object.freeze({ path, bytes: entry.bytes, sha256: entry.sha256 }));
    totalBytes += entry.bytes;
    const parts = path.split('/');
    for (let i = 1; i < parts.length; i++) directories.add(parts.slice(0, i).join('/'));
  }
  assert.equal(manifest.fileCount, files.size, 'Recovery file count differs from the inventory.');
  assert.equal(manifest.uncompressedBytes, totalBytes, 'Recovery byte count differs from the inventory.');
  for (const path of files.keys()) assert.equal(directories.has(path), false, 'Recovery file/directory collision: ' + path);
  return Object.freeze({ manifest, files, directories, expectedSha256 });
}

let reviewed;
export function reviewedAlienIsolationRecovery() {
  if (!reviewed) reviewed = compileAlienIsolationRecoveryManifest(
    readFileSync(new URL('../' + ALIEN_ISOLATION_RECOVERY_MANIFEST, import.meta.url)));
  return reviewed;
}

/** Exact original source bytes can retain historical paths in their QA receipts.
 * They never enter the playable build; every such exemption is hash checked. */
export function alienIsolationRecoveryFile(path) {
  if (!validPath(path) || !path.startsWith(ALIEN_ISOLATION_RECOVERY_ROOT + '/')) return null;
  return reviewedAlienIsolationRecovery().files.get(path) || null;
}

/** null delegates unrelated modules to the established release policy. */
export function publicAlienIsolationDlcPathAdmission(path, { directory = false, built = false } = {}) {
  if (!validPath(path)) return false;
  if (ALIEN_ISOLATION_SOURCE_ONLY_FILES.includes(path)) return !built && !directory;
  if (path === 'dlc' || path === ALIEN_ISOLATION_RUNTIME_ROOT) return directory;
  if (path.startsWith(ALIEN_ISOLATION_RUNTIME_ROOT + '/')) return !directory && ALIEN_ISOLATION_RUNTIME_FILES.includes(path);
  if (path === 'modules') return directory && !built;
  if (path !== ALIEN_ISOLATION_MODULE_ROOT && !path.startsWith(ALIEN_ISOLATION_MODULE_ROOT + '/')) return null;
  if (built) return false;
  const inventory = reviewedAlienIsolationRecovery();
  return directory ? inventory.directories.has(path) : inventory.files.has(path);
}

async function assertDirectory(path) {
  const entry = await lstat(path);
  assert.ok(entry.isDirectory() && !entry.isSymbolicLink(), 'Invalid Alien Isolation directory: ' + path);
}
async function absent(path) {
  try { await lstat(path); return false; }
  catch (error) { if (error?.code === 'ENOENT') return true; throw error; }
}

export async function verifyAlienIsolationRuntime(root) {
  const base = resolve(root);
  await assertDirectory(join(base, 'dlc'));
  await assertDirectory(join(base, ALIEN_ISOLATION_RUNTIME_ROOT));
  const actual = await readdir(join(base, ALIEN_ISOLATION_RUNTIME_ROOT), { withFileTypes: true });
  assert.deepEqual(actual.map(entry => entry.name).sort(), ['game.html', 'index.html'], 'Unapproved Alien Isolation runtime member.');
  let totalBytes = 0;
  for (const path of ALIEN_ISOLATION_RUNTIME_FILES) {
    const stat = await lstat(join(base, path));
    assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'Invalid Alien Isolation runtime file: ' + path);
    const bytes = await readFile(join(base, path));
    totalBytes += bytes.length;
    if (path.endsWith('/game.html')) {
      assert.equal(bytes.length, ALIEN_ISOLATION_GAME_BYTES, 'Changed Alien Isolation runtime size.');
      assert.equal(digest(bytes), ALIEN_ISOLATION_GAME_SHA256, 'Changed Alien Isolation runtime bytes.');
    } else {
      assert.match(bytes.toString('utf8'), /<iframe\b[^>]*\bsrc=["'](?:\.\/)?game\.html["']/i, 'Alien Isolation launcher must load the admitted local game.');
    }
  }
  return { runtimeFiles: ALIEN_ISOLATION_RUNTIME_FILES.length, runtimeBytes: totalBytes, gameSha256: ALIEN_ISOLATION_GAME_SHA256 };
}

/** Validate all recovered files, including omissions, additions and symlinks.
 * Built validation independently rejects source corpus leakage. */
export async function verifyAlienIsolationDlcAdmissions(root, {
  built = false, expectedSha256 = ALIEN_ISOLATION_RECOVERY_MANIFEST_SHA256,
} = {}) {
  const base = resolve(root);
  if (built) {
    assert.ok(await absent(join(base, ALIEN_ISOLATION_MODULE_ROOT)), 'Alien Isolation recovered sources must not be present in a built distribution.');
    return { ok: true, built: true, recoveredFiles: 0, ...await verifyAlienIsolationRuntime(base) };
  }
  for (const directory of ['modules', ALIEN_ISOLATION_MODULE_ROOT, ALIEN_ISOLATION_RECOVERY_ROOT]) await assertDirectory(join(base, directory));
  const manifestPath = join(base, ALIEN_ISOLATION_RECOVERY_MANIFEST);
  const stat = await lstat(manifestPath);
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'Invalid Alien Isolation recovery manifest file.');
  const inventory = compileAlienIsolationRecoveryManifest(await readFile(manifestPath), expectedSha256);
  const seen = new Set();
  let recoveredBytes = 0;
  async function walk(directory) {
    for (const entry of await readdir(join(base, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Recovery symlink is not allowed: ' + path);
      if (entry.isDirectory()) {
        assert.ok(inventory.directories.has(path), 'Unlisted Alien Isolation recovery directory: ' + path);
        await walk(path); continue;
      }
      const expected = inventory.files.get(path);
      assert.ok(expected, 'Unlisted Alien Isolation recovery member: ' + path);
      assert.ok(entry.isFile(), 'Unsupported Alien Isolation recovery entry: ' + path);
      const bytes = await readFile(join(base, path));
      assert.equal(bytes.length, expected.bytes, 'Changed Alien Isolation recovery size: ' + path);
      assert.equal(digest(bytes), expected.sha256, 'Changed Alien Isolation recovery bytes: ' + path);
      recoveredBytes += bytes.length; seen.add(path);
    }
  }
  await walk(ALIEN_ISOLATION_RECOVERY_ROOT);
  for (const path of inventory.files.keys()) assert.ok(seen.has(path), 'Missing Alien Isolation recovery member: ' + path);
  assert.equal(digest(await readFile(manifestPath)), expectedSha256, 'Alien Isolation inventory changed during verification.');
  return { ok: true, built: false, recoveredFiles: seen.size, recoveredBytes, manifestSha256: expectedSha256,
    ...await verifyAlienIsolationRuntime(base) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyAlienIsolationDlcAdmissions(process.cwd(), { built: process.argv.includes('--built') }), null, 2));
}
