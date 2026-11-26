import { TitleScreenController } from '../src/title-screen-v61.js';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  ALIENS1986_ARCHIVE_SHA256, ALIENS1986_RECOVERY_ROOT, ALIENS1986_RECOVERY_MANIFEST,
  ALIENS1986_RECOVERY_MANIFEST_SHA256, ALIENS1986_RUNTIME_ROOT, ALIENS1986_RUNTIME_FILES,
  ALIENS1986_SOURCE_ONLY_FILES, ALIENS1986_SPRITE_SOURCE_ONLY_FILES_V115,
  ALIENS1986_RASTER_SOURCE_ONLY_FILES_V116, ALIENS1986_RASTER_SOURCE_SHA256_V116,
  ALIENS1986_RASTER_SOURCE_ONLY_FILES_V117, ALIENS1986_RASTER_SOURCE_SHA256_V117,
  ALIENS1986_RASTER_BASELINE_V117, ALIENS1986_RASTER_SOURCE_SUCCESSORS_V117,
  ALIENS1986_RASTER_ASSET_ROOT_V117, ALIENS1986_RASTER_ASSET_FILES_V117,
  ALIENS1986_RASTER_ASSET_DIRECTORIES_V117,
  ALIENS1986_RASTER_SOURCE_ONLY_FILES_V118, ALIENS1986_RASTER_SOURCE_SHA256_V118,
  ALIENS1986_RASTER_BASELINE_V118, ALIENS1986_RASTER_SOURCE_SUCCESSORS_V118,
  ALIENS1986_RASTER_ASSET_ROOT_V118, ALIENS1986_RASTER_ASSET_FILES_V118,
  ALIENS1986_RASTER_ASSET_DIRECTORIES_V118,
  ALIENS1986_RASTER_SOURCE_ONLY_FILES_V119, ALIENS1986_RASTER_SOURCE_SHA256_V119,
  ALIENS1986_RASTER_BASELINE_V119, ALIENS1986_RASTER_SOURCE_SUCCESSORS_V119,
  ALIENS1986_RASTER_ASSET_ROOT_V119, ALIENS1986_RASTER_ASSET_FILES_V119,
  ALIENS1986_RASTER_ASSET_DIRECTORIES_V119,
  ALIENS1986_RASTER_SOURCE_ONLY_FILES_V120, ALIENS1986_RASTER_SOURCE_SHA256_V120,
  ALIENS1986_RASTER_BASELINE_V120, ALIENS1986_RASTER_SOURCE_SUCCESSORS_V120,
  ALIENS1986_RASTER_ASSET_ROOT_V120, ALIENS1986_RASTER_ASSET_FILES_V120,
  ALIENS1986_RASTER_ASSET_DIRECTORIES_V120,
  ALIENS1986_RASTER_SOURCE_ONLY_FILES_V121, ALIENS1986_RASTER_SOURCE_SHA256_V121,
  ALIENS1986_RASTER_BASELINE_V121, ALIENS1986_RASTER_SOURCE_SUCCESSORS_V121,
  ALIENS1986_RASTER_ASSET_ROOT_V121, ALIENS1986_RASTER_ASSET_FILES_V121,
  ALIENS1986_RASTER_ASSET_DIRECTORIES_V121,
  compileAliens1986RecoveryManifest, publicAliens1986DlcPathAdmission,
  reviewedAliens1986Recovery, verifyAliens1986DlcAdmissions, verifyAliens1986Runtime,
  verifyAliens1986RasterSourcesV116, reviewedAliens1986RasterDigestV117, reviewedAliens1986RasterDigestV118, reviewedAliens1986RasterDigestV119, reviewedAliens1986RasterDigestV120, reviewedAliens1986RasterDigestV121,
} from './public-aliens1986-dlc-admissions.mjs';
import { buildAliens1986Dlc } from './build-aliens1986-dlc.mjs';
import {
  renderAliens1986RasterV116, compileAliens1986RasterSupplementV117,
  MANIFEST_PATH_V116, MANIFEST_SHA256_V116, SUPPLEMENT_PATH_V117, SUPPLEMENT_IDS_V117,
  compileAliens1986RasterSupplementV118, SUPPLEMENT_SHA256_V117, SUPPLEMENT_PATH_V118, SUPPLEMENT_IDS_V118,
  compileAliens1986RasterSupplementV119, SUPPLEMENT_SHA256_V118, SUPPLEMENT_PATH_V119, SUPPLEMENT_IDS_V119,
  compileAliens1986RasterSupplementV120, SUPPLEMENT_SHA256_V119, SUPPLEMENT_PATH_V120, SUPPLEMENT_IDS_V120,
  compileAliens1986RasterSupplementV121, SUPPLEMENT_SHA256_V120, SUPPLEMENT_PATH_V121, SUPPLEMENT_IDS_V121,
} from './derive-aliens1986-raster-v116.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const encoded = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const member = 'source.txt';
const original = Buffer.from('Preserved historical source.\r\n');
const fixtureManifest = () => ({ schema: 1, module: 'aliens-1986', version: '114.0.0-rc.1',
  sourceArchive: { sha256: ALIENS1986_ARCHIVE_SHA256 }, fileCount: 1, uncompressedBytes: original.length,
  files: [{ path: member, bytes: original.length, sha256: hash(original) }] });
async function temp(t) {
  const value = await mkdtemp(join(tmpdir(), 'aliens1986-distribution-'));
  t.after(() => rm(value, { recursive: true, force: true }));
  return value;
}
async function fixture(t) {
  const directory = await temp(t), manifest = encoded(fixtureManifest());
  await mkdir(join(directory, ALIENS1986_RECOVERY_ROOT), { recursive: true });
  await writeFile(join(directory, ALIENS1986_RECOVERY_MANIFEST), manifest);
  await writeFile(join(directory, ALIENS1986_RECOVERY_ROOT, member), original);
  await cp(join(root, ALIENS1986_RUNTIME_ROOT), join(directory, ALIENS1986_RUNTIME_ROOT), { recursive: true });
  return { directory, expectedSha256: hash(manifest) };
}

test('the actual recovered corpus and runtime match all reviewed bytes', async () => {
  const result = await verifyAliens1986DlcAdmissions(root);
  assert.equal(result.recoveredFiles, 1159);
  assert.equal(result.recoveredBytes, 135643835);
  assert.equal(result.runtimeFiles, 2);
  assert.equal(result.manifestSha256, ALIENS1986_RECOVERY_MANIFEST_SHA256);
});

test('every recovered source file and directory is admitted only in source', () => {
  const inventory = reviewedAliens1986Recovery();
  for (const [path] of inventory.files) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
    assert.equal(isPublicDistributionPathV86(path, { directory: true }), false, path);
  }
  for (const path of inventory.directories) {
    assert.equal(isPublicDistributionPathV86(path, { directory: true }), true, path);
    assert.equal(isPublicDistributionPathV86(path, { directory: true, built: true }), false, path);
  }
  for (const path of [...ALIENS1986_SOURCE_ONLY_FILES, ...ALIENS1986_SPRITE_SOURCE_ONLY_FILES_V115, ...ALIENS1986_RASTER_SOURCE_ONLY_FILES_V116, ...ALIENS1986_RASTER_SOURCE_ONLY_FILES_V117, ...ALIENS1986_RASTER_SOURCE_ONLY_FILES_V118, ...ALIENS1986_RASTER_SOURCE_ONLY_FILES_V119, ...ALIENS1986_RASTER_SOURCE_ONLY_FILES_V120, ...ALIENS1986_RASTER_SOURCE_ONLY_FILES_V121]) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), false, path);
  }
});

test('the runtime admits exactly two HTML files without admitting private folders', () => {
  for (const path of ALIENS1986_RUNTIME_FILES) {
    assert.equal(isPublicDistributionPathV86(path), true, path);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true, path);
    assert.equal(isPublicDistributionPathV86(path, { directory: true }), false, path);
  }
  for (const path of [
    'modules/aliens-1986/unlisted.md', ALIENS1986_RECOVERY_ROOT + '/report/private.txt',
    ALIENS1986_RUNTIME_ROOT + '/report/qa.json', ALIENS1986_RUNTIME_ROOT + '/notes.html',
    ALIENS1986_RUNTIME_ROOT + '/index.html/child', 'modules/unknown/private.md',
    'docs/development/ALIENS_1986_GITHUB_INTEGRATION_20261125.private.json',
  ]) for (const built of [false, true]) {
    assert.equal(isPublicDistributionPathV86(path, { built }), false, path);
    assert.equal(isPublicDistributionPathV86(path, { built, directory: true }), false, path);
  }
  assert.equal(publicAliens1986DlcPathAdmission('src/app.js'), null);
});

test('V117 admits exactly seven PNGs and two child directories in source and build', async () => {
  const prefix = 'assets/dlc/aliens-1986/v117';
  assert.equal(ALIENS1986_RASTER_ASSET_ROOT_V117, prefix);
  assert.deepEqual(ALIENS1986_RASTER_ASSET_FILES_V117, [
    prefix + '/architecture/door-leaf-damaged.png',
    prefix + '/architecture/door-leaf-reinforced.png',
    prefix + '/architecture/door-leaf-breached.png',
    prefix + '/props/meal-tray-food.png',
    prefix + '/props/supply-case-medical-empty.png',
    prefix + '/props/supply-case-ammo-closed.png',
    prefix + '/props/supply-case-ammo-empty.png',
  ]);
  assert.deepEqual(ALIENS1986_RASTER_ASSET_DIRECTORIES_V117, [prefix, prefix + '/architecture', prefix + '/props']);
  for (const built of [false, true]) {
    for (const path of ALIENS1986_RASTER_ASSET_FILES_V117) {
      assert.equal(isPublicDistributionPathV86(path, { built }), true, path);
      assert.equal(isPublicDistributionPathV86(path, { built, directory: true }), false, path);
    }
    for (const path of ALIENS1986_RASTER_ASSET_DIRECTORIES_V117) {
      assert.equal(isPublicDistributionPathV86(path, { built, directory: true }), true, path);
      assert.equal(isPublicDistributionPathV86(path, { built }), false, path);
    }
    for (const path of [
      prefix + '/unreviewed.png', prefix + '/props/unreviewed.png', prefix + '/other/extra.webp',
      prefix + '/other', prefix + '/props/nested', prefix + '/props/door-leaf-damaged.png',
      prefix + '/architecture/door-leaf-damaged.webp', prefix + '/architecture/door-leaf-damaged.png/child',
      prefix + '/architecture/DOOR-LEAF-DAMAGED.png', prefix + '//props/meal-tray-food.png',
      prefix + '/props/./meal-tray-food.png', prefix + '/props/../meal-tray-food.png',
    ]) {
      assert.equal(publicAliens1986DlcPathAdmission(path, { built }), false, path);
      assert.equal(isPublicDistributionPathV86(path, { built }), false, path);
      assert.equal(isPublicDistributionPathV86(path, { built, directory: true }), false, path);
    }
    const base = JSON.parse(await readFile(join(root, MANIFEST_PATH_V116), 'utf8'));
    for (const asset of base.assets) assert.equal(isPublicDistributionPathV86(asset.path, { built }), true, asset.path);
  }
});

test('V118 admits only eight props and three available sentry images in source and build', () => {
  const prefix = 'assets/dlc/aliens-1986/v118';
  const expected = [
    'props/engineering-case-stocked.png', 'props/gateway-inquiry-display.png',
    'props/service-control-pedestal.png', 'props/medical-counter-terminal.png',
    'props/optics-calibration-terminal.png', 'props/valve-indicator-panel.png',
    'props/sulaco-briefing-terminal.png', 'props/operations-table-terminal.png',
    'equipment/sentry-aim-front-right.png', 'equipment/sentry-aim-rear-right.png',
    'equipment/sentry-aim-rear.png',
  ].map(path => prefix + '/' + path);
  assert.equal(ALIENS1986_RASTER_ASSET_ROOT_V118, prefix);
  assert.deepEqual(ALIENS1986_RASTER_ASSET_FILES_V118, expected);
  assert.deepEqual(ALIENS1986_RASTER_ASSET_DIRECTORIES_V118, [prefix, prefix + '/props', prefix + '/equipment']);
  for (const built of [false, true]) {
    for (const path of expected) {
      assert.equal(isPublicDistributionPathV86(path, { built }), true, path);
      assert.equal(isPublicDistributionPathV86(path, { built, directory: true }), false, path);
    }
    for (const path of ALIENS1986_RASTER_ASSET_DIRECTORIES_V118) {
      assert.equal(isPublicDistributionPathV86(path, { built, directory: true }), true, path);
      assert.equal(isPublicDistributionPathV86(path, { built }), false, path);
    }
    for (const path of [
      prefix + '/unreviewed.png', prefix + '/props/unreviewed.png', prefix + '/equipment/sentry-aim-front.png',
      prefix + '/props/sentry-aim-rear.png', prefix + '/equipment/gateway-inquiry-display.png',
      prefix + '/props/nested', prefix + '/other', prefix + '/props/gateway-inquiry-display.webp',
      prefix + '/props/GATEWAY-INQUIRY-DISPLAY.png', prefix + '//props/gateway-inquiry-display.png',
      prefix + '/props/./gateway-inquiry-display.png', prefix + '/props/../gateway-inquiry-display.png',
    ]) {
      assert.equal(publicAliens1986DlcPathAdmission(path, { built }), false, path);
      assert.equal(isPublicDistributionPathV86(path, { built }), false, path);
      assert.equal(isPublicDistributionPathV86(path, { built, directory: true }), false, path);
    }
  }
});

test('a modified manifest cannot authorize its own changed bytes', () => {
  const originalManifest = encoded(fixtureManifest());
  const changed = fixtureManifest(); changed.files[0].sha256 = 'f'.repeat(64);
  assert.throws(() => compileAliens1986RecoveryManifest(encoded(changed), hash(originalManifest)), /Unreviewed/);
});

test('unsafe paths, duplicates, directory collisions and wrong totals are rejected', () => {
  for (const path of ['../escape', '/absolute', 'dot/./file', 'empty//file', 'back\\slash', 'null\0byte']) {
    const manifest = fixtureManifest(); manifest.files[0].path = path;
    const bytes = encoded(manifest);
    assert.throws(() => compileAliens1986RecoveryManifest(bytes, hash(bytes)), /Unsafe/);
  }
  const duplicate = fixtureManifest(); duplicate.files.push({ ...duplicate.files[0] });
  const duplicateBytes = encoded(duplicate);
  assert.throws(() => compileAliens1986RecoveryManifest(duplicateBytes, hash(duplicateBytes)), /Duplicate/);
  const collision = fixtureManifest(); collision.files.push({ ...collision.files[0], path: member + '/child' });
  collision.fileCount = 2; collision.uncompressedBytes *= 2;
  const collisionBytes = encoded(collision);
  assert.throws(() => compileAliens1986RecoveryManifest(collisionBytes, hash(collisionBytes)), /collision/);
  for (const field of ['fileCount', 'uncompressedBytes']) {
    const manifest = fixtureManifest(); manifest[field] += 1; const bytes = encoded(manifest);
    assert.throws(() => compileAliens1986RecoveryManifest(bytes, hash(bytes)), /count differs/);
  }
});

test('a changed recovered file is rejected even if its size is unchanged', async t => {
  const { directory, expectedSha256 } = await fixture(t);
  await writeFile(join(directory, ALIENS1986_RECOVERY_ROOT, member), Buffer.alloc(original.length, 120));
  await assert.rejects(verifyAliens1986DlcAdmissions(directory, { expectedSha256 }), /Changed.*bytes/);
});

test('omissions and unlisted files cannot pass the recovery inventory', async t => {
  const { directory, expectedSha256 } = await fixture(t);
  const source = join(directory, ALIENS1986_RECOVERY_ROOT, member);
  await rm(source);
  await assert.rejects(verifyAliens1986DlcAdmissions(directory, { expectedSha256 }), /Missing/);
  await writeFile(source, original);
  await writeFile(join(directory, ALIENS1986_RECOVERY_ROOT, 'unlisted.md'), 'private fixture');
  await assert.rejects(verifyAliens1986DlcAdmissions(directory, { expectedSha256 }), /Unlisted/);
});

test('recovered file and directory symlinks are rejected', async t => {
  const { directory, expectedSha256 } = await fixture(t);
  const source = join(directory, ALIENS1986_RECOVERY_ROOT, member), outside = join(directory, 'outside.txt');
  await writeFile(outside, original); await rm(source); await symlink(outside, source);
  await assert.rejects(verifyAliens1986DlcAdmissions(directory, { expectedSha256 }), /symlink/);
  await rm(source); await writeFile(source, original);
  await symlink(dirname(outside), join(directory, ALIENS1986_RECOVERY_ROOT, 'linked'));
  await assert.rejects(verifyAliens1986DlcAdmissions(directory, { expectedSha256 }), /symlink/);
});

test('changed game bytes and an additional runtime file are rejected', async t => {
  const { directory } = await fixture(t);
  const game = join(directory, ALIENS1986_RUNTIME_ROOT, 'game.html');
  const originalGame = await readFile(game), changedGame = Buffer.from(originalGame);
  changedGame[changedGame.length - 1] ^= 1;
  await writeFile(game, changedGame);
  await assert.rejects(verifyAliens1986Runtime(directory), /Changed.*runtime bytes/);
  await writeFile(game, originalGame);
  await writeFile(join(directory, ALIENS1986_RUNTIME_ROOT, 'private.json'), '{}');
  await assert.rejects(verifyAliens1986Runtime(directory), /Unapproved/);
});

test('a built tree rejects the recovered corpus even when its files are valid', async t => {
  const { directory } = await fixture(t);
  await assert.rejects(verifyAliens1986DlcAdmissions(directory, { built: true }), /must not be present/);
  await rm(join(directory, 'modules'), { recursive: true });
  await assert.rejects(verifyAliens1986DlcAdmissions(directory, { built: true }), /Changed Aliens 1986 runtime/);
});

test('the builder adds V121 while preserving V114 and all 151 earlier records', async t => {
  const output = await temp(t);
  const originalHtml = await readFile(join(root, ALIENS1986_RUNTIME_ROOT, 'game.html'));
  const derivative = await renderAliens1986RasterV116({ root });
  const result = await buildAliens1986Dlc(root, output);
  assert.equal(result.runtimeFiles, 2);
  assert.equal(result.rasterRevision, 116);
  assert.equal(result.rasterAssetRevision, 121);
  assert.equal(result.rasterExtensionRevision, 121);
  assert.equal(result.rasterAssets, 155);
  assert.equal(result.rasterAssets, derivative.assets.length);
  assert.equal(result.gameSha256, derivative.sha256);
  assert.deepEqual((await readdir(output)).sort(), ['assets', 'dlc']);
  assert.deepEqual((await readdir(join(output, ALIENS1986_RUNTIME_ROOT))).sort(), ['game.html', 'index.html']);
  assert.deepEqual(await readFile(join(output, ALIENS1986_RUNTIME_ROOT, 'index.html')),
    await readFile(join(root, ALIENS1986_RUNTIME_ROOT, 'index.html')));
  assert.equal(await readFile(join(output, ALIENS1986_RUNTIME_ROOT, 'game.html'), 'utf8'), derivative.html);
  assert.deepEqual(await readFile(join(root, ALIENS1986_RUNTIME_ROOT, 'game.html')), originalHtml);
  for (const asset of derivative.assets) assert.equal(hash(await readFile(join(output, asset.path))), asset.sha256);
  const baseManifest = JSON.parse(await readFile(join(root, MANIFEST_PATH_V116), 'utf8'));
  assert.deepEqual(derivative.assets.slice(0, 123), baseManifest.assets.map(({ id, path, sha256, bytes }) => ({ id, path, sha256, bytes })));
  const previousManifest = JSON.parse(await readFile(join(root, SUPPLEMENT_PATH_V117), 'utf8'));
  assert.deepEqual(derivative.assets.slice(123, 130), previousManifest.assets.map(({ id, path, sha256, bytes }) => ({ id, path, sha256, bytes })));
  const v118Manifest = JSON.parse(await readFile(join(root, SUPPLEMENT_PATH_V118), 'utf8'));
  const v119Manifest = JSON.parse(await readFile(join(root, SUPPLEMENT_PATH_V119), 'utf8'));
  assert.deepEqual(derivative.assets.slice(130, 141), v118Manifest.assets.map(({ id, path, sha256, bytes }) => ({ id, path, sha256, bytes })));
  assert.deepEqual(derivative.assets.slice(141, 147), v119Manifest.assets.map(({ id, path, sha256, bytes }) => ({ id, path, sha256, bytes })));
  const v120Manifest = JSON.parse(await readFile(join(root, SUPPLEMENT_PATH_V120), 'utf8'));
  assert.deepEqual(derivative.assets.slice(147, 151), v120Manifest.assets.map(({ id, path, sha256, bytes }) => ({ id, path, sha256, bytes })));
  for (const asset of [derivative.assets[0], derivative.assets[123], derivative.assets[130], derivative.assets[141], derivative.assets[147], derivative.assets[151]]) {
    const bytes = await readFile(join(output, asset.path));
    await writeFile(join(output, asset.path), Buffer.from('unreviewed raster change'));
    await assert.rejects(verifyAliens1986Runtime(output, { built: true }), /Changed Aliens 1986 raster bytes/);
    await writeFile(join(output, asset.path), bytes);
  }
  // Direct runtime verification must reject additions even when the global
  // distribution-path check is not called, for source and derived HTML alike.
  for (const built of [true, false]) {
    await writeFile(join(output, ALIENS1986_RUNTIME_ROOT, 'game.html'), built ? derivative.html : originalHtml);
    const extra = join(output, ALIENS1986_RASTER_ASSET_ROOT_V117, 'props/unreviewed.png');
    await cp(join(root, ALIENS1986_RASTER_ASSET_FILES_V117[0]), extra);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Unapproved Aliens 1986 V117 raster member/);
    await rm(extra);
    const extraDirectory = join(output, ALIENS1986_RASTER_ASSET_ROOT_V117, 'other');
    await mkdir(extraDirectory);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Unapproved Aliens 1986 V117 raster member/);
    await rm(extraDirectory, { recursive: true });
    const missing = join(output, ALIENS1986_RASTER_ASSET_FILES_V117[0]);
    await rm(missing);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Missing Aliens 1986 V117 raster member/);
    await cp(join(root, ALIENS1986_RASTER_ASSET_FILES_V117[0]), missing);
    const extraV118 = join(output, ALIENS1986_RASTER_ASSET_ROOT_V118, 'props/unreviewed.png');
    await cp(join(root, ALIENS1986_RASTER_ASSET_FILES_V118[0]), extraV118);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Unapproved Aliens 1986 V118 raster member/);
    await rm(extraV118);
    const directoryV118 = join(output, ALIENS1986_RASTER_ASSET_ROOT_V118, 'other');
    await mkdir(directoryV118);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Unapproved Aliens 1986 V118 raster member/);
    await rm(directoryV118, { recursive: true });
    const missingV118 = join(output, ALIENS1986_RASTER_ASSET_FILES_V118[0]);
    await rm(missingV118);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Missing Aliens 1986 V118 raster member/);
    await symlink(join(root, ALIENS1986_RASTER_ASSET_FILES_V118[0]), missingV118);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Aliens 1986 V118 raster symlink/);
    await rm(missingV118);
    await cp(join(root, ALIENS1986_RASTER_ASSET_FILES_V118[0]), missingV118);
    const extraV120 = join(output, ALIENS1986_RASTER_ASSET_ROOT_V120, 'furniture/unreviewed.png');
    await cp(join(root, ALIENS1986_RASTER_ASSET_FILES_V120[0]), extraV120);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Unapproved Aliens 1986 V120 raster member/);
    await rm(extraV120);
    const directoryV120 = join(output, ALIENS1986_RASTER_ASSET_ROOT_V120, 'other');
    await mkdir(directoryV120);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Unapproved Aliens 1986 V120 raster member/);
    await rm(directoryV120, { recursive: true });
    const missingV120 = join(output, ALIENS1986_RASTER_ASSET_FILES_V120[0]);
    await rm(missingV120);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Missing Aliens 1986 V120 raster member/);
    await symlink(join(root, ALIENS1986_RASTER_ASSET_FILES_V120[0]), missingV120);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Aliens 1986 V120 raster symlink/);
    await rm(missingV120);
    await cp(join(root, ALIENS1986_RASTER_ASSET_FILES_V120[0]), missingV120);
    const extraV121 = join(output, ALIENS1986_RASTER_ASSET_ROOT_V121, 'furniture/unreviewed.png');
    await cp(join(root, ALIENS1986_RASTER_ASSET_FILES_V121[0]), extraV121);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Unapproved Aliens 1986 V121 raster member/);
    await rm(extraV121);
    const directoryV121 = join(output, ALIENS1986_RASTER_ASSET_ROOT_V121, 'other');
    await mkdir(directoryV121);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Unapproved Aliens 1986 V121 raster member/);
    await rm(directoryV121, { recursive: true });
    const missingV121 = join(output, ALIENS1986_RASTER_ASSET_FILES_V121[0]);
    await rm(missingV121);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Missing Aliens 1986 V121 raster member/);
    await symlink(join(root, ALIENS1986_RASTER_ASSET_FILES_V121[0]), missingV121);
    await assert.rejects(verifyAliens1986Runtime(output, { built }), /Aliens 1986 V121 raster symlink/);
    await rm(missingV121);
    await cp(join(root, ALIENS1986_RASTER_ASSET_FILES_V121[0]), missingV121);
    assert.equal((await verifyAliens1986Runtime(output, { built })).rasterAssets, 155);
  }
});

test('the builder rejects a linked output before copying files through it', async t => {
  const parent = await temp(t), outside = await temp(t), output = join(parent, 'linked');
  await symlink(outside, output);
  await assert.rejects(buildAliens1986Dlc(root, output), /Invalid DLC build directory/);
  assert.deepEqual(await readdir(outside), []);
});


test('each reviewed presentation input rejects changed bytes without rewriting the original inventory', async t => {
  const output = await temp(t);
  const paths = [...Object.keys(ALIENS1986_RASTER_SOURCE_SHA256_V116), ...Object.keys(ALIENS1986_RASTER_SOURCE_SHA256_V117), ...Object.keys(ALIENS1986_RASTER_SOURCE_SHA256_V118), ...Object.keys(ALIENS1986_RASTER_SOURCE_SHA256_V119), ...Object.keys(ALIENS1986_RASTER_SOURCE_SHA256_V120), ...Object.keys(ALIENS1986_RASTER_SOURCE_SHA256_V121)];
  for (const path of paths) {
    await mkdir(dirname(join(output, path)), { recursive: true });
    await cp(join(root, path), join(output, path));
  }
  assert.deepEqual(await verifyAliens1986RasterSourcesV116(output), { presentationSources: paths.length });
  for (const path of paths) {
    const original = await readFile(join(output, path));
    await writeFile(join(output, path), Buffer.concat([original, Buffer.from('\n/* unreviewed */')]));
    await assert.rejects(verifyAliens1986RasterSourcesV116(output), /Changed Aliens 1986 presentation source/);
    await writeFile(join(output, path), original);
  }
});

test('unknown V116/V117/V118 source siblings and built presentation sources are refused', () => {
  for (const path of [
    'modules/aliens-1986/v116/unreviewed.mjs',
    'docs/development/aliens-1986-sprites-v116/private.json',
    'docs/development/aliens-1986-sprites-v117/private.json',
    'docs/development/aliens-1986-sprites-v117/unreviewed/manifest.json',
    'modules/aliens-1986/v118/unreviewed.mjs',
    'docs/development/aliens-1986-sprites-v118/private.json',
    'docs/development/aliens-1986-sprites-v118/unreviewed/manifest.json',
  ]) {
    assert.equal(publicAliens1986DlcPathAdmission(path), false);
    assert.equal(publicAliens1986DlcPathAdmission(path, { built: true }), false);
  }
  for (const path of [...ALIENS1986_RASTER_SOURCE_ONLY_FILES_V116, ...ALIENS1986_RASTER_SOURCE_ONLY_FILES_V117, ...ALIENS1986_RASTER_SOURCE_ONLY_FILES_V118, ...ALIENS1986_RASTER_SOURCE_ONLY_FILES_V119, ...ALIENS1986_RASTER_SOURCE_ONLY_FILES_V120, ...ALIENS1986_RASTER_SOURCE_ONLY_FILES_V121]) {
    assert.equal(publicAliens1986DlcPathAdmission(path, { built: true }), false);
  }
});

test('V117 continues only the derivation tool and keeps every historical V116 pin', async () => {
  assert.equal(ALIENS1986_RASTER_BASELINE_V117, '5f38b7bad2c6401424b23fda11aeb86068f0f354');
  const path = 'scripts/derive-aliens1986-raster-v116.mjs';
  assert.deepEqual(Object.keys(ALIENS1986_RASTER_SOURCE_SUCCESSORS_V117), [path]);
  assert.equal(ALIENS1986_RASTER_SOURCE_SHA256_V116[path], '2dbd40d44678f028c865ea03bc99bfc020adce38b5f8465294949f745ad76434');
  for (const [member, previous] of Object.entries(ALIENS1986_RASTER_SOURCE_SHA256_V116)) {
    const expected = member === path ? '3b053e26bc98a62b9332554b31e28a7f40172e7e0337e94c45c9eab5551a328a' : hash(await readFile(join(root, member)));
    assert.equal(reviewedAliens1986RasterDigestV117(member, previous), expected);
  }
  for (const forged of ['0'.repeat(64), ALIENS1986_RASTER_SOURCE_SUCCESSORS_V117[path].currentSha256]) {
    assert.throws(() => reviewedAliens1986RasterDigestV117(path, forged), /Broken Aliens 1986 presentation predecessor/);
  }
  assert.equal(reviewedAliens1986RasterDigestV117('src/unrelated.js', 'unchanged'), 'unchanged');
});

test('V118 continues the V117 derivation receipt without rewriting either predecessor', async () => {
  const path = 'scripts/derive-aliens1986-raster-v116.mjs';
  assert.equal(ALIENS1986_RASTER_BASELINE_V118, '07ee99d56480780044c74d4f1eb11f31b07fef13');
  assert.deepEqual(Object.keys(ALIENS1986_RASTER_SOURCE_SUCCESSORS_V118), [path]);
  assert.equal(ALIENS1986_RASTER_SOURCE_SUCCESSORS_V118[path].previousSha256, '3b053e26bc98a62b9332554b31e28a7f40172e7e0337e94c45c9eab5551a328a');
  for (const [member, original] of Object.entries(ALIENS1986_RASTER_SOURCE_SHA256_V116)) {
    const predecessor = reviewedAliens1986RasterDigestV117(member, original);
    const expected = member === path ? 'd3eb1ff332474cb961e11bc9b97f37b4be25caba137a0afb7f06f62dd47b7433' : hash(await readFile(join(root, member)));
    assert.equal(reviewedAliens1986RasterDigestV118(member, predecessor), expected);
  }
  for (const forged of ['0'.repeat(64), ALIENS1986_RASTER_SOURCE_SHA256_V116[path], ALIENS1986_RASTER_SOURCE_SUCCESSORS_V118[path].currentSha256]) {
    assert.throws(() => reviewedAliens1986RasterDigestV118(path, forged), /Broken Aliens 1986 V118 presentation predecessor/);
  }
  assert.equal(reviewedAliens1986RasterDigestV118('src/unrelated.js', 'unchanged'), 'unchanged');
  assert.equal(hash(await readFile(join(root, SUPPLEMENT_PATH_V117))), SUPPLEMENT_SHA256_V117);
});

test('the seven V117 records extend the immutable V116 manifest without collisions or substitutions', async () => {
  const baseText = await readFile(join(root, MANIFEST_PATH_V116), 'utf8');
  const supplementText = await readFile(join(root, SUPPLEMENT_PATH_V117), 'utf8');
  const base = JSON.parse(baseText), supplement = JSON.parse(supplementText);
  const merged = compileAliens1986RasterSupplementV117(baseText, supplementText);
  assert.equal(hash(baseText), MANIFEST_SHA256_V116);
  assert.equal(merged.baseAssetCount, 123);
  assert.equal(merged.supplementAssetCount, 7);
  assert.equal(merged.entries.length, 130);
  assert.deepEqual(merged.assets.slice(0, 123), base.assets);
  assert.deepEqual(merged.assets.slice(123).map(asset => asset.id).sort(), [...SUPPLEMENT_IDS_V117].sort());
  assert.deepEqual(merged.assets.slice(123).map(asset => asset.path).sort(), [...ALIENS1986_RASTER_ASSET_FILES_V117].sort());
  assert.equal(new Set(merged.assets.map(asset => asset.id)).size, 130);
  assert.equal(new Set(merged.assets.map(asset => asset.path)).size, 130);
  assert.throws(() => compileAliens1986RasterSupplementV117(baseText + ' ', supplementText), /immutable hash/);
  for (const mutate of [
    value => { value.baseManifest.sha256 = '0'.repeat(64); },
    value => { value.counts.total++; },
    value => { value.assets[0].id = base.assets[0].id; },
    value => { value.assets[0].id = value.assets[1].id; },
    value => { value.assets[0].path = base.assets[0].path; },
    value => { value.assets[0].path = value.assets[1].path; },
    value => { value.assets[0].path = 'assets/dlc/aliens-1986/v117/../escape.png'; },
    value => { value.assets[0].path = 'assets/dlc/aliens-1986/v117//alias.png'; },
    value => { value.assets[0].runtimeEligible = false; },
    value => { value.assets[0].sha256 = 'unreviewed'; },
    value => { value.assets.pop(); },
  ]) {
    const changed = structuredClone(supplement); mutate(changed);
    assert.throws(() => compileAliens1986RasterSupplementV117(baseText, JSON.stringify(changed)));
  }
});

test('V118 appends eleven reviewed records to two byte-identical predecessor manifests', async () => {
  const baseText = await readFile(join(root, MANIFEST_PATH_V116), 'utf8');
  const previousText = await readFile(join(root, SUPPLEMENT_PATH_V117), 'utf8');
  const supplementText = await readFile(join(root, SUPPLEMENT_PATH_V118), 'utf8');
  const previous = compileAliens1986RasterSupplementV117(baseText, previousText);
  const supplement = JSON.parse(supplementText), merged = compileAliens1986RasterSupplementV118(baseText, previousText, supplementText);
  assert.equal(merged.baseAssetCount, 130); assert.equal(merged.supplementAssetCount, 11);
  assert.equal(merged.entries.length, 141);
  assert.deepEqual(merged.assets.slice(0, 130), previous.assets);
  assert.deepEqual(merged.assets.slice(130).map(asset => asset.id).sort(), [...SUPPLEMENT_IDS_V118].sort());
  assert.deepEqual(merged.assets.slice(130).map(asset => asset.path).sort(), [...ALIENS1986_RASTER_ASSET_FILES_V118].sort());
  assert.equal(new Set(merged.assets.map(asset => asset.id)).size, 141);
  assert.equal(new Set(merged.assets.map(asset => asset.path)).size, 141);
  assert.equal(merged.assets.some(asset => asset.id === 'sentry-aim-front'), false);
  assert.throws(() => compileAliens1986RasterSupplementV118(baseText + ' ', previousText, supplementText), /immutable hash/);
  assert.throws(() => compileAliens1986RasterSupplementV118(baseText, previousText + ' ', supplementText), /immutable hash/);
  for (const mutate of [
    value => { value.baseManifests[0].sha256 = '0'.repeat(64); },
    value => { value.baseManifests[1].sha256 = '0'.repeat(64); },
    value => { value.baseManifests.reverse(); },
    value => { value.baseManifests[1].assetCount = 8; },
    value => { value.baseManifests.pop(); },
    value => { value.counts.base = 123; },
    value => { value.counts.added = 12; },
    value => { value.counts.total = 142; },
    value => { value.presentationVersion = 116; },
    value => { value.assets[0].id = previous.assets[0].id; },
    value => { value.assets[0] = { ...value.assets[1] }; },
    value => { value.assets[0].path = previous.assets[0].path; },
    value => { value.assets[0].path = 'assets/dlc/aliens-1986/v118/equipment/engineering-case-stocked.png'; },
    value => { value.assets[0].path = 'assets/dlc/aliens-1986/v118/props/nested/engineering-case-stocked.png'; },
    value => { value.assets[0].id = 'sentry-aim-front'; value.assets[0].path = 'assets/dlc/aliens-1986/v118/equipment/sentry-aim-front.png'; },
    value => { value.assets[0].runtimeEligible = false; },
    value => { value.assets[0].sha256 = 'unreviewed'; },
    value => { value.assets[0].bytes = 0; },
    value => { value.assets[0].bbox = [0, 0, 0, 0]; },
    value => { value.assets.pop(); },
  ]) {
    const changed = structuredClone(supplement); mutate(changed);
    assert.throws(() => compileAliens1986RasterSupplementV118(baseText, previousText, JSON.stringify(changed)));
  }
});

// Focused lifecycle stubs complement the separate served-browser journey.
test('Aliens and Fleuve buttons remain optional, independent and available to keyboard navigation', () => {
  const button = () => ({ hidden: false, disabled: false });
  const context = { continueButton: button(), newButton: button(), forgeButton: button(), optionsButton: button() };
  const buttons = () => TitleScreenController.prototype.menuButtons.call(context);
  assert.deepEqual(buttons(), [context.continueButton, context.newButton, context.forgeButton, context.optionsButton]);
  context.dlcButton = button();
  context.aliens1986Button = button();
  assert.deepEqual(buttons(), [context.continueButton, context.newButton, context.dlcButton, context.aliens1986Button, context.forgeButton, context.optionsButton]);
  context.aliens1986Button.hidden = true;
  assert.equal(buttons().includes(context.aliens1986Button), false);
  assert.equal(buttons().includes(context.dlcButton), true);
  context.aliens1986Button.hidden = false;
  context.aliens1986Button.disabled = true;
  assert.equal(buttons().includes(context.aliens1986Button), false);
});

test('Aliens navigation cancels pending new-game confirmation and never calls the Fleuve action', t => {
  const calls = [], timer = setTimeout(() => {}, 60000);
  t.after(() => clearTimeout(timer));
  const context = {
    root: { hidden: false }, state: 'menu', confirmTimer: timer,
    confirmSave: { profile: 7 }, confirmRecovery: { profile: 7 },
    newButton: { dataset: { confirm: 'true' }, textContent: 'Confirmation fixture' },
    onDlc() { assert.fail('Aliens invoked the Fleuve callback'); },
    onAliens1986() {
      assert.equal(this.confirmTimer, 0);
      assert.equal(this.confirmSave, null);
      assert.equal(this.confirmRecovery, null);
      assert.equal(this.newButton.dataset.confirm, 'false');
      calls.push('navigate');
    },
    cancelNewTimelineConfirmation() {
      calls.push('cancel');
      TitleScreenController.prototype.cancelNewTimelineConfirmation.call(this);
    },
  };
  assert.equal(TitleScreenController.prototype.openAliens1986.call(context), true);
  assert.deepEqual(calls, ['cancel', 'navigate']);
  for (const [state, hidden] of [['idle', false], ['menu', true], ['exiting', false]]) {
    context.state = state; context.root.hidden = hidden;
    assert.equal(TitleScreenController.prototype.openAliens1986.call(context), false);
  }
  assert.deepEqual(calls, ['cancel', 'navigate']);
  context.state = 'menu'; context.root.hidden = false;
  context.onAliens1986 = () => false;
  assert.equal(TitleScreenController.prototype.openAliens1986.call(context), false);
  assert.equal(context.state, 'menu');
  context.onAliens1986 = null;
  assert.equal(TitleScreenController.prototype.openAliens1986.call(context), false);
});


test('V119 keeps a closed six-image tree and excludes source documents from builds', () => {
  const prefix='assets/dlc/aliens-1986/v119';
  assert.equal(ALIENS1986_RASTER_ASSET_ROOT_V119,prefix);
  assert.equal(ALIENS1986_RASTER_ASSET_FILES_V119.length,6);
  for(const built of [false,true]) {
    for(const path of ALIENS1986_RASTER_ASSET_FILES_V119)assert.equal(publicAliens1986DlcPathAdmission(path,{built}),true);
    for(const path of ALIENS1986_RASTER_ASSET_DIRECTORIES_V119)assert.equal(publicAliens1986DlcPathAdmission(path,{built,directory:true}),true);
    for(const path of [prefix+'/furniture/extra.png',prefix+'/furniture/medlab-bed.png/extra',prefix+'/other'])assert.equal(publicAliens1986DlcPathAdmission(path,{built}),false);
  }
  for(const path of ALIENS1986_RASTER_SOURCE_ONLY_FILES_V119) {
    assert.equal(publicAliens1986DlcPathAdmission(path),true);
    assert.equal(publicAliens1986DlcPathAdmission(path,{built:true}),false);
  }
  for(const path of ['modules/aliens-1986/v119/extra.mjs','docs/development/aliens-1986-sprites-v119/private.json'])assert.equal(publicAliens1986DlcPathAdmission(path),false);
});

test('V119 preserves all three manifests and rejects substituted furniture or false fidelity claims',async()=>{
  const texts=await Promise.all([MANIFEST_PATH_V116,SUPPLEMENT_PATH_V117,SUPPLEMENT_PATH_V118,SUPPLEMENT_PATH_V119].map(path=>readFile(join(root,path),'utf8')));
  assert.equal(hash(texts[2]),SUPPLEMENT_SHA256_V118);
  const previous=compileAliens1986RasterSupplementV118(...texts.slice(0,3));
  const current=compileAliens1986RasterSupplementV119(...texts);
  assert.deepEqual(current.assets.slice(0,141),previous.assets);
  assert.equal(current.entries.length,147);
  assert.deepEqual(current.assets.slice(141).map(a=>a.id),[...SUPPLEMENT_IDS_V119]);
  for(let i=0;i<3;i++) {
    const changed=[...texts];changed[i]+=' ';
    assert.throws(()=>compileAliens1986RasterSupplementV119(...changed),/immutable hash/);
  }
  for(const mutate of [
    x=>x.assets.pop(),x=>x.assets[1]=x.assets[0],x=>x.counts.total=200,
    x=>x.assets[0].path='assets/dlc/aliens-1986/v119/furniture/other.png',
    x=>x.assets[0].animated=true,x=>x.assets[0].filmFidelityValidated=true,
    x=>x.baseManifests[2].sha256='0'.repeat(64),x=>x.assets[0].bbox=[0,0,0,0],
  ]) {
    const value=JSON.parse(texts[3]);mutate(value);
    assert.throws(()=>compileAliens1986RasterSupplementV119(...texts.slice(0,3),JSON.stringify(value)));
  }
});

test('V119 continues the reviewed V118 derivative without rewriting earlier receipts',async()=>{
  const path='scripts/derive-aliens1986-raster-v116.mjs';
  assert.equal(ALIENS1986_RASTER_BASELINE_V119,'5ec98a99ea1bfea30159f11ab1a698b0106ae9de');
  assert.deepEqual(Object.keys(ALIENS1986_RASTER_SOURCE_SUCCESSORS_V119),[path]);
  assert.equal(ALIENS1986_RASTER_SOURCE_SUCCESSORS_V119[path].previousSha256,'d3eb1ff332474cb961e11bc9b97f37b4be25caba137a0afb7f06f62dd47b7433');
  const predecessor=reviewedAliens1986RasterDigestV118(path,reviewedAliens1986RasterDigestV117(path,ALIENS1986_RASTER_SOURCE_SHA256_V116[path]));
  assert.equal(reviewedAliens1986RasterDigestV119(path,predecessor),ALIENS1986_RASTER_SOURCE_SUCCESSORS_V120[path].previousSha256);
  assert.throws(()=>reviewedAliens1986RasterDigestV119(path,'0'.repeat(64)),/Broken Aliens 1986 V119 presentation predecessor/);
  assert.equal(reviewedAliens1986RasterDigestV119('unrelated','stable'),'stable');
});

test('V120 admits four new images and exact source-only evidence paths', () => {
  const prefix='assets/dlc/aliens-1986/v120';
  assert.equal(ALIENS1986_RASTER_ASSET_ROOT_V120,prefix);
  assert.equal(ALIENS1986_RASTER_ASSET_FILES_V120.length,4);
  for(const built of [false,true]) {
    for(const path of ALIENS1986_RASTER_ASSET_FILES_V120)assert.equal(publicAliens1986DlcPathAdmission(path,{built}),true);
    for(const path of ALIENS1986_RASTER_ASSET_DIRECTORIES_V120)assert.equal(publicAliens1986DlcPathAdmission(path,{built,directory:true}),true);
    for(const path of [prefix+'/furniture/extra.png',prefix+'/furniture/utility-storage-cabinet.png/extra',prefix+'/other'])assert.equal(publicAliens1986DlcPathAdmission(path,{built}),false);
  }
  for(const path of ALIENS1986_RASTER_SOURCE_ONLY_FILES_V120) {
    assert.equal(publicAliens1986DlcPathAdmission(path),true);
    assert.equal(publicAliens1986DlcPathAdmission(path,{built:true}),false);
  }
  for(const path of ['modules/aliens-1986/v120/extra.mjs','docs/development/aliens-1986-sprites-v120/private.json'])assert.equal(publicAliens1986DlcPathAdmission(path),false);
});

test('V120 preserves all four manifests and rejects duplicate assets, changed bounds and unsupported claims',async()=>{
  const texts=await Promise.all([MANIFEST_PATH_V116,SUPPLEMENT_PATH_V117,SUPPLEMENT_PATH_V118,SUPPLEMENT_PATH_V119,SUPPLEMENT_PATH_V120].map(path=>readFile(join(root,path),'utf8')));
  assert.equal(hash(texts[3]),SUPPLEMENT_SHA256_V119);
  const previous=compileAliens1986RasterSupplementV119(...texts.slice(0,4));
  const current=compileAliens1986RasterSupplementV120(...texts);
  assert.deepEqual(current.assets.slice(0,147),previous.assets);
  assert.equal(current.entries.length,151);
  assert.deepEqual(current.assets.slice(147).map(a=>a.id),[...SUPPLEMENT_IDS_V120]);
  for(let i=0;i<4;i++) {
    const changed=[...texts];changed[i]+=' ';
    assert.throws(()=>compileAliens1986RasterSupplementV120(...changed),/immutable hash/);
  }
  for(const mutate of [
    x=>x.assets.pop(),x=>x.assets[1]=x.assets[0],x=>x.counts.total=153,
    x=>x.assets[0].path='assets/dlc/aliens-1986/v120/furniture/other.png',
    x=>x.assets[0].animated=true,x=>x.assets[0].filmFidelityValidated=true,
    x=>x.assets[0].runtimeEligible=false,x=>x.assets[0].frameCount=2,
    x=>x.baseManifests[3].sha256='0'.repeat(64),x=>x.assets[0].bbox=[0,0,0,0],
  ]) {
    const value=JSON.parse(texts[4]);mutate(value);
    assert.throws(()=>compileAliens1986RasterSupplementV120(...texts.slice(0,4),JSON.stringify(value)));
  }
});

test('V120 continues only the derivative while preserving the published V119 endpoint',async()=>{
  const path='scripts/derive-aliens1986-raster-v116.mjs';
  assert.equal(ALIENS1986_RASTER_BASELINE_V120,'168b6b489af1469bde620c108c8abed06d469f88');
  assert.deepEqual(Object.keys(ALIENS1986_RASTER_SOURCE_SUCCESSORS_V120),[path]);
  assert.equal(ALIENS1986_RASTER_SOURCE_SUCCESSORS_V120[path].previousSha256,'63175b7a507aa2409606da368b0f75935d107a06fe97c7f28f5d62b69463dddd');
  const predecessor=reviewedAliens1986RasterDigestV119(path,reviewedAliens1986RasterDigestV118(path,reviewedAliens1986RasterDigestV117(path,ALIENS1986_RASTER_SOURCE_SHA256_V116[path])));
  assert.equal(reviewedAliens1986RasterDigestV120(path,predecessor),ALIENS1986_RASTER_SOURCE_SUCCESSORS_V121[path].previousSha256);
  assert.throws(()=>reviewedAliens1986RasterDigestV120(path,'0'.repeat(64)),/Broken Aliens 1986 V120 presentation predecessor/);
  assert.equal(reviewedAliens1986RasterDigestV120('unrelated','stable'),'stable');
});

test('V121 admits four new images and exact source-only evidence paths', () => {
  const prefix='assets/dlc/aliens-1986/v121';
  assert.equal(ALIENS1986_RASTER_ASSET_ROOT_V121,prefix);
  assert.equal(ALIENS1986_RASTER_ASSET_FILES_V121.length,4);
  for(const built of [false,true]) {
    for(const path of ALIENS1986_RASTER_ASSET_FILES_V121)assert.equal(publicAliens1986DlcPathAdmission(path,{built}),true);
    for(const path of ALIENS1986_RASTER_ASSET_DIRECTORIES_V121)assert.equal(publicAliens1986DlcPathAdmission(path,{built,directory:true}),true);
    for(const path of [prefix+'/furniture/extra.png',prefix+'/furniture/conduit-valve-plinth.png/extra',prefix+'/other'])assert.equal(publicAliens1986DlcPathAdmission(path,{built}),false);
  }
  for(const path of ALIENS1986_RASTER_SOURCE_ONLY_FILES_V121) {
    assert.equal(publicAliens1986DlcPathAdmission(path),true);
    assert.equal(publicAliens1986DlcPathAdmission(path,{built:true}),false);
  }
  for(const path of ['modules/aliens-1986/v121/extra.mjs','docs/development/aliens-1986-sprites-v121/private.json'])assert.equal(publicAliens1986DlcPathAdmission(path),false);
});

test('V121 preserves all five manifests and rejects duplicate assets, changed bounds and unsupported claims',async()=>{
  const texts=await Promise.all([MANIFEST_PATH_V116,SUPPLEMENT_PATH_V117,SUPPLEMENT_PATH_V118,SUPPLEMENT_PATH_V119,SUPPLEMENT_PATH_V120,SUPPLEMENT_PATH_V121].map(path=>readFile(join(root,path),'utf8')));
  assert.equal(hash(texts[4]),SUPPLEMENT_SHA256_V120);
  const previous=compileAliens1986RasterSupplementV120(...texts.slice(0,5));
  const current=compileAliens1986RasterSupplementV121(...texts);
  assert.deepEqual(current.assets.slice(0,151),previous.assets);
  assert.equal(current.entries.length,155);
  assert.deepEqual(current.assets.slice(151).map(a=>a.id),[...SUPPLEMENT_IDS_V121]);
  for(let i=0;i<texts.length-1;i++) {
    const changed=[...texts];changed[i]+=' ';
    assert.throws(()=>compileAliens1986RasterSupplementV121(...changed),/immutable hash/);
  }
  for(const mutate of [
    x=>x.assets.pop(),x=>x.assets[1]=x.assets[0],x=>x.counts.total--,
    x=>x.assets[0].path='assets/dlc/aliens-1986/v121/furniture/other.png',
    x=>x.assets[0].animated=true,x=>x.assets[0].filmFidelityValidated=true,
    x=>x.assets[0].runtimeEligible=false,x=>x.assets[0].frameCount=2,
    x=>x.baseManifests.at(-1).sha256='0'.repeat(64),x=>x.assets[0].bbox=[0,0,0,0],
  ]) {
    const value=JSON.parse(texts.at(-1));mutate(value);
    assert.throws(()=>compileAliens1986RasterSupplementV121(...texts.slice(0,5),JSON.stringify(value)));
  }
});

test('V121 continues only the derivative while preserving the published V120 endpoint',async()=>{
  const path='scripts/derive-aliens1986-raster-v116.mjs';
  assert.equal(ALIENS1986_RASTER_BASELINE_V121,'8454b22ad739a1fc2e97d0bae4ffb23cd48162d4');
  assert.deepEqual(Object.keys(ALIENS1986_RASTER_SOURCE_SUCCESSORS_V121),[path]);
  assert.equal(ALIENS1986_RASTER_SOURCE_SUCCESSORS_V121[path].previousSha256,'f89c27738cdf6dca374bb2f1b4aee9734199324c6c7f1e0242eda49d5b2af189');
  const predecessor=reviewedAliens1986RasterDigestV120(path,reviewedAliens1986RasterDigestV119(path,reviewedAliens1986RasterDigestV118(path,reviewedAliens1986RasterDigestV117(path,ALIENS1986_RASTER_SOURCE_SHA256_V116[path]))));
  assert.equal(reviewedAliens1986RasterDigestV121(path,predecessor),hash(await readFile(join(root,path))));
  assert.throws(()=>reviewedAliens1986RasterDigestV121(path,'0'.repeat(64)),/Broken Aliens 1986 V121 presentation predecessor/);
  assert.equal(reviewedAliens1986RasterDigestV121('unrelated','stable'),'stable');
});
