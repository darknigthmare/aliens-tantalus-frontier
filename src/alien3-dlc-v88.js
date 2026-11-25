/**
 * Alien 3 / Fiorina 161 archive reconstruction for Aliens: Tantalus Frontier.
 * Project-authored gameplay/narrative text. No screenplay dialogue is reproduced.
 */

export const ALIEN3_DLC_SCHEMA_V88 = 88;
export const ALIEN3_OPERATION_ID_V88 = 'alien3-fiorina-161';
export const ALIEN3_CAMPAIGN_ID_V88 = 'special-alien3-fiorina-161';
export const ALIEN3_TEMPLATE_ID_V88 = 'fiorina-161-prison';

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};

const node = (id, x, y, zoneId, anchor = null, width = 250) => ({ id, x, y, zoneId, anchor, width });
const edge = (id, from, to, kind, routeIds, options = {}) => ({ id, from, to, kind, routeIds, ...options });
const route = (id, role, nodeIds) => ({ id, role, nodeIds });
const zone = (id, label, x, w, biomeRole, layers, visual) => ({ id, label, x, w, biomeRole, layers, visual });

export const ALIEN3_FIORINA_PALETTE_V88 = deepFreeze({
  id: 'fiorina-161-leadworks',
  sky: '#080907',
  haze: '#43372a',
  accent: '#bb7a32',
  light: 0.34,
  prop: 'penal-foundry'
});

/**
 * The template intentionally has three genuinely distinct traversable routes.
 * It uses the generic V52 topology compiler, so ladders, doors, surfaces,
 * hazards and save/resume stay native to the production runtime.
 */
export const ALIEN3_FIORINA_TEMPLATE_V88 = deepFreeze({
  id: ALIEN3_TEMPLATE_ID_V88,
  label: 'Fiorina 161 · complexe pénitentiaire et fonderie',
  family: 'penal-foundry',
  dimensions: { width: 6200, height: 720 },
  artLayers: {
    far: 'mission.fiorina.storm-foundry',
    mid: 'mission.fiorina.penal-complex',
    foreground: 'mission.fiorina.chains-steam',
    overlay: 'mission.fiorina.emergency-amber'
  },
  nodes: [
    node('f161-spawn', 180, 510, 'f161-coast', 'spawn', 260),
    node('f161-eev', 620, 510, 'f161-coast', 'archive', 300),
    node('f161-infirmary', 1120, 510, 'f161-infirmary', null, 300),
    node('f161-morgue-high', 1500, 350, 'f161-infirmary', null, 260),
    node('f161-cell-a', 1900, 510, 'f161-cellblock', null, 300),
    node('f161-mess-high', 2320, 350, 'f161-cellblock', null, 280),
    node('f161-cell-b', 2620, 510, 'f161-cellblock', null, 300),
    node('f161-service-low', 3070, 510, 'f161-service', null, 300),
    node('f161-service-high', 3070, 330, 'f161-service', null, 280),
    node('f161-service-deep', 3070, 630, 'f161-service', null, 280),
    node('f161-bishop', 3500, 510, 'f161-service', null, 300),
    node('f161-tunnel-high', 3820, 330, 'f161-leadworks', null, 280),
    node('f161-tunnel-low', 3820, 630, 'f161-leadworks', null, 280),
    node('f161-leadworks', 4200, 510, 'f161-leadworks', 'power', 340),
    node('f161-sprinkler', 4560, 330, 'f161-leadworks', null, 280),
    node('f161-mold', 4920, 510, 'f161-leadworks', 'objective-primary', 360),
    node('f161-furnace-high', 5350, 330, 'f161-furnace', null, 280),
    node('f161-furnace', 5480, 510, 'f161-furnace', 'boss', 340),
    node('f161-company', 5800, 510, 'f161-furnace', null, 300),
    node('f161-extraction', 6040, 510, 'f161-furnace', 'extraction', 300)
  ],
  edges: [
    edge('f161-e01', 'f161-spawn', 'f161-eev', 'walk', ['f161-ground', 'f161-upper', 'f161-maintenance']),
    edge('f161-e02', 'f161-eev', 'f161-infirmary', 'walk', ['f161-ground', 'f161-upper', 'f161-maintenance']),
    edge('f161-e03', 'f161-infirmary', 'f161-cell-a', 'gate', ['f161-ground'], { gateId: 'f161-infirmary-gate' }),
    edge('f161-e04', 'f161-cell-a', 'f161-cell-b', 'walk', ['f161-ground']),
    edge('f161-e05', 'f161-cell-b', 'f161-service-low', 'gate', ['f161-ground'], { gateId: 'f161-cellblock-gate' }),
    edge('f161-e06', 'f161-service-low', 'f161-bishop', 'walk', ['f161-ground']),
    edge('f161-e07', 'f161-bishop', 'f161-leadworks', 'gate', ['f161-ground'], { gateId: 'f161-leadworks-gate' }),
    edge('f161-e08', 'f161-leadworks', 'f161-mold', 'walk', ['f161-ground']),
    edge('f161-e09', 'f161-mold', 'f161-furnace', 'walk', ['f161-ground']),
    edge('f161-e10', 'f161-furnace', 'f161-company', 'walk', ['f161-ground', 'f161-upper', 'f161-maintenance']),
    edge('f161-e11', 'f161-company', 'f161-extraction', 'walk', ['f161-ground', 'f161-upper', 'f161-maintenance']),

    edge('f161-e12', 'f161-infirmary', 'f161-morgue-high', 'ladder', ['f161-upper']),
    edge('f161-e13', 'f161-morgue-high', 'f161-mess-high', 'walk', ['f161-upper']),
    edge('f161-e14', 'f161-mess-high', 'f161-service-high', 'walk', ['f161-upper']),
    edge('f161-e15', 'f161-service-high', 'f161-tunnel-high', 'walk', ['f161-upper']),
    edge('f161-e16', 'f161-tunnel-high', 'f161-sprinkler', 'walk', ['f161-upper']),
    edge('f161-e17', 'f161-sprinkler', 'f161-furnace-high', 'walk', ['f161-upper']),
    edge('f161-e18', 'f161-furnace-high', 'f161-furnace', 'ladder', ['f161-upper']),

    edge('f161-e19', 'f161-infirmary', 'f161-service-deep', 'vent', ['f161-maintenance'], { ventId: 'f161-maintenance-duct-a' }),
    edge('f161-e20', 'f161-service-deep', 'f161-tunnel-low', 'walk', ['f161-maintenance']),
    edge('f161-e21', 'f161-tunnel-low', 'f161-leadworks', 'ladder', ['f161-maintenance']),
    edge('f161-e22', 'f161-leadworks', 'f161-furnace', 'vent', ['f161-maintenance'], { ventId: 'f161-maintenance-duct-b' }),

    edge('f161-e23', 'f161-cell-a', 'f161-mess-high', 'ladder', []),
    edge('f161-e24', 'f161-service-low', 'f161-service-high', 'ladder', []),
    edge('f161-e25', 'f161-service-low', 'f161-service-deep', 'ladder', []),
    edge('f161-e26', 'f161-leadworks', 'f161-sprinkler', 'ladder', [])
  ],
  routes: [
    route('f161-ground', 'cellblock-spine', [
      'f161-spawn', 'f161-eev', 'f161-infirmary', 'f161-cell-a', 'f161-cell-b',
      'f161-service-low', 'f161-bishop', 'f161-leadworks', 'f161-mold', 'f161-furnace',
      'f161-company', 'f161-extraction'
    ]),
    route('f161-upper', 'gantries-and-morgue', [
      'f161-spawn', 'f161-eev', 'f161-infirmary', 'f161-morgue-high', 'f161-mess-high',
      'f161-service-high', 'f161-tunnel-high', 'f161-sprinkler', 'f161-furnace-high',
      'f161-furnace', 'f161-company', 'f161-extraction'
    ]),
    route('f161-maintenance', 'service-ducts', [
      'f161-spawn', 'f161-eev', 'f161-infirmary', 'f161-service-deep', 'f161-tunnel-low',
      'f161-leadworks', 'f161-furnace', 'f161-company', 'f161-extraction'
    ])
  ],
  zones: [
    zone('f161-coast', 'Côte et épave EEV', 0, 850, 'badlands',
      { far: 'storm-coast', mid: 'wreckage', foreground: 'rain-and-cables' },
      { tint: '#35322c', fog: 0.34, rain: 0.92 }),
    zone('f161-infirmary', 'Infirmerie / morgue', 850, 850, 'habitation',
      { far: 'stone-vault', mid: 'medical', foreground: 'pipes' },
      { tint: '#3c3a31', fog: 0.2 }),
    zone('f161-cellblock', 'Bloc carcéral', 1700, 1180, 'habitation',
      { far: 'cell-tiers', mid: 'iron-walkways', foreground: 'bars' },
      { tint: '#302b25', fog: 0.26 }),
    zone('f161-service', 'Galeries techniques', 2880, 920, 'industrial',
      { far: 'service-brick', mid: 'ducts', foreground: 'chains' },
      { tint: '#3b3329', fog: 0.36 }),
    zone('f161-leadworks', 'Fonderie / moule de plomb', 3800, 1380, 'reactor',
      { far: 'foundry-vats', mid: 'leadworks', foreground: 'steam' },
      { tint: '#5a3420', fog: 0.4 }),
    zone('f161-furnace', 'Four principal / plateforme', 5180, 1020, 'industrial',
      { far: 'furnace', mid: 'gantries', foreground: 'embers' },
      { tint: '#542c1c', fog: 0.3 })
  ],
  hazards: [
    { id: 'f161-hazard-storm', kind: 'darkness', zoneId: 'f161-coast', x: 520, y: 490, w: 180, h: 20, eventId: null },
    { id: 'f161-hazard-steam-a', kind: 'steam', zoneId: 'f161-service', x: 3240, y: 490, w: 150, h: 20, eventId: null },
    { id: 'f161-hazard-fire-a', kind: 'fire', zoneId: 'f161-leadworks', x: 4250, y: 490, w: 160, h: 20, eventId: 'f161-fire-maze' },
    { id: 'f161-hazard-steam-b', kind: 'steam', zoneId: 'f161-leadworks', x: 4710, y: 490, w: 130, h: 20, eventId: 'f161-leadworks-awake' }
  ],
  events: [
    {
      id: 'f161-arrival',
      trigger: { type: 'mission-start', zoneId: 'f161-coast' },
      actions: ['art:emergency']
    },
    {
      id: 'f161-first-contact',
      trigger: { type: 'enter-zone', zoneId: 'f161-cellblock' },
      actions: ['close:f161-cellblock-gate']
    },
    {
      id: 'f161-fire-maze',
      trigger: { type: 'interact-anchor', anchorId: 'power' },
      actions: ['activate:f161-hazard-fire-a', 'open:f161-leadworks-gate']
    },
    {
      id: 'f161-leadworks-awake',
      trigger: { type: 'enter-zone', zoneId: 'f161-leadworks' },
      actions: ['activate:f161-hazard-steam-b']
    }
  ],
  // One authored predator is spawned by the V88 runtime. Generic wave spawns
  // stay empty to preserve the film's single-Runner pressure curve.
  spawns: []
});

export const ALIEN3_ARCHIVE_WORLD_V88 = deepFreeze({
  name: 'Fiorina 161',
  atmosphere: 'breathable',
  danger: 9,
  biomes: ['storm-coast', 'penal-complex', 'leadworks', 'industrial-furnace'],
  archiveReconstruction: true
});

export const ALIEN3_PHASES_V88 = deepFreeze([
  'wreckage',
  'infirmary',
  'first-blood',
  'bishop',
  'trap-prep',
  'fire-maze',
  'leadworks',
  'molten-lead',
  'thermal-shock',
  'company',
  'finale'
]);

export const ALIEN3_CHAPTERS_V88 = deepFreeze([
  { id: 'wreckage', number: 1, title: 'LE CHOC', objective: 'Inspecter l’EEV et rejoindre le complexe.', codex: ['f161-location', 'sulaco-eev'] },
  { id: 'infirmary', number: 2, title: 'LES MORTS NE DORMENT PAS', objective: 'Examiner l’infirmerie et la morgue.', codex: ['f161-infirmary', 'queen-embryo'] },
  { id: 'first-blood', number: 3, title: 'LE DRAGON', objective: 'Échapper au premier assaut du Runner.', codex: ['runner-alien'] },
  { id: 'bishop', number: 4, title: 'UN VISAGE CONNU', objective: 'Récupérer les fragments de mémoire de Bishop.', codex: ['bishop-damaged'] },
  { id: 'trap-prep', number: 5, title: 'PAS DE FUSILS', objective: 'Rassembler trois charges incendiaires et préparer les accès.', codex: ['f161-no-weapons'] },
  { id: 'fire-maze', number: 6, title: 'DANS LE NOIR', objective: 'Déclencher le couloir de feu et gagner la fonderie.', codex: ['f161-fire-plan'] },
  { id: 'leadworks', number: 7, title: 'L’APPÂT', objective: 'Attirer le Runner dans le moule de la fonderie.', codex: ['f161-leadworks'] },
  { id: 'molten-lead', number: 8, title: 'LE PLOMB', objective: 'Déverser le plomb et atteindre la vanne d’extinction.', codex: ['molten-lead-trap'] },
  { id: 'thermal-shock', number: 9, title: 'CHOC THERMIQUE', objective: 'Arroser la créature surchauffée.', codex: ['thermal-shock'] },
  { id: 'company', number: 10, title: 'LA COMPAGNIE', objective: 'Atteindre la plateforme et refuser la récupération.', codex: ['company-retrieval'] },
  { id: 'finale', number: 11, title: 'DERNIÈRE DÉCISION', objective: 'Clore la reconstruction MIRE.', codex: ['f161-final-record'] }
]);

export const ALIEN3_CODEX_V88 = deepFreeze([
  { id: 'f161-location', title: 'FIORINA 161', category: 'LIEU', body: 'Ancienne installation carcérale et fonderie isolée. La reconstruction privilégie les volumes industriels, les passerelles, la vapeur et les accès de maintenance.' },
  { id: 'sulaco-eev', title: 'EEV / SULACO', category: 'ARCHIVE', body: 'Une capsule d’évacuation issue du Sulaco s’écrase sur Fiorina 161. Les données MIRE signalent des pertes dès l’arrivée et une contamination impossible à confirmer immédiatement.' },
  { id: 'f161-infirmary', title: 'INFIRMERIE 161', category: 'LIEU', body: 'Zone médicale sommaire du complexe, reliée à une morgue en hauteur. Les preuves biologiques y deviennent le premier fil conducteur de l’archive.' },
  { id: 'queen-embryo', title: 'EMBRYON ROYAL', category: 'XÉNOBIOLOGIE', body: 'La reconstruction traite la présence d’un embryon royal comme un enjeu narratif distinct du Runner. Il ne devient pas une seconde créature combattue dans le niveau.' },
  { id: 'runner-alien', title: 'RUNNER / DRAGON', category: 'XÉNOBIOLOGIE', body: 'Quadrupède XX121 extrêmement mobile, construit ici comme prédateur unique : poursuite, embuscade, vitesse élevée et résistance aux dégâts conventionnels.' },
  { id: 'bishop-damaged', title: 'BISHOP — UNITÉ ENDOMMAGÉE', category: 'SYNTHÉTIQUE', body: 'Les fragments de mémoire récupérés servent de preuve d’archive et débloquent la suite de la reconstitution sans créer une copie dialoguée du film.' },
  { id: 'f161-no-weapons', title: 'DOCTRINE SANS ARMES', category: 'GAMEPLAY', body: 'La prison ne fournit pas d’arsenal militaire. Le bouton de tir devient un outil de distraction par flare pendant cette Chronique.' },
  { id: 'f161-fire-plan', title: 'PLAN INCENDIAIRE', category: 'TACTIQUE', body: 'Les prisonniers transforment les galeries en piège de circulation. Le feu est un outil de canalisation, pas une arme capable d’abattre le Runner.' },
  { id: 'f161-leadworks', title: 'FONDERIE DE PLOMB', category: 'LIEU', body: 'Le cœur industriel de Fiorina 161 fournit un moule, du métal en fusion, des passerelles et le système d’extinction nécessaire au piège final.' },
  { id: 'molten-lead-trap', title: 'PIÈGE AU PLOMB', category: 'TACTIQUE', body: 'Le métal en fusion rend la créature temporairement vulnérable au choc thermique. L’action exige que le Runner soit effectivement dans la zone du moule.' },
  { id: 'thermal-shock', title: 'CHOC THERMIQUE', category: 'TACTIQUE', body: 'La vanne d’extinction termine la séquence du boss seulement après application du plomb. L’ordre des deux actions est vérifié par le runtime.' },
  { id: 'company-retrieval', title: 'ÉQUIPE DE RÉCUPÉRATION', category: 'FACTION', body: 'La fin de l’archive met en scène une équipe corporative cherchant à récupérer l’actif biologique. La route canonique de la Chronique refuse cette extraction.' },
  { id: 'f161-final-record', title: 'ENREGISTREMENT FINAL 161', category: 'MIRE', body: 'Clôture de la reconstitution : créature neutralisée, récupération biologique refusée et archive scellée. Le score de synchronisation résume la fidélité comportementale du run.' }
]);

export const ALIEN3_CAST_V88 = deepFreeze([
  { id: 'ripley', name: 'E. Ripley', role: 'survivante / sujet MIRE', x: 180, y: 422, status: 'active' },
  { id: 'dillon', name: 'Dillon', role: 'prisonnier / meneur', x: 4020, y: 422, status: 'active' },
  { id: 'clemens', name: 'Clemens', role: 'médecin', x: 1240, y: 422, status: 'active' },
  { id: 'andrews', name: 'Andrews', role: 'superviseur', x: 2100, y: 422, status: 'active' },
  { id: 'aaron', name: 'Aaron', role: 'administration', x: 5580, y: 422, status: 'active' },
  { id: 'morse', name: 'Morse', role: 'prisonnier', x: 5220, y: 422, status: 'active' },
  { id: 'bishop', name: 'Bishop', role: 'synthétique endommagé', x: 3500, y: 448, status: 'disabled' }
]);

const boolean = (value, fallback = false) => typeof value === 'boolean' ? value : fallback;
const number = (value, fallback, min, max) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
};
const uniqueIds = (value, allowed) => Array.isArray(value)
  ? [...new Set(value.filter((entry) => allowed.has(entry)))].slice(0, 64)
  : [];

export function createAlien3StateV88() {
  return {
    schema: ALIEN3_DLC_SCHEMA_V88,
    operationId: ALIEN3_OPERATION_ID_V88,
    campaignId: ALIEN3_CAMPAIGN_ID_V88,
    phase: ALIEN3_PHASES_V88[0],
    chapterIndex: 0,
    complete: false,
    failed: false,
    synchronization: 100,
    phaseClock: 0,
    totalClock: 0,
    flares: 0,
    flareCooldown: 0,
    caches: { infirmary: false, cellblock: false, service: false },
    crashRecorderRead: false,
    autopsyComplete: false,
    bishopRecovered: false,
    fireMazeArmed: false,
    fireMazeIgnited: false,
    moltenLeadApplied: false,
    thermalShockApplied: false,
    runnerDefeated: false,
    companyRefused: false,
    finaleCommitted: false,
    runner: {
      id: null,
      active: false,
      encounterCount: 0,
      trapDamageApplied: false,
      thermalKillConfirmed: false
    },
    survivors: {
      dillon: true,
      clemens: true,
      andrews: true,
      aaron: true,
      morse: true
    },
    codexUnlocked: ['f161-location'],
    codexViewed: [],
    currentCodexId: null,
    checkpointPhase: 'wreckage'
  };
}

export function sanitizeAlien3StateV88(raw) {
  const fallback = createAlien3StateV88();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Number(raw.schema) !== ALIEN3_DLC_SCHEMA_V88) return fallback;
  const phase = ALIEN3_PHASES_V88.includes(raw.phase) ? raw.phase : fallback.phase;
  const chapterIndex = Math.max(0, ALIEN3_PHASES_V88.indexOf(phase));
  const codexIds = new Set(ALIEN3_CODEX_V88.map((entry) => entry.id));
  const sourceCaches = raw.caches && typeof raw.caches === 'object' ? raw.caches : {};
  const sourceRunner = raw.runner && typeof raw.runner === 'object' ? raw.runner : {};
  const sourceSurvivors = raw.survivors && typeof raw.survivors === 'object' ? raw.survivors : {};
  return {
    ...fallback,
    phase,
    chapterIndex,
    complete: boolean(raw.complete),
    failed: boolean(raw.failed),
    synchronization: number(raw.synchronization, 100, 0, 100),
    phaseClock: number(raw.phaseClock, 0, 0, 36000),
    totalClock: number(raw.totalClock, 0, 0, 360000),
    flares: Math.round(number(raw.flares, 0, 0, 12)),
    flareCooldown: number(raw.flareCooldown, 0, 0, 12),
    caches: {
      infirmary: boolean(sourceCaches.infirmary),
      cellblock: boolean(sourceCaches.cellblock),
      service: boolean(sourceCaches.service)
    },
    crashRecorderRead: boolean(raw.crashRecorderRead),
    autopsyComplete: boolean(raw.autopsyComplete),
    bishopRecovered: boolean(raw.bishopRecovered),
    fireMazeArmed: boolean(raw.fireMazeArmed),
    fireMazeIgnited: boolean(raw.fireMazeIgnited),
    moltenLeadApplied: boolean(raw.moltenLeadApplied),
    thermalShockApplied: boolean(raw.thermalShockApplied),
    runnerDefeated: boolean(raw.runnerDefeated),
    companyRefused: boolean(raw.companyRefused),
    finaleCommitted: boolean(raw.finaleCommitted),
    runner: {
      ...fallback.runner,
      id: typeof sourceRunner.id === 'string' ? sourceRunner.id.slice(0, 128) : null,
      active: boolean(sourceRunner.active),
      encounterCount: Math.round(number(sourceRunner.encounterCount, 0, 0, 20)),
      trapDamageApplied: boolean(sourceRunner.trapDamageApplied),
      thermalKillConfirmed: boolean(sourceRunner.thermalKillConfirmed)
    },
    survivors: Object.fromEntries(Object.keys(fallback.survivors).map((id) => [id, boolean(sourceSurvivors[id], fallback.survivors[id])])),
    codexUnlocked: uniqueIds(raw.codexUnlocked, codexIds),
    codexViewed: uniqueIds(raw.codexViewed, codexIds),
    currentCodexId: codexIds.has(raw.currentCodexId) ? raw.currentCodexId : null,
    checkpointPhase: ALIEN3_PHASES_V88.includes(raw.checkpointPhase) ? raw.checkpointPhase : phase
  };
}

export function alien3ChapterV88(phase) {
  return ALIEN3_CHAPTERS_V88.find((entry) => entry.id === phase) || ALIEN3_CHAPTERS_V88[0];
}

export function alien3CodexEntryV88(id) {
  return ALIEN3_CODEX_V88.find((entry) => entry.id === id) || null;
}

export function validateAlien3DlcV88() {
  const failures = [];
  const nodes = ALIEN3_FIORINA_TEMPLATE_V88.nodes;
  const edges = ALIEN3_FIORINA_TEMPLATE_V88.edges;
  const routes = ALIEN3_FIORINA_TEMPLATE_V88.routes;
  const zones = ALIEN3_FIORINA_TEMPLATE_V88.zones;
  const nodeIds = new Set(nodes.map((entry) => entry.id));
  const routeIds = new Set(routes.map((entry) => entry.id));
  const zoneIds = new Set(zones.map((entry) => entry.id));
  const edgePairs = new Set(edges.flatMap((entry) => [`${entry.from}>${entry.to}`, `${entry.to}>${entry.from}`]));
  const spawnId = nodes.find((entry) => entry.anchor === 'spawn')?.id;
  const extractionId = nodes.find((entry) => entry.anchor === 'extraction')?.id;
  if (ALIEN3_FIORINA_TEMPLATE_V88.id !== ALIEN3_TEMPLATE_ID_V88) failures.push('template id mismatch');
  if (routes.length < 3) failures.push('fewer than three authored routes');
  if (new Set(routes.map((entry) => entry.nodeIds.join('>'))).size !== routes.length) failures.push('duplicate route geometry');
  for (const entry of nodes) {
    const zone = zones.find((candidate) => candidate.id === entry.zoneId);
    if (!zoneIds.has(entry.zoneId)) failures.push(`unknown zone ${entry.zoneId} on ${entry.id}`);
    else if (entry.x < zone.x - 32 || entry.x > zone.x + zone.w + 32) failures.push(`node outside zone: ${entry.id}`);
  }
  for (const entry of edges) {
    if (!nodeIds.has(entry.from) || !nodeIds.has(entry.to)) failures.push(`edge endpoint missing: ${entry.id}`);
    for (const id of entry.routeIds) if (!routeIds.has(id)) failures.push(`unknown route ${id} on ${entry.id}`);
  }
  for (const routeEntry of routes) {
    if (routeEntry.nodeIds[0] !== spawnId || routeEntry.nodeIds.at(-1) !== extractionId) failures.push(`route endpoints invalid: ${routeEntry.id}`);
    for (let index = 1; index < routeEntry.nodeIds.length; index += 1) {
      const pair = `${routeEntry.nodeIds[index - 1]}>${routeEntry.nodeIds[index]}`;
      if (!edgePairs.has(pair)) failures.push(`broken route segment ${routeEntry.id}: ${pair}`);
    }
  }
  if (!spawnId) failures.push('spawn anchor missing');
  if (!extractionId) failures.push('extraction anchor missing');
  if (!nodes.some((entry) => entry.anchor === 'objective-primary')) failures.push('objective anchor missing');
  if (new Set(ALIEN3_CODEX_V88.map((entry) => entry.id)).size !== ALIEN3_CODEX_V88.length) failures.push('duplicate codex ids');
  if (new Set(ALIEN3_PHASES_V88).size !== ALIEN3_PHASES_V88.length) failures.push('duplicate phases');
  return Object.freeze({
    ok: failures.length === 0,
    failures: Object.freeze(failures),
    counts: Object.freeze({
      phases: ALIEN3_PHASES_V88.length,
      chapters: ALIEN3_CHAPTERS_V88.length,
      codex: ALIEN3_CODEX_V88.length,
      nodes: ALIEN3_FIORINA_TEMPLATE_V88.nodes.length,
      edges: ALIEN3_FIORINA_TEMPLATE_V88.edges.length,
      routes: ALIEN3_FIORINA_TEMPLATE_V88.routes.length,
      zones: ALIEN3_FIORINA_TEMPLATE_V88.zones.length
    })
  });
}
