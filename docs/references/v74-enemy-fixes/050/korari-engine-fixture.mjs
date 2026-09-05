import { GameEngine } from '../../../../src/game-v51-runtime.js';
import { GameEngine as MissionLevelEngine } from '../../../../src/game-production-runtime.js';
import { ENEMIES } from '../../../../src/content-core-v50.js';
import { ENEMY_BATCH_COMBAT_CONTRACTS_V66 } from '../../../../src/enemy-batch-combat-v66.js';

export { GameEngine, MissionLevelEngine };
export const PROFILE_ID = 'enemy-050-korari-stalker';
export const SHEET_ID = 'enemy.profile.' + PROFILE_ID + '.v66';
export const EXPECTED_ATLAS_SHA256 = '01f0627eee240ded94a36859e2d4dc8960d5881828d24753be04e78ad7a096df';
export const RUNTIME_PROPOSAL = Object.freeze({
  renderWidth: 288, renderHeight: 288, bodyWidth: 96, bodyHeight: 60,
  jawForwardReach: 82.125, distanceMetric: 'centers',
  stopRange: 98, meleeRange: 104, lungeDistance: 72, windup: 3 / 12,
  impact: 4 / 12, duration: 8 / 12, cooldown: 1.35, speedMultiplier: 1.18, verticalRange: 90
});
const actor = (x, extra = {}) => ({
  x, y: 838, w: 42, h: 92, alive: true, downed: false, lost: false,
  inVehicle: false, health: 100, facing: -1, vx: 0, vy: 0, grounded: true, ...extra
});

// This fixture never constructs the app or a save system. Collision, targeting,
// navigation, attack timeline and rendering still use the shipped prototypes.
// Only event observation and final health delivery are captured for assertions.
export function createKorariFixture(Engine = GameEngine, { facing = 1, centerDistance = 168 } = {}) {
  const damage = [], events = [];
  const engine = Object.create(Engine.prototype);
  Object.assign(engine, {
    random: () => 0.5, animationTime: 0, images: new Map(), enemies: [],
    missionLevelBounds: { width: 6200, height: 1080 },
    player: actor(0), coop: actor(2000, { coop: true }), coopEnabled: false,
    squadActors: [], walls: [], covers: [], doors: [], ladders: [], lifts: [],
    stealthRuntime: { detectionRadius: 900, spottedBy: new Set(), visibility: 100, noise: 0 },
    platforms: [{ id: 'floor', x: 0, y: 930, w: 6200, h: 40 }],
    onEvent(event) { events.push(event); },
    damagePlayer(target, amount) { target.health -= amount; damage.push({ target, amount }); },
    damageSquadMember(target, amount) { target.health -= amount; damage.push({ target, amount }); },
    damageVehicle(amount) { this.vehicle.hull -= amount; damage.push({ target: this.vehicle, amount }); }
  });
  if (Engine === MissionLevelEngine) {
    engine.missionLevelRuntime = {};
    engine.missionVentNetworkV62 = { id: 'korari-test-vents' };
  } else engine.activeSquadActors = function () { return this.squadActors; };
  const source = ENEMIES.find((entry) => entry.id === PROFILE_ID);
  const enemy = GameEngine.prototype.createEnemy.call(engine, source, 0, 600, 930);
  Object.assign(enemy, {
    alert: true, facing, attackClock: 0, speed: 100,
    levelNavigation: { mode: 'surface', surfaceId: 'floor', connectorId: null,
      destinationY: null, riding: false, lastSafeX: enemy.x, lastSafeY: enemy.y }
  });
  engine.player.x = enemy.x + enemy.w / 2 + facing * centerDistance - engine.player.w / 2;
  engine.player.facing = -facing;
  engine.enemies.push(enemy);
  const step = (delta) => {
    engine.animationTime += delta;
    engine.updateEnemy(enemy, delta);
  };
  const arm = () => {
    step(0);
    if (enemy.batchAttackV66?.targetId !== 'player') throw new Error('Korari did not arm the dedicated player attack: ' + enemy.visualSheetId);
  };
  return { engine, enemy, damage, events, step, arm,
    contract: ENEMY_BATCH_COMBAT_CONTRACTS_V66[PROFILE_ID] };
}
