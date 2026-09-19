import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAYER_AIR_POSES_V87, advancePlayerAirPresentationV87 as advance } from '../src/player-airborne-presentation-v87.js';
import { resolvePlayerAnimation, resolveSpriteClip, SpriteAnimationController } from '../src/sprite-animation-runtime.js';

const base = Object.freeze({ alive: true, grounded: true, climbing: false, vx: 0, vy: 0, x: 20, y: 300, w: 42, h: 92 });
const air = overrides => ({ ...base, grounded: false, ...overrides });
const sample = (controller, actor, time, options = {}) => controller.sample('j1', resolvePlayerAnimation(actor), time, { physicalActor: actor, ...options });

test('existing poses are explicit: airborne 9/10 only; reception 11 is separate, legacy remains inspectable', () => {
  assert.deepEqual(PLAYER_AIR_POSES_V87, { takeoff: 9, rise: 9, apex: 10, fall: 10, land: 11 });
  for (const [phase, frame] of Object.entries(PLAYER_AIR_POSES_V87)) {
    const clip = resolveSpriteClip('player.echo9-marine.locomotion', phase);
    assert.deepEqual(clip.frames, [frame]);
    assert.deepEqual(clip.events, [], 'physical events must not be clock-driven clip events');
  }
  assert.deepEqual(resolveSpriteClip('player.echo9-marine.locomotion', 'jump-fall').frames, [8, 9, 10, 11]);
});

test('physical impulse, apex and ground contact are observed once and never predicted by clip time', () => {
  let state = advance(null, base, 0);
  const rows = [
    [.01, air({ vy: -646 }), 'takeoff', ['jump:impulse']],
    [.1, air({ vy: -475 }), 'rise', []],
    [.26, air({ vy: -171 }), 'rise', []],
    [.35, air({ vy: 0 }), 'apex', ['jump:apex']],
    [.4, air({ vy: 95 }), 'apex', []],
    [.41, air({ vy: 114 }), 'fall', []],
    [.55, air({ vy: 380 }), 'fall', []],
    [.69, base, 'land', ['ground:contact']],
    [.74, base, 'land', []],
    [.8, base, 'grounded', []]
  ];
  for (const [time, actor, phase, events] of rows) {
    state = advance(state, actor, time);
    assert.equal(state.phase, phase); assert.deepEqual(state.events, events);
    const repeated = advance(state, actor, time);
    assert.equal(repeated.phase, phase); assert.deepEqual(repeated.events, []);
    state = repeated;
  }
});

test('falling from an edge or loading an airborne save never invents takeoff or apex', () => {
  for (const initial of [null, advance(null, base, 0)]) {
    const state = advance(initial, air({ vy: 450 }), .01);
    assert.equal(state.phase, 'fall'); assert.deepEqual(state.events, []);
  }
  const controller = new SpriteAnimationController();
  for (const time of [1, 1.1, 1.2, 1.3, 1.4, 1.5]) {
    const result = sample(controller, air({ vy: 450 }), time);
    assert.equal(result.frame, 10); assert.equal(result.clip.id, 'fall');
    assert.deepEqual(result.events, []);
  }
});

test('ascent never reaches the reception pose just because time has elapsed', () => {
  const controller = new SpriteAnimationController();
  sample(controller, base, 0);
  for (let index = 1; index <= 30; index++) {
    const result = sample(controller, air({ vy: -100 }), index * .05);
    assert.equal(result.frame, 9);
    assert.ok(['takeoff', 'rise'].includes(result.clip.id));
    assert.ok(!result.events.some(event => event.event === 'jump:apex' || event.event === 'ground:contact'));
  }
});

for (const injury of [{ v52HurtClock: .42 }, { shockClock: .42 }]) {
  test(`injury ${Object.keys(injury)[0]} in flight preserves physical phase and cannot replay impulse`, () => {
    const emitted = [], controller = new SpriteAnimationController({ onEvent: event => emitted.push(event) });
    sample(controller, air({ vy: 200 }), 1);
    assert.equal(sample(controller, air({ vy: 220, ...injury }), 1.1).clip.id, 'hurt');
    assert.equal(sample(controller, air({ vy: 240, ...injury }), 1.2).frame, 12);
    const recovered = sample(controller, air({ vy: 300 }), 1.3);
    assert.equal(recovered.frame, 10); assert.equal(recovered.clip.id, 'fall');
    assert.ok(emitted.every(event => !event.event.startsWith('jump:')));
    assert.equal(sample(controller, base, 1.4).clip.id, 'land');
    assert.equal(emitted.filter(event => event.event === 'ground:contact').length, 1);
  });
}

test('landing while injured still records contact, without overriding hurt/death priorities', () => {
  const controller = new SpriteAnimationController();
  sample(controller, air({ vy: 300 }), 0);
  const hurt = sample(controller, { ...base, v52HurtClock: .42 }, .1);
  assert.equal(hurt.clip.id, 'hurt'); assert.equal(hurt.motionV87.phase, 'land');
  assert.deepEqual(hurt.motionV87.events, ['ground:contact']);
  assert.equal(sample(controller, { ...base, alive: false, v52HurtClock: .42 }, .12).clip.id, 'death');
  assert.equal(sample(controller, { ...base, alive: false }, .22).motionV87.phase, 'inactive');
});

test('ladder entry/exit never manufacture landing; a real detach impulse is distinct', () => {
  let state = advance(null, base, 0);
  state = advance(state, air({ climbing: true, vy: -185 }), .1);
  assert.equal(state.phase, 'climb'); assert.deepEqual(state.events, []);
  const steppedOff = advance(state, base, .2);
  assert.equal(steppedOff.phase, 'grounded'); assert.deepEqual(steppedOff.events, []);
  const detached = advance(state, air({ vy: -470, ladderDetachClock: .2 }), .2);
  assert.equal(detached.phase, 'takeoff'); assert.deepEqual(detached.events, ['jump:impulse']);
  const lostGrip = advance(state, air({ vy: 200 }), .2);
  assert.equal(lostGrip.phase, 'fall'); assert.deepEqual(lostGrip.events, []);
});

test('pause/repeated draw and reduced motion cannot advance landing or duplicate events', () => {
  const emitted = [], controller = new SpriteAnimationController({ onEvent: event => emitted.push(event) });
  sample(controller, air({ vy: 200 }), 1);
  const contact = sample(controller, base, 1.1, { reducedMotion: true });
  assert.equal(contact.frame, 11);
  for (let index = 0; index < 10; index++) {
    const repeated = sample(controller, base, 1.1, { emit: false, reducedMotion: true });
    assert.equal(repeated.clip.id, 'land'); assert.equal(repeated.frame, 11);
    assert.deepEqual(repeated.events, []);
  }
  assert.equal(emitted.filter(event => event.event === 'ground:contact').length, 1);
  assert.equal(sample(controller, base, 1.21).clip.id, 'idle');
});

test('render-only observers receive physical edges without emitting gameplay callbacks', () => {
  const emitted = [], controller = new SpriteAnimationController({ onEvent: event => emitted.push(event) });
  sample(controller, base, 0, { emit: false });
  const result = sample(controller, air({ vy: -600 }), .1, { emit: false });
  assert.deepEqual(result.motionV87.events, ['jump:impulse']);
  assert.deepEqual(result.events, []); assert.deepEqual(emitted, []);
});

test('J1/J2 states and controller reset are independent', () => {
  const controller = new SpriteAnimationController();
  sample(controller, air({ vy: 400 }), 1);
  controller.sample('j2', resolvePlayerAnimation(base), 1, { physicalActor: base });
  assert.equal(sample(controller, base, 1.1).clip.id, 'land');
  assert.equal(controller.sample('j2', resolvePlayerAnimation(air({ vy: -400 })), 1.1, { physicalActor: air({ vy: -400 }) }).clip.id, 'takeoff');
  assert.deepEqual(controller.snapshot().map(row => [row.entityId, row.motionV87.phase]), [['j1', 'land'], ['j2', 'takeoff']]);
  controller.reset('j1');
  assert.equal(controller.playerAirStatesV87.has('j1'), false);
  assert.equal(controller.playerAirStatesV87.has('j2'), true);
  assert.equal(sample(controller, base, 1.12).clip.id, 'idle');
  controller.reset(); assert.equal(controller.playerAirStatesV87.size, 0);
});

for (const scenario of ['clock-rewind', 'unobserved-gap', 'position-transfer', 'context-transfer']) {
  test(`${scenario} reseeds without invented landing, even at identical coordinates`, () => {
    const before = advance(null, air({ vy: 300 }), 10, 'room-a');
    const actor = scenario === 'position-transfer' ? { ...base, x: 900 } : base;
    const time = scenario === 'clock-rewind' ? 1 : scenario === 'unobserved-gap' ? 11 : 10.1;
    const next = advance(before, actor, time, scenario === 'context-transfer' ? 'room-b' : 'room-a');
    assert.equal(next.reseeded, true); assert.equal(next.phase, 'grounded'); assert.deepEqual(next.events, []);
  });
}

test('invalid physical input cannot mutate actor/save, synthesize events or throw', () => {
  const actor = Object.freeze({ ...base, grounded: false, vy: -400 });
  const before = JSON.stringify(actor), state = advance(null, actor, 0);
  advance(state, actor, .1); assert.equal(JSON.stringify(actor), before);
  assert.ok(Object.isFrozen(state)); assert.ok(Object.isFrozen(state.events));
  for (const bad of [null, {}, { ...actor, grounded: 1 }, { ...actor, vy: NaN }, { ...actor, vy: Infinity }]) assert.equal(advance(state, bad, .1), null);
  for (const time of [-1, NaN, Infinity, '1']) assert.equal(advance(state, actor, time), null);
});

test('an ungrounded zero-velocity respawn at the floor does not manufacture a landing on its first collision pass', () => {
  const seeded = advance(null, air({ vy: 0 }), 1);
  const supported = advance(seeded, base, 1.01);
  assert.equal(supported.phase, 'grounded'); assert.deepEqual(supported.events, []);
});
