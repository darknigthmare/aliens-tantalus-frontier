import { XENO_TRIALS_ATTACKS_V96, XENO_TRIALS_SPECIAL_COOLDOWN_V96 } from './xeno-trials-combat-contract-v186.js';
import { getXenoTrialsFighterV96 } from './xeno-trials-data-v96.js';
import { getXenoTrialsAttackStyleV147, getXenoTrialsAttackV147 } from './xeno-trials-signatures-v147.js';
import { hasXenoTrialsGroundTraversalV208 } from './xeno-trials-moveset-v207.js';

export const XENO_TRIALS_POWER_MODEL_V227 = Object.freeze({
  benchmark: 'warrior',
  survival: .35, offense: .40, mobility: .15, reach: .10,
  moves: Object.freeze({ light: .45, heavy: .35, special: .20 })
});

const model = XENO_TRIALS_POWER_MODEL_V227;
const cache = new Map();
const tiers = Object.keys(model.moves);
const round = value => Math.round(value * 100) / 100;
const nonContact = new Set(['acid', 'pulse', 'flame', 'ground-wave', 'acid-cluster', 'aimed-acid', 'detonation']);

function attackMetrics(fighter, kind) {
  const spec = getXenoTrialsAttackV147(fighter, kind, XENO_TRIALS_ATTACKS_V96[kind]);
  const style = kind === 'special' ? getXenoTrialsAttackStyleV147(fighter, kind) : 'contact';
  const damage = Math.max(1, Math.round(spec.damage * fighter.power));
  const cooldown = kind === 'special' ? spec.cooldown || XENO_TRIALS_SPECIAL_COOLDOWN_V96 : 0;
  const cycle = Math.max(spec.startup + spec.active + spec.recovery, cooldown);
  return Object.freeze({ style, damage, cost: spec.cost, cycle, cooldown, configuredReach: spec.reach,
    contactReach: nonContact.has(style) ? null : spec.reach * fighter.reach,
    // An attack that consumes its user is burst damage. It cannot supply repeatable pressure.
    pressure: style === 'detonation' ? 0 : damage / Math.sqrt(cycle * spec.cost) });
}

function measure(fighter) {
  const attacks = Object.freeze(Object.fromEntries(tiers.map(kind => [kind, attackMetrics(fighter, kind)])));
  return { hp: fighter.hp, stamina: fighter.stamina, speed: fighter.speed, jump: fighter.jump,
    groundTraversal: hasXenoTrialsGroundTraversalV208(fighter), attacks };
}
const benchmark = measure(getXenoTrialsFighterV96(model.benchmark));

/** MIRE rating at normal duel rules. Warrior sets the permanent 100 baseline.
 * Repeatable single-contact pressure weights damage against the attack clock and stamina cost.
 * Horizontal reach uses native light and heavy contact coefficients. The model leaves damage
 * chains, matchups, AI, stage conditions, special projectiles and meter supers to actual bouts.
 */
export function getXenoTrialsPowerBreakdownV227(id) {
  const fighter = getXenoTrialsFighterV96(id);
  if (!fighter) return null;
  if (cache.has(id)) return cache.get(id);
  const native = measure(fighter);
  const survival = .8 * native.hp / benchmark.hp + .2 * native.stamina / benchmark.stamina;
  const offense = tiers.reduce((sum, kind) => sum + model.moves[kind] * native.attacks[kind].pressure / benchmark.attacks[kind].pressure, 0);
  const pace = native.speed / benchmark.speed;
  const mobility = native.groundTraversal ? pace : .75 * pace + .25 * Math.sqrt(native.jump / benchmark.jump);
  const reach = .55 * native.attacks.light.contactReach / benchmark.attacks.light.contactReach
    + .45 * native.attacks.heavy.contactReach / benchmark.attacks.heavy.contactReach;
  const power = round(100 * (model.survival * survival + model.offense * offense + model.mobility * mobility + model.reach * reach));
  const view = Object.freeze({ id, power, survival: round(100 * survival), offense: round(100 * offense),
    mobility: round(100 * mobility), reach: round(100 * reach), native: Object.freeze(native) });
  cache.set(id, view);
  return view;
}

export function getXenoTrialsSimulationPowerV227(id) {
  return getXenoTrialsPowerBreakdownV227(id)?.power ?? null;
}

export function compareXenoTrialsSimulationPowerV227(left, right) {
  const a = getXenoTrialsSimulationPowerV227(left?.id) ?? Infinity;
  const b = getXenoTrialsSimulationPowerV227(right?.id) ?? Infinity;
  if (a !== b) return a < b ? -1 : 1;
  const first = left?.id ?? '', second = right?.id ?? '';
  return first < second ? -1 : first > second ? 1 : 0;
}
