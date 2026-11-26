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
  ALIEN_ISOLATION_RECOVERY_MANIFEST_SHA256, ALIEN_ISOLATION_RUNTIME_ROOT, ALIEN_ISOLATION_RUNTIME_FILES,
  ALIEN_ISOLATION_SOURCE_ONLY_FILES, compileAlienIsolationRecoveryManifest,
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
const fixtureManifest = () => ({ schema: 1, module: 'alien-isolation', version: '0.8.0',
  sourceArchive: { sha256: ALIEN_ISOLATION_ARCHIVE_SHA256 }, fileCount: 1, uncompressedBytes: original.length,
  files: [{ path: 'source.txt', bytes: original.length, sha256: hash(original) }] });
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
  await cp(join(root, ALIEN_ISOLATION_RUNTIME_ROOT), join(directory, ALIEN_ISOLATION_RUNTIME_ROOT), { recursive: true });
  return { directory, expectedSha256: hash(manifest) };
}

test('all 646 recovered files and the public game preserve the exact V0.8 bytes', async () => {
  const result = await verifyAlienIsolationDlcAdmissions(root);
  assert.equal(result.recoveredFiles, 646);
  assert.equal(result.recoveredBytes, 107266357);
  assert.equal(result.runtimeFiles, 2);
  assert.equal(result.manifestSha256, ALIEN_ISOLATION_RECOVERY_MANIFEST_SHA256);
  assert.deepEqual(await readFile(join(root, 'dlc/alien-isolation/game.html')),
    await readFile(join(root, ALIEN_ISOLATION_RECOVERY_ROOT, 'JOUER_ISOLATION.html')));
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
  for (const path of ALIEN_ISOLATION_RUNTIME_FILES) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true, path);
    assert.equal(isPublicDistributionPathV86(path, { directory: true }), false, path);
  }
  for (const path of ['modules/alien-isolation/private.txt', 'dlc/alien-isolation/qa.json',
    'dlc/alien-isolation/index.html/child', 'modules/alien-isolation/v0.8/../private.txt']) {
    for (const built of [false, true]) assert.equal(isPublicDistributionPathV86(path, { built }), false, path);
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

test('the actual build exports only the launcher and game with exact runtime bytes', async t => {
  const directory = await temp(t);
  const result = await buildAlienIsolationDlc(root, directory);
  assert.equal(result.built, true);
  assert.equal(result.recoveredFiles, 0);
  assert.deepEqual(await readdir(directory), ['dlc']);
  assert.deepEqual((await readdir(join(directory, ALIEN_ISOLATION_RUNTIME_ROOT))).sort(), ['game.html', 'index.html']);
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
