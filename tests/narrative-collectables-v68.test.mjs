import test from 'node:test';
import assert from 'node:assert/strict';

import {
  NARRATIVE_ARCHIVE_SCHEMA_V68,
  NARRATIVE_COLLECTABLES_V68,
  NARRATIVE_COVERAGE_V68,
  NARRATIVE_DECISIONS_V68,
  NARRATIVE_OPERATION_V68,
  NARRATIVE_RELATIONS_V68,
  createNarrativeArchivesV68,
  discoverNarrativeCollectableV68,
  getNarrativeInvestigationV68,
  markNarrativeCollectableReadV68,
  normalizeNarrativeArchivesV68,
  recordNarrativeDecisionV68
} from '../src/narrative-collectables-v68.js';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import {
  QZ17_STRATEGIC_RESEARCH_BONUS_V68,
  SaveSystem,
  beginOperation,
  createDefaultSave,
  migrateSave,
  resolveOperation,
  sanitizeOperationResumeState
} from '../src/save.js';

const EXPECTED_IDS = [
  'qz17-pda-loading-chief',
  'qz17-email-logistics-denial',
  'qz17-black-box-forklift',
  'qz17-cargo-seal-fragment'
];

const discoverAll = (save) => EXPECTED_IDS.map((id, index) => discoverNarrativeCollectableV68(save, id, {
  day: 3,
  hour: 8 + index / 4,
  campaignId: NARRATIVE_OPERATION_V68.campaignId,
  worldId: 'world-05-lethe',
  levelId: 'ship-interior-vertical'
}));

test('V68 QZ-17 ships four authored physical text collectables and declares no unavailable media', () => {
  assert.equal(NARRATIVE_COVERAGE_V68.complete, true);
  assert.equal(NARRATIVE_COVERAGE_V68.collectableCount, 4);
  assert.equal(NARRATIVE_COVERAGE_V68.declaredMediaCount, 0);
  assert.deepEqual(NARRATIVE_COLLECTABLES_V68.map((entry) => entry.id), EXPECTED_IDS);
  assert.equal(new Set(NARRATIVE_COLLECTABLES_V68.map((entry) => entry.type)).size, 4);
  for (const entry of NARRATIVE_COLLECTABLES_V68) {
    assert.equal(entry.collectionId, NARRATIVE_OPERATION_V68.collectionId);
    assert.equal(entry.format, 'text');
    assert.equal(entry.authored, true);
    assert.equal(entry.canonStatus, 'project-fiction-not-franchise-canon');
    assert.ok(entry.body.length >= 180, entry.id);
    assert.ok(entry.summary.length >= 40, entry.id);
    assert.ok(entry.physical.propKey);
    assert.ok(entry.physical.zoneId);
    assert.ok(entry.physical.anchorId);
    assert.equal(entry.physical.surfaceKind, 'platform');
    assert.ok(entry.claims.length >= 2);
    assert.ok(entry.rewards.intel >= 1);
    assert.equal(Object.hasOwn(entry, 'audioPath'), false);
    assert.equal(Object.hasOwn(entry, 'videoPath'), false);
    assert.doesNotMatch(JSON.stringify(entry), /placeholder|lorem ipsum|\btodo\b|\btbd\b/i);
  }
  const blackBox = NARRATIVE_COLLECTABLES_V68.find((entry) => entry.type === 'black-box');
  assert.match(blackBox.body, /aucun flux audio joint/i);
});

test('the QZ-17 claim graph references authored claims and contains active contradictions plus corroborations', () => {
  const claims = new Map(NARRATIVE_COLLECTABLES_V68.flatMap((entry) => entry.claims.map((claim) => [claim.id, claim])));
  assert.equal(claims.size, NARRATIVE_COVERAGE_V68.claimCount);
  assert.equal(NARRATIVE_COVERAGE_V68.contradictionCount, 2);
  assert.equal(NARRATIVE_COVERAGE_V68.corroborationCount, 2);
  assert.equal(NARRATIVE_COVERAGE_V68.qualificationCount, 1);
  assert.equal(NARRATIVE_OPERATION_V68.unlockCondition.requiredContradictions, 2);
  for (const relation of NARRATIVE_RELATIONS_V68) {
    assert.ok(claims.has(relation.fromClaimId), relation.id);
    assert.ok(claims.has(relation.toClaimId), relation.id);
    assert.notEqual(relation.fromClaimId, relation.toClaimId);
    assert.ok(['corroborates', 'contradicts', 'qualifies'].includes(relation.type));
    assert.ok(relation.explanation.length >= 50);
  }
  assert.equal(NARRATIVE_RELATIONS_V68.find((entry) => entry.id === 'qz17-relation-seal-pda-integrity')?.type, 'qualifies');
  const decision = NARRATIVE_DECISIONS_V68[0];
  assert.equal(decision.id, 'qz17-route-verdict');
  assert.ok(decision.requirements.every((claimId) => claims.has(claimId)));
  assert.deepEqual(decision.options.map((option) => option.routeUnlockFlag), [
    'qz17-maintenance-bypass',
    'qz17-quarantine-lock'
  ]);
});

test('discoveries grant rewards exactly once and unlock analysis only after all four physical pieces', () => {
  const save = createDefaultSave(1);
  assert.deepEqual(save.narrativeArchives, createNarrativeArchivesV68());
  let totalIntel = 0;
  for (const [index, id] of EXPECTED_IDS.entries()) {
    const result = discoverNarrativeCollectableV68(save, id, {
      clock: { day: 3, hour: 7.5 + index },
      worldId: 'world-05-lethe',
      levelId: 'ship-interior-vertical',
      eventId: `runtime:${id}`
    });
    assert.equal(result.applied, true);
    totalIntel += result.rewards.intel;
    assert.equal(result.ledger.discovered[id].rewardClaimed, true);
    assert.equal(result.ledger.discovered[id].sourceEventId, `runtime:${id}`);
    assert.equal(result.unlockedFlags.includes(NARRATIVE_OPERATION_V68.analysisUnlockFlag), index === EXPECTED_IDS.length - 1);
  }
  assert.equal(totalIntel, 5);
  assert.ok(save.narrativeArchives.unlockedFlags.includes(NARRATIVE_OPERATION_V68.analysisUnlockFlag));
  assert.equal(save.narrativeArchives.handledEventIds.filter((id) => id.startsWith('collectable:')).length, 4);

  const duplicate = discoverNarrativeCollectableV68(save, EXPECTED_IDS[0], { eventId: 'runtime:second-trigger' });
  assert.equal(duplicate.applied, false);
  assert.equal(duplicate.reason, 'already-discovered');
  assert.deepEqual(duplicate.rewards, {});
  assert.equal(save.narrativeArchives.handledEventIds.filter((id) => id === `collectable:${EXPECTED_IDS[0]}`).length, 1);

  const investigation = getNarrativeInvestigationV68(save);
  assert.equal(investigation.discoveredCount, 4);
  assert.equal(investigation.unreadCount, 4);
  assert.equal(investigation.analysisComplete, true);
  assert.equal(investigation.activeContradictionCount, NARRATIVE_COVERAGE_V68.contradictionCount);
  assert.equal(investigation.activeCorroborationCount, NARRATIVE_COVERAGE_V68.corroborationCount);
  assert.equal(investigation.activeQualificationCount, NARRATIVE_COVERAGE_V68.qualificationCount);
});

test('reading and route verdicts are gated, permanent, mutually exclusive and idempotent', () => {
  const save = createDefaultSave(1);
  assert.equal(markNarrativeCollectableReadV68(save, EXPECTED_IDS[0]).reason, 'not-discovered');
  assert.equal(recordNarrativeDecisionV68(save, 'follow-maintenance-trace').reason, 'requirements-not-met');
  discoverAll(save);

  const firstRead = markNarrativeCollectableReadV68(save, EXPECTED_IDS[0]);
  assert.equal(firstRead.applied, true);
  assert.equal(markNarrativeCollectableReadV68(save, EXPECTED_IDS[0]).reason, 'already-read');
  assert.equal(getNarrativeInvestigationV68(save).unreadCount, 3);

  const decision = recordNarrativeDecisionV68(save, 'qz17-route-verdict', 'follow-maintenance-trace');
  assert.equal(decision.applied, true);
  assert.equal(decision.routeUnlockFlag, 'qz17-maintenance-bypass');
  assert.ok(save.narrativeArchives.unlockedFlags.includes('qz17-maintenance-bypass'));
  assert.equal(recordNarrativeDecisionV68(save, 'follow-maintenance-trace').reason, 'already-applied');
  assert.equal(recordNarrativeDecisionV68(save, 'secure-quarantine-evidence').reason, 'decision-locked');
  assert.equal(save.narrativeArchives.decisions['qz17-route-verdict'], 'follow-maintenance-trace');

  const investigation = getNarrativeInvestigationV68(save);
  const selected = investigation.decisions.find((entry) => entry.id === 'follow-maintenance-trace');
  const rejected = investigation.decisions.find((entry) => entry.id === 'secure-quarantine-evidence');
  assert.equal(selected.selected, true);
  assert.equal(selected.available, false);
  assert.equal(rejected.lockedByChoice, true);
  assert.equal(rejected.routeUnlockFlag, 'qz17-quarantine-lock');
});

test('V68 ledger migration is bounded, whitelist-derived and idempotent', () => {
  const oversized = Array.from({ length: 400 }, (_, index) => `foreign-event-${index}`);
  const candidate = {
    schema: 999,
    discovered: {
      [EXPECTED_IDS[0]]: {
        discoveredAtDay: -8,
        discoveredAtHour: 999,
        campaignId: 'x'.repeat(500),
        worldId: 'world-05-lethe',
        levelId: 'ship-interior-vertical',
        rewardClaimed: false
      },
      unknown: { discoveredAtDay: 2 }
    },
    readIds: [EXPECTED_IDS[0], EXPECTED_IDS[0], 'unknown'],
    playedIds: [EXPECTED_IDS[0], 'unknown'],
    decisions: { 'qz17-route-verdict': 'follow-maintenance-trace', foreign: 'open-all' },
    unlockedFlags: ['qz17-maintenance-bypass', 'foreign-unlock'],
    handledEventIds: [...oversized, `collectable:${EXPECTED_IDS[0]}`, `read:${EXPECTED_IDS[0]}`]
  };
  const normalized = normalizeNarrativeArchivesV68(candidate);
  assert.equal(normalized.schema, NARRATIVE_ARCHIVE_SCHEMA_V68);
  assert.deepEqual(Object.keys(normalized.discovered), [EXPECTED_IDS[0]]);
  assert.equal(normalized.discovered[EXPECTED_IDS[0]].discoveredAtDay, 1);
  assert.equal(normalized.discovered[EXPECTED_IDS[0]].discoveredAtHour, 24);
  assert.equal(normalized.discovered[EXPECTED_IDS[0]].campaignId.length, 120);
  assert.equal(normalized.discovered[EXPECTED_IDS[0]].rewardClaimed, true, 'une archive importée ne peut pas repayer sa récompense');
  assert.deepEqual(normalized.readIds, [EXPECTED_IDS[0]]);
  assert.deepEqual(normalized.playedIds, [], 'aucun texte ne peut être marqué comme média joué');
  assert.deepEqual(normalized.decisions, {}, 'une décision sans ses quatre preuves est rejetée');
  assert.deepEqual(normalized.unlockedFlags, [], 'les déblocages sont recalculés depuis les preuves et décisions');
  assert.deepEqual(normalized.handledEventIds, [`collectable:${EXPECTED_IDS[0]}`, `read:${EXPECTED_IDS[0]}`]);
  assert.deepEqual(normalizeNarrativeArchivesV68(normalized), normalized);
});

test('save migration and storage round trips preserve the QZ-17 ledger without replaying events', () => {
  const original = createDefaultSave(2);
  discoverAll(original);
  markNarrativeCollectableReadV68(original, EXPECTED_IDS[1]);
  recordNarrativeDecisionV68(original, 'secure-quarantine-evidence');
  const migrated = migrateSave({ ...original, schema: 3, release: 'legacy-test' }, 2);
  assert.deepEqual(migrated.narrativeArchives, original.narrativeArchives);
  assert.deepEqual(migrateSave(migrated, 2).narrativeArchives, migrated.narrativeArchives);

  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  const writer = new SaveSystem(storage);
  writer.profile = 2;
  writer.data = migrated;
  writer.commit();
  const reader = new SaveSystem(storage);
  const loaded = reader.load(2);
  assert.deepEqual(loaded.narrativeArchives, migrated.narrativeArchives);
  const duplicate = discoverNarrativeCollectableV68(loaded, EXPECTED_IDS[2]);
  assert.equal(duplicate.applied, false);
  assert.deepEqual(duplicate.rewards, {});
  assert.ok(loaded.narrativeArchives.unlockedFlags.includes('qz17-quarantine-lock'));
});

test('la victoire QZ-17 transfère les cinq intel en recherche stratégique une seule fois et les journalise', () => {
  const save = createDefaultSave(1);
  const campaign = CAMPAIGNS.find((entry) => entry.id === NARRATIVE_OPERATION_V68.campaignId);
  const world = WORLDS.find((entry) => entry.id === campaign?.worldId);
  assert.ok(campaign && world);
  if (!save.galaxy.unlockedWorldIds.includes(world.id)) save.galaxy.unlockedWorldIds.push(world.id);
  const deployment = beginOperation(save, campaign, world);
  assert.equal(deployment.ok, true);
  deployment.operation.specialOperationId = NARRATIVE_OPERATION_V68.specialOperationId;
  discoverAll(save);
  assert.equal(recordNarrativeDecisionV68(save, 'secure-quarantine-evidence').applied, true);

  const researchBeforeVictory = save.galaxy.resources.research;
  const baseResearchReward = deployment.operation.reward.research;
  const rewards = { intel: QZ17_STRATEGIC_RESEARCH_BONUS_V68.research };
  const outcome = resolveOperation(save, { success: true, kills: 0, rewards });
  assert.equal(outcome.ok, true);
  assert.deepEqual(outcome.specialOperationBonus, { research: 5 });
  assert.equal(save.galaxy.resources.research, researchBeforeVictory + baseResearchReward + 5);
  assert.deepEqual(save.strategy.lastOperation.specialOperationBonus, { research: 5 });
  assert.match(save.strategy.lastOperation.result, /Bonus QZ-17 : \+5 recherche issue des archives/);
  assert.match(save.strategy.log[0].result, /Bonus QZ-17 : \+5 recherche issue des archives/);

  const resourcesAfterVictory = structuredClone(save.galaxy.resources);
  assert.deepEqual(resolveOperation(save, { success: true, kills: 0, rewards }), { ok: false, reason: 'no-operation' });
  assert.deepEqual(save.galaxy.resources, resourcesAfterVictory);

  const migrated = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  assert.deepEqual(migrated.galaxy.resources, resourcesAfterVictory);
  assert.deepEqual(migrated.strategy.lastOperation.specialOperationBonus, { research: 5 });
  assert.match(migrated.strategy.lastOperation.result, /Bonus QZ-17 : \+5 recherche/);
  const remigrated = migrateSave(migrated, 1);
  assert.deepEqual(remigrated.galaxy.resources, resourcesAfterVictory);
  assert.deepEqual(remigrated.strategy.lastOperation.specialOperationBonus, { research: 5 });

  const values = new Map();
  const storage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key)
  };
  const writer = new SaveSystem(storage);
  writer.profile = 1;
  writer.data = remigrated;
  writer.commit();
  const loaded = new SaveSystem(storage).load(1);
  assert.deepEqual(loaded.galaxy.resources, resourcesAfterVictory);
  assert.deepEqual(loaded.strategy.lastOperation.specialOperationBonus, { research: 5 });
  assert.deepEqual(resolveOperation(loaded, { success: true, kills: 0, rewards }), { ok: false, reason: 'no-operation' });
  assert.deepEqual(loaded.galaxy.resources, resourcesAfterVictory);
});

test('une opération ordinaire ignore rewards.intel et conserve uniquement sa récompense stratégique normale', () => {
  const save = createDefaultSave(1);
  const campaign = CAMPAIGNS.find((entry) => entry.id !== NARRATIVE_OPERATION_V68.campaignId
    && entry.id !== 'special-cargo-brutal'
    && save.galaxy.unlockedWorldIds.includes(entry.worldId));
  const world = WORLDS.find((entry) => entry.id === campaign?.worldId);
  assert.ok(campaign && world);
  const deployment = beginOperation(save, campaign, world);
  const before = save.galaxy.resources.research;
  const outcome = resolveOperation(save, { success: true, kills: 0, rewards: { intel: 5 } });
  assert.equal(outcome.ok, true);
  assert.deepEqual(outcome.specialOperationBonus, {});
  assert.deepEqual(save.strategy.lastOperation.specialOperationBonus, {});
  assert.equal(save.galaxy.resources.research, before + deployment.operation.reward.research);
  assert.doesNotMatch(outcome.result, /QZ-17/);
});

test('native operation sanitization preserves the nested QZ-17 runtime only when it is present', () => {
  const qz17Runtime = {
    schema: 68,
    operationId: NARRATIVE_OPERATION_V68.id,
    campaignId: NARRATIVE_OPERATION_V68.campaignId,
    collectedIds: EXPECTED_IDS,
    gate: { doorId: 'aft-bulkhead', opened: true, openedAt: 84.25 },
    telemetry: { discoveries: 4, duplicateAttempts: 1, outOfRangeAttempts: 2 }
  };
  const resumeState = {
    schema: 1,
    identity: { seed: 6817, worldId: 'world-05-lethe', campaignId: NARRATIVE_OPERATION_V68.campaignId },
    specialOperation: {
      operationId: NARRATIVE_OPERATION_V68.id,
      narrativeCollectablesV68: qz17Runtime
    }
  };
  const sanitized = sanitizeOperationResumeState(resumeState);
  assert.deepEqual(sanitized.specialOperation.narrativeCollectablesV68, qz17Runtime);

  const withOperation = createDefaultSave(1);
  withOperation.strategy.currentOperation = {
    id: 'operation-qz17-test',
    campaignId: NARRATIVE_OPERATION_V68.campaignId,
    worldId: withOperation.worldId,
    startedDay: 1,
    startedHour: 6,
    risk: 20,
    cost: {},
    reward: {},
    crewIds: withOperation.strategy.selectedCrewIds,
    weaponIds: withOperation.player.weaponIds,
    equipmentIds: withOperation.player.equipmentIds,
    vehicleId: withOperation.strategy.selectedVehicleId,
    difficulty: 'standard',
    resumeState,
    insertionState: null,
    flags: {}
  };
  const migrated = migrateSave(withOperation, 1);
  assert.deepEqual(migrated.strategy.currentOperation.resumeState.specialOperation.narrativeCollectablesV68, qz17Runtime);

  const ordinary = sanitizeOperationResumeState({
    schema: 1,
    identity: { seed: 12, worldId: 'world-01', campaignId: 'ordinary-frontier-test' },
    player: { x: 120, y: 300 }
  });
  assert.equal(Object.hasOwn(ordinary, 'specialOperation'), false);
  assert.equal(Object.hasOwn(ordinary, 'narrativeCollectablesV68'), false);
});
