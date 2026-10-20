import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';
import { SaveSystem, createDefaultSave, beginOperation, resolveOperation, recordOperationResumeState, migrateSave } from '../src/save.js';
import { ARCHIVE_RELAY_CAMPAIGN_V122 as campaign, ARCHIVE_RELAY_DOCUMENT_IDS_V122, normalizeArchiveRelayArchiveV122 } from '../src/archive-relay-state-v122.js';
import { buildArchiveRelayLevelV122, ARCHIVE_RELAY_PROPS_V122 } from '../src/archive-relay-runtime-v122.js';
import { createMissionInsertionV62, applyMissionInsertionActionV62, getMissionInsertionReadReceiptV62,
  pauseMissionInsertionV62, resumeMissionInsertionV62 } from '../src/mission-insertion-v62.js';
import { getMissionInsertionUiModelV62, MissionInsertionUiV62 } from '../src/mission-insertion-ui-v62.js';
import { campaignInsertionStoryV160, chooseCampaignStoryProtocolV160, campaignStoryProtocolV160,
  applyCampaignStoryReturnV160, campaignStoryReturnV160, preserveCampaignStoryReturnV160, recordCampaignStoryReviewV160 } from '../src/campaign-story-v160.js';
import { applyCampaignConsequence } from '../src/campaign-consequences.js';
import { mountCampaignDebriefV160 } from '../src/campaign-story-ui-v160.js';
import { hostV136 } from './forge-native-host-v136.mjs';

const world = WORLDS.find(entry => entry.id === campaign.worldId);
const clone = value => structuredClone(value);
function storyDocument() {
  const document = { activeElement: null, focusCalls: [], addEventListener() {}, removeEventListener() {} };
  const dataKey = name => name.replace(/^data-/, '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const matches = (node, selector) => {
    if (selector.startsWith('.')) return node.className.split(/\s+/u).includes(selector.slice(1));
    const attribute = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/u);
    if (attribute) {
      const value = attribute[1].startsWith('data-') ? node.dataset[dataKey(attribute[1])] : node.attributes[attribute[1]];
      return value !== undefined && (attribute[2] === undefined || value === attribute[2]);
    }
    return node.tagName.toLowerCase() === selector;
  };
  document.createElement = tag => {
    const node = { tagName: tag.toUpperCase(), ownerDocument: document, parentNode: null,
      children: [], dataset: {}, attributes: {}, className: '', ownText: '',
      style: { values: {}, setProperty(key, value) { this.values[key] = String(value); }, getPropertyValue(key) { return this.values[key] || ''; } },
      append(...children) { for (const child of children) { child.parentNode = this; this.children.push(child); } },
      replaceChildren(...children) {
        if (this.children.some(child => child.contains(document.activeElement))) document.activeElement = document.body;
        this.children.forEach(child => { child.parentNode = null; }); this.children = []; this.ownText = ''; this.append(...children);
      },
      setAttribute(key, value) { this.attributes[key] = String(value); },
      getAttribute(key) { return this.attributes[key] ?? null; }, removeAttribute(key) { delete this.attributes[key]; },
      listeners: {},
      addEventListener(type, handler) { this.listeners[type] ??= []; this.listeners[type].push(handler); },
      removeEventListener(type, handler) { this.listeners[type] = (this.listeners[type] || []).filter(entry => entry !== handler); },
      click() { if (!this.disabled) for (const handler of this.listeners.click || []) handler({ target: this }); },
      focus(options) {
        if (this.disabled || !document.body?.contains(this)) return;
        document.activeElement = this; document.focusCalls.push({ node: this, options });
      },
      contains(target) { return target === this || this.children.some(child => child.contains(target)); },
      querySelectorAll(selector) { return this.children.flatMap(child => [...(matches(child, selector) ? [child] : []), ...child.querySelectorAll(selector)]); },
      querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
      remove() {
        if (this.contains(document.activeElement)) document.activeElement = document.body;
        if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); this.parentNode = null;
      }
    };
    node.classList = { add(name) { node.className += ' ' + name; }, contains(name) { return node.className.split(/\s+/u).includes(name); } };
    Object.defineProperty(node, 'textContent', { get() { return this.ownText + this.children.map(child => child.textContent).join(''); },
      set(value) { this.ownText = String(value); this.children = []; } });
    return node;
  };
  document.body = document.createElement('body'); document.activeElement = document.body;
  const root = document.createElement('div'); document.body.append(root);
  return { document, root };
}
const insertion = (id = 'operation-1-special-archive-relay', extras = {}) => createMissionInsertionV62({
  operation: { id, campaignId: campaign.id, worldId: world.id }, campaign, world, ...extras });
const advance = state => {
  const result = applyMissionInsertionActionV62(state, state.phases[state.currentIndex].requiredAction, { now: state.updatedAt + 100 });
  assert.equal(result.ok, true); return result.state;
};
function completedInsertion(id, protocolId = 'technical-audit', extras = {}) {
  let state = insertion(id, extras); state = advance(state);
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
    insertionState: completedInsertion(operation.id, protocolId, { mission: level }) });
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
  assert.equal(applyCampaignStoryReturnV160(save, campaign, { success: false }).applied, false);
  assert.equal(save.archiveRelayArchivesV122.lastReturnV160.success, false);
  const withoutHistoricalReturn = clone(save); delete withoutHistoricalReturn.archiveRelayArchivesV122.lastReturnV160;
  assert.deepEqual(withoutHistoricalReturn, before, 'only the compact failed return is archived; no wound, resource, clock or other field changes');
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

test('PR15: the real QZ-18 return survives another resolved mission and JSON/save reload without another payment', async () => {
  const { save } = await nativeCompletedRun('technical-audit');
  applyCampaignConsequence(save, campaign, world, { success: true });
  const qz18Id = save.strategy.lastOperation.id;
  for (const topic of ['chronology', 'identity', 'return']) recordCampaignStoryReviewV160(save, qz18Id, topic);
  const other = CAMPAIGNS.find(entry => entry.id !== campaign.id && !entry.specialOperationId && save.galaxy.unlockedWorldIds.includes(entry.worldId));
  assert.ok(other); const otherWorld = WORLDS.find(entry => entry.id === other.worldId);
  assert.ok(beginOperation(save, other, otherWorld).operation);
  assert.equal(resolveOperation(save, { success: false, reason: 'retreat' }).ok, true);
  assert.equal(save.strategy.lastOperation.campaignId, other.id);
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const writer = new SaveSystem(storage); writer.newGame(1); writer.commit(JSON.parse(JSON.stringify(save)));
  const reader = new SaveSystem(storage), reloaded = reader.load(1);
  const story = campaignStoryReturnV160(reloaded);
  assert.ok(story, 'a later mission must not erase the conserved QZ-18 return');
  assert.equal(story.operationId, qz18Id); assert.equal(story.protocolLabel, 'Audit technique');
  assert.equal(story.evidenceComplete, true); assert.equal(story.readingComplete, true);
  const before = clone({ clock: reloaded.clock, galaxy: reloaded.galaxy, hub: reloaded.hub, crew: reloaded.crew, statistics: reloaded.statistics });
  assert.equal(recordCampaignStoryReviewV160(reloaded, qz18Id, 'identity').ok, true);
  reader.commit(reloaded);
  assert.equal(campaignStoryReturnV160(new SaveSystem(storage).load(1)).selectedTopic, 'identity');
  assert.deepEqual({ clock: reloaded.clock, galaxy: reloaded.galaxy, hub: reloaded.hub, crew: reloaded.crew, statistics: reloaded.statistics }, before);
  const paid = clone(reloaded); assert.equal(applyCampaignStoryReturnV160(reloaded, campaign, { success: true }).applied, false);
  assert.deepEqual(reloaded, paid);
});

test('PR15: each app-style reading transaction after SaveSystem normalization keeps the latest and durable ledgers equal', async () => {
  const { save } = await nativeCompletedRun('technical-audit');
  applyCampaignConsequence(save, campaign, world, { success: true });
  const values = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const system = new SaveSystem(storage); system.newGame(1); system.commit(save);
  const initial = clone(system.data), id = initial.strategy.lastOperation.id;
  assert.equal(initial.strategy.lastOperation.insertionState.phases.length, 6, 'the real QZ-18 insertion includes its native incident');
  const originalReturn = clone(initial.archiveRelayArchivesV122.lastReturnV160);
  const protectedFields = value => clone({ clock: value.clock, galaxy: value.galaxy, hub: value.hub, crew: value.crew,
    statistics: value.statistics, case: value.archiveRelayArchivesV122.case });
  const protectedBefore = protectedFields(initial), reads = [];
  for (const topic of ['chronology', 'identity', 'return', 'chronology', 'identity', 'return']) {
    const candidate = clone(system.data);
    const result = recordCampaignStoryReviewV160(candidate, id, topic);
    assert.equal(result.ok, true);
    if (result.changed) system.commit(candidate);
    // Same migration/commit performed by renderOperationPlan after onReview.
    const planCandidate = clone(system.data);
    if (preserveCampaignStoryReturnV160(planCandidate).changed) system.commit(planCandidate);
    if (!reads.includes(topic)) reads.push(topic);
    const expected = { ...originalReturn.ledger, readTopics: [...reads], activeTopic: topic };
    const latestLedger = system.data.strategy.lastOperation.insertionState.phases
      .find(phase => phase.kind === 'preparation').payload.campaignStoryReturnV160;
    assert.deepEqual(latestLedger, expected);
    assert.deepEqual(system.data.archiveRelayArchivesV122.lastReturnV160.ledger, expected,
      'the durable ledger must follow the actual committed reading, not retain its initial value');
    assert.deepEqual({ ...system.data.archiveRelayArchivesV122.lastReturnV160, ledger: originalReturn.ledger }, originalReturn);
    assert.deepEqual(protectedFields(system.data), protectedBefore);
  }
  const loaded = new SaveSystem(storage).load(1);
  assert.equal(campaignStoryReturnV160(loaded).readingComplete, true);
  assert.deepEqual(loaded.archiveRelayArchivesV122.lastReturnV160.ledger.readTopics, reads);
  assert.equal(applyCampaignStoryReturnV160(loaded, campaign, { success: true }).applied, false);
  assert.deepEqual(protectedFields(loaded), protectedBefore);
  const other = CAMPAIGNS.find(entry => entry.id !== campaign.id && !entry.specialOperationId && loaded.galaxy.unlockedWorldIds.includes(entry.worldId));
  assert.ok(beginOperation(loaded, other, WORLDS.find(entry => entry.id === other.worldId)).operation);
  assert.equal(resolveOperation(loaded, { success: false, reason: 'retreat' }).ok, true);
  const nextWriter = new SaveSystem(storage); nextWriter.load(1); nextWriter.commit(loaded);
  const afterOther = new SaveSystem(storage).load(1), otherProtected = protectedFields(afterOther);
  assert.equal(campaignStoryReturnV160(afterOther).operationId, id);
  assert.equal(campaignStoryReturnV160(afterOther).readingComplete, true);
  assert.equal(recordCampaignStoryReviewV160(afterOther, id, 'identity').ok, true);
  const finalWriter = new SaveSystem(storage); finalWriter.load(1); finalWriter.commit(afterOther);
  const finalLoad = new SaveSystem(storage).load(1);
  assert.equal(campaignStoryReturnV160(finalLoad).selectedTopic, 'identity');
  assert.deepEqual(finalLoad.archiveRelayArchivesV122.lastReturnV160.ledger.receipt, originalReturn.ledger.receipt);
  assert.deepEqual(protectedFields(finalLoad), otherProtected);
});

test('PR15: older QZ-18 saves acquire only a bounded durable return without another reward or an invented reading', () => {
  const save = returnedFixture(); applyCampaignStoryReturnV160(save, campaign, { success: true });
  delete save.archiveRelayArchivesV122.lastReturnV160;
  const before = clone(save);
  assert.equal(preserveCampaignStoryReturnV160(save).changed, true);
  const stored = save.archiveRelayArchivesV122.lastReturnV160;
  assert.deepEqual(Object.keys(stored), ['schema', 'operationId', 'campaignId', 'worldId', 'success', 'reason', 'completedDay', 'completedHour', 'protocolId', 'ledger']);
  assert.deepEqual(stored.ledger.readTopics, []); assert.equal(stored.ledger.receipt.amount, 2);
  const after = clone(save); delete after.archiveRelayArchivesV122.lastReturnV160; assert.deepEqual(after, before);
  assert.equal(preserveCampaignStoryReturnV160(save).changed, false);
  const legacy = returnedFixture({ protocolId: null }); legacy.strategy.lastOperation.insertionState = null;
  assert.equal(preserveCampaignStoryReturnV160(legacy).changed, true);
  legacy.strategy.lastOperation = null;
  const restored = migrateSave(JSON.parse(JSON.stringify(legacy)));
  assert.equal(campaignStoryReturnV160(restored).canPersistReview, false);
  assert.equal(campaignStoryReturnV160(restored).protocolLabel, 'Bilan standard');
  assert.deepEqual(normalizeArchiveRelayArchiveV122({ schema: 122, case: null }), { schema: 122, case: null });
});

test('PR15: missing normalized completion dates use only the validated same return or native legacy victory case', () => {
  const save = returnedFixture(); applyCampaignStoryReturnV160(save, campaign, { success: true });
  const normalized = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.equal(normalized.strategy.lastOperation.insertionState.status, 'completed');
  assert.equal(normalized.strategy.lastOperation.insertionState.controlGranted, true);
  const legacy = clone(normalized); delete legacy.archiveRelayArchivesV122.lastReturnV160;
  const nativeDate = { completedDay: legacy.archiveRelayArchivesV122.case.completedDay, completedHour: legacy.archiveRelayArchivesV122.case.completedHour };
  const before = clone(legacy);
  assert.equal(preserveCampaignStoryReturnV160(legacy).changed, true);
  assert.equal(legacy.archiveRelayArchivesV122.lastReturnV160.completedDay, nativeDate.completedDay);
  assert.equal(legacy.archiveRelayArchivesV122.lastReturnV160.completedHour, nativeDate.completedHour);
  assert.deepEqual(legacy.archiveRelayArchivesV122.lastReturnV160.ledger.readTopics, []);
  const stripped = clone(legacy); delete stripped.archiveRelayArchivesV122.lastReturnV160;
  assert.deepEqual(stripped, before, 'the old native date does not pay, read, heal or advance anything');
  for (const mutate of [
    value => { value.archiveRelayArchivesV122.lastReturnV160.operationId = 'operation-2-special-archive-relay'; },
    value => { value.archiveRelayArchivesV122.lastReturnV160.success = false; },
    value => { delete value.archiveRelayArchivesV122.lastReturnV160; value.archiveRelayArchivesV122.case.operationId = 'operation-2-special-archive-relay'; },
    value => { delete value.archiveRelayArchivesV122.lastReturnV160; value.archiveRelayArchivesV122.case.documentIds.pop(); },
    value => { delete value.archiveRelayArchivesV122.lastReturnV160; value.strategy.lastOperation.success = false; }
  ]) {
    const bad = clone(normalized); mutate(bad); const unchanged = clone(bad);
    assert.equal(preserveCampaignStoryReturnV160(bad).changed, false);
    assert.deepEqual(bad, unchanged);
    assert.equal(recordCampaignStoryReviewV160(bad, bad.strategy.lastOperation.id, 'identity').ok, false);
    assert.deepEqual(bad, unchanged, 'a missing or foreign date cannot be invented by reading');
  }
});

test('PR15: a normalized legacy failure without a trustworthy completion date stays locally readable without a false saved reading', () => {
  const legacy = migrateSave(JSON.parse(JSON.stringify(returnedFixture({ success: false }))));
  const before = clone(legacy), { root } = storyDocument(); let writes = 0;
  const model = mountCampaignDebriefV160(root, { save: legacy, campaignId: campaign.id, onReview() { writes++; } });
  assert.equal(model.canPersistReview, false); assert.equal(model.canReview, true);
  const question = root.querySelector('[data-campaign-story-topic="identity"]');
  assert.equal(question.disabled, false); question.click();
  assert.equal(writes, 0, 'legacy consultation must not call the durable writer that would refuse its missing date');
  assert.equal(root.querySelector('[data-campaign-story-answer]').dataset.campaignStoryAnswer, 'identity');
  assert.match(root.querySelector('[data-campaign-story-answer]').textContent, /Aucune identification personnelle/u);
  assert.equal(recordCampaignStoryReviewV160(legacy, legacy.strategy.lastOperation.id, 'identity').reason, 'return-date-unavailable');
  assert.deepEqual(legacy, before);
});

test('PR15: durable return normalization rejects mismatched evidence, identities and protocol ownership and strips unrelated objects', () => {
  const save = returnedFixture(); applyCampaignStoryReturnV160(save, campaign, { success: true });
  const archive = save.archiveRelayArchivesV122;
  for (const mutate of [
    s => { s.lastReturnV160.operationId = 'operation-2-special-archive-relay'; },
    s => { s.lastReturnV160.operationId = [s.lastReturnV160.operationId]; },
    s => { s.lastReturnV160.campaignId = 'pair-001-mire'; },
    s => { s.lastReturnV160.worldId = 'world-01-acheron-lv-426'; },
    s => { s.lastReturnV160.protocolId = 'invented-protocol'; },
    s => { s.lastReturnV160.protocolId = ['technical-audit']; },
    s => { s.lastReturnV160.completedDay = Infinity; },
    s => { s.lastReturnV160.ledger.operationId = 'operation-2-special-archive-relay'; },
    s => { s.case.documentIds.pop(); },
    s => { s.case.verdict = 'clock-failure'; }
  ]) {
    const bad = clone(archive); mutate(bad);
    assert.equal(normalizeArchiveRelayArchiveV122(bad).lastReturnV160, undefined);
  }
  for (const mutate of [r => { r.key = 'morale'; }, r => { r.protocolId = 'crew-prevention'; },
    r => { r.operationId = 'operation-2-special-archive-relay'; }, r => { r.amount = 3; }]) {
    const bad = clone(archive); mutate(bad.lastReturnV160.ledger.receipt);
    assert.equal(normalizeArchiveRelayArchiveV122(bad).lastReturnV160.ledger.receipt, null);
  }
  const extras = clone(archive);
  Object.assign(extras.lastReturnV160, { actor: { x: 100 }, strategy: { serial: 9 }, insertionState: { updatedAt: 123 }, clock: { hour: 18 } });
  extras.lastReturnV160.ledger.readTopics = ['identity', 'identity', 'forged'];
  const normalized = normalizeArchiveRelayArchiveV122(extras).lastReturnV160;
  assert.deepEqual(Object.keys(normalized), Object.keys(archive.lastReturnV160));
  assert.deepEqual(normalized.ledger.readTopics, ['identity']);
});

test('PR15: a QZ-18 report is mounted only in its own displayed campaign plan', () => {
  const save = returnedFixture(); applyCampaignStoryReturnV160(save, campaign, { success: true });
  const { root } = storyDocument();
  assert.ok(mountCampaignDebriefV160(root, { save, campaignId: campaign.id, onReview() {} }));
  assert.ok(root.querySelector('[data-campaign-story-return]'));
  assert.equal(mountCampaignDebriefV160(root, { save, campaignId: 'pair-001-mire', onReview() {} }), null);
  assert.equal(root.querySelector('[data-campaign-story-return]'), null, 'switching campaign removes the unrelated report');
});

test('PR15: the actual app review callback restores focus to the replaced topic on first and repeated reading', () => {
  const values = new Map();
  const system = new SaveSystem({ getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) });
  const save = returnedFixture(); save.strategy.plannedCampaignId = campaign.id;
  applyCampaignStoryReturnV160(save, campaign, { success: true }); system.newGame(1); system.commit(save);
  const { document, root } = storyDocument(), accepted = [], errors = [], resets = [];
  let launch;
  // The plan's unrelated HTML is represented by its launch control. Replacing
  // it really detaches the mounted debrief and invalidates its active element.
  Object.defineProperty(root, 'innerHTML', { set() {
    root.replaceChildren(); resets.push(document.activeElement);
    launch = document.createElement('button'); root.append(launch);
  } });
  const dependencies = { saveSystem: system, clone, preserveCampaignStoryReturnV160,
    CAMPAIGNS: [campaign], WORLDS: [world], WEAPONS: [], EQUIPMENT: [], VEHICLES: [], CREW: [],
    getOperationBrief: () => ({ crewIds: [], ready: true, risk: 0, hours: 0 }),
    resolveCrewDefinitionV85: member => member, getSpecialOperationByCampaignIdV67: () => null,
    isSoloSpecialOperationV131: () => true, getAlphaBravoStrategicRecoveryV69: () => ({ canAbandon: false }),
    APC_CONVOY_CAMPAIGN_V121: { id: 'other-convoy' }, BLACK_COCOON_CAMPAIGN_V121: { id: 'other-cocoon' },
    ARCHIVE_RELAY_CAMPAIGN_V122: campaign, escapeHtml: String, formatCost: () => '',
    byId: id => id === 'operation-plan' ? root : id === 'operation-launch' ? launch : null,
    launchCampaign() {}, abandonBlockedOperationV69() {}, renderCommandMissionsV110() {},
    mountCampaignDebriefV160, recordCampaignStoryReviewV160(candidate, id, topic) {
      const result = recordCampaignStoryReviewV160(candidate, id, topic); accepted.push(result); return result;
    }, toast: message => errors.push(message) };
  // Execute the repository's complete renderer and callback, rather than a
  // mirrored onReview implementation or a source-pattern assertion.
  const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
  const start = app.indexOf('function renderOperationPlan() {');
  const end = app.indexOf('\nfunction procurementActionsV62(', start);
  assert.ok(start >= 0 && end > start);
  const render = new Function(...Object.keys(dependencies), `${app.slice(start, end)}; return renderOperationPlan;`)(...Object.values(dependencies));
  render();
  const protectedBefore = clone({ clock: system.data.clock, galaxy: system.data.galaxy, crew: system.data.crew });
  for (const changed of [true, false]) {
    const previous = root.querySelector('[data-campaign-story-topic="identity"]'); previous.focus();
    assert.equal(document.activeElement, previous); document.focusCalls.length = 0;
    previous.click();
    const replacement = root.querySelector('[data-campaign-story-topic="identity"]');
    assert.notEqual(replacement, previous); assert.equal(document.body.contains(previous), false);
    assert.equal(resets.at(-1), document.body, 'replacement must first invalidate the removed control focus');
    assert.equal(document.activeElement, replacement, 'the accepted callback must focus the newly mounted topic');
    assert.equal(document.body.contains(document.activeElement), true);
    assert.deepEqual(document.focusCalls, [{ node: replacement, options: { preventScroll: true } }]);
    assert.equal(accepted.at(-1).changed, changed);
    assert.equal(replacement.getAttribute('aria-pressed'), 'true'); assert.match(replacement.textContent, /RELU/u);
    assert.equal(root.querySelector('[data-campaign-story-answer]').dataset.campaignStoryAnswer, 'identity');
  }
  assert.deepEqual(errors, []);
  assert.deepEqual({ clock: system.data.clock, galaxy: system.data.galaxy, crew: system.data.crew }, protectedBefore);
});

test('PR15: ordinary insertions retain their actual phase hooks while authored dialogue remains distinct', () => {
  const { root } = storyDocument();
  const ordinary = insertion(); ordinary.campaignId = 'pair-001-mire';
  const ui = new MissionInsertionUiV62({ root, state: ordinary, autoProgress: false });
  assert.match(root.textContent, /LIAISONS OPÉRATIONNELLES/u);
  assert.equal(root.querySelectorAll('[data-hook-channel]').length, ui.state.phases[0].hooks.length);
  const authored = storyDocument(); new MissionInsertionUiV62({ root: authored.root, state: insertion(), autoProgress: false });
  assert.match(authored.root.textContent, /Ramenez les relevés/u);
  assert.equal(authored.root.querySelectorAll('[data-hook-channel]').length, 0);
});

test('PR15: illustrated approach framing follows persisted phase progress through ticks, pause and reload', () => {
  const { root } = storyDocument();
  const state = advance(advance(insertion()));
  const ui = new MissionInsertionUiV62({ root, state, autoProgress: false, now: () => 1000,
    mediaRegistry: { approach: { id: 'registered-approach', src: '/registered-approach.png', type: 'image' } } });
  const frame = () => root.querySelector('.mission-insertion-v62__media');
  ui.setPhaseProgress(0.35);
  assert.equal(Number(frame().style.getPropertyValue('--story-shot-progress')), 0.35);
  const replaced = frame(); ui.tick(250);
  assert.notEqual(frame(), replaced, 'the real renderer recreates the media element');
  const progressed = ui.state.phases[ui.state.currentIndex].progress;
  assert.ok(progressed > 0.35);
  assert.equal(Number(frame().style.getPropertyValue('--story-shot-progress')), progressed);
  ui.pause(); const paused = Number(frame().style.getPropertyValue('--story-shot-progress'));
  ui.tick(1000); assert.equal(Number(frame().style.getPropertyValue('--story-shot-progress')), paused);
  const next = storyDocument(); const restored = new MissionInsertionUiV62({ root: next.root, state: JSON.parse(JSON.stringify(ui.serialize())), autoProgress: false, reducedMotion: true });
  assert.equal(Number(next.root.querySelector('.mission-insertion-v62__media').style.getPropertyValue('--story-shot-progress')), progressed);
  assert.equal(next.root.dataset.reducedMotion, 'true');
  const css = readFileSync(new URL('../mission-insertion-v62.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /@keyframes campaign-story-v160-shot/u);
  assert.match(css, /transform:\s*scale\(calc\(1\s*\+\s*0\.035\s*\*\s*var\(--story-shot-progress/u);
  assert.match(css, /\[data-reduced-motion='true'\][^{]*\{[^}]*transform:\s*none/u);
  assert.equal(restored.state.paused, true);
});
