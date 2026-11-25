import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream, readFileSync } from 'node:fs';
import { cp, lstat, mkdir, readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const MER_DLC_ROOT_20261125 = 'dlc/sea-of-sorrows';
export const MER_ARCHIVE_ROOT_20261125 = 'archives/mer-des-chagrins-20261125';
export const MER_DLC_MANIFEST_20261125 = MER_DLC_ROOT_20261125 + '/IMPORT_MANIFEST.json';
export const MER_ARCHIVE_MANIFEST_20261125 = MER_ARCHIVE_ROOT_20261125 + '/MANIFEST.json';
// Reviewed independently of the imported manifests themselves.
export const MER_DLC_MANIFEST_SHA256_20261125 = '540b4857e3c15b536ad993b13c2546dcb5e01b682c0346b55956ce7f9bc9be4b';
export const MER_ARCHIVE_MANIFEST_SHA256_20261125 = '21ca112319b36e41f7bc921a7b811874ba704b03250cf3cc407db497d79021e0';
export const MER_CATALOG_20261125 = Object.freeze({
  path: 'dlc/index.html', sizeBytes: 6786, sha256: '0a421d17668d8fba58557c6ef11f8d6ed17f9d2cf2857a483ad5d8aa25929a2a',
});
export const MER_RUNTIME_PATHS_20261125 = Object.freeze([
  'index.html', 'styles.css', 'MER_DES_CHAGRINS_JOUABLE.html',
  'src/data.js', 'src/core.js', 'src/render.js', 'src/world-art.js',
  'src/tactics-art.js', 'src/controls.js', 'src/support.js', 'src/soundscape.js', 'src/main.js',
].map(path => MER_DLC_ROOT_20261125 + '/' + path));
export const MER_PUBLIC_DIRECTORIES_20261125 = Object.freeze([
  'dlc', MER_DLC_ROOT_20261125, MER_DLC_ROOT_20261125 + '/src',
]);
export const MER_SOURCE_PATHS_20261125 = Object.freeze([
  'scripts/mer-des-chagrins-admission-20261125.mjs',
  'scripts/verify-mer-des-chagrins-admission-20261125.mjs',
  'scripts/verify-mer-des-chagrins-campaign-20261125.mjs',
  'scripts/restore-mer-des-chagrins-archives.py',
  'scripts/verify-mer-des-chagrins-restore.py',
  'docs/MER_DES_CHAGRINS_GITHUB_20261125.md',
  'docs/MER_DES_CHAGRINS_VERIFICATION_20261125.json',
]);
const runtimePaths = new Set(MER_RUNTIME_PATHS_20261125);
const publicDirectories = new Set(MER_PUBLIC_DIRECTORIES_20261125);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const validPath = path => typeof path === 'string' && path.length > 0
  && !/[\\\0\r\n]/.test(path) && !path.startsWith('/')
  && path.split('/').every(segment => segment && segment !== '.' && segment !== '..');
const validDigest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const validSize = value => Number.isSafeInteger(value) && value >= 0;

/** A reviewed pin outside the imported file authorizes an exact inventory. */
export function compileMerDesChagrinsManifest20261125(bytes, { kind, expectedSha256 }) {
  assert.ok(kind === 'dlc' || kind === 'archives', 'Unknown Mer des Chagrins inventory kind.');
  assert.ok(validDigest(expectedSha256), 'Invalid reviewed Mer des Chagrins manifest digest.');
  assert.equal(digest(bytes), expectedSha256, 'Unreviewed Mer des Chagrins manifest bytes.');
  const root = kind === 'dlc' ? MER_DLC_ROOT_20261125 : MER_ARCHIVE_ROOT_20261125;
  const manifestPath = kind === 'dlc' ? MER_DLC_MANIFEST_20261125 : MER_ARCHIVE_MANIFEST_20261125;
  const manifest = JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.schemaVersion, 1, 'Unsupported Mer des Chagrins manifest schema.');
  assert.equal(manifest.root, root, 'Unexpected Mer des Chagrins inventory root.');
  assert.ok(Array.isArray(manifest.files) && manifest.files.length > 0, 'Missing Mer des Chagrins files.');
  const files = new Map();
  const directories = new Set([root.split('/')[0], root]);
  for (const entry of manifest.files) {
    assert.ok(entry && validPath(entry.path) && entry.path.startsWith(root + '/')
      && entry.path !== manifestPath, 'Unsafe Mer des Chagrins member path.');
    assert.equal(files.has(entry.path), false, 'Duplicate Mer des Chagrins member: ' + entry.path);
    assert.ok(validSize(entry.sizeBytes), 'Invalid Mer des Chagrins member size: ' + entry.path);
    assert.ok(validDigest(entry.sha256), 'Invalid Mer des Chagrins member digest: ' + entry.path);
    files.set(entry.path, Object.freeze({ path: entry.path, sizeBytes: entry.sizeBytes, sha256: entry.sha256 }));
    const segments = entry.path.split('/');
    for (let index = 1; index < segments.length; index++) directories.add(segments.slice(0, index).join('/'));
  }
  for (const path of files.keys()) assert.equal(directories.has(path), false, 'Mer des Chagrins file/directory collision: ' + path);
  if (kind === 'dlc') {
    assert.ok(validDigest(manifest.upstreamArchiveSha256), 'Missing upstream DLC archive digest.');
    for (const path of runtimePaths) assert.ok(files.has(path), 'Missing DLC runtime member: ' + path);
  } else {
    assert.ok(Array.isArray(manifest.artifacts) && manifest.artifacts.length > 0, 'Missing historical artifact reconstruction inventory.');
    for (const artifact of manifest.artifacts) {
      assert.ok(artifact && typeof artifact.originalName === 'string' && artifact.originalName.length > 0
        && !/[\\/\0\r\n]/.test(artifact.originalName) && !['.', '..'].includes(artifact.originalName), 'Unsafe historical artifact name.');
      assert.ok(validSize(artifact.sizeBytes) && validDigest(artifact.sha256), 'Invalid historical artifact identity.');
      assert.ok(Array.isArray(artifact.parts) && artifact.parts.length > 0, 'Missing historical artifact parts.');
      assert.equal(new Set(artifact.parts).size, artifact.parts.length, 'Duplicate historical artifact part.');
      for (const path of artifact.parts) assert.ok(files.has(path), 'Unlisted historical artifact part: ' + path);
      const size = artifact.parts.reduce((sum, path) => sum + files.get(path).sizeBytes, 0);
      assert.ok(Number.isSafeInteger(size) && size === artifact.sizeBytes, 'Historical artifact parts have the wrong total size.');
    }
  }
  const admits = (path, { directory = false, built = false } = {}) => {
    if (!validPath(path)) return false;
    if (kind === 'dlc' && built) return directory ? publicDirectories.has(path) : runtimePaths.has(path);
    if (built) return false;
    return directory ? directories.has(path) : path === manifestPath || files.has(path);
  };
  return Object.freeze({ kind, root, manifestPath, manifest, files, directories, expectedSha256, admits });
}
let reviewedDlc;
let reviewedArchives;
export function reviewedMerDlc20261125() {
  return reviewedDlc ??= compileMerDesChagrinsManifest20261125(
    readFileSync(new URL('../' + MER_DLC_MANIFEST_20261125, import.meta.url)),
    { kind: 'dlc', expectedSha256: MER_DLC_MANIFEST_SHA256_20261125 });
}
export function reviewedMerArchives20261125() {
  return reviewedArchives ??= compileMerDesChagrinsManifest20261125(
    readFileSync(new URL('../' + MER_ARCHIVE_MANIFEST_20261125, import.meta.url)),
    { kind: 'archives', expectedSha256: MER_ARCHIVE_MANIFEST_SHA256_20261125 });
}

/** null delegates unrelated project paths to the established release policy. */
export function merDesChagrinsPathAdmission20261125(path, { directory = false, built = false } = {}) {
  if (!validPath(path)) return false;
  if (MER_SOURCE_PATHS_20261125.includes(path)) return !directory && !built;
  if (path === 'dlc') return directory;
  if (path === MER_CATALOG_20261125.path) return !directory;
  if (path === MER_DLC_ROOT_20261125 || path.startsWith(MER_DLC_ROOT_20261125 + '/')) {
    if (built) return directory ? publicDirectories.has(path) : runtimePaths.has(path);
    return reviewedMerDlc20261125().admits(path, { directory });
  }
  if (path.startsWith('dlc/')) return false;
  if (path === MER_ARCHIVE_ROOT_20261125 || path.startsWith(MER_ARCHIVE_ROOT_20261125 + '/')) {
    if (built) return false;
    return reviewedMerArchives20261125().admits(path, { directory });
  }
  return null;
}

/** Historical source records retain their original metadata. The pinned byte
 * inventories verify them, and the built policy rejects every such record. */
export function isMerDesChagrinsSourceOnly20261125(path) {
  if (typeof path !== 'string') return false;
  if (path.startsWith(MER_DLC_ROOT_20261125 + '/') && !runtimePaths.has(path)) {
    return reviewedMerDlc20261125().admits(path);
  }
  return path.startsWith(MER_ARCHIVE_ROOT_20261125 + '/')
    && reviewedMerArchives20261125().admits(path);
}
async function regularFile(root, path) {
  const rootStat = await lstat(root);
  assert.ok(rootStat.isDirectory() && !rootStat.isSymbolicLink(), 'Invalid Mer des Chagrins verification root.');
  const segments = path.split('/');
  for (let index = 1; index < segments.length; index++) {
    const parent = await lstat(join(root, ...segments.slice(0, index)));
    assert.ok(parent.isDirectory() && !parent.isSymbolicLink(), 'Invalid Mer des Chagrins parent directory: ' + path);
  }
  const stat = await lstat(join(root, path));
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'Invalid Mer des Chagrins file or symlink: ' + path);
  return stat;
}
async function hashFile(path) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest('hex');
}
async function verifyFile(root, expected) {
  const stat = await regularFile(root, expected.path);
  assert.equal(stat.size, expected.sizeBytes, 'Changed Mer des Chagrins size: ' + expected.path);
  assert.equal(await hashFile(join(root, expected.path)), expected.sha256, 'Changed Mer des Chagrins bytes: ' + expected.path);
  return stat.size;
}
async function verifyInventory(root, inventory) {
  await regularFile(root, inventory.manifestPath);
  assert.equal(await hashFile(join(root, inventory.manifestPath)), inventory.expectedSha256, 'Mer des Chagrins manifest differs from reviewed bytes.');
  const seen = new Set();
  let bytes = 0;
  async function walk(directory) {
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Mer des Chagrins symlink is not allowed: ' + path);
      assert.equal(inventory.admits(path, { directory: entry.isDirectory() }), true, 'Unlisted Mer des Chagrins path: ' + path);
      if (entry.isDirectory()) { await walk(path); continue; }
      assert.ok(entry.isFile(), 'Unsupported Mer des Chagrins member: ' + path);
      if (path === inventory.manifestPath) continue;
      bytes += await verifyFile(root, inventory.files.get(path));
      seen.add(path);
    }
  }
  await walk(inventory.root);
  for (const path of inventory.files.keys()) assert.ok(seen.has(path), 'Missing Mer des Chagrins member: ' + path);
  assert.equal(await hashFile(join(root, inventory.manifestPath)), inventory.expectedSha256, 'Mer des Chagrins manifest changed during verification.');
  return { files: seen.size, bytes, manifestSha256: inventory.expectedSha256 };
}

/** Hash concatenated original parts in order without allocating a second ZIP. */
export async function verifyMerHistoricalArtifacts20261125(root, inventory) {
  assert.equal(inventory.kind, 'archives');
  let bytes = 0;
  for (const artifact of inventory.manifest.artifacts) {
    const hash = createHash('sha256');
    let size = 0;
    for (const path of artifact.parts) {
      await regularFile(root, path);
      for await (const chunk of createReadStream(join(root, path))) { hash.update(chunk); size += chunk.length; }
    }
    assert.equal(size, artifact.sizeBytes, 'Historical artifact size mismatch: ' + artifact.originalName);
    assert.equal(hash.digest('hex'), artifact.sha256, 'Historical artifact reconstruction mismatch: ' + artifact.originalName);
    bytes += size;
  }
  return { artifacts: inventory.manifest.artifacts.length, bytes };
}
async function verifyRuntimeFiles(root, inventory, catalog) {
  assert.equal(inventory.kind, 'dlc');
  assert.equal(catalog.path, MER_CATALOG_20261125.path);
  assert.ok(validSize(catalog.sizeBytes) && validDigest(catalog.sha256), 'Invalid reviewed DLC catalogue identity.');
  let bytes = await verifyFile(root, catalog);
  for (const path of runtimePaths) bytes += await verifyFile(root, inventory.files.get(path));
  return { files: runtimePaths.size + 1, bytes };
}
export async function verifyMerDesChagrinsBuilt20261125(root, {
  dlcInventory = reviewedMerDlc20261125(), catalog = MER_CATALOG_20261125,
} = {}) {
  root = resolve(root);
  const seen = new Set();
  async function walk(directory) {
    const stat = await lstat(join(root, directory));
    assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), 'Invalid built DLC directory: ' + directory);
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Built DLC symlink: ' + path);
      assert.equal(merDesChagrinsPathAdmission20261125(path, { directory: entry.isDirectory(), built: true }), true, 'Unapproved built DLC path: ' + path);
      if (entry.isDirectory()) await walk(path);
      else { assert.ok(entry.isFile(), 'Invalid built DLC entry: ' + path); seen.add(path); }
    }
  }
  await walk('dlc');
  assert.deepEqual([...seen].sort(), [...runtimePaths, catalog.path].sort(), 'Built DLC runtime inventory differs.');
  try { await lstat(join(root, 'archives')); }
  catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { ok: true, built: true, ...await verifyRuntimeFiles(root, dlcInventory, catalog) };
  }
  throw new Error('Historical archives must not be present in a built distribution.');
}

/** Uses only runtime inputs: deployment may omit source-only QA and archives. */
export async function copyMerDesChagrinsRuntime20261125(sourceRoot, outputRoot, {
  dlcInventory = reviewedMerDlc20261125(), catalog = MER_CATALOG_20261125,
} = {}) {
  sourceRoot = resolve(sourceRoot); outputRoot = resolve(outputRoot);
  assert.notEqual(sourceRoot, outputRoot, 'DLC build output must differ from source.');
  await verifyRuntimeFiles(sourceRoot, dlcInventory, catalog);
  for (const path of [catalog.path, ...runtimePaths]) {
    await mkdir(dirname(join(outputRoot, path)), { recursive: true });
    await cp(join(sourceRoot, path), join(outputRoot, path), { dereference: false });
  }
  return verifyMerDesChagrinsBuilt20261125(outputRoot, { dlcInventory, catalog });
}
export async function verifyMerDesChagrinsImport20261125(root, {
  built = false, dlcInventory = reviewedMerDlc20261125(), archiveInventory, catalog = MER_CATALOG_20261125,
} = {}) {
  root = resolve(root);
  if (built) return verifyMerDesChagrinsBuilt20261125(root, { dlcInventory, catalog });
  archiveInventory ??= reviewedMerArchives20261125();
  assert.ok(archiveInventory.manifest.artifacts.some(artifact => artifact.sha256 === dlcInventory.manifest.upstreamArchiveSha256),
    'The DLC upstream archive is missing from the historical originals.');
  const dlc = await verifyInventory(root, dlcInventory);
  const archives = await verifyInventory(root, archiveInventory);
  const historical = await verifyMerHistoricalArtifacts20261125(root, archiveInventory);
  const runtime = await verifyRuntimeFiles(root, dlcInventory, catalog);
  return { ok: true, built: false, dlc, archives, historical, runtime };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyMerDesChagrinsImport20261125(process.cwd(), {
    built: process.argv.includes('--built'),
  }), null, 2));
}
