import { PROVING_GROUND_TARGETS_V81 } from './tantalus-proving-ground-v81.js';

export const PROVING_GROUND_SESSION_SCHEMA_V81 = 81;
export const PROVING_GROUND_STATE_KEY_V81 = 'provingGroundV81';
export const PROVING_GROUND_COURSE_ID_V81 = 'm41a-qualification-v81';
export const PROVING_GROUND_WEAPON_ID_V81 = 'M41A Pulse Rifle';
export const PROVING_GROUND_DURATION_SECONDS_V81 = 75;
export const PROVING_GROUND_TARGET_EXPOSURE_SECONDS_V81 = 5.5;
export const PROVING_GROUND_RELOAD_SECONDS_V81 = 1.45;
export const PROVING_GROUND_MAGAZINE_CAPACITY_V81 = 99;
export const PROVING_GROUND_INITIAL_MAGAZINE_V81 = 4;
export const PROVING_GROUND_INITIAL_RESERVE_V81 = 95;
export const PROVING_GROUND_PASS_HITS_V81 = 7;

const PHASES_V81 = new Set(['idle', 'armed', 'active', 'completed', 'failed', 'aborted']);
const TARGET_STATUSES_V81 = new Set(['queued', 'active', 'hit', 'missed']);
const LANES_V81 = new Set(['high', 'level', 'low']);
const RECEIPT_PREFIX_V81 = `${PROVING_GROUND_COURSE_ID_V81}:session-`;
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, Number(value) || 0));
const integer = (value, minimum, maximum) => Math.round(clamp(value, minimum, maximum));

const defaultTargetsV81 = () => PROVING_GROUND_TARGETS_V81.map((target) => ({
  id: target.id,
  lane: target.lane,
  status: 'queued',
  exposureRemaining: PROVING_GROUND_TARGET_EXPOSURE_SECONDS_V81
}));

const defaultQualificationV81 = () => ({
  qualified: false,
  bestScore: 0,
  bestHits: 0,
  bestRemainingSeconds: 0,
  lastReceiptId: null
});

const sessionIdV81 = (ordinal) => `${PROVING_GROUND_COURSE_ID_V81}:session-${ordinal}`;
const receiptIdV81 = (ordinal) => `${sessionIdV81(ordinal)}:qualification`;
const validReceiptIdV81 = (value) => typeof value === 'string'
  && value.startsWith(RECEIPT_PREFIX_V81)
  && /^m41a-qualification-v81:session-\d+:qualification$/.test(value);

const deriveLaneHitsV81 = (targets) => targets.reduce((counts, target) => {
  if (target.status === 'hit') counts[target.lane] += 1;
  return counts;
}, { high: 0, level: 0, low: 0 });

const deriveScoreV81 = ({ hits, shots, remainingSeconds, phase }) => Math.max(0,
  hits * 100
  - Math.max(0, shots - hits) * 10
  + (phase === 'completed' ? Math.round(Math.max(0, remainingSeconds) * 2) : 0)
);

const qualifiesV81 = ({ hits, reloadCount, laneHits }) => hits >= PROVING_GROUND_PASS_HITS_V81
  && reloadCount >= 1
  && laneHits.high > 0
  && laneHits.level > 0
  && laneHits.low > 0;

function canonicalTargetsV81(rawTargets, phase, currentTargetIndex) {
  const byId = new Map((Array.isArray(rawTargets) ? rawTargets : [])
    .filter((target) => target && typeof target.id === 'string')
    .map((target) => [target.id, target]));
  return defaultTargetsV81().map((target, index) => {
    const raw = byId.get(target.id) || {};
    let status = TARGET_STATUSES_V81.has(raw.status) ? raw.status : 'queued';
    if (phase === 'idle' || phase === 'armed' || phase === 'aborted') status = 'queued';
    else if (phase === 'active') {
      if (index < currentTargetIndex) status = status === 'hit' ? 'hit' : 'missed';
      else if (index === currentTargetIndex) status = 'active';
      else status = 'queued';
    } else status = status === 'hit' ? 'hit' : 'missed';
    return {
      ...target,
      status,
      exposureRemaining: status === 'active'
        ? clamp(raw.exposureRemaining ?? PROVING_GROUND_TARGET_EXPOSURE_SECONDS_V81, 0, PROVING_GROUND_TARGET_EXPOSURE_SECONDS_V81)
        : PROVING_GROUND_TARGET_EXPOSURE_SECONDS_V81
    };
  });
}

function createReceiptV81(state) {
  return Object.freeze({
    id: receiptIdV81(state.sessionOrdinal),
    idempotencyKey: receiptIdV81(state.sessionOrdinal),
    schemaVersion: PROVING_GROUND_SESSION_SCHEMA_V81,
    type: 'proving-ground-qualification',
    courseId: PROVING_GROUND_COURSE_ID_V81,
    weaponId: PROVING_GROUND_WEAPON_ID_V81,
    sessionId: sessionIdV81(state.sessionOrdinal),
    qualified: true,
    score: state.score,
    hits: state.hits,
    targetCount: PROVING_GROUND_TARGETS_V81.length,
    remainingSeconds: state.remainingSeconds,
    bonus: Object.freeze({ nextOperationCharge: true }),
    powerLoaderCertified: false,
    advancedTutorialsComplete: false
  });
}

export function createProvingGroundSessionStateV81(rawState = {}) {
  const raw = rawState && typeof rawState === 'object' ? rawState : {};
  let phase = PHASES_V81.has(raw.phase) ? raw.phase : 'idle';
  const sessionOrdinal = integer(raw.sessionOrdinal, 0, 999999);
  const nextSessionOrdinal = Math.max(sessionOrdinal + 1, integer(raw.nextSessionOrdinal || 1, 1, 1000000));
  if (!sessionOrdinal && phase !== 'idle') phase = 'idle';
  let currentTargetIndex = phase === 'active'
    ? integer(raw.currentTargetIndex, 0, PROVING_GROUND_TARGETS_V81.length - 1)
    : phase === 'completed' || phase === 'failed'
      ? PROVING_GROUND_TARGETS_V81.length
      : -1;
  let targets = canonicalTargetsV81(raw.targets, phase, currentTargetIndex);
  const elapsedSeconds = clamp(raw.elapsedSeconds, 0, PROVING_GROUND_DURATION_SECONDS_V81);
  const remainingSeconds = Math.max(0, PROVING_GROUND_DURATION_SECONDS_V81 - elapsedSeconds);
  const hits = targets.filter((target) => target.status === 'hit').length;
  const shots = integer(Math.max(raw.shots || 0, hits), hits, 9999);
  const laneHits = deriveLaneHitsV81(targets);
  const reloadCount = integer(raw.reloadCount, 0, 999);
  const reloadActive = phase === 'active' && Boolean(raw.reload?.active)
    && Number(raw.reload?.remainingSeconds) > 0;
  const ammo = {
    capacity: PROVING_GROUND_MAGAZINE_CAPACITY_V81,
    magazine: integer(raw.ammo?.magazine ?? PROVING_GROUND_INITIAL_MAGAZINE_V81, 0, PROVING_GROUND_MAGAZINE_CAPACITY_V81),
    reserve: integer(raw.ammo?.reserve ?? PROVING_GROUND_INITIAL_RESERVE_V81, 0, PROVING_GROUND_MAGAZINE_CAPACITY_V81 * 2)
  };
  let score = deriveScoreV81({ hits, shots, remainingSeconds, phase });
  const runQualified = qualifiesV81({ hits, reloadCount, laneHits });
  if (phase === 'completed' && !runQualified) phase = 'failed';
  if (phase === 'failed' && runQualified && currentTargetIndex >= PROVING_GROUND_TARGETS_V81.length) phase = 'completed';
  const claimedReceiptIds = [...new Set((Array.isArray(raw.claimedReceiptIds) ? raw.claimedReceiptIds : [])
    .filter(validReceiptIdV81))].slice(-32);
  const rawQualification = raw.qualification && typeof raw.qualification === 'object'
    ? raw.qualification
    : {};
  const qualification = {
    qualified: Boolean(rawQualification.qualified && validReceiptIdV81(rawQualification.lastReceiptId)),
    bestScore: integer(rawQualification.bestScore, 0, 999999),
    bestHits: integer(rawQualification.bestHits, 0, PROVING_GROUND_TARGETS_V81.length),
    bestRemainingSeconds: clamp(rawQualification.bestRemainingSeconds, 0, PROVING_GROUND_DURATION_SECONDS_V81),
    lastReceiptId: validReceiptIdV81(rawQualification.lastReceiptId) ? rawQualification.lastReceiptId : null
  };
  if (phase === 'completed') {
    const receiptId = receiptIdV81(sessionOrdinal);
    qualification.qualified = true;
    qualification.bestScore = Math.max(qualification.bestScore, score);
    qualification.bestHits = Math.max(qualification.bestHits, hits);
    qualification.bestRemainingSeconds = Math.max(qualification.bestRemainingSeconds, remainingSeconds);
    qualification.lastReceiptId = receiptId;
  }
  if (phase === 'idle' || phase === 'armed' || phase === 'aborted') {
    currentTargetIndex = -1;
    targets = canonicalTargetsV81([], phase, currentTargetIndex);
    score = 0;
  }
  const state = {
    schemaVersion: PROVING_GROUND_SESSION_SCHEMA_V81,
    courseId: PROVING_GROUND_COURSE_ID_V81,
    weaponId: PROVING_GROUND_WEAPON_ID_V81,
    phase,
    sessionOrdinal,
    nextSessionOrdinal,
    sessionId: sessionOrdinal ? sessionIdV81(sessionOrdinal) : null,
    elapsedSeconds,
    remainingSeconds,
    currentTargetIndex,
    targets,
    ammo,
    reload: {
      active: reloadActive,
      remainingSeconds: reloadActive
        ? clamp(raw.reload.remainingSeconds, 0, PROVING_GROUND_RELOAD_SECONDS_V81)
        : 0,
      durationSeconds: PROVING_GROUND_RELOAD_SECONDS_V81
    },
    shots,
    hits,
    missedShots: Math.max(0, shots - hits),
    missedTargets: targets.filter((target) => target.status === 'missed').length,
    reloadCount,
    laneHits,
    score,
    qualification,
    claimedReceiptIds,
    completionReceipt: null
  };
  if (phase === 'completed') state.completionReceipt = clone(createReceiptV81(state));
  return state;
}

export function sanitizeProvingGroundSessionV81(rawState = {}) {
  return createProvingGroundSessionStateV81(rawState);
}

export function armProvingGroundSessionV81(rawState = {}) {
  const previous = createProvingGroundSessionStateV81(rawState);
  const ordinal = previous.nextSessionOrdinal;
  return createProvingGroundSessionStateV81({
    qualification: previous.qualification,
    claimedReceiptIds: previous.claimedReceiptIds,
    sessionOrdinal: ordinal,
    nextSessionOrdinal: ordinal + 1,
    phase: 'armed',
    ammo: {
      magazine: PROVING_GROUND_INITIAL_MAGAZINE_V81,
      reserve: PROVING_GROUND_INITIAL_RESERVE_V81
    }
  });
}

export function beginProvingGroundSessionV81(rawState = {}) {
  const state = createProvingGroundSessionStateV81(rawState);
  if (state.phase !== 'armed') return state;
  const targets = defaultTargetsV81();
  targets[0].status = 'active';
  return createProvingGroundSessionStateV81({
    ...state,
    phase: 'active',
    currentTargetIndex: 0,
    targets,
    elapsedSeconds: 0,
    shots: 0,
    reloadCount: 0,
    ammo: {
      magazine: PROVING_GROUND_INITIAL_MAGAZINE_V81,
      reserve: PROVING_GROUND_INITIAL_RESERVE_V81
    }
  });
}

export function abortProvingGroundSessionV81(rawState = {}) {
  const state = createProvingGroundSessionStateV81(rawState);
  if (!['armed', 'active'].includes(state.phase)) return state;
  return createProvingGroundSessionStateV81({
    ...state,
    phase: 'aborted',
    currentTargetIndex: -1,
    targets: defaultTargetsV81(),
    completionReceipt: null
  });
}

function finalizeProvingGroundSessionV81(rawState) {
  let state = createProvingGroundSessionStateV81(rawState);
  const targets = state.targets.map((target) => ({
    ...target,
    status: target.status === 'hit' ? 'hit' : 'missed'
  }));
  const hits = targets.filter((target) => target.status === 'hit').length;
  const laneHits = deriveLaneHitsV81(targets);
  const qualified = qualifiesV81({ hits, reloadCount: state.reloadCount, laneHits });
  state = createProvingGroundSessionStateV81({
    ...state,
    phase: qualified ? 'completed' : 'failed',
    currentTargetIndex: PROVING_GROUND_TARGETS_V81.length,
    targets,
    reload: { active: false, remainingSeconds: 0 },
    hits,
    laneHits
  });
  return state;
}

function advanceTargetV81(rawState, result) {
  const state = createProvingGroundSessionStateV81(rawState);
  if (state.phase !== 'active') return state;
  const targets = state.targets.map((target) => ({ ...target }));
  const index = state.currentTargetIndex;
  targets[index].status = result === 'hit' ? 'hit' : 'missed';
  const nextIndex = index + 1;
  if (nextIndex >= targets.length) return finalizeProvingGroundSessionV81({
    ...state,
    phase: 'completed',
    targets,
    currentTargetIndex: targets.length
  });
  targets[nextIndex].status = 'active';
  targets[nextIndex].exposureRemaining = PROVING_GROUND_TARGET_EXPOSURE_SECONDS_V81;
  return createProvingGroundSessionStateV81({
    ...state,
    targets,
    currentTargetIndex: nextIndex
  });
}

export function tickProvingGroundSessionV81(rawState = {}, deltaSeconds = 0) {
  let state = createProvingGroundSessionStateV81(rawState);
  if (state.phase !== 'active') return state;
  const delta = clamp(deltaSeconds, 0, 10);
  if (!delta) return state;
  const elapsedSeconds = Math.min(PROVING_GROUND_DURATION_SECONDS_V81, state.elapsedSeconds + delta);
  const reload = { ...state.reload };
  let reloadCount = state.reloadCount;
  const ammo = { ...state.ammo };
  if (reload.active) {
    reload.remainingSeconds = Math.max(0, reload.remainingSeconds - delta);
    if (reload.remainingSeconds <= 0) {
      const load = Math.min(ammo.capacity - ammo.magazine, ammo.reserve);
      ammo.magazine += load;
      ammo.reserve -= load;
      reload.active = false;
      reloadCount += 1;
    }
  }
  const targets = state.targets.map((target) => ({ ...target }));
  targets[state.currentTargetIndex].exposureRemaining = Math.max(
    0,
    targets[state.currentTargetIndex].exposureRemaining - delta
  );
  state = createProvingGroundSessionStateV81({
    ...state,
    elapsedSeconds,
    targets,
    ammo,
    reload,
    reloadCount
  });
  if (elapsedSeconds >= PROVING_GROUND_DURATION_SECONDS_V81) return finalizeProvingGroundSessionV81(state);
  if (state.targets[state.currentTargetIndex].exposureRemaining <= 0.01) return advanceTargetV81(state, 'missed');
  return state;
}

export function requestProvingGroundReloadV81(rawState = {}) {
  const state = createProvingGroundSessionStateV81(rawState);
  if (state.phase !== 'active') return { started: false, reason: 'inactive', state };
  if (state.reload.active) return { started: false, reason: 'already-reloading', state };
  if (state.ammo.reserve <= 0) return { started: false, reason: 'no-reserve', state };
  if (state.ammo.magazine >= state.ammo.capacity) return { started: false, reason: 'magazine-full', state };
  return {
    started: true,
    reason: null,
    state: createProvingGroundSessionStateV81({
      ...state,
      reload: { active: true, remainingSeconds: PROVING_GROUND_RELOAD_SECONDS_V81 }
    })
  };
}

export function fireProvingGroundShotV81(rawState = {}, aim = 'level') {
  const state = createProvingGroundSessionStateV81(rawState);
  if (state.phase !== 'active') return { fired: false, reason: 'inactive', state, shot: null };
  if (state.reload.active) return { fired: false, reason: 'reloading', state, shot: null };
  if (state.ammo.magazine <= 0) return { fired: false, reason: 'empty-magazine', state, shot: null };
  const selectedAim = LANES_V81.has(aim) ? aim : 'level';
  const target = state.targets[state.currentTargetIndex];
  return {
    fired: true,
    reason: null,
    state: createProvingGroundSessionStateV81({
      ...state,
      shots: state.shots + 1,
      ammo: { ...state.ammo, magazine: state.ammo.magazine - 1 }
    }),
    shot: Object.freeze({
      targetId: target.id,
      targetLane: target.lane,
      aim: selectedAim
    })
  };
}

export function registerProvingGroundTargetHitV81(rawState = {}, targetId = null) {
  const state = createProvingGroundSessionStateV81(rawState);
  const target = state.targets[state.currentTargetIndex];
  if (state.phase !== 'active' || !target || target.id !== targetId || target.status !== 'active') {
    return { applied: false, state };
  }
  return { applied: true, state: advanceTargetV81(state, 'hit') };
}

export function getCurrentProvingGroundTargetV81(rawState = {}) {
  const state = createProvingGroundSessionStateV81(rawState);
  return state.phase === 'active' ? clone(state.targets[state.currentTargetIndex]) : null;
}

export function claimProvingGroundCompletionV81(rawState = {}, requestedReceiptId = null) {
  const state = createProvingGroundSessionStateV81(rawState);
  const receipt = state.completionReceipt;
  if (!receipt || state.phase !== 'completed' || requestedReceiptId !== receipt.id) {
    return { applied: false, duplicate: false, reason: 'invalid-receipt', receipt: null, state };
  }
  if (state.claimedReceiptIds.includes(receipt.id)) {
    return { applied: false, duplicate: true, reason: 'already-claimed', receipt: clone(receipt), state };
  }
  return {
    applied: true,
    duplicate: false,
    reason: null,
    receipt: clone(receipt),
    state: createProvingGroundSessionStateV81({
      ...state,
      claimedReceiptIds: [...state.claimedReceiptIds, receipt.id]
    })
  };
}
