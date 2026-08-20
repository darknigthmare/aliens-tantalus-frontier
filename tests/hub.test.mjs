import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HUB_DECKS,
  HUB_MODULAR_ASSETS,
  HUB_MODULAR_PROP_FILES,
  HUB_ROOM_COUNT,
  HUB_WORLD
} from '../src/hub-game.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rooms = HUB_DECKS.flatMap((deck) => deck.rooms);
const assetFile = (publicUrl) => resolve(repoRoot, publicUrl.replace(/^\//, ''));

test('the v49 Tantalus hub is a modular four-deck physical level', () => {
  assert.deepEqual(HUB_WORLD, { width: 3840, roomWidth: 960, floorY: 624 });
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

test('each deck owns twelve traversal obstacles and every modular asset exists', () => {
  for (const deck of HUB_DECKS) {
    assert.ok(deck.rooms.every((room) => room.geometry.length === 3), `${deck.id}: three obstacles per room`);
    assert.equal(deck.rooms.reduce((total, room) => total + room.geometry.length, 0), 12, `${deck.id}: twelve obstacles`);
  }

  assert.equal(HUB_MODULAR_PROP_FILES.length, 16);
  assert.equal(new Set(HUB_MODULAR_PROP_FILES).size, 16);
  assert.equal(HUB_MODULAR_ASSETS.length, 36);
  assert.equal(new Set(HUB_MODULAR_ASSETS).size, 36);

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
