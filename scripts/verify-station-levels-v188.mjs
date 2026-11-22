// V188 — dedicated levels of the Asphodèle station missions S1-S4 (src/station-mission-levels-v188.js, spec 009).
// Real production engine (engine-host-v188.mjs) on the generated `ship-interior-vertical` template.
// Fixtures: seed 7, levels built from LEVEL_SEEDS; the template roster is removed by the layer itself;
// `narrativeArchiveSave` carries the CASSIUS decision (S3) and the colony Grue decision (S4) where stated.
// Injections are declared where used: marine positions (`place`), held keys (`engine.keys`), a recent
// hit (`lastHitAt`), cleared enemies (`engine.enemies = []`) and set timers (`sealRemaining`, `holdRemaining`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, tick } from './engine-host-v188.mjs';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { STATION_LEVEL_IDS_V188, STATION_LEVEL_PHASES_V188, STATION_LEVEL_RULES_V188, STATION_LEVEL_TEXT_V188, STATION_BARRIERS_V188,
  stepStationHoldV188, stationSpawnXV188, STATION_CASSIUS_HEARING_ID_V188, stationAirlock3ModeV188, stepStationEggV188, stationAccessV188, isStationLevelCampaignV188 } from '../src/station-mission-levels-v188.js';
import { STATION_LEVEL_ART_SLOTS_V188, STATION_LEVEL_ART_FILES_PRESENT_V188, STATION_LEVEL_REUSED_PNGS_V188, drawStationLevelSlotV188 } from '../src/station-level-art-v188.js';
import { ASPHODELE_HUB_FILES_PRESENT_V188, getAsphodeleHubSlotV188 } from '../src/asphodele-hub-slots-v188.js';
import { STATION_CAMPAIGNS_V188, normalizeStationV188, cassiusChoicePendingV188 } from '../src/station-asphodele-v188.js';
import { resolveDepthHoldDefinitionV188 } from '../src/depth-hold-sections-v188.js';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';
import { CASSIUS_INTERROGATION_V188, confrontationOutcomeV188, startConfrontationV188, playConfrontationMoveV188 } from '../src/confrontation-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const campaignOf = id => CAMPAIGNS.find(entry => entry.id === id);
const worldOf = campaign => WORLDS.find(world => world.id === campaign.worldId) || WORLDS[0];
const centre = actor => actor.x + actor.w / 2;

async function level(id, extra = {}) {
  const campaign = campaignOf(id), world = worldOf(campaign);
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS });
  const run = await fixture({ campaign, seed: 7, options: { world, missionLevel, ...extra } });
  const engine = run.engine, places = engine.stationLevelV188?.places;
  // Injection: the marine stands at x on a deck floor (default: the low deck).
  const place = (x, y = places.decks.low) => Object.assign(engine.player, { x: x - engine.player.w / 2, y: y - engine.player.h, vx: 0, vy: 0, grounded: true, depthZ: 0, facing: 1 });
  const hold = seconds => { engine.keys.add('KeyE'); tick(engine, seconds); engine.keys.delete('KeyE'); };
  const use = () => { const done = engine.interact(engine.player); tick(engine, .7); return done; };
  const clear = () => { engine.enemies = []; engine.stationLevelV188.lastHitAt = -Infinity; };
  return { ...run, campaign, world, places, place, hold, use, clear, progress: () => engine.stationLevelV188.progress };
}
const extract = (run) => {
  const { engine } = run;
  run.clear(); run.place(engine.objective.x + engine.objective.w / 2, engine.objective.y + engine.objective.h);
  assert.equal(engine.getInteractionPrompt(), 'E  CONFIRMER L’EXTRACTION'); run.use();
  assert.equal(engine.mission.state, 'complete');
};
const saveWith = (cassius, grue = null) => ({ stationV188: { introHeard: true, cassius, scenesSeen: [] }, colonyMissionsV188: { grue } });

test('station levels: data, ids and existing records are unchanged', () => {
  assert.deepEqual(STATION_LEVEL_IDS_V188, STATION_CAMPAIGNS_V188.map(entry => entry.id));
  assert.deepEqual(STATION_CAMPAIGNS_V188.map(entry => [entry.id, entry.templateId, entry.objective]), [
    ['station-s1', 'ship-interior-vertical', 'board a drifting vessel'], ['station-s2', 'ship-interior-vertical', 'restore atmospheric processing'],
    ['station-s3', 'ship-interior-vertical', 'escape the quarantine'], ['station-s4', 'ship-interior-vertical', 'hold the extraction zone']]);
  for (const id of STATION_LEVEL_IDS_V188) {
    assert.ok(isStationLevelCampaignV188(id));
    assert.equal(STATION_LEVEL_PHASES_V188[id].at(-1).id, 'extract');
    for (const phase of STATION_LEVEL_PHASES_V188[id]) assert.ok(phase.label.fr && phase.label.en, `${id}:${phase.id}`);
  }
  for (const other of ['station-a-echo8', 'station-c-nid', 'station-intro-silence', 'colony-c2']) assert.equal(isStationLevelCampaignV188(other), false, other);
  assert.equal(CAMPAIGNS.some(entry => entry.id === 'station-intro-silence'), false, 'the intro is a quest scene, not a mission template');
  assert.equal(STATION_LEVEL_RULES_V188.safeZonePx, 900); assert.equal(STATION_LEVEL_RULES_V188.graceSeconds, 4);
  assert.equal(STATION_LEVEL_RULES_V188.pxPerMetre, 51); assert.deepEqual(STATION_LEVEL_RULES_V188.marine, { w: 44, h: 92 });
  // The save field keeps its shape (the levels write nothing to the campaign save).
  assert.deepEqual(Object.keys(normalizeStationV188({})), ['schema', 'introHeard', 'cassius', 'scenesSeen']);
});

test('station levels: pure rules (held interaction, safe zone, airlock 3 mode, eggs)', () => {
  assert.deepEqual(stepStationHoldV188(.5, { held: true, inReach: true, sinceHit: .2, dt: 1, seconds: 4 }), { progress: .5, paused: true });
  assert.equal(stepStationHoldV188(.5, { held: true, inReach: true, sinceHit: 9, dt: 2, seconds: 4 }).progress, 1);
  assert.ok(stationSpawnXV188({ marines: [{ x: 2000 }], side: 'east', deck: { x0: 100, x1: 5000 } }) - 2000 >= 900);
  assert.equal(stationSpawnXV188({ marines: [{ x: 600 }], side: 'west', deck: { x0: 100, x1: 1400 } }), null);
  assert.deepEqual(['rewrite', 'restrain', 'erase', null].map(stationAirlock3ModeV188), ['ask', 'code', 'force', 'force']);
  let egg = { id: 'e', state: 'closed', clock: 0 };
  let step = stepStationEggV188(egg, { near: true, dt: 1 }); assert.equal(step.egg.state, 'opening'); assert.equal(step.leap, false);
  step = stepStationEggV188(step.egg, { near: false, dt: 5 }); assert.equal(step.leap, false, 'stepping back stops the leap');
  step = stepStationEggV188(step.egg, { near: true, dt: .6 }); assert.equal(step.leap, true); assert.equal(step.egg.state, 'spent');
});

test('S1-S4: V1 interiors, generic encounter replaced, ducts sealed, upper decks sealed over the bulkheads (logical and physical)', async () => {
  for (const id of STATION_LEVEL_IDS_V188) {
    const run = await level(id), { engine, places } = run;
    assert.equal(engine.missionDepthSectionV188, null, `${id}: V1`);
    assert.equal(resolveDepthHoldDefinitionV188({ campaign: run.campaign, world: run.world }), null);
    assert.equal(engine.enemies.length, 0); assert.equal(engine.mission.objectives.boss, true);
    for (const event of engine.missionLevelEvents.values()) assert.equal(event.triggered, true);
    // Sealed frames stand on their floors, taller than a jump.
    const barriers = engine.stationLevelV188.barriers;
    assert.deepEqual(barriers.map(entry => entry.id), STATION_BARRIERS_V188.map(entry => entry.id));
    for (const barrier of barriers) { const wall = engine.walls.find(entry => entry.id === barrier.id); assert.ok(wall); assert.equal(wall.y + wall.h, barrier.floorY); assert.ok(wall.h >= 160); }
    // Ducts: an entrance explains, nobody enters.
    const vent = engine.vents.find(entry => entry.portalId);
    run.place(vent.x + vent.w / 2, vent.y + vent.h);
    if (!engine.stationCandidatesV188(engine.player).length) assert.equal(engine.getInteractionPrompt(), 'CONDUIT SCELLÉ · QUARANTAINE DE LA STATION');
    assert.equal(engine.beginMissionVentTraversalV62(engine.player, { entranceId: vent.portalId }), null);
  }
  // Physical: on the top deck and on the mid deck, walking east (and jumping) never passes the sealed frames.
  const run = await level('station-s1'), { engine, places } = run;
  const walk = (x, y) => {
    run.place(x, y); engine.keys.add('KeyD'); let max = 0;
    for (let i = 0; i < 120; i++) { if (i % 6 === 0) engine.player.jumpBuffer = .14; tick(engine, .1); max = Math.max(max, centre(engine.player)); }
    engine.keys.delete('KeyD'); return max;
  };
  const [hull, grate] = engine.stationLevelV188.barriers;
  assert.ok(walk(places.x.hull, places.decks.top) < hull.x, 'top deck: stopped by the hull seal');
  assert.ok(walk(places.x.junction, places.decks.mid) < grate.x, 'mid deck: stopped by the junction grate');
  assert.ok(walk(places.x.drop + 100, places.decks.low) < places.doors.dock.x, 'low deck: the dock airlock has no power');
  run.place(hull.x - 30, places.decks.top); assert.equal(engine.getInteractionPrompt(), STATION_BARRIERS_V188[0].requirement);
  // Logical: from the drop, only the dock block is reached until the airlock is cycled.
  const access = stationAccessV188(engine);
  assert.deepEqual([...access.reached].sort(), ['ship-dock', 'ship-dock-high', 'ship-dock-mid', 'ship-hull', 'ship-service', 'ship-spawn']);
  assert.equal(access.control, false); assert.equal(access.extraction, false);
});

test('S1 « L’arrimage »: manual airlock, dark ring (fans, Echo-8 traces), salvagers negotiated, control deck, extraction', async () => {
  const run = await level('station-s1'), { engine, places, place, hold, use, events } = run, pr = run.progress;
  assert.equal(engine.stationPhaseIdV188(), 'dock'); assert.equal(engine.missingExtractionRequirement(), 'SAS D’ARRIMAGE NON CYCLÉ');
  assert.ok(engine.stationDarknessV188() > .5, 'the station is dark');
  place(places.crank.x); assert.equal(engine.getInteractionPrompt(), 'E (MAINTENIR)  CYCLER LE SAS À LA MANIVELLE');
  engine.interact(engine.player); hold(2); const half = pr().crank;
  engine.stationLevelV188.lastHitAt = engine.mission.elapsed; hold(.4); assert.equal(pr().crank, half, 'a hit pauses without resetting');
  engine.stationLevelV188.lastHitAt = -Infinity; hold(2.2);
  assert.equal(engine.stationPhaseIdV188(), 'ring'); assert.equal(engine.checkpoint.id, 'station-s1-ring');
  assert.equal(places.doors.dock.open, true, 'the cycled airlock stands open');
  assert.ok(events.some(event => event.type === 'checkpoint' && event.checkpoint === 'station-s1-ring'));
  // Fans saturate the tracker in the ring.
  place(places.fans[0].x + 50); tick(engine, .1); assert.ok(engine.stationHudLinesV188().includes('DÉTECTEUR SATURÉ · VENTILATEURS'));
  assert.deepEqual(stationAccessV188(engine).reached.includes('ship-cargo'), true);
  assert.equal(stationAccessV188(engine).control, false, 'the salvagers still hold the bulkhead');
  place(places.traces[0].x); use(); place(places.traces[1].x, places.decks.mid); use();
  assert.deepEqual(pr().traces, { barricade: true, chalk: true });
  place(places.salvagers.x); assert.equal(engine.getInteractionPrompt(), 'E  NÉGOCIER LE PASSAGE AVEC LES RÉCUPÉRATEURS'); use();
  assert.equal(pr().salvagers, 'negotiated'); assert.equal(places.doors.cargo.open, true);
  assert.equal(stationAccessV188(engine).control, true);
  place(places.x.cargoDoor + 80); tick(engine, .2);
  assert.equal(engine.stationPhaseIdV188(), 'control'); assert.equal(engine.checkpoint.id, 'station-s1-control');
  place(places.console.x, places.decks.top); assert.equal(engine.getInteractionPrompt(), 'E  RÉTABLIR L’ALIMENTATION DE SECOURS DU PONT'); use();
  assert.equal(engine.mission.objectives.power, true); assert.equal(engine.stationPhaseIdV188(), 'extract');
  assert.ok(engine.stationDarknessV188() < .5);
  for (const event of events.filter(entry => entry.type === 'station-level-spawn-v188')) assert.ok(event.x !== undefined);
  extract(run); assert.equal(engine.mission.rewards.objectiveId, 'board-vessel');
});

test('S1: forcing the bulkhead sends the salvagers back armed, behind the safe zone and the grace', async () => {
  const run = await level('station-s1'), { engine, places, place, hold, events } = run, pr = run.progress;
  place(places.crank.x); engine.interact(engine.player); hold(4.3);
  place(places.x.cargoDoor - 40); assert.equal(engine.getInteractionPrompt(), 'E (MAINTENIR)  FORCER LA CLOISON');
  engine.interact(engine.player); hold(5.3);
  assert.equal(pr().salvagers, 'forced'); assert.equal(places.doors.cargo.open, true);
  tick(engine, 2.5);
  const spawns = events.filter(event => event.type === 'station-level-spawn-v188' && event.kind === 'salvager');
  assert.ok(spawns.length >= 1);
  for (const spawn of spawns) {
    const enemy = engine.enemies.find(item => item.id === spawn.enemyId);
    assert.ok(Math.abs(centre(enemy) - centre(engine.player)) >= 900, 'safe zone'); assert.ok(enemy.stationGraceV188 > 0, 'grace');
    assert.equal(enemy.biology || engine.stationEnemySourceV188('salvager').biology, 'human');
  }
  const enemy = engine.enemies.find(item => item.id === spawns[0].enemyId), x0 = enemy.x;
  tick(engine, 1); assert.equal(enemy.x, x0, 'frozen during the grace');
  // Until they are dealt with, the ring is not crossed.
  place(places.traces[0].x); run.use(); place(places.traces[1].x, places.decks.mid); run.use();
  place(places.x.cargoDoor + 80); tick(engine, .2); assert.equal(engine.stationPhaseIdV188(), 'ring');
  run.clear(); tick(engine, .2); assert.equal(engine.stationPhaseIdV188(), 'control');
  assert.equal(engine.stationLevelResultV188().salvagers, 'forced');
});

test('S2 « La voix de CASSIUS »: breakers with Kwan, reactor, three directives, orders copied, decision left to Command', async () => {
  const run = await level('station-s2'), { engine, places, place, hold, use } = run, pr = run.progress;
  assert.equal(engine.stationLevelV188.message.text, STATION_LEVEL_TEXT_V188.s2Start.fr);
  assert.equal(engine.doorRequirement(places.doors.cargo), 'SECTEURS HORS TENSION · DISJONCTEURS');
  // The generic auxiliary circuit is not offered: the reactor belongs to the level.
  place(places.reactor.x); assert.ok(!engine.interactionCandidatesV188(engine.player).some(entry => entry.kind === 'power'));
  for (const breaker of places.breakers) { place(breaker.x, breaker.y); assert.equal(engine.getInteractionPrompt(), 'E  RÉARMER LE DISJONCTEUR DE SECTEUR'); use(); }
  assert.equal(engine.stationPhaseIdV188(), 'reactor'); assert.equal(engine.doorRequirement(places.doors.cargo), '');
  assert.equal(engine.stationLevelV188.message.text, STATION_LEVEL_TEXT_V188.breakersDone.fr);
  place(places.reactor.x); assert.equal(engine.getInteractionPrompt(), 'E (MAINTENIR)  RELANCER LE RÉACTEUR AUXILIAIRE');
  engine.interact(engine.player); hold(5.3);
  assert.equal(engine.powerNode.active, true); assert.equal(engine.mission.objectives.power, true); assert.equal(engine.stationPhaseIdV188(), 'cassius');
  place(places.cassius.x, places.decks.top);
  // Spec 010 hearing: the level asks for it (the app opens the dialog over the paused mission), then learns the outcome.
  assert.equal(engine.getInteractionPrompt(), 'E  OUVRIR L’INTERROGATOIRE DE CASSIUS'); use();
  const asked = run.events.filter(event => event.type === 'station-cassius-hearing-v188');
  assert.equal(asked.length, 1); assert.equal(asked[0].confrontationId, STATION_CASSIUS_HEARING_ID_V188); assert.equal(STATION_CASSIUS_HEARING_ID_V188, 'station-s2-cassius');
  assert.equal(engine.getInteractionPrompt(), '', 'nothing else while the hearing is open');
  assert.equal(engine.missingExtractionRequirement(), 'CASSIUS NON INTERROGÉ');
  // Suspended before its last exchange: it can be reopened.
  assert.equal(engine.resolveStationCassiusHearingV188(null), false);
  assert.equal(engine.getInteractionPrompt(), 'E  OUVRIR L’INTERROGATOIRE DE CASSIUS'); use();
  // Injection: the outcome the app reads from the save when the dialog closes.
  assert.equal(engine.resolveStationCassiusHearingV188('won'), true);
  assert.equal(engine.stationLevelV188.message.text, CASSIUS_INTERROGATION_V188.endings.won.fr);
  assert.equal(engine.stationLevelResultV188().hearing, 'won');
  assert.equal(engine.getInteractionPrompt(), 'E (MAINTENIR)  COPIER LES ORDRES DE LIVRAISON QZ17');
  engine.interact(engine.player); hold(3.3);
  assert.equal(engine.stationPhaseIdV188(), 'extract');
  extract(run); assert.equal(engine.mission.rewards.objectiveId, 'restore-atmosphere');
  // The CASSIUS decision stays the existing one, due at Command after S2 (taken once).
  const save = { galaxy: { completedCampaignIds: ['special-archive-relay', 'station-s1', 'station-s2'] }, stationV188: { introHeard: true } };
  assert.equal(cassiusChoicePendingV188(save), true);
  assert.equal(engine.stationLevelResultV188().cassius, null);
});

test('S3 « Les ponts scellés »: airlock 3 follows the CASSIUS decision; lab, eggs, routing, Kessler’s tag, seal countdown', async () => {
  const modes = { rewrite: 'E  DEMANDER À CASSIUS D’OUVRIR LE SAS 3', restrain: 'E (MAINTENIR)  SAISIR LE CODE MANUEL DU SAS 3', erase: 'E (MAINTENIR)  FORCER LE SAS 3 À LA MAIN' };
  for (const [choice, prompt] of Object.entries(modes)) {
    const run = await level('station-s3', { narrativeArchiveSave: saveWith(choice) });
    run.place(run.places.airlock3.x); assert.equal(run.engine.getInteractionPrompt(), prompt, choice);
  }
  const run = await level('station-s3', { narrativeArchiveSave: saveWith('erase') }), { engine, places, place, hold, use, events } = run, pr = run.progress;
  place(places.airlock3.x); engine.interact(engine.player); hold(6.3);
  assert.equal(engine.stationPhaseIdV188(), 'lab'); assert.equal(places.doors.dock.open, true);
  // An egg opens when approached; stepping back in time avoids the leap; lingering costs a hit.
  const [first, second] = pr().eggs;
  place(first.x); tick(engine, .5); assert.equal(pr().eggs[0].state, 'opening');
  place(places.log.x); tick(engine, 2); assert.equal(pr().eggs[0].state, 'opening', 'no leap from afar');
  const health = engine.player.health + (engine.player.armor || 0);
  place(second.x); tick(engine, 1.7); assert.equal(pr().eggs[1].state, 'spent'); assert.equal(pr().eggHits, 1);
  assert.ok(engine.player.health + (engine.player.armor || 0) < health);
  run.clear(); place(first.x); assert.equal(engine.getInteractionPrompt(), 'E (MAINTENIR)  BRÛLER L’ŒUF'); engine.interact(engine.player); hold(2.3);
  assert.equal(pr().eggs[0].state, 'burnt');
  assert.equal(engine.doorRequirement(places.doors.cargo), 'LABORATOIRE NON FOUILLÉ');
  run.clear(); place(places.log.x); assert.equal(engine.getInteractionPrompt(), 'E  LIRE LES JOURNAUX DES SURVIVANTS'); use();
  run.clear(); place(places.cradles.x + places.cradles.w / 2); assert.equal(engine.getInteractionPrompt(), 'E  EXAMINER LES BERCEAUX QZ17'); use();
  assert.equal(engine.stationPhaseIdV188(), 'routing'); assert.equal(engine.checkpoint.id, 'station-s3-routing');
  assert.equal(engine.doorRequirement(places.doors.aft), 'SAS SANS ÉNERGIE · ROUTAGE');
  run.clear(); place(places.router.x + 30); assert.equal(engine.getInteractionPrompt(), 'E  ROUTER : SAS + VENTILATION'); use();
  assert.deepEqual(pr().routes, ['airlock', 'vents']); assert.equal(engine.stationPhaseIdV188(), 'escape');
  assert.ok(pr().sealRemaining > STATION_LEVEL_RULES_V188.sealSeconds - 1); assert.equal(engine.doorRequirement(places.doors.aft), '');
  // The generic 105 s quarantine timer no longer fails the level.
  assert.ok(engine.mission.elapsed > 0); engine.mission.elapsed = 200; tick(engine, .2); assert.equal(engine.mission.state, 'active');
  const saved = engine.captureResumeState().stationLevelV188; assert.equal(saved.progress.sealRemaining, STATION_LEVEL_RULES_V188.sealSeconds);
  // The seal closes: failure, and the retry restarts the phase as it began.
  engine.stationLevelV188.progress.sealRemaining = .05; tick(engine, .1);
  assert.equal(engine.mission.state, 'failed'); assert.equal(engine.mission.failureReason, 'quarantine-resealed');
  assert.equal(engine.restartFromCheckpoint(), true); assert.equal(engine.stationPhaseIdV188(), 'escape'); assert.equal(pr().sealRemaining, STATION_LEVEL_RULES_V188.sealSeconds);
  assert.ok(!engine.enemies.some(enemy => enemy.stationLevelSpawnV188), 'live spawns removed on retry');
  // Confined combat: more creatures when CASSIUS was erased, fewer with the ducts closed by the ventilation route.
  assert.equal(engine.stationSpawnPlanV188().total, 6);
  run.clear(); place(places.tag.x); assert.equal(engine.getInteractionPrompt(), 'E  RAMASSER LA PLAQUE DE KESSLER'); use();
  assert.equal(engine.stationPhaseIdV188(), 'extract'); assert.ok(events.some(event => event.type === 'station-kessler-tag-v188'));
  extract(run); assert.equal(engine.mission.rewards.objectiveId, 'escape-quarantine');
});

test('S4 « Le hub Asphodèle »: last nest, three valves, dock held open and held, team arrives, extraction at the dock', async () => {
  const run = await level('station-s4', { narrativeArchiveSave: saveWith('rewrite', 'accept') }), { engine, places, place, hold, events } = run, pr = run.progress;
  assert.ok(Math.abs(engine.objective.y + engine.objective.h - places.decks.low) < 1 && engine.objective.x < places.doors.dock.x, 'extraction at the dock');
  // The generic zone hold is not offered.
  place(engine.objective.x + 30); assert.match(engine.getInteractionPrompt(), /EXTRACTION BLOQUÉE — NID NON PURGÉ/);
  place(places.nest.x, places.decks.mid); assert.equal(engine.getInteractionPrompt(), 'E (MAINTENIR)  ARMER LA PURGE THERMIQUE DU NID');
  engine.interact(engine.player); hold(5.3); assert.equal(engine.stationPhaseIdV188(), 'pressure');
  for (const valve of places.valves) { run.clear(); place(valve.x, valve.y); assert.equal(engine.getInteractionPrompt(), 'E (MAINTENIR)  OUVRIR LA VANNE DE SECTEUR'); engine.interact(engine.player); hold(3.3); }
  assert.equal(engine.stationPhaseIdV188(), 'hold'); assert.equal(places.doors.dock.open, true);
  assert.equal(engine.doorRequirement(places.doors.dock), STATION_LEVEL_TEXT_V188.dockOpen.fr, 'the dock bulkhead is held open for docking');
  // Outside the dock the timer does not run.
  run.clear(); place(places.x.cargo); tick(engine, 2); assert.equal(pr().holdRemaining, STATION_LEVEL_RULES_V188.holdSeconds);
  place(places.hold.x); tick(engine, 4);
  const spawns = events.filter(event => event.type === 'station-level-spawn-v188' && event.phase === 'hold');
  assert.ok(spawns.length >= 1);
  for (const spawn of spawns) assert.ok(Math.abs(spawn.x - places.hold.x) >= 900);
  engine.stationLevelV188.progress.holdRemaining = .05; run.clear(); tick(engine, .2); // injection: the hold is run out
  assert.equal(engine.stationPhaseIdV188(), 'extract'); assert.equal(pr().arrived, true);
  assert.equal(engine.stationLevelV188.message.text, STATION_LEVEL_TEXT_V188.arrivedGrue.fr, 'Grue’s salvagers arrive when allied');
  assert.equal(engine.objectiveState.complete, true);
  extract(run); assert.equal(engine.mission.rewards.objectiveId, 'hold-extraction');
});

test('station levels: each phase checkpoint is written at phase start; resume and retry land there with the phase as it began', async () => {
  const run = await level('station-s2'), { engine, places, place, use } = run;
  for (const breaker of places.breakers) { place(breaker.x, breaker.y); use(); }
  place(places.reactor.x); engine.interact(engine.player); run.hold(2);
  const saved = engine.captureResumeState();
  assert.equal(saved.stationLevelV188.phase, 1); assert.equal(saved.stationLevelV188.checkpoint, 'station-s2-reactor');
  assert.equal(saved.stationLevelV188.progress.reactor, 0, 'the snapshot is the phase start');
  const resumed = await level('station-s2', { resumeState: saved });
  assert.equal(resumed.engine.lastResumeResult.applied, true);
  assert.equal(resumed.engine.stationPhaseIdV188(), 'reactor'); assert.equal(resumed.engine.checkpoint.id, 'station-s2-reactor');
  assert.ok(Math.abs(centre(resumed.engine.player) - (places.x.cargoDoor + 90)) < 2, 'the marine resumes at the phase checkpoint');
  assert.equal(resumed.engine.doorRequirement(resumed.places.doors.cargo), '', 'the bulkhead opened by the breakers stays unlocked');
  engine.failMission('marine-a-terre'); assert.equal(engine.restartFromCheckpoint(), true);
  assert.equal(run.progress().reactor, 0);
});

test('station levels: other missions keep their behaviour; composition, offline shell, art slots and translations', async () => {
  const side = await level('colony-c2').catch(() => null);
  const contract = await (async () => { const campaign = campaignOf('station-c-nid'), world = worldOf(campaign);
    return fixture({ campaign, seed: 7, options: { world, missionLevel: buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS }) } }); })();
  assert.equal(contract.engine.stationLevelV188, null); assert.ok(contract.engine.spawnedEnemiesV188.length > 0, 'contracts keep the generic roster');
  assert.ok(contract.engine.asphMissionDressingV188, 'contracts keep their station dressing');
  void side;
  const runtime = read('src/game-production-runtime.js');
  assert.match(runtime, /withMissionObjectivePanelV188\(withStationMissionLevelsV188\(withTensionDirectorV188\(/);
  assert.match(runtime, /withFootstepCuesV188\(withColonyMissionLevelsV188\(withMissionObjectivePanelV188\(/);
  const sw = read('sw.js');
  for (const file of ['/src/station-mission-levels-v188.js', '/src/station-level-places-v188.js', '/src/station-level-art-v188.js']) assert.ok(sw.includes(`'${file}'`), file);
  assert.deepEqual(STATION_LEVEL_ART_FILES_PRESENT_V188, [], 'placeholders: no image claimed');
  for (const id of STATION_LEVEL_REUSED_PNGS_V188) { assert.ok(ASPHODELE_HUB_FILES_PRESENT_V188.includes(id), id); assert.ok(readFileSync(new URL('..' + getAsphodeleHubSlotV188(id).path, import.meta.url)).length > 0, id); }
  for (const entry of STATION_LEVEL_ART_SLOTS_V188) {
    assert.ok(['documented', 'adapted', 'to-define'].includes(entry.fidelity), entry.id);
    const calls = []; const ctx = new Proxy({}, { get: (_, key) => (...args) => { calls.push(key); return key === 'measureText' ? { width: 10 } : undefined; } });
    assert.equal(drawStationLevelSlotV188(ctx, null, entry.id, 0, 100), 'primitive', entry.id);
    assert.ok(calls.length > 2, entry.id);
  }
  // FR strings drawn by the levels have their reviewed EN.
  const strings = [...Object.values(STATION_LEVEL_TEXT_V188).map(entry => entry.fr), ...STATION_BARRIERS_V188.map(entry => entry.requirement)];
  for (const id of STATION_LEVEL_IDS_V188) for (const phase of STATION_LEVEL_PHASES_V188[id]) strings.push(phase.label.fr);
  for (const text of strings) assert.ok(Object.hasOwn(EN_CATALOG_V185, text), `EN: ${text}`);
  for (const id of STATION_LEVEL_IDS_V188) for (const phase of STATION_LEVEL_PHASES_V188[id]) assert.equal(EN_CATALOG_V185[phase.label.fr], phase.label.en);
  for (const pattern of ['TRACES D’ECHO-8 {0}/2', 'LABORATOIRE {0}/2', 'FERMETURE DE LA QUARANTAINE {0}:{1}', 'VANNES {0}/3', 'ARRIMAGE DE LA NAVETTE {0} s'])
    assert.ok(Object.hasOwn(EN_PATTERNS_V185, pattern), `EN: ${pattern}`);
});

test('S2 × spec 010: the CASSIUS hearing is wired in the level and only feeds the text of the existing decision', () => {
  const app = read('src/app.js');
  assert.match(app, /event\.type === 'station-cassius-hearing-v188'\) return openStationCassiusHearingV188\(\)/);
  assert.match(app, /engine\.resolveStationCassiusHearingV188\?\.\(confrontationOutcomeV188\(saveSystem\.data, id\)\)/);
  assert.match(app, /const decisionText = hearing \? `\$\{CASSIUS_DIALOG_V188\.text\[lang\]\}\\n\$\{CASSIUS_INTERROGATION_V188\.endings\[hearing\]\[lang\]\}`/);
  // The decision itself is untouched: the same three choices, same effects, whatever the outcome.
  const save = { galaxy: { completedCampaignIds: ['special-archive-relay', 'station-s1', 'station-s2'], worldState: {} }, stationV188: { introHeard: true }, storyCampaignV188: {} };
  assert.equal(startConfrontationV188(save, STATION_CASSIUS_HEARING_ID_V188), true);
  for (let i = 0; i < 5 && !confrontationOutcomeV188(save, STATION_CASSIUS_HEARING_ID_V188); i++) playConfrontationMoveV188(save, STATION_CASSIUS_HEARING_ID_V188, null);
  assert.equal(confrontationOutcomeV188(save, STATION_CASSIUS_HEARING_ID_V188), 'lost', 'silence throughout loses');
  assert.equal(cassiusChoicePendingV188(save), true, 'the decision is still due, unchanged');
});
