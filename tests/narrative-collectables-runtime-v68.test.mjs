import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { CREW, ENEMIES, EQUIPMENT, LEVEL_SEEDS, VEHICLES, WEAPONS, WORLDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { createNarrativeArchivesV68, recordNarrativeDecisionV68 } from '../src/narrative-collectables-v68.js';
import {
  QZ17_CAMPAIGN_ID_V68,
  QZ17_COLLECTABLE_ATLAS_V68,
  QZ17_PHYSICAL_COLLECTABLES_V68,
  QZ17_ROUTE_CONSEQUENCES_V68,
  QZ17_ROUTE_FLAG_V68,
  validateNarrativeCollectablePlacementV68
} from '../src/narrative-collectables-runtime-v68.js';

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

function createQz17Options({ resumeState = null, save = null, onChange = null } = {}) {
  const world = WORLDS.find((entry) => entry.id === 'gateway-station') || WORLDS[0];
  const campaign = {
    id: QZ17_CAMPAIGN_ID_V68,
    name: 'QZ-17 — LA CARGAISON FANTÔME',
    mode: 'MIRE',
    worldId: world.id,
    objective: 'recover black-box data',
    templateId: 'ship-interior-vertical'
  };
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, templateId: campaign.templateId, variant: 2 });
  return {
    seed: missionLevel.levelSeed.seed,
    campaign,
    world,
    levelSeed: missionLevel.levelSeed,
    missionLevel,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES,
    vehicle: VEHICLES[0],
    equipment: EQUIPMENT.slice(0, 8),
    crew: CREW.slice(0, 4),
    difficulty: 'standard',
    narrativeArchiveSave: save || { narrativeArchives: createNarrativeArchivesV68() },
    ...(onChange ? { onNarrativeArchivesChange: onChange } : {}),
    ...(resumeState ? { resumeState } : {})
  };
}

function standAt(engine, entity) {
  engine.player.x = entity.x + entity.w / 2 - engine.player.w / 2;
  engine.player.y = entity.y + entity.h - engine.player.h;
  engine.player.vx = 0;
  engine.player.vy = 0;
  engine.player.grounded = true;
}

function standCenteredAt(engine, entity) {
  engine.player.x = entity.x + entity.w / 2 - engine.player.w / 2;
  engine.player.y = entity.y + entity.h / 2 - engine.player.h / 2;
  engine.player.vx = 0;
  engine.player.vy = 0;
  engine.player.grounded = true;
}

function collectAllEvidence(engine) {
  for (const collectable of engine.narrativeCollectableActorsV68) {
    if (collectable.collected) continue;
    standAt(engine, collectable);
    assert.equal(engine.interact(engine.player), true, `${collectable.id}: collecte non appliquée`);
  }
}

function satisfyGenericExtractionRequirements(engine) {
  for (const key of Object.keys(engine.mission?.objectives || {})) engine.mission.objectives[key] = true;
  if (engine.archiveTerminal) engine.archiveTerminal.recovered = true;
  if (engine.powerNode) engine.powerNode.active = true;
  for (const enemy of engine.enemies || []) {
    enemy.alive = false;
    enemy.dormant = false;
  }
  if (engine.objectiveState) {
    engine.objectiveState.complete = true;
    engine.objectiveState.rescued = Math.max(engine.objectiveState.rescued || 0, engine.objectiveRuntime?.nodeCount || 0);
    engine.objectiveState.nodesActivated = Math.max(engine.objectiveState.nodesActivated || 0, engine.objectiveRuntime?.nodeCount || 0);
    engine.objectiveState.relayDestroyed = true;
    engine.objectiveState.captured = true;
  }
  if (engine.tracker) engine.tracker.pulses = Math.max(engine.tracker.pulses || 0, engine.objectiveRuntime?.trackerPulses || 0);
  if (engine.player && engine.coop) engine.player.kills = Math.max(engine.player.kills || 0, (engine.objectiveRuntime?.purgeTarget || 0) - (engine.coop.kills || 0));
  if (engine.vehicle?.active && engine.objective) {
    engine.vehicle.destroyed = false;
    engine.vehicle.x = engine.objective.x;
    engine.vehicle.y = engine.objective.y;
  }
  for (const timer of engine.missionLevelTimers?.values?.() || []) {
    timer.state = 'complete';
    timer.remaining = 0;
  }
  engine.missionLevelExtractionUnlocked = true;
  engine.syncNarrativeEvidenceGateV68({ emit: false });
}

test('QZ-17 place quatre preuves uniques sur de vraies surfaces du niveau V52 et charge leur atlas', () => withBrowserMocks(() => {
  const engine = createEngine();
  engine.start(createQz17Options());

  assert.equal(engine.isNarrativeCollectablesV68(), true);
  assert.equal(engine.narrativeCollectableActorsV68.length, 4);
  assert.deepEqual(engine.narrativeCollectableActorsV68.map((entry) => entry.id), QZ17_PHYSICAL_COLLECTABLES_V68.map((entry) => entry.id));
  assert.equal(new Set(engine.narrativeCollectableActorsV68.map((entry) => entry.surfacePlatformIdV68)).size, 4);
  assert.deepEqual(validateNarrativeCollectablePlacementV68(engine), { valid: true, errors: [], count: 4 });

  for (const collectable of engine.narrativeCollectableActorsV68) {
    const surface = engine.platforms.find((entry) => entry.id === collectable.surfacePlatformIdV68);
    assert.ok(surface, `${collectable.id}: plateforme absente`);
    assert.equal(collectable.y + collectable.h, surface.y, `${collectable.id}: pieds détachés`);
    assert.ok(collectable.x >= surface.x && collectable.x + collectable.w <= surface.x + surface.w, `${collectable.id}: hors surface`);
  }

  const atlas = engine.images.get(QZ17_COLLECTABLE_ATLAS_V68.imageKey);
  assert.equal(atlas.currentSrc, QZ17_COLLECTABLE_ATLAS_V68.path);
  const rendered = engine.narrativeCollectableActorsV68[0];
  const footprintBefore = { x: rendered.x, y: rendered.y, w: rendered.w, h: rendered.h };
  const drawCalls = [];
  assert.equal(engine.drawNarrativeCollectableV68({ drawImage: (...args) => drawCalls.push(args) }, rendered), true);
  assert.equal(drawCalls.length, 1);
  const [, , , sourceWidth, sourceHeight, , , destinationWidth, destinationHeight] = drawCalls[0];
  assert.ok(Math.abs(destinationWidth / sourceWidth - destinationHeight / sourceHeight) < 1e-12, 'le rendu doit garder une échelle uniforme');
  assert.ok(destinationWidth <= rendered.w + 20 && destinationHeight <= rendered.h + 18, 'le contain doit rester dans sa boîte de rendu');
  assert.deepEqual({ x: rendered.x, y: rendered.y, w: rendered.w, h: rendered.h }, footprintBefore, 'le rendu ne doit pas modifier le footprint physique');
  const gate = engine.narrativeEvidenceDoorV68();
  assert.ok(engine.doors.includes(gate));
  assert.equal(gate.open, false);
  assert.equal(gate.progress, 0);
  assert.equal(gate.levelLocked, true);
  assert.match(engine.doorRequirement(gate), /PREUVES QZ-17 INCOMPLÈTES \(0\/4\)/);
}));

test('QZ-17 refuse la collecte distante puis matérialise le verdict maintenance par un seul conduit dédié', () => withBrowserMocks(() => {
  const events = [];
  const mutations = [];
  const save = { narrativeArchives: createNarrativeArchivesV68() };
  const engine = createEngine(events);
  engine.start(createQz17Options({ save, onChange: (ledger, mutation) => mutations.push({ ledger, mutation }) }));
  const gate = engine.narrativeEvidenceDoorV68();
  assert.equal(engine.inventory.intel, 0);

  const distant = engine.narrativeCollectableActorsV68[3];
  assert.equal(engine.collectNarrativeCollectableV68(engine.player, distant.id), false);
  assert.equal(engine.narrativeCollectablesV68.telemetry.outOfRangeAttempts, 1);
  assert.equal(Object.keys(save.narrativeArchives.discovered).length, 0);

  for (const [index, collectable] of engine.narrativeCollectableActorsV68.entries()) {
    standAt(engine, collectable);
    assert.match(engine.getInteractionPrompt(engine.player), /RÉCUPÉRER/);
    assert.equal(engine.interact(engine.player), true, `${collectable.id}: collecte non appliquée`);
    assert.equal(collectable.collected, true);
    const intelAfterDiscovery = engine.inventory.intel;
    assert.equal(engine.collectNarrativeCollectableV68(engine.player, collectable.id), false, `${collectable.id}: doublon accepté`);
    assert.equal(engine.inventory.intel, intelAfterDiscovery, `${collectable.id}: récompense rejouée`);
    assert.equal(Object.keys(save.narrativeArchives.discovered).length, index + 1);
    if (index < 3) {
      assert.equal(gate.open, false);
      assert.equal(gate.progress, 0);
    }
  }

  assert.equal(mutations.length, 4);
  assert.equal(engine.inventory.intel, 5);
  assert.deepEqual(new Set(mutations.map((entry) => entry.mutation.collectable.id)), new Set(QZ17_PHYSICAL_COLLECTABLES_V68.map((entry) => entry.id)));
  assert.ok(save.narrativeArchives.unlockedFlags.includes(QZ17_ROUTE_FLAG_V68));
  assert.equal(gate.open, false);
  assert.equal(gate.progress, 0);
  assert.equal(gate.levelLocked, true);
  assert.match(engine.doorRequirement(gate), /VERDICT QZ-17 REQUIS/);
  assert.equal(recordNarrativeDecisionV68(save, 'follow-maintenance-trace').applied, true);
  assert.equal(engine.setNarrativeArchivesV68(save.narrativeArchives), true);
  const consequence = QZ17_ROUTE_CONSEQUENCES_V68['follow-maintenance-trace'];
  const selectedVent = engine.vents.find((entry) => entry.portalId === consequence.accessId);
  const selectedExit = engine.vents.find((entry) => entry.portalId === consequence.exitId);
  const otherEntrances = engine.vents.filter((entry) => entry.portalRole === 'entrance' && entry !== selectedVent);
  assert.ok(selectedVent);
  assert.ok(selectedExit);
  assert.equal(gate.open, false);
  assert.equal(gate.progress, 0);
  assert.equal(gate.levelLocked, true);
  assert.equal(gate.lockedBy, 'qz17-maintenance-route');
  assert.match(engine.doorRequirement(gate), /ROUTE DÉVIÉE/);
  assert.equal(selectedVent.open, true);
  assert.equal(selectedVent.requiresTool, false);
  assert.equal(selectedVent.narrativeRouteLockedV68, false);
  assert.equal(selectedExit.open, true);
  assert.ok(otherEntrances.every((entry) => !entry.open && entry.requiresTool && entry.narrativeRouteLockedV68));
  engine.inventory.cutter = true;
  if (otherEntrances[0]) {
    standCenteredAt(engine, otherEntrances[0]);
    assert.equal(engine.enterMissionVentV62(engine.player), null, 'un conduit non retenu ne doit pas contourner QZ-17');
  }
  standCenteredAt(engine, selectedVent);
  assert.ok(engine.enterMissionVentV62(engine.player), 'le verdict maintenance doit ouvrir son conduit physique');
  assert.equal(events.filter((event) => event.type === 'narrative-collectable-discovered').length, 4);
  assert.equal(events.filter((event) => event.type === 'archive-reader-open').length, 4);
  const routeEvents = events.filter((event) => event.type === 'narrative-route-unlocked');
  assert.equal(routeEvents.length, 1);
  assert.deepEqual(routeEvents[0], {
    type: 'narrative-route-unlocked',
    operationId: 'qz17-ghost-cargo',
    flag: consequence.flag,
    choiceId: consequence.choiceId,
    routeId: consequence.routeId,
    accessKind: 'vent',
    accessId: consequence.accessId,
    doorId: null,
    physicalDoorOpen: false,
    physicalVentOpen: true
  });
  const snapshot = engine.getNarrativeCollectablesSnapshotV68().narrativeCollectablesV68;
  assert.deepEqual(snapshot.routeConsequence, {
    choiceId: consequence.choiceId,
    routeId: consequence.routeId,
    accessKind: consequence.accessKind,
    accessId: consequence.accessId,
    exitId: consequence.exitId,
    applied: true,
    physicalAccessOpen: true,
    blockedAlternative: 'aft-bulkhead'
  });
}));

test('QZ-17 restaure les objets consommés et la porte ouverte sans duplication ni nouvelle récompense', () => withBrowserMocks(() => {
  const save = { narrativeArchives: createNarrativeArchivesV68() };
  const source = createEngine();
  source.start(createQz17Options({ save }));
  collectAllEvidence(source);
  assert.equal(recordNarrativeDecisionV68(save, 'secure-quarantine-evidence').applied, true);
  assert.equal(source.setNarrativeArchivesV68(save.narrativeArchives), true);
  const consequence = QZ17_ROUTE_CONSEQUENCES_V68['secure-quarantine-evidence'];
  const sourceGate = source.narrativeEvidenceDoorV68();
  const blockedVent = source.vents.find((entry) => entry.portalId === consequence.blockedVentId);
  assert.equal(sourceGate.id, consequence.accessId);
  assert.equal(sourceGate.open, true);
  assert.equal(sourceGate.levelLocked, false);
  assert.ok(blockedVent);
  assert.equal(blockedVent.open, false);
  assert.equal(blockedVent.requiresTool, true);
  assert.equal(blockedVent.narrativeRouteLockedV68, true);
  const resumeState = structuredClone(source.captureResumeState());
  assert.doesNotThrow(() => JSON.stringify(resumeState));
  assert.equal(source.inventory.intel, 5);
  assert.equal(resumeState.inventory.intel, 5);
  assert.deepEqual(resumeState.specialOperation.narrativeCollectablesV68.collectedIds, QZ17_PHYSICAL_COLLECTABLES_V68.map((entry) => entry.id));

  const events = [];
  let callbackCount = 0;
  const restored = createEngine(events);
  restored.start(createQz17Options({
    resumeState,
    save: structuredClone(save),
    onChange: () => { callbackCount += 1; }
  }));

  const snapshot = restored.getNarrativeCollectablesSnapshotV68().narrativeCollectablesV68;
  assert.equal(snapshot.remaining, 0);
  assert.ok(snapshot.physicalActors.every((entry) => entry.collected));
  assert.equal(snapshot.placement.valid, true);
  assert.equal(snapshot.physicalGate.open, true);
  assert.equal(snapshot.physicalGate.progress, 1);
  assert.equal(snapshot.physicalGate.locked, false);
  assert.deepEqual(snapshot.routeConsequence, {
    choiceId: consequence.choiceId,
    routeId: consequence.routeId,
    accessKind: consequence.accessKind,
    accessId: consequence.accessId,
    exitId: consequence.exitId,
    applied: true,
    physicalAccessOpen: true,
    blockedAlternative: consequence.blockedVentId
  });
  const restoredGate = restored.narrativeEvidenceDoorV68();
  const restoredBlockedVent = restored.vents.find((entry) => entry.portalId === consequence.blockedVentId);
  restored.inventory.cutter = true;
  standCenteredAt(restored, restoredBlockedVent);
  assert.equal(restored.enterMissionVentV62(restored.player), null, 'la quarantaine doit neutraliser le contournement par conduit même avec le chalumeau');
  assert.equal(restored.triggerMissionLevelEvent('ship-bridge-ambush', 'v68-quarantine-test'), true);
  assert.equal(restoredGate.open, true, 'l’événement générique ne doit pas annuler le verdict persistant');
  assert.equal(restoredGate.levelLocked, false);
  assert.equal(restored.inventory.intel, 5);
  assert.equal(callbackCount, 0);
  assert.equal(events.filter((event) => event.type === 'narrative-collectable-discovered').length, 0);
  standAt(restored, restored.narrativeCollectableActorsV68[0]);
  assert.equal(restored.collectNarrativeCollectableV68(restored.player, restored.narrativeCollectableActorsV68[0].id), false);
  assert.equal(restored.inventory.intel, 5);
  assert.equal(callbackCount, 0);
}));

test('QZ-17 interdit toute extraction avant 4/4 preuves et un verdict persistant apparié', () => withBrowserMocks(() => {
  const save = { narrativeArchives: createNarrativeArchivesV68() };
  const engine = createEngine();
  engine.start(createQz17Options({ save }));
  const gate = engine.narrativeEvidenceDoorV68();
  const maintenanceVent = engine.vents.find((entry) => entry.portalId === QZ17_ROUTE_CONSEQUENCES_V68['follow-maintenance-trace'].accessId);

  satisfyGenericExtractionRequirements(engine);
  gate.open = true;
  gate.progress = 1;
  gate.levelLocked = false;
  engine.narrativeCollectablesV68.gate.opened = true;
  engine.mission.objectives.route = true;
  engine.inventory.cutter = true;
  standCenteredAt(engine, maintenanceVent);
  assert.equal(engine.enterMissionVentV62(engine.player), null, 'le conduit ne doit pas court-circuiter les preuves');
  assert.match(engine.missingExtractionRequirement(), /PREUVES QZ-17 INCOMPLÈTES \(0\/4\)/);
  assert.equal(engine.completeMission(engine.player), false);
  assert.equal(engine.mission.state, 'active');

  collectAllEvidence(engine);
  satisfyGenericExtractionRequirements(engine);
  assert.match(engine.missingExtractionRequirement(), /VERDICT QZ-17 NON ENREGISTRÉ/);
  assert.equal(engine.completeMission(engine.player), false);

  save.narrativeArchives.decisions = {};
  save.narrativeArchives.unlockedFlags = [QZ17_ROUTE_FLAG_V68, 'qz17-maintenance-bypass'];
  assert.equal(engine.setNarrativeArchivesV68(save.narrativeArchives), true);
  assert.equal(engine.narrativeRouteChoiceV68(), null);
  assert.equal(engine.narrativeEvidenceCompleteV68(), false, 'un flag isolé ne vaut pas verdict persistant');
  assert.match(engine.missingExtractionRequirement(), /VERDICT QZ-17 NON ENREGISTRÉ/);

  assert.equal(recordNarrativeDecisionV68(save, 'follow-maintenance-trace').applied, true);
  assert.equal(engine.setNarrativeArchivesV68(save.narrativeArchives), true);
  satisfyGenericExtractionRequirements(engine);
  assert.equal(engine.missingExtractionRequirement(), '');
  assert.equal(engine.completeMission(engine.player), true);
  assert.equal(engine.mission.state, 'complete');
}));

test('QZ-17 rejette une reprise falsifiée qui prétend la porte et la route ouvertes', () => withBrowserMocks(() => {
  const save = { narrativeArchives: createNarrativeArchivesV68() };
  const source = createEngine();
  source.start(createQz17Options({ save }));
  const firstEvidence = source.narrativeCollectableActorsV68[0];
  standAt(source, firstEvidence);
  assert.equal(source.interact(source.player), true);
  const resumeState = structuredClone(source.captureResumeState());
  const runtime = resumeState.specialOperation.narrativeCollectablesV68;
  runtime.collectedIds = QZ17_PHYSICAL_COLLECTABLES_V68.map((entry) => entry.id);
  runtime.gate = { doorId: 'outer-airlock', opened: true, openedAt: 99 };
  runtime.route = {
    choiceId: 'secure-quarantine-evidence',
    routeId: 'ship-spine',
    accessKind: 'door',
    accessId: 'aft-bulkhead',
    exitId: 'outer-airlock',
    applied: true,
    appliedAt: 99
  };
  const savedAft = resumeState.missionLevel.doors.find((door) => door.id === 'aft-bulkhead');
  assert.ok(savedAft);
  Object.assign(savedAft, { open: true, progress: 1, levelLocked: false, lockedBy: null });

  const restored = createEngine();
  restored.start(createQz17Options({ resumeState, save: structuredClone(save) }));
  const gate = restored.narrativeEvidenceDoorV68();
  assert.equal(gate.id, 'aft-bulkhead');
  assert.equal(gate.open, false);
  assert.equal(gate.progress, 0);
  assert.equal(gate.levelLocked, true);
  assert.equal(gate.lockedBy, 'qz17-evidence');
  assert.equal(restored.narrativeCollectablesV68.gate.opened, false);
  assert.equal(restored.narrativeCollectablesV68.gate.openedAt, null);
  assert.deepEqual(restored.narrativeCollectablesV68.collectedIds, [firstEvidence.id]);
  assert.deepEqual(restored.narrativeCollectablesV68.route, {
    choiceId: null,
    routeId: null,
    accessKind: null,
    accessId: null,
    exitId: null,
    applied: false,
    appliedAt: null
  });
  assert.ok(restored.vents.filter((entry) => entry.portalRole === 'entrance')
    .every((entry) => !entry.open && entry.requiresTool && entry.narrativeRouteLockedV68));
  satisfyGenericExtractionRequirements(restored);
  assert.match(restored.missingExtractionRequirement(), /PREUVES QZ-17 INCOMPLÈTES \(1\/4\)/);
  assert.equal(restored.completeMission(restored.player), false);
  assert.equal(restored.mission.state, 'active');
}));

test('une campagne ordinaire conserve le runtime V67/V52 sans injecter QZ-17', () => withBrowserMocks(() => {
  const options = createQz17Options();
  options.campaign = { ...options.campaign, id: 'ordinary-frontier-test' };
  options.missionLevel = buildMissionLevelV52({ campaign: options.campaign, world: options.world, levelSeeds: LEVEL_SEEDS, templateId: 'ship-interior-vertical', variant: 2 });
  options.levelSeed = options.missionLevel.levelSeed;
  const engine = createEngine();
  const snapshot = engine.start(options);
  assert.equal(snapshot.narrativeCollectablesV68, undefined);
  assert.equal(engine.isNarrativeCollectablesV68(), false);
  assert.deepEqual(engine.narrativeCollectableActorsV68, []);
  assert.equal(engine.doors.some((door) => door.narrativeEvidenceGateV68), false);
}));
