import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import {
  HUB_ROOM_LIGHTING_V58,
  HUB_VEHICLE_ART_ASSETS_V58,
  VEHICLE_BAY_ART_V58,
  isInsideHubActorLevelV58,
  requireHubVehicleArtV58,
  resolveHubRoomLightingV58,
  resolveHubVehicleArtV58
} from '../src/hub-art-runtime-v58.js';
import { HubGame, HUB_DECKS, HUB_WORLD } from '../src/hub-game.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1024;
    this.naturalHeight = 1024;
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

test('la baie véhicules possède un acteur M577 bitmap indépendant du lift', () => {
  const contract = requireHubVehicleArtV58('vehicle-bay');
  const actor = contract.vehicle;
  assert.equal(contract, VEHICLE_BAY_ART_V58);
  assert.equal(resolveHubVehicleArtV58('dropship-hangar'), null);
  assert.equal(contract.composition, 'modular-actor');
  assert.equal(contract.allowsMonolith, false);
  assert.equal(contract.allowsFallback, false);
  assert.equal(actor.kind, 'vehicle-sprite');
  assert.equal(actor.phase, 'actors');
  assert.equal(actor.vehicleId, 'vehicle-001-m577-armored-personnel-carrier');
  assert.equal(actor.action, 'navigate:vehicles');
  assert.equal(HUB_VEHICLE_ART_ASSETS_V58.length, 1);
  assert.ok(existsSync(path.join(ROOT, actor.asset.slice(1))), actor.asset);
  for (const bounds of [actor.renderBounds, actor.collisionBounds, actor.interactionBounds]) {
    assert.ok(isInsideHubActorLevelV58(bounds), JSON.stringify(bounds));
  }
  assert.equal(actor.renderBounds.y + actor.renderBounds.h, HUB_WORLD.floorY);
  assert.equal(actor.collisionBounds.y + actor.collisionBounds.h, HUB_WORLD.floorY);
  assert.ok(actor.interactionBounds.x <= actor.collisionBounds.x);
  assert.ok(actor.interactionBounds.x + actor.interactionBounds.w >= actor.collisionBounds.x + actor.collisionBounds.w);
});

test('le runtime charge, dessine, collisionne et expose l interaction du M577', () => withRuntime(() => {
  const actions = [];
  const ctx = recordingContext();
  const canvas = { width: 1280, height: 720, getContext: () => ctx, addEventListener() {} };
  const hub = new HubGame(canvas, { onAction: (event) => actions.push(event) });
  const room = HUB_DECKS[2].rooms.find((entry) => entry.id === 'vehicle-bay');
  const actor = VEHICLE_BAY_ART_V58.vehicle;
  hub.start({ deck: 2, roomId: room.id, positionX: room.xStart + 300 });

  assert.equal(hub.getAssetReport().vehicleArtAssetsReady, 1);
  assert.ok(hub.obstacles.some((entry) => entry.role === 'vehicle-hull' && entry.actorId === actor.id));
  assert.equal(hub.nearestInteraction()?.id, actor.id);

  ctx.drawCalls.length = 0;
  hub.drawVehicleBayActorV58(ctx, room);
  const draw = ctx.drawCalls.find((call) => call[0]?.currentSrc === actor.asset);
  assert.ok(draw, 'la plaque M577 doit être consommée par le rendu du hub');
  assert.deepEqual(draw.slice(1, 5), [24, 106, 207, 134]);
  assert.deepEqual(draw.slice(5), [room.xStart + 230, 390, 460, 234]);

  hub.interact();
  assert.equal(actions.at(-1)?.action, 'navigate:vehicles');
  assert.equal(actions.at(-1)?.vehicleId, actor.vehicleId);
}));

test('médical et support-vie seuls reçoivent l éclairage d atténuation V58', () => {
  assert.deepEqual(new Set(Object.keys(HUB_ROOM_LIGHTING_V58)), new Set(['medical', 'life-support']));
  assert.ok(resolveHubRoomLightingV58('medical'));
  assert.ok(resolveHubRoomLightingV58('life-support'));
  assert.equal(resolveHubRoomLightingV58('reactor'), null);
});
