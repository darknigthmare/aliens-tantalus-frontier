import {
  ALIEN3_CAMPAIGN_ID_V92,
  ALIEN3_DLC_SCHEMA_V92,
  ALIEN3_FIORINA_PALETTE_V92,
  ALIEN3_FIORINA_TEMPLATE_V92,
  ALIEN3_OPERATION_ID_V92,
  ALIEN3_TEMPLATE_ID_V92
} from './alien3-dlc-v92.js';

export const ALIEN3_DLC_SCHEMA_V93 = 93;
export const ALIEN3_OPERATION_ID_V93 = ALIEN3_OPERATION_ID_V92;
export const ALIEN3_CAMPAIGN_ID_V93 = ALIEN3_CAMPAIGN_ID_V92;
export const ALIEN3_TEMPLATE_ID_V93 = ALIEN3_TEMPLATE_ID_V92;

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const bool = (value, fallback = false) => typeof value === 'boolean' ? value : fallback;
const boundedText = (value, fallback = '', max = 160) => typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : fallback;
const unique = (value, allowed, max = 256) => Array.isArray(value)
  ? [...new Set(value.filter((entry) => allowed.has(entry)))].slice(0, max)
  : [];

export const ALIEN3_FIORINA_PALETTE_V93 = deepFreeze({
  ...clone(ALIEN3_FIORINA_PALETTE_V92),
  id: 'fiorina-161-living-cast-v93',
  light: 0.275,
  prop: 'penal-foundry-living-cast'
});

// V93 continues to densify the four authored routes rather than inventing a
// fifth end-to-end lane. New spaces are perches, triage and final-act staging.
const template = clone(ALIEN3_FIORINA_TEMPLATE_V92);
template.label = 'Fiorina 161 · Living Cast V93';
template.nodes.push(
  { id: 'f161-perch-cell-v93', x: 2500, y: 190, zoneId: 'f161-cellblock', anchor: null, width: 170 },
  { id: 'f161-perch-service-v93', x: 3310, y: 190, zoneId: 'f161-service', anchor: null, width: 170 },
  { id: 'f161-triage-v93', x: 3490, y: 510, zoneId: 'f161-service', anchor: null, width: 190 },
  { id: 'f161-perch-lead-v93', x: 4720, y: 190, zoneId: 'f161-leadworks', anchor: null, width: 170 },
  { id: 'f161-parley-v93', x: 5660, y: 510, zoneId: 'f161-furnace', anchor: null, width: 180 },
  { id: 'f161-witness-v93', x: 6030, y: 330, zoneId: 'f161-furnace', anchor: null, width: 170 }
);
template.edges.push(
  { id: 'f161-e77', from: 'f161-mess-ceiling', to: 'f161-perch-cell-v93', kind: 'ladder', routeIds: [] },
  { id: 'f161-e78', from: 'f161-perch-cell-v93', to: 'f161-comms-high', kind: 'ladder', routeIds: [] },
  { id: 'f161-e79', from: 'f161-steam-service-node', to: 'f161-perch-service-v93', kind: 'ladder', routeIds: [] },
  { id: 'f161-e80', from: 'f161-perch-service-v93', to: 'f161-service-high', kind: 'ladder', routeIds: [] },
  { id: 'f161-e81', from: 'f161-rescue-post-node', to: 'f161-triage-v93', kind: 'walk', routeIds: [] },
  { id: 'f161-e82', from: 'f161-triage-v93', to: 'f161-shutter-service-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e83', from: 'f161-steam-lead-node', to: 'f161-perch-lead-v93', kind: 'ladder', routeIds: [] },
  { id: 'f161-e84', from: 'f161-perch-lead-v93', to: 'f161-piston-b-node', kind: 'ladder', routeIds: [] },
  { id: 'f161-e85', from: 'f161-furnace', to: 'f161-parley-v93', kind: 'walk', routeIds: [] },
  { id: 'f161-e86', from: 'f161-parley-v93', to: 'f161-company', kind: 'walk', routeIds: [] },
  { id: 'f161-e87', from: 'f161-company', to: 'f161-witness-v93', kind: 'ladder', routeIds: [] },
  { id: 'f161-e88', from: 'f161-witness-v93', to: 'f161-extraction', kind: 'ladder', routeIds: [] }
);
export const ALIEN3_FIORINA_TEMPLATE_V93 = deepFreeze(template);

export const ALIEN3_CODEX_V93 = deepFreeze([
  { id: 'f161-v93-murphy-sequence', title: 'MURPHY — SÉQUENCE VIVANTE', category: 'ARCHIVE', body: 'Le puits de ventilation est désormais un beat spatial déclenché sur place : le joueur traverse la zone, voit la pression du Runner se déplacer et conserve le contrôle pendant la reconstitution.' },
  { id: 'f161-v93-tunnel-sequence', title: 'BOGGS / RAINS — GALERIES', category: 'ARCHIVE', body: 'La progression dans les galeries matérialise le départ de l’équipe, la perte de Boggs et Rains et la rupture psychologique de Golic sans ajouter de xénomorphe supplémentaire.' },
  { id: 'f161-v93-clemens-sequence', title: 'CLEMENS — RUPTURE DE L’INFIRMERIE', category: 'ARCHIVE', body: 'La mort de Clemens devient un beat jouable de l’infirmerie. Elle marque la fin de la fausse sécurité médicale et prépare directement l’incident du réfectoire.' },
  { id: 'f161-v93-andrews-sequence', title: 'ANDREWS — BRÈCHE SUPÉRIEURE', category: 'ARCHIVE', body: 'Le réfectoire conserve la trajectoire verticale de l’attaque contre Andrews. Le Runner utilise les structures hautes plutôt qu’un simple spawn frontal.' },
  { id: 'f161-v93-prisoner-routines', title: 'ROUTINES DES DÉTENUS', category: 'PERSONNEL', body: 'Les détenus valides reçoivent des rôles physiques : leurre, fermeture, relais, triage. Ils se déplacent vers leurs postes au lieu de rester en simple patrouille décorative.' },
  { id: 'f161-v93-prisoner-risk', title: 'RISQUE D’EXPOSITION', category: 'PERSONNEL', body: 'Une équipe maintenue trop longtemps près du Runner peut subir une blessure évitable. Le système distingue ces pertes tactiques des morts imposées par la chronologie reconstruite.' },
  { id: 'f161-v93-runner-perches', title: 'PERCHOIRS DU RUNNER', category: 'XÉNOBIOLOGIE', body: 'Trois volumes hauts servent de postes de chasse hors champ. Le Runner peut s’y immobiliser brièvement avant de retomber sur une route anticipée.' },
  { id: 'f161-v93-runner-learning', title: 'LECTURE DES HABITUDES', category: 'GAMEPLAY', body: 'Le directeur V93 échantillonne accroupissement, sprint et immobilité. Il ne triche pas avec un second ennemi : il repositionne l’unique Runner hors caméra pour répondre aux habitudes dominantes.' },
  { id: 'f161-v93-company-parley', title: 'PATNA — PARLEMENTER', category: 'FACTION', body: 'La confrontation finale dispose d’une phase de pourparlers physique avant la dernière décision. Bishop II et l’équipe de récupération sont traités comme une force de capture, pas une vague d’ennemis.' },
  { id: 'f161-v93-cage-deployment', title: 'DÉPLOIEMENT DE LA CAGE', category: 'FACTION', body: 'La cage Patna est désormais armée pendant la phase de pourparlers. Son déploiement confirme visuellement l’objectif de récupération xénobiologique.' },
  { id: 'f161-v93-aaron-charge', title: 'AARON — CHARGE FINALE', category: 'PERSONNEL', body: 'Le refus final d’Aaron est suivi comme une action distincte avant la fermeture de l’archive.' },
  { id: 'f161-v93-morse-wound', title: 'MORSE — BLESSURE ET CUSTODIE', category: 'PERSONNEL', body: 'La blessure de Morse et sa capture sont séparées de la disparition de Ripley afin de conserver le statut du témoin survivant.' },
  { id: 'f161-v93-seamless-cinematics', title: 'MISE EN SCÈNE SANS COUPURE', category: 'GAMEPLAY', body: 'Les cartes de scène et le cadrage V93 n’arrêtent jamais les commandes. Elles renforcent la lecture d’un événement sans transformer la campagne en film non interactif.' },
  { id: 'f161-v93-perfect-archive-run', title: 'ARCHIVE PARFAITE — LIVING CAST', category: 'MIRE', body: 'Une archive parfaite V93 exige les preuves héritées, les beats historiques, la confrontation finale et zéro blessure évitable causée par une mauvaise affectation des détenus.' }
]);

export const ALIEN3_V93_EVIDENCE_IDS = deepFreeze([
  'murphy-sequence', 'tunnel-sequence', 'clemens-sequence', 'andrews-sequence',
  'prisoner-routines', 'prisoner-risk', 'runner-perches', 'runner-learning',
  'company-parley', 'cage-deployment', 'aaron-charge', 'morse-wound',
  'seamless-cinematics', 'perfect-archive-run'
]);

export const ALIEN3_HISTORICAL_BEATS_V93 = deepFreeze([
  { id: 'murphy', evidenceId: 'murphy-sequence', phases: ['first-blood', 'bishop'], x: 2940, y: 286, radius: 250, title: 'MURPHY · PUITS DE VENTILATION', subtitle: 'La première zone technique cesse d’être sûre.' },
  { id: 'tunnels', evidenceId: 'tunnel-sequence', phases: ['first-blood', 'bishop'], x: 3420, y: 594, radius: 260, title: 'BOGGS / RAINS / GOLIC', subtitle: 'Trois hommes entrent dans les galeries. Un seul revient.' },
  { id: 'clemens', evidenceId: 'clemens-sequence', phases: ['first-blood'], x: 1380, y: 474, radius: 230, title: 'INFIRMERIE · CLEMENS', subtitle: 'Le Runner franchit la dernière zone supposée protégée.' },
  { id: 'andrews', evidenceId: 'andrews-sequence', phases: ['first-blood', 'bishop'], x: 2470, y: 314, radius: 230, title: 'RÉFECTOIRE · ANDREWS', subtitle: 'La menace attaque depuis les structures supérieures.' }
]);

export const ALIEN3_RUNNER_PERCHES_V93 = deepFreeze([
  { id: 'perch-cell', nodeId: 'f161-perch-cell-v93', x: 2500, y: 100, zoneId: 'f161-cellblock' },
  { id: 'perch-service', nodeId: 'f161-perch-service-v93', x: 3310, y: 100, zoneId: 'f161-service' },
  { id: 'perch-lead', nodeId: 'f161-perch-lead-v93', x: 4720, y: 100, zoneId: 'f161-leadworks' }
]);

export const ALIEN3_PRISONER_ROUTINE_ROLES_V93 = deepFreeze([
  { id: 'lure', label: 'LEURRE', targetX: 3950 },
  { id: 'seal', label: 'FERMETURE', targetX: 3650 },
  { id: 'relay', label: 'RELAIS FONDERIE', targetX: 4480 },
  { id: 'triage', label: 'TRIAGE', targetX: 3490 }
]);

export const ALIEN3_V93_STATIONS = deepFreeze([
  { id: 'f161-routine-board-v93', kind: 'routine-board', x: 3452, y: 438, w: 76, h: 72, label: 'TABLEAU DES ÉQUIPES' },
  { id: 'f161-company-parley-v93', kind: 'parley', x: 5622, y: 438, w: 76, h: 72, label: 'PARLEMENTER AVEC PATNA' },
  { id: 'f161-aaron-charge-v93', kind: 'aaron', x: 5780, y: 438, w: 72, h: 72, label: 'AARON · DERNIER REFUS' },
  { id: 'f161-morse-wound-v93', kind: 'morse', x: 5910, y: 438, w: 72, h: 72, label: 'MORSE · BLESSURE' },
  { id: 'f161-witness-terminal-v93', kind: 'witness', x: 5994, y: 258, w: 72, h: 72, label: 'SCELLER LA DÉPOSITION' }
]);

const codexIds = new Set(ALIEN3_CODEX_V93.map((entry) => entry.id));
const evidenceIds = new Set(ALIEN3_V93_EVIDENCE_IDS);
const beatIds = new Set(ALIEN3_HISTORICAL_BEATS_V93.map((entry) => entry.id));
const perchIds = new Set(ALIEN3_RUNNER_PERCHES_V93.map((entry) => entry.id));
const roleIds = new Set(ALIEN3_PRISONER_ROUTINE_ROLES_V93.map((entry) => entry.id));

export function createAlien3StateV93() {
  return {
    schema: ALIEN3_DLC_SCHEMA_V93,
    operationId: ALIEN3_OPERATION_ID_V93,
    codexUnlocked: [],
    codexViewed: [],
    currentCodexId: null,
    evidenceRecovered: [],
    historical: {
      triggered: Object.fromEntries([...beatIds].map((id) => [id, false])),
      count: 0,
      lastBeatId: null
    },
    routines: {
      boardRead: false,
      assignments: {},
      successes: 0,
      failures: 0,
      avoidableCasualties: 0,
      woundedByExposure: [],
      safeTransfers: 0,
      activeRoles: 0
    },
    runnerMind: {
      perchId: null,
      perchClock: 0,
      perchCooldown: 5,
      drops: 0,
      crouchTime: 0,
      sprintTime: 0,
      stationaryTime: 0,
      sampleClock: 0,
      learnedStyle: 'mixed',
      predictionStrength: 0,
      lastPlayerX: 0,
      offscreenRepositions: 0
    },
    company: {
      parleyStarted: false,
      parleyResolved: false,
      cageDeployed: false,
      aaronCharge: false,
      morseWound: false,
      witnessConfirmed: false
    },
    cinematic: {
      clock: 0,
      title: '',
      subtitle: '',
      beatId: null,
      focusX: 0,
      cardsShown: 0
    },
    archivePerfect: {
      inheritedComplete: false,
      historicalComplete: false,
      zeroAvoidableCasualties: true,
      finaleComplete: false,
      perfect: false
    },
    telemetry: {
      routineDistance: 0,
      routineRoleChanges: 0,
      runnerPerches: 0,
      runnerDrops: 0,
      historicalBeats: 0,
      companyInteractions: 0,
      cinematicCards: 0
    },
    achievementIds: []
  };
}

export function sanitizeAlien3StateV93(raw) {
  const fallback = createAlien3StateV93();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Number(raw.schema) !== ALIEN3_DLC_SCHEMA_V93) return fallback;
  const historical = raw.historical && typeof raw.historical === 'object' ? raw.historical : {};
  const routines = raw.routines && typeof raw.routines === 'object' ? raw.routines : {};
  const mind = raw.runnerMind && typeof raw.runnerMind === 'object' ? raw.runnerMind : {};
  const company = raw.company && typeof raw.company === 'object' ? raw.company : {};
  const cinematic = raw.cinematic && typeof raw.cinematic === 'object' ? raw.cinematic : {};
  const perfect = raw.archivePerfect && typeof raw.archivePerfect === 'object' ? raw.archivePerfect : {};
  const telemetry = raw.telemetry && typeof raw.telemetry === 'object' ? raw.telemetry : {};
  const assignments = routines.assignments && typeof routines.assignments === 'object' ? routines.assignments : {};
  return {
    ...fallback,
    codexUnlocked: unique(raw.codexUnlocked, codexIds),
    codexViewed: unique(raw.codexViewed, codexIds),
    currentCodexId: codexIds.has(raw.currentCodexId) ? raw.currentCodexId : null,
    evidenceRecovered: unique(raw.evidenceRecovered, evidenceIds),
    historical: {
      triggered: Object.fromEntries([...beatIds].map((id) => [id, bool(historical.triggered?.[id])])),
      count: Math.round(clamp(historical.count, 0, 99)),
      lastBeatId: beatIds.has(historical.lastBeatId) ? historical.lastBeatId : null
    },
    routines: {
      boardRead: bool(routines.boardRead),
      assignments: Object.fromEntries(Object.entries(assignments).slice(0, 32).flatMap(([id, role]) => roleIds.has(role) ? [[boundedText(id, 'prisoner', 64), role]] : [])),
      successes: Math.round(clamp(routines.successes, 0, 999)),
      failures: Math.round(clamp(routines.failures, 0, 999)),
      avoidableCasualties: Math.round(clamp(routines.avoidableCasualties, 0, 32)),
      woundedByExposure: Array.isArray(routines.woundedByExposure)
        ? [...new Set(routines.woundedByExposure.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 64)))].slice(0, 32)
        : [],
      safeTransfers: Math.round(clamp(routines.safeTransfers, 0, 99)),
      activeRoles: Math.round(clamp(routines.activeRoles, 0, ALIEN3_PRISONER_ROUTINE_ROLES_V93.length))
    },
    runnerMind: {
      perchId: perchIds.has(mind.perchId) ? mind.perchId : null,
      perchClock: clamp(mind.perchClock, 0, 30),
      perchCooldown: clamp(mind.perchCooldown, 0, 120),
      drops: Math.round(clamp(mind.drops, 0, 999)),
      crouchTime: clamp(mind.crouchTime, 0, 9999),
      sprintTime: clamp(mind.sprintTime, 0, 9999),
      stationaryTime: clamp(mind.stationaryTime, 0, 9999),
      sampleClock: clamp(mind.sampleClock, 0, 120),
      learnedStyle: ['mixed', 'stealth', 'sprint', 'static'].includes(mind.learnedStyle) ? mind.learnedStyle : 'mixed',
      predictionStrength: clamp(mind.predictionStrength, 0, 100),
      lastPlayerX: clamp(mind.lastPlayerX, 0, 6200),
      offscreenRepositions: Math.round(clamp(mind.offscreenRepositions, 0, 999))
    },
    company: {
      parleyStarted: bool(company.parleyStarted),
      parleyResolved: bool(company.parleyResolved),
      cageDeployed: bool(company.cageDeployed),
      aaronCharge: bool(company.aaronCharge),
      morseWound: bool(company.morseWound),
      witnessConfirmed: bool(company.witnessConfirmed)
    },
    cinematic: {
      clock: clamp(cinematic.clock, 0, 12),
      title: boundedText(cinematic.title, '', 120),
      subtitle: boundedText(cinematic.subtitle, '', 220),
      beatId: boundedText(cinematic.beatId, '', 100) || null,
      focusX: clamp(cinematic.focusX, 0, 6200),
      cardsShown: Math.round(clamp(cinematic.cardsShown, 0, 999))
    },
    archivePerfect: {
      inheritedComplete: bool(perfect.inheritedComplete),
      historicalComplete: bool(perfect.historicalComplete),
      zeroAvoidableCasualties: bool(perfect.zeroAvoidableCasualties, true),
      finaleComplete: bool(perfect.finaleComplete),
      perfect: bool(perfect.perfect)
    },
    telemetry: {
      routineDistance: clamp(telemetry.routineDistance, 0, 999999),
      routineRoleChanges: Math.round(clamp(telemetry.routineRoleChanges, 0, 999)),
      runnerPerches: Math.round(clamp(telemetry.runnerPerches, 0, 999)),
      runnerDrops: Math.round(clamp(telemetry.runnerDrops, 0, 999)),
      historicalBeats: Math.round(clamp(telemetry.historicalBeats, 0, 999)),
      companyInteractions: Math.round(clamp(telemetry.companyInteractions, 0, 999)),
      cinematicCards: Math.round(clamp(telemetry.cinematicCards, 0, 999))
    },
    achievementIds: Array.isArray(raw.achievementIds)
      ? [...new Set(raw.achievementIds.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 80)))].slice(0, 128)
      : []
  };
}

export function alien3V93CodexEntry(id) {
  return ALIEN3_CODEX_V93.find((entry) => entry.id === id) || null;
}

export function alien3V93Grade({ gradeV92 = 'D', evidence = 0, avoidableCasualties = 0, historical = 0, perfect = false } = {}) {
  const base = { 'S+++': 122, 'S++': 115, 'S+': 106, S: 96, A: 86, B: 74, C: 62, D: 50 }[gradeV92] || 50;
  const evidenceScore = clamp(evidence / Math.max(1, ALIEN3_V93_EVIDENCE_IDS.length), 0, 1) * 8;
  const historyScore = clamp(historical / Math.max(1, ALIEN3_HISTORICAL_BEATS_V93.length), 0, 1) * 4;
  const casualtyPenalty = Math.min(12, Math.max(0, Number(avoidableCasualties) || 0) * 3);
  const perfectBonus = perfect ? 4 : 0;
  const score = base + evidenceScore + historyScore + perfectBonus - casualtyPenalty;
  return score >= 137 ? 'S++++' : score >= 128 ? 'S+++' : score >= 119 ? 'S++' : score >= 110 ? 'S+' : score >= 98 ? 'S' : score >= 86 ? 'A' : score >= 74 ? 'B' : score >= 62 ? 'C' : 'D';
}

export function validateAlien3DlcV93() {
  const failures = [];
  const nodes = ALIEN3_FIORINA_TEMPLATE_V93.nodes;
  const edges = ALIEN3_FIORINA_TEMPLATE_V93.edges;
  const routes = ALIEN3_FIORINA_TEMPLATE_V93.routes;
  const zones = ALIEN3_FIORINA_TEMPLATE_V93.zones;
  const nodeIds = new Set(nodes.map((entry) => entry.id));
  const zoneMap = new Map(zones.map((entry) => [entry.id, entry]));
  const edgePairs = new Set(edges.flatMap((entry) => [`${entry.from}>${entry.to}`, `${entry.to}>${entry.from}`]));
  const adjacency = new Map(nodes.map((entry) => [entry.id, []]));
  for (const edge of edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) failures.push(`missing edge endpoint ${edge.id}`);
    adjacency.get(edge.from)?.push(edge.to);
    if (!edge.oneWay) adjacency.get(edge.to)?.push(edge.from);
  }
  if (ALIEN3_FIORINA_TEMPLATE_V93.id !== ALIEN3_TEMPLATE_ID_V93) failures.push('template id mismatch');
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
  if (new Set(ALIEN3_CODEX_V93.map((entry) => entry.id)).size !== ALIEN3_CODEX_V93.length) failures.push('duplicate V93 codex ids');
  if (new Set(ALIEN3_V93_EVIDENCE_IDS).size !== ALIEN3_V93_EVIDENCE_IDS.length) failures.push('duplicate V93 evidence ids');
  if (new Set(ALIEN3_V93_STATIONS.map((entry) => entry.id)).size !== ALIEN3_V93_STATIONS.length) failures.push('duplicate V93 station ids');
  if (new Set(ALIEN3_RUNNER_PERCHES_V93.map((entry) => entry.id)).size !== ALIEN3_RUNNER_PERCHES_V93.length) failures.push('duplicate perch ids');
  return deepFreeze({
    ok: failures.length === 0,
    failures,
    counts: {
      nodes: nodes.length,
      edges: edges.length,
      routes: routes.length,
      zones: zones.length,
      codexV93: ALIEN3_CODEX_V93.length,
      evidence: ALIEN3_V93_EVIDENCE_IDS.length,
      historicalBeats: ALIEN3_HISTORICAL_BEATS_V93.length,
      perches: ALIEN3_RUNNER_PERCHES_V93.length,
      prisonerRoles: ALIEN3_PRISONER_ROUTINE_ROLES_V93.length,
      stations: ALIEN3_V93_STATIONS.length,
      inheritedSchema: ALIEN3_DLC_SCHEMA_V92
    }
  });
}
