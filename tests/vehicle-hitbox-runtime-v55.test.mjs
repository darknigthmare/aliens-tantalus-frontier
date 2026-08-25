import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, CREW, ENEMIES, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import {
  resolveSpriteSheet,
  resolveVehicleAnimation,
  shouldFlipSprite
} from '../src/sprite-animation-runtime.js';
import {
  buildSpriteHitboxRuntime,
  getEntitySpriteCollisionBounds,
  getV55VehiclePhysicalProfile
} from '../src/game-v52-runtime.js';

const V55_VEHICLES = Object.freeze([
  ['M577 Command APC', 'vehicle.m577-command-apc.action'],
  ['M22A3 Jackson Tank', 'vehicle.m22a3-jackson-tank.action'],
  ['P-5000 Powered Work Loader', 'vehicle.p5000-powered-work-loader.action'],
  ['UD-4L Cheyenne Dropship', 'vehicle.ud4l-cheyenne-dropship.action']
]);

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1024;
    this.naturalHeight = 1024;
  }

  set src(value) { this.currentSrc = value; }
}

function withBrowserRuntime(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try { return run(); } finally { Object.assign(globalThis, previous); }
}

function buildEngine(vehicle, templateId = 'ship-interior-vertical') {
  const world = WORLDS[0];
  const campaign = CAMPAIGNS.find((entry) => entry.worldId === world.id) || CAMPAIGNS[0];
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId });
  const engine = new GameEngine(
    { width: 1280, height: 720, getContext: () => ({}), addEventListener() {} },
    { onEvent() {} }
  );
  engine.start({
    seed: missionLevel.levelSeed.seed,
    campaign,
    world,
    levelSeed: missionLevel.levelSeed,
    missionLevel,
    vehicle,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES.slice(0, 48),
    crew: CREW.slice(0, 4)
  });
  return engine;
}

const near = (actual, expected, epsilon = 1e-7) => assert.ok(Math.abs(actual - expected) <= epsilon, `${actual} != ${expected}`);

test('le resolver véhicule accepte les 32 profils v55 et les huit fits M577 validés en v59', () => {
  const covered = VEHICLES.filter((vehicle) => V55_VEHICLES.some(([name]) => vehicle.name === name || vehicle.name.startsWith(`${name} — `)));
  assert.equal(covered.length, 32);
  for (const vehicle of covered) {
    const expectedSheet = V55_VEHICLES.find(([name]) => vehicle.name === name || vehicle.name.startsWith(`${name} — `))[1];
    assert.equal(resolveVehicleAnimation(vehicle)?.sheetId, expectedSheet, vehicle.id);
  }

  const standardM577 = VEHICLES.find((vehicle) => vehicle.id === 'vehicle-001-m577-armored-personnel-carrier');
  const m577Fits = VEHICLES.filter((vehicle) => vehicle.name === 'M577 Armored Personnel Carrier' || vehicle.name.startsWith('M577 Armored Personnel Carrier — '));
  const m570 = VEHICLES.find((vehicle) => vehicle.id === 'vehicle-003-m570-armored-personnel-carrier');
  assert.equal(resolveVehicleAnimation(standardM577)?.sheetId, 'vehicle.m577-apc.action');
  assert.equal(m577Fits.length, 8);
  for (const vehicle of m577Fits) assert.equal(resolveVehicleAnimation(vehicle)?.sheetId, 'vehicle.m577-apc.action', vehicle.id);
  assert.equal(resolveVehicleAnimation(m570), null);
  assert.equal(resolveVehicleAnimation({ id: 'vehicle-999-faux', name: 'M577 Command APC' }), null);
  assert.equal(resolveVehicleAnimation({ name: 'M577 Command APC transport' }), null);

  const ud4l = VEHICLES.find((vehicle) => vehicle.id === 'vehicle-009-ud-4l-cheyenne-dropship');
  assert.equal(resolveVehicleAnimation({ ...ud4l, firing: true }).clipId, 'flight');
  assert.equal(resolveVehicleAnimation({ ...ud4l, v52TurretClock: 0.4 }).clipId, 'flight');
  assert.equal(resolveVehicleAnimation({ ...ud4l, launching: true }).clipId, 'launch');
  assert.equal(resolveVehicleAnimation({ ...ud4l, launching: true, destroyed: true }).clipId, 'critical-wreck');
});

test('les bounds sprite sont proportionnels, centrés, orientés et suivent le corps mobile', () => {
  const entity = { x: 200, y: 300, w: 52, h: 74, facing: 1 };
  const sheet = resolveSpriteSheet('enemy.xenomorph-praetorian.action');
  const runtime = buildSpriteHitboxRuntime(entity, sheet);
  assert.ok(runtime);
  near(runtime.world.w, 168 * sheet.renderWidth / 256);
  near(runtime.world.h, 192 * sheet.renderHeight / 256);
  near(runtime.world.x + runtime.world.w / 2, entity.x + entity.w / 2);
  near(runtime.world.y + runtime.world.h, entity.y + entity.h);
  assert.equal(runtime.flip, false);

  entity.spriteHitbox = runtime;
  entity.x += 137;
  const moved = getEntitySpriteCollisionBounds(entity);
  near(moved.x, runtime.world.x + 137);
  near(moved.y, runtime.world.y);

  const mirrored = buildSpriteHitboxRuntime({ ...entity, facing: -1 }, sheet);
  assert.equal(mirrored.flip, true);
  near(mirrored.world.x + mirrored.world.w / 2, entity.x + entity.w / 2);
  assert.equal(shouldFlipSprite(sheet, -1), true);
});

test('le vrai GameEngine applique les quatre dimensions physiques v55 sans agrandir le pathfinding ennemi', () => withBrowserRuntime(() => {
  for (const [name, sheetId] of V55_VEHICLES) {
    const vehicle = VEHICLES.find((entry) => entry.name === name);
    const engine = buildEngine(vehicle);
    const profile = getV55VehiclePhysicalProfile(engine.vehicle);
    assert.ok(profile, name);
    assert.equal(profile.sheetId, sheetId);
    near(engine.vehicle.w, profile.width);
    near(engine.vehicle.h, profile.height);
    assert.ok(engine.vehicle.w >= 75 && engine.vehicle.w <= 276, name);
    assert.ok(engine.vehicle.h >= 77 && engine.vehicle.h <= 149, name);
    const bounds = getEntitySpriteCollisionBounds(engine.vehicle);
    near(bounds.x, engine.vehicle.x);
    near(bounds.y, engine.vehicle.y);
    near(bounds.w, engine.vehicle.w);
    near(bounds.h, engine.vehicle.h);
  }
}));

test('le vrai GameEngine garde son fallback famille et met à jour le miroir selon le mouvement horizontal', () => withBrowserRuntime(() => {
  const uncoveredAir = VEHICLES.find((vehicle) => vehicle.id === 'vehicle-011-ad-19cd-dropship');
  const fallbackEngine = buildEngine(uncoveredAir);
  assert.equal(resolveVehicleAnimation(fallbackEngine.vehicle), null);
  let familyPaths = 0;
  let spriteCells = 0;
  fallbackEngine.drawSheetCell = () => { spriteCells += 1; };
  const ctx = {
    save() {}, restore() {}, translate() {}, beginPath() { familyPaths += 1; },
    moveTo() {}, lineTo() {}, closePath() {}, fill() {}, stroke() {}, fillRect() {}, strokeRect() {},
    set fillStyle(value) { this.fillStyleValue = value; }, set strokeStyle(value) { this.strokeStyleValue = value; }, set lineWidth(value) { this.width = value; }
  };
  fallbackEngine.drawVehicle(ctx);
  assert.ok(familyPaths > 0, 'le rendu famille air de game-final-runtime reste actif');
  assert.equal(spriteCells, 0, 'aucune fausse plaque M577');

  const command = VEHICLES.find((vehicle) => vehicle.id === 'vehicle-002-m577-command-apc');
  const engine = buildEngine(command);
  engine.walls = [];
  engine.doors = [];
  engine.covers = [];
  engine.enemies = [];
  engine.vehicle.driver = engine.player;
  engine.vehicle.occupied = true;
  engine.player.inVehicle = true;
  const controls = { left: 'KeyA', right: 'KeyD', up: 'KeyW', down: 'KeyS', jump: 'Space' };

  engine.keys.add('KeyA');
  engine.updateVehicleDriver(engine.player, 0.5, controls);
  assert.equal(engine.vehicle.facing, -1);
  assert.equal(shouldFlipSprite(resolveSpriteSheet(resolveVehicleAnimation(engine.vehicle).sheetId), engine.vehicle.facing), true);

  engine.keys.clear();
  engine.keys.add('KeyD');
  engine.updateVehicleDriver(engine.player, 0.5, controls);
  assert.equal(engine.vehicle.facing, 1);
  assert.equal(shouldFlipSprite(resolveSpriteSheet(resolveVehicleAnimation(engine.vehicle).sheetId), engine.vehicle.facing), false);
}));

test('les projectiles du vrai GameEngine consomment la hitbox visible puis restaurent le corps de navigation', () => withBrowserRuntime(() => {
  const command = VEHICLES.find((vehicle) => vehicle.id === 'vehicle-002-m577-command-apc');
  const engine = buildEngine(command);
  const enemy = engine.enemies[0];
  Object.assign(enemy, {
    id: 'praetorian-visible-hitbox',
    spriteKey: 'xenoPraetorian',
    x: 1000,
    y: 500,
    w: 52,
    h: 74,
    health: 600,
    maxHealth: 600,
    armor: 0,
    alive: true,
    alert: false,
    attacking: false,
    v52HurtClock: 0
  });
  engine.enemies = [enemy];
  engine.walls = [];
  engine.doors = [];
  engine.refreshSpriteCollisionProfiles();
  const visible = getEntitySpriteCollisionBounds(enemy);
  assert.ok(visible.x < enemy.x && visible.y < enemy.y);

  const bullet = {
    x: visible.x + 4,
    y: visible.y + 4,
    w: 6,
    h: 6,
    vx: 0,
    vy: 0,
    damage: 17,
    armorBypass: 0,
    remainingPenetration: 0,
    maxHits: 1,
    hitCount: 0,
    hitEnemyIds: new Set(),
    splash: 0,
    status: null,
    family: 'ballistic',
    life: 1,
    hit: false,
    owner: engine.player
  };
  assert.equal(bullet.x + bullet.w > enemy.x && bullet.y + bullet.h > enemy.y, false, 'le projectile est hors du petit corps logique');
  engine.bullets = [bullet];
  const logicalBefore = { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h };
  engine.updateBullets(0);
  assert.ok(enemy.health < 600, 'la silhouette visible reçoit réellement le tir');
  assert.equal(engine.bullets.length, 0);
  assert.deepEqual({ x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h }, logicalBefore, 'le corps de navigation est restauré');
  assert.ok(enemy.spriteHitbox?.local);
}));

test('le choc électrique immobilise réellement un membre de l’escouade avec le contrat 1.25/80', () => withBrowserRuntime(() => {
  const engine = buildEngine(VEHICLES[0]);
  const member = engine.activeSquadActors()[0];
  assert.ok(member);
  engine.enemies = [];
  Object.assign(member, { health: 100, armor: 0, vx: 140, vy: 0, hazardClock: 0, hazardKind: null, grounded: true });
  engine.hazards = [{
    id: 'electrical-squad-test',
    kind: 'electrical',
    active: true,
    x: member.x - 8,
    y: member.y + member.h - 12,
    w: member.w + 16,
    h: 18,
    damage: 22,
    stunSeconds: 1.25,
    impulse: 80
  }];

  engine.applySquadHazard(member);
  assert.equal(member.health, 78);
  assert.equal(member.hazardKind, 'electrical');
  assert.equal(member.hazardClock, 1.25);
  assert.equal(member.vx, 0);
  assert.equal(member.vy, -80);

  const before = { x: member.x, bullets: engine.bullets.length };
  engine.updateMissionSquad(0.016);
  assert.equal(member.x, before.x);
  assert.equal(member.vx, 0);
  assert.equal(engine.bullets.length, before.bullets);
  assert.ok(member.hazardClock > 1.2);
}));
