import { XENO_TRIALS_ARENA_V105, getXenoTrialsBodyBoundsV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsGroundHurtScaleV211 } from './xeno-trials-defense-v211.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { hasXenoTrialsDefensiveTravelV213 } from './xeno-trials-movement-v210.js';

export const XENO_TRIALS_MOVE_CONTROLS_V207 = Object.freeze(['crouch', 'evade', 'antiAir', 'signature2', 'signature3']);
export const XENO_TRIALS_MOVE_ATTACKS_V207 = Object.freeze(['low', 'anti-air', 'advance']);
const CROUCH = 1, EVADE = 2, ANTI_AIR = 4, SIGNATURE_2 = 8, SIGNATURE_3 = 16;
const ALL = CROUCH | EVADE | ANTI_AIR | SIGNATURE_2 | SIGNATURE_3;
export const XENO_TRIALS_EVADE_V207 = Object.freeze({ cost: 14, travelTicks: 18, recoveryTicks: 8, advanceMinimum: 8 });
export const XENO_TRIALS_LOW_RETREAT_V213 = Object.freeze({ id: 'low-retreat', cost: 14, travelTicks: 12, recoveryTicks: 10 });
export const XENO_TRIALS_GUARD_RETREAT_V213 = Object.freeze({ speedRatio: .34, additionalDrain: 11 });
const groundedTraversal = new Map([
  ['drive-v123-neca-snake-series13-v14', 'pose-v123-drive-neca-snake-series13-v14'],
  ['synth-automated-powerloader', 'pose-v116-automated-powerloader'],
  ['crusher-acm', 'castes-game_acm_crusher'],
  ['defender', 'pose-v95-user-xeno-defender'],
  ['mire-v209-chestburster', 'castes-film_chestburster_alien_1979']
]);

export function hasXenoTrialsGroundTraversalV208(definition) {
  return Boolean(definition?.profileId && groundedTraversal.get(definition.id) === definition.profileId);
}

export function getXenoTrialsEvadeSpecV213(evade) {
  return evade?.variantV213 === XENO_TRIALS_LOW_RETREAT_V213.id ? XENO_TRIALS_LOW_RETREAT_V213 : XENO_TRIALS_EVADE_V207;
}

export function canXenoTrialsGuardRetreatV213(fighter, definition, controls) {
  return Boolean(fighter.guard && fighter.y === 0 && !fighter.movesetV207?.low && !fighter.parryV208?.started
    && !controls.heavy && !controls.super && !controls.evade
    && Number(controls.right === true) - Number(controls.left === true) === -fighter.facing
    && hasXenoTrialsDefensiveTravelV213(definition));
}

function readControls(controls) {
  return XENO_TRIALS_MOVE_CONTROLS_V207.reduce((mask, name, index) => mask | (controls[name] === true ? 1 << index : 0), 0);
}

function ensureMoveset(fighter, held) {
  if (!fighter.movesetV207 && held) fighter.movesetV207 = { held: 0, rearm: 0, low: false, evade: null };
  return fighter.movesetV207;
}

export function gateXenoTrialsMovesetV207(fighter, controls) {
  if (!controls) {
    const state = fighter.movesetV207;
    if (state) state.rearm |= state.held;
    return;
  }
  const held = readControls(controls);
  const state = ensureMoveset(fighter, held);
  if (state) { state.held = held; state.rearm = held; }
}

export function releaseXenoTrialsMovesetV207(fighter, controls) {
  const state = fighter.movesetV207;
  if (!state) return;
  const held = readControls(controls);
  state.held &= held;
  state.rearm &= held;
}

export function clearXenoTrialsMovePoseV207(fighter) {
  const state = fighter.movesetV207;
  if (state) { state.low = false; state.evade = null; }
}

/** Apply the optional input edges once per fixed step, independently of the legacy save controls. */
export function readXenoTrialsMovesetV207(fighter, controls) {
  const held = readControls(controls);
  const state = ensureMoveset(fighter, held);
  if (!state) return { low: false, evade: false, antiAir: false, signature2: false, signature3: false };
  state.rearm &= held;
  const active = held & ~state.rearm;
  const fresh = active & ~state.held;
  state.held = held;
  return { low: Boolean(active & CROUCH), evade: Boolean(fresh & EVADE), antiAir: Boolean(fresh & ANTI_AIR),
    signature2: Boolean(fresh & SIGNATURE_2), signature3: Boolean(fresh & SIGNATURE_3) };
}

export function getXenoTrialsLowScaleV207(body) {
  // A long, already-low body has less vertical room to compress than an upright torso.
  return body.width >= body.height ? .87 : .72;
}

export function getXenoTrialsHurtBoundsV207(fighter) {
  const body = getXenoTrialsBodyBoundsV105(fighter);
  const scale = fighter.movesetV207?.low ? getXenoTrialsLowScaleV207(body) : getXenoTrialsGroundHurtScaleV211(fighter);
  if (scale === 1) return body;
  const height = body.height * scale;
  return { ...body, height, top: body.bottom + height };
}

export function getXenoTrialsStrikeBandV207(body, spec) {
  if (spec.descendingReachV211) return { bottom: Math.max(0, body.bottom - spec.descendingReachV211), top: body.bottom + body.height * .54 };
  if (spec.contactBandV207 === 'low') return { bottom: body.bottom, top: body.bottom + body.height * .36 };
  if (spec.contactBandV207 === 'anti-air')
    return { bottom: body.bottom + body.height * .45, top: body.bottom + body.height * 1.32 };
  return { bottom: body.bottom, top: spec.contactHeightRatioV151 ? body.bottom + body.height * spec.contactHeightRatioV151 : body.top };
}

function sameActorV213(match, fighter, event) {
  return event?.side === fighter.side && (match.hordeV180
    ? event.targetInstanceV180 === (fighter.instanceIdV180 || 'player') : event.targetInstanceV180 === undefined);
}

export function validXenoTrialsEvadeEventV213(match, event) {
  if (event.variantV213 === undefined) return true;
  if (event.type !== 'evade-v207' || event.variantV213 !== XENO_TRIALS_LOW_RETREAT_V213.id
    || ![-1, 1].includes(event.direction) || !['player', 'opponent'].includes(event.side)
    || event.sourceV210 !== undefined || event.startedTickV210 !== undefined) return false;
  if (!match.hordeV180) return event.targetInstanceV180 === undefined;
  return event.side === 'player' ? event.targetInstanceV180 === 'player'
    : typeof event.targetInstanceV180 === 'string' && /^horde-[1-9]\d*$/.test(event.targetInstanceV180)
      && Number(event.targetInstanceV180.slice(6)) <= match.hordeV180.serial;
}

export function validXenoTrialsMovesetV207(fighter, match) {
  const value = fighter.movesetV207;
  const attack = fighter.attack?.kind;
  if (value === undefined) return !XENO_TRIALS_MOVE_ATTACKS_V207.includes(attack);
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 4) return false;
  const validMask = mask => Number.isInteger(mask) && mask >= 0 && mask <= ALL;
  if (!validMask(value.held) || !validMask(value.rearm) || (value.rearm & ~value.held) !== 0 || typeof value.low !== 'boolean'
    || attack === 'low' && !value.low || value.low && (attack && attack !== 'low' || fighter.y !== 0 || fighter.stun > 0)
    || XENO_TRIALS_MOVE_ATTACKS_V207.includes(attack) && fighter.y !== 0) return false;
  const evade = value.evade;
  if (evade === null) return true;
  if (attack || fighter.guard || fighter.y !== 0 || fighter.stun !== 0 || !evade
    || typeof evade !== 'object' || Array.isArray(evade) || ![-1, 1].includes(evade.direction)
    || !Number.isInteger(evade.ticks) || evade.ticks <= 0
    || !Number.isFinite(evade.origin) || evade.origin < XENO_TRIALS_ARENA_V105.left || evade.origin > XENO_TRIALS_ARENA_V105.right) return false;
  const spec = getXenoTrialsEvadeSpecV213(evade);
  const lowRetreat = spec === XENO_TRIALS_LOW_RETREAT_V213;
  if (evade.ticks >= spec.travelTicks + spec.recoveryTicks || Object.keys(evade).length !== (lowRetreat ? 4 : 3)
    || value.low !== lowRetreat) return false;
  if (!lowRetreat) return evade.variantV213 === undefined;
  if (evade.direction !== -fighter.facing || !hasXenoTrialsDefensiveTravelV213(getXenoTrialsFighterV96(fighter.id))
    || !Array.isArray(match?.events)) return false;
  const launched = match.tick - evade.ticks + 1;
  if (launched < 1) return false;
  return match.events.some(event => event?.tick === launched && sameActorV213(match, fighter, event) && event.direction === evade.direction
    && event.variantV213 === spec.id && validXenoTrialsEvadeEventV213(match, event))
    || match.events.length === 32 && match.events[0]?.tick > launched;
}

export function xenoTrialsMovePoseV207(fighter) {
  const state = fighter.movesetV207;
  return state?.low || state?.evade ? { low: state.low, evade: state.evade } : null;
}
