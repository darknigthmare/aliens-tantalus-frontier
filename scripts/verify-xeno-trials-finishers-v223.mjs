import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { drawXenoTrialsFloorLockTargetV207, sampleXenoTrialsFloorLockV207 } from '../src/xeno-trials-capture-v163.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { activateXenoTrialsFinisherV207, advanceXenoTrialsFinisherV207, createXenoTrialsFinisherV207,
  getXenoTrialsFinisherStateV207, getXenoTrialsFinisherViewV207, openXenoTrialsLandedContactV223,
  pauseXenoTrialsFinisherV207, skipXenoTrialsFinisherV207 } from '../src/xeno-trials-finishers-v207.js';
import { XENO_TRIALS_ARENA_V105, getXenoTrialsBodyGapV105 } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsRigV154, getXenoTrialsRuntimeArticulatedRig, getXenoTrialsRuntimeDefenseRig,
  drawXenoTrialsRigV154 } from '../src/xeno-trials-rig-v154.js';
import { createXenoTrialsRuntimeV96 } from '../src/xeno-trials-runtime-v96.js';
import { createXenoTrialsLandingV157, advanceXenoTrialsOutroV155, skipXenoTrialsOutroV155 } from '../src/xeno-trials-sequences-v155.js';
import { XENO_TRIALS_SPRITE_ATLASES_V188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { XENO_TRIALS_SPRITE_ATLASES_V189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { XENO_TRIALS_SPRITE_ATLASES_V191, XENO_TRIALS_SPRITE_ATLASES_V197 } from '../src/xeno-trials-sprite-atlas-v191.js';

const routes = [
  ['user-chameleon', 'runner', 23, 4, 'heavy', -1, false, 'stay', 'foreSupport'],
  ['user-black-fin', 'user-brute', 223, 4, 'antiAir', 20, true, 'left', 'foreFar'],
  ['acid-combat-synth', 'runner', 223, 4, 'heavy', 15, false, 'left', 'frontBoot'],
  ['acid-combat-synth', 'user-brute', 223, 4, 'antiAir', 29, false, 'left', 'frontBoot'],
  ['acid-combat-synth', 'ravager', 223, 4, 'antiAir', 0, false, 'left', 'frontBoot'],
  ['cryo-combat-synth', 'runner', 223, 4, 'heavy', 20, false, 'left', 'forwardBoot'],
  ['cryo-combat-synth', 'user-brute', 223, 4, 'antiAir', 29, true, 'left', 'forwardBoot'],
  ['cryo-combat-synth', 'ravager', 223, 4, 'antiAir', 0, false, 'left', 'forwardBoot'],
  ['combat-synth', 'runner', 223, 4, 'heavy', 20, false, 'left', 'footFar'],
  ['combat-synth', 'user-brute', 223, 4, 'antiAir', 34, true, 'left', 'footFar'],
  ['combat-synth', 'ravager', 223, 4, 'antiAir', 0, false, 'left', 'footFar'],
  ['synth-guard', 'user-brute', 223, 4, 'antiAir', 20, true, 'left', 'footFar'],
  ['synth-sniper', 'user-brute', 223, 4, 'antiAir', 15, true, 'left', 'rightBoot'],
  ['synth-trooper', 'user-brute', 223, 4, 'antiAir', 20, true, 'left', 'footFar'],
  ['spitter', 'runner', 223, 4, 'light', 40, false, 'left', 'footNear'],
  ['spitter', 'user-brute', 223, 4, 'antiAir', 47, true, 'left', 'footNear'],
  ['spitter', 'ravager', 223, 4, 'antiAir', 0, false, 'left', 'footNear'],
  ['warrior', 'runner', 223, 4, 'heavy', 24, true, 'left', 'footNear'],
  ['warrior', 'user-brute', 223, 4, 'antiAir', 40, true, 'left', 'footNear'],
  ['warrior', 'ravager', 223, 4, 'light', 0, false, 'left', 'footNear'],
  ['runner', 'warrior', 223, 103, 'antiAir', 47, true, 'left', 'footNear'],
  ['runner', 'ravager', 223, 4, 'antiAir', 4, false, 'left', 'footNear'],
  ['prowler', 'user-brute', 223, 4, 'light', 68, false, 'left', 'footNear'],
  ['prowler', 'ravager', 223, 4, 'antiAir', 0, false, 'left', 'footNear'],
  ['armored-joe', 'user-brute', 223, 4, 'antiAir', 29, true, 'left', 'farBoot'],
  ['import-joe-battle', 'user-brute', 223, 4, 'antiAir', 29, false, 'left', 'footFar'],
];
const { floor } = XENO_TRIALS_ARENA_V105;
const dt = XENO_TRIALS_STEP_V96;
const decoded = (naturalWidth, naturalHeight) => ({ complete: true, naturalWidth, naturalHeight });
const stageId = 'tantalus-bridge';
const atlases = [...XENO_TRIALS_SPRITE_ATLASES_V188, ...XENO_TRIALS_SPRITE_ATLASES_V189,
  ...XENO_TRIALS_SPRITE_ATLASES_V191, ...XENO_TRIALS_SPRITE_ATLASES_V197].map(({ texture }) =>
  [texture.path, decoded(texture.width, texture.height)]);
const checked = new Set();

function availableImages(attackerId) {
  const definition = getXenoTrialsFighterV96(attackerId), art = getXenoTrialsArtV96(attackerId);
  const rig = getXenoTrialsRuntimeArticulatedRig(definition, art) || getXenoTrialsRuntimeDefenseRig(definition, art)
    || getXenoTrialsRigV154(definition, art);
  return new Map([...atlases, [rig.path, decoded(rig.sourceWidth, rig.sourceHeight)]]);
}

function checkAsset(path, hash, width, height) {
  if (checked.has(path)) return;
  const data = readFileSync(new URL('..' + path, import.meta.url));
  assert.equal(createHash('sha256').update(data).digest('hex'), hash);
  assert.equal(data.readUInt32BE(16), width);
  assert.equal(data.readUInt32BE(20), height);
  checked.add(path);
}

function cpuInput(fighters, reach, action, tick) {
  const [attacker, target] = fighters;
  const direction = target.x >= attacker.x ? 1 : -1;
  const moving = getXenoTrialsBodyGapV105(attacker, target, direction) > reach && !attacker.attack;
  return moving ? { [direction > 0 ? 'right' : 'left']: true } : { [action]: tick % 3 === 0 };
}

function config([playerId, opponentId, seed, , , delay]) {
  return { playerId, opponentId, seed, stageId, introSeconds: 0, difficulty: delay < 0 ? 'normal' : 'easy',
    roundsToWin: 1, rulesV119: { initialHp: 1, noSpecial: true } };
}

function duel(route) {
  const [, , , reach, action, delay, follow, drift] = route;
  const match = createXenoTrialsMatchV96(config(route));
  const [attacker, target] = match.fighters;
  if (delay < 0) {
    for (let tick = 0; tick < 420 && match.phase === 'active'; tick++)
      stepXenoTrialsMatchV96(match, dt, cpuInput(match.fighters, reach, action, tick));
    return match;
  }
  while (getXenoTrialsBodyGapV105(attacker, target, 1) > reach && match.tick < 330)
    stepXenoTrialsMatchV96(match, dt, { right: true }, {});
  const direction = drift === 'left' ? { left: true } : {};
  stepXenoTrialsMatchV96(match, dt, {}, { jump: true, ...direction });
  assert.ok(target.y > 0);
  for (let tick = 0; tick < delay; tick++) {
    const track = follow ? { [target.x >= attacker.x ? 'right' : 'left']: true } : {};
    stepXenoTrialsMatchV96(match, dt, track, direction);
  }
  stepXenoTrialsMatchV96(match, dt, { [action]: true }, direction);
  for (let tick = 0; tick < 55 && match.phase === 'active'; tick++) stepXenoTrialsMatchV96(match, dt, {}, direction);
  return match;
}

function canvas() {
  return new Proxy({ globalAlpha: 1 }, { get(object, key) {
    if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({ addColorStop() {} });
    return object[key] ?? (() => {});
  } });
}

function finishLanding(landing) {
  for (let elapsed = 0; elapsed < 700 && landing.phase === 'playing'; elapsed += 100)
    landing = advanceXenoTrialsOutroV155(landing, 100);
  assert.equal(landing.phase, 'complete');
  return landing;
}

for (const route of routes) {
  const [from, to, , , , delay, , , key] = route;
  test(`${from} → ${to}: ${delay < 0 ? 'CPU' : 'local controller'} airborne KO receives the exact floor plate and held contact`, () => {
    const match = duel(route);
    assert.equal(match.result?.winner, 'player');
    assert.equal(match.result.reason, 'ko');
    const before = structuredClone(match);
    const [attacker, target] = match.fighters;
    assert.equal(attacker.y, 0);
    assert.ok(target.y > 0);
    const images = availableImages(from);
    const landing = createXenoTrialsLandingV157(match, false, images);
    const participant = landing.participants.find(row => row.side === target.side);
    const candidate = createXenoTrialsFinisherV207(match, images, false, true, landing);
    assert.equal(candidate.phase, 'landing');
    assert.equal(candidate.lock.target, target);
    assert.equal(candidate.lock.attacker, attacker);
    assert.equal(candidate.lock.revision, 223);
    assert.equal(candidate.lock.contactKey, key);
    assert.equal(candidate.lock.atlas.path, participant.atlasPathV219);
    assert.equal(activateXenoTrialsFinisherV207(candidate), candidate);
    assert.equal(advanceXenoTrialsFinisherV207(candidate, 120), candidate);
    assert.equal(openXenoTrialsLandedContactV223(candidate, match, landing), candidate);
    const lowered = finishLanding(landing);
    const offer = openXenoTrialsLandedContactV223(candidate, match, lowered);
    assert.equal(offer.phase, 'offered');
    assert.equal(offer.elapsedMs, 0);
    const receipt = getXenoTrialsFinisherStateV207(offer).afterLandingV223;
    assert.equal(receipt.airtimeY, target.y);
    assert.equal(receipt.targetX, target.x);
    assert.equal(receipt.terminalTick, match.tick);
    assert.equal(receipt.atlasPath, participant.atlasPathV219);
    const playing = activateXenoTrialsFinisherV207(offer);
    const view = getXenoTrialsFinisherViewV207(advanceXenoTrialsFinisherV207(playing, playing.timing.approachMs));
    assert.equal(view.contact, true);
    const { lock } = view;
    checkAsset(lock.rig.path, lock.rig.sourceSha256, lock.rig.sourceWidth, lock.rig.sourceHeight);
    checkAsset(lock.atlas.path, lock.atlas.sourceSha256, lock.atlas.sourceWidth, lock.atlas.sourceHeight);
    const attackerPose = drawXenoTrialsRigV154(canvas(), lock.rig, images.get(lock.rig.path),
      sampleXenoTrialsFloorLockV207(lock, view.gain), lock.attackerMetrics, attacker.x, floor, attacker.facing);
    const point = attackerPose.contacts[key];
    assert.ok(Math.hypot(point[0] - lock.targetAnchor[0], point[1] - lock.targetAnchor[1]) <= 1);
    const edge = attacker.facing > 0 ? lock.layout.bounds.left : lock.layout.bounds.right;
    assert.ok(lock.supportKeys.every(name => (edge - attackerPose.contacts[name][0]) * attacker.facing >= 2));
    const floorPlate = drawXenoTrialsFloorLockTargetV207(canvas(), images.get(lock.atlas.path), lock, 1);
    assert.equal(floorPlate.frameId, 'ko-ground');
    assert.equal(floorPlate.floor, floor);
    assert.equal(floorPlate.visualRoot, target.x);
    assert.deepEqual(match, before);
  });
}

test('loss of the exact receipt or art, skipping and reduced motion never revive the delayed option', () => {
  const route = routes[0], match = duel(route), images = availableImages(route[0]);
  const landing = createXenoTrialsLandingV157(match, false, images);
  const waiting = createXenoTrialsFinisherV207(match, images, false, true, landing);
  assert.ok(waiting);
  assert.equal(createXenoTrialsFinisherV207(match, images, true, true, landing), null);
  assert.equal(createXenoTrialsFinisherV207(match, images, false, true), null);
  const missing = new Map(images);
  missing.delete(waiting.lock.atlas.path);
  assert.equal(createXenoTrialsFinisherV207(match, missing, false, true, landing), null);
  assert.equal(openXenoTrialsLandedContactV223(waiting, match, skipXenoTrialsOutroV155(landing)).phase, 'declined');
  const ended = finishLanding(landing);
  const rotated = { ...ended, terminalTick: ended.terminalTick + 1 };
  assert.equal(openXenoTrialsLandedContactV223(waiting, match, rotated).phase, 'declined');
  const otherScene = { ...ended, id: 'unreviewed-landing' };
  assert.equal(openXenoTrialsLandedContactV223(waiting, match, otherScene).phase, 'declined');
  const skipped = skipXenoTrialsFinisherV207(waiting);
  assert.equal(openXenoTrialsLandedContactV223(skipped, match, ended), skipped);
  const paused = pauseXenoTrialsFinisherV207(waiting, true);
  assert.equal(openXenoTrialsLandedContactV223(paused, match, ended), paused);
});

test('production runtime opens the V223 offer after the drawn landing, accepts F and emits one native verdict', async () => {
  const route = routes[0], images = availableImages(route[0]);
  const hostEvents = new Map(), queue = new Map(), context = canvas();
  const eventTarget = events => ({ addEventListener: (type, handler) => events.set(type, handler), removeEventListener: type => events.delete(type) });
  const display = { tagName: 'CANVAS', width: 1000, height: 560, getContext: () => context, focus() {} };
  const document = { ...eventTarget(new Map()), hidden: false, hasFocus: () => true };
  let stamp = 0, serial = 0;
  const verdicts = [];
  const runtime = createXenoTrialsRuntimeV96({ canvas: display, window: eventTarget(hostEvents), document, config: config(route),
    loadImage: async path => images.get(path) || decoded(1024, 1024),
    requestAnimationFrame(callback) { queue.set(++serial, callback); return serial; },
    cancelAnimationFrame(id) { queue.delete(id); },
    onResult(result) { verdicts.push(result); }
  });
  const frame = () => {
    stamp += 1000 * dt;
    for (const [id, callback] of [...queue]) if (queue.delete(id)) callback(stamp);
  };
  try {
    assert.equal(await runtime.start(), true);
    for (let step = 0; step < 1700; step++) {
      const state = runtime.getState();
      if (state.phase === 'match-over') break;
      if (state.phase === 'active' && !state.presentation.blocksSimulation) {
        const input = cpuInput(state.fighters, route[3], route[4], state.tick);
        for (const action of ['left', 'right', 'heavy']) runtime.setInput(action, Boolean(input[action]));
      }
      frame();
    }
    const pending = runtime.getState();
    assert.equal(pending.finisherV207?.phase, 'landing', JSON.stringify(pending.result));
    assert.equal(pending.canActivateFinisherV207, false);
    assert.equal(verdicts.length, 1);
    const controls = hostEvents.get('keydown');
    controls({ code: 'KeyF', target: display, preventDefault() {} });
    assert.equal(runtime.getState().finisherV207.phase, 'landing');
    for (let step = 0; step < 100 && !runtime.getState().canActivateFinisherV207; step++) frame();
    const ready = runtime.getState();
    assert.equal(ready.landingV157.phase, 'complete');
    assert.equal(ready.finisherV207.phase, 'offered');
    assert.equal(ready.canActivateFinisherV207, true);
    assert.equal(ready.landingViewsV157.find(view => view.side === 'opponent').ground, floor);
    assert.equal(ready.fighters[1].y, pending.fighters[1].y);
    controls({ code: 'KeyF', target: display, preventDefault() {} });
    for (let step = 0; step < 80; step++) frame();
    const contact = runtime.getState();
    assert.equal(contact.finisherV207.phase, 'playing');
    assert.ok(contact.rigViewsV154.some(row => row.finisherV207?.role === 'target' && row.frameId === 'ko-ground'));
    assert.ok(contact.rigViewsV154.some(row => row.finisherV207?.role === 'attacker' && row.finisherV207.contact));
    assert.equal(runtime.skipSequence(), true);
    assert.deepEqual(runtime.getState().result, ready.result);
    assert.equal(verdicts.length, 1);
  } finally { runtime.stop(); }
});
