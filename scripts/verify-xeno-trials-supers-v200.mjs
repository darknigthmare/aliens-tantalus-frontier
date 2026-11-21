import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { XENO_TRIALS_SUPERS_V148, getXenoTrialsSuperV148 } from '../src/xeno-trials-supers-v148.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';
import { XENO_TRIALS_SUPER_ATLASES_V200 as atlases, getXenoTrialsRuntimeActionAtlas } from '../src/xeno-trials-action-atlas-v199.js';
import { drawXenoTrialsRuntimeActionAtlas as draw } from '../src/xeno-trials-sprite-atlas-v191.js';
import { getXenoTrialsRuntimeAnimationCoverage } from '../src/xeno-trials-animation-coverage-v199.js';
import { verifyXenoSuperAdmissionsV200 } from './public-xeno-super-admissions-v200.mjs';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';

test('all five native supers have identity-bound drawn coverage and exact distribution admission', async () => {
  const receipt = await verifyXenoSuperAdmissionsV200(fileURLToPath(new URL('../', import.meta.url)));
  assert.deepEqual([receipt.images, receipt.poses], [3, 16]);
  assert.equal(isPublicDistributionPathV86('assets/openai/sprites/xeno-trials-v200/draft.png', { built: true }), false);
  for (const { id, fighterId, profileId } of XENO_TRIALS_SUPERS_V148) {
    const fighter = getXenoTrialsFighterV96(fighterId), art = getXenoTrialsArtV96(fighterId);
    const atlas = getXenoTrialsRuntimeActionAtlas(fighter, art);
    assert.equal(atlas?.profileId, profileId);
    assert.equal(atlas?.superId, id);
    assert.equal(getXenoTrialsRuntimeActionAtlas({ ...fighter, profileId: 'foreign' }, art), null);
    const coverage = getXenoTrialsRuntimeAnimationCoverage(fighter);
    assert.equal(coverage.states.super.renderKind, 'drawn');
    assert.equal(coverage.fullAnimation, false);
  }
});

for (const atlas of atlases) test(`${atlas.superId} visually follows every reachable phase of one native super`, () => {
  const { fighterId } = atlas;
  const match = createXenoTrialsMatchV96({ playerId: fighterId, opponentId: 'queen', introSeconds: 0, holdRoundTransition: true });
  const actor = match.fighters[0], art = getXenoTrialsArtV96(fighterId);
  // Scoped visual test double. Meter earning is verified separately in Chromium.
  actor.superMeterV148 = 100;
  const spec = getXenoTrialsSuperV148(getXenoTrialsFighterV96(fighterId)).spec;
  const metrics = getXenoTrialsRenderMetricsV110(fighterId);
  const png = { naturalWidth: atlas.texture.width, naturalHeight: atlas.texture.height, complete: true };
  const images = new Map([[atlas.texture.path, png]]), calls = [];
  const ctx = { save() {}, restore() {}, translate() {}, scale() {}, drawImage(...args) { calls.push(args); } };
  const seen = new Set(), volleys = new Set();
  let emittedVolleys = 0;
  for (let tick = 0; tick < 280; tick++) {
    stepXenoTrialsMatchV96(match, XENO_TRIALS_STEP_V96, { super: tick === 0 }, {});
    const previous = JSON.stringify(match);
    const drawn = draw(ctx, actor, art, images, { tick: match.tick, spec, metrics });
    assert.equal(JSON.stringify(match), previous);
    // A close-range projectile can be created and consumed on the same tick.
    emittedVolleys = Math.max(emittedVolleys, actor.attack?.volleysV148 || 0);
    for (const shot of match.projectiles) if (shot.superIdV148 === atlas.superId) volleys.add(shot.volleyV148);
    if (!drawn) continue;
    const phase = drawn.spriteAtlasV200;
    assert.ok(phase.drawn && actor.hp > 0 && actor.attack?.kind === 'super');
    assert.equal(phase.attackId, actor.attack.id);
    assert.equal(phase.supportMode, actor.y > 0 ? 'free' : 'grounded');
    assert.deepEqual(calls.at(-1).slice(0, 5), [png, ...phase.sourceRect]);
    assert.ok(drawn.bounds.bottom <= 450 + 1e-8);
    if (phase.frameId === 'super-active-free') assert.ok(actor.attack.launchedV147 && actor.y > 0);
    if (phase.frameId === 'super-active-ground') assert.ok(actor.attack.launchedV147 && actor.y === 0);
    seen.add(phase.frameId);
  }
  assert.deepEqual([...seen], atlas.frames.map(frame => frame.id));
  assert.equal(actor.stats.supersV148, 1);
  assert.equal(actor.superMeterV148, 0);
  if (atlas.superId === 'exploder-terminal-burst') {
    assert.equal(actor.hp, 0);
    assert.equal(match.events.filter(event => event.type === 'xeno-detonation').length, 1);
  }
  if (atlas.superId === 'warden-acid-barrage') {
    assert.equal(emittedVolleys, 2);
    assert.ok(volleys.has(1));
  }
});
