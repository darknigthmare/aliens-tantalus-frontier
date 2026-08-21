import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPAIGNS, LEVEL_SEEDS, WORLDS } from '../src/content-core-v50.js';
import {
  HAZARD_KINDS_V52,
  MISSION_TEMPLATE_IDS_V52,
  buildMissionLevelV52,
  selectMissionLevelSeedV52,
  selectMissionTemplateV52,
  upgradeLevelSeedsV52,
  validateMissionTopologyV52
} from '../src/mission-levels-v52.js';

test('v52 upgrades the 800 legacy seeds across the complete hazard domain', () => {
  const upgraded = upgradeLevelSeedsV52(LEVEL_SEEDS);
  assert.equal(upgraded.length, 800);
  const distribution = new Map(HAZARD_KINDS_V52.map((kind) => [kind, 0]));
  for (const seed of upgraded) {
    assert.equal(seed.schemaVersion, 52);
    assert.ok(seed.sourceSeedId);
    assert.ok(seed.legacyHazards.includes('acid'));
    distribution.set(seed.hazards[0], distribution.get(seed.hazards[0]) + 1);
  }
  assert.deepEqual([...distribution.keys()].sort(), [...HAZARD_KINDS_V52].sort());
  assert.ok([...distribution.values()].every((count) => count >= 110));
});

test('v52 maps all 436 campaigns to a seed with the correct world and objective', () => {
  const upgraded = upgradeLevelSeedsV52(LEVEL_SEEDS);
  assert.equal(CAMPAIGNS.length, 436);
  for (const campaign of CAMPAIGNS) {
    const selected = selectMissionLevelSeedV52(campaign, upgraded);
    assert.equal(selected.worldId, campaign.worldId, campaign.id);
    assert.equal(selected.objective, campaign.objective, campaign.id);
    assert.ok(['exact-catalog-match', 'world-derived-objective'].includes(selected.mapping), campaign.id);
  }
});

test('the three v52 templates compile to connected and genuinely distinct topologies', () => {
  const world = WORLDS[0];
  const campaign = CAMPAIGNS[0];
  const plans = MISSION_TEMPLATE_IDS_V52.map((templateId) => buildMissionLevelV52({
    campaign,
    world,
    levelSeeds: LEVEL_SEEDS,
    templateId,
    variant: 2
  }));
  assert.equal(new Set(plans.map((plan) => plan.topologySignature)).size, 3);
  assert.equal(new Set(plans.map((plan) => plan.artLayers.far)).size, 3);
  for (const plan of plans) {
    assert.equal(plan.validation.valid, true, plan.validation.errors.join('; '));
    assert.equal(plan.validation.connectedNodes, plan.validation.totalNodes);
    assert.equal(plan.graph.routes.length, 3);
    assert.ok(plan.routeRuntime.platforms.length > plan.graph.nodes.length);
    assert.ok(plan.routeRuntime.ladders.length > 0);
    assert.ok(plan.routeRuntime.biomeZones.length >= 5);
    assert.ok(plan.events.length >= 4);
    assert.ok(plan.spawns.length >= 3);
    assert.ok(plan.graph.routes.every((route) => route.nodeIds[0] === plan.anchors.spawn.nodeId));
    assert.ok(plan.graph.routes.every((route) => route.nodeIds.at(-1) === plan.anchors.extraction.nodeId));
  }
});

test('template selection uses mission context instead of a campaign array index', () => {
  assert.equal(selectMissionTemplateV52({ campaign: { objective: 'board a drifting vessel' }, world: { biomes: ['orbital'] } }), 'ship-interior-vertical');
  assert.equal(selectMissionTemplateV52({ campaign: { objective: 'defend the colony' }, world: { biomes: ['colony'] } }), 'colony-multiroute');
  assert.equal(selectMissionTemplateV52({ campaign: { objective: 'track an apex specimen' }, world: { biomes: ['badlands'], atmosphere: 'storm' } }), 'planet-exterior');
});

test('compiled routes, biome zones, events and spawns expose resolvable runtime contracts', () => {
  const plan = buildMissionLevelV52({
    campaign: CAMPAIGNS.find((entry) => entry.objective === 'board a drifting vessel'),
    world: WORLDS[6],
    levelSeeds: LEVEL_SEEDS,
    templateId: 'ship-interior-vertical'
  });
  const zoneIds = new Set(plan.biomeZones.map((zone) => zone.id));
  const eventIds = new Set(plan.events.map((event) => event.id));
  assert.ok(plan.routeRuntime.routeNodes.every((entry) => zoneIds.has(entry.zoneId) && entry.routeIds.length >= 0));
  assert.ok(plan.hazards.every((entry) => zoneIds.has(entry.zoneId) && HAZARD_KINDS_V52.includes(entry.kind)));
  assert.ok(plan.spawns.every((entry) => zoneIds.has(entry.zoneId)));
  assert.ok(plan.spawns.filter((entry) => entry.triggerEventId).every((entry) => eventIds.has(entry.triggerEventId)));
  assert.ok(plan.biomeZones.every((entry) => entry.layers.far && entry.layers.mid && entry.layers.foreground));
});

test('validator rejects a disconnected template graph before integration', () => {
  const plan = buildMissionLevelV52({
    campaign: CAMPAIGNS[0],
    world: WORLDS[0],
    levelSeeds: LEVEL_SEEDS,
    templateId: 'planet-exterior'
  });
  const broken = structuredClone(plan);
  broken.graph.edges = broken.graph.edges.filter((edge) => !edge.from.includes('extraction') && !edge.to.includes('extraction'));
  const validation = validateMissionTopologyV52(broken);
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.some((entry) => entry.includes('unreachable') || entry.includes('disconnected') || entry.includes('broken segment')));
});
