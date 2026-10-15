import assert from 'node:assert/strict';
import { test } from 'node:test';
import { advanceEnemyDistanceGaitV141, enemyDistanceGaitFrameV141, isEnemyDistanceGaitV141,
  ENEMY_DISTANCE_GAIT_V141 } from '../src/enemy-distance-gait-v141.js';
import { advanceEnemyPatrolV140 } from '../src/enemy-patrol-v140.js';
import { SpriteAnimationController, resolveEnemyAnimation, resolveSpriteClip, SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import { ENEMY_STATIC_POSES_V96 } from '../src/enemy-static-poses-v96.js';
import { getEnemyImportAnimationV107, getEnemyImportAnimationFrameV107 } from '../src/enemy-import-animation-v107.js';
import { drawUserCastePoseV87 } from '../src/enemy-user-pose-runtime-v87.js';
import { resolveHumanPoseGeometryV133 } from '../src/human-visual-contract-v133.js';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} differs from ${expected}`);
const actor = (patch = {}) => ({ id: 'joe', profileId: 'enemy-041-working-joe', spriteKey: 'workingJoe',
  x: 200, y: 300, w: 42, h: 92, vx: 0, vy: 0, speed: 125, grounded: true,
  alive: true, alert: true, facing: 1, ...patch });
const options = subject => ({ physicalActor: subject, physicalContext: 'mission', emit: false });
function patrol(rate, reducedMotion = false) {
  const subject = actor(), controller = new SpriteAnimationController(), state = { direction: 1 }, frames = new Set();
  const request = () => resolveEnemyAnimation(subject);
  controller.sample('joe', request(), 0, { ...options(subject), reducedMotion });
  let distance = 0, stationary = 0, accelerated = false, braking = false, sample;
  for (let n = 1; n <= rate * 12; n++) {
    const before = subject.x, oldSpeed = Math.abs(subject.vx);
    advanceEnemyPatrolV140(subject, state, { left: 200, right: 380 }, 1 / rate,
      { speed: 60, pauseSeconds: .7, move: x => { subject.x = x; } });
    if (subject.vx) subject.facing = Math.sign(subject.vx);
    distance += Math.abs(subject.x - before);
    sample = controller.sample('joe', request(), n / rate, { ...options(subject), reducedMotion });
    const gait = sample.enemyDistanceGaitV141;
    near(gait.distance, distance); near(gait.cycles, distance / ENEMY_DISTANCE_GAIT_V141.stride);
    const duplicate = controller.sample('joe', request(), n / rate, { ...options(subject), reducedMotion });
    assert.equal(duplicate.enemyDistanceGaitV141, gait); assert.equal(duplicate.frame, sample.frame);
    if (state.patrolV140?.phase === 'observe' && subject.x === before) {
      stationary++; assert.equal(gait.moving, false); assert.equal(sample.frame, sample.clip.frames[0]);
    }
    if (Math.abs(subject.vx) > oldSpeed && Math.abs(subject.vx) < 59) accelerated = true;
    if (Math.abs(subject.vx) < oldSpeed && subject.vx) braking = true;
    if (gait.moving) frames.add(sample.frame);
  }
  assert.ok(stationary > rate, 'Actual endpoint observations were rendered.');
  assert.ok(accelerated && braking); assert.equal(frames.size, 4);
  return { subject, sample, distance };
}

test('native Joe cells follow V140 acceleration, braking, endpoint stops and reversal at 30/60/120Hz', () => {
  const results = [30, 60, 120].map(rate => patrol(rate));
  for (const result of results) {
    near(result.distance, results[0].distance); near(result.subject.x, results[0].subject.x);
    near(result.sample.enemyDistanceGaitV141.cycles, results[0].sample.enemyDistanceGaitV141.cycles);
    assert.equal(result.sample.frame, results[0].sample.frame);
    assert.equal(result.subject.facing, results[0].subject.facing);
  }
});

test('reduced motion preserves the same physical foot phase and suppresses passive events', () => {
  const ordinary = patrol(60), reduced = patrol(60, true);
  near(reduced.sample.enemyDistanceGaitV141.distance, ordinary.distance);
  assert.equal(reduced.sample.frame, ordinary.sample.frame);
  assert.equal(reduced.sample.enemyDistanceGaitV141.suppressEvents, true);
});

test('equal world distance, mirrored facing and different speeds spend the same authored stride', () => {
  const results = [];
  for (const speed of [24, 60, 120]) for (const direction of [-1, 1]) {
    const subject = actor({ vx: speed * direction, facing: direction });
    let state = advanceEnemyDistanceGaitV141(null, subject, 0);
    const count = 120 * 120 / speed;
    for (let n = 1; n <= count; n++) {
      subject.x = 200 + direction * speed * n / 120;
      state = advanceEnemyDistanceGaitV141(state, subject, n / 120);
    }
    near(state.distance, 120); results.push(state);
  }
  for (const state of results) near(state.cycles, results[0].cycles);
});

test('stale velocity, repeated draws, prompt holds, loading gaps and teleports cannot invent travel', () => {
  const subject = actor({ vx: 125 }); let state = advanceEnemyDistanceGaitV141(null, subject, 0);
  for (let n = 1; n <= 60; n++) state = advanceEnemyDistanceGaitV141(state, subject, n / 60);
  assert.equal(state.distance, 0); assert.equal(state.moving, false);
  subject.x += 5; state = advanceEnemyDistanceGaitV141(state, subject, 1.05);
  assert.equal(state.distance, 5); const retained = state.cycles;
  assert.equal(advanceEnemyDistanceGaitV141(state, subject, 1.05, { movementEnabled: false }), state);
  for (let n = 1; n <= 30; n++) state = advanceEnemyDistanceGaitV141(state, subject, 1.05 + n / 60, { movementEnabled: false });
  near(state.cycles, retained); assert.equal(state.moving, false);
  subject.x += 1000; state = advanceEnemyDistanceGaitV141(state, subject, 5);
  near(state.cycles, retained); assert.equal(state.reseeded, true);
  subject.x += 1000; state = advanceEnemyDistanceGaitV141(state, subject, 5.01);
  near(state.cycles, retained); assert.equal(state.reseeded, true);
  subject.x += 1; state = advanceEnemyDistanceGaitV141(state, subject, 5.02);
  near(state.distance, 6);
  subject.x += 1; subject.vx = 0;
  state = advanceEnemyDistanceGaitV141(state, subject, 5.03);
  assert.equal(state.moving, true, 'A historical swept movement remains physical after its vx is reset.');
  near(state.distance, 7);
});

test('attacks, melee windup, death, air and injury consume no gait and keep engine clip cadence', () => {
  for (const patch of [{ attacking: true }, { pendingMelee: true }, { attackWindupClock: .4 }, { attackAnimationClock: .2 },
    { grounded: false }, { vy: 60 }, { alive: false }, { dormant: true }, { ventTransit: true }, { staggerClock: 1 }, { hurtClock: 1 }]) {
    const subject = actor({ vx: 125 }); let state = advanceEnemyDistanceGaitV141(null, subject, 0);
    subject.x += 5; Object.assign(subject, patch); state = advanceEnemyDistanceGaitV141(state, subject, .05);
    assert.equal(state.distance, 0); assert.equal(state.moving, false);
  }
  for (const clipId of ['grab-punch', 'hurt', 'damaged-death']) {
    const observed = new SpriteAnimationController(), original = new SpriteAnimationController();
    const request = { sheetId: 'enemy.working-joe.combat', clipId }, subject = actor({ attacking: clipId === 'grab-punch', hurtClock: clipId === 'hurt' ? 1 : 0, alive: clipId !== 'damaged-death' });
    for (const time of [0, .05, .13, .28, .5, 1]) {
      const sample = observed.sample('joe', request, time, options(subject)), baseline = original.sample('joe', request, time, { emit: false });
      assert.equal(sample.frame, baseline.frame); assert.equal(sample.complete, baseline.complete);
    }
  }
});

test('stationary alert humans select their neutral atlas row while real movement owns chase cells', () => {
  const controller = new SpriteAnimationController(), subject = actor({ profileId: 'enemy-043-weyland-yutani-commando',
    spriteKey: 'human', visualSheetId: 'enemy.weyland-yutani-commando.action.v56', vx: 0 });
  let sample = controller.sample('human', resolveEnemyAnimation(subject), 0, options(subject));
  for (let n = 1; n < 120; n++) sample = controller.sample('human', resolveEnemyAnimation(subject), n / 60, options(subject));
  assert.equal(sample.clip.id, 'idle'); assert.equal(sample.frame, 0);
  subject.vx = 90; subject.x += 3;
  sample = controller.sample('human', resolveEnemyAnimation(subject), 2, options(subject));
  assert.equal(sample.clip.id, 'chase'); assert.ok(sample.row === 1); near(sample.enemyDistanceGaitV141.distance, 3);
});

test('native pause and BIOFORGE hold resume the retained phase without render-clock debt', () => {
  const controller = new SpriteAnimationController(), subject = actor({ vx: 100 });
  controller.sample('joe', resolveEnemyAnimation(subject), 0, options(subject));
  let moving;
  for (let n = 1; n <= 24; n++) {
    subject.x += 100 / 60;
    moving = controller.sample('joe', resolveEnemyAnimation(subject), n / 60, options(subject));
  }
  for (let draw = 0; draw < 30; draw++) {
    const paused = controller.sample('joe', resolveEnemyAnimation(subject), .4, { ...options(subject), movementEnabled: false });
    assert.equal(paused.frame, moving.frame); assert.equal(paused.enemyDistanceGaitV141, moving.enemyDistanceGaitV141);
  }
  let held;
  for (let n = 25; n <= 180; n++) held = controller.sample('joe', resolveEnemyAnimation(subject), n / 60,
    { ...options(subject), physicalContext: 'mission', movementEnabled: false });
  near(held.enemyDistanceGaitV141.distance, 40); assert.equal(held.frame, 0);
  subject.x += 100 / 60;
  const resumed = controller.sample('joe', resolveEnemyAnimation(subject), 181 / 60, options(subject));
  near(resumed.enemyDistanceGaitV141.distance, 40 + 100 / 60);
  assert.equal(resumed.frame, Math.floor((40 + 100 / 60) / ENEMY_DISTANCE_GAIT_V141.stride * 4) % 4);
});

test('seven admitted humanoid import atlases preserve original art, sole geometry and source facing', () => {
  const definitions = ENEMY_STATIC_POSES_V96.filter(definition => getEnemyImportAnimationV107(definition) && isEnemyDistanceGaitV141(actor({ profileId: definition.id }), definition));
  assert.equal(definitions.length, 7);
  for (const definition of definitions) for (const facing of [-1, 1]) {
    const animation = getEnemyImportAnimationV107(definition), subject = actor({ profileId: definition.id, facing, vx: facing * 90 });
    const fixedImage = { complete: true, naturalWidth: definition.sourceWidth, naturalHeight: definition.sourceHeight };
    const atlas = { complete: true, naturalWidth: animation.sourceWidth, naturalHeight: animation.sourceHeight };
    const draws = [], transforms = [], ctx = { save() {}, restore() {}, translate(...args) { transforms.push(args); }, scale(...args) { transforms.push(args); }, drawImage(...args) { draws.push(args); } };
    const imageStore = new Map([[animation.path, atlas]]), initial = structuredClone(subject);
    drawUserCastePoseV87(ctx, subject, fixedImage, { imageStore, timeSeconds: 0 });
    subject.x += facing * 30;
    assert.equal(drawUserCastePoseV87(ctx, subject, fixedImage, { imageStore, timeSeconds: .25, reducedMotion: true }), true);
    const draw = draws.at(-1), expected = animation.frames[Math.floor(30 / ENEMY_DISTANCE_GAIT_V141.stride * animation.clips.move.frames.length)];
    assert.equal(draw[0], atlas); assert.deepEqual(draw.slice(1, 5), expected.rect);
    near(draw[7] / draw[3], draw[8] / draw[4]);
    near(draw[6] + draw[8] * expected.pivot.y, 0);
    assert.deepEqual(transforms.at(-1), [facing * animation.sourceFacing, 1]);
    const geometry = resolveHumanPoseGeometryV133({ actor: subject, definition }); near(geometry.standingHeight, 96.5);
    for (const key of ['w', 'h', 'vx', 'speed', 'health', 'profileId']) assert.equal(subject[key], initial[key]);
  }
});

test('unadmitted creatures and machines retain authored FPS; controller reset discards only its gait state', () => {
  const controller = new SpriteAnimationController(), subject = actor({ profileId: 'enemy-004-drone-big-chap', spriteKey: 'xenoDrone', vx: 50 });
  assert.equal(isEnemyDistanceGaitV141(subject), false);
  const request = resolveEnemyAnimation(subject);
  controller.sample('drone', request, 0, options(subject));
  const sample = controller.sample('drone', request, .3, options(subject));
  assert.equal(sample.enemyDistanceGaitV141, null); assert.notEqual(sample.frame, sample.clip.frames[0]);
  const imported = ENEMY_STATIC_POSES_V96.find(definition => getEnemyImportAnimationV107(definition));
  const animation = getEnemyImportAnimationV107(imported);
  assert.equal(getEnemyImportAnimationFrameV107(animation, 'move', .3), animation.frames[Math.floor(.3 * animation.clips.move.fps) % animation.clips.move.frames.length]);
  const joe = actor(); controller.sample('joe', resolveEnemyAnimation(joe), 0, options(joe));
  assert.equal(controller.enemyDistanceGaitStatesV141.size, 1); controller.reset('joe'); assert.equal(controller.enemyDistanceGaitStatesV141.size, 0);
  assert.ok(resolveSpriteClip(SPRITE_SHEETS['enemy.working-joe.combat'].id, 'grab-punch'));
});
