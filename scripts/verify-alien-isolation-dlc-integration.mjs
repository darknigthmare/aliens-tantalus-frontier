import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import {
  ALIEN_ISOLATION_ARCHIVE_SHA256, ALIEN_ISOLATION_RECOVERY_ROOT, ALIEN_ISOLATION_RECOVERY_MANIFEST,
  ALIEN_ISOLATION_RECOVERY_MANIFEST_SHA256, ALIEN_ISOLATION_RUNTIME_ROOT,
  ALIEN_ISOLATION_RUNTIME_MANIFEST, ALIEN_ISOLATION_RUNTIME_MANIFEST_SHA256,
  ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT, ALIEN_ISOLATION_SOURCE_ASSETS_MANIFEST,
  ALIEN_ISOLATION_SOURCE_ASSETS_MANIFEST_SHA256,
  ALIEN_ISOLATION_SOURCE_ONLY_FILES, compileAlienIsolationRecoveryManifest,
  compileAlienIsolationRuntimeManifest, compileAlienIsolationSourceAssetsManifest,
  reviewedAlienIsolationRuntime, reviewedAlienIsolationSourceAssets, alienIsolationRuntimeFiles,
  deriveAlienIsolationRuntime, verifyAlienIsolationSourceAssets,
  publicAlienIsolationDlcPathAdmission, reviewedAlienIsolationRecovery,
  verifyAlienIsolationDlcAdmissions, verifyAlienIsolationRuntime,
} from './public-alien-isolation-dlc-admissions.mjs';
import { buildAlienIsolationDlc } from './build-alien-isolation-dlc.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { expeditionById } from '../src/dlc-menu.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encoded = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const original = Buffer.from('Historical source.\r\n');
const originalGame = readFileSync(join(root, ALIEN_ISOLATION_RECOVERY_ROOT, 'JOUER_ISOLATION.html'));
const runtimeManifest = () => JSON.parse(readFileSync(join(root, ALIEN_ISOLATION_RUNTIME_MANIFEST), 'utf8'));
const sourceAssetsManifest = () => JSON.parse(readFileSync(join(root, ALIEN_ISOLATION_SOURCE_ASSETS_MANIFEST), 'utf8'));
const compileRuntime = value => { const bytes = encoded(value); return compileAlienIsolationRuntimeManifest(bytes, hash(bytes)); };
const compileCandidates = value => { const bytes = encoded(value); return compileAlienIsolationSourceAssetsManifest(bytes, hash(bytes)); };
const fixtureManifest = () => ({ schema: 1, module: 'alien-isolation', version: '0.8.0',
  sourceArchive: { sha256: ALIEN_ISOLATION_ARCHIVE_SHA256 }, fileCount: 2, uncompressedBytes: original.length + originalGame.length,
  files: [{ path: 'source.txt', bytes: original.length, sha256: hash(original) },
    { path: 'JOUER_ISOLATION.html', bytes: originalGame.length, sha256: hash(originalGame) }] });
async function temp(t) {
  const directory = await mkdtemp(join(tmpdir(), 'isolation-distribution-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}
async function fixture(t) {
  const directory = await temp(t), manifest = encoded(fixtureManifest());
  await mkdir(join(directory, ALIEN_ISOLATION_RECOVERY_ROOT), { recursive: true });
  await writeFile(join(directory, ALIEN_ISOLATION_RECOVERY_MANIFEST), manifest);
  await writeFile(join(directory, ALIEN_ISOLATION_RECOVERY_ROOT, 'source.txt'), original);
  await writeFile(join(directory, ALIEN_ISOLATION_RECOVERY_ROOT, 'JOUER_ISOLATION.html'), originalGame);
  await cp(join(root, ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT), join(directory, ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT), { recursive: true });
  await cp(join(root, ALIEN_ISOLATION_RUNTIME_ROOT), join(directory, ALIEN_ISOLATION_RUNTIME_ROOT), { recursive: true });
  return { directory, expectedSha256: hash(manifest) };
}

test('all 646 recovered files are exact and the raster runtime is the reviewed derivation', async () => {
  const result = await verifyAlienIsolationDlcAdmissions(root);
  assert.equal(result.recoveredFiles, 646);
  assert.equal(result.recoveredBytes, 107266357);
  assert.equal(result.runtimeFiles, 32);
  assert.equal(result.runtimeImages, 28);
  assert.equal(result.candidateImages, 11);
  assert.equal(result.runtimeManifestSha256, ALIEN_ISOLATION_RUNTIME_MANIFEST_SHA256);
  assert.equal(result.manifestSha256, ALIEN_ISOLATION_RECOVERY_MANIFEST_SHA256);
  assert.deepEqual(await readFile(join(root, 'dlc/alien-isolation/game.html')),
    deriveAlienIsolationRuntime(originalGame));
  assert.match(originalGame.toString('utf8'), /survivorincognito\.co\.uk\/home\/the-map-hub\//);
  assert.equal((await readFile(join(root, 'dlc/alien-isolation/game.html'), 'utf8')).includes('survivorincognito.co.uk/home/'), false);
});

test('the existing Extensions launcher resolves Isolation without changing its save namespace', () => {
  assert.equal(expeditionById('alien-isolation').href, '/dlc/alien-isolation/index.html');
  assert.equal(expeditionById('alien-isolation').version, '0.8.0');
  assert.equal(expeditionById('avp-2004').href, '/src/dlc/avp-2004/index.html');
  const content = JSON.parse(readFileSync(join(root, ALIEN_ISOLATION_RECOVERY_ROOT, 'src/content.json')));
  assert.equal(content.meta.saveKey, 'tantalus.dlc.alien-isolation.v1');
  const launcher = readFileSync(join(root, ALIEN_ISOLATION_RUNTIME_ROOT, 'index.html'), 'utf8');
  assert.match(launcher, /id="isolation-game" src="\.\/game\.html"/);
  assert.match(launcher, /id="return-tantalus" href="\.\.\/\.\.\/"/);
  assert.doesNotMatch(launcher, /localStorage|sessionStorage|atf-v47-profile/);
});

test('recovered sources and reports are admitted precisely and excluded from public output', () => {
  const inventory = reviewedAlienIsolationRecovery();
  for (const path of inventory.files.keys()) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    assert.equal(isPublicDistributionPathV86(path, { directory: true }), false, path);
  }
  for (const path of ALIEN_ISOLATION_SOURCE_ONLY_FILES) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  for (const path of alienIsolationRuntimeFiles()) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true, path);
    assert.equal(isPublicDistributionPathV86(path, { directory: true }), false, path);
  }
  for (const path of ['modules/alien-isolation/private.txt', 'dlc/alien-isolation/qa.json',
    'dlc/alien-isolation/index.html/child', 'modules/alien-isolation/v0.8/../private.txt']) {
    for (const built of [false, true]) assert.equal(isPublicDistributionPathV86(path, { built }), false, path);
  }
  for (const path of reviewedAlienIsolationSourceAssets().files.keys()) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
  assert.equal(publicAlienIsolationDlcPathAdmission('src/app.js'), null);
});

test('an edited inventory cannot grant itself new source bytes', () => {
  const originalManifest = encoded(fixtureManifest()), changed = fixtureManifest();
  changed.files[0].sha256 = 'f'.repeat(64);
  assert.throws(() => compileAlienIsolationRecoveryManifest(encoded(changed), hash(originalManifest)), /Unreviewed/);
});

test('unsafe paths, duplicates, wrong totals and file-directory collisions are rejected', () => {
  for (const path of ['../escape', '/absolute', 'dot/./file', 'empty//file', 'back\\slash', 'null\0byte']) {
    const value = fixtureManifest(); value.files[0].path = path;
    const bytes = encoded(value);
    assert.throws(() => compileAlienIsolationRecoveryManifest(bytes, hash(bytes)), /Unsafe/);
  }
  for (const mutate of [
    value => value.files.push({ ...value.files[0] }),
    value => { value.uncompressedBytes++; },
    value => { value.files.push({ ...value.files[0], path: 'source.txt/child' }); value.fileCount++; value.uncompressedBytes *= 2; },
  ]) {
    const value = fixtureManifest(); mutate(value); const bytes = encoded(value);
    assert.throws(() => compileAlienIsolationRecoveryManifest(bytes, hash(bytes)));
  }
});

test('a changed, missing or additional recovered file fails integrity verification', async t => {
  for (const mutation of ['change', 'remove', 'extra']) {
    const { directory, expectedSha256 } = await fixture(t);
    const member = join(directory, ALIEN_ISOLATION_RECOVERY_ROOT, 'source.txt');
    if (mutation === 'change') await writeFile(member, 'Altered source.');
    if (mutation === 'remove') await rm(member);
    if (mutation === 'extra') await writeFile(join(directory, ALIEN_ISOLATION_RECOVERY_ROOT, 'extra.txt'), 'Unlisted');
    await assert.rejects(verifyAlienIsolationDlcAdmissions(directory, { expectedSha256 }));
  }
});

test('symlinked recovered files and additional runtime files are refused', async t => {
  const { directory, expectedSha256 } = await fixture(t);
  const member = join(directory, ALIEN_ISOLATION_RECOVERY_ROOT, 'source.txt');
  await rm(member); await symlink(join(root, 'package.json'), member);
  await assert.rejects(verifyAlienIsolationDlcAdmissions(directory, { expectedSha256 }), /symlink/);
  await writeFile(join(directory, ALIEN_ISOLATION_RUNTIME_ROOT, 'unexpected.html'), 'Unlisted');
  await assert.rejects(verifyAlienIsolationRuntime(directory), /Unapproved/);
});

test('the actual build exports all 32 pinned runtime members and no recovered corpus', async t => {
  const directory = await temp(t);
  const result = await buildAlienIsolationDlc(root, directory);
  assert.equal(result.built, true);
  assert.equal(result.recoveredFiles, 0);
  assert.deepEqual(await readdir(directory), ['dlc']);
  assert.equal(result.runtimeFiles, 32);
  assert.deepEqual((await readdir(join(directory, ALIEN_ISOLATION_RUNTIME_ROOT))).sort(), ['fidelity', 'game.html', 'index.html']);
  for (const path of alienIsolationRuntimeFiles()) assert.deepEqual(await readFile(join(directory, path)), await readFile(join(root, path)), path);
  await mkdir(join(directory, 'modules/alien-isolation'), { recursive: true });
  await assert.rejects(verifyAlienIsolationDlcAdmissions(directory, { built: true }), /must not be present/);
});

test('a symlink at the output DLC directory is rejected before copying', async t => {
  const directory = await temp(t), other = await temp(t);
  await mkdir(join(directory, 'dlc'));
  await symlink(other, join(directory, ALIEN_ISOLATION_RUNTIME_ROOT));
  await assert.rejects(buildAlienIsolationDlc(root, directory), /Invalid DLC build directory/);
  assert.deepEqual(await readdir(other), []);
});

test('the host build and release verifier require Isolation explicitly', () => {
  const build = readFileSync(join(root, 'scripts/build.mjs'), 'utf8');
  const verify = readFileSync(join(root, 'scripts/verify-public-release-v86.mjs'), 'utf8');
  assert.match(build, /await buildAlienIsolationDlc\(root, output\)/);
  assert.match(verify, /await verifyAlienIsolationDlcAdmissions\(root, \{ built \}\)/);
});


test('the runtime inventory cannot change its external digest pin', () => {
  const bytes = readFileSync(join(root, ALIEN_ISOLATION_RUNTIME_MANIFEST));
  assert.equal(hash(bytes), ALIEN_ISOLATION_RUNTIME_MANIFEST_SHA256);
  const changed = runtimeManifest(); changed.files[0].sha256 = 'f'.repeat(64);
  assert.throws(() => compileAlienIsolationRuntimeManifest(encoded(changed)), /Unreviewed/);
  const inventory = reviewedAlienIsolationRuntime();
  assert.equal(inventory.files.size, 32); assert.equal(inventory.images.size, 28);
});

test('runtime paths, duplicates, unlisted fields and invented item slots are refused', () => {
  const mutations = [
    value => { value.files[0].path = '../escape.html'; },
    value => { value.files[0].path = 'fidelity/manifest.json'; },
    value => value.files.push({ ...value.files[0] }),
    value => value.assets.push({ ...value.assets[0] }),
    value => { value.assets[0].src = './assets/../escape.png'; },
    value => { value.assets[0].privatePath = 'unexpected'; },
    value => { value.bindings.ui[0].key = 'revolver'; },
    value => { value.bindings.tools[0].key = 'shotgun'; },
    value => { value.files[0].bytes = -1; },
  ];
  for (const mutate of mutations) {
    const value = runtimeManifest(); mutate(value); assert.throws(() => compileRuntime(value));
  }
});

test('animation frames require real distinct files, matching facing and valid pose counts', () => {
  const mutations = [
    (value, walk) => { walk.frames = [walk.frames[0]]; },
    (value, walk) => { walk.frames = [walk.frames[0], walk.frames[0]]; },
    (value, walk) => { walk.frames = [...walk.frames, walk.frames[0]]; },
    (value, walk) => { walk.frames[1] = 'unreviewed-frame'; },
    (value, walk) => { value.assets.find(asset => asset.id === walk.frames[0]).facing = 'up'; },
    (value, walk) => {
      const assets = walk.frames.map(id => value.assets.find(asset => asset.id === id));
      const records = assets.map(asset => value.files.find(file => file.path === 'fidelity/' + asset.src.slice(2)));
      records[1].sha256 = records[0].sha256;
    },
  ];
  for (const mutate of mutations) {
    const value = runtimeManifest(), walk = value.bindings.characters.find(binding => binding.pose === 'walk');
    assert.ok(walk); mutate(value, walk); assert.throws(() => compileRuntime(value));
  }
});

test('source terminal IDs and portraits are scoped to actual existing content', () => {
  const inventory = compileRuntime(runtimeManifest());
  const content = JSON.parse(readFileSync(join(root, ALIEN_ISOLATION_RECOVERY_ROOT, 'src/content.json')));
  const props = new Map(content.rooms.flatMap(room => room.props.map(prop => [prop.id, prop.kind])));
  const scoped = inventory.manifest.bindings.props.flatMap(binding => binding.propIds || []);
  for (const id of ['c_server.optional', 'g_observation.v03.11', 'sc_station.v08.p09', 'sc_station.v08.task']) assert.ok(scoped.includes(id), id);
  for (const binding of inventory.manifest.bindings.props)
    for (const id of binding.propIds || []) assert.equal(props.get(id), binding.kind, id);
  for (const binding of inventory.manifest.bindings.portraits)
    assert.ok(content.characters.some(character => character.name === binding.name), binding.name);
});

test('candidate PNG inventory is pinned and cannot declare a runtime or exact asset', () => {
  const original = readFileSync(join(root, ALIEN_ISOLATION_SOURCE_ASSETS_MANIFEST));
  assert.equal(hash(original), ALIEN_ISOLATION_SOURCE_ASSETS_MANIFEST_SHA256);
  const changed = sourceAssetsManifest(); changed.files[0].sha256 = 'f'.repeat(64);
  assert.throws(() => compileAlienIsolationSourceAssetsManifest(encoded(changed)), /Unreviewed/);
  for (const mutate of [
    value => { value.files[0].path = '../escape.png'; },
    value => { value.files[0].runtimeIntegrated = true; },
    value => { value.files[0].exact = true; },
    value => { value.files[0].generated = false; },
    value => value.files.push({ ...value.files[0] }),
  ]) {
    const value = sourceAssetsManifest(); mutate(value); assert.throws(() => compileCandidates(value));
  }
  assert.equal(reviewedAlienIsolationSourceAssets().files.size, 11);
});

test('runtime PNG alteration, omission and symlinks fail even when the manifest stays unchanged', async t => {
  const directory = await temp(t);
  await cp(join(root, ALIEN_ISOLATION_RUNTIME_ROOT), join(directory, ALIEN_ISOLATION_RUNTIME_ROOT), { recursive: true });
  await verifyAlienIsolationRuntime(directory);
  const path = [...reviewedAlienIsolationRuntime().images.keys()][0], destination = join(directory, path);
  const original = await readFile(destination), altered = Buffer.from(original);
  altered[altered.length - 1] ^= 1; await writeFile(destination, altered);
  await assert.rejects(verifyAlienIsolationRuntime(directory), /Changed/);
  await rm(destination); await assert.rejects(verifyAlienIsolationRuntime(directory), /Missing/);
  await symlink(join(root, path), destination);
  await assert.rejects(verifyAlienIsolationRuntime(directory), /symlink/);
});

test('source candidates reject additions and changes; every source-only member stays out of built output', async t => {
  const directory = await temp(t);
  await cp(join(root, ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT), join(directory, ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT), { recursive: true });
  assert.equal((await verifyAlienIsolationSourceAssets(directory)).candidateImages, 11);
  const unexpected = join(directory, ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT, 'candidates/unreviewed.png');
  await writeFile(unexpected, 'Unlisted');
  await assert.rejects(verifyAlienIsolationSourceAssets(directory), /Unapproved/);
  await rm(unexpected);
  const path = [...reviewedAlienIsolationSourceAssets().files.keys()][0];
  await writeFile(join(directory, path), 'Changed');
  await assert.rejects(verifyAlienIsolationSourceAssets(directory), /Changed/);
  const built = await temp(t);
  await cp(join(root, ALIEN_ISOLATION_RUNTIME_ROOT), join(built, ALIEN_ISOLATION_RUNTIME_ROOT), { recursive: true });
  await mkdir(join(built, ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT), { recursive: true });
  await assert.rejects(verifyAlienIsolationDlcAdmissions(built, { built: true }), /must not be present/);
  await rm(join(built, ALIEN_ISOLATION_FIDELITY_SOURCE_ROOT), { recursive: true });
  await mkdir(join(built, 'scripts'), { recursive: true });
  await writeFile(join(built, 'scripts/qa-alien-isolation-fidelity.py'), 'source');
  await assert.rejects(verifyAlienIsolationDlcAdmissions(built, { built: true }), /source-only file/);
});

test('nested raster output links are refused before any destination file is copied', async t => {
  const directory = await temp(t), other = await temp(t);
  await mkdir(join(directory, ALIEN_ISOLATION_RUNTIME_ROOT), { recursive: true });
  await symlink(other, join(directory, ALIEN_ISOLATION_RUNTIME_ROOT, 'fidelity'));
  await assert.rejects(buildAlienIsolationDlc(root, directory), /Invalid DLC build directory/);
  assert.deepEqual(await readdir(other), []);
  assert.deepEqual(await readdir(join(directory, ALIEN_ISOLATION_RUNTIME_ROOT)), ['fidelity']);
});
