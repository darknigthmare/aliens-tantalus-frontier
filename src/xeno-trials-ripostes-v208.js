import { getXenoTrialsSuperMeterV148, getXenoTrialsSuperV148 } from './xeno-trials-supers-v148.js';
import { XENO_TRIALS_PARRY_V208, getXenoTrialsParryOpeningV208, getXenoTrialsParryReceiptV208 } from './xeno-trials-defense-v208.js';
import { getXenoTrialsPhysicalCounter } from './xeno-trials-super-kits-v209.js';
import { XENO_TRIALS_EXPLODER_COUNTER_V211 } from './xeno-trials-super-kits-v211.js';

export const XENO_TRIALS_RIPOSTE_KIND_V208 = 'super-riposte';

function entry(fighterId, label, description, labelEn, descriptionEn, spec) {
  return Object.freeze({ id: `${fighterId}::super2`, fighterId, label, description, labelEn, descriptionEn,
    meterCost: 100, spec: Object.freeze({ ...spec, groundedOnly: true, cooldown: 3, superV148: true }) });
}

// Original Trials responses using the existing actor's supported body, never
// a new caste, weapon or canon sequence.
export const XENO_TRIALS_RIPOSTES_V208 = Object.freeze([
  entry('drive-v123-fte-pathogen-brute-profile-v13', 'Marteau rasant',
    'Les bras en massues rabattent l’assaillant à courte portée. Une garde basse ou une sortie de portée arrête la réponse.',
    'Low hammer', 'A short-range blow from the clubbed arms. Guard low or step out of range.',
    { cost: 39, damage: 53, reach: 72, startup: .21, active: .1, recovery: .71, stun: .34, push: 38, contactBandV207: 'low' }),
  entry('drive-v123-fte-pathogen-queen-right-v13', 'Fauchage royal',
    'Un balayage de corps à large portée. Sa préparation laisse le temps de s’écarter ou d’interrompre la Reine.',
    'Royal sweep', 'A wide body sweep. Step away or interrupt the Queen during its startup.',
    { cost: 44, damage: 46, reach: 112, startup: .30, active: .14, recovery: .79, stun: .36, push: 74 }),
  entry('import-game-afe2-warden', 'Heurt de contention',
    'Un heurt frontal de la cuirasse avec un fort recul. Une garde freine la poussée.',
    'Containment check', 'A frontal check with heavy knockback. Guard to reduce its push.',
    { cost: 37, damage: 45, reach: 84, startup: .18, active: .11, recovery: .62, stun: .44, push: 58 }),
  entry('import-game-afe2-harbinger', 'Percée d’interception',
    'Une percée au sol vise le haut du corps et peut atteindre un adversaire qui s’élève. La direction reste verrouillée.',
    'Intercepting thrust', 'A grounded thrust that can catch a rising opponent. Its direction locks at startup.',
    { cost: 34, damage: 43, reach: 75, startup: .16, active: .14, recovery: .64, stun: .38, push: 42,
      contactHeightRatioV151: 1.15, activeAdvanceV208: 125 })
]);
const byFighter = new Map(XENO_TRIALS_RIPOSTES_V208.map(move => [move.fighterId, move]));

export function getXenoTrialsRiposteV208(definition) {
  if (!getXenoTrialsSuperV148(definition)) return null;
  if (definition.id === XENO_TRIALS_EXPLODER_COUNTER_V211.fighterId && definition.profileId === XENO_TRIALS_EXPLODER_COUNTER_V211.profileId)
    return XENO_TRIALS_EXPLODER_COUNTER_V211;
  return byFighter.get(definition.id) ?? getXenoTrialsPhysicalCounter(definition);
}

export function getXenoTrialsRiposteReadinessV208(match, fighter, definition) {
  const move = getXenoTrialsRiposteV208(definition);
  const meter = getXenoTrialsSuperMeterV148(fighter);
  const answer = (reason, receipt = null, attacker = null) => ({ supported: Boolean(move), id: move?.id ?? null,
    label: move?.label ?? null, labelEn: move?.labelEn ?? null, description: move?.description ?? null,
    descriptionEn: move?.descriptionEn ?? null, meter, maximum: 100, ready: reason === null,
    reason, remainingTicks: receipt ? Math.max(0, receipt.tick + XENO_TRIALS_PARRY_V208.openingTicks - match.tick) : 0,
    receipt, attacker });
  if (!move) return answer('unavailable');
  if (!match || !fighter || match.paused || match.phase !== 'active' || match.presentation?.blocksSimulation || fighter.hp <= 0)
    return answer('inactive');
  if (match.config.rulesV119?.noSpecial) return answer('rules');
  if (match.config.roundSeconds - match.timeRemaining < (match.config.rulesV119?.specialLockSeconds || 0)) return answer('locked');
  const receipt = getXenoTrialsParryReceiptV208(match, fighter);
  const attacker = receipt && getXenoTrialsParryOpeningV208(match, fighter);
  if (!attacker || attacker.attack?.id !== receipt.attackIdV208) return answer('parry');
  if (fighter.attack || fighter.stun > 0 || fighter.y > 0 || fighter.movesetV207?.evade) return answer('busy', receipt, attacker);
  if (fighter.specialCooldown > 0) return answer('cooldown', receipt, attacker);
  if (meter < move.meterCost) return answer('meter', receipt, attacker);
  if (fighter.stamina < move.spec.cost) return answer('stamina', receipt, attacker);
  return answer(null, receipt, attacker);
}

export function getXenoTrialsRiposteStatusV208(state, language = 'fr') {
  const english = language === 'en';
  if (!state?.supported) return english ? 'Super counter unavailable' : 'Riposte super indisponible';
  const french = { parry: 'Parade réussie requise', inactive: 'Suspendue', rules: 'Interdite par les règles',
    locked: 'Verrouillée', busy: 'Action en cours', cooldown: 'Récupération',
    meter: 'Jauge insuffisante', stamina: 'Endurance insuffisante' };
  const translated = { parry: 'Successful parry required', inactive: 'Paused', rules: 'Disabled by rules',
    locked: 'Locked', busy: 'Action in progress', cooldown: 'Recovering', meter: 'Insufficient meter', stamina: 'Insufficient stamina' };
  return english
    ? `${state.labelEn} · ${state.ready ? 'Guard + Super' : translated[state.reason] || 'Unavailable'}`
    : `${state.label} · ${state.ready ? 'Garde + Super' : french[state.reason] || 'Indisponible'}`;
}

export function isXenoTrialsRiposteTargetV208(attack, enemy) {
  return attack.riposteV208?.target === (enemy.instanceIdV180 ?? enemy.side);
}

export function validXenoTrialsRiposteAttackV208(attack, fighter, match, move) {
  if (attack.kind !== XENO_TRIALS_RIPOSTE_KIND_V208) return attack.riposteV208 === undefined;
  const proof = attack.riposteV208;
  if (!move || !proof || typeof proof !== 'object' || Array.isArray(proof) || Object.keys(proof).length !== 4
    || !Number.isInteger(proof.parryId) || proof.parryId <= 0 || proof.parryId >= attack.id
    || !Number.isInteger(proof.attackId) || proof.attackId <= 0 || proof.attackId >= proof.parryId
    || !Number.isInteger(proof.tick) || proof.tick <= 0 || typeof proof.target !== 'string'
    || attack.age <= 0 || attack.hit && attack.age < move.spec.startup || attack.facing !== fighter.facing || match.phase !== 'active'
    || fighter.hp <= 0 || fighter.stun !== 0 || fighter.y !== 0 || fighter.guard
    || fighter.parryV208?.openingId !== 0 || !(fighter.stats.supersV148 > 0)
    || attack.emitted || Object.keys(attack).some(key => !['kind', 'age', 'hit', 'emitted', 'facing', 'id', 'riposteV208', 'hitTargetsV180'].includes(key)))
    return false;
  const ticks = Math.round(attack.age * 120);
  const launchTick = match.tick - ticks + 1;
  if (Math.abs(attack.age * 120 - ticks) > 1e-8 || proof.tick > launchTick
    || launchTick - proof.tick >= XENO_TRIALS_PARRY_V208.openingTicks) return false;
  const expectedSide = fighter.side === 'player' ? 'opponent' : 'player';
  if (!match.hordeV180 || expectedSide === 'player') {
    if (proof.target !== expectedSide) return false;
  } else if (!/^horde-[1-9]\d*$/.test(proof.target) || Number(proof.target.slice(6)) > match.hordeV180.serial) return false;
  const events = match.events;
  if (!Array.isArray(events)) return false;
  const launch = events.find(event => event?.id === attack.id + 1);
  if (launch) {
    if (launch.type !== 'attack' || launch.kind !== attack.kind || launch.tick !== launchTick || launch.side !== fighter.side
      || launch.riposteIdV208 !== move.id || match.hordeV180 && launch.attackerInstanceV180 !== (fighter.instanceIdV180 ?? fighter.side))
      return false;
  } else if (!Number.isInteger(events[0]?.id) || attack.id + 1 >= events[0].id) return false;
  const parry = events.find(event => event?.id === proof.parryId);
  if (parry) {
    if (parry.type !== 'parry-v208' || parry.tick !== proof.tick || parry.attackIdV208 !== proof.attackId
      || parry.side !== fighter.side || parry.attacker !== expectedSide || parry.damage !== 0
      || match.hordeV180 && (parry.attackerInstanceV180 !== proof.target || parry.targetInstanceV180 !== (fighter.instanceIdV180 ?? fighter.side)))
      return false;
  } else if (!Number.isInteger(events[0]?.id) || proof.parryId >= events[0].id) return false;
  if (!match.hordeV180) return attack.hitTargetsV180 === undefined;
  return attack.hit ? attack.hitTargetsV180?.length === 1 && attack.hitTargetsV180[0] === proof.target
    : attack.hitTargetsV180 === undefined;
}
