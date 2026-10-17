/** Fireteam Elite cohort, explicitly separate from film/ACM namesakes.
 * Source describes capabilities, not captured animation or balance. These
 * original 2D contracts do not certify the existing imported art as 1:1.
 */
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
export const XENO_TRIALS_CASTE_SOURCES_V151 = freeze({
  'fte-dossier-2021': {
    title: 'Cold Iron Studios — Fireteam enemy descriptions, IGN First (2021)',
    url: 'https://www.ign.com/articles/aliens-fireteam-meet-6-new-xenomorph-types-ign-first',
    accessedVia: 'https://www.avpgalaxy.net/2021/03/09/our-first-look-at-six-types-of-xenomorphs-in-aliens-fireteam/',
    checked: '2026-10-17', directAccess: 'blocked', evidence: 'developer-descriptions-reproduced-by-secondary-source',
    scope: 'Prowler close leap/knockdown; Runner claws and tail; Spitter ranged acid; Burster acid release when slain.',
    limits: 'No measured frames, timings, ranges or complete move lists. Original IGN page inaccessible; attributed descriptions read in the linked reproduction.'
  }
});
const make = (id, fighterId, profileId, label, style, description, spec, extra = {}) => ({
  id, fighterId, profileId, label, style, description, sourceId: 'fte-dossier-2021',
  evidence: 'attributed-capability-adaptation', canonExact: false, animation: 'existing-static-pose',
  spec: { groundedOnly: true, ...spec }, ...extra
});
export const XENO_TRIALS_CASTES_V151 = freeze([
  make('fte-prowler-ambush-leap', 'prowler', 'castes-game_afe_prowler', 'Bond du rôdeur', 'leap',
    'Bond physique annoncé, direction verrouillée. Un seul contact ; sauter ou interrompre la préparation. La prise au sol complète reste à produire.',
    { cost: 34, damage: 30, reach: 48, startup: .32, active: .44, recovery: .62, stun: .42, push: 26,
      leapSpeed: 360, leapImpulse: 270, cooldown: 1.9 }),
  make('fte-runner-tail-sweep', 'drive-v123-afe-runner', 'pose-v123-drive-afe-runner', 'Balayage caudal', 'tail-sweep',
    'Balayage bas à portée de queue, sans ruée ni téléportation. Sortir de portée ou passer au-dessus de la zone basse.',
    { cost: 30, damage: 29, reach: 116, startup: .24, active: .12, recovery: .46, stun: .24, push: 32,
      contactHeightRatioV151: .64, cooldown: 1.6 }),
  make('fte-spitter-aimed-acid', 'drive-v123-afe-spitter', 'pose-v123-drive-afe-spitter', 'Crachat ajusté', 'aimed-acid',
    'Un projectile acide vers la position observée à l’émission. La trajectoire reste fixe ; esquiver après la préparation. Aucun suivi automatique.',
    { cost: 38, damage: 31, reach: 540, startup: .42, active: .10, recovery: .56, stun: .2, push: 16,
      projectileSpeed: 420, cooldown: 2.0 }),
  make('fte-burster-close-assault', 'burster', 'castes-game_afe_burster', 'Assaut du Burster', 'ram',
    'Assaut de contact, pas un crachat. À sa mort, une unique projection acide frappe à proximité avant le verdict : double KO possible. Neutralisée en mode sans spécial.',
    { cost: 32, damage: 26, reach: 50, startup: .28, active: .24, recovery: .54, stun: .22, push: 18, cooldown: 1.8 },
    { deathBurst: { radius: 132, damage: 42, stun: .16, push: 10 } })
]);
const byId = new Map(XENO_TRIALS_CASTES_V151.map(value => [value.fighterId, value]));
export function getXenoTrialsCasteV151(definition) {
  const value = byId.get(definition?.id);
  return value && value.profileId === definition.profileId ? value : null;
}

/** Resolve at most the two newly defeated actors BEFORE deciding the round.
 * It only collects physical impacts; the engine remains the damage/stats owner.
 * Death flags and round-local FX are reset by normal fighter reconstruction.
 */
export function collectXenoTrialsDeathBurstsV151(match, livingAtStart, bounds, impact, emit) {
  if (match.phase !== 'active' || match.paused || match.config.rulesV119?.noSpecial) return;
  for (let pass = 0; pass < match.fighters.length; pass++) {
    let resolved = false;
    for (const fighter of match.fighters) {
      const burst = livingAtStart.get(fighter)?.deathBurst;
      if (!burst || fighter.hp > 0 || fighter.deathBurstV151) continue;
      fighter.deathBurstV151 = true; resolved = true;
      const own = bounds(fighter), x = own.center, y = own.bottom + own.height * .5;
      (match.synthEffectsV110 ||= []).push({ kind: 'acid-death-v151', x, y, radius: burst.radius, life: .4 });
      emit('burster-death-v151', { side: fighter.side, x, y, radius: burst.radius });
      for (const target of match.fighters) {
        if (target === fighter || target.hp <= 0) continue;
        const body = bounds(target), nx = Math.max(body.left, Math.min(body.right, x)), ny = Math.max(body.bottom, Math.min(body.top, y));
        if (Math.hypot(nx - x, ny - y) > burst.radius) continue;
        impact({ from: fighter, to: target, power: 1, direction: target.x >= fighter.x ? 1 : -1,
          spec: { damage: burst.damage, stun: burst.stun, push: burst.push, unblockableV151: true } });
      }
    }
    if (!resolved) break;
  }
}
