import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HUB_DECKS,
  HUB_MODULAR_ASSETS,
  HUB_MODULAR_PROP_FILES,
  HUB_ROOM_PROFILES,
  HUB_ROOM_COUNT,
  HUB_WORLD
} from '../src/hub-game.js';
import { HUB_ROOM_ART_ASSETS_V56 } from '../src/hub-art-runtime-v56.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rooms = HUB_DECKS.flatMap((deck) => deck.rooms);
const assetFile = (publicUrl) => resolve(repoRoot, publicUrl.replace(/^\//, ''));

test('the v50 Tantalus hub is a camera-wide modular four-deck physical level', () => {
  assert.deepEqual(HUB_WORLD, { width: 5120, roomWidth: 1280, floorY: 624 });
  assert.equal(HUB_DECKS.length, 4);
  assert.equal(HUB_ROOM_COUNT, 16);
  assert.ok(HUB_DECKS.every((deck) => deck.rooms.length === 4));
  assert.ok(HUB_DECKS.every((deck) => !Object.hasOwn(deck, 'background')));

  assert.equal(new Set(rooms.map((room) => room.id)).size, 16);
  assert.equal(new Set(rooms.map((room) => room.background)).size, 16);
  assert.ok(rooms.every((room) => /^\/assets\/openai\/hub\/rooms\/[a-z0-9-]+\.png$/.test(room.background)));
  assert.ok(rooms.every((room) => /^\/assets\/openai\/hub\/props\/[a-z0-9-]+\.png$/.test(room.prop)));
  assert.ok(rooms.every((room) => room.action.includes(':')));
  assert.ok(rooms.every((room) => Number.isFinite(room.x)));

  const farBackgrounds = HUB_DECKS.map((deck) => deck.farBackground);
  assert.equal(new Set(farBackgrounds).size, 4);
  assert.ok(farBackgrounds.every((source) => /^\/assets\/openai\/hub\/parallax\/[a-z0-9-]+\.png$/.test(source)));

  assert.doesNotMatch(JSON.stringify(HUB_DECKS), /tantalus-hub-(command|habitat|industrial|engineering)-deck/i);
});

test('each room owns a measured render profile and an authored prop collider', () => {
  assert.equal(Object.keys(HUB_ROOM_PROFILES).length, 16);
  for (const deck of HUB_DECKS) {
    assert.ok(deck.rooms.every((room) => room.profile === HUB_ROOM_PROFILES[room.id]), `${deck.id}: explicit room profiles`);
    assert.ok(deck.rooms.every((room) => room.profile.worldWidth === HUB_WORLD.roomWidth), `${deck.id}: stable world boundaries`);
    assert.ok(deck.rooms.every((room) => room.profile.sceneScale >= 1 && room.profile.sceneScale <= 1.06), `${deck.id}: bounded scene scale`);
    assert.ok(deck.rooms.every((room) => room.profile.floorRatio >= 0.815 && room.profile.floorRatio <= 0.83), `${deck.id}: measured floor ratio`);
    assert.ok(deck.rooms.every((room) => room.collisionSource === 'room-profile'), `${deck.id}: no generic collision fallback`);
    assert.ok(deck.rooms.every((room) => room.geometry.length === 1 && room.geometry[0].collisionOnly), `${deck.id}: one authored prop collider per room`);
    assert.equal(deck.rooms.reduce((total, room) => total + room.geometry.length, 0), 4, `${deck.id}: four authored colliders`);
  }

  assert.equal(HUB_MODULAR_PROP_FILES.length, 16);
  assert.equal(new Set(HUB_MODULAR_PROP_FILES).size, 16);
  assert.equal(HUB_ROOM_ART_ASSETS_V56.length, 30);
  assert.equal(new Set(HUB_ROOM_ART_ASSETS_V56).size, 30);
  assert.equal(HUB_MODULAR_ASSETS.length, 87);
  assert.equal(new Set(HUB_MODULAR_ASSETS).size, 87);
  assert.ok(HUB_ROOM_ART_ASSETS_V56.every((source) => HUB_MODULAR_ASSETS.includes(source)));
  assert.ok(rooms.every((room) => !HUB_MODULAR_ASSETS.includes(room.background)), 'les bitmaps monolithiques ne sont plus préchargés');

  for (const source of HUB_MODULAR_ASSETS) {
    const file = assetFile(source);
    assert.ok(existsSync(file), `missing modular hub asset: ${source}`);
    assert.ok(statSync(file).size > 0, `empty modular hub asset: ${source}`);
  }
});

test('hub terminals connect spatial play to every strategic surface', () => {
  const actions = new Set(rooms.map((room) => room.action));
  for (const action of ['navigate:galaxy', 'navigate:operations', 'navigate:command', 'navigate:crew', 'navigate:armory', 'navigate:bestiary', 'navigate:editor', 'navigate:vehicles']) assert.ok(actions.has(action), action);
  for (const action of ['service:rest', 'service:medical', 'service:quarantine', 'service:power', 'service:oxygen']) assert.ok(actions.has(action), action);
});
