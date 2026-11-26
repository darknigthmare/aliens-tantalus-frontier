import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import {
  MER_DLC_ROOT_20261125 as dlcRoot, MER_ARCHIVE_ROOT_20261125 as archiveRoot,
  MER_DLC_MANIFEST_20261125 as dlcManifestPath, MER_ARCHIVE_MANIFEST_20261125 as archiveManifestPath,
  MER_RUNTIME_PATHS_20261125 as runtimePaths, MER_PUBLIC_DIRECTORIES_20261125,
  MER_SOURCE_PATHS_20261125, compileMerDesChagrinsManifest20261125,
  merDesChagrinsPathAdmission20261125, copyMerDesChagrinsRuntime20261125,
  verifyMerDesChagrinsImport20261125, verifyMerDesChagrinsBuilt20261125,
  verifyMerHistoricalArtifacts20261125,
} from './mer-des-chagrins-admission-20261125.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { createBuildAssetFilter } from './build-asset-filter.mjs';
import { ALIENS1986_RUNTIME_ROOT, ALIENS1986_RUNTIME_FILES } from './public-aliens1986-dlc-admissions.mjs';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encode = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const entry = (path, bytes) => ({ path, sizeBytes: bytes.length, sha256: hash(bytes) });
const archiveParts = [archiveRoot + '/parts/original.zip.001', archiveRoot + '/parts/original.zip.002'];
const partBytes = [Buffer.from('Original archive first half\r\n'), Buffer.from('Original archive second half\r\n')];

/** Explicit tiny filesystem fixtures exercise publication policy, not gameplay. */
async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'mer-import-test-'));
  const output = await mkdtemp(join(tmpdir(), 'mer-built-test-'));
  t.after(() => Promise.all([rm(root, { recursive: true, force: true }), rm(output, { recursive: true, force: true })]));
  const contents = new Map(runtimePaths.map(path => [path, Buffer.from('Reviewed fixture for ' + path + '\n')]));
  const notes = dlcRoot + '/docs/HISTORICAL_REPORT.md';
  contents.set(notes, Buffer.from('Historical fixture; excluded from the player distribution.\r\n'));
  for (let index = 0; index < archiveParts.length; index++) contents.set(archiveParts[index], partBytes[index]);
  const catalogBytes = Buffer.from('<!doctype html><a href="sea-of-sorrows/">La Mer des Chagrins</a>\n');
  const catalog = entry('dlc/index.html', catalogBytes);
  contents.set(catalog.path, catalogBytes);
  const dlcManifest = {
    schemaVersion: 1, root: dlcRoot, upstreamArchiveSha256: hash(Buffer.concat(partBytes)),
    files: [...contents].filter(([path]) => path.startsWith(dlcRoot + '/')).map(([path, bytes]) => entry(path, bytes)),
  };
  const archiveManifest = {
    schemaVersion: 1, root: archiveRoot,
    files: archiveParts.map((path, index) => entry(path, partBytes[index])),
    artifacts: [{ originalName: 'original.zip', sizeBytes: Buffer.concat(partBytes).length,
      sha256: hash(Buffer.concat(partBytes)), parts: [...archiveParts] }],
  };
  contents.set(dlcManifestPath, encode(dlcManifest)); contents.set(archiveManifestPath, encode(archiveManifest));
  for (const [path, bytes] of contents) {
    await mkdir(dirname(join(root, path)), { recursive: true }); await writeFile(join(root, path), bytes);
  }
  const compile = (manifest, kind) => compileMerDesChagrinsManifest20261125(encode(manifest), { kind, expectedSha256: hash(encode(manifest)) });
  const dlcInventory = compile(dlcManifest, 'dlc'); const archiveInventory = compile(archiveManifest, 'archives');
  return { root, output, contents, notes, catalog, dlcManifest, archiveManifest, dlcInventory, archiveInventory, compile,
    options: { dlcInventory, archiveInventory, catalog } };
}
test('reviewed imports verify every source byte and reconstruct the exact original', async t => {
  const f = await fixture(t);
  const result = await verifyMerDesChagrinsImport20261125(f.root, f.options);
  assert.equal(result.ok, true); assert.equal(result.dlc.files, 13); assert.equal(result.archives.files, 2);
  assert.deepEqual(result.historical, { artifacts: 1, bytes: Buffer.concat(partBytes).length });
  assert.equal(result.runtime.files, 13);
});
test('manifest contents cannot authorize their own changed bytes under a reviewed pin', async t => {
  const f = await fixture(t); const original = encode(f.dlcManifest);
  f.dlcManifest.files[0].sha256 = 'f'.repeat(64);
  assert.throws(() => compileMerDesChagrinsManifest20261125(encode(f.dlcManifest), {
    kind: 'dlc', expectedSha256: hash(original),
  }), /Unreviewed/);
  await writeFile(join(f.root, dlcManifestPath), encode(f.dlcManifest));
  await assert.rejects(verifyMerDesChagrinsImport20261125(f.root, f.options), /manifest differs/);
});
test('unsafe paths, duplicates and file-directory collisions fail compilation', async t => {
  const f = await fixture(t);
  for (const path of ['../escape', '/absolute', dlcRoot + '/../escape', dlcRoot + '//empty',
    dlcRoot + '/./dot', dlcRoot + '\\bad', dlcManifestPath, 'src/override.js']) {
    const manifest = structuredClone(f.dlcManifest); manifest.files[0].path = path;
    assert.throws(() => f.compile(manifest, 'dlc'), /Unsafe/);
  }
  const duplicate = structuredClone(f.dlcManifest); duplicate.files.push({ ...duplicate.files[0] });
  assert.throws(() => f.compile(duplicate, 'dlc'), /Duplicate/);
  const collision = structuredClone(f.dlcManifest); collision.files.push({ ...collision.files[0], path: dlcRoot + '/src' });
  assert.throws(() => f.compile(collision, 'dlc'), /collision/);
});
test('all twelve runtime files and upstream archive provenance are mandatory', async t => {
  const f = await fixture(t);
  for (const path of runtimePaths) {
    const manifest = structuredClone(f.dlcManifest); manifest.files = manifest.files.filter(file => file.path !== path);
    assert.throws(() => f.compile(manifest, 'dlc'), /Missing DLC runtime/);
  }
  const manifest = structuredClone(f.dlcManifest); manifest.upstreamArchiveSha256 = null;
  assert.throws(() => f.compile(manifest, 'dlc'), /upstream/);
  manifest.upstreamArchiveSha256 = 'f'.repeat(64);
  const dlcInventory = f.compile(manifest, 'dlc');
  await assert.rejects(verifyMerDesChagrinsImport20261125(f.root, { ...f.options, dlcInventory }), /upstream archive is missing/);
});
test('reconstruction refuses unknown, repeated, unsafe or incorrectly sized parts', async t => {
  const f = await fixture(t);
  for (const mutate of [
    m => { m.artifacts[0].parts.push('not-reviewed'); },
    m => { m.artifacts[0].parts.push(archiveParts[0]); },
    m => { m.artifacts[0].parts = []; },
    m => { m.artifacts[0].originalName = '../escape.zip'; },
    m => { m.artifacts[0].sizeBytes++; },
  ]) {
    const manifest = structuredClone(f.archiveManifest); mutate(manifest);
    assert.throws(() => f.compile(manifest, 'archives'));
  }
});
test('part order is part of the original artifact identity', async t => {
  const f = await fixture(t); const manifest = structuredClone(f.archiveManifest); manifest.artifacts[0].parts.reverse();
  await assert.rejects(verifyMerHistoricalArtifacts20261125(f.root, f.compile(manifest, 'archives')), /reconstruction mismatch/);
});
test('same-length modifications, truncation and missing source files fail', async t => {
  const f = await fixture(t); const path = join(f.root, runtimePaths[0]); const original = await readFile(path);
  await writeFile(path, Buffer.alloc(original.length, 65));
  await assert.rejects(verifyMerDesChagrinsImport20261125(f.root, f.options), /Changed.*bytes/);
  await writeFile(path, original.subarray(1));
  await assert.rejects(verifyMerDesChagrinsImport20261125(f.root, f.options), /Changed.*size/);
  await rm(path);
  await assert.rejects(verifyMerDesChagrinsImport20261125(f.root, f.options), /Missing/);
});
test('unlisted files and directories cannot enter the imported roots', async t => {
  const f = await fixture(t); const extra = join(f.root, dlcRoot, 'unlisted.txt'); await writeFile(extra, 'Unreviewed');
  await assert.rejects(verifyMerDesChagrinsImport20261125(f.root, f.options), /Unlisted/);
  await rm(extra); await mkdir(join(f.root, archiveRoot, 'unlisted'));
  await assert.rejects(verifyMerDesChagrinsImport20261125(f.root, f.options), /Unlisted/);
});
test('file symlinks and parent directory symlinks are refused', async t => {
  const f = await fixture(t); const path = join(f.root, runtimePaths[0]); await rm(path);
  await symlink(join(f.root, runtimePaths[1]), path);
  await assert.rejects(verifyMerDesChagrinsImport20261125(f.root, f.options), /symlink/);
  await rm(path); await writeFile(path, f.contents.get(runtimePaths[0]));
  const sourceDirectory = join(f.root, dlcRoot, 'src'); await rm(sourceDirectory, { recursive: true });
  await symlink(f.output, sourceDirectory);
  await assert.rejects(verifyMerDesChagrinsImport20261125(f.root, f.options), /symlink/);
});
test('the builder copies exactly thirteen reviewed runtime files', async t => {
  const f = await fixture(t); const result = await copyMerDesChagrinsRuntime20261125(f.root, f.output, f.options);
  assert.equal(result.ok, true); assert.equal(result.files, 13);
  assert.deepEqual((await readdir(join(f.output, dlcRoot))).sort(), ['MER_DES_CHAGRINS_JOUABLE.html', 'index.html', 'src', 'styles.css'].sort());
  for (const path of [...runtimePaths, f.catalog.path]) assert.deepEqual(await readFile(join(f.output, path)), f.contents.get(path));
  await assert.rejects(readFile(join(f.output, f.notes)), /ENOENT/);
  await assert.rejects(readFile(join(f.output, dlcManifestPath)), /ENOENT/);
});
test('runtime build still works with historical QA and archives omitted', async t => {
  const f = await fixture(t); await rm(join(f.root, dlcRoot, 'docs'), { recursive: true });
  await rm(join(f.root, 'archives'), { recursive: true });
  assert.equal((await copyMerDesChagrinsRuntime20261125(f.root, f.output, f.options)).files, 13);
});
test('catalogue and runtime bytes are verified before copy and after build', async t => {
  const f = await fixture(t);
  await writeFile(join(f.root, f.catalog.path), Buffer.alloc(f.catalog.sizeBytes, 65));
  await assert.rejects(copyMerDesChagrinsRuntime20261125(f.root, f.output, f.options), /Changed.*bytes/);
  await writeFile(join(f.root, f.catalog.path), f.contents.get(f.catalog.path));
  await copyMerDesChagrinsRuntime20261125(f.root, f.output, f.options);
  await writeFile(join(f.output, runtimePaths[0]), Buffer.alloc(f.contents.get(runtimePaths[0]).length, 65));
  await assert.rejects(verifyMerDesChagrinsBuilt20261125(f.output, f.options), /Changed.*bytes/);
});
test('build rejects extra HTML, QA, manifests and historical archives', async t => {
  const f = await fixture(t); await copyMerDesChagrinsRuntime20261125(f.root, f.output, f.options);
  for (const path of [dlcRoot + '/unexpected.html', dlcRoot + '/qa', dlcManifestPath]) {
    await writeFile(join(f.output, path), 'Unreviewed distribution content');
    await assert.rejects(verifyMerDesChagrinsBuilt20261125(f.output, f.options), /Unapproved/);
    await rm(join(f.output, path));
  }
  await mkdir(join(f.output, 'archives'));
  await assert.rejects(verifyMerDesChagrinsBuilt20261125(f.output, f.options), /Historical archives/);
});
test('build rejects missing runtime files and symlinks', async t => {
  const f = await fixture(t); await copyMerDesChagrinsRuntime20261125(f.root, f.output, f.options);
  await rm(join(f.output, runtimePaths[0]));
  await assert.rejects(verifyMerDesChagrinsBuilt20261125(f.output, f.options), /inventory differs/);
  await symlink(join(f.root, runtimePaths[0]), join(f.output, runtimePaths[0]));
  await assert.rejects(verifyMerDesChagrinsBuilt20261125(f.output, f.options), /symlink/);
});
test('global release policy and build filter enforce the same narrow boundary', () => {
  const root = process.cwd(); const filter = createBuildAssetFilter(root);
  for (const path of runtimePaths.concat('dlc/index.html')) {
    assert.equal(merDesChagrinsPathAdmission20261125(path, { built: true }), true);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true);
    assert.equal(isPublicDistributionPathV86(path, { built: true, directory: true }), false);
    assert.equal(filter(join(root, path)), true);
  }
  for (const path of MER_PUBLIC_DIRECTORIES_20261125) {
    assert.equal(isPublicDistributionPathV86(path, { built: true, directory: true }), true);
    assert.equal(filter(join(root, path)), true);
  }
  for (const path of [dlcManifestPath, archiveManifestPath, dlcRoot + '/qa/core.test.cjs',
    dlcRoot + '/src/extra.js', 'dlc/unknown/index.html', ...MER_SOURCE_PATHS_20261125]) {
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    assert.equal(filter(join(root, path)), false, path);
  }
  assert.equal(merDesChagrinsPathAdmission20261125('src/app.js'), null);
  assert.equal(merDesChagrinsPathAdmission20261125(dlcRoot + '/../escape', { built: true }), false);
});

async function addRealAliensRuntime(output) {
  await mkdir(join(output, ALIENS1986_RUNTIME_ROOT), { recursive: true });
  for (const path of ALIENS1986_RUNTIME_FILES)
    await writeFile(join(output, path), await readFile(new URL('../' + path, import.meta.url)));
}
test('the independently verified Aliens runtime coexists with the thirteen Mer runtime files', async t => {
  const f = await fixture(t);
  await addRealAliensRuntime(f.output);
  const result = await copyMerDesChagrinsRuntime20261125(f.root, f.output, f.options);
  assert.equal(result.files, 15);
  const filter = createBuildAssetFilter(process.cwd());
  for (const path of ALIENS1986_RUNTIME_FILES) {
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true);
    assert.equal(filter(join(process.cwd(), path)), true);
    assert.equal(isPublicDistributionPathV86(path, { built: true, directory: true }), false);
  }
  assert.equal(filter(join(process.cwd(), ALIENS1986_RUNTIME_ROOT)), true);
  assert.equal(isPublicDistributionPathV86(ALIENS1986_RUNTIME_ROOT + '/unreviewed.html', { built: true }), false);
});
test('Mer coexistence rejects altered Aliens bytes, unknown files and symlinked runtime directories', async t => {
  const f = await fixture(t);
  await copyMerDesChagrinsRuntime20261125(f.root, f.output, f.options);
  await addRealAliensRuntime(f.output);
  const gamePath = join(f.output, ALIENS1986_RUNTIME_ROOT, 'game.html');
  const original = await readFile(gamePath);
  await writeFile(gamePath, Buffer.alloc(original.length, 65));
  await assert.rejects(verifyMerDesChagrinsBuilt20261125(f.output, f.options), /Changed Aliens 1986 runtime bytes/);
  await writeFile(gamePath, original);
  const unknown = join(f.output, ALIENS1986_RUNTIME_ROOT, 'extra.html');
  await writeFile(unknown, 'unreviewed');
  await assert.rejects(verifyMerDesChagrinsBuilt20261125(f.output, f.options), /Unapproved Aliens 1986 runtime member/);
  await rm(unknown);
  await rm(join(f.output, ALIENS1986_RUNTIME_ROOT), { recursive: true });
  await symlink(f.root, join(f.output, ALIENS1986_RUNTIME_ROOT));
  await assert.rejects(verifyMerDesChagrinsBuilt20261125(f.output, f.options), /Invalid Aliens 1986 directory/);
});
