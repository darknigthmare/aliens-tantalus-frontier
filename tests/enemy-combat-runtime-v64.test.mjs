import assert from 'node:assert/strict';
import test from 'node:test';

import {
  advanceEnemyMeleeAttackV64,
  armEnemyMeleeAttackV64,
  cancelEnemyMeleeAttackV64,
  finishEnemyMeleeAttackV64,
  isEnemyMeleeTargetValidV64,
  resolveEnemyMeleeContractV64,
  resolveEnemyMeleeTargetIdV64
} from '../src/enemy-combat-runtime-v64.js';
import { ENEMIES, ENEMY_HYBRIDS_V64 } from '../src/content-core-v50.js';
import { GameEngine } from '../src/game-v51-runtime.js';
import { withV52MissionRuntime } from '../src/game-v52-runtime.js';
import { resolveEnemyAnimation } from '../src/sprite-animation-runtime.js';

const V52GameEngine = withV52MissionRuntime(GameEngine);

class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
  set src(value) { this.currentSrc = value; }
}

function withBrowserMocks(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try { return run(); } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
}

function createEngine(events) {
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  return new GameEngine(canvas, { onEvent: (event) => events.push(event) });
}

test('les trois attaques V64 partagent un télégraphe avant impact et un cooldown distinct', () => {
  for (const behavior of ['grappler', 'reach-hunter', 'hybrid-boss']) {
    const enemy = { behavior, attackClock: 0, attacking: false, pendingMelee: false };
    const target = { alive: true, downed: false, coop: false };
    const contract = resolveEnemyMeleeContractV64(enemy);
    assert.ok(contract.windup > 0);
    assert.ok(contract.animationDuration > contract.windup);
    assert.equal(armEnemyMeleeAttackV64(enemy, target), contract);
    assert.equal(enemy.pendingMelee, true);
    assert.equal(enemy.pendingMeleeTargetId, 'player');
    assert.equal(advanceEnemyMeleeAttackV64(enemy, contract.windup / 2).impactReady, false);
    assert.equal(advanceEnemyMeleeAttackV64(enemy, contract.windup).impactReady, true);
    assert.equal(finishEnemyMeleeAttackV64(enemy), contract);
    assert.equal(enemy.pendingMelee, false);
    assert.equal(enemy.pendingMeleeTargetId, null);
    assert.equal(enemy.attackClock, contract.cooldown);
    assert.equal(enemy.attacking, true);
  }
});

test('le contrat V64 refuse une cible invalide et annule un windup avec récupération courte', () => {
  const enemy = { behavior: 'grappler', attackClock: 0, attacking: false, pendingMelee: false };
  const target = { alive: true, downed: false, squadMember: true, crewId: 'crew-test' };
  assert.equal(resolveEnemyMeleeTargetIdV64(target), 'squad:crew-test');
  assert.equal(isEnemyMeleeTargetValidV64(target), true);
  assert.ok(armEnemyMeleeAttackV64(enemy, target));
  target.downed = true;
  assert.equal(isEnemyMeleeTargetValidV64(target), false);
  assert.ok(cancelEnemyMeleeAttackV64(enemy));
  assert.equal(enemy.pendingMelee, false);
  assert.equal(enemy.pendingMeleeTargetId, null);
  assert.equal(enemy.attackWindupClock, 0);
  assert.equal(enemy.attacking, false);
  assert.ok(enemy.attackClock > 0);
});

test('un comportement legacy ne reçoit aucun état de combat V64', () => {
  const enemy = { behavior: 'pouncer', attackClock: 0, attacking: false };
  assert.equal(resolveEnemyMeleeContractV64(enemy), null);
  assert.equal(armEnemyMeleeAttackV64(enemy), null);
  assert.deepEqual(advanceEnemyMeleeAttackV64(enemy, 1), { contract: null, impactReady: false });
});

test('le GameEngine télégraphie chaque hybride avant dégâts et applique collision puis grapple du Newborn', () => withBrowserMocks(() => {
  for (const source of ENEMY_HYBRIDS_V64) {
    const events = [];
    const engine = createEngine(events);
    engine.start({ seed: 426, world: { id: source.encounterWorldIds[0] }, enemyCatalog: ENEMIES });
    const enemy = engine.enemies.find((candidate) => candidate.name === source.name);
    const contract = resolveEnemyMeleeContractV64(enemy);
    assert.ok(enemy && contract, source.name);
    engine.walls = [];
    engine.doors = [];
    engine.covers = [];
    Object.assign(engine.player, {
      x: enemy.x + Math.min(contract.meleeRange - 12, 100),
      y: enemy.y + enemy.h - engine.player.h,
      health: 100,
      armor: 0,
      alive: true,
      inVehicle: false,
      grounded: true
    });
    enemy.alert = true;
    enemy.attackClock = 0;
    let collisionCalls = 0;
    const resolveEnemyHorizontal = engine.resolveEnemyHorizontal.bind(engine);
    engine.resolveEnemyHorizontal = (...args) => {
      collisionCalls += 1;
      return resolveEnemyHorizontal(...args);
    };
    const healthBefore = engine.player.health;
    engine.updateEnemy(enemy, 0.016);
    assert.equal(enemy.pendingMelee, true, source.name + ': télégraphe armé');
    assert.equal(engine.player.health, healthBefore, source.name + ': aucun dégât avant impact');
    assert.ok(events.some((event) => event.type === 'enemy-attack-telegraph' && event.enemyId === enemy.id), source.name + ': événement télégraphe');
    engine.updateEnemy(enemy, contract.windup + 0.01);
    assert.ok(engine.player.health < healthBefore, source.name + ': dégât sur impact');
    assert.ok(events.some((event) => event.type === 'enemy-attack-impact' && event.enemyId === enemy.id && event.hit), source.name + ': événement impact');
    if (source.name === 'Newborn') {
      assert.ok(collisionCalls > 0, 'Newborn: le lunge passe par la résolution de collision');
      assert.ok(engine.player.grappledClock > 0, 'Newborn: grapple appliqué');
      engine.hazards = [];
      engine.keys.add('KeyD');
      const floorY = engine.platforms[0].y;
      const controls = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space', fire: 'KeyF' };
      Object.assign(engine.player, { x: 100, y: floorY - engine.player.h, vx: 0, vy: 0, grounded: true, grappledClock: 0.8 });
      engine.updatePlayer(engine.player, 0.05, controls);
      const slowedVelocity = Math.abs(engine.player.vx);
      Object.assign(engine.player, { x: 100, y: floorY - engine.player.h, vx: 0, vy: 0, grounded: true, grappledClock: 0 });
      engine.updatePlayer(engine.player, 0.05, controls);
      assert.ok(Math.abs(engine.player.vx) > slowedVelocity * 2, 'Newborn: le grapple ralentit réellement le déplacement');
    }
    engine.stop();
  }
}));

test('V51 conserve la cible verrouillée pendant le windup même si le coop devient plus proche', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine(events);
  const source = ENEMY_HYBRIDS_V64.find((entry) => entry.name === 'Offspring');
  engine.start({ seed: 426, world: { id: source.encounterWorldIds[0] }, enemyCatalog: ENEMIES });
  const enemy = engine.enemies.find((candidate) => candidate.name === source.name);
  const contract = resolveEnemyMeleeContractV64(enemy);
  engine.coopEnabled = true;
  Object.assign(enemy, { alert: true, attackClock: 0, staggerClock: 1 });
  Object.assign(engine.player, {
    x: enemy.x + 100,
    y: enemy.y + enemy.h - engine.player.h,
    health: 100,
    armor: 0,
    alive: true,
    downed: false,
    inVehicle: false
  });
  Object.assign(engine.coop, {
    x: enemy.x + 500,
    y: enemy.y + enemy.h - engine.coop.h,
    health: 100,
    armor: 0,
    alive: true,
    downed: false,
    inVehicle: false
  });

  engine.updateEnemy(enemy, 0.016);
  assert.equal(enemy.pendingMeleeTargetId, 'player');
  engine.coop.x = enemy.x + 20;
  const playerHealth = engine.player.health;
  const coopHealth = engine.coop.health;
  engine.updateEnemy(enemy, contract.windup + 0.01);

  assert.ok(engine.player.health < playerHealth);
  assert.equal(engine.coop.health, coopHealth);
  assert.ok(events.some((event) => event.type === 'enemy-attack-impact' && event.targetId === 'player' && event.hit));
  engine.stop();
}));

test('V51 annule proprement le windup quand la cible verrouillée devient invalide', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine(events);
  const source = ENEMY_HYBRIDS_V64.find((entry) => entry.name === 'Predalien');
  engine.start({ seed: 426, world: { id: source.encounterWorldIds[0] }, enemyCatalog: ENEMIES });
  const enemy = engine.enemies.find((candidate) => candidate.name === source.name);
  Object.assign(enemy, { alert: true, attackClock: 0, staggerClock: 1 });
  Object.assign(engine.player, {
    x: enemy.x + 100,
    y: enemy.y + enemy.h - engine.player.h,
    health: 100,
    armor: 0,
    alive: true,
    downed: false,
    inVehicle: false
  });
  engine.updateEnemy(enemy, 0.016);
  assert.equal(enemy.pendingMelee, true);
  engine.player.alive = false;
  engine.updateEnemy(enemy, 0.05);

  assert.equal(enemy.pendingMelee, false);
  assert.equal(enemy.pendingMeleeTargetId, null);
  assert.ok(events.some((event) => event.type === 'enemy-attack-cancelled' && event.reason === 'target-invalid' && event.targetId === 'player'));
  engine.stop();
}));

test('V51 interdit armement et impact à travers un mur ou une porte fermée', () => withBrowserMocks(() => {
  const source = ENEMY_HYBRIDS_V64.find((entry) => entry.name === 'Offspring');
  for (const obstacleKind of ['wall', 'door']) {
    const events = [];
    const engine = createEngine(events);
    engine.start({ seed: 426, world: { id: source.encounterWorldIds[0] }, enemyCatalog: ENEMIES });
    const enemy = engine.enemies.find((candidate) => candidate.name === source.name);
    Object.assign(enemy, { x: 600, spawnX: 600, alert: true, attackClock: 0, staggerClock: 1 });
    Object.assign(engine.player, {
      x: 742,
      y: enemy.y + enemy.h - engine.player.h,
      health: 100,
      armor: 0,
      alive: true,
      downed: false,
      inVehicle: false
    });
    engine.walls = obstacleKind === 'wall'
      ? [{ id: 'melee-wall', x: 670, y: enemy.y - 20, w: 18, h: enemy.h + 40 }]
      : [];
    engine.doors = obstacleKind === 'door'
      ? [{ id: 'melee-door', x: 672, y: enemy.y + 18, w: 20, h: 64, open: false, progress: 0 }]
      : [];
    engine.covers = [];
    assert.equal(engine.enemyMeleePathClearV64(enemy, engine.player), false, obstacleKind);
    const healthBefore = engine.player.health;
    engine.updateEnemy(enemy, 0.016);
    assert.equal(enemy.pendingMelee, false, obstacleKind + ': aucun armement');
    engine.updateEnemy(enemy, 0.5);
    assert.equal(engine.player.health, healthBefore, obstacleKind + ': aucun impact');
    assert.equal(events.some((event) => event.type === 'enemy-attack-telegraph' && event.enemyId === enemy.id), false);
    engine.stop();
  }
}));

test('V51 transforme l’impact en échec si une porte se ferme pendant le windup', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine(events);
  const source = ENEMY_HYBRIDS_V64.find((entry) => entry.name === 'Offspring');
  engine.start({ seed: 426, world: { id: source.encounterWorldIds[0] }, enemyCatalog: ENEMIES });
  const enemy = engine.enemies.find((candidate) => candidate.name === source.name);
  const contract = resolveEnemyMeleeContractV64(enemy);
  Object.assign(enemy, { x: 600, spawnX: 600, alert: true, attackClock: 0, staggerClock: 1 });
  Object.assign(engine.player, {
    x: 742,
    y: enemy.y + enemy.h - engine.player.h,
    health: 100,
    armor: 0,
    alive: true,
    downed: false,
    inVehicle: false
  });
  engine.walls = [];
  engine.doors = [];
  engine.covers = [];
  engine.updateEnemy(enemy, 0.016);
  assert.equal(enemy.pendingMelee, true);
  engine.doors = [{ id: 'closing-door', x: 672, y: enemy.y + 18, w: 20, h: 64, open: false, progress: 0 }];
  const healthBefore = engine.player.health;
  engine.updateEnemy(enemy, contract.windup + 0.01);

  assert.equal(engine.player.health, healthBefore);
  assert.ok(events.some((event) => event.type === 'enemy-attack-impact'
    && event.enemyId === enemy.id
    && event.targetId === 'player'
    && !event.hit
    && event.reason === 'path-blocked'));
  engine.stop();
}));

test('le lunge du Newborn est réellement arrêté par une collision de couverture', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine(events);
  const source = ENEMY_HYBRIDS_V64.find((entry) => entry.name === 'Newborn');
  engine.start({ seed: 426, world: { id: source.encounterWorldIds[0] }, enemyCatalog: ENEMIES });
  const enemy = engine.enemies.find((candidate) => candidate.name === source.name);
  Object.assign(enemy, { x: 600, spawnX: 600, alert: true, attackClock: 0, staggerClock: 1 });
  Object.assign(engine.player, {
    x: 710,
    y: enemy.y + enemy.h - engine.player.h,
    health: 100,
    armor: 0,
    alive: true,
    downed: false,
    inVehicle: false
  });
  const cover = { id: 'lunge-cover', x: enemy.x + enemy.w + 10, y: enemy.y + enemy.h - 35, w: 28, h: 35, destroyed: false };
  engine.walls = [];
  engine.doors = [];
  engine.covers = [cover];
  const startX = enemy.x;
  engine.updateEnemy(enemy, 0.016);

  assert.ok(enemy.x > startX, 'le lunge avance jusqu’à la couverture');
  assert.ok(enemy.x + enemy.w <= cover.x, 'le corps ne traverse pas la couverture');
  assert.equal(enemy.pendingMelee, true, 'le télégraphe reste possible depuis le bord de couverture');
  engine.stop();
}));

test('V52 verrouille aussi une cible d’escouade pendant le windup', () => withBrowserMocks(() => {
  const events = [];
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  const engine = new V52GameEngine(canvas, { onEvent: (event) => events.push(event) });
  const source = ENEMY_HYBRIDS_V64.find((entry) => entry.name === 'Offspring');
  engine.start({ seed: 426, world: { id: source.encounterWorldIds[0] }, enemyCatalog: ENEMIES });
  const enemy = engine.enemies.find((candidate) => candidate.name === source.name);
  const contract = resolveEnemyMeleeContractV64(enemy);
  const createSquadTarget = (crewId, x) => ({
    squadMember: true,
    crewId,
    x,
    y: enemy.y + enemy.h - 92,
    w: 42,
    h: 92,
    health: 100,
    maxHealth: 100,
    armor: 0,
    alive: true,
    downed: false,
    lost: false,
    inVehicle: false,
    damageTaken: 0,
    specialty: 'assault'
  });
  const locked = createSquadTarget('locked', enemy.x + 100);
  const decoy = createSquadTarget('decoy', enemy.x + 500);
  engine.squadActors = [locked, decoy];
  Object.assign(engine.player, { x: enemy.x - 800, alive: true, downed: false, inVehicle: false });
  Object.assign(enemy, { alert: true, attackClock: 0, staggerClock: 1 });

  engine.updateEnemy(enemy, 0.016);
  assert.equal(enemy.pendingMeleeTargetId, 'squad:locked');
  decoy.x = enemy.x + 16;
  const lockedHealth = locked.health;
  const decoyHealth = decoy.health;
  engine.updateEnemy(enemy, contract.windup + 0.01);

  assert.ok(locked.health < lockedHealth, 'la cible verrouillée reçoit l’impact');
  assert.equal(decoy.health, decoyHealth, 'la cible devenue plus proche ne vole pas l’impact');
  assert.ok(events.some((event) => event.type === 'enemy-attack-impact' && event.targetId === 'squad:locked' && event.hit));

  Object.assign(enemy, { attackClock: 0, attackAnimationClock: 0, attacking: false });
  Object.assign(locked, { alive: true, downed: false, x: enemy.x + 100 });
  decoy.x = enemy.x + 500;
  engine.updateEnemy(enemy, 0.016);
  assert.equal(enemy.pendingMeleeTargetId, 'squad:locked');
  locked.alive = false;
  locked.downed = true;
  decoy.x = enemy.x + 16;
  const decoyAfterRelock = decoy.health;
  engine.updateEnemy(enemy, 0.05);
  assert.equal(enemy.pendingMelee, false);
  assert.equal(decoy.health, decoyAfterRelock, 'la cible de remplacement ne reçoit pas une attaque déjà engagée');
  assert.ok(events.some((event) => event.type === 'enemy-attack-cancelled'
    && event.targetId === 'squad:locked'
    && event.reason === 'target-invalid'));
  engine.stop();
}));

test('les trois hybrides réservent death aux morts et exposent hurt sans mort non létale', () => {
  const identities = [
    ['newbornV64', 'enemy.newborn.action.v64'],
    ['offspringV64', 'enemy.offspring.action.v64'],
    ['predalienV64', 'enemy.predalien.action.v64']
  ];
  for (const [spriteKey, visualSheetId] of identities) {
    const hurt = resolveEnemyAnimation({ spriteKey, visualSheetId, alive: true, hurtClock: 0.2, attacking: false, alert: true });
    const dead = resolveEnemyAnimation({ spriteKey, visualSheetId, alive: false, hurtClock: 0.2, attacking: false, alert: false });
    assert.equal(hurt.clipId, 'idle', spriteKey + ': hurt non létal');
    assert.equal(hurt.reaction, 'hurt', spriteKey + ': réaction hurt explicite');
    assert.equal(dead.clipId, 'death', spriteKey + ': mort terminale');
    assert.equal(dead.reaction, undefined, spriteKey + ': pas de confusion avec hurt');
  }
});
