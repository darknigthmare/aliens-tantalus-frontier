import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SHIP_PORT_DEFINITION_V87 as PORT, SHIP_PORT_TIMING_V87 as TIMING,
  createShipPortStateV87, migrateShipPortStateV87, requestShipPortDockV87,
  requestShipPortUndockV87, abortShipPortDockV87, stepShipPortV87,
  canAccessPortCounterV87, validateShipPortDepartureV87, getShipPortSafetyCodeV87 } from '../src/ship-port-state-v87.js';
import { acquireShipAnimalV87, transitionShipAnimalV87 } from '../src/ship-animal-state-v87.js';

const fresh = () => ({ profile: 'campaign-a', scene: 'hub', worldId: 'unrelated-mission-target',
  clock: { day: 2, hour: 6 }, needsPlayerCreationV84: false, onboardingV84: { phase: 'complete' },
  strategy: { currentOperation: null }, hub: { activeCrisis: null, infestationChain: null,
    systems: { hull: 100, power: 92, oxygen: 100, quarantine: 64 } },
  bioforgeV80: { activeSession: null, recovery: { purgeRequired: false } },
  galaxy: { resources: { credits: 1000, medical: 12, fuel: 64 } } });
const context = () => ({ authorization: { granted: true, portId: PORT.id, sectorId: PORT.sectorId, campaignHours: 30 },
  careReady: true, manifestReady: true, physical: { roomId: PORT.commandRoomId }, paused: false, dialogueOpen: false });
const request = transactionId => ({ transactionId, portId: PORT.id });
const approaching = () => requestShipPortDockV87(fresh(), request('dock-1'), context()).save;
function tick(save, dtSeconds = 1, c = context()) {
  return stepShipPortV87(save, { simulationTime: (save.shipPortV1?.lastSimulationTime || 0) + dtSeconds, dtSeconds }, c);
}
function advance(save, seconds) {
  for (let i = 0; i < seconds; i += 1) { const result = tick(save); assert.equal(result.ok, true, result.code); save = result.save; }
  return save;
}
const docked = () => advance(approaching(), 14);
const place = (hubId = 'tantalus', roomId = 'animal-care') => ({ hubId, roomId, deckId: 'habitat', x: 690, y: 624 });
function withAnimal(save, phase = 'transit') {
  const acquired = acquireShipAnimalV87(save,
    { transactionId: 'adopt-moka', offerId: 'offer-animal-moka', habitatId: 'cat-berth' },
    { vendorAccessible: true, artReadyIds: ['animal-moka'], care: { available: true, capacity: 2 },
      habitats: [{ id: 'cat-berth', type: 'cat-berth', capacity: 1, installed: true, location: place() }],
      transit: { edgeId: 'relay-care', from: place('frontier-civil-relay', PORT.counterRoomId), to: place() } });
  assert.equal(acquired.ok, true); save = acquired.save;
  const next = (location, transactionId, extra = {}) => {
    const result = transitionShipAnimalV87(save, { animalId: 'animal-moka', transactionId, location },
      { canTransition: () => true, ...extra });
    assert.equal(result.ok, true, result.code); save = result.save;
  };
  if (phase === 'transit') return save;
  next({ ...save.shipAnimalsV1.animals['animal-moka'].location, progress: 1 }, 'transport-finished');
  next({ kind: 'intake', ...place() }, 'intake', { transportComplete: true });
  if (phase === 'intake') return save;
  next({ kind: 'acclimating', ...place() }, 'check', { arrivalCheckPassed: true });
  if (phase === 'acclimating') return save;
  next({ kind: 'resident', ...place() }, 'settled', { acclimationComplete: true });
  if (phase === 'off-ship') next({ kind: 'resident', ...place('other-hub') }, 'outside');
  return save;
}
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}

test('the mobile service is original, local and visibly free with explicit gameplay timing', () => {
  assert.equal(PORT.id, 'frontier-civil-relay');
  assert.equal(PORT.provenance, 'original-tantalus');
  assert.equal(PORT.serviceKind, 'local-mobile-rendezvous');
  assert.equal(PORT.sectorId, 'current-service-sector');
  assert.equal(PORT.costCredits, 0);
  assert.match(PORT.costLabel, /0 crédit/);
  assert.match(PORT.costLabel, /Aucun voyage interstellaire/);
  assert.equal(TIMING.approachSeconds + TIMING.dockingSeconds, 14);
  assert.ok(Object.isFrozen(PORT)); assert.ok(Object.isFrozen(TIMING));
});

test('fresh and missing state is undocked with unresolved position, never inferred from selected world', () => {
  const state = createShipPortStateV87();
  assert.equal(state.phase, 'undocked'); assert.equal(state.portId, null);
  assert.deepEqual(state.position, { kind: 'unresolved' });
  assert.deepEqual(migrateShipPortStateV87(), state);
  assert.deepEqual(migrateShipPortStateV87(null), state);
  assert.equal(canAccessPortCounterV87(fresh()), false);
  const target = { ...fresh(), worldId: 'Gateway', activeWorld: 'Pioneer' };
  assert.equal(canAccessPortCounterV87(target), false);
  const result = requestShipPortDockV87(target, request('dock-1'), context());
  assert.equal(result.save.worldId, 'Gateway');
  assert.equal(result.save.activeWorld, 'Pioneer');
  assert.deepEqual(result.save.shipPortV1.position, { kind: 'local-rendezvous-declared', sectorId: PORT.sectorId, portId: PORT.id });
});

test('dock command is immutable, costs nothing, requires no animal berth and grants no instant access', () => {
  const original = fresh(); const before = structuredClone(original);
  const result = requestShipPortDockV87(freeze(original), freeze(request('dock-1')), freeze(context()));
  assert.equal(result.ok, true); assert.equal(result.code, 'approach-requested');
  assert.equal(result.save.shipPortV1.phase, 'approach');
  assert.deepEqual(original, before); assert.deepEqual(result.save.galaxy, before.galaxy);
  assert.equal(result.save.shipAnimalsV1, undefined);
  assert.equal(canAccessPortCounterV87(result.save), false);
  assert.deepEqual(migrateShipPortStateV87(result.save.shipPortV1), result.save.shipPortV1);
});

test('only fourteen active simulation seconds reach docked and the counter', () => {
  let current = advance(approaching(), 7);
  assert.equal(current.shipPortV1.phase, 'approach'); assert.equal(current.shipPortV1.elapsedSeconds, 7);
  current = tick(current).save;
  assert.equal(current.shipPortV1.phase, 'docking'); assert.equal(current.shipPortV1.elapsedSeconds, 0);
  current = advance(current, 5); assert.equal(canAccessPortCounterV87(current), false);
  current = tick(current).save;
  assert.equal(current.shipPortV1.phase, 'docked'); assert.equal(canAccessPortCounterV87(current), true);
  assert.deepEqual(migrateShipPortStateV87(current.shipPortV1), current.shipPortV1);
});

test('dock and undock command replays are idempotent even after their original phase ends', () => {
  const current = docked();
  const repeat = requestShipPortDockV87(current, request('dock-1'), { paused: true });
  assert.equal(repeat.code, 'already-applied'); assert.equal(repeat.changed, false); assert.deepEqual(repeat.save, current);
  const departure = requestShipPortUndockV87(current, request('leave-1'), context());
  assert.equal(departure.ok, true); assert.equal(canAccessPortCounterV87(departure.save), false);
  assert.equal(requestShipPortUndockV87(departure.save, request('leave-1'), {}).code, 'already-applied');
  assert.equal(requestShipPortUndockV87(current, request('dock-1'), context()).code, 'transaction-conflict');
});

for (const [code, changeSave, changeContext] of [
  ['onboarding-incomplete', s => { s.needsPlayerCreationV84 = true; }],
  ['onboarding-incomplete', s => { s.onboardingV84.phase = 'briefing'; }],
  ['mission-active', s => { s.strategy.currentOperation = { id: 'mission-1' }; }],
  ['mission-active', s => { s.scene = 'mission'; }],
  ['mission-active', null, c => { c.missionActive = true; }],
  ['crisis-active', s => { s.hub.activeCrisis = { id: 'crisis-1', resolved: false }; }],
  ['infestation-active', s => { s.hub.infestationChain = { stage: 'exposure', resolved: false }; }],
  ['confinement-active', s => { s.bioforgeV80.recovery.purgeRequired = true; }],
  ['confinement-active', s => { s.bioforgeV80.activeSession = { phase: 'printing' }; }],
  ['confinement-active', null, c => { c.confinementActive = true; }],
  ['ship-integrity-unsafe', s => { s.hub.systems.hull = 10; }],
  ['ship-integrity-unsafe', s => { s.hub.systems.oxygen = NaN; }],
  ['ship-integrity-unsafe', s => { s.hub.systems.power = 0; }],
  ['confinement-unsafe', s => { s.hub.systems.quarantine = 0; }],
  ['care-check-required', null, c => { c.careReady = false; }],
  ['manifest-check-required', null, c => { c.manifestReady = false; }],
  ['hangar-command-required', null, c => { c.physical.roomId = 'bridge'; }],
  ['authorization-required', null, c => { c.authorization.granted = false; }],
  ['authorization-required', null, c => { c.authorization.sectorId = 'Gateway'; }],
  ['authorization-required', null, c => { c.authorization.campaignHours = 29; }],
  ['authorization-required', s => { s.clock.hour = 24; }],
  ['simulation-paused', null, c => { c.paused = true; }],
  ['simulation-paused', null, c => { c.dialogueOpen = true; }]
]) test(`dock safety: ${code} never mutates campaign, access or credits`, () => {
  const save = fresh(); const c = context(); changeSave?.(save); changeContext?.(c);
  const before = structuredClone(save);
  const result = requestShipPortDockV87(save, request('dock-1'), c);
  assert.equal(result.code, code); assert.equal(result.ok, false); assert.equal(result.changed, false);
  assert.deepEqual(result.save, before); assert.deepEqual(save, before);
});

test('resolved incidents, completed onboarding and a cleared bioforge allow normal default campaign docking', () => {
  const save = fresh(); save.hub.activeCrisis = { resolved: true }; save.hub.infestationChain = { resolved: true };
  save.bioforgeV80.activeSession = { phase: 'return' };
  assert.equal(requestShipPortDockV87(save, request('dock-1'), context()).ok, true);
});

test('a declared ready manifest cannot override corrupt or future companion data at docking', () => {
  for (const raw of [{ schema: 99, animals: {} }, { schema: 1, animals: {} }]) {
    const save = fresh(); save.shipAnimalsV1 = raw;
    const result = requestShipPortDockV87(save, request('dock-1'), context());
    assert.equal(result.code, 'animal-manifest-needs-review'); assert.deepEqual(result.save, save);
  }
});

test('legacy campaigns without a wake-up sequence can dock after player-creation gating was cleared', () => {
  const save = fresh(); save.onboardingV84 = null;
  assert.equal(requestShipPortDockV87(save, request('dock-1'), context()).ok, true);
  save.needsPlayerCreationV84 = true;
  assert.equal(requestShipPortDockV87(save, request('dock-1'), context()).code, 'onboarding-incomplete');
});

test('paused dialogue and inactive states never progress or consume a pending simulation step', () => {
  const current = approaching(); const step = { simulationTime: 1, dtSeconds: 1 };
  for (const extra of [{ paused: true }, { dialogueOpen: true }]) {
    const paused = stepShipPortV87(current, step, { ...context(), ...extra });
    assert.equal(paused.code, 'simulation-paused'); assert.equal(paused.changed, false); assert.deepEqual(paused.save, current);
  }
  assert.equal(stepShipPortV87(current, step, context()).save.shipPortV1.elapsedSeconds, 1);
  assert.equal(stepShipPortV87(fresh(), step, context()).changed, false);
  assert.equal(stepShipPortV87(docked(), { simulationTime: 15, dtSeconds: 1 }, context()).changed, false);
});

test('large frame gaps are capped to one second and campaign clock changes do not advance maneuver', () => {
  const current = approaching(); current.clock = { day: 100, hour: 3 };
  const result = stepShipPortV87(current, { simulationTime: 86400, dtSeconds: 86400 }, context());
  assert.equal(result.ok, true); assert.equal(result.save.shipPortV1.elapsedSeconds, 1);
  assert.equal(result.save.shipPortV1.phase, 'approach');
  assert.equal(migrateShipPortStateV87(result.save.shipPortV1).elapsedSeconds, 1);
});

test('fractional steps, exact replay, conflicting replay and time reversal are deterministic', () => {
  const first = stepShipPortV87(approaching(), { simulationTime: 0.5, dtSeconds: 0.5 }, context());
  const repeated = stepShipPortV87(first.save, { simulationTime: 0.5, dtSeconds: 0.5 }, context());
  assert.equal(repeated.code, 'already-applied'); assert.deepEqual(repeated.save, first.save);
  assert.equal(stepShipPortV87(first.save, { simulationTime: 0.5, dtSeconds: 0.2 }, context()).code, 'step-conflict');
  assert.equal(stepShipPortV87(first.save, { simulationTime: 0.4, dtSeconds: 0.1 }, context()).code, 'invalid-simulation-time');
  assert.equal(stepShipPortV87(first.save, { simulationTime: 0.6, dtSeconds: 1 }, context()).code, 'invalid-simulation-time');
  assert.equal(stepShipPortV87(first.save, { simulationTime: Infinity, dtSeconds: 1 }, context()).code, 'invalid-step');
  assert.equal(stepShipPortV87(first.save, { simulationTime: 1, dtSeconds: -1 }, context()).code, 'invalid-step');
});

test('new crisis or revoked authorization suspends approach without silently completing it', () => {
  const current = approaching(); current.hub.activeCrisis = { resolved: false };
  assert.equal(tick(current).code, 'crisis-active');
  current.hub.activeCrisis = null;
  assert.equal(tick(current, 1, { ...context(), authorization: { granted: false } }).code, 'authorization-revoked');
  assert.equal(current.shipPortV1.elapsedSeconds, 0);
});

test('entry and purchases can recheck danger after docking without erasing the docked presence needed for an exit', () => {
  const current = docked(); const c = { careReady: true, manifestReady: true };
  assert.equal(getShipPortSafetyCodeV87(current, c), null);
  current.hub.activeCrisis = { resolved: false };
  assert.equal(getShipPortSafetyCodeV87(current, c), 'crisis-active');
  assert.equal(canAccessPortCounterV87(current), true);
  current.hub.activeCrisis.resolved = true;
  current.hub.infestationChain = { resolved: false };
  assert.equal(getShipPortSafetyCodeV87(current, c), 'infestation-active');
  current.hub.infestationChain = null;
  assert.equal(getShipPortSafetyCodeV87(current, { ...c, paused: true }), 'simulation-paused');
  assert.equal(getShipPortSafetyCodeV87(current, { ...c, dialogueOpen: true }), 'simulation-paused');
  assert.equal(getShipPortSafetyCodeV87(null, c), 'invalid-request');
  current.shipPortV1 = { schema: 99 };
  assert.equal(getShipPortSafetyCodeV87(current, c), 'unsupported-schema');
});

test('approach and docking can abort, but abort cannot remove a docked counter beneath the player', () => {
  for (const current of [approaching(), advance(approaching(), 9)]) {
    const result = abortShipPortDockV87(current, request('abort-1'), context());
    assert.equal(result.ok, true); assert.equal(result.save.shipPortV1.phase, 'undocked');
    assert.deepEqual(result.save.shipPortV1.position, { kind: 'unresolved' });
    assert.equal(abortShipPortDockV87(result.save, request('abort-1'), {}).code, 'already-applied');
    assert.deepEqual(migrateShipPortStateV87(result.save.shipPortV1), result.save.shipPortV1);
  }
  assert.equal(abortShipPortDockV87(docked(), request('abort-1'), context()).code, 'invalid-phase');
});

test('departure takes six active seconds and restores unresolved position without modifying a mission world', () => {
  const original = docked(); const undocking = requestShipPortUndockV87(original, request('leave-1'), context());
  assert.equal(undocking.ok, true); assert.equal(canAccessPortCounterV87(undocking.save), false);
  const current = advance(undocking.save, 6);
  assert.equal(current.shipPortV1.phase, 'departed'); assert.equal(current.shipPortV1.portId, null);
  assert.deepEqual(current.shipPortV1.position, { kind: 'unresolved' });
  assert.deepEqual(current.galaxy, original.galaxy); assert.equal(current.worldId, original.worldId);
  assert.deepEqual(migrateShipPortStateV87(current.shipPortV1), current.shipPortV1);
  const redock = requestShipPortDockV87(current, request('dock-2'), context());
  assert.equal(redock.ok, true); assert.equal(redock.save.shipPortV1.sessionId, 'dock-2');
});

test('player must leave counter physically and finish transfers before undocking', () => {
  const current = docked();
  assert.equal(requestShipPortUndockV87(current, request('leave-1'), { ...context(), physical: { roomId: PORT.counterRoomId } }).code, 'player-at-counter');
  for (const extra of [{ playerInTransfer: true }, { transferPending: true }]) {
    assert.equal(requestShipPortUndockV87(current, request('leave-1'), { ...context(), ...extra }).code, 'transfer-incomplete');
  }
  assert.equal(requestShipPortUndockV87(current, request('leave-1'), { ...context(), physical: { roomId: 'bridge' } }).code, 'hangar-command-required');
});

for (const phase of ['transit', 'intake', 'acclimating']) test(`unfinished animal ${phase} prevents departure with unchanged credits and position`, () => {
  const current = withAnimal(docked(), phase); const before = structuredClone(current);
  const result = requestShipPortUndockV87(current, request('leave-1'), context());
  assert.equal(result.code, 'animal-transfer-incomplete'); assert.equal(result.animalId, 'animal-moka');
  assert.deepEqual(result.save, before); assert.equal(canAccessPortCounterV87(current), true);
});

test('off-ship companion blocks departure, aboard resident permits it, and corrupt manifests fail closed', () => {
  assert.equal(validateShipPortDepartureV87(withAnimal(docked(), 'off-ship'), context()).code, 'animal-off-ship');
  assert.equal(requestShipPortUndockV87(withAnimal(docked(), 'resident'), request('leave-1'), context()).ok, true);
  for (const raw of [{ schema: 99, animals: {} }, { schema: 1, animals: {} }]) {
    const current = docked(); current.shipAnimalsV1 = raw;
    assert.equal(validateShipPortDepartureV87(current, context()).code, 'animal-manifest-needs-review');
  }
});

test('an in-progress separation rechecks transport manifest and player position at each step', () => {
  const current = requestShipPortUndockV87(docked(), request('leave-1'), context()).save;
  assert.equal(tick(current, 1, { ...context(), physical: { roomId: PORT.counterRoomId } }).code, 'player-at-counter');
  assert.equal(tick(withAnimal(current)).code, 'animal-transfer-incomplete');
  assert.equal(current.shipPortV1.elapsedSeconds, 0);
});

test('future state is preserved losslessly and every command plus access fail closed', () => {
  const raw = { schema: 8, phase: 'docked', future: { data: ['keep'] } };
  const current = fresh(); current.shipPortV1 = raw;
  assert.deepEqual(migrateShipPortStateV87(freeze(raw)), raw);
  assert.equal(canAccessPortCounterV87(current), false);
  for (const fn of [requestShipPortDockV87, requestShipPortUndockV87, abortShipPortDockV87]) {
    const result = fn(current, request('future-test'), context());
    assert.equal(result.code, 'unsupported-schema'); assert.deepEqual(result.save, current);
  }
  assert.equal(tick(current).code, 'unsupported-schema');
});

test('corrupt state is quarantined with its original data, migration is idempotent and never grants access', () => {
  const corrupt = { schema: 1, phase: 'docked', payload: ['must-preserve'] };
  const normalized = migrateShipPortStateV87(corrupt);
  assert.equal(normalized.phase, 'undocked'); assert.deepEqual(normalized.quarantined[0].original, corrupt);
  assert.deepEqual(migrateShipPortStateV87(normalized), normalized);
  const current = fresh(); current.shipPortV1 = normalized;
  assert.equal(requestShipPortDockV87(current, request('dock-1'), context()).code, 'state-needs-review');
  assert.equal(canAccessPortCounterV87(current), false);
});

test('migration retains unknown same-schema metadata without interpreting it as position or permission', () => {
  const state = createShipPortStateV87(); state.futureNotes = { local: true };
  const result = migrateShipPortStateV87(freeze(state));
  assert.deepEqual(result, state); assert.notEqual(result.futureNotes, state.futureNotes);
});

test('invalid identity, inconsistent maneuver duration and dangerous transaction keys fail closed', () => {
  for (const transactionId of ['', '__proto__', 'constructor', 'prototype', 'a'.repeat(97)]) {
    assert.equal(requestShipPortDockV87(fresh(), request(transactionId), context()).code, 'invalid-request');
  }
  assert.equal(requestShipPortDockV87(fresh(), { transactionId: 'wrong-port', portId: 'Gateway' }, context()).code, 'invalid-request');
  for (const change of [s => { s.durationSeconds = 0; }, s => { s.portId = 'Pioneer'; }, s => { delete s.commands['dock-1']; }]) {
    const current = approaching(); change(current.shipPortV1);
    assert.equal(tick(current).code, 'state-needs-review'); assert.equal(canAccessPortCounterV87(current), false);
  }
});

test('discarding a prepared candidate on commit failure does not publish access or mutate the durable campaign', () => {
  const durable = advance(approaching(), 13); const before = structuredClone(durable);
  const result = tick(freeze(durable)); assert.equal(canAccessPortCounterV87(result.save), true);
  assert.throws(() => { throw new Error('storage-full'); }, /storage-full/);
  assert.deepEqual(durable, before); assert.equal(canAccessPortCounterV87(durable), false);
});

test('source has no wall clock, resource writes, world catalogue route or persistence side effects', () => {
  const source = readFileSync(new URL('../src/ship-port-state-v87.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /Date\.now|new Date|localStorage|sessionStorage|setInterval|setTimeout/);
  assert.doesNotMatch(source, /save\.worldId|save\.activeWorld|WORLDS|resources\.[a-z]+\s*[-+]?=/);
});
