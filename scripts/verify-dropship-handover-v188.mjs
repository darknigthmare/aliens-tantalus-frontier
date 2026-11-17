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
import { fixture, prepare, tick } from './engine-host-v188.mjs';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS, VEHICLES, WEAPONS, ENEMIES } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { buildApcConvoyLevelV121 } from '../src/apc-convoy-runtime-v121.js';
import { buildLegacyMissionV131 } from '../src/legacy-operations-v131.js';
import { LEGACY_STATIONS_V131 } from '../src/legacy-operation-state-v131.js';
import { createDefaultSave, beginOperation, recordOperationResumeState, resolveOperation } from '../src/save.js';
import { INSERTION_SAFE_ZONE_V188 } from '../src/insertion-safe-zone-v188.js';
import { dropshipHandoverPolicyV188, buildHandoverPlanV188, DROPSHIP_HANDOVER_SKIPS_V188, apcHandoverAdmissibleV188 } from '../src/mission-dropship-handover-v188.js';
import { LEVEL_DROPSHIP_SLOTS_V188, LEVEL_DROPSHIP_SCALE_V188, UD4L_FRAME_V188, ud4lToWorldV188 } from '../src/level-dropship-slots-v188.js';

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
  const drawnEnd = pose(marine), terminal = engine.captureResumeState();
  assert.deepEqual(pose(terminal.player), start, 'the terminal checkpoint keeps the native pre-boarding pose');
  assert.deepEqual(pose(marine), drawnEnd, 'capturing does not move the marine back into the rendered level');
  assert.equal(terminal.dropshipHandoverV188.boarding, null, 'the paid event is not retained in a completed checkpoint');
  assert.equal(terminal.dropshipHandoverV188.extracted, true);
  tick(engine, 5);
  const order = types(events).filter(type => /mission-complete|boarding/.test(type));
  assert.deepEqual(order, ['extraction-boarding-complete-v188', 'mission-complete']);
  const boarding = events.find(event => event.type === 'extraction-boarding-complete-v188');
  assert.equal(boarding.mode, 'foot'); assert.equal(boarding.placeType, 'atmosphere');
  const paid = events.find(event => event.type === 'mission-complete');
  assert.deepEqual(paid.rewards, reference.rewards); assert.equal(paid.kills, reference.kills);
  assert.equal(engine.completeMission(engine.player), false, 'no second completion');
});

// V188 gameplay gaps: the boarding is a defended moment (DEFENDED_BOARDING_V188, [PROPOSÉ]).
test('defended boarding: enemies keep moving and hitting, the chin gun hits them, marines are hurt but never die; paid once, resumable', async () => {
  const { engine, events } = await completedRewards({ insertionHandoverV188: handover('foot') });
  const p = engine.player;
  tick(engine, .1); // the boarding resolves its ship and actors
  // Injection: one awake patrol on the landing zone, 300 px in front of the dropship's nose (the marines'
  // path to the ramp), ready to attack; the marine at 40 health.
  const seq = engine.handoverV188, nose = ud4lToWorldV188(seq.ship, UD4L_FRAME_V188.chinGun);
  const enemy = engine.spawnedEnemiesV188.find(entry => entry.behavior !== 'spitter' && entry.behavior !== 'shooter' && entry.h >= 70);
  Object.assign(enemy, { alive: true, dormant: false, x: nose.x - seq.ship.dir * 300 - enemy.w / 2, y: seq.groundY - enemy.h, vx: 0, vy: 0, health: 4000, maxHealth: 4000, alert: true, attackClock: 0, rearEntryV130: null });
  enemy.spawnX = enemy.x; engine.initializeEnemyMissionNavigation(enemy); engine.enemies = [enemy];
  p.health = 40;
  const x = enemy.x, lowest = { health: p.health };
  while (engine.handoverV188) { tick(engine, 1 / 30); lowest.health = Math.min(lowest.health, p.health); }
  assert.notEqual(enemy.x, x, 'the patrol moved during the boarding');
  assert.ok(enemy.health < 4000, 'the chin turret / covering fire hit it');
  assert.ok(events.some(event => event.type === 'dropship-covering-hit-v188'), 'presentation hook emitted');
  assert.ok(lowest.health >= 1 && p.alive !== false, `the marine never died (lowest ${lowest.health})`);
  assert.equal(events.filter(event => event.type === 'mission-complete').length, 1, 'paid once');
  assert.ok(!events.some(event => event.type === 'mission-failed' || event.type === 'player-down'), 'no casualty event during the boarding');
  // Resume mid-boarding still pays once (the hostile simulation does not replay the completion).
  const second = await completedRewards({ insertionHandoverV188: handover('foot') });
  tick(second.engine, 4);
  const state = JSON.parse(JSON.stringify(second.engine.captureResumeState()));
  const setup = launchOptions('pair-001-frontier', { insertionHandoverV188: handover('foot') });
  const resumed = await fixture({ ...setup, keepEnemies: true, options: { ...setup.options, resumeState: state } });
  tick(resumed.engine, 12);
  assert.equal(resumed.events.filter(event => event.type === 'mission-complete').length, 1);
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

// Controlled preterminal fixture, derived from the CI convoy checkpoint on
// da8b29fa: 20 kills, intact hull, both Crushers/Queen cleared, one runner with
// 79.116 HP at x678.069. Only that starting situation is assigned. E confirms
// extraction, the real dropship damages/kills the native-spawned runner, and the
// resulting terminal capture is submitted to the unmodified Save validator.
async function convoyBoardingAccountingFixture(t, { survivor = true } = {}) {
  const entry = campaign('special-apc-convoy'), save = createDefaultSave();
  const operation = beginOperation(save, entry, worldOf(entry)).operation;
  const setup = launchOptions(entry.id, { operationId: operation.id, seed: 2360543200, insertionHandoverV188: handover('foot') });
  const subject = await fixture({ ...setup, keepEnemies: true }), engine = subject.engine;
  t.after(() => engine.stop());
  engine.skipDropshipHandoverV188(); engine.interact();
  Object.assign(engine.apcConvoyV121, { distance: 3200, elapsed: 93.47940000000659,
    crushersDefeated: [true, true], queenDefeated: true, stageBossId: null });
  Object.assign(engine.apcCourseStateV131, { kills: 20, totalDistance: 3200, score: 5700 });
  engine.player.kills = 20; engine.mission.elapsed = 93.47940000000659;
  const runner = survivor ? engine.apcConvoySpawnV121('enemy-006-runner', 'horde') : null;
  if (runner) Object.assign(runner, { x: 678.0690624999985, health: 79.116, dormant: false, alert: true });
  engine.syncApcConvoyWorldV121();
  engine.keys.add('KeyE'); tick(engine, 3.05); engine.keys.clear();
  assert.equal(engine.mission.state, 'complete');
  assert.equal(engine.handoverV188?.kind, 'extraction');
  assert.equal(engine.player.kills, 20); assert.equal(engine.apcCourseStateV131.kills, 20);
  assert.equal(engine.mission.rewards.credits, 1300); assert.equal(engine.vehicle.hull, 340);
  if (runner) assert.equal(runner.alive, true);
  assert.equal(subject.events.filter(event => event.type === 'mission-complete').length, 0);
  return { ...subject, save, setup, runner, seq: engine.handoverV188 };
}

function finishNativeBoardingKill(subject) {
  const { engine, runner } = subject;
  for (let frame = 0; frame < 12 * 60 && runner.alive && engine.handoverV188; frame++) tick(engine, 1 / 60);
  assert.equal(runner.alive, false, 'the production covering fire killed the remaining runner');
  assert.equal(engine.player.kills, 21); assert.equal(engine.apcCourseStateV131.kills, 21);
  assert.equal(engine.vehicle.hull, 340);
  assert.equal(engine.handoverV188?.kind, 'extraction', 'the kill precedes the terminal callback');
}

function payRecordedConvoy(subject, event) {
  const terminal = subject.engine.captureResumeState();
  assert.equal(subject.engine.validateApcConvoyResumeV121(terminal).valid, true);
  assert.equal(recordOperationResumeState(subject.save, terminal), true);
  return resolveOperation(subject.save, { success: true, rewards: event.rewards });
}

test('APC boarding finalization: the real 20→21 kill pays 1300→1310 before the presentation callback pauses', async t => {
  const subject = await convoyBoardingAccountingFixture(t), { engine, events, seq } = subject;
  let outcome, presentation;
  const sink = engine.handoverSinkV188;
  engine.handoverSinkV188 = event => {
    if (event.type === 'extraction-boarding-complete-v188') {
      presentation = { mission: structuredClone(engine.mission.rewards), state: structuredClone(engine.apcConvoyV121.rewards),
        event: structuredClone(seq.event), kills: engine.player.kills };
      engine.paused = true; // The real app pauses here to play the ascent cinematic.
    }
    if (event.type === 'mission-complete') outcome = payRecordedConvoy(subject, event);
    return sink(event);
  };
  tick(engine, 12);
  assert.equal(subject.runner.alive, false);
  assert.equal(engine.player.kills, 21); assert.equal(engine.apcCourseStateV131.kills, 21);
  assert.equal(outcome?.ok, true, JSON.stringify({ outcome, presentation }));
  assert.equal(presentation.kills, 21);
  for (const rewards of [presentation.mission, presentation.state, presentation.event.rewards]) assert.equal(rewards.credits, 1310);
  assert.equal(presentation.event.kills, 21);
  assert.deepEqual(types(events).filter(type => /mission-complete|boarding/.test(type)),
    ['extraction-boarding-complete-v188', 'mission-complete']);
  assert.equal(subject.save.strategy.lastOperation.missionRewardsV121.credits, 1310);
  assert.equal(subject.save.strategy.lastOperation.apcCourseResultV131.kills, 21);
});

test('APC boarding finalization: unchanged battle keeps the canonical reward and stale completion cannot emit twice', async t => {
  const subject = await convoyBoardingAccountingFixture(t, { survivor: false }), { engine, events, seq } = subject;
  const original = structuredClone(engine.mission.rewards);
  tick(engine, 12);
  const completion = events.find(event => event.type === 'mission-complete');
  assert.equal(engine.player.kills, 20); assert.deepEqual(completion.rewards, original);
  assert.equal(payRecordedConvoy(subject, completion).ok, true);
  const paid = structuredClone(subject.save), count = events.length;
  assert.equal(engine.finishBoardingV188(seq, false), false, 'a stale sequence is no longer owed');
  assert.equal(events.length, count, 'neither presentation nor terminal event is repeated');
  assert.equal(resolveOperation(subject.save, { success: true, rewards: completion.rewards }).ok, false);
  assert.deepEqual(subject.save, paid);
});

test('APC boarding finalization: a real mid-boarding save resumes without the new launch option and pays current kills once', async t => {
  const subject = await convoyBoardingAccountingFixture(t);
  finishNativeBoardingKill(subject);
  assert.equal(recordOperationResumeState(subject.save, subject.engine.captureResumeState()), true);
  const state = JSON.parse(JSON.stringify(subject.save.strategy.currentOperation.resumeState));
  assert.equal(state.player.kills, 21); assert.equal(state.apcCourseV131.kills, 21);
  assert.equal(state.dropshipHandoverV188.boarding.event.rewards.credits, 1300, 'the pending event remains provisional until boarding ends');
  subject.engine.stop();
  const { insertionHandoverV188, ...oldFlow } = subject.setup.options;
  const resumed = await fixture({ ...subject.setup, keepEnemies: true, options: { ...oldFlow, resumeState: state } });
  t.after(() => resumed.engine.stop());
  assert.equal(resumed.engine.lastResumeResult?.applied, true);
  assert.equal(resumed.engine.handoverV188?.kind, 'extraction');
  tick(resumed.engine, 12);
  const completion = resumed.events.filter(event => event.type === 'mission-complete');
  assert.equal(completion.length, 1); assert.equal(completion[0].kills, 21);
  assert.equal(completion[0].rewards.credits, 1310);
  assert.equal(payRecordedConvoy({ ...resumed, save: subject.save }, completion[0]).ok, true);
  const terminal = resumed.engine.captureResumeState();
  assert.equal(terminal.dropshipHandoverV188.boarding, null);
  assert.equal(terminal.dropshipHandoverV188.extracted, true);
  assert.equal(resumed.engine.completeMission(resumed.engine.player), false);
});

test('APC boarding finalization: skip accounts only the kills that really happened before it', async t => {
  for (const afterKill of [false, true]) {
    const subject = await convoyBoardingAccountingFixture(t), { engine, events } = subject;
    if (afterKill) finishNativeBoardingKill(subject);
    assert.equal(engine.skipDropshipHandoverV188(), true);
    const completion = events.filter(event => event.type === 'mission-complete');
    assert.equal(completion.length, 1);
    assert.equal(completion[0].kills, afterKill ? 21 : 20);
    assert.equal(completion[0].rewards.credits, afterKill ? 1310 : 1300);
    assert.equal(subject.runner.alive, !afterKill);
    assert.equal(payRecordedConvoy(subject, completion[0]).ok, true);
  }
});

test('APC boarding finalization: stopping or replacing a pending extraction never delivers its stale victory', async t => {
  const subject = await convoyBoardingAccountingFixture(t), { engine, events, seq } = subject;
  assert.equal(recordOperationResumeState(subject.save, engine.captureResumeState()), true);
  assert.equal(resolveOperation(subject.save, { success: false, reason: 'retreat' }).ok, true);
  engine.stop();
  assert.equal(engine.finishBoardingV188(seq, true), false);
  assert.equal(events.filter(event => /mission-complete|boarding/.test(event.type)).length, 0);
  const entry = campaign('special-apc-convoy'), next = beginOperation(subject.save, entry, worldOf(entry)).operation;
  engine.start({ ...subject.setup.options, campaign: entry, operationId: next.id,
    weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [] });
  await prepare(engine);
  assert.equal(engine.finishBoardingV188(seq, false), false);
  assert.equal(events.filter(event => /mission-complete|boarding/.test(event.type)).length, 0);
  assert.equal(subject.save.strategy.lastOperation.success, false);
  assert.equal(subject.save.strategy.currentOperation.id, next.id);
});

test('terminal capture after native convoy boarding remains admissible and resumes without boarding or another payment', async t => {
  const entry = campaign('special-apc-convoy'), save = createDefaultSave();
  const operation = beginOperation(save, entry, worldOf(entry)).operation;
  const setup = launchOptions(entry.id, { operationId: operation.id, seed: 131426, insertionHandoverV188: handover('foot') });
  const { engine, events } = await fixture({ ...setup, keepEnemies: true });
  t.after(() => engine.stop());
  // The app captures synchronously when its held terminal event is delivered.
  // This observer preserves the existing event sink and never changes gameplay.
  let capturedOnCompletion;
  const sink = engine.handoverSinkV188;
  engine.handoverSinkV188 = event => {
    if (event.type === 'mission-complete') capturedOnCompletion = engine.captureResumeState();
    return sink(event);
  };
  tick(engine, 12);
  engine.interact();
  assert.equal(engine.apcConvoyV121.briefed, true);
  // Semantic input fixture: the same finite native course as the convoy story
  // regression. No actor, objective, terminal result or resource is assigned.
  let cooling = false;
  for (let frame = 0; frame < 180 * 60 && engine.mission.state === 'active'; frame++) {
    const convoy = engine.apcConvoyV121, course = engine.apcCourseStateV131;
    if (convoy.heat > 83 || convoy.overheated) cooling = true;
    if (convoy.heat < 33 && !convoy.overheated) cooling = false;
    const target = engine.enemies.find(enemy => enemy.alive && enemy.apcConvoyRoleV121 !== 'horde')
      || engine.enemies.filter(enemy => enemy.alive).sort((a, b) => b.x - a.x)[0];
    const next = new Set(convoy.phase === 'evacuation' ? ['KeyE'] : ['Space']);
    if (target?.apcLaneV131 < course.lane) next.add('KeyW');
    if (target?.apcLaneV131 > course.lane) next.add('KeyS');
    if (target && !cooling && engine.vehicle.turretAmmo > 0) next.add('KeyF');
    if (engine.vehicle.turretAmmo < 18 && engine.vehicle.turretReserve > 0) next.add('KeyR');
    engine.keys = next; engine.update(1 / 60);
  }
  engine.keys.clear();
  assert.equal(engine.mission.state, 'complete');
  assert.equal(engine.handoverV188?.kind, 'extraction');
  const nativeVehicle = pose(engine.vehicle), nativePlayer = pose(engine.player);
  // V131 stores the hull on its canonical road baseline; its lane is separate.
  // Compare against that existing native capture contract, not its drawn lane Y.
  const nativeCapture = engine.captureResumeState();
  assert.equal(engine.validateApcConvoyResumeV121(nativeCapture).valid, true);
  tick(engine, 12);
  const drawnVehicle = pose(engine.vehicle), drawnPlayer = pose(engine.player);
  assert.notDeepEqual(drawnVehicle, nativeVehicle, 'the real M577 was hoisted into the departing ship');
  assert.ok(capturedOnCompletion, 'capture occurred inside the native terminal callback');
  const checked = engine.validateApcConvoyResumeV121(capturedOnCompletion);
  assert.equal(checked.valid, true, JSON.stringify({ checked, capturedVehicle: pose(capturedOnCompletion.vehicle), nativeVehicle }));
  assert.deepEqual(pose(capturedOnCompletion.vehicle), pose(nativeCapture.vehicle));
  assert.deepEqual(pose(capturedOnCompletion.player), pose(nativeCapture.player));
  assert.equal(capturedOnCompletion.dropshipHandoverV188.boarding, null);
  assert.equal(capturedOnCompletion.dropshipHandoverV188.extracted, true);
  const terminal = engine.captureResumeState();
  assert.deepEqual(pose(terminal.vehicle), pose(nativeCapture.vehicle));
  assert.deepEqual(pose(engine.vehicle), drawnVehicle, 'capture restores the final rendered vehicle pose');
  assert.deepEqual(pose(engine.player), drawnPlayer, 'capture restores the final rendered marine pose');
  const completion = events.filter(event => event.type === 'mission-complete');
  assert.equal(completion.length, 1);
  assert.equal(recordOperationResumeState(save, terminal), true);
  assert.equal(resolveOperation(save, { success: true, rewards: completion[0].rewards }).ok, true);
  const resources = structuredClone(save.galaxy.resources);
  engine.stop();
  assert.equal(engine.validateApcConvoyResumeV121(engine.captureResumeState()).valid, true, 'an ordinary stop does not discard the terminal capture pose');

  const { insertionHandoverV188, ...oldFlow } = setup.options;
  const state = JSON.parse(JSON.stringify(save.strategy.lastOperation.resumeState));
  const resumed = await fixture({ ...setup, keepEnemies: true, options: { ...oldFlow, resumeState: state } });
  t.after(() => resumed.engine.stop());
  assert.equal(resumed.engine.lastResumeResult?.applied, true, 'the real convoy validator admits the completed checkpoint');
  assert.deepEqual(pose(resumed.engine.vehicle), nativeVehicle, 'the lane extension restores its own native road position');
  assert.deepEqual(pose(resumed.engine.player), nativePlayer);
  assert.equal(resumed.engine.handoverV188, null);
  assert.equal(resumed.engine.handoverHiddenV188(resumed.engine.player), true, 'already boarded marines remain out of the rendered level');
  tick(resumed.engine, 12);
  assert.deepEqual(types(resumed.events).filter(type => /mission-complete|boarding/.test(type)), []);
  assert.equal(resumed.engine.completeMission(resumed.engine.player), false);
  const recaptured = resumed.engine.captureResumeState();
  assert.equal(recaptured.dropshipHandoverV188.boarding, null, 'the terminal receipt survives recapture under the old launch flow');
  assert.equal(recaptured.dropshipHandoverV188.extracted, true);
  assert.equal(resumed.engine.validateApcConvoyResumeV121(recaptured).valid, true);
  assert.equal(resolveOperation(save, { success: true, rewards: completion[0].rewards }).ok, false);
  assert.deepEqual(save.galaxy.resources, resources, 'resume and another completion attempt cannot pay again');
});

test('Nostromo skips dropship extraction and a completed resume keeps the operator visible with or without the new marker', async t => {
  const entry = campaign('special-nostromo-v131'), world = worldOf(entry);
  const missionLevel = buildLegacyMissionV131({ campaign: entry, world, levelSeeds: LEVEL_SEEDS });
  const setup = { campaign: entry, seed: 131, keepEnemies: true,
    options: { world, levelSeed: missionLevel.levelSeed, missionLevel, operationId: 'op-terminal-nostromo', insertionHandoverV188: handover('foot') } };
  const { engine, events } = await fixture(setup);
  t.after(() => engine.stop());
  assert.equal(engine.handoverConfigV188.extraction, false);
  assert.equal(engine.handoverV188, null);
  // Proximity fixture, as in the legacy operation suite: place the operator at
  // each admitted station, then use real held E and real combat. No progression,
  // terminal result or resource is assigned to manufacture a completed save.
  const useStation = () => {
    const station = LEGACY_STATIONS_V131.nostromo[engine.legacyMissionV131.stage];
    Object.assign(engine.player, { x: station.x - engine.player.w / 2, y: station.y - engine.player.h / 2 });
    engine.keys.add('KeyE'); tick(engine, station.seconds + .04); engine.keys.delete('KeyE');
  };
  for (let index = 0; index < 3; index++) useStation();
  await prepare(engine);
  const hunter = engine.enemies[0];
  Object.assign(engine.player, { x: hunter.x - 320, y: 570 - engine.player.h, pointerAimV83: { x: 1, y: 0 } });
  engine.keys.add('KeyF'); tick(engine, 5); engine.keys.clear();
  assert.equal(hunter.alive, false);
  for (let index = 3; index < 7; index++) useStation();
  assert.equal(engine.mission.state, 'complete');
  assert.equal(events.filter(event => event.type === 'mission-complete').length, 1);
  assert.ok(!types(events).includes('extraction-boarding-complete-v188'));
  const raw = JSON.parse(JSON.stringify(engine.captureResumeState()));
  assert.equal(engine.validateLegacyResumeV131(raw).valid, true);
  assert.equal(raw.dropshipHandoverV188.boarding, null);
  const previous = structuredClone(raw); delete previous.dropshipHandoverV188.extracted;
  for (const state of [raw, previous]) {
    const resumed = await fixture({ ...setup, options: { ...setup.options, resumeState: state } });
    t.after(() => resumed.engine.stop());
    assert.equal(resumed.engine.lastResumeResult?.applied, true);
    assert.equal(resumed.engine.handoverV188, null);
    assert.equal(resumed.engine.handoverHiddenV188(resumed.engine.player), false, 'an ignored extraction never counts as boarding');
    const before = resumed.draws.length;
    resumed.engine.drawActor(resumed.ctx, resumed.engine.player);
    assert.ok(resumed.draws.length > before, 'the completed native operator is still rendered');
    tick(resumed.engine, 1);
    assert.deepEqual(types(resumed.events).filter(type => /mission-complete|boarding/.test(type)), []);
  }
  assert.equal(raw.dropshipHandoverV188.extracted, false);
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
