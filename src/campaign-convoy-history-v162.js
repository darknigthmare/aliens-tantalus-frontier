import { APC_CONVOY_CAMPAIGN_V121, validateApcConvoyStateV121 } from './apc-convoy-state-v121.js';
import { validateApcCourseV131 } from './apc-course-v131.js';
import { restoreMissionInsertionV62 } from './mission-insertion-v62.js';
import { convoyStoryProtocolV161 } from './campaign-convoy-story-v161.js';
import { validatePlayerIdentityV84 } from './player-onboarding-v84.js';

export const CONVOY_RETURN_HISTORY_SCHEMA_V162 = 162;
export const CONVOY_RETURN_HISTORY_LIMIT_V162 = 8;
const CAMPAIGN = APC_CONVOY_CAMPAIGN_V121;
const TOPICS = Object.freeze(['vehicle', 'route', 'return']);
const PROTOCOLS = new Set(['hull-review', 'route-review']);
const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const finite = value => typeof value === 'number' && Number.isFinite(value);
const integer = (value, maximum) => Number.isSafeInteger(value) && value >= 0 && value <= maximum;
const operationSerial = value => typeof value === 'string'
  ? Number(/^operation-([1-9][0-9]{0,8})-special-apc-convoy$/.exec(value)?.[1] || 0) : 0;
const reason = value => typeof value === 'string' && /^[a-z0-9-]{1,60}$/.test(value) ? value : null;
const reading = raw => {
  const readTopics = Array.isArray(raw?.readTopics) ? TOPICS.filter(topic => raw.readTopics.slice(0, 16).includes(topic)) : [];
  return { readTopics, activeTopic: readTopics.includes(raw?.activeTopic) ? raw.activeTopic : null };
};

export const createConvoyReturnHistoryV162 = () => ({ schema: CONVOY_RETURN_HISTORY_SCHEMA_V162, entries: [] });

function normalizeEntry(raw, resolvedSerial) {
  const serial = operationSerial(raw?.operationId);
  const summary = raw?.summary, receipt = raw?.receipt;
  if (!record(raw) || raw.schema !== 162 || !serial || raw.serial !== serial || serial > resolvedSerial
    || raw.campaignId !== CAMPAIGN.id || raw.worldId !== CAMPAIGN.worldId || typeof raw.success !== 'boolean'
    || !reason(raw.reason) || !record(summary) || typeof summary.returnConfirmed !== 'boolean'
    || !finite(summary.distance) || summary.distance < 0 || summary.distance > 3200
    || !integer(summary.crushersCleared, 2) || typeof summary.queenDefeated !== 'boolean'
    || !(summary.hull === null || finite(summary.hull) && summary.hull >= 0 && summary.hull <= 340)
    || !record(receipt) || receipt.kind !== 'native-apc-resolution-v162'
    || receipt.operationId !== raw.operationId || receipt.serial !== serial || receipt.success !== raw.success
    || receipt.worldId !== CAMPAIGN.worldId || receipt.campaignId !== CAMPAIGN.id) return null;
  if (raw.success !== summary.returnConfirmed
    || summary.crushersCleared > 0 && summary.distance < 800
    || summary.crushersCleared > 1 && summary.distance < 1900
    || summary.queenDefeated && (summary.distance !== 3200 || summary.crushersCleared !== 2)
    || raw.success && (summary.distance !== 3200 || summary.crushersCleared !== 2
      || !summary.queenDefeated || summary.hull === null || summary.hull <= 0)) return null;
  const identity = record(raw.operator) && validatePlayerIdentityV84(raw.operator);
  const operator = identity?.ok && raw.operator.id === identity.identity.id && raw.operator.name === identity.identity.name
    && raw.operator.callsign === identity.identity.callsign
    ? { id: identity.identity.id, name: identity.identity.name, callsign: identity.identity.callsign } : null;
  // A present but invalid identity must not silently become a legacy identity.
  if (raw.operator !== null && !operator) return null;
  if (!(raw.protocolId === null || PROTOCOLS.has(raw.protocolId))) return null;
  return { schema: 162, operationId: raw.operationId, serial, campaignId: CAMPAIGN.id, worldId: CAMPAIGN.worldId,
    success: raw.success, reason: raw.reason, operator, protocolId: raw.protocolId,
    summary: { returnConfirmed: summary.returnConfirmed, distance: summary.distance,
      crushersCleared: summary.crushersCleared, queenDefeated: summary.queenDefeated, hull: summary.hull },
    ...reading(raw), receipt: { kind: receipt.kind, operationId: raw.operationId, serial,
      campaignId: CAMPAIGN.id, worldId: CAMPAIGN.worldId, success: raw.success } };
}

/** Bounded profile data, not a payment authority. A bare success object is not
 * an archive receipt. Unknown fields, actors and prototype keys are not copied. */
export function normalizeConvoyReturnHistoryV162(value, { resolvedSerial = 0 } = {}) {
  const result = createConvoyReturnHistoryV162();
  if (!integer(resolvedSerial, 999999999) || value?.schema !== 162 || !Array.isArray(value.entries)) return result;
  const entries = new Map();
  for (const raw of value.entries.slice(0, 32)) {
    const entry = normalizeEntry(raw, resolvedSerial);
    if (entry && !entries.has(entry.operationId)) entries.set(entry.operationId, entry);
  }
  result.entries = [...entries.values()].sort((a, b) => b.serial - a.serial).slice(0, CONVOY_RETURN_HISTORY_LIMIT_V162);
  return result;
}

function insertionLedger(operation) {
  if (!operation.insertionState) return { protocolId: null, readTopics: [], activeTopic: null };
  let insertion;
  try { insertion = restoreMissionInsertionV62(operation.insertionState); } catch { return null; }
  if (insertion.operationId !== operation.id || insertion.campaignId !== CAMPAIGN.id || insertion.worldId !== CAMPAIGN.worldId
    || operation.success && (insertion.status !== 'completed' || !insertion.controlGranted)) return null;
  const raw = insertion.phases.find(phase => phase.kind === 'preparation')?.payload?.convoyReturnV161;
  if (raw != null && (raw.schema !== 161 || raw.operationId !== operation.id)) return null;
  return { protocolId: convoyStoryProtocolV161(insertion)?.id || null, ...reading(raw) };
}

function resultFromNativeOperation(save) {
  const operation = save?.strategy?.lastOperation, serial = operationSerial(operation?.id);
  const resolvedSerial = save?.strategy?.specialOperationResolutionSerialV121;
  if (!record(operation) || !serial || !integer(resolvedSerial, 999999999) || serial > resolvedSerial
    || save.strategy.currentOperation?.id === operation.id || operation.campaignId !== CAMPAIGN.id
    || operation.worldId !== CAMPAIGN.worldId || operation.specialOperationId !== CAMPAIGN.specialOperationId
    || typeof operation.success !== 'boolean' || !reason(operation.reason)) return null;
  const raw = operation.resumeState, special = raw?.specialOperation, source = special?.apcConvoyV121;
  const checked = validateApcConvoyStateV121(source);
  if (!checked.valid || raw?.schema !== 1 || raw.identity?.campaignId !== operation.campaignId
    || raw.identity.worldId !== operation.worldId || special.operationId !== CAMPAIGN.specialOperationId
    || special.deploymentOperationIdV121 !== operation.id
    || operation.levelSeedId && raw.identity.levelSeedId !== operation.levelSeedId
    || operation.missionLevelSignature && raw.missionLevel?.signature !== operation.missionLevelSignature
    || !finite(source.distance) || source.distance !== checked.state.distance
    || !['active', 'failed', 'complete'].includes(raw.mission?.state)
    || raw.vehicle?.id !== 'vehicle-001-m577-armored-personnel-carrier'
    || !finite(raw.vehicle.hull) || raw.vehicle.hull < 0 || raw.vehicle.hull > 340) return null;
  const state = checked.state, player = raw.player, mission = raw.mission;
  if (raw.apcCourseV131 && !validateApcCourseV131(raw.apcCourseV131, state, raw.enemies).valid) return null;
  if (operation.success) {
    if (raw.mission.state !== 'complete' || !state.complete || !state.rewardClaimed || !state.rewards
      || raw.vehicle.destroyed !== false || raw.vehicle.hull <= 0 || raw.vehicle.active !== true
      || player?.alive !== true || player.downed !== false || !integer(player.kills, raw.apcCourseV131 ? 1e7 : 64)
      || !integer(mission.retries, 9999) || !integer(mission.casualties, 9999)
      || !finite(mission.elapsed) || mission.elapsed < 0 || mission.elapsed > 604800
      || !integer(raw.inventory?.salvage, 999999) || !integer(raw.inventory?.intel, 999999)) return null;
    const expected = { credits: Math.min(10000, 850 + player.kills * 10 + Math.floor(raw.vehicle.hull / 340 * 250)),
      salvage: raw.inventory.salvage, intel: raw.inventory.intel, retries: mission.retries,
      elapsedSeconds: Math.round(mission.elapsed), noCasualty: mission.casualties === 0,
      vehicleRecovered: true, hullRemaining: Math.round(raw.vehicle.hull), operationId: CAMPAIGN.specialOperationId };
    // Native strategic resolution owns this frozen receipt. Neither an event
    // success flag nor a briefed checkpoint may fabricate a returned vehicle.
    if (!record(operation.missionRewardsV121) || Object.entries(expected).some(([key, value]) =>
      state.rewards[key] !== value || source.rewards?.[key] !== value || operation.missionRewardsV121[key] !== value)) return null;
  } else if (state.complete || state.rewardClaimed || raw.mission.state === 'complete') return null;
  const ledger = insertionLedger(operation);
  if (!ledger) return null;
  let operator = null;
  if (operation.playerIdentityV84 != null) {
    const identity = validatePlayerIdentityV84(operation.playerIdentityV84);
    if (!identity.ok || operation.playerIdentityV84.id !== identity.identity.id
      || operation.playerIdentityV84.schema !== identity.identity.schema
      || operation.playerIdentityV84.canonStatus !== identity.identity.canonStatus) return null;
    operator = { id: identity.identity.id, name: identity.identity.name, callsign: identity.identity.callsign };
  }
  return normalizeEntry({ schema: 162, operationId: operation.id, serial, campaignId: CAMPAIGN.id, worldId: CAMPAIGN.worldId,
    success: operation.success, reason: operation.reason, operator, ...ledger,
    summary: { returnConfirmed: operation.success, distance: state.distance,
      crushersCleared: state.crushersDefeated.filter(Boolean).length, queenDefeated: state.queenDefeated,
      hull: raw.vehicle.hull },
    receipt: { kind: 'native-apc-resolution-v162', operationId: operation.id, serial,
      campaignId: CAMPAIGN.id, worldId: CAMPAIGN.worldId, success: operation.success } }, resolvedSerial);
}

/** Run after native resolution and after a genuine V161 reading, or before a
 * later operation replaces lastOperation. Only this compact notebook changes. */
export function preserveConvoyReturnHistoryV162(save) {
  const entry = resultFromNativeOperation(save);
  if (!entry) return { changed: false, reason: 'native-return-unavailable' };
  const current = normalizeConvoyReturnHistoryV162(save.convoyReturnHistoryV162,
    { resolvedSerial: save.strategy.specialOperationResolutionSerialV121 });
  const previous = current.entries.find(item => item.operationId === entry.operationId);
  if (previous) {
    const facts = value => { const { readTopics, activeTopic, ...rest } = value; return rest; };
    if (JSON.stringify(facts(previous)) !== JSON.stringify(facts(entry))) return { changed: false, reason: 'archive-facts-conflict' };
    entry.readTopics = TOPICS.filter(topic => previous.readTopics.includes(topic) || entry.readTopics.includes(topic));
    entry.activeTopic ||= previous.activeTopic;
  }
  const next = normalizeConvoyReturnHistoryV162({ schema: 162,
    entries: [entry, ...current.entries.filter(item => item.operationId !== entry.operationId)] },
  { resolvedSerial: save.strategy.specialOperationResolutionSerialV121 });
  if (JSON.stringify(next) === JSON.stringify(save.convoyReturnHistoryV162)) return { changed: false, reason: 'already-preserved' };
  save.convoyReturnHistoryV162 = next;
  return { changed: true, operationId: entry.operationId, count: next.entries.length };
}

/** Pure, detached reader models: history entries are never fed to mission
 * resolution, to a reward function or to the live V161 reading transaction. */
export function convoyReturnHistoryV162(save) {
  return normalizeConvoyReturnHistoryV162(save?.convoyReturnHistoryV162,
    { resolvedSerial: save?.strategy?.specialOperationResolutionSerialV121 }).entries.map(entry => ({ ...entry,
    title: `Sortie ${entry.serial} · ${entry.success ? 'M577 récupéré' : entry.reason === 'retreat' ? 'Repli' : 'Liaison interrompue'}`,
    operatorLabel: entry.operator ? `${entry.operator.callsign} · ${entry.operator.name}` : 'Liaison Echo-9',
    protocolLabel: entry.protocolId === 'hull-review' ? 'Bilan du blindage' : entry.protocolId === 'route-review' ? 'Mémoire du corridor' : 'Bilan standard',
    selectedTopic: entry.activeTopic || (entry.protocolId === 'hull-review' ? 'vehicle' : entry.protocolId === 'route-review' ? 'route' : 'return'),
    questions: [
      { id: 'vehicle', label: 'Le blindé', speaker: 'MU/TH/UR', answer: entry.success
        ? `Le M577 est rentré au périmètre. Blindage au retour : ${Math.ceil(entry.summary.hull)}/340. Le relevé est transmis à l’atelier.`
        : 'Le retour du M577 n’a pas été confirmé. Les dernières positions reçues restent dans le journal de la liaison.' },
      { id: 'route', label: 'Le corridor', speaker: 'Rook · liaison reconnaissance',
        answer: `${entry.success ? 'Relevé du retour' : 'Dernière position reçue avant la coupure de liaison'} : progression du parcours ${Math.round(entry.summary.distance / 3200 * 100)} %. Barrages lourds franchis : ${entry.summary.crushersCleared}/2. Barrage final : ${entry.summary.queenDefeated ? 'neutralisé' : 'non confirmé'}.` },
      { id: 'return', label: 'La liaison de retour', speaker: 'Echo-9', answer: entry.success
        ? 'Le corridor a été traversé et le sas a confirmé le blindé. Je conserve le journal de bord et les deux points de barrage.'
        : 'Nous n’avons pas de retour complet. Rook garde les dernières transmissions ; je signalerai les points sans réponse au prochain briefing.' }
    ].map(question => ({ ...question, readAtReturn: entry.readTopics.includes(question.id) }))
  }));
}
