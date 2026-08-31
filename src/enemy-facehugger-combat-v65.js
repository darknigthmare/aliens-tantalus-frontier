import { isEnemyMeleeTargetValidV64, resolveEnemyMeleeTargetIdV64 } from './enemy-combat-runtime-v64.js';

export const FACEHUGGER_COMBAT_V65 = Object.freeze({
  sheetId: 'enemy.profile.enemy-002-facehugger.v65',
  fps: 12,
  windup: 2 / 12,
  impact: 5 / 12,
  duration: 8 / 12,
  cooldown: 1.3,
  lungeDistance: 92,
  stopRange: 42,
  meleeRange: 70,
  maximumStep: 8,
  detectionRange: 620,
  verticalRange: 110,
  speedMultiplier: 1.38
});

const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const validTarget = (target) => isEnemyMeleeTargetValidV64(target) && !target.ventTransit;
const targetEntity = (engine, target) => target?.inVehicle && engine.vehicle?.active ? engine.vehicle : target;
const feetDistance = (enemy, target) => Math.abs((target.y + target.h) - (enemy.y + enemy.h));
const targetCenterDirection = (enemy, target) => Math.sign((target.x + target.w / 2) - (enemy.x + enemy.w / 2));
const hasPath = (engine, enemy, target) => Boolean(engine.enemyMeleePathClearV64(enemy, target));
const report = (engine, enemy, details) => engine.onEvent?.({
  enemyId: enemy.id, behavior: enemy.behavior, profileId: 'enemy-002-facehugger', ...details
});

export function isFacehuggerCombatV65(enemy) {
  return enemy?.visualSheetId === FACEHUGGER_COMBAT_V65.sheetId;
}

// Reuse the game's wall/door/cover resolver, but never let a thin collider fall
// between the starting and destination positions of a large update.
export function moveFacehuggerHorizontallyV65(engine, enemy, displacement) {
  let remaining = finite(displacement);
  let blocked = false;
  const startX = enemy.x;
  while (Math.abs(remaining) > 0.000001) {
    const step = Math.sign(remaining) * Math.min(Math.abs(remaining), FACEHUGGER_COMBAT_V65.maximumStep);
    const previousX = enemy.x;
    enemy.facing = Math.sign(step);
    enemy.x += step;
    engine.resolveEnemyHorizontal(enemy, previousX);
    if (Math.abs((enemy.x - previousX) - step) > 0.000001) {
      blocked = true;
      break;
    }
    remaining -= step;
  }
  return { travelled: enemy.x - startX, blocked };
}

export function cancelFacehuggerAttackV65(engine, enemy, reason = 'target-invalid') {
  if (!isFacehuggerCombatV65(enemy) || !enemy.facehuggerAttackV65) return false;
  const targetId = enemy.facehuggerAttackV65.targetId;
  enemy.facehuggerAttackV65 = null;
  enemy.attackAnimationClock = 0;
  enemy.attackWindupClock = 0;
  enemy.attackClock = Math.max(finite(enemy.attackClock), FACEHUGGER_COMBAT_V65.cooldown);
  enemy.attacking = false;
  report(engine, enemy, { type: 'enemy-attack-cancelled', targetId, reason });
  return true;
}

function candidatePool(engine) {
  const squad = typeof engine.activeSquadActors === 'function' ? engine.activeSquadActors() : [];
  return [engine.player, engine.coopEnabled ? engine.coop : null, ...squad].filter(Boolean);
}

function withinDetectionRange(engine, enemy, entity) {
  const stealthRadius = Number(engine.stealthRuntime?.detectionRadius);
  if (!Number.isFinite(stealthRadius)) return Math.abs(entity.x - enemy.x) < FACEHUGGER_COMBAT_V65.detectionRange;
  // Match the production stealth wrapper before it applies its post-update
  // correction, so a concealed player cannot arm even one attack frame.
  const actors = [engine.player, engine.coopEnabled ? engine.coop : null].filter(validTarget);
  const radius = Math.max(0, stealthRadius) * (enemy.isBoss ? 1.18 : 1);
  return actors.some((actor) => {
    const visibleActor = targetEntity(engine, actor);
    return Math.hypot(
      visibleActor.x + visibleActor.w / 2 - enemy.x - enemy.w / 2,
      visibleActor.y + visibleActor.h / 2 - enemy.y - enemy.h / 2
    ) <= radius;
  });
}

function beginAttack(engine, enemy, target, entity) {
  const horizontal = entity.x - enemy.x;
  enemy.facing = targetCenterDirection(enemy, entity) || enemy.facing || 1;
  enemy.facehuggerAttackV65 = {
    targetId: resolveEnemyMeleeTargetIdV64(target),
    targetInVehicle: Boolean(target.inVehicle),
    facing: enemy.facing,
    elapsed: 0,
    // Close targets must not make the creature overshoot and hit backwards.
    distance: Math.min(FACEHUGGER_COMBAT_V65.lungeDistance, Math.max(0, Math.abs(horizontal) - FACEHUGGER_COMBAT_V65.stopRange)),
    impactResolved: false
  };
  enemy.attackAnimationClock = FACEHUGGER_COMBAT_V65.duration;
  enemy.attackWindupClock = FACEHUGGER_COMBAT_V65.windup;
  enemy.attackClock = FACEHUGGER_COMBAT_V65.cooldown;
  enemy.attacking = true;
  report(engine, enemy, {
    type: 'enemy-attack-telegraph',
    targetId: enemy.facehuggerAttackV65.targetId,
    windup: FACEHUGGER_COMBAT_V65.windup,
    impactAfter: FACEHUGGER_COMBAT_V65.impact
  });
}

function advanceAttack(engine, enemy, target, delta) {
  const state = enemy.facehuggerAttackV65;
  if (!validTarget(target) || Boolean(target.inVehicle) !== state.targetInVehicle) {
    cancelFacehuggerAttackV65(engine, enemy, 'target-invalid');
    return;
  }
  const entity = targetEntity(engine, target);
  if (finite(enemy.staggerClock) > 0 || finite(enemy.hurtClock) > 0 || finite(enemy.v52HurtClock) > 0) {
    cancelFacehuggerAttackV65(engine, enemy, 'staggered');
    return;
  }
  if (!enemy.alert) {
    cancelFacehuggerAttackV65(engine, enemy, 'lost-target');
    return;
  }
  if (!hasPath(engine, enemy, entity)) {
    cancelFacehuggerAttackV65(engine, enemy, 'path-blocked');
    return;
  }
  if (targetCenterDirection(enemy, entity) === -state.facing) {
    cancelFacehuggerAttackV65(engine, enemy, 'target-crossed');
    return;
  }
  if (feetDistance(enemy, entity) >= FACEHUGGER_COMBAT_V65.verticalRange) {
    cancelFacehuggerAttackV65(engine, enemy, 'target-out-of-range');
    return;
  }

  const previous = state.elapsed;
  state.elapsed = Math.min(FACEHUGGER_COMBAT_V65.duration, previous + delta);
  const travelProgress = (time) => Math.max(0, Math.min(1,
    (time - FACEHUGGER_COMBAT_V65.windup) / (FACEHUGGER_COMBAT_V65.impact - FACEHUGGER_COMBAT_V65.windup)));
  const displacement = state.facing * state.distance * (travelProgress(state.elapsed) - travelProgress(previous));
  enemy.facing = state.facing;
  if (displacement) {
    const motion = moveFacehuggerHorizontallyV65(engine, enemy, displacement);
    if (motion.blocked) {
      cancelFacehuggerAttackV65(engine, enemy, 'collision-blocked');
      return;
    }
  }
  enemy.attackAnimationClock = Math.max(0, FACEHUGGER_COMBAT_V65.duration - state.elapsed);
  enemy.attackWindupClock = Math.max(0, FACEHUGGER_COMBAT_V65.windup - state.elapsed);
  enemy.attacking = true;

  if (!state.impactResolved && state.elapsed + 1e-9 >= FACEHUGGER_COMBAT_V65.impact) {
    state.impactResolved = true;
    const inRange = Math.abs(entity.x - enemy.x) < FACEHUGGER_COMBAT_V65.meleeRange
      && feetDistance(enemy, entity) < FACEHUGGER_COMBAT_V65.verticalRange;
    const pathClear = hasPath(engine, enemy, entity);
    const stillInFront = targetCenterDirection(enemy, entity) !== -state.facing;
    const hit = inRange && pathClear && stillInFront;
    if (hit) {
      if (target.inVehicle) engine.damageVehicle(enemy.damage, enemy.name);
      else if (target.squadMember) engine.damageSquadMember(target, enemy.damage, { source: enemy.name });
      else engine.damagePlayer(target, enemy.damage, { source: enemy.name });
    }
    report(engine, enemy, {
      type: 'enemy-attack-impact', targetId: state.targetId, hit,
      reason: hit ? null : !pathClear ? 'path-blocked' : 'target-out-of-range'
    });
  }
  if (state.elapsed + 1e-9 >= FACEHUGGER_COMBAT_V65.duration) {
    enemy.facehuggerAttackV65 = null;
    enemy.attackAnimationClock = 0;
    enemy.attacking = false;
  }
}

// Return false for every other profile, keeping legacy pouncers unchanged.
// This handler is shared by V51 and the V52 squad branch so switching which
// branch selects the nearest actor never changes an already locked target.
export function updateFacehuggerCombatV65(engine, enemy, delta) {
  if (!isFacehuggerCombatV65(enemy)) return false;
  if (!enemy.alive) {
    cancelFacehuggerAttackV65(engine, enemy, 'enemy-dead');
    return true;
  }
  const safeDelta = Math.max(0, finite(delta));
  // Capture interruption before decaying its timer, even for a slow frame.
  const interrupted = finite(enemy.staggerClock) > 0 || finite(enemy.hurtClock) > 0 || finite(enemy.v52HurtClock) > 0 || finite(enemy.jammedClock) > 0;
  enemy.attackClock = Math.max(0, finite(enemy.attackClock) - safeDelta);
  enemy.rangedClock = finite(enemy.rangedClock) - safeDelta;
  enemy.staggerClock = Math.max(0, finite(enemy.staggerClock) - safeDelta);
  enemy.hurtClock = Math.max(0, finite(enemy.hurtClock) - safeDelta);
  const pool = candidatePool(engine);
  if (enemy.facehuggerAttackV65) {
    if (interrupted) cancelFacehuggerAttackV65(engine, enemy, 'staggered');
    else advanceAttack(engine, enemy, pool.find((target) => resolveEnemyMeleeTargetIdV64(target) === enemy.facehuggerAttackV65.targetId), safeDelta);
    return true;
  }
  enemy.attacking = false;
  if (interrupted) return true;
  const targets = pool.filter((target) => validTarget(target) && (!target.squadMember || !target.inVehicle));
  const target = targets.sort((a, b) => Math.abs(targetEntity(engine, a).x - enemy.x) - Math.abs(targetEntity(engine, b).x - enemy.x))[0];
  if (!target) return true;
  const entity = targetEntity(engine, target);
  const horizontal = entity.x - enemy.x;
  const vertical = feetDistance(enemy, entity);
  const visible = hasPath(engine, enemy, entity);
  // Being the dedicated V65 profile does not grant omniscient detection.
  if (visible && vertical < 160 && (withinDetectionRange(engine, enemy, entity) || enemy.revealed > 0)) enemy.alert = true;
  if (!enemy.alert) {
    enemy.facing = Math.sin(finite(engine.animationTime) * 0.6 + finite(enemy.animationPhase)) > 0 ? 1 : -1;
    const patrolDestination = Math.max(enemy.spawnX - 70, Math.min(enemy.spawnX + 70,
      enemy.x + enemy.facing * enemy.speed * 0.18 * safeDelta));
    moveFacehuggerHorizontallyV65(engine, enemy, patrolDestination - enemy.x);
    return true;
  }
  enemy.facing = targetCenterDirection(enemy, entity) || enemy.facing || 1;
  if (visible && vertical < FACEHUGGER_COMBAT_V65.verticalRange
    && Math.abs(horizontal) < FACEHUGGER_COMBAT_V65.lungeDistance + FACEHUGGER_COMBAT_V65.meleeRange
    && enemy.attackClock <= 0) {
    beginAttack(engine, enemy, target, entity);
  } else if (Math.abs(horizontal) > FACEHUGGER_COMBAT_V65.stopRange && vertical < 160) {
    const approach = Math.min(Math.max(0, Math.abs(horizontal) - FACEHUGGER_COMBAT_V65.stopRange),
      Math.max(0, finite(enemy.speed)) * FACEHUGGER_COMBAT_V65.speedMultiplier * safeDelta);
    moveFacehuggerHorizontallyV65(engine, enemy, enemy.facing * approach);
  }
  return true;
}
