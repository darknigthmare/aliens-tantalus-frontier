import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { cp, lstat, mkdir, readFile, readdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const MER_VISUAL_ROOT_20261126 = 'dlc/sea-of-sorrows-visual';
export const MER_VISUAL_MANIFEST_20261126 = MER_VISUAL_ROOT_20261126 + '/RUNTIME_MANIFEST.json';
export const MER_VISUAL_MANIFEST_SHA256_20261126 = 'c1162b93a1c23f35371db6d37e6aca69519ff684fb9c5baef38a459ddec83576';
export const MER_VISUAL_SOURCE_FILES_20261126 = Object.freeze([
  'scripts/mer-des-chagrins-visual-admission-20261126.mjs',
  'scripts/verify-mer-des-chagrins-visual-admission-20261126.mjs',
  'scripts/verify-mer-png-renderer-20261126.mjs',
  'scripts/verify-mer-sprite-metadata-20261126.py',
  'scripts/verify-mer-gallery-20261126.mjs',
  'scripts/verify-mer-equipment-ui-20261126.mjs',
  'scripts/qa-mer-visual-canvas-20261126.mjs',
  'scripts/generate-mer-bible-20261126.mjs',
  'docs/mer-des-chagrins-20261126/INTEGRATION.md',
  'docs/mer-des-chagrins-20261126/VALIDATION.json',
  'docs/mer-des-chagrins-20261126/CONTINUATION_PROMPTS.json',
  'docs/mer-des-chagrins-20261126/BIBLE.json',
  'docs/mer-des-chagrins-20261126/BIBLE.md',
  'docs/mer-des-chagrins-20261126/BIBLE.html',
  'docs/mer-des-chagrins-20261126/BIBLE_ART_PROMPTS.json',
  ...['s01', 's14', 's26', 's33', 's34', 's50', 'locomotion', 'details'].map(id => 'docs/mer-des-chagrins-20261126/canvas/' + id + '.png'),
  ...['s01', 's02', 's03', 's10', 's14', 's17', 's22', 's26', 's33', 's34', 's50', 'locomotion', 'details'].map(id => 'docs/mer-des-chagrins-20261126/qa/' + id + '.png'),
]);
const sourceDirectories = new Set(['docs/mer-des-chagrins-20261126/canvas', 'docs/mer-des-chagrins-20261126/qa']);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const safe = path => typeof path === 'string' && path.length > 0 && !/[\\\0\r\n]/.test(path)
  && !path.startsWith('/') && path.split('/').every(part => part && part !== '.' && part !== '..');

export function compileMerVisualManifest20261126(bytes, expectedSha256) {
  assert.match(expectedSha256, /^[a-f0-9]{64}$/, 'Invalid visual manifest pin.');
  assert.equal(hash(bytes), expectedSha256, 'Unreviewed visual manifest bytes.');
  const manifest = JSON.parse(bytes.toString('utf8'));
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.root, MER_VISUAL_ROOT_20261126);
  assert.ok(Array.isArray(manifest.files) && manifest.files.length > 0);
  const files = new Map(), directories = new Set([MER_VISUAL_ROOT_20261126]), publicDirectories = new Set([MER_VISUAL_ROOT_20261126]);
  for (const item of manifest.files) {
    assert.ok(safe(item.path) && item.path.startsWith(MER_VISUAL_ROOT_20261126 + '/') && item.path !== MER_VISUAL_MANIFEST_20261126, 'Unsafe visual member path.');
    assert.equal(files.has(item.path), false, 'Duplicate visual member.');
    assert.ok(Number.isSafeInteger(item.sizeBytes) && item.sizeBytes >= 0);
    assert.match(item.sha256, /^[a-f0-9]{64}$/);
    assert.equal(typeof item.public, 'boolean');
    files.set(item.path, Object.freeze({ ...item }));
    const parts = item.path.split('/');
    for (let i = 2; i < parts.length; i++) {
      const directory = parts.slice(0, i).join('/');
      directories.add(directory);
      if (item.public) publicDirectories.add(directory);
    }
  }
  for (const path of files.keys()) assert.equal(directories.has(path), false, 'Visual file/directory collision.');
  const admits = (path, { directory = false, built = false } = {}) => {
    if (!safe(path)) return false;
    if (directory) return (built ? publicDirectories : directories).has(path);
    if (path === MER_VISUAL_MANIFEST_20261126) return !built;
    const item = files.get(path);
    return Boolean(item && (!built || item.public));
  };
  return Object.freeze({ manifest, files, directories, publicDirectories, admits, expectedSha256 });
}

let reviewed;
export function reviewedMerVisual20261126() {
  return reviewed ??= compileMerVisualManifest20261126(
    readFileSync(new URL('../' + MER_VISUAL_MANIFEST_20261126, import.meta.url)), MER_VISUAL_MANIFEST_SHA256_20261126);
}

/** null means the established admission policy owns this unrelated path. */
export function merVisualPathAdmission20261126(path, { directory = false, built = false } = {}) {
  if (!safe(path)) return false;
  if (MER_VISUAL_SOURCE_FILES_20261126.includes(path)) return !directory && !built;
  if (sourceDirectories.has(path)) return directory && !built;
  if (path.startsWith('docs/mer-des-chagrins-20261126/canvas/') || path.startsWith('docs/mer-des-chagrins-20261126/qa/')) return false;
  if (path === MER_VISUAL_ROOT_20261126 || path.startsWith(MER_VISUAL_ROOT_20261126 + '/')) {
    return reviewedMerVisual20261126().admits(path, { directory, built });
  }
  return null;
}

export function isMerVisualSourceOnly20261126(path) {
  if (path === MER_VISUAL_MANIFEST_20261126) return true;
  if (typeof path !== 'string' || !path.startsWith(MER_VISUAL_ROOT_20261126 + '/')) return false;
  const item = reviewedMerVisual20261126().files.get(path);
  return Boolean(item && !item.public);
}

async function verifyRegular(root, path) {
  const rootStat = await lstat(root);
  assert.ok(rootStat.isDirectory() && !rootStat.isSymbolicLink(), 'Invalid visual verification root.');
  const parts = path.split('/');
  for (let i = 1; i < parts.length; i++) {
    const stat = await lstat(join(root, ...parts.slice(0, i)));
    assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), 'Visual parent is not a regular directory: ' + path);
  }
  const stat = await lstat(join(root, path));
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'Visual member is not a regular file: ' + path);
  return stat;
}

export async function verifyMerVisual20261126(root, { built = false, inventory = reviewedMerVisual20261126() } = {}) {
  root = resolve(root);
  if (!built) {
    await verifyRegular(root, MER_VISUAL_MANIFEST_20261126);
    assert.equal(hash(await readFile(join(root, MER_VISUAL_MANIFEST_20261126))), inventory.expectedSha256, 'Changed visual manifest.');
  }
  const seen = new Set();
  let bytes = 0;
  async function walk(path) {
    const directory = await lstat(join(root, path));
    assert.ok(directory.isDirectory() && !directory.isSymbolicLink(), 'Invalid visual directory: ' + path);
    for (const entry of await readdir(join(root, path), { withFileTypes: true })) {
      const member = path + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Visual symlink rejected: ' + member);
      assert.equal(inventory.admits(member, { directory: entry.isDirectory(), built }), true, 'Unlisted visual member: ' + member);
      if (entry.isDirectory()) { await walk(member); continue; }
      assert.ok(entry.isFile(), 'Unsupported visual file type.');
      if (member === MER_VISUAL_MANIFEST_20261126) continue;
      const expected = inventory.files.get(member);
      const stat = await verifyRegular(root, member);
      assert.equal(stat.size, expected.sizeBytes, 'Changed visual file size: ' + member);
      assert.equal(hash(await readFile(join(root, member))), expected.sha256, 'Changed visual bytes: ' + member);
      seen.add(member);
      bytes += stat.size;
    }
  }
  await walk(MER_VISUAL_ROOT_20261126);
  for (const [path, item] of inventory.files) if (!built || item.public) assert.ok(seen.has(path), 'Missing visual member: ' + path);
  return { files: seen.size, bytes, manifestSha256: inventory.expectedSha256, built };
}

export async function copyMerVisualRuntime20261126(sourceRoot, outputRoot, { inventory = reviewedMerVisual20261126() } = {}) {
  await verifyMerVisual20261126(sourceRoot, { inventory });
  await mkdir(outputRoot, { recursive: true });
  const outputStat = await lstat(outputRoot);
  assert.ok(outputStat.isDirectory() && !outputStat.isSymbolicLink(), 'Invalid visual copy root.');
  for (const item of inventory.files.values()) {
    if (!item.public) continue;
    const parts = item.path.split('/');
    for (let i = 1; i < parts.length; i++) {
      const parent = join(outputRoot, ...parts.slice(0, i));
      await mkdir(parent, { recursive: true });
      const stat = await lstat(parent);
      assert.ok(stat.isDirectory() && !stat.isSymbolicLink(), 'Visual output parent is a symlink.');
    }
    try {
      const destination = await lstat(join(outputRoot, item.path));
      assert.ok(destination.isFile() && !destination.isSymbolicLink(), 'Visual output is not a regular file.');
    } catch (error) { if (error.code !== 'ENOENT') throw error; }
    await cp(join(sourceRoot, item.path), join(outputRoot, item.path));
  }
  return verifyMerVisual20261126(outputRoot, { built: true, inventory });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyMerVisual20261126(process.argv[2] || process.cwd(), { built: process.argv.includes('--built') }), null, 2));
}
