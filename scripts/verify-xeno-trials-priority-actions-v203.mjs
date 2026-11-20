import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96, XENO_TRIALS_FIGHTERS_V96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-combat-contract-v186.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';
import { XENO_TRIALS_PRIORITY_ATLASES_V203 as atlases, getXenoTrialsRuntimeActionAtlases } from '../src/xeno-trials-action-atlas-v199.js';
import { drawXenoTrialsRuntimeActionAtlas, getXenoTrialsRuntimeSpriteAtlas } from '../src/xeno-trials-sprite-atlas-v191.js';
import { getXenoTrialsRuntimeAnimationCoverage } from '../src/xeno-trials-animation-coverage-v199.js';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { verifyXenoPriorityAdmissionsV203 } from './public-xeno-priority-admissions-v203.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

const root = new URL('../', import.meta.url);
const scenarios = [
  ['chrysalis', 'light'], ['chrysalis', 'heavy'], ['razor-claws', 'light'], ['razor-claws', 'heavy'],
  ['armored-joe', 'special'], ['synth-good-boy', 'special']
];

test('four V203 plates retain verified originals and opaque attachment and support pixels', async () => {
  const receipt = await verifyXenoPriorityAdmissionsV203(fileURLToPath(root));
  assert.deepEqual([receipt.images, receipt.poses], [4, 24]);
  for (const atlas of atlases) {
    const path = atlas.texture.path.slice(1);
    assert.equal(isPublicDistributionPathV86(path, { built: true }), true);
    const png = auditWeaponPngV120(fileURLToPath(new URL(path, root)));
    for (const { id, rect: [x, y], pelvis, supports } of atlas.frames) {
      for (const [dx, dy] of [pelvis, ...supports]) {
        assert.ok(png.pixelAlpha(x + dx, y + dy) >= 128, `${atlas.fighterId}/${id}`);
      }
    }
  }
  assert.equal(isPublicDistributionPathV86('assets/openai/sprites/xeno-trials-v203/study.png', { built: true }), false);
});

for (const [id, action] of scenarios) test(`${id}: the native ${action} input selects the V203 silhouette within its own windows`, () => {
  const air = action !== 'special', atlas = atlases.find(entry => entry.fighterId === id);
  assert.ok(atlas);
  const match = createXenoTrialsMatchV96({ playerId: id, opponentId: 'runner', introSeconds: 0 });
  const [fighter, target] = match.fighters;
  // Declared starting positions select rear-free air or valid native special contact.
  if (!air) [fighter.x, target.x] = id === 'armored-joe' ? [390, 610] : [310, 690];
  const start = fighter.x, definition = getXenoTrialsFighterV96(id), art = getXenoTrialsArtV96(id);
  const spec = getXenoTrialsAttackV147(definition, action, XENO_TRIALS_ATTACKS_V96[action]);
  const metrics = getXenoTrialsRenderMetricsV110(id), seen = new Set(), projectiles = new Set();
  const image = { naturalWidth: atlas.texture.width, naturalHeight: atlas.texture.height, complete: true };
  const images = new Map([[atlas.texture.path, image]]);
  let drawn;
  const canvas = { save() {}, restore() {}, translate() {}, scale() {}, drawImage(...args) { drawn = args.slice(0, 5); } };
  for (let tick = 0; tick < 210; tick++) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, { jump: air && tick === 0, [action]: tick === (air ? 12 : 0) }, {});
    for (const projectile of match.projectiles) projectiles.add(projectile.id);
    const before = JSON.stringify(match);
    const paint = drawXenoTrialsRuntimeActionAtlas(canvas, fighter, art, images, { spec, metrics, tick: match.tick });
    assert.equal(JSON.stringify(match), before);
    if (!paint) continue;
    const view = paint.spriteAtlasV203;
    assert.equal(view.attackId, fighter.attack.id);
    assert.equal(view.attackAge, fighter.attack.age);
    assert.equal(view.grounded, !air);
    assert.equal(view.renderTick, match.tick);
    assert.deepEqual(drawn, [image, ...view.sourceRect]);
    assert.ok(paint.bounds.bottom <= 450 + 1e-8);
    seen.add(view.frameId);
  }
  assert.deepEqual([...seen], atlas.frames.filter(frame => !air || frame.id.startsWith(`air-${action}-`)).map(frame => frame.id));
  if (!air) {
    assert.equal(fighter.stats.specials, 1);
    assert.equal(fighter.stats.hits, 1);
    assert.equal(fighter.stats.damage, id === 'armored-joe' ? 37 : 35);
    assert.equal(fighter.x - start, id === 'armored-joe' ? 52.5 : 0);
    assert.equal(projectiles.size, id === 'synth-good-boy' ? 1 : 0);
  }
});

test('V203 coverage preserves Chrysalis combat, admits the exact Razor Claws plate and distinguishes defense from drawings', () => {
  const chrysalis = getXenoTrialsFighterV96('chrysalis'), chrysalisArt = getXenoTrialsArtV96(chrysalis.id);
  assert.equal(getXenoTrialsRuntimeSpriteAtlas(chrysalis, chrysalisArt).kind, 'combat');
  assert.equal(getXenoTrialsRuntimeActionAtlases(chrysalis, chrysalisArt)[0].kind, 'air-combat');
  const razor = getXenoTrialsFighterV96('razor-claws'), razorArt = getXenoTrialsArtV96(razor.id);
  assert.equal(getXenoTrialsRuntimeActionAtlases(razor, razorArt)[0].revision, 203);
  assert.deepEqual(getXenoTrialsRuntimeActionAtlases(razor, { ...razorArt, sha256: '0'.repeat(64) }), []);
  const coverage = XENO_TRIALS_FIGHTERS_V96.map(getXenoTrialsRuntimeAnimationCoverage);
  assert.equal(coverage.filter(entry => entry.hasDrawnGestures).length, 35);
  assert.equal(coverage.filter(entry => entry.states.guard.sources.some(source => source.revision === 203)).length, 20);
  assert.ok(coverage.every(entry => !entry.fullAnimation && !entry.canonExact));
});
