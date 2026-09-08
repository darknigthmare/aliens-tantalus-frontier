import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import test from 'node:test';

import { ENEMIES } from '../src/content-core-v50.js';
import {
  ENEMY_VISUAL_OVERRIDE_BASE_PROFILE_IDS_V56,
  ENEMY_VISUAL_OVERRIDES_V56,
  resolveEnemyVisualOverrideV56
} from '../src/enemy-visual-overrides-v56.js';
import {
  resolveEnemyArchetype,
  resolveEnemyVisualProfile
} from '../src/enemy-visual-runtime-v53.js';
import { GameEngine } from '../src/game-v51-runtime.js';
import {
  SPRITE_CLIP_SETS,
  SPRITE_HITBOXES,
  SPRITE_SHEETS,
  resolveEnemyAnimation
} from '../src/sprite-animation-runtime.js';

const PROJECT_ORIGINALS = Object.freeze([
  Object.freeze({
    name: 'Neuro-Xeno Drone',
    id: 'enemy-021-neuro-xeno-drone',
    spriteKey: 'neuroXenoDroneV56',
    sheetId: 'enemy.neuro-xeno-drone.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/neuro-xeno-drone-action-sheet-v56.png',
    hitboxId: 'neuro-xeno-ground',
    width: 176,
    height: 104,
    behavior: 'hunter'
  }),
  Object.freeze({
    name: 'ATARAX Ripper',
    id: 'enemy-023-atarax-ripper',
    spriteKey: 'ataraxRipperV56',
    sheetId: 'enemy.atarax-ripper.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/atarax-ripper-action-sheet-v56.png',
    hitboxId: 'atarax-ripper-ground',
    width: 184,
    height: 112,
    behavior: 'bruiser'
  }),
  Object.freeze({
    name: 'Colonial Raider',
    id: 'enemy-046-colonial-raider',
    spriteKey: 'colonialRaiderV56',
    sheetId: 'enemy.colonial-raider.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/colonial-raider-action-sheet-v56.png',
    hitboxId: 'npc-standing',
    width: 98,
    height: 138,
    behavior: 'shooter'
  }),
  Object.freeze({
    name: 'ATARAX Controller',
    id: 'enemy-047-atarax-controller',
    spriteKey: 'ataraxControllerV56',
    sheetId: 'enemy.atarax-controller.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/atarax-controller-action-sheet-v56.png',
    hitboxId: 'npc-standing',
    width: 100,
    height: 142,
    behavior: 'shooter'
  }),
  Object.freeze({
    name: 'Korari Stalker',
    id: 'enemy-050-korari-stalker',
    spriteKey: 'korariStalkerV56',
    sheetId: 'enemy.korari-stalker.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/korari-stalker-action-sheet-v56.png',
    hitboxId: 'korari-stalker-ground',
    width: 176,
    height: 88,
    behavior: 'pouncer'
  }),
  Object.freeze({
    name: 'Ceto Reef Predator',
    id: 'enemy-051-ceto-reef-predator',
    spriteKey: 'cetoReefPredatorV56',
    sheetId: 'enemy.ceto-reef-predator.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/ceto-reef-predator-action-sheet-v56.png',
    hitboxId: 'ceto-reef-predator-water',
    width: 186,
    height: 82,
    behavior: 'hunter'
  }),
  Object.freeze({
    name: 'Tantalus Tunnel Vermin',
    id: 'enemy-052-tantalus-tunnel-vermin',
    spriteKey: 'tantalusTunnelVerminV56',
    sheetId: 'enemy.tantalus-tunnel-vermin.action.v56',
    path: '/assets/openai/sprites/normalized/enemies/tantalus-tunnel-vermin-action-sheet-v56.png',
    hitboxId: 'tantalus-tunnel-vermin-ground',
    width: 180,
    height: 76,
    behavior: 'pouncer'
  })
]);

// Keep historical V56 contracts intact; only accepted standards050/051 migrate.
const currentRuntime = (entry) => entry.id === 'enemy-050-korari-stalker' ? {
  ...entry, sheetId: 'enemy.profile.enemy-050-korari-stalker.v66',
  path: '/assets/openai/sprites/normalized/enemy-profiles-v66/enemy-050-korari-stalker.webp',
  width: 288, height: 288
} : entry.id === 'enemy-051-ceto-reef-predator' ? {
  ...entry, sheetId: 'enemy.profile.enemy-051-ceto-reef-predator.v66',
  path: '/assets/openai/sprites/normalized/enemy-profiles-v66/enemy-051-ceto-reef-predator.webp',
  width: 384, height: 384
} : entry;

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1024;
    this.naturalHeight = 1024;
  }

  set src(value) {
    this.currentSrc = value;
    queueMicrotask(() => this.onload?.());
  }
}

test('les sept bases PROJECT_ORIGINAL pointent vers leurs feuilles V56 dédiées', async () => {
  const originals = Object.values(ENEMY_VISUAL_OVERRIDES_V56)
    .filter((entry) => entry.referenceStatus === 'PROJECT_ORIGINAL');
  assert.deepEqual(originals.map((entry) => entry.archetype), PROJECT_ORIGINALS.map((entry) => entry.name));
  assert.equal(new Set(ENEMY_VISUAL_OVERRIDE_BASE_PROFILE_IDS_V56).size, ENEMY_VISUAL_OVERRIDE_BASE_PROFILE_IDS_V56.length);

  for (const expected of PROJECT_ORIGINALS) {
    const source = ENEMIES.find((enemy) => enemy.id === expected.id);
    assert.ok(source, expected.id);
    assert.equal(source.name, expected.name);

    const visual = resolveEnemyVisualOverrideV56(source);
    assert.ok(visual, expected.name);
    assert.equal(visual.baseProfileId, expected.id);
    assert.equal(visual.catalogProfileId, expected.id);
    assert.equal(visual.spriteKey, expected.spriteKey);
    assert.equal(visual.sheetId, expected.sheetId);
    assert.equal(visual.path, expected.path);
    assert.equal(visual.hitboxId, expected.hitboxId);
    assert.deepEqual(visual.renderSize, { width: expected.width, height: expected.height });
    assert.equal(visual.identityStatus, 'project-original');
    assert.equal(visual.referenceStatus, 'PROJECT_ORIGINAL');
    assert.equal(visual.canonExact, false);
    assert.equal(visual.approximate, false);
    assert.equal(visual.fallbackReason, null);

    const sheet = SPRITE_SHEETS[expected.sheetId];
    assert.ok(sheet, expected.sheetId);
    assert.equal(sheet.imageKey, expected.spriteKey);
    assert.equal(sheet.path, expected.path);
    assert.equal(sheet.hitbox, expected.hitboxId);
    assert.equal(sheet.renderWidth, expected.width);
    assert.equal(sheet.renderHeight, expected.height);
    assert.ok(SPRITE_HITBOXES[expected.hitboxId], expected.hitboxId);
    assert.deepEqual(
      SPRITE_CLIP_SETS[sheet.clipSet].map((clip) => clip.id),
      ['idle', 'chase', 'attack', 'death']
    );
    await access('.' + expected.path);

    assert.equal(resolveEnemyAnimation({ ...visual, visualSheetId: visual.sheetId, alive: true }).clipId, 'idle');
    assert.equal(resolveEnemyAnimation({ ...visual, visualSheetId: visual.sheetId, alive: true, alert: true }).clipId, 'chase');
    assert.equal(resolveEnemyAnimation({ ...visual, visualSheetId: visual.sheetId, alive: true, attacking: true }).clipId, 'attack');
    assert.equal(resolveEnemyAnimation({ ...visual, visualSheetId: visual.sheetId, alive: false }).clipId, 'death');
  }
});

test('les variantes réemploient seulement leur famille dédiée et restent explicitement authored-family', () => {
  for (const expected of PROJECT_ORIGINALS) {
    const family = ENEMIES.filter((enemy) => resolveEnemyArchetype(enemy) === expected.name);
    const expectedCount = Number(expected.id.slice(6, 9)) <= 48 ? 11 : 10;
    assert.equal(family.length, expectedCount, expected.name);

    for (const source of family) {
      const direct = resolveEnemyVisualOverrideV56(source);
      const runtime = resolveEnemyVisualProfile(source);
      const isBase = source.id === expected.id;
      const identityStatus = isBase ? 'project-original' : 'authored-family';

      assert.ok(direct, source.id);
      assert.equal(direct.baseProfileId, expected.id, source.id);
      assert.equal(direct.catalogProfileId, source.id, source.id);
      assert.equal(direct.spriteKey, expected.spriteKey, source.id);
      assert.equal(direct.sheetId, expected.sheetId, source.id);
      assert.equal(direct.identityStatus, identityStatus, source.id);
      assert.equal(direct.approximate, !isBase, source.id);
      assert.equal(runtime.identityStatus, identityStatus, source.id);
      assert.equal(runtime.spriteKey, expected.spriteKey, source.id);
      assert.equal(runtime.sheetId, isBase ? currentRuntime(expected).sheetId : expected.sheetId, source.id);
      if (isBase) assert.equal(direct.fallbackReason, null, source.id);
      else assert.match(direct.fallbackReason, /modifier systémique/, source.id);
    }
  }
});

test('le GameEngine charge, dessine et spécialise les sept identités PROJECT_ORIGINAL', async () => {
  const previousImage = globalThis.Image;
  const previousAddEventListener = globalThis.addEventListener;
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};

  try {
    const canvas = {
      width: 1280,
      height: 720,
      getContext: () => ({}),
      addEventListener: () => {}
    };
    const engine = new GameEngine(canvas);
    engine.random = () => 0.25;

    for (const historical of PROJECT_ORIGINALS) {
      const expected = currentRuntime(historical);
      const source = ENEMIES.find((enemy) => enemy.id === expected.id);
      const enemy = engine.createEnemy(source, 0, 320, 930);
      assert.equal(enemy.spriteKey, expected.spriteKey, expected.name);
      assert.equal(enemy.visualSheetId, expected.sheetId, expected.name);
      assert.equal(enemy.visualIdentityStatus, 'project-original', expected.name);
      assert.equal(enemy.behavior, expected.behavior, expected.name);
      await engine.ensureEnemyAtlas(SPRITE_SHEETS[enemy.visualSheetId]);
      assert.equal(engine.images.get(SPRITE_SHEETS[expected.sheetId].imageKey)?.currentSrc, expected.path, expected.name);

      const drawCalls = [];
      const context = {
        save() {},
        restore() {},
        translate() {},
        scale() {},
        drawImage(...args) {
          drawCalls.push(args);
        },
        fillRect() {}
      };
      engine.drawEnemy(context, { ...enemy, facing: 1, alert: false, attacking: false });
      assert.equal(drawCalls.length, 1, expected.name);
      assert.equal(drawCalls[0][0].currentSrc, expected.path, expected.name);
      assert.deepEqual(drawCalls[0].slice(-2), [expected.width, expected.height], expected.name);
    }
  } finally {
    globalThis.Image = previousImage;
    globalThis.addEventListener = previousAddEventListener;
  }
});

test('une identité inconnue ne peut pas emprunter une plaque PROJECT_ORIGINAL', () => {
  assert.equal(resolveEnemyVisualOverrideV56({
    id: 'enemy-999-unknown-fauna',
    name: 'Unknown Fauna',
    biology: 'fauna',
    modifier: 'Standard'
  }), null);
});
