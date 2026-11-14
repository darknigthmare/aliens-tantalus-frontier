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

test('damage and insertion captions never show internal ids or English keys; English reads them from the catalog', async () => {
  const { engine, events } = await launch(campaign('pair-001-mire'), { options: { accessibility: { subtitles: true } } });
  engine.enemies = []; engine.hazards = [];
  const captions = () => events.filter(event => event.type === 'caption').map(event => event.text);
  assert.ok(captions().includes('Insertion : Secourir les survivants'), `insertion caption: ${captions()}`);
  const p = engine.player;
  for (const source of ['vacuum', 'c12-horde-contact', 'ecosystem-contact-v131', 'cluster-acid', 'Armored Warrior:detonation', 'Armored Warrior']) {
    p.health = p.maxHealth; engine.captionDirectorV84 = null; engine.mission.elapsed += 10;
    engine.damagePlayer(p, 5, { source, bypassCover: true });
  }
  const impacts = captions().filter(text => text.startsWith('Impact'));
  assert.deepEqual(impacts, ['Impact : vide.', 'Impact : contact de la horde.', 'Impact : contact.', 'Impact : acide.',
    'Impact : Armored Warrior (détonation).', 'Impact : Armored Warrior.']);
  const { setLanguageV185 } = await import('../src/i18n-v185.js');
  const { autoTranslateV185, useCatalogV185 } = await import('../src/i18n-auto-v185.js');
  useCatalogV185(await import('../src/i18n-en-catalog-v185.js'));
  setLanguageV185('en', { storage: null, document: null, persist: false });
  try {
    assert.equal(autoTranslateV185('Impact : vide.'), 'Impact: vacuum.');
    assert.equal(autoTranslateV185('Impact : Armored Warrior.'), 'Impact: Armored Warrior.');
    assert.equal(autoTranslateV185('Insertion : Secourir les survivants'), 'Insertion: Rescue the survivors');
  } finally { setLanguageV185('fr', { storage: null, document: null, persist: false }); }
});

test('ecosystem operations: a marine at the right wall of the arena (by the extraction) resumes instead of restarting', async () => {
  const { buildEcosystemMissionV131 } = await import('../src/ecosystem-missions-v131.js');
  for (const id of ['special-queen-mother-v131', 'special-hive-world-v131', 'special-pangaea-v131']) {
    const entry = campaign(id), options = { userCasteCampaignV88: false };
    const { engine } = await launch(entry, { builder: buildEcosystemMissionV131, options });
    // Declared injection: teleport to the right wall, where the arena clamps the marine (5200 - width).
    const p = engine.player; p.x = engine.missionLevelBounds.width - p.w; p.vx = 0;
    const state = structuredClone(engine.captureResumeState());
    const resumed = (await launch(entry, { builder: buildEcosystemMissionV131, options: { ...options, resumeState: state } })).engine;
    assert.equal(resumed.lastResumeResult?.applied, true, `${id}: ${resumed.lastResumeResult?.reason}`);
    assert.equal(resumed.player.x, p.x);
  }
});
