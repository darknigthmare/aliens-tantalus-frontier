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
export const ALIEN_ISOLATION_SOURCE_ONLY_FILES = Object.freeze([
  ALIEN_ISOLATION_MODULE_ROOT + '/README.md', ALIEN_ISOLATION_RECOVERY_MANIFEST,
  'scripts/public-alien-isolation-dlc-admissions.mjs',
  'scripts/build-alien-isolation-dlc.mjs',
  'scripts/verify-alien-isolation-dlc-integration.mjs',
  'scripts/qa-alien-isolation-integration.py',
  'scripts/qa-alien-isolation-fidelity.py',
  'scripts/recover-alien-isolation-source.py',
  '.github/workflows/recover-alien-isolation-source.yml',
  '.github/workflows/alien-isolation-dlc.yml',
  'docs/development/ALIEN_ISOLATION_GITHUB_INTEGRATION_20261126.md',
  'docs/development/ALIEN_ISOLATION_GITHUB_INTEGRATION_20261126.json',
  ...['README.md', 'coverage.json', 'prompts.json', 'visual-qa.json', 'index.html', 'source-assets.json', 'props-production-local-20261126.json', 'portraits-production-local-20261126.json', 'local-recovery-20261126.json', 'local-recovery-20261126.html']
    .map(name => 'docs/development/alien-isolation-fidelity/' + name),
]);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const validPath = path => typeof path === 'string' && path.length > 0
  && !/[\\\x00-\x1f]/.test(path) && !path.startsWith('/')
  && path.split('/').every(part => part && part !== '.' && part !== '..');


export const ALIEN_ISOLATION_RUNTIME_MANIFEST = ALIEN_ISOLATION_RUNTIME_ROOT + '/fidelity/manifest.json';
export const ALIEN_ISOLATION_RUNTIME_MANIFEST_SHA256 = '77ba5e22f3461d7f7efa48367b7b6b852cf8179a4b0c99a40f09e1e836cae448';
export const ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT = 'docs/development/alien-isolation-fidelity';
export const ALIEN_ISOLATION_SOURCE_ASSETS_MANIFEST = ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT + '/source-assets.json';
export const ALIEN_ISOLATION_SOURCE_ASSETS_MANIFEST_SHA256 = 'e905a54ad1da9ddb401ffdf8ecad8bd8ebd0945c46d775c4df2a96b9a2647753';
const RASTER_INJECTION = '<script type="module" src="./fidelity/adapter.js"></script>\n';
const roleNames = new Set(['amanda', 'eva', 'marlow', 'alien', 'joe', 'human', 'facehugger', 'nora', 'elias']);
const poseNames = new Set(['idle', 'walk', 'crouch', 'crouch-walk']);
const itemKeys = new Set(['noise', 'flare', 'emp', 'medkit']);
const toolKeys = new Set(['tracker', 'torch', 'tuner', 'flame']);
const safeId = value => typeof value === 'string' && /^[a-z][a-z0-9-]*$/.test(value);
const logicalId = value => typeof value === 'string' && value.length > 0
  && value === value.trim() && !/[\x00-\x1f\x7f]/.test(value);

function exactKeys(value, required, optional = [], label = 'manifest object') {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), 'Invalid ' + label);
  const allowed = new Set([...required, ...optional]);
  for (const name of required) assert.ok(Object.hasOwn(value, name), 'Missing ' + label + ' field: ' + name);
  for (const name of Object.keys(value)) assert.ok(allowed.has(name), 'Unreviewed ' + label + ' field: ' + name);
}
function addParents(directories, path) {
  const parts = path.split('/');
  for (let i = 1; i < parts.length; i++) directories.add(parts.slice(0, i).join('/'));
}
function checkedManifest(bytes, expectedSha256, label) {
  assert.match(expectedSha256, /^[a-f0-9]{64}$/, 'Invalid reviewed ' + label + ' digest.');
  assert.equal(digest(bytes), expectedSha256, 'Unreviewed ' + label + ' manifest bytes.');
  return JSON.parse(bytes.toString('utf8'));
}
function checkedRecord(record, label) {
  assert.ok(Number.isSafeInteger(record.bytes) && record.bytes > 0, 'Invalid ' + label + ' size.');
  assert.match(record.sha256, /^[a-f0-9]{64}$/, 'Invalid ' + label + ' SHA256.');
}
function checkedDimensions(record) {
  assert.ok(Number.isSafeInteger(record.width) && record.width > 0 && record.width <= 8192, 'Invalid PNG width.');
  assert.ok(Number.isSafeInteger(record.height) && record.height > 0 && record.height <= 8192, 'Invalid PNG height.');
}
function gameContent(html) {
  const match = html.match(/^const CONTENT = (\{.*\});$/m);
  assert.ok(match, 'Missing embedded Alien Isolation content.');
  return JSON.parse(match[1]);
}

/** Preserve all original bytes except the documentary reference and one module injection. */
export function deriveAlienIsolationRuntime(originalBytes) {
  assert.equal(originalBytes.length, ALIEN_ISOLATION_GAME_BYTES, 'Changed original Alien Isolation size.');
  assert.equal(digest(originalBytes), ALIEN_ISOLATION_GAME_SHA256, 'Changed original Alien Isolation bytes.');
  const original = originalBytes.toString('utf8'), content = gameContent(original);
  assert.equal(typeof content.spatialRevision?.reference, 'string', 'Missing documentary reference.');
  const reference = ',"reference":' + JSON.stringify(content.spatialRevision.reference);
  assert.equal(original.split(reference).length, 2, 'Ambiguous documentary reference.');
  assert.equal(original.split('</body>').length, 2, 'Ambiguous game body boundary.');
  assert.equal(original.includes(RASTER_INJECTION.trim()), false, 'Raster adapter is already injected.');
  return Buffer.from(original.replace(reference, '').replace('</body>', RASTER_INJECTION + '</body>'));
}

/** External digest pin, closed filenames and typed bindings; no self-admission. */
export function compileAlienIsolationRuntimeManifest(bytes, expectedSha256 = ALIEN_ISOLATION_RUNTIME_MANIFEST_SHA256) {
  const manifest = checkedManifest(bytes, expectedSha256, 'Alien Isolation runtime');
  exactKeys(manifest, ['schema', 'module', 'packVersion', 'sourceVersion', 'sourceGameSha256', 'files', 'assets', 'bindings']);
  assert.equal(manifest.schema, 1);
  assert.equal(manifest.module, 'alien-isolation');
  assert.equal(manifest.packVersion, '1.0.0');
  assert.equal(manifest.sourceVersion, '0.8.0');
  assert.equal(manifest.sourceGameSha256, ALIEN_ISOLATION_GAME_SHA256);
  assert.ok(Array.isArray(manifest.files) && manifest.files.length > 0, 'Missing runtime files.');
  const files = new Map(), directories = new Set(['dlc', ALIEN_ISOLATION_RUNTIME_ROOT]);
  const images = new Map();
  for (const record of manifest.files) {
    exactKeys(record, ['path', 'bytes', 'sha256', 'kind'], record.kind === 'image' ? ['width', 'height'] : [], 'runtime file');
    assert.ok(validPath(record.path), 'Unsafe runtime path.');
    const fixed = { 'index.html': 'launcher', 'game.html': 'game', 'fidelity/adapter.js': 'adapter' };
    const image = /^fidelity\/assets\/[a-z0-9][a-z0-9-]*\.png$/.test(record.path);
    assert.ok(image || Object.hasOwn(fixed, record.path), 'Unreviewed runtime member: ' + record.path);
    assert.equal(record.kind, image ? 'image' : fixed[record.path], 'Wrong runtime file kind.');
    checkedRecord(record, 'runtime file');
    if (image) checkedDimensions(record);
    const path = ALIEN_ISOLATION_RUNTIME_ROOT + '/' + record.path;
    assert.equal(files.has(path), false, 'Duplicate runtime path.');
    files.set(path, Object.freeze({ ...record, path }));
    addParents(directories, path);
    if (image) images.set(path, record);
  }
  for (const name of ['index.html', 'game.html', 'fidelity/adapter.js'])
    assert.ok(files.has(ALIEN_ISOLATION_RUNTIME_ROOT + '/' + name), 'Missing required runtime file: ' + name);
  assert.ok(images.size > 0, 'Missing raster images.');
  files.set(ALIEN_ISOLATION_RUNTIME_MANIFEST, Object.freeze({
    path: ALIEN_ISOLATION_RUNTIME_MANIFEST, bytes: bytes.length, sha256: expectedSha256, kind: 'manifest',
  }));
  addParents(directories, ALIEN_ISOLATION_RUNTIME_MANIFEST);
  assert.ok(Array.isArray(manifest.assets), 'Runtime assets must be an array.');
  const assets = new Map(), imageReferences = new Set();
  for (const asset of manifest.assets) {
    exactKeys(asset, ['id', 'src', 'requireAlpha'], ['facing'], 'runtime asset');
    assert.ok(safeId(asset.id), 'Invalid runtime asset ID.');
    assert.equal(assets.has(asset.id), false, 'Duplicate asset ID.');
    assert.match(asset.src, /^\.\/assets\/[a-z0-9][a-z0-9-]*\.png$/, 'Unsafe asset path.');
    assert.equal(typeof asset.requireAlpha, 'boolean', 'Invalid alpha requirement.');
    if (asset.facing !== undefined) assert.ok(['right', 'left'].includes(asset.facing), 'Invalid asset facing.');
    const path = ALIEN_ISOLATION_RUNTIME_ROOT + '/fidelity/' + asset.src.slice(2);
    assert.ok(images.has(path), 'Asset refers to an unreviewed PNG.');
    assert.equal(imageReferences.has(path), false, 'Duplicate PNG asset reference.');
    imageReferences.add(path); assets.set(asset.id, Object.freeze({ ...asset, path }));
  }
  assert.equal(imageReferences.size, images.size, 'Runtime PNG lacks an asset declaration.');
  exactKeys(manifest.bindings, [], ['characters', 'props', 'ui', 'tools', 'portraits'], 'runtime bindings');
  const used = new Set();
  const use = id => { assert.ok(assets.has(id), 'Binding refers to an unknown asset: ' + id); used.add(id); return assets.get(id); };
  for (const [group, entries] of Object.entries(manifest.bindings)) {
    assert.ok(Array.isArray(entries), 'Binding group must be an array: ' + group);
    const seen = new Set();
    for (const entry of entries) {
      let key;
      if (group === 'characters') {
        exactKeys(entry, ['kind', 'pose', 'frames'], [], 'character binding');
        assert.ok(roleNames.has(entry.kind), 'Unknown character role.');
        assert.ok(poseNames.has(entry.pose), 'Unknown character pose.');
        assert.ok(Array.isArray(entry.frames), 'Character frames must be an array.');
        const moving = entry.pose === 'walk' || entry.pose === 'crouch-walk';
        assert.ok(moving ? [2, 8].includes(entry.frames.length) : entry.frames.length === 1, 'Invalid pose frame count.');
        assert.equal(new Set(entry.frames).size, entry.frames.length, 'Duplicate animation frame IDs.');
        const frames = entry.frames.map(use);
        assert.equal(new Set(frames.map(asset => files.get(asset.path).sha256)).size, frames.length, 'Duplicate animation frame bytes.');
        assert.ok(frames.every(asset => ['right', 'left'].includes(asset.facing)), 'Character frame lacks facing.');
        assert.equal(new Set(frames.map(asset => asset.facing)).size, 1, 'Animation facing is inconsistent.');
        key = entry.kind + ':' + entry.pose;
      } else if (group === 'props') {
        exactKeys(entry, ['kind', 'asset'], ['openedAsset', 'propIds'], 'prop binding');
        assert.ok(logicalId(entry.kind), 'Invalid prop kind.');
        use(entry.asset); if (entry.openedAsset !== undefined) use(entry.openedAsset);
        if (entry.propIds !== undefined) {
          assert.ok(Array.isArray(entry.propIds) && entry.propIds.length > 0, 'Invalid prop ID scope.');
          assert.ok(entry.propIds.every(logicalId), 'Invalid prop ID.');
          assert.equal(new Set(entry.propIds).size, entry.propIds.length, 'Duplicate prop IDs.');
        }
        key = entry.kind + ':' + (entry.propIds ? [...entry.propIds].sort().join('|') : '*');
      } else if (group === 'portraits') {
        exactKeys(entry, ['name', 'asset'], [], 'portrait binding');
        assert.ok(logicalId(entry.name), 'Invalid portrait name.'); use(entry.asset); key = entry.name;
      } else {
        exactKeys(entry, ['key', 'asset'], [], group + ' binding');
        assert.ok((group === 'ui' ? itemKeys : toolKeys).has(entry.key), 'Unknown item or tool binding.');
        use(entry.asset); key = entry.key;
      }
      assert.equal(seen.has(key), false, 'Duplicate ' + group + ' binding.');
      seen.add(key);
    }
  }
  assert.equal(used.size, assets.size, 'Unbound runtime raster asset.');
  return Object.freeze({ manifest, files, directories, assets, images, expectedSha256 });
}

export function compileAlienIsolationSourceAssetsManifest(bytes, expectedSha256 = ALIEN_ISOLATION_SOURCE_ASSETS_MANIFEST_SHA256) {
  const manifest = checkedManifest(bytes, expectedSha256, 'Alien Isolation source assets');
  exactKeys(manifest, ['schema', 'module', 'files']);
  assert.equal(manifest.schema, 1);
  assert.equal(manifest.module, 'alien-isolation');
  assert.ok(Array.isArray(manifest.files), 'Source assets must be an array.');
  const files = new Map(), directories = new Set([ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT]);
  for (const record of manifest.files) {
    exactKeys(record, ['path', 'bytes', 'sha256', 'width', 'height', 'generated', 'status', 'runtimeIntegrated', 'exact'], [], 'source asset');
    assert.match(record.path, /^candidates\/[a-z0-9][a-z0-9-]*\.png$/, 'Unsafe source candidate path.');
    checkedRecord(record, 'source asset'); checkedDimensions(record);
    assert.equal(record.generated, true); assert.equal(record.status, 'candidate');
    assert.equal(record.runtimeIntegrated, false); assert.equal(record.exact, false);
    const path = ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT + '/' + record.path;
    assert.equal(files.has(path), false, 'Duplicate source candidate.');
    files.set(path, Object.freeze({ ...record, path })); addParents(directories, path);
  }
  return Object.freeze({ manifest, files, directories, expectedSha256 });
}

let reviewedRuntime, reviewedSourceAssets;
export function reviewedAlienIsolationRuntime() {
  if (!reviewedRuntime) reviewedRuntime = compileAlienIsolationRuntimeManifest(
    readFileSync(new URL('../' + ALIEN_ISOLATION_RUNTIME_MANIFEST, import.meta.url)));
  return reviewedRuntime;
}
export function alienIsolationRuntimeFiles() { return [...reviewedAlienIsolationRuntime().files.keys()]; }
export function reviewedAlienIsolationSourceAssets() {
  if (!reviewedSourceAssets) reviewedSourceAssets = compileAlienIsolationSourceAssetsManifest(
    readFileSync(new URL('../' + ALIEN_ISOLATION_SOURCE_ASSETS_MANIFEST, import.meta.url)));
  return reviewedSourceAssets;
}

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
  if (path.startsWith(ALIEN_ISOLATION_RUNTIME_ROOT + '/')) {
    const inventory = reviewedAlienIsolationRuntime();
    return directory ? inventory.directories.has(path) : inventory.files.has(path);
  }
  if (path === ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT || path.startsWith(ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT + '/')) {
    if (built) return false;
    const inventory = reviewedAlienIsolationSourceAssets();
    return directory ? inventory.directories.has(path) : inventory.files.has(path);
  }
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


async function verifyBytes(base, path, expected) {
  const stat = await lstat(join(base, path));
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'Invalid Alien Isolation file: ' + path);
  const bytes = await readFile(join(base, path));
  assert.equal(bytes.length, expected.bytes, 'Changed Alien Isolation file size: ' + path);
  assert.equal(digest(bytes), expected.sha256, 'Changed Alien Isolation file bytes: ' + path);
  return bytes;
}
async function closedTree(base, directory, files, directories) {
  await assertDirectory(join(base, directory));
  const seen = new Set();
  async function walk(path) {
    for (const entry of await readdir(join(base, path), { withFileTypes: true })) {
      const child = path + '/' + entry.name;
      assert.equal(entry.isSymbolicLink(), false, 'Alien Isolation symlink is not allowed: ' + child);
      if (entry.isDirectory()) {
        assert.ok(directories.has(child), 'Unapproved Alien Isolation directory: ' + child);
        await walk(child);
      } else {
        assert.ok(entry.isFile() && files.has(child), 'Unapproved Alien Isolation member: ' + child);
        seen.add(child);
      }
    }
  }
  await walk(directory);
  for (const path of files.keys()) assert.ok(seen.has(path), 'Missing Alien Isolation member: ' + path);
}
function verifyPng(bytes, expected, requireAlpha = false) {
  assert.ok(bytes.length >= 33 && bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'Invalid PNG signature.');
  assert.equal(bytes.readUInt32BE(8), 13, 'Invalid PNG header size.');
  assert.equal(bytes.toString('ascii', 12, 16), 'IHDR', 'Missing PNG header.');
  assert.equal(bytes.readUInt32BE(16), expected.width, 'PNG width differs from manifest.');
  assert.equal(bytes.readUInt32BE(20), expected.height, 'PNG height differs from manifest.');
  const colorType = bytes[25];
  let alpha = colorType === 4 || colorType === 6, endSeen = false;
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const size = bytes.readUInt32BE(offset), end = offset + 12 + size;
    assert.ok(end <= bytes.length, 'Truncated PNG chunk.');
    const kind = bytes.toString('ascii', offset + 4, offset + 8);
    if (kind === 'tRNS') alpha = true;
    if (kind === 'IEND') { assert.equal(end, bytes.length, 'Trailing PNG bytes.'); endSeen = true; break; }
    offset = end;
  }
  assert.ok(endSeen, 'Missing PNG end.');
  if (requireAlpha) assert.ok(alpha, 'PNG lacks a transparency channel.');
}
function checkBindingsAgainstContent(manifest, content) {
  const props = new Map(content.rooms.flatMap(room => room.props.map(prop => [prop.id, prop.kind])));
  const kinds = new Set(props.values()), names = new Set(content.characters.map(character => character.name));
  for (const entry of manifest.bindings.props || []) {
    assert.ok(kinds.has(entry.kind), 'Binding has an unknown source prop kind.');
    for (const id of entry.propIds || []) assert.equal(props.get(id), entry.kind, 'Binding prop ID has the wrong kind: ' + id);
  }
  for (const entry of manifest.bindings.portraits || [])
    assert.ok(names.has(entry.name), 'Portrait does not match a source character: ' + entry.name);
}
export async function verifyAlienIsolationRuntime(root) {
  const base = resolve(root);
  for (const path of ['dlc', ALIEN_ISOLATION_RUNTIME_ROOT, ALIEN_ISOLATION_RUNTIME_ROOT + '/fidelity'])
    await assertDirectory(join(base, path));
  const manifestBytes = await readFile(join(base, ALIEN_ISOLATION_RUNTIME_MANIFEST));
  const inventory = compileAlienIsolationRuntimeManifest(manifestBytes);
  await closedTree(base, ALIEN_ISOLATION_RUNTIME_ROOT, inventory.files, inventory.directories);
  let totalBytes = 0, content;
  for (const [path, expected] of inventory.files) {
    const bytes = await verifyBytes(base, path, expected);
    totalBytes += bytes.length;
    if (expected.kind === 'image') {
      const asset = [...inventory.assets.values()].find(item => item.path === path);
      verifyPng(bytes, expected, asset.requireAlpha);
    } else if (expected.kind === 'game') {
      const html = bytes.toString('utf8');
      assert.equal(html.split(RASTER_INJECTION.trim()).length, 2, 'Runtime must load the raster adapter exactly once.');
      content = gameContent(html);
      assert.equal(content.spatialRevision?.reference, undefined, 'Documentary reference must stay in immutable sources.');
    } else if (expected.kind === 'launcher') {
      assert.match(bytes.toString('utf8'), /<iframe\b[^>]*\bsrc=["'](?:\.\/)?game\.html["']/i, 'Launcher must load the admitted local game.');
    }
  }
  checkBindingsAgainstContent(inventory.manifest, content);
  assert.equal(digest(await readFile(join(base, ALIEN_ISOLATION_RUNTIME_MANIFEST))), inventory.expectedSha256, 'Runtime inventory changed during verification.');
  return { runtimeFiles: inventory.files.size, runtimeBytes: totalBytes, runtimeImages: inventory.images.size,
    runtimeManifestSha256: inventory.expectedSha256,
    gameSha256: inventory.files.get(ALIEN_ISOLATION_RUNTIME_ROOT + '/game.html').sha256 };
}
export async function verifyAlienIsolationSourceAssets(root) {
  const base = resolve(root), manifestPath = join(base, ALIEN_ISOLATION_SOURCE_ASSETS_MANIFEST);
  for (const path of ['docs', 'docs/development', ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT])
    await assertDirectory(join(base, path));
  const stat = await lstat(manifestPath);
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), 'Invalid source asset manifest.');
  const inventory = compileAlienIsolationSourceAssetsManifest(await readFile(manifestPath));
  const files = new Map(inventory.files), directories = new Set(inventory.directories);
  for (const path of ALIEN_ISOLATION_SOURCE_ONLY_FILES.filter(path => path.startsWith(ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT + '/')))
    files.set(path, null);
  await closedTree(base, ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT, files, directories);
  let candidateBytes = 0;
  for (const [path, expected] of inventory.files) {
    const bytes = await verifyBytes(base, path, expected); verifyPng(bytes, expected);
    candidateBytes += bytes.length;
  }
  assert.equal(digest(await readFile(manifestPath)), inventory.expectedSha256, 'Source inventory changed during verification.');
  return { candidateImages: inventory.files.size, candidateBytes, sourceAssetsManifestSha256: inventory.expectedSha256 };
}

/** Validate all recovered files, including omissions, additions and symlinks.
 * Built validation independently rejects source corpus leakage. */
export async function verifyAlienIsolationDlcAdmissions(root, {
  built = false, expectedSha256 = ALIEN_ISOLATION_RECOVERY_MANIFEST_SHA256,
} = {}) {
  const base = resolve(root);
  if (built) {
    assert.ok(await absent(join(base, ALIEN_ISOLATION_MODULE_ROOT)), 'Alien Isolation recovered sources must not be present in a built distribution.');
    assert.ok(await absent(join(base, ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT)), 'Alien Isolation source candidates must not be present in a built distribution.');
    for (const path of ALIEN_ISOLATION_SOURCE_ONLY_FILES)
      assert.ok(await absent(join(base, path)), 'Alien Isolation source-only file must not be present in a built distribution: ' + path);
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
  const originalGame = await readFile(join(base, ALIEN_ISOLATION_RECOVERY_ROOT, 'JOUER_ISOLATION.html'));
  const runtimeGame = await readFile(join(base, ALIEN_ISOLATION_RUNTIME_ROOT, 'game.html'));
  assert.deepEqual(runtimeGame, deriveAlienIsolationRuntime(originalGame), 'Runtime game differs from the exact reviewed derivation.');
  return { ok: true, built: false, recoveredFiles: seen.size, recoveredBytes, manifestSha256: expectedSha256,
    ...await verifyAlienIsolationRuntime(base), ...await verifyAlienIsolationSourceAssets(base) };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await verifyAlienIsolationDlcAdmissions(process.cwd(), { built: process.argv.includes('--built') }), null, 2));
}
