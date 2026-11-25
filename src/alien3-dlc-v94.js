import {
  ALIEN3_CAMPAIGN_ID_V93,
  ALIEN3_FIORINA_PALETTE_V93,
  ALIEN3_FIORINA_TEMPLATE_V93,
  ALIEN3_OPERATION_ID_V93,
  ALIEN3_TEMPLATE_ID_V93
} from './alien3-dlc-v93.js';

export const ALIEN3_DLC_SCHEMA_V94 = 94;
export const ALIEN3_OPERATION_ID_V94 = ALIEN3_OPERATION_ID_V93;
export const ALIEN3_CAMPAIGN_ID_V94 = ALIEN3_CAMPAIGN_ID_V93;
export const ALIEN3_TEMPLATE_ID_V94 = ALIEN3_TEMPLATE_ID_V93;

const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
};
const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
const bool = (value, fallback = false) => typeof value === 'boolean' ? value : fallback;
const boundedText = (value, fallback = '', max = 160) => typeof value === 'string' && value.trim()
  ? value.trim().slice(0, max)
  : fallback;
const unique = (value, allowed, max = 256) => Array.isArray(value)
  ? [...new Set(value.filter((entry) => allowed.has(entry)))].slice(0, max)
  : [];

export const ALIEN3_RECONSTRUCTION_PROFILES_V94 = deepFreeze([
  {
    id: 'theatrical',
    label: 'MIRE · CINÉMA 1992',
    baseCut: 'theatrical',
    host: 'Spike / chien',
    wasteTank: false,
    finalQueenEmergence: true,
    description: 'Reconstruction du montage cinéma. Les ajouts V94 restent documentaires et ne remplacent pas la chronologie de cette coupe.'
  },
  {
    id: 'assembly',
    label: 'MIRE · ASSEMBLY CUT',
    baseCut: 'assembly',
    host: 'Babe / bovin',
    wasteTank: true,
    finalQueenEmergence: false,
    description: 'Reconstruction de l’Assembly Cut avec ses scènes restaurées, dont la cuve à déchets et la libération de Golic.'
  },
  {
    id: 'workprint',
    label: 'MIRE · WORKPRINT',
    baseCut: 'assembly',
    host: 'Babe / bovin',
    wasteTank: true,
    finalQueenEmergence: false,
    description: 'Surcouche de reconstruction Workprint : base Assembly, plus variantes archivées de batterie, Golic, message Compagnie et dernier bait-and-chase.'
  }
]);

export const ALIEN3_FIORINA_PALETTE_V94 = deepFreeze({
  ...clone(ALIEN3_FIORINA_PALETTE_V93),
  id: 'fiorina-161-fidelity-v94',
  light: 0.285,
  prop: 'penal-foundry-fidelity'
});

/**
 * V94 ne fabrique pas une cinquième route. Les huit nœuds supplémentaires
 * densifient les quatre routes existantes avec des branches historiques :
 * analyse EEV, incident de l'épave, estrade de foi, batterie, cache Golic,
 * jonction du piège, reroutage de fonderie et transmission finale.
 */
const template = clone(ALIEN3_FIORINA_TEMPLATE_V93);
template.label = 'Fiorina 161 · Fidelity / Workprint reconstruction';
template.nodes.push(
  { id: 'f161-flight-analysis-v94', x: 780, y: 330, zoneId: 'f161-coast', anchor: null, width: 220 },
  { id: 'f161-wreckage-incident-v94', x: 820, y: 630, zoneId: 'f161-coast', anchor: null, width: 220 },
  { id: 'f161-faith-dais-v94', x: 2180, y: 190, zoneId: 'f161-cellblock', anchor: null, width: 250 },
  { id: 'f161-battery-locker-v94', x: 3500, y: 330, zoneId: 'f161-service', anchor: null, width: 250 },
  { id: 'f161-golic-cache-v94', x: 3660, y: 630, zoneId: 'f161-service', anchor: null, width: 230 },
  { id: 'f161-battery-junction-v94', x: 4020, y: 330, zoneId: 'f161-leadworks', anchor: null, width: 250 },
  { id: 'f161-chase-reroute-v94', x: 5050, y: 630, zoneId: 'f161-leadworks', anchor: null, width: 250 },
  { id: 'f161-final-transmission-v94', x: 6100, y: 330, zoneId: 'f161-furnace', anchor: null, width: 190 }
);

template.edges.push(
  { id: 'f161-e89', from: 'f161-eev', to: 'f161-flight-analysis-v94', kind: 'ladder', routeIds: [] },
  { id: 'f161-e90', from: 'f161-flight-analysis-v94', to: 'f161-morgue-high', kind: 'walk', routeIds: [] },
  { id: 'f161-e91', from: 'f161-eev', to: 'f161-wreckage-incident-v94', kind: 'ladder', routeIds: [] },
  { id: 'f161-e92', from: 'f161-wreckage-incident-v94', to: 'f161-infirmary', kind: 'ladder', routeIds: [] },
  { id: 'f161-e93', from: 'f161-mess-high', to: 'f161-faith-dais-v94', kind: 'ladder', routeIds: [] },
  { id: 'f161-e94', from: 'f161-faith-dais-v94', to: 'f161-perch-cell-v93', kind: 'walk', routeIds: [] },
  { id: 'f161-e95', from: 'f161-service-high', to: 'f161-battery-locker-v94', kind: 'walk', routeIds: [] },
  { id: 'f161-e96', from: 'f161-battery-locker-v94', to: 'f161-tunnel-high', kind: 'walk', routeIds: [] },
  { id: 'f161-e97', from: 'f161-tunnel-shrine', to: 'f161-golic-cache-v94', kind: 'walk', routeIds: [] },
  { id: 'f161-e98', from: 'f161-golic-cache-v94', to: 'f161-tunnel-low', kind: 'walk', routeIds: [] },
  { id: 'f161-e99', from: 'f161-tunnel-high', to: 'f161-battery-junction-v94', kind: 'walk', routeIds: [] },
  { id: 'f161-e100', from: 'f161-battery-junction-v94', to: 'f161-water-header', kind: 'walk', routeIds: [] },
  { id: 'f161-e101', from: 'f161-mold', to: 'f161-chase-reroute-v94', kind: 'ladder', routeIds: [] },
  { id: 'f161-e102', from: 'f161-chase-reroute-v94', to: 'f161-furnace', kind: 'ladder', routeIds: [] },
  { id: 'f161-e103', from: 'f161-witness-v93', to: 'f161-final-transmission-v94', kind: 'walk', routeIds: [] }
);

export const ALIEN3_FIORINA_TEMPLATE_V94 = deepFreeze(template);

export const ALIEN3_CODEX_V94 = deepFreeze([
  { id: 'f161-v94-profile', title: 'MIRE — PROFIL DE RECONSTRUCTION', category: 'MIRE', body: 'V94 sépare explicitement les profils Cinéma, Assembly et Workprint. Le profil Workprint réutilise la base Assembly pour les éléments communs puis superpose uniquement les variantes archivées.' },
  { id: 'f161-v94-flight-chain', title: 'EEV / BISHOP — CHAÎNE FORENSIQUE', category: 'ARCHIVE', body: 'Les données de l’EEV et les fragments de mémoire de Bishop sont maintenant recoupés en deux temps au lieu d’être deux preuves sans relation.' },
  { id: 'f161-v94-faith', title: 'FOI CARCÉRALE', category: 'PERSONNEL', body: 'Le réfectoire et l’estrade de Dillon matérialisent la cohésion religieuse du groupe. La foi agit sur la panique et le moral sans annuler les morts historiques.' },
  { id: 'f161-v94-wreckage', title: 'ÉPAVE — CONFRONTATION', category: 'PERSONNEL', body: 'La tension autour de Ripley près de l’épave devient une séquence non graphique et contrôlable : il faut rejoindre la zone sûre, où Dillon rétablit l’ordre.' },
  { id: 'f161-v94-battery-duty', title: 'BATTERY DUTY', category: 'ARCHIVE', body: 'Deux cellules utilisables doivent être identifiées puis raccordées au piège. Cette contrainte est obligatoire pour Assembly et Workprint avant la mise à feu.' },
  { id: 'f161-v94-golic-cache', title: 'GOLIC — CACHE DES GALERIES', category: 'PERSONNEL', body: 'Le réseau inférieur contient une cache liée à Golic. Dans le profil Workprint, elle inclut l’outil utilisé pendant son évasion sans reproduire la scène dialoguée.' },
  { id: 'f161-v94-runner-pov', title: 'RUNNER — TRACE SENSORIELLE', category: 'XÉNOBIOLOGIE', body: 'Les approches très proches du Runner peuvent déclencher une surimpression rouge de traque. Il s’agit d’une lecture MIRE, pas d’une caméra qui retire le contrôle au joueur.' },
  { id: 'f161-v94-company-message', title: 'COMPAGNIE — VARIANTE WORKPRINT', category: 'FACTION', body: 'Le profil Workprint enregistre une variante plus détaillée du message de récupération et de la liste des pertes avant la rupture du confinement.' },
  { id: 'f161-v94-golic-workprint', title: 'GOLIC — VARIANTE WORKPRINT', category: 'PERSONNEL', body: 'La chaîne Workprint documente l’évasion de Golic et l’objet utilisé pour neutraliser son gardien avant la libération du Runner.' },
  { id: 'f161-v94-improvise', title: 'BAIT-AND-CHASE — IMPROVISER', category: 'GAMEPLAY', body: 'Le dernier rabattage comporte trois secteurs de reroutage. Le joueur doit réagir au trajet réel du Runner plutôt que suivre un couloir scripté unique.' },
  { id: 'f161-v94-sprinkler', title: 'SPRINKLERS — DÉCLENCHEMENT MANUEL', category: 'ARCHIVE', body: 'La séquence de choc thermique peut être enregistrée comme activation manuelle dans le profil Workprint lorsque le Runner ressort du plomb.' },
  { id: 'f161-v94-suicidal-ripley', title: 'RIPLEY — REFUS DE FUITE', category: 'PERSONNEL', body: 'Une variante Workprint met davantage l’accent sur la volonté de Ripley de rester au contact du Runner. Le jeu la traduit par un risque volontaire sans reproduire les répliques du film.' },
  { id: 'f161-v94-camera-block', title: 'PATNA — IMAGE INTERDITE', category: 'FACTION', body: 'La confrontation finale inclut un opérateur d’image que Bishop II peut faire interrompre, renforçant la nature de l’opération de récupération.' },
  { id: 'f161-v94-final-order', title: 'FINALE — ORDRE WORKPRINT', category: 'MIRE', body: 'Le Workprint réordonne plusieurs plans de la fin. V94 conserve cette information dans MIRE sans changer l’objectif principal de la partie.' },
  { id: 'f161-v94-final-transmission', title: 'DERNIÈRE TRANSMISSION', category: 'ARCHIVE', body: 'Une borne haute permet de sceller le dernier paquet de télémétrie après la confrontation finale et avant la fermeture de l’archive.' },
  { id: 'f161-v94-social-trust', title: 'COHÉSION / CONFIANCE', category: 'GAMEPLAY', body: 'Le comportement de Ripley, la foi observée et les tâches réussies influencent la confiance des détenus et réduisent légèrement la panique systémique.' },
  { id: 'f161-v94-perfect', title: 'ARCHIVE PARFAITE — FIDELITY', category: 'MIRE', body: 'Le contrat Fidelity exige l’héritage V93, toutes les preuves V94, la chaîne forensique, la préparation batterie lorsque nécessaire, le bait-and-chase et la transmission finale.' },
  { id: 'f161-v94-workprint', title: 'WORKPRINT — RECONSTRUCTION ISOLÉE', category: 'MIRE', body: 'Le profil Workprint est une reconstruction isolée : il ne remplace ni le montage cinéma ni l’Assembly Cut et n’invente pas de quatrième continuité.' }
]);

export const ALIEN3_V94_EVIDENCE_IDS = deepFreeze([
  'profile-selected',
  'flight-recorder-chain',
  'prison-faith',
  'wreckage-confrontation',
  'battery-cell-a',
  'battery-cell-b',
  'battery-duty',
  'golic-cache',
  'runner-pov',
  'workprint-company-message',
  'workprint-golic-release',
  'improvised-chase',
  'manual-sprinklers',
  'ripley-last-stand',
  'company-camera-block',
  'finale-order',
  'final-transmission',
  'perfect-fidelity-run'
]);

export const ALIEN3_FIDELITY_BEATS_V94 = deepFreeze([
  { id: 'wreckage', evidenceId: 'wreckage-confrontation', phases: ['infirmary', 'first-blood'], x: 820, y: 630, radius: 180, title: 'ÉPAVE · TENSION', subtitle: 'Rejoindre la zone sûre sans perdre le contrôle de la situation.' },
  { id: 'faith', evidenceId: 'prison-faith', phases: ['infirmary', 'first-blood', 'bishop'], x: 2180, y: 190, radius: 190, title: 'ASSEMBLY HALL · FOI', subtitle: 'Observer la cohésion du groupe et la place de Dillon.' },
  { id: 'battery', evidenceId: 'battery-duty', phases: ['trap-prep'], x: 3500, y: 330, radius: 190, title: 'BATTERY DUTY', subtitle: 'Trouver deux cellules capables d’alimenter le piège.' },
  { id: 'golic-cache', evidenceId: 'golic-cache', phases: ['bishop', 'trap-prep', 'fire-maze'], x: 3660, y: 630, radius: 180, title: 'GALERIES · CACHE GOLIC', subtitle: 'Inspecter la réserve abandonnée dans le réseau inférieur.' },
  { id: 'improvise', evidenceId: 'improvised-chase', phases: ['leadworks', 'molten-lead'], x: 5050, y: 630, radius: 200, title: 'FOUNDERIE · IMPROVISER', subtitle: 'Rerouter le Runner secteur par secteur jusqu’au moule.' },
  { id: 'transmission', evidenceId: 'final-transmission', phases: ['finale'], x: 6100, y: 330, radius: 170, title: 'MIRE · DERNIER PAQUET', subtitle: 'Sceller la télémétrie finale avant fermeture de l’archive.' }
]);

export const ALIEN3_V94_STATIONS = deepFreeze([
  { id: 'f161-profile-theatrical-v94', kind: 'profile', profileId: 'theatrical', x: 290, y: 438, w: 64, h: 72, label: 'MIRE · CINÉMA' },
  { id: 'f161-profile-assembly-v94', kind: 'profile', profileId: 'assembly', x: 390, y: 438, w: 64, h: 72, label: 'MIRE · ASSEMBLY' },
  { id: 'f161-profile-workprint-v94', kind: 'profile', profileId: 'workprint', x: 490, y: 438, w: 64, h: 72, label: 'MIRE · WORKPRINT' },
  { id: 'f161-flight-analysis-console-v94', kind: 'flight-analysis', x: 744, y: 258, w: 72, h: 72, label: 'ANALYSER LE JOURNAL EEV' },
  { id: 'f161-faith-record-v94', kind: 'faith', x: 2144, y: 118, w: 72, h: 72, label: 'OBSERVER L’ASSEMBLÉE' },
  { id: 'f161-battery-cell-a-v94', kind: 'battery-cell', cellId: 'A', x: 3450, y: 258, w: 52, h: 72, label: 'CELLULE A' },
  { id: 'f161-battery-cell-b-v94', kind: 'battery-cell', cellId: 'B', x: 3508, y: 258, w: 52, h: 72, label: 'CELLULE B' },
  { id: 'f161-battery-junction-v94', kind: 'battery-junction', x: 3984, y: 258, w: 72, h: 72, label: 'ALIMENTER LE PIÈGE' },
  { id: 'f161-golic-cache-console-v94', kind: 'golic-cache', x: 3624, y: 558, w: 72, h: 72, label: 'FOUILLER LA CACHE DE GOLIC' },
  { id: 'f161-chase-reroute-console-v94', kind: 'chase-reroute', x: 5014, y: 558, w: 72, h: 72, label: 'REROUTER LE CORRIDOR' },
  { id: 'f161-final-transmission-console-v94', kind: 'final-transmission', x: 6064, y: 258, w: 72, h: 72, label: 'SCELLER LA TRANSMISSION' }
]);

const profileIds = new Set(ALIEN3_RECONSTRUCTION_PROFILES_V94.map((entry) => entry.id));
const codexIds = new Set(ALIEN3_CODEX_V94.map((entry) => entry.id));
const evidenceIds = new Set(ALIEN3_V94_EVIDENCE_IDS);
const beatIds = new Set(ALIEN3_FIDELITY_BEATS_V94.map((entry) => entry.id));
const cellIds = new Set(['A', 'B']);

export function createAlien3StateV94() {
  return {
    schema: ALIEN3_DLC_SCHEMA_V94,
    operationId: ALIEN3_OPERATION_ID_V94,
    profile: {
      id: 'theatrical',
      selected: false,
      locked: false,
      baseCut: 'theatrical'
    },
    codexUnlocked: [],
    codexViewed: [],
    currentCodexId: null,
    evidenceRecovered: [],
    fidelity: {
      beats: Object.fromEntries([...beatIds].map((id) => [id, false])),
      beatCount: 0,
      flightRecorderAnalyzed: false,
      bishopCrossChecked: false,
      forensicsComplete: false,
      faithObserved: false,
      wreckageStarted: false,
      wreckageResolved: false,
      wreckageClock: 0,
      dillonIntervention: false,
      golicCacheFound: false,
      companyMessageVariant: false,
      golicWorkprintSeen: false,
      manualSprinklers: false,
      ripleyLastStand: false,
      cameraBlocked: false,
      finaleOrderLogged: false,
      finalTransmission: false
    },
    social: {
      faith: 48,
      trustRipley: 36,
      discipline: 54,
      panicRelief: 0
    },
    batteryDuty: {
      cells: { A: false, B: false },
      tested: 0,
      junctionPowered: false,
      complete: false
    },
    chase: {
      reroutes: 0,
      sectors: { A: false, B: false, C: false },
      activeSector: 'A',
      improvised: false,
      runnerPovClock: 0,
      runnerPovPulses: 0,
      closestRunnerRange: 9999
    },
    perfectArchive: {
      inheritedV93: false,
      profileComplete: false,
      forensicsComplete: false,
      batteryComplete: false,
      socialComplete: false,
      chaseComplete: false,
      transmissionComplete: false,
      perfect: false
    },
    telemetry: {
      interactions: 0,
      fidelityBeats: 0,
      batteryChecks: 0,
      reroutes: 0,
      runnerPovPulses: 0,
      workprintBeats: 0,
      trustPeak: 36,
      faithPeak: 48
    },
    achievementIds: []
  };
}

export function sanitizeAlien3StateV94(raw) {
  const fallback = createAlien3StateV94();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || Number(raw.schema) !== ALIEN3_DLC_SCHEMA_V94) return fallback;
  const profile = raw.profile && typeof raw.profile === 'object' ? raw.profile : {};
  const fidelity = raw.fidelity && typeof raw.fidelity === 'object' ? raw.fidelity : {};
  const social = raw.social && typeof raw.social === 'object' ? raw.social : {};
  const battery = raw.batteryDuty && typeof raw.batteryDuty === 'object' ? raw.batteryDuty : {};
  const chase = raw.chase && typeof raw.chase === 'object' ? raw.chase : {};
  const perfect = raw.perfectArchive && typeof raw.perfectArchive === 'object' ? raw.perfectArchive : {};
  const telemetry = raw.telemetry && typeof raw.telemetry === 'object' ? raw.telemetry : {};
  const selectedProfile = profileIds.has(profile.id) ? profile.id : fallback.profile.id;
  const selectedDefinition = alien3V94Profile(selectedProfile);
  return {
    ...fallback,
    profile: {
      id: selectedProfile,
      selected: bool(profile.selected),
      locked: bool(profile.locked),
      baseCut: selectedDefinition.baseCut
    },
    codexUnlocked: unique(raw.codexUnlocked, codexIds),
    codexViewed: unique(raw.codexViewed, codexIds),
    currentCodexId: codexIds.has(raw.currentCodexId) ? raw.currentCodexId : null,
    evidenceRecovered: unique(raw.evidenceRecovered, evidenceIds),
    fidelity: {
      beats: Object.fromEntries([...beatIds].map((id) => [id, bool(fidelity.beats?.[id])])),
      beatCount: Math.round(clamp(fidelity.beatCount, 0, ALIEN3_FIDELITY_BEATS_V94.length)),
      flightRecorderAnalyzed: bool(fidelity.flightRecorderAnalyzed),
      bishopCrossChecked: bool(fidelity.bishopCrossChecked),
      forensicsComplete: bool(fidelity.forensicsComplete),
      faithObserved: bool(fidelity.faithObserved),
      wreckageStarted: bool(fidelity.wreckageStarted),
      wreckageResolved: bool(fidelity.wreckageResolved),
      wreckageClock: clamp(fidelity.wreckageClock, 0, 20),
      dillonIntervention: bool(fidelity.dillonIntervention),
      golicCacheFound: bool(fidelity.golicCacheFound),
      companyMessageVariant: bool(fidelity.companyMessageVariant),
      golicWorkprintSeen: bool(fidelity.golicWorkprintSeen),
      manualSprinklers: bool(fidelity.manualSprinklers),
      ripleyLastStand: bool(fidelity.ripleyLastStand),
      cameraBlocked: bool(fidelity.cameraBlocked),
      finaleOrderLogged: bool(fidelity.finaleOrderLogged),
      finalTransmission: bool(fidelity.finalTransmission)
    },
    social: {
      faith: clamp(social.faith, 0, 100),
      trustRipley: clamp(social.trustRipley, 0, 100),
      discipline: clamp(social.discipline, 0, 100),
      panicRelief: clamp(social.panicRelief, 0, 100)
    },
    batteryDuty: {
      cells: Object.fromEntries([...cellIds].map((id) => [id, bool(battery.cells?.[id])])),
      tested: Math.round(clamp(battery.tested, 0, 2)),
      junctionPowered: bool(battery.junctionPowered),
      complete: bool(battery.complete)
    },
    chase: {
      reroutes: Math.round(clamp(chase.reroutes, 0, 99)),
      sectors: {
        A: bool(chase.sectors?.A),
        B: bool(chase.sectors?.B),
        C: bool(chase.sectors?.C)
      },
      activeSector: ['A', 'B', 'C'].includes(chase.activeSector) ? chase.activeSector : 'A',
      improvised: bool(chase.improvised),
      runnerPovClock: clamp(chase.runnerPovClock, 0, 8),
      runnerPovPulses: Math.round(clamp(chase.runnerPovPulses, 0, 999)),
      closestRunnerRange: clamp(chase.closestRunnerRange, 0, 9999)
    },
    perfectArchive: {
      inheritedV93: bool(perfect.inheritedV93),
      profileComplete: bool(perfect.profileComplete),
      forensicsComplete: bool(perfect.forensicsComplete),
      batteryComplete: bool(perfect.batteryComplete),
      socialComplete: bool(perfect.socialComplete),
      chaseComplete: bool(perfect.chaseComplete),
      transmissionComplete: bool(perfect.transmissionComplete),
      perfect: bool(perfect.perfect)
    },
    telemetry: {
      interactions: Math.round(clamp(telemetry.interactions, 0, 9999)),
      fidelityBeats: Math.round(clamp(telemetry.fidelityBeats, 0, 999)),
      batteryChecks: Math.round(clamp(telemetry.batteryChecks, 0, 999)),
      reroutes: Math.round(clamp(telemetry.reroutes, 0, 999)),
      runnerPovPulses: Math.round(clamp(telemetry.runnerPovPulses, 0, 999)),
      workprintBeats: Math.round(clamp(telemetry.workprintBeats, 0, 999)),
      trustPeak: clamp(telemetry.trustPeak, 0, 100),
      faithPeak: clamp(telemetry.faithPeak, 0, 100)
    },
    achievementIds: Array.isArray(raw.achievementIds)
      ? [...new Set(raw.achievementIds.filter((entry) => typeof entry === 'string').map((entry) => entry.slice(0, 96)))].slice(0, 128)
      : []
  };
}

export function alien3V94Profile(id) {
  return ALIEN3_RECONSTRUCTION_PROFILES_V94.find((entry) => entry.id === id) || ALIEN3_RECONSTRUCTION_PROFILES_V94[0];
}

export function alien3V94CodexEntry(id) {
  return ALIEN3_CODEX_V94.find((entry) => entry.id === id) || null;
}

export function alien3V94Grade({
  gradeV93 = 'D',
  evidence = 0,
  fidelityBeats = 0,
  batteryComplete = false,
  forensicsComplete = false,
  social = 0,
  perfect = false
} = {}) {
  const base = { 'S++++': 138, 'S+++': 130, 'S++': 121, 'S+': 112, S: 101, A: 90, B: 78, C: 65, D: 52 }[gradeV93] || 52;
  const evidenceScore = clamp(evidence / Math.max(1, ALIEN3_V94_EVIDENCE_IDS.length), 0, 1) * 8;
  const beatScore = clamp(fidelityBeats / Math.max(1, ALIEN3_FIDELITY_BEATS_V94.length), 0, 1) * 4;
  const systems = (batteryComplete ? 2 : 0) + (forensicsComplete ? 2 : 0);
  const socialScore = clamp(social / 100, 0, 1) * 2;
  const perfectBonus = perfect ? 4 : 0;
  const score = base + evidenceScore + beatScore + systems + socialScore + perfectBonus;
  return score >= 156 ? 'S+++++'
    : score >= 145 ? 'S++++'
      : score >= 135 ? 'S+++'
        : score >= 125 ? 'S++'
          : score >= 115 ? 'S+'
            : score >= 103 ? 'S'
              : score >= 90 ? 'A'
                : score >= 78 ? 'B'
                  : score >= 65 ? 'C' : 'D';
}

export function validateAlien3DlcV94() {
  const failures = [];
  const nodes = ALIEN3_FIORINA_TEMPLATE_V94.nodes;
  const edges = ALIEN3_FIORINA_TEMPLATE_V94.edges;
  const routes = ALIEN3_FIORINA_TEMPLATE_V94.routes;
  const zones = ALIEN3_FIORINA_TEMPLATE_V94.zones;
  const nodeIds = new Set(nodes.map((entry) => entry.id));
  const edgePairs = new Set(edges.flatMap((entry) => [`${entry.from}>${entry.to}`, `${entry.to}>${entry.from}`]));
  const zoneMap = new Map(zones.map((entry) => [entry.id, entry]));
  const adjacency = new Map(nodes.map((entry) => [entry.id, []]));
  for (const edge of edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) failures.push(`missing edge endpoint ${edge.id}`);
    adjacency.get(edge.from)?.push(edge.to);
    if (!edge.oneWay) adjacency.get(edge.to)?.push(edge.from);
  }
  if (ALIEN3_FIORINA_TEMPLATE_V94.id !== ALIEN3_TEMPLATE_ID_V94) failures.push('template id mismatch');
  if (nodes.length !== 62) failures.push(`node count ${nodes.length} != 62`);
  if (edges.length !== 102) failures.push(`edge count ${edges.length} != 102`);
  if (routes.length !== 4) failures.push(`route count ${routes.length} != 4`);
  if (ALIEN3_RECONSTRUCTION_PROFILES_V94.length !== 3) failures.push('three reconstruction profiles required');
  if (ALIEN3_CODEX_V94.length !== 18) failures.push(`codex count ${ALIEN3_CODEX_V94.length} != 18`);
  if (ALIEN3_V94_EVIDENCE_IDS.length !== 18) failures.push(`evidence count ${ALIEN3_V94_EVIDENCE_IDS.length} != 18`);
  if (ALIEN3_FIDELITY_BEATS_V94.length !== 6) failures.push(`fidelity beat count ${ALIEN3_FIDELITY_BEATS_V94.length} != 6`);
  if (ALIEN3_V94_STATIONS.length !== 11) failures.push(`station count ${ALIEN3_V94_STATIONS.length} != 11`);
  if (new Set(nodes.map((entry) => entry.id)).size !== nodes.length) failures.push('duplicate node ids');
  if (new Set(edges.map((entry) => entry.id)).size !== edges.length) failures.push('duplicate edge ids');
  if (new Set(ALIEN3_V94_STATIONS.map((entry) => entry.id)).size !== ALIEN3_V94_STATIONS.length) failures.push('duplicate station ids');
  if (new Set(ALIEN3_CODEX_V94.map((entry) => entry.id)).size !== ALIEN3_CODEX_V94.length) failures.push('duplicate codex ids');
  if (new Set(ALIEN3_V94_EVIDENCE_IDS).size !== ALIEN3_V94_EVIDENCE_IDS.length) failures.push('duplicate evidence ids');
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
      nodes: nodes.length,
      edges: edges.length,
      routes: routes.length,
      zones: zones.length,
      codex: ALIEN3_CODEX_V94.length,
      evidence: ALIEN3_V94_EVIDENCE_IDS.length,
      fidelityBeats: ALIEN3_FIDELITY_BEATS_V94.length,
      stations: ALIEN3_V94_STATIONS.length,
      profiles: ALIEN3_RECONSTRUCTION_PROFILES_V94.length,
      connectedNodes: reached.size
    }
  });
}
