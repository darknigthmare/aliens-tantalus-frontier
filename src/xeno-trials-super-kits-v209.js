function move(fighterId, profileId, slot, label, labelEn, description, descriptionEn, spec) {
  return Object.freeze({
    id: `${fighterId}::super${slot}`, fighterId, profileId, label, labelEn, description, descriptionEn,
    ...(slot === 1 ? { styleV209: 'physical' } : {}), evidence: 'original-trials-gameplay',
    canonExact: false, animation: 'existing-silhouette', meterCost: 100,
    spec: Object.freeze({ ...spec, groundedOnly: true, cooldown: 3, superV148: true }),
  });
}

const pair = (fighterId, profileId, first, counter) => Object.freeze({
  first: move(fighterId, profileId, 1, ...first), counter: move(fighterId, profileId, 2, ...counter),
});

// These original Trials actions use the admitted limbs, stance or equipment
// of the named actor. A costume or related caste cannot inherit a pair.
export const XENO_TRIALS_SUPER_KITS_V209 = Object.freeze([
  pair('grid', 'castes-film_grid_avp_2004',
    ['Cercle de cisaillement', 'Shearing arc', 'Frappe ample de queue à hauteur du torse, avec une sortie vulnérable.', 'A broad torso-height tail strike with a vulnerable recovery.',
      { cost: 43, damage: 57, reach: 108, startup: .32, active: .18, recovery: .82, stun: .36, push: 53, hordeTargetsV209: 2 }],
    ['Reprise rasante', 'Low reprise', 'La riposte prend les appuis. Une garde basse la contient.', 'The counter takes the legs. A low guard contains it.',
      { cost: 30, damage: 38, reach: 87, startup: .17, active: .11, recovery: .67, stun: .29, push: 31, contactBandV207: 'low' }]),
  pair('razor-claws', 'castes-game_avp_capcom_razor_claws',
    ['Tenaille profonde', 'Deep pincer', 'Les griffes avancent en ligne sur une courte fenêtre.', 'The claws advance in a straight line during a short contact window.',
      { cost: 40, damage: 54, reach: 67, startup: .24, active: .19, recovery: .82, stun: .33, push: 38, approachV208: 185, hordeTargetsV209: 1 }],
    ['Revers montant', 'Rising rake', 'Les griffes interceptent le haut de la silhouette. Descendre sous l’arc permet de passer.', 'The claws catch the upper silhouette. Move beneath the arc to evade.',
      { cost: 32, damage: 39, reach: 66, startup: .17, active: .12, recovery: .69, stun: .33, push: 37, contactBandV207: 'anti-air' }]),
  pair('chrysalis', 'castes-game_avp_capcom_chrysalis',
    ['Choc de carapace', 'Carapace impact', 'La masse avance droit devant avec un départ lourd et une forte poussée.', 'The shell drives straight ahead with a heavy startup and strong knockback.',
      { cost: 52, damage: 65, reach: 73, startup: .38, active: .24, recovery: .93, stun: .44, push: 72, approachV208: 195, hordeTargetsV209: 2 }],
    ['Contrebutée', 'Shell check', 'Un coup court du corps repousse l’assaillant sans parcourir l’arène.', 'A short body check repels the attacker without travelling across the arena.',
      { cost: 34, damage: 43, reach: 69, startup: .19, active: .14, recovery: .75, stun: .34, push: 69 }]),
  pair('royal-guard', 'castes-game_avp_capcom_royal_guard',
    ['Balayage sentinelle', 'Sentinel sweep', 'La queue balaie plusieurs appuis au sol. Sauter ou garder bas offre un contre-jeu.', 'The tail sweeps multiple grounded targets. Jump or guard low.',
      { cost: 50, damage: 60, reach: 116, startup: .44, active: .16, recovery: .89, stun: .42, push: 61,
        contactBandV207: 'low', groundedTargetV208: true, hordeTargetsV209: 3 }],
    ['Rappel de garde', 'Guard recall', 'Un revers à hauteur moyenne rétablit de la distance.', 'A mid-height backhand restores separation.',
      { cost: 38, damage: 46, reach: 93, startup: .20, active: .12, recovery: .77, stun: .35, push: 65, retreatV208: 78 }]),
  pair('crusher-acm', 'castes-game_acm_crusher',
    ['Charge de traverse', 'Cross-lane charge', 'Une charge de crête en ligne, limitée à la fenêtre active. Sortir tôt de sa trajectoire l’expose.', 'A straight crest charge confined to its active window. Leave the lane early to expose it.',
      { cost: 55, damage: 66, reach: 77, startup: .47, active: .23, recovery: .97, stun: .47, push: 84,
        approachV208: 238, groundedTargetV208: true, hordeTargetsV209: 2 }],
    ['Coup d’étrave', 'Crest check', 'Une poussée frontale très courte, avec recul lourd au contact.', 'A very short frontal shove with strong knockback on contact.',
      { cost: 38, damage: 49, reach: 62, startup: .23, active: .13, recovery: .80, stun: .41, push: 73, approachV208: 94 }]),
  pair('spitter', 'castes-game_acm_spitter',
    ['Coup de lisière', 'Perimeter strike', 'Le corps avance au contact et se retire ensuite. La préparation est interruptible.', 'The body enters contact and then withdraws. Its startup can be interrupted.',
      { cost: 45, damage: 51, reach: 73, startup: .31, active: .16, recovery: .84, stun: .31, push: 44,
        approachV208: 140, retreatV208: 162, hordeTargetsV209: 1 }],
    ['Repli de contact', 'Contact withdrawal', 'Une riposte légère au ras du sol précède un recul borné.', 'A light low counter precedes a bounded retreat.',
      { cost: 30, damage: 37, reach: 72, startup: .16, active: .10, recovery: .71, stun: .28, push: 30,
        contactBandV207: 'low', retreatV208: 127 }]),
  pair('xenoborg', 'castes-game_xenoborg_avp1999',
    ['Pivot de châssis', 'Chassis pivot', 'Un impact ascendant du châssis couvre la trajectoire haute au contact.', 'A rising chassis impact covers the high lane at close range.',
      { cost: 49, damage: 56, reach: 82, startup: .35, active: .17, recovery: .88, stun: .42, push: 55,
        contactBandV207: 'anti-air', hordeTargetsV209: 2 }],
    ['Revers blindé', 'Armored reverse', 'Un choc frontal bref rend de l’espace sans tirer ni verrouiller la cible au-delà de la parade.', 'A brief frontal check buys space without firing or tracking beyond the parry target.',
      { cost: 36, damage: 44, reach: 80, startup: .19, active: .13, recovery: .74, stun: .35, push: 60 }]),
  pair('synth-containment', 'pose-v110-afe-synth-containment',
    ['Brèche de confinement', 'Containment breach', 'Le bouclier avance au contact sans protection supplémentaire pendant la frappe.', 'A shield charge enters contact without extra protection during the strike.',
      { cost: 53, damage: 58, reach: 75, startup: .41, active: .21, recovery: .90, stun: .45, push: 80,
        approachV208: 170, hordeTargetsV209: 2 }],
    ['Rejet au bouclier', 'Shield rejection', 'Une poussée du bouclier à portée courte. L’assaillant peut garder s’il retrouve ses appuis.', 'A short shield shove. The attacker can guard after recovering.',
      { cost: 35, damage: 41, reach: 71, startup: .18, active: .14, recovery: .73, stun: .38, push: 77 }]),
  pair('synth-peacekeeper', 'pose-v112-afe2-peacekeeper',
    ['Arc de sécurité', 'Security arc', 'La matraque décrit un arc montant, vulnérable pendant sa préparation.', 'The baton traces a rising arc with an interruptible startup.',
      { cost: 45, damage: 55, reach: 94, startup: .33, active: .15, recovery: .86, stun: .42, push: 50,
        contactBandV207: 'anti-air', hordeTargetsV209: 2 }],
    ['Frappe de rappel', 'Baton check', 'La riposte à la matraque accroche la ligne basse quand la garde est haute.', 'The baton counter catches the low lane against standing guard.',
      { cost: 33, damage: 40, reach: 83, startup: .18, active: .10, recovery: .68, stun: .34, push: 32, contactBandV207: 'low' }]),
  pair('synth-automated-powerloader', 'pose-v116-automated-powerloader',
    ['Écartement industriel', 'Industrial spread', 'Les pinces ouvrent une voie au sol pour plusieurs contacts. Sauter passe au-dessus.', 'The clamps clear a lane for multiple grounded targets. Jump above them.',
      { cost: 54, damage: 63, reach: 97, startup: .43, active: .22, recovery: .98, stun: .44, push: 78,
        groundedTargetV208: true, approachV208: 102, hordeTargetsV209: 3 }],
    ['Butée de vérin', 'Hydraulic stop', 'Une poussée courte des pinces force le recul sans saut ni saisie.', 'A short clamp shove forces separation without jumping or grabbing.',
      { cost: 39, damage: 48, reach: 81, startup: .22, active: .12, recovery: .81, stun: .39, push: 71 }]),
  pair('import-engineer-armorsuit', 'pose-v105-import-engineer-armorsuit',
    ['Percussion d’armure', 'Armor percussion', 'Une frappe de l’épaule met du poids dans une avancée courte et annoncée.', 'A shoulder strike puts weight behind a short, telegraphed advance.',
      { cost: 50, damage: 61, reach: 78, startup: .37, active: .19, recovery: .91, stun: .43, push: 65,
        approachV208: 157, hordeTargetsV209: 2 }],
    ['Angle fermé', 'Closed angle', 'Un contre de l’avant-bras réduit l’espace entre les deux combattants.', 'A forearm counter briefly closes the gap between fighters.',
      { cost: 36, damage: 44, reach: 74, startup: .20, active: .13, recovery: .76, stun: .42, push: 40, approachV208: 84 }]),
  pair('import-game-dd-guardian', 'pose-v106-import-game-dd-guardian',
    ['Rupture de distance', 'Distance rupture', 'Une percussion haute au corps repousse l’adversaire, puis le Guardian se retire.', 'A high body check repels the target, then the Guardian steps back.',
      { cost: 45, damage: 53, reach: 86, startup: .29, active: .14, recovery: .82, stun: .37, push: 58,
        contactBandV207: 'anti-air', retreatV208: 111, hordeTargetsV209: 1 }],
    ['Contre de proximité', 'Close counter', 'Un coup de l’avant-bras casse le rythme puis crée une demi-longueur de recul.', 'A forearm check breaks the rhythm and creates a short retreat.',
      { cost: 31, damage: 38, reach: 67, startup: .17, active: .12, recovery: .66, stun: .31, push: 51, retreatV208: 95 }]),
  pair('dd-darwin-era-cultist', 'pose-v118-dd-darwin-era-cultist',
    ['Assaut d’enfoncement', 'Breaching assault', 'Une fente au corps concentrée sur le premier contact en horde.', 'A body lunge focused on the first contact in a horde.',
      { cost: 44, damage: 56, reach: 68, startup: .28, active: .21, recovery: .85, stun: .37, push: 48,
        approachV208: 188, hordeTargetsV209: 1 }],
    ['Feinte au ras du sol', 'Underhand check', 'Une réponse courte aux appuis ouvre une garde haute, avec peu de recul.', 'A short counter to the legs opens standing guard with modest knockback.',
      { cost: 29, damage: 36, reach: 65, startup: .15, active: .11, recovery: .67, stun: .32, push: 28, contactBandV207: 'low' }]),
  pair('drive-v123-neca-snake-series13-v14', 'pose-v123-drive-neca-snake-series13-v14',
    ['Enroulement de ligne', 'Coil sweep', 'Le corps balaie la ligne basse en avançant au sol. Un saut esquive la zone.', 'The body sweeps low while moving along the ground. Jump to escape the sweep.',
      { cost: 47, damage: 55, reach: 90, startup: .33, active: .22, recovery: .86, stun: .37, push: 46,
        contactBandV207: 'low', groundedTargetV208: true, approachV208: 158, hordeTargetsV209: 2 }],
    ['Dévidement', 'Uncoiling counter', 'Une poussée courte du corps dénoue la distance face à l’assaillant.', 'A short body shove creates distance from the attacker.',
      { cost: 32, damage: 39, reach: 77, startup: .16, active: .12, recovery: .72, stun: .28, push: 45, retreatV208: 116 }]),
  pair('drive-v123-creature-resurrection-newborn-v2', 'pose-v123-drive-creature-resurrection-newborn-v2',
    ['Percussion du seuil', 'Threshold slam', 'Un rabattement des bras d’une grande portée, au sol. Une longue préparation expose le corps.', 'A wide grounded arm slam. Its long windup exposes the body.',
      { cost: 55, damage: 67, reach: 104, startup: .48, active: .17, recovery: .99, stun: .47, push: 67,
        groundedTargetV208: true, hordeTargetsV209: 2 }],
    ['Retour de masse', 'Weight return', 'Un retour d’épaule lent et puissant après la parade.', 'A slow, powerful shoulder check follows the parry.',
      { cost: 42, damage: 51, reach: 93, startup: .24, active: .13, recovery: .82, stun: .43, push: 69 }]),
  pair('drive-v123-creature-romulus-offspring', 'pose-v123-drive-creature-romulus-offspring',
    ['Arc déporté', 'Offset arc', 'Une frappe montante profite de la portée des bras, sans poursuite automatique.', 'A rising strike uses the long arms without homing in on its target.',
      { cost: 49, damage: 60, reach: 112, startup: .40, active: .16, recovery: .95, stun: .43, push: 56,
        contactBandV207: 'anti-air', hordeTargetsV209: 2 }],
    ['Revers de seuil', 'Threshold reverse', 'Un revers de grande portée avant un pas de recul.', 'A long backhand precedes a step back.',
      { cost: 39, damage: 47, reach: 101, startup: .22, active: .11, recovery: .77, stun: .35, push: 51, retreatV208: 99 }]),
]);

const byFighter = new Map(XENO_TRIALS_SUPER_KITS_V209.map(kit => [kit.first.fighterId, kit]));
function getKit(definition) {
  const kit = byFighter.get(definition?.id);
  return kit && kit.first.profileId === definition.profileId ? kit : null;
}

export const getXenoTrialsSuperV209 = definition => getKit(definition)?.first ?? null;
export const getXenoTrialsCounterV209 = definition => getKit(definition)?.counter ?? null;

// A V208 save for these identities predates their gauge. Admit only the
// absent legacy resource, then start earning from normal contact on resume.
export function hasLegacyXenoTrialsSuperMeterV209(fighter, definition) {
  return fighter.superMeterV148 === undefined && fighter.stats?.supersV148 === undefined
    && !['super', 'super-riposte'].includes(fighter.attack?.kind) && Boolean(getKit(definition));
}

export function validXenoTrialsPhysicalSuperV209(attack, fighter, match, move) {
  if (!move || attack.kind !== 'super') return true;
  const { spec } = move;
  if (attack.age <= 0 || attack.hit && attack.age < spec.startup || attack.facing !== fighter.facing
    || match.phase !== 'active' || fighter.hp <= 0 || fighter.stun > 0 || fighter.y !== 0 || fighter.guard
    || !(fighter.stats.supersV148 > 0) || attack.emitted
    || Object.keys(attack).some(key => !['kind', 'age', 'hit', 'emitted', 'facing', 'id', 'hitTargetsV180'].includes(key))) return false;
  if (match.hordeV180) {
    const targets = attack.hitTargetsV180;
    if (targets !== undefined && (!Array.isArray(targets) || !targets.length
      || targets.some(id => fighter.side === 'player' ? typeof id !== 'string' || !/^horde-[1-9]\d*$/.test(id) : id !== 'player'))) return false;
    if (attack.hit !== Boolean(targets?.length) || (targets?.length || 0) > spec.hordeTargetsV209)
      return false;
  } else if (attack.hitTargetsV180 !== undefined) return false;
  const ticks = Math.round(attack.age * 120);
  if (Math.abs(attack.age * 120 - ticks) > 1e-8 || !Array.isArray(match.events)) return false;
  const launched = match.events.find(event => event?.id === attack.id + 1);
  if (!launched) return Number.isInteger(match.events[0]?.id) && attack.id + 1 < match.events[0].id;
  return launched.type === 'attack' && launched.kind === 'super' && launched.superIdV148 === move.id
    && launched.side === fighter.side && launched.tick === match.tick - ticks + 1
    && (!match.hordeV180 || launched.attackerInstanceV180 === (fighter.instanceIdV180 ?? fighter.side));
}
