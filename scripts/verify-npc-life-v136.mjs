import assert from 'node:assert/strict';
import { test } from 'node:test';
import { advanceNpcLifeV136, moveNpcAgainstGeometryV136, npcWorkAnchorV136,
  resolveNpcLifeAnimationV136, spreadNpcStationSpawnsV136, withHubNpcLifeV136 } from '../src/npc-life-v136.js';
import { resolveNpcAnimation, resolveSpriteClip, SpriteAnimationController } from '../src/sprite-animation-runtime.js';

const actor = extra => ({ id: 'npc-mara', crewId: 'crew-01-mara-vega', roomId: 'bridge', x: 100, y: 532,
  w: 44, h: 92, alive: true, mobile: true, min: 100, max: 300, vx: 22, resumeVx: 22,
  patrolSpeed: 22, interaction: { kind: 'intel' }, ...extra });
function simulate(subject, seconds, options = {}, rate = 60) {
  let state;
  const observations = [];
  for (let i = 0; i < seconds * rate; i++) {
    state = advanceNpcLifeV136(state, subject, 1 / rate, options);
    Object.assign(subject, { x: state.x, vx: state.actualVelocity, facing: state.facing });
    observations.push({ ...state });
  }
  return { subject, state, observations };
}
const workRoom = { id: 'bridge', xStart: 0, xEnd: 1280, propRenderBounds: { x: 300, y: 536, w: 60, h: 88 } };

test('patrols start gradually, brake before turning and retain their facing while stopped', () => {
  const { observations } = simulate(actor(), 20);
  assert.ok(observations[0].actualVelocity > 0 && observations[0].actualVelocity < 2);
  assert.ok(observations.every(s => s.x >= 100 && s.x <= 300 && Math.abs(s.actualVelocity) <= 27.001));
  const turns = observations.filter(s => s.mode === 'turn');
  assert.ok(turns.length > 20, 'The crew member must pause instead of instantly reversing at an endpoint.');
  const arrival = turns[0]; assert.equal(arrival.facing, 1);
  const departing = observations.find(s => s.time > arrival.time && s.actualVelocity < -1);
  assert.ok(departing); assert.equal(departing.facing, -1);
  assert.ok(observations.some(s => s.actualVelocity > 1 && s.actualVelocity < 15 && s.x > 290));
});

test('runtime schedule is deterministic and walking speed is consistent at 30, 60 and 120 Hz', () => {
  assert.deepEqual(simulate(actor(), 25), simulate(actor(), 25));
  const results = [30, 60, 120].map(rate => simulate(actor(), 3, {}, rate));
  for (const result of results) assert.ok(Math.abs(result.subject.x - results[1].subject.x) < .04);
});

test('closed bulkheads and solid props stop actual travel; opening one resumes smoothly', () => {
  const subject = actor({ min: 100, max: 500 });
  const box = { x: 210, y: 426, w: 16, h: 198 };
  const { state, observations } = simulate(subject, 12, { colliders: [box] });
  assert.equal(subject.x, 166); assert.equal(subject.vx, 0); assert.equal(state.mode, 'blocked');
  assert.ok(observations.every(s => s.x + subject.w <= box.x + 1e-8));
  const resumed = advanceNpcLifeV136(state, subject, 1 / 60, { colliders: [] });
  assert.ok(resumed.x > subject.x && resumed.actualVelocity < 2);
  assert.equal(moveNpcAgainstGeometryV136(actor(), 400, [box]).x, 166, 'A long frame cannot tunnel through a closed leaf.');
  assert.equal(moveNpcAgainstGeometryV136(actor(), 200, [{ ...box, collisionMode: 'one-way-top' }]).x, 200);
  assert.equal(moveNpcAgainstGeometryV136(actor(), 200, [{ ...box, y: 100, h: 30 }]).x, 200);
});

test('a purposeful work visit uses the real station, pauses there and returns without a position jump', () => {
  const subject = actor({ mobile: false, vx: 0, min: 100, max: 100, routinePhaseV62: 'work' });
  assert.equal(npcWorkAnchorV136(subject, workRoom), 240);
  const { observations } = simulate(subject, 45, { room: workRoom });
  assert.ok(observations.some(s => s.tripPhase === 'approach'));
  const working = observations.filter(s => s.tripPhase === 'work');
  assert.ok(working.length > 100); assert.ok(working.every(s => Math.abs(s.x - 240) < .4));
  assert.ok(working.some(s => s.passive?.clipId === 'role-work'));
  assert.ok(observations.some(s => s.tripPhase === 'return'));
  const returned = observations.find(s => s.time > working.at(-1).time && s.tripPhase === 'rest');
  assert.ok(returned); assert.ok(Math.abs(returned.x - 100) < .4);
  for (let i = 1; i < observations.length; i++) assert.ok(Math.abs(observations[i].x - observations[i - 1].x) <= .451);
});

test('inaccessible job props are abandoned and station anchors never cross a room boundary', () => {
  const subject = actor({ mobile: false, vx: 0, min: 100, max: 100, routinePhaseV62: 'work' });
  const box = { x: 200, y: 532, w: 30, h: 92 };
  const result = simulate(subject, 35, { room: workRoom, colliders: [box] });
  assert.ok(result.observations.every(s => s.x <= 156));
  assert.ok(!result.observations.some(s => s.tripPhase === 'work'));
  assert.equal(npcWorkAnchorV136(subject, { ...workRoom, id: 'medical' }), null);
  assert.equal(npcWorkAnchorV136(subject, { ...workRoom, propRenderBounds: { x: 1200, w: 200 } }), null);
});

test('several scheduled specialists receive separate initial standing positions without altering mobile routes', () => {
  const npcs = [actor({ mobile: false, x: 180 }), actor({ mobile: false, x: 185, crewId: 'crew-second' }),
    actor({ mobile: false, x: 175, crewId: 'crew-third' }), actor({ x: 175, crewId: 'crew-route', min: 100, max: 400 })];
  const before = structuredClone(npcs), result = spreadNpcStationSpawnsV136(npcs, [workRoom]);
  assert.deepEqual(npcs, before); assert.deepEqual(result.at(-1), npcs.at(-1));
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) assert.ok(Math.abs(result[i].x - result[j].x) >= 58);
  for (const npc of result.slice(0, 3)) { assert.equal(npc.min, npc.x); assert.equal(npc.max, npc.x); }
});

test('a busy work station is reserved for the real visit and becomes available after its owner returns', () => {
  const subject = actor({ mobile: false, vx: 0, min: 100, max: 100, routinePhaseV62: 'work' });
  const peer = actor({ crewId: 'crew-peer', x: 300, lifeV136: { tripPhase: 'approach', workX: 240 } });
  const { state, observations } = simulate(subject, 20, { room: workRoom, peers: [peer] });
  assert.ok(observations.every(s => s.tripPhase === 'rest' && s.x === 100));
  const available = advanceNpcLifeV136(state, subject, 1 / 60, { room: workRoom, peers: [{ ...peer, lifeV136: { tripPhase: 'rest', workX: 240 } }] });
  assert.equal(available.tripPhase, 'approach'); assert.ok(available.x > 100);
});

test('pausing and render-only samples cannot advance schedules, gestures or the physical route', () => {
  const subject = actor(), { state } = simulate(subject, 1);
  for (const options of [{ suspended: true }, {}]) {
    const paused = advanceNpcLifeV136(state, subject, options.suspended ? 10 : 0, options);
    assert.deepEqual(paused, state);
  }
  const request = resolveNpcAnimation(subject), before = structuredClone(state);
  for (let i = 0; i < 100; i++) resolveNpcLifeAnimationV136(subject, state, request);
  assert.deepEqual(state, before);
});

test('dialogue, alert and injured crew stop safely without passive job gestures', () => {
  for (const patch of [{ workClock: 2 }, { supportClock: 2 }, { alerted: true }, { downed: true }, { alive: false }]) {
    const subject = actor(), { state } = simulate(subject, 1);
    const x = subject.x;
    const stopped = advanceNpcLifeV136(state, { ...subject, ...patch }, 1 / 60);
    assert.equal(stopped.x, x); assert.equal(stopped.actualVelocity, 0); assert.equal(stopped.passive, null);
    assert.equal(stopped.facing, state.facing);
  }
});

test('passive schedules are per-person, use only shipped cells and reduced motion keeps a neutral idle', () => {
  const states = ['crew-01-mara-vega', 'crew-02-tamsin-velez', 'crew-03-idris-kwan'].map(crewId =>
    simulate(actor({ crewId, mobile: false, min: 100, max: 100, routinePhaseV62: 'work' }), 5).observations);
  assert.notDeepEqual(states[0].map(s => s.passive), states[1].map(s => s.passive));
  for (const sequence of states) for (const state of sequence) if (state.passive) {
    const request = resolveNpcLifeAnimationV136(actor(), state, { sheetId: 'npc.mara-vega.locomotion', clipId: 'idle' });
    assert.ok(resolveSpriteClip(request.sheetId, request.clipId).frames.includes(request.frame));
  }
  const reduced = simulate(actor({ mobile: false, min: 100, max: 100 }), 5, { reducedMotion: true });
  assert.ok(reduced.observations.every(s => s.passive?.clipId === 'idle' && s.passive.frame === 0 && s.blend === 1));
});

test('actual animation controller makes no walking steps against an occluding closed leaf', () => {
  const subject = actor({ x: 166 }), events = [], controller = new SpriteAnimationController({ onEvent: event => events.push(event) });
  let state;
  for (let i = 0; i < 600; i++) {
    state = advanceNpcLifeV136(state, subject, 1 / 60, { colliders: [{ x: 210, y: 426, w: 16, h: 198 }] });
    Object.assign(subject, { x: state.x, vx: state.actualVelocity });
    const request = resolveNpcLifeAnimationV136(subject, state, resolveNpcAnimation(subject));
    controller.sample('mara', request, i / 60, { physicalActor: subject });
  }
  assert.equal(subject.x, 166); assert.equal(subject.vx, 0);
  assert.ok(!events.some(e => e.event.startsWith('audio:footstep')));
});

test('context changes and rebuilt actors reseed with zero velocity rather than inheriting travel', () => {
  const subject = actor(), { state } = simulate(subject, 1);
  const moved = advanceNpcLifeV136(state, { ...subject, x: 3000 }, 0, { context: 'other-deck' });
  assert.equal(moved.x, 3000); assert.equal(moved.velocity, 0); assert.equal(moved.actualVelocity, 0);
  assert.equal(advanceNpcLifeV136(state, { ...subject, x: Number.NaN }, .1), null);
});

test('wrapper applies physical movement before sampling and keeps its data out of the campaign state', () => {
  class FakeHub { npcAnimationRequest(npc) { return resolveNpcAnimation(npc); } getSnapshot() { return { native: true }; } }
  const Hub = withHubNpcLifeV136(FakeHub), hub = new Hub(), subject = actor();
  hub.state = { deck: 0 }; hub.npcs = [subject];
  const originalState = structuredClone(hub.state);
  hub.stepHubNpcLifeV136(subject, 1 / 60);
  assert.ok(subject.x > 100 && subject.vx < 2); assert.equal(subject.facing, 1);
  assert.equal(hub.getSnapshot().npcLifeV136[0].x, subject.x); assert.equal(hub.getSnapshot().native, true);
  assert.deepEqual(hub.state, originalState);
  const before = structuredClone(subject);
  for (let i = 0; i < 20; i++) hub.npcAnimationRequest(subject);
  assert.deepEqual(subject, before);
});

test('annex parent tick matches normal physical travel, ignores local annex walls and emits no camera footsteps', () => {
  class FakeHub {
    npcAnimationRequest(npc) { return resolveNpcAnimation(npc); }
    sampleNpcAnimation(npc, options) {
      assert.equal(options.emit, false);
      return this.controller.sample(npc.crewId, this.npcAnimationRequest(npc), this.animationTime,
        { physicalActor: npc, physicalContext: 'hub:0:crew', ...options });
    }
  }
  const Hub = withHubNpcLifeV136(FakeHub), events = [], hub = new Hub(), reference = new Hub();
  for (const engine of [hub, reference]) {
    engine.running = true; engine.state = { deck: 0 }; engine.npcs = [actor()];
    engine.controller = new SpriteAnimationController({ onEvent: event => events.push(event) });
    engine.animationTime = 0;
  }
  // This blocker belongs to the annex's local map. It is not a parent-deck
  // obstruction and cannot stop a world-coordinate marine shown by the CCTV.
  hub.obstacles = [{ x: 150, y: 426, w: 500, h: 198 }];
  for (let frame = 0; frame < 240; frame++) {
    hub.animationTime += 1 / 60;
    hub.tickParentNpcLifeV136(1 / 60);
    reference.stepHubNpcLifeV136(reference.npcs[0], 1 / 60, { parentDeck: true });
  }
  assert.ok(hub.npcs[0].x > 180); assert.equal(hub.npcs[0].x, reference.npcs[0].x);
  assert.equal(hub.npcs[0].lifeV136.time, reference.npcs[0].lifeV136.time);
  assert.deepEqual(events, []);
  hub.controller.sample(hub.npcs[0].crewId, hub.npcAnimationRequest(hub.npcs[0]), hub.animationTime,
    { physicalActor: hub.npcs[0], physicalContext: 'hub:0:crew', emit: true });
  assert.deepEqual(events, [], 'Returning to the parent view must not replay the silent camera interval as a burst of footsteps.');
  const stopped = structuredClone(hub.npcs); hub.running = false; hub.tickParentNpcLifeV136(.1);
  assert.deepEqual(hub.npcs, stopped);
});
