import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cp, lstat, mkdir, readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRiverOfPainVisuals, renderRiverOfPainVisuals } from './build-river-of-pain-visuals.mjs';
import { buildRiverOfPainSpriteGallery } from './build-river-of-pain-sprite-gallery.mjs';

export const RIVER_OF_PAIN_MANIFEST = Object.freeze(JSON.parse(
  readFileSync(new URL('./river-of-pain-manifest.json', import.meta.url), 'utf8')));
export const RIVER_OF_PAIN_ROOT = 'dlc/fleuve-de-la-douleur';
export const RIVER_OF_PAIN_VISUAL_ROOT = RIVER_OF_PAIN_ROOT + '/visual-v1';
const checkoutRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const require = createRequire(import.meta.url);

/** Admit only the concrete PNG paths declared by the validated sprite contract.
 * Reusing one PNG is allowed; contradictory hashes for that file are not. */
export function riverOfPainVisualAssetRows(manifest, { sourceRoot = checkoutRoot } = {}) {
  // Sparse host checkouts import the admission policy without the DLC. The
  // complete visual contract is loaded only when its source is being checked.
  const { validateManifest } = require(resolve(sourceRoot, RIVER_OF_PAIN_VISUAL_ROOT, 'sprite-loader.js'));
  validateManifest(manifest);
  const files = new Map();
  for (const asset of manifest.assets) {
    const path = RIVER_OF_PAIN_VISUAL_ROOT + '/' + asset.file;
    if (files.has(path)) assert.equal(files.get(path).sha256, asset.sha256,
      'Conflicting sprite hashes for one public file: ' + path);
    else files.set(path, { path, sha256: asset.sha256 });
  }
  return [...files.values()];
}
assert.equal(RIVER_OF_PAIN_MANIFEST.visualManifest, RIVER_OF_PAIN_VISUAL_ROOT + '/sprite-manifest.json');
assert.match(RIVER_OF_PAIN_MANIFEST.visualManifestSha256, /^[a-f0-9]{64}$/,
  'Visual admission requires an exact manifest hash.');
function admittedVisualRows(rows) {
  assert.ok(Array.isArray(rows) && rows.length <= 512, 'Visual admission requires a bounded asset list.');
  const paths = new Set();
  return rows.map(row => {
    assert.ok(row && typeof row === 'object' && !Array.isArray(row), 'Invalid visual admission row.');
    assert.deepEqual(Object.keys(row).sort(), ['path', 'sha256'], 'Unexpected visual admission fields.');
    assert.ok(typeof row.path === 'string'
      && /^dlc\/fleuve-de-la-douleur\/visual-v1\/assets\/[a-z0-9][a-z0-9_/-]*\.png$/.test(row.path)
      && !row.path.includes('//') && !row.path.split('/').some(part => !part || part === '.' || part === '..'),
    'Visual admission paths must name concrete PNG files below visual-v1/assets/.');
    assert.match(row.sha256, /^[a-f0-9]{64}$/, 'Visual admission requires an exact PNG hash.');
    assert.ok(!paths.has(row.path), 'Duplicate visual admission path: ' + row.path);
    paths.add(row.path);
    return Object.freeze({ path: row.path, sha256: row.sha256 });
  });
}
// This script-local index keeps path checks usable in a sparse checkout. It is
// checked against the actual validated visual manifest before copying a build.
export const RIVER_OF_PAIN_VISUAL_ASSETS = Object.freeze(admittedVisualRows(RIVER_OF_PAIN_MANIFEST.visualAssets));
export const RIVER_OF_PAIN_RUNTIME = Object.freeze([
  ...RIVER_OF_PAIN_MANIFEST.runtimeFiles, ...RIVER_OF_PAIN_VISUAL_ASSETS.map(row => row.path)
]);
assert.equal(new Set(RIVER_OF_PAIN_RUNTIME).size, RIVER_OF_PAIN_RUNTIME.length, 'Duplicate public DLC file.');
const runtime = new Set(RIVER_OF_PAIN_RUNTIME);
const tooling = new Set([
  'scripts/river-of-pain-manifest.json', 'scripts/river-of-pain-distribution.mjs',
  'scripts/test-river-of-pain-source.mjs', 'scripts/verify-river-of-pain-integration.mjs',
  'scripts/verify-river-of-pain-launcher.mjs', 'scripts/qa-river-of-pain.py',
  'scripts/verify-river-of-pain-succession.mjs',
  'scripts/inspect-river-of-pain-sprites.py', 'scripts/build-river-of-pain-visuals.mjs',
  'scripts/build-river-of-pain-sprite-gallery.mjs',
  'scripts/verify-river-of-pain-sprites.mjs', 'scripts/verify-river-of-pain-sprites-browser.py',
  '.github/workflows/river-of-pain.yml',
  'docs/development/RIVER_OF_PAIN_INTEGRATION.md',
  'docs/development/RIVER_OF_PAIN_VALIDATION.json',
  'docs/development/RIVER_OF_PAIN_SPRITE_INVENTORY.md',
  'docs/development/RIVER_OF_PAIN_SPRITE_REFERENCES.md',
  'docs/development/RIVER_OF_PAIN_SPRITE_QA.md',
  'archives/river-of-pain/README.md',
  'archives/river-of-pain/RIVER_OF_PAIN_QA_LOCAL_20261125.tar.gz',
]);
const source = new Set([...runtime, ...tooling,
  ...RIVER_OF_PAIN_MANIFEST.visualSourceFiles,
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
export async function verifyRiverOfPainVisualSource(root) {
  const bytes = await readFile(await checkedFile(root, RIVER_OF_PAIN_MANIFEST.visualManifest));
  assert.equal(hash(bytes), RIVER_OF_PAIN_MANIFEST.visualManifestSha256,
    'Sprite manifest differs from its admitted hash.');
  await checkedFile(root, RIVER_OF_PAIN_VISUAL_ROOT + '/sprite-loader.js');
  const rows = riverOfPainVisualAssetRows(JSON.parse(bytes), { sourceRoot: root });
  assert.deepEqual(rows, RIVER_OF_PAIN_VISUAL_ASSETS,
    'Sprite files differ from the visual admission index.');
  return { manifestSha256: hash(bytes), assets: rows.length };
}
export async function copyRiverOfPainRuntime(root, output) {
  await verifyRiverOfPainVisualSource(root);
  await verifyRiverOfPainRecovery(root, { includeArchives: false });
  // The host's existing build hook produces the derivative from frozen inputs;
  // no archived builder runs and no original source is an output destination.
  await buildRiverOfPainVisuals({ root });
  await buildRiverOfPainSpriteGallery({ root });
  for (const relative of RIVER_OF_PAIN_RUNTIME) {
    const sourcePath = await checkedFile(root, relative);
    await mkdir(dirname(join(output, relative)), { recursive: true });
    await cp(sourcePath, join(output, relative));
  }
  await verifyRiverOfPainRuntime(output, { sourceRoot: root });
}
export async function verifyRiverOfPainRuntime(root, { sourceRoot = checkoutRoot } = {}) {
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
  await verifyRiverOfPainVisualSource(sourceRoot);
  const visual = await renderRiverOfPainVisuals({ root: sourceRoot });
  assert.equal(visual.manifestSha256, RIVER_OF_PAIN_MANIFEST.visualManifestSha256,
    'Sprite manifest changed after distribution admission.');
  assert.equal(hash(await readFile(join(root, RIVER_OF_PAIN_VISUAL_ROOT, 'JOUER.html'))), visual.htmlSha256,
    'Visual DLC HTML differs from its canonical build.');
  for (const row of RIVER_OF_PAIN_VISUAL_ASSETS) {
    assert.equal(hash(await readFile(join(root, row.path))), row.sha256,
      'Visual DLC PNG differs from its declared hash: ' + row.path);
  }
  const gallery = RIVER_OF_PAIN_VISUAL_ROOT + '/GALLERY.html';
  assert.equal(hash(await readFile(join(root, gallery))),
    hash(await readFile(await checkedFile(sourceRoot, gallery))), 'Visual gallery differs from its source.');
  return { id: 'river-of-pain', version: RIVER_OF_PAIN_MANIFEST.version,
    entry: '/' + RIVER_OF_PAIN_ROOT + '/', files: found.length,
    playableSha256: RIVER_OF_PAIN_MANIFEST.sourceFiles.find(row => row.path.endsWith('/JOUER.html')).sha256,
    integration: 'standalone-campaign-launcher',
    visual: { id: visual.visualId, entry: '/' + RIVER_OF_PAIN_VISUAL_ROOT + '/JOUER.html',
      htmlSha256: visual.htmlSha256, manifestSha256: visual.manifestSha256,
      assets: RIVER_OF_PAIN_VISUAL_ASSETS.length } };
}
