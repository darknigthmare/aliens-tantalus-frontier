import { V65_READY_ENEMY_PROFILE_ASSETS } from './enemy-profile-assets-v65.js';
import { V66_READY_ENEMY_PROFILE_ASSETS } from './enemy-profile-assets-v66.js';

export const BIOFORGE_SCHEMA_V80 = 80;
export const BIOFORGE_ROOT_KEY_V80 = 'bioforgeV80';
export const BIOFORGE_MAX_CONCURRENT_V80 = 12;
export const BIOFORGE_MAX_BUDGET_V80 = 12;
export const BIOFORGE_HISTORY_LIMIT_V80 = 64;
export const BIOFORGE_RECORD_LIMIT_V80 = 1_000_000;

export const BIOFORGE_PHASES_V80 = Object.freeze([
  'configuration',
  'sealing',
  'printing',
  'combat',
  'result',
  'purging',
  'return'
]);

export const BIOFORGE_OUTCOMES_V80 = Object.freeze(['cleared', 'failed', 'aborted']);
export const BIOFORGE_PURGE_COUNTERS_V80 = Object.freeze([
  'remainingEntities',
  'remainingProjectiles',
  'remainingHazards',
  'remainingEffects',
  'remainingTimers'
]);

export const BIOFORGE_TERRESTRIAL_PROFILE_IDS_V80 = Object.freeze([
  'enemy-001-ovomorph',
  'enemy-002-facehugger',
  'enemy-003-chestburster',
  'enemy-004-drone-big-chap',
  'enemy-005-warrior',
  'enemy-006-runner',
  'enemy-015-prowler',
  'enemy-016-burster',
  'enemy-020-k-series-yellow-xenomorph',
  'enemy-050-korari-stalker',
  'enemy-055-albino-chestburster'
]);

const PROFILE_COST_V80 = Object.freeze({
  'enemy-001-ovomorph': 2,
  'enemy-002-facehugger': 1,
  'enemy-003-chestburster': 1,
  'enemy-004-drone-big-chap': 3,
  'enemy-005-warrior': 3,
  'enemy-006-runner': 2,
  'enemy-015-prowler': 3,
  'enemy-016-burster': 3,
  'enemy-020-k-series-yellow-xenomorph': 3,
  'enemy-050-korari-stalker': 2,
  'enemy-055-albino-chestburster': 1
});

export const BIOFORGE_DEFAULT_PROFILE_ID_V80 = 'enemy-004-drone-big-chap';
const MAX_SERIAL_V80 = 999_999_999;
const MAX_TIME_V80 = Number.MAX_SAFE_INTEGER;
const PHASE_SET_V80 = new Set(BIOFORGE_PHASES_V80);
const OUTCOME_SET_V80 = new Set(BIOFORGE_OUTCOMES_V80);
const TERRESTRIAL_ID_SET_V80 = new Set(BIOFORGE_TERRESTRIAL_PROFILE_IDS_V80);
const isRecord = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const integer = (value, fallback = 0, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, Math.floor(number))) : fallback;
};
const optionalText = (value, maximum = 160) => typeof value === 'string' && value.trim()
  ? value.trim().slice(0, maximum)
  : null;
const timestamp = (value, fallback = 0) => integer(value, fallback, 0, MAX_TIME_V80);
const nowValue = (value) => timestamp(value, Date.now());

const READY_ASSET_BY_ID_V80 = new Map([
  ...V65_READY_ENEMY_PROFILE_ASSETS,
  ...V66_READY_ENEMY_PROFILE_ASSETS
].map((asset) => [asset.profileId, asset]));

function buildTerrestrialRosterV80() {
  return BIOFORGE_TERRESTRIAL_PROFILE_IDS_V80.map((profileId) => {
    const asset = READY_ASSET_BY_ID_V80.get(profileId);
    if (!asset
      || asset.identityVerified !== true
      || asset.spriteKey === 'legacy'
      || typeof asset.path !== 'string'
      || !asset.path.startsWith('/assets/openai/sprites/normalized/')) {
      throw new Error(`Profil BIOFORGE non validé : ${profileId}`);
    }
    return Object.freeze({
      profileId,
      cost: PROFILE_COST_V80[profileId],
      terrestrial: true,
      identityVerified: true,
      reviewStatus: asset.reviewStatus || 'accepted-ready-registry',
      path: asset.path,
      spriteKey: asset.spriteKey,
      clipSet: asset.clipSet,
      pivot: asset.pivot,
      hitbox: asset.hitbox,
      renderWidth: asset.renderWidth,
      renderHeight: asset.renderHeight,
      sourceFacing: asset.sourceFacing,
      identityStatus: asset.identityStatus,
      referenceStatus: asset.referenceStatus,
      canonExact: asset.canonExact === true
    });
  });
}

export const BIOFORGE_TERRESTRIAL_ROSTER_V80 = Object.freeze(buildTerrestrialRosterV80());
const ROSTER_BY_ID_V80 = new Map(BIOFORGE_TERRESTRIAL_ROSTER_V80.map((entry) => [entry.profileId, entry]));

export function getBioforgeRosterEntryV80(profileId) {
  return ROSTER_BY_ID_V80.get(typeof profileId === 'string' ? profileId.trim() : '') || null;
}

export function getBioforgeMaximumQuantityV80(profileId) {
  const profile = getBioforgeRosterEntryV80(profileId);
  return profile
    ? Math.min(BIOFORGE_MAX_CONCURRENT_V80, Math.floor(BIOFORGE_MAX_BUDGET_V80 / profile.cost))
    : 0;
}

export function validateBioforgeSelectionV80(candidate) {
  const errors = [];
  const profileId = typeof candidate?.profileId === 'string' ? candidate.profileId.trim() : '';
  const profile = getBioforgeRosterEntryV80(profileId);
  const quantity = candidate?.quantity;
  if (!profile || !TERRESTRIAL_ID_SET_V80.has(profileId)) errors.push('unsupported-profile');
  if (typeof quantity !== 'number' || !Number.isSafeInteger(quantity)) errors.push('quantity-must-be-safe-integer');
  if (Number.isSafeInteger(quantity) && quantity < 1) errors.push('quantity-below-minimum');
  if (Number.isSafeInteger(quantity) && quantity > BIOFORGE_MAX_CONCURRENT_V80) errors.push('quantity-exceeds-concurrency');
  const maximumQuantity = profile ? getBioforgeMaximumQuantityV80(profileId) : 0;
  if (profile && Number.isSafeInteger(quantity) && quantity > maximumQuantity) errors.push('quantity-exceeds-budget');
  const totalCost = profile && Number.isSafeInteger(quantity) && quantity > 0 ? profile.cost * quantity : 0;
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    profile: profile || null,
    profileId: profile?.profileId || null,
    quantity: Number.isSafeInteger(quantity) ? quantity : null,
    unitCost: profile?.cost || 0,
    totalCost,
    maximumQuantity
  });
}

export function bioforgeSessionIdV80(serial) {
  const safeSerial = integer(serial, 0, 1, MAX_SERIAL_V80);
  return `bioforge-v80-s${String(safeSerial).padStart(9, '0')}`;
}

export function buildBioforgePrintQueueV80({ sessionId, profileId, quantity } = {}) {
  const selection = validateBioforgeSelectionV80({ profileId, quantity });
  const safeSessionId = optionalText(sessionId, 120);
  if (!selection.ok || !safeSessionId || !/^bioforge-v80-s\d{9}$/.test(safeSessionId)) return Object.freeze([]);
  return Object.freeze(Array.from({ length: selection.quantity }, (_, index) => Object.freeze({
    id: `${safeSessionId}:specimen-${String(index + 1).padStart(2, '0')}`,
    index,
    profileId: selection.profileId,
    cost: selection.unitCost,
    status: 'queued',
    printedAt: null,
    killedAt: null,
    purgedAt: null
  })));
}

function createRecordV80(profileId) {
  return {
    profileId,
    sessions: 0,
    clears: 0,
    failures: 0,
    aborts: 0,
    printed: 0,
    kills: 0,
    bestScore: 0,
    bestClearTimeMs: null,
    lastSessionId: null,
    lastOutcome: null
  };
}

function createRecordsV80() {
  return Object.fromEntries(BIOFORGE_TERRESTRIAL_PROFILE_IDS_V80.map((profileId) => [profileId, createRecordV80(profileId)]));
}

export function createBioforgeV80() {
  return {
    schema: BIOFORGE_SCHEMA_V80,
    serial: 0,
    configuration: {
      profileId: BIOFORGE_DEFAULT_PROFILE_ID_V80,
      quantity: 1,
      unitCost: PROFILE_COST_V80[BIOFORGE_DEFAULT_PROFILE_ID_V80],
      budget: PROFILE_COST_V80[BIOFORGE_DEFAULT_PROFILE_ID_V80]
    },
    activeSession: null,
    lastSessionId: null,
    history: [],
    records: createRecordsV80(),
    recovery: { purgeRequired: false, reason: null }
  };
}

export const createBioforgeRootV80 = createBioforgeV80;

function sanitizeRecordV80(raw, profileId) {
  const safe = createRecordV80(profileId);
  if (!isRecord(raw)) return safe;
  for (const key of ['sessions', 'clears', 'failures', 'aborts', 'printed', 'kills', 'bestScore']) {
    safe[key] = integer(raw[key], 0, 0, BIOFORGE_RECORD_LIMIT_V80);
  }
  safe.bestClearTimeMs = raw.bestClearTimeMs == null
    ? null
    : integer(raw.bestClearTimeMs, 0, 1, MAX_TIME_V80);
  safe.lastSessionId = optionalText(raw.lastSessionId, 120);
  safe.lastOutcome = OUTCOME_SET_V80.has(raw.lastOutcome) ? raw.lastOutcome : null;
  return safe;
}

function parseSessionSerialV80(sessionId) {
  const match = /^bioforge-v80-s(\d{9})$/.exec(String(sessionId || ''));
  return match ? integer(match[1], 0, 1, MAX_SERIAL_V80) : 0;
}

function sanitizeHistoryEntryV80(raw) {
  if (!isRecord(raw)) return null;
  const serial = integer(raw.serial, 0, 1, MAX_SERIAL_V80);
  const sessionId = optionalText(raw.sessionId, 120);
  const selection = validateBioforgeSelectionV80({ profileId: raw.profileId, quantity: raw.quantity });
  if (!serial || sessionId !== bioforgeSessionIdV80(serial) || !selection.ok || !OUTCOME_SET_V80.has(raw.outcome)) return null;
  const printed = integer(raw.printed, 0, 0, selection.quantity);
  const kills = integer(raw.kills, 0, 0, printed);
  const startedAt = timestamp(raw.startedAt, 0);
  const completedAt = Math.max(startedAt, timestamp(raw.completedAt, startedAt));
  return {
    sessionId,
    serial,
    profileId: selection.profileId,
    quantity: selection.quantity,
    unitCost: selection.unitCost,
    budget: selection.totalCost,
    outcome: raw.outcome,
    reason: optionalText(raw.reason, 160),
    printed,
    kills,
    score: integer(raw.score, 0, 0, BIOFORGE_RECORD_LIMIT_V80),
    startedAt,
    completedAt,
    durationMs: Math.max(0, completedAt - startedAt)
  };
}

function sanitizeHistoryV80(rawHistory) {
  const bySessionId = new Map();
  for (const raw of Array.isArray(rawHistory) ? rawHistory.slice(-BIOFORGE_HISTORY_LIMIT_V80 * 4) : []) {
    const entry = sanitizeHistoryEntryV80(raw);
    if (!entry) continue;
    bySessionId.delete(entry.sessionId);
    bySessionId.set(entry.sessionId, entry);
  }
  return [...bySessionId.values()].slice(-BIOFORGE_HISTORY_LIMIT_V80);
}

function rebuildQueueV80(session, rawQueue = []) {
  const templates = buildBioforgePrintQueueV80({
    sessionId: session.id,
    profileId: session.profileId,
    quantity: session.quantity
  });
  const rawById = new Map((Array.isArray(rawQueue) ? rawQueue : [])
    .filter((entry) => isRecord(entry) && typeof entry.id === 'string')
    .map((entry) => [entry.id, entry]));
  const killed = new Set(Array.isArray(session.killedIds) ? session.killedIds : []);
  return templates.map((template, index) => {
    const source = rawById.get(template.id);
    const printed = index < session.printedCount;
    const dead = printed && killed.has(template.id);
    let status = printed ? dead ? 'killed' : 'alive' : 'queued';
    if (session.phase === 'purging' && printed && !dead) status = 'purging';
    if (session.phase === 'return' && printed) status = 'purged';
    return {
      ...template,
      status,
      printedAt: printed ? timestamp(source?.printedAt, session.startedAt) : null,
      killedAt: dead ? timestamp(source?.killedAt, source?.printedAt || session.startedAt) : null,
      purgedAt: status === 'purged' ? timestamp(source?.purgedAt, session.purge?.completedAt || session.startedAt) : null
    };
  });
}

function sanitizeResultV80(raw, session) {
  if (!isRecord(raw) || !OUTCOME_SET_V80.has(raw.outcome)) return null;
  const completedAt = Math.max(session.startedAt, timestamp(raw.completedAt, session.startedAt));
  return {
    outcome: raw.outcome,
    reason: optionalText(raw.reason, 160),
    score: integer(raw.score, 0, 0, BIOFORGE_RECORD_LIMIT_V80),
    printed: integer(raw.printed, session.printedCount, 0, session.quantity),
    kills: integer(raw.kills, session.killedIds.length, 0, session.printedCount),
    completedAt,
    durationMs: Math.max(0, completedAt - session.startedAt)
  };
}

function sanitizeSessionV80(raw) {
  if (!isRecord(raw) || Number(raw.schema) !== BIOFORGE_SCHEMA_V80) return null;
  const serial = integer(raw.serial, 0, 1, MAX_SERIAL_V80);
  const id = optionalText(raw.id, 120);
  const selection = validateBioforgeSelectionV80({ profileId: raw.profileId, quantity: raw.quantity });
  if (!serial || id !== bioforgeSessionIdV80(serial) || !selection.ok) return null;
  let phase = PHASE_SET_V80.has(raw.phase) ? raw.phase : 'configuration';
  let printedCount = integer(raw.printedCount, 0, 0, selection.quantity);
  if (phase === 'configuration' || phase === 'sealing') printedCount = 0;
  if (phase === 'combat' && printedCount < selection.quantity) phase = 'printing';
  const templates = buildBioforgePrintQueueV80({ sessionId: id, profileId: selection.profileId, quantity: selection.quantity });
  const printedIds = new Set(templates.slice(0, printedCount).map((entry) => entry.id));
  const killedIds = [...new Set(Array.isArray(raw.killedIds) ? raw.killedIds : [])]
    .filter((entryId) => typeof entryId === 'string' && printedIds.has(entryId));
  const startedAt = timestamp(raw.startedAt, 0);
  const session = {
    schema: BIOFORGE_SCHEMA_V80,
    id,
    serial,
    phase,
    profileId: selection.profileId,
    quantity: selection.quantity,
    unitCost: selection.unitCost,
    budget: selection.totalCost,
    maxConcurrent: BIOFORGE_MAX_CONCURRENT_V80,
    printedCount,
    killedIds,
    aliveIds: [],
    queue: [],
    startedAt,
    updatedAt: Math.max(startedAt, timestamp(raw.updatedAt, startedAt)),
    phaseStartedAt: Math.max(startedAt, timestamp(raw.phaseStartedAt, startedAt)),
    result: null,
    historyRecorded: Boolean(raw.historyRecorded),
    purge: {
      reason: optionalText(raw.purge?.reason, 160),
      requestedAt: raw.purge?.requestedAt == null ? null : timestamp(raw.purge.requestedAt, startedAt),
      completedAt: raw.purge?.completedAt == null ? null : timestamp(raw.purge.completedAt, startedAt)
    }
  };
  session.result = sanitizeResultV80(raw.result, session);
  if (session.phase === 'result' && !session.result) {
    session.phase = 'purging';
    session.purge.reason ||= 'corrupt-result';
  }
  if (session.phase === 'return' && session.purge.completedAt == null) session.phase = 'purging';
  session.queue = rebuildQueueV80(session, raw.queue);
  session.aliveIds = session.phase === 'return'
    ? []
    : session.queue.filter((entry) => entry.status === 'alive' || entry.status === 'purging').map((entry) => entry.id);
  return session;
}

export function sanitizeBioforgeV80(raw) {
  const safe = createBioforgeV80();
  if (!isRecord(raw) || Number(raw.schema) !== BIOFORGE_SCHEMA_V80) {
    if (isRecord(raw?.activeSession)) safe.recovery = { purgeRequired: true, reason: 'unsupported-or-corrupt-root' };
    return safe;
  }
  const configuration = validateBioforgeSelectionV80(raw.configuration);
  if (configuration.ok) {
    safe.configuration = {
      profileId: configuration.profileId,
      quantity: configuration.quantity,
      unitCost: configuration.unitCost,
      budget: configuration.totalCost
    };
  }
  safe.history = sanitizeHistoryV80(raw.history);
  safe.records = Object.fromEntries(BIOFORGE_TERRESTRIAL_PROFILE_IDS_V80.map((profileId) => [
    profileId,
    sanitizeRecordV80(raw.records?.[profileId], profileId)
  ]));
  const activeSession = raw.activeSession == null ? null : sanitizeSessionV80(raw.activeSession);
  safe.activeSession = activeSession;
  safe.serial = Math.max(
    integer(raw.serial, 0, 0, MAX_SERIAL_V80),
    ...safe.history.map((entry) => entry.serial),
    activeSession?.serial || 0
  );
  safe.lastSessionId = optionalText(raw.lastSessionId, 120);
  safe.recovery = {
    purgeRequired: Boolean(raw.recovery?.purgeRequired),
    reason: optionalText(raw.recovery?.reason, 160)
  };
  if (raw.activeSession != null && !activeSession) {
    safe.recovery = { purgeRequired: true, reason: 'corrupt-active-session' };
  } else if (activeSession?.phase === 'purging') {
    safe.recovery = { purgeRequired: true, reason: activeSession.purge.reason || 'purge-in-progress' };
  } else if (activeSession?.phase === 'return') {
    safe.recovery = { purgeRequired: false, reason: null };
  }
  return safe;
}

export const migrateBioforgeV80 = sanitizeBioforgeV80;

function operationResultV80(state, applied, event = null, reason = null) {
  return Object.freeze({ applied, reason, event: event ? Object.freeze(event) : null, state, session: state.activeSession });
}

export function configureBioforgeV80(raw, candidate) {
  const state = sanitizeBioforgeV80(raw);
  const validation = validateBioforgeSelectionV80(candidate);
  if (!validation.ok) return operationResultV80(state, false, null, validation.errors[0] || 'invalid-selection');
  if (state.activeSession && state.activeSession.phase !== 'return') return operationResultV80(state, false, null, 'session-active');
  if (state.recovery.purgeRequired) return operationResultV80(state, false, null, 'purge-required');
  state.configuration = {
    profileId: validation.profileId,
    quantity: validation.quantity,
    unitCost: validation.unitCost,
    budget: validation.totalCost
  };
  return operationResultV80(state, true, {
    type: 'bioforge-configuration',
    profileId: validation.profileId,
    quantity: validation.quantity,
    budget: validation.totalCost
  });
}

export function startBioforgeSessionV80(raw, candidate = null, { now = Date.now() } = {}) {
  const configured = candidate == null ? { applied: true, state: sanitizeBioforgeV80(raw) } : configureBioforgeV80(raw, candidate);
  const state = configured.state;
  if (!configured.applied) return configured;
  if (state.recovery.purgeRequired) return operationResultV80(state, false, null, 'purge-required');
  if (state.activeSession && state.activeSession.phase !== 'return') return operationResultV80(state, false, null, 'session-active');
  const selection = validateBioforgeSelectionV80(state.configuration);
  if (!selection.ok) return operationResultV80(state, false, null, selection.errors[0] || 'invalid-selection');
  if (state.serial >= MAX_SERIAL_V80) return operationResultV80(state, false, null, 'serial-exhausted');
  const serial = state.serial + 1;
  const id = bioforgeSessionIdV80(serial);
  const startedAt = nowValue(now);
  state.serial = serial;
  state.activeSession = {
    schema: BIOFORGE_SCHEMA_V80,
    id,
    serial,
    phase: 'configuration',
    profileId: selection.profileId,
    quantity: selection.quantity,
    unitCost: selection.unitCost,
    budget: selection.totalCost,
    maxConcurrent: BIOFORGE_MAX_CONCURRENT_V80,
    printedCount: 0,
    killedIds: [],
    aliveIds: [],
    queue: buildBioforgePrintQueueV80({ sessionId: id, profileId: selection.profileId, quantity: selection.quantity }).map((entry) => ({ ...entry })),
    startedAt,
    updatedAt: startedAt,
    phaseStartedAt: startedAt,
    result: null,
    historyRecorded: false,
    purge: { reason: null, requestedAt: null, completedAt: null }
  };
  return operationResultV80(state, true, {
    type: 'bioforge-session-started',
    sessionId: id,
    profileId: selection.profileId,
    quantity: selection.quantity,
    budget: selection.totalCost
  });
}

function enterPhaseV80(session, phase, now) {
  session.phase = phase;
  session.updatedAt = now;
  session.phaseStartedAt = now;
}

function refreshQueueV80(session) {
  session.queue = rebuildQueueV80(session, session.queue);
  session.aliveIds = session.phase === 'return'
    ? []
    : session.queue.filter((entry) => entry.status === 'alive' || entry.status === 'purging').map((entry) => entry.id);
}

export function advanceBioforgeSessionV80(raw, { now = Date.now() } = {}) {
  const state = sanitizeBioforgeV80(raw);
  const session = state.activeSession;
  if (!session) return operationResultV80(state, false, null, 'no-active-session');
  const at = nowValue(now);
  if (session.phase === 'configuration') {
    enterPhaseV80(session, 'sealing', at);
    return operationResultV80(state, true, { type: 'bioforge-sealing-started', sessionId: session.id, phase: session.phase });
  }
  if (session.phase === 'sealing') {
    enterPhaseV80(session, 'printing', at);
    return operationResultV80(state, true, { type: 'bioforge-printer-ready', sessionId: session.id, phase: session.phase });
  }
  if (session.phase === 'printing') {
    if (session.printedCount >= session.quantity) {
      enterPhaseV80(session, 'combat', at);
      refreshQueueV80(session);
      return operationResultV80(state, true, { type: 'bioforge-combat-started', sessionId: session.id, phase: session.phase });
    }
    const specimen = session.queue[session.printedCount];
    specimen.printedAt = at;
    session.printedCount += 1;
    session.updatedAt = at;
    if (session.printedCount === session.quantity) enterPhaseV80(session, 'combat', at);
    refreshQueueV80(session);
    const printed = session.queue[session.printedCount - 1];
    return operationResultV80(state, true, {
      type: 'bioforge-specimen-printed',
      sessionId: session.id,
      specimenId: printed.id,
      profileId: printed.profileId,
      index: printed.index,
      cost: printed.cost,
      phase: session.phase,
      remaining: session.quantity - session.printedCount
    });
  }
  return operationResultV80(state, false, null, `${session.phase}-requires-dedicated-action`);
}

export function recordBioforgeKillV80(raw, specimenId, { now = Date.now() } = {}) {
  const state = sanitizeBioforgeV80(raw);
  const session = state.activeSession;
  if (!session) return operationResultV80(state, false, null, 'no-active-session');
  if (!['printing', 'combat'].includes(session.phase)) return operationResultV80(state, false, null, 'combat-inactive');
  const id = optionalText(specimenId, 180);
  const target = session.queue.find((entry, index) => entry.id === id && index < session.printedCount);
  if (!target) return operationResultV80(state, false, null, 'unknown-or-unprinted-specimen');
  if (session.killedIds.includes(target.id)) return operationResultV80(state, false, null, 'kill-already-recorded');
  const at = nowValue(now);
  target.killedAt = at;
  session.killedIds.push(target.id);
  session.killedIds.sort((left, right) => session.queue.findIndex((entry) => entry.id === left) - session.queue.findIndex((entry) => entry.id === right));
  session.updatedAt = at;
  refreshQueueV80(session);
  return operationResultV80(state, true, {
    type: 'bioforge-kill-recorded',
    sessionId: session.id,
    specimenId: target.id,
    kills: session.killedIds.length,
    batchCleared: session.printedCount === session.quantity && session.killedIds.length === session.quantity
  });
}

function appendHistoryV80(state, session) {
  if (session.historyRecorded || !session.result) return false;
  const entry = sanitizeHistoryEntryV80({
    sessionId: session.id,
    serial: session.serial,
    profileId: session.profileId,
    quantity: session.quantity,
    outcome: session.result.outcome,
    reason: session.result.reason,
    printed: session.result.printed,
    kills: session.result.kills,
    score: session.result.score,
    startedAt: session.startedAt,
    completedAt: session.result.completedAt
  });
  if (!entry) return false;
  if (!state.history.some((candidate) => candidate.sessionId === entry.sessionId)) {
    state.history.push(entry);
    state.history = state.history.slice(-BIOFORGE_HISTORY_LIMIT_V80);
    const record = state.records[session.profileId];
    record.sessions = Math.min(BIOFORGE_RECORD_LIMIT_V80, record.sessions + 1);
    record.clears = Math.min(BIOFORGE_RECORD_LIMIT_V80, record.clears + Number(entry.outcome === 'cleared'));
    record.failures = Math.min(BIOFORGE_RECORD_LIMIT_V80, record.failures + Number(entry.outcome === 'failed'));
    record.aborts = Math.min(BIOFORGE_RECORD_LIMIT_V80, record.aborts + Number(entry.outcome === 'aborted'));
    record.printed = Math.min(BIOFORGE_RECORD_LIMIT_V80, record.printed + entry.printed);
    record.kills = Math.min(BIOFORGE_RECORD_LIMIT_V80, record.kills + entry.kills);
    record.bestScore = Math.max(record.bestScore, entry.score);
    if (entry.outcome === 'cleared' && (record.bestClearTimeMs == null || entry.durationMs < record.bestClearTimeMs)) {
      record.bestClearTimeMs = entry.durationMs;
    }
    record.lastSessionId = entry.sessionId;
    record.lastOutcome = entry.outcome;
  }
  session.historyRecorded = true;
  return true;
}

export function finishBioforgeSessionV80(raw, candidate = {}, { now = Date.now() } = {}) {
  const state = sanitizeBioforgeV80(raw);
  const session = state.activeSession;
  if (!session) return operationResultV80(state, false, null, 'no-active-session');
  if (!['configuration', 'sealing', 'printing', 'combat'].includes(session.phase)) {
    return operationResultV80(state, false, null, 'session-not-finishable');
  }
  const outcome = candidate?.outcome;
  if (!OUTCOME_SET_V80.has(outcome)) return operationResultV80(state, false, null, 'invalid-outcome');
  const cleared = session.printedCount === session.quantity && session.killedIds.length === session.quantity;
  if (outcome === 'cleared' && !cleared) return operationResultV80(state, false, null, 'batch-not-cleared');
  const at = Math.max(session.startedAt, nowValue(now));
  session.result = {
    outcome,
    reason: optionalText(candidate.reason, 160),
    score: integer(candidate.score, 0, 0, BIOFORGE_RECORD_LIMIT_V80),
    printed: session.printedCount,
    kills: session.killedIds.length,
    completedAt: at,
    durationMs: at - session.startedAt
  };
  enterPhaseV80(session, 'result', at);
  appendHistoryV80(state, session);
  return operationResultV80(state, true, {
    type: 'bioforge-session-result',
    sessionId: session.id,
    outcome,
    printed: session.result.printed,
    kills: session.result.kills,
    score: session.result.score
  });
}

export function beginBioforgePurgeV80(raw, reason = 'manual-purge', { now = Date.now() } = {}) {
  const state = sanitizeBioforgeV80(raw);
  const session = state.activeSession;
  const safeReason = optionalText(reason, 160) || 'manual-purge';
  if (!session) {
    if (!state.recovery.purgeRequired) return operationResultV80(state, false, null, 'no-active-session');
    state.recovery.reason = safeReason;
    return operationResultV80(state, true, { type: 'bioforge-recovery-purge-started', reason: safeReason });
  }
  if (session.phase === 'return') return operationResultV80(state, false, null, 'already-returned');
  if (session.phase === 'purging') return operationResultV80(state, false, null, 'purge-already-started');
  const at = Math.max(session.startedAt, nowValue(now));
  if (!session.result) {
    session.result = {
      outcome: 'aborted',
      reason: safeReason,
      score: 0,
      printed: session.printedCount,
      kills: session.killedIds.length,
      completedAt: at,
      durationMs: at - session.startedAt
    };
    appendHistoryV80(state, session);
  }
  enterPhaseV80(session, 'purging', at);
  session.purge = { reason: safeReason, requestedAt: at, completedAt: null };
  state.recovery = { purgeRequired: true, reason: safeReason };
  refreshQueueV80(session);
  return operationResultV80(state, true, {
    type: 'bioforge-purge-started',
    sessionId: session.id,
    reason: safeReason,
    remainingEntities: session.aliveIds.length
  });
}

export function validateBioforgePurgeReportV80(report) {
  if (!isRecord(report)) return { ok: false, reason: 'purge-report-required', report: null };
  const normalized = {};
  for (const key of BIOFORGE_PURGE_COUNTERS_V80) {
    if (typeof report[key] !== 'number' || !Number.isSafeInteger(report[key]) || report[key] < 0) {
      return { ok: false, reason: `invalid-${key}`, report: null };
    }
    normalized[key] = report[key];
  }
  const remaining = Object.values(normalized).reduce((total, value) => total + value, 0);
  return { ok: remaining === 0, reason: remaining === 0 ? null : 'containment-not-empty', report: normalized };
}

export function completeBioforgePurgeV80(raw, report, { now = Date.now() } = {}) {
  const state = sanitizeBioforgeV80(raw);
  const validation = validateBioforgePurgeReportV80(report);
  if (!validation.ok) return operationResultV80(state, false, null, validation.reason);
  const session = state.activeSession;
  if (!session) {
    if (!state.recovery.purgeRequired) return operationResultV80(state, false, null, 'no-purge-in-progress');
    state.recovery = { purgeRequired: false, reason: null };
    return operationResultV80(state, true, { type: 'bioforge-recovery-purge-completed', report: validation.report });
  }
  if (session.phase !== 'purging') return operationResultV80(state, false, null, 'purge-not-started');
  const at = Math.max(session.startedAt, nowValue(now));
  session.purge.completedAt = at;
  enterPhaseV80(session, 'return', at);
  session.aliveIds = [];
  session.queue = session.queue.map((entry) => ({
    ...entry,
    status: entry.printedAt == null ? 'queued' : entry.killedAt == null ? 'purged' : 'killed',
    purgedAt: entry.printedAt != null && entry.killedAt == null ? at : entry.purgedAt
  }));
  state.lastSessionId = session.id;
  state.recovery = { purgeRequired: false, reason: null };
  return operationResultV80(state, true, {
    type: 'bioforge-purge-completed',
    sessionId: session.id,
    phase: session.phase,
    report: validation.report
  });
}
