import assert from 'node:assert/strict';
import test from 'node:test';
import { EnemyAtlasLRUV65 } from '../src/enemy-atlas-loader-v65.js';
import { GameEngine } from '../src/game-v51-runtime.js';
import { withV52MissionRuntime } from '../src/game-v52-runtime.js';
import { SPRITE_SHEETS, SpriteAnimationController } from '../src/sprite-animation-runtime.js';

class DeferredImage {
  static requests = [];
  complete = false;
  naturalWidth = 0;
  naturalHeight = 0;
  set src(path) {
    DeferredImage.requests.push(path);
    queueMicrotask(() => {
      this.complete = true;
      this.naturalWidth = 1024;
      this.naturalHeight = 1024;
      this.onload?.();
    });
  }
}

function renderingFixture() {
  const engine = Object.create(withV52MissionRuntime(GameEngine).prototype);
  engine.images = new Map();
  engine.enemyAtlasLRUV65 = new EnemyAtlasLRUV65({ imageStore: engine.images, ImageCtor: DeferredImage });
  engine.spriteAnimation = new SpriteAnimationController();
  engine.animationTime = 0;
  engine.camera = { x: 0, y: 0 };
  engine.player = { inVehicle: true };
  engine.coopEnabled = false;
  for (const field of ['platforms', 'walls', 'ladders', 'covers', 'hazards', 'vents', 'supplies', 'drops', 'doors', 'bullets', 'hostileProjectiles', 'particles']) engine[field] = [];
  // Le monde et le vrai drawEnemy/drawSpriteSample restent exécutés ; seuls
  // les décors, UI et véhicules hors sujet sont retirés de cette fixture.
  for (const method of ['drawFloors', 'drawMaintenancePipes', 'drawPowerNode', 'drawArchiveTerminal', 'drawVehicle', 'drawWeaponPickup', 'drawToolPickup', 'drawObjective']) engine[method] = () => {};
  const sheets = Object.values(SPRITE_SHEETS).filter((sheet) => sheet.family === 'enemy' && sheet.clipSet === 'enemy-action-v56').slice(0, 14);
  assert.equal(sheets.length, 14);
  engine.enemies = sheets.map((sheet, index) => ({
    id: `visible-${index}`, visualSheetId: sheet.id, spriteKey: sheet.imageKey,
    x: index === 13 ? 8000 : 100 + index * 50, y: 240, w: 52, h: 74,
    alive: true, health: 100, maxHealth: 100, facing: 1, biology: 'xenomorph'
  }));
  let drawn = 0;
  const ctx = { save() {}, restore() {}, translate() {}, scale() {}, drawImage() { drawn += 1; } };
  return { engine, ctx, sheets, drawCount: () => drawn };
}

test('treize plaques visibles ne se chassent plus du cache à chaque frame, sans charger les ennemis hors écran', async () => {
  DeferredImage.requests = [];
  const { engine, ctx, sheets, drawCount } = renderingFixture();
  const renderedPerFrame = [];
  for (let frame = 0; frame < 6; frame += 1) {
    const before = drawCount();
    engine.drawWorld(ctx);
    renderedPerFrame.push(drawCount() - before);
    await Promise.resolve();
    engine.animationTime += 1 / 60;
  }
  assert.deepEqual(renderedPerFrame, [0, 13, 13, 13, 13, 13]);
  assert.equal(DeferredImage.requests.length, 13, 'une requête seulement par identité visible');
  assert.equal(engine.enemyAtlasLRUV65.snapshot().entries, 13, 'le working-set visible peut dépasser douze');
  assert.equal(engine.enemyAtlasLRUV65.snapshot().evictions, 0);
  assert.equal(engine.images.has(sheets[13].imageKey), false, 'aucun préchargement du type hors écran');

  engine.camera.x = 4000;
  const before = drawCount();
  engine.drawWorld(ctx);
  assert.equal(drawCount(), before, 'les ennemis hors écran ne sollicitent plus le rendu');
  assert.equal(engine.enemyAtlasLRUV65.workingSet.size, 0);
  assert.equal(engine.images.size, 12, 'les anciens visibles reviennent au budget des douze inactifs');
  assert.equal(engine.enemyAtlasLRUV65.snapshot().evictions, 1);
  engine.enemies = [];
  engine.drawWorld(ctx);
  assert.equal(engine.images.size, 12, 'aucune référence active ne survit à la disparition des entités');
});

test('les lectures de rendu actualisent réellement l’ordre LRU des plaques inactives', async () => {
  const { engine, ctx, sheets } = renderingFixture();
  engine.enemyAtlasLRUV65.maxEntries = 2;
  await engine.ensureEnemyAtlas(sheets[0]);
  await engine.ensureEnemyAtlas(sheets[1]);
  engine.drawSpriteSample(ctx, { sheet: sheets[0], column: 0, row: 0 }, engine.enemies[0]);
  await engine.ensureEnemyAtlas(sheets[2]);
  assert.equal(engine.images.has(sheets[0].imageKey), true, 'la plaque réellement dessinée est récente');
  assert.equal(engine.images.has(sheets[1].imageKey), false);
  assert.equal(engine.images.has(sheets[2].imageKey), true);
});

test('arrêter la mission libère aussi le working-set de la dernière frame', async () => {
  const { engine, ctx } = renderingFixture();
  engine.drawWorld(ctx);
  await Promise.resolve();
  assert.equal(engine.images.size, 13);
  engine.stop();
  assert.equal(engine.running, false);
  assert.equal(engine.enemyAtlasLRUV65.workingSet.size, 0);
  assert.equal(engine.images.size, 12);
});
