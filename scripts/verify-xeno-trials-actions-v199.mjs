import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { getXenoTrialsArtV96 as art, getXenoTrialsFighterV96 as definition, XENO_TRIALS_FIGHTERS_V96 as fighters } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_ATTACKS_V96 as attacks, XENO_TRIALS_STEP_V96 as step } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsAttackV147 } from '../src/xeno-trials-signatures-v147.js';
import { getXenoTrialsRenderMetricsV110 } from '../src/xeno-trials-scale-v110.js';
import { getXenoTrialsActionAtlasV199 as getAtlas, sampleXenoTrialsActionFrameV199 as sample,
  XENO_TRIALS_ACTION_ATLASES_V199 as atlases } from '../src/xeno-trials-action-atlas-v199.js';
import { drawXenoTrialsActionAtlasV199 as draw } from '../src/xeno-trials-sprite-atlas-v191.js';
import { getXenoTrialsAnimationCoverageV199 as coverage } from '../src/xeno-trials-animation-coverage-v199.js';
import { isPublicDistributionPathV86 } from './verify-public-release-v86.mjs';
import { verifyXenoActionAdmissionsV199 } from './public-xeno-action-admissions-v199.mjs';

function verifyDraws(atlas, action, firstInput, prepare = () => {}) {
  const match = createXenoTrialsMatchV96({ playerId: atlas.fighterId, opponentId: 'queen', introSeconds: 0, roundSeconds: 30 });
  const fighter = match.fighters[0], source = art(fighter.id);
  // A declared visual contract fixture. The engine still owns input admission,
  // attack age, effects, jump impulse and spending.
  prepare(fighter);
  const seen = new Set(), calls = [], ctx = { save() {}, translate() {}, scale() {}, restore() {}, drawImage(...args) { calls.push(args); } };
  const image = { naturalWidth: atlas.texture.width, naturalHeight: atlas.texture.height, complete: true };
  const images = new Map([[atlas.texture.path, image]]);
  const spec = getXenoTrialsAttackV147(definition(fighter.id), action, attacks[action]);
  for (let tick = 0; tick < 300; tick++) {
    stepXenoTrialsMatchV96(match, step, firstInput(tick), {});
    if (fighter.attack?.kind !== action) continue;
    const before = JSON.stringify(match), options = { spec, tick: match.tick, metrics: getXenoTrialsRenderMetricsV110(fighter.id) };
    const result = draw(ctx, fighter, source, images, options);
    assert.equal(JSON.stringify(match), before);
    if (!result) continue;
    const receipt = result.spriteAtlasV199;
    assert.equal(receipt.attackId, fighter.attack.id);
    assert.equal(receipt.attackAge, fighter.attack.age);
    assert.equal(receipt.renderTick, match.tick);
    assert.deepEqual(calls.at(-1).slice(0, 5), [image, ...receipt.sourceRect]);
    if (atlas.kind === 'air-combat') {
      assert.ok(fighter.y > 0);
      assert.equal(receipt.supportMode, 'free');
      assert.ok(result.bounds.bottom <= 450 + 1e-8);
    } else {
      assert.equal(receipt.superId, atlas.superId);
      assert.equal(receipt.grounded, true);
    }
    const reduced = sample(atlas, fighter, { spec, reducedMotion: true });
    if (atlas.kind === 'super') assert.match(reduced.frame.id, /-0$/);
    seen.add(receipt.frameId);
  }
  return seen;
}

test('four exact plates drive 24 distinct registered draw keys and the public build rejects drafts', async () => {
  const receipt = await verifyXenoActionAdmissionsV199(fileURLToPath(new URL('../', import.meta.url)));
  assert.deepEqual([receipt.images, receipt.poses], [4, 24]);
  assert.equal(isPublicDistributionPathV86('assets/openai/sprites/xeno-trials-v199/candidate.png', { built: true }), false);
  for (const atlas of atlases) {
    assert.equal(getAtlas(definition(atlas.fighterId), art(atlas.fighterId)), atlas);
    assert.equal(getAtlas(definition(atlas.fighterId), { ...art(atlas.fighterId), sha256: '0'.repeat(64) }), null);
    assert.equal(isPublicDistributionPathV86(atlas.texture.path.slice(1), { built: true }), true);
  }
});

test('Warrior and Runner use separate light and heavy keys in their accepted aerial windows', () => {
  for (const atlas of atlases.filter(entry => entry.kind === 'air-combat')) for (const action of ['light', 'heavy']) {
    const expected = atlas.frames.filter(frame => frame.id.startsWith(`air-${action}-`)).map(frame => frame.id);
    const frames = verifyDraws(atlas, action, tick => ({ jump: tick === 0, [action]: tick === 12 }));
    assert.deepEqual([...frames], expected, `${atlas.fighterId}/${action}`);
    assert.equal(sample(atlas, { id: atlas.fighterId, hp: 1, y: 0, attack: { kind: action, age: 0, facing: 1 } },
      { spec: attacks[action] }), null);
  }
});

test('two supers use all six grounded frames of their accepted native attack', () => {
  for (const atlas of atlases.filter(entry => entry.kind === 'super')) {
    const seen = verifyDraws(atlas, 'super', tick => ({ super: tick === 0 }), fighter => { fighter.superMeterV148 = 100; });
    assert.deepEqual([...seen], atlas.frames.map(frame => frame.id), atlas.fighterId);
    const unsupported = { id: atlas.fighterId, hp: 1, y: 10, attack: { kind: 'super', age: 0, facing: 1 } };
    assert.equal(sample(atlas, unsupported, { spec: getXenoTrialsAttackV147(definition(atlas.fighterId), 'super') }), null);
  }
});

test('new attack and articulated receipts extend the current roster without exaggerating its coverage', () => {
  const entries = fighters.map(({ id }) => coverage(id));
  assert.equal(entries.length, 189);
  assert.equal(entries.filter(entry => entry.hasDrawnGestures).length, 26);
  assert.ok(entries.every(entry => !entry.fullAnimation && !entry.canonExact));
  assert.equal(entries.filter(entry => entry.states.presentation.sources.some(source => source.revision === 199)).length, 17);
  assert.equal(entries.filter(entry => entry.states.super?.renderKind === 'drawn').length, 2);
  for (const id of ['warrior', 'runner']) for (const action of ['light', 'heavy']) {
    const state = coverage(id).states[action];
    assert.equal(state.frameIds.length, 3);
    assert.ok(state.limitations.includes('airborne-only'));
  }
});
