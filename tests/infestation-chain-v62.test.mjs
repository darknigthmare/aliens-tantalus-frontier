import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultSave } from '../src/save.js';
import {
  INFESTATION_ACTIONS_V62,
  addInfestationEvidenceV62,
  advanceInfestationChainV62,
  applyInfestationActionV62,
  createInfestationExposureV62,
  deriveCausalHubCrisisV62,
  getInfestationHudStateV62,
  planInfestationAdvanceV62
} from '../src/infestation-chain-v62.js';

test('aucune crise du Tantalus ne peut exister sans événement causal antérieur', () => {
  const save = createDefaultSave(1);
  save.clock = { day: 40, hour: 12 };
  Object.assign(save.hub.systems, { quarantine: 0, security: 0, research: 0 });
  assert.equal(deriveCausalHubCrisisV62(save), null);
  const plan = planInfestationAdvanceV62(save, { atHours: 1000 });
  assert.equal(plan.crisis, null);
  assert.equal(save.hub.infestationChain, null);
});

test('une exposition persistante progresse par étapes jusqu à une rupture physique déterministe', () => {
  const save = createDefaultSave(2);
  save.clock = { day: 1, hour: 6 };
  Object.assign(save.hub.systems, { quarantine: 0, security: 0, research: 80 });
  const exposure = createInfestationExposureV62(save, {
    id: 'operation-live-capture-01',
    type: 'live-specimen',
    campaignId: 'campaign-01',
    worldId: 'world-01',
    severity: 96,
    estimatedThreats: 3,
    label: 'Transfert du spécimen vivant'
  });
  assert.equal(exposure.stage, 'exposure');
  assert.equal(exposure.entry.roomId, 'quarantine');

  save.clock = { day: 2, hour: 0 };
  const warning = advanceInfestationChainV62(save);
  assert.equal(warning.chain.stage, 'containment');
  save.clock = { day: 2, hour: 8 };
  const result = advanceInfestationChainV62(save);
  assert.equal(result.chain.stage, 'infestation');
  assert.deepEqual(result.chain.history.map((event) => event.stage), ['exposure', 'anomaly', 'clues', 'confirmation', 'containment', 'infestation']);
  assert.deepEqual(result.crisis, deriveCausalHubCrisisV62(save));
  assert.equal(result.crisis.roomId, 'quarantine');
  assert.equal(result.crisis.deck, 2);
});

test('quarantaine sécurité et capteurs peuvent contenir la chaîne avant infestation', () => {
  const save = createDefaultSave(1);
  Object.assign(save.hub.systems, { quarantine: 96, security: 92, research: 90 });
  createInfestationExposureV62(save, { id: 'cargo-17', type: 'cargo-return', severity: 54, estimatedThreats: 2 });
  save.clock = { day: 2, hour: 0 };
  advanceInfestationChainV62(save);
  addInfestationEvidenceV62(save, { id: 'manual-biological', type: 'biological', confidence: 40 });
  const first = applyInfestationActionV62(save, INFESTATION_ACTIONS_V62.scan);
  assert.equal(first.applied, true);
  applyInfestationActionV62(save, INFESTATION_ACTIONS_V62.quarantine);
  applyInfestationActionV62(save, INFESTATION_ACTIONS_V62.seal);
  const final = advanceInfestationChainV62(save);
  assert.equal(final.chain.resolved, true);
  assert.equal(final.chain.containment.resolved, true);
  assert.equal(deriveCausalHubCrisisV62(save), null);
});

test('le HUD ne révèle ni la source ni un nombre exact sans niveau de preuve suffisant', () => {
  const save = createDefaultSave(1);
  Object.assign(save.hub.systems, { quarantine: 0, security: 0, research: 25 });
  createInfestationExposureV62(save, { id: 'wreck-9', type: 'wreck-salvage', severity: 95, estimatedThreats: 4, label: 'Récupération d’épave' });
  let hud = getInfestationHudStateV62(save);
  assert.equal(hud.sourceKnown, false);
  assert.equal(hud.threatDisplay, 'inconnu');
  save.clock = { day: 2, hour: 0 };
  advanceInfestationChainV62(save);
  save.clock = { day: 2, hour: 8 };
  advanceInfestationChainV62(save);
  hud = getInfestationHudStateV62(save);
  assert.equal(hud.stage, 'infestation');
  assert.equal(hud.exactCountKnown, false);
  assert.equal(hud.threatDisplay, 'présence multiple probable');
});

test('un même événement causal est idempotent et survit à une sérialisation JSON', () => {
  const save = createDefaultSave(3);
  const event = { id: 'evac-77', type: 'survivor-evacuation', severity: 62, worldId: 'world-07' };
  const first = createInfestationExposureV62(save, event);
  const second = createInfestationExposureV62(save, event);
  assert.deepEqual(second, first);
  const persisted = JSON.parse(JSON.stringify(save));
  assert.deepEqual(persisted.hub.infestationChain, save.hub.infestationChain);
});
