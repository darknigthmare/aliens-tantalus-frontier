import { ENEMY_USER_CREATIONS_V95 as USER_ADDITIONS } from '../src/enemy-user-creations-v95.js';
import { ENEMY_ADDITIONAL_POSES_V94 as ADDITIONAL } from '../src/enemy-additional-poses-v94.js';
import { ENEMY_DEDICATED_POSES_V98 as DEDICATED } from '../src/enemy-dedicated-poses-v98.js';
import { ENEMY_STATIC_POSES_V96 as CURRENT_STATIC } from '../src/enemy-static-poses-v96.js';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import { BIOFORGE_TERRESTRIAL_ROSTER_V80, getBioforgeRosterEntryV80 } from '../src/bioforge-session-v80.js';
import { getCatalogEntryV62 } from '../src/catalog-runtime-v62.js';
import { ENEMIES } from '../src/content-core-v50.js';
import { ENEMY_SPRITE_REVISIONS_V92, applyEnemySpriteRevisionV92 } from '../src/enemy-sprite-revisions-v92.js';
import { createUserCampaignActorV88 } from '../src/enemy-user-campaign-runtime-v88.js';
import { ENEMY_ENCYCLOPEDIA_CATALOG_V88, getEnemyUserCampaignV88 } from '../src/enemy-user-campaign-v88.js';
import { ENEMY_USER_CASTES_ORIGINALS_V87, ENEMY_USER_CASTES_V87, getEnemyUserCasteV87 } from '../src/enemy-user-castes-v87.js';
import { createUserCasteActorV87, drawUserCastePoseV87, isUserCasteImageReadyV87 } from '../src/enemy-user-pose-runtime-v87.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const smasherId = 'castes-game_avp_capcom_smasher';
const originalPath = '/assets/user/castes-v87/game_avp_capcom_smasher.png';
const revisedPath = '/assets/openai/sprites/static-enemy-v92/game_avp_capcom_smasher.png';
const revisedImageKey = 'openai-static-v92:game_avp_capcom_smasher';
const originalSha256 = '962806005136e2b82b1741cc77b4d9938886092dbd2c05fc2c45e7b5521bc96e';
const revisedSha256 = '0efaa9b6afe6f817567725d7aae0b57c15093d1f68a8e480bb34ede566c7dee8';
const original = ENEMY_USER_CASTES_ORIGINALS_V87.find(entry => entry.id === smasherId);
const revised = getEnemyUserCasteV87(smasherId);

test('V92 keeps the audited original Smasher bytes and owns a distinct accepted PNG', async () => {
  const receipt = JSON.parse(await readFile(new URL('../docs/references/user-castes-v87-integrity.json', import.meta.url)));
  const row = receipt.files.find(entry => entry.name === 'game_avp_capcom_smasher.png');
  assert.equal(receipt.count, 35);
  assert.equal(receipt.bytes, 64396633);
  assert.equal(row.sha256, originalSha256);
  assert.equal(original.path, originalPath);
  assert.equal(revised.originalPath, originalPath);
  assert.equal(revised.path, revisedPath);
  for (const [path, sha256, width, height] of [
    [originalPath, originalSha256, 1536, 1024],
    [revisedPath, revisedSha256, 1536, 1024]
  ]) {
    const bytes = await readFile(join(projectRoot, path.slice(1)));
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), sha256, path);
    assert.equal(bytes.readUInt32BE(16), width, path);
    assert.equal(bytes.readUInt32BE(20), height, path);
    if (path === originalPath) assert.equal(bytes.length, row.bytes);
  }
  assert.notEqual(originalSha256, revisedSha256);
});

test('V92 remains limited to Smasher while the current registry may compose later visual revisions', () => {
  assert.equal(ENEMY_SPRITE_REVISIONS_V92.length, 1);
  assert.equal(ENEMY_USER_CASTES_ORIGINALS_V87.length, 35);
  assert.equal(ENEMY_USER_CASTES_V87.length, 35);
  assert.deepEqual(ENEMY_USER_CASTES_V87.map(entry => entry.id), ENEMY_USER_CASTES_ORIGINALS_V87.map(entry => entry.id));
  assert.ok(Object.isFrozen(ENEMY_USER_CASTES_ORIGINALS_V87));
  const snapshot = JSON.stringify(ENEMY_USER_CASTES_ORIGINALS_V87);
  for (const source of ENEMY_USER_CASTES_ORIGINALS_V87) {
    assert.ok(Object.isFrozen(source));
    const actual = getEnemyUserCasteV87(source.id);
    if (source.id === smasherId) {
      assert.notEqual(actual, source);
      assert.deepEqual(applyEnemySpriteRevisionV92(source), actual);
    } else {
      if (source.id !== 'castes-game_avp_capcom_chrysalis') assert.equal(actual, source, source.id);
      assert.equal(applyEnemySpriteRevisionV92(source), source, source.id);
    }
  }
  for (const id of ['enemy-005-warrior', 'castes-game_avp_capcom_chrysalis', smasherId + ':0', ' ' + smasherId, '__proto__']) {
    const unrelated = Object.freeze({ ...original, id, profileId: id, name: 'Smasher' });
    assert.equal(applyEnemySpriteRevisionV92(unrelated), unrelated, id);
  }
  assert.equal(JSON.stringify(ENEMY_USER_CASTES_ORIGINALS_V87), snapshot, 'revision does not rewrite original provenance');
  assert.equal(ENEMIES.length, 571);
  assert.equal(ENEMY_ENCYCLOPEDIA_CATALOG_V88.length, 571 + CURRENT_STATIC.length);
  assert.equal(BIOFORGE_TERRESTRIAL_ROSTER_V80.length, 11 + CURRENT_STATIC.length + DEDICATED.filter(pose => pose.bioforgeEligible !== false).length);
});

test('V92 changes art provenance and geometry only, never gameplay or canonical status', () => {
  for (const key of ['id', 'profileId', 'basename', 'name', 'work', 'group', 'legacyCounterpartId', 'family', 'biology',
    'combatRole', 'health', 'damage', 'speed', 'armor', 'cost', 'bodyWidth', 'bodyHeight', 'automaticEncounter', 'encounterWorldIds']) {
    assert.deepEqual(revised[key], original[key], key);
  }
  assert.deepEqual([revised.health, revised.damage, revised.speed, revised.armor, revised.cost, revised.bodyWidth, revised.bodyHeight],
    [245, 25, .9, 18, 4, 98, 104]);
  assert.equal(original.provenance, 'fan-made-user-import');
  assert.equal(original.reviewStatus, 'static-import');
  assert.equal(revised.provenance, 'openai-integrated-reference-guided');
  assert.equal(revised.reviewStatus, 'accepted-static-adaptation');
  assert.equal(revised.identityStatus, 'reference-guided-static-pose');
  assert.equal(revised.canonExact, false);
  assert.equal(revised.identityVerified, false);
  assert.equal(revised.animationStatus, 'missing');
  assert.equal(revised.visualMode, 'static-pose');
  assert.equal(revised.imageKey, revisedImageKey);
  assert.notEqual(revised.imageKey, original.imageKey, 'an old in-memory image cannot satisfy the revised key');
  assert.deepEqual(revised.pivot, { x: .60, y: 894 / 1024 });
  assert.equal(revised.renderWidth, 318);
  assert.equal(revised.renderHeight, 212);
  assert.equal(revised.sourceWidth, 1536);
  assert.equal(revised.sourceHeight, 1024);
  assert.equal(revised.renderWidth / revised.renderHeight, revised.sourceWidth / revised.sourceHeight);
  assert.ok(Object.isFrozen(revised));
  assert.ok(Object.isFrozen(revised.pivot));
});

test('V92 mission, encyclopedia and BIOFORGE resolve the same revised Smasher without an atlas', () => {
  const mission = getEnemyUserCampaignV88(smasherId);
  const catalog = getCatalogEntryV62(smasherId);
  const lab = getBioforgeRosterEntryV80(smasherId);
  for (const entry of [mission, lab]) {
    assert.equal(entry.profileId, smasherId);
    assert.equal(entry.path, revisedPath);
    assert.equal(entry.imageKey, revisedImageKey);
    assert.equal(entry.provenance, revised.provenance);
    assert.equal(entry.originalPath, originalPath);
    assert.equal(entry.canonExact, false);
    assert.equal(entry.animationStatus, 'missing');
  }
  assert.equal(catalog.id, smasherId);
  assert.equal(catalog.visual.path, revisedPath);
  assert.equal(catalog.visual.imageKey, revisedImageKey);
  assert.equal(catalog.visual.sheetId, null);
  assert.deepEqual(catalog.visual.grid, { columns: 1, rows: 1, cellWidth: 1536, cellHeight: 1024 });
  assert.deepEqual(catalog.visual.previewClips, []);
  assert.equal(catalog.visual.identity.status, 'reference-guided-static-pose');
  assert.equal(catalog.visual.identity.canonExact, false);
  assert.equal(catalog.canonFacts.source.provenance, revised.provenance);
  assert.equal(mission.automaticEncounter, true);
  assert.ok(mission.encounterWorldIds.length > 0);
  const campaignActor = createUserCampaignActorV88(mission, { x: 350, y: 530, h: 112, alive: true }, 2);
  const labActor = createUserCasteActorV87({ profileId: smasherId, id: 'revision-lab' }, 642);
  for (const actor of [campaignActor, labActor]) {
    assert.equal(actor.profileId, smasherId);
    assert.equal(actor.visualImageKey, revisedImageKey);
    assert.equal(actor.visualSheetId, null);
    assert.equal(actor.maxHealth, original.health);
    assert.equal(actor.damage, original.damage);
    assert.equal(actor.y + actor.h, 642);
  }
});

test('V92 draws one complete frame at the new feet anchor in both orientations', () => {
  const actor = createUserCasteActorV87({ profileId: smasherId, id: 'revision-draw' }, 642);
  actor.x = 350;
  const image = { complete: true, naturalWidth: 1536, naturalHeight: 1024, src: revisedPath };
  assert.equal(isUserCasteImageReadyV87(image, revised), true);
  for (const facing of [-1, 1]) {
    actor.facing = facing;
    const calls = [];
    const context = Object.fromEntries(['save', 'restore', 'translate', 'scale', 'drawImage']
      .map(key => [key, (...args) => calls.push([key, ...args])]));
    assert.equal(drawUserCastePoseV87(context, actor, image), true);
    assert.deepEqual(calls, [
      ['save'], ['translate', 399, 642], ['scale', facing, 1],
      ['drawImage', image, -.60 * 318, -(894 / 1024) * 212, 318, 212], ['restore']
    ]);
    const pixelFootX = .60 * 318;
    const pixelFootY = (894 / 1024) * 212;
    assert.equal(399 + facing * (calls[3][2] + pixelFootX), 399, 'horizontal feet anchor survives mirroring');
    assert.equal(642 + calls[3][3] + pixelFootY, 642, 'feet remain on the actor ground');
  }
});

test('V92 incomplete or wrong-sized images, dead actors and unknown identities never draw borrowed frames', () => {
  const actor = createUserCasteActorV87({ profileId: smasherId, id: 'revision-loading' }, 642);
  const ready = { complete: true, naturalWidth: 1536, naturalHeight: 1024 };
  const context = new Proxy({}, { get: (_, key) => () => assert.fail('unexpected canvas call: ' + String(key)) });
  for (const image of [null, { complete: false }, { complete: true, naturalWidth: 0, naturalHeight: 0 },
    { complete: true, naturalWidth: 1024, naturalHeight: 1024 }]) {
    assert.equal(isUserCasteImageReadyV87(image, revised), false);
    assert.equal(drawUserCastePoseV87(context, actor, image), false);
  }
  assert.equal(drawUserCastePoseV87(context, { ...actor, alive: false }, ready), false);
  assert.equal(drawUserCastePoseV87(context, { ...actor, profileId: 'Smasher' }, ready), false);
});

test('V92 build permits only the accepted revision PNG and excludes private candidates and prompts', () => {
  const filter = createBuildAssetFilter(projectRoot);
  for (const path of [revisedPath, ...ENEMY_USER_CASTES_ORIGINALS_V87.map(entry => entry.path)]) {
    assert.equal(filter(join(projectRoot, path.slice(1))), true, path);
  }
  for (const path of [
    'assets/openai/sprites/static-enemy-v92/unreviewed.png',
    'assets/openai/sprites/static-enemy-v92/game_avp_capcom_smasher-copy.png',
    'assets/openai/sprites/static-enemy-v92/game_avp_capcom_smasher.webp',
    'assets/openai/sprites/static-enemy-v92/candidates/game_avp_capcom_smasher.png',
    'assets/openai/sprites/static-enemy-v92/game_mantis_kenner.png',
    'docs/references/v91-enemy-only',
    'docs/references/v91-enemy-only/pass-v92',
    'docs/references/v91-enemy-only/pass-v92/candidates/game_avp_capcom_smasher.png',
    'docs/references/v91-enemy-only/pass-v92/prompts/smasher.txt',
    'docs/references/V91_PRIVATE_REVIEW/pass-v92/mantis.png'
  ]) assert.equal(filter(join(projectRoot, path)), false, path);
});
