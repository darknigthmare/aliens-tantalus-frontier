const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/** Slow ship patrols and moving crew advance their four/eight-frame walking
 * atlas by physical travel. Idle, work, injury and combat retain their clocks.
 * A short stride at a slow patrol avoids holding a boot aloft for seconds.
 * Drawing the same pose, carrying an idle actor and scene changes make no step. */
export function advanceHumanPatrolAnimationV133(previous, actor, clip, timeSeconds,
  { context = '', reducedMotion = false } = {}) {
  if (!actor || !clip?.loop || !['walk', 'run', 'move', 'walk-run'].includes(clip.id)
    || !Number.isFinite(actor.x) || !Number.isFinite(actor.y)) return null;
  const time = Math.max(0, finite(timeSeconds)), speed = Math.abs(finite(actor.vx));
  const requested = speed > .1 && actor.alive !== false && !actor.downed && actor.grounded !== false
    && !actor.climbing && !actor.inVehicle && !actor.ventTransit;
  const signature = `${context}:${clip.id}:${clip.frames.length}`;
  // The physical actor/context owns phase across its authored walk/run clips.
  // A faster clip or a different cell count cannot restart both feet at zero.
  const prior = previous?.context === context && time >= previous.time
    && time - previous.time <= .25 ? previous : null;
  if (prior?.signature === signature && time === prior.time && actor.x === prior.x && actor.y === prior.y) {
    return Object.freeze({ ...prior, reseeded: false, suppressEvents: prior.suppressEvents || reducedMotion });
  }
  const clipChanged = Boolean(prior && prior.signature !== signature);
  const dx = prior ? actor.x - prior.x : 0;
  const physical = prior && requested && Math.abs(dx) <= Math.max(8, speed * (time - prior.time) * 2 + 4)
    && dx * finite(actor.vx) >= 0;
  const moving = Boolean(physical && Math.abs(dx) > 1e-7);
  const stature = Math.min(96.5, Math.max(24, finite(actor.h, 92)));
  const stride = stature * (speed >= 235 || clip.id === 'run' ? 1.5 : clamp(.42 + speed / 350, .44, .8));
  const distance = (prior && (!requested || physical) ? prior.distance : 0) + (physical ? Math.abs(dx) : 0);
  // A changing patrol speed must not redivide all its historical distance by
  // a new stride and jump backwards through the atlas. Only new world travel
  // spends phase; trapezoidal stride integration also keeps smooth ramps stable.
  const continued = prior && (!requested || physical);
  const previousCycles = continued ? finite(prior.cycles, prior.distance / prior.stride) : 0;
  const cycles = previousCycles + (physical ? Math.abs(dx) * .5 * (1 / stride + 1 / prior.stride) : 0);
  return Object.freeze({ schema: 133, signature, context, time, x: actor.x, y: actor.y,
    distance, stride, cycles, moving, requestedMovingV165: requested,
    clipTransitionV165: clipChanged, reseeded: !prior || requested && !physical,
    step: Math.floor(cycles * clip.frames.length + 1e-9),
    // A clip transition may enter an already accumulated step index. Its
    // first sample is silent instead of replaying the old clip's markers.
    suppressEvents: !moving || !physical || clipChanged || reducedMotion,
    stepsPerSecond: moving && time > prior.time ? Math.abs(dx) / (time - prior.time) * 2 / stride : 0 });
}
