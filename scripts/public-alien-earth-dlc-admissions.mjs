import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { readFile, readdir, lstat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const EARTH_MODULE_ROOT_V12 = 'modules/alien-earth/v12';
export const EARTH_RUNTIME_ROOT_V12 = 'dlc/alien-earth/v12';
export const EARTH_RECOVERY_V11 = 'modules/alien-earth/RECOVERY_V11.json';
export const EARTH_RECOVERY_SHA256_V11 = 'e19aa945cb860e57503e41e81c019bb91b40e33198042ebec5c3308d387d199d';
export const EARTH_ARCHIVE_SHA256_V11 = 'c6402939c7e3085609b191848f710cd2efe84c5bfe6547a2cf95ca39494c38f3';
export const EARTH_JS_FILES_V12 = Object.freeze([
  'src/alien-earth-containment-art-v5.js', 'src/alien-earth-containment-v5.js',
  'src/alien-earth-core.js', 'src/alien-earth-data.js', 'src/alien-earth-ducts-art-v7.js',
  'src/alien-earth-ducts-v7.js', 'src/alien-earth-fidelity-v10.js', 'src/alien-earth-fidelity-v11.js',
  'src/alien-earth-investigations-v8.js', 'src/alien-earth-raster-v12.js',
  'src/alien-earth-reference-art-v10.js', 'src/alien-earth-reference-art-v11.js',
  'src/alien-earth-renderer.js', 'src/alien-earth-scenery-v2.js', 'src/alien-earth-scenery-v3.js',
  'src/alien-earth-scenery-v4.js', 'src/alien-earth-security-art-v9.js', 'src/alien-earth-security-v9.js',
  'src/alien-earth-sensors-art-v6.js', 'src/alien-earth-sensors-v6.js',
  'src/alien-earth-services-v4.js', 'src/alien-earth-storage-v2.js', 'src/alien-earth-ui.js',
]);
// Closed runtime admission: files must exist and match the checked-out source.
export const EARTH_RASTER_FILES_V12 = Object.freeze([
  'assets/raster-v12/mcsx.png', 'assets/raster-v12/species19-adult.png',
  'assets/raster-v12/joe-mcsx-idle.png', 'assets/raster-v12/arthur-idle.png',
  'assets/raster-v12/wendy-idle.png', 'assets/raster-v12/kirsh-idle.png',
  'assets/raster-v12/curly-idle.png', 'assets/raster-v12/nibs-idle.png',
  'assets/raster-v12/zoo-cylinder.png', 'assets/raster-v12/zoo-console.png',
  'assets/raster-v12/zoo-lab-table.png', 'assets/raster-v12/zoo-cabinet.png',
  'assets/raster-v12/zoo-wall-light.png',
  'assets/raster-v12/zoo-wall-light-off.png',
  'assets/raster-v12/zoo-pipette.png',
]);
export const EARTH_RUNTIME_FILES_V12 = Object.freeze(['index.html', 'earth.css', ...EARTH_JS_FILES_V12, ...EARTH_RASTER_FILES_V12]);
export const EARTH_CHANGED_ORIGINALS_V12 = Object.freeze([
  'index.html', 'package.json', 'scripts/build.mjs', 'src/alien-earth-ui.js',
  'src/alien-earth-renderer.js', 'src/alien-earth-reference-art-v10.js', 'src/alien-earth-reference-art-v11.js',
]);
export const EARTH_SOURCE_ONLY_V12 = Object.freeze([
  EARTH_RECOVERY_V11,
  'scripts/build-alien-earth-dlc.mjs', 'scripts/public-alien-earth-dlc-admissions.mjs',
  'scripts/verify-alien-earth-integration-v12.mjs', 'scripts/qa-alien-earth-integration-v12.py',
  '.github/workflows/alien-earth-dlc.yml',
  'docs/development/ALIEN_EARTH_GITHUB_INTEGRATION_V12.md',
  'docs/development/alien-earth-v12/README.md', 'docs/development/alien-earth-v12/BIBLE.md',
  'docs/development/alien-earth-v12/CONTINUATION.md', 'docs/development/alien-earth-v12/manifest.json',
  'docs/development/alien-earth-v12/references.md', 'docs/development/alien-earth-v12/generation-ledger.json',
  'docs/development/alien-earth-v12/index.html', 'docs/development/alien-earth-v12/inventory.json',
  'docs/development/alien-earth-v12/qa/browser-report.json',
  'docs/development/alien-earth-v12/qa/test-report.json',
  'docs/development/alien-earth-v12/qa/raster-review.png',
  'docs/development/alien-earth-v12/qa/zoo-room.png',
  'docs/development/alien-earth-v12/qa/title-menu.png',
  EARTH_MODULE_ROOT_V12 + '/tests/lifecycle-v12.test.mjs',
  EARTH_MODULE_ROOT_V12 + '/tests/raster-v12.test.mjs',
  EARTH_MODULE_ROOT_V12 + '/src/alien-earth-raster-v12.js',
]);
const checkoutRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const valid = path => typeof path === 'string' && path && !/[\\\x00-\x1f]/.test(path)
  && !path.startsWith('/') && path.split('/').every(p => p && p !== '.' && p !== '..');
const parents = files => new Set(files.flatMap(path => path.split('/').slice(0, -1).map((_, i) => path.split('/').slice(0, i + 1).join('/'))));
let recovery;
export function reviewedEarthRecoveryV11() {
  if (recovery) return recovery;
  const bytes = readFileSync(join(checkoutRoot, EARTH_RECOVERY_V11));
  assert.equal(sha(bytes), EARTH_RECOVERY_SHA256_V11, 'Unreviewed Earth recovery manifest');
  const data = JSON.parse(bytes);
  assert.equal(data.schemaVersion, 1); assert.equal(data.sourceArchive.sha256, EARTH_ARCHIVE_SHA256_V11);
  assert.equal(data.sourceArchive.bytes, 23895722); assert.equal(data.fileCount, 180); assert.equal(data.files.length, 180);
  const files = new Map();
  for (const entry of data.files) {
    assert.ok(valid(entry.path)); assert.match(entry.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isSafeInteger(entry.bytes) && entry.bytes >= 0);
    const path = EARTH_MODULE_ROOT_V12 + '/' + entry.path;
    assert.equal(files.has(path), false); files.set(path, Object.freeze({ ...entry, path }));
  }
  recovery = { files, directories: parents([...files.keys()]) }; return recovery;
}
export function earthRecoveryFileV11(path) {
  if (!valid(path) || !path.startsWith(EARTH_MODULE_ROOT_V12 + '/')) return null;
  const relative = path.slice(EARTH_MODULE_ROOT_V12.length + 1);
  if (EARTH_CHANGED_ORIGINALS_V12.includes(relative)) return null;
  return reviewedEarthRecoveryV11().files.get(path) || null;
}
export function publicEarthDlcPathAdmissionV12(path, { directory = false, built = false } = {}) {
  if (!valid(path)) return false;
  const runtime = EARTH_RUNTIME_FILES_V12.map(file => EARTH_RUNTIME_ROOT_V12 + '/' + file);
  const runtimeDirs = parents(runtime);
  if (runtime.includes(path)) return !directory;
  if (path === 'dlc/alien-earth' || path === EARTH_RUNTIME_ROOT_V12 || path.startsWith(EARTH_RUNTIME_ROOT_V12 + '/'))
    return directory && runtimeDirs.has(path);
  if (path.startsWith('dlc/alien-earth/')) return false;
  if (EARTH_SOURCE_ONLY_V12.includes(path)) return !built && !directory;
  if (path === 'docs/development/alien-earth-v12') return !built && directory;
  if (path.startsWith('docs/development/alien-earth-v12/')) return !built && directory && parents(EARTH_SOURCE_ONLY_V12).has(path);
  if (path !== 'modules/alien-earth' && !path.startsWith('modules/alien-earth/')) return null;
  if (built) return false;
  const sourceFiles = [...reviewedEarthRecoveryV11().files.keys(), ...EARTH_SOURCE_ONLY_V12,
    ...EARTH_RASTER_FILES_V12.map(file => EARTH_MODULE_ROOT_V12 + '/' + file)];
  return directory ? parents(sourceFiles).has(path) : sourceFiles.includes(path);
}
export async function verifyEarthDlcV12(root, { built = false } = {}) {
  const files = [], tree = built ? EARTH_RUNTIME_ROOT_V12 : EARTH_MODULE_ROOT_V12;
  async function walk(relative) {
    const info = await lstat(join(root, relative)); assert.equal(info.isSymbolicLink(), false, 'Earth symlink: ' + relative);
    assert.equal(publicEarthDlcPathAdmissionV12(relative, { built, directory: info.isDirectory() }), true, 'Unapproved Earth path: ' + relative);
    if (info.isDirectory()) { for (const name of (await readdir(join(root, relative))).sort()) await walk(relative + '/' + name); }
    else {
      assert.ok(info.isFile()); files.push(relative);
      const original = !built && earthRecoveryFileV11(relative);
      if (original) { const bytes = await readFile(join(root, relative)); assert.equal(bytes.length, original.bytes); assert.equal(sha(bytes), original.sha256, 'Changed historical Earth source: ' + relative); }
    }
  }
  await walk(tree);
  const expected = built ? EARTH_RUNTIME_FILES_V12.map(path => EARTH_RUNTIME_ROOT_V12 + '/' + path)
    : [...reviewedEarthRecoveryV11().files.keys(), ...EARTH_SOURCE_ONLY_V12.filter(path => path.startsWith(EARTH_MODULE_ROOT_V12 + '/')),
      ...EARTH_RASTER_FILES_V12.map(path => EARTH_MODULE_ROOT_V12 + '/' + path)];
  assert.deepEqual(files.sort(), [...new Set(expected)].sort(), 'Incomplete Earth package');
  if (built) {
    for (const path of files) {
      const relative = path.slice(EARTH_RUNTIME_ROOT_V12.length + 1);
      assert.deepEqual(await readFile(join(root, path)), await readFile(join(checkoutRoot, EARTH_MODULE_ROOT_V12, relative)), 'Earth derivative mismatch: ' + path);
    }
  }
  return { files: files.length, built, saveNamespace: 'atf.dlc.alien-earth.s1.profile-1' };
}
