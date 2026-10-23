import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GameEngine } from '../src/game-production-runtime.js';
import { CAMPAIGNS, WORLDS, WEAPONS, ENEMIES, LEVEL_SEEDS } from '../src/content.js';
import { createDefaultSave, beginOperation, resolveOperation, recordOperationResumeState, migrateSave, SaveSystem } from '../src/save.js';
import { createMissionInsertionV62, applyMissionInsertionActionV62 } from '../src/mission-insertion-v62.js';
import { chooseConvoyStoryProtocolV161, recordCampaignStoryReviewV161 } from '../src/campaign-convoy-story-v161.js';
import { buildApcConvoyLevelV121 } from '../src/apc-convoy-runtime-v121.js';
import { createConvoyReturnHistoryV162, normalizeConvoyReturnHistoryV162,
  preserveConvoyReturnHistoryV162, convoyReturnHistoryV162 } from '../src/campaign-convoy-history-v162.js';
import { mountConvoyReturnHistoryV162 } from '../src/campaign-convoy-history-ui-v162.js';
import { validatePlayerIdentityV84 } from '../src/player-onboarding-v84.js';
import { hostV136 } from './forge-native-host-v136.mjs';

const campaign = CAMPAIGNS.find(value => value.id === 'special-apc-convoy');
const world = WORLDS.find(value => value.id === campaign.worldId);
const clone = value => structuredClone(value);
const withoutHistory = value => { const { convoyReturnHistoryV162, ...rest } = clone(value); return rest; };
function insertion(id) {
  let state = createMissionInsertionV62({ operation: { id, campaignId: campaign.id, worldId: world.id }, campaign, world });
  const advance = () => {
    const result = applyMissionInsertionActionV62(state, state.phases[state.currentIndex].requiredAction, { now: state.updatedAt + 100 });
    assert.equal(result.ok, true); state = result.state;
  };
  advance(); state = chooseConvoyStoryProtocolV161(state, 'route-review').state;
  while (state.status !== 'completed') advance();
  return state;
}
async function nativeReturn({ success = true, identity = false } = {}) {
  const host = hostV136();
  globalThis.Image = class extends EventTarget {
    complete = true; naturalWidth = 0; naturalHeight = 0;
    set src(value) {
      this._src = value; let valid = false;
      try { const bytes = readFileSync(new URL(`..${new URL(value, 'http://qa.invalid').pathname}`, import.meta.url));
        if (bytes.subarray(1, 4).toString() === 'PNG') { this.naturalWidth = bytes.readUInt32BE(16); this.naturalHeight = bytes.readUInt32BE(20); valid = true; } } catch {}
      queueMicrotask(() => { const event = new Event(valid ? 'load' : 'error'); this.dispatchEvent(event); this[`on${event.type}`]?.(event); });
    }
    get src() { return this._src; }
    async decode() { if (!this.naturalWidth) throw new Error('Missing bitmap'); }
  };
  const save = createDefaultSave(), operation = beginOperation(save, campaign, world).operation;
  operation.insertionState = insertion(operation.id);
  if (identity) operation.playerIdentityV84 = validatePlayerIdentityV84({ name: 'Émile Roche', callsign: 'ECHO-42' }).identity;
  const events = [], engine = new GameEngine(host.canvas, { onEvent: event => events.push(event) });
  engine.start({ operationId: operation.id, campaign, world, missionLevel: buildApcConvoyLevelV121({ campaign, world, levelSeeds: LEVEL_SEEDS }),
    weapon: WEAPONS[0], enemyCatalog: ENEMIES, equipment: [], crew: [], seed: 131426 });
  for (let n = 0; n < 80; n++) await Promise.resolve();
  engine.interact(); let cooling = false;
  for (let frame = 0; frame < (success ? 180 * 60 : 120) && engine.mission.state === 'active'; frame++) {
    const convoy = engine.apcConvoyV121, course = engine.apcCourseStateV131;
    if (convoy.heat > 83 || convoy.overheated) cooling = true;
    if (convoy.heat < 33 && !convoy.overheated) cooling = false;
    const target = engine.enemies.find(enemy => enemy.alive && enemy.apcConvoyRoleV121 !== 'horde')
      || engine.enemies.filter(enemy => enemy.alive).sort((a, b) => b.x - a.x)[0];
    const previous = new Set(engine.keys);
    const next = new Set(convoy.phase === 'evacuation' ? ['KeyE'] : ['Space']);
    if (target?.apcLaneV131 < course.lane && !previous.has('KeyW')) next.add('KeyW');
    if (target?.apcLaneV131 > course.lane && !previous.has('KeyS')) next.add('KeyS');
    if (target && !cooling && engine.vehicle.turretAmmo > 0) next.add('KeyF');
    if (engine.vehicle.turretAmmo < 18 && engine.vehicle.turretReserve > 0) next.add('KeyR');
    engine.keys = next; engine.update(1 / 60);
  }
  engine.keys.clear();
  if (success) assert.equal(engine.mission.state, 'complete');
  const terminal = engine.captureResumeState(); assert.equal(recordOperationResumeState(save, terminal), true);
  const outcome = resolveOperation(save, { success, reason: success ? 'objective' : 'retreat',
    ...(success ? { rewards: events.find(event => event.type === 'mission-complete').rewards } : {}) });
  assert.equal(outcome.ok, true); assert.equal(outcome.success, success);
  engine.stop();
  return { save, terminal };
}

let winner;
const winningSave = async () => { winner ||= await nativeReturn({ identity: true }); return clone(winner.save); };

test('history capture requires the exact resolved native deployment, terminal result, and frozen reward receipt', async () => {
  const genuine = await winningSave();
  for (const [label, mutate] of [
    ['bare flag', save => { save.strategy.lastOperation = { id: 'operation-1-special-apc-convoy', campaignId: campaign.id, worldId: world.id, success: true }; }],
    ['no resolved serial', save => { save.strategy.specialOperationResolutionSerialV121 = 0; }],
    ['foreign world', save => { save.strategy.lastOperation.worldId = 'world-elsewhere'; }],
    ['foreign deployment', save => { save.strategy.lastOperation.resumeState.specialOperation.deploymentOperationIdV121 = 'operation-2-special-apc-convoy'; }],
    ['forged payout', save => { save.strategy.lastOperation.missionRewardsV121.credits += 1; }],
    ['no payout receipt', save => { delete save.strategy.lastOperation.missionRewardsV121; }],
    ['dead driver', save => { save.strategy.lastOperation.resumeState.player.alive = false; }],
    ['foreign reading', save => { save.strategy.lastOperation.insertionState.phases.find(phase => phase.kind === 'preparation').payload.convoyReturnV161 = { schema: 161, operationId: 'foreign', readTopics: ['vehicle'] }; }],
    ['foreign operator', save => { save.strategy.lastOperation.playerIdentityV84.id = 'crew-else'; }],
    ['active duplicate', save => { save.strategy.currentOperation = clone(save.strategy.lastOperation); }]
  ]) {
    const save = clone(genuine); save.convoyReturnHistoryV162 = createConvoyReturnHistoryV162(); mutate(save);
    const before = clone(save);
    assert.equal(preserveConvoyReturnHistoryV162(save).changed, false, label); assert.deepEqual(save, before, label);
  }
});

test('native success archives compact facts and already validated readings without any strategic or actor mutation', async () => {
  const save = await winningSave(); save.convoyReturnHistoryV162 = createConvoyReturnHistoryV162();
  const id = save.strategy.lastOperation.id;
  assert.equal(recordCampaignStoryReviewV161(save, id, 'vehicle').ok, true);
  assert.equal(recordCampaignStoryReviewV161(save, id, 'route').ok, true);
  const before = withoutHistory(save);
  assert.equal(preserveConvoyReturnHistoryV162(save).changed, true);
  const entry = save.convoyReturnHistoryV162.entries[0];
  assert.equal(entry.operationId, id); assert.equal(entry.success, true);
  assert.deepEqual(entry.readTopics, ['vehicle', 'route']); assert.equal(entry.activeTopic, 'route');
  assert.equal(entry.operator.id, 'player-echo9'); assert.equal(entry.operator.name, 'Émile Roche');
  assert.equal(entry.protocolId, 'route-review'); assert.equal(entry.summary.crushersCleared, 2);
  assert.equal(entry.summary.returnConfirmed, true); assert.equal(entry.summary.queenDefeated, true);
  assert.equal('resumeState' in entry, false); assert.equal('rewards' in entry, false); assert.equal('enemies' in entry, false);
  assert.deepEqual(withoutHistory(save), before);
  assert.equal(preserveConvoyReturnHistoryV162(save).changed, false);
  recordCampaignStoryReviewV161(save, id, 'return');
  assert.equal(preserveConvoyReturnHistoryV162(save).changed, true);
  assert.deepEqual(save.convoyReturnHistoryV162.entries[0].readTopics, ['vehicle', 'route', 'return']);
  assert.equal(preserveConvoyReturnHistoryV162(save).changed, false);
});

test('a real failed convoy keeps a partial reception and never becomes a recovered M577', async () => {
  const { save } = await nativeReturn({ success: false });
  save.convoyReturnHistoryV162 = createConvoyReturnHistoryV162();
  const before = withoutHistory(save);
  assert.equal(preserveConvoyReturnHistoryV162(save).changed, true);
  const entry = save.convoyReturnHistoryV162.entries[0];
  assert.equal(entry.success, false); assert.equal(entry.summary.returnConfirmed, false);
  assert.ok(entry.summary.distance > 0 && entry.summary.distance < 3200);
  const model = convoyReturnHistoryV162(save)[0];
  assert.match(model.title, /Repli/); assert.match(model.questions[1].answer, /Dernière position reçue/);
  assert.deepEqual(withoutHistory(save), before);
});

test('normalization admits at most eight distinct resolved receipts, rejects bare/foreign entries and strips unrelated payloads', async () => {
  const save = await winningSave(); preserveConvoyReturnHistoryV162(save);
  const source = save.convoyReturnHistoryV162.entries[0];
  // Structural profile fixtures exercise ordering/caps; these are not twelve
  // claimed gameplay runs or new return receipts in a delivered player save.
  const entries = Array.from({ length: 12 }, (_, index) => {
    const entry = clone(source), serial = index + 1;
    entry.operationId = `operation-${serial}-special-apc-convoy`; entry.serial = serial;
    entry.receipt.operationId = entry.operationId; entry.receipt.serial = serial;
    entry.extraActor = { id: 'ignored' }; return entry;
  });
  const normalized = normalizeConvoyReturnHistoryV162({ schema: 162, entries: [...entries, entries[0]] }, { resolvedSerial: 12 });
  assert.deepEqual(normalized.entries.map(entry => entry.serial), [12, 11, 10, 9, 8, 7, 6, 5]);
  assert.equal(normalized.entries.some(entry => 'extraActor' in entry), false);
  const before = clone(normalized); normalized.entries[0].summary.hull = 0; assert.ok(before.entries[0].summary.hull > 0);
  assert.deepEqual(normalizeConvoyReturnHistoryV162({ schema: 162, entries: [{ success: true }] }, { resolvedSerial: 12 }).entries, []);
  for (const mutate of [entry => { entry.worldId = 'foreign'; }, entry => { entry.operator.id = 'crew-else'; },
    entry => { entry.summary.returnConfirmed = false; }, entry => { entry.operator.callsign = 'X'.repeat(17); },
    entry => { entry.summary.distance = Infinity; }, entry => { delete entry.receipt; }]) {
    const entry = clone(source); mutate(entry);
    assert.deepEqual(normalizeConvoyReturnHistoryV162({ schema: 162, entries: [entry] }, { resolvedSerial: 12 }).entries, []);
  }
  assert.deepEqual(normalizeConvoyReturnHistoryV162({ schema: 162, entries: [source] }, { resolvedSerial: 0 }).entries, []);
  const barelyAlive = clone(source); barelyAlive.summary.hull = .1;
  const acceptedLowHull = normalizeConvoyReturnHistoryV162({ schema: 162, entries: [barelyAlive] }, { resolvedSerial: 12 });
  assert.equal(acceptedLowHull.entries[0].summary.hull, .1, 'A genuinely positive hull must not round down into a rejected successful return.');
});

test('archive updates can add readings, never overwrite conflicting native facts or erase an existing reading', async () => {
  const save = await winningSave(); save.convoyReturnHistoryV162 = createConvoyReturnHistoryV162();
  recordCampaignStoryReviewV161(save, save.strategy.lastOperation.id, 'vehicle'); preserveConvoyReturnHistoryV162(save);
  const prep = save.strategy.lastOperation.insertionState.phases.find(phase => phase.kind === 'preparation');
  delete prep.payload.convoyReturnV161;
  assert.equal(preserveConvoyReturnHistoryV162(save).changed, false);
  assert.deepEqual(save.convoyReturnHistoryV162.entries[0].readTopics, ['vehicle']);
  save.convoyReturnHistoryV162.entries[0].summary.hull -= 1;
  const before = clone(save);
  assert.equal(preserveConvoyReturnHistoryV162(save).reason, 'archive-facts-conflict'); assert.deepEqual(save, before);
});

test('native successor operations, SaveSystem import/reload and old V161 migration preserve a bounded read-only convoy archive', async () => {
  const save = await winningSave(); save.convoyReturnHistoryV162 = createConvoyReturnHistoryV162();
  for (const topic of ['vehicle', 'route', 'return']) recordCampaignStoryReviewV161(save, save.strategy.lastOperation.id, topic);
  preserveConvoyReturnHistoryV162(save);
  const expected = clone(save.convoyReturnHistoryV162);
  const other = CAMPAIGNS.find(value => value.id === 'special-c12-horde');
  const { operation } = beginOperation(save, other, world); assert.equal(operation.campaignId, other.id);
  assert.equal(resolveOperation(save, { success: false, reason: 'retreat' }).ok, true);
  assert.equal(save.strategy.lastOperation.campaignId, other.id);
  assert.deepEqual(save.convoyReturnHistoryV162, expected);
  const migrated = migrateSave(JSON.parse(JSON.stringify(save)));
  assert.deepEqual(migrated.convoyReturnHistoryV162, expected);
  const slots = new Map(), storage = { getItem: key => slots.get(key) || null, setItem: (key, value) => slots.set(key, value), removeItem: key => slots.delete(key) };
  const system = new SaveSystem(storage); system.newGame(1); system.commit(migrated);
  const before = withoutHistory(system.data), model = convoyReturnHistoryV162(system.data);
  assert.equal(model.length, 1); assert.deepEqual(model[0].readTopics, ['vehicle', 'route', 'return']);
  model[0].summary.hull = 0; assert.ok(system.data.convoyReturnHistoryV162.entries[0].summary.hull > 0);
  assert.deepEqual(withoutHistory(system.data), before);
  const legacy = await winningSave(); delete legacy.convoyReturnHistoryV162;
  const recovered = migrateSave(JSON.parse(JSON.stringify(legacy)));
  assert.equal(recovered.convoyReturnHistoryV162.entries[0].operationId, legacy.strategy.lastOperation.id);
  assert.deepEqual(recovered.galaxy.resources, legacy.galaxy.resources);
});

function archiveDocument() {
  const doc = {};
  const matches = (node, selector) => {
    const match = /^\[data-([a-z-]+)(?:="([^"]*)")?\]$/.exec(selector);
    if (!match) return false;
    const key = match[1].replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    return node.dataset[key] !== undefined && (match[2] === undefined || node.dataset[key] === match[2]);
  };
  doc.createElement = tag => ({ tagName: tag, ownerDocument: doc, children: [], dataset: {}, attributes: {}, listeners: {},
    append(...children) { children.forEach(child => { child.parentNode = this; this.children.push(child); }); },
    replaceChildren(...children) { this.children = []; this.append(...children); },
    setAttribute(key, value) { this.attributes[key] = value; },
    addEventListener(key, callback) { this.listeners[key] = callback; },
    querySelectorAll(selector) { return this.children.flatMap(child => [...(matches(child, selector) ? [child] : []), ...child.querySelectorAll(selector)]); },
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
    remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(child => child !== this); },
    click() { this.listeners.click?.(); } });
  return doc.createElement('div');
}

test('archive questions change only the displayed answer and never invoke a persistent reading or mission callback', async () => {
  const save = await winningSave(); preserveConvoyReturnHistoryV162(save);
  const before = clone(save), root = archiveDocument();
  const result = mountConvoyReturnHistoryV162(root, { save }); assert.equal(result.entries, 1);
  for (const topic of ['vehicle', 'route', 'return']) {
    root.querySelector(`[data-convoy-history-topic="${topic}"]`).click();
    assert.ok(root.querySelector(`[data-convoy-history-answer="${topic}"]`));
    assert.deepEqual(save, before);
  }
  mountConvoyReturnHistoryV162(root, { save });
  assert.equal(root.querySelectorAll('[data-convoy-return-history]').length, 1);
});
