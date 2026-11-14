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
async function launch(entry, { options = {}, keepHazards = false } = {}) {
  const browser = host(), events = [], world = worldOf(entry);
  const missionLevel = buildMissionLevelV52({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant: 0 });
  const engine = new GameEngine(browser.canvas, { onEvent: event => events.push(event) });
  engine.start({ userCasteCampaignV88: true, world, campaign: entry, weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [],
    seed: missionLevel.levelSeed.seed, levelSeed: missionLevel.levelSeed, missionLevel, ...options });
  await prepare(engine);
  engine.enemies = []; engine.squadActors = []; if (!keepHazards) engine.hazards = [];
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

test('extraction debrief: the overlay names what the hub paid, not the native mission tally (FR and EN)', async () => {
  const { paidRewardsV188, paidRewardsLineV188 } = await import('../src/mission-debrief-v188.js');
  const paid = paidRewardsV188({ credits: 10000, alloy: 1000, research: 200, pathogen: 0, fuel: 64 },
    { credits: 11240, alloy: 1008, research: 208, pathogen: 1, fuel: 59 });
  assert.deepEqual(paid, { credits: 1240, alloy: 8, research: 8, pathogen: 1 });
  const { engine, text } = await launch(campaign('signature-01'));
  engine.mission.state = 'complete';
  engine.mission.rewards = { credits: 684, salvage: 22, intel: 0 };
  engine.mission.paidRewardsV188 = paid;
  text.length = 0; engine.draw();
  assert.ok(text.includes('Versé au Tantalus : +1240 CR, +8 alliage, +8 R&D, +1 pathogène'), `overlay: ${text.filter(t => /CR/.test(t))}`);
  assert.ok(!text.some(t => /^684 CR/.test(t)), 'the unpaid native tally is not presented as the reward');
  assert.equal(paidRewardsLineV188(paid, 'en'), 'Paid to the Tantalus: +1240 CR, +8 alloy, +8 R&D, +1 pathogen');
});

test('operation results read in proper French and translate to English (debrief, retreat, failure, journal)', async () => {
  const { createDefaultSave, resolveOperation } = await import('../src/save.js');
  const save = createDefaultSave();
  const worldId = save.galaxy.unlockedWorldIds[0];
  const op = id => ({ id: `operation-9-${id}`, campaignId: id, worldId, risk: 20, crewIds: [], reward: { credits: 500, research: 4, alloy: 4 } });
  save.strategy.currentOperation = op('pair-001-frontier');
  const win = resolveOperation(save, { success: true, kills: 0 });
  assert.match(win.result, /^Objectif accompli : stabilité \+8, infestation -\d+, récompenses transférées\.$/);
  save.strategy.currentOperation = op('pair-001-frontier');
  const retreat = resolveOperation(save, { success: false, reason: 'retreat' });
  assert.equal(retreat.result, 'Retraite : stabilité -2, infestation +2.');
  save.strategy.currentOperation = op('pair-001-frontier');
  assert.equal(resolveOperation(save, { success: false, reason: 'failure' }).result, 'Échec : stabilité -6, infestation +7 et un opérateur blessé.');
  const { setLanguageV185 } = await import('../src/i18n-v185.js');
  const { autoTranslateV185, useCatalogV185 } = await import('../src/i18n-auto-v185.js');
  useCatalogV185(await import('../src/i18n-en-catalog-v185.js'));
  setLanguageV185('en', { storage: null, document: null, persist: false });
  try {
    assert.equal(autoTranslateV185(`${win.result} Versé au Tantalus : +1240 CR, +8 alliage, +8 R&D, +1 pathogène`),
      'Objective complete: stability +8, infestation -7, rewards transferred. Paid to the Tantalus: +1240 CR, +8 alloy, +8 R&D, +1 pathogen');
    assert.equal(autoTranslateV185(retreat.result), 'Retreat: stability -2, infestation +2.');
    // Results stored by earlier saves keep translating.
    assert.equal(autoTranslateV185('Objectif accompli : stabilite +8, infestation -7, recompenses transferees.'), 'Objective complete: stability +8, infestation -7, rewards transferred.');
    assert.equal(autoTranslateV185('Deploiement lance vers Sevastopol.'), 'Deployment launched to Sevastopol.');
    assert.equal(autoTranslateV185('Échec : stabilité -6, infestation +7 et un opérateur blessé.'), 'Failure: stability -6, infestation +7 and one operator wounded.');
  } finally { setLanguageV185('fr', { storage: null, document: null, persist: false }); }
});

test('survival systems: closing the CCTV from the panel hands the keyboard back to the game (E, movement)', async () => {
  const { AlienSurvivalDockV70 } = await import('../src/alien-survival-ui-v70.js');
  const { engine, canvas } = await launch(campaign('special-alien-survival-systems'));
  const station = type => engine.alienSurvivalStationsV70.find(candidate => candidate.type === type);
  placeNear(engine, station('power'), 0); engine.interact(engine.player);
  assert.equal(engine.alienSurvivalV70.power.routes.cctv, true, 'E at the breaker routes the CCTV');
  placeNear(engine, station('cctv'), 0); engine.interact(engine.player);
  assert.equal(engine.alienSurvivalV70.cctv.active, true, 'E opens the CCTV');
  // The panel button keeps the focus after a mouse click; the dock must give it back.
  let focused = null;
  canvas.focus = () => { focused = 'canvas'; };
  const dock = Object.create(AlienSurvivalDockV70.prototype);
  Object.assign(dock, { engine, root: { querySelector: () => null }, document: globalThis.document, announce() {}, refresh() {} });
  assert.equal(dock.activate('cctv-close'), true);
  assert.equal(engine.alienSurvivalV70.cctv.active, false);
  assert.equal(focused, 'canvas', 'closing the CCTV returns focus to the game canvas');
});

test('survival systems: the ship decompression event cannot re-open the cargo vacuum the pressure model replaced (weld stays possible)', async () => {
  const { engine, events } = await launch(campaign('special-alien-survival-systems'), { keepHazards: true });
  const vacuum = engine.hazards.find(hazard => hazard.kind === 'vacuum' && hazard.zoneId === 'ship-cargo');
  assert.ok(vacuum && vacuum.active === false, 'survival configures the cargo without the level vacuum');
  // The template's zone events (entering the cargo) try to activate it.
  for (const event of engine.missionLevelEvents.values()) if (event.actions?.some(action => action.endsWith(`:${vacuum.id}`))) engine.triggerMissionLevelEvent(event.id, 'qa');
  engine.applyMissionLevelAction(`activate:${vacuum.id}`, {});
  assert.equal(vacuum.active, false, 'the level event leaves the survival cargo pressurised');
  // Weld the cargo bulkhead with E: the work completes (no damage interruption).
  engine.inventory.cutter = true; engine.alienSurvivalWeldingKitV70.taken = true;
  engine.alienSurvivalV70.cctv.scanComplete = true; engine.alienSurvivalV70.power.routes = { 'life-support': true, security: true, cctv: false };
  const door = engine.doors.find(candidate => candidate.id === 'cargo-bulkhead');
  placeNear(engine, door, -70);
  assert.match(engine.getInteractionPrompt(engine.player), /SOUDER LA CLOISON CARGO/);
  engine.interact(engine.player);
  for (let n = 0; n < 150 && engine.alienSurvivalWorldActionV70; n++) engine.update(1 / 60);
  assert.ok(!events.some(event => event.type === 'alien-survival-weld-cancelled'), JSON.stringify(events.filter(event => event.type === 'alien-survival-weld-cancelled')));
  assert.equal(engine.alienSurvivalV70.doors.find(entry => entry.id === 'cargo-bulkhead').welded, true);
});

test('command journal titles an operation result with the campaign name, not its id', async () => {
  const { strategyLogTitleV188 } = await import('../src/mission-debrief-v188.js');
  assert.equal(strategyLogTitleV188({ title: 'signature-01' }, CAMPAIGNS), campaign('signature-01').name);
  assert.equal(strategyLogTitleV188({ title: 'Tantalus: Sevastopol' }, CAMPAIGNS), 'Tantalus: Sevastopol');
  const app = (await import('node:fs')).readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /strategyLogTitleV188\(entry, CAMPAIGNS\)/, 'the journal renders through the helper');
  assert.match(app, /engine\.mission\.paidRewardsV188 = clone\(outcome\.paidV188\)/, 'the app hands the paid amounts to the extraction screen');
});
