import test from 'node:test';
import assert from 'node:assert/strict';
import { HUB_DECKS, HUB_WORLD, HubGame as BaseHub } from '../src/hub-game.js';
import { HubGame as PhysicalHub, HUB_TRAVERSAL_PROFILES_V60 } from '../src/hub-v51-runtime.js';
import { HubGame } from '../src/hub-onboarding-v84.js';

const cic = HUB_DECKS[0].rooms.find(room => room.id === 'combat-information');
const consoleCollider = cic.geometry[0];
const cryo = HUB_DECKS[0].rooms.find(room => room.id === 'cryo-bay');
const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 0.001, message + ': ' + actual + ' != ' + expected);

function withHub(run) {
  const names = ['Image', 'addEventListener', 'requestAnimationFrame', 'performance', 'matchMedia'];
  const before = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const values = {
    Image: class {
      constructor() { this.complete = true; this.naturalWidth = 1920; this.naturalHeight = 720; }
      set src(value) { this.currentSrc = value; }
    },
    addEventListener() {}, requestAnimationFrame: () => 0, performance: { now: () => 1000 },
    matchMedia: () => ({ matches: false })
  };
  for (const name of names) Object.defineProperty(globalThis, name, { value: values[name], configurable: true, writable: true });
  const gradient = { addColorStop() {} };
  const context = new Proxy({
    measureText: value => ({ width: String(value).length * 8 }),
    createLinearGradient: () => gradient, createRadialGradient: () => gradient
  }, { get: (object, key) => key in object ? object[key] : () => {},
    set: (object, key, value) => { object[key] = value; return true; } });
  const canvas = { width: 1280, height: 720, getContext: () => context, addEventListener() {}, focus() {} };
  const persisted = [];
  let hub;
  try {
    hub = new HubGame(canvas, { onPersist: value => persisted.push(structuredClone(value)) });
    const start = x => {
      hub.stop(false);
      const room = HUB_DECKS[0].rooms[Math.floor((x + 22) / HUB_WORLD.roomWidth)];
      hub.start({ deck: 0, roomId: room.id, positionX: x, visited: [room.id], playerHealth: 100 });
      return hub;
    };
    start(cic.x);
    return run({ hub, start, context, persisted });
  } finally {
    hub?.stop(false);
    for (const [name, descriptor] of before) descriptor
      ? Object.defineProperty(globalThis, name, descriptor) : delete globalThis[name];
  }
}

function tick(hub, seconds, fps) {
  for (let frame = 0; frame < Math.round(seconds * fps); frame += 1) hub.update(1 / fps);
}

test('CIC V84 retains the same independent artwork, interaction volume and keyboard support; cryopod stays solid', () => {
  assert.equal(cic.prop, '/assets/openai/hub/props/sensor-console.png');
  assert.equal(cic.propRenderBounds.h, 136);
  close(cic.propRenderBounds.w, 215 * 136 / 188, 'unmodified bitmap aspect ratio');
  assert.equal(consoleCollider.collisionMode, 'one-way-top');
  assert.equal(consoleCollider.y, 554);
  assert.equal(consoleCollider.h, 70);
  assert.equal(consoleCollider.collisionOnly, true);
  assert.ok(cic.propInteractionBounds.w > consoleCollider.w);
  assert.equal(cryo.geometry[0].collisionMode, undefined);
  assert.deepEqual([cryo.geometry[0].x, cryo.geometry[0].y, cryo.geometry[0].w, cryo.geometry[0].h], [4642, 570, 188, 54]);
});

for (const fps of [30, 60, 120]) for (const direction of [-1, 1]) {
  test('CIC foreground walk crosses the console, direction=' + direction + ', fps=' + fps, () => withHub(({ hub, start }) => {
    start(direction > 0 ? consoleCollider.x - 120 : consoleCollider.x + consoleCollider.w + 120);
    hub.keys.add(direction > 0 ? 'KeyD' : 'KeyA');
    tick(hub, 2.4, fps);
    assert.ok(direction > 0 ? hub.player.x > consoleCollider.x + consoleCollider.w
      : hub.player.x + hub.player.w < consoleCollider.x, 'walk crossed the full rear-plane console');
    close(hub.player.y + hub.player.h, HUB_WORLD.floorY, 'walk remains on the deck');
  }));

  test('CIC jump and continued walk cannot trap the Marine under the service duct, direction=' + direction + ', fps=' + fps, () => withHub(({ hub, start }) => {
    start(direction > 0 ? consoleCollider.x - 80 : consoleCollider.x + consoleCollider.w + 60);
    hub.keys.add(direction > 0 ? 'KeyD' : 'KeyA');
    hub.jumpQueued = 0.14;
    tick(hub, 4, fps);
    assert.ok(direction > 0 ? hub.player.x > consoleCollider.x + consoleCollider.w + 80
      : hub.player.x + hub.player.w < consoleCollider.x - 80, 'jump recovery resumes travel instead of a permanent side trap');
  }));

  test('actual V84 corridor links cryo and briefing on foot, direction=' + direction + ', fps=' + fps, () => withHub(({ hub, start }) => {
    start(direction > 0 ? 1920 : 4560);
    hub.keys.add(direction > 0 ? 'KeyD' : 'KeyA');
    tick(hub, 11.5, fps);
    assert.ok(direction > 0 ? hub.player.x > 4300 : hub.player.x < 2250,
      'crossed physical CIC and bulkhead doors without teleport, removed obstacles or prologue overrides');
    close(hub.player.y + hub.player.h, HUB_WORLD.floorY, 'corridor remains at deck height');
    if (direction > 0) assert.ok(hub.player.x + hub.player.w <= cryo.geometry[0].x + 0.001, 'the cryopod still stops ground movement');
  }));
}

test('both inherited collision implementations keep one-way landing and reject side/below snapping', () => {
  for (const Class of [BaseHub, PhysicalHub]) {
    const state = {
      player: { x: consoleCollider.x + 20, y: consoleCollider.y - 92 + 2, w: 44, h: 92, vx: 180, vy: 120, grounded: false },
      obstacles: [consoleCollider], doorStates: [], v51Platforms: [], v51Doors: [], v51Walls: [], v51Vents: [], useGlobalFloor: true
    };
    Class.prototype.resolveVertical.call(state, consoleCollider.y - 1);
    close(state.player.y + state.player.h, consoleCollider.y, 'descending actor is supported by keyboard surface');
    assert.equal(state.player.grounded, true);
    Object.assign(state.player, { y: HUB_WORLD.floorY - 92, vy: 20, grounded: false });
    Class.prototype.resolveVertical.call(state, HUB_WORLD.floorY - 1);
    close(state.player.y + state.player.h, HUB_WORLD.floorY, 'foreground actor is never snapped onto the rear console');
  }
});

test('physical upper route remains authored and supports both vent and ladder access', () => {
  const profile = HUB_TRAVERSAL_PROFILES_V60[cic.id];
  const service = profile.vents.find(vent => vent.id === 'cic-service-vent');
  const support = profile.platforms.find(platform => platform.id === 'cic-low');
  assert.equal(service.y + service.h, support.y);
  assert.ok(service.x >= support.x && service.x + service.w <= support.x + support.w, 'vent remains attached to its real catwalk');
  assert.ok(consoleCollider.x - (cic.xStart + service.x + service.w) >= 44 + 12,
    'a full-width Marine can leave the keyboard before encountering the duct');
  assert.equal(support.x + support.w, 1100, 'the existing right catwalk endpoint and ladder attachment are preserved');
  assert.ok(profile.ladders.some(ladder => ladder.id === 'cic-floor' && ladder.top === support.y && ladder.bottom === HUB_WORLD.floorY));
});

test('production painter order keeps console behind the player and collider invisible; station remains usable', () => withHub(({ hub, start, context }) => {
  start(cic.x);
  const order = [];
  const prop = hub.drawInteractionProp.bind(hub);
  const player = hub.drawPlayer.bind(hub);
  const obstacle = hub.drawObstacle.bind(hub);
  hub.drawInteractionProp = (ctx, room) => { if (room.id === cic.id) order.push('console'); return prop(ctx, room); };
  hub.drawPlayer = ctx => { order.push('player'); return player(ctx); };
  hub.drawObstacle = (ctx, collider) => { if (collider.roomId === cic.id) assert.equal(collider.collisionOnly, true); return obstacle(ctx, collider); };
  hub.drawWorld(context);
  assert.equal(order.filter(entry => entry === 'console').length, 1);
  assert.ok(order.indexOf('console') < order.indexOf('player'), '2D walking lane is visibly in front of the console');
  assert.equal(hub.nearestInteraction()?.id, cic.id);
}));

test('saved foreground position resumes inside the console projection without entrapment', () => withHub(({ hub, start, persisted }) => {
  start(cic.x);
  hub.persist();
  const state = structuredClone(persisted.at(-1));
  hub.stop(false);
  hub.start(state);
  hub.keys.add('KeyA');
  tick(hub, 2, 60);
  assert.ok(hub.player.x + hub.player.w < consoleCollider.x);
  close(hub.player.y + hub.player.h, HUB_WORLD.floorY, 'restored foreground remains playable');
}));

test('regression fixture: restoring the old duct overlap traps a rightward jump despite one-way console', () => withHub(({ hub, start }) => {
  start(consoleCollider.x - 80);
  const duct = hub.v51Vents.find(vent => vent.id === 'cic-service-vent');
  duct.x = cic.xStart + 850; // Previous authored placement, not an application workaround.
  hub.keys.add('KeyD');
  hub.jumpQueued = 0.14;
  tick(hub, 4, 60);
  assert.ok(hub.player.x < consoleCollider.x + consoleCollider.w,
    'the former vent and console combination reproduces the reported impassable choke point');
}));
