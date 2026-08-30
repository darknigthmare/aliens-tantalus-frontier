import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLDS } from '../src/content.js';
import { normalizeInfestationChainV62 } from '../src/infestation-chain-v62.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import {
  CRISIS_KINDS,
  HUB_CRISIS_ACTIONS,
  advanceGalaxy,
  createHubCrisis,
  deriveHubCrisis,
  getHubCrisisPressure,
  planHubCrisisResolution,
  resolveHubCrisisEvent,
  simulateGalaxy,
  withHubCrisis
} from '../src/world-crisis.js';

const crisisKeys = ['count', 'deck', 'id', 'kind', 'resolved', 'roomId'];

function neutralizeWorlds(save, infestation = 0, quarantine = 80) {
  for (const state of Object.values(save.galaxy.worldState)) {
    state.infestation = infestation;
    state.quarantine = quarantine;
    state.stability = 75;
  }
}

const CRISIS_SOURCE_TYPES = Object.freeze({
  xenomorph: 'live-specimen',
  synthetic: 'synthetic-intrusion',
  pathogen: 'pathogen-sample'
});

function prepareCausalCrisis(kind, profile = 2) {
  const save = createDefaultSave(profile);
  neutralizeWorlds(save);
  Object.assign(save.hub.systems, { hull: 100, power: 100, oxygen: 100, security: 100, quarantine: 100, morale: 100 });
  const sourceType = CRISIS_SOURCE_TYPES[kind];
  save.hub.infestationChain = normalizeInfestationChainV62({
    id: `test-chain-${kind}`,
    kind,
    stage: 'infestation',
    source: {
      type: sourceType,
      eventId: `test-causal-event-${kind}`,
      worldId: save.galaxy.unlockedWorldIds[0],
      label: `Événement causal ${kind}`
    },
    severity: 84,
    certainty: 100,
    estimatedThreats: 3,
    startedAtHours: 0,
    updatedAtHours: 18,
    containment: { score: 0, attempts: [], resolved: false, failed: true },
    history: [
      { stage: 'exposure', atHours: 0, reason: 'Retour physique enregistré' },
      { stage: 'infestation', atHours: 18, reason: 'Rupture physique du confinement' }
    ]
  });
  return save;
}

test('un événement causal rompu produit de façon déterministe les trois types de crise jouable', () => {
  for (const kind of CRISIS_KINDS) {
    const save = prepareCausalCrisis(kind);
    const before = structuredClone(save);
    const first = deriveHubCrisis(save);
    const second = deriveHubCrisis(save);
    assert.equal(first.kind, kind);
    assert.deepEqual(first, second);
    assert.deepEqual(save, before, 'la dérivation pure ne doit pas modifier la sauvegarde');
    assert.deepEqual(Object.keys(first).sort(), crisisKeys);
    assert.ok(first.count >= 1 && first.count <= 12);
    assert.ok(first.deck >= 0 && first.deck <= 3);
    assert.equal(first.resolved, false);
  }
});

test('création mutable et variante immuable écrivent exactement activeCrisis', () => {
  const pathogenSave = prepareCausalCrisis('pathogen', 1);
  const immutable = withHubCrisis(pathogenSave);
  assert.equal(pathogenSave.hub.activeCrisis, null);
  assert.deepEqual(immutable.save.hub.activeCrisis, immutable.crisis);
  assert.deepEqual(Object.keys(immutable.crisis).sort(), crisisKeys);

  const save = prepareCausalCrisis('synthetic', 1);
  const crisis = createHubCrisis(save);
  assert.deepEqual(save.hub.activeCrisis, crisis);
  assert.deepEqual(Object.keys(save.hub.activeCrisis).sort(), crisisKeys);
  const persisted = migrateSave(JSON.parse(JSON.stringify(save)), save.profile);
  assert.deepEqual(persisted.hub.activeCrisis, crisis);
});

test('une résolution réussie applique systèmes, ressources, stress et dégâts module pour chaque type', () => {
  for (const kind of CRISIS_KINDS) {
    const save = prepareCausalCrisis(kind, 1);
    Object.assign(save.hub.systems, { hull: 60, power: 60, oxygen: 60, security: 60, quarantine: 60, morale: 60 });
    Object.assign(save.galaxy.resources, { credits: 1000, alloy: 100, fuel: 100, medical: 100, research: 100, pathogen: 10 });
    save.hub.moduleIntegrity = Object.fromEntries(save.hub.moduleIds.map((id) => [id, 100]));
    const crisis = createHubCrisis(save);
    const before = structuredClone(save);
    const planned = planHubCrisisResolution(save, {
      action: HUB_CRISIS_ACTIONS.resolved,
      crisisId: crisis.id,
      kind
    });
    assert.equal(planned.handled, true);
    assert.equal(planned.outcome, 'resolved');
    assert.equal(planned.save.hub.activeCrisis.resolved, true);
    for (const key of ['hull', 'security', 'quarantine', 'oxygen', 'morale']) {
      assert.notEqual(planned.save.hub.systems[key], before.hub.systems[key], `${kind} doit modifier ${key}`);
    }
    assert.notDeepEqual(planned.save.galaxy.resources, before.galaxy.resources);
    assert.ok(planned.save.crew.some((member, index) => member.stress > before.crew[index].stress));
    assert.ok(Object.values(planned.save.hub.moduleIntegrity).some((integrity) => integrity < 100));
    assert.deepEqual(save, before, 'le plan de résolution reste pur');
  }
});

test('player-down fonctionne même si le runtime a déjà effacé activeCrisis', () => {
  const save = prepareCausalCrisis('pathogen', 3);
  Object.assign(save.hub.systems, { hull: 70, power: 70, oxygen: 70, security: 70, quarantine: 70, morale: 70 });
  Object.assign(save.galaxy.resources, { credits: 1200, alloy: 120, fuel: 80, medical: 30, research: 30, pathogen: 0 });
  save.hub.moduleIntegrity = Object.fromEntries(save.hub.moduleIds.map((id) => [id, 100]));
  const crisis = createHubCrisis(save);
  save.hub.activeCrisis = null;
  const beforeStress = save.crew.map((member) => member.stress);
  const result = resolveHubCrisisEvent(save, {
    action: 'crisis:player-down',
    crisisId: crisis.id,
    kind: crisis.kind,
    count: crisis.count,
    deck: crisis.deck,
    roomId: crisis.roomId
  });
  assert.equal(result.handled, true);
  assert.equal(save.hub.activeCrisis.id, crisis.id);
  assert.equal(save.hub.activeCrisis.resolved, true);
  assert.ok(save.crew.some((member) => member.injuries.some((injury) => injury.type === 'pathogen-hub-trauma')));
  assert.ok(save.crew.some((member, index) => member.stress > beforeStress[index]));
  assert.ok(save.player.health < 100);
  assert.ok(Object.values(save.hub.moduleIntegrity).some((integrity) => integrity < 100));
  for (const key of ['hull', 'security', 'quarantine', 'oxygen', 'morale']) assert.ok(save.hub.systems[key] < 70);

  const duplicate = resolveHubCrisisEvent(save, { action: 'crisis:player-down', crisisId: crisis.id, kind: crisis.kind });
  assert.equal(duplicate.handled, false);
  assert.equal(duplicate.reason, 'already-resolved');
});

test('la simulation galactique avance les quatre états, crée alertes, routes et crise sans muter la source', () => {
  const save = prepareCausalCrisis('xenomorph', 1);
  save.clock = { day: 7, hour: 3 };
  const threatenedId = save.galaxy.unlockedWorldIds[0];
  Object.assign(save.galaxy.worldState[threatenedId], {
    infestation: 91,
    stability: 14,
    quarantine: 4,
    population: 12000
  });
  save.hub.systems.quarantine = 22;
  const before = structuredClone(save);
  const result = simulateGalaxy(save, { hours: 12 });
  const afterThreat = result.save.galaxy.worldState[threatenedId];
  assert.deepEqual(save, before);
  assert.deepEqual(result.clock, { day: 7, hour: 15 });
  assert.notEqual(afterThreat.infestation, before.galaxy.worldState[threatenedId].infestation);
  assert.notEqual(afterThreat.stability, before.galaxy.worldState[threatenedId].stability);
  assert.notEqual(afterThreat.quarantine, before.galaxy.worldState[threatenedId].quarantine);
  assert.ok(afterThreat.population < before.galaxy.worldState[threatenedId].population);
  assert.ok(result.alerts.some((alert) => alert.worldId === threatenedId && alert.severity === 'critical'));
  assert.ok(result.unlocks.length >= 2);
  assert.equal(result.crisis.kind, 'xenomorph');
  assert.deepEqual(result.save.hub.activeCrisis, result.crisis);
});

test('advanceGalaxy persiste mondes, alertes, déblocages et crise après sérialisation', () => {
  const save = prepareCausalCrisis('synthetic', 2);
  save.clock = { day: 10, hour: 0 };
  const initialUnlocked = save.galaxy.unlockedWorldIds.length;
  const pressureBefore = getHubCrisisPressure(save);
  const result = advanceGalaxy(save, { hours: 6 });
  assert.equal(result.save, save);
  assert.ok(save.galaxy.unlockedWorldIds.length > initialUnlocked);
  assert.ok(save.galaxy.alerts.length > 0);
  assert.equal(save.hub.activeCrisis.kind, 'synthetic');
  assert.notEqual(getHubCrisisPressure(save).absoluteHours, pressureBefore.absoluteHours);

  const persisted = migrateSave(JSON.parse(JSON.stringify(save)), save.profile);
  assert.deepEqual(persisted.hub.activeCrisis, save.hub.activeCrisis);
  assert.deepEqual(persisted.galaxy.unlockedWorldIds, save.galaxy.unlockedWorldIds);
  assert.deepEqual(persisted.galaxy.alerts, save.galaxy.alerts);
  assert.deepEqual(persisted.galaxy.worldState[WORLDS[0].id], save.galaxy.worldState[WORLDS[0].id]);
});
