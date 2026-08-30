import { CREW } from './content-core-v50.js';
import { HUB_NPC_ROSTER } from './hub-v52-runtime.js';

export const NPC_DIALOGUE_SCHEMA_V62 = 62;
export const NPC_ROUTINE_PHASES_V62 = Object.freeze(['station', 'route', 'work', 'break', 'alert']);
export const NPC_TRUST_LEVELS_V62 = Object.freeze(['fragile', 'prudent', 'operationnel', 'solide']);

const MAX_COUNT = 999999;
const MAX_HISTORY = 64;
const MAX_TOPICS = 32;
const ROOM_DECKS = Object.freeze({
  bridge: 0,
  briefing: 0,
  'combat-information': 0,
  'cryo-bay': 0,
  'crew-quarters': 1,
  mess: 1,
  medical: 1,
  'science-lab': 1,
  quarantine: 2,
  armory: 2,
  workshop: 2,
  'vehicle-bay': 2,
  'dropship-hangar': 3,
  reactor: 3,
  'life-support': 3,
  'sensor-array': 3
});
const ROOMS_BY_DECK = Object.freeze([
  Object.freeze(['bridge', 'briefing', 'combat-information', 'cryo-bay']),
  Object.freeze(['crew-quarters', 'mess', 'medical', 'science-lab']),
  Object.freeze(['quarantine', 'armory', 'workshop', 'vehicle-bay']),
  Object.freeze(['dropship-hangar', 'reactor', 'life-support', 'sensor-array'])
]);
const ROOM_INDEXES = Object.freeze(Object.fromEntries(ROOMS_BY_DECK.flatMap((rooms) => rooms.map((roomId, roomIndex) => [roomId, roomIndex]))));
const BULKHEAD_IDS = Object.freeze(['hub-west-bulkhead', 'hub-central-bulkhead', 'hub-east-bulkhead']);
const ROUTINE_LIFTS = Object.freeze([
  Object.freeze({ shaftId: 'hub-midship-lift', roomIndex: 1 }),
  Object.freeze({ shaftId: 'hub-aft-lift', roomIndex: 3 })
]);

const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const integer = (value, fallback = 0, min = 0, max = MAX_COUNT) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clamp(Math.floor(parsed), min, max) : fallback;
};
const number = (value, fallback = 0, min = 0, max = 100) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
};
const text = (value, fallback = '', maximum = 160) => typeof value === 'string' ? value.slice(0, maximum) : fallback;
const stringList = (value, maximum = MAX_HISTORY) => Array.isArray(value)
  ? [...new Set(value.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 160)))].slice(-maximum)
  : [];
const jsonClone = (value) => JSON.parse(JSON.stringify(value));

function freezeDeep(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/**
 * Ces identités sont des personnages originaux du projet Tantalus Frontier.
 * `canonStatus` empêche leur présentation accidentelle comme faits de la franchise.
 */
const AUTHORED_IDENTITIES = freezeDeep({
  'crew-01-mara-vega': {
    duty: 'Coordination du Tantalus et arbitrage des priorités', style: 'direct, calme, orienté décision',
    workRoomId: 'briefing', breakRoomId: 'mess', alertRoomId: 'bridge',
    first: 'Vega. Je coordonne la relève. Donnez-moi des faits, puis une décision exploitable.',
    repeat: 'Le rapport précédent est enregistré. Qu’est-ce qui a changé depuis notre dernier échange ?',
    crisis: 'Le protocole d’alerte est actif. Je garde la passerelle et les équipes sur une chaîne de commandement unique.',
    infestation: 'Je ne qualifierai pas la menace sans preuves. Quarantaine et capteurs doivent confirmer la chaîne causale.'
  },
  'crew-02-tamsin-velez': {
    duty: 'Préparation tactique, discipline et contrôle des dotations', style: 'bref, exigeant, protecteur',
    workRoomId: 'armory', breakRoomId: 'mess', alertRoomId: 'briefing',
    first: 'Velez. Avant l’embarquement, je veux une équipe qui connaît son rôle et son angle de tir.',
    repeat: 'La dernière consigne tient toujours. On révise seulement ce que le terrain a invalidé.',
    crisis: 'Alerte active. Je verrouille les secteurs et j’empêche les tirs croisés dans les coursives.',
    infestation: 'On traite chaque trace comme un indice, pas comme une cible confirmée. Personne ne rompt la quarantaine.'
  },
  'crew-03-idris-kwan': {
    duty: 'Stabilité du réacteur et continuité des réseaux', style: 'méthodique, concret, précis',
    workRoomId: 'life-support', breakRoomId: 'workshop', alertRoomId: 'reactor',
    first: 'Kwan. Si vous me donnez la charge, la panne et le délai, je peux vous donner un risque honnête.',
    repeat: 'J’ai gardé les relevés du dernier échange. Voyons ce que les systèmes disent maintenant.',
    crisis: 'Alerte active. Je maintiens le réacteur isolé et je déleste les circuits non essentiels.',
    infestation: 'Une anomalie de ventilation peut être mécanique ou biologique. Je n’affirme rien avant recoupement.'
  },
  'crew-04-noor-okafor': {
    duty: 'Triage, soins de campagne et suivi des blessures', style: 'posé, empathique, sans minimisation',
    workRoomId: 'medical', breakRoomId: 'mess', alertRoomId: 'medical',
    first: 'Okafor. Je peux stabiliser une blessure, mais j’ai besoin que vous me disiez aussi le niveau de stress.',
    repeat: 'Je me souviens de votre dernier état. On vérifie les changements avant de vous déclarer apte.',
    crisis: 'Alerte active. Le bloc médical passe en triage et garde une voie libre pour les évacuations.',
    infestation: 'Toute exposition reste suspecte jusqu’au dépistage. Je sépare les symptômes des suppositions.'
  },
  'crew-05-bishop-9': {
    duty: 'Analyse scientifique et contrôle méthodologique', style: 'analytique, prudent, transparent sur l’incertitude',
    workRoomId: 'quarantine', breakRoomId: 'science-lab', alertRoomId: 'science-lab',
    first: 'BISHOP-9. Je distinguerai systématiquement observation, hypothèse et conclusion.',
    repeat: 'Les observations précédentes sont conservées. Je peux comparer sans réécrire l’historique.',
    crisis: 'Alerte active. Je protège les données et fournis uniquement les résultats dont la confiance est mesurable.',
    infestation: 'La chaîne d’infestation reste une hypothèse graduée tant que les preuves biologiques ne la confirment pas.'
  },
  'crew-06-rook': {
    duty: 'Reconnaissance, cartographie et détection avancée', style: 'laconique, attentif, orienté terrain',
    workRoomId: 'combat-information', breakRoomId: 'mess', alertRoomId: 'sensor-array',
    first: 'Rook. Je peux vous donner une route, un angle mort et ce que les capteurs n’ont pas vu.',
    repeat: 'La carte garde nos anciens passages. Je cherche les écarts, pas les certitudes confortables.',
    crisis: 'Alerte active. Je recoupe les mouvements et je marque les secteurs sans visibilité.',
    infestation: 'Le tracker donne une signature, pas une espèce ni un nombre exact. Je garde cette distinction.'
  },
  'crew-07-sanaa-doyle': {
    duty: 'Appui lourd, contrôle des munitions et discipline de feu', style: 'franc, énergique, responsable',
    workRoomId: 'briefing', breakRoomId: 'mess', alertRoomId: 'armory',
    first: 'Doyle. Une arme lourde résout un problème seulement si la ligne de feu est propre.',
    repeat: 'Je n’ai pas oublié la dernière dotation. Dites-moi ce qui a réellement manqué sur le terrain.',
    crisis: 'Alerte active. Je distribue les munitions et je garde une réserve pour les points de rupture.',
    infestation: 'Pas de tir aveugle dans les conduits. On confirme la position et ce qu’il y a derrière la paroi.'
  },
  'crew-08-maksim-orlov': {
    duty: 'Pilotage, insertion et extraction des équipes', style: 'sobre, anticipateur, centré trajectoire',
    workRoomId: 'briefing', breakRoomId: 'mess', alertRoomId: 'dropship-hangar',
    first: 'Orlov. Une insertion sûre commence par une extraction possible, du carburant et une météo lisible.',
    repeat: 'Le plan de vol précédent reste archivé. Je recalcule seulement avec les nouvelles contraintes.',
    crisis: 'Alerte active. Le hangar reste dégagé pour une évacuation ou un appui immédiat.',
    infestation: 'Aucun appareil ne repart sans inspection de soute. Une contamination supposée reste confinée.'
  },
  'crew-09-inez-harlow': {
    duty: 'Évaluation xénobiologique et supervision de quarantaine', style: 'rigoureux, curieux, non sensationnaliste',
    workRoomId: 'science-lab', breakRoomId: 'mess', alertRoomId: 'quarantine',
    first: 'Harlow. Je peux interpréter un prélèvement, mais je ne transformerai pas un signal faible en certitude.',
    repeat: 'Je conserve les niveaux de preuve du dernier rapport. Voyons si un nouvel indice les modifie.',
    crisis: 'Alerte active. La quarantaine reste scellée et chaque prélèvement suit une chaîne de contrôle.',
    infestation: 'Les stades doivent être établis dans l’ordre. Une trace isolée ne prouve ni nid ni population.'
  },
  'crew-10-david-8r': {
    duty: 'Analyse d’infiltration et récupération de données', style: 'mesuré, distant, attentif aux contradictions',
    workRoomId: 'combat-information', breakRoomId: 'science-lab', alertRoomId: 'combat-information',
    first: 'DAVID-8R. Mon statut récupéré impose de vérifier mes conclusions comme celles de tout autre opérateur.',
    repeat: 'Je conserve notre échange et ses contradictions. Vous pouvez me demander de les exposer.',
    crisis: 'Alerte active. Je segmente les accès et journalise chaque commande inhabituelle.',
    infestation: 'Une intrusion système et une contamination biologique peuvent se croiser sans avoir la même cause.'
  },
  'crew-11-jun-park': {
    duty: 'Maintenance du support-vie et diagnostic de terrain', style: 'pratique, rapide, attentif aux symptômes système',
    workRoomId: 'workshop', breakRoomId: 'mess', alertRoomId: 'life-support',
    first: 'Park. Les filtres, la pression et l’oxygène racontent l’incident avant les voyants rouges.',
    repeat: 'J’ai gardé les valeurs précédentes. On compare avant de démonter quoi que ce soit.',
    crisis: 'Alerte active. Je ferme les dérivations et garde le support-vie sous surveillance locale.',
    infestation: 'Un conduit endommagé est une route possible, pas la preuve qu’une créature l’a emprunté.'
  },
  'crew-12-asha-mbaye': {
    duty: 'Liaison coloniale, médiation et validation des témoignages', style: 'diplomatique, lucide, centré personnes',
    workRoomId: 'bridge', breakRoomId: 'mess', alertRoomId: 'briefing',
    first: 'Mbaye. Je peux obtenir un accord, mais seulement si nous séparons besoins, risques et faits vérifiés.',
    repeat: 'Je me souviens des engagements formulés. Je ne les présenterai pas comme acquis sans confirmation.',
    crisis: 'Alerte active. Je centralise les messages pour éviter les ordres contradictoires et la panique.',
    infestation: 'Les témoignages comptent, mais ils doivent être recoupés avant toute annonce de menace.'
  },
  'crew-13-pablo-reyes': {
    duty: 'Démolition, ouverture contrôlée et sécurité des charges', style: 'technique, prudent, sans bravade',
    workRoomId: 'armory', breakRoomId: 'mess', alertRoomId: 'workshop',
    first: 'Reyes. Une brèche utile est calculée : structure, pression, personnes et issue de repli.',
    repeat: 'Les paramètres de la dernière charge sont consignés. On repart des nouvelles contraintes.',
    crisis: 'Alerte active. Je sécurise les charges et je prépare uniquement les ouvertures autorisées.',
    infestation: 'Faire sauter un conduit sans carte peut propager le danger. Je veux d’abord un tracé confirmé.'
  },
  'crew-14-echo-a': {
    duty: 'Synthèse tactique et coordination de combat', style: 'concis, procédural, explicite sur la confiance',
    workRoomId: 'briefing', breakRoomId: 'combat-information', alertRoomId: 'combat-information',
    first: 'ECHO-A. Je peux proposer une option tactique et son niveau de confiance, pas garantir son résultat.',
    repeat: 'Le modèle conserve les conséquences observées. J’ajuste la recommandation, pas l’historique.',
    crisis: 'Alerte active. Je distribue les contacts confirmés et signale séparément les estimations.',
    infestation: 'Je ne convertirai pas une signature partielle en effectif exact sans couverture capteur suffisante.'
  },
  'crew-15-leila-s-rensen': {
    duty: 'Survie, itinéraires de repli et autonomie en environnement hostile', style: 'réservé, pragmatique, patient',
    workRoomId: 'sensor-array', breakRoomId: 'crew-quarters', alertRoomId: 'briefing',
    first: 'Sørensen. Je prépare toujours une route principale, une alternative et le point où l’on renonce.',
    repeat: 'Je garde les anciennes routes comme avertissements. La nouvelle doit répondre au terrain actuel.',
    crisis: 'Alerte active. Je balise les replis et garde les passages critiques sans encombrement.',
    infestation: 'Un passage étroit peut protéger ou piéger. Je ne l’engage pas sans sortie reconnue.'
  },
  'crew-16-cal-mercer': {
    duty: 'Maintenance des véhicules et affectation des postes', style: 'terre-à-terre, collectif, axé disponibilité',
    workRoomId: 'dropship-hangar', breakRoomId: 'workshop', alertRoomId: 'vehicle-bay',
    first: 'Mercer. Un véhicule disponible, c’est un châssis contrôlé et un équipage qui connaît son poste.',
    repeat: 'J’ai le dernier état du parc. Voyons les dégâts, le carburant et les équipages réellement présents.',
    crisis: 'Alerte active. Je garde une machine prête et les voies de sortie dégagées.',
    infestation: 'Chaque caisse et chaque train roulant passent au contrôle avant de quitter la baie.'
  }
});

const CREW_BY_ID = new Map(CREW.map((member) => [member.id, member]));
const ROSTER_BY_ID = new Map(HUB_NPC_ROSTER.map((member) => [member.crewId, member]));

function buildIdentity(roster) {
  const crew = CREW_BY_ID.get(roster.crewId);
  const authored = AUTHORED_IDENTITIES[roster.crewId];
  if (!crew || !authored) throw new Error(`Identité PNJ V62 incomplète : ${roster.crewId}`);
  return freezeDeep({
    crewId: roster.crewId,
    name: crew.name,
    role: crew.role,
    species: crew.species,
    specialty: crew.specialty,
    baseTrust: crew.loyalty,
    stationRoomId: roster.roomId,
    workRoomId: authored.workRoomId,
    breakRoomId: authored.breakRoomId,
    alertRoomId: authored.alertRoomId,
    duty: authored.duty,
    communicationStyle: authored.style,
    lines: {
      first: authored.first,
      repeat: authored.repeat,
      crisis: authored.crisis,
      infestation: authored.infestation
    },
    provenance: 'tantalus-frontier-project-authored-v62',
    canonStatus: 'project-fiction-not-franchise-canon'
  });
}

export const NPC_IDENTITIES_V62 = Object.freeze(HUB_NPC_ROSTER.map(buildIdentity));
const IDENTITY_BY_ID = new Map(NPC_IDENTITIES_V62.map((identity) => [identity.crewId, identity]));

export const NPC_DIALOGUE_COVERAGE_V62 = Object.freeze({
  crewCount: CREW.length,
  hubRosterCount: HUB_NPC_ROSTER.length,
  identityCount: NPC_IDENTITIES_V62.length,
  missingCrewIds: Object.freeze(HUB_NPC_ROSTER.filter((entry) => !IDENTITY_BY_ID.has(entry.crewId)).map((entry) => entry.crewId)),
  orphanIdentityIds: Object.freeze(NPC_IDENTITIES_V62.filter((entry) => !ROSTER_BY_ID.has(entry.crewId)).map((entry) => entry.crewId)),
  complete: NPC_IDENTITIES_V62.length === CREW.length && NPC_IDENTITIES_V62.length === HUB_NPC_ROSTER.length
});

function normalizeTopics(value) {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => /^[a-z0-9-]{1,48}$/.test(key))
    .slice(0, MAX_TOPICS)
    .map(([key, count]) => [key, integer(count)]));
}

function normalizeMemoryEntry(value = {}, legacy = null) {
  const source = isRecord(value) ? value : {};
  const legacyCount = integer(legacy?.count);
  const conversations = Math.max(integer(source.conversations), legacyCount);
  const topics = normalizeTopics(source.topics);
  if (!Object.keys(topics).length && legacyCount > 0) topics.legacyInteraction = legacyCount;
  return {
    conversations,
    rapport: integer(source.rapport, 0, -50, 50),
    topics,
    flags: stringList(source.flags, 32),
    lastTopic: text(source.lastTopic, legacyCount > 0 ? 'legacyInteraction' : '', 48),
    lastChoiceId: text(source.lastChoiceId, '', 80),
    lastContext: text(source.lastContext, '', 40),
    lastDay: integer(source.lastDay, 0, 0, 100000),
    lastHour: number(source.lastHour, 0, 0, 24),
    handledConversationIds: stringList(source.handledConversationIds, MAX_HISTORY)
  };
}

export function normalizeDialogueMemoryV62(value, legacyInteractions = {}) {
  const source = isRecord(value) ? value : {};
  const rawEntries = isRecord(source.entries) ? source.entries : source;
  const legacy = isRecord(legacyInteractions) ? legacyInteractions : {};
  const entries = {};
  for (const identity of NPC_IDENTITIES_V62) {
    const raw = rawEntries[identity.crewId];
    const old = legacy[identity.crewId];
    if (!isRecord(raw) && !isRecord(old)) continue;
    entries[identity.crewId] = normalizeMemoryEntry(raw, old);
  }
  const highestEntrySequence = Object.values(entries).reduce((total, entry) => Math.max(total, entry.conversations), 0);
  return {
    schema: NPC_DIALOGUE_SCHEMA_V62,
    sequence: Math.max(integer(source.sequence), highestEntrySequence),
    entries
  };
}

function normalizeRoutineEntry(value = {}) {
  const source = isRecord(value) ? value : {};
  const phase = NPC_ROUTINE_PHASES_V62.includes(source.phase) ? source.phase : 'station';
  const roomId = Object.hasOwn(ROOM_DECKS, source.roomId) ? source.roomId : '';
  return {
    phase,
    roomId,
    routeId: text(source.routeId, '', 120),
    lastDay: integer(source.lastDay, 0, 0, 100000),
    lastHour: number(source.lastHour, 0, 0, 24),
    lastResolvedKey: text(source.lastResolvedKey, '', 180),
    alertAcknowledged: Boolean(source.alertAcknowledged),
    sequence: integer(source.sequence)
  };
}

export function normalizeNpcRoutineStateV62(value) {
  const source = isRecord(value) ? value : {};
  const rawEntries = isRecord(source.entries) ? source.entries : source;
  const entries = {};
  for (const identity of NPC_IDENTITIES_V62) {
    if (!isRecord(rawEntries[identity.crewId])) continue;
    entries[identity.crewId] = normalizeRoutineEntry(rawEntries[identity.crewId]);
  }
  return {
    schema: NPC_DIALOGUE_SCHEMA_V62,
    sequence: Math.max(integer(source.sequence), ...Object.values(entries).map((entry) => entry.sequence)),
    entries
  };
}

/** Migration additive : les interactions V52 sont lues mais jamais supprimées. */
export function migrateNpcDialogueHubStateV62(hubState = {}) {
  const hub = isRecord(hubState) ? jsonClone(hubState) : {};
  hub.dialogueMemory = normalizeDialogueMemoryV62(hub.dialogueMemory, hub.npcInteractions);
  hub.npcRoutineState = normalizeNpcRoutineStateV62(hub.npcRoutineState);
  return hub;
}

function normalizeClock(context = {}) {
  const clock = isRecord(context.clock) ? context.clock : isRecord(context.save?.clock) ? context.save.clock : {};
  const day = integer(clock.day ?? context.day, 1, 1, 100000);
  const rawHour = number(clock.hour ?? context.hour, 8, 0, 2400000);
  const absolute = (day - 1) * 24 + rawHour;
  return { day: Math.floor(absolute / 24) + 1, hour: Math.round((absolute % 24) * 100) / 100 };
}

function resolveHub(context = {}) {
  return isRecord(context.hub) ? context.hub : isRecord(context.save?.hub) ? context.save.hub : {};
}

function resolveCurrentInteractionReceipt(crewId, interaction, hubState) {
  if (!isRecord(interaction) || interaction.type !== 'hub:npc-interaction' || interaction.crewId !== crewId) return null;
  const current = isRecord(hubState?.npcInteractions?.[crewId]) ? hubState.npcInteractions[crewId] : null;
  const persisted = isRecord(interaction.persistence?.value) ? interaction.persistence.value : {};
  const count = integer(persisted.count ?? interaction.count);
  const sequence = integer(persisted.sequence ?? interaction.sequence ?? count);
  if (!current || count < 1 || integer(current.count) !== count) return null;
  if (Number.isFinite(Number(current.sequence)) && integer(current.sequence) !== sequence) return null;
  return freezeDeep({ crewId, count, sequence });
}

function migrateHubForConversation(hubState, crewId, interactionReceipt = null) {
  const source = isRecord(hubState) ? jsonClone(hubState) : {};
  const current = isRecord(source.npcInteractions?.[crewId]) ? source.npcInteractions[crewId] : null;
  const receiptMatches = isRecord(interactionReceipt)
    && interactionReceipt.crewId === crewId
    && current
    && integer(current.count) === integer(interactionReceipt.count)
    && (!Number.isFinite(Number(current.sequence)) || integer(current.sequence) === integer(interactionReceipt.sequence));
  if (!receiptMatches) return migrateNpcDialogueHubStateV62(source);

  const originalInteractions = jsonClone(source.npcInteractions || {});
  source.npcInteractions = {
    ...source.npcInteractions,
    [crewId]: { ...current, count: Math.max(0, integer(current.count) - 1) }
  };
  const migrated = migrateNpcDialogueHubStateV62(source);
  migrated.npcInteractions = originalInteractions;
  return migrated;
}

function resolveCrewState(crewId, context = {}) {
  if (isRecord(context.crewState) && (!context.crewState.id || context.crewState.id === crewId)) return context.crewState;
  const roster = Array.isArray(context.crew) ? context.crew : Array.isArray(context.save?.crew) ? context.save.crew : [];
  return roster.find((entry) => entry?.id === crewId) || CREW_BY_ID.get(crewId) || {};
}

function resolveInfestation(hub, context = {}) {
  const raw = isRecord(context.infestation) ? context.infestation : isRecord(hub.infestationChain) ? hub.infestationChain : {};
  const stage = ['exposure', 'anomaly', 'clues', 'confirmation', 'containment', 'infestation'].includes(raw.stage) ? raw.stage : null;
  return {
    active: Boolean(stage && !raw.resolved),
    stage,
    certainty: number(raw.certainty, 0, 0, 100),
    sourceType: text(raw.sourceType, '', 60)
  };
}

function resolveCrisis(hub, context = {}) {
  const raw = isRecord(context.crisis) ? context.crisis : isRecord(hub.activeCrisis) ? hub.activeCrisis : {};
  return {
    active: context.crisisActive === true || Boolean(raw.active ?? raw.id),
    kind: text(raw.kind, '', 60),
    roomId: Object.hasOwn(ROOM_DECKS, raw.roomId) ? raw.roomId : '',
    id: text(raw.id, '', 120)
  };
}

function roomWaypoint(roomId, purpose) {
  return {
    id: `room:${roomId}:${purpose}`,
    kind: 'room',
    purpose,
    roomId,
    roomIndex: ROOM_INDEXES[roomId],
    deck: ROOM_DECKS[roomId]
  };
}

function appendDeckTraversal(points, fromRoomId, toRoomId) {
  if (fromRoomId === toRoomId) return;
  const deck = ROOM_DECKS[fromRoomId];
  if (deck !== ROOM_DECKS[toRoomId]) throw new RangeError('Un trajet de coursive doit rester sur un même pont.');
  const rooms = ROOMS_BY_DECK[deck];
  const fromIndex = ROOM_INDEXES[fromRoomId];
  const toIndex = ROOM_INDEXES[toRoomId];
  const direction = Math.sign(toIndex - fromIndex);
  let roomIndex = fromIndex;
  points.push({
    id: `corridor:${deck}:${rooms[roomIndex]}:depart`,
    kind: 'corridor',
    deck,
    roomId: rooms[roomIndex],
    roomIndex,
    direction
  });
  while (roomIndex !== toIndex) {
    const nextRoomIndex = roomIndex + direction;
    const boundaryIndex = Math.min(roomIndex, nextRoomIndex);
    points.push({
      id: `door:${deck}:${BULKHEAD_IDS[boundaryIndex]}:approach:${direction > 0 ? 'east' : 'west'}`,
      kind: 'door',
      doorId: BULKHEAD_IDS[boundaryIndex],
      side: 'approach',
      deck,
      roomId: rooms[roomIndex],
      roomIndex,
      toRoomId: rooms[nextRoomIndex],
      boundaryIndex,
      direction
    });
    points.push({
      id: `door:${deck}:${BULKHEAD_IDS[boundaryIndex]}:crossed:${direction > 0 ? 'east' : 'west'}`,
      kind: 'door',
      doorId: BULKHEAD_IDS[boundaryIndex],
      side: 'crossed',
      deck,
      roomId: rooms[nextRoomIndex],
      roomIndex: nextRoomIndex,
      fromRoomId: rooms[roomIndex],
      boundaryIndex,
      direction
    });
    roomIndex = nextRoomIndex;
    points.push({
      id: `corridor:${deck}:${rooms[roomIndex]}:${roomIndex === toIndex ? 'arrivee' : 'transit'}`,
      kind: 'corridor',
      deck,
      roomId: rooms[roomIndex],
      roomIndex,
      direction
    });
  }
}

function chooseRoutineLift(fromRoomId, toRoomId) {
  const fromIndex = ROOM_INDEXES[fromRoomId];
  const toIndex = ROOM_INDEXES[toRoomId];
  return ROUTINE_LIFTS
    .map((lift) => ({ lift, distance: Math.abs(fromIndex - lift.roomIndex) + Math.abs(toIndex - lift.roomIndex) }))
    .sort((left, right) => left.distance - right.distance || left.lift.roomIndex - right.lift.roomIndex)[0].lift;
}

export function buildNpcPhysicalRouteV62(fromRoomId, toRoomId) {
  if (!Object.hasOwn(ROOM_DECKS, fromRoomId) || !Object.hasOwn(ROOM_DECKS, toRoomId)) throw new RangeError('Salle de routine inconnue.');
  const fromDeck = ROOM_DECKS[fromRoomId];
  const toDeck = ROOM_DECKS[toRoomId];
  const points = [roomWaypoint(fromRoomId, 'depart')];
  if (fromRoomId !== toRoomId && fromDeck === toDeck) {
    appendDeckTraversal(points, fromRoomId, toRoomId);
  } else if (fromDeck !== toDeck) {
    const lift = chooseRoutineLift(fromRoomId, toRoomId);
    const sourceLiftRoomId = ROOMS_BY_DECK[fromDeck][lift.roomIndex];
    const targetLiftRoomId = ROOMS_BY_DECK[toDeck][lift.roomIndex];
    appendDeckTraversal(points, fromRoomId, sourceLiftRoomId);
    points.push({
      id: `lift-entry:${lift.shaftId}:${fromDeck}`,
      kind: 'lift-entry',
      shaftId: lift.shaftId,
      deck: fromDeck,
      roomId: sourceLiftRoomId,
      roomIndex: lift.roomIndex,
      fromDeck,
      toDeck
    });
    points.push({
      id: `lift-transit:${lift.shaftId}:${fromDeck}:${toDeck}`,
      kind: 'lift-transit',
      shaftId: lift.shaftId,
      deck: fromDeck,
      roomId: sourceLiftRoomId,
      targetRoomId: targetLiftRoomId,
      roomIndex: lift.roomIndex,
      fromDeck,
      toDeck
    });
    points.push({
      id: `lift-exit:${lift.shaftId}:${toDeck}`,
      kind: 'lift-exit',
      shaftId: lift.shaftId,
      deck: toDeck,
      roomId: targetLiftRoomId,
      roomIndex: lift.roomIndex,
      fromDeck,
      toDeck
    });
    appendDeckTraversal(points, targetLiftRoomId, toRoomId);
  }
  if (fromRoomId !== toRoomId) points.push(roomWaypoint(toRoomId, 'arrivee'));
  return freezeDeep({
    id: `route:${fromRoomId}:${toRoomId}`,
    fromRoomId,
    toRoomId,
    crossesDecks: fromDeck !== toDeck,
    fromDeck,
    toDeck,
    waypoints: points
  });
}

export function sampleNpcPhysicalRouteV62(route, progress = 0) {
  const waypoints = Array.isArray(route?.waypoints) ? route.waypoints : [];
  if (!waypoints.length) return null;
  if (waypoints.length === 1) {
    const waypoint = waypoints[0];
    return freezeDeep({
      waypointId: waypoint.id,
      kind: waypoint.kind,
      deck: waypoint.deck,
      roomId: waypoint.roomId,
      segmentIndex: 0,
      segmentProgress: 0,
      fromWaypoint: waypoint,
      toWaypoint: waypoint
    });
  }
  const scaled = clamp(number(progress, 0, 0, 1), 0, 1) * (waypoints.length - 1);
  const segmentIndex = Math.min(waypoints.length - 2, Math.floor(scaled));
  const segmentProgress = segmentIndex === waypoints.length - 2 && scaled === waypoints.length - 1 ? 1 : scaled - segmentIndex;
  const fromWaypoint = waypoints[segmentIndex];
  const toWaypoint = waypoints[segmentIndex + 1];
  const activeWaypoint = segmentProgress < 0.5 ? fromWaypoint : toWaypoint;
  return freezeDeep({
    waypointId: activeWaypoint.id,
    kind: activeWaypoint.kind,
    deck: activeWaypoint.deck,
    roomId: activeWaypoint.roomId,
    segmentIndex,
    segmentProgress,
    fromWaypoint,
    toWaypoint
  });
}

function segmentForHour(hour) {
  if (hour < 6) return { phase: 'station', from: 'station', to: 'station', progress: 0 };
  if (hour < 7) return { phase: 'route', from: 'station', to: 'work', progress: hour - 6 };
  if (hour < 12) return { phase: 'work', from: 'work', to: 'work', progress: 0 };
  if (hour < 13) return { phase: 'route', from: 'work', to: 'break', progress: hour - 12 };
  if (hour < 14) return { phase: 'break', from: 'break', to: 'break', progress: 0 };
  if (hour < 15) return { phase: 'route', from: 'break', to: 'work', progress: hour - 14 };
  if (hour < 21) return { phase: 'work', from: 'work', to: 'work', progress: 0 };
  if (hour < 22) return { phase: 'route', from: 'work', to: 'station', progress: hour - 21 };
  return { phase: 'station', from: 'station', to: 'station', progress: 0 };
}

function routineRooms(identity) {
  return {
    station: identity.stationRoomId,
    work: identity.workRoomId,
    break: identity.breakRoomId,
    alert: identity.alertRoomId
  };
}

export function resolveNpcRoutineV62(crewId, context = {}) {
  const identity = IDENTITY_BY_ID.get(crewId);
  if (!identity) return null;
  const hub = resolveHub(context);
  const clock = normalizeClock(context);
  const crew = resolveCrewState(crewId, context);
  const crisis = resolveCrisis(hub, context);
  const infestation = resolveInfestation(hub, context);
  const rooms = routineRooms(identity);
  const injuryCount = Array.isArray(crew.injuries) ? crew.injuries.length : 0;
  const needsCare = injuryCount > 0 || ['injured', 'recovering'].includes(crew.status) || number(crew.health, 100) < 45;
  const operation = isRecord(context.operation) ? context.operation : isRecord(context.save?.strategy?.currentOperation) ? context.save.strategy.currentOperation : null;
  const missionAssigned = Boolean(operation && Array.isArray(operation.crewIds) && operation.crewIds.includes(crewId));

  let segment = segmentForHour(clock.hour);
  let reason = 'daily-schedule';
  if (crisis.active || (infestation.active && ['confirmation', 'containment', 'infestation'].includes(infestation.stage))) {
    segment = { phase: 'alert', from: 'alert', to: 'alert', progress: 0 };
    reason = crisis.active ? 'active-crisis' : `infestation-${infestation.stage}`;
  } else if (missionAssigned) {
    segment = { phase: 'work', from: 'mission', to: 'mission', progress: 0 };
    reason = 'mission-assignment';
  } else if (needsCare && segment.phase !== 'route') {
    segment = { phase: 'station', from: 'medical', to: 'medical', progress: 0 };
    reason = 'medical-recovery';
  }

  const fromRoomId = segment.from === 'mission' ? 'dropship-hangar' : segment.from === 'medical' ? 'medical' : rooms[segment.from];
  const toRoomId = segment.to === 'mission' ? 'dropship-hangar' : segment.to === 'medical' ? 'medical' : rooms[segment.to];
  const route = buildNpcPhysicalRouteV62(fromRoomId, toRoomId);
  const progress = clamp(segment.progress, 0, 1);
  const routeSample = segment.phase === 'route' ? sampleNpcPhysicalRouteV62(route, progress) : null;
  const roomId = routeSample?.roomId || fromRoomId;
  const deck = Number.isInteger(routeSample?.deck) ? routeSample.deck : ROOM_DECKS[roomId];
  const deterministicKey = `${crewId}:${clock.day}:${Math.floor(clock.hour * 4)}:${segment.phase}:${route.id}:${reason}`;
  return freezeDeep({
    schema: NPC_DIALOGUE_SCHEMA_V62,
    crewId,
    day: clock.day,
    hour: clock.hour,
    phase: segment.phase,
    roomId,
    deck,
    fromRoomId,
    toRoomId,
    route,
    routeProgress: progress,
    routeSample,
    reason,
    alert: crisis.active || reason.startsWith('infestation-'),
    missionAssigned,
    needsCare,
    deterministicKey,
    schedule: {
      stationRoomId: rooms.station,
      workRoomId: rooms.work,
      breakRoomId: rooms.break,
      alertRoomId: rooms.alert,
      cycleHours: 24
    }
  });
}

export function persistNpcRoutineResolutionV62(hubState, resolution) {
  const hub = migrateNpcDialogueHubStateV62(hubState);
  const identity = IDENTITY_BY_ID.get(resolution?.crewId);
  if (!identity || !NPC_ROUTINE_PHASES_V62.includes(resolution?.phase)) {
    return { applied: false, reason: 'invalid-resolution', hub, persistence: { npcRoutineState: hub.npcRoutineState } };
  }
  const ledger = normalizeNpcRoutineStateV62(hub.npcRoutineState);
  const previous = ledger.entries[identity.crewId] || normalizeRoutineEntry();
  if (previous.lastResolvedKey === resolution.deterministicKey) {
    return { applied: false, reason: 'already-current', hub, persistence: { npcRoutineState: ledger } };
  }
  const sequence = ledger.sequence + 1;
  ledger.sequence = sequence;
  ledger.entries[identity.crewId] = {
    ...previous,
    phase: resolution.phase,
    roomId: resolution.roomId,
    routeId: resolution.route.id,
    lastDay: resolution.day,
    lastHour: resolution.hour,
    lastResolvedKey: resolution.deterministicKey,
    sequence
  };
  hub.npcRoutineState = ledger;
  return { applied: true, reason: 'routine-updated', hub, persistence: { npcRoutineState: ledger } };
}

function trustLevel(score) {
  if (score < 35) return 'fragile';
  if (score < 55) return 'prudent';
  if (score < 75) return 'operationnel';
  return 'solide';
}

function buildDialogueContext(identity, hub, memory, context) {
  const crew = resolveCrewState(identity.crewId, context);
  const crisis = resolveCrisis(hub, context);
  const infestation = resolveInfestation(hub, context);
  const clock = normalizeClock(context);
  const operation = isRecord(context.operation) ? context.operation : isRecord(context.save?.strategy?.currentOperation) ? context.save.strategy.currentOperation : null;
  const missionAssigned = Boolean(operation && Array.isArray(operation.crewIds) && operation.crewIds.includes(identity.crewId));
  const injuryCount = Array.isArray(crew.injuries) ? crew.injuries.length : 0;
  const health = number(crew.health, 100);
  const stress = number(crew.stress, 0);
  const missions = integer(crew.missions);
  const trustScore = clamp(number(crew.loyalty, identity.baseTrust) + memory.rapport, 0, 100);
  return {
    day: clock.day,
    hour: clock.hour,
    firstContact: memory.conversations === 0,
    trust: { score: trustScore, level: trustLevel(trustScore), source: 'crew-loyalty-plus-dialogue-rapport' },
    crew: {
      status: text(crew.status, 'active', 32),
      health,
      stress,
      injuryCount,
      missions,
      missionAssigned
    },
    crisis,
    infestation
  };
}

function contextKind(snapshot) {
  if (snapshot.crisis.active) return 'crisis';
  if (snapshot.infestation.active && snapshot.infestation.stage !== 'exposure') return 'infestation';
  if (snapshot.crew.injuryCount > 0 || snapshot.crew.health < 70 || ['injured', 'recovering'].includes(snapshot.crew.status)) return 'injury';
  if (snapshot.crew.stress >= 65) return 'stress';
  if (snapshot.crew.missionAssigned || snapshot.crew.missions > 0) return 'mission';
  return snapshot.firstContact ? 'initial' : 'repeat';
}

function contextLine(identity, kind, snapshot) {
  if (kind === 'crisis') return identity.lines.crisis;
  if (kind === 'infestation') return identity.lines.infestation;
  if (kind === 'injury') return `Mon état enregistré indique ${snapshot.crew.injuryCount} blessure(s) et ${Math.round(snapshot.crew.health)} % de santé. Je n’ignorerai pas cette limite.`;
  if (kind === 'stress') return `Le stress est évalué à ${Math.round(snapshot.crew.stress)} %. Je peux continuer l’échange, mais la relève doit rester une option réelle.`;
  if (kind === 'mission') return snapshot.crew.missionAssigned
    ? 'Je suis affecté à l’opération en cours. Mon rapport distingue préparation, risques et inconnues.'
    : `Mon historique compte ${snapshot.crew.missions} mission(s). Il informe mon jugement sans garantir la prochaine issue.`;
  return snapshot.firstContact ? identity.lines.first : identity.lines.repeat;
}

function condition(id, passed, detail) {
  return { id, passed: Boolean(passed), detail };
}

function choice(id, label, topic, conditions, response) {
  const available = conditions.every((entry) => entry.passed);
  return {
    id,
    label,
    topic,
    conditions,
    available,
    blockedReason: available ? '' : conditions.find((entry) => !entry.passed)?.detail || 'Condition non remplie',
    response
  };
}

function buildChoices(identity, snapshot) {
  const choices = [
    choice(
      'request-status',
      'Demander le rapport de poste',
      'status',
      [condition('npc-present', true, 'Le membre d’équipage doit être présent')],
      `${identity.name} confirme son poste, ses limites actuelles et les faits encore non vérifiés.`
    ),
    choice(
      'request-candid-assessment',
      'Demander une évaluation sans filtre',
      'trust',
      [condition('minimum-trust-60', snapshot.trust.score >= 60, 'Confiance requise : 60')],
      `${identity.name} partage une évaluation plus directe, avec son niveau de confiance et ses incertitudes.`
    ),
    choice(
      'acknowledge-welfare',
      'Reconnaître la blessure ou la tension',
      'welfare',
      [condition('welfare-signal', snapshot.crew.injuryCount > 0 || snapshot.crew.health < 70 || snapshot.crew.stress >= 65, 'Aucun signal de blessure ou de stress élevé')],
      `${identity.name} accuse réception. La limite est inscrite dans la mémoire de dialogue, sans modifier artificiellement son état médical.`
    ),
    choice(
      'review-mission',
      'Revenir sur l’expérience de mission',
      'mission',
      [condition('mission-reference', snapshot.crew.missions > 0 || snapshot.crew.missionAssigned, 'Aucune mission référencée')],
      `${identity.name} relie l’expérience disponible à la situation présente sans promettre le même résultat.`
    ),
    choice(
      'confirm-alert-role',
      'Confirmer le rôle pendant l’alerte',
      'crisis',
      [condition('active-crisis', snapshot.crisis.active, 'Aucune crise active')],
      `${identity.name} confirme son poste d’alerte et enregistre l’accusé de réception.`
    ),
    choice(
      'request-infestation-evidence',
      'Demander les preuves d’infestation',
      'infestation',
      [condition('active-chain', snapshot.infestation.active, 'Aucune chaîne d’infestation active')],
      `${identity.name} sépare les indices, leur certitude et les éléments encore inconnus.`
    )
  ];
  return choices;
}

export function beginNpcConversationV62(crewId, context = {}) {
  const identity = IDENTITY_BY_ID.get(crewId);
  if (!identity) return null;
  const sourceHub = resolveHub(context);
  const interactionReceipt = resolveCurrentInteractionReceipt(crewId, context.interaction, sourceHub);
  const hub = migrateHubForConversation(sourceHub, crewId, interactionReceipt);
  const memory = hub.dialogueMemory.entries[crewId] || normalizeMemoryEntry();
  const snapshot = buildDialogueContext(identity, hub, memory, context);
  const kind = contextKind(snapshot);
  const routine = resolveNpcRoutineV62(crewId, { ...context, hub });
  const choices = buildChoices(identity, snapshot);
  const fingerprint = stableHash(JSON.stringify({ crewId, snapshot, conversations: memory.conversations, routine: routine?.deterministicKey }));
  const conversationId = `npc-v62:${crewId}:${snapshot.day}:${Math.floor(snapshot.hour * 4)}:${memory.conversations}:${kind}:${fingerprint}`;
  const lines = [];
  if (snapshot.firstContact && kind !== 'initial') lines.push({ speaker: identity.name, text: identity.lines.first, purpose: 'introduction' });
  lines.push({ speaker: identity.name, text: contextLine(identity, kind, snapshot), purpose: kind });
  return freezeDeep({
    schema: NPC_DIALOGUE_SCHEMA_V62,
    id: conversationId,
    crewId,
    identity,
    contextKind: kind,
    context: snapshot,
    routine,
    lines,
    choices,
    interactionReceipt,
    persistenceTargets: ['hub.dialogueMemory', 'hub.npcRoutineState'],
    provenance: identity.provenance,
    canonStatus: identity.canonStatus
  });
}

const CHOICE_EFFECTS = Object.freeze({
  'request-status': Object.freeze({ rapportDelta: 0, flag: '', routineAlert: false }),
  'request-candid-assessment': Object.freeze({ rapportDelta: 1, flag: 'candid-assessment-shared', routineAlert: false }),
  'acknowledge-welfare': Object.freeze({ rapportDelta: 2, flag: 'welfare-acknowledged', routineAlert: false }),
  'review-mission': Object.freeze({ rapportDelta: 1, flag: 'mission-reviewed', routineAlert: false }),
  'confirm-alert-role': Object.freeze({ rapportDelta: 1, flag: 'alert-role-confirmed', routineAlert: true }),
  'request-infestation-evidence': Object.freeze({ rapportDelta: 1, flag: 'infestation-evidence-requested', routineAlert: false })
});

export function applyNpcDialogueChoiceV62(hubState, conversation, choiceId) {
  const hub = migrateHubForConversation(hubState, conversation?.crewId, conversation?.interactionReceipt);
  const identity = IDENTITY_BY_ID.get(conversation?.crewId);
  const choiceRecord = Array.isArray(conversation?.choices) ? conversation.choices.find((entry) => entry?.id === choiceId) : null;
  const effect = CHOICE_EFFECTS[choiceId];
  if (!identity || conversation?.schema !== NPC_DIALOGUE_SCHEMA_V62 || !effect || !choiceRecord) {
    return { applied: false, reason: 'invalid-choice', hub, persistence: { dialogueMemory: hub.dialogueMemory, npcRoutineState: hub.npcRoutineState } };
  }
  if (!choiceRecord.available) {
    return { applied: false, reason: 'condition-not-met', blockedReason: choiceRecord.blockedReason, hub, persistence: { dialogueMemory: hub.dialogueMemory, npcRoutineState: hub.npcRoutineState } };
  }

  const ledger = normalizeDialogueMemoryV62(hub.dialogueMemory);
  const previous = ledger.entries[identity.crewId] || normalizeMemoryEntry();
  if (previous.handledConversationIds.includes(conversation.id)) {
    return { applied: false, reason: 'already-applied', hub, persistence: { dialogueMemory: ledger, npcRoutineState: hub.npcRoutineState } };
  }

  const topic = /^[a-z0-9-]{1,48}$/.test(choiceRecord.topic) ? choiceRecord.topic : 'status';
  const sequence = ledger.sequence + 1;
  ledger.sequence = sequence;
  ledger.entries[identity.crewId] = {
    ...previous,
    conversations: previous.conversations + 1,
    rapport: clamp(previous.rapport + effect.rapportDelta, -50, 50),
    topics: { ...previous.topics, [topic]: integer(previous.topics[topic]) + 1 },
    flags: effect.flag ? stringList([...previous.flags, effect.flag], 32) : previous.flags,
    lastTopic: topic,
    lastChoiceId: choiceId,
    lastContext: text(conversation.contextKind, 'repeat', 40),
    lastDay: integer(conversation.context?.day, 0, 0, 100000),
    lastHour: number(conversation.context?.hour, 0, 0, 24),
    handledConversationIds: stringList([...previous.handledConversationIds, conversation.id], MAX_HISTORY)
  };

  const routines = normalizeNpcRoutineStateV62(hub.npcRoutineState);
  if (effect.routineAlert) {
    const previousRoutine = routines.entries[identity.crewId] || normalizeRoutineEntry();
    const routineSequence = routines.sequence + 1;
    routines.sequence = routineSequence;
    routines.entries[identity.crewId] = { ...previousRoutine, alertAcknowledged: true, sequence: routineSequence };
  }
  hub.dialogueMemory = ledger;
  hub.npcRoutineState = routines;
  return freezeDeep({
    applied: true,
    reason: 'choice-applied',
    crewId: identity.crewId,
    choiceId,
    response: choiceRecord.response,
    effectSummary: {
      targets: ['hub.dialogueMemory', 'hub.npcRoutineState'],
      rapportDelta: effect.rapportDelta,
      topic,
      flag: effect.flag,
      alertAcknowledged: effect.routineAlert
    },
    hub,
    persistence: { dialogueMemory: ledger, npcRoutineState: routines }
  });
}

export function getNpcDialogueMemoryV62(hubState, crewId) {
  if (!IDENTITY_BY_ID.has(crewId)) return null;
  const hub = migrateNpcDialogueHubStateV62(hubState);
  return freezeDeep(jsonClone(hub.dialogueMemory.entries[crewId] || normalizeMemoryEntry()));
}
