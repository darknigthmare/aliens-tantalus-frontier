import { smoothHumanStepV136 } from './human-motion-v136.js';

const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, low, high) => Math.max(low, Math.min(high, finite(value, low)));
export const HUMAN_GAIT_PROFILES_V133 = Object.freeze({
  walk: Object.freeze({ heightStride: .8, duty: .54, lift: 10, lean: .012 }),
  run: Object.freeze({ heightStride: 1.7, duty: .25, lift: 18, lean: .024 }),
  crouch: Object.freeze({ heightStride: .46, duty: .72, lift: 5, lean: .006 })
});
/** At ship speeds an operator is running, rather than performing a very fast
 * succession of short walking steps. Blend the full-cycle stride and support
 * duty through physical speed; the atlas's named walk/run threshold is not a
 * kinematic boundary. Running has brief genuine free-foot intervals. */
export function humanGaitProfileV136(actor, gait = humanGaitKindV133(actor)) {
  if (gait === 'crouch') return HUMAN_GAIT_PROFILES_V133.crouch;
  // At 155 world px/s the 92px operator was still spending a short walking
  // stride more than four steps/second. Introduce the jog through actual speed
  // before that point; larger strides and shorter support belong together.
  const blend = smoothHumanStepV136((Math.abs(finite(actor?.vx)) - 100) / 90);
  const walk = HUMAN_GAIT_PROFILES_V133.walk, run = HUMAN_GAIT_PROFILES_V133.run;
  if (blend === 0) return walk;
  if (blend === 1) return run;
  const result = Object.fromEntries(['heightStride', 'lift', 'lean']
    .map(key => [key, walk[key] + (run[key] - walk[key]) * blend]));
  // Interpolating stride and duty independently makes their product peak in
  // the middle: the jog then spreads its planted feet farther than either
  // walking or running. Blend the supported travel, then derive its duty.
  const supportedTravel = walk.heightStride * walk.duty
    + (run.heightStride * run.duty - walk.heightStride * walk.duty) * blend;
  return Object.freeze({ ...result, duty: supportedTravel / result.heightStride });
}
export function humanGaitKindV133(actor) {
  return actor?.crouching ? 'crouch' : actor?.movementV124?.gait === 'run' || Math.abs(finite(actor?.vx)) >= 190 ? 'run' : 'walk';
}
/** A full cycle contains two steps. Its world distance comes from the human's
 * supported stature, not the width or cell size of the source atlas. */
export function humanGaitStrideV133(actor, gait, scale) {
  const stature = Math.min(Math.max(24, finite(actor?.h, 92)), 193 * Math.max(.1, finite(scale, .5)));
  return stature * humanGaitProfileV136(actor, gait).heightStride;
}
export function sampleHumanGaitV133(actor, scale) {
  const gait = humanGaitKindV133(actor), profile = humanGaitProfileV136(actor, gait);
  const stride = humanGaitStrideV133(actor, gait, scale), prior = actor?.playerLocomotionStateV129;
  const moving = actor?.grounded === true && !actor?.climbing && !actor?.downed && actor?.alive !== false
    && Math.abs(finite(actor?.vx)) > (actor?.crouching ? 8 : 12);
  const observed = prior?.schema === 129 && finite(prior.facing, 1) === (actor?.facing < 0 ? -1 : 1)
    && prior.crouching === Boolean(actor?.crouching) && Math.abs(finite(actor?.x) - prior.x) <= 160;
  const dx = observed && moving ? finite(actor.x) - prior.x : 0;
  // Weapon/upper-body sampling happens before the simulation observation.
  // Predict the same support-centre adjustment once, using only new travel.
  const supportShift = observed && Math.abs(dx) > 1e-7
    ? (profile.duty - (prior.duty ?? HUMAN_GAIT_PROFILES_V133[prior.gait]?.duty ?? profile.duty)) / 2 : 0;
  const cycles = observed ? prior.cycles + dx / stride + supportShift
    : profile.duty / 2 + finite(actor?.weaponRigMotionV125?.distance) * (Math.sign(finite(actor?.vx)) || 1) / stride;
  // World travel is signed for planted-foot contacts. Upper-body atlas
  // phase is anatomical: reflecting the same motion must keep its cell.
  const localCycles = actor?.facing < 0 ? profile.duty - cycles : cycles;
  const speed = Math.abs(finite(actor?.vx));
  const entrance = observed ? (prior.settle >= .12 ? 0 : finite(prior.entrance)) + Math.abs(dx)
    : Math.max(0, finite(actor?.weaponRigMotionV125?.distance));
  // Lean follows continuous physical speed and introduced travel. Crossing the
  // walk/run atlas threshold must not double the shoulder angle in one frame.
  const forwardLean = profile.lean;
  return Object.freeze({ schema: 133, gait, stride, worldCycles: cycles, cycles: localCycles, phase: ((localCycles % 1) + 1) % 1,
    moving: moving && (observed ? prior.moving || Math.abs(dx) > 1e-7 : Math.abs(finite(actor?.weaponRigMotionV125?.distance)) > 0),
    stepsPerSecond: moving ? 2 * Math.abs(finite(actor?.vx)) / stride : 0,
    lean: moving ? Math.sign(finite(actor.vx)) * forwardLean * clamp(speed / 245, 0, 1)
      * smoothHumanStepV136(entrance / (stride * .25)) : 0 });
}
