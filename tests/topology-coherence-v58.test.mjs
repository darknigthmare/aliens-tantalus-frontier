import test from 'node:test';
import assert from 'node:assert/strict';

import { CAMPAIGNS, LEVEL_SEEDS, WORLDS } from '../src/content-core-v50.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { HUB_DECKS, HUB_WORLD, HubGame } from '../src/hub-v52-runtime.js';
import { HUB_TRAVERSAL_PROFILES_V60 } from '../src/hub-v51-runtime.js';
import {
  buildHubDoorNetworkV58,
  buildHubRoomDoorSocketsV60,
  buildHubTopologyV58,
  compileMissionDoorTopologyV58,
  describeMissionDoorRequirementV58,
  validateHubRuntimeTopologyV58,
  validateHubRoomDoorSocketsV60,
  validateHubTopologyV58,
  validateMissionTopologyV58
} from '../src/topology-coherence-v58.js';

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1024;
    this.naturalHeight = 1024;
  }

  set src(value) { this.currentSrc = value; }
}

function mockContext() {
  const gradient = { addColorStop() {} };
  const base = {
    measureText: (text) => ({ width: String(text).length * 8 }),
    createLinearGradient: () => gradient,
    createRadialGradient: () => gradient
  };
  return new Proxy(base, {
    get: (target, key) => key in target ? target[key] : () => {},
    set: (target, key, value) => { target[key] = value; return true; }
  });
}

function withBrowserMocks(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame,
    performance: globalThis.performance
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  globalThis.performance = { now: () => 1000 };
  try { return run(); } finally { Object.assign(globalThis, previous); }
}

function buildPlan(templateId, variant = 58) {
  const world = WORLDS[0];
  const campaign = {
    ...CAMPAIGNS[0],
    id: `v58-${templateId}`,
    worldId: world.id,
    objective: templateId === 'ship-interior-vertical' ? 'board a drifting vessel' : CAMPAIGNS[0].objective
  };
  return buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId, variant });
}

test('V58 valide les destinations, surfaces, verticalités et retours des trois topologies mission', () => {
  for (const templateId of ['ship-interior-vertical', 'colony-multiroute', 'planet-exterior']) {
    const plan = buildPlan(templateId);
    const validation = validateMissionTopologyV58(plan);
    assert.equal(validation.valid, true, `${templateId}: ${validation.errors.join('; ')}`);
    assert.equal(validation.physicallyReachableNodes, plan.graph.nodes.length, `${templateId}: tous les nœuds sont physiquement accessibles`);
    assert.equal(validation.reciprocalConnectionCount, plan.graph.edges.filter((edge) => !edge.oneWay).length, `${templateId}: chaque liaison auteur possède son retour`);
    assert.equal(validation.doorCount, plan.geometry.doors.length);
  }
});

test('V58 remplace l’heuristique nom/index par des contrats de serrure explicites et actionnables', () => {
  const ship = compileMissionDoorTopologyV58(buildPlan('ship-interior-vertical'));
  const colony = compileMissionDoorTopologyV58(buildPlan('colony-multiroute'));
  const locks = new Map([...ship, ...colony].filter((door) => door.lockedBy).map((door) => [door.id, door]));

  assert.deepEqual(
    Object.fromEntries([...locks].map(([id, door]) => [id, door.lockedBy])),
    {
      'cargo-bulkhead': 'power',
      'aft-bulkhead': 'boss',
      'colony-main-gate': 'power',
      'security-gate': 'power'
    }
  );
  for (const door of locks.values()) {
    assert.ok(door.lockReason, `${door.id}: cause visible`);
    assert.ok(door.unlockHint, `${door.id}: solution visible`);
    assert.ok(door.unlockEventId, `${door.id}: source de déverrouillage`);
    assert.equal(door.destinations[door.from].nodeId, door.to, `${door.id}: destination aller`);
    assert.equal(door.destinations[door.to].nodeId, door.from, `${door.id}: destination retour`);
  }

  const aft = locks.get('aft-bulkhead');
  const feedback = describeMissionDoorRequirementV58({ ...aft, levelLocked: true }, 'ÉVÉNEMENT EN COURS');
  assert.match(feedback, /CONFINEMENT DU SAS ARRIÈRE/);
  assert.match(feedback, /NEUTRALISER LA SIGNATURE ALPHA/);
});

test('V58 rejette une porte sans destination, hors plateforme, non réciproque ou sans feedback de verrou', () => {
  const base = buildPlan('ship-interior-vertical');
  const cases = [
    ['destination', (plan) => { plan.geometry.doors[0].to = 'missing-room'; }, /invalid destination pair|destination disagrees/],
    ['placement', (plan) => { plan.geometry.doors[0].x = plan.dimensions.width + 500; }, /outside its transition span|outside every playable platform/],
    ['reciprocity', (plan) => { plan.geometry.doors[0].bidirectional = false; }, /not reciprocal/],
    ['feedback', (plan) => { plan.geometry.doors[0].lock = { type: 'power', unlockEventId: 'ship-power-cascade' }; }, /lock has no player feedback/],
    ['unlock', (plan) => { plan.geometry.doors[0].lock = { type: 'power', reason: 'TEST', unlockHint: 'TEST', unlockEventId: 'missing-event' }; }, /unknown unlock event/]
  ];
  for (const [label, mutate, expected] of cases) {
    const broken = structuredClone(base);
    mutate(broken);
    const validation = validateMissionTopologyV58(broken);
    assert.equal(validation.valid, false, `${label}: le plan corrompu ne doit pas passer`);
    assert.ok(validation.errors.some((error) => expected.test(error)), `${label}: ${validation.errors.join('; ')}`);
  }
});

test('le graphe V58 du Tantalus relie réciproquement les seize salles par portes et deux puits d’ascenseur', () => {
  const topology = buildHubTopologyV58(HUB_DECKS, HUB_WORLD);
  const validation = validateHubTopologyV58({ decks: HUB_DECKS, world: HUB_WORLD, topology });
  assert.equal(validation.valid, true, validation.errors.join('; '));
  assert.equal(validation.roomCount, 16);
  assert.equal(validation.reachableRooms, 16);
  assert.equal(validation.connectionCount, 18, '12 portes horizontales + 6 liaisons verticales adjacentes');
  assert.equal(validation.reciprocalConnectionCount, 18);
  assert.equal(topology.edges.filter((edge) => edge.kind === 'lift').length, 6);

  const broken = structuredClone(topology);
  broken.edges.find((edge) => edge.kind === 'lift').bidirectional = false;
  const rejected = validateHubTopologyV58({ decks: HUB_DECKS, world: HUB_WORLD, topology: broken });
  assert.equal(rejected.valid, false);
  assert.ok(rejected.errors.some((error) => error.includes('not reciprocal')));

  for (const deckIndex of HUB_DECKS.keys()) {
    const network = buildHubDoorNetworkV58(HUB_DECKS, HUB_WORLD, deckIndex);
    assert.equal(network.length, 5, `${HUB_DECKS[deckIndex].id}: trois portes et deux cages`);
    assert.equal(network.filter((entry) => !entry.lift).length, 3);
    for (const lift of network.filter((entry) => entry.lift)) {
      const room = HUB_DECKS[deckIndex].rooms[lift.roomIndex];
      assert.ok(lift.x > room.xStart && lift.x < room.xEnd, `${lift.id}: cage intérieure`);
      assert.ok(lift.destinations.every((entry) => entry.roomIndex === lift.roomIndex && entry.destinationCenterX === lift.x));
    }
  }
});

test('les sockets V60 sont dérivés des cinq portes runtime de chaque pont sans inventer de sas intérieur', () => {
  const byRoom = {};
  for (const deckIndex of HUB_DECKS.keys()) {
    const sockets = buildHubRoomDoorSocketsV60(HUB_DECKS, HUB_WORLD, deckIndex);
    const validation = validateHubRoomDoorSocketsV60({ decks: HUB_DECKS, world: HUB_WORLD, deckIndex, sockets });
    assert.equal(validation.valid, true, `${HUB_DECKS[deckIndex].id}: ${validation.errors.join('; ')}`);
    assert.equal(validation.socketCount, 8, 'trois cloisons exposent deux faces et deux ascenseurs une face');
    Object.assign(byRoom, sockets);
  }

  for (const roomId of ['medical', 'quarantine', 'life-support']) {
    assert.equal(byRoom[roomId].some((socket) => socket.interior), false, `${roomId}: aucun faux sas intérieur`);
  }
  const scienceInterior = byRoom['science-lab'].filter((socket) => socket.interior);
  assert.equal(scienceInterior.length, 1, 'Science Lab possède un unique socket intérieur');
  assert.equal(scienceInterior[0].lift, true);
  assert.equal(scienceInterior[0].doorId, 'habitat:hub-aft-lift');
  assert.equal(scienceInterior[0].localX, 1096);
});

test('chaque pont du hub valide ses listes de traversée V60 sans imposer le compte prototype 2/2/1', () => withBrowserMocks(() => {
  const signatures = new Set();
  for (const [deckIndex, deck] of HUB_DECKS.entries()) {
    const canvas = { width: 1280, height: 720, getContext: mockContext, addEventListener() {} };
    const hub = new HubGame(canvas);
    hub.start({ deck: deckIndex, roomId: deck.rooms[0].id, positionX: 180 });
    const validation = validateHubRuntimeTopologyV58({
      deck,
      world: HUB_WORLD,
      platforms: hub.v51Platforms,
      ladders: hub.v51Ladders,
      vents: hub.v51Vents,
      doors: hub.doorStates
    });
    assert.equal(validation.valid, true, `${deck.id}: ${validation.errors.join('; ')}`);
    const profiles = deck.rooms.map((room) => HUB_TRAVERSAL_PROFILES_V60[room.id]);
    const expectedPlatforms = profiles.reduce((sum, profile) => sum + profile.platforms.length, 0);
    const expectedLadders = profiles.reduce((sum, profile) => sum + profile.ladders.length, 0);
    const expectedVents = profiles.reduce((sum, profile) => sum + profile.vents.length, 0);
    assert.deepEqual(
      [validation.roomCount, validation.platformCount, validation.ladderCount, validation.ventCount, validation.doorCount],
      [4, expectedPlatforms, expectedLadders, expectedVents, 5],
      `${deck.id}: contrat physique complet`
    );
    for (const profile of profiles) signatures.add(`${profile.platforms.length}/${profile.ladders.length}/${profile.vents.length}/${profile.occluders.length}`);
  }
  assert.ok(signatures.size >= 4, 'la topologie couvre plusieurs quantités et archétypes de traversée');
}));

test('le validateur V60 rejette une plateforme auteur dont la liaison au sol a disparu', () => withBrowserMocks(() => {
  const deck = HUB_DECKS[0];
  const canvas = { width: 1280, height: 720, getContext: mockContext, addEventListener() {} };
  const hub = new HubGame(canvas);
  hub.start({ deck: 0, roomId: 'bridge', positionX: 180 });
  const broken = validateHubRuntimeTopologyV58({
    deck,
    world: HUB_WORLD,
    platforms: hub.v51Platforms,
    ladders: hub.v51Ladders.filter((entry) => entry.roomId !== 'bridge'),
    vents: hub.v51Vents,
    doors: hub.doorStates
  });
  assert.equal(broken.valid, false);
  assert.ok(broken.errors.some((error) => /bridge platform .* inaccessible/.test(error)), broken.errors.join('; '));
}));
