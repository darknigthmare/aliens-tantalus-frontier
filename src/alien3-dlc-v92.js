import {
  ALIEN3_CAMPAIGN_ID_V91,
  ALIEN3_DLC_SCHEMA_V91,
  ALIEN3_FIORINA_PALETTE_V91,
  ALIEN3_FIORINA_TEMPLATE_V91,
  ALIEN3_OPERATION_ID_V91,
  ALIEN3_TEMPLATE_ID_V91
} from './alien3-dlc-v91.js';

export const ALIEN3_DLC_SCHEMA_V92 = 92;
export const ALIEN3_OPERATION_ID_V92 = ALIEN3_OPERATION_ID_V91;
export const ALIEN3_CAMPAIGN_ID_V92 = ALIEN3_CAMPAIGN_ID_V91;
export const ALIEN3_TEMPLATE_ID_V92 = ALIEN3_TEMPLATE_ID_V91;

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

export const ALIEN3_FIORINA_PALETTE_V92 = deepFreeze({
  ...clone(ALIEN3_FIORINA_PALETTE_V91),
  id: 'fiorina-161-director-cut-v92',
  light: 0.28,
  prop: 'penal-foundry-director-cut'
});

// V92 keeps the four authored end-to-end routes. These nodes are tactical
// branches: emergency shutters, steam masking, prisoner coordination and a
// master archive station. They add gameplay choices without inventing a fifth
// route or a second Runner.
const template = clone(ALIEN3_FIORINA_TEMPLATE_V91);
template.label = 'Fiorina 161 · Director Cut V92';
template.nodes.push(
  { id: 'f161-master-archive-node', x: 1260, y: 350, zoneId: 'f161-infirmary', anchor: null, width: 170 },
  { id: 'f161-shutter-cell-node', x: 2740, y: 510, zoneId: 'f161-cellblock', anchor: null, width: 160 },
  { id: 'f161-steam-service-node', x: 3190, y: 330, zoneId: 'f161-service', anchor: null, width: 160 },
  { id: 'f161-rescue-post-node', x: 3330, y: 510, zoneId: 'f161-service', anchor: null, width: 170 },
  { id: 'f161-shutter-service-node', x: 3650, y: 510, zoneId: 'f161-service', anchor: null, width: 160 },
  { id: 'f161-command-post-node', x: 3960, y: 510, zoneId: 'f161-leadworks', anchor: null, width: 180 },
  { id: 'f161-steam-lead-node', x: 4710, y: 330, zoneId: 'f161-leadworks', anchor: null, width: 160 },
  { id: 'f161-shutter-foundry-node', x: 5050, y: 510, zoneId: 'f161-leadworks', anchor: null, width: 160 }
);
template.edges.push(
  { id: 'f161-e62', from: 'f161-morgue-high', to: 'f161-master-archive-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e63', from: 'f161-cell-b', to: 'f161-shutter-cell-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e64', from: 'f161-shutter-cell-node', to: 'f161-comms-high', kind: 'ladder', routeIds: [] },
  { id: 'f161-e65', from: 'f161-service-high', to: 'f161-steam-service-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e66', from: 'f161-steam-service-node', to: 'f161-fan-shaft', kind: 'walk', routeIds: [] },
  { id: 'f161-e67', from: 'f161-service-low', to: 'f161-rescue-post-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e68', from: 'f161-rescue-post-node', to: 'f161-bishop', kind: 'walk', routeIds: [] },
  { id: 'f161-e69', from: 'f161-bishop', to: 'f161-shutter-service-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e70', from: 'f161-shutter-service-node', to: 'f161-chemical-store', kind: 'walk', routeIds: [] },
  { id: 'f161-e71', from: 'f161-tunnel-high', to: 'f161-command-post-node', kind: 'ladder', routeIds: [] },
  { id: 'f161-e72', from: 'f161-command-post-node', to: 'f161-leadworks', kind: 'walk', routeIds: [] },
  { id: 'f161-e73', from: 'f161-water-header', to: 'f161-steam-lead-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e74', from: 'f161-steam-lead-node', to: 'f161-piston-b-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e75', from: 'f161-mold', to: 'f161-shutter-foundry-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e76', from: 'f161-shutter-foundry-node', to: 'f161-piston-c-node', kind: 'walk', routeIds: [] }
);
export const ALIEN3_FIORINA_TEMPLATE_V92 = deepFreeze(template);

export const ALIEN3_CODEX_V92 = deepFreeze([
  { id: 'f161-master-archive', title: 'ARCHIVE MAÎTRE FIORINA 161', category: 'MIRE', body: 'Une console de synthèse recoupe les branches cinéma, Assembly et les preuves de terrain sans les fusionner en une continuité fictive.' },
  { id: 'f161-emergency-shutters', title: 'VOLETS D’URGENCE', category: 'TACTIQUE', body: 'Les volets industriels peuvent retarder le Runner quelques secondes. Ils ne sont pas conçus pour le contenir durablement et deviennent moins fiables si on les sollicite trop.' },
  { id: 'f161-steam-masking', title: 'MASQUAGE PAR VAPEUR', category: 'TACTIQUE', body: 'Une purge de vapeur couvre les déplacements et perturbe brièvement la chasse. Le Runner s’habitue progressivement aux mêmes signatures thermiques.' },
  { id: 'f161-lure-team', title: 'ÉQUIPE LEURRE', category: 'PERSONNEL', body: 'Des détenus peuvent provoquer un bruit contrôlé sur une autre section pour déplacer la pression du Runner. L’ordre est utile mais augmente le risque pour le groupe.' },
  { id: 'f161-seal-team', title: 'ÉQUIPE FERMETURE', category: 'PERSONNEL', body: 'Une équipe dédiée peut armer à distance le volet d’urgence le plus proche du Runner, à condition qu’il reste suffisamment de détenus valides.' },
  { id: 'f161-rescue-team', title: 'ÉVACUATION DES BLESSÉS', category: 'PERSONNEL', body: 'Les blessés peuvent être déplacés vers une zone sûre sans être miraculeusement guéris. Le système conserve leur état wounded.' },
  { id: 'f161-runner-adaptation', title: 'ADAPTATION DU RUNNER', category: 'XÉNOBIOLOGIE', body: 'Le directeur V92 mémorise les outils utilisés contre le Runner : flares, volets et vapeur perdent graduellement de leur efficacité lorsqu’ils sont répétés.' },
  { id: 'f161-no-safe-zone', title: 'AUCUNE ZONE SÛRE', category: 'GAMEPLAY', body: 'Une faible pression ne signifie plus l’absence de menace. Le Runner peut effectuer des feintes, disparaître puis réapparaître sur un axe déjà fréquenté.' },
  { id: 'f161-prisoner-cohesion', title: 'COHÉSION DU GROUPE', category: 'PERSONNEL', body: 'Le moral et la panique influencent désormais la vitesse d’exécution des ordres collectifs, les délais et le risque de blessure.' },
  { id: 'f161-company-biosecurity', title: 'PROTOCOLE BIO-SÉCURITÉ PATNA', category: 'FACTION', body: 'Le matériel de récupération est suivi comme un dispositif de capture xénobiologique, séparé de l’objectif de survie des détenus.' },
  { id: 'f161-final-telemetry', title: 'TÉLÉMÉTRIE DE LA FONDERIE', category: 'TACTIQUE', body: 'Les journaux V92 consolident volets, vapeur, pistons, plomb et eau pour expliquer exactement comment le Runner a été amené dans la fenêtre létale.' },
  { id: 'f161-perfect-archive', title: 'RECONSTRUCTION INTÉGRALE', category: 'MIRE', body: 'Le dossier intégral exige les preuves des quatre couches V89 à V92 et la résolution complète du piège. Il récompense l’exhaustivité, pas une nouvelle fin.' }
]);

export const ALIEN3_V92_EVIDENCE_IDS = deepFreeze([
  'master-archive', 'emergency-shutters', 'steam-masking', 'lure-team', 'seal-team', 'rescue-team',
  'runner-adaptation', 'no-safe-zone', 'prisoner-cohesion', 'company-biosecurity', 'final-telemetry', 'perfect-archive'
]);

export const ALIEN3_SHUTTERS_V92 = deepFreeze([
  { id: 'f161-shutter-cell', zoneId: 'f161-cellblock', x: 2740, y: 392, w: 44, h: 118, baseHold: 5.4, cooldown: 15, label: 'VOLET BLOC C' },
  { id: 'f161-shutter-service', zoneId: 'f161-service', x: 3650, y: 392, w: 44, h: 118, baseHold: 5.0, cooldown: 16, label: 'VOLET GALERIES' },
  { id: 'f161-shutter-foundry', zoneId: 'f161-leadworks', x: 5050, y: 392, w: 44, h: 118, baseHold: 4.6, cooldown: 18, label: 'VOLET FONDERIE' }
]);

export const ALIEN3_STEAM_VALVES_V92 = deepFreeze([
  { id: 'f161-steam-service', zoneId: 'f161-service', x: 3190, y: 258, w: 70, h: 72, baseDuration: 8.0, cooldown: 18, label: 'PURGE VAPEUR · GALERIES' },
  { id: 'f161-steam-lead', zoneId: 'f161-leadworks', x: 4710, y: 258, w: 70, h: 72, baseDuration: 7.5, cooldown: 20, label: 'PURGE VAPEUR · PLOMB' },
  { id: 'f161-steam-furnace', zoneId: 'f161-furnace', x: 5580, y: 258, w: 70, h: 72, baseDuration: 7.0, cooldown: 22, label: 'PURGE VAPEUR · FOUR' }
]);

export const ALIEN3_PRISONER_COMMANDS_V92 = deepFreeze([
  { id: 'f161-command-lure', kind: 'lure', x: 3960, y: 438, w: 72, h: 72, label: 'ORDRE · ÉQUIPE LEURRE' },
  { id: 'f161-command-seal', kind: 'seal', x: 4045, y: 438, w: 72, h: 72, label: 'ORDRE · ÉQUIPE FERMETURE' },
  { id: 'f161-command-rescue', kind: 'rescue', x: 3330, y: 438, w: 72, h: 72, label: 'ORDRE · ÉVACUER UN BLESSÉ' }
]);

export const ALIEN3_V92_STATIONS = deepFreeze([
  { id: 'f161-master-archive-console', kind: 'archive', x: 1460, y: 278, w: 74, h: 72, label: 'ARCHIVE MAÎTRE MIRE 161' },
  ...ALIEN3_SHUTTERS_V92.map((entry) => ({ ...entry, kind: 'shutter' })),
  ...ALIEN3_STEAM_VALVES_V92.map((entry) => ({ ...entry, kind: 'steam' })),
  ...ALIEN3_PRISONER_COMMANDS_V92
]);

const codexIds = new Set(ALIEN3_CODEX_V92.map((entry) => entry.id));
const evidenceIds = new Set(ALIEN3_V92_EVIDENCE_IDS);
const shutterIds = new Set(ALIEN3_SHUTTERS_V92.map((entry) => entry.id));
const steamIds = new Set(ALIEN3_STEAM_VALVES_V92.map((entry) => entry.id));

export function createAlien3StateV92() {
  return {
    schema: ALIEN3_DLC_SCHEMA_V92,
    operationId: ALIEN3_OPERATION_ID_V92,
    codexUnlocked: [],
    codexViewed: [],
    currentCodexId: null,
    evidenceRecovered: [],
    shutters: Object.fromEntries(ALIEN3_SHUTTERS_V92.map((entry) => [entry.id, {
      closedClock: 0, cooldown: 0, uses: 0, breaches: 0, runnerSide: 0, contactClock: 0, holdPeak: 0
    }])),
    steam: Object.fromEntries(ALIEN3_STEAM_VALVES_V92.map((entry) => [entry.id, {
      activeClock: 0, cooldown: 0, uses: 0, disorientations: 0
    }])),
    prisonerCommands: {
      lureCooldown: 0,
      sealCooldown: 0,
      rescueCooldown: 0,
      lureClock: 0,
      lureX: 0,
      teamwork: 0,
      lureOrders: 0,
      sealOrders: 0,
      rescueOrders: 0,
      woundedEvacuated: []
    },
    adaptation: {
      flareResistance: 0,
      shutterAggression: 0,
      steamTolerance: 0,
      feints: 0,
      toolRepeat: 0,
      lastTool: null,
      flareConsumedSeen: 0,
      routeMemory: [],
      pressureMemory: 0,
      feintCooldown: 0
    },
    checkpointLedger: {
      lastPhase: 'wreckage',
      receipts: ['wreckage'],
      phaseChanges: 0
    },
    masterArchive: {
      inspected: false,
      integratedEvidence: 0,
      perfect: false
    },
    telemetry: {
      shuttersUsed: 0,
      shuttersBreached: 0,
      steamPurges: 0,
      prisonerOrders: 0,
      runnerFeints: 0,
      toolAdaptations: 0,
      maxTeamwork: 0
    },
    achievementIds: []
  };
}

export function sanitizeAlien3StateV92(raw) {
  const fallback = createAlien3StateV92();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Number(raw.schema) !== ALIEN3_DLC_SCHEMA_V92) return fallback;
  const rawShutters = raw.shutters && typeof raw.shutters === 'object' ? raw.shutters : {};
  const rawSteam = raw.steam && typeof raw.steam === 'object' ? raw.steam : {};
  const commands = raw.prisonerCommands && typeof raw.prisonerCommands === 'object' ? raw.prisonerCommands : {};
  const adaptation = raw.adaptation && typeof raw.adaptation === 'object' ? raw.adaptation : {};
  const ledger = raw.checkpointLedger && typeof raw.checkpointLedger === 'object' ? raw.checkpointLedger : {};
  const master = raw.masterArchive && typeof raw.masterArchive === 'object' ? raw.masterArchive : {};
  const telemetry = raw.telemetry && typeof raw.telemetry === 'object' ? raw.telemetry : {};
  return {
    ...fallback,
    codexUnlocked: unique(raw.codexUnlocked, codexIds),
    codexViewed: unique(raw.codexViewed, codexIds),
    currentCodexId: codexIds.has(raw.currentCodexId) ? raw.currentCodexId : null,
    evidenceRecovered: unique(raw.evidenceRecovered, evidenceIds),
    shutters: Object.fromEntries(ALIEN3_SHUTTERS_V92.map((entry) => {
      const source = rawShutters[entry.id] && typeof rawShutters[entry.id] === 'object' ? rawShutters[entry.id] : {};
      return [entry.id, {
        closedClock: clamp(source.closedClock, 0, 30),
        cooldown: clamp(source.cooldown, 0, 120),
        uses: Math.round(clamp(source.uses, 0, 99)),
        breaches: Math.round(clamp(source.breaches, 0, 99)),
        runnerSide: [-1, 0, 1].includes(Number(source.runnerSide)) ? Number(source.runnerSide) : 0,
        contactClock: clamp(source.contactClock, 0, 30),
        holdPeak: clamp(source.holdPeak, 0, 30)
      }];
    })),
    steam: Object.fromEntries(ALIEN3_STEAM_VALVES_V92.map((entry) => {
      const source = rawSteam[entry.id] && typeof rawSteam[entry.id] === 'object' ? rawSteam[entry.id] : {};
      return [entry.id, {
        activeClock: clamp(source.activeClock, 0, 30),
        cooldown: clamp(source.cooldown, 0, 120),
        uses: Math.round(clamp(source.uses, 0, 99)),
        disorientations: Math.round(clamp(source.disorientations, 0, 99))
      }];
    })),
    prisonerCommands: {
      lureCooldown: clamp(commands.lureCooldown, 0, 120),
      sealCooldown: clamp(commands.sealCooldown, 0, 120),
      rescueCooldown: clamp(commands.rescueCooldown, 0, 120),
      lureClock: clamp(commands.lureClock, 0, 30),
      lureX: clamp(commands.lureX, 0, 6200),
      teamwork: clamp(commands.teamwork, 0, 100),
      lureOrders: Math.round(clamp(commands.lureOrders, 0, 99)),
      sealOrders: Math.round(clamp(commands.sealOrders, 0, 99)),
      rescueOrders: Math.round(clamp(commands.rescueOrders, 0, 99)),
      woundedEvacuated: Array.isArray(commands.woundedEvacuated)
        ? [...new Set(commands.woundedEvacuated.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 64)))].slice(0, 32)
        : []
    },
    adaptation: {
      flareResistance: clamp(adaptation.flareResistance, 0, 5),
      shutterAggression: clamp(adaptation.shutterAggression, 0, 5),
      steamTolerance: clamp(adaptation.steamTolerance, 0, 5),
      feints: Math.round(clamp(adaptation.feints, 0, 999)),
      toolRepeat: Math.round(clamp(adaptation.toolRepeat, 0, 99)),
      lastTool: ['flare', 'shutter', 'steam', 'lure'].includes(adaptation.lastTool) ? adaptation.lastTool : null,
      flareConsumedSeen: Math.round(clamp(adaptation.flareConsumedSeen, 0, 999)),
      routeMemory: Array.isArray(adaptation.routeMemory)
        ? adaptation.routeMemory.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 80)).slice(-12)
        : [],
      pressureMemory: clamp(adaptation.pressureMemory, 0, 100),
      feintCooldown: clamp(adaptation.feintCooldown, 0, 120)
    },
    checkpointLedger: {
      lastPhase: boundedText(ledger.lastPhase, 'wreckage', 48),
      receipts: Array.isArray(ledger.receipts)
        ? [...new Set(ledger.receipts.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 48)))].slice(-24)
        : ['wreckage'],
      phaseChanges: Math.round(clamp(ledger.phaseChanges, 0, 99))
    },
    masterArchive: {
      inspected: bool(master.inspected),
      integratedEvidence: Math.round(clamp(master.integratedEvidence, 0, 99)),
      perfect: bool(master.perfect)
    },
    telemetry: {
      shuttersUsed: Math.round(clamp(telemetry.shuttersUsed, 0, 999)),
      shuttersBreached: Math.round(clamp(telemetry.shuttersBreached, 0, 999)),
      steamPurges: Math.round(clamp(telemetry.steamPurges, 0, 999)),
      prisonerOrders: Math.round(clamp(telemetry.prisonerOrders, 0, 999)),
      runnerFeints: Math.round(clamp(telemetry.runnerFeints, 0, 999)),
      toolAdaptations: Math.round(clamp(telemetry.toolAdaptations, 0, 999)),
      maxTeamwork: clamp(telemetry.maxTeamwork, 0, 100)
    },
    achievementIds: Array.isArray(raw.achievementIds)
      ? [...new Set(raw.achievementIds.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 80)))].slice(0, 96)
      : []
  };
}

export function alien3V92CodexEntry(id) {
  return ALIEN3_CODEX_V92.find((entry) => entry.id === id) || null;
}

export function alien3V92Grade({ gradeV91 = 'D', evidence = 0, wrongTools = 0, teamwork = 0, perfect = false } = {}) {
  const base = { 'S++': 108, 'S+': 101, S: 94, A: 85, B: 74, C: 62, D: 50 }[gradeV91] || 50;
  const evidenceScore = clamp(evidence / Math.max(1, ALIEN3_V92_EVIDENCE_IDS.length), 0, 1) * 8;
  const teamworkScore = clamp(teamwork, 0, 100) * 0.035;
  const discipline = Math.max(0, 3 - Math.min(3, Number(wrongTools) || 0));
  const perfectBonus = perfect ? 3 : 0;
  const score = base + evidenceScore + teamworkScore + discipline + perfectBonus;
  return score >= 119 ? 'S+++' : score >= 111 ? 'S++' : score >= 103 ? 'S+' : score >= 94 ? 'S' : score >= 85 ? 'A' : score >= 74 ? 'B' : score >= 62 ? 'C' : 'D';
}

export function validateAlien3DlcV92() {
  const failures = [];
  const nodes = ALIEN3_FIORINA_TEMPLATE_V92.nodes;
  const edges = ALIEN3_FIORINA_TEMPLATE_V92.edges;
  const routes = ALIEN3_FIORINA_TEMPLATE_V92.routes;
  const zones = ALIEN3_FIORINA_TEMPLATE_V92.zones;
  const nodeIds = new Set(nodes.map((entry) => entry.id));
  const zoneMap = new Map(zones.map((entry) => [entry.id, entry]));
  const edgePairs = new Set(edges.flatMap((entry) => [`${entry.from}>${entry.to}`, `${entry.to}>${entry.from}`]));
  const adjacency = new Map(nodes.map((entry) => [entry.id, []]));
  for (const edge of edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) failures.push(`missing edge endpoint ${edge.id}`);
    adjacency.get(edge.from)?.push(edge.to);
    adjacency.get(edge.to)?.push(edge.from);
  }
  if (ALIEN3_FIORINA_TEMPLATE_V92.id !== ALIEN3_TEMPLATE_ID_V92) failures.push('template id mismatch');
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
  if (new Set(ALIEN3_CODEX_V92.map((entry) => entry.id)).size !== ALIEN3_CODEX_V92.length) failures.push('duplicate V92 codex ids');
  if (new Set(ALIEN3_V92_EVIDENCE_IDS).size !== ALIEN3_V92_EVIDENCE_IDS.length) failures.push('duplicate V92 evidence ids');
  if (new Set(ALIEN3_V92_STATIONS.map((entry) => entry.id)).size !== ALIEN3_V92_STATIONS.length) failures.push('duplicate V92 station ids');
  if (new Set(ALIEN3_SHUTTERS_V92.map((entry) => entry.id)).size !== ALIEN3_SHUTTERS_V92.length) failures.push('duplicate shutter ids');
  if (new Set(ALIEN3_STEAM_VALVES_V92.map((entry) => entry.id)).size !== ALIEN3_STEAM_VALVES_V92.length) failures.push('duplicate steam ids');
  if (![...shutterIds].every((id) => ALIEN3_V92_STATIONS.some((entry) => entry.id === id))) failures.push('shutter station missing');
  if (![...steamIds].every((id) => ALIEN3_V92_STATIONS.some((entry) => entry.id === id))) failures.push('steam station missing');
  return deepFreeze({
    ok: failures.length === 0,
    failures,
    counts: {
      nodes: nodes.length,
      edges: edges.length,
      routes: routes.length,
      zones: zones.length,
      codexV92: ALIEN3_CODEX_V92.length,
      evidence: ALIEN3_V92_EVIDENCE_IDS.length,
      shutters: ALIEN3_SHUTTERS_V92.length,
      steamValves: ALIEN3_STEAM_VALVES_V92.length,
      prisonerCommands: ALIEN3_PRISONER_COMMANDS_V92.length,
      stations: ALIEN3_V92_STATIONS.length,
      inheritedSchema: ALIEN3_DLC_SCHEMA_V91
    }
  });
}
