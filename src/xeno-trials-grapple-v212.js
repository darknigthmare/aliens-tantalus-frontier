export const XENO_TRIALS_GROUND_GRAB_KIND_V212 = 'ground-grab-v212';

// Exact admitted sprites with free forelimbs or a free arm. Arena holds
// maintain their current floor support and release without a throw or a rig swap.
const rows = [
  ['warrior', 'castes-film_warrior_aliens_1986', 'standing'],
  ['runner', 'castes-film_runner_alien3_1992', 'low'],
  ['arachnoid', 'castes-game_avp_capcom_arachnoid', 'low'],
  ['grid', 'castes-film_grid_avp_2004', 'standing'],
  ['defender', 'pose-v95-user-xeno-defender', 'low'],
  ['royal-guard', 'castes-game_avp_capcom_royal_guard', 'braced'],
  ['predalien', 'castes-game_predalien_avp2_primal_hunt', 'braced'],
  ['spitter', 'castes-game_acm_spitter', 'low'],
  ['albino-six', 'enemy-070-albino-specimen-six-line', 'standing'],
  ['user-warrior-red', 'pose-v95-user-xeno-warrior-red', 'low'],
  ['import-blue-drone', 'pose-v103-import-xeno-blueluminescent-drone', 'standing'],
  ['armored-red', 'enemy-123-armored-red-xenomorph', 'braced'],
  ['user-blue-violet-biped', 'pose-v95-user-bipede-bleu-violet', 'standing'],
  ['user-tiger-biped', 'pose-v95-user-bipede-tigre', 'standing'],
  ['user-orange-biped', 'pose-v95-user-bipede-brun-orange', 'standing'],
  ['user-green-dome', 'pose-v95-user-bipede-dome-verdoyant', 'standing'],
  ['import-game-dd-synthetic', 'pose-v106-import-game-dd-synthetic', 'standing'],
  ['synth-trooper', 'pose-v94-afe-synth-trooper', 'standing'],
  ['synth-sniper', 'pose-v94-afe-synth-sniper', 'standing'],
  ['armored-joe', 'enemy-145-armored-working-joe', 'braced'],
  ['cryo-joe', 'enemy-249-cryo-adapted-working-joe', 'standing'],
  ['acid-joe', 'enemy-197-acid-blooded-working-joe', 'standing'],
  ['albino-joe', 'enemy-093-albino-working-joe', 'standing'],
  ['import-joe-classic', 'pose-v103-import-synth-workingjoe-classic', 'standing'],
  ['import-joe-battle', 'pose-v103-import-synth-workingjoe-battle', 'braced'],
  ['import-joe-hazmat', 'pose-v103-import-synth-workingjoe-hazmat', 'standing'],
  ['import-joe-tactical', 'pose-v103-import-synth-workingjoe-tactical', 'braced'],
  ['import-synth-eloise', 'pose-v106-import-synth-eloise', 'standing'],
  ['import-wy-covenant-david', 'pose-v106-import-wy-covenant-david', 'standing'],
  ['dd-darwin-era-cultist', 'pose-v118-dd-darwin-era-cultist', 'standing'],
  ['import-wy-apesuit', 'pose-v106-import-wy-apesuit', 'braced'],
  ['drive-v123-game-working-joe-hazard', 'pose-v123-drive-game-working-joe-hazard', 'standing'],
  ['drive-v123-game-working-joe-standard', 'pose-v123-drive-game-working-joe-standard', 'standing'],
  ['drive-v123-game-combat-synthetic-avp2', 'pose-v123-drive-game-combat-synthetic-avp2', 'braced'],
];
const captives = new Map([
  ['import-game-dd-wy-commando', ['pose-v106-import-game-dd-wy-commando', 'biped-rise']],
  ['import-game-dd-guardian', ['pose-v106-import-game-dd-guardian', 'biped-rise']],
  ['dd-darwin-era-cultist', ['pose-v118-dd-darwin-era-cultist', 'biped-rise']],
  ['import-game-dd-synthetic', ['pose-v106-import-game-dd-synthetic', 'biped-rise']],
  ['import-joe-classic', ['pose-v103-import-synth-workingjoe-classic', 'biped-rise']],
  ['import-joe-battle', ['pose-v103-import-synth-workingjoe-battle', 'biped-rise']],
  ['import-joe-hazmat', ['pose-v103-import-synth-workingjoe-hazmat', 'biped-rise']],
  ['import-joe-tactical', ['pose-v103-import-synth-workingjoe-tactical', 'biped-rise']],
  ['armored-joe', ['enemy-145-armored-working-joe', 'biped-rise']],
  ['import-wy-covenant-david', ['pose-v106-import-wy-covenant-david', 'biped-rise']],
  ['import-synth-eloise', ['pose-v106-import-synth-eloise', 'biped-rise']],
  ['import-wy-apesuit', ['pose-v106-import-wy-apesuit', 'biped-rise']],
  ['synth-trooper', ['pose-v94-afe-synth-trooper', 'biped-rise']],
  ['synth-sniper', ['pose-v94-afe-synth-sniper', 'biped-rise']],
  ['warrior', ['castes-film_warrior_aliens_1986', 'biped-xeno']],
  ['grid', ['castes-film_grid_avp_2004', 'biped-xeno']],
  ['import-blue-drone', ['pose-v103-import-xeno-blueluminescent-drone', 'biped-xeno']],
]);
// These upright pairings fail the measured torso-height ratio at floor contact.
// Native contact checks still use the live geometry before starting any hold.
const incompatibleScale = new Map([
  ['royal-guard', ['synth-trooper', 'synth-sniper']],
  ['predalien', ['synth-trooper', 'synth-sniper']],
  ['albino-six', ['synth-trooper', 'synth-sniper']],
  ['import-blue-drone', ['synth-trooper', 'synth-sniper']],
  ['armored-red', ['synth-trooper', 'synth-sniper']],
  ['synth-sniper', ['import-blue-drone', 'import-wy-apesuit']],
  ['import-wy-apesuit', ['synth-trooper', 'synth-sniper']],
  ['drive-v123-game-combat-synthetic-avp2', ['synth-sniper']],
]);

// Ordered V220 pairs certified on the admitted upright synthetics. The guard
// is shorter than the other initiators and has different supported targets.
const combatSynths = ['combat-synth', 'acid-combat-synth', 'cryo-combat-synth', 'albino-combat-synth'];
const armoredCaptives = ['armored-joe', 'import-joe-battle', 'import-game-dd-wy-commando'];
const addedPairs = new Map([
  ['synth-guard', ['synth-guard', 'synth-trooper', 'synth-sniper', 'combat-synth', 'armored-joe', 'import-joe-classic']],
  ['combat-synth', ['synth-guard', 'synth-trooper', ...combatSynths.slice(1), ...armoredCaptives]],
  ['synth-enforcer', [...combatSynths, ...armoredCaptives]],
  ...combatSynths.slice(1).map(id => [id, [...combatSynths.filter(other => other !== id), 'synth-enforcer', ...armoredCaptives]])
]);
const addedProfiles = [
  ['synth-guard', 'pose-v94-afe-synth-guard', 'standing'],
  ['synth-enforcer', 'pose-v111-afe-synth-enforcer', 'braced'],
  ['combat-synth', 'enemy-146-armored-combat-synthetic', 'braced'],
  ['acid-combat-synth', 'enemy-198-acid-blooded-combat-synthetic', 'braced'],
  ['cryo-combat-synth', 'enemy-250-cryo-adapted-combat-synthetic', 'braced'],
  ['albino-combat-synth', 'enemy-094-albino-combat-synthetic', 'braced']
];
const addedProfileById = new Map(addedProfiles.map(([id, profileId]) => [id, profileId]));

const types = {
  standing: {
    label: 'Prise au corps', labelEn: 'Body hold',
    sourceBand: [.35, .83], targetBand: [.34, .83], minRatio: .60, maxRatio: 1.75,
    startup: .24, cost: 22, durationTicks: 132, escapeTicks: 52, firstDamageTick: 44, damageIntervalTicks: 42, damage: 4,
  },
  low: {
    label: 'Accrochage bas', labelEn: 'Low hold',
    sourceBand: [.14, .89], targetBand: [.12, .42], minRatio: .57, maxRatio: 3.22,
    startup: .21, cost: 21, durationTicks: 114, escapeTicks: 45, firstDamageTick: 49, damageIntervalTicks: 38, damage: 4,
  },
  braced: {
    label: 'Prise sur appuis', labelEn: 'Planted hold',
    sourceBand: [.28, .78], targetBand: [.27, .78], minRatio: .63, maxRatio: 1.54,
    startup: .29, cost: 26, durationTicks: 140, escapeTicks: 59, firstDamageTick: 50, damageIntervalTicks: 41, damage: 5,
  }
};

function groundGrab([fighterId, profileId, type]) {
  const { label, labelEn, sourceBand, targetBand, minRatio, maxRatio, startup, cost, durationTicks, escapeTicks,
    firstDamageTick, damageIntervalTicks, damage } = types[type];
  const contactGap = 8;
  return Object.freeze({
    id: fighterId + '::grab', fighterId, profileId, type, label, labelEn, canonExact: false, animation: 'existing-static-pose',
    description: 'Saisir une cible debout au contact. La garde de face ou une frappe rapide peut interrompre la prise. Maintenir Garde pour se dégager.',
    descriptionEn: 'Hold a standing target at contact range. Front guard or a quick strike can stop the hold. Hold Guard to escape.',
    sourceBand: Object.freeze(sourceBand), targetBand: Object.freeze(targetBand), minRatio, maxRatio,
    contactGap, releaseGap: 12, durationTicks, escapeTicks, firstDamageTick, damageIntervalTicks, damage, recovery: .24,
    spec: Object.freeze({ groundedOnly: true, startup, cost, damage: damage + 2, reach: contactGap,
      active: .10, recovery: .46, stun: .12, push: 0, cooldown: 1.25 }),
  });
}
export const XENO_TRIALS_GROUND_GRABS_V212 = Object.freeze(rows.map(groundGrab));
const byId = new Map([...XENO_TRIALS_GROUND_GRABS_V212, ...addedProfiles.map(groundGrab)].map(grab => [grab.fighterId, grab]));

export function getXenoTrialsGroundGrabV212(definition) {
  const grab = byId.get(definition?.id);
  return grab && grab.profileId === definition.profileId ? grab : null;
}

export function getXenoTrialsGroundGrabPairV212(initiator, receiver) {
  const grab = getXenoTrialsGroundGrabV212(initiator), captive = captives.get(receiver?.id);
  const addedTargets = addedPairs.get(grab?.fighterId);
  if (addedTargets) {
    const receiverProfile = captive?.[0] ?? addedProfileById.get(receiver?.id);
    return receiverProfile && receiverProfile === receiver.profileId && addedTargets.includes(receiver.id) ? grab : null;
  }
  return grab && captive && captive[0] === receiver.profileId && (grab.type !== 'low' || captive[1] === 'biped-rise')
    && !incompatibleScale.get(grab.fighterId)?.includes(receiver.id) ? grab : null;
}

export function hasXenoTrialsGroundGrabContactV212(grab, a, b, facing, maxGap = grab.contactGap) {
  if (![a.center, a.left, a.right, a.bottom, a.height, b.center, b.left, b.right, b.bottom, b.height].every(Number.isFinite)
    || ![-1, 1].includes(facing) || a.bottom !== 0 || b.bottom !== 0 || a.height <= 0 || b.height <= 0
    || b.height / a.height < grab.minRatio || b.height / a.height > grab.maxRatio
    || (b.center - a.center) * facing <= 0) return false;
  const gap = facing > 0 ? b.left - a.right : a.left - b.right;
  return gap >= -maxGap && gap <= maxGap
    && grab.sourceBand[0] * a.height <= grab.targetBand[1] * b.height
    && grab.targetBand[0] * b.height <= grab.sourceBand[1] * a.height;
}
