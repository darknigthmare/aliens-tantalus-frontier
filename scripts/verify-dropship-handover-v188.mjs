// V188 in-level dropship handover (src/mission-dropship-handover-v188.js):
// insertion landing/docking, control and grace, skip, extraction boarding with
// the held mission-complete event, resume/retry, and the mission kinds covered.
// Fixture: scripts/engine-host-v188.mjs fixture({ campaign, seed, options, keepEnemies })
// (production GameEngine, browser APIs stubbed). Each mission level is built as the app
// builds it. The handover option is injected in start options, as app.js will pass it.
// Injections are named where they are used.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, tick } from './engine-host-v188.mjs';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS, VEHICLES } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { buildApcConvoyLevelV121 } from '../src/apc-convoy-runtime-v121.js';
import { INSERTION_SAFE_ZONE_V188 } from '../src/insertion-safe-zone-v188.js';
import { dropshipHandoverPolicyV188, buildHandoverPlanV188, DROPSHIP_HANDOVER_SKIPS_V188, apcHandoverAdmissibleV188 } from '../src/mission-dropship-handover-v188.js';
import { LEVEL_DROPSHIP_SLOTS_V188, LEVEL_DROPSHIP_SCALE_V188, UD4L_FRAME_V188 } from '../src/level-dropship-slots-v188.js';

const campaign = id => { const found = CAMPAIGNS.find(entry => entry.id === id); assert.ok(found, id); return found; };
const worldOf = entry => WORLDS.find(world => world.id === entry.worldId) || WORLDS[0];
const handover = (mode = 'foot', placeType = 'atmosphere', short = false) => ({ mode, placeType, dropshipId: 'ud4l', short });
function launchOptions(id, extra = {}) {
  const entry = campaign(id), world = worldOf(entry);
  const missionLevel = id === 'special-apc-convoy' ? buildApcConvoyLevelV121({ campaign: entry, world, levelSeeds: LEVEL_SEEDS })
    : buildMissionLevelV52({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant: 0 });
  return { campaign: entry, seed: missionLevel.levelSeed.seed,
    options: { world, levelSeed: missionLevel.levelSeed, missionLevel, userCasteCampaignV88: !id.startsWith('special-'), operationId: `op-${id}`, ...extra } };
}
const launch = (id, extra = {}, keepEnemies = true) => fixture({ ...launchOptions(id, extra), keepEnemies });
const types = events => events.map(event => event.type);
const pose = actor => ({ x: actor.x, y: actor.y });
// Injection: the objective chain of a generic mission is declared satisfied, so the native
// extraction (completeMission) runs exactly as when the player confirms it with E.
const satisfy = engine => { engine.missingObjectiveRequirement = () => ''; engine.missingExtractionRequirement = () => ''; };

test('slots: one named slot per visual, the project scale, ids distinct from the cinematic module', () => {
  const ids = LEVEL_DROPSHIP_SLOTS_V188.map(entry => entry.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const entry of LEVEL_DROPSHIP_SLOTS_V188) {
    for (const key of ['id', 'purpose', 'width', 'height', 'layer', 'brief']) assert.ok(entry[key] !== undefined && entry[key] !== '', `${entry.id}.${key}`);
    assert.match(entry.id, /^level-/);
  }
  assert.equal(LEVEL_DROPSHIP_SCALE_V188.ud4l.length, 870, '17 m at 51 px/m');
  assert.equal(UD4L_FRAME_V188.length, 870);
  assert.ok(Math.abs(LEVEL_DROPSHIP_SCALE_V188.ud4l.lengthM * LEVEL_DROPSHIP_SCALE_V188.pxPerMetre - 870) < 5);
  assert.equal(LEVEL_DROPSHIP_SLOTS_V188.find(entry => entry.id === 'level-ud4l-hull').reuse, '/assets/openai/hub/props/v139/dropship-hangar-side.png');
});

test('timings: full 8–12 s, short 3–5 s, for landing, docking and boarding', () => {
  for (const name of ['landing', 'docking']) {
    const full = buildHandoverPlanV188(name), short = buildHandoverPlanV188(name, true);
    assert.ok(full.controlAt >= 8 && full.controlAt <= 12, `${name} full ${full.controlAt}`);
    assert.ok(short.controlAt >= 3 && short.controlAt <= 5, `${name} short ${short.controlAt}`);
  }
  for (const name of ['boarding', 'undocking']) {
    const full = buildHandoverPlanV188(name), short = buildHandoverPlanV188(name, true);
    assert.ok(full.total >= 8 && full.total <= 12, `${name} full ${full.total}`);
    assert.ok(short.total >= 3 && short.total <= 5, `${name} short ${short.total}`);
  }
});

test('no option: exactly the old start (no hold, mission time and grace run at once, no new resume key)', async () => {
  const { engine, events } = await launch('pair-001-frontier');
  assert.equal(engine.handoverV188, null);
  assert.equal(engine.handoverConfigV188, null);
  assert.equal(engine.getSnapshot().dropshipHandoverV188, null);
  assert.ok(!('dropshipHandoverV188' in engine.captureResumeState()));
  assert.equal(engine.canPerformGameplayAction(engine.player), true);
  tick(engine, .5);
  assert.ok(Math.abs(engine.mission.elapsed - .5) < 1e-6);
  assert.ok(Math.abs(engine.insertionGraceV188.remaining - (INSERTION_SAFE_ZONE_V188.graceSeconds - .5)) < 1e-6);
  assert.ok(!types(events).some(type => /handover|boarding/.test(type)));
  // And the extraction is not held.
  satisfy(engine); assert.equal(engine.completeMission(engine.player), true);
  assert.deepEqual(types(events).filter(type => /mission-complete|boarding/.test(type)), ['mission-complete']);
});

test('foot insertion: descend, settle, ramp, marines walk down, control at the end; mission time held until then', async () => {
  const { engine, events } = await launch('pair-001-frontier', { insertionHandoverV188: handover('foot') });
  const p = engine.player, final = pose(p), seq = engine.handoverV188;
  assert.equal(seq.kind, 'insertion'); assert.equal(seq.style, 'ship');
  assert.equal(engine.canPerformGameplayAction(p), false, 'no action while held');
  tick(engine, .1);
  assert.ok(engine.handoverHiddenV188(p), 'the marine is aboard during the descent');
  const phases = new Set();
  let seenOnRamp = false;
  while (engine.handoverV188?.blocking) {
    tick(engine, .1); phases.add(engine.getSnapshot().dropshipHandoverV188?.phase);
    if (!engine.handoverHiddenV188(p) && engine.handoverV188?.blocking && Math.abs(p.x - final.x) > 20) seenOnRamp = true;
    if (engine.handoverV188?.blocking) assert.equal(engine.mission.elapsed, 0, 'mission time stands still during the landing');
  }
  for (const id of ['descend', 'settle', 'ramp', 'disembark']) assert.ok(phases.has(id), id);
  assert.ok(seenOnRamp, 'the marine is seen walking down the ramp before reaching the insertion point');
  assert.deepEqual(pose(p), final, 'control is given exactly at the insertion point');
  assert.ok(Math.abs(seq.t - seq.controlAt) < .11, `control at ${seq.t}`);
  assert.equal(engine.canPerformGameplayAction(p), true);
  assert.deepEqual(types(events).filter(type => /handover/.test(type)), ['insertion-handover-started-v188', 'insertion-handover-complete-v188']);
  // The ship lifts off behind the player while the mission runs.
  tick(engine, 1); assert.ok(engine.handoverV188?.ship.lift > 0); assert.ok(engine.mission.elapsed > .9);
  tick(engine, 3); assert.equal(engine.handoverV188, null);
});

test('control is given, then the insertion grace starts counting', async () => {
  const { engine, events } = await launch('pair-001-mire', { insertionHandoverV188: handover('foot', 'atmosphere', true) });
  const seq = engine.handoverV188;
  tick(engine, seq.controlAt - .05);
  assert.equal(engine.insertionGraceV188.remaining, INSERTION_SAFE_ZONE_V188.graceSeconds, 'grace untouched during the landing');
  tick(engine, .1);
  assert.equal(seq.blocking, false);
  tick(engine, 1);
  assert.ok(Math.abs(engine.insertionGraceV188.remaining - (INSERTION_SAFE_ZONE_V188.graceSeconds - 1)) < .12, `${engine.insertionGraceV188.remaining}`);
  tick(engine, 3.2);
  assert.ok(types(events).includes('insertion-grace-ended-v188'));
});

test('enemies cannot move or hit during the landing', async () => {
  const { engine } = await launch('pair-001-mire', { insertionHandoverV188: handover('foot') });
  const p = engine.player;
  // Injection: the first awake patrol is placed 120 px in front of the marine, on his floor.
  const enemy = engine.enemies.find(entry => entry.alive && !entry.dormant);
  for (const other of engine.enemies) if (other !== enemy) other.alive = false;
  Object.assign(enemy, { x: p.x + p.w / 2 + 120 - enemy.w / 2, y: p.y + p.h - enemy.h, vx: 0, vy: 0 });
  enemy.groundY = p.y + p.h; enemy.spawnX = enemy.x; engine.initializeEnemyMissionNavigation(enemy);
  const health = p.health, armor = p.armor ?? 0, x = enemy.x;
  tick(engine, engine.handoverV188.controlAt - .1);
  assert.equal(p.health, health); assert.equal(p.armor ?? 0, armor);
  assert.equal(enemy.x, x, 'the patrol did not close in');
  assert.equal(engine.damagePlayer(p, 30), 0, 'no damage path reaches the marine while held');
});

test('APC insertion (generic): the M577 is lowered from the belly and drives out; the mission vehicle is untouched', async () => {
  // The deployment carries M577 vehicle 001 (as app.js passes options.vehicle) on a planet-exterior level.
  const { engine } = await launch('pair-006-frontier', { vehicle: VEHICLES[0], insertionHandoverV188: handover('apc') });
  assert.equal(engine.handoverConfigV188.mode, 'apc');
  const vehicle = engine.vehicle && { ...engine.vehicle }, p = engine.player, final = pose(p);
  tick(engine, .1);
  const seq = engine.handoverV188;
  assert.ok(seq.apc && !seq.apc.own, 'a transport M577 rides in the belly');
  const disembark = seq.phases.find(entry => entry.id === 'disembark');
  tick(engine, disembark.start + (disembark.end - disembark.start) * .2 - seq.t);
  assert.ok(seq.apc.drop > 0 && seq.apc.drop < 1, 'lowered on the hoist');
  tick(engine, (disembark.end - disembark.start) * .5);
  assert.ok(seq.apc.x > seq.apc.lowerX, 'it drives out');
  tick(engine, seq.controlAt - seq.t + .05);
  assert.equal(seq.blocking, false); assert.deepEqual(pose(p), final); assert.equal(p.inVehicle, false);
  if (vehicle) for (const key of ['x', 'y', 'active', 'occupied']) assert.equal(engine.vehicle[key], vehicle[key], `vehicle.${key}`);
});

test('APC insertion (convoy): the player\'s own M577 is lowered and ends in its seated vehicle state', async () => {
  const { engine } = await launch('special-apc-convoy', { insertionHandoverV188: handover('apc') });
  const vehicle = engine.vehicle, before = { x: vehicle.x, y: vehicle.y };
  assert.equal(engine.player.inVehicle, true);
  tick(engine, .1);
  assert.equal(engine.handoverV188.apc.own, true);
  const disembark = engine.handoverV188.phases.find(entry => entry.id === 'disembark');
  tick(engine, disembark.start + .1 - engine.handoverV188.t);
  assert.ok(vehicle.y < before.y, 'the M577 hangs under the belly');
  tick(engine, 12);
  assert.deepEqual({ x: vehicle.x, y: vehicle.y }, before);
  assert.equal(engine.player.inVehicle, true); assert.equal(vehicle.driver, engine.player);
});

test('cargo-brutal APC insertion: the P-5000 stays where the mission put it', async () => {
  const { engine } = await launch('special-cargo-brutal', { insertionHandoverV188: handover('apc') });
  const vehicle = engine.vehicle && { x: engine.vehicle.x, y: engine.vehicle.y, id: engine.vehicle.id };
  tick(engine, 12);
  assert.equal(engine.handoverV188, null);
  if (vehicle) assert.deepEqual({ x: engine.vehicle.x, y: engine.vehicle.y, id: engine.vehicle.id }, vehicle);
  assert.equal(engine.player.inVehicle, false);
});

test('space insertion: docking collar, seal, hatch cycle, marines step through; no landing', async () => {
  const { engine } = await launch('pair-001-mire', { insertionHandoverV188: handover('foot', 'space') });
  const p = engine.player, final = pose(p), seq = engine.handoverV188;
  assert.equal(seq.style, 'dock');
  tick(engine, .1);
  assert.ok(seq.collar && !seq.ship, 'a collar, no ship');
  const phases = new Set();
  while (seq.blocking) { tick(engine, .1); phases.add(engine.getSnapshot().dropshipHandoverV188?.phase); }
  for (const id of ['seal', 'pressurize', 'hatch', 'step']) assert.ok(phases.has(id), id);
  assert.deepEqual(pose(p), final);
});

test('skip: Enter, E or Escape give control at once (Escape does not pause)', async () => {
  for (const code of ['Enter', 'KeyE', 'Escape']) {
    const { engine, events } = await launch('pair-001-frontier', { insertionHandoverV188: handover('foot') });
    const final = pose(engine.player);
    tick(engine, 2);
    globalThis.dispatchEvent(Object.assign(new Event('keydown'), { code }));
    assert.equal(engine.handoverV188, null, code);
    assert.equal(engine.paused, false, code);
    assert.deepEqual(pose(engine.player), final);
    assert.equal(events.find(event => event.type === 'insertion-handover-complete-v188')?.skipped, true);
    assert.equal(engine.insertionGraceV188.remaining, INSERTION_SAFE_ZONE_V188.graceSeconds);
    tick(engine, .5); assert.ok(engine.mission.elapsed > .4);
  }
});

async function completedRewards(extra) {
  const { engine, events } = await launch('pair-001-frontier', extra, false);
  engine.skipDropshipHandoverV188?.();
  tick(engine, 1); satisfy(engine);
  assert.equal(engine.completeMission(engine.player), true);
  return { engine, events };
}

test('extraction: the boarding holds mission-complete, emits the boarding event once, then the same rewards once', async () => {
  const plain = await completedRewards({});
  const reference = plain.events.find(event => event.type === 'mission-complete');
  const { engine, events } = await completedRewards({ insertionHandoverV188: handover('foot') });
  assert.ok(!types(events).includes('mission-complete'), 'held during the boarding');
  assert.equal(engine.mission.state, 'complete');
  assert.deepEqual(engine.mission.rewards, plain.engine.mission.rewards, 'rewards fixed when the extraction is confirmed');
  const seq = engine.handoverV188;
  assert.equal(seq.kind, 'extraction');
  tick(engine, .1);
  const marine = engine.player, start = pose(marine);
  const phases = new Set();
  while (engine.handoverV188) { tick(engine, .1); phases.add(engine.getSnapshot().dropshipHandoverV188?.phase); }
  for (const id of ['arrive', 'ramp', 'board', 'close']) assert.ok(phases.has(id), id);
  assert.notDeepEqual(pose(marine), start, 'the marine walked to the ramp');
  assert.ok(engine.handoverHiddenV188(marine), 'aboard');
  tick(engine, 5);
  const order = types(events).filter(type => /mission-complete|boarding/.test(type));
  assert.deepEqual(order, ['extraction-boarding-complete-v188', 'mission-complete']);
  const boarding = events.find(event => event.type === 'extraction-boarding-complete-v188');
  assert.equal(boarding.mode, 'foot'); assert.equal(boarding.placeType, 'atmosphere');
  const paid = events.find(event => event.type === 'mission-complete');
  assert.deepEqual(paid.rewards, reference.rewards); assert.equal(paid.kills, reference.kills);
  assert.equal(engine.completeMission(engine.player), false, 'no second completion');
});

test('extraction in space: the docking airlock instead of the ship', async () => {
  const { engine, events } = await completedRewards({ insertionHandoverV188: handover('foot', 'space', true) });
  assert.equal(engine.handoverV188.style, 'dock');
  tick(engine, 6);
  assert.deepEqual(types(events).filter(type => /mission-complete|boarding/.test(type)), ['extraction-boarding-complete-v188', 'mission-complete']);
});

test('extraction skip: Escape finishes the boarding and pays once', async () => {
  const { engine, events } = await completedRewards({ insertionHandoverV188: handover('foot') });
  tick(engine, 1);
  globalThis.dispatchEvent(Object.assign(new Event('keydown'), { code: 'Escape' }));
  tick(engine, 2);
  assert.deepEqual(types(events).filter(type => /mission-complete|boarding/.test(type)), ['extraction-boarding-complete-v188', 'mission-complete']);
});

test('resume mid-landing: control at the insertion point, no replay; retry of the same deployment never lands twice', async () => {
  const setup = launchOptions('pair-001-frontier', { insertionHandoverV188: handover('foot') });
  const { engine } = await fixture({ ...setup, keepEnemies: false });
  const final = pose(engine.player);
  tick(engine, 6.5); // mid-disembark: the marine is on the ramp
  assert.ok(engine.handoverV188.blocking);
  const state = engine.captureResumeState();
  assert.ok(Math.abs(state.player.x - final.x) < 1 && Math.abs(state.player.y - final.y) < 1, 'saved at the landing point, not on the ramp');
  assert.equal(state.dropshipHandoverV188.landed, true);
  const resumed = await fixture({ ...setup, keepEnemies: false, options: { ...setup.options, resumeState: state } });
  assert.equal(resumed.engine.lastResumeResult?.applied, true);
  assert.equal(resumed.engine.handoverV188, null, 'the landing is not replayed');
  // Retry: the same engine restarted for the same deployment.
  engine.start({ ...setup.options, campaign: setup.campaign, seed: setup.seed, world: setup.options.world,
    weapon: (await import('../src/content-core-v50.js')).WEAPONS[0], enemyCatalog: [], equipment: [], crew: [] });
  assert.equal(engine.handoverV188, null, 'retry does not land again');
  // A checkpoint restart after a failure does not land either.
  engine.failMission('test'); engine.restartFromCheckpoint();
  assert.equal(engine.handoverV188, null);
});

test('resume mid-boarding: the boarding finishes and pays once, with the held rewards', async () => {
  const setup = launchOptions('pair-001-frontier', { insertionHandoverV188: handover('foot') });
  const first = await fixture({ ...setup, keepEnemies: false });
  first.engine.skipDropshipHandoverV188(); tick(first.engine, 1); satisfy(first.engine);
  first.engine.completeMission(first.engine.player);
  tick(first.engine, 5.5); // mid-boarding
  assert.equal(first.engine.handoverV188?.kind, 'extraction');
  const rewards = structuredClone(first.engine.mission.rewards);
  const state = first.engine.captureResumeState();
  assert.equal(state.mission.state, 'complete');
  assert.ok(state.dropshipHandoverV188.boarding?.event, 'the held event travels with the resume record');
  // The resumed launch may come from the old flow (no option): the owed boarding still ends.
  const { insertionHandoverV188, ...oldFlow } = setup.options;
  const resumed = await fixture({ ...setup, keepEnemies: false, options: { ...oldFlow, resumeState: JSON.parse(JSON.stringify(state)) } });
  assert.equal(resumed.engine.handoverV188?.kind, 'extraction');
  tick(resumed.engine, 12);
  const paid = resumed.events.filter(event => event.type === 'mission-complete');
  assert.equal(paid.length, 1); assert.deepEqual(paid[0].rewards, rewards);
  assert.equal(resumed.events.filter(event => event.type === 'extraction-boarding-complete-v188').length, 1);
});

test('mission kinds: covered or skipped with a reason', () => {
  const policy = id => dropshipHandoverPolicyV188({ campaign: { id }, missionLevel: {}, insertionHandoverV188: handover() });
  for (const id of ['pair-001-frontier', 'special-cargo-brutal', 'special-apc-convoy', 'special-alien-survival-systems', 'special-alpha-bravo-doctrine',
    'special-c12-horde', 'special-queen-mother-v131', 'special-hive-world-v131', 'special-pangaea-v131', 'special-jeri-v131', 'special-atax-v131', 'special-eloise-v131'])
    assert.deepEqual([policy(id).insertion, policy(id).extraction], [true, true], id);
  for (const id of ['special-narrative-qz17', 'special-archive-relay', 'special-black-cocoon']) {
    assert.equal(policy(id).insertion, false, id); assert.equal(policy(id).extraction, true, id);
    assert.ok(DROPSHIP_HANDOVER_SKIPS_V188.insertion[id]);
  }
  for (const id of ['special-titan-v131', 'special-z110-v131', 'special-nostromo-v131', 'special-black-abyss-v131', 'special-broodstorm-v131'])
    assert.deepEqual([policy(id).insertion, policy(id).extraction], [false, false], id);
  assert.equal(dropshipHandoverPolicyV188({ campaign: { id: 'pair-001-frontier' }, missionLevel: {}, editorProject: { kind: 'mission' }, insertionHandoverV188: handover() }), null, 'Forge');
  assert.equal(dropshipHandoverPolicyV188({ campaign: { id: 'pair-001-frontier' }, missionLevel: {} }), null, 'no option');
});

test('QZ-17 keeps its authored insertion and encounters with the option present', async () => {
  const { engine } = await launch('special-narrative-qz17', { insertionHandoverV188: handover('foot') });
  assert.equal(engine.handoverV188, null);
  assert.ok(engine.missionDepthSectionV188, 'the QZ-17 hold section still builds');
  tick(engine, .5); assert.ok(engine.mission.elapsed > .4);
});

test('Jeri infiltrates alone: only Jeri walks down the ramp', async () => {
  const { buildHiveMissionV131 } = await import('../src/hive-missions-v131.js');
  const entry = campaign('special-jeri-v131'), world = worldOf(entry);
  const missionLevel = buildHiveMissionV131({ campaign: entry, world, levelSeeds: LEVEL_SEEDS });
  const { engine } = await fixture({ campaign: entry, seed: missionLevel.levelSeed?.seed || 7,
    options: { world, levelSeed: missionLevel.levelSeed, missionLevel, insertionHandoverV188: handover('foot', 'atmosphere', true) } });
  tick(engine, .1);
  assert.deepEqual(engine.handoverV188.actors.map(entry => entry.actor), [engine.player]);
  tick(engine, 5); assert.equal(engine.handoverV188?.blocking ?? false, false);
});

test('composition: outermost mission layer, guard in canPerformGameplayAction, sw.js admission', () => {
  const source = readFileSync(new URL('../src/game-production-runtime.js', import.meta.url), 'utf8');
  assert.match(source, /extends withMissionDropshipHandoverV188\(withMissionDepthRoomsV188\(/);
  assert.match(source, /!this\.dropshipHandoverBlocksV188\?\.\(\)/);
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  for (const path of ['/src/mission-dropship-handover-v188.js', '/src/level-dropship-slots-v188.js']) assert.ok(sw.includes(`'${path}'`), path);
});

// Every covered mission kind runs its landing and boarding on the production composition.
// Injection for the boarding: mission.state is set to 'complete' and a terminal event is
// emitted through engine.onEvent, as each mode's own completeMission does (their objective
// chains are covered by their own suites).
const BUILDERS = {
  'special-c12-horde': () => import('../src/c12-horde-runtime-v121.js').then(m => m.buildC12HordeLevelV121),
  'special-black-cocoon': () => import('../src/black-cocoon-runtime-v121.js').then(m => m.buildBlackCocoonLevelV121),
  'special-archive-relay': () => import('../src/archive-relay-runtime-v122.js').then(m => m.buildArchiveRelayLevelV122),
  'special-apc-convoy': async () => buildApcConvoyLevelV121,
  'special-queen-mother-v131': () => import('../src/ecosystem-missions-v131.js').then(m => m.buildEcosystemMissionV131),
  'special-eloise-v131': () => import('../src/hive-missions-v131.js').then(m => m.buildHiveMissionV131)
};
const KINDS = [['pair-001-mire', 'foot', 'space'], ['pair-001-frontier', 'foot', 'atmosphere'], ['pair-004-frontier', 'foot', 'airless'],
  ['pair-005-frontier', 'apc', 'atmosphere'], ['special-cargo-brutal', 'foot', 'space'], ['special-alien-survival-systems', 'foot', 'space'],
  ['special-alpha-bravo-doctrine', 'foot', 'atmosphere'], ['special-c12-horde', 'foot', 'space'], ['special-apc-convoy', 'apc', 'atmosphere'],
  ['special-black-cocoon', 'foot', 'atmosphere'], ['special-archive-relay', 'foot', 'space'], ['special-queen-mother-v131', 'foot', 'atmosphere'],
  ['special-eloise-v131', 'foot', 'atmosphere']];
for (const [id, mode, placeType] of KINDS) test(`${id} (${mode}, ${placeType}): landing then boarding on the production engine`, async () => {
  const entry = campaign(id), world = worldOf(entry), build = BUILDERS[id] ? await BUILDERS[id]() : null;
  const missionLevel = build ? build({ campaign: entry, world, levelSeeds: LEVEL_SEEDS }) : buildMissionLevelV52({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant: 0 });
  const { engine, events } = await fixture({ campaign: entry, seed: missionLevel.levelSeed?.seed || 7, keepEnemies: true,
    options: { world, levelSeed: missionLevel.levelSeed, missionLevel, operationId: `op-${id}`, insertionHandoverV188: handover(mode, placeType, true) } });
  const policy = dropshipHandoverPolicyV188({ campaign: entry, missionLevel, insertionHandoverV188: handover(mode, placeType) });
  assert.equal(Boolean(engine.handoverV188), policy.insertion, 'insertion staged only where covered');
  for (let n = 0; n < 6 && engine.handoverV188; n++) { tick(engine, 1); engine.draw(); }
  assert.equal(engine.handoverV188, null);
  assert.equal(engine.mission.state, 'active');
  engine.mission.state = 'complete';
  engine.onEvent({ type: 'mission-complete', rewards: { credits: 1 }, injected: true });
  assert.equal(Boolean(engine.handoverV188), policy.extraction);
  for (let n = 0; n < 6 && engine.handoverV188; n++) { tick(engine, 1); engine.draw(); }
  assert.deepEqual(types(events).filter(type => /mission-complete|boarding/.test(type)),
    policy.extraction ? ['extraction-boarding-complete-v188', 'mission-complete'] : ['mission-complete']);
});

test('APC rule: carried only for vehicle 001/002 on colony-multiroute or planet-exterior, never in space; otherwise on foot', async () => {
  assert.equal(apcHandoverAdmissibleV188({ placeType: 'atmosphere', templateId: 'planet-exterior', vehicleId: 'vehicle-002-m577-command-apc' }), true);
  assert.equal(apcHandoverAdmissibleV188({ placeType: 'space', templateId: 'colony-multiroute', vehicleId: VEHICLES[0].id }), false);
  assert.equal(apcHandoverAdmissibleV188({ placeType: 'atmosphere', templateId: 'ship-interior-vertical', vehicleId: VEHICLES[0].id }), false);
  assert.equal(apcHandoverAdmissibleV188({ placeType: 'atmosphere', templateId: 'colony-multiroute', vehicleId: 'vehicle-003-m570-armored-personnel-carrier' }), false);
  const noVehicle = await launch('pair-006-frontier', { insertionHandoverV188: handover('apc') });
  assert.equal(noVehicle.engine.handoverConfigV188.mode, 'foot'); assert.equal(noVehicle.engine.handoverConfigV188.requestedMode, 'apc');
  tick(noVehicle.engine, .1); assert.equal(noVehicle.engine.handoverV188.apc, undefined, 'no M577 in the belly');
  const space = await launch('pair-006-frontier', { vehicle: VEHICLES[0], insertionHandoverV188: handover('apc', 'space') });
  assert.equal(space.engine.handoverConfigV188.mode, 'foot'); assert.equal(space.engine.handoverV188.style, 'dock');
});

test('render suspend hook: draw() is skipped while the app shows its own cinematic', async () => {
  const { engine, text, draws } = await launch('pair-001-frontier', { insertionHandoverV188: handover('foot') });
  tick(engine, 1);
  engine.setRenderSuspendedV188(true);
  const before = text.length + draws.length;
  engine.draw();
  assert.equal(text.length + draws.length, before, 'nothing drawn');
  engine.setRenderSuspendedV188(false); engine.draw();
  assert.ok(text.length + draws.length > before);
});
