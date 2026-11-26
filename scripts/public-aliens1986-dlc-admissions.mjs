import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { lstat, readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

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
export const ALIENS1986_SPRITE_REVIEW_ROOT_V115 = 'docs/development/aliens-1986-sprites-v115';
export const ALIENS1986_SPRITE_SOURCE_ONLY_FILES_V115 = Object.freeze([
  'docs/development/ALIENS_1986_SPRITE_INVENTORY_V115.json',
  'docs/development/ALIENS_1986_SPRITE_INVENTORY_V115.md',
  'docs/development/ALIENS_1986_RASTER_INTEGRATION_REVIEW_V115.md',
  ALIENS1986_SPRITE_REVIEW_ROOT_V115 + '/index.html',
  ALIENS1986_SPRITE_REVIEW_ROOT_V115 + '/manifest.json',
  ALIENS1986_SPRITE_REVIEW_ROOT_V115 + '/README.md',
  'scripts/verify-aliens1986-sprite-pack-admission-v115.mjs',
]);
export const ALIENS1986_RASTER_SOURCE_ONLY_FILES_V116 = Object.freeze([
  'modules/aliens-1986/v116/sprite-loader-v116.mjs',
  'modules/aliens-1986/v116/raster-renderer-v116.mjs',
  'scripts/derive-aliens1986-raster-v116.mjs',
  'scripts/verify-aliens1986-main-succession-v116.mjs',
  'scripts/verify-aliens1986-raster-presentation-v116.mjs',
  'docs/development/aliens-1986-sprites-v116/manifest.json',
  'docs/development/aliens-1986-sprites-v116/index.html',
  'docs/development/aliens-1986-sprites-v116/README.md',
  'docs/development/aliens-1986-sprites-v116/references.md',
  'docs/development/aliens-1986-sprites-v116/generation-ledger.json',
]);
// Reviewed presentation inputs cannot silently re-authorize a changed derivative.
export const ALIENS1986_RASTER_SOURCE_SHA256_V116 = Object.freeze({
  'modules/aliens-1986/v116/sprite-loader-v116.mjs': '8dd7974d0222294b0e013e06efdc74d76259927ae9890648b57b6fa4385cc7c5',
  'modules/aliens-1986/v116/raster-renderer-v116.mjs': '77d7315bbc4adb6ddb01c4493fc45daaed8beb73ba68efc3d1f88373a7d28170',
  'scripts/derive-aliens1986-raster-v116.mjs': '2dbd40d44678f028c865ea03bc99bfc020adce38b5f8465294949f745ad76434',
  'docs/development/aliens-1986-sprites-v116/manifest.json': 'b9213752445a01e293f44bccface374d3d3882e8ae071baefaa75bf04d589af6',
});
// V117 appends seven prop images without rewriting the four V116 receipts.
// Only the derivation tool continues; loader, renderer and base manifest do not.
export const ALIENS1986_RASTER_BASELINE_V117 = '5f38b7bad2c6401424b23fda11aeb86068f0f354';
export const ALIENS1986_RASTER_SOURCE_SUCCESSORS_V117 = Object.freeze({
  'scripts/derive-aliens1986-raster-v116.mjs': Object.freeze({
    previousSha256: '2dbd40d44678f028c865ea03bc99bfc020adce38b5f8465294949f745ad76434',
    currentSha256: '3b053e26bc98a62b9332554b31e28a7f40172e7e0337e94c45c9eab5551a328a',
  }),
});
export const ALIENS1986_RASTER_SOURCE_ONLY_FILES_V117 = Object.freeze([
  'scripts/qa-aliens1986-props-v117.py',
  'docs/development/aliens-1986-sprites-v117/manifest.json',
  'docs/development/aliens-1986-sprites-v117/index.html',
  'docs/development/aliens-1986-sprites-v117/README.md',
  'docs/development/aliens-1986-sprites-v117/references.md',
  'docs/development/aliens-1986-sprites-v117/generation-ledger.json',
]);
export const ALIENS1986_RASTER_SOURCE_SHA256_V117 = Object.freeze({
  // The reviewed supplement is pinned independently of the V116 base manifest.
  'docs/development/aliens-1986-sprites-v117/manifest.json': '09df948f5ee55c2b9b2494924475b7113468edddfa4d803caaf1323ee4804a62',
});
// Keep this supplement closed without loading its manifest in sparse checkouts.
export const ALIENS1986_RASTER_ASSET_ROOT_V117 = 'assets/dlc/aliens-1986/v117';
export const ALIENS1986_RASTER_ASSET_FILES_V117 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/architecture/door-leaf-damaged.png',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/architecture/door-leaf-reinforced.png',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/architecture/door-leaf-breached.png',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/props/meal-tray-food.png',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/props/supply-case-medical-empty.png',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/props/supply-case-ammo-closed.png',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/props/supply-case-ammo-empty.png',
]);
export const ALIENS1986_RASTER_ASSET_DIRECTORIES_V117 = Object.freeze([
  ALIENS1986_RASTER_ASSET_ROOT_V117,
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/architecture',
  ALIENS1986_RASTER_ASSET_ROOT_V117 + '/props',
]);
const checkoutRoot = dirname(dirname(fileURLToPath(import.meta.url)));
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
  if (path === ALIENS1986_RASTER_ASSET_ROOT_V117 || path.startsWith(ALIENS1986_RASTER_ASSET_ROOT_V117 + '/')) {
    return directory ? ALIENS1986_RASTER_ASSET_DIRECTORIES_V117.includes(path) : ALIENS1986_RASTER_ASSET_FILES_V117.includes(path);
  }
  if (ALIENS1986_RASTER_SOURCE_ONLY_FILES_V117.includes(path)) return !built && !directory;
  if (path === 'docs/development/aliens-1986-sprites-v117') return !built && directory;
  if (path.startsWith('docs/development/aliens-1986-sprites-v117/')) return false;
  if (ALIENS1986_RASTER_SOURCE_ONLY_FILES_V116.includes(path)) return !built && !directory;
  if (['modules/aliens-1986/v116', 'docs/development/aliens-1986-sprites-v116'].includes(path)) return !built && directory;
  if (path.startsWith('modules/aliens-1986/v116/') || path.startsWith('docs/development/aliens-1986-sprites-v116/')) return false;
  if (ALIENS1986_SPRITE_SOURCE_ONLY_FILES_V115.includes(path)) return !built && !directory;
  if (['docs', 'docs/development', ALIENS1986_SPRITE_REVIEW_ROOT_V115].includes(path)) return !built && directory;
  if (path.startsWith(ALIENS1986_SPRITE_REVIEW_ROOT_V115 + '/')) return false;
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

async function checkedFile(root, relative) {
  assert.ok(validPath(relative), 'Unsafe Aliens 1986 presentation path: ' + relative);
  const parts = relative.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const path = join(root, ...parts.slice(0, i));
    const entry = await lstat(path);
    assert.equal(entry.isSymbolicLink(), false, 'Aliens 1986 presentation symlink: ' + relative);
    assert.ok(i === parts.length ? entry.isFile() : entry.isDirectory(), 'Invalid Aliens 1986 presentation path: ' + relative);
  }
  return readFile(join(root, relative));
}

export function reviewedAliens1986RasterDigestV117(path, endpoint) {
  const receipt = ALIENS1986_RASTER_SOURCE_SUCCESSORS_V117[path];
  if (!receipt) return endpoint;
  assert.equal(endpoint, receipt.previousSha256, 'Broken Aliens 1986 presentation predecessor: ' + path);
  assert.match(receipt.currentSha256, /^[a-f0-9]{64}$/, 'Unreviewed Aliens 1986 presentation successor: ' + path);
  assert.notEqual(receipt.currentSha256, receipt.previousSha256, 'Aliens 1986 presentation successor must change bytes: ' + path);
  return receipt.currentSha256;
}

export async function verifyAliens1986RasterSourcesV116(sourceRoot = checkoutRoot) {
  const base = resolve(sourceRoot);
  const inputs = [
    ...Object.entries(ALIENS1986_RASTER_SOURCE_SHA256_V116).map(([path, previous]) =>
      [path, reviewedAliens1986RasterDigestV117(path, previous)]),
    ...Object.entries(ALIENS1986_RASTER_SOURCE_SHA256_V117),
  ];
  for (const [path, expected] of inputs) {
    assert.match(expected, /^[a-f0-9]{64}$/, 'Unreviewed Aliens 1986 presentation source: ' + path);
    assert.equal(digest(await checkedFile(base, path)), expected, 'Changed Aliens 1986 presentation source: ' + path);
  }
  return { presentationSources: inputs.length };
}

async function verifyAliens1986RasterTreeV117(root, assets) {
  const prefix = ALIENS1986_RASTER_ASSET_ROOT_V117 + '/';
  assert.deepEqual(assets.filter(asset => asset.path.startsWith(prefix)).map(asset => asset.path).sort(),
    [...ALIENS1986_RASTER_ASSET_FILES_V117].sort(), 'Unapproved Aliens 1986 V117 raster inventory.');
  const seen = new Set();
  async function walk(directory) {
    await assertDirectory(join(root, directory));
    for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
      const path = directory + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Aliens 1986 V117 raster symlink: ' + path);
      assert.equal(publicAliens1986DlcPathAdmission(path, { directory: entry.isDirectory() }), true,
        'Unapproved Aliens 1986 V117 raster member: ' + path);
      if (entry.isDirectory()) { await walk(path); continue; }
      assert.ok(entry.isFile(), 'Invalid Aliens 1986 V117 raster member: ' + path);
      seen.add(path);
    }
  }
  await walk(ALIENS1986_RASTER_ASSET_ROOT_V117);
  for (const path of ALIENS1986_RASTER_ASSET_FILES_V117) {
    assert.ok(seen.has(path), 'Missing Aliens 1986 V117 raster member: ' + path);
  }
}

export async function verifyAliens1986Runtime(root, { sourceRoot = checkoutRoot, built = false } = {}) {
  const base = resolve(root);
  await verifyAliens1986RasterSourcesV116(sourceRoot);
  // Path-policy consumers may use a sparse source checkout without the DLC.
  const { renderAliens1986RasterV116 } = await import('./derive-aliens1986-raster-v116.mjs');
  const derivative = await renderAliens1986RasterV116({ root: resolve(sourceRoot) });
  assert.equal(digest(derivative.html), derivative.sha256, 'Aliens 1986 derivative digest mismatch.');
  await assertDirectory(join(base, 'dlc'));
  await assertDirectory(join(base, ALIENS1986_RUNTIME_ROOT));
  const actual = await readdir(join(base, ALIENS1986_RUNTIME_ROOT), { withFileTypes: true });
  assert.deepEqual(actual.map(entry => entry.name).sort(), ['game.html', 'index.html'], 'Unapproved Aliens 1986 runtime member.');
  const expectedHtml = built ? Buffer.from(derivative.html) : null;
  const expectedGameSha256 = built ? derivative.sha256 : ALIENS1986_GAME_SHA256;
  let totalBytes = 0;
  for (const path of ALIENS1986_RUNTIME_FILES) {
    const bytes = await checkedFile(base, path);
    totalBytes += bytes.length;
    if (path.endsWith('/game.html')) {
      assert.equal(bytes.length, built ? expectedHtml.length : ALIENS1986_GAME_BYTES, 'Changed Aliens 1986 runtime size.');
      assert.equal(digest(bytes), expectedGameSha256, 'Changed Aliens 1986 runtime bytes.');
    } else {
      assert.match(bytes.toString('utf8'), /<iframe\b[^>]*\bsrc=["'](?:\.\/)?game\.html["']/i, 'Aliens 1986 launcher must load the admitted local game.');
    }
  }
  assert.ok(Array.isArray(derivative.assets) && derivative.assets.length > 0, 'Aliens 1986 derivative has no raster inventory.');
  await verifyAliens1986RasterTreeV117(base, derivative.assets);
  const seen = new Set();
  // The pinned manifest is the closed asset list, including reviewed host PNGs.
  // Each path stays under assets and every byte is checked independently.
  for (const asset of derivative.assets) {
    assert.ok(validPath(asset.path) && asset.path.startsWith('assets/') && asset.path.endsWith('.png'), 'Invalid Aliens 1986 raster path: ' + asset.path);
    assert.equal(seen.has(asset.path), false, 'Duplicate Aliens 1986 raster path: ' + asset.path);
    assert.match(asset.sha256, /^[a-f0-9]{64}$/, 'Invalid Aliens 1986 raster digest: ' + asset.path);
    const bytes = await checkedFile(base, asset.path);
    assert.equal(digest(bytes), asset.sha256, 'Changed Aliens 1986 raster bytes: ' + asset.path);
    totalBytes += bytes.length;
    seen.add(asset.path);
  }
  return {
    runtimeFiles: ALIENS1986_RUNTIME_FILES.length, runtimeBytes: totalBytes,
    gameSha256: expectedGameSha256, originalGameSha256: ALIENS1986_GAME_SHA256,
    rasterAssets: seen.size, rasterRevision: built ? 116 : null,
    rasterAssetRevision: derivative.assetRevision,
  };
}

/** Validate all recovered files, including omissions, additions and symlinks.
 * Built validation independently rejects source corpus leakage. */
export async function verifyAliens1986DlcAdmissions(root, {
  built = false, expectedSha256 = ALIENS1986_RECOVERY_MANIFEST_SHA256, sourceRoot = checkoutRoot,
} = {}) {
  const base = resolve(root);
  if (built) {
    assert.ok(await absent(join(base, ALIENS1986_MODULE_ROOT)), 'Aliens 1986 recovered sources must not be present in a built distribution.');
    return { ok: true, built: true, recoveredFiles: 0, ...await verifyAliens1986Runtime(base, { sourceRoot, built: true }) };
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
    ...await verifyAliens1986Runtime(base, { sourceRoot, built: false }) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyAliens1986DlcAdmissions(process.cwd(), { built: process.argv.includes('--built') }), null, 2));
}
