import { XENO_TRIALS_GRAVITY_V210 } from './xeno-trials-movement-v210.js';

export const XENO_TRIALS_AIR_HIT_V211 = 'air-hit';
export const XENO_TRIALS_GET_UP_V211 = Object.freeze({ fallTicks: 10, opensAt: 52, closesAt: 72, assistedTicks: 8, stun: .72 });
const timestep = 1 / 120;

// Runner's pounce and Prowler's leap already have exact motion contracts.
// Their arena air strike uses a separate downward band, at its real altitude.
const air = new Map([
  ['runner', Object.freeze({ profileId: 'castes-film_runner_alien3_1992', cost: 15, damage: 17, reach: 58, startup: .075,
    active: .085, recovery: .235, stun: .16, push: 19, descendingReachV211: 35 })],
  ['prowler', Object.freeze({ profileId: 'castes-game_afe_prowler', cost: 18, damage: 20, reach: 64, startup: .085,
    active: .1, recovery: .275, stun: .19, push: 24, descendingReachV211: 45 })]
]);
// Alpha heights of the V188 grounded keys over their reference idle heights.
// Apply the ratio to the native hurtbox only; push width and body pivot stay put.
const down = new Map([
  ['warrior', { profileId: 'castes-film_warrior_aliens_1986', heightRatio: 136 / 314 }],
  ['runner', { profileId: 'castes-film_runner_alien3_1992', heightRatio: 85 / 172 }],
  ['prowler', { profileId: 'castes-game_afe_prowler', heightRatio: 122 / 259 }],
  ['spitter', { profileId: 'castes-game_acm_spitter', heightRatio: 120 / 259 }]
]);
const downSupported = definition => definition?.profileId && down.get(definition.id)?.profileId === definition.profileId;

export function getXenoTrialsAirHitV211(definition) {
  const spec = air.get(definition?.id);
  return spec?.profileId === definition?.profileId ? spec ?? null : null;
}

export function validXenoTrialsAirAttackV211(match, fighter, attack, spec) {
  if (attack.kind !== XENO_TRIALS_AIR_HIT_V211) return attack.takeoffV211 === undefined;
  const origin = attack.takeoffV211;
  if (!spec || !origin || typeof origin !== 'object' || Array.isArray(origin) || Object.keys(origin).length !== 2
    || !Number.isFinite(origin.height) || origin.height <= 0 || origin.height > 5000
    || !Number.isFinite(origin.velocity) || origin.velocity >= 0 || origin.velocity < -5000
    || attack.emitted || fighter.guard || fighter.stun > 0 || match.phase !== 'active'
    || attack.age < timestep || attack.age < spec.startup && (attack.hit || attack.hitTargetsV180?.length)
    || Object.keys(attack).some(key => !['kind', 'age', 'hit', 'emitted', 'facing', 'id', 'takeoffV211', 'hitTargetsV180'].includes(key))) return false;
  const ageTicks = Math.round(attack.age / timestep), travelTicks = ageTicks - 1;
  const velocity = origin.velocity - XENO_TRIALS_GRAVITY_V210 * timestep * travelTicks;
  const height = Math.max(0, origin.height + origin.velocity * timestep * travelTicks
    - XENO_TRIALS_GRAVITY_V210 * timestep * timestep * travelTicks * (travelTicks + 1) / 2);
  if (Math.abs(attack.age - ageTicks * timestep) > 1e-8 || Math.abs(fighter.y - height) > 1e-7
    || Math.abs(fighter.vy - (height > 0 ? velocity : 0)) > 1e-7 || !Array.isArray(match.events)) return false;
  const started = match.tick - travelTicks, receipt = match.events.find(event => event?.id === attack.id + 1);
  if (receipt ? receipt.tick !== started || receipt.type !== 'attack' || receipt.kind !== XENO_TRIALS_AIR_HIT_V211
    || receipt.side !== fighter.side || (match.hordeV180 && receipt.attackerInstanceV180 !== (fighter.instanceIdV180 || 'player'))
    : match.events.length !== 32 || !(attack.id + 1 < match.events[0]?.id)) return false;
  return match.hordeV180 ? attack.hit === Boolean(attack.hitTargetsV180?.length) : attack.hitTargetsV180 === undefined;
}

export function startXenoTrialsGroundRecoveryV211(match, fighter, definition) {
  if (!downSupported(definition) || fighter.hp <= 0 || fighter.y !== 0 || match.grappleV153) return;
  fighter.groundRecoveryV211 = { tick: match.tick, breakId: match.serial, assistedAt: 0 };
}

export function clearXenoTrialsGroundRecoveryV211(fighter) {
  if (fighter.groundRecoveryV211) delete fighter.groundRecoveryV211;
}

export function stepXenoTrialsGroundRecoveryV211(match, fighter, freshGuard) {
  const state = fighter.groundRecoveryV211;
  if (!state) return false;
  if (fighter.stun <= 1e-9 || fighter.y !== 0 || fighter.hp <= 0) {
    clearXenoTrialsGroundRecoveryV211(fighter);
    return false;
  }
  const elapsed = match.tick - state.tick;
  if (!freshGuard || state.assistedAt || elapsed < XENO_TRIALS_GET_UP_V211.opensAt || elapsed > XENO_TRIALS_GET_UP_V211.closesAt) return false;
  state.assistedAt = match.tick;
  fighter.stun = Math.min(fighter.stun, XENO_TRIALS_GET_UP_V211.assistedTicks * timestep);
  return true;
}

export function getXenoTrialsGroundRecoveryV211(match, fighter) {
  const state = fighter.groundRecoveryV211;
  if (!state || fighter.hp <= 0 || fighter.stun <= 0) return null;
  const elapsed = match.tick - state.tick;
  const ready = state.assistedAt === 0 && elapsed >= XENO_TRIALS_GET_UP_V211.opensAt && elapsed <= XENO_TRIALS_GET_UP_V211.closesAt;
  if (elapsed < XENO_TRIALS_GET_UP_V211.fallTicks)
    return { state: 'fall-v211', progress: elapsed / XENO_TRIALS_GET_UP_V211.fallTicks, ready };
  if (fighter.stun <= .13) return { state: 'rise-v211', progress: Math.max(0, 1 - fighter.stun / .13), ready };
  return { state: 'down-v211', progress: 1, ready };
}

/** Existing floor-supported keys, reused only for the living reaction cue. */
export function getXenoTrialsGroundRecoveryFrameV211(cue, reducedMotion = false) {
  if (cue?.state === 'down-v211') return 'ko-ground';
  if (cue?.state === 'fall-v211') return reducedMotion || cue.progress >= .6 ? 'ko-ground' : 'ko-fall';
  if (cue?.state === 'rise-v211') return cue.progress >= .65 ? 'idle' : reducedMotion ? 'ko-ground' : 'ko-fall';
  return null;
}

export function getXenoTrialsGroundHurtScaleV211(fighter) {
  if (!fighter.groundRecoveryV211 || fighter.stun <= 0) return 1;
  const ratio = down.get(fighter.id)?.heightRatio;
  if (!ratio) return 1;
  const elapsed = XENO_TRIALS_GET_UP_V211.stun - fighter.stun;
  if (elapsed < XENO_TRIALS_GET_UP_V211.fallTicks * timestep)
    return Math.max(ratio, 1 - (1 - ratio) * elapsed / (XENO_TRIALS_GET_UP_V211.fallTicks * timestep));
  return ratio + (1 - ratio) * Math.max(0, 1 - fighter.stun / .13);
}

function actorMatches(match, fighter, event) {
  return event?.side === fighter.side && (match.hordeV180
    ? event.targetInstanceV180 === (fighter.instanceIdV180 || 'player') : event.targetInstanceV180 === undefined);
}

export function validXenoTrialsGroundRecoveryV211(match, fighter, definition) {
  const state = fighter.groundRecoveryV211;
  if (state === undefined) return true;
  if (!state || typeof state !== 'object' || Array.isArray(state) || Object.keys(state).length !== 3
    || !downSupported(definition) || match.phase !== 'active' || fighter.hp <= 0 || fighter.y !== 0 || fighter.vy !== 0
    || fighter.guard || fighter.attack || !fighter.guardBrokenV147 || fighter.stun <= 0 || match.grappleV153
    || !Number.isSafeInteger(state.tick) || state.tick < 1 || state.tick > match.tick
    || !Number.isSafeInteger(state.breakId) || state.breakId < 1 || state.breakId > match.serial
    || !Number.isSafeInteger(state.assistedAt) || state.assistedAt < 0 || state.assistedAt > match.tick
    || !Array.isArray(match.events)) return false;
  const receipt = match.events.find(event => event?.id === state.breakId);
  if (receipt ? receipt.type !== 'guard-break' || receipt.tick !== state.tick || !actorMatches(match, fighter, receipt)
    : match.events.length !== 32 || !(state.breakId < match.events[0]?.id)) return false;
  const elapsed = (match.tick - state.tick) * timestep;
  if (!state.assistedAt) return Math.abs(fighter.stun - (XENO_TRIALS_GET_UP_V211.stun - elapsed)) < 1e-7;
  const sinceBreak = state.assistedAt - state.tick;
  const sinceAssist = (match.tick - state.assistedAt) * timestep;
  return sinceBreak >= XENO_TRIALS_GET_UP_V211.opensAt && sinceBreak <= XENO_TRIALS_GET_UP_V211.closesAt
    && (match.events.some(event => event?.type === 'get-up-v211' && event.tick === state.assistedAt
      && event.breakIdV211 === state.breakId && actorMatches(match, fighter, event))
      || match.events.length === 32 && match.events[0]?.tick > state.assistedAt)
    && Math.abs(fighter.stun - (XENO_TRIALS_GET_UP_V211.assistedTicks * timestep - sinceAssist)) < 1e-7;
}

export function validXenoTrialsGetUpEventV211(match, event) {
  if (!['player', 'opponent'].includes(event.side) || !Number.isSafeInteger(event.breakIdV211) || event.breakIdV211 < 1
    || event.breakIdV211 >= event.id) return false;
  if (match.hordeV180 ? event.side === 'player' ? event.targetInstanceV180 !== 'player'
    : typeof event.targetInstanceV180 !== 'string' || !/^horde-[1-9]\d*$/.test(event.targetInstanceV180)
      || Number(event.targetInstanceV180.slice(6)) > match.hordeV180.serial : event.targetInstanceV180 !== undefined) return false;
  const cause = match.events.find(candidate => candidate?.id === event.breakIdV211);
  if (!cause) return match.events.length === 32 && event.breakIdV211 < match.events[0]?.id;
  const elapsed = event.tick - cause.tick;
  return cause.type === 'guard-break' && cause.side === event.side && cause.targetInstanceV180 === event.targetInstanceV180
    && elapsed >= XENO_TRIALS_GET_UP_V211.opensAt && elapsed <= XENO_TRIALS_GET_UP_V211.closesAt;
}
