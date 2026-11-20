import assert from 'node:assert/strict';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96, XENO_TRIALS_FIGHTERS_V96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { XENO_TRIALS_ATTACKS_V96 } from '../src/xeno-trials-combat-contract-v186.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';
import { XENO_TRIALS_PRIORITY_ATLASES_V202 as atlases, getXenoTrialsActiveActionAtlas } from '../src/xeno-trials-action-atlas-v199.js';
import { drawXenoTrialsRuntimeActionAtlas, getXenoTrialsRuntimeSpriteAtlas } from '../src/xeno-trials-sprite-atlas-v191.js';
import { getXenoTrialsRuntimeAnimationCoverage } from '../src/xeno-trials-animation-coverage-v199.js';
import { auditWeaponPngV120 } from './audit-weapon-png-v120.mjs';
import { verifyXenoPriorityAdmissionsV202 } from './public-xeno-priority-admissions-v202.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

const root = new URL('../', import.meta.url);

test('the public build admits exactly four measured V202 drawings and all 24 opaque pose roots', async () => {
  const { images, poses } = await verifyXenoPriorityAdmissionsV202(fileURLToPath(root));
  assert.deepEqual([images, poses], [4, 24]);
  for (const atlas of atlases) {
    const path = atlas.texture.path.slice(1);
    assert.ok(isPublicDistributionPathV86(path, { built: true }));
    const png = auditWeaponPngV120(fileURLToPath(new URL(path, root)));
    for (const { id, rect: [x, y], pelvis, supports } of atlas.frames) {
      for (const [dx, dy] of [pelvis, ...supports]) assert.ok(png.pixelAlpha(x + dx, y + dy) >= 128, `${atlas.fighterId}/${id}`);
    }
  }
  assert.equal(isPublicDistributionPathV86('assets/openai/sprites/xeno-trials-v202/study.png', { built: true }), false);
});

const scenarios = [
  ['prowler', 'light'], ['prowler', 'heavy'], ['ravager', 'light'], ['ravager', 'heavy'],
  ['rhino', 'special'], ['synth-heavy', 'special']
];

for (const [id, action] of scenarios) test(`${id} draws each V202 ${action} phase from accepted native input`, () => {
  const air = action !== 'special';
  const atlas = atlases.find(entry => entry.fighterId === id);
  assert.ok(atlas);
  const match = createXenoTrialsMatchV96({ playerId: id, opponentId: 'runner', introSeconds: 0 });
  const [fighter, target] = match.fighters;
  // Fixed positions for the two contact assertions. The engine owns attack
  // admission, projectile creation, contact and all movement thereafter.
  if (!air) { fighter.x = 310; target.x = 690; }
  const start = fighter.x;
  const definition = getXenoTrialsFighterV96(id), art = getXenoTrialsArtV96(id);
  const spec = getXenoTrialsAttackV147(definition, action, XENO_TRIALS_ATTACKS_V96[action]);
  const metrics = getXenoTrialsRenderMetricsV110(id), seen = new Set(), projectileIds = new Set();
  const { width, height } = atlas.texture;
  const image = { naturalWidth: width, naturalHeight: height, complete: true };
  const images = new Map([[atlas.texture.path, image]]);
  let last;
  const canvas = { save() {}, restore() {}, translate() {}, scale() {}, drawImage(...args) { last = args.slice(0, 5); } };
  for (let tick = 0; tick < 210; tick++) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, { jump: air && tick === 0, [action]: tick === (air ? 10 : 0) }, {});
    for (const projectile of match.projectiles) projectileIds.add(projectile.id);
    const before = JSON.stringify(match);
    const painted = drawXenoTrialsRuntimeActionAtlas(canvas, fighter, art, images, { spec, metrics, tick: match.tick });
    assert.equal(JSON.stringify(match), before);
    if (!painted) continue;
    const receipt = painted.spriteAtlasV202;
    assert.equal(receipt.attackId, fighter.attack.id);
    assert.equal(receipt.attackAge, fighter.attack.age);
    assert.equal(receipt.grounded, !air);
    assert.equal(receipt.renderTick, match.tick);
    assert.deepEqual(last, [image, ...receipt.sourceRect]);
    assert.ok(painted.bounds.bottom <= 450 + 1e-8);
    seen.add(receipt.frameId);
  }
  assert.deepEqual([...seen], atlas.frames.filter(frame => !air || frame.id.startsWith(`air-${action}-`)).map(frame => frame.id));
  if (!air) {
    assert.equal(fighter.stats.specials, 1);
    assert.equal(fighter.stats.hits, 1);
    assert.equal(projectileIds.size, id === 'synth-heavy' ? 1 : 0);
    assert.equal(fighter.x > start, id === 'rhino');
  }
});

test('Prowler retains his separate leap and Trials coverage reflects the admitted drawings and rigs', () => {
  const definition = getXenoTrialsFighterV96('prowler'), art = getXenoTrialsArtV96('prowler');
  assert.equal(getXenoTrialsRuntimeSpriteAtlas(definition, art).primaryAction, 'leap');
  assert.equal(getXenoTrialsActiveActionAtlas({ ...definition, attack: { kind: 'special' } }, art), null);
  const coverage = XENO_TRIALS_FIGHTERS_V96.map(getXenoTrialsRuntimeAnimationCoverage);
  assert.equal(coverage.filter(entry => entry.drawnStates.some(action => action !== 'idle'
    && entry.states[action].sources.some(source => source.renderKind === 'drawn' && source.revision <= 202))).length, 32);
  assert.equal(coverage.filter(entry => entry.states.presentation.sources.some(source => source.revision === 202)).length, 28);
  assert.ok(coverage.every(entry => !entry.fullAnimation && !entry.canonExact));
  for (const [id, action] of scenarios) {
    const entry = getXenoTrialsRuntimeAnimationCoverage(id).states[action];
    assert.ok(entry.sources.some(source => source.revision === 202 && source.renderKind === 'drawn'));
    assert.ok(entry.limitations.includes(action === 'special' ? 'grounded-only' : 'airborne-only'));
  }
});
