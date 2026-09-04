import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGNS, CREW, WORLDS } from '../src/content.js';
import {
  ALPHA_BRAVO_DOCTRINE_V69,
  ALPHA_BRAVO_STRATEGIC_BONUS_V69,
  beginOperation,
  createDefaultSave,
  getAlphaBravoDoctrineSnapshotV69,
  getOperationBrief,
  migrateSave,
  normalizeAlphaBravoDoctrineV69,
  resolveOperation
} from '../src/save.js';

const campaign = CAMPAIGNS.find((entry) => entry.id === ALPHA_BRAVO_DOCTRINE_V69.campaignId);
const world = WORLDS.find((entry) => entry.id === campaign?.worldId);

function deployment() {
  const save = createDefaultSave(1);
  if (!save.galaxy.unlockedWorldIds.includes(world.id)) save.galaxy.unlockedWorldIds.push(world.id);
  const result = beginOperation(save, campaign, world);
  return { save, operation: result.operation, brief: result.brief };
}

function payloadFor(operation, {
  score = 84,
  operationId = operation.id,
  certified = true,
  tasks = null,
  crewResults = null
} = {}) {
  return {
    alphaBravoDoctrine: {
      schema: 69,
      certified,
      operationId,
      campaignId: ALPHA_BRAVO_DOCTRINE_V69.campaignId,
      score,
      tasks: tasks || ALPHA_BRAVO_DOCTRINE_V69.tasks.map((task) => ({ ...task, complete: true })),
      crewResults: crewResults || operation.crewIds.map((crewId, index) => ({
        crewId,
        health: 92 - index * 7,
        stress: 12 + index * 5,
        injuries: index === 2 ? ['acid-burn'] : []
      }))
    }
  };
}

test('Alpha / Bravo exige quatre opérateurs actifs dans le briefing et au déploiement', () => {
  assert.ok(campaign && world);
  assert.equal(campaign.minimumCrew, 4);
  const save = createDefaultSave(1);
  const selected = save.strategy.selectedCrewIds;
  save.crew.find((member) => member.id === selected[3]).status = 'injured';
  const blocked = getOperationBrief(save, campaign, world);
  assert.equal(blocked.minimumCrew, 4);
  assert.equal(blocked.crewIds.length, 3);
  assert.equal(blocked.crewReady, false);
  assert.equal(blocked.ready, false);
  assert.throws(() => beginOperation(save, campaign, world), /4 operateurs actifs requis/i);

  save.crew.find((member) => member.id === selected[3]).status = 'active';
  const ready = beginOperation(save, campaign, world);
  assert.equal(ready.brief.crewReady, true);
  assert.equal(ready.operation.crewIds.length, 4);
  assert.equal(ready.operation.specialOperationId, 'alpha-bravo-coop');

  ready.operation.crewIds.pop();
  assert.throws(() => beginOperation(save, campaign, world), /escouade incomplete/i);
});

test('la reprise refuse une escouade qui conserve quatre IDs mais seulement trois membres actifs', () => {
  const { save, operation } = deployment();
  const casualty = save.crew.find((member) => member.id === operation.crewIds[2]);
  casualty.health = 0;
  casualty.status = 'deceased';

  assert.equal(operation.crewIds.length, 4);
  assert.throws(() => beginOperation(save, campaign, world), /4 operateurs actifs requis/i);
});

test('une victoire certifiée verse le bonus fixe une fois et persiste les quatre résultats individuels', () => {
  const { save, operation } = deployment();
  const before = {
    research: save.galaxy.resources.research,
    morale: save.hub.systems.morale,
    baseResearch: operation.reward.research
  };
  const rewards = payloadFor(operation);
  const outcome = resolveOperation(save, { success: true, kills: 8, rewards });

  assert.equal(outcome.ok, true);
  assert.equal(outcome.success, true);
  assert.deepEqual(outcome.specialOperationBonus, ALPHA_BRAVO_STRATEGIC_BONUS_V69);
  assert.equal(save.galaxy.resources.research, before.research + before.baseResearch + 8);
  assert.equal(save.hub.systems.morale, before.morale + 6);
  assert.match(outcome.result, /Bonus Doctrine Alpha \/ Bravo : \+8 recherche, \+6 morale/);
  assert.deepEqual(save.alphaBravoDoctrine.summary, {
    completedRuns: 1,
    victories: 1,
    failures: 0,
    bestScore: 84,
    averageScore: 84,
    lastOperationId: operation.id
  });
  assert.equal(save.alphaBravoDoctrine.runs[0].crewResults.length, 4);
  for (const [index, crewId] of operation.crewIds.entries()) {
    const member = save.crew.find((entry) => entry.id === crewId);
    assert.equal(member.health, 92 - index * 7);
    assert.equal(member.stress, 12 + index * 5);
  }
  const injured = save.crew.find((entry) => entry.id === operation.crewIds[2]);
  assert.ok(injured.injuries.some((entry) => entry.type === 'acid-burn' && entry.operationId === operation.id));

  const resourcesAfter = structuredClone(save.galaxy.resources);
  const moraleAfter = save.hub.systems.morale;
  assert.deepEqual(resolveOperation(save, { success: true, rewards }), { ok: false, reason: 'no-operation' });
  assert.deepEqual(save.galaxy.resources, resourcesAfter);
  assert.equal(save.hub.systems.morale, moraleAfter);

  const stale = migrateSave(JSON.parse(JSON.stringify(save)), 1);
  stale.strategy.currentOperation = structuredClone(stale.strategy.lastOperation);
  assert.deepEqual(resolveOperation(stale, { success: true, rewards }), { ok: false, reason: 'operation-already-resolved' });
  assert.deepEqual(stale.galaxy.resources, resourcesAfter);
  assert.equal(stale.hub.systems.morale, moraleAfter);
});

test('un certificat stale force un échec sans appliquer ses résultats équipage', () => {
  const { save, operation } = deployment();
  const researchBefore = save.galaxy.resources.research;
  const moraleBefore = save.hub.systems.morale;
  const lead = save.crew.find((member) => member.id === operation.crewIds[0]);
  const healthBefore = lead.health;
  const outcome = resolveOperation(save, {
    success: true,
    rewards: payloadFor(operation, { operationId: 'operation-stale' })
  });

  assert.equal(outcome.ok, true);
  assert.equal(outcome.success, false);
  assert.deepEqual(outcome.specialOperationBonus, {});
  assert.equal(outcome.operation.reason, 'doctrine-certification');
  assert.equal(save.galaxy.resources.research, researchBefore);
  assert.equal(save.hub.systems.morale, moraleBefore);
  assert.ok(lead.health < healthBefore, 'le fallback stratégique reste actif quand le payload est stale');
  assert.equal(save.alphaBravoDoctrine.summary.completedRuns, 0, 'un payload stale ne devient pas un run terminal');
});

test('un score inférieur à 60 échoue sans bonus mais conserve exactement les résultats terrain certifiés', () => {
  const { save, operation } = deployment();
  const crewResults = operation.crewIds.map((crewId, index) => ({
    crewId,
    health: 96 - index * 4,
    stress: 7 + index * 3,
    injuries: index === 1 ? ['impact-trauma'] : []
  }));
  const outcome = resolveOperation(save, {
    success: true,
    rewards: payloadFor(operation, { score: 59, crewResults })
  });

  assert.equal(outcome.success, false);
  assert.deepEqual(outcome.specialOperationBonus, {});
  assert.equal(outcome.operation.reason, 'doctrine-certification');
  for (const expected of crewResults) {
    const member = save.crew.find((entry) => entry.id === expected.crewId);
    assert.equal(member.health, expected.health);
    assert.equal(member.stress, expected.stress);
    assert.equal(member.injuries.some((injury) => injury.type === 'mission-trauma'), false);
  }
  assert.equal(outcome.operation.alphaBravoDoctrineRun.certified, true);
  assert.equal(outcome.operation.alphaBravoDoctrineRun.success, false);
});

test('une retraite avec payload structurel persiste santé, stress et blessures sans pénalité générique', () => {
  const { save, operation } = deployment();
  const tasks = ALPHA_BRAVO_DOCTRINE_V69.tasks.map((task, index) => ({ ...task, complete: index === 0 }));
  const crewResults = operation.crewIds.map((crewId, index) => ({
    crewId,
    health: [88, 64, 47, 79][index],
    stress: [31, 54, 67, 42][index],
    injuries: index === 1 ? ['impact-trauma'] : index === 2 ? ['critical-trauma'] : []
  }));
  const outcome = resolveOperation(save, {
    success: false,
    reason: 'retreat',
    rewards: payloadFor(operation, { certified: false, score: 41, tasks, crewResults })
  });

  assert.equal(outcome.success, false);
  assert.equal(outcome.operation.reason, 'retreat');
  assert.equal(save.statistics.retreats, 1);
  for (const expected of crewResults) {
    const member = save.crew.find((entry) => entry.id === expected.crewId);
    assert.equal(member.health, expected.health);
    assert.equal(member.stress, expected.stress);
    assert.equal(member.injuries.some((injury) => injury.type === 'combat-stress'), false);
  }
  assert.equal(save.alphaBravoDoctrine.runs[0].crewResults.length, 4);
  assert.equal(save.alphaBravoDoctrine.runs[0].certified, false);
  assert.equal(save.alphaBravoDoctrine.runs[0].success, false);
});

test('un décès déjà mémorialisé par le runtime ne crée pas une seconde entrée à la résolution', () => {
  const { save, operation } = deployment();
  const casualtyId = operation.crewIds[2];
  const casualty = save.crew.find((member) => member.id === casualtyId);
  casualty.health = 0;
  casualty.status = 'deceased';
  save.memorial.push({
    crewId: casualtyId,
    day: save.clock.day,
    campaignId: operation.campaignId,
    reason: 'squad-lost'
  });
  const crewResults = operation.crewIds.map((crewId) => ({
    crewId,
    health: crewId === casualtyId ? 0 : 90,
    stress: 25,
    injuries: crewId === casualtyId ? ['incapacitated'] : []
  }));

  const outcome = resolveOperation(save, {
    success: true,
    rewards: payloadFor(operation, { crewResults })
  });

  assert.equal(outcome.success, true);
  assert.equal(casualty.status, 'deceased');
  assert.equal(save.memorial.filter((entry) => entry.crewId === casualtyId && entry.campaignId === operation.campaignId).length, 1);
});

test('un identifiant d’opération non canonique invalide le certificat et ne rattache aucun ancien run', () => {
  const { save, operation } = deployment();
  const prior = {
    schema: 69,
    operationId: 'operation-99-special-alpha-bravo-doctrine',
    campaignId: ALPHA_BRAVO_DOCTRINE_V69.campaignId,
    score: 88,
    certified: true,
    success: true,
    bonusApplied: true,
    tasks: ALPHA_BRAVO_DOCTRINE_V69.tasks.map((task) => ({ ...task, complete: true })),
    crewResults: operation.crewIds.map((crewId) => ({ crewId, health: 90, stress: 10, injuries: [] })),
    completedDay: 1,
    completedHour: 4
  };
  save.alphaBravoDoctrine = normalizeAlphaBravoDoctrineV69({ runs: [prior] });
  operation.id = 'operation-forged-special-alpha-bravo-doctrine';
  const researchBefore = save.galaxy.resources.research;
  const outcome = resolveOperation(save, { success: true, rewards: payloadFor(operation) });

  assert.equal(outcome.success, false);
  assert.deepEqual(outcome.specialOperationBonus, {});
  assert.equal(save.galaxy.resources.research, researchBefore);
  assert.equal(Object.hasOwn(outcome.operation, 'alphaBravoDoctrineRun'), false);
  assert.deepEqual(save.alphaBravoDoctrine.runs.map((run) => run.operationId), [prior.operationId]);
});

test('un faux run minimal ne peut pas annuler une opération active portant le même identifiant', () => {
  const { save, operation } = deployment();
  save.alphaBravoDoctrine = {
    schema: 69,
    runs: [{ operationId: operation.id }],
    summary: { completedRuns: 999, victories: 999, failures: 0 }
  };
  const outcome = resolveOperation(save, {
    success: true,
    rewards: payloadFor(operation)
  });

  assert.equal(outcome.ok, true);
  assert.equal(outcome.success, true);
  assert.equal(save.alphaBravoDoctrine.summary.completedRuns, 1);
  assert.equal(save.alphaBravoDoctrine.runs[0].operationId, operation.id);
  assert.equal(save.alphaBravoDoctrine.runs[0].terminal, true);
});

test('la migration borne à 64 runs, déduplique les opérations et recalcule le résumé anti-tamper', () => {
  const crewIds = CREW.slice(0, 4).map((member) => member.id);
  const run = (index) => ({
    schema: 69,
    operationId: `operation-${index}-special-alpha-bravo-doctrine`,
    campaignId: ALPHA_BRAVO_DOCTRINE_V69.campaignId,
    score: index % 101,
    certified: true,
    success: true,
    bonusApplied: true,
    tasks: ALPHA_BRAVO_DOCTRINE_V69.tasks.map((task) => ({ ...task, complete: true })),
    crewResults: crewIds.map((crewId) => ({ crewId, health: 250, stress: -8, injuries: ['x'.repeat(100)] })),
    completedDay: index + 1,
    completedHour: 12
  });
  const runs = Array.from({ length: 70 }, (_, index) => run(index));
  runs.push({ ...run(69), score: 17, success: false });
  const normalized = normalizeAlphaBravoDoctrineV69({
    schema: 999,
    runs,
    summary: { completedRuns: 999999, victories: 999999, bestScore: 999999 }
  });
  assert.equal(normalized.schema, 69);
  assert.equal(normalized.runs.length, 64);
  assert.equal(new Set(normalized.runs.map((entry) => entry.operationId)).size, 64);
  assert.equal(normalized.runs.at(-1).operationId, 'operation-69-special-alpha-bravo-doctrine');
  assert.equal(normalized.runs.at(-1).score, 17);
  assert.equal(normalized.runs.at(-1).success, false);
  assert.equal(normalized.summary.completedRuns, 64);
  assert.equal(normalized.summary.victories + normalized.summary.failures, 64);
  assert.ok(normalized.summary.bestScore <= 100);
  assert.equal(normalized.runs[0].crewResults[0].health, 100);
  assert.equal(normalized.runs[0].crewResults[0].stress, 0);
  assert.equal(normalized.runs[0].crewResults[0].injuries[0].length, 60);

  const save = createDefaultSave(2);
  save.alphaBravoDoctrine = { schema: 1, runs, summary: { completedRuns: -1 } };
  const loaded = migrateSave(JSON.parse(JSON.stringify(save)), 2);
  assert.deepEqual(getAlphaBravoDoctrineSnapshotV69(loaded), normalizeAlphaBravoDoctrineV69(save.alphaBravoDoctrine));
  assert.deepEqual(loaded.alphaBravoDoctrine.summary, getAlphaBravoDoctrineSnapshotV69(loaded).summary);
});

test('les campagnes ordinaires conservent leur résolution sans certificat V69', () => {
  const ordinary = CAMPAIGNS.find((entry) => entry.id !== ALPHA_BRAVO_DOCTRINE_V69.campaignId && entry.worldId === WORLDS[0].id) || CAMPAIGNS[0];
  const ordinaryWorld = WORLDS.find((entry) => entry.id === ordinary.worldId);
  const save = createDefaultSave(3);
  if (!save.galaxy.unlockedWorldIds.includes(ordinaryWorld.id)) save.galaxy.unlockedWorldIds.push(ordinaryWorld.id);
  const started = beginOperation(save, ordinary, ordinaryWorld);
  assert.equal(started.brief.minimumCrew, 1);
  const outcome = resolveOperation(save, { success: true, kills: 1 });
  assert.equal(outcome.success, true);
  assert.deepEqual(outcome.specialOperationBonus, {});
  assert.equal(save.alphaBravoDoctrine.summary.completedRuns, 0);
});
