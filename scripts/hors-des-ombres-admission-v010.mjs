import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createReadStream, readFileSync } from 'node:fs';
import { lstat, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

// A reviewed byte inventory, not a prefix allowance for arbitrary DLC or archives.
export const HORS_DES_OMBRES_ARCHIVE_ROOT_V010 = 'archives/dlc-hors-des-ombres-v010';
export const HORS_DES_OMBRES_MANIFEST_V010 = HORS_DES_OMBRES_ARCHIVE_ROOT_V010 + '/manifest.json';
export const HORS_DES_OMBRES_MANIFEST_SHA256_V010 = '6cf308b61353541b18bfd8583435da4afe2d874875f77b7a6600c015622420d5';
export const HORS_DES_OMBRES_SOURCE_ARCHIVE_SHA256_V010 = '8faa1e9c18e8db3ecefc99605ced070cf3acdae1f74b1f65017cadfed5db0bf3';
export const HORS_DES_OMBRES_RUNTIME_PATHS_V010 = Object.freeze([
  'dlc/alien-hors-des-ombres/index.html',
  'src/hors-des-ombres-launch-v010.js',
  'src/oth-v1/oth-bridge.js',
  'src/oth-v1/oth-data.js',
  'src/oth-v1/oth-engine.js',
  'src/oth-v1/oth-render.js',
  'src/oth-v1/oth-ui.css',
  'src/oth-v1/oth-ui.js',
]);
export const HORS_DES_OMBRES_SOURCE_ONLY_PATHS_V010 = Object.freeze([
  'scripts/hors-des-ombres-admission-v010.mjs',
  'scripts/verify-hors-des-ombres-integration.mjs',
  'scripts/qa-hors-des-ombres-integration.py',
  'scripts/run-hors-des-ombres-checks.mjs',
  'scripts/reconstruct-hors-des-ombres-archive.mjs',
  'scripts/audit-hors-des-ombres-continuation-v010.mjs',
  'scripts/verify-hors-des-ombres-continuation-v010.mjs',
  'docs/development/HORS_DES_OMBRES_INTEGRATION_20261125.md',
  'docs/development/HORS_DES_OMBRES_INTEGRATION_20261125_QA.json',
]);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const validPath = path => typeof path === 'string' && path.length > 0
  && !/[\\\0]/.test(path) && !path.startsWith('/')
  && path.split('/').every(part => part && part !== '.' && part !== '..');
const runtimeRoots = Object.freeze(['src/oth-v1', 'dlc/alien-hors-des-ombres']);
const inRoot = (path, root) => path === root || path.startsWith(root + '/');
const parentPaths = paths => new Set(paths.flatMap(path => {
  const parts = path.split('/');
  return parts.slice(0, -1).map((_, index) => parts.slice(0, index + 1).join('/'));
}));
const runtimeDirectories = parentPaths(HORS_DES_OMBRES_RUNTIME_PATHS_V010);

export function compileHorsDesOmbresManifestV010(bytes, expectedSha256) {
  assert.match(expectedSha256, /^[a-f0-9]{64}$/, 'Expected a reviewed manifest SHA-256');
  assert.equal(hash(bytes), expectedSha256, 'Changed Hors des ombres manifest bytes');
  const manifest = JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.archiveRoot, HORS_DES_OMBRES_ARCHIVE_ROOT_V010);
  assert.equal(manifest.release, '0.10.0');
  assert.ok(Array.isArray(manifest.files));
  assert.ok(Array.isArray(manifest.runtimeFiles));
  const checkEntry = entry => {
    assert.ok(validPath(entry?.path), 'Invalid Hors des ombres path');
    assert.ok(Number.isSafeInteger(entry.sizeBytes) && entry.sizeBytes >= 0, 'Invalid byte count: ' + entry.path);
    assert.match(entry.sha256, /^[a-f0-9]{64}$/, 'Invalid SHA-256: ' + entry.path);
  };
  const files = new Map();
  for (const entry of manifest.files) {
    checkEntry(entry);
    assert.ok(entry.path.startsWith(HORS_DES_OMBRES_ARCHIVE_ROOT_V010 + '/'));
    assert.notEqual(entry.path, HORS_DES_OMBRES_MANIFEST_V010);
    assert.ok(!files.has(entry.path), 'Duplicate archive path: ' + entry.path);
    assert.ok(['original-member', 'original-archive-chunk', 'original-archive-audit'].includes(entry.kind));
    if (entry.kind === 'original-member') {
      assert.ok(validPath(entry.originalPath));
      assert.equal(entry.path, HORS_DES_OMBRES_ARCHIVE_ROOT_V010 + '/original/' + entry.originalPath);
    }
    files.set(entry.path, Object.freeze({ ...entry }));
  }
  const directories = parentPaths([...files.keys(), HORS_DES_OMBRES_MANIFEST_V010]);
  for (const path of files.keys()) assert.ok(!directories.has(path), 'Archive file/directory collision: ' + path);
  const original = manifest.sourceArchive;
  assert.equal(original?.sha256, HORS_DES_OMBRES_SOURCE_ARCHIVE_SHA256_V010);
  assert.equal(original.sizeBytes, 93449215);
  assert.equal(original.memberCount, 321);
  assert.equal([...files.values()].filter(entry => entry.kind === 'original-member').length, 320);
  assert.equal(files.size, 333);
  assert.deepEqual(original.zipOnlyMembers, [{
    originalPath: 'RAPPORT_ILLUSTRE.html',
    sizeBytes: 16882212,
    sha256: '0736c07a0be24bec8dbaa8075dbd97e49f1768d5995575eee18f8492a4df9ae8',
  }], 'Unreviewed ZIP-only source member');
  assert.ok(!files.has(HORS_DES_OMBRES_ARCHIVE_ROOT_V010 + '/original/RAPPORT_ILLUSTRE.html'),
    'ZIP-only report must not be duplicated among direct members');
  assert.ok(Array.isArray(original.chunks));
  assert.equal(original.chunks.length, 12);
  assert.equal(new Set(original.chunks).size, 12);
  original.chunks.forEach((path, index) => {
    assert.equal(path, HORS_DES_OMBRES_ARCHIVE_ROOT_V010 + '/archive/ALIEN_HORS_DES_OMBRES_V0_10.zip.part'
      + String(index + 1).padStart(3, '0'));
    assert.equal(files.get(path)?.sizeBytes, Math.min(8 * 1024 * 1024, original.sizeBytes - index * 8 * 1024 * 1024));
  });
  const chunks = [...files.values()].filter(entry => entry.kind === 'original-archive-chunk');
  assert.deepEqual(chunks.map(entry => entry.path).sort(), [...original.chunks].sort());
  assert.equal(chunks.reduce((sum, entry) => sum + entry.sizeBytes, 0), original.sizeBytes);
  assert.equal([...files.values()].filter(entry => entry.kind === 'original-archive-audit').length, 1);
  const runtimeFiles = new Map();
  for (const entry of manifest.runtimeFiles) {
    checkEntry(entry);
    assert.ok(HORS_DES_OMBRES_RUNTIME_PATHS_V010.includes(entry.path), 'Unreviewed runtime path: ' + entry.path);
    assert.ok(!runtimeFiles.has(entry.path), 'Duplicate runtime path: ' + entry.path);
    assert.equal(typeof entry.adapted, 'boolean');
    if (entry.sourcePath === null) {
      assert.equal(entry.path, 'src/hors-des-ombres-launch-v010.js');
      assert.equal(entry.adapted, true);
    } else {
      assert.equal(entry.sourcePath, HORS_DES_OMBRES_ARCHIVE_ROOT_V010 + '/original/' + entry.path);
      const source = files.get(entry.sourcePath);
      assert.equal(source?.kind, 'original-member', 'Missing original runtime source: ' + entry.path);
      if (!entry.adapted) {
        assert.equal(entry.sizeBytes, source.sizeBytes, 'Undeclared runtime adaptation: ' + entry.path);
        assert.equal(entry.sha256, source.sha256, 'Undeclared runtime adaptation: ' + entry.path);
      }
    }
    runtimeFiles.set(entry.path, Object.freeze({ ...entry }));
  }
  assert.deepEqual([...runtimeFiles.keys()].sort(), [...HORS_DES_OMBRES_RUNTIME_PATHS_V010].sort());
  const admits = (path, { directory = false, built = false } = {}) => {
    if (!validPath(path)) return false;
    if (HORS_DES_OMBRES_SOURCE_ONLY_PATHS_V010.includes(path)) return !directory && !built;
    if (inRoot(path, HORS_DES_OMBRES_ARCHIVE_ROOT_V010)) {
      if (built) return false;
      return directory ? directories.has(path) : files.has(path) || path === HORS_DES_OMBRES_MANIFEST_V010;
    }
    if (path === 'archives') return directory && !built;
    if (path === 'dlc') return directory;
    if (runtimeRoots.some(root => inRoot(path, root))) {
      return directory ? runtimeDirectories.has(path) : runtimeFiles.has(path);
    }
    if (runtimeFiles.has(path)) return !directory;
    return null;
  };
  return Object.freeze({ manifest, files, directories, runtimeFiles, expectedSha256, admits });
}

let reviewed;
export function reviewedHorsDesOmbresV010() {
  reviewed ??= compileHorsDesOmbresManifestV010(
    readFileSync(new URL('../' + HORS_DES_OMBRES_MANIFEST_V010, import.meta.url)),
    HORS_DES_OMBRES_MANIFEST_SHA256_V010,
  );
  return reviewed;
}

export function horsDesOmbresPathAdmissionV010(path, options = {}) {
  if (!validPath(path)) return false;
  if (HORS_DES_OMBRES_SOURCE_ONLY_PATHS_V010.includes(path)) return !options.directory && !options.built;
  if (path !== 'archives' && path !== 'dlc'
    && !inRoot(path, HORS_DES_OMBRES_ARCHIVE_ROOT_V010)
    && !runtimeRoots.some(root => inRoot(path, root))
    && !HORS_DES_OMBRES_RUNTIME_PATHS_V010.includes(path)) return null;
  return reviewedHorsDesOmbresV010().admits(path, options);
}

async function assertDirectory(root, relativePath = '') {
  let path = root;
  for (const part of ['', ...relativePath.split('/').filter(Boolean)]) {
    if (part) path = join(path, part);
    const info = await lstat(path);
    assert.ok(info.isDirectory() && !info.isSymbolicLink(), 'Expected real directory: ' + path);
  }
}

async function ensureDirectory(path) {
  // Inspect every existing ancestor before mkdir: do not even create directories
  // through a destination symlink, including an ancestor outside the output root.
  const absolute = resolve(path);
  let current = resolve('/');
  for (const part of absolute.split('/').filter(Boolean)) {
    current = join(current, part);
    try {
      const info = await lstat(current);
      assert.ok(info.isDirectory() && !info.isSymbolicLink(), 'Expected real destination directory: ' + current);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
      await mkdir(current);
    }
  }
}

async function verifyFile(root, entry) {
  const path = join(root, entry.path);
  const info = await lstat(path);
  assert.ok(info.isFile() && !info.isSymbolicLink(), 'Expected regular Hors des ombres file: ' + entry.path);
  assert.equal(info.size, entry.sizeBytes, 'Changed Hors des ombres size: ' + entry.path);
  const digest = createHash('sha256');
  for await (const bytes of createReadStream(path)) digest.update(bytes);
  assert.equal(digest.digest('hex'), entry.sha256, 'Changed Hors des ombres bytes: ' + entry.path);
}

async function verifyRuntime(root, inventory) {
  const seen = new Set();
  const scan = async relative => {
    for (const entry of await readdir(join(root, relative), { withFileTypes: true })) {
      const path = relative + '/' + entry.name;
      assert.ok(!entry.isSymbolicLink(), 'Runtime symlink is forbidden: ' + path);
      assert.equal(inventory.admits(path, { directory: entry.isDirectory(), built: true }), true,
        'Unreviewed Hors des ombres runtime path: ' + path);
      if (entry.isDirectory()) await scan(path);
      else {
        await verifyFile(root, inventory.runtimeFiles.get(path));
        seen.add(path);
      }
    }
  };
  for (const path of runtimeRoots) {
    await assertDirectory(root, path);
    await scan(path);
  }
  await assertDirectory(root, 'src');
  const launcher = 'src/hors-des-ombres-launch-v010.js';
  await verifyFile(root, inventory.runtimeFiles.get(launcher));
  seen.add(launcher);
  assert.deepEqual([...seen].sort(), [...inventory.runtimeFiles.keys()].sort(), 'Missing runtime files');
  return {
    runtimeFiles: seen.size,
    runtimeBytes: [...inventory.runtimeFiles.values()].reduce((sum, entry) => sum + entry.sizeBytes, 0),
  };
}

export async function verifyHorsDesOmbresV010(root, { built = false, expectedSha256 = HORS_DES_OMBRES_MANIFEST_SHA256_V010 } = {}) {
  root = resolve(root);
  await assertDirectory(root);
  if (built) {
    for (const path of ['archives', ...HORS_DES_OMBRES_SOURCE_ONLY_PATHS_V010]) {
      try { await lstat(join(root, path)); }
      catch (error) { if (error?.code === 'ENOENT') continue; throw error; }
      throw new Error('Hors des ombres source-only content must not be present in a built distribution: ' + path);
    }
    return {
      ok: true, built: true, ...await verifyRuntime(root, reviewedHorsDesOmbresV010()),
      archiveFiles: 0, archiveBytes: 0, manifestSha256: HORS_DES_OMBRES_MANIFEST_SHA256_V010,
    };
  }
  await assertDirectory(root, HORS_DES_OMBRES_ARCHIVE_ROOT_V010);
  const manifestPath = join(root, HORS_DES_OMBRES_MANIFEST_V010);
  const manifestInfo = await lstat(manifestPath);
  assert.ok(manifestInfo.isFile() && !manifestInfo.isSymbolicLink());
  const inventory = compileHorsDesOmbresManifestV010(await readFile(manifestPath), expectedSha256);
  const runtime = await verifyRuntime(root, inventory);
  const seen = new Set();
  const scan = async relative => {
    for (const entry of await readdir(join(root, relative), { withFileTypes: true })) {
      const path = relative + '/' + entry.name;
      assert.ok(!entry.isSymbolicLink(), 'Archive symlink is forbidden: ' + path);
      assert.equal(inventory.admits(path, { directory: entry.isDirectory() }), true,
        'Unreviewed Hors des ombres archive path: ' + path);
      if (entry.isDirectory()) await scan(path);
      else if (path !== HORS_DES_OMBRES_MANIFEST_V010) {
        await verifyFile(root, inventory.files.get(path));
        seen.add(path);
      }
    }
  };
  await scan(HORS_DES_OMBRES_ARCHIVE_ROOT_V010);
  assert.deepEqual([...seen].sort(), [...inventory.files.keys()].sort(), 'Missing archived files');
  const originalHash = createHash('sha256');
  for (const path of inventory.manifest.sourceArchive.chunks) {
    for await (const bytes of createReadStream(join(root, path))) originalHash.update(bytes);
  }
  assert.equal(originalHash.digest('hex'), HORS_DES_OMBRES_SOURCE_ARCHIVE_SHA256_V010, 'Original ZIP reconstruction differs');
  assert.equal(hash(await readFile(manifestPath)), expectedSha256, 'Manifest changed during verification');
  return {
    ok: true, built: false, ...runtime, archiveFiles: seen.size,
    archiveBytes: [...inventory.files.values()].reduce((sum, entry) => sum + entry.sizeBytes, 0),
    sourceArchiveSha256: HORS_DES_OMBRES_SOURCE_ARCHIVE_SHA256_V010, manifestSha256: expectedSha256,
  };
}

export async function copyHorsDesOmbresRuntimeV010(root, output) {
  root = resolve(root);
  output = resolve(output);
  assert.ok(output !== dirname(output) && root !== output && !root.startsWith(output + '/'), 'Output must not contain the source checkout');
  await assertDirectory(root, HORS_DES_OMBRES_ARCHIVE_ROOT_V010);
  const inventory = compileHorsDesOmbresManifestV010(
    await readFile(join(root, HORS_DES_OMBRES_MANIFEST_V010)), HORS_DES_OMBRES_MANIFEST_SHA256_V010,
  );
  await verifyRuntime(root, inventory);
  await ensureDirectory(output);
  for (const entry of inventory.runtimeFiles.values()) {
    const destination = join(output, entry.path);
    await ensureDirectory(dirname(destination));
    try {
      const info = await lstat(destination);
      assert.ok(info.isFile() && !info.isSymbolicLink(), 'Expected regular runtime destination: ' + entry.path);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
    const bytes = await readFile(join(root, entry.path));
    assert.equal(bytes.length, entry.sizeBytes, 'Runtime changed during copy: ' + entry.path);
    assert.equal(hash(bytes), entry.sha256, 'Runtime changed during copy: ' + entry.path);
    await writeFile(destination, bytes);
  }
  return verifyRuntime(output, inventory);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyHorsDesOmbresV010(process.cwd(), { built: process.argv.includes('--built') }), null, 2));
}
