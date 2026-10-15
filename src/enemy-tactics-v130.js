import { sweepProjectileAabbV83 } from './projectile-collision-v83.js';
import { cancelEnemyBatchAttackV66 } from './enemy-batch-combat-v66.js';
import { updateEnemySupportStatusesV72 } from './gameplay-support-v72.js';
import { ENEMY_PATROL_V140, advanceEnemyPatrolV140, restoreEnemyPatrolV140 } from './enemy-patrol-v140.js';

// Awareness and deployment are project gameplay, never a claim about canon.
// Existing accepted sprites and combat contracts remain the only combat art.
export const ENEMY_TACTICS_V130 = Object.freeze({ schema: 130,
  states: Object.freeze(['patrol', 'suspicion', 'investigation', 'search', 'pursuit']),
  rearWarningSeconds: .8, rearApproachSeconds: 1.4, noiseLifetime: 1.8,
  humanoid: Object.freeze({ reaction: .32, lostSight: .7, search: 4.8, patrolSpeed: .34, hearing: 1, cone: .12 }),
  xeno: Object.freeze({ reaction: .16, lostSight: .42, search: 6.2, patrolSpeed: .43, hearing: 1.18, cone: -.45 })
});
const list = value => Array.isArray(value) ? value : [];
const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const point = actor => ({ x: actor.x + actor.w / 2, y: actor.y + actor.h * .35 });
const feet = actor => actor.y + actor.h;
const box = value => value && ['x', 'y', 'w', 'h'].every(key => Number.isFinite(value[key])) && value.w > 0 && value.h > 0;
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const rear = enemy => Boolean(enemy?.rearEntryV130 && enemy.rearEntryV130.phase !== 'active');
const mobile = enemy => box(enemy) && enemy.alive && !enemy.isBoss
  && !['egg-cycle', 'parasite', 'aquatic', 'flying'].includes(enemy.behaviorProfileV119?.aiProfile)
  && !/egg|ovomorph|facehugger|aquatic|flying/i.test(String(enemy.behavior || ''));
const doctrine = enemy => ENEMY_TACTICS_V130[/human|synthetic|automaton/.test(String(enemy.biology)) ? 'humanoid' : 'xeno'];
const doors = engine => typeof engine.getDoorRenderState === 'function' && list(engine.doors).length
  ? list(engine.doors).filter(door => !door.destroyed && (Number.isFinite(door.progress) ? door.progress < .82 : !door.open))
    .map(door => engine.getDoorRenderState(door, { open: false }))
  : typeof engine.closedDoorColliders === 'function' ? list(engine.closedDoorColliders())
  : list(engine.doors).filter(door => !door.destroyed && (Number.isFinite(door.progress) ? door.progress < .82 : !door.open));
const obstacles = engine => [...list(engine.walls), ...doors(engine), ...list(engine.covers),
  ...list(engine.platforms).filter(platform => platform.solid || platform.oneWay === false)]
  .filter(value => box(value) && !value.destroyed);

export function enemySightClearV130(engine, enemy, target) {
  if (!box(enemy) || !box(target) || rear(enemy) || target.ventTransit) return false;
  const from = point(enemy), to = point(target);
  const ray = { ...from, w: 0, h: 0 }, displacement = { x: to.x - from.x, y: to.y - from.y };
  return ![...obstacles(engine), ...list(engine.platforms).filter(value => box(value) && !value.destroyed)]
    .some(value => sweepProjectileAabbV83(ray, displacement, value));
}

// Merge contiguous real supports. Patrol endpoints never extend across a gap.
export function enemyPatrolBoundsV130(engine, enemy, radius = 170) {
  const foot = feet(enemy), center = enemy.x + enemy.w / 2;
  const spans = list(engine.platforms).filter(platform => box(platform) && !platform.destroyed
    && Math.abs(platform.y - foot) <= 12 && !platform.lift)
    .map(platform => ({ left: platform.x, right: platform.x + platform.w })).sort((a, b) => a.left - b.left);
  const merged = [];
  for (const span of spans) {
    const last = merged.at(-1);
    if (last && span.left <= last.right + .5) last.right = Math.max(last.right, span.right);
    else merged.push({ ...span });
  }
  const support = merged.find(span => center >= span.left && center <= span.right);
  const origin = finite(enemy.spawnX, enemy.x);
  if (!support || support.right - support.left < enemy.w) return { left: enemy.x, right: enemy.x };
  const left = Math.max(support.left + 2, origin - radius, 0);
  const right = Math.min(support.right - enemy.w - 2, origin + radius,
    finite(engine.missionLevelBounds?.width, support.right) - enemy.w);
  return right < left ? { left: enemy.x, right: enemy.x } : { left, right };
}

function initialState(engine, enemy) {
  const bounds = enemyPatrolBoundsV130(engine, enemy);
  return { schema: 130, mode: enemy.alert ? 'pursuit' : 'patrol', clock: 0, sight: 0, lost: 0,
    direction: enemy.facing < 0 ? -1 : 1, homeX: enemy.x, homeY: enemy.y,
    left: bounds.left, right: bounds.right, targetId: null, lastKnown: null,
    lastNoiseId: 0, searchLeg: 0, transitions: 0, patrolV140: null };
}

function cancelAttack(engine, enemy) {
  cancelEnemyBatchAttackV66(engine, enemy, 'tactics-awareness-v130');
  engine.cancelPendingEnemyMeleeV64?.(enemy, 'tactics-awareness-v130');
  enemy.attacking = false;
  if (enemy.userCasteCombatV89?.phase === 'windup') {
    enemy.userCasteCombatV89.phase = 'cooldown'; enemy.userCasteCombatV89.clock = .3;
  }
}

export function withEnemyTacticsV130(BaseEngine) {
  if (BaseEngine.enemyTacticsRuntimeV130) return BaseEngine;
  return class EnemyTacticsRuntimeV130 extends BaseEngine {
    static enemyTacticsRuntimeV130 = true;

    start(options = {}) {
      this.enemyTacticsV130 = { schema: 130, time: 0, noiseSerial: 0, noises: [], entries: 0, transitions: 0 };
      this.enemyTacticsStartingV130 = true;
      this.enemyTacticsReadyV130 = false;
      const result = super.start(options);
      this.enemyTacticsReadyV130 = true;
      for (const enemy of list(this.enemies)) if (mobile(enemy)) enemy.tacticsV130 = initialState(this, enemy);
      if (options.resumeState?.enemyTacticsV130 && this.lastResumeResult?.applied) this.restoreEnemyTacticsV130(options.resumeState.enemyTacticsV130);
      else if (!options.resumeState && !this.editorMode && !this.campaign?.specialOperationId
        && !/^(special-|qa-|editor-)/.test(this.campaign?.id || '')) this.deployRearEntrancesV130();
      this.enemyTacticsStartingV130 = false;
      return { ...result, enemyTacticsV130: this.enemyTacticsSnapshotV130() };
    }

    tacticsSimulationActiveV130() {
      return !this.paused && !this.enemyAtlasLoadingPausedV65 && !this.userCasteLoadingV88
        && this.running !== false && (!this.mission || this.mission.state === 'active');
    }

    update(delta) {
      if (!this.tacticsSimulationActiveV130() || !(delta > 0) || !Number.isFinite(delta)) return;
      const runtime = this.enemyTacticsV130 ||= { schema: 130, time: 0, noiseSerial: 0, noises: [], entries: 0, transitions: 0 };
      runtime.time += delta;
      for (const event of runtime.noises) event.remaining -= delta;
      runtime.noises = runtime.noises.filter(event => event.remaining > 0);
      return super.update(delta);
    }

    tacticsTargetsV130() {
      const actors = [...new Set([this.player, this.coopEnabled ? this.coop : null, ...(this.activeSquadActors?.() || [])])]
        .filter(actor => box(actor) && actor.alive && !actor.downed && !actor.ventTransit);
      return [...new Set(actors.map(actor => actor.inVehicle && this.vehicle?.active ? this.vehicle : actor))];
    }

    emitEnemyNoiseV130(actor, radius = 780, kind = 'gunshot') {
      if (!box(actor) || !this.tacticsSimulationActiveV130()) return null;
      const runtime = this.enemyTacticsV130 ||= { schema: 130, time: 0, noiseSerial: 0, noises: [], entries: 0, transitions: 0 };
      const event = { id: ++runtime.noiseSerial, x: actor.x + actor.w / 2, y: actor.y + actor.h * .4,
        floorY: feet(actor), radius: clamp(finite(radius, 780), 60, 1400), kind, remaining: ENEMY_TACTICS_V130.noiseLifetime };
      runtime.noises.push(event); runtime.noises = runtime.noises.slice(-32);
      this.onEvent?.({ type: 'enemy-noise-v130', kind, x: event.x, y: event.y, radius: event.radius });
      return event;
    }

    fire(actor = this.player) {
      const shots = finite(actor?.shots), bullets = list(this.bullets).length;
      // The inherited V51 shot marks nearby contacts alert through walls.
      // Awareness is now exclusively owned by the sight/noise state machine.
      for (const enemy of list(this.enemies)) if (mobile(enemy) && !enemy.dormant) enemy.tacticsV130 ||= initialState(this, enemy);
      const result = super.fire(actor);
      for (const enemy of list(this.enemies)) if (enemy.tacticsV130) enemy.alert = !rear(enemy) && enemy.tacticsV130.mode === 'pursuit';
      if (result && (finite(actor?.shots) > shots || list(this.bullets).length > bullets)) {
        const noise = this.weaponBallistics?.noise || 1;
        this.emitEnemyNoiseV130(actor.inVehicle && this.vehicle?.active ? this.vehicle : actor, 780 * noise);
      }
      return result;
    }

    enemyTargetPerceivedV130(enemy, actor) {
      if (!mobile(enemy) || !enemy.tacticsV130) return !rear(enemy);
      const occupants = [this.player, this.coopEnabled ? this.coop : null, ...list(this.squadActors)]
        .filter(occupant => occupant?.alive && !occupant.downed && occupant.inVehicle);
      const alive = actor === this.vehicle ? this.vehicle.active && !this.vehicle.destroyed && occupants.length > 0 : actor?.alive;
      return Boolean(enemy.tacticsV130.mode === 'pursuit' && box(actor) && alive && !actor.downed
        && !actor.ventTransit && enemySightClearV130(this, enemy, actor.inVehicle && this.vehicle?.active ? this.vehicle : actor));
    }

    activeSquadActors() {
      const actors = super.activeSquadActors?.() || [];
      return this.enemyTacticsCombatActorV130 ? actors.filter(actor => this.enemyTargetPerceivedV130(this.enemyTacticsCombatActorV130, actor)) : actors;
    }

    userCasteTargetsV89() {
      const actors = super.userCasteTargetsV89?.() || [];
      return this.enemyTacticsCombatActorV130 ? actors.filter(actor => this.enemyTargetPerceivedV130(this.enemyTacticsCombatActorV130, actor)) : actors;
    }

    missionLevelEnemyTarget(enemy) {
      if (mobile(enemy) && enemy.tacticsV130) {
        if (enemy.tacticsV130.mode !== 'pursuit') return enemy.tacticsV130.lastKnown || null;
        return this.tacticsTargetsV130().filter(actor => this.enemyTargetPerceivedV130(enemy, actor))
          .sort((a, b) => Math.abs(a.x - enemy.x) - Math.abs(b.x - enemy.x))[0] || null;
      }
      return super.missionLevelEnemyTarget?.(enemy);
    }

    setEnemyTacticsStateV130(enemy, mode) {
      const state = enemy.tacticsV130;
      if (state.mode === mode) return;
      const previous = state.mode;
      state.mode = mode; state.clock = 0; state.transitions += 1; state.patrolV140 = null;
      if (this.enemyTacticsV130) this.enemyTacticsV130.transitions += 1;
      enemy.alert = mode === 'pursuit';
      if (mode !== 'pursuit') cancelAttack(this, enemy);
      this.onEvent?.({ type: 'enemy-awareness-v130', enemyId: enemy.id, previous, state: mode });
    }

    // Swept body collision and continuous support keep even large frame deltas
    // from moving a patrol through a thin wall, closed door or platform edge.
    moveEnemyTacticsV130(enemy, destination, delta, speedScale = 1, turnWhenBlocked = true) {
      const oldX = enemy.x, state = enemy.tacticsV130;
      const direction = Math.sign(destination - oldX);
      if (!direction || enemy.staggerClock > 0) { enemy.vx = 0; return false; }
      const bounds = enemyPatrolBoundsV130(this, { ...enemy, spawnX: enemy.x }, 100000);
      const desired = clamp(oldX + direction * Math.min(Math.abs(destination - oldX), finite(enemy.speed, 80) * speedScale * delta), bounds.left, bounds.right);
      let displacement = desired - oldX;
      for (const obstacle of obstacles(this)) {
        const contact = sweepProjectileAabbV83(enemy, { x: displacement, y: 0 }, obstacle);
        if (contact) displacement *= Math.max(0, contact.t - .001);
      }
      enemy.x = oldX + displacement;
      enemy.facing = direction; enemy.vx = delta > 0 ? displacement / delta : 0;
      if (turnWhenBlocked && state && Math.abs(displacement) < .01 && Math.abs(destination - oldX) > 2) state.direction *= -1;
      return Math.abs(displacement) > .01;
    }

    updateEnemy(enemy, delta) {
      if (!this.tacticsSimulationActiveV130() || !(delta > 0) || !Number.isFinite(delta)) return;
      if (rear(enemy)) return this.updateRearEntranceV130(enemy, delta);
      if (!mobile(enemy) || enemy.dormant || enemy.ventTransit) return super.updateEnemy(enemy, delta);
      enemy.tacticsV130 ||= initialState(this, enemy);
      // Fixed upper bound is for collision/awareness integration, not a clock
      // clamp: every second supplied by the caller is consumed.
      let remaining = delta;
      while (remaining > 1e-9 && enemy.alive) {
        const step = Math.min(1 / 60, remaining);
        this.updateEnemyTacticsStepV130(enemy, step);
        remaining -= step;
      }
    }

    updateEnemyTacticsStepV130(enemy, delta) {
      const state = enemy.tacticsV130, policy = doctrine(enemy), origin = point(enemy);
      const targets = this.tacticsTargetsV130();
      const visible = targets.filter(target => {
        const eye = point(target), dx = eye.x - origin.x, dy = eye.y - origin.y, distance = Math.hypot(dx, dy);
        const range = finite(enemy.behaviorProfileV119?.perception?.vision, 620);
        const visibility = target.crouching ? .58 : target.inCover ? .72 : 1;
        return distance < Math.max(100, range * visibility)
          && (distance < 105 || dx * (enemy.facing || 1) / Math.max(1, distance) >= policy.cone)
          && enemySightClearV130(this, enemy, target);
      }).sort((a, b) => Math.hypot(point(a).x - origin.x, point(a).y - origin.y)
        - Math.hypot(point(b).x - origin.x, point(b).y - origin.y));
      const target = visible.find(actor => actor.id === state.targetId) || visible[0];
      state.clock += delta;
      if (target) {
        state.targetId = target.id || 'player';
        state.lastKnown = { x: target.x, y: target.y, w: target.w, h: target.h, floorY: feet(target) };
        state.lost = 0; state.sight += delta;
        if (state.mode !== 'pursuit') {
          if (state.mode !== 'suspicion') this.setEnemyTacticsStateV130(enemy, 'suspicion');
          enemy.facing = Math.sign(point(target).x - origin.x) || enemy.facing;
          if (state.sight >= policy.reaction) this.setEnemyTacticsStateV130(enemy, 'pursuit');
        }
      } else {
        state.sight = 0; state.lost += delta;
        const event = list(this.enemyTacticsV130?.noises).filter(noise => noise.id > state.lastNoiseId && noise.remaining > 0
          && Math.hypot(noise.x - origin.x, noise.y - origin.y) <= noise.radius * policy.hearing)
          .sort((a, b) => b.id - a.id)[0];
        if (event && state.mode !== 'pursuit') {
          state.lastNoiseId = event.id;
          state.lastKnown = { x: event.x - 20, y: event.floorY - 80, w: 40, h: 80, floorY: event.floorY };
          if (state.mode === 'patrol' || state.mode === 'search') this.setEnemyTacticsStateV130(enemy, 'suspicion');
        }
        if (state.mode === 'pursuit' && state.lost >= policy.lostSight) this.setEnemyTacticsStateV130(enemy, 'investigation');
        if (state.mode === 'suspicion' && state.clock >= .36) {
          this.setEnemyTacticsStateV130(enemy, state.lastKnown ? 'investigation' : 'patrol');
        }
      }
      enemy.aiStateV130 = state.mode.toUpperCase();
      enemy.alert = state.mode === 'pursuit';
      if (state.mode === 'pursuit' && target) {
        const previous = { x: enemy.x, y: enemy.y };
        const previousCombatActor = this.enemyTacticsCombatActorV130;
        const previousCombatStep = this.enemyTacticsCombatStepV130;
        this.enemyTacticsCombatActorV130 = enemy;
        this.enemyTacticsCombatStepV130 = { x: enemy.x, y: enemy.y,
          maximum: Math.max(150, finite(enemy.speed, 80) * 2.8) * delta };
        try { super.updateEnemy(enemy, delta); }
        finally { this.enemyTacticsCombatActorV130 = previousCombatActor; this.enemyTacticsCombatStepV130 = previousCombatStep; }
        // Legacy fallback pounces were instantaneous 92px offsets. Preserve
        // their attack contracts while limiting translation to physical speed.
        const limit = Math.max(150, finite(enemy.speed, 80) * 2.8) * delta;
        const dx = enemy.x - previous.x, dy = enemy.y - previous.y, moved = Math.hypot(dx, dy);
        if (moved > limit + .01 && enemy.levelNavigation?.mode !== 'lift') {
          enemy.x = previous.x + dx * limit / moved; enemy.y = previous.y + dy * limit / moved;
        }
        enemy.alert = true;
        return;
      }
      cancelAttack(this, enemy);
      updateEnemySupportStatusesV72(enemy, delta, () => {
        for (const key of ['attackClock', 'rangedClock', 'staggerClock', 'hurtClock']) enemy[key] = Math.max(0, finite(enemy[key]) - delta);
        if (state.mode === 'suspicion' || state.mode === 'pursuit') { enemy.vx = 0; return; }
        if (state.mode === 'patrol') {
          const home = { x: state.homeX, y: state.homeY, w: enemy.w, h: enemy.h, floorY: state.homeY + enemy.h };
          const currentSurface = this.missionLevelSurfaceFor?.(enemy, { tolerance: 30 });
          const homeSurface = this.missionLevelSurfaceFor?.(home, { tolerance: 30 });
          if (this.missionLevelRuntime && this.advanceEnemyMissionNavigation
            && (enemy.levelNavigation?.mode && enemy.levelNavigation.mode !== 'surface'
              || currentSurface && homeSurface && Math.abs(currentSurface.y - homeSurface.y) > 40)) {
            this.advanceEnemyMissionNavigation(enemy, home, currentSurface, homeSurface, delta);
            return;
          }
          const bounds = enemyPatrolBoundsV130(this, { ...enemy, spawnX: state.homeX });
          state.left = bounds.left; state.right = bounds.right;
          if (enemy.staggerClock > 0) { enemy.vx = 0; return; }
          advanceEnemyPatrolV140(enemy, state, bounds, delta, {
            speed: finite(enemy.speed, 80) * policy.patrolSpeed,
            pauseSeconds: policy === ENEMY_TACTICS_V130.humanoid ? ENEMY_PATROL_V140.humanoidPause : ENEMY_PATROL_V140.xenoPause,
            move: (destination, step) => this.moveEnemyTacticsV130(enemy, destination, step, policy.patrolSpeed, false)
          });
          return;
        }
        if (state.mode === 'investigation' && state.lastKnown) {
          const memory = state.lastKnown;
          const surface = this.missionLevelSurfaceFor?.(enemy, { tolerance: 30 });
          const destinationSurface = this.missionLevelSurfaceFor?.(memory, { tolerance: 30 });
          if (this.missionLevelRuntime && this.advanceEnemyMissionNavigation && (enemy.levelNavigation?.mode !== 'surface'
            || (surface && destinationSurface && Math.abs(surface.y - destinationSurface.y) > 40))) {
            this.advanceEnemyMissionNavigation(enemy, memory, surface, destinationSurface, delta);
          } else this.moveEnemyTacticsV130(enemy, memory.x, delta, .78);
          if (Math.abs(enemy.x - memory.x) < 18 && Math.abs(feet(enemy) - memory.floorY) < 30 || state.clock >= 5) {
            state.searchLeg = 0; this.setEnemyTacticsStateV130(enemy, 'search');
          }
          return;
        }
        if (state.mode === 'search') {
          const leg = Math.floor(state.clock / .9);
          if (leg !== state.searchLeg) { state.searchLeg = leg; state.direction *= -1; }
          enemy.facing = state.direction;
          this.moveEnemyTacticsV130(enemy, enemy.x + state.direction * 35, delta, .22);
          if (state.clock >= policy.search) { state.lastKnown = null; state.targetId = null; this.setEnemyTacticsStateV130(enemy, 'patrol'); }
        }
      });
    }

    enemyMeleePathClearV64(enemy, target) {
      if (rear(enemy) || rear(target) || mobile(enemy) && !enemySightClearV130(this, enemy, target)) return false;
      if (this.enforceEnemyTacticsMotionV130(enemy)) return false;
      return super.enemyMeleePathClearV64?.(enemy, target) !== false;
    }

    enforceEnemyTacticsMotionV130(enemy) {
      const step = this.enemyTacticsCombatStepV130;
      if (this.enemyTacticsCombatActorV130 !== enemy || !step || enemy.levelNavigation?.mode === 'lift') return false;
      const dx = enemy.x - step.x, dy = enemy.y - step.y, distance = Math.hypot(dx, dy);
      if (distance <= step.maximum + .00001) return false;
      enemy.x = step.x + dx * step.maximum / distance; enemy.y = step.y + dy * step.maximum / distance;
      return true;
    }

    resolveEnemyHorizontal(enemy, previousX) {
      this.enforceEnemyTacticsMotionV130(enemy);
      return super.resolveEnemyHorizontal(enemy, previousX);
    }

    spawnEnemyProjectile(enemy, target) {
      if (rear(enemy) || !enemySightClearV130(this, enemy, target)) return false;
      return super.spawnEnemyProjectile(enemy, target);
    }

    applyEnemyDamage(enemy, amount, source = {}) {
      if (rear(enemy)) return false;
      const health = enemy?.health, result = super.applyEnemyDamage(enemy, amount, source);
      if (mobile(enemy) && enemy.health < health && enemy.tacticsV130) {
        const owner = typeof source.owner === 'object' ? source.owner : this.tacticsTargetsV130().find(target => target.id === source.owner);
        const actor = box(owner) ? owner : null;
        if (box(actor)) enemy.tacticsV130.lastKnown = { x: actor.x, y: actor.y, w: actor.w, h: actor.h, floorY: feet(actor) };
        this.setEnemyTacticsStateV130(enemy, 'investigation');
      }
      return result;
    }

    withForegroundEnemiesV130(callback) {
      const original = this.enemies;
      this.enemies = list(original).filter(enemy => !rear(enemy));
      try { return callback(); } finally {
        const additions = list(this.enemies).filter(enemy => !list(original).includes(enemy));
        this.enemies = original;
        if (Array.isArray(original)) original.push(...additions);
      }
    }
    updateBullets(delta) { if (!this.tacticsSimulationActiveV130()) return; return this.withForegroundEnemiesV130(() => super.updateBullets(delta)); }
    applyAimAssist(bullet, actor) { return this.withForegroundEnemiesV130(() => super.applyAimAssist(bullet, actor)); }
    performContextualMelee(actor) { return this.withForegroundEnemiesV130(() => super.performContextualMelee(actor)); }
    closestEnemy(actor, range) { return this.withForegroundEnemiesV130(() => super.closestEnemy?.(actor, range)); }
    useEquipment(id, actor) { return this.withForegroundEnemiesV130(() => super.useEquipment(id, actor)); }
    updateEquipmentDeployments(delta) { return this.withForegroundEnemiesV130(() => super.updateEquipmentDeployments(delta)); }
    resolveVehicleImpacts(actor) { return this.withForegroundEnemiesV130(() => super.resolveVehicleImpacts?.(actor)); }
    defeatEnemy(enemy, owner) { if (rear(enemy)) return false; return super.defeatEnemy(enemy, owner); }

    rearEntrancesForTacticsV130() {
      return list(this.rearEntrancesV130 || this.missionLevelRuntime?.rearEntrancesV130)
        .filter(entrance => box(entrance) && typeof entrance.id === 'string' && Number.isFinite(entrance.floorY));
    }

    rearThresholdValidV130(enemy, entrance, { occupied = false } = {}) {
      const landing = { x: entrance.x + entrance.w / 2 - enemy.w / 2, y: entrance.floorY - enemy.h, w: enemy.w, h: enemy.h };
      const bounds = this.missionLevelBounds;
      if (landing.x < 0 || landing.y < 0 || bounds && (landing.x + landing.w > bounds.width || feet(landing) > bounds.height)) return false;
      const support = enemyPatrolBoundsV130(this, { ...landing, spawnX: landing.x }, 100000);
      if (support.left === support.right || landing.x < support.left || landing.x > support.right
        || obstacles(this).some(obstacle => overlap(landing, obstacle))) return false;
      if (occupied && this.tacticsTargetsV130().some(actor => Math.abs(point(actor).x - point(landing).x) < (actor.w + enemy.w) / 2 + 48
        && Math.abs(feet(actor) - entrance.floorY) < 100)) return false;
      return true;
    }

    queueRearEntranceV130(enemy, entranceId, options = {}) {
      const entrance = typeof entranceId === 'string' ? this.rearEntrancesForTacticsV130().find(value => value.id === entranceId) : entranceId;
      if (!mobile(enemy) || !entrance || rear(enemy) || !this.rearThresholdValidV130(enemy, entrance)) return false;
      // Existing active actors can be assigned only during initial deployment.
      // Wave emitters should create a fresh actor, then queue it before insertion.
      if (list(this.enemies).includes(enemy) && !enemy.dormant && !this.enemyTacticsStartingV130) return false;
      enemy.x = entrance.x + entrance.w / 2 - enemy.w / 2; enemy.y = entrance.floorY - enemy.h;
      enemy.spawnX = enemy.x; enemy.groundY = entrance.floorY;
      enemy.dormant = true; enemy.alert = false; enemy.vx = 0; enemy.vy = 0;
      cancelAttack(this, enemy);
      enemy.batchAttackV66 = null; enemy.pendingMelee = false; enemy.pendingMeleeTargetId = null;
      enemy.attackWindupClock = 0; enemy.attackAnimationClock = 0; enemy.pounceClock = 0;
      enemy.attackClock = Math.max(.25, finite(enemy.attackClock)); enemy.rangedClock = Math.max(.3, finite(enemy.rangedClock));
      enemy.rearEntryV130 = { entranceId: entrance.id, phase: 'waiting', elapsed: 0,
        delay: clamp(finite(options.delay), 0, 30), progress: 0, blocked: false };
      enemy.tacticsV130 = initialState(this, enemy);
      if (!list(this.enemies).includes(enemy)) this.enemies.push(enemy);
      return true;
    }

    deployRearEntrancesV130() {
      const candidates = list(this.enemies).filter(enemy => mobile(enemy) && !enemy.dormant && !enemy.keyCarrier
        && this.objectiveState?.trackedBossId !== enemy.id);
      const used = new Set();
      for (const entrance of this.rearEntrancesForTacticsV130().slice(0, 4)) {
        const enemy = candidates.filter(actor => !used.has(actor) && Math.abs(feet(actor) - entrance.floorY) < 45)
          .sort((a, b) => Math.abs(a.x - entrance.x) - Math.abs(b.x - entrance.x))
          .find(actor => this.rearThresholdValidV130(actor, entrance));
        if (enemy && this.queueRearEntranceV130(enemy, entrance.id)) used.add(enemy);
      }
      return used.size;
    }

    updateRearEntranceV130(enemy, delta) {
      const state = enemy.rearEntryV130, entrance = this.rearEntrancesForTacticsV130().find(value => value.id === state.entranceId);
      if (!entrance) { state.blocked = true; return; }
      enemy.dormant = true; enemy.attacking = false; enemy.alert = false; enemy.vx = 0;
      const nearby = this.tacticsTargetsV130().some(actor => Math.hypot(point(actor).x - (entrance.x + entrance.w / 2), feet(actor) - entrance.floorY) < 920);
      if (state.phase === 'waiting' && !nearby) return;
      state.delay = Math.max(0, state.delay - delta);
      if (state.delay > 0) return;
      if (state.phase === 'waiting') {
        state.phase = 'warning'; state.elapsed = 0;
        this.onEvent?.({ type: 'rear-entrance-warning-v130', enemyId: enemy.id, entranceId: entrance.id });
        this.pushCaption?.('warning', 'MOUVEMENT DERRIÈRE LA PORTE');
      }
      state.elapsed += delta;
      if (state.phase === 'warning' && state.elapsed >= ENEMY_TACTICS_V130.rearWarningSeconds) {
        state.elapsed -= ENEMY_TACTICS_V130.rearWarningSeconds; state.phase = 'approach';
      }
      if (state.phase === 'approach') state.progress = Math.min(.98, state.elapsed / ENEMY_TACTICS_V130.rearApproachSeconds);
      state.blocked = !this.rearThresholdValidV130(enemy, entrance, { occupied: true });
      if (state.phase !== 'approach' || state.elapsed < ENEMY_TACTICS_V130.rearApproachSeconds || state.blocked) return;
      state.phase = 'active'; state.progress = 1;
      enemy.dormant = false; enemy.tacticsV130 = initialState(this, enemy);
      this.initializeEnemyMissionNavigation?.(enemy);
      if (this.enemyTacticsV130) this.enemyTacticsV130.entries += 1;
      this.onEvent?.({ type: 'rear-entrance-arrived-v130', enemyId: enemy.id, entranceId: entrance.id, x: enemy.x, y: enemy.y });
    }

    getVisibleEnemyAtlasSheetsV65(visible) {
      return super.getVisibleEnemyAtlasSheetsV65([...list(visible || this.getVisibleEnemiesV65?.()),
        ...list(this.enemies).filter(enemy => rear(enemy) && enemy.rearEntryV130.phase !== 'waiting')]);
    }

    drawWorld(ctx) {
      // The vertical runtime paints the doorway first, then invokes this hook
      // before foreground actors; other worlds need the fallback layer here.
      if (this.verticalRuntimeV130?.schema !== 130) this.drawRearEntranceLayerV130(ctx);
      return super.drawWorld(ctx);
    }

    drawRearEntranceLayerV130(ctx) {
      for (const enemy of list(this.enemies).filter(rear)) this.drawRearEntranceEnemyV130(ctx, enemy);
    }

    drawRearEntranceEnemyV130(ctx, enemy) {
      const state = enemy.rearEntryV130, entrance = this.rearEntrancesForTacticsV130().find(value => value.id === state.entranceId);
      if (!entrance || state.phase === 'waiting') return;
      const progress = state.phase === 'warning' ? 0 : state.progress;
      const scale = .32 + .68 * progress, center = entrance.x + entrance.w / 2;
      ctx.save();
      ctx.beginPath(); ctx.rect(entrance.x - enemy.w, entrance.y - enemy.h, entrance.w + enemy.w * 2, entrance.h + enemy.h * 2); ctx.clip();
      ctx.globalAlpha = .35 + .65 * progress;
      ctx.translate(center, entrance.floorY - 60 * (1 - progress)); ctx.scale(scale, scale);
      ctx.translate(-(enemy.x + enemy.w / 2), -feet(enemy));
      super.drawEnemy(ctx, { ...enemy, dormant: false, attacking: false, vx: progress > 0 ? enemy.speed * .5 : 0,
        rearEntryV130: null, alert: false });
      ctx.restore();
      ctx.save(); ctx.fillStyle = state.blocked ? '#f4a56a' : '#e9cc7a'; ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center'; ctx.fillText(state.blocked ? 'SEUIL BLOQUÉ' : 'CONTACT · PLAN ARRIÈRE', center, entrance.y - 10); ctx.restore();
    }

    captureResumeState() {
      return { ...super.captureResumeState(), enemyTacticsV130: { schema: 130,
        time: finite(this.enemyTacticsV130?.time), noiseSerial: finite(this.enemyTacticsV130?.noiseSerial),
        enemies: list(this.enemies).filter(enemy => enemy.tacticsV130 || enemy.rearEntryV130).map(enemy => ({ id: enemy.id,
          tactics: enemy.tacticsV130 ? structuredClone(enemy.tacticsV130) : null,
          rearEntry: enemy.rearEntryV130 ? { ...enemy.rearEntryV130 } : null })) } };
    }

    applyResumeState(raw) {
      const result = super.applyResumeState(raw);
      if (result?.applied && this.enemyTacticsReadyV130) this.restoreEnemyTacticsV130(raw?.enemyTacticsV130);
      return result;
    }

    restoreEnemyTacticsV130(source) {
      if (!source || source.schema !== 130) return false;
      this.enemyTacticsV130.time = clamp(finite(source.time), 0, 604800);
      this.enemyTacticsV130.noiseSerial = Math.floor(clamp(finite(source.noiseSerial), 0, 999999999));
      this.enemyTacticsV130.noises = [];
      const byId = new Map(list(this.enemies).map(enemy => [enemy.id, enemy]));
      for (const saved of list(source.enemies).slice(0, 512)) {
        const enemy = byId.get(saved?.id);
        if (!mobile(enemy)) continue;
        const initial = initialState(this, enemy), state = saved.tactics;
        if (state && ENEMY_TACTICS_V130.states.includes(state.mode)) {
          for (const key of ['clock', 'sight', 'lost', 'transitions', 'lastNoiseId', 'searchLeg']) initial[key] = clamp(finite(state[key]), 0, 604800);
          initial.mode = state.mode; initial.direction = state.direction < 0 ? -1 : 1;
          initial.homeX = clamp(finite(state.homeX, enemy.x), 0, finite(this.missionLevelBounds?.width, 6200));
          initial.homeY = clamp(finite(state.homeY, enemy.y), 0, finite(this.missionLevelBounds?.height, 1080));
          if (box(state.lastKnown)) initial.lastKnown = { x: clamp(state.lastKnown.x, 0, finite(this.missionLevelBounds?.width, 6200)),
            y: clamp(state.lastKnown.y, 0, finite(this.missionLevelBounds?.height, 1080)), w: clamp(state.lastKnown.w, 1, 1000),
            h: clamp(state.lastKnown.h, 1, 1000), floorY: clamp(finite(state.lastKnown.floorY), 0, finite(this.missionLevelBounds?.height, 1080)) };
          initial.targetId = typeof state.targetId === 'string' ? state.targetId.slice(0, 100) : null;
          const policy = doctrine(enemy), bounds = enemyPatrolBoundsV130(this, { ...enemy, spawnX: initial.homeX });
          if (initial.mode === 'patrol') initial.patrolV140 = restoreEnemyPatrolV140(state.patrolV140, enemy, bounds, initial.direction,
            finite(enemy.speed, 80) * policy.patrolSpeed,
            policy === ENEMY_TACTICS_V130.humanoid ? ENEMY_PATROL_V140.humanoidPause : ENEMY_PATROL_V140.xenoPause);
        }
        enemy.tacticsV130 = initial;
        const entry = saved.rearEntry, entrance = this.rearEntrancesForTacticsV130().find(value => value.id === entry?.entranceId);
        if (entry && entrance && ['waiting', 'warning', 'approach', 'active'].includes(entry.phase)) {
          if (entry.phase === 'active') { enemy.rearEntryV130 = { entranceId: entrance.id, phase: 'active', progress: 1, elapsed: 0, delay: 0, blocked: false }; enemy.dormant = false; }
          else if (this.rearThresholdValidV130(enemy, entrance)) {
            // Only restore the saved actor at its matching, valid authored threshold.
            const x = entrance.x + entrance.w / 2 - enemy.w / 2, y = entrance.floorY - enemy.h;
            if (Math.abs(enemy.x - x) < 2 && Math.abs(enemy.y - y) < 2) {
              enemy.rearEntryV130 = { entranceId: entrance.id, phase: entry.phase,
                elapsed: clamp(finite(entry.elapsed), 0, 30), delay: clamp(finite(entry.delay), 0, 30),
                progress: clamp(finite(entry.progress), 0, .98), blocked: false };
              enemy.dormant = true; cancelAttack(this, enemy);
            }
          }
        }
      }
      return true;
    }

    enemyTacticsSnapshotV130() {
      return { schema: 130, time: finite(this.enemyTacticsV130?.time),
        noises: list(this.enemyTacticsV130?.noises).length, transitions: finite(this.enemyTacticsV130?.transitions),
        rearArrivals: finite(this.enemyTacticsV130?.entries),
        enemies: list(this.enemies).filter(enemy => enemy.tacticsV130 || enemy.rearEntryV130).map(enemy => ({
          id: enemy.id, state: enemy.tacticsV130?.mode || null, x: enemy.x, y: enemy.y,
          patrol: enemy.tacticsV130?.patrolV140 ? { ...enemy.tacticsV130.patrolV140 } : null,
          rear: enemy.rearEntryV130 ? { ...enemy.rearEntryV130 } : null })) };
    }
  };
}
