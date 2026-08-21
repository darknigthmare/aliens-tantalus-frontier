import test from 'node:test';
import assert from 'node:assert/strict';
import { HubGame, compileShipProject, HUB_WORLD } from '../src/hub-v51-runtime.js';

class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
  set src(value) { this.currentSrc = value; }
}

function mockContext() {
  const gradient = { addColorStop() {} };
  const base = {
    measureText: (text) => ({ width: String(text).length * 8 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient
  };
  return new Proxy(base, { get: (target, key) => key in target ? target[key] : () => {}, set: (target, key, value) => { target[key] = value; return true; } });
}

function withRuntime(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    performance: globalThis.performance
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  globalThis.performance = { now: () => 1000 };
  try { return run(); }
  finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
    globalThis.performance = previous.performance;
  }
}

const completeProject = {
  schema: 1,
  kind: 'ship',
  size: [8, 6],
  tiles: [
    ...Array.from({ length: 8 }, (_, col) => ({ position: `${col}:5`, type: 'floor' })),
    { position: '1:3', type: 'platform' },
    { position: '2:4', type: 'wall' },
    { position: '3:4', type: 'door' },
    { position: '4:4', type: 'vent' },
    { position: '1:3', type: 'ladder' },
    { position: '1:4', type: 'ladder' },
    { position: '6:3', type: 'lift' },
    { position: '6:4', type: 'lift' },
    { position: '0:4', type: 'spawn' },
    { position: '7:4', type: 'objective' },
    { position: '5:4', type: 'enemy', enemyType: 'synthetic' },
    { position: '2:3', type: 'terminal' },
    { position: '4:5', type: 'hazard' }
  ]
};

test('compileShipProject converts every Forge ship tile into runtime geometry', () => {
  const compiled = compileShipProject(completeProject);
  assert.equal(compiled.editorPlaytest, true);
  assert.deepEqual(compiled.grid.cols, 8);
  assert.equal(compiled.floors.length, 8);
  assert.equal(compiled.platforms.length, 1);
  assert.equal(compiled.walls.length, 1);
  assert.equal(compiled.doors.length, 1);
  assert.equal(compiled.vents.length, 1);
  assert.equal(compiled.ladders.length, 1, 'contiguous ladder cells become one climb volume');
  assert.equal(compiled.lifts.length, 1, 'contiguous lift cells become one vertical link');
  assert.ok(compiled.spawn);
  assert.equal(compiled.objectives.length, 1);
  assert.equal(compiled.enemies[0].kind, 'synthetic');
  assert.equal(compiled.terminals.length, 1);
  assert.equal(compiled.hazards.length, 1);
  assert.deepEqual(
    { verticalLinks: compiled.route.verticalLinks, crawlLinks: compiled.route.crawlLinks, objectiveCount: compiled.route.objectiveCount },
    { verticalLinks: 2, crawlLinks: 1, objectiveCount: 1 }
  );
  assert.equal(compileShipProject({ kind: 'mission', tiles: [] }), null);
});

test('fallback Tantalus decks expose vertical routes and crouch-only vents', () => withRuntime(() => {
  const canvas = { width: 1280, height: 720, getContext: mockContext, addEventListener() {} };
  const hub = new HubGame(canvas);
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 });
  const snapshot = hub.getSnapshot();
  assert.equal(snapshot.editorPlaytest, false);
  assert.ok(snapshot.platformCount >= 8);
  assert.ok(snapshot.ladderCount >= 8);
  assert.ok(snapshot.ventCount >= 4);
  assert.equal(snapshot.route.source, 'fallback');

  const ladder = hub.v51Ladders[0];
  Object.assign(hub.player, { x: ladder.x - hub.player.w / 2, y: ladder.bottom - hub.player.h, grounded: true, climbing: false, vx: 0, vy: 0 });
  hub.keys.add('KeyW');
  hub.update(0.08);
  hub.keys.delete('KeyW');
  assert.equal(hub.player.climbing, true);
  assert.ok(hub.player.y < ladder.bottom - hub.player.h);

  const vent = hub.v51Vents[0];
  Object.assign(hub.player, { x: vent.x + 4, y: vent.y + vent.h - hub.player.h, vx: 120, crouching: false });
  hub.resolveHorizontal(vent.x - hub.player.w);
  assert.equal(hub.player.x, vent.x - hub.player.w, 'standing player is stopped by the conduit lip');
  Object.assign(hub.player, { x: vent.x + 4, vx: 120, crouching: true });
  hub.resolveHorizontal(vent.x - hub.player.w);
  assert.equal(hub.player.x, vent.x + 4, 'crouching player traverses the conduit');
}));

test('ship playtest runs editor enemies, hazards, objectives and a persistent crisis', () => withRuntime(() => {
  const actions = [];
  const persisted = [];
  const canvas = { width: 1280, height: 720, getContext: mockContext, addEventListener() {} };
  const hub = new HubGame(canvas, { onAction: (event) => actions.push(event), onPersist: (patch) => persisted.push(patch) });
  hub.start({ activeCrisis: { id: 'quarantine-breach', kind: 'pathogen', count: 1 } }, { editorProject: completeProject });
  let snapshot = hub.getSnapshot();
  assert.equal(snapshot.editorPlaytest, true);
  assert.equal(snapshot.runtimeDoorCount, 1);
  assert.equal(snapshot.hazardCount, 1);
  assert.equal(snapshot.objectiveCount, 1);
  assert.equal(snapshot.crisisActive, true);
  assert.equal(snapshot.threats, 2, 'one editor enemy plus one crisis enemy');

  hub.setControl('fire', true);
  assert.equal(hub.projectiles.length, 1, 'tactile fire uses the same projectile runtime');
  const crisisEnemy = hub.enemies.find((enemy) => enemy.source === 'crisis');
  crisisEnemy.health = 1;
  hub.projectiles = [{ x: crisisEnemy.x, y: crisisEnemy.y, w: crisisEnemy.w, h: crisisEnemy.h, vx: 0, damage: 99, life: 1 }];
  hub.updateCombat(0.016);
  assert.ok(actions.some((event) => event.action === 'crisis:resolved'));
  assert.ok(persisted.some((patch) => patch.activeCrisis === null));

  const healthBefore = hub.player.health;
  const hazard = hub.v51Hazards[0];
  Object.assign(hub.player, { x: hazard.x, y: hazard.y, invulnerability: 0 });
  hub.updateEditorGameplay(0.6);
  assert.ok(hub.player.health < healthBefore, 'hazard tiles deal real damage');

  const objective = hub.v51Objectives[0];
  Object.assign(hub.player, { x: objective.x, y: objective.y, invulnerability: 0 });
  hub.updateEditorGameplay(0.1);
  assert.ok(actions.some((event) => event.action === 'editor:objective-complete'));
  snapshot = hub.getSnapshot();
  assert.equal(snapshot.route.source, 'editor');
  assert.equal(snapshot.health, Math.round(hub.player.health));
}));
