import assert from 'node:assert/strict';
import test from 'node:test';
import { EnemyAtlasLRUV65 } from '../src/enemy-atlas-loader-v65.js';
import { GameEngine } from '../src/game-v51-runtime.js';
import { resolveSpriteSheet } from '../src/sprite-animation-runtime.js';

function controlledImage() {
  return class {
    static fail = true;
    static attempts = 0;
    complete = false;
    naturalWidth = 0;
    naturalHeight = 0;
    set src(path) {
      this.constructor.attempts += 1;
      queueMicrotask(() => {
        if (this.constructor.fail) return this.onerror?.(new Error('fixture HTTP 404'));
        this.complete = true;
        this.naturalWidth = 1024;
        this.naturalHeight = 1024;
        this.onload?.();
      });
    }
  };
}

test('un atlas indisponible attend un backoff exponentiel plafonné à 30s puis peut réellement récupérer', async () => {
  let now = 0;
  const ImageCtor = controlledImage();
  const sheet = resolveSpriteSheet('enemy.newborn.action.v64');
  const loader = new EnemyAtlasLRUV65({ ImageCtor, now: () => now });
  const first = loader.ensure(sheet);
  assert.equal(await first, null);
  for (let frame = 0; frame < 60; frame += 1) {
    now = frame * 16;
    assert.equal(loader.ensure(sheet), first);
  }
  assert.equal(ImageCtor.attempts, 1, '60 frames ne créent qu’une requête');
  assert.deepEqual(loader.recordStatus(sheet), {
    imageKey: sheet.imageKey, path: sheet.path, status: 'failed', consecutiveFailures: 1, retryAt: 1000
  });
  assert.equal(loader.snapshot().failed, 1);
  assert.equal(loader.snapshot().unavailable[0].imageKey, sheet.imageKey);

  for (let failure = 2; failure <= 8; failure += 1) {
    now = loader.recordStatus(sheet).retryAt;
    assert.equal(await loader.ensure(sheet), null);
    const status = loader.recordStatus(sheet);
    assert.equal(status.consecutiveFailures, failure);
    assert.equal(status.retryAt - now, Math.min(30000, 1000 * 2 ** (failure - 1)));
  }
  ImageCtor.fail = false;
  now = loader.recordStatus(sheet).retryAt;
  assert.ok(await loader.ensure(sheet));
  assert.equal(loader.recordStatus(sheet).status, 'ready');
  assert.equal(loader.recordStatus(sheet).consecutiveFailures, 0);
  assert.equal(loader.recordStatus(sheet).retryAt, 0);
  assert.equal(loader.snapshot().failed, 0);
  assert.deepEqual(loader.snapshot().unavailable, []);
});

test('un atlas visible suspend la simulation dès sa toute première requête jusqu’au vrai onload', async () => {
  const previousRaf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = () => 0;
  try {
    const sheet = resolveSpriteSheet('enemy.profile.enemy-010-spitter.v81');
    let pendingImage = null;
    class DeferredImage {
      complete = false;
      naturalWidth = 0;
      naturalHeight = 0;
      set src(_value) { pendingImage = this; }
    }
    const engine = Object.create(GameEngine.prototype);
    engine.images = new Map();
    engine.enemyAtlasLRUV65 = new EnemyAtlasLRUV65({ imageStore: engine.images, ImageCtor: DeferredImage });
    engine.enemies = [{ id: 'spitter-loading', visualSheetId: sheet.id, alive: true, dormant: false, deathClock: 0, x: 100, y: 250, w: 90, h: 118 }];
    engine.camera = { x: 0, y: 0 };
    engine.player = { health: 100 };
    engine.running = true;
    engine.paused = false;
    engine.last = 0;
    engine.mission = { state: 'active' };
    let simulationSteps = 0;
    engine.update = () => { simulationSteps += 1; };
    engine.draw = () => {};

    engine.loop(16);
    assert.equal(engine.enemyAtlasLRUV65.recordStatus(sheet).status, 'loading');
    assert.equal(engine.enemyAtlasLoadingPausedV65, true);
    assert.equal(simulationSteps, 0, 'un ennemi dont la plaque charge ne doit jamais agir invisible');

    pendingImage.complete = true;
    pendingImage.naturalWidth = 1024;
    pendingImage.naturalHeight = 2048;
    pendingImage.onload();
    await Promise.resolve();
    engine.loop(32);
    assert.equal(engine.enemyAtlasLoadingPausedV65, false);
    assert.equal(simulationSteps, 1);
  } finally {
    globalThis.requestAnimationFrame = previousRaf;
  }
});

test('l’échec visible suspend la simulation et affiche le message sans retirer la pause utilisateur après récupération', async () => {
  const previousRaf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = () => 0;
  try {
    let now = 0;
    const ImageCtor = controlledImage();
    const sheet = resolveSpriteSheet('enemy.newborn.action.v64');
    const engine = Object.create(GameEngine.prototype);
    engine.images = new Map();
    engine.enemyAtlasLRUV65 = new EnemyAtlasLRUV65({ imageStore: engine.images, ImageCtor, now: () => now });
    engine.enemies = [{ id: 'network-fixture', visualSheetId: sheet.id, alive: true, x: 100, y: 250, w: 52, h: 74 }];
    engine.camera = { x: 0, y: 0 };
    engine.player = { health: 100 };
    engine.running = true;
    engine.paused = false;
    engine.last = 0;
    engine.mission = { state: 'active' };
    let simulationSteps = 0;
    engine.update = () => { simulationSteps += 1; engine.player.health -= 1; };
    const text = [];
    const ctx = { fillRect() {}, fillText(value) { text.push(value); } };
    engine.draw = () => { if (engine.paused || engine.enemyAtlasLoadingPausedV65) engine.drawStateOverlay(ctx); };
    await engine.ensureEnemyAtlas(sheet);
    for (let frame = 0; frame < 60; frame += 1) {
      now = frame * 16;
      engine.loop(now);
    }
    assert.equal(ImageCtor.attempts, 1);
    assert.equal(simulationSteps, 0);
    assert.equal(engine.player.health, 100, 'aucun dégât d’ennemi invisible');
    assert.equal(engine.enemyAtlasLoadingPausedV65, true);
    assert.equal(engine.paused, false, 'la pause réseau ne change jamais le choix utilisateur');
    assert.ok(text.includes('Sprite indisponible — nouvelle tentative…'));

    engine.togglePause();
    assert.equal(engine.paused, true);
    ImageCtor.fail = false;
    now = 1000;
    engine.loop(now);
    assert.equal(engine.enemyAtlasLoadingPausedV65, true, 'rester suspendu pendant la nouvelle requête');
    await Promise.resolve();
    engine.loop(1016);
    assert.equal(engine.enemyAtlasLoadingPausedV65, false);
    assert.equal(engine.paused, true, 'le chargement réussi ne retire pas la pause utilisateur');
    assert.equal(simulationSteps, 0);
    assert.ok(text.includes('OPÉRATION EN PAUSE'));
    engine.togglePause();
    engine.loop(1032);
    assert.equal(simulationSteps, 1, 'la simulation reprend après chargement et décision utilisateur');
  } finally {
    globalThis.requestAnimationFrame = previousRaf;
  }
});
