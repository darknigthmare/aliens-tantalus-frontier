import { XENO_TRIALS_GRAVITY_V210 } from './xeno-trials-movement-v210.js';

export const XENO_TRIALS_AIR_HIT_V211 = 'air-hit';
export const XENO_TRIALS_GET_UP_V211 = Object.freeze({ fallTicks: 10, opensAt: 52, closesAt: 72, assistedTicks: 8, stun: .72 });
const timestep = 1 / 120;

const aerialStrike = (profileId, cost, damage, reach, startup, active, recovery, stun, push, descendingReachV211) =>
  Object.freeze({ profileId, cost, damage, reach, startup, active, recovery, stun, push, descendingReachV211 });

// The admitted air-light keys of V199–V204 retain their own body and scale.
// These specs govern a fresh descending input and do not change jump physics.
const air = new Map([
  ['runner', aerialStrike('castes-film_runner_alien3_1992', 15, 17, 58, .075, .085, .235, .16, 19, 35)],
  ['prowler', aerialStrike('castes-game_afe_prowler', 18, 20, 64, .085, .1, .275, .19, 24, 45)],
  ['warrior', aerialStrike('castes-film_warrior_aliens_1986', 17, 20, 60, .1, .092, .27, .17, 22, 42)],
  ['import-game-afe2-warden', aerialStrike('pose-v106-import-game-afe2-warden', 23, 26, 64, .133, .108, .36, .24, 30, 38)],
  ['queen', aerialStrike('castes-film_queen_aliens_1986', 26, 27, 73, .142, .117, .39, .24, 36, 53)],
  ['ravager', aerialStrike('castes-game_avp_extinction_ravager', 21, 24, 69, .108, .108, .32, .22, 29, 47)],
  ['chrysalis', aerialStrike('castes-game_avp_capcom_chrysalis', 20, 23, 59, .125, .108, .33, .22, 29, 43)],
  ['razor-claws', aerialStrike('castes-game_avp_capcom_razor_claws', 18, 21, 66, .092, .092, .28, .19, 24, 44)],
  ['synth-containment', aerialStrike('pose-v110-afe-synth-containment', 21, 23, 55, .125, .1, .36, .23, 29, 32)],
  ['smasher', aerialStrike('castes-game_avp_capcom_smasher', 23, 25, 64, .133, .108, .36, .25, 32, 40)]
]);
// Alpha heights of the admitted V188–V197 grounded keys over their reference idle heights.
// Apply the ratio to the native hurtbox only; push width and body pivot stay put.
const down = new Map([
  ['warrior', { profileId: 'castes-film_warrior_aliens_1986', heightRatio: 136 / 314, legacy: true }],
  ['runner', { profileId: 'castes-film_runner_alien3_1992', heightRatio: 85 / 172, legacy: true }],
  ['prowler', { profileId: 'castes-game_afe_prowler', heightRatio: 122 / 259, legacy: true }],
  ['spitter', { profileId: 'castes-game_acm_spitter', heightRatio: 120 / 259, legacy: true }],
  ['queen', { profileId: 'castes-film_queen_aliens_1986', heightRatio: 116 / 222 }],
  ['crusher-acm', { profileId: 'castes-game_acm_crusher', heightRatio: 124 / 209 }],
  ['ravager', { profileId: 'castes-game_avp_extinction_ravager', heightRatio: 103 / 210 }],
  ['burster', { profileId: 'castes-game_afe_burster', heightRatio: 102 / 239 }],
  ['defender', { profileId: 'pose-v95-user-xeno-defender', heightRatio: 124 / 351 }],
  ['chrysalis', { profileId: 'castes-game_avp_capcom_chrysalis', heightRatio: 116 / 237 }],
  ['smasher', { profileId: 'castes-game_avp_capcom_smasher', heightRatio: 112 / 261 }],
  ['user-brute', { profileId: 'pose-v95-user-xeno-brute', heightRatio: 177 / 324 }],
  ['synth-trooper', { profileId: 'pose-v94-afe-synth-trooper', heightRatio: 99 / 319 }],
  ['synth-guard', { profileId: 'pose-v94-afe-synth-guard', heightRatio: 141 / 359 }],
  ['import-game-afe2-warden', { profileId: 'pose-v106-import-game-afe2-warden', heightRatio: 128 / 244 }]
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

export function canStartXenoTrialsGroundRecoveryV212(match, fighter, definition) {
  return Boolean(downSupported(definition) && fighter.hp > 0 && fighter.y === 0 && !match.grappleV153);
}

export function startXenoTrialsGroundRecoveryV211(match, fighter) {
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

export function getXenoTrialsGroundRecoveryHintV218(match, fighter) {
  if (match.phase !== 'active' || match.paused || !fighter) return '';
  const recovery = getXenoTrialsGroundRecoveryV211(match, fighter);
  if (!recovery) return '';
  if (recovery.ready) return fighter.previousInput?.guard ? 'RELÂCHEZ GARDE' : 'GARDE · RELEVEZ-VOUS';
  if (recovery.state === 'rise-v211') return fighter.groundRecoveryV211.assistedAt ? 'REDRESSEMENT ACCÉLÉRÉ' : 'REDRESSEMENT';
  return 'AU SOL · ATTENDEZ LE SIGNAL';
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
  if (state === undefined) return !canStartXenoTrialsGroundRecoveryV212(match, fighter, definition)
    || match.phase !== 'active' || !fighter.guardBrokenV147 || fighter.stun <= 1e-9 || !Array.isArray(match.events)
    || !match.events.findLast(event => event?.type === 'guard-break' && actorMatches(match, fighter, event))?.floorRecoveryV212;
  if (!state || typeof state !== 'object' || Array.isArray(state) || Object.keys(state).length !== 3
    || !downSupported(definition) || match.phase !== 'active' || fighter.hp <= 0 || fighter.y !== 0 || fighter.vy !== 0
    || fighter.guard || fighter.attack || !fighter.guardBrokenV147 || fighter.stun <= 0 || match.grappleV153
    || !Number.isSafeInteger(state.tick) || state.tick < 1 || state.tick > match.tick
    || !Number.isSafeInteger(state.breakId) || state.breakId < 1 || state.breakId > match.serial
    || !Number.isSafeInteger(state.assistedAt) || state.assistedAt < 0 || state.assistedAt > match.tick
    || !Array.isArray(match.events)) return false;
  const receipt = match.events.find(event => event?.id === state.breakId);
  if (receipt ? receipt.type !== 'guard-break' || receipt.tick !== state.tick || !actorMatches(match, fighter, receipt)
    || receipt.floorRecoveryV212 !== true && !down.get(fighter.id).legacy
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
