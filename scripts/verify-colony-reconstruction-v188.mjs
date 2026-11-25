import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { COLONY_SITES_V188, COLONY_SITE_IDS_V188, COLONY_LEVEL_COSTS_V188, COLONY_WORLD_ID_V188, investColonySiteV188,
  applyColonyOperationResultV188, colonySnapshotV188, colonyTierV188, colonyActiveLimitV188, normalizeColonyV188 } from '../src/colony-reconstruction-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
function openSave() {
  const save = createDefaultSave(); save.galaxy.completedCampaignIds.push('special-archive-relay');
  Object.assign(save.galaxy.resources, { credits: 100000, alloy: 10000, research: 1000 }); return save;
}

test('seven bible sites, three levels each, bilingual; additive save field', () => {
  assert.deepEqual(COLONY_SITE_IDS_V188, ['atmosphere', 'infirmary', 'walls', 'power', 'comms', 'docks', 'habitat']);
  for (const entry of COLONY_SITES_V188) { assert.equal(entry.levels.length, 3); for (const level of entry.levels) assert.ok(level.fr && level.en); }
  assert.deepEqual(createDefaultSave().colonyV188.sites.walls, { invested: 0, validated: 0 });
  assert.deepEqual(migrateSave({ schema: 52 }).colonyV188, createDefaultSave().colonyV188);
  assert.deepEqual(normalizeColonyV188({ sites: { walls: { invested: 9, validated: 7 } } }).sites.walls, { invested: 3, validated: 3 });
  assert.equal(COLONY_WORLD_ID_V188, 'world-05-lethe');
});

test('investing costs resources and time, never during a mission, and respects the population limit', () => {
  const locked = createDefaultSave(); assert.equal(investColonySiteV188(locked, 'walls').reason, 'locked');
  const save = openSave(), before = { ...save.galaxy.resources }, hour = (save.clock.day - 1) * 24 + save.clock.hour;
  assert.equal(colonyActiveLimitV188(save), 1, 'nobody brought back yet');
  assert.deepEqual(investColonySiteV188(save, 'walls'), { ok: true, siteId: 'walls', level: 1 });
  assert.equal(save.galaxy.resources.credits, before.credits - COLONY_LEVEL_COSTS_V188[0].cost.credits);
  assert.equal((save.clock.day - 1) * 24 + save.clock.hour, hour + COLONY_LEVEL_COSTS_V188[0].hours);
  assert.equal(investColonySiteV188(save, 'walls').reason, 'awaiting-validation');
  assert.equal(investColonySiteV188(save, 'power').reason, 'population-limit');
  save.storyCampaignV188.m577Manifest = { containers: 0, colonists: 6, resolved: true };
  assert.equal(colonyActiveLimitV188(save), 4); assert.equal(investColonySiteV188(save, 'power').ok, true);
  save.strategy.currentOperation = { id: 'op' }; assert.equal(investColonySiteV188(save, 'comms').reason, 'operation-active');
  const poor = openSave(); poor.galaxy.resources.alloy = 1; assert.equal(investColonySiteV188(poor, 'walls').reason, 'resources');
});

test('a success on Cocyte validates the oldest pending level (+3 stability); a failure damages but keeps the investment', () => {
  const save = openSave(); investColonySiteV188(save, 'walls');
  assert.equal(applyColonyOperationResultV188(save, { success: true, worldId: 'world-01' }), null, 'only operations on Cocyte count');
  const stability = save.galaxy.worldState[COLONY_WORLD_ID_V188].stability;
  assert.deepEqual(applyColonyOperationResultV188(save, { success: true, worldId: COLONY_WORLD_ID_V188 }), { validated: 'walls', level: 1, stipend: null });
  assert.equal(save.galaxy.worldState[COLONY_WORLD_ID_V188].stability, Math.min(100, stability + 3));
  assert.deepEqual(applyColonyOperationResultV188(save, { success: false, worldId: COLONY_WORLD_ID_V188 }), { damaged: 'walls', level: 0 });
  assert.deepEqual(save.colonyV188.sites.walls, { invested: 1, validated: 0 }, 'investment kept');
});

test('tiers: Rétablie with 3 sites at level 1, Autonome with 5 at level 2 and its regular resources', () => {
  const sites = level => Object.fromEntries(COLONY_SITE_IDS_V188.map((id, index) => [id, { invested: index < 5 ? level : 0, validated: index < 5 ? level : 0 }]));
  assert.equal(colonyTierV188({ sites: {} }), 'survival');
  assert.equal(colonyTierV188({ sites: sites(1) }), 'restored');
  assert.equal(colonyTierV188({ sites: sites(2) }), 'autonomous');
  const save = openSave(); save.colonyV188 = { schema: 188, sites: sites(2) }; const credits = save.galaxy.resources.credits;
  assert.deepEqual(applyColonyOperationResultV188(save, { success: true, worldId: COLONY_WORLD_ID_V188 }).stipend, { credits: 150, alloy: 10 });
  assert.equal(save.galaxy.resources.credits, credits + 150);
  const snapshot = colonySnapshotV188(save, 'en'); assert.equal(snapshot.tier, 'autonomous'); assert.equal(snapshot.sites[0].current, 'Pressurised greenhouses');
});

test('the command view and the operation result use the reconstruction', () => {
  assert.match(read('index.html'), /id="colony-reconstruction-v188"/);
  const app = read('src/app.js');
  assert.match(app, /applyColonyOperationResultV188\(candidate, \{ success: resolvedSuccess, worldId: operation\.worldId \|\| campaign\?\.worldId \}\)/);
  assert.match(app, /investColonySiteV188\(candidate, entry\.id\)/);
});
