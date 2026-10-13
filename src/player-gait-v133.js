const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, finite(value, low)));
export const HUMAN_GAIT_PROFILES_V133 = Object.freeze({
  walk: Object.freeze({ heightStride: 1.02, duty: .6, lift: 8, lean: .012 }),
  run: Object.freeze({ heightStride: 1.2, duty: .52, lift: 12, lean: .024 }),
  crouch: Object.freeze({ heightStride: .46, duty: .72, lift: 5, lean: .006 })
});
export function humanGaitKindV133(actor) {
  return actor?.crouching ? 'crouch' : actor?.movementV124?.gait === 'run' || Math.abs(finite(actor?.vx)) >= 235 ? 'run' : 'walk';
}
/** A full cycle contains two steps. Its world distance comes from the human's
 * supported stature, not the width or cell size of the source atlas. */
export function humanGaitStrideV133(actor, gait, scale) {
  const stature = Math.min(Math.max(24, finite(actor?.h, 92)), 193 * Math.max(.1, finite(scale, .5)));
  return stature * HUMAN_GAIT_PROFILES_V133[gait].heightStride;
}
export function sampleHumanGaitV133(actor, scale) {
  const gait = humanGaitKindV133(actor), profile = HUMAN_GAIT_PROFILES_V133[gait];
  const stride = humanGaitStrideV133(actor, gait, scale), prior = actor?.playerLocomotionStateV129;
  const moving = actor?.grounded === true && !actor?.climbing && !actor?.downed && actor?.alive !== false
    && Math.abs(finite(actor?.vx)) > (actor?.crouching ? 8 : 12);
  const observed = prior?.schema === 129 && finite(prior.facing, 1) === (actor?.facing < 0 ? -1 : 1)
    && prior.crouching === Boolean(actor?.crouching) && Math.abs(finite(actor?.x) - prior.x) <= 160;
  const dx = observed && moving ? finite(actor.x) - prior.x : 0;
  const cycles = observed ? prior.cycles + dx / stride
    : profile.duty / 2 + finite(actor?.weaponRigMotionV125?.distance) * (Math.sign(finite(actor?.vx)) || 1) / stride;
  // World travel is signed for planted-foot contacts. Upper-body atlas
  // phase is anatomical: reflecting the same motion must keep its cell.
  const localCycles = actor?.facing < 0 ? profile.duty - cycles : cycles;
  return Object.freeze({ schema: 133, gait, stride, worldCycles: cycles, cycles: localCycles, phase: ((localCycles % 1) + 1) % 1,
    moving: moving && (observed ? prior.moving || Math.abs(dx) > 1e-7 : Math.abs(finite(actor?.weaponRigMotionV125?.distance)) > 0),
    stepsPerSecond: moving ? 2 * Math.abs(finite(actor?.vx)) / stride : 0,
    lean: moving ? Math.sign(finite(actor.vx)) * profile.lean * clamp(Math.abs(actor.vx) / 245, 0, 1) : 0 });
}
