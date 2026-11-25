import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cp, lstat, mkdir, readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';

export const RIVER_OF_PAIN_MANIFEST = Object.freeze(JSON.parse(
  readFileSync(new URL('./river-of-pain-manifest.json', import.meta.url), 'utf8')));
export const RIVER_OF_PAIN_ROOT = 'dlc/fleuve-de-la-douleur';
export const RIVER_OF_PAIN_RUNTIME = Object.freeze([...RIVER_OF_PAIN_MANIFEST.runtimeFiles]);
const runtime = new Set(RIVER_OF_PAIN_RUNTIME);
const tooling = new Set([
  'scripts/river-of-pain-manifest.json', 'scripts/river-of-pain-distribution.mjs',
  'scripts/test-river-of-pain-source.mjs', 'scripts/verify-river-of-pain-integration.mjs',
  'scripts/verify-river-of-pain-launcher.mjs', 'scripts/qa-river-of-pain.py',
  'scripts/verify-river-of-pain-succession.mjs',
  '.github/workflows/river-of-pain.yml',
  'docs/development/RIVER_OF_PAIN_INTEGRATION.md',
  'docs/development/RIVER_OF_PAIN_VALIDATION.json',
  'archives/river-of-pain/README.md',
  'archives/river-of-pain/RIVER_OF_PAIN_QA_LOCAL_20261125.tar.gz',
]);
const source = new Set([...runtime, ...tooling,
  ...RIVER_OF_PAIN_MANIFEST.sourceFiles.map(row => row.path),
  ...RIVER_OF_PAIN_MANIFEST.archives.map(row => row.path)]);
function parents(paths) {
  const result = new Set();
  for (const path of paths) {
    const parts = path.split('/');
    while (parts.length > 1) { parts.pop(); result.add(parts.join('/')); }
  }
  return result;
}
const runtimeDirectories = parents(runtime), sourceDirectories = parents(source);

/** A null result delegates paths unrelated to this DLC to the host policy. */
export function riverOfPainPathAdmission(path, { directory = false, built = false } = {}) {
  if (typeof path !== 'string' || !path || path.startsWith('/') || path.includes('\\')
    || path.split('/').some(part => !part || part === '.' || part === '..')) return false;
  if (directory && (built ? runtimeDirectories : sourceDirectories).has(path)) return true;
  if (!directory && (built ? runtime : source).has(path)) return true;
  if (source.has(path) || sourceDirectories.has(path)) return false;
  if (path === RIVER_OF_PAIN_ROOT || path.startsWith(RIVER_OF_PAIN_ROOT + '/')
    || path === 'archives/river-of-pain' || path.startsWith('archives/river-of-pain/')) return false;
  return null;
}
async function checkedFile(root, relative) {
  let path = root;
  for (const part of relative.split('/')) {
    path = join(path, part);
    assert.equal((await lstat(path)).isSymbolicLink(), false, 'Symbolic link in DLC: ' + relative);
  }
  assert.equal((await lstat(path)).isFile(), true, 'Not a regular DLC file: ' + relative);
  return path;
}
export async function verifyRiverOfPainRecovery(root, { includeArchives = true } = {}) {
  const rows = [...RIVER_OF_PAIN_MANIFEST.sourceFiles,
    ...(includeArchives ? RIVER_OF_PAIN_MANIFEST.archives : [])];
  for (const row of rows) {
    const bytes = await readFile(await checkedFile(root, row.path));
    assert.equal(bytes.length, row.bytes, 'Recovered file size differs: ' + row.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), row.sha256,
      'Recovered file bytes differ: ' + row.path);
  }
  return { files: RIVER_OF_PAIN_MANIFEST.sourceFiles.length,
    archives: includeArchives ? RIVER_OF_PAIN_MANIFEST.archives.length : 0,
    version: RIVER_OF_PAIN_MANIFEST.version };
}
export async function copyRiverOfPainRuntime(root, output) {
  await verifyRiverOfPainRecovery(root, { includeArchives: false });
  for (const relative of RIVER_OF_PAIN_RUNTIME) {
    const sourcePath = await checkedFile(root, relative);
    await mkdir(dirname(join(output, relative)), { recursive: true });
    await cp(sourcePath, join(output, relative));
  }
  await verifyRiverOfPainRuntime(output);
}
export async function verifyRiverOfPainRuntime(root) {
  const found = [];
  async function walk(relative) {
    for (const entry of await readdir(join(root, relative), { withFileTypes: true })) {
      const path = relative + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Symbolic link in DLC distribution: ' + path);
      if (entry.isDirectory()) await walk(path);
      else { assert.equal(entry.isFile(), true); found.push(path); }
    }
  }
  await walk(RIVER_OF_PAIN_ROOT);
  assert.deepEqual(found.sort(), [...RIVER_OF_PAIN_RUNTIME].sort(),
    'DLC distribution contains unapproved or missing files.');
  for (const row of RIVER_OF_PAIN_MANIFEST.sourceFiles.filter(row => runtime.has(row.path))) {
    const bytes = await readFile(join(root, row.path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), row.sha256,
      'DLC runtime differs from the recovered original: ' + row.path);
  }
  return { id: 'river-of-pain', version: RIVER_OF_PAIN_MANIFEST.version,
    entry: '/' + RIVER_OF_PAIN_ROOT + '/', files: found.length,
    playableSha256: RIVER_OF_PAIN_MANIFEST.sourceFiles.find(row => row.path.endsWith('/JOUER.html')).sha256,
    integration: 'standalone-campaign-launcher' };
}
