import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HubGame as BaseHubGame,
  HUB_DECKS,
  HUB_DOOR_PROFILES,
  HUB_ROOM_PROFILES,
  HUB_WORLD,
  getHubDoorBounds,
  getHubRoomLayerBounds
} from '../src/hub-game.js';
import { resolveHubRoomArtV56 } from '../src/hub-art-runtime-v56.js';
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

test('les seize salles gardent leurs profils mesurés et le briefing rend son calque modulaire v56', () => withRuntime(() => {
  const rooms = HUB_DECKS.flatMap((deck) => deck.rooms);
  assert.equal(rooms.length, 16);
  assert.equal(Object.keys(HUB_ROOM_PROFILES).length, 16);
  assert.ok(new Set(rooms.map((room) => room.profile.sceneScale)).size >= 5);
  assert.ok(new Set(rooms.map((room) => room.profile.floorRatio)).size >= 4);
  assert.ok(rooms.every((room) => room.collisionSource === 'room-profile'));
  assert.ok(rooms.every((room) => room.geometry.length === 1 && room.geometry[0].collisionOnly));
  for (const room of rooms) {
    const render = room.propRenderBounds;
    const collision = room.propCollisionBounds;
    const interaction = room.propInteractionBounds;
    closeTo(render.x + render.w / 2, room.x);
    closeTo(collision.x + collision.w / 2, room.x);
    closeTo(render.y + render.h, HUB_WORLD.floorY);
    closeTo(collision.y + collision.h, HUB_WORLD.floorY);
    assert.deepEqual(room.geometry[0], { ...collision, role: 'interaction-prop', collisionOnly: true });
    assert.ok(interaction.x <= render.x && interaction.x + interaction.w >= render.x + render.w, `${room.id}: zone interaction autour du bitmap`);
    assert.ok(collision.w <= render.w && collision.h <= render.h, `${room.id}: collision contenue dans le volume visible`);
  }

  const ctx = recordingContext();
  const canvas = { width: 1280, height: 720, getContext: () => ctx, addEventListener() {} };
  const hub = new BaseHubGame(canvas);
  const room = rooms.find((entry) => entry.id === 'briefing');
  const farImage = hub.farLayers.get(HUB_DECKS[0].farBackground);
  let parallax = null;
  hub.drawViewportParallax = (_ctx, viewport, image) => { parallax = { viewport, image }; };
  hub.drawRoomModule(ctx, room, farImage);

  const art = resolveHubRoomArtV56(room.id);
  assert.ok(art);
  const backgroundDraw = ctx.drawCalls.find((call) => call[0]?.currentSrc === art.overhead.asset && call.length === 9);
  assert.ok(backgroundDraw, 'le plafond modulaire v56 doit remplacer le bitmap monolithique');
  const [image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height] = backgroundDraw;
  assert.deepEqual([sourceX, sourceY, sourceWidth, sourceHeight], [0, 0, image.naturalWidth, image.naturalHeight]);
  const expected = getHubRoomLayerBounds(room, art.overhead.renderBounds);
  closeTo(x, expected.x);
  closeTo(y, expected.y);
  closeTo(width, expected.w);
  closeTo(height, expected.h);
  assert.ok(width > room.profile.worldWidth, 'sceneScale rapproche correctement la salle de briefing');
  assert.ok(y > 0, 'floorRatio recale la ligne de fuite sur le sol physique');
  assert.equal(ctx.drawCalls.some((call) => call[0]?.currentSrc === room.background), false, 'aucun ancien fond monolithique');
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
