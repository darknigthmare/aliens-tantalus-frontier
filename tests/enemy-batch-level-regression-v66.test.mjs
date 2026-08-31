import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine as MissionLevelEngine } from '../src/game-production-runtime.js';
import { ENEMY_BATCH_COMBAT_CONTRACTS_V66 } from '../src/enemy-batch-combat-v66.js';

// Exercise the shipped MissionV52(LevelV52(ProductionCore)) chain, including
// target resolution, physical collisions, support and connector navigation.
// Only peripheral event delivery and damage accounting are captured here.
const actor = (x, extra = {}) => ({
  x, y: 838, w: 42, h: 92, alive: true, downed: false, lost: false,
  inVehicle: false, health: 100, ...extra
});

function fixture(profileId = 'enemy-004-drone-big-chap') {
  const contract = ENEMY_BATCH_COMBAT_CONTRACTS_V66[profileId];
  const runner = profileId === 'enemy-006-runner';
  const enemy = {
    id: `${profileId}:level-regression`, visualSheetId: contract.sheetId,
    name: runner ? 'Runner' : 'Drone', behavior: runner ? 'pouncer' : 'stalker',
    x: 600, y: runner ? 860 : 806, w: runner ? 70 : 46, h: runner ? 70 : 124,
    speed: 100, spawnX: 600, groundY: 930, alive: true, captured: false,
    alert: true, facing: 1, damage: 12, health: 100, maxHealth: 100,
    attackClock: 0, rangedClock: 0, staggerClock: 0, hurtClock: 0,
    v52HurtClock: 0, revealed: 0, jammedClock: 0, deathClock: 0,
    levelNavigation: { mode: 'surface', surfaceId: 'floor', connectorId: null,
      destinationY: null, riding: false, lastSafeX: 600, lastSafeY: runner ? 860 : 806 }
  };
  const events = [];
  const damage = [];
  const engine = Object.create(MissionLevelEngine.prototype);
  Object.assign(engine, {
    missionLevelRuntime: {}, missionVentNetworkV62: { id: 'regression-vents' },
    missionLevelBounds: { width: 6200, height: 1080 }, animationTime: 0,
    enemies: [enemy], player: actor(680), coop: actor(2000, { coop: true, operatorId: 'coop-role' }),
    coopEnabled: false, squadActors: [], walls: [], covers: [], doors: [], ladders: [], lifts: [],
    stealthRuntime: { detectionRadius: 900, spottedBy: new Set(), visibility: 100, noise: 0 },
    platforms: [{ id: 'floor', x: 0, y: 930, w: 6200, h: 40 }],
    onEvent(event) { events.push(event); },
    damagePlayer(target, amount) { target.health -= amount; damage.push({ target, amount, x: enemy.x }); },
    damageSquadMember(target, amount) { target.health -= amount; damage.push({ target, amount, x: enemy.x }); },
    damageVehicle(amount) { this.vehicle.hull -= amount; damage.push({ target: this.vehicle, amount, x: enemy.x }); }
  });
  const step = (delta) => {
    engine.animationTime += delta;
    engine.updateEnemy(enemy, delta);
  };
  const arm = (targetId = 'player') => {
    step(0);
    assert.equal(enemy.batchAttackV66?.targetId, targetId, 'attaque armee par les vrais wrappers');
  };
  return { engine, enemy, events, damage, step, arm };
}

for (const mode of ['ladder', 'lift']) {
  test(`navigation ${mode}: aucun impact avant annulation dans le vrai flux V52`, () => {
    const { engine, enemy, events, damage, step, arm } = fixture();
    arm();
    enemy.levelNavigation.mode = mode;
    enemy.levelNavigation.connectorId = 'connector';
    enemy.levelNavigation.destinationY = 866;
    engine.ladders = [{ id: 'connector', x: 630, top: 866, bottom: 930 }];
    engine.lifts = [{ id: 'connector', x: 590, y: 930, w: 100, topY: 866, baseY: 930 }];
    step(5 / 12);
    assert.equal(engine.player.health, 100);
    assert.equal(damage.length, 0);
    assert.equal(enemy.batchAttackV66, null);
    assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 0);
    assert.equal(events.filter((event) => event.type === 'enemy-attack-cancelled' && event.reason === 'navigation-transition').length, 1);
  });
}

for (const mode of ['ladder', 'lift', 'upstairs-target']) {
  test(`production avec PNJ le plus proche: ${mode} annule avant l impact, sans contourner Level`, () => {
    const { engine, enemy, events, damage, step, arm } = fixture();
    engine.player.x = 1200;
    const squad = actor(680, { squadMember: true, crewId: 'escort', name: 'Escort' });
    engine.squadActors = [squad];
    arm('squad:escort');
    engine.platforms.push({ id: 'upper', x: 660, y: 866, w: 500, h: 20 });
    engine.ladders = [{ id: 'connector', x: 630, top: 866, bottom: 930 }];
    engine.lifts = [{ id: 'connector', x: 590, y: 930, w: 100, topY: 866, baseY: 930 }];
    if (mode === 'upstairs-target') squad.y -= 64;
    else Object.assign(enemy.levelNavigation, { mode, connectorId: 'connector', destinationY: 866 });
    step(5 / 12);
    assert.equal(squad.health, 100);
    assert.equal(engine.player.health, 100);
    assert.equal(damage.length, 0);
    assert.equal(enemy.batchAttackV66, null);
    assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 0);
    assert.equal(events.filter((event) => event.type === 'enemy-attack-cancelled' && event.reason === 'navigation-transition').length, 1);
  });
}

test('production Runner contre PNJ: le vide entre deux plateformes interrompt le bond avant tout degat', () => {
  const { engine, enemy, events, damage, step, arm } = fixture('enemy-006-runner');
  engine.player.x = 1400;
  const squad = actor(760, { squadMember: true, crewId: 'across-gap' });
  engine.squadActors = [squad];
  engine.platforms = [
    { id: 'left', x: 0, y: 930, w: 680, h: 40 },
    { id: 'right', x: 760, y: 930, w: 1000, h: 40 }
  ];
  enemy.levelNavigation.surfaceId = 'left';
  arm('squad:across-gap');
  step(5 / 12);
  assert.equal(squad.health, 100);
  assert.equal(damage.length, 0);
  assert.equal(enemy.batchAttackV66, null);
  assert.ok(engine.missionLevelSurfaceFor(enemy, { tolerance: 40 }));
  assert.ok(enemy.x + enemy.w / 2 <= 682);
  assert.ok(events.some((event) => event.type === 'enemy-attack-cancelled' && event.reason === 'collision-blocked'));
  assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 0);
});

test('changement d etage64px a5/12: la navigation annule avant la melee pourtant encore a portee verticale', () => {
  const { engine, enemy, events, damage, step, arm } = fixture();
  arm();
  engine.player.y -= 64;
  engine.platforms.push({ id: 'upper', x: 660, y: 866, w: 500, h: 20 });
  engine.ladders = [{ id: 'ladder-up', x: 640, top: 866, bottom: 930 }];
  step(5 / 12);
  assert.equal(engine.player.health, 100);
  assert.equal(damage.length, 0);
  assert.equal(enemy.batchAttackV66, null);
  assert.ok(events.some((event) => event.type === 'enemy-attack-cancelled' && event.reason === 'navigation-transition'));
});

for (const leaderState of ['dead', 'in-vent', 'upstairs', 'closer-decoy']) {
  test(`cible escouade verrouillee: chef ${leaderState} ne detourne pas le combat ou la navigation`, () => {
    const { engine, enemy, damage, step, arm } = fixture();
    engine.player.x = 1200;
    const squad = actor(680, { squadMember: true, crewId: 'escort', name: 'Escort' });
    engine.squadActors = [squad];
    arm('squad:escort');
    if (leaderState === 'dead') engine.player.alive = false;
    if (leaderState === 'in-vent') engine.player.ventTransit = { networkId: 'regression-vents' };
    if (leaderState === 'upstairs') {
      engine.player.y -= 120;
      engine.platforms.push({ id: 'upper', x: 1000, y: 810, w: 500, h: 20 });
    }
    if (leaderState === 'closer-decoy') engine.player.x = 650;
    assert.equal(engine.missionLevelEnemyTarget(enemy), squad, 'Level conserve la cible de combat verrouillee');
    step(5 / 12);
    assert.equal(squad.health, 88);
    assert.equal(engine.player.health, 100);
    assert.equal(damage.length, 1);
    assert.equal(damage[0].target, squad);
    assert.equal(enemy.levelNavigation.mode, 'surface');
  });
}

test('coop verrouille: un PNJ plus proche et le joueur en conduit ne remplacent pas sa cible', () => {
  const { engine, enemy, damage, step, arm } = fixture();
  engine.player.x = 1400;
  engine.coopEnabled = true;
  engine.coop.x = 680;
  arm('coop');
  engine.player.ventTransit = { networkId: 'regression-vents' };
  const squad = actor(650, { squadMember: true, crewId: 'escort' });
  engine.squadActors = [squad];
  assert.equal(engine.missionLevelEnemyTarget(enemy), engine.coop);
  const originalPlayer = engine.player;
  step(5 / 12);
  assert.equal(engine.player, originalPlayer, 'le wrapper restaure la reference du joueur');
  assert.equal(engine.coop.health, 88);
  assert.equal(squad.health, 100);
  assert.equal(damage.length, 1);
  assert.equal(damage[0].target, engine.coop);
});

test('cible PNJ invalidee: annule le verrou sans transferer le coup a un autre membre', () => {
  const { engine, enemy, damage, step, arm } = fixture();
  engine.player.x = 1200;
  const locked = actor(680, { squadMember: true, crewId: 'locked' });
  const other = actor(750, { squadMember: true, crewId: 'other' });
  engine.squadActors = [locked, other];
  arm('squad:locked');
  locked.ventTransit = { networkId: 'regression-vents' };
  other.x = 680;
  assert.equal(engine.missionLevelEnemyTarget(enemy), null);
  step(5 / 12);
  assert.equal(enemy.batchAttackV66, null);
  assert.equal(other.health, 100);
  assert.equal(damage.length, 0);
});

test('Runner au bord du vide: chaque sous-pas valide son support avant tout impact', () => {
  const { engine, enemy, events, damage, step, arm } = fixture('enemy-006-runner');
  engine.player.x = 760;
  engine.platforms = [
    { id: 'left', x: 0, y: 930, w: 680, h: 40 },
    { id: 'right', x: 760, y: 930, w: 1000, h: 40 }
  ];
  enemy.levelNavigation.surfaceId = 'left';
  arm();
  step(5 / 12);
  assert.equal(damage.length, 0, 'aucun degat a x692 avant un rollback a x600');
  assert.equal(engine.player.health, 100);
  assert.equal(enemy.batchAttackV66, null);
  assert.ok(engine.missionLevelSurfaceFor(enemy, { tolerance: 40 }));
  assert.ok(enemy.x + enemy.w / 2 <= 682);
  assert.ok(events.some((event) => event.type === 'enemy-attack-cancelled' && event.reason === 'collision-blocked'));
  assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 0);
});

test('Runner limite du monde: un bond ne frappe jamais depuis une position hors limites', () => {
  const { engine, enemy, damage, step, arm } = fixture('enemy-006-runner');
  engine.missionLevelBounds.width = 730;
  engine.player.x = 740;
  arm();
  step(5 / 12);
  assert.equal(damage.length, 0);
  assert.equal(enemy.batchAttackV66, null);
  assert.ok(enemy.x >= 0 && enemy.x + enemy.w <= 730);
});

for (const scenario of ['ladder', 'upstairs-target', 'no-target']) {
  test(`ennemi mort ${scenario}: aucun deplacement ni navigation ni impact residuel`, () => {
    const { engine, enemy, events, damage, step, arm } = fixture();
    arm();
    enemy.alive = false;
    enemy.health = 0;
    enemy.deathClock = 2.8;
    const original = { x: enemy.x, y: enemy.y };
    if (scenario === 'ladder') {
      enemy.levelNavigation.mode = 'ladder';
      enemy.levelNavigation.connectorId = 'ladder-up';
      enemy.levelNavigation.destinationY = 866;
      engine.ladders = [{ id: 'ladder-up', x: 660, top: 866, bottom: 930 }];
    }
    if (scenario === 'upstairs-target') {
      engine.player.y -= 64;
      engine.platforms.push({ id: 'upper', x: 660, y: 866, w: 500, h: 20 });
      engine.ladders = [{ id: 'ladder-up', x: 660, top: 866, bottom: 930 }];
    }
    if (scenario === 'no-target') engine.player.ventTransit = { networkId: 'regression-vents' };
    step(5 / 12);
    step(1);
    assert.deepEqual({ x: enemy.x, y: enemy.y }, original);
    assert.equal(enemy.vx, 0);
    assert.equal(enemy.attacking, false);
    assert.equal(enemy.batchAttackV66, null);
    assert.equal(damage.length, 0);
    assert.equal(events.filter((event) => event.type === 'enemy-attack-cancelled' && event.reason === 'enemy-dead').length, 1);
  });
}
