import { HUMAN_VISUAL_CONTRACT_V133, HUMAN_ATLAS_METRICS_V133, isHumanPoseV133 } from './human-visual-contract-v133.js';

// Two authored footfalls spend one physical stride. Keep this length fixed:
// redividing historical travel by current speed makes braking jump in phase.
export const ENEMY_DISTANCE_GAIT_V141 = Object.freeze({
  schema: 141, stride: HUMAN_VISUAL_CONTRACT_V133.standingHeight * .78,
  maximumObservationGap: .5, displacementEpsilon: 1e-7
});
const humanAtlasPaths = new Set(HUMAN_ATLAS_METRICS_V133.map(entry => entry.path));
const finite = (number, fallback = 0) => Number.isFinite(number) ? number : fallback;

/** Explicit admitted art only. Creatures and mechanical loaders keep their clips. */
export function isEnemyDistanceGaitV141(actor, definition = null) {
  return Boolean(actor && (isHumanPoseV133(definition, actor)
    || isHumanPoseV133({ id: actor.profileId || String(actor.id || '').split(':')[0] }, actor)));
}

export function isEnemyDistanceGaitClipV141(sheet, clip) {
  return Boolean(sheet?.family === 'enemy' && humanAtlasPaths.has(sheet.path) && clip?.loop
    && ['idle', 'idle-walk', 'chase', 'move', 'walk', 'walk-run'].includes(clip.id));
}

export function canEnemyDistanceGaitMoveV141(actor, movementEnabled = true) {
  return Boolean(actor && movementEnabled !== false && actor.alive !== false && !actor.downed
    && actor.grounded !== false && !actor.climbing && !actor.inVehicle && !actor.dormant
    && !actor.ventTransit && !actor.attacking && !actor.pendingMelee
    && Math.abs(finite(actor.vy)) <= 1
    && !['attackAnimationClock', 'attackWindupClock', 'staggerClock', 'hurtClock', 'v52HurtClock']
      .some(key => finite(actor[key]) > 0));
}

/** Pure observation: no actor/save fields, velocity integration or render-clock steps.
 * Repeated draws and frozen clocks reuse the same observation. Visibility gaps,
 * scene changes and teleports seed a new position without spending missed travel.
 * Pauses and action clips retain the accumulated gait for the next real step. */
export function advanceEnemyDistanceGaitV141(previous, actor, timeSeconds,
  { context = '', movementEnabled = true, reducedMotion = false } = {}) {
  if (!actor || ![actor.x, actor.y, timeSeconds].every(Number.isFinite)) return null;
  const time = Math.max(0, timeSeconds), enabled = canEnemyDistanceGaitMoveV141(actor, movementEnabled);
  const sameContext = previous?.context === context && time >= previous.time;
  if (sameContext && time === previous.time && actor.x === previous.x && actor.y === previous.y
    && (previous.enabled === enabled || movementEnabled === false && canEnemyDistanceGaitMoveV141(actor))
    && previous.reducedMotion === Boolean(reducedMotion)) return previous;
  const elapsed = sameContext ? time - previous.time : 0;
  const continuous = sameContext && elapsed > 0 && elapsed <= ENEMY_DISTANCE_GAIT_V141.maximumObservationGap;
  const dx = continuous ? actor.x - previous.x : 0;
  const speed = Math.max(Math.abs(finite(actor.vx)), Math.abs(finite(previous?.vx)), Math.abs(finite(actor.speed)));
  const physical = continuous && Math.abs(dx) <= Math.max(4, speed * elapsed * 2 + 1)
    && Math.abs(actor.y - previous.y) <= Math.max(2, elapsed * 8);
  const travelled = enabled && physical ? Math.abs(dx) : 0;
  const stride = ENEMY_DISTANCE_GAIT_V141.stride;
  const distance = (sameContext ? previous.distance : 0) + travelled;
  const cycles = (sameContext ? previous.cycles : 0) + travelled / stride;
  // Historical campaign actors can reset vx after a swept displacement. The
  // observed body contact, rather than that transient intent, owns the frame.
  const moving = enabled && travelled > ENEMY_DISTANCE_GAIT_V141.displacementEpsilon;
  return Object.freeze({ schema: 141, context, time, x: actor.x, y: actor.y, vx: finite(actor.vx),
    enabled, reducedMotion: Boolean(reducedMotion), distance, stride, cycles,
    phase: cycles % 1, moving, reseeded: !continuous || !physical,
    stepsPerSecond: moving ? travelled / elapsed * 2 / stride : 0,
    suppressEvents: !moving || !physical || Boolean(reducedMotion) });
}

/** A stopped humanoid uses the authored neutral/support cell. Accessibility
 * retains distance-owned foot contacts and suppresses passive step events. */
export function enemyDistanceGaitFrameV141(state, frameCount) {
  if (!state || !Number.isInteger(frameCount) || frameCount <= 0) return 0;
  return state.moving ? Math.floor(state.cycles * frameCount + 1e-9) % frameCount : 0;
}

/** One renderer owns each WeakMap; clocks and actors never become save data. */
export function createEnemyDistanceGaitTrackerV141() {
  const states = new WeakMap();
  return (actor, timeSeconds, options) => {
    const state = advanceEnemyDistanceGaitV141(states.get(actor), actor, timeSeconds, options);
    if (state) states.set(actor, state);
    return state;
  };
}
