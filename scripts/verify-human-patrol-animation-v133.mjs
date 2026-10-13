import assert from 'node:assert/strict';
import { test } from 'node:test';
import { advanceHumanPatrolAnimationV133 } from '../src/human-patrol-animation-v133.js';
import { SpriteAnimationController, resolveSpriteClip } from '../src/sprite-animation-runtime.js';

const walk = { sheetId: 'npc.mara-vega.locomotion', clipId: 'walk' };
const clip = resolveSpriteClip(walk.sheetId, walk.clipId);
const actor = () => ({ x: 200, y: 532, w: 44, h: 92, vx: 22, alive: true });
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} differs from ${b}`);

test('slow patrol advances the same measured distance at 30, 60 and 120 Hz', () => {
  const results = [30, 60, 120].map(rate => {
    const a = actor(); let state = advanceHumanPatrolAnimationV133(null, a, clip, 0);
    for (let frame = 1; frame <= rate * 3; frame++) {
      a.x += a.vx / rate; state = advanceHumanPatrolAnimationV133(state, a, clip, frame / rate);
    }
    return state;
  });
  for (const state of results) { near(state.distance, 66); assert.equal(state.step, results[0].step); }
  assert.ok(results[0].stepsPerSecond < 1.5, '22px/s cannot play the old four steps per second.');
});
test('stationary, paused, airborne and carried poses cannot generate walking travel', () => {
  for (const patch of [{ vx: 0 }, { grounded: false }, { downed: true }, { climbing: true }, { inVehicle: true }]) {
    const a = actor(); let state = advanceHumanPatrolAnimationV133(null, a, clip, 0);
    Object.assign(a, patch); a.x += 30;
    state = advanceHumanPatrolAnimationV133(state, a, clip, .1);
    assert.equal(state.distance, 0); assert.equal(state.suppressEvents, true);
    assert.deepEqual(advanceHumanPatrolAnimationV133(state, a, clip, .1), { ...state, reseeded: false });
  }
});
test('context changes, clock rewind and unphysical displacement reseed without future steps', () => {
  const a = actor(); let state = advanceHumanPatrolAnimationV133(null, a, clip, 0);
  a.x += 2.2; state = advanceHumanPatrolAnimationV133(state, a, clip, .1);
  for (const [time, context, x] of [[.2, 'annex', a.x], [.05, '', a.x], [.2, '', 2000]]) {
    const next = advanceHumanPatrolAnimationV133(state, { ...a, x }, clip, time, { context });
    assert.equal(next.distance, 0); assert.equal(next.reseeded, true); assert.equal(next.suppressEvents, true);
  }
});
test('the actual NPC controller produces no initial or render-only footsteps', () => {
  const events = [], controller = new SpriteAnimationController({ onEvent: e => events.push(e) }), a = actor();
  const options = { physicalActor: a, physicalContext: 'hub:command' };
  const initial = controller.sample('mara', walk, 0, options);
  for (let i = 0; i < 20; i++) assert.equal(controller.sample('mara', walk, 0, options).frame, initial.frame);
  assert.deepEqual(events, []);
  for (let frame = 1; frame <= 240; frame++) {
    a.x += a.vx / 60; controller.sample('mara', walk, frame / 60, options);
    controller.sample('mara', walk, frame / 60, { ...options, emit: false });
  }
  assert.ok(events.length >= 3 && events.length <= 5, `Unexpected ${events.length} footsteps for an 88px patrol.`);
  const count = events.length; controller.sample('mara', walk, 4, options); assert.equal(events.length, count);
});
test('work and injury remain on their own action clocks and non-human machines retain FPS', () => {
  const controller = new SpriteAnimationController(), a = actor();
  const work = { sheetId: walk.sheetId, clipId: 'role-work' };
  controller.sample('mara', work, 0, { physicalActor: a });
  const action = controller.sample('mara', work, .5, { physicalActor: a });
  assert.equal(action.humanPatrolV133, null); assert.ok(action.frame !== action.clip.frames[0]);
  const vehicle = { sheetId: 'vehicle.p5000-powered-work-loader.action', clipId: 'walk' };
  controller.sample('loader', vehicle, 0, { physicalActor: a });
  const machine = controller.sample('loader', vehicle, .2, { physicalActor: a });
  assert.equal(machine.humanPatrolV133, null); assert.ok(machine.frame !== machine.clip.frames[0]);
});
test('reduced motion preserves travel observations with a stable pose and no step events', () => {
  const events = [], controller = new SpriteAnimationController({ onEvent: e => events.push(e) }), a = actor();
  const options = { physicalActor: a, reducedMotion: true };
  controller.sample('mara', walk, 0, options);
  for (let frame = 1; frame <= 120; frame++) {
    a.x += a.vx / 60; const sample = controller.sample('mara', walk, frame / 60, options);
    assert.equal(sample.frame, clip.frames[0]);
  }
  assert.deepEqual(events, []); near(controller.humanPatrolStatesV133.get('mara').distance, 44);
});
test('controller reset drops the old actor and each crew member retains its own gait', () => {
  const controller = new SpriteAnimationController(), first = actor(), second = { ...actor(), vx: 100 };
  controller.sample('first', walk, 0, { physicalActor: first }); controller.sample('second', walk, 0, { physicalActor: second });
  first.x += 2.2; second.x += 10;
  controller.sample('first', walk, .1, { physicalActor: first }); controller.sample('second', walk, .1, { physicalActor: second });
  near(controller.humanPatrolStatesV133.get('first').distance, 2.2); near(controller.humanPatrolStatesV133.get('second').distance, 10);
  controller.reset('first'); assert.equal(controller.humanPatrolStatesV133.has('first'), false);
  assert.equal(controller.humanPatrolStatesV133.has('second'), true); controller.reset(); assert.equal(controller.humanPatrolStatesV133.size, 0);
});
