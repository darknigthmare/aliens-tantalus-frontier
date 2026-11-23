// V188 — first side campaign « La Saison des Reines » (spec 011): campaign frame, Arc 1 (Nacre-7),
// Arc 2 (Echo Basin), Arc 3 (TR-0, the 65th world), choices, debriefs, lineages and the seized egg's crisis.
// Pure rules on candidate saves built by `createDefaultSave` / `migrateSave`, the real galaxy jump
// (`prepareJumpV116` → `confirmJumpV115` → 14 days → late messages), the real V131 chapter receipt
// check, the real hub crisis API (`createHubCrisis`, `resolveHubCrisisEvent`) and the production
// engine (engine-host-v188.mjs) for the encounter rosters.
// Fixtures: Act V phase set to 'complete' on the candidate save (the main campaign's end, as
// `finishAct5CreditsV188` writes it); jump clock `now` values passed explicitly; seed 7 for the levels.
// Injections are declared where used: the ship's orbit, the fuel stock, the operation results
// (`applyQueensOperationResultV188` called as `finalizeOperation` calls it after a resolved success),
// the Grue pact flag, and the hub crisis events (`crisis:resolved`, `crisis:player-down`) the hub emits.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS, ENEMIES, CONTENT_COUNTS, CONTENT_TARGETS, validateContent } from '../src/content.js';
import { TR0_WORLD_V188 } from '../src/content-core-v50.js';
import { buildObjectiveRuntime } from '../src/game-complete-core.js';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { buildMissionLevelV52 } from '../src/mission-levels-v52.js';
import { getJumpReadinessV115, prepareJumpV116, confirmJumpV115, JUMP_CHARGE_MS_V116 } from '../src/galaxy-jump-v115.js';
import { applyJumpTravelTimeV188, JUMP_TRAVEL_DAYS_V188 } from '../src/galaxy-travel-v188.js';
import { deliverTravelMessagesV188, pushCampaignTravelMessageV188, travelMessagesListV188, normalizeTravelMessagesV188 } from '../src/travel-messages-v188.js';
import { campaignWorldIdsV188, operationCampaignV131 } from '../src/operation-receipts-v131.js';
import { getSpecialOperationByCampaignIdV131 } from '../src/special-operations-v131.js';
import { resolveEnemyBehaviorV119 } from '../src/enemy-behavior-registry-v119.js';
import { selectEnemyEncounterCatalog } from '../src/game-production-base.js';
import { createHubCrisis, resolveHubCrisisEvent } from '../src/world-crisis-core.js';
import { advanceGalaxy } from '../src/world-crisis.js';
import { INTERLUDE_CRISIS_V188 } from '../src/story-campaign-v188.js';
import { CINEMATICS_V188, CINEMATIC_IDS_V188, cinematicDurationV188, drawCinematicFrameV188 } from '../src/story-cinematics-v188.js';
import { QUEENS_CINEMATIC_IDS_V188, QUEENS_CINEMATICS_WIRED_V188, QueensSceneLoaderV188, QUEENS_SCENE_SLOTS_V188, queensCinematicSourcesV188 } from '../src/queens-cinematics-v188.js';
import { CREW_QUESTS_ALL_V188, crewQuestActionsV188, acceptCrewQuestV188, crewQuestStepV188, answerCrewQuestStepV188, crewQuestNotesV188, crewQuestDoneV188,
  crewQuestsSnapshotV188, normalizeCrewQuestsV188 } from '../src/crew-quests-v188.js';
import { QUEENS_CREW_QUESTS_V188, QUEENS_CREW_QUEST_IDS_V188 } from '../src/queens-crew-quests-v188.js';
import { EN_CATALOG_V185 } from '../src/i18n-en-catalog-v185.js';
import { TANTALUS_I18N_DELTA_V188 } from './i18n-tantalus-xeno-merge-v188.mjs';
import { fixture } from './engine-host-v188.mjs';
import {
  QUEENS_CAMPAIGNS_V188, QUEENS_CAMPAIGN_IDS_V188, QUEENS_ARC1_ORDER_V188, QUEENS_ARC1_SIDE_V188, QUEENS_ARC1_CONTRACTS_V188, QUEENS_ABYSS_CHAPTER_ID_V188,
  QUEENS_ARC2_ORDER_V188, QUEENS_ARC2_SIDE_V188, QUEENS_ARC2_CONTRACTS_V188, QUEENS_ARC3_ORDER_V188, QUEENS_ARC3_SIDE_V188, QUEENS_ARC3_CONTRACTS_V188,
  QUEENS_BROODSTORM_CHAPTER_ID_V188, QUEENS_MOTHER_CHAPTER_ID_V188, QUEENS_HIVE_WORLD_CHAPTER_ID_V188, QUEENS_CHAPTER_IDS_V188, QUEENS_ARCS_V188,
  QUEENS_NACRE_WORLD_ID_V188, QUEENS_ECHO_WORLD_ID_V188, QUEENS_TR0_WORLD_ID_V188, QUEENS_NAMES_EN_V188,
  QUEENS_REEF_LINEAGE_IDS_V188, QUEENS_EXCLUDED_AQUATIC_IDS_V188, QUEENS_RASK_SQUAD_IDS_V188, QUEENS_BURROWER_LINEAGE_IDS_V188, QUEENS_AERIAL_LINEAGE_IDS_V188,
  QUEENS_EYRIE_ROYAL_IDS_V188, QUEENS_MOTHER_LINEAGE_IDS_V188, queensEncounterIdsV188, queensLineagesOfV188,
  createSideCampaignsV188, normalizeSideCampaignsV188, queensStateV188, mainCampaignCompleteV188, queensCallDueV188, receiveQueensCallV188,
  queensCallDelayV188, acceptQueensCallV188, recordQueensArrivalV188, queensLockReasonV188, queensLockTextV188, filterQueensCampaignsV188,
  applyQueensOperationResultV188, queensRaskChoicePendingV188, chooseQueensRaskEggV188, queensConsequencesV188, queensReturnSceneDueV188,
  markQueensSceneSeenV188, QUEENS_SCENES_V188, queensSceneV188, QUEENS_SCENE_CINEMATICS_V188, queensArc1DebriefDueV188, queensArc1DebriefV188, queensSnapshotV188,
  queensEncounterCatalogV188, queensCallTextV188, QUEENS_CALL_DIALOG_V188, QUEENS_RASK_DIALOG_V188, QUEENS_SPECIMEN_DIALOG_V188, QUEENS_LATER_ARCS_V188, isQueensCampaignV188,
  syncQueensRoutesV188, queensWorldHiddenV188, queensArcOpenV188, queensArcCompleteV188, queensCampaignCompleteV188, queensPendingChoiceV188, chooseQueensV188,
  queensSpecimenChoicePendingV188, chooseQueensSpecimenV188, QUEENS_SPECIMEN_EFFECTS_V188, queensDebriefDueV188, queensDebriefV188, queensBestiaryV188,
  QUEENS_EGG_CRISIS_V188, queensEggCrisisDueV188, queensEggCrisisActiveV188, startQueensEggCrisisV188, resolveQueensEggCrisisV188, reconcileQueensEggCrisisV188,
  queensCampaignUpkeepDueV188, QUEENS_MESSAGE_TEXT_V188
} from '../src/side-campaign-queens-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const campaignOf = id => CAMPAIGNS.find(entry => entry.id === id);
const worldOf = id => WORLDS.find(world => world.id === id);
const nacre = worldOf(QUEENS_NACRE_WORLD_ID_V188), echoBasin = worldOf(QUEENS_ECHO_WORLD_ID_V188), tr0 = worldOf(QUEENS_TR0_WORLD_ID_V188);
const ALL = [...QUEENS_CAMPAIGNS_V188, ...QUEENS_CHAPTER_IDS_V188.map(campaignOf)];
// Fixture: a save whose main campaign is over (Act V credits played).
function endedSave() {
  const save = createDefaultSave();
  save.storyCampaignV188 = { ...save.storyCampaignV188, act5: { schema: 188, phase: 'complete', decision: { option: 'hold', ending: 'freight-first' } } };
  return save;
}
// Injection: completes a mission as `finalizeOperation` does after a resolved success.
const complete = (save, id) => { save.galaxy.completedCampaignIds.push(id); return applyQueensOperationResultV188(save, { success: true, campaignId: id }); };
// Real jump with explicit clock values; returns the settlement. Injection: the fuel stock is topped up.
let clock = 1_000_000;
function jumpTo(save, world) {
  save.galaxy.resources.fuel = Math.max(save.galaxy.resources.fuel, 40);
  const now = (clock += 10 * JUMP_CHARGE_MS_V116);
  prepareJumpV116(save, world, WORLDS, now);
  const settlement = confirmJumpV115(save, world, WORLDS, now + JUMP_CHARGE_MS_V116);
  applyJumpTravelTimeV188(save, settlement);
  deliverTravelMessagesV188(save, settlement, { relayRoomReady: false });
  const arrival = recordQueensArrivalV188(save, settlement);
  if (arrival) pushCampaignTravelMessageV188(save, arrival);
  return settlement;
}
const jumpToNacre = save => jumpTo(save, nacre);
// Fixtures built with the game's own rules: the campaign accepted and an arc finished.
function atNacre() { const save = endedSave(); receiveQueensCallV188(save); acceptQueensCallV188(save); jumpToNacre(save); return save; }
function arc1Done(egg = 'release') {
  const save = atNacre();
  for (const id of QUEENS_ARC1_ORDER_V188) complete(save, id);
  assert.equal(chooseQueensRaskEggV188(save, egg), true);
  return save;
}
function arc2Done(egg = 'release') {
  const save = arc1Done(egg); jumpTo(save, echoBasin);
  for (const id of QUEENS_ARC2_ORDER_V188) assert.equal(complete(save, id)?.kind, 'step', id);
  return save;
}
const readScenes = save => { const seen = []; for (let id = queensReturnSceneDueV188(save); id; id = queensReturnSceneDueV188(save)) { assert.equal(markQueensSceneSeenV188(save, id), true, id); seen.push(id); } return seen; };

test('campaign data: 24 missions over three arcs, bible ids, existing objectives and templates', () => {
  assert.deepEqual(validateContent().failures, []);
  assert.equal(QUEENS_CAMPAIGNS_V188.length, 24, '9 on Nacre-7, 11 on Echo Basin, 4 on TR-0');
  assert.deepEqual(QUEENS_ARC1_ORDER_V188, ['queens-1-1-quai', 'queens-1-2-bassins', 'special-black-abyss-v131', 'queens-1-5-rask']);
  assert.deepEqual(QUEENS_ARC2_ORDER_V188, ['queens-2-1-relais', 'queens-2-2-sol', 'special-broodstorm-v131', 'queens-2-4-aire', 'queens-2-5-carte']);
  assert.deepEqual(QUEENS_ARC3_ORDER_V188, ['queens-3-1-peau', 'queens-3-2-ombelle', 'special-queen-mother-v131', 'special-hive-world-v131']);
  assert.deepEqual(QUEENS_ARC1_SIDE_V188.map(entry => entry.id), ['queens-a-navarre', 'queens-a-filets', 'queens-a-phare'], 'annex ids of bible §14.4');
  assert.deepEqual(QUEENS_ARC2_SIDE_V188.map(entry => entry.id), ['queens-a-mineurs', 'queens-a-rask', 'queens-a-sorensen', 'queens-a-grue'], 'annex ids of bible §14.5');
  assert.deepEqual(QUEENS_ARC3_SIDE_V188.map(entry => entry.id), ['queens-a-ombelle', 'queens-a-echantillon'], 'annex ids of bible §14.6');
  assert.deepEqual(QUEENS_CAMPAIGNS_V188.filter(entry => entry.queensStepV188).map(entry => [entry.queensStepV188, entry.objective]), [
    ['1.1', 'rescue survivors'], ['1.2', 'restore atmospheric processing'], ['1.5', 'hold the extraction zone'],
    ['2.1', 'defend the colony'], ['2.2', 'escort a colony convoy'], ['2.4', 'track an apex specimen'], ['2.5', 'recover black-box data'],
    ['3.1', 'navigate the vent network'], ['3.2', 'recover black-box data']], 'base objectives of bible §14.4-§14.6');
  assert.deepEqual(QUEENS_ARC1_CONTRACTS_V188.map(entry => entry.objective), ['purge a reactor nest', 'escort a colony convoy', 'recover black-box data'], 'locals of §14.4');
  assert.deepEqual(QUEENS_ARC2_CONTRACTS_V188.map(entry => entry.objective), ['seal the hive', 'purge a reactor nest', 'secure the power loader'], 'locals of §14.5');
  assert.equal(QUEENS_ARC3_CONTRACTS_V188.length, 0, '§14.6 lists no local contract');
  assert.equal(campaignOf('queens-a-echantillon').objective, 'capture a live organism', '§14.6');
  const worlds = { 1: nacre, 2: echoBasin, 3: tr0 };
  for (const campaign of QUEENS_CAMPAIGNS_V188) {
    const world = worlds[campaign.queensArcV188];
    assert.equal(campaignOf(campaign.id), campaign, `${campaign.id} is in CAMPAIGNS`);
    assert.equal(campaign.worldId, world.id, campaign.id);
    assert.notEqual(buildObjectiveRuntime(campaign.objective).id, 'secure-frontier', `${campaign.id}: existing objective`);
    assert.ok(QUEENS_NAMES_EN_V188[campaign.id], `${campaign.id}: English name`);
    const plan = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS });
    assert.equal(plan.templateId, campaign.templateId, `${campaign.id}: authored template`);
    assert.equal(plan.validation.valid, true, `${campaign.id}: ${plan.validation.errors?.join('; ')}`);
  }
  // Arc 1 is no royal contract: the generic selection must not force a Queen into these templates.
  for (const campaign of QUEENS_CAMPAIGNS_V188.filter(entry => entry.queensArcV188 === 1))
    assert.doesNotMatch([campaign.id, campaign.name, campaign.objective].join(' ').toLowerCase(), /(?:^|\W)(?:queen|reine|hive|ruche)(?:$|\W)/);
  assert.equal(nacre.name, 'Nacre-7'); assert.equal(echoBasin.name, 'Echo Basin'); assert.equal(tr0.name, 'TR-0');
  assert.equal(new Set(CAMPAIGNS.map(entry => entry.id)).size, CAMPAIGNS.length);
  assert.deepEqual(QUEENS_LATER_ARCS_V188.map(arc => [arc.arc, arc.worldId, [...arc.reuses]]), [[2, QUEENS_ECHO_WORLD_ID_V188, ['special-broodstorm-v131']],
    [3, QUEENS_TR0_WORLD_ID_V188, ['special-queen-mother-v131', 'special-hive-world-v131']]]);
  for (const id of QUEENS_CHAPTER_IDS_V188) assert.equal(isQueensCampaignV188(id), true, `${id} is locked until its place`);
  assert.deepEqual(QUEENS_ARCS_V188.map(arc => arc.worldId), [nacre.id, echoBasin.id, tr0.id]);
  assert.deepEqual(QUEENS_CAMPAIGN_IDS_V188, QUEENS_CAMPAIGNS_V188.map(entry => entry.id));
});

test('the reused chapters moved to their campaign worlds additively: ids kept, former worlds still valid for deployments under way', () => {
  for (const [id, world, legacy, operation] of [[QUEENS_ABYSS_CHAPTER_ID_V188, QUEENS_NACRE_WORLD_ID_V188, 'world-10-ceto', 'black-abyss'],
    [QUEENS_BROODSTORM_CHAPTER_ID_V188, QUEENS_ECHO_WORLD_ID_V188, 'world-01-acheron-lv-426', 'broodstorm'],
    [QUEENS_MOTHER_CHAPTER_ID_V188, QUEENS_TR0_WORLD_ID_V188, 'world-05-lethe', 'queen-mother-song'],
    [QUEENS_HIVE_WORLD_CHAPTER_ID_V188, QUEENS_TR0_WORLD_ID_V188, 'world-05-lethe', 'hive-world']]) {
    const chapter = campaignOf(id);
    assert.equal(chapter.worldId, world, id);
    assert.deepEqual([...chapter.legacyWorldIdsV188], [legacy], id);
    assert.equal(operationCampaignV131(id), chapter);
    assert.deepEqual(campaignWorldIdsV188(chapter), [world, legacy]);
    assert.equal(getSpecialOperationByCampaignIdV131(id).id, operation);
    assert.ok(worldOf(legacy), `${legacy} still exists`);
  }
  // The receipt check compares the frozen deployment's own world, never the catalogue's current one.
  const receipts = read('src/operation-receipts-v131.js');
  assert.match(receipts, /!campaignWorldIdsV188\(campaign\)\.includes\(operation\.worldId\)/);
  assert.match(receipts, /raw\.identity\?\.worldId!==operation\.worldId/);
  // A chapter outside the campaign keeps its world.
  assert.equal(campaignOf('special-pangaea-v131').worldId, 'world-05-lethe');
  assert.equal(campaignOf('special-pangaea-v131').legacyWorldIdsV188, undefined);
  assert.equal(campaignOf('special-nostromo-v131').worldId, 'world-15-uscss-nostromo');
  // An old save that completed the chapters keeps its record, without advancing any arc.
  const save = endedSave(); save.galaxy.completedCampaignIds.push(...QUEENS_CHAPTER_IDS_V188);
  const migrated = migrateSave(JSON.parse(JSON.stringify(save)));
  for (const id of QUEENS_CHAPTER_IDS_V188) assert.ok(migrated.galaxy.completedCampaignIds.includes(id));
  assert.deepEqual(queensStateV188(migrated).done, []);
});

test('TR-0 is a 65th world, original to the project, hidden until Arc 3; the 64 generated worlds are unchanged', () => {
  assert.equal(WORLDS.length, 65); assert.equal(CONTENT_COUNTS.worlds, 65); assert.equal(CONTENT_TARGETS.worlds, 65);
  assert.equal(WORLDS.at(-1), TR0_WORLD_V188); assert.equal(tr0.id, 'world-65-tr-0');
  assert.equal(tr0.provenance, 'project-canon'); assert.equal(tr0.hiddenUntilV188, 'queens-arc3'); assert.equal(tr0.faction, 'red-hive');
  assert.equal(WORLDS.filter(world => world.hiddenUntilV188).length, 1);
  // Additive: identifiers of the generated worlds, and what was generated from them, did not move.
  assert.equal(WORLDS[0].id, 'world-01-acheron-lv-426'); assert.equal(WORLDS[26].id, 'world-27-echo-basin'); assert.equal(WORLDS[30].id, 'world-31-nacre-7');
  assert.equal(WORLDS[63].id, 'world-64-khepri-forge-frontier');
  assert.equal(LEVEL_SEEDS.length, 800); assert.equal(LEVEL_SEEDS[64].worldId, WORLDS[0].id, 'level seeds still cycle over the 64 generated worlds');
  assert.equal(LEVEL_SEEDS.some(seed => seed.worldId === tr0.id), false);
  for (const pair of [1, 2, 3, 64]) assert.equal(campaignOf(`pair-${String(pair).padStart(3, '0')}-frontier`).worldId, campaignOf(`pair-${String(pair + 64).padStart(3, '0')}-frontier`).worldId,
    'lore pairs still cycle over the 64 generated worlds');
  assert.equal(ENEMIES.some(enemy => (enemy.encounterWorldIds || []).includes(tr0.id)), false, 'no generated encounter was re-bound');
  // The only missions on TR-0 are the campaign's.
  assert.deepEqual(CAMPAIGNS.filter(entry => entry.worldId === tr0.id).map(entry => entry.id).sort(),
    ['queens-3-1-peau', 'queens-3-2-ombelle', 'queens-a-ombelle', 'queens-a-echantillon', 'special-queen-mother-v131', 'special-hive-world-v131'].sort());
  // A new save: world state present, route closed, hidden.
  const fresh = createDefaultSave();
  assert.ok(fresh.galaxy.worldState[tr0.id]); assert.equal(fresh.galaxy.unlockedWorldIds.includes(tr0.id), false);
  assert.equal(queensWorldHiddenV188(fresh, tr0), true); assert.equal(queensWorldHiddenV188(fresh, nacre), false);
  assert.equal(getJumpReadinessV115(fresh, tr0, WORLDS).reasons.includes('Route verrouillée'), true);
  // An older save (no TR-0 in its world state) is migrated with it, still closed.
  const old = JSON.parse(JSON.stringify(fresh)); delete old.galaxy.worldState[tr0.id];
  const migrated = migrateSave(old);
  assert.ok(migrated.galaxy.worldState[tr0.id]); assert.equal(migrated.galaxy.unlockedWorldIds.includes(tr0.id), false);
  // Injection: every generated route open, many routes completed, weeks of simulation — the generic unlocks never open TR-0.
  const veteran = createDefaultSave();
  veteran.galaxy.unlockedWorldIds = WORLDS.slice(0, 60).map(world => world.id);
  veteran.galaxy.completedCampaignIds = CAMPAIGNS.slice(0, 120).map(entry => entry.id);
  for (let step = 0; step < 6; step += 1) advanceGalaxy(veteran, { hours: 96, generateCrisis: false });
  assert.equal(veteran.galaxy.unlockedWorldIds.length, 64, 'the 64 generated routes are all open');
  assert.equal(veteran.galaxy.unlockedWorldIds.includes(tr0.id), false);
  assert.equal(queensWorldHiddenV188(veteran, tr0), true);
  assert.match(read('src/save.js'), /WORLDS\.find\(\(world\) => !world\.hiddenUntilV188 && !save\.galaxy\.unlockedWorldIds\.includes\(world\.id\)\)/, 'long-range recon skips a hidden world');
  assert.match(read('src/world-crisis.js'), /WORLDS\.filter\(\(world\) => !world\.hiddenUntilV188 && !unlocked\.has\(world\.id\)\)/, 'emergency routes skip a hidden world');
  // Once revealed, the generic simulation keeps it open and still opens nothing else by mistake.
  veteran.galaxy.unlockedWorldIds.push(tr0.id);
  advanceGalaxy(veteran, { hours: 24, generateCrisis: false });
  assert.equal(veteran.galaxy.unlockedWorldIds.length, 65); assert.equal(veteran.galaxy.unlockedWorldIds.at(-1), tr0.id);
  assert.match(read('src/app.js'), /WORLDS\.filter\(\(world\) => !queensWorldHiddenV188\(saveSystem\.data, world\) && JSON\.stringify\(world\)/, 'the galaxy map lists no hidden world');
});

test('save field sideCampaignsV188 is additive and normalised', () => {
  const fresh = createDefaultSave();
  assert.deepEqual(fresh.sideCampaignsV188, createSideCampaignsV188());
  const old = JSON.parse(JSON.stringify(fresh)); delete old.sideCampaignsV188;
  assert.deepEqual(migrateSave(old).sideCampaignsV188, createSideCampaignsV188(), 'an older save has received no call');
  const junk = normalizeSideCampaignsV188({ queens: { phase: 'nope', done: ['queens-1-1-quai'], raskEgg: 'seize', callDay: -3, specimen: 'inez', arrivedTr0Day: 4, eggCrisis: { phase: 'alert', crisisId: 'x' } } });
  assert.deepEqual(junk.queens, createSideCampaignsV188().queens);
  const kept = normalizeSideCampaignsV188({ queens: { phase: 'accepted', callDay: 4, acceptedDay: 5, arrivedDay: 19, done: ['queens-1-5-rask', 'x', 'queens-1-1-quai'],
    contracts: { pool: 2, junk: 4, gallery: 1 }, raskEgg: 'destroy', scenesSeen: ['queens-1-1-quai', 'queens-1-2-bassins', 'arc1-debrief', 'tr0-arrival'],
    arrivedEchoDay: 40, arrivedTr0Day: 60, specimen: 'bishop', eggCrisis: { phase: 'alert', crisisId: 'crisis-1' } } }).queens;
  assert.deepEqual(kept.done, ['queens-1-1-quai', 'queens-1-5-rask']);
  assert.deepEqual(kept.contracts, { pool: 2, gallery: 1 });
  assert.equal(kept.raskEgg, 'destroy');
  assert.deepEqual(kept.scenesSeen, ['queens-1-1-quai'], 'a scene of an unplayed mission, or a debrief before the arc ends, is dropped');
  assert.equal(kept.arrivedEchoDay, null, 'no arrival for an arc that is not open'); assert.equal(kept.arrivedTr0Day, null);
  assert.equal(kept.specimen, null, 'no specimen choice before its mission'); assert.equal(kept.eggCrisis, null, 'no crisis without a seized egg at TR-0');
  const roundTrip = migrateSave(JSON.parse(JSON.stringify({ ...fresh, sideCampaignsV188: { schema: 188, queens: kept } })));
  assert.deepEqual(roundTrip.sideCampaignsV188.queens, kept);
  // A save of the first lot (Arc 1 complete, no arc-2 fields) is read as it was, with the new fields empty.
  const firstLot = normalizeSideCampaignsV188({ queens: { phase: 'accepted', callDay: 4, acceptedDay: 5, arrivedDay: 19, done: [...QUEENS_ARC1_ORDER_V188], contracts: {}, raskEgg: 'seize',
    scenesSeen: [...QUEENS_ARC1_ORDER_V188, 'arc1-debrief'] } }).queens;
  assert.deepEqual(firstLot.scenesSeen, [...QUEENS_ARC1_ORDER_V188, 'arc1-debrief']);
  assert.deepEqual([firstLot.arrivedEchoDay, firstLot.arrivedTr0Day, firstLot.specimen, firstLot.eggCrisis], [null, null, null, null]);
});

test('the call: after the main campaign only, once, filed late in the alert journal (FR/EN)', () => {
  const before = createDefaultSave();
  assert.equal(mainCampaignCompleteV188(before), false);
  assert.equal(queensCallDueV188(before), false);
  assert.equal(receiveQueensCallV188(before), null);
  for (const id of ['queens-1-1-quai', 'queens-2-1-relais', 'queens-3-1-peau', ...QUEENS_CHAPTER_IDS_V188]) assert.equal(queensLockReasonV188(before, id), 'main', id);
  const credits = createDefaultSave(); credits.storyCampaignV188.act5 = { schema: 188, phase: 'credits', decision: { option: 'hold', ending: 'freight-first' } };
  assert.equal(queensCallDueV188(credits), false, 'the call waits for the end of the credits (owner R1)');
  const save = endedSave(); save.clock.day = 120;
  assert.equal(queensCallDueV188(save), true);
  assert.equal(queensCallDelayV188(save), 9, 'QZ network delay');
  const message = receiveQueensCallV188(save);
  assert.equal(message.kind, 'campaign'); assert.equal(message.sentDay, 111); assert.equal(message.receivedDay, 120);
  assert.equal(queensStateV188(save).phase, 'call'); assert.equal(queensStateV188(save).callDay, 120);
  assert.equal(receiveQueensCallV188(save), null, 'received once');
  assert.equal(pushCampaignTravelMessageV188(save, message), true);
  assert.equal(pushCampaignTravelMessageV188(save, message), false, 'filed once');
  const worldName = id => worldOf(id)?.name || id;
  const [fr] = travelMessagesListV188(save, 'fr', worldName), [en] = travelMessagesListV188(save, 'en', worldName);
  assert.match(fr.from, /Sous-Récif/); assert.match(fr.body, /jour 111, reçu 9 jours plus tard/);
  assert.match(en.body, /day 111, received 9 days later/);
  assert.match(queensCallTextV188(save, 'fr', { fuel: 4 }), /jour 111.*\n.*Nacre-7 · 4 unités de carburant · 14 jours en hypersommeil/s);
  assert.match(queensCallTextV188(save, 'en', { fuel: 4 }), /day 111.*Nacre-7 · 4 fuel units · 14 days in hypersleep/s);
  assert.equal(queensLockReasonV188(save, 'queens-1-1-quai'), 'call');
  // Relayed by a retaken Asphodèle's relay room: 2 days.
  const relayed = endedSave(); relayed.galaxy.completedCampaignIds.push('station-s4');
  assert.equal(queensCallDelayV188(relayed, { relayRoomReady: true }), 2);
  assert.equal(queensCallDelayV188(relayed, { relayRoomReady: false }), 9);
  assert.equal(normalizeTravelMessagesV188({ messages: [message] }).messages.length, 1, 'the journal admits the campaign kind');
});

test('acceptance opens Nacre-7; the real jump costs fuel and 14 days; the arrival is recorded once', () => {
  const save = endedSave(); save.clock.day = 120;
  receiveQueensCallV188(save);
  save.galaxy.unlockedWorldIds = save.galaxy.unlockedWorldIds.filter(id => id !== QUEENS_NACRE_WORLD_ID_V188);
  assert.equal(getJumpReadinessV115(save, nacre, WORLDS).reasons.includes('Route verrouillée'), true);
  assert.equal(acceptQueensCallV188(save), true);
  assert.equal(acceptQueensCallV188(save), false, 'accepted once');
  assert.ok(save.galaxy.unlockedWorldIds.includes(QUEENS_NACRE_WORLD_ID_V188));
  assert.equal(save.galaxy.unlockedWorldIds.includes(QUEENS_TR0_WORLD_ID_V188), false, 'TR-0 stays hidden');
  assert.equal(queensLockReasonV188(save, 'queens-1-1-quai'), 'orbit');
  assert.match(queensLockTextV188('orbit', 'en'), /orbit of Nacre-7/);
  const readiness = getJumpReadinessV115(save, nacre, WORLDS);
  assert.deepEqual(readiness.reasons, []); assert.equal(readiness.fuel, 2 + Math.ceil(nacre.danger / 3));
  const fuel = save.galaxy.resources.fuel, day = save.clock.day;
  const settlement = jumpToNacre(save);
  assert.equal(settlement.status, 'arrived');
  assert.equal(save.galaxy.resources.fuel, Math.max(fuel, 40) - readiness.fuel);
  assert.equal(save.clock.day, day + JUMP_TRAVEL_DAYS_V188);
  assert.equal(queensStateV188(save).arrivedDay, day + JUMP_TRAVEL_DAYS_V188);
  const ids = normalizeTravelMessagesV188(save.travelMessagesV188).messages.map(message => message.id);
  assert.ok(ids.some(id => id.startsWith('destination-')), 'the existing late destination call');
  assert.equal(ids.filter(id => id.startsWith('campaign-queens-arrival')).length, 1, 'Navarre on arrival');
  assert.equal(recordQueensArrivalV188(save, settlement), null, 'a reload does not record it twice');
  assert.equal(queensLockReasonV188(save, 'queens-1-1-quai'), null);
  assert.equal(queensSnapshotV188(save, 'fr').orbit, 'Le Tantalus est en orbite de Nacre-7.');
});

test('Arc 1: mission order, side missions once, contracts repeat; the chapter counts only when the arc reaches it', () => {
  const save = atNacre();
  const open = () => filterQueensCampaignsV188(save, ALL).map(entry => entry.id);
  assert.deepEqual(open(), ['queens-1-1-quai']);
  assert.equal(queensLockReasonV188(save, 'queens-a-navarre'), 'arrival');
  assert.equal(queensLockReasonV188(save, QUEENS_ABYSS_CHAPTER_ID_V188), 'previous', 'Abysse Noir is locked until its place in Arc 1 (owner decision)');
  for (const id of [...QUEENS_ARC2_ORDER_V188, ...QUEENS_ARC3_ORDER_V188, 'queens-a-mineurs', 'queens-l-galerie', 'queens-a-ombelle']) assert.equal(queensLockReasonV188(save, id), 'arc', id);
  // Injection: the chapter resolved out of order (a replay) is not counted.
  assert.equal(applyQueensOperationResultV188(save, { success: true, campaignId: QUEENS_ABYSS_CHAPTER_ID_V188 }), null);
  assert.equal(applyQueensOperationResultV188(save, { success: true, campaignId: QUEENS_BROODSTORM_CHAPTER_ID_V188 }), null, 'a chapter of a later arc changes nothing');
  assert.equal(applyQueensOperationResultV188(save, { success: false, campaignId: 'queens-1-1-quai' }), null, 'a failure changes nothing');
  assert.deepEqual(complete(save, 'queens-1-1-quai'), { kind: 'step', id: 'queens-1-1-quai', arc: 1, arcComplete: false });
  assert.deepEqual(open().sort(), ['queens-1-2-bassins', 'queens-a-filets', 'queens-a-navarre', 'queens-a-phare', 'queens-l-bassin', 'queens-l-boites', 'queens-l-canots'].sort());
  complete(save, 'queens-a-navarre');
  assert.equal(queensLockReasonV188(save, 'queens-a-navarre'), 'done');
  assert.deepEqual(complete(save, 'queens-l-bassin'), { kind: 'contract', key: 'pool', count: 1 });
  assert.deepEqual(complete(save, 'queens-l-bassin'), { kind: 'contract', key: 'pool', count: 2 });
  assert.equal(queensLockReasonV188(save, 'queens-l-bassin'), null, 'contracts repeat');
  complete(save, 'queens-1-2-bassins');
  assert.equal(queensLockReasonV188(save, QUEENS_ABYSS_CHAPTER_ID_V188), null);
  assert.equal(complete(save, QUEENS_ABYSS_CHAPTER_ID_V188).kind, 'step');
  assert.deepEqual(complete(save, 'queens-1-5-rask'), { kind: 'step', id: 'queens-1-5-rask', arc: 1, arcComplete: true });
  // Leaving Nacre-7's orbit locks the arc again (missions are planned from orbit)…
  save.galaxy.shipWorldIdV116 = 'world-05-lethe'; // injection: the ship's orbit
  assert.equal(queensLockReasonV188(save, 'queens-l-canots'), 'orbit');
  // …but the chapter, once played in its place, is freely replayable from the registry (owner decision of 2026-11-23),
  assert.equal(queensLockReasonV188(save, QUEENS_ABYSS_CHAPTER_ID_V188), null, 'replayable from any orbit');
  assert.ok(filterQueensCampaignsV188(save, ALL).some(entry => entry.id === QUEENS_ABYSS_CHAPTER_ID_V188));
  // and a replay does not advance the campaign again.
  const before = JSON.stringify(queensStateV188(save));
  assert.equal(applyQueensOperationResultV188(save, { success: true, campaignId: QUEENS_ABYSS_CHAPTER_ID_V188 }), null);
  assert.equal(JSON.stringify(queensStateV188(save)), before);
  // Not a queens mission, not locked by this module.
  assert.equal(queensLockReasonV188(save, 'colony-c1'), null);
  // An active operation stays listed.
  save.strategy.currentOperation = { campaignId: 'queens-l-canots' };
  assert.ok(filterQueensCampaignsV188(save, QUEENS_CAMPAIGNS_V188).some(entry => entry.id === 'queens-l-canots'));
});

test('Arc 1: return scenes, CQ-02, the Rask choice and the debrief, once each and in order; the choice opens Echo Basin', () => {
  const save = atNacre();
  save.galaxy.unlockedWorldIds = save.galaxy.unlockedWorldIds.filter(id => id !== QUEENS_ECHO_WORLD_ID_V188); // injection: route closed, to see it open
  for (const id of QUEENS_ARC1_ORDER_V188) complete(save, id);
  complete(save, 'queens-a-navarre');
  const seen = [];
  for (let id = queensReturnSceneDueV188(save); id; id = queensReturnSceneDueV188(save)) {
    assert.ok(QUEENS_SCENES_V188[id].title.fr && QUEENS_SCENES_V188[id].text.en, id);
    assert.equal(markQueensSceneSeenV188(save, id), true); assert.equal(markQueensSceneSeenV188(save, id), false); seen.push(id);
  }
  assert.deepEqual(seen, [...QUEENS_ARC1_ORDER_V188, 'queens-a-navarre']);
  assert.equal(QUEENS_SCENE_CINEMATICS_V188[QUEENS_ABYSS_CHAPTER_ID_V188], 'cin-cq-02', 'CQ-02 closes 1.4');
  assert.equal(queensArc1DebriefDueV188(save), false, 'the debrief waits for the choice');
  assert.equal(queensDebriefDueV188(save), null);
  assert.equal(queensRaskChoicePendingV188(save), true);
  assert.deepEqual(queensPendingChoiceV188(save)?.id, 'rask');
  assert.equal(queensArcOpenV188(save, 2), false); assert.equal(save.galaxy.unlockedWorldIds.includes(QUEENS_ECHO_WORLD_ID_V188), false);
  assert.equal(chooseQueensRaskEggV188(save, 'keep'), false);
  assert.equal(chooseQueensV188(save, 'rask', 'seize'), true);
  assert.equal(chooseQueensRaskEggV188(save, 'destroy'), false, 'the choice cannot be taken back');
  assert.equal(queensArcOpenV188(save, 2), true);
  assert.ok(save.galaxy.unlockedWorldIds.includes(QUEENS_ECHO_WORLD_ID_V188), 'the route to Echo Basin opens with the choice');
  const consequences = queensConsequencesV188(save);
  assert.equal(consequences.qz17ThreadPiece, true); assert.equal(consequences.biologicalRiskAboard, true, 'the risk is recorded now (owner decision)');
  assert.equal(consequences.companySpecimen, false); assert.equal(consequences.eggCrisisOutcome, null);
  assert.equal(queensEggCrisisDueV188(save), false, 'the crisis does not break out in Arc 1');
  assert.equal(queensArc1DebriefDueV188(save), true); assert.equal(queensDebriefDueV188(save), 'arc1-debrief');
  const debrief = queensArc1DebriefV188(save, 'fr');
  assert.match(debrief.text, /sous scellés à bord/); assert.match(debrief.text, /carnets de Navarre/); assert.match(debrief.text, /route d’Echo Basin est ouverte/);
  assert.match(queensArc1DebriefV188(save, 'en').text, /route to Echo Basin is open/);
  assert.doesNotMatch(debrief.text, /pas encore jouable/);
  assert.deepEqual(queensDebriefV188(save, 'arc1-debrief', 'fr'), debrief);
  assert.equal(markQueensSceneSeenV188(save, 'arc1-debrief'), true);
  assert.equal(queensArc1DebriefDueV188(save), false); assert.equal(queensDebriefDueV188(save), null);
  const migrated = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(migrated.sideCampaignsV188.queens, queensStateV188(save), 'choices and scenes survive a reload');
  for (const choice of ['release', 'destroy']) {
    const other = JSON.parse(JSON.stringify(save)); other.sideCampaignsV188.queens.raskEgg = null;
    assert.equal(chooseQueensRaskEggV188(other, choice), true);
    assert.equal(queensConsequencesV188(other).companySpecimen, choice === 'release');
    assert.equal(queensConsequencesV188(other).biologicalRiskAboard, false);
    for (const lang of ['fr', 'en']) assert.ok(QUEENS_RASK_DIALOG_V188.results[choice][lang] && QUEENS_RASK_DIALOG_V188.options[choice][lang]);
  }
  const snapshot = queensSnapshotV188(save, 'en', { fuelByWorld: { [QUEENS_ECHO_WORLD_ID_V188]: 6 } });
  assert.equal(snapshot.arc1Complete, true); assert.equal(snapshot.choice, 'Royal egg seized');
  assert.deepEqual(snapshot.arcs[0].steps.map(step => step.label), ['1.1', '1.2', '1.3-1.4', '1.5']);
  assert.equal(snapshot.currentArc, 2, 'the panel moves on to Arc 2');
  assert.deepEqual(snapshot.steps.map(step => step.label), ['2.1', '2.2', '2.3', '2.4', '2.5']);
  assert.match(snapshot.orbit, /jump to Echo Basin \(6 fuel · 14 days in hypersleep\)/);
  assert.deepEqual(snapshot.later, ['Arc 3 · origin of the lineages: unknown world — opens after the previous arc'], 'TR-0 is not named before Arc 2 reveals it');
  assert.ok(snapshot.notes.some(note => /Biological risk aboard/.test(note)));
  // A save of the first lot (Arc 1 finished before Echo Basin existed in the campaign): the briefing table opens the route.
  const firstLot = JSON.parse(JSON.stringify(save)); firstLot.galaxy.unlockedWorldIds = firstLot.galaxy.unlockedWorldIds.filter(id => id !== QUEENS_ECHO_WORLD_ID_V188);
  assert.equal(queensCampaignUpkeepDueV188(firstLot), true);
  assert.equal(syncQueensRoutesV188(firstLot), true); assert.equal(syncQueensRoutesV188(firstLot), false, 'idempotent');
  assert.ok(firstLot.galaxy.unlockedWorldIds.includes(QUEENS_ECHO_WORLD_ID_V188)); assert.equal(queensCampaignUpkeepDueV188(firstLot), false);
});

test('Arc 2, Echo Basin: travel, order, Broodstorm in its place, gated side missions, CQ-03, debrief; its end reveals TR-0', () => {
  const save = arc1Done('release');
  readScenes(save); // the Arc 1 returns, read at the table before leaving
  assert.equal(queensLockReasonV188(save, 'queens-2-1-relais'), 'orbit-echo');
  assert.match(queensLockTextV188('orbit-echo', 'fr'), /orbite d’Echo Basin/);
  const readiness = getJumpReadinessV115(save, echoBasin, WORLDS);
  assert.deepEqual(readiness.reasons, []); assert.equal(readiness.fuel, 2 + Math.ceil(echoBasin.danger / 3));
  const day = save.clock.day, settlement = jumpTo(save, echoBasin);
  assert.equal(settlement.status, 'arrived'); assert.equal(save.clock.day, day + JUMP_TRAVEL_DAYS_V188);
  assert.equal(queensStateV188(save).arrivedEchoDay, save.clock.day);
  const arrival = normalizeTravelMessagesV188(save.travelMessagesV188).messages.filter(message => message.id.startsWith('campaign-queens-arrival-echo-'));
  assert.equal(arrival.length, 1);
  const worldName = id => worldOf(id)?.name || id;
  assert.ok(travelMessagesListV188(save, 'fr', worldName, 20).some(message => /Gorge-Seize/.test(message.from) && /Posez-vous sur une tour/.test(message.body)));
  assert.ok(travelMessagesListV188(save, 'en', worldName, 20).some(message => /Land on a tower/.test(message.body)));
  assert.equal(recordQueensArrivalV188(save, settlement), null, 'recorded once');
  assert.equal(queensReturnSceneDueV188(save), 'echo-arrival');
  const open = () => filterQueensCampaignsV188(save, ALL).map(entry => entry.id).filter(id => id !== QUEENS_ABYSS_CHAPTER_ID_V188);
  assert.deepEqual(open(), ['queens-2-1-relais']);
  assert.equal(queensLockReasonV188(save, 'queens-a-mineurs'), 'arrival-echo');
  assert.equal(queensLockReasonV188(save, QUEENS_BROODSTORM_CHAPTER_ID_V188), 'previous', 'Broodstorm is locked until its place in Arc 2');
  assert.equal(queensLockReasonV188(save, 'queens-1-1-quai'), 'orbit', 'Arc 1 missions stay on Nacre-7');
  assert.deepEqual(complete(save, 'queens-2-1-relais'), { kind: 'step', id: 'queens-2-1-relais', arc: 2, arcComplete: false });
  // Side missions and contracts open after 2.1; Rask's needs the egg left to him, Grue's needs her as an ally.
  assert.equal(queensLockReasonV188(save, 'queens-a-rask'), null, 'the egg was left to Rask');
  assert.equal(queensLockReasonV188(save, 'queens-a-grue'), 'grue');
  assert.match(queensLockTextV188('grue', 'en'), /allies/);
  assert.deepEqual(open().sort(), ['queens-2-2-sol', 'queens-a-mineurs', 'queens-a-rask', 'queens-a-sorensen', 'queens-l-galerie', 'queens-l-falaise', 'queens-l-chargeur'].sort());
  save.colonyMissionsV188 = { ...save.colonyMissionsV188, grue: 'accept' }; // injection: the colony pact with Grue
  assert.equal(queensLockReasonV188(save, 'queens-a-grue'), null);
  for (const egg of ['seize', 'destroy']) {
    const other = arc1Done(egg); jumpTo(other, echoBasin); complete(other, 'queens-2-1-relais');
    assert.equal(queensLockReasonV188(other, 'queens-a-rask'), 'rask', `${egg}: Rask does not call`);
  }
  assert.deepEqual(complete(save, 'queens-l-galerie'), { kind: 'contract', key: 'gallery', count: 1 });
  assert.equal(complete(save, 'queens-a-rask').kind, 'step'); assert.equal(queensLockReasonV188(save, 'queens-a-rask'), 'done');
  assert.equal(queensConsequencesV188(save).raskInformant, true);
  assert.equal(applyQueensOperationResultV188(save, { success: true, campaignId: QUEENS_BROODSTORM_CHAPTER_ID_V188 }), null, 'out of order: a replay');
  complete(save, 'queens-2-2-sol');
  assert.equal(queensLockReasonV188(save, QUEENS_BROODSTORM_CHAPTER_ID_V188), null);
  assert.equal(complete(save, QUEENS_BROODSTORM_CHAPTER_ID_V188).kind, 'step');
  assert.equal(queensLockReasonV188(save, 'queens-2-5-carte'), 'previous');
  complete(save, 'queens-2-4-aire');
  assert.equal(queensWorldHiddenV188(save, tr0), true, 'TR-0 is still hidden before 2.5');
  assert.equal(queensArcCompleteV188(save, 2), false);
  assert.deepEqual(complete(save, 'queens-2-5-carte'), { kind: 'step', id: 'queens-2-5-carte', arc: 2, arcComplete: true });
  assert.equal(queensArcCompleteV188(save, 2), true); assert.equal(queensArcOpenV188(save, 3), true);
  assert.ok(save.galaxy.unlockedWorldIds.includes(QUEENS_TR0_WORLD_ID_V188), '2.5 reveals TR-0 in the same transaction');
  assert.equal(queensWorldHiddenV188(save, tr0), false);
  // Scenes: the arrival first, then the story line, then the side missions; CQ-03 closes 2.4.
  assert.deepEqual(readScenes(save), ['echo-arrival', ...QUEENS_ARC2_ORDER_V188, 'queens-a-rask']);
  assert.equal(QUEENS_SCENE_CINEMATICS_V188['queens-2-4-aire'], 'cin-cq-03');
  for (const id of ['echo-arrival', ...QUEENS_ARC2_ORDER_V188, ...QUEENS_ARC2_SIDE_V188.map(entry => entry.id)]) for (const lang of ['fr', 'en']) {
    const scene = queensSceneV188(save, id, lang); assert.ok(scene.title && scene.text.length > 80 && QUEENS_SCENE_SLOTS_V188.includes(scene.slot), `${id} ${lang}`);
  }
  assert.match(queensSceneV188(save, 'queens-2-5-carte', 'fr').text, /TR-0/);
  assert.equal(queensDebriefDueV188(save), 'arc1-debrief', 'debriefs are read in order');
  markQueensSceneSeenV188(save, 'arc1-debrief');
  assert.equal(queensDebriefDueV188(save), 'arc2-debrief');
  const debrief = queensDebriefV188(save, 'arc2-debrief', 'fr');
  assert.match(debrief.title, /Arc 2/); assert.match(debrief.text, /TR-0 apparaît sur la carte galactique/); assert.match(debrief.text, /Base Ombelle/);
  assert.match(queensDebriefV188(save, 'arc2-debrief', 'en').text, /TR-0 appears on the galaxy map/);
  assert.equal(markQueensSceneSeenV188(save, 'arc2-debrief'), true); assert.equal(queensDebriefDueV188(save), null);
  // Broodstorm is now freely replayable from any orbit; a replay changes nothing.
  save.galaxy.shipWorldIdV116 = 'world-05-lethe'; // injection: the ship's orbit
  assert.equal(queensLockReasonV188(save, QUEENS_BROODSTORM_CHAPTER_ID_V188), null);
  assert.equal(queensLockReasonV188(save, 'queens-l-galerie'), 'orbit-echo');
  assert.equal(applyQueensOperationResultV188(save, { success: true, campaignId: QUEENS_BROODSTORM_CHAPTER_ID_V188 }), null);
  const snapshot = queensSnapshotV188(save, 'fr');
  assert.equal(snapshot.currentArc, 3); assert.deepEqual(snapshot.later, []);
  assert.deepEqual(snapshot.steps.map(step => step.label), ['3.1', '3.2', '3.3-3.4', '3.5']);
  assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(save))).sideCampaignsV188.queens, queensStateV188(save));
});

test('Arc 3, TR-0: travel, CQ-04, the two Red Hive chapters, CQ-05, CQ-06, the specimen choice and the single nuanced ending', () => {
  const save = arc2Done('release');
  complete(save, 'queens-a-rask');
  assert.equal(queensLockReasonV188(save, 'queens-3-1-peau'), 'orbit-tr0');
  const readiness = getJumpReadinessV115(save, tr0, WORLDS);
  assert.deepEqual(readiness.reasons, []); assert.equal(readiness.fuel, 2 + Math.ceil(tr0.danger / 3));
  const day = save.clock.day; jumpTo(save, tr0);
  assert.equal(queensStateV188(save).arrivedTr0Day, day + JUMP_TRAVEL_DAYS_V188);
  assert.equal(normalizeTravelMessagesV188(save.travelMessagesV188).messages.filter(message => message.id.startsWith('campaign-queens-arrival-tr0-')).length, 1);
  assert.match(QUEENS_MESSAGE_TEXT_V188.arrivalTr0.body.en, /Ombelle Base/);
  assert.equal(queensEggCrisisDueV188(save), false, 'no crisis without a seized egg');
  readScenes(save); // Arc 2 scenes and the TR-0 arrival
  assert.ok(queensStateV188(save).scenesSeen.includes('tr0-arrival'));
  assert.equal(QUEENS_SCENE_CINEMATICS_V188['tr0-arrival'], 'cin-cq-04', 'CQ-04: orbital view of TR-0');
  const open = () => filterQueensCampaignsV188(save, ALL).map(entry => entry.id).filter(id => ![QUEENS_ABYSS_CHAPTER_ID_V188, QUEENS_BROODSTORM_CHAPTER_ID_V188].includes(id));
  assert.deepEqual(open(), ['queens-3-1-peau']);
  assert.equal(queensLockReasonV188(save, 'queens-a-ombelle'), 'arrival-tr0');
  for (const id of [QUEENS_MOTHER_CHAPTER_ID_V188, QUEENS_HIVE_WORLD_CHAPTER_ID_V188]) assert.equal(queensLockReasonV188(save, id), 'previous', `${id} is locked until its place`);
  complete(save, 'queens-3-1-peau');
  assert.deepEqual(open().sort(), ['queens-3-2-ombelle', 'queens-a-ombelle', 'queens-a-echantillon'].sort());
  assert.equal(queensConsequencesV188(save).ombelleRegisters, false);
  complete(save, 'queens-3-2-ombelle');
  assert.equal(queensConsequencesV188(save).ombelleRegisters, true, '§19: the registers of Base Ombelle');
  assert.equal(queensLockReasonV188(save, QUEENS_HIVE_WORLD_CHAPTER_ID_V188), 'previous');
  assert.equal(complete(save, QUEENS_MOTHER_CHAPTER_ID_V188).kind, 'step');
  assert.equal(queensCampaignCompleteV188(save), false);
  // The side mission and its decision (§14.8): asked once, with its immediate effect.
  complete(save, 'queens-a-echantillon'); complete(save, 'queens-a-ombelle');
  assert.equal(queensSpecimenChoicePendingV188(save), true); assert.equal(queensPendingChoiceV188(save).id, 'specimen');
  assert.deepEqual([...queensPendingChoiceV188(save).options], ['inez', 'bishop']);
  const research = save.galaxy.resources.research;
  const other = JSON.parse(JSON.stringify(save)), bishop = other.crew.find(member => member.id === 'crew-05-bishop-9'), trust = bishop.loyalty;
  assert.equal(chooseQueensSpecimenV188(save, 'nobody'), false);
  assert.equal(chooseQueensV188(save, 'specimen', 'inez'), true); assert.equal(chooseQueensSpecimenV188(save, 'bishop'), false, 'once');
  assert.equal(save.galaxy.resources.research, research + QUEENS_SPECIMEN_EFFECTS_V188.inez.research);
  assert.equal(queensConsequencesV188(save).antiQueenResearch, true); assert.equal(queensConsequencesV188(save).specimenClaimedLater, false);
  assert.equal(chooseQueensSpecimenV188(other, 'bishop'), true);
  assert.equal(bishop.loyalty, Math.min(100, trust + QUEENS_SPECIMEN_EFFECTS_V188.bishop.bishopLoyalty));
  assert.equal(queensConsequencesV188(other).specimenClaimedLater, true);
  for (const choice of ['inez', 'bishop']) for (const lang of ['fr', 'en']) assert.ok(QUEENS_SPECIMEN_DIALOG_V188.results[choice][lang] && QUEENS_SPECIMEN_DIALOG_V188.options[choice][lang]);
  // The last chapter ends the campaign.
  assert.equal(queensDebriefDueV188(save), 'arc1-debrief');
  for (const id of ['arc1-debrief', 'arc2-debrief']) markQueensSceneSeenV188(save, id);
  assert.equal(queensDebriefDueV188(save), null, 'no ending before 3.5');
  assert.deepEqual(complete(save, QUEENS_HIVE_WORLD_CHAPTER_ID_V188), { kind: 'step', id: QUEENS_HIVE_WORLD_CHAPTER_ID_V188, arc: 3, arcComplete: true });
  assert.equal(queensCampaignCompleteV188(save), true);
  assert.deepEqual(readScenes(save), [...QUEENS_ARC3_ORDER_V188, 'queens-a-ombelle', 'queens-a-echantillon']);
  assert.equal(QUEENS_SCENE_CINEMATICS_V188[QUEENS_MOTHER_CHAPTER_ID_V188], 'cin-cq-05');
  assert.equal(QUEENS_SCENE_CINEMATICS_V188[QUEENS_HIVE_WORLD_CHAPTER_ID_V188], 'cin-cq-06', 'CQ-06 closes 3.5');
  assert.match(queensSceneV188(save, 'queens-3-2-ombelle', 'fr').text, /cargos QZ17 partaient d’ici/);
  assert.equal(queensDebriefDueV188(save), 'campaign-debrief');
  const ending = queensDebriefV188(save, 'campaign-debrief', 'fr');
  assert.match(ending.text, /Les trois lignées sont éteintes/); assert.match(ending.text, /Base Ombelle.*expédiait des œufs vers les mondes du Reach/);
  assert.match(ending.text, /adresse de Khepri Forge/, 'link to campaign 5');
  assert.match(ending.text, /La compagnie garde l’œuf royal/); assert.match(ending.text, /informateur/); assert.match(ending.text, /Inez Harlow garde le Praetorian/);
  assert.match(ending.text, /dernier chercheur/);
  const endingEn = queensDebriefV188(save, 'campaign-debrief', 'en').text;
  assert.match(endingEn, /The three lineages are extinct/); assert.match(endingEn, /Khepri Forge/);
  assert.match(queensDebriefV188(other, 'campaign-debrief', 'en').text, /BISHOP-9 keeps the Praetorian/);
  assert.equal(markQueensSceneSeenV188(save, 'campaign-debrief'), true); assert.equal(queensDebriefDueV188(save), null);
  const snapshot = queensSnapshotV188(save, 'en');
  assert.equal(snapshot.status, 'complete'); assert.equal(snapshot.statusLabel, 'Campaign complete'); assert.equal(snapshot.campaignComplete, true);
  assert.ok(snapshot.notes.includes('Live Praetorian given to Inez'));
  // Both chapters are now freely replayable; replays do not re-advance anything.
  save.galaxy.shipWorldIdV116 = 'world-05-lethe'; // injection: the ship's orbit
  const before = JSON.stringify(queensStateV188(save));
  for (const id of QUEENS_CHAPTER_IDS_V188) { assert.equal(queensLockReasonV188(save, id), null, id); assert.equal(applyQueensOperationResultV188(save, { success: true, campaignId: id }), null); }
  assert.equal(JSON.stringify(queensStateV188(save)), before);
  assert.deepEqual(migrateSave(JSON.parse(JSON.stringify(save))).sideCampaignsV188.queens, queensStateV188(save));
  // The ending waits for an open decision.
  const pending = arc2Done('destroy'); jumpTo(pending, tr0);
  for (const id of QUEENS_ARC3_ORDER_V188.slice(0, 2)) complete(pending, id);
  complete(pending, 'queens-a-echantillon');
  for (const id of QUEENS_ARC3_ORDER_V188.slice(2)) complete(pending, id);
  for (const id of ['arc1-debrief', 'arc2-debrief']) markQueensSceneSeenV188(pending, id);
  assert.equal(queensDebriefDueV188(pending), null, 'the specimen decision first');
  chooseQueensSpecimenV188(pending, 'bishop');
  assert.equal(queensDebriefDueV188(pending), 'campaign-debrief');
  assert.match(queensDebriefV188(pending, 'campaign-debrief', 'fr').text, /a brûlé sur sa plate-forme/);
});

test('the seized egg: risk recorded in Arc 1, the crisis breaks out aboard on waking above TR-0, through the hub crisis API', () => {
  assert.deepEqual({ ...QUEENS_EGG_CRISIS_V188 }, { ...INTERLUDE_CRISIS_V188 }, 'the same hub crisis shape as the Interlude (deck 2, quarantine)');
  const save = arc2Done('seize');
  assert.equal(queensConsequencesV188(save).biologicalRiskAboard, true);
  assert.match(queensDebriefV188(save, 'arc2-debrief', 'fr').text, /sa température monte/);
  assert.equal(queensEggCrisisDueV188(save), false, 'not during Arc 2');
  assert.equal(startQueensEggCrisisV188(save, createHubCrisis), null);
  assert.equal(save.hub.activeCrisis, null);
  jumpTo(save, tr0);
  assert.equal(queensEggCrisisDueV188(save), true, 'due when the crew wakes in TR-0’s orbit');
  assert.equal(queensCampaignUpkeepDueV188(save), true);
  assert.equal(queensLockReasonV188(save, 'queens-3-1-peau'), 'crisis', 'Arc 3 waits, even before the alarm');
  // Another crisis running aboard postpones it (injection: an ordinary synthetic incident).
  const busy = JSON.parse(JSON.stringify(save)); busy.hub.activeCrisis = { id: 'crisis-other', kind: 'synthetic', count: 2, deck: 0, roomId: 'bridge', resolved: false };
  assert.equal(startQueensEggCrisisV188(busy, createHubCrisis), null); assert.equal(busy.hub.activeCrisis.id, 'crisis-other');
  assert.equal(queensEggCrisisDueV188(busy), true, 'tried again later');
  // The real hub crisis API creates the deck-2 quarantine xenomorph crisis.
  const crisis = startQueensEggCrisisV188(save, createHubCrisis);
  assert.ok(crisis?.id);
  assert.deepEqual([save.hub.activeCrisis.kind, save.hub.activeCrisis.deck, save.hub.activeCrisis.roomId, save.hub.activeCrisis.resolved], ['xenomorph', 2, 'quarantine', false]);
  assert.deepEqual(queensStateV188(save).eggCrisis, { phase: 'alert', crisisId: crisis.id, outcome: null });
  assert.equal(startQueensEggCrisisV188(save, createHubCrisis), null, 'started once');
  assert.equal(queensEggCrisisActiveV188(save), true);
  assert.equal(getJumpReadinessV115(save, nacre, WORLDS).reasons.includes('Crise à bord'), true, 'the existing jump rule holds the ship');
  assert.equal(queensLockReasonV188(save, 'queens-3-1-peau'), 'crisis'); assert.match(queensLockTextV188('crisis', 'en'), /quarantine deck/);
  assert.deepEqual(readScenes(save).slice(-2), ['tr0-arrival', 'egg-crisis-alert']);
  assert.match(queensSceneV188(save, 'egg-crisis-alert', 'fr').text, /pont de quarantaine du Tantalus/);
  assert.ok(queensSnapshotV188(save, 'fr').notes.some(note => /ALERTE : l’œuf a éclos/.test(note)));
  assert.equal(reconcileQueensEggCrisisV188(save, createHubCrisis), null, 'coherent: nothing to repair');
  const reloaded = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(reloaded.sideCampaignsV188.queens.eggCrisis, queensStateV188(save).eggCrisis, 'the alert survives a reload');
  assert.equal(reloaded.hub.activeCrisis.id, crisis.id);
  // Outcome 1 — the hub reports the creature neutralised (injection: the hub's own event).
  const won = JSON.parse(JSON.stringify(save));
  assert.equal(resolveQueensEggCrisisV188(won, 'crisis-unrelated', 'resolved'), false);
  const result = resolveHubCrisisEvent(won, { action: 'crisis:resolved', kind: 'xenomorph', crisisId: crisis.id });
  assert.equal(result.handled, true); assert.equal(result.outcome, 'resolved');
  assert.equal(resolveQueensEggCrisisV188(won, result.crisis.id, result.outcome), true);
  assert.equal(resolveQueensEggCrisisV188(won, result.crisis.id, result.outcome), false, 'once');
  assert.deepEqual(queensStateV188(won).eggCrisis, { phase: 'resolved', crisisId: crisis.id, outcome: 'neutralised' });
  assert.equal(queensLockReasonV188(won, 'queens-3-1-peau'), null, 'Arc 3 opens');
  assert.equal(queensConsequencesV188(won).biologicalRiskAboard, false); assert.equal(queensConsequencesV188(won).qz17ThreadPiece, true);
  assert.equal(queensReturnSceneDueV188(won), 'egg-crisis-after');
  assert.match(queensSceneV188(won, 'egg-crisis-after', 'fr').text, /abattue au pont de quarantaine/);
  // Outcome 2 — the team is extracted (player down): the hub applies its damage, the crisis is over all the same.
  const lost = JSON.parse(JSON.stringify(save));
  const down = resolveHubCrisisEvent(lost, { action: 'crisis:player-down', kind: 'xenomorph', crisisId: crisis.id });
  assert.equal(down.outcome, 'player-down');
  assert.equal(resolveQueensEggCrisisV188(lost, down.crisis.id, down.outcome), true);
  assert.equal(queensStateV188(lost).eggCrisis.outcome, 'extracted');
  assert.match(queensSceneV188(lost, 'egg-crisis-after', 'en').text, /crew finished the job/);
  assert.equal(queensLockReasonV188(lost, 'queens-3-1-peau'), null);
  // Reload cases: the hub closed the crisis but the campaign flag was not saved; or the crisis was lost.
  const stale = JSON.parse(JSON.stringify(save));
  resolveHubCrisisEvent(stale, { action: 'crisis:resolved', kind: 'xenomorph', crisisId: crisis.id });
  assert.equal(reconcileQueensEggCrisisV188(stale, createHubCrisis), 'resolved'); assert.equal(queensStateV188(stale).eggCrisis.outcome, 'neutralised');
  const gone = JSON.parse(JSON.stringify(save)); gone.hub.activeCrisis = null;
  assert.equal(reconcileQueensEggCrisisV188(gone, createHubCrisis), 'rearmed');
  assert.equal(gone.hub.activeCrisis.roomId, 'quarantine'); assert.equal(queensStateV188(gone).eggCrisis.crisisId, gone.hub.activeCrisis.id);
  // The ending waits for the crisis and reports its outcome.
  for (const id of QUEENS_ARC3_ORDER_V188) assert.equal(complete(won, id)?.kind, 'step', id);
  for (const id of ['arc1-debrief', 'arc2-debrief']) markQueensSceneSeenV188(won, id);
  assert.match(queensDebriefV188(won, 'campaign-debrief', 'fr').text, /a éclos à bord au-dessus de TR-0 ; la créature a été abattue/);
  assert.equal(queensConsequencesV188(won).eggCrisisOutcome, 'neutralised');
  // No crisis for the other two choices.
  for (const egg of ['release', 'destroy']) { const other = arc2Done(egg); jumpTo(other, tr0); assert.equal(queensEggCrisisDueV188(other), false, egg); assert.equal(queensLockReasonV188(other, 'queens-3-1-peau'), null, egg); }
});

test('encounters: each mission meets its lineage only, admissibility before generic logic, specialised bosses stay in their chapters', async () => {
  const all = [...QUEENS_REEF_LINEAGE_IDS_V188, ...QUEENS_RASK_SQUAD_IDS_V188, ...QUEENS_EXCLUDED_AQUATIC_IDS_V188, ...QUEENS_BURROWER_LINEAGE_IDS_V188,
    ...QUEENS_AERIAL_LINEAGE_IDS_V188, ...QUEENS_EYRIE_ROYAL_IDS_V188, ...QUEENS_MOTHER_LINEAGE_IDS_V188];
  for (const id of all) assert.ok(ENEMIES.some(enemy => enemy.id === id), id);
  const behaviour = id => resolveEnemyBehaviorV119(ENEMIES.find(enemy => enemy.id === id));
  const name = id => ENEMIES.find(enemy => enemy.id === id).name;
  assert.deepEqual(QUEENS_REEF_LINEAGE_IDS_V188.map(id => behaviour(id).id), ['drone', 'ambusher', 'runner', 'ambusher', 'acid']);
  // §14.3: the castes of each lineage, as the catalogue names them.
  assert.deepEqual(QUEENS_BURROWER_LINEAGE_IDS_V188.map(name), ['Drone / Big Chap', 'Crusher', 'Burster']);
  assert.deepEqual(QUEENS_AERIAL_LINEAGE_IDS_V188.map(name), ['Runner', 'Spitter']);
  assert.deepEqual(QUEENS_MOTHER_LINEAGE_IDS_V188.map(name), ['Drone / Big Chap', 'Praetorian']);
  assert.deepEqual(QUEENS_EYRIE_ROYAL_IDS_V188.map(name), ['Queen']);
  assert.deepEqual(QUEENS_BURROWER_LINEAGE_IDS_V188.map(id => behaviour(id).id), ['drone', 'charger', 'explosive']);
  assert.deepEqual(QUEENS_AERIAL_LINEAGE_IDS_V188.map(id => behaviour(id).id), ['runner', 'acid']);
  assert.deepEqual(QUEENS_MOTHER_LINEAGE_IDS_V188.map(id => behaviour(id).id), ['drone', 'guardian']);
  assert.equal(behaviour('enemy-008-queen').id, 'royal');
  // Admissibility: every admitted caste has a behaviour the land templates run; the aquatic one is not admitted.
  for (const id of all.filter(entry => !QUEENS_EXCLUDED_AQUATIC_IDS_V188.includes(entry))) assert.notEqual(behaviour(id).runtimeBehavior, 'aquatic', `${id} walks on the land templates`);
  for (const id of QUEENS_EXCLUDED_AQUATIC_IDS_V188) assert.equal(behaviour(id).runtimeBehavior, 'aquatic', `${id} swims: not admitted on land`);
  assert.equal(behaviour('enemy-043-weyland-yutani-commando').family, 'human');
  assert.equal(queensEncounterCatalogV188('colony-c1', ENEMIES), ENEMIES, 'other missions keep the whole catalogue');
  for (const id of QUEENS_CHAPTER_IDS_V188) { assert.equal(queensEncounterCatalogV188(id, ENEMIES), ENEMIES, `${id} keeps its own specialised roster`); assert.equal(queensEncounterIdsV188(id), null); assert.equal(queensLineagesOfV188(id), null); }
  const worlds = { 1: nacre, 2: echoBasin, 3: tr0 };
  const expected = campaign => {
    if (campaign.queensArcV188 === 1) return campaign.id === 'queens-1-5-rask' ? [...QUEENS_REEF_LINEAGE_IDS_V188, ...QUEENS_RASK_SQUAD_IDS_V188] : [...QUEENS_REEF_LINEAGE_IDS_V188];
    if (campaign.queensArcV188 === 3) return [...QUEENS_MOTHER_LINEAGE_IDS_V188];
    const ids = new Set(queensLineagesOfV188(campaign.id).flatMap(key => key === 'burrower' ? QUEENS_BURROWER_LINEAGE_IDS_V188 : QUEENS_AERIAL_LINEAGE_IDS_V188));
    if (campaign.id === 'queens-2-4-aire') ids.add('enemy-008-queen');
    if (campaign.id === 'queens-a-rask') ids.add('enemy-043-weyland-yutani-commando');
    return [...ids];
  };
  assert.deepEqual(queensLineagesOfV188('queens-2-2-sol'), ['burrower'], '2.2: the ground opens');
  assert.deepEqual(queensLineagesOfV188('queens-2-4-aire'), ['aerial'], '2.4: the eyrie');
  assert.deepEqual(queensLineagesOfV188('queens-3-1-peau'), ['mother']);
  for (const campaign of QUEENS_CAMPAIGNS_V188) {
    const roster = queensEncounterCatalogV188(campaign.id, ENEMIES), allowed = expected(campaign);
    assert.deepEqual(roster.map(enemy => enemy.id).sort(), [...allowed].sort(), campaign.id);
    const royal = roster.filter(enemy => behaviour(enemy.id).id === 'royal').map(enemy => enemy.id);
    assert.deepEqual(royal, campaign.id === 'queens-2-4-aire' ? ['enemy-008-queen'] : [], `${campaign.id}: a royal caste only on the royal hunt`);
    const selection = selectEnemyEncounterCatalog(roster, { world: worlds[campaign.queensArcV188], campaign, levelSeed: LEVEL_SEEDS[0] }, 26);
    assert.ok(selection.selected.length >= 1 && selection.selected.every(enemy => allowed.includes(enemy.id)), `${campaign.id}: generic selection stays in the lineage`);
    if (campaign.id === 'queens-2-4-aire') assert.ok(selection.selected.some(enemy => enemy.id === 'enemy-008-queen'), 'the royal hunt meets its Queen');
  }
  // Production engine, one mission per lineage: every spawned enemy belongs to the roster.
  for (const id of ['queens-1-1-quai', 'queens-1-5-rask', 'queens-2-2-sol', 'queens-2-4-aire', 'queens-3-1-peau']) {
    const campaign = campaignOf(id), world = worlds[campaign.queensArcV188], missionLevel = buildMissionLevelV52({ campaign, world, levelSeeds: LEVEL_SEEDS });
    const run = await fixture({ campaign, seed: 7, keepEnemies: true, options: { world, missionLevel, enemyCatalog: queensEncounterCatalogV188(id, ENEMIES) } });
    const allowed = queensEncounterCatalogV188(id, ENEMIES).map(enemy => enemy.id), spawned = run.engine.spawnedEnemiesV188;
    assert.ok(spawned.length > 0, `${id}: enemies spawned`);
    for (const enemy of spawned) assert.ok(allowed.includes(String(enemy.id).split(':')[0]), `${id}: ${enemy.id} ${enemy.name} is of the lineage`);
    assert.equal(run.engine.mission.state, 'active');
  }
});

test('cinematics CQ-01 to CQ-06 play on the existing Canvas player (placeholders, no image source) and are all triggered', () => {
  assert.deepEqual(QUEENS_CINEMATIC_IDS_V188, ['cin-cq-01', 'cin-cq-02', 'cin-cq-03', 'cin-cq-04', 'cin-cq-05', 'cin-cq-06']);
  assert.deepEqual(QUEENS_CINEMATICS_WIRED_V188, QUEENS_CINEMATIC_IDS_V188);
  assert.deepEqual(['cin-cq-01', ...Object.values(QUEENS_SCENE_CINEMATICS_V188)].sort(), [...QUEENS_CINEMATIC_IDS_V188], 'each one has exactly one trigger');
  for (const sceneId of Object.keys(QUEENS_SCENE_CINEMATICS_V188)) assert.ok(QUEENS_SCENES_V188[sceneId], `${sceneId} is a scene`);
  const ctx = new Proxy({ measureText: value => ({ width: String(value).length * 9 }), createLinearGradient: () => ({ addColorStop() {} }),
    createRadialGradient: () => ({ addColorStop() {} }) }, { get: (object, key) => key in object ? object[key] : () => {} });
  for (const id of QUEENS_CINEMATIC_IDS_V188) {
    assert.ok(CINEMATIC_IDS_V188.includes(id), id); assert.match(id, /^cin-[a-z0-9-]{1,40}$/, 'storable in cinematicsSeen');
    assert.ok(CINEMATICS_V188[id].title.fr && CINEMATICS_V188[id].title.en);
    assert.deepEqual(queensCinematicSourcesV188(id), []);
    const duration = cinematicDurationV188(id); assert.ok(duration >= 10 && duration <= 40, `${id}: ${duration} s`);
    for (let time = 0; time < duration; time += 1.5) for (const language of ['fr', 'en']) for (const reducedMotion of [false, true])
      assert.ok(drawCinematicFrameV188(ctx, id, time, { images: {}, language, reducedMotion }), `${id} @${time}`);
    for (const shot of CINEMATICS_V188[id].shots) if (shot.line) assert.ok(shot.line.text.fr && shot.line.text.en);
  }
  assert.equal(queensCinematicSourcesV188('cin-00'), null, 'other cinematics keep their sources');
  const loader = new QueensSceneLoaderV188();
  for (const slot of QUEENS_SCENE_SLOTS_V188) assert.equal(loader.draw(ctx, slot, 640, 280, { language: 'en' }), true, slot);
  for (const scene of Object.values(QUEENS_SCENES_V188)) { assert.ok(QUEENS_SCENE_SLOTS_V188.includes(scene.slot), scene.slot); assert.ok(scene.title.fr && scene.title.en && scene.text.fr && scene.text.en); }
  for (const dialog of [QUEENS_CALL_DIALOG_V188, QUEENS_RASK_DIALOG_V188, QUEENS_SPECIMEN_DIALOG_V188]) assert.ok(QUEENS_SCENE_SLOTS_V188.includes(dialog.slot));
});

test('Tantalus quests of the campaign: ship-q-doyle, ship-q-orlov, ship-q-harlow after Arc 2; Harlow opens the bestiary', () => {
  assert.deepEqual(QUEENS_CREW_QUEST_IDS_V188, ['ship-q-doyle', 'ship-q-orlov', 'ship-q-harlow'], 'ids of bible §14.9');
  assert.deepEqual(QUEENS_CREW_QUESTS_V188.map(quest => quest.crewId), ['crew-07-sanaa-doyle', 'crew-08-maksim-orlov', 'crew-09-inez-harlow']);
  assert.deepEqual(QUEENS_CREW_QUESTS_V188.map(quest => quest.title.fr), ['Tirer sur ce qui vole', 'Le vent des canyons', 'L’arbre des lignées']);
  assert.deepEqual(CREW_QUESTS_ALL_V188.slice(-3), [...QUEENS_CREW_QUESTS_V188], 'appended after the sixteen crew quests');
  const offered = (save, quest) => crewQuestActionsV188(save, quest.crewId, 'fr').some(entry => entry.id === quest.id);
  const early = arc1Done('destroy');
  for (const quest of QUEENS_CREW_QUESTS_V188) { assert.equal(offered(early, quest), false, `${quest.id} waits for Arc 2`); assert.equal(acceptCrewQuestV188(early, quest.id), false); }
  assert.equal(crewQuestsSnapshotV188(early, 'en').find(entry => entry.id === 'ship-q-harlow').status, 'locked');
  const save = arc2Done('destroy');
  assert.deepEqual(queensBestiaryV188(save, 'fr', { unlocked: false }), [], 'no bestiary before Inez has classified');
  for (const quest of QUEENS_CREW_QUESTS_V188) {
    assert.equal(offered(save, quest), true, quest.id);
    const member = save.crew.find(entry => entry.id === quest.crewId), loyalty = member.loyalty, research = save.galaxy.resources.research;
    assert.equal(acceptCrewQuestV188(save, quest.id), true);
    for (const [index, step] of quest.steps.entries()) {
      const current = crewQuestStepV188(save, quest.id, 'en');
      assert.equal(current.index, index); assert.ok(current.prompt.length > 40);
      assert.equal(step.options.filter(entry => entry.correct).length, 1, `${quest.id} step ${index}: one reading follows from the evidence`);
      const wrong = answerCrewQuestStepV188(save, quest.id, step.options.find(entry => !entry.correct).id, 'fr');
      assert.equal(wrong.correct, false, 'a wrong reading costs nothing and keeps the step');
      const right = answerCrewQuestStepV188(save, quest.id, step.options.find(entry => entry.correct).id, 'fr');
      assert.equal(right.correct, true); assert.equal(right.done, index === quest.steps.length - 1);
      if (right.done) { assert.equal(right.completion, quest.completion.fr); assert.equal(right.reward.loyalty, quest.reward.loyalty); }
    }
    assert.equal(crewQuestDoneV188(save, quest.id), true);
    assert.equal(member.loyalty, Math.min(100, loyalty + quest.reward.loyalty));
    assert.equal(save.galaxy.resources.research, research + (quest.reward.research || 0));
    assert.equal(offered(save, quest), false, 'done once');
    for (const key of ['title', 'after', 'where', 'offer', 'completion']) assert.ok(quest[key].fr && quest[key].en, `${quest.id}.${key}`);
  }
  const notes = crewQuestNotesV188(save, 'en');
  assert.ok(notes.some(note => /Smartgun \(Doyle\).*still to be produced/.test(note)) && notes.some(note => /Cheyenne \(Orlov\).*still to be produced/.test(note)), 'the unproduced effects are stated');
  // The bestiary: one entry per lineage whose arc is complete (§14.3 texts).
  const unlocked = crewQuestDoneV188(save, 'ship-q-harlow');
  assert.deepEqual(queensBestiaryV188(save, 'en', { unlocked }).map(entry => entry.key), ['reef', 'burrower', 'aerial']);
  assert.match(queensBestiaryV188(save, 'fr', { unlocked })[1].text, /Drone, Crusher, Burster/);
  assert.equal(queensSnapshotV188(save, 'fr', { bestiaryUnlocked: unlocked }).bestiary.length, 3);
  jumpTo(save, tr0); for (const id of QUEENS_ARC3_ORDER_V188) complete(save, id);
  assert.deepEqual(queensBestiaryV188(save, 'en', { unlocked }).map(entry => entry.key), ['reef', 'burrower', 'aerial', 'mother']);
  const migrated = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(normalizeCrewQuestsV188(migrated.crewQuestsV188), normalizeCrewQuestsV188(save.crewQuestsV188), 'the quests survive a reload');
});

test('app wiring: lists, launch lock, result, jump arrival and egg crisis, briefing table, roster, hidden world', () => {
  const app = read('src/app.js');
  assert.match(app, /function unlockedCampaignsV188\(list\) \{ return filterQueensCampaignsV188\(saveSystem\.data, filterColonyCampaignsV188\(/);
  assert.match(app, /const queensLockV188 = activeOperation \? null : queensLockReasonV188\(saveSystem\.data, campaign\.id\);/);
  assert.match(app, /const queensChangeV188 = applyQueensOperationResultV188\(candidate, \{ success: resolvedSuccess, campaignId: operation\.campaignId \}\);/);
  assert.ok(app.indexOf('applyQueensOperationResultV188(candidate') < app.indexOf('advanceGalaxy(candidate, { hours: resolvedSuccess ? 4 : 8'), 'inside the resolution transaction');
  assert.match(app, /const queensArrivalV188 = recordQueensArrivalV188\(saveSystem\.data, settlement\);/);
  assert.ok(app.indexOf('recordQueensArrivalV188(saveSystem.data, settlement)') > app.indexOf('deliverTravelMessagesV188(saveSystem.data, settlement'), 'after the late messages, same transaction');
  assert.match(app, /if \(queensEggCrisisDueV188\(saveSystem\.data\) && startQueensEggCrisisV188\(saveSystem\.data, createForcedHubCrisisV188\)\)/, 'the egg hatches in the jump settlement');
  assert.ok(app.indexOf('startQueensEggCrisisV188(saveSystem.data, createForcedHubCrisisV188)') > app.indexOf('recordQueensArrivalV188(saveSystem.data, settlement)'), 'after the arrival is recorded');
  assert.match(app, /import \{ createHubCrisis as createForcedHubCrisisV188 \} from '\.\/world-crisis-core\.js';/, 'the hub crisis API, as the Interlude uses it');
  assert.match(app, /if \(resolveQueensEggCrisisV188\(saveSystem\.data, result\.crisis\?\.id \|\| interaction\.crisisId, result\.outcome\)\)/, 'the hub outcome ends the egg crisis');
  assert.match(app, /if \(colonyReturnOnViewV188\(\)\) return;\n  \/\/ V188 spec 011[^\n]*\n  if \(queensOnViewV188\(\)\) return;/);
  assert.match(app, /const pendingChoice = queensPendingChoiceV188\(saveSystem\.data\);/);
  assert.match(app, /const debriefId = queensDebriefDueV188\(saveSystem\.data\);/);
  assert.match(app, /bestiaryUnlocked: crewQuestDoneV188\(saveSystem\.data, 'ship-q-harlow'\)/);
  assert.match(app, /enemyCatalog: queensEncounterCatalogV188\(campaign\.id, ENEMIES\),/);
  assert.match(app, /renderStationFrontV188\(\);\n  renderQueensPanelV188\(\);/);
  assert.match(read('index.html'), /<section id="side-campaign-queens-v188" class="story-dossier-v188 side-campaign-v188" aria-label="La Saison des Reines"><\/section>/);
  assert.match(read('src/save.js'), /migrated\.sideCampaignsV188 = normalizeSideCampaignsV188\(source\.sideCampaignsV188\);/);
  // The Interlude module is not edited by this lot: the campaign only reuses the hub crisis API.
  assert.doesNotMatch(read('src/story-campaign-v188.js'), /queens|Queens/);
  const sw = read('sw.js');
  for (const file of ['side-campaign-queens-v188.js', 'queens-cinematics-v188.js', 'queens-crew-quests-v188.js']) assert.ok(sw.includes(`'/src/${file}'`), file);
  const release = read('scripts/verify-public-release-v86.mjs');
  for (const path of ['scripts/verify-side-campaign-queens-v188.mjs', 'scripts/qa-side-campaign-queens-v188.mjs', 'specs/011-saison-des-reines/spec.md', 'specs/011-saison-des-reines/plan.md', 'specs/011-saison-des-reines/tasks.md'])
    assert.ok(release.includes(`'${path}'`), path);
  assert.match(read('package.json'), /scripts\/verify-side-campaign-queens-v188\.mjs/);
});

test('English catalogue: mission names, summaries and descriptions are reviewed and listed in the Tantalus delta', () => {
  for (const campaign of QUEENS_CAMPAIGNS_V188) for (const key of ['name', 'summary', 'description']) {
    assert.ok(EN_CATALOG_V185[campaign[key]], `${campaign.id}.${key} catalogued`);
    assert.ok(TANTALUS_I18N_DELTA_V188.exact.added.includes(campaign[key]), `${campaign.id}.${key} in the delta`);
  }
  for (const campaign of QUEENS_CAMPAIGNS_V188) assert.equal(EN_CATALOG_V185[campaign.name], QUEENS_NAMES_EN_V188[campaign.id]);
  assert.ok(EN_CATALOG_V185[tr0.description], 'TR-0 description catalogued');
  assert.ok(TANTALUS_I18N_DELTA_V188.exact.added.includes(tr0.description));
});
