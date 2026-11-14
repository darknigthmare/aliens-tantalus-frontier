// Regression tests for the generic campaigns and mission modes bug hunt (2026-11-14).
// Scope: every mission kind except QZ-17 / QZ-18 and the deferred Forge.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { host, prepare, tick } from './engine-host-v188.mjs';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, CAMPAIGNS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const campaign = id => CAMPAIGNS.find(entry => entry.id === id);
const worldOf = entry => WORLDS.find(world => world.id === entry.worldId) || WORLDS[0];

// Starts the production engine like the app's generic launch (startMissionRuntimeV62).
// `settle: false` leaves the bitmaps in flight, as a browser does on the first frame.
async function launch(entry, { settle = true, options = {}, builder = buildMissionLevelV52 } = {}) {
  const browser = host(), events = [], world = worldOf(entry);
  const missionLevel = builder({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant: 0 });
  const engine = new GameEngine(browser.canvas, { onEvent: event => events.push(event) });
  engine.start({ userCasteCampaignV88: true, world, campaign: entry, weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [],
    seed: missionLevel.levelSeed.seed, levelSeed: missionLevel.levelSeed, missionLevel, ...options });
  if (settle) await prepare(engine);
  return { ...browser, engine, events, missionLevel };
}
const settleMicrotasks = async () => { for (let n = 0; n < 16; n++) await Promise.resolve(); };

test('generic campaign: the creature loading pause lifts once the bitmaps arrive (no permanent "simulation suspendue")', async () => {
  const { engine } = await launch(campaign('pair-001-frontier'), { settle: false });
  assert.ok(engine.userCasteCampaignV88.entries.length > 0, 'the frontier campaign places contextual castes');
  // Declared injection: in a browser start() sees the caste PNG still in flight and raises
  // the gate (the Node host decodes synchronously, so the flag is set as the browser sets it).
  engine.userCasteLoadingV88 = true;
  await settleMicrotasks();
  await Promise.all((engine.getVisibleEnemyAtlasSheetsV65?.() || []).map(sheet => engine.ensureEnemyAtlas(sheet)));
  await settleMicrotasks();
  assert.equal(engine.refreshUserCasteLoadingV88(), false, 'the bitmaps are ready'); engine.userCasteLoadingV88 = true;
  for (let frame = 0; frame < 30; frame++) engine.loop(1032 + frame * 16);
  assert.equal(engine.userCasteLoadingV88, false, 'the loop clears the loading gate');
  const x = engine.player.x; engine.keys.add('KeyD');
  for (let frame = 0; frame < 30; frame++) engine.loop(1600 + frame * 16);
  engine.keys.delete('KeyD');
  assert.ok(engine.player.x > x + 20, 'the marine walks: the simulation runs');
});
