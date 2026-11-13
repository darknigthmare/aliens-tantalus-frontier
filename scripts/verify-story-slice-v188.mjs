import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { createDefaultSave, migrateSave, beginOperation } from '../src/save.js';
import { deriveStoryCampaignV188, markStoryDebriefSeenV188, normalizeStoryCampaignV188,
  STORY_RELAY_CAMPAIGN_ID_V188, STORY_SLICE_STEPS_V188 } from '../src/story-campaign-v188.js';
import { storyEndingReachedV188, STORY_ENDING_CHAPTERS_V188 } from '../src/story-campaign-v188.js';
import { buildObjectivePanelV188, OBJECTIVE_PANEL_V188 } from '../src/mission-objective-panel-v188.js';
import { fixture, tick } from './engine-host-v188.mjs';
import { createPortMeridienV90, normalizePortMeridienV90, PORT_RECEIPT_V90 } from '../src/port-meridien-v90.js';
import { createPlayerOpeningV88, normalizePlayerOpeningV88 } from '../src/player-opening-v88.js';

const relay = CAMPAIGNS.find(entry => entry.id === STORY_RELAY_CAMPAIGN_ID_V188);
function afterPort() {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  save.onboardingV84 = { phase: 'complete' }; save.openingV88 = { phase: 'ready' }; save.portMeridienV90 = { phase: 'complete' };
  return save;
}

test('the slice walks creation → wake → ship → port → briefing → qz18 → debrief → next', () => {
  assert.ok(relay, 'QZ-18 is a registered campaign');
  const save = createDefaultSave();
  save.needsPlayerCreationV84 = true; assert.equal(deriveStoryCampaignV188(save).step, 'creation');
  save.needsPlayerCreationV84 = false; save.onboardingV84 = { phase: 'medical' };
  assert.equal(deriveStoryCampaignV188(save).step, 'wake');
  save.onboardingV84 = { phase: 'complete' }; save.openingV88 = { phase: 'armory' };
  assert.equal(deriveStoryCampaignV188(save).step, 'ship');
  save.openingV88 = { phase: 'ready' }; save.portMeridienV90 = { phase: 'triage' };
  assert.equal(deriveStoryCampaignV188(save).step, 'port');
  save.portMeridienV90 = { phase: 'complete' };
  const briefing = deriveStoryCampaignV188(save, { language: 'fr' });
  assert.equal(briefing.step, 'briefing'); assert.equal(briefing.recommendedCampaignId, STORY_RELAY_CAMPAIGN_ID_V188);
  assert.match(briefing.objective, /QZ-18/);
  assert.match(deriveStoryCampaignV188(save, { language: 'en' }).objective, /The Last Relay/);
  assert.match(briefing.objective, /table tactique/);
  save.strategy.currentOperation = { campaignId: STORY_RELAY_CAMPAIGN_ID_V188 };
  assert.equal(deriveStoryCampaignV188(save).step, 'qz18');
  save.strategy.currentOperation = null; save.galaxy.completedCampaignIds.push(STORY_RELAY_CAMPAIGN_ID_V188);
  assert.equal(deriveStoryCampaignV188(save).step, 'debrief');
  assert.equal(markStoryDebriefSeenV188(save, STORY_RELAY_CAMPAIGN_ID_V188), true);
  assert.equal(markStoryDebriefSeenV188(save, STORY_RELAY_CAMPAIGN_ID_V188), false);
  assert.equal(deriveStoryCampaignV188(save).step, 'next');
  assert.deepEqual(STORY_SLICE_STEPS_V188, ['creation', 'wake', 'ship', 'port', 'briefing', 'qz18', 'debrief', 'next']);
});

test('a player engaged in another operation keeps control: no story objective overrides it', () => {
  const save = afterPort(); save.strategy.currentOperation = { campaignId: 'other' };
  const state = deriveStoryCampaignV188(save);
  assert.equal(state.step, 'briefing'); assert.equal(state.objective, null);
});

test('the real beginOperation on the recommended campaign enters the qz18 step', () => {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false; save.onboardingV84 = null;
  save.openingV88 = normalizePlayerOpeningV88({ ...createPlayerOpeningV88(), phase: 'ready', freight: 'medical' });
  save.portMeridienV90 = normalizePortMeridienV90({ ...createPortMeridienV90(), phase: 'complete', freight: 'medical', receipt: PORT_RECEIPT_V90 });
  assert.equal(save.portMeridienV90?.phase, 'complete'); assert.equal(deriveStoryCampaignV188(save).step, 'briefing');
  const world = WORLDS.find(entry => entry.id === relay.worldId);
  const { operation } = beginOperation(save, relay, world);
  assert.ok(operation); assert.equal(deriveStoryCampaignV188(save).step, 'qz18');
});

test('storyCampaignV188 migrates additively and rejects invalid entries', () => {
  assert.deepEqual(createDefaultSave().storyCampaignV188, { schema: 188, debriefSeen: [], cinematicsSeen: [] });
  assert.deepEqual(migrateSave({ schema: 52 }).storyCampaignV188, { schema: 188, debriefSeen: [], cinematicsSeen: [] });
  const migrated = migrateSave({ schema: 52, storyCampaignV188: { debriefSeen: [STORY_RELAY_CAMPAIGN_ID_V188, 'Bad Id', 7] } });
  assert.deepEqual(migrated.storyCampaignV188.debriefSeen, [STORY_RELAY_CAMPAIGN_ID_V188]);
  assert.deepEqual(normalizeStoryCampaignV188([1]), { schema: 188, debriefSeen: [], cinematicsSeen: [] });
});

test('app routes the briefing to the story recommendation and marks the debrief as read', () => {
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const plan = app.indexOf('strategy.plannedCampaignId)\n'), story = app.indexOf('deriveStoryCampaignV188(saveSystem.data).recommendedCampaignId', plan);
  const fallback = app.indexOf('galaxy.unlockedWorldIds.includes(entry.worldId))', plan);
  assert.ok(plan > 0 && story > plan && fallback > story, 'planned → story → first unlocked');
  assert.match(app, /markStoryDebriefSeenV188\(candidate, campaign\.id\)/);
  assert.match(app, /storyV188\.objective/);
  assert.match(app, /\.sort\(\(a, b\) => \(b\.id === recommendedV188\) - \(a\.id === recommendedV188\)\)/, 'command list puts the recommendation first');
});

test('objective panel lists real tasks, register save rule, in both languages', () => {
  const fr = buildObjectivePanelV188({ campaignObjective: 'Récupérer la boîte noire', register: 'horror', language: 'fr',
    initial: { power: false, route: true, boss: true, archive: false, extract: false },
    objectives: { power: true, route: true, boss: true, archive: false, extract: false } });
  assert.deepEqual(fr.steps.map(step => [step.key, step.done]), [['power', true], ['archive', false], ['extract', false]]);
  assert.match(fr.footer, /Horreur · Sauvegarde au terminal sécurisé/);
  const en = buildObjectivePanelV188({ register: 'action', language: 'en', objectives: { extract: false }, initial: { extract: false } });
  assert.equal(en.title, 'OBJECTIVES'); assert.match(en.footer, /Action · Free save out of combat/);
  assert.equal(OBJECTIVE_PANEL_V188.key, 'KeyM');
});

test('production engine: pause overlay and M key show the objective panel', async () => {
  const { engine, text } = await fixture();
  assert.ok(engine.getSnapshot().objectivePanelV188.steps.some(step => step.key === 'extract'));
  globalThis.dispatchEvent(Object.assign(new Event('keydown'), { code: 'KeyM', repeat: false }));
  assert.ok(engine.objectivePeekV188 > 0, 'M opens the panel');
  text.length = 0; engine.drawHud(engine.canvas.getContext('2d'));
  assert.ok(text.includes('OBJECTIFS'), 'panel drawn in play');
  tick(engine, 4.1); assert.equal(engine.objectivePeekV188, 0);
  engine.togglePause(); text.length = 0; engine.drawStateOverlay(engine.canvas.getContext('2d'));
  assert.ok(text.includes('OPÉRATION EN PAUSE')); assert.ok(text.includes('OBJECTIFS'), 'panel drawn while paused');
  engine.stop();
});

test('the ending music plays at Operations once the four Cocyte chapters are complete', () => {
  const save = createDefaultSave();
  assert.equal(storyEndingReachedV188(save), false);
  save.galaxy.completedCampaignIds.push(...STORY_ENDING_CHAPTERS_V188.slice(0, 3)); assert.equal(storyEndingReachedV188(save), false);
  save.galaxy.completedCampaignIds.push(STORY_ENDING_CHAPTERS_V188[3]); assert.equal(storyEndingReachedV188(save), true);
  for (const id of STORY_ENDING_CHAPTERS_V188) assert.ok(CAMPAIGNS.some(entry => entry.id === id), id);
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /\['operations', 'command'\]\.includes\(name\) && storyEndingReachedV188\(saveSystem\.data\) \? 'ending'/);
});

import { SaveSystem, resolveOperation } from '../src/save.js';
import { advancePlayerOnboardingV84, validatePlayerIdentityV84 } from '../src/player-onboarding-v84.js';
import { advancePlayerOpeningV88, OPENING_POSTS_V88, OPENING_RELAY_SECONDS_V88 } from '../src/player-opening-v88.js';
import { advancePortMeridienV90, PORT_POSTS_V90, portTaskSecondsV90 } from '../src/port-meridien-v90.js';

test('journey: the real state machines walk the whole first hour and storyCampaign follows every step', () => {
  const values = new Map(), system = new SaveSystem({ getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) });
  system.newPlayerTimelineV84(validatePlayerIdentityV84({ name: 'Test Marine', callsign: 'TEST' }).identity, 1);
  const save = system.data, steps = [deriveStoryCampaignV188(save).step];
  // Wake-up and welcome (§4).
  const onboard = event => { const r = advancePlayerOnboardingV84(save.onboardingV84, event); assert.ok(r.ok, `${JSON.stringify(event)} ${r.reason}`); save.onboardingV84 = r.state; };
  onboard('wake-confirmed');
  for (const part of ['medical', 'briefing']) { for (let node = 0; node < 2; node++) onboard({ type: `${part}-next`, dialogueNode: node }); onboard(`${part}-complete`); }
  steps.push(deriveStoryCampaignV188(save).step);
  // Ship duties and qualification (§4.2).
  const open = (event, evidence = {}) => { const r = advancePlayerOpeningV88(save.openingV88, event, { onboardingComplete: true,
    roomId: OPENING_POSTS_V88[save.openingV88.phase]?.roomId, physicalContact: true, ...evidence }); assert.ok(r.ok, `${JSON.stringify(event)} ${r.reason}`); save.openingV88 = r.state; };
  open('berth'); open('armory', { weaponIds: ['weapon-001-m41a-pulse-rifle'] });
  const receipt = 'm41a-qualification-v81:session-1:qualification';
  open('qualified', { qualificationId: receipt, qualificationReceiptIds: [receipt] });
  open('relay', { relaySeconds: OPENING_RELAY_SECONDS_V88 });
  for (let node = 0; node < 3; node++) open({ type: 'signal-next', node });
  open({ type: 'freight', freight: 'medical' });
  assert.equal(save.openingV88.phase, 'ready');
  // Port-Méridien (§6).
  const port = (action, extra = {}) => {
    const post = PORT_POSTS_V90[save.portMeridienV90.phase];
    const actor = post ? { x: post.x - 20, y: post.y - 80, w: 40, h: 80, alive: true, grounded: true, facing: 1 } : { x: 0, y: 0, w: 40, h: 80, alive: true, grounded: true };
    const r = advancePortMeridienV90(save.portMeridienV90, action, { openingPhase: 'ready', onboardingComplete: true, revision: save.portMeridienV90.revision,
      briefingContact: true, freight: 'medical', actor, taskSeconds: portTaskSecondsV90(save.portMeridienV90), ...extra });
    assert.ok(r.ok, `${action} ${r.reason}`); save.portMeridienV90 = r.state;
  };
  port('board'); steps.push(deriveStoryCampaignV188(save).step);
  for (const action of ['unload', 'carry', 'triage', 'power', 'escort']) port(action);
  port('escort', { civiliansX: [2160, 2215, 2270] }); port('report');
  assert.equal(save.portMeridienV90.phase, 'complete');
  // Briefing → QZ-18 → return → debrief (§5.2).
  const briefing = deriveStoryCampaignV188(save); steps.push(briefing.step);
  const campaign = CAMPAIGNS.find(entry => entry.id === briefing.recommendedCampaignId);
  beginOperation(save, campaign, WORLDS.find(entry => entry.id === campaign.worldId)); steps.push(deriveStoryCampaignV188(save).step);
  // A retreat closes the operation and sends the player back to the briefing.
  assert.equal(resolveOperation(save, { success: false, reason: 'retreat' }).ok, true);
  assert.equal(deriveStoryCampaignV188(save).step, 'briefing');
  // A native QZ-18 success (covered end to end by verify-campaign-story-v160) records the chapter.
  save.galaxy.completedCampaignIds.push(STORY_RELAY_CAMPAIGN_ID_V188);
  steps.push(deriveStoryCampaignV188(save).step);
  markStoryDebriefSeenV188(save, STORY_RELAY_CAMPAIGN_ID_V188); steps.push(deriveStoryCampaignV188(save).step);
  assert.deepEqual(steps, ['wake', 'ship', 'port', 'briefing', 'qz18', 'debrief', 'next']);
  assert.ok(system.commit(save));
  assert.deepEqual(system.load(1).storyCampaignV188.debriefSeen, [STORY_RELAY_CAMPAIGN_ID_V188], 'the debrief marker survives save and reload');
});
