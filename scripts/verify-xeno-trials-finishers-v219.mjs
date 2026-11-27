import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { drawXenoTrialsFloorLockTargetV207, sampleXenoTrialsFloorLockV207 } from '../src/xeno-trials-capture-v163.js';
import { createXenoTrialsMatchV96, stepXenoTrialsMatchV96, XENO_TRIALS_STEP_V96 } from '../src/xeno-trials-engine-v96.js';
import { createXenoTrialsFinisherV207, activateXenoTrialsFinisherV207, advanceXenoTrialsFinisherV207, pauseXenoTrialsFinisherV207,
  getXenoTrialsFinisherViewV207, skipXenoTrialsFinisherV207 } from '../src/xeno-trials-finishers-v207.js';
import { getXenoTrialsBodyGapV105, XENO_TRIALS_ARENA_V105 } from '../src/xeno-trials-geometry-v105.js';
import { getXenoTrialsArtV96, getXenoTrialsFighterV96 } from '../src/xeno-trials-data-v96.js';
import { drawXenoTrialsRigV154, getXenoTrialsRigV154, getXenoTrialsRuntimeArticulatedRig,
  getXenoTrialsRuntimeDefenseRig } from '../src/xeno-trials-rig-v154.js';
import { XENO_TRIALS_SPRITE_ATLASES_V188 } from '../src/xeno-trials-sprite-atlas-v188.js';
import { XENO_TRIALS_SPRITE_ATLASES_V189 } from '../src/xeno-trials-sprite-atlas-v189.js';
import { XENO_TRIALS_SPRITE_ATLASES_V191, XENO_TRIALS_SPRITE_ATLASES_V197 } from '../src/xeno-trials-sprite-atlas-v191.js';

const duels = [
  ['spitter', 'ravager', 23, 6, 'light', 'footNear'],
  ['synth-trooper', 'ravager', 96, 55, 'light', 'footFar'],
  ['synth-trooper', 'crusher-acm', 23, 6, 'light', 'footNear'],
  ['synth-guard', 'ravager', 96, 55, 'light', 'footFar'],
  ['synth-guard', 'crusher-acm', 23, 6, 'light', 'footNear'],
  ['combat-synth', 'ravager', 96, 55, 'light', 'footFar'],
  ['combat-synth', 'crusher-acm', 1, 25, 'light', 'footFar'],
  ['synth-sniper', 'ravager', 96, 55, 'heavy', 'rightBoot'],
  ['synth-sniper', 'crusher-acm', 44, 35, 'light', 'leftBoot'],
  ['armored-joe', 'ravager', 23, 65, 'heavy', 'farBoot'],
  ['armored-joe', 'crusher-acm', 96, 55, 'light', 'nearBoot'],
  ['import-wy-apesuit', 'ravager', 96, 55, 'heavy', 'footFar'],
  ['import-wy-apesuit', 'crusher-acm', 44, 35, 'light', 'footNear'],
  ['import-joe-classic', 'ravager', 23, 6, 'light', 'backBoot'],
  ['import-joe-classic', 'crusher-acm', 96, 55, 'light', 'backBoot'],
  ['import-joe-battle', 'ravager', 23, 6, 'light', 'footNear'],
  ['import-joe-battle', 'crusher-acm', 96, 55, 'light', 'footNear'],
  ['import-joe-hazmat', 'ravager', 1, 25, 'light', 'footNear'],
  ['import-joe-hazmat', 'crusher-acm', 96, 55, 'light', 'footNear'],
  ['cryo-joe', 'ravager', 44, 35, 'light', 'footNear'],
  ['cryo-joe', 'crusher-acm', 96, 55, 'heavy', 'footNear'],
  ['acid-joe', 'ravager', 96, 55, 'heavy', 'footNear'],
  ['acid-joe', 'crusher-acm', 76, 60, 'light', 'footNear'],
  ['albino-joe', 'ravager', 96, 55, 'heavy', 'footNear'],
  ['albino-joe', 'crusher-acm', 96, 55, 'heavy', 'footNear'],
  ['user-spiker', 'ravager', 1, 25, 'light', 'footFar'],
  ['user-red-horned', 'ravager', 96, 55, 'heavy', 'farFore'],
  ['user-black-fin', 'ravager', 5, 25, 'heavy', 'foreNear'],
  ['user-black-fin', 'crusher-acm', 44, 35, 'light', 'foreNear'],
  ['user-chameleon', 'ravager', 23, 6, 'light', 'hindFar'],
  ['user-chameleon', 'crusher-acm', 96, 55, 'light', 'foreSupport'],
  ['cryo-combat-synth', 'ravager', 96, 55, 'heavy', 'forwardBoot'],
  ['acid-combat-synth', 'ravager', 96, 55, 'heavy', 'frontBoot'],
  ['synth-containment', 'ravager', 96, 55, 'light', 'rightBoot'],
  ['synth-enforcer', 'ravager', 96, 55, 'light', 'frontBoot'],
  ['import-synth-eloise', 'ravager', 96, 55, 'light', 'footFar'],
  ['import-synth-eloise', 'crusher-acm', 96, 55, 'light', 'footFar'],
  ['afe2-engineer-hybrid', 'ravager', 96, 55, 'heavy', 'footFar'],
];
const floor = XENO_TRIALS_ARENA_V105.floor;
const decoded = (naturalWidth, naturalHeight) => ({ complete: true, naturalWidth, naturalHeight });
const atlasImages = [...XENO_TRIALS_SPRITE_ATLASES_V188, ...XENO_TRIALS_SPRITE_ATLASES_V189,
  ...XENO_TRIALS_SPRITE_ATLASES_V191, ...XENO_TRIALS_SPRITE_ATLASES_V197]
  .map(({ texture }) => [texture.path, decoded(texture.width, texture.height)]);
const verified = new Set();

function textureImages(id) {
  const art = getXenoTrialsArtV96(id), fighter = getXenoTrialsFighterV96(id);
  const rig = getXenoTrialsRuntimeArticulatedRig(fighter, art) || getXenoTrialsRuntimeDefenseRig(fighter, art)
    || getXenoTrialsRigV154(fighter, art);
  return new Map([...atlasImages, [rig.path, decoded(rig.sourceWidth, rig.sourceHeight)]]);
}

function assertPng(path, sha256, width, height) {
  if (verified.has(path)) return;
  const image = readFileSync(new URL('..' + path, import.meta.url));
  assert.equal(createHash('sha256').update(image).digest('hex'), sha256, path);
  assert.equal(image.readUInt32BE(16), width, path);
  assert.equal(image.readUInt32BE(20), height, path);
  verified.add(path);
}

function fight(playerId, opponentId, seed, range, command) {
  // The 1 HP duel is an existing public rule. Both roots, motions,
  // contact and verdict come from fixed-step inputs and the ordinary CPU.
  const duel = createXenoTrialsMatchV96({ playerId, opponentId, seed, stageId: 'tantalus-bridge', introSeconds: 0,
    roundsToWin: 1, rulesV119: { initialHp: 1, noSpecial: true } });
  for (let tick = 0; duel.phase === 'active' && tick < 550; tick++) {
    const [a, b] = duel.fighters;
    const towards = a.x <= b.x ? 1 : -1;
    const approach = getXenoTrialsBodyGapV105(a, b, towards) > range && !a.attack;
    stepXenoTrialsMatchV96(duel, XENO_TRIALS_STEP_V96,
      approach ? { [towards === 1 ? 'right' : 'left']: true } : { [command]: tick % 3 === 0 });
  }
  return duel;
}

function canvas() {
  return new Proxy({ globalAlpha: 1 }, { get: (object, key) => object[key] ?? (() => {}) });
}

for (const [from, to, seed, range, command, contactKey] of duels) {
  test(`${from} → ${to}: a real CPU duel resolves a measured contact on both native plates`, () => {
    const duel = fight(from, to, seed, range, command);
    assert.equal(duel.result?.winner, 'player');
    assert.equal(duel.result?.reason, 'ko');
    const original = structuredClone(duel);
    const images = textureImages(from);
    const offer = createXenoTrialsFinisherV207(duel, images, false, true);
    assert.equal(offer.id, `${from}::fin1`);
    assert.equal(offer.lock.revision, 219);
    assert.equal(offer.lock.contactKey, contactKey);
    const active = activateXenoTrialsFinisherV207(offer);
    const { lock } = active;
    const [attacker, target] = duel.fighters;
    assertPng(lock.rig.path, lock.rig.sourceSha256, lock.rig.sourceWidth, lock.rig.sourceHeight);
    assertPng(lock.atlas.path, lock.atlas.sourceSha256, lock.atlas.sourceWidth, lock.atlas.sourceHeight);
    const pressed = advanceXenoTrialsFinisherV207(active, active.timing.approachMs);
    const view = getXenoTrialsFinisherViewV207(pressed);
    assert.equal(view.contact, true);
    const poseAt = gain => drawXenoTrialsRigV154(canvas(), lock.rig, images.get(lock.rig.path),
      sampleXenoTrialsFloorLockV207(lock, gain), lock.attackerMetrics, attacker.x, floor, attacker.facing);
    const rest = poseAt(0), lift = poseAt(.5), hold = poseAt(view.gain);
    assert.ok(rest?.drawn && lift?.drawn && hold?.drawn);
    const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    assert.ok(distance(hold.contacts[contactKey], lock.targetAnchor) <= 1);
    assert.ok(lift.contacts[contactKey][1] < rest.contacts[contactKey][1] - 2);
    assert.ok(lock.supportKeys.every(key => [lift, hold].every(pose => distance(pose.contacts[key], rest.contacts[key]) <= 1.5)));
    assert.ok(lock.supportKeys.some(key => Math.abs(rest.contacts[key][1] - floor) <= 15));
    assert.ok(lock.supportKeys.every(key => rest.contacts[key][1] <= floor + 2));
    const prone = drawXenoTrialsFloorLockTargetV207(canvas(), images.get(lock.atlas.path), lock, view.mix);
    assert.equal(prone.frameId, 'ko-ground');
    assert.equal(prone.visualRoot, target.x);
    assert.equal(prone.floor, floor);
    const paused = pauseXenoTrialsFinisherV207(pressed, true);
    assert.equal(advanceXenoTrialsFinisherV207(paused, 2000), paused);
    assert.equal(skipXenoTrialsFinisherV207(pressed).phase, 'complete');
    assert.deepEqual(duel, original);
  });
}

test('the terminal gate, exact plates and reduced-motion path remain authoritative', () => {
  const [from, to, seed, range, command] = duels[0];
  const images = textureImages(from);
  const duel = fight(from, to, seed, range, command);
  const offer = createXenoTrialsFinisherV207(duel, images, false, true);
  assert.equal(offer.lock.revision, 219);
  assert.equal(createXenoTrialsFinisherV207(duel, images, true, true), null);
  assert.equal(createXenoTrialsFinisherV207(createXenoTrialsMatchV96({ playerId: from, opponentId: to, introSeconds: 0 }),
    images, false, true), null);
  const missing = new Map(images);
  missing.delete(offer.lock.atlas.path);
  assert.equal(createXenoTrialsFinisherV207(duel, missing, false, true).kind, 'seal');
  const invalid = new Map(images);
  invalid.set(offer.lock.rig.path, decoded(offer.lock.rig.sourceWidth - 1, offer.lock.rig.sourceHeight));
  assert.equal(createXenoTrialsFinisherV207(duel, invalid, false, true).kind, 'seal');
});
