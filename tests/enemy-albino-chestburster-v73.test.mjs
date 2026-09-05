import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { ENEMIES } from '../src/content-core-v50.js';
import { GameEngine } from '../src/game-v51-runtime.js';
import { GameEngine as MissionLevelEngine } from '../src/game-production-runtime.js';
import { resolveEnemyProfileVisualV66 } from '../src/enemy-profile-registry-v66.js';
import { V66_READY_ENEMY_PROFILE_ASSETS } from '../src/enemy-profile-assets-v66.js';
import { ENEMY_BATCH_COMBAT_CONTRACTS_V66, getEnemyBatchAttackFrameV66 } from '../src/enemy-batch-combat-v66.js';
import { resolveSpriteSheet, SPRITE_PIVOTS } from '../src/sprite-animation-runtime.js';

const profileId = 'enemy-055-albino-chestburster';
const sheetId = `enemy.profile.${profileId}.v66`;
const contract = ENEMY_BATCH_COMBAT_CONTRACTS_V66[profileId];
const source = ENEMIES.find((entry) => entry.id === profileId);
const actor = (x, extra = {}) => ({
  x, y: 838, w: 42, h: 92, alive: true, downed: false, lost: false,
  inVehicle: false, health: 100, ...extra
});

// Real V51 and shipped V52 prototype chains: only events and health delivery
// are captured. Target resolution, collisions and mission support stay real.
function fixture(Engine) {
  const damage = [];
  const events = [];
  const engine = Object.create(Engine.prototype);
  Object.assign(engine, {
    random: () => 0.5, animationTime: 0, images: new Map(),
    missionLevelBounds: { width: 6200, height: 1080 },
    enemies: [], player: actor(642), coop: actor(2000, { coop: true }),
    coopEnabled: false, squadActors: [], walls: [], covers: [], doors: [], ladders: [], lifts: [],
    stealthRuntime: { detectionRadius: 900, spottedBy: new Set(), visibility: 100, noise: 0 },
    platforms: [{ id: 'floor', x: 0, y: 930, w: 6200, h: 40 }],
    onEvent(event) { events.push(event); },
    damagePlayer(target, amount) { target.health -= amount; damage.push({ target, amount }); },
    damageSquadMember(target, amount) { target.health -= amount; damage.push({ target, amount }); },
    damageVehicle(amount) { this.vehicle.hull -= amount; damage.push({ target: this.vehicle, amount }); }
  });
  if (Engine === MissionLevelEngine) {
    engine.missionLevelRuntime = {};
    engine.missionVentNetworkV62 = { id: 'albino-test-vents' };
  } else {
    engine.activeSquadActors = function () { return this.squadActors; };
  }
  const enemy = GameEngine.prototype.createEnemy.call(engine, source, 0, 600, 930);
  Object.assign(enemy, {
    alert: true, facing: 1, attackClock: 0, speed: 100,
    levelNavigation: { mode: 'surface', surfaceId: 'floor', connectorId: null,
      destinationY: null, riding: false, lastSafeX: enemy.x, lastSafeY: enemy.y }
  });
  engine.enemies.push(enemy);
  const step = (delta) => {
    engine.animationTime += delta;
    engine.updateEnemy(enemy, delta);
  };
  const arm = (targetId = 'player') => {
    step(0);
    assert.equal(enemy.batchAttackV66?.targetId, targetId);
  };
  return { engine, enemy, damage, events, step, arm };
}

test('055: atlas dédié vérifié, ni fallback 003 ni acceptation implicite de 054', () => {
  const visual = resolveEnemyProfileVisualV66(source);
  const sheet = resolveSpriteSheet(sheetId);
  const asset = V66_READY_ENEMY_PROFILE_ASSETS.find((entry) => entry.profileId === profileId);
  assert.equal(visual.sheetId, sheetId);
  assert.equal(visual.canonExact, false);
  assert.notEqual(sheet.path, resolveSpriteSheet('enemy.profile.enemy-003-chestburster.v66').path);
  const bytes = readFileSync(new URL(`..${sheet.path}`, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.normalizedSha256);
  assert.equal(asset.normalizedSha256, 'c2ed130649fc57aeaf0509376f7601eb8987c853914595e5231689f636709ede');
  assert.equal(resolveEnemyProfileVisualV66({ id: profileId, name: 'Chestburster' }).sheetId, sheetId);
  assert.equal(resolveEnemyProfileVisualV66({ id: 'enemy-054-albino-facehugger', name: source.name }), null);
  assert.equal(resolveEnemyProfileVisualV66({ id: 'unknown-055', name: source.name }), null);
  assert.equal(sheet.renderWidth, 188);
  assert.equal(sheet.renderHeight, 188);
  assert.deepEqual(SPRITE_PIVOTS[sheet.pivot], { kind: 'ground-contact', x: 128, y: 240 });
  assert.equal(contract.impact, 4 / 12);
  assert.equal(contract.lungeDistance, 0);
});

for (const [label, Engine] of [['V51', GameEngine], ['V52 production', MissionLevelEngine]]) {
  test(`055 ${label}: corps 35×20, impact unique à la pose 5, récupération et cooldown`, () => {
    const { enemy, damage, events, step, arm } = fixture(Engine);
    assert.equal(enemy.visualSheetId, sheetId);
    assert.ok(Math.abs(enemy.w - 35) < 1e-8);
    assert.ok(Math.abs(enemy.h - 20) < 1e-8);
    const origin = { x: enemy.x, y: enemy.y };
    arm();
    step(contract.impact - 1e-4);
    assert.equal(damage.length, 0);
    step(1e-4);
    assert.equal(getEnemyBatchAttackFrameV66(enemy), 4);
    assert.equal(damage.length, 1);
    assert.equal(damage[0].amount, enemy.damage);
    step(contract.duration - contract.impact + 1e-4);
    assert.equal(enemy.batchAttackV66, null);
    assert.equal(damage.length, 1);
    assert.ok(enemy.attackClock > 0);
    step(0);
    assert.equal(enemy.batchAttackV66, null, 'aucune réattaque pendant le cooldown');
    assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 1);
    assert.deepEqual({ x: enemy.x, y: enemy.y }, origin, 'aucun bond artificiel');
  });

  for (const kind of ['wall', 'door', 'cover']) {
    const block = (engine) => {
      const solid = { id: `block-${kind}`, x: 638, y: 790, w: 2, h: 140 };
      if (kind === 'wall') engine.walls.push(solid);
      if (kind === 'cover') engine.covers.push({ ...solid, destroyed: false });
      if (kind === 'door') engine.doors.push({ ...solid, progress: 0 });
    };
    test(`055 ${label}: ${kind} bloque le coup avant son armement`, () => {
      const { engine, enemy, damage, step } = fixture(Engine);
      block(engine);
      step(0);
      step(contract.impact);
      assert.equal(enemy.batchAttackV66, undefined);
      assert.equal(damage.length, 0);
    });
    test(`055 ${label}: ${kind} ajouté pendant l'anticipation annule sans impact`, () => {
      const { engine, enemy, damage, events, step, arm } = fixture(Engine);
      arm();
      block(engine);
      step(contract.impact);
      assert.equal(enemy.batchAttackV66, null);
      assert.equal(damage.length, 0);
      assert.ok(events.some((event) => event.type === 'enemy-attack-cancelled'));
    });
  }

  test(`055 ${label}: une couverture détruite ne bloque plus la morsure`, () => {
    const { engine, damage, step, arm } = fixture(Engine);
    engine.covers = [{ x: 638, y: 790, w: 2, h: 140, destroyed: true }];
    arm();
    step(contract.impact);
    assert.equal(damage.length, 1);
  });

  test(`055 ${label}: approche rapide arrêtée par une couverture mince sans traversée`, () => {
    const { engine, enemy, damage, step } = fixture(Engine);
    engine.player.x = 900;
    engine.covers = [{ x: 700, y: 790, w: 2, h: 140, destroyed: false }];
    step(1);
    assert.ok(enemy.x > 600);
    assert.ok(enemy.x + enemy.w <= 700 + 1e-8);
    assert.equal(enemy.y + enemy.h, 930);
    assert.equal(damage.length, 0);
  });

  test(`055 ${label}: un coop plus proche ne détourne pas la cible verrouillée`, () => {
    const { engine, damage, step, arm } = fixture(Engine);
    arm();
    engine.coopEnabled = true;
    engine.coop.x = 635;
    step(contract.impact);
    assert.equal(damage.length, 1);
    assert.equal(damage[0].target, engine.player);
    assert.equal(engine.coop.health, 100);
  });

  for (const invalidation of ['downed', 'vent', 'behind']) {
    test(`055 ${label}: cible ${invalidation} annule sans frapper le coop à sa place`, () => {
      const { engine, enemy, damage, step, arm } = fixture(Engine);
      arm();
      engine.coopEnabled = true;
      engine.coop.x = 642;
      if (invalidation === 'downed') engine.player.downed = true;
      if (invalidation === 'vent') engine.player.ventTransit = { networkId: 'albino-test-vents' };
      if (invalidation === 'behind') engine.player.x = 540;
      step(contract.impact);
      assert.equal(enemy.batchAttackV66, null);
      assert.equal(damage.length, 0);
      assert.equal(engine.coop.health, 100);
    });
  }

  test(`055 ${label}: cible PNJ conservée même si le joueur se rapproche`, () => {
    const { engine, damage, step, arm } = fixture(Engine);
    engine.player.x = 1200;
    const escort = actor(642, { squadMember: true, crewId: 'albino-escort' });
    engine.squadActors = [escort];
    arm('squad:albino-escort');
    engine.player.x = 635;
    step(contract.impact);
    assert.equal(damage.length, 1);
    assert.equal(damage[0].target, escort);
    assert.equal(engine.player.health, 100);
  });
}
