import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-v51-runtime.js';
import {
  ENEMY_BATCH_COMBAT_CONTRACTS_V66 as contracts,
  resolveEnemyBatchCombatContractV66,
  isEnemyBatchCombatV66,
  getEnemyBatchAttackFrameV66,
  moveEnemyBatchHorizontallyV66,
  cancelEnemyBatchAttackV66,
  updateEnemyBatchCombatV66,
  captureEnemyBatchCombatResumeV66,
  restoreEnemyBatchCombatResumeV66
} from '../src/enemy-batch-combat-v66.js';

const profileIds = Object.keys(contracts);
const runnerId = 'enemy-006-runner';
const actor = (x, extra = {}) => ({
  x, y: 838, w: 42, h: 92, alive: true, downed: false, lost: false,
  inVehicle: false, ventTransit: null, health: 100, ...extra
});

function fixture(profileId = runnerId) {
  const entry = contracts[profileId];
  const events = [];
  const motions = [];
  const enemy = {
    id: `${profileId}:fixture`, name: profileId, visualSheetId: entry.sheetId,
    behavior: profileId === runnerId ? 'pouncer' : 'stalker',
    x: 600, y: 870, w: 44, h: 60, spawnX: 600, speed: 100,
    alive: true, captured: false, alert: true, facing: 1, damage: 12,
    attackClock: 0, rangedClock: 0, staggerClock: 0, hurtClock: 0,
    v52HurtClock: 0, jammedClock: 0, revealed: 0
  };
  const engine = {
    player: actor(600 + (entry.lungeDistance ? 140 : entry.meleeRange - 12)),
    coop: actor(1600, { coop: true }), coopEnabled: false,
    squadActors: [], covers: [], walls: [], doors: [], animationTime: 0,
    activeSquadActors() { return this.squadActors; },
    onEvent(event) { events.push(event); },
    enemyMeleePathClearV64() { return true; },
    resolveEnemyHorizontal(entity, previousX) { motions.push(entity.x - previousX); },
    damagePlayer(target, damage) { target.health -= damage; },
    damageSquadMember(target, damage) { target.health -= damage; },
    damageVehicle(damage) { this.vehicle.health -= damage; }
  };
  const step = (delta) => {
    engine.animationTime += Number.isFinite(delta) ? delta : 0;
    return updateEnemyBatchCombatV66(engine, enemy, delta);
  };
  return { entry, enemy, engine, events, motions, step };
}

test('V66 prend en charge les six combattants acceptés, pas les variantes non revues, oeufs ou anciens sprites', () => {
  assert.deepEqual([...profileIds].sort(), ['enemy-003-chestburster', 'enemy-004-drone-big-chap', 'enemy-005-warrior', 'enemy-006-runner', 'enemy-020-k-series-yellow-xenomorph', 'enemy-055-albino-chestburster']);
  for (const entry of Object.values(contracts)) {
    assert.equal(resolveEnemyBatchCombatContractV66({ visualSheetId: entry.sheetId }), entry);
    assert.equal(Object.isFrozen(entry), true);
  }
  for (const visualSheetId of [undefined, '__proto__', 'constructor', 'enemy.ovomorph.cycle',
    'enemy.profile.enemy-001-ovomorph.v66', 'enemy.profile.enemy-002-facehugger.v65',
    'enemy.profile.enemy-058-albino-runner.v66', 'enemy.xenomorph-runner.action']) {
    const enemy = { visualSheetId, attackClock: 0, alive: true };
    const original = structuredClone(enemy);
    assert.equal(isEnemyBatchCombatV66(enemy), false);
    assert.equal(updateEnemyBatchCombatV66({}, enemy, 0.1), false);
    assert.equal(cancelEnemyBatchAttackV66({}, enemy), false);
    assert.equal(getEnemyBatchAttackFrameV66(enemy), null);
    assert.deepEqual(captureEnemyBatchCombatResumeV66(enemy), {});
    assert.equal(restoreEnemyBatchCombatResumeV66(enemy, { batchAttackActiveV66: true }), false);
    assert.deepEqual(enemy, original);
  }
});

for (const profileId of profileIds) {
  test(`${profileId}: huit poses, impact unique au timing du clip et recuperation jusqu'a 8/12s`, () => {
    const { entry, enemy, engine, events, motions, step } = fixture(profileId);
    assert.equal(step(0), true);
    assert.equal(enemy.batchAttackV66.targetId, 'player');
    assert.equal(enemy.x, 600, 'armer une attaque ne teleporte personne');
    assert.equal(enemy.attackAnimationClock, 8 / 12);
    const frames = [getEnemyBatchAttackFrameV66(enemy)];
    for (let tick = 1; tick <= 40; tick += 1) {
      step(1 / 60);
      if (tick <= 10) assert.equal(enemy.x, 600, 'anticipation immobile');
      if (tick < Math.round(entry.impact * 60)) assert.equal(engine.player.health, 100, 'aucun impact anticipe');
      else assert.equal(engine.player.health, 88, 'exactement un impact');
      if (tick < 40) {
        assert.equal(enemy.attacking, true);
        frames.push(getEnemyBatchAttackFrameV66(enemy));
      }
    }
    assert.deepEqual([...new Set(frames)], [0, 1, 2, 3, 4, 5, 6, 7]);
    assert.equal(enemy.attacking, false);
    assert.equal(enemy.batchAttackV66, null);
    assert.equal(enemy.attackAnimationClock, 0);
    assert.equal(enemy.attackWindupClock, 0);
    assert.ok(Math.abs(enemy.x - 600 - entry.lungeDistance) < 1e-8);
    assert.equal(enemy.y, 870, 'le bond artistique ne teleporte pas sur une autre plateforme');
    assert.ok(motions.every((distance) => Math.abs(distance) <= 8));
    assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 1);
    assert.ok(enemy.attackClock > 0);
  });

  test(`${profileId}: un grand delta ne repete pas l'impact et les melee restent sans lunge`, () => {
    const { entry, enemy, engine, events, step } = fixture(profileId);
    step(0);
    step(5);
    assert.equal(engine.player.health, 88);
    assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 1);
    assert.equal(enemy.batchAttackV66, null);
    assert.ok(Math.abs(enemy.x - 600 - entry.lungeDistance) < 1e-8);
  });
}

test('la cible joueur verrouillee ne devient pas le coop meme si ce dernier se rapproche', () => {
  const { entry, enemy, engine, step } = fixture();
  engine.coopEnabled = true;
  step(0);
  engine.coop.x = 680;
  step(entry.impact);
  assert.equal(enemy.batchAttackV66.targetId, 'player');
  assert.equal(engine.player.health, 88);
  assert.equal(engine.coop.health, 100);
});

test('la cible escouade verrouillee survit a un changement de branche joueur et ne devient pas un autre PNJ', () => {
  const { entry, enemy, engine, events, step } = fixture();
  engine.player.x = 1600;
  const locked = actor(740, { squadMember: true, crewId: 'locked' });
  const decoy = actor(1800, { squadMember: true, crewId: 'decoy' });
  engine.squadActors = [locked, decoy];
  step(0);
  assert.equal(enemy.batchAttackV66.targetId, 'squad:locked');
  engine.player.x = 650;
  decoy.x = 660;
  step(entry.impact);
  assert.equal(locked.health, 88);
  assert.equal(decoy.health, 100);
  assert.equal(engine.player.health, 100);
  assert.ok(events.some((event) => event.type === 'enemy-attack-impact' && event.targetId === 'squad:locked'));
});

test('le coop est une cible distincte et la desactivation coop annule son attaque', () => {
  const { entry, enemy, engine, events, step } = fixture();
  engine.player.x = 1600;
  engine.coopEnabled = true;
  engine.coop.x = 740;
  step(0);
  assert.equal(enemy.batchAttackV66.targetId, 'coop');
  engine.coopEnabled = false;
  step(entry.impact);
  assert.equal(engine.coop.health, 100);
  assert.equal(enemy.batchAttackV66, null);
  assert.ok(events.some((event) => event.reason === 'target-invalid'));
});

for (const [label, change, reason] of [
  ['cible morte', (engine) => { engine.player.alive = false; }, 'target-invalid'],
  ['cible a terre', (engine) => { engine.player.downed = true; }, 'target-invalid'],
  ['cible perdue', (engine) => { engine.player.lost = true; }, 'target-invalid'],
  ['cible en conduit', (engine) => { engine.player.ventTransit = {}; }, 'target-invalid'],
  ['entree vehicule', (engine) => { engine.player.inVehicle = true; }, 'target-invalid'],
  ['cible passee derriere', (engine) => { engine.player.x = 480; }, 'target-crossed'],
  ['cible autre etage', (engine) => { engine.player.y -= 180; }, 'target-out-of-range'],
  ['perte alerte', (_engine, enemy) => { enemy.alert = false; }, 'lost-target'],
  ['ennemi en conduit', (_engine, enemy) => { enemy.ventTransit = {}; }, 'enemy-in-vent'],
  ['ennemi mort', (_engine, enemy) => { enemy.alive = false; }, 'enemy-dead'],
  ['ennemi capture', (_engine, enemy) => { enemy.captured = true; }, 'enemy-captured'],
  ['blessure', (_engine, enemy) => { enemy.hurtClock = 0.001; }, 'staggered'],
  ['blessure V52', (_engine, enemy) => { enemy.v52HurtClock = 0.001; }, 'staggered'],
  ['etourdissement', (_engine, enemy) => { enemy.staggerClock = 0.001; }, 'staggered'],
  ['brouillage', (_engine, enemy) => { enemy.jammedClock = 0.001; }, 'staggered']
]) {
  test(`${label}: annulation avant decroissance des horloges et sans impact fantome`, () => {
    const { enemy, engine, events, step } = fixture();
    step(0);
    change(engine, enemy);
    step(1);
    assert.equal(enemy.batchAttackV66, null);
    assert.equal(enemy.attacking, false);
    assert.equal(enemy.x, 600);
    assert.equal(engine.player.health, 100);
    assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 0);
    assert.ok(events.some((event) => event.type === 'enemy-attack-cancelled' && event.reason === reason));
    assert.equal(cancelEnemyBatchAttackV66(engine, enemy, reason), false, 'annulation idempotente');
  });
}

test('une cible qui sort de la portee pendant l anticipation fait manquer le coup sans armer une deuxieme frappe', () => {
  const { entry, engine, events, step } = fixture('enemy-004-drone-big-chap');
  step(0);
  engine.player.x = 900;
  step(entry.impact);
  engine.player.x = 680;
  step(entry.duration - entry.impact);
  assert.equal(engine.player.health, 100);
  const impacts = events.filter((event) => event.type === 'enemy-attack-impact');
  assert.equal(impacts.length, 1);
  assert.equal(impacts[0].hit, false);
});

test('une porte se fermant pendant le windup annule le coup sans mouvement ni degat', () => {
  const { entry, enemy, engine, events, step } = fixture();
  step(0);
  engine.enemyMeleePathClearV64 = () => false;
  step(entry.impact);
  assert.equal(enemy.x, 600);
  assert.equal(engine.player.health, 100);
  assert.ok(events.some((event) => event.reason === 'path-blocked'));
});

test('la melee stationnaire respecte aussi les couvertures et non seulement le rayon mur/porte historique', () => {
  const { enemy, engine, events, step } = fixture('enemy-004-drone-big-chap');
  engine.covers = [{ x: 660, y: 900, w: 2, h: 30, destroyed: false }];
  step(0);
  assert.equal(enemy.batchAttackV66, undefined);
  assert.equal(events.some((event) => event.type === 'enemy-attack-telegraph'), false);
  engine.covers[0].destroyed = true;
  step(0);
  assert.ok(enemy.batchAttackV66);
});

test('les vrais resolveurs V51 stoppent un bond Runner contre une couverture mince en sous-pas', () => {
  const { enemy, engine, events, motions, step } = fixture();
  engine.closedDoorColliders = () => [];
  engine.resolveHorizontal = GameEngine.prototype.resolveHorizontal;
  engine.resolveEnemyHorizontal = function (entity, previousX) {
    motions.push(entity.x - previousX);
    GameEngine.prototype.resolveEnemyHorizontal.call(this, entity, previousX);
  };
  step(0);
  // Partial body overlap with the path gap is introduced after arming; the
  // first micro-step must hit the actual cover, not tunnel through its 2px.
  engine.covers = [{ x: 642, y: 900, w: 2, h: 30, destroyed: false }];
  step(1);
  assert.ok(enemy.x <= 600);
  assert.ok(motions.length > 0 && motions.every((value) => Math.abs(value) <= 8));
  assert.equal(engine.player.health, 100);
  assert.ok(events.some((event) => event.reason === 'collision-blocked'));
});

test('l approche hors portee est balayee et ne change pas le Chestburster en sauteur', () => {
  const { enemy, engine, motions, step } = fixture('enemy-003-chestburster');
  engine.player.x = 1000;
  step(0.5);
  assert.ok(enemy.x > 600 && enemy.x < 700);
  assert.ok(motions.length > 1 && motions.every((value) => Math.abs(value) <= 8));
  assert.equal(enemy.batchAttackV66, undefined);
  assert.equal(engine.player.health, 100);
  assert.equal(enemy.y, 870);
});

test('le rayon furtif et le brouillage bloquent l armement des la premiere frame', () => {
  const { enemy, engine, step } = fixture();
  enemy.alert = false;
  engine.stealthRuntime = { detectionRadius: 80 };
  step(0);
  assert.equal(enemy.alert, false);
  assert.equal(enemy.batchAttackV66, undefined);
  engine.stealthRuntime.detectionRadius = 200;
  enemy.jammedClock = 0.01;
  step(0);
  assert.equal(enemy.batchAttackV66, undefined);
  enemy.jammedClock = 0;
  step(0);
  assert.equal(enemy.alert, true);
  assert.ok(enemy.batchAttackV66);
});

test('la detection a travers un mur ou hors du rayon ne devient pas omnisciente', () => {
  for (const wall of [false, true]) {
    const { enemy, engine, events, step } = fixture();
    enemy.alert = false;
    if (wall) engine.enemyMeleePathClearV64 = () => false;
    else engine.player.x = 3000;
    step(0.1);
    assert.equal(enemy.alert, false);
    assert.equal(events.some((event) => event.type === 'enemy-attack-telegraph'), false);
  }
});

test('la destruction du vehicule vise sa coque une seule fois, jamais ses occupants en plus', () => {
  const { entry, enemy, engine, step } = fixture();
  engine.vehicle = { ...actor(740), active: true, health: 200 };
  engine.player.inVehicle = true;
  step(0);
  step(entry.impact);
  assert.equal(enemy.batchAttackV66.targetInVehicle, true);
  assert.equal(engine.vehicle.health, 188);
  assert.equal(engine.player.health, 100);
});

test('un delta invalide ne corrompt pas le curseur et un deplacement invalide reste nul', () => {
  const { enemy, engine, step } = fixture();
  step(0);
  for (const delta of [NaN, Infinity, -1, undefined]) {
    step(delta);
    assert.equal(enemy.batchAttackV66.elapsed, 0);
    assert.equal(enemy.x, 600);
  }
  assert.deepEqual(moveEnemyBatchHorizontallyV66(engine, enemy, Infinity), { travelled: 0, blocked: false });
});

test('un vehicule detruit ou desactive pendant le windup ne recoit pas un impact fantome', () => {
  for (const state of [{ active: false }, { destroyed: true }]) {
    const { entry, enemy, engine, events, step } = fixture();
    engine.vehicle = { ...actor(740), active: true, destroyed: false, health: 200 };
    engine.player.inVehicle = true;
    step(0);
    Object.assign(engine.vehicle, state);
    step(entry.impact);
    assert.equal(enemy.batchAttackV66, null);
    assert.equal(engine.vehicle.health, 200);
    assert.equal(engine.player.health, 100);
    assert.ok(events.some((event) => event.reason === 'target-invalid'));
  }
});

for (const profileId of profileIds) {
  test(`${profileId}: reprise JSON d une attaque interrompt la cible et ne rejoue pas la frappe`, () => {
    const original = fixture(profileId);
    original.step(0);
    original.step(0.1);
    const saved = JSON.parse(JSON.stringify(captureEnemyBatchCombatResumeV66(original.enemy)));
    assert.equal(saved.batchAttackActiveV66, true);
    assert.deepEqual(Object.keys(saved).sort(), ['attackClock', 'batchAttackActiveV66']);
    const resumed = fixture(profileId);
    resumed.enemy.batchAttackV66 = structuredClone(original.enemy.batchAttackV66);
    resumed.enemy.attackAnimationClock = 0.4;
    resumed.enemy.attackWindupClock = 0.1;
    resumed.enemy.attacking = true;
    assert.equal(restoreEnemyBatchCombatResumeV66(resumed.enemy, saved), true);
    assert.equal(resumed.enemy.batchAttackV66, null);
    assert.equal(resumed.enemy.attackAnimationClock, 0);
    assert.equal(resumed.enemy.attackWindupClock, 0);
    assert.equal(resumed.enemy.attacking, false);
    assert.ok(resumed.enemy.attackClock >= resumed.entry.duration);
    resumed.step(0.4);
    assert.equal(resumed.engine.player.health, 100);
    assert.equal(resumed.events.some((event) => event.type === 'enemy-attack-impact'), false);
  });
}

test('capture et restauration bornent les cooldowns et tolerent un ancien save sans champs V66', () => {
  const { enemy, entry } = fixture();
  for (const [input, expected] of [[-3, 0], [99, entry.cooldown], [0.3, 0.3], [NaN, 0], [Infinity, 0]]) {
    enemy.attackClock = input;
    assert.equal(captureEnemyBatchCombatResumeV66(enemy).attackClock, expected);
  }
  for (const [source, expected] of [
    [{ attackClock: -4 }, 0], [{ attackClock: 99 }, entry.cooldown],
    [{ attackClock: '0.9' }, 0.9], [{ attackClock: Infinity }, 0.42],
    [{}, 0.42], [{ attackClock: 0, batchAttackActiveV66: true }, entry.duration],
    [{ attackClock: 0, batchAttackActiveV66: 'true' }, 0], [null, 0.42]
  ]) {
    enemy.attackClock = 0.42;
    enemy.batchAttackV66 = { targetId: 'player', impactResolved: false, elapsed: 0.1 };
    enemy.pendingMelee = true;
    enemy.pendingMeleeTargetId = 'player';
    restoreEnemyBatchCombatResumeV66(enemy, source);
    assert.equal(enemy.attackClock, expected);
    assert.equal(enemy.batchAttackV66, null);
    assert.equal(enemy.pendingMelee, false);
    assert.equal(enemy.pendingMeleeTargetId, null);
  }
});
