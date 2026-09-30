import { ENEMY_USER_CREATIONS_V95 as USER_ADDITIONS } from '../src/enemy-user-creations-v95.js';
import { ENEMY_ADDITIONAL_POSES_V94 as ADDITIONAL } from '../src/enemy-additional-poses-v94.js';
import { ENEMY_DEDICATED_POSES_V99 as DEDICATED } from '../src/enemy-dedicated-poses-v99.js';
import { ENEMY_STATIC_POSES_V96 as CURRENT_STATIC } from '../src/enemy-static-poses-v96.js';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { auditPngBuffer } from '../docs/references/v91-enemy-only/audit-candidate-png.mjs';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';
import { BIOFORGE_TERRESTRIAL_ROSTER_V80, getBioforgeRosterEntryV80 } from '../src/bioforge-session-v80.js';
import { getCatalogEntryV62 } from '../src/catalog-runtime-v62.js';
import { ENEMIES } from '../src/content-core-v50.js';
import { ENEMY_SPRITE_REVISIONS_V92, applyEnemySpriteRevisionV92 } from '../src/enemy-sprite-revisions-v92.js';
import { ENEMY_SPRITE_REVISIONS_V93, applyEnemySpriteRevisionV93 } from '../src/enemy-sprite-revisions-v93.js';
import { createUserCampaignActorV88 } from '../src/enemy-user-campaign-runtime-v88.js';
import { ENEMY_ENCYCLOPEDIA_CATALOG_V88, getEnemyUserCampaignV88 } from '../src/enemy-user-campaign-v88.js';
import { ENEMY_USER_CASTES_ORIGINALS_V87, ENEMY_USER_CASTES_V87, getEnemyUserCasteV87 } from '../src/enemy-user-castes-v87.js';
import { createUserCasteActorV87, drawUserCastePoseV87, isUserCasteImageReadyV87 } from '../src/enemy-user-pose-runtime-v87.js';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const chrysalisId = 'castes-game_avp_capcom_chrysalis';
const smasherId = 'castes-game_avp_capcom_smasher';
const originalPath = '/assets/user/castes-v87/game_avp_capcom_chrysalis.png';
const revisedPath = '/assets/openai/sprites/static-enemy-v93/game_avp_capcom_chrysalis.png';
const revisedImageKey = 'openai-static-v93:game_avp_capcom_chrysalis';
const originalSha256 = 'adfbb16a1a28996d4e0668b8be5c9ed66e105bd5f8e43f0e226b1deea1e46a8b';
const revisedSha256 = '616aeca6329e615cd42be6324d50de450d22b62d8950c7891acaf56e4a70abb7';
const original = ENEMY_USER_CASTES_ORIGINALS_V87.find(entry => entry.id === chrysalisId);
const revised = getEnemyUserCasteV87(chrysalisId);

test('V93 keeps the original Chrysalis bytes and admits a distinct transparent RGBA PNG', async () => {
  const receipt = JSON.parse(await readFile(new URL('../docs/references/user-castes-v87-integrity.json', import.meta.url)));
  const row = receipt.files.find(entry => entry.name === 'game_avp_capcom_chrysalis.png');
  assert.equal(receipt.count, 35);
  assert.equal(receipt.bytes, 64396633);
  assert.equal(row.sha256, originalSha256);
  assert.equal(original.path, originalPath);
  assert.equal(revised.originalPath, originalPath);
  assert.equal(revised.path, revisedPath);
  const oldBytes = await readFile(join(projectRoot, originalPath.slice(1)));
  assert.equal(oldBytes.length, row.bytes);
  assert.equal(createHash('sha256').update(oldBytes).digest('hex'), originalSha256);
  const bytes = await readFile(join(projectRoot, revisedPath.slice(1)));
  const audit = auditPngBuffer(bytes);
  assert.equal(audit.sha256, revisedSha256);
  assert.equal(bytes.length, 1364066);
  assert.equal(audit.width, 1536);
  assert.equal(audit.height, 1024);
  assert.equal(audit.format, 'RGBA8 non-interlaced');
  assert.equal(audit.alphaMin, 0);
  assert.ok(audit.alphaMax >= 250);
  assert.ok(audit.alpha0 > audit.totalPixels / 2, 'transparent surround, not a flattened black background');
  assert.ok(audit.alphaAtLeast16 > 0, 'visible subject is present');
  for (const margin of Object.values(audit.marginsAlphaAtLeast16)) assert.ok(margin > 0, 'visible subject does not touch a canvas edge');
  assert.notEqual(originalSha256, revisedSha256);
});

test('V93 composes exactly Chrysalis and the unchanged V92 Smasher while retaining 33 identical imports', () => {
  assert.equal(ENEMY_SPRITE_REVISIONS_V92.length, 1);
  assert.equal(ENEMY_SPRITE_REVISIONS_V93.length, 1);
  assert.equal(ENEMY_SPRITE_REVISIONS_V93[0].profileId, chrysalisId);
  assert.deepEqual(ENEMY_USER_CASTES_V87.map(entry => entry.id), ENEMY_USER_CASTES_ORIGINALS_V87.map(entry => entry.id));
  assert.equal(ENEMY_USER_CASTES_V87.length, 35);
  const snapshot = JSON.stringify(ENEMY_USER_CASTES_ORIGINALS_V87);
  let unchanged = 0;
  for (const source of ENEMY_USER_CASTES_ORIGINALS_V87) {
    const actual = getEnemyUserCasteV87(source.id);
    assert.ok(Object.isFrozen(source));
    if (source.id === chrysalisId) {
      assert.notEqual(actual, source);
      assert.deepEqual(applyEnemySpriteRevisionV93(source), actual);
      assert.equal(applyEnemySpriteRevisionV92(source), source);
    } else if (source.id === smasherId) {
      assert.deepEqual(actual, applyEnemySpriteRevisionV92(source));
      assert.deepEqual(actual, applyEnemySpriteRevisionV93(source));
      assert.equal(actual.sha256, '0efaa9b6afe6f817567725d7aae0b57c15093d1f68a8e480bb34ede566c7dee8');
      assert.equal(actual.visualRevision, 92);
      assert.equal(actual.renderWidth, 318);
      assert.deepEqual(actual.pivot, { x: .60, y: 894 / 1024 });
    } else {
      unchanged += 1;
      assert.equal(actual, source, source.id);
      assert.equal(applyEnemySpriteRevisionV93(source), source, source.id);
    }
  }
  assert.equal(unchanged, 33);
  for (const id of ['enemy-005-warrior', chrysalisId + ':0', ' ' + chrysalisId, '__proto__', 'Chrysalis']) {
    const unrelated = Object.freeze({ ...original, id, profileId: chrysalisId, name: 'Chrysalis' });
    assert.equal(applyEnemySpriteRevisionV93(unrelated), unrelated, id);
  }
  assert.equal(JSON.stringify(ENEMY_USER_CASTES_ORIGINALS_V87), snapshot);
  assert.equal(ENEMIES.length, 571);
  assert.equal(ENEMY_ENCYCLOPEDIA_CATALOG_V88.length, 571 + CURRENT_STATIC.length);
  assert.equal(BIOFORGE_TERRESTRIAL_ROSTER_V80.length, 11 + CURRENT_STATIC.length + DEDICATED.filter(pose => pose.bioforgeEligible !== false).length);
});

test('V93 changes only reviewed art and feet anchoring, never identity, combat or collision', () => {
  const visualKeys = new Set(['path', 'imageKey', 'sourceWidth', 'sourceHeight', 'renderWidth', 'renderHeight',
    'pivot', 'sourceFacing', 'identityStatus', 'provenance', 'reviewStatus', 'assetVerificationStatus']);
  for (const key of Object.keys(original)) if (!visualKeys.has(key)) assert.deepEqual(revised[key], original[key], key);
  assert.deepEqual([revised.health, revised.damage, revised.speed, revised.armor, revised.cost, revised.bodyWidth, revised.bodyHeight],
    [240, 24, .8, 24, 4, 94, 100]);
  assert.equal(revised.originalImageKey, original.imageKey);
  assert.equal(revised.originalProvenance, 'fan-made-user-import');
  assert.equal(revised.provenance, 'openai-integrated-reference-guided');
  assert.equal(revised.reviewStatus, 'accepted-static-adaptation');
  assert.equal(revised.identityStatus, 'reference-guided-static-pose');
  assert.equal(revised.assetVerificationStatus, 'sha256-dimensions-alpha-verified');
  assert.equal(revised.canonExact, false);
  assert.equal(revised.identityVerified, false);
  assert.equal(revised.animationStatus, 'missing');
  assert.equal(revised.visualMode, 'static-pose');
  assert.equal(revised.visualRevision, 93);
  assert.equal(revised.sha256, revisedSha256);
  assert.equal(revised.imageKey, revisedImageKey);
  assert.notEqual(revised.imageKey, original.imageKey, 'the previous in-memory image cannot satisfy the new cache key');
  assert.deepEqual(revised.pivot, { x: .64, y: 851 / 1024 });
  assert.deepEqual([revised.sourceWidth, revised.sourceHeight, revised.renderWidth, revised.renderHeight, revised.sourceFacing],
    [1536, 1024, 384, 256, 1]);
  assert.equal(revised.renderWidth / revised.renderHeight, revised.sourceWidth / revised.sourceHeight);
  assert.ok(Object.isFrozen(revised));
  assert.ok(Object.isFrozen(revised.pivot));
  assert.ok(Object.isFrozen(revised.referenceUrls));
  assert.ok(revised.referenceUrls.length > 0);
});

test('V93 mission, encyclopedia and BIOFORGE use the same full Chrysalis PNG and independent image key', () => {
  const mission = getEnemyUserCampaignV88(chrysalisId);
  const catalog = getCatalogEntryV62(chrysalisId);
  const lab = getBioforgeRosterEntryV80(chrysalisId);
  for (const entry of [mission, lab]) {
    assert.equal(entry.profileId, chrysalisId);
    assert.equal(entry.path, revisedPath);
    assert.equal(entry.imageKey, revisedImageKey);
    assert.equal(entry.originalPath, originalPath);
    assert.equal(entry.canonExact, false);
    assert.equal(entry.animationStatus, 'missing');
  }
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
  for (const actor of [createUserCampaignActorV88(mission, { x: 350, y: 530, h: 112, alive: true }, 2),
    createUserCasteActorV87({ profileId: chrysalisId, id: 'chrysalis-lab' }, 642)]) {
    assert.equal(actor.profileId, chrysalisId);
    assert.equal(actor.visualImageKey, revisedImageKey);
    assert.equal(actor.visualSheetId, null);
    assert.equal(actor.maxHealth, 240);
    assert.equal(actor.damage, 24);
    assert.deepEqual([actor.w, actor.h], [94, 100]);
    assert.equal(actor.y + actor.h, 642);
  }
});

test('V93 draws one complete native frame in both orientations with feet fixed to the ground', () => {
  const actor = createUserCasteActorV87({ profileId: chrysalisId, id: 'chrysalis-draw' }, 642);
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
      ['save'], ['translate', 397, 642], ['scale', facing, 1],
      ['drawImage', image, -.64 * 384, -(851 / 1024) * 256, 384, 256], ['restore']
    ]);
    assert.equal(397 + facing * (calls[3][2] + .64 * 384), 397);
    assert.equal(642 + calls[3][3] + (851 / 1024) * 256, 642);
  }
});

test('V93 incomplete or wrong-sized images, dead actors and guessed identities draw no borrowed frame', () => {
  const actor = createUserCasteActorV87({ profileId: chrysalisId, id: 'chrysalis-loading' }, 642);
  const ready = { complete: true, naturalWidth: 1536, naturalHeight: 1024 };
  const context = new Proxy({}, { get: (_, key) => () => assert.fail('unexpected canvas call: ' + String(key)) });
  for (const image of [null, { complete: false }, { complete: true, naturalWidth: 0, naturalHeight: 0 },
    { complete: true, naturalWidth: 1024, naturalHeight: 1024 }]) {
    assert.equal(isUserCasteImageReadyV87(image, revised), false);
    assert.equal(drawUserCastePoseV87(context, actor, image), false);
  }
  assert.equal(drawUserCastePoseV87(context, { ...actor, alive: false }, ready), false);
  assert.equal(drawUserCastePoseV87(context, { ...actor, profileId: 'Chrysalis' }, ready), false);
});

test('V93 build accepts only the reviewed exact PNG and retains the existing Smasher whitelist', async () => {
  const filter = createBuildAssetFilter(projectRoot);
  for (const path of [revisedPath, ENEMY_SPRITE_REVISIONS_V92[0].path, ...ENEMY_USER_CASTES_ORIGINALS_V87.map(entry => entry.path)]) {
    assert.equal(filter(join(projectRoot, path.slice(1))), true, path);
  }
  for (const path of [
    'assets/openai/sprites/static-enemy-v93/unreviewed.png',
    'assets/openai/sprites/static-enemy-v93/game_avp_capcom_chrysalis-copy.png',
    'assets/openai/sprites/static-enemy-v93/game_avp_capcom_chrysalis.webp',
    'assets/openai/sprites/static-enemy-v93/candidates/game_avp_capcom_chrysalis.png',
    'assets/openai/sprites/static-enemy-v93/game_avp_capcom_smasher.png',
    'assets/openai/sprites/static-enemy-v92/game_avp_capcom_chrysalis.png',
    'docs/references/v91-enemy-only/pass-v93',
    'docs/references/v91-enemy-only/pass-v93/chrysalis.png',
    'docs/references/v91-enemy-only/pass-v93/GENERATIONS.json'
  ]) assert.equal(filter(join(projectRoot, path)), false, path);
  const serviceWorker = await readFile(join(projectRoot, 'sw.js'), 'utf8');
  assert.ok(serviceWorker.includes("'/src/enemy-sprite-revisions-v92.js'"));
  assert.ok(serviceWorker.includes("'/src/enemy-sprite-revisions-v93.js'"));
});
