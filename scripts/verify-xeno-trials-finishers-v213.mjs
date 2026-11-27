import assert from 'node:assert/strict';
import test from 'node:test';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96 } from '../src/xeno-trials-engine-v96.js';
import { getXenoTrialsBodyGapV105, XENO_TRIALS_ARENA_V105 } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsFighterV96, getXenoTrialsArtV96 } from '../src/xeno-trials-data-v96.js';
import { activateXenoTrialsFinisherV207, advanceXenoTrialsFinisherV207, createXenoTrialsFinisherV207,
  getXenoTrialsFinisherViewV207, pauseXenoTrialsFinisherV207, skipXenoTrialsFinisherV207 } from '../src/xeno-trials-finishers-v207.js';
import { drawXenoTrialsContactStepV213 } from '../src/xeno-trials-finishers-v213.js';
import { drawXenoTrialsFloorLockTargetV207, sampleXenoTrialsFloorLockV207 } from '../src/xeno-trials-capture-v163.js';
import { drawXenoTrialsRigV154, getXenoTrialsRigV154, getXenoTrialsRuntimeArticulatedRig,
  getXenoTrialsRuntimeDefenseRig } from '../src/xeno-trials-rig-v154.js';
import { XENO_TRIALS_SPRITE_ATLASES_V191, XENO_TRIALS_SPRITE_ATLASES_V197 } from '../src/xeno-trials-sprite-atlas-v191.js';
import { XENO_TRIALS_SPRITE_ATLASES_V189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { XENO_TRIALS_SPRITE_ATLASES_V188 } from '../src/xeno-trials-sprite-atlas-v188.js';

const { floor } = XENO_TRIALS_ARENA_V105;
const dt = 1 / 120;
const supported = [
  ['chrysalis', 'crusher-acm', 6, 'light', 96],
  ['chrysalis', 'ravager', 55, 'light', 96],
  ['synth-trooper', 'user-brute', 6, 'light', 23],
  ['synth-trooper', 'ravager', 55, 'heavy', 96],
  ['synth-guard', 'user-brute', 6, 'light', 23],
  ['synth-guard', 'ravager', 55, 'heavy', 96]
];

function canvas() {
  const calls = [];
  return new Proxy({ calls, globalAlpha: 1, ellipse(...args) { assert.equal(args.length, 7); } }, {
    get: (object, key) => object[key] ?? ((...args) => calls.push([key, ...args]))
  });
}

const decoded = (width, height) => ({ complete: true, naturalWidth: width, naturalHeight: height });
function texturesFor(id) {
  const result = new Map([...XENO_TRIALS_SPRITE_ATLASES_V191, ...XENO_TRIALS_SPRITE_ATLASES_V197,
    ...XENO_TRIALS_SPRITE_ATLASES_V189, ...XENO_TRIALS_SPRITE_ATLASES_V188].map(({ texture }) =>
    [texture.path, decoded(texture.width, texture.height)]));
  const actor = getXenoTrialsFighterV96(id), art = getXenoTrialsArtV96(id);
  const rig = getXenoTrialsRuntimeArticulatedRig(actor, art) || getXenoTrialsRuntimeDefenseRig(actor, art) || getXenoTrialsRigV154(actor, art);
  result.set(rig.path, decoded(rig.sourceWidth, rig.sourceHeight));
  return result;
}

function earnVerdict(playerId, opponentId, range, action, seed) {
  const match = createXenoTrialsMatchV96({ playerId, opponentId, stageId: 'tantalus-bridge', roundsToWin: 1, seed,
    introSeconds: 0, rulesV119: { initialHp: 1, noSpecial: action !== 'special' } });
  for (let tick = 0; tick < 900 && match.phase === 'active'; tick++) {
    const [attacker, target] = match.fighters;
    const direction = target.x >= attacker.x ? 1 : -1;
    const approach = getXenoTrialsBodyGapV105(attacker, target, direction) > range && !attacker.attack;
    stepXenoTrialsMatchV96(match, dt, approach ? { [direction === 1 ? 'right' : 'left']: true } : { [action]: tick % 3 === 0 });
  }
  assert.equal(match.result?.winner, 'player');
  return match;
}

test('post-verdict restraints walk to measured support, lock at the true floor and return to the original root', () => {
  for (const [source, destination, range, action, seed] of supported) {
    const images = texturesFor(source);
    const match = earnVerdict(source, destination, range, action, seed);
    const original = structuredClone(match);
    const [attacker, target] = match.fighters;
    const offer = createXenoTrialsFinisherV207(match, images, false, true);
    assert.equal(offer.kind, 'contact-approach', `${source}/${destination}`);
    const active = activateXenoTrialsFinisherV207(offer, `${source}::fin1`);
    const { lock } = active;
    const { travel } = lock.approachV213;
    const at = ms => getXenoTrialsFinisherViewV207(advanceXenoTrialsFinisherV207(active, ms));
    const moving = at(travel / 2);
    assert.equal(moving.walkV213, true);
    assert.ok(moving.contactX > attacker.x && moving.contactX < lock.contactX);
    assert.equal(moving.contact, false);
    const ctx = canvas();
    const step = drawXenoTrialsContactStepV213(ctx, attacker, moving, images);
    assert.equal(step.contactApproachV213.x, moving.contactX);
    assert.ok(step.supports.every(([x, y]) => x <= lock.layout.bounds.left && Math.abs(y - floor) <= 6));
    assert.ok(ctx.calls.some(([name, ...args]) => name === 'drawImage' && args.length === 9));

    const movingState = advanceXenoTrialsFinisherV207(active, travel / 2);
    const paused = pauseXenoTrialsFinisherV207(movingState, true);
    assert.deepEqual(getXenoTrialsFinisherViewV207(advanceXenoTrialsFinisherV207(paused, 400)), moving);

    const held = at(active.timing.approachMs + 50);
    assert.equal(held.contact, true);
    assert.equal(held.contactX, lock.contactX);
    const rig = drawXenoTrialsRigV154(canvas(), lock.rig, images.get(lock.rig.path), sampleXenoTrialsFloorLockV207(lock, held.gain),
      lock.attackerMetrics, held.contactX, floor, attacker.facing);
    const [contactX, contactY] = rig.contacts[lock.contactKey];
    assert.ok(Math.hypot(contactX - lock.targetAnchor[0], contactY - lock.targetAnchor[1]) < 8);
    const body = drawXenoTrialsFloorLockTargetV207(canvas(), images.get(lock.atlas.path), lock, 1);
    assert.equal(body.visualRoot, target.x);
    assert.equal(body.frameId, 'ko-ground');
    const returning = at(active.durationMs - travel / 2);
    assert.equal(returning.walkV213, true);
    assert.equal(returning.contactX, moving.contactX);
    const done = getXenoTrialsFinisherViewV207(skipXenoTrialsFinisherV207(active));
    assert.equal(done.contactX, attacker.x);
    assert.equal(done.mix, 0);
    assert.deepEqual(match, original);
  }
});

test('exact missing textures and reduced motion select the existing safe verdict paths', () => {
  const [source, destination, range, action, seed] = supported[0];
  const match = earnVerdict(source, destination, range, action, seed);
  const images = texturesFor(source);
  const offer = createXenoTrialsFinisherV207(match, images, false, true);
  images.delete(offer.lock.approachV213.gait.atlas.texture.path);
  assert.equal(createXenoTrialsFinisherV207(match, images, false, true).kind, 'seal');
  assert.equal(createXenoTrialsFinisherV207(match, texturesFor(source), true, true), null);
});
