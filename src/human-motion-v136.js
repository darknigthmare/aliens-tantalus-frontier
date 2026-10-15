const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const unit = value => Math.max(0, Math.min(1, finite(value)));

/** Zero velocity and acceleration at each endpoint. Shared presentation math;
 * callers supply simulation displacement or an already observed transition. */
export function smoothHumanStepV136(value) {
  const t = unit(value);
  return t * t * t * (10 + t * (-15 + 6 * t));
}

/** Integrate a smooth velocity ramp over the short contact portions, keeping
 * a steady travel speed through the middle. A full-cycle quintic position
 * overshoots far behind the hip and whips its free foot at 1.875 times the
 * average speed. This bounded S curve peaks below 1.17 times that average. */
export function humanFootTravelV136(progress) {
  const t = unit(progress), edge = .14;
  if (t > .5) return 1 - humanFootTravelV136(1 - t);
  if (t >= edge) return (t - edge / 2) / (1 - edge);
  const u = t / edge;
  return edge * u ** 4 * (2.5 + u * (-3 + u)) / (1 - edge);
}

/** A swing is specified in world space. During support the relative boot
 * travels backwards at the body's speed. Its swing must retain that relative
 * velocity at either boundary, otherwise a planted boot visibly kicks forward
 * on its first free frame. Subtracting the body's travel gives C2 world-space
 * takeoff and touchdown without changing stride length or support duty. */
export function humanFootSwingV136(progress, duty, stride) {
  const t = unit(progress), support = Math.max(.25, Math.min(.85, finite(duty, .6)));
  const length = Math.max(0, finite(stride));
  // Clear the deck early, hold a small clearance through recovery, then lower
  // the boot smoothly. A narrow sine-like apex left the ankle too low while
  // the foot was still behind the hip, forcing an exaggerated pelvis squat.
  const liftWeight = smoothHumanStepV136(t / .25) * smoothHumanStepV136((1 - t) / .25);
  return Object.freeze({ offset: length * (-support / 2 - (1 - support) * t + humanFootTravelV136(t)),
    liftWeight, rollWeight: liftWeight });
}

/** Only actual travel introduces the body weight transfer. The one existing
 * simulation-time stop settle can remove it; a render clock cannot add steps. */
export function humanMotionEnvelopeV136(state, stride) {
  if (!state?.hasWalked) return 0;
  const entrance = smoothHumanStepV136(finite(state.entrance) / Math.max(1, finite(stride) * .25));
  const settle = state.moving ? 1 : 1 - smoothHumanStepV136(state.settleProgress);
  return entrance * settle;
}

export const HUMAN_PELVIS_HEIGHT_V136 = Object.freeze({ standing: 94, crouching: 52 });
// Hip-to-ankle lengths fit the existing 193px standing stature and belt. They
// are shared with ladders/casualties; changing stance cannot resize a femur.
export const HUMAN_LEG_DIMENSIONS_V136 = Object.freeze({ upperLeg: 48, lowerLeg: 47 });
