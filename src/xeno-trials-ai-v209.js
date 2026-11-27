import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsBodyBoundsV105, getXenoTrialsBodyGapV105 } from './xeno-trials-geometry-v105.js';
import { getXenoTrialsHurtBoundsV207, getXenoTrialsStrikeBandV207 } from './xeno-trials-moveset-v207.js';
import { getXenoTrialsParryViewV208 } from './xeno-trials-defense-v208.js';
import { getXenoTrialsRiposteReadinessV208, getXenoTrialsRiposteV208 } from './xeno-trials-ripostes-v208.js';
import { getXenoTrialsAttackStyleV147, getXenoTrialsAttackV147 } from './xeno-trials-signatures-v147.js';
import { getXenoTrialsAlternateSignatureV208, XENO_TRIALS_SIGNATURE_KINDS_V208 } from './xeno-trials-signature-kit-v208.js';

const nonMeleeStyles = new Set(['acid', 'pulse', 'flame', 'detonation', 'ground-wave', 'acid-cluster', 'aimed-acid']);
const signatureControls = { 'signature-2': 'signature2', 'signature-3': 'signature3' };

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
  if (!spec || spec.unblockableV151 || spec.detonationV210 || spec.startup < .15) return null;
  const remaining = spec.startup - attack.age;
  if (remaining < -dt * .5 || remaining > dt * 4 || roll(match, cpu, attack.id, 0x736fa51d) >= .38
    || !getXenoTrialsParryViewV208(match, cpu).ready
    || !inRange(target, cpu, spec, spec.reach * definition.reach, attack.facing)) return null;
  return { guard: true, parry: true, ...(spec.contactBandV207 === 'low' ? { crouch: true } : {}) };
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

/** Add techniques to an existing hard decision, without new saved brain state.
 * A horde caller also applies ordinary engagement and spawn grace first. */
export function chooseXenoTrialsHardTacticsV209(match, cpu, target, brain, specs, controls, dt, decided) {
  if (match.config.difficulty !== 'hard' || match.hordeV180 && cpu.enemyRankV186 !== 'boss'
    || cpu.hp <= 0 || target.hp <= 0 || cpu.y !== 0 || cpu.attack || cpu.stun > 0 || cpu.movesetV207?.evade
    || match.grappleV153) return controls;
  const defense = parryInput(match, cpu, target, controls, brain, specs, dt);
  if (defense) return defense;
  if (!cpu.parryV208?.openingId && !decided) return controls;
  const definition = getXenoTrialsFighterV96(cpu.id);
  return riposteInput(match, cpu, target, definition)
    || (decided && signatureInput(match, cpu, target, definition, controls, brain))
    || controls;
}
