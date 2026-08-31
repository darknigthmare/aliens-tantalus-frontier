import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import {
  OVOMORPH_CYCLE_V66 as contract,
  releaseOvomorphFacehuggerV66
} from '../src/enemy-ovomorph-cycle-v66.js';

const actor = (x, extra = {}) => ({ x, y: 838, w: 42, h: 92, alive: true,
  downed: false, lost: false, inVehicle: false, health: 100, ...extra });

function fixture({ nearest = 'player', level = true } = {}) {
  // Import the shipped Mission(Level(Core)) engine: the former bug appeared
  // only when its outer squad/stealth routing skipped or doubled a timer.
  const engine = Object.create(GameEngine.prototype);
  const egg = { id: 'enemy-001-ovomorph:status-production', name: 'Ovomorph',
    visualSheetId: contract.sheetId, x: 600, y: 882, w: 34, h: 48,
    alive: true, health: 100, maxHealth: 100, facing: 1, speed: 100,
    alert: false, jammedClock: 0, staggerClock: 0, hurtClock: 0, attackClock: 0 };
  const events = [];
  Object.assign(engine, {
    random: () => 0.5, animationTime: 0, enemies: [egg],
    player: actor(nearest === 'player' ? 720 : 1800), coopEnabled: false,
    squadActors: nearest === 'squad' ? [actor(720, { squadMember: true, crewId: 'escort' })] : [],
    walls: [], doors: [], covers: [], ladders: [], lifts: [],
    platforms: [{ id: 'floor', x: 0, y: 930, w: 6200, h: 40 }],
    missionLevelRuntime: level ? {} : null,
    missionVentNetworkV62: { id: 'status-regression' },
    missionLevelBounds: { width: 6200, height: 1080 },
    stealthRuntime: { detectionRadius: 900, spottedBy: new Set(), visibility: 100, noise: 0 },
    onEvent(event) { events.push(event); }
  });
  const step = (delta) => { engine.animationTime += delta; engine.updateEnemy(egg, delta); };
  return { engine, egg, events, step };
}

for (const nearest of ['player', 'squad']) {
  for (const level of [true, false]) {
    test(`production ${nearest}, Level=${level}: brouillage4s expire exactement une fois puis eclosion unique`, () => {
      const { engine, egg, events, step } = fixture({ nearest, level });
      egg.jammedClock = 4;
      for (let tick = 1; tick <= 4; tick += 1) {
        step(1);
        assert.equal(egg.jammedClock, 4 - tick, 'un seul tick, ni gel permanent ni double decrementation');
        assert.equal(egg.ovomorphCycleV66.phase, 'sealed');
        assert.equal(engine.enemies.length, 1);
      }
      step(0);
      assert.equal(egg.ovomorphCycleV66.phase, 'opening');
      step(1);
      assert.equal(egg.ovomorphCycleV66.phase, 'hatch');
      step(0.5);
      assert.equal(engine.enemies.length, 2);
      assert.equal(engine.enemies[1].visualSheetId, contract.childSheetId);
      step(0.3);
      assert.equal(egg.ovomorphCycleV66.phase, 'spent');
      egg.jammedClock = 4;
      for (let tick = 0; tick < 6; tick += 1) step(1);
      assert.equal(egg.jammedClock, 0);
      assert.equal(egg.ovomorphCycleV66.phase, 'spent', 'ne pas resceller un oeuf deja eclos');
      assert.equal(egg.ovomorphCycleV66.spawned, true);
      assert.equal(engine.enemies.length, 2);
      assert.equal(events.filter((event) => event.type === 'ovomorph-hatched').length, 1);
    });
  }
}

test('stun et brouillage au milieu de opening preservent le curseur et n avancent que le temps libre', () => {
  const { egg, engine, step } = fixture();
  step(0);
  step(0.6);
  Object.assign(egg, { jammedClock: 0.15, staggerClock: 0.2, hurtClock: 0.24, v52HurtClock: 0.24 });
  step(0.3);
  assert.equal(egg.jammedClock, 0);
  assert.equal(egg.staggerClock, 0);
  assert.equal(egg.hurtClock, 0);
  assert.equal(egg.v52HurtClock, 0.24, 'cette horloge appartient au tick global V52, pas au lifecycle individuel');
  assert.equal(egg.ovomorphCycleV66.phase, 'opening');
  assert.ok(Math.abs(egg.ovomorphCycleV66.elapsed - 0.7) < 1e-9);
  assert.equal(engine.enemies.length, 1);
});

for (const timer of ['jammedClock', 'staggerClock']) {
  test(`${timer}: hatch suspendu ne libere pas sous effet, reprend au meme curseur puis ne duplique pas`, () => {
    const { egg, engine, events, step } = fixture({ nearest: 'squad' });
    step(0);
    step(1);
    step(0.4);
    egg[timer] = 0.2;
    step(0.2);
    assert.equal(egg[timer], 0);
    assert.equal(egg.ovomorphCycleV66.phase, 'hatch');
    assert.equal(egg.ovomorphCycleV66.elapsed, 0.4);
    assert.equal(egg.ovomorphCycleV66.spawned, false);
    assert.equal(engine.enemies.length, 1);
    step(0.1);
    assert.equal(egg.ovomorphCycleV66.spawned, true);
    assert.equal(engine.enemies.length, 2);
    egg[timer] = 0.2;
    step(0.2);
    assert.equal(egg.ovomorphCycleV66.phase, 'hatch');
    assert.equal(egg.ovomorphCycleV66.elapsed, 0.5);
    step(0.3);
    assert.equal(egg.ovomorphCycleV66.phase, 'spent');
    assert.equal(engine.enemies.length, 2);
    assert.equal(events.filter((event) => event.type === 'ovomorph-hatched').length, 1);
  });

  test(`${timer}: un appel direct ne contourne pas la suspension a la frame de liberation`, () => {
    const { egg, engine, step } = fixture();
    egg.ovomorphCycleV66 = { phase: 'hatch', elapsed: contract.releaseTime, spawned: false };
    egg[timer] = 0.2;
    assert.equal(releaseOvomorphFacehuggerV66(engine, egg), null);
    assert.equal(engine.enemies.length, 1);
    step(0.2);
    assert.equal(engine.enemies.length, 1);
    step(0.01);
    assert.equal(engine.enemies.length, 2);
  });
}

test('detruire un oeuf suspendu joue la destruction au lieu de le ressusciter ou retarder la mort', () => {
  const { egg, engine, step } = fixture();
  step(0);
  egg.jammedClock = 4;
  egg.staggerClock = 1;
  egg.alive = false;
  egg.health = 0;
  step(0.7);
  assert.equal(egg.ovomorphCycleV66.phase, 'destroyed');
  assert.equal(egg.ovomorphCycleV66.elapsed, 0.7);
  assert.equal(engine.enemies.length, 1);
  assert.equal(releaseOvomorphFacehuggerV66(engine, egg), null);
});
