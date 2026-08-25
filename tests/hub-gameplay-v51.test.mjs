import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  HubGame,
  HUB_DECKS,
  HUB_MODULAR_ASSETS,
  HUB_TRAVERSAL_ART_FILES,
  HUB_WORLD,
  compileShipProject
} from '../src/hub-v51-runtime.js';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const assetFile = (publicUrl) => resolve(repoRoot, publicUrl.replace(/^\//, ''));

class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
  set src(value) { this.currentSrc = value; }
}

function mockContext({ drawCalls = [], fillRects = [] } = {}) {
  const gradient = { addColorStop() {} };
  const base = {
    measureText: (text) => ({ width: String(text).length * 8 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient,
    drawImage: (...args) => drawCalls.push(args),
    fillRect: (...args) => fillRects.push(args)
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
  assert.equal(compiled.platforms[0].art, 'catwalk');
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

test('each profiled Tantalus deck keeps physical props and exposes a non-flat fallback route', () => withRuntime(() => {
  let firstHub = null;
  for (const [deckIndex, deck] of HUB_DECKS.entries()) {
    const canvas = { width: 1280, height: 720, getContext: () => mockContext(), addEventListener() {} };
    const hub = new HubGame(canvas);
    hub.start({ deck: deckIndex, roomId: deck.rooms[0].id, positionX: 180 });
    if (!firstHub) firstHub = hub;
    const snapshot = hub.getSnapshot();
    assert.ok(deck.rooms.every((room) => room.profile?.authoredCollision), `${deck.id}: authored room collision remains enabled`);

    assert.equal(snapshot.editorPlaytest, false);
    assert.equal(snapshot.platformCount, 8, `${deck.id}: two platforms per room`);
    assert.equal(snapshot.ladderCount, 8, `${deck.id}: two ladders per room`);
    assert.equal(snapshot.ventCount, 4, `${deck.id}: one vent per room`);
    assert.equal(snapshot.obstacleCount, 4, `${deck.id}: authored prop collisions stay active`);
    assert.deepEqual(
      {
        source: snapshot.route.source,
        verticalLinks: snapshot.route.verticalLinks,
        crawlLinks: snapshot.route.crawlLinks,
        nodeCount: snapshot.route.nodeCount
      },
      { source: 'fallback', verticalLinks: 8, crawlLinks: 4, nodeCount: 12 },
      `${deck.id}: the normal hub route must never collapse to a flat room-profile route`
    );

    for (const room of deck.rooms) {
      const platforms = hub.v51Platforms.filter((entry) => entry.roomId === room.id);
      const ladders = hub.v51Ladders.filter((entry) => entry.roomId === room.id);
      const vents = hub.v51Vents.filter((entry) => entry.roomId === room.id);
      assert.equal(platforms.length, 2, `${room.id}: platforms`);
      assert.equal(ladders.length, 2, `${room.id}: ladders`);
      assert.equal(vents.length, 1, `${room.id}: vent`);
      assert.deepEqual(platforms.map((entry) => entry.art), ['catwalk', 'drop'], `${room.id}: two bitmap surface families`);
      assert.equal(new Set(platforms.map((entry) => entry.y)).size, 2, `${room.id}: distinct vertical tiers`);
      assert.ok(platforms.every((entry) => entry.y < HUB_WORLD.floorY), `${room.id}: elevated surfaces`);
      const lower = platforms.reduce((candidate, platform) => platform.y > candidate.y ? platform : candidate);
      const upper = platforms.reduce((candidate, platform) => platform.y < candidate.y ? platform : candidate);
      const floorLadder = ladders.find((entry) => entry.top === lower.y && entry.bottom === HUB_WORLD.floorY);
      const tierLadder = ladders.find((entry) => entry.top === upper.y && entry.bottom === lower.y);
      assert.ok(floorLadder, `${room.id}: floor reaches lower tier`);
      assert.ok(tierLadder, `${room.id}: lower tier reaches upper tier`);
      assert.ok(floorLadder.x >= lower.x && floorLadder.x <= lower.x + lower.w, `${room.id}: lower landing aligned`);
      assert.ok(tierLadder.x >= lower.x && tierLadder.x <= lower.x + lower.w, `${room.id}: tier departure aligned`);
      assert.ok(tierLadder.x >= upper.x && tierLadder.x <= upper.x + upper.w, `${room.id}: upper landing aligned`);
      assert.equal(vents[0].y + vents[0].h, platforms.find((entry) => entry.art === 'drop').y, `${room.id}: vent reaches upper tier`);
    }
  }

  const obstacle = firstHub.obstacles[0];
  const previousX = obstacle.x - firstHub.player.w - 2;
  Object.assign(firstHub.player, { x: obstacle.x - firstHub.player.w + 4, y: HUB_WORLD.floorY - firstHub.player.h, vx: 120, crouching: false });
  firstHub.resolveHorizontal(previousX);
  assert.equal(firstHub.player.x, obstacle.x - firstHub.player.w, 'the visible interaction prop still owns its collision');
}));

test('hub traversal bitmaps are preloaded, counted and replace rectangle route rendering', () => withRuntime(() => {
  const trace = { drawCalls: [], fillRects: [] };
  const context = mockContext(trace);
  const canvas = { width: 1280, height: 720, getContext: () => context, addEventListener() {} };
  const hub = new HubGame(canvas);
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 });
  const report = hub.getAssetReport();
  const snapshot = hub.getSnapshot();

  assert.equal(report.traversalArtCount, 4);
  assert.equal(report.traversalArtReady, 4);
  assert.equal(snapshot.traversalArtCount, 4);
  assert.equal(snapshot.traversalArtReady, 4);
  assert.equal(report.modularAssetCount, HUB_MODULAR_ASSETS.length);
  assert.ok(report.readyAssetCount >= report.traversalArtReady);
  for (const source of Object.values(HUB_TRAVERSAL_ART_FILES)) {
    assert.ok(HUB_MODULAR_ASSETS.includes(source), `${source}: counted as modular hub art`);
    assert.ok(existsSync(assetFile(source)), `${source}: bitmap exists`);
    assert.ok([...hub.traversalImages.values()].some((image) => image.currentSrc === source), `${source}: preloaded`);
  }

  trace.drawCalls.length = 0;
  trace.fillRects.length = 0;
  hub.drawTraversal(context);
  const drawnSources = new Set(trace.drawCalls.map((call) => call[0]?.currentSrc).filter(Boolean));
  assert.ok(Object.values(HUB_TRAVERSAL_ART_FILES).every((source) => drawnSources.has(source)), 'all traversal families render from bitmaps');
  assert.equal(trace.fillRects.length, 0, 'normal hub traversal no longer renders prototype rectangles');
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
