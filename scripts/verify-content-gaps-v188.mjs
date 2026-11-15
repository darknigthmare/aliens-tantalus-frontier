// V188 content gaps (spec 005): Asphodèle station front, first crew quests,
// galactic travel time. Access, save round trip, resume and i18n per item.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createDefaultSave, migrateSave } from '../src/save.js';
import { CAMPAIGNS, validateContent } from '../src/content.js';
import { selectMissionTemplateV52 } from '../src/mission-levels-v52.js';
import { resolveMissionRegisterV188 } from '../src/mission-register-v188.js';
import {
  STATION_CAMPAIGNS_V188, STATION_CAMPAIGN_IDS_V188, stationLockReasonV188, filterUnlockedCampaignsV188, markStationIntroHeardV188,
  cassiusChoicePendingV188, chooseCassiusV188, stationReturnSceneDueV188, markStationSceneSeenV188, asphodeleRetakenV188,
  normalizeStationV188, stationSnapshotV188, STATION_SCENES_V188, CASSIUS_DIALOG_V188, CASSIUS_CHOICES_V188, stationLockTextV188
} from '../src/station-asphodele-v188.js';
import { storyDossierV188, finalChoiceOptionsV188 } from '../src/story-dossier-v188.js';
import {
  CREW_QUESTS_V188, crewQuestActionsV188, acceptCrewQuestV188, answerCrewQuestStepV188, crewQuestStepV188, turnInCrewQuestV188,
  applyCrewQuestOperationResultV188, normalizeCrewQuestsV188, crewQuestsSnapshotV188
} from '../src/crew-quests-v188.js';
import { JUMP_TRAVEL_DAYS_V188, applyJumpTravelTimeV188, jumpRouteTextV188, jumpArrivalTextV188 } from '../src/galaxy-travel-v188.js';
import { CONTENT_GAP_SLOTS_V188, CONTENT_GAP_FILES_PRESENT_V188, ContentGapAssetLoaderV188 } from '../src/content-gap-slots-v188.js';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const roundTrip = save => migrateSave(JSON.parse(JSON.stringify(save)));
const complete = (save, id) => { if (!save.galaxy.completedCampaignIds.includes(id)) save.galaxy.completedCampaignIds.push(id); };
const actTwo = () => { const save = createDefaultSave(); complete(save, 'special-archive-relay'); return save; };
const solveAnalysis = (save, id) => {
  const quest = CREW_QUESTS_V188.find(entry => entry.id === id);
  let last = null;
  for (const step of quest.steps) last = answerCrewQuestStepV188(save, id, step.options.find(option => option.correct).id);
  return last;
};

// —— Asphodèle station front ——
test('station: four bible missions on Cocyte, station interior template, registers of §0.3, content valid', () => {
  assert.deepEqual(STATION_CAMPAIGN_IDS_V188, ['station-s1', 'station-s2', 'station-s3', 'station-s4']);
  assert.equal(validateContent().ok, true);
  for (const campaign of STATION_CAMPAIGNS_V188) {
    assert.ok(CAMPAIGNS.some(entry => entry.id === campaign.id), campaign.id);
    assert.equal(selectMissionTemplateV52({ campaign }), 'ship-interior-vertical');
  }
  assert.deepEqual(STATION_CAMPAIGNS_V188.map(resolveMissionRegisterV188), ['horror', 'tension', 'horror', 'action']);
});

test('station access: Act II, then Rook’s recording, then S1 → S4 in order with CASSIUS decided after S2', () => {
  const fresh = createDefaultSave();
  assert.equal(stationLockReasonV188(fresh, 'station-s1'), 'act-two');
  assert.equal(filterUnlockedCampaignsV188(fresh, CAMPAIGNS).some(entry => entry.id === 'station-s1'), false);
  const save = actTwo();
  assert.equal(stationLockReasonV188(save, 'station-s1'), 'intro');
  assert.equal(markStationIntroHeardV188(save), true);
  assert.equal(stationLockReasonV188(save, 'station-s1'), null);
  assert.equal(stationLockReasonV188(save, 'station-s2'), 'previous');
  complete(save, 'station-s1'); complete(save, 'station-s2');
  assert.equal(stationLockReasonV188(save, 'station-s3'), 'cassius');
  assert.equal(cassiusChoicePendingV188(save), true);
  const before = save.galaxy.worldState['world-05-lethe'].quarantine;
  assert.ok(chooseCassiusV188(save, 'rewrite'));
  assert.equal(chooseCassiusV188(save, 'erase'), null, 'the decision is taken once (Q7)');
  assert.equal(save.galaxy.worldState['world-05-lethe'].quarantine, Math.max(0, before - 6));
  assert.equal(stationLockReasonV188(save, 'station-s3'), null);
  complete(save, 'station-s3'); complete(save, 'station-s4');
  assert.equal(asphodeleRetakenV188(save), true);
  // An active operation stays listed even if its lock would apply (resume).
  const resumed = actTwo(); resumed.strategy.currentOperation = { campaignId: 'station-s2' };
  assert.ok(filterUnlockedCampaignsV188(resumed, CAMPAIGNS).some(entry => entry.id === 'station-s2'));
});

test('station feeds the dossier and the final choice: CASSIUS orders after S2, Asphodèle retaken after S4', () => {
  const save = actTwo(); markStationIntroHeardV188(save);
  assert.equal(storyDossierV188(save).pieces.find(piece => piece.id === 'cassius-orders').held, false);
  complete(save, 'station-s1'); complete(save, 'station-s2'); chooseCassiusV188(save, 'erase');
  const piece = storyDossierV188(save).pieces.find(entry => entry.id === 'cassius-orders');
  assert.equal(piece.held, true, 'orders copied in S2 survive an erased CASSIUS'); assert.equal(piece.unavailable, false);
  complete(save, 'station-s3'); complete(save, 'station-s4');
  assert.equal(finalChoiceOptionsV188(save).options.some(option => option.id === 'transmit'), false, 'relay room still closed');
  assert.ok(finalChoiceOptionsV188(save, { relayRoomOpen: true }).options.length >= 2);
});

test('station save: round trip, old save without the field, return scenes once, resume after reload', () => {
  const old = createDefaultSave(); delete old.stationV188;
  assert.deepEqual(roundTrip(old).stationV188, { schema: 188, introHeard: false, cassius: null, scenesSeen: [] });
  assert.deepEqual(normalizeStationV188({ introHeard: 'yes', cassius: 'delete', scenesSeen: ['s1', 'bad', 's1'] }), { schema: 188, introHeard: false, cassius: null, scenesSeen: ['s1'] });
  const save = actTwo(); markStationIntroHeardV188(save); complete(save, 'station-s1');
  assert.equal(stationReturnSceneDueV188(save), 's1');
  const reloaded = roundTrip(save);
  assert.equal(reloaded.stationV188.introHeard, true);
  assert.equal(stationReturnSceneDueV188(reloaded), 's1', 'a scene not yet shown is shown after a reload');
  markStationSceneSeenV188(reloaded, 's1');
  complete(reloaded, 'station-s2');
  const again = roundTrip(reloaded);
  assert.equal(stationReturnSceneDueV188(again), null);
  assert.equal(cassiusChoicePendingV188(again), true, 'a pending CASSIUS decision survives a reload');
  chooseCassiusV188(again, 'restrain');
  assert.equal(roundTrip(again).stationV188.cassius, 'restrain');
});

test('station i18n: every scene, dialog, lock and snapshot text exists in FR and EN', () => {
  for (const scene of Object.values(STATION_SCENES_V188)) for (const key of ['title', 'text']) { assert.ok(scene[key].fr && scene[key].en); assert.notEqual(scene[key].fr, scene[key].en); }
  for (const id of CASSIUS_CHOICES_V188) assert.ok(CASSIUS_DIALOG_V188.options[id].en && CASSIUS_DIALOG_V188.results[id].en);
  for (const reason of ['act-two', 'intro', 'previous', 'cassius']) assert.notEqual(stationLockTextV188(reason, 'en'), stationLockTextV188(reason, 'fr'));
  const snapshot = stationSnapshotV188(actTwo(), 'en');
  assert.match(snapshot.hint, /Rook/);
  assert.equal(snapshot.steps[1].name, 'ASPHODÈLE · THE VOICE OF CASSIUS');
  const catalog = read('src/i18n-en-catalog-v185.js');
  for (const campaign of STATION_CAMPAIGNS_V188) for (const text of [campaign.name, campaign.summary, campaign.description]) assert.ok(catalog.includes(JSON.stringify(text)), text);
});

// —— Crew quests ——
test('crew quests: Q9 quests (Rook, Vega, Harlow, DAVID-8R), offered only after their act, in the hub conversation', () => {
  assert.deepEqual(CREW_QUESTS_V188.map(quest => quest.id), ['ship-rook', 'ship-vega', 'ship-harlow', 'ship-david']);
  const fresh = createDefaultSave();
  for (const quest of CREW_QUESTS_V188) assert.deepEqual(crewQuestActionsV188(fresh, quest.crewId), [], quest.id);
  const save = actTwo();
  assert.equal(crewQuestActionsV188(save, 'crew-06-rook')[0].action, 'accept');
  assert.equal(crewQuestActionsV188(save, 'crew-10-david-8r').length, 0, 'DAVID-8R needs Act I');
  complete(save, 'special-narrative-qz17');
  assert.equal(crewQuestActionsV188(save, 'crew-09-inez-harlow').length, 0, 'Harlow needs the seal evidence');
  save.narrativeArchives.unlockedFlags.push('qz17-maintenance-bypass');
  assert.equal(crewQuestActionsV188(save, 'crew-09-inez-harlow').length, 1);
  const app = read('src/app.js');
  assert.match(app, /data-crew-quest-v188/); assert.match(app, /openCrewQuestV188\(questIdV188\)/);
});

test('crew quests: no reward before proof; Rook opens the station; Vega’s trust feeds Act V; Harlow pays research once', () => {
  const save = actTwo(); complete(save, 'special-narrative-qz17'); save.narrativeArchives.unlockedFlags.push('qz17-quarantine-lock');
  const loyalty = id => save.crew.find(member => member.id === id)?.loyalty;
  assert.ok(acceptCrewQuestV188(save, 'ship-rook'));
  const wrong = answerCrewQuestStepV188(save, 'ship-rook', 'creature');
  assert.equal(wrong.correct, false); assert.equal(crewQuestStepV188(save, 'ship-rook').index, 0, 'a wrong reading keeps the step');
  const rookBefore = loyalty('crew-06-rook');
  assert.equal(solveAnalysis(save, 'ship-rook').done, true);
  assert.equal(loyalty('crew-06-rook'), Math.min(100, rookBefore + 5));
  assert.equal(stationLockReasonV188(save, 'station-s1'), null, '« Six heures de silence » opens S1');
  const vegaBefore = loyalty('crew-01-mara-vega');
  acceptCrewQuestV188(save, 'ship-vega'); solveAnalysis(save, 'ship-vega');
  assert.equal(loyalty('crew-01-mara-vega'), Math.min(100, vegaBefore + 10));
  const research = save.galaxy.resources.research;
  acceptCrewQuestV188(save, 'ship-harlow'); solveAnalysis(save, 'ship-harlow');
  assert.equal(save.galaxy.resources.research, research + 6);
  assert.equal(answerCrewQuestStepV188(save, 'ship-harlow', 'inside').ok, false, 'a finished quest cannot pay twice');
  assert.equal(acceptCrewQuestV188(save, 'ship-harlow'), false);
});

test('crew quests: DAVID-8R components come from successful Cocyte operations only, then turn in', () => {
  const save = createDefaultSave(); complete(save, 'special-narrative-qz17');
  assert.equal(applyCrewQuestOperationResultV188(save, { success: true, worldId: 'world-05-lethe' }), null, 'not accepted yet');
  acceptCrewQuestV188(save, 'ship-david');
  assert.equal(turnInCrewQuestV188(save, 'ship-david').ok, false);
  applyCrewQuestOperationResultV188(save, { success: false, worldId: 'world-05-lethe' });
  applyCrewQuestOperationResultV188(save, { success: true, worldId: 'world-01-acheron-lv-426' });
  for (let i = 0; i < 4; i += 1) applyCrewQuestOperationResultV188(save, { success: true, worldId: 'world-05-lethe' });
  assert.equal(normalizeCrewQuestsV188(save.crewQuestsV188).quests['ship-david'].components, 3, 'capped at three');
  assert.equal(crewQuestActionsV188(save, 'crew-10-david-8r')[0].action, 'turn-in');
  assert.equal(turnInCrewQuestV188(save, 'ship-david', 'en').ok, true);
  assert.equal(crewQuestsSnapshotV188(save).find(entry => entry.id === 'ship-david').status, 'done');
});

test('crew quests save: additive field, old save loads, an active quest resumes at its step after reload', () => {
  const old = createDefaultSave(); delete old.crewQuestsV188;
  assert.deepEqual(roundTrip(old).crewQuestsV188, { schema: 188, quests: {} });
  const save = actTwo(); acceptCrewQuestV188(save, 'ship-rook');
  answerCrewQuestStepV188(save, 'ship-rook', 'vents');
  const reloaded = roundTrip(save);
  assert.equal(crewQuestStepV188(reloaded, 'ship-rook').index, 1);
  assert.deepEqual(normalizeCrewQuestsV188({ quests: { 'ship-rook': { stage: 'hacked', step: 9 }, other: { stage: 'done' } } }), { schema: 188, quests: {} });
});

test('crew quests i18n: every offer, step, option, explanation and completion in FR and EN', () => {
  for (const quest of CREW_QUESTS_V188) {
    for (const key of ['title', 'where', 'offer', 'completion', 'after']) { assert.ok(quest[key].fr && quest[key].en, `${quest.id}.${key}`); assert.notEqual(quest[key].fr, quest[key].en); }
    for (const step of quest.steps || []) {
      for (const text of [step.prompt, step.explain, ...step.options.map(option => option.label)]) assert.ok(text.fr && text.en && text.fr !== text.en);
      assert.ok(step.options.some(option => option.correct));
    }
  }
  assert.match(crewQuestActionsV188(actTwo(), 'crew-06-rook', 'en')[0].label, /^QUEST · Six Hours/);
});

// —— Galactic travel ——
test('travel: the route shows fuel and days before departure; arrival adds 14 days once', () => {
  assert.match(jumpRouteTextV188({ fuel: 4 }, 'fr'), /4 unités de carburant · 14 jours en hypersommeil/);
  assert.match(jumpRouteTextV188({ fuel: 4 }, 'en'), /4 fuel units · 14 days in hypersleep/);
  assert.notEqual(jumpArrivalTextV188('fr'), jumpArrivalTextV188('en'));
  const save = createDefaultSave(); save.clock = { day: 3, hour: 10 };
  save.galaxy.jumpV116 = { phase: 'arrived' };
  assert.equal(applyJumpTravelTimeV188(save, { status: 'blocked' }), 0);
  assert.equal(applyJumpTravelTimeV188(save, { status: 'arrived' }), JUMP_TRAVEL_DAYS_V188 * 24);
  assert.deepEqual(save.clock, { day: 17, hour: 10 });
  assert.equal(applyJumpTravelTimeV188(save, { status: 'arrived' }), 0, 'never twice');
  const app = read('src/app.js');
  assert.match(app, /applyJumpTravelTimeV188\(saveSystem\.data, settlement\)/);
  assert.match(app, /jumpRouteTextV188\(jump/);
});

// —— Art slots, service worker, admission ——
test('art slots: Canvas placeholders only, every slot draws, no network request without a committed file', () => {
  assert.deepEqual(CONTENT_GAP_FILES_PRESENT_V188, []);
  for (const id of CONTENT_GAP_FILES_PRESENT_V188) assert.ok(existsSync(new URL(`..${CONTENT_GAP_SLOTS_V188.find(entry => entry.id === id).path}`, import.meta.url)));
  const calls = [];
  const ctx = new Proxy({}, { get: (_, key) => (key in Object.prototype ? undefined : (...args) => { calls.push(key); return { width: 10 }; }), set: () => true });
  const loader = new ContentGapAssetLoaderV188({ ImageCtor: class {} });
  assert.deepEqual(loader.preload(), []);
  for (const slot of CONTENT_GAP_SLOTS_V188) assert.equal(loader.draw(ctx, slot.id, 640, 280, { language: 'en' }), 'primitive');
  assert.ok(calls.length > 50);
  for (const slot of [...new Set(['asphodele-exterior', 'cassius-core', 'echo8-recording', 'order-documents', 'seal-fragment', 'david-memory'])]) assert.ok(CONTENT_GAP_SLOTS_V188.some(entry => entry.id === slot));
});

test('service worker, package script and source-only admission', () => {
  const sw = read('sw.js');
  for (const file of ['station-asphodele-v188', 'crew-quests-v188', 'galaxy-travel-v188', 'content-gap-slots-v188', 'content-gap-ui-v188']) assert.ok(sw.includes(`'/src/${file}.js'`), file);
  assert.match(JSON.parse(read('package.json')).scripts['test:priorities:v188'], /scripts\/verify-content-gaps-v188\.mjs/);
  const admission = read('scripts/verify-public-release-v86.mjs');
  for (const path of ['scripts/verify-content-gaps-v188.mjs', 'docs/development/AUDIT_CONTENU_V188.md', 'specs/005-front-asphodele-quetes/spec.md']) assert.ok(admission.includes(`'${path}'`), path);
});
