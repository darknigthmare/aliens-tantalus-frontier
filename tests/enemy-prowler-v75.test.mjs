import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ENEMIES } from '../src/content-core-v50.js';
import { GameEngine } from '../src/game-v51-runtime.js';
import {
  ENEMY_BATCH_COMBAT_CONTRACTS_V66,
  captureEnemyBatchCombatResumeV66,
  getEnemyBatchAttackFrameV66,
  restoreEnemyBatchCombatResumeV66,
  updateEnemyBatchCombatV66
} from '../src/enemy-batch-combat-v66.js';
import { resolveEnemyProfileVisualV66 } from '../src/enemy-profile-registry-v66.js';
import {
  SPRITE_HITBOXES,
  SpriteAnimationController,
  resolveEnemyAnimation,
  resolveSpriteClip,
  resolveSpriteSheet,
  shouldFlipSprite
} from '../src/sprite-animation-runtime.js';

const PROFILE_ID = 'enemy-015-prowler';
const SHEET_ID = `enemy.profile.${PROFILE_ID}.v66`;
const ATLAS_SHA = '5462eb30975dcdf83b29e02bf5aff8e65de5fbe92aecb0958c09af1e887e6b52';
const contract = ENEMY_BATCH_COMBAT_CONTRACTS_V66[PROFILE_ID];
const near = (actual, expected, message) => assert.ok(Math.abs(actual - expected) < 1e-6, message || `${actual} != ${expected}`);

function fixture({ facing = 1, vehicle = false } = {}) {
  const events = [], damage = [];
  const player = { id: 'player', x: facing > 0 ? 799 : 655, y: 838, w: 42, h: 92,
    alive: true, downed: false, lost: false, health: 100, inVehicle: vehicle };
  const engine = {
    random: () => 0.5, animationTime: 0, player, coop: null, coopEnabled: false,
    squadActors: [], enemies: [], walls: [], doors: [], covers: [], platforms: [],
    missionLevelBounds: { width: 6200, height: 1080 }, missionLevelRuntime: null,
    vehicle: vehicle ? { id: 'apc', x: facing > 0 ? 800 : 610, y: 826, w: 190, h: 104, active: true, destroyed: false } : null,
    activeSquadActors() { return this.squadActors; },
    closedDoorColliders: GameEngine.prototype.closedDoorColliders,
    getDoorRenderState(door) { return door; },
    enemyMeleePathClearV64: GameEngine.prototype.enemyMeleePathClearV64,
    resolveHorizontal: GameEngine.prototype.resolveHorizontal,
    resolveEnemyHorizontal: GameEngine.prototype.resolveEnemyHorizontal,
    createEnemy: GameEngine.prototype.createEnemy,
    damagePlayer(target, amount) { damage.push({ target, amount }); target.health -= amount; },
    damageSquadMember(target, amount) { damage.push({ target, amount }); target.health -= amount; },
    damageVehicle(amount) { damage.push({ target: this.vehicle, amount }); this.vehicle.hull = (this.vehicle.hull || 340) - amount; },
    onEvent(event) { events.push(event); }
  };
  const source = ENEMIES.find((entry) => entry.id === PROFILE_ID);
  const enemy = engine.createEnemy(source, 0, facing > 0 ? 600 : 800, 930);
  enemy.alert = true;
  enemy.attackClock = 0;
  engine.enemies.push(enemy);
  return { engine, enemy, player, events, damage, step: (delta) => updateEnemyBatchCombatV66(engine, enemy, delta) };
}

test('015: les octets revus, les32poses et les corrections interclip restent liés aux preuves V75', () => {
  const metadata = JSON.parse(readFileSync(new URL('../assets/openai/sprites/metadata/v66/enemy-015-prowler.json', import.meta.url)));
  const atlas = readFileSync(new URL(`..${resolveSpriteSheet(SHEET_ID).path}`, import.meta.url));
  assert.equal(createHash('sha256').update(atlas).digest('hex'), ATLAS_SHA);
  assert.equal(metadata.normalizedSha256, ATLAS_SHA);
  assert.equal(metadata.frameCount, 32);
  assert.equal(metadata.validation.uniqueFrameCount, 32);
  assert.deepEqual(metadata.validation.findings, []);
  assert.deepEqual(metadata.sourceScaleByClip, { idle: 1, move: 1.208856, attack: 1.34525, death: 1.194166 });
  assert.equal(metadata.physicalAnchorReview.reviewedPoseCount, 32);
  assert.equal(metadata.postGenerationScaleReview.status, 'reviewed');
  assert.equal(metadata.validation.cells[19].alphaBounds[3] < 240, true, 'pose4 garde son envol lisible');
  assert.equal(metadata.validation.cells[20].alphaBounds[3] < 240, true, 'pose5 garde son envol lisible');
});

test('015: identité, taille, pivot, sens et contrat de pounce sont dédiés au Prowler', () => {
  const visual = resolveEnemyProfileVisualV66({ id: PROFILE_ID });
  const sheet = resolveSpriteSheet(SHEET_ID);
  assert.equal(visual.sheetId, SHEET_ID);
  assert.equal(visual.canonExact, false);
  assert.equal(sheet.renderWidth, 352);
  assert.equal(sheet.renderHeight, 352);
  const body = SPRITE_HITBOXES[sheet.hitbox];
  near(body.width * sheet.renderWidth / 256, 96);
  near(body.height * sheet.renderHeight / 256, 88);
  near(body.x + body.width / 2, 128);
  near(body.y + body.height, 240);
  assert.equal(shouldFlipSprite(SHEET_ID, 1), false);
  assert.equal(shouldFlipSprite(SHEET_ID, -1), true);
  assert.deepEqual({ stop: contract.stopRange, hit: contract.meleeRange, lunge: contract.lungeDistance,
    windup: contract.windup, impact: contract.impact, duration: contract.duration, cooldown: contract.cooldown },
    { stop: 72, hit: 76, lunge: 100, windup: 2 / 12, impact: 4 / 12, duration: 8 / 12, cooldown: 1.4 });
  assert.equal(resolveEnemyProfileVisualV66({ id: 'enemy-999-false', name: 'Prowler' }), null);
});

for (const facing of [1, -1]) {
  test(`015 direction ${facing}: anticipation, pounce balayé et morsure unique sur la pose5`, () => {
    const { enemy, player, damage, events, step } = fixture({ facing });
    const origin = enemy.x;
    step(0);
    assert.equal(enemy.batchAttackV66.facing, facing);
    step(contract.windup);
    near(enemy.x, origin, 'aucun glissement pendant l anticipation');
    assert.equal(damage.length, 0);
    step(contract.impact - contract.windup);
    near(enemy.x - origin, facing * 100);
    assert.equal(getEnemyBatchAttackFrameV66(enemy), 4);
    assert.equal(resolveEnemyAnimation(enemy).frame, 20);
    assert.equal(damage.length, 1);
    assert.equal(damage[0].target, player);
    step(contract.duration - contract.impact);
    assert.equal(enemy.batchAttackV66, null);
    assert.equal(damage.length, 1);
    assert.equal(events.filter((entry) => entry.type === 'enemy-attack-impact').length, 1);
  });
}

test('015: mur, porte et couverture apparus pendant l’anticipation annulent sans dégât', () => {
  for (const kind of ['wall', 'door', 'cover']) {
    const { engine, enemy, damage, events, step } = fixture();
    step(0);
    const solid = { id: kind, x: 740, y: 790, w: 12, h: 150 };
    if (kind === 'wall') engine.walls.push(solid);
    if (kind === 'door') engine.doors.push({ ...solid, progress: 0 });
    if (kind === 'cover') engine.covers.push({ ...solid, destroyed: false });
    step(contract.impact);
    assert.equal(damage.length, 0, kind);
    assert.equal(enemy.batchAttackV66, null, kind);
    assert.ok(events.some((entry) => entry.type === 'enemy-attack-cancelled'), kind);
  }
});

test('015: la distance véhicule est mesurée à la coque, sans pénétration ni double dégât', () => {
  const { enemy, engine, damage, step } = fixture({ vehicle: true });
  step(0);
  assert.ok(enemy.batchAttackV66, 'la surface de coque est dans la portée pounce');
  step(contract.impact);
  assert.equal(damage.length, 1);
  assert.equal(damage[0].target, engine.vehicle);
  assert.equal(engine.player.health, 100);
  assert.ok(enemy.x + enemy.w <= engine.vehicle.x);
});

test('015: reprise d’une attaque interrompue conserve un cooldown et ne rejoue aucun impact', () => {
  const first = fixture();
  first.step(0);
  const saved = captureEnemyBatchCombatResumeV66(first.enemy);
  assert.equal(saved.batchAttackActiveV66, true);
  const resumed = fixture();
  restoreEnemyBatchCombatResumeV66(resumed.enemy, saved);
  assert.equal(resumed.enemy.batchAttackV66, null);
  assert.ok(resumed.enemy.attackClock >= contract.duration);
  resumed.step(contract.impact);
  assert.equal(resumed.damage.length, 0);
});

test('015: les attaques et la mort utilisent uniquement les cellules de la plaque Prowler', () => {
  const { enemy } = fixture();
  const controller = new SpriteAnimationController();
  for (let index = 0; index < 8; index += 1) {
    enemy.batchAttackV66 = { elapsed: (index + 0.01) / 12 };
    enemy.attacking = true;
    const sample = controller.sample(enemy.id, resolveEnemyAnimation(enemy), 1000);
    assert.equal(sample.sheet.id, SHEET_ID);
    assert.equal(sample.clip.id, 'attack');
    assert.equal(sample.frame, 16 + index);
  }
  enemy.batchAttackV66 = null;
  enemy.attacking = false;
  enemy.alive = false;
  const death = resolveSpriteClip(SHEET_ID, 'death');
  assert.deepEqual(death.frames, [24, 25, 26, 27, 28, 29, 30, 31]);
  for (let index = 0; index < 8; index += 1) {
    enemy.deathClock = 2.8 - (index + 0.01) / 10;
    const sample = new SpriteAnimationController().sample(enemy.id, resolveEnemyAnimation(enemy), 2000);
    assert.equal(sample.sheet.id, SHEET_ID);
    assert.equal(sample.frame, 24 + index);
  }
  enemy.deathClock = 0;
  assert.equal(resolveEnemyAnimation(enemy).frame, 31);
});
