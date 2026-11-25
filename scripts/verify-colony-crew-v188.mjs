// V188 colony and crew lot: Port-Méridien C1-C5 and their side missions and
// contracts (bible §6.2, §6.4), Wren's dossier piece, the twelve other crew
// quests (§8.1, §8.5), delayed messages during galactic travel (§13.2, §13.7).
// Access, rewards paid once, colony and dossier effects, each quest's
// resolution, delayed messages, save round trip, resume, old saves, i18n.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { CAMPAIGNS, validateContent } from '../src/content.js';
import { selectMissionTemplateV52, MISSION_TEMPLATE_IDS_V52 } from '../src/mission-levels-v52.js';
import { resolveMissionRegisterV188 } from '../src/mission-register-v188.js';
import {
  COLONY_CAMPAIGNS_V188, COLONY_CAMPAIGN_IDS_V188, COLONY_MAIN_MISSIONS_V188, COLONY_SIDE_MISSIONS_V188, COLONY_CONTRACTS_V188,
  COLONY_C5_CAMPAIGN_ID_V188, colonyLockReasonV188, colonyLockTextV188, filterColonyCampaignsV188, applyColonyMissionResultV188,
  applyColonyC5LaunchV188, colonyC5LaunchBonusV188, colonyMissionsSnapshotV188, colonyReturnSceneDueV188, markColonySceneSeenV188,
  colonyC4DecisionPendingV188, colonyC4OptionsV188, chooseColonyC4V188, colonyGrueDecisionPendingV188, chooseColonyGrueV188,
  normalizeColonyMissionsV188, COLONY_SCENES_V188, COLONY_DECISION_TEXT_V188, COLONY_NAMES_EN_V188, wrenTestimonyRecoveredV188, colonyCampaignNameV188
} from '../src/colony-missions-v188.js';
import { applyColonyOperationResultV188, colonyActiveLimitV188, investColonySiteV188, normalizeColonyV188, colonyTierV188 } from '../src/colony-reconstruction-v188.js';
import { storyDossierV188 } from '../src/story-dossier-v188.js';
import {
  CREW_QUESTS_ALL_V188, CREW_QUESTS_V188, acceptCrewQuestV188, answerCrewQuestStepV188, crewQuestStepV188, crewQuestActionsV188, turnInCrewQuestV188,
  applyCrewQuestOperationResultV188, normalizeCrewQuestsV188, crewQuestsSnapshotV188, crewQuestGateOpenV188, crewQuestEpilogueLineV188, crewQuestNotesV188, getCrewQuestV188
} from '../src/crew-quests-v188.js';
import { CREW_QUESTS_TANTALUS_V188 } from '../src/crew-quests-tantalus-v188.js';
import { ACT5_ADVISORS_V188, ACT5_SOLID_TRUST_V188 } from '../src/story-act5-v188.js';
import { applyJumpTravelTimeV188 } from '../src/galaxy-travel-v188.js';
import { deliverTravelMessagesV188, travelMessagesListV188, normalizeTravelMessagesV188, travelArrivalNoticeV188, TRAVEL_MESSAGES_MAX_V188 } from '../src/travel-messages-v188.js';
import { COLONY_CREW_SLOTS_V188, COLONY_CREW_FILES_PRESENT_V188, COLONY_CREW_EVIDENCE_IDS_V188,
  ColonyCrewAssetLoaderV188, getColonyCrewSlotV188 } from '../src/colony-crew-slots-v188.js';
import { CONTENT_GAP_SLOTS_V188 } from '../src/content-gap-slots-v188.js';
import { openContentSceneDialogV188 } from '../src/content-gap-ui-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const roundTrip = save => migrateSave(JSON.parse(JSON.stringify(save)));
const complete = (save, ...ids) => { for (const id of ids) if (!save.galaxy.completedCampaignIds.includes(id)) save.galaxy.completedCampaignIds.push(id); };
const COCYTE = 'world-05-lethe';
const win = (save, id) => { complete(save, id); return applyColonyMissionResultV188(save, { success: true, campaignId: id }); };
const sites = save => normalizeColonyV188(save.colonyV188).sites;
const loyalty = (save, id) => save.crew.find(member => member.id === id).loyalty;
const solve = (save, id) => { const quest = getCrewQuestV188(id); let last = null; for (const step of quest.steps) last = answerCrewQuestStepV188(save, id, step.options.find(entry => entry.correct).id); return last; };
const actOne = () => { const save = createDefaultSave(); complete(save, 'special-narrative-qz17'); save.portMeridienV90 = { ...save.portMeridienV90, phase: 'complete' }; return save; };
const restored = save => { const colony = normalizeColonyV188(save.colonyV188); for (const id of ['walls', 'atmosphere', 'infirmary']) colony.sites[id] = { invested: Math.max(1, colony.sites[id].invested), validated: Math.max(1, colony.sites[id].validated) }; save.colonyV188 = colony; };

// —— Colony missions: content ——
test('colony content: C1-C4, 7 side missions, 8 contracts on Cocyte from existing templates, §0.3 registers, C5 = act5-port-walls', () => {
  assert.equal(validateContent().ok, true);
  assert.equal(CAMPAIGNS.length, 526);
  assert.deepEqual(COLONY_MAIN_MISSIONS_V188.map(entry => entry.id), ['colony-c1', 'colony-c2', 'colony-c3', 'colony-c4']);
  assert.deepEqual(COLONY_SIDE_MISSIONS_V188.map(entry => entry.id), ['colony-a-quai', 'colony-a-ferro', 'colony-a-abri', 'colony-a-seegson', 'colony-a-balise', 'colony-a-crucible', 'colony-a-converti']);
  assert.equal(COLONY_CONTRACTS_V188.length, 8);
  for (const campaign of COLONY_CAMPAIGNS_V188) {
    assert.ok(CAMPAIGNS.some(entry => entry.id === campaign.id), campaign.id);
    assert.equal(campaign.worldId, COCYTE);
    assert.ok(MISSION_TEMPLATE_IDS_V52.includes(selectMissionTemplateV52({ campaign })), campaign.id);
  }
  assert.deepEqual(COLONY_MAIN_MISSIONS_V188.map(resolveMissionRegisterV188), ['action', 'tension', 'horror', 'tension']);
  assert.deepEqual(COLONY_SIDE_MISSIONS_V188.map(resolveMissionRegisterV188), ['tension', 'horror', 'tension', 'tension', 'horror', 'calm', 'horror']);
  assert.ok(CAMPAIGNS.some(entry => entry.id === COLONY_C5_CAMPAIGN_ID_V188), 'C5 is the Act V mission, id kept');
  assert.equal(new Set(CAMPAIGNS.map(entry => entry.id)).size, CAMPAIGNS.length);
  assert.match(read('src/content.js'), /campaigns: 526/);
});

// —— Access ——
test('colony access: C1 after Act I, C2-C4 follow their acts and each other, annexes at « Rétablie », Wren after C1, the brother between C3 and C4', () => {
  const fresh = createDefaultSave();
  assert.equal(colonyLockReasonV188(fresh, 'colony-c1'), 'act:special-narrative-qz17');
  assert.equal(filterColonyCampaignsV188(fresh, CAMPAIGNS).some(entry => entry.id === 'colony-c1'), false);
  assert.match(colonyLockTextV188('act:special-narrative-qz17', 'en'), /Act I/);
  const save = actOne();
  assert.equal(colonyLockReasonV188(save, 'colony-c1'), null);
  assert.equal(colonyLockReasonV188(save, 'colony-a-quai'), 'c1');
  complete(save, 'special-archive-relay');
  assert.equal(colonyLockReasonV188(save, 'colony-c2'), 'previous');
  win(save, 'colony-c1');
  assert.equal(colonyLockReasonV188(save, 'colony-c2'), null);
  assert.equal(colonyLockReasonV188(save, 'colony-a-quai'), null, 'Wren’s testimony opens after C1');
  assert.equal(colonyLockReasonV188(save, 'colony-a-ferro'), 'tier');
  assert.equal(colonyLockReasonV188(save, 'colony-l-murs'), null, 'defensive contract in « Survie »');
  assert.equal(colonyLockReasonV188(save, 'colony-l-filtres'), 'defensive');
  assert.equal(colonyLockReasonV188(save, 'colony-c3'), 'act:special-apc-convoy');
  complete(save, 'special-apc-convoy'); win(save, 'colony-c2');
  assert.equal(colonyLockReasonV188(save, 'colony-a-converti'), 'c3');
  win(save, 'colony-c3');
  assert.equal(colonyTierV188(save.colonyV188), 'restored', 'C1, C2, C3 build three level-1 sites');
  assert.equal(colonyLockReasonV188(save, 'colony-a-ferro'), null);
  assert.equal(colonyLockReasonV188(save, 'colony-l-filtres'), null);
  assert.equal(colonyLockReasonV188(save, 'colony-a-converti'), null);
  assert.equal(colonyLockReasonV188(save, 'colony-c4'), 'act:special-black-cocoon');
  complete(save, 'special-black-cocoon'); complete(save, 'colony-c4');
  assert.equal(colonyLockReasonV188(save, 'colony-a-converti'), 'too-late');
  const app = read('src/app.js');
  assert.match(app, /colonyLockReasonV188\(saveSystem\.data, campaign\.id\)/);
  assert.match(app, /filterColonyCampaignsV188\(saveSystem\.data, filterAct5CampaignsV188/);
});

// —— Rewards once, colony and world effects ——
test('colony rewards: a main mission builds its site once (+3 stability), a replay pays nothing, generic validation stops after C1', () => {
  const save = actOne(); complete(save, 'special-archive-relay');
  Object.assign(save.galaxy.resources, { credits: 100000, alloy: 10000, research: 1000 });
  const world = save.galaxy.worldState[COCYTE], stability = world.stability, infestation = world.infestation;
  // Before C1, the provisional rule still validates a pending level from any Cocyte success.
  investColonySiteV188(save, 'power');
  assert.equal(applyColonyOperationResultV188(save, { success: true, worldId: COCYTE }).validated, 'power');
  const first = win(save, 'colony-c1');
  assert.equal(first.kind, 'reward'); assert.deepEqual(first.site, { site: 'walls', level: 1 });
  assert.deepEqual(sites(save).walls, { invested: 1, validated: 1 });
  assert.equal(world.stability, Math.min(100, stability + 3 + 3), 'one level from the provisional rule, one from C1');
  assert.equal(world.infestation, Math.max(0, infestation - 4));
  const replay = applyColonyMissionResultV188(save, { success: true, campaignId: 'colony-c1' });
  assert.equal(replay.kind, 'replay'); assert.deepEqual(sites(save).walls, { invested: 1, validated: 1 }, 'paid exactly once');
  assert.equal(applyColonyMissionResultV188(save, { success: false, campaignId: 'colony-c2' }), null);
  // After C1: an ordinary Cocyte operation no longer validates; the local contract of the site does.
  investColonySiteV188(save, 'walls');
  assert.equal(applyColonyOperationResultV188(save, { success: true, worldId: COCYTE }), null);
  assert.deepEqual(sites(save).walls, { invested: 2, validated: 1 });
  const contract = win(save, 'colony-l-murs');
  assert.equal(contract.kind, 'contract'); assert.deepEqual(contract.site, { site: 'walls', level: 2 });
  assert.equal(win(save, 'colony-l-murs').site, null, 'a contract without a pending level only counts');
  assert.equal(normalizeColonyMissionsV188(save.colonyMissionsV188).contracts.walls, 2);
  // The failure rule is unchanged.
  assert.ok(applyColonyOperationResultV188(save, { success: false, worldId: COCYTE }).damaged);
});

test('annex and contract effects: research, alloy, population (active-site limit), infestation; Wren’s piece', () => {
  const save = actOne(); complete(save, 'special-archive-relay'); win(save, 'colony-c1');
  const research = save.galaxy.resources.research, alloy = save.galaxy.resources.alloy, limit = colonyActiveLimitV188(save);
  win(save, 'colony-a-ferro'); assert.equal(save.galaxy.resources.research, research + 4);
  win(save, 'colony-a-seegson'); assert.equal(save.galaxy.resources.alloy, alloy + 30);
  win(save, 'colony-a-balise'); win(save, 'colony-l-disparus');
  assert.equal(normalizeColonyMissionsV188(save.colonyMissionsV188).population, 3);
  assert.ok(colonyActiveLimitV188(save) > limit, 'volunteers raise the active-site limit');
  const infestation = save.galaxy.worldState[COCYTE].infestation;
  win(save, 'colony-l-ouverture'); assert.equal(save.galaxy.worldState[COCYTE].infestation, Math.max(0, infestation - 3));
  const before = storyDossierV188(save);
  assert.equal(before.pieces.find(piece => piece.id === 'wren-testimony').held, false);
  win(save, 'colony-a-quai');
  assert.equal(wrenTestimonyRecoveredV188(save), true);
  const after = storyDossierV188(save, 'en');
  assert.equal(after.pieces.find(piece => piece.id === 'wren-testimony').held, true);
  assert.equal(after.count, before.count + 1);
  assert.equal(after.pieces.some(piece => piece.unavailable), false, 'every piece of the file is playable');
});

test('C5 « La nuit des murs » is act5-port-walls: the walls set the launch bonus, once per launch; its reward is paid once', () => {
  assert.deepEqual(colonyC5LaunchBonusV188(0), { level: 0, ammo: 0, armour: 0 });
  assert.deepEqual(colonyC5LaunchBonusV188(1), { level: 1, ammo: 40, armour: 0 });
  assert.deepEqual(colonyC5LaunchBonusV188(3), { level: 3, ammo: 120, armour: 60 });
  const save = actOne(); save.colonyV188 = { schema: 188, sites: { ...sites(save), walls: { invested: 3, validated: 2 } } };
  save.player.ammo = { primary: 100 }; save.player.armor = 10;
  assert.equal(applyColonyC5LaunchV188(save, 'colony-c1'), null);
  assert.deepEqual(applyColonyC5LaunchV188(save, COLONY_C5_CAMPAIGN_ID_V188), { level: 2, ammo: 40, armour: 60 });
  assert.equal(save.player.ammo.primary, 140); assert.equal(save.player.armor, 60);
  const reward = win(save, COLONY_C5_CAMPAIGN_ID_V188);
  assert.deepEqual(reward.site, { site: 'walls', level: 3 }, 'the paid north-wall turrets are validated by C5');
  assert.equal(applyColonyMissionResultV188(save, { success: true, campaignId: COLONY_C5_CAMPAIGN_ID_V188 }).kind, 'replay');
  assert.equal(colonyCampaignNameV188(COLONY_C5_CAMPAIGN_ID_V188, 'en'), 'C5 · THE NIGHT OF THE WALLS');
  const app = read('src/app.js');
  assert.match(app, /deployment\.resumed \? null : applyColonyC5LaunchV188\(saveSystem\.data, campaign\.id\)/);
  assert.match(app, /applyColonyMissionResultV188\(candidate, \{ success: resolvedSuccess, campaignId: operation\.campaignId \}\)/);
});

test('decisions and return scenes: C4 (mediation needs the brother) and Grue, taken once; each scene shown once', () => {
  const save = actOne(); complete(save, 'special-archive-relay', 'special-apc-convoy', 'special-black-cocoon');
  for (const id of ['colony-c1', 'colony-c2', 'colony-c3', 'colony-c4']) win(save, id);
  assert.equal(colonyC4DecisionPendingV188(save), true);
  assert.deepEqual(colonyC4OptionsV188(save), ['marshals', 'exile']);
  assert.equal(chooseColonyC4V188(save, 'mediation'), null, 'no mediation without the brother');
  const stability = save.galaxy.worldState[COCYTE].stability;
  assert.ok(chooseColonyC4V188(save, 'marshals'));
  assert.equal(save.galaxy.worldState[COCYTE].stability, Math.min(100, stability + 4));
  assert.equal(chooseColonyC4V188(save, 'exile'), null, 'taken once');
  const other = actOne(); complete(other, 'special-archive-relay', 'special-apc-convoy', 'special-black-cocoon');
  for (const id of ['colony-c1', 'colony-c2', 'colony-c3', 'colony-a-converti', 'colony-c4']) win(other, id);
  assert.deepEqual(colonyC4OptionsV188(other), ['marshals', 'exile', 'mediation']);
  assert.ok(chooseColonyC4V188(other, 'mediation'));
  restored(save); win(save, 'colony-a-crucible');
  const alloy = save.galaxy.resources.alloy;
  assert.equal(colonyGrueDecisionPendingV188(save), true);
  assert.ok(chooseColonyGrueV188(save, 'accept')); assert.equal(save.galaxy.resources.alloy, alloy + 60);
  assert.equal(chooseColonyGrueV188(save, 'refuse'), null);
  const due = colonyReturnSceneDueV188(save);
  assert.equal(due, 'colony-c1');
  assert.equal(markColonySceneSeenV188(save, due), true); assert.equal(markColonySceneSeenV188(save, due), false);
  assert.equal(colonyReturnSceneDueV188(save), 'colony-c2');
  assert.match(read('src/app.js'), /if \(act5OnViewV188\(\)\) return;\n {2}\/\/ V188 colony lot[^\n]*\n {2}if \(colonyReturnOnViewV188\(\)\) return;/);
});

test('colony table: missions, effects and decisions are on the reconstruction table', () => {
  const save = actOne(); complete(save, 'special-archive-relay'); win(save, 'colony-c1'); win(save, 'colony-a-quai');
  const snapshot = colonyMissionsSnapshotV188(save, 'en');
  assert.equal(snapshot.main.length, 5, 'C1-C4 and C5');
  assert.equal(snapshot.main[0].done, true); assert.equal(snapshot.main[0].rewarded, true); assert.equal(snapshot.main[0].site, 'walls');
  assert.equal(snapshot.main[4].id, COLONY_C5_CAMPAIGN_ID_V188);
  assert.equal(snapshot.localValidation, true); assert.equal(snapshot.wren, true);
  assert.equal(snapshot.sides.find(row => row.id === 'colony-a-ferro').lockText, 'Opens once Port-Méridien is "Restored" (3 sites at level 1).');
  const app = read('src/app.js');
  assert.match(app, /host\.replaceChildren\(title, info, list, \.\.\.missionsV188\)/);
  assert.match(app, /function colonyMissionsPanelPartsV188\(lang\)/);
});

// —— Crew quests ——
test('crew quests: the twelve other §8.1 quests, one per remaining crew member, offered after their act', () => {
  // Sixteen §8.1 quests, then the §8.2 ship-life quest `ship-bioforge` (owner decision 2026-11-23; verify-confrontation-v188.mjs),
  // then the three quests of « La Saison des Reines » (§14.9, spec 011): a second quest for Doyle, Orlov and Harlow,
  // covered by scripts/verify-side-campaign-queens-v188.mjs.
  assert.equal(CREW_QUESTS_ALL_V188.length, 20); assert.equal(CREW_QUESTS_ALL_V188[16].id, 'ship-bioforge');
  assert.deepEqual(CREW_QUESTS_ALL_V188.slice(17).map(quest => quest.id), ['ship-q-doyle', 'ship-q-orlov', 'ship-q-harlow']);
  assert.deepEqual(CREW_QUESTS_V188.map(quest => quest.id), ['ship-rook', 'ship-vega', 'ship-harlow', 'ship-david'], 'spec 005 list unchanged');
  assert.equal(new Set(CREW_QUESTS_ALL_V188.slice(0, 16).map(quest => quest.crewId)).size, 16, 'one §8.1 quest per crew member');
  assert.deepEqual(CREW_QUESTS_TANTALUS_V188.slice(0, 4).map(quest => quest.crewId), ACT5_ADVISORS_V188.map(entry => entry.crewId).sort((a, b) =>
    ['crew-07-sanaa-doyle', 'crew-16-cal-mercer', 'crew-08-maksim-orlov', 'crew-15-leila-s-rensen'].indexOf(a) - ['crew-07-sanaa-doyle', 'crew-16-cal-mercer', 'crew-08-maksim-orlov', 'crew-15-leila-s-rensen'].indexOf(b)), 'Act V advisors first');
  const fresh = createDefaultSave(); fresh.portMeridienV90 = null;
  for (const quest of CREW_QUESTS_TANTALUS_V188) assert.equal(crewQuestActionsV188(fresh, quest.crewId).some(entry => entry.id === quest.id), false, quest.id);
  const save = actOne();
  assert.equal(crewQuestActionsV188(save, 'crew-02-tamsin-velez')[0].action, 'accept', 'Velez after the prologue');
  assert.equal(crewQuestActionsV188(save, 'crew-07-sanaa-doyle').length, 0, 'Doyle after C1');
  complete(save, 'colony-c1');
  assert.equal(crewQuestActionsV188(save, 'crew-07-sanaa-doyle')[0].id, 'ship-doyle');
  assert.equal(crewQuestActionsV188(save, 'crew-14-echo-a').length, 0, 'ECHO-A after S3');
  complete(save, 'station-s3'); assert.equal(crewQuestActionsV188(save, 'crew-14-echo-a').length, 1);
  assert.match(read('src/app.js'), /quest\.turnInText\?\.\[lang\]/);
});

test('crew quests: every analysis quest resolves only from the evidence and pays once', () => {
  const save = actOne(); complete(save, 'special-archive-relay', 'special-apc-convoy', 'special-black-cocoon', 'colony-c2', 'station-s3');
  save.storyCampaignV188 = { ...save.storyCampaignV188, interlude: { phase: 'resolved', outcome: 'destroyed' } };
  save.hub.provingGroundV81 = { qualification: { lastReceiptId: null } }; save.hub.services = {};
  for (const quest of CREW_QUESTS_TANTALUS_V188.filter(entry => entry.kind === 'analysis')) {
    assert.ok(acceptCrewQuestV188(save, quest.id), quest.id);
    if (quest.id === 'ship-velez') { assert.equal(crewQuestStepV188(save, quest.id), null, 'range proof first'); save.hub.provingGroundV81.qualification.lastReceiptId = 'm41a-qualification-v81:session-2:qualification'; }
    if (quest.id === 'ship-kwan') { assert.equal(answerCrewQuestStepV188(save, quest.id, 'quarantine').reason, 'gated'); save.hub.services['service:power'] = 7; }
    const wrong = quest.steps[0].options.find(entry => !entry.correct);
    if (wrong) { assert.equal(answerCrewQuestStepV188(save, quest.id, wrong.id).correct, false); assert.equal(crewQuestStepV188(save, quest.id).index, 0, `${quest.id}: wrong reading keeps the step`); }
    const before = loyalty(save, quest.crewId), result = solve(save, quest.id);
    assert.equal(result.done, true, quest.id); assert.ok(result.completion, quest.id);
    assert.equal(loyalty(save, quest.crewId), Math.min(100, before + quest.reward.loyalty), quest.id);
    assert.equal(answerCrewQuestStepV188(save, quest.id, quest.steps[0].options[0].id).ok, false, `${quest.id}: paid once`);
    assert.equal(acceptCrewQuestV188(save, quest.id), false);
  }
  assert.ok(save.strategy.inventory.equipmentIds.includes('equipment-021-ammo-satchel'), 'Velez: assault allotment');
  assert.ok(save.strategy.inventory.weaponIds.includes('weapon-014-m40-hedp-grenade'), 'Reyes: breaching grenades');
  assert.equal(normalizeColonyMissionsV188(save.colonyMissionsV188).population, 2, 'Mbaye: two families');
  assert.match(crewQuestNotesV188(save, 'en').join(' '), /preservation unit/);
  assert.equal(crewQuestEpilogueLineV188(save, 'crew-14-echo-a', 'en', 'final'), null);
  assert.match(crewQuestEpilogueLineV188(save, 'crew-14-echo-a', 'en', 'epilogue'), /who remains/);
});

test('BISHOP-9 answers from the trust already earned', () => {
  const make = trust => { const save = actOne(); save.storyCampaignV188 = { ...save.storyCampaignV188, interlude: { phase: 'resolved', outcome: 'destroyed' } };
    save.crew.find(member => member.id === 'crew-05-bishop-9').loyalty = trust; acceptCrewQuestV188(save, 'ship-bishop'); return solve(save, 'ship-bishop').completion; };
  assert.match(make(80), /Je choisirais l’équipage/);
  assert.match(make(30), /pas autorisé/);
});

test('crew quests: collection quests count their own operations, turn in once, and apply colony, inventory and ship effects', () => {
  const save = actOne(); complete(save, 'colony-c1', 'special-apc-convoy');
  save.storyCampaignV188 = { ...save.storyCampaignV188, interlude: { phase: 'resolved', outcome: 'destroyed' } };
  for (const id of ['ship-doyle', 'ship-mercer', 'ship-okafor', 'ship-park']) assert.ok(acceptCrewQuestV188(save, id), id);
  assert.equal(turnInCrewQuestV188(save, 'ship-doyle').reason, 'missing-components');
  applyCrewQuestOperationResultV188(save, { success: true, worldId: 'world-01-acheron-lv-426', objective: 'rescue survivors' });
  assert.equal(normalizeCrewQuestsV188(save.crewQuestsV188).quests['ship-doyle'].components, 0, 'turrets only from Cocyte');
  const vents = applyCrewQuestOperationResultV188(save, { success: true, worldId: 'world-01-acheron-lv-426', objective: 'navigate the vent network' });
  assert.deepEqual(vents.map(entry => entry.id), ['ship-park'], 'Jun Park: any vent-network mission');
  for (let i = 0; i < 4; i += 1) applyCrewQuestOperationResultV188(save, { success: true, worldId: COCYTE, objective: 'defend the colony' });
  const quests = normalizeCrewQuestsV188(save.crewQuestsV188).quests;
  assert.equal(quests['ship-doyle'].components, 2); assert.equal(quests['ship-mercer'].components, 3); assert.equal(quests['ship-okafor'].components, 3);
  assert.equal(crewQuestActionsV188(save, 'crew-07-sanaa-doyle')[0].action, 'turn-in');
  const walls = sites(save).walls.validated, infirmary = sites(save).infirmary.validated;
  assert.equal(turnInCrewQuestV188(save, 'ship-doyle', 'en').ok, true);
  assert.equal(sites(save).walls.validated, walls + 1, 'Doyle: Walls and airlocks +');
  assert.ok(save.strategy.inventory.equipmentIds.includes('equipment-020-portable-sentry'));
  assert.equal(turnInCrewQuestV188(save, 'ship-okafor').ok, true); assert.equal(sites(save).infirmary.validated, infirmary + 1, 'Okafor: infirmary +');
  save.crew.forEach(member => { member.stress = 20; }); save.hub.systems.oxygen = 80;
  assert.equal(turnInCrewQuestV188(save, 'ship-park').ok, true);
  assert.equal(save.crew[0].stress, 12); assert.equal(save.hub.systems.oxygen, 90);
  assert.equal(turnInCrewQuestV188(save, 'ship-mercer').ok, true);
  assert.equal(turnInCrewQuestV188(save, 'ship-mercer').ok, false, 'turned in once');
  assert.equal(crewQuestsSnapshotV188(save).filter(entry => entry.status === 'done').length, 4);
});

test('Act V advisors: their quests can bring Sanaa, Cal, Orlov and Leila to « solide » trust with the rapport choices', () => {
  const save = createDefaultSave();
  for (const id of ['ship-doyle', 'ship-mercer', 'ship-orlov', 'ship-sorensen']) {
    const quest = getCrewQuestV188(id);
    assert.ok(quest.reward.loyalty >= 12, id);
    const start = loyalty(save, quest.crewId);
    assert.ok(start + quest.reward.loyalty + 8 >= ACT5_SOLID_TRUST_V188, `${id}: within reach of 75 with a few rapport gains`);
  }
});

// —— Delayed messages ——
test('travel: messages that followed the Tantalus arrive once per jump, dated, in FR and EN, with today’s values beside', () => {
  const save = actOne(); complete(save, 'station-s4');
  save.clock = { day: 3, hour: 10 };
  save.galaxy.jumpV116 = { schema: 116, phase: 'arrived', originWorldId: COCYTE, destinationId: 'world-01-acheron-lv-426', completedAt: 1700000000000 };
  assert.deepEqual(deliverTravelMessagesV188(save, { status: 'blocked' }), []);
  applyJumpTravelTimeV188(save, { status: 'arrived' });
  const added = deliverTravelMessagesV188(save, { status: 'arrived' }, { relayRoomReady: true });
  assert.deepEqual(added.map(entry => entry.kind), ['colony', 'asphodele', 'company', 'origin', 'destination']);
  for (const message of added) { assert.equal(message.receivedDay, 17); assert.ok(message.sentDay < 17 && message.sentDay >= 3, message.kind); }
  assert.equal(added.find(entry => entry.kind === 'colony').receivedDay - added.find(entry => entry.kind === 'colony').sentDay, 2, 'relayed by Asphodèle');
  assert.deepEqual(deliverTravelMessagesV188(save, { status: 'arrived' }), [], 'never twice for the same jump');
  save.galaxy.worldState['world-01-acheron-lv-426'].infestation = 99;
  const fr = travelMessagesListV188(save, 'fr', id => id === COCYTE ? 'Cocyte' : 'Acheron');
  const en = travelMessagesListV188(save, 'en', id => id === COCYTE ? 'Cocyte' : 'Acheron');
  assert.equal(fr.length, 5); assert.equal(fr[0].kind, 'destination', 'newest first');
  assert.match(fr[0].body, /À l’arrivée, 9 jours plus tard : 99 %/); assert.match(en[0].body, /On arrival, 9 days later: 99%/);
  assert.match(en.find(entry => entry.kind === 'company').body, /arrives \d+ days late/);
  for (let i = 0; i < fr.length; i += 1) assert.notEqual(fr[i].body, en[i].body);
  assert.match(travelArrivalNoticeV188(5, 'en'), /5 messages received late/);
  const app = read('src/app.js');
  assert.match(app, /deliverTravelMessagesV188\(saveSystem\.data, settlement, \{ relayRoomReady: asphodeleRelayReadyV188\(saveSystem\.data\) \}\)/);
  assert.match(app, /travelMessagesListV188\(saveSystem\.data, langV188/);
  assert.match(app, /data-travel-message-v188/);
});

test('travel messages: without the colony or the station, only the company and the worlds write; the list is capped', () => {
  const save = createDefaultSave(); save.portMeridienV90 = null; save.clock = { day: 20, hour: 0 };
  save.galaxy.jumpV116 = { schema: 116, phase: 'arrived', originWorldId: COCYTE, destinationId: 'world-01-acheron-lv-426', completedAt: 1 };
  assert.deepEqual(deliverTravelMessagesV188(save, { status: 'arrived' }).map(entry => entry.kind), ['company', 'origin', 'destination']);
  const many = { messages: Array.from({ length: 50 }, (_, i) => ({ kind: 'company', sentDay: i + 1, receivedDay: i + 5 })) };
  assert.equal(normalizeTravelMessagesV188(many).messages.length, TRAVEL_MESSAGES_MAX_V188);
  assert.deepEqual(normalizeTravelMessagesV188({ messages: [{ kind: 'hack', sentDay: 1, receivedDay: 2 }, { kind: 'company', sentDay: 9, receivedDay: 2 }] }).messages, []);
});

// —— Save round trip, resume, old saves ——
test('save: additive fields, old saves load, colony and quest progress and messages survive a reload', () => {
  const old = createDefaultSave(); delete old.colonyMissionsV188; delete old.travelMessagesV188;
  const migrated = roundTrip(old);
  assert.deepEqual(migrated.colonyMissionsV188, { schema: 188, rewarded: [], scenesSeen: [], c4: null, grue: null, contracts: {}, population: 0 });
  assert.deepEqual(migrated.travelMessagesV188, { schema: 188, lastJumpAt: null, messages: [] });
  assert.equal(storyDossierV188(migrated).count, 0);
  const save = actOne(); complete(save, 'special-archive-relay'); win(save, 'colony-c1'); win(save, 'colony-l-murs');
  save.hub.services = {};
  acceptCrewQuestV188(save, 'ship-kwan'); save.hub.services['service:power'] = 3; answerCrewQuestStepV188(save, 'ship-kwan', 'quarantine');
  acceptCrewQuestV188(save, 'ship-doyle'); applyCrewQuestOperationResultV188(save, { success: true, worldId: COCYTE });
  save.clock = { day: 2, hour: 0 }; save.galaxy.jumpV116 = { schema: 116, phase: 'arrived', originWorldId: COCYTE, destinationId: 'world-01-acheron-lv-426', completedAt: 42 };
  deliverTravelMessagesV188(save, { status: 'arrived' });
  const reloaded = roundTrip(save);
  assert.deepEqual(normalizeColonyMissionsV188(reloaded.colonyMissionsV188).rewarded, ['colony-c1']);
  assert.equal(normalizeColonyMissionsV188(reloaded.colonyMissionsV188).contracts.walls, 1);
  assert.equal(applyColonyMissionResultV188(reloaded, { success: true, campaignId: 'colony-c1' }).kind, 'replay', 'no second payment after a reload');
  assert.equal(crewQuestGateOpenV188(reloaded, 'ship-kwan'), true, 'the gate mark survives');
  assert.equal(crewQuestStepV188(reloaded, 'ship-kwan').index, 1, 'the quest resumes at its step');
  assert.equal(normalizeCrewQuestsV188(reloaded.crewQuestsV188).quests['ship-doyle'].components, 1);
  assert.equal(reloaded.travelMessagesV188.messages.length, save.travelMessagesV188.messages.length);
  assert.deepEqual(deliverTravelMessagesV188(reloaded, { status: 'arrived' }), [], 'a reload does not deliver the jump twice');
  assert.deepEqual(normalizeColonyMissionsV188({ rewarded: ['colony-l-murs', 'hack'], c4: 'burn', population: 99 }), { schema: 188, rewarded: [], scenesSeen: [], c4: null, grue: null, contracts: {}, population: 12 });
});

// —— i18n ——
test('i18n: campaign texts in the reviewed catalog; quests, scenes, decisions and lock texts in FR and EN', () => {
  const catalog = read('src/i18n-en-catalog-v185.js');
  for (const campaign of COLONY_CAMPAIGNS_V188) {
    for (const text of [campaign.name, campaign.summary, campaign.description]) assert.ok(catalog.includes(JSON.stringify(text)), text);
    assert.ok(catalog.includes(JSON.stringify(COLONY_NAMES_EN_V188[campaign.id])), campaign.id);
  }
  for (const quest of CREW_QUESTS_TANTALUS_V188) {
    for (const key of ['title', 'where', 'offer', 'completion', 'after']) { assert.ok(quest[key].fr && quest[key].en, `${quest.id}.${key}`); assert.notEqual(quest[key].fr, quest[key].en); }
    for (const key of ['progressText', 'acceptText', 'turnInText', 'turnInLabel', 'toastText', 'epilogueLine']) if (quest[key]) assert.notEqual(quest[key].fr, quest[key].en, `${quest.id}.${key}`);
    if (quest.gate) assert.notEqual(quest.gate.waitText.fr, quest.gate.waitText.en);
    for (const step of quest.steps || []) {
      for (const text of [step.prompt, step.explain, ...step.options.map(entry => entry.label)]) assert.ok(text.fr && text.en && text.fr !== text.en, quest.id);
      assert.ok(step.options.some(entry => entry.correct));
    }
  }
  for (const scene of Object.values(COLONY_SCENES_V188)) { assert.notEqual(scene.title.fr, scene.title.en); assert.notEqual(scene.text.fr, scene.text.en); }
  for (const decision of Object.values(COLONY_DECISION_TEXT_V188)) for (const group of [decision.options, decision.results]) for (const text of Object.values(group)) assert.notEqual(text.fr, text.en);
  for (const reason of ['previous', 'c1', 'c3', 'too-late', 'tier', 'defensive', 'act:special-black-cocoon']) assert.notEqual(colonyLockTextV188(reason, 'fr'), colonyLockTextV188(reason, 'en'));
  assert.match(crewQuestActionsV188(actOne(), 'crew-02-tamsin-velez', 'en')[0].label, /^QUEST · Echo-8’s People/);
});

// —— Art slots, service worker, admission ——
test('art slots: all eighteen admitted scene files are real PNGs and every scene/quest keeps its slot', () => {
  assert.equal(COLONY_CREW_FILES_PRESENT_V188.length, 18);
  assert.deepEqual([...COLONY_CREW_FILES_PRESENT_V188].sort(), COLONY_CREW_SLOTS_V188.map(slot => slot.id).sort());
  for (const id of COLONY_CREW_FILES_PRESENT_V188) {
    const file = new URL(`..${getColonyCrewSlotV188(id).path}`, import.meta.url); assert.ok(existsSync(file), id);
    const bytes = readFileSync(file);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', id);
    assert.equal(bytes.subarray(12, 16).toString(), 'IHDR', id);
    assert.ok(bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0, id);
  }
  const known = id => getColonyCrewSlotV188(id) || CONTENT_GAP_SLOTS_V188.some(entry => entry.id === id);
  for (const scene of Object.values(COLONY_SCENES_V188)) assert.ok(known(scene.slot), scene.slot);
  for (const quest of CREW_QUESTS_TANTALUS_V188) assert.ok(known(quest.slot), quest.slot);
});

test('art fallback: all slots remain readable without images and never request unadmitted files', () => {
  const calls = [];
  const ctx = new Proxy({}, { get: (_, key) => (key in Object.prototype ? undefined : (...args) => { calls.push(key); return { addColorStop() {}, width: 10 }; }), set: () => true });
  const loader = new ColonyCrewAssetLoaderV188({ ImageCtor: class {}, present: [] });
  assert.deepEqual(loader.preload(), []);
  for (const slot of COLONY_CREW_SLOTS_V188) { assert.equal(loader.draw(ctx, slot.id, 640, 280, { language: 'en' }), 'primitive'); assert.ok(slot.brief.length > 40); assert.notEqual(slot.label.fr, slot.label.en); }
  assert.ok(calls.length > 200);
  assert.throws(() => loader.draw(ctx, 'nope', 10, 10), /Unknown colony art slot/);
  assert.match(read('src/content-gap-ui-v188.js'), /getColonyCrewSlotV188\(slot\) \? \(sharedColonyLoader/);
  for (const slot of COLONY_CREW_SLOTS_V188) assert.doesNotMatch(slot.brief, /\b1:1\b/);
});

const artContext = () => {
  const calls = [], state = {};
  const ctx = new Proxy(state, { get: (target, key) => key in target ? target[key] : (...args) => {
    calls.push({ key, args }); return { addColorStop() {}, width: 10 };
  }, set: (target, key, value) => { target[key] = value; return true; } });
  return { ctx, calls };
};
function delayedImages() {
  const created = [];
  class Image {
    constructor() { this.complete = false; this.naturalWidth = 0; this.naturalHeight = 0; this.events = new Map(); created.push(this); }
    addEventListener(type, fn) { if (!this.events.has(type)) this.events.set(type, new Set()); this.events.get(type).add(fn); }
    removeEventListener(type, fn) { this.events.get(type)?.delete(fn); }
    settle(type = 'load', width = 1600, height = 900) {
      this.complete = true; this.naturalWidth = type === 'load' ? width : 0; this.naturalHeight = type === 'load' ? height : 0;
      for (const fn of [...(this.events.get(type) || [])]) fn();
    }
  }
  return { Image, created };
}

test('art loader: lazy, one request per admitted slot, bounded uniform cover, failed-image fallback and unsubscription', () => {
  const { Image, created } = delayedImages(), { ctx, calls } = artContext();
  const loader = new ColonyCrewAssetLoaderV188({ ImageCtor: Image });
  assert.equal(created.length, 0, 'constructor is lazy');
  let updates = 0; const release = loader.subscribe('colony-quay-warehouse', () => { updates += 1; });
  loader.preload(['colony-quay-warehouse', 'unknown']); loader.preload(['colony-quay-warehouse']);
  assert.equal(created.length, 1); assert.deepEqual(loader.requested, ['/assets/content/v188/colony/colony-quay-warehouse.png']);
  assert.equal(loader.draw(ctx, 'colony-quay-warehouse', 640, 280), 'primitive');
  created[0].settle(); assert.equal(updates, 1);
  assert.equal(loader.draw(ctx, 'colony-quay-warehouse', 640, 280), 'image');
  const draw = calls.findLast(call => call.key === 'drawImage').args;
  assert.equal(draw[0], created[0]); assert.deepEqual(draw.slice(1), [0, 100, 1600, 700, 0, 0, 640, 280]);
  assert.equal(draw[7] / draw[3], draw[8] / draw[4], 'one scale in both axes');
  assert.ok(draw[1] >= 0 && draw[2] >= 0 && draw[1] + draw[3] <= 1600 && draw[2] + draw[4] <= 900);
  release(); assert.equal(loader.listeners.has('colony-quay-warehouse'), false);
  loader.preload(['colony-screening']); created[1].settle('error');
  assert.equal(loader.draw(ctx, 'colony-screening', 640, 280), 'primitive');
  loader.preload(['colony-screening']); assert.equal(created.length, 2, 'a failed file does not form a request loop');
  assert.equal(loader.frames['colony-screening'].crop, null);
  loader.preload(['colony-processor']); created[2].settle('load', 100, 0);
  assert.equal(loader.image('colony-processor'), null, 'invalid natural dimensions remain fallback');
});

test('art evidence: exact narrative numbers, distinct CRT meanings, readable FR/EN labels, no invented Wren timestamps', () => {
  const { ctx, calls } = artContext(), loader = new ColonyCrewAssetLoaderV188({ ImageCtor: null, present: [] });
  const rendered = (id, language) => {
    calls.length = 0; loader.draw(ctx, id, 640, 280, { language });
    return calls.filter(call => call.key === 'fillText').map(call => call.args[0]);
  };
  for (const id of COLONY_CREW_EVIDENCE_IDS_V188) {
    const fr = rendered(id, 'fr'), en = rendered(id, 'en');
    assert.equal(loader.frames[id].evidence, true); assert.notDeepEqual(fr, en, id);
  }
  const flight = rendered('quest-flight-recorder', 'en');
  for (const fact of ['900 m', '22 min', '02:14', '02:36', 'SLOT RESERVED']) assert.ok(flight.includes(fact), fact);
  const reactor = rendered('quest-reactor', 'en');
  for (const fact of ['+4 %', '100 %', '104 %', '01:00', '05:00']) assert.ok(reactor.includes(fact), fact);
  const register = rendered('quest-register', 'fr');
  for (const fact of ['13:58', '14:01', '14:02', 'Ordre : « Fermez l’accès. »', 'Charge de Reyes']) assert.ok(register.includes(fact), fact);
  assert.ok(rendered('quest-colonist-list', 'en').includes('QZ-18: 3 calls held for 6 days'));
  const directive = rendered('quest-directive', 'en');
  assert.ok(directive.includes('BISHOP-9')); assert.ok(directive.includes('REDACTED LINE'));
  assert.ok(!directive.some(text => /900|22 min|104/.test(text)), 'the directive does not inherit the generic flight graph');
  const notebooks = rendered('wren-notebooks', 'en');
  assert.ok(notebooks.includes('UNDER SEAL')); assert.ok(notebooks.includes('FREIGHT PRIORITY'));
  assert.ok(!notebooks.some(text => /\b\d{2}:\d{2}\b/u.test(text)), 'Wren’s actual hours are not specified by the story');
});

function sceneDocument(ctx) {
  const document = { activeElement: null, focusCalls: 0 };
  class Element {
    constructor(tag) { this.tagName = tag; this.children = []; this.dataset = {}; this.style = {}; this.events = new Map(); this.ownerDocument = document; }
    get isConnected() { return this === document.body || Boolean(this.parentElement?.isConnected); }
    append(...children) { for (const child of children) { child.parentElement = this; this.children.push(child); } }
    replaceChildren(...children) { for (const child of this.children) child.parentElement = null; this.children = []; this.append(...children); }
    remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter(child => child !== this); this.parentElement = null; }
    setAttribute(key, value) { this[key] = value; }
    getContext() { return ctx; }
    addEventListener(type, fn) { if (!this.events.has(type)) this.events.set(type, new Set()); this.events.get(type).add(fn); }
    fire(type) { for (const fn of [...(this.events.get(type) || [])]) fn({ preventDefault() {} }); }
    close() { this.open = false; this.fire('close'); }
    showModal() { this.open = true; }
    focus() { document.activeElement = this; document.focusCalls += 1; }
    querySelector(tag) { for (const child of this.children) { if (child.tagName === tag) return child; const result = child.querySelector(tag); if (result) return result; } return null; }
  }
  document.createElement = tag => new Element(tag); document.body = new Element('body'); return document;
}

test('scene dialog: a late image repaints the current card without replaying choices, moving focus or touching another slot', () => {
  const { ctx, calls } = artContext(), { Image, created } = delayedImages(), document = sceneDocument(ctx);
  const loader = new ColonyCrewAssetLoaderV188({ ImageCtor: Image });
  let choices = 0, closes = 0;
  const view = openContentSceneDialogV188({ document, loader, slot: 'colony-quay-warehouse', title: 'Warehouse', text: 'First scene',
    options: [{ id: 'next', label: 'Next' }], onChoose: () => { choices += 1; return { slot: 'colony-processor', title: 'Processor', text: 'Second scene', options: [{ id: 'done', label: 'Done' }] }; }, onClose: () => { closes += 1; } });
  assert.equal(created.length, 1); assert.equal(loader.usage['colony-quay-warehouse'], 'primitive');
  const focused = document.activeElement, focusCount = document.focusCalls;
  created[0].settle(); assert.equal(loader.usage['colony-quay-warehouse'], 'image');
  assert.equal(document.activeElement, focused); assert.equal(document.focusCalls, focusCount); assert.equal(choices, 0);
  focused.fire('click'); assert.equal(choices, 1); assert.equal(created.length, 2);
  assert.equal(view.dialog.dataset.contentSceneV188, 'colony-processor');
  assert.equal(loader.listeners.has('colony-quay-warehouse'), false);
  view.render({ slot: 'colony-cult', title: 'Cult', text: 'Third scene', options: [{ id: 'done', label: 'Done' }] });
  assert.equal(created.length, 3); calls.length = 0;
  created[1].settle(); assert.equal(calls.length, 0, 'superseded slot cannot repaint the dialog');
  const focusBeforeFailure = document.focusCalls;
  created[2].settle('error'); assert.equal(loader.usage['colony-cult'], 'primitive');
  assert.equal(document.focusCalls, focusBeforeFailure); assert.equal(choices, 1);
  view.render({ slot: 'quest-vents', title: 'Vents', text: 'Fourth scene' }); assert.equal(created.length, 4);
  view.close(); calls.length = 0; created[3].settle();
  assert.equal(calls.length, 0, 'a closed dialog cannot receive a late image');
  assert.equal(loader.listeners.size, 0); assert.equal(closes, 1); assert.equal(document.body.children.length, 0);
  view.render({ slot: 'colony-beacon' }); assert.equal(created.length, 4, 'render after close is inert');
});

test('service worker, package script and source-only admission', () => {
  const sw = read('sw.js');
  for (const file of ['colony-missions-v188', 'crew-quests-tantalus-v188', 'travel-messages-v188', 'colony-crew-slots-v188']) assert.ok(sw.includes(`'/src/${file}.js'`), file);
  assert.match(JSON.parse(read('package.json')).scripts['test:priorities:v188'], /scripts\/verify-colony-crew-v188\.mjs/);
  assert.ok(read('scripts/verify-public-release-v86.mjs').includes("'scripts/verify-colony-crew-v188.mjs'"));
});
