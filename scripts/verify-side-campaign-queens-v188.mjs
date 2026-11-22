// V188 — first side campaign « La Saison des Reines » (spec 011): campaign frame and Arc 1 (Nacre-7).
// Pure rules on candidate saves built by `createDefaultSave` / `migrateSave`, the real galaxy jump
// (`prepareJumpV116` → `confirmJumpV115` → 14 days → late messages), the real V131 chapter receipt
// check, and the production engine (engine-host-v188.mjs) for the encounter rosters.
// Fixtures: Act V phase set to 'complete' on the candidate save (the main campaign's end, as
// `finishAct5CreditsV188` writes it); jump clock `now` values passed explicitly; seed 7 for the levels.
// Injections are declared where used: the ship's orbit, the fuel stock and the operation results
// (`applyQueensOperationResultV188` called as `finalizeOperation` calls it after a resolved success).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAMPAIGNS, WORLDS, LEVEL_SEEDS, ENEMIES, validateContent } from '../src/content.js';
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
import { CINEMATICS_V188, CINEMATIC_IDS_V188, cinematicDurationV188, drawCinematicFrameV188 } from '../src/story-cinematics-v188.js';
import { QUEENS_CINEMATIC_IDS_V188, QUEENS_CINEMATICS_WIRED_V188, QueensSceneLoaderV188, QUEENS_SCENE_SLOTS_V188, queensCinematicSourcesV188 } from '../src/queens-cinematics-v188.js';
import { EN_CATALOG_V185 } from '../src/i18n-en-catalog-v185.js';
import { TANTALUS_I18N_DELTA_V188 } from './i18n-tantalus-xeno-merge-v188.mjs';
import { fixture } from './engine-host-v188.mjs';
import {
  QUEENS_CAMPAIGNS_V188, QUEENS_CAMPAIGN_IDS_V188, QUEENS_ARC1_ORDER_V188, QUEENS_ARC1_SIDE_V188, QUEENS_ARC1_CONTRACTS_V188, QUEENS_ABYSS_CHAPTER_ID_V188,
  QUEENS_NACRE_WORLD_ID_V188, QUEENS_NAMES_EN_V188, QUEENS_REEF_LINEAGE_IDS_V188, QUEENS_EXCLUDED_AQUATIC_IDS_V188, QUEENS_RASK_SQUAD_IDS_V188,
  createSideCampaignsV188, normalizeSideCampaignsV188, queensStateV188, mainCampaignCompleteV188, queensCallDueV188, receiveQueensCallV188,
  queensCallDelayV188, acceptQueensCallV188, recordQueensArrivalV188, queensLockReasonV188, queensLockTextV188, filterQueensCampaignsV188,
  applyQueensOperationResultV188, queensRaskChoicePendingV188, chooseQueensRaskEggV188, queensConsequencesV188, queensReturnSceneDueV188,
  markQueensSceneSeenV188, QUEENS_SCENES_V188, QUEENS_SCENE_CINEMATICS_V188, queensArc1DebriefDueV188, queensArc1DebriefV188, queensSnapshotV188,
  queensEncounterCatalogV188, queensCallTextV188, QUEENS_CALL_DIALOG_V188, QUEENS_RASK_DIALOG_V188, QUEENS_LATER_ARCS_V188, isQueensCampaignV188
} from '../src/side-campaign-queens-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const campaignOf = id => CAMPAIGNS.find(entry => entry.id === id);
const nacre = WORLDS.find(world => world.id === QUEENS_NACRE_WORLD_ID_V188);
// Fixture: a save whose main campaign is over (Act V credits played).
function endedSave() {
  const save = createDefaultSave();
  save.storyCampaignV188 = { ...save.storyCampaignV188, act5: { schema: 188, phase: 'complete', decision: { option: 'hold', ending: 'freight-first' } } };
  return save;
}
// Injection: completes a mission as `finalizeOperation` does after a resolved success.
const complete = (save, id) => { save.galaxy.completedCampaignIds.push(id); return applyQueensOperationResultV188(save, { success: true, campaignId: id }); };
// Real jump to Nacre-7 with explicit clock values; returns the settlement.
function jumpToNacre(save, now = 1_000_000) {
  prepareJumpV116(save, nacre, WORLDS, now);
  const settlement = confirmJumpV115(save, nacre, WORLDS, now + JUMP_CHARGE_MS_V116);
  applyJumpTravelTimeV188(save, settlement);
  deliverTravelMessagesV188(save, settlement, { relayRoomReady: false });
  const arrival = recordQueensArrivalV188(save, settlement);
  if (arrival) pushCampaignTravelMessageV188(save, arrival);
  return settlement;
}

test('campaign data: nine Arc 1 missions on Nacre-7, bible ids, existing objectives and templates', () => {
  assert.deepEqual(validateContent().failures, []);
  assert.equal(QUEENS_CAMPAIGNS_V188.length, 9);
  assert.deepEqual(QUEENS_ARC1_ORDER_V188, ['queens-1-1-quai', 'queens-1-2-bassins', 'special-black-abyss-v131', 'queens-1-5-rask']);
  assert.deepEqual(QUEENS_ARC1_SIDE_V188.map(entry => entry.id), ['queens-a-navarre', 'queens-a-filets', 'queens-a-phare'], 'annex ids of bible §14.4');
  assert.deepEqual(QUEENS_CAMPAIGNS_V188.filter(entry => entry.queensStepV188).map(entry => [entry.queensStepV188, entry.objective]),
    [['1.1', 'rescue survivors'], ['1.2', 'restore atmospheric processing'], ['1.5', 'hold the extraction zone']], 'base objectives of bible §14.4');
  assert.deepEqual(QUEENS_ARC1_CONTRACTS_V188.map(entry => entry.objective), ['purge a reactor nest', 'escort a colony convoy', 'recover black-box data'], 'locals of §14.4');
  for (const campaign of QUEENS_CAMPAIGNS_V188) {
    assert.equal(campaignOf(campaign.id), campaign, `${campaign.id} is in CAMPAIGNS`);
    assert.equal(campaign.worldId, QUEENS_NACRE_WORLD_ID_V188);
    assert.notEqual(buildObjectiveRuntime(campaign.objective).id, 'secure-frontier', `${campaign.id}: existing objective`);
    assert.ok(QUEENS_NAMES_EN_V188[campaign.id], `${campaign.id}: English name`);
    // Not a royal contract: the generic selection must not force a Queen into these templates.
    assert.doesNotMatch([campaign.id, campaign.name, campaign.objective].join(' ').toLowerCase(), /(?:^|\W)(?:queen|reine|hive|ruche)(?:$|\W)/);
    const plan = buildMissionLevelV52({ campaign, world: nacre, levelSeeds: LEVEL_SEEDS });
    assert.equal(plan.templateId, campaign.templateId, `${campaign.id}: authored template`);
    assert.equal(plan.validation.valid, true, `${campaign.id}: ${plan.validation.errors?.join('; ')}`);
  }
  assert.equal(nacre.name, 'Nacre-7');
  assert.equal(new Set(CAMPAIGNS.map(entry => entry.id)).size, CAMPAIGNS.length);
  assert.equal(QUEENS_LATER_ARCS_V188.length, 2, 'arcs 2 and 3 are listed, not playable');
  for (const arc of QUEENS_LATER_ARCS_V188) for (const id of arc.reuses) assert.equal(isQueensCampaignV188(id), false, `${id} is not locked by this lot`);
});

test('the Abysse Noir chapter moved to Nacre-7 additively: id kept, Ceto still valid for deployments under way', () => {
  const chapter = campaignOf(QUEENS_ABYSS_CHAPTER_ID_V188);
  assert.equal(chapter.worldId, QUEENS_NACRE_WORLD_ID_V188);
  assert.deepEqual([...chapter.legacyWorldIdsV188], ['world-10-ceto']);
  assert.equal(operationCampaignV131(QUEENS_ABYSS_CHAPTER_ID_V188), chapter);
  assert.deepEqual(campaignWorldIdsV188(chapter), [QUEENS_NACRE_WORLD_ID_V188, 'world-10-ceto']);
  assert.equal(getSpecialOperationByCampaignIdV131(QUEENS_ABYSS_CHAPTER_ID_V188).id, 'black-abyss');
  assert.equal(isQueensCampaignV188(QUEENS_ABYSS_CHAPTER_ID_V188), true);
  // The receipt check compares the frozen deployment's own world, never the catalogue's current one.
  const receipts = read('src/operation-receipts-v131.js');
  assert.match(receipts, /!campaignWorldIdsV188\(campaign\)\.includes\(operation\.worldId\)/);
  assert.match(receipts, /raw\.identity\?\.worldId!==operation\.worldId/);
  // Other chapters keep their worlds in this lot (moved with their arcs).
  for (const [id, world] of [['special-broodstorm-v131', 'world-01-acheron-lv-426'], ['special-queen-mother-v131', 'world-05-lethe'], ['special-hive-world-v131', 'world-05-lethe']])
    assert.equal(campaignOf(id).worldId, world, id);
  // An old save that completed the chapter keeps its record, without advancing the arc.
  const save = endedSave(); save.galaxy.completedCampaignIds.push(QUEENS_ABYSS_CHAPTER_ID_V188);
  const migrated = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.ok(migrated.galaxy.completedCampaignIds.includes(QUEENS_ABYSS_CHAPTER_ID_V188));
  assert.deepEqual(queensStateV188(migrated).done, []);
});

test('save field sideCampaignsV188 is additive and normalised', () => {
  const fresh = createDefaultSave();
  assert.deepEqual(fresh.sideCampaignsV188, createSideCampaignsV188());
  const old = JSON.parse(JSON.stringify(fresh)); delete old.sideCampaignsV188;
  assert.deepEqual(migrateSave(old).sideCampaignsV188, createSideCampaignsV188(), 'an older save has received no call');
  const junk = normalizeSideCampaignsV188({ queens: { phase: 'nope', done: ['queens-1-1-quai'], raskEgg: 'seize', callDay: -3 } });
  assert.deepEqual(junk.queens, createSideCampaignsV188().queens);
  const kept = normalizeSideCampaignsV188({ queens: { phase: 'accepted', callDay: 4, acceptedDay: 5, arrivedDay: 19, done: ['queens-1-5-rask', 'x', 'queens-1-1-quai'],
    contracts: { pool: 2, junk: 4 }, raskEgg: 'destroy', scenesSeen: ['queens-1-1-quai', 'queens-1-2-bassins', 'arc1-debrief'] } }).queens;
  assert.deepEqual(kept.done, ['queens-1-1-quai', 'queens-1-5-rask']);
  assert.deepEqual(kept.contracts, { pool: 2 });
  assert.equal(kept.raskEgg, 'destroy');
  assert.deepEqual(kept.scenesSeen, ['queens-1-1-quai'], 'a scene of an unplayed mission, or a debrief before the arc ends, is dropped');
  const roundTrip = migrateSave(JSON.parse(JSON.stringify({ ...fresh, sideCampaignsV188: { schema: 188, queens: kept } })));
  assert.deepEqual(roundTrip.sideCampaignsV188.queens, kept);
});

test('the call: after the main campaign only, once, filed late in the alert journal (FR/EN)', () => {
  const before = createDefaultSave();
  assert.equal(mainCampaignCompleteV188(before), false);
  assert.equal(queensCallDueV188(before), false);
  assert.equal(receiveQueensCallV188(before), null);
  assert.equal(queensLockReasonV188(before, 'queens-1-1-quai'), 'main');
  const credits = createDefaultSave(); credits.storyCampaignV188.act5 = { schema: 188, phase: 'credits', decision: { option: 'hold', ending: 'freight-first' } };
  assert.equal(queensCallDueV188(credits), false, 'the call waits for the end of the credits');
  const save = endedSave(); save.clock.day = 120;
  assert.equal(queensCallDueV188(save), true);
  assert.equal(queensCallDelayV188(save), 9, 'QZ network delay');
  const message = receiveQueensCallV188(save);
  assert.equal(message.kind, 'campaign'); assert.equal(message.sentDay, 111); assert.equal(message.receivedDay, 120);
  assert.equal(queensStateV188(save).phase, 'call'); assert.equal(queensStateV188(save).callDay, 120);
  assert.equal(receiveQueensCallV188(save), null, 'received once');
  assert.equal(pushCampaignTravelMessageV188(save, message), true);
  assert.equal(pushCampaignTravelMessageV188(save, message), false, 'filed once');
  const worldName = id => WORLDS.find(world => world.id === id)?.name || id;
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
  assert.equal(queensLockReasonV188(save, 'queens-1-1-quai'), 'orbit');
  assert.match(queensLockTextV188('orbit', 'en'), /orbit of Nacre-7/);
  const readiness = getJumpReadinessV115(save, nacre, WORLDS);
  assert.deepEqual(readiness.reasons, []); assert.equal(readiness.fuel, 2 + Math.ceil(nacre.danger / 3));
  const fuel = save.galaxy.resources.fuel, day = save.clock.day;
  const settlement = jumpToNacre(save);
  assert.equal(settlement.status, 'arrived');
  assert.equal(save.galaxy.resources.fuel, fuel - readiness.fuel);
  assert.equal(save.clock.day, day + JUMP_TRAVEL_DAYS_V188);
  assert.equal(queensStateV188(save).arrivedDay, day + JUMP_TRAVEL_DAYS_V188);
  const ids = normalizeTravelMessagesV188(save.travelMessagesV188).messages.map(message => message.id);
  assert.ok(ids.some(id => id.startsWith('destination-')), 'the existing late destination call');
  assert.equal(ids.filter(id => id.startsWith('campaign-queens-arrival')).length, 1, 'Navarre on arrival');
  assert.equal(recordQueensArrivalV188(save, settlement), null, 'a reload does not record it twice');
  assert.equal(queensLockReasonV188(save, 'queens-1-1-quai'), null);
  assert.equal(queensSnapshotV188(save, 'fr').orbit, 'Le Tantalus est en orbite de Nacre-7.');
});

test('mission order, side missions once, contracts repeat; the chapter counts only when the arc reaches it', () => {
  const save = endedSave(); receiveQueensCallV188(save); acceptQueensCallV188(save); jumpToNacre(save);
  const open = () => filterQueensCampaignsV188(save, QUEENS_CAMPAIGNS_V188.concat(campaignOf(QUEENS_ABYSS_CHAPTER_ID_V188))).map(entry => entry.id);
  assert.deepEqual(open(), ['queens-1-1-quai']);
  assert.equal(queensLockReasonV188(save, 'queens-a-navarre'), 'arrival');
  assert.equal(queensLockReasonV188(save, QUEENS_ABYSS_CHAPTER_ID_V188), 'previous');
  // Injection: the chapter resolved out of order (a replay) is not counted.
  assert.equal(applyQueensOperationResultV188(save, { success: true, campaignId: QUEENS_ABYSS_CHAPTER_ID_V188 }), null);
  assert.equal(applyQueensOperationResultV188(save, { success: false, campaignId: 'queens-1-1-quai' }), null, 'a failure changes nothing');
  assert.deepEqual(complete(save, 'queens-1-1-quai'), { kind: 'step', id: 'queens-1-1-quai', arcComplete: false });
  assert.deepEqual(open().sort(), ['queens-1-2-bassins', 'queens-a-filets', 'queens-a-navarre', 'queens-a-phare', 'queens-l-bassin', 'queens-l-boites', 'queens-l-canots'].sort());
  complete(save, 'queens-a-navarre');
  assert.equal(queensLockReasonV188(save, 'queens-a-navarre'), 'done');
  assert.deepEqual(complete(save, 'queens-l-bassin'), { kind: 'contract', key: 'pool', count: 1 });
  assert.deepEqual(complete(save, 'queens-l-bassin'), { kind: 'contract', key: 'pool', count: 2 });
  assert.equal(queensLockReasonV188(save, 'queens-l-bassin'), null, 'contracts repeat');
  complete(save, 'queens-1-2-bassins');
  assert.equal(queensLockReasonV188(save, QUEENS_ABYSS_CHAPTER_ID_V188), null);
  assert.equal(complete(save, QUEENS_ABYSS_CHAPTER_ID_V188).kind, 'step');
  assert.deepEqual(complete(save, 'queens-1-5-rask'), { kind: 'step', id: 'queens-1-5-rask', arcComplete: true });
  // Leaving Nacre-7's orbit locks the arc again (missions are planned from orbit).
  save.galaxy.shipWorldIdV116 = 'world-05-lethe';
  assert.equal(queensLockReasonV188(save, 'queens-l-canots'), 'orbit');
  // Not a queens mission, not locked by this module.
  assert.equal(queensLockReasonV188(save, 'colony-c1'), null);
  // An active operation stays listed.
  save.strategy.currentOperation = { campaignId: 'queens-l-canots' };
  assert.ok(filterQueensCampaignsV188(save, QUEENS_CAMPAIGNS_V188).some(entry => entry.id === 'queens-l-canots'));
});

test('return scenes, CQ-02, the Rask choice and the Arc 1 debrief, once each and in order', () => {
  const save = endedSave(); receiveQueensCallV188(save); acceptQueensCallV188(save); jumpToNacre(save);
  for (const id of QUEENS_ARC1_ORDER_V188) complete(save, id);
  complete(save, 'queens-a-navarre');
  const seen = [];
  for (let id = queensReturnSceneDueV188(save); id; id = queensReturnSceneDueV188(save)) {
    assert.ok(QUEENS_SCENES_V188[id].title.fr && QUEENS_SCENES_V188[id].text.en, id);
    assert.equal(markQueensSceneSeenV188(save, id), true); assert.equal(markQueensSceneSeenV188(save, id), false); seen.push(id);
  }
  assert.deepEqual(seen, [...QUEENS_ARC1_ORDER_V188, 'queens-a-navarre']);
  assert.deepEqual(QUEENS_SCENE_CINEMATICS_V188, { [QUEENS_ABYSS_CHAPTER_ID_V188]: 'cin-cq-02' }, 'CQ-02 closes 1.4');
  assert.equal(queensArc1DebriefDueV188(save), false, 'the debrief waits for the choice');
  assert.equal(queensRaskChoicePendingV188(save), true);
  assert.equal(chooseQueensRaskEggV188(save, 'keep'), false);
  assert.equal(chooseQueensRaskEggV188(save, 'seize'), true);
  assert.equal(chooseQueensRaskEggV188(save, 'destroy'), false, 'the choice cannot be taken back');
  assert.deepEqual({ ...queensConsequencesV188(save) }, { qz17ThreadPiece: true, biologicalRiskAboard: true, companySpecimen: false });
  assert.equal(queensArc1DebriefDueV188(save), true);
  const debrief = queensArc1DebriefV188(save, 'fr');
  assert.match(debrief.text, /sous scellés à bord/); assert.match(debrief.text, /carnets de Navarre/); assert.match(debrief.text, /pas encore jouable/);
  assert.match(queensArc1DebriefV188(save, 'en').text, /not playable yet/);
  assert.equal(markQueensSceneSeenV188(save, 'arc1-debrief'), true);
  assert.equal(queensArc1DebriefDueV188(save), false);
  const migrated = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(migrated.sideCampaignsV188.queens, queensStateV188(save), 'choices and scenes survive a reload');
  for (const choice of ['release', 'destroy']) {
    const other = JSON.parse(JSON.stringify(save)); other.sideCampaignsV188.queens.raskEgg = null;
    assert.equal(chooseQueensRaskEggV188(other, choice), true);
    assert.equal(queensConsequencesV188(other).companySpecimen, choice === 'release');
    for (const lang of ['fr', 'en']) assert.ok(QUEENS_RASK_DIALOG_V188.results[choice][lang] && QUEENS_RASK_DIALOG_V188.options[choice][lang]);
  }
  const snapshot = queensSnapshotV188(save, 'en');
  assert.equal(snapshot.arc1Complete, true); assert.equal(snapshot.choice, 'Royal egg seized');
  assert.deepEqual(snapshot.steps.map(step => step.label), ['1.1', '1.2', '1.3-1.4', '1.5']);
  assert.equal(snapshot.later.length, 2);
});

test('encounters: the reef lineage only, admissibility before generic logic, the aquatic boss stays in its chapter', async () => {
  for (const id of [...QUEENS_REEF_LINEAGE_IDS_V188, ...QUEENS_RASK_SQUAD_IDS_V188, ...QUEENS_EXCLUDED_AQUATIC_IDS_V188]) assert.ok(ENEMIES.some(enemy => enemy.id === id), id);
  const behaviour = id => resolveEnemyBehaviorV119(ENEMIES.find(enemy => enemy.id === id));
  assert.deepEqual(QUEENS_REEF_LINEAGE_IDS_V188.map(id => behaviour(id).id), ['drone', 'ambusher', 'runner', 'ambusher', 'acid']);
  for (const id of QUEENS_REEF_LINEAGE_IDS_V188) assert.notEqual(behaviour(id).runtimeBehavior, 'aquatic', `${id} walks on the land templates`);
  for (const id of QUEENS_EXCLUDED_AQUATIC_IDS_V188) assert.equal(behaviour(id).runtimeBehavior, 'aquatic', `${id} swims: not admitted on land`);
  assert.equal(behaviour('enemy-043-weyland-yutani-commando').family, 'human');
  assert.equal(queensEncounterCatalogV188('colony-c1', ENEMIES), ENEMIES, 'other missions keep the whole catalogue');
  assert.equal(queensEncounterCatalogV188(QUEENS_ABYSS_CHAPTER_ID_V188, ENEMIES), ENEMIES, 'the chapter keeps its own specialised roster');
  for (const campaign of QUEENS_CAMPAIGNS_V188) {
    const roster = queensEncounterCatalogV188(campaign.id, ENEMIES), allowed = campaign.id === 'queens-1-5-rask' ? [...QUEENS_REEF_LINEAGE_IDS_V188, ...QUEENS_RASK_SQUAD_IDS_V188] : QUEENS_REEF_LINEAGE_IDS_V188;
    assert.deepEqual(roster.map(enemy => enemy.id).sort(), [...allowed].sort(), campaign.id);
    const selection = selectEnemyEncounterCatalog(roster, { world: nacre, campaign, levelSeed: LEVEL_SEEDS[0] }, 26);
    assert.ok(selection.selected.length >= 1 && selection.selected.every(enemy => allowed.includes(enemy.id)), `${campaign.id}: generic selection stays in the lineage`);
  }
  // Production engine on a Nacre-7 mission: every spawned enemy belongs to the lineage.
  for (const id of ['queens-1-1-quai', 'queens-1-5-rask']) {
    const campaign = campaignOf(id), missionLevel = buildMissionLevelV52({ campaign, world: nacre, levelSeeds: LEVEL_SEEDS });
    const run = await fixture({ campaign, seed: 7, keepEnemies: true, options: { world: nacre, missionLevel, enemyCatalog: queensEncounterCatalogV188(id, ENEMIES) } });
    const allowed = queensEncounterCatalogV188(id, ENEMIES).map(enemy => enemy.id), spawned = run.engine.spawnedEnemiesV188;
    assert.ok(spawned.length > 0, `${id}: enemies spawned`);
    for (const enemy of spawned) assert.ok(allowed.includes(String(enemy.id).split(':')[0]), `${id}: ${enemy.id} ${enemy.name} is of the lineage`);
    assert.equal(run.engine.mission.state, 'active');
  }
});

test('cinematics CQ-01 to CQ-06 play on the existing Canvas player (placeholders, no image source)', () => {
  assert.deepEqual(QUEENS_CINEMATIC_IDS_V188, ['cin-cq-01', 'cin-cq-02', 'cin-cq-03', 'cin-cq-04', 'cin-cq-05', 'cin-cq-06']);
  assert.deepEqual(QUEENS_CINEMATICS_WIRED_V188, ['cin-cq-01', 'cin-cq-02']);
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
  for (const scene of Object.values(QUEENS_SCENES_V188)) assert.ok(QUEENS_SCENE_SLOTS_V188.includes(scene.slot));
  assert.ok(QUEENS_SCENE_SLOTS_V188.includes(QUEENS_CALL_DIALOG_V188.slot) && QUEENS_SCENE_SLOTS_V188.includes(QUEENS_RASK_DIALOG_V188.slot));
});

test('app wiring: lists, launch lock, result, jump arrival, briefing table, roster', () => {
  const app = read('src/app.js');
  assert.match(app, /function unlockedCampaignsV188\(list\) \{ return filterQueensCampaignsV188\(saveSystem\.data, filterColonyCampaignsV188\(/);
  assert.match(app, /const queensLockV188 = activeOperation \? null : queensLockReasonV188\(saveSystem\.data, campaign\.id\);/);
  assert.match(app, /const queensChangeV188 = applyQueensOperationResultV188\(candidate, \{ success: resolvedSuccess, campaignId: operation\.campaignId \}\);/);
  assert.ok(app.indexOf('applyQueensOperationResultV188(candidate') < app.indexOf('advanceGalaxy(candidate, { hours: resolvedSuccess ? 4 : 8'), 'inside the resolution transaction');
  assert.match(app, /const queensArrivalV188 = recordQueensArrivalV188\(saveSystem\.data, settlement\);/);
  assert.ok(app.indexOf('recordQueensArrivalV188(saveSystem.data, settlement)') > app.indexOf('deliverTravelMessagesV188(saveSystem.data, settlement'), 'after the late messages, same transaction');
  assert.match(app, /if \(colonyReturnOnViewV188\(\)\) return;\n  \/\/ V188 spec 011[^\n]*\n  if \(queensOnViewV188\(\)\) return;/);
  assert.match(app, /enemyCatalog: queensEncounterCatalogV188\(campaign\.id, ENEMIES\),/);
  assert.match(app, /renderStationFrontV188\(\);\n  renderQueensPanelV188\(\);/);
  assert.match(read('index.html'), /<section id="side-campaign-queens-v188" class="story-dossier-v188 side-campaign-v188" aria-label="La Saison des Reines"><\/section>/);
  assert.match(read('src/save.js'), /migrated\.sideCampaignsV188 = normalizeSideCampaignsV188\(source\.sideCampaignsV188\);/);
  const sw = read('sw.js');
  for (const file of ['side-campaign-queens-v188.js', 'queens-cinematics-v188.js']) assert.ok(sw.includes(`'/src/${file}'`), file);
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
});
