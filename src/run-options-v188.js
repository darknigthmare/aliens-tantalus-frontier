// V188 — new-game choices and run options (bible §2.4, §55.4-55.6; values
// §56.4 [PROPOSÉ]): Echo-9 origin, optional crew permadeath, custom difficulty.
// Pure helpers; save.js calls them so every rule stays in one place.

const o = (id, fr, en, abilityFr, abilityEn, value = null) => Object.freeze({ id, label: Object.freeze({ fr, en }),
  ability: Object.freeze({ fr: abilityFr, en: abilityEn }), value });

export const ORIGINS_V188 = Object.freeze([
  o('origin-01', 'Survivant d’une section anéantie', 'Survivor of a wiped-out section', 'Sang-froid : −15 % de dispersion en alerte', 'Composure: −15% spread during an alert', { alertSpread: -.15 }),
  o('origin-02', 'Ancien garde de colonie', 'Former colony guard', 'Calmer les civils : panique −25 %', 'Calm civilians: panic −25%', { civilianPanic: -.25 }),
  o('origin-03', 'Adjoint des Marshals coloniaux', 'Colonial Marshals deputy', 'Procès-verbal : la première pièce lue recoupe les autres', 'Report: the first piece read cross-checks the others', { clues: 1 }),
  o('origin-04', 'Docker de frontière', 'Frontier docker', 'Cariste : chargeur +10 %', 'Loader operator: power loader +10%', { loaderSpeed: .1 }),
  o('origin-05', 'Technicien de terraformation', 'Terraforming technician', 'Processeur : réparation atmosphérique +20 %', 'Processor: atmospheric repair +20%', { atmosphericRepair: .2 }),
  o('origin-06', 'Enfant d’une colonie évacuée', 'Child of an evacuated colony', 'Réflexe d’abri : abris et sas sûrs signalés', 'Shelter reflex: safe shelters marked', { shelters: true }),
  o('origin-07', 'Mineur sous contrat endetté', 'Indebted contract miner', 'Galeries : +15 % en conduit', 'Tunnels: +15% in ducts', { ductSpeed: .15 }),
  o('origin-08', 'Infirmier de vaisseau-hôpital', 'Hospital-ship nurse', 'Triage : soin d’un équipier +20 %', 'Triage: teammate healing +20%', { allyHealing: .2 }),
  o('origin-09', 'Pilote de navette suspendu', 'Suspended shuttle pilot', 'Approche : extraction +10 s', 'Approach: extraction +10 s', { extractionSeconds: 10 }),
  o('origin-10', 'Ancien agent de sécurité de la compagnie', 'Former company security officer', 'Codes périmés : une porte de la compagnie par mission', 'Expired codes: one company door per mission', { companyDoors: 1 }),
  o('origin-11', 'Transfuge de l’UPP', 'UPP defector', 'Matériel de l’Union : +10 % de dégâts avec les armes UPP', 'Union gear: +10% damage with UPP weapons', { uppDamage: .1 }),
  o('origin-12', 'Récupérateur de frontière', 'Frontier salvager', 'Fouille : matériaux +10 %', 'Scavenging: materials +10%', { salvage: .1 }),
  o('origin-13', 'Opérateur de relais', 'Relay operator', 'Triangulation : faux échos identifiés', 'Triangulation: false echoes identified', { falseEchoIdentified: true }),
  o('origin-14', 'Condamnation commuée en engagement', 'Sentence commuted to enlistment', 'Débrouille : casiers sans outil', 'Resourceful: lockers without tools', { lockers: true }),
  o('origin-15', 'Mécanicien de blindés', 'Armoured vehicle mechanic', 'Atelier : réparation M577 et tourelles +20 %', 'Workshop: M577 and turret repair +20%', { vehicleRepair: .2 }),
  o('origin-16', 'Biologiste de terrain', 'Field biologist', 'Échantillons : +1 échantillon biologique par mission réussie', 'Samples: +1 biological sample per successful mission', { cleanSample: 1 }),
  o('origin-17', 'Enfant de Marines', 'Child of Marines', 'Discipline : ordres +15 % plus rapides', 'Discipline: orders 15% faster', { orderSpeed: .15 }),
  o('origin-18', 'Garde de convoi', 'Convoy guard', 'Formation de convoi : véhicule escorté −10 % de dégâts', 'Convoy formation: escorted vehicle −10% damage', { vehicleDamage: -.1 }),
  o('origin-19', 'Survivant d’un abordage', 'Boarding survivor', 'Combat rapproché : +10 % en couloir étroit', 'Close quarters: +10% in narrow corridors', { corridorDamage: .1 }),
  o('origin-20', 'Dossier caviardé', 'Redacted file', 'Aucune capacité ; fil secondaire propre', 'No ability; own side thread')
]);
export const DEFAULT_ORIGIN_V188 = 'origin-20';
// Every ability (origin-01 to origin-19) is connected; origin-20 has none.
// 03, 11 and 16 follow the owner-requested proposals of bible §56.6 [PROPOSÉ].
export const CONNECTED_ORIGIN_ABILITIES_V188 = Object.freeze(Array.from({ length: 19 }, (_, i) => `origin-${String(i + 1).padStart(2, '0')}`));

// origin-03 Procès-verbal [PROPOSÉ]: each clue only cross-references facts that
// other pieces of the same file already state (bible §5.2, archive-relay-state-v122).
export const ORIGIN_CLUES_V188 = Object.freeze({
  'pda-custody': Object.freeze({ fr: 'Procès-verbal : le badge n’ouvre que les postes locaux ; la commande de 18:43 a donc été passée au poste fret lui-même.',
    en: 'Report: the badge only opens local posts, so the 18:43 command was entered at the freight post itself.' }),
  'engineering-clock': Object.freeze({ fr: 'Procès-verbal : avec moins d’une seconde d’écart, les heures 18:41, 18:42 et 18:54 des autres pièces se comparent directement.',
    en: 'Report: with less than a second of drift, the 18:41, 18:42 and 18:54 times of the other pieces compare directly.' }),
  'engineering-power': Object.freeze({ fr: 'Procès-verbal : la priorité change à 18:42, une minute avant l’usage du badge de Voss au poste fret.',
    en: 'Report: priority changes at 18:42, one minute before Voss’s badge is used at the freight post.' }),
  'security-access': Object.freeze({ fr: 'Procès-verbal : Voss est sorti par l’escalier nord à 18:39 ; quatre minutes plus tard, seul son badge est prouvé, pas sa présence.',
    en: 'Report: Voss left by the north stairs at 18:39; four minutes later only his badge is proven, not his presence.' }),
  'freight-manifest': Object.freeze({ fr: 'Procès-verbal : le courriel invoque un incident technique, alors que la télémétrie de 18:42 n’enregistre aucun défaut.',
    en: 'Report: the email cites a technical incident, yet the 18:42 telemetry records no fault.' }),
  'freight-draft': Object.freeze({ fr: 'Procès-verbal : le message de secours est resté treize minutes en attente, de 18:41 à 18:54.',
    en: 'Report: the distress message waited thirteen minutes in the queue, from 18:41 to 18:54.' }),
  'colony-custody-ticket-v132': Object.freeze({ fr: 'Procès-verbal : la référence QZ17-04 appartient à la série de scellés QZ17 du fret prioritaire.',
    en: 'Report: reference QZ17-04 belongs to the QZ17 seal series of the priority freight.' }),
  'colony-sterilization-report-v132': Object.freeze({ fr: 'Procès-verbal : le rapport est clos avant l’examen extérieur du résidu ; sa conclusion précède sa propre analyse.',
    en: 'Report: the report was closed before the outer residue exam; its conclusion precedes its own analysis.' }),
  'cargo-service-queue-v132': Object.freeze({ fr: 'Procès-verbal : le numéro de caisse du registre contredit le courriel du quai ; une des deux pièces a été réécrite.',
    en: 'Report: the crate number in the register contradicts the dock email; one of the two pieces was rewritten.' }),
  'field-custody-marker-v132': Object.freeze({ fr: 'Procès-verbal : la balise relie le prélèvement à la quarantaine, mais la rupture de garde survient avant le transfert.',
    en: 'Report: the beacon ties the sample to quarantine, but custody breaks before the transfer.' })
});

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
