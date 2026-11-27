import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsHurtBoundsV207, getXenoTrialsLowScaleV207, getXenoTrialsStrikeBandV207,
  XENO_TRIALS_MOVE_CONTROLS_V207 } from './xeno-trials-moveset-v207.js';
import { getXenoTrialsProjectileThreatV149 } from './xeno-trials-ai-v119.js';
import { getXenoTrialsParryViewV208, isXenoTrialsParryingV208 } from './xeno-trials-defense-v208.js';
import { getXenoTrialsRiposteReadinessV208, getXenoTrialsRiposteV208 } from './xeno-trials-ripostes-v208.js';
import { getXenoTrialsAttackStyleV147, getXenoTrialsAttackV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsAlternateSignatureV208, XENO_TRIALS_SIGNATURE_KINDS_V208 } from './xeno-trials-signature-kit-v208.js';
import { getXenoTrialsPhysicalSuper } from './xeno-trials-super-kits-v209.js';
import { getXenoTrialsActiveStrikeV210 } from './xeno-trials-super-kits-v210.js';
import { getXenoTrialsSuperReadinessV148 } from './xeno-trials-supers-v148.js';
import { XENO_TRIALS_GRAVITY_V210 } from './xeno-trials-movement-v210.js';
import { getXenoTrialsGroundRecoveryV211, XENO_TRIALS_GET_UP_V211 } from './xeno-trials-defense-v211.js';

const nonMeleeStyles = new Set(['acid', 'pulse', 'flame', 'detonation', 'ground-wave', 'acid-cluster', 'aimed-acid']);
const signatureControls = { 'signature-2': 'signature2', 'signature-3': 'signature3' };
const crouchControl = 1 << XENO_TRIALS_MOVE_CONTROLS_V207.indexOf('crouch');
const antiAirControl = 1 << XENO_TRIALS_MOVE_CONTROLS_V207.indexOf('antiAir');
const antiAirStates = new Set(['APPROACH', 'PRESSURE', 'PROBE', 'REPOSITION']);
const runnerProfile = 'castes-film_runner_alien3_1992';
const synthGuardProfile = 'pose-v94-afe-synth-guard';
const synthTrooperProfile = 'pose-v94-afe-synth-trooper';
// Admit the close-range Runner and grounded Synth Guard by their combat profiles.
const antiAirProfiles = new Map([
  ['runner', runnerProfile], ['synth-guard', synthGuardProfile]
]);

function roll(match, cpu, serial, salt) {
  // A stable per-opportunity choice, independent of the shared AI RNG and
  // identical across repeated frames, checkpoints and frame batching.
  let mixed = match.config.seed ^ Math.imul(serial, 0x9e3779b1) ^ Math.imul((cpu.spawnTickV180 || 0) + 1, salt);
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return ((mixed ^ (mixed >>> 16)) >>> 0) / 4294967296;
}

function inRange(from, to, spec, reach, facing) {
  if (spec.groundedTargetV208 && to.y > 0) return false;
  const source = getXenoTrialsBodyBoundsV105(from), target = getXenoTrialsHurtBoundsV207(to);
  const band = getXenoTrialsStrikeBandV207(source, spec);
  return (target.center - source.center) * facing >= 0 && band.bottom <= target.top && target.bottom <= band.top
    && getXenoTrialsBodyGapV105(from, to, facing) <= reach;
}

function parryInput(match, cpu, target, controls, brain, specs, dt) {
  const attack = target.attack, sampled = brain.observation?.attack;
  if (!controls.guard || !attack || sampled?.id !== attack.id || !(sampled.age >= .075)
    || !(match.tick - brain.observation.tick >= 2) || brain.observation.projectileThreat
    || cpu.facing !== -attack.facing || cpu.parryV208?.held
    || (match.hordeV180 ? attack.hitTargetsV180?.includes(cpu.instanceIdV180) : attack.hit)) return null;
  const definition = getXenoTrialsFighterV96(target.id);
  if (['special', 'super'].includes(attack.kind) && nonMeleeStyles.has(getXenoTrialsAttackStyleV147(definition, attack.kind))) return null;
  const spec = getXenoTrialsAttackV147(definition, attack.kind, specs[attack.kind]);
  if (!spec || spec.unblockableV151 || spec.detonationV210 || spec.projectileStyleV211 || spec.startup < .15) return null;
  const remaining = spec.startup - attack.age;
  if (remaining < -dt * .5 || remaining > dt * 4 || roll(match, cpu, attack.id, 0x736fa51d) >= .38
    || !getXenoTrialsParryViewV208(match, cpu).ready
    || !inRange(target, cpu, spec, spec.reach * definition.reach, attack.facing)) return null;
  return { guard: true, parry: true, ...(spec.contactBandV207 === 'low' ? { crouch: true } : {}) };
}

function duckPulseInput(match, cpu, definition, brain) {
  if (match.hordeV180 || definition.id !== 'synth-trooper' || definition.profileId !== synthTrooperProfile
    || !brain.observation?.projectileThreat || (cpu.movesetV207?.rearm & crouchControl)
    || !cpu.movesetV207?.low && match.tick - brain.observation.tick < 2
    || cpu.movementV210?.kind === 'ground-turn' || isXenoTrialsParryingV208(match, cpu)) return null;
  const standing = getXenoTrialsBodyBoundsV105(cpu);
  const lowTop = standing.bottom + standing.height * getXenoTrialsLowScaleV207(standing);
  let highPulse = false;
  for (const projectile of match.projectiles) {
    if (!getXenoTrialsProjectileThreatV149(projectile, cpu, .2)) continue;
    if (projectile.style !== 'pulse' || projectile.signatureIdV147 || projectile.vy
      || projectile.direction !== -cpu.facing || projectile.y <= lowTop || projectile.y > standing.top) return null;
    highPulse = true;
  }
  return highPulse ? { crouch: true } : null;
}

function riposteInput(match, cpu, target, definition) {
  if (!cpu.parryV208?.openingId || cpu.previousInput.super) return null;
  const state = getXenoTrialsRiposteReadinessV208(match, cpu, definition);
  if (!state.ready || state.attacker !== target || match.tick - state.receipt.tick < 6) return null;
  const move = getXenoTrialsRiposteV208(definition), facing = target.x >= cpu.x ? 1 : -1;
  if (!inRange(cpu, target, move.spec, move.spec.reach * definition.reach * .92, facing)) return null;
  return { guard: true, super: true };
}

function signatureInput(match, cpu, target, definition, controls, brain) {
  const rules = match.config.rulesV119;
  if ((!controls.heavy && !controls.special) || controls.guard || cpu.specialCooldown > 0 || rules?.noSpecial
    || match.config.roundSeconds - match.timeRemaining < (rules?.specialLockSeconds || 0)
    || roll(match, cpu, brain.decisions, 0x61cf479d) >= .48) return null;
  const facing = target.x >= cpu.x ? 1 : -1;
  const highGuard = target.guard && !target.movesetV207?.low;
  const options = XENO_TRIALS_SIGNATURE_KINDS_V208.map(kind => getXenoTrialsAlternateSignatureV208(definition, kind))
    .filter(move => move && !move.spec.detonationV210 && cpu.stamina >= move.spec.cost
      && inRange(cpu, target, move.spec, move.spec.reach * definition.reach, facing));
  const move = (highGuard && options.find(candidate => candidate.spec.contactBandV207 === 'low'))
    || options[Math.floor(roll(match, cpu, brain.decisions, 0x4852a533) * options.length)];
  if (!move) return null;
  return { ...controls, heavy: false, special: false, [signatureControls[move.kind]]: true };
}

function groundedContact(spec) {
  return spec && !spec.detonationV210 && !spec.projectileStyleV211 && !spec.liftV208;
}

function freshSignature(cpu, move) {
  const control = signatureControls[move?.kind];
  if (!control || !groundedContact(move.spec) || cpu.stamina < move.spec.cost) return false;
  const bit = 1 << XENO_TRIALS_MOVE_CONTROLS_V207.indexOf(control);
  return !((cpu.movesetV207?.held | cpu.movesetV207?.rearm) & bit);
}

function contactBefore(cpu, target, definition, spec, remaining, dt) {
  if (spec.startup + dt <= remaining && inRange(cpu, target, spec, spec.reach * definition.reach, cpu.facing)) return true;
  if (!spec.followThroughV210) return false;
  const later = spec.startup + spec.followThroughV210.after;
  const strike = getXenoTrialsActiveStrikeV210(spec, later);
  return later + dt <= remaining && inRange(cpu, target, strike, strike.reach * definition.reach, cpu.facing);
}

function punishWhiff(match, cpu, target, definition, brain, prior, specs, signatures, dt) {
  const attack = target.attack, sampled = prior?.attack;
  if (!brain.observation.targetRecovering || !attack || sampled?.id !== attack.id || match.tick - prior.tick < 2
    || attack.hit || attack.hitTargetsV180?.length || attack.emitted || target.y > 0) return null;
  const other = getXenoTrialsFighterV96(target.id);
  const spec = getXenoTrialsAttackV147(other, attack.kind, specs[attack.kind]);
  if (!groundedContact(spec) || spec.retreatV208
    || ['special', 'super'].includes(attack.kind) && nonMeleeStyles.has(getXenoTrialsAttackStyleV147(other, attack.kind))) return null;
  const activeEnd = spec.startup + spec.active;
  if (sampled.age >= activeEnd || attack.age < activeEnd) return null;
  const remaining = activeEnd + spec.recovery - attack.age;
  const superMove = getXenoTrialsPhysicalSuper(definition);
  if (groundedContact(superMove?.spec) && !cpu.previousInput.super && !cpu.rearmControls.super
    && getXenoTrialsSuperReadinessV148(match, cpu, definition).ready
    && contactBefore(cpu, target, definition, superMove.spec, remaining, dt)) return 'super';
  const counter = signatures.find(move => contactBefore(cpu, target, definition, move.spec, remaining, dt));
  return counter ? signatureControls[counter.kind] : null;
}

function hasRepeatedBlocks(match, cpu, target, definition, specs, dt) {
  let blocked = null, attempts = 0;
  // Count distinct recent contact windows from this fighter, up to the last
  // successful hit or round start. Horde allies cannot establish the pattern.
  for (let index = match.events.length - 1; index >= 0; index--) {
    const event = match.events[index];
    if (event.type === 'fight' || (match.tick - event.tick) * dt > 4) break;
    const ownInstance = !match.hordeV180 || event.attackerInstanceV180 === cpu.instanceIdV180;
    if (!ownInstance) continue;
    const sameTarget = event.side === target.side && event.attacker === cpu.side
      && (!match.hordeV180 || event.targetInstanceV180 === (target.instanceIdV180 || target.side));
    if (sameTarget && (event.type === 'hit' || event.type === 'guard-break')) break;
    if (sameTarget && event.type === 'block') blocked = event;
    if (event.type !== 'attack' || event.side !== cpu.side) continue;
    if (blocked && (event.kind === 'light' || event.kind === 'heavy')) {
      const spec = getXenoTrialsAttackV147(definition, event.kind, specs[event.kind]);
      const age = (blocked.tick - event.tick + 1) * dt;
      if (age + 1e-9 >= spec.startup && age < spec.startup + spec.active && ++attempts === 2) return true;
    }
    blocked = null;
  }
  return false;
}

function readyLowStrike(cpu, target, definition, specs) {
  if (cpu.previousInput.light || cpu.rearmControls.light || (cpu.movesetV207?.rearm & crouchControl)) return null;
  const spec = getXenoTrialsAttackV147(definition, 'low', specs.low);
  return spec && cpu.stamina >= spec.cost && inRange(cpu, target, spec, spec.reach * definition.reach, cpu.facing) ? spec : null;
}

function blockedShieldInput(match, cpu, target, definition, brain, prior, specs, dt) {
  const attack = target.attack;
  if (match.hordeV180 || definition.id !== 'synth-trooper' || definition.profileId !== synthTrooperProfile
    || target.id !== 'synth-containment' || attack?.kind !== 'special' || !attack.hit || target.y > 0
    || !brain.observation.targetRecovering || brain.observation.projectileThreat || prior?.attack?.id !== attack.id
    || cpu.facing !== -attack.facing || isXenoTrialsParryingV208(match, cpu)) return null;
  const low = readyLowStrike(cpu, target, definition, specs);
  if (!low) return null;
  const shield = getXenoTrialsAttackV147(getXenoTrialsFighterV96(target.id), 'special', specs.special);
  const activeEnd = shield.startup + shield.active;
  if (attack.age + low.startup + dt >= activeEnd + shield.recovery) return null;
  const blocked = match.events.some(event => {
    if (event.type !== 'block' || event.side !== cpu.side || event.attacker !== target.side || event.id <= attack.id + 1) return false;
    const contactAge = attack.age - (match.tick - event.tick) * dt;
    return contactAge + 1e-9 >= shield.startup && contactAge < activeEnd + 1e-9;
  });
  return blocked ? { crouch: true, light: true } : null;
}

function counterObservedPattern(match, cpu, target, definition, controls, brain, prior, specs, dt) {
  const rules = match.config.rulesV119;
  const facing = target.x >= cpu.x ? 1 : -1;
  if ((!controls.light && !controls.heavy) || controls.guard || controls.super || controls.special
    || !prior || brain.observation.projectileThreat || cpu.facing !== facing || cpu.groundRecoveryV211
    || isXenoTrialsParryingV208(match, cpu)) return null;
  const standingGuard = target.guard && target.facing === -facing && !target.movesetV207?.low && target.y === 0;
  const specialLocked = rules?.noSpecial || match.config.roundSeconds - match.timeRemaining < (rules?.specialLockSeconds || 0);
  if (specialLocked) return standingGuard && !match.hordeV180 && definition.id === 'runner' && definition.profileId === runnerProfile
    && readyLowStrike(cpu, target, definition, specs)
    && hasRepeatedBlocks(match, cpu, target, definition, specs, dt) ? { crouch: true, light: true } : null;
  if (cpu.specialCooldown > 0) return null;
  if (!brain.observation.targetRecovering && !standingGuard) return null;
  const signatures = XENO_TRIALS_SIGNATURE_KINDS_V208.map(kind => getXenoTrialsAlternateSignatureV208(definition, kind))
    .filter(move => freshSignature(cpu, move)).sort((a, b) => a.spec.startup - b.spec.startup);
  let action = punishWhiff(match, cpu, target, definition, brain, prior, specs, signatures, dt);
  if (!action && standingGuard) {
    const low = signatures.find(move => move.spec.contactBandV207 === 'low'
      && inRange(cpu, target, move.spec, move.spec.reach * definition.reach, facing));
    if (low && hasRepeatedBlocks(match, cpu, target, definition, specs, dt)) action = signatureControls[low.kind];
  }
  return action ? { ...controls, left: false, right: false, jump: false, light: false, heavy: false, [action]: true } : null;
}

function antiAirInput(match, cpu, target, definition, brain, prior, controls, specs, dt) {
  const profileId = antiAirProfiles.get(definition.id);
  if (match.hordeV180 || !profileId || profileId !== definition.profileId
    || !prior?.targetAirborne || target.y <= 0 || target.vy >= 0 || !antiAirStates.has(brain.state)
    || brain.observation.projectileThreat || controls.guard || cpu.guard || cpu.groundRecoveryV211
    || cpu.movementV210?.kind === 'ground-turn' || isXenoTrialsParryingV208(match, cpu)
    || ((cpu.movesetV207?.held | cpu.movesetV207?.rearm) & antiAirControl)) return null;
  const spec = getXenoTrialsAttackV147(definition, 'anti-air', specs['anti-air']);
  if (!spec || cpu.stamina < spec.cost || cpu.facing !== (target.x >= cpu.x ? 1 : -1)
    || getXenoTrialsBodyGapV105(cpu, target, cpu.facing) > spec.reach * definition.reach) return null;
  const body = getXenoTrialsBodyBoundsV105(cpu), hurt = getXenoTrialsHurtBoundsV207(target);
  if ((hurt.center - body.center) * cpu.facing < 0) return null;
  const band = getXenoTrialsStrikeBandV207(body, spec);
  // At commitment both fighters have already reached this tick's heights.
  // Advance the observed descent to contact using the engine's gravity step.
  let height = target.y, speed = target.vy;
  for (let age = dt; age < spec.startup + spec.active && height > 0; age += dt) {
    if (age >= spec.startup && height <= band.top && height + hurt.height >= band.bottom)
      return { antiAir: true };
    speed -= XENO_TRIALS_GRAVITY_V210 * dt;
    height += speed * dt;
  }
  return null;
}

function groundRecoveryInput(match, cpu, definition) {
  if (match.hordeV180 || definition.id !== 'synth-guard' || definition.profileId !== synthGuardProfile) return null;
  const recovery = getXenoTrialsGroundRecoveryV211(match, cpu);
  if (!recovery) return null;
  const reactionTick = cpu.groundRecoveryV211.tick + XENO_TRIALS_GET_UP_V211.opensAt + 8;
  return { guard: recovery.ready && match.tick >= reactionTick && !cpu.previousInput.guard && !cpu.rearmControls.guard };
}

/** Add techniques to an existing hard decision, without new saved brain state.
 * A horde caller also applies ordinary engagement and spawn grace first. */
export function chooseXenoTrialsHardTacticsV209(match, cpu, target, brain, specs, controls, dt, decided, prior) {
  if (match.config.difficulty !== 'hard' || match.hordeV180 && cpu.enemyRankV186 !== 'boss'
    || cpu.hp <= 0 || target.hp <= 0 || cpu.y !== 0 || cpu.attack || cpu.movesetV207?.evade
    || match.grappleV153) return controls;
  const definition = getXenoTrialsFighterV96(cpu.id);
  if (cpu.stun > 0) return groundRecoveryInput(match, cpu, definition) || controls;
  const defense = parryInput(match, cpu, target, controls, brain, specs, dt);
  if (defense) return defense;
  const duck = duckPulseInput(match, cpu, definition, brain);
  if (duck) return duck;
  if (!cpu.parryV208?.openingId && !decided) return controls;
  return riposteInput(match, cpu, target, definition)
    || (decided && antiAirInput(match, cpu, target, definition, brain, prior, controls, specs, dt))
    || (decided && blockedShieldInput(match, cpu, target, definition, brain, prior, specs, dt))
    || (decided && counterObservedPattern(match, cpu, target, definition, controls, brain, prior, specs, dt))
    || (decided && signatureInput(match, cpu, target, definition, controls, brain))
    || controls;
}
