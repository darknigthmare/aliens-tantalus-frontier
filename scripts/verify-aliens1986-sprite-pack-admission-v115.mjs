import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  ALIENS1986_GAME_BYTES, ALIENS1986_GAME_SHA256,
  ALIENS1986_RUNTIME_FILES, ALIENS1986_SPRITE_REVIEW_ROOT_V115,
  ALIENS1986_SPRITE_SOURCE_ONLY_FILES_V115,
  publicAliens1986DlcPathAdmission, verifyAliens1986Runtime,
} from './public-aliens1986-dlc-admissions.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const reviewRoot = 'docs/development/aliens-1986-sprites-v115';
const reviewedFiles = [
  'docs/development/ALIENS_1986_SPRITE_INVENTORY_V115.json',
  'docs/development/ALIENS_1986_SPRITE_INVENTORY_V115.md',
  'docs/development/ALIENS_1986_RASTER_INTEGRATION_REVIEW_V115.md',
  reviewRoot + '/index.html', reviewRoot + '/manifest.json', reviewRoot + '/README.md',
  'scripts/verify-aliens1986-sprite-pack-admission-v115.mjs',
];

test('V115 admits only the reviewed sprite documents and test as source files', () => {
  assert.equal(ALIENS1986_SPRITE_REVIEW_ROOT_V115, reviewRoot);
  assert.deepEqual([...ALIENS1986_SPRITE_SOURCE_ONLY_FILES_V115], reviewedFiles);
  for (const path of reviewedFiles) {
    assert.equal(publicAliens1986DlcPathAdmission(path), true, path);
    assert.equal(publicAliens1986DlcPathAdmission(path, { directory: true }), false, path);
    assert.equal(publicAliens1986DlcPathAdmission(path, { built: true }), false, path);
    assert.equal(publicAliens1986DlcPathAdmission(path, { directory: true, built: true }), false, path);
  }
});

test('V115 review ancestors stay source-only without admitting an arbitrary review subtree', () => {
  for (const path of ['docs', 'docs/development', reviewRoot]) {
    assert.equal(publicAliens1986DlcPathAdmission(path, { directory: true }), true, path);
    assert.equal(publicAliens1986DlcPathAdmission(path), false, path);
    assert.equal(publicAliens1986DlcPathAdmission(path, { directory: true, built: true }), false, path);
  }
  for (const suffix of ['notes.html', 'private.json', 'manifest.json/child', 'screenshots', 'screenshots/ripley.png', 'image.png']) {
    for (const directory of [false, true]) for (const built of [false, true]) {
      assert.equal(publicAliens1986DlcPathAdmission(reviewRoot + '/' + suffix, { directory, built }), false);
    }
  }
});

test('V115 rejects review traversal and aliases while leaving unrelated image policy delegated', () => {
  for (const path of [
    '/' + reviewRoot + '/manifest.json', reviewRoot + '/../private.json',
    reviewRoot + '/./manifest.json', reviewRoot + '//manifest.json',
    reviewRoot + '\\manifest.json', reviewRoot + '/manifest.json/',
    reviewRoot + '/%2e%2e/private.json', reviewRoot + '/MANIFEST.json',
    reviewRoot + '/manifest.json?download=1', reviewRoot + '/manifest.json#section',
    reviewRoot + '/manifest.json\0',
  ]) assert.equal(publicAliens1986DlcPathAdmission(path), false, path);
  for (const path of [
    'assets/dlc/aliens-1986/v115/characters/ripley-idle-right.png',
    'assets/dlc/aliens-1986/v115/props/helmet.webp',
  ]) assert.equal(publicAliens1986DlcPathAdmission(path), null, path);
});

test('V115 sprite review preserves the two original V114 runtime HTML files and their pinned game bytes', async () => {
  assert.deepEqual([...ALIENS1986_RUNTIME_FILES], ['dlc/aliens-1986/index.html', 'dlc/aliens-1986/game.html']);
  assert.equal(ALIENS1986_GAME_BYTES, 780305);
  assert.equal(ALIENS1986_GAME_SHA256, '9f1b902e7546dff18867d9b0d1cb638bc9d256863654be5e2e74bc5cb301548d');
  assert.deepEqual(await verifyAliens1986Runtime(root), {
    runtimeFiles: 2, runtimeBytes: 782652,
    gameSha256: '9f1b902e7546dff18867d9b0d1cb638bc9d256863654be5e2e74bc5cb301548d',
  });
});
