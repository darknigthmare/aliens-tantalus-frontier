import { CREW, ENEMIES } from './content.js';
import { applyInfestationActionV62, INFESTATION_ACTIONS_V62 } from './infestation-chain-v62.js';

export const HUB_ANNEX_OPERATIONS_SCHEMA_V71 = 71;
export const P5000_VEHICLE_ID_V71 = 'vehicle-007-p-5000-powered-work-loader';
export const PROVING_GROUND_COURSE_ID_V81 = 'm41a-qualification-v81';

export const HUB_ANNEX_SYSTEM_EFFECTS_V71 = Object.freeze({
  'arrival-airlock': Object.freeze({ quarantine: 5, oxygen: 3 }),
  logistics: Object.freeze({ supplies: 4 }),
  'mire-archives': Object.freeze({ research: 5 }),
  'synthetic-bay': Object.freeze({ power: -2 }),
  cctv: Object.freeze({ security: 6 }),
  'proving-ground': Object.freeze({ morale: 4, security: 2 }),
  morgue: Object.freeze({ quarantine: 3, research: 3 }),
  'escape-pods': Object.freeze({ oxygen: 4, hull: 2 }),
  durandal: Object.freeze({ security: 4, power: 3 }),
  bioforge: Object.freeze({ quarantine: 5 })
});

export const HUB_ANNEX_BUSINESS_IDS_V71 = Object.freeze(Object.keys(HUB_ANNEX_SYSTEM_EFFECTS_V71));

const SYNTHETIC_CREW_IDS_V71 = Object.freeze(CREW
  .filter((member) => member.species === 'synthetic')
  .map((member) => member.id));
const SYNTHETIC_CREW_ID_SET_V71 = new Set(SYNTHETIC_CREW_IDS_V71);
const AVAILABLE_CREW_STATUSES_V71 = new Set(['active', 'injured', 'recovering']);
const MAX_MORGUE_CASES_V71 = 512;
const MAX_MORGUE_EVIDENCE_V71 = 512;
const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const finiteInteger = (value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, Math.floor(parsed))) : fallback;
};
const optionalId = (value, maximum = 180) => typeof value === 'string' && value.trim()
  ? value.trim().slice(0, maximum)
  : null;
const idList = (value, maximum = 256, maximumIdLength = 180) => Array.isArray(value)
  ? [...new Set(value.flatMap((entry) => {
    const id = optionalId(entry, maximumIdLength);
    return id ? [id] : [];
  }))].slice(0, maximum)
  : [];
const clamp = (value, minimum = 0, maximum = 100) => Math.max(minimum, Math.min(maximum, Number(value) || 0));
const absoluteHours = (clock = {}) => Math.max(0, (Math.max(1, Number(clock.day) || 1) - 1) * 24 + (Number(clock.hour) || 0));

export function createHubAnnexOperationsV71() {
  return {
    schema: HUB_ANNEX_OPERATIONS_SCHEMA_V71,
    lastProcessedReturnOperationId: null,
    lastCctvScanCrisisId: null,
    lastSyntheticCrewIds: [],
    mireIndex: {
      bestiaryEntries: 0,
      narrativeEvidence: 0,
      readEvidence: 0,
      reports: 0,
      playedArchiveMedia: 0,
      recordedRuns: 0,
      indexedAtHours: null
    },
    processedMorgueCaseKeys: [],
    processedMorgueEvidenceIds: [],
    provingGround: {
      nextOperationCharge: false,
      lastQualificationIdV81: null,
      qualificationReceiptIdsV81: [],
      qualificationsCompletedV81: 0,
      bestScoreV81: 0,
      powerLoaderCertified: false,
      advancedTutorialsComplete: false
    },
    escapePods: {
      evacuationCharge: false,
      destructionDrillCertified: false
    },
    durandal: {
      online: false,
      ewCharge: false
    },
    bioforge: {
      isolationVerified: false,
      containmentCycles: 0
    }
  };
}

export function sanitizeHubAnnexOperationsV71(raw) {
  const safe = createHubAnnexOperationsV71();
  if (!isRecord(raw) || Number(raw.schema) !== HUB_ANNEX_OPERATIONS_SCHEMA_V71) return safe;
  safe.lastProcessedReturnOperationId = optionalId(raw.lastProcessedReturnOperationId);
  safe.lastCctvScanCrisisId = optionalId(raw.lastCctvScanCrisisId ?? raw.lastCctvLockdownCrisisId);
  safe.lastSyntheticCrewIds = idList(raw.lastSyntheticCrewIds, SYNTHETIC_CREW_IDS_V71.length)
    .filter((id) => SYNTHETIC_CREW_ID_SET_V71.has(id));
  const mire = isRecord(raw.mireIndex) ? raw.mireIndex : {};
  safe.mireIndex = {
    bestiaryEntries: finiteInteger(mire.bestiaryEntries, 0, 0, ENEMIES.length),
    narrativeEvidence: finiteInteger(mire.narrativeEvidence, 0, 0, 9999),
    readEvidence: finiteInteger(mire.readEvidence, 0, 0, finiteInteger(mire.narrativeEvidence, 0, 0, 9999)),
    reports: finiteInteger(mire.reports, 0, 0, 9999),
    playedArchiveMedia: finiteInteger(mire.playedArchiveMedia, 0, 0, 9999),
    recordedRuns: finiteInteger(mire.recordedRuns, 0, 0, 9999),
    indexedAtHours: mire.indexedAtHours == null ? null : finiteInteger(mire.indexedAtHours, 0)
  };
  safe.processedMorgueCaseKeys = idList(raw.processedMorgueCaseKeys, MAX_MORGUE_CASES_V71, 400);
  safe.processedMorgueEvidenceIds = idList(raw.processedMorgueEvidenceIds, MAX_MORGUE_EVIDENCE_V71);
  const proving = isRecord(raw.provingGround) ? raw.provingGround : {};
  const lastQualificationIdV81 = typeof proving.lastQualificationIdV81 === 'string'
    && /^m41a-qualification-v81:session-\d+:qualification$/u.test(proving.lastQualificationIdV81)
    ? proving.lastQualificationIdV81
    : null;
  const qualificationReceiptIdsV81 = [...new Set((Array.isArray(proving.qualificationReceiptIdsV81)
    ? proving.qualificationReceiptIdsV81
    : []).filter((id) => typeof id === 'string'
      && /^m41a-qualification-v81:session-\d+:qualification$/u.test(id)))].slice(-32);
  if (lastQualificationIdV81 && !qualificationReceiptIdsV81.includes(lastQualificationIdV81)) {
    qualificationReceiptIdsV81.push(lastQualificationIdV81);
    if (qualificationReceiptIdsV81.length > 32) qualificationReceiptIdsV81.shift();
  }
  safe.provingGround = {
    // A V71 station visit could arm this flag without any exercise. V81 only
    // accepts a charge backed by a canonical completion receipt.
    nextOperationCharge: Boolean(proving.nextOperationCharge && lastQualificationIdV81),
    lastQualificationIdV81,
    qualificationReceiptIdsV81,
    qualificationsCompletedV81: finiteInteger(proving.qualificationsCompletedV81, 0, 0, 999999),
    bestScoreV81: finiteInteger(proving.bestScoreV81, 0, 0, 999999),
    // Legacy station visits awarded these flags without an exercise. No V71
    // gameplay produces a valid certificate, so migration must discard them.
    powerLoaderCertified: false,
    advancedTutorialsComplete: false
  };
  const pods = isRecord(raw.escapePods) ? raw.escapePods : {};
  safe.escapePods = {
    evacuationCharge: Boolean(pods.evacuationCharge),
    destructionDrillCertified: false
  };
  const durandal = isRecord(raw.durandal) ? raw.durandal : {};
  safe.durandal = {
    online: Boolean(durandal.online),
    ewCharge: Boolean(durandal.ewCharge)
  };
  const bioforge = isRecord(raw.bioforge) ? raw.bioforge : {};
  safe.bioforge = {
    isolationVerified: Boolean(bioforge.isolationVerified),
    containmentCycles: finiteInteger(bioforge.containmentCycles, 0, 0, 999999)
  };
  return safe;
}

function ensureHubAnnexOperationsV71(save) {
  if (!isRecord(save) || !isRecord(save.hub)) throw new Error('Sauvegarde du Tantalus invalide.');
  save.hub.annexOperationsV71 = sanitizeHubAnnexOperationsV71(save.hub.annexOperationsV71);
  return save.hub.annexOperationsV71;
}

export function applyProvingGroundQualificationV81(save, receipt) {
  const id = optionalId(receipt?.id || receipt?.idempotencyKey, 180);
  const valid = receipt?.schemaVersion === 81
    && receipt?.type === 'proving-ground-qualification'
    && receipt?.courseId === PROVING_GROUND_COURSE_ID_V81
    && receipt?.qualified === true
    && receipt?.bonus?.nextOperationCharge === true
    && typeof id === 'string'
    && /^m41a-qualification-v81:session-\d+:qualification$/u.test(id);
  if (!valid) return { applied: false, duplicate: false, reason: 'invalid-receipt' };
  const operations = ensureHubAnnexOperationsV71(save);
  if (operations.provingGround.qualificationReceiptIdsV81.includes(id)) {
    return { applied: false, duplicate: true, reason: 'already-applied' };
  }
  operations.provingGround = {
    nextOperationCharge: true,
    lastQualificationIdV81: id,
    qualificationReceiptIdsV81: [...operations.provingGround.qualificationReceiptIdsV81, id].slice(-32),
    qualificationsCompletedV81: Math.min(999999, operations.provingGround.qualificationsCompletedV81 + 1),
    bestScoreV81: Math.max(operations.provingGround.bestScoreV81, finiteInteger(receipt.score, 0, 0, 999999)),
    powerLoaderCertified: false,
    advancedTutorialsComplete: false
  };
  return {
    applied: true,
    duplicate: false,
    reason: null,
    id,
    score: operations.provingGround.bestScoreV81,
    nextOperationCharge: true
  };
}

function applyContainmentActionV71(save, action) {
  const result = applyInfestationActionV62(save, action);
  return {
    applied: Boolean(result.applied),
    action: result.action || action,
    reason: result.reason || null,
    strength: Math.max(0, Number(result.strength) || 0)
  };
}

function shortageLabelsV71(save) {
  const resources = save.galaxy?.resources || {};
  const systems = save.hub?.systems || {};
  return [
    [resources.fuel, 12, 'carburant'],
    [resources.medical, 6, 'médical'],
    [resources.alloy, 16, 'alliage'],
    [systems.supplies, 30, 'ravitaillement'],
    [systems.power, 20, 'énergie']
  ].filter(([value, threshold]) => (Number(value) || 0) < threshold).map(([, , label]) => label);
}

function synchronizeShortageAlertV71(save, shortages) {
  if (!isRecord(save.galaxy)) save.galaxy = {};
  if (!Array.isArray(save.galaxy.alerts)) save.galaxy.alerts = [];
  const id = 'alert-v71-logistics-shortage';
  save.galaxy.alerts = save.galaxy.alerts.filter((entry) => entry?.id !== id);
  if (shortages.length) {
    save.galaxy.alerts.unshift({
      id,
      worldId: null,
      type: 'hub-logistics-shortage',
      severity: 'warning',
      message: `Pénurie Tantalus détectée : ${shortages.join(', ')}.`,
      day: Math.max(1, finiteInteger(save.clock?.day, 1, 1)),
      hour: Math.max(0, Math.min(23, finiteInteger(save.clock?.hour, 0, 0, 23)))
    });
  }
  save.galaxy.alerts = save.galaxy.alerts.slice(0, 256);
}

function memorialCaseKeyV71(record, index) {
  const crewId = optionalId(record?.crewId) || `inconnu-${index}`;
  const operationId = optionalId(record?.operationId) || optionalId(record?.campaignId) || 'sans-operation';
  return `${crewId}:${operationId}:${finiteInteger(record?.day, 0)}`;
}

export function applyHubAnnexBusinessV71(save, annexId) {
  if (!HUB_ANNEX_BUSINESS_IDS_V71.includes(annexId)) throw new Error('Métier d’annexe inconnu.');
  let operations = ensureHubAnnexOperationsV71(save);
  const details = { annexId };
  let message = '';

  if (annexId === 'arrival-airlock') {
    const returnId = optionalId(save.strategy?.lastOperation?.id);
    const newReturn = Boolean(returnId && returnId !== operations.lastProcessedReturnOperationId);
    const containment = applyContainmentActionV71(save, INFESTATION_ACTIONS_V62.quarantine);
    operations = ensureHubAnnexOperationsV71(save);
    if (newReturn) operations.lastProcessedReturnOperationId = returnId;
    if (isRecord(save.player)) save.player.stress = clamp((save.player.stress || 0) - 5);
    Object.assign(details, { returnId, newReturn, containment });
    message = newReturn
      ? `SAS ARRIVÉE · retour ${returnId} enregistré · pressurisation et contrôle biologique renforcés.`
      : 'SAS ARRIVÉE · cycle étanche validé · aucun retour non traité.';
  } else if (annexId === 'logistics') {
    const shortages = shortageLabelsV71(save);
    synchronizeShortageAlertV71(save, shortages);
    details.shortages = shortages;
    message = shortages.length
      ? `LOGISTIQUE · inventaire synchronisé · pénuries : ${shortages.join(', ')}.`
      : 'LOGISTIQUE · stocks nominaux · aucun ordre module en attente.';
  } else if (annexId === 'mire-archives') {
    const discoveredIds = new Set(Object.keys(isRecord(save.narrativeArchives?.discovered) ? save.narrativeArchives.discovered : {}));
    const discovered = discoveredIds.size;
    const read = idList(save.narrativeArchives?.readIds).filter((id) => discoveredIds.has(id)).length;
    const reports = Array.isArray(save.strategy?.log) ? save.strategy.log.length : 0;
    const playedArchiveMedia = idList(save.narrativeArchives?.playedIds).filter((id) => discoveredIds.has(id)).length;
    const recordedRuns = (Array.isArray(save.alphaBravoDoctrine?.runs) ? save.alphaBravoDoctrine.runs.length : 0)
      + (Array.isArray(save.alienSurvivalSystems?.runs) ? save.alienSurvivalSystems.runs.length : 0);
    operations.mireIndex = {
      bestiaryEntries: ENEMIES.length,
      narrativeEvidence: discovered,
      readEvidence: read,
      reports,
      playedArchiveMedia,
      recordedRuns,
      indexedAtHours: finiteInteger(absoluteHours(save.clock))
    };
    if (isRecord(save.galaxy?.resources)) save.galaxy.resources.research = Math.max(0, Number(save.galaxy.resources.research) || 0) + 2;
    Object.assign(details, operations.mireIndex, { researchAward: 2 });
    message = `MIRE · ${ENEMIES.length} entrées bestiaire · ${discovered} preuves dont ${read} lues · ${reports} rapports · ${playedArchiveMedia} médias déjà consultés · ${recordedRuns} bilans de mission · +2 R&D.`;
  } else if (annexId === 'synthetic-bay') {
    const serviced = [];
    let repaired = 0;
    let reactivated = 0;
    for (const member of Array.isArray(save.crew) ? save.crew : []) {
      if (!SYNTHETIC_CREW_ID_SET_V71.has(member?.id) || !AVAILABLE_CREW_STATUSES_V71.has(member.status) || !(Number(member.health) > 0)) continue;
      serviced.push(member.id);
      const beforeHealth = clamp(member.health);
      const beforeStatus = member.status;
      member.health = clamp(beforeHealth + 25);
      member.stress = clamp((member.stress || 0) - 15);
      member.fatigue = clamp((member.fatigue || 0) - 25);
      if (['injured', 'recovering'].includes(member.status) && member.health >= 70) member.status = 'active';
      if (member.health > beforeHealth) repaired += 1;
      if (member.status === 'active' && beforeStatus !== 'active') reactivated += 1;
    }
    operations.lastSyntheticCrewIds = serviced;
    Object.assign(details, { servicedCrewIds: serviced, repaired, reactivated });
    message = `BAIE SYNTHÉTIQUE · ${serviced.length} unités diagnostiquées · ${repaired} réparées · ${reactivated} réactivées · énergie -2.`;
  } else if (annexId === 'cctv') {
    const containment = applyContainmentActionV71(save, INFESTATION_ACTIONS_V62.scan);
    operations = ensureHubAnnexOperationsV71(save);
    const crisisId = save.hub.activeCrisis?.resolved ? null : optionalId(save.hub.activeCrisis?.id);
    operations.lastCctvScanCrisisId = crisisId;
    const accessRecords = idList(save.hub.visited).length;
    Object.assign(details, { containment, crisisId, accessRecords });
    const scanResult = crisisId ? 'incident actif détecté' : containment.applied ? 'preuve capteur enregistrée' : 'aucun incident actif détecté';
    message = `CCTV · ${accessRecords} salles historisées · balayage sécurité effectué · ${scanResult}.`;
  } else if (annexId === 'proving-ground') {
    Object.assign(details, operations.provingGround, { qualificationRequiredV81: true });
    message = operations.provingGround.nextOperationCharge
      ? 'PROVING GROUND · soutien déjà armé par une qualification M41A validée.'
      : 'PROVING GROUND · console prête · terminez physiquement la qualification M41A pour armer le soutien.';
  } else if (annexId === 'morgue') {
    const knownCases = new Set(operations.processedMorgueCaseKeys);
    const knownEvidence = new Set(operations.processedMorgueEvidenceIds);
    const cases = [...new Set((Array.isArray(save.memorial) ? save.memorial : [])
      .filter(isRecord).slice(0, MAX_MORGUE_CASES_V71).map(memorialCaseKeyV71))];
    const evidence = [...new Set((Array.isArray(save.hub.infestationChain?.evidence) ? save.hub.infestationChain.evidence : [])
      .filter(isRecord).slice(0, MAX_MORGUE_EVIDENCE_V71)
      .map((entry, index) => optionalId(entry.id) || `${optionalId(save.hub.infestationChain?.id, 140) || 'chain'}:evidence-${index}`))];
    const newCases = cases.filter((key) => !knownCases.has(key));
    const newEvidence = evidence.filter((id) => !knownEvidence.has(id));
    // Keep every currently inspectable record, even if older history was full.
    const caseSet = new Set(cases);
    const evidenceSet = new Set(evidence);
    operations.processedMorgueCaseKeys = [...operations.processedMorgueCaseKeys.filter((key) => !caseSet.has(key)), ...cases].slice(-MAX_MORGUE_CASES_V71);
    operations.processedMorgueEvidenceIds = [...operations.processedMorgueEvidenceIds.filter((id) => !evidenceSet.has(id)), ...evidence].slice(-MAX_MORGUE_EVIDENCE_V71);
    const researchAward = Math.min(8, newCases.length * 2 + newEvidence.length);
    if (isRecord(save.galaxy?.resources)) save.galaxy.resources.research = Math.max(0, Number(save.galaxy.resources.research) || 0) + researchAward;
    Object.assign(details, { newCases: newCases.length, newEvidence: newEvidence.length, researchAward });
    message = `MORGUE · ${newCases.length} pertes et ${newEvidence.length} preuves analysées · +${researchAward} R&D médico-légale.`;
  } else if (annexId === 'escape-pods') {
    operations.escapePods.evacuationCharge = true;
    operations.escapePods.destructionDrillCertified = false;
    Object.assign(details, operations.escapePods);
    message = 'CAPSULES · extraction de secours préparée · protection armée pour un incident.';
  } else if (annexId === 'durandal') {
    operations.durandal.online = true;
    operations.durandal.ewCharge = true;
    Object.assign(details, operations.durandal);
    message = 'DURANDAL Ω · IA du bord synchronisée · contre-mesures EW armées pour la prochaine opération.';
  } else if (annexId === 'bioforge') {
    const containment = applyContainmentActionV71(save, INFESTATION_ACTIONS_V62.seal);
    operations = ensureHubAnnexOperationsV71(save);
    operations.bioforge.isolationVerified = true;
    operations.bioforge.containmentCycles += 1;
    Object.assign(details, { ...operations.bioforge, containment, organismsInHub: 0 });
    message = 'SAS BIOFORGE · isolation et confinement vérifiés · niveau V80 prêt · ouverture autorisée.';
  }

  return { applied: true, message, details };
}

export function getHubAnnexDeploymentSupportV71(save, vehicleId = null) {
  const operations = sanitizeHubAnnexOperationsV71(save?.hub?.annexOperationsV71);
  const provingGround = Boolean(
    operations.provingGround.nextOperationCharge
    && operations.provingGround.lastQualificationIdV81
  );
  const durandal = Boolean(operations.durandal.ewCharge);
  return {
    provingGround,
    durandal,
    riskReduction: (provingGround ? 4 : 0) + (durandal ? 6 : 0),
    powerLoaderFuelReduction: operations.provingGround.powerLoaderCertified && vehicleId === P5000_VEHICLE_ID_V71 ? 1 : 0
  };
}

export function consumeHubAnnexDeploymentSupportV71(save) {
  const operations = ensureHubAnnexOperationsV71(save);
  const receipt = getHubAnnexDeploymentSupportV71(save);
  operations.provingGround.nextOperationCharge = false;
  operations.durandal.ewCharge = false;
  return receipt;
}

export function consumeHubEscapePodMitigationV71(save) {
  const operations = ensureHubAnnexOperationsV71(save);
  if (!operations.escapePods.evacuationCharge) {
    return { applied: false, injuryDamage: 0, stress: 0, moduleDamage: 0 };
  }
  operations.escapePods.evacuationCharge = false;
  return { applied: true, injuryDamage: 14, stress: 6, moduleDamage: 4 };
}
