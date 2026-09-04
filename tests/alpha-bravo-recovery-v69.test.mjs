import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { CAMPAIGNS, WORLDS } from '../src/content.js';
import {
  ALPHA_BRAVO_DOCTRINE_V69,
  abandonBlockedAlphaBravoOperationV69,
  beginOperation,
  createDefaultSave,
  getAlphaBravoStrategicRecoveryV69,
  migrateSave
} from '../src/save.js';

const doctrineCampaign = CAMPAIGNS.find((entry) => entry.id === ALPHA_BRAVO_DOCTRINE_V69.campaignId);
const doctrineWorld = WORLDS.find((entry) => entry.id === doctrineCampaign?.worldId);

function deployedDoctrine() {
  const save = createDefaultSave(1);
  if (!save.galaxy.unlockedWorldIds.includes(doctrineWorld.id)) save.galaxy.unlockedWorldIds.push(doctrineWorld.id);
  const deployment = beginOperation(save, doctrineCampaign, doctrineWorld);
  deployment.operation.specialOperationId = ALPHA_BRAVO_DOCTRINE_V69.specialOperationId;
  return { save, operation: deployment.operation };
}

test('la récupération stratégique reste cachée tant que les quatre opérateurs V69 sont actifs', () => {
  const { save, operation } = deployedDoctrine();
  const currentBefore = structuredClone(operation);
  const recovery = getAlphaBravoStrategicRecoveryV69(save);

  assert.equal(recovery.canAbandon, false);
  assert.equal(recovery.reason, 'operation-resumable');
  assert.equal(recovery.activeCrewCount, 4);
  assert.deepEqual(abandonBlockedAlphaBravoOperationV69(save), {
    ok: false,
    reason: 'operation-resumable',
    recovery
  });
  assert.deepEqual(save.strategy.currentOperation, currentBefore);
  assert.equal(save.alphaBravoDoctrine.summary.completedRuns, 0);
});

test('un reload après squad-lost peut archiver V69 sans récompense ni nouvelle conséquence équipage', () => {
  const { save, operation } = deployedDoctrine();
  const casualtyId = operation.crewIds[2];
  const casualty = save.crew.find((member) => member.id === casualtyId);
  casualty.status = 'deceased';
  casualty.health = 0;
  casualty.stress = 91;
  casualty.injuries.push({ type: 'mission-casualty', day: save.clock.day, severity: 100, operationId: operation.id });
  save.memorial.push({
    crewId: casualtyId,
    day: save.clock.day,
    campaignId: operation.campaignId,
    operationId: operation.id,
    reason: 'squad-lost'
  });

  const loaded = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  const recovery = getAlphaBravoStrategicRecoveryV69(loaded);
  assert.equal(recovery.canAbandon, true);
  assert.equal(recovery.reason, 'crew-below-minimum');
  assert.equal(recovery.activeCrewCount, 3);
  assert.deepEqual(recovery.unavailableCrewIds, [casualtyId]);

  const persistentConsequences = structuredClone({
    crew: loaded.crew,
    memorial: loaded.memorial,
    resources: loaded.galaxy.resources,
    worldState: loaded.galaxy.worldState,
    completedCampaignIds: loaded.galaxy.completedCampaignIds,
    campaigns: loaded.statistics.campaigns
  });
  const retreatsBefore = loaded.statistics.retreats;
  const outcome = abandonBlockedAlphaBravoOperationV69(loaded);

  assert.equal(outcome.ok, true);
  assert.equal(outcome.success, false);
  assert.equal(outcome.operation.reason, 'strategic-abandonment');
  assert.deepEqual(outcome.operation.specialOperationBonus, {});
  assert.equal(loaded.strategy.currentOperation, null);
  assert.equal(loaded.strategy.lastOperation.id, operation.id);
  assert.deepEqual(loaded.crew, persistentConsequences.crew);
  assert.deepEqual(loaded.memorial, persistentConsequences.memorial);
  assert.deepEqual(loaded.galaxy.resources, persistentConsequences.resources);
  assert.deepEqual(loaded.galaxy.worldState, persistentConsequences.worldState);
  assert.deepEqual(loaded.galaxy.completedCampaignIds, persistentConsequences.completedCampaignIds);
  assert.equal(loaded.statistics.campaigns, persistentConsequences.campaigns);
  assert.equal(loaded.statistics.retreats, retreatsBefore + 1);

  const runs = loaded.alphaBravoDoctrine.runs;
  assert.equal(runs.length, 1);
  assert.equal(runs[0].operationId, operation.id);
  assert.equal(runs[0].success, false);
  assert.equal(runs[0].bonusApplied, false);
  assert.equal(runs[0].reason, 'strategic-abandonment');
  assert.equal(runs[0].crewResults.find((entry) => entry.crewId === casualtyId)?.health, 0);
  assert.deepEqual(abandonBlockedAlphaBravoOperationV69(loaded), {
    ok: false,
    reason: 'no-operation',
    recovery: { canAbandon: false, reason: 'no-operation' }
  });
  assert.equal(loaded.alphaBravoDoctrine.runs.length, 1, 'aucun doublon de registre ne doit être créé');
});

test('une opération historique sans minimumCrew explicite conserve la reprise V68', () => {
  const ordinaryCampaign = CAMPAIGNS.find((entry) => entry.id !== ALPHA_BRAVO_DOCTRINE_V69.campaignId && entry.minimumCrew == null);
  const ordinaryWorld = WORLDS.find((entry) => entry.id === ordinaryCampaign?.worldId);
  const save = createDefaultSave(2);
  if (!save.galaxy.unlockedWorldIds.includes(ordinaryWorld.id)) save.galaxy.unlockedWorldIds.push(ordinaryWorld.id);
  const first = beginOperation(save, ordinaryCampaign, ordinaryWorld);
  for (const member of save.crew.filter((entry) => first.operation.crewIds.includes(entry.id))) member.status = 'injured';

  const resumed = beginOperation(save, ordinaryCampaign, ordinaryWorld);
  assert.equal(resumed.resumed, true);
  assert.equal(resumed.operation.id, first.operation.id);
  assert.equal(getAlphaBravoStrategicRecoveryV69(save).reason, 'unsupported-operation');
});

test('l’écran Opérations câble un abandon V69 distinct de la reprise de mission', async () => {
  const source = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(source, /getAlphaBravoStrategicRecoveryV69/);
  assert.match(source, /id="operation-abandon-v69"/);
  assert.match(source, /ARCHIVER L’OPÉRATION PERDUE/);
  assert.match(source, /abandonButton\.onclick = abandonBlockedOperationV69/);
  assert.match(source, /abandonBlockedAlphaBravoOperationV69\(saveSystem\.data\)/);
});
