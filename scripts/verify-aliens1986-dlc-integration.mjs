import { findBuiltDevToolsPathV188, DEV_TOOLS_DEFAULT_PATH_V188 } from './build-dev-tools-v188.mjs';
import { TitleScreenController } from '../src/title-screen-v61.js';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  ALIENS1986_ARCHIVE_SHA256, ALIENS1986_RECOVERY_ROOT, ALIENS1986_RECOVERY_MANIFEST,
  ALIENS1986_RECOVERY_MANIFEST_SHA256, ALIENS1986_RUNTIME_ROOT, ALIENS1986_RUNTIME_FILES,
  ALIENS1986_SOURCE_ONLY_FILES, compileAliens1986RecoveryManifest,
  publicAliens1986DlcPathAdmission, reviewedAliens1986Recovery,
  verifyAliens1986DlcAdmissions, verifyAliens1986Runtime,
} from './public-aliens1986-dlc-admissions.mjs';
import { buildAliens1986Dlc } from './build-aliens1986-dlc.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import {
  TANTALUS_PRIORITIES_ALIENS1986_JOIN_V188, reviewedTantalusAliens1986DigestV188,
  reviewedTantalusPrioritiesDigestV188, verifyTantalusAliens1986V188,
} from './audit-tantalus-priorities-v188.mjs';
import {
  XENO_TRIALS_ALIENS1986_JOIN_V206, reviewedXenoAliens1986DigestV206,
  reviewedXenoTrialsTantalusJoinV206, verifyXenoAliens1986V206, xenoTrialsTantalusJoinRuntimeSourcesV206,
} from './audit-xeno-production-assets-v206.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const sourceBytes = path => readFileSync(join(root, path));
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

test('the two historical audit terminals agree on exactly six integration files and one expected-endpoint test', () => {
  assert.deepEqual(TANTALUS_PRIORITIES_ALIENS1986_JOIN_V188, XENO_TRIALS_ALIENS1986_JOIN_V206);
  const paths = ['index.html', 'package.json', 'scripts/build.mjs', 'scripts/build-dev-tools-v188.mjs',
    'scripts/verify-public-release-v86.mjs', 'src/title-screen-v61.js', 'scripts/verify-tantalus-priorities-v188.mjs'];
  for (const join of [TANTALUS_PRIORITIES_ALIENS1986_JOIN_V188, XENO_TRIALS_ALIENS1986_JOIN_V206]) {
    assert.equal(join.baseline, '001a20bdc0f9f1a3c835e84d8f3c9434bc159330');
    assert.deepEqual(Object.keys(join.successors), paths);
    assert.ok(Object.isFrozen(join) && Object.isFrozen(join.successors));
    for (const [path, receipt] of Object.entries(join.successors)) {
      assert.ok(Object.isFrozen(receipt));
      assert.deepEqual(Object.keys(receipt).sort(), ['currentSha256', 'previousSha256']);
      assert.equal(hash(sourceBytes(path)), receipt.currentSha256, path);
      assert.notEqual(receipt.currentSha256, receipt.previousSha256, path);
    }
  }
});

test('the exact integration continuation rejects invented predecessors and reaches the title through both fallback paths', () => {
  const entries = TANTALUS_PRIORITIES_ALIENS1986_JOIN_V188.successors;
  for (const resolver of [reviewedTantalusAliens1986DigestV188, reviewedXenoAliens1986DigestV206]) {
    for (const [path, receipt] of Object.entries(entries)) {
      assert.equal(resolver(path, receipt.previousSha256), receipt.currentSha256, path);
      for (const bad of [receipt.currentSha256, '0'.repeat(64), undefined]) {
        assert.throws(() => resolver(path, bad), /Broken 001a20b-to-aliens1986 source chain/, path);
      }
    }
    for (const path of ['constructor', 'src/title-screen-v61.js/extra', 'src/unreviewed.js']) {
      assert.equal(resolver(path, 'unchanged'), 'unchanged', path);
    }
  }
  const path = 'src/title-screen-v61.js', receipt = entries[path];
  for (const resolver of [reviewedTantalusPrioritiesDigestV188, reviewedXenoTrialsTantalusJoinV206]) {
    assert.equal(resolver(path, receipt.previousSha256), receipt.currentSha256);
    assert.throws(() => resolver(path, '0'.repeat(64)), /Broken 001a20b-to-aliens1986 source chain/);
  }
  const view = xenoTrialsTantalusJoinRuntimeSourcesV206({ [path]: receipt.previousSha256, unrelated: 'historical' });
  assert.deepEqual(view, { [path]: receipt.currentSha256, unrelated: 'historical' });
  assert.deepEqual(xenoTrialsTantalusJoinRuntimeSourcesV206(view), view);
  assert.throws(() => xenoTrialsTantalusJoinRuntimeSourcesV206({ [path]: '0'.repeat(64) }), /Incorrect Aliens 1986 runtime view predecessor/);
});

test('both audit terminals reject a further changed byte in every integration successor', () => {
  for (const verify of [verifyTantalusAliens1986V188, verifyXenoAliens1986V206]) {
    assert.deepEqual(verify(), { baselineCommit: '001a20bdc0f9f1a3c835e84d8f3c9434bc159330', successors: 7,
      historicalResultsTransferred: false });
    for (const path of Object.keys(TANTALUS_PRIORITIES_ALIENS1986_JOIN_V188.successors)) {
      const changed = Buffer.from(sourceBytes(path)); changed[changed.length - 1] ^= 1;
      assert.throws(() => verify(candidate => candidate === path ? changed : sourceBytes(candidate)),
        error => error.message.includes('Unreviewed Aliens 1986 integration bytes: ' + path));
    }
  }
});

test('the complete pre-integration declarations stay byte-identical and both audit terminals remain independent', () => {
  for (const [path, start, expected] of [
    ['scripts/audit-tantalus-priorities-v188.mjs', 'export const TANTALUS_PRIORITIES_BASELINE_V188',
      '193902152e4e5a352f8ee22503047d618a7d3e19001639dea6bdc2e22d704f0c'],
    ['scripts/audit-xeno-production-assets-v206.mjs', 'export const XENO_PRODUCTION_ASSETS_BASELINE_V206',
      '55e71be67a26c0e81b4196dbd0aa6a5e513a3ae5e9c00796eb3630d2b951e405'],
  ]) {
    const source = sourceBytes(path).toString();
    const first = source.indexOf(start), last = source.indexOf('// BEGIN ALIENS 1986 INTEGRATION RECEIPTS');
    assert.ok(first >= 0 && last > first, path);
    assert.equal(hash(source.slice(first, last)), expected, path);
    assert.doesNotMatch(source, /(?:from\s*|import\s*\(?\s*)['"]\.\//);
  }
});

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
  for (const path of ALIENS1986_SOURCE_ONLY_FILES) {
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
  assert.equal((await verifyAliens1986DlcAdmissions(directory, { built: true })).runtimeFiles, 2);
});

test('the builder copies only the two runtime HTML files with unchanged bytes', async t => {
  const output = await temp(t);
  const result = await buildAliens1986Dlc(root, output);
  assert.equal(result.runtimeFiles, 2);
  assert.deepEqual(await readdir(output), ['dlc']);
  assert.deepEqual((await readdir(join(output, ALIENS1986_RUNTIME_ROOT))).sort(), ['game.html', 'index.html']);
  for (const path of ALIENS1986_RUNTIME_FILES) assert.deepEqual(await readFile(join(output, path)), await readFile(join(root, path)));
});

test('the builder rejects a linked output before copying files through it', async t => {
  const parent = await temp(t), outside = await temp(t), output = join(parent, 'linked');
  await symlink(outside, output);
  await assert.rejects(buildAliens1986Dlc(root, output), /Invalid DLC build directory/);
  assert.deepEqual(await readdir(outside), []);
});


// These focused title tests use button, lifecycle and Location stubs. They do
// not simulate a rendered page or replace the independent browser journey.
function stubLocation(t, assign) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'location');
  Object.defineProperty(globalThis, 'location', { configurable: true, value: { assign } });
  t.after(() => {
    if (previous) Object.defineProperty(globalThis, 'location', previous);
    else delete globalThis.location;
  });
}

test('the Aliens 1986 title button is optional and joins keyboard navigation when available', () => {
  const button = () => ({ hidden: false, disabled: false });
  const context = { continueButton: button(), newButton: button(), forgeButton: button(), optionsButton: button() };
  const buttons = () => TitleScreenController.prototype.menuButtons.call(context);
  assert.deepEqual(buttons(), [context.continueButton, context.newButton, context.forgeButton, context.optionsButton]);
  context.aliens1986Button = button();
  assert.deepEqual(buttons(), [context.continueButton, context.newButton, context.forgeButton, context.aliens1986Button, context.optionsButton]);
  context.aliens1986Button.hidden = true;
  assert.equal(buttons().includes(context.aliens1986Button), false);
  context.aliens1986Button.hidden = false; context.aliens1986Button.disabled = true;
  assert.equal(buttons().includes(context.aliens1986Button), false);
});

test('opening the DLC is refused while the title is idle or hidden', t => {
  const unexpected = () => assert.fail('A refused DLC action changed the title lifecycle.');
  stubLocation(t, unexpected);
  for (const [state, hidden] of [['idle', false], ['menu', true], ['exiting', false]]) {
    const context = { root: { hidden }, state, cancelNewTimelineConfirmation: unexpected, suspendInput: unexpected };
    TitleScreenController.prototype.openAliens1986.call(context);
  }
});

test('opening the DLC from the menu cancels new-game confirmation before suspending and navigating', t => {
  const calls = [], timer = setTimeout(() => {}, 60000);
  t.after(() => clearTimeout(timer));
  const context = {
    root: { hidden: false }, state: 'menu', confirmTimer: timer,
    confirmSave: { profile: 7 }, confirmRecovery: { profile: 7 },
    newButton: { dataset: { confirm: 'true' }, textContent: 'Confirmation fixture' },
    cancelNewTimelineConfirmation() {
      calls.push('cancel');
      TitleScreenController.prototype.cancelNewTimelineConfirmation.call(this);
    },
    suspendInput() {
      assert.equal(this.confirmTimer, 0);
      assert.equal(this.confirmSave, null);
      assert.equal(this.confirmRecovery, null);
      assert.equal(this.newButton.dataset.confirm, 'false');
      calls.push('suspend');
    },
  };
  stubLocation(t, path => {
    assert.equal(path, '/dlc/aliens-1986/');
    assert.deepEqual(calls, ['cancel', 'suspend']);
    calls.push('navigate');
  });
  TitleScreenController.prototype.openAliens1986.call(context);
  assert.deepEqual(calls, ['cancel', 'suspend', 'navigate']);
});


test('a published DLC is not mistaken for hidden developer tools while unknown directories still fail', async t => {
  const output = await temp(t);
  for (const path of ['src', 'assets', 'dlc', DEV_TOOLS_DEFAULT_PATH_V188]) await mkdir(join(output, path));
  assert.equal(await findBuiltDevToolsPathV188(output), DEV_TOOLS_DEFAULT_PATH_V188);
  await mkdir(join(output, 'unexpected-folder'));
  await assert.rejects(findBuiltDevToolsPathV188(output), /exactly one hidden directory/);
});
