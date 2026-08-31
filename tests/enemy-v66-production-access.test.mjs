import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ENEMIES } from '../src/content-core-v50.js';
import { GameEngine } from '../src/game-v51-runtime.js';
import { SPRITE_SHEETS, resolveSpriteSheet } from '../src/sprite-animation-runtime.js';
import { V66_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v66.js';
import { resolveEnemyProfileVisualV66 } from '../src/enemy-profile-registry-v66.js';
import { resolveEnemyVisualProfile } from '../src/enemy-visual-runtime-v53.js';
import { getCatalogEntryV62 } from '../src/catalog-runtime-v62.js';
import { getCatalogSpriteFrameV62 } from '../src/catalog-ui-v62.js';
import { getEnemyAtlasSheetsForWorldV66 } from '../src/enemy-atlas-loader-v65.js';

const expectedIds = ['enemy-001-ovomorph', 'enemy-003-chestburster', 'enemy-004-drone-big-chap', 'enemy-005-warrior', 'enemy-006-runner'];

test('la readylist V66 pointe vers les octets et les160racines effectivement revus', async () => {
  for (const asset of V66_READY_ENEMY_PROFILE_ASSETS) {
    const bytes = await readFile(new URL(`..${asset.path}`, import.meta.url));
    const metadataBytes = await readFile(new URL(`../assets/openai/sprites/metadata/v66/${asset.profileId}.json`, import.meta.url));
    const metadata = JSON.parse(metadataBytes.toString('utf8'));
    const hash = createHash('sha256').update(bytes).digest('hex');
    assert.equal(hash, asset.normalizedSha256);
    assert.equal(hash, metadata.normalizedSha256);
    assert.equal(metadata.physicalAnchorReview.status, 'reviewed');
    assert.equal(metadata.physicalAnchorReview.reviewedPoseCount, 32);
    assert.equal(metadata.validation.uniqueFrameCount, 32);
    assert.deepEqual(metadata.validation.findings, []);
    assert.equal(metadata.normalizationOptions.removeEnclosedMagentaMatte, true);
    assert.equal(metadata.normalizationOptions.removeEnclosedMagentaAaFringe, true);
    assert.equal(metadataBytes.includes(Buffer.from('\r\n')), false, 'SHA de métadonnées stable après checkout Git Windows/Linux');
  }
});

test('les cinq profils du lotV66 sont accessibles au mêmeatlas depuis résolutionmission et laboratoire', () => {
  assert.deepEqual(V66_READY_ENEMY_PROFILE_ASSETS.map((asset) => asset.profileId).sort(), [...expectedIds].sort(), 'Gate du lot complet: les cinq profils doivent être acceptés, pas seulement présents sur disque.');
  for (const id of expectedIds) {
    const source = ENEMIES.find((enemy) => enemy.id === id);
    const profile = resolveEnemyProfileVisualV66(source);
    assert.ok(profile, id);
    assert.equal(resolveEnemyVisualProfile(source).sheetId, profile.sheetId, 'Le resolver réellement utilisé en mission doit prendre V66 en priorité.');
    const sheet = resolveSpriteSheet(profile.sheetId);
    assert.ok(sheet, id);
    assert.equal(sheet.rows, 8);
    assert.equal(sheet.columns, 4);
    const catalog = getCatalogEntryV62(id);
    assert.equal(catalog.visual.sheetId, sheet.id);
    assert.equal(catalog.visual.path, sheet.path);
    assert.equal(catalog.visual.previewClips.length, 4);
    const expectedClips = id.endsWith('ovomorph') ? ['sealed', 'opening', 'hatch', 'destroyed'] : ['idle', 'move', 'attack', 'death'];
    assert.deepEqual(catalog.visual.previewClips.map((descriptor) => descriptor.clip.id), expectedClips);
    const seen = [];
    for (const { clip } of catalog.visual.previewClips) {
      assert.equal(clip.frames.length, 8);
      for (let pose = 0; pose < 8; pose += 1) {
        const frame = getCatalogSpriteFrameV62(catalog.visual, pose, clip.id);
        assert.equal(frame.path, sheet.path);
        assert.equal(frame.rows, 8);
        seen.push(frame.frame);
      }
    }
    assert.deepEqual(seen, Array.from({ length: 32 }, (_, index) => index));
    for (const worldId of source.encounterWorldIds) assert.ok(getEnemyAtlasSheetsForWorldV66(worldId).some((entry) => entry.id === sheet.id));
  }
});

test('le vrai moteur nepréchargeaucunennemiV66audémarrage et charge seulement les atlas demandés', async () => {
  const previousImage = globalThis.Image, previousListener = globalThis.addEventListener;
  const requests = [];
  class RuntimeImage {
    constructor() { this.complete = false; this.naturalWidth = 0; }
    set src(path) { this._src = path; requests.push(path); queueMicrotask(() => { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 2048; this.onload?.(); }); }
  }
  globalThis.Image = RuntimeImage;
  globalThis.addEventListener = () => {};
  try {
    const engine = new GameEngine({ getContext: () => ({}), addEventListener: () => {} });
    const enemyPaths = new Set(Object.values(SPRITE_SHEETS).filter((sheet) => sheet.family === 'enemy').map((sheet) => sheet.path));
    assert.equal(requests.filter((path) => enemyPaths.has(path)).length, 0);
    for (const id of expectedIds) {
      const sheet = resolveSpriteSheet(`enemy.profile.${id}.v66`);
      assert.ok(sheet, id);
      await engine.ensureEnemyAtlas(sheet);
      assert.ok(engine.images.has(sheet.imageKey));
    }
    assert.equal(requests.filter((path) => enemyPaths.has(path)).length, 5);
    assert.equal(engine.enemyAtlasLRUV65.snapshot().ready, 5);
    assert.equal(engine.enemyAtlasLRUV65.snapshot().maxEntries, 12);
  } finally { globalThis.Image = previousImage; globalThis.addEventListener = previousListener; }
});
