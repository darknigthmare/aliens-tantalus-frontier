import { migrateShipAnimalStateV87 } from './ship-animal-state-v87.js';

// Project-authored mobile service rendezvous, never a canonical station or an interstellar route.
export const SHIP_PORT_DEFINITION_V87 = Object.freeze({
  id: 'frontier-civil-relay', name: 'Relais civil de la Frontière',
  provenance: 'original-tantalus', serviceKind: 'local-mobile-rendezvous',
  sectorId: 'current-service-sector', counterRoomId: 'frontier-civil-counter',
  commandRoomId: 'dropship-hangar', shipHubId: 'tantalus', costCredits: 0,
  costLabel: 'Rendez-vous de service local : 0 crédit. Aucun voyage interstellaire.',
  timingLabel: 'Durées de gameplay : approche 8 s, amarrage 6 s, séparation 6 s.'
});
export const SHIP_PORT_TIMING_V87 = Object.freeze({ approachSeconds: 8, dockingSeconds: 6,
  undockingSeconds: 6, maxStepSeconds: 1, minimumHull: 35, minimumPower: 20,
  minimumOxygen: 35, minimumQuarantine: 40 });
export const SHIP_PORT_PHASES_V87 = Object.freeze(['undocked', 'approach', 'docking', 'docked', 'undocking', 'departed']);
const PORT = SHIP_PORT_DEFINITION_V87;
const TIMING = SHIP_PORT_TIMING_V87;
const record = value => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const finite = value => typeof value === 'number' && Number.isFinite(value);
const nonnegative = value => finite(value) && value >= 0;
const integer = value => Number.isSafeInteger(value) && value >= 0;
const own = (value, key) => Boolean(value && Object.hasOwn(value, key));
const clone = value => structuredClone(value);
const id = value => typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9:._-]{0,95}$/.test(value)
  && !['constructor', 'prototype', '__proto__'].includes(value);
const moving = phase => ['approach', 'docking', 'undocking'].includes(phase);
const duration = phase => TIMING[`${phase}Seconds`] || 0;
const round = number => Math.round(number * 1e9) / 1e9;

export function createShipPortStateV87() {
  return { schema: 1, revision: 0, phase: 'undocked', portId: null, sectorId: null,
    position: { kind: 'unresolved' }, sessionId: null, authorization: null,
    elapsedSeconds: 0, durationSeconds: 0, lastSimulationTime: 0, lastStep: null,
    commands: {}, quarantined: [], diagnostics: [] };
}

function validAuthorization(value) {
  return record(value) && value.granted === true && value.portId === PORT.id
    && value.sectorId === PORT.sectorId && nonnegative(value.campaignHours);
}
function validCommand(value, key) {
  return id(key) && record(value) && value.transactionId === key
    && ['dock', 'undock', 'abort'].includes(value.action) && value.portId === PORT.id
    && id(value.sessionId) && integer(value.revision) && value.costCredits === 0;
}
function validState(raw) {
  if (!record(raw) || raw.schema !== 1 || !integer(raw.revision)
    || !SHIP_PORT_PHASES_V87.includes(raw.phase) || !nonnegative(raw.elapsedSeconds)
    || raw.durationSeconds !== duration(raw.phase) || !nonnegative(raw.lastSimulationTime)
    || !record(raw.commands) || !Object.entries(raw.commands).every(([key, value]) => validCommand(value, key))
    || !Array.isArray(raw.quarantined) || !Array.isArray(raw.diagnostics)
    || !raw.quarantined.every(entry => record(entry) && typeof entry.path === 'string' && typeof entry.code === 'string')
    || !raw.diagnostics.every(entry => record(entry) && typeof entry.path === 'string' && typeof entry.code === 'string')) return false;
  if (moving(raw.phase) ? raw.elapsedSeconds >= raw.durationSeconds : raw.elapsedSeconds !== 0) return false;
  if (raw.lastStep !== null && (!record(raw.lastStep) || !nonnegative(raw.lastStep.simulationTime)
    || raw.lastStep.simulationTime !== raw.lastSimulationTime || !nonnegative(raw.lastStep.dtSeconds))) return false;
  if (['undocked', 'departed'].includes(raw.phase)) return raw.portId === null && raw.sectorId === null
    && raw.sessionId === null && raw.authorization === null && raw.position?.kind === 'unresolved';
  const receipt = raw.commands[raw.sessionId];
  return raw.portId === PORT.id && raw.sectorId === PORT.sectorId && id(raw.sessionId)
    && validAuthorization(raw.authorization) && raw.position?.kind === 'local-rendezvous-declared'
    && raw.position.sectorId === PORT.sectorId && raw.position.portId === PORT.id
    && receipt?.action === 'dock' && receipt.sessionId === raw.sessionId;
}

/** Preserve future schemas and quarantine corrupt source bytes instead of inventing a docked position. */
export function migrateShipPortStateV87(raw) {
  if (raw === undefined || raw === null) return createShipPortStateV87();
  if (record(raw) && Number.isInteger(raw.schema) && raw.schema > 1) return clone(raw);
  if (validState(raw)) return clone(raw);
  const state = createShipPortStateV87();
  state.quarantined.push({ path: 'shipPortV1', code: 'invalid-port-state', original: clone(raw) });
  state.diagnostics.push({ path: 'shipPortV1', code: 'invalid-port-state' });
  return state;
}

function failure(save, code, details = {}) { return { ok: false, code, changed: false, save: clone(save), ...details }; }
function load(save) {
  const state = migrateShipPortStateV87(save?.shipPortV1);
  return { state, error: state.schema !== 1 ? 'unsupported-schema' : state.quarantined.length ? 'state-needs-review' : null };
}
function campaignHours(save) {
  return integer(save?.clock?.day) && save.clock.day >= 1 && nonnegative(save.clock.hour) && save.clock.hour < 24
    ? (save.clock.day - 1) * 24 + save.clock.hour : null;
}
function inactive(context) { return context.paused === true || context.dialogueOpen === true; }
function safetyCode(save, context) {
  if (save.needsPlayerCreationV84 === true || (save.onboardingV84 && save.onboardingV84.phase !== 'complete')) return 'onboarding-incomplete';
  if (!record(save.strategy) || save.strategy.currentOperation != null || save.scene === 'mission' || context.missionActive === true) return 'mission-active';
  if (!record(save.hub) || save.hub.activeCrisis && save.hub.activeCrisis.resolved !== true || context.crisisActive === true) return 'crisis-active';
  if (save.hub.infestationChain && save.hub.infestationChain.resolved !== true) return 'infestation-active';
  if (context.confinementActive === true || save.bioforgeV80?.recovery?.purgeRequired === true
    || save.bioforgeV80?.activeSession && save.bioforgeV80.activeSession.phase !== 'return') return 'confinement-active';
  const systems = save.hub.systems;
  if (!record(systems) || !['hull', 'power', 'oxygen', 'quarantine'].every(key => finite(systems[key]) && systems[key] >= 0 && systems[key] <= 100)
    || systems.hull < TIMING.minimumHull || systems.power < TIMING.minimumPower || systems.oxygen < TIMING.minimumOxygen) return 'ship-integrity-unsafe';
  if (systems.quarantine < TIMING.minimumQuarantine) return 'confinement-unsafe';
  const animals = migrateShipAnimalStateV87(save.shipAnimalsV1);
  if (animals.schema !== 1 || animals.quarantined.length) return 'animal-manifest-needs-review';
  if (context.careReady !== true) return 'care-check-required';
  if (context.manifestReady !== true) return 'manifest-check-required';
  return null;
}

/** Separate from docked presence: callers can close entry/purchases during danger while keeping an exit possible. */
export function getShipPortSafetyCodeV87(save, context = {}) {
  if (!record(save) || !record(context)) return 'invalid-request';
  const { error } = load(save);
  if (error) return error;
  if (inactive(context)) return 'simulation-paused';
  return safetyCode(save, context);
}
function replay(save, state, request, action) {
  if (!own(state.commands, request.transactionId)) return null;
  const receipt = state.commands[request.transactionId];
  if (receipt.action !== action || (request.portId !== undefined && request.portId !== receipt.portId)) return failure(save, 'transaction-conflict');
  return { ok: true, code: 'already-applied', changed: false, save: clone(save), receipt: clone(receipt) };
}
function prepare(save, request, context, action) {
  if (!record(save) || !record(request) || !record(context) || !id(request.transactionId)
    || (request.portId !== undefined && request.portId !== PORT.id)) return { result: failure(save, 'invalid-request') };
  const { state, error } = load(save);
  if (error) return { result: failure(save, error) };
  const repeated = replay(save, state, request, action);
  if (repeated) return { result: repeated };
  if (inactive(context)) return { result: failure(save, 'simulation-paused') };
  if (!integer(state.revision + 1)) return { result: failure(save, 'invalid-revision') };
  return { state };
}
function finish(save, state, code, receipt = null) {
  const candidate = clone(save);
  candidate.shipPortV1 = state;
  return { ok: true, code, changed: true, save: candidate, state: clone(state), ...(receipt ? { receipt: clone(receipt) } : {}) };
}
function recordCommand(state, request, action) {
  state.revision += 1;
  const receipt = { transactionId: request.transactionId, action, portId: PORT.id,
    sessionId: state.sessionId, costCredits: 0, revision: state.revision };
  state.commands[request.transactionId] = receipt;
  return receipt;
}
function clearPosition(state, phase) {
  Object.assign(state, { phase, portId: null, sectorId: null, position: { kind: 'unresolved' },
    sessionId: null, authorization: null, elapsedSeconds: 0, durationSeconds: 0 });
}

/** Caller must commit result.save atomically before displaying access or advancing the physical room. */
export function requestShipPortDockV87(save, request = {}, context = {}) {
  const prepared = prepare(save, request, context, 'dock');
  if (prepared.result) return prepared.result;
  const { state } = prepared;
  if (!['undocked', 'departed'].includes(state.phase)) return failure(save, 'invalid-phase');
  const blocked = safetyCode(save, context);
  if (blocked) return failure(save, blocked);
  if (context.physical?.roomId !== PORT.commandRoomId) return failure(save, 'hangar-command-required');
  const hours = campaignHours(save);
  if (hours === null || !validAuthorization(context.authorization)
    || Math.abs(context.authorization.campaignHours - hours) > 1e-7) return failure(save, 'authorization-required');
  // sectorId is a declared local service scope; no world selection is converted into a ship location.
  Object.assign(state, { phase: 'approach', portId: PORT.id, sectorId: PORT.sectorId,
    position: { kind: 'local-rendezvous-declared', sectorId: PORT.sectorId, portId: PORT.id },
    sessionId: request.transactionId, authorization: clone(context.authorization), elapsedSeconds: 0,
    durationSeconds: TIMING.approachSeconds });
  const receipt = recordCommand(state, request, 'dock');
  return finish(save, state, 'approach-requested', receipt);
}

/** All acquired companions must be aboard; unfinished intake/acclimation is a transfer, not a resident. */
export function validateShipPortDepartureV87(save, context = {}) {
  if (!record(save) || !record(context)) return { ok: false, code: 'invalid-request' };
  if (context.physical?.roomId === PORT.counterRoomId) return { ok: false, code: 'player-at-counter' };
  if (context.playerInTransfer === true || context.transferPending === true) return { ok: false, code: 'transfer-incomplete' };
  const animals = migrateShipAnimalStateV87(save.shipAnimalsV1);
  if (animals.schema !== 1 || animals.quarantined.length) return { ok: false, code: 'animal-manifest-needs-review' };
  for (const animal of Object.values(animals.animals)) {
    if (['transit', 'intake', 'acclimating'].includes(animal.location.kind)) return { ok: false, code: 'animal-transfer-incomplete', animalId: animal.id };
    if (animal.location.hubId !== PORT.shipHubId) return { ok: false, code: 'animal-off-ship', animalId: animal.id };
  }
  return { ok: true, code: 'departure-clear' };
}

export function requestShipPortUndockV87(save, request = {}, context = {}) {
  const prepared = prepare(save, request, context, 'undock');
  if (prepared.result) return prepared.result;
  const { state } = prepared;
  if (state.phase !== 'docked') return failure(save, 'invalid-phase');
  const departure = validateShipPortDepartureV87(save, context);
  if (!departure.ok) return failure(save, departure.code, departure.animalId ? { animalId: departure.animalId } : {});
  const blocked = safetyCode(save, context);
  if (blocked) return failure(save, blocked);
  if (context.physical?.roomId !== PORT.commandRoomId) return failure(save, 'hangar-command-required');
  state.phase = 'undocking'; state.elapsedSeconds = 0; state.durationSeconds = TIMING.undockingSeconds;
  const receipt = recordCommand(state, request, 'undock');
  return finish(save, state, 'undocking-requested', receipt);
}

export function abortShipPortDockV87(save, request = {}, context = {}) {
  const prepared = prepare(save, request, context, 'abort');
  if (prepared.result) return prepared.result;
  const { state } = prepared;
  if (!['approach', 'docking'].includes(state.phase)) return failure(save, 'invalid-phase');
  if (context.physical?.roomId !== PORT.commandRoomId) return failure(save, 'hangar-command-required');
  const receipt = recordCommand(state, request, 'abort');
  clearPosition(state, 'undocked');
  return finish(save, state, 'approach-aborted', receipt);
}

/** Only caller-supplied active simulation seconds advance. Large frame gaps contribute at most one second. */
export function stepShipPortV87(save, step = {}, context = {}) {
  if (!record(save) || !record(step) || !record(context) || !nonnegative(step.simulationTime) || !nonnegative(step.dtSeconds)) return failure(save, 'invalid-step');
  const { state, error } = load(save);
  if (error) return failure(save, error);
  if (state.lastStep?.simulationTime === step.simulationTime) {
    if (state.lastStep.dtSeconds !== step.dtSeconds) return failure(save, 'step-conflict');
    return { ok: true, code: 'already-applied', changed: false, save: clone(save) };
  }
  if (step.simulationTime < state.lastSimulationTime || step.dtSeconds > step.simulationTime - state.lastSimulationTime + 1e-7) return failure(save, 'invalid-simulation-time');
  if (inactive(context) || !moving(state.phase) || step.dtSeconds === 0) return { ok: true, code: inactive(context) ? 'simulation-paused' : 'no-progress', changed: false, save: clone(save) };
  const blocked = safetyCode(save, context);
  if (blocked) return failure(save, blocked);
  if (context.authorization?.granted === false) return failure(save, 'authorization-revoked');
  if (state.phase === 'undocking') {
    const departure = validateShipPortDepartureV87(save, context);
    if (!departure.ok) return failure(save, departure.code);
  }
  if (!integer(state.revision + 1)) return failure(save, 'invalid-revision');
  let remaining = Math.min(step.dtSeconds, TIMING.maxStepSeconds);
  while (remaining > 0 && moving(state.phase)) {
    const amount = Math.min(remaining, state.durationSeconds - state.elapsedSeconds);
    state.elapsedSeconds = round(state.elapsedSeconds + amount);
    remaining = round(remaining - amount);
    if (state.elapsedSeconds >= state.durationSeconds) {
      if (state.phase === 'undocking') clearPosition(state, 'departed');
      else {
        state.phase = state.phase === 'approach' ? 'docking' : 'docked';
        state.elapsedSeconds = 0; state.durationSeconds = duration(state.phase);
      }
    }
  }
  state.lastSimulationTime = step.simulationTime;
  state.lastStep = { simulationTime: step.simulationTime, dtSeconds: step.dtSeconds };
  state.revision += 1;
  return finish(save, state, state.phase === 'docked' ? 'docked' : state.phase === 'departed' ? 'departed' : 'progressed');
}

export function canAccessPortCounterV87(save) {
  if (!record(save)) return false;
  const { state, error } = load(save);
  return !error && state.phase === 'docked' && state.portId === PORT.id && state.sectorId === PORT.sectorId;
}
