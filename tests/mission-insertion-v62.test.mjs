import assert from 'node:assert/strict';
import test from 'node:test';

import { CAMPAIGNS, CREW, LEVEL_SEEDS, VEHICLES, WORLDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import {
  MISSION_INSERTION_ACTIONS_V62,
  applyMissionInsertionActionV62,
  createMissionInsertionV62,
  getActiveMissionInsertionPhaseV62,
  getMissionInsertionReadReceiptV62,
  pauseMissionInsertionV62,
  recordMissionInsertionProgressV62,
  resolveMissionInsertionApproachV62,
  resolveMissionInsertionIncidentV62,
  restoreMissionInsertionV62,
  resumeMissionInsertionV62,
  serializeMissionInsertionV62
} from '../src/mission-insertion-v62.js';

const campaign = CAMPAIGNS[0];
const world = WORLDS.find((entry) => entry.id === campaign.worldId);
const apc = VEHICLES.find((entry) => entry.family === 'ground' && entry.seats.length >= 2 && !String(entry.visualStatus).startsWith('BLOCKED_'));
const dropship = VEHICLES.find((entry) => entry.family === 'air' && !String(entry.visualStatus).startsWith('BLOCKED_'));
const roster = CREW.slice(0, 4);

function operation(overrides = {}) {
  return {
    id: 'operation-62-contract',
    campaignId: campaign.id,
    worldId: world.id,
    crewIds: roster.map((entry) => entry.id),
    weaponIds: ['weapon-contract-id'],
    equipmentIds: ['equipment-contract-id'],
    vehicleId: apc.id,
    ...overrides
  };
}

function mission(overrides = {}) {
  return {
    signature: 'mission-contract-signature',
    templateId: 'colony-multiroute',
    campaign: { id: campaign.id, objective: campaign.objective },
    world: { id: world.id },
    anchors: { spawn: { nodeId: 'colony-spawn', x: 180, y: 470, zoneId: 'colony-approach' } },
    events: [{ id: 'mission-weather-front', trigger: { type: 'mission-start' }, actions: ['weather:front'] }],
    hazards: [],
    spawns: [],
    graph: { routes: [] },
    ...overrides
  };
}

function completeSequence(state, startAt = 10) {
  let current = state;
  let now = startAt;
  while (current.status !== 'completed') {
    const phase = getActiveMissionInsertionPhaseV62(current);
    const result = applyMissionInsertionActionV62(current, phase.requiredAction, { now });
    assert.equal(result.ok, true);
    current = result.state;
    now += 1;
  }
  return current;
}

test('v62 consumes the real campaign, roster and vehicle contracts without rewriting their visible data', () => {
  const state = createMissionInsertionV62({ operation: operation(), campaign, world, mission: mission(), vehicle: apc, crew: roster, now: 4 });
  assert.equal(state.operationId, 'operation-62-contract');
  assert.equal(state.approach.mode, 'apc');
  assert.equal(state.phases[0].payload.objectiveRef, campaign.objective);
  assert.deepEqual(state.phases[1].payload.crewIds, roster.map((entry) => entry.id));
  assert.equal(state.phases[1].payload.vehicleId, apc.id);
  assert.deepEqual(state.phases.map((entry) => entry.kind), ['briefing', 'preparation', 'approach', 'deployment', 'player-control']);
});

test('v62 approach resolution is deterministic and mission data has priority over compatible transports', () => {
  assert.deepEqual(resolveMissionInsertionApproachV62({ mission: mission(), operation: operation(), vehicle: dropship }), {
    mode: 'dropship', source: 'vehicle', vehicleId: dropship.id
  });
  assert.deepEqual(resolveMissionInsertionApproachV62({
    mission: mission({ insertion: { approach: { mode: 'foot' } } }), operation: operation(), vehicle: dropship
  }), { mode: 'foot', source: 'mission', vehicleId: dropship.id });
  const blocked = { ...apc, visualStatus: 'BLOCKED_EXACT_SPRITE_REQUIRED' };
  assert.deepEqual(resolveMissionInsertionApproachV62({ mission: mission(), operation: operation(), vehicle: blocked }), {
    mode: 'foot', source: 'mission-fallback', vehicleId: null
  });
  const first = createMissionInsertionV62({ operation: operation(), campaign, world, mission: mission(), vehicle: apc, now: 0 });
  const second = createMissionInsertionV62({ operation: operation(), campaign, world, mission: mission(), vehicle: apc, now: 0 });
  assert.deepEqual(first, second);
});

test('v62 only creates an incident when it references an existing causal mission record', () => {
  const noCause = mission({ insertion: { incident: {
    id: 'weather-diversion', cause: { kind: 'event', id: 'missing-event' }, resolutionActionId: 'confirm-diversion'
  } } });
  assert.equal(resolveMissionInsertionIncidentV62(noCause), null);

  const causal = mission({ insertion: { incident: {
    id: 'weather-diversion',
    cause: { kind: 'event', id: 'mission-weather-front' },
    resolutionActionId: 'confirm-diversion',
    data: { routeId: 'route-from-mission-data' }
  } } });
  const incident = resolveMissionInsertionIncidentV62(causal);
  assert.equal(incident.id, 'weather-diversion');
  assert.equal(incident.source.id, 'mission-weather-front');
  const state = createMissionInsertionV62({ operation: operation(), campaign, world, mission: causal, vehicle: apc });
  assert.deepEqual(state.phases.map((entry) => entry.kind), ['briefing', 'preparation', 'approach', 'incident', 'deployment', 'player-control']);
  assert.equal(state.phases[3].requiredAction, 'confirm-diversion');
});

test('la campagne réelle ne compile un incident que depuis un événement mission-start existant', () => {
  const colonyPlan = buildMissionLevelV52({
    campaign,
    world,
    levelSeeds: LEVEL_SEEDS,
    templateId: 'colony-multiroute',
    variant: 2
  });
  const causalEvent = colonyPlan.events.find((entry) => entry.trigger?.type === 'mission-start');
  assert.ok(causalEvent);
  assert.equal(colonyPlan.insertion.incident.cause.kind, 'event');
  assert.equal(colonyPlan.insertion.incident.cause.id, causalEvent.id);
  assert.deepEqual(colonyPlan.insertion.incident.data.actions, [...causalEvent.actions]);

  const insertion = createMissionInsertionV62({
    operation: operation(),
    campaign,
    world,
    mission: colonyPlan,
    vehicle: apc,
    crew: roster,
    now: 5
  });
  assert.equal(insertion.incident.source.id, causalEvent.id);
  assert.equal(insertion.incident.source.trigger.type, 'mission-start');
  assert.ok(insertion.phases.some((entry) => entry.kind === 'incident'));

  const shipPlan = buildMissionLevelV52({
    campaign,
    world,
    levelSeeds: LEVEL_SEEDS,
    templateId: 'ship-interior-vertical',
    variant: 2
  });
  assert.equal(shipPlan.events.some((entry) => entry.trigger?.type === 'mission-start'), false);
  assert.equal(shipPlan.insertion, null);
  const shipInsertion = createMissionInsertionV62({
    operation: operation(),
    campaign,
    world,
    mission: shipPlan,
    vehicle: apc,
    crew: roster,
    now: 5
  });
  assert.equal(shipInsertion.incident, null);
  assert.equal(shipInsertion.phases.some((entry) => entry.kind === 'incident'), false);

  const repeated = buildMissionLevelV52({
    campaign,
    world,
    levelSeeds: LEVEL_SEEDS,
    templateId: 'colony-multiroute',
    variant: 2
  });
  assert.deepEqual(repeated.insertion, colonyPlan.insertion);
});

test('v62 phases are interactive, monotonic, serializable and emit audio/camera/objective data hooks', () => {
  const original = createMissionInsertionV62({ operation: operation(), campaign, world, mission: mission(), vehicle: apc, now: 5 });
  const progress = recordMissionInsertionProgressV62(original, 0.45, { now: 6 });
  assert.equal(progress.ok, true);
  assert.equal(progress.state.phases[0].progress, 0.45);
  assert.equal(original.phases[0].progress, 0, 'pure API must not mutate its input');
  const wrong = applyMissionInsertionActionV62(progress.state, 'deploy', { now: 7 });
  assert.equal(wrong.ok, false);
  assert.equal(wrong.expectedAction, MISSION_INSERTION_ACTIONS_V62.briefing);
  const advanced = applyMissionInsertionActionV62(progress.state, MISSION_INSERTION_ACTIONS_V62.briefing, { now: 7 });
  assert.equal(advanced.ok, true);
  assert.equal(advanced.state.phases[0].completedAt, 7);
  assert.equal(advanced.state.phases[1].enteredAt, 7);
  assert.deepEqual(new Set(advanced.hooks.map((entry) => entry.channel)), new Set(['audio', 'camera', 'objective']));
  assert.equal(advanced.hooks.find((entry) => entry.channel === 'objective').objectiveRef, campaign.objective);
  assert.deepEqual(restoreMissionInsertionV62(JSON.stringify(serializeMissionInsertionV62(advanced.state))), advanced.state);
});

test('v62 Skip is rejected on first viewing and unlocked by the completed read receipt only', () => {
  const first = createMissionInsertionV62({ operation: operation(), campaign, world, mission: mission(), vehicle: apc, now: 1 });
  const denied = applyMissionInsertionActionV62(first, 'skip', { now: 2 });
  assert.equal(denied.ok, false);
  assert.equal(denied.reason, 'first-read-required');
  assert.equal(getMissionInsertionReadReceiptV62(first), null);

  const completed = completeSequence(first, 3);
  assert.equal(completed.controlGranted, true);
  assert.equal(completed.firstReadCompleted, true);
  const receipt = getMissionInsertionReadReceiptV62(completed);
  assert.equal(receipt.key, completed.readKey);

  const replay = createMissionInsertionV62({
    operation: operation({ id: 'operation-62-replay' }), campaign, world, mission: mission(), vehicle: apc, readReceipts: [receipt], now: 20
  });
  assert.equal(replay.skipAllowed, true);
  const skipped = applyMissionInsertionActionV62(replay, MISSION_INSERTION_ACTIONS_V62.skip, { now: 21 });
  assert.equal(skipped.ok, true);
  assert.equal(skipped.state.status, 'completed');
  assert.equal(skipped.state.controlGranted, true);
  assert.ok(skipped.state.phases.every((entry) => ['complete', 'skipped'].includes(entry.status)));
});

test('v62 pause, save return and resume preserve the exact phase and progress', () => {
  let state = createMissionInsertionV62({ operation: operation(), campaign, world, mission: mission(), vehicle: apc, now: 30 });
  state = applyMissionInsertionActionV62(state, 'acknowledge-briefing', { now: 31 }).state;
  state = recordMissionInsertionProgressV62(state, 0.6, { now: 32 }).state;
  const paused = pauseMissionInsertionV62(state, { now: 33, returnContext: 'operation-planning' });
  assert.equal(paused.ok, true);
  assert.equal(paused.state.paused, true);
  assert.equal(applyMissionInsertionActionV62(paused.state, 'confirm-preparation', { now: 34 }).reason, 'paused');

  const stored = JSON.stringify(serializeMissionInsertionV62(paused.state));
  const resumed = resumeMissionInsertionV62(stored, { now: 40 });
  assert.equal(resumed.ok, true);
  assert.equal(resumed.state.paused, false);
  assert.equal(resumed.state.currentPhaseId, 'mission-insertion:preparation');
  assert.equal(resumed.state.phases[1].progress, 0.6);
  assert.equal(resumed.state.resumedAt, 40);
  assert.equal(resumed.hooks.some((entry) => entry.channel === 'camera'), true);
});
