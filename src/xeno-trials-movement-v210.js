export const XENO_TRIALS_GRAVITY_V210 = 1450;
export const XENO_TRIALS_LANDING_TICKS_V210 = 8;
export const XENO_TRIALS_TURN_TICKS_V210 = 6;

// These four identities already have admitted rise, fall and ground support
// frames. Neither a family resemblance nor an arena statistic admits the cue.
const landingProfiles = new Map([
  ['warrior', 'castes-film_warrior_aliens_1986'],
  ['runner', 'castes-film_runner_alien3_1992'],
  ['prowler', 'castes-game_afe_prowler'],
  ['spitter', 'castes-game_acm_spitter']
]);
const turnProfiles = new Map([
  ['drive-v123-neca-snake-series13-v14', 'pose-v123-drive-neca-snake-series13-v14'],
  ['synth-automated-powerloader', 'pose-v116-automated-powerloader'],
  ['queen', 'castes-film_queen_aliens_1986'],
  ['crusher-acm', 'castes-game_acm_crusher'],
  ['ravager', 'castes-game_avp_extinction_ravager'],
  ['defender', 'pose-v95-user-xeno-defender'],
  ['chrysalis', 'castes-game_avp_capcom_chrysalis'],
  ['smasher', 'castes-game_avp_capcom_smasher']
]);
// The V191 and V197 combat sheets provide both grounded walk keys and guard.
const guardedWalkProfiles = new Map([
  ['defender', 'pose-v95-user-xeno-defender'],
  ['chrysalis', 'castes-game_avp_capcom_chrysalis'],
  ['smasher', 'castes-game_avp_capcom_smasher'],
  ['user-brute', 'pose-v95-user-xeno-brute'],
  ['synth-trooper', 'pose-v94-afe-synth-trooper'],
  ['synth-guard', 'pose-v94-afe-synth-guard']
]);
const matches = (profiles, definition) => definition?.profileId && profiles.get(definition.id) === definition.profileId;
export const hasXenoTrialsGroundTurnV210 = definition => Boolean(matches(turnProfiles, definition));
export const hasXenoTrialsDefensiveTravelV213 = definition => Boolean(matches(landingProfiles, definition));
export const hasXenoTrialsGuardedWalkV218 = definition => Boolean(matches(guardedWalkProfiles, definition));

export function canBufferXenoTrialsLandingV210(fighter, definition, dt) {
  if (!matches(landingProfiles, definition) || !(fighter.y > 0) || !(fighter.vy < 0) || fighter.hp <= 0
    || fighter.stun > 0 || fighter.attack || !(dt > 0)) return false;
  const ticks = XENO_TRIALS_LANDING_TICKS_V210;
  // Predict the same semi-implicit gravity steps the engine will actually run.
  const distance = fighter.vy * dt * ticks - XENO_TRIALS_GRAVITY_V210 * dt * dt * ticks * (ticks + 1) / 2;
  return fighter.y + distance <= 0;
}

export function bufferXenoTrialsLandingV210(match, fighter, definition, direction, dt) {
  if (!fighter.movementV210 && canBufferXenoTrialsLandingV210(fighter, definition, dt))
    fighter.movementV210 = { kind: 'landing-evade', tick: match.tick, direction };
}

export function takeXenoTrialsLandingV210(match, fighter, landed) {
  const state = fighter.movementV210;
  if (state?.kind !== 'landing-evade') return null;
  if (match.tick > state.tick + XENO_TRIALS_LANDING_TICKS_V210) {
    delete fighter.movementV210;
    return null;
  }
  if (!landed) return null;
  delete fighter.movementV210;
  return state;
}

/** Finite, grounded pivot. Preserve the old facing until the committed turn
 * finishes so the hurtbox and any attempted frontal guard agree. */
export function stepXenoTrialsGroundTurnV210(match, fighter, direction) {
  const state = fighter.movementV210;
  if (state?.kind !== 'ground-turn') {
    if (direction === fighter.facing) return { turning: false };
    fighter.movementV210 = { kind: 'ground-turn', tick: match.tick, direction };
    return { turning: true };
  }
  if (match.tick < state.tick + XENO_TRIALS_TURN_TICKS_V210) return { turning: true };
  fighter.facing = state.direction;
  delete fighter.movementV210;
  return { turning: false, completed: state };
}

export function clearXenoTrialsMovementV210(fighter, kind) {
  if (fighter.movementV210 && (!kind || fighter.movementV210.kind === kind)) delete fighter.movementV210;
}

export function validXenoTrialsMovementV210(match, fighter, definition, dt = 1 / 120) {
  const state = fighter.movementV210;
  if (state === undefined) return true;
  if (!state || typeof state !== 'object' || Array.isArray(state) || Object.keys(state).length !== 3
    || !Number.isSafeInteger(state.tick) || state.tick < 1 || state.tick > match.tick || ![-1, 1].includes(state.direction)
    || match.phase !== 'active' || fighter.attack || fighter.stun > 0 || fighter.guard || fighter.movesetV207?.evade
    || fighter.parryV208?.started || match.grappleV153) return false;
  if (state.kind === 'ground-turn')
    return hasXenoTrialsGroundTurnV210(definition) && fighter.y === 0 && fighter.vy === 0
      && state.direction !== fighter.facing && match.tick - state.tick < XENO_TRIALS_TURN_TICKS_V210;
  return state.kind === 'landing-evade' && match.tick - state.tick < XENO_TRIALS_LANDING_TICKS_V210
    && canBufferXenoTrialsLandingV210(fighter, definition, dt);
}

export function validXenoTrialsMovementEventV210(match, event) {
  if (event.type !== 'turn-v210' && event.sourceV210 === undefined) return event.startedTickV210 === undefined;
  if (!['player', 'opponent'].includes(event.side) || ![-1, 1].includes(event.direction)
    || !Number.isSafeInteger(event.startedTickV210) || event.startedTickV210 < 1) return false;
  if (match.hordeV180) {
    if (event.side === 'player' ? event.targetInstanceV180 !== 'player'
      : typeof event.targetInstanceV180 !== 'string' || !/^horde-[1-9]\d*$/.test(event.targetInstanceV180)
        || Number(event.targetInstanceV180.slice(6)) > match.hordeV180.serial) return false;
  } else if (event.targetInstanceV180 !== undefined) return false;
  const elapsed = event.tick - event.startedTickV210;
  return event.type === 'turn-v210' ? event.sourceV210 === undefined && elapsed === XENO_TRIALS_TURN_TICKS_V210
    : event.type === 'evade-v207' && event.sourceV210 === 'landing' && elapsed >= 1 && elapsed <= XENO_TRIALS_LANDING_TICKS_V210;
}
