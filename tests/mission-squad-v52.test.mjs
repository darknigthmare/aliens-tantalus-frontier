import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
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

function createEngine(events = []) {
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  return new GameEngine(canvas, { onEvent: (event) => events.push(event) });
}

function missionOptions(overrides = {}) {
  const world = overrides.world || WORLDS[0];
  const campaign = overrides.campaign || { ...CAMPAIGNS[0], id: 'v52-squad-campaign', worldId: world.id };
  const levelSeed = overrides.levelSeed || {
    ...LEVEL_SEEDS.find((entry) => entry.worldId === world.id),
    id: 'v52-squad-level',
    worldId: world.id,
    objective: campaign.objective,
    seed: 520052
  };
  return {
    seed: levelSeed.seed,
    campaign,
    world,
    levelSeed,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES,
    vehicle: VEHICLES.find((entry) => entry.family === 'ground') || VEHICLES[0],
    equipment: EQUIPMENT.slice(0, 8),
    crew: CREW,
    difficulty: 'standard',
    ...overrides
  };
}

test('une reprise d’une autre identité ne peut pas modifier l’escouade v52', () => withBrowserMocks(() => {
  const options = missionOptions();
  const source = createEngine();
  source.start(options);
  const resumeState = source.captureResumeState();
  resumeState.identity.campaignId = 'campagne-étrangère';
  resumeState.squad.members[0].health = 1;
  resumeState.squad.members[0].x = 4200;

  const resumed = createEngine();
  resumed.start({ ...options, resumeState });

  assert.equal(resumed.lastResumeResult.applied, false);
  assert.equal(resumed.lastResumeResult.reason, 'identity-mismatch');
  assert.notEqual(resumed.squadActors[0].health, 1);
  assert.notEqual(resumed.squadActors[0].x, 4200);
  assert.equal(resumed.lastResumeResult.squadRestored, 0);
}));

test('la reprise conserve les zéros valides, le bleedout et les passagers IA sans doublon', () => withBrowserMocks(() => {
  const options = missionOptions();
  const source = createEngine();
  source.start(options);
  const [downed, passenger] = source.squadActors;

  Object.assign(source.vehicle, { active: true, destroyed: false, occupied: true, driver: source.player, passengers: [passenger] });
  source.player.inVehicle = true;
  Object.assign(downed, { x: 0, y: 0, health: 0, armor: 0, alive: false, downed: true, lost: false, bleedOut: 0, inVehicle: false });
  passenger.inVehicle = true;
  const resumeState = source.captureResumeState();

  const resumed = createEngine();
  resumed.start({ ...options, resumeState });
  const restoredDowned = resumed.squadActors.find((member) => member.crewId === downed.crewId);
  const restoredPassenger = resumed.squadActors.find((member) => member.crewId === passenger.crewId);

  assert.equal(resumed.lastResumeResult.applied, true);
  assert.equal(resumed.lastResumeResult.squadRestored, source.squadActors.length);
  assert.equal(restoredDowned.x, 0);
  assert.equal(restoredDowned.y, 0);
  assert.equal(restoredDowned.bleedOut, 0);
  assert.equal(restoredPassenger.inVehicle, true);
  assert.equal(resumed.vehicle.passengers.filter((member) => member === restoredPassenger).length, 1);
}));

test('un bleedout expiré produit une seule perte et une seule casualty', () => withBrowserMocks(() => {
  const events = [];
  const engine = createEngine(events);
  engine.start(missionOptions());
  const member = engine.activeSquadActors()[0];
  Object.assign(member, { health: 0, alive: false, downed: true, lost: false, bleedOut: 0.05 });
  const casualties = engine.mission.casualties;

  engine.updateMissionSquad(0.1);
  engine.updateMissionSquad(1);

  assert.equal(member.alive, false);
  assert.equal(member.downed, false);
  assert.equal(member.lost, true);
  assert.equal(engine.mission.casualties, casualties + 1);
  assert.equal(events.filter((event) => event.type === 'squad-lost' && event.crewId === member.crewId).length, 1);
}));

test('un hazard darkness à zéro dégât ne blesse ni ne projette le PNJ', () => withBrowserMocks(() => {
  const engine = createEngine();
  engine.start(missionOptions());
  const member = engine.activeSquadActors()[0];
  Object.assign(member, { x: 300, y: 400, health: 73, armor: 19, vy: 0, hazardClock: 0, inVehicle: false });
  engine.hazards = [{ id: 'darkness-test', kind: 'darkness', damage: 0, active: true, x: 300, y: member.y + member.h - 12, w: 80, h: 20 }];

  engine.applySquadHazard(member);

  assert.equal(member.health, 73);
  assert.equal(member.armor, 19);
  assert.equal(member.vy, 0);
  assert.ok(member.hazardClock > 0);
}));

test('la régénération de réserve véhicule est entière et identique à 30 et 60 Hz', () => withBrowserMocks(() => {
  const simulate = (fps) => {
    const engine = createEngine();
    engine.start(missionOptions());
    const member = engine.activeSquadActors()[0];
    member.specialty = 'pilot';
    member.inVehicle = true;
    member.vehicleAmmoAccumulator = 0;
    Object.assign(engine.vehicle, { active: true, destroyed: false, occupied: true, turretReserve: 0, passengers: [member] });
    const frames = Math.round(8.2 * fps);
    for (let frame = 0; frame < frames; frame += 1) engine.updateSquadVehicleSeat(member, 0, engine.player, 1 / fps);
    return engine.vehicle.turretReserve;
  };

  const at30 = simulate(30);
  const at60 = simulate(60);
  assert.equal(at30, 2);
  assert.equal(at60, 2);
  assert.equal(at30, at60);
  assert.equal(Number.isInteger(at30), true);
}));

test('le hot-join coop transfère l’état et un événement IA ne sérialise jamais le PNJ comme coop', () => withBrowserMocks(() => {
  const events = [];
  let capturedDuringDown = null;
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  const engine = new GameEngine(canvas, {
    onEvent: (event) => {
      events.push(event);
      if (event.type === 'squad-down') capturedDuringDown = engine.captureResumeState();
    }
  });
  engine.start(missionOptions());

  const counterpart = engine.squadActors.find((member) => member.crewId === engine.coop.operatorId);
  Object.assign(counterpart, { x: 3000, y: 700, health: 9, armor: 4, alive: true, downed: false });
  engine.setCoop(true);
  assert.deepEqual(
    { x: engine.coop.x, y: engine.coop.y, health: engine.coop.health, armor: engine.coop.armor },
    { x: 3000, y: 700, health: 9, armor: 4 }
  );
  Object.assign(engine.coop, { x: 2500, y: 650, health: 27, armor: 2 });
  engine.setCoop(false);
  assert.deepEqual(
    { x: counterpart.x, y: counterpart.y, health: counterpart.health, armor: counterpart.armor },
    { x: 2500, y: 650, health: 27, armor: 2 }
  );

  Object.assign(engine.coop, { x: 125, y: 710, health: 77, armor: 8 });
  Object.assign(engine.player, { x: 0, y: 710 });
  const target = engine.activeSquadActors().find((member) => member !== counterpart);
  const enemy = engine.enemies.find((entry) => entry.alive && !entry.isBoss);
  Object.assign(target, { x: 2000, y: 800, health: 1, armor: 0, alive: true, downed: false, inVehicle: false });
  Object.assign(enemy, { x: 2000, y: 800, attackClock: 0, rangedClock: 99, alert: true, staggerClock: 0, damage: 50 });
  engine.updateEnemy(enemy, 0.016);

  assert.ok(capturedDuringDown, 'squad-down doit être émis pendant l’attaque IA');
  assert.equal(capturedDuringDown.coop.x, 125);
  assert.equal(capturedDuringDown.coop.health, 77);
  assert.notEqual(capturedDuringDown.coop.x, target.x);
}));
