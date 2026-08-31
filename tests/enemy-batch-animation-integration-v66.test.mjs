import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/content-core-v50.js';
import { GameEngine } from '../src/game-v51-runtime.js';
import { withV52LevelRuntime } from '../src/game-v52-level-runtime.js';
import { resolveEnemyVisualProfile } from '../src/enemy-visual-runtime-v53.js';
import { resolveEnemyProfileVisualV66 } from '../src/enemy-profile-registry-v66.js';
import {
  ENEMY_BATCH_COMBAT_CONTRACTS_V66 as combatContracts,
  updateEnemyBatchCombatV66
} from '../src/enemy-batch-combat-v66.js';
import {
  OVOMORPH_CYCLE_V66 as eggContract,
  getOvomorphChildIdV66,
  updateOvomorphCycleV66
} from '../src/enemy-ovomorph-cycle-v66.js';
import {
  SPRITE_HITBOXES,
  SPRITE_PIVOTS,
  SpriteAnimationController,
  resolveEnemyAnimation,
  resolveSpriteSheet,
  resolveSpriteClip,
  shouldFlipSprite
} from '../src/sprite-animation-runtime.js';

const combatIds = Object.keys(combatContracts);
const readyIds = [eggContract.profileId, ...combatIds];
const actor = (x) => ({ x, y: 838, w: 42, h: 92, alive: true, health: 100 });
const sheetIdFor = (profileId) => `enemy.profile.${profileId}.v66`;

// These are release-gate tests against the real readylist, not injected sprite
// metadata. Missing acceptance must fail visibly instead of silently skipping.
function requireSheet(profileId) {
  const sheet = resolveSpriteSheet(sheetIdFor(profileId));
  assert.ok(sheet, `${profileId}: vraie plaque V66 absente de la readylist`);
  assert.equal(sheet.profileId, profileId);
  return sheet;
}

function fixture(profileId) {
  requireSheet(profileId);
  const events = [];
  const engine = {
    random: () => 0.5, animationTime: 0, enemies: [],
    player: actor(760), coop: null, coopEnabled: false,
    squadActors: [], walls: [], doors: [], covers: [],
    missionLevelBounds: { width: 6200, height: 1080 },
    activeSquadActors() { return this.squadActors; },
    closedDoorColliders() { return []; },
    enemyMeleePathClearV64() { return true; },
    resolveHorizontal: GameEngine.prototype.resolveHorizontal,
    resolveEnemyHorizontal: GameEngine.prototype.resolveEnemyHorizontal,
    createEnemy: GameEngine.prototype.createEnemy,
    onEvent(event) { events.push(event); },
    damagePlayer(target, damage) { target.health -= damage; },
    damageSquadMember(target, damage) { target.health -= damage; },
    initializeEnemyMissionNavigation() {}
  };
  const source = ENEMIES.find((entry) => entry.id === profileId);
  assert.ok(source);
  const enemy = engine.createEnemy(source, 0, 600, 930);
  assert.equal(enemy.visualSheetId, sheetIdFor(profileId));
  enemy.alert = true;
  enemy.attackClock = 0;
  engine.enemies.push(enemy);
  return { engine, enemy, events };
}

function assertCell(sample, sheetId, clipId, frame) {
  assert.ok(sample);
  assert.equal(sample.sheet.id, sheetId);
  assert.equal(sample.clip.id, clipId);
  assert.equal(sample.frame, frame);
  assert.equal(sample.column, frame % 4);
  assert.equal(sample.row, Math.floor(frame / 4));
  assert.ok(sample.row >= 0 && sample.row < sample.sheet.rows);
  assert.ok(sample.clip.frames.includes(frame), 'aucun passage dans la ligne d une autre action');
}

test('V66 batch001: les cinq profils acceptes resolvent leurs propres plaques de32poses', () => {
  assert.equal(readyIds.length, 5);
  const paths = new Set();
  for (const profileId of readyIds) {
    const sheet = requireSheet(profileId);
    const source = ENEMIES.find((entry) => entry.id === profileId);
    const visual = resolveEnemyVisualProfile(source);
    assert.equal(visual.sheetId, sheet.id);
    assert.equal(visual.profileId, profileId);
    assert.equal(visual.canonExact, false);
    assert.equal(visual.approximate, false);
    assert.equal(sheet.clipSet, profileId === eggContract.profileId ? 'ovomorph-cycle-v66' : 'enemy-action-v66');
    assert.equal(sheet.path, `/assets/openai/sprites/normalized/enemy-profiles-v66/${profileId}.webp`);
    assert.equal(sheet.columns, 4);
    assert.equal(sheet.rows, 8);
    assert.equal(sheet.cellWidth, 256);
    assert.equal(sheet.cellHeight, 256);
    assert.equal(sheet.renderWidth, sheet.renderHeight, 'aucun etirement des cellules carrees');
    assert.equal(sheet.sourceFacing, 1);
    assert.equal(shouldFlipSprite(sheet.id, 1), false);
    assert.equal(shouldFlipSprite(sheet.id, -1), true);
    paths.add(sheet.path);
  }
  assert.equal(paths.size, 5, 'aucune plaque partagee entre deux identites');
});

test('lookup V66: ID exact prioritaire, aucun emprunt par nom contradictoire, variante ou espèce voisine', () => {
  for (const profileId of readyIds) {
    const sheet = requireSheet(profileId);
    const source = ENEMIES.find((entry) => entry.id === profileId);
    for (const input of [profileId, source.name, { id: profileId }, { name: source.name },
      { id: profileId, name: 'autre espece volontairement contradictoire' }]) {
      assert.equal(resolveEnemyProfileVisualV66(input)?.sheetId, sheet.id);
    }
    for (const input of [{ id: 'enemy-999-not-a-real-profile', name: source.name },
      { id: 'enemy-002-facehugger', name: source.name }]) {
      assert.equal(resolveEnemyProfileVisualV66(input), null);
      assert.notEqual(resolveEnemyVisualProfile(input).sheetId, sheet.id);
    }
    const variant = ENEMIES.find((entry) => entry.id !== profileId
      && entry.modifier && entry.modifier !== 'Standard' && entry.name.endsWith(source.name));
    assert.ok(variant, `variante cataloguée attendue pour ${profileId}`);
    assert.equal(resolveEnemyProfileVisualV66(variant), null);
    assert.equal(resolveEnemyProfileVisualV66({ id: variant.id, name: source.name }), null);
    assert.notEqual(resolveEnemyVisualProfile(variant).sheetId, sheet.id);
  }
  const facehugger = resolveEnemyVisualProfile(ENEMIES.find((entry) => entry.id === 'enemy-002-facehugger'));
  assert.equal(facehugger.sheetId, eggContract.childSheetId, 'le Facehugger conserve son atlas V65');
});

for (const profileId of readyIds) {
  test(`${profileId}: la fabrique derive la physique de la hitbox calibree et conserve le sol`, () => {
    const sheet = requireSheet(profileId);
    const { enemy } = fixture(profileId);
    const hitbox = SPRITE_HITBOXES[sheet.hitbox];
    assert.ok(hitbox, 'hitbox physique declaree');
    const expectedWidth = hitbox.width * sheet.renderWidth / sheet.cellWidth;
    const expectedHeight = hitbox.height * sheet.renderHeight / sheet.cellHeight;
    assert.ok(Math.abs(enemy.w - expectedWidth) <= 1, `largeur ${enemy.w} contre hitbox rendue ${expectedWidth}`);
    assert.ok(Math.abs(enemy.h - expectedHeight) <= 1, `hauteur ${enemy.h} contre hitbox rendue ${expectedHeight}`);
    assert.equal(enemy.x, 600);
    assert.ok(Math.abs(enemy.y + enemy.h - 930) < 1e-8);
    assert.ok(enemy.w > 0 && enemy.h > 0);
  });

  test(`${profileId}: drawEnemy V51 utilise la cellule globale et le pivot V66 sans etirement`, () => {
    const sheet = requireSheet(profileId);
    const { enemy } = fixture(profileId);
    const frame = profileId === eggContract.profileId ? 23 : 21;
    if (profileId === eggContract.profileId) {
      enemy.ovomorphCycleV66 = { phase: 'spent', elapsed: 0.8, spawned: true };
    } else {
      enemy.attacking = true;
      enemy.batchAttackV66 = { elapsed: 5 / 12 };
    }
    enemy.facing = 1;
    const image = { complete: true, naturalWidth: 1024, naturalHeight: 2048 };
    const engine = Object.create(GameEngine.prototype);
    engine.images = new Map([[sheet.imageKey, image]]);
    engine.animationTime = 9999;
    const draws = [];
    const context = { save() {}, restore() {}, translate() {}, scale() {}, fillRect() {},
      drawImage(...args) { draws.push(args); } };
    engine.drawEnemy(context, enemy);
    assert.equal(draws.length, 1);
    const [draw] = draws;
    assert.equal(draw[0], image, 'aucune image de remplacement d une autre espece');
    assert.deepEqual(draw.slice(1, 5), [(frame % 4) * 256, Math.floor(frame / 4) * 256, 256, 256]);
    assert.equal(draw[7], sheet.renderWidth);
    assert.equal(draw[8], sheet.renderHeight);
    assert.equal(draw[7], draw[8], 'le rendu ne comprime pas les sources carrees');
    const pivot = SPRITE_PIVOTS[sheet.pivot];
    assert.ok(pivot);
    assert.ok(Math.abs(draw[6] + pivot.y * sheet.renderHeight / sheet.cellHeight - (enemy.y + enemy.h)) < 1e-8,
      'le pivot de contact calibree reste pose au sol');
  });
}

for (const profileId of combatIds) {
  test(`${profileId}: resolver et sampler parcourent les32cellules sans changer d identite`, () => {
    const sheet = requireSheet(profileId);
    const frames = [];
    for (const clipId of ['idle', 'move', 'attack', 'death']) {
      const clip = resolveSpriteClip(sheet.id, clipId);
      const enemy = { id: 'timeline', visualSheetId: sheet.id, alive: clipId !== 'death',
        vx: clipId === 'move' ? -100 : 0, alert: false, attacking: clipId === 'attack' };
      const controller = new SpriteAnimationController();
      if (clipId === 'attack') enemy.batchAttackV66 = { elapsed: 0 };
      controller.sample(enemy.id, resolveEnemyAnimation(enemy), 0);
      for (let index = 0; index < 8; index += 1) {
        const elapsed = (index + 0.01) / clip.fps;
        if (clipId === 'attack') enemy.batchAttackV66.elapsed = elapsed;
        const request = resolveEnemyAnimation(enemy);
        assert.equal(request.clipId, clipId);
        if (clipId === 'attack') assert.equal(request.frame, 16 + index);
        const sample = controller.sample(enemy.id, request, elapsed);
        assertCell(sample, sheet.id, clipId, clip.frames[index]);
        frames.push(sample.frame);
      }
      if (clipId === 'attack') enemy.batchAttackV66.elapsed = 8 / 12;
      const last = controller.sample(enemy.id, resolveEnemyAnimation(enemy), 100);
      assert.equal(last.frame, clip.loop ? clip.frames[0] : clip.frames[7]);
    }
    assert.deepEqual(frames, Array.from({ length: 32 }, (_, index) => index));
  });

  test(`${profileId}: premier rendu tardif et horloge graphique decalee respectent l impact combat5/12`, () => {
    const { engine, enemy, events } = fixture(profileId);
    const contract = combatContracts[profileId];
    engine.player.x = enemy.x + contract.meleeRange - 12;
    updateEnemyBatchCombatV66(engine, enemy, 0);
    assert.equal(enemy.attacking, true);
    updateEnemyBatchCombatV66(engine, enemy, 5 / 12);
    assert.equal(engine.player.health, 100 - enemy.damage);
    const request = resolveEnemyAnimation(enemy);
    assert.equal(request.frame, 21, 'le temps combat prime meme au tout premier rendu');
    const controller = new SpriteAnimationController();
    for (const drawTime of [4096, 4096.01, 8192, 0]) {
      assertCell(controller.sample(enemy.id, request, drawTime, { reducedMotion: true }), enemy.visualSheetId, 'attack', 21);
    }
    assert.equal(engine.player.health, 100 - enemy.damage, 'echantillonner une image ne rejoue aucun degat');
    assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 1);
    updateEnemyBatchCombatV66(engine, enemy, 2 / 12);
    assertCell(controller.sample(enemy.id, resolveEnemyAnimation(enemy), 9000), enemy.visualSheetId, 'attack', 23);
    updateEnemyBatchCombatV66(engine, enemy, 1 / 12);
    assert.notEqual(resolveEnemyAnimation(enemy).clipId, 'attack');
    // A new attack may reuse the same sheet/clip signature, but its explicit
    // combat frame must still return to anticipation, not stale recovery.
    enemy.attackClock = 0;
    updateEnemyBatchCombatV66(engine, enemy, 0);
    assertCell(controller.sample(enemy.id, resolveEnemyAnimation(enemy), 9001), enemy.visualSheetId, 'attack', 16);
  });

  test(`${profileId}: blessure ne montre pas un cadavre et mort prime sur attaque obsolete`, () => {
    const sheet = requireSheet(profileId);
    const enemy = { id: 'priority', visualSheetId: sheet.id, alive: true, vx: 100,
      attacking: true, batchAttackV66: { elapsed: 0.5 }, hurtClock: 0.2 };
    const hurt = resolveEnemyAnimation(enemy);
    assert.equal(hurt.clipId, 'idle');
    assert.equal(hurt.reaction, 'hurt');
    assert.equal(hurt.frame, undefined);
    enemy.alive = false;
    const dead = resolveEnemyAnimation(enemy);
    assert.equal(dead.clipId, 'death');
    assert.equal(dead.sheetId, sheet.id);
    assert.equal(dead.frame, undefined, 'ne pas transporter la frame21 d attaque dans la mort');
    assertCell(new SpriteAnimationController().sample(enemy.id, dead, 500), sheet.id, 'death', 24);
  });
}

test('V66 mouvement reel: la collision V51 ne laisse pas le Runner en idle quand x avance', () => {
  const { engine, enemy } = fixture('enemy-006-runner');
  engine.player.x = 1100;
  enemy.attackClock = 2;
  const previousX = enemy.x;
  updateEnemyBatchCombatV66(engine, enemy, 0.1);
  assert.ok(enemy.x > previousX, 'l IA a effectue un vrai deplacement');
  const request = resolveEnemyAnimation(enemy);
  assert.equal(request.clipId, 'move', 'un deplacement effectif doit afficher le cycle move');
  assertCell(new SpriteAnimationController().sample(enemy.id, request, 100), enemy.visualSheetId, 'move', 8);
});

test('V66 alerte immobile: aucune marche sur place quand aucun deplacement n a eu lieu', () => {
  const sheet = requireSheet('enemy-006-runner');
  const enemy = { id: 'stationary', visualSheetId: sheet.id, alive: true, alert: true, vx: 0, attacking: false };
  assert.equal(resolveEnemyAnimation(enemy).clipId, 'idle');
});

test('sample accepte uniquement les frames globales appartenant au clip demande', () => {
  // Existing real V65 sheet keeps this shared-controller safety gate runnable
  // even before the separate V66 art acceptance gate has been completed.
  const sheetId = eggContract.childSheetId;
  const clip = resolveSpriteClip(sheetId, 'attack');
  assert.deepEqual(clip.frames, [16, 17, 18, 19, 20, 21, 22, 23]);
  for (const frame of clip.frames) {
    const controller = new SpriteAnimationController();
    assertCell(controller.sample('explicit', { sheetId, clipId: 'attack', frame }, 99), sheetId, 'attack', frame);
  }
  for (const frame of [-1, 0, 7, 15, 24, 31, 32, 1000000, NaN, Infinity, -Infinity, 20.5, '21', null, {}, undefined]) {
    const controller = new SpriteAnimationController();
    const request = { sheetId, clipId: 'attack', frame };
    assertCell(controller.sample('invalid', request, 99), sheetId, 'attack', 16);
    assertCell(controller.sample('invalid', request, 99 + 3.1 / clip.fps), sheetId, 'attack', 19);
  }
  const controller = new SpriteAnimationController();
  assert.equal(controller.sample('unknown', { sheetId: 'enemy.profile.no-such-profile.v66', clipId: 'attack', frame: 21 }, 0), null);
  assert.equal(controller.sample('unknown-clip', { sheetId, clipId: 'other-species', frame: 21 }, 0), null);
});

for (const [phase, clipId, offset, fps] of [
  ['sealed', 'sealed', 0, 6], ['opening', 'opening', 8, 8],
  ['hatch', 'hatch', 16, 10], ['destroyed', 'destroyed', 24, 10]
]) {
  test(`Ovomorph ${phase}: les8poses proviennent de l horloge du cycle meme sans rendu precedent`, () => {
    const sheet = requireSheet(eggContract.profileId);
    const enemy = { id: 'egg-clock', visualSheetId: sheet.id, alive: phase !== 'destroyed',
      deathClock: 2.8, ovomorphCycleV66: { phase, elapsed: 0, spawned: phase === 'hatch' } };
    const frames = [];
    for (let index = 0; index < 8; index += 1) {
      enemy.ovomorphCycleV66.elapsed = (index + 0.01) / fps;
      const request = resolveEnemyAnimation(enemy);
      assert.equal(request.frame, offset + index);
      const controller = new SpriteAnimationController();
      const sample = controller.sample(enemy.id, request, 65536, { reducedMotion: true });
      assertCell(sample, sheet.id, clipId, offset + index);
      frames.push(sample.frame);
    }
    assert.deepEqual(frames, Array.from({ length: 8 }, (_, index) => offset + index));
  });
}

test('Ovomorph spent: la derniere pose hatch23 reste verrouillee sans reouverture graphique', () => {
  const sheet = requireSheet(eggContract.profileId);
  const enemy = { id: 'egg-spent', visualSheetId: sheet.id, alive: true,
    ovomorphCycleV66: { phase: 'spent', elapsed: 0.8, spawned: true } };
  const controller = new SpriteAnimationController();
  for (const time of [0, 1, 100, 1e6, 0]) {
    assertCell(controller.sample(enemy.id, resolveEnemyAnimation(enemy), time), sheet.id, 'hatch', 23);
  }
});

test('Ovomorph mort avant update: deathClock du vrai moteur pilote destroyed et jamais hatch', () => {
  const sheet = requireSheet(eggContract.profileId);
  const enemy = { id: 'egg-death-clock', visualSheetId: sheet.id, alive: false, deathClock: 2.8,
    ovomorphCycleV66: { phase: 'hatch', elapsed: 0.4, spawned: false } };
  for (let index = 0; index < 8; index += 1) {
    enemy.deathClock = 2.8 - (index + 0.01) / 10;
    assertCell(new SpriteAnimationController().sample(enemy.id, resolveEnemyAnimation(enemy), 300), sheet.id, 'destroyed', 24 + index);
  }
});

test('Ovomorph cycle reel: opening puis hatch libere un acteur V65 distinct et spent reste stable', () => {
  const { engine, enemy, events } = fixture(eggContract.profileId);
  const controller = new SpriteAnimationController();
  const draw = (clipId, frame) => assertCell(controller.sample(enemy.id, resolveEnemyAnimation(enemy), 5000), enemy.visualSheetId, clipId, frame);
  engine.player.x = 2000;
  updateOvomorphCycleV66(engine, enemy, 0.5);
  draw('sealed', 3);
  engine.player.x = 760;
  updateOvomorphCycleV66(engine, enemy, 0);
  draw('opening', 8);
  updateOvomorphCycleV66(engine, enemy, 0.875);
  draw('opening', 15);
  updateOvomorphCycleV66(engine, enemy, 0.125);
  draw('hatch', 16);
  updateOvomorphCycleV66(engine, enemy, 0.4);
  draw('hatch', 20);
  assert.equal(engine.enemies.length, 1);
  updateOvomorphCycleV66(engine, enemy, 0.1);
  draw('hatch', 21);
  assert.equal(engine.enemies.length, 2);
  const child = engine.enemies.find((entry) => entry !== enemy);
  assert.equal(child.id, getOvomorphChildIdV66(enemy));
  assert.equal(child.visualSheetId, eggContract.childSheetId);
  assert.notEqual(resolveEnemyAnimation(child).sheetId, enemy.visualSheetId);
  updateOvomorphCycleV66(engine, enemy, 0.3);
  draw('hatch', 23);
  for (let index = 0; index < 10; index += 1) updateOvomorphCycleV66(engine, enemy, 1);
  draw('hatch', 23);
  assert.equal(enemy.ovomorphCycleV66.phase, 'spent');
  assert.equal(engine.enemies.length, 2);
  assert.equal(events.filter((event) => event.type === 'ovomorph-hatched').length, 1);
});

for (const transition of ['ladder', 'surface-height']) {
  test(`Level ${transition}: annulation AVANT super combat a l instant precis de l impact`, () => {
    class CombatBase {
      updateEnemy(enemy, delta) {
        this.baseCombatCalls += 1;
        return updateEnemyBatchCombatV66(this, enemy, delta);
      }
    }
    const Level = withV52LevelRuntime(CombatBase);
    const engine = Object.create(Level.prototype);
    const events = [];
    const enemy = { id: 'drone-navigation', visualSheetId: sheetIdFor('enemy-004-drone-big-chap'),
      x: 600, y: 806, w: 46, h: 124, speed: 80, spawnX: 600, alive: true,
      alert: true, facing: 1, damage: 12, attackClock: 0,
      levelNavigation: { mode: 'surface', surfaceId: 'floor', lastSafeX: 600, lastSafeY: 806 } };
    Object.assign(engine, {
      baseCombatCalls: 0, navigationCalls: 0, missionLevelRuntime: {},
      missionVentNetworkV62: { id: 'test-vents' }, missionLevelBounds: { width: 6200, height: 1080 },
      player: actor(680), coopEnabled: false, walls: [], covers: [], doors: [], animationTime: 0,
      activeSquadActors: () => [], enemyMeleePathClearV64: () => true,
      resolveEnemyHorizontal: () => {},
      damagePlayer(target, damage) { target.health -= damage; },
      onEvent(event) { events.push(event); },
      missionLevelSurfaceFor(entity) { return entity ? { id: 'floor', y: entity.y + entity.h } : null; },
      missionLevelSurfaceNear: () => null,
      advanceEnemyMissionNavigation() { this.navigationCalls += 1; }
    });
    updateEnemyBatchCombatV66(engine, enemy, 0);
    assert.equal(enemy.batchAttackV66.targetId, 'player');
    if (transition === 'ladder') enemy.levelNavigation.mode = 'ladder';
    else engine.player.y -= 64;
    engine.updateEnemy(enemy, 5 / 12);
    assert.equal(engine.baseCombatCalls, 0, 'ne pas avancer un combat condamne par la navigation');
    assert.equal(engine.player.health, 100, 'aucun impact ne peut preceder l annulation');
    assert.equal(enemy.batchAttackV66, null);
    assert.equal(engine.navigationCalls, 1);
    assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 0);
    assert.equal(events.filter((event) => event.type === 'enemy-attack-cancelled' && event.reason === 'navigation-transition').length, 1);
  });
}
