import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HUB_ANNEXES_V71, HUB_ANNEX_BY_ID_V71, createHubCommercialStateV71,
  applyHubAnnexStationV71, buildHubCommercialGraphV71, validateHubCommercialGraphV71,
  validateHubCommercialCompletionV71
} from '../src/tantalus-hub-expansion-v71.js';
import { SHIP_ANIMAL_ANNEX_V87 } from '../src/ship-animal-habitat-v87.js';
import { SHIP_PORT_ANNEX_V87 } from '../src/ship-port-room-v87.js';
import { SHIP_REFUGE_ANNEX_V87 } from '../src/refuge-room-v87.js';
import {
  HUB_ANNEXES_V87, HUB_ANNEX_BY_ID_V87, HUB_ANNEX_EXTENSIONS_V87,
  createHubCommercialStateV87, sanitizeHubCommercialStateV87,
  validateHubAnnexGeometryV87, buildHubRuntimeGraphV87, applyHubAnnexStationV87
} from '../src/hub-annex-registry-v87.js';

const animal = SHIP_ANIMAL_ANNEX_V87;
const clone = value => structuredClone(value);
const deepFreeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(deepFreeze); Object.freeze(value); }
  return value;
};

test('only the actual external port receives a 2560-wide floor and persistent east-wing pose', () => {
  assert.equal(SHIP_PORT_ANNEX_V87.world.width, 2560);
  assert.equal(SHIP_PORT_ANNEX_V87.platforms[0].w, 2560);
  assert.equal(animal.world.width, 1920); assert.equal(SHIP_REFUGE_ANNEX_V87.world.width, 1920);
  for (const [source, width] of [[animal, 2560], [SHIP_REFUGE_ANNEX_V87, 2560], [SHIP_PORT_ANNEX_V87, 1920], [SHIP_PORT_ANNEX_V87, 3000]]) {
    const candidate = clone(source); candidate.world.width = width; candidate.platforms[0].w = width;
    assert.equal(validateHubAnnexGeometryV87(candidate).valid, false);
  }
  const raw = createHubCommercialStateV87(); Object.assign(raw, { activeAnnexId: SHIP_PORT_ANNEX_V87.id,
    annexPositionX: 2430, annexPositionY: 532, annexClimbing: false,
    returnContext: { deckId: 'engineering', roomId: 'dropship-hangar', x: 99, facing: 1 } });
  const resumed = sanitizeHubCommercialStateV87(JSON.parse(JSON.stringify(raw)));
  assert.equal(resumed.annexPositionX, 2430); assert.equal(resumed.annexPositionY, 532);
  assert.equal(resumed.activeAnnexId, SHIP_PORT_ANNEX_V87.id); assert.deepEqual(resumed.returnContext, raw.returnContext);
  raw.annexPositionX = 99999;
  assert.equal(sanitizeHubCommercialStateV87(raw).annexPositionX, 2560 - 44 - 24);
});

function visitedState() {
  const state = createHubCommercialStateV87();
  Object.assign(state.annexes[animal.id], { visited: true, visitCount: 4, lastVisitedAt: 17 });
  Object.assign(state, { activeAnnexId: animal.id, annexPositionX: 870, annexPositionY: 532,
    annexClimbing: false, lastAnnexId: animal.id,
    returnContext: { deckId: 'habitat', roomId: 'crew-quarters', x: 690, facing: -1 } });
  return state;
}

test('runtime registry adds three explicit rooms without changing or cloning the historical ten descriptors', () => {
  assert.equal(HUB_ANNEXES_V71.length, 10);
  assert.equal(Object.keys(HUB_ANNEX_BY_ID_V71).length, 10);
  assert.equal(HUB_ANNEXES_V87.length, 13);
  assert.equal(new Set(HUB_ANNEXES_V87.map(annex => annex.id)).size, 13);
  assert.deepEqual(HUB_ANNEX_EXTENSIONS_V87, [animal, SHIP_PORT_ANNEX_V87, SHIP_REFUGE_ANNEX_V87]);
  assert.equal(HUB_ANNEX_BY_ID_V87[animal.id], animal);
  assert.equal(HUB_ANNEX_BY_ID_V71[animal.id], undefined);
  for (const annex of [...HUB_ANNEXES_V71, animal, SHIP_PORT_ANNEX_V87]) assert.equal(HUB_ANNEX_BY_ID_V87[annex.id], annex);
  assert.ok(Object.isFrozen(HUB_ANNEXES_V87));
  assert.ok(Object.isFrozen(HUB_ANNEX_BY_ID_V87));
});

test('fresh extension state has no visit, service activation, upgrade or housing automatically installed', () => {
  const state = createHubCommercialStateV87();
  assert.equal(state.schema, 71);
  assert.equal(state.registryVersion, 87);
  assert.equal(Object.keys(state.annexes).length, 13);
  assert.equal(Object.keys(state.stationUses).length, 13);
  assert.equal(state.annexes[animal.id].visited, false);
  assert.equal(state.annexes[animal.id].visitCount, 0);
  assert.equal(state.annexes[animal.id].station.activated, false);
  assert.equal(state.annexes[animal.id].upgrade.installed, false);
  assert.equal(Object.hasOwn(state.annexes[animal.id], 'habitats'), false);
  assert.equal(state.activeAnnexId, null);
  assert.deepEqual(state.visitedAnnexIds, []);
  assert.deepEqual(state.activatedStationIds, []);
  assert.deepEqual(state.physicalUpgradeIds, []);
  assert.equal(state.physicalUpgradeModuleIds.includes(animal.station.upgradeId), false);
  assert.deepEqual(createHubCommercialStateV71(state), createHubCommercialStateV71());
  assert.notEqual(state.annexes[animal.id], createHubCommercialStateV87().annexes[animal.id]);
});

test('pure migration retains all ten historical service records and V71 evidence byte-content unchanged', () => {
  let historical = createHubCommercialStateV71();
  for (const annex of HUB_ANNEXES_V71) historical = applyHubAnnexStationV71(historical, annex.id).state;
  historical.activeAnnexId = 'logistics';
  historical.annexPositionX = 1388;
  historical.annexPositionY = 376;
  historical.annexClimbing = true;
  historical.returnContext = { deckId: 'industrial', roomId: 'vehicle-bay', x: 4880, facing: 1 };
  const source = clone(historical);
  deepFreeze(historical);
  const migrated = createHubCommercialStateV87(historical);
  assert.deepEqual(historical, source);
  for (const annex of HUB_ANNEXES_V71) assert.deepEqual(migrated.annexes[annex.id], historical.annexes[annex.id]);
  assert.deepEqual(createHubCommercialStateV71(migrated), createHubCommercialStateV71(historical));
  assert.deepEqual(validateHubCommercialCompletionV71(migrated), validateHubCommercialCompletionV71(historical));
  assert.equal(migrated.activeAnnexId, 'logistics');
  assert.equal(migrated.annexPositionX, 1388);
  assert.equal(migrated.annexPositionY, 376);
  assert.equal(migrated.annexClimbing, true);
  assert.deepEqual(migrated.returnContext, historical.returnContext);
  assert.equal(migrated.completed, false);
});

test('animal-care active pose, parent return and complete visited list survive JSON and repeated migration', () => {
  const raw = visitedState();
  const before = clone(raw);
  const first = createHubCommercialStateV87(deepFreeze(raw));
  assert.deepEqual(raw, before);
  assert.equal(first.activeAnnexId, animal.id);
  assert.equal(first.annexPositionX, 870);
  assert.equal(first.annexPositionY, 532);
  assert.equal(first.annexClimbing, false);
  assert.deepEqual(first.returnContext, { deckId: 'habitat', roomId: 'crew-quarters', x: 690, facing: -1 });
  assert.deepEqual(first.visitedAnnexIds, [animal.id]);
  assert.equal(first.lastAnnexId, animal.id);
  assert.equal(first.annexes[animal.id].visitCount, 4);
  assert.deepEqual(sanitizeHubCommercialStateV87(JSON.parse(JSON.stringify(first))), first);
  assert.equal(first.completed, false);
});

test('extension service evidence is rebuilt from its matching record, never forged lists or historical stationUses', () => {
  const raw = visitedState();
  raw.stationUses[animal.id] = 9999;
  raw.activatedStationIds = [animal.station.id];
  raw.physicalUpgradeIds = [animal.station.upgradeId];
  let state = createHubCommercialStateV87(raw);
  assert.equal(state.stationUses[animal.id], 0);
  assert.deepEqual(state.activatedStationIds, []);
  assert.deepEqual(state.physicalUpgradeIds, []);
  raw.annexes[animal.id].station = { id: animal.station.id, activated: true, activationCount: 3, activatedAt: 8, lastActivatedAt: 12 };
  state = createHubCommercialStateV87(raw);
  assert.equal(state.stationUses[animal.id], 3);
  assert.deepEqual(state.activatedStationIds, [animal.station.id]);
  assert.equal(state.annexes[animal.id].upgrade.installed, false);
  raw.annexes[animal.id].upgrade = { id: animal.station.upgradeId, installed: true, installedAt: 10 };
  raw.physicalUpgradeModuleIds.push(animal.station.upgradeId);
  state = createHubCommercialStateV87(raw);
  assert.deepEqual(state.physicalUpgradeIds, [animal.station.upgradeId]);
  assert.equal(state.physicalUpgradeModuleIds.filter(id => id === animal.station.upgradeId).length, 1);
  assert.deepEqual(createHubCommercialStateV87(state), state);
  raw.annexes[animal.id].station.id = 'forged-station';
  raw.annexes[animal.id].upgrade.id = 'forged-upgrade';
  state = createHubCommercialStateV87(raw);
  assert.equal(state.stationUses[animal.id], 0);
  assert.equal(state.annexes[animal.id].upgrade.installed, false);
});

test('animal visit counters and position are bounded, parent return is canonical, and no fictitious ladder is resumed', () => {
  const raw = visitedState();
  Object.assign(raw, { annexPositionX: Infinity, annexPositionY: NaN, annexClimbing: true,
    returnContext: { deckId: 'engineering', roomId: 'reactor', x: -999999, facing: -1 } });
  raw.annexes[animal.id].visitCount = 999999999;
  raw.annexes[animal.id].lastVisitedAt = Infinity;
  let state = createHubCommercialStateV87(raw);
  assert.equal(state.annexPositionX, Math.round(animal.entranceLocalX + animal.entrance.w / 2 + 30));
  assert.equal(state.annexPositionY, animal.world.floorY - 92);
  assert.equal(state.annexClimbing, false);
  assert.equal(state.annexes[animal.id].visitCount, 999999);
  assert.equal(state.annexes[animal.id].lastVisitedAt, 0);
  assert.deepEqual(state.returnContext, { deckId: animal.parentDeck, roomId: animal.parentRoomId, x: animal.parentDoorBounds.x, facing: -1 });
  raw.annexPositionX = 999999;
  raw.annexPositionY = -999999;
  raw.returnContext = { x: 999999, facing: 0 };
  state = createHubCommercialStateV87(raw);
  assert.equal(state.annexPositionX, animal.world.width - 44 - 24);
  assert.equal(state.annexPositionY, 0);
  assert.equal(state.returnContext.x, animal.parentDoorBounds.x + animal.parentDoorBounds.w);
  assert.equal(Object.hasOwn(state.returnContext, 'facing'), false);
});

test('unknown rooms cannot acquire physical presence or fabricated visitation', () => {
  const raw = createHubCommercialStateV87();
  raw.activeAnnexId = 'unknown-annex';
  raw.lastAnnexId = 'unknown-annex';
  raw.visitedAnnexIds = ['unknown-annex', animal.id];
  raw.annexes.unknown = { id: 'unknown-annex', visited: true };
  const result = createHubCommercialStateV87(raw);
  assert.equal(result.activeAnnexId, null);
  assert.equal(result.returnContext, null);
  assert.equal(result.lastAnnexId, null);
  assert.deepEqual(result.visitedAnnexIds, []);
  assert.equal(Object.hasOwn(result.annexes, 'unknown'), false);
});

test('activating a legacy station after an animal-care visit preserves extension evidence and independent habitat data', () => {
  const source = { hub: { commercialV71: visitedState() }, shipAnimalsV1: {
    schema: 1, habitats: { 'moka-berth-v87': { installed: true, equipment: ['bed', 'water-station'] } }
  } };
  const before = clone(source);
  deepFreeze(source);
  const applied = applyHubAnnexStationV87(source.hub.commercialV71, 'logistics');
  assert.equal(applied.applied, true);
  assert.equal(applied.station, HUB_ANNEX_BY_ID_V71.logistics.station);
  assert.equal(applied.effect.moduleId, HUB_ANNEX_BY_ID_V71.logistics.station.upgradeId);
  assert.deepEqual(applied.state.annexes[animal.id], before.hub.commercialV71.annexes[animal.id]);
  assert.deepEqual(applied.state.visitedAnnexIds, ['logistics', animal.id]);
  assert.equal(applied.state.activeAnnexId, animal.id);
  assert.equal(applied.state.annexPositionX, 870);
  assert.equal(applied.state.annexPositionY, 532);
  assert.deepEqual(applied.state.returnContext, before.hub.commercialV71.returnContext);
  assert.equal(applied.state.lastAnnexId, 'logistics');
  assert.equal(applied.state.stationUses.logistics, 1);
  assert.equal(applied.state.stationUses[animal.id], 0);
  assert.equal(applied.state.annexes[animal.id].upgrade.installed, false);
  assert.deepEqual(source, before);
  assert.deepEqual(createHubCommercialStateV87(applied.state), applied.state);
});

test('generic station activation refuses extension, unknown and future states without granting upgrades', () => {
  for (const [raw, id] of [
    [visitedState(), animal.id], [visitedState(), 'unknown'], [visitedState(), '__proto__'],
    [{ ...visitedState(), schema: 99 }, 'logistics'],
    [{ ...visitedState(), registryVersion: 99 }, 'logistics']
  ]) {
    const before = clone(raw);
    const result = applyHubAnnexStationV87(raw, id);
    assert.equal(result.applied, false);
    assert.equal(result.station, null);
    assert.equal(result.effect, null);
    assert.deepEqual(result.state, createHubCommercialStateV87(before));
    assert.deepEqual(raw, before);
    assert.equal(result.state.annexes[animal.id].upgrade.installed, false);
  }
});

for (const field of [{ schema: 88 }, { registryVersion: 99 }, { schema: '99' }, { registryVersion: '101' }]) {
  test(`future commercial/registry version ${JSON.stringify(field)} is preserved without downgrade`, () => {
    const raw = { ...visitedState(), ...field, futureRooms: { another: { coordinates: [1, 2, 3] } } };
    const source = clone(raw);
    const result = createHubCommercialStateV87(deepFreeze(raw));
    assert.deepEqual(result, source);
    assert.notEqual(result, raw);
    assert.notEqual(result.futureRooms, raw.futureRooms);
    assert.deepEqual(createHubCommercialStateV87(result), result);
  });
}

test('runtime graph has 16+13 reciprocal connected rooms while V71 proof remains exactly 16+10', () => {
  const historical = buildHubCommercialGraphV71();
  const before = clone(historical);
  const graph = buildHubRuntimeGraphV87();
  assert.equal(graph.nodes.length, 29);
  assert.equal(graph.baseRoomCount, 16);
  assert.equal(graph.annexRoomCount, 13);
  assert.equal(graph.edges.length, historical.edges.length + 3);
  assert.equal(graph.edges.length, 31);
  assert.deepEqual(graph.nodes.slice(0, historical.nodes.length), historical.nodes);
  assert.deepEqual(graph.edges.slice(0, historical.edges.length), historical.edges);
  for (const extension of HUB_ANNEX_EXTENSIONS_V87) {
    const edge = graph.edges.find(candidate => candidate.doorId === extension.entrance.id);
    assert.equal(edge.deckId, extension.parentDeck);
    assert.equal(edge.destinations[extension.id], extension.parentRoomId);
    assert.equal(edge.destinations[extension.parentRoomId], extension.id);
    assert.deepEqual(graph.adjacency[extension.id], [extension.parentRoomId]);
  }
  const seen = new Set(['bridge']);
  const queue = ['bridge'];
  while (queue.length) for (const next of graph.adjacency[queue.shift()]) if (!seen.has(next)) { seen.add(next); queue.push(next); }
  assert.equal(seen.size, graph.nodes.length);
  assert.deepEqual(historical, before);
  assert.deepEqual(buildHubCommercialGraphV71(), before);
  assert.equal(validateHubCommercialGraphV71().valid, true);
  assert.equal(validateHubCommercialGraphV71().annexRoomCount, 10);
  assert.ok(Object.isFrozen(graph.adjacency[animal.parentRoomId]));
});

test('extension geometry uses its real floor, physical parent door and safe standing spawn', () => {
  for (const annex of HUB_ANNEXES_V87) assert.equal(validateHubAnnexGeometryV87(annex).valid, true, annex.id);
  for (const mutate of [
    annex => { annex.world.width = 2000; },
    annex => { annex.parentRoomId = 'reactor'; },
    annex => { annex.parentDoorBounds.x = 1281; },
    annex => { annex.platforms[0].w = 1919; },
    annex => { annex.props[0].x = 1919; },
    annex => { annex.entrance.bidirectional = false; },
    annex => { annex.station.persistent = false; },
    annex => { annex.colliders.push({ x: 200, y: 500, w: 100, h: 124 }); }
  ]) {
    const candidate = clone(animal);
    mutate(candidate);
    assert.equal(validateHubAnnexGeometryV87(candidate).valid, false);
  }
});
