// Patrol travel owns its elapsed time, so acceleration, braking and endpoint
// observation have the same duration at 30, 60 and 120 simulation updates/s.
// Combat and navigation retain their existing movement policies.
export const ENEMY_PATROL_V140 = Object.freeze({ schema: 140, rampSeconds: .3,
  humanoidPause: .7, xenoPause: .5 });

const epsilon = 1e-7;
const finite = Number.isFinite;
const close = (a, b) => Math.abs(a - b) < 1e-5;

function trajectory(fromX, toX, speed) {
  const distance = Math.abs(toX - fromX), acceleration = speed / ENEMY_PATROL_V140.rampSeconds;
  const ramp = Math.min(ENEMY_PATROL_V140.rampSeconds, Math.sqrt(distance / acceleration));
  const cruise = Math.max(0, distance / speed - ENEMY_PATROL_V140.rampSeconds);
  const duration = ramp * 2 + cruise, peak = acceleration * ramp;
  const at = elapsed => {
    const time = Math.max(0, Math.min(duration, elapsed));
    if (time <= ramp) return { distance: acceleration * time * time / 2, speed: acceleration * time };
    if (time <= ramp + cruise) return { distance: peak * (time - ramp / 2), speed: peak };
    const remaining = duration - time;
    return { distance: distance - acceleration * remaining * remaining / 2, speed: acceleration * remaining };
  };
  return { duration, at };
}

function legPosition(leg) {
  const motion = trajectory(leg.fromX, leg.toX, leg.speed);
  return leg.fromX + Math.sign(leg.toX - leg.fromX) * motion.at(leg.elapsed).distance;
}

function validLeg(leg, enemy, bounds, direction, speed) {
  if (!leg || !['fromX', 'toX', 'elapsed', 'speed'].every(key => finite(leg[key]))
    || leg.speed <= 0 || leg.elapsed < 0 || close(leg.fromX, leg.toX)
    || !close(leg.speed, speed) || !close(leg.toX, direction > 0 ? bounds.right : bounds.left)) return false;
  // A pursuit may end outside the original patrol interval. A return leg may
  // start there; its current position must still match the saved physical body.
  const motion = trajectory(leg.fromX, leg.toX, leg.speed);
  return leg.elapsed <= motion.duration + epsilon && close(legPosition(leg), enemy.x);
}

// Save payloads can only retain a matching physical trajectory. Missing V140
// fields in older saves start a fresh leg without moving the saved actor.
export function restoreEnemyPatrolV140(source, enemy, bounds, direction, speed, pauseSeconds) {
  if (!source || source.schema !== 140) return null;
  if (source.phase === 'observe' && finite(source.remaining)) {
    return { schema: 140, phase: 'observe', remaining: Math.max(0, Math.min(pauseSeconds, source.remaining)) };
  }
  // Support effects restore after the tactics mixin in the production stack.
  // Retain a slower matching leg; the first active step checks its actual speed.
  if (source.phase === 'travel' && source.speed <= speed + epsilon
    && validLeg(source, enemy, bounds, direction, source.speed)) {
    return { schema: 140, phase: 'travel', fromX: source.fromX, toX: source.toX,
      elapsed: source.elapsed, speed: source.speed };
  }
  return null;
}

export function advanceEnemyPatrolV140(enemy, state, bounds, delta, { speed, pauseSeconds, move }) {
  if (!(delta > 0) || !finite(delta)) return;
  if (!(speed > 0) || !finite(speed) || bounds.right - bounds.left < .01) {
    enemy.vx = 0; state.patrolV140 = null; return;
  }
  let remaining = delta;
  while (remaining > epsilon) {
    let patrol = state.patrolV140;
    if (patrol?.phase === 'observe') {
      const step = Math.min(remaining, Math.max(0, patrol.remaining));
      patrol.remaining = Math.max(0, patrol.remaining - step); remaining -= step;
      enemy.vx = 0;
      if (patrol.remaining > epsilon) return;
      state.direction *= -1; state.patrolV140 = null;
      continue;
    }
    if (!validLeg(patrol, enemy, bounds, state.direction, speed)) {
      const destination = state.direction > 0 ? bounds.right : bounds.left;
      if (close(destination, enemy.x)) {
        state.patrolV140 = { schema: 140, phase: 'observe', remaining: pauseSeconds };
        enemy.vx = 0; continue;
      }
      patrol = state.patrolV140 = { schema: 140, phase: 'travel', fromX: enemy.x,
        toX: destination, elapsed: 0, speed };
    }
    const motion = trajectory(patrol.fromX, patrol.toX, patrol.speed);
    const step = Math.min(remaining, Math.max(0, motion.duration - patrol.elapsed));
    patrol.elapsed = Math.min(motion.duration, patrol.elapsed + step); remaining -= step;
    const sample = motion.at(patrol.elapsed), direction = Math.sign(patrol.toX - patrol.fromX);
    const requestedX = patrol.fromX + direction * sample.distance;
    move(requestedX, step);
    const blocked = !close(enemy.x, requestedX);
    enemy.vx = blocked ? 0 : direction * sample.speed;
    if (blocked || patrol.elapsed >= motion.duration - epsilon) {
      state.patrolV140 = { schema: 140, phase: 'observe', remaining: pauseSeconds };
      enemy.vx = 0;
    }
  }
}
