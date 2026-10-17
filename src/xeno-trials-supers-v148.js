/** Original versus extensions of referenced V147 capabilities, NOT canonical
 * supers, captured choreography or new character art. Exact identities only.
 * Meter is match-local and only earned by resolved contact, never by time,
 * missed swings, animation callbacks or a super funding itself. */
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
export const XENO_TRIALS_SUPER_METER_V148 = freeze({ maximum: 100, dealt: .6, received: .4, blocked: .2 });
const entry = (id, fighterId, profileId, label, sourceId, description, spec) => ({
  id, fighterId, profileId, label, sourceId, description,
  evidence: 'original-versus-extension-of-referenced-capability', canonExact: false,
  animation: 'existing-static-pose', meterCost: 100,
  spec: { ...spec, cost: 48, groundedOnly: true, cooldown: 3, superV148: true }
});
export const XENO_TRIALS_SUPERS_V148 = freeze([
  entry('brute-seismic-sequence', 'drive-v123-fte-pathogen-brute-profile-v13',
    'pose-v123-drive-fte-pathogen-brute-profile-v13', 'Percussions en chaîne', 'pathogen',
    'Trois impulsions rasantes successives. Chaque front peut être sauté ; les impulsions restantes cessent si la frappe est interrompue.',
    { damage: 24, reach: 310, startup: .65, active: .5, recovery: .9, stun: .15, push: 18,
      projectileSpeed: 440, projectileHeight: 20, volleyCount: 3, volleyInterval: .2 }),
  entry('queen-acid-saturation', 'drive-v123-fte-pathogen-queen-right-v13',
    'pose-v123-drive-fte-pathogen-queen-right-v13', 'Saturation corrosive', 'pathogen',
    'Deux grappes de trois projectiles. Les deux salves gardent la visée relevée au départ : aucun suivi de la cible.',
    { damage: 11, reach: 650, startup: .7, active: .32, recovery: 1, stun: .1, push: 9,
      projectileSpeed: 430, spread: .18, volleyCount: 2, volleyInterval: .22 }),
  entry('warden-acid-barrage', 'import-game-afe2-warden', 'pose-v106-import-game-afe2-warden',
    'Barrage de contrôle', 'dossier',
    'Deux projections acides sur la ligne préparée. L’anticipation expose le Warden ; une esquive latérale ou un saut peut faire manquer les tirs.',
    { damage: 31, reach: 580, startup: .62, active: .38, recovery: .85, stun: .22, push: 25,
      projectileSpeed: 440, volleyCount: 2, volleyInterval: .28 }),
  entry('exploder-terminal-burst', 'import-game-afe2-exploder', 'pose-v106-import-game-afe2-exploder',
    'Rupture totale', 'dossier',
    'Une détonation élargie après une ruée annoncée. L’Exploder est consommé même sur un échec ; aucune invulnérabilité et double KO possible.',
    { damage: 240, reach: 220, startup: .7, active: .64, recovery: .6, stun: .55, push: 58,
      chargeDuration: .5, chargeSpeed: 410 }),
  entry('harbinger-committed-leap', 'import-game-afe2-harbinger', 'pose-v106-import-game-afe2-harbinger',
    'Bond d’assaut', 'dossier',
    'Un bond plus engagé, à direction verrouillée. Un seul contact accepté ; aucun ciblage automatique ni téléportation.',
    { damage: 62, reach: 84, startup: .48, active: .56, recovery: .95, stun: .5, push: 55,
      leapSpeed: 460, leapImpulse: 330 })
]);
const byId = new Map(XENO_TRIALS_SUPERS_V148.map(item => [item.fighterId, item]));
export function getXenoTrialsSuperV148(definition) {
  const value = byId.get(definition?.id);
  return value && value.profileId === definition.profileId ? value : null;
}
export function getXenoTrialsSuperMeterV148(fighter) {
  return Number.isFinite(fighter?.superMeterV148)
    ? Math.max(0, Math.min(XENO_TRIALS_SUPER_METER_V148.maximum, fighter.superMeterV148)) : 0;
}
export function addXenoTrialsSuperMeterV148(fighter, amount) {
  if (!Number.isFinite(fighter?.superMeterV148) || !Number.isFinite(amount) || amount <= 0) return;
  // Integer hundredths keep all observations and replay rates unambiguous.
  fighter.superMeterV148 = Math.min(100, Math.round((getXenoTrialsSuperMeterV148(fighter) + amount) * 100) / 100);
}
export function awardXenoTrialsContactMeterV148(from, to, damage, guarded, superAttack = false) {
  if (!Number.isFinite(damage) || damage <= 0) return;
  const rates = XENO_TRIALS_SUPER_METER_V148;
  if (!superAttack) addXenoTrialsSuperMeterV148(from, damage * (guarded ? rates.blocked : rates.dealt));
  addXenoTrialsSuperMeterV148(to, damage * rates.received);
}
/** Shared UI/engine/CPU admission. A failed attempt performs no transaction. */
export function getXenoTrialsSuperReadinessV148(match, fighter, definition) {
  const value = getXenoTrialsSuperV148(definition), meter = getXenoTrialsSuperMeterV148(fighter);
  const answer = reason => ({ supported: Boolean(value), id: value?.id || null, label: value?.label || null,
    meter, maximum: 100, ready: reason === null, reason });
  if (!value) return answer('unavailable');
  if (!match || !fighter || match.paused || match.phase !== 'active' || match.presentation?.blocksSimulation || fighter.hp <= 0) return answer('inactive');
  if (match.config.rulesV119?.noSpecial) return answer('rules');
  if (match.config.roundSeconds - match.timeRemaining < (match.config.rulesV119?.specialLockSeconds || 0)) return answer('locked');
  if (fighter.attack || fighter.guard || fighter.stun > 0 || fighter.y > 0) return answer('busy');
  if (fighter.specialCooldown > 0) return answer('cooldown');
  if (meter < value.meterCost) return answer('meter');
  if (fighter.stamina < value.spec.cost) return answer('stamina');
  return answer(null);
}

export function getXenoTrialsSuperStatusV148(state) {
  if (!state?.supported) return 'Super indisponible';
  const labels = { inactive: 'Suspendu', rules: 'Interdit par les règles', locked: 'Verrouillé',
    busy: 'Action en cours', cooldown: 'Récupération', meter: 'Jauge insuffisante', stamina: 'Endurance insuffisante' };
  return `${state.label} · ${Math.floor(state.meter)} / ${state.maximum} · ${state.ready ? 'Prêt' : labels[state.reason] || 'Indisponible'}`;
}
