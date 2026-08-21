import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { createDefaultSave } from '../src/save.js';
import { OBJECTIVE_EFFECTS, applyCampaignConsequence, buildCampaignConsequence } from '../src/campaign-consequences.js';

test('les 436 campagnes compilent une conséquence mécanique propre à leur objectif et leur continuité', () => {
  assert.equal(Object.keys(OBJECTIVE_EFFECTS).length, 16);
  for (const campaign of CAMPAIGNS) {
    const world = WORLDS.find((entry) => entry.id === campaign.worldId);
    const contract = buildCampaignConsequence(campaign, world, { success: true, completedCampaignIds: [] });
    assert.equal(contract.campaignId, campaign.id);
    assert.equal(contract.worldId, campaign.worldId);
    assert.ok(contract.action);
    assert.ok(Object.keys(contract.worldDelta).length + Object.keys(contract.hubDelta).length + Object.keys(contract.resourceDelta).length > 0);
    if (campaign.pairId) assert.ok(contract.pairedCampaignId);
  }
});

test('une archive MIRE réussie débloque sa conséquence Frontier et le bonus est ensuite appliqué', () => {
  const mire = CAMPAIGNS.find((entry) => entry.mode === 'MIRE' && entry.pairId);
  const frontier = CAMPAIGNS.find((entry) => entry.mode === 'FRONTIER' && entry.pairId === mire.pairId);
  const mireWorld = WORLDS.find((entry) => entry.id === mire.worldId);
  const frontierWorld = WORLDS.find((entry) => entry.id === frontier.worldId);
  const save = createDefaultSave(1);
  const mireApplied = applyCampaignConsequence(save, mire, mireWorld, { success: true });
  assert.equal(mireApplied.consequence.unlockCampaignId, frontier.id);
  assert.ok(save.galaxy.unlockedWorldIds.includes(frontier.worldId));
  save.galaxy.completedCampaignIds.push(mire.id);
  const before = structuredClone(save.galaxy.worldState[frontier.worldId]);
  const frontierApplied = applyCampaignConsequence(save, frontier, frontierWorld, { success: true });
  assert.equal(frontierApplied.consequence.mireArchiveRecovered, true);
  assert.ok(save.galaxy.worldState[frontier.worldId].stability > before.stability);
  assert.ok(save.galaxy.worldState[frontier.worldId].infestation < before.infestation);
  assert.equal(save.galaxy.alerts[0].pairId, mire.pairId);
});

test('une défaite applique des retombées opposées et persistantes', () => {
  const campaign = CAMPAIGNS.find((entry) => entry.objective === 'defend the colony');
  const world = WORLDS.find((entry) => entry.id === campaign.worldId);
  const save = createDefaultSave(2);
  const before = structuredClone(save.galaxy.worldState[world.id]);
  const applied = applyCampaignConsequence(save, campaign, world, { success: false });
  assert.equal(applied.consequence.success, false);
  assert.ok(save.galaxy.worldState[world.id].stability < before.stability);
  assert.ok(save.galaxy.worldState[world.id].infestation > before.infestation);
  assert.equal(save.galaxy.alerts[0].severity, 'critical');
});
