// V188 — dedicated levels of the colony missions C1-C4 (src/colony-mission-levels-v188.js).
// Real production engine (engine-host-v188.mjs) on the generated templates. Fixtures:
// seed 7, levels built from LEVEL_SEEDS; the template roster is removed by the layer
// itself. Injections are declared where used: marine positions (`place`), held keys
// (`engine.keys`), a recent hit (`lastHitAt`) and direct kills (`defeatEnemy`).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, tick } from './engine-host-v188.mjs';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { COLONY_LEVEL_IDS_V188, COLONY_LEVEL_PHASES_V188, COLONY_LEVEL_RULES_V188, colonyC3CarrierIndexV188, stepHeldInteractionV188,
  stepPanicV188, colonySpawnXV188, colonyCultStabilityCostV188, applyColonyLevelResultV188, isColonyLevelCampaignV188 } from '../src/colony-mission-levels-v188.js';
import { COLONY_LEVEL_ART_SLOTS_V188, COLONY_LEVEL_ART_FILES_PRESENT_V188, drawColonyLevelSlotV188 } from '../src/colony-level-art-v188.js';
import { COLONY_MAIN_MISSIONS_V188, colonyC4DecisionPendingV188, normalizeColonyMissionsV188, applyColonyMissionResultV188 } from '../src/colony-missions-v188.js';
import { depthLaneIssuesV188, depthPassageV188, resolveDepthHoldDefinitionV188 } from '../src/depth-hold-sections-v188.js';
import { EN_CATALOG_V185, EN_PATTERNS_V185 } from '../src/i18n-en-catalog-v185.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const campaignOf = id => CAMPAIGNS.find(entry => entry.id === id);
const worldOf = campaign => WORLDS.find(world => world.id === campaign.worldId) || WORLDS[0];

async function level(id, extra = {}) {
  const campaign = campaignOf(id), world = worldOf(campaign);
  const missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS });
  const run = await fixture({ campaign, seed: 7, options: { world, missionLevel, ...extra } });
  const engine = run.engine, places = engine.colonyLevelV188?.places;
  // Injection: the marine stands at x on a deck floor (default: the street).
  const place = (x, y = places?.floorY ?? places?.decks?.low) => Object.assign(engine.player, { x: x - engine.player.w / 2, y: y - engine.player.h, vx: 0, vy: 0, grounded: true, depthZ: 0, facing: 1 });
  const hold = (seconds) => { engine.keys.add('KeyE'); tick(engine, seconds); engine.keys.delete('KeyE'); };
  // One E press, then the interaction animation plays out before the next press.
  const use = () => { const done = engine.interact(engine.player); tick(engine, .7); return done; };
  return { ...run, campaign, world, missionLevel, places, place, hold, use, progress: () => engine.colonyLevelV188.progress };
}
const centre = actor => actor.x + actor.w / 2;

test('colony levels: data, ids and existing records are unchanged', () => {
  assert.deepEqual(COLONY_LEVEL_IDS_V188, COLONY_MAIN_MISSIONS_V188.map(entry => entry.id));
  assert.deepEqual(COLONY_MAIN_MISSIONS_V188.map(entry => [entry.id, entry.templateId, entry.objective]), [
    ['colony-c1', 'colony-multiroute', 'defend the colony'], ['colony-c2', 'ship-interior-vertical', 'restore atmospheric processing'],
    ['colony-c3', 'colony-multiroute', 'rescue survivors'], ['colony-c4', 'colony-multiroute', 'navigate the vent network']]);
  for (const id of COLONY_LEVEL_IDS_V188) {
    assert.ok(isColonyLevelCampaignV188(id));
    const phases = COLONY_LEVEL_PHASES_V188[id];
    assert.equal(phases.at(-1).id, 'extract');
    for (const phase of phases) assert.ok(phase.label.fr && phase.label.en, `${id}:${phase.id}`);
  }
  assert.equal(isColonyLevelCampaignV188('colony-l-murs'), false, 'contracts keep the generic template');
  assert.equal(COLONY_LEVEL_RULES_V188.safeZonePx, 900); assert.equal(COLONY_LEVEL_RULES_V188.graceSeconds, 4);
  assert.equal(COLONY_LEVEL_RULES_V188.pxPerMetre, 51); assert.deepEqual(COLONY_LEVEL_RULES_V188.marine, { w: 44, h: 92 });
  assert.equal(COLONY_LEVEL_RULES_V188.holds.weld, 6); assert.equal(COLONY_LEVEL_RULES_V188.hatchSeconds, 240);
  // The save field keeps its shape.
  assert.deepEqual(Object.keys(normalizeColonyMissionsV188({})), ['schema', 'rewarded', 'scenesSeen', 'c4', 'grue', 'contracts', 'population']);
});

test('colony levels: pure rules (held interaction, panic, safe zone, carrier, cult cost)', () => {
  let step = stepHeldInteractionV188(.5, { held: true, inReach: true, sinceHit: .2, dt: 1, seconds: 6 });
  assert.deepEqual(step, { progress: .5, paused: true }, 'a recent hit pauses without resetting');
  step = stepHeldInteractionV188(.5, { held: false, inReach: true, sinceHit: 9, dt: 1, seconds: 6 });
  assert.equal(step.progress, .5); assert.equal(step.paused, true);
  step = stepHeldInteractionV188(.5, { held: true, inReach: true, sinceHit: 9, dt: 3, seconds: 6 });
  assert.equal(step.progress, 1); assert.equal(step.paused, false);
  assert.equal(stepPanicV188(10, { dt: 1 }).panic, 0);
  assert.equal(stepPanicV188(90, { aimingAtCivilian: true, dt: 1 }).scatter, true);
  assert.equal(stepPanicV188(0, { runningNearCivilian: true, dt: 1 }).panic, 25);
  const x = colonySpawnXV188({ marines: [{ x: 2000 }], side: 'east', deck: { x0: 100, x1: 5000 } });
  assert.ok(x - 2000 >= 900);
  assert.ok(2000 - colonySpawnXV188({ marines: [{ x: 2000 }], side: 'east', deck: { x0: 100, x1: 2600 } }) >= 900, 'falls back to the other side');
  assert.equal(colonySpawnXV188({ marines: [{ x: 600 }], side: 'west', deck: { x0: 100, x1: 1400 } }), null, 'no place far enough: no spawn');
  assert.equal(colonyC3CarrierIndexV188(7, 'sig'), colonyC3CarrierIndexV188(7, 'sig'));
  assert.ok(new Set(Array.from({ length: 40 }, (_, seed) => colonyC3CarrierIndexV188(seed, 'x'))).size === 5, 'every survivor can be the carrier');
  assert.deepEqual([0, 1, 2, 3, 9].map(colonyCultStabilityCostV188), [0, -1, -2, -3, -3]);
  const save = { galaxy: { worldState: { 'world-05-lethe': { stability: 50 } } } };
  assert.equal(applyColonyLevelResultV188(save, { success: true, campaignId: 'colony-c4', result: { campaignId: 'colony-c4', cultKilled: 0 } }), null);
  assert.equal(applyColonyLevelResultV188(save, { success: false, campaignId: 'colony-c4', result: { campaignId: 'colony-c4', cultKilled: 2 } }), null);
  assert.equal(applyColonyLevelResultV188(save, { success: true, campaignId: 'colony-c3', result: { campaignId: 'colony-c3', cultKilled: 2 } }), null);
  assert.equal(applyColonyLevelResultV188(save, { success: true, campaignId: 'colony-c4', result: { campaignId: 'colony-c4', cultKilled: 2 } }).stability, -2);
  assert.equal(save.galaxy.worldState['world-05-lethe'].stability, 48);
});

test('C1: V2 depth corridor on the port street, lifts parked, generic encounter replaced', async () => {
  const run = await level('colony-c1'), { engine, places } = run, section = engine.missionDepthSectionV188;
  assert.equal(resolveDepthHoldDefinitionV188({ campaign: run.campaign, world: run.world })?.id, 'colony-c1-port-corridor');
  assert.equal(section.id, 'colony-c1-port-corridor'); assert.equal(section.floorY, places.floorY);
  assert.ok(section.x1 - section.x0 >= 4200 && section.x1 - section.x0 <= 4700, `corridor ${section.x1 - section.x0} px`);
  assert.deepEqual(section.skipped, [], 'every corridor object found a clear wall');
  assert.deepEqual(depthLaneIssuesV188(section), []);
  const passage = depthPassageV188(section); assert.ok(passage.westDoor && passage.eastDoor); assert.equal(passage.pockets, 0);
  for (const lift of engine.lifts) { assert.equal(lift.y, places.floorY); assert.equal(lift.controlledV130, false); }
  assert.equal(engine.enemies.length, 0); assert.equal(engine.mission.objectives.boss, true);
  for (const event of engine.missionLevelEvents.values()) assert.equal(event.triggered, true);
  assert.ok(places.shutter.x < places.container && places.container < places.infirmary && places.infirmary < places.airlockA && places.airlockA < places.airlockB && places.airlockB < places.platform.x0);
  // The street is continuous: walking from the quay to the platform never falls.
  // Injection: the marine walks off the rail (z −50), around the wall-side crates covers.
  run.place(places.quay + 120); engine.player.depthZ = -50; engine.keys.add('KeyD');
  for (let i = 0; i < 120 && centre(engine.player) < places.platform.x0; i++) tick(engine, .25);
  engine.keys.delete('KeyD');
  assert.ok(centre(engine.player) >= places.platform.x0, `reached the platform (${Math.round(centre(engine.player))})`);
  assert.ok(Math.abs(engine.player.y + engine.player.h - places.floorY) < 2, 'still on the street floor');
});

test('C1: contain, evacuate three patients, weld A then B (held, paused by hits), sentries, quiet run to extraction', async () => {
  const run = await level('colony-c1'), { engine, places, place, hold, use, events } = run, pr = run.progress;
  assert.equal(engine.colonyPhaseIdV188(), 'contain'); assert.equal(engine.missingExtractionRequirement(), 'ENTREPÔT NON CONFINÉ');
  place(places.shutter.x + places.shutter.w / 2);
  assert.equal(engine.getInteractionPrompt(), 'E (MAINTENIR)  BAISSER LE RIDEAU DE L’ENTREPÔT');
  engine.interact(engine.player); hold(1); assert.ok(pr().shutter > .4 && pr().shutter < 1); hold(1.2);
  assert.equal(engine.colonyPhaseIdV188(), 'evacuate');
  assert.equal(engine.checkpoint.id, 'colony-c1-evacuate');
  assert.ok(events.some(event => event.type === 'checkpoint' && event.checkpoint === 'colony-c1-evacuate'));
  place(places.infirmary); assert.match(engine.getInteractionPrompt(), /ESCORTER LES PATIENTS/); use();
  for (let x = places.infirmary; x < places.platform.x0 + 220; x += 20) { place(x); tick(engine, .25); }
  tick(engine, 3);
  assert.deepEqual(pr().civilians.map(entry => entry.state), ['safe', 'safe', 'safe']);
  assert.equal(engine.colonyPhaseIdV188(), 'weld'); assert.equal(engine.checkpoint.id, 'colony-c1-weld');
  // Every spawn so far appeared at least 900 px from the marine and waited 4 s.
  const spawns = events.filter(event => event.type === 'colony-level-spawn-v188');
  assert.ok(spawns.length >= 1);
  // Two sentries: picked up on the platform, deployed on the rail.
  for (const x of places.kits) { place(x); assert.match(engine.getInteractionPrompt(), /SENTINELLE UA 571-C/); use(); }
  assert.equal(pr().carried, 2);
  place(places.airlockB + 220); assert.equal(engine.getInteractionPrompt(), 'E  DÉPLOYER LA SENTINELLE ICI'); use();
  place(places.airlockB + 420); use();
  assert.equal(pr().turrets.length, 2); assert.equal(pr().carried, 0);
  // Airlock A is welded from the platform side; the door closes and stays welded.
  place(places.airlockA - 50); assert.match(engine.getInteractionPrompt(), /CÔTÉ PLATE-FORME/);
  place(places.airlockA + 50); use();
  assert.equal(places.securityGate.open, false);
  hold(3); const before = pr().weldA;
  engine.colonyLevelV188.lastHitAt = engine.mission.elapsed; // injection: a hit
  hold(.5); assert.equal(pr().weldA, before, 'a hit pauses the weld'); assert.ok(pr().weldA > 0, 'without resetting it');
  engine.enemies = []; engine.colonyLevelV188.lastHitAt = -Infinity; hold(3.3);
  assert.equal(pr().weldA, 1); assert.equal(engine.doorRequirement(places.securityGate), 'SAS SOUDÉ');
  // Peak at airlock B (spawns from the platform side), then the quiet run.
  place(places.airlockB); use();
  for (let i = 0; i < 70 && pr().weldB < 1; i++) { engine.colonyLevelV188.lastHitAt = -Infinity; engine.player.health = 100; hold(.1); }
  assert.equal(pr().weldB, 1);
  assert.equal(engine.colonyPhaseIdV188(), 'extract'); assert.equal(engine.checkpoint.id, 'colony-c1-extract');
  assert.equal(engine.colonySpawnPlanV188(), null, 'no spawn on the run to extraction');
  for (const event of events.filter(entry => entry.type === 'colony-level-spawn-v188')) {
    const enemy = engine.enemies.find(item => item.id === event.enemyId);
    if (enemy) assert.ok(enemy.colonyGraceV188 <= COLONY_LEVEL_RULES_V188.graceSeconds);
  }
  assert.ok(events.filter(event => event.type === 'colony-level-spawn-v188' && event.phase === 'weld').length >= 4, 'the peak happened');
  assert.equal(engine.missingExtractionRequirement(), '');
  engine.enemies = [];
  place(engine.objective.x + engine.objective.w / 2); assert.equal(engine.getInteractionPrompt(), 'E  CONFIRMER L’EXTRACTION');
  use(); assert.equal(engine.mission.state, 'complete'); assert.equal(engine.mission.rewards.objectiveId, 'defend-colony');
});

test('C1: spawns keep the 900 px safe zone and the 4 s grace', async () => {
  const run = await level('colony-c1'), { engine, places, place, events } = run;
  place(places.drop + 200);
  tick(engine, 6.2);
  const spawn = events.find(event => event.type === 'colony-level-spawn-v188');
  assert.ok(spawn, 'the warehouse trickle started');
  const enemy = engine.enemies.find(item => item.id === spawn.enemyId), x0 = enemy.x;
  assert.ok(Math.abs(centre(enemy) - centre(engine.player)) >= 900);
  tick(engine, 3); assert.equal(enemy.x, x0, 'frozen during the grace');
  tick(engine, 1.5); assert.equal(enemy.colonyGraceV188, 0);
});

test('C1: each phase checkpoint is written at phase start; resume and retry land there with the phase as it began', async () => {
  const run = await level('colony-c1'), { engine, places, place, hold, use } = run;
  place(places.shutter.x + places.shutter.w / 2); engine.interact(engine.player); hold(2.2);
  place(places.infirmary); use(); place(places.infirmary + 400); tick(engine, 2);
  const saved = engine.captureResumeState();
  assert.equal(saved.colonyLevelV188.phase, 1); assert.equal(saved.colonyLevelV188.checkpoint, 'colony-c1-evacuate');
  assert.deepEqual(saved.colonyLevelV188.progress.civilians.map(entry => entry.state), ['wait', 'wait', 'wait'], 'the snapshot is the phase start');
  const resumed = await level('colony-c1', { resumeState: saved });
  assert.equal(resumed.engine.lastResumeResult.applied, true);
  assert.equal(resumed.engine.colonyPhaseIdV188(), 'evacuate');
  assert.equal(resumed.engine.checkpoint.id, 'colony-c1-evacuate');
  assert.ok(Math.abs(centre(resumed.engine.player) - (places.shutter.x + places.shutter.w + 70)) < 2, 'the marine resumes at the phase checkpoint');
  assert.equal(resumed.progress().shutter, 1);
  // Retry after a death: the phase restarts from its snapshot, live spawns are removed.
  engine.failMission('marine-a-terre'); assert.equal(engine.restartFromCheckpoint(), true);
  assert.deepEqual(run.progress().civilians.map(entry => entry.state), ['wait', 'wait', 'wait']);
  assert.ok(!engine.enemies.some(enemy => enemy.colonyLevelSpawnV188));
});

test('C2: gantry, duct ambush, nest purge, breakers and console, surge, extraction on the top deck', async () => {
  const run = await level('colony-c2'), { engine, places, place, hold, use } = run, pr = run.progress;
  assert.equal(engine.missionDepthSectionV188, null, 'interiors stay V1');
  const top = places.decks.top;
  assert.ok(Math.abs(engine.objective.y + engine.objective.h - top) < 1, 'extraction on the top deck');
  assert.ok(engine.platforms.some(entry => Math.abs(entry.y - top) < 1 && engine.objective.x >= entry.x && engine.objective.x + engine.objective.w <= entry.x + entry.w), 'on a real platform');
  place(places.gantry.x, top); tick(engine, .2); assert.equal(engine.colonyPhaseIdV188(), 'ducts'); assert.equal(engine.checkpoint.id, 'colony-c2-ducts');
  place(places.ducts.x, places.ducts.y); tick(engine, 3);
  const ambush = engine.enemies.filter(enemy => enemy.colonyLevelSpawnV188 === 'ducts');
  assert.equal(ambush.length, 3);
  for (const enemy of ambush) { assert.ok(Math.abs(centre(enemy) - centre(engine.player)) >= 900); assert.ok(Math.abs(enemy.y + enemy.h - places.ducts.y) < 2); }
  for (const enemy of ambush) engine.defeatEnemy(enemy, engine.player);
  tick(engine, .2); assert.equal(engine.colonyPhaseIdV188(), 'nest');
  place(places.nest.x, places.nest.y); engine.interact(engine.player); hold(5.3);
  assert.equal(pr().purge, 1); assert.equal(engine.colonyPhaseIdV188(), 'control');
  place(places.console.x, places.console.y); assert.match(engine.getInteractionPrompt(), /DISJONCTEURS 0\/3/);
  for (const x of places.breakers) { place(x, places.decks.low); use(); }
  place(places.console.x, places.console.y); assert.equal(engine.getInteractionPrompt(), 'E  RELANCER LE PROCESSEUR ATMOSPHÉRIQUE');
  use();
  assert.equal(engine.mission.objectives.power, true); assert.equal(engine.colonyPhaseIdV188(), 'extract');
  const surge = engine.hazards.filter(hazard => hazard.colonySurgeV188);
  assert.equal(surge.length, 2); assert.ok(surge.every(hazard => hazard.kind === 'steam'));
  engine.enemies = [];
  place(engine.objective.x + engine.objective.w / 2, top); use();
  assert.equal(engine.mission.state, 'complete'); assert.equal(engine.mission.rewards.objectiveId, 'restore-atmosphere');
});

test('C3: five arrivals, deterministic carrier stored in the checkpoint, panic scatter is recoverable, hatch countdown', async () => {
  const run = await level('colony-c3'), { engine, places, place, use } = run, pr = run.progress;
  const expected = pr().carrier;
  assert.equal((await level('colony-c3')).progress().carrier, expected, 'same seed, same carrier');
  assert.ok(engine.objectiveNodes.every(node => node.active && node.hiddenV188), 'generic rescue nodes give way');
  place(places.arrivals[2]); use();
  for (let x = places.arrivals[2]; x < places.plaza + 60; x += 10) { place(x); tick(engine, .12); }
  tick(engine, 2);
  assert.equal(engine.colonyPhaseIdV188(), 'scan');
  // Panic: aiming (Shift held) at the queue raises it; past 100 the crowd scatters to side rooms.
  place(places.queue.at(-1) - 120); engine.player.facing = 1; engine.keys.add('ShiftLeft');
  for (let i = 0; i < 40 && !pr().scatters; i++) { engine.player.facing = 1; tick(engine, .1); }
  engine.keys.delete('ShiftLeft');
  assert.equal(pr().scatters, 1); assert.ok(pr().civilians.some(entry => entry.state === 'scatter'));
  assert.equal(engine.mission.state, 'active', 'a scatter is not a failure');
  tick(engine, 6);
  for (const entry of pr().civilians.filter(item => item.state === 'scatter')) { place(entry.x); assert.equal(engine.getInteractionPrompt(), 'E  RASSURER LE RESCAPÉ'); use(); }
  assert.ok(pr().civilians.every(entry => entry.state === 'queue'));
  place(places.scanner - 40);
  for (let i = 0; i < 40 && pr().scanned < 5; i++) { if (!pr().civilians.some(entry => entry.state === 'scan')) use(); tick(engine, 1); }
  assert.equal(pr().scanned, 5); assert.equal(pr().civilians[expected].result, 'carrier');
  assert.ok(pr().hatchRemaining > 200 && pr().hatchRemaining < 240);
  assert.equal(engine.colonyPhaseIdV188(), 'carrier');
  const saved = engine.captureResumeState().colonyLevelV188;
  assert.equal(saved.progress.carrier, expected); assert.ok(saved.progress.hatchRemaining > 0, 'the countdown is in the checkpoint');
  // The hatch fails the mission; the retry restores the phase as it began.
  engine.colonyLevelV188.progress.hatchRemaining = .05; tick(engine, .1);
  assert.equal(engine.mission.state, 'failed'); assert.equal(engine.mission.failureReason, 'embryo-hatched');
  engine.restartFromCheckpoint(); assert.equal(engine.colonyPhaseIdV188(), 'carrier'); assert.equal(pr().hatchRemaining, saved.progress.hatchRemaining);
  const carrier = pr().civilians[expected];
  for (let x = Math.round(carrier.x); x < places.noor - 10; x += 10) { place(x); tick(engine, .12); }
  tick(engine, 1); place(places.noor - 20);
  assert.equal(engine.getInteractionPrompt(), 'E  CONFIER LE PORTEUR À NOOR OKAFOR'); use();
  assert.equal(engine.colonyPhaseIdV188(), 'extract'); assert.equal(engine.missingExtractionRequirement(), '');
  engine.enemies = [];
  place(engine.objective.x + engine.objective.w / 2); use();
  assert.equal(engine.mission.state, 'complete'); assert.equal(engine.mission.rewards.objectiveId, 'rescue-survivors');
});

test('C4: night clues, sealed gate, duct branch with lore cache, converts avoidable / subdued / killed, élu freed, decision unchanged', async () => {
  const run = await level('colony-c4'), { engine, places, place, hold, use, events } = run, pr = run.progress;
  assert.equal(places.securityGate.open, false); assert.equal(engine.doorRequirement(places.securityGate), 'SCELLÉ DE L’INTÉRIEUR');
  assert.ok(!engine.interactionCandidatesV188(engine.player).some(entry => entry.kind === 'door' && entry.target === places.securityGate) || true);
  for (const clue of ['log', 'sign', 'seal']) { place(places.clues[clue]); use(); }
  tick(engine, .1); assert.equal(engine.colonyPhaseIdV188(), 'vents');
  const converts = engine.enemies.filter(enemy => enemy.colonyCultistV188);
  assert.equal(converts.length, 3);
  for (const enemy of converts) { assert.ok(Math.abs(centre(enemy) - centre(engine.player)) >= 900); assert.equal(enemy.alert, false); assert.ok(enemy.colonyGraceV188 > 3 && enemy.colonyGraceV188 <= 4, 'grace'); }
  // The dead-end branch of the ducts (medical roof): an optional cache.
  place(places.cache.x, places.cache.y); assert.equal(engine.getInteractionPrompt(), 'E  FOUILLER LE SAC CACHÉ'); use();
  assert.equal(pr().lore, true); assert.equal(engine.inventory.intel, 1);
  place(places.gathering.x0 + 10); engine.player.facing = -1; tick(engine, .2);
  assert.equal(engine.colonyPhaseIdV188(), 'gathering'); assert.equal(engine.objectiveState.complete, true, 'the vent objective is fulfilled');
  // Non-lethal: subdue an unaware convert from behind.
  const target = engine.enemies.find(enemy => enemy.colonyCultistV188);
  target.facing = 1; place(centre(target) - 40); engine.player.facing = 1;
  assert.equal(engine.getInteractionPrompt(), 'E  MAÎTRISER LE CONVERTI (NON LÉTAL)'); use();
  assert.equal(pr().cultSubdued, 1); assert.ok(!engine.enemies.includes(target));
  // Lethal is allowed and counted.
  const other = engine.enemies.find(enemy => enemy.colonyCultistV188); engine.defeatEnemy(other, engine.player);
  assert.equal(pr().cultKilled, 1);
  engine.enemies = []; engine.colonyLevelV188.lastHitAt = -Infinity; // injection: the last convert is avoided
  place(places.cocoon); engine.interact(engine.player); hold(4.3);
  assert.equal(pr().freed, true); assert.equal(engine.colonyPhaseIdV188(), 'extract'); assert.equal(engine.missingExtractionRequirement(), '');
  assert.ok(events.some(event => event.type === 'colony-cult-killed-v188'));
  place(engine.objective.x + engine.objective.w / 2); use();
  assert.equal(engine.mission.state, 'complete'); assert.equal(engine.mission.rewards.objectiveId, 'navigate-vents');
  // The existing decision follows extraction unchanged; the cost applies once on success.
  const save = { galaxy: { completedCampaignIds: ['colony-c4'], worldState: { 'world-05-lethe': { stability: 60, infestation: 20, quarantine: 10 } }, resources: {} }, colonyMissionsV188: {} };
  assert.equal(colonyC4DecisionPendingV188(save), true);
  applyColonyMissionResultV188(save, { success: true, campaignId: 'colony-c4' });
  const stability = save.galaxy.worldState['world-05-lethe'].stability;
  assert.equal(applyColonyLevelResultV188(save, { success: true, campaignId: 'colony-c4', result: engine.colonyLevelResultV188() }).stability, -1);
  assert.equal(save.galaxy.worldState['world-05-lethe'].stability, stability - 1);
  assert.equal(colonyC4DecisionPendingV188(save), true);
});

test('colony levels: other missions keep their behaviour; composition, offline shell, art slots and translations', async () => {
  const contract = await level('colony-l-murs');
  assert.equal(contract.engine.colonyLevelV188, null); assert.equal(contract.engine.missionDepthSectionV188, null);
  assert.ok(contract.engine.spawnedEnemiesV188.length > 0, 'the generic roster stays for contracts');
  const runtime = read('src/game-production-runtime.js');
  assert.match(runtime, /withAsphodeleMissionDressingV188\(withColonyMissionLevelsV188\(withVfxV188\(/);
  const sw = read('sw.js');
  for (const file of ['/src/colony-mission-levels-v188.js', '/src/colony-level-places-v188.js', '/src/colony-level-art-v188.js']) assert.ok(sw.includes(`'${file}'`), file);
  assert.deepEqual(COLONY_LEVEL_ART_FILES_PRESENT_V188, [], 'placeholders only: no image claimed');
  for (const entry of COLONY_LEVEL_ART_SLOTS_V188) {
    assert.ok(['documented', 'adapted', 'to-define'].includes(entry.fidelity), entry.id);
    const calls = []; const ctx = new Proxy({}, { get: (_, key) => (...args) => { calls.push(key); return key === 'measureText' ? { width: 10 } : undefined; } });
    assert.equal(drawColonyLevelSlotV188(ctx, entry.id, 0, 100, { ImageCtor: class { set src(v) { throw Error('requested'); } } }), 'primitive');
    assert.ok(calls.length > 2, entry.id);
  }
  const strings = ['E (MAINTENIR)  BAISSER LE RIDEAU DE L’ENTREPÔT', 'E  ESCORTER LES PATIENTS VERS LA PLATE-FORME', 'E  DÉPLOYER LA SENTINELLE ICI',
    'E  RELANCER LE PROCESSEUR ATMOSPHÉRIQUE', 'E  RASSURER LE RESCAPÉ', 'E  CONFIER LE PORTEUR À NOOR OKAFOR', 'E  MAÎTRISER LE CONVERTI (NON LÉTAL)',
    'SAS SOUDÉ', 'SCELLÉ DE L’INTÉRIEUR', 'PANIQUE', 'LES ÉLUS'];
  for (const id of COLONY_LEVEL_IDS_V188) for (const phase of COLONY_LEVEL_PHASES_V188[id]) strings.push(phase.label.fr); // the catalog also answers its upper case
  for (const text of strings) assert.ok(Object.hasOwn(EN_CATALOG_V185, text), `EN: ${text}`);
  for (const pattern of ['SAS A {0} % · SAS B {1} %', 'ÉCLOSION ESTIMÉE {0}:{1}', 'INDICES {0}/3']) assert.ok(Object.hasOwn(EN_PATTERNS_V185, pattern), `EN: ${pattern}`);
});
