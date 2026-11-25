import { findBuiltDevToolsPathV188, DEV_TOOLS_DEFAULT_PATH_V188 } from './build-dev-tools-v188.mjs';
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
  ALIENS1986_SOURCE_ONLY_FILES, compileAliens1986RecoveryManifest,
  publicAliens1986DlcPathAdmission, reviewedAliens1986Recovery,
  verifyAliens1986DlcAdmissions, verifyAliens1986Runtime,
} from './public-aliens1986-dlc-admissions.mjs';
import { buildAliens1986Dlc } from './build-aliens1986-dlc.mjs';
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
