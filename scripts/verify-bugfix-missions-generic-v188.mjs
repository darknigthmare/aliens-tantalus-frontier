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
  // A real shot and a real hazard entry go through the production fire()/applyHazards().
  engine.captionDirectorV84 = null; engine.mission.elapsed += 10;
  p.ammo = Math.max(p.ammo, 10); p.fireCooldown = 0; p.reloading = false; engine.fire(p);
  const shot = captions().at(-1);
  assert.match(shot, / : tir balistique\.$/, `shot caption: ${shot}`);
  engine.captionDirectorV84 = null; engine.mission.elapsed += 10; p.hazardClock = 0; p.health = p.maxHealth;
  engine.hazards = [{ id: 'qa-vacuum', kind: 'vacuum', x: p.x - 10, y: p.y + p.h - 20, w: p.w + 20, h: 30, active: true, damage: 1 }];
  engine.applyHazards(p);
  assert.ok(captions().includes('Danger : vide.'), `hazard caption: ${captions().slice(-3)}`);
  const { setLanguageV185 } = await import('../src/i18n-v185.js');
  const { autoTranslateV185, useCatalogV185 } = await import('../src/i18n-auto-v185.js');
  useCatalogV185(await import('../src/i18n-en-catalog-v185.js'));
  setLanguageV185('en', { storage: null, document: null, persist: false });
  try {
    assert.equal(autoTranslateV185('Impact : vide.'), 'Impact: vacuum.');
    assert.equal(autoTranslateV185('Impact : Armored Warrior.'), 'Impact: Armored Warrior.');
    assert.equal(autoTranslateV185('Insertion : Secourir les survivants'), 'Insertion: Rescue the survivors');
    assert.equal(autoTranslateV185('M4A3 Service Pistol : tir balistique.'), 'M4A3 Service Pistol: ballistic fire.');
    assert.equal(autoTranslateV185('Danger : vide.'), 'Danger: vacuum.');
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

test('squad HUD and mission log name the support action, the zone biome and the crew member, never their ids', async () => {
  const { engine, text } = await launch(campaign('pair-001-mire'));
  // Declared injection: one AI ally with the engineering support action, as resolveOperationDeployment issues it.
  const ally = { ...engine.player, name: 'Idris Kwan', action: 'field-repair', alive: true, health: 80, maxHealth: 100 };
  engine.activeSquadActors = () => [ally];
  text.length = 0; engine.drawHud(engine.ctx);
  assert.ok(text.includes('Idris Kwan · réparation'), 'the HUD row reads the action in French');
  assert.ok(!text.some(line => /field-repair/.test(line)));
  const { squadActionLabelV188, biomeLabelV188 } = await import('../src/mission-log-labels-v188.js');
  assert.equal(squadActionLabelV188('suppressive-fire'), 'tir de suppression');
  assert.equal(squadActionLabelV188('unknown-v999'), 'soutien');
  assert.equal(biomeLabelV188('ruins'), 'ruines'); assert.equal(biomeLabelV188('vacuum'), 'vide spatial');
  const app = read('src/app.js');
  assert.match(app, /RÉANIMATION · \$\{crewDisplayNameV188\(event\.crewId\)\} a stabilisé \$\{crewDisplayNameV188\(event\.targetId\)\}/);
  assert.match(app, /ZONE · .* · \$\{biomeLabelV188\(event\.biome\)\.toUpperCase\(\)\}/);
  assert.doesNotMatch(app, /ALLIÉ À TERRE · \$\{event\.crewId\}/);
});

test('a generic death reads "marine à terre", not the failure id, in the log and the survival dock', async () => {
  const { missionFailureLabelV188 } = await import('../src/mission-log-labels-v188.js');
  const { engine, events } = await launch(campaign('pair-001-mire'));
  engine.enemies = []; engine.hazards = [];
  // Declared injection: the marine takes lethal damage (no coop, no squad).
  engine.squadActors = []; engine.coopEnabled = false;
  engine.damagePlayer(engine.player, 1e6, { bypassCover: true, source: 'fall' }); tick(engine, 0.5);
  const failed = events.find(event => event.type === 'mission-failed');
  assert.ok(failed, 'the mission fails');
  assert.equal(failed.reason, 'marine-a-terre', 'the saved id is unchanged');
  assert.equal(missionFailureLabelV188(failed.reason), 'marine à terre');
  assert.equal(missionFailureLabelV188('escouade-neutralisee'), 'escouade neutralisée');
  assert.equal(missionFailureLabelV188('Le sas a été englouti par l’effondrement planétaire.'), 'Le sas a été englouti par l’effondrement planétaire.');
  assert.match(read('src/app.js'), /OPÉRATION COMPROMISE · \$\{missionFailureLabelV188\(event\.reason \|\| event\.failureMode\)\}/);
  assert.match(read('src/alien-survival-runtime-v70.js'), /missionFailureLabelV188\(this\.mission\.failureReason\)/);
  // Checkpoint log lines: "CHECKPOINT mecha-mounted SÉCURISÉ." was shown in play.
  const { checkpointLabelV188 } = await import('../src/mission-log-labels-v188.js');
  assert.equal(checkpointLabelV188('mecha-mounted'), 'd’opération');
  assert.equal(checkpointLabelV188('insertion'), 'd’insertion'); assert.equal(checkpointLabelV188('beacon-2'), 'balise 2');
  assert.match(read('src/app.js'), /CHECKPOINT \$\{checkpointLabelV188\(event\.checkpoint\)\.toUpperCase\(\)\} SÉCURISÉ\./);
  assert.match(read('src/app.js'), /REPRISE CHECKPOINT \$\{checkpointLabelV188\(event\.checkpoint\)\.toUpperCase\(\)\} · /);
});
