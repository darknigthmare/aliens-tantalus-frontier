import { restoreMissionInsertionV62 } from './mission-insertion-v62.js';
/** Original Tantalus fiction. ARBITER AB-40 is an offline evidentiary and
 * authorization terminal, never a biological controller of live organisms. */
export const ARBITER_DEVICE_V190 = Object.freeze({ id: 'arbiter-ab40', name: 'ARBITER', model: 'AB-40',
  serial: 'AB40-LT-074', label: 'ARBITER · module d’arbitrage biométrique AB-40',
  origin: 'tantalus-project-original', canonExact: false });
const step = (id, label, x, seconds, evidenceId, text, kind = 'terminal') => Object.freeze({
  id, label, x, groundY: 570, seconds, evidenceId, text, kind });
const definitions = [
  ['01-freight', 'Le fret sans destinataire', 'QUAI SOUS CONTRAT · LETHE',
    'Copier le manifeste et identifier le passage des invités hors du registre de fret.',
    'Des conteneurs biologiques sont imputés à une fondation vide. Leurs horaires coïncident avec des visites de cadres.',
    [step('manifest', 'MANIFESTE SOUS SCELLÉS', 360, 2, 'freight-ledger', 'Rook : les masses de fret restent réelles ; ce sont les destinataires qui ont été remplacés.'),
      step('guest-route', 'LECTEUR DES INVITÉS', 1120, 2, 'guest-route', 'Echo-9 : la galerie privée utilisait le quai de maintenance. Je conserve les horaires avant de repartir.')]],
  ['02-gallery', 'La tribune privée', 'GALERIE D’OBSERVATION · LETHE',
    'Rétablir l’éclairage local, puis copier le registre des séances privées.',
    'Des cadres regardaient des affrontements sous couvert d’évaluation de risques. Une issue scellée mène à leur loge.',
    [step('gallery-power', 'COUPURE DE SERVICE', 320, 2, 'gallery-power', 'MU/TH/UR : alimentation locale rétablie. Aucun lien extérieur n’a été réactivé.'),
      step('private-register', 'REGISTRE DES SÉANCES', 1210, 3, 'private-sessions', 'Rook : les mises finançaient des droits de concession. Les participants ont choisi de laisser une trace comptable.')]],
  ['03-custody', 'Le porteur absent', 'LOGE EXÉCUTIVE · LETHE',
    'Identifier le cadre mort, récupérer son module scellé et relever la limite de son badge.',
    'Le corps d’un cadre se trouve derrière la tribune. Son module ARBITER est intact ; la cause du décès reste indéterminée.',
    [step('executive-body', 'CADRE DÉCÉDÉ · SCELLÉ PERSONNEL', 430, 3, 'device-custody', 'Echo-9 : module AB-40, numéro LT-074. Je photographie le scellé avant de le déplacer. Le corps reste sur place.', 'body'),
      step('limited-badge', 'BORNE D’IDENTITÉ LOCALE', 1230, 2, 'limited-credential', 'MU/TH/UR : badge limité à ce poste. Ni accès maître, ni droits sur un organisme vivant. La chaîne de possession est enregistrée.')]],
  ['04-arbitration', 'Les comptes du vainqueur', 'CHAMBRE D’ARBITRAGE · LETHE',
    'Confronter les procès-verbaux et les transferts de concession sans envoyer de commande.',
    'Les combats privés servaient aussi à départager des dirigeants : le résultat imposait cessions, sanctions et votes sous contrainte.',
    [step('minutes', 'PROCÈS-VERBAUX SCELLÉS', 360, 3, 'coercive-arbitration', 'Rook : ce règlement interne faisait perdre un poste ou un contrat au camp battu. Le spectacle donnait une apparence de procédure à la menace.'),
      step('concessions', 'JOURNAL DES CONCESSIONS', 1170, 3, 'concession-transfers', 'MU/TH/UR : les transferts et les votes concordent avec les séances. Les preuves établissent ce réseau local ; elles ne décrivent pas toute la compagnie.')]],
  ['05-isolation', 'Couper le fil', 'RELAIS DE CONFIANCE · LETHE',
    'Débrancher l’antenne, effacer les autorisations actives puis monter une copie en lecture seule.',
    'Le terminal doit être isolé de Weyland-Yutani avant toute ouverture. L’exemplaire saisi reste scellé ; le travail porte sur une copie locale.',
    [step('antenna', 'COUPLEUR DE L’ANTENNE', 300, 2, 'network-isolation', 'Echo-9 : câble de données retiré et blindage refermé. La prise ne rejoint plus le réseau compagnie.', 'coupler'),
      step('revocation', 'CLÉ D’AUTORISATION ACTIVE', 990, 2, 'credentials-revoked', 'MU/TH/UR : jetons actifs révoqués sur la copie. Le badge du défunt ne peut signer aucun nouveau transfert.'),
      step('read-only', 'COPIE DE TRAVAIL EN LECTURE SEULE', 1530, 3, 'read-only-image', 'Inez Harlow : les journaux restent conservés. Le banc n’accepte que les séquences et profils déjà archivés.')]],
  ['06-local', 'Une arène sans propriétaires', 'BANC MIRE ISOLÉ · LETHE',
    'Vérifier le banc hors réseau, charger une séquence archivée et sceller le transfert vers le Tantalus.',
    'L’équipe ouvre un bac à sable MIRE à partir des archives ARBITER. Xeno Trials devient une lecture interactive de ces essais, sans enjeu sur des captifs réels.',
    [step('air-gap', 'CONTRÔLE DU BANC ISOLÉ', 330, 2, 'bench-air-gap', 'MU/TH/UR : aucun lien réseau. Les sorties du banc sont limitées à l’image, au son et au compte rendu local.'),
      step('local-replay', 'SÉQUENCE ARCHIVÉE · MIRE', 1050, 3, 'mire-local-replay', 'Echo-9 : nous reprenons les paramètres du dossier, pas le commandement des créatures. Les évaluations restent des simulations.'),
      step('seal', 'COFFRET DE TRANSFERT SCELLÉ', 1580, 2, 'transfer-seal', 'Rook : preuves, copie isolée et module scellé séparés. La liaison au Tantalus conserve la provenance des essais.', 'case')]]
];
export const ARBITER_MISSIONS_V190 = Object.freeze(definitions.map(([slug, name, location, objective, summary, stations], index) => Object.freeze({
  id: `arbiter-${slug}`, campaignId: `special-arbiter-${slug}`, index, name, location, objective, summary,
  stations: Object.freeze(stations), extraction: Object.freeze({ id: 'extraction', x: 2110, groundY: 570, seconds: 2 }),
  deviceRecovered: index >= 2, localIsolated: index >= 4, localMireEnabled: index === 5,
  canonExact: false, provenance: 'tantalus-project-original' })));
export const ARBITER_CAMPAIGNS_V190 = Object.freeze(ARBITER_MISSIONS_V190.map(mission => Object.freeze({
  id: mission.campaignId, specialOperationId: mission.id, name: `ARBITER ${mission.index + 1}/6 · ${mission.name}`,
  mode: 'INVESTIGATION', worldId: 'world-05-lethe', year: 2204, routes: 2, canon: 'project-continuity', canonExact: false,
  source: 'Tantalus Original Operations', templateId: 'colony-multiroute', objective: mission.objective,
  summary: mission.summary, description: `${mission.summary} Parcours de récupération original du Tantalus, avec interaction locale et extraction physique.` })));
export const getArbiterMissionV190 = id => ARBITER_MISSIONS_V190.find(mission => mission.campaignId === id || mission.id === id) || null;
export const isArbiterCampaignV190 = id => Boolean(getArbiterMissionV190(id));
const clone = value => structuredClone(value);
const same = (left, right) => Array.isArray(left) && left.length === right.length && left.every((value, index) => value === right[index]);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const bounded = (value, max) => Number.isFinite(value) && value >= 0 && value <= max;
export function createArbiterMissionStateV190(campaignId) {
  const mission = getArbiterMissionV190(campaignId);
  if (!mission) return null;
  return { schema: 190, campaignId: mission.campaignId, operationId: mission.id, stage: 0,
    completedStationIds: [], channelProgress: 0, exitProgress: 0, complete: false, receipt: null };
}
export function createArbiterReceiptV190(mission) {
  return { schema: 190, campaignId: mission.campaignId, operationId: mission.id,
    source: 'native-arbiter-mission-v190', evidenceIds: mission.stations.map(station => station.evidenceId),
    deviceSerial: mission.deviceRecovered ? ARBITER_DEVICE_V190.serial : null, deviceRecovered: mission.deviceRecovered,
    localIsolated: mission.localIsolated, localMireEnabled: mission.localMireEnabled };
}
export function validateArbiterReceiptV190(raw, campaignId = raw?.campaignId) {
  const mission = getArbiterMissionV190(campaignId);
  if (!mission || !object(raw)) return false;
  const expected = createArbiterReceiptV190(mission);
  return Object.keys(expected).every(key => key === 'evidenceIds' ? same(raw[key], expected[key]) : raw[key] === expected[key])
    && Object.keys(raw).every(key => Object.hasOwn(expected, key));
}
export function validateArbiterMissionStateV190(raw, campaignId = raw?.campaignId) {
  const mission = getArbiterMissionV190(campaignId), count = mission?.stations.length;
  if (!mission || !object(raw) || raw.schema !== 190 || raw.campaignId !== mission.campaignId || raw.operationId !== mission.id
    || Object.keys(raw).some(key => !['schema', 'campaignId', 'operationId', 'stage', 'completedStationIds', 'channelProgress', 'exitProgress', 'complete', 'receipt'].includes(key))
    || !Number.isInteger(raw.stage) || raw.stage < 0 || raw.stage > count
    || !same(raw.completedStationIds, mission.stations.slice(0, raw.stage).map(station => station.id))
    || !bounded(raw.channelProgress, mission.stations[raw.stage]?.seconds || 0)
    || !bounded(raw.exitProgress, 2) || raw.exitProgress > 0 && raw.stage !== count
    || typeof raw.complete !== 'boolean' || raw.complete && (raw.stage !== count || raw.exitProgress !== 2)
    || (raw.complete ? !validateArbiterReceiptV190(raw.receipt, mission.campaignId) : raw.receipt !== null))
    return { valid: false, reason: 'arbiter-state-inconsistent' };
  return { valid: true, state: clone(raw), mission };
}
export function createArbiterCampaignProgressV190() { return { schema: 190, completedCampaignIds: [], returns: [] }; }
export function normalizeArbiterCampaignProgressV190(raw) {
  const progress = createArbiterCampaignProgressV190();
  if (!object(raw) || raw.schema !== 190 || !Array.isArray(raw.returns) || !Array.isArray(raw.completedCampaignIds)) return progress;
  for (const mission of ARBITER_MISSIONS_V190) {
    const entry = raw.returns[progress.returns.length];
    if (raw.completedCampaignIds[progress.returns.length] !== mission.campaignId || !object(entry)
      || entry.campaignId !== mission.campaignId || typeof entry.operationId !== 'string'
      || !new RegExp(`^operation-[1-9][0-9]{0,8}-${mission.campaignId}$`).test(entry.operationId)
      || !validateArbiterReceiptV190(entry.receipt, mission.campaignId)) break;
    progress.completedCampaignIds.push(mission.campaignId);
    progress.returns.push({ campaignId: mission.campaignId, operationId: entry.operationId, receipt: clone(entry.receipt) });
  }
  return progress;
}
export function arbiterCampaignAccessV190(raw, campaignId) {
  const progress = normalizeArbiterCampaignProgressV190(raw), mission = getArbiterMissionV190(campaignId);
  if (!mission) return { available: false, reason: 'unknown-campaign', mission: null };
  const available = mission.index <= progress.completedCampaignIds.length;
  return { available, reason: available ? 'available' : 'previous-extraction-required', mission };
}
export function recordArbiterCampaignReturnV190(raw, { campaignId, operationId, success, arbiterV190, resumeState, rewards } = {}) {
  const state = normalizeArbiterCampaignProgressV190(raw), mission = getArbiterMissionV190(campaignId);
  const checked = validateArbiterCompletionV190({ campaignId, operationId, success, arbiterV190, resumeState, rewards });
  if (!mission || !success || !checked.valid || !checked.state.complete
    || typeof operationId !== 'string' || !new RegExp(`^operation-[1-9][0-9]{0,8}-${mission.campaignId}$`).test(operationId))
    return { applied: false, state, reason: 'complete-native-return-required' };
  if (state.completedCampaignIds.includes(mission.campaignId)) return { applied: false, state, reason: 'already-recorded' };
  if (state.completedCampaignIds.length !== mission.index) return { applied: false, state, reason: 'previous-extraction-required' };
  state.completedCampaignIds.push(mission.campaignId);
  state.returns.push({ campaignId: mission.campaignId, operationId, receipt: clone(checked.state.receipt) });
  return { applied: true, state, reason: 'evidence-archived' };
}
export function arbiterMissionDossierV190(state) {
  const mission = getArbiterMissionV190(state?.campaignId);
  if (!mission) return null;
  const station = mission.stations[state.stage];
  return { title: state.complete ? 'TRANSFERT CONFIRMÉ' : station?.label || 'RETOUR AU SAS',
    instruction: state.complete ? 'Le bilan de retour archive les preuves et ouvre la suite de l’enquête.'
      : station ? `Rejoindre ${station.label} et maintenir E ${station.seconds} s.` : 'Rejoindre le sas est et maintenir E 2 s.',
    step: state.stage, total: mission.stations.length, complete: state.complete };
}
export function arbiterCampaignBriefingV190(campaignId, raw) {
  const mission = getArbiterMissionV190(campaignId); if (!mission) return null;
  const access = arbiterCampaignAccessV190(raw, campaignId);
  return { title: `ARBITER · ${mission.name}`, location: mission.location, objective: mission.objective,
    lines: [{ speaker: 'Rook · liaison reconnaissance', text: mission.summary },
      { speaker: 'MU/TH/UR', text: 'Chaîne de possession requise : relever les sources locales, conserver les scellés, puis revenir par le sas.' }],
    index: mission.index, total: 6, available: access.available, canonExact: false,
    notice: 'Enquête originale du Tantalus. ARBITER n’accorde aucun contrôle sur des créatures réelles ; Xeno Trials conserve son accès existant.' };
}

/** A strategic return must use the captured complete native mission, not just a
 * copied receipt or an unrelated successful mission callback. */
export function validateArbiterCompletionV190({ campaignId, operationId, success, arbiterV190, resumeState, rewards } = {}) {
  const mission = getArbiterMissionV190(campaignId);
  const checked = validateArbiterMissionStateV190(arbiterV190, campaignId);
  const saved = validateArbiterMissionStateV190(resumeState?.arbiterMissionV190?.state, campaignId);
  if (!mission || success !== true || !checked.valid || !checked.state.complete || !saved.valid || !saved.state.complete
    || typeof operationId !== 'string' || !new RegExp(`^operation-[1-9][0-9]{0,8}-${mission.campaignId}$`).test(operationId)
    || resumeState?.schema !== 1 || resumeState?.arbiterMissionV190?.deploymentId !== operationId
    || resumeState?.identity?.campaignId !== campaignId || resumeState?.identity?.worldId !== 'world-05-lethe'
    || resumeState?.mission?.state !== 'complete' || resumeState?.player?.alive !== true || resumeState?.player?.downed !== false
    || !bounded(resumeState?.arbiterMissionV190?.body?.width, 256) || resumeState.arbiterMissionV190.body.width < 1
    || !bounded(resumeState?.arbiterMissionV190?.body?.height, 256) || resumeState.arbiterMissionV190.body.height < 1
    || !Number.isFinite(resumeState?.player?.x) || !Number.isFinite(resumeState?.player?.y)
    || Math.hypot(resumeState.player.x + resumeState.arbiterMissionV190.body.width / 2 - mission.extraction.x,
      resumeState.player.y + resumeState.arbiterMissionV190.body.height - mission.extraction.groundY) > 72
    || JSON.stringify(checked.state) !== JSON.stringify(saved.state)
    || typeof resumeState?.missionLevel?.signature !== 'string' || !resumeState.missionLevel.signature.endsWith(`:${mission.id}-v190`)
    || !object(rewards) || !object(resumeState?.mission?.rewards)
    || Object.keys(rewards).length !== Object.keys(resumeState.mission.rewards).length
    || Object.keys(rewards).some(key => !Object.hasOwn(resumeState.mission.rewards, key) || rewards[key] !== resumeState.mission.rewards[key]))
    return { valid: false, reason: 'arbiter-complete-snapshot-required' };
  return { valid: true, state: checked.state, mission };
}
export function arbiterInsertionStoryV190(value) {
  let insertion; try { insertion = restoreMissionInsertionV62(value); } catch { return null; }
  const mission = getArbiterMissionV190(insertion.campaignId);
  if (!mission || insertion.worldId !== 'world-05-lethe') return null;
  const phase = insertion.phases[insertion.currentIndex]?.kind;
  const lines = phase === 'preparation' ? [
    { speaker: 'Inez Harlow · liaison science', text: 'Tout module retrouvé doit rester sous scellés. Ne branchez aucun équipement compagnie sur un réseau du bord.' },
    { speaker: 'Echo-9', text: 'Je relève la source, je récupère la copie et je confirme le retour. Aucun résultat d’arène ne remplacera ces preuves.' }
  ] : phase === 'player-control' ? [
    { speaker: 'MU/TH/UR', text: mission.objective },
    { speaker: 'Rook · liaison reconnaissance', text: 'Les postes sont au sol. La passerelle de service offre un autre trajet ; le sas reste bloqué tant que les relevés manquent.' }
  ] : [
    { speaker: 'Rook · liaison reconnaissance', text: mission.summary },
    { speaker: 'MU/TH/UR', text: 'L’AB-40 conserve des mandats, des cotes et des scellés. Les installations clandestines étaient opérées par des humains ; le terminal ne commande aucune créature.' }
  ];
  return { id: mission.id, campaignName: ARBITER_CAMPAIGNS_V190[mission.index].name, title: mission.name,
    location: mission.location, objective: mission.objective, lines, choices: [], canChoose: false,
    protocolNotice: 'Enquête originale du Tantalus. Les 189 incarnations de Xeno Trials sont des modèles MIRE et des archives prédictives, pas des captifs du bord.',
    canonExact: false, provenance: 'tantalus-project-original' };
}
