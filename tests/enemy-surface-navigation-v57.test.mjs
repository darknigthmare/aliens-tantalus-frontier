import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine as ProductionCoreEngine } from '../src/game-production-core.js';
import { withV52MissionRuntime } from '../src/game-v52-runtime.js';
import { withV52LevelRuntime } from '../src/game-v52-level-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import {
  CAMPAIGNS,
  CREW,
  ENEMIES,
  EQUIPMENT,
  LEVEL_SEEDS,
  VEHICLES,
  WEAPONS,
  WORLDS
} from '../src/content.js';

const RuntimeEngine = withV52LevelRuntime(withV52MissionRuntime(ProductionCoreEngine));

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1600;
    this.naturalHeight = 900;
  }

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

function buildPlan(templateId, variant = 2) {
  const world = templateId === 'ship-interior-vertical' ? (WORLDS[6] || WORLDS[0]) : WORLDS[0];
  const sourceCampaign = templateId === 'ship-interior-vertical' ? CAMPAIGNS[0] : (CAMPAIGNS[1] || CAMPAIGNS[0]);
  const campaign = {
    ...sourceCampaign,
    id: `v57-enemy-navigation-${templateId}`,
    worldId: world.id,
    objective: sourceCampaign.objective || 'secure the mission area'
  };
  return buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId, variant });
}

function startEngine(templateId, variant = 2) {
  const plan = buildPlan(templateId, variant);
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  const engine = new RuntimeEngine(canvas, { onEvent: () => {} });
  engine.start({
    seed: plan.levelSeed.seed,
    campaign: plan.campaign,
    world: plan.world,
    levelSeed: plan.levelSeed,
    missionLevel: plan,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES,
    vehicle: VEHICLES.find((entry) => entry.family === 'ground') || VEHICLES[0],
    equipment: EQUIPMENT.slice(0, 8),
    crew: CREW,
    difficulty: 'standard'
  });
  return { engine, plan };
}

function nodeById(plan, id) {
  const node = plan.graph.nodes.find((entry) => entry.id === id);
  assert.ok(node, `nœud ${id} présent`);
  return node;
}

function placeOnNode(actor, node) {
  actor.x = node.x - actor.w / 2;
  actor.y = node.y - actor.h;
  actor.vx = 0;
  actor.vy = 0;
  actor.groundY = node.y;
  actor.grounded = true;
}

function isolateEnemy(engine, { boss = false } = {}) {
  const enemy = boss
    ? engine.enemies.find((candidate) => candidate.isBoss)
    : engine.enemies.find((candidate) => !candidate.isBoss);
  assert.ok(enemy, boss ? 'boss disponible' : 'ennemi standard disponible');
  for (const candidate of engine.enemies) candidate.alive = candidate === enemy;
  enemy.alive = true;
  enemy.dormant = false;
  enemy.behavior = 'warrior';
  enemy.revealed = 0;
  return enemy;
}

function simulate(engine, enemy, seconds, observe = () => {}) {
  const delta = 1 / 30;
  const frames = Math.ceil(seconds / delta);
  for (let frame = 0; frame < frames; frame += 1) {
    engine.animationTime += delta;
    engine.updateLifts(delta);
    engine.updateEnemy(enemy, delta);
    observe(enemy, frame);
  }
}

test('ship et colony gardent chaque ennemi sur une surface jouable au bord du vide', () => withBrowserMocks(() => {
  const cases = [
    { templateId: 'ship-interior-vertical', nodeId: 'ship-dock-high' },
    { templateId: 'colony-multiroute', nodeId: 'colony-gate-high' }
  ];
  for (const entry of cases) {
    const { engine, plan } = startEngine(entry.templateId);
    const enemy = isolateEnemy(engine);
    const node = nodeById(plan, entry.nodeId);
    const platform = engine.platforms.find((candidate) => candidate.id === `node-platform-${entry.nodeId}`);
    assert.ok(platform, `${entry.templateId}: plateforme de test`);
    enemy.x = platform.x - enemy.w / 2 + 3;
    enemy.y = platform.y - enemy.h;
    enemy.spawnX = enemy.x;
    enemy.alert = false;
    enemy.animationPhase = 0;
    engine.animationTime = 0;
    placeOnNode(engine.player, plan.anchors.extraction);
    engine.initializeEnemyMissionNavigation(enemy);
    simulate(engine, enemy, 6, (candidate) => {
      assert.ok(engine.missionLevelSurfaceFor(candidate, { tolerance: 42 }), `${entry.templateId}: support conservé à chaque frame`);
    });
    assert.ok(enemy.x + enemy.w / 2 >= platform.x - 2, `${entry.templateId}: aucune marche dans le vide à gauche`);
  }
}));

test('un ennemi du vaisseau rejoint et emprunte le lift réel pour changer de pont', () => withBrowserMocks(() => {
  const { engine, plan } = startEngine('ship-interior-vertical');
  const enemy = isolateEnemy(engine);
  placeOnNode(enemy, nodeById(plan, 'ship-dock'));
  placeOnNode(engine.player, nodeById(plan, 'ship-dock-high'));
  enemy.alert = true;
  engine.initializeEnemyMissionNavigation(enemy);
  let usedLift = false;
  let rodeLift = false;
  simulate(engine, enemy, 12, (candidate) => {
    usedLift ||= candidate.levelNavigation?.connectorId === 'ship-e14';
    rodeLift ||= Boolean(candidate.levelNavigation?.riding);
  });
  assert.equal(usedLift, true, 'le lift ship-e14 est sélectionné');
  assert.equal(rodeLift, true, 'l’ennemi monte physiquement sur la plateforme mobile');
  assert.ok(Math.abs(enemy.y + enemy.h - nodeById(plan, 'ship-dock-high').y) <= 42, 'l’ennemi atteint le pont supérieur');
  assert.ok(engine.missionLevelSurfaceFor(enemy, { tolerance: 42 }), 'l’ennemi débarque sur une surface jouable');
}));

test('un ennemi de colonie atteint un étage supérieur par une échelle, sans téléportation', () => withBrowserMocks(() => {
  const { engine, plan } = startEngine('colony-multiroute', 3);
  const enemy = isolateEnemy(engine);
  placeOnNode(enemy, nodeById(plan, 'colony-gate'));
  placeOnNode(engine.player, nodeById(plan, 'colony-gate-high'));
  enemy.alert = true;
  engine.initializeEnemyMissionNavigation(enemy);
  let usedLadder = false;
  let maximumFrameRise = 0;
  let previousY = enemy.y;
  simulate(engine, enemy, 5, (candidate) => {
    usedLadder ||= candidate.levelNavigation?.connectorId === 'colony-e08' || candidate.levelNavigation?.mode === 'ladder';
    maximumFrameRise = Math.max(maximumFrameRise, Math.abs(candidate.y - previousY));
    previousY = candidate.y;
  });
  assert.equal(usedLadder, true, 'l’échelle colony-e08 est empruntée');
  assert.ok(maximumFrameRise <= 6, `montée progressive attendue, saut observé ${maximumFrameRise}`);
  assert.ok(Math.abs(enemy.y + enemy.h - nodeById(plan, 'colony-gate-high').y) <= 42, 'l’ennemi atteint la passerelle haute');
  assert.ok(engine.missionLevelSurfaceFor(enemy, { tolerance: 42 }), 'l’ennemi termine sur une surface jouable');
}));

test('le boss mission détecte sa cible par portée et tous les spawns respectent les bounds du plan', () => withBrowserMocks(() => {
  for (const templateId of ['ship-interior-vertical', 'colony-multiroute']) {
    const { engine, plan } = startEngine(templateId);
    assert.ok(engine.enemies.every((enemy) => enemy.x >= 0 && enemy.x + enemy.w <= plan.dimensions.width), `${templateId}: bornes horizontales du plan`);
    assert.ok(engine.enemies.filter((enemy) => enemy.alive).every((enemy) => enemy.groundY <= plan.dimensions.height), `${templateId}: aucun spawn sur l’ancien FLOOR_Y`);
  }

  const { engine, plan } = startEngine('colony-multiroute');
  const boss = isolateEnemy(engine, { boss: true });
  const security = nodeById(plan, 'colony-security');
  placeOnNode(boss, security);
  engine.initializeEnemyMissionNavigation(boss);
  placeOnNode(engine.player, { x: security.x - 500, y: security.y });
  boss.alert = false;
  engine.updateEnemy(boss, 1 / 30);
  assert.equal(boss.alert, true, 'détection active à moins de 640 unités, indépendamment de la position absolue');
}));
