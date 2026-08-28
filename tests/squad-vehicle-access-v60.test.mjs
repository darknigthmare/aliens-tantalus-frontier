import test from 'node:test';
import assert from 'node:assert/strict';

import { GameEngine } from '../src/game-production-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { getEntitySpriteCollisionBounds, resolveIdentitySafeNpcAnimationV57 } from '../src/game-v52-runtime.js';
import { resolveVehicleAnimation } from '../src/sprite-animation-runtime.js';
import {
  SQUAD_VEHICLE_ACCESS_V60,
  createSquadVehicleAccessRuntimeV60,
  resolveSquadVehicleAccessSocketV60,
  snapshotSquadVehicleAccessRuntimeV60
} from '../src/vehicle-access-runtime-v59.js';
import {
  CAMPAIGNS,
  CREW,
  ENEMIES,
  EQUIPMENT,
  LEVEL_SEEDS,
  VEHICLES,
  WEAPONS,
  WORLDS
} from '../src/content.js';

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1024;
    this.naturalHeight = 1024;
  }

  set src(value) { this.currentSrc = value; }
}

function withBrowserMocks(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try { return run(); } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
}

function missionOptions(vehicle = VEHICLES.find((entry) => entry.id === 'vehicle-001-m577-armored-personnel-carrier')) {
  const world = WORLDS[0];
  const campaign = { ...CAMPAIGNS[0], id: 'v60-squad-access-campaign', worldId: world.id };
  const levelSeed = {
    ...LEVEL_SEEDS.find((entry) => entry.worldId === world.id),
    id: 'v60-squad-access-level',
    worldId: world.id,
    objective: campaign.objective,
    seed: 600060
  };
  return {
    seed: levelSeed.seed,
    campaign,
    world,
    levelSeed,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES,
    vehicle,
    equipment: EQUIPMENT.slice(0, 8),
    crew: CREW,
    difficulty: 'standard'
  };
}

function createEngine(events = [], vehicle) {
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  const engine = new GameEngine(canvas, { onEvent: (event) => events.push(event) });
  engine.start(missionOptions(vehicle));
  engine.enemies = [];
  engine.hazards = [];
  engine.walls = [];
  engine.doors = [];
  engine.covers = [];
  engine.ladders = [];
  return engine;
}

function configureOccupiedVehicle(engine, { x = 1000, seatCount = 8 } = {}) {
  const vehicle = engine.vehicle;
  Object.assign(vehicle, {
    active: true,
    destroyed: false,
    occupied: true,
    driver: engine.player,
    passengers: [],
    x,
    y: 930 - vehicle.h,
    facing: 1,
    vx: 0,
    vy: 0,
    seatCount,
    accessTransition: null,
    accessSecureClock: 0,
    squadAccessRuntime: null,
    squadAccessBoardingComplete: false
  });
  Object.assign(engine.player, { alive: true, inVehicle: true, x: vehicle.x + 48, y: vehicle.y + 10 });
  const socket = resolveSquadVehicleAccessSocketV60(vehicle, resolveVehicleAnimation(vehicle)?.sheetId, 930);
  for (const [index, member] of engine.activeSquadActors().entries()) {
    Object.assign(member, {
      alive: true,
      downed: false,
      inVehicle: false,
      vehicleSeatId: null,
      vehicleAccessPhase: null,
      vehicleAccessElapsed: 0,
      vehicleAccessApproachElapsed: 0,
      x: socket.x + socket.outward * (index * 48 + 8) - member.w / 2,
      y: 930 - member.h,
      vx: 0,
      vy: 0,
      grounded: true,
      rallyClock: 0
    });
  }
  return socket;
}

function advanceSquad(engine, seconds, step = 0.05, observe = () => {}) {
  const frames = Math.ceil(seconds / step);
  for (let frame = 0; frame < frames; frame += 1) {
    engine.updateMissionSquad(step);
    observe(frame);
  }
}

function advanceUntil(engine, predicate, { seconds = 5, step = 0.025 } = {}) {
  const frames = Math.ceil(seconds / step);
  for (let frame = 0; frame < frames; frame += 1) {
    engine.updateMissionSquad(step);
    if (predicate()) return true;
  }
  return false;
}

function collisionOverlaps(first, second) {
  const a = getEntitySpriteCollisionBounds(first);
  const b = getEntitySpriteCollisionBounds(second);
  return Boolean(a && b && a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y);
}

test('les sockets V60 sont déterministes, miroir du facing et sérialisables sans références acteur', () => {
  const vehicle = { x: 100, y: 200, w: 250, h: 140, facing: 1 };
  const right = resolveSquadVehicleAccessSocketV60(vehicle, 'vehicle.m577-apc.action', 930);
  const left = resolveSquadVehicleAccessSocketV60({ ...vehicle, facing: -1 }, 'vehicle.m577-apc.action', 930);
  assert.equal(right.x, 125);
  assert.equal(left.x, 325);
  assert.equal(right.outward, -1);
  assert.equal(left.outward, 1);
  assert.equal(right.bottom, 340, 'le plancher suggéré ne doit jamais déplacer la rampe sous le véhicule');
  assert.equal(right.anchor, 'vehicle-bottom');
  assert.equal(right.supported, true);

  const runtime = createSquadVehicleAccessRuntimeV60({ mode: 'boarding', crewIds: ['crew-a', 'crew-a', 'crew-b'], socket: right });
  const snapshot = snapshotSquadVehicleAccessRuntimeV60(runtime);
  assert.deepEqual(snapshot.queue, ['crew-a', 'crew-b']);
  assert.equal(snapshot.socket.source, 'vehicle-001-m577-armored-personnel-carrier');
  assert.equal(Object.values(snapshot).includes(vehicle), false);
});

test('la file squad attend la fin exacte du secureClock joueur avant de commencer', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine(events);
  configureOccupiedVehicle(engine);
  engine.vehicle.accessSecureClock = 0.42;

  engine.updateMissionSquad(0.2);
  assert.equal(engine.vehicle.squadAccessRuntime, null);
  assert.equal(events.some((event) => event.type === 'squad-vehicle-access-start'), false);

  engine.vehicle.accessSecureClock = Number.EPSILON;
  engine.updateMissionSquad(0.2);
  assert.equal(engine.vehicle.squadAccessRuntime, null);

  engine.vehicle.accessSecureClock = 0;
  engine.updateMissionSquad(0.016);
  assert.equal(engine.vehicle.squadAccessRuntime?.mode, 'boarding');
}));

test('le M577 conserve le sol auteur V52 pendant l entrée conducteur', () => withBrowserMocks(() => {
  const options = missionOptions();
  options.missionLevel = buildMissionLevelV52({
    campaign: options.campaign,
    world: options.world,
    levelSeeds: LEVEL_SEEDS,
    templateId: 'colony-multiroute'
  });
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  const engine = new GameEngine(canvas, { onEvent: () => {} });
  engine.start(options);
  engine.enemies = [];
  engine.hazards = [];
  const authoredY = engine.vehicle.y;
  assert.equal(engine.vehicle.groundY, authoredY);
  Object.assign(engine.player, {
    x: engine.vehicle.x + engine.vehicle.w / 2 - engine.player.w / 2,
    y: engine.vehicle.y + engine.vehicle.h - engine.player.h,
    vx: 0,
    vy: 0,
    grounded: true,
    alive: true,
    inVehicle: false
  });
  assert.equal(engine.toggleVehicle(engine.player), true);
  for (let frame = 0; frame < 60 && !engine.player.inVehicle; frame += 1) engine.update(0.034);
  assert.equal(engine.player.inVehicle, true);
  engine.update(0.034);
  assert.equal(engine.vehicle.y, authoredY);
  assert.equal(engine.vehicle.groundY, authoredY);
}));

test('un M22A3 sans contrat d accès V59 dédié ne lance aucune file squad', () => withBrowserMocks(() => {
  const events = [];
  const m22a3 = VEHICLES.find((entry) => entry.id === 'vehicle-004-m22a3-jackson-tank');
  const engine = createEngine(events, m22a3);
  configureOccupiedVehicle(engine, { seatCount: 8 });

  advanceSquad(engine, 2, 0.05);

  assert.equal(engine.vehicle.squadAccessRuntime, null);
  assert.equal(engine.activeSquadActors().some((member) => member.inVehicle), false);
  assert.equal(events.some((event) => event.type === 'squad-vehicle-access-start'), false);
}));

test('la rampe UD-4L reste ancrée au bas du craft et refuse sûrement une hauteur inaccessible', () => withBrowserMocks(() => {
  const ud4l = VEHICLES.find((entry) => entry.id === 'vehicle-009-ud-4l-cheyenne-dropship');
  const direct = resolveSquadVehicleAccessSocketV60(
    { ...ud4l, x: 100, y: 200, w: 400, h: 160, facing: 1 },
    'vehicle.ud4l-cheyenne-dropship.action',
    480
  );
  assert.equal(direct.x, 164);
  assert.equal(direct.bottom, 360);
  assert.equal(direct.source, ud4l.id);
  assert.equal(direct.anchor, 'vehicle-bottom');

  const events = [];
  const engine = createEngine(events, ud4l);
  configureOccupiedVehicle(engine, { seatCount: 4 });
  engine.vehicle.y -= SQUAD_VEHICLE_ACCESS_V60.maxJumpRise + 90;
  advanceSquad(engine, 2.5, 0.05);

  assert.ok(engine.activeSquadActors().every((member) => !member.inVehicle));
  assert.ok(events.some((event) => event.type === 'squad-vehicle-access-skip' && event.reason === 'socket-inaccessible'));
}));

test('trois équipiers approchent puis embarquent un par un sans mutation instantanée', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine(events);
  configureOccupiedVehicle(engine);
  const members = engine.activeSquadActors();
  const before = members.map((member) => ({ x: member.x, y: member.y }));

  engine.updateMissionSquad(0.016);
  assert.equal(engine.vehicle.squadAccessRuntime?.mode, 'boarding');
  assert.equal(engine.vehicle.squadAccessRuntime?.phase, 'opening');
  assert.ok(members.every((member) => !member.inVehicle));
  assert.ok(members.every((member, index) => Math.abs(member.x - before[index].x) < 8));
  assert.equal(resolveVehicleAnimation(engine.vehicle)?.clipId, 'access-open');

  const beforeVehicleX = engine.vehicle.x;
  assert.equal(engine.updateVehicleDriver(engine.player, 0.2, {}), false);
  assert.equal(engine.vehicle.x, beforeVehicleX);

  let maximumConcurrentTraversal = 0;
  advanceSquad(engine, 6, 0.04, () => {
    maximumConcurrentTraversal = Math.max(
      maximumConcurrentTraversal,
      members.filter((member) => ['entering', 'exiting'].includes(member.vehicleAccessPhase)).length
    );
  });

  assert.equal(maximumConcurrentTraversal, 1);
  assert.equal(engine.vehicle.squadAccessRuntime, null);
  assert.ok(members.every((member) => member.inVehicle));
  assert.equal(new Set(engine.vehicle.passengers).size, members.length);
  assert.equal(new Set(members.map((member) => member.vehicleSeatId)).size, members.length);
  assert.equal(engine.squadTelemetry.boarded, members.length);
  assert.deepEqual(
    events.filter((event) => event.type === 'squad-vehicle-access-member-complete' && event.mode === 'boarding').map((event) => event.crewId),
    events.find((event) => event.type === 'squad-vehicle-access-start' && event.mode === 'boarding').crewIds
  );
}));

test('un équipier trop loin ne rallie ni ne téléporte dans le véhicule pendant la tentative', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine(events);
  configureOccupiedVehicle(engine, { x: 5000 });
  const [far, ...alreadyBoarded] = engine.activeSquadActors();
  Object.assign(far, { x: 80, y: 930 - far.h, grounded: true, rallyClock: 0 });
  for (const [index, member] of alreadyBoarded.entries()) {
    member.inVehicle = true;
    member.vehicleSeatId = `seat-existing-${index}`;
    engine.vehicle.passengers.push(member);
  }
  const startX = far.x;
  let previousX = far.x;
  let maximumFrameTravel = 0;
  advanceSquad(engine, SQUAD_VEHICLE_ACCESS_V60.approachTimeout + 1, 0.1, () => {
    maximumFrameTravel = Math.max(maximumFrameTravel, Math.abs(far.x - previousX));
    previousX = far.x;
  });

  assert.equal(far.inVehicle, false);
  assert.ok(far.x > startX, 'le membre doit réellement marcher vers le socket');
  assert.ok(far.x - startX < SQUAD_VEHICLE_ACCESS_V60.approachSpeed * (SQUAD_VEHICLE_ACCESS_V60.approachTimeout + 1));
  assert.ok(maximumFrameTravel < 40, `aucun saut de position attendu, déplacement frame=${maximumFrameTravel}`);
  assert.equal(events.some((event) => event.type === 'squad-action' && event.action === 'rally' && event.crewId === far.crewId), false);
  assert.equal(events.some((event) => event.type === 'squad-vehicle-access-skip' && event.crewId === far.crewId && event.reason === 'approach-timeout'), true);
}));

test('la sortie ouvre, fait émerger chaque passager puis ferme sans sortie groupée instantanée', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine(events);
  configureOccupiedVehicle(engine);
  const members = engine.activeSquadActors();
  advanceSquad(engine, 6, 0.04);
  assert.ok(members.every((member) => member.inVehicle));

  engine.player.inVehicle = false;
  engine.vehicle.driver = null;
  engine.vehicle.occupied = false;
  engine.updateMissionSquad(0.016);
  assert.equal(engine.vehicle.squadAccessRuntime?.mode, 'disembarking');
  assert.ok(members.every((member) => member.inVehicle), 'l’ouverture ne doit pas éjecter toute l’escouade');

  let maximumConcurrentTraversal = 0;
  advanceSquad(engine, 5, 0.04, () => {
    maximumConcurrentTraversal = Math.max(maximumConcurrentTraversal, members.filter((member) => member.vehicleAccessPhase === 'exiting').length);
  });
  assert.equal(maximumConcurrentTraversal, 1);
  assert.equal(engine.vehicle.squadAccessRuntime, null);
  assert.ok(members.every((member) => !member.inVehicle));
  assert.ok(members.every((member) => member.vehicleSeatId === null));
  assert.equal(engine.vehicle.passengers.filter((member) => member.squadMember).length, 0);
  assert.equal(engine.squadTelemetry.disembarked, members.length);
  assert.equal(events.filter((event) => event.type === 'squad-vehicle-access-member-complete' && event.mode === 'disembarking').length, members.length);
}));

test('destruction pendant entering et downed pendant exiting replacent le PNJ hors coque', () => withBrowserMocks(() => {
  const enteringEngine = createEngine();
  configureOccupiedVehicle(enteringEngine, { seatCount: 2 });
  const enteringMember = enteringEngine.activeSquadActors()[0];
  assert.equal(
    advanceUntil(enteringEngine, () => enteringMember.vehicleAccessPhase === 'entering'),
    true
  );
  assert.equal(collisionOverlaps(enteringMember, enteringEngine.vehicle), true, 'la traversée doit être réellement engagée dans la coque');

  enteringEngine.damageVehicle(999999, 'v60-destruction-test');
  assert.equal(enteringEngine.vehicle.destroyed, true);
  assert.equal(enteringMember.inVehicle, false);
  assert.equal(enteringMember.vehicleAccessPhase, null);
  assert.equal(enteringMember.vehicleSeatId, null);
  assert.equal(collisionOverlaps(enteringMember, enteringEngine.vehicle), false);

  const exitingEngine = createEngine();
  configureOccupiedVehicle(exitingEngine, { seatCount: 2 });
  advanceSquad(exitingEngine, 4, 0.04);
  const exitingMember = exitingEngine.activeSquadActors().find((member) => member.inVehicle);
  assert.ok(exitingMember);
  exitingEngine.player.inVehicle = false;
  exitingEngine.vehicle.driver = null;
  exitingEngine.vehicle.occupied = false;
  assert.equal(
    advanceUntil(exitingEngine, () => exitingMember.vehicleAccessPhase === 'exiting'),
    true
  );
  assert.equal(collisionOverlaps(exitingMember, exitingEngine.vehicle), true, 'la sortie doit être réellement engagée dans la coque');

  exitingEngine.damageSquadMember(exitingMember, 999999, { source: 'v60-downed-test' });
  assert.equal(exitingMember.downed, true);
  assert.equal(exitingMember.inVehicle, false);
  assert.equal(exitingMember.vehicleAccessPhase, null);
  assert.equal(exitingMember.vehicleSeatId, null);
  assert.equal(collisionOverlaps(exitingMember, exitingEngine.vehicle), false);
}));

test('fail puis restart checkpoint purge les passagers squad et les replace loin de l ancien véhicule', () => withBrowserMocks(() => {
  const engine = createEngine();
  configureOccupiedVehicle(engine, { x: 4200 });
  engine.setCheckpoint('security', 1220, 720);
  advanceSquad(engine, 6, 0.04);
  assert.ok(engine.activeSquadActors().every((member) => member.inVehicle));
  const oldVehicleX = engine.vehicle.x;

  engine.failMission('v60-checkpoint-test');
  assert.equal(engine.mission.state, 'failed');
  assert.ok(engine.activeSquadActors().every((member) => !member.inVehicle && member.vehicleSeatId === null));
  assert.equal(engine.vehicle.passengers.some((passenger) => passenger?.squadMember), false);

  assert.equal(engine.restartFromCheckpoint(), true);
  assert.equal(engine.mission.state, 'active');
  assert.ok(engine.activeSquadActors().every((member) => !member.inVehicle && member.vehicleAccessPhase === null));
  assert.equal(engine.vehicle.passengers.some((passenger) => passenger?.squadMember), false);
  assert.ok(engine.activeSquadActors().every((member) => Math.abs(member.x - engine.checkpoint.x) < 520));
  assert.ok(engine.activeSquadActors().every((member) => Math.abs(member.x - oldVehicleX) > 1000));
}));

test('un snapshot squad lié à un ancien véhicule ne restaure aucun passager dans un autre châssis', () => withBrowserMocks(() => {
  const source = createEngine();
  configureOccupiedVehicle(source, { seatCount: 2 });
  advanceSquad(source, 4, 0.04);
  const captured = source.captureSquadState();
  assert.equal(captured.vehicleId, source.vehicle.id);
  assert.ok(captured.members.some((member) => member.inVehicle));

  const m22a3 = VEHICLES.find((entry) => entry.id === 'vehicle-004-m22a3-jackson-tank');
  const resumed = createEngine([], m22a3);
  configureOccupiedVehicle(resumed, { seatCount: 8 });
  assert.equal(resumed.restoreSquadState(captured), resumed.squadActors.length);
  assert.ok(resumed.activeSquadActors().every((member) => !member.inVehicle && member.vehicleSeatId === null));
  assert.equal(resumed.vehicle.passengers.some((passenger) => passenger?.squadMember), false);
}));

test('la capacité réelle gouverne la file et un exosquelette monoplace ne capture aucun PNJ', () => withBrowserMocks(() => {
  const engine = createEngine();
  configureOccupiedVehicle(engine, { seatCount: 2 });
  advanceSquad(engine, 4, 0.04);
  assert.equal(engine.activeSquadActors().filter((member) => member.inVehicle).length, 1);

  const loader = VEHICLES.find((entry) => entry.id === 'vehicle-007-p-5000-powered-work-loader');
  const loaderEngine = createEngine([], loader);
  configureOccupiedVehicle(loaderEngine, { seatCount: 1 });
  loaderEngine.updateMissionSquad(0.5);
  assert.equal(loaderEngine.vehicle.squadAccessRuntime, null);
  assert.equal(loaderEngine.activeSquadActors().some((member) => member.inVehicle), false);
}));

test('le hot-join coop transfère le siège engagé sans doublon et réserve sa place passager', () => withBrowserMocks(() => {
  const engine = createEngine();
  configureOccupiedVehicle(engine, { seatCount: 2 });
  const counterpart = engine.squadActors.find((member) => member.crewId === engine.coop.operatorId);
  assert.ok(counterpart);

  advanceSquad(engine, 4, 0.04);
  assert.equal(counterpart.inVehicle, true);
  const committedSeat = counterpart.vehicleSeatId;
  assert.ok(committedSeat);

  engine.setCoop(true);
  assert.equal(engine.coop.inVehicle, true);
  assert.equal(engine.coop.vehicleSeatId, committedSeat);
  assert.equal(counterpart.inVehicle, false);
  assert.equal(engine.vehicle.passengers.includes(engine.coop), true);
  assert.equal(engine.vehicle.passengers.includes(counterpart), false);

  engine.updateMissionSquad(0.1);
  assert.equal(engine.vehicle.squadAccessRuntime, null, 'le siège du coop ne doit pas être réattribué à une IA');

  engine.setCoop(false);
  assert.equal(engine.coop.inVehicle, false);
  assert.equal(counterpart.inVehicle, false);
  assert.equal(engine.vehicle.passengers.includes(engine.coop), false);
  engine.updateMissionSquad(0.016);
  assert.equal(engine.vehicle.squadAccessRuntime?.mode, 'boarding');
  assert.equal(engine.vehicle.squadAccessRuntime?.queue.includes(counterpart.crewId), true);
  assert.equal(counterpart.inVehicle, false, 'le PNJ revenu du coop doit remonter physiquement');
}));

test('le clip d’accès conserve l’identité NPC et le siège engagé survit au snapshot de reprise', () => withBrowserMocks(() => {
  const engine = createEngine();
  configureOccupiedVehicle(engine, { seatCount: 2 });
  const member = engine.activeSquadActors()[0];
  advanceSquad(engine, 0.8, 0.04);
  assert.ok(['entering', 'approaching'].includes(member.vehicleAccessPhase));
  if (member.vehicleAccessPhase === 'entering') {
    const request = resolveIdentitySafeNpcAnimationV57(member);
    assert.match(request.sheetId, /^npc[.]/);
    assert.equal(request.clipId, 'traversal');
  }
  advanceSquad(engine, 2, 0.04);
  assert.equal(member.inVehicle, true);
  assert.ok(member.vehicleSeatId);
  const captured = engine.captureSquadState();
  assert.equal(captured.members.find((entry) => entry.crewId === member.crewId).vehicleSeatId, member.vehicleSeatId);

  const resumed = createEngine();
  Object.assign(resumed.vehicle, { active: true, occupied: true, driver: resumed.player, passengers: [] });
  resumed.player.inVehicle = true;
  assert.equal(resumed.restoreSquadState(captured), resumed.squadActors.length);
  const restored = resumed.squadActors.find((entry) => entry.crewId === member.crewId);
  assert.equal(restored.inVehicle, true);
  assert.equal(restored.vehicleSeatId, member.vehicleSeatId);
  assert.equal(resumed.vehicle.passengers.filter((entry) => entry === restored).length, 1);
}));
