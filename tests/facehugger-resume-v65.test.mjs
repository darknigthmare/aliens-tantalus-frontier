import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine, RESUME_STATE_SCHEMA } from '../src/game-production-runtime.js';
import { ENEMIES, WORLDS } from '../src/content.js';
import { FACEHUGGER_COMBAT_V65, isFacehuggerCombatV65 } from '../src/enemy-facehugger-combat-v65.js';

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
    Object.assign(globalThis, previous);
  }
}

function createMission() {
  const events = [];
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  const engine = new GameEngine(canvas, { onEvent: (event) => events.push(event) });
  const source = ENEMIES.find((entry) => entry.id === 'enemy-002-facehugger');
  assert.ok(source, 'le vrai profil Facehugger existe dans le catalogue');
  engine.start({ seed: 650426, world: WORLDS[0], enemyCatalog: [source], equipment: [], crew: [] });
  const enemy = engine.createEnemy(source, 0, 600, 930);
  assert.equal(isFacehuggerCombatV65(enemy), true);
  engine.enemies = [enemy];
  engine.squadActors = [];
  engine.coopEnabled = false;
  engine.walls = [];
  engine.doors = [];
  engine.covers = [];
  engine.hazards = [];
  Object.assign(enemy, { alert: true, attackClock: 0, staggerClock: 0, hurtClock: 0, v52HurtClock: 0 });
  Object.assign(engine.player, {
    x: enemy.x + 140,
    y: enemy.y + enemy.h - engine.player.h,
    health: 100,
    armor: 0,
    alive: true,
    downed: false,
    inVehicle: false,
    ventTransit: null
  });
  return { engine, enemy, events };
}

test('la reprise JSON d’un vrai windup Facehugger annule le saut sans rejouer son impact', () => withBrowserMocks(() => {
  const original = createMission();
  original.engine.updateEnemy(original.enemy, 0.016);
  assert.ok(original.enemy.facehuggerAttackV65, 'le moteur arme le saut réel');
  assert.ok(original.events.some((event) => event.type === 'enemy-attack-telegraph'));
  original.engine.updateEnemy(original.enemy, FACEHUGGER_COMBAT_V65.impact / 2);
  assert.ok(original.enemy.facehuggerAttackV65.elapsed > 0);
  assert.equal(original.engine.player.health, 100, 'la sauvegarde précède l’impact');

  const state = JSON.parse(JSON.stringify(original.engine.captureResumeState()));
  const savedEnemy = state.enemies.find((entry) => entry.id === original.enemy.id);
  assert.equal(savedEnemy.facehuggerAttackActiveV65, true);
  assert.equal(savedEnemy.attackClock, original.enemy.attackClock);
  for (const transient of ['facehuggerAttackV65', 'attackAnimationClock', 'attackWindupClock', 'attacking']) {
    assert.equal(Object.hasOwn(savedEnemy, transient), false, `${transient} n’est pas sérialisé`);
  }

  const resumed = createMission();
  Object.assign(resumed.enemy, {
    facehuggerAttackV65: { ...original.enemy.facehuggerAttackV65 },
    attackAnimationClock: original.enemy.attackAnimationClock,
    attackWindupClock: original.enemy.attackWindupClock,
    attacking: true
  });
  const result = resumed.engine.applyResumeState(state);
  assert.equal(result.applied, true);
  assert.equal(resumed.enemy.facehuggerAttackV65, null);
  assert.equal(resumed.enemy.attacking, false);
  assert.equal(resumed.enemy.attackAnimationClock, 0);
  assert.equal(resumed.enemy.attackWindupClock, 0);
  assert.equal(resumed.enemy.attackClock, savedEnemy.attackClock);
  assert.ok(resumed.enemy.attackClock >= FACEHUGGER_COMBAT_V65.duration);

  resumed.engine.updateEnemy(resumed.enemy, 0.016);
  resumed.engine.updateEnemy(resumed.enemy, FACEHUGGER_COMBAT_V65.impact / 2);
  assert.equal(resumed.engine.player.health, state.player.health, 'aucun dégât fantôme après reprise');
  assert.equal(resumed.enemy.facehuggerAttackV65, null, 'aucun ancien verrouillage de cible restauré');
  assert.equal(resumed.events.some((event) => event.type === 'enemy-attack-impact'), false);
  original.engine.stop();
  resumed.engine.stop();
}));

test('la capture Facehugger borne le cooldown sans enregistrer de cible ni de frame active', () => withBrowserMocks(() => {
  const { engine, enemy } = createMission();
  for (const [input, expected] of [[-3, 0], [9, 1.3], [0.45, 0.45], [NaN, 0], [Infinity, 0], [undefined, 0]]) {
    enemy.attackClock = input;
    enemy.facehuggerAttackV65 = null;
    const saved = engine.captureResumeState().enemies[0];
    assert.equal(saved.attackClock, expected, String(input));
    assert.equal(saved.facehuggerAttackActiveV65, false);
  }
  engine.stop();
}));

test('la restauration Facehugger sécurise les anciens saves et les cooldowns invalides', () => withBrowserMocks(() => {
  const { engine, enemy } = createMission();
  const cases = [
    { attackClock: -9, expected: 0 },
    { attackClock: 99, expected: 1.3 },
    { attackClock: '0.9', expected: 0.9 },
    { attackClock: NaN, expected: 0.42 },
    { attackClock: Infinity, expected: 0.42 },
    { expected: 0.42 },
    { attackClock: 0, facehuggerAttackActiveV65: true, expected: FACEHUGGER_COMBAT_V65.duration },
    { attackClock: 0.9, facehuggerAttackActiveV65: true, expected: 0.9 },
    { attackClock: 99, facehuggerAttackActiveV65: true, expected: 1.3 },
    { attackClock: 0, facehuggerAttackActiveV65: false, expected: 0 },
    { attackClock: 0, facehuggerAttackActiveV65: 'true', expected: 0 }
  ];
  for (const { expected, ...fields } of cases) {
    Object.assign(enemy, {
      attackClock: 0.42,
      facehuggerAttackV65: { targetId: 'player', elapsed: FACEHUGGER_COMBAT_V65.impact },
      attackAnimationClock: 0.3,
      attackWindupClock: 0.1,
      attacking: true
    });
    const result = engine.applyResumeState({
      schema: RESUME_STATE_SCHEMA,
      enemies: [{ id: enemy.id, alive: true, health: enemy.maxHealth, ...fields }]
    });
    assert.equal(result.applied, true);
    assert.equal(enemy.attackClock, expected, JSON.stringify(fields));
    assert.equal(enemy.facehuggerAttackV65, null);
    assert.equal(enemy.attackAnimationClock, 0);
    assert.equal(enemy.attackWindupClock, 0);
    assert.equal(enemy.attacking, false);
  }
  for (const [existing, expected] of [[-3, 0], [99, 1.3], [NaN, 0], [undefined, 0]]) {
    enemy.attackClock = existing;
    engine.applyResumeState({ enemies: [{ id: enemy.id, alive: true, health: enemy.maxHealth }] });
    assert.equal(enemy.attackClock, expected, `ancien save, cooldown initial ${existing}`);
  }
  engine.stop();
}));

test('la sauvegarde V65 ne change ni les pouncers legacy ni un autre profil Facehugger', () => withBrowserMocks(() => {
  const { engine, enemy } = createMission();
  for (const visualSheetId of ['enemy.facehugger.locomotion', 'enemy.profile.enemy-fixture-facehugger.v65']) {
    const attack = { targetId: 'player', elapsed: 0.12 };
    Object.assign(enemy, { visualSheetId, attackClock: 2.7, facehuggerAttackV65: attack, attackAnimationClock: 0.8, attackWindupClock: 0.4, attacking: true });
    assert.equal(isFacehuggerCombatV65(enemy), false);
    const saved = engine.captureResumeState().enemies[0];
    assert.equal(Object.hasOwn(saved, 'attackClock'), false);
    assert.equal(Object.hasOwn(saved, 'facehuggerAttackActiveV65'), false);
    engine.applyResumeState({ enemies: [{ ...saved, attackClock: 0, facehuggerAttackActiveV65: true }] });
    assert.equal(enemy.attackClock, 2.7, visualSheetId);
    assert.equal(enemy.facehuggerAttackV65, attack);
    assert.equal(enemy.attackAnimationClock, 0.8);
    assert.equal(enemy.attackWindupClock, 0.4);
    assert.equal(enemy.attacking, true);
  }
  engine.stop();
}));
