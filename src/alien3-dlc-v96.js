import {
  ALIEN3_CAMPAIGN_ID_V95,
  ALIEN3_FIORINA_PALETTE_V95,
  ALIEN3_FIORINA_TEMPLATE_V95,
  ALIEN3_OPERATION_ID_V95,
  ALIEN3_TEMPLATE_ID_V95
} from './alien3-dlc-v95.js';

export const ALIEN3_DLC_SCHEMA_V96 = 96;
export const ALIEN3_OPERATION_ID_V96 = ALIEN3_OPERATION_ID_V95;
export const ALIEN3_CAMPAIGN_ID_V96 = ALIEN3_CAMPAIGN_ID_V95;
export const ALIEN3_TEMPLATE_ID_V96 = ALIEN3_TEMPLATE_ID_V95;

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

export const ALIEN3_FIORINA_PALETTE_V96 = deepFreeze({
  ...clone(ALIEN3_FIORINA_PALETTE_V95),
  id: 'fiorina-161-atmosphere-v96',
  light: 0.242,
  prop: 'penal-foundry-atmosphere-audio-v96'
});

/**
 * V96 ne gonfle volontairement pas la topologie. Les 72 nœuds / 119 arêtes V95
 * restent la base certifiée ; cette couche ajoute météo, puissance, acoustique,
 * visibilité et feedback sans créer une route factice supplémentaire.
 */
const template = clone(ALIEN3_FIORINA_TEMPLATE_V95);
template.label = 'Fiorina 161 · Atmosphere / optional audio / accessibility';
export const ALIEN3_FIORINA_TEMPLATE_V96 = deepFreeze(template);

export const ALIEN3_ENVIRONMENT_ZONES_V96 = deepFreeze([
  { id: 'f161-coast', label: 'CÔTE / EEV', temperature: 4, wind: 0.96, wetness: 0.95, steam: 0.02, baseVisibility: 0.66, power: 0.15, cue: 'alien3-wind' },
  { id: 'f161-infirmary', label: 'INFIRMERIE', temperature: 12, wind: 0.08, wetness: 0.12, steam: 0.04, baseVisibility: 0.82, power: 0.48, cue: 'alien3-mire' },
  { id: 'f161-cellblock', label: 'BLOC CARCÉRAL', temperature: 9, wind: 0.16, wetness: 0.18, steam: 0.05, baseVisibility: 0.74, power: 0.38, cue: 'alien3-prison' },
  { id: 'f161-service', label: 'GALERIES TECHNIQUES', temperature: 8, wind: 0.30, wetness: 0.34, steam: 0.72, baseVisibility: 0.56, power: 0.30, cue: 'alien3-steam' },
  { id: 'f161-leadworks', label: 'FONDERIE', temperature: 20, wind: 0.10, wetness: 0.16, steam: 0.48, baseVisibility: 0.64, power: 0.42, cue: 'alien3-foundry' },
  { id: 'f161-furnace', label: 'FOUR / PATNA', temperature: 29, wind: 0.08, wetness: 0.05, steam: 0.20, baseVisibility: 0.78, power: 0.58, cue: 'alien3-company' }
]);

export const ALIEN3_AUDIO_CUES_V96 = deepFreeze([
  { id: 'alien3-wind', label: 'VENT DE FIORINA', fallback: 'wind', category: 'environment' },
  { id: 'alien3-runner', label: 'RUNNER PROCHE', fallback: 'runner', category: 'threat' },
  { id: 'alien3-steam', label: 'PURGE VAPEUR', fallback: 'steam', category: 'environment' },
  { id: 'alien3-mire', label: 'LECTURE MIRE', fallback: 'mire', category: 'interface' },
  { id: 'alien3-foundry', label: 'FONDERIE', fallback: 'foundry', category: 'environment' },
  { id: 'alien3-prison', label: 'RÉSONANCE CARCÉRALE', fallback: 'prison', category: 'environment' },
  { id: 'alien3-company', label: 'SIGNAL PATNA', fallback: 'company', category: 'story' },
  { id: 'alien3-heartbeat', label: 'PRESSION BIOLOGIQUE', fallback: 'heartbeat', category: 'threat' }
]);

export const ALIEN3_V96_STATIONS = deepFreeze([
  { id: 'f161-weather-console-v96', kind: 'weather', x: 770, y: 258, w: 72, h: 72, label: 'LIRE LA TÉLÉMÉTRIE MÉTÉO' },
  { id: 'f161-infirmary-breaker-v96', kind: 'breaker', zoneId: 'f161-infirmary', x: 1190, y: 438, w: 72, h: 72, label: 'RÉTABLIR L’ÉCLAIRAGE INFIRMERIE' },
  { id: 'f161-cellblock-pa-v96', kind: 'pa', x: 2380, y: 278, w: 72, h: 72, label: 'ACTIVER LA SONO DU BLOC' },
  { id: 'f161-service-breaker-v96', kind: 'breaker', zoneId: 'f161-service', x: 3300, y: 258, w: 72, h: 72, label: 'RÉTABLIR LES PROJECTEURS TECHNIQUES' },
  { id: 'f161-steam-baffle-v96', kind: 'steam-baffle', x: 3890, y: 558, w: 72, h: 72, label: 'CALIBRER LE DÉFLECTEUR VAPEUR' },
  { id: 'f161-foundry-breaker-v96', kind: 'breaker', zoneId: 'f161-leadworks', x: 4370, y: 438, w: 72, h: 72, label: 'RÉTABLIR LES FEUX DE FONDERIE' },
  { id: 'f161-furnace-extractor-v96', kind: 'extractor', x: 5470, y: 438, w: 72, h: 72, label: 'RÉGLER L’EXTRACTEUR DU FOUR' },
  { id: 'f161-acoustic-diagnostic-v96', kind: 'diagnostic', x: 5810, y: 438, w: 72, h: 72, label: 'VALIDER LE DIAGNOSTIC ACOUSTIQUE' }
]);

export const ALIEN3_CODEX_V96 = deepFreeze([
  { id: 'f161-v96-atmosphere', title: 'FIORINA RESPire', category: 'GAMEPLAY', body: 'V96 simule exposition, humidité, visibilité, puissance et vapeur selon les six zones de Fiorina sans modifier les quatre routes certifiées.' },
  { id: 'f161-v96-optional-audio', title: 'AUDIO OPTIONNEL', category: 'SYSTÈME', body: 'Huit emplacements audio dédiés acceptent MP3, WAV, OGG, M4A ou WebM. Sans fichier réel, le jeu utilise une synthèse légère ou le silence sans bloquer la mission.' },
  { id: 'f161-v96-storm', title: 'TEMPÊTE DE FIORINA', category: 'ENVIRONNEMENT', body: 'Le secteur EEV cumule pluie froide, vent et visibilité réduite. L’exposition est persistante mais récupérable une fois à couvert.' },
  { id: 'f161-v96-infirmary-light', title: 'SECOURS INFIRMERIE', category: 'ENVIRONNEMENT', body: 'L’éclairage d’urgence de l’infirmerie stabilise la visibilité et réduit la tension des survivants proches.' },
  { id: 'f161-v96-prison-pa', title: 'SONO CARCÉRALE', category: 'PERSONNEL', body: 'La sono peut rallier brièvement les détenus, mais le bruit augmente aussi la signature acoustique du groupe.' },
  { id: 'f161-v96-service-light', title: 'PROJECTEURS TECHNIQUES', category: 'ENVIRONNEMENT', body: 'Les projecteurs rendent les galeries plus lisibles mais diminuent l’avantage furtif de l’obscurité.' },
  { id: 'f161-v96-steam-baffle', title: 'DÉFLECTEUR VAPEUR', category: 'GAMEPLAY', body: 'Le déflecteur réduit le brouillard industriel. La visibilité augmente, mais le masque sonore offert par la vapeur devient moins efficace.' },
  { id: 'f161-v96-foundry-light', title: 'FEUX DE FONDERIE', category: 'ENVIRONNEMENT', body: 'La fonderie éclairée rend le rabattage final plus lisible tout en donnant au Runner davantage de silhouettes à suivre.' },
  { id: 'f161-v96-furnace-extractor', title: 'EXTRACTEUR DU FOUR', category: 'ENVIRONNEMENT', body: 'L’extracteur réduit la contrainte thermique près du four au prix d’un bruit mécanique continu.' },
  { id: 'f161-v96-threat-caption', title: 'CAPTION ACOUSTIQUE', category: 'ACCESSIBILITÉ', body: 'Le HUD traduit les menaces sonores en bande de distance et direction gauche/droite sans révéler la position exacte du Runner.' },
  { id: 'f161-v96-heartbeat', title: 'PRESSION BIOLOGIQUE', category: 'XÉNOBIOLOGIE', body: 'À courte portée, une pulsation synthétique ou un fichier audio optionnel signale une menace immédiate. Le signal respecte un cooldown pour éviter le spam.' },
  { id: 'f161-v96-visibility-tradeoff', title: 'LUMIÈRE CONTRE FURTIVITÉ', category: 'GAMEPLAY', body: 'Une meilleure visibilité aide les humains mais peut alimenter la chaleur du Hunter Director. Les zones sombres restent risquées à lire mais plus discrètes.' },
  { id: 'f161-v96-climate-prisoners', title: 'CLIMAT ET DÉTENUS', category: 'PERSONNEL', body: 'Froid, humidité et chaleur influencent doucement le stress des détenus V95. Les systèmes restaurés peuvent stabiliser le groupe.' },
  { id: 'f161-v96-zone-cycle', title: 'SIX MICROCLIMATS', category: 'MIRE', body: 'Le parcours complet traverse six microclimats cohérents : côte, infirmerie, bloc, galeries, fonderie et four.' },
  { id: 'f161-v96-audio-fallback', title: 'FALLBACK SÛR', category: 'SYSTÈME', body: 'L’absence d’un média ne provoque jamais d’erreur de progression : chaque cue possède un fallback déterministe ou silencieux.' },
  { id: 'f161-v96-diagnostic', title: 'DIAGNOSTIC ACOUSTIQUE', category: 'MIRE', body: 'Le diagnostic confirme les huit cues, les captions directionnelles et le maintien d’un seul Runner comme source de menace.' },
  { id: 'f161-v96-atmosphere-telemetry', title: 'TÉLÉMÉTRIE ATMOSPHÈRE', category: 'MIRE', body: 'Le rapport final conserve pics d’exposition, contrainte thermique, visibilité minimale, zones visitées et cues entendus.' },
  { id: 'f161-v96-perfect', title: 'ARCHIVE ATMOSPHÈRE PARFAITE', category: 'MIRE', body: 'Une archive parfaite V96 combine la perfection V95, les six zones visitées, les utilitaires réglés, les cues principaux et une exposition maîtrisée.' }
]);

export const ALIEN3_V96_EVIDENCE_IDS = deepFreeze([
  'atmosphere-ready', 'storm-telemetry', 'cold-wet-exposure', 'infirmary-light', 'prison-pa',
  'service-light', 'steam-baffle', 'foundry-light', 'furnace-extractor', 'six-zones-visited',
  'audio-fallback-safe', 'runner-acoustic-near', 'runner-bearing-left', 'runner-bearing-right',
  'prisoner-climate-stable', 'visibility-tradeoff', 'acoustic-diagnostic', 'perfect-atmosphere'
]);

const codexIds = new Set(ALIEN3_CODEX_V96.map((entry) => entry.id));
const evidenceIds = new Set(ALIEN3_V96_EVIDENCE_IDS);
const zoneIds = new Set(ALIEN3_ENVIRONMENT_ZONES_V96.map((entry) => entry.id));
const cueIds = new Set(ALIEN3_AUDIO_CUES_V96.map((entry) => entry.id));

export function createAlien3StateV96() {
  return {
    schema: ALIEN3_DLC_SCHEMA_V96,
    codexUnlocked: [], codexViewed: [], currentCodexId: null,
    evidenceRecovered: [],
    environment: {
      currentZoneId: 'f161-coast', zoneVisits: [], temperature: 4, visibility: 0.66,
      exposure: 0, wetness: 0, thermalStrain: 0, steamMask: 0, powerLevel: 0.15,
      exposurePeak: 0, thermalPeak: 0, visibilityMin: 1,
      weatherRead: false,
      breakers: { infirmary: false, service: false, leadworks: false },
      prisonPa: false, steamBaffle: false, furnaceExtractor: false,
      ambienceClock: 0, flickerClock: 0
    },
    acoustics: {
      cueCounts: Object.fromEntries(ALIEN3_AUDIO_CUES_V96.map((entry) => [entry.id, 0])),
      uniqueCues: [], fallbackSafe: true, lastCueId: null, lastCaption: '', captionClock: 0,
      threatBand: 'calme', bearing: '—', runnerCueCooldown: 0, ambientCueCooldown: 0,
      captions: 0, diagnostic: false
    },
    climate: { stableTicks: 0, stressRelief: 0, exposureBreaks: 0 },
    perfectArchive: {
      inheritedV95: false, zonesComplete: false, utilitiesComplete: false, acousticComplete: false,
      climateComplete: false, diagnosticComplete: false, perfect: false
    },
    telemetry: {
      zoneTransitions: 0, powerActions: 0, audioAttempts: 0, fallbackAttempts: 0,
      runnerNearCues: 0, leftCaptions: 0, rightCaptions: 0, minVisibility: 1
    },
    achievementIds: []
  };
}

export function sanitizeAlien3StateV96(raw) {
  const fallback = createAlien3StateV96();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Number(raw.schema) !== ALIEN3_DLC_SCHEMA_V96) return fallback;
  const environment = raw.environment && typeof raw.environment === 'object' ? raw.environment : {};
  const acoustics = raw.acoustics && typeof raw.acoustics === 'object' ? raw.acoustics : {};
  const climate = raw.climate && typeof raw.climate === 'object' ? raw.climate : {};
  const perfect = raw.perfectArchive && typeof raw.perfectArchive === 'object' ? raw.perfectArchive : {};
  const telemetry = raw.telemetry && typeof raw.telemetry === 'object' ? raw.telemetry : {};
  const cueCounts = {};
  for (const cue of ALIEN3_AUDIO_CUES_V96) cueCounts[cue.id] = Math.round(clamp(acoustics.cueCounts?.[cue.id], 0, 9999));
  return {
    ...fallback,
    codexUnlocked: unique(raw.codexUnlocked, codexIds),
    codexViewed: unique(raw.codexViewed, codexIds),
    currentCodexId: codexIds.has(raw.currentCodexId) ? raw.currentCodexId : null,
    evidenceRecovered: unique(raw.evidenceRecovered, evidenceIds),
    environment: {
      currentZoneId: zoneIds.has(environment.currentZoneId) ? environment.currentZoneId : 'f161-coast',
      zoneVisits: unique(environment.zoneVisits, zoneIds, ALIEN3_ENVIRONMENT_ZONES_V96.length),
      temperature: clamp(environment.temperature, -20, 80), visibility: clamp(environment.visibility, 0.1, 1),
      exposure: clamp(environment.exposure, 0, 100), wetness: clamp(environment.wetness, 0, 100), thermalStrain: clamp(environment.thermalStrain, 0, 100),
      steamMask: clamp(environment.steamMask, 0, 1), powerLevel: clamp(environment.powerLevel, 0, 1),
      exposurePeak: clamp(environment.exposurePeak, 0, 100), thermalPeak: clamp(environment.thermalPeak, 0, 100), visibilityMin: clamp(environment.visibilityMin, 0.1, 1),
      weatherRead: bool(environment.weatherRead),
      breakers: { infirmary: bool(environment.breakers?.infirmary), service: bool(environment.breakers?.service), leadworks: bool(environment.breakers?.leadworks) },
      prisonPa: bool(environment.prisonPa), steamBaffle: bool(environment.steamBaffle), furnaceExtractor: bool(environment.furnaceExtractor),
      ambienceClock: clamp(environment.ambienceClock, 0, 30), flickerClock: clamp(environment.flickerClock, 0, 30)
    },
    acoustics: {
      cueCounts, uniqueCues: unique(acoustics.uniqueCues, cueIds, ALIEN3_AUDIO_CUES_V96.length),
      fallbackSafe: bool(acoustics.fallbackSafe, true), lastCueId: cueIds.has(acoustics.lastCueId) ? acoustics.lastCueId : null,
      lastCaption: typeof acoustics.lastCaption === 'string' ? acoustics.lastCaption.slice(0, 120) : '',
      captionClock: clamp(acoustics.captionClock, 0, 30), threatBand: ['calme', 'lointain', 'proche', 'critique'].includes(acoustics.threatBand) ? acoustics.threatBand : 'calme',
      bearing: ['—', 'GAUCHE', 'DROITE', 'CENTRE'].includes(acoustics.bearing) ? acoustics.bearing : '—',
      runnerCueCooldown: clamp(acoustics.runnerCueCooldown, 0, 30), ambientCueCooldown: clamp(acoustics.ambientCueCooldown, 0, 30),
      captions: Math.round(clamp(acoustics.captions, 0, 9999)), diagnostic: bool(acoustics.diagnostic)
    },
    climate: {
      stableTicks: Math.round(clamp(climate.stableTicks, 0, 999999)), stressRelief: clamp(climate.stressRelief, 0, 9999),
      exposureBreaks: Math.round(clamp(climate.exposureBreaks, 0, 999))
    },
    perfectArchive: {
      inheritedV95: bool(perfect.inheritedV95), zonesComplete: bool(perfect.zonesComplete), utilitiesComplete: bool(perfect.utilitiesComplete),
      acousticComplete: bool(perfect.acousticComplete), climateComplete: bool(perfect.climateComplete), diagnosticComplete: bool(perfect.diagnosticComplete), perfect: bool(perfect.perfect)
    },
    telemetry: {
      zoneTransitions: Math.round(clamp(telemetry.zoneTransitions, 0, 9999)), powerActions: Math.round(clamp(telemetry.powerActions, 0, 999)),
      audioAttempts: Math.round(clamp(telemetry.audioAttempts, 0, 99999)), fallbackAttempts: Math.round(clamp(telemetry.fallbackAttempts, 0, 99999)),
      runnerNearCues: Math.round(clamp(telemetry.runnerNearCues, 0, 9999)), leftCaptions: Math.round(clamp(telemetry.leftCaptions, 0, 9999)),
      rightCaptions: Math.round(clamp(telemetry.rightCaptions, 0, 9999)), minVisibility: clamp(telemetry.minVisibility, 0.1, 1)
    },
    achievementIds: Array.isArray(raw.achievementIds)
      ? [...new Set(raw.achievementIds.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 96)))].slice(0, 128)
      : []
  };
}

export function alien3V96CodexEntry(id) { return ALIEN3_CODEX_V96.find((entry) => entry.id === id) || null; }
export function alien3V96Zone(id) { return ALIEN3_ENVIRONMENT_ZONES_V96.find((entry) => entry.id === id) || ALIEN3_ENVIRONMENT_ZONES_V96[0]; }
export function alien3V96AudioCue(id) { return ALIEN3_AUDIO_CUES_V96.find((entry) => entry.id === id) || null; }

export function alien3V96Grade({
  gradeV95 = 'D', evidence = 0, zones = 0, cues = 0, utilities = 0,
  exposurePeak = 100, thermalPeak = 100, diagnostic = false, perfect = false
} = {}) {
  const base = { 'S++++++': 182, 'S+++++': 170, 'S++++': 158, 'S+++': 146, 'S++': 134, 'S+': 122, S: 108, A: 94, B: 80, C: 66, D: 52 }[gradeV95] || 52;
  const evidenceScore = clamp(evidence / ALIEN3_V96_EVIDENCE_IDS.length, 0, 1) * 7;
  const zoneScore = clamp(zones / ALIEN3_ENVIRONMENT_ZONES_V96.length, 0, 1) * 4;
  const cueScore = clamp(cues / ALIEN3_AUDIO_CUES_V96.length, 0, 1) * 4;
  const utilityScore = clamp(utilities / 6, 0, 1) * 4;
  const exposureScore = clamp((90 - exposurePeak) / 90, 0, 1) * 2;
  const thermalScore = clamp((90 - thermalPeak) / 90, 0, 1) * 2;
  const diagnosticScore = diagnostic ? 3 : 0;
  const perfectBonus = perfect ? 5 : 0;
  const score = base + evidenceScore + zoneScore + cueScore + utilityScore + exposureScore + thermalScore + diagnosticScore + perfectBonus;
  return score >= 210 ? 'S+++++++'
    : score >= 196 ? 'S++++++'
      : score >= 182 ? 'S+++++'
        : score >= 170 ? 'S++++'
          : score >= 158 ? 'S+++'
            : score >= 146 ? 'S++'
              : score >= 134 ? 'S+'
                : score >= 120 ? 'S'
                  : score >= 104 ? 'A'
                    : score >= 88 ? 'B'
                      : score >= 72 ? 'C' : 'D';
}

export function validateAlien3DlcV96() {
  const failures = [];
  const nodes = ALIEN3_FIORINA_TEMPLATE_V96.nodes;
  const edges = ALIEN3_FIORINA_TEMPLATE_V96.edges;
  const routes = ALIEN3_FIORINA_TEMPLATE_V96.routes;
  const zones = ALIEN3_FIORINA_TEMPLATE_V96.zones;
  const nodeIds = new Set(nodes.map((entry) => entry.id));
  const adjacency = new Map(nodes.map((entry) => [entry.id, []]));
  for (const edge of edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) failures.push(`missing edge endpoint ${edge.id}`);
    adjacency.get(edge.from)?.push(edge.to);
    if (!edge.oneWay) adjacency.get(edge.to)?.push(edge.from);
  }
  if (ALIEN3_FIORINA_TEMPLATE_V96.id !== ALIEN3_TEMPLATE_ID_V96) failures.push('template id mismatch');
  if (nodes.length !== 72) failures.push(`node count ${nodes.length} != 72`);
  if (edges.length !== 119) failures.push(`edge count ${edges.length} != 119`);
  if (routes.length !== 4) failures.push(`route count ${routes.length} != 4`);
  if (zones.length !== 6) failures.push(`zone count ${zones.length} != 6`);
  if (ALIEN3_ENVIRONMENT_ZONES_V96.length !== 6) failures.push('environment zone count mismatch');
  if (ALIEN3_AUDIO_CUES_V96.length !== 8) failures.push('audio cue count mismatch');
  if (ALIEN3_V96_STATIONS.length !== 8) failures.push('station count mismatch');
  if (ALIEN3_CODEX_V96.length !== 18) failures.push(`codex count ${ALIEN3_CODEX_V96.length} != 18`);
  if (ALIEN3_V96_EVIDENCE_IDS.length !== 18) failures.push(`evidence count ${ALIEN3_V96_EVIDENCE_IDS.length} != 18`);
  if (new Set(ALIEN3_CODEX_V96.map((entry) => entry.id)).size !== ALIEN3_CODEX_V96.length) failures.push('duplicate codex ids');
  if (new Set(ALIEN3_V96_EVIDENCE_IDS).size !== ALIEN3_V96_EVIDENCE_IDS.length) failures.push('duplicate evidence ids');
  if (new Set(ALIEN3_V96_STATIONS.map((entry) => entry.id)).size !== ALIEN3_V96_STATIONS.length) failures.push('duplicate station ids');
  const expectedZones = new Set(zones.map((entry) => entry.id));
  for (const zone of ALIEN3_ENVIRONMENT_ZONES_V96) if (!expectedZones.has(zone.id)) failures.push(`environment zone absent from level ${zone.id}`);
  const start = nodes[0]?.id; const seen = new Set(start ? [start] : []); const queue = start ? [start] : [];
  while (queue.length) for (const next of adjacency.get(queue.shift()) || []) if (!seen.has(next)) { seen.add(next); queue.push(next); }
  if (seen.size !== nodes.length) failures.push(`disconnected nodes ${nodes.length - seen.size}`);
  return {
    ok: failures.length === 0, failures,
    counts: { nodes: nodes.length, edges: edges.length, routes: routes.length, zones: zones.length, environmentZones: ALIEN3_ENVIRONMENT_ZONES_V96.length, audioCues: ALIEN3_AUDIO_CUES_V96.length, stations: ALIEN3_V96_STATIONS.length, codex: ALIEN3_CODEX_V96.length, evidence: ALIEN3_V96_EVIDENCE_IDS.length }
  };
}
