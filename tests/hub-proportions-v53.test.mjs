import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HubGame as BaseHubGame,
  HUB_DECKS,
  HUB_DOOR_PROFILES,
  HUB_ROOM_PROFILES,
  HUB_WORLD,
  getHubDoorBounds
} from '../src/hub-game.js';
import { HubGame, HUB_CRISIS_SOURCE_FACING } from '../src/hub-v51-runtime.js';

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1672;
    this.naturalHeight = 941;
  }
  set src(value) { this.currentSrc = value; }
}

function recordingContext() {
  const gradient = { addColorStop() {} };
  const drawCalls = [];
  const base = {
    drawCalls,
    drawImage: (...args) => drawCalls.push(args),
    measureText: (text) => ({ width: String(text).length * 8 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient
  };
  return new Proxy(base, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; }
  });
}

function withRuntime(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    performance: globalThis.performance
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  globalThis.performance = { now: () => 1000 };
  try { return run(); }
  finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
    globalThis.performance = previous.performance;
  }
}

const closeTo = (actual, expected, epsilon = 0.001) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} ≈ ${expected}`);

test('les seize salles ont une échelle, un sol et une collision prop mesurés', () => withRuntime(() => {
  const rooms = HUB_DECKS.flatMap((deck) => deck.rooms);
  assert.equal(rooms.length, 16);
  assert.equal(Object.keys(HUB_ROOM_PROFILES).length, 16);
  assert.ok(new Set(rooms.map((room) => room.profile.sceneScale)).size >= 5);
  assert.ok(new Set(rooms.map((room) => room.profile.floorRatio)).size >= 4);
  assert.ok(rooms.every((room) => room.collisionSource === 'room-profile'));
  assert.ok(rooms.every((room) => room.geometry.length === 1 && room.geometry[0].collisionOnly));

  const ctx = recordingContext();
  const canvas = { width: 1280, height: 720, getContext: () => ctx, addEventListener() {} };
  const hub = new BaseHubGame(canvas);
  const room = rooms.find((entry) => entry.id === 'briefing');
  const farImage = hub.farLayers.get(HUB_DECKS[0].farBackground);
  let parallax = null;
  hub.drawViewportParallax = (_ctx, viewport, image) => { parallax = { viewport, image }; };
  hub.drawRoomModule(ctx, room, farImage);

  const backgroundDraw = ctx.drawCalls.find((call) => call[0]?.currentSrc === room.background && call.length === 5);
  assert.ok(backgroundDraw);
  const [, x, y, width, height] = backgroundDraw;
  closeTo(width, HUB_WORLD.roomWidth * room.profile.sceneScale);
  closeTo(x, room.xStart + (HUB_WORLD.roomWidth - width) / 2);
  closeTo(y + height * room.profile.floorRatio, HUB_WORLD.floorY);
  assert.deepEqual(parallax?.viewport, room.viewport);
  assert.equal(parallax?.image, farImage);
}));

test('le rendu et la collision des portes partagent les mêmes bornes', () => withRuntime(() => {
  for (const lift of [false, true]) {
    const profile = HUB_DOOR_PROFILES[lift ? 'lift' : 'bulkhead'];
    const bounds = getHubDoorBounds({ x: 1280, lift });
    closeTo(bounds.w, profile.sourceWidth * profile.renderHeight / profile.sourceHeight);
    assert.ok(bounds.w > 200);
    assert.equal(bounds.h, profile.renderHeight);
  }

  const ctx = recordingContext();
  const canvas = { width: 1280, height: 720, getContext: () => ctx, addEventListener() {} };
  const hub = new HubGame(canvas);
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 });
  hub.obstacles = [];
  hub.v51Walls = [];
  hub.v51Vents = [];
  hub.v51Doors = [];
  const door = hub.doorStates[0];
  door.progress = 0;
  const bounds = getHubDoorBounds(door);
  const previousX = bounds.x - hub.player.w - 2;
  Object.assign(hub.player, { x: bounds.x - hub.player.w + 4, y: HUB_WORLD.floorY - hub.player.h, vx: 120, crouching: false });
  hub.resolveHorizontal(previousX);
  closeTo(hub.player.x, bounds.x - hub.player.w);

  const before = ctx.drawCalls.length;
  hub.drawDoor(ctx, door);
  const doorDraws = ctx.drawCalls.slice(before).filter((call) => call.length === 9);
  assert.equal(doorDraws.length, 2);
  closeTo(doorDraws[0][7] + doorDraws[1][7], bounds.w);
}));

test('les ennemis de crise se retournent selon le sens réel de leur source', () => withRuntime(() => {
  const ctx = recordingContext();
  const canvas = { width: 1280, height: 720, getContext: () => ctx, addEventListener() {} };
  const hub = new HubGame(canvas);
  hub.animationTime = 0;
  for (const [kind, sourceFacing] of Object.entries(HUB_CRISIS_SOURCE_FACING)) {
    const enemy = hub.createEnemy({ kind, x: 400, y: 520, w: 52, h: 76 }, 0, 'crisis');
    assert.equal(enemy.sourceFacing, sourceFacing);
    for (const facing of [-1, 1]) {
      enemy.facing = facing;
      let flip = null;
      hub.drawSheetCell = (_ctx, _image, _column, _row, _x, _y, _width, _height, requestedFlip) => { flip = requestedFlip; };
      hub.drawEnemy(ctx, enemy);
      assert.equal(flip, facing !== sourceFacing, `${kind} facing ${facing}`);
    }
  }
}));
