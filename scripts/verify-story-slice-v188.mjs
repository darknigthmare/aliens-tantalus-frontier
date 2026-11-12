import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CAMPAIGNS, WORLDS } from '../src/content.js';
import { createDefaultSave, migrateSave, beginOperation } from '../src/save.js';
import { deriveStoryCampaignV188, markStoryDebriefSeenV188, normalizeStoryCampaignV188,
  STORY_RELAY_CAMPAIGN_ID_V188, STORY_SLICE_STEPS_V188 } from '../src/story-campaign-v188.js';
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
  assert.deepEqual(createDefaultSave().storyCampaignV188, { schema: 188, debriefSeen: [] });
  assert.deepEqual(migrateSave({ schema: 52 }).storyCampaignV188, { schema: 188, debriefSeen: [] });
  const migrated = migrateSave({ schema: 52, storyCampaignV188: { debriefSeen: [STORY_RELAY_CAMPAIGN_ID_V188, 'Bad Id', 7] } });
  assert.deepEqual(migrated.storyCampaignV188.debriefSeen, [STORY_RELAY_CAMPAIGN_ID_V188]);
  assert.deepEqual(normalizeStoryCampaignV188([1]), { schema: 188, debriefSeen: [] });
});

test('app routes the briefing to the story recommendation and marks the debrief as read', () => {
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const plan = app.indexOf('strategy.plannedCampaignId)\n'), story = app.indexOf('deriveStoryCampaignV188(saveSystem.data).recommendedCampaignId');
  const fallback = app.indexOf('galaxy.unlockedWorldIds.includes(entry.worldId))', plan);
  assert.ok(plan > 0 && story > plan && fallback > story, 'planned → story → first unlocked');
  assert.match(app, /markStoryDebriefSeenV188\(candidate, campaign\.id\)/);
  assert.match(app, /storyV188\.objective/);
});

test('objective panel lists real tasks, register save rule, in both languages', () => {
  const fr = buildObjectivePanelV188({ campaignObjective: 'Récupérer la boîte noire', register: 'horror', language: 'fr',
    initial: { power: false, route: true, boss: true, archive: false, extract: false },
    objectives: { power: true, route: true, boss: true, archive: false, extract: false } });
  assert.deepEqual(fr.steps.map(step => [step.key, step.done]), [['power', true], ['archive', false], ['extract', false]]);
  assert.match(fr.footer, /Horreur · Sauvegarde au terminal sécurisé/);
  const en = buildObjectivePanelV188({ register: 'action', language: 'en', objectives: { extract: false }, initial: { extract: false } });
  assert.equal(en.title, 'OBJECTIVES'); assert.match(en.footer, /Action · Free save out of combat/);
  assert.equal(OBJECTIVE_PANEL_V188.key, 'KeyO');
});

test('production engine: pause overlay and O key show the objective panel', async () => {
  const { engine, text } = await fixture();
  assert.ok(engine.getSnapshot().objectivePanelV188.steps.some(step => step.key === 'extract'));
  globalThis.dispatchEvent(Object.assign(new Event('keydown'), { code: 'KeyO', repeat: false }));
  assert.ok(engine.objectivePeekV188 > 0, 'O opens the panel');
  text.length = 0; engine.drawHud(engine.canvas.getContext('2d'));
  assert.ok(text.includes('OBJECTIFS'), 'panel drawn in play');
  tick(engine, 4.1); assert.equal(engine.objectivePeekV188, 0);
  engine.togglePause(); text.length = 0; engine.drawStateOverlay(engine.canvas.getContext('2d'));
  assert.ok(text.includes('OPÉRATION EN PAUSE')); assert.ok(text.includes('OBJECTIFS'), 'panel drawn while paused');
  engine.stop();
});
