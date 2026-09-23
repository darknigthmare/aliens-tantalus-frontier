import { V65_READY_ENEMY_PROFILE_ASSETS } from './enemy-profile-assets-v65.js';
import { V66_READY_ENEMY_PROFILE_ASSETS } from './enemy-profile-assets-v66.js';
import { BIOFORGE_WORLD_V80 } from './bioforge-level-v80.js';
import { normalizePlayerFacingV81 } from './player-visual-contract-v81.js';
import { sanitizeBioforgePhysicalV87 } from './bioforge-physical-state-v87.js';
import { ENEMY_USER_CASTES_IDS_V87, getEnemyUserCasteV87 } from './enemy-user-castes-v87.js';

export const BIOFORGE_SCHEMA_V80 = 80;
export const BIOFORGE_ROOT_KEY_V80 = 'bioforgeV80';
export const BIOFORGE_MAX_CONCURRENT_V80 = 12;
export const BIOFORGE_MAX_BUDGET_V80 = 12;
export const BIOFORGE_MAX_TOTAL_V87 = 48;
export const BIOFORGE_MIX_SCHEMA_V87 = 1;
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
  'enemy-055-albino-chestburster',
  ...ENEMY_USER_CASTES_IDS_V87
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
    // Supplied poses are deliberately not certified animation sheets.
    const supplied = getEnemyUserCasteV87(profileId);
    if (supplied) return Object.freeze({ ...supplied, terrestrial: true, spriteKey: 'user-caste-static' });
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

const mixIdV87 = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9:._-]{0,63}$/.test(value)
  && !['__proto__', 'prototype', 'constructor'].includes(value);

/** Total allocation is distinct from the concurrent actor/cost capacity. */
export function validateBioforgeCompositionV87(candidate) {
  const errors = [];
  const supplied = candidate?.composition;
  const legacy = supplied === undefined;
  const lines = legacy ? [{ lineId: 'legacy-1', profileId: candidate?.profileId, quantity: candidate?.quantity }] : supplied;
  const maxConcurrent = candidate?.maxConcurrent === undefined ? BIOFORGE_MAX_CONCURRENT_V80 : candidate.maxConcurrent;
  if (!Number.isSafeInteger(maxConcurrent) || maxConcurrent < 1 || maxConcurrent > BIOFORGE_MAX_CONCURRENT_V80)
    errors.push('invalid-max-concurrent');
  if (!Array.isArray(lines) || !lines.length || lines.length > BIOFORGE_MAX_TOTAL_V87) errors.push('invalid-composition');
  const composition = [], ids = new Set(); let totalQuantity = 0, totalCost = 0;
  for (const line of Array.isArray(lines) ? lines.slice(0, BIOFORGE_MAX_TOTAL_V87 + 1) : []) {
    if (!isRecord(line) || !mixIdV87(line.lineId)) { errors.push('invalid-line-id'); continue; }
    if (ids.has(line.lineId)) errors.push('duplicate-line-id');
    ids.add(line.lineId);
    const profile = getBioforgeRosterEntryV80(line.profileId);
    if (!profile || typeof line.profileId !== 'string' || line.profileId !== profile.profileId) errors.push('unsupported-profile');
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > BIOFORGE_MAX_TOTAL_V87)
      errors.push('invalid-line-quantity');
    if (profile && Number.isSafeInteger(line.quantity) && line.quantity > 0) {
      totalQuantity += line.quantity; totalCost += profile.cost * line.quantity;
    }
    composition.push(Object.freeze({ lineId: line.lineId, profileId: profile?.profileId || null, quantity: line.quantity }));
  }
  if (totalQuantity > BIOFORGE_MAX_TOTAL_V87) errors.push('composition-exceeds-total');
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]),
    composition: Object.freeze(composition), totalQuantity, totalCost, maxConcurrent });
}

function configurationV87(selection) {
  const uniqueProfiles = new Set(selection.composition.map(line => line.profileId));
  const profileId = uniqueProfiles.size === 1 ? selection.composition[0].profileId : null;
  return { mixSchemaV87: BIOFORGE_MIX_SCHEMA_V87, composition: selection.composition.map(line => ({ ...line })),
    maxConcurrent: selection.maxConcurrent, profileId, quantity: selection.totalQuantity,
    unitCost: profileId ? getBioforgeRosterEntryV80(profileId).cost : 0, budget: selection.totalCost };
}

function roundRobinLinesV87(lines) {
  const entries = [];
  for (let round = 0; round < Math.max(...lines.map(line => line.quantity), 0); round++)
    for (const line of lines) if (round < line.quantity) entries.push(line);
  return entries;
}

function queueLinesV87(selection, batches) {
  if (batches === undefined) return roundRobinLinesV87(selection.composition);
  if (!Array.isArray(batches) || !batches.length || batches.length > BIOFORGE_MAX_TOTAL_V87) return null;
  const used = new Set(), requests = new Set(), lines = new Map(selection.composition.map(line => [line.lineId, line]));
  const result = [];
  for (const [index, batch] of batches.entries()) {
    if (!isRecord(batch) || !Array.isArray(batch.lineIds) || !batch.lineIds.length
      || !Number.isSafeInteger(batch.addedAt) || batch.addedAt < 0
      || (index === 0 ? batch.requestId !== null : !mixIdV87(batch.requestId) || requests.has(batch.requestId))) return null;
    requests.add(batch.requestId);
    const members = [];
    for (const id of batch.lineIds) {
      if (!lines.has(id) || used.has(id)) return null;
      used.add(id); members.push(lines.get(id));
    }
    result.push(...roundRobinLinesV87(members));
  }
  return used.size === lines.size ? result : null;
}

export function buildBioforgePrintQueueV80({ sessionId, profileId, quantity, composition, maxConcurrent, queueBatchesV87 } = {}) {
  const selection = validateBioforgeCompositionV87({ profileId, quantity, composition, maxConcurrent });
  const safeSessionId = optionalText(sessionId, 120);
  if (!selection.ok || !safeSessionId || !/^bioforge-v80-s\d{9}$/.test(safeSessionId)) return Object.freeze([]);
  const lines = queueLinesV87(selection, queueBatchesV87);
  if (!lines) return Object.freeze([]);
  return Object.freeze(lines.map((line, index) => Object.freeze({
    id: `${safeSessionId}:specimen-${String(index + 1).padStart(2, '0')}`,
    index,
    lineId: line.lineId,
    profileId: line.profileId,
    cost: getBioforgeRosterEntryV80(line.profileId).cost,
    status: 'queued',
    printedAt: null,
    killedAt: null,
    purgedAt: null,
    cancelledAt: null
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
    configuration: configurationV87(validateBioforgeCompositionV87({ profileId: BIOFORGE_DEFAULT_PROFILE_ID_V80, quantity: 1 })),
    activeSession: null,
    lastSessionId: null,
    history: [],
    records: createRecordsV80(),
    runtimeV81: null,
    recovery: { purgeRequired: false, reason: null }
  };
}

export const createBioforgeRootV80 = createBioforgeV80;

export function sanitizeBioforgeRuntimeV81(raw) {
  if (!isRecord(raw) || !isRecord(raw.player)) return null;
  const x = Number(raw.player.x);
  const y = Number(raw.player.y);
  const seed = Number(raw.seed);
  const phaseClock = Number(raw.phaseClock);
  return {
    schema: 81,
    player: {
      x: Number.isFinite(x) ? Math.max(BIOFORGE_WORLD_V80.x, Math.min(BIOFORGE_WORLD_V80.width, x)) : 0,
      y: Number.isFinite(y) ? Math.max(BIOFORGE_WORLD_V80.ceilingY, Math.min(BIOFORGE_WORLD_V80.floorY, y)) : BIOFORGE_WORLD_V80.floorY,
      facing: normalizePlayerFacingV81(raw.player.facing)
    },
    seed: Number.isFinite(seed) ? seed : 80,
    phaseClock: Number.isFinite(phaseClock) ? Math.max(0, phaseClock) : 0,
    transferStage: integer(raw.transferStage, 0, 0, 3),
    ...(raw.physicalV87 !== undefined ? { physicalV87: sanitizeBioforgePhysicalV87(raw.physicalV87) } : {}),
    ...((raw.physicalInvalidV87 === true || (raw.physicalV87 !== undefined && !sanitizeBioforgePhysicalV87(raw.physicalV87)))
      ? { physicalInvalidV87: true } : {})
  };
}

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

function sanitizeProfileStatsV87(raw, composition) {
  const quantities = new Map();
  for (const line of composition) quantities.set(line.profileId, (quantities.get(line.profileId) || 0) + line.quantity);
  return [...quantities].map(([profileId, quantity]) => {
    const source = Array.isArray(raw) ? raw.find(entry => entry?.profileId === profileId) : null;
    const printed = integer(source?.printed, 0, 0, quantity);
    return { profileId, quantity, printed, kills: integer(source?.kills, 0, 0, printed),
      cancelled: integer(source?.cancelled, 0, 0, quantity - printed),
      score: integer(source?.score, 0, 0, BIOFORGE_RECORD_LIMIT_V80) };
  });
}

function profileStatsV87(session, score = 0) {
  const stats = sanitizeProfileStatsV87([], session.composition);
  for (const entry of session.queue) {
    const row = stats.find(candidate => candidate.profileId === entry.profileId);
    row.printed += Number(entry.printedAt !== null);
    row.kills += Number(session.killedIds.includes(entry.id));
    row.cancelled += Number(entry.cancelledAt !== null);
  }
  const totalWeight = stats.reduce((sum, row) => sum + row.kills * getBioforgeRosterEntryV80(row.profileId).cost, 0);
  let remainingScore = score;
  const scored = stats.filter(row => row.printed > 0);
  for (const row of scored) {
    row.score = totalWeight ? Math.floor(score * row.kills * getBioforgeRosterEntryV80(row.profileId).cost / totalWeight) : 0;
    remainingScore -= row.score;
  }
  // Stable remainder allocation partitions the single record; it grants no gameplay reward.
  if (totalWeight) for (const row of scored.filter(row => row.kills > 0)) {
    if (remainingScore-- > 0) row.score += 1;
  }
  else if (scored.length === 1) scored[0].score = score;
  return stats;
}

function preservePayloadV87(value) {
  try { return JSON.parse(JSON.stringify(value)); } catch { return { unreadable: true }; }
}

function sanitizeHistoryEntryV80(raw) {
  if (!isRecord(raw)) return null;
  const serial = integer(raw.serial, 0, 1, MAX_SERIAL_V80);
  const sessionId = optionalText(raw.sessionId, 120);
  const mixed = raw.mixSchemaV87 !== undefined;
  if (mixed && raw.mixSchemaV87 !== BIOFORGE_MIX_SCHEMA_V87) return null;
  const selection = mixed ? validateBioforgeCompositionV87(raw) : validateBioforgeSelectionV80({ profileId: raw.profileId, quantity: raw.quantity });
  if (!serial || sessionId !== bioforgeSessionIdV80(serial) || !selection.ok || !OUTCOME_SET_V80.has(raw.outcome)) return null;
  const configuration = mixed ? configurationV87(selection) : { profileId: selection.profileId, quantity: selection.quantity,
    unitCost: selection.unitCost, budget: selection.totalCost };
  if (mixed) {
    const expected = sanitizeProfileStatsV87([], selection.composition);
    if (!Array.isArray(raw.profileStats) || raw.profileStats.length !== expected.length
      || !Number.isSafeInteger(raw.printed) || !Number.isSafeInteger(raw.kills) || !Number.isSafeInteger(raw.cancelled)
      || raw.printed < 0 || raw.kills < 0 || raw.cancelled < 0) return null;
    for (const row of expected) {
      const matches = raw.profileStats.filter(entry => entry?.profileId === row.profileId), source = matches[0];
      if (matches.length !== 1 || source.quantity !== row.quantity
        || !['printed', 'kills', 'cancelled', 'score'].every(key => Number.isSafeInteger(source[key]) && source[key] >= 0)
        || source.printed + source.cancelled > row.quantity || source.kills > source.printed) return null;
    }
    if (raw.profileStats.reduce((sum, row) => sum + row.printed, 0) !== raw.printed
      || raw.profileStats.reduce((sum, row) => sum + row.kills, 0) !== raw.kills
      || raw.profileStats.reduce((sum, row) => sum + row.cancelled, 0) !== raw.cancelled) return null;
  }
  const printed = integer(raw.printed, 0, 0, configuration.quantity);
  const kills = integer(raw.kills, 0, 0, printed);
  const startedAt = timestamp(raw.startedAt, 0);
  const completedAt = Math.max(startedAt, timestamp(raw.completedAt, startedAt));
  return {
    sessionId,
    serial,
    ...configuration,
    outcome: raw.outcome,
    reason: optionalText(raw.reason, 160),
    printed,
    kills,
    score: integer(raw.score, 0, 0, BIOFORGE_RECORD_LIMIT_V80),
    startedAt,
    completedAt,
    durationMs: Math.max(0, completedAt - startedAt),
    ...(mixed ? { cancelled: integer(raw.cancelled, 0, 0, configuration.quantity - printed),
      profileStats: sanitizeProfileStatsV87(raw.profileStats, selection.composition) } : {})
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
    ...session
  });
  const rawById = new Map((Array.isArray(rawQueue) ? rawQueue : [])
    .filter((entry) => isRecord(entry) && typeof entry.id === 'string')
    .map((entry) => [entry.id, entry]));
  const killed = new Set(Array.isArray(session.killedIds) ? session.killedIds : []);
  return templates.map((template) => {
    const source = rawById.get(template.id);
    const printed = source?.printedAt != null;
    const cancelled = !printed && source?.cancelledAt != null;
    const dead = printed && killed.has(template.id);
    let status = printed ? dead ? 'killed' : 'alive' : cancelled ? 'cancelled' : 'queued';
    if (session.phase === 'purging' && printed && !dead) status = 'purging';
    if (session.phase === 'return' && printed && !dead) status = 'purged';
    return {
      ...template,
      status,
      printedAt: printed ? timestamp(source?.printedAt, session.startedAt) : null,
      killedAt: dead ? timestamp(source?.killedAt, source?.printedAt || session.startedAt) : null,
      purgedAt: status === 'purged' ? timestamp(source?.purgedAt, session.purge?.completedAt || session.startedAt) : null,
      cancelledAt: cancelled ? timestamp(source.cancelledAt, session.startedAt) : null
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
  const mixed = raw.mixSchemaV87 !== undefined;
  if (mixed && raw.mixSchemaV87 !== BIOFORGE_MIX_SCHEMA_V87) return null;
  const selection = validateBioforgeCompositionV87(mixed ? raw : { profileId: raw.profileId, quantity: raw.quantity });
  if (!mixed && !validateBioforgeSelectionV80(raw).ok) return null;
  if (!serial || id !== bioforgeSessionIdV80(serial) || !selection.ok) return null;
  if (!PHASE_SET_V80.has(raw.phase)) return null;
  const phase = raw.phase;
  const startedAt = timestamp(raw.startedAt, 0);
  const queueBatchesV87 = mixed ? raw.queueBatchesV87 : [{ requestId: null,
    lineIds: selection.composition.map(line => line.lineId), addedAt: startedAt }];
  if (mixed && !Array.isArray(queueBatchesV87)) return null;
  if (!queueLinesV87(selection, queueBatchesV87)) return null;
  const templates = buildBioforgePrintQueueV80({ sessionId: id, ...configurationV87(selection), queueBatchesV87 });
  let rawQueue;
  if (mixed) {
    // MIX is a complete canonical ledger: never discard foreign entries while
    // reconstructing it. The caller preserves the rejected session for recovery.
    if (!Array.isArray(raw.queue) || raw.queue.length !== templates.length
      || !Number.isSafeInteger(raw.printedCount)) return null;
    rawQueue = [];
    for (const template of templates) {
      const matches = raw.queue.filter(entry => entry?.id === template.id);
      const entry = matches[0];
      if (matches.length !== 1 || entry.index !== template.index || entry.lineId !== template.lineId
        || entry.profileId !== template.profileId || entry.cost !== template.cost
        || !['queued', 'alive', 'killed', 'purging', 'purged', 'cancelled'].includes(entry.status)
        || ![entry.printedAt, entry.killedAt, entry.purgedAt, entry.cancelledAt].every(value => value === null || (Number.isSafeInteger(value) && value >= 0))
        || (entry.cancelledAt !== null && (entry.printedAt !== null || entry.killedAt !== null))
        || (entry.killedAt !== null && entry.printedAt === null)
        || (entry.status === 'queued' && (entry.printedAt !== null || entry.cancelledAt !== null))
        || (entry.status === 'cancelled' && entry.cancelledAt === null)
        || (entry.status === 'killed' && entry.killedAt === null && !(Array.isArray(raw.killedIds) && raw.killedIds.includes(entry.id)))
        || (entry.status === 'purged' && phase !== 'return')
        || (entry.status === 'purging' && phase !== 'purging')
        || (['alive', 'killed', 'purging', 'purged'].includes(entry.status) && entry.printedAt === null)) return null;
      rawQueue.push({ ...entry });
    }
    if (rawQueue.filter(entry => entry.printedAt !== null).length !== raw.printedCount) return null;
  } else {
    const printedCount = ['configuration', 'sealing'].includes(phase) ? 0 : integer(raw.printedCount, 0, 0, selection.totalQuantity);
    const sources = new Map((Array.isArray(raw.queue) ? raw.queue : []).map(entry => [entry?.id, entry]));
    rawQueue = templates.map((template, index) => ({ ...template,
      printedAt: index < printedCount ? timestamp(sources.get(template.id)?.printedAt, startedAt) : null,
      killedAt: index < printedCount && Array.isArray(raw.killedIds) && raw.killedIds.includes(template.id)
        ? timestamp(sources.get(template.id)?.killedAt, startedAt) : null }));
  }
  const printedCount = rawQueue.filter(entry => entry.printedAt !== null).length;
  if (['configuration', 'sealing'].includes(phase) && rawQueue.some(entry => entry.printedAt !== null || entry.cancelledAt !== null)) return null;
  const printedIds = new Set(rawQueue.filter(entry => entry.printedAt !== null).map(entry => entry.id));
  const killedIds = [...new Set([...(Array.isArray(raw.killedIds) ? raw.killedIds : []),
    ...rawQueue.filter(entry => entry.killedAt !== null).map(entry => entry.id)])]
    .filter((entryId) => typeof entryId === 'string' && printedIds.has(entryId));
  const session = {
    schema: BIOFORGE_SCHEMA_V80,
    id,
    serial,
    phase,
    ...configurationV87(selection),
    queueBatchesV87: queueBatchesV87.map(batch => ({ requestId: batch.requestId, lineIds: [...batch.lineIds], addedAt: batch.addedAt })),
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
  session.queue = rebuildQueueV80(session, rawQueue);
  session.cancelledIds = session.queue.filter(entry => entry.status === 'cancelled').map(entry => entry.id);
  if (session.phase === 'combat' && session.queue.some(entry => entry.status === 'queued')) session.phase = 'printing';
  session.aliveIds = session.phase === 'return'
    ? []
    : session.queue.filter((entry) => entry.status === 'alive' || entry.status === 'purging').map((entry) => entry.id);
  return session;
}

export function sanitizeBioforgeV80(raw) {
  const safe = createBioforgeV80();
  if (!isRecord(raw) || Number(raw.schema) !== BIOFORGE_SCHEMA_V80) {
    if (raw != null) {
      safe.recovery = { purgeRequired: true, reason: 'unsupported-schema' };
      safe.unsupportedV87 = preservePayloadV87(raw);
    }
    return safe;
  }
  if (raw.unsupportedV87 !== undefined) safe.unsupportedV87 = preservePayloadV87(raw.unsupportedV87);
  if (raw.rejectedSessionV87 !== undefined) safe.rejectedSessionV87 = preservePayloadV87(raw.rejectedSessionV87);
  if ((raw.configuration?.mixSchemaV87 !== undefined && raw.configuration.mixSchemaV87 !== BIOFORGE_MIX_SCHEMA_V87)
    || (raw.activeSession?.mixSchemaV87 !== undefined && raw.activeSession.mixSchemaV87 !== BIOFORGE_MIX_SCHEMA_V87)
    || (Array.isArray(raw.history) && raw.history.some(entry => entry?.mixSchemaV87 !== undefined && entry.mixSchemaV87 !== BIOFORGE_MIX_SCHEMA_V87)))
    safe.unsupportedV87 = preservePayloadV87(raw);
  const configuration = validateBioforgeCompositionV87(raw.configuration);
  if (configuration.ok) {
    safe.configuration = configurationV87(configuration);
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
    activeSession?.serial || parseSessionSerialV80(raw.activeSession?.id)
  );
  safe.lastSessionId = optionalText(raw.lastSessionId, 120);
  safe.runtimeV81 = sanitizeBioforgeRuntimeV81(raw.runtimeV81);
  safe.recovery = {
    purgeRequired: Boolean(raw.recovery?.purgeRequired),
    reason: optionalText(raw.recovery?.reason, 160)
  };
  if (raw.activeSession != null && !activeSession) {
    safe.recovery = { purgeRequired: true, reason: 'corrupt-active-session' };
    safe.rejectedSessionV87 = preservePayloadV87(raw.activeSession);
  } else if (activeSession?.phase === 'purging') {
    safe.recovery = { purgeRequired: true, reason: activeSession.purge.reason || 'purge-in-progress' };
  } else if (activeSession?.phase === 'return') {
    safe.recovery = { purgeRequired: false, reason: null };
  }
  if (safe.unsupportedV87 !== undefined) safe.recovery = { purgeRequired: true, reason: 'unsupported-schema' };
  if (!configuration.ok && raw.configuration !== undefined) {
    safe.invalidConfigurationV87 = preservePayloadV87(raw.invalidConfigurationV87 ?? raw.configuration ?? null);
    safe.recovery = { purgeRequired: true, reason: 'corrupt-configuration' };
  } else if (raw.invalidConfigurationV87 !== undefined) {
    safe.invalidConfigurationV87 = preservePayloadV87(raw.invalidConfigurationV87);
    safe.recovery = { purgeRequired: true, reason: 'corrupt-configuration' };
  }
  const invalidHistory = Array.isArray(raw.history)
    ? raw.history.filter(entry => entry?.mixSchemaV87 === BIOFORGE_MIX_SCHEMA_V87 && !sanitizeHistoryEntryV80(entry)) : [];
  if (raw.invalidHistoryV87 !== undefined || invalidHistory.length) {
    safe.invalidHistoryV87 = preservePayloadV87(raw.invalidHistoryV87 ?? invalidHistory);
    safe.recovery = { purgeRequired: true, reason: 'corrupt-history' };
  }
  return safe;
}

export const migrateBioforgeV80 = sanitizeBioforgeV80;

function operationResultV80(state, applied, event = null, reason = null) {
  return Object.freeze({ applied, reason, event: event ? Object.freeze(event) : null, state, session: state.activeSession });
}

export function configureBioforgeV80(raw, candidate) {
  const state = sanitizeBioforgeV80(raw);
  const validation = validateBioforgeCompositionV87(candidate);
  if (!validation.ok) return operationResultV80(state, false, null, validation.errors[0] || 'invalid-selection');
  if (state.activeSession && state.activeSession.phase !== 'return') return operationResultV80(state, false, null, 'session-active');
  if (state.recovery.purgeRequired) return operationResultV80(state, false, null, 'purge-required');
  state.configuration = configurationV87(validation);
  return operationResultV80(state, true, {
    type: 'bioforge-configuration',
    ...state.configuration
  });
}

export function startBioforgeSessionV80(raw, candidate = null, { now = Date.now() } = {}) {
  const configured = candidate == null ? { applied: true, state: sanitizeBioforgeV80(raw) } : configureBioforgeV80(raw, candidate);
  const state = configured.state;
  if (!configured.applied) return configured;
  if (state.recovery.purgeRequired) return operationResultV80(state, false, null, 'purge-required');
  if (state.activeSession && state.activeSession.phase !== 'return') return operationResultV80(state, false, null, 'session-active');
  const selection = validateBioforgeCompositionV87(state.configuration);
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
    ...configurationV87(selection),
    queueBatchesV87: [{ requestId: null, lineIds: selection.composition.map(line => line.lineId), addedAt: startedAt }],
    printedCount: 0,
    killedIds: [],
    aliveIds: [],
    cancelledIds: [],
    queue: buildBioforgePrintQueueV80({ sessionId: id, ...configurationV87(selection) }).map((entry) => ({ ...entry })),
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
    ...configurationV87(selection)
  });
}

function enterPhaseV80(session, phase, now) {
  session.phase = phase;
  session.updatedAt = now;
  session.phaseStartedAt = now;
}

function refreshQueueV80(session) {
  session.queue = rebuildQueueV80(session, session.queue);
  session.printedCount = session.queue.filter(entry => entry.printedAt !== null).length;
  session.cancelledIds = session.queue.filter(entry => entry.cancelledAt !== null).map(entry => entry.id);
  session.aliveIds = session.phase === 'return'
    ? []
    : session.queue.filter((entry) => entry.status === 'alive' || entry.status === 'purging').map((entry) => entry.id);
}

/** population describes total real actors (including descendants), not a delta to add to the queue. */
export function getBioforgeCapacityV87(session, { population } = {}) {
  const alive = Array.isArray(session?.queue) ? session.queue.filter(entry => ['alive', 'purging'].includes(entry.status)) : [];
  const pending = Array.isArray(session?.queue) ? session.queue.filter(entry => entry.status === 'queued') : [];
  const baseCost = alive.reduce((sum, entry) => sum + entry.cost, 0);
  const valid = population === undefined || (isRecord(population)
    && ['activeCount', 'activeCost'].every(key => Number.isSafeInteger(population[key]) && population[key] >= 0)
    && ['reservedCount', 'reservedCost'].every(key => population[key] === undefined || (Number.isSafeInteger(population[key]) && population[key] >= 0)));
  const maxConcurrent = session?.maxConcurrent;
  const configured = Number.isSafeInteger(maxConcurrent) && maxConcurrent >= 1 && maxConcurrent <= BIOFORGE_MAX_CONCURRENT_V80;
  const activeCount = Math.max(alive.length, valid && population ? population.activeCount : 0);
  const activeCost = Math.max(baseCost, valid && population ? population.activeCost : 0);
  const reservedCount = valid ? population?.reservedCount || 0 : 0;
  const reservedCost = valid ? population?.reservedCost || 0 : 0;
  const remainingCount = configured ? Math.max(0, maxConcurrent - activeCount - reservedCount) : 0;
  const remainingBudget = Math.max(0, BIOFORGE_MAX_BUDGET_V80 - activeCost - reservedCost);
  const next = pending[0];
  const reason = !valid ? 'invalid-population' : !configured ? 'invalid-max-concurrent'
    : !next ? 'no-pending-specimen' : remainingCount < 1 ? 'active-count-capacity'
      : remainingBudget < next.cost ? 'active-cost-capacity' : null;
  return Object.freeze({ ok: valid && configured, reason, total: session?.quantity || 0, pending: pending.length,
    printed: session?.printedCount || 0, cancelled: session?.cancelledIds?.length || 0, alive: alive.length,
    activeCount, activeCost, reservedCount, reservedCost, maxConcurrent, budget: BIOFORGE_MAX_BUDGET_V80,
    remainingCount, remainingBudget, canPrint: reason === null, nextSpecimenId: next?.id || null, nextCost: next?.cost || 0 });
}

export function advanceBioforgeSessionV80(raw, { now = Date.now(), population } = {}) {
  const state = sanitizeBioforgeV80(raw);
  const session = state.activeSession;
  if (!session) return operationResultV80(state, false, null, 'no-active-session');
  if (state.recovery.purgeRequired) return operationResultV80(state, false, null, 'purge-required');
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
    const specimen = session.queue.find(entry => entry.status === 'queued');
    if (!specimen) {
      enterPhaseV80(session, 'combat', at);
      refreshQueueV80(session);
      return operationResultV80(state, true, { type: 'bioforge-combat-started', sessionId: session.id, phase: session.phase });
    }
    const capacity = getBioforgeCapacityV87(session, { population });
    if (!capacity.canPrint) return operationResultV80(state, false, null, capacity.reason);
    specimen.printedAt = at;
    session.updatedAt = at;
    refreshQueueV80(session);
    if (!session.queue.some(entry => entry.status === 'queued')) enterPhaseV80(session, 'combat', at);
    const printed = session.queue.find(entry => entry.id === specimen.id);
    return operationResultV80(state, true, {
      type: 'bioforge-specimen-printed',
      sessionId: session.id,
      specimenId: printed.id,
      profileId: printed.profileId,
      lineId: printed.lineId,
      index: printed.index,
      cost: printed.cost,
      phase: session.phase,
      remaining: session.queue.filter(entry => entry.status === 'queued').length
    });
  }
  return operationResultV80(state, false, null, `${session.phase}-requires-dedicated-action`);
}

export function recordBioforgeKillV80(raw, specimenId, { now = Date.now() } = {}) {
  const state = sanitizeBioforgeV80(raw);
  const session = state.activeSession;
  if (!session) return operationResultV80(state, false, null, 'no-active-session');
  if (state.recovery.purgeRequired) return operationResultV80(state, false, null, 'purge-required');
  if (!['printing', 'combat'].includes(session.phase)) return operationResultV80(state, false, null, 'combat-inactive');
  const id = optionalText(specimenId, 180);
  const target = session.queue.find(entry => entry.id === id && entry.printedAt !== null);
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
    profileId: target.profileId,
    lineId: target.lineId,
    kills: session.killedIds.length,
    batchCleared: !session.queue.some(entry => entry.status === 'queued') && session.aliveIds.length === 0
  });
}

/** Append-only batches preserve every previously allocated specimen ID, including cancellations. */
export function appendBioforgeReinforcementsV87(raw, candidate, { now = Date.now(), requestId } = {}) {
  const state = sanitizeBioforgeV80(raw), session = state.activeSession;
  if (!session) return operationResultV80(state, false, null, 'no-active-session');
  if (state.recovery.purgeRequired) return operationResultV80(state, false, null, 'purge-required');
  if (!mixIdV87(requestId)) return operationResultV80(state, false, null, 'invalid-request-id');
  const selection = validateBioforgeCompositionV87({ ...candidate, maxConcurrent: session.maxConcurrent });
  if (!selection.ok) return operationResultV80(state, false, null, selection.errors[0]);
  const previous = session.queueBatchesV87.find(batch => batch.requestId === requestId);
  if (previous) {
    const lines = previous.lineIds.map(id => session.composition.find(line => line.lineId === id));
    if (JSON.stringify(lines) !== JSON.stringify(selection.composition))
      return operationResultV80(state, false, null, 'reinforcement-request-conflict');
    return operationResultV80(state, true, { type: 'bioforge-reinforcements-replayed', sessionId: session.id, requestId });
  }
  if (!['printing', 'combat'].includes(session.phase)) return operationResultV80(state, false, null, 'combat-inactive');
  if (selection.composition.some(line => session.composition.some(existing => existing.lineId === line.lineId)))
    return operationResultV80(state, false, null, 'duplicate-line-id');
  const combined = validateBioforgeCompositionV87({ composition: [...session.composition, ...selection.composition],
    maxConcurrent: session.maxConcurrent });
  if (!combined.ok) return operationResultV80(state, false, null, combined.errors[0]);
  const at = Math.max(session.updatedAt, nowValue(now));
  const oldQueue = session.queue;
  Object.assign(session, configurationV87(combined));
  session.queueBatchesV87.push({ requestId, lineIds: selection.composition.map(line => line.lineId), addedAt: at });
  const templates = buildBioforgePrintQueueV80({ sessionId: session.id, ...session });
  session.queue = [...oldQueue, ...templates.slice(oldQueue.length).map(entry => ({ ...entry }))];
  if (session.phase === 'combat') enterPhaseV80(session, 'printing', at);
  else session.updatedAt = at;
  refreshQueueV80(session);
  return operationResultV80(state, true, { type: 'bioforge-reinforcements-appended', sessionId: session.id,
    requestId, added: selection.totalQuantity, total: session.quantity, lineIds: selection.composition.map(line => line.lineId) });
}

export function cancelBioforgePendingV87(raw, { lineId, now = Date.now() } = {}) {
  const state = sanitizeBioforgeV80(raw), session = state.activeSession;
  if (!session) return operationResultV80(state, false, null, 'no-active-session');
  if (state.recovery.purgeRequired) return operationResultV80(state, false, null, 'purge-required');
  if (!['printing', 'combat'].includes(session.phase)) return operationResultV80(state, false, null, 'combat-inactive');
  if (lineId !== undefined && !session.composition.some(line => line.lineId === lineId))
    return operationResultV80(state, false, null, 'unknown-line-id');
  const pending = session.queue.filter(entry => entry.status === 'queued' && (lineId === undefined || entry.lineId === lineId));
  if (!pending.length) return operationResultV80(state, false, null, 'no-pending-specimen');
  const at = Math.max(session.updatedAt, nowValue(now));
  for (const entry of pending) entry.cancelledAt = at;
  refreshQueueV80(session);
  session.updatedAt = at;
  if (!session.queue.some(entry => entry.status === 'queued')) enterPhaseV80(session, 'combat', at);
  return operationResultV80(state, true, { type: 'bioforge-pending-cancelled', sessionId: session.id,
    lineId: lineId ?? null, cancelled: pending.length, specimenIds: pending.map(entry => entry.id) });
}

function appendHistoryV80(state, session) {
  if (session.historyRecorded || !session.result) return false;
  const entry = sanitizeHistoryEntryV80({
    sessionId: session.id,
    serial: session.serial,
    ...configurationV87(validateBioforgeCompositionV87(session)),
    outcome: session.result.outcome,
    reason: session.result.reason,
    printed: session.result.printed,
    kills: session.result.kills,
    score: session.result.score,
    startedAt: session.startedAt,
    completedAt: session.result.completedAt,
    cancelled: session.cancelledIds.length,
    profileStats: profileStatsV87(session, session.result.score)
  });
  if (!entry) return false;
  if (!state.history.some((candidate) => candidate.sessionId === entry.sessionId)) {
    state.history.push(entry);
    state.history = state.history.slice(-BIOFORGE_HISTORY_LIMIT_V80);
    for (const profile of entry.profileStats.filter(row => row.printed > 0)) {
    const record = state.records[profile.profileId];
    record.sessions = Math.min(BIOFORGE_RECORD_LIMIT_V80, record.sessions + 1);
    record.clears = Math.min(BIOFORGE_RECORD_LIMIT_V80, record.clears + Number(entry.outcome === 'cleared'));
    record.failures = Math.min(BIOFORGE_RECORD_LIMIT_V80, record.failures + Number(entry.outcome === 'failed'));
    record.aborts = Math.min(BIOFORGE_RECORD_LIMIT_V80, record.aborts + Number(entry.outcome === 'aborted'));
    record.printed = Math.min(BIOFORGE_RECORD_LIMIT_V80, record.printed + profile.printed);
    record.kills = Math.min(BIOFORGE_RECORD_LIMIT_V80, record.kills + profile.kills);
    record.bestScore = Math.max(record.bestScore, profile.score);
    if (entry.outcome === 'cleared' && (record.bestClearTimeMs == null || entry.durationMs < record.bestClearTimeMs)) {
      record.bestClearTimeMs = entry.durationMs;
    }
    record.lastSessionId = entry.sessionId;
    record.lastOutcome = entry.outcome;
    }
  }
  session.historyRecorded = true;
  return true;
}

export function finishBioforgeSessionV80(raw, candidate = {}, { now = Date.now(), population } = {}) {
  const state = sanitizeBioforgeV80(raw);
  const session = state.activeSession;
  if (!session) return operationResultV80(state, false, null, 'no-active-session');
  if (state.recovery.purgeRequired) return operationResultV80(state, false, null, 'purge-required');
  if (!['configuration', 'sealing', 'printing', 'combat'].includes(session.phase)) {
    return operationResultV80(state, false, null, 'session-not-finishable');
  }
  const outcome = candidate?.outcome;
  if (!OUTCOME_SET_V80.has(outcome)) return operationResultV80(state, false, null, 'invalid-outcome');
  const capacity = getBioforgeCapacityV87(session, { population });
  const cleared = capacity.ok && capacity.pending === 0 && capacity.activeCount === 0
    && capacity.activeCost === 0 && capacity.reservedCount === 0 && capacity.reservedCost === 0;
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
  if (state.unsupportedV87 !== undefined) return operationResultV80(state, false, null, 'unsupported-schema');
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
  if (state.unsupportedV87 !== undefined || state.invalidConfigurationV87 !== undefined || state.invalidHistoryV87 !== undefined)
    return operationResultV80(state, false, null, 'unsupported-or-corrupt-configuration');
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
    status: entry.cancelledAt !== null ? 'cancelled' : entry.printedAt == null ? 'queued' : entry.killedAt == null ? 'purged' : 'killed',
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
