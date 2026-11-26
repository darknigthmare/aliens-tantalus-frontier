import {
  ALIEN3_CAMPAIGN_ID_V89,
  ALIEN3_FIORINA_PALETTE_V89,
  ALIEN3_FIORINA_TEMPLATE_V89,
  ALIEN3_OPERATION_ID_V89,
  ALIEN3_TEMPLATE_ID_V89
} from './alien3-dlc-v89.js';

export const ALIEN3_DLC_SCHEMA_V90 = 90;
export const ALIEN3_OPERATION_ID_V90 = ALIEN3_OPERATION_ID_V89;
export const ALIEN3_CAMPAIGN_ID_V90 = ALIEN3_CAMPAIGN_ID_V89;
export const ALIEN3_TEMPLATE_ID_V90 = ALIEN3_TEMPLATE_ID_V89;

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

export const ALIEN3_FIORINA_PALETTE_V90 = deepFreeze({
  ...clone(ALIEN3_FIORINA_PALETTE_V89),
  id: 'fiorina-161-fire-plan-v90',
  light: 0.3,
  prop: 'penal-foundry-fire-plan'
});

/**
 * V90 adds physical side nodes for the flammable tunnel plan, the EEV medical
 * return and foundry preparation. They are connected to the V89 graph but do
 * not fake a fifth end-to-end route simply to inflate the route count.
 */
const template = clone(ALIEN3_FIORINA_TEMPLATE_V89);
template.label = 'Fiorina 161 · archive MIRE intégrale V90';
template.nodes.push(
  { id: 'f161-fuel-manifold-a', x: 2960, y: 510, zoneId: 'f161-service', anchor: null, width: 180 },
  { id: 'f161-fuel-manifold-b', x: 3240, y: 510, zoneId: 'f161-service', anchor: null, width: 180 },
  { id: 'f161-chemical-store', x: 3670, y: 510, zoneId: 'f161-service', anchor: null, width: 210 },
  { id: 'f161-lead-primer', x: 4380, y: 510, zoneId: 'f161-leadworks', anchor: null, width: 190 },
  { id: 'f161-water-header', x: 4690, y: 330, zoneId: 'f161-leadworks', anchor: null, width: 190 },
  { id: 'f161-furnace-overlook', x: 5580, y: 330, zoneId: 'f161-furnace', anchor: null, width: 220 }
);
template.edges.push(
  { id: 'f161-e35', from: 'f161-service-low', to: 'f161-fuel-manifold-a', kind: 'walk', routeIds: [] },
  { id: 'f161-e36', from: 'f161-fuel-manifold-a', to: 'f161-fuel-manifold-b', kind: 'walk', routeIds: [] },
  { id: 'f161-e37', from: 'f161-fuel-manifold-b', to: 'f161-bishop', kind: 'walk', routeIds: [] },
  { id: 'f161-e38', from: 'f161-bishop', to: 'f161-chemical-store', kind: 'walk', routeIds: [] },
  { id: 'f161-e39', from: 'f161-chemical-store', to: 'f161-tunnel-high', kind: 'ladder', routeIds: [] },
  { id: 'f161-e40', from: 'f161-leadworks', to: 'f161-lead-primer', kind: 'walk', routeIds: [] },
  { id: 'f161-e41', from: 'f161-lead-primer', to: 'f161-mold', kind: 'walk', routeIds: [] },
  { id: 'f161-e42', from: 'f161-sprinkler', to: 'f161-water-header', kind: 'walk', routeIds: [] },
  { id: 'f161-e43', from: 'f161-water-header', to: 'f161-mold', kind: 'ladder', routeIds: [] },
  { id: 'f161-e44', from: 'f161-furnace-high', to: 'f161-furnace-overlook', kind: 'walk', routeIds: [] },
  { id: 'f161-e45', from: 'f161-furnace-overlook', to: 'f161-company', kind: 'ladder', routeIds: [] }
);

export const ALIEN3_FIORINA_TEMPLATE_V90 = deepFreeze(template);

export const ALIEN3_CHALLENGES_V90 = deepFreeze([
  {
    id: 'archive', label: 'ARCHIVE STANDARD', runnerSpeed: 1, damageScale: 1,
    flaresAllowed: true, description: 'Reconstruction principale sans modificateur de rejouabilité.'
  },
  {
    id: 'mire-purist', label: 'MIRE PURISTE', runnerSpeed: 1.08, damageScale: 1.08,
    flaresAllowed: false, description: 'Aucun flare : lecture de la traque et déplacements silencieux obligatoires.'
  },
  {
    id: 'fury-nightmare', label: 'FURY NIGHTMARE', runnerSpeed: 1.18, damageScale: 1.2,
    flaresAllowed: true, description: 'Runner plus agressif, bruit plus punitif et fenêtre d’évasion réduite.'
  }
]);

export const ALIEN3_CODEX_V90 = deepFreeze([
  { id: 'f161-quinitricetyline', title: 'QUINITRICETYLINE', category: 'MATIÈRE', body: 'Produit inflammable stocké dans le complexe. V90 le transforme en réseau physique de manifolds à préparer avant l’ignition des galeries.' },
  { id: 'f161-fire-assignments', title: 'PLAN DES SECTIONS', category: 'TACTIQUE', body: 'Les détenus se répartissent les sections de tunnel, les fûts et les points de repli. Leur position devient un état de gameplay suivi et sauvegardé.' },
  { id: 'f161-fire-accident', title: 'RUPTURE DU PLAN INCENDIAIRE', category: 'ÉVÉNEMENT', body: 'La propagation devient incontrôlable et disperse les équipes. Le piège ne tue pas le Runner et force la reconstruction à changer de stratégie.' },
  { id: 'f161-eev-medical-scan', title: 'SCAN MÉDICAL EEV', category: 'MIRE', body: 'La découverte de l’embryon royal intervient après le désastre des galeries. V90 replace ce diagnostic dans la bonne fenêtre de progression.' },
  { id: 'f161-royal-host-signal', title: 'SIGNAL DE L’HÔTE ROYAL', category: 'XÉNOBIOLOGIE', body: 'Le comportement d’épargne du Runner devient rétrospectivement interprétable après le scan, sans révéler au joueur l’information trop tôt.' },
  { id: 'f161-lead-primer', title: 'PRÉPARATION DE LA CUVE DE PLOMB', category: 'INDUSTRIE', body: 'La cuve doit être portée à son état opérationnel avant la poursuite dans le moule. Le contrôle est distinct du déversement final.' },
  { id: 'f161-water-header', title: 'COLLECTEUR D’EXTINCTION', category: 'INDUSTRIE', body: 'Le réseau d’eau doit être pressurisé avant l’usage du moule. Cette préparation rend la séquence plomb puis choc thermique entièrement causale.' },
  { id: 'f161-dillon-last-stand', title: 'DILLON — DERNIER APPÂT', category: 'PERSONNEL', body: 'Dillon reste assigné au moule pendant le dernier rabattement. Son rôle est suivi séparément du contrôle de plomb de Morse.' },
  { id: 'f161-morse-lead-control', title: 'MORSE — COMMANDE DU PLOMB', category: 'PERSONNEL', body: 'Morse est affecté à la commande haute du plomb dans la dernière phase de la chasse et reste le témoin survivant de l’archive.' },
  { id: 'f161-mire-challenges', title: 'PROTOCOLES DE RELECTURE MIRE', category: 'GAMEPLAY', body: 'Après maîtrise de l’archive, des règles optionnelles modifient le bruit, les flares et l’agressivité sans changer la chronologie reconstruite.' }
]);

export const ALIEN3_FIRE_MANIFOLDS_V90 = deepFreeze([
  { id: 'f161-fuel-a', section: 'A', x: 3100, y: 438, w: 64, h: 72, prisonerId: 'david' },
  { id: 'f161-fuel-b', section: 'B', x: 3440, y: 438, w: 64, h: 72, prisonerId: 'kevin' },
  { id: 'f161-fuel-c', section: 'C', x: 3640, y: 438, w: 64, h: 72, prisonerId: 'troy' },
  { id: 'f161-fuel-d', section: 'D', x: 3970, y: 438, w: 64, h: 72, prisonerId: 'gregor' }
]);

export const ALIEN3_FIRE_SEGMENTS_V90 = deepFreeze([
  { id: 'fire-a', x: 2920, y: 474, w: 260, h: 36, delay: 0.55 },
  { id: 'fire-b', x: 3210, y: 474, w: 260, h: 36, delay: 1.0 },
  { id: 'fire-c', x: 3500, y: 474, w: 260, h: 36, delay: 1.45 },
  { id: 'fire-d', x: 3790, y: 474, w: 270, h: 36, delay: 1.9 },
  { id: 'fire-e', x: 4090, y: 474, w: 270, h: 36, delay: 2.35 },
  { id: 'fire-f', x: 4390, y: 474, w: 270, h: 36, delay: 2.8 }
]);

export const ALIEN3_V90_STATIONS = deepFreeze([
  ...ALIEN3_FIRE_MANIFOLDS_V90.map((entry) => ({ ...entry, kind: 'fuel-manifold', label: `MANIFOLD QUINITRICETYLINE ${entry.section}` })),
  { id: 'f161-eev-medical-scanner', kind: 'medical-scan', x: 650, y: 430, w: 76, h: 80, label: 'SCANNER MÉDICAL EEV' },
  { id: 'f161-lead-vat-primer', kind: 'lead-primer', x: 4380, y: 430, w: 74, h: 80, label: 'PRÉCHAUFFER LA CUVE DE PLOMB' },
  { id: 'f161-water-header-control', kind: 'water-header', x: 4690, y: 250, w: 74, h: 80, label: 'PRESSURISER LE COLLECTEUR D’EAU' },
  { id: 'f161-mire-challenge-terminal', kind: 'challenge', x: 900, y: 438, w: 70, h: 72, label: 'PROTOCOLE DE RELECTURE MIRE' }
]);

export const ALIEN3_PRISONER_TASKS_V90 = deepFreeze({
  trapPrep: {
    dillon: 2860, morse: 2780, david: 3100, kevin: 3440, troy: 3640, gregor: 3970,
    junior: 3880, golic: 2120, frank: 3100, eric: 3400
  },
  fireMaze: {
    dillon: 4160, morse: 4020, david: 4300, kevin: 4460, troy: 4580, gregor: 4700,
    junior: 4040, golic: 2160, frank: 3300, eric: 3500
  },
  leadworks: {
    dillon: 4930, morse: 5340, david: 4700, kevin: 4780, troy: 4860, gregor: 5000,
    junior: 4100, golic: 2160, frank: 3300, eric: 3500
  },
  finale: { morse: 5700, dillon: 5060 }
});

export const ALIEN3_V90_EVIDENCE_IDS = deepFreeze([
  'quinitricetyline', 'fire-assignments', 'fire-accident', 'eev-medical-scan', 'royal-host-signal',
  'lead-primer', 'water-header', 'dillon-last-stand', 'morse-lead-control', 'mire-challenge'
]);

const codexIds = new Set(ALIEN3_CODEX_V90.map((entry) => entry.id));
const evidenceIds = new Set(ALIEN3_V90_EVIDENCE_IDS);
const challengeIds = new Set(ALIEN3_CHALLENGES_V90.map((entry) => entry.id));
const manifoldIds = new Set(ALIEN3_FIRE_MANIFOLDS_V90.map((entry) => entry.id));
const segmentIds = new Set(ALIEN3_FIRE_SEGMENTS_V90.map((entry) => entry.id));

export function createAlien3StateV90({ challengeId = 'archive' } = {}) {
  const challenge = challengeIds.has(challengeId) ? challengeId : 'archive';
  return {
    schema: ALIEN3_DLC_SCHEMA_V90,
    operationId: ALIEN3_OPERATION_ID_V90,
    challengeId: challenge,
    challengeLocked: false,
    codexUnlocked: [],
    codexViewed: [],
    currentCodexId: null,
    evidenceRecovered: [],
    firePlan: {
      manifolds: Object.fromEntries([...manifoldIds].map((id) => [id, false])),
      prepared: false,
      ignited: false,
      accidentClock: 0,
      accidentResolved: false,
      activeSegments: [],
      burnCooldown: 0,
      casualtiesLogged: false
    },
    diagnosis: {
      scanAvailable: false,
      scanComplete: false,
      queenCodexDeferred: false,
      returnedToEev: false
    },
    leadworks: {
      vatPrimed: false,
      waterPressurized: false,
      moldReady: false,
      dillonCommitted: false,
      morseAtLeadControl: false
    },
    sensory: {
      noise: 0,
      noisePeak: 0,
      silentSeconds: 0,
      routeMemory: {},
      currentZoneId: null,
      lastZoneId: null,
      repeatedRoutePressure: 0,
      stealthWindows: 0,
      loudActions: 0
    },
    prisonerPlan: {
      morale: 72,
      panic: 0,
      assignmentsIssued: false,
      activeTaskSet: 'none',
      taskCompletions: [],
      casualtyEvents: []
    },
    presentation: {
      cardClock: 0,
      cardKind: null,
      title: '',
      subtitle: '',
      beatId: null
    },
    atmosphere: {
      ashSeed: 161,
      steamPulse: 0,
      sparkPulse: 0,
      rainPulse: 0
    },
    stats: {
      manifoldsArmed: 0,
      fireBurnsTaken: 0,
      scanTrips: 0,
      leadPrepActions: 0,
      challengeChanges: 0,
      routeRepetitions: 0,
      stealthSeconds: 0
    },
    achievementIds: []
  };
}

export function sanitizeAlien3StateV90(raw) {
  const fallback = createAlien3StateV90();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Number(raw.schema) !== ALIEN3_DLC_SCHEMA_V90) return fallback;
  const firePlan = raw.firePlan && typeof raw.firePlan === 'object' ? raw.firePlan : {};
  const diagnosis = raw.diagnosis && typeof raw.diagnosis === 'object' ? raw.diagnosis : {};
  const leadworks = raw.leadworks && typeof raw.leadworks === 'object' ? raw.leadworks : {};
  const sensory = raw.sensory && typeof raw.sensory === 'object' ? raw.sensory : {};
  const prisonerPlan = raw.prisonerPlan && typeof raw.prisonerPlan === 'object' ? raw.prisonerPlan : {};
  const presentation = raw.presentation && typeof raw.presentation === 'object' ? raw.presentation : {};
  const atmosphere = raw.atmosphere && typeof raw.atmosphere === 'object' ? raw.atmosphere : {};
  const stats = raw.stats && typeof raw.stats === 'object' ? raw.stats : {};
  const manifolds = firePlan.manifolds && typeof firePlan.manifolds === 'object' ? firePlan.manifolds : {};
  const routeMemory = sensory.routeMemory && typeof sensory.routeMemory === 'object' ? sensory.routeMemory : {};
  return {
    ...fallback,
    challengeId: challengeIds.has(raw.challengeId) ? raw.challengeId : 'archive',
    challengeLocked: bool(raw.challengeLocked),
    codexUnlocked: unique(raw.codexUnlocked, codexIds),
    codexViewed: unique(raw.codexViewed, codexIds),
    currentCodexId: codexIds.has(raw.currentCodexId) ? raw.currentCodexId : null,
    evidenceRecovered: unique(raw.evidenceRecovered, evidenceIds),
    firePlan: {
      manifolds: Object.fromEntries([...manifoldIds].map((id) => [id, bool(manifolds[id])])),
      prepared: bool(firePlan.prepared),
      ignited: bool(firePlan.ignited),
      accidentClock: clamp(firePlan.accidentClock, 0, 60),
      accidentResolved: bool(firePlan.accidentResolved),
      activeSegments: unique(firePlan.activeSegments, segmentIds),
      burnCooldown: clamp(firePlan.burnCooldown, 0, 10),
      casualtiesLogged: bool(firePlan.casualtiesLogged)
    },
    diagnosis: {
      scanAvailable: bool(diagnosis.scanAvailable),
      scanComplete: bool(diagnosis.scanComplete),
      queenCodexDeferred: bool(diagnosis.queenCodexDeferred),
      returnedToEev: bool(diagnosis.returnedToEev)
    },
    leadworks: {
      vatPrimed: bool(leadworks.vatPrimed),
      waterPressurized: bool(leadworks.waterPressurized),
      moldReady: bool(leadworks.moldReady),
      dillonCommitted: bool(leadworks.dillonCommitted),
      morseAtLeadControl: bool(leadworks.morseAtLeadControl)
    },
    sensory: {
      noise: clamp(sensory.noise, 0, 100),
      noisePeak: clamp(sensory.noisePeak, 0, 100),
      silentSeconds: clamp(sensory.silentSeconds, 0, 99999),
      routeMemory: Object.fromEntries(Object.entries(routeMemory).slice(0, 32).map(([key, value]) => [boundedText(key, 'zone', 80), Math.round(clamp(value, 0, 99))])),
      currentZoneId: boundedText(sensory.currentZoneId, '', 80) || null,
      lastZoneId: boundedText(sensory.lastZoneId, '', 80) || null,
      repeatedRoutePressure: clamp(sensory.repeatedRoutePressure, 0, 30),
      stealthWindows: Math.round(clamp(sensory.stealthWindows, 0, 999)),
      loudActions: Math.round(clamp(sensory.loudActions, 0, 9999))
    },
    prisonerPlan: {
      morale: clamp(prisonerPlan.morale, 0, 100),
      panic: clamp(prisonerPlan.panic, 0, 100),
      assignmentsIssued: bool(prisonerPlan.assignmentsIssued),
      activeTaskSet: ['none', 'trapPrep', 'fireMaze', 'leadworks', 'finale'].includes(prisonerPlan.activeTaskSet) ? prisonerPlan.activeTaskSet : 'none',
      taskCompletions: Array.isArray(prisonerPlan.taskCompletions) ? [...new Set(prisonerPlan.taskCompletions.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 96)))].slice(0, 64) : [],
      casualtyEvents: Array.isArray(prisonerPlan.casualtyEvents) ? [...new Set(prisonerPlan.casualtyEvents.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 96)))].slice(0, 64) : []
    },
    presentation: {
      cardClock: clamp(presentation.cardClock, 0, 12),
      cardKind: ['chapter', 'event', 'evidence', 'challenge'].includes(presentation.cardKind) ? presentation.cardKind : null,
      title: boundedText(presentation.title, '', 100),
      subtitle: boundedText(presentation.subtitle, '', 220),
      beatId: boundedText(presentation.beatId, '', 100) || null
    },
    atmosphere: {
      ashSeed: Math.round(clamp(atmosphere.ashSeed, 0, 999999)),
      steamPulse: clamp(atmosphere.steamPulse, 0, 10000),
      sparkPulse: clamp(atmosphere.sparkPulse, 0, 10000),
      rainPulse: clamp(atmosphere.rainPulse, 0, 10000)
    },
    stats: {
      manifoldsArmed: Math.round(clamp(stats.manifoldsArmed, 0, ALIEN3_FIRE_MANIFOLDS_V90.length)),
      fireBurnsTaken: Math.round(clamp(stats.fireBurnsTaken, 0, 999)),
      scanTrips: Math.round(clamp(stats.scanTrips, 0, 99)),
      leadPrepActions: Math.round(clamp(stats.leadPrepActions, 0, 8)),
      challengeChanges: Math.round(clamp(stats.challengeChanges, 0, 99)),
      routeRepetitions: Math.round(clamp(stats.routeRepetitions, 0, 999)),
      stealthSeconds: clamp(stats.stealthSeconds, 0, 99999)
    },
    achievementIds: Array.isArray(raw.achievementIds)
      ? [...new Set(raw.achievementIds.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 80)))].slice(0, 48)
      : []
  };
}

export function alien3V90CodexEntry(id) {
  return ALIEN3_CODEX_V90.find((entry) => entry.id === id) || null;
}

export function alien3V90Challenge(id) {
  return ALIEN3_CHALLENGES_V90.find((entry) => entry.id === id) || ALIEN3_CHALLENGES_V90[0];
}

export function alien3V90Grade({ synchronization = 100, evidenceV89 = 0, totalV89 = 10, evidenceV90 = 0, totalV90 = ALIEN3_V90_EVIDENCE_IDS.length, damageTaken = 0, stealthSeconds = 0 } = {}) {
  const sync = clamp(synchronization, 0, 100);
  const evidenceRatio = (clamp(evidenceV89, 0, totalV89) + clamp(evidenceV90, 0, totalV90)) / Math.max(1, totalV89 + totalV90);
  const survival = Math.max(0, 8 - Math.min(8, Number(damageTaken) / 35));
  const stealth = Math.min(5, Number(stealthSeconds) / 24);
  const score = sync * 0.66 + evidenceRatio * 21 + survival + stealth;
  return score >= 95 ? 'S+' : score >= 91 ? 'S' : score >= 82 ? 'A' : score >= 70 ? 'B' : score >= 56 ? 'C' : 'D';
}

export function validateAlien3DlcV90() {
  const failures = [];
  const nodes = ALIEN3_FIORINA_TEMPLATE_V90.nodes;
  const edges = ALIEN3_FIORINA_TEMPLATE_V90.edges;
  const routes = ALIEN3_FIORINA_TEMPLATE_V90.routes;
  const zones = ALIEN3_FIORINA_TEMPLATE_V90.zones;
  const nodeIds = new Set(nodes.map((entry) => entry.id));
  const zoneMap = new Map(zones.map((entry) => [entry.id, entry]));
  if (ALIEN3_FIORINA_TEMPLATE_V90.id !== ALIEN3_TEMPLATE_ID_V90) failures.push('template id mismatch');
  if (routes.length !== 4) failures.push(`routes: ${routes.length} != 4`);
  if (new Set(nodes.map((entry) => entry.id)).size !== nodes.length) failures.push('duplicate node ids');
  if (new Set(edges.map((entry) => entry.id)).size !== edges.length) failures.push('duplicate edge ids');
  for (const entry of nodes) {
    const zone = zoneMap.get(entry.zoneId);
    if (!zone) failures.push(`unknown zone ${entry.zoneId}`);
    else if (entry.x < zone.x - 32 || entry.x > zone.x + zone.w + 32) failures.push(`node outside zone: ${entry.id}`);
  }
  const adjacency = new Map(nodes.map((entry) => [entry.id, []]));
  for (const entry of edges) {
    if (!nodeIds.has(entry.from) || !nodeIds.has(entry.to)) failures.push(`edge endpoint missing: ${entry.id}`);
    adjacency.get(entry.from)?.push(entry.to);
    if (!entry.oneWay) adjacency.get(entry.to)?.push(entry.from);
  }
  const spawn = nodes.find((entry) => entry.anchor === 'spawn')?.id;
  const reached = new Set(spawn ? [spawn] : []);
  const queue = [...reached];
  while (queue.length) {
    const current = queue.shift();
    for (const next of adjacency.get(current) || []) if (!reached.has(next)) { reached.add(next); queue.push(next); }
  }
  if (reached.size !== nodes.length) failures.push(`graph disconnected: ${reached.size}/${nodes.length}`);
  if (ALIEN3_FIRE_MANIFOLDS_V90.length !== 4) failures.push('fire manifolds incomplete');
  if (ALIEN3_FIRE_SEGMENTS_V90.length < 6) failures.push('fire propagation segments incomplete');
  if (ALIEN3_CODEX_V90.length !== 10) failures.push(`V90 codex: ${ALIEN3_CODEX_V90.length} != 10`);
  if (new Set(ALIEN3_CODEX_V90.map((entry) => entry.id)).size !== ALIEN3_CODEX_V90.length) failures.push('duplicate V90 codex ids');
  if (new Set(ALIEN3_V90_EVIDENCE_IDS).size !== ALIEN3_V90_EVIDENCE_IDS.length) failures.push('duplicate V90 evidence ids');
  if (ALIEN3_CHALLENGES_V90.length !== 3) failures.push('challenge set incomplete');
  return deepFreeze({
    ok: failures.length === 0,
    failures,
    counts: {
      nodes: nodes.length,
      edges: edges.length,
      routes: routes.length,
      zones: zones.length,
      manifolds: ALIEN3_FIRE_MANIFOLDS_V90.length,
      fireSegments: ALIEN3_FIRE_SEGMENTS_V90.length,
      codex: ALIEN3_CODEX_V90.length,
      evidence: ALIEN3_V90_EVIDENCE_IDS.length,
      challenges: ALIEN3_CHALLENGES_V90.length,
      connectedNodes: reached.size
    }
  });
}
