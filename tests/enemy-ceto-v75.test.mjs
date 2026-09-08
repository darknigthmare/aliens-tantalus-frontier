import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-v51-runtime.js';
import { GameEngine as ProductionCoreEngine } from '../src/game-production-core.js';
import { withV52MissionRuntime } from '../src/game-v52-runtime.js';
import { withV52LevelRuntime } from '../src/game-v52-level-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import {
  CETO_V75,
  containsCetoBodyV75,
  getCetoAnimationV75,
  isCetoV75,
  moveCetoWithinHabitatV75,
  updateCetoV75
} from '../src/enemy-ceto-v75.js';
import {
  SPRITE_HITBOXES,
  SPRITE_PIVOTS,
  SpriteAnimationController,
  resolveEnemyAnimation,
  resolveSpriteSheet
} from '../src/sprite-animation-runtime.js';
import { CAMPAIGNS, CREW, ENEMIES, EQUIPMENT, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS } from '../src/content.js';

const RuntimeEngine = withV52LevelRuntime(withV52MissionRuntime(ProductionCoreEngine));
const cetoWorld = WORLDS.find((entry) => entry.id === 'world-10-ceto');
const otherWorld = WORLDS.find((entry) => entry.id !== cetoWorld.id);

function buildPlan(world = cetoWorld, templateId = 'planet-exterior') {
  const campaign = {
    ...CAMPAIGNS[0], id: `v75-ceto-${world.id}-${templateId}`,
    worldId: world.id, objective: 'survey the tidal caves', mode: 'FRONTIER'
  };
  return buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId, variant: 75 });
}

function createCeto(x = 100, groundY = 200) {
  const engine = { random: () => 0.5, createEnemy: GameEngine.prototype.createEnemy };
  const source = ENEMIES.find((entry) => entry.id === CETO_V75.profileId);
  assert.ok(source);
  return engine.createEnemy(source, 0, x, groundY);
}

function combatFixture({ enemyX = 100, playerX = 340, wall = null } = {}) {
  const volume = { id: 'test-ceto-water', kind: 'water', active: true, x: 0, y: 0, w: 1000, h: 300 };
  const enemy = createCeto(enemyX, 200);
  enemy.cetoHabitatId = volume.id;
  enemy.attackClock = 0;
  const player = { id: 'marine', x: playerX, y: 108, w: 42, h: 92, alive: true, downed: false, lost: false, health: 100 };
  const events = [];
  const engine = {
    missionLevelRuntime: { aquaticHabitats: [volume] }, player, coop: null, coopEnabled: false,
    squadActors: [], walls: wall ? [wall] : [], doors: [], covers: [], platforms: [], enemies: [enemy],
    activeSquadActors() { return this.squadActors; },
    damagePlayer(target, damage) { target.health -= damage; },
    damageSquadMember(target, damage) { target.health -= damage; },
    damageVehicle() { throw new Error('vehicle damage not expected'); },
    onEvent(event) { events.push(event); }
  };
  return { engine, enemy, player, volume, events };
}

function withBrowserMocks(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  class MockImage {
    constructor() { this.complete = true; this.naturalWidth = 1600; this.naturalHeight = 900; }
    set src(value) { this.currentSrc = value; }
  }
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try { return run(); } finally { Object.assign(globalThis, previous); }
}

function optionsFor(plan) {
  return {
    seed: plan.levelSeed.seed, campaign: plan.campaign, world: plan.world,
    levelSeed: plan.levelSeed, missionLevel: plan, weapon: WEAPONS[0],
    enemyCatalog: ENEMIES, vehicle: VEHICLES.find((entry) => entry.family === 'ground') || VEHICLES[0],
    equipment: EQUIPMENT.slice(0, 8), crew: CREW, difficulty: 'standard'
  };
}

test('V75 Ceto: le bassin est une addition physique strictement limitée à Ceto et au template planète', () => {
  const plan = buildPlan();
  assert.equal(plan.validation.valid, true);
  assert.equal(plan.aquaticHabitats.length, 1);
  const [volume] = plan.aquaticHabitats;
  assert.deepEqual(volume.sourceNodeIds, ['planet-cave-a', 'planet-cave-b']);
  assert.equal(volume.authoredAddition, true);
  assert.equal(volume.freeSwimImplemented, false);
  assert.equal(volume.y + volume.h, plan.geometry.platforms.find((entry) => entry.id === volume.surfacePlatformId).y);
  const hazard = plan.hazards.find((entry) => entry.cetoHabitatId === volume.id);
  assert.ok(hazard);
  assert.deepEqual({ kind: hazard.kind, effect: hazard.effect, damage: hazard.damage, slow: hazard.slow },
    { kind: 'flood', effect: 'drag', damage: 0, slow: 0.7 });
  assert.equal(buildPlan(otherWorld).aquaticHabitats.length, 0);
  assert.equal(buildPlan(cetoWorld, 'ship-interior-vertical').aquaticHabitats.length, 0);
});

test('V75 Ceto: atlas, pivot aquatique et hitbox 156x100 restent isotropes et dédiés', () => {
  const sheet = resolveSpriteSheet(CETO_V75.sheetId);
  assert.ok(sheet);
  assert.equal(sheet.profileId, CETO_V75.profileId);
  assert.equal(sheet.path, '/assets/openai/sprites/normalized/enemy-profiles-v66/enemy-051-ceto-reef-predator.webp');
  assert.deepEqual({ x: SPRITE_PIVOTS[sheet.pivot].x, y: SPRITE_PIVOTS[sheet.pivot].y }, CETO_V75.pivot);
  assert.equal(SPRITE_PIVOTS[sheet.pivot].kind, 'aquatic-ventral-datum');
  const hitbox = SPRITE_HITBOXES[sheet.hitbox];
  assert.equal(hitbox.x, 76);
  assert.equal(hitbox.width, 104);
  assert.ok(Math.abs(hitbox.y - 125.33333333333333) < 1e-9);
  assert.ok(Math.abs(hitbox.height - 66.66666666666667) < 1e-9);
  const enemy = createCeto();
  assert.equal(enemy.visualSheetId, CETO_V75.sheetId);
  assert.equal(enemy.w, CETO_V75.bodyWidth);
  assert.equal(enemy.h, CETO_V75.bodyHeight);
  assert.equal(enemy.y + enemy.h, 200);
  assert.equal(isCetoV75(enemy), true);
});

test('V75 Ceto: une morsure droite puis gauche frappe une fois exactement à la frame20', () => {
  for (const fixture of [combatFixture(), combatFixture({ enemyX: 700, playerX: 600 })]) {
    const { engine, enemy, player, events } = fixture;
    const expectedFacing = player.x > enemy.x ? 1 : -1;
    assert.equal(updateCetoV75(engine, enemy, 0), true);
    assert.equal(enemy.cetoAttackV75.facing, expectedFacing);
    assert.equal(resolveEnemyAnimation(enemy).frame, 16);
    updateCetoV75(engine, enemy, CETO_V75.impact);
    assert.equal(player.health, 100 - enemy.damage);
    assert.equal(resolveEnemyAnimation(enemy).frame, 20);
    updateCetoV75(engine, enemy, 1 / 12);
    assert.equal(player.health, 100 - enemy.damage);
    assert.equal(events.filter((entry) => entry.type === 'enemy-attack-impact').length, 1);
    assert.equal(events[0].frame, 4);
  }
});

test('V75 Ceto: aucune cible hors bassin ou derrière un obstacle ne déclenche une morsure', () => {
  const outside = combatFixture({ playerX: 1005 });
  updateCetoV75(outside.engine, outside.enemy, 0.5);
  assert.equal(Boolean(outside.enemy.cetoAttackV75), false);
  assert.equal(outside.player.health, 100);

  const blocked = combatFixture({ wall: { id: 'sealed-bulkhead', x: 255, y: 80, w: 30, h: 160 } });
  updateCetoV75(blocked.engine, blocked.enemy, 0.5);
  assert.equal(Boolean(blocked.enemy.cetoAttackV75), false);
  assert.equal(blocked.player.health, 100);
});

test('V75 Ceto: locomotion et mort parcourent leurs huit cellules sans sortir du volume', () => {
  const { engine, enemy, volume } = combatFixture({ playerX: 700 });
  const start = enemy.x;
  updateCetoV75(engine, enemy, 0.5);
  assert.ok(enemy.x > start);
  assert.equal(containsCetoBodyV75(volume, enemy), true);
  enemy.x = volume.x + volume.w - enemy.w;
  const blocked = moveCetoWithinHabitatV75(engine, enemy, volume, 40, 0);
  assert.equal(blocked.blocked, true);
  assert.equal(enemy.x + enemy.w, volume.x + volume.w);

  const controller = new SpriteAnimationController();
  enemy.alive = true;
  for (let index = 0; index < 8; index += 1) {
    enemy.cetoAttackV75 = { elapsed: (index + 0.01) / CETO_V75.fps };
    const request = getCetoAnimationV75(enemy);
    const sample = controller.sample(enemy.id, request, 1000);
    assert.equal(sample.clip.id, 'attack');
    assert.equal(sample.frame, 16 + index);
  }
  enemy.cetoAttackV75 = null;
  enemy.alive = false;
  for (let index = 0; index < 8; index += 1) {
    enemy.deathClock = CETO_V75.corpseLifetime - (index + 0.01) / 10;
    const sample = new SpriteAnimationController().sample(enemy.id, getCetoAnimationV75(enemy), 2000);
    assert.equal(sample.clip.id, 'death');
    assert.equal(sample.frame, 24 + index);
  }
  enemy.deathClock = 0;
  assert.equal(getCetoAnimationV75(enemy).frame, 31);
});

test('V75 Ceto: le flood sans dégâts ne réapplique pas une friction par frame', () => {
  const player = { x: 100, y: 100, w: 42, h: 92, vx: 100, alive: true, inVehicle: false, hazardClock: 0, health: 100 };
  const engine = {
    hazards: [{ id: 'water', x: 80, y: 170, w: 120, h: 40, active: true, kind: 'flood', effect: 'drag', slow: 0.7, damage: 0 }],
    damagePlayer(target, damage) { target.health -= damage; }
  };
  GameEngine.prototype.applyHazards.call(engine, player);
  assert.equal(player.vx, 100);
  assert.equal(player.health, 100);
  player.vx = 100;
  player.hazardClock = 0.5;
  GameEngine.prototype.applyHazards.call(engine, player);
  assert.equal(player.vx, 100, 'le hook de dégâts ne multiplie jamais la vitesse de locomotion');
  assert.equal(player.health, 100);
});

test('V75 Ceto: le moteur de production instancie un seul prédateur dans son bassin, jamais sur un autre monde', () => withBrowserMocks(() => {
  const plan = buildPlan();
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  const engine = new RuntimeEngine(canvas, { onEvent() {} });
  engine.start(optionsFor(plan));
  const cetos = engine.enemies.filter(isCetoV75);
  assert.equal(cetos.length, 1);
  assert.equal(cetos[0].levelSpawnId, plan.aquaticHabitats[0].id);
  assert.equal(containsCetoBodyV75(plan.aquaticHabitats[0], cetos[0]), true);
  assert.equal(cetos[0].w, 156);
  assert.equal(cetos[0].h, 100);

  const otherPlan = buildPlan(otherWorld);
  const other = new RuntimeEngine(canvas, { onEvent() {} });
  other.start(optionsFor(otherPlan));
  assert.equal(other.enemies.filter(isCetoV75).length, 0);
  assert.equal(other.enemies.some((entry) => String(entry.id).startsWith(`${CETO_V75.profileId}:`)), false);
}));
