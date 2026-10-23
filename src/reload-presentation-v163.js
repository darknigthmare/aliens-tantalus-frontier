// The ammunition transaction and its attempt windows remain owned by V77.
// This clock only presents that saved transaction: changing its deadline must
// not instantly move the supporting hand, receiver or whole rigid weapon.
export const RELOAD_DISCARD_PROGRESS_V163 = .35;

const finite = value => typeof value === 'number' && Number.isFinite(value);
const clamp = value => Math.max(0, Math.min(1, value));

/** A monotone clock with the same position and velocity at an attempt edge.
 * Failed early attempts preserve the native remove/discard beat, then spend
 * the longer recovery on the remaining service gesture. No new persistent
 * state is required: legacy checkpoints already own every input below. */
export function getReloadPresentationProgressV163(state) {
  if (!state || !finite(state.elapsed) || !finite(state.completeAt) || state.completeAt <= 0) return 0;
  const elapsed = Math.max(0, state.elapsed), completeAt = state.completeAt;
  const duration = finite(state.profile?.duration) && state.profile.duration > 0
    ? state.profile.duration : completeAt;
  const attemptAt = state.attemptAt;
  if (!finite(attemptAt) || attemptAt < 0 || attemptAt >= duration || completeAt === duration)
    return clamp(elapsed / completeAt);
  const anchorAt = Math.max(attemptAt, duration * RELOAD_DISCARD_PROGRESS_V163);
  if (elapsed <= anchorAt) return clamp(elapsed / duration);
  const remainingNormal = duration - anchorAt, remainingActual = completeAt - anchorAt;
  if (remainingNormal <= 0 || remainingActual <= 0) return clamp(elapsed / completeAt);
  const u = clamp((elapsed - anchorAt) / remainingActual);
  const ratio = remainingNormal / remainingActual;
  // Rational easing starts at the original 1/duration speed for either a
  // shortened or extended deadline, stays inside [0,1], and reaches1 exactly.
  const eased = u / (ratio + (1 - ratio) * u);
  return clamp(anchorAt / duration + (remainingNormal / duration) * eased);
}
