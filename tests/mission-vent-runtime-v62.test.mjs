import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
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
import {
  MISSION_VENT_NETWORKS_V62,
  getVentTransitPositionV62
} from '../src/vent-network-v62.js';

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1600;
    this.naturalHeight = 900;
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

const CASES = Object.freeze([
  Object.freeze({ templateId: 'ship-interior-vertical', world: WORLDS[6] || WORLDS[0], campaign: CAMPAIGNS[0], variant: 12 }),
  Object.freeze({ templateId: 'colony-multiroute', world: WORLDS[0], campaign: CAMPAIGNS[1] || CAMPAIGNS[0], variant: 13 }),
  Object.freeze({ templateId: 'planet-exterior', world: WORLDS[9] || WORLDS[0], campaign: CAMPAIGNS[7] || CAMPAIGNS[0], variant: 14 })
]);

function buildPlan(entry) {
  const campaign = {
    ...entry.campaign,
    id: `v62-production-vent-${entry.templateId}`,
    worldId: entry.world.id,
    objective: entry.campaign?.objective || 'secure the mission area'
  };
  return buildMissionLevelV52({
    campaign,
    world: entry.world,
    levelSeeds: LEVEL_SEEDS,
    templateId: entry.templateId,
    variant: entry.variant
  });
}

function optionsFor(plan, overrides = {}) {
  return {
    seed: plan.levelSeed.seed,
    campaign: plan.campaign,
    world: plan.world,
    levelSeed: plan.levelSeed,
    missionLevel: plan,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES,
    vehicle: VEHICLES.find((entry) => entry.family === 'ground') || VEHICLES[0],
    equipment: EQUIPMENT.slice(0, 8),
    crew: CREW,
    difficulty: 'standard',
    ...overrides
  };
}

function createEngine(plan, events = [], overrides = {}) {
  const context = new Proxy({}, { get: () => () => {} });
  const canvas = { width: 1280, height: 720, getContext: () => context, addEventListener: () => {} };
  const engine = new GameEngine(canvas, { onEvent: (event) => events.push(event) });
  engine.start(optionsFor(plan, overrides));
  return engine;
}

function placeAtPortal(actor, portal, offsetX = 0) {
  actor.x = portal.worldPosition.x + offsetX - actor.w / 2;
  actor.y = portal.worldPosition.y - actor.h;
  actor.depth = portal.worldPosition.depth;
  actor.vx = 0;
  actor.vy = 0;
  actor.grounded = true;
  actor.climbing = false;
  actor.inVehicle = false;
}

function noOpAudio(ventContacts = []) {
  return new Proxy({ vent: (payload) => ventContacts.push(payload) }, {
    get: (target, key) => key in target ? target[key] : () => {}
  });
}

test('le GameEngine de production consomme les trois réseaux mission V62 sans conserver les téléporteurs V52', () => withBrowserMocks(() => {
  for (const entry of CASES) {
    const plan = buildPlan(entry);
    const events = [];
    const engine = createEngine(plan, events);
    engine.audio = noOpAudio();
    const network = MISSION_VENT_NETWORKS_V62[entry.templateId];
    const entrance = network.entrances[0];
    const snapshot = engine.getMissionLevelSnapshot();

    assert.equal(engine.missionVentNetworkV62, network, `${entry.templateId}: réseau auteur branché dans le moteur`);
    assert.equal(snapshot.ventRuntimeV62.networkId, network.id);
    assert.equal(engine.vents.length, network.entrances.length + network.exits.length);
    assert.ok(engine.vents.every((portal) => portal.authoredNetworkV62 && !('targetAnchorX' in portal) && !('targetAnchorY' in portal)));
    assert.ok(plan.geometry.vents.every((legacy) => !engine.vents.some((portal) => portal.id === legacy.id)), 'les anciens raccourcis instantanés restent hors runtime');

    placeAtPortal(engine.player, entrance);
    const physicalPose = { x: engine.player.x, y: engine.player.y };
    engine.inventory.cutter = false;
    engine.interact(engine.player);
    assert.equal(engine.player.ventTransit, undefined);

    engine.inventory.cutter = true;
    assert.equal(engine.interact(engine.player), true, `${entry.templateId}: entrée physique accessible`);
    assert.equal(engine.player.ventTransit.phase, 'entering');
    assert.deepEqual({ x: engine.player.x, y: engine.player.y }, physicalPose, 'aucune téléportation à l interaction');

    const inheritedEnemy = engine.enemies.find((enemy) => !enemy.isBoss) || engine.enemies[0];
    assert.ok(inheritedEnemy, `${entry.templateId}: ennemi de production présent`);
    inheritedEnemy.alive = true;
    inheritedEnemy.dormant = false;
    inheritedEnemy.attackClock = 5;
    inheritedEnemy.rangedClock = 5;
    inheritedEnemy.alert = true;
    inheritedEnemy.x = entrance.worldPosition.x + 260;
    inheritedEnemy.y = entrance.worldPosition.y - inheritedEnemy.h;
    const elapsedBefore = engine.mission.elapsed;
    const animationBefore = engine.animationTime;
    engine.update(0.1);

    assert.ok(engine.mission.elapsed > elapsedBefore, `${entry.templateId}: horloge mission héritée active`);
    assert.ok(engine.animationTime > animationBefore, `${entry.templateId}: simulation héritée active`);
    assert.ok(inheritedEnemy.attackClock < 5, `${entry.templateId}: IA héritée non gelée pendant le transit joueur`);
    assert.deepEqual({ x: engine.player.x, y: engine.player.y }, physicalPose, 'le corps reste à la bouche tant que la sortie physique n est pas atteinte');
    assert.ok(events.some((event) => event.type === 'mission-vent-enter' && event.networkId === network.id));
  }
}));

test('allié et ennemi réels planifient puis parcourent le graphe, tandis que tracker et audio excluent le joueur', () => withBrowserMocks(() => {
  const plan = buildPlan(CASES[0]);
  const events = [];
  const engine = createEngine(plan, events);
  const ventAudio = [];
  engine.audio = noOpAudio(ventAudio);
  const network = engine.missionVentNetworkV62;
  const entrance = network.entrances[0];
  const exit = network.exits.at(-1);
  const ally = engine.squadActors[0];
  const enemy = engine.enemies.find((candidate) => candidate.alive && !candidate.isBoss);
  const inheritedEnemy = engine.enemies.find((candidate) => candidate !== enemy && candidate.alive && !candidate.isBoss);
  assert.ok(ally && enemy && inheritedEnemy, 'les entités réelles de la simulation sont disponibles');

  placeAtPortal(engine.player, entrance, 70);
  engine.inventory.cutter = true;
  assert.equal(engine.interact(engine.player), true);
  placeAtPortal(ally, entrance);
  placeAtPortal(enemy, entrance);
  assert.ok(engine.beginMissionVentTraversalV62(ally, { entranceId: entrance.id, exitId: exit.id, actorKind: 'ally', automatic: true }));
  assert.ok(engine.beginMissionVentTraversalV62(enemy, { entranceId: entrance.id, exitId: exit.id, actorKind: 'enemy', automatic: true }));
  assert.equal(engine.missionVentActorsV62.get(ally.ventRuntimeIdV62), ally, 'le plan allié utilise l acteur de squad réel');
  assert.equal(engine.missionVentActorsV62.get(enemy.ventRuntimeIdV62), enemy, 'le plan ennemi utilise l acteur de combat réel');

  const contacts = engine.createMissionVentContactOutputsV62(engine.player);
  assert.equal(contacts.some((output) => output.tracker.actorKind === 'player'), false, 'aucun auto-contact joueur');
  assert.ok(contacts.some((output) => output.tracker.actorId === ally.id && output.tracker.actorKind === 'ally'));
  assert.ok(contacts.some((output) => output.tracker.actorId === enemy.id && output.tracker.actorKind === 'enemy'));
  engine.tracker.cooldown = 0;
  engine.tracker.energy = 100;
  assert.equal(engine.activateTracker(engine.player), true);
  assert.ok(engine.tracker.contacts.some((contact) => contact.id === enemy.id && contact.source === 'vent-motion' && contact.concealed));
  engine.emitMissionVentContactsV62(engine.player);
  assert.ok(ventAudio.some((contact) => contact.actorId === enemy.id && contact.source === 'vent-physical-contact'));
  assert.equal(ventAudio.some((contact) => contact.actorKind === 'player'), false);

  inheritedEnemy.alert = true;
  inheritedEnemy.attackClock = 4;
  inheritedEnemy.rangedClock = 4;
  inheritedEnemy.x = entrance.worldPosition.x + 300;
  inheritedEnemy.y = entrance.worldPosition.y - inheritedEnemy.h;
  engine.update(0.1);
  assert.ok(inheritedEnemy.attackClock < 4, 'les autres ennemis continuent leur simulation pendant les transits');

  for (let step = 0; step < 100 && (ally.ventTransit || enemy.ventTransit); step += 1) engine.update(0.25);
  assert.equal(ally.ventTransit, null, 'l allié ressort physiquement');
  assert.equal(enemy.ventTransit, null, 'l ennemi ressort physiquement');
  assert.equal(engine.squadActors.includes(ally), true, 'identité alliée conservée');
  assert.equal(engine.enemies.includes(enemy), true, 'identité ennemie conservée');
  assert.equal(enemy.alive, true, 'l ennemi redevient actif uniquement après sa sortie');
  assert.ok(Math.abs(ally.x + ally.w / 2 - exit.worldPosition.x) <= 1);
  assert.equal(Math.round(enemy.spawnX + enemy.w / 2), Math.round(exit.worldPosition.x), 'la sortie devient le nouveau point physique de patrouille');
  assert.ok(Math.abs(enemy.x + enemy.w / 2 - exit.worldPosition.x) <= 70, 'l ennemi poursuit sa simulation autour de la sortie');
  assert.ok(events.some((event) => event.type === 'mission-vent-exit-complete' && event.actorId === enemy.id));
}));

test('une reprise de production conserve exactement joueur et allié au milieu de leur transit', () => withBrowserMocks(() => {
  const plan = buildPlan(CASES[1]);
  const source = createEngine(plan);
  source.audio = noOpAudio();
  const network = source.missionVentNetworkV62;
  const entrance = network.entrances[0];
  const exit = network.exits.at(-1);
  const ally = source.squadActors[0];

  placeAtPortal(source.player, entrance, 60);
  source.inventory.cutter = true;
  assert.equal(source.interact(source.player), true);
  placeAtPortal(ally, entrance);
  assert.ok(source.beginMissionVentTraversalV62(ally, { entranceId: entrance.id, exitId: exit.id, actorKind: 'ally', automatic: true }));
  source.update(0.18);
  const playerTransit = structuredClone(source.player.ventTransit);
  const allyTransit = structuredClone(ally.ventTransit);
  const allyId = ally.ventRuntimeIdV62;
  const playerPosition = getVentTransitPositionV62(network, source.player);
  const allyPosition = getVentTransitPositionV62(network, ally);
  const resumeState = JSON.parse(JSON.stringify(source.captureResumeState()));

  const resumed = createEngine(plan, [], { resumeState });
  resumed.audio = noOpAudio();
  resumed.update(0);
  const resumedAlly = resumed.missionVentActorsV62.get(allyId);
  assert.ok(resumedAlly && resumed.squadActors.includes(resumedAlly), 'l allié différé est rattaché à la nouvelle squad réelle');
  assert.deepEqual(resumed.player.ventTransit, playerTransit);
  assert.deepEqual(resumedAlly.ventTransit, allyTransit);
  assert.deepEqual(getVentTransitPositionV62(network, resumed.player), playerPosition);
  assert.deepEqual(getVentTransitPositionV62(network, resumedAlly), allyPosition);
  assert.equal(resumed.player.inVehicle, false, 'le conduit ne détourne jamais le système véhicule');
  assert.equal(resumed.player.ventConcealedV62, true);
  assert.equal(resumedAlly.vehicleAccessPhase, 'vent-transit');
  assert.equal(resumed.lastResumeResult.missionVentRestoredV62, 2);
}));
