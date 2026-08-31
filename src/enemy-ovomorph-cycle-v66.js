import { ENEMIES } from './content-core-v50.js';
import { isEnemyMeleeTargetValidV64 } from './enemy-combat-runtime-v64.js';

export const OVOMORPH_CYCLE_V66 = Object.freeze({
  profileId: 'enemy-001-ovomorph', sheetId: 'enemy.profile.enemy-001-ovomorph.v66',
  childProfileId: 'enemy-002-facehugger', childSheetId: 'enemy.profile.enemy-002-facehugger.v65',
  triggerRange: 172, verticalRange: 110, frames: 8,
  sealedFps: 6, openingFps: 8, hatchFps: 10, destroyedFps: 10,
  openingDuration: 1, hatchDuration: 0.8, releaseTime: 0.5, destroyedDuration: 0.8
});

const childSource = ENEMIES.find((entry) => entry.id === OVOMORPH_CYCLE_V66.childProfileId);
const phases = new Set(['sealed', 'opening', 'hatch', 'spent', 'destroyed']);
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
const record = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const validTarget = (target) => isEnemyMeleeTargetValidV64(target) && !target.ventTransit;
const targetEntity = (engine, target) => target?.inVehicle && engine.vehicle?.active ? engine.vehicle : target;
const event = (engine, egg, details) => engine.onEvent?.({
  enemyId: egg.id, profileId: OVOMORPH_CYCLE_V66.profileId, ...details
});

export function isOvomorphCycleV66(enemy) {
  return enemy?.visualSheetId === OVOMORPH_CYCLE_V66.sheetId;
}

// Most runtime ids are short. Long ids retain a hash suffix so the resume
// serializer's 160-character boundary cannot collapse distinct parent ids.
export function getOvomorphChildIdV66(egg) {
  const id = typeof egg?.id === 'string' ? egg.id : '';
  if (!id) return null;
  const short = `${id}:facehugger-v66`;
  if (short.length <= 160) return short;
  let hash = 14695981039346656037n;
  for (const codePoint of id) hash = BigInt.asUintN(64, (hash ^ BigInt(codePoint.codePointAt(0))) * 1099511628211n);
  return `${id.slice(0, 120)}:hatch:${hash.toString(16).padStart(16, '0')}`;
}

function phaseLimit(phase) {
  if (phase === 'sealed') return OVOMORPH_CYCLE_V66.frames / OVOMORPH_CYCLE_V66.sealedFps;
  if (phase === 'opening') return OVOMORPH_CYCLE_V66.openingDuration;
  return OVOMORPH_CYCLE_V66.hatchDuration;
}

function ensureState(egg) {
  if (!record(egg.ovomorphCycleV66)) {
    egg.ovomorphCycleV66 = {
      phase: egg.alive ? 'sealed' : 'destroyed', elapsed: 0,
      spawned: false, childId: getOvomorphChildIdV66(egg), releaseBlocked: false
    };
  }
  return egg.ovomorphCycleV66;
}

function actorPool(engine) {
  const squad = typeof engine.activeSquadActors === 'function' ? engine.activeSquadActors() : [];
  return [engine.player, engine.coopEnabled ? engine.coop : null, ...squad].filter(Boolean);
}

function nearestTrigger(engine, egg) {
  return actorPool(engine).filter(validTarget)
    .filter((actor) => !actor.inVehicle || Boolean(engine.vehicle?.active && !engine.vehicle.destroyed))
    .map((actor) => ({ actor, entity: targetEntity(engine, actor) }))
    .filter(({ entity }) => Math.abs((entity.y + entity.h) - (egg.y + egg.h)) < OVOMORPH_CYCLE_V66.verticalRange)
    .filter(({ entity }) => Math.abs(entity.x + entity.w / 2 - egg.x - egg.w / 2) <= OVOMORPH_CYCLE_V66.triggerRange)
    .filter(({ entity }) => engine.enemyMeleePathClearV64(egg, entity))
    .sort((a, b) => Math.abs(a.entity.x - egg.x) - Math.abs(b.entity.x - egg.x))[0] || null;
}

function staticObstacles(engine) {
  const doors = typeof engine.closedDoorColliders === 'function' ? engine.closedDoorColliders() : [];
  return [...(engine.walls || []), ...doors, ...(engine.covers || []).filter((cover) => !cover.destroyed)];
}

function insideWorld(engine, entity) {
  const width = Math.max(1, finite(engine.missionLevelBounds?.width, 6200));
  const height = Math.max(1, finite(engine.missionLevelBounds?.height, 1080));
  return entity.x >= 0 && entity.x + entity.w <= width && entity.y >= 0 && entity.y + entity.h <= height;
}

function spawnPositionClear(engine, egg, child) {
  if (!insideWorld(engine, child)) return false;
  const obstacles = staticObstacles(engine);
  if (obstacles.some((obstacle) => overlaps(child, obstacle))) return false;
  if (!engine.enemyMeleePathClearV64(egg, child)) return false;
  // Prevent choosing a free-looking position across a small cover. Hatching
  // is an emergence next to the egg, not teleportation through an obstacle.
  const corridor = {
    x: Math.min(egg.x, child.x), y: Math.max(egg.y, child.y),
    w: Math.max(egg.x + egg.w, child.x + child.w) - Math.min(egg.x, child.x),
    h: Math.min(egg.y + egg.h, child.y + child.h) - Math.max(egg.y, child.y)
  };
  if (corridor.h > 0 && obstacles.some((obstacle) => overlaps(corridor, obstacle))) return false;
  const actors = actorPool(engine).filter(validTarget).map((actor) => targetEntity(engine, actor));
  const enemies = (engine.enemies || []).filter((enemy) => enemy !== egg && enemy.alive && !enemy.dormant && !enemy.ventTransit);
  if ([...actors, ...enemies].some((actor) => overlaps(child, actor))) return false;
  if (engine.vehicle?.active && !engine.vehicle.destroyed && overlaps(child, engine.vehicle)) return false;
  if (engine.missionLevelRuntime && typeof engine.missionLevelSurfaceFor === 'function') {
    const surface = engine.missionLevelSurfaceFor(child, { tolerance: 16 });
    if (!surface || Math.abs(surface.y - child.y - child.h) > 16) return false;
  }
  return true;
}

function createChild(engine, egg) {
  if (!childSource || typeof engine.createEnemy !== 'function') return null;
  const child = engine.createEnemy(childSource, (engine.enemies || []).length, egg.x, egg.y + egg.h,
    { boss: false, keyCarrier: false });
  if (!child || child.visualSheetId !== OVOMORPH_CYCLE_V66.childSheetId) return null;
  child.id = getOvomorphChildIdV66(egg);
  if (!child.id) return null;
  child.ovomorphParentIdV66 = egg.id;
  child.isBoss = false;
  child.keyCarrier = false;
  child.facing = egg.facing < 0 ? -1 : 1;
  return child;
}

// No placeholder actor: the existing factory resolves the actual standard
// Facehugger V65 sheet, hitbox, AI and combat identity.
export function releaseOvomorphFacehuggerV66(engine, egg) {
  if (!isOvomorphCycleV66(egg) || !egg.alive || egg.captured) return null;
  if (finite(egg.jammedClock) > 0 || finite(egg.staggerClock) > 0) return null;
  const state = ensureState(egg);
  if (state.phase !== 'hatch' || state.elapsed + 1e-9 < OVOMORPH_CYCLE_V66.releaseTime) return null;
  const childId = getOvomorphChildIdV66(egg);
  if (!childId) return null;
  const existing = (engine.enemies || []).find((enemy) => enemy.id === childId);
  if (existing) {
    state.spawned = true;
    state.childId = childId;
    state.releaseBlocked = false;
    return existing;
  }
  if (state.spawned) return null;
  const child = createChild(engine, egg);
  if (!child) return null;
  const near = nearestTrigger(engine, egg);
  const direction = near ? Math.sign(near.entity.x + near.entity.w / 2 - egg.x - egg.w / 2) || 1 : child.facing;
  const sidePositions = direction > 0
    ? [egg.x + egg.w + 6, egg.x - child.w - 6]
    : [egg.x - child.w - 6, egg.x + egg.w + 6];
  const positions = [...sidePositions, egg.x + (egg.w - child.w) / 2];
  const selected = positions.find((x) => {
    child.x = x;
    return spawnPositionClear(engine, egg, child);
  });
  if (selected === undefined) {
    state.releaseBlocked = true;
    return null;
  }
  child.x = selected;
  child.spawnX = selected;
  child.facing = direction;
  child.alert = Boolean(near);
  child.attackClock = Math.max(0.35, finite(child.attackClock));
  // Commit the one-time marker before exposing the actor or dispatching an
  // event, including if callbacks reenter this release function.
  state.spawned = true;
  state.childId = childId;
  state.releaseBlocked = false;
  if (!Array.isArray(engine.enemies)) engine.enemies = [];
  engine.enemies.push(child);
  engine.initializeEnemyMissionNavigation?.(child);
  event(engine, egg, { type: 'ovomorph-hatched', childId, childProfileId: OVOMORPH_CYCLE_V66.childProfileId });
  return child;
}

export function getOvomorphAnimationV66(egg) {
  if (!isOvomorphCycleV66(egg)) return null;
  const state = ensureState(egg);
  const phase = !egg.alive ? 'destroyed' : state.phase;
  const clipId = phase === 'spent' ? 'hatch' : phase;
  const fps = phase === 'sealed' ? OVOMORPH_CYCLE_V66.sealedFps
    : phase === 'opening' ? OVOMORPH_CYCLE_V66.openingFps : 10;
  let elapsed = phase === 'destroyed' && state.phase !== 'destroyed' ? 0 : Math.max(0, finite(state.elapsed));
  if (phase === 'destroyed' && Number.isFinite(Number(egg.deathClock))) {
    // V51 initializes deathClock to 2.8s and decays it outside updateEnemy.
    // Also support renderers reached before the egg's first dead update.
    elapsed = Math.max(elapsed, clamp(2.8 - Number(egg.deathClock), 0, OVOMORPH_CYCLE_V66.destroyedDuration));
  }
  const localFrame = phase === 'spent' ? 7 : phase === 'sealed'
    ? Math.floor(elapsed * fps + 1e-9) % 8
    : clamp(Math.floor(elapsed * fps + 1e-9), 0, 7);
  const offset = clipId === 'sealed' ? 0 : clipId === 'opening' ? 8 : clipId === 'hatch' ? 16 : 24;
  return { sheetId: OVOMORPH_CYCLE_V66.sheetId, clipId, frame: offset + localFrame,
    localFrame, cell: offset + localFrame, fps, loop: phase === 'sealed' };
}

export function updateOvomorphCycleV66(engine, egg, delta) {
  if (!isOvomorphCycleV66(egg)) return false;
  const state = ensureState(egg);
  const safeDelta = clamp(finite(delta), 0, 1);
  egg.vx = 0;
  egg.vy = 0;
  egg.attacking = false;
  if (!egg.alive || egg.captured) {
    if (state.phase !== 'destroyed') {
      state.phase = 'destroyed';
      state.elapsed = 0;
      state.releaseBlocked = false;
    }
    state.elapsed = Math.min(OVOMORPH_CYCLE_V66.destroyedDuration, state.elapsed + safeDelta);
    return true;
  }
  if (egg.dormant || egg.ventTransit) return true;
  // This lifecycle owns the timers normally advanced by legacy enemy AI.
  // V52's outer egg route avoids both a skipped tick and a double tick.
  // v52HurtClock remains owned by the global Mission.update loop instead.
  const interruptedFor = Math.max(0, finite(egg.jammedClock), finite(egg.staggerClock));
  for (const key of ['jammedClock', 'staggerClock', 'hurtClock']) {
    egg[key] = Math.max(0, finite(egg[key]) - safeDelta);
  }
  const activeDelta = Math.max(0, safeDelta - Math.min(safeDelta, interruptedFor));
  if (state.phase === 'destroyed' || state.phase === 'spent') return true;
  if (state.phase === 'sealed') {
    state.elapsed = (state.elapsed + safeDelta) % phaseLimit('sealed');
    if ((interruptedFor <= 0 || activeDelta > 0) && nearestTrigger(engine, egg)) {
      state.phase = 'opening';
      state.elapsed = 0;
      event(engine, egg, { type: 'ovomorph-opening' });
    }
    return true;
  }
  // Never reseal an opened egg or clear its one-time release marker. A jam
  // or a stun only suspends the current opening/hatch cursor until expiry.
  if (interruptedFor > 0 && activeDelta <= 0) return true;
  let remaining = activeDelta;
  if (state.phase === 'opening') {
    const used = Math.min(remaining, OVOMORPH_CYCLE_V66.openingDuration - state.elapsed);
    state.elapsed += used;
    remaining -= used;
    if (state.elapsed + 1e-9 < OVOMORPH_CYCLE_V66.openingDuration) return true;
    state.phase = 'hatch';
    state.elapsed = 0;
  }
  if (state.phase === 'hatch') {
    state.elapsed = Math.min(OVOMORPH_CYCLE_V66.hatchDuration, state.elapsed + remaining);
    if (!state.spawned && state.elapsed + 1e-9 >= OVOMORPH_CYCLE_V66.releaseTime) {
      releaseOvomorphFacehuggerV66(engine, egg);
      if (!state.spawned) {
        // Preserve frame 5 until a safe physical emergence is possible. No
        // overlapping child, no false spent state, and no busy spawn rewards.
        state.elapsed = OVOMORPH_CYCLE_V66.releaseTime;
        return true;
      }
    }
    if (state.spawned && state.elapsed + 1e-9 >= OVOMORPH_CYCLE_V66.hatchDuration) {
      state.phase = 'spent';
      state.elapsed = OVOMORPH_CYCLE_V66.hatchDuration;
    }
  }
  return true;
}

export function captureOvomorphCycleResumeV66(enemy) {
  if (isOvomorphCycleV66(enemy)) {
    const state = ensureState(enemy);
    const phase = phases.has(state.phase) ? state.phase : 'sealed';
    return { ovomorphCycleV66: {
      phase, elapsed: clamp(finite(state.elapsed), 0, phaseLimit(phase)),
      spawned: state.spawned === true, childId: getOvomorphChildIdV66(enemy)
    } };
  }
  if (enemy?.visualSheetId === OVOMORPH_CYCLE_V66.childSheetId && typeof enemy.ovomorphParentIdV66 === 'string') {
    return { ovomorphParentIdV66: enemy.ovomorphParentIdV66.slice(0, 160) };
  }
  return {};
}

export function restoreOvomorphCycleResumeV66(egg, source = {}) {
  if (!isOvomorphCycleV66(egg)) return false;
  const saved = record(source?.ovomorphCycleV66) ? source.ovomorphCycleV66 : {};
  let phase = phases.has(saved.phase) ? saved.phase : 'sealed';
  const spawned = saved.spawned === true || phase === 'spent';
  if (!egg.alive || egg.captured || phase === 'destroyed') {
    phase = 'destroyed';
    egg.alive = false;
    egg.health = 0;
  } else if (spawned && (phase === 'sealed' || phase === 'opening')) phase = 'spent';
  let elapsed = clamp(finite(saved.elapsed), 0, phaseLimit(phase));
  if (phase === 'hatch' && !spawned) elapsed = Math.min(elapsed, OVOMORPH_CYCLE_V66.releaseTime);
  if (phase === 'spent') elapsed = OVOMORPH_CYCLE_V66.hatchDuration;
  egg.ovomorphCycleV66 = { phase, elapsed, spawned, childId: getOvomorphChildIdV66(egg), releaseBlocked: false };
  egg.attacking = false;
  egg.vx = 0;
  egg.vy = 0;
  return true;
}

// Call BEFORE the host builds its enemiesById restore map. Only a saved child
// with the canonical id AND an existing egg's one-time release proof may be
// reconstructed. The host then restores its ordinary health/position fields.
export function prepareOvomorphResumeChildrenV66(engine, enemyRecords = []) {
  if (!Array.isArray(enemyRecords) || !Array.isArray(engine.enemies)) return 0;
  const savedById = new Map(enemyRecords.filter(record).map((entry) => [entry.id, entry]));
  const existingById = new Map(engine.enemies.map((enemy) => [enemy.id, enemy]));
  let created = 0;
  for (const source of enemyRecords) {
    if (!record(source) || typeof source.ovomorphParentIdV66 !== 'string') continue;
    const parent = existingById.get(source.ovomorphParentIdV66);
    if (!isOvomorphCycleV66(parent) || source.id !== getOvomorphChildIdV66(parent)) continue;
    const parentState = savedById.get(parent.id)?.ovomorphCycleV66;
    if (!record(parentState) || !(parentState.spawned === true || parentState.phase === 'spent')) continue;
    if (existingById.has(source.id)) continue;
    const child = createChild(engine, parent);
    if (!child) continue;
    const width = Math.max(child.w, finite(engine.missionLevelBounds?.width, 6200));
    const height = Math.max(child.h, finite(engine.missionLevelBounds?.height, 1080));
    child.x = clamp(finite(source.x, parent.x), 0, width - child.w);
    child.y = clamp(finite(source.y, parent.y + parent.h - child.h), 0, height - child.h);
    child.spawnX = child.x;
    child.groundY = child.y + child.h;
    child.alive = source.alive !== false && !source.captured;
    child.health = child.alive ? clamp(finite(source.health, child.health), 1, child.maxHealth) : 0;
    child.deathClock = child.alive ? 0 : clamp(finite(source.deathClock), 0, 30);
    child.attacking = false;
    child.facehuggerAttackV65 = null;
    child.attackAnimationClock = 0;
    child.attackWindupClock = 0;
    child.attackClock = Math.max(OVOMORPH_CYCLE_V66.hatchDuration, finite(child.attackClock));
    engine.enemies.push(child);
    existingById.set(child.id, child);
    if (child.alive) engine.initializeEnemyMissionNavigation?.(child);
    created += 1;
  }
  return created;
}
