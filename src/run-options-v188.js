// V188 — new-game choices and run options (bible §2.4, §55.4-55.6; values
// §56.4 [PROPOSÉ]): Echo-9 origin, optional crew permadeath, custom difficulty.
// Pure helpers; save.js calls them so every rule stays in one place.

const o = (id, fr, en, abilityFr, abilityEn, value = null) => Object.freeze({ id, label: Object.freeze({ fr, en }),
  ability: Object.freeze({ fr: abilityFr, en: abilityEn }), value });

export const ORIGINS_V188 = Object.freeze([
  o('origin-01', 'Survivant d’une section anéantie', 'Survivor of a wiped-out section', 'Sang-froid : −15 % de dispersion en alerte', 'Composure: −15% spread during an alert', { alertSpread: -.15 }),
  o('origin-02', 'Ancien garde de colonie', 'Former colony guard', 'Calmer les civils : panique −25 %', 'Calm civilians: panic −25%', { civilianPanic: -.25 }),
  o('origin-03', 'Adjoint des Marshals coloniaux', 'Colonial Marshals deputy', 'Procès-verbal : +1 indice par mission', 'Report: +1 clue per mission', { clues: 1 }),
  o('origin-04', 'Docker de frontière', 'Frontier docker', 'Cariste : chargeur +10 %', 'Loader operator: power loader +10%', { loaderSpeed: .1 }),
  o('origin-05', 'Technicien de terraformation', 'Terraforming technician', 'Processeur : réparation atmosphérique +20 %', 'Processor: atmospheric repair +20%', { atmosphericRepair: .2 }),
  o('origin-06', 'Enfant d’une colonie évacuée', 'Child of an evacuated colony', 'Réflexe d’abri : abris et sas sûrs signalés', 'Shelter reflex: safe shelters marked', { shelters: true }),
  o('origin-07', 'Mineur sous contrat endetté', 'Indebted contract miner', 'Galeries : +15 % en conduit', 'Tunnels: +15% in ducts', { ductSpeed: .15 }),
  o('origin-08', 'Infirmier de vaisseau-hôpital', 'Hospital-ship nurse', 'Triage : soin d’un équipier +20 %', 'Triage: teammate healing +20%', { allyHealing: .2 }),
  o('origin-09', 'Pilote de navette suspendu', 'Suspended shuttle pilot', 'Approche : extraction +10 s', 'Approach: extraction +10 s', { extractionSeconds: 10 }),
  o('origin-10', 'Ancien agent de sécurité de la compagnie', 'Former company security officer', 'Codes périmés : une porte de la compagnie par mission', 'Expired codes: one company door per mission', { companyDoors: 1 }),
  o('origin-11', 'Transfuge de l’UPP', 'UPP defector', 'Matériel de l’Union : armes UPP sans pénalité', 'Union gear: UPP weapons without penalty', { uppGear: true }),
  o('origin-12', 'Récupérateur de frontière', 'Frontier salvager', 'Fouille : matériaux +10 %', 'Scavenging: materials +10%', { salvage: .1 }),
  o('origin-13', 'Opérateur de relais', 'Relay operator', 'Triangulation : faux échos identifiés', 'Triangulation: false echoes identified', { falseEchoIdentified: true }),
  o('origin-14', 'Condamnation commuée en engagement', 'Sentence commuted to enlistment', 'Débrouille : casiers sans outil', 'Resourceful: lockers without tools', { lockers: true }),
  o('origin-15', 'Mécanicien de blindés', 'Armoured vehicle mechanic', 'Atelier : réparation M577 et tourelles +20 %', 'Workshop: M577 and turret repair +20%', { vehicleRepair: .2 }),
  o('origin-16', 'Biologiste de terrain', 'Field biologist', 'Échantillons : un prélèvement sans contamination', 'Samples: one contamination-free sample', { cleanSample: 1 }),
  o('origin-17', 'Enfant de Marines', 'Child of Marines', 'Discipline : ordres +15 % plus rapides', 'Discipline: orders 15% faster', { orderSpeed: .15 }),
  o('origin-18', 'Garde de convoi', 'Convoy guard', 'Formation de convoi : véhicule escorté −10 % de dégâts', 'Convoy formation: escorted vehicle −10% damage', { vehicleDamage: -.1 }),
  o('origin-19', 'Survivant d’un abordage', 'Boarding survivor', 'Combat rapproché : +10 % en couloir étroit', 'Close quarters: +10% in narrow corridors', { corridorDamage: .1 }),
  o('origin-20', 'Dossier caviardé', 'Redacted file', 'Aucune capacité ; fil secondaire propre', 'No ability; own side thread')
]);
export const DEFAULT_ORIGIN_V188 = 'origin-20';
// Abilities connected to a runtime hook (run-options-runtime-v188.js and the
// tension director). origin-03 and origin-16 need content the bible does not
// define yet (extra clue texts, a sample system); origin-11 has no penalty to
// remove because the game has no UPP weapon penalty; origin-20 has no ability.
export const CONNECTED_ORIGIN_ABILITIES_V188 = Object.freeze(['origin-01', 'origin-02', 'origin-04', 'origin-05', 'origin-06',
  'origin-07', 'origin-08', 'origin-09', 'origin-10', 'origin-12', 'origin-13', 'origin-14', 'origin-15', 'origin-17', 'origin-18', 'origin-19']);

export function normalizeOriginV188(value) {
  return ORIGINS_V188.some(origin => origin.id === value) ? value : DEFAULT_ORIGIN_V188;
}
export function originV188(id) { return ORIGINS_V188.find(origin => origin.id === normalizeOriginV188(id)); }

// —— Optional crew permadeath (§55.5) ——
export const GRAVE_WOUND_CONVALESCENCE_DAYS_V188 = 3;

export function crewPermadeathEnabledV188(save) { return save?.settings?.crewPermadeathV188 !== false; }

/** Existing parties keep permadeath; it can be switched off, never back on. */
export function normalizeCrewPermadeathV188(previous, requested) {
  const before = previous !== false;
  return before ? requested !== false : false;
}

/** With permadeath off, a member at 0 HP survives with a grave wound.
 * Returns true when the member was spared (caller skips the memorial). */
export function spareCrewMemberV188(save, member, { operationId = null } = {}) {
  if (!member || crewPermadeathEnabledV188(save)) return false;
  member.health = Math.max(1, Number(member.health) || 0);
  member.status = 'injured';
  member.injuries = Array.isArray(member.injuries) ? member.injuries : [];
  const day = Number(save?.clock?.day) || 1;
  member.injuries.push({ type: 'grave-wound', day, severity: 100, operationId,
    convalescenceUntilDay: day + GRAVE_WOUND_CONVALESCENCE_DAYS_V188 });
  member.injuries = member.injuries.slice(-64);
  return true;
}

// —— Custom difficulty (§55.4) ——
export const CUSTOM_DIFFICULTY_BOUNDS_V188 = Object.freeze({
  enemyHealth: [.5, 2], enemyDamage: [.5, 2], enemySpeed: [.8, 1.25], spawnMultiplier: [.5, 2],
  ammoFound: [.5, 2], alertFrequency: [.5, 2]
});
export const DEFAULT_CUSTOM_DIFFICULTY_V188 = Object.freeze({ enemyHealth: 1, enemyDamage: 1, enemySpeed: 1,
  spawnMultiplier: 1, ammoFound: 1, alertFrequency: 1 });

/** Out-of-bounds or non-numeric values fall back to standard (1). */
export function normalizeCustomDifficultyV188(raw) {
  const result = {};
  for (const [key, [low, high]] of Object.entries(CUSTOM_DIFFICULTY_BOUNDS_V188)) {
    const value = Number(raw?.[key]);
    result[key] = Number.isFinite(value) && value >= low && value <= high ? Math.round(value * 100) / 100 : 1;
  }
  return Object.freeze(result);
}

/** Reward follows the challenge; it is never chosen freely. */
export function customRewardMultiplierV188(custom) {
  const c = normalizeCustomDifficultyV188(custom);
  const challenge = (c.enemyHealth * c.enemyDamage * c.enemySpeed * c.spawnMultiplier * c.alertFrequency) / c.ammoFound;
  return Math.round(Math.max(.7, Math.min(1.5, Math.pow(challenge, .35))) * 100) / 100;
}

export function buildCustomDifficultyV188(custom) {
  const c = normalizeCustomDifficultyV188(custom);
  return Object.freeze({ id: 'custom', enemyHealth: c.enemyHealth, enemyDamage: c.enemyDamage, enemySpeed: c.enemySpeed,
    spawnMultiplier: c.spawnMultiplier, rewardMultiplier: customRewardMultiplierV188(c), ammoFound: c.ammoFound,
    alertFrequency: c.alertFrequency });
}

// The active custom tuning of the running mission (one mission engine at a time).
let activeCustomDifficultyV188 = buildCustomDifficultyV188(DEFAULT_CUSTOM_DIFFICULTY_V188);
export function setActiveCustomDifficultyV188(custom) { activeCustomDifficultyV188 = buildCustomDifficultyV188(custom); return activeCustomDifficultyV188; }
export function activeCustomDifficultyV188Value() { return activeCustomDifficultyV188; }
