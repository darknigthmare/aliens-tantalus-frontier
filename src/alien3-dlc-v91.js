import {
  ALIEN3_CAMPAIGN_ID_V90,
  ALIEN3_DLC_SCHEMA_V90,
  ALIEN3_FIORINA_PALETTE_V90,
  ALIEN3_FIORINA_TEMPLATE_V90,
  ALIEN3_OPERATION_ID_V90,
  ALIEN3_TEMPLATE_ID_V90
} from './alien3-dlc-v90.js';

export const ALIEN3_DLC_SCHEMA_V91 = 91;
export const ALIEN3_OPERATION_ID_V91 = ALIEN3_OPERATION_ID_V90;
export const ALIEN3_CAMPAIGN_ID_V91 = ALIEN3_CAMPAIGN_ID_V90;
export const ALIEN3_TEMPLATE_ID_V91 = ALIEN3_TEMPLATE_ID_V90;

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const bool = (value, fallback = false) => typeof value === 'boolean' ? value : fallback;
const boundedText = (value, fallback = '', max = 128) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
const unique = (value, allowed, max = 256) => Array.isArray(value)
  ? [...new Set(value.filter((entry) => allowed.has(entry)))].slice(0, max)
  : [];

export const ALIEN3_FIORINA_PALETTE_V91 = deepFreeze({
  ...clone(ALIEN3_FIORINA_PALETTE_V90),
  id: 'fiorina-161-living-archive-v91',
  light: 0.295,
  prop: 'penal-foundry-living-archive'
});

/**
 * V91 does not add another fake end-to-end route. It densifies the existing
 * prison/foundry topology with physical historical beats and chase machinery.
 */
const template = clone(ALIEN3_FIORINA_TEMPLATE_V90);
template.label = 'Fiorina 161 · archive vivante V91';
template.nodes.push(
  { id: 'f161-clemens-bed', x: 1380, y: 510, zoneId: 'f161-infirmary', anchor: null, width: 180 },
  { id: 'f161-funeral-walk', x: 1580, y: 510, zoneId: 'f161-infirmary', anchor: null, width: 180 },
  { id: 'f161-mess-ceiling', x: 2470, y: 350, zoneId: 'f161-cellblock', anchor: null, width: 190 },
  { id: 'f161-comms-high', x: 2720, y: 350, zoneId: 'f161-cellblock', anchor: null, width: 180 },
  { id: 'f161-fan-shaft', x: 2940, y: 330, zoneId: 'f161-service', anchor: null, width: 170 },
  { id: 'f161-tunnel-shrine', x: 3420, y: 630, zoneId: 'f161-service', anchor: null, width: 210 },
  { id: 'f161-piston-a-node', x: 4480, y: 510, zoneId: 'f161-leadworks', anchor: null, width: 180 },
  { id: 'f161-piston-b-node', x: 4820, y: 330, zoneId: 'f161-leadworks', anchor: null, width: 180 },
  { id: 'f161-piston-c-node', x: 5140, y: 510, zoneId: 'f161-leadworks', anchor: null, width: 180 },
  { id: 'f161-patna-cage-node', x: 5930, y: 510, zoneId: 'f161-furnace', anchor: null, width: 160 }
);
template.edges.push(
  { id: 'f161-e46', from: 'f161-infirmary', to: 'f161-clemens-bed', kind: 'walk', routeIds: [] },
  { id: 'f161-e47', from: 'f161-clemens-bed', to: 'f161-funeral-walk', kind: 'walk', routeIds: [] },
  { id: 'f161-e48', from: 'f161-funeral-walk', to: 'f161-morgue-high', kind: 'ladder', routeIds: [] },
  { id: 'f161-e49', from: 'f161-mess-high', to: 'f161-mess-ceiling', kind: 'walk', routeIds: [] },
  { id: 'f161-e50', from: 'f161-mess-ceiling', to: 'f161-comms-high', kind: 'walk', routeIds: [] },
  { id: 'f161-e51', from: 'f161-service-high', to: 'f161-fan-shaft', kind: 'walk', routeIds: [] },
  { id: 'f161-e52', from: 'f161-service-deep', to: 'f161-tunnel-shrine', kind: 'walk', routeIds: [] },
  { id: 'f161-e53', from: 'f161-tunnel-shrine', to: 'f161-bishop', kind: 'ladder', routeIds: [] },
  { id: 'f161-e54', from: 'f161-leadworks', to: 'f161-piston-a-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e55', from: 'f161-piston-a-node', to: 'f161-mold', kind: 'walk', routeIds: [] },
  { id: 'f161-e56', from: 'f161-sprinkler', to: 'f161-piston-b-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e57', from: 'f161-piston-b-node', to: 'f161-mold', kind: 'ladder', routeIds: [] },
  { id: 'f161-e58', from: 'f161-mold', to: 'f161-piston-c-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e59', from: 'f161-piston-c-node', to: 'f161-furnace', kind: 'walk', routeIds: [] },
  { id: 'f161-e60', from: 'f161-company', to: 'f161-patna-cage-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e61', from: 'f161-patna-cage-node', to: 'f161-extraction', kind: 'walk', routeIds: [] }
);

export const ALIEN3_FIORINA_TEMPLATE_V91 = deepFreeze(template);

export const ALIEN3_CODEX_V91 = deepFreeze([
  { id: 'f161-funeral-rite', title: 'RITE FUNÉRAIRE 161', category: 'PERSONNEL', body: 'La reconstruction matérialise le rassemblement funéraire autour du four comme un moment de mémoire collective avant l’escalade de la chasse.' },
  { id: 'f161-murphy-fan', title: 'MURPHY — PUITS DE VENTILATION', category: 'PERSONNEL', body: 'Le secteur de ventilation conserve les traces de la première victime reconnue dans les galeries, sans transformer cette scène en combat supplémentaire.' },
  { id: 'f161-tunnel-expedition', title: 'BOGGS / RAINS / GOLIC', category: 'PERSONNEL', body: 'L’expédition dans le réseau inférieur devient une scène d’enquête physique : deux disparitions et un survivant traumatisé qui réapparaît dans le complexe.' },
  { id: 'f161-clemens-incident', title: 'CLEMENS — INFIRMERIE', category: 'PERSONNEL', body: 'L’attaque de l’infirmerie est enregistrée comme un beat historique distinct : perte du médecin, rupture de la sécurité et confirmation de la mobilité du Runner.' },
  { id: 'f161-andrews-incident', title: 'ANDREWS — RÉFECTOIRE', category: 'PERSONNEL', body: 'L’archive suit la disparition d’Andrews par les structures supérieures du réfectoire, ce qui force le groupe à accepter que le complexe n’offre plus de zone sûre.' },
  { id: 'f161-company-message', title: 'DIRECTIVE DE LA COMPAGNIE', category: 'FACTION', body: 'Dans la branche Assembly, le message reçu après le confinement interdit la destruction de la créature. V91 impose ce beat avant la libération par Golic.' },
  { id: 'f161-golic-escape-chain', title: 'GOLIC — CHAÎNE DE LIBÉRATION', category: 'PERSONNEL', body: 'La libération du Runner est désormais causalement reliée au confinement, au message de la Compagnie puis à l’évasion de Golic, plutôt qu’à un simple compte à rebours.' },
  { id: 'f161-piston-maze', title: 'PISTONS DE LA FONDERIE', category: 'TACTIQUE', body: 'Trois commandes industrielles doivent être cyclées dans l’ordre pour ouvrir le corridor de rabattement. Le moule reste verrouillé tant que le corridor n’est pas prêt.' },
  { id: 'f161-patna-cage', title: 'CAGE PATNA', category: 'FACTION', body: 'L’équipe de récupération arrive avec du matériel de confinement. La cage visible confirme que l’objectif déclaré de la mission corporative est la capture, pas une simple évacuation.' },
  { id: 'f161-bishop-two', title: 'BISHOP II — IDENTITÉ HUMAINE', category: 'PERSONNEL', body: 'La confrontation finale distingue le représentant humain de la Compagnie de l’unité synthétique Bishop endommagée plus tôt dans l’archive.' },
  { id: 'f161-aaron-last-stand', title: 'AARON — DERNIER REFUS', category: 'PERSONNEL', body: 'Aaron cesse d’obéir à la chaîne administrative et s’oppose physiquement à l’équipe de récupération pendant la fermeture de l’archive.' },
  { id: 'f161-morse-custody', title: 'MORSE — SURVIVANT EN CUSTODIE', category: 'PERSONNEL', body: 'Morse demeure le témoin survivant de la fonderie. V91 conserve sa blessure et sa capture comme état distinct de la disparition de Ripley.' },
  { id: 'f161-runner-heatmap', title: 'CARTE DE PRESSION DU RUNNER', category: 'GAMEPLAY', body: 'Le directeur V91 mémorise bruit, zones répétées et positions récentes pour préparer des interceptions hors champ sans créer de second xénomorphe.' }
]);

export const ALIEN3_V91_EVIDENCE_IDS = deepFreeze([
  'funeral-rite', 'murphy-fan', 'tunnel-expedition', 'clemens-incident', 'andrews-incident',
  'company-message', 'golic-escape-chain', 'piston-maze', 'patna-cage', 'bishop-two',
  'aaron-last-stand', 'morse-custody', 'runner-heatmap'
]);

export const ALIEN3_FOUNDRY_PISTONS_V91 = deepFreeze([
  { id: 'f161-piston-a', order: 0, label: 'PISTON A · DÉRIVATION', x: 4480, y: 430, w: 74, h: 80 },
  { id: 'f161-piston-b', order: 1, label: 'PISTON B · SAS HAUT', x: 4820, y: 250, w: 74, h: 80 },
  { id: 'f161-piston-c', order: 2, label: 'PISTON C · ENTONNOIR', x: 5140, y: 430, w: 74, h: 80 }
]);

export const ALIEN3_V91_STATIONS = deepFreeze([
  { id: 'f161-funeral-marker', kind: 'beat', evidenceId: 'funeral-rite', codexId: 'f161-funeral-rite', phases: ['infirmary'], x: 1560, y: 438, w: 72, h: 72, label: 'MÉMORIAL DU FOUR' },
  { id: 'f161-clemens-marker', kind: 'beat', evidenceId: 'clemens-incident', codexId: 'f161-clemens-incident', phases: ['first-blood'], x: 1360, y: 438, w: 72, h: 72, label: 'TRACE MÉDICALE CLEMENS' },
  { id: 'f161-murphy-fan-marker', kind: 'beat', evidenceId: 'murphy-fan', codexId: 'f161-murphy-fan', phases: ['first-blood', 'bishop'], x: 2940, y: 258, w: 72, h: 72, label: 'PUITS DE VENTILATION' },
  { id: 'f161-tunnel-expedition-marker', kind: 'beat', evidenceId: 'tunnel-expedition', codexId: 'f161-tunnel-expedition', phases: ['first-blood', 'bishop'], x: 3390, y: 558, w: 76, h: 72, label: 'BALISE BOGGS / RAINS' },
  { id: 'f161-andrews-marker', kind: 'beat', evidenceId: 'andrews-incident', codexId: 'f161-andrews-incident', phases: ['first-blood', 'bishop'], x: 2440, y: 278, w: 72, h: 72, label: 'BRÈCHE DU RÉFECTOIRE' },
  { id: 'f161-company-message-console', kind: 'company-message', x: 2700, y: 278, w: 76, h: 72, label: 'TRANSMISSION À LA COMPAGNIE' },
  { id: 'f161-dillon-rally', kind: 'rally', x: 2320, y: 438, w: 74, h: 72, label: 'RALLIER LES DÉTENUS' },
  ...ALIEN3_FOUNDRY_PISTONS_V91.map((entry) => ({ ...entry, kind: 'piston' })),
  { id: 'f161-patna-cage', kind: 'beat', evidenceId: 'patna-cage', codexId: 'f161-patna-cage', phases: ['company'], x: 5900, y: 438, w: 68, h: 72, label: 'CAGE DE CONFINEMENT PATNA' },
  { id: 'f161-bishop-two-marker', kind: 'beat', evidenceId: 'bishop-two', codexId: 'f161-bishop-two', phases: ['company', 'finale'], x: 5790, y: 438, w: 68, h: 72, label: 'DOSSIER BISHOP II' },
  { id: 'f161-morse-custody-marker', kind: 'beat', evidenceId: 'morse-custody', codexId: 'f161-morse-custody', phases: ['finale'], x: 5890, y: 438, w: 68, h: 72, label: 'ORDRE DE CUSTODIE MORSE' }
]);

export const ALIEN3_V91_BEAT_ORDER = deepFreeze([
  'funeral-rite', 'clemens-incident', 'murphy-fan', 'tunnel-expedition', 'andrews-incident',
  'company-message', 'golic-escape-chain', 'piston-maze', 'patna-cage', 'bishop-two',
  'aaron-last-stand', 'morse-custody', 'runner-heatmap'
]);

const codexIds = new Set(ALIEN3_CODEX_V91.map((entry) => entry.id));
const evidenceIds = new Set(ALIEN3_V91_EVIDENCE_IDS);
const pistonIds = new Set(ALIEN3_FOUNDRY_PISTONS_V91.map((entry) => entry.id));
const pressureTiers = new Set(['quiet', 'alert', 'hunt', 'intercept']);

export function createAlien3StateV91() {
  return {
    schema: ALIEN3_DLC_SCHEMA_V91,
    operationId: ALIEN3_OPERATION_ID_V91,
    codexUnlocked: [],
    codexViewed: [],
    currentCodexId: null,
    evidenceRecovered: [],
    historicalBeats: Object.fromEntries(ALIEN3_V91_BEAT_ORDER.map((id) => [id, false])),
    companyDirective: {
      messageSent: false,
      destructionDenied: false,
      golicChainArmed: false,
      cageInspected: false
    },
    foundryChase: {
      pistons: Object.fromEntries([...pistonIds].map((id) => [id, false])),
      sequenceIndex: 0,
      ready: false,
      wrongOrder: 0,
      funnelPressure: 0,
      runnerFunnelConfirmed: false
    },
    hunter: {
      heat: 0,
      heatPeak: 0,
      pressureTier: 'quiet',
      predictions: 0,
      shadowPasses: 0,
      lastNoiseX: 0,
      lastPlayerX: 180,
      interceptCooldown: 0,
      hiddenClock: 0,
      zoneHeat: {},
      lastInterceptAnchorId: null
    },
    prisonerAI: {
      rallyCount: 0,
      panicPeak: 0,
      assignedCount: 0,
      movingCount: 0,
      rescueCount: 0,
      chaseTeamsActive: false
    },
    company: {
      bishopTwoConfirmed: false,
      aaronLastStand: false,
      morseCustody: false
    },
    presentation: {
      cardClock: 0,
      title: '',
      subtitle: '',
      beatId: null
    },
    stats: {
      beatInteractions: 0,
      pistonActions: 0,
      predictiveAmbushes: 0,
      shadowPasses: 0,
      companyInspections: 0
    },
    achievementIds: []
  };
}

export function sanitizeAlien3StateV91(raw) {
  const fallback = createAlien3StateV91();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Number(raw.schema) !== ALIEN3_DLC_SCHEMA_V91) return fallback;
  const beats = raw.historicalBeats && typeof raw.historicalBeats === 'object' ? raw.historicalBeats : {};
  const directive = raw.companyDirective && typeof raw.companyDirective === 'object' ? raw.companyDirective : {};
  const chase = raw.foundryChase && typeof raw.foundryChase === 'object' ? raw.foundryChase : {};
  const hunter = raw.hunter && typeof raw.hunter === 'object' ? raw.hunter : {};
  const prisoners = raw.prisonerAI && typeof raw.prisonerAI === 'object' ? raw.prisonerAI : {};
  const company = raw.company && typeof raw.company === 'object' ? raw.company : {};
  const presentation = raw.presentation && typeof raw.presentation === 'object' ? raw.presentation : {};
  const stats = raw.stats && typeof raw.stats === 'object' ? raw.stats : {};
  const pistons = chase.pistons && typeof chase.pistons === 'object' ? chase.pistons : {};
  const zoneHeat = hunter.zoneHeat && typeof hunter.zoneHeat === 'object' ? hunter.zoneHeat : {};
  return {
    ...fallback,
    codexUnlocked: unique(raw.codexUnlocked, codexIds),
    codexViewed: unique(raw.codexViewed, codexIds),
    currentCodexId: codexIds.has(raw.currentCodexId) ? raw.currentCodexId : null,
    evidenceRecovered: unique(raw.evidenceRecovered, evidenceIds),
    historicalBeats: Object.fromEntries(ALIEN3_V91_BEAT_ORDER.map((id) => [id, bool(beats[id])])),
    companyDirective: {
      messageSent: bool(directive.messageSent),
      destructionDenied: bool(directive.destructionDenied),
      golicChainArmed: bool(directive.golicChainArmed),
      cageInspected: bool(directive.cageInspected)
    },
    foundryChase: {
      pistons: Object.fromEntries([...pistonIds].map((id) => [id, bool(pistons[id])])),
      sequenceIndex: Math.round(clamp(chase.sequenceIndex, 0, ALIEN3_FOUNDRY_PISTONS_V91.length)),
      ready: bool(chase.ready),
      wrongOrder: Math.round(clamp(chase.wrongOrder, 0, 99)),
      funnelPressure: clamp(chase.funnelPressure, 0, 100),
      runnerFunnelConfirmed: bool(chase.runnerFunnelConfirmed)
    },
    hunter: {
      heat: clamp(hunter.heat, 0, 100),
      heatPeak: clamp(hunter.heatPeak, 0, 100),
      pressureTier: pressureTiers.has(hunter.pressureTier) ? hunter.pressureTier : 'quiet',
      predictions: Math.round(clamp(hunter.predictions, 0, 999)),
      shadowPasses: Math.round(clamp(hunter.shadowPasses, 0, 999)),
      lastNoiseX: clamp(hunter.lastNoiseX, 0, 6200),
      lastPlayerX: clamp(hunter.lastPlayerX, 0, 6200),
      interceptCooldown: clamp(hunter.interceptCooldown, 0, 60),
      hiddenClock: clamp(hunter.hiddenClock, 0, 9999),
      zoneHeat: Object.fromEntries(Object.entries(zoneHeat).slice(0, 32).map(([key, value]) => [boundedText(key, 'zone', 80), clamp(value, 0, 100)])),
      lastInterceptAnchorId: boundedText(hunter.lastInterceptAnchorId, '', 80) || null
    },
    prisonerAI: {
      rallyCount: Math.round(clamp(prisoners.rallyCount, 0, 99)),
      panicPeak: clamp(prisoners.panicPeak, 0, 100),
      assignedCount: Math.round(clamp(prisoners.assignedCount, 0, 32)),
      movingCount: Math.round(clamp(prisoners.movingCount, 0, 32)),
      rescueCount: Math.round(clamp(prisoners.rescueCount, 0, 99)),
      chaseTeamsActive: bool(prisoners.chaseTeamsActive)
    },
    company: {
      bishopTwoConfirmed: bool(company.bishopTwoConfirmed),
      aaronLastStand: bool(company.aaronLastStand),
      morseCustody: bool(company.morseCustody)
    },
    presentation: {
      cardClock: clamp(presentation.cardClock, 0, 12),
      title: boundedText(presentation.title, '', 100),
      subtitle: boundedText(presentation.subtitle, '', 220),
      beatId: boundedText(presentation.beatId, '', 100) || null
    },
    stats: {
      beatInteractions: Math.round(clamp(stats.beatInteractions, 0, 999)),
      pistonActions: Math.round(clamp(stats.pistonActions, 0, 99)),
      predictiveAmbushes: Math.round(clamp(stats.predictiveAmbushes, 0, 999)),
      shadowPasses: Math.round(clamp(stats.shadowPasses, 0, 999)),
      companyInspections: Math.round(clamp(stats.companyInspections, 0, 99))
    },
    achievementIds: Array.isArray(raw.achievementIds)
      ? [...new Set(raw.achievementIds.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 80)))].slice(0, 64)
      : []
  };
}

export function alien3V91CodexEntry(id) {
  return ALIEN3_CODEX_V91.find((entry) => entry.id === id) || null;
}

export function alien3V91Grade({ gradeV90 = 'D', evidence = 0, totalEvidence = ALIEN3_V91_EVIDENCE_IDS.length, wrongOrder = 0, predictiveAmbushes = 0 } = {}) {
  const base = { 'S+': 96, S: 92, A: 84, B: 74, C: 62, D: 50 }[gradeV90] || 50;
  const evidenceScore = totalEvidence > 0 ? clamp(evidence / totalEvidence, 0, 1) * 8 : 0;
  const discipline = Math.max(0, 3 - Math.min(3, Number(wrongOrder) || 0));
  const hunterBonus = Math.min(2, Number(predictiveAmbushes) * 0.35);
  const score = base + evidenceScore + discipline + hunterBonus;
  return score >= 104 ? 'S++' : score >= 99 ? 'S+' : score >= 93 ? 'S' : score >= 85 ? 'A' : score >= 74 ? 'B' : score >= 62 ? 'C' : 'D';
}

export function validateAlien3DlcV91() {
  const failures = [];
  const nodes = ALIEN3_FIORINA_TEMPLATE_V91.nodes;
  const edges = ALIEN3_FIORINA_TEMPLATE_V91.edges;
  const routes = ALIEN3_FIORINA_TEMPLATE_V91.routes;
  const zones = ALIEN3_FIORINA_TEMPLATE_V91.zones;
  const nodeIds = new Set(nodes.map((entry) => entry.id));
  const zoneMap = new Map(zones.map((entry) => [entry.id, entry]));
  const edgePairs = new Set(edges.flatMap((entry) => [`${entry.from}>${entry.to}`, `${entry.to}>${entry.from}`]));
  const adjacency = new Map(nodes.map((entry) => [entry.id, []]));
  for (const edge of edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) failures.push(`missing edge endpoint ${edge.id}`);
    adjacency.get(edge.from)?.push(edge.to);
    adjacency.get(edge.to)?.push(edge.from);
  }
  if (ALIEN3_FIORINA_TEMPLATE_V91.id !== ALIEN3_TEMPLATE_ID_V91) failures.push('template id mismatch');
  if (routes.length !== 4) failures.push(`route count changed: ${routes.length}`);
  if (new Set(nodes.map((entry) => entry.id)).size !== nodes.length) failures.push('duplicate node ids');
  if (new Set(edges.map((entry) => entry.id)).size !== edges.length) failures.push('duplicate edge ids');
  for (const entry of nodes) {
    const zone = zoneMap.get(entry.zoneId);
    if (!zone) failures.push(`unknown zone ${entry.zoneId}`);
    else if (entry.x < zone.x - 32 || entry.x > zone.x + zone.w + 32) failures.push(`node outside zone ${entry.id}`);
  }
  for (const route of routes) {
    for (let index = 1; index < route.nodeIds.length; index += 1) {
      if (!edgePairs.has(`${route.nodeIds[index - 1]}>${route.nodeIds[index]}`)) failures.push(`broken route ${route.id}`);
    }
  }
  const spawn = nodes.find((entry) => entry.anchor === 'spawn')?.id;
  const reached = new Set(spawn ? [spawn] : []);
  const queue = [...reached];
  while (queue.length) {
    const current = queue.shift();
    for (const next of adjacency.get(current) || []) if (!reached.has(next)) { reached.add(next); queue.push(next); }
  }
  if (reached.size !== nodes.length) failures.push(`graph disconnected ${reached.size}/${nodes.length}`);
  if (new Set(ALIEN3_CODEX_V91.map((entry) => entry.id)).size !== ALIEN3_CODEX_V91.length) failures.push('duplicate V91 codex ids');
  if (new Set(ALIEN3_V91_EVIDENCE_IDS).size !== ALIEN3_V91_EVIDENCE_IDS.length) failures.push('duplicate V91 evidence ids');
  if (ALIEN3_FOUNDRY_PISTONS_V91.length !== 3) failures.push('foundry piston sequence incomplete');
  return deepFreeze({
    ok: failures.length === 0,
    failures,
    counts: {
      nodes: nodes.length,
      edges: edges.length,
      routes: routes.length,
      zones: zones.length,
      codexV91: ALIEN3_CODEX_V91.length,
      evidence: ALIEN3_V91_EVIDENCE_IDS.length,
      pistons: ALIEN3_FOUNDRY_PISTONS_V91.length,
      inheritedSchema: ALIEN3_DLC_SCHEMA_V90
    }
  });
}
