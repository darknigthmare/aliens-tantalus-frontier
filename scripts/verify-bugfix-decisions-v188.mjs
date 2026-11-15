// Regression tests, owner decisions of 2026-11-15 and P2 leftovers.
// 1. QZ-17: insertion grace only (no 900 px move); other story chapters stay excluded.
// Fixture: scripts/engine-host-v188.mjs fixture({ campaign, seed, options, keepEnemies })
// (production GameEngine, browser APIs stubbed). Each mission level is built like the
// app builds it. Injections are listed where they are used.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fixture, tick } from './engine-host-v188.mjs';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS } from '../src/content.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { INSERTION_SAFE_ZONE_V188 } from '../src/insertion-safe-zone-v188.js';

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const campaign = id => { const found = CAMPAIGNS.find(entry => entry.id === id); assert.ok(found, id); return found; };
const worldOf = entry => WORLDS.find(world => world.id === entry.worldId) || WORLDS[0];
async function launch(id, { keepEnemies = true, variant = 0, extra = {} } = {}) {
  const entry = campaign(id), world = worldOf(entry);
  const missionLevel = buildMissionLevelV52({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant });
  return fixture({ campaign: entry, seed: missionLevel.levelSeed.seed, keepEnemies,
    options: { world, levelSeed: missionLevel.levelSeed, missionLevel, userCasteCampaignV88: !id.startsWith('special-'), ...extra } });
}
const centre = actor => ({ x: actor.x + actor.w / 2, y: actor.y + actor.h / 2 });
const distance = (a, b) => { const p = centre(a), q = centre(b); return Math.hypot(p.x - q.x, p.y - q.y); };
const awake = engine => engine.enemies.filter(enemy => enemy.alive && !enemy.dormant);
const hurt = (player, health, armor) => player.health < health || (player.armor ?? 0) < armor;

// ---------------------------------------------------------------- item 1
for (const variant of [0, 1, 2]) test(`QZ-17 v${variant}: patrols keep their authored positions; a still marine is unhurt for the 4 s grace`, async () => {
  const { engine } = await launch('special-narrative-qz17', { variant });
  const p = engine.player;
  assert.equal(engine.insertionSafeZoneV188, null, 'no placement guard');
  assert.ok(awake(engine).some(enemy => distance(enemy, p) < INSERTION_SAFE_ZONE_V188.radius), 'authored patrols near the hold');
  assert.ok(awake(engine).every(enemy => !enemy.insertionSafeZoneMovedV188));
  assert.equal(engine.insertionGraceV188?.remaining, INSERTION_SAFE_ZONE_V188.graceSeconds, 'the grace is armed');
  const health = p.health, armor = p.armor ?? 0, before = awake(engine).map(enemy => [enemy, distance(enemy, p)]);
  tick(engine, 3.9);
  assert.ok(!hurt(p, health, armor), `no damage during the grace (health ${p.health}/${health}, armor ${p.armor}/${armor})`);
  for (const [enemy, start] of before) if (enemy.alive) assert.ok(distance(enemy, p) >= start - 1, `${enemy.id} held its distance`);
});

test('QZ-17 grace: a shot fired inside the window does not land after it', async () => {
  // Variant 0 opens with a combat synthetic 382 px away; before the fix its
  // first projectile reached the marine at 1.02 s.
  const { engine } = await launch('special-narrative-qz17', { variant: 0 });
  const p = engine.player, health = p.health, armor = p.armor ?? 0;
  tick(engine, 4.2);
  assert.ok(!hurt(p, health, armor), `still unhurt just after the window (health ${p.health})`);
  assert.ok(engine.insertionGraceHeldV188 > 0, 'held attacks are counted');
});

test('QZ-18, APC, C-12 and black cocoon stay fully excluded (no move, no grace)', async () => {
  const { insertionGraceAppliesV188, insertionSafeZoneAppliesV188 } = await import('../src/insertion-safe-zone-v188.js');
  const missionLevel = {};
  for (const id of ['special-archive-relay', 'special-apc-convoy', 'special-c12-horde', 'special-black-cocoon']) {
    assert.equal(insertionGraceAppliesV188({ missionLevel, campaign: { id } }), false, id);
    assert.equal(insertionSafeZoneAppliesV188({ missionLevel, campaign: { id } }), false, id);
  }
  assert.equal(insertionGraceAppliesV188({ missionLevel, campaign: { id: 'special-narrative-qz17' } }), true);
  assert.equal(insertionSafeZoneAppliesV188({ missionLevel, campaign: { id: 'special-narrative-qz17' } }), false);
  assert.equal(insertionGraceAppliesV188({ missionLevel, campaign: { id: 'special-narrative-qz17' }, forgePlaytest: true }), false);
  assert.match(source('docs/narrative/CAMPAGNE_PRINCIPALE.md'), /QZ-17[^\n]*délai de grâce[^\n]*sans déplacement/);
});

// ---------------------------------------------------------------- item 2
async function hive(id, crewSize = 4) {
  const { HIVE_CAMPAIGNS_V131, buildHiveMissionV131 } = await import('../src/hive-missions-v131.js');
  const { createDefaultSave } = await import('../src/save.js');
  const entry = HIVE_CAMPAIGNS_V131.find(c => c.id === id), world = worldOf(entry);
  // Fixture: the default save's first crew members, active (fixture() drops the squad;
  // configureMissionSquad() rebuilds it as start() builds it).
  const crew = createDefaultSave(1).crew.slice(0, crewSize).map(member => ({ ...member, status: 'active' }));
  const result = await fixture({ campaign: entry, seed: 7, keepEnemies: true,
    options: { world, crew, levelSeeds: LEVEL_SEEDS, missionLevel: buildHiveMissionV131({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant: 0 }) } });
  result.engine.configureMissionSquad();
  return { ...result, entry, world };
}
test('Jeri (hive): solo operation, no AI squad deployed even with a four-marine crew; other hive chapters keep theirs', async () => {
  const { isSoloSpecialOperationV131 } = await import('../src/special-operations-v131.js');
  const { missionDeploymentLogV188 } = await import('../src/mission-deployment-log-v188.js');
  assert.equal(isSoloSpecialOperationV131('special-jeri-v131'), true);
  assert.equal(isSoloSpecialOperationV131('special-atax-v131'), false);
  const jeri = await hive('special-jeri-v131');
  assert.equal(jeri.engine.activeSquadActors().length, 0, 'Jeri infiltrates alone');
  assert.equal(jeri.engine.squadTelemetry.configured, 0);
  assert.equal(missionDeploymentLogV188(jeri.engine, 0), 'JERI EN INFILTRATION SOLO · aucun marine IA déployé');
  const atax = await hive('special-atax-v131');
  assert.ok(atax.engine.activeSquadActors().length > 0, 'A.T.A.X.-Q keeps the selected squad');
});

test('Jeri (hive): the operation brief freezes one operator; briefing and log say solo (FR/EN)', async () => {
  const { createDefaultSave, getOperationBrief } = await import('../src/save.js');
  const { JERI_SOLO_BRIEFING_V188 } = await import('../src/mission-deployment-log-v188.js');
  const { EN_CATALOG_V185 } = await import('../src/i18n-en-catalog-v185.js');
  const { HIVE_CAMPAIGNS_V131 } = await import('../src/hive-missions-v131.js');
  const save = createDefaultSave(1), entry = HIVE_CAMPAIGNS_V131.find(c => c.id === 'special-jeri-v131');
  save.strategy.selectedCrewIds = save.crew.slice(0, 4).map(member => member.id);
  for (const member of save.crew.slice(0, 4)) member.status = 'active';
  const brief = getOperationBrief(save, entry, worldOf(entry));
  assert.equal(brief.crewIds.length, 1, 'one operator, the others stay aboard the Tantalus');
  assert.match(JERI_SOLO_BRIEFING_V188, /Infiltration solo/);
  assert.match(source('src/app.js'), /specialOperation\?\.id === 'jeri-false-son'\s*\?\s*escapeHtml\(JERI_SOLO_BRIEFING_V188\)/);
  assert.ok(EN_CATALOG_V185[JERI_SOLO_BRIEFING_V188], 'briefing EN');
  assert.ok(EN_CATALOG_V185['JERI EN INFILTRATION SOLO · aucun marine IA déployé'], 'log EN');
  const bible = source('docs/narrative/CAMPAGNE_PRINCIPALE.md');
  assert.match(bible, /« Le faux fils » est solo \(décision du propriétaire, 2026-11-15\)/);
  assert.match(bible, /Escouade du « Faux fils » \(décision du propriétaire, 2026-11-15\)/);
});

test('Jeri (hive): no hive objective needs an ally (objectives are the hive state, set by Jeri alone)', async () => {
  const { engine } = await hive('special-jeri-v131');
  assert.deepEqual(Object.keys(engine.mission.objectives).sort(), ['archive', 'boss', 'extract', 'power', 'route']);
  assert.doesNotMatch(source('src/hive-control-v131.js'), /squad|ally|allié/i);
});

// ---------------------------------------------------------------- item 3
// pair-030-mire: objective "navigate the vent network" (V62 network, ventTarget 1).
async function ventMission() {
  const { engine, events } = await launch('pair-030-mire', { keepEnemies: false, extra: { userCasteCampaignV88: true } });
  assert.equal(engine.objectiveRuntime.action, 'navigate');
  assert.ok(engine.missionVentNetworkV62, 'V62 network');
  engine.supplies = []; engine.drops = [];
  return { engine, events };
}
for (const kind of ['ally', 'enemy']) test(`vent objective: an ${kind} crawling through a portal keeps it open for AI but does not map the route`, async () => {
  const { engine } = await ventMission();
  const entrance = engine.missionVentNetworkV62.entrances[0];
  const portal = engine.vents.find(vent => vent.portalId === entrance.id);
  // Injection: a minimal AI actor beside the entrance, sent through it by the V62 traversal.
  const at = entrance.worldPosition;
  const actor = { id: `qa-${kind}`, x: at.x - 20, y: at.y - 60, depth: at.depth || 0, w: 40, h: 60, alive: true,
    ...(kind === 'ally' ? { squadMember: true, isAlly: true } : { isEnemy: true }) };
  if (kind === 'enemy') engine.enemies.push(actor); else engine.squadActors.push(actor);
  assert.ok(engine.beginMissionVentTraversalV62(actor, { entranceId: entrance.id, actorKind: kind, maximumDistance: 400 }), `${kind} entered`);
  assert.equal(portal.open, true, 'the portal stays physically open for AI movement');
  assert.notEqual(portal.playerTraversedV188, true);
  engine.updateObjectiveRuntime(1 / 60);
  assert.equal(engine.objectiveState.complete, false, 'the objective is not completed by an AI crawler');
  assert.match(engine.missingObjectiveRequirement(), /^CONDUITS CARTOGRAPHIÉS 0\/1/);
  // Then the controlled marine goes through a vent: the route is mapped.
  // Injection: the marine on the other entrance, cutter in hand.
  const other = engine.missionVentNetworkV62.entrances[1], p = engine.player, spot = other.worldPosition;
  engine.inventory.cutter = true;
  p.x = spot.x - p.w / 2; p.y = spot.y - p.h; p.depth = spot.depth || 0; p.vx = p.vy = 0; p.grounded = true;
  assert.ok(engine.enterMissionVentV62(p), 'the marine entered');
  engine.updateObjectiveRuntime(1 / 60);
  assert.equal(engine.objectiveState.complete, true, 'completed by the controlled marine');
  assert.equal(engine.missingObjectiveRequirement(), '');
});

test('vent objective saves: new saves keep the player flag; older saves load and keep their progress', async () => {
  const { sanitizeOperationResumeState } = await import('../src/save.js');
  const { engine } = await ventMission();
  const entrance = engine.missionVentNetworkV62.entrances[0];
  const portal = engine.vents.find(vent => vent.portalId === entrance.id);
  // Injection: the portal opened by an AI crawler only.
  portal.open = true; portal.playerTraversedV188 = false;
  const state = engine.captureResumeState();
  assert.equal(state.vents.find(vent => vent.id === portal.id).playerTraversedV188, false);
  const stored = sanitizeOperationResumeState(structuredClone(state));
  assert.equal(stored.vents.find(vent => vent.id === portal.id).playerTraversedV188, false, 'the profile sanitizer keeps the field');
  const again = await ventMission();
  assert.equal(again.engine.applyResumeState(stored).applied, true);
  again.engine.updateObjectiveRuntime(1 / 60);
  assert.equal(again.engine.objectiveState.complete, false, 'an AI-opened portal does not count after a resume');
  // Older save: no playerTraversedV188 field; its open portal keeps counting.
  const legacy = structuredClone(state);
  for (const vent of legacy.vents) delete vent.playerTraversedV188;
  const old = await ventMission();
  assert.equal(old.engine.applyResumeState(sanitizeOperationResumeState(legacy)).applied, true);
  old.engine.updateObjectiveRuntime(1 / 60);
  assert.equal(old.engine.objectiveState.complete, true, 'older progress is not lost');
  // An objective already completed is never un-completed.
  const done = structuredClone(state); done.objectiveState.complete = true;
  const fresh = await ventMission();
  assert.equal(fresh.engine.applyResumeState(done).applied, true);
  fresh.engine.updateObjectiveRuntime(1 / 60);
  assert.equal(fresh.engine.objectiveState.complete, true);
  assert.equal(fresh.engine.missingObjectiveRequirement(), '', 'extraction stays available');
});

// ---------------------------------------------------------------- item 4
async function cargo() {
  const result = await launch('special-cargo-brutal', { keepEnemies: false });
  assert.ok(result.engine.cargoBrutalV67 && result.engine.vehicle, 'cargo-brutal runtime and P-5000');
  return result;
}
// Injection used below: phases are advanced through the runtime's own
// advanceCargoBrutalPhaseV67 after setting the previous phase; the marine is
// seated with the vehicle fields toggleVehicle sets (driver, inVehicle).
function seat(engine) {
  const p = engine.player, v = engine.vehicle;
  p.inVehicle = true; v.driver = p; v.occupied = true; p.x = v.x + v.w / 2 - p.w / 2; p.y = v.y + v.h - p.h;
}
test('cargo-brutal: a checkpoint at the start of the loading, escort and matriarch phases (power starts at insertion)', async () => {
  const { engine, events } = await cargo();
  const state = engine.cargoBrutalV67, p = engine.player;
  assert.equal(state.phase, 'restore-power'); assert.equal(engine.checkpoint.id, 'insertion');
  p.x = engine.powerNode.x; p.y = engine.powerNode.y + engine.powerNode.h - p.h;
  assert.equal(engine.cargoBrutalInteractV67(p), true);
  assert.equal(state.phase, 'mount-loader'); assert.equal(engine.checkpoint.id, 'cargo-loader');
  state.phase = 'clear-route'; engine.vehicle.x = 2400; seat(engine);
  assert.equal(engine.advanceCargoBrutalPhaseV67('escort-convoy'), true);
  assert.equal(engine.checkpoint.id, 'cargo-escort');
  assert.equal(engine.checkpoint.loaderV188.x, 2400); assert.equal(engine.checkpoint.loaderV188.mounted, true);
  state.phase = 'carry-core'; engine.vehicle.x = 3300; seat(engine);
  assert.equal(engine.advanceCargoBrutalPhaseV67('matriarch'), true);
  assert.equal(engine.checkpoint.id, 'cargo-matriarch');
  const ids = events.filter(event => event.type === 'checkpoint').map(event => event.checkpoint);
  assert.deepEqual(ids, ['cargo-loader', 'cargo-escort', 'cargo-matriarch']);
  const { checkpointLabelV188 } = await import('../src/mission-log-labels-v188.js');
  assert.deepEqual(ids.map(checkpointLabelV188), ['chargeur P-5000', 'escorte du convoi', 'matriarche']);
});

test('cargo-brutal: a retry after the P-5000 is destroyed restores it where it stood at the phase checkpoint', async () => {
  const { engine } = await cargo();
  const state = engine.cargoBrutalV67, v = engine.vehicle, p = engine.player;
  state.powerRestored = true; state.loaderMounted = true; state.phase = 'clear-route'; v.x = 2400; seat(engine);
  engine.advanceCargoBrutalPhaseV67('escort-convoy');
  const hull = v.hull;
  // Injection: the loader is driven 900 px on and destroyed.
  v.x = 3300; v.hull = 0; v.destroyed = true;
  engine.update(1 / 60);
  assert.equal(engine.mission.state, 'failed');
  assert.equal(engine.restartFromCheckpoint(), true);
  assert.equal(engine.mission.state, 'active');
  assert.equal(state.phase, 'escort-convoy', 'the phase is kept');
  assert.equal(v.x, 2400, 'the P-5000 is back at the checkpoint');
  assert.equal(v.destroyed, false); assert.equal(state.loader.destroyed, false);
  assert.equal(v.hull, hull, 'hull as it was at the checkpoint');
  assert.equal(p.inVehicle, false);
  assert.ok(Math.abs(p.x - (v.x + v.w)) < 220, 'the marine restarts within mounting reach');
  assert.equal(p.y + p.h, v.y + v.h, 'on the loader floor');
});

test('cargo-brutal and planet-exterior: the new checkpoints survive a mission resume', async () => {
  const { engine } = await cargo();
  const state = engine.cargoBrutalV67;
  state.powerRestored = true; state.phase = 'clear-route'; engine.vehicle.x = 2400; seat(engine);
  engine.advanceCargoBrutalPhaseV67('escort-convoy');
  const saved = engine.captureResumeState();
  const again = await cargo();
  assert.equal(again.engine.applyResumeState(saved).applied, true);
  assert.equal(again.engine.checkpoint.id, 'cargo-escort');
});

test('planet-exterior: the beacon platform before the extraction walkway sets a checkpoint; a fall into the pit returns there', async () => {
  const entry = campaign('pair-001-frontier'), world = worldOf(entry);
  const missionLevel = buildMissionLevelV52({ campaign: entry, world, levelSeeds: LEVEL_SEEDS, variant: 0, templateId: 'planet-exterior' });
  const { engine } = await fixture({ campaign: entry, seed: missionLevel.levelSeed.seed, options: { world, levelSeed: missionLevel.levelSeed, missionLevel } });
  engine.supplies = []; engine.drops = [];
  assert.equal(engine.checkpoint.id, 'insertion');
  const pad = engine.platforms.find(entry => entry.id === 'node-platform-planet-beacon'), p = engine.player;
  // Injection: the marine dropped onto the beacon platform.
  p.x = pad.x + pad.w / 2 - p.w / 2; p.y = pad.y - p.h - 2; p.vx = p.vy = 0;
  tick(engine, 0.5);
  assert.equal(engine.checkpoint.id, 'extraction-walkway');
  // Injection: the marine falls into the pit under the walkway.
  p.x = 4560; p.y = engine.missionLevelBounds.voidY + 10; p.vy = 400; p.grounded = false;
  tick(engine, 1 / 60);
  assert.ok(Math.abs(p.x - engine.checkpoint.x) < 2 && p.x > 4000, `back at the walkway checkpoint (x ${Math.round(p.x)}), not at insertion`);
});

// ---------------------------------------------------------------- Q39
// Same scripted input as the measurement: power restored, the marine seated in
// the P-5000 at its start position, no further input; the level patrols are kept.
async function loaderRun(variant, phase) {
  const { engine, events } = await launch('special-cargo-brutal', { variant, keepEnemies: true });
  engine.insertionGraceV188 = null; // Injection: the insertion grace is cleared (the phase starts later in play).
  const state = engine.cargoBrutalV67, v = engine.vehicle;
  state.powerRestored = true; state.loaderMounted = true; engine.powerNode.active = true;
  state.phase = phase; engine.mission.phase = phase;
  if (phase === 'escort-convoy') { v.x = state.convoy.x - 200; state.obstacles.forEach(entry => { entry.cleared = true; }); }
  seat(engine);
  if (phase === 'escort-convoy') engine.cargoBrutalInteractV67(engine.player);
  let t = 0; while (t < 30 && !v.destroyed && engine.mission.state === 'active') { engine.update(1 / 60); t += 1 / 60; }
  return { engine, events, t, v };
}
test('cargo-brutal Q39: slower enemy attacks during the loader phases; the loader lasts longer under the same input', async () => {
  const { CARGO_LOADER_PRESSURE_V188 } = await import('../src/cargo-brutal-runtime-v67.js');
  assert.ok(CARGO_LOADER_PRESSURE_V188.attackCadence > 1);
  // Before: destroyed at 6.4 s (variant 1). After: 9.3 s.
  const run = await loaderRun(1, 'clear-route');
  assert.ok(run.t > 8.5, `loader survives past 8.5 s (${run.t.toFixed(1)} s)`);
});

test('cargo-brutal Q39: convoy waves bring one creature fewer; the P-5000 vehicle and the matriarch waves are unchanged', async () => {
  const { events, engine } = await loaderRun(0, 'escort-convoy');
  const start = events.find(event => event.type === 'objective-wave' && event.wave === 'convoy-start');
  assert.equal(start?.count, 1, 'convoy-start: 2 -> 1');
  assert.equal(engine.vehicle.maxHull, 340, 'P-5000 hull as before Q39 (vehicle untouched)');
  engine.cargoBrutalV67.phase = 'matriarch';
  const before = engine.enemies.length;
  assert.equal(engine.spawnCargoWaveV67(2, 'matriarch-awakening'), 2, 'matriarch waves keep their count');
  assert.equal(engine.enemies.length, before + 2);
  assert.match(source('docs/narrative/CAMPAGNE_PRINCIPALE.md'), /Phases du P-5000 adoucies[^\n]*\[PROPOSÉ\]/);
});

// ---------------------------------------------------------------- item 6 (Q38)
// The app's finalizeOperation order: resolveOperation, then applyCampaignConsequence;
// the debrief shows paidRewardsV188(before, after).
async function settle(id, { success = true, completed = [] } = {}) {
  const { createDefaultSave, beginOperation, resolveOperation, getOperationBrief } = await import('../src/save.js');
  const { applyCampaignConsequence } = await import('../src/campaign-consequences.js');
  const { paidRewardsV188 } = await import('../src/mission-debrief-v188.js');
  const save = createDefaultSave(1), entry = campaign(id), world = worldOf(entry);
  // Fixture: the campaign world unlocked, two active marines, the default stock.
  if (!save.galaxy.unlockedWorldIds.includes(world.id)) save.galaxy.unlockedWorldIds.push(world.id);
  save.galaxy.completedCampaignIds.push(...completed);
  save.strategy.selectedCrewIds = save.crew.slice(0, 2).map(member => member.id);
  for (const member of save.crew.slice(0, 2)) member.status = 'active';
  const brief = getOperationBrief(save, entry, world);
  beginOperation(save, entry, world);
  const before = structuredClone(save.galaxy.resources);
  assert.equal(resolveOperation(save, { success, kills: 0 }).ok, true);
  applyCampaignConsequence(save, entry, world, { success });
  return { brief, paid: paidRewardsV188(before, save.galaxy.resources), save };
}
test('Q38: pair-030-mire pays the research its brief announces (+8), not +15; comparable missions pay theirs', async () => {
  const mire = await settle('pair-030-mire');
  assert.equal(mire.brief.reward.research, 8);
  assert.equal(mire.paid.research, mire.brief.reward.research, `paid +${mire.paid.research} R&D`);
  for (const id of ['pair-046-mire', 'pair-030-frontier', 'pair-001-mire']) {
    const run = await settle(id);
    assert.equal(run.paid.research, run.brief.reward.research, `${id}: paid +${run.paid.research}, announced +${run.brief.reward.research}`);
  }
  // A FRONTIER whose MIRE archive was recovered keeps its world effect, not an extra research grant.
  const frontier = await settle('pair-030-frontier', { completed: ['pair-030-mire'] });
  assert.equal(frontier.paid.research, frontier.brief.reward.research);
});

// ---------------------------------------------------------------- item 5
async function english() {
  const catalog = await import('../src/i18n-en-catalog-v185.js');
  const { autoTranslateV185, useCatalogV185 } = await import('../src/i18n-auto-v185.js');
  const { setLanguageV185 } = await import('../src/i18n-v185.js');
  useCatalogV185(catalog);
  setLanguageV185('en', { document: null, storage: null, persist: false });
  return text => autoTranslateV185(text);
}
const RAW_IDS = /POWER-ROUTED|SHIP-EXTRACTION|ACID-PERSISTED|OUTER-AIRLOCK|CHECKPOINT-RESTART|[A-Z]+-[A-Z]+-[A-Z]+/;
test('survival log: no raw ids; French and English lines', async () => {
  const { alienSurvivalLogLineV188 } = await import('../src/mission-log-labels-v188.js');
  const en = await english();
  const cases = [
    [{ type: 'alien-survival-power-routed', circuitId: 'life-support', enabled: true }, 'SURVIE · CIRCUIT SURVIE ALIMENTÉ', 'SURVIVAL · LIFE SUPPORT CIRCUIT POWERED'],
    [{ type: 'alien-survival-power-routed', preset: ['security'] }, 'SURVIE · PUISSANCE RÉPARTIE', 'SURVIVAL · POWER DISTRIBUTED'],
    [{ type: 'alien-survival-cctv-feed-visited', feedId: 'ship-extraction' }, 'SURVIE · CAMÉRA CONSULTÉE · SAS D’EXTRACTION', 'SURVIVAL · CAMERA CHECKED · EXTRACTION AIRLOCK'],
    [{ type: 'alien-survival-acid-persisted', poolId: 'acid-3' }, 'SURVIE · L’ACIDE RONGE TOUJOURS LE PONT', 'SURVIVAL · THE ACID IS STILL EATING THE DECK'],
    [{ type: 'alien-survival-airlock-cycled', doorId: 'outer-airlock' }, 'SURVIE · CYCLE DU SAS · SAS EXTÉRIEUR', 'SURVIVAL · AIRLOCK CYCLE · OUTER AIRLOCK'],
    [{ type: 'alien-survival-weld-cancelled', doorId: 'aft-bulkhead', reason: 'checkpoint-restart' }, 'SURVIE · SOUDURE INTERROMPUE · REPRISE AU CHECKPOINT', 'SURVIVAL · WELD INTERRUPTED · CHECKPOINT RESTART'],
    [{ type: 'alien-survival-self-destruct-tick', remainingSeconds: 41.2 }, 'SURVIE · AUTODESTRUCTION · T−42 S', 'SURVIVAL · SELF-DESTRUCT · T−42 S'],
    [{ type: 'alien-survival-unknown-v999', message: 'X-Y-Z' }, 'SURVIE · SYSTÈMES ACTUALISÉS', 'SURVIVAL · SYSTEMS UPDATED']
  ];
  for (const [event, fr, english] of cases) {
    const line = alienSurvivalLogLineV188(event);
    assert.equal(line, fr); assert.doesNotMatch(line, RAW_IDS);
    assert.equal(en(line), english);
  }
  assert.match(source('src/app.js'), /const alienSurvivalEventLabelV70 = \(event\) => alienSurvivalLogLineV188\(event\);/);
});

test('failure labels and the failure overlay name things, not ids (FR/EN)', async () => {
  const { missionFailureLabelV188 } = await import('../src/mission-log-labels-v188.js');
  const en = await english();
  assert.equal(missionFailureLabelV188('p-5000-loader-détruit'), 'P-5000 détruit');
  assert.equal(missionFailureLabelV188('convoi-survivants-perdu'), 'convoi de survivants perdu');
  assert.equal(en('OPÉRATION COMPROMISE · convoi de survivants perdu · reprenez au checkpoint ou battez en retraite.'),
    'OPERATION COMPROMISED · survivor convoy lost · resume from the checkpoint or retreat.');
  const { engine, text } = await launch('pair-001-mire', { keepEnemies: false });
  engine.failMission('escouade-neutralisee');
  text.length = 0; engine.drawStateOverlay(engine.ctx || engine.canvas.getContext('2d'));
  const line = text.find(entry => entry.startsWith('ENTRÉE'));
  assert.equal(line, 'ENTRÉE · reprendre au checkpoint d’insertion');
  assert.equal(en(line), 'ENTER · resume at checkpoint insertion');
});

test('English leftovers: waves, leaving the P-5000, the generic squad line without a sprite count', async () => {
  const { missionDeploymentLogV188 } = await import('../src/mission-deployment-log-v188.js');
  const en = await english();
  assert.equal(en('ZONE 12s · VAGUES 2/2'), 'ZONE 12s · WAVES 2/2');
  assert.equal(en('V  QUITTER P-5000'), 'V  LEAVE P-5000');
  const { engine } = await launch('pair-001-mire', { keepEnemies: false });
  for (const [count, fr, english] of [[0, 'ESCOUADE DÉPLOYÉE · aucun allié IA physique', 'SQUAD DEPLOYED · no physical AI ally'],
    [1, 'ESCOUADE DÉPLOYÉE · 1 allié IA physique', 'SQUAD DEPLOYED · 1 physical AI ally'],
    [3, 'ESCOUADE DÉPLOYÉE · 3 alliés IA physiques', 'SQUAD DEPLOYED · 3 physical AI allies']]) {
    const line = missionDeploymentLogV188(engine, count);
    assert.equal(line, fr); assert.doesNotMatch(line, /plaques/); assert.equal(en(line), english);
  }
  assert.equal(en('CHECKPOINT CHARGEUR P-5000 SÉCURISÉ.'), 'CHECKPOINT P-5000 LOADER SECURED.');
  assert.equal(en('REPRISE CHECKPOINT PASSERELLE D’EXTRACTION · pénalité de récupération appliquée.'), 'CHECKPOINT EXTRACTION WALKWAY RESUME · recovery penalty applied.');
});
