import test from 'node:test';
import assert from 'node:assert/strict';
import { GameEngine } from '../src/game-production-runtime.js';
import { WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';
import { createDefaultSave, beginOperation, resolveOperation, recordOperationResumeState, migrateSave } from '../src/save.js';
import { ARCHIVE_RELAY_CAMPAIGN_V122 as campaign, ARCHIVE_RELAY_DOCUMENT_IDS_V122 } from '../src/archive-relay-state-v122.js';
import { buildArchiveRelayLevelV122, ARCHIVE_RELAY_PROPS_V122 } from '../src/archive-relay-runtime-v122.js';
import { createMissionInsertionV62, applyMissionInsertionActionV62, getMissionInsertionReadReceiptV62,
  pauseMissionInsertionV62, resumeMissionInsertionV62 } from '../src/mission-insertion-v62.js';
import { getMissionInsertionUiModelV62, MissionInsertionUiV62 } from '../src/mission-insertion-ui-v62.js';
import { campaignInsertionStoryV160, chooseCampaignStoryProtocolV160, campaignStoryProtocolV160,
  applyCampaignStoryReturnV160, campaignStoryReturnV160, recordCampaignStoryReviewV160 } from '../src/campaign-story-v160.js';
import { applyCampaignConsequence } from '../src/campaign-consequences.js';
import { hostV136 } from './forge-native-host-v136.mjs';

const world = WORLDS.find(entry => entry.id === campaign.worldId);
const clone = value => structuredClone(value);
const insertion = (id = 'operation-1-special-archive-relay', extras = {}) => createMissionInsertionV62({
  operation: { id, campaignId: campaign.id, worldId: world.id }, campaign, world, ...extras });
const advance = state => {
  const result = applyMissionInsertionActionV62(state, state.phases[state.currentIndex].requiredAction, { now: state.updatedAt + 100 });
  assert.equal(result.ok, true); return result.state;
};
function completedInsertion(id, protocolId = 'technical-audit') {
  let state = insertion(id); state = advance(state);
  if (protocolId) state = chooseCampaignStoryProtocolV160(state, protocolId).state;
  while (state.status !== 'completed') state = advance(state);
  return state;
}
function returnedFixture({ id = 'operation-1-special-archive-relay', protocolId = 'technical-audit', success = true } = {}) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  save.strategy.lastOperation = { id, campaignId: campaign.id, worldId: world.id, success,
    reason: success ? 'objective' : 'retreat', completedDay: 1, completedHour: 9,
    insertionState: completedInsertion(id, protocolId), flags: {} };
  if (success) save.archiveRelayArchivesV122 = { schema: 122, case: { id: 'qz18-last-relay', operationId: id,
    verdict: 'delayed-distress', documentIds: [...ARCHIVE_RELAY_DOCUMENT_IDS_V122], completedDay: 1, completedHour: 9 } };
  return save;
}
function position(engine, id) {
  const prop = ARCHIVE_RELAY_PROPS_V122[id];
  // An explicit semantic unit fixture, not a claim of a keyboard journey.
  Object.assign(engine.player, { x: prop.x - engine.player.w / 2, y: prop.groundY - engine.player.h,
    vx: 0, vy: 0, grounded: true, climbing: false });
}
function simulate(engine, seconds) { for (let time = 0; time < seconds; time += 1 / 60) engine.update(1 / 60); }
function readStation(engine, id) {
  position(engine, id); assert.equal(engine.interact(), true);
  for (const document of engine.getArchiveRelayReaderV122().documents) engine.markArchiveRelayReadV122(document.id);
  engine.closeArchiveRelayReaderV122();
}
async function nativeCompletedRun(protocolId) {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  const { operation } = beginOperation(save, campaign, world);
  const level = buildArchiveRelayLevelV122({ campaign, world, levelSeeds: LEVEL_SEEDS, seed: 160 });
  Object.assign(operation, { levelSeedId: level.levelSeed.id, missionLevelSignature: level.signature,
    insertionState: completedInsertion(operation.id, protocolId) });
  const host = hostV136(), events = [], engine = new GameEngine(host.canvas, { onEvent: event => events.push(event) });
  engine.start({ operationId: operation.id, campaign, world, missionLevel: level,
    levelSeed: level.levelSeed, weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [], seed: 160 });
  for (let turn = 0; turn < 60; turn++) await Promise.resolve();
  readStation(engine, 'pda');
  position(engine, 'relay'); engine.keys.add('KeyE'); simulate(engine, 3.1); engine.keys.delete('KeyE');
  assert.equal(engine.archiveRelayV122.power, true);
  readStation(engine, 'engineering'); readStation(engine, 'security'); readStation(engine, 'freight');
  position(engine, 'freight'); engine.keys.add('KeyF'); simulate(engine, 4.1); engine.keys.delete('KeyF');
  assert.equal(engine.archiveRelayV122.restoredDraft, true); readStation(engine, 'freight');
  position(engine, 'analysis'); assert.equal(engine.interact(), true);
  assert.equal(engine.decideArchiveRelayV122('delayed-distress').applied, true); engine.closeArchiveRelayReaderV122();
  position(engine, 'extraction'); engine.keys.add('KeyE'); simulate(engine, 2.1); engine.keys.delete('KeyE');
  assert.equal(engine.archiveRelayV122.complete, true);
  const terminal = engine.captureResumeState(); assert.equal(recordOperationResumeState(save, terminal), true);
  const completion = events.find(event => event.type === 'mission-complete'); assert.ok(completion);
  const outcome = resolveOperation(save, { success: true, rewards: completion.rewards });
  assert.equal(outcome.ok, true, outcome.reason); assert.equal(outcome.success, true);
  engine.stop();
  return { save, outcome, terminal };
}

test('only the authored QZ-18 setting receives original transmissions, not historical MIRE or foreign worlds', () => {
  let state = insertion(); const scene = campaignInsertionStoryV160(state);
  assert.equal(scene.provenance, 'tantalus-project-original'); assert.equal(scene.canonExact, false);
  assert.match(scene.lines.map(line => line.text).join(' '), /pas une accusation/);
  state.campaignId = 'pair-001-mire'; assert.equal(campaignInsertionStoryV160(state), null);
  state = insertion(); state.worldId = 'world-01-acheron-lv-426'; assert.equal(campaignInsertionStoryV160(state), null);
});

test('preparation choice is explicit, detached, idempotent and rejected outside its active phase', () => {
  const first = insertion(), before = clone(first);
  assert.equal(chooseCampaignStoryProtocolV160(first, 'technical-audit').ok, false); assert.deepEqual(first, before);
  const prep = advance(first), chosen = chooseCampaignStoryProtocolV160(prep, 'technical-audit', { now: 500 });
  assert.equal(chosen.ok, true); assert.equal(chosen.changed, true); assert.equal(campaignStoryProtocolV160(prep), null);
  assert.equal(campaignStoryProtocolV160(chosen.state).id, 'technical-audit');
  assert.equal(chooseCampaignStoryProtocolV160(chosen.state, 'technical-audit').changed, false);
  assert.equal(chooseCampaignStoryProtocolV160(prep, 'forged').ok, false);
  const paused = pauseMissionInsertionV62(prep, { now: 600 }).state;
  assert.equal(chooseCampaignStoryProtocolV160(paused, 'crew-prevention').ok, false);
  const resumed = resumeMissionInsertionV62(paused, { now: 700 }).state;
  assert.equal(chooseCampaignStoryProtocolV160(resumed, 'crew-prevention').ok, true);
});

test('a foreign operation cannot lend its selected protocol to a new insertion', () => {
  const state = completedInsertion('operation-1-special-archive-relay');
  state.phases[1].payload.campaignStoryV160.operationId = 'operation-2-special-archive-relay';
  assert.equal(campaignStoryProtocolV160(state), null);
});

test('read receipts permit replay skip without inventing a protocol, an incident or a campaign victory', () => {
  const first = completedInsertion('operation-1-special-archive-relay'), receipt = getMissionInsertionReadReceiptV62(first);
  const replay = insertion('operation-2-special-archive-relay', { readReceipts: [receipt] });
  const skipped = applyMissionInsertionActionV62(replay, 'skip', { now: 100 }); assert.equal(skipped.ok, true);
  assert.equal(skipped.state.status, 'completed'); assert.equal(campaignStoryProtocolV160(skipped.state), null);
  const save = returnedFixture(); save.strategy.currentOperation = { id: replay.operationId };
  assert.equal(applyCampaignStoryReturnV160(save, campaign, { success: true }).applied, false);
});

test('QZ-18 approach and deployment wait for their complete reading duration before automatic continuation', () => {
  let state = advance(advance(insertion()));
  const instance = { state, destroyed: false,
    setPhaseProgress(value) { this.state = { ...this.state, phases: this.state.phases.map((phase, index) => index === this.state.currentIndex ? { ...phase, progress: value } : phase) }; return { ok: true }; },
    advance() { this.state = advance(this.state); return { ok: true }; } };
  MissionInsertionUiV62.prototype.tick.call(instance, 6500);
  assert.equal(instance.state.phases[instance.state.currentIndex].kind, 'approach');
  MissionInsertionUiV62.prototype.tick.call(instance, 30000);
  assert.equal(instance.state.phases[instance.state.currentIndex].kind, 'deployment');
});

test('deployment shots use the native QZ-18 scene contract, while briefing keeps the registered ship illustration', () => {
  let state = insertion();
  assert.equal(getMissionInsertionUiModelV62(state).storyScene, null);
  for (let step = 0; step < 3; step++) state = advance(state);
  const model = getMissionInsertionUiModelV62(state);
  assert.equal(model.storyScene.kind, 'native-qz18-scene'); assert.equal(model.storyScene.cameraX, 0);
  assert.equal(model.storyScene.width, 1280); assert.equal(model.storyScene.height, 720); assert.equal(model.media, null);
});

test('the real causal incident notice appears only while unresolved, never before it or in deployment after reload', () => {
  const mission = buildArchiveRelayLevelV122({ campaign, world, levelSeeds: LEVEL_SEEDS, seed: 160 });
  let state = insertion('operation-1-special-archive-relay', { mission });
  assert.deepEqual(state.phases.map(phase => phase.kind), ['briefing', 'preparation', 'approach', 'incident', 'deployment', 'player-control']);
  // Minimal document adapter exercises the real renderer, not a mirrored view
  // predicate. Mission phases and resolution come from the native state machine.
  const node = tagName => ({ tagName, dataset: {}, children: [], textContent: '',
    append(...children) { this.children.push(...children); } });
  const document = { createElement: node };
  const rendered = value => {
    const container = node('div');
    MissionInsertionUiV62.prototype.renderIncident.call({ document }, container, value);
    return container;
  };
  for (const kind of ['briefing', 'preparation', 'approach']) {
    assert.equal(state.phases[state.currentIndex].kind, kind);
    assert.equal(rendered(state).children.length, 0, kind + ' does not claim a suspended route');
    state = advance(state);
  }
  const notice = rendered(state);
  assert.equal(notice.children.length, 1);
  assert.equal(notice.children[0].dataset.incidentId, state.incident.id);
  assert.equal(notice.children[0].children[0].textContent, 'INCIDENT SUR LA ROUTE');
  assert.equal(rendered(pauseMissionInsertionV62(state).state).children.length, 1, 'pause does not pretend that the incident is resolved');
  state = advance(state);
  assert.equal(state.phases.find(phase => phase.kind === 'incident').status, 'complete');
  assert.equal(state.phases[state.currentIndex].kind, 'deployment');
  assert.equal(rendered(JSON.parse(JSON.stringify(state))).children.length, 0, 'saved deployment does not repeat the completed incident');
  state = advance(state);
  assert.equal(rendered(state).children.length, 0, 'player control does not repeat the incident');
});

test('both real native QZ-18 terminal results fund only their selected return protocol, once', async () => {
  for (const protocolId of ['technical-audit', 'crew-prevention']) {
    const { save } = await nativeCompletedRun(protocolId);
    const before = clone({ research: save.galaxy.resources.research, morale: save.hub.systems.morale });
    const applied = applyCampaignConsequence(save, campaign, world, { success: true }).storyReturn;
    assert.equal(applied.applied, true); assert.equal(applied.protocolId, protocolId);
    assert.equal(save.galaxy.resources.research - before.research, protocolId === 'technical-audit' ? 2 : 0);
    assert.equal(save.hub.systems.morale - before.morale, protocolId === 'crew-prevention' ? 2 : 0);
    const paid = clone(save); assert.equal(applyCampaignStoryReturnV160(save, campaign, { success: true }).applied, false);
    assert.deepEqual(save, paid);
    assert.equal(resolveOperation(save, { success: true }).ok, false); assert.deepEqual(save, paid);
    assert.equal(campaignStoryReturnV160(save).evidenceComplete, true);
  }
});

test('success text, previous dossiers, incomplete records, wrong worlds and skipped control cannot fund a return', () => {
  for (const mutate of [
    s => { s.archiveRelayArchivesV122.case.operationId = 'operation-2-special-archive-relay'; },
    s => { s.archiveRelayArchivesV122.case.documentIds.pop(); },
    s => { s.archiveRelayArchivesV122.case.verdict = 'clock-failure'; },
    s => { s.strategy.lastOperation.worldId = 'world-01-acheron-lv-426'; },
    s => { s.strategy.lastOperation.insertionState.controlGranted = false; },
    s => { s.strategy.lastOperation.insertionState = insertion(); },
    s => { s.strategy.lastOperation.success = false; },
    s => { s.strategy.currentOperation = { id: 'operation-2-special-archive-relay' }; }
  ]) {
    const save = returnedFixture(); mutate(save); const before = clone(save);
    assert.equal(applyCampaignStoryReturnV160(save, campaign, { success: true }).applied, false); assert.deepEqual(save, before);
  }
});

test('clamped return payments are recorded as their actual amount and survive reload without a second payment', () => {
  for (const protocolId of ['technical-audit', 'crew-prevention']) {
    const save = returnedFixture({ protocolId });
    if (protocolId === 'technical-audit') save.galaxy.resources.research = 999999998;
    else save.hub.systems.morale = 99;
    const result = applyCampaignStoryReturnV160(save, campaign, { success: true }); assert.equal(result.amount, 1);
    const reloaded = migrateSave(JSON.parse(JSON.stringify(save))), before = clone(reloaded);
    assert.match(campaignStoryReturnV160(reloaded).questions.find(topic => topic.id === 'return').answer, /plafond/);
    assert.equal(applyCampaignStoryReturnV160(reloaded, campaign, { success: true }).applied, false); assert.deepEqual(reloaded, before);
  }
});

test('reading records no payment, time, wound or inferred identity, remains idempotent and survives a full flag budget', () => {
  const save = returnedFixture(); applyCampaignStoryReturnV160(save, campaign, { success: true });
  save.strategy.lastOperation.flags = Object.fromEntries(Array.from({ length: 40 }, (_, i) => ['old-flag-' + i, true]));
  save.crew[0].injuries.push({ type: 'mission-trauma', day: 1, severity: 38 }); save.crew[0].health = 62;
  const protectedState = clone({ clock: save.clock, resources: save.galaxy.resources, systems: save.hub.systems, crew: save.crew });
  for (const topic of ['chronology', 'identity', 'return']) assert.equal(recordCampaignStoryReviewV160(save, save.strategy.lastOperation.id, topic).ok, true);
  const reloaded = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.equal(campaignStoryReturnV160(reloaded).readingComplete, true);
  const before = clone(reloaded); assert.equal(recordCampaignStoryReviewV160(reloaded, reloaded.strategy.lastOperation.id, 'return').changed, false);
  assert.deepEqual(reloaded, before); assert.deepEqual({ clock: save.clock, resources: save.galaxy.resources, systems: save.hub.systems, crew: save.crew }, protectedState);
  assert.equal(applyCampaignStoryReturnV160(reloaded, campaign, { success: true }).applied, false);
  assert.match(campaignStoryReturnV160(reloaded).questions.find(topic => topic.id === 'identity').answer, /^Non\./);
});

test('native retreat preserves its wounded crew and old dossier without a protocol payment or a false success epilogue', () => {
  const save = createDefaultSave(); save.needsPlayerCreationV84 = false;
  const { operation } = beginOperation(save, campaign, world); operation.insertionState = completedInsertion(operation.id, 'crew-prevention');
  const outcome = resolveOperation(save, { success: false, reason: 'retreat' }); assert.equal(outcome.success, false);
  assert.ok(save.crew.some(member => member.injuries.length)); const before = clone(save);
  assert.equal(applyCampaignStoryReturnV160(save, campaign, { success: false }).applied, false); assert.deepEqual(save, before);
  const scene = campaignStoryReturnV160(save); assert.equal(scene.evidenceComplete, false); assert.equal(scene.status, 'RETRAITE ENREGISTRÉE');
  assert.match(scene.questions.find(topic => topic.id === 'return').answer, /blessures/);
  assert.equal(recordCampaignStoryReviewV160(save, 'operation-999-special-archive-relay', 'identity').ok, false);
});

test('malformed or legacy return metadata stays readable without granting a receipt or throwing', () => {
  const save = returnedFixture({ protocolId: null });
  save.strategy.lastOperation.insertionState.phases[1].payload.campaignStoryReturnV160 = {
    schema: 160, operationId: save.strategy.lastOperation.id, receipt: { operationId: save.strategy.lastOperation.id, amount: 2 },
    readTopics: ['identity', 'forged'], activeTopic: 'forged' };
  assert.equal(campaignStoryReturnV160(save).selectedTopic, 'return');
  assert.equal(applyCampaignStoryReturnV160(save, campaign, { success: true }).applied, false);
  save.strategy.lastOperation.insertionState = null;
  assert.equal(campaignStoryReturnV160(save).canPersistReview, false);
  assert.equal(recordCampaignStoryReviewV160(save, save.strategy.lastOperation.id, 'identity').reason, 'legacy-return-read-only');
});
