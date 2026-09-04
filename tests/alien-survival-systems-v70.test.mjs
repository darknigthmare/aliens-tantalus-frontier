import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ALIEN_SURVIVAL_CAMPAIGN_ID_V70,
  ALIEN_SURVIVAL_CAMPAIGN_V70,
  ALIEN_SURVIVAL_DOOR_DEFINITIONS_V70,
  ALIEN_SURVIVAL_EXTERIOR_ROOM_ID_V70,
  ALIEN_SURVIVAL_OPERATION_ID_V70,
  ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70,
  ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70,
  ALIEN_SURVIVAL_ROOM_IDS_V70,
  ALIEN_SURVIVAL_SCHEMA_V70,
  buildAlienSurvivalResolutionPayloadV70,
  createAlienSurvivalStateV70,
  deriveAlienSurvivalPhaseV70,
  getAlienSurvivalMechanicsV70,
  sanitizeAlienSurvivalStateV70,
  simulateRoomPressureV70,
  validateAlienSurvivalCompletionV70
} from '../src/alien-survival-systems-v70.js';

const DEPLOYMENT_ID = 'deployment-survival-v70';

const clone = (value) => JSON.parse(JSON.stringify(value));

function twoRoomState() {
  const state = createAlienSurvivalStateV70({
    deploymentOperationId: DEPLOYMENT_ID,
    roomIds: ['room-a', 'room-b'],
    doorDefinitions: [{ id: 'door-ab', fromRoomId: 'room-a', toRoomId: 'room-b' }],
    requiredFeedIds: ['room-a', 'room-b']
  });
  for (const room of state.rooms) {
    room.breachRate = 0;
    room.targetPressure = 100;
  }
  return state;
}

function completedState() {
  const state = createAlienSurvivalStateV70({ deploymentOperationId: DEPLOYMENT_ID });
  state.power.routes['life-support'] = true;
  state.power.routes.cctv = true;
  state.power.rerouteCount = 2;
  state.power.everRouted = ['life-support', 'cctv'];
  state.cctv.visitedFeedIds = [...state.cctv.requiredFeedIds];
  state.cctv.scanComplete = true;

  const weldedDoor = state.doors.find((door) => door.id === 'cargo-bulkhead') || state.doors[0];
  weldedDoor.welded = true;
  weldedDoor.open = false;
  weldedDoor.weldIntegrity = 86;
  weldedDoor.weldCompletedAt = 24;
  state.welding.completedDoorIds = [weldedDoor.id];
  state.pressure.equalizedDoorIds = [state.doors.at(-1).id];
  const extraction = state.rooms.find((room) => room.id === 'ship-extraction');
  extraction.pressure = 92;
  extraction.oxygen = 88;
  extraction.breachRate = 0;
  state.pressure.stabilizedRoomIds = [extraction.id];

  state.acidPools = [{
    id: 'acid-pool:xeno-07',
    roomId: 'ship-cargo',
    sourceEnemyId: 'xeno-07',
    x: 740,
    y: 680,
    w: 80,
    h: 20,
    intensity: 0.8,
    corrosion: 12,
    ageSeconds: 8,
    createdAt: 16,
    active: true,
    persistent: true
  }];
  state.acid.maxPersistenceSeconds = 8;
  state.selfDestruct.authorizations.engineering = true;
  state.selfDestruct.authorizations.command = true;
  state.selfDestruct.armed = true;
  state.selfDestruct.armedAt = 40;
  state.selfDestruct.remainingSeconds = 58;
  state.extracted = true;
  state.completedAt = 72;
  state.phase = deriveAlienSurvivalPhaseV70(state);
  return state;
}

test('le contrat V70 déclare une opération, une campagne et exactement les six mécaniques promises', () => {
  assert.equal(ALIEN_SURVIVAL_SCHEMA_V70, 70);
  assert.equal(ALIEN_SURVIVAL_OPERATION_ID_V70, 'alien-survival-systems');
  assert.equal(ALIEN_SURVIVAL_CAMPAIGN_ID_V70, 'special-alien-survival-systems');
  assert.equal(ALIEN_SURVIVAL_CAMPAIGN_V70.templateId, 'ship-interior-vertical');
  assert.equal(ALIEN_SURVIVAL_CAMPAIGN_V70.mode, 'SURVIVAL');
  assert.deepEqual(ALIEN_SURVIVAL_POWER_CIRCUIT_IDS_V70, ['life-support', 'security', 'cctv']);
  assert.deepEqual(ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70, [
    'self-destruct',
    'weldable-doors',
    'room-pressure',
    'power-routing',
    'security-cameras',
    'persistent-acid'
  ]);
  assert.equal(new Set(ALIEN_SURVIVAL_ROOM_IDS_V70).size, 6);
  assert.equal(ALIEN_SURVIVAL_ROOM_IDS_V70.includes(ALIEN_SURVIVAL_EXTERIOR_ROOM_ID_V70), false);
  assert.deepEqual(ALIEN_SURVIVAL_DOOR_DEFINITIONS_V70, [
    { id: 'dock-bulkhead', fromRoomId: 'ship-docking', toRoomId: 'ship-cargo' },
    { id: 'cargo-bulkhead', fromRoomId: 'ship-cargo', toRoomId: 'ship-engineering' },
    { id: 'aft-bulkhead', fromRoomId: 'ship-command', toRoomId: 'ship-extraction' },
    { id: 'outer-airlock', fromRoomId: 'ship-extraction', toRoomId: ALIEN_SURVIVAL_EXTERIOR_ROOM_ID_V70 }
  ]);
});

test('la création fournit des états indépendants et un compte à rebours lié à la difficulté', () => {
  const standard = createAlienSurvivalStateV70({ deploymentOperationId: DEPLOYMENT_ID });
  const nightmare = createAlienSurvivalStateV70({ deploymentOperationId: DEPLOYMENT_ID, difficulty: 'nightmare' });
  assert.equal(standard.phase, 'restore-power');
  assert.equal(standard.selfDestruct.durationSeconds, 90);
  assert.equal(nightmare.selfDestruct.durationSeconds, 70);
  assert.equal(standard.power.capacity, 2);
  assert.equal(standard.rooms.length, 6);
  standard.rooms[0].pressure = 0;
  standard.power.routes.security = true;
  assert.notEqual(nightmare.rooms[0].pressure, 0);
  assert.equal(nightmare.power.routes.security, false);
});

test('le sanitizer rejette strictement toute identité ou tout déploiement incompatible', () => {
  const original = createAlienSurvivalStateV70({ deploymentOperationId: DEPLOYMENT_ID });
  original.power.rerouteCount = 4;
  for (const forged of [
    { ...original, schema: 69 },
    { ...original, operationId: 'other-operation' },
    { ...original, campaignId: 'other-campaign' },
    { ...original, deploymentOperationId: 'other-deployment' }
  ]) {
    const safe = sanitizeAlienSurvivalStateV70(forged, { deploymentOperationId: DEPLOYMENT_ID });
    assert.deepEqual(safe, createAlienSurvivalStateV70({ deploymentOperationId: DEPLOYMENT_ID }));
  }
});

test('le sanitizer reconstruit les listes canoniques, limite les circuits et supprime les références inconnues', () => {
  const raw = createAlienSurvivalStateV70({ deploymentOperationId: DEPLOYMENT_ID, difficulty: 'nightmare' });
  raw.rooms.push({ id: 'forged-room', pressure: 100 });
  raw.rooms[0] = { ...raw.rooms[0], pressure: 500, oxygen: -20, breachRate: 900 };
  raw.doors.push({ id: 'forged-door', fromRoomId: 'forged-room', toRoomId: 'ship-command', open: true });
  raw.doors[0] = {
    ...raw.doors[0],
    fromRoomId: 'forged-room',
    toRoomId: 'forged-room',
    open: true,
    welded: true,
    weldIntegrity: 900
  };
  raw.welding.completedDoorIds = [raw.doors[0].id, 'forged-door'];
  raw.power.routes = { 'life-support': true, security: true, cctv: true, weapons: true };
  raw.power.rerouteCount = 3;
  raw.power.everRouted = ['cctv', 'weapons'];
  raw.cctv.active = true;
  raw.cctv.selectedFeedId = 'forged-room';
  raw.cctv.visitedFeedIds = ['ship-engineering', 'ship-extraction', 'forged-room'];
  raw.acidPools = [
    { id: 'acid-pool:valid', roomId: 'ship-cargo', ageSeconds: 2, active: true },
    { id: 'acid-pool:forged', roomId: 'forged-room', ageSeconds: 999 }
  ];
  raw.selfDestruct.authorizations.engineering = true;
  raw.selfDestruct.authorizations.command = false;
  raw.selfDestruct.armed = true;
  raw.phase = 'extracted';
  raw.extracted = true;

  const safe = sanitizeAlienSurvivalStateV70(raw, { deploymentOperationId: DEPLOYMENT_ID });
  assert.deepEqual(safe.rooms.map((room) => room.id), ALIEN_SURVIVAL_ROOM_IDS_V70);
  assert.deepEqual(safe.rooms[0], {
    id: 'ship-docking',
    pressure: 100,
    targetPressure: 100,
    oxygen: 0,
    breachRate: 40,
    visited: false
  });
  assert.equal(safe.doors.length, 4);
  assert.deepEqual(
    { fromRoomId: safe.doors[0].fromRoomId, toRoomId: safe.doors[0].toRoomId },
    { fromRoomId: 'ship-docking', toRoomId: 'ship-cargo' }
  );
  assert.equal(safe.doors[0].open, false);
  assert.equal(safe.doors[0].weldIntegrity, 100);
  assert.deepEqual(safe.welding.completedDoorIds, ['dock-bulkhead']);
  assert.deepEqual(safe.power.routes, { 'life-support': true, security: true, cctv: false });
  assert.deepEqual(safe.power.everRouted, ['cctv', 'life-support', 'security']);
  assert.equal(safe.cctv.active, false);
  assert.deepEqual(safe.cctv.visitedFeedIds, ['ship-engineering', 'ship-extraction']);
  assert.equal(safe.cctv.scanComplete, true);
  assert.equal(safe.acidPools.length, 1);
  assert.equal(safe.acidPools[0].persistent, true);
  assert.equal(safe.selfDestruct.armed, false);
  assert.equal(safe.selfDestruct.durationSeconds, 70);
  assert.equal(safe.extracted, false);
  assert.notEqual(safe.phase, 'extracted');
});

test('la pression est déterministe entre un pas groupé et 120 pas à 60 Hz', () => {
  const state = twoRoomState();
  state.rooms[0].pressure = 100;
  state.rooms[0].oxygen = 100;
  state.rooms[1].pressure = 20;
  state.rooms[1].oxygen = 20;
  state.doors[0].open = true;

  const grouped = simulateRoomPressureV70(state, state.doors, 2);
  let stepped = clone(state);
  for (let frame = 0; frame < 120; frame += 1) {
    stepped = simulateRoomPressureV70(stepped, stepped.doors, 1 / 60);
  }
  assert.deepEqual(stepped.rooms, grouped.rooms);
  assert.deepEqual(stepped.pressure, grouped.pressure);
  assert.equal(grouped.pressure.simulatedTicks, 120);
  assert.ok(Math.abs(grouped.rooms.reduce((total, room) => total + room.pressure, 0) - 120) < 0.001);
  assert.equal(state.rooms[0].pressure, 100, 'la fonction pure ne mute pas son entrée');
});

test('les transferts simultanés ne dépendent pas de l’ordre des portes', () => {
  const state = createAlienSurvivalStateV70({
    deploymentOperationId: DEPLOYMENT_ID,
    roomIds: ['room-a', 'room-b', 'room-c'],
    doorDefinitions: [
      { id: 'door-ab', fromRoomId: 'room-a', toRoomId: 'room-b' },
      { id: 'door-bc', fromRoomId: 'room-b', toRoomId: 'room-c' }
    ]
  });
  [state.rooms[0].pressure, state.rooms[1].pressure, state.rooms[2].pressure] = [100, 15, 70];
  for (const room of state.rooms) {
    room.oxygen = room.pressure;
    room.breachRate = 0;
  }
  for (const door of state.doors) door.open = true;
  const forward = simulateRoomPressureV70(state, state.doors, 3);
  const reverse = simulateRoomPressureV70(state, [...state.doors].reverse(), 3);
  assert.deepEqual(forward.rooms, reverse.rooms);
  assert.deepEqual(forward.pressure, reverse.pressure);
});

test('le sas extérieur dépressurise la chambre vers un réservoir de vide sans créer une septième salle', () => {
  const state = createAlienSurvivalStateV70({ deploymentOperationId: DEPLOYMENT_ID });
  const extraction = state.rooms.find((room) => room.id === 'ship-extraction');
  const command = state.rooms.find((room) => room.id === 'ship-command');
  const outer = state.doors.find((door) => door.id === 'outer-airlock');
  Object.assign(extraction, { pressure: 90, oxygen: 90, breachRate: 0 });
  outer.open = true;

  const result = simulateRoomPressureV70(state, state.doors, 1);
  const nextExtraction = result.rooms.find((room) => room.id === 'ship-extraction');
  const nextCommand = result.rooms.find((room) => room.id === 'ship-command');
  assert.equal(result.rooms.length, 6);
  assert.equal(result.rooms.some((room) => room.id === ALIEN_SURVIVAL_EXTERIOR_ROOM_ID_V70), false);
  assert.ok(nextExtraction.pressure < extraction.pressure, 'la porte extérieure ouverte doit évacuer la chambre');
  assert.equal(nextCommand.pressure, command.pressure, 'le sas intérieur fermé doit isoler la passerelle');
  assert.equal(result.pressure.equalizedDoorIds.includes('outer-airlock'), false, 'le vide ne constitue jamais une égalisation sûre');
});

test('une porte fermée ou soudée isole, une brèche vide la salle et le support-vie restaure seulement une salle intacte', () => {
  const isolated = twoRoomState();
  isolated.rooms[0].pressure = 100;
  isolated.rooms[0].oxygen = 100;
  isolated.rooms[1].pressure = 20;
  isolated.rooms[1].oxygen = 20;
  let result = simulateRoomPressureV70(isolated, isolated.doors, 2);
  assert.equal(result.rooms[0].pressure, 100);
  assert.equal(result.rooms[1].pressure, 20);

  isolated.doors[0].open = true;
  isolated.doors[0].welded = true;
  isolated.doors[0].weldIntegrity = 100;
  result = simulateRoomPressureV70(isolated, isolated.doors, 2);
  assert.equal(result.rooms[0].pressure, 100);
  assert.equal(result.rooms[1].pressure, 20);

  const damaged = twoRoomState();
  damaged.power.routes['life-support'] = true;
  damaged.rooms[0].pressure = 100;
  damaged.rooms[0].oxygen = 100;
  damaged.rooms[0].breachRate = 5;
  damaged.rooms[1].pressure = 40;
  damaged.rooms[1].oxygen = 40;
  result = simulateRoomPressureV70(damaged, damaged.doors, 2);
  assert.ok(Math.abs(result.rooms[0].pressure - 90) < 0.001);
  assert.ok(Math.abs(result.rooms[1].pressure - 56) < 0.001);
  assert.ok(result.rooms[1].oxygen > 40);
});

test('l’égalisation physique produit une preuve persistante et stabilise les salles sûres', () => {
  const state = twoRoomState();
  state.rooms[0].pressure = 100;
  state.rooms[0].oxygen = 100;
  state.rooms[1].pressure = 94;
  state.rooms[1].oxygen = 94;
  state.doors[0].open = true;
  const result = simulateRoomPressureV70(state, state.doors, 4);
  assert.deepEqual(result.pressure.equalizedDoorIds, ['door-ab']);
  assert.deepEqual(result.pressure.stabilizedRoomIds, ['room-a', 'room-b']);
  assert.equal(getAlienSurvivalMechanicsV70(result)['room-pressure'], true);
});

test('les phases sont toujours dérivées des preuves réelles et ignorent une phase déclarative forgée', () => {
  const state = createAlienSurvivalStateV70({ deploymentOperationId: DEPLOYMENT_ID });
  state.phase = 'extracted';
  assert.equal(deriveAlienSurvivalPhaseV70(state), 'restore-power');
  state.power.rerouteCount = 1;
  state.power.everRouted = ['cctv'];
  assert.equal(deriveAlienSurvivalPhaseV70(state), 'security-scan');
  state.cctv.visitedFeedIds = [...state.cctv.requiredFeedIds];
  assert.equal(deriveAlienSurvivalPhaseV70(state), 'contain-breach');
  state.welding.completedDoorIds = [state.doors[0].id];
  state.pressure.equalizedDoorIds = [state.doors.at(-1).id];
  const extraction = state.rooms.find((room) => room.id === 'ship-extraction');
  extraction.pressure = 90;
  extraction.oxygen = 85;
  extraction.breachRate = 0;
  assert.equal(deriveAlienSurvivalPhaseV70(state), 'authorize-destruct');
  state.selfDestruct.authorizations.engineering = true;
  state.selfDestruct.authorizations.command = true;
  state.selfDestruct.armed = true;
  assert.equal(deriveAlienSurvivalPhaseV70(state), 'escape');
  state.selfDestruct.expired = true;
  assert.equal(deriveAlienSurvivalPhaseV70(state), 'failed');
});

test('la validation exige simultanément les six mécaniques et l’extraction', () => {
  const state = completedState();
  const validation = validateAlienSurvivalCompletionV70(state, { deploymentOperationId: DEPLOYMENT_ID });
  assert.equal(validation.identityValid, true);
  assert.equal(validation.mechanicsComplete, true);
  assert.equal(validation.extracted, true);
  assert.equal(validation.complete, true);
  assert.equal(validation.valid, true);
  assert.deepEqual(validation.completedMechanicIds, ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70);
  assert.deepEqual(validation.missingMechanicIds, []);
  assert.equal(validation.phase, 'extracted');

  const notExtracted = clone(state);
  notExtracted.extracted = false;
  assert.equal(validateAlienSurvivalCompletionV70(notExtracted).mechanicsComplete, true);
  assert.equal(validateAlienSurvivalCompletionV70(notExtracted).complete, false);
  assert.equal(validateAlienSurvivalCompletionV70(notExtracted, { requireExtraction: false }).complete, true);
  assert.equal(validateAlienSurvivalCompletionV70(state, { deploymentOperationId: 'other-deployment' }).identityValid, false);
});

test('chaque mécanique manquante est signalée séparément', () => {
  const cases = {
    'self-destruct': (state) => { state.selfDestruct.armed = false; },
    'weldable-doors': (state) => { state.welding.completedDoorIds = []; state.doors.forEach((door) => { door.welded = false; }); },
    'room-pressure': (state) => { state.pressure.equalizedDoorIds = []; },
    'power-routing': (state) => { state.power.rerouteCount = 0; state.power.everRouted = []; },
    'security-cameras': (state) => { state.cctv.visitedFeedIds = []; },
    'persistent-acid': (state) => { state.acidPools[0].ageSeconds = 0; state.acid.maxPersistenceSeconds = 0; }
  };
  for (const [mechanicId, removeEvidence] of Object.entries(cases)) {
    const state = completedState();
    removeEvidence(state);
    const validation = validateAlienSurvivalCompletionV70(state);
    assert.equal(validation.complete, false, mechanicId);
    assert.equal(validation.mechanics[mechanicId], false, mechanicId);
    assert.ok(validation.missingMechanicIds.includes(mechanicId), mechanicId);
  }
});

test('le payload de résolution reste lié au déploiement et ne récompense jamais un état incomplet', () => {
  const state = completedState();
  const payload = buildAlienSurvivalResolutionPayloadV70(state, { deploymentOperationId: DEPLOYMENT_ID });
  assert.equal(payload.schema, 70);
  assert.equal(payload.operationId, ALIEN_SURVIVAL_OPERATION_ID_V70);
  assert.equal(payload.campaignId, ALIEN_SURVIVAL_CAMPAIGN_ID_V70);
  assert.equal(payload.deploymentOperationId, DEPLOYMENT_ID);
  assert.equal(payload.complete, true);
  assert.equal(payload.mechanics.length, 6);
  assert.equal(payload.mechanics.every((mechanic) => mechanic.complete), true);
  assert.deepEqual(payload.weldedDoorIds, ['cargo-bulkhead']);
  assert.deepEqual(payload.cctvFeedIds, ['ship-engineering', 'ship-extraction']);
  assert.deepEqual(payload.acidPools, { total: 1, active: 1, maximumPersistenceSeconds: 8 });

  const forged = buildAlienSurvivalResolutionPayloadV70(state, { deploymentOperationId: 'other-deployment' });
  assert.equal(forged.complete, false);
});
