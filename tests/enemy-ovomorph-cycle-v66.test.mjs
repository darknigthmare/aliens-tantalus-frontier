import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-v51-runtime.js';
import { isFacehuggerCombatV65 } from '../src/enemy-facehugger-combat-v65.js';
import {
  OVOMORPH_CYCLE_V66 as contract,
  isOvomorphCycleV66,
  getOvomorphChildIdV66,
  getOvomorphAnimationV66,
  updateOvomorphCycleV66,
  releaseOvomorphFacehuggerV66,
  captureOvomorphCycleResumeV66,
  restoreOvomorphCycleResumeV66,
  prepareOvomorphResumeChildrenV66
} from '../src/enemy-ovomorph-cycle-v66.js';

const actor = (x, extra = {}) => ({ x, y: 838, w: 42, h: 92, alive: true, downed: false, lost: false, health: 100, ...extra });

function fixture(id = 'enemy-001-ovomorph:fixture') {
  const events = [];
  const initialized = [];
  const createdSources = [];
  const egg = {
    id, name: 'Ovomorph', visualSheetId: contract.sheetId, x: 600, y: 810, w: 70, h: 120,
    alive: true, health: 100, maxHealth: 100, facing: 1, speed: 300, attacking: false
  };
  const engine = {
    enemies: [egg], player: actor(760), coop: actor(1600, { coop: true }), coopEnabled: false,
    squadActors: [], walls: [], doors: [], covers: [], missionLevelBounds: { width: 6200, height: 1080 },
    random: () => 0.5, activeSquadActors() { return this.squadActors; },
    enemyMeleePathClearV64: () => true, closedDoorColliders: () => [],
    initializeEnemyMissionNavigation(enemy) { initialized.push(enemy.id); },
    onEvent(value) { events.push(value); },
    createEnemy(source, ...args) { createdSources.push(source); return GameEngine.prototype.createEnemy.call(this, source, ...args); }
  };
  const step = (delta) => updateOvomorphCycleV66(engine, egg, delta);
  const hatch = () => { step(0); step(1); step(0.5); };
  return { engine, egg, events, initialized, createdSources, step, hatch };
}

function saveEnemy(enemy) {
  return JSON.parse(JSON.stringify({
    id: enemy.id, x: enemy.x, y: enemy.y, alive: enemy.alive,
    health: enemy.health, deathClock: enemy.deathClock || 0,
    ...captureOvomorphCycleResumeV66(enemy)
  }));
}

test('le cycle ne traite que l Ovomorph standard V66, pas les variantes ou anciens oeufs', () => {
  for (const visualSheetId of [undefined, 'enemy.ovomorph.cycle', 'enemy.profile.enemy-053-albino-ovomorph.v66', contract.childSheetId]) {
    const enemy = { id: 'other', visualSheetId, alive: true, x: 5 };
    const previous = structuredClone(enemy);
    assert.equal(isOvomorphCycleV66(enemy), false);
    assert.equal(updateOvomorphCycleV66({}, enemy, 1), false);
    assert.equal(getOvomorphAnimationV66(enemy), null);
    assert.equal(releaseOvomorphFacehuggerV66({}, enemy), null);
    assert.equal(restoreOvomorphCycleResumeV66(enemy, {}), false);
    assert.deepEqual(captureOvomorphCycleResumeV66(enemy), {});
    assert.deepEqual(enemy, previous);
  }
});

test('sealed joue ses huit poses a6fps sans mouvement ni melee', () => {
  const { egg, engine, step } = fixture();
  engine.player.x = 3000;
  const frames = [];
  for (let index = 0; index < 16; index += 1) {
    frames.push(getOvomorphAnimationV66(egg).frame);
    step(1 / 6);
  }
  assert.deepEqual(frames, [0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7]);
  assert.equal(egg.x, 600);
  assert.equal(egg.y, 810);
  assert.equal(egg.vx, 0);
  assert.equal(egg.vy, 0);
  assert.equal(egg.attacking, false);
  assert.equal(engine.player.health, 100);
  assert.equal(engine.enemies.length, 1);
});

test('opening8@8 puis hatch8@10 libere un vrai Facehugger V65 exactement a la frame5', () => {
  const { egg, engine, events, initialized, createdSources, step } = fixture();
  step(0);
  assert.equal(egg.ovomorphCycleV66.phase, 'opening');
  const opening = [];
  for (let index = 0; index < 8; index += 1) {
    const animation = getOvomorphAnimationV66(egg);
    assert.equal(animation.clipId, 'opening');
    assert.equal(animation.fps, 8);
    opening.push(animation.cell);
    step(1 / 8);
  }
  assert.deepEqual(opening, [8, 9, 10, 11, 12, 13, 14, 15]);
  assert.equal(egg.ovomorphCycleV66.phase, 'hatch');
  const hatchFrames = [];
  for (let index = 0; index < 8; index += 1) {
    hatchFrames.push(getOvomorphAnimationV66(egg).cell);
    assert.equal(engine.enemies.length, index < 5 ? 1 : 2);
    step(0.1);
  }
  assert.deepEqual(hatchFrames, [16, 17, 18, 19, 20, 21, 22, 23]);
  const child = engine.enemies[1];
  assert.equal(isFacehuggerCombatV65(child), true);
  assert.equal(child.behavior, 'pouncer');
  assert.equal(child.id, getOvomorphChildIdV66(egg));
  assert.equal(child.ovomorphParentIdV66, egg.id);
  assert.equal(createdSources.length, 1);
  assert.equal(createdSources[0].id, 'enemy-002-facehugger');
  assert.equal(child.isBoss, false);
  assert.equal(child.keyCarrier, false);
  assert.ok(child.attackClock >= 0.35);
  assert.deepEqual(initialized, [child.id]);
  assert.equal(events.filter((entry) => entry.type === 'ovomorph-hatched').length, 1);
  assert.equal(egg.ovomorphCycleV66.phase, 'spent');
  assert.equal(getOvomorphAnimationV66(egg).cell, 23);
  assert.equal(getOvomorphAnimationV66(egg).loop, false);
  assert.equal(egg.attacking, false);
  assert.equal(engine.player.health, 100);
});

test('spent reste sur la derniere image et ne recrache rien meme si le premier enfant a ete tue puis retire', () => {
  const { egg, engine, events, step, hatch } = fixture();
  hatch();
  step(0.3);
  engine.enemies[1].alive = false;
  engine.enemies.splice(1, 1);
  for (let index = 0; index < 100; index += 1) step(1);
  assert.equal(engine.enemies.length, 1);
  assert.equal(egg.ovomorphCycleV66.spawned, true);
  assert.equal(getOvomorphAnimationV66(egg).cell, 23);
  assert.equal(events.filter((entry) => entry.type === 'ovomorph-hatched').length, 1);
});

test('un appel direct ne peut pas faire naitre avant hatch frame5', () => {
  const { engine, egg, step } = fixture();
  assert.equal(releaseOvomorphFacehuggerV66(engine, egg), null);
  step(0);
  assert.equal(releaseOvomorphFacehuggerV66(engine, egg), null);
  step(1);
  step(0.49);
  assert.equal(releaseOvomorphFacehuggerV66(engine, egg), null);
  assert.equal(engine.enemies.length, 1);
});

for (const beforeDeath of [[], [0], [0, 1, 0.49]]) {
  test(`detruire l oeuf avant la liberation (${JSON.stringify(beforeDeath)}) empeche toute naissance`, () => {
    const { engine, egg, events, step } = fixture();
    for (const delta of beforeDeath) step(delta);
    egg.alive = false;
    egg.health = 0;
    for (let index = 0; index < 5; index += 1) step(1);
    assert.equal(egg.ovomorphCycleV66.phase, 'destroyed');
    assert.equal(getOvomorphAnimationV66(egg).cell, 31);
    assert.equal(engine.enemies.length, 1);
    assert.equal(releaseOvomorphFacehuggerV66(engine, egg), null);
    assert.equal(events.some((entry) => entry.type === 'ovomorph-hatched'), false);
  });
}

test('la destruction joue ses huit cellules a10fps, pas une eclosion ou un retour vivant', () => {
  const { egg, step } = fixture();
  step(0);
  egg.alive = false;
  step(0);
  const cells = [];
  for (let index = 0; index < 8; index += 1) {
    const animation = getOvomorphAnimationV66(egg);
    assert.equal(animation.clipId, 'destroyed');
    assert.equal(animation.fps, 10);
    cells.push(animation.cell);
    step(0.1);
  }
  assert.deepEqual(cells, [24, 25, 26, 27, 28, 29, 30, 31]);
  step(1);
  assert.equal(getOvomorphAnimationV66(egg).cell, 31);
});

test('joueur, coop et escouade sont des declencheurs valides sans changer l espece enfant', () => {
  for (const role of ['player', 'coop', 'squad']) {
    const { engine, egg, hatch } = fixture();
    engine.player.x = 3000;
    if (role === 'player') engine.player.x = 760;
    if (role === 'coop') { engine.coopEnabled = true; engine.coop.x = 760; }
    if (role === 'squad') engine.squadActors = [actor(760, { squadMember: true, crewId: 'escort' })];
    hatch();
    assert.equal(egg.ovomorphCycleV66.spawned, true, role);
    assert.equal(engine.enemies[1].visualSheetId, contract.childSheetId);
  }
});

test('mort, conduit, etage different ou mur ferment la detection de proximite', () => {
  for (const hide of [
    (engine) => { engine.player.alive = false; },
    (engine) => { engine.player.downed = true; },
    (engine) => { engine.player.ventTransit = {}; },
    (engine) => { engine.player.y -= 200; },
    (engine) => { engine.walls = [{ x: 700, y: 750, w: 2, h: 200 }]; engine.enemyMeleePathClearV64 = GameEngine.prototype.enemyMeleePathClearV64; }
  ]) {
    const { engine, egg, step } = fixture();
    hide(engine);
    step(1);
    assert.equal(egg.ovomorphCycleV66.phase, 'sealed');
    assert.equal(engine.enemies.length, 1);
  }
});

test('une vraie paroi ne permet pas de faire naitre de l autre cote : le cote libre est choisi', () => {
  const { engine, egg, step } = fixture();
  step(0);
  step(1);
  engine.walls = [{ x: 672, y: 750, w: 4, h: 200 }];
  engine.enemyMeleePathClearV64 = GameEngine.prototype.enemyMeleePathClearV64;
  step(0.5);
  assert.equal(engine.enemies.length, 2);
  const child = engine.enemies[1];
  assert.ok(child.x + child.w < egg.x, 'l enfant emerge du cote gauche libre');
  assert.equal(child.y + child.h, egg.y + egg.h);
});

test('toutes sorties bloquees suspendent hatch frame5 sans enfant superpose puis reprennent une seule fois', () => {
  const { engine, egg, events, step } = fixture();
  step(0);
  step(1);
  engine.covers = [{ x: 400, y: 760, w: 700, h: 170, destroyed: false }];
  for (let index = 0; index < 10; index += 1) step(1);
  assert.equal(engine.enemies.length, 1);
  assert.equal(egg.ovomorphCycleV66.phase, 'hatch');
  assert.equal(egg.ovomorphCycleV66.spawned, false);
  assert.equal(egg.ovomorphCycleV66.releaseBlocked, true);
  assert.equal(getOvomorphAnimationV66(egg).frame, 21);
  assert.equal(getOvomorphAnimationV66(egg).localFrame, 5);
  assert.equal(events.some((entry) => entry.type === 'ovomorph-hatched'), false);
  engine.covers[0].destroyed = true;
  step(0.1);
  assert.equal(engine.enemies.length, 2);
  assert.equal(egg.ovomorphCycleV66.spawned, true);
  assert.equal(events.filter((entry) => entry.type === 'ovomorph-hatched').length, 1);
});

test('la naissance refuse une absence de surface de niveau ou une mauvaise plaque enfant', () => {
  for (const block of [
    (engine) => { engine.missionLevelRuntime = {}; engine.missionLevelSurfaceFor = () => null; },
    (engine) => { engine.createEnemy = () => ({ visualSheetId: 'placeholder', w: 52, h: 74 }); }
  ]) {
    const { engine, egg, hatch } = fixture();
    block(engine);
    hatch();
    assert.equal(engine.enemies.length, 1);
    assert.equal(egg.ovomorphCycleV66.spawned, false);
    assert.equal(egg.ovomorphCycleV66.phase, 'hatch');
  }
});

test('un callback d evenement reentrant ne cree jamais un deuxieme enfant', () => {
  const { engine, egg, hatch } = fixture();
  let hatchEvents = 0;
  engine.onEvent = (entry) => {
    if (entry.type === 'ovomorph-hatched') {
      hatchEvents += 1;
      releaseOvomorphFacehuggerV66(engine, egg);
    }
  };
  hatch();
  assert.equal(hatchEvents, 1);
  assert.equal(engine.enemies.length, 2);
});

test('le childId est deterministe, different entre oeufs et compatible avec la limite160 du save', () => {
  assert.equal(getOvomorphChildIdV66({}), null);
  assert.notEqual(getOvomorphChildIdV66({ id: 'egg:1' }), getOvomorphChildIdV66({ id: 'egg:2' }));
  for (const suffix of ['one', 'two']) {
    const egg = { id: 'a'.repeat(180) + suffix };
    const first = getOvomorphChildIdV66(egg);
    assert.equal(first, getOvomorphChildIdV66(egg));
    assert.ok(first.length <= 160);
  }
  assert.notEqual(getOvomorphChildIdV66({ id: 'a'.repeat(180) + 'one' }), getOvomorphChildIdV66({ id: 'a'.repeat(180) + 'two' }));
});

test('reprise avant eclosion preserve le curseur sans dupliquer la liberation', () => {
  const original = fixture();
  original.step(0);
  original.step(1);
  original.step(0.49);
  const saved = saveEnemy(original.egg);
  const resumed = fixture();
  assert.equal(prepareOvomorphResumeChildrenV66(resumed.engine, [saved]), 0);
  restoreOvomorphCycleResumeV66(resumed.egg, saved);
  assert.equal(resumed.egg.ovomorphCycleV66.elapsed, 0.49);
  resumed.step(0.01);
  assert.equal(resumed.engine.enemies.length, 2);
  resumed.step(1);
  resumed.step(1);
  assert.equal(resumed.engine.enemies.length, 2);
});

for (const alive of [true, false]) {
  test(`reprise apres liberation reconstruit un seul enfant ${alive ? 'vivant' : 'mort'} sans evenement ni resurrection`, () => {
    const original = fixture();
    original.hatch();
    original.step(0.3);
    const child = original.engine.enemies[1];
    child.alive = alive;
    child.health = alive ? 18 : 0;
    const saved = original.engine.enemies.map(saveEnemy);
    const resumed = fixture();
    assert.equal(prepareOvomorphResumeChildrenV66(resumed.engine, [...saved, saved[1]]), 1);
    assert.equal(prepareOvomorphResumeChildrenV66(resumed.engine, saved), 0);
    restoreOvomorphCycleResumeV66(resumed.egg, saved[0]);
    resumed.step(1);
    assert.equal(resumed.engine.enemies.length, 2);
    assert.equal(resumed.engine.enemies[1].alive, alive);
    assert.equal(resumed.engine.enemies[1].health, alive ? 18 : 0);
    assert.equal(resumed.engine.enemies[1].facehuggerAttackV65, null);
    assert.equal(resumed.events.some((entry) => entry.type === 'ovomorph-hatched'), false);
    assert.equal(getOvomorphAnimationV66(resumed.egg).cell, 23);
  });
}

test('un save spent sans fiche enfant ne fait pas renaitre un ennemi deja retire', () => {
  const original = fixture();
  original.hatch();
  original.step(0.3);
  const saved = saveEnemy(original.egg);
  const resumed = fixture();
  prepareOvomorphResumeChildrenV66(resumed.engine, [saved]);
  restoreOvomorphCycleResumeV66(resumed.egg, saved);
  resumed.step(1);
  assert.equal(resumed.engine.enemies.length, 1);
});

test('un enfant forge, mauvais parent ou absence de preuve de liberation est refuse', () => {
  const original = fixture();
  original.hatch();
  const [parent, child] = original.engine.enemies.map(saveEnemy);
  const cases = [
    [{ ...parent, ovomorphCycleV66: { phase: 'sealed', spawned: false } }, child],
    [{ ...parent, ovomorphCycleV66: { phase: 'hatch', spawned: 'true' } }, child],
    [parent, { ...child, id: 'injected-facehugger' }],
    [parent, { ...child, ovomorphParentIdV66: 'missing-parent' }],
    [child]
  ];
  for (const saved of cases) {
    const resumed = fixture();
    assert.equal(prepareOvomorphResumeChildrenV66(resumed.engine, saved), 0);
    assert.equal(resumed.engine.enemies.length, 1);
  }
});

test('restauration borne phase et elapsed, ignore childId forge et ne ressuscite pas un oeuf mort', () => {
  for (const [saved, expected] of [
    [{ phase: 'garbage', elapsed: Infinity }, ['sealed', 0, false]],
    [{ phase: 'opening', elapsed: 99 }, ['opening', 1, false]],
    [{ phase: 'hatch', elapsed: 99 }, ['hatch', 0.5, false]],
    [{ phase: 'spent', elapsed: -9, spawned: false }, ['spent', 0.8, true]],
    [{ phase: 'sealed', elapsed: 0, spawned: true }, ['spent', 0.8, true]],
    [{ phase: 'destroyed', elapsed: 99 }, ['destroyed', 0.8, false]]
  ]) {
    const { egg } = fixture();
    restoreOvomorphCycleResumeV66(egg, { ovomorphCycleV66: { ...saved, childId: 'forged' } });
    assert.deepEqual([egg.ovomorphCycleV66.phase, egg.ovomorphCycleV66.elapsed, egg.ovomorphCycleV66.spawned], expected);
    assert.equal(egg.ovomorphCycleV66.childId, getOvomorphChildIdV66(egg));
    if (saved.phase === 'destroyed') assert.equal(egg.alive, false);
  }
  const { egg, step, engine } = fixture();
  egg.alive = false;
  restoreOvomorphCycleResumeV66(egg, { ovomorphCycleV66: { phase: 'sealed', elapsed: 0 } });
  step(1);
  assert.equal(egg.alive, false);
  assert.equal(egg.ovomorphCycleV66.phase, 'destroyed');
  assert.equal(engine.enemies.length, 1);
});

test('dormance, conduit et brouillage bloquent l ouverture, les deltas invalides ne corrompent pas la phase', () => {
  const { egg, step } = fixture();
  for (const flag of ['dormant', 'ventTransit', 'jammedClock']) {
    egg[flag] = 1;
    step(1);
    assert.equal(egg.ovomorphCycleV66.phase, 'sealed');
    egg[flag] = 0;
  }
  step(0);
  for (const delta of [NaN, Infinity, -1, undefined]) step(delta);
  assert.equal(egg.ovomorphCycleV66.phase, 'opening');
  assert.equal(egg.ovomorphCycleV66.elapsed, 0);
});

test('le rendu de mort suit deathClock V51 meme avant la premiere update de l oeuf detruit', () => {
  const { egg, step } = fixture();
  step(0);
  step(0.9);
  egg.alive = false;
  egg.deathClock = 2.8;
  assert.equal(getOvomorphAnimationV66(egg).frame, 24);
  egg.deathClock = 2.3;
  assert.equal(getOvomorphAnimationV66(egg).frame, 29);
  egg.deathClock = 0;
  assert.equal(getOvomorphAnimationV66(egg).frame, 31);
});

test('aucune sortie ne superpose un Facehugger au joueur, coop ou membre d escouade', () => {
  const { engine, egg, hatch, step } = fixture();
  engine.player.x = 676;
  engine.coopEnabled = true;
  engine.coop.x = 542;
  engine.squadActors = [actor(609, { squadMember: true, crewId: 'blocking-escort' })];
  hatch();
  assert.equal(egg.ovomorphCycleV66.releaseBlocked, true);
  assert.equal(engine.enemies.length, 1);
  engine.player.x = 850;
  step(0.1);
  assert.equal(engine.enemies.length, 2);
  assert.equal(engine.enemies[1].x, 676);
});

test('le bord gauche du monde ne fait jamais apparaitre l enfant a une position negative', () => {
  const { engine, egg, hatch } = fixture();
  egg.x = 0;
  engine.player.x = 160;
  hatch();
  assert.equal(engine.enemies.length, 2);
  const child = engine.enemies[1];
  assert.ok(child.x >= 0 && child.x + child.w <= engine.missionLevelBounds.width);
});
