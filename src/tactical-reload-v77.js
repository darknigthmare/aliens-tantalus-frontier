export const TACTICAL_RELOAD_SCHEMA_V77 = 1;
export const TACTICAL_RELOAD_PRESENTATION_V77 = Object.freeze({
  dedicatedBranchAnimations: false,
  sharedReloadSheet: 'player.echo9-marine.combat', sharedReloadClip: 'reload',
  identityFallbackSheet: 'player.echo9-marine.locomotion', identityFallbackClip: 'idle'
});

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
const finite = (value) => typeof value === 'number' && Number.isFinite(value);
const rounds = (value) => finite(value) ? Math.max(0, Math.floor(value)) : 0;
const record = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value) => typeof value === 'string' ? value.slice(0, 160) : '';
const RESULTS = new Set(['normal', 'success', 'perfect', 'failed']);
const FEEDBACK_SECONDS = 0.7;

// Normalized windows are fixed per weapon family; simulation uses seconds, never wall time.
const definitions = {
  sidearm: { duration: 1.1, success: [0.36, 0.68], perfect: [0.48, 0.56], fail: 0.4 },
  rifle: { duration: 1.45, success: [0.4, 0.7], perfect: [0.51, 0.58], fail: 0.5 },
  shotgun: { duration: 1.85, success: [0.43, 0.72], perfect: [0.55, 0.61], fail: 0.6 },
  smartgun: { duration: 2.3, success: [0.46, 0.73], perfect: [0.58, 0.63], fail: 0.75 },
  launcher: { duration: 2.5, success: [0.48, 0.76], perfect: [0.6, 0.65], fail: 0.85 },
  tank: { duration: 2.1, success: [0.44, 0.73], perfect: [0.56, 0.62], fail: 0.7 },
  energy: { duration: 1.8, success: [0.42, 0.7], perfect: [0.53, 0.59], fail: 0.65 }
};
export const TACTICAL_RELOAD_FAMILIES_V77 = Object.freeze(Object.fromEntries(
  Object.entries(definitions).map(([key, value]) => [key, Object.freeze({
    ...value, success: Object.freeze(value.success), perfect: Object.freeze(value.perfect)
  })])
));

function weaponIdentity(actor, weapon) {
  const candidate = weapon ?? actor?.weaponMode ?? 'sidearm';
  return text(typeof candidate === 'string' ? candidate : candidate.id || candidate.name || actor?.weaponMode);
}

/** Pass the equipped weapon descriptor (id/name/family/reload), or its runtime mode. */
export function getTacticalReloadProfileV77(weapon = 'sidearm') {
  const descriptor = record(weapon) ? weapon : { name: weapon };
  const name = `${descriptor.id || ''} ${descriptor.name || ''}`.toLowerCase();
  const family = String(descriptor.family || '').toLowerCase();
  if (['melee', 'tool', 'sentry'].includes(family) || /neuro-melee|wrist-blades|combat-knife|combi-stick/.test(name)) return null;
  let key = Object.hasOwn(TACTICAL_RELOAD_FAMILIES_V77, family) ? family
    : Object.hasOwn(TACTICAL_RELOAD_FAMILIES_V77, name.trim()) ? name.trim() : 'rifle';
  if (/sidearm|pistol|revolver|magnum/.test(name)) key = 'sidearm';
  else if (/shotgun/.test(name)) key = 'shotgun';
  else if (family === 'smart' || /smartgun/.test(name)) key = 'smartgun';
  else if (family === 'explosive' || /launcher|sadar|rpg/.test(name)) key = 'launcher';
  else if (['flame', 'acid', 'chemical', 'cryo'].includes(family) || /incinerator/.test(name)) key = 'tank';
  else if (['energy', 'electric', 'sonic'].includes(family)) key = 'energy';
  const definition = TACTICAL_RELOAD_FAMILIES_V77[key];
  const duration = finite(descriptor.reload) ? clamp(descriptor.reload, 0.35, 12) : definition.duration;
  return {
    family: key,
    duration,
    successWindow: [...definition.success], perfectWindow: [...definition.perfect],
    successFactor: 0.82, perfectFactor: 0.7, failedDelay: definition.fail,
    recovery: Math.min(0.12, duration * 0.2), perfectBonusRounds: 3, perfectBonusMultiplier: 1.15
  };
}

function syncActor(actor) {
  const state = actor.tacticalReload;
  actor.reloading = state?.phase === 'reloading';
  actor.reloadClock = actor.reloading ? Math.max(0, state.completeAt - state.elapsed) : 0;
}

function interruptionReason(actor, state, weapon) {
  if (actor.alive === false || actor.downed) return 'incapacitated';
  if (actor.ventTransit) return 'vent-transit';
  if (actor.inVehicle) return 'vehicle';
  if (text(actor.weaponMode) !== state.weaponMode || rounds(actor.magazineSize) !== state.magazineSize) return 'weapon-changed';
  if (weapon !== null && weapon !== undefined && weaponIdentity(actor, weapon) !== state.weaponKey) return 'weapon-changed';
  return null;
}

export function startTacticalReloadV77(actor, weapon = null, { paused = false } = {}) {
  if (!actor || paused || actor.alive === false || actor.downed || actor.inVehicle || actor.ventTransit || actor.tacticalReload?.phase === 'reloading') return false;
  const profile = getTacticalReloadProfileV77(weapon ?? actor.weaponMode);
  const magazineSize = rounds(actor.magazineSize);
  if (!profile || magazineSize < 1 || magazineSize > 99999 || rounds(actor.ammo) >= magazineSize || rounds(actor.ammoReserve) < 1) return false;
  actor.tacticalReload = {
    schema: TACTICAL_RELOAD_SCHEMA_V77, weaponKey: weaponIdentity(actor, weapon), weaponMode: text(actor.weaponMode),
    magazineSize, profile, phase: 'reloading', result: 'normal', elapsed: 0,
    completeAt: profile.duration, attemptAt: null, transferred: false, roundsLoaded: 0,
    bonusRemaining: 0, feedbackRemaining: 0, cancelReason: null
  };
  syncActor(actor);
  return true;
}

function resultAt(profile, elapsed) {
  const inside = ([start, end]) => elapsed >= start * profile.duration && elapsed <= end * profile.duration;
  return inside(profile.perfectWindow) ? 'perfect' : inside(profile.successWindow) ? 'success' : 'failed';
}

function completionAt(profile, result, attemptAt) {
  if (result === 'normal') return profile.duration;
  if (result === 'failed') return Math.max(profile.duration + profile.failedDelay, attemptAt + profile.recovery);
  const factor = result === 'perfect' ? profile.perfectFactor : profile.successFactor;
  return Math.max(profile.duration * factor, attemptAt + profile.recovery);
}

/** Route input edges here, not held buttons. The second edge consumes the only attempt. */
export function pressTacticalReloadV77(actor, weapon = null, { paused = false } = {}) {
  if (!actor || paused) return false;
  const state = actor.tacticalReload;
  if (state?.phase !== 'reloading') return startTacticalReloadV77(actor, weapon);
  const reason = interruptionReason(actor, state, weapon);
  if (reason) { cancelTacticalReloadV77(actor, reason); return false; }
  if (state.attemptAt !== null || state.elapsed >= state.completeAt) return false;
  state.attemptAt = state.elapsed;
  state.result = resultAt(state.profile, state.elapsed);
  state.completeAt = completionAt(state.profile, state.result, state.attemptAt);
  syncActor(actor);
  return true;
}

/** Cancellation never moves ammunition. Also clears any remaining perfect rounds. */
export function cancelTacticalReloadV77(actor, reason = 'interrupted') {
  if (!actor?.tacticalReload) return false;
  const state = actor.tacticalReload;
  state.bonusRemaining = 0;
  if (state.phase !== 'reloading') return false;
  state.phase = 'cancelled';
  state.cancelReason = text(reason) || 'interrupted';
  state.feedbackRemaining = FEEDBACK_SECONDS;
  syncActor(actor);
  return true;
}

/** Returns one completion/cancellation event. Paused updates and invalid deltas do no work. */
export function updateTacticalReloadV77(actor, delta, { paused = false, weapon = null } = {}) {
  const state = actor?.tacticalReload;
  if (!state || paused || !finite(delta) || delta < 0) return null;
  const reason = interruptionReason(actor, state, weapon);
  if (reason) {
    const cancelled = cancelTacticalReloadV77(actor, reason);
    if (cancelled) return { type: 'cancelled', reason, result: state.result, loaded: 0 };
  }
  if (state.phase !== 'reloading') {
    state.feedbackRemaining = Math.max(0, state.feedbackRemaining - delta);
    return null;
  }
  const next = state.elapsed + delta;
  state.elapsed = Math.min(next, state.completeAt);
  if (next < state.completeAt) { syncActor(actor); return null; }
  // Inventory mutation and transfer marker belong to the same synchronous transaction.
  const loaded = Math.min(Math.max(0, state.magazineSize - rounds(actor.ammo)), rounds(actor.ammoReserve));
  actor.ammo = rounds(actor.ammo) + loaded;
  actor.ammoReserve = rounds(actor.ammoReserve) - loaded;
  state.transferred = true;
  state.roundsLoaded = loaded;
  state.phase = 'complete';
  state.bonusRemaining = state.result === 'perfect' ? Math.min(loaded, state.profile.perfectBonusRounds) : 0;
  state.feedbackRemaining = Math.max(0, FEEDBACK_SECONDS - (next - state.completeAt));
  syncActor(actor);
  return { type: 'complete', result: state.result, loaded };
}

/** Call only after a shot has been accepted and its round spent; never on a dry trigger. */
export function consumeTacticalReloadBonusV77(actor, weapon = null) {
  const state = actor?.tacticalReload;
  if (!state || state.phase !== 'complete' || state.result !== 'perfect' || state.bonusRemaining <= 0) return 1;
  if (interruptionReason(actor, state, weapon)) { state.bonusRemaining = 0; return 1; }
  state.bonusRemaining -= 1;
  return state.profile.perfectBonusMultiplier;
}

const clone = (value) => JSON.parse(JSON.stringify(value));
export function captureTacticalReloadV77(actor) {
  return actor?.tacticalReload ? clone(actor.tacticalReload) : null;
}

function validSnapshot(state) {
  if (!record(state) || state.schema !== TACTICAL_RELOAD_SCHEMA_V77 || !record(state.profile)) return false;
  const profile = state.profile;
  const definition = Object.hasOwn(TACTICAL_RELOAD_FAMILIES_V77, profile.family) ? TACTICAL_RELOAD_FAMILIES_V77[profile.family] : null;
  if (!definition || !finite(profile.duration) || profile.duration < 0.35 || profile.duration > 12) return false;
  const exactWindow = (a, b) => Array.isArray(a) && a.length === 2 && a.every((value, index) => value === b[index]);
  if (!exactWindow(profile.successWindow, definition.success) || !exactWindow(profile.perfectWindow, definition.perfect)) return false;
  if (profile.successFactor !== 0.82 || profile.perfectFactor !== 0.7 || profile.failedDelay !== definition.fail || profile.recovery !== Math.min(0.12, profile.duration * 0.2) || profile.perfectBonusRounds !== 3 || profile.perfectBonusMultiplier !== 1.15) return false;
  if (!['reloading', 'complete', 'cancelled'].includes(state.phase) || !RESULTS.has(state.result)) return false;
  if (!state.weaponKey || state.weaponKey !== text(state.weaponKey) || state.weaponMode !== text(state.weaponMode)) return false;
  if (!Number.isInteger(state.magazineSize) || state.magazineSize < 1 || state.magazineSize > 99999) return false;
  if (!finite(state.elapsed) || !finite(state.completeAt) || state.elapsed < 0 || state.elapsed > state.completeAt) return false;
  if (state.attemptAt !== null && (!finite(state.attemptAt) || state.attemptAt < 0 || state.attemptAt >= profile.duration || state.attemptAt > state.elapsed)) return false;
  if (state.result !== (state.attemptAt === null ? 'normal' : resultAt(profile, state.attemptAt))) return false;
  if (state.completeAt !== completionAt(profile, state.result, state.attemptAt)) return false;
  if (!finite(state.feedbackRemaining) || state.feedbackRemaining < 0 || state.feedbackRemaining > FEEDBACK_SECONDS) return false;
  if (!Number.isInteger(state.roundsLoaded) || state.roundsLoaded < 0 || state.roundsLoaded > state.magazineSize) return false;
  if (!Number.isInteger(state.bonusRemaining) || state.bonusRemaining < 0 || state.bonusRemaining > Math.min(state.roundsLoaded, profile.perfectBonusRounds)) return false;
  if (state.bonusRemaining && (state.phase !== 'complete' || state.result !== 'perfect')) return false;
  if (state.phase === 'complete') return state.transferred === true && state.elapsed === state.completeAt && state.cancelReason === null;
  if (state.transferred !== false || state.roundsLoaded !== 0 || state.bonusRemaining !== 0) return false;
  return state.phase === 'cancelled'
    ? typeof state.cancelReason === 'string' && state.cancelReason.length > 0 && state.cancelReason.length <= 160
    : state.cancelReason === null && state.elapsed < state.completeAt && state.feedbackRemaining === 0;
}

/** Restore inventory first. This restores the clock/attempt/bonus only, never ammunition. */
export function restoreTacticalReloadV77(actor, snapshot, weapon = null) {
  if (!actor) return false;
  const valid = validSnapshot(snapshot) && (snapshot.phase === 'cancelled' || !interruptionReason(actor, snapshot, weapon));
  actor.tacticalReload = valid ? clone(snapshot) : null;
  syncActor(actor);
  return Boolean(valid);
}

export function getTacticalReloadHudV77(actor) {
  const state = actor?.tacticalReload;
  if (!state) return { visible: false, phase: 'idle', animation: null, bonusRemaining: 0 };
  const active = state.phase === 'reloading';
  const animation = state.phase === 'cancelled' ? 'reload_cancel'
    : state.attemptAt === null && active && state.elapsed < state.profile.recovery ? 'reload_start'
      : `reload_${state.result === 'failed' ? 'fail_recover' : state.result}`;
  const label = state.phase === 'cancelled' ? 'Rechargement interrompu'
    : { normal: 'Rechargement', success: 'Rechargement réussi', perfect: 'Rechargement parfait', failed: 'Récupération du chargeur' }[state.result];
  return {
    visible: active || state.feedbackRemaining > 0, phase: state.phase, result: state.result,
    label, animation, weaponKey: state.weaponKey, family: state.profile.family,
    cursor: clamp(state.elapsed / state.profile.duration, 0, 1),
    progress: clamp(state.elapsed / state.completeAt, 0, 1), remaining: active ? state.completeAt - state.elapsed : 0,
    successWindow: [...state.profile.successWindow], perfectWindow: [...state.profile.perfectWindow],
    attempted: state.attemptAt !== null, attemptCursor: state.attemptAt === null ? null : state.attemptAt / state.profile.duration,
    canAttempt: active && state.attemptAt === null, bonusRemaining: state.bonusRemaining,
    bonusMultiplier: state.bonusRemaining > 0 ? state.profile.perfectBonusMultiplier : 1,
    cancelReason: state.cancelReason
  };
}
