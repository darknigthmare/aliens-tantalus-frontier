import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GameEngine } from '../src/game.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const gameSource = await readFile(resolve(repoRoot, 'src/game.js'), 'utf8');

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1024;
    this.naturalHeight = 1024;
  }

  set src(value) { this.currentSrc = value; }
}

test('v50 mission runtime builds a vertical Metroidvania traversal graph', () => {
  const previousImage = globalThis.Image;
  const previousAddEventListener = globalThis.addEventListener;
  const previousRequestAnimationFrame = globalThis.requestAnimationFrame;
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try {
    const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
    const engine = new GameEngine(canvas);
    engine.start({
      seed: 426,
      world: { name: 'Lethe' },
      campaign: { name: 'Tantalus Base' },
      weapon: { damage: 26 },
      enemyCatalog: [
        { id: 'drone', name: 'Xenomorph Drone', biology: 'xenomorph', health: 80, damage: 12, speed: 1.2 },
        { id: 'warrior', name: 'Xenomorph Warrior', biology: 'xenomorph', health: 110, damage: 16, speed: 1.1 },
        { id: 'queen', name: 'Xenomorph Queen', caste: 'royal', biology: 'xenomorph', health: 220, damage: 22, speed: 0.8 },
        { id: 'hugger', name: 'Facehugger', biology: 'xenomorph', health: 30, damage: 8, speed: 1.7 },
        { id: 'neo', name: 'Neomorph', biology: 'pathogen', health: 90, damage: 14, speed: 1.5 },
        { id: 'joe', name: 'Working Joe', biology: 'synthetic', health: 100, damage: 12, speed: 0.9 }
      ]
    });
    const snapshot = engine.getSnapshot();
    assert.equal(snapshot.worldWidth, 6200);
    assert.equal(snapshot.worldHeight, 1080);
    assert.equal(snapshot.platformCount, 16);
    assert.equal(snapshot.ladderCount, 6);
    assert.equal(snapshot.doorCount, 4);
    assert.deepEqual({ w: snapshot.player.w, h: snapshot.player.h }, { w: 42, h: 92 });
    assert.equal(snapshot.assets.missing.length, 0);
    assert.ok(new Set(engine.enemies.map((enemy) => enemy.spriteKey)).size >= 5);
    assert.equal(engine.weaponPickup.taken, false);
  } finally {
    globalThis.Image = previousImage;
    globalThis.addEventListener = previousAddEventListener;
    globalThis.requestAnimationFrame = previousRequestAnimationFrame;
  }
});

test('runtime animation anchors and physical gates are explicit in source', () => {
  assert.match(gameSource, /renderHeight \* \(240 \/ CELL_SIZE\)/);
  assert.match(gameSource, /door\.progress >= 0\.82/);
  assert.match(gameSource, /lockedBy: 'power'/);
  assert.match(gameSource, /ventShortcut/);
  assert.match(gameSource, /drawCoverLayer\(ctx, mid, 0\.42, 0\.18, 0\.78, 1\.14, 90\)/);
  assert.doesNotMatch(gameSource, /drawActor[\s\S]{0,1200}fillRect\(-18, 26/);
});
