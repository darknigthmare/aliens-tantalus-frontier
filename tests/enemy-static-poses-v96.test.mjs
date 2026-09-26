import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { ENEMY_STATIC_POSES_V95, getEnemyStaticPoseV95 } from '../src/enemy-static-poses-v95.js';
import { ENEMY_STATIC_POSES_V96, ENEMY_STATIC_POSE_IDS_V96, ENEMY_STATIC_POSE_PATHS_V96,
  getEnemyStaticPoseV96, getEnemyStaticPoseStateOptionsV96, getEnemyStaticPoseStatesV96,
  sanitizeEnemyStaticPoseStateV96, selectEnemyStaticPoseEncounterStateV96 } from '../src/enemy-static-poses-v96.js';
import { ENEMY_EXPANSION_ASSETS_V96 } from '../src/enemy-expansion-assets-v96.js';
import { ENEMY_EXPANSION_CANDIDATES_V96 } from '../src/enemy-expansion-candidates-v96.js';
import { ENEMY_ENCYCLOPEDIA_CATALOG_V88, getEnemyUserCampaignV88,
  isUserCasteCampaignAdmittedV95 } from '../src/enemy-user-campaign-v88.js';
import { getBioforgeRosterEntryV80, validateBioforgeSelectionV80 } from '../src/bioforge-session-v80.js';
import { getCatalogEntryV62 } from '../src/catalog-runtime-v62.js';
import { createUserCasteActorV87, drawUserCastePoseV87 } from '../src/enemy-user-pose-runtime-v87.js';
import { createUserCampaignActorV88 } from '../src/enemy-user-campaign-runtime-v88.js';
import { createBuildAssetFilter } from '../scripts/build-asset-filter.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const additions = ENEMY_STATIC_POSES_V96.slice(ENEMY_STATIC_POSES_V95.length);
test('V96 is append-only and historical identity objects remain unchanged', () => {
  assert.ok(additions.length >= ENEMY_EXPANSION_ASSETS_V96.length);
  assert.equal(new Set(ENEMY_STATIC_POSE_IDS_V96).size, ENEMY_STATIC_POSES_V96.length);
  assert.equal(new Set(ENEMY_STATIC_POSE_PATHS_V96).size, ENEMY_STATIC_POSE_PATHS_V96.length);
  ENEMY_STATIC_POSES_V95.forEach((d, index) => {
    assert.equal(ENEMY_STATIC_POSES_V96[index], d);
    assert.equal(getEnemyStaticPoseV96(d.id), getEnemyStaticPoseV95(d.id));
  });
  assert.equal(getEnemyStaticPoseV96({ id: additions[0].id }), null);
  assert.equal(getEnemyStaticPoseV96('__proto__'), null);
  for (const d of additions) assert.equal(getEnemyStaticPoseV96(` ${d.id}`), null);
});

test('V96 preserves the two Arachnoid colour states and the independent Defender', () => {
  const arachnoid = 'castes-game_avp_capcom_arachnoid';
  for (const colour of ['grey', 'purple']) {
    assert.equal(getEnemyStaticPoseV96(arachnoid, colour), getEnemyStaticPoseV95(arachnoid, colour));
    assert.equal(getEnemyStaticPoseV96(arachnoid, colour).id, arachnoid);
  }
  assert.notEqual(getEnemyStaticPoseV96('pose-v95-user-xeno-defender').id, arachnoid);
});

test('research-only candidates are never synthesized from names or metadata', () => {
  for (const candidate of ENEMY_EXPANSION_CANDIDATES_V96) {
    assert.equal(candidate.runtimeActive, false);
    if (!additions.some(d => d.id === candidate.id)) assert.equal(getEnemyStaticPoseV96(candidate.id), null);
  }
  assert.equal(getEnemyStaticPoseV96('Hammerpede'), null);
});

test('new measured identities enter bestiary and Bioforge but not automatic campaigns', () => {
  for (const d of additions) {
    assert.equal(getEnemyStaticPoseV96(d.id), d);
    assert.equal(ENEMY_ENCYCLOPEDIA_CATALOG_V88.filter(e => e.id === d.id).length, 1);
    assert.equal(getBioforgeRosterEntryV80(d.id).profileId, d.id);
    assert.equal(validateBioforgeSelectionV80({ profileId: d.id, quantity: 1 }).ok, true);
    const card = getCatalogEntryV62(d.id);
    assert.ok(card, d.id);
    assert.equal(card.visual.path, d.path);
    assert.equal(getEnemyUserCampaignV88(d.id).encounterStatus, 'bioforge-only');
    assert.equal(isUserCasteCampaignAdmittedV95(d), false);
    assert.equal(createUserCampaignActorV88(d, { x: 100, y: 500, h: 50 }, 0), null);
  }
});

test('new native images render whole at measured aspect ratio and fail closed when wrong', () => {
  for (const d of additions) {
    assert.equal(sanitizeEnemyStaticPoseStateV96(d.id, 'purple'), null);
    assert.equal(selectEnemyStaticPoseEncounterStateV96(d.id), null);
    assert.deepEqual(getEnemyStaticPoseStatesV96(d.id), []);
    assert.deepEqual(getEnemyStaticPoseStateOptionsV96(d.id), [{ id: '', label: 'Pose de base' }]);
    const actor = createUserCasteActorV87({ profileId: d.id, id: `qa-${d.id}` }, 600);
    const draws = [];
    const ctx = { save() {}, restore() {}, translate() {}, scale() {}, drawImage: (...args) => draws.push(args) };
    const image = { complete: true, naturalWidth: d.sourceWidth, naturalHeight: d.sourceHeight };
    assert.equal(actor.profileId, d.id);
    assert.equal(drawUserCastePoseV87(ctx, actor, image), true);
    assert.equal(draws[0].length, 5);
    assert.equal(draws[0][3] / draws[0][4], d.renderWidth / d.renderHeight);
    assert.equal(drawUserCastePoseV87(ctx, actor, { ...image, naturalWidth: 1 }), false);
  }
});

test('V96 shipped art is allowlisted and private production inputs stay excluded', async () => {
  const filter = createBuildAssetFilter(root);
  for (const d of additions) assert.equal(filter(fileURLToPath(new URL(`..${d.path}`, import.meta.url))), true);
  assert.equal(filter(fileURLToPath(new URL('../assets/openai/sprites/static-enemy-v96/unreviewed.png', import.meta.url))), false);
  assert.equal(filter(fileURLToPath(new URL('../docs/references/v96-xeno-trials/generation-pose-v96-film-hammerpede.json', import.meta.url))), false);
  const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  for (const module of ['enemy-static-poses-v96', 'enemy-expansion-assets-v96', 'enemy-dedicated-poses-v96'])
    assert.ok(sw.includes(`/src/${module}.js`));
});
