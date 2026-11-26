import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { lstat, readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const ALIENS1986_MODULE_ROOT = 'modules/aliens-1986';
export const ALIENS1986_RECOVERY_ROOT = `${ALIENS1986_MODULE_ROOT}/v114`;
export const ALIENS1986_RECOVERY_MANIFEST = `${ALIENS1986_MODULE_ROOT}/RECOVERY_MANIFEST.json`;
// The immutable, recovered V114 package is reviewed independently of its inventory.
export const ALIENS1986_RECOVERY_MANIFEST_SHA256 = '5bfb37cc785657a11e62fe1ca0b92093e2b8b5bd0935fb0bf2cedd0f87da0acd';
export const ALIENS1986_ARCHIVE_SHA256 = 'c6dfb2baa886d7b1651463f9685a666f37185aaa0d5cec7d42ccae928762d1e2';
export const ALIENS1986_GAME_SHA256 = '9f1b902e7546dff18867d9b0d1cb638bc9d256863654be5e2e74bc5cb301548d';
export const ALIENS1986_GAME_BYTES = 780305;
export const ALIENS1986_RUNTIME_ROOT = 'dlc/aliens-1986';
export const ALIENS1986_RUNTIME_FILES = Object.freeze([
  ALIENS1986_RUNTIME_ROOT + '/index.html', ALIENS1986_RUNTIME_ROOT + '/game.html',
]);
export const ALIENS1986_SOURCE_ONLY_FILES = Object.freeze([
  ALIENS1986_MODULE_ROOT + '/README.md', ALIENS1986_RECOVERY_MANIFEST,
  'scripts/public-aliens1986-dlc-admissions.mjs',
  'scripts/build-aliens1986-dlc.mjs',
  'scripts/verify-aliens1986-dlc-integration.mjs',
  'scripts/qa-aliens1986-integration.py',
  '.github/workflows/aliens1986-dlc.yml',
  'docs/development/ALIENS_1986_GITHUB_INTEGRATION_20261125.md',
  'docs/development/ALIENS_1986_GITHUB_INTEGRATION_20261125.json',
]);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const validPath = path => typeof path === 'string' && path.length > 0
  && !/[\\\x00-\x1f]/.test(path) && !path.startsWith('/')
  && path.split('/').every(part => part && part !== '.' && part !== '..');

/** A changed manifest cannot grant itself new source files or new byte hashes. */
export function compileAliens1986RecoveryManifest(bytes, expectedSha256 = ALIENS1986_RECOVERY_MANIFEST_SHA256) {
  assert.match(expectedSha256, /^[a-f0-9]{64}$/, 'Invalid reviewed Aliens 1986 inventory digest.');
  assert.equal(digest(bytes), expectedSha256, 'Unreviewed Aliens 1986 recovery manifest bytes.');
  const manifest = JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.schema, 1, 'Unsupported Aliens 1986 recovery schema.');
  assert.equal(manifest.module, 'aliens-1986', 'Unexpected recovered module.');
  assert.equal(manifest.version, '114.0.0-rc.1', 'Unexpected recovered version.');
  assert.equal(manifest.sourceArchive?.sha256, ALIENS1986_ARCHIVE_SHA256, 'Unexpected recovered archive digest.');
  assert.ok(Array.isArray(manifest.files), 'Recovery files must be an array.');
  const files = new Map(), directories = new Set(['modules', ALIENS1986_MODULE_ROOT, ALIENS1986_RECOVERY_ROOT]);
  let totalBytes = 0;
  for (const entry of manifest.files) {
    assert.ok(entry && validPath(entry.path), 'Unsafe Aliens 1986 recovery member path.');
    const path = ALIENS1986_RECOVERY_ROOT + '/' + entry.path;
    assert.equal(files.has(path), false, 'Duplicate Aliens 1986 recovery member: ' + path);
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
export function reviewedAliens1986Recovery() {
  if (!reviewed) reviewed = compileAliens1986RecoveryManifest(
    readFileSync(new URL('../' + ALIENS1986_RECOVERY_MANIFEST, import.meta.url)));
  return reviewed;
}

/** Exact original source bytes can retain historical paths in their QA receipts.
 * They never enter the playable build; every such exemption is hash checked. */
export function aliens1986RecoveryFile(path) {
  if (!validPath(path) || !path.startsWith(ALIENS1986_RECOVERY_ROOT + '/')) return null;
  return reviewedAliens1986Recovery().files.get(path) || null;
}

/** null delegates unrelated modules to the established release policy. */
export function publicAliens1986DlcPathAdmission(path, { directory = false, built = false } = {}) {
  if (!validPath(path)) return false;
  if (ALIENS1986_SOURCE_ONLY_FILES.includes(path)) return !built && !directory;
  if (path === 'dlc' || path === ALIENS1986_RUNTIME_ROOT) return directory;
  if (path.startsWith(ALIENS1986_RUNTIME_ROOT + '/')) return !directory && ALIENS1986_RUNTIME_FILES.includes(path);
  if (path === 'modules') return directory && !built;
  if (path !== ALIENS1986_MODULE_ROOT && !path.startsWith(ALIENS1986_MODULE_ROOT + '/')) return null;
  if (built) return false;
  const inventory = reviewedAliens1986Recovery();
  return directory ? inventory.directories.has(path) : inventory.files.has(path);
}

async function assertDirectory(path) {
  const entry = await lstat(path);
  assert.ok(entry.isDirectory() && !entry.isSymbolicLink(), 'Invalid Aliens 1986 directory: ' + path);
}
async function absent(path) {
  try { await lstat(path); return false; }
  catch (error) { if (error?.code === 'ENOENT') return true; throw error; }
}

export async function verifyAliens1986Runtime(root) {
  const base = resolve(root);
  await assertDirectory(join(base, 'dlc'));
  await assertDirectory(join(base, ALIENS1986_RUNTIME_ROOT));
  const actual = await readdir(join(base, ALIENS1986_RUNTIME_ROOT), { withFileTypes: true });
  assert.deepEqual(actual.map(entry => entry.name).sort(), ['game.html', 'index.html'], 'Unapproved Aliens 1986 runtime member.');
  let totalBytes = 0;
  for (const path of ALIENS1986_RUNTIME_FILES) {
    const stat = await lstat(join(base, path));
    assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'Invalid Aliens 1986 runtime file: ' + path);
    const bytes = await readFile(join(base, path));
    totalBytes += bytes.length;
    if (path.endsWith('/game.html')) {
      assert.equal(bytes.length, ALIENS1986_GAME_BYTES, 'Changed Aliens 1986 runtime size.');
      assert.equal(digest(bytes), ALIENS1986_GAME_SHA256, 'Changed Aliens 1986 runtime bytes.');
    } else {
      assert.match(bytes.toString('utf8'), /<iframe\b[^>]*\bsrc=["'](?:\.\/)?game\.html["']/i, 'Aliens 1986 launcher must load the admitted local game.');
    }
  }
  return { runtimeFiles: ALIENS1986_RUNTIME_FILES.length, runtimeBytes: totalBytes, gameSha256: ALIENS1986_GAME_SHA256 };
}

/** Validate all recovered files, including omissions, additions and symlinks.
 * Built validation independently rejects source corpus leakage. */
export async function verifyAliens1986DlcAdmissions(root, {
  built = false, expectedSha256 = ALIENS1986_RECOVERY_MANIFEST_SHA256,
} = {}) {
  const base = resolve(root);
  if (built) {
    assert.ok(await absent(join(base, ALIENS1986_MODULE_ROOT)), 'Aliens 1986 recovered sources must not be present in a built distribution.');
    return { ok: true, built: true, recoveredFiles: 0, ...await verifyAliens1986Runtime(base) };
  }
  for (const directory of ['modules', ALIENS1986_MODULE_ROOT, ALIENS1986_RECOVERY_ROOT]) await assertDirectory(join(base, directory));
  const manifestPath = join(base, ALIENS1986_RECOVERY_MANIFEST);
  const stat = await lstat(manifestPath);
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'Invalid Aliens 1986 recovery manifest file.');
  const inventory = compileAliens1986RecoveryManifest(await readFile(manifestPath), expectedSha256);
  const seen = new Set();
  let recoveredBytes = 0;
  async function walk(directory) {
    for (const entry of await readdir(join(base, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Recovery symlink is not allowed: ' + path);
      if (entry.isDirectory()) {
        assert.ok(inventory.directories.has(path), 'Unlisted Aliens 1986 recovery directory: ' + path);
        await walk(path); continue;
      }
      const expected = inventory.files.get(path);
      assert.ok(expected, 'Unlisted Aliens 1986 recovery member: ' + path);
      assert.ok(entry.isFile(), 'Unsupported Aliens 1986 recovery entry: ' + path);
      const bytes = await readFile(join(base, path));
      assert.equal(bytes.length, expected.bytes, 'Changed Aliens 1986 recovery size: ' + path);
      assert.equal(digest(bytes), expected.sha256, 'Changed Aliens 1986 recovery bytes: ' + path);
      recoveredBytes += bytes.length; seen.add(path);
    }
  }
  await walk(ALIENS1986_RECOVERY_ROOT);
  for (const path of inventory.files.keys()) assert.ok(seen.has(path), 'Missing Aliens 1986 recovery member: ' + path);
  assert.equal(digest(await readFile(manifestPath)), expectedSha256, 'Aliens 1986 inventory changed during verification.');
  return { ok: true, built: false, recoveredFiles: seen.size, recoveredBytes, manifestSha256: expectedSha256,
    ...await verifyAliens1986Runtime(base) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyAliens1986DlcAdmissions(process.cwd(), { built: process.argv.includes('--built') }), null, 2));
}
