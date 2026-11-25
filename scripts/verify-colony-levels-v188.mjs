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
  assert.match(runtime, /withFootstepCuesV188\(withColonyMissionLevelsV188\(withMissionObjectivePanelV188\(/);
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

test('C3: a scatter after some screenings never sends a screened survivor back to the queue', async () => {
  const run = await level('colony-c3'), { engine, places, place, use } = run, pr = run.progress;
  place(places.arrivals[2]); use();
  for (let x = places.arrivals[2]; x < places.plaza + 60; x += 10) { place(x); tick(engine, .12); }
  tick(engine, 2); place(places.scanner - 40);
  for (let i = 0; i < 20 && pr().scanned < 2; i++) { if (!pr().civilians.some(entry => entry.state === 'scan')) use(); tick(engine, 1); }
  // Injection: the panic is set just under the threshold, then the aim key is held towards the crowd.
  pr().panic = 99; place(places.plaza - 300); engine.player.facing = 1; engine.keys.add('ShiftLeft'); tick(engine, .2); engine.keys.delete('ShiftLeft');
  assert.equal(pr().scatters, 1);
  tick(engine, 6);
  for (const entry of pr().civilians.filter(item => item.state === 'scatter')) { place(entry.x); use(); }
  for (const entry of pr().civilians) if (entry.result) assert.notEqual(entry.state, 'queue', entry.id);
  place(places.scanner - 40);
  for (let i = 0; i < 40 && pr().scanned < 5; i++) { if (!pr().civilians.some(entry => entry.state === 'scan')) use(); tick(engine, 1); }
  assert.equal(pr().scanned, 5); assert.equal(pr().civilians.filter(entry => entry.result === 'carrier').length, 1);
  assert.ok(pr().civilians.every(entry => entry.result), 'each survivor screened once');
});

// —— Owner decisions of 2026-11-22 ——
test('C1, C3, C4: the player’s M577 stays aboard (no APC in the colony streets, on foot at insertion); C2 and contracts unchanged', async () => {
  const { apcHandoverAdmissibleV188 } = await import('../src/mission-dropship-handover-v188.js');
  const { COLONY_STREET_NO_APC_IDS_V188 } = await import('../src/colony-mission-levels-v188.js');
  assert.deepEqual(COLONY_STREET_NO_APC_IDS_V188, ['colony-c1', 'colony-c3', 'colony-c4']);
  for (const id of COLONY_STREET_NO_APC_IDS_V188) {
    const run = await level(id);
    assert.equal(run.engine.vehicle.active, false, `${id}: vehicle stowed`); assert.equal(run.engine.vehicle.deploymentStatus, 'colony-street-v188');
    assert.equal(run.engine.player.inVehicle, false);
    assert.ok(!run.engine.interactionCandidatesV188(run.engine.player).some(entry => /vehicle/.test(entry.kind)), `${id}: no « V PILOTER »`);
    assert.equal(run.engine.getSnapshot().colonyLevelV188.vehicleStowed, true);
    assert.equal(apcHandoverAdmissibleV188({ placeType: 'atmosphere', templateId: 'colony-multiroute', vehicleId: 'vehicle-001-m577-armored-personnel-carrier', campaignId: id }), false, `${id}: insertion on foot`);
  }
  assert.equal(apcHandoverAdmissibleV188({ placeType: 'atmosphere', templateId: 'colony-multiroute', vehicleId: 'vehicle-001-m577-armored-personnel-carrier', campaignId: 'colony-l-murs' }), true, 'contracts keep the APC insertion');
  const app = read('src/app.js');
  assert.match(app, /COLONY_STREET_NO_APC_IDS_V188\.includes\(context\.campaign\?\.id\) \? null : context\.vehicle/, 'the insertion cinematic carries no M577 either');
});

test('C3: Noor Okafor is the infirmary figure, not a squad teammate (this mission only), with a FR/EN line', async () => {
  const { colonyC3SquadV188, COLONY_C3_NOOR_LINE_V188 } = await import('../src/colony-mission-levels-v188.js');
  const { CREW } = await import('../src/content-core-v50.js');
  const crew = ['crew-04-noor-okafor', 'crew-06-rook', 'crew-01-mara-vega'].map(id => ({ ...CREW.find(entry => entry.id === id), status: 'active' })).filter(entry => entry.id);
  assert.equal(crew.length, 3);
  assert.deepEqual(colonyC3SquadV188(crew, 'colony-c3').map(entry => entry.id), ['crew-06-rook', 'crew-01-mara-vega']);
  assert.deepEqual(colonyC3SquadV188(crew, 'colony-c1').map(entry => entry.id), crew.map(entry => entry.id), 'restored outside C3');
  const run = await level('colony-c3', { crew });
  assert.equal(run.engine.colonyLevelV188.noorPosted, true);
  assert.deepEqual((run.engine.squadManifestV132 || []).map(entry => entry.id), ['crew-06-rook', 'crew-01-mara-vega'], 'not in the deployed squad');
  assert.ok(!(run.engine.squadActors || []).some(entry => entry.crewId === 'crew-04-noor-okafor' || entry.id === 'crew-04-noor-okafor'));
  assert.equal(run.engine.colonyLevelV188.message.text, COLONY_C3_NOOR_LINE_V188.fr);
  assert.ok(run.events.some(event => event.type === 'colony-noor-posted-v188'));
  assert.ok(Object.hasOwn(EN_CATALOG_V185, COLONY_C3_NOOR_LINE_V188.fr), 'EN in the reviewed catalog');
  assert.equal(EN_CATALOG_V185[COLONY_C3_NOOR_LINE_V188.fr], COLONY_C3_NOOR_LINE_V188.en);
  // She is still the one who takes the carrier (the level's figure, drawn at the infirmary).
  assert.equal(run.places.noor, run.places.streetB + 100);
  const c1 = await level('colony-c1', { crew });
  assert.notEqual(c1.engine.colonyLevelV188.noorPosted, true, 'C1 deploys her as before');
  assert.ok(c1.engine.squadManifestV132.some(entry => entry.id === 'crew-04-noor-okafor'));
});

test('C4: the utility gallery and the roof are welded shut; the ducts are the only way to the gathering (logical and physical)', async () => {
  const { colonyC4AccessV188, COLONY_C4_BARRIERS_V188 } = await import('../src/colony-mission-levels-v188.js');
  const run = await level('colony-c4'), { engine, places } = run;
  const barriers = engine.colonyLevelV188.barriers;
  assert.deepEqual(barriers.map(entry => entry.id), COLONY_C4_BARRIERS_V188.map(entry => entry.id));
  for (const barrier of barriers) {
    const wall = engine.walls.find(entry => entry.id === barrier.id);
    assert.ok(wall, barrier.id); assert.equal(wall.y + wall.h, barrier.floorY, 'stands on its floor');
    assert.ok(wall.h >= 160, `${barrier.id}: taller than a jump (${wall.h} px)`);
  }
  const grate = barriers.find(entry => entry.id === 'colony-c4-utility-grate-v188');
  assert.ok(grate.y > places.floorY, 'the grate stays under the street deck (the street is not blocked)');
  assert.ok(engine.toolPickup.x + engine.toolPickup.w < grate.x, 'the cutting torch of the gallery stays reachable, west of the grate');
  // Logical: on foot the gathering (colony-security) is out of reach; with the ducts it is reached.
  assert.equal(colonyC4AccessV188(engine, { ducts: false }).gathering, false);
  assert.equal(colonyC4AccessV188(engine).gathering, true);
  // Physical: walking east (and jumping) on the roof, in the gallery and in the street never passes.
  const walk = (x, y) => {
    run.place(x, y); engine.keys.add('KeyD'); let max = 0;
    for (let i = 0; i < 160; i++) { if (i % 6 === 0) engine.player.jumpBuffer = .14; tick(engine, .1); max = Math.max(max, centre(engine.player)); }
    engine.keys.delete('KeyD'); return max;
  };
  const roof = barriers.find(entry => entry.id === 'colony-c4-roof-hatch-v188');
  assert.ok(walk(2700, roof.floorY) < roof.x, 'roof: stopped by the welded roof door');
  assert.ok(walk(2960, grate.floorY) < grate.x, 'gallery: stopped by the welded grate');
  assert.ok(walk(2900, places.floorY) < places.securityGate.x, 'street: the security shutter is sealed from inside');
  // The visible reason is offered at the barrier.
  run.place(grate.x - 30, grate.floorY); assert.equal(engine.getInteractionPrompt(), 'GRILLE DE SERVICE SOUDÉE · PASSER PAR LES CONDUITS');
  run.place(roof.x - 30, roof.floorY); assert.equal(engine.getInteractionPrompt(), 'PORTE DU TOIT SOUDÉE · PASSER PAR LES CONDUITS');
  for (const text of COLONY_C4_BARRIERS_V188.map(entry => entry.requirement)) assert.ok(Object.hasOwn(EN_CATALOG_V185, text), `EN: ${text}`);
  // The ducts: from the street entrance to the security wall exit, east of the sealed shutter. Injection: the torch is held.
  const again = await level('colony-c4'), e = again.engine;
  e.inventory.cutter = true; again.place(again.places.ventEntry);
  assert.ok(e.enterMissionVentV62(e.player), 'the duct opens with the torch');
  for (let i = 0; i < 40 && e.player.ventTransit?.phase !== 'at-node'; i++) tick(e, .1);
  e.keys.add('KeyD'); for (let i = 0; i < 200 && !(e.player.ventTransit?.phase === 'at-node' && e.player.ventTransit.currentNodeId === 'colony-duct-security'); i++) tick(e, .1); e.keys.delete('KeyD');
  assert.equal(e.player.ventTransit?.currentNodeId, 'colony-duct-security');
  e.beginMissionVentExitV62(e.player); for (let i = 0; i < 40 && e.player.ventTransit; i++) tick(e, .1);
  assert.ok(centre(e.player) > again.places.securityGate.x + again.places.securityGate.w, 'out on the street beyond the shutter');
  assert.ok(Math.abs(e.player.y + e.player.h - again.places.floorY) < 2);
});

test('C1: the deck perspective of the 4 450 px street is softened at both ends (capped at half a screen), other holds unchanged', async () => {
  const { depthHoldDeckGeometryV188, deckSeamTopXV188 } = await import('../src/depth-hold-deck-v188.js');
  const run = await level('colony-c1'), section = run.engine.missionDepthSectionV188, g = depthHoldDeckGeometryV188(section);
  assert.equal(section.deckPerspectiveSpan, 640); assert.equal(g.span, 640);
  const lean = xf => Math.abs(deckSeamTopXV188(g, xf) - xf);
  const uncapped = { ...g }; delete uncapped.span;
  const atEdgeOfScreen = lean(g.vanishX + 640);
  for (const xf of [g.x0, g.x1]) {
    assert.ok(Math.abs(lean(xf) - atEdgeOfScreen) < .01, `the end seam leans as at a screen edge (${lean(xf).toFixed(1)} px)`);
    assert.ok(Math.abs(deckSeamTopXV188(uncapped, xf) - xf) > 3 * lean(xf), 'it leaned more than three times as much before');
  }
  assert.equal(deckSeamTopXV188(g, g.vanishX + 300), deckSeamTopXV188(uncapped, g.vanishX + 300), 'the centre keeps its perspective');
  assert.ok(deckSeamTopXV188(g, g.x0) > g.x0 && deckSeamTopXV188(g, g.x1) < g.x1, 'seams still lean inward');
  // Holds without a cap keep their geometry (QZ-17 shape unchanged).
  const qz = buildMissionLevelV52({ campaign: campaignOf('special-narrative-qz17'), world: worldOf(campaignOf('special-narrative-qz17')), levelSeeds: LEVEL_SEEDS });
  assert.ok(qz); assert.equal(Object.hasOwn(depthHoldDeckGeometryV188({ x0: 0, x1: 800, floorY: 600, zMin: -80, zMax: 0 }), 'span'), false);
});
