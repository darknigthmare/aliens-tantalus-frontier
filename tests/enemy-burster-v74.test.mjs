import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-v51-runtime.js';
import { GameEngine as ProductionEngine } from '../src/game-production-runtime.js';
import { GameEngine as ResumeEngine } from '../src/game-production-resume.js';
import {
  BURSTER_COMBAT_V74 as contract, detonateBursterV74, getBursterTerminalAnimationV74,
  getEnemyBatchAttackFrameV66, isBursterCombatV74, captureEnemyBatchCombatResumeV66,
  restoreEnemyBatchCombatResumeV66
} from '../src/enemy-batch-combat-v66.js';
import { SPRITE_CLIP_SETS, resolveEnemyAnimation, resolveSpriteSheet } from '../src/sprite-animation-runtime.js';

const actor = (x, extra = {}) => ({
  x, y: 838, w: 42, h: 92, alive: true, downed: false, lost: false,
  inVehicle: false, health: 100, maxHealth: 100, armor: 0, maxArmor: 100,
  kills: 0, damageTaken: 0, ...extra
});

// Controlled physics fixture, not an art-size certification. Real V51/V52
// update, colliders, target selection and defeat hooks are kept intact.
function fixture(Engine = ProductionEngine) {
  const events = [], damage = [];
  const enemy = {
    id: 'enemy-016-burster:fixture', name: 'Burster', visualSheetId: contract.sheetId,
    spriteKey: 'xenoBursterV56', biology: 'xenomorph', behavior: 'exploder',
    x: 600, y: 860, w: 80, h: 70, spawnX: 600, groundY: 930,
    health: 100, maxHealth: 100, armor: 0, damage: 20, speed: 100,
    alive: true, alert: true, facing: 1, reward: 4,
    attackClock: 0, rangedClock: 0, staggerClock: 0, hurtClock: 0, revealed: 0,
    deathClock: 0, v52HurtClock: 0, jammedClock: 0,
    levelNavigation: { mode: 'surface', surfaceId: 'floor', connectorId: null,
      destinationY: null, riding: false, lastSafeX: 600, lastSafeY: 860 }
  };
  const engine = Object.create(Engine.prototype);
  Object.assign(engine, {
    animationTime: 0, random: () => 0.5, images: new Map(), particles: [], drops: [],
    enemies: [enemy], player: actor(692), coop: actor(1600, { coop: true, operatorId: 'coop-role' }),
    coopEnabled: false, squadActors: [], walls: [], covers: [], doors: [], ladders: [], lifts: [],
    missionLevelBounds: { width: 6200, height: 1080 },
    platforms: [{ id: 'floor', x: 0, y: 930, w: 6200, h: 40 }],
    stealthRuntime: { detectionRadius: 900, spottedBy: new Set(), visibility: 100, noise: 0 },
    resumeIdentity: { seed: 16 },
    mission: { state: 'active', phase: 'insertion', objectives: {}, elapsed: 0, retries: 0, casualties: 0 },
    onEvent(event) { events.push(event); },
    damagePlayer(target, amount) { target.health -= amount; damage.push({ target, amount, route: 'player' }); },
    damageSquadMember(target, amount) { target.health -= amount; damage.push({ target, amount, route: 'squad' }); },
    damageVehicle(amount) {
      this.vehicle.hull -= amount;
      damage.push({ target: this.vehicle, amount, route: 'vehicle' });
      if (this.vehicle.hull <= 0) {
        this.vehicle.destroyed = true;
        for (const occupant of [this.player, this.coop, ...this.squadActors]) occupant.inVehicle = false;
      }
    }
  });
  if (Engine === ProductionEngine) {
    engine.missionLevelRuntime = {};
    engine.missionVentNetworkV62 = { id: 'burster-vents' };
  } else engine.activeSquadActors = function () { return this.squadActors; };
  const step = (delta) => {
    if (!enemy.alive && Number.isFinite(delta)) enemy.deathClock = Math.max(0, enemy.deathClock - Math.max(0, delta));
    engine.animationTime += Number.isFinite(delta) ? Math.max(0, delta) : 0;
    engine.updateEnemy(enemy, delta);
  };
  const arm = (targetId = 'player') => {
    step(0);
    assert.equal(enemy.batchAttackV66?.targetId, targetId, 'armement dans la vraie chaîne moteur');
  };
  return { engine, enemy, events, damage, step, arm };
}

test('016: contrat exact sans héritage par nom, atlas original et quatre rangées de huit poses', () => {
  assert.equal(contract.profileId, 'enemy-016-burster');
  assert.equal(contract.impact, 0.5);
  assert.equal(contract.lungeDistance, 0);
  assert.equal(contract.distanceMetric, 'centers');
  assert.equal(contract.duration, 8 / 12);
  for (const id of [undefined, 'enemy.xenomorph-burster.action.v56', 'enemy.profile.enemy-068-albino-burster.v66']) {
    assert.equal(isBursterCombatV74({ name: 'Burster', visualSheetId: id }), false);
  }
  const bytes = readFileSync(new URL('../assets/openai/sprites/normalized/enemy-profiles-v66/enemy-016-burster.webp', import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), '3ad1538aef3dd62354950f7cf7f63e875ff2cd6688bfb06c8f2fa9abf80ff3df');
  for (const [index, clip] of SPRITE_CLIP_SETS['enemy-action-v66'].entries()) {
    assert.deepEqual(clip.frames, Array.from({ length: 8 }, (_, frame) => index * 8 + frame));
  }
});

for (const [label, Engine] of [['V51', GameEngine], ['V52 production', ProductionEngine]]) {
  for (const facing of [-1, 1]) {
    for (const hullWidth of [160, 190, 340]) {
      for (const edgeDistance of [107, 109]) {
        test(`016 ${label}: coque${hullWidth}, bord à ${edgeDistance}px, sens ${facing}, sans pénétration`, () => {
          const { engine, enemy, damage, step } = fixture(Engine);
          enemy.w = 88; enemy.h = 88; enemy.y = 930 - enemy.h;
          const origin = enemy.x + enemy.w / 2;
          engine.vehicle = { id: 'apc', x: origin + facing * edgeDistance - (facing < 0 ? hullWidth : 0),
            y: 826, w: hullWidth, h: 104, active: true, hull: 100, maxHull: 100 };
          engine.player.inVehicle = true;
          step(0);
          assert.equal(Boolean(enemy.batchAttackV66), edgeDistance < contract.meleeRange);
          assert.equal(enemy.x, 600);
          assert.equal(enemy.facing, facing);
          assert.ok(facing > 0 ? enemy.x + enemy.w < engine.vehicle.x : engine.vehicle.x + hullWidth < enemy.x);
          if (edgeDistance < contract.meleeRange) {
            step(contract.impact);
            assert.equal(damage.length, 1);
            assert.equal(damage[0].route, 'vehicle');
            assert.equal(engine.player.health, 100);
            assert.equal(engine.vehicle.hull, 73);
            step(1);
            assert.equal(damage.length, 1);
          } else assert.equal(damage.length, 0);
        });
      }
    }
  }

  test(`016 ${label}: portée coque utilise la hitbox locale et non son padding de sprite`, () => {
    const { engine, enemy, step } = fixture(Engine);
    const origin = enemy.x + enemy.w / 2;
    engine.player.inVehicle = true;
    engine.vehicle = { id: 'apc', x: origin + 59, y: 826, w: 340, h: 104,
      spriteHitbox: { local: { x: 50, y: 0, w: 240, h: 104 } }, active: true, hull: 100 };
    step(0);
    assert.equal(Boolean(enemy.batchAttackV66), false, 'bord physique109, padding59: pas de compression');
    engine.vehicle.x -= 2;
    step(0);
    assert.equal(Boolean(enemy.batchAttackV66), true, 'bord physique107: compression permise');
  });

  for (const facing of [-1, 1]) {
    for (const centerDistance of [107, 109]) {
      test(`016 ${label}: compression centrée à ${centerDistance}px, sens ${facing}`, () => {
        const { engine, enemy, damage, step } = fixture(Engine);
        enemy.w = 88; enemy.h = 88; enemy.y = 930 - enemy.h;
        engine.player.x = enemy.x + enemy.w / 2 + facing * centerDistance - engine.player.w / 2;
        step(0);
        assert.equal(Boolean(enemy.batchAttackV66), centerDistance < contract.meleeRange);
        assert.equal(enemy.x, 600, 'le delta nul ne masque pas la portée par une avance physique');
        assert.equal(enemy.facing, facing);
        assert.equal(damage.length, 0);
      });
    }
  }

  test(`016 ${label}: huit poses de pression, impact unique index6, puis huit poses de mort terminale`, () => {
    const { engine, enemy, events, damage, step, arm } = fixture(Engine);
    assert.equal(engine.detonateEnemy(enemy, engine.player), false, 'aucune détonation directe avant armement');
    arm();
    const frames = [getEnemyBatchAttackFrameV66(enemy)];
    for (let frame = 1; frame < 6; frame += 1) {
      step(1 / 12);
      frames.push(getEnemyBatchAttackFrameV66(enemy));
      assert.equal(enemy.alive, true);
      assert.equal(damage.length, 0);
      assert.equal(engine.detonateEnemy(enemy, engine.player), false, 'appel prématuré rejeté');
    }
    step(1 / 12);
    assert.equal(enemy.alive, false);
    assert.equal(enemy.health, 0);
    assert.equal(enemy.batchAttackV66, null);
    assert.equal(damage.length, 1);
    assert.equal(damage[0].amount, 27);
    assert.equal(enemy.x, 600);
    assert.equal(enemy.y, 860);
    assert.equal(enemy.vx, 0);
    frames.push(getBursterTerminalAnimationV74(enemy).frame - 16);
    step(1 / 12);
    frames.push(getBursterTerminalAnimationV74(enemy).frame - 16);
    assert.deepEqual(frames, [0, 1, 2, 3, 4, 5, 6, 7]);
    step(1 / 12);
    const deathFrames = [getBursterTerminalAnimationV74(enemy).frame];
    for (let frame = 1; frame < 8; frame += 1) {
      step(0.1);
      deathFrames.push(getBursterTerminalAnimationV74(enemy).frame);
    }
    assert.deepEqual(deathFrames, [24, 25, 26, 27, 28, 29, 30, 31]);
    step(1);
    assert.deepEqual(getBursterTerminalAnimationV74(enemy), { clipId: 'death', frame: 31 });
    assert.equal(damage.length, 1);
    assert.equal(events.filter((event) => event.type === 'kill').length, 1);
    assert.equal(events.filter((event) => event.type === 'enemy-detonation').length, 1);
    assert.equal(events.filter((event) => event.type === 'enemy-attack-impact').length, 1);
    assert.equal(engine.drops.length, 1, 'salvage unique');
    assert.equal(engine.player.kills, 0, 'auto-détonation non attribuée au joueur');
    assert.equal(engine.particles.length, 24, 'trois jets de particules réels');
    assert.equal(engine.detonateEnemy(enemy, engine.player), false);
    // Full resolver is additionally checked once central art integration exists.
    if (resolveSpriteSheet(contract.sheetId)) assert.deepEqual(resolveEnemyAnimation(enemy),
      { sheetId: contract.sheetId, clipId: 'death', frame: 31 });
  });

  for (const role of ['player', 'coop', 'squad', 'vehicle']) {
    test(`016 ${label}: route ${role}, une cible physique touchée une seule fois`, () => {
      const { engine, enemy, damage, step, arm } = fixture(Engine);
      let target = engine.player;
      if (role === 'coop') {
        engine.player.x = 1600;
        engine.coopEnabled = true;
        target = engine.coop;
        target.x = 692;
      }
      if (role === 'squad') {
        engine.player.x = 1600;
        target = actor(692, { squadMember: true, crewId: 'escort' });
        engine.squadActors = [target];
      }
      if (role === 'vehicle') {
        engine.vehicle = { id: 'apc', x: 692, y: 860, w: 160, h: 70, active: true, hull: 100, maxHull: 100 };
        engine.player.inVehicle = true;
        target = engine.vehicle;
      }
      arm(role === 'squad' ? 'squad:escort' : role === 'vehicle' ? 'player' : role);
      step(contract.impact);
      assert.equal(damage.length, 1);
      assert.equal(damage[0].target, target);
      assert.equal(damage[0].route, role === 'coop' ? 'player' : role);
      assert.equal(enemy.alive, false);
      assert.equal(engine.detonateEnemy(enemy, target), false);
    });
  }

  test(`016 ${label}: dégâts de zone aux deux côtés sans doublon d'acteur ni transfert de cible`, () => {
    const { engine, events, damage, step, arm } = fixture(Engine);
    arm();
    engine.coopEnabled = true;
    engine.coop.x = 530;
    const squad = actor(670, { squadMember: true, crewId: 'escort' });
    engine.squadActors = [squad, squad];
    step(contract.impact);
    assert.equal(damage.length, 3);
    assert.equal(new Set(damage.map((hit) => hit.target)).size, 3);
    assert.deepEqual(events.find((event) => event.type === 'enemy-detonation').hitTargetIds.sort(), ['coop', 'player', 'squad:escort']);
    assert.equal(events.find((event) => event.type === 'enemy-detonation').targetId, 'player');
  });

  test(`016 ${label}: coque détruite et occupants éjectés ne reçoivent pas un second blast`, () => {
    const { engine, damage, step, arm } = fixture(Engine);
    engine.vehicle = { id: 'apc', x: 692, y: 860, w: 160, h: 70, active: true, hull: 20, maxHull: 100 };
    engine.player.inVehicle = true;
    engine.coopEnabled = true;
    engine.coop.x = 730;
    engine.coop.inVehicle = true;
    const passenger = actor(750, { squadMember: true, crewId: 'passenger', inVehicle: true });
    engine.squadActors = [passenger];
    arm();
    step(contract.impact);
    assert.equal(engine.vehicle.destroyed, true);
    assert.equal(damage.length, 1);
    assert.equal(damage[0].route, 'vehicle');
    for (const occupant of [engine.player, engine.coop, passenger]) {
      assert.equal(occupant.inVehicle, false);
      assert.equal(occupant.health, 100);
    }
  });

  for (const kind of ['wall', 'door', 'cover']) {
    const block = (engine) => {
      const solid = { id: 'block', x: 686, y: 790, w: 2, h: 140 };
      if (kind === 'wall') engine.walls.push(solid);
      if (kind === 'door') engine.doors.push({ ...solid, progress: 0 });
      if (kind === 'cover') engine.covers.push({ ...solid, destroyed: false });
    };
    for (const when of ['before', 'during']) {
      test(`016 ${label}: ${kind} ${when} bloque ou annule la compression sans explosion`, () => {
        const { engine, enemy, events, damage, step, arm } = fixture(Engine);
        if (when === 'during') arm();
        block(engine);
        step(contract.impact);
        assert.equal(enemy.alive, true);
        assert.ok(!enemy.batchAttackV66);
        assert.equal(damage.length, 0);
        assert.equal(events.filter((event) => event.type === 'enemy-detonation').length, 0);
      });
    }
  }

  test(`016 ${label}: paroi protège la cible secondaire, plateforme protège l'étage au-dessus`, () => {
    const { engine, damage, step, arm } = fixture(Engine);
    arm();
    engine.coopEnabled = true;
    engine.coop.x = 530;
    engine.walls.push({ x: 580, y: 790, w: 4, h: 140 });
    const upstairs = actor(620, { y: 780, squadMember: true, crewId: 'upstairs' });
    engine.squadActors = [upstairs];
    engine.platforms.push({ id: 'shelf', x: 600, y: 880, w: 80, h: 8 });
    step(contract.impact);
    assert.equal(damage.length, 1);
    assert.equal(damage[0].target, engine.player);
    assert.equal(engine.coop.health, 100);
    assert.equal(upstairs.health, 100);
  });

  for (const reason of ['dead-target', 'downed-target', 'vent-target', 'target-behind', 'enemy-dead', 'enemy-captured', 'hurt', 'stagger', 'jam']) {
    test(`016 ${label}: interruption ${reason} avant impact, aucun blast différé`, () => {
      const { engine, enemy, damage, events, step, arm } = fixture(Engine);
      arm();
      if (reason === 'dead-target') engine.player.alive = false;
      if (reason === 'downed-target') engine.player.downed = true;
      if (reason === 'vent-target') engine.player.ventTransit = { networkId: 'burster-vents' };
      if (reason === 'target-behind') engine.player.x = 480;
      if (reason === 'enemy-dead') engine.defeatEnemy(enemy, engine.player);
      if (reason === 'enemy-captured') { enemy.alive = false; enemy.captured = true; }
      if (reason === 'hurt') enemy.hurtClock = 0.1;
      if (reason === 'stagger') enemy.staggerClock = 0.1;
      if (reason === 'jam') enemy.jammedClock = 0.1;
      step(0.5);
      assert.equal(enemy.batchAttackV66, null);
      assert.equal(damage.length, 0);
      assert.equal(events.filter((event) => event.type === 'enemy-detonation').length, 0);
      assert.notEqual(enemy.bursterDetonatedV74, true);
    });
  }

  test(`016 ${label}: esquive hors rayon après armement fait exploser à vide sans poursuite`, () => {
    const { engine, enemy, damage, events, step, arm } = fixture(Engine);
    arm();
    engine.player.x = 1100;
    step(contract.impact);
    assert.equal(enemy.alive, false);
    assert.equal(enemy.x, 600);
    assert.equal(damage.length, 0);
    assert.equal(events.filter((event) => event.type === 'enemy-detonation').length, 1);
  });

  test(`016 ${label}: callback réentrant et grand delta ne répètent mort, salvage ou dommages`, () => {
    const { engine, enemy, events, damage, step, arm } = fixture(Engine);
    const deliver = engine.onEvent;
    engine.onEvent = (event) => {
      deliver(event);
      if (event.type === 'kill') {
        assert.equal(engine.detonateEnemy(enemy, engine.player), false);
        engine.updateEnemy(enemy, 0.5);
      }
    };
    arm();
    step(8);
    step(8);
    assert.equal(damage.length, 1);
    assert.equal(engine.drops.length, 1);
    assert.equal(events.filter((event) => event.type === 'kill').length, 1);
    assert.equal(events.filter((event) => event.type === 'enemy-detonation').length, 1);
  });
}

for (const [label, Engine] of [['V51', GameEngine], ['V52 production', ProductionEngine]]) {
  test(`016 ${label}: compression à gauche garde son orientation jusqu'à la mort`, () => {
    const { engine, enemy, damage, step, arm } = fixture(Engine);
    engine.player.x = enemy.x + enemy.w / 2 - 92 - engine.player.w / 2;
    arm();
    assert.equal(enemy.facing, -1);
    step(contract.impact);
    assert.equal(enemy.facing, -1);
    assert.equal(damage.length, 1);
    assert.equal(enemy.alive, false);
    assert.deepEqual(getBursterTerminalAnimationV74(enemy), { clipId: 'attack', frame: 22 });
  });
  for (const extraDistance of [0, 0.01]) {
    test(`016 ${label}: rayon132 exact, cible secondaire à132+${extraDistance}`, () => {
      const { engine, enemy, damage, step, arm } = fixture(Engine);
      arm();
      engine.coopEnabled = true;
      engine.coop.x = enemy.x + enemy.w / 2 - contract.blastRadius - engine.coop.w - extraDistance;
      step(contract.impact);
      assert.equal(damage.filter((hit) => hit.target === engine.coop).length, extraDistance === 0 ? 1 : 0);
    });
  }
  test(`016 ${label}: blindage du Burster ne peut pas annuler sa propre détonation`, () => {
    const { enemy, damage, step, arm } = fixture(Engine);
    enemy.armor = 1e6;
    arm();
    step(contract.impact);
    assert.equal(enemy.alive, false);
    assert.equal(enemy.health, 0);
    assert.equal(damage.length, 1);
  });
}

for (const state of ['compression', 'detonated']) {
  test(`016 sauvegarde réelle ${state}: JSON sans cible ni curseur, aucun rejeu d'impact`, () => {
    const original = fixture();
    original.arm();
    original.step(state === 'detonated' ? contract.impact : 0.25);
    const saved = JSON.parse(JSON.stringify(ResumeEngine.prototype.captureResumeState.call(original.engine)));
    const savedEnemy = saved.enemies[0];
    assert.equal('batchAttackV66' in savedEnemy, false);
    assert.equal('targetId' in savedEnemy, false);
    assert.equal('elapsed' in savedEnemy, false);
    assert.equal(savedEnemy.bursterDetonatedV74, state === 'detonated');
    const restored = fixture();
    const result = ResumeEngine.prototype.applyResumeState.call(restored.engine, saved);
    assert.equal(result.applied, true);
    assert.equal(restored.enemy.batchAttackV66, null);
    if (state === 'detonated') assert.deepEqual(getBursterTerminalAnimationV74(restored.enemy), { clipId: 'attack', frame: 22 });
    restored.step(0.5);
    assert.equal(restored.damage.length, 0);
    assert.equal(restored.events.filter((event) => event.type === 'enemy-detonation').length, 0);
    if (state === 'detonated') {
      assert.equal(restored.enemy.alive, false);
      assert.equal(restored.engine.drops.length, 1);
      assert.equal(getBursterTerminalAnimationV74(restored.enemy).clipId, 'death');
    } else assert.equal(restored.enemy.alive, true);
  });
}

test('016: ancienne sauvegarde et marqueur corrompu ne créent aucune explosion ni fausse fin de pression', () => {
  const { enemy } = fixture();
  assert.equal(restoreEnemyBatchCombatResumeV66(enemy, { bursterDetonatedV74: true }), true);
  assert.equal(enemy.bursterDetonatedV74, false, 'acteur vivant ne peut pas reprendre comme détoné');
  enemy.alive = false;
  enemy.deathClock = 2.8;
  restoreEnemyBatchCombatResumeV66(enemy, {});
  assert.deepEqual(getBursterTerminalAnimationV74(enemy), { clipId: 'death', frame: 24 });
  assert.equal(captureEnemyBatchCombatResumeV66(enemy).bursterDetonatedV74, false);
  assert.equal(detonateBursterV74({}, enemy, actor(680)), false);
});
