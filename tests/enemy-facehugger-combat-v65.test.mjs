import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/content-core-v50.js';
import { GameEngine } from '../src/game-v51-runtime.js';
import { withV52MissionRuntime } from '../src/game-v52-runtime.js';
import { withV52LevelRuntime } from '../src/game-v52-level-runtime.js';
import { SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import {
  FACEHUGGER_COMBAT_V65 as contract,
  isFacehuggerCombatV65,
  updateFacehuggerCombatV65
} from '../src/enemy-facehugger-combat-v65.js';

const MissionEngine = withV52MissionRuntime(GameEngine);
const LevelEngine = withV52LevelRuntime(MissionEngine);
const facehugger = ENEMIES.find((enemy) => enemy.id === 'enemy-002-facehugger');

class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 2048; }
  set src(value) { this.currentSrc = value; queueMicrotask(() => this.onload?.()); }
}

async function withBrowserMocks(run) {
  const previous = Object.fromEntries(['Image', 'addEventListener', 'requestAnimationFrame'].map((key) => [key, globalThis[key]]));
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try { return await run(); } finally { Object.assign(globalThis, previous); }
}

function createEngine(Engine = GameEngine) {
  const events = [];
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  const engine = new Engine(canvas, { onEvent: (event) => events.push(event) });
  engine.start({ seed: 426, world: { id: facehugger.encounterWorldIds[0] }, enemyCatalog: ENEMIES });
  const enemy = engine.createEnemy(facehugger, 99, 600, 930);
  engine.enemies = [enemy];
  engine.walls = [];
  engine.doors = [];
  engine.covers = [];
  engine.squadActors = [];
  Object.assign(enemy, { alert: true, attackClock: 0, hurtClock: 0, staggerClock: 0, v52HurtClock: 0 });
  Object.assign(engine.player, { x: 740, y: 930 - engine.player.h, health: 100, armor: 0, alive: true, downed: false, inVehicle: false, inCover: false });
  return { engine, enemy, events };
}

function step(engine, enemy, delta) {
  engine.animationTime += delta;
  engine.updateEnemy(enemy, delta);
}

function createSquadTarget(crewId, x) {
  return {
    squadMember: true, crewId, x, y: 838, w: 42, h: 92,
    health: 100, maxHealth: 100, armor: 0, alive: true, downed: false, lost: false,
    inVehicle: false, damageTaken: 0, specialty: 'assault'
  };
}

test('le contrat ne change aucun ancien pouncer ni variante Facehugger sans la plaque standard V65', () => {
  for (const visualSheetId of ['enemy.facehugger.action.v56', 'enemy.profile.enemy-albino-facehugger.v65', 'enemy.xenomorph-runner.action']) {
    const enemy = { visualSheetId, behavior: 'pouncer', alive: true, attackClock: 0 };
    const before = structuredClone(enemy);
    assert.equal(isFacehuggerCombatV65(enemy), false);
    assert.equal(updateFacehuggerCombatV65({}, enemy, 1 / 60), false);
    assert.deepEqual(enemy, before);
  }
});

for (const [label, Engine] of [['V51', GameEngine], ['V52', MissionEngine]]) {
  test(`${label}: vraie IA et vrai dessin jouent les cellules 16..23, sans téléportation et avec un seul impact`, () => withBrowserMocks(async () => {
    const { engine, enemy, events } = createEngine(Engine);
    try {
      assert.equal(enemy.visualSheetId, contract.sheetId);
      await engine.ensureEnemyAtlas(SPRITE_SHEETS[contract.sheetId]);
      const cells = [];
      const context = new Proxy({
        drawImage: (_image, sx, sy) => cells.push(sy / 256 * 4 + sx / 256)
      }, { get: (target, key) => target[key] ?? (() => {}) });
      step(engine, enemy, 0);
      assert.equal(enemy.attacking, true);
      assert.equal(enemy.facehuggerAttackV65.targetId, 'player');
      assert.equal(enemy.x, 600, 'aucun déplacement lors de l’armement');
      engine.drawEnemy(context, enemy);
      for (let tick = 1; tick <= 40; tick += 1) {
        const previousX = enemy.x;
        step(engine, enemy, 1 / 60);
        assert.ok(Math.abs(enemy.x - previousX) <= contract.maximumStep + 1e-9, `pas physique ${tick}`);
        if (tick <= 10) {
          assert.equal(enemy.x, 600, 'anticipation immobile');
          assert.equal(engine.player.health, 100);
        }
        if (tick < 25) assert.equal(engine.player.health, 100, 'pas de dégât avant la pose d’impact');
        if (tick < 40) {
          assert.equal(enemy.attacking, true, `animation conservée à la mise à jour ${tick}`);
          engine.drawEnemy(context, enemy);
        }
      }
      assert.deepEqual([...new Set(cells)], [16, 17, 18, 19, 20, 21, 22, 23]);
      assert.ok(Math.abs(enemy.x - 692) < 1e-9, 'avance totale de 92 px');
      assert.equal(enemy.y, 930 - enemy.h, 'la physique reste ancrée au sol');
      assert.equal(engine.player.health, 100 - enemy.damage);
      assert.equal(enemy.attacking, false);
      assert.equal(enemy.facehuggerAttackV65, null);
      assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 1);
      assert.ok(events.some((event) => event.type === 'enemy-attack-impact' && event.hit && event.targetId === 'player'));
      assert.ok(enemy.attackClock > 0.6, 'le cooldown reste distinct de la récupération animée');
      step(engine, enemy, 0.2);
      assert.equal(events.filter((event) => event.type === 'enemy-attack-telegraph').length, 1);
      assert.equal(engine.player.health, 100 - enemy.damage);
    } finally { engine.stop(); }
  }));
}

test('la cible joueur reste verrouillée même si le coop se rapproche pendant le saut', () => withBrowserMocks(() => {
  const { engine, enemy, events } = createEngine();
  try {
    engine.coopEnabled = true;
    Object.assign(engine.coop, { x: 1000, y: 930 - engine.coop.h, alive: true, downed: false, health: 100, armor: 0, inVehicle: false });
    step(engine, enemy, 0);
    engine.coop.x = 680;
    step(engine, enemy, contract.impact);
    assert.equal(enemy.facehuggerAttackV65.targetId, 'player');
    assert.equal(engine.player.health, 100 - enemy.damage);
    assert.equal(engine.coop.health, 100);
    assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 1);
  } finally { engine.stop(); }
}));

test('V52 conserve la cible escouade quand le routage repasse par la branche joueur', () => withBrowserMocks(() => {
  const { engine, enemy, events } = createEngine(MissionEngine);
  try {
    const locked = createSquadTarget('locked', 740);
    const decoy = createSquadTarget('decoy', 1100);
    engine.squadActors = [locked, decoy];
    engine.player.x = 1600;
    step(engine, enemy, 0);
    assert.equal(enemy.facehuggerAttackV65.targetId, 'squad:locked');
    engine.player.x = 640;
    decoy.x = 660;
    step(engine, enemy, contract.impact);
    assert.ok(locked.health < 100, 'dégât réel via damageSquadMember');
    assert.equal(engine.player.health, 100);
    assert.equal(decoy.health, 100);
    assert.ok(events.some((event) => event.type === 'enemy-attack-impact' && event.targetId === 'squad:locked' && event.hit));
  } finally { engine.stop(); }
}));

for (const kind of ['wall', 'door']) {
  test(`${kind}: aucune attaque ni traversée contre un obstacle mince fermé`, () => withBrowserMocks(() => {
    const { engine, enemy, events } = createEngine();
    try {
      const obstacle = { id: 'blocking-obstacle', x: kind === 'door' ? 760 : 670, y: 790, w: 6, h: 160, open: false, progress: 0 };
      // Doors use their full rendered collision bounds; keep both actors
      // outside that hull instead of accidentally spawning inside its art.
      if (kind === 'door') engine.player.x = 900;
      engine.walls = kind === 'wall' ? [obstacle] : [];
      engine.doors = kind === 'door' ? [obstacle] : [];
      assert.equal(engine.enemyMeleePathClearV64(enemy, engine.player), false);
      step(engine, enemy, 0.5);
      const collider = kind === 'wall' ? obstacle : engine.closedDoorColliders()[0];
      assert.ok(enemy.x + enemy.w <= collider.x + 1e-9);
      assert.equal(enemy.facehuggerAttackV65, undefined);
      assert.equal(engine.player.health, 100);
      assert.equal(events.some((event) => event.type === 'enemy-attack-telegraph'), false);
    } finally { engine.stop(); }
  }));
}

test('fermer une porte pendant l’anticipation annule définitivement cet impact', () => withBrowserMocks(() => {
  const { engine, enemy, events } = createEngine();
  try {
    step(engine, enemy, 0);
    engine.doors = [{ id: 'closing-door', x: 670, y: 790, w: 12, h: 160, open: false, progress: 0 }];
    step(engine, enemy, contract.impact);
    assert.equal(enemy.facehuggerAttackV65, null);
    assert.equal(enemy.attacking, false);
    assert.equal(enemy.x, 600);
    assert.equal(engine.player.health, 100);
    assert.ok(events.some((event) => event.type === 'enemy-attack-cancelled' && event.reason === 'path-blocked'));
    assert.equal(events.some((event) => event.type === 'enemy-attack-impact'), false);
  } finally { engine.stop(); }
}));

test('un saut à grand delta est balayé en sous-pas et arrêté par une couverture mince', () => withBrowserMocks(() => {
  const { engine, enemy, events } = createEngine();
  try {
    step(engine, enemy, 0);
    const cover = { id: 'thin-cover', x: 666, y: 900, w: 2, h: 30, destroyed: false };
    engine.covers = [cover];
    const steps = [];
    const resolve = engine.resolveEnemyHorizontal.bind(engine);
    engine.resolveEnemyHorizontal = (actor, previousX) => { steps.push(actor.x - previousX); resolve(actor, previousX); };
    step(engine, enemy, contract.duration);
    assert.ok(steps.length >= 2);
    assert.ok(steps.every((distance) => Math.abs(distance) <= 8));
    assert.ok(enemy.x + enemy.w <= cover.x + 1e-9);
    assert.equal(engine.player.health, 100);
    assert.equal(enemy.facehuggerAttackV65, null);
    assert.ok(events.some((event) => event.type === 'enemy-attack-cancelled' && event.reason === 'collision-blocked'));
  } finally { engine.stop(); }
}));

test('l’approche hors portée reste continue et balayée avant d’armer la séquence', () => withBrowserMocks(() => {
  const { engine, enemy, events } = createEngine();
  try {
    engine.player.x = 1000;
    const displacements = [];
    const resolve = engine.resolveEnemyHorizontal.bind(engine);
    engine.resolveEnemyHorizontal = (actor, previousX) => { displacements.push(actor.x - previousX); resolve(actor, previousX); };
    step(engine, enemy, 0.5);
    assert.ok(enemy.x > 600 && enemy.x < 700);
    assert.ok(displacements.length > 1 && displacements.every((distance) => Math.abs(distance) <= 8));
    assert.equal(events.some((event) => event.type === 'enemy-attack-telegraph'), false);
    assert.equal(engine.player.health, 100);
  } finally { engine.stop(); }
}));

for (const [label, change, reason] of [
  ['cible à terre', (engine) => { engine.player.downed = true; }, 'target-invalid'],
  ['cible en conduit', (engine) => { engine.player.ventTransit = { networkId: 'test' }; }, 'target-invalid'],
  ['cible passée derrière', (engine) => { engine.player.x = 500; }, 'target-crossed'],
  ['étourdissement', (_engine, enemy) => { enemy.staggerClock = 0.01; }, 'staggered'],
  ['blessure', (_engine, enemy) => { enemy.hurtClock = 0.01; }, 'staggered']
]) {
  test(`${label}: annulation sans retourner le saut ni transférer son impact`, () => withBrowserMocks(() => {
    const { engine, enemy, events } = createEngine();
    try {
      step(engine, enemy, 0);
      change(engine, enemy);
      step(engine, enemy, contract.duration);
      assert.equal(engine.player.health, 100);
      assert.equal(enemy.facehuggerAttackV65, null);
      assert.equal(enemy.attacking, false);
      assert.equal(enemy.x, 600);
      assert.ok(events.some((event) => event.type === 'enemy-attack-cancelled' && event.reason === reason));
      assert.equal(events.some((event) => event.type === 'enemy-attack-impact'), false);
    } finally { engine.stop(); }
  }));
}

test('le profil dédié ne détecte pas un joueur derrière un mur ni à l’autre bout de la carte', () => withBrowserMocks(() => {
  for (const hiddenByWall of [false, true]) {
    const { engine, enemy, events } = createEngine();
    try {
      enemy.alert = false;
      if (hiddenByWall) engine.walls = [{ x: 670, y: 790, w: 12, h: 160 }];
      else engine.player.x = 3000;
      step(engine, enemy, 0.1);
      assert.equal(enemy.alert, false);
      assert.equal(events.some((event) => event.type === 'enemy-attack-telegraph'), false);
    } finally { engine.stop(); }
  }
}));

test('V52Level annule aussi une attaque suspendue par le passage de l’ennemi en conduit', () => withBrowserMocks(() => {
  const { engine, enemy, events } = createEngine(LevelEngine);
  try {
    // Arm through real V51 combat before activating the level transit gate.
    engine.missionLevelRuntime = null;
    step(engine, enemy, 0);
    assert.ok(enemy.facehuggerAttackV65);
    engine.missionLevelRuntime = {};
    engine.missionVentNetworkV62 = { id: 'test-vent' };
    enemy.ventTransit = { networkId: 'test-vent' };
    step(engine, enemy, 0.1);
    assert.equal(enemy.facehuggerAttackV65, null);
    assert.equal(enemy.attacking, false);
    assert.equal(engine.player.health, 100);
    assert.ok(events.some((event) => event.type === 'enemy-attack-cancelled' && event.reason === 'enemy-in-vent'));
  } finally { engine.stop(); }
}));

test('le rayon furtif bloque l’armement dès la première frame avant le correctif du wrapper', () => withBrowserMocks(() => {
  const { engine, enemy, events } = createEngine();
  try {
    enemy.alert = false;
    enemy.revealed = 0;
    engine.stealthRuntime = { detectionRadius: 80 };
    step(engine, enemy, 0);
    assert.equal(enemy.alert, false);
    assert.equal(enemy.attacking, false);
    assert.equal(enemy.facehuggerAttackV65, undefined);
    assert.equal(events.some((event) => event.type === 'enemy-attack-telegraph'), false);
    engine.stealthRuntime.detectionRadius = 200;
    step(engine, enemy, 0);
    assert.equal(enemy.alert, true);
    assert.ok(enemy.facehuggerAttackV65);
  } finally { engine.stop(); }
}));
