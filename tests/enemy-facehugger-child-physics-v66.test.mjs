import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMIES } from '../src/content-core-v50.js';
import { GameEngine } from '../src/game-v51-runtime.js';
import { SPRITE_HITBOXES, SPRITE_SHEETS } from '../src/sprite-animation-runtime.js';
import { moveFacehuggerHorizontallyV65 } from '../src/enemy-facehugger-combat-v65.js';
import {
  OVOMORPH_CYCLE_V66 as contract,
  releaseOvomorphFacehuggerV66
} from '../src/enemy-ovomorph-cycle-v66.js';

const source = ENEMIES.find((entry) => entry.id === contract.childProfileId);
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function fixture(clearance = 30) {
  // Use real factory, static-collider and swept-movement methods without a
  // browser, asset loading, or stubbing the collision verdict itself.
  const engine = Object.assign(Object.create(GameEngine.prototype), {
    random: () => 0.5, walls: [], doors: [], covers: [], squadActors: [],
    player: null, coopEnabled: false,
    missionLevelBounds: { width: 6200, height: 1080 },
    activeSquadActors() { return this.squadActors; }, onEvent() {}
  });
  const egg = {
    id: 'enemy-001-ovomorph:physical-child-fixture', name: 'Ovomorph',
    visualSheetId: contract.sheetId, x: 600, y: 810, w: 70, h: 120,
    alive: true, health: 100, maxHealth: 100, facing: 1,
    ovomorphCycleV66: { phase: 'hatch', elapsed: contract.releaseTime, spawned: false }
  };
  const ceiling = { id: 'low-ceiling', x: egg.x + egg.w + 6, y: 850, w: 150, h: 930 - clearance - 850 };
  engine.walls = [ceiling];
  engine.enemies = [egg];
  return { engine, egg, ceiling };
}

function assertPhysicalFacehugger(child, floor = 930) {
  const sheet = SPRITE_SHEETS[contract.childSheetId];
  const body = SPRITE_HITBOXES[sheet.hitbox];
  assert.equal(child.visualSheetId, contract.childSheetId);
  assert.equal(child.w, body.width * sheet.renderWidth / sheet.cellWidth);
  assert.equal(child.h, body.height * sheet.renderHeight / sheet.cellHeight);
  assert.equal(child.w, 78.75, 'la largeur physique vient du hitbox dédié, pas du fallback xénomorphe 52px');
  assert.equal(child.h, 27.5625, 'la hauteur physique vient du hitbox dédié, pas du fallback xénomorphe 74px');
  assert.equal(child.y + child.h, floor);
  assert.equal(child.groundY, floor);
}

test('le factory du Facehugger standard utilise le vrai corps V65 et conserve son ancre au sol', () => {
  const { engine } = fixture();
  const child = engine.createEnemy(source, 1, 676, 930);
  assertPhysicalFacehugger(child);
});

test('un enfant réel éclot et avance sous 30px libres, puis sa vraie largeur bloque une paroi de 2px', () => {
  const { engine, egg, ceiling } = fixture(30);
  assert.equal(overlaps(egg, ceiling), false, 'le plafond commence après la salle de l’œuf');
  const child = releaseOvomorphFacehuggerV66(engine, egg);
  assert.ok(child);
  assertPhysicalFacehugger(child);
  assert.equal(child.ovomorphParentIdV66, egg.id);
  assert.equal(child.x, ceiling.x, 'la place prévue sous le plafond est réellement retenue');
  assert.equal(overlaps(child, ceiling), false);
  assert.equal(engine.enemies.filter((entry) => entry === child).length, 1);
  assert.equal(egg.ovomorphCycleV66.spawned, true);

  const clearMotion = moveFacehuggerHorizontallyV65(engine, child, 12);
  assert.deepEqual(clearMotion, { travelled: 12, blocked: false });
  assert.equal(overlaps(child, ceiling), false);
  const wall = { id: 'child-thin-wall', x: child.x + child.w + 14, y: 900, w: 2, h: 30 };
  engine.walls.push(wall);
  assert.ok(child.x + child.w < wall.x);
  const stopped = moveFacehuggerHorizontallyV65(engine, child, 92);
  assert.deepEqual(stopped, { travelled: 14, blocked: true });
  assert.equal(child.x + child.w, wall.x);
  assert.equal(overlaps(child, wall), false);
  assert.equal(overlaps(child, ceiling), false);
  assertPhysicalFacehugger(child);
});

test('27px libres refusent cette place et utilisent le côté réellement dégagé, sans traverser le plafond', () => {
  const { engine, egg, ceiling } = fixture(27);
  const child = releaseOvomorphFacehuggerV66(engine, egg);
  assert.ok(child);
  assertPhysicalFacehugger(child);
  assert.equal(child.x, egg.x - child.w - 6);
  assert.equal(overlaps(child, ceiling), false);
  assert.ok(child.h > 27);
  assert.equal(overlaps({ ...child, x: ceiling.x }, ceiling), true, 'la place initiale échoue sur sa hauteur physique réelle');
});
