import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ENEMIES } from '../src/content-core-v50.js';
import { GameEngine } from '../src/game-v51-runtime.js';
import { buildEnemyRuntime } from '../src/game-runtime.js';
import { GameEngine as ProductionGameEngine } from '../src/game-production-runtime.js';
import {
  READY_ENEMY_PROFILE_REGISTRY_V66,
  resolveEnemyProfileVisualV66
} from '../src/enemy-profile-registry-v66.js';
import { V66_ENEMY_BODY_DIMENSIONS } from '../src/enemy-profile-geometry-v66.js';
import {
  SPRITE_HITBOXES,
  SpriteAnimationController,
  resolveEnemyAnimation,
  resolveSpriteClip,
  resolveSpriteSheet,
  shouldFlipSprite
} from '../src/sprite-animation-runtime.js';
import {
  ENEMY_COMBAT_CONTRACTS_V81,
  captureEnemyBatchCombatResumeV66,
  getEnemyBatchActionAnimationV66,
  restoreEnemyBatchCombatResumeV66,
  updateEnemyBatchCombatV66
} from '../src/enemy-batch-combat-v66.js';
import { spriteImageDimensions } from './helpers/sprite-image-dimensions.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const IDS = ['enemy-009-crusher', 'enemy-010-spitter'];
const read = (relative) => readFileSync(new URL('../' + relative.replaceAll('\\', '/'), import.meta.url));
const json = (relative) => JSON.parse(read(relative));
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const actor = (x, extra = {}) => ({
  x, y: 838, w: 42, h: 92, alive: true, downed: false, lost: false,
  inVehicle: false, ventTransit: null, health: 100, ...extra
});

test('V81: manifeste, sources, métadonnées et deux atlas restent reliés par leurs vrais SHA-256', () => {
  const manifest = json('assets/openai/sprites/metadata/v81/enemy-wave-manifest.json');
  assert.equal(manifest.release, 'v81');
  assert.equal(manifest.canonExact, false);
  assert.equal(manifest.review.status, 'accepted-project-visual-review');
  assert.match(manifest.review.scope, /not a 1:1 or official-pixel claim/);
  assert.deepEqual(manifest.profiles.map((entry) => entry.profileId), IDS);
  for (const entry of manifest.profiles) {
    assert.equal(entry.generationProvider, 'OpenAI ImageGen');
    assert.equal(entry.sourceRelease, 'v66');
    assert.equal(entry.sourceFacing, 'right');
    assert.equal(entry.remainingStrictMagentaPixels, 0);
    assert.ok(entry.referenceUrls.every((url) => url.startsWith('https://')));
    assert.equal(sha256(read(entry.normalizedPath)), entry.normalizedSha256);
    assert.equal(sha256(read(entry.metadataPath)), entry.metadataSha256);
    for (const [clip, hash] of Object.entries(entry.sourceSha256ByClip)) {
      const source = `assets/openai/sprites/frames/v66/batch-002/${entry.profileId}/${clip}.png`;
      assert.equal(sha256(read(source)), hash);
    }
    const metadata = json(entry.metadataPath);
    assert.equal(metadata.release, 'v81');
    assert.equal(metadata.generatedBy, 'scripts/process-v81-enemy-wave.py');
    assert.equal(metadata.normalizationStatus, 'validated');
    assert.equal(metadata.acceptanceStatus, 'pending-visual-review');
    assert.equal(metadata.runtimeIntegrated, false);
    assert.equal(metadata.canonExact, false);
    assert.equal(metadata.validation.findings.length, 0);
    assert.equal(metadata.validation.uniqueFrameCount, entry.frameCount);
    assert.equal(metadata.magentaSpill.remainingStrictPixelCount, 0);
    assert.deepEqual(spriteImageDimensions(read(entry.normalizedPath)), {
      width: entry.grid.columns * entry.grid.cellWidth,
      height: entry.grid.rows * entry.grid.cellHeight
    });
  }
  assert.ok(ROOT.endsWith('project\\') || ROOT.endsWith('project/'));
});

test('V81: registre exact, orientation, clips et géométrie ne réutilisent aucun placeholder', () => {
  const ready = READY_ENEMY_PROFILE_REGISTRY_V66.filter((entry) => IDS.includes(entry.profileId));
  assert.deepEqual(ready.map((entry) => entry.profileId), IDS);
  for (const entry of ready) {
    const visual = resolveEnemyProfileVisualV66({ id: entry.profileId, name: 'nom contradictoire permis par ID exact' });
    assert.equal(visual.schema, 81);
    assert.equal(visual.wave, 'v81');
    assert.equal(visual.profileId, entry.profileId);
    assert.equal(visual.approximate, false);
    assert.equal(visual.canonExact, false);
    assert.equal(visual.sheetId, `enemy.profile.${entry.profileId}.v81`);
    const sheet = resolveSpriteSheet(visual.sheetId);
    assert.ok(sheet);
    assert.equal(sheet.path, `/assets/openai/sprites/normalized/enemy-profiles-v81/${entry.profileId}.webp`);
    assert.equal(sheet.sourceFacing, 1);
    assert.equal(sheet.renderWidth, sheet.renderHeight);
    assert.equal(shouldFlipSprite(sheet.id, 1), false);
    assert.equal(shouldFlipSprite(sheet.id, -1), true);
    assert.ok(SPRITE_HITBOXES[sheet.hitbox]);
    assert.ok(V66_ENEMY_BODY_DIMENSIONS[entry.profileId]);
    for (const clipId of ['idle', 'move', 'attack', 'death']) {
      assert.equal(resolveSpriteClip(sheet.id, clipId).frames.length, 8);
    }
  }
  const crusher = resolveSpriteSheet('enemy.profile.enemy-009-crusher.v81');
  assert.equal(crusher.clipSet, 'siege-action-v66');
  assert.equal(crusher.rows, 10);
  assert.deepEqual(resolveSpriteClip(crusher.id, 'charge').frames, [32, 33, 34, 35, 36, 37, 38, 39]);
  const spitter = resolveSpriteSheet('enemy.profile.enemy-010-spitter.v81');
  assert.equal(spitter.clipSet, 'enemy-action-v66');
  assert.equal(spitter.rows, 8);
  assert.equal(resolveEnemyProfileVisualV66({ id: 'enemy-062-albino-spitter', name: 'Spitter' }), null);
});

test('V81: la fabrique V51 applique les tailles revues et les IA exactes par profil', () => {
  const engine = {
    random: () => 0.5,
    initializeEnemyMissionNavigation() {}
  };
  for (const [profileId, behavior] of [['enemy-009-crusher', 'charger'], ['enemy-010-spitter', 'spitter']]) {
    const source = ENEMIES.find((entry) => entry.id === profileId);
    const enemy = GameEngine.prototype.createEnemy.call(engine, source, 0, 600, 930);
    const dimensions = V66_ENEMY_BODY_DIMENSIONS[profileId];
    assert.equal(enemy.visualSheetId, `enemy.profile.${profileId}.v81`);
    assert.equal(enemy.behavior, behavior);
    assert.ok(Math.abs(enemy.w - dimensions.width) <= 1);
    assert.ok(Math.abs(enemy.h - dimensions.height) <= 1);
    assert.ok(Math.abs(enemy.y + enemy.h - 930) < 1e-8);
  }
});

test('V81 Crusher: la chaine de production conserve charger par profileId ou id exact', () => {
  const source = ENEMIES.find((entry) => entry.id === 'enemy-009-crusher');
  assert.equal(buildEnemyRuntime(source).runtimeBehavior, 'charger');
  assert.equal(buildEnemyRuntime({ ...source, id: 'enemy-runtime-alias', profileId: source.id }).runtimeBehavior, 'charger');
  assert.equal(
    buildEnemyRuntime({ ...source, id: 'enemy-009-crusher-copy', profileId: undefined }).runtimeBehavior,
    'stalker',
    'un identifiant ressemblant ne doit pas recevoir le contrat V81'
  );

  const engine = Object.assign(Object.create(ProductionGameEngine.prototype), {
    difficultyRuntime: { id: 'standard' },
    random: () => 0.5,
    initializeEnemyMissionNavigation() {}
  });
  const enemy = engine.createEnemy(source, 0, 600, 930);
  assert.equal(enemy.visualSheetId, 'enemy.profile.enemy-009-crusher.v81');
  assert.equal(enemy.sourceBehavior, 'stalk');
  assert.equal(enemy.behavior, 'charger');
});

test('V81: le timing combat pilote directement charge32-39 et attaque16-23', () => {
  for (const [profileId, clipId, offset] of [
    ['enemy-009-crusher', 'charge', 32],
    ['enemy-010-spitter', 'attack', 16]
  ]) {
    const entry = ENEMY_COMBAT_CONTRACTS_V81[profileId];
    const enemy = {
      id: profileId, visualSheetId: entry.sheetId, alive: true, attacking: true,
      batchAttackV66: { elapsed: 0 }, vx: 0
    };
    const controller = new SpriteAnimationController();
    for (let frame = 0; frame < 8; frame += 1) {
      enemy.batchAttackV66.elapsed = (frame + 0.01) / entry.fps;
      assert.deepEqual(getEnemyBatchActionAnimationV66(enemy), { clipId, frame: offset + frame });
      const request = resolveEnemyAnimation(enemy);
      assert.deepEqual(request, { sheetId: entry.sheetId, clipId, frame: offset + frame });
      const sample = controller.sample(enemy.id, request, frame / entry.fps);
      assert.equal(sample.frame, offset + frame);
      assert.equal(sample.column, (offset + frame) % 4);
      assert.equal(sample.row, Math.floor((offset + frame) / 4));
    }
  }
});

test('V81 Crusher: un atlas en chargement ne retombe jamais sur la silhouette Pathogen', () => {
  const sheet = resolveSpriteSheet('enemy.profile.enemy-009-crusher.v81');
  const engine = Object.create(GameEngine.prototype);
  engine.images = new Map([['pathogen', { complete: true, naturalWidth: 1024, naturalHeight: 1024 }]]);
  engine.enemyAtlasLRUV65 = null;
  engine.animationTime = 0;
  let requested = null;
  let draws = 0;
  engine.ensureEnemyAtlas = (entry) => { requested = entry; return Promise.resolve(null); };
  engine.drawSheetCell = () => { draws += 1; };
  const context = new Proxy({}, { get: () => () => {}, set: () => true });
  GameEngine.prototype.drawEnemy.call(engine, context, {
    id: 'crusher-loading', visualSheetId: sheet.id, spriteKey: 'xenoCrusher', biology: 'xenomorph',
    alive: true, alert: true, attacking: false, hurtClock: 0, revealed: 0,
    x: 100, y: 600, w: 196, h: 170, health: 100, maxHealth: 100, facing: 1
  });
  assert.equal(draws, 0);
  assert.equal(requested?.id, sheet.id);
});

function combatFixture(profileId, distance) {
  const entry = ENEMY_COMBAT_CONTRACTS_V81[profileId];
  const dimensions = V66_ENEMY_BODY_DIMENSIONS[profileId];
  const events = [];
  const motions = [];
  const enemy = {
    id: profileId + ':fixture', name: profileId, visualSheetId: entry.sheetId,
    behavior: profileId.endsWith('spitter') ? 'spitter' : 'charger',
    x: 600, y: 930 - dimensions.height, w: dimensions.width, h: dimensions.height,
    spawnX: 600, speed: 130, alive: true, captured: false, alert: true, facing: 1,
    damage: profileId.endsWith('spitter') ? 17 : 14,
    attackClock: 0, rangedClock: 0, staggerClock: 0, hurtClock: 0,
    v52HurtClock: 0, jammedClock: 0, revealed: 0
  };
  const targetX = enemy.x + distance + (enemy.w - 42) / 2;
  const engine = {
    player: actor(targetX), coop: actor(1800, { coop: true }), coopEnabled: false,
    squadActors: [], covers: [], walls: [], doors: [], hostileProjectiles: [],
    vehicle: null, animationTime: 0,
    activeSquadActors() { return this.squadActors; },
    closedDoorColliders() { return []; },
    onEvent(event) { events.push(event); },
    enemyMeleePathClearV64() { return true; },
    resolveEnemyHorizontal(entity, previousX) { motions.push(entity.x - previousX); },
    damagePlayer(target, damage) { target.health -= damage; },
    damageSquadMember(target, damage) { target.health -= damage; },
    damageVehicle() {},
    spawnImpact() {}
  };
  const step = (delta) => {
    engine.animationTime += delta;
    return updateEnemyBatchCombatV66(engine, enemy, delta);
  };
  return { entry, enemy, engine, events, motions, step };
}

test('V81 Crusher: charge balayée, impact unique et aucune téléportation', () => {
  const entry = ENEMY_COMBAT_CONTRACTS_V81['enemy-009-crusher'];
  const { enemy, engine, events, motions, step } = combatFixture(
    'enemy-009-crusher',
    entry.stopRange + entry.lungeDistance
  );
  step(0);
  assert.equal(enemy.batchAttackV66.distance, entry.lungeDistance);
  assert.equal(enemy.x, 600);
  step(entry.impact - 1 / 120);
  assert.equal(engine.player.health, 100);
  step(1 / 120);
  assert.equal(engine.player.health, 86);
  step(entry.duration);
  assert.equal(engine.player.health, 86);
  assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 1);
  assert.ok(motions.length > 1);
  assert.ok(motions.every((amount) => Math.abs(amount) <= entry.maximumStep));
  assert.ok(Math.abs(enemy.x - 600 - entry.lungeDistance) < 1e-8);
});

test('V81 Crusher: une collision en sous-pas annule la charge sans dégât fantôme', () => {
  const entry = ENEMY_COMBAT_CONTRACTS_V81['enemy-009-crusher'];
  const { enemy, engine, events, step } = combatFixture(
    'enemy-009-crusher',
    entry.stopRange + entry.lungeDistance
  );
  step(0);
  engine.resolveEnemyHorizontal = (entity, previousX) => { entity.x = previousX; };
  step(entry.impact);
  assert.equal(enemy.x, 600);
  assert.equal(engine.player.health, 100);
  assert.equal(enemy.batchAttackV66, null);
  assert.ok(events.some((event) => event.type === 'enemy-attack-cancelled' && event.reason === 'collision-blocked'));
});

test('V81 Spitter: libération au frame20, projectile acide réel puis collision joueur', () => {
  const entry = ENEMY_COMBAT_CONTRACTS_V81['enemy-010-spitter'];
  const { enemy, engine, events, step } = combatFixture('enemy-010-spitter', 320);
  step(0);
  assert.equal(engine.hostileProjectiles.length, 0);
  step(entry.impact - 1 / 120);
  assert.equal(engine.hostileProjectiles.length, 0);
  assert.equal(engine.player.health, 100);
  step(1 / 120);
  assert.equal(resolveEnemyAnimation(enemy).frame, 20);
  assert.equal(engine.hostileProjectiles.length, 1);
  assert.equal(engine.hostileProjectiles[0].acid, true);
  assert.equal(engine.player.health, 100, 'la pose de tir ne fait pas de dégât instantané');
  step(entry.duration);
  assert.equal(engine.hostileProjectiles.length, 1, 'la récupération ne duplique pas le projectile');
  for (let tick = 0; tick < 90 && engine.player.health === 100; tick += 1) {
    GameEngine.prototype.updateHostileProjectiles.call(engine, 1 / 60);
  }
  assert.equal(engine.player.health, 83);
  assert.equal(events.filter((event) => event.type === 'enemy-projectile-released').length, 1);
});

test('V81 Spitter: la trajectoire normalisée atteint une cible sur une autre hauteur', () => {
  const entry = ENEMY_COMBAT_CONTRACTS_V81['enemy-010-spitter'];
  const { engine, step } = combatFixture('enemy-010-spitter', 320);
  engine.player.y -= 130;
  step(0);
  step(entry.impact);
  assert.equal(engine.hostileProjectiles.length, 1);
  const projectile = engine.hostileProjectiles[0];
  assert.ok(projectile.vy < 0, 'le tir doit monter vers la cible haute');
  assert.ok(Math.abs(Math.hypot(projectile.vx, projectile.vy) - entry.projectileSpeed) < 1e-8);
  for (let tick = 0; tick < 120 && engine.player.health === 100; tick += 1) {
    GameEngine.prototype.updateHostileProjectiles.call(engine, 1 / 120);
  }
  assert.equal(engine.player.health, 83);
});

test('V81 Spitter: perte de ligne de tir et reprise de sauvegarde ne créent aucun projectile différé', () => {
  const entry = ENEMY_COMBAT_CONTRACTS_V81['enemy-010-spitter'];
  {
    const { enemy, engine, events, step } = combatFixture('enemy-010-spitter', 320);
    step(0);
    engine.enemyMeleePathClearV64 = () => false;
    step(entry.impact);
    assert.equal(engine.hostileProjectiles.length, 0);
    assert.ok(events.some((event) => event.type === 'enemy-attack-cancelled' && event.reason === 'path-blocked'));
  }
  {
    const { enemy, engine, step } = combatFixture('enemy-010-spitter', 320);
    step(0);
    const saved = captureEnemyBatchCombatResumeV66(enemy);
    assert.equal(saved.batchAttackActiveV66, true);
    assert.equal(restoreEnemyBatchCombatResumeV66(enemy, saved), true);
    assert.equal(enemy.batchAttackV66, null);
    assert.ok(enemy.attackClock >= entry.duration);
    step(entry.impact);
    assert.equal(engine.hostileProjectiles.length, 0);
  }
});
