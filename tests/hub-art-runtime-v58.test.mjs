import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  HUB_ROOM_FAR_ART_V58,
  HUB_ROOM_FAR_ASSETS_V58,
  HUB_ROOM_LIGHTING_V58,
  HUB_ROOM_MID_ART_V58,
  HUB_ROOM_MID_ASSETS_V58,
  HUB_VEHICLE_ART_ASSETS_V58,
  VEHICLE_BAY_ART_V58,
  isInsideHubActorLevelV58,
  requireHubRoomFarArtV58,
  requireHubRoomMidArtV58,
  requireHubVehicleArtV58,
  resolveHubRoomFarArtV58,
  resolveHubRoomLightingV58,
  resolveHubRoomMidArtV58,
  resolveHubVehicleArtV58
} from '../src/hub-art-runtime-v58.js';
import { HUB_MODULAR_ASSETS } from '../src/hub-game.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const pngColorType = (source) => {
  const file = path.join(ROOT, source.slice(1));
  const data = readFileSync(file);
  assert.equal(data.subarray(1, 4).toString('ascii'), 'PNG', source);
  assert.deepEqual([data.readUInt32BE(16), data.readUInt32BE(20), data[24]], [1774, 887, 8], source);
  return data[25];
};

test('les seize salles V58 possèdent une coque intermédiaire ImageGen indépendante', () => {
  assert.deepEqual(Object.keys(HUB_ROOM_MID_ART_V58), [
    'bridge', 'briefing', 'combat-information', 'cryo-bay',
    'crew-quarters', 'mess', 'medical', 'science-lab',
    'quarantine', 'armory', 'workshop', 'vehicle-bay',
    'dropship-hangar', 'reactor', 'life-support', 'sensor-array'
  ]);
  assert.equal(HUB_ROOM_MID_ASSETS_V58.length, 16);
  assert.equal(new Set(HUB_ROOM_MID_ASSETS_V58).size, 16);
  for (const source of HUB_ROOM_MID_ASSETS_V58) {
    assert.match(source, /^\/assets\/openai\/hub\/layers\/[a-z0-9-]+-mid\.png$/);
    assert.ok(existsSync(path.join(ROOT, source.slice(1))), source);
    assert.equal(pngColorType(source), 6, `${source}: MID RGBA`);
    assert.ok(HUB_MODULAR_ASSETS.includes(source), `${source}: préchargement hub`);
  }
});

test('les seize salles V58 possèdent aussi un fond FAR opaque propre à leur fonction', () => {
  assert.deepEqual(Object.keys(HUB_ROOM_FAR_ART_V58), Object.keys(HUB_ROOM_MID_ART_V58));
  assert.equal(HUB_ROOM_FAR_ASSETS_V58.length, 16);
  assert.equal(new Set(HUB_ROOM_FAR_ASSETS_V58).size, 16);
  for (const source of HUB_ROOM_FAR_ASSETS_V58) {
    assert.match(source, /^\/assets\/openai\/hub\/layers\/[a-z0-9-]+-far\.png$/);
    assert.ok(existsSync(path.join(ROOT, source.slice(1))), source);
    assert.equal(pngColorType(source), 2, `${source}: FAR RGB opaque`);
    assert.ok(HUB_MODULAR_ASSETS.includes(source), `${source}: préchargement hub`);
  }

  for (const roomId of Object.keys(HUB_ROOM_FAR_ART_V58)) {
    const layer = requireHubRoomFarArtV58(roomId);
    assert.equal(layer.roomId, roomId);
    assert.equal(layer.depth, 'far');
    assert.equal(layer.phase, 'back');
    assert.equal(layer.collidable, false);
    assert.deepEqual(layer.sourceSize, { width: 1774, height: 887 });
    assert.deepEqual(layer.renderBounds, { x: 0, y: 0, w: 1280, h: 640 });
  }
  assert.equal(resolveHubRoomFarArtV58('unknown-room'), null);
});

test('les couches MID V58 restent visuelles, non collidables et au format de composition du hub', () => {
  for (const roomId of Object.keys(HUB_ROOM_MID_ART_V58)) {
    const layer = requireHubRoomMidArtV58(roomId);
    assert.equal(layer.roomId, roomId);
    assert.equal(layer.depth, 'mid');
    assert.equal(layer.phase, 'back');
    assert.equal(layer.collidable, false);
    assert.deepEqual(layer.sourceSize, { width: 1774, height: 887 });
    assert.deepEqual(layer.renderBounds, { x: 0, y: 0, w: 1280, h: 640 });
  }
  assert.equal(resolveHubRoomMidArtV58('unknown-room'), null);
});

test('la baie véhicules rend un M577 bitmap autonome, physique et interactif', () => {
  const contract = requireHubVehicleArtV58('vehicle-bay');
  const actor = contract.vehicle;
  assert.equal(contract, VEHICLE_BAY_ART_V58);
  assert.equal(contract.composition, 'modular-actor');
  assert.equal(contract.allowsMonolith, false);
  assert.equal(contract.allowsFallback, false);
  assert.equal(actor.vehicleId, 'vehicle-001-m577-armored-personnel-carrier');
  assert.equal(actor.asset, '/assets/openai/sprites/normalized/vehicles/m577-apc-action-sheet.png');
  assert.equal(actor.kind, 'vehicle-sprite');
  assert.equal(actor.phase, 'actors');
  assert.ok(existsSync(path.join(ROOT, actor.asset.slice(1))), actor.asset);
  assert.deepEqual(HUB_VEHICLE_ART_ASSETS_V58, [actor.asset]);
  assert.ok(HUB_MODULAR_ASSETS.includes(actor.asset), 'la plaque M577 doit être préchargée par le hub');
  for (const bounds of [actor.renderBounds, actor.collisionBounds, actor.interactionBounds]) {
    assert.ok(isInsideHubActorLevelV58(bounds), JSON.stringify(bounds));
  }
  assert.equal(actor.collisionBounds.y + actor.collisionBounds.h, 624);
  assert.equal(resolveHubVehicleArtV58('bridge'), null);
  assert.throws(() => requireHubVehicleArtV58('bridge'), /No v58 hub vehicle contract/);
});

test('le grade local V58 atténue seulement le médical et le support-vie', () => {
  assert.deepEqual(Object.keys(HUB_ROOM_LIGHTING_V58), ['medical', 'life-support']);
  assert.equal(resolveHubRoomLightingV58('bridge'), null);
  for (const roomId of ['medical', 'life-support']) {
    const lighting = resolveHubRoomLightingV58(roomId);
    assert.match(lighting.tint, /^rgba\(/);
    assert.match(lighting.vignette, /^rgba\(/);
  }
});
