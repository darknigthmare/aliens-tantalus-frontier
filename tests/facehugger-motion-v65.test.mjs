import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { ENEMIES } from '../src/content-core-v50.js';
import { GameEngine } from '../src/game-v51-runtime.js';
import { resolveEnemyVisualProfile } from '../src/enemy-visual-runtime-v53.js';
import { resolveEnemyProfileVisualV65 } from '../src/enemy-profile-registry-v65.js';
import { SPRITE_CLIP_SETS, SpriteAnimationController, resolveEnemyAnimation, resolveSpriteSheet, shouldFlipSprite } from '../src/sprite-animation-runtime.js';
import { spriteImageDimensions } from './helpers/sprite-image-dimensions.mjs';

const profileId = 'enemy-002-facehugger';
const sheetId = `enemy.profile.${profileId}.v65`;

test('Facehugger V65 relie le vrai WebP RGBA aux 32 poses et conserve la provenance', async () => {
  const source = ENEMIES.find((entry) => entry.id === profileId);
  assert.ok(source);
  const visual = resolveEnemyVisualProfile(source);
  assert.equal(visual.sheetId, sheetId);
  assert.equal(visual.spriteKey, 'facehugger');
  const sheet = resolveSpriteSheet(sheetId);
  const metadata = JSON.parse(await readFile('assets/openai/sprites/metadata/v65/facehugger-motion/enemy-002-facehugger.json', 'utf8'));
  const bytes = await readFile(`.${sheet.path}`);
  assert.deepEqual(spriteImageDimensions(bytes), { width: 1024, height: 2048 });
  assert.equal(createHash('sha256').update(bytes).digest('hex'), metadata.normalizedSha256);
  assert.equal(metadata.validation.uniqueFrameCount, 32);
  assert.equal(new Set(metadata.validation.cellRgbaSha256).size, 32);
  assert.deepEqual(metadata.validation.findings, []);
  assert.equal(metadata.sources.length, 4);
  assert.equal(metadata.scaleScope, 'all-four-clips');
  assert.equal(new Set(metadata.placements.map((pose) => pose.scale)).size, 1);
  assert.equal(metadata.canonExact, false, 'Ne pas transformer une adaptation en certification 1:1');
  assert.equal(sheet.sourceFacing, 1);
  assert.equal(shouldFlipSprite(sheetId, 1), false);
  assert.equal(shouldFlipSprite(sheetId, -1), true);
  assert.equal(resolveEnemyProfileVisualV65({ name: 'Armored Facehugger' }), null, 'Une variante ne reçoit pas une fausse plaque dédiée');
});

test('les quatre cycles Facehugger visitent leurs huit poses et la mort reste sur la dernière', () => {
  const sheet = resolveSpriteSheet(sheetId);
  assert.ok(sheet);
  const allFrames = [];
  for (const clip of SPRITE_CLIP_SETS[sheet.clipSet]) {
    const controller = new SpriteAnimationController();
    const request = { sheetId, clipId: clip.id };
    controller.sample('subject', request, 0);
    const samples = clip.frames.map((_, index) => controller.sample('subject', request, (index + 0.1) / clip.fps));
    assert.deepEqual(samples.map((sample) => sample.frame), clip.frames);
    assert.equal(samples.length, 8);
    for (const sample of samples) {
      assert.equal(sample.column, sample.frame % 4);
      assert.equal(sample.row, Math.floor(sample.frame / 4));
      assert.ok(sample.row >= 0 && sample.row < 8);
    }
    const after = controller.sample('subject', request, 8.1 / clip.fps);
    assert.equal(after.frame, clip.loop ? clip.frames[0] : clip.frames.at(-1));
    allFrames.push(...clip.frames);
  }
  assert.deepEqual(allFrames, Array.from({ length: 32 }, (_, i) => i));
  const living = { alive: true, visualSheetId: sheetId, spriteKey: 'facehugger', hurtClock: 0.2 };
  assert.equal(resolveEnemyAnimation(living).clipId, 'idle');
  assert.equal(resolveEnemyAnimation({ ...living, alive: false }).clipId, 'death');
});

test('le renderer V51 decoupe aussi les huit rangées sans déborder ni changer de personnage', () => {
  const sheet = resolveSpriteSheet(sheetId);
  assert.ok(sheet);
  const image = { complete: true, naturalWidth: 1024, naturalHeight: 2048 };
  const engine = Object.create(GameEngine.prototype);
  engine.images = new Map([[sheet.imageKey, image]]);
  const calls = [];
  const context = { save() {}, restore() {}, translate() {}, scale() {}, fillRect() {}, drawImage(...args) { calls.push(args); } };
  const enemy = { id: 'facehugger-draw', visualSheetId: sheetId, spriteKey: 'facehugger', x: 50, y: 80, w: 60, h: 22, facing: 1, alive: false, deathClock: 1 };
  engine.animationTime = 0;
  engine.drawEnemy(context, enemy);
  engine.animationTime = 1;
  engine.drawEnemy(context, enemy);
  assert.deepEqual(calls.map((args) => args.slice(1, 5)), [[0, 1536, 256, 256], [768, 1792, 256, 256]]);
  assert.ok(calls.every((args) => args[0] === image));
});
