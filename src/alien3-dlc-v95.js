import {
  ALIEN3_CAMPAIGN_ID_V94,
  ALIEN3_FIORINA_PALETTE_V94,
  ALIEN3_FIORINA_TEMPLATE_V94,
  ALIEN3_OPERATION_ID_V94,
  ALIEN3_TEMPLATE_ID_V94
} from './alien3-dlc-v94.js';

export const ALIEN3_DLC_SCHEMA_V95 = 95;
export const ALIEN3_OPERATION_ID_V95 = ALIEN3_OPERATION_ID_V94;
export const ALIEN3_CAMPAIGN_ID_V95 = ALIEN3_CAMPAIGN_ID_V94;
export const ALIEN3_TEMPLATE_ID_V95 = ALIEN3_TEMPLATE_ID_V94;

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const bool = (value, fallback = false) => typeof value === 'boolean' ? value : fallback;
const unique = (value, allowed, max = 256) => Array.isArray(value)
  ? [...new Set(value.filter((entry) => allowed.has(entry)))].slice(0, max)
  : [];

export const ALIEN3_FIORINA_PALETTE_V95 = deepFreeze({
  ...clone(ALIEN3_FIORINA_PALETTE_V94),
  id: 'fiorina-161-living-hunt-v95',
  light: 0.272,
  prop: 'penal-foundry-living-hunt'
});

/**
 * V95 densifie encore les quatre routes existantes. Les dix nouveaux nœuds
 * servent de refuges, points d'observation, triage et verrous de chasse ; ils
 * ne constituent jamais une cinquième voie traversante.
 */
const template = clone(ALIEN3_FIORINA_TEMPLATE_V94);
template.label = 'Fiorina 161 · Living Hunt / autonomous prisoners';
template.nodes.push(
  { id: 'f161-shelter-cell-v95', x: 2050, y: 630, zoneId: 'f161-cellblock', anchor: null, width: 220 },
  { id: 'f161-watch-cell-v95', x: 2660, y: 190, zoneId: 'f161-cellblock', anchor: null, width: 190 },
  { id: 'f161-refuge-service-v95', x: 2990, y: 630, zoneId: 'f161-service', anchor: null, width: 230 },
  { id: 'f161-hunt-service-v95', x: 3370, y: 330, zoneId: 'f161-service', anchor: null, width: 210 },
  { id: 'f161-triage-overflow-v95', x: 3600, y: 510, zoneId: 'f161-service', anchor: null, width: 220 },
  { id: 'f161-hunt-junction-v95', x: 3900, y: 630, zoneId: 'f161-leadworks', anchor: null, width: 210 },
  { id: 'f161-bait-switch-v95', x: 4320, y: 330, zoneId: 'f161-leadworks', anchor: null, width: 210 },
  { id: 'f161-pressure-alcove-v95', x: 4780, y: 630, zoneId: 'f161-leadworks', anchor: null, width: 220 },
  { id: 'f161-chase-observer-v95', x: 5280, y: 330, zoneId: 'f161-furnace', anchor: null, width: 210 },
  { id: 'f161-archive-checksum-v95', x: 5960, y: 190, zoneId: 'f161-furnace', anchor: null, width: 190 }
);
template.edges.push(
  { id: 'f161-e104', from: 'f161-cell-a', to: 'f161-shelter-cell-v95', kind: 'ladder', routeIds: [] },
  { id: 'f161-e105', from: 'f161-shelter-cell-v95', to: 'f161-assembly-hall', kind: 'ladder', routeIds: [] },
  { id: 'f161-e106', from: 'f161-perch-cell-v93', to: 'f161-watch-cell-v95', kind: 'walk', routeIds: [] },
  { id: 'f161-e107', from: 'f161-watch-cell-v95', to: 'f161-comms-high', kind: 'ladder', routeIds: [] },
  { id: 'f161-e108', from: 'f161-service-deep', to: 'f161-refuge-service-v95', kind: 'walk', routeIds: [] },
  { id: 'f161-e109', from: 'f161-refuge-service-v95', to: 'f161-tunnel-shrine', kind: 'walk', routeIds: [] },
  { id: 'f161-e110', from: 'f161-service-high', to: 'f161-hunt-service-v95', kind: 'walk', routeIds: [] },
  { id: 'f161-e111', from: 'f161-hunt-service-v95', to: 'f161-battery-locker-v94', kind: 'walk', routeIds: [] },
  { id: 'f161-e112', from: 'f161-triage-v93', to: 'f161-triage-overflow-v95', kind: 'walk', routeIds: [] },
  { id: 'f161-e113', from: 'f161-triage-overflow-v95', to: 'f161-shutter-service-node', kind: 'walk', routeIds: [] },
  { id: 'f161-e114', from: 'f161-tunnel-low', to: 'f161-hunt-junction-v95', kind: 'walk', routeIds: [] },
  { id: 'f161-e115', from: 'f161-hunt-junction-v95', to: 'f161-waste-tank', kind: 'walk', routeIds: [] },
  { id: 'f161-e116', from: 'f161-battery-junction-v94', to: 'f161-bait-switch-v95', kind: 'walk', routeIds: [] },
  { id: 'f161-e117', from: 'f161-bait-switch-v95', to: 'f161-sprinkler', kind: 'walk', routeIds: [] },
  { id: 'f161-e118', from: 'f161-chase-reroute-v94', to: 'f161-pressure-alcove-v95', kind: 'walk', routeIds: [] },
  { id: 'f161-e119', from: 'f161-furnace-high', to: 'f161-chase-observer-v95', kind: 'walk', routeIds: [] },
  { id: 'f161-e120', from: 'f161-witness-v93', to: 'f161-archive-checksum-v95', kind: 'ladder', routeIds: [] }
);

export const ALIEN3_FIORINA_TEMPLATE_V95 = deepFreeze(template);

export const ALIEN3_HUNT_PATTERNS_V95 = deepFreeze([
  { id: 'cell-overwatch', label: 'SURPLOMB DU BLOC', x: 2580, y: 100, phases: ['first-blood', 'bishop', 'trap-prep'], heat: 20, style: 'overhead' },
  { id: 'service-cutoff', label: 'COUPURE TECHNIQUE', x: 3360, y: 240, phases: ['trap-prep', 'fire-maze'], heat: 28, style: 'cutoff' },
  { id: 'drain-return', label: 'RETOUR PAR LE DRAIN', x: 3920, y: 540, phases: ['fire-maze', 'leadworks'], heat: 34, style: 'low' },
  { id: 'foundry-feint', label: 'FEINTE DE FONDERIE', x: 4800, y: 240, phases: ['leadworks', 'molten-lead'], heat: 42, style: 'feint' }
]);

export const ALIEN3_V95_STATIONS = deepFreeze([
  { id: 'f161-autonomy-board-v95', kind: 'autonomy-board', x: 2030, y: 558, w: 76, h: 72, label: 'ORGANISER LES BINÔMES' },
  { id: 'f161-shelter-cell-console-v95', kind: 'shelter', shelterId: 'cell', x: 2090, y: 558, w: 68, h: 72, label: 'OUVRIR LE REFUGE DU BLOC' },
  { id: 'f161-shelter-service-console-v95', kind: 'shelter', shelterId: 'service', x: 3008, y: 558, w: 68, h: 72, label: 'OUVRIR LE REFUGE TECHNIQUE' },
  { id: 'f161-triage-overflow-console-v95', kind: 'triage', x: 3565, y: 438, w: 72, h: 72, label: 'ÉTENDRE LE TRIAGE' },
  { id: 'f161-hunt-service-console-v95', kind: 'hunt-log', patternId: 'service-cutoff', x: 3334, y: 258, w: 72, h: 72, label: 'LIRE LES TRACES DE CHASSE' },
  { id: 'f161-hunt-junction-console-v95', kind: 'hunt-log', patternId: 'drain-return', x: 3864, y: 558, w: 72, h: 72, label: 'LIRE LES TRACES DU DRAIN' },
  { id: 'f161-bait-switch-console-v95', kind: 'bait-switch', x: 4284, y: 258, w: 72, h: 72, label: 'ARMER LE LEURRE SECTORIEL' },
  { id: 'f161-pressure-alcove-console-v95', kind: 'pressure-alcove', x: 4744, y: 558, w: 72, h: 72, label: 'OUVRIR L’ALCÔVE DE PRESSION' },
  { id: 'f161-chase-observer-console-v95', kind: 'chase-observer', x: 5244, y: 258, w: 72, h: 72, label: 'VALIDER LA CHASSE ADAPTATIVE' },
  { id: 'f161-archive-checksum-console-v95', kind: 'checksum', x: 5924, y: 118, w: 72, h: 72, label: 'VALIDER LE CHECKSUM MIRE' }
]);

export const ALIEN3_CODEX_V95 = deepFreeze([
  { id: 'f161-v95-living-hunt', title: 'LIVING HUNT', category: 'GAMEPLAY', body: 'V95 fait tourner quatre schémas de chasse persistants. Le Runner reste un seul acteur : le directeur choisit où il coupe la route, pas combien de créatures apparaissent.' },
  { id: 'f161-v95-cell-overwatch', title: 'CHASSE — SURPLOMB DU BLOC', category: 'XÉNOBIOLOGIE', body: 'Le Runner utilise les passerelles hautes du bloc pour anticiper une sortie plutôt que foncer directement sur la dernière position connue.' },
  { id: 'f161-v95-service-cutoff', title: 'CHASSE — COUPURE TECHNIQUE', category: 'XÉNOBIOLOGIE', body: 'Dans les galeries techniques, la créature peut couper la voie en amont et forcer un détour vers une branche déjà visitée.' },
  { id: 'f161-v95-drain-return', title: 'CHASSE — RETOUR PAR LE DRAIN', category: 'XÉNOBIOLOGIE', body: 'La voie basse permet une réapparition hors champ cohérente avec les volumes de maintenance et les connexions profondes de Fiorina.' },
  { id: 'f161-v95-foundry-feint', title: 'CHASSE — FEINTE DE FONDERIE', category: 'XÉNOBIOLOGIE', body: 'Le Runner peut simuler un retrait, reprendre de la hauteur puis couper la route du moule. Le même acteur est conservé pendant toute la séquence.' },
  { id: 'f161-v95-prisoner-autonomy', title: 'AUTONOMIE DES DÉTENUS', category: 'PERSONNEL', body: 'Les détenus disposent désormais de stress, fatigue et courage persistants. Ils peuvent hésiter, se figer, s’entraider ou rejoindre le triage sans ordre direct.' },
  { id: 'f161-v95-buddy-system', title: 'BINÔMES DE SURVIE', category: 'GAMEPLAY', body: 'Un détenu stable peut aider automatiquement un compagnon secoué à reprendre sa tâche lorsque la situation le permet.' },
  { id: 'f161-v95-panic-break', title: 'RUPTURE DE PANIQUE', category: 'GAMEPLAY', body: 'Un niveau de stress extrême peut provoquer un bref gel sur place. Ce n’est pas une mort scriptée : l’entraide, la distance et les refuges peuvent inverser la situation.' },
  { id: 'f161-v95-shelters', title: 'REFUGES D’URGENCE', category: 'GAMEPLAY', body: 'Deux alcôves historiques de service sont utilisables comme points de reprise mentale. Leur effet est limité et ne rend pas le groupe invulnérable.' },
  { id: 'f161-v95-triage-overflow', title: 'TRIAGE ÉTENDU', category: 'PERSONNEL', body: 'Le poste médical secondaire reçoit automatiquement les blessés évacuables et réduit la pression sur les routines de chasse.' },
  { id: 'f161-v95-resource-pressure', title: 'PRESSION DES RESSOURCES', category: 'GAMEPLAY', body: 'Les refuges, leurres et détours industriels augmentent une pression logistique persistante. V95 récompense l’économie plutôt que le spam des outils de contrôle.' },
  { id: 'f161-v95-bait-switch', title: 'LEURRE SECTORIEL', category: 'GAMEPLAY', body: 'Un relais de fonderie prépare un unique leurre sectoriel pour casser une interception. Le Runner peut ensuite intégrer ce détour à son cycle de chasse.' },
  { id: 'f161-v95-pressure-alcove', title: 'ALCÔVE DE PRESSION', category: 'GAMEPLAY', body: 'L’alcôve profonde donne un passage de respiration avant le dernier rabattage, au prix d’une hausse de pression logistique.' },
  { id: 'f161-v95-clean-evade', title: 'ÉVASION PROPRE', category: 'MIRE', body: 'Une interception est considérée évitée proprement si le cycle se termine sans contact rapproché. Les évitements sont persistants et participent au grade.' },
  { id: 'f161-v95-adaptive-chase', title: 'CHASE LOCK', category: 'GAMEPLAY', body: 'Le dernier verrou n’est disponible qu’après plusieurs cycles de chasse et les trois reroutages V94. Il valide que le Runner a réellement été rabattu.' },
  { id: 'f161-v95-checksum', title: 'CHECKSUM MIRE', category: 'ARCHIVE', body: 'Après la transmission V94, un checksum final vérifie les états de chasse, d’autonomie et de continuité avant de permettre la fermeture définitive.' },
  { id: 'f161-v95-zero-breaks', title: 'AUCUNE RUPTURE', category: 'MIRE', body: 'Le contrat de référence peut être terminé sans rupture de panique si le groupe est réparti correctement et les outils ne sont pas surexploités.' },
  { id: 'f161-v95-hunt-telemetry', title: 'TÉLÉMÉTRIE DE CHASSE', category: 'ARCHIVE', body: 'Le journal conserve l’ordre des patterns, leur distance minimale, les évitements et les interruptions afin que la variabilité reste auditable.' },
  { id: 'f161-v95-perfect', title: 'ARCHIVE PARFAITE — LIVING HUNT', category: 'MIRE', body: 'L’archive V95 parfaite exige l’héritage Fidelity V94, les quatre patterns observés, l’autonomie stabilisée, le Chase Lock et le checksum final.' },
  { id: 'f161-v95-one-runner', title: 'UN SEUL PRÉDATEUR', category: 'XÉNOBIOLOGIE', body: 'Toutes les interceptions V95 réutilisent explicitement le même Runner. Les repositionnements hors champ ne génèrent jamais de clone ni de seconde caste.' }
]);

export const ALIEN3_V95_EVIDENCE_IDS = deepFreeze([
  'living-hunt-ready', 'cell-overwatch-seen', 'service-cutoff-seen', 'drain-return-seen', 'foundry-feint-seen',
  'prisoner-autonomy', 'buddy-assist', 'panic-threshold', 'shelter-cell-used', 'shelter-service-used',
  'triage-overflow', 'resource-pressure', 'bait-switch', 'pressure-alcove', 'clean-evade',
  'adaptive-chase-lock', 'hunt-telemetry', 'zero-breaks', 'checksum-final', 'perfect-living-hunt'
]);

const evidenceIds = new Set(ALIEN3_V95_EVIDENCE_IDS);
const codexIds = new Set(ALIEN3_CODEX_V95.map((entry) => entry.id));
const huntIds = new Set(ALIEN3_HUNT_PATTERNS_V95.map((entry) => entry.id));
const stationIds = new Set(ALIEN3_V95_STATIONS.map((entry) => entry.id));

export function createAlien3StateV95() {
  return {
    schema: ALIEN3_DLC_SCHEMA_V95,
    operationId: ALIEN3_OPERATION_ID_V95,
    codexUnlocked: [],
    codexViewed: [],
    currentCodexId: null,
    evidenceRecovered: [],
    hunt: {
      order: ALIEN3_HUNT_PATTERNS_V95.map((entry) => entry.id),
      index: 0,
      encounters: 0,
      activePatternId: null,
      patternClock: 0,
      cooldown: 3,
      minRange: 9999,
      cleanEvades: 0,
      contacts: 0,
      observed: [],
      lastPatternId: null,
      validated: false
    },
    autonomy: {
      boardRead: false,
      initialized: false,
      minds: {},
      steady: 0,
      shaken: 0,
      frozen: 0,
      breakdowns: 0,
      buddyAssists: 0,
      safeTransfers: 0,
      triageExtended: false,
      shelters: { cell: false, service: false },
      zeroBreaks: true
    },
    resources: {
      pressure: 0,
      shelterUses: 0,
      baitSwitchUsed: false,
      pressureAlcoveUsed: false,
      economyScore: 100
    },
    finalChase: {
      lockArmed: false,
      checksumReady: false,
      checksumFinal: false
    },
    perfectArchive: {
      inheritedV94: false,
      huntComplete: false,
      autonomyComplete: false,
      resourceComplete: false,
      chaseComplete: false,
      checksumComplete: false,
      perfect: false
    },
    telemetry: {
      interactions: 0,
      huntTriggers: 0,
      huntContacts: 0,
      huntEvades: 0,
      buddyAssists: 0,
      breakdowns: 0,
      triageTransfers: 0,
      resourcePressurePeak: 0,
      uniqueRunnerIds: []
    },
    achievementIds: []
  };
}

export function sanitizeAlien3StateV95(raw) {
  const fallback = createAlien3StateV95();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Number(raw.schema) !== ALIEN3_DLC_SCHEMA_V95) return fallback;
  const hunt = raw.hunt && typeof raw.hunt === 'object' ? raw.hunt : {};
  const autonomy = raw.autonomy && typeof raw.autonomy === 'object' ? raw.autonomy : {};
  const resources = raw.resources && typeof raw.resources === 'object' ? raw.resources : {};
  const finalChase = raw.finalChase && typeof raw.finalChase === 'object' ? raw.finalChase : {};
  const perfect = raw.perfectArchive && typeof raw.perfectArchive === 'object' ? raw.perfectArchive : {};
  const telemetry = raw.telemetry && typeof raw.telemetry === 'object' ? raw.telemetry : {};
  const minds = {};
  if (autonomy.minds && typeof autonomy.minds === 'object' && !Array.isArray(autonomy.minds)) {
    for (const [id, mind] of Object.entries(autonomy.minds).slice(0, 32)) {
      if (!mind || typeof mind !== 'object') continue;
      minds[String(id).slice(0, 64)] = {
        stress: clamp(mind.stress, 0, 100),
        fatigue: clamp(mind.fatigue, 0, 100),
        courage: clamp(mind.courage, 0, 100),
        frozenClock: clamp(mind.frozenClock, 0, 30),
        assistCooldown: clamp(mind.assistCooldown, 0, 60),
        state: ['steady', 'shaken', 'frozen', 'wounded', 'triage'].includes(mind.state) ? mind.state : 'steady',
        transferred: bool(mind.transferred)
      };
    }
  }
  const order = Array.isArray(hunt.order) ? hunt.order.filter((id) => huntIds.has(id)) : [];
  for (const id of huntIds) if (!order.includes(id)) order.push(id);
  return {
    ...fallback,
    codexUnlocked: unique(raw.codexUnlocked, codexIds),
    codexViewed: unique(raw.codexViewed, codexIds),
    currentCodexId: codexIds.has(raw.currentCodexId) ? raw.currentCodexId : null,
    evidenceRecovered: unique(raw.evidenceRecovered, evidenceIds),
    hunt: {
      order: order.slice(0, ALIEN3_HUNT_PATTERNS_V95.length),
      index: Math.round(clamp(hunt.index, 0, 999)),
      encounters: Math.round(clamp(hunt.encounters, 0, 999)),
      activePatternId: huntIds.has(hunt.activePatternId) ? hunt.activePatternId : null,
      patternClock: clamp(hunt.patternClock, 0, 30),
      cooldown: clamp(hunt.cooldown, 0, 120),
      minRange: clamp(hunt.minRange, 0, 9999),
      cleanEvades: Math.round(clamp(hunt.cleanEvades, 0, 999)),
      contacts: Math.round(clamp(hunt.contacts, 0, 999)),
      observed: unique(hunt.observed, huntIds, ALIEN3_HUNT_PATTERNS_V95.length),
      lastPatternId: huntIds.has(hunt.lastPatternId) ? hunt.lastPatternId : null,
      validated: bool(hunt.validated)
    },
    autonomy: {
      boardRead: bool(autonomy.boardRead),
      initialized: bool(autonomy.initialized),
      minds,
      steady: Math.round(clamp(autonomy.steady, 0, 32)),
      shaken: Math.round(clamp(autonomy.shaken, 0, 32)),
      frozen: Math.round(clamp(autonomy.frozen, 0, 32)),
      breakdowns: Math.round(clamp(autonomy.breakdowns, 0, 999)),
      buddyAssists: Math.round(clamp(autonomy.buddyAssists, 0, 999)),
      safeTransfers: Math.round(clamp(autonomy.safeTransfers, 0, 999)),
      triageExtended: bool(autonomy.triageExtended),
      shelters: { cell: bool(autonomy.shelters?.cell), service: bool(autonomy.shelters?.service) },
      zeroBreaks: bool(autonomy.zeroBreaks, true)
    },
    resources: {
      pressure: clamp(resources.pressure, 0, 100),
      shelterUses: Math.round(clamp(resources.shelterUses, 0, 99)),
      baitSwitchUsed: bool(resources.baitSwitchUsed),
      pressureAlcoveUsed: bool(resources.pressureAlcoveUsed),
      economyScore: clamp(resources.economyScore, 0, 100)
    },
    finalChase: {
      lockArmed: bool(finalChase.lockArmed),
      checksumReady: bool(finalChase.checksumReady),
      checksumFinal: bool(finalChase.checksumFinal)
    },
    perfectArchive: {
      inheritedV94: bool(perfect.inheritedV94),
      huntComplete: bool(perfect.huntComplete),
      autonomyComplete: bool(perfect.autonomyComplete),
      resourceComplete: bool(perfect.resourceComplete),
      chaseComplete: bool(perfect.chaseComplete),
      checksumComplete: bool(perfect.checksumComplete),
      perfect: bool(perfect.perfect)
    },
    telemetry: {
      interactions: Math.round(clamp(telemetry.interactions, 0, 9999)),
      huntTriggers: Math.round(clamp(telemetry.huntTriggers, 0, 999)),
      huntContacts: Math.round(clamp(telemetry.huntContacts, 0, 999)),
      huntEvades: Math.round(clamp(telemetry.huntEvades, 0, 999)),
      buddyAssists: Math.round(clamp(telemetry.buddyAssists, 0, 999)),
      breakdowns: Math.round(clamp(telemetry.breakdowns, 0, 999)),
      triageTransfers: Math.round(clamp(telemetry.triageTransfers, 0, 999)),
      resourcePressurePeak: clamp(telemetry.resourcePressurePeak, 0, 100),
      uniqueRunnerIds: Array.isArray(telemetry.uniqueRunnerIds)
        ? [...new Set(telemetry.uniqueRunnerIds.filter((id) => typeof id === 'string').map((id) => id.slice(0, 96)))].slice(0, 8)
        : []
    },
    achievementIds: Array.isArray(raw.achievementIds)
      ? [...new Set(raw.achievementIds.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 96)))].slice(0, 128)
      : []
  };
}

export function alien3V95CodexEntry(id) {
  return ALIEN3_CODEX_V95.find((entry) => entry.id === id) || null;
}

export function alien3V95HuntPattern(id) {
  return ALIEN3_HUNT_PATTERNS_V95.find((entry) => entry.id === id) || ALIEN3_HUNT_PATTERNS_V95[0];
}

export function alien3V95Grade({
  gradeV94 = 'D', evidence = 0, huntPatterns = 0, cleanEvades = 0,
  zeroBreaks = false, economy = 0, checksum = false, perfect = false
} = {}) {
  const base = { 'S+++++': 158, 'S++++': 148, 'S+++': 139, 'S++': 130, 'S+': 120, S: 108, A: 94, B: 80, C: 66, D: 52 }[gradeV94] || 52;
  const evidenceScore = clamp(evidence / Math.max(1, ALIEN3_V95_EVIDENCE_IDS.length), 0, 1) * 8;
  const huntScore = clamp(huntPatterns / ALIEN3_HUNT_PATTERNS_V95.length, 0, 1) * 6;
  const evadeScore = clamp(cleanEvades / 2, 0, 1) * 3;
  const cohesionScore = zeroBreaks ? 3 : 0;
  const economyScore = clamp(economy / 100, 0, 1) * 3;
  const checksumScore = checksum ? 3 : 0;
  const perfectBonus = perfect ? 5 : 0;
  const score = base + evidenceScore + huntScore + evadeScore + cohesionScore + economyScore + checksumScore + perfectBonus;
  return score >= 182 ? 'S++++++'
    : score >= 170 ? 'S+++++'
      : score >= 158 ? 'S++++'
        : score >= 146 ? 'S+++'
          : score >= 134 ? 'S++'
            : score >= 122 ? 'S+'
              : score >= 108 ? 'S'
                : score >= 94 ? 'A'
                  : score >= 80 ? 'B'
                    : score >= 66 ? 'C' : 'D';
}

export function validateAlien3DlcV95() {
  const failures = [];
  const nodes = ALIEN3_FIORINA_TEMPLATE_V95.nodes;
  const edges = ALIEN3_FIORINA_TEMPLATE_V95.edges;
  const routes = ALIEN3_FIORINA_TEMPLATE_V95.routes;
  const zones = ALIEN3_FIORINA_TEMPLATE_V95.zones;
  const nodeIds = new Set(nodes.map((entry) => entry.id));
  const edgePairs = new Set(edges.flatMap((entry) => [`${entry.from}>${entry.to}`, `${entry.to}>${entry.from}`]));
  const zoneMap = new Map(zones.map((entry) => [entry.id, entry]));
  const adjacency = new Map(nodes.map((entry) => [entry.id, []]));
  for (const edge of edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) failures.push(`missing edge endpoint ${edge.id}`);
    adjacency.get(edge.from)?.push(edge.to);
    if (!edge.oneWay) adjacency.get(edge.to)?.push(edge.from);
  }
  if (ALIEN3_FIORINA_TEMPLATE_V95.id !== ALIEN3_TEMPLATE_ID_V95) failures.push('template id mismatch');
  if (nodes.length !== 72) failures.push(`node count ${nodes.length} != 72`);
  if (edges.length !== 119) failures.push(`edge count ${edges.length} != 119`);
  if (routes.length !== 4) failures.push(`route count ${routes.length} != 4`);
  if (ALIEN3_HUNT_PATTERNS_V95.length !== 4) failures.push('four hunt patterns required');
  if (ALIEN3_CODEX_V95.length !== 20) failures.push(`codex count ${ALIEN3_CODEX_V95.length} != 20`);
  if (ALIEN3_V95_EVIDENCE_IDS.length !== 20) failures.push(`evidence count ${ALIEN3_V95_EVIDENCE_IDS.length} != 20`);
  if (ALIEN3_V95_STATIONS.length !== 10) failures.push(`station count ${ALIEN3_V95_STATIONS.length} != 10`);
  if (new Set(nodes.map((entry) => entry.id)).size !== nodes.length) failures.push('duplicate node ids');
  if (new Set(edges.map((entry) => entry.id)).size !== edges.length) failures.push('duplicate edge ids');
  if (stationIds.size !== ALIEN3_V95_STATIONS.length) failures.push('duplicate station ids');
  if (codexIds.size !== ALIEN3_CODEX_V95.length) failures.push('duplicate codex ids');
  if (evidenceIds.size !== ALIEN3_V95_EVIDENCE_IDS.length) failures.push('duplicate evidence ids');
  for (const entry of nodes) {
    const zone = zoneMap.get(entry.zoneId);
    if (!zone) failures.push(`unknown zone ${entry.zoneId}`);
    else if (entry.x < zone.x - 32 || entry.x > zone.x + zone.w + 32) failures.push(`node outside zone ${entry.id}`);
  }
  for (const route of routes) {
    for (let index = 1; index < route.nodeIds.length; index += 1) {
      const pair = `${route.nodeIds[index - 1]}>${route.nodeIds[index]}`;
      if (!edgePairs.has(pair)) failures.push(`broken route ${route.id}: ${pair}`);
    }
  }
  const spawnId = nodes.find((entry) => entry.anchor === 'spawn')?.id;
  const extractionId = nodes.find((entry) => entry.anchor === 'extraction')?.id;
  const reached = new Set(spawnId ? [spawnId] : []);
  const queue = spawnId ? [spawnId] : [];
  while (queue.length) {
    const current = queue.shift();
    for (const next of adjacency.get(current) || []) {
      if (reached.has(next)) continue;
      reached.add(next);
      queue.push(next);
    }
  }
  if (reached.size !== nodes.length) failures.push(`graph disconnected ${reached.size}/${nodes.length}`);
  if (extractionId && !reached.has(extractionId)) failures.push('extraction unreachable');
  return deepFreeze({
    ok: failures.length === 0,
    failures,
    counts: {
      nodes: nodes.length, edges: edges.length, routes: routes.length, zones: zones.length,
      codex: ALIEN3_CODEX_V95.length, evidence: ALIEN3_V95_EVIDENCE_IDS.length,
      huntPatterns: ALIEN3_HUNT_PATTERNS_V95.length, stations: ALIEN3_V95_STATIONS.length,
      connectedNodes: reached.size
    }
  });
}
