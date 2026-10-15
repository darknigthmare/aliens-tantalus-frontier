import assert from 'node:assert/strict';
import { test } from 'node:test';
import { advanceNpcLifeV136, resolveNpcLifeAnimationV136, withHubNpcLifeV136 } from '../src/npc-life-v136.js';
import { resolveNpcAnimation, SpriteAnimationController } from '../src/sprite-animation-runtime.js';

const marine = (id, x, direction = 1, extra = {}) => ({ id, crewId: id, roomId: 'bridge',
  x, y: 532, w: 44, h: 92, min: 100, max: 650, mobile: true, alive: true,
  vx: 0, patrolSpeed: 22, resumeVx: direction * 22, ...extra });

function run(actors, seconds, { rate = 60, ...options } = {}) {
  const frames = [];
  for (let frame = 0; frame < seconds * rate; frame++) {
    for (const actor of actors) {
      const state = advanceNpcLifeV136(actor.lifeV136, actor, 1 / rate, { ...options, peers: actors });
      Object.assign(actor, { lifeV136: state, x: state.x, vx: state.actualVelocity, facing: state.facing });
    }
    frames.push(actors.map(a => ({ id: a.id, x: a.x, vx: a.vx, facing: a.facing, life: { ...a.lifeV136 } })));
  }
  return frames;
}

function assertSpacing(frames, order) {
  for (const frame of frames) for (let i = 1; i < order.length; i++) {
    const left = frame.find(a => a.id === order[i - 1]), right = frame.find(a => a.id === order[i]);
    assert.ok(right.x - left.x >= 56 - 1e-7, `${left.id} / ${right.id} must retain their body widths and standing gap`);
  }
}

test('opposing patrols brake for each other, hold, turn and leave without crossing', () => {
  const frames = run([marine('left', 100), marine('right', 340, -1)], 35);
  assertSpacing(frames, ['left', 'right']);
  for (const id of ['left', 'right']) {
    const states = frames.map(frame => frame.find(a => a.id === id));
    const yields = states.filter(a => a.life.yieldingTo);
    assert.ok(yields.length > 5, 'The encounter must anticipate a body, rather than stop at overlap.');
    assert.ok(yields.some(a => Math.abs(a.vx) > 2 && Math.abs(a.vx) < 20));
    assert.ok(states.some(a => a.life.dwell > .2 && Math.abs(a.vx) < .1));
    assert.ok(states.some(a => id === 'left' ? a.vx < -20 : a.vx > 20), 'Both people must leave the encounter.');
    for (let i = 1; i < states.length; i++) {
      assert.ok(Math.abs(states[i].x - states[i - 1].x) <= 27 / 60 + 1e-7, 'No position correction may teleport a crew member.');
      if (states[i].life.yieldingTo || states[i - 1].life.yieldingTo) {
        assert.ok(Math.abs(states[i].vx - states[i - 1].vx) * 60 <= 92.001,
          'An ordinary peer encounter must brake within the actual acceleration bound, rather than clamp a moving body.');
      }
      if (Math.abs(states[i].vx) < .1) assert.equal(states[i].facing, states[i - 1].facing);
    }
  }
});

test('three-person congestion remains separated and every patrol resumes across frame rates', () => {
  for (const rate of [30, 60, 120]) {
    const frames = run([marine('a', 100), marine('b', 260, -1), marine('c', 430, -1)], 45, { rate });
    assertSpacing(frames, ['a', 'b', 'c']);
    for (const id of ['a', 'b', 'c']) {
      const states = frames.map(frame => frame.find(a => a.id === id));
      assert.ok(states.slice(-rate * 10).some(a => Math.abs(a.vx) > 20), `Patrol ${id} must not remain deadlocked.`);
      assert.ok(states.every(a => Math.abs(a.vx) <= 27.001));
    }
  }
});

test('unrelated floors and the actor itself do not slow a free patrol; a stationary colleague does', () => {
  const free = run([marine('solo', 100)], 3).at(-1)[0];
  const otherFloor = run([marine('solo', 100), marine('upstairs', 170, -1, { y: 232 })], 3).at(-1)[0];
  assert.equal(otherFloor.x, free.x); assert.ok(Math.abs(otherFloor.vx - 27) < 1e-8);
  const frames = run([marine('walker', 100), marine('specialist', 260, 1, { mobile: false, min: 260, max: 260 })], 18);
  assertSpacing(frames, ['walker', 'specialist']);
  assert.ok(frames.some(f => f[0].life.yieldingTo === 'specialist'));
  assert.ok(frames.some(f => f[0].vx < -20));
  assert.ok(frames.every(f => f[1].x === 260));
});

test('a real closed leaf remains authoritative during a peer encounter and opening it allows travel', () => {
  const actors = [marine('left', 100), marine('right', 340, -1)];
  const door = { x: 230, y: 426, w: 20, h: 198 };
  const closed = run(actors, 10, { colliders: [door] });
  assertSpacing(closed, ['left', 'right']);
  assert.ok(closed.every(f => f[0].x + 44 <= 230 && f[1].x >= 250));
  assert.equal(actors[0].lifeV136.mode, 'blocked'); assert.equal(actors[1].lifeV136.mode, 'blocked');
  const opened = run(actors, 15);
  assertSpacing(opened, ['left', 'right']);
  assert.ok(opened.some(f => f.some(a => a.life.yieldingTo)));
  assert.ok(opened.some(f => f[0].vx < -20 && f[1].vx > 20));
});

test('an occupied approach abandons its work visit and physically returns without a phantom work pose', () => {
  const room = { id: 'bridge', xStart: 0, xEnd: 1280, propRenderBounds: { x: 300, y: 536, w: 60, h: 88 } };
  const actors = [marine('worker', 100, 1, { mobile: false, min: 100, max: 100, routinePhaseV62: 'work' }),
    marine('colleague', 180, 1, { mobile: false, min: 180, max: 180 })];
  const frames = run(actors, 35, { room });
  assertSpacing(frames, ['worker', 'colleague']);
  assert.ok(frames.some(f => f[0].life.tripPhase === 'approach'));
  assert.ok(frames.some(f => f[0].life.tripPhase === 'return' && f[0].vx < -1));
  assert.ok(!frames.some(f => f[0].life.tripPhase === 'work'));
  const returned = frames.find(f => f[0].life.time > 16 && f[0].life.tripPhase === 'rest');
  assert.ok(returned && Math.abs(returned[0].x - 100) < .4);
});

test('pause freezes the encounter, reduced motion retains physical travel, rebuilds discard only runtime courtesy state', () => {
  const normal = [marine('left', 100), marine('right', 340, -1)];
  const reduced = structuredClone(normal);
  const frames = run(normal, 5), lessMotion = run(reduced, 5, { reducedMotion: true });
  assert.deepEqual(frames.map(f => f.map(a => a.x)), lessMotion.map(f => f.map(a => a.x)));
  for (const actor of normal) {
    const before = structuredClone(actor.lifeV136);
    assert.deepEqual(advanceNpcLifeV136(before, actor, 30, { peers: normal, suspended: true }), before);
    assert.deepEqual(advanceNpcLifeV136(before, actor, 0, { peers: normal }), before);
    const rebuilt = advanceNpcLifeV136(before, actor, 0, { context: 'rebuilt-deck', peers: normal });
    assert.equal(rebuilt.x, actor.x); assert.equal(rebuilt.velocity, 0); assert.equal(rebuilt.time, 0);
  }
});

test('runtime wrapper supplies its actual cohort and freezes courtesy with parent simulation pause', () => {
  class HubBase {
    npcAnimationRequest(npc) { return resolveNpcAnimation(npc); }
    getSnapshot() { return { state: structuredClone(this.state) }; }
  }
  const Hub = withHubNpcLifeV136(HubBase), hub = new Hub();
  hub.state = { deck: 0 }; hub.running = true;
  hub.npcs = [marine('left', 100), marine('right', 340, -1)];
  const saved = structuredClone(hub.state), frames = [];
  for (let i = 0; i < 1200; i++) {
    for (const npc of hub.npcs) hub.stepHubNpcLifeV136(npc, 1 / 60);
    frames.push(hub.npcs.map(n => ({ id: n.id, x: n.x })));
  }
  assertSpacing(frames, ['left', 'right']);
  assert.deepEqual(hub.state, saved);
  const paused = structuredClone(hub.npcs); hub.running = false; hub.tickParentNpcLifeV136(.1);
  assert.deepEqual(hub.npcs, paused);
  assert.ok(hub.getSnapshot().npcLifeV136.every(n => Number.isFinite(n.time)));
});

test('distance-owned animation produces no phantom footsteps during the courtesy hold', () => {
  const actors = [marine('npc-mara', 100, 1, { crewId: 'crew-01-mara-vega' }), marine('peer', 260, -1)];
  const events = [], controller = new SpriteAnimationController({ onEvent: event => events.push(event) });
  let heldSamples = 0;
  const frames = run(actors, 14);
  for (let i = 0; i < frames.length; i++) {
    const sample = frames[i][0], physicalActor = { ...actors[0], x: sample.x, vx: sample.vx, facing: sample.facing };
    const before = events.length;
    const request = resolveNpcLifeAnimationV136(physicalActor, sample.life, resolveNpcAnimation(physicalActor));
    controller.sample('mara', request, i / 60, { physicalActor });
    if (sample.life.dwell > 0 && Math.abs(sample.vx) < .1) {
      heldSamples++;
      assert.ok(!events.slice(before).some(event => event.event.startsWith('audio:footstep')),
        'A stationary held body cannot emit a walking contact.');
    }
  }
  assert.ok(heldSamples > 20);
  assert.ok(events.some(event => event.event.startsWith('audio:footstep')), 'The same controller must still report real walking contacts.');
});
