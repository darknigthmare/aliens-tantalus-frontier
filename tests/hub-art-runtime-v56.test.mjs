import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  HUB_ROOM_ART_ASSETS_V56,
  HUB_ROOM_ART_COUNT_V56,
  HUB_ROOM_ART_V56,
  requireHubRoomArtV56,
  resolveHubRoomArtV56
} from '../src/hub-art-runtime-v56.js';
import { HUB_DECKS, HUB_MODULAR_ASSETS, HubGame } from '../src/hub-v52-runtime.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1774;
    this.naturalHeight = 887;
  }
  set src(value) { this.currentSrc = value; }
}

function mockContext(draws) {
  const gradient = { addColorStop() {} };
  const base = {
    measureText: (value) => ({ width: String(value).length * 8 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    drawImage: (image) => draws.push(image?.currentSrc || 'unknown')
  };
  return new Proxy(base, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; }
  });
}

function withBrowserRuntime(run) {
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
  finally { Object.assign(globalThis, previous); }
}

test('les quinze salles v56 utilisent trente calques uniques sans bitmap monolithique', () => {
  assert.equal(HUB_ROOM_ART_COUNT_V56, 15);
  assert.equal(HUB_ROOM_ART_ASSETS_V56.length, 30);
  assert.equal(new Set(HUB_ROOM_ART_ASSETS_V56).size, 30);
  assert.equal(Object.keys(HUB_ROOM_ART_V56).length, 15);

  const authoredRooms = HUB_DECKS.flatMap((deck) => deck.rooms)
    .filter((room) => room.id !== 'dropship-hangar');
  assert.equal(authoredRooms.length, 15);

  for (const room of authoredRooms) {
    const contract = requireHubRoomArtV56(room.id);
    assert.equal(contract.composition, 'modular');
    assert.equal(contract.allowsMonolith, false);
    assert.equal(contract.allowsFallback, false);
    assert.deepEqual(contract.renderStack.map((entry) => entry.phase), ['back', 'actors', 'front']);
    assert.equal(contract.renderStack[1].kind, 'runtime-slot');
    assert.equal(contract.overhead.asset.endsWith('-overhead.png'), true);
    assert.equal(contract.foreground.asset.endsWith('-foreground.png'), true);
    assert.notEqual(contract.overhead.asset, contract.foreground.asset);
    for (const asset of [contract.overhead.asset, contract.foreground.asset]) {
      assert.ok(existsSync(path.join(ROOT, asset.slice(1))), asset);
      assert.ok(HUB_MODULAR_ASSETS.includes(asset), asset);
    }
    assert.equal(HUB_MODULAR_ASSETS.includes(room.background), false, room.background);
  }

  assert.equal(resolveHubRoomArtV56('dropship-hangar'), null);
  assert.throws(() => requireHubRoomArtV56('unknown-room'), /No v56 modular hub art contract/);
  assert.equal(HUB_MODULAR_ASSETS.some((asset) => asset.includes('/hub/rooms/')), false);
});

test('le vrai HubGame dessine chaque plafond avant les acteurs et chaque premier plan après eux', () => withBrowserRuntime(() => {
  const draws = [];
  const context = mockContext(draws);
  const canvas = { width: 1280, height: 720, getContext: () => context, addEventListener() {} };
  const hub = new HubGame(canvas);
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 });
  draws.length = 0;
  hub.draw();

  const snapshot = hub.getSnapshot();
  assert.equal(snapshot.roomComposition, 'modular-v56');
  assert.equal(snapshot.roomBackground, null);
  assert.equal(snapshot.roomLayerAssetsReady, 30);
  assert.equal(hub.getAssetReport().roomLayerAssetCount, 30);
  assert.equal(hub.getAssetReport().roomAssetCount, 0);

  const player = draws.indexOf('/assets/openai/sprites/normalized/player/echo9-marine-locomotion-sheet.png');
  assert.ok(player >= 0);
  for (const room of HUB_DECKS[0].rooms) {
    const contract = requireHubRoomArtV56(room.id);
    const overhead = draws.indexOf(contract.overhead.asset);
    const foreground = draws.lastIndexOf(contract.foreground.asset);
    assert.ok(overhead >= 0 && overhead < player, contract.overhead.asset);
    assert.ok(foreground > player, contract.foreground.asset);
    assert.equal(draws.includes(room.background), false, room.background);
  }
}));
