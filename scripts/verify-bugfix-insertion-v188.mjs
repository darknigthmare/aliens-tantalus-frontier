// Regression tests, bug hunt "insertion" (2026-11-14).
// 1. Owner decision "safe zone at insertion": awake patrols start >= 900 px from
//    the insertion point and no enemy attacks or closes in during the first 4 s
//    (generic and mode missions; story chapters keep their encounters).
// 2. Owner decision "check against the bible": the squad line of the mission log.
// 3. Survival V70: a second keyboard E at the power station reroutes power.
// 4. Interaction rule: the V62 vent-network entry is a candidate of the shared E selection.
// Fixture: scripts/engine-host-v188.mjs fixture({ campaign, seed, options, keepEnemies })
// (production GameEngine, browser APIs stubbed). Each mission level is built like the
// app builds it. Injections are listed where they are used.
import test from 'node:test';
import assert from 'node:assert/strict';
import { fixture, tick } from './engine-host-v188.mjs';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { INSERTION_SAFE_ZONE_V188, INSERTION_SAFE_ZONE_EXCLUDED_V188 } from '../src/insertion-safe-zone-v188.js';

const campaign = id => { const found = CAMPAIGNS.find(entry => entry.id === id); assert.ok(found, id); return found; };
const worldOf = entry => WORLDS.find(world => world.id === entry.worldId) || WORLDS[0];
// The generic launch of the app: the campaign's own world and mission level.
async function launch(id, { keepEnemies = true } = {}) {
  const entry = campaign(id), world = worldOf(entry);
  const missionLevel = buildMissionLevelV52({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant: 0 });
  return fixture({ campaign: entry, seed: missionLevel.levelSeed.seed, keepEnemies,
    options: { world, levelSeed: missionLevel.levelSeed, missionLevel, userCasteCampaignV88: !id.startsWith('special-') } });
}
const centre = actor => ({ x: actor.x + actor.w / 2, y: actor.y + actor.h / 2 });
const distance = (a, b) => { const p = centre(a), q = centre(b); return Math.hypot(p.x - q.x, p.y - q.y); };
const awake = engine => engine.enemies.filter(enemy => enemy.alive && !enemy.dormant);
const hurt = (player, health, armor) => player.health < health || (player.armor ?? 0) < armor;

// ---------------------------------------------------------------- item 1
const MISSIONS = ['pair-001-mire', 'pair-001-frontier', 'special-cargo-brutal', 'special-alpha-bravo-doctrine'];
for (const id of MISSIONS) test(`${id}: awake patrols start >= ${INSERTION_SAFE_ZONE_V188.radius} px away; a still marine is unhurt for 10 s`, async () => {
  const { engine } = await launch(id);
  const p = engine.player, list = awake(engine);
  assert.ok(list.length > 0, 'the mission has awake patrols');
  for (const enemy of list) assert.ok(distance(enemy, p) >= INSERTION_SAFE_ZONE_V188.radius,
    `${enemy.id} starts ${Math.round(distance(enemy, p))} px from the insertion point`);
  assert.ok(engine.insertionGraceV188?.remaining > 0, 'the grace is armed when control is given');
  const health = p.health, armor = p.armor ?? 0;
  tick(engine, 10);
  assert.equal(engine.mission.state, 'active');
  assert.ok(!hurt(p, health, armor), `no damage in 10 s (health ${p.health}/${health})`);
});

test('grace: an enemy beside the marine neither attacks nor closes in for 4 s, then the fight resumes', async () => {
  const { engine, events } = await launch('pair-001-mire');
  const p = engine.player;
  // Injection: the first awake patrol is moved 150 px in front of the marine, on his floor.
  const enemy = awake(engine)[0];
  for (const other of awake(engine)) if (other !== enemy) other.alive = false;
  Object.assign(enemy, { x: p.x + p.w / 2 + 150 - enemy.w / 2, y: p.y + p.h - enemy.h, vx: 0, vy: 0 });
  enemy.groundY = p.y + p.h; enemy.spawnX = enemy.x; engine.initializeEnemyMissionNavigation(enemy);
  const start = distance(enemy, p), health = p.health, armor = p.armor ?? 0;
  tick(engine, 3.8);
  assert.ok(!hurt(p, health, armor), `no damage during the grace (health ${p.health})`);
  assert.ok(distance(enemy, p) >= start - 1, `the enemy held its distance (${Math.round(start)} -> ${Math.round(distance(enemy, p))})`);
  tick(engine, 8.2);
  assert.ok(events.some(event => event.type === 'insertion-grace-ended-v188'));
  assert.equal(engine.insertionGraceV188, null);
  assert.ok(hurt(p, health, armor), 'after the grace the enemy attacks: the hold is only an opening');
});

test('grace counts mission time only: paused or loading, it does not run out', async () => {
  const { engine } = await launch('pair-001-frontier');
  engine.paused = true; tick(engine, 6); engine.paused = false;
  assert.equal(engine.insertionGraceV188?.remaining, INSERTION_SAFE_ZONE_V188.graceSeconds);
  tick(engine, 2); assert.ok(Math.abs(engine.insertionGraceV188.remaining - 2) < .05);
});

test('grace: horde and tension directors cannot open a wave inside the window', async () => {
  const { HORDE_DIRECTOR_V132 } = await import('../src/horde-director-v132.js');
  assert.ok(HORDE_DIRECTOR_V132.firstWaveRange[0] > INSERTION_SAFE_ZONE_V188.graceSeconds);
  // The layer sits under the caste behaviours (their dash and lunge scale the held step).
  const { readFileSync } = await import('node:fs');
  assert.match(readFileSync(new URL('../src/game-production-runtime.js', import.meta.url), 'utf8'),
    /withCasteBehaviorsV188\(withInsertionSafeZoneV188\(withRunOptionsRuntimeV188\(/);
});

test('story chapters and resumed missions keep their authored encounters (QZ-17, QZ-18, APC, C-12, cocoon)', async () => {
  for (const id of ['special-narrative-qz17', 'special-archive-relay', 'special-apc-convoy', 'special-c12-horde', 'special-black-cocoon'])
    assert.ok(INSERTION_SAFE_ZONE_EXCLUDED_V188.includes(id), id);
  const { engine } = await launch('special-narrative-qz17');
  assert.equal(engine.insertionSafeZoneV188, null); assert.equal(engine.insertionGraceV188, null);
  assert.ok(awake(engine).some(enemy => distance(enemy, engine.player) < INSERTION_SAFE_ZONE_V188.radius),
    'the QZ-17 hold keeps its authored patrol positions');
  // A resume restores the saved positions and pressure: no grace is added.
  const generic = await launch('pair-001-mire'), state = generic.engine.captureResumeState();
  assert.ok(generic.engine.insertionGraceV188);
  assert.equal(generic.engine.applyResumeState(state).applied, true);
  assert.equal(generic.engine.insertionGraceV188, null);
});

// ---------------------------------------------------------------- item 2
test('Jeri (hive): the squad stays deployed and the mission log says what is true for that mission (FR/EN)', async () => {
  const { missionDeploymentLogV188 } = await import('../src/mission-deployment-log-v188.js');
  const { HIVE_CAMPAIGNS_V131, buildHiveMissionV131 } = await import('../src/hive-missions-v131.js');
  const { createDefaultSave } = await import('../src/save.js');
  const { EN_CATALOG_V185, EN_PATTERNS_V185 } = await import('../src/i18n-en-catalog-v185.js');
  const { readFileSync } = await import('node:fs');
  const entry = HIVE_CAMPAIGNS_V131.find(c => c.id === 'special-jeri-v131'), world = worldOf(entry);
  // Fixture: the default save's first four crew members, active (fixture() drops the squad; it is rebuilt as start() builds it).
  const crew = createDefaultSave(1).crew.slice(0, 4).map(member => ({ ...member, status: 'active' }));
  const { engine } = await fixture({ campaign: entry, seed: 7, keepEnemies: true,
    options: { world, crew, levelSeeds: LEVEL_SEEDS, missionLevel: buildHiveMissionV131({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant: 0 }) } });
  engine.configureMissionSquad();
  const allies = engine.activeSquadActors();
  assert.equal(allies.length, 3, 'the selected marines are deployed with Jeri');
  assert.ok(allies.every(ally => ally.alive && Math.abs(ally.x - engine.player.x) < 200), 'beside the insertion point');
  const line = missionDeploymentLogV188(engine, allies.length);
  assert.equal(line, 'JERI EN INFILTRATION · 3 marines IA en appui');
  assert.doesNotMatch(line, /ESCOUADE DÉPLOYÉE|plaques/);
  assert.equal(missionDeploymentLogV188(engine, 1), 'JERI EN INFILTRATION · 1 marine IA en appui');
  assert.equal(missionDeploymentLogV188(engine, 0), 'JERI EN INFILTRATION · aucun marine en appui');
  assert.equal(EN_PATTERNS_V185['JERI EN INFILTRATION · {0} marines IA en appui'], 'JERI INFILTRATING · {0} AI marines in support');
  assert.ok(EN_CATALOG_V185['JERI EN INFILTRATION · 1 marine IA en appui'] && EN_CATALOG_V185['JERI EN INFILTRATION · aucun marine en appui']);
  // Other missions keep their line; the app writes the line through this function.
  const generic = await launch('pair-001-mire');
  assert.match(missionDeploymentLogV188(generic.engine, 2), /^ESCOUADE DÉPLOYÉE · 2 alliés IA physiques/);
  assert.match(readFileSync(new URL('../src/app.js', import.meta.url), 'utf8'), /textContent = missionDeploymentLogV188\(engine, activeAlliesV85\.length\)/);
});

// ---------------------------------------------------------------- item 3
// Browser cause (Chromium, instrumented keydown): the second E arrived while a
// creature sheet was streaming in (enemyAtlasLoadingPausedV65 raised for a few
// frames); the keydown handler returned before interact() and the press was lost.
test('survival V70: a real keyboard E pressed during a creature-sheet loading gate still reroutes power', async () => {
  const { engine } = await fixture({ campaign: campaign('special-alien-survival-systems'), seed: 7 });
  engine.supplies = []; engine.drops = [];
  const station = engine.alienSurvivalStationsV70.find(entry => entry.type === 'power'), p = engine.player;
  p.x = station.x + station.w / 2 - p.w / 2; p.y = station.y + station.h - p.h; p.vx = p.vy = 0;
  const power = engine.alienSurvivalV70.power;
  const key = (type, code) => { const event = new Event(type); Object.assign(event, { code, key: code.slice(3).toLowerCase(), repeat: false }); globalThis.dispatchEvent(event); };
  key('keydown', 'KeyE'); key('keyup', 'KeyE');
  assert.equal(power.rerouteCount, 1, 'first press');
  // Injection: the loading gate as the browser raised it; the frame loop's own
  // refresh is replaced so the gate lifts when the test says so.
  const refresh = engine.refreshEnemyAtlasAvailabilityV65; let loading = true;
  engine.refreshEnemyAtlasAvailabilityV65 = () => { engine.enemyAtlasLoadingPausedV65 = loading; };
  engine.enemyAtlasLoadingPausedV65 = true;
  key('keydown', 'KeyE'); key('keyup', 'KeyE');
  assert.equal(power.rerouteCount, 1, 'nothing runs while the gate is up');
  engine.loop(engine.last + 16);
  assert.equal(power.rerouteCount, 1);
  loading = false; engine.loop(engine.last + 16);
  assert.equal(power.rerouteCount, 2, 'the kept press reroutes power once the sheet is ready');
  engine.loop(engine.last + 16); assert.equal(power.rerouteCount, 2, 'replayed once');
  // A user pause is not a loading gate: a press then is not kept.
  engine.paused = true; key('keydown', 'KeyE'); key('keyup', 'KeyE'); engine.paused = false;
  engine.loop(engine.last + 16); assert.equal(power.rerouteCount, 2);
  engine.refreshEnemyAtlasAvailabilityV65 = refresh;
});

// ---------------------------------------------------------------- item 4
test('V62 vent network entry: an action of the shared E selection (prompt = E), first among the actions', async () => {
  const { engine } = await fixture({ campaign: CAMPAIGNS[0], seed: 7 });
  engine.supplies = []; engine.drops = []; engine.objectiveNodes = []; engine.powerNode = null; engine.archiveTerminal = null; engine.objective = null;
  if (engine.weaponPickup) engine.weaponPickup.taken = true;
  if (engine.toolPickup) engine.toolPickup.taken = true;
  assert.ok(engine.missionVentNetworkV62, 'the ship template carries a V62 network');
  const portal = engine.vents.find(entry => entry.portalRole === 'entrance'), p = engine.player;
  // Injection: the marine 30 px from the portal centre, on its floor; the cutter in hand.
  engine.inventory.cutter = true;
  p.x = portal.x + portal.w / 2 + 30 - p.w / 2; p.y = portal.y + portal.h - p.h; p.vx = p.vy = 0; p.grounded = true;
  assert.equal(engine.selectInteractionTargetV188(p)?.kind, 'mission-vent-v62');
  assert.equal(engine.getInteractionPrompt(p), 'E  OUVRIR / EMPRUNTER LE CONDUIT');
  // Injection: a crate at the marine's centre, strictly nearer than the portal.
  const crate = { id: 'qa-ammo', type: 'ammo', amount: 12, used: false, x: p.x + p.w / 2 - 28, y: p.y + p.h / 2 - 21, w: 56, h: 42 };
  engine.supplies = [crate];
  assert.equal(engine.getInteractionPrompt(p), 'E  RÉCUPÉRER DES MUNITIONS');
  assert.equal(engine.interact(p), true);
  assert.equal(crate.used, true, 'E takes the crate the prompt names');
  assert.equal(p.ventTransit ?? null, null, 'the marine did not enter the vent behind the crate prompt');
  // Injection: a door within reach; the entry keeps its rank as an action.
  engine.doors = [{ id: 'qa-door', x: p.x + p.w / 2 - 10, y: p.y - 40, w: 20, h: p.h + 40, open: false, progress: 0 }];
  assert.equal(engine.selectInteractionTargetV188(p)?.kind, 'mission-vent-v62');
  engine.doors = [];
  assert.equal(engine.interact(p), true);
  assert.ok(p.ventTransit, 'E enters the vent the prompt names');
});
