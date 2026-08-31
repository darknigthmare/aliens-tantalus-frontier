import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-v51-runtime.js';
import { resolveSpriteSheet } from '../src/sprite-animation-runtime.js';

class RuntimeImage {
  static requested = [];

  constructor() {
    this.complete = false;
    this.naturalWidth = 0;
  }

  set src(value) {
    this._src = value;
    RuntimeImage.requested.push(value);
    queueMicrotask(() => {
      this.complete = true;
      this.naturalWidth = 1024;
      this.onload?.();
    });
  }
}

test('le constructeur ne précharge aucune plaque ennemie et la première demande charge uniquement la plaque résolue', async () => {
  const previousImage = globalThis.Image;
  const previousAddEventListener = globalThis.addEventListener;
  globalThis.Image = RuntimeImage;
  globalThis.addEventListener = () => {};
  RuntimeImage.requested = [];
  try {
    const engine = new GameEngine({ getContext: () => ({}), addEventListener: () => {} });
    const isEnemyAtlas = (path) => path.includes('/sprites/normalized/enemies/')
      || path.includes('/sprites/normalized/enemy-profiles-v65/');
    assert.equal(RuntimeImage.requested.some(isEnemyAtlas), false);
    const requested = resolveSpriteSheet('enemy.newborn.action.v64');
    await engine.ensureEnemyAtlas(requested);
    assert.equal(
      RuntimeImage.requested.filter(isEnemyAtlas).length,
      1
    );
    assert.equal(engine.images.has(requested.imageKey), true);
    assert.equal(engine.enemyAtlasLRUV65.snapshot().maxEntries, 12);
  } finally {
    globalThis.Image = previousImage;
    globalThis.addEventListener = previousAddEventListener;
  }
});
