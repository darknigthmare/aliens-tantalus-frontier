import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ALIEN_SURVIVAL_CAMPAIGN_ID_V70,
  ALIEN_SURVIVAL_CAMPAIGN_V70,
  ALIEN_SURVIVAL_OPERATION_ID_V70,
  ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70,
  ALIEN_SURVIVAL_SCHEMA_V70,
  buildAlienSurvivalResolutionPayloadV70,
  createAlienSurvivalStateV70,
  deriveAlienSurvivalPhaseV70
} from '../src/alien-survival-systems-v70.js';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import {
  ALIEN_SURVIVAL_STRATEGIC_BONUS_V70,
  abandonBlockedAlphaBravoOperationV69,
  beginOperation,
  createAlienSurvivalSystemsV70,
  createDefaultSave,
  getAlienSurvivalOperationStateV70,
  getAlienSurvivalSystemsSnapshotV70,
  migrateSave,
  recordAlienSurvivalStateV70,
  recordOperationResumeState,
  resolveOperation,
  resolveOperationDeployment,
  validateAlienSurvivalResolutionPayloadV70
} from '../src/save.js';

const world = WORLDS.find((entry) => entry.id === ALIEN_SURVIVAL_CAMPAIGN_V70.worldId);

function deployment(profile = 1, difficulty = 'standard') {
  const save = createDefaultSave(profile);
  save.settings.difficulty = difficulty;
  save.difficulty = difficulty;
  if (!save.galaxy.unlockedWorldIds.includes(world.id)) save.galaxy.unlockedWorldIds.push(world.id);
  const started = beginOperation(save, ALIEN_SURVIVAL_CAMPAIGN_V70, world);
  return { save, operation: started.operation };
}

function completedState(deploymentOperationId, difficulty = 'standard') {
  const state = createAlienSurvivalStateV70({ deploymentOperationId, difficulty });
  state.power.routes['life-support'] = true;
  state.power.routes.cctv = true;
  state.power.rerouteCount = 3;
  state.power.everRouted = ['life-support', 'security', 'cctv'];
  state.rooms[0].visited = true;
  state.rooms.find((room) => room.id === 'ship-engineering').pressure = 82;
  state.rooms.find((room) => room.id === 'ship-engineering').oxygen = 76;
  state.rooms.find((room) => room.id === 'ship-engineering').breachRate = 0;
  const extraction = state.rooms.find((room) => room.id === 'ship-extraction');
  extraction.pressure = 94;
  extraction.oxygen = 88;
  extraction.breachRate = 0;
  const weldedDoor = state.doors.find((door) => door.id === 'cargo-bulkhead');
  weldedDoor.open = false;
  weldedDoor.welded = true;
  weldedDoor.weldIntegrity = 87;
  weldedDoor.weldCompletedAt = 31;
  state.welding.completedDoorIds = [weldedDoor.id];
  state.pressure.simulatedTicks = 240;
  state.pressure.tickRemainder = 0.25;
  state.pressure.equalizedDoorIds = ['outer-airlock'];
  state.pressure.stabilizedRoomIds = ['ship-docking', 'ship-cargo', 'ship-engineering', 'ship-habitation', 'ship-command', 'ship-extraction'];
  state.cctv.active = false;
  state.cctv.visitedFeedIds = [...state.cctv.requiredFeedIds];
  state.cctv.scanComplete = true;
  state.acidPools = [{
    id: 'acid-pool:xeno-9', roomId: 'ship-cargo', sourceEnemyId: 'xeno-9',
    x: 720, y: 676, w: 84, h: 18, intensity: 0.84, corrosion: 16,
    ageSeconds: 12, createdAt: 28, active: true, persistent: true
  }];
  state.acid.encountered = true;
  state.acid.maxPersistenceSeconds = 12;
  state.selfDestruct.authorizations.engineering = true;
  state.selfDestruct.authorizations.command = true;
  state.selfDestruct.authorizedAt.engineering = 42;
  state.selfDestruct.authorizedAt.command = 48;
  state.selfDestruct.armed = true;
  state.selfDestruct.armedAt = 50;
  state.selfDestruct.remainingSeconds = difficulty === 'nightmare' ? 37 : 58;
  state.elapsedSeconds = 76;
  state.extracted = true;
  state.completedAt = 76;
  state.phase = deriveAlienSurvivalPhaseV70(state);
  return state;
}

test('une sauvegarde V69 migre avec un état V70 vide sans altérer Doctrine Alpha Bravo', () => {
  const legacyV69 = createDefaultSave(1);
  legacyV69.release = '69.0.0';
  delete legacyV69.alienSurvivalSystems;
  const alphaBefore = structuredClone(legacyV69.alphaBravoDoctrine);

  const migrated = migrateSave(JSON.parse(JSON.stringify(legacyV69)), 1);
  assert.deepEqual(migrated.alienSurvivalSystems, createAlienSurvivalSystemsV70());
  assert.deepEqual(migrated.alphaBravoDoctrine, alphaBefore);
  assert.equal(abandonBlockedAlphaBravoOperationV69(migrated).reason, 'no-operation');
});

test('le checkpoint natif round-trip tous les systèmes physiques V70 après migration JSON', () => {
  const { save, operation } = deployment(1, 'nightmare');
  const state = completedState(operation.id, 'nightmare');
  assert.equal(recordAlienSurvivalStateV70(save, state), true);
  assert.equal(operation.resumeState.schema, 1);
  assert.equal(operation.resumeState.specialOperation.operationId, ALIEN_SURVIVAL_OPERATION_ID_V70);
  assert.deepEqual(getAlienSurvivalOperationStateV70(save), operation.resumeState.specialOperation.alienSurvivalV70);

  const loaded = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  const restored = getAlienSurvivalOperationStateV70(loaded);
  assert.equal(restored.schema, ALIEN_SURVIVAL_SCHEMA_V70);
  assert.equal(restored.campaignId, ALIEN_SURVIVAL_CAMPAIGN_ID_V70);
  assert.equal(restored.deploymentOperationId, operation.id);
  assert.deepEqual(restored.power.routes, { 'life-support': true, security: false, cctv: true });
  assert.equal(restored.power.rerouteCount, 3);
  assert.equal(restored.rooms.find((room) => room.id === 'ship-engineering').pressure, 82);
  assert.equal(restored.doors.find((door) => door.id === 'cargo-bulkhead').weldIntegrity, 87);
  assert.deepEqual(restored.welding.completedDoorIds, ['cargo-bulkhead']);
  assert.deepEqual(restored.cctv.visitedFeedIds, restored.cctv.requiredFeedIds);
  assert.equal(restored.cctv.scanComplete, true);
  assert.equal(restored.acidPools[0].ageSeconds, 12);
  assert.equal(restored.acid.maxPersistenceSeconds, 12);
  assert.equal(restored.selfDestruct.remainingSeconds, 37);
  assert.equal(restored.phase, 'extracted');
  assert.deepEqual(resolveOperationDeployment(loaded).resumeState.specialOperation.alienSurvivalV70, restored);
});

test('le sanitizer fail-closed refuse schema, campagne, opération ou déploiement forgé sans écraser le checkpoint valide', () => {
  const { save, operation } = deployment();
  const valid = completedState(operation.id);
  assert.equal(recordAlienSurvivalStateV70(save, valid), true);
  const checkpoint = structuredClone(operation.resumeState);
  const forgeries = [
    { ...valid, schema: 69 },
    { ...valid, campaignId: 'special-other' },
    { ...valid, operationId: 'other-system' },
    { ...valid, deploymentOperationId: 'operation-999-special-alien-survival-systems' }
  ];
  for (const forged of forgeries) {
    assert.equal(recordAlienSurvivalStateV70(save, forged), false);
    assert.deepEqual(operation.resumeState, checkpoint);
    assert.equal(recordOperationResumeState(save, {
      schema: 1,
      identity: { campaignId: operation.campaignId, operationId: operation.id },
      specialOperation: { operationId: ALIEN_SURVIVAL_OPERATION_ID_V70, alienSurvivalV70: forged }
    }), false);
    assert.deepEqual(operation.resumeState, checkpoint);
  }
});

test('un checkpoint natif V70 sans specialOperation conserve le checkpoint systèmes valide déjà enregistré', () => {
  const { save, operation } = deployment();
  const state = completedState(operation.id);
  assert.equal(recordAlienSurvivalStateV70(save, state), true);
  const previousAlienSurvival = getAlienSurvivalOperationStateV70(save);
  const nativeCheckpoint = {
    schema: 1,
    identity: { campaignId: operation.campaignId, operationId: operation.id },
    mission: { state: 'active', elapsed: 81 },
    player: { x: 5120, y: 640, health: 63 }
  };

  assert.equal(recordOperationResumeState(save, nativeCheckpoint), true);
  assert.deepEqual(operation.resumeState.player, nativeCheckpoint.player);
  assert.deepEqual(operation.resumeState.mission, nativeCheckpoint.mission);
  assert.equal(operation.resumeState.specialOperation.operationId, ALIEN_SURVIVAL_OPERATION_ID_V70);
  assert.deepEqual(operation.resumeState.specialOperation.alienSurvivalV70, previousAlienSurvival);
  assert.deepEqual(getAlienSurvivalOperationStateV70(save), previousAlienSurvival);

  const loaded = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  assert.deepEqual(getAlienSurvivalOperationStateV70(loaded), previousAlienSurvival);
  assert.deepEqual(loaded.strategy.currentOperation.resumeState.player, nativeCheckpoint.player);
});

test('la validation exige le payload exact et le checkpoint persistant du même déploiement', () => {
  const { save, operation } = deployment();
  const state = completedState(operation.id);
  const payload = buildAlienSurvivalResolutionPayloadV70(state, { deploymentOperationId: operation.id });
  assert.equal(validateAlienSurvivalResolutionPayloadV70(operation, { alienSurvivalSystems: payload }).qualified, false, 'un payload seul ne suffit pas');
  assert.equal(recordAlienSurvivalStateV70(save, state), true);
  const valid = validateAlienSurvivalResolutionPayloadV70(operation, { alienSurvivalSystems: payload });
  assert.equal(valid.structuralValid, true);
  assert.equal(valid.qualified, true);
  assert.deepEqual(valid.payload.mechanics.map((entry) => entry.id), ALIEN_SURVIVAL_REQUIRED_MECHANICS_V70);

  const extra = { ...payload, debugReward: 999999 };
  assert.equal(validateAlienSurvivalResolutionPayloadV70(operation, { alienSurvivalSystems: extra }).structuralValid, false);
  const stale = { ...payload, deploymentOperationId: 'operation-99-special-alien-survival-systems' };
  assert.equal(validateAlienSurvivalResolutionPayloadV70(operation, { alienSurvivalSystems: stale }).structuralValid, false);
  const forgedCountdown = { ...payload, countdownRemaining: payload.countdownRemaining + 1 };
  assert.equal(validateAlienSurvivalResolutionPayloadV70(operation, { alienSurvivalSystems: forgedCountdown }).structuralValid, false);
});

test('une extraction V70 exacte verse récompense de base et bonus fixe une seule fois par déploiement', () => {
  const { save, operation } = deployment();
  const state = completedState(operation.id);
  assert.equal(recordAlienSurvivalStateV70(save, state), true);
  const payload = buildAlienSurvivalResolutionPayloadV70(getAlienSurvivalOperationStateV70(save), { deploymentOperationId: operation.id });
  const resourcesBefore = structuredClone(save.galaxy.resources);
  const moraleBefore = save.hub.systems.morale;
  const outcome = resolveOperation(save, { success: true, rewards: { alienSurvivalSystems: payload } });

  assert.equal(outcome.ok, true);
  assert.equal(outcome.success, true);
  assert.deepEqual(outcome.specialOperationBonus, ALIEN_SURVIVAL_STRATEGIC_BONUS_V70);
  assert.equal(save.galaxy.resources.credits, resourcesBefore.credits + operation.reward.credits);
  assert.equal(save.galaxy.resources.research, resourcesBefore.research + operation.reward.research + ALIEN_SURVIVAL_STRATEGIC_BONUS_V70.research);
  assert.equal(save.galaxy.resources.alloy, resourcesBefore.alloy + operation.reward.alloy + ALIEN_SURVIVAL_STRATEGIC_BONUS_V70.alloy);
  assert.equal(save.hub.systems.morale, moraleBefore + ALIEN_SURVIVAL_STRATEGIC_BONUS_V70.morale);
  assert.equal(save.alienSurvivalSystems.runs.length, 1);
  assert.equal(save.alienSurvivalSystems.runs[0].deploymentOperationId, operation.id);
  assert.equal(save.alienSurvivalSystems.runs[0].bonusApplied, true);

  const balances = structuredClone({ resources: save.galaxy.resources, morale: save.hub.systems.morale });
  save.strategy.currentOperation = structuredClone(save.strategy.lastOperation);
  assert.deepEqual(resolveOperation(save, { success: true, rewards: { alienSurvivalSystems: payload } }), {
    ok: false,
    reason: 'operation-already-resolved'
  });
  assert.deepEqual({ resources: save.galaxy.resources, morale: save.hub.systems.morale }, balances);
  assert.equal(save.alienSurvivalSystems.runs.length, 1);

  const migrated = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  assert.equal(getAlienSurvivalSystemsSnapshotV70(migrated).runs.length, 1);
  assert.equal(migrated.strategy.lastOperation.alienSurvivalRun.bonusApplied, true);
});

test('payload altéré, mission incomplète et retraite ne versent jamais le bonus V70', () => {
  const forgedFixture = deployment(2);
  const forgedState = completedState(forgedFixture.operation.id);
  recordAlienSurvivalStateV70(forgedFixture.save, forgedState);
  const forgedPayload = buildAlienSurvivalResolutionPayloadV70(forgedState, { deploymentOperationId: forgedFixture.operation.id });
  forgedPayload.weldedDoorIds = [];
  const forgedBalances = structuredClone(forgedFixture.save.galaxy.resources);
  const forgedOutcome = resolveOperation(forgedFixture.save, { success: true, rewards: { alienSurvivalSystems: forgedPayload } });
  assert.equal(forgedOutcome.success, false);
  assert.equal(forgedOutcome.operation.reason, 'survival-validation');
  assert.deepEqual(forgedOutcome.specialOperationBonus, {});
  assert.deepEqual(forgedFixture.save.galaxy.resources, forgedBalances);
  assert.equal(forgedFixture.save.alienSurvivalSystems.runs[0].success, false);
  assert.equal(forgedFixture.save.alienSurvivalSystems.runs[0].bonusApplied, false);

  const retreatFixture = deployment(3);
  const retreatState = completedState(retreatFixture.operation.id);
  recordAlienSurvivalStateV70(retreatFixture.save, retreatState);
  const retreatPayload = buildAlienSurvivalResolutionPayloadV70(retreatState, { deploymentOperationId: retreatFixture.operation.id });
  const retreatBalances = structuredClone(retreatFixture.save.galaxy.resources);
  const retreat = resolveOperation(retreatFixture.save, { success: false, reason: 'retreat', rewards: { alienSurvivalSystems: retreatPayload } });
  assert.equal(retreat.success, false);
  assert.deepEqual(retreat.specialOperationBonus, {});
  assert.deepEqual(retreatFixture.save.galaxy.resources, retreatBalances);
  assert.equal(retreatFixture.save.alienSurvivalSystems.runs[0].bonusApplied, false);
});

test('les checkpoints natifs non-V70 conservent leur comportement historique', () => {
  const campaign = CAMPAIGNS.find((entry) => (
    entry.id !== ALIEN_SURVIVAL_CAMPAIGN_ID_V70
    && entry.specialOperationId !== ALIEN_SURVIVAL_OPERATION_ID_V70
  ));
  const ordinaryWorld = WORLDS.find((entry) => entry.id === campaign?.worldId);
  assert.ok(campaign && ordinaryWorld);
  const save = createDefaultSave(4);
  if (!save.galaxy.unlockedWorldIds.includes(ordinaryWorld.id)) save.galaxy.unlockedWorldIds.push(ordinaryWorld.id);
  const { operation } = beginOperation(save, campaign, ordinaryWorld);
  assert.notEqual(operation.campaignId, ALIEN_SURVIVAL_CAMPAIGN_ID_V70);
  assert.notEqual(operation.specialOperationId, ALIEN_SURVIVAL_OPERATION_ID_V70);
  const ordinaryNative = {
    schema: 1,
    identity: { campaignId: operation.campaignId },
    player: { x: 120, y: 640, health: 75 }
  };
  assert.equal(recordOperationResumeState(save, ordinaryNative), true);
  assert.deepEqual(operation.resumeState, ordinaryNative);
  assert.equal(getAlienSurvivalOperationStateV70(save), null);
});
