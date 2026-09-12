import test from 'node:test';
import assert from 'node:assert/strict';
import { HUB_DECKS, HUB_WORLD, HubGame as BaseHub } from '../src/hub-game.js';
import { HubGame as PhysicalHub } from '../src/hub-v51-runtime.js';
import { HubGame } from '../src/hub-v71-runtime.js';

const room = HUB_DECKS.flatMap(deck => deck.rooms).find(entry => entry.id === 'briefing');
const table = room.geometry[0];
class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1920; this.naturalHeight = 720; }
  set src(value) { this.currentSrc = value; }
}
function withHub(run) {
  const names = ['Image', 'addEventListener', 'requestAnimationFrame', 'performance', 'matchMedia'];
  const previous = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const values = { Image: MockImage, addEventListener() {}, requestAnimationFrame: () => 0,
    performance: { now: () => 1000 }, matchMedia: () => ({ matches: false }) };
  for (const name of names) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: values[name] });
  const gradient = { addColorStop() {} };
  const context = new Proxy({ measureText: text => ({ width: String(text).length * 8 }),
    createLinearGradient: () => gradient, createRadialGradient: () => gradient }, {
    get: (object, key) => key in object ? object[key] : () => {},
    set: (object, key, value) => { object[key] = value; return true; }
  });
  const persisted = [];
  const canvas = { width: 1280, height: 720, getContext: () => context, addEventListener() {}, focus() {} };
  let hub;
  try {
    hub = new HubGame(canvas, { onPersist: patch => persisted.push(structuredClone(patch)) });
    const start = x => {
      hub.stop(false);
      hub.start({ deck: 0, roomId: room.id, positionX: x, visited: [room.id], playerHealth: 100 });
      assert.equal(hub.currentAnnexV71(), null);
      return hub;
    };
    start(room.x);
    return run({ hub, start, persisted, context });
  } finally {
    hub?.stop(false);
    for (const name of names) { const descriptor = previous.get(name); if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; }
  }
}
const tick = (hub, seconds, fps = 60) => { for (let index = 0; index < Math.round(seconds * fps); index++) hub.update(1 / fps); };
const close = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 0.001, `${message}: ${actual} vs ${expected}`);

test('briefing V78: only the authored table becomes one-way; render and interaction bounds stay intact', () => {
  assert.equal(room.profile.propCollider.collisionMode, 'one-way-top');
  assert.equal(table.collisionMode, 'one-way-top');
  assert.equal(room.propCollisionBounds.collisionMode, 'one-way-top');
  assert.equal(table.w, 480); assert.equal(room.propRenderBounds.w, 520);
  close(table.y + table.h, HUB_WORLD.floorY, 'table base');
  assert.equal(table.y, room.propRenderBounds.y);
  assert.ok(room.propInteractionBounds.w > table.w);
  for (const other of HUB_DECKS.flatMap(deck => deck.rooms).filter(entry => entry.id !== room.id)) {
    assert.equal(other.profile.propCollider.collisionMode, undefined, other.id);
    assert.equal(other.geometry[0].collisionMode, undefined, other.id);
  }
});

test('briefing V78: both inherited collision paths allow lateral passage and keep other props solid', () => {
  for (const Class of [BaseHub, PhysicalHub]) {
    for (const direction of [-1, 1]) {
      const previousX = direction > 0 ? table.x - 46 : table.x + table.w + 2;
      const intended = previousX + direction * 5;
      const state = { player: { x: intended, y: HUB_WORLD.floorY - 92, w: 44, h: 92, vx: direction * 200 },
        obstacles: [table], doorStates: [], v51Doors: [], v51Walls: [], v51Vents: [] };
      Class.prototype.resolveHorizontal.call(state, previousX);
      assert.equal(state.player.x, intended); assert.equal(state.player.vx, direction * 200);
      const solid = { ...table }; delete solid.collisionMode; state.obstacles = [solid];
      Class.prototype.resolveHorizontal.call(state, previousX);
      assert.equal(state.player.x, direction > 0 ? table.x - 44 : table.x + table.w);
      assert.equal(state.player.vx, 0);
    }
  }
});

test('briefing V78: actual production walking crosses the whole foreground at 30/60/120 FPS', () => withHub(({ hub, start }) => {
  for (const direction of [-1, 1]) {
    const positions = [];
    for (const fps of [30, 60, 120]) {
      start(direction > 0 ? table.x - 94 : table.x + table.w + 50);
      hub.keys.add(direction > 0 ? 'KeyD' : 'KeyA'); tick(hub, 3, fps);
      assert.ok(direction > 0 ? hub.player.x > table.x + table.w : hub.player.x + hub.player.w < table.x, `${fps} FPS / ${direction}`);
      close(hub.player.y + hub.player.h, HUB_WORLD.floorY, 'foreground walking stays on deck');
      positions.push(hub.player.x);
    }
    assert.ok(Math.max(...positions) - Math.min(...positions) < 8, `existing acceleration tolerance across FPS: ${positions}`);
  }
}));

test('briefing V78: jump passes upward, lands on the tabletop and walking off returns to the deck at every FPS', () => withHub(({ hub, start }) => {
  for (const fps of [30, 60, 120]) {
    start(room.x); hub.jumpQueued = 0.14;
    let highestFeet = HUB_WORLD.floorY;
    for (let frame = 0; frame < fps * 2; frame++) { hub.update(1 / fps); highestFeet = Math.min(highestFeet, hub.player.y + hub.player.h); }
    assert.ok(highestFeet < table.y - 10, `${fps} FPS: jump crosses the tabletop from below`);
    close(hub.player.y + hub.player.h, table.y, `${fps} FPS: feet land on tabletop`);
    assert.equal(hub.player.grounded, true);
    hub.keys.add('KeyD'); tick(hub, 2, fps);
    assert.ok(hub.player.x > table.x + table.w);
    close(hub.player.y + hub.player.h, HUB_WORLD.floorY, `${fps} FPS: walked off tabletop`);
  }
}));

test('briefing V78: entering beside or below the tabletop cannot snap the actor upward', () => {
  for (const Class of [BaseHub, PhysicalHub]) {
    for (const verticalVelocity of [-100, 100]) {
      const previousBottom = table.y + 2;
      const y = previousBottom - 92 + Math.sign(verticalVelocity) * 1;
      const state = { player: { x: table.x + 20, y, w: 44, h: 92, vy: verticalVelocity, grounded: false },
        obstacles: [table], v51Platforms: [], v51Walls: [], useGlobalFloor: true };
      Class.prototype.resolveVertical.call(state, previousBottom);
      assert.equal(state.player.y, y); assert.equal(state.player.vy, verticalVelocity); assert.equal(state.player.grounded, false);
    }
  }
});

test('briefing V78: pause keeps the supported pose; a saved foreground position resumes without entrapment', () => withHub(({ hub, start, persisted }) => {
  hub.jumpQueued = 0.14; tick(hub, 2);
  const supportedY = hub.player.y;
  assert.equal(hub.pause(), true); assert.equal(hub.resume(), true); tick(hub, 0.2);
  close(hub.player.y, supportedY, 'pause/resume tabletop support');
  start(room.x); hub.persist();
  const save = structuredClone(persisted.at(-1));
  assert.equal(save.positionX, room.x);
  hub.stop(false); hub.start(save); // Existing deck save contract restores the floor, not a new vertical-pose schema.
  hub.keys.add('KeyD'); tick(hub, 2);
  assert.ok(hub.player.x > table.x + table.w);
  close(hub.player.y + hub.player.h, HUB_WORLD.floorY, 'resumed foreground position');
}));

test('briefing V78: crisis enemies share the foreground passage but other solid props still block them', () => withHub(({ hub }) => {
  const makeEnemy = () => ({ alive: true, x: table.x - 45, y: HUB_WORLD.floorY - 60, w: 44, h: 60,
    speed: 120, facing: 1, attackClock: 10, health: 100, damage: 1 });
  Object.assign(hub.player, { x: table.x + 350, y: HUB_WORLD.floorY - hub.player.h });
  hub.enemies = [makeEnemy()]; const previous = hub.enemies[0].x;
  hub.updateCombat(1 / 30); assert.ok(hub.enemies[0].x > previous);
  hub.enemies = [makeEnemy()]; const solid = { ...table }; delete solid.collisionMode; hub.obstacles = [solid];
  hub.updateCombat(1 / 30); assert.equal(hub.enemies[0].x, previous);
}));

test('briefing V78: production painter order keeps the table behind the marine with no duplicate collider art', () => withHub(({ hub, context }) => {
  const order = [];
  const prop = hub.drawInteractionProp.bind(hub), player = hub.drawPlayer.bind(hub), obstacle = hub.drawObstacle.bind(hub);
  hub.drawInteractionProp = (ctx, entry) => { if (entry.id === room.id) order.push('table'); return prop(ctx, entry); };
  hub.drawPlayer = ctx => { order.push('marine'); return player(ctx); };
  hub.drawObstacle = (ctx, entry) => { if (entry.roomId === room.id) assert.equal(entry.collisionOnly, true); return obstacle(ctx, entry); };
  hub.drawWorld(context);
  assert.equal(order.filter(item => item === 'table').length, 1);
  assert.ok(order.indexOf('table') < order.indexOf('marine'));
}));
