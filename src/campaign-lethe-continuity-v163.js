import { ARCHIVE_RELAY_CAMPAIGN_V122, ARCHIVE_RELAY_DOCUMENT_IDS_V122,
  validateArchiveRelayStateV122, normalizeArchiveRelayArchiveV122 } from './archive-relay-state-v122.js';
import { APC_CONVOY_CAMPAIGN_V121, validateApcConvoyStateV121 } from './apc-convoy-state-v121.js';
import { BLACK_COCOON_CAMPAIGN_V121, validateBlackCocoonStateV121 } from './black-cocoon-state-v121.js';
import { C12_HORDE_CAMPAIGN_V121, validateC12HordeStateV121 } from './c12-horde-state-v121.js';
import { normalizeConvoyReturnHistoryV162 } from './campaign-convoy-history-v162.js';
import { validateApcCourseV131 } from './apc-course-v131.js';
import { restoreMissionInsertionV62 } from './mission-insertion-v62.js';
import { LETHE_STORY_PROTOCOLS_V163, letheStoryProtocolV163 } from './campaign-lethe-story-v163.js';

export const LETHE_CONTINUITY_SCHEMA_V163 = 163;
export const LETHE_CAMPAIGN_CHAPTERS_V163 = Object.freeze([
  Object.freeze({ id: 'relay', title: 'Établir les faits', campaign: ARCHIVE_RELAY_CAMPAIGN_V122,
    objective: 'Rassembler les six pièces de QZ-18 et rentrer avec une conclusion étayée.' }),
  Object.freeze({ id: 'convoy', title: 'Ouvrir le corridor', campaign: APC_CONVOY_CAMPAIGN_V121,
    objective: 'Ramener le M577 au périmètre après les deux barrages lourds et le barrage final.' }),
  Object.freeze({ id: 'c12', title: 'Garder une voie de repli', campaign: C12_HORDE_CAMPAIGN_V121,
    objective: 'Rétablir l’ascenseur C-12 et confirmer le repli au sas.' }),
  Object.freeze({ id: 'cocoon', title: 'Contrôler le retour', campaign: BLACK_COCOON_CAMPAIGN_V121,
    objective: 'S’extraire de la ruche et achever le contrôle biologique du Tantalus.' })
]);
const chapters = new Map(LETHE_CAMPAIGN_CHAPTERS_V163.map(c => [c.id, c]));
const byCampaign = new Map(LETHE_CAMPAIGN_CHAPTERS_V163.map(c => [c.campaign.id, c]));
const TOPICS = Object.freeze(['objective', 'conduct', 'return']);
const record = v => Boolean(v && typeof v === 'object' && !Array.isArray(v));
const finite = v => typeof v === 'number' && Number.isFinite(v);
const integer = (v, max) => Number.isSafeInteger(v) && v >= 0 && v <= max;
const range = (v, max) => finite(v) && v >= 0 && v <= max;
const clone = v => structuredClone(v);
const resolvedSerial = save => integer(save?.strategy?.specialOperationResolutionSerialV121, 999999999)
  ? save.strategy.specialOperationResolutionSerialV121 : 0;
const serialFor = (id, campaignId) => typeof id === 'string' && typeof campaignId === 'string'
  && id.endsWith('-' + campaignId) ? Number(/^operation-([1-9][0-9]{0,8})-/.exec(id)?.[1] || 0) : 0;
const reason = v => typeof v === 'string' && /^[a-z0-9-]{1,60}$/.test(v);
const readings = value => {
  const readTopics = Array.isArray(value?.readTopics) ? TOPICS.filter(t => value.readTopics.slice(0, 16).includes(t)) : [];
  return { readTopics, activeTopic: readTopics.includes(value?.activeTopic) ? value.activeTopic : null };
};
const returnFacts = value => { const { readTopics, activeTopic, ...facts } = value; return facts; };

export function createLetheContinuityV163() {
  return { schema: 163, chapters: Object.fromEntries(LETHE_CAMPAIGN_CHAPTERS_V163
    .map(c => [c.id, { firstSuccess: null, latestReturn: null }])) };
}

function normalizedFacts(chapterId, raw, success) {
  if (!record(raw) || raw.returnConfirmed !== success) return null;
  if (chapterId === 'relay') {
    if (!integer(raw.documents, 6) || ![null, 'delayed-distress'].includes(raw.verdict)
      || raw.verdict && raw.documents !== 6 || success && (raw.documents !== 6 || raw.verdict !== 'delayed-distress')) return null;
    return { returnConfirmed: success, documents: raw.documents, verdict: raw.verdict };
  }
  if (chapterId === 'convoy') {
    if (!range(raw.distance, 3200) || !integer(raw.crushersCleared, 2) || typeof raw.queenDefeated !== 'boolean'
      || !range(raw.hull, 340) || raw.crushersCleared > 0 && raw.distance < 800
      || raw.crushersCleared > 1 && raw.distance < 1900
      || raw.queenDefeated && (raw.distance !== 3200 || raw.crushersCleared !== 2)
      || success && (raw.distance !== 3200 || raw.crushersCleared !== 2 || !raw.queenDefeated || raw.hull <= 0)) return null;
    return { returnConfirmed: success, distance: raw.distance, crushersCleared: raw.crushersCleared,
      queenDefeated: raw.queenDefeated, hull: raw.hull };
  }
  if (chapterId === 'c12') {
    if (!range(raw.defenceSeconds, 45) || !integer(raw.emitted, 72) || typeof raw.liftReady !== 'boolean'
      || typeof raw.evacuated !== 'boolean' || typeof raw.cargoRecovered !== 'boolean'
      || raw.liftReady !== (raw.defenceSeconds === 45) || raw.evacuated !== success
      || raw.emitted > 24 && raw.defenceSeconds < 15 || raw.emitted > 48 && raw.defenceSeconds < 30
      || success && !raw.liftReady) return null;
    return { returnConfirmed: success, defenceSeconds: raw.defenceSeconds, emitted: raw.emitted,
      liftReady: raw.liftReady, evacuated: raw.evacuated, cargoRecovered: raw.cargoRecovered };
  }
  if (!['freed', 'equipmentRecovered', 'boarded', 'quarantineComplete'].every(k => typeof raw[k] === 'boolean')
    || ![null, 'industrial', 'cooling'].includes(raw.route) || ![null, true, false].includes(raw.quietPower)
    || !integer(raw.beacons, 2) || !range(raw.extractionSeconds, 90)
    || raw.equipmentRecovered && !raw.freed || raw.route && !raw.equipmentRecovered
    || raw.beacons > 0 && !raw.route || raw.extractionSeconds > 0 && raw.beacons !== 2
    || raw.boarded && (raw.extractionSeconds !== 90 || raw.beacons !== 2)
    || raw.quarantineComplete !== success || success && !raw.boarded) return null;
  return { returnConfirmed: success, freed: raw.freed, equipmentRecovered: raw.equipmentRecovered,
    route: raw.route, quietPower: raw.quietPower, beacons: raw.beacons,
    extractionSeconds: raw.extractionSeconds, boarded: raw.boarded, quarantineComplete: raw.quarantineComplete };
}

function normalizeReturn(raw, chapter, maximumSerial) {
  const campaign = chapter.campaign, serial = serialFor(raw?.operationId, campaign.id), receipt = raw?.receipt;
  if (!record(raw) || raw.schema !== 163 || !serial || raw.serial !== serial || serial > maximumSerial
    || raw.operationId !== `operation-${serial}-${campaign.id}` || raw.chapterId !== chapter.id
    || raw.campaignId !== campaign.id || raw.worldId !== campaign.worldId || typeof raw.success !== 'boolean'
    || !reason(raw.reason) || !record(receipt) || receipt.kind !== 'native-lethe-resolution-v163'
    || receipt.operationId !== raw.operationId || receipt.serial !== serial || receipt.success !== raw.success
    || receipt.campaignId !== campaign.id || receipt.worldId !== campaign.worldId) return null;
  const summary = normalizedFacts(chapter.id, raw.summary, raw.success);
  const protocols = LETHE_STORY_PROTOCOLS_V163[campaign.id] || [];
  if (!summary || !(raw.protocolId === null || protocols.some(p => p.id === raw.protocolId))) return null;
  return { schema: 163, chapterId: chapter.id, operationId: raw.operationId, serial,
    campaignId: campaign.id, worldId: campaign.worldId, success: raw.success, reason: raw.reason,
    protocolId: raw.protocolId, summary, ...readings(raw), receipt: {
      kind: receipt.kind, operationId: raw.operationId, serial, campaignId: campaign.id,
      worldId: campaign.worldId, success: raw.success } };
}

/** Four bounded chapters retain the first confirmed success and last observed
 * return. completedCampaignIds, UI clicks and bare success flags are not inputs. */
export function normalizeLetheContinuityV163(value, { resolvedSerial: maximumSerial = 0 } = {}) {
  const out = createLetheContinuityV163();
  if (value?.schema !== 163 || !record(value.chapters) || !integer(maximumSerial, 999999999)) return out;
  for (const chapter of LETHE_CAMPAIGN_CHAPTERS_V163) {
    const raw = Object.hasOwn(value.chapters, chapter.id) && value.chapters[chapter.id];
    const first = normalizeReturn(raw?.firstSuccess, chapter, maximumSerial);
    let latest = normalizeReturn(raw?.latestReturn, chapter, maximumSerial);
    // One resolved deployment cannot be both a confirmed success and another
    // return. Reject conflicting imported facts, retaining the first confirmed
    // record rather than fabricating a second sortie with that same identity.
    if (first?.success && latest?.operationId === first.operationId
      && JSON.stringify(returnFacts(first)) !== JSON.stringify(returnFacts(latest))) latest = null;
    out.chapters[chapter.id] = {
      firstSuccess: first?.success ? first : latest?.success ? clone(latest) : null,
      latestReturn: latest && (!first || latest.serial >= first.serial) ? latest : first?.success ? clone(first) : null
    };
  }
  return out;
}

function compact(chapter, operationId, success, resultReason, summary, protocolId = null) {
  const campaign = chapter.campaign, serial = serialFor(operationId, campaign.id);
  return { schema: 163, chapterId: chapter.id, operationId, serial, campaignId: campaign.id,
    worldId: campaign.worldId, success, reason: resultReason, protocolId, summary, readTopics: [], activeTopic: null,
    receipt: { kind: 'native-lethe-resolution-v163', operationId, serial, campaignId: campaign.id, worldId: campaign.worldId, success } };
}

const definitions = new Map([
  ['relay', { key: 'archiveRelayV122', validate: validateArchiveRelayStateV122, credits: 500, kills: 0 }],
  ['convoy', { key: 'apcConvoyV121', validate: validateApcConvoyStateV121, credits: 850, kills: 64 }],
  ['c12', { key: 'c12HordeV121', validate: validateC12HordeStateV121, credits: 650, kills: 72 }],
  ['cocoon', { key: 'blackCocoonV121', validate: validateBlackCocoonStateV121, credits: 550, kills: 32 }]
]);

function nativeReturn(save) {
  const operation = save?.strategy?.lastOperation, chapter = byCampaign.get(operation?.campaignId);
  if (!chapter || !record(operation) || operation.worldId !== chapter.campaign.worldId
    || operation.specialOperationId !== chapter.campaign.specialOperationId || typeof operation.success !== 'boolean'
    || !reason(operation.reason) || save.strategy.currentOperation?.id === operation.id) return null;
  const serial = serialFor(operation.id, chapter.campaign.id), maximumSerial = resolvedSerial(save);
  if (!serial || serial > maximumSerial || operation.id !== `operation-${serial}-${chapter.campaign.id}`) return null;
  const def = definitions.get(chapter.id), raw = operation.resumeState, special = raw?.specialOperation;
  const checked = def.validate(special?.[def.key]);
  if (!checked.valid || raw?.schema !== 1 || raw.identity?.campaignId !== operation.campaignId
    || raw.identity.worldId !== operation.worldId || special.operationId !== chapter.campaign.specialOperationId
    || special.deploymentOperationIdV121 !== operation.id
    || operation.levelSeedId && raw.identity.levelSeedId !== operation.levelSeedId
    || operation.missionLevelSignature && raw.missionLevel?.signature !== operation.missionLevelSignature
    || !['active', 'failed', 'complete'].includes(raw.mission?.state)) return null;
  const state = checked.state, mission = raw.mission, player = raw.player;
  if (chapter.id === 'convoy' && (raw.vehicle?.id !== 'vehicle-001-m577-armored-personnel-carrier'
    || !range(raw.vehicle.hull, 340)
    || raw.apcCourseV131 && !validateApcCourseV131(raw.apcCourseV131, state, raw.enemies).valid)) return null;
  if (operation.success) {
    if (mission.state !== 'complete' || !state.complete || !state.rewardClaimed || !record(state.rewards)
      || player?.alive !== true || player.downed !== false
      || !integer(player.kills, chapter.id === 'convoy' && raw.apcCourseV131 ? 1e7 : def.kills)
      || !integer(mission.retries, 9999) || !integer(mission.casualties, 9999) || !range(mission.elapsed, 604800)
      || !integer(raw.inventory?.salvage, 999999) || !integer(raw.inventory?.intel, 999999)) return null;
    let credits = def.credits;
    if (chapter.id === 'cocoon') credits += player.kills * 12 + (state.power === 'battery' ? 80 : 0);
    if (chapter.id === 'c12') credits += state.cargoTaken ? 100 : 0;
    if (chapter.id === 'relay' && (raw.inventory.salvage !== 0 || raw.inventory.intel !== 12
      || special.archiveRelayExitProgressV122 !== 2 || state.verdict !== 'delayed-distress')) return null;
    if (chapter.id === 'convoy') {
      if (raw.vehicle?.id !== 'vehicle-001-m577-armored-personnel-carrier' || raw.vehicle.active !== true
        || raw.vehicle.destroyed !== false || !range(raw.vehicle.hull, 340) || raw.vehicle.hull <= 0
        || state.rewards.hullRemaining !== Math.round(raw.vehicle.hull)) return null;
      if (raw.apcCourseV131 && (!validateApcCourseV131(raw.apcCourseV131, state, raw.enemies).valid
        || raw.apcCourseV131.kills !== player.kills)) return null;
      credits = Math.min(10000, credits + player.kills * 10 + Math.floor(raw.vehicle.hull / 340 * 250));
    }
    const expected = { ...state.rewards, credits, salvage: raw.inventory.salvage, intel: raw.inventory.intel,
      retries: mission.retries, elapsedSeconds: Math.round(mission.elapsed), noCasualty: mission.casualties === 0 };
    if (!record(operation.missionRewardsV121) || Object.entries(expected).some(([key, value]) =>
      state.rewards[key] !== value || special[def.key].rewards?.[key] !== value || operation.missionRewardsV121[key] !== value)) return null;
  } else if (state.complete || state.rewardClaimed || mission.state === 'complete') return null;
  let protocolId = null;
  if (operation.insertionState) {
    let insertion;
    try { insertion = restoreMissionInsertionV62(operation.insertionState); } catch { return null; }
    if (insertion.operationId !== operation.id || insertion.campaignId !== operation.campaignId
      || insertion.worldId !== operation.worldId || operation.success && (insertion.status !== 'completed' || !insertion.controlGranted)) return null;
    protocolId = letheStoryProtocolV163(insertion)?.id || null;
  }
  let summary;
  if (chapter.id === 'relay') summary = { returnConfirmed: operation.success, documents: state.readIds.length, verdict: state.verdict };
  if (chapter.id === 'convoy') summary = { returnConfirmed: operation.success, distance: state.distance,
    crushersCleared: state.crushersDefeated.filter(Boolean).length, queenDefeated: state.queenDefeated, hull: raw.vehicle?.hull };
  if (chapter.id === 'c12') summary = { returnConfirmed: operation.success, defenceSeconds: state.defenceElapsed,
    emitted: state.emitted, liftReady: state.defenceElapsed === 45, evacuated: operation.success, cargoRecovered: state.cargoTaken };
  if (chapter.id === 'cocoon') summary = { returnConfirmed: operation.success, freed: state.freed,
    equipmentRecovered: state.equipmentRecovered, route: state.route, quietPower: state.power === null ? null : state.power === 'battery',
    beacons: state.beacons.filter(Boolean).length, extractionSeconds: state.extractionElapsed,
    boarded: state.boarded, quarantineComplete: state.complete };
  return normalizeReturn(compact(chapter, operation.id, operation.success, operation.reason, summary, protocolId), chapter, maximumSerial);
}

function historicalReturns(save) {
  const max = resolvedSerial(save), out = [];
  const archive = normalizeArchiveRelayArchiveV122(save?.archiveRelayArchivesV122), dossier = archive.case;
  if (dossier && dossier.verdict === 'delayed-distress' && dossier.documentIds.length === ARCHIVE_RELAY_DOCUMENT_IDS_V122.length
    && ARCHIVE_RELAY_DOCUMENT_IDS_V122.every(id => dossier.documentIds.includes(id))) {
    const chapter = chapters.get('relay'), entry = compact(chapter, dossier.operationId, true, 'objective',
      { returnConfirmed: true, documents: 6, verdict: 'delayed-distress' });
    const checked = normalizeReturn(entry, chapter, max); if (checked) out.push(checked);
  }
  for (const source of normalizeConvoyReturnHistoryV162(save?.convoyReturnHistoryV162, { resolvedSerial: max }).entries) {
    const chapter = chapters.get('convoy'), entry = compact(chapter, source.operationId, source.success, source.reason,
      { ...source.summary, hull: source.summary.hull });
    const checked = normalizeReturn(entry, chapter, max); if (checked) out.push(checked);
  }
  return out;
}

function mergedReading(previous, next) {
  return { ...next, readTopics: TOPICS.filter(t => previous?.readTopics.includes(t) || next.readTopics.includes(t)),
    activeTopic: next.activeTopic || previous?.activeTopic || null };
}

/** Called in the native resolution transaction and before another operation
 * replaces lastOperation. Only this notebook changes; no mission/economic API
 * is called and a failure never removes an earlier confirmed chapter. */
export function preserveLetheContinuityV163(save) {
  const max = resolvedSerial(save), current = normalizeLetheContinuityV163(save?.letheContinuityV163, { resolvedSerial: max });
  const candidates = [...historicalReturns(save), nativeReturn(save)].filter(Boolean).sort((a, b) => a.serial - b.serial);
  if (!candidates.length) return { changed: false, reason: 'native-return-unavailable' };
  for (const entry of candidates) {
    const target = current.chapters[entry.chapterId];
    const known = [target.firstSuccess, target.latestReturn].find(r => r?.operationId === entry.operationId);
    if (known && JSON.stringify(returnFacts(known)) !== JSON.stringify(returnFacts(entry))) continue;
    if (!target.latestReturn || entry.serial > target.latestReturn.serial) target.latestReturn = clone(entry);
    else if (entry.operationId === target.latestReturn.operationId) target.latestReturn = mergedReading(target.latestReturn, entry);
    if (entry.success && (!target.firstSuccess || entry.serial < target.firstSuccess.serial)) target.firstSuccess = clone(entry);
  }
  const next = normalizeLetheContinuityV163(current, { resolvedSerial: max });
  if (JSON.stringify(next) === JSON.stringify(save.letheContinuityV163)) return { changed: false, reason: 'already-preserved' };
  save.letheContinuityV163 = next;
  return { changed: true, confirmedChapters: Object.values(next.chapters).filter(c => c.firstSuccess).length };
}

function questions(chapter, entry) {
  const f = entry.summary, confirmed = entry.success;
  let objective, conduct, returned;
  if (chapter.id === 'relay') {
    objective = `${f.documents}/6 pièces relues. ${f.verdict ? 'La priorité de fret a retardé la détresse ; l’auteur de la commande reste non identifié.' : 'Aucune conclusion complète n’est confirmée.'}`;
    conduct = 'Les horaires, le droit d’accès et l’identité d’une personne restent trois questions distinctes. Un badge seul ne prouve pas qui l’a utilisé.';
    returned = confirmed ? 'Le dossier complet est revenu au bord. Il peut guider les décisions suivantes sans transformer une hypothèse en accusation.'
      : 'Le retour complet n’est pas confirmé. Les documents partiels restent des indices pour la prochaine enquête.';
  } else if (chapter.id === 'convoy') {
    objective = `Parcours reçu : ${Math.round(f.distance / 3200 * 100)} %. Barrages lourds : ${f.crushersCleared}/2. Barrage final : ${f.queenDefeated ? 'neutralisé' : 'non confirmé'}.`;
    conduct = `Dernier blindage reçu : ${Math.ceil(f.hull)}/340. Le passage du corridor est établi par la distance et les barrages, pas par une annonce radio isolée.`;
    returned = confirmed ? 'Le M577 a franchi le sas. Sa récupération reste acquise dans ce dossier même si une sortie suivante se termine par un repli.'
      : 'Le retour du M577 n’est pas confirmé pour cette sortie. Les points de barrage restants devront être réévalués avant un nouveau départ.';
  } else if (chapter.id === 'c12') {
    objective = `${Math.floor(f.defenceSeconds)}/45 secondes de rétablissement reçues. Ascenseur : ${f.liftReady ? 'disponible' : 'non confirmé disponible'}. Sas : ${f.evacuated ? 'franchi et refermé' : 'repli non confirmé'}.`;
    conduct = `${f.emitted} contacts ont été émis pendant cet événement. ${f.cargoRecovered ? 'La caisse facultative a été récupérée.' : 'La caisse facultative n’a pas été récupérée.'} Ce relevé ne signifie pas que tous les contacts ont été éliminés.`;
    returned = confirmed ? 'La voie de repli a rempli sa fonction. Rester pour nettoyer la zone aurait prolongé le risque sans améliorer la confirmation du sas.'
      : 'La remise en service et le franchissement du sas doivent tous deux être confirmés. Le bilan reste partiel, même si l’ascenseur avait commencé à répondre.';
  } else {
    objective = f.freed ? `${f.equipmentRecovered ? 'Matériel récupéré.' : 'Matériel non confirmé récupéré.'} Sortie : ${f.route === 'industrial' ? 'échelle industrielle' : f.route === 'cooling' ? 'circuit de refroidissement' : 'non confirmée'}.`
      : 'La libération de l’opérateur n’est pas confirmée dans cette sortie.';
    conduct = `Alimentation : ${f.quietPower === true ? 'batterie' : f.quietPower === false ? 'générateur' : 'non rétablie'}. Balises : ${f.beacons}/2. Approche reçue : ${Math.floor(f.extractionSeconds)}/90 secondes. ${f.boarded ? 'Embarquement confirmé.' : 'Embarquement non confirmé.'}`;
    returned = confirmed ? 'Les armes ont été déposées et le contrôle biologique a été achevé. Le dossier distingue cette confirmation de l’embarquement ; il ne prononce pas de conclusion biologique au-delà du contrôle effectué.'
      : 'Le contrôle biologique complet n’est pas confirmé. Une liaison, une balise ou un embarquement partiel ne suffit pas pour clore le retour.';
  }
  return [
    { id: 'objective', label: 'Ce qui est établi', speaker: 'MU/TH/UR', answer: objective },
    { id: 'conduct', label: 'Le déroulement', speaker: 'Rook · liaison reconnaissance', answer: conduct },
    { id: 'return', label: 'La suite à bord', speaker: chapter.id === 'cocoon' ? 'Inez Harlow · liaison science' : 'Echo-9', answer: returned }
  ];
}

/** Detached reader model. The advised order does not lock other operations or
 * grant a completion, research, money, a resource or a second result. */
export function letheContinuityModelV163(save) {
  const notebook = normalizeLetheContinuityV163(save?.letheContinuityV163, { resolvedSerial: resolvedSerial(save) });
  const active = save?.strategy?.currentOperation;
  const rows = LETHE_CAMPAIGN_CHAPTERS_V163.map(chapter => {
    const data = notebook.chapters[chapter.id], entry = data.latestReturn, complete = Boolean(data.firstSuccess);
    const available = Array.isArray(save?.galaxy?.unlockedWorldIds) && save.galaxy.unlockedWorldIds.includes(chapter.campaign.worldId);
    const selectedTopic = entry?.activeTopic || (entry?.protocolId === 'pressure-review' || entry?.protocolId === 'route-review' ? 'conduct'
      : entry?.protocolId === 'lift-review' ? 'objective' : 'return');
    return { id: chapter.id, title: chapter.title, campaignId: chapter.campaign.id, campaignName: chapter.campaign.name,
      objective: chapter.objective, complete, firstSuccessOperationId: data.firstSuccess?.operationId || null,
      available, active: active?.campaignId === chapter.campaign.id, canPlan: !active && available,
      latestReturn: entry ? { ...clone(entry), selectedTopic, questions: questions(chapter, entry),
        canReview: !active, readingComplete: entry.readTopics.length === TOPICS.length } : null };
  });
  const next = rows.find(row => !row.complete), completed = rows.filter(row => row.complete).length;
  return { id: 'lethe-continuity-v163', title: 'Dossier de Lethe', provenance: 'tantalus-project-original', canonExact: false,
    completed, total: rows.length, complete: completed === rows.length, chapters: rows,
    recommendedCampaignId: active?.campaignId || next?.campaignId || null,
    recommendation: active ? 'Une opération est en cours. Reprenez-la depuis le plan de mission.'
      : next ? `Prochaine étape conseillée : ${next.campaignName}. Les autres opérations restent accessibles.`
        : 'Les quatre retours sont confirmés. Leurs comptes rendus restent consultables et les opérations peuvent être rejouées.' };
}

/** An explicit reading transaction only. Native resolution owns all payment;
 * an archive question cannot create or complete a chapter. */
export function recordLetheContinuityReviewV163(save, chapterId, operationId, topicId) {
  if (save?.strategy?.currentOperation || !chapters.has(chapterId) || !TOPICS.includes(topicId))
    return { ok: false, changed: false, reason: 'review-unavailable' };
  const notebook = normalizeLetheContinuityV163(save.letheContinuityV163, { resolvedSerial: resolvedSerial(save) });
  const entry = notebook.chapters[chapterId].latestReturn;
  if (!entry || entry.operationId !== operationId) return { ok: false, changed: false, reason: 'review-unavailable' };
  if (entry.readTopics.includes(topicId) && entry.activeTopic === topicId) return { ok: true, changed: false };
  entry.readTopics = TOPICS.filter(t => entry.readTopics.includes(t) || t === topicId); entry.activeTopic = topicId;
  save.letheContinuityV163 = notebook;
  return { ok: true, changed: true, chapterId, operationId, topicId };
}
