import test from 'node:test';
import assert from 'node:assert/strict';
import { advanceHumanPatrolAnimationV133 } from '../src/human-patrol-animation-v133.js';
import { NPC_MISSION_IDENTITIES_V56 } from '../src/npc-mission-runtime-v55.js';
import { SpriteAnimationController, resolveNpcAnimation, resolveSpriteClip } from '../src/sprite-animation-runtime.js';

const DT = 1 / 60;
const near = (actual, expected, label = 'phase') => assert.ok(Math.abs(actual - expected) < 1e-8,
  `${label}: ${actual} differs from ${expected}`);
const createActor = crewId => ({ crewId, x: 200, y: 532, w: 44, h: 92, vx: 70,
  alive: true, grounded: true, facing: 1 });
const walkingClip = resolveSpriteClip('npc.mara-vega.locomotion', 'walk');

function establishPatrol(controller, actor, { frames = 79, context = 'mission:observed-room' } = {}) {
  const options = { physicalActor: actor, physicalContext: context };
  controller.sample('observed-crew', resolveNpcAnimation(actor), 0, options);
  let sample;
  for (let tick = 1; tick <= frames; tick++) {
    actor.x += actor.vx * DT;
    sample = controller.sample('observed-crew', resolveNpcAnimation(actor), tick * DT, options);
  }
  assert.ok(sample.humanPatrolV133.moving);
  assert.ok(sample.humanPatrolV133.cycles > 1);
  return { sample, time: frames * DT, options };
}

test('a correction at a frozen clock cannot spend a patrol step or replay it on the next live sample', () => {
  const actor = createActor('crew-01-mara-vega');
  let state = advanceHumanPatrolAnimationV133(null, actor, walkingClip, 0);
  actor.x += 7;
  state = advanceHumanPatrolAnimationV133(state, actor, walkingClip, .1);
  const before = state;
  actor.x += 2;
  state = advanceHumanPatrolAnimationV133(state, actor, walkingClip, .1);
  near(state.distance, before.distance, 'frozen-clock distance');
  near(state.cycles, before.cycles, 'frozen-clock cycles');
  assert.equal(state.step, before.step); assert.equal(state.moving, false);
  assert.equal(state.stepsPerSecond, 0); assert.equal(state.suppressEvents, true);
  assert.equal(state.reseeded, false);
  actor.x += actor.vx * DT;
  state = advanceHumanPatrolAnimationV133(state, actor, walkingClip, .1 + DT);
  near(state.distance, before.distance + actor.vx * DT, 'only the new live movement counts');
});

test('a same-chart floor jump or large frozen-clock relocation starts a silent observation rather than a walking phase', () => {
  for (const correction of [{ x: 2000 }, { y: 440 }]) {
    const actor = createActor('crew-01-mara-vega');
    let state = advanceHumanPatrolAnimationV133(null, actor, walkingClip, 0);
    actor.x += 7; state = advanceHumanPatrolAnimationV133(state, actor, walkingClip, .1);
    assert.ok(state.cycles > 0);
    Object.assign(actor, correction); actor.x += 1;
    const corrected = advanceHumanPatrolAnimationV133(state, actor, walkingClip, correction.y ? .1 + DT : .1);
    assert.equal(corrected.distance, 0); assert.equal(corrected.cycles, 0);
    assert.equal(corrected.moving, false); assert.equal(corrected.reseeded, true);
    assert.equal(corrected.suppressEvents, true);
    actor.x += actor.vx * DT;
    const live = advanceHumanPatrolAnimationV133(corrected, actor, walkingClip, corrected.time + DT);
    near(live.distance, actor.vx * DT); assert.equal(live.moving, true);
  }
});

test('supported live travel remains distance-owned at12,30,60and120Hz with small floor corrections', () => {
  const results = [12, 30, 60, 120].map(rate => {
    const actor = createActor('crew-01-mara-vega');
    let state = advanceHumanPatrolAnimationV133(null, actor, walkingClip, 0);
    for (let tick = 1; tick <= rate * 2; tick++) {
      actor.x += actor.vx / rate; actor.y = 532 + Math.sin(tick / rate) * .5;
      state = advanceHumanPatrolAnimationV133(state, actor, walkingClip, tick / rate);
      assert.equal(state.moving, true); assert.equal(state.reseeded, false);
    }
    near(state.distance, 140); return state;
  });
  for (const state of results) near(state.cycles, results[0].cycles);
});

const actions = [
  { name: 'idle', patch: { vx: 0 } },
  { name: 'ready', patch: { vx: 0, combatReady: true } },
  { name: 'fire', patch: { firing: true } },
  { name: 'role-support', patch: { supporting: true } },
  { name: 'hurt', patch: { hurt: true } },
  { name: 'cover', patch: { crouching: true } }
];

test('all16allies retain their own supported walking phase through real action requests and resume without a step burst', () => {
  const identities = Object.values(NPC_MISSION_IDENTITIES_V56);
  assert.equal(identities.length, 16);
  for (const identity of identities) for (const action of actions) {
    const actor = createActor(identity.crewId), events = [];
    const controller = new SpriteAnimationController({ onEvent: event => events.push(event) });
    const established = establishPatrol(controller, actor), before = established.sample.humanPatrolV133;
    const clean = { ...actor };
    Object.assign(actor, action.patch);
    for (let tick = 1; tick <= 60; tick++) {
      // Several authored actions own the full body while the physical squad
      // can still translate. That translation never becomes later footfalls.
      actor.x += actor.vx * DT;
      const sample = controller.sample('observed-crew', resolveNpcAnimation(actor), established.time + tick * DT, established.options);
      assert.equal(sample.clip.id, action.name, identity.crewId + ':' + action.name);
      assert.equal(sample.humanPatrolV133, null, 'the action retains its own authored frame clock');
      const held = controller.humanPatrolStatesV133.get('observed-crew');
      assert.ok(held); near(held.distance, before.distance); near(held.cycles, before.cycles);
      assert.equal(held.moving, false); assert.equal(held.suppressEvents, true);
      assert.equal(held.context, before.context);
    }
    const actionPosition = actor.x;
    for (const key of Object.keys(action.patch)) delete actor[key];
    Object.assign(actor, clean, { x: actionPosition + clean.vx * DT });
    const eventCount = events.length;
    const resumed = controller.sample('observed-crew', resolveNpcAnimation(actor), established.time + 1 + DT, established.options);
    const gait = resumed.humanPatrolV133;
    assert.ok(gait?.moving); assert.equal(gait.resumedFromActionV167, true);
    assert.equal(gait.reseeded, false); assert.equal(gait.suppressEvents, true);
    near(gait.distance, before.distance + clean.vx * DT);
    near(gait.cycles, before.cycles + clean.vx * DT / before.stride);
    assert.equal(events.length, eventCount, 'returning to walk cannot replay old markers');
    const drawn = controller.sample('observed-crew', resolveNpcAnimation(actor), established.time + 1 + DT,
      { ...established.options, emit: false });
    assert.equal(drawn.frame, resumed.frame); near(drawn.humanPatrolV133.cycles, gait.cycles);
    actor.x += actor.vx * DT;
    const next = controller.sample('observed-crew', resolveNpcAnimation(actor), established.time + 1 + 2 * DT, established.options);
    assert.equal(next.humanPatrolV133.resumedFromActionV167, false);
    near(next.humanPatrolV133.distance, before.distance + 2 * clean.vx * DT);
    assert.ok(events.length - eventCount <= 1);
  }
});

test('retaining the last walk cannot alter an action frame, event, completion state or reduced-motion clock', () => {
  for (const action of actions) for (const reducedMotion of [false, true]) {
    const actor = createActor('crew-02-tamsin-velez');
    const real = new SpriteAnimationController(), reference = new SpriteAnimationController();
    const established = establishPatrol(real, actor);
    Object.assign(actor, action.patch);
    const options = { ...established.options, reducedMotion };
    for (let tick = 1; tick <= 60; tick++) {
      actor.x += actor.vx * DT;
      const time = established.time + tick * DT, request = resolveNpcAnimation(actor);
      const sample = real.sample('observed-crew', request, time, options);
      const control = reference.sample('observed-crew', request, time, options);
      assert.equal(sample.frame, control.frame); assert.equal(sample.elapsed, control.elapsed);
      assert.equal(sample.complete, control.complete); assert.deepEqual(sample.events, control.events);
      assert.equal(sample.humanPatrolV133, null);
    }
  }
});

test('death, traversal, transport, a scene change and a real teleport invalidate a held phase', () => {
  for (const patch of [{ alive: false }, { downed: true }, { grounded: false }, { climbing: true },
    { inVehicle: true }, { ventTransit: { phase: 'at-node' } }, { x: 9000 }, { y: 440 }]) {
    const actor = createActor('crew-02-tamsin-velez'), controller = new SpriteAnimationController();
    const established = establishPatrol(controller, actor);
    Object.assign(actor, patch);
    // The reviewed native fire clip remains untouched; the physical body is
    // deliberately ineligible for retaining a supported walking observation.
    controller.sample('observed-crew', { sheetId: 'npc.tamsin-velez.mission', clipId: 'fire' },
      established.time + DT, established.options);
    assert.equal(controller.humanPatrolStatesV133.has('observed-crew'), false, JSON.stringify(patch));
  }
  const actor = createActor('crew-02-tamsin-velez'), controller = new SpriteAnimationController();
  const established = establishPatrol(controller, actor);
  actor.vx = 0;
  controller.sample('observed-crew', resolveNpcAnimation(actor), established.time + DT,
    { ...established.options, physicalContext: 'mission:other-room' });
  assert.equal(controller.humanPatrolStatesV133.has('observed-crew'), false);
});

test('a foreign identity, visibility gap or clock rewind cannot inherit an old crew phase', () => {
  for (const change of ['identity', 'gap', 'rewind']) {
    const actor = createActor('crew-02-tamsin-velez'), controller = new SpriteAnimationController();
    const established = establishPatrol(controller, actor);
    if (change === 'identity') actor.crewId = 'crew-01-mara-vega';
    actor.vx = 0;
    const time = change === 'gap' ? established.time + 1 : change === 'rewind' ? .1 : established.time + DT;
    const action = controller.sample('observed-crew', resolveNpcAnimation(actor), time, established.options);
    assert.equal(action.humanPatrolV133, null);
    assert.equal(controller.humanPatrolStatesV133.has('observed-crew'), false, change);
    actor.vx = 70; actor.x += actor.vx * DT;
    const resumed = controller.sample('observed-crew', resolveNpcAnimation(actor), time + DT, established.options);
    assert.equal(resumed.humanPatrolV133.cycles, 0); assert.equal(resumed.humanPatrolV133.suppressEvents, true);
  }
});

test('non-walking initialization creates no stride state and reset discards a retained phase', () => {
  const actor = createActor('crew-02-tamsin-velez'), controller = new SpriteAnimationController();
  actor.supporting = true;
  const initial = controller.sample('observed-crew', resolveNpcAnimation(actor), 0,
    { physicalActor: actor, physicalContext: 'mission:observed-room' });
  assert.equal(initial.humanPatrolV133, null);
  assert.equal(controller.humanPatrolStatesV133.has('observed-crew'), false);
  delete actor.supporting;
  const established = establishPatrol(controller, actor);
  actor.vx = 0;
  controller.sample('observed-crew', resolveNpcAnimation(actor), established.time + DT, established.options);
  assert.equal(controller.humanPatrolStatesV133.get('observed-crew').interruptedV167, true);
  controller.reset('observed-crew');
  assert.equal(controller.humanPatrolStatesV133.has('observed-crew'), false);
});
