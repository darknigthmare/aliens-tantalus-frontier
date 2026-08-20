import test from 'node:test';
import assert from 'node:assert/strict';
import { HUB_DECKS, HUB_ROOM_COUNT } from '../src/hub-game.js';

test('the Tantalus hub is a physical four-deck level contract', () => {
  assert.equal(HUB_DECKS.length, 4);
  assert.equal(HUB_ROOM_COUNT, 16);
  assert.ok(HUB_DECKS.every((deck) => deck.rooms.length === 4));
  assert.ok(HUB_DECKS.every((deck) => deck.background.endsWith('.png')));
  const rooms = HUB_DECKS.flatMap((deck) => deck.rooms);
  assert.equal(new Set(rooms.map((room) => room.id)).size, 16);
  assert.ok(rooms.every((room) => room.action.includes(':')));
  assert.ok(rooms.every((room) => Number.isFinite(room.x)));
});

test('hub terminals connect spatial play to every strategic surface', () => {
  const actions = new Set(HUB_DECKS.flatMap((deck) => deck.rooms.map((room) => room.action)));
  for (const action of ['navigate:galaxy', 'navigate:operations', 'navigate:command', 'navigate:crew', 'navigate:armory', 'navigate:bestiary', 'navigate:editor', 'navigate:vehicles']) assert.ok(actions.has(action), action);
  for (const action of ['service:rest', 'service:medical', 'service:quarantine', 'service:power', 'service:oxygen']) assert.ok(actions.has(action), action);
});
