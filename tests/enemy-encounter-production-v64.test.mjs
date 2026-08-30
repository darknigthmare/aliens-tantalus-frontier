import assert from 'node:assert/strict';
import test from 'node:test';

import { GameEngine } from '../src/game-production-runtime.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import {
  CAMPAIGNS,
  CREW,
  ENEMIES,
  ENEMY_HYBRIDS_V64,
  EQUIPMENT,
  LEVEL_SEEDS,
  VEHICLES,
  WEAPONS,
  WORLDS
} from '../src/content.js';

class MockImage {
  constructor() {
    this.complete = true;
    this.naturalWidth = 1600;
    this.naturalHeight = 900;
  }

  set src(value) { this.currentSrc = value; }
}

function withBrowserMocks(run) {
  const previous = {
    Image: globalThis.Image,
    addEventListener: globalThis.addEventListener,
    requestAnimationFrame: globalThis.requestAnimationFrame
  };
  globalThis.Image = MockImage;
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  try { return run(); } finally {
    globalThis.Image = previous.Image;
    globalThis.addEventListener = previous.addEventListener;
    globalThis.requestAnimationFrame = previous.requestAnimationFrame;
  }
}

function startProduction(world, id, options = {}) {
  const sourceCampaign = options.campaign || CAMPAIGNS.find((campaign) => campaign.worldId === world.id) || CAMPAIGNS[0];
  const campaign = {
    ...sourceCampaign,
    id,
    mode: options.mode ?? 'FRONTIER',
    worldId: world.id,
    objective: options.objective || 'secure the declared encounter zone'
  };
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS, variant: 2 });
  const canvas = { width: 1280, height: 720, getContext: () => ({}), addEventListener: () => {} };
  const engine = new GameEngine(canvas, { onEvent: () => {} });
  engine.start({
    seed: missionLevel.levelSeed.seed,
    campaign: missionLevel.campaign,
    world: missionLevel.world,
    levelSeed: missionLevel.levelSeed,
    missionLevel,
    weapon: WEAPONS[0],
    enemyCatalog: ENEMIES,
    vehicle: VEHICLES.find((entry) => entry.family === 'ground') || VEHICLES[0],
    equipment: EQUIPMENT.slice(0, 8),
    crew: CREW,
    difficulty: 'standard'
  });
  return engine;
}

test('la chaîne production matérialise une fois chaque defaultEncounter V64 dans son monde déclaré', () => withBrowserMocks(() => {
  const hybridNames = new Set(ENEMY_HYBRIDS_V64.map((enemy) => enemy.name));
  for (const source of ENEMY_HYBRIDS_V64) {
    const world = WORLDS.find((candidate) => source.encounterWorldIds.includes(candidate.id));
    assert.ok(world, `${source.name}: monde déclaré présent`);
    const engine = startProduction(world, `v64-production-${source.id}`);
    try {
      assert.ok(engine.missionLevelRuntime, `${source.name}: level runtime production actif`);
      assert.equal(engine.encounterSelection.selectedIds.filter((id) => id === source.id).length, 1, `${source.name}: sélectionné une fois`);
      const contextualHybrids = engine.enemies.filter((enemy) => hybridNames.has(enemy.name));
      assert.deepEqual(contextualHybrids.map((enemy) => enemy.name), [source.name], `${source.name}: seul hybride V64 contextuel`);
      assert.equal(contextualHybrids[0].isBoss, Boolean(source.defaultEncounter.boss), `${source.name}: contrat boss conservé`);
    } finally {
      engine.stop();
    }
  }
}));

test('toutes les campagnes production, MIRE incluse, excluent les defaultEncounter V64 étrangers', () => withBrowserMocks(() => {
  const worldsById = new Map(WORLDS.map((world) => [world.id, world]));
  let mireCampaigns = 0;
  for (const campaign of CAMPAIGNS) {
    const world = worldsById.get(campaign.worldId);
    assert.ok(world, `${campaign.id}: monde de campagne présent`);
    if (campaign.mode === 'MIRE') mireCampaigns += 1;
    const engine = startProduction(world, campaign.id, {
      campaign,
      mode: campaign.mode,
      objective: campaign.objective
    });
    try {
      for (const source of ENEMY_HYBRIDS_V64.filter((enemy) => !enemy.encounterWorldIds.includes(world.id))) {
        assert.equal(engine.encounterSelection.selectedIds.includes(source.id), false, `${campaign.id}: ${source.name} absent de la sélection`);
        assert.equal(engine.enemies.some((enemy) => enemy.name === source.name), false, `${campaign.id}: ${source.name} absent du niveau`);
      }
    } finally {
      engine.stop();
    }
  }
  assert.ok(mireCampaigns > 0, 'les campagnes MIRE sont couvertes');
}));
