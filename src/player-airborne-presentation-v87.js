// Presentation only: these are existing V81 poses, not newly authored V87 art.
// Cell 8 is grounded anticipation; never play it during a fall. Cell 11 is a
// crouched reception and must never be shown before physical ground contact.
export const PLAYER_AIR_POSES_V87 = Object.freeze({ takeoff: 9, rise: 9, apex: 10, fall: 10, land: 11 });
export const PLAYER_AIR_TIMING_V87 = Object.freeze({ takeoff: 0.06, apex: 0.055, land: 0.1, maximumGap: 0.25 });
const finite = value => typeof value === 'number' && Number.isFinite(value);

export function resolvePlayerAirClipV87(actor = {}) {
  return finite(actor.vy) && actor.vy < 0 ? 'rise' : 'fall';
}

function physicalSnapshot(actor) {
  if (!actor || typeof actor.grounded !== 'boolean' || !finite(actor.vy)) return null;
  const mode = actor.alive === false || actor.downed || actor.inVehicle || actor.ventTransit
    ? 'inactive' : actor.climbing ? 'climb' : actor.grounded ? 'grounded' : 'air';
  return { mode, vy: actor.vy, vx: finite(actor.vx) ? actor.vx : 0,
    x: finite(actor.x) ? actor.x : null, y: finite(actor.y) ? actor.y : null };
}

function discontinuous(previous, current, time) {
  if (!previous || !finite(previous.time) || time < previous.time) return true;
  if (previous.context !== current.context) return true;
  const elapsed = time - previous.time;
  if (elapsed > PLAYER_AIR_TIMING_V87.maximumGap) return true;
  // Room transfers/respawns must reseed, not manufacture a landing or impulse.
  // The margin is deliberately above ordinary integration and ladder alignment.
  const allowance = Math.max(96, elapsed * (Math.abs(previous.vx) + Math.abs(current.vx)
    + Math.max(Math.abs(previous.vy), Math.abs(current.vy)) + 1000) * 2);
  return ['x', 'y'].some(key => finite(previous[key]) && finite(current[key])
    && Math.abs(current[key] - previous[key]) > allowance);
}

/** Pure, transient visual state driven by observed physics and simulation time.
 * It never changes position, velocity, collisions, inventory or a game save.
 * Missing observations are seeded without inventing events; no offline clock.
 */
export function advancePlayerAirPresentationV87(previous, actor, time, physicalContext = '') {
  const physical = physicalSnapshot(actor);
  if (!physical || !finite(time) || time < 0) return null;
  physical.context = typeof physicalContext === 'string' ? physicalContext : '';
  const reset = discontinuous(previous, physical, time);
  const prior = reset ? null : previous;
  const events = [];
  let takeoffUntil = prior?.takeoffUntil ?? -1;
  let apexUntil = prior?.apexUntil ?? -1;
  let landUntil = prior?.landUntil ?? -1;
  const impulse = physical.mode === 'air' && physical.vy < 0 && (prior?.mode === 'grounded'
    || (prior?.mode === 'climb' && finite(actor.ladderDetachClock) && actor.ladderDetachClock > 0));
  const apex = physical.mode === 'air' && prior?.mode === 'air' && prior.vy < 0 && physical.vy >= 0;
  // A respawn may retain grounded=false at the floor with zero velocity until
  // its next collision pass. Without observed flight that is not a landing.
  const observedFlight = physical.mode === 'air' && (physical.vy !== 0 || (prior?.mode === 'air' && prior.observedFlight === true));
  const contact = physical.mode === 'grounded' && prior?.mode === 'air' && prior.observedFlight === true;
  if (impulse) { takeoffUntil = time + PLAYER_AIR_TIMING_V87.takeoff; events.push('jump:impulse'); }
  if (apex) { apexUntil = time + PLAYER_AIR_TIMING_V87.apex; events.push('jump:apex'); }
  if (contact) { landUntil = time + PLAYER_AIR_TIMING_V87.land; events.push('ground:contact'); }
  let phase = physical.mode;
  if (physical.mode === 'air') {
    landUntil = -1;
    phase = physical.vy < 0
      ? time < takeoffUntil ? 'takeoff' : 'rise'
      : time < apexUntil ? 'apex' : 'fall';
  } else if (physical.mode === 'grounded') {
    takeoffUntil = -1; apexUntil = -1;
    phase = time < landUntil ? 'land' : 'grounded';
  } else {
    takeoffUntil = -1; apexUntil = -1; landUntil = -1;
  }
  return Object.freeze({ ...physical, time, phase, takeoffUntil, apexUntil, landUntil, observedFlight,
    reseeded: reset, events: Object.freeze(events) });
}

const visualLocomotion = new Set(['idle', 'walk-run', 'crouch', 'jump-fall', ...Object.keys(PLAYER_AIR_POSES_V87)]);

/** Hurt/death, tools, combat and ladder poses retain their existing priorities. */
export function applyPlayerAirPresentationV87(request, state) {
  if (request?.sheetId !== 'player.echo9-marine.locomotion' || !visualLocomotion.has(request.clipId)
    || !state || !Object.hasOwn(PLAYER_AIR_POSES_V87, state.phase)) return request;
  return { ...request, clipId: state.phase, frame: PLAYER_AIR_POSES_V87[state.phase] };
}
