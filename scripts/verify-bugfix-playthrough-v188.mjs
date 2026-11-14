// Regression tests for the full-playthrough bug hunt (2026-11-14): generic and
// special missions played to extraction, debrief, hub and reload.
// Scope excludes the deferred Forge.
import test from 'node:test';
import assert from 'node:assert/strict';
import { host, prepare } from './engine-host-v188.mjs';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';

const campaign = id => CAMPAIGNS.find(entry => entry.id === id);
const worldOf = entry => WORLDS.find(world => world.id === entry.worldId) || WORLDS[0];

// Starts the production engine like the app's generic launch (startMissionRuntimeV62).
async function launch(entry, { options = {} } = {}) {
  const browser = host(), events = [], world = worldOf(entry);
  const missionLevel = buildMissionLevelV52({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant: 0 });
  const engine = new GameEngine(browser.canvas, { onEvent: event => events.push(event) });
  engine.start({ userCasteCampaignV88: true, world, campaign: entry, weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [],
    seed: missionLevel.levelSeed.seed, levelSeed: missionLevel.levelSeed, missionLevel, ...options });
  await prepare(engine);
  engine.enemies = []; engine.squadActors = []; engine.hazards = [];
  return { ...browser, engine, events, missionLevel };
}
// Declared injection: the marine is placed next to a target (teleport), then acts with E (interact()).
const placeNear = (engine, target, dx = -20) => {
  const p = engine.player; p.x = target.x + (target.w || 0) / 2 - p.w / 2 + dx; p.y = target.y + (target.h || 0) - p.h; p.vx = 0; p.vy = 0;
};

test('navigate the vent network: after the marine maps a vent with E, E at the extraction completes the mission (no softlock)', async () => {
  const { engine, events } = await launch(campaign('pair-030-mire'));
  assert.equal(engine.objectiveRuntime.action, 'navigate');
  assert.ok(engine.missionVentNetworkV62, 'a V62 vent network carries the route');
  // The marine opens a vent through the production E path (enterMissionVentV62).
  engine.inventory.cutter = true;
  const entrance = engine.vents.find(vent => vent.portalId && engine.missionVentNetworkV62.entrances.some(e => e.id === vent.portalId));
  placeNear(engine, entrance, 0);
  assert.equal(engine.interact(engine.player), true, 'E enters the vent');
  assert.ok(engine.vents.some(vent => vent.open), 'the vent is mapped');
  // Leave the network (declared: the transit is cleared like a finished crawl).
  engine.player.ventTransit = null; engine.missionVentActorsV62?.clear?.();
  assert.equal(engine.missingExtractionRequirement(), '', 'the extraction prompt reads ready');
  placeNear(engine, engine.objective);
  assert.match(engine.getInteractionPrompt(engine.player), /CONFIRMER L’EXTRACTION/);
  engine.interact(engine.player);
  assert.equal(engine.mission.state, 'complete', `E must extract, not refuse: ${JSON.stringify(events.filter(e => e.type === 'locked').map(e => e.requirement))}`);
  assert.ok(events.some(event => event.type === 'mission-complete'));
});
