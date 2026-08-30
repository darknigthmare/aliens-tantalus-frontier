import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import test from 'node:test';

import { ENEMIES, ENEMY_HYBRIDS_V64 } from '../src/content-core-v50.js';
import { GameEngine as V51GameEngine } from '../src/game-v51-runtime.js';
import { resolveEnemyVisualProfile } from '../src/enemy-visual-runtime-v53.js';
import {
  ENEMY_VISUAL_OVERRIDES_V64,
  resolveEnemyVisualOverrideV64
} from '../src/enemy-visual-overrides-v64.js';
import { resolveEnemyAnimation, resolveSpriteClip, resolveSpriteSheet } from '../src/sprite-animation-runtime.js';

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1024;
    this.naturalHeight = 1024;
  }
  set src(value) { this.currentSrc = value; }
}

const withImageMock = (run) => {
  const previousImage = globalThis.Image;
  const previousListener = globalThis.addEventListener;
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  try {
    return run();
  } finally {
    globalThis.Image = previousImage;
    globalThis.addEventListener = previousListener;
  }
};

test('le catalogue V64 expose les trois identités Excel exactes sans placeholder', () => {
  assert.equal(ENEMIES.length, 571);
  assert.deepEqual(ENEMY_HYBRIDS_V64.map((enemy) => enemy.id), [
    'enemy-569-newborn',
    'enemy-570-offspring',
    'enemy-571-predalien'
  ]);
  assert.deepEqual(ENEMY_HYBRIDS_V64.map((enemy) => enemy.excelIds), [
    ['CAS-0037', 'RAC-0040'],
    ['CAS-0038', 'RAC-0041'],
    ['CAS-0036']
  ]);
  assert.ok(ENEMY_HYBRIDS_V64.every((enemy) => enemy.referenceStatus === 'CANON_REFERENCE' && enemy.canonExact));
});

test('chaque hybride V64 possède sa plaque, sa hitbox et ses quatre clips jouables', async () => {
  for (const source of ENEMY_HYBRIDS_V64) {
    const direct = resolveEnemyVisualOverrideV64(source);
    const visual = resolveEnemyVisualProfile(source);
    assert.equal(visual.archetype, direct.archetype, source.name + ': résolution directe');
    assert.equal(visual.identityStatus, 'exact');
    assert.equal(visual.approximate, false);
    assert.equal(visual.fallbackReason, null);
    const sheet = resolveSpriteSheet(visual.sheetId);
    assert.equal(sheet.family, 'enemy');
    assert.equal(sheet.imageKey, visual.spriteKey);
    assert.equal(sheet.hitbox, visual.hitboxId);
    await access(new URL('..' + sheet.path, import.meta.url));
    for (const clipId of ['idle', 'chase', 'attack', 'death']) {
      assert.ok(resolveSpriteClip(sheet.id, clipId), source.name + ':' + clipId);
    }
    assert.deepEqual(
      resolveEnemyAnimation({ ...visual, visualSheetId: visual.sheetId, alive: true, attacking: true }),
      { sheetId: visual.sheetId, clipId: 'attack' }
    );
  }
  assert.deepEqual(Object.keys(ENEMY_VISUAL_OVERRIDES_V64), ['Newborn', 'Offspring', 'Predalien']);
});

test('les rencontres V64 matérialisent chaque hybride uniquement dans son monde déclaré', () => withImageMock(() => {
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  const engine = new V51GameEngine(canvas);
  engine.random = () => 0.5;
  const expected = new Map([
    ['Newborn', 'grappler'],
    ['Offspring', 'reach-hunter'],
    ['Predalien', 'hybrid-boss']
  ]);
  const rendered = new Map();
  for (const source of ENEMY_HYBRIDS_V64) {
    engine.world = { id: source.encounterWorldIds[0] };
    const encounter = engine.buildDefaultEnemies(ENEMIES);
    const present = encounter.filter((enemy) => expected.has(enemy.name));
    assert.deepEqual(present.map((enemy) => enemy.name), [source.name]);
    assert.equal(present[0].behavior, expected.get(source.name));
    assert.equal(present[0].isBoss, Boolean(source.defaultEncounter.boss));
    rendered.set(source.name, present[0]);
  }
  engine.world = { id: 'world-without-v64-hybrid' };
  assert.equal(engine.buildDefaultEnemies(ENEMIES).some((enemy) => expected.has(enemy.name)), false);
  assert.ok(rendered.get('Newborn').h > 110);
  assert.ok(rendered.get('Offspring').h > rendered.get('Newborn').h);
  assert.ok(rendered.get('Predalien').w > rendered.get('Newborn').w);
}));
