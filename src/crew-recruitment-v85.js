// Original project recruitment dossiers and persistent career contracts.
// Causal starting dossiers are immutable; training, service and current gear live on
// the hired member. All prices, item tuning and pool timing below are V85 design.
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};
const clone = value => structuredClone(value);
const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const bounded = (value, fallback, min, max) => typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
const integer = (value, fallback, min, max) => Math.floor(bounded(value, fallback, min, max));
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
const hash = text => {
  let result = 2166136261;
  for (let index = 0; index < text.length; index += 1) { result ^= text.charCodeAt(index); result = Math.imul(result, 16777619); }
  return result >>> 0;
};
const seedOf = value => typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) >>> 0
  : typeof value === 'string' && value.length <= 256 ? hash(value) : 85001;

export const APTITUDE_DEFINITIONS_V85 = freeze([
  { id: 'tir', label: 'Tir' }, { id: 'physique', label: 'Physique' },
  { id: 'mobilite', label: 'Mobilité' }, { id: 'sangFroid', label: 'Sang-froid' },
  { id: 'technique', label: 'Technique' }, { id: 'secourisme', label: 'Secourisme' },
  { id: 'perception', label: 'Perception' }, { id: 'cohesion', label: 'Cohésion' }
]);
export const RECRUITMENT_POOL_SIZE_V85 = 4;
export const RECRUITMENT_REFRESH_HOURS_V85 = 24;
export const RECRUITMENT_COST_V85 = 600;
export const RECRUIT_STAT_BUDGET_V85 = 400;
export const RECRUIT_GEAR_BUDGET_V85 = 600;
export const RECRUIT_VISUAL_PROFILE_V85 = 'echo9-standard-v85';
const MAX_SERIAL = 999999;
const MAX_RECENT = 32;
const ART_STATUS = 'shared-standard-uniform-no-individual-portrait';
const CANON_STATUS = 'project-fiction-not-franchise-canon';
const STAT_IDS = APTITUDE_DEFINITIONS_V85.map(({ id }) => id);

// Never use the legacy EQUIPMENT.utility modulo recipe for these functional kits.
// One loaded magazine and three reserve magazines are the explicit V85 issue policy.
export const RECRUIT_GEAR_CATALOG_V85 = freeze([
  { catalogId: 'weapon-001-m41a-pulse-rifle', kind: 'weapon', mass: 3.9, value: 240, function: 'weapon', charges: 0, reserveMagazines: 3 },
  { catalogId: 'weapon-003-m4a3-service-pistol', kind: 'weapon', mass: 1.4, value: 90, function: 'weapon', charges: 0, reserveMagazines: 3 },
  { catalogId: 'weapon-007-m37a2-pump-shotgun', kind: 'weapon', mass: 4.2, value: 210, function: 'weapon', charges: 0, reserveMagazines: 3 },
  { catalogId: 'equipment-004-cutting-torch', kind: 'equipment', mass: 2.5, value: 75, function: 'repair', charges: 2 },
  { catalogId: 'equipment-013-welding-kit', kind: 'equipment', mass: 3, value: 85, function: 'repair', charges: 3 },
  { catalogId: 'equipment-006-medkit', kind: 'equipment', mass: 1.2, value: 70, function: 'medical', charges: 2 },
  { catalogId: 'equipment-007-trauma-kit', kind: 'equipment', mass: 2.2, value: 115, function: 'medical', charges: 3 },
  { catalogId: 'equipment-001-motion-tracker', kind: 'equipment', mass: 1.1, value: 95, function: 'scan', charges: 3 },
  { catalogId: 'equipment-030-colony-beacon', kind: 'equipment', mass: 1.8, value: 80, function: 'scan', charges: 2 },
  { catalogId: 'equipment-009-m3-personnel-armor', kind: 'equipment', mass: 4.6, value: 140, function: 'armor', charges: 0, armor: 20 },
  { catalogId: 'equipment-021-ammo-satchel', kind: 'equipment', mass: 2.4, value: 70, function: 'ammo', charges: 3, ammunitionWeaponId: 'weapon-007-m37a2-pump-shotgun', reserveMagazines: 3 }
]);
const GEAR_BY_ID = new Map(RECRUIT_GEAR_CATALOG_V85.map(item => [item.catalogId, item]));
const KITS = freeze({
  maintenance: ['weapon-001-m41a-pulse-rifle', 'equipment-004-cutting-torch', 'equipment-013-welding-kit'],
  evacuation: ['weapon-003-m4a3-service-pistol', 'equipment-006-medkit', 'equipment-007-trauma-kit'],
  security: ['weapon-007-m37a2-pump-shotgun', 'equipment-009-m3-personnel-armor', 'equipment-021-ammo-satchel'],
  reconnaissance: ['weapon-001-m41a-pulse-rifle', 'equipment-001-motion-tracker', 'equipment-030-colony-beacon']
});

// Vectors are experience/training allocations, not race/name/origin modifiers.
// Each allocation sums to zero: starting trade-offs always retain the same 400 budget.
const ACTIVITIES = freeze([
  { id: 'orbital-maintenance', label: 'Maintenance de fermetures de chantier orbital', kit: 'maintenance',
    experience: { technique: 16, physique: 8, mobilite: -8, secourisme: -16 },
    assignment: 'Entretien et protection des accès industriels', event: 'A maintenu une cloison de secours pendant une décompression, avant son affectation au Tantalus.',
    habit: 'Contrôle les fixations avant chaque intervention.', object: 'Ancien outil de diagnostic marqué par son chantier' },
  { id: 'medical-evacuation', label: 'Évacuation médicale en colonie isolée', kit: 'evacuation',
    experience: { secourisme: 14, sangFroid: 6, tir: -10, physique: -10 },
    assignment: 'Protection d’équipes de secours et évacuations', event: 'A stabilisé des blessés avec des réserves limitées, avant son affectation au Tantalus.',
    habit: 'Repère les voies d’extraction avant de commencer.', object: 'Écusson de son ancienne équipe de secours' },
  { id: 'shipboard-security', label: 'Sécurité embarquée sur cargos', kit: 'security',
    experience: { tir: 12, physique: 10, mobilite: -10, technique: -12 },
    assignment: 'Défense de passages et escorte de cargos', event: 'A tenu un accès lors d’une évacuation de cargo, avant son affectation au Tantalus.',
    habit: 'Vérifie les angles morts des portes.', object: 'Ancien insigne de sécurité embarquée' },
  { id: 'convoy-scout', label: 'Reconnaissance d’itinéraires de convois', kit: 'reconnaissance',
    experience: { perception: 14, mobilite: 8, physique: -10, cohesion: -12 },
    assignment: 'Reconnaissance de routes et guidage de convois', event: 'A guidé plusieurs véhicules après une panne des communications, avant son affectation au Tantalus.',
    habit: 'Mémorise une sortie avant d’entrer.', object: 'Carnet de repères manuels de convoi' },
  { id: 'precision-instruments', label: 'Maintenance d’instruments de précision', kit: 'maintenance',
    experience: { technique: 12, perception: 10, physique: -12, tir: -10 },
    assignment: 'Contrôle des dispositifs et relais de terrain', event: 'A retrouvé un défaut de calibration sans interrompre le service, avant son affectation au Tantalus.',
    habit: 'Compare les relevés avant de remplacer une pièce.', object: 'Loupe de son ancien atelier' },
  { id: 'industrial-rescue', label: 'Secours industriel en équipes coordonnées', kit: 'evacuation',
    experience: { secourisme: 10, cohesion: 12, technique: -10, perception: -12 },
    assignment: 'Assistance aux équipes d’intervention', event: 'A organisé une évacuation d’atelier avec ses collègues, avant son affectation au Tantalus.',
    habit: 'Confirme à voix haute qui couvre chaque trajet.', object: 'Photographie de son ancienne équipe' },
  { id: 'cargo-escort', label: 'Escorte de transports sur longue durée', kit: 'security',
    experience: { tir: 10, sangFroid: 12, mobilite: -12, secourisme: -10 },
    assignment: 'Protection de transports et veille de sécurité', event: 'A mené une relève méthodique pendant une longue alerte, avant son affectation au Tantalus.',
    habit: 'Prépare sa relève avant la fin du quart.', object: 'Jeton du premier cargo escorté' },
  { id: 'field-survey', label: 'Observation de terrain pour équipes d’exploration', kit: 'reconnaissance',
    experience: { perception: 12, mobilite: 10, tir: -12, physique: -10 },
    assignment: 'Observation et balisage des itinéraires', event: 'A signalé un trajet instable assez tôt pour modifier la route, avant son affectation au Tantalus.',
    habit: 'Note ses observations avant de les interpréter.', object: 'Carnet de relevés de terrain' }
]);
const FORMATIONS = freeze([
  { id: 'emergency-engineering', label: 'Interventions techniques d’urgence', modifiers: { technique: 8, physique: 4, mobilite: -4, secourisme: -8 } },
  { id: 'field-stabilization', label: 'Stabilisation sous pression', modifiers: { secourisme: 8, sangFroid: 4, tir: -6, physique: -6 } },
  { id: 'defensive-fire', label: 'Maintien d’une ligne de tir défensive', modifiers: { tir: 8, physique: 6, mobilite: -6, technique: -8 } },
  { id: 'route-reconnaissance', label: 'Reconnaissance mobile d’itinéraire', modifiers: { perception: 8, mobilite: 6, physique: -6, cohesion: -8 } },
  { id: 'coordinated-assistance', label: 'Assistance et coordination en binôme', modifiers: { cohesion: 8, secourisme: 4, tir: -6, technique: -6 } },
  { id: 'controlled-observation', label: 'Observation et contrôle sous pression', modifiers: { sangFroid: 8, perception: 4, physique: -6, mobilite: -6 } },
  { id: 'mobile-cover', label: 'Déplacement sous couverture mutuelle', modifiers: { mobilite: 8, cohesion: 4, technique: -6, secourisme: -6 } },
  { id: 'field-maintenance', label: 'Entretien du matériel de terrain', modifiers: { technique: 8, perception: 4, tir: -6, cohesion: -6 } }
]);
const ORIGINS = freeze(['Colonie industrielle', 'Station orbitale', 'Monde agricole', 'Famille itinérante de transporteurs', 'Colonie portuaire', 'Habitat de transit']);
const MOTIVATIONS = freeze(['Protéger les équipes civiles', 'Progresser dans une carrière de terrain', 'Assurer un revenu stable à ses proches', 'Découvrir la frontière avec une équipe fiable', 'Mettre son expérience au service des colonies', 'Obtenir des responsabilités nouvelles']);
const ATTACHMENTS = freeze(['Garde le contact avec son ancien mentor.', 'Écrit régulièrement à ses proches.', 'Suit les nouvelles de son ancienne équipe.', 'Conserve un lien avec sa communauté de départ.']);
const FIRST_NAMES = freeze(['Alix', 'Morgan', 'Samira', 'Elias', 'Camille', 'Nolan', 'Sofia', 'Ari', 'Mina', 'Theo', 'Lina', 'Dorian', 'Jo', 'Nora', 'Ilan', 'Alex']);
const LAST_NAMES = freeze(['Marin', 'Shaw', 'Keane', 'Moreau', 'Sato', 'Silva', 'Reyes', 'Okeke', 'Tran', 'Novak', 'Mercier', 'Navarro', 'Cho', 'Diallo', 'Chen', 'Ames']);
const CALLSIGNS = freeze(['ANCHOR', 'BEACON', 'KITE', 'LATCH', 'EMBER', 'VECTOR', 'PATCH', 'RANGE', 'RELAY', 'NORTH', 'BRACE', 'SIGNAL']);
const SOURCE_EXAMPLES = freeze([
  { name: 'Mara Voss', callsign: 'RIVET', activity: 0, formation: 0, origin: 'Chantier orbital', motivation: 'Travailler sur le terrain plutôt que réparer après coup les conséquences des décisions.', quote: 'Les portes ne sont fiables que jusqu’au moment où quelqu’un décide d’économiser sur leur entretien.' },
  { name: 'Nadia Bensaïd', callsign: 'SUTURE', activity: 1, formation: 1, origin: 'Colonie isolée', motivation: 'Préparer les évacuations et ne pas laisser les blessés sans extraction.', quote: '' },
  { name: 'Jonas Reed', callsign: 'BASTION', activity: 2, formation: 2, origin: 'Réseau de cargos', motivation: 'Quitter la routine de la sécurité embarquée pour une nouvelle affectation.', quote: '' },
  { name: 'Jun Seo', callsign: 'BALISE', activity: 3, formation: 3, origin: 'Itinéraires de convois terrestres', motivation: 'Mettre ses connaissances des itinéraires au service d’une équipe plus large.', quote: '' }
]);

function generateProfile(seed, serial) {
  const sourceExample = serial <= 4 ? SOURCE_EXAMPLES[serial - 1] : null;
  const sequence = Math.max(0, serial - 5);
  const activityIndex = sourceExample ? sourceExample.activity : (sequence + seed % 8) % ACTIVITIES.length;
  const formationIndex = sourceExample ? sourceExample.formation : (Math.floor(sequence / 8) + Math.floor(seed / 8) % 8) % FORMATIONS.length;
  const activity = ACTIVITIES[activityIndex];
  const formation = FORMATIONS[formationIndex];
  const identitySalt = hash(`${seed}:${serial}:identity`);
  const narrativeSalt = hash(`${seed}:${serial}:narrative`);
  const id = `recruit-v85-${seed.toString(16).padStart(8, '0')}-${String(serial).padStart(6, '0')}`;
  const aptitudes = {};
  const breakdown = {};
  for (const { id: statId } of APTITUDE_DEFINITIONS_V85) {
    const experience = activity.experience[statId] || 0;
    const training = formation.modifiers[statId] || 0;
    const total = 50 + experience + training;
    aptitudes[statId] = total;
    breakdown[statId] = {
      base: 50, experience, formation: training, total,
      explanations: [
        'Socle de formation militaire : 50.',
        `${activity.label} : ${experience >= 0 ? '+' : ''}${experience}. Allocation d’expérience initiale, pas une limite de carrière.`,
        `${formation.label} : ${training >= 0 ? '+' : ''}${training}. Priorités de formation initiale, réentraînement accessible.`
      ]
    };
  }
  const background = {
    origin: sourceExample?.origin || ORIGINS[narrativeSalt % ORIGINS.length],
    activity: activity.label, activityId: activity.id,
    formation: formation.label, formationId: formation.id,
    assignment: activity.assignment,
    event: activity.event, eventId: `${activity.id}-prior-service`,
    motivation: sourceExample?.motivation || MOTIVATIONS[(narrativeSalt >>> 5) % MOTIVATIONS.length],
    habit: activity.habit, attachment: ATTACHMENTS[(narrativeSalt >>> 10) % ATTACHMENTS.length],
    personalObject: activity.object,
    summary: `${activity.label}. Formation complémentaire : ${formation.label.toLowerCase()}. Dotation issue de cette expérience ; aucune spécialisation interdite.`
  };
  const gear = KITS[activity.kit].map((catalogId, index) => {
    const item = GEAR_BY_ID.get(catalogId);
    return {
      instanceId: `${id}-gear-${String(index + 1).padStart(2, '0')}`,
      catalogId, kind: item.kind, mass: item.mass, value: item.value,
      reason: index === 0 ? 'Arme militaire standard remise à l’affectation, adaptée à la dotation de terrain.'
        : `Dotation fonctionnelle liée à l’expérience : ${activity.label.toLowerCase()}. Matériel échangeable, distinct de l’objet personnel.`
    };
  });
  return {
    schema: 85, id,
    name: sourceExample?.name || `${FIRST_NAMES[identitySalt % FIRST_NAMES.length]} ${LAST_NAMES[(identitySalt >>> 6) % LAST_NAMES.length]}`,
    callsign: sourceExample?.callsign || `${CALLSIGNS[(identitySalt >>> 12) % CALLSIGNS.length]}-${serial}`,
    species: 'human', role: 'Marine', specialty: 'assault',
    background, aptitudes, breakdown, gear,
    statBudget: RECRUIT_STAT_BUDGET_V85, gearBudget: RECRUIT_GEAR_BUDGET_V85,
    recruitCost: RECRUITMENT_COST_V85,
    signature: `cv85:${activity.id}:${formation.id}:${activity.kit}`,
    quote: sourceExample?.quote || '',
    visualProfileId: RECRUIT_VISUAL_PROFILE_V85, artStatus: ART_STATUS,
    canonStatus: CANON_STATUS,
    equipmentPolicy: 'v85-existing-functional-kits-not-full-source-props'
  };
}

function profileCoordinates(id) {
  if (typeof id !== 'string') return null;
  const match = /^recruit-v85-([0-9a-f]{8})-([0-9]{6})$/.exec(id);
  if (!match) return null;
  const serial = Number(match[2]);
  return serial >= 1 && serial <= MAX_SERIAL ? { seed: Number.parseInt(match[1], 16), serial } : null;
}
function matchesContract(raw, canonical) {
  if (Array.isArray(canonical)) return Array.isArray(raw) && raw.length === canonical.length
    && canonical.every((value, index) => matchesContract(raw[index], value));
  if (record(canonical)) return record(raw) && Object.keys(canonical).every(key => own(raw, key) && matchesContract(raw[key], canonical[key]));
  return raw === canonical;
}

/** Return a detached, generation-validated initial dossier, or null.
 * Recomputing a deterministic contract is validation, never a new pool/roll.
 * Unknown extra properties are stripped. Mutable career data is not accepted here.
 */
export function sanitizeRecruitProfileV85(raw) {
  if (!record(raw) || raw.schema !== 85) return null;
  const coordinates = profileCoordinates(raw.id);
  if (!coordinates) return null;
  const canonical = generateProfile(coordinates.seed, coordinates.serial);
  return matchesContract(raw, canonical) ? canonical : null;
}

function emptyState(seed = 85001) {
  return { schema: 85, seed: seedOf(seed), serial: 0, candidates: [], recentSignatures: [], lastOfferHour: 0, diversityFallbackUsed: false };
}
export function createRecruitmentV85(seed = 85001) {
  const state = emptyState(seed);
  state.candidates = SOURCE_EXAMPLES.map((_, index) => generateProfile(state.seed, index + 1));
  state.serial = 4;
  state.recentSignatures = state.candidates.map(profile => profile.signature);
  return state;
}
export function sanitizeRecruitmentV85(raw) {
  if (!record(raw) || raw.schema !== 85) return emptyState();
  const state = emptyState(raw.seed);
  const candidates = Array.isArray(raw.candidates) ? raw.candidates.slice(0, 64) : [];
  const ids = new Set();
  const signatures = new Set();
  for (const candidate of candidates) {
    const profile = sanitizeRecruitProfileV85(candidate);
    const coordinates = profile && profileCoordinates(profile.id);
    if (!profile || coordinates.seed !== state.seed || ids.has(profile.id) || signatures.has(profile.signature)) continue;
    ids.add(profile.id); signatures.add(profile.signature); state.candidates.push(profile);
    if (state.candidates.length === RECRUITMENT_POOL_SIZE_V85) break;
  }
  state.serial = Math.max(integer(raw.serial, 0, 0, MAX_SERIAL), ...state.candidates.map(profile => profileCoordinates(profile.id).serial));
  const recent = Array.isArray(raw.recentSignatures) ? raw.recentSignatures.slice(-128) : [];
  state.recentSignatures = [...new Set(recent.filter(value => typeof value === 'string' && /^cv85:[a-z-]{1,40}:[a-z-]{1,40}:[a-z-]{1,30}$/.test(value)))].slice(-MAX_RECENT);
  for (const signature of signatures) if (!state.recentSignatures.includes(signature)) state.recentSignatures.push(signature);
  state.recentSignatures = state.recentSignatures.slice(-MAX_RECENT);
  state.lastOfferHour = bounded(raw.lastOfferHour, 0, 0, 2400000);
  state.diversityFallbackUsed = raw.diversityFallbackUsed === true;
  return state;
}

/** Explicit offer refresh. Read, render and reload must never call this function.
 * No time passage, payment or save mutation happens here: callers transact those.
 */
export function generateNextRecruitmentPoolV85(raw, clockHour) {
  const state = sanitizeRecruitmentV85(raw);
  if (typeof clockHour !== 'number' || !Number.isFinite(clockHour)
    || clockHour < state.lastOfferHour + RECRUITMENT_REFRESH_HOURS_V85 || clockHour > 2400000 || state.serial >= MAX_SERIAL) return state;
  const candidates = [];
  const recent = new Set(state.recentSignatures);
  const chosen = new Set();
  let serial = state.serial;
  let fallback = false;
  // 64 distinct activity/training combinations guarantee a bounded choice against
  // the 32-entry history. A second pass permits old signatures, never pool clones.
  for (let attempt = 0; attempt < 128 && candidates.length < RECRUITMENT_POOL_SIZE_V85 && serial < MAX_SERIAL; attempt += 1) {
    serial += 1;
    const profile = generateProfile(state.seed, serial);
    if (chosen.has(profile.signature) || attempt < 64 && recent.has(profile.signature)) continue;
    if (recent.has(profile.signature)) fallback = true;
    chosen.add(profile.signature); candidates.push(profile);
  }
  if (candidates.length !== RECRUITMENT_POOL_SIZE_V85) return state;
  return {
    ...state, serial, candidates, lastOfferHour: clockHour, diversityFallbackUsed: fallback,
    recentSignatures: [...new Set([...state.recentSignatures, ...candidates.map(profile => profile.signature)])].slice(-MAX_RECENT)
  };
}

/** Resolve names by stable identity, never by a visual fallback to Mara.
 * Legacy members get an explicit neutral aptitude baseline, not an invented past.
 */
export function resolveCrewDefinitionV85(member, catalog = []) {
  if (!record(member) || typeof member.id !== 'string') return null;
  const original = Array.isArray(catalog) ? catalog.find(entry => entry?.id === member.id) : null;
  const recruit = sanitizeRecruitProfileV85(member.recruitV85);
  if (recruit && recruit.id !== member.id || !recruit && !original) return null;
  const base = recruit?.aptitudes || Object.fromEntries(STAT_IDS.map(id => [id, 50]));
  const aptitudesV85 = Object.fromEntries(STAT_IDS.map(id => [id, base[id] + integer(member.trainingV85?.[id], 0, 0, 100 - base[id])]));
  const result = { ...clone(original || {}), ...clone(member), aptitudesV85 };
  if (!recruit) {
    // Persisted state cannot rename a named catalogue NPC as a side-effect of import.
    for (const key of ['name', 'role', 'species', 'specialty']) if (original[key] !== undefined) result[key] = original[key];
    return result;
  }
  return {
    ...result, id: recruit.id, name: recruit.name, callsign: recruit.callsign,
    role: recruit.role, species: recruit.species, specialty: recruit.specialty,
    background: clone(recruit.background), aptitudes: clone(recruit.aptitudes), breakdown: clone(recruit.breakdown),
    recruitV85: recruit, visualProfileId: recruit.visualProfileId, artStatus: recruit.artStatus,
    canonStatus: recruit.canonStatus,
    gearV85: Array.isArray(member.gearV85) ? clone(member.gearV85).slice(0, 32) : clone(recruit.gear)
  };
}
