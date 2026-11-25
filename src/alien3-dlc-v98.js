import {
  ALIEN3_CAMPAIGN_ID_V97,
  ALIEN3_DEPTH_LANES_V97,
  ALIEN3_DLC_CODEX_BATCHES_V97,
  ALIEN3_DLC_CODEX_TERMINALS_V97,
  ALIEN3_DLC_CODEX_V97,
  ALIEN3_FIORINA_PALETTE_V97,
  ALIEN3_FIORINA_TEMPLATE_V97,
  ALIEN3_HYBRID_SECTORS_V97,
  ALIEN3_OPERATION_ID_V97,
  ALIEN3_TEMPLATE_ID_V97
} from './alien3-dlc-v97.js';

export const ALIEN3_DLC_SCHEMA_V98 = 98;
export const ALIEN3_OPERATION_ID_V98 = ALIEN3_OPERATION_ID_V97;
export const ALIEN3_CAMPAIGN_ID_V98 = ALIEN3_CAMPAIGN_ID_V97;
export const ALIEN3_TEMPLATE_ID_V98 = ALIEN3_TEMPLATE_ID_V97;

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

export const ALIEN3_FIORINA_PALETTE_V98 = deepFreeze({
  ...clone(ALIEN3_FIORINA_PALETTE_V97),
  id: 'fiorina-161-hybrid-director-v98',
  light: 0.244,
  prop: 'penal-foundry-hybrid-director-v98'
});

const template = clone(ALIEN3_FIORINA_TEMPLATE_V97);
template.label = 'Fiorina 161 · Hybrid Director / depth readability / dedicated codex UI';
export const ALIEN3_FIORINA_TEMPLATE_V98 = deepFreeze(template);

/**
 * V98 deliberately preserves V97's certified level graph. It improves how the
 * same spaces are staged, read and traversed instead of manufacturing routes.
 */
export const ALIEN3_HYBRID_DIRECTOR_PROFILES_V98 = deepFreeze([
  { id: 'storm-wide', sectorId: 'hybrid-storm-yard', label: 'TEMPÊTE LARGE', mode: 'depth', cameraLead: 0.18, depthContrast: 0.78, vignette: 0.14, runnerTelegraph: 0.56 },
  { id: 'medical-lock', sectorId: 'hybrid-eev-infirmary', label: 'MÉDICAL CONFINÉ', mode: 'side', cameraLead: 0.06, depthContrast: 0.18, vignette: 0.32, runnerTelegraph: 0.40 },
  { id: 'prison-sweep', sectorId: 'hybrid-cellblock', label: 'BALAYAGE CARCÉRAL', mode: 'depth', cameraLead: 0.20, depthContrast: 0.96, vignette: 0.18, runnerTelegraph: 0.50 },
  { id: 'service-lock', sectorId: 'hybrid-service-tunnels', label: 'TUNNELS VERROUILLÉS', mode: 'side', cameraLead: 0.04, depthContrast: 0.12, vignette: 0.40, runnerTelegraph: 0.36 },
  { id: 'communications-stage', sectorId: 'hybrid-assembly-communications', label: 'SCÈNE COMMUNICATIONS', mode: 'depth', cameraLead: 0.14, depthContrast: 0.72, vignette: 0.20, runnerTelegraph: 0.48 },
  { id: 'foundry-hunt', sectorId: 'hybrid-foundry-hall', label: 'CHASSE FONDERIE', mode: 'depth', cameraLead: 0.24, depthContrast: 1.00, vignette: 0.16, runnerTelegraph: 0.62 },
  { id: 'mold-lock', sectorId: 'hybrid-piston-mold', label: 'PIÈGE LATÉRAL', mode: 'side', cameraLead: 0.03, depthContrast: 0.10, vignette: 0.36, runnerTelegraph: 0.34 },
  { id: 'patna-stage', sectorId: 'hybrid-furnace-patna', label: 'CONFRONTATION PATNA', mode: 'depth', cameraLead: 0.12, depthContrast: 0.68, vignette: 0.22, runnerTelegraph: 0.46 },
  { id: 'final-lock', sectorId: 'hybrid-final-platform', label: 'FINALE VERROUILLÉE', mode: 'side', cameraLead: 0.02, depthContrast: 0.08, vignette: 0.44, runnerTelegraph: 0.32 }
]);

export const ALIEN3_DEPTH_OCCLUDERS_V98 = deepFreeze([
  { id: 'occ-storm-crate', label: 'CAISSE ÉPAVE', x0: 300, x1: 520, lane: 0, concealment: 0.22 },
  { id: 'occ-cell-rear', label: 'TRAVÉE ARRIÈRE', x0: 1870, x1: 2110, lane: 0, concealment: 0.28 },
  { id: 'occ-cell-front', label: 'TABLES DU BLOC', x0: 2380, x1: 2640, lane: 2, concealment: 0.24 },
  { id: 'occ-communications', label: 'BAIE DE COMMUNICATION', x0: 3670, x1: 3920, lane: 2, concealment: 0.18 },
  { id: 'occ-foundry-rear', label: 'CHARIOT DE COULÉE', x0: 4170, x1: 4430, lane: 0, concealment: 0.26 },
  { id: 'occ-foundry-front', label: 'PILE DE LINGOTS', x0: 4470, x1: 4660, lane: 2, concealment: 0.20 },
  { id: 'occ-patna-rear', label: 'CAISSE PATNA', x0: 5350, x1: 5570, lane: 0, concealment: 0.18 }
]);

export const ALIEN3_LANE_SHIFT_SECONDS_V98 = 0.28;

const C = (id, title, category, body) => ({ id, title, category, body });
export const ALIEN3_DLC_CODEX_EXTENSION_V98 = deepFreeze([
  C('a3c-v98-director', 'HYBRID DIRECTOR', 'PRÉSENTATION', 'Chaque secteur possède désormais un contrat de mise en scène : amplitude caméra, contraste des plans, vignette et durée de télégraphe du Runner sont cohérents avec le lieu.'),
  C('a3c-v98-lane-blend', 'TRANSITION DE PLAN LISSÉE', 'GAMEPLAY', 'Un changement arrière/médian/avant n’est plus un saut instantané. Le rendu interpole le plan pendant une courte fenêtre lisible et persistante.'),
  C('a3c-v98-runner-telegraph', 'TÉLÉGRAPHE INTER-PLAN', 'XÉNOBIOLOGIE', 'Avant de changer de plan, le Runner laisse une indication de destination. La transition reste dangereuse mais évite une téléportation injuste.'),
  C('a3c-v98-depth-cover', 'OCCULTANTS DE PROFONDEUR', 'GAMEPLAY', 'Certains éléments du décor offrent une courte réduction de lecture au Hunter Director uniquement lorsqu’ils sont utilisés depuis le bon plan.'),
  C('a3c-v98-camera-contracts', 'CONTRATS CAMÉRA', 'PRÉSENTATION', 'Tempête, bloc, fonderie et Patna n’emploient pas la même composition. Les contrats caméra changent automatiquement avec les neuf secteurs hybrides.'),
  C('a3c-v98-side-readability', 'LISIBILITÉ 2D TENSION', 'PRÉSENTATION', 'Dans les conduits, l’infirmerie, le moule et la plateforme finale, le directeur réduit volontairement la profondeur pour conserver collisions et pièges parfaitement lisibles.'),
  C('a3c-v98-codex-ui', 'INTERFACE CODEX DÉDIÉE', 'SYSTÈMES', 'Le Codex Alien 3 devient une interface persistante : ouverture/fermeture, catégories, précédent/suivant, compteur de non-lus et favoris.'),
  C('a3c-v98-codex-unread', 'ENTRÉES NON LUES', 'SYSTÈMES', 'Une entrée débloquée n’est marquée lue qu’après consultation. Le HUD distingue progression de déblocage et progression de lecture.'),
  C('a3c-v98-codex-bookmarks', 'FAVORIS DU CODEX', 'SYSTÈMES', 'Jusqu’à douze entrées peuvent être marquées pour retrouver rapidement lieux, personnages, variantes de montage ou systèmes utiles.'),
  C('a3c-v98-prison-staging', 'BALAYAGE DU BLOC', 'LIEUX', 'Le bloc carcéral privilégie les changements de plan longs et lisibles, avec éléments d’occultation arrière et avant pour structurer la poursuite.'),
  C('a3c-v98-foundry-staging', 'CHASSE DE FONDERIE', 'LIEUX', 'La grande fonderie adopte le contrat le plus agressif : anticipation latérale, profondeur contrastée et télégraphe plus long avant interception.'),
  C('a3c-v98-patna-staging', 'MISE EN SCÈNE PATNA', 'ÉVÉNEMENTS', 'L’arrivée de la récupération conserve la profondeur pour les axes de confrontation, puis la plateforme finale repasse en 2D pour une conclusion cadrée.')
]);

export const ALIEN3_DLC_CODEX_V98 = deepFreeze([
  ...clone(ALIEN3_DLC_CODEX_V97),
  ...clone(ALIEN3_DLC_CODEX_EXTENSION_V98)
]);

export const ALIEN3_DLC_CODEX_TERMINALS_V98 = deepFreeze([
  ...clone(ALIEN3_DLC_CODEX_TERMINALS_V97),
  { id: 'a3c-terminal-director-v98', label: 'CODEX DLC · HYBRID DIRECTOR', x: 3840, y: 438, w: 66, h: 72, lane: 2, batch: 'director-v98' }
]);

export const ALIEN3_DLC_CODEX_BATCHES_V98 = deepFreeze({
  ...clone(ALIEN3_DLC_CODEX_BATCHES_V97),
  'director-v98': ALIEN3_DLC_CODEX_EXTENSION_V98.map((entry) => entry.id)
});

export const ALIEN3_DLC_CODEX_CATEGORIES_V98 = deepFreeze([
  'TOUS', 'ARCHIVE', 'GAMEPLAY', 'LIEUX', 'PERSONNAGES', 'XÉNOBIOLOGIE', 'ÉVÉNEMENTS', 'SYSTÈMES', 'PRÉSENTATION'
]);

export const ALIEN3_V98_EVIDENCE_IDS = deepFreeze([
  'hybrid-director-ready', 'all-camera-contracts', 'smooth-lane-shift', 'runner-depth-telegraph',
  'depth-cover-rear', 'depth-cover-front', 'codex-ui-opened', 'codex-category-used',
  'codex-bookmark-used', 'codex-director-terminal', 'codex-78-complete', 'codex-reading-complete',
  'depth-composition-balanced', 'side-composition-balanced', 'runner-transition-survived', 'perfect-hybrid-director'
]);

const codexIds = new Set(ALIEN3_DLC_CODEX_V98.map((entry) => entry.id));
const extensionCodexIds = new Set(ALIEN3_DLC_CODEX_EXTENSION_V98.map((entry) => entry.id));
const terminalIds = new Set(ALIEN3_DLC_CODEX_TERMINALS_V98.map((entry) => entry.id));
const evidenceIds = new Set(ALIEN3_V98_EVIDENCE_IDS);
const profileIds = new Set(ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.map((entry) => entry.id));
const categoryIds = new Set(ALIEN3_DLC_CODEX_CATEGORIES_V98);
const occluderIds = new Set(ALIEN3_DEPTH_OCCLUDERS_V98.map((entry) => entry.id));

export function createAlien3StateV98() {
  return {
    schema: ALIEN3_DLC_SCHEMA_V98,
    director: {
      currentProfileId: 'storm-wide', profilesVisited: [], profileChanges: 0,
      laneBlend: 1, laneFrom: 1, laneTo: 1, laneShiftActive: false, laneShiftSeconds: 0,
      runnerTelegraphClock: 0, runnerTelegraphFrom: 1, runnerTelegraphTo: 1,
      occludersUsed: [], coverClock: 0, coverLane: 1,
      depthFrames: 0, sideFrames: 0
    },
    codexUi: {
      open: false, selectedCategory: 'TOUS', currentId: null, bookmarks: [], extensionUnlocked: [], extensionViewed: [], terminalsRead: [],
      uiOpens: 0, categoryChanges: 0, pageChanges: 0, bookmarkChanges: 0
    },
    evidenceRecovered: [],
    perfectArchive: {
      inheritedV97: false, profilesComplete: false, smoothDepthComplete: false,
      codexUnlockComplete: false, codexReadComplete: false, interfaceComplete: false,
      compositionComplete: false, perfect: false
    },
    telemetry: {
      directorProfileEvents: 0, smoothLaneShifts: 0, runnerTelegraphs: 0,
      coverUses: 0, codexUiOpens: 0, codexCategoryChanges: 0, codexBookmarks: 0
    },
    achievementIds: []
  };
}

export function sanitizeAlien3StateV98(raw) {
  const fallback = createAlien3StateV98();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Number(raw.schema) !== ALIEN3_DLC_SCHEMA_V98) return fallback;
  const director = raw.director && typeof raw.director === 'object' ? raw.director : {};
  const codexUi = raw.codexUi && typeof raw.codexUi === 'object' ? raw.codexUi : {};
  const perfect = raw.perfectArchive && typeof raw.perfectArchive === 'object' ? raw.perfectArchive : {};
  const telemetry = raw.telemetry && typeof raw.telemetry === 'object' ? raw.telemetry : {};
  const laneFrom = Math.round(clamp(director.laneFrom, 0, 2));
  const laneTo = Math.round(clamp(director.laneTo, 0, 2));
  return {
    ...fallback,
    director: {
      currentProfileId: profileIds.has(director.currentProfileId) ? director.currentProfileId : fallback.director.currentProfileId,
      profilesVisited: unique(director.profilesVisited, profileIds, ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.length),
      profileChanges: Math.round(clamp(director.profileChanges, 0, 9999)),
      laneBlend: clamp(director.laneBlend, 0, 1), laneFrom, laneTo,
      laneShiftActive: bool(director.laneShiftActive), laneShiftSeconds: clamp(director.laneShiftSeconds, 0, 10),
      runnerTelegraphClock: clamp(director.runnerTelegraphClock, 0, 10),
      runnerTelegraphFrom: Math.round(clamp(director.runnerTelegraphFrom, 0, 2)),
      runnerTelegraphTo: Math.round(clamp(director.runnerTelegraphTo, 0, 2)),
      occludersUsed: unique(director.occludersUsed, occluderIds, ALIEN3_DEPTH_OCCLUDERS_V98.length),
      coverClock: clamp(director.coverClock, 0, 30), coverLane: Math.round(clamp(director.coverLane, 0, 2)),
      depthFrames: Math.round(clamp(director.depthFrames, 0, 99999999)), sideFrames: Math.round(clamp(director.sideFrames, 0, 99999999))
    },
    codexUi: {
      open: bool(codexUi.open), selectedCategory: categoryIds.has(codexUi.selectedCategory) ? codexUi.selectedCategory : 'TOUS',
      currentId: codexIds.has(codexUi.currentId) ? codexUi.currentId : null,
      bookmarks: unique(codexUi.bookmarks, codexIds, 12),
      extensionUnlocked: unique(codexUi.extensionUnlocked, extensionCodexIds, ALIEN3_DLC_CODEX_EXTENSION_V98.length),
      extensionViewed: unique(codexUi.extensionViewed, extensionCodexIds, ALIEN3_DLC_CODEX_EXTENSION_V98.length),
      terminalsRead: unique(codexUi.terminalsRead, terminalIds, ALIEN3_DLC_CODEX_TERMINALS_V98.length),
      uiOpens: Math.round(clamp(codexUi.uiOpens, 0, 99999)), categoryChanges: Math.round(clamp(codexUi.categoryChanges, 0, 99999)),
      pageChanges: Math.round(clamp(codexUi.pageChanges, 0, 99999)), bookmarkChanges: Math.round(clamp(codexUi.bookmarkChanges, 0, 99999))
    },
    evidenceRecovered: unique(raw.evidenceRecovered, evidenceIds, ALIEN3_V98_EVIDENCE_IDS.length),
    perfectArchive: {
      inheritedV97: bool(perfect.inheritedV97), profilesComplete: bool(perfect.profilesComplete), smoothDepthComplete: bool(perfect.smoothDepthComplete),
      codexUnlockComplete: bool(perfect.codexUnlockComplete), codexReadComplete: bool(perfect.codexReadComplete), interfaceComplete: bool(perfect.interfaceComplete),
      compositionComplete: bool(perfect.compositionComplete), perfect: bool(perfect.perfect)
    },
    telemetry: {
      directorProfileEvents: Math.round(clamp(telemetry.directorProfileEvents, 0, 99999)), smoothLaneShifts: Math.round(clamp(telemetry.smoothLaneShifts, 0, 99999)),
      runnerTelegraphs: Math.round(clamp(telemetry.runnerTelegraphs, 0, 99999)), coverUses: Math.round(clamp(telemetry.coverUses, 0, 99999)),
      codexUiOpens: Math.round(clamp(telemetry.codexUiOpens, 0, 99999)), codexCategoryChanges: Math.round(clamp(telemetry.codexCategoryChanges, 0, 99999)),
      codexBookmarks: Math.round(clamp(telemetry.codexBookmarks, 0, 99999))
    },
    achievementIds: Array.isArray(raw.achievementIds)
      ? [...new Set(raw.achievementIds.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 96)))].slice(0, 128)
      : []
  };
}

export function alien3DirectorProfileV98(id) {
  return ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.find((entry) => entry.id === id) || ALIEN3_HYBRID_DIRECTOR_PROFILES_V98[0];
}
export function alien3DirectorProfileForSectorV98(sectorId) {
  return ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.find((entry) => entry.sectorId === sectorId) || ALIEN3_HYBRID_DIRECTOR_PROFILES_V98[0];
}
export function alien3DepthOccluderV98(x, lane) {
  return ALIEN3_DEPTH_OCCLUDERS_V98.find((entry) => Number(x) >= entry.x0 && Number(x) <= entry.x1 && Number(lane) === entry.lane) || null;
}
export function alien3DlcCodexEntryV98(id) { return ALIEN3_DLC_CODEX_V98.find((entry) => entry.id === id) || null; }
export function alien3DlcCodexBatchV98(id) { return [...(ALIEN3_DLC_CODEX_BATCHES_V98[id] || [])]; }
export function alien3CodexEntriesForCategoryV98(category, unlocked = []) {
  const allow = new Set(unlocked);
  return ALIEN3_DLC_CODEX_V98.filter((entry) => allow.has(entry.id) && (category === 'TOUS' || entry.category === category));
}

export function alien3V98Grade({ gradeV97 = 'D', evidence = 0, profiles = 0, codex = 0, read = 0, smoothShifts = 0, coverUses = 0, uiActions = 0, perfect = false } = {}) {
  const base = { 'S++++++++': 246, 'S+++++++': 230, 'S++++++': 214, 'S+++++': 198, 'S++++': 184, 'S+++': 170, 'S++': 156, 'S+': 142, S: 128, A: 112, B: 96, C: 80, D: 64 }[gradeV97] || 64;
  const score = base
    + clamp(evidence / ALIEN3_V98_EVIDENCE_IDS.length, 0, 1) * 8
    + clamp(profiles / ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.length, 0, 1) * 5
    + clamp(codex / ALIEN3_DLC_CODEX_V98.length, 0, 1) * 6
    + clamp(read / ALIEN3_DLC_CODEX_V98.length, 0, 1) * 4
    + clamp(smoothShifts / 3, 0, 1) * 3
    + clamp(coverUses / 2, 0, 1) * 2
    + clamp(uiActions / 3, 0, 1) * 2
    + (perfect ? 6 : 0);
  return score >= 282 ? 'S+++++++++'
    : score >= 266 ? 'S++++++++'
      : score >= 250 ? 'S+++++++'
        : score >= 234 ? 'S++++++'
          : score >= 218 ? 'S+++++'
            : score >= 202 ? 'S++++'
              : score >= 186 ? 'S+++'
                : score >= 170 ? 'S++'
                  : score >= 154 ? 'S+'
                    : score >= 138 ? 'S'
                      : score >= 120 ? 'A'
                        : score >= 102 ? 'B'
                          : score >= 84 ? 'C' : 'D';
}

export function validateAlien3DlcV98() {
  const failures = [];
  const { nodes, edges, routes, zones, dimensions } = ALIEN3_FIORINA_TEMPLATE_V98;
  if (nodes.length !== 72) failures.push(`node count ${nodes.length} != 72`);
  if (edges.length !== 119) failures.push(`edge count ${edges.length} != 119`);
  if (routes.length !== 4) failures.push(`route count ${routes.length} != 4`);
  if (zones.length !== 6) failures.push(`zone count ${zones.length} != 6`);
  if (ALIEN3_HYBRID_SECTORS_V97.length !== 9) failures.push('hybrid sector count mismatch');
  if (ALIEN3_DEPTH_LANES_V97.length !== 3) failures.push('depth lane count mismatch');
  if (ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.length !== 9) failures.push('director profile count mismatch');
  if (ALIEN3_DLC_CODEX_V98.length !== 78) failures.push(`dedicated codex count ${ALIEN3_DLC_CODEX_V98.length} != 78`);
  if (ALIEN3_DLC_CODEX_TERMINALS_V98.length !== 6) failures.push('codex terminal count mismatch');
  if (ALIEN3_DEPTH_OCCLUDERS_V98.length !== 7) failures.push('depth occluder count mismatch');
  if (ALIEN3_V98_EVIDENCE_IDS.length !== 16) failures.push(`evidence count ${ALIEN3_V98_EVIDENCE_IDS.length} != 16`);
  if (new Set(ALIEN3_DLC_CODEX_V98.map((entry) => entry.id)).size !== ALIEN3_DLC_CODEX_V98.length) failures.push('duplicate dedicated codex ids');
  if (new Set(ALIEN3_DLC_CODEX_TERMINALS_V98.map((entry) => entry.id)).size !== ALIEN3_DLC_CODEX_TERMINALS_V98.length) failures.push('duplicate codex terminal ids');
  if (new Set(ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.map((entry) => entry.sectorId)).size !== ALIEN3_HYBRID_SECTORS_V97.length) failures.push('director profile coverage mismatch');
  if (new Set(ALIEN3_V98_EVIDENCE_IDS).size !== ALIEN3_V98_EVIDENCE_IDS.length) failures.push('duplicate evidence ids');
  for (const profile of ALIEN3_HYBRID_DIRECTOR_PROFILES_V98) {
    const sector = ALIEN3_HYBRID_SECTORS_V97.find((entry) => entry.id === profile.sectorId);
    if (!sector) failures.push(`director references missing sector ${profile.id}`);
    else if (profile.mode !== sector.mode) failures.push(`director mode mismatch ${profile.id}`);
  }
  for (const terminal of ALIEN3_DLC_CODEX_TERMINALS_V98) {
    if (terminal.x < 0 || terminal.x > dimensions.width || terminal.lane < 0 || terminal.lane > 2) failures.push(`invalid codex terminal ${terminal.id}`);
    if (!ALIEN3_DLC_CODEX_BATCHES_V98[terminal.batch]?.length) failures.push(`empty codex batch ${terminal.id}`);
  }
  const coverage = new Set(Object.values(ALIEN3_DLC_CODEX_BATCHES_V98).flat());
  if (coverage.size !== ALIEN3_DLC_CODEX_V98.length) failures.push(`codex batches cover ${coverage.size}/${ALIEN3_DLC_CODEX_V98.length}`);
  return {
    ok: failures.length === 0,
    failures,
    counts: {
      nodes: nodes.length, edges: edges.length, routes: routes.length, zones: zones.length,
      hybridSectors: ALIEN3_HYBRID_SECTORS_V97.length, depthLanes: ALIEN3_DEPTH_LANES_V97.length,
      directorProfiles: ALIEN3_HYBRID_DIRECTOR_PROFILES_V98.length, depthOccluders: ALIEN3_DEPTH_OCCLUDERS_V98.length,
      dedicatedCodex: ALIEN3_DLC_CODEX_V98.length, codexTerminals: ALIEN3_DLC_CODEX_TERMINALS_V98.length,
      evidence: ALIEN3_V98_EVIDENCE_IDS.length
    }
  };
}
