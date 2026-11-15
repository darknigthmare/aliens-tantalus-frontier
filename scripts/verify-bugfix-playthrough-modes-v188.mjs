// Regression tests for the special-mode playthrough bug hunt (2026-11-15): APC
// convoy, C-12, mecha, ecosystem, legacy, cargo-brutal, black cocoon and
// Alpha/Bravo played in Chromium to extraction, debrief, hub, reload and the
// next launch. Scope excludes the deferred Forge.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createDefaultSave, migrateSave, beginOperation } from '../src/save.js';
import { advanceGalaxy } from '../src/world-crisis.js';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { rebindDeploymentOperationV188 } from '../src/mission-debrief-v188.js';

const campaign = id => CAMPAIGNS.find(entry => entry.id === id);
const worldOf = entry => WORLDS.find(world => world.id === entry.worldId) || WORLDS[0];
const appSource = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
const functionBody = (source, name) => {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} exists`);
  return source.slice(start, source.indexOf('\n}\n', start));
};

// P0 (Talos contre le Titan, and every V131 chapter): the extraction screen read
// « BILAN NON VALIDÉ · operation-terminal-identity-v131 » and nothing was paid.
// launchCampaign wrote the level seed and signature on the operation returned by
// beginOperation, but simulateElapsed → advanceGalaxy had rebuilt the save root,
// so that record was detached and the saved operation never carried them.
test('launch: the level signature is written on the live operation after deployment time elapses', () => {
  const save = migrateSave(createDefaultSave(1), 1);
  const entry = campaign('special-titan-v131');
  let deployment = beginOperation(save, entry, worldOf(entry));
  advanceGalaxy(save, { hours: 3, advanceClock: false });
  assert.notEqual(deployment.operation, save.strategy.currentOperation, 'the galaxy step detaches the returned record (cause)');
  deployment = rebindDeploymentOperationV188(deployment, save);
  Object.assign(deployment.operation, { levelSeedId: 'seed', missionLevelSignature: 'signature' });
  assert.equal(save.strategy.currentOperation.missionLevelSignature, 'signature');
  assert.equal(save.strategy.currentOperation.levelSeedId, 'seed');
  // A different operation is never adopted.
  const other = { operation: { id: 'operation-99-other' } };
  assert.equal(rebindDeploymentOperationV188(other, save), other);

  const body = functionBody(appSource, 'launchCampaign');
  const elapsed = body.indexOf('simulateElapsed(before)'), rebind = body.indexOf('rebindDeploymentOperationV188(deployment, saveSystem.data)');
  const assign = body.indexOf('Object.assign(deployment.operation');
  assert.ok(elapsed >= 0 && rebind > elapsed && assign > rebind, 'launchCampaign rebinds between the clock step and the signature write');
});

// P1 (Ruche-Monde, Reine-Mère, Pangaea): the HUD headline drew the internal phase
// id (« ORGANS », « NUCLEUS-1 ») in both languages, and in English the whole
// line stayed French because the joined text had no catalog entry.
test('ecosystem HUD: the headline names the phase and reads in English', async () => {
  const { host, prepare } = await import('./engine-host-v188.mjs');
  const { GameEngine } = await import('../src/game-production-runtime.js');
  const { ENEMIES, WEAPONS, LEVEL_SEEDS } = await import('../src/content.js');
  const { buildEcosystemMissionV131 } = await import('../src/ecosystem-missions-v131.js');
  const { setLanguageV185 } = await import('../src/i18n-v185.js');
  await (await import('../src/i18n-auto-v185.js')).loadCatalogV185();
  const entry = campaign('special-hive-world-v131'), world = worldOf(entry), browser = host();
  const missionLevel = buildEcosystemMissionV131({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant: 0 });
  const engine = new GameEngine(browser.canvas, { onEvent: () => {} });
  engine.start({ world, campaign: entry, weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [],
    seed: missionLevel.levelSeed.seed, levelSeed: missionLevel.levelSeed, missionLevel });
  await prepare(engine);
  const headline = () => { browser.text.length = 0; engine.drawHud(browser.ctx); return browser.text.find(line => line.startsWith('TR-0') && line.includes('%')); };
  try {
    setLanguageV185('fr', { document: null, storage: null, persist: false });
    assert.equal(engine.ecosystemV131.phase, 'organs');
    assert.match(headline(), /· ORGANES$/, 'French names the phase');
    engine.ecosystemV131.targets.fill(true); engine.syncEcosystemV131();
    assert.match(headline(), /· NOYAU · PHASE 1$/);
    setLanguageV185('en', { document: null, storage: null, persist: false });
    assert.equal(headline(), 'TR-0 · THE HIVE WORLD · PLANETARY ALERT 0% · NUCLEUS · PHASE 1');
  } finally { setLanguageV185('fr', { document: null, storage: null, persist: false }); }
});

// P1 (Doctrine Alpha / Bravo): ordered to their stations (N · FOCUS), both pairs
// stayed glued behind the marine at the insertion. The squad anti-stacking pass
// pushed each member away from the player on the side it already stood, so a
// pair spawned behind him could never pass, and the split tasks never started.
test('alpha-bravo: a pair ordered to its station walks past the marine standing at the insertion', async () => {
  const { host, prepare, tick } = await import('./engine-host-v188.mjs');
  const { GameEngine } = await import('../src/game-production-runtime.js');
  const { ENEMIES, WEAPONS, LEVEL_SEEDS, CREW } = await import('../src/content.js');
  const { buildMissionLevelV52 } = await import('../src/mission-levels-v52.js');
  const entry = campaign('special-alpha-bravo-doctrine'), world = worldOf(entry), browser = host();
  const missionLevel = buildMissionLevelV52({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant: 0 });
  const crew = CREW.slice(0, 4).map(member => ({ ...structuredClone(member), status: 'active', health: 100, fatigue: 0, stress: 0 }));
  const engine = new GameEngine(browser.canvas, { onEvent: () => {} });
  engine.start({ world, campaign: entry, weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew,
    seed: missionLevel.levelSeed.seed, levelSeed: missionLevel.levelSeed, missionLevel });
  await prepare(engine);
  engine.enemies = []; engine.hazards = [];
  const routed = engine.squadActors.filter(actor => actor !== engine.player && engine.alphaBravoTeamForActorV69(actor));
  assert.ok(routed.length >= 3, 'AI marines of both pairs deployed behind the marine');
  assert.ok(routed.every(actor => actor.x < engine.player.x), 'they start behind him');
  const playerX = engine.player.x;
  for (const team of ['alpha', 'bravo']) { engine.selectAlphaBravoFireteamV69(team); assert.equal(engine.issueAlphaBravoOrderV69('focus'), true); }
  tick(engine, 6);
  assert.ok(Math.abs(engine.player.x - playerX) < 1, 'the marine did not move (declared: no input)');
  for (const member of routed) assert.ok(member.x > playerX + 150, `${engine.alphaBravoTeamForActorV69(member)} member walked past the marine (x=${Math.round(member.x)})`);
});

// P1 (Talos contre le Titan, Z-110): in English the prototype systems line
// stayed French. Its catalog template had two adjacent slots ({3}{4}) and the
// overheat slot is empty unless the frame overheats; an empty slot never matches.
test('mecha HUD: the systems line reads in English, overheated or not', async () => {
  const { host, prepare } = await import('./engine-host-v188.mjs');
  const { GameEngine } = await import('../src/game-production-runtime.js');
  const { ENEMIES, WEAPONS, LEVEL_SEEDS } = await import('../src/content.js');
  const { buildMechaMissionV131 } = await import('../src/mecha-missions-v131.js');
  const { setLanguageV185 } = await import('../src/i18n-v185.js');
  const { loadCatalogV185, autoTranslateV185 } = await import('../src/i18n-auto-v185.js');
  await loadCatalogV185();
  const entry = campaign('special-titan-v131'), world = worldOf(entry), browser = host();
  const missionLevel = buildMechaMissionV131({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant: 0 });
  const engine = new GameEngine(browser.canvas, { onEvent: () => {} });
  engine.start({ world, campaign: entry, weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [],
    seed: missionLevel.levelSeed.seed, levelSeed: missionLevel.levelSeed, missionLevel });
  await prepare(engine);
  // The host canvas is a stub: apply the production canvas translation (fillText wrapper) by hand.
  const systemsLine = () => { browser.text.length = 0; engine.drawHud(browser.ctx); return autoTranslateV185(browser.text.find(line => /^COQUE /.test(line))); };
  try {
    setLanguageV185('en', { document: null, storage: null, persist: false });
    assert.match(systemsLine(), /^HULL 806\/806 · POWER 100 · HEAT 0 · CORROSION 0 · GEL 4 · REPAIRS 2$/);
    Object.assign(engine.mechaMissionV131.systems, { heat: 100, overheated: true });
    assert.match(systemsLine(), /· HEAT 100 OVERHEAT ·/);
    setLanguageV185('fr', { document: null, storage: null, persist: false });
    assert.match(systemsLine(), /^COQUE 806\/806 · ÉNERGIE 100 · CHALEUR 100 SURCHAUFFE · /);
  } finally { setLanguageV185('fr', { document: null, storage: null, persist: false }); }
});
