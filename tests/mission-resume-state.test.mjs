import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine, RESUME_STATE_SCHEMA } from '../src/game-production-runtime.js';
import {
  CAMPAIGNS, CREW, ENEMIES, EQUIPMENT, LEVEL_SEEDS, NEURO_XENO_PROFILES, VEHICLES, WEAPONS, WORLDS
} from '../src/content.js';

class MockImage {
  constructor() { this.complete = true; this.naturalWidth = 1024; this.naturalHeight = 1024; }
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

function missionOptions() {
  const world = WORLDS.find((entry) => entry.biomes.includes('industrial')) || WORLDS[0];
  const sourceCampaign = CAMPAIGNS.find((entry) => entry.objective === 'seal the hive') || CAMPAIGNS[0];
  const campaign = { ...sourceCampaign, id: 'resume-contract-campaign', mode: 'FRONTIER', objective: 'seal the hive', worldId: world.id, routes: 5 };
  const sourceLevel = LEVEL_SEEDS.find((entry) => entry.worldId === world.id) || LEVEL_SEEDS[0];
  const levelSeed = { ...sourceLevel, id: 'resume-contract-level', worldId: world.id, objective: campaign.objective, routes: 5, seed: 515151 };
  return {
    seed: levelSeed.seed,
    world,
    campaign,
    levelSeed,
    weapon: WEAPONS[4],
    enemyCatalog: ENEMIES,
    vehicle: VEHICLES.find((entry) => entry.family === 'ground') || VEHICLES[0],
    equipment: EQUIPMENT.slice(0, 8),
    crew: CREW,
    neuroProfile: NEURO_XENO_PROFILES.find((entry) => entry.playerClassCompatible),
    difficulty: 'standard'
  };
}

test('captureResumeState restaure une mission sans projectiles, entrées fantômes ni ressources à refarmer', () => withBrowserMocks(() => {
  const options = missionOptions();
  const engine = createEngine();
  engine.setCoop(true);
  engine.start(options);

  Object.assign(engine.player, { x: 1460, y: 714, health: 47, armor: 23, ammo: 3, ammoReserve: 41, kills: 6, facing: -1 });
  Object.assign(engine.coop, { x: 1395, y: 714, health: 62, armor: 11, ammo: 5, ammoReserve: 29, kills: 2 });
  engine.checkpoint = { id: 'security', x: 1410, y: 714 };
  Object.assign(engine.mission, { elapsed: 184.5, retries: 2, casualties: 1, phase: 'secure-route' });
  Object.assign(engine.mission.objectives, { power: true, route: true, boss: false, archive: true, extract: false });
  Object.assign(engine.inventory, { medkits: 3, salvage: 91, intel: 7, securityKeys: 1, cutter: true });
  Object.assign(engine.tracker, {
    energy: 37, cooldown: 2.4, pulses: 3,
    contacts: [{ id: engine.enemies[1].id, x: engine.enemies[1].x, y: engine.enemies[1].y, distance: 322, threat: 'hunter' }]
  });

  engine.doors[0].open = true;
  engine.doors[0].progress = 0.86;
  engine.vents[0].open = true;
  engine.supplies[0].used = true;
  engine.weaponPickup.taken = true;
  engine.toolPickup.taken = true;
  engine.powerNode.active = true;
  engine.archiveTerminal.recovered = true;
  engine.objective.complete = false;
  if (engine.objectiveNodes[0]) {
    engine.objectiveNodes[0].active = true;
    engine.objectiveState.nodesActivated = 1;
  }
  Object.assign(engine.objectiveState, { started: true, holdElapsed: 4, trackerPulses: 3 });

  const deadEnemy = engine.enemies.find((enemy) => !enemy.isBoss && enemy.id !== engine.neuroCounterplay.adversaryId);
  engine.defeatEnemy(deadEnemy, engine.player);
  const collectedDrop = engine.drops.find((drop) => drop.id === `salvage-${deadEnemy.id}`);
  collectedDrop.taken = true;
  engine.inventory.salvage += collectedDrop.amount;
  const woundedEnemy = engine.enemies.find((enemy) => enemy.alive && !enemy.isBoss && enemy !== deadEnemy);
  Object.assign(woundedEnemy, { health: Math.max(1, Math.round(woundedEnemy.maxHealth * 0.38)), x: 2788, y: 801, alert: true, revealed: 5 });

  Object.assign(engine.vehicle, {
    x: 3300, y: 812, hull: Math.round(engine.vehicle.maxHull * 0.54), fuel: 43,
    turretAmmo: 17, turretReserve: 21, occupied: true, driver: engine.player, passengers: [engine.coop], destroyed: false
  });
  engine.player.inVehicle = true;
  engine.coop.inVehicle = true;

  const equipment = [...engine.equipmentActions.values()][0];
  equipment.remaining = 0;
  equipment.uses = 1;
  engine.neuro.signal = 58;
  engine.neuro.state = 'linked';
  engine.neuro.relayX = 1460;
  Object.assign(engine.neuroCounterplay, { pulses: 1, pulseCooldown: 2.5, drainApplied: 12, state: 'counter-pulse', neutralized: false });
  engine.neuroCounterplay.relay.active = true;
  engine.bullets.push({ id: 'transient-player-shot' });
  engine.hostileProjectiles.push({ id: 'transient-acid-shot' });
  engine.particles.push({ id: 'transient-particle' });

  const resumeState = engine.captureResumeState();
  assert.equal(resumeState.schema, RESUME_STATE_SCHEMA);
  assert.doesNotThrow(() => JSON.stringify(resumeState));
  assert.equal('bullets' in resumeState, false);
  assert.equal('hostileProjectiles' in resumeState, false);
  assert.equal('particles' in resumeState, false);

  resumeState.doors.push({ id: 'ghost-door', open: true, progress: 1 });
  resumeState.enemies.push({ id: 'ghost-enemy', alive: true, health: 999999, x: -999999, y: 999999 });
  resumeState.equipment.push({ id: 'ghost-equipment', remaining: 999999, uses: -10 });
  resumeState.tracker.contacts.push({ id: 'ghost-enemy', x: 0, y: 0, distance: 1 });
  resumeState.drops.push({ id: 'salvage-ghost-enemy', type: 'salvage', amount: 999999, x: 0, y: 0, taken: false });

  const events = [];
  const resumed = createEngine(events);
  resumed.start({ ...options, resumeState });

  assert.deepEqual(resumed.lastResumeResult.applied, true);
  assert.ok(resumed.lastResumeResult.restored > 20);
  assert.ok(events.some((event) => event.type === 'mission-resumed'));
  assert.equal(resumed.checkpoint.id, 'security');
  assert.deepEqual(
    { x: resumed.player.x, y: resumed.player.y, health: resumed.player.health, armor: resumed.player.armor, ammo: resumed.player.ammo, reserve: resumed.player.ammoReserve, kills: resumed.player.kills },
    { x: 1460, y: 714, health: 47, armor: 23, ammo: 3, reserve: 41, kills: 7 }
  );
  assert.equal(resumed.coopEnabled, true);
  assert.equal(resumed.coop.health, 62);
  assert.equal(resumed.mission.elapsed, 184.5);
  assert.equal(resumed.mission.retries, 2);
  assert.deepEqual(resumed.mission.objectives, resumeState.objectives);
  assert.deepEqual(resumed.inventory, resumeState.inventory);
  assert.equal(resumed.tracker.energy, 37);
  assert.equal(resumed.tracker.contacts.length, 1);
  assert.equal(resumed.tracker.contacts[0].id, engine.enemies[1].id);
  assert.equal(resumed.doors[0].open, true);
  assert.equal(resumed.doors[0].progress, 0.86);
  assert.equal(resumed.vents[0].open, true);
  assert.equal(resumed.supplies[0].used, true);
  assert.equal(resumed.weaponPickup.taken, true);
  assert.equal(resumed.toolPickup.taken, true);
  assert.equal(resumed.powerNode.active, true);
  assert.equal(resumed.archiveTerminal.recovered, true);
  assert.equal(resumed.objectiveNodes[0]?.active, true);

  const resumedDead = resumed.enemies.find((enemy) => enemy.id === deadEnemy.id);
  const resumedWounded = resumed.enemies.find((enemy) => enemy.id === woundedEnemy.id);
  assert.equal(resumedDead.alive, false);
  assert.equal(resumedDead.health, 0);
  assert.equal(resumedWounded.health, woundedEnemy.health);
  assert.equal(resumedWounded.x, 2788);
  assert.equal(resumed.enemies.some((enemy) => enemy.id === 'ghost-enemy'), false);
  assert.equal(resumed.drops.some((drop) => drop.id === 'salvage-ghost-enemy'), false);
  assert.equal(resumed.drops.find((drop) => drop.id === collectedDrop.id).taken, true);

  assert.equal(resumed.vehicle.hull, engine.vehicle.hull);
  assert.equal(resumed.vehicle.fuel, 43);
  assert.equal(resumed.vehicle.driver, resumed.player);
  assert.deepEqual(resumed.vehicle.passengers, [resumed.coop]);
  assert.equal(resumed.player.inVehicle, true);
  assert.equal(resumed.coop.inVehicle, true);
  assert.equal(resumed.equipmentActions.get(equipment.id).remaining, 0);
  assert.equal(resumed.equipmentActions.get(equipment.id).uses, 1);
  assert.equal(resumed.equipmentActions.has('ghost-equipment'), false);
  assert.equal(resumed.neuro.signal, 58);
  assert.equal(resumed.neuroCounterplay.pulses, 1);
  assert.equal(resumed.neuroCounterplay.relay.active, true);
  assert.deepEqual(resumed.bullets, []);
  assert.deepEqual(resumed.hostileProjectiles, []);
  assert.deepEqual(resumed.particles, []);

  const dropCount = resumed.drops.length;
  resumed.defeatEnemy(resumedDead, resumed.player);
  assert.equal(resumed.drops.length, dropCount, 'un ennemi déjà mort ne régénère aucune ressource');
}));
