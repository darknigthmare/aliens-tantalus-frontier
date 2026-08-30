/**
 * Deterministic, JSON-safe mission-insertion state machine.
 *
 * The module deliberately owns no presentation copy and performs no I/O. A host
 * renders source data from the operation/campaign/mission contracts, consumes
 * the audio/camera/objective hooks, and persists the returned plain objects.
 */

export const MISSION_INSERTION_SCHEMA_V62 = 62;

export const MISSION_INSERTION_APPROACHES_V62 = Object.freeze([
  'dropship',
  'apc',
  'foot'
]);

export const MISSION_INSERTION_PHASES_V62 = Object.freeze([
  'briefing',
  'preparation',
  'approach',
  'incident',
  'deployment',
  'player-control'
]);

export const MISSION_INSERTION_ACTIONS_V62 = Object.freeze({
  briefing: 'acknowledge-briefing',
  preparation: 'confirm-preparation',
  approach: 'complete-approach',
  deployment: 'deploy',
  'player-control': 'assume-control',
  skip: 'skip'
});

const PHASE_STATUS = Object.freeze(['pending', 'active', 'complete', 'skipped']);
const SEQUENCE_STATUS = Object.freeze(['active', 'completed']);
const CAUSE_COLLECTIONS = Object.freeze({
  event: ['events'],
  hazard: ['hazards'],
  spawn: ['spawns'],
  route: ['graph', 'routes'],
  seed: ['levelSeed'],
  cause: ['insertion', 'causes']
});

function record(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function finiteTimestamp(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function clampProgress(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(1, number));
}

function identifier(value, maximum = 180) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().slice(0, maximum);
  return normalized || null;
}

function stringList(value, maximum = 64) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.slice(0, maximum).map((entry) => identifier(entry)).filter(Boolean))];
}

function serializable(value, depth = 0) {
  if (depth > 8 || value === undefined || typeof value === 'function' || typeof value === 'symbol') return null;
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return value;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (Array.isArray(value)) return value.slice(0, 256).map((entry) => serializable(entry, depth + 1));
  if (!record(value)) return null;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => /^[a-zA-Z0-9_-]{1,80}$/.test(key))
    .slice(0, 256)
    .map(([key, entry]) => [key, serializable(entry, depth + 1)]));
}

function sourceAtPath(source, path) {
  let current = source;
  for (const key of path) {
    if (!record(current) && !Array.isArray(current)) return null;
    current = current[key];
  }
  return current;
}

function readReceiptKeys(receipts) {
  if (!Array.isArray(receipts)) return new Set();
  return new Set(receipts.flatMap((entry) => {
    if (typeof entry === 'string') return identifier(entry) ? [entry] : [];
    const key = identifier(entry?.key);
    return key ? [key] : [];
  }));
}

function explicitApproach(source) {
  const candidate = source?.insertion?.approach ?? source?.insertionApproach;
  if (typeof candidate === 'string') {
    const mode = MISSION_INSERTION_APPROACHES_V62.includes(candidate) ? candidate : null;
    return mode ? { mode, vehicleId: null } : null;
  }
  if (!record(candidate) || !MISSION_INSERTION_APPROACHES_V62.includes(candidate.mode)) return null;
  return { mode: candidate.mode, vehicleId: identifier(candidate.vehicleId) };
}

function vehicleCanDeploy(vehicle) {
  if (!record(vehicle) || !identifier(vehicle.id)) return false;
  if (vehicle.deploymentReady === false || vehicle.deployable === false) return false;
  return !String(vehicle.visualStatus || '').startsWith('BLOCKED_');
}

/** Resolve insertion transport exclusively from supplied mission/deployment data. */
export function resolveMissionInsertionApproachV62({ mission = {}, operation = {}, vehicle = null } = {}) {
  const missionChoice = explicitApproach(mission);
  if (missionChoice) return {
    mode: missionChoice.mode,
    source: 'mission',
    vehicleId: missionChoice.vehicleId || identifier(vehicle?.id)
  };

  const operationChoice = explicitApproach(operation);
  if (operationChoice) return {
    mode: operationChoice.mode,
    source: 'operation',
    vehicleId: operationChoice.vehicleId || identifier(vehicle?.id)
  };

  if (vehicleCanDeploy(vehicle)) {
    const family = identifier(vehicle.family, 40);
    if (family === 'air') return { mode: 'dropship', source: 'vehicle', vehicleId: vehicle.id };
    if (family === 'ground' && Array.isArray(vehicle.seats) && vehicle.seats.length >= 2) {
      return { mode: 'apc', source: 'vehicle', vehicleId: vehicle.id };
    }
  }

  return { mode: 'foot', source: 'mission-fallback', vehicleId: null };
}

function findCausalSource(mission, cause) {
  const path = CAUSE_COLLECTIONS[cause.kind];
  if (!path) return null;
  const collection = sourceAtPath(mission, path);
  if (cause.kind === 'seed') return identifier(collection?.id) === cause.id ? collection : null;
  return Array.isArray(collection)
    ? collection.find((entry) => identifier(entry?.id) === cause.id) || null
    : null;
}

/**
 * Return an insertion incident only when the mission explicitly declares it,
 * names its resolution action, and points to a real causal mission record.
 */
export function resolveMissionInsertionIncidentV62(mission = {}) {
  const candidate = mission?.insertion?.incident ?? mission?.insertionIncident;
  if (!record(candidate)) return null;
  const id = identifier(candidate.id);
  const resolutionActionId = identifier(candidate.resolutionActionId);
  const cause = record(candidate.cause)
    ? { kind: identifier(candidate.cause.kind, 40), id: identifier(candidate.cause.id) }
    : null;
  if (!id || !resolutionActionId || !cause?.kind || !cause.id) return null;
  const causalSource = findCausalSource(mission, cause);
  if (!causalSource) return null;
  return {
    id,
    cause,
    resolutionActionId,
    source: serializable(causalSource),
    data: record(candidate.data) ? serializable(candidate.data) : {}
  };
}

function missionIdentity({ operation, campaign, world, mission }) {
  const operationId = identifier(operation?.id);
  const campaignId = identifier(operation?.campaignId) || identifier(campaign?.id) || identifier(mission?.campaign?.id);
  const worldId = identifier(operation?.worldId) || identifier(world?.id) || identifier(mission?.world?.id);
  if (!operationId) throw new Error('Mission insertion requires operation.id.');
  if (!campaignId) throw new Error('Mission insertion requires a campaign id.');
  if (!worldId) throw new Error('Mission insertion requires a world id.');
  return { operationId, campaignId, worldId };
}

/** Build the stable key persisted after one complete viewing. */
export function buildMissionInsertionReadKeyV62({ campaignId, worldId, mission = {}, approach, incident = null } = {}) {
  const campaign = identifier(campaignId);
  const world = identifier(worldId);
  if (!campaign || !world) throw new Error('Mission insertion read key requires campaignId and worldId.');
  const missionRef = identifier(mission?.insertion?.readKey)
    || identifier(mission?.signature)
    || identifier(mission?.levelSeed?.id)
    || identifier(mission?.templateId)
    || campaign;
  const mode = MISSION_INSERTION_APPROACHES_V62.includes(approach?.mode) ? approach.mode : 'foot';
  return [campaign, world, missionRef, mode, incident?.id || 'none'].map(encodeURIComponent).join('|');
}

function objectiveReference(campaign, mission) {
  return identifier(campaign?.objective, 300)
    || identifier(mission?.campaign?.objective, 300)
    || identifier(mission?.levelSeed?.objective, 300);
}

function phaseHooks(kind, context) {
  const base = [
    { channel: 'audio', event: 'mission-insertion-phase-enter', phase: kind, operationId: context.operationId },
    { channel: 'camera', event: 'mission-insertion-phase-enter', phase: kind, approach: context.approach.mode },
    { channel: 'objective', event: 'mission-insertion-phase-enter', phase: kind, operationId: context.operationId }
  ];
  if (context.objectiveRef) base[2].objectiveRef = context.objectiveRef;
  const supplied = context.mission?.insertion?.hooks?.[kind];
  const custom = (Array.isArray(supplied) ? supplied : record(supplied) ? [supplied] : [])
    .map((entry) => serializable(entry))
    .filter((entry) => record(entry) && identifier(entry.channel, 40));
  return [...base, ...custom];
}

function phasePayload(kind, context) {
  if (kind === 'briefing') return {
    operationId: context.operationId,
    campaignId: context.campaignId,
    worldId: context.worldId,
    ...(context.objectiveRef ? { objectiveRef: context.objectiveRef } : {})
  };
  if (kind === 'preparation') return {
    crewIds: context.crewIds,
    weaponIds: stringList(context.operation.weaponIds),
    equipmentIds: stringList(context.operation.equipmentIds),
    ...(identifier(context.operation.costumeId) ? { costumeId: context.operation.costumeId } : {}),
    ...(context.approach.vehicleId ? { vehicleId: context.approach.vehicleId } : {})
  };
  if (kind === 'approach') return { approach: { ...context.approach } };
  if (kind === 'incident') return { incident: serializable(context.incident) };
  if (kind === 'deployment') {
    const spawnAnchor = record(context.mission?.anchors?.spawn)
      ? serializable(context.mission.anchors.spawn)
      : null;
    return {
      approach: { ...context.approach },
      ...(spawnAnchor ? { spawnAnchor } : {})
    };
  }
  const missionSignature = identifier(context.mission?.signature);
  return missionSignature ? { missionSignature } : {};
}

function requiredAction(kind, incident) {
  if (kind === 'incident') return incident.resolutionActionId;
  return MISSION_INSERTION_ACTIONS_V62[kind];
}

function phaseRecord(kind, index, context, now) {
  return {
    id: `mission-insertion:${kind}`,
    kind,
    index,
    status: index === 0 ? 'active' : 'pending',
    requiredAction: requiredAction(kind, context.incident),
    progress: 0,
    enteredAt: index === 0 ? now : null,
    completedAt: null,
    hooks: phaseHooks(kind, context),
    payload: phasePayload(kind, context)
  };
}

function sequenceProgress(phases) {
  if (!phases.length) return 0;
  return phases.reduce((sum, phase) => sum + (['complete', 'skipped'].includes(phase.status) ? 1 : phase.progress), 0) / phases.length;
}

/** Create a new deterministic insertion state. No random source is consulted. */
export function createMissionInsertionV62({
  operation = {},
  campaign = {},
  world = {},
  mission = {},
  vehicle = null,
  crew = [],
  readReceipts = [],
  now = 0
} = {}) {
  const identity = missionIdentity({ operation, campaign, world, mission });
  const timestamp = finiteTimestamp(now);
  const approach = resolveMissionInsertionApproachV62({ mission, operation, vehicle });
  const incident = resolveMissionInsertionIncidentV62(mission);
  const phaseKinds = ['briefing', 'preparation', 'approach', ...(incident ? ['incident'] : []), 'deployment', 'player-control'];
  const operationCrewIds = stringList(operation.crewIds);
  const crewIds = operationCrewIds.length ? operationCrewIds : stringList(crew.map((entry) => entry?.id));
  const objectiveRef = objectiveReference(campaign, mission);
  const readKey = buildMissionInsertionReadKeyV62({ ...identity, mission, approach, incident });
  const context = {
    ...identity,
    operation,
    mission,
    approach,
    incident,
    crewIds,
    objectiveRef
  };
  const phases = phaseKinds.map((kind, index) => phaseRecord(kind, index, context, timestamp));
  return {
    schema: MISSION_INSERTION_SCHEMA_V62,
    id: `mission-insertion:${identity.operationId}`,
    ...identity,
    readKey,
    skipAllowed: readReceiptKeys(readReceipts).has(readKey),
    firstReadCompleted: false,
    status: 'active',
    paused: false,
    returnContext: null,
    approach,
    incident,
    currentIndex: 0,
    currentPhaseId: phases[0].id,
    progress: 0,
    controlGranted: false,
    startedAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
    resumedAt: null,
    phases,
    history: [{ event: 'created', phaseId: phases[0].id, at: timestamp }]
  };
}

function canonicalKinds(phases) {
  const expected = ['briefing', 'preparation', 'approach'];
  if (phases.some((phase) => phase.kind === 'incident')) expected.push('incident');
  expected.push('deployment', 'player-control');
  return expected;
}

function normalizePhase(candidate, index) {
  const kind = identifier(candidate?.kind, 40);
  const status = PHASE_STATUS.includes(candidate?.status) ? candidate.status : null;
  const required = identifier(candidate?.requiredAction);
  if (!MISSION_INSERTION_PHASES_V62.includes(kind) || !status || !required) throw new Error('Invalid mission insertion phase.');
  return {
    id: `mission-insertion:${kind}`,
    kind,
    index,
    status,
    requiredAction: required,
    progress: ['complete', 'skipped'].includes(status) ? 1 : clampProgress(candidate.progress),
    enteredAt: candidate.enteredAt == null ? null : finiteTimestamp(candidate.enteredAt),
    completedAt: candidate.completedAt == null ? null : finiteTimestamp(candidate.completedAt),
    hooks: Array.isArray(candidate.hooks) ? candidate.hooks.map((entry) => serializable(entry)).filter(record) : [],
    payload: record(candidate.payload) ? serializable(candidate.payload) : {}
  };
}

function validatePhaseState(status, phases) {
  const active = phases.filter((phase) => phase.status === 'active');
  if (status === 'active' && active.length !== 1) throw new Error('Active mission insertion must have one active phase.');
  if (status === 'completed' && phases.some((phase) => ['active', 'pending'].includes(phase.status))) {
    throw new Error('Completed mission insertion has unfinished phases.');
  }
  if (status === 'active') {
    const activeIndex = phases.findIndex((phase) => phase.status === 'active');
    if (phases.slice(0, activeIndex).some((phase) => !['complete', 'skipped'].includes(phase.status))) {
      throw new Error('Mission insertion phase order is invalid.');
    }
    if (phases.slice(activeIndex + 1).some((phase) => phase.status !== 'pending')) {
      throw new Error('Mission insertion future phases are invalid.');
    }
  }
}

/** Restore and sanitize a JSON object/string without advancing the sequence. */
export function restoreMissionInsertionV62(candidate) {
  let source = candidate;
  if (typeof source === 'string') {
    try { source = JSON.parse(source); } catch { throw new Error('Mission insertion save is not valid JSON.'); }
  }
  if (!record(source) || Number(source.schema) !== MISSION_INSERTION_SCHEMA_V62) {
    throw new Error('Unsupported mission insertion save schema.');
  }
  const operationId = identifier(source.operationId);
  const campaignId = identifier(source.campaignId);
  const worldId = identifier(source.worldId);
  const readKey = identifier(source.readKey, 700);
  if (!operationId || !campaignId || !worldId || !readKey) throw new Error('Mission insertion save identity is incomplete.');
  if (!Array.isArray(source.phases) || source.phases.length < 5 || source.phases.length > 6) {
    throw new Error('Mission insertion save phase list is invalid.');
  }
  const phases = source.phases.map(normalizePhase);
  const kinds = phases.map((phase) => phase.kind);
  if (JSON.stringify(kinds) !== JSON.stringify(canonicalKinds(phases))) throw new Error('Mission insertion save phase order is invalid.');
  const status = SEQUENCE_STATUS.includes(source.status) ? source.status : null;
  if (!status) throw new Error('Mission insertion save status is invalid.');
  validatePhaseState(status, phases);
  const activeIndex = phases.findIndex((phase) => phase.status === 'active');
  const currentIndex = status === 'completed' ? phases.length - 1 : activeIndex;
  const approach = record(source.approach) && MISSION_INSERTION_APPROACHES_V62.includes(source.approach.mode)
    ? {
      mode: source.approach.mode,
      source: identifier(source.approach.source, 80) || 'mission-fallback',
      vehicleId: identifier(source.approach.vehicleId)
    }
    : { mode: 'foot', source: 'mission-fallback', vehicleId: null };
  const updatedAt = finiteTimestamp(source.updatedAt, finiteTimestamp(source.startedAt));
  return {
    schema: MISSION_INSERTION_SCHEMA_V62,
    id: `mission-insertion:${operationId}`,
    operationId,
    campaignId,
    worldId,
    readKey,
    skipAllowed: Boolean(source.skipAllowed),
    firstReadCompleted: Boolean(source.firstReadCompleted),
    status,
    paused: Boolean(source.paused) && status === 'active',
    returnContext: identifier(source.returnContext, 180),
    approach,
    incident: record(source.incident) ? serializable(source.incident) : null,
    currentIndex,
    currentPhaseId: phases[currentIndex].id,
    progress: sequenceProgress(phases),
    controlGranted: Boolean(source.controlGranted) && status === 'completed',
    startedAt: finiteTimestamp(source.startedAt),
    updatedAt,
    completedAt: status === 'completed' ? finiteTimestamp(source.completedAt, updatedAt) : null,
    resumedAt: source.resumedAt == null ? null : finiteTimestamp(source.resumedAt),
    phases,
    history: Array.isArray(source.history)
      ? source.history.slice(-256).map((entry) => serializable(entry)).filter(record)
      : []
  };
}

/** Return a detached, directly JSON-stringifiable save payload. */
export function serializeMissionInsertionV62(state) {
  return serializable(restoreMissionInsertionV62(state));
}

export function getActiveMissionInsertionPhaseV62(state) {
  const restored = restoreMissionInsertionV62(state);
  return serializable(restored.phases[restored.currentIndex]);
}

/** Update audiovisual progress while leaving phase completion action-driven. */
export function recordMissionInsertionProgressV62(state, value, { now = null } = {}) {
  const next = restoreMissionInsertionV62(state);
  if (next.status === 'completed') return { ok: false, reason: 'already-complete', state: next };
  if (next.paused) return { ok: false, reason: 'paused', state: next };
  const timestamp = Math.max(next.updatedAt, finiteTimestamp(now, next.updatedAt));
  const phase = next.phases[next.currentIndex];
  phase.progress = Math.max(phase.progress, clampProgress(value));
  next.updatedAt = timestamp;
  next.progress = sequenceProgress(next.phases);
  next.history.push({ event: 'progress', phaseId: phase.id, progress: phase.progress, at: timestamp });
  return { ok: true, state: next, phase: serializable(phase) };
}

function transitionResult(next, phase, event, timestamp) {
  next.updatedAt = timestamp;
  next.progress = sequenceProgress(next.phases);
  next.history.push({ event, phaseId: phase.id, at: timestamp });
  return {
    ok: true,
    state: next,
    event: { type: event, phaseId: phase.id, at: timestamp },
    hooks: serializable(phase.hooks)
  };
}

/** Apply one interaction token and return a new state; the input is untouched. */
export function applyMissionInsertionActionV62(state, action, { now = null } = {}) {
  const next = restoreMissionInsertionV62(state);
  const actionType = identifier(typeof action === 'string' ? action : action?.type);
  if (!actionType) return { ok: false, reason: 'invalid-action', state: next };
  if (next.status === 'completed') return { ok: false, reason: 'already-complete', state: next };
  if (next.paused) return { ok: false, reason: 'paused', state: next };
  const timestamp = Math.max(next.updatedAt, finiteTimestamp(now, next.updatedAt));

  if (actionType === MISSION_INSERTION_ACTIONS_V62.skip) {
    if (!next.skipAllowed) return { ok: false, reason: 'first-read-required', state: next };
    for (const phase of next.phases) {
      if (!['complete', 'skipped'].includes(phase.status)) {
        phase.status = 'skipped';
        phase.progress = 1;
        phase.enteredAt ??= timestamp;
        phase.completedAt = timestamp;
      }
    }
    const control = next.phases.at(-1);
    next.status = 'completed';
    next.currentIndex = next.phases.length - 1;
    next.currentPhaseId = control.id;
    next.controlGranted = true;
    next.firstReadCompleted = true;
    next.completedAt = timestamp;
    return transitionResult(next, control, 'skipped-to-player-control', timestamp);
  }

  const current = next.phases[next.currentIndex];
  if (actionType !== current.requiredAction) {
    return { ok: false, reason: 'wrong-action', expectedAction: current.requiredAction, state: next };
  }
  current.status = 'complete';
  current.progress = 1;
  current.completedAt = timestamp;

  const following = next.phases[next.currentIndex + 1];
  if (following) {
    following.status = 'active';
    following.enteredAt = timestamp;
    next.currentIndex += 1;
    next.currentPhaseId = following.id;
    return transitionResult(next, following, 'phase-entered', timestamp);
  }

  next.status = 'completed';
  next.controlGranted = true;
  next.firstReadCompleted = true;
  next.completedAt = timestamp;
  return transitionResult(next, current, 'player-control-granted', timestamp);
}

/** Mark a return to another host view without losing insertion progression. */
export function pauseMissionInsertionV62(state, { now = null, returnContext = null } = {}) {
  const next = restoreMissionInsertionV62(state);
  if (next.status === 'completed') return { ok: false, reason: 'already-complete', state: next };
  const timestamp = Math.max(next.updatedAt, finiteTimestamp(now, next.updatedAt));
  next.paused = true;
  next.returnContext = identifier(returnContext, 180);
  next.updatedAt = timestamp;
  next.history.push({ event: 'paused', phaseId: next.currentPhaseId, at: timestamp });
  return { ok: true, state: next };
}

/** Restore a persisted state and resume it at a monotonic host timestamp. */
export function resumeMissionInsertionV62(candidate, { now = null } = {}) {
  const next = restoreMissionInsertionV62(candidate);
  if (next.status === 'completed') return { ok: false, reason: 'already-complete', state: next };
  const timestamp = Math.max(next.updatedAt, finiteTimestamp(now, next.updatedAt));
  next.paused = false;
  next.resumedAt = timestamp;
  next.updatedAt = timestamp;
  next.history.push({ event: 'resumed', phaseId: next.currentPhaseId, at: timestamp });
  return {
    ok: true,
    state: next,
    phase: serializable(next.phases[next.currentIndex]),
    hooks: serializable(next.phases[next.currentIndex].hooks)
  };
}

/** Emit the receipt that unlocks Skip for a later viewing of this exact sequence. */
export function getMissionInsertionReadReceiptV62(state) {
  const restored = restoreMissionInsertionV62(state);
  if (restored.status !== 'completed' || !restored.firstReadCompleted) return null;
  return {
    schema: MISSION_INSERTION_SCHEMA_V62,
    key: restored.readKey,
    operationId: restored.operationId,
    campaignId: restored.campaignId,
    worldId: restored.worldId,
    completedAt: restored.completedAt
  };
}
