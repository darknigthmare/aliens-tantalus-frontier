import { isEnemyMeleeTargetValidV64, resolveEnemyMeleeTargetIdV64 } from './enemy-combat-runtime-v64.js';

const baseContract = Object.freeze({
  fps: 12, windup: 2 / 12, impact: 5 / 12, duration: 8 / 12,
  maximumStep: 8, detectionRange: 620, verticalRange: 110,
  lungeDistance: 0, speedMultiplier: 1, cooldown: 1.05
});

const contract = (profileId, options) => Object.freeze({
  ...baseContract, ...options, profileId, sheetId: `enemy.profile.${profileId}.v66`
});

// Explicit accepted identities only: an egg, an old atlas or a systemic variant
// must never inherit these attacks merely because its display name is similar.
export const ENEMY_BATCH_COMBAT_CONTRACTS_V66 = Object.freeze({
  'enemy-003-chestburster': contract('enemy-003-chestburster', {
    action: 'low-bite', stopRange: 28, meleeRange: 56, speedMultiplier: 1.12, cooldown: 1.15
  }),
  'enemy-004-drone-big-chap': contract('enemy-004-drone-big-chap', {
    action: 'claw-bite', stopRange: 58, meleeRange: 92, cooldown: 1.08
  }),
  'enemy-005-warrior': contract('enemy-005-warrior', {
    action: 'tail-claw', stopRange: 64, meleeRange: 104, cooldown: 0.95
  }),
  'enemy-006-runner': contract('enemy-006-runner', {
    action: 'pounce-bite', stopRange: 42, meleeRange: 78,
    lungeDistance: 92, speedMultiplier: 1.38, cooldown: 1.3
  }),
  'enemy-020-k-series-yellow-xenomorph': contract('enemy-020-k-series-yellow-xenomorph', {
    action: 'k-series-claw-lunge', stopRange: 62, meleeRange: 104,
    // Source attack pose5 is maximum extension; damage occurs once on that pose.
    impact: 4 / 12, lungeDistance: 56, cooldown: 1.05
  })
});

const bySheet = new Map(Object.values(ENEMY_BATCH_COMBAT_CONTRACTS_V66).map((entry) => [entry.sheetId, entry]));
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const boundedCooldown = (value, entry, fallback = 0) => Math.max(0, Math.min(entry.cooldown, finite(value, fallback)));
const validTarget = (target) => isEnemyMeleeTargetValidV64(target) && !target.ventTransit;
const validEngineTarget = (engine, target) => validTarget(target)
  && (!target.inVehicle || Boolean(engine.vehicle?.active && !engine.vehicle?.destroyed));
const targetEntity = (engine, target) => target?.inVehicle && engine.vehicle?.active ? engine.vehicle : target;
const feetDistance = (enemy, target) => Math.abs((target.y + target.h) - (enemy.y + enemy.h));
const directionTo = (enemy, target) => Math.sign((target.x + target.w / 2) - (enemy.x + enemy.w / 2));
const pathClear = (engine, enemy, target) => {
  if (!engine.enemyMeleePathClearV64(enemy, target)) return false;
  // The legacy strike ray includes walls/doors but omits physical covers.
  // Stationary attacks must also respect those solid gameplay obstacles.
  const movingRight = directionTo(enemy, target) >= 0;
  const gapStart = movingRight ? enemy.x + enemy.w : target.x + target.w;
  const gapEnd = movingRight ? target.x : enemy.x;
  const top = Math.max(enemy.y, target.y);
  const bottom = Math.min(enemy.y + enemy.h, target.y + target.h);
  if (gapEnd <= gapStart || bottom <= top) return true;
  return !(engine.covers || []).some((cover) => !cover.destroyed
    && cover.x < gapEnd && cover.x + cover.w > gapStart
    && cover.y < bottom && cover.y + cover.h > top);
};
const interrupted = (enemy) => ['staggerClock', 'hurtClock', 'v52HurtClock', 'jammedClock'].some((key) => finite(enemy[key]) > 0);
const report = (engine, enemy, entry, details) => engine.onEvent?.({
  enemyId: enemy.id, behavior: enemy.behavior, profileId: entry.profileId, action: entry.action, ...details
});

export function resolveEnemyBatchCombatContractV66(enemy) {
  return bySheet.get(enemy?.visualSheetId) || null;
}

export function isEnemyBatchCombatV66(enemy) {
  return Boolean(resolveEnemyBatchCombatContractV66(enemy));
}

// A renderer can sample this same timeline instead of advancing an independent
// clock. It returns a local 0..7 frame, not a global atlas cell number.
export function getEnemyBatchAttackFrameV66(enemy) {
  const entry = resolveEnemyBatchCombatContractV66(enemy);
  if (!entry || !enemy.batchAttackV66) return null;
  return Math.max(0, Math.min(7, Math.floor(finite(enemy.batchAttackV66.elapsed) * entry.fps + 1e-9)));
}

export function moveEnemyBatchHorizontallyV66(engine, enemy, displacement) {
  const entry = resolveEnemyBatchCombatContractV66(enemy);
  if (!entry) return { travelled: 0, blocked: false };
  const startX = enemy.x;
  let remaining = finite(displacement);
  while (Math.abs(remaining) > 1e-6) {
    const step = Math.sign(remaining) * Math.min(Math.abs(remaining), entry.maximumStep);
    const previousX = enemy.x;
    enemy.facing = Math.sign(step);
    enemy.x += step;
    engine.resolveEnemyHorizontal(enemy, previousX);
    const worldWidth = Number(engine.missionLevelBounds?.width);
    const outside = Number.isFinite(worldWidth) && (enemy.x < 0 || enemy.x + enemy.w > worldWidth);
    const unsupported = engine.missionLevelRuntime && typeof engine.missionLevelSurfaceFor === 'function'
      && !engine.missionLevelSurfaceFor(enemy, { tolerance: 40, preferId: enemy.levelNavigation?.surfaceId });
    if (outside || unsupported) {
      // A pounce cannot hit across a pit and only then be snapped back by
      // the level wrapper. Every swept sub-step must have physical support.
      enemy.x = previousX;
      return { travelled: enemy.x - startX, blocked: true };
    }
    if (Math.abs((enemy.x - previousX) - step) > 1e-6) {
      return { travelled: enemy.x - startX, blocked: true };
    }
    remaining -= step;
  }
  return { travelled: enemy.x - startX, blocked: false };
}

export function cancelEnemyBatchAttackV66(engine, enemy, reason = 'target-invalid') {
  const entry = resolveEnemyBatchCombatContractV66(enemy);
  if (!entry || !enemy.batchAttackV66) return false;
  const targetId = enemy.batchAttackV66.targetId;
  enemy.batchAttackV66 = null;
  enemy.attackAnimationClock = 0;
  enemy.attackWindupClock = 0;
  enemy.attackClock = Math.max(finite(enemy.attackClock), entry.cooldown);
  enemy.attacking = false;
  report(engine, enemy, entry, { type: 'enemy-attack-cancelled', targetId, reason });
  return true;
}

function candidatePool(engine) {
  const squad = typeof engine.activeSquadActors === 'function' ? engine.activeSquadActors() : [];
  return [engine.player, engine.coopEnabled ? engine.coop : null, ...squad].filter(Boolean);
}

export function selectEnemyBatchTargetV66(engine, enemy) {
  const targets = candidatePool(engine).filter((target) => validEngineTarget(engine, target)
    && (!target.squadMember || !target.inVehicle));
  if (enemy.batchAttackV66) {
    return targets.find((target) => resolveEnemyMeleeTargetIdV64(target) === enemy.batchAttackV66.targetId) || null;
  }
  return targets.sort((a, b) => Math.abs(targetEntity(engine, a).x - enemy.x)
    - Math.abs(targetEntity(engine, b).x - enemy.x))[0] || null;
}

function withinDetectionRange(engine, enemy, entity, entry) {
  const stealthRadius = Number(engine.stealthRuntime?.detectionRadius);
  if (!Number.isFinite(stealthRadius)) return Math.abs(entity.x - enemy.x) < entry.detectionRange;
  const factor = enemy.isBoss ? 1.18 : enemy.behavior === 'stalker' ? 1.08 : 1;
  const radius = Math.max(0, stealthRadius) * factor;
  // The existing stealth lifecycle belongs to player/coop detection; an escort
  // becoming the nearest target must not reveal a hidden player for one frame.
  return [engine.player, engine.coopEnabled ? engine.coop : null].filter(validTarget).some((actor) => {
    const visibleActor = targetEntity(engine, actor);
    return Math.hypot(
      visibleActor.x + visibleActor.w / 2 - enemy.x - enemy.w / 2,
      visibleActor.y + visibleActor.h / 2 - enemy.y - enemy.h / 2
    ) <= radius;
  });
}

function beginAttack(engine, enemy, target, entity, entry) {
  enemy.facing = directionTo(enemy, entity) || enemy.facing || 1;
  enemy.batchAttackV66 = {
    targetId: resolveEnemyMeleeTargetIdV64(target), targetInVehicle: Boolean(target.inVehicle),
    facing: enemy.facing, elapsed: 0, impactResolved: false,
    distance: Math.min(entry.lungeDistance, Math.max(0, Math.abs(entity.x - enemy.x) - entry.stopRange))
  };
  enemy.attackClock = entry.cooldown;
  enemy.attackWindupClock = entry.windup;
  enemy.attackAnimationClock = entry.duration;
  enemy.attacking = true;
  report(engine, enemy, entry, {
    type: 'enemy-attack-telegraph', targetId: enemy.batchAttackV66.targetId,
    windup: entry.windup, impactAfter: entry.impact, duration: entry.duration
  });
}

function advanceAttack(engine, enemy, target, delta, entry) {
  const state = enemy.batchAttackV66;
  if (!validEngineTarget(engine, target) || Boolean(target.inVehicle) !== state.targetInVehicle) {
    cancelEnemyBatchAttackV66(engine, enemy, 'target-invalid');
    return;
  }
  const entity = targetEntity(engine, target);
  let cancellation = !enemy.alert ? 'lost-target' : null;
  if (!cancellation && !pathClear(engine, enemy, entity)) cancellation = 'path-blocked';
  if (!cancellation && directionTo(enemy, entity) === -state.facing) cancellation = 'target-crossed';
  if (!cancellation && feetDistance(enemy, entity) >= entry.verticalRange) cancellation = 'target-out-of-range';
  if (cancellation) {
    cancelEnemyBatchAttackV66(engine, enemy, cancellation);
    return;
  }
  const previous = state.elapsed;
  state.elapsed = Math.min(entry.duration, previous + delta);
  const progress = (time) => Math.max(0, Math.min(1, (time - entry.windup) / (entry.impact - entry.windup)));
  const displacement = state.facing * state.distance * (progress(state.elapsed) - progress(previous));
  enemy.facing = state.facing;
  if (displacement && moveEnemyBatchHorizontallyV66(engine, enemy, displacement).blocked) {
    cancelEnemyBatchAttackV66(engine, enemy, 'collision-blocked');
    return;
  }
  enemy.attackAnimationClock = Math.max(0, entry.duration - state.elapsed);
  enemy.attackWindupClock = Math.max(0, entry.windup - state.elapsed);
  enemy.attacking = true;
  if (!state.impactResolved && state.elapsed + 1e-9 >= entry.impact) {
    // Mark resolved before invoking gameplay callbacks: reentrant damage or
    // later recovery frames cannot replay this impact or transfer its target.
    state.impactResolved = true;
    const inRange = Math.abs(entity.x - enemy.x) < entry.meleeRange
      && feetDistance(enemy, entity) < entry.verticalRange;
    const clear = pathClear(engine, enemy, entity);
    const inFront = directionTo(enemy, entity) !== -state.facing;
    const hit = inRange && clear && inFront;
    if (hit) {
      if (target.inVehicle) engine.damageVehicle(enemy.damage, enemy.name);
      else if (target.squadMember) engine.damageSquadMember(target, enemy.damage, { source: enemy.name });
      else engine.damagePlayer(target, enemy.damage, { source: enemy.name });
    }
    report(engine, enemy, entry, {
      type: 'enemy-attack-impact', targetId: state.targetId, hit,
      reason: hit ? null : !clear ? 'path-blocked' : !inFront ? 'target-crossed' : 'target-out-of-range'
    });
  }
  if (state.elapsed + 1e-9 >= entry.duration) {
    enemy.batchAttackV66 = null;
    enemy.attackAnimationClock = 0;
    enemy.attackWindupClock = 0;
    enemy.attacking = false;
  }
}

// Call before legacy combat in both V51 and V52's squad branch. The shared
// actor pool preserves a locked target when either branch becomes nearest.
export function updateEnemyBatchCombatV66(engine, enemy, delta) {
  if (!isEnemyBatchCombatV66(enemy)) return false;
  const previousX = enemy.x;
  const safeDelta = Math.max(0, Math.min(1, finite(delta)));
  try {
    return advanceEnemyBatchCombatV66(engine, enemy, safeDelta);
  } finally {
    // The collision resolver clears vx as scratch state. Animation needs the
    // displacement actually achieved, including a wall-blocked zero step.
    enemy.vx = safeDelta > 0 && enemy.alive ? (enemy.x - previousX) / safeDelta : 0;
  }
}

function advanceEnemyBatchCombatV66(engine, enemy, delta) {
  const entry = resolveEnemyBatchCombatContractV66(enemy);
  if (!entry) return false;
  if (!enemy.alive || enemy.ventTransit || enemy.captured) {
    cancelEnemyBatchAttackV66(engine, enemy, !enemy.alive ? 'enemy-dead' : enemy.ventTransit ? 'enemy-in-vent' : 'enemy-captured');
    enemy.attacking = false;
    return true;
  }
  const safeDelta = Math.max(0, Math.min(1, finite(delta)));
  const wasInterrupted = interrupted(enemy);
  enemy.attackClock = Math.max(0, finite(enemy.attackClock) - safeDelta);
  enemy.rangedClock = finite(enemy.rangedClock) - safeDelta;
  enemy.staggerClock = Math.max(0, finite(enemy.staggerClock) - safeDelta);
  enemy.hurtClock = Math.max(0, finite(enemy.hurtClock) - safeDelta);
  const pool = candidatePool(engine);
  if (enemy.batchAttackV66) {
    if (wasInterrupted) cancelEnemyBatchAttackV66(engine, enemy, 'staggered');
    else advanceAttack(engine, enemy, pool.find((target) => resolveEnemyMeleeTargetIdV64(target) === enemy.batchAttackV66.targetId), safeDelta, entry);
    return true;
  }
  enemy.attacking = false;
  if (wasInterrupted) return true;
  const target = selectEnemyBatchTargetV66(engine, enemy);
  if (!target) return true;
  const entity = targetEntity(engine, target);
  const horizontal = entity.x - enemy.x;
  const vertical = feetDistance(enemy, entity);
  const visible = pathClear(engine, enemy, entity);
  if (visible && vertical < 160 && (withinDetectionRange(engine, enemy, entity, entry) || enemy.revealed > 0)) enemy.alert = true;
  if (!enemy.alert) {
    enemy.facing = Math.sin(finite(engine.animationTime) * 0.6 + finite(enemy.animationPhase)) > 0 ? 1 : -1;
    const spawnX = finite(enemy.spawnX, enemy.x);
    const destination = Math.max(spawnX - 70, Math.min(spawnX + 70,
      enemy.x + enemy.facing * Math.max(0, finite(enemy.speed)) * 0.18 * safeDelta));
    moveEnemyBatchHorizontallyV66(engine, enemy, destination - enemy.x);
    return true;
  }
  enemy.facing = directionTo(enemy, entity) || enemy.facing || 1;
  if (visible && vertical < entry.verticalRange && Math.abs(horizontal) < entry.lungeDistance + entry.meleeRange && enemy.attackClock <= 0) {
    beginAttack(engine, enemy, target, entity, entry);
  } else if (Math.abs(horizontal) > entry.stopRange && vertical < 160) {
    const approach = Math.min(Math.abs(horizontal) - entry.stopRange,
      Math.max(0, finite(enemy.speed)) * entry.speedMultiplier * safeDelta);
    moveEnemyBatchHorizontallyV66(engine, enemy, enemy.facing * approach);
  }
  return true;
}

// Serialize only a bounded cooldown and an interrupted-attack marker. A save
// must never persist a target id, a pending hit or an animation playback cursor.
export function captureEnemyBatchCombatResumeV66(enemy) {
  const entry = resolveEnemyBatchCombatContractV66(enemy);
  return entry ? {
    attackClock: boundedCooldown(enemy.attackClock, entry),
    batchAttackActiveV66: Boolean(enemy.batchAttackV66)
  } : {};
}

export function restoreEnemyBatchCombatResumeV66(enemy, source = {}) {
  const entry = resolveEnemyBatchCombatContractV66(enemy);
  if (!entry) return false;
  const existing = boundedCooldown(enemy.attackClock, entry);
  enemy.attackClock = Math.max(boundedCooldown(source?.attackClock, entry, existing),
    source?.batchAttackActiveV66 === true ? entry.duration : 0);
  enemy.batchAttackV66 = null;
  enemy.attackAnimationClock = 0;
  enemy.attackWindupClock = 0;
  enemy.attacking = false;
  enemy.pendingMelee = false;
  enemy.pendingMeleeTargetId = null;
  return true;
}
